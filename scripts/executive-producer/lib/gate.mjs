// ---------------------------------------------------------------------------
// EDITORIAL GATE — the standing checks every post must pass before Mikey
// sees the batch
//
//   duplicate      same topic as something Mikey published or scheduled
//                  recently, or something an earlier batch already produced
//   superlative    "best / only / closest / any official…" with no source
//                  sentence that actually says it
//   financial      money, rates, percentages, programs, legal rules: must
//                  cite an OFFICIAL (or named news) source checked within
//                  `maxAgeDays`; program availability is never implied
//   generic        advice with no Las Vegas specifics ("get pre-approved")
//   image          the same file+moment twice in the week (or recent weeks),
//                  and visually near-identical slides (perceptual hash)
//
// A failing post is not delivered with a warning: the orchestrator swaps in
// a backup idea and re-runs the gate. Anything still unresolved is reported
// as an exception at the top of the review, never buried in notes.
// ---------------------------------------------------------------------------

const DAY_MS = 86_400_000;

/** Topic tags: the vocabulary duplication is judged on. */
export const TOPIC_TAGS = [
  ["new-build", /new[- ]?build|new construction|builder|model home/i],
  ["incentives", /incentive|buy[- ]?down|preferred lender/i],
  ["resale", /\bresale\b/i],
  ["inspection", /inspection|inspector/i],
  ["down-payment", /down payment|\d+% down|fha|\bva\b loan|assistance program/i],
  ["mortgage-rates", /mortgage rate|interest rate|\brates?\b.*(7|6)\s?%/i],
  ["market-update", /median|home prices|inventory|market update/i],
  ["property-tax", /property tax|tax cap|abatement/i],
  ["hoa-sid-lid", /\bhoa\b|\bsid\b|\blid\b|special assessment|master assessment/i],
  ["monument-hills", /monument hills/i],
  ["best-area", /best area|“best” area|"best" area/i],
  ["arts-district", /arts district|18b/i],
  ["henderson", /henderson|green valley|inspirada|macdonald|lake las vegas|water street/i],
  ["summerlin", /summerlin|red rock/i],
  ["southwest", /southwest|enterprise|spring valley|mountain.?s edge|southern highlands|rhodes ranch/i],
  ["north-las-vegas", /north las vegas|aliante|tule springs/i],
  ["summer-heat", /summer|monsoon|heat|air condition|\bac\b/i],
  ["rent-vs-buy", /rent first|buy first|rent or buy/i],
];

export function tagsFor(text) {
  return TOPIC_TAGS.filter(([, re]) => re.test(String(text))).map(([t]) => t);
}

const postText = (p) =>
  [p.title, p.takeaway, p.caption, ...(p.slides ?? []).flatMap((s) => [s.headline, s.body]), ...(p.segments ?? []).flatMap((s) => [s.headline, s.body])]
    .filter(Boolean)
    .join("\n");

const onImageText = (p) => [...(p.slides ?? []).flatMap((s) => [s.headline, s.body]), ...(p.segments ?? []).flatMap((s) => [s.headline, s.body])].filter(Boolean).join("\n");

/** The post's PRIMARY topics: tags on its title + takeaway (captions mention too much in passing). */
export function primaryTags(p) {
  return p.topics?.length ? p.topics : tagsFor(`${p.title}\n${p.takeaway}`);
}

// --- 1. duplication --------------------------------------------------------------

/**
 * `ledger` entries: { date, source: "instagram"|"tiktok"|"youtube"|"batch"|"scheduled", text, url? , tags? }.
 * A post duplicates if any of its primary tags appears in a ledger entry
 * within `windowDays` — except area tags alone (an area can be covered from a
 * new angle); area tags only count when the ledger entry shares a non-area tag too.
 */
const AREA_TAGS = new Set(["henderson", "summerlin", "southwest", "north-las-vegas", "arts-district"]);

export function checkDuplicate(p, ledger, today, windowDays = 21) {
  const mine = primaryTags(p);
  const issues = [];
  for (const e of ledger) {
    if (!e.date || (Date.parse(today) - Date.parse(e.date)) / DAY_MS > windowDays) continue;
    const theirs = e.tags ?? tagsFor(e.text);
    const shared = mine.filter((t) => theirs.includes(t));
    const substantive = shared.filter((t) => !AREA_TAGS.has(t));
    const areaOnlyTopic = mine.every((t) => AREA_TAGS.has(t)) && shared.length;
    if (substantive.length || (areaOnlyTopic && e.source === "batch")) {
      issues.push({ check: "duplicate", message: `Overlaps "${String(e.text).slice(0, 70)}" (${e.source}, ${e.date}) on ${[...(substantive.length ? substantive : shared)].join(", ")}.` });
    }
  }
  return issues;
}

