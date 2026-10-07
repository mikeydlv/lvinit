#!/usr/bin/env node
// ---------------------------------------------------------------------------
// LVINIT MEDIA IMAGE LIBRARY AGENT — one daily run
//
//   node scripts/image-library/run.mjs                 the real run (10 images, commit, push)
//   node scripts/image-library/run.mjs --dry-run       choose and export to a temp folder only
//   node scripts/image-library/run.mjs --no-push       commit locally, don't push
//   node scripts/image-library/run.mjs --help
//
// In order:
//   1. preflight: footage, C:\LVINIT\Images, ffmpeg, API key, a clean worktree
//   2. git: retry any unpushed commit from an earlier run, then follow origin/main
//   3. gaps: which LVINIT topics/articles most need real imagery
//   4. footage: approved (public) clips only, per the Producer's privacy file
//   5. candidates: sample frames, reject locally (blur, exposure, flat, duplicates)
//   6. vision: Claude keeps/rejects each candidate and describes the keepers
//   7. select exactly 10 diverse images (never junk to fill the quota)
//   8. export JPGs → repo public/images/editorial + index → commit → C:\LVINIT\Images → push
//   9. log the run (~/.lvinit/image-library/runs/<date>.md + .json)
//
// Source videos are never moved, modified or renamed. Nothing in
// C:\LVINIT\Images is ever overwritten: files are only added.
// ---------------------------------------------------------------------------

import { existsSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, accessSync, constants, readdirSync, statSync, copyFileSync, appendFileSync, unlinkSync } from "node:fs";
import { join, basename, extname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { loadConfig, hintFor } from "./config.mjs";
import { colorInfo, grabFrame, frameMetrics, localReject, hashHex, nearest, hammingHex, fmtTimestamp, sampleTimes, isHdr } from "./lib/frames.mjs";
import { checkSlug, slugify, placesIn, allowedPlaces, uniqueName } from "./lib/naming.mjs";
import { loadArticles, imageUsage, topicNeeds, matchArticles } from "./lib/gaps.mjs";
import { reviewBatch } from "./lib/vision.mjs";
import { loadIndex, saveIndex, validateIndex, loadState, saveState, markExamined, acquireLock } from "./lib/store.mjs";
import { git, syncToRemote, commitExactly, pushSafely, dirtyPaths } from "./lib/git.mjs";

import { loadConfig as loadProducerConfig } from "../executive-producer/config.mjs";
import { loadPrivacy, classifyFile } from "../executive-producer/lib/privacy.mjs";
import { scanMedia, mediaType } from "../executive-producer/lib/scan.mjs";
import { loadProbeCache, saveProbeCache, probeAll } from "../executive-producer/lib/probe.mjs";
import { describe as describeFile, captureDate } from "../executive-producer/lib/describe.mjs";

const HELP = `
LVINIT Media Image Library Agent — 10 new article-ready images from LVINIT footage

  node scripts/image-library/run.mjs [options]

  --dry-run          Select and export to a temp folder; write nothing else, commit nothing.
  --no-push          Commit in the worktree but don't push.
  --skip-sync        Don't fetch/checkout origin/main first (local testing).
  --count=N          Images per run (default 10).
  --max-vision=N     Cap on frames sent to Claude (default 90).
  --help
`;

export function parseArgs(argv) {
  const a = {};
  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const [k, ...v] = raw.slice(2).split("=");
    a[k] = v.length ? v.join("=") : true;
  }
  return a;
}

/** KEY=value lines into process.env. Values are never logged. */
function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && m[2] && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const laNow = () => new Date().toLocaleString("sv-SE", { timeZone: "America/Los_Angeles" }).replace(" ", "T");
const laDate = () => laNow().slice(0, 10);

function which(bin) {
  try {
    execFileSync(bin, ["-version"], { stdio: "ignore", windowsHide: true });
    return true;
  } catch {
    return false;
  }
}

class Step extends Error {
  constructor(step, message) {
    super(message);
    this.step = step;
  }
}

/** Every basename (no extension, lowercase) already used by an image anywhere we publish. */
function takenNames(config, index) {
  const taken = new Set(index.images.map((i) => basename(i.filename, extname(i.filename)).toLowerCase()));
  const add = (dir) => {
    if (!existsSync(dir)) return;
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      if (ent.isDirectory()) add(join(dir, ent.name));
      else taken.add(basename(ent.name, extname(ent.name)).toLowerCase().replace(/\.(webp|png|jpe?g)$/, ""));
    }
  };
  add(config.libraryDir);
  add(join(config.repo, "public", "images"));
  return taken;
}

