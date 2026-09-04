import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { analyze, complianceScan, assessYearLabelledPages, RECOMMENDED_ACTIONS } from "../lib/analyze.mjs";
import { buildMarkdownReport, buildJsonReport, selectHighlights, PROHIBITED_ACTIONS } from "../lib/report.mjs";
import { loadGscSignal, findLatestGscReport } from "../lib/gsc-signal.mjs";
import { buildContentInventory, readEditorialRegistry, resolveLastReviewed } from "../lib/content-inventory.mjs";
import { run, parseArgs, overridesFromArgs, readPreviousReports } from "../run.mjs";
import {
  testConfig,
  testInventory,
  testVerifier,
  offlineVerifier,
  neutralGscSignal,
  TEST_TODAY,
  REPO_ROOT,
} from "./helpers.mjs";

const config = testConfig();

async function analyzeFixtures({ cfg = config, verifier = offlineVerifier(cfg), gscSignal = neutralGscSignal, previousReports = [] } = {}) {
  return analyze({
    inventory: testInventory(cfg),
    config: cfg,
    reportDate: TEST_TODAY,
    gscSignal,
    verifier,
    previousReports,
  });
}

// ---------------------------------------------------------------------------
// End to end, detection only
// ---------------------------------------------------------------------------

test("a detection-only run produces findings without touching the network", async () => {
  const analysis = await analyzeFixtures();
  assert.ok(analysis.findings.length > 0);
  assert.ok(analysis.totals.claimsReviewed > analysis.totals.claimsDetected, "far more is read than is flagged");
  for (const f of analysis.findings) {
    assert.equal(f.verification.result, "not-attempted");
  }
});

test("every finding carries the full record the brief asks for", async () => {
  const analysis = await analyzeFixtures();
  for (const f of analysis.findings) {
    assert.match(f.id, /^FACT-\d{4}-\d{2}-\d{2}-\d{3}$/);
    assert.equal(typeof f.fingerprint, "string");
    assert.ok(f.route && f.file && Number.isFinite(f.line));
    assert.ok(f.claim && f.context);
    assert.ok(f.category.key && f.category.label && f.category.groupLabel);
    assert.ok(["high", "medium", "low"].includes(f.risk.level));
    assert.ok(Number.isFinite(f.freshness.score));
    assert.ok(Number.isFinite(f.priority));
    assert.ok(["now", "soon", "routine", "monitor"].includes(f.urgency));
    assert.ok(["high", "medium", "low"].includes(f.confidence.level));
    assert.ok(RECOMMENDED_ACTIONS.includes(f.recommendedAction));
    assert.ok(f.whyFlagged.length > 20);
    assert.ok("supportingSource" in f);
    assert.ok(f.verification.source, "a source record exists even when nothing was fetched");
    assert.equal(f.handoff.authorized, false, "the agent never authorizes its own handoff");
    assert.match(f.handoff.invoke, /Content Publisher handle FACT-/);
    assert.ok(f.provenance.detected && f.provenance.externalEvidence && f.provenance.recommendation);
  }
});

test("IDs are assigned in priority order and are unique", async () => {
  const analysis = await analyzeFixtures();
  const ids = analysis.findings.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(ids, [...ids].sort());
  for (let i = 1; i < analysis.findings.length; i += 1) {
    assert.ok(analysis.findings[i - 1].priority >= analysis.findings[i].priority);
  }
});

test("the same input twice produces exactly the same findings — no LLM, no randomness", async () => {
  const a = await analyzeFixtures();
  const b = await analyzeFixtures();
  assert.deepEqual(
    a.findings.map((f) => [f.id, f.fingerprint, f.priority, f.risk.level]),
    b.findings.map((f) => [f.id, f.fingerprint, f.priority, f.risk.level])
  );
});

test("pages with nothing wrong are listed as clean, not omitted", async () => {
  const analysis = await analyzeFixtures();
  const clean = analysis.cleanPages.map((p) => p.route);
  assert.ok(clean.includes("/guides/fixture-opinion-piece"), "opinion and history is not a finding");
  assert.ok(clean.includes("/guides/fixture-empty"), "an empty page scans cleanly");
  assert.equal(analysis.totals.pagesWithNoDetectedIssues, clean.length);
});

