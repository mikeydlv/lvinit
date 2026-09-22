import test from "node:test";
import assert from "node:assert/strict";

import { ACTIONS } from "../config.mjs";
import { analyze } from "../lib/analyze.mjs";
import { briefFingerprint, buildHistory, statusFor } from "../lib/history.mjs";
import { buildJsonReport, buildMarkdownReport, buildBriefFile } from "../lib/report.mjs";
import { testConfig, standardInventory, gscReport, loadedGsc, qrow, prow, noFactDecay, noInternalLinks, gitVerified, TODAY } from "./helpers.mjs";

const inventory = standardInventory();

/** A week of demand designed to produce one strong new comparison. Synthetic. */
function strongWeek() {
  return gscReport({
    queries: [
      qrow("rent first or buy when moving to las vegas", 120, 1, 22),
      qrow("should i rent or buy in las vegas", 60, 0, 25),
      qrow("renting vs buying las vegas", 40, 0, 28),
      qrow("summerlin vs henderson", 60, 6, 4),
      qrow("las vegas casino jobs", 90, 0, 40),
      qrow("best places to live in las vegas", 300, 0, 35),
      qrow("safest neighborhoods in henderson", 150, 0, 22),
      qrow("tiny query", 3, 0, 40),
    ],
    previous: [qrow("rent first or buy when moving to las vegas", 60, 0, 30)],
    pairs: [prow("rent first or buy when moving to las vegas", "/guides/new-build-vs-resale-las-vegas", 120, 1, 22), prow("summerlin vs henderson", "/guides/summerlin-vs-henderson", 60, 6, 4)],
  });
}

function run({ report = strongWeek(), previousReports = [], published = gitVerified(), overrides = {}, mode = "rows" } = {}) {
  const config = testConfig(overrides);
  const analysis = analyze({ gsc: loadedGsc(report, { mode }), inventory, factDecay: noFactDecay, internalLinks: noInternalLinks, previousReports, published, config, reportDate: TODAY });
  return { analysis, config };
}

/** Pretend the same intents were seen last week, in a report of our own shape. */
function lastWeek(analysis, date = "2026-09-15") {
  return { agent: "content-brief-generator", reportDate: date, opportunities: analysis.opportunities.map((o) => ({ ...o, id: o.id.replace(TODAY, date), brief: undefined })), handoff: { mode: "dry-run", queue: [] } };
}

// ---------------------------------------------------------------------------
// Classification and caps
// ---------------------------------------------------------------------------

