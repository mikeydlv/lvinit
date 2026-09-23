// ---------------------------------------------------------------------------
// EXISTING LVINIT COVERAGE — what the site already says about a project
//
// Before any recommendation, every event is checked against three kinds of
// existing coverage, strongest first:
//
//   dedicated   an article about this project (route/title names it, or the
//               seed file lists the route)
//   roster      a row in a neighborhood pillar's Development Watch section
//               (lib/areas/*.tsx), with the status LVINIT publishes and its source
//   mention     the project's name appears in a published page's own text
//
// Pages come from the Local Trend Agent's inventory (which is the Internal
// Linking Agent's link graph), so every agent agrees on what is published.
// Nothing here writes.
// ---------------------------------------------------------------------------

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

import { buildInventory } from "../../lib/inventory.mjs";
import { buildLinkGraph } from "../../../internal-links/lib/graph.mjs";
import { loadConfig as loadLinksConfig } from "../../../internal-links/config.mjs";
import { PILLARS } from "../config.mjs";
import { fromRosterStatus } from "./status.mjs";

/** Parse the `developmentProjects` array of a lib/areas/*.tsx file without executing it. */
export function parseRoster(source) {
  const s = String(source ?? "");
  const start = s.indexOf("developmentProjects");
  if (start === -1) return [];
  const end = s.indexOf("\n];", start);
  const block = s.slice(start, end === -1 ? undefined : end);
  const out = [];
  // Each project object starts with `name:` at the object's indentation.
  const parts = block.split(/\n\s{2}\{\s*\n/).slice(1);
  for (const part of parts) {
    const str = (key) => {
      const m = part.match(new RegExp(`\\b${key}:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`));
      return m ? m[1].replace(/\\"/g, '"') : null;
    };
    const name = str("name");
    const status = str("status");
    if (!name || !status) continue;
    const src = part.match(/source:\s*\{[\s\S]*?label:\s*"([^"]*)"[\s\S]*?url:\s*"([^"]*)"/);
    out.push({ name, rosterStatus: status, status: fromRosterStatus(status), where: str("where"), what: str("what"), caveat: str("caveat"), source: src ? { label: src[1], url: src[2] } : null });
  }
  return out;
}

/** The `// Statuses checked YYYY-MM-DD` line above a roster, if present. */
export function rosterCheckedDate(source) {
  const m = String(source ?? "").match(/Statuses checked (\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

export function slugId(name) {
  return `DEV-${String(name)
    .normalize("NFKD")
    .replace(/&/g, " and ")
    .replace(/[^\w\s-]/g, " ")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .toUpperCase()
    .slice(0, 48)
    .replace(/-$/, "")}`;
}

/**
 * The known-entity base for this run: seeds + every roster row not claimed
 * by a seed. Each entity carries its LVINIT baseline (what the site says).
 */
export function buildKnownEntities({ seeds, rosters }) {
  const byId = new Map();
  const claimed = new Map();
  for (const seed of seeds) for (const n of seed.rosterNames ?? []) claimed.set(n, seed.id);

  for (const seed of seeds) {
    byId.set(seed.id, {
      id: seed.id,
      name: seed.name,
      aliases: [...new Set([seed.name, ...(seed.aliases ?? [])].filter((a) => a && !/[()]/.test(a)))],
      contextAliases: seed.contextAliases ?? [],
      area: seed.area ?? null,
      jurisdiction: seed.jurisdiction ?? null,
      developer: seed.developer ?? null,
      type: seed.type ?? null,
      origin: "seed",
      routes: seed.routes ?? [],
      roster: [],
      baseline: seed.baseline ? { ...seed.baseline, origin: "dedicated article" } : null,
    });
  }
  for (const { pillarRoute, entries, checked } of rosters) {
    for (const r of entries) {
      const id = claimed.get(r.name) ?? slugId(r.name);
      const e =
        byId.get(id) ??
        {
          id,
          name: r.name,
          aliases: /^[A-Z]/.test(r.name) && r.name.split(" ").length <= 6 && !/[:()]/.test(r.name) ? [r.name] : [],
          contextAliases: [],
          area: PILLARS.find((p) => p.route === pillarRoute)?.areas[0] ?? null,
          jurisdiction: null,
          developer: null,
          type: null,
          origin: "roster",
          routes: [],
          roster: [],
          baseline: null,
        };
      e.roster.push({ route: pillarRoute, name: r.name, status: r.status, rosterStatus: r.rosterStatus, where: r.where, source: r.source, checked });
      if (!e.routes.includes(pillarRoute)) e.routes.push(pillarRoute);
      byId.set(id, e);
    }
  }
  // A roster-backed entity with no dedicated baseline takes the roster's status.
  const seedRosterStatus = new Map(seeds.filter((s) => s.rosterStatus).map((s) => [s.id, s.rosterStatus]));
  for (const e of byId.values()) {
    if (e.baseline || !e.roster.length) continue;
    const status = seedRosterStatus.get(e.id) ?? e.roster[0].status;
    e.baseline = { status, from: e.roster[0].route, origin: "neighborhood roster", note: `LVINIT roster "${e.roster[0].name}" (${e.roster[0].rosterStatus}${e.roster[0].checked ? `, statuses checked ${e.roster[0].checked}` : ""}), sourced to ${e.roster[0].source?.label ?? "unlisted"}.`, sourceUrl: e.roster[0].source?.url ?? null };
  }
  return byId;
}

/** Strip // and /* *\/ comments so article-internal notes do not count as coverage. */
export function visibleText(source) {
  return String(source ?? "")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:"'])\/\/[^\n]*/g, "$1 ");
}

/**
 * Everything the coverage check needs, read once per run.
 * @returns {{pages:object[], routes:Set<string>, rosters:object[], textByRoute:Map<string,string>}}
 */
export function loadCoverage({ repoRoot, today }) {
  const inventory = buildInventory({ repoRoot, today });
  const rosters = [];
  for (const p of PILLARS) {
    if (!p.rosterFile) continue;
    const file = join(repoRoot, p.rosterFile);
    if (!existsSync(file)) continue;
    const src = readFileSync(file, "utf8");
    rosters.push({ pillarRoute: p.route, file: p.rosterFile, checked: rosterCheckedDate(src), entries: parseRoster(src) });
  }
  const textByRoute = new Map();
  try {
    const linksConfig = loadLinksConfig({ content: { useGitDates: false }, gsc: { enabled: false }, factDecay: { enabled: false } });
    const graph = buildLinkGraph({ repoRoot, config: linksConfig, today });
    for (const page of graph.pages.values()) {
      const files = [page.file, ...PILLARS.filter((x) => x.route === page.route && x.rosterFile).map((x) => x.rosterFile)].filter(Boolean);
      const text = files.map((f) => (existsSync(join(repoRoot, f)) ? visibleText(readFileSync(join(repoRoot, f), "utf8")) : "")).join("\n");
      textByRoute.set(page.route, text);
    }
  } catch {
    // Coverage by mention is a bonus; dedicated + roster matching still work.
  }
  return { pages: inventory.pages, routes: inventory.routes, rosters, textByRoute };
}

function aliasRegex(alias) {
  // "Sport & Social" and "Sport and Social" are the same name.
  const esc = alias
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+(?:&|and)\s+/gi, " (?:&|and) ")
    .replace(/\s+/g, "\\s+");
  return new RegExp(`(?<![\\w-])${esc}(?![\\w-])`, "i");
}

/**
 * Where LVINIT already covers an entity.
 * @returns {Array<{route:string, kind:"dedicated"|"roster"|"mention", title?:string, publishedStatus?:string, rosterName?:string}>}
 */
export function coverageFor(entity, coverage) {
  const out = [];
  const seen = new Set();
  const add = (x) => {
    if (seen.has(`${x.route}|${x.kind}`)) return;
    seen.add(`${x.route}|${x.kind}`);
    out.push(x);
  };
  const aliases = [...(entity.aliases ?? []), ...(entity.contextAliases ?? []).map((c) => c.alias)].filter((a) => a && a.length >= 4);
  const strong = (entity.aliases ?? []).filter((a) => a.length >= 6);

  for (const route of entity.routes ?? []) {
    if (!coverage.routes.has(route)) continue;
    const roster = (entity.roster ?? []).find((r) => r.route === route);
    if (roster) add({ route, kind: "roster", title: coverage.pages.find((p) => p.route === route)?.title, publishedStatus: roster.status, rosterName: roster.name, rosterSource: roster.source?.url ?? null });
    else add({ route, kind: "dedicated", title: coverage.pages.find((p) => p.route === route)?.title });
  }
  for (const page of coverage.pages) {
    const hay = `${page.route.replace(/[/-]/g, " ")} ${page.title ?? ""}`;
    if (strong.some((a) => aliasRegex(a).test(hay))) add({ route: page.route, kind: "dedicated", title: page.title });
  }
  for (const [route, text] of coverage.textByRoute) {
    if (seen.has(`${route}|dedicated`) || seen.has(`${route}|roster`)) continue;
    const hit = aliases.find((a) => {
      if (!aliasRegex(a).test(text)) return false;
      const ctx = (entity.contextAliases ?? []).find((c) => c.alias === a);
      return !ctx || ctx.requires.test(text);
    });
    if (hit) add({ route, kind: "mention", title: coverage.pages.find((p) => p.route === route)?.title });
  }
  const order = { dedicated: 0, roster: 1, mention: 2 };
  return out.sort((a, b) => order[a.kind] - order[b.kind] || a.route.localeCompare(b.route));
}

/** The neighborhood pillar an area key belongs to, if the page exists. */
export function pillarFor(areaKey, coverage) {
  const p = PILLARS.find((x) => x.areas.includes(areaKey));
  if (!p || !coverage.routes.has(p.route)) return null;
  return { route: p.route, hasRoster: Boolean(p.rosterFile) };
}

export { aliasRegex };
