// ---------------------------------------------------------------------------
// INVENTORY — everything the audit reads, gathered once, read-only
//
// Two layers of evidence, deliberately kept apart:
//
//   SOURCE    the repository: app/**/page.tsx (which routes exist), the
//             sitemap and robots source, lib/content.ts (the registry),
//             public/ (which assets exist, with their exact letter case, and
//             which are committed), and every source file under app/,
//             components/ and lib/ (where a literal lives, for a fix).
//
//   RENDERED  what `next build` produced: .next/server/app/**/*.html,
//             sitemap.xml and robots.txt. This is exactly what a crawler gets,
//             so metadata, canonicals, JSON-LD, headings, alt text and links are
//             all judged here — never by guessing at TSX.
//
// The filesystem decides which pages exist. The build output decides what they
// say. Nothing in this module writes anything.
// ---------------------------------------------------------------------------

import { existsSync, readdirSync, readFileSync, statSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

import { classifyRoute } from "../../gsc/lib/site-inventory.mjs";
import { parsePage } from "./html.mjs";

export { classifyRoute };

const posix = (p) => p.split(sep).join("/");

/** app/guides/x/page.tsx -> /guides/x. Route groups vanish; returns null for private folders. */
export function routeFromPageFile(relFile) {
  const parts = posix(relFile).split("/");
  if (parts[0] === "app") parts.shift();
  parts.pop(); // page.tsx
  if (parts.some((p) => p.startsWith("_"))) return null;
  const segments = parts.filter((s) => !(s.startsWith("(") && s.endsWith(")")) && !s.startsWith("@"));
  return `/${segments.join("/")}`.replace(/\/$/, "") || "/";
}

/** Walk app/ for page files. */
export function findPageFiles(repoRoot, appDir = "app") {
  const root = join(repoRoot, appDir);
  const found = [];
  if (!existsSync(root)) return found;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/^page\.(tsx|ts|jsx|js|mdx)$/.test(entry.name)) found.push(posix(relative(repoRoot, full)));
    }
  };
  walk(root);
  return found.sort();
}

/** The route inventory: every page file, its URL, its section, dynamic or not. */
export function buildRouteInventory(repoRoot, config) {
  const routes = [];
  for (const file of findPageFiles(repoRoot, config.site.appDir)) {
    const route = routeFromPageFile(file);
    if (route === null) continue;
    if (route === "/api" || route.startsWith("/api/")) continue;
    routes.push({
      route,
      file,
      section: classifyRoute(route),
      dynamic: /\[/.test(route),
    });
  }
  return routes;
}

/** Rendered HTML path for a route. */
export function renderedHtmlPath(repoRoot, config, route) {
  const base = join(repoRoot, config.site.renderedDir);
  return route === "/" ? join(base, "index.html") : join(base, `${route.slice(1)}.html`);
}

/** Parse sitemap.xml into its <loc> values, in order. */
export function parseSitemapXml(xml) {
  if (typeof xml !== "string" || !/<urlset\b/i.test(xml)) return null;
  return [...xml.matchAll(/<loc>\s*([\s\S]*?)\s*<\/loc>/gi)].map((m) => m[1].replace(/&amp;/g, "&"));
}

/** Parse robots.txt into groups of { agents, allow, disallow } plus sitemaps and malformed lines. */
export function parseRobots(text) {
  if (typeof text !== "string") return null;
  const groups = [];
  const sitemaps = [];
  const hosts = [];
  const malformed = [];
  let current = null;
  let lastWasAgent = false;
  const known = new Set(["user-agent", "allow", "disallow", "sitemap", "host", "crawl-delay"]);
  text.split(/\r?\n/).forEach((rawLine, i) => {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) return;
    const idx = line.indexOf(":");
    if (idx < 0) {
      malformed.push({ line: i + 1, text: rawLine });
      return;
    }
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (!known.has(key)) {
      malformed.push({ line: i + 1, text: rawLine });
      return;
    }
    if (key === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], allow: [], disallow: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      return;
    }
    lastWasAgent = false;
    if (key === "sitemap") sitemaps.push(value);
    else if (key === "host") hosts.push(value);
    else if (key === "allow" || key === "disallow") {
      if (!current) {
        malformed.push({ line: i + 1, text: rawLine });
        return;
      }
      current[key].push(value);
    }
  });
  return { groups, sitemaps, hosts, malformed };
}

