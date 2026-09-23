// ---------------------------------------------------------------------------
// CONTENT ACTION — exactly one per event, and new content is the last resort
//
//   1  no development change vs what is known           DUPLICATE
//   2  sources conflict                                   MANUAL_RESEARCH_REQUIRED
//   3  score below the floor                              REJECT_LOW_VALUE
//   4  Low confidence                                     MONITOR_ONLY
//   5  LVINIT has a dedicated article on it               UPDATE_EXISTING_ARTICLE
//   6  it is a row in a neighborhood Development Watch    UPDATE_EXISTING_ARTICLE (the pillar)
//   7  still early (proposed / filed / under review)      CONTENT_BRIEF_INPUT if strong, else MONITOR_ONLY
//   8  its area has a pillar guide                        ADD_TO_NEIGHBORHOOD_GUIDE
//   9  distinct, verified, strong                         NEW_DEVELOPMENT_ARTICLE / NEW_LOCAL_FEATURE
//  10  anything else                                      MONITOR_ONLY
//
// Detected / Verified / Interpretation / Recommendation are kept as separate
// fields. Interpretation is templated from extracted facts only — it never
// adds a fact, and it never describes who a place is "good for".
// ---------------------------------------------------------------------------

import { checkFairHousingForLinks } from "../../../internal-links/lib/fair-housing.mjs";
import { checkFairHousing } from "../../../gsc/lib/fair-housing.mjs";

import { ACTIONS } from "../config.mjs";
import { STATUS, EARLY_STATUSES, statusRank } from "./status.mjs";

