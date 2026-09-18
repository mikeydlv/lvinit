// ---------------------------------------------------------------------------
// TOPICS, ANCHOR PHRASES, AND THE GENERIC-WORD GUARD
//
// Two questions live here:
//
//   1. What is this page ABOUT?          -> a small, explicit LVINIT topic
//                                           vocabulary matched against route +
//                                           title + category
//   2. What words on another page would   -> anchor phrases derived from the
//      honestly name this page?              destination's slug and its own
//                                            headline, never invented
//
// The rule that keeps this from becoming keyword soup: a phrase or a token only
// counts if it is DISTINCTIVE. Every LVINIT page says "Las Vegas", "homes",
// "market", "guide" — those words relate nothing to anything, so they are
// stripped before any comparison and can never form an anchor on their own.
//
// Nothing here reads or writes files.
// ---------------------------------------------------------------------------

import { tokenize } from "../../gsc/lib/text.mjs";

/**
 * Words that appear across LVINIT's whole catalogue. Two pages sharing only
 * these are not related; an anchor made only of these is not descriptive.
 *
 * `tokenize` (reused from the GSC agent) already drops stop words and the
 * ambient "las"/"vegas"/"nevada" terms. This is the LVINIT-editorial layer on
 * top of it — the vocabulary of the site's own house style.
 */
export const GENERIC_TOKENS = new Set([
  "guide", "guides", "home", "homes", "house", "houses", "market", "real",
  "estate", "property", "properties", "buy", "buying", "buyer", "buyers",
  "sell", "selling", "seller", "sellers", "price", "prices", "pricing",
  "neighborhood", "neighborhoods", "area", "areas", "city", "valley", "local",
  "locals", "living", "live", "move", "moving", "place", "places", "new",
  "best", "top", "complete", "honest", "actually", "know", "everything",
  "thing", "things", "look", "looks", "year", "years", "month", "months",
  "day", "days", "week", "weeks", "people", "story", "stories", "feature",
  "page", "article", "read", "reading", "side", "sides", "one", "two", "three",
  // Filler that survives the stop-word list because it is not a function word,
  // but names nothing. LVINIT headlines are conversational, so these turn up a
  // lot: "Here's What's Actually There Now".
  "here", "there", "now", "then", "today", "still", "just", "also", "very",
  "really", "rather", "quite", "away", "back", "much", "whole", "own",
]);

/**
 * The same cheap singular/plural fold `tokenize` applies, repeated here because
 * the GSC agent does not export it and the generic list has to be compared
 * against STEMMED tokens. Without this, "guides" stems to "guid", which is not
 * in the list above, and the section prefix of every guide route survives as a
 * distinctive token — making every guide look related to every other guide.
 */
