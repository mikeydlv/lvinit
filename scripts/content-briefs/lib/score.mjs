// ---------------------------------------------------------------------------
// OPPORTUNITY SCORE (0-100) AND CONFIDENCE (High / Medium / Low)
//
// Two separate numbers, on purpose. A strong idea on thin data is high-score,
// low-confidence, and averaging the two would hide exactly that.
//
// SCORE — a weighted average of nine 0-1 components:
//
//   demand         impressions on the intent group, log curve saturating at
//                  scoring.impressionReference (150). Log, so 10 -> 40
//                  impressions matters far more than 400 -> 430 — small real
//                  signals stay visible on a young site.
//   position       realistic ranking upside (the GSC agent's triangle: peaks at
//                  position 11, zero at 1 and past 45). No ranking at all is
//                  neutral (0.5), not zero — absence is not a signal.
//   growth         period-over-period impressions (the GSC agent's momentum
//                  curve). No previous period -> 0.5, never a penalty.
//   intent         how close the searcher is to a real housing decision.
//   relevance      the GSC agent's editorialRelevance — LVINIT-ness.
//   cluster        the value of the editorial cluster it strengthens, plus a
//                  small bonus when Internal Linking says that cluster is weak.
//   distinctness   NEW: how distinct from existing pages (1 - best overlap).
//                  UPDATE/EXPAND: how specific the gap is (missing facets, a
//                  poor position on a page that should own the intent).
//   actionability  how cheap and safe the action is.
//   evidence       how much the evidence can be trusted: number of distinct
//                  queries, a previous period, persistence across runs, and
//                  GSC's own findings naming it.
//
// Weights differ for new content, updates, and everything else (config). Demand
// weight is 2 of ~14 — impressions alone can never carry an idea.
//
// Nothing here estimates leads, revenue, conversion, or search volume.
// ---------------------------------------------------------------------------

import { sizeComponent, positionPotentialComponent, momentumComponent } from "../../gsc/lib/score.mjs";

import { ACTIONS, NEW_ACTIONS, UPDATE_ACTIONS } from "../config.mjs";

const unit = (n) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);

const ACTIONABILITY = {
  [ACTIONS.EXPAND_EXISTING]: 0.9,
  [ACTIONS.UPDATE_EXISTING]: 0.85,
  [ACTIONS.NEW_COMPARISON]: 0.5,
  [ACTIONS.NEW_ARTICLE]: 0.45,
  [ACTIONS.INTERNAL_LINK_ONLY]: 1.0,
  [ACTIONS.MONITOR_ONLY]: 0.2,
  [ACTIONS.REJECT_DUPLICATE]: 0,
  [ACTIONS.REJECT_LOW_VALUE]: 0,
};

export function weightFamily(action) {
  if (NEW_ACTIONS.has(action)) return "new";
  if (UPDATE_ACTIONS.has(action)) return "update";
  return "other";
}

/** Evidence strength, 0-1. Every part is printed. */
export function evidenceComponent({ group, persistenceRuns = 1, gscFindingIds = [] }) {
  const distinctQueries = Math.min(1, (group.queries?.length ?? 0) / 4);
  const previous = group.metrics.hasPreviousPeriod ? 1 : 0;
  const persistence = Math.min(1, (persistenceRuns - 1) / 2);
  const named = gscFindingIds.length > 0 ? 1 : 0;
  return unit(0.35 * distinctQueries + 0.2 * previous + 0.3 * persistence + 0.15 * named);
}

/**
 * Score one classified opportunity.
 */