// --- 2. unsupported superlatives -------------------------------------------------

// Claim-type superlatives and sweeping absolutes. Ordinary words like "every",
// "only" or "first-come" are not flagged; they rarely carry a comparative claim.
const SUPERLATIVE = /\b(best|worst|closest|most [a-z]+|#1|number one|nobody|no one|everyone|everybody|any (?:government|official|map))\b|\b[a-z]+est\b/gi;
const NOT_SUPERLATIVE = new Set(["interest", "rest", "west", "test", "best-", "guest", "honest", "request", "harvest", "forest", "earnest", "latest", "modest", "suggest", "protest", "invest", "manifest", "southwest", "northwest", "nest", "chest", "quest", "arrest", "digest", "contest", "pest", "midwest", "priest", "biggest-", "interest", "requests", "suggests", "honest", "west", "forest", "harvest", "earnest", "manifest", "invest", "protest", "rest", "test", "latest"]);

const STOP = new Set("the a an and or of in to for is are it its this that on at be by as with from you your i we our they their has have had was were not no but so if than then there here what which who when where how".split(" "));
const contentWords = (s) => new Set(String(s).toLowerCase().replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)));

/**
 * A superlative on the image/caption is supported only if some cited source
 * SENTENCE uses the same superlative and shares at least two content words
 * with the claim around it ("Nevada's second-largest city" ↔ "It is an
 * incorporated city, Nevada's second largest"). Otherwise it's flagged.
 */
export function checkSuperlatives(p, sourceTexts) {
  const text = postText(p);
  const sentences = sourceTexts.join("\n").split(/(?<=[.!?])\s+|\n+/).map((s) => s.toLowerCase());
  const issues = [];
  const seen = new Set();
  for (const m of text.matchAll(SUPERLATIVE)) {
    const w = m[0].toLowerCase();
    if (NOT_SUPERLATIVE.has(w)) continue;
    // Names and fixed phrases, not claims: "First Friday", "first-time buyer", "your first summer".
    if (/^(firsts+(friday|summer|time|year|month|week|las vegas summer)|first-time)/i.test(text.slice(m.index, m.index + 30))) continue;
    const clause = text.slice(Math.max(0, m.index - 60), m.index + m[0].length + 60).split(/[.!?\n]/).find((c) => c.toLowerCase().includes(w)) ?? "";
    if (seen.has(clause)) continue;
    seen.add(clause);
    const ctx = contentWords(clause);
    ctx.delete(w);
    const supported = sentences.some((s) => new RegExp(`\\b${w.replace(/[#]/g, "")}\\b`).test(s) && [...ctx].filter((c) => s.includes(c)).length >= 2);
    if (!supported) issues.push({ check: "superlative", message: `"${clause.trim().slice(0, 80)}": "${w}" isn't backed by a cited source sentence.` });
  }
  return issues;
}

// --- 3. stale / unofficial financial and legal claims ------------------------------

const FINANCIAL = /\$\s?\d|\d+(?:\.\d+)?\s?%|\brates?\b|\bprogram\b|\bassistance\b|\bgrant\b|\bfunds?\b|\bfunding\b|\btax(?:es)?\b|\bnrs\b|\blaw\b|\bassessment|\blien\b|\bfha\b|\bva\b|\bmortgage\b/i;
const AVAILABILITY = /\b(still available|available now|now available|still has funding|funds? (?:remain|left)|apply (?:now|today)|open to)\b/i;

/**
 * Every source in `p.sources` carries { url, authority: official|news|lvinit, checked: YYYY-MM-DD }.
 * A post with financial/legal language on its images or caption needs at least one official or news
 * source checked within maxAgeDays; LVINIT's own article alone isn't enough.
 */
export function checkFinancial(p, today, maxAgeDays = 30) {
  const text = postText(p);
  const issues = [];
  if (!FINANCIAL.test(onImageText(p)) && !FINANCIAL.test(p.caption ?? "")) return issues;
  const fresh = (p.sources ?? []).filter((s) => ["official", "news"].includes(s.authority) && s.checked && (Date.parse(today) - Date.parse(s.checked)) / DAY_MS <= maxAgeDays);
  if (!fresh.length) issues.push({ check: "financial", message: `Money/tax/legal language with no official or news source checked in the last ${maxAgeDays} days.` });
  if (AVAILABILITY.test(text)) issues.push({ check: "financial", message: "Implies a program is currently available. Availability can't be established from a live page or an old count." });
  const stale = (p.sources ?? []).filter((s) => s.asOf && (Date.parse(today) - Date.parse(s.asOf)) / DAY_MS > 180 && /\$|%|count|funded|rate/i.test(s.claim));
  for (const s of stale) issues.push({ check: "financial", message: `Uses a figure dated ${s.asOf} ("${s.claim.slice(0, 60)}"), older than 6 months.` });
  return issues;
}

