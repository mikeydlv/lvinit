#!/usr/bin/env node
// ---------------------------------------------------------------------------
// LVINIT GSC OPPORTUNITY AGENT — RUNNER
//
//   node scripts/gsc/run.mjs                 live Search Console run
//   node scripts/gsc/run.mjs --fixtures      synthetic data, no credentials
//   node scripts/gsc/run.mjs --dry-run       analyze but write nothing
//   node scripts/gsc/run.mjs --period-days=7 --lag-days=2
//   node scripts/gsc/run.mjs --help
//
// What it does, in order:
//   1. resolve config (defaults -> env -> CLI flags)
//   2. work out the two date windows
//   3. fetch three dimension sets per window (query, page, query+page)
//   4. read the LVINIT site inventory from the repo
//   5. detect, score, and rank opportunities
//   6. write reports/gsc/gsc-opportunities-YYYY-MM-DD.{md,json}
//   7. print a short summary
//
// What it will never do: edit site files, publish, commit, push, deploy, email.
// It has no code path that writes anywhere but the report directory.
// ---------------------------------------------------------------------------

import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig } from "./config.mjs";
import { buildWindows, describeWindows } from "./lib/windows.mjs";
import { readCredentialsFromEnv, createTokenProvider } from "./lib/auth.mjs";
import { createSearchConsoleClient, normalizeRows } from "./lib/client.mjs";
import { buildSiteInventory } from "./lib/site-inventory.mjs";
import { analyze } from "./lib/analyze.mjs";
import {
  buildMarkdownReport,
  buildJsonReport,
  selectExecutiveSummary,
  PAGE_LEVEL_TYPES,
} from "./lib/report.mjs";
import { FIXTURE_DATASET } from "./fixtures/fixture-dataset.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

const HELP = `
LVINIT GSC Opportunity Agent

  node scripts/gsc/run.mjs [options]

Options
  --fixtures            Run against synthetic fixture data. No credentials
                        needed. The report is stamped FIXTURE DATA throughout.
  --dry-run             Analyze and print the summary, write no files.
  --period-days=N       Length of the current window (default 28).
  --lag-days=N          Search Console reporting-lag buffer (default 3).
  --comparison-days=N   Length of the previous window (default: same as current).
  --min-score=N         Minimum score to report (default 25).
  --max=N               Maximum findings to report (default 25).
  --today=YYYY-MM-DD    Pretend today is this date. For testing windows.
  --out=DIR             Output directory (default reports/gsc).
  --json-only           Write only the JSON report.
  --help                This message.

Environment (never commit these — see .env.example)
  GSC_SITE_URL                   e.g. sc-domain:lvinit.com
  GSC_SERVICE_ACCOUNT_JSON       the whole service-account key file, or:
  GSC_SERVICE_ACCOUNT_EMAIL      client_email from that file
  GSC_SERVICE_ACCOUNT_KEY        private_key from that file
`;

/** Parse --flag and --flag=value into a plain object. */
export function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const [flag, value] = raw.slice(2).split("=");
    args[flag] = value === undefined ? true : value;
  }
  return args;
}

/** Turn CLI flags into a config override object. */
export function overridesFromArgs(args) {
  const overrides = { windows: {}, output: {} };
  if (args["period-days"]) overrides.windows.periodDays = Number.parseInt(args["period-days"], 10);
  if (args["lag-days"] !== undefined) overrides.windows.lagDays = Number.parseInt(args["lag-days"], 10);
  if (args["comparison-days"]) overrides.windows.comparisonDays = Number.parseInt(args["comparison-days"], 10);
  if (args["min-score"] !== undefined) overrides.output.minScore = Number.parseFloat(args["min-score"]);
  if (args.max) overrides.output.maxOpportunities = Number.parseInt(args.max, 10);
  if (args.out) overrides.output.dir = String(args.out);
  return overrides;
}

/** Fetch all three dimension sets for one window. */
async function fetchWindow(client, window, config) {
  const base = {
    startDate: window.start,
    endDate: window.end,
    rowLimit: config.site.rowLimit,
    maxPages: config.site.maxPages,
    searchType: config.site.searchType,
    dataState: config.site.dataState,
  };
  const [queries, pages, pairs] = await Promise.all([
    client.query({ ...base, dimensions: ["query"] }),
    client.query({ ...base, dimensions: ["page"] }),
    client.query({ ...base, dimensions: ["query", "page"] }),
  ]);
  return {
    queries: normalizeRows(queries, ["query"]),
    pages: normalizeRows(pages, ["page"]),
    pairs: normalizeRows(pairs, ["query", "page"]),
  };
}

