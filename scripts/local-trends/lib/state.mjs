// ---------------------------------------------------------------------------
// STATE — the watchlist and the reviewed-story memory
//
//   data/social-trends/watchlist.json   projects being monitored
//   data/social-trends/reviewed.json    every story already looked at, and
//                                       what was decided, so nothing is
//                                       analyzed (or paid for) twice
//
// In CI both live on the lvinit-agent-state branch (see
// docs/AGENT_STATE_BRANCH.md). They are plain, stable-ordered JSON so a diff
// on that branch reads as "what changed today".
//
// THE RESURFACING RULE. A project already on the watchlist is only put back
// in front of Mikey when:
//   * its status moved up (with a verbatim quote — lib/status.mjs), or
//   * the model flagged material new information AND it came with a source
//     not already on file, or
//   * its score moved by config.scoring.resurfaceScoreDelta or more, or
//   * it newly connects to an existing LVINIT page.
// Otherwise it is quietly re-checked: last_checked moves, nothing surfaces.
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

import { mergeStatus } from "./status.mjs";

export const WATCHLIST_SCHEMA_VERSION = 1;
export const REVIEWED_SCHEMA_VERSION = 1;

function readJson(file, fallback) {
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`State file ${file} is not valid JSON (${error.message}). Fix or remove it — the agent will not overwrite state it cannot read.`);
  }
}

export function writeJson(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

export function loadWatchlist(file) {
  const w = readJson(file, null);
  return w ?? { schema_version: WATCHLIST_SCHEMA_VERSION, agent: "local-trends", updated: null, projects: [] };
}

export function loadReviewed(file) {
  const r = readJson(file, null);
  return r ?? { schema_version: REVIEWED_SCHEMA_VERSION, agent: "local-trends", updated: null, items: {} };
}

function sourceEntry(s, today, status) {
  return { source: s.sourceName, title: s.title, url: s.url, publication_date: s.published, tier: s.tier, date_checked: today, status_supported: status ?? null };
}

/**
 * Fold this run's topics into the watchlist.
 * Mutates nothing it was given; returns { watchlist, topics } where each
 * topic now carries `surface` (bool) and `surfaceReasons` (string[]).
 */
export function mergeTopics(watchlist, topics, { today, config }) {
  const projects = new Map((watchlist.projects ?? []).map((p) => [p.key, structuredClone(p)]));
  const out = [];

  for (const t of topics) {
    const prev = projects.get(t.key);
    const reasons = [];

    if (!prev) {
      if (t.priority === "IGNORE") {
        out.push({ ...t, surface: false, surfaceReasons: [] });
        continue;
      }
      projects.set(t.key, {
        key: t.key,
        name: t.name,
        area: t.area,
        category: t.category,
        kind: t.kind,
        status: t.status,
        first_seen: today,
        last_checked: today,
        last_change: today,
        sources: t.sources.map((s) => sourceEntry(s, today, s.id === t.statusEvidenceId ? t.status : null)),
        score: t.total,
        priority: t.priority,
        content_created: [],
        notes: "",
        status_history: [{ date: today, status: t.status, evidence: t.statusEvidence, source_url: evidenceUrl(t) }],
        score_history: [{ date: today, score: t.total }],
        connected_routes: t.existingContent.map((e) => e.route),
        last_summary: t.whyItMatters,
        surfaced_on: [today],
      });
      out.push({ ...t, statusEvidenceUrl: evidenceUrl(t), surface: true, surfaceReasons: ["new"] });
      continue;
    }

    const status = mergeStatus(prev.status, { status: t.status });
    if (status.changed) reasons.push(`status ${prev.status} → ${status.status}`);

    const knownUrls = new Set((prev.sources ?? []).map((s) => s.url));
    const newSources = t.sources.filter((s) => !knownUrls.has(s.url));
    if (t.materialNewInfo && newSources.length) reasons.push(`new information${t.whatChanged ? `: ${t.whatChanged}` : ""}`);

    if (Math.abs(t.total - (prev.score ?? 0)) >= config.scoring.resurfaceScoreDelta) reasons.push(`score ${prev.score} → ${t.total}`);

    const knownRoutes = new Set(prev.connected_routes ?? []);
    const newRoutes = t.existingContent.map((e) => e.route).filter((r) => !knownRoutes.has(r));
    if (newRoutes.length) reasons.push(`now connects to ${newRoutes.join(", ")}`);

    const p = prev;
    p.last_checked = today;
    p.sources = [...(p.sources ?? []), ...newSources.map((s) => sourceEntry(s, today, status.changed && s.id === t.statusEvidenceId ? status.status : null))];
    p.score = t.total;
    p.priority = t.priority;
    p.connected_routes = [...knownRoutes, ...newRoutes];
    p.score_history = [...(p.score_history ?? []), { date: today, score: t.total }].slice(-20);
    if (status.changed) {
      p.status = status.status;
      p.status_history = [...(p.status_history ?? []), { date: today, status: status.status, evidence: t.statusEvidence, source_url: evidenceUrl(t) }];
    }
    if (reasons.length) {
      p.last_change = today;
      p.last_summary = t.whatChanged || t.whyItMatters || p.last_summary;
      p.surfaced_on = [...(p.surfaced_on ?? []), today].slice(-30);
    }
    // A lower status in today's text never lowers the record, but the topic
    // shown in the report carries the evidenced status on file.
    const onFile = (p.status_history ?? []).at(-1) ?? {};
    out.push({
      ...t,
      status: p.status,
      statusEvidence: status.changed ? t.statusEvidence : onFile.evidence ?? null,
      statusEvidenceUrl: status.changed ? evidenceUrl(t) : onFile.source_url ?? null,
      statusNote: status.changed ? t.statusNote : t.statusNote && t.status !== p.status ? null : t.statusNote,
      surface: reasons.length > 0,
      surfaceReasons: reasons,
      contentCreated: p.content_created ?? [],
    });
  }

  const next = {
    schema_version: WATCHLIST_SCHEMA_VERSION,
    agent: "local-trends",
    updated: today,
    projects: [...projects.values()].sort((a, b) => a.key.localeCompare(b.key)),
  };
  return { watchlist: next, topics: out };
}

function evidenceUrl(t) {
  if (!t.statusEvidenceId) return null;
  return t.sources.find((s) => s.id === t.statusEvidenceId)?.url ?? null;
}

/** Remember every story decided this run; forget ones older than retention. */
export function updateReviewed(reviewed, entries, { today, retentionDays }) {
  const items = { ...(reviewed.items ?? {}) };
  for (const e of entries) {
    if (!e.fingerprint) continue;
    items[e.fingerprint] = { url: e.url, title: e.title, first_seen: items[e.fingerprint]?.first_seen ?? today, outcome: e.outcome };
  }
  const cutoff = Date.parse(today) - retentionDays * 86_400_000;
  for (const [k, v] of Object.entries(items)) {
    if (Date.parse(v.first_seen) < cutoff) delete items[k];
  }
  return {
    schema_version: REVIEWED_SCHEMA_VERSION,
    agent: "local-trends",
    updated: today,
    items: Object.fromEntries(Object.entries(items).sort(([a], [b]) => a.localeCompare(b))),
  };
}
