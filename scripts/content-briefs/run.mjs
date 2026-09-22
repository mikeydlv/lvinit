#!/usr/bin/env node
// ---------------------------------------------------------------------------
// LVINIT CONTENT BRIEF GENERATOR — RUNNER
//
//   node scripts/content-briefs/run.mjs              real run, report-only
//   node scripts/content-briefs/run.mjs --fixtures   synthetic demand, real site
//   node scripts/content-briefs/run.mjs --dry-run    analyze, write nothing
//   node scripts/content-briefs/run.mjs --help
//
// What it does, in order:
//   1. resolve config (defaults -> env -> CLI flags)
//   2. load the newest GSC report and validate it (required for any brief)
//   3. build the content inventory from the repository (read-only)
//   4. load the optional Fact-Decay and Internal Linking reports
//   5. read earlier brief reports and Publisher commit trailers (identity)
//   6. group, gate, check for duplicates, classify, score, brief
//   7. write reports/content-briefs/: the Markdown and JSON reports, one JSON
//      file per brief, and the handoff queue (dry-run unless enabled)
//   8. print a short summary
//
// What it will never do: edit a page, write an article, commit, push, deploy,
// or trigger the Content Publisher. It writes only to its own report
// directory, which is gitignored.
// ---------------------------------------------------------------------------

import { mkdirSync, writeFileSync, readdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig } from "./config.mjs";
import { loadGsc, loadFactDecay, loadInternalLinks, readPreviousReports, readPublishedFingerprints } from "./lib/inputs.mjs";
import { buildInventory } from "./lib/inventory.mjs";
import { analyze } from "./lib/analyze.mjs";
import { buildJsonReport, buildMarkdownReport, buildBriefFile, summaryLines } from "./lib/report.mjs";
import { buildFixtureGscReport } from "./fixtures/fixture-demand.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

const HELP = `
LVINIT Content Brief Generator

  node scripts/content-briefs/run.mjs [options]

Report-only. Reads search demand and the site, writes briefs and a handoff
queue into reports/content-briefs/. Never edits the site, never publishes,
never triggers the Content Publisher.

Options
  --fixtures            Synthetic search demand against the real site. Written
                        to reports/content-briefs/fixtures/, stamped FIXTURE.
  --dry-run             Analyze and print the summary, write no files.
  --today=YYYY-MM-DD    Pretend today is this date.
  --min-score=N         Minimum score for a brief (default 50).
  --max-new=N           New-content briefs shown (default 3).
  --max-updates=N       Update briefs shown (default 2).
  --no-history          Ignore earlier brief reports.
  --no-git              Do not read git log (Publisher status becomes unverified,
                        which blocks handoff).
  --out=DIR             Output directory (default reports/content-briefs).
  --help                This message.

Environment
  Nothing is required. Every threshold in scripts/content-briefs/config.mjs has
  an environment override named beside it. Publisher handoff stays a dry run
  unless BRIEFS_HANDOFF_ENABLED=true — see docs/CONTENT_BRIEF_GENERATOR.md.
`;

export function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const [flag, value] = raw.slice(2).split("=");
    args[flag] = value === undefined ? true : value;
  }
  return args;
}

export function overridesFromArgs(args) {
  const o = { output: {}, inputs: {}, inventory: {} };
  if (args["min-score"] !== undefined) o.output.minBriefScore = Number.parseFloat(args["min-score"]);
  if (args["max-new"] !== undefined) o.output.maxNewBriefs = Number.parseInt(args["max-new"], 10);
  if (args["max-updates"] !== undefined) o.output.maxUpdateBriefs = Number.parseInt(args["max-updates"], 10);
  if (args.out) o.output.dir = String(args.out);
  if (args["no-git"]) {
    o.inputs.useGitLog = false;
    o.inventory.useGitDates = false;
  }
  return o;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export async function run(argv = process.argv.slice(2), { log = console.log, repoRoot = REPO_ROOT } = {}) {
  const args = parseArgs(argv);
  if (args.help) {
    log(HELP);
    return { exitCode: 0 };
  }
  const config = loadConfig(overridesFromArgs(args));
  const fixtures = Boolean(args.fixtures);
  const today = args.today ? String(args.today) : todayIso();

  log("LVINIT Content Brief Generator (report-only)");

  const gsc = loadGsc({
    repoRoot,
    config,
    today,
    allowFixture: fixtures,
    reportOverride: fixtures ? buildFixtureGscReport({ repoRoot, today }) : null,
  });
  log(`  GSC:       ${gsc.available ? `${gsc.reportDate} — ${gsc.mode}` : "UNAVAILABLE"}`);
  if (fixtures) log("  Source:    FIXTURE search demand (synthetic) against the real site");

  const inventory = buildInventory({ repoRoot, config, today });
  log(`  Site:      ${inventory.totals.published} published editorial pages`);

  const factDecay = loadFactDecay({ repoRoot, config, today, allowFixture: fixtures });
  const internalLinks = loadInternalLinks({ repoRoot, config, today, allowFixture: fixtures });
  log(`  Signals:   Fact-Decay ${factDecay.available ? factDecay.reportDate : "none"}, Internal Linking ${internalLinks.available ? internalLinks.reportDate : "none"}`);

  const previousReports = args["no-history"] || fixtures ? [] : readPreviousReports({ repoRoot, config, beforeDate: today });
  const published = readPublishedFingerprints({ repoRoot, config });

  const analysis = analyze({ gsc, inventory, factDecay, internalLinks, previousReports, published, config, reportDate: today });
  const meta = { fixtureData: fixtures || Boolean(gsc.fixtureData), historyCount: previousReports.length };
  const json = buildJsonReport({ analysis, config, meta });
  const markdown = buildMarkdownReport({ analysis, config, meta });

  const outDir = join(repoRoot, config.output.dir, fixtures ? "fixtures" : "");
  const paths = {
    md: join(outDir, `content-opportunities-${today}.md`),
    json: join(outDir, `content-opportunities-${today}.json`),
    queue: join(outDir, `handoff-queue-${today}.json`),
    queueLatest: join(outDir, "handoff-queue.json"),
    briefs: join(outDir, "briefs"),
  };

  if (!args["dry-run"]) {
    mkdirSync(paths.briefs, { recursive: true });
    // Re-running the same day replaces that day's brief files, nothing else.
    for (const name of existsSync(paths.briefs) ? readdirSync(paths.briefs) : []) {
      if (name.startsWith(`BRIEF-${today}-`)) rmSync(join(paths.briefs, name));
    }
    writeFileSync(paths.md, `${markdown}\n`, "utf8");
    writeFileSync(paths.json, `${JSON.stringify(json, null, 2)}\n`, "utf8");
    for (const o of analysis.opportunities.filter((x) => x.brief)) {
      writeFileSync(join(paths.briefs, `${o.id}.json`), `${JSON.stringify(buildBriefFile(o, analysis), null, 2)}\n`, "utf8");
    }
    const queue = { ...analysis.queue, fixtureData: meta.fixtureData };
    writeFileSync(paths.queue, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
    writeFileSync(paths.queueLatest, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
  }

  log("");
  for (const line of summaryLines(analysis)) log(line);
  log("");
  log(args["dry-run"] ? "  --dry-run: no files written." : `  Wrote ${paths.md}\n        ${paths.json}\n        ${paths.queue}`);
  if (meta.fixtureData) log("\n  ⚠️  FIXTURE RUN — the search demand above is synthetic. Do not act on it.");

  return { exitCode: 0, analysis, json, markdown, paths };
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  run()
    .then((r) => {
      process.exitCode = r.exitCode ?? 0;
    })
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    });
}
