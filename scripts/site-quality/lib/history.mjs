// ---------------------------------------------------------------------------
// HISTORY AND LIFECYCLE
//
// Two sources, merged: the durable ledger on lvinit-agent-state (ledger.mjs —
// the shared state mechanism every LVINIT agent uses), and this agent's own
// earlier JSON reports — reports/site-quality/ locally, and in CI the last
// runs' artifacts downloaded into reports/site-quality-history/run-*/. The
// reports are the fallback for a first run or a local run without the ledger.
// Fixture reports are never history.
//
// Lifecycle (`status`):
//   NEW          first time this fingerprint is open (or open again after it
//                was resolved — `reopened: true`)
//   PERSISTING   open in the newest earlier report and still open
//   AUTO_FIXED   an APPLY run fixed it, committed and pushed
//   RESOLVED     open in the newest earlier report, gone now
//   IGNORED      its fingerprint is in config.decisions.ignored
//
// Disposition (what should happen to it) is separate:
//   AUTO_FIX_CANDIDATE   every static gate passed (v1: proven in trial only)
//   REVIEW_REQUIRED      needs a person, the Publisher, or another agent
//   OBSERVE              LOW/INFO with nothing to decide
// ---------------------------------------------------------------------------

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { SEVERITY_RANK } from "./catalog.mjs";
import { ledgerBaseline } from "./ledger.mjs";

/** Earlier site-quality JSON reports, oldest first, one per date (an apply run wins). */
export function readPreviousReports(dirs, { limit = 12, excludeDate = null, allowFixture = false } = {}) {
  const byDate = new Map();
  for (const dir of dirs.filter(Boolean)) {
    if (!existsSync(dir)) continue;
    const files = [];
    const collect = (from) => {
      for (const entry of readdirSync(from, { withFileTypes: true })) {
        if (entry.isFile() && /^site-quality-\d{4}-\d{2}-\d{2}\.json$/.test(entry.name)) files.push(join(from, entry.name));
      }
    };
    collect(dir);
    for (const entry of readdirSync(dir, { withFileTypes: true })) if (entry.isDirectory()) collect(join(dir, entry.name));
    for (const file of files) {
      let report;
      try {
        report = JSON.parse(readFileSync(file, "utf8"));
      } catch {
        continue;
      }
      if (!report?.reportDate || report.agent !== "lvinit-site-quality") continue;
      if (excludeDate && report.reportDate === excludeDate) continue;
      if (report.fixtureData && !allowFixture) continue;
      const existing = byDate.get(report.reportDate);
      if (!existing || (existing.mode !== "apply" && report.mode === "apply")) byDate.set(report.reportDate, report);
    }
  }
  return [...byDate.values()].sort((a, b) => a.reportDate.localeCompare(b.reportDate)).slice(-Math.max(1, limit));
}

/**
 * Everything the lifecycle needs from earlier reports and, when there is one,
 * the durable ledger from lvinit-agent-state (see ledger.mjs). The ledger wins
 * on identity (first id, first-seen date) and on "what was open last run"
 * whenever it is at least as new as the newest report; reports fill any gap.
 */
export function buildHistory(previous, { ledger = null, reportDate = null } = {}) {
  const fromReports = historyFromReports(previous);
  if (!ledger) return { ...fromReports, ledger: false };
  const { byFingerprint, previouslyAutoFixed } = fromReports;
  for (const [fp, e] of Object.entries(ledger.issues ?? {})) {
    const r = byFingerprint.get(fp);
    const ledgerNewer = !r || (e.lastSeen ?? "") >= (r.lastSeen ?? "");
    byFingerprint.set(fp, {
      id: e.id ?? r?.id,
      firstSeen: [e.firstSeen, r?.firstSeen].filter(Boolean).sort()[0] ?? null,
      lastSeen: ledgerNewer ? e.lastSeen : r.lastSeen,
      severity: ledgerNewer ? e.severity : r.severity,
      routes: ledgerNewer ? e.routeCount ?? (e.routes ?? []).length : r.routes,
      timesShownInFull: Math.max(e.timesShownInFull ?? 0, r?.timesShownInFull ?? 0),
    });
    if (e.autoFixCommit && !previouslyAutoFixed.has(fp)) {
      previouslyAutoFixed.set(fp, { id: e.id, date: e.autoFixedOn ?? null, commit: e.autoFixCommit });
    }
  }
  const baseline = ledgerBaseline(ledger, reportDate);
  let { latestOpen, latestDate } = fromReports;
  if (baseline && (!latestDate || baseline.reportDate >= latestDate)) {
    latestDate = baseline.reportDate;
    latestOpen = new Map();
    for (const fp of baseline.open ?? []) {
      const e = ledger.issues?.[fp];
      if (!e) continue;
      latestOpen.set(fp, { id: e.id, fingerprint: fp, type: e.type, severity: e.severity, route: e.route, routes: e.routes ?? [], title: e.title, firstSeen: e.firstSeen, owner: e.owner });
    }
  }
  return { reports: previous.length, latestDate, byFingerprint, previouslyAutoFixed, latestOpen, ledger: true };
}

