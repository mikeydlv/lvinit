// ---------------------------------------------------------------------------
// STATE — Development Watch's memory, on the lvinit-agent-state branch
//
//   data/development-watch/projects.json   the project registry: identity,
//                                           aliases, current + prior status,
//                                           scale, dates, source history,
//                                           LVINIT pages covering it. THE
//                                           source of truth for development
//                                           project status across agents.
//   data/development-watch/events.json     every change event, by fingerprint,
//                                           with its lifecycle
//   data/development-watch/seen.json       documents already processed (URL →
//                                           content hash), so unchanged items
//                                           are never re-processed
//   data/development-watch/sources.json    per-source health, last success,
//                                           ETag / Last-Modified, cadence,
//                                           Legistar meeting versions, and the
//                                           tracked-project query rotation
//
// Same conventions as the Local Trend Agent's state (lib/state.mjs): plain,
// stable-ordered JSON with schema_version and agent, unreadable state stops
// the run rather than being overwritten.
//
// EVENT LIFECYCLE
//   NEW          first run this fingerprint appeared, with a real change
//   PERSISTING   seen again, unchanged — counted, not re-surfaced
//   UPDATED      same state, but verification improved (first primary source)
//   HANDED_OFF   was in a LIVE queue (never in v1: the queue is dry-run)
//   PUBLISHED    a Publisher commit carries its fingerprint
//   RESOLVED     superseded by a newer state of the same project, or aged out
//   DUPLICATE    no change against what LVINIT / the registry already had
//   REJECTED     judged low value — remembered so it is not re-listed
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

export const SCHEMA_VERSION = 1;
const AGENT = "development-watch";

function readJson(file, fallback) {
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`State file ${file} is not valid JSON (${error.message}). Fix or remove it — Development Watch will not overwrite state it cannot read.`);
  }
}

export function writeJson(file, value) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

const sortObject = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));

export function loadState(paths) {
  return {
    projects: readJson(paths.projects, null)?.projects ?? {},
    events: readJson(paths.events, null)?.events ?? {},
    seen: readJson(paths.seen, null)?.items ?? {},
    sources: readJson(paths.sources, null) ?? { sources: {}, legistar: { events: {} }, entityQueries: {} },
  };
}

export function saveState(paths, state, today) {
  writeJson(paths.projects, { schema_version: SCHEMA_VERSION, agent: AGENT, updated: today, projects: sortObject(state.projects) });
  writeJson(paths.events, { schema_version: SCHEMA_VERSION, agent: AGENT, updated: today, events: sortObject(state.events) });
  writeJson(paths.seen, { schema_version: SCHEMA_VERSION, agent: AGENT, updated: today, items: sortObject(state.seen) });
  writeJson(paths.sources, { schema_version: SCHEMA_VERSION, agent: AGENT, updated: today, sources: sortObject(state.sources.sources ?? {}), legistar: state.sources.legistar ?? { events: {} }, entityQueries: sortObject(state.sources.entityQueries ?? {}) });
}

/** Tracked projects become known entities on the next run (with their aliases). */
export function trackedEntities(projects) {
  return Object.values(projects).map((p) => ({
    id: p.id,
    name: p.name,
    aliases: p.aliases ?? [],
    contextAliases: [],
    area: p.area ?? null,
    jurisdiction: p.jurisdiction ?? null,
    developer: p.developer ?? null,
    type: p.type ?? null,
    origin: p.origin ?? "discovered",
    provisional: Boolean(p.provisional),
    headline: p.headline ?? null,
    routes: p.lvinit_routes ?? [],
    roster: [],
    baseline: null,
  }));
}

export function contentHash(item) {
  let h = 0;
  const s = `${item.title}|${item.snippet ?? ""}|${item.legistar?.action ?? ""}`;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
}

/** Items whose URL + content were already processed are skipped. */
export function partitionSeen(items, seen) {
  const fresh = [];
  const unchanged = [];
  for (const it of items) {
    const prev = seen[it.url];
    if (prev && prev.h === contentHash(it)) unchanged.push(it);
    else fresh.push(it);
  }
  return { fresh, unchanged };
}

export function rememberSeen(seen, entries, { today, retentionDays }) {
  const out = { ...seen };
  for (const e of entries) {
    const prev = out[e.item.url];
    out[e.item.url] = { h: contentHash(e.item), first_seen: prev?.first_seen ?? today, last_seen: today, outcome: e.outcome, ...(e.entityId ? { entity: e.entityId } : {}) };
  }
  const cutoff = Date.parse(today) - retentionDays * 86_400_000;
  for (const [k, v] of Object.entries(out)) if (Date.parse(v.last_seen) < cutoff) delete out[k];
  return out;
}