test("the pipeline groups, gates, classifies, and never proposes a new page an existing one answers", () => {
  const { analysis } = run();
  const rent = analysis.opportunities.find((o) => o.cluster === "rent-vs-buy");
  assert.equal(rent.action, ACTIONS.NEW_COMPARISON);
  assert.equal(rent.queries.length, 3, "three phrasings, one intent");
  const svh = analysis.opportunities.find((o) => o.leadQuery === "summerlin vs henderson");
  assert.equal(svh.action, ACTIONS.REJECT_DUPLICATE);
  assert.equal(analysis.exclusions.length, 1);
  assert.ok(analysis.rejected.some((r) => /generic/.test(r.reason)));
  assert.ok(analysis.rejected.some((r) => /not LVINIT's job/.test(r.reason)));
  assert.equal(analysis.thin.groups, 1, "a 3-impression query is counted, not listed");
});

test("maximum report counts are enforced", () => {
  const queries = ["summerlin", "henderson", "southwest las vegas", "north las vegas", "downtown las vegas", "boulder city", "spring valley"].flatMap((p) => [qrow(`moving to ${p}`, 60, 0, 20)]);
  const { analysis } = run({ report: gscReport({ queries }), overrides: { output: { maxNewBriefs: 2, maxUpdateBriefs: 1, maxReportOnly: 1 } } });
  assert.ok(analysis.selection.newBriefs.length <= 2);
  assert.ok(analysis.selection.updateBriefs.length <= 1);
  assert.ok(analysis.selection.reportOnly.length <= 1);
});

test("MONITOR / INTERNAL_LINK_ONLY items are report-only and never briefed", () => {
  const { analysis } = run({ report: gscReport({ queries: [qrow("moving to boulder city", 12, 0, 30)] }) });
  const o = analysis.opportunities[0];
  assert.equal(o.action, ACTIONS.MONITOR_ONLY);
  assert.equal(o.brief, null);
  assert.equal(o.handoffStatus, "NOT_APPLICABLE");
});

// ---------------------------------------------------------------------------
// Handoff eligibility
// ---------------------------------------------------------------------------

test("first sight of an intent is never handed off, however strong", () => {
  const { analysis } = run();
  assert.equal(analysis.queue.queue.length, 0);
  const rent = analysis.opportunities.find((o) => o.cluster === "rent-vs-buy");
  assert.equal(rent.confidence, "high", "220 impressions is High on volume alone...");
  assert.ok(rent.handoff.blockers.includes("NOT_YET_PERSISTENT"), "...but autonomous handoff still waits a week");
});

test("a persisting, high-confidence, clean brief is eligible — and in the first build the queue is a DRY RUN", () => {
  const first = run().analysis;
  const { analysis } = run({ previousReports: [lastWeek(first)] });
  const rent = analysis.opportunities.find((o) => o.cluster === "rent-vs-buy");
  assert.equal(rent.confidence, "high");
  assert.ok(rent.score >= 70, `score ${rent.score}`);
  assert.deepEqual(rent.handoff.blockers, []);
  assert.equal(analysis.queue.mode, "dry-run");
  assert.equal(analysis.queue.queue[0].briefId, rent.id);
  assert.equal(rent.handoffStatus, "WOULD_HAND_OFF (dry run)");
});

test("queue items carry everything the Publisher needs, including the trailer instruction", () => {
  const first = run().analysis;
  const { analysis } = run({ previousReports: [lastWeek(first)] });
  const item = analysis.queue.queue[0];
  for (const key of ["briefId", "fingerprint", "action", "proposedSlug", "briefPath", "sourceGscReport", "supportingQueries"]) assert.ok(item[key] !== undefined, key);
  assert.ok(item.publisherInstructions.some((i) => i.includes(`LVINIT-Brief-Fingerprint: ${item.fingerprint}`)));
  assert.ok(item.publisherInstructions.some((i) => /independently/.test(i)));
});

test("enabling handoff makes the queue live — but fixture data never is", () => {
  const first = run().analysis;
  const live = run({ previousReports: [lastWeek(first)], overrides: { handoff: { enabled: true } } }).analysis;
  assert.equal(live.queue.mode, "live");
  const fixture = strongWeek();
  fixture.fixtureData = true;
  const fx = run({ report: fixture, previousReports: [lastWeek(first)], overrides: { handoff: { enabled: true } } }).analysis;
  assert.equal(fx.queue.mode, "dry-run");
  assert.equal(fx.queue.queue.length, 0, "GSC_NOT_VERIFIED blocks fixture briefs outright");
});

test("unverifiable Publisher status blocks handoff", () => {
  const first = run().analysis;
  const { analysis } = run({ previousReports: [lastWeek(first)], published: { available: false, reason: "no git", fingerprints: new Map() } });
  assert.equal(analysis.queue.queue.length, 0);
  assert.ok(analysis.opportunities.find((o) => o.cluster === "rent-vs-buy").handoff.blockers.includes("PUBLISHER_STATUS_UNVERIFIED"));
});

// ---------------------------------------------------------------------------
// Week-to-week identity
// ---------------------------------------------------------------------------

test("fingerprints are stable across runs and ids are not", () => {
  const a = run().analysis;
  const b = run().analysis;
  assert.deepEqual(a.opportunities.map((o) => o.fingerprint), b.opportunities.map((o) => o.fingerprint));
  assert.equal(briefFingerprint({ intentKey: "k", action: "NEW_ARTICLE", target: "x", cluster: "c" }), briefFingerprint({ intentKey: "k", action: "NEW_ARTICLE", target: "x", cluster: "c" }));
  assert.notEqual(briefFingerprint({ intentKey: "k", action: "NEW_ARTICLE", target: "x", cluster: "c" }), briefFingerprint({ intentKey: "k", action: "EXPAND_EXISTING", target: "x", cluster: "c" }));
});

test("prior-history dedupe: a brief seen last week is PERSISTING and collapses to one line", () => {
  const first = run().analysis;
  const { analysis } = run({ previousReports: [lastWeek(first)], overrides: { handoff: { minScore: 101 } } });
  const rent = analysis.opportunities.find((o) => o.cluster === "rent-vs-buy");
  assert.equal(rent.status, "PERSISTING");
  assert.equal(rent.history.firstSeen, "2026-09-15");
  assert.ok(!analysis.selection.newBriefs.includes(rent), "not re-shown as a fresh brief");
  assert.ok(analysis.selection.stillOpen.includes(rent));
});

test("a brief in a LIVE queue is HANDED_OFF, never re-queued; after the retry ceiling it is HANDOFF_STALLED", () => {
  const first = run().analysis;
  const fp = first.opportunities.find((o) => o.cluster === "rent-vs-buy").fingerprint;
  const queued = (date) => ({ ...lastWeek(first, date), handoff: { mode: "live", queue: [{ fingerprint: fp }] } });
  const once = run({ previousReports: [queued("2026-09-15")], overrides: { handoff: { enabled: true } } }).analysis;
  const rent1 = once.opportunities.find((o) => o.fingerprint === fp);
  assert.equal(rent1.status, "HANDED_OFF");
  assert.ok(!once.queue.queue.some((q) => q.fingerprint === fp));
  const twice = run({ previousReports: [queued("2026-09-08"), queued("2026-09-15")], overrides: { handoff: { enabled: true } } }).analysis;
  assert.equal(twice.opportunities.find((o) => o.fingerprint === fp).status, "HANDOFF_STALLED");
});

test("a Publisher commit trailer marks a brief PUBLISHED, and it is never handed off again", () => {
  const first = run().analysis;
  const fp = first.opportunities.find((o) => o.cluster === "rent-vs-buy").fingerprint;
  const published = gitVerified(new Map([[fp, { commit: "abc", date: "2026-09-20", briefId: "BRIEF-2026-09-15-001" }]]));
  const { analysis } = run({ previousReports: [lastWeek(first)], published });
  const rent = analysis.opportunities.find((o) => o.fingerprint === fp);
  assert.equal(rent.status, "PUBLISHED");
  assert.ok(rent.handoff.blockers.includes("ALREADY_PUBLISHED"));
});

test("REJECTED and RESOLVED statuses", () => {
  const history = buildHistory([{ reportDate: "2026-09-15", opportunities: [{ id: "B-1", fingerprint: "f1", action: "REJECT_DUPLICATE" }, { id: "B-2", fingerprint: "f2", action: "NEW_ARTICLE" }], handoff: { mode: "dry-run", queue: [] } }]);
  const cfg = testConfig();
  assert.equal(statusFor({ fingerprint: "f1", action: "REJECT_DUPLICATE" }, history, new Map(), cfg).status, "REJECTED");
  const { analysis } = run({ previousReports: [{ agent: "content-brief-generator", reportDate: "2026-09-15", opportunities: [{ id: "BRIEF-2026-09-15-009", fingerprint: "gone000000ff", action: "NEW_ARTICLE", leadQuery: "old" }], handoff: { mode: "dry-run", queue: [] } }] });
  assert.equal(analysis.resolved[0].status, "RESOLVED");
});

// ---------------------------------------------------------------------------
// Fail-safe + reports
// ---------------------------------------------------------------------------

test("no GSC report: the run still completes and says 'No high-confidence content briefs this week.'", () => {
  const config = testConfig();
  const gsc = { available: false, mode: "unavailable", reason: "no GSC report", report: null, reportDate: null };
  const analysis = analyze({ gsc, inventory, factDecay: noFactDecay, internalLinks: noInternalLinks, previousReports: [], published: gitVerified(), config, reportDate: TODAY });
  assert.equal(analysis.opportunities.length, 0);
  const md = buildMarkdownReport({ analysis, config, meta: {} });
  assert.match(md, /No high-confidence content briefs this week\./);
  assert.match(md, /No briefs: no GSC report/);
});

test("the Markdown report leads with the answer, separates RAW from CALCULATED, and lists prohibitions", () => {
  const first = run().analysis;
  const { analysis, config } = run({ previousReports: [lastWeek(first)] });
  const md = buildMarkdownReport({ analysis, config, meta: { historyCount: 1 } });
  assert.match(md, /## Bottom line\n\n\*\*1 brief would be handed to the Content Publisher\.\*\*/);
  assert.match(md, /DRY RUN — nothing is dispatched/);
  assert.match(md, /RAW Search Console/);
  assert.match(md, /CALCULATED/);
  assert.match(md, /never added together/);
  assert.match(md, /## What this agent did not do/);
  assert.match(md, /## Fair Housing exclusions/);
});

test("the JSON report is the machine contract: stable keys, no cycles, briefs referenced by path", () => {
  const { analysis, config } = run();
  const json = buildJsonReport({ analysis, config, meta: {} });
  const round = JSON.parse(JSON.stringify(json));
  assert.equal(round.agent, "content-brief-generator");
  assert.equal(round.mode, "report-only");
  assert.ok(round.opportunities.every((o) => o.fingerprint && o.intentFingerprint && o.action && "handoff" in o));
  assert.ok(round.opportunities.filter((o) => o.briefPath).every((o) => /^briefs\/BRIEF-/.test(o.briefPath)));
  assert.ok(round.demandTotals.queryDimension && round.demandTotals.gscReportTotals);
  assert.equal(round.handoff.mode, "dry-run");
});

test("a brief file carries the full audit trail", () => {
  const { analysis } = run();
  const o = analysis.opportunities.find((x) => x.brief);
  const file = buildBriefFile(o, analysis);
  for (const key of ["dateCreated", "reportDate", "sourceGscReportDate", "sourceOpportunityIds", "sourceQueries", "metrics", "classification", "score", "confidence", "duplicateCheck", "handoffStatus", "publisherExecution"]) {
    assert.ok(key in file.audit, key);
  }
  assert.match(file.publisherNote, /independently researched/);
});

test("Internal Linking signal: a GSC internal-link finding already fixed in the repo is reported as done", () => {
  const report = gscReport({ queries: [] });
  report.opportunities = [
    { id: "GSC-2026-09-21-001", type: "internal-link", query: null, landingPage: "/guides/new-build-vs-resale-las-vegas", metrics: { impressions: 97 }, evidence: { suggestedSourcePages: [{ route: "/neighborhoods/summerlin" }] } },
  ];
  const linked = standardInventory();
  linked.byRoute.get("/neighborhoods/summerlin").linksOut.push("/guides/new-build-vs-resale-las-vegas");
  const config = testConfig();
  const analysis = analyze({ gsc: loadedGsc(report), inventory: linked, factDecay: noFactDecay, internalLinks: noInternalLinks, previousReports: [], published: gitVerified(), config, reportDate: TODAY });
  assert.equal(analysis.pageSignals[0].action, ACTIONS.INTERNAL_LINK_ONLY);
  assert.equal(analysis.pageSignals[0].resolvedInRepo, true);
  assert.match(analysis.pageSignals[0].reason, /Already done/);
  assert.equal(analysis.opportunities.length, 0, "a page-level finding never becomes a brief");
});
