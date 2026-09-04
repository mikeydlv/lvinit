#!/usr/bin/env node
// ---------------------------------------------------------------------------
// LVINIT CONTENT REFRESH + FACT-DECAY AGENT — RUNNER
//
//   node scripts/fact-decay/run.mjs                 scan the repository
//   node scripts/fact-decay/run.mjs --verify        also re-check cited sources
//   node scripts/fact-decay/run.mjs --fixtures      synthetic pages, no network
//   node scripts/fact-decay/run.mjs --dry-run       analyze but write nothing
//   node scripts/fact-decay/run.mjs --today=2026-12-01
//   node scripts/fact-decay/run.mjs --help
//
// What it does, in order:
//   1. resolve config (defaults -> env -> CLI flags)
//   2. build the inventory of published editorial pages
//   3. load the optional GSC traffic signal from reports/gsc/ (read-only)
//   4. read earlier fact-decay reports, so findings keep their identity
//   5. detect claims, score risk and freshness, verify, rank
//   6. write reports/fact-decay/fact-decay-YYYY-MM-DD.{md,json}
//   7. print a short summary
//
// What it will never do: edit site files, rewrite articles, change metadata or
// links, publish, commit, push, deploy, email, or hand work to the Content
// Publisher. It has no code path that writes anywhere but the report directory.
// ---------------------------------------------------------------------------

import { mkdirSync, writeFileSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig } from "./config.mjs";
import { buildContentInventory } from "./lib/content-inventory.mjs";
import { loadGscSignal } from "./lib/gsc-signal.mjs";
import { createVerifier, loadCache, saveCache } from "./lib/verify.mjs";
import { analyze } from "./lib/analyze.mjs";
import { buildMarkdownReport, buildJsonReport, selectHighlights } from "./lib/report.mjs";
import { formatISODate } from "./lib/dates.mjs";
import { buildFixtureInventory } from "./fixtures/fixture-pages.mjs";
import { createFixtureFetch } from "./fixtures/fixture-sources.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

const HELP = `
LVINIT Content Refresh + Fact-Decay Agent

  node scripts/fact-decay/run.mjs [options]

Options
  --verify              Re-check the sources pages already cite, over the
                        network. Off by default: a plain run does no network I/O.
  --fixtures            Run against synthetic fixture pages. No repository scan,
                        no network. The report is stamped FIXTURE DATA throughout.
  --dry-run             Analyze and print the summary, write no files.
  --today=YYYY-MM-DD    Pretend today is this date. Useful for seeing what the
                        site will look like in three months.
  --min-priority=N      Minimum priority to report (default 35).
  --max=N               Maximum findings to report (default 40).
  --route=/path         Scan only this route. Repeatable.
  --exclude=/path       Skip this route. Repeatable, comma-separated too.
  --no-gsc              Ignore the GSC traffic signal entirely.
  --out=DIR             Output directory (default reports/fact-decay).
  --json-only           Write only the JSON report.
  --help                This message.

Environment
  Nothing is required. Every threshold in scripts/fact-decay/config.mjs has an
  environment override, named beside it in that file. See
  docs/FACT_DECAY_AGENT.md.
`;

/** Parse --flag and --flag=value into a plain object. Repeats become arrays. */
export function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const [flag, value] = raw.slice(2).split("=");
    const parsed = value === undefined ? true : value;
    if (flag in args) {
      args[flag] = Array.isArray(args[flag]) ? [...args[flag], parsed] : [args[flag], parsed];
    } else {
      args[flag] = parsed;
    }
  }
  return args;
}

const asList = (value) =>
  (Array.isArray(value) ? value : [value])
    .filter((v) => typeof v === "string")
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);

/** Turn CLI flags into a config override object. */
export function overridesFromArgs(args) {
  const overrides = { output: {}, content: {}, verification: {}, gsc: {} };
  if (args["min-priority"] !== undefined) overrides.output.minPriority = Number.parseFloat(args["min-priority"]);
  if (args.max) overrides.output.maxFindings = Number.parseInt(args.max, 10);
  if (args.out) overrides.output.dir = String(args.out);
  if (args.route) overrides.content.includeRoutes = asList(args.route);
  if (args.exclude) overrides.content.excludeRoutes = asList(args.exclude);
  if (args.verify) overrides.verification.enabled = true;
  if (args["no-gsc"]) overrides.gsc.enabled = false;
  // Scanning a named route means scanning ONLY that route.
  if (args.route) overrides.content.includeSections = [];
  return overrides;
}