const MARKETING = /\b(now selling|limited[- ]time|incentives?|special (financing|offer)|grand opening event|model grand opening|luxury living|resort-style|dream home|don'?t miss|schedule (a|your) tour|join (us|the vip)|vip list|interest list|ranks? among|award|best-selling|top-selling|move-in ready|quick move-in)\b/i;

/** The only sources are the developer/builder's own channel, and it reads like marketing. */
export function isPromotionalOnly(items) {
  if (!items.length) return false;
  const ownChannel = items.every((it) => it.authority === 5);
  if (!ownChannel) return false;
  return items.some((it) => MARKETING.test(`${it.title} ${it.snippet ?? ""}`)) || items.every((it) => it.pressWire);
}

/**
 * Fair Housing, two ways:
 *   subject   the project itself is framed around a protected class
 *             (age-restricted, "family" targeting, income-program framing…).
 *             Reported objectively; never auto-handed-off. "Safety" is left
 *             out of this check because road-safety projects are objective
 *             infrastructure — it is still enforced on everything we write.
 *   framing   everything this agent WRITES (interpretation, recommendation,
 *             working title) must pass the shared rules, with the one narrow
 *             single-family exemption the Internal Linking Agent uses.
 */
export function fairHousing({ items, generated }) {
  const subjectHits = [];
  for (const it of items) {
    const v = checkFairHousingForLinks(`${it.title} ${it.snippet ?? ""}`);
    if (v.blocked && v.category !== "safety-and-crime" && v.category !== "religion") subjectHits.push({ ...v, source: it.sourceName });
  }
  const framingHits = [];
  for (const text of generated.filter(Boolean)) {
    const v = checkFairHousingForLinks(text);
    if (v.blocked) framingHits.push({ ...v, text });
  }
  return { sensitiveSubject: subjectHits.length > 0, subjectHits: subjectHits.slice(0, 3), framingClean: framingHits.length === 0, framingHits };
}

const TOPIC_PHRASE = {
  residential: "housing supply",
  road: "how people get in and out of the area",
  transit: "transit access",
  park: "public amenities",
  "mixed-use": "shopping and services nearby",
  redevelopment: "what the site becomes",
  employment: "local jobs and daytime traffic",
  land: "future land use",
  "casino-resort": "a neighborhood casino/resort",
};

/** Objective interpretation from extracted facts only. */
export function interpretation({ entity, obs, eventType, areaLabel, topics }) {
  const bits = [];
  const what = TOPIC_PHRASE[topics[0]] ?? "the area";
  const scale = obs.units ? `${obs.units.toLocaleString("en-US")} homes or units (as reported)` : obs.acres ? `about ${obs.acres.toLocaleString("en-US")} acres (as reported)` : null;
  switch (eventType) {
    case "cancellation":
    case "denial":
      bits.push(`A project people may have been planning around in ${areaLabel} is not moving forward as proposed.`);
      break;
    case "delay":
    case "pause":
      bits.push(`The timeline for ${entity.name} has slipped; anyone timing a purchase or move around it should not rely on earlier dates.`);
      break;
    case "opening":
    case "partial opening":
      bits.push(`${entity.name} is moving from plans to something people can ${topics[0] === "residential" ? "buy or rent" : "use"}, which changes ${what} in ${areaLabel} now rather than later.`);
      break;
    case "construction":
      bits.push(`Construction makes ${entity.name} a near-term change to ${what} in ${areaLabel}.`);
      break;
    case "approval":
      bits.push(`An approval moves ${entity.name} from idea to entitled plan; it can still change before construction.`);
      break;
    case "scale change":
      bits.push(`The reported size of ${entity.name} changed, which changes how much it adds to ${what} in ${areaLabel}.`);
      break;
    case "land deal":
      bits.push(`A land deal signals future ${what} in ${areaLabel}; nothing is buildable or buyable yet.`);
      break;
    default:
      bits.push(`Early-stage change to ${what} in ${areaLabel}; worth tracking, not yet worth acting on.`);
  }
  if (scale) bits.push(`Scale: ${scale}.`);
  return bits.join(" ");
}

/**
 * @returns {{action:string, target:string|null, rationale:string}}
 */
export function classifyAction({ changeClass, obs, score, confidence, coverage, pillar, topics, config }) {
  const s = config.scoring;
  const dedicated = coverage.find((c) => c.kind === "dedicated");
  const roster = coverage.find((c) => c.kind === "roster");

  if (changeClass === "DUPLICATE") return { action: ACTIONS.DUPLICATE, target: dedicated?.route ?? roster?.route ?? null, rationale: "nothing new compared with what is already known" };
  if (changeClass === "CONFLICT") return { action: ACTIONS.MANUAL_RESEARCH_REQUIRED, target: dedicated?.route ?? roster?.route ?? null, rationale: "sources disagree — confirm against the primary record before anything is written" };
  if (score < s.rejectBelow) return { action: ACTIONS.REJECT_LOW_VALUE, target: null, rationale: `relevance ${score} is below ${s.rejectBelow}` };
  if (confidence === "Low") return { action: ACTIONS.MONITOR_ONLY, target: dedicated?.route ?? roster?.route ?? null, rationale: "not verified well enough to act on" };
  if (dedicated) return { action: ACTIONS.UPDATE_EXISTING_ARTICLE, target: dedicated.route, rationale: `LVINIT already has a dedicated article: ${dedicated.route}` };
  if (roster) return { action: ACTIONS.UPDATE_EXISTING_ARTICLE, target: roster.route, rationale: `listed in the ${roster.route} Development Watch (published as "${roster.publishedStatus}")` };
  if (EARLY_STATUSES.has(obs.status)) {
    return score >= s.briefSignalMin
      ? { action: ACTIONS.CONTENT_BRIEF_INPUT, target: null, rationale: "too early for content on its own; passed to the Brief Generator as a LOCAL_DEVELOPMENT_SIGNAL" }
      : { action: ACTIONS.MONITOR_ONLY, target: null, rationale: "early stage — watch for approval or construction" };
  }
  if (pillar && statusRank(obs.status) >= statusRank(STATUS.APPROVED) && score < s.newContentMin + 10) {
    return { action: ACTIONS.ADD_TO_NEIGHBORHOOD_GUIDE, target: pillar.route, rationale: pillar.hasRoster ? `belongs in the ${pillar.route} Development Watch roster` : `belongs in the ${pillar.route} guide (no roster section yet)` };
  }
  if (score >= s.newContentMin && statusRank(obs.status) >= statusRank(STATUS.APPROVED)) {
    const residential = topics.includes("residential") || topics.includes("land");
    return residential
      ? { action: ACTIONS.NEW_DEVELOPMENT_ARTICLE, target: null, rationale: "distinct, verified, and big enough to stand alone" }
      : { action: ACTIONS.NEW_LOCAL_FEATURE, target: null, rationale: "distinct, verified amenity/access change worth its own feature" };
  }
  if (pillar) return { action: ACTIONS.ADD_TO_NEIGHBORHOOD_GUIDE, target: pillar.route, rationale: `fits the ${pillar.route} guide` };
  return { action: ACTIONS.MONITOR_ONLY, target: null, rationale: "not strong enough for content yet" };
}

/** Recommendation text, derived from the action only. */
export function recommendation({ action, target, entity, obs }) {
  switch (action) {
    case ACTIONS.UPDATE_EXISTING_ARTICLE:
      return `Update ${target}: ${entity.name} is now "${obs.status}". Re-verify against the primary source before changing any published status.`;
    case ACTIONS.ADD_TO_NEIGHBORHOOD_GUIDE:
      return `Consider adding ${entity.name} to ${target} with its status and a primary source.`;
    case ACTIONS.NEW_DEVELOPMENT_ARTICLE:
      return `Candidate for a new development article on ${entity.name}. Publisher must independently research every fact.`;
    case ACTIONS.NEW_LOCAL_FEATURE:
      return `Candidate for a Local Feature on ${entity.name}. Publisher must independently research every fact.`;
    case ACTIONS.CONTENT_BRIEF_INPUT:
      return `Signal for the Content Brief Generator (editorial intelligence, not search demand).`;
    case ACTIONS.MANUAL_RESEARCH_REQUIRED:
      return `Confirm which source is right before anything is published.`;
    case ACTIONS.MONITOR_ONLY:
      return `Keep watching; resurfaces automatically on a status, scale or timeline change.`;
    default:
      return null;
  }
}

export { checkFairHousing };
