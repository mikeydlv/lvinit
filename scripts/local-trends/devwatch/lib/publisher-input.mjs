// ---------------------------------------------------------------------------
// DEVELOPMENT WATCH → PUBLISHER HANDOFF (slim)
//
// reports/development-watch/publisher-input.json: the few Development Watch
// events the Content Publisher might act on, from the last WINDOW_DAYS of
// daily reports, one row per project. The detailed daily reports, registry
// and dry-run queue are unchanged; this file only points at them.
//
// Every row carries a classification:
//   ok                  the event reads as being about the project it names
//   needs_revalidation  the attribution is suspect — a known misclassification,
//                       the project's name appears nowhere in its own sources
//                       or evidence (the Apex / Switch pattern), the "name"
//                       reads like a quoted phrase, or sources conflict
//
// needs_revalidation, provisional, unverified and Fair-Housing-flagged rows are
// still listed so the Publisher can see them, and its contract excludes the
// first three categories from prioritization. Nothing here is verified fact:
// the Publisher re-checks the primary source before any factual claim.
// ---------------------------------------------------------------------------

import { HANDOFF_SCHEMA_VERSION, INPUTS, validateHandoff } from "../../../publisher-inputs/contract.mjs";
import { PUBLISHER_ACTIONS } from "../config.mjs";

export const WINDOW_DAYS = 7;
const PRIMARY_AUTHORITY_MAX = 7; // authority 1–7 = primary (agency, developer, filing)

/**
 * Known misclassifications, reviewed by a human. An entry forces
 * needs_revalidation until someone confirms the attribution and removes it.
 */
export const KNOWN_MISCLASSIFICATIONS = {
  "DEV-APEX-INDUSTRIAL-PARK":
    "Switch data-center coverage (North Las Vegas / southwest Las Vegas) was attributed to Apex Industrial Park; none of the cited sources name Apex. Confirm which project the approvals and status changes belong to.",
};

const norm = (s) => String(s ?? "").toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/** Does the entity's name (or an alias) appear in any of its sources or evidence? */
export function nameInSources(event, aliases = []) {
  const names = [event.entityName, ...aliases].map(norm).filter((n) => n.length >= 3);
  if (!names.length) return false;
  const haystack = norm([event.evidence, ...(event.sources ?? []).flatMap((s) => [s.title, s.evidence])].filter(Boolean).join(" \n "));
  return names.some((n) => haystack.includes(n));
}

/** A "name" that is really a fragment of a sentence or quote. */
export function looksLikePhrase(name) {
  const n = String(name ?? "").trim();
  if (!n) return true;
  if (/[,;:!?"“”]$|^[“"]/.test(n)) return true;
  if (/^(it|its|it’s|it's|this|that|they|we|i|he|she)\b/i.test(n)) return true;
  return false;
}

export function classify(event, { aliases = [] } = {}) {
  const reasons = [];
  if (KNOWN_MISCLASSIFICATIONS[event.entityId]) reasons.push(KNOWN_MISCLASSIFICATIONS[event.entityId]);
  if (!event.provisional) {
    if (looksLikePhrase(event.entityName)) reasons.push("the project name reads like a quoted phrase, not a project");
    else if (!nameInSources(event, aliases)) reasons.push("the project name appears in none of its own sources — possible misattribution");
  }
  if ((event.conflicts ?? []).length) reasons.push("sources conflict on this project");
  return { classification: reasons.length ? "needs_revalidation" : "ok", reasons };
}

const level = (c) => (["low", "medium", "high"].includes(String(c).toLowerCase()) ? String(c).toLowerCase() : "low");

export function toItem(event, { reportDate, aliases }) {
  const sources = (event.sources ?? []).filter((s) => typeof s?.url === "string" && s.url);
  const { classification, reasons } = classify(event, { aliases });
  const fh = event.fairHousing ?? {};
  return {
    id: String(event.id),
    fingerprint: event.fingerprint ?? null,
    entityId: event.entityId ?? null,
    project: String(event.entityName ?? event.entityId ?? "unknown"),
    developer: event.developer ?? null,
    jurisdiction: event.jurisdiction ?? null,
    area: event.area ?? null,
    areaLabel: event.areaLabel ?? null,
    type: String(event.eventType ?? "unknown"),
    topics: Array.isArray(event.topics) ? event.topics : [],
    status: event.status ?? null,
    priorStatus: event.priorStatus ?? null,
    action: event.action ?? null,
    pillar: event.pillar ?? null,
    sourceUrls: [...new Set(sources.map((s) => s.url))].slice(0, 5),
    bestSourceAuthority: sources.length ? Math.min(...sources.map((s) => s.authority ?? 99)) : null,
    significance: Number.isFinite(event.score) ? event.score : 0,
    confidence: level(event.confidence),
    verified: sources.some((s) => Number.isFinite(s.authority) && s.authority <= PRIMARY_AUTHORITY_MAX),
    provisional: Boolean(event.provisional),
    classification,
    classificationReasons: reasons,
    fairHousingFlag: Boolean(fh.sensitiveSubject) || fh.framingClean === false,
    sourceValidation: sources.length ? "ok" : "failed",
    eventDate: event.date ?? null,
    firstSeen: event.firstSeen ?? null,
    reportDate,
  };
}

/**
 * @param {{today:string, fixture:boolean, reports:object[], projects?:object, generatedAt?:string}} args
 *   reports: daily Development Watch JSON reports (any order), today's included
 */
export function buildDevwatchPublisherInput({ today, fixture, reports, projects = {}, generatedAt = new Date().toISOString() }) {
  const cutoff = Date.parse(`${today}T00:00:00Z`) - WINDOW_DAYS * 86_400_000;
  const inWindow = reports
    .filter((r) => r && typeof r.date === "string" && Date.parse(`${r.date}T00:00:00Z`) >= cutoff && r.date <= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  // Newest event per project wins.
  const latest = new Map();
  for (const r of inWindow) {
    for (const e of r.events ?? []) {
      if (!PUBLISHER_ACTIONS.has(e.action)) continue;
      latest.set(e.entityId ?? e.fingerprint ?? e.id, { event: e, reportDate: r.date });
    }
  }

  const items = [...latest.values()]
    .map(({ event, reportDate }) => toItem(event, { reportDate, aliases: projects[event.entityId]?.aliases ?? [] }))
    .sort((a, b) => b.significance - a.significance);

  const doc = {
    schema_version: HANDOFF_SCHEMA_VERSION,
    agent: INPUTS.devwatch.agent,
    generatedAt,
    reportDate: today,
    fixture: Boolean(fixture),
    status: fixture ? "fixture" : items.length ? "ok" : "empty",
    window: { days: WINDOW_DAYS, reportsRead: inWindow.map((r) => r.date) },
    counts: {
      items: items.length,
      needsRevalidation: items.filter((i) => i.classification === "needs_revalidation").length,
      provisional: items.filter((i) => i.provisional).length,
      verified: items.filter((i) => i.verified).length,
    },
    publisherNote:
      "Development signals, not verified facts. Re-verify each item's primary source before publishing any factual claim or prioritizing a time-sensitive story. Detailed reports: reports/development-watch/development-watch-YYYY-MM-DD.json.",
    items,
  };

  const { valid, problems } = validateHandoff("devwatch", doc);
  if (!valid) throw new Error(`Development Watch handoff failed its own schema: ${problems.join("; ")}`);
  return doc;
}
