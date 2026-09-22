// ---------------------------------------------------------------------------
// INPUTS — every one read off disk, READ-ONLY
//
//   GSC Opportunity Agent report   REQUIRED for a brief to exist. Validated:
//                                  missing, unreadable, malformed, fixture (in a
//                                  real run), or stale -> the run degrades to
//                                  "no briefs this week", never to guessing.
//   Fact-Decay report              optional. Per-page factual-freshness notes.
//   Internal Linking report        optional. Orphans, weak pages, pending
//                                  bridge-sentence handoffs.
//   Earlier Brief Generator runs   optional. Week-to-week identity.
//   git log                        optional. Publisher commit trailers ->
//                                  PUBLISHED.
//
// None of these files is ever written to, re-scored, or second-guessed here.
// Report discovery reuses the Internal Linking Agent's `findLatestReport`, so
// the "newest report date, one directory deep" rule is the same everywhere.
// ---------------------------------------------------------------------------

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { execFileSync } from "node:child_process";

import { findLatestReport } from "../../internal-links/lib/signals.mjs";
import { daysBetween } from "../../internal-links/lib/graph.mjs";
import { PAGE_LEVEL_TYPES } from "../../gsc/lib/report.mjs";

// ---------------------------------------------------------------------------
// GSC
// ---------------------------------------------------------------------------

/**
 * Validate a parsed GSC report. Returns the problems, or [] when usable.
 * Exported so the rules can be tested without files.
 */
export function validateGscReport(report, { allowFixture = false } = {}) {
  const problems = [];
  if (!report || typeof report !== "object") return ["the file is not a JSON object"];
  if (typeof report.schemaVersion !== "string") problems.push("no schemaVersion");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(report.reportDate ?? ""))) problems.push("no valid reportDate");
  if (!report.windows?.current?.start || !report.windows?.current?.end) problems.push("no current window");
  if (!report.totals || !Number.isFinite(Number(report.totals.currentImpressions))) problems.push("no totals");
  if (!Array.isArray(report.opportunities)) problems.push("no opportunities array");
  if (report.fixtureData && !allowFixture) problems.push("it is FIXTURE data, and this is a real run");
  if (report.searchDemand) {
    const cur = report.searchDemand.current;
    if (!cur || !Array.isArray(cur.queries?.rows) || !Array.isArray(cur.pairs?.rows) || !Array.isArray(cur.pages?.rows)) {
      problems.push("searchDemand is present but malformed");
    }
  }
  return problems;
}

/**
 * Load the newest GSC report and decide what it can support.
 *
 * mode:
 *   "rows"           schema 1.1.0+ with raw query rows — full intent grouping
 *   "findings-only"  an older report with findings but no raw rows — only
 *                    query-level findings can be grouped
 *   "unavailable"    nothing usable; the run produces no briefs
 */
export function loadGsc({ repoRoot, config, today, allowFixture = false, reportOverride = null }) {
  const unavailable = (reason, extra = {}) => ({ available: false, mode: "unavailable", reason, report: null, reportPath: null, reportDate: null, ageDays: null, ...extra });

  let report = reportOverride;
  let path = reportOverride ? "(in-memory fixture)" : null;
  let reportDate = reportOverride?.reportDate ?? null;

  if (!report) {
    const latest = findLatestReport(join(repoRoot, config.inputs.gscDir), "gsc-opportunities");
    if (!latest) {
      return unavailable("no GSC Opportunity Agent report was found on disk. Search demand is the one input a brief cannot exist without, so no briefs were generated");
    }
    path = relative(repoRoot, latest.path).split(sep).join("/");
    reportDate = latest.reportDate;
    try {
      report = JSON.parse(readFileSync(latest.path, "utf8"));
    } catch (err) {
      return unavailable(`the newest GSC report could not be read (${err.message}), so no briefs were generated`, { reportPath: path, reportDate });
    }
  }

  const problems = validateGscReport(report, { allowFixture });
  if (problems.length) {
    return unavailable(`the newest GSC report is not usable: ${problems.join("; ")}. No briefs were generated`, { reportPath: path, reportDate });
  }

  const ageDays = daysBetween(report.reportDate, today);
  if (ageDays !== null && ageDays > config.inputs.gscMaxAgeDays) {
    return unavailable(
      `the newest GSC report is ${ageDays} days old, past the ${config.inputs.gscMaxAgeDays}-day limit. Briefing on stale search demand is worse than not briefing, so none were generated`,
      { reportPath: path, reportDate: report.reportDate, ageDays }
    );
  }

  const hasRows = Boolean(report.searchDemand?.current?.queries?.rows);
  return {
    available: true,
    mode: hasRows ? "rows" : "findings-only",
    reason: hasRows
      ? `read raw query rows from ${path} (${report.reportDate}, ${ageDays} days old)`
      : `${path} (${report.reportDate}, schema ${report.schemaVersion}) predates the raw-row export, so only its query-level findings could be grouped. The next GSC run (schema 1.1.0+) will carry every query`,
    report,
    reportPath: path,
    reportDate: report.reportDate,
    ageDays,
    fixtureData: Boolean(report.fixtureData),
    lowVolume: Boolean(report.dataQuality?.lowVolume),
  };
}