// --- 4. generic Realtor content ------------------------------------------------------

const LOCAL = /las vegas|vegas|nevada|clark county|henderson|summerlin|southwest|north las vegas|enterprise|spring valley|green valley|inspirada|macdonald|lake las vegas|water street|arts district|18b|red rock|215|i-15|mountain.?s edge|southern highlands|blue diamond|durango|strip|monsoon|nrs/i;
const GENERIC = /get pre-?approved|work with (?:a|an) (?:agent|realtor)|curb appeal|staging tips|tips for (?:first[- ]time )?buyers|don.t skip the inspection|dream home|now is (?:a|the) (?:great|good) time/i;

export function checkGeneric(p) {
  const img = onImageText(p);
  const issues = [];
  const localHits = new Set((img.match(new RegExp(LOCAL, "gi")) ?? []).map((x) => x.toLowerCase()));
  if (localHits.size === 0) issues.push({ check: "generic", message: "No Las Vegas-specific detail on the images; reads as generic Realtor advice." });
  const g = postText(p).match(GENERIC);
  if (g) issues.push({ check: "generic", message: `Generic Realtor phrasing: "${g[0]}".` });
  return issues;
}

// --- 5. repeated images ----------------------------------------------------------

const imageKey = (src) => `${String(src.path).replace(/\\/g, "/").toLowerCase()}@${src.t ?? "still"}`;

/** Same file within `tol` seconds (or the same still) anywhere in the set = repeat. */
export function checkRepeatedSources(week, previousWeeks = [], tol = 4) {
  const issues = new Map();
  const add = (day, msg) => (issues.get(day) ?? issues.set(day, []).get(day)).push({ check: "image", message: msg });
  const uses = [];
  const collect = (w, isPrev) => {
    for (const p of w.posts ?? []) {
      for (const s of p.slides ?? []) uses.push({ day: p.day, prev: isPrev, week: w.weekOf, path: String(s.src.path).replace(/\\/g, "/").toLowerCase(), t: s.src.t });
      for (const s of p.segments ?? []) uses.push({ day: p.day, prev: isPrev, week: w.weekOf, path: String(s.path).replace(/\\/g, "/").toLowerCase(), t: s.start, dur: s.dur });
    }
  };
  collect(week, false);
  for (const w of previousWeeks) collect(w, true);
  const cur = uses.filter((u) => !u.prev);
  for (let i = 0; i < cur.length; i++) {
    for (let j = 0; j < uses.length; j++) {
      const a = cur[i];
      const b = uses[j];
      if (a === b || a.path !== b.path) continue;
      if (!b.prev && j >= i) continue; // within the week, flag the LATER use
      const same = a.t === undefined || b.t === undefined ? a.t === b.t : Math.abs(a.t - b.t) < tol + (a.dur ?? 0) / 2 + (b.dur ?? 0) / 2;
      if (same) add(a.day, `Reuses ${a.path.split("/").slice(-2).join("/")}${a.t !== undefined ? ` @${a.t}s` : ""} (${b.prev ? `week of ${b.week}` : b.day}).`);
    }
  }
  return issues;
}

/** 64-bit difference hash of an image, for near-duplicate detection after render. */
export async function dhash(sharp, file) {
  const px = await sharp(file).grayscale().resize(9, 8, { fit: "fill" }).raw().toBuffer();
  let h = 0n;
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) h = (h << 1n) | (px[y * 9 + x] > px[y * 9 + x + 1] ? 1n : 0n);
  return h;
}

export function hamming(a, b) {
  let x = a ^ b;
  let n = 0;
  while (x) {
    n += Number(x & 1n);
    x >>= 1n;
  }
  return n;
}

/** Rendered media: flag pairs that look nearly identical (text overlays barely move the hash). */
export async function checkNearDuplicateRenders(sharp, posts, threshold = 8) {
  const items = [];
  for (const p of posts) for (const f of p.rawFrames ?? []) items.push({ day: p.day, f, h: await dhash(sharp, f) });
  const issues = new Map();
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (hamming(items[i].h, items[j].h) <= threshold) {
        const msg = `Near-identical images: ${items[i].f.split(/[\\/]/).slice(-2).join("/")} and ${items[j].f.split(/[\\/]/).slice(-2).join("/")}.`;
        (issues.get(items[j].day) ?? issues.set(items[j].day, []).get(items[j].day)).push({ check: "image", message: msg });
      }
    }
  }
  return issues;
}

/** Run every text-level check for one post. Image checks run week-wide. */
export function gatePost(p, { ledger, today, sourceTexts }) {
  return [...checkDuplicate(p, ledger, today), ...checkSuperlatives(p, sourceTexts), ...checkFinancial(p, today), ...checkGeneric(p)];
}
