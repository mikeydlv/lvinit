// ---------------------------------------------------------------------------
// THE INTERNAL LINK GRAPH
//
// One reproducible picture of how LVINIT's published editorial pages point at
// each other. Nodes are routes; edges are links a human wrote in a page file.
//
// The rule that makes the graph mean something: GLOBAL CHROME IS NOT AN
// EDITORIAL LINK. The navbar links every page to /guides; the footer links
// every page to /contact. Counting those would make every page look well
// connected and no page would ever be an orphan. Chrome links are collected
// separately and reported, never counted.
//
// Page discovery and route classification are IMPORTED from the GSC agent's
// site-inventory and the Fact-Decay Agent's content-inventory, so all three
// agents agree on what exists and what counts as published.
//
// Nothing here writes.
// ---------------------------------------------------------------------------

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

import { classifyRoute, neighborhoodOf, SECTIONS } from "../../gsc/lib/site-inventory.mjs";
import { readEditorialRegistry, gitLastModified } from "../../fact-decay/lib/content-inventory.mjs";
import { extractStoryMeta, extractLocalImports } from "../../fact-decay/lib/extract.mjs";

import { extractLinks, normalizeRoute, stripComments } from "./source.mjs";
import { topicsFor, distinctiveTokens, slugTokens } from "./topics.mjs";

export { SECTIONS };

/** Walk app/ and collect every route file. */
function findRouteFiles(appDir) {
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.startsWith("_")) continue;
        walk(full);
      } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
        found.push(full);
      }
    }
  };
  walk(appDir);
  return found;
}

/** app/guides/summerlin-vs-henderson/page.tsx -> /guides/summerlin-vs-henderson */
function routeFromFile(appDir, file) {
  const rel = relative(appDir, file).split(sep).slice(0, -1).filter(Boolean);
  const segments = rel.filter((s) => !(s.startsWith("(") && s.endsWith(")")));
  return `/${segments.join("/")}`.replace(/\/$/, "") || "/";
}

