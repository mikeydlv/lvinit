import test from "node:test";
import assert from "node:assert/strict";

import { analyze } from "../lib/analyze.mjs";
import { buildMarkdownReport, buildJsonReport, selectExecutiveSummary, PROHIBITED_ACTIONS } from "../lib/report.mjs";
import { FIXTURE_DATASET, FIXTURE_EMPTY_DATASET, FIXTURE_LOW_VOLUME_DATASET } from "../fixtures/fixture-dataset.mjs";
import { testConfig, testInventory, testWindows, normalizeDataset, TEST_TODAY } from "./helpers.mjs";

const inventory = testInventory();

function build(dataset, { dataSource = "fixture", overrides = {} } = {}) {
  const config = testConfig(overrides);
  const windows = testWindows(config);
  const analysis = analyze({
    data: normalizeDataset(dataset),
    inventory,
    config,
    reportDate: TEST_TODAY,
    windows,
  });
  const meta = { reportDate: TEST_TODAY, dataSource, property: "sc-domain:lvinit.com" };
  return {
    analysis,
    config,
    markdown: buildMarkdownReport({ analysis, config, meta }),
    json: buildJsonReport({ analysis, config, meta, data: normalizeDataset(dataset) }),
  };
}

// ---------------------------------------------------------------------------
// JSON
// ---------------------------------------------------------------------------

test("the JSON report round-trips through JSON.stringify without loss or cycles", () => {
  const { json } = build(FIXTURE_DATASET);
  const serialized = JSON.stringify(json, null, 2);
  const reparsed = JSON.parse(serialized);
  assert.deepEqual(reparsed.opportunities.map((o) => o.id), json.opportunities.map((o) => o.id));
  assert.ok(serialized.length > 1000);
});

test("the JSON report carries the machine contract the Content Publisher needs", () => {
  const { json } = build(FIXTURE_DATASET);
  assert.equal(json.schemaVersion, "1.1.0");
  assert.equal(json.reportDate, TEST_TODAY);
  assert.equal(json.site.origin, "https://www.lvinit.com");
  assert.ok(json.windows.current.start && json.windows.current.end);
  assert.ok(json.windows.previous.start && json.windows.previous.end);
  assert.ok(json.configuration.thresholds, "thresholds are recorded so a report can be reproduced");
  assert.ok(json.configuration.scoringWeights);
  assert.equal(json.configuration.dataState, "final");
  assert.deepEqual(json.prohibited, PROHIBITED_ACTIONS);
});

test("the JSON exports raw search demand, with the three dimension sets kept apart", () => {
  const { json } = build(FIXTURE_DATASET);
  const demand = json.searchDemand;
  assert.ok(demand, "searchDemand is present when the run had data");
  assert.match(demand.note, /do not sum to each other/);
  for (const key of ["queries", "pages", "pairs"]) {
    assert.ok(Array.isArray(demand.current[key].rows));
    assert.ok(Array.isArray(demand.previous[key].rows));
  }
  const row = demand.current.queries.rows.find((r) => r.query === "summerlin vs henderson");
  assert.deepEqual(
    { clicks: row.clicks, impressions: row.impressions, position: row.position },
    { clicks: 14, impressions: 180, position: 8.2 },
    "raw metrics are carried through unchanged"
  );
  assert.ok(demand.current.pages.rows.every((r) => r.route === null || r.route.startsWith("/")));
  const blocked = demand.current.queries.rows.filter((r) => r.fairHousingBlocked).map((r) => r.query);
  assert.ok(blocked.includes("safest neighborhoods in henderson nv"), "Fair Housing rows are flagged, not hidden");
});

test("the raw demand export is capped and says when it was truncated", () => {
  const { json } = build(FIXTURE_DATASET, { overrides: { output: { maxDemandRows: 3 } } });
  assert.equal(json.searchDemand.current.queries.rows.length, 3);
  assert.equal(json.searchDemand.current.queries.truncated, true);
  const sorted = json.searchDemand.current.queries.rows.map((r) => r.impressions);
  assert.deepEqual(sorted, [...sorted].sort((a, b) => b - a), "largest rows are kept");
});

