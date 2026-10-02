// ---------------------------------------------------------------------------
// LEDGER — the durable issue history on the lvinit-agent-state branch
//
// Report artifacts expire after 90 days and only describe one run. The ledger
// is one small JSON file, data/site-quality/ledger.json on lvinit-agent-state,
// that remembers every fingerprint this agent has raised: when it was first and
// last seen, its severity and prior severity, how it ended (resolved, or
// auto-fixed in which commit), and who owns it. It is the same shared-state
// mechanism every other LVINIT agent uses; there is no second one.
//
// Flow: the audit job reads the ledger from a read-only clone of the state
// branch (--state-dir), writes the updated copy next to its reports, and the
// workflow's publish-state job commits that copy back through the shared
// agent-state action. A missing ledger means "no history yet".
//
// The branch is public, so the ledger holds only what the public repository
// already shows: routes, files, issue types. Search Console numbers are never
// copied into it.
// ---------------------------------------------------------------------------

import { existsSync, readFileSync } from "node:fs";

export const LEDGER_SCHEMA_VERSION = 1;
export const LEDGER_AGENT = "lvinit-site-quality";
/** Where the ledger lives on the lvinit-agent-state branch. */
export const LEDGER_STATE_PATH = "data/site-quality/ledger.json";
/** The copy written beside each run's reports (uploaded with the artifact). */
export const LEDGER_FILE = "site-quality-ledger.json";

export const OPEN_STATUSES = new Set(["NEW", "PERSISTING"]);
const MAX_EVENTS = 20;
const MAX_ROUTES = 50;
/** A resolved issue is forgotten after this long, unless this agent auto-fixed it (that is kept for good). */
const RESOLVED_RETENTION_DAYS = 365;

export function emptyLedger() {
  return { schema_version: LEDGER_SCHEMA_VERSION, agent: LEDGER_AGENT, updatedAt: null, lastRun: null, previousRun: null, issues: {} };
}

/** Read a ledger, tolerantly. Anything missing, unparseable or from another agent is "no history". */
export function readLedger(path) {
  if (!path || !existsSync(path)) return null;
  let data;
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
  if (!data || data.agent !== LEDGER_AGENT || typeof data.issues !== "object" || data.issues === null) return null;
  return { ...emptyLedger(), ...data };
}

const daysBetween = (a, b) => (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000;

/**
 * The open set the CURRENT run should compare against. When the ledger was
 * already updated today (a same-day re-run), compare against the run before.
 */
export function ledgerBaseline(ledger, reportDate) {
  if (!ledger?.lastRun) return null;
  const run = ledger.lastRun.reportDate === reportDate ? ledger.previousRun : ledger.lastRun;
  return run ?? null;
}

/**
 * Fold one run's report into the ledger. Pure: returns a new ledger.
 * Fixture reports never touch it.
 */
export function updateLedger(previous, report) {
  const prev = previous ?? emptyLedger();
  if (report.fixtureData) return prev;
  const date = report.reportDate;
  const issues = Object.fromEntries(Object.entries(prev.issues ?? {}).map(([k, v]) => [k, { ...v, events: [...(v.events ?? [])] }]));
  const sameDay = prev.lastRun?.reportDate === date;

  const note = (entry, status, severity) => {
    const last = entry.events[entry.events.length - 1];
    if (last && last.date === date) entry.events.pop();
    const before = entry.events[entry.events.length - 1];
    if (!before || before.status !== status || before.severity !== severity) entry.events.push({ date, status, severity });
    if (entry.events.length > MAX_EVENTS) entry.events.splice(0, entry.events.length - MAX_EVENTS);
  };

  const seen = new Set();
  for (const f of report.findings ?? []) {
    seen.add(f.fingerprint);
    const old = issues[f.fingerprint];
    const entry = old ?? { firstSeen: f.firstSeen ?? date, timesSeen: 0, timesShownInFull: 0, reopenedCount: 0, events: [] };
    const firstTimeToday = entry.lastSeen !== date;
    if (old && !OPEN_STATUSES.has(old.status) && ["NEW", "PERSISTING"].includes(f.status) && firstTimeToday) entry.reopenedCount += 1;
    Object.assign(entry, {
      id: entry.id ?? f.id,
      fingerprint: f.fingerprint,
      type: f.type,
      area: f.area,
      title: f.title,
      priorSeverity: old && old.severity !== f.severity ? old.severity : entry.priorSeverity ?? null,
      severity: f.severity,
      status: f.status,
      disposition: f.disposition,
      owner: f.owner,
      route: f.route ?? null,
      routes: (f.routes ?? []).slice(0, MAX_ROUTES),
      routeCount: (f.routes ?? []).length,
      rootCause: f.rootCause ?? null,
      firstSeen: entry.firstSeen < (f.firstSeen ?? date) ? entry.firstSeen : f.firstSeen ?? date,
      lastSeen: date,
    });
    if (firstTimeToday) {
      entry.timesSeen += 1;
      if (f.shownInFull) entry.timesShownInFull += 1;
    }
    if (f.status === "AUTO_FIXED") {
      entry.autoFixCommit = f.autoFixCommit ?? report.execution?.commitHash ?? null;
      entry.autoFixedOn = date;
      entry.resolvedOn = date;
      entry.resolution = `auto-fixed by this agent${entry.autoFixCommit ? ` in ${entry.autoFixCommit}` : ""}`;
    } else if (OPEN_STATUSES.has(f.status) || f.status === "IGNORED") {
      entry.resolvedOn = null;
      entry.resolution = f.status === "IGNORED" ? "ignored by decision" : null;
    }
    note(entry, f.status, f.severity);
    issues[f.fingerprint] = entry;
  }

  // Anything the ledger still had open that this run did not see is resolved.
  for (const [fp, entry] of Object.entries(issues)) {
    if (seen.has(fp) || !OPEN_STATUSES.has(entry.status)) continue;
    entry.status = "RESOLVED";
    entry.disposition = null;
    entry.resolvedOn = date;
    entry.resolution = "no longer detected by the audit";
    note(entry, "RESOLVED", entry.severity);
  }

  // Forget long-resolved issues. Auto-fixed ones stay: "never re-apply a fix a
  // person undid" depends on remembering them.
  for (const [fp, entry] of Object.entries(issues)) {
    if (entry.status === "RESOLVED" && !entry.autoFixCommit && entry.resolvedOn && daysBetween(entry.resolvedOn, date) > RESOLVED_RETENTION_DAYS) delete issues[fp];
  }

  const open = (report.findings ?? []).filter((f) => OPEN_STATUSES.has(f.status)).map((f) => f.fingerprint).sort();
  const thisRun = { reportDate: date, mode: report.mode, open };
  return {
    schema_version: LEDGER_SCHEMA_VERSION,
    agent: LEDGER_AGENT,
    updatedAt: report.generatedAt ?? null,
    lastRun: thisRun,
    previousRun: sameDay ? prev.previousRun ?? null : prev.lastRun ?? null,
    issues: Object.fromEntries(Object.entries(issues).sort(([a], [b]) => a.localeCompare(b))),
  };
}
