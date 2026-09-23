// ---------------------------------------------------------------------------
// THE PIPELINE — pure functions; the runner does all I/O
//
//   triage()        normalize → authority → age → in-run URL dedupe →
//                   already-processed skip → development gate
//   buildEvents()   entity resolution → one observation per project →
//                   change detection → fingerprint → coverage → score →
//                   confidence → content action → Fair Housing → lifecycle →
//                   handoff eligibility
//
// Monitor → detect meaningful change → verify → dedupe → score → brief → hand off.
// ---------------------------------------------------------------------------

import { normalizeItems, bestAreaTier, daysOld } from "../../lib/classify.mjs";
import { ACTIONS, PUBLISHER_ACTIONS } from "../config.mjs";
import { withAuthority, authorityLabel } from "./authority.mjs";
import { gateItem } from "./detect.mjs";
import { matchKnownEntity, resolveEntities } from "./entity.mjs";
import { readItem, observe, detectChanges, changeClass, eventType, fingerprint, CHANGE } from "./events.mjs";
import { coverageFor, pillarFor } from "./coverage.mjs";
import { scoreEvent, confidenceFor, evidenceClassOf } from "./score.mjs";
import { classifyAction, interpretation, recommendation, fairHousing, isPromotionalOnly } from "./classify.mjs";
import { partitionSeen, assignLifecycles } from "./state.mjs";
import { handoffEligibility } from "./handoff.mjs";
import { STATUS } from "./status.mjs";

export function areaLabelFor(key, trendConfig) {
  return trendConfig.areas.find((a) => a.key === key)?.label ?? (key === "valley" ? "the Las Vegas Valley" : key ?? "the Las Vegas Valley");
}

/**
 * @returns {{passing, rejected, unchanged, stale, duplicatesInRun, total}}
 */
export function triage(rawItems, { config, today, seen, knownEntities }) {
  const normalized = withAuthority(normalizeItems(rawItems));
  const stale = [];
  const fresh = [];
  for (const it of normalized) {
    const age = daysOld(it.published, today);
    if (age !== null && age > config.gate.maxAgeDays) stale.push(it);
    else fresh.push({ ...it, ageDays: age });
  }
  // The same URL from the shared pass and a dev query is one document.
  const byUrl = new Map();
  const duplicatesInRun = [];
  for (const it of fresh.sort((a, b) => a.authority - b.authority)) {
    if (byUrl.has(it.url)) duplicatesInRun.push(it);
    else byUrl.set(it.url, it);
  }
  const { fresh: toProcess, unchanged } = partitionSeen([...byUrl.values()], seen);
  const known = [...knownEntities.values()];
  const passing = [];
  const rejected = [];
  for (const it of toProcess) {
    const match = matchKnownEntity(it, known);
    const g = gateItem(it, config.trends, { knownEntity: Boolean(match) });
    const enriched = { ...it, topics: g.topics, areas: it.presetAreas ? [...new Set([...it.presetAreas, ...g.areas])] : g.areas };
    if (g.pass) passing.push(enriched);
    else rejected.push({ ...enriched, reason: g.reason, noise: g.noise });
  }
  return { passing, rejected, unchanged, stale, duplicatesInRun, total: rawItems.length };
}

function sourceRow(it, read) {
  return { itemId: it.id, name: it.sourceName ?? it.sourceDomain ?? it.via, title: it.title, url: it.url, authority: it.authority, authorityLabel: authorityLabel(it.authority), authorityClass: it.authorityClass, published: it.published ?? null, via: it.via, evidence: read?.evidence ?? null, evidenceStatus: read?.status ?? null, evidenceIn: read?.evidenceIn ?? null };
}

const CLASS_ORDER = { CONFLICT: 0, MATERIAL_UPDATE: 1, NEW: 2, DUPLICATE: 3 };

/**
 * @param passing   gate-passing items (excerpts already attached by the runner)
 * @param known     Map id → known entity (seeds + roster + tracked projects)
 */
