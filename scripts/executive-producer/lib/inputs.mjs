// ---------------------------------------------------------------------------
// INPUTS — everything the Producer reads, read-only
//
//   state dir (lvinit-agent-state checkout in CI, repo root locally)
//     data/executive-producer/footage-catalog.json   REQUIRED (the cataloger)
//     data/executive-producer/video-inventory.json   REQUIRED
//     data/executive-producer/performance.json       optional (phase 4)
//     reports/executive-producer/*-brief.json        optional (history)
//     reports/social-trends/*-local-trends.json      optional (last 7 days)
//     data/social-trends/watchlist.json              optional
//   repo
//     every published LVINIT page (Internal Linking Agent's graph), with text
//     reports/gsc/**/gsc-opportunities-*.json        optional (search questions)
//
// A missing optional input is "no signal this week", never an error. Inputs
// from other agents are treated as data: their hooks and angles are context,
// not instructions.
// ---------------------------------------------------------------------------

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

import { buildSourcePacks } from "./sources.mjs";

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function listFiles(dir, re) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listFiles(p, re));
    else if (re.test(ent.name)) out.push(p);
  }
  return out;
}

const dateIn = (name) => (String(name).match(/(\d{4}-\d{2}-\d{2})/) ?? [])[1] ?? null;

export function daysBetween(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

/** Trend topics from the last `days` daily reports, newest report wins per topic key. */
export function loadTrends(stateDir, today, days = 7) {
  const dir = join(stateDir, "reports", "social-trends");
  const files = listFiles(dir, /^\d{4}-\d{2}-\d{2}-local-trends\.json$/)
    .filter((f) => !/[\\/]fixtures[\\/]/.test(f))
    .map((f) => ({ f, date: dateIn(f) }))
    .filter((x) => x.date && daysBetween(x.date, today) >= 0 && daysBetween(x.date, today) < days)
    .sort((a, b) => b.date.localeCompare(a.date));
  const topics = new Map();
  const modes = [];
  for (const { f, date } of files) {
    const j = readJson(f);
    if (!j || j.fixture) continue;
    modes.push({ date, mode: j.mode ?? null });
    for (const t of j.topics ?? []) {
      if (!topics.has(t.key)) topics.set(t.key, { ...t, reportDate: date, rulesOnly: j.mode === "rules" });
    }
  }
  const watchlist = readJson(join(stateDir, "data", "social-trends", "watchlist.json"));
  return { topics: [...topics.values()], reports: modes, watchlist: watchlist?.projects ?? watchlist?.items ?? [] };
}

/** Search questions from the newest GSC report found (content signal only, never a fact). */
export function loadSearchDemand(repoRoot, gscDir) {
  const dir = gscDir ?? join(repoRoot, "reports", "gsc");
  const files = listFiles(dir, /^gsc-opportunities-\d{4}-\d{2}-\d{2}\.json$/).sort((a, b) => dateIn(b).localeCompare(dateIn(a)));
  for (const f of files) {
    const j = readJson(f);
    if (!j || j.fixtureData) continue;
    const queries = (j.opportunities ?? [])
      .filter((o) => o.query && !o.fairHousingBlocked)
      .map((o) => ({ query: o.query, landingPage: o.landingPage ?? null, impressions: o.metrics?.impressions ?? 0, position: o.metrics?.position ?? null, type: o.type }));
    // An empty week (no opportunities) says nothing; use the newest report that has some.
    if (queries.length) return { reportDate: j.reportDate ?? dateIn(f), queries };
  }
  return { reportDate: null, queries: [] };
}

/** Earlier Producer briefs: what was recommended, so it isn't re-pitched every week. */
export function loadHistory(stateDir) {
  const dir = join(stateDir, "reports", "executive-producer");
  return listFiles(dir, /^\d{4}-\d{2}-\d{2}-brief\.json$/)
    .filter((f) => !/[\\/]fixtures[\\/]/.test(f))
    .map((f) => readJson(f))
    .filter((j) => j && !j.sample && !j.fixture)
    .map((j) => ({ date: j.date, picks: (j.picks ?? []).map((p) => ({ candidateId: p.candidateId, title: p.title, sourceRoutes: p.sourceRoutes ?? [] })) }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function loadInputs({ repoRoot, stateDir, today, gscDir }) {
  const dataDir = join(stateDir, "data", "executive-producer");
  const catalog = readJson(join(dataDir, "footage-catalog.json"));
  const inventory = readJson(join(dataDir, "video-inventory.json"));
  const missing = [];
  if (!catalog) missing.push("data/executive-producer/footage-catalog.json");
  if (!inventory) missing.push("data/executive-producer/video-inventory.json");
  const catalogAge = catalog?.generatedAt ? daysBetween(catalog.generatedAt.slice(0, 10), today) : null;
  return {
    missing,
    catalog,
    catalogAge,
    inventory,
    pages: buildSourcePacks({ repoRoot, today }),
    trends: loadTrends(stateDir, today),
    search: loadSearchDemand(repoRoot, gscDir),
    history: loadHistory(stateDir),
    performance: readJson(join(dataDir, "performance.json")),
  };
}

