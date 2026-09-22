// ---------------------------------------------------------------------------
// DUPLICATE + CANNIBALIZATION CHECK
//
// Before any brief exists, every intent group is compared to EVERY published
// LVINIT page, and the relationship is named:
//
//   same                  the page already answers this intent
//   substantial           the page covers most of it — update/expand, never new
//   adjacent              related; link to it and differentiate from it
//   distinct              unrelated
//
// What is compared (the fields Mikey listed): route, title, H1, meta
// description, section headings, article text, category and topics. Each
// entity the intent is ABOUT is looked for in each field, and WHERE it appears
// decides how much it counts:
//
//   route / title / H1          1.0   a deliberate topical commitment
//   meta description, heading   0.7   a section of the page is about it
//   article text (≥ N mentions) 0.4   the page talks about it
//   article text (fewer)        0.15  a passing mention
//
// For a COMPARISON intent the page's shape matters too — a "Summerlin vs
// Southwest" question is not answered by a Summerlin pillar that mentions
// Southwest twice:
//
//   the same comparison (route sets exactly these places against each other)  × 1.0
//   a wider comparison that includes them (a three-way)                        × 0.7
//   a page with a heading setting them against each other                      × 0.8
//   anything else                                                              × 0.55
//
// Everything is printed with the brief, so a verdict can be argued with.
// ---------------------------------------------------------------------------

import { distinctiveTokens } from "../../internal-links/lib/topics.mjs";

import { entityInfo } from "./intent.mjs";

/**
 * Internal Linking topic keys that belong to each brief cluster — how the
 * "category / related topics" comparison is made in LVINIT's shared vocabulary.
 */
export const CLUSTER_TOPICS = {
  "area-comparison": ["theme:comparison"],
  relocation: ["theme:relocation"],
  "rent-vs-buy": ["theme:relocation", "theme:financing"],
  "new-vs-resale": ["theme:new-construction", "theme:resale"],
  development: ["theme:development"],
  "cost-of-housing": ["theme:property-tax", "theme:financing", "theme:starter-homes"],
  "commute-access": [],
  "neighborhood-orientation": [],
  market: ["theme:home-prices", "theme:mortgage-rates", "theme:market-forecast"],
  general: [],
};

/** The route's own words, minus the section prefix, years and generic terms. */
function routeWords(route) {
  const parts = String(route ?? "").split("/").filter(Boolean);
  if (["guides", "neighborhoods"].includes(parts[0])) parts.shift();
  return parts.join(" ").replace(/-/g, " ").replace(/\b(19|20)\d{2}\b/g, " ");
}

/**
 * Precision: how much of what the page's URL commits to is what the intent is
 * about. /neighborhoods/summerlin is 1.0 for a Summerlin question;
 * /neighborhoods/summerlin/fourth-of-july-parade is 0.25 — a child story is not
 * the page that answers "summerlin".
 */
export function routePrecision(route, coreKeys) {
  const text = ` ${routeWords(route).toLowerCase()} `;
  const total = distinctiveTokens(text);
  if (total.length === 0) return 1;
  let blanked = text;
  for (const key of coreKeys) {
    const info = entityInfo(key);
    if (info) blanked = blanked.replace(new RegExp(info.pattern.source, "g"), " ");
  }
  const remaining = distinctiveTokens(blanked);
  return Math.max(0, (total.length - remaining.length) / total.length);
}

const FIELD_WEIGHT = { commitment: 1.0, section: 0.7, body: 0.4, mention: 0.15 };

/** How strongly one page covers one entity, with the field that decided it. */
export function entityCoverage(page, entityKey, config) {
  const where = page.profile?.[entityKey];
  if (!where) return { value: 0, field: "absent" };
  if (where.route || where.headline) return { value: FIELD_WEIGHT.commitment, field: where.route ? "route" : "title/H1" };
  if (where.description || where.headings > 0) return { value: FIELD_WEIGHT.section, field: where.headings > 0 ? "heading" : "meta description" };
  if (where.body >= config.overlap.minBodyMentions) return { value: FIELD_WEIGHT.body, field: `article text (${where.body} mentions)` };
  if (where.body > 0) return { value: FIELD_WEIGHT.mention, field: "article text (passing mention)" };
  return { value: 0, field: "absent" };
}

/** The entities an intent is about — what a page must cover to answer it. */
export function coreEntities(group) {
  if (group.shape === "comparison") return [...group.compared];
  const core = [...group.places, ...group.subjects, ...group.concepts];
  return core.length ? core : [...group.facets];
}

/** Does any heading on the page set two of these entities against each other? */
function headingComparesThem(page, entities) {
  const labels = entities.map((k) => entityInfo(k)).filter(Boolean);
  return (page.headings ?? []).some((h) => {
    const text = ` ${h.toLowerCase()} `;
    const hits = labels.filter((e) => new RegExp(e.pattern.source).test(text));
    return hits.length >= 2 && /\b(vs\.?|versus|or|compared)\b/.test(text);
  });
}

