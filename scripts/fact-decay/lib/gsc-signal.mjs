// ---------------------------------------------------------------------------
// OPTIONAL GSC SIGNAL
//
// The GSC Opportunity Agent measures search performance. This agent measures
// factual freshness. They stay separate systems — but a stale figure on a page
// people are actually landing on matters more than the same figure on a page
// nobody has found yet, and pretending otherwise would waste Mikey's time.
//
// So this module reads the GSC agent's newest report OFF DISK and turns it into
// one number per route: a priority multiplier.
//
// The boundaries, which are hard:
//
//   * It only READS reports/gsc/*.json. It never calls Search Console, never
//     re-scores a GSC finding, and never writes anything into reports/gsc/.
//   * Traffic can only reorder findings. It can never create one, suppress one,
//     or change a risk level. A stale claim on a zero-traffic page is still
//     reported — lower down, with the reason stated.
//   * If no GSC report exists, is unreadable, or is older than the configured
//     window, every multiplier is exactly 1.0 and the report says so. GSC data
//     is never required for this agent to run.
// ---------------------------------------------------------------------------

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { PAGE_LEVEL_TYPES } from "../../gsc/lib/report.mjs";

import { daysBetween } from "./dates.mjs";

const REPORT_FILE = /^gsc-opportunities-(\d{4}-\d{2}-\d{2})\.json$/;

/**
 * Newest gsc-opportunities-YYYY-MM-DD.json under a directory, or null.
 *
 * Searches the directory AND its immediate subdirectories, because the report
 * arrives two different ways depending on where the agent is running:
 *
 *   locally      `npm run gsc:report` writes straight into reports/gsc/
 *   in CI        the weekly job downloads the GSC workflow's artifact, and
 *                `gh run download` places a named artifact's files directly in
 *                the target directory — but places each artifact in its own
 *                subdirectory when several are fetched at once
 *
 * Handling both means the traffic signal does not silently disappear if that
 * download shape ever changes. One level deep is deliberate: this looks for a
 * report the CI step just placed, it does not go hunting through the repo.
 */
export function findLatestGscReport(dir) {
  if (!existsSync(dir)) return null;

  const candidates = [];
  const collect = (from) => {
    for (const entry of readdirSync(from, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const m = REPORT_FILE.exec(entry.name);
      if (m) candidates.push({ path: join(from, entry.name), reportDate: m[1] });
    }
  };

  collect(dir);
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) collect(join(dir, entry.name));
  }

  if (candidates.length === 0) return null;
  // Newest by the date in the filename, then by path for a stable tie-break.
  candidates.sort((a, b) => a.reportDate.localeCompare(b.reportDate) || a.path.localeCompare(b.path));
  return candidates[candidates.length - 1];
}

/** Log curve: 0 impressions -> 0, `reference` impressions -> 1, then flat. */
function demandCurve(impressions, reference) {
  const imp = Math.max(0, Number(impressions) || 0);
  const ref = Math.max(2, Number(reference) || 300);
  if (imp <= 0) return 0;
  return Math.min(1, Math.log1p(imp) / Math.log1p(ref));
}

/**
 * Load the traffic signal.
 *
 * @returns {{available:boolean, reason:string, reportPath:string|null,
 *            reportDate:string|null, ageDays:number|null, fixtureData:boolean,
 *            routes:Map<string,{impressions:number,clicks:number}>,
 *            multiplierFor:(route:string)=>{value:number, basis:string}}}
 */
