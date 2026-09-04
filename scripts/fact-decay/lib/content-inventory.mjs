// ---------------------------------------------------------------------------
// CONTENT INVENTORY — which pages are in scope, and how fresh each one is
//
// Answers three questions about LVINIT's published editorial content:
//
//   1. Which pages should be scanned?      -> app/**/page.tsx, filtered by
//                                             section and by the include/exclude
//                                             lists in config.content
//   2. What text does each page publish?   -> the page file PLUS any local data
//                                             module it imports (Summerlin's
//                                             Development Watch lives in
//                                             lib/areas/summerlin.tsx)
//   3. When were its facts last checked?   -> in preference order, the visible
//                                             "Checked <date>" stamp, then
//                                             dateModified, then datePublished,
//                                             then the editorial registry, then
//                                             the file's last git commit
//
// Route classification is IMPORTED from the GSC agent's site-inventory module so
// that "a guide" means exactly the same thing to both agents. That module is
// read, never modified.
//
// Nothing here writes to the site.
// ---------------------------------------------------------------------------

import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative, sep, dirname } from "node:path";
import { execFileSync } from "node:child_process";

import { classifyRoute, SECTIONS } from "../../gsc/lib/site-inventory.mjs";
import {
  extractTextBlocks,
  extractStoryMeta,
  extractFreshnessStamps,
  extractDeclaredSources,
  extractDevelopmentProjects,
  extractLocalImports,
  extractDataRows,
  extractExternalLinks,
  stripComments,
  normalizeWhitespace,
} from "./extract.mjs";
import { parseHumanDate, daysBetween } from "./dates.mjs";

export { SECTIONS };

/** Walk app/ and collect every route that has a page file. */
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

/**
 * Read the editorial registry (lib/content.ts) for publication dates, category,
 * and draft status.
 *
 * The registry is the site's own answer to "is this published and when", so the
 * agent uses it rather than inferring either. If the file is missing or its
 * shape changes, this returns an empty map and the agent falls back to on-page
 * dates — it never blocks the run.
 */
