// ---------------------------------------------------------------------------
// LVINIT RELEVANCE SCORE (0–100) and CONFIDENCE (High / Medium / Low)
//
// Two different questions, kept apart on purpose:
//
//   score       how much this change could matter to someone deciding where
//               to live, buy, rent or commute in the valley
//   confidence  how sure we are the facts are right
//
// A huge project far from anyone's daily life does not automatically score
// well: scale is 10 of 100 points, while housing, neighborhood, commute and
// decision value together are 45. A small, certain change inside a covered
// neighborhood can outscore a giant speculative one.
//
// Component             max   measures
// geography              15   Tier 1 area 15 · Tier 2 10 · valley-wide 6
// housing impact         15   residential, by unit count (log), mixed-use 10
// neighborhood impact    10   parks, retail, redevelopment, employment near homes
// commute / access       10   roads, interchanges, transit, long closures
// scale                  10   units / acres / dollars, log-scaled, capped
// change magnitude       10   what happened: open/delay/cancel/approval > filing
// source authority       10   by the best source's place in the hierarchy
// status certainty        5   verbatim evidence: primary body > news > headline
// existing coverage fit  10   LVINIT already covers it (update value) or its area
// decision value          5   does it change a reader's decision timeline?
// ---------------------------------------------------------------------------

import { STATUS, EARLY_STATUSES, statusRank } from "./status.mjs";

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const logScale = (v, full) => (v > 0 ? clamp(Math.log10(v) / Math.log10(full), 0, 1) : 0);

export const WEIGHTS = {
  geography: 15,
  housing: 15,
  neighborhood: 10,
  access: 10,
  scale: 10,
  change: 10,
  authority: 10,
  certainty: 5,
  coverage: 10,
  decision: 5,
};

const CHANGE_POINTS = {
  cancellation: 10, denial: 9, delay: 10, pause: 10, opening: 9, "partial opening": 9, construction: 9, approval: 9,
  "scale change": 8, "timeline change": 8, "pre-construction": 7, "land deal": 7, hearing: 5, filing: 5, announcement: 6, "access change": 7,
};

export function scoreEvent({ entity, obs, changeClass, eventType, topics, areaTier, coverage, pillar, bestAuthority, evidenceClass }) {
  const c = {};
  c.geography = { 1: 15, 2: 10, 3: 6 }[areaTier] ?? 4;

  const residential = topics.includes("residential") || entity.type === "residential";
  if (residential) c.housing = obs.units ? Math.round(6 + 9 * logScale(obs.units, 3000)) : 8;
  else if (topics.includes("mixed-use") || entity.type === "mixed-use") c.housing = 5;
  else c.housing = 0;

  const neighborhoodTopics = ["park", "mixed-use", "redevelopment", "employment"];
  c.neighborhood = neighborhoodTopics.some((t) => topics.includes(t) || entity.type === t) ? (topics.includes("park") || entity.type === "park" ? 10 : 8) : residential ? 4 : 0;
  if (topics.includes("casino-resort") && !neighborhoodTopics.some((t) => topics.includes(t))) c.neighborhood = Math.min(c.neighborhood, 3);

  c.access = topics.includes("road") || topics.includes("transit") || entity.type === "road" ? 10 : 0;

  const scaleSignals = [obs.units ? logScale(obs.units, 5000) : 0, obs.acres ? logScale(obs.acres, 1000) : 0, obs.dollars ? logScale(parseMoney(obs.dollars), 1e9) : 0];
  c.scale = Math.round(10 * Math.max(...scaleSignals));

  c.change = changeClass === "DUPLICATE" ? 0 : changeClass === "CONFLICT" ? 5 : CHANGE_POINTS[eventType] ?? 5;

  c.authority = bestAuthority <= 4 ? 10 : bestAuthority <= 7 ? 8 : bestAuthority === 8 ? 6 : bestAuthority === 9 ? 3 : 0;

  c.certainty = { "primary-body": 5, "primary-headline": 4, "news-body": 3, "news-headline": 2, "other": 1, none: 0 }[evidenceClass] ?? 0;

  const kinds = coverage.map((x) => x.kind);
  c.coverage = kinds.includes("dedicated") ? 10 : kinds.includes("roster") ? 9 : kinds.includes("mention") ? 7 : pillar ? 6 : 3;

  const decisive = [STATUS.APPROVED, STATUS.ENTITLED, STATUS.UNDER_CONSTRUCTION, STATUS.PARTIALLY_OPEN, STATUS.OPEN, STATUS.DELAYED, STATUS.PAUSED, STATUS.CANCELLED, STATUS.DENIED].includes(obs.status);
  c.decision = decisive ? 5 : obs.status === STATUS.PRE_CONSTRUCTION ? 4 : EARLY_STATUSES.has(obs.status) ? 2 : 1;

  const score = Object.values(c).reduce((a, b) => a + b, 0);
  return { score: clamp(Math.round(score), 0, 100), components: c };
}