test("a report built without raw rows carries searchDemand: null rather than inventing any", () => {
  const config = testConfig();
  const analysis = analyze({ data: normalizeDataset(FIXTURE_DATASET), inventory, config, reportDate: TEST_TODAY, windows: testWindows(config) });
  const json = buildJsonReport({ analysis, config, meta: { reportDate: TEST_TODAY, dataSource: "fixture" } });
  assert.equal(json.searchDemand, null);
});

test("a fixture run is flagged as fixture data in the JSON", () => {
  const { json } = build(FIXTURE_DATASET, { dataSource: "fixture" });
  assert.equal(json.fixtureData, true);
  assert.equal(json.dataSource, "fixture");

  const live = build(FIXTURE_DATASET, { dataSource: "search-console" });
  assert.equal(live.json.fixtureData, false);
});

test("the JSON states that the CTR baseline is LVINIT's own", () => {
  const { json } = build(FIXTURE_DATASET);
  assert.match(json.ctrBaseline.source, /LVINIT's own/);
  assert.match(json.ctrBaseline.source, /No external or industry CTR benchmark/i);
  assert.ok(Array.isArray(json.ctrBaseline.bands));
});

test("the JSON records Fair Housing exclusions with reasons and no recommendations", () => {
  const { json } = build(FIXTURE_DATASET);
  assert.equal(json.fairHousing.excludedCount, 2);
  for (const excluded of json.fairHousing.excluded) {
    assert.ok(excluded.reason);
    assert.equal(excluded.recommendedAction, undefined);
  }
});

test("the JSON discloses data quality rather than presenting findings as certainties", () => {
  const { json } = build(FIXTURE_LOW_VOLUME_DATASET);
  assert.equal(json.dataQuality.lowVolume, true);
  assert.ok(json.dataQuality.notes.length > 0);
  assert.ok("candidateFindings" in json.dataQuality && "reportedFindings" in json.dataQuality);
});

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

test("the Markdown report opens with the date and the comparison window", () => {
  const { markdown } = build(FIXTURE_DATASET);
  assert.ok(markdown.startsWith(`# LVINIT Search Opportunities — ${TEST_TODAY}`));
  assert.match(markdown, /\*\*Comparison:\*\* 2026-08-05 to 2026-09-01 \(28 complete days\) vs 2026-07-08 to 2026-08-04/);
  assert.match(markdown, /Reporting lag buffer:\*\* 3 days/);
});

test("a fixture report is unmistakably labelled as fixture data", () => {
  const { markdown } = build(FIXTURE_DATASET, { dataSource: "fixture" });
  assert.match(markdown, /FIXTURE DATA — NOT REAL SEARCH CONSOLE DATA/);
  assert.match(markdown, /Do not act on anything below/);
});

test("a live report carries no fixture banner", () => {
  const { markdown } = build(FIXTURE_DATASET, { dataSource: "search-console" });
  assert.doesNotMatch(markdown, /FIXTURE DATA/);
  assert.match(markdown, /\*\*Data source:\*\* Google Search Console API/);
});

test("the executive summary answers all five questions for each item", () => {
  const { markdown } = build(FIXTURE_DATASET);
  assert.match(markdown, /## Top opportunities this week/);
  for (const heading of [
    /\*\*1\. What Google is showing us\*\*/,
    /\*\*2\. Why it matters\*\*/,
    /\*\*3\. What I recommend doing\*\*/,
    /\*\*4\. Which LVINIT page is affected\*\*/,
    /\*\*5\. Existing page or something new\?\*\*/,
  ]) {
    assert.match(markdown, heading);
  }
});

test("the executive summary shows one finding per page, so it covers several pages", () => {
  const { analysis, config } = build(FIXTURE_DATASET);
  const top = selectExecutiveSummary(analysis.opportunities, config.output.maxExecutiveSummary);
  const pages = top.map((o) => o.landingPage);
  assert.equal(new Set(pages).size, pages.length, "no page should appear twice in the summary");
  assert.ok(top.length <= config.output.maxExecutiveSummary);
});

test("the executive summary keeps findings in score order", () => {
  const { analysis } = build(FIXTURE_DATASET);
  const top = selectExecutiveSummary(analysis.opportunities, 5);
  const scores = top.map((o) => o.score);
  assert.deepEqual(scores, [...scores].sort((a, b) => b - a));
});

test("every reported opportunity ID appears in the Markdown, with its handoff line", () => {
  const { markdown, analysis } = build(FIXTURE_DATASET);
  for (const opp of analysis.opportunities) {
    assert.ok(markdown.includes(opp.id), `${opp.id} is missing from the Markdown report`);
  }
  assert.match(markdown, /Have the LVINIT Real Estate Content Publisher execute GSC-/);
});

test("the report separates raw metrics, calculations, interpretation and recommendations", () => {
  const { markdown } = build(FIXTURE_DATASET);
  assert.match(markdown, /Raw Search Console totals for the two windows\. Nothing here is calculated or interpreted/);
  assert.match(markdown, /are raw Search Console metrics/);
  assert.match(markdown, /Position change and score are calculated/);
  assert.match(markdown, /agent interpretation/i);
});

test("the report explains the score in plain English, component by component", () => {
  const { markdown } = build(FIXTURE_DATASET);
  assert.match(markdown, /## How the score works/);
  for (const component of ["Size", "Position potential", "CTR gap", "Momentum", "Editorial", "Intent", "Actionability"]) {
    assert.ok(markdown.includes(`| ${component} |`), `the score explainer is missing ${component}`);
  }
  assert.match(markdown, /No industry benchmark is used anywhere in this agent/);
  assert.match(markdown, /never estimates leads, revenue, or conversion/);
});

test("the report publishes LVINIT's own CTR baseline and marks thin bands as unusable", () => {
  const { markdown } = build(FIXTURE_DATASET);
  assert.match(markdown, /## LVINIT's own clickthrough baseline/);
  assert.match(markdown, /\| Position band \| LVINIT median CTR \|/);
  assert.match(markdown, /no — under \d+ queries/);
});

test("Fair Housing exclusions are listed with reasons and explicitly carry no recommendation", () => {
  const { markdown } = build(FIXTURE_DATASET);
  assert.match(markdown, /## Fair Housing exclusions/);
  assert.match(markdown, /excluded from recommendations entirely/);
  assert.match(markdown, /No recommendation was generated for any of them, and none should be/);
  assert.ok(markdown.includes("best family neighborhoods in las vegas"));
});

test("the report states what the agent is forbidden from doing", () => {
  const { markdown } = build(FIXTURE_DATASET);
  assert.match(markdown, /## What this agent did not do/);
  for (const action of PROHIBITED_ACTIONS) {
    assert.ok(markdown.includes(action), `the prohibition "${action}" is missing from the report`);
  }
  assert.match(markdown, /Execution belongs to the \*\*LVINIT Real Estate Content Publisher\*\*/);
});

test("an empty dataset produces an honest report, not an empty template", () => {
  const { markdown } = build(FIXTURE_EMPTY_DATASET);
  assert.match(markdown, /Nothing cleared the bar this week/);
  assert.match(markdown, /it will not manufacture one to fill\s+space/);
  assert.doesNotMatch(markdown, /### 1\. GSC-/);
});

test("a low-volume dataset warns before it shows anything else", () => {
  const { markdown } = build(FIXTURE_LOW_VOLUME_DATASET);
  assert.match(markdown, /Read this before anything else/);
  assert.match(markdown, /early signal worth watching, not a verdict/);
});

test("a content gap does not name a page to edit — it says no page owns the query", () => {
  const { markdown, analysis } = build(FIXTURE_DATASET);
  const gap = analysis.opportunities.find((o) => o.type === "content-gap");
  if (gap) {
    assert.match(markdown, /\*\*No page owns this yet\.\*\*/);
  }
});

test("Markdown tables are not broken by pipe characters in query text", () => {
  const dataset = structuredClone(FIXTURE_DATASET);
  dataset.current.queries[0].keys = ["summerlin | henderson vs southwest"];
  dataset.current.pairs[0].keys = ["summerlin | henderson vs southwest", "https://www.lvinit.com/guides/summerlin-vs-henderson"];
  const { markdown } = build(dataset);
  const tableRows = markdown.split("\n").filter((line) => line.startsWith("| GSC-"));
  for (const row of tableRows) {
    const unescaped = row.replace(/\\\|/g, "");
    assert.equal(unescaped.split("|").length - 1, 12, "every findings-table row must have the same column count");
  }
});