/** Every file under public/, keyed by its exact web path ("/images/x.webp"). */
export function indexPublicAssets(repoRoot, config) {
  const root = join(repoRoot, config.site.publicDir);
  const files = new Map();
  if (existsSync(root)) {
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else files.set(`/${posix(relative(root, full))}`, { absolute: full, bytes: statSync(full).size });
      }
    };
    walk(root);
  }
  // Next also serves app/icon.png etc. at the root.
  const appRoot = join(repoRoot, config.site.appDir);
  if (existsSync(appRoot)) {
    for (const entry of readdirSync(appRoot, { withFileTypes: true })) {
      if (entry.isFile() && /^(icon|apple-icon|favicon|opengraph-image|twitter-image)\.[a-z]+$/.test(entry.name)) {
        const full = join(appRoot, entry.name);
        files.set(`/${entry.name}`, { absolute: full, bytes: statSync(full).size, appConvention: true });
      }
    }
  }
  const lower = new Map();
  for (const path of files.keys()) {
    const key = path.toLowerCase();
    lower.set(key, [...(lower.get(key) ?? []), path]);
  }

  // Which of them are committed. Vercel builds from git, so an untracked file
  // that works locally is a 404 in production.
  let tracked = null;
  const ls = spawnSync("git", ["ls-files", "-z", "--", config.site.publicDir, config.site.appDir], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (ls.status === 0) {
    tracked = new Set();
    for (const f of ls.stdout.split("\0").filter(Boolean)) {
      if (f.startsWith(`${config.site.publicDir}/`)) tracked.add(`/${f.slice(config.site.publicDir.length + 1)}`);
      else if (f.startsWith(`${config.site.appDir}/`) && !f.slice(config.site.appDir.length + 1).includes("/")) {
        tracked.add(`/${f.slice(config.site.appDir.length + 1)}`);
      }
    }
  }
  return { files, lower, tracked };
}

/**
 * Resolve a local web path against public/.
 * @returns {{status:"ok"|"case"|"missing"|"untracked", exact?:string, candidates?:string[], bytes?:number}}
 */
export function resolveAsset(assets, webPath) {
  let path;
  try {
    path = decodeURIComponent(webPath.split("#")[0].split("?")[0]);
  } catch {
    path = webPath.split("#")[0].split("?")[0];
  }
  if (assets.files.has(path)) {
    const f = assets.files.get(path);
    if (assets.tracked && !f.appConvention && !assets.tracked.has(path)) return { status: "untracked", exact: path, bytes: f.bytes };
    return { status: "ok", exact: path, bytes: f.bytes };
  }
  const candidates = assets.lower.get(path.toLowerCase()) ?? [];
  if (candidates.length) return { status: "case", candidates, path };
  return { status: "missing", path };
}

/** Read every source file under the configured roots, split into lines. */
export function readSourceFiles(repoRoot, config) {
  const files = [];
  for (const dir of config.site.sourceDirs) {
    const root = join(repoRoot, dir);
    if (!existsSync(root)) continue;
    const walk = (d) => {
      for (const entry of readdirSync(d, { withFileTypes: true })) {
        const full = join(d, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(tsx?|jsx?|mjs)$/.test(entry.name)) {
          const text = readFileSync(full, "utf8");
          files.push({ file: posix(relative(repoRoot, full)), text, lines: text.split("\n") });
        }
      }
    };
    walk(root);
  }
  return files;
}

/**
 * Load lib/content.ts by transpiling it with the project's own TypeScript and
 * importing the result. The registry has no imports, so it can be evaluated
 * in isolation; if that ever changes, this fails loudly and the registry
 * checks report that they could not run rather than guessing.
 */