function sourceRef(s) {
  return { name: s.name, url: s.url, authority: s.authority, published: s.published ?? null };
}

/**
 * Lifecycle, id and previous lifecycle for this run's events — before the
 * handoff check (which needs them) and before anything is written.
 */
export function assignLifecycles(state, events, { today, published, nextId }) {
  for (const ev of events) {
    const prior = state.events[ev.fingerprint];
    ev.previousLifecycle = prior?.lifecycle ?? null;
    // DEV-YYYY-MM-DD-NNN is issued once, the first time a fingerprint appears.
    ev.id = prior?.id ?? nextId();
    ev.firstSeen = prior?.first_seen ?? today;
    if (published.fingerprints.has(ev.fingerprint)) ev.lifecycle = "PUBLISHED";
    else if (prior) {
      const hadPrimary = (prior.sources ?? []).some((x) => x.authority <= 7);
      const hasPrimary = ev.sources.some((x) => x.authority <= 7);
      if (["HANDED_OFF", "PUBLISHED", "REJECTED", "DUPLICATE"].includes(prior.lifecycle)) ev.lifecycle = prior.lifecycle;
      else if (!hadPrimary && hasPrimary) ev.lifecycle = "UPDATED";
      else ev.lifecycle = "PERSISTING";
    } else if (ev.changeClass === "DUPLICATE") ev.lifecycle = "DUPLICATE";
    else if (ev.action === "REJECT_LOW_VALUE") ev.lifecycle = "REJECTED";
    else ev.lifecycle = "NEW";
  }
  return events;
}

/**
 * Apply one run's events (lifecycles already assigned) to the registry and
 * the ledger.
 */
