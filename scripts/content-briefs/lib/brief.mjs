// ---------------------------------------------------------------------------
// BRIEF GENERATION
//
// A brief is a structured editorial assignment, NOT an article. It says what the
// search demand is, what LVINIT already has, what the piece must do that the
// existing pages do not, and what the Publisher must research — then stops.
//
// Everything here is deterministic and template-driven from the intent's
// entities and LVINIT's real inventory. It states no fact about Las Vegas: no
// price, no drive time, no date, no project status. Where a piece will need
// one, the brief lists it as a RESEARCH REQUIREMENT for the Publisher.
//
// Working titles follow LVINIT's voice ("What Actually Changes Day to Day"),
// never content-farm patterns ("10 Best…", "Ultimate Guide…"). Every generated
// title, angle and heading is re-checked against the Fair Housing rules and
// the generic-topic guard before it is allowed out.
// ---------------------------------------------------------------------------

import { topicsFor, topicAffinity } from "../../internal-links/lib/topics.mjs";

import { ACTIONS, NEW_ACTIONS, UPDATE_ACTIONS } from "../config.mjs";
import { entityInfo } from "./intent.mjs";
import { coreEntities } from "./coverage.mjs";
import { facetLabel, fairHousingCheck, isGenericTopic } from "./classify.mjs";

const label = (key) => entityInfo(key)?.label ?? key.split(":")[1];
const bare = (text) => String(text).replace(/^the\s+/i, "");
const cap = (text) => String(text).charAt(0).toUpperCase() + String(text).slice(1);
const listOf = (items) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);

// ---------------------------------------------------------------------------
// Slug
// ---------------------------------------------------------------------------

/**
 * Propose a slug in LVINIT's existing style:
 *   /guides/henderson-vs-southwest-las-vegas, /guides/new-build-vs-resale-las-vegas
 * A slug that would collide with an existing route gets a numeric suffix — but a
 * collision usually means the intent was not new, which classification catches.
 */
