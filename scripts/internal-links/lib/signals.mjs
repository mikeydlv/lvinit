// ---------------------------------------------------------------------------
// OPTIONAL SIGNALS FROM THE OTHER TWO AGENTS
//
// Both are READ-ONLY and both are OPTIONAL. If neither report is on disk this
// agent runs exactly as it would otherwise, and the report says so on its face.
//
//   GSC Opportunity Agent  ->  PRIORITY ONLY. Traffic can reorder which safe
//                              links get done first. It can never create an
//                              opportunity, raise a confidence score, or make
//                              an unsafe link safe. Absence from the GSC report
//                              is NEUTRAL, never a penalty — that report lists
//                              only pages that produced an opportunity.
//
//   Fact-Decay Agent       ->  DESTINATION ELIGIBILITY. A page with a serious
//                              unresolved factual problem does not get more
//                              readers pushed into it. A page with an ordinary
//                              low-priority finding is completely unaffected.
//
// Neither report is ever written to, re-scored, or second-guessed here.
// ---------------------------------------------------------------------------

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { PAGE_LEVEL_TYPES } from "../../gsc/lib/report.mjs";

import { daysBetween } from "./graph.mjs";

/**
 * Newest `<prefix>-YYYY-MM-DD.json` under a directory, searching the directory
 * and its immediate subdirectories.
 *
 * One level deep is deliberate, and it matches how the Fact-Decay Agent already
 * does this: locally a report is written straight into the directory, while in
 * CI `gh run download` puts each artifact in its own subdirectory.
 */
export function findLatestReport(dir, prefix) {
  if (!existsSync(dir)) return null;
  const pattern = new RegExp(`^${prefix}-(\\d{4}-\\d{2}-\\d{2})\\.json$`);
  const candidates = [];
  const collect = (from) => {
    for (const entry of readdirSync(from, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const m = pattern.exec(entry.name);
      if (m) candidates.push({ path: join(from, entry.name), reportDate: m[1] });
    }
  };
  collect(dir);
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) collect(join(dir, entry.name));
  }
  if (candidates.length === 0) return null;
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
 * The GSC prioritization signal.
 *
 * @returns {{available:boolean, reason:string, reportPath:string|null,
 *            reportDate:string|null, ageDays:number|null, fixtureData:boolean,
 *            namedInternalLinkRoutes:Set<string>,
 *            multiplierFor:(route:string)=>object}}
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
    namedInternalLinkRoutes: new Set(),
    multiplierFor: () => ({ value: config.gsc.neutralMultiplier, basis: reason, named: false }),
    ...extra,
  });

  if (!config.gsc.enabled) {
    return neutral(
      "the GSC signal is switched off in configuration, so opportunities are ranked on relevance and discovery need alone"
    );
  }

  const dir = join(repoRoot, config.gsc.dir);
  const latest = findLatestReport(dir, "gsc-opportunities");
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
  if (ageDays !== null && ageDays > config.gsc.maxReportAgeDays) {
    return neutral(
      `the newest GSC report is ${ageDays} days old, past the ${config.gsc.maxReportAgeDays}-day limit. Traffic data goes stale too, so it was ignored`,
      { reportPath: latest.path, reportDate: latest.reportDate, ageDays }
    );
  }

  const routes = new Map();
  const namedInternalLinkRoutes = new Set();
  for (const opp of report.opportunities ?? []) {
    const route = opp.landingPage;
    if (!route) continue;
    if (opp.type === "internal-link" || opp.recommendationKind === "add-internal-links") {
      namedInternalLinkRoutes.add(route);
    }
    const impressions = Number(opp.metrics?.impressions) || 0;
    const clicks = Number(opp.metrics?.clicks) || 0;
    const scope = PAGE_LEVEL_TYPES.has(opp.type) ? "page" : "query-lower-bound";
    const existing = routes.get(route);
    if (!existing) {
      routes.set(route, { impressions, clicks, scope });
      continue;
    }
    if (scope === "page" && existing.scope !== "page") {
      routes.set(route, { impressions, clicks, scope });
      continue;
    }
    if (scope === existing.scope) {
      existing.impressions = Math.max(existing.impressions, impressions);
      existing.clicks = Math.max(existing.clicks, clicks);
    }
  }

  const { neutralMultiplier, maxMultiplier, impressionReference, namedInternalLinkBoost } = config.gsc;
  const fixtureData = Boolean(report.fixtureData);

  return {
    available: true,
    reason: fixtureData
      ? `read from ${latest.path} — that report is FIXTURE data, so the weighting below is synthetic too`
      : `read from ${latest.path} (${latest.reportDate}, ${ageDays} days old)`,
    reportPath: latest.path,
    reportDate: latest.reportDate,
    ageDays,
    fixtureData,
    routes,
    namedInternalLinkRoutes,
    multiplierFor(route) {
      const named = namedInternalLinkRoutes.has(route);
      const row = routes.get(route);
      if (!row) {
        // NEVER a penalty. See the note in scripts/fact-decay/lib/gsc-signal.mjs:
        // the GSC report lists only pages that produced an opportunity, so
        // absence is missing data, not evidence of low traffic.
        return {
          value: neutralMultiplier,
          basis:
            "this page produced no opportunity in the newest GSC report. That report only covers pages that did, so " +
            "this says nothing about the page's traffic — it is weighted neutrally rather than penalised",
          impressions: null,
          clicks: null,
          scope: "no-signal",
          named: false,
        };
      }
      const demand = demandCurve(row.impressions, impressionReference);
      const base = neutralMultiplier + (maxMultiplier - neutralMultiplier) * demand;
      const value = named ? base * namedInternalLinkBoost : base;
      const measured =
        row.scope === "page"
          ? `${row.impressions} impressions and ${row.clicks} clicks for this page`
          : `at least ${row.impressions} impressions and ${row.clicks} clicks from one query on this page`;
      return {
        value: Number(value.toFixed(3)),
        basis:
          `${measured} in the newest GSC report` +
          (named
            ? ", and the GSC agent raised an internal-link opportunity naming this exact page — that is the other agent asking for this work, not an inference"
            : " — people are finding this page, so making it easier to reach from related coverage is worth doing sooner"),
        impressions: row.impressions,
        clicks: row.clicks,
        scope: row.scope,
        named,
      };
    },
  };
}

