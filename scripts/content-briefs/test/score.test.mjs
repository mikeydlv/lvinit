import test from "node:test";
import assert from "node:assert/strict";

import { ACTIONS } from "../config.mjs";
import { groupQueries } from "../lib/intent.mjs";
import { scoreOpportunity, confidenceFor, evidenceComponent } from "../lib/score.mjs";
import { testConfig, qrow } from "./helpers.mjs";

const config = testConfig();
const group = (rows, previous = []) => groupQueries({ currentRows: rows, previousRows: previous })[0];
const coverage = (overlap = 0.1, extra = {}) => ({ best: { overlap }, ambiguous: false, cannibalization: { status: "none" }, ...extra });
const classification = (action, extra = {}) => ({ action, missingFacets: [], targetPosition: null, ...extra });

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

test("the score is 0-100 and carries its arithmetic", () => {
  const s = scoreOpportunity({ group: group([qrow("summerlin vs southwest", 40)]), classification: classification(ACTIONS.NEW_COMPARISON), coverage: coverage(), persistenceRuns: 1, gscFindingIds: [], clusterWeak: false, config });
  assert.ok(s.score >= 0 && s.score <= 100);
  assert.equal(s.family, "new");
  assert.ok(s.breakdown.every((r) => Number.isFinite(r.value) && r.weight > 0));
});

test("raw impressions do not dominate: a small, sharp LVINIT comparison outscores a large vague topic", () => {
  const small = scoreOpportunity({ group: group([qrow("summerlin vs southwest", 30, 0, 12), qrow("southwest vs summerlin", 10, 0, 14)]), classification: classification(ACTIONS.NEW_COMPARISON), coverage: coverage(0.1), persistenceRuns: 1, gscFindingIds: [], clusterWeak: false, config });
  const large = scoreOpportunity({ group: group([qrow("las vegas mortgage", 2000, 0, 40)]), classification: classification(ACTIONS.NEW_ARTICLE), coverage: coverage(0.45), persistenceRuns: 1, gscFindingIds: [], clusterWeak: false, config });
  assert.ok(small.score > large.score, `${small.score} should beat ${large.score}`);
});

test("demand is a minority share of any score", () => {
  const s = scoreOpportunity({ group: group([qrow("summerlin vs southwest", 5000)]), classification: classification(ACTIONS.NEW_COMPARISON), coverage: coverage(), persistenceRuns: 1, gscFindingIds: [], clusterWeak: false, config });
  const demand = s.breakdown.find((r) => r.component === "demand");
  assert.ok(demand.sharePct < 25, `demand share ${demand.sharePct}%`);
});

test("small signals stay visible on a young site", () => {
  const s = scoreOpportunity({ group: group([qrow("summerlin vs southwest", 20)]), classification: classification(ACTIONS.NEW_COMPARISON), coverage: coverage(), persistenceRuns: 1, gscFindingIds: [], clusterWeak: false, config });
  assert.ok(s.score >= 55, `20 impressions on a strong intent scored ${s.score}`);
});

test("no previous period is neutral for growth, not a penalty", () => {
  const s = scoreOpportunity({ group: group([qrow("summerlin vs southwest", 30)]), classification: classification(ACTIONS.NEW_COMPARISON), coverage: coverage(), persistenceRuns: 1, gscFindingIds: [], clusterWeak: false, config });
  assert.equal(s.breakdown.find((r) => r.component === "growth").value, 0.5);
});

test("evidence strength rewards distinct queries, a previous period, persistence and GSC findings", () => {
  const thin = evidenceComponent({ group: group([qrow("summerlin vs southwest", 30)]), persistenceRuns: 1, gscFindingIds: [] });
  const strong = evidenceComponent({ group: group([qrow("summerlin vs southwest", 30), qrow("southwest vs summerlin", 5), qrow("summerlin or southwest", 5), qrow("is southwest cheaper than summerlin", 5)], [qrow("summerlin vs southwest", 10)]), persistenceRuns: 3, gscFindingIds: ["GSC-1"] });
  assert.ok(strong > thin);
  assert.ok(strong <= 1);
});

// ---------------------------------------------------------------------------
// Confidence
// ---------------------------------------------------------------------------

test("confidence tiers come from intent volume: 150+ high, 40+ medium, below low", () => {
  const g = (n) => group([qrow("summerlin vs southwest", n)], [qrow("summerlin vs southwest", n)]);
  assert.equal(confidenceFor({ group: g(200), coverage: coverage(), persistenceRuns: 1, config }).level, "high");
  assert.equal(confidenceFor({ group: g(60), coverage: coverage(), persistenceRuns: 1, config }).level, "medium");
  assert.equal(confidenceFor({ group: g(20), coverage: coverage(), persistenceRuns: 1, config }).level, "low");
});

test("low-volume handling: one thin week is never proof of durable demand", () => {
  const g = group([qrow("summerlin vs southwest", 200)]);
  const once = confidenceFor({ group: g, coverage: coverage(), persistenceRuns: 1, gsc: { lowVolume: true }, config });
  assert.equal(once.level, "medium");
  const persisted = confidenceFor({ group: g, coverage: coverage(), persistenceRuns: 2, gsc: { lowVolume: true }, config });
  assert.equal(persisted.level, "high");
});

test("medium-volume demand becomes high only once it has persisted", () => {
  const g = group([qrow("summerlin vs southwest", 60)]);
  assert.equal(confidenceFor({ group: g, coverage: coverage(), persistenceRuns: 1, config }).level, "medium");
  assert.equal(confidenceFor({ group: g, coverage: coverage(), persistenceRuns: 2, config }).level, "high");
});

test("confidence is capped by an ambiguous duplicate check, cannibalization, unclear intent, or findings-only input", () => {
  const g = group([qrow("summerlin vs southwest", 300)], [qrow("summerlin vs southwest", 100)]);
  assert.equal(confidenceFor({ group: g, coverage: coverage(0.5, { ambiguous: true }), persistenceRuns: 3, config }).level, "medium");
  assert.equal(confidenceFor({ group: g, coverage: coverage(0.9, { cannibalization: { status: "potential" } }), persistenceRuns: 3, config }).level, "medium");
  assert.equal(confidenceFor({ group: { ...g, intentClarity: 0.4 }, coverage: coverage(), persistenceRuns: 3, config }).level, "low");
  assert.equal(confidenceFor({ group: g, coverage: coverage(), persistenceRuns: 3, gsc: { mode: "findings-only" }, config }).level, "medium");
});

test("confidence is separate from score: a high score can carry low confidence", () => {
  const g = group([qrow("summerlin vs southwest", 25)]);
  const s = scoreOpportunity({ group: g, classification: classification(ACTIONS.NEW_COMPARISON), coverage: coverage(), persistenceRuns: 1, gscFindingIds: [], clusterWeak: false, config });
  const c = confidenceFor({ group: g, coverage: coverage(), persistenceRuns: 1, config });
  assert.ok(s.score >= 55);
  assert.equal(c.level, "low");
});
