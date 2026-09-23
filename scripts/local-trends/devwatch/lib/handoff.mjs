// ---------------------------------------------------------------------------
// PUBLISHER HANDOFF — eligibility, the dry-run queue, and duplicate protection
//
// Development Watch never writes, publishes or dispatches anything. It builds
// a queue file showing what it WOULD hand to the Content Publisher. In v1 the
// queue is always stamped "dry-run": the workflow never sets
// DEVWATCH_HANDOFF_ENABLED, and nothing reads the file.
//
// Same shape as the Content Brief Generator's handoff, so the Publisher learns
// one pattern: take an item, research it independently, and commit with
//
//   LVINIT-DevWatch: DEV-2026-09-23-001
//   LVINIT-DevWatch-Fingerprint: 3f2a9c01d4e5
//
// which this module reads back from git log, so a fingerprint that is already
// published is never queued again.
// ---------------------------------------------------------------------------

import { execFileSync } from "node:child_process";

import { PUBLISHER_ACTIONS, NEW_CONTENT_ACTIONS } from "../config.mjs";

export const BLOCKERS = {
  NOT_A_PUBLISHER_ACTION: "the action is not a Publisher task",
  SCORE_BELOW_THRESHOLD: "relevance score below the handoff threshold",
  CONFIDENCE_NOT_HIGH: "confidence is not High",
  NO_PRIMARY_SOURCE: "no primary (authority 1–7) source supports it",
  NOT_MATERIAL: "not a new project or material change",
  SOURCE_CONFLICT: "sources conflict",
  NOT_NEW: "already reported on an earlier run",
  ALREADY_HANDED_OFF: "already handed to the Publisher",
  ALREADY_PUBLISHED: "a Publisher commit already carries this fingerprint",
  FAIR_HOUSING_SUBJECT: "the project's own framing touches a protected class — human review only",
  FAIR_HOUSING_FRAMING: "a generated line tripped the Fair Housing rules",
  PROMOTIONAL_ONLY: "only the developer's promotional channel reports it",
  PROVISIONAL_ENTITY: "the project could not be named from the sources",
  TARGET_MISSING: "the page to update does not exist",
  PUBLISHER_STATUS_UNVERIFIED: "git log could not be read, so double-processing cannot be ruled out",
};

export function handoffEligibility(ev, { config, routes, published }) {
  const h = config.handoff;
  const b = [];
  if (!PUBLISHER_ACTIONS.has(ev.action)) b.push("NOT_A_PUBLISHER_ACTION");
  if (!(ev.score >= h.minScore)) b.push("SCORE_BELOW_THRESHOLD");
  if (ev.confidence !== h.requiredConfidence) b.push("CONFIDENCE_NOT_HIGH");
  if (!ev.sources.some((s) => s.authority <= 7)) b.push("NO_PRIMARY_SOURCE");
  if (!["NEW", "MATERIAL_UPDATE"].includes(ev.changeClass)) b.push("NOT_MATERIAL");
  if (ev.conflicts.length) b.push("SOURCE_CONFLICT");
  if (ev.lifecycle !== "NEW") b.push("NOT_NEW");
  if (ev.previousLifecycle === "HANDED_OFF") b.push("ALREADY_HANDED_OFF");
  if (published.fingerprints.has(ev.fingerprint)) b.push("ALREADY_PUBLISHED");
  if (ev.fairHousing.sensitiveSubject) b.push("FAIR_HOUSING_SUBJECT");
  if (!ev.fairHousing.framingClean) b.push("FAIR_HOUSING_FRAMING");
  if (ev.promotionalOnly) b.push("PROMOTIONAL_ONLY");
  if (ev.provisional) b.push("PROVISIONAL_ENTITY");
  if (!NEW_CONTENT_ACTIONS.has(ev.action) && PUBLISHER_ACTIONS.has(ev.action) && ev.target && !routes.has(ev.target)) b.push("TARGET_MISSING");
  if (!published.available) b.push("PUBLISHER_STATUS_UNVERIFIED");
  return { eligible: b.length === 0, blockers: b, reasons: b.map((x) => BLOCKERS[x]) };
}

/** Publisher commit trailers → fingerprints already executed. */
export function readPublishedTrailers(repoRoot, config, { useGit = true } = {}) {
  if (!useGit) return { available: false, reason: "git reading switched off", fingerprints: new Map() };
  let out;
  try {
    out = execFileSync("git", ["log", "--format=%H%x1f%cs%x1f%B%x1e", `--grep=${config.handoff.trailerKey}:`], { cwd: repoRoot, encoding: "utf8", maxBuffer: 32 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return { available: false, reason: "git log could not be read", fingerprints: new Map() };
  }
  return { available: true, reason: "read Publisher commit trailers from git log", fingerprints: parseTrailers(out, config) };
}

export function parseTrailers(out, config) {
  const map = new Map();
  const re = new RegExp(`^${config.handoff.trailerKey}:\\s*([0-9a-f]{12})\\s*$`, "gim");
  for (const rec of String(out).split("\x1e")) {
    const [sha, date, body] = rec.trim().split("\x1f");
    if (!body) continue;
    for (const m of body.matchAll(re)) map.set(m[1], { sha, date });
  }
  return map;
}

/**
 * The queue file. Dry-run in v1: written exactly as a live queue would be, so
 * what WOULD be handed over is inspectable, and stamped so nothing acts on it.
 */
export function buildQueue(events, { config, today, fixture }) {
  const live = config.handoff.enabled && !fixture;
  const queue = events
    .filter((e) => e.handoff.eligible)
    .sort((a, b) => b.score - a.score)
    .slice(0, config.handoff.maxPerRun)
    .map((e, i) => ({
      order: i + 1,
      id: e.id,
      fingerprint: e.fingerprint,
      entityId: e.entityId,
      entityName: e.entityName,
      action: e.action,
      targetRoute: e.target,
      changeClass: e.changeClass,
      change: e.changes.map((c) => c.detail),
      status: { prior: e.priorStatus, current: e.status },
      score: e.score,
      confidence: e.confidence,
      primarySources: e.sources.filter((s) => s.authority <= 7).map((s) => ({ name: s.name, url: s.url, published: s.published })),
      otherSources: e.sources.filter((s) => s.authority > 7).map((s) => ({ name: s.name, url: s.url, published: s.published })),
      detected: e.detected,
      verified: e.verified,
      interpretation: e.interpretation,
      recommendation: e.recommendation,
      publisherInstructions: [
        "Development Watch is a lead, not a source. Research every fact independently against current primary sources before writing.",
        "Separate what the sources state from interpretation. Never infer 'under construction' from marketing language.",
        "Follow LVINIT's Fair Housing rules: objective facts about housing, roads, amenities, location and unit types only.",
        `When the work is committed, add these trailers:\n${config.handoff.trailerIdKey}: ${e.id}\n${config.handoff.trailerKey}: ${e.fingerprint}`,
        "Before starting, run `git log --grep` for that fingerprint; if a commit already carries it, stop.",
        "If it cannot be done safely, stop and say why. Do not retry in a loop.",
      ],
    }));
  return {
    schema_version: 1,
    agent: "development-watch",
    date: today,
    fixture: Boolean(fixture),
    mode: live ? "live" : "dry-run",
    modeReason: live ? "handoff enabled" : "Publisher handoff is disabled in v1. Nothing reads this file; it shows what WOULD be handed over.",
    trailer: { id: config.handoff.trailerIdKey, fingerprint: config.handoff.trailerKey },
    queue,
  };
}