export function buildEvents(passing, { config, today, known, state, coverage, published, fixture = false }) {
  const { assignments, created } = resolveEntities(passing, known, { areaLabel: (k) => areaLabelFor(k, config.trends) });
  const entitiesById = new Map([...known, ...created]);
  const groups = new Map();
  for (const it of passing) {
    const a = assignments.get(it.id);
    if (!groups.has(a.entityId)) groups.set(a.entityId, []);
    groups.get(a.entityId).push({ ...it, entityHow: a.how });
  }

  const events = [];
  for (const [entityId, items] of groups) {
    const entity = entitiesById.get(entityId);
    const itemsById = new Map(items.map((it) => [it.id, it]));
    const reads = new Map(items.map((it) => [it.id, readItem(it, entity)]));
    const obs = observe(entity, items, reads, config);
    const record = state.projects[entityId] ?? null;
    const { changes, prior } = detectChanges(entity, record, obs, { itemsById, config });
    const cls = changeClass(changes);
    const kinds = changes.map((c) => c.kind);

    // The project's state after this run, for the fingerprint: a vaguer
    // retelling keeps the known state, a real change replaces it.
    const statusMoves = kinds.includes(CHANGE.STATUS_CHANGED) || kinds.includes(CHANGE.NEW_PROJECT);
    const merged = {
      status: statusMoves || !prior?.status ? obs.status : prior.status,
      units: kinds.includes(CHANGE.SCALE_CHANGED) || !prior?.units ? obs.units ?? prior?.units ?? null : prior.units,
      targetYear: kinds.includes(CHANGE.TIMELINE_CHANGED) || !prior?.targetYear ? obs.targetYear ?? prior?.targetYear ?? null : prior.targetYear,
    };
    const fp = fingerprint(entityId, merged);
    const topics = [...new Set(items.flatMap((it) => it.topics ?? []))];
    if (entity.type && !topics.includes(entity.type)) topics.unshift(entity.type);
    const areaKeys = [...new Set([entity.area, ...items.flatMap((it) => it.areas ?? [])].filter(Boolean))];
    const areaTier = bestAreaTier(areaKeys, config.trends);
    const mainArea = entity.area ?? areaKeys.sort((a, b) => bestAreaTier([a], config.trends) - bestAreaTier([b], config.trends))[0] ?? "valley";
    const areaLabel = areaLabelFor(mainArea, config.trends);
    const cov = coverageFor(entity, coverage);
    const pillar = pillarFor(mainArea, coverage) ?? areaKeys.map((k) => pillarFor(k, coverage)).find(Boolean) ?? null;
    const bestAuthority = Math.min(...items.map((it) => it.authority));
    const et = eventType(changes, obs, topics);
    const { score, components } = scoreEvent({ entity, obs, changeClass: cls, eventType: et, topics, areaTier, coverage: cov, pillar, bestAuthority, evidenceClass: evidenceClassOf(obs) });
    const promotionalOnly = isPromotionalOnly(items);
    const { confidence, reasons: confidenceReasons } = confidenceFor({ entity, obs, items, promotionalOnly });
    const { action, target, rationale } = classifyAction({ changeClass: cls, obs, score, confidence, coverage: cov, pillar, topics, config });
    const interp = interpretation({ entity, obs, eventType: et, areaLabel, topics });
    const rec = recommendation({ action, target, entity, obs });
    const fh = fairHousing({ items, generated: [interp, rec] });
    const evidenceItem = itemsById.get(obs.evidenceItemId);
    const sources = items
      .map((it) => sourceRow(it, reads.get(it.id)))
      .sort((a, b) => a.authority - b.authority || String(b.published).localeCompare(String(a.published)));
    const primaryEvidence = sources.filter((s) => s.authority <= 7 && s.evidence && obs.supportingItemIds.includes(s.itemId));

    events.push({
      fingerprint: fp,
      entityId,
      entityName: entity.name,
      entityOrigin: entity.origin,
      provisional: Boolean(entity.provisional),
      developer: entity.developer ?? null,
      jurisdiction: entity.jurisdiction ?? null,
      area: mainArea,
      areaLabel,
      topics,
      changeClass: cls,
      changes,
      eventType: et,
      priorStatus: prior?.status ?? null,
      priorFrom: prior?.from ?? null,
      status: merged.status,
      observedStatus: obs.status,
      evidence: obs.evidence,
      evidenceUrl: evidenceItem?.url ?? null,
      evidenceAuthority: obs.evidenceAuthority,
      units: merged.units,
      acres: obs.acres,
      dollars: obs.dollars,
      targetYear: merged.targetYear,
      targetText: obs.targetText,
      targetKind: obs.targetKind,
      conflicts: obs.conflicts,
      date: sources.map((s) => s.published).filter(Boolean).sort().at(-1)?.slice(0, 10) ?? today,
      sources,
      detected: `${et}: ${changes.map((c) => c.detail).join("; ")}${obs.evidence ? ` — “${obs.evidence}”` : ""}`,
      verified: primaryEvidence.length ? primaryEvidence.map((s) => `${s.name} (authority ${s.authority}): “${s.evidence}” ${s.url}`).join("\n") : "Not verified by a primary source.",
      interpretation: interp,
      recommendation: rec,
      coverage: cov,
      pillar: pillar?.route ?? null,
      score,
      scoreComponents: components,
      confidence,
      confidenceReasons,
      promotionalOnly,
      fairHousing: fh,
      action,
      target,
      actionRationale: rationale,
    });
  }

  events.sort((a, b) => CLASS_ORDER[a.changeClass] - CLASS_ORDER[b.changeClass] || b.score - a.score || a.entityId.localeCompare(b.entityId));
  let n = 0;
  const nextId = () => `DEV-${today}-${String(++n).padStart(3, "0")}`;
  assignLifecycles(state, events, { today, published, nextId });
  for (const ev of events) ev.handoff = handoffEligibility(ev, { config, routes: coverage.routes, published });
  return { events, entitiesById, created };
}

