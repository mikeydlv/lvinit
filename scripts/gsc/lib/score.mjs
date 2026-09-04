// ---------------------------------------------------------------------------
// OPPORTUNITY SCORING
//
// Every opportunity gets a 0-100 score that is a WEIGHTED AVERAGE of seven
// normalized components. Nothing is a black box: each opportunity carries its
// own component breakdown into the JSON and the Markdown, so "why is this #1"
// always has an arithmetic answer.
//
//   score = 100 * sum(weight_i * component_i) / sum(weight_i)
//
// The seven components
// --------------------
//   size               How much search demand is actually attached. Log curve
//                      over current impressions, saturating at
//                      scoring.impressionReference. Log, not linear, because on
//                      a young site the difference between 20 and 200
//                      impressions matters far more than 2000 vs 2200.
//
//   positionPotential  How much realistic ranking upside exists. Peaks at
//                      positionSweetSpot (page-2-ish: visible, climbable),
//                      falls off toward position 1 (little left to win) and
//                      past positionHorizon (not realistic yet).
//
//   ctrGap             How far below LVINIT's OWN position-band CTR baseline
//                      this row sits. 0 when there is no trustworthy baseline.
//                      No industry benchmark is used anywhere.
//
//   momentum           Signed period-over-period change, normalized. For
//                      "losing" opportunity types the sign is flipped so that
//                      a worse decline scores HIGHER (it is more urgent).
//
//   editorial          Relevance to LVINIT's stated editorial priorities.
//
//   intent             How close the query sits to a real housing/relocation
//                      decision. Not a lead or revenue estimate — a ranking
//                      signal only.
//
//   actionability      How cheap the fix is. Editing a page that already ranks
//                      is cheap; commissioning new content is not.
//
// Weights per type live in config.scoring.weights. A component with weight 0 is
// excluded from both numerator and denominator for that type.
// ---------------------------------------------------------------------------

/** Clamp to [0,1]. */
const unit = (n) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);

/**
 * Log-scaled demand. 0 impressions -> 0; `reference` impressions -> 1.
 * Above the reference it stays 1 (a bigger number does not make it more true).
 */
export function sizeComponent(impressions, reference) {
  const imp = Math.max(0, Number(impressions) || 0);
  const ref = Math.max(2, Number(reference) || 400);
  if (imp <= 0) return 0;
  return unit(Math.log1p(imp) / Math.log1p(ref));
}

/**
 * Realistic ranking upside from the current average position.
 * Triangular around the sweet spot: 0 at position 1, 1 at the sweet spot,
 * decaying to 0 at the horizon.
 */
export function positionPotentialComponent(position, { sweetSpot, horizon }) {
  const pos = Number(position);
  if (!Number.isFinite(pos) || pos <= 0) return 0;
  if (pos >= horizon) return 0;
  if (pos <= sweetSpot) {
    // Rising limb: position 1 has almost nothing left to gain.
    return unit((pos - 1) / Math.max(0.001, sweetSpot - 1));
  }
  // Falling limb: still winnable, but less so the further back it is.
  return unit((horizon - pos) / Math.max(0.001, horizon - sweetSpot));
}

/**
 * CTR shortfall against LVINIT's own band baseline.
 * @param {number} ctr        the row's CTR (0-1)
 * @param {number|null} baselineCtr  LVINIT's median CTR for that position band
 * @returns {number} 0 when at or above baseline, approaching 1 as CTR -> 0
 */
export function ctrGapComponent(ctr, baselineCtr) {
  if (!Number.isFinite(baselineCtr) || baselineCtr <= 0) return 0; // no trustworthy baseline
  const observed = Math.max(0, Number(ctr) || 0);
  if (observed >= baselineCtr) return 0;
  return unit((baselineCtr - observed) / baselineCtr);
}

/**
 * Period-over-period change, normalized to 0-1.
 *
 * @param {number} current
 * @param {number} previous
 * @param {object} opts
 * @param {number} opts.saturation  ratio of change that scores 1
 * @param {boolean} [opts.invert]   true for "losing" types, where decline scores high
 */
export function momentumComponent(current, previous, { saturation, invert = false }) {
  const cur = Number(current) || 0;
  const prev = Number(previous) || 0;
  let ratio;
  if (prev <= 0) {
    // Brand-new signal. Treat any real arrival as fully "moving", but only if
    // it actually arrived — 0 to 0 is not momentum.
    ratio = cur > 0 ? saturation : 0;
  } else {
    ratio = (cur - prev) / prev;
  }
  const directional = invert ? -ratio : ratio;
  return unit(directional / Math.max(0.001, saturation));
}

/**
 * How cheap is the recommended action.
 * These are ordering weights, not effort estimates in hours.
 */
export const ACTIONABILITY = {
  "optimize-existing-page": 0.95,
  "add-internal-links": 1.0,
  "investigate-existing-page": 0.7,
  "monitor-only": 0.3,
  "create-new-content": 0.35,
};

export function actionabilityComponent(recommendationKind) {
  return ACTIONABILITY[recommendationKind] ?? 0.5;
}

/**
 * Confidence tier from data volume. Kept SEPARATE from the score on purpose:
 * mixing them would hide a small-sample finding behind a middling number.
 */
