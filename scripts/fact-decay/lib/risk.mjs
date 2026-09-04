// ---------------------------------------------------------------------------
// FACT-RISK MODEL
//
// Risk answers exactly one question:
//
//   If this specific sentence is wrong, how badly could it mislead a buyer,
//   renter, homeowner, or reader?
//
// It is NOT "how likely is this to be wrong" — that is staleness, and it lives
// in freshness.mjs. The two are kept apart on purpose. A mortgage rate quoted
// last week is high risk and low staleness. A restaurant's opening hours from
// two years ago are low risk and high staleness. Averaging them into one number
// would hide both.
//
// HOW A LEVEL IS REACHED
//
//   base            from the claim's category (categories.mjs baseRisk)
//   + escalators    things that make being wrong more consequential
//   - de-escalators the page is already honest about the uncertainty
//   = score 0-1     -> High / Medium / Low by the thresholds in config.risk
//
// Both adjustment sets are capped, so no claim can be talked all the way from
// Low to High on keyword stacking alone. Every adjustment that fired is recorded
// on the finding and printed in the report, so a "High" always has a reason
// attached and can be argued with.
//
// The three levels, in the brief's own words:
//
//   High    inaccuracy could materially mislead someone making a decision —
//           laws, financing rules, assistance eligibility, HOA fees, taxes,
//           project status, special assessments, mortgage rates, major pricing.
//   Medium  may affect a decision, unlikely to cause material harm if slightly
//           stale — construction timelines, openings, inventory references,
//           builder status, amenity availability.
//   Low     easy to update, unlikely to change a decision — dates in copy,
//           minor business details, descriptive detail that may have moved.
//
// Risk is never manufactured. A claim with a Low base and no escalators stays
// Low, and the report is allowed to be short.
// ---------------------------------------------------------------------------

const unit = (n) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);

/** Human-readable reasons, so the report never has to explain the code. */
const ESCALATOR_LABELS = {
  dollarAmount: "states a specific dollar amount someone could plan around",
  percentage: "states a specific percentage",
  obligation: "tells the reader what they must, cannot, or are not eligible to do",
  namedAuthority: "names a program, bill, or agency a reader could act on",
  hardDate: "carries a hard date that can simply pass",
};

const DE_ESCALATOR_LABELS = {
  hedged: "the figure is already hedged as approximate",
  tellsReaderToVerify: "the page already tells the reader to confirm it themselves",
  selfDated: "the claim dates itself, so a reader can see how old it is",
  carriesCaveat: "an explicit caveat is attached to the claim",
};

/**
 * Score one claim's risk.
 *
 * @param {object} opts
 * @param {object} opts.claim   from claims.mjs
 * @param {object} opts.config
 * @returns {{score:number, level:string, base:number, baseLevel:string,
 *            escalations:Array, deEscalations:Array, rationale:string}}
 */
export function scoreRisk({ claim, config }) {
  const baseLevel = claim.category.baseRisk;
  const base = config.risk.base[baseLevel] ?? config.risk.base.medium;

  const figures = claim.figures ?? { dollars: [], percents: [], dates: [] };
  const signals = claim.signals ?? {};

  // --- Escalators -----------------------------------------------------------
  const escalatorHits = [];
  if (figures.dollars.length) escalatorHits.push(["dollarAmount", figures.dollars[0]]);
  if (figures.percents.length) escalatorHits.push(["percentage", figures.percents[0]]);
  if (signals.obligation) escalatorHits.push(["obligation", null]);
  if (signals.namedAuthority) escalatorHits.push(["namedAuthority", null]);
  if (figures.dates.length && (signals.deadlineContext || signals.scheduledEventContext)) {
    escalatorHits.push(["hardDate", figures.dates[0].text]);
  }

  let escalationTotal = 0;
  const escalations = [];
  for (const [key, evidence] of escalatorHits) {
    const weight = config.risk.escalators[key] ?? 0;
    if (!weight) continue;
    const room = config.risk.maxEscalation - escalationTotal;
    if (room <= 0) break;
    const applied = Math.min(weight, room);
    escalationTotal += applied;
    escalations.push({ key, label: ESCALATOR_LABELS[key], delta: Number(applied.toFixed(3)), evidence });
  }

  // --- De-escalators --------------------------------------------------------
  const deEscalatorHits = [];
  if (signals.hedged) deEscalatorHits.push("hedged");
  if (signals.tellsReaderToVerify) deEscalatorHits.push("tellsReaderToVerify");
  if (signals.selfDated) deEscalatorHits.push("selfDated");
  if (signals.carriesCaveat) deEscalatorHits.push("carriesCaveat");

  let deEscalationTotal = 0;
  const deEscalations = [];
  for (const key of deEscalatorHits) {
    const weight = config.risk.deEscalators[key] ?? 0;
    if (!weight) continue;
    const room = config.risk.maxDeEscalation - deEscalationTotal;
    if (room <= 0) break;
    const applied = Math.min(weight, room);
    deEscalationTotal += applied;
    deEscalations.push({ key, label: DE_ESCALATOR_LABELS[key], delta: -Number(applied.toFixed(3)) });
  }

  const score = unit(base + escalationTotal - deEscalationTotal);
  const level =
    score >= config.risk.highThreshold ? "high" : score >= config.risk.mediumThreshold ? "medium" : "low";

  return {
    score: Number(score.toFixed(3)),
    level,
    base: Number(base.toFixed(3)),
    baseLevel,
    baseReason: claim.category.why,
    escalations,
    deEscalations,
    rationale: buildRationale({ claim, level, baseLevel, escalations, deEscalations }),
  };
}

/** One sentence explaining the level, for the report. */
function buildRationale({ claim, level, baseLevel, escalations, deEscalations }) {
  const parts = [
    `“${claim.category.label}” claims start at ${baseLevel} risk because ${lowerFirst(claim.category.why)}`,
  ];
  if (escalations.length) {
    parts.push(`This one is raised because it ${escalations.map((e) => e.label).join(", and ")}.`);
  }
  if (deEscalations.length) {
    parts.push(`It is lowered because ${deEscalations.map((d) => d.label).join(", and ")}.`);
  }
  if (!escalations.length && !deEscalations.length) {
    parts.push("Nothing in the sentence raises or lowers that.");
  }
  parts.push(`Final risk: ${level}.`);
  return parts.join(" ");
}

const lowerFirst = (s) => (s ? s[0].toLowerCase() + s.slice(1) : "");

/**
 * Fair Housing is NOT a risk level. A claim that trips the compliance filter is
 * routed to a separate compliance-review list with no automated recommendation
 * attached, because the right response is a human decision about advertising
 * law, not a freshness update. This helper exists so callers do not have to
 * remember that distinction.
 */
export const COMPLIANCE_ACTION = "manual-review-required";