/**
 * Overlap between one intent group and one page, 0-1, with its reasoning.
 */
export function pageOverlap(group, page, config) {
  const core = coreEntities(group);
  if (core.length === 0) return { route: page.route, overlap: 0, relation: "distinct", entities: [], shapeFactor: null, reasons: ["the intent names nothing from LVINIT's vocabulary"] };

  const entities = core.map((key) => ({ key, ...entityCoverage(page, key, config) }));
  let base = entities.reduce((s, e) => s + e.value, 0) / entities.length;
  const reasons = [];
  let shapeFactor = null;

  if (group.shape === "comparison" && group.compared.every((k) => k.startsWith("place:"))) {
    const pagePlaces = page.comparedPlaces ?? [];
    const exact = pagePlaces.length === group.compared.length && group.compared.every((k) => pagePlaces.includes(k));
    const superset = !exact && pagePlaces.length > group.compared.length && group.compared.every((k) => pagePlaces.includes(k));
    if (exact) {
      shapeFactor = 1.0;
      reasons.push("this page is the same comparison");
    } else if (superset) {
      shapeFactor = 0.7;
      reasons.push(`this page is a wider comparison (${pagePlaces.length} places) that includes these`);
    } else if (headingComparesThem(page, group.compared)) {
      shapeFactor = 0.8;
      reasons.push("a section heading on this page already sets them against each other");
    } else {
      shapeFactor = 0.55;
      reasons.push("not a comparison of these places");
    }
  } else if (group.shape === "comparison") {
    // Concept comparisons (new vs resale, rent vs buy): the page must commit to
    // BOTH sides, in its route or headline, to be the same piece.
    const committed = entities.filter((e) => e.value >= FIELD_WEIGHT.commitment).length;
    shapeFactor = committed === entities.length ? 1.0 : committed > 0 ? 0.75 : 0.55;
    reasons.push(
      committed === entities.length ? "this page commits to both sides in its route or headline" : committed > 0 ? "this page commits to one side" : "this page commits to neither side"
    );
  }

  // Topic intents: a page that commits to MORE than the intent (a comparison,
  // or a page about several things) covers it less precisely than a page about
  // exactly that. Precision = share of the page's route/headline commitments
  // that the intent is about.
  if (group.shape !== "comparison") {
    const precision = routePrecision(page.route, core);
    base *= 0.6 + 0.4 * precision;
    if (precision < 1) reasons.push(`the page's URL commits to more than this intent (precision ${precision.toFixed(2)})`);
    if ((page.comparedPlaces ?? []).length >= 2) {
      shapeFactor = 0.7;
      reasons.push("a comparison page answers a single-place question only in part");
    }
  }

  let overlap = shapeFactor === null ? base : base * shapeFactor;

  // Category / related topics: a page in the same editorial cluster is at
  // least ADJACENT (link to it, differentiate from it) — never more, on topic
  // alone.
  const clusterTopics = CLUSTER_TOPICS[group.cluster] ?? [];
  if (overlap < config.overlap.adjacent && clusterTopics.some((t) => (page.topics ?? []).includes(t))) {
    overlap = Math.min(config.overlap.adjacent + 0.05, overlap + 0.2);
    reasons.push("same editorial cluster (category / related topics)");
  }

  // A dated record (a monthly Market Watch piece) is never "the same" as an
  // evergreen question: its year and month are part of what it is, and the
  // Fact-Decay Agent's rule is that it is not rewritten to a newer period.
  if (page.datedRecord && overlap > config.overlap.same - 0.01) {
    overlap = Math.min(overlap, config.overlap.same - 0.01);
    reasons.push("dated record — capped below 'same'; it is not rewritten for newer demand");
  }

  overlap = Number(Math.min(1, overlap).toFixed(3));
  return {
    route: page.route,
    title: page.title,
    overlap,
    relation: relationFor(overlap, config),
    shapeFactor,
    entities: entities.map((e) => ({ entity: e.key, coverage: e.value, field: e.field })),
    reasons,
    datedRecord: page.datedRecord,
  };
}

export function relationFor(overlap, config) {
  if (overlap >= config.overlap.same) return "same";
  if (overlap >= config.overlap.substantial) return "substantial";
  if (overlap >= config.overlap.adjacent) return "adjacent";
  return "distinct";
}

/** Is this value close enough to a band edge that the verdict is shaky? */
export function nearBandEdge(overlap, config) {
  const m = config.overlap.ambiguityMargin;
  // Only the same/substantial edges change the action (update vs expand vs
  // new). The adjacent/distinct edge does not — both lead to the same place.
  return [config.overlap.same, config.overlap.substantial].some((edge) => Math.abs(overlap - edge) < m);
}

