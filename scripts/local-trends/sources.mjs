// ---------------------------------------------------------------------------
// LVINIT SOURCE REGISTRY — one list of every source the local agents read
//
// Both the Local Trend Agent and its Development Watch module read their
// sources from here, so a feed is defined once, polled once per run, and
// documented in one place. Nothing else should hardcode a source URL.
//
// Every record:
//
//   id                 stable key (state files and reports use it)
//   name, organization who publishes it
//   type               government-newsroom | planning-records | transportation-agency |
//                      transit-agency | developer | builder | project-site |
//                      corporate-filings | local-news | news-search | community
//   url                what is fetched (or, for manual sources, where to look)
//   geography          area keys it covers (see config.mjs AREAS), or ["valley"]
//   topics             what it is useful for
//   method             rss | legistar | wp-json | google-news | manual
//   authority          the SOURCE HIERARCHY, 1 = strongest:
//                        1 official government newsroom
//                        2 planning / zoning / council records
//                        3 NDOT
//                        4 RTC
//                        5 official developer / builder announcement
//                        6 public project documents / project sites
//                        7 SEC / investor / corporate filings
//                        8 reputable Las Vegas local reporting
//                        9 other credible sources
//                       10 community discussion — a LEAD, never verification
//   tier               the Local Trend Agent's coarse tier (official | builder | news | social)
//   cadence            daily | weekly — how often Development Watch polls it
//   automatedReliable  did an unattended fetch actually work when this was
//                      last verified? false = the report says SOURCE_CHECK_REQUIRED
//   verified           the date automatedReliable was last confirmed by hand
//   usedBy             which agents poll it
//   notes              anything a human needs to know
//
// "Last successful check" is NOT stored here — it is runtime state, kept in
// data/development-watch/sources.json on the lvinit-agent-state branch.
// ---------------------------------------------------------------------------

export const AUTHORITY = {
  1: "official government",
  2: "planning / zoning / council record",
  3: "NDOT",
  4: "RTC",
  5: "developer / builder announcement",
  6: "public project document",
  7: "corporate filing",
  8: "reputable local reporting",
  9: "other credible source",
  10: "community lead (never verification)",
};

/** Authority at or below this number is a PRIMARY source. */
export const PRIMARY_MAX_AUTHORITY = 7;

const TRENDS = "local-trends";
const DEVWATCH = "development-watch";

