// ---------------------------------------------------------------------------
// LVINIT MEDIA IMAGE LIBRARY AGENT — CONFIGURATION
//
// Every daily run turns Mikey's own LVINIT footage into exactly 10 new,
// article-ready still images, indexed so the Content Publisher can find them.
//
// This file is committed to a PUBLIC repository. It must never name a client,
// a property address, a listing, or a private shoot. Which footage folders are
// public-safe is decided ONLY by the Executive Producer's local privacy file
// (~/.lvinit/executive-producer/privacy.json), which this agent reads and never
// edits. A folder that file hasn't approved is never sampled.
//
// See docs/IMAGE_LIBRARY_AGENT.md.
// ---------------------------------------------------------------------------

import { homedir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const AGENT = "image-library";
export const SCHEMA_VERSION = "1.0.0";
export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

function envStr(name, fallback) {
  const raw = process.env[name];
  return raw === undefined || String(raw).trim() === "" ? fallback : String(raw).trim();
}
function envInt(name, fallback) {
  const n = Number.parseInt(String(process.env[name] ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * The LVINIT topic universe. `re` finds the topic in article titles/slugs and
 * in the strategy map; Claude tags each accepted image with these ids.
 */
export const TOPICS = {
  "moving-to-las-vegas": { label: "Moving to Las Vegas", re: /moving to|relocat|cost of living|first summer|rent.first|buy.first|test drive/i },
  summerlin: { label: "Summerlin", re: /summerlin|red rock|grand ?park|the lakes/i },
  henderson: { label: "Henderson", re: /henderson|inspirada|green valley|macdonald highlands|water street/i },
  southwest: { label: "Southwest Las Vegas", re: /southwest|mountains? edge|rhodes ranch|southern highlands|the bend|uncommons|durango/i },
  "north-las-vegas": { label: "North Las Vegas", re: /north las vegas|civic center|gholson/i },
  northwest: { label: "Northwest Las Vegas", re: /northwest|centennial|skye canyon|monument hills/i },
  "tule-springs": { label: "Tule Springs", re: /tule springs|sandstone/i },
  "skye-canyon": { label: "Skye Canyon", re: /skye canyon/i },
  sunstone: { label: "Sunstone", re: /sunstone/i },
  "monument-hills": { label: "Monument Hills", re: /monument hills/i },
  "lake-las-vegas": { label: "Lake Las Vegas", re: /lake las vegas/i },
  "southern-highlands": { label: "Southern Highlands", re: /southern highlands|\bsohi\b/i },
  downtown: { label: "Downtown Las Vegas / Arts District", re: /arts district|downtown las vegas|fremont/i },
  "las-vegas-strip": { label: "Las Vegas Strip & skyline", re: /\bstrip\b|skyline|casino|monorail/i },
  "new-construction": { label: "Las Vegas new construction", re: /new.?construction|new.?build|new homes|builder|model home|starter home/i },
  "master-planned": { label: "Master-planned communities", re: /master.?planned|community/i },
  "new-vs-resale": { label: "New build vs resale", re: /resale|new.?build vs|new vs/i },
  housing: { label: "Las Vegas housing & home types", re: /home prices|housing|homes|500k|inventory|buyer|market/i },
  development: { label: "Growth & development", re: /redevelopment|development|growth|civic center|apex|construction/i },
  transportation: { label: "Roads & commuting", re: /commut|freeway|beltway|\b215\b|\bi-15\b|\b95\b|traffic|transport/i },
  outdoors: { label: "Parks, trails & outdoor lifestyle", re: /\bparks?\b|trail|outdoor|hiking|red rock/i },
  mountains: { label: "Mountain views", re: /mountain|red rock|charleston|la madre/i },
  "retail-commercial": { label: "Retail & commercial areas", re: /shopping|retail|district|restaurant|storefront|the bend|uncommons|sport.*social/i },
  "water-environment": { label: "Water & environment", re: /water|drought|lake mead|heat|summer|desert/i },
  luxury: { label: "Luxury homes", re: /luxury|four seasons|macdonald highlands|estate|private residences/i },
  "cost-of-living": { label: "Cost of living & ownership costs", re: /cost of living|property tax|hoa|sid|lid|mortgage|rates|down payment|afford/i },
};

/**
 * Footage folder → the topics it is LIKELY to cover (longest prefix wins).
 * A sampling hint only: what an image shows is confirmed by looking at it.
 * `place` is the location evidence a filename may use; null = no place proven.
 */
export const FOLDER_HINTS = {
  "Media/Summerlin": { place: "Summerlin", topics: ["summerlin", "master-planned", "housing"] },
  "Media/Summerlin/Downtown Summerlin": { place: "Downtown Summerlin", topics: ["summerlin", "retail-commercial"] },
  "Media/Summerlin/GrandPark West": { place: "Grand Park, Summerlin West", topics: ["summerlin", "new-construction", "outdoors"] },
  "Media/Summerlin/Mesa Ridge park": { place: "Mesa Ridge Park, Summerlin", topics: ["summerlin", "outdoors"] },
  "Media/Summerlin/Red Rock": { place: "Red Rock Canyon", topics: ["summerlin", "outdoors", "mountains"] },
  // The Lakes sits in west Las Vegas; it is not part of Summerlin.
  "Media/Summerlin/The Lakes": { place: "The Lakes", topics: ["housing", "water-environment"] },
  "Media/Summerlin/JW Mariott Garage": { place: "Summerlin", topics: ["summerlin", "las-vegas-strip"] },
  "Media/Henderson": { place: "Henderson", topics: ["henderson", "housing"] },
  "Media/Henderson/215": { place: "Henderson", topics: ["henderson", "transportation"] },
  "Media/Henderson/Inspirada": { place: "Inspirada, Henderson", topics: ["henderson", "master-planned", "new-construction"] },
  "Media/Henderson/Lake Las Vegas": { place: "Lake Las Vegas, Henderson", topics: ["lake-las-vegas", "henderson", "luxury"] },
  "Media/Henderson/MacDonald Highlands": { place: "MacDonald Highlands, Henderson", topics: ["henderson", "luxury"] },
  "Media/Henderson/Aries": { place: "Henderson", topics: ["henderson", "development"] },
  "Media/Henderson/Henderson Sports And Social": { place: "Henderson", topics: ["henderson", "retail-commercial"] },
  "Media/SouthWest": { place: "Southwest Las Vegas", topics: ["southwest", "housing", "new-construction"] },
  "Media/SouthWest/Durango Casino": { place: "Southwest Las Vegas", topics: ["southwest", "development", "retail-commercial"] },
  "Media/SouthWest/Lennar Marcia": { place: "Southwest Las Vegas", topics: ["southwest", "new-construction"] },
  "Media/SouthWest/The Bend": { place: "The Bend, Southwest Las Vegas", topics: ["southwest", "retail-commercial"] },
  "Media/SouthWest/UnCommons": { place: "UnCommons, Southwest Las Vegas", topics: ["southwest", "retail-commercial"] },
  "Media/SoHi": { place: "Southern Highlands", topics: ["southern-highlands", "southwest", "master-planned"] },
  "Media/North Las Vegas": { place: "North Las Vegas", topics: ["north-las-vegas", "housing"] },
  "Media/Skye Canyon": { place: "Skye Canyon, Northwest Las Vegas", topics: ["skye-canyon", "northwest", "master-planned"] },
  "Media/Centennial": { place: "Centennial Hills, Northwest Las Vegas", topics: ["northwest", "housing"] },
  "Media/Monument Hills": { place: "Monument Hills, Northwest Las Vegas", topics: ["monument-hills", "northwest", "development"] },
  "Media/Landings at Sunstone - KB Homes": { place: "Sunstone, Northwest Las Vegas", topics: ["sunstone", "new-construction", "northwest"] },
  // A KB Home walkthrough whose location is not established (see the Producer config).
  "Media/KB Homes": { place: null, topics: ["new-construction", "housing"] },
  "Media/Arts District": { place: "Arts District, Downtown Las Vegas", topics: ["downtown", "retail-commercial"] },
  "Media/Monorail from Sahara": { place: "Las Vegas Strip", topics: ["las-vegas-strip", "transportation"] },
  "Media/The Strip": { place: "Las Vegas Strip", topics: ["las-vegas-strip"] },
  "Media/UNLV": { place: "UNLV", topics: ["moving-to-las-vegas"] },
  "Media/215": { place: "215 Beltway, Las Vegas", topics: ["transportation"] },
  "Media/15 NB": { place: "I-15, Las Vegas", topics: ["transportation"] },
  "Media/95 NB": { place: "US-95, Las Vegas", topics: ["transportation"] },
  "Videos/Monument Hills": { place: "Monument Hills, Northwest Las Vegas", topics: ["monument-hills", "northwest", "development"] },
  "Videos/Move to Las Vegas in 2026": { place: null, topics: ["moving-to-las-vegas", "housing"] },
  "Videos/New vs Resale": { place: null, topics: ["new-vs-resale", "new-construction", "housing"] },
  "Videos/What you can buy for $500k in Las Vegas": { place: null, topics: ["housing", "cost-of-living"] },
  "Videos/Summerlin vs Henderson vs SouthWest": { place: null, topics: ["summerlin", "henderson", "southwest"] },
  "Videos/Rent vs Buy": { place: null, topics: ["moving-to-las-vegas", "cost-of-living"] },
  "Videos/4 seasons private residences": { place: "Henderson", topics: ["luxury", "henderson"] },
  "Videos/Summerlin 4th of July Parade": { place: "Summerlin", topics: ["summerlin"] },
  "Videos/Landings at Sandstone KB": { place: "Sandstone, Tule Springs, North Las Vegas", topics: ["tule-springs", "new-construction", "north-las-vegas"] },
  "Videos/Aries Henderson": { place: "Henderson", topics: ["henderson", "development"] },
};

/** Place words a filename may only use when the source's location evidence supports them. */
export const PLACE_TERMS = [
  "summerlin", "henderson", "inspirada", "southwest", "north-las-vegas", "northwest", "tule-springs", "sandstone",
  "skye-canyon", "sunstone", "monument-hills", "lake-las-vegas", "southern-highlands", "centennial", "macdonald-highlands",
  "green-valley", "downtown-summerlin", "grand-park", "red-rock", "arts-district", "mesa-ridge", "the-lakes", "the-bend",
  "uncommons", "durango", "unlv", "mountains-edge", "rhodes-ranch", "aliante", "enterprise", "spring-valley", "boulder-city",
];

export const CATEGORIES = [
  "aerial-neighborhood", "community-entrance-signage", "home-exteriors", "model-home", "streetscape", "park-trail",
  "mountain-view", "amenity", "retail-commercial", "construction-development", "road-interchange", "skyline-strip",
  "master-planned-community", "lifestyle", "landscape-environment",
];

export function loadConfig(overrides = {}) {
  const home = envStr("LVINIT_IMAGE_LIBRARY_HOME", join(homedir(), ".lvinit", AGENT));
  const mediaRoot = envStr("LVINIT_MEDIA_ROOT", "C:\\LVINIT");
  const base = {
    repo: REPO_ROOT,
    mediaRoot,
    // Finished JPGs are ADDED here (never overwrite, rename or delete anything).
    libraryDir: envStr("LVINIT_IMAGE_LIBRARY_DIR", join(mediaRoot, "Images")),
    // Read-only copy of the index for anything on this PC that wants it.
    indexMirror: envStr("LVINIT_IMAGE_INDEX_MIRROR", join(mediaRoot, "Automation", "lvinit-image-library.json")),
    index: "data/image-library/lvinit-image-library.json",
    webDir: "public/images/editorial",
    webBase: "/images/editorial/",
    home,
    state: join(home, "state.json"),
    probeCache: join(home, "probe-cache.json"),
    runsDir: join(home, "runs"),
    log: join(home, "image-library.log"),
    lock: join(home, ".run.lock"),
    envFile: envStr("LVINIT_IMAGE_LIBRARY_ENV", join(homedir(), ".lvinit", "executive-producer", ".env")),
    producerProbeCache: join(homedir(), ".lvinit", "executive-producer", "probe-cache.json"),
    target: envInt("IMAGE_LIBRARY_COUNT", 10),
    // Folders that are never sampled even when approved: edited graphics, captioned
    // vertical cuts, review renders and editor intermediates.
    skipFolder: /(^|\/)(graphics|opusclip|shorts|review|conformed|conformedh264|tests|out|chapter placeholders|movie inspo memes|a-roll|aroll)(\/|$)/i,
    skipFile: /short|reel|thumbnail|chapter|_card|card_|graphic|p4444|lower.?third|title|intro|outro|teaser|promo|caption|subtitle/i,
    frames: {
      minSourceWidth: 1280, // never upscale: smaller footage is skipped
      maxLongEdge: 1920,
      jpegQuality: 82,
      maxBytes: 900_000,
      perClipSamples: [3, 10],
      // Seconds kept clear around anything already examined in a clip.
      examinedGap: 4,
      acceptedGap: 10,
    },
    quality: {
      minSharpness: 200, // Laplacian energy on a 640px grayscale frame (dashcam ≈250–400, drone ≈700+)
      minMean: 45,
      maxMean: 212,
      maxClipped: 0.22,
      maxCrushed: 0.35,
      minContrast: 24,
      nearDupBits: 10, // dHash Hamming distance at or below = same picture
    },
    selection: {
      clipsPerRound: 12,
      maxRounds: 5,
      maxVisionImages: 90,
      batchSize: 6,
      maxPerPlace: 2,
      maxPerFolder: 1, // +1 only if 10 can't be met otherwise
      maxPerArea: 3, // by the folder's primary topic (summerlin, henderson, southwest…)
      maxPerClip: 1,
      maxPortrait: 2,
    },
    vision: {
      model: envStr("IMAGE_LIBRARY_MODEL", "claude-opus-5-5"),
      effort: envStr("IMAGE_LIBRARY_EFFORT", "medium"),
      reviewWidth: 1024,
    },
    git: {
      remote: "origin",
      branch: "main",
      authorName: "LVINIT Image Library Agent",
      authorEmail: envStr("IMAGE_LIBRARY_GIT_EMAIL", "mikeydelrosario@live.com"),
      push: envStr("IMAGE_LIBRARY_PUSH", "true") !== "false",
    },
  };
  return { ...base, ...overrides };
}

/** Longest-prefix hint for a footage path ("Media/Henderson/Inspirada/x.MP4"). */
export function hintFor(rel) {
  const path = String(rel).replace(/\\/g, "/");
  let best = null;
  for (const [prefix, hint] of Object.entries(FOLDER_HINTS)) {
    if ((path === prefix || path.startsWith(prefix + "/")) && (!best || prefix.length > best.prefix.length)) best = { prefix, ...hint };
  }
  return best ?? { prefix: null, place: null, topics: [] };
}
