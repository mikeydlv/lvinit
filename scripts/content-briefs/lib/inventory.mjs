// ---------------------------------------------------------------------------
// CONTENT INVENTORY
//
// What LVINIT has already published, in enough depth to answer "does a page
// already answer this?" — not just route and title, but H1, description,
// section headings, body text, category, topics, dates and internal links.
//
// Page discovery is the Internal Linking Agent's link graph, reused unchanged,
// so all four agents agree on what exists, what counts as published (drafts in
// lib/content.ts are skipped), and what links to what. Headings and body text
// come from the Fact-Decay Agent's extractor, also reused unchanged.
//
// Nothing here writes.
// ---------------------------------------------------------------------------

import { buildLinkGraph } from "../../internal-links/lib/graph.mjs";
import { loadConfig as loadLinksConfig } from "../../internal-links/config.mjs";
import { extractTextBlocks, extractStoryMeta } from "../../fact-decay/lib/extract.mjs";

import { ENTITIES } from "./intent.mjs";

/** Coverage buckets Mikey asked the inventory to report on. */
export const COVERAGE_BUCKETS = ["neighborhood-area", "comparison", "relocation", "real-estate", "local-development"];

/** A dated record: the slug names a month and year ("home-prices-august-2026"). */
const MONTHS = "january|february|march|april|may|june|july|august|september|october|november|december";
export function isDatedRecord(route) {
  return new RegExp(`-(${MONTHS})-(19|20)\\d{2}$`).test(String(route ?? ""));
}

/** Which coverage buckets a page belongs to. */
export function coverageBucketsFor(page) {
  const topics = page.topics ?? [];
  const category = String(page.category ?? "");
  const buckets = new Set();
  if (["neighborhood", "community", "place-story"].includes(page.section) || topics.some((t) => t.startsWith("place:"))) {
    buckets.add("neighborhood-area");
  }
  if (topics.includes("theme:comparison") || /\bvs\b/.test(page.route) || category === "Comparisons") buckets.add("comparison");
  if (topics.includes("theme:relocation") || category === "Moving Here") buckets.add("relocation");
  if (
    ["Market Watch", "Buyer Guide", "Cost of Living"].includes(category) ||
    topics.some((t) =>
      ["theme:home-prices", "theme:mortgage-rates", "theme:new-construction", "theme:resale", "theme:financing", "theme:property-tax", "theme:starter-homes", "theme:market-forecast", "theme:luxury"].includes(t)
    )
  ) buckets.add("real-estate");
  if (topics.includes("theme:development")) buckets.add("local-development");
  return [...buckets];
}

/**
 * Entities (from the intent vocabulary) a piece of text names, with WHERE.
 * Used by the coverage check: an entity in the route or H1 is a commitment; in a
 * heading, a section; in the body, a mention.
 */
export function entityProfile({ route = "", title = "", h1 = "", description = "", headings = [], body = "" }) {
  const lower = (s) => ` ${String(s ?? "").toLowerCase().replace(/[^a-z0-9$'+\-\s]/g, " ").replace(/\s+/g, " ")} `;
  const routeText = lower(String(route).replace(/[/-]/g, " "));
  const headText = lower(`${title} ${h1}`);
  const descText = lower(description);
  const headingText = lower(headings.join(" . "));
  const bodyText = lower(body);

  const profile = {};
  for (const entity of ENTITIES) {
    const re = new RegExp(entity.pattern.source, "g");
    const count = (t) => (t.match(re) ?? []).length;
    const where = {
      route: count(routeText) > 0,
      headline: count(headText) > 0,
      description: count(descText) > 0,
      headings: count(headingText),
      body: count(bodyText),
    };
    if (where.route || where.headline || where.description || where.headings || where.body) {
      profile[entity.key] = where;
    }
  }
  return profile;
}

/** Places a comparison page sets against each other, read from its slug. */
export function comparedPlacesFromRoute(route) {
  const slug = String(route ?? "").split("/").filter(Boolean).pop() ?? "";
  if (!/-vs-/.test(slug)) return [];
  const text = ` ${slug.replace(/-/g, " ")} `;
  return ENTITIES.filter((e) => e.kind === "place" && new RegExp(e.pattern.source).test(text)).map((e) => e.key).sort();
}