/** Earlier fact-decay JSON reports, newest last, for stable-ID continuity. */
export function readPreviousReports(dir, { limit, excludeDate } = {}) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /^fact-decay-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .filter((f) => !excludeDate || !f.includes(excludeDate))
    .sort()
    .slice(-Math.max(1, limit ?? 12))
    .map((f) => {
      try {
        return JSON.parse(readFileSync(join(dir, f), "utf8"));
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

export async function run(argv = process.argv.slice(2), { log = console.log, errorLog = console.error } = {}) {
  const args = parseArgs(argv);
  if (args.help) {
    log(HELP);
    return { exitCode: 0 };
  }

  const config = loadConfig(overridesFromArgs(args));
  const useFixtures = Boolean(args.fixtures);
  const dryRun = Boolean(args["dry-run"]);
  const reportDate = args.today ? String(args.today) : formatISODate(new Date());

  log("LVINIT Content Refresh + Fact-Decay Agent");
  log(`  Scan date: ${reportDate}`);

  // --- Inventory -----------------------------------------------------------
  let inventory;
  let dataSource;
  try {
    if (useFixtures) {
      log("  Source:    FIXTURE PAGES (synthetic — not LVINIT's real content)");
      inventory = buildFixtureInventory({ config, today: reportDate });
      dataSource = "fixture";
    } else {
      inventory = buildContentInventory({ repoRoot: REPO_ROOT, config, today: reportDate });
      dataSource = "repository-scan";
      log(`  Source:    the LVINIT repository — ${inventory.pages.length} published editorial page(s) in scope`);
    }
  } catch (err) {
    errorLog(`\nCould not read the site's content: ${err.message}`);
    return { exitCode: 1 };
  }

  if (inventory.pages.length === 0) {
    log("");
    log("  No pages were in scope. Check content.includeSections / --route in the config.");
  }

  // --- Optional GSC signal (read-only) -------------------------------------
  const gscSignal = loadGscSignal({ repoRoot: REPO_ROOT, config, today: reportDate });
  log(`  Traffic:   ${gscSignal.available ? `GSC report ${gscSignal.reportDate} (${gscSignal.ageDays}d old)` : "no GSC weighting"}`);

  // --- Verification --------------------------------------------------------
  const cachePath = resolve(REPO_ROOT, config.verification.cacheFile);
  const cache = config.verification.enabled ? loadCache(cachePath) : { version: 1, entries: {} };
  const fetchImpl = useFixtures ? createFixtureFetch() : globalThis.fetch;
  const verifyConfig = useFixtures
    ? loadConfig({ ...overridesFromArgs(args), verification: { ...config.verification, perHostDelayMs: 0 } })
    : config;

  if (config.verification.enabled && !useFixtures && typeof globalThis.fetch !== "function") {
    errorLog("\n--verify needs a Node version with a global fetch (Node 18+).");
    return { exitCode: 1 };
  }

  const verifier = createVerifier({ config: verifyConfig, today: reportDate, fetchImpl, cache });
  log(
    `  Verify:    ${
      verifyConfig.verification.enabled
        ? `on (max ${verifyConfig.verification.maxSourceFetches} requests${useFixtures ? ", against fixture responses" : ""})`
        : "off — detection only"
    }`
  );

  // --- Earlier reports, for stable identity --------------------------------
  // resolve(), not join(): --out may be an absolute path.
  const outDir = resolve(REPO_ROOT, config.output.dir);
  const previousReports = readPreviousReports(outDir, {
    limit: config.output.historyLookback,
    excludeDate: reportDate,
  });

  // --- Analyze -------------------------------------------------------------
  const analysis = await analyze({
    inventory,
    config: verifyConfig,
    reportDate,
    gscSignal,
    verifier,
    previousReports,
  });

  const meta = { dataSource, origin: "https://www.lvinit.com" };
  const markdown = buildMarkdownReport({ analysis, config: verifyConfig, meta });
  const json = buildJsonReport({ analysis, config: verifyConfig, meta });

  // --- Output --------------------------------------------------------------
  const mdPath = join(outDir, `fact-decay-${reportDate}.md`);
  const jsonPath = join(outDir, `fact-decay-${reportDate}.json`);

  if (!dryRun) {
    mkdirSync(outDir, { recursive: true });
    if (!args["json-only"]) writeFileSync(mdPath, `${markdown}\n`, "utf8");
    writeFileSync(jsonPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
    if (verifyConfig.verification.enabled && !useFixtures) saveCache(cachePath, verifier.cache);
  }

  // --- Summary -------------------------------------------------------------
  const t = analysis.totals;
  log("");
  log(`  Pages scanned:     ${t.pagesInScope} (${t.pagesSkipped} out of scope)`);
  log(`  Sentences reviewed:${String(t.claimsReviewed).padStart(5)}`);
  log(`  Claims detected:   ${String(t.claimsDetected).padStart(5)}`);
  log(`  Findings reported: ${String(t.findingsReported).padStart(5)}  (high ${t.high} / medium ${t.medium} / low ${t.low})`);
  log(`  Pages needing review: ${t.pagesRequiringReview}; clean: ${t.pagesWithNoDetectedIssues}`);
  if (analysis.compliance.length) {
    log(`  Fair Housing: ${analysis.compliance.length} sentence group(s) queued for human compliance review`);
  }
  log("");

  for (const finding of selectHighlights(analysis.findings, verifyConfig)) {
    log(
      `  ${finding.id}  ${String(finding.priority).padStart(3)}  ${finding.risk.level.padEnd(6)} ` +
        `${finding.category.key.padEnd(32)} ${finding.route}`
    );
  }
  if (analysis.findings.length === 0) {
    log("  Nothing cleared the reporting threshold. That is a real answer, not an empty report.");
  }
  log("");

  if (dryRun) {
    log("  --dry-run: no files written.");
  } else {
    log(`  Wrote ${args["json-only"] ? "" : `${mdPath}\n        `}${jsonPath}`);
  }
  if (dataSource === "fixture") {
    log("");
    log("  ⚠️  FIXTURE RUN — every page, figure and source above is synthetic. Do not act on it.");
  }

  return { exitCode: 0, analysis, markdown, json, paths: { mdPath, jsonPath } };
}

// Only run when executed directly, so tests can import the module freely.
const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  run()
    .then((result) => {
      process.exitCode = result.exitCode ?? 0;
    })
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    });
}
