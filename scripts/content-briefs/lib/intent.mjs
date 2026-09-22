// ---------------------------------------------------------------------------
// INTENT NORMALIZATION + QUERY GROUPING
//
// The job: turn a pile of Search Console queries into a small number of
// underlying SEARCH INTENTS, so four phrasings of one question become one brief
// with four supporting queries instead of four briefs.
//
//   "summerlin vs southwest"            ┐
//   "southwest vs summerlin"            │  comparison: southwest + summerlin
//   "is southwest cheaper than summerlin"│  (cost recorded as a facet, not a
//   "summerlin or southwest las vegas"  ┘   separate intent)
//
// How it works — deliberately explainable, no model:
//
//   1. Normalize: lowercase, fold punctuation, drop years (kept as a flag).
//   2. Extract ENTITIES from a small explicit LVINIT vocabulary:
//        place:*    Summerlin, Henderson, Southwest, North Las Vegas, ...
//        subject:*  named projects: Monument Hills, Water Street, ...
//        concept:*  new construction, resale, rent, buy, property tax, ...
//        facet:*    cost, commute, daily life, ... — the ANGLE of the question
//   3. Decide the SHAPE: a comparison (two or more places or concepts set
//      against each other with vs / or / than / compare) or a topic.
//   4. The intent KEY is the shape plus the sorted entity set. For a comparison
//      the facets are NOT in the key — "is X cheaper than Y" and "X vs Y" are
//      the same decision, asked from a different side. For a topic they are,
//      because "henderson property tax" and "henderson commute" are different
//      questions about the same place.
//
// Every group carries its queries with their RAW metrics, so any grouping can
// be checked by eye in two seconds.
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";

import { tokenize } from "../../gsc/lib/text.mjs";
import { classifyIntent, editorialRelevance, topicCluster } from "../../gsc/lib/editorial.mjs";

/**
 * The entity vocabulary. `slug` is how the entity is written in an LVINIT
 * route, so a proposed slug and a coverage check both use LVINIT's own
 * spelling. Order matters: longer, more specific patterns first.
 */
