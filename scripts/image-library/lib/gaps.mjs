// ---------------------------------------------------------------------------
// GAPS — what the site's articles need, so each day's images fill real gaps
//
//   articles      the `guides` registry in lib/content.ts + neighborhood pillars
//   imageUsage    every /images/... path referenced in app/, lib/, components/
//   topicNeeds    per topic: articles, weak imagery (cover art, reused photo,
//                 no image), strategy-map mentions, and what the library holds
//   priorities    need ÷ supply, so a topic with many images ranks lower
// ---------------------------------------------------------------------------

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

import { TOPICS } from "../config.mjs";

/** Parse the guides registry without executing TypeScript. */
export function parseGuides(source) {
  const start = source.indexOf("export const guides");
  if (start < 0) return [];
  const body = source.slice(start);
  const out = [];
  const re = /\{\s*slug:\s*"([^"]+)"([\s\S]*?)href:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(body))) {
    const block = m[2];
    const get = (k) => block.match(new RegExp(`${k}:\\s*\\n?\\s*"([^"]*)"`))?.[1] ?? null;
    out.push({
      slug: m[1],
      title: get("title") ?? m[1],
      category: get("category"),
      image: get("image"),
      imageMode: get("imageMode") ?? "photo",
      href: m[3],
    });
  }
  return out;
}

export function loadArticles(repo) {
  const guides = existsSync(join(repo, "lib/content.ts")) ? parseGuides(readFileSync(join(repo, "lib/content.ts"), "utf8")) : [];
  const pillars = [];
  const nb = join(repo, "app/neighborhoods");
  if (existsSync(nb)) {
    for (const d of readdirSync(nb)) {
      if (!statSync(join(nb, d)).isDirectory()) continue;
      const title = d.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      pillars.push({ slug: d, title: `${title} neighborhood guide`, category: "Neighborhood pillar", image: null, imageMode: "photo", href: `/neighborhoods/${d}` });
    }
  }
  return [...guides, ...pillars];
}

/** Map of "/images/…" path → number of source files that reference it. */
export function imageUsage(repo, dirs = ["app", "lib", "components"]) {
  const counts = new Map();
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (/\.(tsx?|jsx?|mdx?|json)$/.test(ent.name)) {
        const text = readFileSync(p, "utf8");
        for (const m of text.matchAll(/\/images\/[A-Za-z0-9_\-./]+\.(?:webp|jpe?g|png|avif)/g)) counts.set(m[0], (counts.get(m[0]) ?? 0) + 1);
      }
    }
  };
  for (const d of dirs) walk(join(repo, d));
  return counts;
}

export function topicsOfText(text) {
  return Object.entries(TOPICS)
    .filter(([, t]) => t.re.test(text))
    .map(([id]) => id);
}

/**
 * Per-topic need and supply. `library` = index images (each with topics[]).
 * Returns [{ topic, label, articles, weak, mapMentions, library, priority, articleSlugs }].
 */
export function topicNeeds({ articles, usage, library, mapText = "" }) {
  const imageRefs = new Map();
  for (const a of articles) if (a.image) imageRefs.set(a.image, (imageRefs.get(a.image) ?? 0) + 1);
  const rows = [];
  for (const [id, t] of Object.entries(TOPICS)) {
    const mine = articles.filter((a) => t.re.test(`${a.title} ${a.slug}`));
    const weak = mine.filter((a) => !a.image || a.imageMode === "editorial-cover" || (imageRefs.get(a.image) ?? 0) > 1 || (usage.get(a.image) ?? 0) > 2).length;
    const mapMentions = Math.min(10, (mapText.match(new RegExp(t.re.source, "gi")) ?? []).length);
    const have = library.filter((img) => (img.topics ?? []).includes(id)).length;
    // Every topic in the universe has a base need, so the library spreads across all of it.
    const need = 1 + mine.length * 0.6 + weak * 1.5 + mapMentions * 0.3;
    rows.push({ topic: id, label: t.label, articles: mine.length, weak, mapMentions, library: have, priority: Math.round((need / (1 + have * 0.75)) * 100) / 100, articleSlugs: mine.map((a) => a.slug) });
  }
  return rows.sort((a, b) => b.priority - a.priority);
}

/** Articles an image could support: shared topics, strongest overlap first. */
export function matchArticles(topics, articles, limit = 6) {
  return articles
    .map((a) => {
      const at = topicsOfText(`${a.title} ${a.slug}`);
      return { a, score: at.filter((x) => topics.includes(x)).length };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map(({ a }) => ({ slug: a.slug, title: a.title, href: a.href }));
}
