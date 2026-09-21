#!/usr/bin/env node
// ---------------------------------------------------------------------------
// LVINIT EXECUTIVE PRODUCER — MONDAY RUN (Mikey's PC, Windows Task Scheduler)
//
//   node scripts/executive-producer/weekly.mjs                 this week (Mon–Sun, Pacific)
//   node scripts/executive-producer/weekly.mjs --plan=FILE     use a prepared plan instead of Claude planning
//   node scripts/executive-producer/weekly.mjs --force         rebuild a week that already finished
//
// Steps, in order, each timed and costed in run.json:
//   1. ledger     Mikey's recent posts (Apify) + earlier batches + scheduled.json + seed
//   2. research   other creators on Instagram + TikTok (Apify)
//   3. plan       7 posts + 3 backups (Claude, text only)
//   4. frames     exact moments for each slide (Claude vision if enabled, else local)
//   5. gate       duplicate / superlative / financial / generic / image checks;
//                 failing posts are swapped for backups and re-checked
//   6. produce    slides, reel, captions, notes, preview.html, ZIP
//
// Safety:
//   * one batch per week: a DONE marker makes re-runs (missed-start retries,
//     double triggers) exit immediately; a lock stops two runs overlapping
//   * any failure writes RUN-FAILED.md into the week folder (it syncs to
//     Mikey's phone via OneDrive) and exits non-zero so Task Scheduler logs it
//   * credentials come from ~/.lvinit/executive-producer/.env and are never
//     printed or written anywhere else
//   * drafts only: nothing is ever published
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const HOME = join(homedir(), ".lvinit", "executive-producer");

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