/**
 * Build the inventory from the real repository.
 *
 * @param {object} opts
 * @param {string} opts.repoRoot
 * @param {object} opts.config   this agent's config
 * @param {string} opts.today    YYYY-MM-DD
 */
export function buildInventory({ repoRoot, config, today }) {
  const linksConfig = loadLinksConfig({
    content: { useGitDates: config.inventory.useGitDates },
    gsc: { enabled: false },
    factDecay: { enabled: false },
  });
  const graph = buildLinkGraph({ repoRoot, config: linksConfig, today });
  return inventoryFromGraph(graph, config);
}

/**
 * Turn a link graph (real or synthetic) into the inventory. Split out so tests
 * can build an inventory without a repository.
 */
export function inventoryFromGraph(graph, config) {
  const pages = [];
  for (const node of graph.pages.values()) {
    const blocks = (node.documents ?? []).flatMap((doc) => extractTextBlocks(doc.source ?? ""));
    const pageDoc = (node.documents ?? []).find((d) => d.role === "page");
    const meta = pageDoc ? extractStoryMeta(pageDoc.source) : {};
    const headings = [...new Set(blocks.filter((b) => b.origin === "heading").map((b) => b.text))];
    const bodyWords = blocks
      .filter((b) => b.origin !== "heading")
      .map((b) => b.text)
      .join(" ")
      .split(/\s+/)
      .slice(0, config.inventory.maxBodyWords);
    const body = bodyWords.join(" ");
    const h1 = meta.headline ?? node.title ?? null;

    const page = {
      route: node.route,
      file: node.file,
      section: node.section,
      neighborhood: node.neighborhood,
      title: node.title,
      h1,
      description: node.description ?? meta.description ?? null,
      category: node.category ?? null,
      topics: node.topics ?? [],
      publishedAt: node.publishedAt ?? null,
      dateModified: node.dateModified ?? null,
      gitLastModified: node.gitLastModified ?? null,
      inRegistry: Boolean(node.inRegistry),
      inSitemap: Boolean(node.inSitemap),
      headings,
      bodyWordCount: bodyWords.filter(Boolean).length,
      linksOut: [...new Set((node.outgoing ?? []).filter((e) => e.editorialTarget).map((e) => e.to))].sort(),
      linksIn: [...new Set((node.incoming ?? []).map((e) => e.from))].sort(),
      isOrphan: Boolean(node.isOrphan),
      isWeaklyLinked: Boolean(node.isWeaklyLinked),
      datedRecord: isDatedRecord(node.route),
      comparedPlaces: comparedPlacesFromRoute(node.route),
    };
    page.buckets = coverageBucketsFor(page);
    page.profile = entityProfile({ route: page.route, title: page.title, h1, description: page.description ?? "", headings, body });
    // The raw body is kept for the coverage check and dropped from reports.
    Object.defineProperty(page, "body", { value: body, enumerable: false });
    pages.push(page);
  }
  pages.sort((a, b) => a.route.localeCompare(b.route));

  const coverage = Object.fromEntries(COVERAGE_BUCKETS.map((b) => [b, pages.filter((p) => p.buckets.includes(b)).map((p) => p.route)]));

  return {
    pages,
    byRoute: new Map(pages.map((p) => [p.route, p])),
    existingRoutes: new Set(graph.existingRoutes ?? pages.map((p) => p.route)),
    skipped: graph.skipped ?? [],
    coverage,
    totals: { published: pages.length, skipped: (graph.skipped ?? []).length },
  };
}

/** Compact, report-safe view of the inventory. */
export function inventorySummary(inventory) {
  return {
    totals: inventory.totals,
    coverage: Object.fromEntries(Object.entries(inventory.coverage).map(([k, v]) => [k, { count: v.length, routes: v }])),
    pages: inventory.pages.map((p) => ({
      route: p.route,
      title: p.title,
      h1: p.h1,
      category: p.category,
      section: p.section,
      topics: p.topics,
      buckets: p.buckets,
      publishedAt: p.publishedAt,
      dateModified: p.dateModified,
      gitLastModified: p.gitLastModified,
      headings: p.headings.length,
      bodyWords: p.bodyWordCount,
      linksIn: p.linksIn.length,
      linksOut: p.linksOut.length,
      isOrphan: p.isOrphan,
      datedRecord: p.datedRecord,
    })),
    skipped: inventory.skipped,
  };
}