/** Hashes of photos that already exist (library folder + site images), cached by path|size|mtime. */
async function existingHashes(sharp, config, state) {
  const out = [];
  const live = new Set();
  const visit = async (dir) => {
    if (!existsSync(dir)) return;
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, ent.name);
      if (ent.isDirectory()) {
        if (!/^(logos|team|maps|covers)$/i.test(ent.name)) await visit(p);
        continue;
      }
      if (!/\.(jpe?g|png|webp)$/i.test(ent.name)) continue;
      const st = statSync(p);
      const key = `${p}|${st.size}|${Math.round(st.mtimeMs)}`;
      live.add(key);
      if (!state.hashCache[key]) {
        try {
          state.hashCache[key] = await hashHex(sharp, readFileSync(p));
        } catch {
          continue;
        }
      }
      out.push(state.hashCache[key]);
    }
  };
  await visit(config.libraryDir);
  await visit(join(config.repo, "public", "images"));
  for (const k of Object.keys(state.hashCache)) if (!live.has(k)) delete state.hashCache[k];
  return out;
}

/** Approved, sample-worthy footage with probe facts. */
async function footageInventory(config, report) {
  const pc = loadProducerConfig({ media: { ...loadProducerConfig().media, root: config.mediaRoot } });
  const { privacy, created } = loadPrivacy(pc);
  if (created) throw new Step("footage", `The privacy file ${pc.privacy.file} does not exist, so no footage is approved. Run the Footage Cataloger first.`);
  const { files } = scanMedia(pc, privacy);
  const videos = files.filter((f) => mediaType(f.ext, pc) === "video");
  const cache = existsSync(config.probeCache) ? loadProbeCache(config.probeCache) : loadProbeCache(config.producerProbeCache);
  const classified = videos.map((f) => ({ f, c: classifyFile(f.rel, privacy, pc) }));
  const pending = new Map();
  for (const { f, c } of classified) if (c.status === "local-only" && c.pendingFolder) pending.set(c.pendingFolder, (pending.get(c.pendingFolder) ?? 0) + 1);
  report.pendingFolders = [...pending.entries()].map(([folder, n]) => ({ folder, videos: n }));
  const pub = classified.filter(({ f, c }) => c.status === "public" && !config.skipFolder.test(f.rel.split("/").slice(0, -1).join("/")) && !config.skipFile.test(basename(f.rel)));
  const { results } = await probeAll(pub.map((x) => x.f), { ffprobe: "ffprobe", cache });
  saveProbeCache(config.probeCache, cache);
  const clips = [];
  for (const { f, c } of pub) {
    const p = results.get(f.rel);
    if (!p || p.error || !p.durationSec || !p.width || !p.height) continue;
    const d = describeFile(f, p, c, pc);
    if (["a-roll", "short"].includes(d.role)) continue;
    const long = Math.max(p.width, p.height);
    if (long < config.frames.minSourceWidth || Math.min(p.width, p.height) < 720) continue;
    if (p.durationSec < 2.5) continue;
    clips.push({ rel: f.rel, abs: f.abs, folder: f.rel.split("/").slice(0, -1).join("/"), name: basename(f.rel), width: p.width, height: p.height, portrait: p.height > p.width, durationSec: p.durationSec, role: d.role, camera: d.camera, footageDate: captureDate({ creationTime: p.creationTime, name: basename(f.rel), mtimeMs: f.mtimeMs }) });
  }
  report.videosApproved = clips.length;
  return clips;
}

