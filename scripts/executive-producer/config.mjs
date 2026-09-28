// ---------------------------------------------------------------------------
// LVINIT EXECUTIVE PRODUCER — CONFIGURATION
//
// Every tunable the Producer and its Footage Cataloger use lives here. Nothing
// else should hardcode a media root, a folder-to-area mapping, or a threshold.
//
// This file is committed to a PUBLIC repository. It must never name a client,
// a property address, a listing, or a private shoot. Those decisions live in
// the LOCAL privacy file (see `privacy` below), which never leaves Mikey's PC.
//
// Overrides, in increasing order of precedence:
//   1. the defaults below
//   2. environment variables (LVINIT_MEDIA_ROOT, LVINIT_PRODUCER_HOME, ...)
//   3. CLI flags (--media-root=..., --home=..., ...)
//
// See docs/EXECUTIVE_PRODUCER.md for what each group means in plain English.
// ---------------------------------------------------------------------------

import { homedir } from "node:os";
import { join } from "node:path";

function envStr(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
  return String(raw).trim();
}

export const AGENT = "executive-producer";
export const SCHEMA_VERSION = "1.0.0";

/**
 * Where footage lives on the PC → which LVINIT area it covers. Keys are paths
 * relative to the media root, matched on the longest prefix. Only folders that
 * are already public-safe belong here; the area is a hint for the Producer,
 * never a privacy decision.
 */
const AREAS = {
  "Media/Summerlin": { area: "summerlin", label: "Summerlin" },
  "Media/Summerlin/Downtown Summerlin": { area: "summerlin", label: "Downtown Summerlin" },
  "Media/Summerlin/GrandPark West": { area: "summerlin", label: "Grand Park West" },
  "Media/Summerlin/Mesa Ridge park": { area: "summerlin", label: "Mesa Ridge Park" },
  "Media/Summerlin/Red Rock": { area: "summerlin", label: "Red Rock" },
  "Media/Summerlin/The Lakes": { area: "summerlin", label: "The Lakes" },
  "Media/Summerlin/JW Mariott Garage": { area: "summerlin", label: "JW Marriott garage" },
  "Media/Henderson": { area: "henderson", label: "Henderson" },
  "Media/Henderson/215": { area: "henderson", label: "215 through Henderson" },
  "Media/Henderson/Inspirada": { area: "henderson", label: "Inspirada" },
  "Media/Henderson/Lake Las Vegas": { area: "henderson", label: "Lake Las Vegas" },
  "Media/Henderson/MacDonald Highlands": { area: "henderson", label: "MacDonald Highlands" },
  "Media/SouthWest": { area: "southwest", label: "Southwest Las Vegas" },
  "Media/SouthWest/Durango Casino": { area: "southwest", label: "Durango Casino" },
  "Media/SouthWest/Lennar Marcia": { area: "southwest", label: "Lennar community" },
  "Media/SouthWest/The Bend": { area: "southwest", label: "The Bend" },
  "Media/SouthWest/UnCommons": { area: "southwest", label: "UnCommons" },
  // "SoHi" = Southern Highlands (confirmed by Mikey 2026-09-18).
  "Media/SoHi": { area: "southwest", label: "Southern Highlands (SoHi)" },
  "Media/North Las Vegas": { area: "north-las-vegas", label: "North Las Vegas" },
  "Media/Skye Canyon": { area: "northwest", label: "Skye Canyon" },
  "Media/Centennial": { area: "northwest", label: "Centennial Hills" },
  "Media/Monument Hills": { area: "northwest", label: "Monument Hills" },
  // A single KB Home new-build walkthrough (interiors, one exterior, Mikey on
  // camera). No sign, street or landmark places it confidently, so no area is
  // invented. `caution` travels with the folder so the Producer passes it on.
  "Media/KB Homes": {
    area: null,
    label: "UNKNOWN / NEEDS CLASSIFICATION",
    caution: "Exterior shot shows a house number. Blur it before posting.",
  },
  "Media/Arts District": { area: "downtown", label: "Arts District" },
  "Media/Monorail from Sahara": { area: "strip", label: "Monorail from Sahara" },
  "Media/The Strip": { area: "strip", label: "The Strip" },
  "Media/UNLV": { area: "central", label: "UNLV" },
  "Media/215": { area: "valley-wide", label: "215 Beltway" },
  "Media/15 NB": { area: "valley-wide", label: "I-15 northbound" },
  "Media/95 NB": { area: "valley-wide", label: "US-95 northbound" },
  "Graphics/Monument Hills": { area: "northwest", label: "Monument Hills graphics" },
};

