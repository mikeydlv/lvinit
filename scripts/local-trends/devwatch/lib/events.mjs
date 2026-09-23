// ---------------------------------------------------------------------------
// EVENTS — one tracked change per project, however many outlets carried it
//
// For each project with gate-passing items this run:
//
//   observe()        fold every item into ONE observation: the status the
//                    sources prove (with the sentence that proves it), the
//                    unit count, the target date, and any disagreement
//   detectChanges()  compare it with what is already known — the project's
//                    tracked record, else the status LVINIT itself publishes
//                    (its roster or dedicated article), else nothing
//   fingerprint()    a stable id for the project's STATE, so tomorrow's
//                    retelling of the same facts lands on the same event
//
// This is what makes Development Watch a change watcher and not a feed:
//
//   week 1   Monument Hills announced         → NEW
//   week 2   same facts, another outlet        → DUPLICATE (same fingerprint)
//   week 6   planning approval                 → MATERIAL_UPDATE (new state)
//   week 20  construction begins               → MATERIAL_UPDATE (new state)
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";

import { STATUS, statusRank, isSideState, isStatusChange, detectStatus } from "./status.mjs";
import { extractFacts } from "./detect.mjs";

export const CHANGE = {
  NEW_PROJECT: "NEW_PROJECT",
  STATUS_CHANGED: "STATUS_CHANGED",
  SCALE_CHANGED: "SCALE_CHANGED",
  TIMELINE_CHANGED: "TIMELINE_CHANGED",
  CONFLICT: "CONFLICT",
  NO_CHANGE: "NO_CHANGE",
};

/** The brief's vocabulary for the kind of change an event is. */
export function changeClass(changes) {
  const kinds = changes.map((c) => c.kind);
  if (kinds.includes(CHANGE.CONFLICT)) return "CONFLICT";
  if (kinds.includes(CHANGE.NEW_PROJECT)) return "NEW";
  if (kinds.some((k) => [CHANGE.STATUS_CHANGED, CHANGE.SCALE_CHANGED, CHANGE.TIMELINE_CHANGED].includes(k))) return "MATERIAL_UPDATE";
  return "DUPLICATE";
}

const SCALE_CHANGE_LANGUAGE = /\b(increas\w*|reduc\w*|scal(ed|es|ing) (back|down|up)|expand\w*|shrunk|shrink\w*|cut|trimm\w*|downsiz\w*|now (plans?|calls? for|includes?)|up from|down from|from [\d,]+ to [\d,]+|revised|amended)\b/i;

function targetKind(targetText, sentence) {
  const s = `${targetText ?? ""} ${sentence ?? ""}`.toLowerCase();
  if (/\b(complet|finish|done|wrap|built out)\w*/.test(s)) return "completion";
  return "opening";
}

/** Status, evidence and facts for one item, read from its own text only. */
export function readItem(item, entity) {
  const residentialCommunity = (entity?.type === "residential" || item.topics?.includes("residential")) && !/\b(apartment|tower|condo|complex)\w*/i.test(item.title);
  const bodyText = `${item.snippet ?? ""} ${item.excerpt ?? ""}`;
  const full = detectStatus(`${item.title}. ${bodyText}`, { residentialCommunity });
  const body = detectStatus(bodyText, { residentialCommunity });
  const facts = extractFacts(`${item.title}. ${bodyText}`);
  // Article text beats a headline saying the same thing: it is what a
  // reader can check, and headlines compress.
  const useBody = body.evidence && body.status === full.status;
  const evidence = useBody ? body.evidence : full.evidence;
  const bare = (s) => String(s ?? "").replace(/[.!?\s]+$/, "").trim();
  const inHeadline = evidence && (bare(item.title).includes(bare(evidence)) || bare(evidence).includes(bare(item.title)));
  const evidenceIn = !evidence ? null : useBody && !inHeadline ? "body" : inHeadline ? "headline" : "body";
  return {
    status: full.status,
    evidence,
    evidenceIn,
    facts: { ...facts, targetKind: facts.targetYear ? targetKind(facts.targetText, full.evidence) : null },
  };
}

function publisherKey(it) {
  return String(it.sourceName ?? it.sourceDomain ?? it.via ?? "").toLowerCase().replace(/\s+—.*$/, "").trim();
}

/**
 * Fold one project's items into a single observation.
 * @param reads Map itemId → readItem() result
 */