function parseMoney(s) {
  const m = String(s).match(/\$(\d[\d,.]*)\s*(million|billion)/i);
  if (!m) return 0;
  return Number(m[1].replace(/,/g, "")) * (m[2].toLowerCase() === "billion" ? 1e9 : 1e6);
}

/** How strong the status evidence is: which kind of source, and body text or just a headline. */
export function evidenceClassOf(obs) {
  if (!obs.evidence) return "none";
  const a = obs.evidenceAuthority;
  if (a <= 7) return obs.evidenceIn === "body" ? "primary-body" : "primary-headline";
  if (a === 8) return obs.evidenceIn === "body" ? "news-body" : "news-headline";
  return "other";
}

/**
 * High    a primary source's own text states the status; the project is
 *         named (not provisional); no conflict; not an early filing; not
 *         promotional-only
 * Medium  reputable reporting states it (body text, or two independent
 *         outlets), or a primary source for an early-stage item
 * Low     single headline, "other" sources only, provisional project,
 *         conflicting sources, or no status at all
 */
export function confidenceFor({ entity, obs, items, promotionalOnly }) {
  const reasons = [];
  if (obs.conflicts.length) return { confidence: "Low", reasons: ["sources conflict"] };
  if (entity.provisional) return { confidence: "Low", reasons: ["the project could not be named from the sources"] };
  if (obs.status === STATUS.UNCLEAR || !obs.evidence) return { confidence: "Low", reasons: ["no source states a status"] };

  const support = items.filter((it) => obs.supportingItemIds.includes(it.id));
  const primary = support.filter((it) => it.authority <= 7);
  const news = support.filter((it) => it.authority === 8);
  const newsPublishers = new Set(news.map((it) => String(it.sourceName).toLowerCase()));

  let level;
  if (primary.length) {
    level = "High";
    reasons.push(`primary source: ${primary[0].sourceName}`);
  } else if (news.length && (obs.evidenceIn === "body" || newsPublishers.size >= 2)) {
    level = "Medium";
    reasons.push(newsPublishers.size >= 2 ? `${newsPublishers.size} independent outlets` : "reputable reporting, article text");
  } else if (news.length) {
    level = "Low";
    reasons.push("a single headline from reputable reporting");
  } else {
    level = "Low";
    reasons.push("no primary or reputable source states the status");
  }
  const cap = (to, why) => {
    if (["High", "Medium", "Low"].indexOf(level) < ["High", "Medium", "Low"].indexOf(to)) {
      level = to;
      reasons.push(why);
    }
  };
  if (EARLY_STATUSES.has(obs.status)) cap("Medium", "early stage — scope can still change");
  if (promotionalOnly) {
    // Marketing never establishes construction or opening on its own.
    if (statusRank(obs.status) >= statusRank(STATUS.UNDER_CONSTRUCTION)) cap("Low", "construction/opening claimed only in the developer's marketing");
    else cap("Medium", "only the developer's own promotional channel says so");
  }
  if (statusRank(obs.status) >= statusRank(STATUS.UNDER_CONSTRUCTION) && !primary.length && obs.evidenceIn !== "body") cap("Low", "construction/opening claimed in a headline only");
  return { confidence: level, reasons };
}
