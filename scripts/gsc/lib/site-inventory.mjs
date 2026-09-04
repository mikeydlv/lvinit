// ---------------------------------------------------------------------------
// LVINIT SITE INVENTORY
//
// The agent has to answer three questions about LVINIT itself:
//
//   1. Which pages actually exist?        -> the filesystem (app/**/page.tsx)
//   2. What is each page about?           -> its route + its <title> metadata
//   3. What already links to what?        -> href="/..." across app/ + components/
//
// The filesystem is authoritative for "does this page exist" — app/sitemap.ts is
// hand-maintained, so it can drift. We read both and report the drift, because a
// page missing from the sitemap is itself a finding.
//
// Nothing here writes to the site. This module only reads.
// ---------------------------------------------------------------------------

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

/** Route sections we recognize, in the vocabulary of docs/INFORMATION_ARCHITECTURE.md. */
export const SECTIONS = {
  HOME: "home",
  NEIGHBORHOOD: "neighborhood",
  COMMUNITY: "community",
  PLACE_STORY: "place-story",
  GUIDE: "guide",
  INDEX: "index",
  UTILITY: "utility",
  OTHER: "other",
};

/** Walk app/ and collect every route that has a page.tsx. */
function findRouteFiles(appDir) {
  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        // Route groups "(x)" and private folders "_x" don't produce URL segments
        // we care about here; LVINIT uses neither today, but be safe.
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

/** Pull the page's <title> out of its exported metadata, if there is one. */
function extractTitle(source) {
  const m = /\btitle:\s*(["'`])([\s\S]*?)\1/.exec(source);
  if (!m) return null;
  return m[2].replace(/\s*\|\s*LVINIT\s*$/i, "").trim();
}

/** Pull the metadata description, if there is one. */
function extractDescription(source) {
  const m = /\bdescription:\s*(["'`])([\s\S]*?)\1/.exec(source);
  return m ? m[2].replace(/\s+/g, " ").trim() : null;
}

/** Classify a route into an IA section. */
export function classifyRoute(route) {
  if (route === "/") return SECTIONS.HOME;
  const parts = route.split("/").filter(Boolean);
  if (parts[0] === "neighborhoods") {
    if (parts.length === 1) return SECTIONS.INDEX;
    if (parts.length === 2) return SECTIONS.NEIGHBORHOOD;
    // A third segment under a place is either a community or a nested story.
    // We can't tell from the URL alone, so call it a place-story and let the
    // report say "page under <neighborhood>" rather than assert a type.
    return SECTIONS.PLACE_STORY;
  }
  if (parts[0] === "guides") return parts.length === 1 ? SECTIONS.INDEX : SECTIONS.GUIDE;
  if (["search", "contact", "api"].includes(parts[0])) return SECTIONS.UTILITY;
  if (parts.length === 1) return SECTIONS.INDEX;
  return SECTIONS.OTHER;
}

/** The neighborhood a route belongs to, when the URL says so. */
export function neighborhoodOf(route) {
  const parts = route.split("/").filter(Boolean);
  if (parts[0] === "neighborhoods" && parts[1]) return parts[1];
  return null;
}

/** Read every internal href="/..." out of a source file. */
function extractInternalHrefs(source) {
  const hrefs = new Set();
  const re = /href=(?:"|'|\{")(\/[A-Za-z0-9\-/_#?.]*)(?:"|'|"\})/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const raw = m[1].split("#")[0].split("?")[0].replace(/\/$/, "");
    if (raw && raw.startsWith("/")) hrefs.add(raw);
  }
  return [...hrefs];
}

/** Parse the hand-maintained app/sitemap.ts for declared URLs. */
function readSitemapRoutes(sitemapFile, origin) {
  if (!existsSync(sitemapFile)) return [];
  const source = readFileSync(sitemapFile, "utf8");
  const routes = new Set();
  const re = /\$\{BASE_URL\}(\/[A-Za-z0-9\-/_]*)?/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const path = (m[1] || "/").replace(/\/$/, "") || "/";
    routes.add(path);
  }
  // Also catch any fully-written absolute URLs.
  const absRe = new RegExp(`${origin.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}(/[A-Za-z0-9\\-/_]*)?`, "g");
  while ((m = absRe.exec(source)) !== null) {
    routes.add((m[1] || "/").replace(/\/$/, "") || "/");
  }
  return [...routes];
}

/**
 * Build the full inventory.
 *
 * @param {object} opts
 * @param {string} opts.repoRoot
 * @param {string} opts.origin  e.g. "https://www.lvinit.com"
 */
export function buildSiteInventory({ repoRoot, origin = "https://www.lvinit.com" }) {
  const appDir = join(repoRoot, "app");
  if (!existsSync(appDir) || !statSync(appDir).isDirectory()) {
    throw new Error(`Expected a Next.js app directory at ${appDir}`);
  }

  const pages = new Map(); // route -> page record
  for (const file of findRouteFiles(appDir)) {
    const route = routeFromFile(appDir, file);
    if (route.startsWith("/api")) continue; // not a search landing page
    const source = readFileSync(file, "utf8");
    pages.set(route, {
      route,
      file: relative(repoRoot, file).split(sep).join("/"),
      title: extractTitle(source),
      description: extractDescription(source),
      section: classifyRoute(route),
      neighborhood: neighborhoodOf(route),
      linksTo: extractInternalHrefs(source),
      linkedFrom: [],
    });
  }

  // Components link into routes too (nav, footer, cards). Fold those in so the
  // link graph reflects what a crawler actually sees, and record which
  // component supplied the link.
  const componentsDir = join(repoRoot, "components");
  const globalLinkSources = [];
  if (existsSync(componentsDir)) {
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.tsx?$/.test(entry.name)) {
          const hrefs = extractInternalHrefs(readFileSync(full, "utf8"));
          if (hrefs.length) {
            globalLinkSources.push({
              file: relative(repoRoot, full).split(sep).join("/"),
              linksTo: hrefs,
            });
          }
        }
      }
    };
    walk(componentsDir);
  }

  // Reverse index: which page-level routes link to each route.
  for (const page of pages.values()) {
    for (const target of page.linksTo) {
      const targetPage = pages.get(target);
      if (targetPage && target !== page.route) targetPage.linkedFrom.push(page.route);
    }
  }

  const sitemapFile = join(appDir, "sitemap.ts");
  const declared = readSitemapRoutes(sitemapFile, origin);
  const existing = [...pages.keys()];
  const missingFromSitemap = existing.filter(
    (r) => !declared.includes(r) && !r.startsWith("/api") && classifyRoute(r) !== SECTIONS.UTILITY
  );
  const sitemapOrphans = declared.filter((r) => !pages.has(r));

  return {
    origin,
    pages,
    routes: existing,
    componentLinkSources: globalLinkSources,
    sitemap: { declared, missingFromSitemap, sitemapOrphans },
  };
}

/**
 * Turn a Search Console page URL into a local route.
 * Returns null for anything that isn't on the LVINIT origin.
 */
export function routeFromUrl(url, origin) {
  if (!url) return null;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const originHost = new URL(origin).hostname.replace(/^www\./, "");
  if (parsed.hostname.replace(/^www\./, "") !== originHost) return null;
  const path = parsed.pathname.replace(/\/$/, "") || "/";
  return path;
}