export function scoreOpportunity({ group, classification, coverage, persistenceRuns, gscFindingIds, clusterWeak, config }) {
  const s = config.scoring;
  const m = group.metrics;
  const action = classification.action;
  const family = weightFamily(action);
  const weights = s.weights[family];

  let distinctness;
  if (NEW_ACTIONS.has(action)) {
    distinctness = unit(1 - (coverage.best?.overlap ?? 0));
  } else if (UPDATE_ACTIONS.has(action)) {
    const facetGap = classification.missingFacets?.length ? 0.6 + 0.2 * Math.min(2, classification.missingFacets.length) : 0.4;
    const positionGap = Number.isFinite(classification.targetPosition) && classification.targetPosition > 10 ? 0.2 : 0;
    distinctness = unit(facetGap + positionGap);
  } else {
    distinctness = unit(1 - (coverage.best?.overlap ?? 0));
  }

  const values = {
    demand: sizeComponent(m.impressions, s.impressionReference),
    position: Number.isFinite(m.position) && m.position > 0 ? positionPotentialComponent(m.position, { sweetSpot: s.positionSweetSpot, horizon: s.positionHorizon }) : 0.5,
    growth: m.hasPreviousPeriod ? momentumComponent(m.impressions, m.previousImpressions, { saturation: s.trendSaturation }) : 0.5,
    intent: unit(group.intentDepth),
    relevance: unit(group.relevance),
    cluster: unit((config.editorial.clusterValue[group.cluster] ?? 0.35) + (clusterWeak ? s.weakClusterBonus : 0)),
    distinctness,
    actionability: ACTIONABILITY[action] ?? 0.3,
    evidence: evidenceComponent({ group, persistenceRuns, gscFindingIds }),
  };

  let num = 0;
  let den = 0;
  const breakdown = [];
  for (const [component, weight] of Object.entries(weights)) {
    if (!weight) continue;
    const value = values[component] ?? 0;
    num += weight * value;
    den += weight;
    breakdown.push({ component, weight, value: Number(value.toFixed(3)) });
  }
  const score = den > 0 ? Number(((100 * num) / den).toFixed(1)) : 0;
  for (const row of breakdown) row.sharePct = num > 0 ? Number(((row.weight * row.value * 100) / num).toFixed(1)) : 0;
  breakdown.sort((a, b) => b.weight * b.value - a.weight * a.value);
  return { score, family, weights, breakdown };
}

/**
 * Confidence: how much the RECOMMENDATION can be trusted. Not the idea's value.
 *
 * Starts from data volume on the intent group (the GSC agent's own 150 / 40
 * lines), then can only go DOWN:
 *
 *   * thin data seen in only one run can never be High — one low-volume week
 *     is not proof of durable demand. Medium-volume data becomes High only once
 *     it has persisted for `persistenceRunsForHigh` runs
 *   * a site-wide low-volume GSC window caps a single-run signal at Medium
 *   * an ambiguous duplicate check (overlap near a band edge) caps at Medium
 *   * a potential or observed cannibalization caps at Medium
 *   * unclear intent (grouped queries disagree) caps at Medium, or Low below 0.5
 *   * findings-only GSC input (no raw rows) caps at Medium
 */
export function confidenceFor({ group, coverage, persistenceRuns = 1, gsc, config }) {
  const c = config.confidence;
  const imp = group.metrics.impressions;
  const caveats = [];
  let level = imp >= c.highImpressions ? "high" : imp >= c.mediumImpressions ? "medium" : "low";
  const cap = (to, why) => {
    const order = { low: 0, medium: 1, high: 2 };
    if (order[level] > order[to]) level = to;
    caveats.push(why);
  };

  if (level === "medium" && persistenceRuns >= c.persistenceRunsForHigh) {
    level = "high";
    caveats.push(`medium volume, but seen in ${persistenceRuns} consecutive-or-recent runs — treated as durable`);
  }
  if (imp < c.mediumImpressions) caveats.push(`only ${imp} impressions on this intent — a signal, not a conclusion`);
  if (level === "high" && imp < c.highImpressions && persistenceRuns < c.persistenceRunsForHigh) cap("medium", "first time seen");
  if (gsc?.lowVolume && persistenceRuns < c.persistenceRunsForHigh) cap("medium", "LVINIT's whole GSC window is below the low-volume line and this has been seen once");
  if (!group.metrics.hasPreviousPeriod) caveats.push("no comparable previous-period data");
  if (coverage?.ambiguous) cap("medium", "the duplicate check sits near a band edge — a human should confirm the overlap verdict");
  if (coverage?.cannibalization?.status && coverage.cannibalization.status !== "none") cap("medium", `${coverage.cannibalization.status} cannibalization between existing pages`);
  if (group.intentClarity < 0.5) cap("low", `grouped queries disagree on intent (clarity ${group.intentClarity})`);
  else if (group.intentClarity < 0.7) cap("medium", `grouped queries only partly agree on intent (clarity ${group.intentClarity})`);
  if (gsc?.mode === "findings-only") cap("medium", "built from GSC findings only — the raw query rows were not in this report");

  return { level, caveats: [...new Set(caveats)] };
}
