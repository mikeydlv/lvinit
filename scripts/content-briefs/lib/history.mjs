// ---------------------------------------------------------------------------
// STABLE IDS, FINGERPRINTS, AND WEEK-TO-WEEK STATUS
//
// IDs (BRIEF-2026-09-24-003) are for humans and change every week. The
// FINGERPRINT is what makes an opportunity the same opportunity next week:
//
//   fingerprint = sha1( normalized intent key | action | target page or
//                       proposed slug | topic cluster ).slice(0, 12)
//
// A separate INTENT fingerprint (the intent key alone) survives an action
// change, so persistence ("seen three weeks running") is counted on the demand,
// not on how the agent happened to classify it that week.
//
// Status, per opportunity:
//
//   NEW              never seen before
//   PERSISTING       reported before, still open — shown as one line, not a
//                    fresh brief, unless it materially changed
//   HANDED_OFF       in an earlier LIVE handoff queue; waiting on the Publisher
//   PUBLISHED        a Publisher commit carries its fingerprint trailer
//   HANDOFF_STALLED  queued in `maxAttempts` live runs and never published —
//                    pulled from the queue and shown to Mikey. No endless retry.
//   REJECTED         rejected before and still rejected — counted, not re-listed
//   RESOLVED         reported last run, gone now
// ---------------------------------------------------------------------------

import { shortHash } from "./intent.mjs";
import { BRIEF_ACTIONS } from "../config.mjs";

export function briefFingerprint({ intentKey, action, target, cluster }) {
  return shortHash(`${intentKey}|${action}|${target ?? "-"}|${cluster ?? "-"}`);
}

/** Stable, human-quotable id factory: BRIEF-2026-09-24-001 */
export function makeIdFactory(reportDate, prefix = "BRIEF") {
  let n = 0;
  return () => {
    n += 1;
    return `${prefix}-${reportDate}-${String(n).padStart(3, "0")}`;
  };
}

/**
 * Index earlier reports by fingerprint and by intent fingerprint.
 */
export function buildHistory(previousReports = []) {
  const byFingerprint = new Map();
  const runsByIntent = new Map();
  for (const report of previousReports) {
    const liveQueue = report.handoff?.mode === "live";
    const queued = new Set((report.handoff?.queue ?? []).map((q) => q.fingerprint));
    for (const item of report.opportunities ?? []) {
      if (item.intentFingerprint) {
        if (!runsByIntent.has(item.intentFingerprint)) runsByIntent.set(item.intentFingerprint, new Set());
        runsByIntent.get(item.intentFingerprint).add(report.reportDate);
      }
      if (!item.fingerprint) continue;
      const rec = byFingerprint.get(item.fingerprint) ?? {
        firstSeen: report.reportDate,
        firstId: item.id,
        lastSeen: report.reportDate,
        lastId: item.id,
        lastAction: item.action,
        lastScore: item.score ?? null,
        lastConfidence: item.confidence ?? null,
        timesSeen: 0,
        liveQueueAttempts: 0,
        previousIds: [],
      };
      rec.timesSeen += 1;
      if (report.reportDate < rec.firstSeen) {
        rec.firstSeen = report.reportDate;
        rec.firstId = item.id;
      }
      if (report.reportDate >= rec.lastSeen) {
        rec.lastSeen = report.reportDate;
        rec.lastId = item.id;
        rec.lastAction = item.action;
        rec.lastScore = item.score ?? null;
        rec.lastConfidence = item.confidence ?? null;
      }
      if (liveQueue && queued.has(item.fingerprint)) rec.liveQueueAttempts += 1;
      if (!rec.previousIds.includes(item.id)) rec.previousIds.push(item.id);
      byFingerprint.set(item.fingerprint, rec);
    }
  }
  return { byFingerprint, runsByIntent, lastReport: previousReports[previousReports.length - 1] ?? null };
}

/** How many runs (this one included) an intent has appeared in. */
export function persistenceRuns(history, intentFingerprint) {
  return (history.runsByIntent.get(intentFingerprint)?.size ?? 0) + 1;
}

/**
 * Status of one current opportunity.
 */
export function statusFor({ fingerprint, action, score, confidence }, history, published, config) {
  const rec = history.byFingerprint.get(fingerprint) ?? null;
  if (published?.has(fingerprint)) return { status: "PUBLISHED", history: rec, publication: published.get(fingerprint), materialChange: false };
  if (!rec) return { status: "NEW", history: null, materialChange: true };
  if (rec.liveQueueAttempts >= config.handoff.maxAttempts) return { status: "HANDOFF_STALLED", history: rec, materialChange: false };
  if (rec.liveQueueAttempts > 0) return { status: "HANDED_OFF", history: rec, materialChange: false };
  if (!BRIEF_ACTIONS.has(action) && /^REJECT_/.test(rec.lastAction ?? "") && rec.lastAction === action) {
    return { status: "REJECTED", history: rec, materialChange: false };
  }
  const order = { low: 0, medium: 1, high: 2 };
  const materialChange =
    (Number.isFinite(rec.lastScore) && Number.isFinite(score) && score - rec.lastScore >= 10) ||
    (rec.lastConfidence && confidence && order[confidence] > order[rec.lastConfidence]);
  return { status: "PERSISTING", history: rec, materialChange: Boolean(materialChange) };
}

/** Opportunities from the last run that no longer appear. */
export function resolvedSince(history, currentFingerprints, published) {
  const last = history.lastReport;
  if (!last) return [];
  const now = new Set(currentFingerprints);
  return (last.opportunities ?? [])
    .filter((o) => o.fingerprint && !now.has(o.fingerprint) && BRIEF_ACTIONS.has(o.action))
    .map((o) => ({
      id: o.id,
      fingerprint: o.fingerprint,
      action: o.action,
      target: o.target ?? o.proposedRoute ?? null,
      leadQuery: o.leadQuery ?? null,
      reportedOn: last.reportDate,
      status: published?.has(o.fingerprint) ? "PUBLISHED" : "RESOLVED",
    }));
}