export const ENTITIES = [
  // --- Places ---------------------------------------------------------------
  { key: "place:north-las-vegas", kind: "place", label: "North Las Vegas", slug: "north-las-vegas", pattern: /\b(north\s+las\s+vegas|north\s+vegas|nlv)\b/ },
  { key: "place:northwest", kind: "place", label: "Northwest Las Vegas", slug: "northwest-las-vegas", pattern: /\b(northwest|north\s+west|nw)\s+(las\s+vegas|vegas|valley)\b|\bcentennial\s+hills\b|\bskye\s+canyon\b/ },
  { key: "place:southwest", kind: "place", label: "Southwest Las Vegas", slug: "southwest-las-vegas", pattern: /\b(south\s?west|sw)(\s+(las\s+vegas|vegas|valley))?\b|\bmountains?\s+edge\b|\bsouthern\s+highlands\b|\brhodes\s+ranch\b|\benterprise\b/ },
  { key: "place:summerlin", kind: "place", label: "Summerlin", slug: "summerlin", pattern: /\bsummerlin\b/ },
  { key: "place:henderson", kind: "place", label: "Henderson", slug: "henderson", pattern: /\bhenderson\b|\bgreen\s+valley\b|\binspirada\b|\bcadence\b|\banthem\b|\blake\s+las\s+vegas\b/ },
  { key: "place:downtown", kind: "place", label: "Downtown Las Vegas", slug: "downtown-arts-district", pattern: /\bdowntown\b|\barts\s+district\b/ },
  { key: "place:spring-valley", kind: "place", label: "Spring Valley", slug: "spring-valley", pattern: /\bspring\s+valley\b/ },
  { key: "place:boulder-city", kind: "place", label: "Boulder City", slug: "boulder-city", pattern: /\bboulder\s+city\b/ },

  // --- Named subjects (development projects, named places LVINIT covers) ----
  { key: "subject:monument-hills", kind: "subject", label: "Monument Hills", slug: "monument-hills", pattern: /\bmonument\s+hills\b/, development: true },
  { key: "subject:water-street", kind: "subject", label: "the Water Street District", slug: "water-street-district", pattern: /\bwater\s+street\b/, development: true },
  { key: "subject:fiesta-henderson", kind: "subject", label: "the Fiesta Henderson site", slug: "fiesta-henderson", pattern: /\bfiesta\b/, development: true },
  { key: "subject:tule-springs", kind: "subject", label: "Tule Springs / Sandstone", slug: "tule-springs", pattern: /\btule\s+springs\b|\bsandstone\b/, development: true },
  { key: "subject:civic-center", kind: "subject", label: "One Civic Center", slug: "civic-center", pattern: /\bcivic\s+center\b/, development: true },
  { key: "subject:four-seasons", kind: "subject", label: "Four Seasons Private Residences", slug: "four-seasons", pattern: /\bfour\s+seasons\b/ },

  // --- Concepts — the housing decision itself --------------------------------
  { key: "concept:new-construction", kind: "concept", label: "new construction", slug: "new-build", pattern: /\bnew\s+(construction|builds?|homes?)\b|\bbuilders?\b|\bspec\s+homes?\b|\bnew-build\b/ },
  { key: "concept:resale", kind: "concept", label: "resale", slug: "resale", pattern: /\bresale\b|\bexisting\s+homes?\b|\bolder\s+homes?\b/ },
  { key: "concept:incentives", kind: "concept", label: "builder incentives", slug: "incentives", pattern: /\bincentives?\b|\bconcessions?\b|\bbuy\s?downs?\b/ },
  { key: "concept:rent", kind: "concept", label: "renting", slug: "rent", pattern: /\b(rent|renting|rental|rentals|lease|leasing)\b/ },
  { key: "concept:buy", kind: "concept", label: "buying", slug: "buy", pattern: /\b(buy|buying|purchase|purchasing)\b/ },
  { key: "concept:property-tax", kind: "concept", label: "property tax", slug: "property-tax", pattern: /\bproperty\s+tax(es)?\b|\btax\s+abatement\b|\babatement\b/ },
  { key: "concept:hoa", kind: "concept", label: "HOA fees", slug: "hoa", pattern: /\bhoas?\b|\bhomeowners?\s+association\b/ },
  { key: "concept:assessments", kind: "concept", label: "SID/LID assessments", slug: "sid-lid", pattern: /\b(sid|lid)s?\b|\bspecial\s+assessments?\b|\bspecial\s+improvement\b/ },
  { key: "concept:down-payment", kind: "concept", label: "down payments and assistance", slug: "down-payment", pattern: /\bdown\s*payments?\b|\bdpa\b|\bhome\s+is\s+possible\b/ },
  { key: "concept:starter-homes", kind: "concept", label: "starter homes", slug: "starter-homes", pattern: /\bstarter\s+homes?(\s+prices?)?\b|\bfirst\s+homes?\b|\b\$?[3-6]\d{2}k\b/ },
  { key: "concept:price-outlook", kind: "concept", label: "where prices are heading", slug: "price-outlook", pattern: /\b(prices?\s+)?(drop|dropping|fall|falling|crash|crashing|go(ing)?\s+down|go(ing)?\s+up|bubble|forecast|outlook|prediction)\b/ },
  { key: "concept:mortgage-rates", kind: "concept", label: "mortgage rates", slug: "mortgage-rates", pattern: /\bmortgage\s+rates?\b|\binterest\s+rates?\b|\bmortgage\b/ },
  { key: "concept:home-prices", kind: "concept", label: "home prices", slug: "home-prices", pattern: /\b(home|house|housing)\s+prices?\b|\bmedian\s+(home\s+)?price\b/ },
  { key: "concept:relocation", kind: "concept", label: "moving to Las Vegas", slug: "moving-to-las-vegas", pattern: /\b(moving|move|relocating|relocate|relocation)\s+(to|from|here)\b|\bnew\s+to\s+(las\s+)?vegas\b|\bmoving\s+to\b/ },
  { key: "concept:climate", kind: "concept", label: "summer heat", slug: "summer-heat", pattern: /\b(summer|heat|monsoon|hot|110)\b/ },
  { key: "concept:development", kind: "concept", label: "local development", slug: "development", pattern: /\b(development|redevelopment|master\s*plan(ned)?|being\s+built|under\s+construction|breaking\s+ground|coming\s+to|opening)\b/, development: true },
  { key: "concept:single-family", kind: "concept", label: "single-family homes", slug: "single-family-homes", pattern: /\bsingle[\s-]family\s+(homes?|houses?)\b/ },
  { key: "concept:condos", kind: "concept", label: "condos and townhomes", slug: "condos-townhomes", pattern: /\bcondos?\b|\btownhomes?\b|\btownhouses?\b/ },

  // --- Facets — the angle a question is asked from --------------------------
  { key: "facet:cost", kind: "facet", label: "cost", pattern: /\b(cost|costs|cheaper|cheapest|expensive|afford|affordable|affordability|price|prices|pricing|budget|how\s+much|worth\s+the\s+money)\b/ },
  { key: "facet:commute", kind: "facet", label: "commute and access", pattern: /\b(commute|commuting|drive|driving|traffic|beltway|215|i-?15|freeway|airport|to\s+the\s+strip|distance)\b/ },
  { key: "facet:daily-life", kind: "facet", label: "day-to-day life", pattern: /\b(living\s+in|live\s+in|daily\s+life|day\s+to\s+day|what\s+(is|it'?s)\s+like|really\s+like|pros\s+and\s+cons|worth\s+it|lifestyle)\b/ },
  { key: "facet:housing-stock", kind: "facet", label: "housing stock and lots", pattern: /\b(lot\s+sizes?|square\s+f\w*|sq\s*ft|single\s+story|two\s+story|yard|floor\s*plans?|garage|casita|acreage|home\s+sizes?)\b/ },
  { key: "facet:timing", kind: "facet", label: "timing", pattern: /\b(when\s+to|right\s+now|this\s+year|wait|waiting|forecast|next\s+year)\b/ },
];

const ENTITY_BY_KEY = new Map(ENTITIES.map((e) => [e.key, e]));

export function entityInfo(key) {
  return ENTITY_BY_KEY.get(key) ?? null;
}

/** Words that set two things against each other. */
const COMPARATOR = /\b(vs\.?|versus|or|compared\s+to|compare|comparing|comparison|than|difference\s+between|better)\b/;

/**
 * Normalize a raw query for matching. Years are removed from the text (a year
 * rarely changes the underlying decision) but remembered on the result.
 */
export function normalizeQuery(raw) {
  const original = String(raw ?? "");
  const years = [...original.matchAll(/\b(19|20)\d{2}\b/g)].map((m) => m[0]);
  const text = original
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\b(19|20)\d{2}\b/g, " ")
    .replace(/[^a-z0-9$'+\-\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { original, text, years };
}

/**
 * Extract entities. A matched span is blanked before the next pattern runs, so
 * "north las vegas" does not also count as a bare "las vegas" or "vegas".
 */
export function extractEntities(normalizedText) {
  let text = ` ${normalizedText} `;
  const found = [];
  for (const entity of ENTITIES) {
    const re = new RegExp(entity.pattern.source, "g");
    if (re.test(text)) {
      found.push(entity.key);
      text = text.replace(new RegExp(entity.pattern.source, "g"), " ");
    }
  }
  // "rent" alone in a comparison-less query about moving is renting; "buy"
  // alone is too generic to be a concept unless something else is set against
  // it. Kept simple: the pair logic in analyzeQuery decides.
  const residual = tokenize(text).filter((t) => t.length > 2);
  return { entities: found, residual };
}

/**
 * Analyze one query into its intent parts. Pure and deterministic.
 */
export function analyzeQuery(raw) {
  const { original, text, years } = normalizeQuery(raw);
  const { entities, residual } = extractEntities(text);

  const places = entities.filter((k) => k.startsWith("place:"));
  const subjects = entities.filter((k) => k.startsWith("subject:"));
  let concepts = entities.filter((k) => k.startsWith("concept:"));
  const facets = entities.filter((k) => k.startsWith("facet:"));

  const hasComparator = COMPARATOR.test(text);
  // A comparison needs two things on the same axis: two places, two subjects,
  // or two decision concepts (new vs resale, rent vs buy).
  const decisionConcepts = concepts.filter((k) =>
    ["concept:new-construction", "concept:resale", "concept:rent", "concept:buy", "concept:condos", "concept:single-family"].includes(k)
  );
  let shape = "topic";
  let compared = [];
  if (hasComparator && places.length >= 2) {
    shape = "comparison";
    compared = places;
  } else if (hasComparator && subjects.length >= 2) {
    shape = "comparison";
    compared = subjects;
  } else if (hasComparator && decisionConcepts.length >= 2) {
    shape = "comparison";
    compared = decisionConcepts;
  }

  // "buy" on its own names nothing — every housing query is about buying. It
  // only means something set against renting.
  if (!(shape === "comparison" && compared.includes("concept:buy"))) {
    concepts = concepts.filter((k) => k !== "concept:buy");
  }

  let keyParts;
  if (shape === "comparison") {
    keyParts = [...compared].sort();
  } else {
    keyParts = [...places, ...subjects, ...concepts, ...facets].sort();
    if (keyParts.length === 0) {
      // Nothing from the vocabulary. Fall back to the query's own distinctive
      // words, so unrelated generic queries never merge into one "generic" blob.
      keyParts = [...new Set(residual)].sort().map((t) => `term:${t}`);
    }
  }
  const key = `${shape}:${keyParts.join("+") || "empty"}`;

  const gscIntent = classifyIntent(original);
  const relevance = editorialRelevance(original);
  // The GSC agent's topicCluster misses "than"-style comparisons; the shape
  // decided here is authoritative for comparisons.
  let cluster = shape === "comparison" && places.length >= 2 ? "area-comparison" : topicCluster(original);
  if (shape === "comparison" && decisionConcepts.includes("concept:rent")) cluster = "rent-vs-buy";
  else if (shape === "comparison" && decisionConcepts.includes("concept:new-construction")) cluster = "new-vs-resale";
  else if (cluster === "general") cluster = clusterFromEntities({ places, subjects, concepts, facets });
  if (cluster === "area-comparison" && shape !== "comparison") cluster = clusterFromEntities({ places, subjects, concepts, facets });

  return {
    query: original,
    normalized: text,
    years,
    key,
    shape,
    compared,
    places,
    subjects,
    concepts,
    facets,
    residual,
    intent: shape === "comparison" ? "comparison" : gscIntent.intent,
    intentDepth: shape === "comparison" ? Math.max(0.85, gscIntent.depth) : gscIntent.depth,
    intentNote: gscIntent.note,
    relevance: relevance.offTopic ? relevance.score : Math.max(relevance.score, entityRelevance({ places, subjects, concepts })),
    relevanceMatched: relevance.matched,
    offTopic: relevance.offTopic,
    cluster,
    development: entities.some((k) => ENTITY_BY_KEY.get(k)?.development),
  };
}

/**
 * Relevance from LVINIT's own vocabulary. The GSC agent's editorialRelevance is
 * keyword-based and does not know LVINIT's named subjects ("monument hills"
 * scores 0.15 there), so a query naming a place, project or housing decision
 * LVINIT covers is floored here. Off-topic queries keep the GSC agent's cap.
 */
export function entityRelevance({ places = [], subjects = [], concepts = [] }) {
  if (places.length || subjects.length) return 0.85;
  const weights = { "concept:climate": 0.6 };
  return concepts.reduce((best, k) => Math.max(best, weights[k] ?? 0.75), 0);
}

/** Cluster from the entity set, for queries the GSC keyword rules call "general". */
export function clusterFromEntities({ places = [], subjects = [], concepts = [], facets = [] }) {
  const has = (k) => concepts.includes(k);
  if (subjects.some((k) => ENTITY_BY_KEY.get(k)?.development) || has("concept:development")) return "development";
  if (has("concept:relocation") || has("concept:climate")) return "relocation";
  if (has("concept:rent")) return "rent-vs-buy";
  if (has("concept:new-construction") || has("concept:resale") || has("concept:incentives")) return "new-vs-resale";
  if (facets.includes("facet:commute")) return "commute-access";
  if (
    has("concept:property-tax") || has("concept:hoa") || has("concept:assessments") ||
    has("concept:down-payment") || has("concept:starter-homes") || facets.includes("facet:cost")
  ) return "cost-of-housing";
  if (has("concept:mortgage-rates") || has("concept:home-prices")) return "market";
  if (places.length > 0 || subjects.length > 0) return "neighborhood-orientation";
  return "general";
}

/** Short, stable hash. */
export function shortHash(text) {
  return createHash("sha1").update(String(text)).digest("hex").slice(0, 12);
}

// ---------------------------------------------------------------------------
// NAVIGATIONAL / ADDRESS QUERIES
//
// "summerlin avenue" and "summerlin rd" are someone looking for a road. They
// are not the same question as "where is summerlin" or "summerlin nv
// neighborhood guide", and grouping them together drags a real neighborhood
// intent's clarity down (it did, in the 22 September 2026 run: clarity 0.6).
//
// The rule is deliberately NARROW, because LVINIT writes about roads all the
// time. A query is navigational only when BOTH hold:
//
//   1. a street NAME meets a street SUFFIX at the end of the query (allowing a
//      trailing city/state/ZIP), optionally with a house number in front, and
//   2. nothing in the query is about transportation, development, access,
//      traffic, construction, a neighborhood, or housing.
//
// So "summerlin parkway traffic", "road construction summerlin", "charleston
// boulevard redevelopment", "i-15 construction las vegas" and "water street
// district henderson" all stay — a roadway in a query is not noise by itself.
//
// An excluded query is NOT a Fair Housing exclusion and is not a judgement
// about the searcher. Its raw row is preserved and reported; it simply never
// counts toward editorial demand, scoring or confidence.
// ---------------------------------------------------------------------------

/** Suffixes that can END a street name. "trail" is deliberately absent — LVINIT writes about trails. */
const STREET_SUFFIX =
  "rd|road|st|street|ave|avenue|blvd|boulevard|dr|drive|ln|lane|ct|court|way|pkwy|parkway|hwy|highway|cir|circle|pl|place";

/** A house number at the front: "1234 summerlin avenue". */
const ADDRESS_PREFIX = /^\d{1,6}\s+\S/;

/**
 * Words that make a query editorial rather than an address lookup: it is about
 * getting somewhere, what is being built, what it is like, or living there.
 */
const EDITORIAL_CONTEXT =
  /\b(traffic|congestion|construction|closure|closures|closed|closing|widening|expansion|extension|improvements?|project|projects|redevelopment|development|corridor|interchange|exit|access|commute|commuting|drive\s+time|how\s+(do|to)\s+get|where\s+is|where's|directions|map|maps|guide|neighborhood|neighbourhood|area|areas|district|community|communities|suburb|zip|homes?|houses?|housing|condos?|townhomes?|apartments?|real\s+estate|rent|rental|renting|lease|buy|buying|price|prices|cost|costs|living|live|moving|move|relocat\w*|school|schools|park|parks|trail|trails|restaurants?|shops?|shopping|bus|rtc|transit|route)\b/;

/**
 * Is this query an address or street lookup rather than an editorial question?
 *
 * @param {string} normalizedText  the output of normalizeQuery().text
 * @param {string[]} entities      entities already extracted from it
 * @returns {{code:string, matched:string, kind:string}|null}
 */
export function classifyNavigational(normalizedText, entities = []) {
  const text = String(normalizedText ?? "").trim();
  if (!text) return null;

  // A query about transport, development, access or a neighborhood is never an
  // address lookup, however many road words it carries.
  if (EDITORIAL_CONTEXT.test(` ${text} `)) return null;
  // Neither is one that names a housing decision or an angle LVINIT covers.
  if (entities.some((k) => k.startsWith("concept:") || k.startsWith("facet:"))) return null;

  // A street name meeting a suffix, at the end of the query. A trailing city,
  // state or ZIP is allowed, because "summerlin avenue las vegas" is the same
  // lookup as "summerlin avenue".
  const tail = "(?:\\s+(?:las\\s+vegas|vegas|nv|nevada|henderson|summerlin|\\d{5}))*";
  const streetRe = new RegExp(`\\b([a-z][a-z'’-]*)\\s+(${STREET_SUFFIX})\\b${tail}\\s*$`);
  const m = streetRe.exec(text);
  if (!m) return null;

  return {
    code: "NAVIGATIONAL_STREET_QUERY",
    matched: `${m[1]} ${m[2]}`,
    kind: ADDRESS_PREFIX.test(text) ? "address lookup" : "street lookup",
  };
}

/**
 * Split raw query rows into the ones that carry editorial intent and the
 * navigational ones. Navigational rows keep their raw metrics for the report.
 */
export function partitionNavigational(rows = []) {
  const editorial = [];
  const navigational = [];
  for (const row of rows) {
    const { text } = normalizeQuery(row.query);
    const { entities } = extractEntities(text);
    const verdict = classifyNavigational(text, entities);
    if (verdict) navigational.push({ query: row.query, raw: { clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position }, ...verdict });
    else editorial.push(row);
  }
  return { editorial, navigational };
}

/**
 * Group query rows into intents.
 *
 * @param {Array<{query:string, clicks:number, impressions:number, ctr:number, position:number}>} currentRows
 *        RAW query-dimension rows, current window
 * @param {Array} previousRows  RAW query-dimension rows, previous window (may be empty)
 * @param {Array} currentPairs  RAW query+page rows, current window (may be empty)
 * @returns {Array<object>} groups, largest first
 */
export function groupQueries({ currentRows = [], previousRows = [], currentPairs = [] }) {
  const groups = new Map();
  const prevByQuery = new Map(previousRows.map((r) => [r.query, r]));

  for (const row of currentRows) {
    const analysis = analyzeQuery(row.query);
    if (!groups.has(analysis.key)) {
      groups.set(analysis.key, { key: analysis.key, queries: [], analyses: [] });
    }
    const group = groups.get(analysis.key);
    const prev = prevByQuery.get(row.query) ?? null;
    group.queries.push({
      query: row.query,
      raw: { clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position },
      previous: prev
        ? { clicks: prev.clicks, impressions: prev.impressions, ctr: prev.ctr, position: prev.position }
        : null,
      shape: analysis.shape,
      intent: analysis.intent,
      facets: analysis.facets,
      fairHousingBlocked: Boolean(row.fairHousingBlocked),
    });
    group.analyses.push(analysis);
  }

  // Queries that only exist in the previous window still belong to a group's
  // history (they count toward "previous" demand) but create no group.
  for (const prev of previousRows) {
    if (currentRows.some((r) => r.query === prev.query)) continue;
    const key = analyzeQuery(prev.query).key;
    const group = groups.get(key);
    if (group) group.previousOnly = [...(group.previousOnly ?? []), { query: prev.query, impressions: prev.impressions, clicks: prev.clicks }];
  }

  const out = [];
  for (const group of groups.values()) out.push(finalizeGroup(group, currentPairs));
  return out.sort((a, b) => b.metrics.impressions - a.metrics.impressions || a.key.localeCompare(b.key));
}

/** Aggregate one group. Aggregates are CALCULATED values and labelled so. */
function finalizeGroup(group, currentPairs) {
  const qs = group.queries.sort((a, b) => b.raw.impressions - a.raw.impressions);
  const impressions = qs.reduce((s, q) => s + q.raw.impressions, 0);
  const clicks = qs.reduce((s, q) => s + q.raw.clicks, 0);
  const weightedPos = impressions > 0 ? qs.reduce((s, q) => s + q.raw.position * q.raw.impressions, 0) / impressions : null;
  const prevImpressions =
    qs.reduce((s, q) => s + (q.previous?.impressions ?? 0), 0) +
    (group.previousOnly ?? []).reduce((s, q) => s + q.impressions, 0);
  const prevClicks =
    qs.reduce((s, q) => s + (q.previous?.clicks ?? 0), 0) +
    (group.previousOnly ?? []).reduce((s, q) => s + q.clicks, 0);
  const hasPrevious = qs.some((q) => q.previous) || (group.previousOnly ?? []).length > 0;

  // The lead analysis is the biggest query's; entity sets are the union.
  const lead = group.analyses.find((a) => a.query === qs[0].query) ?? group.analyses[0];
  const union = (field) => [...new Set(group.analyses.flatMap((a) => a[field]))].sort();

  // Intent clarity: share of the group's impressions whose query-level intent
  // agrees with the lead query's. 1.0 = every phrasing asks the same thing.
  const agreeing = qs.filter((q) => q.intent === lead.intent).reduce((s, q) => s + q.raw.impressions, 0);
  const clarity = impressions > 0 ? agreeing / impressions : 0;

  // Which LVINIT pages Google shows for these queries (query+page rows).
  const querySet = new Set(qs.map((q) => q.query));
  const pageMap = new Map();
  for (const pair of currentPairs) {
    if (!querySet.has(pair.query) || !pair.route) continue;
    const entry = pageMap.get(pair.route) ?? { route: pair.route, impressions: 0, clicks: 0, weightedPos: 0 };
    entry.impressions += pair.impressions;
    entry.clicks += pair.clicks;
    entry.weightedPos += pair.position * pair.impressions;
    pageMap.set(pair.route, entry);
  }
  const rankingPages = [...pageMap.values()]
    .map((p) => ({
      route: p.route,
      impressions: p.impressions,
      clicks: p.clicks,
      position: p.impressions > 0 ? Number((p.weightedPos / p.impressions).toFixed(1)) : null,
    }))
    .sort((a, b) => b.impressions - a.impressions);

  return {
    key: group.key,
    intentFingerprint: shortHash(group.key),
    shape: lead.shape,
    compared: lead.compared,
    places: union("places"),
    subjects: union("subjects"),
    concepts: union("concepts"),
    facets: union("facets"),
    intent: lead.intent,
    intentDepth: Math.max(...group.analyses.map((a) => a.intentDepth)),
    intentNote: lead.intentNote,
    intentClarity: Number(clarity.toFixed(2)),
    relevance: Math.max(...group.analyses.map((a) => a.relevance)),
    offTopic: group.analyses.every((a) => a.offTopic),
    cluster: lead.cluster,
    development: group.analyses.some((a) => a.development),
    leadQuery: qs[0].query,
    queries: qs,
    previousOnlyQueries: group.previousOnly ?? [],
    fairHousingBlocked: qs.some((q) => q.fairHousingBlocked),
    metrics: {
      scope: "query-dimension, summed across the grouped queries (calculated)",
      impressions,
      clicks,
      ctr: impressions > 0 ? Number((clicks / impressions).toFixed(4)) : 0,
      position: weightedPos !== null ? Number(weightedPos.toFixed(1)) : null,
      previousImpressions: hasPrevious ? prevImpressions : null,
      previousClicks: hasPrevious ? prevClicks : null,
      hasPreviousPeriod: hasPrevious,
    },
    rankingPages,
  };
}