export function observe(entity, items, reads, config) {
  const rows = items.map((it) => ({ it, r: reads.get(it.id) }));
  const withStatus = rows.filter((x) => x.r.status !== STATUS.UNCLEAR && x.r.evidence);
  const conflicts = [];

  // Status: a side state (delayed/paused/cancelled/denied) is news in itself.
  const side = withStatus.filter((x) => isSideState(x.r.status));
  const ladder = withStatus.filter((x) => !isSideState(x.r.status));
  const byStrength = (a, b) => a.it.authority - b.it.authority || (a.r.evidenceIn === "body" ? -1 : 1) || String(b.it.published).localeCompare(String(a.it.published));
  let status = STATUS.UNCLEAR;
  let support = [];
  if (side.length) {
    const lead = [...side].sort(byStrength)[0];
    status = lead.r.status;
    support = side.filter((x) => x.r.status === status);
    const contrary = ladder.filter((x) => statusRank(x.r.status) >= statusRank(STATUS.UNDER_CONSTRUCTION) && publisherKey(x.it) !== publisherKey(lead.it));
    if (contrary.length) {
      conflicts.push({
        kind: "status",
        detail: `${lead.it.sourceName} says ${status}; ${contrary[0].it.sourceName} says ${contrary[0].r.status}`,
        sides: [
          { status, source: lead.it.sourceName, url: lead.it.url, evidence: lead.r.evidence },
          { status: contrary[0].r.status, source: contrary[0].it.sourceName, url: contrary[0].it.url, evidence: contrary[0].r.evidence },
        ],
      });
    }
  } else if (ladder.length) {
    const top = Math.max(...ladder.map((x) => statusRank(x.r.status)));
    support = ladder.filter((x) => statusRank(x.r.status) === top);
    status = [...support].sort(byStrength)[0].r.status;
    support = support.filter((x) => x.r.status === status);
  }
  support.sort(byStrength);
  const lead = support[0] ?? null;

  // Units: only unambiguous counts are compared.
  const unitRows = rows.filter((x) => x.r.facts.units && !x.r.facts.unitsAmbiguous).sort(byStrength);
  let units = unitRows[0]?.r.facts.units ?? null;
  const tol = config.facts.unitsTolerance;
  const rivals = unitRows.filter((x) => Math.abs(x.r.facts.units - units) / Math.max(x.r.facts.units, units) > tol && publisherKey(x.it) !== publisherKey(unitRows[0].it));
  if (units && rivals.length) {
    conflicts.push({
      kind: "scale",
      detail: `${unitRows[0].it.sourceName} says ${units.toLocaleString("en-US")} units; ${rivals[0].it.sourceName} says ${rivals[0].r.facts.units.toLocaleString("en-US")}`,
      sides: [
        { units, source: unitRows[0].it.sourceName, url: unitRows[0].it.url },
        { units: rivals[0].r.facts.units, source: rivals[0].it.sourceName, url: rivals[0].it.url },
      ],
    });
  }

  const targetRow = rows.filter((x) => x.r.facts.targetYear).sort(byStrength)[0] ?? null;
  const acresRow = rows.filter((x) => x.r.facts.acres).sort(byStrength)[0] ?? null;
  const dollarsRow = rows.filter((x) => x.r.facts.dollars).sort(byStrength)[0] ?? null;

  return {
    status,
    evidence: lead?.r.evidence ?? null,
    evidenceIn: lead?.r.evidenceIn ?? null,
    evidenceItemId: lead?.it.id ?? null,
    evidenceAuthority: lead?.it.authority ?? null,
    supportingItemIds: support.map((x) => x.it.id),
    units,
    unitsItemId: unitRows[0]?.it.id ?? null,
    acres: acresRow?.r.facts.acres ?? null,
    dollars: dollarsRow?.r.facts.dollars ?? null,
    targetYear: targetRow?.r.facts.targetYear ?? null,
    targetText: targetRow?.r.facts.targetText ?? null,
    targetKind: targetRow?.r.facts.targetKind ?? null,
    targetItemId: targetRow?.it.id ?? null,
    conflicts,
    publishers: [...new Set(items.map(publisherKey))],
  };
}

/**
 * What changed, against (in order) the tracked record, LVINIT's published
 * baseline, or nothing at all.
 */
