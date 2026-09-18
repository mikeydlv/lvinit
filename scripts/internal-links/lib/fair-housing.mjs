// ---------------------------------------------------------------------------
// FAIR HOUSING — the Internal Linking Agent's narrow prose normalization
//
// The rules themselves are the GSC Opportunity Agent's, reused unchanged from
// scripts/gsc/lib/fair-housing.mjs. That module is read, never modified: it was
// tuned for search QUERIES, and the other agents depend on it as it is.
//
// This agent checks editorial PROSE, where one objective housing term trips
// the familial-status rule on the word "family" alone: "single-family", the
// standard name for a detached property type ("the $490,000 single-family
// median"). It describes a building, not who lives in it.
//
// So before the shared check runs, and for this agent only, exactly that
// property-type term is neutralized. Nothing else is:
//
//   * only the hyphenated "single-family", or "single family" immediately
//     followed by a housing noun (home, house, residence, lot, ...) — a bare
//     "single family" can describe a household and is left for the filter
//   * every other word of the text is still checked, so "a single-family home,
//     perfect for families" is still blocked on "families"
//   * no rule is removed, loosened or reordered
// ---------------------------------------------------------------------------

import { checkFairHousing } from "../../gsc/lib/fair-housing.mjs";

/** Housing nouns that make an unhyphenated "single family" a property type. */
const HOUSING_NOUN =
  "(?:detached\\s+)?(?:homes?|houses?|residences?|residential|dwellings?|lots?|properties|property|units?|median|market|sales?|listings?|zoning|attached)";

const PROPERTY_TYPE_PATTERNS = [
  // "single-family", "single–family" (en dash), with or without a noun after it.
  /\bsingle[-‐‑–]family\b/gi,
  // "single family home", "single family detached home" — property type only
  // when a housing noun follows.
  new RegExp(`\\bsingle\\s+family(?=\\s+${HOUSING_NOUN}\\b)`, "gi"),
];

/**
 * Replace objective property-type terms with a neutral placeholder.
 * Exported so the tests can show exactly what is and is not rewritten.
 */
export function neutralizePropertyTypeTerms(text) {
  let out = String(text ?? "");
  for (const pattern of PROPERTY_TYPE_PATTERNS) out = out.replace(pattern, "detached-property-type");
  return out;
}

/**
 * The shared Fair Housing check, applied to prose after the narrow
 * property-type normalization above. Same return shape as `checkFairHousing`.
 */
export function checkFairHousingForLinks(text) {
  return checkFairHousing(neutralizePropertyTypeTerms(text));
}