/**
 * The query-level rows this run can use, in the raw-row shape, plus the page
 * rows kept SEPARATE (page and query aggregation are different things).
 */
export function demandRows(gsc) {
  if (!gsc.available) return { current: [], previous: [], pairs: [], pages: [], previousPages: [], basis: "none" };
  const r = gsc.report;
  if (gsc.mode === "rows") {
    return {
      current: r.searchDemand.current.queries.rows,
      previous: r.searchDemand.previous?.queries?.rows ?? [],
      pairs: r.searchDemand.current.pairs.rows,
      pages: r.searchDemand.current.pages.rows,
      previousPages: r.searchDemand.previous?.pages?.rows ?? [],
      basis: "raw query, page and query+page rows",
    };
  }
  // Findings-only: each query-level finding carries one query's raw metrics.
  // Several findings can share a query; keep one row per query.
  const byQuery = new Map();
  const pairs = [];
  for (const opp of r.opportunities ?? []) {
    if (!opp.query || PAGE_LEVEL_TYPES.has(opp.type)) continue;
    const m = opp.metrics ?? {};
    if (!byQuery.has(opp.query)) {
      byQuery.set(opp.query, { query: opp.query, clicks: m.clicks ?? 0, impressions: m.impressions ?? 0, ctr: m.ctr ?? 0, position: m.position ?? 0 });
    }
    if (opp.landingPage) pairs.push({ query: opp.query, route: opp.landingPage, clicks: m.clicks ?? 0, impressions: m.impressions ?? 0, ctr: m.ctr ?? 0, position: m.position ?? 0 });
  }
  const previous = [...byQuery.values()]
    .map((row) => {
      const opp = r.opportunities.find((o) => o.query === row.query && o.metrics?.hasPreviousPeriod);
      return opp ? { query: row.query, clicks: opp.metrics.previousClicks ?? 0, impressions: opp.metrics.previousImpressions ?? 0, ctr: opp.metrics.previousCtr ?? 0, position: opp.metrics.previousPosition ?? 0 } : null;
    })
    .filter(Boolean);
  return { current: [...byQuery.values()], previous, pairs, pages: [], previousPages: [], basis: "query-level GSC findings only (no raw rows in this report)" };
}

/** GSC findings indexed by query and by page, for evidence attachment. */
export function gscFindingsIndex(gsc) {
  const byQuery = new Map();
  const byPage = new Map();
  if (!gsc.available) return { byQuery, byPage, pageLevel: [] };
  const pageLevel = [];
  for (const opp of gsc.report.opportunities ?? []) {
    const slim = {
      id: opp.id,
      type: opp.type,
      query: opp.query ?? null,
      landingPage: opp.landingPage ?? null,
      score: opp.score,
      confidence: opp.confidence?.level ?? null,
      recommendationKind: opp.recommendationKind ?? null,
      metrics: opp.metrics ?? null,
      suggestedSourcePages: opp.evidence?.suggestedSourcePages ?? null,
      competingUrls: opp.evidence?.competingUrls ?? null,
    };
    if (opp.query && !PAGE_LEVEL_TYPES.has(opp.type)) {
      if (!byQuery.has(opp.query)) byQuery.set(opp.query, []);
      byQuery.get(opp.query).push(slim);
    } else {
      pageLevel.push(slim);
    }
    if (opp.landingPage) {
      if (!byPage.has(opp.landingPage)) byPage.set(opp.landingPage, []);
      byPage.get(opp.landingPage).push(slim);
    }
  }
  return { byQuery, byPage, pageLevel };
}

// ---------------------------------------------------------------------------
// Fact-Decay
// ---------------------------------------------------------------------------

