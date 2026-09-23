// ---------------------------------------------------------------------------
// LVINIT DEVELOPMENT WATCH — CONFIGURATION
//
// Every threshold, weight, gate and switch Development Watch uses. The areas,
// Vegas-context test and noise rules are the Local Trend Agent's own (it is a
// module of that agent), extended here only where development monitoring
// needs something the trend agent does not.
//
// Overrides: defaults < DEVWATCH_* environment variables < CLI flags.
// See docs/DEVELOPMENT_WATCH.md.
// ---------------------------------------------------------------------------

import { loadConfig as loadTrendConfig } from "../config.mjs";

function envInt(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
  const n = Number.parseInt(String(raw), 10);
  return Number.isFinite(n) ? n : fallback;
}

function envBool(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
  return /^(1|true|yes|on)$/i.test(String(raw).trim());
}

/** The content actions, in the order the classifier considers them. */
export const ACTIONS = {
  UPDATE_EXISTING_ARTICLE: "UPDATE_EXISTING_ARTICLE",
  NEW_LOCAL_FEATURE: "NEW_LOCAL_FEATURE",
  NEW_DEVELOPMENT_ARTICLE: "NEW_DEVELOPMENT_ARTICLE",
  ADD_TO_NEIGHBORHOOD_GUIDE: "ADD_TO_NEIGHBORHOOD_GUIDE",
  CONTENT_BRIEF_INPUT: "CONTENT_BRIEF_INPUT",
  MONITOR_ONLY: "MONITOR_ONLY",
  DUPLICATE: "DUPLICATE",
  REJECT_LOW_VALUE: "REJECT_LOW_VALUE",
  MANUAL_RESEARCH_REQUIRED: "MANUAL_RESEARCH_REQUIRED",
};

/** Actions that describe a Publisher task (the only ones that can ever be handed off). */
export const PUBLISHER_ACTIONS = new Set([ACTIONS.UPDATE_EXISTING_ARTICLE, ACTIONS.NEW_LOCAL_FEATURE, ACTIONS.NEW_DEVELOPMENT_ARTICLE, ACTIONS.ADD_TO_NEIGHBORHOOD_GUIDE]);
export const NEW_CONTENT_ACTIONS = new Set([ACTIONS.NEW_LOCAL_FEATURE, ACTIONS.NEW_DEVELOPMENT_ARTICLE]);

/**
 * Neighborhood pillar guides, and which area keys belong in each. A pillar
 * with `roster: true` has a sourced Development Watch section (lib/areas/<file>).
 */
export const PILLARS = [
  { route: "/neighborhoods/summerlin", areas: ["summerlin"], rosterFile: "lib/areas/summerlin.tsx" },
  { route: "/neighborhoods/henderson", areas: ["henderson", "west-henderson", "green-valley", "inspirada", "lake-las-vegas"], rosterFile: "lib/areas/henderson.tsx" },
  { route: "/neighborhoods/southwest-las-vegas", areas: ["southwest", "mountains-edge", "southern-highlands"], rosterFile: "lib/areas/southwest-las-vegas.tsx" },
  { route: "/neighborhoods/north-las-vegas", areas: ["north-las-vegas", "tule-springs"], rosterFile: null },
  { route: "/neighborhoods/downtown-arts-district", areas: ["downtown", "arts-district"], rosterFile: null },
];

/**
 * Clark County planning areas. Legistar agenda items say "within <town>";
 * only valley towns count. Outlying towns are real places, but not LVINIT's beat.
 */
export const VALLEY_PLANNING_AREAS = ["Enterprise", "Spring Valley", "Paradise", "Winchester", "Sunrise Manor", "Whitney", "Lone Mountain", "Summerlin South", "Red Rock", "Nellis", "East Las Vegas"];
export const OUTLYING_PLANNING_AREAS = ["Searchlight", "Moapa Valley", "Moapa", "Laughlin", "Jean", "Sloan", "Goodsprings", "Indian Springs", "Mount Charleston", "Sandy Valley", "Bunkerville", "Logandale", "Overton", "Blue Diamond", "Nelson", "Cal-Nev-Ari", "Primm", "Mesquite", "Kyle Canyon"];

/** Planning area → LVINIT area key, for scoring geography and pillar matching. */
export const PLANNING_AREA_TO_AREA = {
  Enterprise: "southwest",
  "Spring Valley": "southwest",
  "Summerlin South": "summerlin",
  "Lone Mountain": "northwest",
  Paradise: "clark-county",
  Winchester: "clark-county",
  "Sunrise Manor": "clark-county",
  Whitney: "clark-county",
};

/**
 * Development-specific Google News searches. The Local Trend Agent's own
 * queries are reused as-is; these add only what a CHANGE watcher needs and
 * the trend agent does not ask for.
 */