/** Normalize a fixture window (already raw-shaped) exactly like a live one. */
function normalizeFixtureWindow(window) {
  return {
    queries: normalizeRows(window.queries, ["query"]),
    pages: normalizeRows(window.pages, ["page"]),
    pairs: normalizeRows(window.pairs, ["query", "page"]),
  };
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

  const windows = buildWindows({
    periodDays: config.windows.periodDays,
    lagDays: config.windows.lagDays,
    comparisonDays: config.windows.comparisonDays,
    today: args.today ? String(args.today) : new Date(),
  });

  log(`LVINIT GSC Opportunity Agent`);
  log(`  Windows: ${describeWindows(windows)}`);

  // --- Data ---------------------------------------------------------------
  let data;
  let dataSource;
  let property = null;

  if (useFixtures) {
    log("  Source:  FIXTURE DATA (synthetic — not LVINIT's real Search Console data)");
    data = {
      current: normalizeFixtureWindow(FIXTURE_DATASET.current),
      previous: normalizeFixtureWindow(FIXTURE_DATASET.previous),
    };
    dataSource = "fixture";
  } else {
    let credentials;
    try {
      credentials = readCredentialsFromEnv();
    } catch (err) {
      errorLog(`\nCredential problem: ${err.message}`);
      return { exitCode: 1 };
    }
    if (!credentials) {
      errorLog(
        "\nNo Search Console credentials found.\n\n" +
          "Set GSC_SERVICE_ACCOUNT_JSON (or GSC_SERVICE_ACCOUNT_EMAIL + GSC_SERVICE_ACCOUNT_KEY)\n" +
          "and GSC_SITE_URL. See docs/GSC_OPPORTUNITY_AGENT.md for the exact setup steps.\n\n" +
          "To try the agent without credentials right now:\n" +
          "  npm run gsc:report:fixtures\n"
      );
      return { exitCode: 1 };
    }
    if (!config.site.siteUrl) {
      errorLog(
        '\nGSC_SITE_URL is not set. Use the property exactly as Search Console names it,\n' +
          'e.g. "sc-domain:lvinit.com" or "https://www.lvinit.com/".\n'
      );
      return { exitCode: 1 };
    }

    property = config.site.siteUrl;
    log(`  Source:  Google Search Console — ${property} (dataState: ${config.site.dataState})`);

    const getAccessToken = createTokenProvider({ credentials });
    const client = createSearchConsoleClient({ siteUrl: config.site.siteUrl, getAccessToken });

    try {
      const [current, previous] = await Promise.all([
        fetchWindow(client, windows.current, config),
        fetchWindow(client, windows.previous, config),
      ]);
      data = { current, previous };
    } catch (err) {
      errorLog(`\nSearch Console request failed: ${err.message}`);
      return { exitCode: 1 };
    }
    dataSource = "search-console";
  }

  // --- Site inventory (always from the real repo) --------------------------
  const inventory = buildSiteInventory({ repoRoot: REPO_ROOT, origin: config.site.origin });
  log(`  Site:    ${inventory.routes.length} routes found in app/`);

  // --- Analyze -------------------------------------------------------------
  const reportDate = windows.today;
  const analysis = analyze({ data, inventory, config, reportDate, windows });

  const meta = { reportDate, dataSource, property };
  const markdown = buildMarkdownReport({ analysis, config, meta });
  const json = buildJsonReport({ analysis, config, meta });

  // --- Output --------------------------------------------------------------
  const outDir = join(REPO_ROOT, config.output.dir);
  const mdPath = join(outDir, `gsc-opportunities-${reportDate}.md`);
  const jsonPath = join(outDir, `gsc-opportunities-${reportDate}.json`);

  if (!dryRun) {
    mkdirSync(outDir, { recursive: true });
    if (!args["json-only"]) writeFileSync(mdPath, `${markdown}\n`, "utf8");
    writeFileSync(jsonPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  }

  // --- Summary -------------------------------------------------------------
  log("");
  log(`  Impressions: ${analysis.totals.currentImpressions} (previous: ${analysis.totals.previousImpressions})`);
  log(`  Clicks:      ${analysis.totals.currentClicks} (previous: ${analysis.totals.previousClicks})`);
  log(`  Findings:    ${analysis.opportunities.length} reported of ${analysis.candidateCount} candidates`);
  if (analysis.fairHousingExcluded.length) {
    log(`  Fair Housing: ${analysis.fairHousingExcluded.length} queries excluded from recommendations`);
  }
  if (analysis.lowVolume) log("  NOTE: low data volume — findings are early signals, not conclusions");
  log("");

  for (const opp of selectExecutiveSummary(analysis.opportunities, config.output.maxExecutiveSummary)) {
    const subject =
      PAGE_LEVEL_TYPES.has(opp.type) || !opp.query ? opp.landingPage : `"${opp.query}"`;
    log(`  ${opp.id}  ${String(opp.score).padStart(5)}  ${opp.type.padEnd(22)} ${subject}`);
  }
  log("");

  if (dryRun) {
    log("  --dry-run: no files written.");
  } else {
    log(`  Wrote ${args["json-only"] ? "" : `${mdPath}\n        `}${jsonPath}`);
  }
  if (dataSource === "fixture") {
    log("");
    log("  ⚠️  FIXTURE RUN — every number above is synthetic. Do not act on it.");
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