export function proposeSlug(group, existingRoutes = new Set()) {
  const slugOf = (key) => entityInfo(key)?.slug ?? key.split(":")[1];
  let parts;
  if (group.shape === "comparison") {
    const ordered = orderedCompared(group);
    parts = [ordered.map(slugOf).join("-vs-")];
  } else {
    const keys = [...group.subjects, ...group.places, ...group.concepts];
    parts = keys.slice(0, 3).map(slugOf);
    if (group.facets.includes("facet:cost") && !parts.some((p) => /cost|price|tax|hoa/.test(p))) parts.push("costs");
    if (group.facets.includes("facet:commute")) parts.push("commute");
  }
  let slug = parts.join("-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!/las-vegas|henderson|summerlin|north-las-vegas/.test(slug)) slug = `${slug}-las-vegas`;
  slug = slug.replace(/(las-vegas-)+las-vegas/g, "las-vegas");
  let route = `/guides/${slug}`;
  let n = 2;
  while (existingRoutes.has(route)) {
    route = `/guides/${slug}-${n}`;
    n += 1;
  }
  return { slug: route.split("/").pop(), route };
}

/** Comparison entities in the order the biggest query named them. */
function orderedCompared(group) {
  const lead = String(group.leadQuery).toLowerCase();
  return [...group.compared].sort((a, b) => {
    const ia = lead.search(new RegExp(entityInfo(a)?.pattern.source ?? "$^"));
    const ib = lead.search(new RegExp(entityInfo(b)?.pattern.source ?? "$^"));
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
  });
}

// ---------------------------------------------------------------------------
// Titles, questions, angles
// ---------------------------------------------------------------------------

/** LVINIT-voiced working title. A proposal; the Publisher owns the final one. */
export function workingTitle(group) {
  const facets = group.facets;
  if (group.shape === "comparison") {
    const [a, b] = orderedCompared(group).map((k) => cap(bare(label(k))));
    if (group.cluster === "rent-vs-buy") return "Rent First or Buy Right Away? What Actually Changes When You're New to Las Vegas";
    if (group.cluster === "new-vs-resale") return `${a} or ${b}: What Las Vegas Buyers Still Need to Compare`;
    if (facets.includes("facet:cost")) return `${a} vs ${b}: What the Money Actually Buys You Day to Day`;
    if (facets.includes("facet:commute")) return `${a} vs ${b}: What Your Commute and Routine Actually Look Like`;
    return `${a} vs ${b}: What Actually Changes Day to Day`;
  }
  const subject = group.subjects[0] ? label(group.subjects[0]) : null;
  const place = group.places[0] ? label(group.places[0]) : null;
  const concepts = group.concepts;
  if (subject && group.development) return `What ${cap(subject)} Could Change on This Side of Las Vegas`;
  if (concepts.includes("concept:incentives")) return "New Build Incentives Look Great — Here's What Buyers Still Need to Compare";
  if (concepts.includes("concept:relocation") && place) return `What Moving to ${place} Actually Changes About Daily Life`;
  if (concepts.includes("concept:relocation")) return "What Moving to Las Vegas Actually Changes — and What People Get Wrong First";
  if (facets.includes("facet:commute") && place) return `What Living in ${place} Means for Your Daily Drive`;
  if (concepts.includes("concept:property-tax") || concepts.includes("concept:hoa") || concepts.includes("concept:assessments")) {
    const what = concepts.filter((c) => ["concept:property-tax", "concept:hoa", "concept:assessments"].includes(c)).map((c) => label(c));
    return `${cap(listOf(what))}${place ? ` in ${place}` : " in Las Vegas"}: What Buyers Misunderstand Before They Buy`;
  }
  if (concepts.includes("concept:new-construction") && place) return `Buying New in ${place}: What Actually Changes Versus the Established Neighborhoods`;
  if (place && facets.includes("facet:daily-life")) return `${place}, Day to Day: What Buyers Misunderstand Before Moving`;
  if (place && facets.includes("facet:cost")) return `What Living in ${place} Actually Costs — and What Drives It`;
  if (place && concepts.length) return `${cap(listOf(concepts.map(label)))} in ${place}: What Buyers Should Actually Weigh`;
  if (place) return `${place}, Day to Day: What Buyers Misunderstand Before Moving`;
  if (concepts.length) return `${cap(listOf(concepts.map(label)))} in Las Vegas: What Actually Matters for Your Decision`;
  return null;
}

/** The single question the piece exists to answer. */
export function primaryQuestion(group) {
  if (group.shape === "comparison") {
    const [a, b] = orderedCompared(group).map(label);
    if (group.cluster === "rent-vs-buy") return "Should someone new to Las Vegas rent first or buy right away — and what actually decides it?";
    const facetTail = group.facets.length ? `, especially on ${listOf(group.facets.map(facetLabel))}` : "";
    return `How do ${a} and ${b} actually differ for someone deciding where to live${facetTail}?`;
  }
  const focus = listOf([...group.subjects, ...group.places, ...group.concepts].map(label)) || group.leadQuery;
  if (group.development) return `What is actually happening with ${focus}, and what could it change for people who live nearby or are deciding where to buy?`;
  if (group.concepts.includes("concept:relocation")) {
    const place = group.places[0] ? label(group.places[0]) : "Las Vegas";
    return `What actually changes when someone moves to ${place} — and what do newcomers misjudge first?`;
  }
  if (group.facets.includes("facet:cost")) return `What does ${focus} actually cost, and what drives that cost?`;
  if (group.intent === "relocation-decision") return `What does ${focus} actually involve for someone moving to Las Vegas?`;
  return `What does someone deciding where to live need to understand about ${focus}?`;
}

const CLUSTER_WHY = {
  "area-comparison": "Comparisons are the decision LVINIT exists to help with: two real places, set against each other on how daily life actually differs.",
  relocation: "Relocation questions are LVINIT's core reader — someone not here yet, trying to understand what changes.",
  "rent-vs-buy": "Rent-first versus buy-first is one of the most consequential early decisions a newcomer makes, and it is rarely answered locally.",
  "new-vs-resale": "New construction versus established neighborhoods is a defining Las Vegas tradeoff, and LVINIT is building that cluster on purpose.",
  development: "Local development changes where people choose to live; LVINIT covers it from the resident's side, not the press release's.",
  "cost-of-housing": "How costs shape the housing decision is practical, local, and badly explained elsewhere.",
  "commute-access": "Commute and access are what a map does not show a newcomer until they have already signed.",
  "neighborhood-orientation": "Area-specific realities are what LVINIT's neighborhood coverage is for.",
  market: "Market questions matter when they are turned into what the numbers mean for someone actually deciding.",
  general: "It connects to LVINIT's coverage only loosely.",
};

/** The LVINIT-specific angle — what makes this ours rather than a keyword page. */
export function editorialAngle(group) {
  if (group.shape === "comparison" && group.cluster === "area-comparison") {
    const [a, b] = orderedCompared(group).map(label);
    const facet = group.facets.includes("facet:cost")
      ? " Lead with what the money actually buys in each — housing stock, lot sizes, age of homes, HOA and assessment structure — not a headline median."
      : group.facets.includes("facet:commute")
        ? " Lead with what the drive and the daily routine look like from each, at real times of day."
        : "";
    return `Not "which is better." What actually changes day to day if you live in ${a} instead of ${b}: the drive, the errands, the housing stock, the costs you carry, and the tradeoffs each asks you to accept.${facet} Written for someone choosing between them, from someone who knows both.`;
  }
  if (group.cluster === "rent-vs-buy") return "What renting first actually buys a newcomer (time to learn the valley, flexibility on area) against what it costs (rent, a second move, rate and price risk) — as a decision framework, not a verdict.";
  if (group.cluster === "new-vs-resale") return "What buyers misunderstand about new construction versus established homes here: incentives versus total cost, lot sizes, HOA and assessment structures, location tradeoffs, and what 'new' actually means for daily life.";
  if (group.development) return "What is real now (approved, funded, under construction) versus what is announced or rumored — and what it could change for the people who live nearby. Primary sources only; clearly separate fact from plan.";
  if (group.cluster === "cost-of-housing") return "What a buyer misunderstands about this cost before they buy, how it actually works in Clark County, and how it changes the housing decision — explained, not quoted.";
  if (group.cluster === "commute-access") return "What the commute and access actually look like from here — the routes, the pinch points, the times of day — and how that should change where someone chooses to live.";
  if (group.cluster === "relocation") return "What actually changes about daily life after a move here, and the first things newcomers misjudge — practical, local, and honest.";
  if (group.cluster === "market") return "What the current numbers actually mean for someone deciding whether and where to buy — not a market recap.";
  return "What someone deciding where to live actually needs to understand here, from someone who lives it.";
}

/** What the piece must NOT turn into. */
export function mustNotBecome(group) {
  const list = [
    "a generic 'best places' or 'top 10' listicle",
    "a keyword page that answers the query in one line and pads the rest",
    "a restatement of an existing LVINIT page — link to it instead",
    "anything framed around who lives there, school rankings, or safety (Fair Housing)",
    "a vehicle for invented figures — every number must come from a current, cited source",
  ];
  if (group.shape === "comparison") list.unshift("a 'which is better' ranking with a winner");
  if (group.development) list.unshift("a press release, or a story that treats a proposal as a certainty");
  if (group.cluster === "market" || group.cluster === "cost-of-housing") list.push("a market forecast, or a promise about where prices or rates are going");
  return list;
}

const FACET_QUESTIONS = {
  "facet:cost": [
    "What actually drives the cost difference — purchase price, price per square foot, lot size, age of the housing stock, HOA dues, SID/LID assessments, property tax?",
    "What would a buyer carry every month in each, beyond the mortgage payment?",
  ],
  "facet:commute": [
    "What do the drives to the Strip, the airport and the main employment corridors actually look like at rush hour?",
    "Which freeways and interchanges does daily life depend on, and where are the pinch points?",
  ],
  "facet:daily-life": ["What does a normal weekday actually look like — errands, groceries, parks, the drive home?"],
  "facet:housing-stock": ["What housing stock dominates — age, lot sizes, single-story versus two-story, and how that changes the price?"],
  "facet:timing": ["What should change the timing of this decision, and what should not?"],
};

const CLUSTER_QUESTIONS = {
  relocation: [
    "What changes first in daily life after the move — the heat, the driving, the way the valley is laid out?",
    "What do newcomers most often get wrong about choosing an area before they know the valley?",
    "What practical steps have deadlines or local rules a newcomer needs to know about?",
  ],
  "cost-of-housing": [
    "How does this cost actually work in Clark County, and who sets it?",
    "What do buyers most often misunderstand about it before closing?",
    "How should it change the way someone compares two homes?",
  ],
  "commute-access": ["What does the daily drive actually look like, and what would change it?"],
  "neighborhood-orientation": ["What do people misunderstand about this area before they move?", "What is the tradeoff this area asks you to accept?"],
  market: ["What do the current numbers actually mean for someone deciding now?", "What would change that reading?"],
};

/** The questions the piece must answer. */
export function keyQuestions(group) {
  const qs = [primaryQuestion(group)];
  if (group.shape === "comparison" && group.cluster === "area-comparison") {
    const [a, b] = orderedCompared(group).map(label);
    qs.push(`What does someone gain by choosing ${a}, and what do they give up?`);
    qs.push(`What does someone gain by choosing ${b}, and what do they give up?`);
    qs.push("What do people most often misunderstand about the difference before they move?");
  }
  if (group.cluster === "rent-vs-buy") qs.push("What does renting first cost in real terms, and what does it protect against?", "What would make buying right away the better call?");
  if (group.cluster === "new-vs-resale") qs.push("What do builder incentives actually cover, and what does a buyer still pay for?", "Where does new construction sit, and what does that location mean day to day?");
  if (group.development) qs.push("What is confirmed by a primary source today, and what is still only planned or proposed?", "What is the realistic timeline, and who says so?", "What could it change for people who already live nearby?");
  qs.push(...(CLUSTER_QUESTIONS[group.cluster] ?? []));
  for (const facet of group.facets) qs.push(...(FACET_QUESTIONS[facet] ?? []));
  for (const q of group.queries.slice(0, 4)) {
    if (/\?$|^(is|are|can|should|how|what|why|when|does|do)\b/i.test(q.query)) qs.push(`Searchers literally ask: "${q.query}"`);
  }
  return [...new Set(qs)].slice(0, 9);
}

/**
 * For an UPDATE or EXPAND: the section(s) to add or sharpen — never a whole
 * article outline, because the page already has its structure.
 */
export function updateSections(group, classification) {
  if (classification.action === ACTIONS.UPDATE_EXISTING) {
    return [classification.relevantSection ? `Sharpen: "${classification.relevantSection}" — answer the question directly and early` : "Sharpen the intro so the page answers the question in its first screen"];
  }
  if (group.shape === "comparison" && group.cluster === "area-comparison") {
    const [a, b] = orderedCompared(group).map(label);
    const out = [`${a} vs ${b}, head to head`];
    if (group.facets.includes("facet:cost")) out.push(`What the money buys in ${bare(a)} versus ${bare(b)}`);
    if (group.facets.includes("facet:commute")) out.push(`The drive from ${bare(a)} versus ${bare(b)}`);
    return out;
  }
  const missing = classification.missingFacets ?? [];
  if (missing.length) return missing.map((f) => `${cap(facetLabel(f))}: what it actually looks like here`);
  return [`A direct answer to: ${primaryQuestion(group)}`];
}

/** Likely sections. Suggestions only — the Publisher shapes the piece. */
export function likelySections(group) {
  if (group.shape === "comparison" && group.cluster === "area-comparison") {
    const [a, b] = orderedCompared(group).map(label);
    const sections = [`The short answer: how ${a} and ${b} actually differ`, "Where each one is, and what that means for the drive", "The housing you actually get"];
    if (group.facets.includes("facet:cost")) sections.push("What it costs to live in each — beyond the list price");
    sections.push("A normal weekday in each", `Who ends up choosing ${a}, and why`, `Who ends up choosing ${b}, and why`, "What people get wrong before they move", "Questions to answer before you decide");
    return sections;
  }
  if (group.cluster === "rent-vs-buy") return ["The short answer", "What renting first actually buys you", "What it costs you", "When buying right away makes more sense", "A way to decide"];
  if (group.cluster === "new-vs-resale") return ["The short answer", "What incentives do and do not cover", "The costs that come with new: HOA, SID/LID, landscaping, window coverings", "Location and lot-size tradeoffs", "What established neighborhoods offer instead", "How to compare two real options"];
  if (group.development) return ["What is actually happening", "What is confirmed, and by whom", "What is planned but not certain", "The realistic timeline", "What it could change for people nearby", "What to watch next"];
  return ["The short answer", "How it actually works here", "What people misunderstand", "What it means for your decision", "Questions to answer before you decide"];
}

/** Research the Publisher must do before writing. GSC data is never a source. */
export function researchRequirements(group) {
  const reqs = [
    "Every fact, figure and date must be independently researched and current as of publication. Search Console data in this brief is evidence of DEMAND only — it is never an editorial fact and must not appear in the piece as one.",
  ];
  if (group.development) reqs.push("CURRENT_RESEARCH_REQUIRED — confirm the project's present status from primary sources (city/county agendas and staff reports, the developer's own releases, recorded documents), corroborated by reputable local reporting. Separate approved from proposed from rumored.");
  if (group.facets.includes("facet:cost") || group.cluster === "cost-of-housing" || group.cluster === "market") {
    reqs.push("Prices and market figures: Las Vegas Realtors or other MLS-supported data, with the period stated beside every figure. No submarket median unless a source publishes one for exactly that area.");
    reqs.push("Tax, HOA and assessment figures: Clark County Assessor/Treasurer, the association's own documents, or the SID/LID district — never an estimate presented as a figure.");
  }
  if (group.facets.includes("facet:commute") || group.cluster === "commute-access" || group.cluster === "area-comparison") {
    reqs.push("Drive times: measured, or from a mapping source with the time of day stated. Do not publish a single 'minutes to the Strip' figure without that context.");
  }
  if (group.concepts.includes("concept:incentives") || group.concepts.includes("concept:new-construction")) reqs.push("Builder incentives change weekly — cite the builder's current published terms with the date checked, or describe incentives structurally without figures.");
  if (group.cluster === "relocation") reqs.push("Practical relocation facts (vehicle registration and license deadlines, utility setup, local rules): the responsible agency's own current page, dated.");
  if (group.concepts.includes("concept:rent")) reqs.push("Rent figures: a named, current source with its period stated (e.g. a published rent report), never an anecdote presented as a figure.");
  if (group.concepts.includes("concept:mortgage-rates") || group.cluster === "rent-vs-buy") reqs.push("Mortgage rates: Freddie Mac PMMS (dated by week), never a lender advertisement.");
  if (group.concepts.includes("concept:climate")) reqs.push("Climate and heat facts: National Weather Service Las Vegas, with the period stated.");
  if (group.concepts.includes("concept:down-payment")) reqs.push("Assistance programs: the administering agency's own current page (eligibility, limits and deadlines move).");
  reqs.push("If a fact cannot be verified, omit it or flag it — do not guess.");
  return reqs;
}

export const SOURCE_TYPES = [
  "official government sources (Clark County, the cities, State of Nevada, RTC, NDOT)",
  "primary sources (developer and builder releases, agendas, recorded documents)",
  "program administrators (for any assistance program)",
  "MLS-supported housing data (Las Vegas Realtors)",
  "reputable local reporting (Las Vegas Review-Journal, KTNV, 8 News Now, News 3 LV), for corroboration",
];

/** Soft CTA using only routes that exist. */
export function ctaRecommendation(group, inventory) {
  const exists = (r) => inventory.existingRoutes.has(r);
  const pillars = group.places.map((k) => `/neighborhoods/${entityInfo(k)?.slug ?? ""}`).filter(exists);
  if (group.cluster === "area-comparison" || group.cluster === "neighborhood-orientation") {
    return `Close by pointing to the pillar guide${pillars.length > 1 ? "s" : ""} (${pillars.join(", ") || "the relevant neighborhood pages"})${exists("/search") ? " and the home search at /search" : ""}${exists("/contact") ? ", with a quiet offer to talk it through at /contact" : ""}. No invented lead magnet.`;
  }
  if (group.cluster === "relocation" || group.cluster === "rent-vs-buy") return `A conversational close — the kind of decision worth talking through${exists("/contact") ? " (/contact)" : ""}. No pressure copy.`;
  if (group.development) return "No sales CTA on a development story. Link to the neighborhood pillar for readers deciding where to live.";
  return `A light close to related LVINIT guides${exists("/contact") ? ", with /contact for questions" : ""}.`;
}

export function videoOpportunity(group) {
  if (group.shape === "comparison" && group.cluster === "area-comparison") return "Strong — a drive between the two (or a drive-through of each) shows the day-to-day difference better than text. Only Mikey's own footage; never stock.";
  if (group.facets.includes("facet:commute") || group.cluster === "commute-access") return "Strong — a real drive at a real time of day is the whole point. Mikey's own footage only.";
  if (group.development) return "Useful if Mikey visits the site — current conditions on the ground, clearly dated. No renderings presented as reality.";
  if (group.cluster === "relocation") return "Optional — a short explainer from Mikey could carry the piece on YouTube and social.";
  return "Not needed.";
}

// ---------------------------------------------------------------------------
// Internal links
// ---------------------------------------------------------------------------

/** Pages the new/updated piece should link OUT to, and pages that should later link IN. */
export function internalLinkPlan({ group, classification, coverage, inventory, internalLinks, proposed }) {
  const target = classification.target;
  const isNew = NEW_ACTIONS.has(classification.action);
  const self = target ?? proposed?.route ?? null;
  const topics = topicsFor({ route: proposed?.route ?? target ?? "", title: workingTitle(group) ?? "", category: "" });

  const pillars = group.places.map((k) => `/neighborhoods/${entityInfo(k)?.slug ?? ""}`).filter((r) => inventory.byRoute.has(r));
  const overlapRoutes = coverage.topMatches.filter((m) => m.relation !== "distinct").map((m) => m.route);
  const affinity = inventory.pages
    .map((p) => ({ route: p.route, affinity: topicAffinity(topics, p.topics) }))
    .filter((p) => p.affinity >= 0.7)
    .sort((a, b) => b.affinity - a.affinity)
    .map((p) => p.route);

  const out = [...new Set([...pillars, ...overlapRoutes, ...affinity])].filter((r) => r !== self).slice(0, 6);
  const orphanSet = new Set((internalLinks?.orphans ?? []).map((o) => o.route));
  const weakSet = new Set((internalLinks?.weaklyLinked ?? []).map((o) => o.route));

  const linksOut = out.map((route) => ({
    route,
    title: inventory.byRoute.get(route)?.title ?? null,
    why: pillars.includes(route) ? "neighborhood pillar for a place in the intent" : overlapRoutes.includes(route) ? "overlapping coverage — link rather than repeat" : "same editorial cluster",
    note: orphanSet.has(route) ? "Internal Linking reports this page as an ORPHAN — a genuine link here helps both" : weakSet.has(route) ? "Internal Linking reports this page as weakly linked" : null,
  }));

  let linksIn;
  if (isNew) {
    linksIn = [...new Set([...pillars, ...overlapRoutes])]
      .filter((r) => r !== self)
      .slice(0, 5)
      .map((route) => ({ route, title: inventory.byRoute.get(route)?.title ?? null, why: "should link to the new piece where its own copy already raises the question (the Internal Linking Agent can add these once the new page exists)" }));
  } else {
    const page = inventory.byRoute.get(target);
    linksIn = (page?.linksIn ?? []).slice(0, 5).map((route) => ({ route, title: inventory.byRoute.get(route)?.title ?? null, why: "already links here — revisit its anchor text if the page's focus sharpens" }));
  }
  return { linksOut, linksIn };
}

// ---------------------------------------------------------------------------
// The brief
// ---------------------------------------------------------------------------

/**
 * Build the full brief. Returns null fields rather than invented ones.
 */
export function buildBrief({ id, group, classification, coverage, score, confidence, inventory, factDecay, internalLinks, gscEvidence, gscMeta, config, factDecayNotes }) {
  const action = classification.action;
  const isNew = NEW_ACTIONS.has(action);
  const isUpdate = UPDATE_ACTIONS.has(action);
  const proposed = isNew ? proposeSlug(group, inventory.existingRoutes) : null;
  const title = isNew ? workingTitle(group) : null;
  const angle = editorialAngle(group);
  const sections = isUpdate ? updateSections(group, classification) : likelySections(group);
  const links = internalLinkPlan({ group, classification, coverage, inventory, internalLinks, proposed });
  const targetPage = classification.target ? inventory.byRoute.get(classification.target) : null;

  // Every generated line must pass the same gates the queries did.
  const generated = [title, angle, primaryQuestion(group), ...sections].filter(Boolean);
  const generatedFairHousing = generated.map((t) => ({ text: t, verdict: fairHousingCheck(t) })).filter((g) => g.verdict.blocked);
  const generatedGeneric = generated.filter((t) => isGenericTopic(t));

  const queries = group.queries.slice(0, config.output.maxQueriesPerBrief).map((q) => ({
    query: q.query,
    raw: q.raw,
    previous: q.previous,
  }));

  const brief = {
    id,
    contentType: {
      [ACTIONS.NEW_COMPARISON]: "new comparison guide",
      [ACTIONS.NEW_ARTICLE]: "new guide",
      [ACTIONS.EXPAND_EXISTING]: "expansion of an existing page",
      [ACTIONS.UPDATE_EXISTING]: "focused update of an existing page",
    }[action],
    action,
    workingTitle: title,
    primarySearchQuestion: primaryQuestion(group),
    underlyingIntent: {
      shape: group.shape,
      intent: group.intent,
      note: group.intentNote,
      cluster: group.cluster,
      facets: group.facets.map(facetLabel),
      entities: coreEntities(group).map(label),
      clarity: group.intentClarity,
    },
    whyLvinit: `${CLUSTER_WHY[group.cluster] ?? CLUSTER_WHY.general} ${classification.reason}`,
    gscEvidence: {
      label: "RAW Search Console metrics (query dimension) — demand evidence only, never editorial facts",
      reportDate: gscMeta.reportDate,
      window: gscMeta.window,
      queries,
      additionalQueries: Math.max(0, group.queries.length - queries.length),
      calculated: {
        label: "CALCULATED — summed across the grouped queries",
        impressions: group.metrics.impressions,
        clicks: group.metrics.clicks,
        weightedPosition: group.metrics.position,
        previousImpressions: group.metrics.previousImpressions,
      },
      rankingPages: {
        label: "RAW query+page rows for these queries — which LVINIT pages Google showed",
        pages: group.rankingPages,
      },
      gscFindings: gscEvidence,
    },
    relevantExistingPages: coverage.topMatches.filter((m) => m.relation !== "distinct").map((m) => ({ route: m.route, title: m.title, relation: m.relation, overlap: m.overlap })),
    duplicateCheck: duplicateCheckSummary(coverage),
    recommendedAction: classification.reason,
    editorialAngle: angle,
    mustNotBecome: mustNotBecome(group),
    keyQuestions: keyQuestions(group),
    likelySections: sections,
    internalLinksOut: links.linksOut,
    pagesThatShouldLinkIn: links.linksIn,
    researchRequirements: researchRequirements(group),
    sourceTypesToPrioritize: SOURCE_TYPES,
    fairHousing: {
      queriesChecked: group.queries.length,
      generatedTextChecked: generated.length,
      clean: generatedFairHousing.length === 0,
      issues: generatedFairHousing.map((g) => ({ text: g.text, category: g.verdict.category, matched: g.verdict.matched })),
      notes:
        "Frame the piece around geography, housing stock, costs, commute and access, development, and the practical tradeoffs of one area versus another. Never who lives there, school rankings, or safety. 'Single-family' is fine as a property type; 'family-friendly' is not.",
    },
    genericTitleCheck: { clean: generatedGeneric.length === 0, flagged: generatedGeneric },
    cta: ctaRecommendation(group, inventory),
    video: videoOpportunity(group),
    flags: classification.flags,
    confidence,
    score,
  };

  if (isNew) {
    brief.newContent = {
      proposedSlug: proposed.slug,
      proposedRoute: proposed.route,
      cluster: group.cluster,
      whyExistingContentDoesNotAnswerIt: coverage.best
        ? `The closest existing page is ${coverage.best.route} (${coverage.best.relation}, overlap ${coverage.best.overlap}): ${coverage.best.reasons.join("; ") || describeEntityCoverage(coverage.best)}.`
        : "Nothing on LVINIT covers this intent.",
      differentiation: coverage.topMatches
        .filter((m) => m.relation === "adjacent" || m.relation === "substantial")
        .map((m) => `${m.route}: link to it for what it already covers; do not repeat it.`),
    };
  }

  if (isUpdate && targetPage) {
    const missing = classification.missingFacets ?? [];
    brief.update = {
      targetRoute: targetPage.route,
      targetTitle: targetPage.title,
      targetFile: targetPage.file,
      exactIntentMissing:
        action === ACTIONS.EXPAND_EXISTING
          ? missing.length
            ? `The ${listOf(missing.map(facetLabel))} side of the question: ${primaryQuestion(group)}`
            : `A direct answer to: ${primaryQuestion(group)} — the page covers the pieces but never puts them together for this question.`
          : `The page covers this, but does not answer it as directly as searchers phrase it: ${primaryQuestion(group)}`,
      currentRelevantSection: classification.relevantSection,
      whatNeedsImprovement:
        action === ACTIONS.EXPAND_EXISTING
          ? "Add a focused section (or sharpen an existing one) that answers the missing part directly, with its own researched facts. Link out to deeper LVINIT coverage rather than duplicating it."
          : "Tighten the headline/intro/section that answers this so the answer is visible early; refresh any figure it relies on.",
      whatNotToRewrite: [
        "the page's existing structure, voice, and sections unrelated to this intent",
        "photography, credits, and captions",
        "brokerage, licensing, Equal Housing and other compliance copy",
        "the IDX/Matrix search embed or its behavior",
        "dated historical figures that are correctly labelled with their period",
      ],
      internalLinksToRevisit: links.linksIn,
      dateModified:
        action === ACTIONS.EXPAND_EXISTING
          ? "Yes — a substantive new section changes the page. Update StoryMeta.dateModified to the day it ships."
          : "Only if the published content substantively changes (new or corrected facts, a rewritten section). Not for a headline/meta-only tweak.",
      factDecay: factDecayNotes,
      internalLinkingNotes: internalLinkNotesFor(targetPage.route, internalLinks),
    };
  }

  return brief;
}

function describeEntityCoverage(match) {
  return match.entities.map((e) => `${label(e.entity)} in ${e.field}`).join(", ");
}

export function duplicateCheckSummary(coverage) {
  return {
    verdict: coverage.verdict,
    meaning: coverage.intentRelation,
    ambiguous: coverage.ambiguous,
    comparedAgainst: coverage.comparedAgainst,
    fieldsCompared: ["route", "title", "H1", "meta description", "section headings", "article text", "category", "topics"],
    bestMatch: coverage.best
      ? { route: coverage.best.route, overlap: coverage.best.overlap, relation: coverage.best.relation, reasons: coverage.best.reasons, entities: coverage.best.entities }
      : null,
    cannibalization: coverage.cannibalization,
    googleMismatch: coverage.mismatch,
  };
}

function internalLinkNotesFor(route, internalLinks) {
  if (!internalLinks?.available) return null;
  const notes = [];
  if (internalLinks.orphans.some((o) => o.route === route)) notes.push("This page is an ORPHAN in the newest Internal Linking report — no editorial page links to it.");
  if (internalLinks.weaklyLinked.some((o) => o.route === route)) notes.push("This page is weakly linked in the newest Internal Linking report.");
  for (const h of internalLinks.bridgeHandoffs.filter((b) => b.from === route || b.to === route)) notes.push(`Internal Linking handed off ${h.id} (${h.from} -> ${h.to}), which needs a sentence written — fold it in if the update touches that paragraph.`);
  return notes.length ? notes : null;
}