export function loadFactDecay({ repoRoot, config, today, allowFixture = false }) {
  const neutral = (reason, extra = {}) => ({ available: false, reason, reportDate: null, byRoute: new Map(), ...extra });
  const latest = findLatestReport(join(repoRoot, config.inputs.factDecayDir), "fact-decay");
  if (!latest) return neutral("no Fact-Decay report was found on disk, so briefs carry no factual-freshness notes");
  let report;
  try {
    report = JSON.parse(readFileSync(latest.path, "utf8"));
  } catch (err) {
    return neutral(`the newest Fact-Decay report could not be read (${err.message})`);
  }
  if (!Array.isArray(report?.findings)) return neutral("the newest Fact-Decay report has no findings array, so it was ignored");
  if (report.fixtureData && !allowFixture) return neutral("the newest Fact-Decay report is FIXTURE data, so it was ignored in a real run");
  const ageDays = daysBetween(latest.reportDate, today);
  if (ageDays !== null && ageDays > config.inputs.factDecayMaxAgeDays) {
    return neutral(`the newest Fact-Decay report is ${ageDays} days old, past the ${config.inputs.factDecayMaxAgeDays}-day limit, so it was ignored`, { reportDate: latest.reportDate });
  }
  const byRoute = new Map();
  for (const f of report.findings) {
    if (!f.route) continue;
    if (!byRoute.has(f.route)) byRoute.set(f.route, []);
    byRoute.get(f.route).push({
      id: f.id,
      priority: Number(f.priority) || 0,
      riskLevel: f.risk?.level ?? "unknown",
      verification: f.verification?.result ?? "not-attempted",
      urgency: f.urgency ?? null,
      action: f.recommendedAction?.action ?? f.recommendedAction ?? null,
      claim: f.claim ?? null,
    });
  }
  for (const list of byRoute.values()) list.sort((a, b) => b.priority - a.priority);
  return { available: true, reason: `read from ${relative(repoRoot, latest.path).split(sep).join("/")} (${latest.reportDate}, ${ageDays} days old)`, reportDate: latest.reportDate, ageDays, byRoute };
}

/**
 * The Fact-Decay findings a brief targeting this route should mention. "High
 * priority" means Fact-Decay's own act-now line, or a high-risk claim its
 * source contradicts (the Internal Linking Agent's two conditions), or a
 * high-risk claim at or above the configured note line.
 * Never a reason to suppress a brief.
 */
export function factDecayNotesFor(factDecay, route, config) {
  const findings = factDecay.byRoute?.get(route) ?? [];
  const important = findings.filter(
    (f) =>
      f.priority >= config.inputs.factDecayUrgentPriority ||
      (f.riskLevel === "high" && f.verification === "contradicts") ||
      (f.riskLevel === "high" && f.priority >= config.inputs.factDecayNotePriority)
  );
  return {
    openFindings: findings.length,
    highPriority: important.slice(0, 5),
    instruction: important.length
      ? "Resolve these factual-freshness findings during the same update where it is safe to do so — re-verify each against its current primary source. Do not carry a stale figure forward into new copy."
      : findings.length
        ? "Open Fact-Decay findings on this page are routine (below the high-priority line). Re-check any figure you touch."
        : null,
  };
}

// ---------------------------------------------------------------------------
// Internal Linking
// ---------------------------------------------------------------------------

export function loadInternalLinks({ repoRoot, config, today, allowFixture = false }) {
  const neutral = (reason) => ({ available: false, reason, reportDate: null, orphans: [], weaklyLinked: [], newPagesNeedingSupport: [], bridgeHandoffs: [], needsReview: [] });
  const latest = findLatestReport(join(repoRoot, config.inputs.internalLinksDir), "internal-links");
  if (!latest) return neutral("no Internal Linking report was found on disk, so orphan and weak-cluster context was not used");
  let report;
  try {
    report = JSON.parse(readFileSync(latest.path, "utf8"));
  } catch (err) {
    return neutral(`the newest Internal Linking report could not be read (${err.message})`);
  }
  if (!report?.graph) return neutral("the newest Internal Linking report has no graph section, so it was ignored");
  if (report.fixtureData && !allowFixture) return neutral("the newest Internal Linking report is FIXTURE data, so it was ignored in a real run");
  const ageDays = daysBetween(latest.reportDate, today);
  if (ageDays !== null && ageDays > config.inputs.internalLinksMaxAgeDays) {
    return neutral(`the newest Internal Linking report is ${ageDays} days old, past the ${config.inputs.internalLinksMaxAgeDays}-day limit, so it was ignored`);
  }
  const slimPage = (p) => ({ route: p.route, title: p.title, referrers: p.uniqueReferrers?.length ?? p.incomingEditorialCount ?? 0 });
  return {
    available: true,
    reason: `read from ${relative(repoRoot, latest.path).split(sep).join("/")} (${latest.reportDate}, ${ageDays} days old)`,
    reportDate: latest.reportDate,
    ageDays,
    orphans: (report.graph.orphans ?? []).map(slimPage),
    weaklyLinked: (report.graph.weaklyLinked ?? []).map(slimPage),
    newPagesNeedingSupport: (report.graph.newlyPublishedNeedingDiscovery ?? []).map(slimPage),
    bridgeHandoffs: (report.bridgeSentenceHandoffs ?? []).map((h) => ({ id: h.id, from: h.from, to: h.to })),
    needsReview: (report.needsReview ?? []).map((n) => ({ id: n.id, from: n.from, to: n.to, reason: n.reviewReason ?? n.reason ?? null })),
    topicsByRoute: new Map((report.graph.nodes ?? []).map((n) => [n.route, n.topics ?? []])),
  };
}