export const SOURCES = [
  // --- 1. Official government newsrooms -----------------------------------
  {
    id: "henderson-news", name: "City of Henderson newsroom", organization: "City of Henderson",
    type: "government-newsroom", url: "https://www.cityofhenderson.com/Home/Components/RssFeeds/RssFeed/View?ctID=5&cateIDs=1",
    geography: ["henderson"], topics: ["city projects", "parks", "roads", "approvals"],
    method: "rss", authority: 1, tier: "official", cadence: "daily", automatedReliable: true, verified: "2026-09-22",
    usedBy: [TRENDS, DEVWATCH], notes: "CivicPlus RSS. Reliable.",
  },
  {
    id: "city-lv-news", name: "City of Las Vegas newsroom", organization: "City of Las Vegas",
    type: "government-newsroom", url: "https://www.lasvegasnevada.gov/rss",
    geography: ["city-of-las-vegas", "downtown", "northwest"], topics: ["city projects", "parks", "roads", "council actions"],
    method: "rss", authority: 1, tier: "official", cadence: "daily", automatedReliable: true, verified: "2026-09-22",
    usedBy: [TRENDS, DEVWATCH], notes: "Large (~1 MB) combined feed. Reliable.",
  },
  {
    id: "clark-newsroom", name: "Clark County newsroom", organization: "Clark County",
    type: "government-newsroom", url: "https://www.clarkcountynv.gov/",
    geography: ["clark-county", "southwest", "valley"], topics: ["county projects", "parks", "roads"],
    method: "manual", authority: 1, tier: "official", cadence: "weekly", automatedReliable: false, verified: "2026-09-22",
    usedBy: [DEVWATCH], notes: "No working RSS; news URLs return 404 to automated requests. County decisions are read from Legistar (clark-legistar) instead; county news arrives through local outlets.",
  },
  {
    id: "nlv-newsroom", name: "City of North Las Vegas newsroom", organization: "City of North Las Vegas",
    type: "government-newsroom", url: "https://www.cityofnorthlasvegas.com/",
    geography: ["north-las-vegas", "tule-springs"], topics: ["city projects", "approvals"],
    method: "manual", authority: 1, tier: "official", cadence: "weekly", automatedReliable: false, verified: "2026-09-22",
    usedBy: [DEVWATCH], notes: "Returns 403 (bot protection) to automated requests, including the RSS path. Check by hand before relying on an NLV claim.",
  },
  // --- 2. Planning / zoning / council records -----------------------------
  {
    id: "clark-legistar", name: "Clark County Commission, Planning and Zoning agendas", organization: "Clark County",
    type: "planning-records", url: "https://webapi.legistar.com/v1/clark",
    geography: ["clark-county", "southwest", "valley"], topics: ["zoning", "tentative maps", "development agreements", "land use"],
    method: "legistar", authority: 2, tier: "official", cadence: "daily", automatedReliable: true, verified: "2026-09-22",
    usedBy: [DEVWATCH],
    legistar: { client: "clark", bodies: [138, 180, 181, 236], lookbackDays: 21, lookaheadDays: 21 },
    notes: "Public Legistar Web API (JSON). Covers unincorporated Clark County (Enterprise, Spring Valley, Paradise, Summerlin South…). Roughly 80 items per zoning agenda, nearly all routine — a strict materiality gate keeps only large residential/mixed-use items and items naming a tracked project. The cities of Las Vegas, Henderson and North Las Vegas are NOT on this API.",
  },
  // --- 3/4. Transportation -------------------------------------------------
  {
    id: "ndot", name: "Nevada Department of Transportation news", organization: "NDOT",
    type: "transportation-agency", url: "https://www.dot.nv.gov/",
    geography: ["valley"], topics: ["freeways", "interchanges", "closures"],
    method: "manual", authority: 3, tier: "official", cadence: "weekly", automatedReliable: false, verified: "2026-09-22",
    usedBy: [DEVWATCH], notes: "Returns 403 to automated requests. NDOT projects arrive through the targeted Google News queries; verify on dot.nv.gov by hand.",
  },
  {
    id: "rtc", name: "RTC Southern Nevada news", organization: "RTC Southern Nevada",
    type: "transit-agency", url: "https://www.rtcsnv.com/news/",
    geography: ["valley"], topics: ["transit", "road projects", "closures"],
    method: "manual", authority: 4, tier: "official", cadence: "weekly", automatedReliable: false, verified: "2026-09-22",
    usedBy: [DEVWATCH], notes: "Cloudflare returns 403 to automated requests, including /feed/. Covered through Google News; verify by hand.",
  },
  // --- 5. Developers / builders -------------------------------------------
  {
    id: "summerlin-news", name: "Summerlin news", organization: "Howard Hughes",
    type: "developer", url: "https://summerlin.com/wp-json/wp/v2/posts?per_page=20&_fields=date,link,title,excerpt",
    geography: ["summerlin"], topics: ["new villages", "builders", "amenities", "Downtown Summerlin"],
    method: "wp-json", authority: 5, tier: "builder", cadence: "daily", automatedReliable: true, verified: "2026-09-22",
    usedBy: [DEVWATCH], notes: "WordPress JSON API (the RSS feed returns 410). Mostly lifestyle/events; the development gate drops those.",
  },
  {
    id: "skye-canyon-news", name: "Skye Canyon blog", organization: "Skye Canyon (master developer)",
    type: "developer", url: "https://www.skyecanyon.com/feed/",
    geography: ["skye-canyon", "northwest"], topics: ["builders", "amenities"],
    method: "rss", authority: 5, tier: "builder", cadence: "weekly", automatedReliable: true, verified: "2026-09-22",
    usedBy: [DEVWATCH], notes: "Largely marketing content — treated as promotional unless corroborated.",
  },
  {
    id: "cadence-news", name: "Cadence news", organization: "Cadence (master developer)",
    type: "developer", url: "https://www.cadencenv.com/feed/",
    geography: ["henderson"], topics: ["builders", "amenities", "commercial"],
    method: "rss", authority: 5, tier: "builder", cadence: "weekly", automatedReliable: true, verified: "2026-09-22",
    usedBy: [DEVWATCH], notes: "Largely marketing content — treated as promotional unless corroborated.",
  },
  {
    id: "lake-las-vegas-news", name: "Lake Las Vegas news", organization: "Lake Las Vegas",
    type: "developer", url: "https://www.lakelasvegas.com/feed/",
    geography: ["lake-las-vegas", "henderson"], topics: ["builders", "amenities", "resorts"],
    method: "rss", authority: 5, tier: "builder", cadence: "weekly", automatedReliable: true, verified: "2026-09-22",
    usedBy: [DEVWATCH], notes: "Largely marketing/events content — treated as promotional unless corroborated.",
  },
  {
    id: "inspirada-news", name: "Inspirada news", organization: "Inspirada",
    type: "developer", url: "https://inspirada.com/feed/",
    geography: ["inspirada", "henderson"], topics: ["builders", "amenities"],
    method: "rss", authority: 5, tier: "builder", cadence: "weekly", automatedReliable: false, verified: "2026-09-22",
    usedBy: [DEVWATCH], notes: "Timed out on the 2026-09-22 check. Polled weekly; failures are reported, never guessed around.",
  },
  // --- 6. Project documents ------------------------------------------------
  {
    id: "henderson-215", name: "Henderson 215 Project schedule", organization: "City of Henderson (third-party managed site)",
    type: "project-site", url: "https://henderson215.com/schedule/",
    geography: ["henderson", "green-valley"], topics: ["I-215 widening", "diverging diamond", "closures"],
    method: "manual", authority: 6, tier: "official", cadence: "weekly", automatedReliable: false, verified: "2026-09-22",
    usedBy: [DEVWATCH], notes: "Schedule is an image/JS page (about 450 characters of readable text) and the WordPress post feed is empty, so a hash would only detect template changes. Check by hand.",
  },
  // --- 7. Corporate filings ----------------------------------------------
  {
    id: "sec-edgar", name: "SEC EDGAR filings (Howard Hughes, Red Rock Resorts, Boyd, builders)", organization: "U.S. SEC",
    type: "corporate-filings", url: "https://www.sec.gov/edgar/search/",
    geography: ["valley"], topics: ["master-plan land sales", "casino projects", "builder land"],
    method: "manual", authority: 7, tier: "official", cadence: "weekly", automatedReliable: false, verified: "2026-09-22",
    usedBy: [DEVWATCH], notes: "Not automated in v1. Useful for confirming a corporate project decision a news story reports.",
  },
  // --- 8. Reputable local reporting ---------------------------------------
  { id: "rj-business", name: "Las Vegas Review-Journal — Business", organization: "Las Vegas Review-Journal", type: "local-news", url: "https://www.reviewjournal.com/business/feed/", geography: ["valley"], topics: ["housing", "development", "casinos"], method: "rss", authority: 8, tier: "news", cadence: "daily", automatedReliable: true, verified: "2026-09-22", usedBy: [TRENDS, DEVWATCH], notes: "Excerpts sometimes paywalled." },
  { id: "rj-local", name: "Las Vegas Review-Journal — Local", organization: "Las Vegas Review-Journal", type: "local-news", url: "https://www.reviewjournal.com/local/feed/", geography: ["valley"], topics: ["local government", "roads"], method: "rss", authority: 8, tier: "news", cadence: "daily", automatedReliable: true, verified: "2026-09-22", usedBy: [TRENDS, DEVWATCH], notes: "" },
  { id: "sun-business", name: "Las Vegas Sun — Business", organization: "Las Vegas Sun", type: "local-news", url: "https://lasvegassun.com/feeds/headlines/business/", geography: ["valley"], topics: ["development"], method: "rss", authority: 8, tier: "news", cadence: "daily", automatedReliable: true, verified: "2026-09-22", usedBy: [TRENDS, DEVWATCH], notes: "" },
  { id: "sun-news", name: "Las Vegas Sun — News", organization: "Las Vegas Sun", type: "local-news", url: "https://lasvegassun.com/feeds/headlines/news/", geography: ["valley"], topics: ["local government"], method: "rss", authority: 8, tier: "news", cadence: "daily", automatedReliable: true, verified: "2026-09-22", usedBy: [TRENDS, DEVWATCH], notes: "" },
  { id: "vegas-inc", name: "Vegas Inc", organization: "Las Vegas Sun", type: "local-news", url: "https://vegasinc.lasvegassun.com/feeds/headlines/", geography: ["valley"], topics: ["development", "business"], method: "rss", authority: 8, tier: "news", cadence: "daily", automatedReliable: true, verified: "2026-09-22", usedBy: [TRENDS, DEVWATCH], notes: "" },
  { id: "ktnv", name: "KTNV 13 Action News", organization: "KTNV", type: "local-news", url: "https://www.ktnv.com/news.rss", geography: ["valley"], topics: ["local news"], method: "rss", authority: 8, tier: "news", cadence: "daily", automatedReliable: true, verified: "2026-09-22", usedBy: [TRENDS, DEVWATCH], notes: "" },
  { id: "8newsnow", name: "8 News Now", organization: "KLAS", type: "local-news", url: "https://www.8newsnow.com/feed/", geography: ["valley"], topics: ["local news"], method: "rss", authority: 8, tier: "news", cadence: "daily", automatedReliable: true, verified: "2026-09-22", usedBy: [TRENDS, DEVWATCH], notes: "" },
  { id: "news3lv", name: "News 3 Las Vegas", organization: "KSNV", type: "local-news", url: "https://news3lv.com/news/local.rss", geography: ["valley"], topics: ["local news"], method: "rss", authority: 8, tier: "news", cadence: "daily", automatedReliable: true, verified: "2026-09-22", usedBy: [TRENDS, DEVWATCH], notes: "" },
  { id: "nevada-current", name: "Nevada Current", organization: "Nevada Current", type: "local-news", url: "https://nevadacurrent.com/feed/", geography: ["valley"], topics: ["policy", "housing"], method: "rss", authority: 8, tier: "news", cadence: "daily", automatedReliable: true, verified: "2026-09-22", usedBy: [TRENDS, DEVWATCH], notes: "" },
  {
    id: "nevada-business", name: "Nevada Business Magazine", organization: "Nevada Business Magazine",
    type: "local-news", url: "https://nevadabusiness.com/feed/", geography: ["valley"], topics: ["development", "groundbreakings", "openings"],
    method: "rss", authority: 8, tier: "news", cadence: "weekly", automatedReliable: false, verified: "2026-09-22",
    usedBy: [DEVWATCH], notes: "Timed out on the 2026-09-22 check. Often republishes developer releases, so it is corroboration rather than proof.",
  },
  // --- Search ---------------------------------------------------------------
  {
    id: "google-news", name: "Google News targeted searches (Local Trend Agent queries)", organization: "Google News",
    type: "news-search", url: "https://news.google.com/rss/search", geography: ["valley"], topics: ["everything local"],
    method: "google-news", authority: 8, tier: "news", cadence: "daily", automatedReliable: true, verified: "2026-09-22",
    usedBy: [TRENDS, DEVWATCH], notes: "Authority comes from the PUBLISHER's domain, not from Google. Links are redirects, so only the headline is readable.",
  },
  {
    id: "google-news-dev", name: "Google News targeted searches (development + tracked projects)", organization: "Google News",
    type: "news-search", url: "https://news.google.com/rss/search", geography: ["valley"], topics: ["approvals", "groundbreakings", "delays", "tracked projects"],
    method: "google-news", authority: 8, tier: "news", cadence: "daily", automatedReliable: true, verified: "2026-09-22",
    usedBy: [DEVWATCH], notes: "Development-specific queries plus a rotating query per tracked project. Headline-only evidence caps confidence.",
  },
  // --- 10. Community (lead only) -----------------------------------------
  {
    id: "reddit", name: "Reddit (r/vegas, r/LasVegas, r/henderson, r/summerlin)", organization: "Reddit",
    type: "community", url: "https://www.reddit.com/r/vegas+LasVegas+henderson+summerlin/new/.rss?limit=100",
    geography: ["valley"], topics: ["what people ask about"], method: "rss", authority: 10, tier: "social", cadence: "daily",
    automatedReliable: true, verified: "2026-09-22", usedBy: [TRENDS],
    notes: "One combined request (Reddit rate-limits). A demand signal for the Trend Agent; Development Watch never uses it as evidence.",
  },
];