test("a passed deadline is reported with high confidence and an update recommendation", async () => {
  const analysis = await analyzeFixtures();
  const finding = analysis.findings.find((f) => f.freshness.overrides.some((o) => o.kind === "passed-deadline"));
  assert.ok(finding, "the fixture programme ended on 31 December 2025");
  assert.equal(finding.confidence.level, "high");
  assert.equal(finding.recommendedAction, "update-factual-claim");
  assert.equal(finding.risk.level, "high");
});

test("an unsourced precise figure is asked for a source", async () => {
  const analysis = await analyzeFixtures();
  const finding = analysis.findings.find((f) => f.route === "/guides/fixture-property-tax");
  assert.ok(finding);
  assert.equal(finding.supportingSource, null);
  assert.equal(finding.recommendedAction, "update-source-citation");
  assert.match(finding.recommendedActionReason, /cites nothing for it/);
});

test("with verification on, an unsourced claim is marked MANUAL_SOURCE_CHECK_REQUIRED", async () => {
  const cfg = testConfig({ verification: { enabled: true, perHostDelayMs: 0 } });
  const analysis = await analyzeFixtures({ cfg, verifier: testVerifier(cfg) });
  const finding = analysis.findings.find((f) => f.route === "/guides/fixture-property-tax");
  assert.equal(finding.verification.marker, "MANUAL_SOURCE_CHECK_REQUIRED");
  assert.match(finding.verification.reason, /no web-search capability/);
});

test("there is no quota — raising the threshold shortens the report honestly", async () => {
  const strict = testConfig({ output: { minPriority: 99.5 } });
  const analysis = await analyzeFixtures({ cfg: strict, verifier: offlineVerifier(strict) });
  assert.equal(analysis.findings.length, 0);
  assert.ok(analysis.totals.findingsBelowThreshold > 0, "and it says how many it left out");
});

// ---------------------------------------------------------------------------
// End to end, with verification
// ---------------------------------------------------------------------------

test("with verification on, findings carry real source records", async () => {
  const cfg = testConfig({ verification: { enabled: true, perHostDelayMs: 0 } });
  const analysis = await analyzeFixtures({ cfg, verifier: testVerifier(cfg) });
  const checked = analysis.findings.filter((f) => f.verification.result !== "not-attempted");
  assert.ok(checked.length > 0);
  for (const f of checked) {
    assert.ok(f.verification.source.dateAccessed, "every checked claim records when it was checked");
  }
  assert.ok(analysis.findings.some((f) => f.verification.result === "contradicts"));
  assert.ok(analysis.confirmed.length > 0, "confirmed claims are reported in their own section");
  assert.ok(analysis.findings.some((f) => f.verification.marker === "MANUAL_SOURCE_CHECK_REQUIRED"));
});

test("nothing is ever called a contradiction without explicit conflicting evidence", async () => {
  const cfg = testConfig({ verification: { enabled: true, perHostDelayMs: 0 } });
  const analysis = await analyzeFixtures({ cfg, verifier: testVerifier(cfg) });
  for (const f of [...analysis.findings, ...analysis.confirmed]) {
    if (f.verification.result !== "contradicts") {
      assert.deepEqual(f.verification.conflicts, [], `${f.id} carries conflicts without being a contradiction`);
      assert.equal(f.verification.explicitContradiction, false);
      continue;
    }
    const isStatusMismatch = f.structured?.kind === "development-project";
    assert.ok(
      f.verification.conflicts.length > 0 || isStatusMismatch,
      `${f.id} is a contradiction with no conflicting value and no status mismatch: ${f.verification.reason}`
    );
    assert.equal(f.verification.explicitContradiction, true);
  }
});

