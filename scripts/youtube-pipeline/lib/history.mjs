// ---------------------------------------------------------------------------
// FINGERPRINTS, LIFECYCLE AND DEDUPE
//
//   fingerprint = sha1( videoId | target route or proposed route | action )[0:12]
//
// The same video recommended for the same page with the same action is the
// same piece of work, run after run. A different action or target is new work.
//
// Lifecycle, per video:
//
//   NEW                  listed, but not analyzable yet (TRANSCRIPT_REQUIRED)
//   ANALYZED             analyzed; not eligible for the Publisher (blockers named)
//   READY_FOR_PUBLISHER  eligible for the queue this run
//   HANDED_OFF           in an earlier LIVE queue; waiting on the Publisher
//   PUBLISHED            a Publisher commit carries the fingerprint trailer
//   REJECTED             MONITOR / blocked — counted, not re-proposed
//   DUPLICATE            REJECT_DUPLICATE, or the same work already published
//
// No endless reprocessing: a fingerprint that is PUBLISHED, DUPLICATE or
// REJECTED, with an unchanged transcript, is skipped on later runs (reported
// in one line), and an item queued in `maxAttempts` live runs without being
// published is pulled from the queue and shown to Mikey.
// ---------------------------------------------------------------------------

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { shortHash } from "../../content-briefs/lib/intent.mjs";

export function videoFingerprint({ youtubeId, route, action }) {
  return shortHash(`${youtubeId}|${route ?? "-"}|${action}`);
}

/** VID-2026-10-02-001 */
export function makeIdFactory(reportDate, prefix = "VID") {
  let n = 0;
  return () => {
    n += 1;
    return `${prefix}-${reportDate}-${String(n).padStart(3, "0")}`;
  };
}

/** Earlier JSON reports, oldest first. */
export function readPreviousReports({ repoRoot, config, beforeDate }) {
  const out = [];
  for (const dir of config.inputs.historyDirs) {
    const full = join(repoRoot, dir);
    if (!existsSync(full)) continue;
    for (const name of readdirSync(full)) {
      const m = /^youtube-pipeline-(\d{4}-\d{2}-\d{2})\.json$/.exec(name);
      if (!m || (beforeDate && m[1] >= beforeDate)) continue;
      try {
        const doc = JSON.parse(readFileSync(join(full, name), "utf8"));
        if (doc.agent === "youtube-pipeline" && !doc.fixtureData) out.push(doc);
      } catch {
        // An unreadable old report is skipped, never fatal.
      }
    }
  }
  return out.sort((a, b) => String(a.reportDate).localeCompare(String(b.reportDate))).slice(-config.inputs.maxHistoryReports);
}

/** Index earlier reports by fingerprint. */
export function buildHistory(previousReports = []) {
  const byFingerprint = new Map();
  for (const report of previousReports) {
    const live = report.handoff?.mode === "live";
    const queued = new Set((report.handoff?.queue ?? []).map((q) => q.fingerprint));
    for (const v of report.videos ?? []) {
      if (!v.fingerprint) continue;
      const rec = byFingerprint.get(v.fingerprint) ?? { firstSeen: report.reportDate, timesSeen: 0, liveQueueAttempts: 0, lastLifecycle: null, lastTranscriptHash: null, ids: [] };
      rec.timesSeen += 1;
      rec.lastSeen = report.reportDate;
      rec.lastLifecycle = v.lifecycle;
      rec.lastTranscriptHash = v.transcript?.hash ?? null;
      if (live && queued.has(v.fingerprint)) rec.liveQueueAttempts += 1;
      if (!rec.ids.includes(v.id)) rec.ids.push(v.id);
      byFingerprint.set(v.fingerprint, rec);
    }
  }
  return { byFingerprint };
}

/** Publisher commit trailers → fingerprints it has executed. */
export function readPublishedFingerprints({ repoRoot, config }) {
  if (!config.inputs.useGitLog) return { available: false, reason: "git log reading is switched off", fingerprints: new Map() };
  let out;
  try {
    out = execFileSync("git", ["log", "--format=%H%x1f%cs%x1f%B%x1e", `--grep=${config.handoff.trailerKey}:`], { cwd: repoRoot, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  } catch {
    return { available: false, reason: "git log could not be read, so Publisher execution status is unverified", fingerprints: new Map() };
  }
  return { available: true, reason: "read Publisher commit trailers from git log", fingerprints: parseTrailers(out, config) };
}

export function parseTrailers(logOutput, config) {
  const map = new Map();
  for (const record of String(logOutput).split("\x1e")) {
    const [sha, date, body] = record.trim().split("\x1f");
    if (!sha || !body) continue;
    for (const m of body.matchAll(new RegExp(`^${config.handoff.trailerKey}:\\s*([0-9a-f]{12})\\s*$`, "gim"))) {
      if (!map.has(m[1])) map.set(m[1], { commit: sha.trim(), date });
    }
  }
  return map;
}

/** Statuses that end a fingerprint's life unless the source material changes. */
export const TERMINAL = new Set(["PUBLISHED", "DUPLICATE", "REJECTED"]);

/**
 * Should this video be skipped as already settled? Only when its fingerprint
 * reached a terminal state AND the transcript has not changed since.
 */
export function settledSkip(fingerprint, transcriptHash, history, published) {
  if (published.fingerprints?.has(fingerprint)) return { skip: true, lifecycle: "PUBLISHED", reason: `already published (${published.fingerprints.get(fingerprint).commit.slice(0, 7)})` };
  const rec = history.byFingerprint.get(fingerprint);
  if (rec && TERMINAL.has(rec.lastLifecycle) && rec.lastTranscriptHash === (transcriptHash ?? null)) {
    return { skip: true, lifecycle: rec.lastLifecycle, reason: `${rec.lastLifecycle} on ${rec.lastSeen}; the transcript has not changed since` };
  }
  return { skip: false };
}

/**
 * Lifecycle for an analyzed video.
 */
export function lifecycleFor({ fingerprint, action, eligible, blockedFairHousing, transcriptRequired }, history, published, config) {
  if (published.fingerprints?.has(fingerprint)) return "PUBLISHED";
  if (action === "REJECT_DUPLICATE") return "DUPLICATE";
  if (action === "MONITOR_ONLY" || blockedFairHousing) return "REJECTED";
  const rec = history.byFingerprint.get(fingerprint);
  if (rec && rec.liveQueueAttempts > 0 && rec.liveQueueAttempts < config.handoff.maxAttempts) return "HANDED_OFF";
  if (transcriptRequired) return "NEW";
  if (eligible) return "READY_FOR_PUBLISHER";
  return "ANALYZED";
}
