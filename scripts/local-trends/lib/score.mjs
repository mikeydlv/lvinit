// ---------------------------------------------------------------------------
// CONTENT OPPORTUNITY SCORE — /40, computed in code
//
// Eight criteria, 1–5 each. Whoever proposes the numbers (the model, or the
// rules-only fallback), the TOTAL and the PRIORITY are always computed here,
// so a band can never be claimed without the arithmetic behind it.
//
//   34–40  P1  CREATE NOW
//   28–33  P2  STRONG OPPORTUNITY
//   22–27  P3  WATCH / POSSIBLE
//   <22        IGNORE
//
// Two caps sit on top of the arithmetic:
//   * a RUMORED / UNCONFIRMED project is never CREATE NOW
//   * rules-only mode (no model) is never CREATE NOW — it cannot judge an angle
// ---------------------------------------------------------------------------

import { RUMORED } from "./status.mjs";

export const CRITERIA = [
  { key: "local_relevance", label: "Local relevance" },
  { key: "relocation_value", label: "Relocation value" },
  { key: "conversation_potential", label: "Conversation potential" },
  { key: "visual_potential", label: "Visual potential" },
  { key: "evergreen_value", label: "Evergreen value" },
  { key: "real_estate_connection", label: "Real estate connection" },
  { key: "novelty", label: "Novelty" },
  { key: "lvinit_fit", label: "LVINIT fit" },
];

export const PRIORITY_LABEL = {
  P1: "P1 — CREATE NOW",
  P2: "P2 — STRONG OPPORTUNITY",
  P3: "P3 — WATCH / POSSIBLE",
  IGNORE: "IGNORE",
};

/** Clamp every criterion to an integer 1–5; a missing one scores 1. */
export function cleanScores(raw = {}) {
  const out = {};
  for (const { key } of CRITERIA) {
    const n = Math.round(Number(raw[key]));
    out[key] = Number.isFinite(n) ? Math.min(5, Math.max(1, n)) : 1;
  }
  return out;
}

export function totalOf(scores) {
  return CRITERIA.reduce((sum, { key }) => sum + scores[key], 0);
}

export function bandFor(total, bands) {
  if (total >= bands.p1) return "P1";
  if (total >= bands.p2) return "P2";
  if (total >= bands.p3) return "P3";
  return "IGNORE";
}

const ORDER = ["P1", "P2", "P3", "IGNORE"];
const lower = (a, b) => (ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b);

/**
 * @returns {{total:number, band:string, priority:string, capped:string|null}}
 */
export function prioritize({ scores, status, kind }, config, { rulesOnly = false } = {}) {
  const total = totalOf(scores);
  const band = bandFor(total, config.scoring.bands);
  let priority = band;
  let capped = null;
  if (kind === "project" && status === RUMORED && ORDER.indexOf(priority) < ORDER.indexOf(config.scoring.rumoredMaxPriority)) {
    priority = lower(priority, config.scoring.rumoredMaxPriority);
    capped = "unconfirmed — verify before creating";
  }
  if (rulesOnly && ORDER.indexOf(priority) < ORDER.indexOf(config.scoring.rulesOnlyMaxPriority)) {
    priority = lower(priority, config.scoring.rulesOnlyMaxPriority);
    capped = capped ?? "rules-only mode cannot judge the angle";
  }
  return { total, band, priority, capped };
}