/** Resolve "@/lib/areas/summerlin" to a real file, if it exists. */
function resolveCompanion(repoRoot, specifier) {
  if (!specifier.startsWith("@/")) return null;
  const base = join(repoRoot, specifier.slice(2));
  for (const candidate of [`${base}.tsx`, `${base}.ts`, join(base, "index.tsx"), join(base, "index.ts")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/** Is this component file site chrome rather than editorial content? */
export function isChrome(file, chromeComponents) {
  const normalized = String(file).split(sep).join("/");
  return chromeComponents.some((c) => normalized.endsWith(c.split(sep).join("/")));
}

/** Days between two YYYY-MM-DD dates. Negative when `to` is earlier. */
export function daysBetween(from, to) {
  if (!from || !to) return null;
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.round((b - a) / 86400000);
}

/**
 * Build the graph.
 *
 * @param {object} opts
 * @param {string} opts.repoRoot
 * @param {object} opts.config
 * @param {string} opts.today  YYYY-MM-DD, injected so runs are deterministic
 */
export function buildLinkGraph({ repoRoot, config, today }) {
  const appDir = join(repoRoot, config.content.appDir);
  if (!existsSync(appDir) || !statSync(appDir).isDirectory()) {
    throw new Error(`Expected a Next.js app directory at ${appDir}`);
  }

  const registry = readEditorialRegistry(repoRoot, config.content.registryFile);
  const includeSections = new Set(config.content.includeSections);
  const includeRoutes = new Set(config.content.includeRoutes);
  const excludeRoutes = new Set(config.content.excludeRoutes.map((r) => normalizeRoute(r) ?? r));

  /** Every route that exists on disk, editorial or not. */
  const existingRoutes = new Set();
  const pages = new Map();
  const skipped = [];

  for (const file of findRouteFiles(appDir).sort()) {
    const route = routeFromFile(appDir, file);
    if (route.startsWith("/api")) continue;
    existingRoutes.add(route);

    const section = classifyRoute(route);
    const registryEntry = registry.get(route) ?? null;
    const source = readFileSync(file, "utf8");
    const relPath = relative(repoRoot, file).split(sep).join("/");
    const storyMeta = extractStoryMeta(source);

    const inScope = includeRoutes.has(route) || includeSections.has(section);
    if (excludeRoutes.has(route)) {
      skipped.push({ route, section, reason: "excluded by configuration" });
      continue;
    }
    if (!inScope) {
      skipped.push({ route, section, reason: `section "${section}" is not published editorial content` });
      continue;
    }
    if (registryEntry?.status === "draft") {
      skipped.push({ route, section, reason: "marked draft in the editorial registry" });
      continue;
    }

    // The page file plus every local data module it reads its content from —
    // Summerlin's community roster lives in lib/areas/summerlin.tsx, and links
    // written there are just as published as links in the page.
    const documents = [{ file: relPath, absolute: file, role: "page", source }];
    if (config.content.followCompanionModules) {
      for (const specifier of extractLocalImports(source, { prefixes: config.content.companionPrefixes })) {
        const companionPath = resolveCompanion(repoRoot, specifier);
        if (!companionPath) continue;
        const companionRel = relative(repoRoot, companionPath).split(sep).join("/");
        if (documents.some((d) => d.file === companionRel)) continue;
        documents.push({
          file: companionRel,
          absolute: companionPath,
          role: "companion-data",
          specifier,
          source: readFileSync(companionPath, "utf8"),
        });
      }
    }

    const links = documents.flatMap((doc) =>
      extractLinks(doc.source).map((link) => ({ ...link, file: doc.file, documentRole: doc.role }))
    );

    const title =
      storyMeta.headline ||
      (storyMeta.title ? storyMeta.title.replace(/\s*\|\s*LVINIT\s*$/i, "").trim() : null) ||
      registryEntry?.title ||
      route;

    const publishedAt = storyMeta.datePublished ?? registryEntry?.publishedAt ?? null;
    const gitDate = config.content.useGitDates ? gitLastModified(repoRoot, relPath) : null;

    pages.set(route, {
      route,
      section,
      neighborhood: neighborhoodOf(route),
      file: relPath,
      absolute: file,
      title,
      description: storyMeta.description ?? null,
      category: registryEntry?.category ?? null,
      publishedAt,
      dateModified: storyMeta.dateModified ?? null,
      gitLastModified: gitDate,
      ageDays: publishedAt ? daysBetween(publishedAt, today) : null,
      inRegistry: Boolean(registryEntry),
      inSitemap: false, // filled in below
      documents,
      topics: topicsFor({ route, title, category: registryEntry?.category ?? "" }),
      // `coreTokens` is the slug's own vocabulary — the page's deliberate
      // topical commitment, and what an anchor has to name. `tokens` is the
      // wider vocabulary of route plus headline, used to judge whether a
      // paragraph is genuinely about this page's subject.
      coreTokens: [...new Set(distinctiveTokens(slugTokens(route).join(" ")))],
      tokens: [...new Set([...distinctiveTokens(route), ...distinctiveTokens(title)])],
      outgoing: [],
      incoming: [],
      chromeIncoming: [],
      duplicateOutgoing: [],
      brokenOutgoing: [],
    });
    pages.get(route).rawLinks = links;
  }

  // --- Chrome links, collected but never counted as editorial ---------------
  const componentsDir = join(repoRoot, config.content.componentsDir);
  const chromeLinks = [];
  const componentLinks = [];
  if (existsSync(componentsDir)) {
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        if (!/\.tsx?$/.test(entry.name)) continue;
        const relPath = relative(repoRoot, full).split(sep).join("/");
        const chrome = isChrome(relPath, config.graph.chromeComponents);
        for (const link of extractLinks(readFileSync(full, "utf8"))) {
          (chrome ? chromeLinks : componentLinks).push({ ...link, file: relPath });
        }
      }
    };
    walk(componentsDir);
  }

  // --- Sitemap cross-check --------------------------------------------------
  const sitemapRoutes = readSitemapRoutes(join(appDir, "sitemap.ts"));

  return finalizeGraph({
    pages,
    config,
    existingRoutes,
    sitemapRoutes,
    chromeLinks,
    componentLinks,
    skipped,
  });
}

/**
 * Turn a map of page records (each carrying `rawLinks`) into the finished
 * graph: edges, reverse index, orphans, weak pages, hygiene findings.
 *
 * Separated from the filesystem scan so the fixture site can build a real graph
 * without a repository, and so the derivation is testable on its own.
 */
export function finalizeGraph({
  pages,
  config,
  existingRoutes,
  sitemapRoutes = [],
  chromeLinks = [],
  componentLinks = [],
  skipped = [],
}) {
  const nonEditorialTargets = new Set(config.graph.nonEditorialTargets.map((r) => normalizeRoute(r) ?? r));

  // --- Edges ---------------------------------------------------------------
  for (const page of pages.values()) {
    const seenTargets = new Map();
    for (const link of page.rawLinks ?? []) {
      const target = link.href;
      if (target === page.route) continue;

      const edge = {
        from: page.route,
        to: target,
        anchor: link.anchor,
        file: link.file,
        line: link.line,
        documentRole: link.documentRole,
        element: link.element,
        targetExists: existingRoutes.has(target),
        editorialTarget: !nonEditorialTargets.has(target) && pages.has(target),
      };

      if (!edge.targetExists) {
        page.brokenOutgoing.push(edge);
        continue;
      }

      const count = (seenTargets.get(target) ?? 0) + 1;
      seenTargets.set(target, count);
      if (count > 1) {
        page.duplicateOutgoing.push({ ...edge, occurrence: count });
      }

      page.outgoing.push(edge);
      const targetPage = pages.get(target);
      if (targetPage && edge.editorialTarget) targetPage.incoming.push(edge);
    }
  }

  for (const link of chromeLinks) {
    const targetPage = pages.get(link.href);
    if (targetPage) targetPage.chromeIncoming.push({ from: link.file, anchor: link.anchor });
  }
  // Card components (GuideCard, LatestFromLVINIT, NeighborhoodDiscovery) render
  // links from the registry rather than hardcoding them. They are real links a
  // crawler follows, but they are a feed, not an editorial recommendation, so
  // they are recorded on the page and never counted as editorial in-links.
  for (const link of componentLinks) {
    const targetPage = pages.get(link.href);
    if (targetPage) targetPage.chromeIncoming.push({ from: link.file, anchor: link.anchor });
  }

  for (const page of pages.values()) page.inSitemap = sitemapRoutes.includes(page.route);

  // --- Derived state --------------------------------------------------------
  for (const page of pages.values()) {
    const referrers = new Set(page.incoming.map((e) => e.from));
    page.uniqueReferrers = [...referrers].sort();
    page.incomingEditorialCount = page.incoming.length;
    page.outgoingEditorialCount = page.outgoing.filter((e) => e.editorialTarget).length;
    page.isOrphan = referrers.size === 0;
    page.isWeaklyLinked = referrers.size <= config.graph.weaklyLinkedAtOrBelow;
    page.isNewlyPublished =
      page.ageDays !== null && page.ageDays <= config.graph.newlyPublishedDays;
    delete page.rawLinks;
  }

  const orphans = [...pages.values()].filter((p) => p.isOrphan);
  const weaklyLinked = [...pages.values()].filter((p) => p.isWeaklyLinked && !p.isOrphan);
  const newlyPublishedNeedingDiscovery = [...pages.values()].filter(
    (p) => p.isNewlyPublished && p.uniqueReferrers.length <= config.graph.weaklyLinkedAtOrBelow
  );
  const brokenLinks = [...pages.values()].flatMap((p) => p.brokenOutgoing);
  const duplicateLinks = [...pages.values()].flatMap((p) => p.duplicateOutgoing);

  return {
    pages,
    routes: [...pages.keys()].sort(),
    existingRoutes,
    skipped,
    sitemapRoutes,
    chromeLinks,
    componentLinks,
    chromeLinkCount: chromeLinks.length,
    componentLinkCount: componentLinks.length,
    orphans,
    weaklyLinked,
    newlyPublishedNeedingDiscovery,
    brokenLinks,
    duplicateLinks,
    totals: {
      pages: pages.size,
      editorialEdges: [...pages.values()].reduce((n, p) => n + p.outgoingEditorialCount, 0),
      allEdges: [...pages.values()].reduce((n, p) => n + p.outgoing.length, 0),
    },
  };
}

/** Parse the hand-maintained app/sitemap.ts for declared routes. */
export function readSitemapRoutes(sitemapFile) {
  if (!existsSync(sitemapFile)) return [];
  const { code } = stripComments(readFileSync(sitemapFile, "utf8"));
  const routes = new Set();
  const re = /\$\{BASE_URL\}(\/[A-Za-z0-9\-/_]*)?/g;
  let m;
  while ((m = re.exec(code)) !== null) {
    routes.add(normalizeRoute(m[1] || "/") ?? "/");
  }
  return [...routes].sort();
}

/** Every anchor text already used to point at a given route, across the site. */
export function anchorTextsFor(graph, route) {
  const anchors = [];
  for (const page of graph.pages.values()) {
    for (const edge of page.outgoing) {
      if (edge.to === route && edge.anchor) anchors.push(edge.anchor);
    }
  }
  return anchors;
}