export const DEV_QUERIES = [
  `"Clark County" (zoning OR "tentative map" OR "development agreement") (homes OR apartments OR project) approved`,
  `"North Las Vegas" ("city council" OR "planning commission") (homes OR apartments OR development) approves`,
  `"Las Vegas City Council" (approves OR approved) (homes OR apartments OR development OR project)`,
  `Henderson Nevada ("planning commission" OR "city council") (homes OR apartments OR development)`,
  `NDOT ("Las Vegas" OR Henderson) (project OR interchange OR widening OR closure)`,
  `"RTC" "Southern Nevada" (project OR construction OR transit OR route)`,
  `("Skye Canyon" OR "Kyle Canyon" OR "Tule Springs" OR "Sunstone" OR "Centennial Hills") (homes OR development OR construction)`,
  `("Inspirada" OR "Cadence" OR "Lake Las Vegas" OR "Summerlin West" OR "Mountains Edge") (homes OR development OR construction)`,
  `"Las Vegas" (groundbreaking OR "breaks ground" OR "broke ground") (homes OR apartments OR community OR project)`,
  `"Las Vegas" (delayed OR canceled OR cancelled OR scrapped OR "on hold") (development OR project OR construction)`,
  `"Las Vegas" ("land sale" OR "BLM auction" OR "acres for") (homes OR development OR community)`,
  `("US 95" OR "U.S. 95" OR "I-11" OR "215 Beltway" OR "CC-215") (project OR construction OR interchange) Las Vegas`,
];

export const DEFAULT_DEVWATCH_CONFIG = {
  sources: {
    /** Google News window for Development Watch's own queries. */
    googleWindow: "7d",
    /** Rotating "<project name>" Las Vegas queries per run, for tracked projects. */
    maxEntityQueries: envInt("DEVWATCH_MAX_ENTITY_QUERIES", 12),
    /** Article excerpts fetched for gate-passing direct-URL items. */
    maxExcerptFetches: envInt("DEVWATCH_MAX_EXCERPT_FETCHES", 20),
    politeDelayMs: envInt("DEVWATCH_POLITE_DELAY_MS", 700),
    timeoutMs: envInt("DEVWATCH_FETCH_TIMEOUT_MS", 20000),
    userAgent: "Mozilla/5.0 (compatible; LVINIT-DevelopmentWatch/1.0; +https://www.lvinit.com)",
    /** A source failing this many runs in a row is flagged loudly on the report. */
    failureAlertAfter: 3,
  },

  gate: {
    /** Items older than this are ignored. */
    maxAgeDays: envInt("DEVWATCH_MAX_AGE_DAYS", 21),
    /** Legistar: residential lots/units at or above this are material. */
    agendaMinUnits: envInt("DEVWATCH_AGENDA_MIN_UNITS", 150),
    /** Legistar: non-residential items at or above this acreage are material. */
    agendaMinAcres: envInt("DEVWATCH_AGENDA_MIN_ACRES", 40),
  },

  facts: {
    /** Two unit counts differing by more than this share are a real difference. */
    unitsTolerance: 0.15,
  },

  scoring: {
    /** Below this, a relevant-looking event is still low value. */
    rejectBelow: 40,
    /** An early-stage event at or above this becomes a CONTENT_BRIEF_INPUT signal. */
    briefSignalMin: 55,
    /** New content needs at least this score. */
    newContentMin: 65,
  },

  handoff: {
    /** Publisher dispatch is OFF in v1. The workflow never sets this. */
    enabled: envBool("DEVWATCH_HANDOFF_ENABLED", false),
    minScore: envInt("DEVWATCH_HANDOFF_MIN_SCORE", 70),
    requiredConfidence: "High",
    maxPerRun: envInt("DEVWATCH_HANDOFF_MAX_PER_RUN", 2),
    trailerKey: "LVINIT-DevWatch-Fingerprint",
    trailerIdKey: "LVINIT-DevWatch",
  },

  lifecycle: {
    /** An open event not seen for this many days is RESOLVED (aged out). */
    staleAfterDays: 45,
    /** Processed-document memory is pruned after this many days. */
    seenRetentionDays: 60,
  },
};

function merge(base, extra) {
  if (!extra || typeof extra !== "object") return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const [k, v] of Object.entries(extra)) {
    if (v === undefined) continue;
    const b = base?.[k];
    const plain = (x) => x && typeof x === "object" && !Array.isArray(x) && !(x instanceof RegExp);
    out[k] = plain(v) && plain(b) ? merge(b, v) : v;
  }
  return out;
}

/**
 * The Development Watch config carries the trend agent's config as `trends`,
 * so areas, noise and Google News settings are shared, not copied.
 */
export function loadDevConfig(overrides = {}, trendOverrides = {}) {
  const trends = loadTrendConfig(trendOverrides);
  return { ...merge(DEFAULT_DEVWATCH_CONFIG, overrides), trends };
}
