// ---------------------------------------------------------------------------
// APIFY — unattended Instagram + TikTok research (and Mikey's own recent posts
// for the duplicate ledger)
//
// What leaves the PC: search keywords, hashtags and Mikey's public profile
// handles. Nothing else. No media, no catalog, no client data.
//
// Every call records Apify's own reported cost (usageTotalUsd) so the weekly
// run report shows the real number, not an estimate.
//
// STATUS: written against Apify's documented REST API; NOT yet tested with a
// real token. Treat outputs as unverified until the first live test passes.
// ---------------------------------------------------------------------------

const API = "https://api.apify.com/v2";

export const ACTORS = {
  tiktok: "clockworks~tiktok-scraper",
  instagram: "apify~instagram-scraper",
};

async function runActor(actor, input, { token, fetchImpl = fetch, waitSecs = 240 }) {
  const res = await fetchImpl(`${API}/acts/${actor}/runs?waitForFinish=${waitSecs}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Apify ${actor} run failed: HTTP ${res.status}`);
  let run = (await res.json()).data;
  // Long runs: poll until finished.
  for (let i = 0; i < 20 && !["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"].includes(run.status); i++) {
    await new Promise((r) => setTimeout(r, 15_000));
    run = (await (await fetchImpl(`${API}/actor-runs/${run.id}`, { headers: { authorization: `Bearer ${token}` } })).json()).data;
  }
  if (run.status !== "SUCCEEDED") throw new Error(`Apify ${actor} run ${run.id} ended ${run.status}`);
  const items = await (await fetchImpl(`${API}/datasets/${run.defaultDatasetId}/items?clean=true&format=json`, { headers: { authorization: `Bearer ${token}` } })).json();
  return { items, runId: run.id, usd: Number(run.usageTotalUsd ?? 0) };
}

const iso = (x) => (x ? new Date(typeof x === "number" && x < 1e12 ? x * 1000 : x).toISOString().slice(0, 10) : null);

export function normalizeTikTok(it) {
  return {
    platform: "TikTok",
    url: it.webVideoUrl ?? it.url ?? null,
    creator: it.authorMeta?.name ? `@${it.authorMeta.name}` : null,
    creatorFollowers: it.authorMeta?.fans ?? null,
    date: iso(it.createTimeISO ?? it.createTime),
    format: it.isSlideshow || it.imagePost ? "photo carousel" : `video${it.videoMeta?.duration ? `, ${it.videoMeta.duration}s` : ""}`,
    text: it.text ?? "",
    metrics: { plays: it.playCount, likes: it.diggCount, comments: it.commentCount, shares: it.shareCount, saves: it.collectCount },
  };
}

export function normalizeInstagram(it) {
  const type = it.type === "Sidecar" ? "carousel" : it.type === "Video" ? "reel" : "image";
  return {
    platform: "Instagram",
    url: it.url ?? (it.shortCode ? `https://www.instagram.com/p/${it.shortCode}/` : null),
    creator: it.ownerUsername ? `@${it.ownerUsername}` : null,
    date: iso(it.timestamp),
    format: type,
    text: it.caption ?? "",
    // Instagram doesn't expose other accounts' saves or shares; never estimate them.
    metrics: { likes: it.likesCount, comments: it.commentsCount, views: it.videoViewCount ?? it.videoPlayCount },
  };
}

/** Keyword research across both platforms. Returns { posts, usd, runs }. */
export async function research({ queries, token, perQuery = 15, fetchImpl }) {
  const posts = [];
  let usd = 0;
  const runs = [];
  const tt = await runActor(ACTORS.tiktok, { searchQueries: queries, resultsPerPage: perQuery, searchSection: "/video", shouldDownloadVideos: false, shouldDownloadCovers: false }, { token, fetchImpl });
  usd += tt.usd;
  runs.push({ actor: ACTORS.tiktok, runId: tt.runId, usd: tt.usd, items: tt.items.length });
  posts.push(...tt.items.map(normalizeTikTok));
  const ig = await runActor(ACTORS.instagram, { search: queries.join(", "), searchType: "hashtag", searchLimit: 3, resultsType: "posts", resultsLimit: perQuery }, { token, fetchImpl });
  usd += ig.usd;
  runs.push({ actor: ACTORS.instagram, runId: ig.runId, usd: ig.usd, items: ig.items.length });
  posts.push(...ig.items.map(normalizeInstagram));
  return { posts: posts.filter((p) => p.url && p.date), usd, runs };
}

/** Mikey's own recent public posts, for the duplicate ledger. */
export async function ownRecentPosts({ instagram, tiktok, token, limit = 20, fetchImpl }) {
  const out = [];
  let usd = 0;
  if (instagram) {
    const r = await runActor(ACTORS.instagram, { directUrls: [`https://www.instagram.com/${instagram}/`], resultsType: "posts", resultsLimit: limit }, { token, fetchImpl });
    usd += r.usd;
    out.push(...r.items.map(normalizeInstagram));
  }
  if (tiktok) {
    const r = await runActor(ACTORS.tiktok, { profiles: [tiktok], resultsPerPage: limit, shouldDownloadVideos: false, shouldDownloadCovers: false }, { token, fetchImpl });
    usd += r.usd;
    out.push(...r.items.map(normalizeTikTok));
  }
  return { posts: out, usd };
}

/**
 * Label a reference honestly. "outperformed" only with a creator baseline
 * (their median plays/likes over recent posts) of at least 5 posts.
 */
export function labelReference(post, today, baseline) {
  const ageDays = (Date.parse(today) - Date.parse(post.date)) / 86_400_000;
  const metric = post.metrics.plays ?? post.metrics.views ?? post.metrics.likes;
  if (baseline?.n >= 5 && baseline.median > 0 && metric >= 2 * baseline.median) {
    return `${ageDays <= 90 ? "recent" : "older"}, about ${Math.round(metric / baseline.median)}x this creator's median of ${baseline.n} recent posts`;
  }
  return ageDays <= 90 ? "recent example" : "older example";
}