export async function loadRegistry(repoRoot, config) {
  const file = join(repoRoot, config.site.registryFile);
  if (!existsSync(file)) return { ok: false, reason: `${config.site.registryFile} does not exist` };
  const source = readFileSync(file, "utf8");
  if (/^\s*import\s+(?!type\b)/m.test(source)) {
    return { ok: false, reason: `${config.site.registryFile} imports other modules, so it cannot be evaluated in isolation` };
  }
  let ts;
  try {
    ts = (await import("typescript")).default;
  } catch (err) {
    return { ok: false, reason: `the typescript package is not installed (${err.message})` };
  }
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const dir = mkdtempSync(join(tmpdir(), "lvinit-site-quality-registry-"));
  const out = join(dir, "content.mjs");
  try {
    writeFileSync(out, js, "utf8");
    const mod = await import(pathToFileURL(out).href);
    return {
      ok: true,
      guides: Array.isArray(mod.guides) ? mod.guides : [],
      videos: Array.isArray(mod.videos) ? mod.videos : [],
      neighborhoods: Array.isArray(mod.neighborhoods) ? mod.neighborhoods : [],
      source,
    };
  } catch (err) {
    return { ok: false, reason: `${config.site.registryFile} could not be evaluated (${err.message})` };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Newest modification time among the files a build depends on. */
function newestSourceMtime(repoRoot, config) {
  let newest = 0;
  let newestFile = null;
  const roots = [...config.site.sourceDirs, config.site.publicDir];
  for (const dir of roots) {
    const root = join(repoRoot, dir);
    if (!existsSync(root)) continue;
    const walk = (d) => {
      for (const entry of readdirSync(d, { withFileTypes: true })) {
        const full = join(d, entry.name);
        if (entry.isDirectory()) walk(full);
        else {
          const t = statSync(full).mtimeMs;
          if (t > newest) {
            newest = t;
            newestFile = posix(relative(repoRoot, full));
          }
        }
      }
    };
    walk(root);
  }
  return { newest, newestFile };
}

/** Is there a build, and is it at least as new as the source? */
export function buildStatus(repoRoot, config) {
  const idFile = join(repoRoot, config.site.buildIdFile);
  if (!existsSync(idFile)) return { present: false, fresh: false, reason: "no production build found (.next/BUILD_ID is missing)" };
  const builtAt = statSync(idFile).mtimeMs;
  const { newest, newestFile } = newestSourceMtime(repoRoot, config);
  const fresh = newest <= builtAt + 1000;
  return {
    present: true,
    fresh,
    builtAt: new Date(builtAt).toISOString(),
    buildId: readFileSync(idFile, "utf8").trim(),
    reason: fresh
      ? "the build is newer than every source file"
      : `${newestFile} changed after the last build, so rendered findings may be stale — rerun with --build`,
  };
}

/**
 * Gather the whole inventory.
 */
export async function buildInventory({ repoRoot, config }) {
  const routes = buildRouteInventory(repoRoot, config);
  const build = buildStatus(repoRoot, config);
  const renderedRoot = join(repoRoot, config.site.renderedDir);

  const rendered = new Map();
  const renderErrors = [];
  if (build.present) {
    for (const r of routes) {
      if (r.dynamic) continue;
      const htmlPath = renderedHtmlPath(repoRoot, config, r.route);
      if (!existsSync(htmlPath)) continue;
      try {
        rendered.set(r.route, parsePage(readFileSync(htmlPath, "utf8")));
      } catch (err) {
        renderErrors.push({ route: r.route, error: err.message });
      }
    }
  }

  const sitemapBody = join(renderedRoot, "sitemap.xml.body");
  const robotsBody = join(renderedRoot, "robots.txt.body");
  const sitemapXml = existsSync(sitemapBody) ? readFileSync(sitemapBody, "utf8") : null;
  const robotsTxt = existsSync(robotsBody) ? readFileSync(robotsBody, "utf8") : null;

  const sitemapSourcePath = join(repoRoot, config.site.sitemapSource);
  const nextConfig = ["next.config.mjs", "next.config.js", "next.config.ts"].map((f) => join(repoRoot, f)).find((f) => existsSync(f));
  return {
    repoRoot,
    nextConfigText: nextConfig ? readFileSync(nextConfig, "utf8") : "",
    routes,
    routeSet: new Set(routes.map((r) => r.route)),
    build,
    rendered,
    renderErrors,
    // Is a route prerendered as a server function rather than HTML? Then its
    // HTML simply does not exist, and that is not a failure.
    isServerRendered: (route) =>
      existsSync(join(renderedRoot, route === "/" ? "page.js" : `${route.slice(1)}/page.js`)) &&
      !existsSync(renderedHtmlPath(repoRoot, config, route)),
    sitemap: {
      xml: sitemapXml,
      locs: parseSitemapXml(sitemapXml),
      source: existsSync(sitemapSourcePath) ? readFileSync(sitemapSourcePath, "utf8") : null,
    },
    robots: { text: robotsTxt, parsed: parseRobots(robotsTxt) },
    assets: indexPublicAssets(repoRoot, config),
    sources: readSourceFiles(repoRoot, config),
    registry: await loadRegistry(repoRoot, config),
  };
}
