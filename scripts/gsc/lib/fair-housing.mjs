// ---------------------------------------------------------------------------
// FAIR HOUSING FILTER
//
// This is a hard gate, not a scoring penalty. A query that trips it can never
// become a recommendation, no matter how much traffic it has.
//
// Two things are blocked:
//
//   1. PROTECTED CLASSES and their well-known coded proxies. The federal Fair
//      Housing Act protects race, color, religion, national origin, sex,
//      familial status, and disability; Nevada adds sexual orientation, gender
//      identity/expression, and ancestry. Real-estate advertising must not
//      steer on any of them, and "family-friendly", "safe", "good schools",
//      "young professionals" are the standard coded proxies that regulators and
//      NAR guidance treat as steering.
//
//   2. SAFETY / CRIME framing, which is the most common steering vector in
//      neighborhood content and is excluded here on the same grounds.
//
// The agent still SEES these queries in the data — it just refuses to turn them
// into a content recommendation, and reports the count so the exclusion is
// visible rather than silent.
//
// Blocking a term here does NOT mean the underlying subject can never be
// written about by a human. It means this agent will not propose it.
// ---------------------------------------------------------------------------

/**
 * Each rule is a category plus a regex. Regexes use word boundaries so
 * "familiar" does not trip "family" and "preschool" does not trip "school".
 */
export const FAIR_HOUSING_RULES = [
  {
    category: "familial-status",
    reason: "Familial status is a protected class — content cannot be framed around who lives there.",
    pattern: /\b(famil(y|ies|y\s*friendly)|kid|kids|child|children|child\s*friendly|kid\s*friendly|singles?|newlywed|couples?\s+only|adults?\s+only|no\s+kids)\b/i,
  },
  {
    category: "schools-as-ranking",
    reason: "Ranking areas by schools is a recognized proxy for familial status and race.",
    // "best schools in X" and "school ratings" steer; "school district calendar"
    // is just a fact someone is looking up, so the district word alone is not
    // enough to trip this.
    pattern: /\b(best|top|good|great|worst|bad)\b[^.?!]{0,25}\bschools?\b|\bschools?\b[^.?!]{0,15}\b(rank|ranked|ranking|rankings|rating|ratings|score|scores)\b/i,
  },
  {
    category: "safety-and-crime",
    reason: "Safety and crime framing is a standard steering proxy and is excluded from recommendations.",
    pattern: /\b(safe|safest|safety|unsafe|dangerous|danger|crime|crime\s*rate|sketchy|ghetto|rough|bad\s+area|good\s+area|nice\s+area|worst\s+part)\b/i,
  },
  {
    category: "race-ethnicity-national-origin",
    reason: "Race, color, ethnicity, ancestry and national origin are protected classes.",
    pattern: /\b(white|black|hispanic|latino|latina|asian|african|caucasian|mexican|filipino|chinese|indian|jewish|arab|immigrant|ethnic|minority|diverse\s+neighborhood|demographics?)\b/i,
  },
  {
    category: "religion",
    reason: "Religion is a protected class.",
    pattern: /\b(christian|catholic|mormon|lds|jewish|muslim|islamic|hindu|buddhist|church|temple|mosque|synagogue|congregation)\b/i,
  },
  {
    category: "age",
    reason: "Age-based framing (including 55+ and retiree targeting) is excluded from automated recommendations.",
    // "55+" ends in a non-word character, so it needs its own alternative — a
    // trailing \b would never match after the plus sign.
    pattern: /\b55\s*\+|\b(55\s*plus|senior|seniors|retiree|retirees|retirement\s+community|active\s+adult|young\s+professional|young\s+professionals|millennial|millennials|gen\s*z|boomer|boomers|elderly)\b/i,
  },
  {
    category: "disability",
    reason: "Disability is a protected class.",
    pattern: /\b(disabled|disability|handicap|handicapped|wheelchair|assisted\s+living|special\s+needs)\b/i,
  },
  {
    category: "sex-gender-orientation",
    reason: "Sex, gender identity/expression and sexual orientation are protected classes.",
    pattern: /\b(gay|lesbian|lgbt|lgbtq|transgender|men\s+only|women\s+only|bachelor|bachelorette)\b/i,
  },
  {
    category: "income-and-status-proxy",
    reason: "Income, immigration status and assistance-program framing act as protected-class proxies in housing advertising.",
    pattern: /\b(section\s*8|low\s*income|poor|welfare|food\s*stamps|undocumented|visa\s+holders?)\b/i,
  },
];

/**
 * Check a piece of text (usually a query) against every rule.
 * @returns {{blocked:boolean, category?:string, reason?:string, matched?:string}}
 */
export function checkFairHousing(text) {
  const value = String(text ?? "");
  for (const rule of FAIR_HOUSING_RULES) {
    const m = rule.pattern.exec(value);
    if (m) {
      return { blocked: true, category: rule.category, reason: rule.reason, matched: m[0] };
    }
  }
  return { blocked: false };
}

/**
 * Generic-filler guard. Not a compliance rule — an editorial one. LVINIT is not
 * a "best places to live" listicle site, so a query that is purely a generic
 * superlative round-up with no LVINIT-specific angle should not become a
 * new-content recommendation on keyword presence alone.
 *
 * This does NOT block the query from the report; it flags it so the scorer can
 * refuse to recommend "create new content" off the back of it.
 */
const GENERIC_FILLER = [
  /\b(best|top\s*\d*|worst)\b[^.?!]{0,20}\b(places?|cities|towns|suburbs|areas?)\b[^.?!]{0,20}\b(to\s+live|living)\b/i,
  /\btop\s*\d+\b/i,
  /\b(ultimate|complete)\s+(guide|list)\b/i,
];

export function isGenericFiller(text) {
  const value = String(text ?? "");
  return GENERIC_FILLER.some((re) => re.test(value));
}

/**
 * Partition a set of rows into allowed rows and Fair Housing exclusions.
 * @param {Array<object>} rows
 * @param {(row:object)=>string} getText
 */
export function partitionByFairHousing(rows, getText = (r) => r.query) {
  const allowed = [];
  const excluded = [];
  for (const row of rows) {
    const verdict = checkFairHousing(getText(row));
    if (verdict.blocked) excluded.push({ ...row, fairHousing: verdict });
    else allowed.push(row);
  }
  return { allowed, excluded };
}