/** Publisher domains → authority, for items whose publisher is known only by domain (Google News). */
export const DOMAIN_AUTHORITY = [
  { authority: 1, domains: ["cityofhenderson.com", "lasvegasnevada.gov", "clarkcountynv.gov", "cityofnorthlasvegas.com", "blm.gov", "snwa.com", "flyharryreid.com"] },
  { authority: 3, domains: ["dot.nv.gov", "nevadadot.com"] },
  { authority: 4, domains: ["rtcsnv.com"] },
  { authority: 5, domains: ["summerlin.com", "howardhughes.com", "skyecanyon.com", "cadencenv.com", "lakelasvegas.com", "inspirada.com", "drhorton.com", "lennar.com", "pulte.com", "tollbrothers.com", "tripointehomes.com", "kbhome.com", "richmondamerican.com", "taylormorrison.com", "woodsidehomes.com", "centurycommunities.com", "beazer.com", "delwebb.com", "sheahomes.com", "christopherhomes.com", "blueheron.com", "prnewswire.com", "businesswire.com", "globenewswire.com"] },
  { authority: 6, domains: ["henderson215.com"] },
  { authority: 7, domains: ["sec.gov", "investor.howardhughes.com"] },
  { authority: 8, domains: ["reviewjournal.com", "lasvegassun.com", "ktnv.com", "8newsnow.com", "news3lv.com", "fox5vegas.com", "nevadacurrent.com", "nevadabusiness.com", "thenevadaindependent.com", "knpr.org", "lasvegasadvisor.com", "vegasinc.lasvegassun.com", "bizjournals.com"] },
  { authority: 10, domains: ["reddit.com", "facebook.com", "x.com", "twitter.com", "nextdoor.com", "tiktok.com", "instagram.com"] },
];