export function loadGscSignal({ repoRoot, config, today }) {
  const neutral = (reason, extra = {}) => ({
    available: false,
    reason,
    reportPath: null,
    reportDate: null,
    ageDays: null,
    fixtureData: false,
    routes: new Map(),
    multiplierFor: () => ({ value: 1, basis: reason }),
    ...extra,
  });

  if (!config.gsc.enabled) {
    return neutral("the GSC signal is switched off in configuration, so every finding is ranked on risk and staleness alone");
  }

  const dir = join(repoRoot, config.gsc.dir);
  const latest = findLatestGscReport(dir);
  if (!latest) {
    return neutral(
      "no GSC Opportunity Agent report was found on disk, so traffic did not influence the ordering. That is expected — GSC data is optional for this agent"
    );
  }

  let report;
  try {
    report = JSON.parse(readFileSync(latest.path, "utf8"));
  } catch (err) {
    return neutral(`the newest GSC report could not be read (${err.message}), so traffic did not influence the ordering`);
  }

  const ageDays = daysBetween(latest.reportDate, today);
  if (ageDays > config.gsc.maxReportAgeDays) {
    return neutral(
      `the newest GSC report is ${ageDays} days old, past the ${config.gsc.maxReportAgeDays}-day limit. Traffic data goes stale too, so it was ignored`,
      { reportPath: latest.path, reportDate: latest.reportDate, ageDays }
    );
  }

  // One row per route. Findings repeat the same metrics across types, so take
  // the maximum rather than summing — summing would inflate a page purely for
  // having been detected several ways.
  //
  // The metrics mean different things depending on the finding's type, and the
  // report says which:
  //
  //   page-level types (page gaining/losing momentum, internal-link) carry the
  //     PAGE's own impressions and clicks — a real page-traffic measurement.
  //   query-level types carry the metrics of ONE query on that page, which is
  //     a lower bound on the page's visibility, not its total.
  //
  // Either way the signal is positive and is only ever used to boost, so a
  // lower bound is safe. Page-level metrics win when both exist.
  const routes = new Map();
  for (const opp of report.opportunities ?? []) {
    const route = opp.landingPage;
    if (!route) continue;
    const impressions = Number(opp.metrics?.impressions) || 0;
    const clicks = Number(opp.metrics?.clicks) || 0;
    const scope = PAGE_LEVEL_TYPES.has(opp.type) ? "page" : "query-lower-bound";
    const existing = routes.get(route);
    if (!existing) {
      routes.set(route, { impressions, clicks, scope });
      continue;
    }
    // A page-level measurement replaces a query lower bound outright.
    if (scope === "page" && existing.scope !== "page") {
      routes.set(route, { impressions, clicks, scope });
      continue;
    }
    if (scope === existing.scope) {
      existing.impressions = Math.max(existing.impressions, impressions);
      existing.clicks = Math.max(existing.clicks, clicks);
    }
  }

  const { neutralMultiplier, maxMultiplier, impressionReference } = config.gsc;
  const fixtureData = Boolean(report.fixtureData);

  return {
    available: true,
    reason: fixtureData
      ? `read from ${latest.path} — that report is FIXTURE data, so the traffic weighting below is synthetic too`
      : `read from ${latest.path} (${latest.reportDate}, ${ageDays} days old)`,
    reportPath: latest.path,
    reportDate: latest.reportDate,
    ageDays,
    fixtureData,
    routes,
    multiplierFor(route) {
      const row = routes.get(route);
      if (!row) {
        // NEVER a penalty. The GSC report lists only pages that produced an
        // opportunity, so a page can have real Google visibility and still not
        // appear here. Absence is missing data, not evidence of low traffic.
        return {
          value: neutralMultiplier,
          basis:
            "this page produced no opportunity in the newest GSC report. That report only covers pages that did, so " +
            "this says nothing about the page's traffic — it is weighted neutrally rather than penalised",
          impressions: null,
          clicks: null,
          scope: "no-signal",
        };
      }
      const demand = demandCurve(row.impressions, impressionReference);
      const value = neutralMultiplier + (maxMultiplier - neutralMultiplier) * demand;
      const measured =
        row.scope === "page"
          ? `${row.impressions} impressions and ${row.clicks} clicks for this page`
          : `at least ${row.impressions} impressions and ${row.clicks} clicks from one query on this page`;
      return {
        value: Number(value.toFixed(3)),
        basis: `${measured} in the newest GSC report — people are finding this page, so a stale fact on it is more urgent`,
        impressions: row.impressions,
        clicks: row.clicks,
        scope: row.scope,
      };
    },
  };
}