test("an absence never recommends changing the copy", async () => {
  const cfg = testConfig({ verification: { enabled: true, perHostDelayMs: 0 } });
  const analysis = await analyzeFixtures({ cfg, verifier: testVerifier(cfg) });
  const absences = analysis.findings.filter((f) =>
    ["value-not-found", "partially-confirms"].includes(f.verification.result)
  );
  for (const f of absences) {
    assert.notEqual(
      f.recommendedAction,
      "update-factual-claim",
      `${f.id} recommends an edit off the back of a missing value, which is not evidence the page is wrong`
    );
    assert.match(f.confidence.caveats.join(" "), /absence, which is much weaker than a disagreement/);
  }
});

test("a confirmed claim leaves the refresh list and is ranked as freshly checked", async () => {
  const cfg = testConfig({ verification: { enabled: true, perHostDelayMs: 0 } });
  const verified = await analyzeFixtures({ cfg, verifier: testVerifier(cfg) });
  const offline = await analyzeFixtures();
  const confirmed = verified.confirmed[0];
  assert.ok(confirmed, "the fixture park is still described as open by its source");
  assert.equal(confirmed.recommendedAction, "no-change-needed");
  assert.ok(
    !verified.findings.some((f) => f.fingerprint === confirmed.fingerprint),
    "a confirmed claim is not a refresh, so it does not compete for space in the list"
  );
  const same = offline.findings.find((f) => f.fingerprint === confirmed.fingerprint);
  assert.ok(same);
  assert.ok(confirmed.priority < same.priority, "evidence that nothing changed should push it down");
});

// ---------------------------------------------------------------------------
// GSC signal
// ---------------------------------------------------------------------------