export function readEditorialRegistry(repoRoot, registryFile) {
  const path = join(repoRoot, registryFile);
  if (!existsSync(path)) return new Map();
  let source;
  try {
    source = readFileSync(path, "utf8");
  } catch {
    return new Map();
  }
  const { code } = stripComments(source);
  const byRoute = new Map();

  const objectRe = /\{\s*slug:\s*(["'])([^"']+)\1([\s\S]*?)\n\s{2}\},/g;
  let m;
  while ((m = objectRe.exec(code)) !== null) {
    const body = m[3];
    const read = (key) => {
      const km = new RegExp(`\\b${key}:\\s*(["'])([\\s\\S]*?)\\1`).exec(body);
      return km ? normalizeWhitespace(km[2]) : null;
    };
    const href = read("href");
    if (!href) continue;
    byRoute.set(href.replace(/\/$/, "") || "/", {
      slug: m[2],
      title: read("title"),
      category: read("category"),
      publishedAt: read("publishedAt"),
      status: read("status") || "published",
    });
  }
  return byRoute;
}

/** Turn "@/lib/areas/summerlin" into a real file path, if one exists. */
function resolveCompanion(repoRoot, specifier) {
  if (!specifier.startsWith("@/")) return null;
  const base = join(repoRoot, specifier.slice(2));
  for (const candidate of [`${base}.tsx`, `${base}.ts`, join(base, "index.tsx"), join(base, "index.ts")]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/** Last commit date for a file, as YYYY-MM-DD. Fails soft — git is optional. */
export function gitLastModified(repoRoot, relPath) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", relPath], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000,
    });
    const value = out.trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
  } catch {
    return null;
  }
}

/** "Statuses checked 2026-08-20" and friends, read out of code comments. */
function freshnessFromComments(comments) {
  const found = [];
  for (const comment of comments) {
    const re = /\b(?:checked|verified|reverified|last reviewed|updated)\b[^.\n]{0,30}?((?:\d{1,2}\s+)?(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}?,?\s*\d{4}|\d{4}-\d{2}-\d{2})/gi;
    let m;
    while ((m = re.exec(comment.text)) !== null) {
      const parsed = parseHumanDate(m[1]);
      if (parsed) found.push(parsed.iso);
    }
  }
  return found;
}

/** Pick the newest of a list of ISO dates, ignoring nulls. */
function newest(dates) {
  const valid = dates.filter(Boolean).sort();
  return valid.length ? valid[valid.length - 1] : null;
}

/**
 * Work out when this page's facts were last checked, and say what that answer
 * rests on. The basis is reported alongside every finding, because "overdue" is
 * only meaningful if you know what it is overdue from.
 */
export function resolveLastReviewed({ stamps, commentDates, storyMeta, registryEntry, gitDate }) {
  const stampDates = stamps
    .map((s) => parseHumanDate(s.text))
    .filter(Boolean)
    .map((d) => d.iso);

  const candidates = {
    checkedStamp: newest([...stampDates, ...commentDates]),
    dateModified: storyMeta?.dateModified ?? null,
    datePublished: storyMeta?.datePublished ?? null,
    registryPublishedAt: registryEntry?.publishedAt ?? null,
    gitLastCommit: gitDate ?? null,
  };

  const order = [
    ["checkedStamp", "a visible “Checked …” stamp on the page"],
    ["dateModified", "the page's own dateModified"],
    ["datePublished", "the page's own datePublished"],
    ["registryPublishedAt", "the editorial registry's publishedAt"],
    ["gitLastCommit", "the file's last git commit"],
  ];
  for (const [key, basis] of order) {
    if (candidates[key]) return { date: candidates[key], basis, basisKey: key, candidates };
  }
  return { date: null, basis: "no date could be established", basisKey: null, candidates };
}

/**
 * Build the inventory of in-scope published editorial pages.
 *
 * @param {object} opts
 * @param {string} opts.repoRoot
 * @param {object} opts.config
 * @param {string} opts.today  YYYY-MM-DD, injected so runs are deterministic
 */
export function buildContentInventory({ repoRoot, config, today }) {
  const appDir = join(repoRoot, config.content.appDir);
  if (!existsSync(appDir) || !statSync(appDir).isDirectory()) {
    throw new Error(`Expected a Next.js app directory at ${appDir}`);
  }

  const registry = readEditorialRegistry(repoRoot, config.content.registryFile);
  const includeSections = new Set(config.content.includeSections);
  const includeRoutes = new Set(config.content.includeRoutes);
  const excludeRoutes = new Set(config.content.excludeRoutes.map((r) => r.replace(/\/$/, "") || "/"));

  const pages = [];
  const skipped = [];

  for (const file of findRouteFiles(appDir).sort()) {
    const route = routeFromFile(appDir, file);
    if (route.startsWith("/api")) continue;

    const section = classifyRoute(route);
    const inScope = includeRoutes.has(route) || includeSections.has(section);

    if (excludeRoutes.has(route)) {
      skipped.push({ route, section, reason: "excluded by configuration" });
      continue;
    }
    if (!inScope) {
      skipped.push({ route, section, reason: `section "${section}" is not published editorial content` });
      continue;
    }

    const registryEntry = registry.get(route) ?? null;
    if (registryEntry?.status === "draft") {
      skipped.push({ route, section, reason: "marked draft in the editorial registry" });
      continue;
    }

    const source = readFileSync(file, "utf8");
    const relPath = relative(repoRoot, file).split(sep).join("/");
    const { comments } = stripComments(source);

    const storyMeta = extractStoryMeta(source);
    const stamps = extractFreshnessStamps(source);
    const commentDates = freshnessFromComments(comments);

    // The page file plus every local data module it reads its content from.
    const documents = [
      {
        file: relPath,
        role: "page",
        blocks: extractTextBlocks(source, { minWords: config.claims.minWords }),
        declaredSources: [...extractDeclaredSources(source), ...extractExternalLinks(source)],
        developmentProjects: extractDevelopmentProjects(source),
        dataRows: extractDataRows(source),
      },
    ];

    if (config.content.followCompanionModules) {
      for (const specifier of extractLocalImports(source, { prefixes: config.content.companionPrefixes })) {
        const companionPath = resolveCompanion(repoRoot, specifier);
        if (!companionPath) continue;
        const companionRel = relative(repoRoot, companionPath).split(sep).join("/");
        if (documents.some((d) => d.file === companionRel)) continue;
        const companionSource = readFileSync(companionPath, "utf8");
        const companionComments = stripComments(companionSource).comments;
        commentDates.push(...freshnessFromComments(companionComments));
        documents.push({
          file: companionRel,
          role: "companion-data",
          specifier,
          blocks: extractTextBlocks(companionSource, { minWords: config.claims.minWords }),
          declaredSources: [...extractDeclaredSources(companionSource), ...extractExternalLinks(companionSource)],
          developmentProjects: extractDevelopmentProjects(companionSource),
          dataRows: extractDataRows(companionSource),
        });
      }
    }

    const gitDate = config.content.useGitDates ? gitLastModified(repoRoot, relPath) : null;
    const lastReviewed = resolveLastReviewed({
      stamps,
      commentDates,
      storyMeta,
      registryEntry,
      gitDate,
    });

    const declaredSources = documents.flatMap((d) =>
      d.declaredSources.map((s) => ({ ...s, file: d.file }))
    );

    pages.push({
      route,
      section,
      file: relPath,
      title: storyMeta.headline || storyMeta.title || registryEntry?.title || route,
      description: storyMeta.description ?? null,
      category: registryEntry?.category ?? null,
      storyMeta,
      registryEntry,
      lastReviewed,
      daysSinceReviewed: lastReviewed.date ? daysBetween(lastReviewed.date, today) : null,
      documents,
      declaredSources,
      developmentProjects: documents.flatMap((d) =>
        d.developmentProjects.map((p) => ({ ...p, file: d.file }))
      ),
      textBlockCount: documents.reduce((sum, d) => sum + d.blocks.length, 0),
    });
  }

  return { pages, skipped, registrySize: registry.size };
}

/** Directory of a page file, handy in tests. */
export const pageDir = (file) => dirname(file);