function stemLike(word) {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 3 && word.endsWith("es") && !word.endsWith("ses")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

const GENERIC_STEMS = new Set([...GENERIC_TOKENS].map(stemLike));

/** Strip generic tokens out of a token list. */
export function distinctiveTokens(text) {
  return tokenize(String(text ?? "").replace(/[/-]/g, " ")).filter(
    (t) => !GENERIC_TOKENS.has(t) && !GENERIC_STEMS.has(t) && t.length > 2
  );
}

/**
 * The LVINIT topic vocabulary.
 *
 * Deliberately small and explicit. This is not a classifier — it is a list of
 * the subjects LVINIT actually publishes about, so the agent can say "a
 * mortgage-rate piece and a financing piece are related" without having to
 * infer it from word overlap alone.
 *
 * `test` runs against `route + " " + title + " " + category`.
 */
export const TOPIC_RULES = [
  // --- Places -------------------------------------------------------------
  { key: "place:summerlin", label: "Summerlin", kind: "place", test: /\bsummerlin\b/i },
  { key: "place:henderson", label: "Henderson", kind: "place", test: /\bhenderson\b/i },
  { key: "place:southwest", label: "Southwest Las Vegas", kind: "place", test: /\bsouthwest\b/i },
  { key: "place:north-las-vegas", label: "North Las Vegas", kind: "place", test: /\bnorth-las-vegas\b|\bnorth las vegas\b|\bnorthwest\b/i },
  { key: "place:downtown", label: "Downtown / Arts District", kind: "place", test: /\bdowntown\b|\barts district\b/i },

  // --- Editorial themes ---------------------------------------------------
  { key: "theme:mortgage-rates", label: "Mortgage rates", kind: "theme", test: /\bmortgage\b|\binterest rate/i },
  { key: "theme:home-prices", label: "Home prices", kind: "theme", test: /\bhome-prices\b|\bhome prices\b|\bmedian price/i },
  { key: "theme:market-forecast", label: "Market outlook", kind: "theme", test: /\bwill-.*-drop\b|\bforecast\b|\bcrash\b|\bprices drop\b/i },
  { key: "theme:new-construction", label: "New construction", kind: "theme", test: /\bnew-build\b|\bnew build\b|\bnew-home\b|\bnew home sales\b|\bbuilder\b|\bnew construction\b/i },
  { key: "theme:resale", label: "Resale homes", kind: "theme", test: /\bresale\b|\bexisting home/i },
  { key: "theme:financing", label: "Financing and down payments", kind: "theme", test: /\bdown-payment\b|\bdown payment\b|\bassistance program\b|\bfinancing\b|\bloan\b/i },
  { key: "theme:property-tax", label: "Property tax", kind: "theme", test: /\bproperty-tax\b|\bproperty tax\b|\babatement\b/i },
  { key: "theme:starter-homes", label: "Starter homes and entry pricing", kind: "theme", test: /\bstarter-home\b|\bstarter home\b|\bentry-level\b|\b500k\b|\b\$500k\b/i },
  { key: "theme:relocation", label: "Moving and relocation", kind: "theme", test: /\bmoving\b|\brelocat|\bfirst summer\b|\bmoving here\b|\bshould you actually move\b/i },
  { key: "theme:comparison", label: "Neighborhood comparison", kind: "theme", test: /\bvs\b|\bversus\b|\bcomparison/i },
  { key: "theme:development", label: "Development and redevelopment", kind: "theme", test: /\bredevelopment\b|\bdevelopment\b|\bmaster-planned\b|\bmaster plan\b|\bcivic center\b|\bwater street\b|\btule springs\b|\bmonument hills\b|\bsandstone\b|\bfiesta\b/i },
  { key: "theme:climate", label: "Heat, climate and seasons", kind: "theme", test: /\bsummer\b|\bheat\b|\bmonsoon\b|\bclimate\b/i },
  { key: "theme:event", label: "Events", kind: "theme", test: /\bparade\b|\bfestival\b|\bfourth of july\b/i },
  { key: "theme:luxury", label: "Luxury residences", kind: "theme", test: /\bfour seasons\b|\bluxury\b|\bprivate residences\b/i },
];

/**
 * Topic affinity — how strongly two LVINIT subjects belong next to each other
 * in a reader's journey. Only pairs that are genuinely useful to a reader are
 * listed; anything not listed scores 0 from this signal (and can still qualify
 * on the anchor and paragraph evidence, which carry most of the weight).
 *
 * Symmetry is applied automatically below, so each pair is written once.
 */
const AFFINITY_PAIRS = [
  ["theme:new-construction", "theme:resale", 0.95],
  ["theme:new-construction", "theme:development", 0.8],
  ["theme:new-construction", "theme:home-prices", 0.6],
  ["theme:mortgage-rates", "theme:financing", 0.95],
  ["theme:mortgage-rates", "theme:home-prices", 0.8],
  ["theme:mortgage-rates", "theme:starter-homes", 0.7],
  ["theme:mortgage-rates", "theme:market-forecast", 0.7],
  ["theme:mortgage-rates", "theme:relocation", 0.5],
  ["theme:home-prices", "theme:market-forecast", 0.9],
  ["theme:home-prices", "theme:starter-homes", 0.85],
  ["theme:home-prices", "theme:resale", 0.7],
  ["theme:starter-homes", "theme:financing", 0.8],
  ["theme:property-tax", "theme:resale", 0.75],
  ["theme:property-tax", "theme:financing", 0.6],
  ["theme:comparison", "theme:relocation", 0.75],
  ["theme:relocation", "theme:climate", 0.7],
  ["theme:development", "theme:comparison", 0.4],
  ["theme:luxury", "theme:development", 0.5],
  ["theme:event", "theme:relocation", 0.4],
];

const AFFINITY = new Map();
const affinityKey = (a, b) => `${a}|${b}`;
for (const [a, b, weight] of AFFINITY_PAIRS) {
  AFFINITY.set(affinityKey(a, b), weight);
  AFFINITY.set(affinityKey(b, a), weight);
}

/** Every topic key this page carries. */
export function topicsFor({ route = "", title = "", category = "" } = {}) {
  const haystack = `${String(route).replace(/[/-]/g, " ")} ${route} ${title} ${category}`;
  return TOPIC_RULES.filter((rule) => rule.test.test(haystack)).map((rule) => rule.key);
}

/**
 * Topic affinity between two pages, 0-1.
 *
 * A shared topic is 1 — the same subject is the strongest relationship there
 * is. Otherwise the best listed pair wins. A place topic shared between a place
 * page and a theme page about that place is already covered by the shared-topic
 * rule, which is why the pair table only has to describe theme-to-theme moves.
 */
export function topicAffinity(sourceTopics, destinationTopics) {
  const src = sourceTopics ?? [];
  const dst = destinationTopics ?? [];
  if (src.length === 0 || dst.length === 0) return 0;
  let best = 0;
  for (const a of src) {
    for (const b of dst) {
      if (a === b) return 1;
      const weight = AFFINITY.get(affinityKey(a, b));
      if (weight && weight > best) best = weight;
    }
  }
  return best;
}

/** Route tokens with the section prefix, ambient terms and year numbers removed. */
export function slugTokens(route) {
  const parts = String(route ?? "").split("/").filter(Boolean);
  const slug = parts[parts.length - 1] ?? "";
  return slug
    .split("-")
    .map((t) => t.toLowerCase())
    .filter(Boolean)
    .filter((t) => !/^(las|vegas|nv|nevada)$/.test(t))
    .filter((t) => !/^(19|20)\d{2}$/.test(t));
}

/** Capitalized proper-noun runs in a headline, e.g. "Water Street District". */
export function properNounPhrases(title, { maxWords = 6 } = {}) {
  const text = String(title ?? "").replace(/[“”"']/g, " ");
  const phrases = [];
  const re = /\b([A-Z][a-z0-9]+(?:\s+(?:of|the|and|vs\.?|at)\s+)?(?:\s*[A-Z][a-z0-9]+)*)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const phrase = m[1].replace(/\s+/g, " ").trim();
    const words = phrase.split(" ");
    if (words.length < 1 || words.length > maxWords) continue;
    phrases.push(phrase);
  }
  return phrases;
}

/**
 * Calendar words. They are distinctive enough to survive the generic filter —
 * "August" really does tell you which report you are looking at — but they name
 * a date, not a subject, and a date makes a terrible anchor. Linking the word
 * "August" in "watch whether August and September hold onto July's pace" points
 * a reader at a page about something other than what they were reading.
 *
 * So they are barred from forming an anchor ON THEIR OWN. They are still
 * perfectly good topical evidence inside a longer phrase.
 */
export const CALENDAR_TOKENS = new Set([
  "january", "february", "march", "april", "may", "june", "july", "august",
  "september", "october", "november", "december",
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
  "spring", "summer", "fall", "autumn", "winter", "quarter", "q1", "q2", "q3", "q4",
]);

/** A bare number or a year is not a subject either. */
const NUMERIC = /^\d+$/;

/**
 * Is this phrase a real description of something, or site boilerplate?
 *
 * A phrase qualifies when at least one of its words is distinctive AND names a
 * subject rather than a date. "Las Vegas homes" has no distinctive word and
 * fails; "August 2026" has only calendar words and fails; "Water Street
 * District" passes.
 */
export function isDistinctivePhrase(phrase) {
  const tokens = distinctiveTokens(phrase);
  if (tokens.length === 0) return false;
  return tokens.some((t) => !CALENDAR_TOKENS.has(t) && !NUMERIC.test(t));
}

/**
 * Anchor phrases that would honestly name this destination.
 *
 * Three sources, all derived from the destination itself — nothing invented:
 *
 *   1. its slug, as leading n-grams  ("water street", "water street district")
 *   2. proper-noun runs in its own headline  ("Water Street District")
 *   3. `extraPhrases` from configuration, for the rare case a page's subject is
 *      genuinely not in either (empty by default)
 *
 * Each phrase carries `properName`, because a one-word anchor is only allowed
 * when the word is a proper name that IS the destination's subject.
 */
export function destinationPhrases(page, { maxWords = 6, extraPhrases = [] } = {}) {
  const out = new Map();
  const add = (phrase, source, properName) => {
    const cleaned = String(phrase ?? "").replace(/\s+/g, " ").trim();
    if (!cleaned) return;
    const words = cleaned.split(" ");
    if (words.length === 0 || words.length > maxWords) return;
    if (!isDistinctivePhrase(cleaned)) return;
    const key = cleaned.toLowerCase();
    const existing = out.get(key);
    if (existing) {
      existing.properName = existing.properName || properName;
      if (!existing.sources.includes(source)) existing.sources.push(source);
      return;
    }
    out.set(key, {
      phrase: cleaned,
      key,
      properName: Boolean(properName),
      sources: [source],
      tokens: distinctiveTokens(cleaned),
    });
  };

  // 1. Leading n-grams of the slug. The leading words of an LVINIT slug are its
  //    subject; the trailing ones are usually the geographic qualifier.
  const tokens = slugTokens(page.route);
  for (let n = Math.min(maxWords, tokens.length); n >= 1; n -= 1) {
    add(tokens.slice(0, n).join(" "), "slug", false);
  }

  // 2. Proper-noun runs from the page's own headline — but only the parts of
  //    them the slug agrees with.
  //
  //    LVINIT headlines are title-case sentences, so a capitalized run is not a
  //    proper noun: "Water Street District Just Survived" comes out as one run,
  //    and "What Is Actually There Now" comes out looking like a name. So each
  //    run is narrowed to its PREFIXES, and a prefix only survives if EVERY
  //    distinctive word in it also appears in the page's own slug. The slug is
  //    the page's deliberate statement of what it is about; anything the slug
  //    does not back up is sentence, not name.
  //
  //    Prefixes only, not every interior slice: a name starts where the
  //    capitalized run starts. Slicing from the middle produced "Street
  //    District" for the Water Street District guide, which is a fragment, not
  //    something anyone would click.
  const slugSet = new Set(tokens.flatMap((t) => distinctiveTokens(t)));
  for (const run of properNounPhrases(page.title, { maxWords: 12 })) {
    const words = run.split(" ");
    for (let len = Math.min(maxWords, words.length); len >= 1; len -= 1) {
      const phrase = words.slice(0, len).join(" ");
      const phraseTokens = distinctiveTokens(phrase);
      if (phraseTokens.length === 0) continue;
      if (!phraseTokens.every((t) => slugSet.has(t))) continue;
      // A name does not trail off. "Water Street District Just" passes the test
      // above only because "Just" is filtered out as filler before the
      // comparison — so the last word is checked on its own, and a prefix that
      // ends on a word the slug never mentions is a fragment, not a name.
      const lastWordTokens = distinctiveTokens(words[len - 1]);
      if (lastWordTokens.length === 0 || !lastWordTokens.every((t) => slugSet.has(t))) continue;
      add(phrase, "headline", true);
    }
  }

  // 3. Configured extras.
  for (const phrase of extraPhrases) add(phrase, "config", true);

  return [...out.values()].sort((a, b) => b.tokens.length - a.tokens.length || b.phrase.length - a.phrase.length);
}

/**
 * Anchor quality, 0-1.
 *
 * Two things make an anchor good: it names enough of the destination to be a
 * description rather than a hint, and it is specific rather than generic. The
 * measure is how much of the DESTINATION's distinctive vocabulary the anchor
 * carries, softened so that a single strong proper name ("Summerlin" for the
 * Summerlin pillar) still scores well.
 */
export function anchorQuality(phrase, destinationTokens) {
  const anchorTokens = distinctiveTokens(phrase);
  if (anchorTokens.length === 0) return 0;
  const dest = new Set(destinationTokens ?? []);
  if (dest.size === 0) return 0;
  let covered = 0;
  for (const token of new Set(anchorTokens)) if (dest.has(token)) covered += 1;
  if (covered === 0) return 0;
  const coverage = covered / dest.size;
  const specificity = covered / new Set(anchorTokens).size;
  // Coverage says "how much of the destination is named"; specificity says "how
  // much of the anchor is on-subject". A good anchor needs both, so they are
  // averaged rather than summed, then floored at the specificity — naming one
  // thing exactly is still a usable anchor.
  return Math.min(1, Math.max(specificity * 0.6, (coverage + specificity) / 2));
}
