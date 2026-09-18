// ---------------------------------------------------------------------------
// NORMALIZE, DEDUPE, CLASSIFY — the cheap rules pass
//
// Everything here is deterministic and free. Its job is to turn a few hundred
// feed items into a short list worth paying judgment on, and to remember
// every story it looked at so nothing is analyzed twice.
//
//   normalize   canonical URL, stable id, fingerprint
//   dedupe      same URL, or headlines that are the same story
//   classify    which areas, which categories A–H, which noise rule
//   rank        which candidates go to judgment first
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";

const STOP = new Set("a an the and or of to in on for at by with from as is are was were be been it its this that these those new las vegas nv nevada says said will could would after over into about amid more than".split(" "));

/** Canonical URL: no tracking params, no fragment, no trailing slash. */
export function canonicalUrl(url) {
  try {
    const u = new URL(url);
    u.hash = "";
    for (const k of [...u.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|mc_|cmpid|ref$|oc$)/i.test(k)) u.searchParams.delete(k);
    }
    u.hostname = u.hostname.replace(/^www\./, "");
    if (u.pathname.length > 1) u.pathname = u.pathname.replace(/\/+$/, "");
    return u.toString().replace(/\/$/, "");
  } catch {
    return String(url ?? "").trim();
  }
}

/** Distinctive lowercase words of a headline. */
export function titleTokens(title) {
  return [...new Set(String(title ?? "").toLowerCase().replace(/[^a-z0-9$ ]+/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w)))];
}

/** Overlap coefficient of two headlines' distinctive words. */
export function titleSimilarity(a, b) {
  const A = new Set(titleTokens(a));
  const B = new Set(titleTokens(b));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter += 1;
  return inter / Math.min(A.size, B.size);
}

/** Order-insensitive fingerprint of a headline, used by reviewed-story memory. */
export function titleFingerprint(title) {
  return titleTokens(title).sort().join(" ");
}

function hash(text) {
  return createHash("sha1").update(text).digest("hex").slice(0, 10);
}

export function normalizeItems(items) {
  return items
    .filter((it) => it.title && it.url)
    .map((it) => {
      const url = canonicalUrl(it.url);
      return { ...it, url, id: `c-${hash(url)}`, fingerprint: titleFingerprint(it.title) };
    });
}

/** Drop repeats: identical URLs, then headlines that describe the same story. */
export function dedupe(items, { similarity = 0.6 } = {}) {
  const tierRank = { official: 0, builder: 1, news: 2, social: 3 };
  // Prefer the better source when two items are the same story.
  const sorted = [...items].sort((a, b) => (tierRank[a.tier] ?? 9) - (tierRank[b.tier] ?? 9) || (b.snippet?.length ?? 0) - (a.snippet?.length ?? 0));
  const kept = [];
  const seenUrls = new Set();
  const duplicates = [];
  for (const it of sorted) {
    if (seenUrls.has(it.url)) continue;
    seenUrls.add(it.url);
    // Social posts are never merged into news: they are a separate signal.
    const twin = it.tier === "social" ? null : kept.find((k) => k.tier !== "social" && titleSimilarity(k.title, it.title) >= similarity);
    if (twin) {
      twin.alsoReportedBy = [...(twin.alsoReportedBy ?? []), { sourceName: it.sourceName, url: it.url, published: it.published }];
      duplicates.push(it);
      continue;
    }
    kept.push(it);
  }
  return { kept, duplicates };
}

export function daysOld(iso, today) {
  if (!iso) return null;
  const ms = Date.parse(`${today}T23:59:59Z`) - Date.parse(iso);
  return Math.floor(ms / 86_400_000);
}

/** Areas, categories, builders and noise for one item. */
export function classifyItem(item, config) {
  const text = ` ${`${item.title} ${item.snippet ?? ""} ${item.excerpt ?? ""}`.toLowerCase()} `;
  const areas = config.areas.filter((a) => a.pattern.test(text)).map((a) => a.key);
  // "Henderson" is only Henderson, NV if the story says so, or the source is local.
  const localSource = item.via && item.via !== "google-news";
  const hasContext = localSource || config.vegasContext.test(text);
  const categories = config.categories.filter((c) => c.pattern.test(text)).map((c) => c.key);
  const noise = config.noise.find((n) => n.pattern.test(` ${item.title.toLowerCase()} `));
  return {
    areas: hasContext ? areas : [],
    categories,
    noise: noise?.reason ?? null,
    outOfArea: !hasContext,
  };
}