test("with no GSC report, every multiplier is exactly 1 and the report says why", () => {
  const dir = mkdtempSync(join(tmpdir(), "fact-decay-gsc-"));
  try {
    const signal = loadGscSignal({ repoRoot: dir, config: testConfig({ gsc: { dir: "." } }), today: TEST_TODAY });
    assert.equal(signal.available, false);
    assert.equal(signal.multiplierFor("/guides/anything").value, 1);
    assert.match(signal.reason, /GSC data is optional/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a GSC report weights busy pages above quiet ones, within bounds", () => {
  const dir = mkdtempSync(join(tmpdir(), "fact-decay-gsc-"));
  try {
    writeFileSync(
      join(dir, `gsc-opportunities-${TEST_TODAY}.json`),
      JSON.stringify({
        reportDate: TEST_TODAY,
        opportunities: [
          { landingPage: "/guides/busy", metrics: { impressions: 900, clicks: 40 } },
          { landingPage: "/guides/busy", metrics: { impressions: 300, clicks: 10 } },
          { landingPage: "/guides/quiet", metrics: { impressions: 12, clicks: 0 } },
        ],
      })
    );
    const cfg = testConfig({ gsc: { dir: "." } });
    const signal = loadGscSignal({ repoRoot: dir, config: cfg, today: TEST_TODAY });
    assert.equal(signal.available, true);
    const busy = signal.multiplierFor("/guides/busy");
    const quiet = signal.multiplierFor("/guides/quiet");
    const absent = signal.multiplierFor("/guides/unknown");
    assert.equal(busy.impressions, 900, "repeated rows for one page take the max, not the sum");
    assert.ok(busy.value > quiet.value && quiet.value > absent.value);
    assert.ok(busy.value <= cfg.gsc.maxMultiplier && absent.value >= cfg.gsc.minMultiplier);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a stale GSC report is ignored, with the reason recorded", () => {
  const dir = mkdtempSync(join(tmpdir(), "fact-decay-gsc-"));
  try {
    writeFileSync(join(dir, "gsc-opportunities-2026-01-01.json"), JSON.stringify({ opportunities: [] }));
    const signal = loadGscSignal({ repoRoot: dir, config: testConfig({ gsc: { dir: "." } }), today: TEST_TODAY });
    assert.equal(signal.available, false);
    assert.match(signal.reason, /days old/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a corrupt GSC report degrades to no weighting rather than failing the run", () => {
  const dir = mkdtempSync(join(tmpdir(), "fact-decay-gsc-"));
  try {
    writeFileSync(join(dir, `gsc-opportunities-${TEST_TODAY}.json`), "{ not json");
    const signal = loadGscSignal({ repoRoot: dir, config: testConfig({ gsc: { dir: "." } }), today: TEST_TODAY });
    assert.equal(signal.available, false);
    assert.equal(signal.multiplierFor("/x").value, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the newest GSC report is the one used", () => {
  const dir = mkdtempSync(join(tmpdir(), "fact-decay-gsc-"));
  try {
    writeFileSync(join(dir, "gsc-opportunities-2026-08-01.json"), "{}");
    writeFileSync(join(dir, "gsc-opportunities-2026-09-01.json"), "{}");
    assert.equal(findLatestGscReport(dir).reportDate, "2026-09-01");
    assert.equal(findLatestGscReport(join(dir, "nope")), null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the CI artifact is found whether gh unpacks it flat or into a subdirectory", () => {
  // In CI the report is not written locally — it arrives as the GSC workflow's
  // uploaded artifact, downloaded by `gh run download`. This covers both shapes
  // that command can produce, so the traffic signal cannot silently vanish if
  // that download layout ever changes.
  for (const nested of [false, true]) {
    const root = mkdtempSync(join(tmpdir(), "fact-decay-artifact-"));
    try {
      const target = nested ? join(root, "reports", "gsc", "gsc-opportunities") : join(root, "reports", "gsc");
      mkdirSync(target, { recursive: true });
      writeFileSync(
        join(target, "gsc-opportunities-2026-09-01.json"),
        JSON.stringify({
          reportDate: "2026-09-01",
          opportunities: [{ landingPage: "/guides/busy", metrics: { impressions: 420, clicks: 18 } }],
        })
      );
      const signal = loadGscSignal({
        repoRoot: root,
        config: testConfig({ gsc: { dir: "reports/gsc" } }),
        today: TEST_TODAY,
      });
      const layout = nested ? "nested" : "flat";
      assert.equal(signal.available, true, `${layout} layout was not picked up`);
      assert.equal(signal.reportDate, "2026-09-01", layout);
      assert.ok(signal.multiplierFor("/guides/busy").value > signal.multiplierFor("/guides/quiet").value, layout);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
});

test("traffic reorders findings but never creates or removes one", async () => {
  const busySignal = {
    ...neutralGscSignal,
    available: true,
    multiplierFor: (route) => ({
      value: route === "/neighborhoods/fixture-village" ? 1.3 : 0.9,
      basis: "test weighting",
    }),
  };
  const weighted = await analyzeFixtures({ gscSignal: busySignal });
  const unweighted = await analyzeFixtures();
  assert.deepEqual(
    weighted.findings.map((f) => f.fingerprint).sort(),
    unweighted.findings.map((f) => f.fingerprint).sort()
  );
  const weightedVillage = weighted.findings.find((f) => f.route === "/neighborhoods/fixture-village");
  const plainVillage = unweighted.findings.find((f) => f.fingerprint === weightedVillage.fingerprint);
  assert.ok(weightedVillage.priority > plainVillage.priority);
  assert.equal(weightedVillage.risk.level, plainVillage.risk.level, "traffic must never change a risk level");
});

// ---------------------------------------------------------------------------
// Fair Housing and year-labelled pages
// ---------------------------------------------------------------------------

test("Fair Housing matches go to a compliance queue, grouped, with no automated fix", () => {
  const items = complianceScan({ pages: testInventory().pages, config });
  assert.ok(items.length > 0);
  const compliancePage = items.find((i) => i.route === "/guides/fixture-compliance-page");
  assert.ok(compliancePage, "the fixture page naming safety and schools should be queued");
  assert.equal(compliancePage.recommendedAction, "manual-review-required");
  assert.match(compliancePage.note, /a person decides, not this agent/);
  assert.ok(compliancePage.examples.length >= 1);
});

test("compliance items never appear as ordinary findings", async () => {
  const analysis = await analyzeFixtures();
  for (const item of analysis.compliance) {
    assert.ok(!analysis.findings.some((f) => f.claim === item.examples[0].text));
  }
});

test("a dated market report is told NOT to be rewritten to a newer year", () => {
  const assessments = assessYearLabelledPages({ pages: testInventory().pages, findings: [], today: TEST_TODAY });
  const dated = assessments.find((a) => a.route === "/guides/fixture-home-prices-july-2026");
  assert.equal(dated.shape, "dated record");
  assert.match(dated.guidance, /should NOT be rewritten/);
  assert.equal(dated.recommendedAction, "no-change-needed");
});

test("a past-year evergreen guide is handed to a human, not auto-retitled", () => {
  const assessments = assessYearLabelledPages({ pages: testInventory().pages, findings: [], today: TEST_TODAY });
  const evergreen = assessments.find((a) => a.route === "/guides/fixture-down-payment-help-2025");
  assert.equal(evergreen.shape, "past-year evergreen");
  assert.equal(evergreen.recommendedAction, "manual-review-required");
  assert.match(evergreen.guidance, /judgement call for a person/);
});

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

test("the JSON report is complete, machine-stable, and states its boundaries", async () => {
  const analysis = await analyzeFixtures();
  const json = buildJsonReport({ analysis, config, meta: { dataSource: "fixture" } });
  assert.equal(json.schemaVersion, "1.0.0");
  assert.equal(json.agent, "lvinit-fact-decay-agent");
  assert.equal(json.fixtureData, true);
  assert.equal(json.reportDate, TEST_TODAY);
  assert.ok(json.totals.pagesInScope > 0);
  assert.ok(Array.isArray(json.findings));
  assert.ok(Array.isArray(json.pagesWithNoDetectedIssues));
  assert.ok(Array.isArray(json.yearLabelledPages));
  assert.ok(Array.isArray(json.sourceHierarchy));
  assert.ok(json.fairHousingComplianceQueue.policy.length > 20);
  assert.deepEqual(json.prohibited, PROHIBITED_ACTIONS);
  assert.equal(json.configuration.cadenceDays.dynamic, config.cadence.dynamic);
  JSON.parse(JSON.stringify(json)); // must be serializable
});

test("the Markdown report leads with the counts and never buries a fixture warning", async () => {
  const cfg = testConfig({ verification: { enabled: true, perHostDelayMs: 0 } });
  const verified = await analyze({ inventory: testInventory(cfg), config: cfg, reportDate: TEST_TODAY, gscSignal: neutralGscSignal, verifier: testVerifier(cfg), previousReports: [] });
  const md = buildMarkdownReport({ analysis: verified, config: cfg, meta: { dataSource: "fixture" } });
  assert.match(md, /^# LVINIT Content Refresh Report — 2026-09-04/);
  assert.match(md.slice(0, 600), /FIXTURE DATA/);
  for (const heading of [
    "## What was scanned",
    "## Highest-priority refreshes",
    "## All findings",
    "## Checked, and still standing",
    "## Pages with no detected issues",
    "## Fair Housing compliance queue",
    "## How this report decides things",
    "## What this agent did not do",
  ]) {
    assert.ok(md.includes(heading), `missing section: ${heading}`);
  }
  assert.match(md, /Pages scanned \| \d+/);
  assert.match(md, /High-risk items/);
  for (const action of PROHIBITED_ACTIONS) assert.ok(md.includes(action), `prohibition not stated: ${action}`);
});

test("a run with no findings says so rather than padding", async () => {
  const strict = testConfig({ output: { minPriority: 99.5 } });
  const analysis = await analyzeFixtures({ cfg: strict, verifier: offlineVerifier(strict) });
  const md = buildMarkdownReport({ analysis, config: strict, meta: { dataSource: "fixture" } });
  assert.match(md, /Nothing cleared the bar this run/);
  assert.doesNotMatch(md, /\| FACT-/);
});

test("highlights are capped per page so one bad guide cannot fill the top", async () => {
  const analysis = await analyzeFixtures();
  const highlights = selectHighlights(analysis.findings, config);
  const perPage = new Map();
  for (const f of highlights) perPage.set(f.route, (perPage.get(f.route) ?? 0) + 1);
  for (const count of perPage.values()) assert.ok(count <= config.output.maxHighlightedPerPage);
  assert.ok(highlights.length <= config.output.maxHighlighted);
});

test("earlier reports give a repeat finding its original identity", async () => {
  const first = await analyzeFixtures();
  const target = first.findings[0];
  const previous = [{ reportDate: "2026-08-21", findings: [{ fingerprint: target.fingerprint, id: "FACT-2026-08-21-007" }] }];
  const second = await analyzeFixtures({ previousReports: previous });
  const repeat = second.findings.find((f) => f.fingerprint === target.fingerprint);
  assert.equal(repeat.history.firstSeen, "2026-08-21");
  assert.equal(repeat.history.firstId, "FACT-2026-08-21-007");
});

// ---------------------------------------------------------------------------
// Inventory against the real repository
// ---------------------------------------------------------------------------

test("the real repository scan finds published editorial pages and excludes utility routes", () => {
  const inventory = buildContentInventory({ repoRoot: REPO_ROOT, config, today: TEST_TODAY });
  assert.ok(inventory.pages.length > 0);
  const routes = inventory.pages.map((p) => p.route);
  assert.ok(routes.includes("/neighborhoods/summerlin"));
  assert.ok(!routes.includes("/"), "the homepage is UI, not an editorial claim");
  assert.ok(!routes.includes("/search"));
  assert.ok(!routes.includes("/contact"));
  assert.ok(!routes.some((r) => r.startsWith("/api")));
});

test("every scanned page reports where its freshness date came from", () => {
  const inventory = buildContentInventory({ repoRoot: REPO_ROOT, config, today: TEST_TODAY });
  for (const page of inventory.pages) {
    assert.ok(page.lastReviewed.basis, `${page.route} has no stated basis`);
    if (page.lastReviewed.date) {
      assert.match(page.lastReviewed.date, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(Number.isFinite(page.daysSinceReviewed));
    }
  }
});

test("Summerlin's Development Watch entries are read from its companion data module", () => {
  const inventory = buildContentInventory({ repoRoot: REPO_ROOT, config, today: TEST_TODAY });
  const summerlin = inventory.pages.find((p) => p.route === "/neighborhoods/summerlin");
  assert.ok(summerlin.developmentProjects.length > 0, "these live in lib/areas/summerlin.tsx, not the page file");
  assert.ok(summerlin.developmentProjects.every((p) => p.source?.url), "an unsourced status is the failure this guards against");
  assert.ok(summerlin.declaredSources.length > 0);
});

test("excluding a route takes it out of scope entirely", () => {
  const excluded = testConfig({ content: { excludeRoutes: ["/neighborhoods/summerlin"] } });
  const inventory = buildContentInventory({ repoRoot: REPO_ROOT, config: excluded, today: TEST_TODAY });
  assert.ok(!inventory.pages.some((p) => p.route === "/neighborhoods/summerlin"));
  assert.ok(inventory.skipped.some((s) => s.route === "/neighborhoods/summerlin" && /excluded by configuration/.test(s.reason)));
});

test("the editorial registry is read for publication dates", () => {
  const registry = readEditorialRegistry(REPO_ROOT, config.content.registryFile);
  assert.ok(registry.size > 0);
  const guide = registry.get("/guides/summerlin-vs-henderson");
  assert.ok(guide);
  assert.match(guide.publishedAt, /^\d{4}-\d{2}-\d{2}$/);
});

test("a missing registry is not fatal", () => {
  assert.equal(readEditorialRegistry(REPO_ROOT, "lib/does-not-exist.ts").size, 0);
});

test("the freshness basis follows a documented preference order", () => {
  const all = resolveLastReviewed({
    stamps: [{ kind: "checked", text: "Checked 20 August 2026" }],
    commentDates: [],
    storyMeta: { dateModified: "2026-08-01", datePublished: "2026-07-01" },
    registryEntry: { publishedAt: "2026-06-01" },
    gitDate: "2026-09-01",
  });
  assert.equal(all.date, "2026-08-20");
  assert.match(all.basis, /Checked/);

  const fallback = resolveLastReviewed({ stamps: [], commentDates: [], storyMeta: {}, registryEntry: null, gitDate: "2026-09-01" });
  assert.equal(fallback.date, "2026-09-01");
  assert.match(fallback.basis, /git commit/);

  const nothing = resolveLastReviewed({ stamps: [], commentDates: [], storyMeta: {}, registryEntry: null, gitDate: null });
  assert.equal(nothing.date, null);
  assert.match(nothing.basis, /no date could be established/);
});

// ---------------------------------------------------------------------------
// The runner
// ---------------------------------------------------------------------------

test("CLI flags map onto configuration", () => {
  const args = parseArgs(["--verify", "--min-priority=60", "--max=5", "--route=/guides/a", "--exclude=/guides/b,/guides/c", "--no-gsc"]);
  const overrides = overridesFromArgs(args);
  assert.equal(overrides.verification.enabled, true);
  assert.equal(overrides.output.minPriority, 60);
  assert.equal(overrides.output.maxFindings, 5);
  assert.deepEqual(overrides.content.includeRoutes, ["/guides/a"]);
  assert.deepEqual(overrides.content.excludeRoutes, ["/guides/b", "/guides/c"]);
  assert.deepEqual(overrides.content.includeSections, [], "naming a route means only that route");
  assert.equal(overrides.gsc.enabled, false);
});

test("--help prints and exits cleanly without scanning anything", async () => {
  const lines = [];
  const result = await run(["--help"], { log: (m) => lines.push(m), errorLog: () => {} });
  assert.equal(result.exitCode, 0);
  assert.match(lines.join("\n"), /--verify/);
});

test("--dry-run analyzes and writes nothing", async () => {
  const dir = mkdtempSync(join(tmpdir(), "fact-decay-out-"));
  try {
    const result = await run(["--fixtures", "--dry-run", `--today=${TEST_TODAY}`, `--out=${dir}`], { log: () => {}, errorLog: () => {} });
    assert.equal(result.exitCode, 0);
    assert.ok(result.analysis.findings.length > 0);
    assert.equal(existsSync(join(dir, `fact-decay-${TEST_TODAY}.md`)), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a full fixture run writes both reports and never leaves the output directory", async () => {
  const dir = mkdtempSync(join(tmpdir(), "fact-decay-out-"));
  try {
    const result = await run(["--fixtures", "--verify", `--today=${TEST_TODAY}`, `--out=${dir}`], { log: () => {}, errorLog: () => {} });
    assert.equal(result.exitCode, 0);
    const md = readFileSync(join(dir, `fact-decay-${TEST_TODAY}.md`), "utf8");
    const json = JSON.parse(readFileSync(join(dir, `fact-decay-${TEST_TODAY}.json`), "utf8"));
    assert.match(md, /FIXTURE DATA/);
    assert.equal(json.fixtureData, true);
    assert.ok(json.findings.length > 0);
    assert.ok(json.findings.every((f) => f.handoff.authorized === false));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("earlier reports are read back from the output directory, excluding today's", () => {
  const dir = mkdtempSync(join(tmpdir(), "fact-decay-hist-"));
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "fact-decay-2026-08-21.json"), JSON.stringify({ reportDate: "2026-08-21", findings: [] }));
    writeFileSync(join(dir, `fact-decay-${TEST_TODAY}.json`), JSON.stringify({ reportDate: TEST_TODAY, findings: [] }));
    writeFileSync(join(dir, "fact-decay-2026-08-28.json"), "{ corrupt");
    const reports = readPreviousReports(dir, { limit: 12, excludeDate: TEST_TODAY });
    assert.equal(reports.length, 1, "today's report is excluded and a corrupt one is skipped");
    assert.equal(reports[0].reportDate, "2026-08-21");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