/** Topics (Internal Linking vocabulary) whose pages are orphaned or weakly linked. */
export function weakTopics(internalLinks) {
  if (!internalLinks.available) return new Set();
  const weak = new Set();
  for (const p of [...internalLinks.orphans, ...internalLinks.weaklyLinked]) {
    for (const t of internalLinks.topicsByRoute?.get(p.route) ?? []) weak.add(t);
  }
  return weak;
}

// ---------------------------------------------------------------------------
// History — earlier Brief Generator runs
// ---------------------------------------------------------------------------

/** Every earlier content-opportunities-*.json, oldest first, one per date. */
export function readPreviousReports({ repoRoot, config, beforeDate }) {
  const found = new Map();
  const pattern = /^content-opportunities-(\d{4}-\d{2}-\d{2})\.json$/;
  const scan = (dir, depth) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory() && depth > 0) scan(full, depth - 1);
      else if (entry.isFile()) {
        const m = pattern.exec(entry.name);
        if (!m || m[1] >= beforeDate) continue;
        try {
          const report = JSON.parse(readFileSync(full, "utf8"));
          if (report?.agent === "content-brief-generator" && !report.fixtureData) found.set(m[1], report);
        } catch {
          // An unreadable old report is skipped; history is best-effort.
        }
      }
    }
  };
  for (const dir of config.inputs.historyDirs) scan(join(repoRoot, dir), 2);
  return [...found.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-config.inputs.maxHistoryReports)
    .map(([, r]) => r);
}

/**
 * Publisher commit trailers. The Publisher adds
 *   LVINIT-Brief: BRIEF-2026-09-24-003
 *   LVINIT-Brief-Fingerprint: 3f2a9c01d4e5
 * to the commit that executes a brief. That trailer is the durable, append-only
 * record that a brief was PUBLISHED — no queue file has to be written back.
 */
export function readPublishedFingerprints({ repoRoot, config }) {
  if (!config.inputs.useGitLog) return { available: false, reason: "git log reading is switched off", fingerprints: new Map() };
  let out;
  try {
    out = execFileSync("git", ["log", "--format=%H%x1f%cs%x1f%B%x1e", `--grep=${config.handoff.trailerKey}:`], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 30000,
      maxBuffer: 16 * 1024 * 1024,
    });
  } catch {
    return { available: false, reason: "git log could not be read, so Publisher execution status is unverified", fingerprints: new Map() };
  }
  return { available: true, reason: "read Publisher commit trailers from git log", fingerprints: parseTrailers(out, config) };
}

/** Parse `git log` output (records separated by \x1e) for brief trailers. */
export function parseTrailers(logOutput, config) {
  const fingerprints = new Map();
  const fpRe = new RegExp(`^${config.handoff.trailerKey}:\\s*([0-9a-f]{12})\\s*$`, "gim");
  const idRe = new RegExp(`^${config.handoff.trailerIdKey}:\\s*(BRIEF-\\d{4}-\\d{2}-\\d{2}-\\d{3})\\s*$`, "im");
  for (const record of String(logOutput).split("\x1e")) {
    const [hash, date, body] = record.trim().split("\x1f");
    if (!hash || !body) continue;
    const id = idRe.exec(body)?.[1] ?? null;
    let m;
    fpRe.lastIndex = 0;
    while ((m = fpRe.exec(body)) !== null) {
      if (!fingerprints.has(m[1])) fingerprints.set(m[1], { commit: hash.slice(0, 12), date, briefId: id });
    }
  }
  return fingerprints;
}
