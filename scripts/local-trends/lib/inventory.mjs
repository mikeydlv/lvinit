// ---------------------------------------------------------------------------
// WHAT LVINIT ALREADY HAS
//
// Before recommending a topic the agent checks it against what is already
// published, so it can say "update this guide" or "this guide needs a video"
// instead of pitching a duplicate.
//
// Pages come from the Internal Linking Agent's link graph, reused unchanged, so
// every agent agrees on what exists and what counts as published (drafts in
// lib/content.ts are skipped). Videos come from the `videos` list in
// lib/content.ts — the real, published YouTube videos.
//
// Nothing here writes.
// ---------------------------------------------------------------------------

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { buildLinkGraph } from "../../internal-links/lib/graph.mjs";
import { loadConfig as loadLinksConfig } from "../../internal-links/config.mjs";

import { titleTokens } from "./classify.mjs";

/** Parse the published videos out of lib/content.ts without executing it. */
export function readVideos(source) {
  const block = (String(source).match(/export const videos[^=]*=\s*\[([\s\S]*?)\n\];/) ?? [])[1] ?? "";
  const videos = [];
  for (const obj of block.match(/\{[\s\S]*?\n\s{2}\}/g) ?? []) {
    const id = (obj.match(/\bid:\s*"([^"]+)"/) ?? [])[1];
    const youtubeId = (obj.match(/\byoutubeId:\s*"([^"]+)"/) ?? [])[1];
    const title = (obj.match(/\btitle:\s*"([^"]+)"/) ?? obj.match(/\btitle:\s*\n\s*"([^"]+)"/) ?? [])[1];
    if (id && title) videos.push({ id, title, url: youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null });
  }
  return videos;
}

export function buildInventory({ repoRoot, today }) {
  const linksConfig = loadLinksConfig({ content: { useGitDates: false }, gsc: { enabled: false }, factDecay: { enabled: false } });
  const graph = buildLinkGraph({ repoRoot, config: linksConfig, today });
  const pages = [...graph.pages.values()]
    .map((p) => ({
      route: p.route,
      title: p.title,
      category: p.category ?? null,
      section: p.section,
      publishedAt: p.publishedAt ?? null,
      description: p.description ?? null,
    }))
    .sort((a, b) => a.route.localeCompare(b.route));

  const registry = join(repoRoot, "lib", "content.ts");
  const videos = existsSync(registry) ? readVideos(readFileSync(registry, "utf8")) : [];
  return inventoryFrom({ pages, videos });
}

export function inventoryFrom({ pages, videos }) {
  return {
    pages,
    videos,
    routes: new Set(pages.map((p) => p.route)),
    totals: { pages: pages.length, videos: videos.length },
  };
}

/**
 * Pages plausibly about the same thing as a topic — used in rules-only mode,
 * and as a sanity net under the model's own suggestions.
 */
export function relatedPages(inventory, { text, areas = [] }, limit = 3) {
  const words = new Set(titleTokens(text));
  const scored = inventory.pages.map((p) => {
    const hay = `${p.route.replace(/[/-]/g, " ")} ${p.title} ${p.description ?? ""}`.toLowerCase();
    let s = 0;
    for (const w of words) if (hay.includes(w)) s += 1;
    for (const a of areas) if (hay.includes(a.replace(/-/g, " "))) s += 3;
    return { page: p, s };
  });
  return scored
    .filter((x) => x.s >= 3)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.page);
}