/** Events worth a reader's attention today. */
export function isHighPriority(ev) {
  return ["NEW", "UPDATED"].includes(ev.lifecycle) && (PUBLISHER_ACTIONS.has(ev.action) || ev.action === ACTIONS.CONTENT_BRIEF_INPUT) && ev.confidence !== "Low";
}

export function isMonitor(ev) {
  return ["NEW", "UPDATED"].includes(ev.lifecycle) && ev.action === ACTIONS.MONITOR_ONLY;
}

/** Structured editorial intelligence for the Content Brief Generator. Not search demand. */
export function developmentSignals(events, today) {
  return events
    .filter((e) => ["NEW", "UPDATED"].includes(e.lifecycle) && e.confidence !== "Low" && (PUBLISHER_ACTIONS.has(e.action) || e.action === ACTIONS.CONTENT_BRIEF_INPUT) && e.fairHousing.framingClean)
    .map((e) => ({
      signalType: "LOCAL_DEVELOPMENT_SIGNAL",
      notSearchDemand: true,
      note: "Editorial intelligence about a local change. It says nothing about how many people search for it.",
      date: today,
      eventId: e.id,
      fingerprint: e.fingerprint,
      entityId: e.entityId,
      entityName: e.entityName,
      area: e.area,
      areaLabel: e.areaLabel,
      topics: e.topics,
      eventType: e.eventType,
      status: e.status,
      priorStatus: e.priorStatus,
      score: e.score,
      confidence: e.confidence,
      recommendedAction: e.action,
      target: e.target,
      lvinitCoverage: e.coverage.map((c) => ({ route: c.route, kind: c.kind })),
      primarySources: e.sources.filter((s) => s.authority <= 7).map((s) => ({ name: s.name, url: s.url })),
      fairHousingSensitiveSubject: e.fairHousing.sensitiveSubject,
    }));
}

export { STATUS };