export async function runWeek(argv = process.argv.slice(2), { log = console.log, now = new Date() } = {}) {
  const args = parseArgs(argv);
  const envKeys = loadEnv(join(HOME, ".env"));
  const weekOf = args.week ?? mondayOf(now);
  const outRoot = args.out ?? join(homedir(), "OneDrive", "Documents", "LVINIT", "Weekly Posts");
  const weekDir = join(outRoot, `Week of ${weekOf}${args.suffix ? ` ${args.suffix}` : ""}`);
  const done = join(weekDir, "DONE.json");
  const lock = join(weekDir, ".run.lock");
  const report = { weekOf, startedAt: new Date().toISOString(), steps: [], costs: { apifyUsd: 0, anthropicUsd: 0 }, manual: [], exceptions: [], credentials: envKeys };

  if (existsSync(done) && !args.force) {
    log(`Week of ${weekOf} is already produced (${done}). Nothing to do.`);
    return { exitCode: 0, skipped: true };
  }
  mkdirSync(weekDir, { recursive: true });
  if (existsSync(lock) && Date.now() - statSync(lock).mtimeMs < 3 * 3600_000) {
    log(`Another run for week of ${weekOf} started at ${readFileSync(lock, "utf8")}. Exiting.`);
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

  try {
    const { default: sharp } = await import("sharp");
    const { buildLedger, previousWeeks } = await import("./lib/ledger.mjs");
    const { gatePost, checkRepeatedSources, dhash, hamming, primaryTags } = await import("./lib/gate.mjs");
    const { buildSourcePacks } = await import("./lib/sources.mjs");
    const { baseCrop } = await import("./lib/render.mjs");
    const { produce } = await import("./produce.mjs");
    const apify = await import("./lib/apify.mjs");
    const planner = await import("./lib/planner.mjs");

    // 1. ledger
    const ledger = await step("ledger", async () => {
      let own = [];
      if (process.env.APIFY_TOKEN && process.env.LVINIT_INSTAGRAM) {
        const r = await apify.ownRecentPosts({ instagram: process.env.LVINIT_INSTAGRAM, tiktok: process.env.LVINIT_TIKTOK, token: process.env.APIFY_TOKEN });
        own = r.posts;
        report.costs.apifyUsd += r.usd;
      } else report.manual.push("Own-posts ledger: Apify not configured; used the seeded snapshot from the live session instead.");
      const l = buildLedger({ outRoot, currentWeekOf: weekOf, ownPosts: own, seedFile: join(HOME, "ledger-seed.json") });
      return Object.assign(l, { note: `${l.length} entries` });
    });

    // 2. research
    const research = await step("research", async () => {
      if (!process.env.APIFY_TOKEN) {
        report.manual.push("Research: Apify not configured, so no unattended Instagram/TikTok research ran. References come from the plan file.");
        return Object.assign([], { note: "skipped: no APIFY_TOKEN" });
      }
      const queries = (process.env.LVINIT_RESEARCH_QUERIES ?? "moving to las vegas,las vegas neighborhoods,summerlin,henderson nv,las vegas homes,relocation tips").split(",").map((s) => s.trim());
      const r = await apify.research({ queries, token: process.env.APIFY_TOKEN });
      report.costs.apifyUsd += r.usd;
      report.apifyRuns = r.runs;
      return Object.assign(r.posts, { note: `${r.posts.length} posts, $${r.usd.toFixed(3)}` });
    });

    // 3. plan
    const plan = await step("plan", async () => {
      if (args.plan) {
        report.manual.push(`Plan: loaded from ${args.plan} instead of Claude planning${process.env.ANTHROPIC_API_KEY ? "" : " (no ANTHROPIC_API_KEY)"}.`);
        return Object.assign(JSON.parse(readFileSync(args.plan, "utf8")), { note: "from file" });
      }
      if (!process.env.ANTHROPIC_API_KEY) throw new Error("No ANTHROPIC_API_KEY in ~/.lvinit/executive-producer/.env and no --plan file. Nothing can be planned.");
      const catalog = JSON.parse(readFileSync(join(REPO, "data", "executive-producer", "footage-catalog.json"), "utf8"));
      const r = await planner.planWeek({ weekOf, research, ledger, pages: buildSourcePacks({ repoRoot: REPO, today: weekOf }), catalogSummary: catalog.folders });
      report.costs.anthropicUsd += r.usd;
      return Object.assign({ weekOf, posts: r.plan.posts, backups: r.plan.backups }, { note: `$${r.usd.toFixed(3)}` });
    });
    plan.weekOf = weekOf;
    plan.folderName = `Week of ${weekOf}${args.suffix ? ` ${args.suffix}` : ""}`;

    // 4. frames (plans from Claude name clips + wants; prepared plans already carry exact frames)
    await step("frames", async () => {
      const unresolved = [...plan.posts, ...(plan.backups ?? [])].flatMap((p) => (p.slides ?? []).filter((s) => !s.src));
      if (unresolved.length) throw new Error(`${unresolved.length} slides have no exact frame yet; frame selection for Claude plans runs once the API key exists.`);
      return { note: "all frames specified" };
    });

    // 5. gate (with backup substitution)
    const accepted = await step("gate", async () => {
      // Superlatives need OFFICIAL or NEWS wording; LVINIT's own article isn't independent evidence.
      const textsFor = (p) => (p.sources ?? []).filter((s) => ["official", "news"].includes(s.authority) && s.quote).map((s) => s.quote);
      const backups = [...(plan.backups ?? [])];
      const out = [];
      const log2 = [];
      for (const p of plan.posts) {
        let cand = p;
        for (;;) {
          const issues = gatePost(cand, { ledger, today: weekOf, sourceTexts: textsFor(cand) });
          if (!issues.length) {
            out.push(cand);
            break;
          }
          log2.push({ day: p.day, rejected: cand.title, issues });
          const next = backups.shift();
          if (!next) {
            report.exceptions.push({ day: p.day, title: cand.title, issues, resolution: "No backup left; slot left empty rather than padded." });
            break;
          }
          cand = { ...next, day: p.day };
        }
      }
      // Week-wide image checks.
      const imgIssues = checkRepeatedSources({ weekOf, posts: out }, previousWeeks(outRoot, weekOf).slice(0, 4));
      const hashes = [];
      for (const p of out) {
        for (const s of p.slides ?? []) {
          const h = await dhash(sharp, await baseCrop({ ...s.src, path: join(args["media-root"] ?? "C:\\LVINIT", s.src.path) }, s.focus));
          const twin = hashes.find((x) => hamming(x.h, h) <= 8);
          if (twin) (imgIssues.get(p.day) ?? imgIssues.set(p.day, []).get(p.day)).push({ check: "image", message: `Looks nearly identical to a ${twin.day} image.` });
          hashes.push({ day: p.day, h });
        }
      }
      for (const [day, issues] of imgIssues) report.exceptions.push({ day, title: out.find((p) => p.day === day)?.title, issues, resolution: "Needs a different image before posting." });
      report.gate = log2;
      for (const p of out) p.topics = primaryTags(p);
      return Object.assign(out, { note: `${out.length}/7 passed; ${log2.length} replaced; ${report.exceptions.length} exceptions` });
    });

    // 6. produce
    await step("produce", async () => {
      const spec = join(weekDir, "week.json");
      writeFileSync(spec, JSON.stringify({ ...plan, posts: accepted, backups: undefined, exceptions: report.exceptions }, null, 2));
      const r = await produce({ spec, out: outRoot, mediaRoot: args["media-root"] ?? "C:\\LVINIT", log: () => {} });
      return { note: `${r.posts.length} posts, ZIP ${r.zip.split(/[\\/]/).pop()}` };
    });

    report.finishedAt = new Date().toISOString();
    report.costs.totalUsd = Math.round((report.costs.apifyUsd + report.costs.anthropicUsd) * 1000) / 1000;
    writeFileSync(join(weekDir, "run.json"), JSON.stringify(report, null, 2));
    writeFileSync(done, JSON.stringify({ weekOf, finishedAt: report.finishedAt, posts: accepted.length }, null, 2));
    log(`Week of ${weekOf}: ${accepted.length} posts produced. Cost $${report.costs.totalUsd}. Manual steps: ${report.manual.length}. Exceptions: ${report.exceptions.length}.`);
    return { exitCode: 0, report, weekDir };
  } catch (e) {
    report.failedAt = new Date().toISOString();
    writeFileSync(join(weekDir, "run.json"), JSON.stringify(report, null, 2));
    writeFileSync(
      join(weekDir, "RUN-FAILED.md"),
      `# This week's batch did not finish\n\nWeek of ${weekOf}. Failed at step **${e.step ?? "startup"}** on ${new Date(report.failedAt).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} (Pacific).\n\n> ${String(e?.message ?? e)}\n\nNothing was published. Fix the cause and run \`node scripts/executive-producer/weekly.mjs\` again (it resumes the same week).\n`,
    );
    log(`FAILED at ${e.step ?? "startup"}: ${e?.message ?? e}`);
    return { exitCode: 1, report, weekDir };
  } finally {
    rmSync(lock, { force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runWeek().then((r) => process.exit(r.exitCode));
}
