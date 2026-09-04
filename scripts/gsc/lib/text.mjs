// ---------------------------------------------------------------------------
// TEXT UTILITIES
//
// Small, boring string helpers shared by the detectors: tokenizing a query or a
// route, and measuring how topically close two pieces of text are.
//
// The similarity here is intentionally simple and explainable (weighted token
// overlap). The report tells Mikey the number and what it means; nothing
// pretends to be a semantic model.
// ---------------------------------------------------------------------------

/** Words that carry no topical signal in a search query. */
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "of", "in", "on", "at", "to", "for", "is", "are",
  "be", "was", "were", "do", "does", "did", "it", "its", "this", "that", "with",
  "from", "by", "as", "you", "your", "i", "my", "me", "we", "us", "how", "what",
  "when", "where", "which", "who", "why", "can", "should", "would", "will",
  "about", "near", "vs", "versus", "nv", "nevada",
]);

/** Terms that all LVINIT content shares, so they discriminate nothing. */
const AMBIENT_TERMS = new Set(["las", "vegas", "lasvegas", "lvinit", "vegass"]);

/** Cheap singular/plural folding so "neighborhoods" matches "neighborhood". */
function stem(word) {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 3 && word.endsWith("es") && !word.endsWith("ses")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

/**
 * Split text into comparable tokens.
 * @param {string} text
 * @param {{keepStopWords?:boolean, keepAmbient?:boolean}} [opts]
 */
export function tokenize(text, { keepStopWords = false, keepAmbient = false } = {}) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .filter((w) => keepStopWords || !STOP_WORDS.has(w))
    .filter((w) => keepAmbient || !AMBIENT_TERMS.has(w))
    .map(stem);
}

/**
 * Topical match between a query and a page, 0-1.
 *
 * Asymmetric on purpose: the question is "how much of the QUERY does this page
 * cover?", not "how similar are these two strings". A short query fully covered
 * by a page scores 1 even if the page is about more besides.
 *
 * Route segments are weighted a little above title words because a slug is a
 * deliberate topical commitment.
 */
export function topicalMatch(query, page) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0;

  const routeTokens = new Set(tokenize((page?.route || "").replace(/[/-]/g, " ")));
  const titleTokens = new Set(tokenize(page?.title || ""));
  const descTokens = new Set(tokenize(page?.description || ""));

  let score = 0;
  for (const token of queryTokens) {
    if (routeTokens.has(token)) score += 1;
    else if (titleTokens.has(token)) score += 0.85;
    else if (descTokens.has(token)) score += 0.5;
  }
  return Math.min(1, score / queryTokens.length);
}

/**
 * Words that appear in almost every LVINIT page title by house style. Left in,
 * they would make any two pages look related just because both are guides.
 */
const TITLE_BOILERPLATE = new Set([
  "guide", "map", "local", "community", "overview", "complete", "honest",
  "real", "actually", "living", "live", "home", "know", "everything",
]);

/** Jaccard similarity between two token sets. */
function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return shared / (a.size + b.size - shared);
}

/**
 * Relatedness between two LVINIT pages, 0-1.
 *
 * Route slugs carry most of the weight: a slug is a deliberate topical
 * commitment, whereas titles share house-style words across the whole site.
 * A shared neighborhood adds a bonus, because a place cluster is a real
 * relationship even when the words differ.
 */
export function pageRelatedness(a, b) {
  if (!a || !b || a.route === b.route) return 0;

  const routeTokens = (p) => new Set(tokenize((p.route || "").replace(/[/-]/g, " ")));
  const titleTokens = (p) =>
    new Set(tokenize(p.title || "").filter((token) => !TITLE_BOILERPLATE.has(token)));

  const routeScore = jaccard(routeTokens(a), routeTokens(b));
  const titleScore = jaccard(titleTokens(a), titleTokens(b));
  const sameNeighborhood = a.neighborhood && a.neighborhood === b.neighborhood ? 0.2 : 0;

  return Math.min(1, 0.7 * routeScore + 0.3 * titleScore + sameNeighborhood);
}

/** Does the query name two places against each other? */
export function looksLikeComparison(query) {
  return /\b(vs|versus|or|compared to|compare|better than|difference between)\b/i.test(String(query));
}

/** Trim a string for report tables without breaking mid-escape. */
export function truncate(text, max = 70) {
  const s = String(text ?? "");
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

/** Escape pipe characters so a value can't break a Markdown table row. */
export function escapeCell(text) {
  return String(text ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}