function historyFromReports(previous) {
  const byFingerprint = new Map();
  const previouslyAutoFixed = new Map();
  for (const report of previous) {
    for (const f of report.findings ?? []) {
      const prev = byFingerprint.get(f.fingerprint);
      byFingerprint.set(f.fingerprint, {
        id: prev?.id ?? f.id,
        firstSeen: prev?.firstSeen ?? f.firstSeen ?? report.reportDate,
        lastSeen: report.reportDate,
        severity: f.severity,
        routes: f.routes?.length ?? 0,
        timesShownInFull: (prev?.timesShownInFull ?? 0) + (f.shownInFull ? 1 : 0),
      });
      if (report.mode === "apply" && f.status === "AUTO_FIXED" && report.execution?.pushed) {
        previouslyAutoFixed.set(f.fingerprint, { id: f.id, date: report.reportDate, commit: f.autoFixCommit ?? report.execution?.commitHash ?? null });
      }
    }
  }
  const latest = previous[previous.length - 1] ?? null;
  const latestOpen = new Map(
    (latest?.findings ?? []).filter((f) => !["RESOLVED", "AUTO_FIXED", "IGNORED"].includes(f.status)).map((f) => [f.fingerprint, f])
  );
  return { reports: previous.length, latestDate: latest?.reportDate ?? null, byFingerprint, previouslyAutoFixed, latestOpen };
}

/** Assign ids, status, prior severity and the quiet flag. Mutates and returns findings. */
export function applyLifecycle(findings, { history, reportDate, config }) {
  const ignored = new Map(config.decisions.ignored.map((d) => [d.fingerprint, d]));
  let counter = 0;
  const usedToday = new Set();
  const nextId = () => {
    let id;
    do {
      counter += 1;
      id = `QA-${reportDate}-${String(counter).padStart(3, "0")}`;
    } while (usedToday.has(id));
    usedToday.add(id);
    return id;
  };
  for (const h of history.byFingerprint.values()) if (h.id?.startsWith(`QA-${reportDate}-`)) usedToday.add(h.id);

  for (const f of findings) {
    const past = history.byFingerprint.get(f.fingerprint);
    f.id = past?.id ?? nextId();
    f.firstSeen = past?.firstSeen ?? reportDate;
    f.lastSeen = reportDate;
    f.priorSeverity = past?.severity ?? null;
    f.severityChanged = Boolean(past && past.severity !== f.severity);
    if (ignored.has(f.fingerprint)) {
      f.status = "IGNORED";
      f.ignoredNote = ignored.get(f.fingerprint).note ?? null;
    } else if (history.latestOpen.has(f.fingerprint)) {
      f.status = "PERSISTING";
    } else {
      f.status = "NEW";
      f.reopened = Boolean(past);
    }
    if (history.previouslyAutoFixed.has(f.fingerprint)) {
      f.reappearedAfterAutoFix = history.previouslyAutoFixed.get(f.fingerprint);
    }
    // Quiet rule: LOW/INFO items already written up in full N times, with no
    // change in severity or reach, collapse to one line. MEDIUM+ never goes quiet.
    const material = !past || f.severityChanged || (past.routes ?? 0) !== f.routes.length;
    f.shownInFull =
      f.status !== "IGNORED" &&
      (SEVERITY_RANK[f.severity] >= SEVERITY_RANK.MEDIUM || material || (past?.timesShownInFull ?? 0) < config.output.quietAfterReports);
  }
  return findings;
}

/** Findings open last time and absent now. */
export function resolvedSince(findings, history, reportDate = null) {
  const now = new Set(findings.map((f) => f.fingerprint));
  return [...history.latestOpen.values()]
    .filter((f) => !now.has(f.fingerprint))
    .map((f) => ({
      id: f.id,
      fingerprint: f.fingerprint,
      type: f.type,
      severity: f.severity,
      route: f.route,
      routes: f.routes,
      title: f.title,
      owner: f.owner ?? null,
      firstSeen: f.firstSeen,
      status: "RESOLVED",
      resolvedOn: reportDate,
      resolution: "no longer detected by the audit",
    }));
}

export function dispositionOf(f) {
  if (f.status === "IGNORED") return "IGNORED";
  if (f.fix?.ok) return "AUTO_FIX_CANDIDATE";
  if (SEVERITY_RANK[f.severity] <= SEVERITY_RANK.LOW && !f.fix) return "OBSERVE";
  return "REVIEW_REQUIRED";
}
