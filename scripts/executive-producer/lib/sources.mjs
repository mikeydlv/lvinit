// ---------------------------------------------------------------------------
// SOURCE PACKS — what LVINIT has already published, as text the Producer can
// stand on
//
// Every talking point in a brief has to come from something Mikey already
// published (or said on camera). For each published page this builds:
//
//   * title, category, description, route
//   * headings (the page's own structure, a ready-made script outline)
//   * an excerpt for the model (headings + first paragraphs, capped)
//   * the FULL prose text, which validation uses to check every number the
//     model writes. A number that isn't on an LVINIT page gets flagged.
//
// Pages come from the Internal Linking Agent's graph (same "what counts as
// published" as every other agent). Text comes from the Fact-Decay Agent's
// .tsx extractor. Both are reused, not copied.
// ---------------------------------------------------------------------------

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { buildLinkGraph } from "../../internal-links/lib/graph.mjs";
import { loadConfig as loadLinksConfig } from "../../internal-links/config.mjs";
import { extractTextBlocks } from "../../fact-decay/lib/extract.mjs";

const EXCERPT_CHARS = 1400;

/** Text blocks → { headings, prose }. Skips short UI fragments. */
export function packText(sources) {
  const headings = [];
  const prose = [];
  for (const src of sources) {
    for (const b of extractTextBlocks(src)) {
      if (b.origin === "heading") headings.push(b.text);
      else if (b.text.split(/\s+/).length >= 6) prose.push(b.text);
    }
  }
  return { headings: [...new Set(headings)], prose: [...new Set(prose)] };
}

export function excerptOf({ headings, prose }, limit = EXCERPT_CHARS) {
  let out = "";
  for (const p of prose) {
    if (out.length + p.length > limit) break;
    out += (out ? " " : "") + p;
  }
  return out;
}

export function buildSourcePacks({ repoRoot, today }) {
  const linksConfig = loadLinksConfig({ content: { useGitDates: false }, gsc: { enabled: false }, factDecay: { enabled: false } });
  const graph = buildLinkGraph({ repoRoot, config: linksConfig, today });
  const packs = [];
  for (const p of graph.pages.values()) {
    if (p.status === "draft" || p.published === false) continue;
    const files = [];
    if (p.file && existsSync(join(repoRoot, p.file))) files.push(readFileSync(join(repoRoot, p.file), "utf8"));
    // Area pillars keep most of their prose in lib/areas/<slug>.tsx.
    const area = (p.route.match(/^\/neighborhoods\/([^/]+)$/) ?? [])[1];
    if (area && existsSync(join(repoRoot, "lib", "areas", `${area}.tsx`))) files.push(readFileSync(join(repoRoot, "lib", "areas", `${area}.tsx`), "utf8"));
    const text = packText(files);
    packs.push({
      route: p.route,
      title: p.title ?? p.route,
      category: p.category ?? null,
      section: p.section ?? null,
      description: p.description ?? null,
      publishedAt: p.publishedAt ?? null,
      headings: text.headings.slice(0, 20),
      excerpt: excerptOf(text),
      fullText: [p.title, p.description, ...text.headings, ...text.prose].filter(Boolean).join("\n"),
    });
  }
  return packs.sort((a, b) => a.route.localeCompare(b.route));
}