export function detectChanges(entity, record, obs, { itemsById, config }) {
  const changes = [];
  const prior = record
    ? { status: record.status, units: record.units, targetYear: record.target_year, targetKind: record.target_kind, from: "tracked record" }
    : entity.baseline
      ? { status: entity.baseline.status, units: entity.baseline.units ?? null, targetYear: entity.baseline.targetYear ?? null, targetKind: entity.baseline.targetKind ?? null, from: `LVINIT ${entity.baseline.origin} (${entity.baseline.from})` }
      : null;

  if (!prior) {
    changes.push({ kind: CHANGE.NEW_PROJECT, detail: "first time this project has been seen" });
  } else {
    if (isStatusChange(prior.status, obs.status)) {
      changes.push({ kind: CHANGE.STATUS_CHANGED, from: prior.status ?? STATUS.UNCLEAR, to: obs.status, detail: `${prior.status ?? "unclear"} → ${obs.status}` });
    }
    const tol = config.facts.unitsTolerance;
    if (obs.units && prior.units && Math.abs(obs.units - prior.units) / Math.max(obs.units, prior.units) > tol) {
      const src = itemsById.get(obs.unitsItemId);
      const text = `${src?.title ?? ""} ${src?.snippet ?? ""} ${src?.excerpt ?? ""}`;
      if (SCALE_CHANGE_LANGUAGE.test(text) || (src && src.authority <= 7)) {
        changes.push({ kind: CHANGE.SCALE_CHANGED, from: prior.units, to: obs.units, detail: `${prior.units.toLocaleString("en-US")} → ${obs.units.toLocaleString("en-US")} units` });
      } else {
        obs.conflicts.push({ kind: "scale", detail: `${src?.sourceName ?? "a source"} gives ${obs.units.toLocaleString("en-US")} units; ${prior.from} has ${prior.units.toLocaleString("en-US")}`, sides: [{ units: obs.units, source: src?.sourceName, url: src?.url }, { units: prior.units, source: prior.from, url: null }] });
      }
    }
    if (obs.targetYear && prior.targetYear && obs.targetYear !== prior.targetYear && (obs.targetKind ?? "opening") === (prior.targetKind ?? "opening")) {
      changes.push({ kind: CHANGE.TIMELINE_CHANGED, from: prior.targetYear, to: obs.targetYear, detail: `${obs.targetKind ?? "opening"} ${prior.targetYear} → ${obs.targetYear}${obs.targetYear > prior.targetYear ? " (later)" : " (earlier)"}` });
    }
  }
  if (obs.conflicts.length) changes.push({ kind: CHANGE.CONFLICT, detail: obs.conflicts.map((c) => c.detail).join("; ") });
  if (!changes.length) changes.push({ kind: CHANGE.NO_CHANGE, detail: prior ? `same as ${prior.from}` : "nothing new" });
  return { changes, prior };
}

/** What happened, in one word, for the report and the fingerprint. */
export function eventType(changes, obs, topics = []) {
  const kinds = changes.map((c) => c.kind);
  if (obs.status === STATUS.CANCELLED) return "cancellation";
  if (obs.status === STATUS.DENIED) return "denial";
  if (obs.status === STATUS.PAUSED) return "pause";
  if (obs.status === STATUS.DELAYED || changes.some((c) => c.kind === CHANGE.TIMELINE_CHANGED && c.to > c.from)) return "delay";
  if (kinds.includes(CHANGE.SCALE_CHANGED)) return "scale change";
  if (kinds.includes(CHANGE.TIMELINE_CHANGED)) return "timeline change";
  if (obs.status === STATUS.OPEN) return "opening";
  if (obs.status === STATUS.PARTIALLY_OPEN) return "partial opening";
  if (obs.status === STATUS.UNDER_CONSTRUCTION) return "construction";
  if (obs.status === STATUS.PRE_CONSTRUCTION) return "pre-construction";
  if ([STATUS.APPROVED, STATUS.ENTITLED].includes(obs.status)) return "approval";
  if (obs.status === STATUS.UNDER_REVIEW) return "hearing";
  if (obs.status === STATUS.FILED) return "filing";
  if (topics.includes("land") && obs.acres) return "land deal";
  if (topics.includes("road")) return "access change";
  return "announcement";
}

/**
 * Stable per STATE of a project, not per article: the same facts retold
 * tomorrow produce the same fingerprint; a new status, unit count or target
 * year produces a new one.
 */
export function fingerprint(entityId, obs) {
  const units = obs.units ? Math.round(obs.units / 10) * 10 : "-";
  return createHash("sha1").update(`${entityId}|${obs.status}|u:${units}|t:${obs.targetYear ?? "-"}`).digest("hex").slice(0, 12);
}