/**
 * The full duplicate / cannibalization check for one group.
 */
export function checkCoverage(group, inventory, config, { gscCannibalization = [] } = {}) {
  const scored = inventory.pages.map((page) => pageOverlap(group, page, config)).sort((a, b) => b.overlap - a.overlap || a.route.localeCompare(b.route));
  const best = scored[0] ?? null;
  const strong = scored.filter((s) => s.relation === "same" || s.relation === "substantial");
  const strongEvergreen = strong.filter((s) => !s.datedRecord);
  const adjacent = scored.filter((s) => s.relation === "adjacent");

  // Cannibalization: two or more existing, non-dated pages that each
  // substantially answer the intent. Search data upgrades "potential" to
  // "observed" when Google actually shows more than one of them for it.
  const rankingRoutes = new Set((group.rankingPages ?? []).filter((p) => p.impressions > 0).map((p) => p.route));
  // Only pages that each answer the SAME intent compete. Partial coverage — a
  // pillar's "vs" section, a wider comparison — is support, handled by expanding
  // the best page, not a conflict.
  const competing = strongEvergreen.filter((s) => s.relation === "same");
  let cannibalization = { status: "none", routes: [], reason: null };
  if (competing.length >= 2) {
    const observed = competing.filter((s) => rankingRoutes.has(s.route));
    cannibalization = {
      status: observed.length >= 2 ? "observed" : "potential",
      routes: competing.map((s) => s.route),
      reason:
        observed.length >= 2
          ? `Search Console shows ${observed.length} of these pages for the same queries, and each fully answers the intent.`
          : `${competing.length} existing pages each fully answer this intent. Creating another would add a third competitor.`,
    };
    // A clearly dominant page (well ahead of the rest) means the others are
    // supporting coverage — a pillar's "vs" section, a wider comparison — not
    // competitors. Only near-equals compete.
    const [first, second] = competing;
    if (first.overlap - second.overlap >= config.overlap.dominanceMargin) {
      cannibalization = { status: "none", routes: [], reason: `${first.route} clearly owns this intent (overlap ${first.overlap} vs ${second.overlap}); the others support it.` };
    }
  }

  // The GSC agent's own cannibalization finding is evidence in its own right:
  // it is measured, not inferred.
  if (cannibalization.status === "none" && gscCannibalization.length) {
    const f = gscCannibalization[0];
    const routes = (f.competingUrls ?? []).map((u) => u.route);
    cannibalization = {
      status: "observed",
      routes,
      reason: `The GSC Opportunity Agent's ${f.id} found ${routes.length} LVINIT URLs competing for "${f.query}" (${routes.join(", ")}).`,
      source: f.id,
    };
  }

  // What Google is showing vs what LVINIT would choose.
  const topRanking = (group.rankingPages ?? [])[0] ?? null;
  const rankingOverlap = topRanking ? scored.find((s) => s.route === topRanking.route) ?? null : null;
  const mismatch =
    topRanking && best && best.route !== topRanking.route && best.relation !== "distinct" && best.relation !== "adjacent" &&
    (rankingOverlap?.overlap ?? 0) < config.overlap.substantial
      ? { rankingRoute: topRanking.route, betterRoute: best.route, rankingOverlap: rankingOverlap?.overlap ?? 0, betterOverlap: best.overlap }
      : null;

  const verdict = best ? best.relation : "distinct";
  const ambiguous = best ? nearBandEdge(best.overlap, config) : false;

  return {
    verdict,
    intentRelation: {
      same: "the intent is the same as an existing page's",
      substantial: "the intent substantially overlaps an existing page",
      adjacent: "the intent is adjacent to existing coverage",
      distinct: "the intent is genuinely distinct from existing coverage",
    }[verdict],
    ambiguous,
    best,
    strong,
    adjacent: adjacent.slice(0, 5),
    topMatches: scored.slice(0, 5),
    cannibalization,
    mismatch,
    comparedAgainst: scored.length,
  };
}

/**
 * Facets of the intent the target page does not visibly address — the
 * "exact search intent missing" of an UPDATE/EXPAND brief.
 */
export function missingFacets(group, page, config) {
  return (group.facets ?? []).filter((facet) => entityCoverage(page, facet, config).value < FIELD_WEIGHT.section);
}

/** The page heading that best matches the intent — "the current relevant section". */
export function relevantSection(group, page) {
  const keys = [...coreEntities(group), ...(group.facets ?? [])];
  let best = null;
  for (const heading of page.headings ?? []) {
    const text = ` ${heading.toLowerCase()} `;
    const hits = keys.filter((k) => {
      const info = entityInfo(k);
      return info && new RegExp(info.pattern.source).test(text);
    }).length;
    if (hits > 0 && (!best || hits > best.hits)) best = { heading, hits };
  }
  return best?.heading ?? null;
}