export function confidenceFor({
  currentImpressions,
  hasPreviousPeriod,
  baselineSufficient = true,
  // Only CTR-driven findings lean on the baseline. Warning about a thin
  // baseline on a finding that never consulted it is noise.
  baselineRelevant = false,
  config,
}) {
  const { highImpressions, mediumImpressions } = config.scoring.confidence;
  const imp = Number(currentImpressions) || 0;
  let tier = "low";
  if (imp >= highImpressions) tier = "high";
  else if (imp >= mediumImpressions) tier = "medium";

  const caveats = [];
  if (!hasPreviousPeriod) {
    caveats.push("no comparable data in the previous period");
    if (tier === "high") tier = "medium";
  }
  if (baselineRelevant && !baselineSufficient) {
    caveats.push("LVINIT's own CTR baseline for this position band is too thin to trust");
    if (tier === "high") tier = "medium";
  }
  if (imp < mediumImpressions) {
    caveats.push(`only ${imp} impressions in the current window — treat as a signal, not a conclusion`);
  }
  return { level: tier, caveats };
}

/**
 * Score one opportunity.
 *
 * @param {object} input
 * @param {string} input.type                opportunity type key
 * @param {object} input.components          raw inputs (see below)
 * @param {object} input.config
 * @returns {{score:number, breakdown:Array, weights:object}}
 */
export function scoreOpportunity({ type, components, config }) {
  const weights = config.scoring.weights[type];
  if (!weights) throw new Error(`No scoring weights configured for opportunity type "${type}"`);

  const { impressionReference, positionSweetSpot, positionHorizon, trendSaturation } = config.scoring;
  const invertMomentum = type === "page-losing-momentum";

  const values = {
    size: sizeComponent(components.currentImpressions, impressionReference),
    positionPotential: positionPotentialComponent(components.currentPosition, {
      sweetSpot: positionSweetSpot,
      horizon: positionHorizon,
    }),
    ctrGap: ctrGapComponent(components.currentCtr, components.baselineCtr),
    momentum: momentumComponent(components.currentImpressions, components.previousImpressions, {
      saturation: trendSaturation,
      invert: invertMomentum,
    }),
    editorial: unit(components.editorialRelevance),
    intent: unit(components.intentDepth),
    actionability: actionabilityComponent(components.recommendationKind),
  };

  let numerator = 0;
  let denominator = 0;
  const breakdown = [];
  for (const [key, weight] of Object.entries(weights)) {
    if (!weight) continue;
    const value = values[key] ?? 0;
    numerator += weight * value;
    denominator += weight;
    breakdown.push({
      component: key,
      weight,
      value: Number(value.toFixed(3)),
      contribution: Number(((weight * value) / 1).toFixed(3)),
    });
  }
  const score = denominator > 0 ? (100 * numerator) / denominator : 0;

  // Contributions are only meaningful as a share of the total.
  for (const row of breakdown) {
    row.sharePct = denominator > 0 ? Number(((row.weight * row.value * 100) / (numerator || 1)).toFixed(1)) : 0;
  }

  return {
    score: Number(score.toFixed(1)),
    breakdown: breakdown.sort((a, b) => b.contribution - a.contribution),
    weights,
  };
}

/**
 * Build LVINIT's own CTR baseline from its own current-period query rows.
 *
 * Deliberately uses the impression-weighted MEDIAN, not the mean: on a small
 * site one runaway branded query would otherwise define the whole baseline.
 *
 * @returns {Map<string,{band:string, ctr:number|null, rows:number, impressions:number, sufficient:boolean}>}
 */
export function buildCtrBaseline(rows, config) {
  const { bands, minBaselineRows, minImpressions } = config.thresholds.ctr;
  const baseline = new Map();

  for (const band of bands) {
    const inBand = rows.filter(
      (r) =>
        Number(r.impressions) >= Math.min(minImpressions, config.thresholds.minImpressions) &&
        Number(r.position) > band.min &&
        Number(r.position) <= band.max
    );
    const totalImpressions = inBand.reduce((sum, r) => sum + Number(r.impressions), 0);
    const sufficient = inBand.length >= minBaselineRows;

    baseline.set(band.key, {
      band: band.key,
      ctr: sufficient ? weightedMedianCtr(inBand) : null,
      rows: inBand.length,
      impressions: totalImpressions,
      sufficient,
    });
  }
  return baseline;
}

/** Impression-weighted median CTR across rows. */
function weightedMedianCtr(rows) {
  if (rows.length === 0) return null;
  const sorted = [...rows].sort((a, b) => Number(a.ctr) - Number(b.ctr));
  const total = sorted.reduce((sum, r) => sum + Number(r.impressions), 0);
  if (total <= 0) return null;
  let running = 0;
  for (const row of sorted) {
    running += Number(row.impressions);
    if (running >= total / 2) return Number(row.ctr);
  }
  return Number(sorted[sorted.length - 1].ctr);
}

/** Which baseline band a position falls into. */
export function bandFor(position, config) {
  const pos = Number(position) || 0;
  const band = config.thresholds.ctr.bands.find((b) => pos > b.min && pos <= b.max);
  return band ? band.key : config.thresholds.ctr.bands[config.thresholds.ctr.bands.length - 1].key;
}