/**
 * Finished video projects under Videos/ → the published YouTube video they
 * became. This is how the Producer knows which Shorts, A-roll and graphics
 * already exist for a published video.
 */
const PROJECTS = {
  "Videos/Move to Las Vegas in 2026": { youtubeId: "nyK0cchUt14", area: "valley-wide" },
  "Videos/New vs Resale": { youtubeId: "2w-zkNv5Ta4", area: "valley-wide" },
  "Videos/What you can buy for $500k in Las Vegas": { youtubeId: "Tzxid_nM2nA", area: "valley-wide" },
  "Videos/Summerlin vs Henderson vs SouthWest": { youtubeId: "ZAU9hPQ_1Hk", area: "valley-wide" },
  "Videos/Rent vs Buy": { youtubeId: "2rboWkJ9j48", area: "valley-wide" },
  "Videos/Monument Hills": { youtubeId: "GQbCsZ_X3lc", area: "northwest" },
  "Videos/4 seasons private residences": { youtubeId: "ZDp8KSvNK6w", area: "henderson" },
  "Videos/Summerlin 4th of July Parade": { youtubeId: "hTEzzxcYhkg", area: "summerlin" },
};

/**
 * The first-run privacy file. Written to the LOCAL home directory only, never
 * to the repo. After the first run Mikey edits that local file, not this.
 *
 * `excluded` folder names are matched at ANY depth and never cataloged at all.
 * `approved` is an exact-folder list: a new folder (or subfolder) is held
 * LOCAL ONLY until it is approved, so nothing new can leak by inheritance.
 *
 * The names of private folders are deliberately NOT here. They are added to
 * the local file with `--exclude="Folder Name"` (see catalog.mjs --help).
 */
const APPROVED_SEED = [
  "Media/15 NB", "Media/95 NB", "Media/215",
  "Media/Arts District", "Media/Arts District/Photos",
  "Media/Centennial",
  "Media/Henderson", "Media/Henderson/215", "Media/Henderson/Inspirada",
  "Media/Henderson/Lake Las Vegas", "Media/Henderson/MacDonald Highlands",
  "Media/KB Homes", "Media/Monorail from Sahara", "Media/Monument Hills",
  "Media/North Las Vegas", "Media/Skye Canyon", "Media/SoHi",
  "Media/SouthWest", "Media/SouthWest/Durango Casino", "Media/SouthWest/Lennar Marcia",
  "Media/SouthWest/The Bend", "Media/SouthWest/UnCommons",
  "Media/Summerlin", "Media/Summerlin/Downtown Summerlin", "Media/Summerlin/GrandPark West",
  "Media/Summerlin/JW Mariott Garage", "Media/Summerlin/Mesa Ridge park",
  "Media/Summerlin/Red Rock", "Media/Summerlin/The Lakes",
  "Media/The Strip", "Media/UNLV",
  "Graphics", "Graphics/Monument Hills",
  "Images",
  "Videos",
  "Videos/4 seasons private residences",
  "Videos/Monument Hills", "Videos/Monument Hills/Edge of Vegas",
  "Videos/Monument Hills/Monument-Hills-Las-Vegas-6000-Homes-LVINIT.mp4",
  "Videos/Move to Las Vegas in 2026",
  "Videos/New vs Resale", "Videos/New vs Resale/New vs Resale",
  "Videos/Rent vs Buy",
  "Videos/Rent vs Buy/How to 'Test Drive' a City Before You Buy a H",
  "Videos/Rent vs Buy/moving-to-las-vegas-rent-first-or-buy-first-2026.m",
  "Videos/Summerlin 4th of July Parade", "Videos/Summerlin 4th of July Parade/drone",
  "Videos/Summerlin 4th of July Parade/summerlin-parade-250",
  "Videos/Summerlin vs Henderson vs SouthWest",
  "Videos/Summerlin vs Henderson vs SouthWest/A&B roll",
  "Videos/Summerlin vs Henderson vs SouthWest/Chapter placeholders",
  "Videos/Summerlin vs Henderson vs SouthWest/LVINIT-Summerlin-vs-Henderson-vs-Southwest-2026",
  "Videos/Summerlin vs Henderson vs SouthWest/OpusClip",
  "Videos/Summerlin vs Henderson vs SouthWest/OpusClip/1080p",
  "Videos/Summerlin vs Henderson vs SouthWest/OpusClip/landscape-169",
  "Videos/Summerlin vs Henderson vs SouthWest/OpusClip/SUMMERLIN vs HENDERSONvs SOUTHWEST",
  "Videos/Summerlin vs Henderson vs SouthWest/OpusClip/Summerlin vs Henderson vs SW Las Vegas_ Short-7",
  "Videos/Summerlin vs Henderson vs SouthWest/Shorts",
  "Videos/Summerlin vs Henderson vs SouthWest/Shorts/Summerlin vs Henderson vs SW Las Vegas_ Short-4",
  "Videos/Summerlin vs Henderson vs SouthWest/Shorts/Summerlin vs Henderson vs SW Las Vegas_ Short-5",
  "Videos/What you can buy for $500k in Las Vegas",
];

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