/** Press-release wires carry a company's own announcement: authority 5, but promotional by nature. */
export const PRESS_WIRE_DOMAINS = ["prnewswire.com", "businesswire.com", "globenewswire.com"];

export function sourcesFor(agent) {
  return SOURCES.filter((s) => s.usedBy.includes(agent));
}

export function sourceById(id) {
  return SOURCES.find((s) => s.id === id) ?? null;
}

function hostMatches(domain, list) {
  const d = String(domain ?? "").toLowerCase().replace(/^www\./, "");
  return list.some((x) => d === x || d.endsWith(`.${x}`));
}

/** Authority for a publisher domain; unknown → 9 ("other credible"), .gov → 1. */
export function authorityForDomain(domain) {
  const d = String(domain ?? "").toLowerCase().replace(/^www\./, "");
  if (!d) return 9;
  for (const row of DOMAIN_AUTHORITY) if (hostMatches(d, row.domains)) return row.authority;
  if (/\.gov$/.test(d) || /\.nv\.us$/.test(d)) return 1;
  return 9;
}

export function isPressWire(domain) {
  return hostMatches(domain, PRESS_WIRE_DOMAINS);
}

/** The Local Trend Agent's feed list, derived from the registry (same ids, names, tiers, URLs as before). */
export function trendFeeds() {
  return sourcesFor(TRENDS)
    .filter((s) => s.method === "rss")
    .map((s) => ({ id: s.id, name: s.name, tier: s.tier, url: s.url }));
}

