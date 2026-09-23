// ---------------------------------------------------------------------------
// DETECT — is this item about a development change, and what does it say?
//
// Cheap and deterministic. Three questions per item:
//
//   1. topics    what KIND of development (residential, road, park, ...)
//   2. gate      is it a meaningful development change in the valley, or noise?
//   3. facts     unit counts, acreage, target dates — quoted, never inferred
//
// This is the strong filter that keeps Development Watch from becoming a
// news digest. An item passes only when it names a development topic AND an
// action (approved, filed, broke ground, delayed, bought acres...) AND a
// valley location — and trips no noise rule.
// ---------------------------------------------------------------------------

import { classifyItem } from "../../lib/classify.mjs";

export const TOPICS = [
  { key: "residential", label: "Residential", re: /\b(homes?|houses|housing|apartments?|units|residences|residential|condos?|condominiums|townhomes?|townhouses|homesites|\d[\d,]*\s+(?:[\w-]+\s+){0,3}lots|residential lots|subdivision|master[- ]planned|build[- ]to[- ]rent|multifamily|multi-family|single-family|tentative map|new community|village)\b/ },
  { key: "mixed-use", label: "Mixed-use / retail", re: /\b(mixed[- ]use|shopping center|retail (center|plaza|space|development|project)|power center|town center|lifestyle center|entertainment district|commercial (center|development|space|project)|square feet of (retail|commercial|office))\b/ },
  { key: "road", label: "Roads / access", re: /\b(freeway|interchange|intersection|widening|road (project|work|expansion|construction|closure|improvements?)|lanes?\b|beltway|cc-215|i-215|i-15|i-11|us[- ]95|u\.s\. 95|us[- ]93|bridge|overpass|flyover|ramps?|diverging diamond|roundabout|closure|detour|street (project|improvements?|extension))\b/ },
  { key: "transit", label: "Transit", re: /\b(transit|bus rapid|light rail|brightline|high-speed rail|rtc route|transit center|park-and-ride|microtransit|monorail)\b/ },
  { key: "park", label: "Parks / public amenities", re: /\b(parks?\b|trail|trailhead|recreation center|rec center|community center|library|aquatic|pool|sports complex|fieldhouse|sports park|splash pad|pickleball|visitor (center|contact station)|open space)\b/ },
  { key: "employment", label: "Employment center", re: /\b(manufacturing (plant|facility)|(power|manufacturing|production|assembly) plant|factory|headquarters|office (campus|building|park|tower)|distribution center|fulfillment center|warehouse|industrial park|data center|medical (campus|office building)|(new|planned|proposed) hospital|hospital (campus|expansion|tower|project)|research park)\b/ },
  { key: "redevelopment", label: "Redevelopment", re: /\b(redevelop\w*|demoli\w+|implosion|former [a-z' ]{3,30} (site|property)|vacant (site|lot|land|building)|repurpos\w+|revitaliz\w+)\b/ },
  { key: "land", label: "Land sale / land use", re: /\b(land (sale|auction|deal|acquisition|purchase|use)|blm (land|auction|sale)|acres\b|rezon\w*|zone change|zoning|plan amendment|master plan|development agreement|annex\w*)\b/ },
  { key: "casino-resort", label: "Casino / resort", re: /\b((casino|resort|hotel)[- ](project|development|expansion|tower|site|plans?|proposal)|new (casino|resort|hotel)|hotel-casino|casino-resort|gaming enterprise)\b/ },
];

/** Words that mean something HAPPENED to a project. Without one, an item is description, not change. */
const ACTION = /\b(approv\w*|entitle\w*|propos\w*|plans?\b|planned|filed|filing|applica\w+|submit\w*|seeks?|unveil\w*|announc\w*|break(s|ing)? ground|broke ground|groundbreaking|under construction|construction (begins|began|starts|started|underway|is underway|continues)|build(s|ing)?\b|to build|topping[- ]out|open(s|ed|ing)?\b|debut\w*|complet\w*|delay\w*|postpon\w*|pushed back|cancel\w*|scrapped|halt\w*|paused|on hold|stalled|deni\w+|rejected|vot(e|ed|es)|buy(s|ing)?\b|bought|purchas\w+|acquir\w+|sells?\b|sold|closed on|expan\w+|widen\w*|clos(es|ed|ure|ing)|reopen\w*|demoli\w+|redevelop\w*|rezon\w*|breaks?|launch\w*|renamed|resum\w+|restart\w*|\d{1,3}% complete|zone change|tentative map|plan amendment|public hearing|development agreement|use permit|planned unit development)\b/;

/** Places that put a "Las Vegas" story outside the valley (the I-11 in Arizona, Boulder City, Reno…). */
const OUT_OF_VALLEY = /\b(arizona|kingman|phoenix|bullhead|utah|st\.? george|california|reno|laughlin|mesquite|pahrump|boulder city|primm|searchlight|moapa)\b/;

/** A headline that itself reports a project change, even without a topic noun ("X breaks ground"). */
const HEADLINE_CHANGE = /\b(break(s|ing)? ground|broke ground|groundbreaking|approv\w*|entitle\w*|rezon\w*|delay\w*|postpon\w*|cancel\w*|scrapped|halt\w*|paused|deni\w+|topping[- ]out)\b/;

/**
 * Development Watch's own noise, on top of the Local Trend Agent's (crime,
 * sports, shows, obituaries, weather, school operations, one-off events...).
 * Each is something the brief names as weak: small tenant openings, routine
 * maintenance, ceremonial or promotional announcements, generic business news.
 */
export const DEV_NOISE = [
  { reason: "small tenant / restaurant opening", re: /\b(restaurant|cafe|café|coffee (shop|house)|bakery|brewery|taproom|bar and grill|pub|eatery|boutique|salon|barbershop|food truck|pizzeria|taqueria|steakhouse|sushi|burger|tacos?|dessert|ice cream|donut|boba|lounge|nightclub|speakeasy|food hall)\b/, unless: /\b(\d{2,}[, ]?\d*\s*(homes|units|apartments|acres)|mixed[- ]use|shopping center|redevelop)/ },
  { reason: "routine maintenance / short closure", re: /\b(pothole|repaving|resurfac\w+|striping|overnight (closures?|lane)|weekend closures?|nightly closures?|lane restrictions?|water main (break|repair)|power outage|signal (repair|timing)|crack seal\w*|sweeping)\b/, unless: /\b(months|long-term|permanent\w*|until 20\d\d|through 20\d\d|interchange|widening project)\b/ },
  { reason: "ceremonial / promotional announcement", re: /\b(ranks? (among|as)|named (one of|among|the best)|best[- ]selling|top[- ]selling|award|wins?|honored|celebrat\w+ (its|a|the) (\d+(st|nd|rd|th)|anniversary|milestone)|anniversary|holiday (event|lights|market)|halloween|parade|festival|concert|farmers market|open house|grand opening (event|celebration) (for|of) (a |the )?(model|sales)|home (design|decor) trends|meet the)\b/ },
  { reason: "generic business news", re: /\b(earnings|quarterly (results|profit|revenue)|stock (price|shares)|shareholders?|ipo\b|layoffs?|hiring event|job fair|ceo\b|executive|promot(ed|ion) to|appoint\w+)\b/, unless: /\b(acres|homes|units|apartments|project|development|construction|master plan)\b/ },
  { reason: "market statistics (not a development)", re: /\b(median (home|sales?) price|home prices? (rose|fell|dropped|climbed|up|down)|mortgage rates?|inventory (rose|fell|up|down)|months of supply|rent (prices?|growth)|foreclosure (rate|filings))\b/, unless: /\b(approv\w*|break(s)? ground|broke ground|acres|tentative map)\b/ },
  { reason: "opinion / advice piece", re: /\b(opinion|editorial|letters? to the editor|column:|how to|what to know|tips for|things to do|guide to|q&a)\b/ },
];

/** Topic keys (in priority order) an item is about. */
export function topicsOf(text) {
  const t = ` ${String(text ?? "").toLowerCase()} `;
  return TOPICS.filter((x) => x.re.test(t)).map((x) => x.key);
}

/** The primary topic, preferring the most LVINIT-relevant kind. */
export function primaryTopic(topics) {
  for (const k of ["residential", "road", "transit", "park", "mixed-use", "redevelopment", "employment", "land", "casino-resort"]) if (topics.includes(k)) return k;
  return null;
}

const toNumber = (s) => Number(String(s).replace(/,/g, ""));

/**
 * Housing unit counts stated in the text. `ambiguous` is true when the text
 * gives several materially different counts (one project's total vs a phase,
 * or two projects in one story) — then no single number is trusted for
 * change detection.
 */
export function extractUnits(text) {
  const re = /\b(\d{1,3}(?:,\d{3})+|\d{2,6})(?:\s+|-)(?:(?:new|more|additional|planned|proposed|single-family|single family|multifamily|multi-family|residential|luxury|apartment|townhome|condo|affordable|workforce|market-rate|for-rent|build-to-rent|detached|attached|rental|senior|for-sale)\s+){0,3}(homes?|houses?|units?|apartments?|residences?|homesites?|lots?|condos?|townhomes?|townhouses?|condominiums?|dwellings?)\b/gi;
  const values = [];
  for (const m of String(text ?? "").matchAll(re)) {
    const n = toNumber(m[1]);
    if (!Number.isFinite(n) || n < 2) continue;
    if (!m[1].includes(",") && n >= 1900 && n <= 2100) continue; // a year, not a count
    values.push({ value: n, text: m[0] });
  }
  if (!values.length) return { units: null, ambiguous: false, mentions: [] };
  const max = Math.max(...values.map((v) => v.value));
  const distinct = [...new Set(values.map((v) => v.value))];
  // Several different large counts → ambiguous. Small sub-counts under a
  // quarter of the total (a 300-unit workforce piece of a 6,000-home plan) are
  // components, not rivals.
  const rivals = distinct.filter((v) => v !== max && v >= max * 0.25);
  return { units: max, ambiguous: rivals.length > 0, mentions: values.map((v) => v.text) };
}

export function extractAcres(text) {
  const values = [];
  for (const m of String(text ?? "").matchAll(/\b(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)(?:\s+|-)(?:plus\s+|\+\s*)?acres?\b/gi)) {
    const n = toNumber(m[1]);
    if (Number.isFinite(n) && n > 0) values.push(n);
  }
  return values.length ? Math.max(...values) : null;
}

/** "first homes expected spring 2028", "completion in late 2027", "opening in 2027". */
export function extractTarget(text) {
  const re = /\b(?:open(?:ing|s)?|complet(?:e|ed|ion)|finish(?:ed)?|first homes|debut|done|wrap(?:s)? up|operations?|occupancy|move-ins?)\b[^.]{0,60}?\b((?:(?:early|late|mid|mid-|spring|summer|fall|autumn|winter|first quarter|second quarter|third quarter|fourth quarter|q[1-4])\s+(?:of\s+)?)?(20[2-4]\d))\b/i;
  const m = String(text ?? "").match(re);
  if (!m) return { targetYear: null, targetText: null };
  return { targetYear: Number(m[2]), targetText: m[1].trim() };
}

export function extractDollars(text) {
  const m = String(text ?? "").match(/\$\s?(\d[\d,.]*)\s*(million|billion)\b/i);
  return m ? `$${m[1]} ${m[2].toLowerCase()}` : null;
}

export function extractFacts(text) {
  const u = extractUnits(text);
  const t = extractTarget(text);
  return {
    units: u.units,
    unitsAmbiguous: u.ambiguous,
    unitMentions: u.mentions.slice(0, 4),
    acres: extractAcres(text),
    targetYear: t.targetYear,
    targetText: t.targetText,
    dollars: extractDollars(text),
  };
}

/**
 * The development gate for one normalized item.
 * @returns {{pass:boolean, reason:string|null, topics:string[], areas:string[], noise:string|null}}
 */
export function gateItem(item, trendConfig, { knownEntity = false } = {}) {
  const text = `${item.title} ${item.snippet ?? ""} ${item.excerpt ?? ""}`;
  const lower = ` ${text.toLowerCase()} `;
  const headline = ` ${String(item.title).toLowerCase()} `;
  const c0 = classifyItem(item, trendConfig);
  const c = item.presetAreas ? { ...c0, areas: [...new Set([...item.presetAreas, ...c0.areas])], outOfArea: false } : c0;
  const topics = topicsOf(text);
  const base = { topics, areas: c.areas, noise: null };

  if (item.authority === 10) return { ...base, pass: false, reason: "community post — a lead at most, never evidence" };
  if (c.outOfArea && !item.valleyByConstruction) return { ...base, pass: false, reason: "outside the Las Vegas Valley" };
  if (c.noise) return { ...base, pass: false, noise: c.noise, reason: c.noise };
  for (const n of DEV_NOISE) {
    if (n.re.test(headline) && !(n.unless && n.unless.test(lower))) return { ...base, pass: false, noise: n.reason, reason: n.reason };
  }
  if (!topics.length) return { ...base, pass: false, reason: "no development topic" };
  if (!ACTION.test(lower)) return { ...base, pass: false, reason: "describes, but reports no change" };
  // A story that only mentions a tracked project in passing still counts; an
  // untracked one needs the development language in its headline.
  if (!knownEntity && !topicsOf(item.title).length && !HEADLINE_CHANGE.test(headline) && !item.valleyByConstruction) return { ...base, pass: false, reason: "development is not what the story is about" };
  const specific = c.areas.filter((a) => !["las-vegas", "clark-county"].includes(a));
  if (!specific.length && OUT_OF_VALLEY.test(lower) && !item.valleyByConstruction) return { ...base, pass: false, reason: "outside the Las Vegas Valley" };
  // A local outlet's own feed is about the valley even when the snippet names no area.
  const localFeed = item.via && !String(item.via).startsWith("google-news") && item.via !== "legistar" && item.authority <= 8;
  if (!c.areas.length && !item.valleyByConstruction && !localFeed) return { ...base, pass: false, reason: "no identifiable valley location" };
  if (!c.areas.length) base.areas = ["las-vegas"];
  return { ...base, pass: true, reason: null };
}