/**
 * How the Producer thinks. Mikey's priorities, in order: engagement, followers,
 * shares, saves, DMs/leads, trust, ease of production, B-roll reuse. The
 * weights below encode exactly that order. The model scores the first seven
 * (1–5); ease and reuse are computed in code from the footage match.
 */
const PRODUCER = {
  weights: {
    comment: 1.6, // engagement: people argue, answer, tag someone
    scroll_stop: 1.4, // engagement: the first second earns the watch
    follow: 1.4, // "I need more of this guy"
    share: 1.3, // sent to a spouse / partner / group chat
    save: 1.2, // "I'll need this when we move"
    dm_lead: 1.1, // opens a DM or relocation conversation
    trust: 1.0, // honest, local, specific
    ease: 0.7, // computed: office A-roll only = 5
    reuse: 0.6, // computed: how well existing B-roll covers it
  },
  // The Summerlin vs Henderson carousel is the benchmark: people already had
  // opinions, locals debated it, relocators wanted it, it got shared and saved,
  // and it started DMs.
  benchmark: {
    title: "Summerlin vs Henderson (Instagram carousel)",
    why: [
      "people already had opinions before they saw it",
      "locals wanted to debate it in the comments",
      "relocators genuinely needed the information",
      "it got shared to partners and saved for later",
      "it started DMs and real relocation conversations",
    ],
  },
  formats: ["neighborhood debate", "tradeoff", "myth vs reality", "nobody tells you", "hidden cost", "relocation decision", "new-build decision", "lifestyle difference", "insider knowledge"],
  avoid: ["generic market update", "generic Realtor tip", "listing content", "news for the sake of news", "no emotional or practical relevance"],
  // Topic language → words that find the right B-roll in the catalog. Only
  // folder/file vocabulary that really exists in the library belongs here.
  conceptFootage: [
    { re: /new.?build|new construction|builder|incentive|master.?plan/i, words: ["lennar", "kb", "pulte", "toll", "brothers", "homes", "monument", "hills", "sandstone", "tule", "construction", "villages"] },
    { re: /resale|established|older home|mature/i, words: ["green", "valley", "lakes", "tivoli", "boca"] },
    { re: /\brent|renting|apartment|lease/i, words: ["apartment", "apartments", "apt", "leasing", "resident", "empire", "fairways", "shade"] },
    { re: /summer|heat|pool|shade|utilit/i, words: ["shade", "utilities", "park", "pool"] },
    { re: /commute|freeway|beltway|drive time|traffic|airport/i, words: ["215", "exit", "eastbound", "ramp", "driving", "fork"] },
    { re: /strip|tourist|casino/i, words: ["strip", "monorail", "casino", "durango"] },
    { re: /park|trail|outdoor|red rock|family/i, words: ["park", "red", "rock", "aventura", "mesa", "ridge", "trails"] },
    { re: /\$\d|price|afford|500k|starter|down payment|\d+% down|buy a home|mortgage|\brates?\b/i, words: ["homes", "villages", "kb", "lennar", "pulte", "toll", "drive"] },
    { re: /henderson/i, words: ["henderson", "welcome", "district", "green", "valley"] },
    { re: /summerlin/i, words: ["summerlin", "downtown", "red", "rock", "grandpark"] },
  ],
  picks: 4,
  shortlist: envInt("PRODUCER_SHORTLIST", 14),
  maxPerFormat: 2,
  maxNewsPicks: 1,
  // A pick may only require NEW field filming if it is this strong AND the
  // library can't cover it. Office A-roll is never "new filming".
  exceptionalScore: 85,
  minClipsForCoverage: 3,
  // Recording budget (minutes of A-roll across the week).
  budget: { min: 45, max: 60 },
  // Don't re-pitch the same source within this many weeks.
  repeatWindowWeeks: 4,
  llm: {
    enabled: envBool("PRODUCER_LLM", true),
    model: envStr("PRODUCER_MODEL", "claude-opus-5"),
    effort: envStr("PRODUCER_EFFORT", "high"),
    maxTokens: envInt("PRODUCER_MAX_TOKENS", 64000),
    maxInputTokensEstimate: envInt("PRODUCER_MAX_INPUT_TOKENS", 120000),
  },
  // Full production sheets live on the state branch; the email links here.
  sheetsUrlBase: envStr("PRODUCER_SHEETS_URL", "https://github.com/mikeydlv/lvinit/blob/lvinit-agent-state/reports/executive-producer"),
};