/** Registry validation — used by the tests and at the start of every Development Watch run. */
export function validateRegistry(sources = SOURCES) {
  const problems = [];
  const ids = new Set();
  const methods = new Set(["rss", "legistar", "wp-json", "google-news", "manual"]);
  for (const s of sources) {
    if (!s.id || ids.has(s.id)) problems.push(`duplicate or missing id: ${s.id}`);
    ids.add(s.id);
    for (const k of ["name", "organization", "type", "url", "geography", "topics", "method", "authority", "cadence", "notes", "usedBy"]) {
      if (s[k] === undefined || s[k] === null) problems.push(`${s.id}: missing ${k}`);
    }
    if (typeof s.automatedReliable !== "boolean") problems.push(`${s.id}: automatedReliable must be true/false`);
    if (!methods.has(s.method)) problems.push(`${s.id}: unknown method ${s.method}`);
    if (!(s.authority >= 1 && s.authority <= 10)) problems.push(`${s.id}: authority must be 1–10`);
    if (!["daily", "weekly"].includes(s.cadence)) problems.push(`${s.id}: cadence must be daily or weekly`);
    if (s.method === "legistar" && !s.legistar?.client) problems.push(`${s.id}: legistar sources need legistar.client`);
    try {
      new URL(s.url);
    } catch {
      problems.push(`${s.id}: url is not a URL`);
    }
  }
  return problems;
}