/** Rank clips by how much the library needs what they likely show, and how fresh they are. */
export function rankClips(clips, { priorities, index, state, day }) {
  const pr = Object.fromEntries(priorities.map((p) => [p.topic, p.priority]));
  const perClip = {};
  const perFolder = {};
  for (const img of index.images) {
    perClip[img.sourceVideo] = (perClip[img.sourceVideo] ?? 0) + 1;
    const folder = String(img.sourceVideo).split("/").slice(0, -1).join("/");
    perFolder[folder] = (perFolder[folder] ?? 0) + 1;
  }
  const jitter = (s) => {
    let h = 2166136261;
    for (const ch of `${day}|${s}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
    return ((h >>> 0) % 1000) / 1000;
  };
  return clips
    .map((c) => {
      const topics = hintFor(c.rel).topics;
      const vals = topics.map((t) => pr[t] ?? 1).sort((a, b) => b - a);
      const need = (vals[0] ?? 1) + 0.3 * vals.slice(1).reduce((s, v) => s + v, 0);
      const examined = state.examined[c.rel]?.length ?? 0;
      const capacity = Math.max(1, c.durationSec / 6);
      const exhaustion = Math.max(0.05, 1 - examined / (capacity * 1.5));
      const novelty = (1 / (1 + 0.8 * (perClip[c.rel] ?? 0))) * (1 / (1 + 0.25 * (perFolder[c.folder] ?? 0)));
      const source = (c.rel.startsWith("Media/") ? 1.25 : 0.8) * (c.portrait ? 0.5 : 1) * (/dji|drone/i.test(c.rel) || c.camera === "dji" ? 1.15 : 1);
      return { ...c, topics, score: need * novelty * exhaustion * source * (0.85 + 0.3 * jitter(c.rel)) };
    })
    .sort((a, b) => b.score - a.score);
}

/** Pick `target` images: best first, one per clip, a few per place, few portraits, all visually distinct. */
export function selectFinal(pool, target, sel) {
  const sorted = [...pool].sort((a, b) => b.score - a.score);
  for (const relax of [0, 1]) {
    const picked = [];
    const perClip = {};
    const perPlace = {};
    let portraits = 0;
    for (const c of sorted) {
      if (picked.length >= target) break;
      const place = c.review.location || c.hint.place || "unplaced";
      if ((perClip[c.clip.rel] ?? 0) >= sel.maxPerClip + relax) continue;
      if ((perPlace[place] ?? 0) >= sel.maxPerPlace + relax) continue;
      if (c.clip.portrait && portraits >= sel.maxPortrait) continue;
      if (picked.some((p) => hammingHex(p.hash, c.hash) <= 14)) continue;
      picked.push(c);
      perClip[c.clip.rel] = (perClip[c.clip.rel] ?? 0) + 1;
      perPlace[place] = (perPlace[place] ?? 0) + 1;
      if (c.clip.portrait) portraits++;
    }
    if (picked.length >= target) return picked;
    if (relax === 1) return picked;
  }
  return [];
}

/** Repair or reject Claude's filename/location against the evidence. Returns null if unusable. */
export function settleNaming(review, hint) {
  const evidence = { place: hint.place, signage: review.signageText ?? [] };
  let location = review.location?.trim() ?? "";
  if (review.locationEvidence === "folder" && !hint.place) location = "";
  if (review.locationEvidence === "none") location = "";
  if (location) {
    const allowed = allowedPlaces(evidence);
    const unproven = placesIn(slugify(location)).filter((p) => !allowed.has(p));
    if (unproven.length && review.locationEvidence !== "landmark") location = hint.place ?? "";
  }
  let check = checkSlug(review.filename, evidence);
  if (!check.ok && check.problems.every((p) => p.startsWith("unproven place"))) {
    const allowed = allowedPlaces(evidence);
    const stripped = check.slug
      .split("-")
      .join("-")
      .replace(new RegExp(`(^|-)(${placesIn(check.slug).filter((p) => !allowed.has(p)).join("|")})(?=-|$)`, "g"), "")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");
    check = checkSlug(stripped, evidence);
  }
  if (!check.ok) return { error: `filename rejected (${check.problems.join("; ")})` };
  return { slug: check.slug, location };
}

function ratio(w, h) {
  const g = (a, b) => (b ? g(b, a % b) : a);
  const d = g(w, h);
  const known = [[16, 9], [4, 3], [3, 2], [1, 1], [9, 16], [3, 4], [2, 3]];
  const r = w / h;
  const near = known.find(([a, b]) => Math.abs(a / b - r) < 0.01);
  return near ? `${near[0]}:${near[1]}` : `${w / d}:${h / d}`;
}

export async function run(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    console.log(HELP);
    return 0;
  }
  const config = loadConfig({ ...(args.count ? { target: Number(args.count) } : {}) });
  if (args["max-vision"]) config.selection.maxVisionImages = Number(args["max-vision"]);
  loadEnv(config.envFile);
  const dry = Boolean(args["dry-run"]);
  const startedAt = new Date().toISOString();
  const runId = `${laDate()}-${laNow().slice(11, 16).replace(":", "")}`;
  const report = {
    runId,
    startedAt,
    startedAtPacific: laNow(),
    mode: dry ? "dry-run" : args["no-push"] ? "no-push" : "production",
    status: "running",
    target: config.target,
    repo: config.repo,
    videosApproved: 0,
    videosScanned: [],
    candidatesExamined: 0,
    rejectedLocal: 0,
    rejectedVision: 0,
    rejectionReasons: {},
    visionFrames: 0,
    costUsd: 0,
    tokens: { input: 0, output: 0 },
    priorities: [],
    pendingFolders: [],
    selected: [],
    commit: null,
    push: null,
    warnings: [],
    errors: [],
  };
  const reason = (r) => (report.rejectionReasons[r] = (report.rejectionReasons[r] ?? 0) + 1);
  mkdirSync(config.runsDir, { recursive: true });
  const log = (m) => {
    const line = `${laNow()} ${m}`;
    console.log(line);
    try {
      appendFileSync(config.log, line + "\n");
    } catch {}
  };
  let release = () => {};
  const tmp = mkdtempSync(join(tmpdir(), "lvinit-image-library-"));
  let state = null;
  let created = []; // repo files this run wrote (for cleanup if the commit fails)
  let committed = false;
  try {
    release = acquireLock(config);
    log(`start ${report.mode} run ${runId} (repo ${config.repo})`);

    // 1. preflight
    if (!existsSync(config.mediaRoot)) throw new Step("preflight", `Footage root ${config.mediaRoot} is missing.`);
    if (!existsSync(config.libraryDir)) throw new Step("preflight", `Output folder ${config.libraryDir} is missing.`);
    try {
      accessSync(config.libraryDir, constants.W_OK);
    } catch {
      throw new Step("preflight", `Output folder ${config.libraryDir} is not writable.`);
    }
    if (!which("ffmpeg") || !which("ffprobe")) throw new Step("preflight", "ffmpeg/ffprobe are not on PATH.");
    if (!process.env.ANTHROPIC_API_KEY) throw new Step("preflight", `No ANTHROPIC_API_KEY (looked in ${config.envFile}); frames can't be reviewed.`);
    if (!existsSync(join(config.repo, ".git"))) throw new Step("preflight", `${config.repo} is not a git checkout.`);
    const { default: sharp } = await import("sharp");

    // 2. git
    if (!dry && !args["skip-sync"]) {
      let s = syncToRemote(config.repo, config.git);
      if (!s.synced) {
        log(`found ${s.pending.length} unpushed commit(s) from an earlier run; pushing them first`);
        const p = config.git.push ? pushSafely(config.repo, config.git) : { pushed: false, error: "push disabled" };
        if (!p.pushed) throw new Step("git", `An earlier image commit is still unpushed and pushing it failed: ${p.error}`);
        report.warnings.push(`Pushed an earlier run's unpushed image commit ${p.commit.slice(0, 7)} first.`);
        s = syncToRemote(config.repo, config.git);
      }
      log(`worktree at origin/main ${s.head}`);
    } else if (!dry) {
      const dirty = dirtyPaths(config.repo);
      if (dirty.length) throw new Step("git", `Worktree has unexpected changes: ${dirty.slice(0, 5).join(", ")}`);
    }

    // 3. gaps
    state = loadState(config);
    const index = loadIndex(config);
    const articles = loadArticles(config.repo);
    const usage = imageUsage(config.repo);
    const mapFile = join(config.repo, "docs", "LVINIT_CONTENT_CLUSTER_MAP.md");
    const mapText = existsSync(mapFile) ? readFileSync(mapFile, "utf8") : "";
    const priorities = topicNeeds({ articles, usage, library: index.images, mapText });
    report.priorities = priorities.slice(0, 10).map(({ topic, priority, articles: a, weak, library }) => ({ topic, priority, articles: a, weak, library }));
    log(`articles ${articles.length}; top needs: ${priorities.slice(0, 6).map((p) => `${p.topic} ${p.priority}`).join(", ")}`);

    // Backfill GitHub status and current site usage for existing records.
    for (const img of index.images) {
      if (!img.github?.commit) {
        const h = git(config.repo, ["log", "-1", "--format=%H", `${config.git.remote}/${config.git.branch}`, "--", img.repoPath], { allowFail: true });
        if (h) img.github = { status: "pushed", commit: h };
      }
      img.usedOn = [...usageFiles(config.repo, img.webPath)];
    }

    // 4. footage
    const clips = await footageInventory(config, report);
    if (!clips.length) throw new Step("footage", "No approved footage is available to sample.");
    log(`approved clips ${clips.length}; folders awaiting Mikey's privacy approval: ${report.pendingFolders.length}`);
    const known = [...index.images.map((i) => i.hash), ...(await existingHashes(sharp, config, state))];
    const ranked = rankClips(clips, { priorities, index, state, day: laDate() });

    // 5–6. candidates + vision, round by round until there is enough to choose from
    const pool = [];
    const tried = new Set();
    const runHashes = [];
    let visionLeft = config.selection.maxVisionImages;
    for (let round = 0; round < config.selection.maxRounds && pool.length < config.target * 1.6 && visionLeft > 0; round++) {
      const perFolder = {};
      const batchClips = [];
      for (const c of ranked) {
        if (batchClips.length >= config.selection.clipsPerRound) break;
        if (tried.has(c.rel) || (perFolder[c.folder] ?? 0) >= 2) continue;
        tried.add(c.rel);
        perFolder[c.folder] = (perFolder[c.folder] ?? 0) + 1;
        batchClips.push(c);
      }
      if (!batchClips.length) break;
      const candidates = [];
      for (const clip of batchClips) {
        let info;
        try {
          info = await colorInfo(clip.abs);
        } catch (e) {
          report.warnings.push(`ffprobe failed on ${clip.rel}: ${e.message.slice(0, 120)}`);
          continue;
        }
        const examinedT = (state.examined[clip.rel] ?? []).map((e) => e.t);
        const acceptedT = (state.examined[clip.rel] ?? []).filter((e) => e.result === "accepted").map((e) => e.t);
        const times = sampleTimes(clip.durationSec, examinedT, { min: config.frames.perClipSamples[0], max: config.frames.perClipSamples[1], gap: config.frames.examinedGap, pass: examinedT.length }).filter((t) => !acceptedT.some((a) => Math.abs(a - t) < config.frames.acceptedGap));
        report.videosScanned.push({ video: clip.rel, durationSec: clip.durationSec, samples: times.length, hdr: isHdr(info) });
        const local = [];
        for (const t of times) {
          report.candidatesExamined++;
          let buf;
          try {
            buf = await grabFrame(clip.abs, t, { width: 640, info });
          } catch (e) {
            markExamined(state, clip.rel, t, "error", "ffmpeg");
            reason("frame extraction failed");
            continue;
          }
          const m = await frameMetrics(sharp, buf);
          const bad = localReject(m, config.quality);
          if (bad) {
            markExamined(state, clip.rel, t, "rejected-local", bad);
            report.rejectedLocal++;
            reason(bad);
            continue;
          }
          const h = await hashHex(sharp, buf);
          if (nearest(h, [...known, ...runHashes]) <= config.quality.nearDupBits) {
            markExamined(state, clip.rel, t, "rejected-local", "near-duplicate");
            report.rejectedLocal++;
            reason("near-duplicate of an existing image");
            continue;
          }
          local.push({ t, m, h });
        }
        // Up to two visually distinct frames per clip, sharpest first; refine each to the sharpest nearby frame.
        local.sort((a, b) => b.m.sharpness - a.m.sharpness);
        const keep = [];
        for (const c of local) {
          if (keep.length >= 2) break;
          if (keep.some((k) => hammingHex(k.h, c.h) <= 16)) {
            markExamined(state, clip.rel, c.t, "rejected-local", "same scene as a sharper frame");
            reason("same scene as a sharper nearby frame");
            continue;
          }
          keep.push(c);
        }
        for (const k of keep) {
          for (const dt of [-0.33, 0.33]) {
            const t2 = Math.round((k.t + dt) * 100) / 100;
            if (t2 <= 0.3 || t2 >= clip.durationSec - 0.3) continue;
            try {
              const b2 = await grabFrame(clip.abs, t2, { width: 640, info });
              const m2 = await frameMetrics(sharp, b2);
              if (m2.sharpness > k.m.sharpness * 1.08 && !localReject(m2, config.quality)) Object.assign(k, { t: t2, m: m2, h: await hashHex(sharp, b2) });
            } catch {}
          }
          runHashes.push(k.h);
          candidates.push({ clip, info, ...k });
        }
      }
      // Vision in batches.
      const toReview = candidates.slice(0, visionLeft);
      for (const c of candidates.slice(visionLeft)) markExamined(state, c.clip.rel, c.t, "skipped", "vision budget");
      for (let i = 0; i < toReview.length; i += config.selection.batchSize) {
        const batch = toReview.slice(i, i + config.selection.batchSize);
        for (const [j, c] of batch.entries()) {
          const png = await grabFrame(c.clip.abs, c.t, { width: config.vision.reviewWidth, info: c.info });
          c.reviewPath = join(tmp, `review-${round}-${i + j}.jpg`);
          await sharp(png).jpeg({ quality: 80 }).toFile(c.reviewPath);
        }
        let res;
        try {
          res = await reviewBatch(
            batch.map((c) => ({ reviewPath: c.reviewPath, sourceRel: c.clip.rel, folderPlace: hintFor(c.clip.rel).place, timestamp: fmtTimestamp(c.t) })),
            { config, articles, priorities },
          );
        } catch (e) {
          report.costUsd += e.usd ?? 0;
          report.warnings.push(`vision batch failed: ${String(e.message).slice(0, 160)}`);
          if (/authentication|401|credit|billing/i.test(String(e.message))) throw new Step("vision", `Claude review failed: ${e.message}`);
          continue;
        }
        visionLeft -= batch.length;
        report.visionFrames += batch.length;
        report.costUsd += res.usd;
        report.tokens.input += res.usage?.input_tokens ?? 0;
        report.tokens.output += res.usage?.output_tokens ?? 0;
        for (const [j, c] of batch.entries()) {
          const r = res.frames.find((f) => f.n === j);
          if (!r) {
            reason("no vision verdict");
            continue;
          }
          const hint = hintFor(c.clip.rel);
          let why = null;
          if (!r.keep) why = r.rejectReasons?.[0] ?? "rejected by photo review";
          else if (r.privacyIssues?.length) why = `privacy: ${r.privacyIssues[0]}`;
          else if (r.quality < 6) why = "photo quality below article standard";
          else if (r.articleValue < 5) why = "low article value";
          let naming = null;
          if (!why) {
            naming = settleNaming(r, hint);
            if (naming.error) why = naming.error;
          }
          if (why) {
            markExamined(state, c.clip.rel, c.t, "rejected-vision", why);
            report.rejectedVision++;
            reason(why.length > 70 ? why.slice(0, 70) + "…" : why);
            continue;
          }
          const topicBonus = Math.max(0, ...r.topics.map((t) => priorities.find((p) => p.topic === t)?.priority ?? 0));
          pool.push({ clip: c.clip, info: c.info, t: c.t, m: c.m, hash: c.h, hint, review: { ...r, location: naming.location }, slug: naming.slug, score: r.quality + r.articleValue + Math.min(4, topicBonus) });
        }
      }
      log(`round ${round + 1}: ${batchClips.length} clips, ${candidates.length} candidates, pool ${pool.length}`);
    }

    // 7. select
    const picked = selectFinal(pool, config.target, config.selection);
    if (picked.length < config.target) {
      throw new Step("select", `Only ${picked.length} genuinely usable, distinct images were found (pool ${pool.length}, ${report.candidatesExamined} frames examined, ${report.visionFrames} reviewed). Not filling the quota with weaker frames; nothing was saved or committed.`);
    }

    // 8. export
    const taken = takenNames(config, index);
    const outDir = join(tmp, "export");
    mkdirSync(outDir, { recursive: true });
    const records = [];
    for (const p of picked) {
      const name = uniqueName(p.slug, taken);
      taken.add(name);
      const filename = `${name}.jpg`;
      // Source resolution, then down to a 1920px long edge (never up).
      const png = await grabFrame(p.clip.abs, p.t, { info: p.info });
      const L = config.frames.maxLongEdge;
      let q = config.frames.jpegQuality;
      let jpg;
      do {
        jpg = await sharp(png).resize({ width: L, height: L, fit: "inside", withoutEnlargement: true }).jpeg({ quality: q, mozjpeg: true, chromaSubsampling: "4:2:0" }).toBuffer();
        q -= 6;
      } while (jpg.length > config.frames.maxBytes && q >= 64);
      const meta = await sharp(jpg).metadata();
      if (!meta.width || !meta.height || meta.format !== "jpeg") throw new Step("export", `Exported ${filename} failed validation.`);
      const finalM = await frameMetrics(sharp, jpg);
      if (localReject(finalM, config.quality)) throw new Step("export", `Full-size ${filename} failed the quality check (${localReject(finalM, config.quality)}).`);
      writeFileSync(join(outDir, filename), jpg);
      const r = p.review;
      const matches = (r.existingArticleSlugs ?? []).map((s) => articles.find((a) => a.slug === s)).filter(Boolean).map((a) => ({ slug: a.slug, title: a.title, href: a.href }));
      records.push({
        filename,
        localPath: join(config.libraryDir, filename),
        repoPath: `${config.webDir}/${filename}`,
        webPath: `${config.webBase}${filename}`,
        sourceVideo: p.clip.rel,
        sourceVideoPath: p.clip.abs,
        timestamp: fmtTimestamp(p.t),
        timestampSec: p.t,
        captureDate: laDate(),
        footageDate: p.clip.footageDate?.date ?? null,
        footageDateSource: p.clip.footageDate?.source ?? null,
        location: r.location || null,
        locationEvidence: r.location ? r.locationEvidence : "none",
        subject: r.subject,
        category: r.category,
        description: r.description,
        altText: r.altText,
        topics: r.topics,
        keywords: r.keywords,
        possibleArticleUses: r.possibleArticleUses,
        existingArticleMatches: matches.length ? matches : matchArticles(r.topics, articles, 4),
        orientation: meta.width >= meta.height ? "landscape" : "portrait",
        aspectRatio: ratio(meta.width, meta.height),
        width: meta.width,
        height: meta.height,
        bytes: jpg.length,
        hash: await hashHex(sharp, jpg),
        quality: { photo: r.quality, articleValue: r.articleValue, sharpness: p.m.sharpness, hdrSource: isHdr(p.info) },
        usedOn: [],
        github: { status: dry ? "dry-run" : "committed", commit: null },
        addedAt: new Date().toISOString(),
        runId,
      });
    }
    report.selected = records.map((r) => ({ filename: r.filename, sourceVideo: r.sourceVideo, timestamp: r.timestamp, location: r.location, topics: r.topics, category: r.category, localPath: r.localPath, repoPath: r.repoPath, bytes: r.bytes, size: `${r.width}x${r.height}` }));

    if (dry) {
      const keepDir = join(config.home, "dry-run", runId);
      mkdirSync(keepDir, { recursive: true });
      for (const r of records) copyFileSync(join(outDir, r.filename), join(keepDir, r.filename));
      writeFileSync(join(keepDir, "records.json"), JSON.stringify(records, null, 2));
      report.status = "dry-run";
      report.dryRunDir = keepDir;
      log(`dry run: ${records.length} images in ${keepDir}`);
      return finish(config, report, log, 0);
    }

    // Repo files first; commit; only then add to C:\LVINIT\Images; then push.
    mkdirSync(join(config.repo, config.webDir), { recursive: true });
    for (const r of records) {
      const dest = join(config.repo, r.repoPath);
      if (existsSync(dest)) throw new Step("export", `${r.repoPath} already exists; refusing to overwrite.`);
      copyFileSync(join(outDir, r.filename), dest);
      created.push(dest);
    }
    index.images.push(...records);
    index.updatedAt = new Date().toISOString();
    saveIndex(config, index);
    const problems = validateIndex(config, index);
    if (problems.length) throw new Step("index", `Index validation failed: ${problems.slice(0, 5).join("; ")}`);
    const paths = [...records.map((r) => r.repoPath), config.index];
    const message = `content: add ${records.length} LVINIT editorial images\n\nFrom LVINIT footage (run ${runId}):\n${records.map((r) => `- ${r.filename} (${r.sourceVideo} @ ${r.timestamp})`).join("\n")}\n\nIndex: ${config.index}`;
    const c = commitExactly(config.repo, paths, message, config.git);
    committed = true;
    report.commit = c.commit;
    log(`committed ${c.commit.slice(0, 7)} (${c.files.length} files)`);

    for (const r of records) {
      // 'wx' semantics: never overwrite anything already in the library folder.
      if (existsSync(r.localPath)) throw new Step("library", `${r.localPath} appeared during the run; not overwriting it.`);
      copyFileSync(join(outDir, r.filename), r.localPath);
    }
    for (const p of picked) markExamined(state, p.clip.rel, p.t, "accepted");

    if (config.git.push && !args["no-push"]) {
      const res = pushSafely(config.repo, config.git);
      report.push = res;
      if (!res.pushed) throw new Step("push", `${res.error} The commit stays in the worktree and is retried on the next run.`);
      report.commit = res.commit;
      log(`pushed ${res.commit.slice(0, 7)} to ${config.git.remote}/${config.git.branch}`);
      for (const r of records) r.github = { status: "pushed", commit: res.commit };
    } else {
      report.push = { pushed: false, error: "push disabled for this run" };
    }
    writeMirror(config, index);
    report.status = "success";
    return finish(config, report, log, 0);
  } catch (e) {
    report.status = "failed";
    report.failedStep = e.step ?? "unexpected";
    report.errors.push(String(e.message ?? e));
    log(`FAILED at ${report.failedStep}: ${e.message}`);
    // Undo repo writes that never made it into a commit (our own new files only).
    if (!committed && created.length) {
      for (const f of created) {
        try {
          unlinkSync(f);
        } catch {}
      }
      // Tracked index → restore it; an index first created by this run → remove it.
      const status = git(config.repo, ["status", "--porcelain", "--", config.index], { allowFail: true });
      if (status?.startsWith("??")) rmSync(join(config.repo, config.index), { force: true });
      else if (status) git(config.repo, ["checkout", "--", config.index], { allowFail: true });
    }
    return finish(config, report, log, 1);
  } finally {
    if (state && !dry) {
      state.runs.push({ runId, status: report.status, selected: report.selected.length, commit: report.commit });
      saveState(config, state);
    }
    rmSync(tmp, { recursive: true, force: true });
    release();
  }
}

function* usageFiles(repo, webPath) {
  if (!webPath) return;
  for (const dir of ["app", "lib", "components"]) {
    const walk = function* (d) {
      if (!existsSync(d)) return;
      for (const ent of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, ent.name);
        if (ent.isDirectory()) yield* walk(p);
        else if (/\.(tsx?|jsx?|mdx?)$/.test(ent.name) && readFileSync(p, "utf8").includes(webPath)) yield p.slice(repo.length + 1).replace(/\\/g, "/");
      }
    };
    yield* walk(join(repo, dir));
  }
}