export function loadConfig(overrides = {}) {
  const home = envStr("LVINIT_PRODUCER_HOME", join(homedir(), ".lvinit", AGENT));
  const base = {
    media: {
      root: envStr("LVINIT_MEDIA_ROOT", "C:\\LVINIT"),
      // Only these top-level folders are read. Newsletters etc. are not footage.
      roots: ["Media", "Videos", "Images", "Graphics"],
      // Folder names skipped wherever they appear: editor caches and backups.
      ignoreDirs: ["CacheClip", "Resolve Project Backups", ".gallery", "Audio", "audio"],
      // Proxies, raw stills that duplicate a JPG, loose audio, editor sidecars.
      ignoreExtensions: ["lrf", "dng", "aac", "mp3", "wav", "pfl", "srt", "ini", "db", "tmp"],
      video: ["mp4", "mov", "m4v"],
      image: ["jpg", "jpeg", "png", "webp", "heic"],
      document: ["txt", "docx", "doc", "pdf", "md"],
      ffprobe: envStr("FFPROBE_PATH", "ffprobe"),
    },
    areas: AREAS,
    projects: PROJECTS,
    privacy: {
      // LOCAL ONLY. Never inside the repo, never pushed.
      file: join(home, "privacy.json"),
      approvedSeed: APPROVED_SEED,
      // File or folder names that are held LOCAL ONLY even inside an approved
      // folder, until Mikey approves that exact path. Generic patterns only:
      // documents and screenshots that tend to carry client or account details,
      // and anything that reads like a street address ("1234 Maple").
      flagPatterns: [
        { re: /invoice|receipt|contract|escrow|disclosure|offer|closing[-_ ]?statement|appraisal|inspection[-_ ]?report/i, why: "looks like a transaction or business document" },
        { re: /\blisting\b|\bclient\b|\bseller\b|\bbuyer[-_ ]?tour\b/i, why: "mentions a listing or client" },
        { re: /screenshot|^text( \d+)?\.|[-_ ]text\./i, why: "looks like a screenshot or text message" },
        // "9876 Fixture Way", "9876-fixture-way-short", "tour_1234_maple". Not addresses:
        // freeway numbers (215-sunset-exit, 15 NB, 95-and-…), years (…-2026-hero),
        // and counts/labels (6000-homes, parade-250-cover, 500k).
        {
          re: /(?:^|[\s_-])(?!(?:11|15|93|95|160|215|515|582|589|593|599|604)(?![0-9]))(?!(?:19|20)\d\d(?![0-9]))\d{3,5}[\s_-]+(?!(?:nb|sb|eb|wb|north|south|east|west|and|to|vs|or|of|in|the|homes?|units?|acres?|sq|sqft|cover|hero|thumbnail|youtube|short|shorts|reel|clip|final|v\d|edit|export|mb|min|sec|fps|px|x\d+)\b)[a-z]{3,}/i,
          why: "reads like a street address",
        },
        { re: /ride[-_ ]?along/i, why: "drive past individual homes (could identify a property)" },
      ],
    },
    local: {
      home,
      probeCache: join(home, "probe-cache.json"),
      catalog: join(home, "footage-catalog.local.json"),
      review: join(home, "catalog-review.md"),
      stateWorktree: join(home, "state-worktree"),
    },
    state: {
      branch: "lvinit-agent-state",
      remote: "origin",
      // Relative to the state dir (repo root locally; the state branch on push).
      dataDir: join("data", AGENT),
      reportsDir: join("reports", AGENT),
    },
    inventory: {
      // Resolve real YouTube titles via the public oEmbed endpoint (no key).
      oembed: true,
    },
    producer: PRODUCER,
  };
  return mergeDeep(base, overrides);
}

function mergeDeep(a, b) {
  if (!b || typeof b !== "object" || Array.isArray(b)) return b === undefined ? a : b;
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) {
    out[k] = v && typeof v === "object" && !Array.isArray(v) && a?.[k] && typeof a[k] === "object" ? mergeDeep(a[k], v) : v;
  }
  return out;
}
