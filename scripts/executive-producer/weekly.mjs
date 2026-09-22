#!/usr/bin/env node
// ---------------------------------------------------------------------------
// LVINIT EXECUTIVE PRODUCER — MONDAY RUN (Mikey's PC, Windows Task Scheduler)
//
//   node scripts/executive-producer/weekly.mjs              this week (Mon–Sun, Pacific)
//   node scripts/executive-producer/weekly.mjs --force      rebuild a week that already finished
//   node scripts/executive-producer/weekly.mjs --plan=FILE  REHEARSAL ONLY: use a prepared plan
//
// Unattended chain, each step timed and costed in run.json:
//   1. ledger    refresh Mikey's recent posts (Instagram/TikTok via Apify,
//                YouTube from his public channel), mark matching drafts as
//                published, build draft/approved/scheduled/published history
//   2. research  other creators on Instagram + TikTok (Apify)
//   3. plan      7 posts + 3 backups (Claude, text only)
//   4. verify    local gate (duplicates, superlatives, comparisons, money/law,
//                generic, distinct takeaways) + Claude claim-by-claim check;
//                one automatic revision; still failing → backup
//   5. frames    candidates from approved footage, scored locally (sharpness,
//                text band, no repeats); Claude picks from low-res candidates unless LVINIT_VISION_FRAMES=off
//   6. render    slides / reel
//   7. review    local readability + repeated-image checks, then Claude looks at
//                every finished post; fixes (text position, new frame) are
//                applied and re-checked once; what remains is an exception with
//                a recommended resolution
//   8. package   week.json, status.json (all drafts), preview.html, ZIP
//   9. notify    email (Resend) + Windows notification, success or failure
//
// One batch per week (DONE marker + lock). Drafts only; nothing is published.
// Credentials: ~/.lvinit/executive-producer/.env, never printed.
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, statSync, mkdtempSync, readdirSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { homedir, tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const HOME = join(homedir(), ".lvinit", "executive-producer");
const DEFAULT_YOUTUBE = "UChMtjruOgmhDJl3efLv8_wA";

function parseArgs(argv) {
  const a = {};
  for (const r of argv) if (r.startsWith("--")) {
    const [k, ...v] = r.slice(2).split("=");
    a[k] = v.length ? v.join("=") : true;
  }
  return a;
}

/** KEY=value lines into process.env. Values are never logged. */
export function loadEnv(file) {
  if (!existsSync(file)) return [];
  const keys = [];
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || !m[2]) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    keys.push(m[1]);
  }
  return keys;
}