function writeMirror(config, index) {
  try {
    mkdirSync(resolve(config.indexMirror, ".."), { recursive: true });
    writeFileSync(config.indexMirror, JSON.stringify({ ...index, note: `READ-ONLY MIRROR. The source of truth is ${config.index} in the LVINIT repo.` }, null, 2) + "\n");
  } catch (e) {
    console.warn(`index mirror not written: ${e.message}`);
  }
}

function finish(config, report, log, code) {
  report.finishedAt = new Date().toISOString();
  report.costUsd = Math.round(report.costUsd * 10000) / 10000;
  const base = join(config.runsDir, report.runId);
  writeFileSync(`${base}.json`, JSON.stringify(report, null, 2));
  writeFileSync(`${base}.md`, renderReport(report));
  log(`${report.status.toUpperCase()}: ${report.selected.length} images; ${report.candidatesExamined} frames examined; ${report.rejectedLocal} rejected locally, ${report.rejectedVision} by review; cost $${report.costUsd}. Log: ${base}.md`);
  return code;
}

export function renderReport(r) {
  const lines = [
    `# LVINIT Media Image Library — run ${r.runId}`,
    "",
    `- **Status:** ${r.status.toUpperCase()}${r.failedStep ? ` (failed at ${r.failedStep})` : ""}`,
    `- **Started:** ${r.startedAtPacific} Pacific · mode ${r.mode}`,
    `- **Videos scanned:** ${r.videosScanned.length} of ${r.videosApproved} approved clips`,
    `- **Candidate frames examined:** ${r.candidatesExamined} · rejected locally ${r.rejectedLocal} · sent to review ${r.visionFrames} · rejected in review ${r.rejectedVision}`,
    `- **Commit:** ${r.commit ?? "none"} · **Push:** ${r.push ? (r.push.pushed ? "pushed" : `not pushed (${r.push.error})`) : "n/a"}`,
    `- **Vision cost:** $${r.costUsd} (${r.tokens.input} in / ${r.tokens.output} out tokens)`,
    "",
  ];
  if (r.errors.length) lines.push("## Errors", "", ...r.errors.map((e) => `- ${e}`), "");
  if (r.warnings.length) lines.push("## Warnings", "", ...r.warnings.map((e) => `- ${e}`), "");
  if (r.selected.length) {
    lines.push("## Selected", "", "| # | File | Source @ time | Location | Topics |", "|---|---|---|---|---|");
    r.selected.forEach((s, i) => lines.push(`| ${i + 1} | ${s.filename} | ${s.sourceVideo} @ ${s.timestamp} | ${s.location ?? "—"} | ${s.topics.join(", ")} |`));
    lines.push("", "Local: `" + (r.selected[0]?.localPath ?? "").replace(/[^\\/]+$/, "") + "` · Repo: `" + (r.selected[0]?.repoPath ?? "").replace(/[^/]+$/, "") + "`", "");
  }
  lines.push("## Rejection reasons", "", ...Object.entries(r.rejectionReasons).sort((a, b) => b[1] - a[1]).map(([k, v]) => `- ${v} × ${k}`), "");
  lines.push("## Topic needs (top 10)", "", ...r.priorities.map((p) => `- ${p.topic}: priority ${p.priority} (articles ${p.articles}, weak imagery ${p.weak}, library ${p.library})`), "");
  if (r.pendingFolders.length) lines.push("## Footage folders not yet approved (never sampled)", "", ...r.pendingFolders.map((p) => `- ${p.folder} (${p.videos} videos)`), "");
  lines.push("## Videos scanned", "", ...r.videosScanned.map((v) => `- ${v.video} (${v.durationSec}s, ${v.samples} samples${v.hdr ? ", HDR→SDR" : ""})`), "");
  return lines.join("\n");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().then((code) => process.exit(code));
}
