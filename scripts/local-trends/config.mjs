// ---------------------------------------------------------------------------
// LVINIT LOCAL TREND AGENT — CONFIGURATION
//
// Every tunable the agent uses lives here: where it looks, what counts as
// Las Vegas, what counts as noise, how it scores, and what it may spend.
// Nothing else in the agent should hardcode a feed, an area, or a threshold.
//
// Overrides, in increasing order of precedence:
//   1. the defaults below
//   2. environment variables (TRENDS_MAX_CANDIDATES, ...)
//   3. CLI flags (--max-candidates=20, --no-llm, ...)
//
// Same shape as the other LVINIT agents (scripts/gsc, scripts/fact-decay,
// scripts/internal-links) so there is one configuration philosophy to learn.
//
// See docs/LOCAL_TREND_AGENT.md for what each group means in plain English.
// ---------------------------------------------------------------------------

import { trendFeeds } from "./sources.mjs";

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

function envStr(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
  return String(raw).trim();
}

/** Areas, in priority order. `pattern` is matched against lowercased text. */
const AREAS = [
  // Tier 1 — highest priority
  { key: "summerlin", label: "Summerlin", tier: 1, pattern: /\bsummerlin\b/ },
  { key: "west-henderson", label: "West Henderson", tier: 1, pattern: /\bwest henderson\b/ },
  { key: "henderson", label: "Henderson", tier: 1, pattern: /\bhenderson\b/ },
  { key: "southwest", label: "Southwest Las Vegas", tier: 1, pattern: /\bsouthwest (las vegas|valley)\b|\bsw las vegas\b|\benterprise\b(?= (area|township|nv|neighborhood))/ },
  { key: "green-valley", label: "Green Valley", tier: 1, pattern: /\bgreen valley\b/ },
  { key: "inspirada", label: "Inspirada", tier: 1, pattern: /\binspirada\b/ },
  { key: "centennial-hills", label: "Centennial Hills", tier: 1, pattern: /\bcentennial hills\b/ },
  { key: "skye-canyon", label: "Skye Canyon", tier: 1, pattern: /\bskye canyon\b/ },
  { key: "southern-highlands", label: "Southern Highlands", tier: 1, pattern: /\bsouthern highlands\b/ },
  { key: "mountains-edge", label: "Mountains Edge", tier: 1, pattern: /\bmountains?'? ?edge\b/ },
  { key: "lake-las-vegas", label: "Lake Las Vegas", tier: 1, pattern: /\blake las vegas\b/ },
  { key: "tule-springs", label: "Tule Springs", tier: 1, pattern: /\btule springs\b/ },
  { key: "sunstone", label: "Sunstone", tier: 1, pattern: /\bsunstone\b/ },
  { key: "northwest", label: "Northwest Las Vegas", tier: 1, pattern: /\bnorthwest (las vegas|valley)\b/ },
  // Tier 2 — also monitored
  { key: "downtown", label: "Downtown Las Vegas", tier: 2, pattern: /\bdowntown las vegas\b|\bfremont street\b/ },
  { key: "arts-district", label: "Arts District", tier: 2, pattern: /\barts district\b|\b18b\b/ },
  { key: "strip", label: "Las Vegas Strip", tier: 2, pattern: /\bthe strip\b|\blas vegas strip\b|\bstrip (resort|casino|hotel|property|properties)\b/ },
  { key: "north-las-vegas", label: "North Las Vegas", tier: 2, pattern: /\bnorth las vegas\b/ },
  { key: "clark-county", label: "Clark County", tier: 2, pattern: /\bclark county\b/ },
  { key: "city-of-las-vegas", label: "City of Las Vegas", tier: 2, pattern: /\bcity of las vegas\b|\blas vegas city council\b/ },
  { key: "las-vegas", label: "Las Vegas (valley-wide)", tier: 3, pattern: /\blas vegas\b|\bsouthern nevada\b|\blas vegas valley\b/ },
];

/**
 * Text that proves a story is about THIS Henderson / this Summerlin. Needed
 * because "West Henderson" also matches a North Carolina high school, and
 * Google News happily returns it for a quoted query.
 */
const VEGAS_CONTEXT = /\blas vegas\b|\bhenderson,? nev|\bhenderson,? nv\b|\bnevada\b|\bclark county\b|\bsouthern nevada\b|\bsummerlin\b|\bnorth las vegas\b|\blake mead\b|\bred rock\b/;

/** Topic categories A–H from the brief. `pattern` is matched on lowercased text. */
const CATEGORIES = [
  {
    key: "real-estate-development",
    label: "Real estate development",
    pattern: /\b(master[- ]planned|new (homes?|community|neighborhood|village|phase)|model homes?|homebuilder|home ?builder|subdivision|lots?\b.{0,20}\bsold|land (sale|auction|acquisition|purchase)|acres?\b|build[- ]to[- ]rent|apartments?|multifamily|condos?|townhomes?|luxury (homes?|tower|residences?)|residential (project|development|tower)|housing (project|development))\b/,
  },
  {
    key: "neighborhood-change",
    label: "Neighborhood change",
    pattern: /\b(grocery|supermarket|trader joe'?s|whole foods|sprouts|costco|h-?e-?b|restaurant|coffee|shopping center|retail (center|plaza)|park\b|trail|school|charter school|hospital|medical (center|campus)|library|recreation center|community center|dog park|splash pad|pickleball)\b/,
  },
  {
    key: "major-development",
    label: "Major development / redevelopment",
    pattern: /\b(redevelop\w*|mixed[- ]use|demoli\w+|implosion|casino (project|development|expansion|site)|resort (project|development)|hotel (project|tower|development)|mall|stadium|arena|entertainment district|vacant (site|lot|land)|replac\w+)\b/,
  },
  {
    key: "transportation",
    label: "Transportation / infrastructure",
    pattern: /\b(freeway|interchange|widening|road (project|work|expansion|construction)|ndot|rtc\b|i-15|i-11|us[- ]95|215 beltway|the 215|beltway|airport|harry reid|light rail|transit|bus rapid|bike lane|pedestrian|traffic|flyover|overpass|brightline|high-speed rail)\b/,
  },
  {
    key: "builder-activity",
    label: "Builder activity",
    pattern: /\b(d\.?r\.? horton|lennar|pulte|toll brothers|tri pointe|kb home|richmond american|taylor morrison|woodside homes|century communities|beazer|del webb|shea homes|christopher homes|blue heron|pardee|william lyon|toll|storybook homes|greystone|harmony homes)\b/,
  },
  {
    key: "relocation-cost",
    label: "Relocation / cost of living",
    pattern: /\b(property tax(es)?|abatement|hoa|homeowners association|special improvement district|\bsid\b|\blid\b|insurance premiums?|home insurance|utility (rates?|bills?)|nv energy|water (rates?|restrictions?|authority)|mortgage rates?|down payment|first[- ]time (home)?buyers?|affordab\w+|cost of living|commute|relocat\w+|moving to (las )?vegas|heat (wave|warning)|home prices?|median (home|sales?) price|inventory|rents?\b)\b/,
  },
  {
    key: "lifestyle",
    label: "Local lifestyle",
    pattern: /\b(lake mead|red rock|mount charleston|trailhead|hiking|golf course|sports? (complex|park)|raiders|golden knights|aces|athletics|a's stadium|family|farmers market|food hall|dining district|entertainment venue)\b/,
  },
];

/**
 * Words that mark a story as about something being PLANNED, BUILT, OPENED or
 * CHANGED — the core of LVINIT's beat. Used only to rank the short list, so a
 * real development story beats a passing mention of a park or a school.
 */
const DEVELOPMENT_SIGNAL = /\b(approv\w*|groundbreaking|breaks? ground|broke ground|redevelop\w*|master[- ]planned|new (homes?|community|neighborhood|store|restaurant|park|school|hospital)|homes|housing|apartments|construction|project|development|proposal|propos\w+|zoning|rezon\w+|acres|opening|opens|expansion|widening|interchange|builder|replac\w+|transform\w*|demoli\w+|land (sale|auction))\b/;

/** Builders we explicitly monitor (category E). Used for query building. */
const BUILDERS = [
  "DR Horton", "Lennar", "Pulte", "Toll Brothers", "Tri Pointe", "KB Home",
  "Richmond American", "Taylor Morrison", "Woodside Homes", "Century Communities",
  "Beazer", "Del Webb", "Shea Homes", "Christopher Homes", "Blue Heron",
];

/**
 * Stories that are almost never LVINIT content, whatever else they match.
 * A match does not delete the story: it is recorded as rule-filtered noise so
 * it is never analyzed again, and the report counts it.
 */
const NOISE = [
  { reason: "crime / public safety", pattern: /\b(shooting|shot dead|stabb\w+|homicide|murder\w*|arrest\w*|police|charged|accused|indicted|sentenced|suspect|robbery|burglar\w*|abus\w+|assault\w*|crash(es)?|collision|killed|dead after|dies after|died after|body found|go missing|missing (man|woman|teen|child|hiker)|hit by (a )?(car|vehicle|driver|truck)|impaired driver|dui)\b/ },
  { reason: "school operations / district news", pattern: /\b(ccsd|school district|bus delays?|teachers? union|superintendent|school board|crossing guard|after-school programs?)\b/ },
  { reason: "one-off event notice", pattern: /\b(join us|register (for|now|today)|registration|bioblitz|workshop|webinar|cohort|free (event|concert|screening)|to celebrate|celebrates|book festival|parade|fireworks|food drive|blood drive|volunteers? needed)\b/ },
  { reason: "people / career profile", pattern: /\b(from front desk|\d+ years at|named (ceo|president|gm|general manager)|promoted to|retires|retirement|hall of fame)\b/ },
  { reason: "sports results", pattern: /\b(score[sd]?|scoreboard|beat|defeat\w*|win over|loss to|highlights|playoff|preseason|roster|trade rumors?|draft pick|injur\w+|flag football|volleyball|varsity|football|basketball|maxpreps|founding partner|sponsorship)\b/ },
  { reason: "casino entertainment / shows", pattern: /\b(residency|concert|tour dates|headliner|tickets on sale|show review|magic show|comedy show|nightclub|pool party|dj set|buffet review)\b/ },
  { reason: "obituary", pattern: /\b(obituary|obituaries|passed away|dies at \d+|celebration of life)\b/ },
  { reason: "daily weather", pattern: /\b(forecast|weather (today|tonight|this weekend)|chance of rain|wind advisory|temperatures? (today|tonight))\b/ },
];

/**
 * RSS/Atom feeds, read directly. `tier` decides how much a source can prove:
 *   official  city/county/agency newsrooms — can establish status
 *   news      local news outlets — can establish status
 *   social    Reddit — DEMAND SIGNAL ONLY, never a fact source
 *
 * Defined once in the shared source registry (./sources.mjs), which the
 * Development Watch module reads too — same ids, names, tiers and URLs.
 */
const FEEDS = trendFeeds();

/** Domains whose own announcements can establish project status. */
const OFFICIAL_DOMAINS = [
  "cityofhenderson.com", "lasvegasnevada.gov", "clarkcountynv.gov", "cityofnorthlasvegas.com",
  "dot.nv.gov", "rtcsnv.com", "nv.gov", "summerlin.com", "howardhughes.com", "flyharryreid.com",
  "lvcva.com", "snwa.com",
];
const BUILDER_DOMAINS = [
  "drhorton.com", "lennar.com", "pulte.com", "tollbrothers.com", "tripointehomes.com", "kbhome.com",
  "richmondamerican.com", "taylormorrison.com", "woodsidehomes.com", "centurycommunities.com",
  "beazer.com", "delwebb.com", "sheahomes.com", "christopherhomes.com", "blueheron.com",
];

export const DEFAULT_CONFIG = {
  areas: AREAS,
  vegasContext: VEGAS_CONTEXT,
  developmentSignal: DEVELOPMENT_SIGNAL,
  categories: CATEGORIES,
  builders: BUILDERS,
  noise: NOISE,

  sources: {
    feeds: FEEDS,
    officialDomains: OFFICIAL_DOMAINS,
    builderDomains: BUILDER_DOMAINS,
    /** Google News RSS search — targeted queries, not a crawl. */
    googleNews: {
      enabled: envBool("TRENDS_GOOGLE_NEWS", true),
      /** Only stories from the last N days. Google's own `when:` operator. */
      window: "7d",
      base: "https://news.google.com/rss/search",
    },
    userAgent: "Mozilla/5.0 (compatible; LVINIT-LocalTrendAgent/1.0; +https://www.lvinit.com)",
    timeoutMs: envInt("TRENDS_FETCH_TIMEOUT_MS", 20000),
    /** Pause between requests to the same host, so we are a polite reader. */
    politeDelayMs: envInt("TRENDS_POLITE_DELAY_MS", 700),
    /** Read the article page for shortlisted items (better status evidence). */
    fetchExcerpts: envBool("TRENDS_FETCH_EXCERPTS", true),
    maxExcerptChars: 2500,
    maxExcerptFetches: envInt("TRENDS_MAX_EXCERPT_FETCHES", 24),
  },

  selection: {
    /** Stories older than this are ignored — recency is a filter, not a score. */
    maxAgeDays: envInt("TRENDS_MAX_AGE_DAYS", 14),
    /** How many candidates go to judgment per run. The main cost lever. */
    maxCandidates: envInt("TRENDS_MAX_CANDIDATES", 30),
    /** How many Reddit titles to pass along as demand signals. */
    maxSignals: envInt("TRENDS_MAX_SIGNALS", 40),
    /** Two headlines at or above this word overlap are the same story. */
    duplicateTitleSimilarity: 0.6,
  },

  scoring: {
    bands: { p1: 34, p2: 28, p3: 22 },
    /** A rumored / unconfirmed topic can never be CREATE NOW. */
    rumoredMaxPriority: "P2",
    /** Rules-only mode cannot judge an angle; it never claims CREATE NOW. */
    rulesOnlyMaxPriority: "P2",
    /** A watched project resurfaces when its score moves at least this much. */
    resurfaceScoreDelta: 4,
  },

  llm: {
    enabled: envBool("TRENDS_LLM", true),
    model: envStr("TRENDS_MODEL", "claude-opus-5"),
    effort: envStr("TRENDS_EFFORT", "high"),
    maxTokens: envInt("TRENDS_MAX_TOKENS", 48000),
    /** Hard stop: skip the call (rules-only) if the prompt estimate exceeds this. */
    maxInputTokensEstimate: envInt("TRENDS_MAX_INPUT_TOKENS", 90000),
  },

  state: {
    /**
     * Root of the state tree. In CI this is a checkout of the
     * lvinit-agent-state branch; locally it defaults to the repo root, where
     * both directories are gitignored on main.
     */
    dir: envStr("TRENDS_STATE_DIR", "."),
    reportsSubdir: "reports/social-trends",
    dataSubdir: "data/social-trends",
    /** Reviewed-story memory is pruned after this many days. */
    reviewedRetentionDays: 120,
  },
};

/** Deep-merge plain objects; arrays and RegExps are replaced, not merged. */
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

export function loadConfig(overrides = {}) {
  return merge(DEFAULT_CONFIG, overrides);
}