/** Monday of the current week in Las Vegas time. */
export function mondayOf(now = new Date()) {
  const la = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  const d = new Date(Date.UTC(la.getFullYear(), la.getMonth(), la.getDate()));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export async function runWeek(argv = process.argv.slice(2), { log = console.log, now = new Date(), services = {} } = {}) {
  const args = parseArgs(argv);
  const envKeys = args["no-env"] ? [] : loadEnv(join(HOME, ".env"));
  const env = services.env ?? process.env;
  const weekOf = args.week ?? mondayOf(now);
  const outRoot = args.out ?? join(homedir(), "OneDrive", "Documents", "LVINIT", "Weekly Posts");
  const mediaRoot = args["media-root"] ?? "C:\\LVINIT";
  const catalogPath = args.catalog ?? join(REPO, "data", "executive-producer", "footage-catalog.json");
  const folderName = `Week of ${weekOf}${args.suffix ? ` ${args.suffix}` : ""}`;
  const weekDir = join(outRoot, folderName);
  const done = join(weekDir, "DONE.json");
  const lock = join(weekDir, ".run.lock");
  const hasClaude = Boolean(env.ANTHROPIC_API_KEY || services.anthropic);
  const hasApify = Boolean(env.APIFY_TOKEN);
  const report = {
    weekOf,
    startedAt: new Date().toISOString(),
    steps: [],
    costs: { apify: {}, anthropic: {}, apifyUsd: 0, anthropicUsd: 0, totalUsd: 0 },
    tokens: {},
    manual: [], // anything a person (or a live session) had to supply
    notConfigured: [], // automatic steps skipped for missing credentials
    gaps: [],
    exceptions: [],
    credentialsPresent: envKeys,
  };
  const addCost = (service, step, usd, usage) => {
    report.costs[service][step] = Math.round(((report.costs[service][step] ?? 0) + (usd ?? 0)) * 10000) / 10000;
    report.costs[`${service}Usd`] = Math.round((report.costs[`${service}Usd`] + (usd ?? 0)) * 10000) / 10000;
    if (usage) {
      const t = (report.tokens[step] ??= { input: 0, output: 0 });
      t.input += usage.input_tokens ?? 0;
      t.output += usage.output_tokens ?? 0;
    }
  };

  if (existsSync(done) && !args.force) {
    log(`Week of ${weekOf} is already produced (${done}). Nothing to do.`);
    return { exitCode: 0, skipped: true };
  }
  mkdirSync(weekDir, { recursive: true });
  if (existsSync(lock) && Date.now() - statSync(lock).mtimeMs < 3 * 3600_000) {
    log(`Another run for week of ${weekOf} is in progress. Exiting.`);
    return { exitCode: 0, skipped: true };
  }
  writeFileSync(lock, new Date().toISOString());
  rmSync(join(weekDir, "RUN-FAILED.md"), { force: true });

  const step = async (name, fn) => {
    const t0 = Date.now();
    try {
      const r = await fn();
      report.steps.push({ name, ok: true, secs: Math.round((Date.now() - t0) / 100) / 10, note: r?.note ?? null });
      return r;
    } catch (e) {
      report.steps.push({ name, ok: false, secs: Math.round((Date.now() - t0) / 100) / 10, error: String(e?.message ?? e) });
      throw Object.assign(e, { step: name });
    }
  };

  const { notify } = await import("./lib/notify.mjs");
  try {
    const { default: sharp } = await import("sharp");
    const L = await import("./lib/ledger.mjs");
    const G = await import("./lib/gate.mjs");
    const { buildSourcePacks } = await import("./lib/sources.mjs");
    const { baseCrop } = await import("./lib/render.mjs");
    const { renderPost, packageWeek } = await import("./produce.mjs");
    const { chooseFrame } = await import("./lib/frames.mjs");
    const V = await import("./lib/visual.mjs");
    const apify = await import("./lib/apify.mjs");
    const P = await import("./lib/planner.mjs");
    const ai = { anthropic: services.anthropic };
    const fetchImpl = services.fetchImpl ?? fetch;
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    const packs = buildSourcePacks({ repoRoot: services.repoRoot ?? REPO, today: weekOf });
    const packByRoute = Object.fromEntries(packs.map((p) => [p.route, p.fullText]));

    // 1. ledger ------------------------------------------------------------------
    const ledger = await step("ledger", async () => {
      const own = [];
      if (hasApify && env.LVINIT_INSTAGRAM) {
        const r = await apify.ownRecentPosts({ instagram: env.LVINIT_INSTAGRAM, tiktok: env.LVINIT_TIKTOK, token: env.APIFY_TOKEN, fetchImpl });
        own.push(...r.posts);
        addCost("apify", "ledger", r.usd);
      } else {
        report.notConfigured.push("Instagram/TikTok recent posts: not refreshed (Apify not configured); the live-session snapshot was used for Instagram.");
      }
      try {
        own.push(...(await L.youtubeRecent(env.LVINIT_YOUTUBE_CHANNEL ?? DEFAULT_YOUTUBE, weekOf, { fetchImpl })));
      } catch (e) {
        report.gaps.push(`YouTube history couldn't be refreshed this week (${String(e.message).slice(0, 80)}).`);
      }
      const published = L.reconcilePublished(outRoot, own);
      report.reconciled = published;
      report.gaps.push("Posts scheduled inside Instagram/Meta Business Suite or TikTok aren't visible to this system. If you schedule something outside these batches, mark it in that week's status.json or in Weekly Posts\\scheduled.json.");
      const l = L.buildLedger({ outRoot, currentWeekOf: weekOf, ownPosts: own, seedFile: join(HOME, "ledger-seed.json") });
      return Object.assign(l, { note: `${l.length} entries (${own.length} refreshed; ${published.length} drafts newly marked published)` });
    });

    // 2. research ------------------------------------------------------------------
    const research = await step("research", async () => {
      if (!hasApify) {
        report.notConfigured.push("Research: Apify not configured. Posts are evergreen, labeled as such.");
        return Object.assign([], { note: "not run: no APIFY_TOKEN" });
      }
      const queries = (env.LVINIT_RESEARCH_QUERIES ?? "moving to las vegas,las vegas neighborhoods,summerlin,henderson nevada,las vegas homes,relocation tips,first time home buyer tips,hoa fees").split(",").map((s) => s.trim());
      const r = await apify.research({ queries, token: env.APIFY_TOKEN, fetchImpl });
      addCost("apify", "research", r.usd);
      report.apifyRuns = r.runs;
      return Object.assign(r.posts, { note: `${r.posts.length} posts from ${queries.length} queries` });
    });

    // 3. plan ----------------------------------------------------------------------
    const plan = await step("plan", async () => {
      if (args.plan) {
        report.manual.push(`Plan supplied from a file (${args.plan.split(/[\\/]/).pop()}) instead of being generated.`);
        return Object.assign(JSON.parse(readFileSync(args.plan, "utf8")), { note: "from file (rehearsal)" });
      }
      if (!hasClaude) throw new Error("No ANTHROPIC_API_KEY in ~/.lvinit/executive-producer/.env, so nothing can be planned.");
      const r = await P.planWeek({ weekOf, research, ledger, pages: packs, catalogSummary: catalog.folders }, ai);
      addCost("anthropic", "plan", r.usd, r.usage);
      return Object.assign({ posts: r.plan.posts ?? [], backups: r.plan.backups ?? [] }, { note: `${(r.plan.posts ?? []).length} posts + ${(r.plan.backups ?? []).length} backups` });
    });
    plan.posts = (plan.posts ?? []).map((p, i) => ({ ...p, day: p.day ?? DAYS[i] }));
    const backups = [...(plan.backups ?? [])];

    // 4. verify --------------------------------------------------------------------
    const officialQuotes = (p) => (p.sources ?? []).filter((s) => ["official", "news"].includes(s.authority) && s.quote).map((s) => s.quote);
    const evidenceFor = (p) =>
      (p.sources ?? []).map((s) => {
        const route = (String(s.url).match(/lvinit\.com(\/[^?#\s]*)/) ?? [])[1];
        return { authority: s.authority, url: s.url, text: s.quote ?? (route ? String(packByRoute[route] ?? "").slice(0, 20000) : "") };
      });
    const localIssues = (p) => G.gatePost(p, { ledger, today: weekOf, sourceTexts: officialQuotes(p) });
    const textOf = (p) => [p.title, p.takeaway, p.caption, ...(p.slides ?? p.segments ?? []).flatMap((s) => [s.headline, s.body])].filter(Boolean).join("\n");

    const accepted = await step("verify", async () => {
      const verifyWeek = async (posts) => {
        const issues = new Map(posts.map((p) => [p.day, localIssues(p)]));
        for (const [day, xs] of G.checkDistinctTakeaways(posts)) issues.get(day)?.push(...xs);
        if (hasClaude) {
          const r = await P.verifyClaims(posts.map((p) => ({ day: p.day, title: p.title, takeaway: p.takeaway, text: textOf(p), evidence: evidenceFor(p) })), ai);
          addCost("anthropic", "verify", r.usd, r.usage);
          for (const v of r.posts ?? []) if (!v.ok) issues.get(v.day)?.push(...(v.problems ?? []).map((x) => ({ check: "claim", message: `"${x.claim}": ${x.why}` })));
          for (const [a, b, why] of r.sameLesson ?? []) issues.get(b)?.push({ check: "takeaway", message: `Same lesson as ${a}: ${why}` });
        } else if (!args.plan) {
          report.notConfigured.push("Claim-by-claim meaning check: not run (no Anthropic key); local checks only.");
        }
        return issues;
      };
      let posts = plan.posts;
      let issues = await verifyWeek(posts);
      const failing = () => posts.filter((p) => issues.get(p.day)?.length);
      if (failing().length && hasClaude) {
        const r = await P.revisePosts({ failures: failing().map((p) => ({ post: p, problems: issues.get(p.day) })), pages: packs.map((x) => ({ route: x.route, excerpt: x.excerpt })) }, ai);
        addCost("anthropic", "revise", r.usd, r.usage);
        const fixed = new Map((r.posts ?? []).map((p) => [p.day, p]));
        posts = posts.map((p) => fixed.get(p.day) ?? p);
        issues = await verifyWeek(posts);
      }
      const out = [];
      report.replaced = [];
      for (const p of posts) {
        if (!issues.get(p.day)?.length) {
          out.push(p);
          continue;
        }
        let placed = false;
        while (backups.length && !placed) {
          const b = { ...backups.shift(), day: p.day };
          const bi = localIssues(b);
          if (!bi.length) {
            out.push(b);
            placed = true;
            report.replaced.push({ day: p.day, dropped: p.title, why: issues.get(p.day).map((i) => i.message), with: b.title });
          }
        }
        if (!placed) report.exceptions.push({ day: p.day, title: p.title, issues: issues.get(p.day), resolution: "No verified backup was left. Skip this day or rewrite the listed claims." });
      }
      return Object.assign(out, { note: `${out.length} verified; ${report.replaced.length} replaced by backups` });
    });

    // 5. frames --------------------------------------------------------------------
    const usedHashes = [];
    const usedSources = []; // { path, t } of every image placed this week
    const loadCrop = (src, focus) => baseCrop(src, focus, { fast: true }); // checks and scoring only; final render is full resolution
    // On by default: Claude sees low-res candidate frames (approved clips only) to pick the one that
// actually shows the subject. LVINIT_VISION_FRAMES=off keeps frame choice fully local.
    const vision = hasClaude && (env.LVINIT_VISION_FRAMES ?? "on") !== "off" ? (x) => P.pickFrame(x, ai) : null;
    await step("frames", async () => {
      // Reserve photos the plan named on purpose first, so folder picks never land on their burst twins.
      for (const p of accepted) for (const s of p.slides ?? []) if (!s.src && s.source?.still) usedSources.push({ path: s.source.still, reserved: true });
      let picked = 0;
      for (const p of accepted) {
        for (const s of p.slides ?? []) {
          if (s.src) {
            usedHashes.push(await G.dhash(sharp, await loadCrop({ ...s.src, path: join(mediaRoot, s.src.path) }, s.focus)));
            usedSources.push(s.src);
            continue;
          }
          const r = await chooseFrame({ want: { ...s.source, want: s.want }, catalog, mediaRoot, sharp, loadCrop, usedHashes, usedSources, pick: vision, textBand: s.position ?? "top" });
          addCost("anthropic", "frames", r.usd);
          if (r.error) throw new Error(`${p.day} "${p.title}": ${r.error}`);
          s.src = r.src;
          s.focus = r.focus;
          s.note = `${s.want ?? ""} (${r.reason})`.trim();
          picked++;
        }
        for (const seg of p.segments ?? []) {
          if (seg.path) continue;
          const r = await chooseFrame({ want: { clip: seg.clip, want: seg.want }, catalog, mediaRoot, sharp, loadCrop, usedHashes, usedSources, pick: vision });
          addCost("anthropic", "frames", r.usd);
          if (r.error) throw new Error(`${p.day} "${p.title}": ${r.error}`);
          seg.path = r.src.path;
          seg.start = Math.max(0, (r.src.t ?? 0) - (seg.dur ?? 3.5) / 2);
          seg.dur = seg.dur ?? 3.5;
          picked++;
        }
        // Put text where the image is calm and dark enough for white type.
        for (const s of p.slides ?? []) {
          const bp = await V.bestPosition(sharp, await loadCrop({ ...s.src, path: join(mediaRoot, s.src.path) }, s.focus), s.position ?? "top");
          s.position = bp.position;
        }
      }
      return { note: `${picked} frames chosen automatically${vision ? " (with Claude)" : " (locally)"}` };
    });

    // 6. render --------------------------------------------------------------------
    const week = { weekOf, folderName, researchChecked: weekOf, posts: accepted, exceptions: report.exceptions, gaps: report.gaps, note: "Drafts only. Captions are copy-ready; notes.md in each folder has sources, references and file provenance." };
    const rendered = await step("render", async () => {
      const out = [];
      for (const [i, p] of accepted.entries()) out.push(await renderPost(p, i, { weekDir, week, mediaRoot }));
      return Object.assign(out, { note: `${out.length} posts rendered` });
    });

    // 7. review --------------------------------------------------------------------
    await step("review", async () => {
      const prev = L.previousWeeks(outRoot, weekOf).slice(0, 4);
      const repeat = G.checkRepeatedSources({ weekOf, posts: accepted }, prev);
      const tmp = mkdtempSync(join(tmpdir(), "lvinit-review-"));
      let fixes = 0;
      try {
        for (const [i, r] of rendered.entries()) {
          const p = accepted[i];
          const problems = [...(repeat.get(p.day) ?? [])];
          for (const [k, s] of (p.slides ?? []).entries()) {
            const st = await V.bandStats(sharp, await loadCrop({ ...s.src, path: join(mediaRoot, s.src.path) }, s.focus), s.position);
            if (V.badness(st) >= 1.5) problems.push({ check: "readability", slide: k + 1, message: `Slide ${k + 1}: text area is too bright or busy (mean ${st.mean}, variation ${st.std}).` });
          }
          if (!hasClaude) {
            if (problems.length) report.exceptions.push({ day: p.day, title: p.title, issues: problems, resolution: "Swap the named slide's image before posting." });
            continue;
          }
          for (let attempt = 0; attempt < 2; attempt++) {
            const strip = await V.reviewStrip(sharp, rendered[i].files, join(tmp, `${p.day}-${attempt}.jpg`));
            const rv = await P.reviewSlides({ sheetPath: strip, post: p }, ai);
            addCost("anthropic", "review", rv.usd, rv.usage);
            const bad = (rv.slides ?? []).filter((s) => !s.ok);
            if (!bad.length) {
              problems.length = 0;
              break;
            }
            if (attempt === 1 || p.format === "montage") {
              report.exceptions.push({ day: p.day, title: p.title, issues: bad.map((s) => ({ check: "visual", message: `Slide ${s.n}: ${s.issues.join("; ")}` })), resolution: bad.map((s) => (s.fix === "new_frame" ? `Replace slide ${s.n}'s image` : s.fix?.startsWith("move_text") ? `Move slide ${s.n}'s text ${s.fix.split("_").pop()}` : `Check slide ${s.n}`)).join("; ") + "." });
              break;
            }
            for (const s of bad) {
              const slide = p.slides[s.n - 1];
              if (!slide) continue;
              if (s.fix === "move_text_top" || s.fix === "move_text_bottom") slide.position = s.fix.endsWith("top") ? "top" : "bottom";
              else if (s.fix === "new_frame" && slide.source) {
                const nf = await chooseFrame({ want: { ...slide.source, want: slide.want }, catalog, mediaRoot, sharp, loadCrop, usedHashes, usedSources, pick: vision, textBand: slide.position });
                if (!nf.error) Object.assign(slide, { src: nf.src, focus: nf.focus });
              }
              fixes++;
            }
            rendered[i] = await renderPost(p, i, { weekDir, week, mediaRoot });
          }
          if (problems.length && !hasClaude) continue;
        }
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
      if (!hasClaude && !args.plan) report.notConfigured.push("Visual review of finished slides by Claude: not run (no Anthropic key); local readability and repeat checks only.");
      return { note: `${fixes} automatic fixes; ${report.exceptions.length} exceptions` };
    });

    // 8. package -------------------------------------------------------------------
    const zip = await step("package", async () => {
      // A re-run (--force) must not leave an earlier attempt's post folders behind.
      const current = new Set(rendered.map((r) => r.folder));
      for (const d of readdirSync(weekDir, { withFileTypes: true })) {
        if (d.isDirectory() && /^\d-(Mon|Tue|Wed|Thu|Fri|Sat|Sun)-/.test(d.name) && !current.has(d.name)) rmSync(join(weekDir, d.name), { recursive: true, force: true });
      }
      writeFileSync(join(weekDir, "week.json"), JSON.stringify(week, null, 2));
      if (!existsSync(join(weekDir, "status.json"))) writeFileSync(join(weekDir, "status.json"), JSON.stringify(L.initialStatus(week), null, 2));
      const z = await packageWeek(week, weekDir, rendered);
      return Object.assign(new String(z), { note: z.split(/[\\/]/).pop() });
    });

    report.costs.totalUsd = Math.round((report.costs.apifyUsd + report.costs.anthropicUsd) * 10000) / 10000;
    report.finishedAt = new Date().toISOString();
    report.posts = accepted.length;
    writeFileSync(join(weekDir, "run.json"), JSON.stringify(report, null, 2));
    writeFileSync(done, JSON.stringify({ weekOf, finishedAt: report.finishedAt, posts: accepted.length }, null, 2));
    const n = await (services.notify ?? notify)({ ok: true, weekOf, posts: accepted.length, exceptions: report.exceptions, costs: report.costs, previewPath: join(weekDir, "preview.html"), manual: [...report.manual, ...report.notConfigured], gaps: report.gaps.slice(0, 1) }, { fetchImpl, env });
    report.notification = n;
    writeFileSync(join(weekDir, "run.json"), JSON.stringify(report, null, 2));
    log(`Week of ${weekOf}: ${accepted.length} posts. Cost $${report.costs.totalUsd}. Manual: ${report.manual.length}. Not configured: ${report.notConfigured.length}. Exceptions: ${report.exceptions.length}. Email: ${n.email.sent ? "sent" : n.email.reason}.`);
    return { exitCode: 0, report, weekDir, zip: String(zip) };
  } catch (e) {
    report.failedAt = new Date().toISOString();
    report.costs.totalUsd = Math.round((report.costs.apifyUsd + report.costs.anthropicUsd) * 10000) / 10000;
    writeFileSync(
      join(weekDir, "RUN-FAILED.md"),
      `# This week's batch did not finish\n\nWeek of ${weekOf}. Failed at step **${e.step ?? "startup"}** on ${new Date(report.failedAt).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} (Pacific).\n\n> ${String(e?.message ?? e)}\n\nNothing was published. Fix the cause and run the Monday task again; it picks up the same week.\n`,
    );
    const n = await (services.notify ?? notify)({ ok: false, weekOf, failedStep: e.step, error: String(e?.message ?? e), costs: report.costs }, { fetchImpl: services.fetchImpl ?? fetch, env }).catch((x) => ({ email: { sent: false, reason: String(x) } }));
    report.notification = n;
    writeFileSync(join(weekDir, "run.json"), JSON.stringify(report, null, 2));
    log(`FAILED at ${e.step ?? "startup"}: ${e?.message ?? e}. Email: ${n.email?.sent ? "sent" : n.email?.reason}.`);
    return { exitCode: 1, report, weekDir };
  } finally {
    rmSync(lock, { force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runWeek().then((r) => process.exit(r.exitCode));
}
