// ---------------------------------------------------------------------------
// EDITORIAL RELEVANCE + SEARCH INTENT
//
// Two separate judgements, both deliberately explainable:
//
//   editorialRelevance(query) -> 0-1
//     How close is this query to what LVINIT is actually for? A query about
//     Summerlin vs Henderson daily life scores near 1. A query about Vegas show
//     tickets scores 0, no matter how many impressions it has.
//
//   classifyIntent(query) -> { intent, depth }
//     What is the searcher trying to DECIDE? Keyword presence is not intent:
//     "henderson nv" and "should i rent first in henderson" are the same topic
//     and completely different jobs.
//
// Every signal here is about geography, housing, cost, commute, development and
// process. None of it references a protected class — that is the Fair Housing
// module's job and it runs as a hard gate before any of this matters.
// ---------------------------------------------------------------------------

import { tokenize, looksLikeComparison } from "./text.mjs";

/**
 * LVINIT's editorial priorities, straight from the brief, as weighted signals.
 * Weight is "how central is this to LVINIT" — not "how much traffic".
 */
export const EDITORIAL_SIGNALS = [
  { key: "core-places", weight: 1.0, pattern: /\b(summerlin|henderson|southwest\s+las\s+vegas|south\s?west\s+vegas|spring\s+valley|enterprise|north\s+las\s+vegas|downtown|arts\s+district|green\s+valley|lake\s+las\s+vegas|inspirada|cadence|skye\s+canyon|mountains?\s+edge|southern\s+highlands|uncommons)\b/i },
  { key: "neighborhood-topic", weight: 0.9, pattern: /\b(neighborhood|neighbourhood|area|areas|suburb|suburbs|master\s*planned|community|communities|zip\s*code|part\s+of\s+town|where\s+to\s+live)\b/i },
  { key: "comparison", weight: 1.0, pattern: /\b(vs|versus|compared\s+to|compare|difference\s+between|which\s+is\s+better|or)\b/i },
  { key: "relocation", weight: 1.0, pattern: /\b(moving\s+to|move\s+to|relocat\w*|moving\s+from|new\s+to|before\s+you\s+move|first\s+year|what\s+to\s+know)\b/i },
  { key: "rent-vs-buy", weight: 0.95, pattern: /\b(rent\s+first|rent\s+or\s+buy|renting\s+vs|buy\s+or\s+rent|should\s+i\s+rent|should\s+i\s+buy|lease\s+first)\b/i },
  { key: "new-vs-resale", weight: 0.95, pattern: /\b(new\s+construction|new\s+build|new\s+home|builder|resale|existing\s+home|spec\s+home|production\s+builder|tract\s+home)\b/i },
  { key: "commute-access", weight: 0.85, pattern: /\b(commute|commuting|drive\s+time|how\s+far|distance\s+to|traffic|beltway|215|i-?15|airport|to\s+the\s+strip|freeway|access)\b/i },
  { key: "housing-tradeoffs", weight: 0.85, pattern: /\b(lot\s+size|square\s+f\w*|single\s+story|two\s+story|yard|pool|hoa|home\s+size|floor\s*plan|garage|casita|acreage)\b/i },
  { key: "everyday-life", weight: 0.8, pattern: /\b(what\s+it\s?'?s\s+like|living\s+in|daily\s+life|day\s+to\s+day|pros\s+and\s+cons|worth\s+it|really\s+like|honest)\b/i },
  { key: "development", weight: 0.8, pattern: /\b(development|being\s+built|under\s+construction|new\s+in\s+\d{4}|expansion|opening|master\s+plan|breaking\s+ground|coming\s+to)\b/i },
  { key: "costs", weight: 0.9, pattern: /\b(cost|costs|price|prices|expensive|affordab\w+|property\s+tax|tax\s+abatement|hoa\s+fee|utilit\w+|insurance|closing\s+cost|down\s+payment|interest\s+rate|budget|median)\b/i },
  { key: "process-and-misunderstandings", weight: 0.85, pattern: /\b(do\s+i\s+need|how\s+does|how\s+much|is\s+it\s+true|myth|mistake|first\s+time|escrow|appraisal|inspection|earnest|contingenc\w+|assessment|sid|lid)\b/i },
  { key: "market-questions", weight: 0.75, pattern: /\b(market|prices\s+drop|crash|bubble|going\s+up|going\s+down|forecast|inventory|days\s+on\s+market)\b/i },
];

/** Topics that are Las Vegas but explicitly not LVINIT's job. */
export const OFF_TOPIC_SIGNALS = [
  /\b(casino|slot|poker|gamble|gambling|show\s+tickets?|residency|concert|nightclub|club|buffet|hotel\s+deal|resort\s+fee|strip\s+club|sphere|raiders|golden\s+knights|f1|formula\s+1|super\s+bowl|convention|ces)\b/i,
  /\b(job|jobs|salary|hiring|career|dispensary|weed|marijuana|wedding\s+chapel|elopement|divorce)\b/i,
];

/**
 * Score a query against LVINIT's editorial priorities.
 * @returns {{score:number, matched:string[], offTopic:boolean}}
 */
export function editorialRelevance(query) {
  const text = String(query ?? "");
  const offTopic = OFF_TOPIC_SIGNALS.some((re) => re.test(text));

  const matched = [];
  let best = 0;
  let accumulated = 0;
  for (const signal of EDITORIAL_SIGNALS) {
    if (signal.pattern.test(text)) {
      matched.push(signal.key);
      best = Math.max(best, signal.weight);
      accumulated += signal.weight;
    }
  }
  if (matched.length === 0) return { score: offTopic ? 0 : 0.15, matched, offTopic };

  // The strongest single signal sets the floor; extra signals add a little on
  // top (a query that is BOTH a place and a comparison is more LVINIT than
  // either alone), capped at 1.
  const score = Math.min(1, best + Math.min(0.3, (accumulated - best) * 0.2));
  return { score: offTopic ? Math.min(score, 0.2) : score, matched, offTopic };
}

/**
 * Classify what the searcher is trying to decide.
 *
 * `depth` is a 0-1 "how close is this to a real relocation or housing decision"
 * signal. It is NOT a prediction of leads, revenue, or conversion — the agent
 * never estimates those. It is only used to rank one content idea above another.
 */
export function classifyIntent(query) {
  const text = String(query ?? "").toLowerCase();
  const tokens = tokenize(text);

  if (/\b(lvinit|mikey\s+del\s+rosario|scofield)\b/i.test(text)) {
    return { intent: "navigational", depth: 0.1, note: "Someone looking for LVINIT itself." };
  }
  if (/\b(homes?\s+for\s+sale|listings?|mls|new\s+listings|price\s+reduced|open\s+house|realtor\s+near\s+me)\b/i.test(text)) {
    return { intent: "transactional", depth: 0.8, note: "Actively looking at inventory." };
  }
  if (/\b(moving\s+to|move\s+to|relocat\w*|should\s+i\s+(move|rent|buy)|worth\s+moving|before\s+moving|pros\s+and\s+cons\s+of\s+(moving|living))\b/i.test(text)) {
    return { intent: "relocation-decision", depth: 0.95, note: "Weighing an actual move." };
  }
  if (looksLikeComparison(text) && tokens.length >= 2) {
    return { intent: "comparison", depth: 0.85, note: "Choosing between options." };
  }
  if (/\b(cost|price|how\s+much|afford|tax|fee|payment|rate)\b/i.test(text)) {
    return { intent: "cost-research", depth: 0.7, note: "Working out whether the numbers work." };
  }
  if (/\b(what|how|why|when|is|are|does|do)\b/i.test(text) || /\?$/.test(text)) {
    return { intent: "informational", depth: 0.45, note: "Researching, not yet deciding." };
  }
  if (tokens.length <= 2) {
    return { intent: "discovery", depth: 0.35, note: "Broad orientation — a place name or a topic." };
  }
  return { intent: "informational", depth: 0.4, note: "General research." };
}

/**
 * The topic cluster a query belongs to, used for grouping and for the editorial
 * angle written into new-content recommendations.
 */
export function topicCluster(query) {
  const text = String(query ?? "");
  if (looksLikeComparison(text)) return "area-comparison";
  if (/\b(moving|relocat|new\s+to)\b/i.test(text)) return "relocation";
  if (/\b(rent|renting|lease)\b/i.test(text)) return "rent-vs-buy";
  if (/\b(new\s+construction|new\s+build|builder|resale)\b/i.test(text)) return "new-vs-resale";
  if (/\b(commute|traffic|drive|beltway|airport|strip)\b/i.test(text)) return "commute-access";
  if (/\b(cost|price|tax|hoa|fee|afford|payment)\b/i.test(text)) return "cost-of-housing";
  if (/\b(development|construction|opening|coming|expansion)\b/i.test(text)) return "development";
  if (/\b(neighborhood|area|community|suburb|where\s+to\s+live)\b/i.test(text)) return "neighborhood-orientation";
  return "general";
}