export function applyRun(state, events, { today, entitiesById, published, config }) {
  const projects = { ...state.projects };
  const ledger = { ...state.events };

  for (const ev of events) {
    const prior = ledger[ev.fingerprint];
    const knownUrls = new Set((prior?.sources ?? []).map((s) => s.url));
    ledger[ev.fingerprint] = {
      id: ev.id,
      fingerprint: ev.fingerprint,
      entity_id: ev.entityId,
      entity_name: ev.entityName,
      change_class: prior?.change_class ?? ev.changeClass,
      changes: prior?.changes ?? ev.changes.map((c) => c.detail),
      event_type: ev.eventType,
      status: ev.status,
      prior_status: ev.priorStatus,
      first_seen: prior?.first_seen ?? today,
      last_seen: today,
      times_seen: (prior?.times_seen ?? 0) + 1,
      lifecycle: ev.lifecycle,
      lifecycle_history: [...(prior?.lifecycle_history ?? []), ...(prior?.lifecycle !== ev.lifecycle ? [{ date: today, lifecycle: ev.lifecycle }] : [])].slice(-12),
      action: ev.action,
      target: ev.target,
      score: ev.score,
      confidence: ev.confidence,
      sources: [...(prior?.sources ?? []), ...ev.sources.filter((s) => !knownUrls.has(s.url)).map(sourceRef)].slice(-20),
      superseded_by: prior?.superseded_by ?? null,
      handoff: { eligible: ev.handoff.eligible, blockers: ev.handoff.blockers, queued: [...(prior?.handoff?.queued ?? []), ...(ev.queuedMode ? [{ date: today, mode: ev.queuedMode }] : [])].slice(-6) },
    };

    // Earlier open events of the same project are superseded by a new state.
    if (!prior && ev.changeClass !== "DUPLICATE") {
      for (const other of Object.values(ledger)) {
        if (other.entity_id === ev.entityId && other.fingerprint !== ev.fingerprint && ["NEW", "PERSISTING", "UPDATED"].includes(other.lifecycle)) {
          other.lifecycle = "RESOLVED";
          other.superseded_by = ev.fingerprint;
          other.lifecycle_history = [...(other.lifecycle_history ?? []), { date: today, lifecycle: "RESOLVED" }].slice(-12);
        }
      }
    }

    // The registry record for the project.
    const entity = entitiesById.get(ev.entityId);
    const rec = projects[ev.entityId] ?? {
      id: ev.entityId,
      name: entity?.name ?? ev.entityName,
      aliases: entity?.aliases ?? [],
      area: entity?.area ?? null,
      jurisdiction: entity?.jurisdiction ?? null,
      developer: entity?.developer ?? null,
      type: entity?.type ?? null,
      origin: entity?.origin ?? "discovered",
      provisional: Boolean(entity?.provisional),
      headline: entity?.headline ?? null,
      first_seen: today,
      status: entity?.baseline?.status ?? null,
      status_history: entity?.baseline ? [{ date: today, status: entity.baseline.status, evidence: entity.baseline.note ?? null, url: entity.baseline.sourceUrl ?? null, authority: null, origin: `LVINIT ${entity.baseline.origin}` }] : [],
      units: entity?.baseline?.units ?? null,
      target_year: entity?.baseline?.targetYear ?? null,
      target_kind: entity?.baseline?.targetKind ?? null,
      sources: [],
    };
    rec.last_seen = today;
    rec.lvinit_routes = ev.coverage.map((c) => c.route);
    const knownRec = new Set(rec.sources.map((s) => s.url));
    rec.sources = [...rec.sources, ...ev.sources.filter((s) => !knownRec.has(s.url)).map((s) => ({ ...sourceRef(s), first_seen: today }))].slice(-25);

    // Only verified, non-conflicting changes move the record. Low-confidence
    // claims stay in the event ledger until something stronger confirms them.
    const moves = ev.changeClass !== "CONFLICT" && ev.confidence !== "Low";
    if (moves) {
      for (const c of ev.changes) {
        if (c.kind === "STATUS_CHANGED" || (c.kind === "NEW_PROJECT" && ev.status !== "unclear")) {
          rec.prior_status = rec.status ?? null;
          rec.status = ev.status;
          rec.status_history = [...(rec.status_history ?? []), { date: today, status: ev.status, evidence: ev.evidence, url: ev.evidenceUrl, authority: ev.evidenceAuthority }].slice(-15);
        }
        if (c.kind === "SCALE_CHANGED" || (c.kind === "NEW_PROJECT" && ev.units)) rec.units = ev.units;
        if (c.kind === "TIMELINE_CHANGED" || (c.kind === "NEW_PROJECT" && ev.targetYear)) {
          rec.target_year = ev.targetYear;
          rec.target_kind = ev.targetKind;
          rec.target_text = ev.targetText;
        }
      }
      if (ev.acres && !rec.acres) rec.acres = ev.acres;
      if (ev.sources.some((s) => s.authority <= 7) && ev.confidence === "High") rec.last_verified = today;
    }
    projects[ev.entityId] = rec;
  }

  // Age out open events that have not been seen for a long time.
  const cutoff = Date.parse(today) - config.lifecycle.staleAfterDays * 86_400_000;
  for (const e of Object.values(ledger)) {
    if (["NEW", "PERSISTING", "UPDATED"].includes(e.lifecycle) && Date.parse(e.last_seen) < cutoff) {
      e.lifecycle = "RESOLVED";
      e.lifecycle_history = [...(e.lifecycle_history ?? []), { date: today, lifecycle: "RESOLVED (aged out)" }].slice(-12);
    }
    if (published.fingerprints.has(e.fingerprint) && e.lifecycle !== "PUBLISHED") {
      e.lifecycle = "PUBLISHED";
      e.lifecycle_history = [...(e.lifecycle_history ?? []), { date: today, lifecycle: "PUBLISHED" }].slice(-12);
    }
  }
  return { projects, events: ledger };
}

/** Source health bookkeeping. */
export function recordSourceHealth(sourcesState, health, today) {
  const out = { ...(sourcesState.sources ?? {}) };
  for (const h of health) {
    if (h.skipped) {
      out[h.id] = { ...(out[h.id] ?? {}), last_skipped: today, skip_reason: h.skipped };
      continue;
    }
    const prev = out[h.id] ?? {};
    out[h.id] = {
      ...prev,
      last_attempt: today,
      last_status: h.status ?? null,
      last_error: h.ok ? null : h.error ?? `HTTP ${h.status}`,
      last_success: h.ok ? today : prev.last_success ?? null,
      consecutive_failures: h.ok ? 0 : (prev.consecutive_failures ?? 0) + 1,
      items: h.items ?? 0,
      ...(h.etag !== undefined ? { etag: h.etag } : {}),
      ...(h.lastModified !== undefined ? { last_modified: h.lastModified } : {}),
    };
  }
  return { ...sourcesState, sources: out };
}