/**
 * The Fact-Decay destination-eligibility signal.
 *
 * Blocking is deliberately narrow. Almost every LVINIT page carries at least
 * one Fact-Decay finding — that is what a market site looks like — so "has a
 * finding" cannot be the bar or nothing would ever be linkable. The two
 * blocking conditions are written in Fact-Decay's own vocabulary and documented
 * in scripts/internal-links/config.mjs.
 *
 * @returns {{available:boolean, reason:string, eligibilityFor:(route:string)=>object}}
 */
export function loadFactDecaySignal({ repoRoot, config, today }) {
  const neutral = (reason, extra = {}) => ({
    available: false,
    reason,
    reportPath: null,
    reportDate: null,
    ageDays: null,
    fixtureData: false,
    byRoute: new Map(),
    eligibilityFor: () => ({
      eligible: true,
      code: "NO_FACT_DECAY_DATA",
      reason,
      worstFinding: null,
    }),
    ...extra,
  });

  if (!config.factDecay.enabled) {
    return neutral("the Fact-Decay signal is switched off in configuration, so destination freshness was not checked");
  }

  const dir = join(repoRoot, config.factDecay.dir);
  const latest = findLatestReport(dir, "fact-decay");
  if (!latest) {
    return neutral(
      "no Fact-Decay Agent report was found on disk, so destination freshness could not be checked. Links were still only proposed where the editorial case stands on its own"
    );
  }

  let report;
  try {
    report = JSON.parse(readFileSync(latest.path, "utf8"));
  } catch (err) {
    return neutral(`the newest Fact-Decay report could not be read (${err.message}), so destination freshness was not checked`);
  }

  const ageDays = daysBetween(latest.reportDate, today);
  if (ageDays !== null && ageDays > config.factDecay.maxReportAgeDays) {
    return neutral(
      `the newest Fact-Decay report is ${ageDays} days old, past the ${config.factDecay.maxReportAgeDays}-day limit, so it was ignored`,
      { reportPath: latest.path, reportDate: latest.reportDate, ageDays }
    );
  }

  const byRoute = new Map();
  for (const finding of report.findings ?? []) {
    const route = finding.route;
    if (!route) continue;
    if (!byRoute.has(route)) byRoute.set(route, []);
    byRoute.get(route).push({
      id: finding.id,
      priority: Number(finding.priority) || 0,
      riskLevel: finding.risk?.level ?? "unknown",
      verification: finding.verification?.result ?? "not-attempted",
      urgency: finding.urgency ?? null,
      claim: finding.claim ?? null,
    });
  }

  const { blockPriority, blockOnHighRiskContradiction } = config.factDecay;
  const fixtureData = Boolean(report.fixtureData);

  return {
    available: true,
    reason: fixtureData
      ? `read from ${latest.path} — that report is FIXTURE data, so the destination checks below are synthetic too`
      : `read from ${latest.path} (${latest.reportDate}, ${ageDays} days old)`,
    reportPath: latest.path,
    reportDate: latest.reportDate,
    ageDays,
    fixtureData,
    byRoute,
    eligibilityFor(route) {
      const findings = byRoute.get(route) ?? [];
      if (findings.length === 0) {
        return {
          eligible: true,
          code: "NO_OPEN_FINDINGS",
          reason: "the newest Fact-Decay report raised nothing on this page",
          worstFinding: null,
          findingCount: 0,
        };
      }
      const sorted = [...findings].sort((a, b) => b.priority - a.priority);
      const worst = sorted[0];

      const contradiction = blockOnHighRiskContradiction
        ? sorted.find((f) => f.verification === "contradicts" && f.riskLevel === "high")
        : null;
      if (contradiction) {
        return {
          eligible: false,
          code: "DESTINATION_REQUIRES_REFRESH",
          reason:
            `Fact-Decay ${contradiction.id} is a high-risk claim on this page that its own cited source contradicts. ` +
            "Sending more readers to a page with a high-consequence claim that is probably wrong makes the problem worse, " +
            "so this destination is not strengthened until that is resolved.",
          worstFinding: contradiction,
          findingCount: findings.length,
        };
      }

      const urgent = sorted.find((f) => f.priority >= blockPriority);
      if (urgent) {
        return {
          eligible: false,
          code: "DESTINATION_REQUIRES_REFRESH",
          reason:
            `Fact-Decay ${urgent.id} sits at priority ${urgent.priority}, at or above the ${blockPriority} line the ` +
            "Fact-Decay Agent itself calls “act now”. This destination is not strengthened until that is resolved.",
          worstFinding: urgent,
          findingCount: findings.length,
        };
      }

      return {
        eligible: true,
        code: "FINDINGS_BELOW_BLOCKING_THRESHOLD",
        reason:
          `${findings.length} open Fact-Decay finding${findings.length === 1 ? "" : "s"} on this page, the most urgent at ` +
          `priority ${worst.priority} (${worst.riskLevel} risk, ${worst.verification}). That is below the blocking ` +
          "threshold — routine maintenance, not a reason to withhold a useful link.",
        worstFinding: worst,
        findingCount: findings.length,
      };
    },
  };
}