/** Best (lowest) tier of the areas an item names; 9 = none. */
export function bestAreaTier(areaKeys, config) {
  const tiers = areaKeys.map((k) => config.areas.find((a) => a.key === k)?.tier ?? 9);
  return tiers.length ? Math.min(...tiers) : 9;
}

/**
 * Cheap pre-score for ordering the short list. Not the content score — only
 * "which of these deserves the judgment budget first".
 */
export function prefilterScore(item, config) {
  const tier = bestAreaTier(item.areas, config);
  let s = { 1: 10, 2: 6, 3: 3 }[tier] ?? 0;
  s += Math.min(item.categories.length, 3) * 3;
  s += { official: 4, builder: 3, news: 2, social: 0 }[item.tier] ?? 0;
  s += Math.min((item.alsoReportedBy ?? []).length, 3) * 2;
  if (item.watchMatch) s += 4;
  if (config.developmentSignal?.test(` ${item.title.toLowerCase()} `)) s += 6;
  else if (config.developmentSignal?.test(` ${(item.snippet ?? "").toLowerCase()} `)) s += 2;
  return s;
}

/**
 * Split items into: social signals, rule-filtered noise (with reason), and
 * ranked candidates.
 */
export function triage(items, config, { today, reviewed, watchlist, modelAvailable = false }) {
  const signals = [];
  const filtered = [];
  const candidates = [];
  const alreadyReviewed = [];

  // A story only rules-judged is still owed a real judgment once a model is
  // available — so, with a model, "rules:" outcomes do not count as reviewed.
  const settled = Object.entries(reviewed.items ?? {}).filter(([, r]) => !(modelAvailable && String(r.outcome ?? "").startsWith("rules:")));
  const reviewedUrls = new Set(settled.map(([, r]) => r.url));
  const reviewedPrints = new Set(settled.map(([k]) => k));
  // Recent headlines, for "same story, different outlet, a day later".
  const recentTitles = settled
    .map(([, r]) => r)
    .filter((r) => r.title && (daysOld(`${r.first_seen}T12:00:00Z`, today) ?? 0) <= 30)
    .map((r) => r.title);

  for (const it of items) {
    const age = daysOld(it.published, today);
    if (age !== null && age > config.selection.maxAgeDays) continue; // stale: not even worth remembering
    if (reviewedUrls.has(it.url) || reviewedPrints.has(it.fingerprint)) {
      alreadyReviewed.push(it);
      continue;
    }
    // A near-identical headline already decided is the same story — unless it
    // is about a watched project, where a new outlet may carry new facts.
    if (!matchWatchlist(it, watchlist) && recentTitles.some((t) => titleSimilarity(t, it.title) >= 0.8)) {
      alreadyReviewed.push(it);
      continue;
    }
    const c = classifyItem(it, config);
    const enriched = { ...it, ...c, ageDays: age };

    if (it.tier === "social") {
      // Social is signal. It needs a Vegas area or a housing/lifestyle category to matter.
      if (!c.noise && (c.categories.length || c.areas.length)) signals.push(enriched);
      continue;
    }
    if (c.outOfArea) {
      filtered.push({ ...enriched, reason: "outside the Las Vegas valley" });
      continue;
    }
    if (c.noise) {
      filtered.push({ ...enriched, reason: c.noise });
      continue;
    }
    if (!c.categories.length) {
      filtered.push({ ...enriched, reason: "no housing, neighborhood, development or lifestyle angle" });
      continue;
    }
    if (!c.areas.length) {
      filtered.push({ ...enriched, reason: "no identifiable Las Vegas-area location" });
      continue;
    }
    enriched.watchMatch = matchWatchlist(enriched, watchlist)?.key ?? null;
    enriched.prefilter = prefilterScore(enriched, config);
    candidates.push(enriched);
  }

  candidates.sort((a, b) => b.prefilter - a.prefilter || String(b.published).localeCompare(String(a.published)));
  signals.sort((a, b) => String(b.published).localeCompare(String(a.published)));
  return {
    candidates: candidates.slice(0, config.selection.maxCandidates),
    deferred: candidates.slice(config.selection.maxCandidates),
    signals: signals.slice(0, config.selection.maxSignals),
    filtered,
    alreadyReviewed,
  };
}

/** Which watched project, if any, a headline is plainly about. */
export function matchWatchlist(item, watchlist) {
  let best = null;
  for (const p of watchlist?.projects ?? []) {
    const sim = titleSimilarity(p.name, item.title);
    const nameIn = item.title.toLowerCase().includes(String(p.name).toLowerCase());
    const score = nameIn ? 1 : sim;
    if (score >= 0.75 && (!best || score > best.score)) best = { key: p.key, score };
  }
  return best;
}
