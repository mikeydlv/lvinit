import test from "node:test";
import assert from "node:assert/strict";

import { analyze, indexRows, dedupeRecommendations, OPPORTUNITY_TYPES, RECOMMENDATION_KINDS } from "../lib/analyze.mjs";
import { checkFairHousing } from "../lib/fair-housing.mjs";
import {
  FIXTURE_DATASET,
  FIXTURE_EMPTY_DATASET,
  FIXTURE_LOW_VOLUME_DATASET,
  FIXTURE_DUPLICATE_DATASET,
} from "../fixtures/fixture-dataset.mjs";
import { testConfig, testInventory, testWindows, normalizeDataset, TEST_TODAY } from "./helpers.mjs";

const inventory = testInventory();

function run(dataset, configOverrides = {}) {
  const config = testConfig(configOverrides);
  const windows = testWindows(config);
  return {
    config,
    result: analyze({
      data: normalizeDataset(dataset),
      inventory,
      config,
      reportDate: TEST_TODAY,
      windows,
    }),
  };
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

test("the main fixture produces findings across most opportunity types", () => {
  const { result } = run(FIXTURE_DATASET);
  assert.ok(result.opportunities.length > 0);
  const typesFound = new Set(result.opportunities.map((o) => o.type));
  assert.ok(typesFound.size >= 6, `expected a spread of types, got: ${[...typesFound].join(", ")}`);
  for (const type of typesFound) assert.ok(OPPORTUNITY_TYPES.includes(type), `unknown type ${type}`);
});

test("every opportunity type in the fixture is at least reachable before capping", () => {
  // Raise every cap so nothing is trimmed, and check each detector can fire.
  const { result } = run(FIXTURE_DATASET, {
    output: { minScore: 0, maxOpportunities: 500, maxPerType: 500 },
  });
  const typesFound = new Set(result.opportunities.map((o) => o.type));
  for (const type of [
    "quick-win",
    "ctr-opportunity",
    "emerging-query",
    "page-gaining-momentum",
    "page-losing-momentum",
    "content-gap",
    "query-page-mismatch",
    "cannibalization",
    "internal-link",
  ]) {
    assert.ok(typesFound.has(type), `no ${type} finding was produced by the fixture dataset`);
  }
});

test("the quick win is the query that already ranks on a page that matches it", () => {
  const { result } = run(FIXTURE_DATASET, { output: { minScore: 0, maxPerType: 500, maxOpportunities: 500 } });
  const quickWins = result.opportunities.filter((o) => o.type === "quick-win");
  assert.ok(quickWins.some((o) => o.query === "summerlin vs henderson"));
  for (const win of quickWins) {
    assert.ok(win.metrics.position > 3.5 && win.metrics.position <= 20, "a quick win must be in striking distance");
    assert.equal(win.landingPageExists, true, "a quick win must point at a page that exists");
    assert.ok(win.evidence.topicalMatch > 0.34, "a quick win must be on a page that actually matches the query");
  }
});

test("a query whose only ranking page is topically unrelated is a gap, not a quick win", () => {
  const { result } = run(FIXTURE_DATASET, { output: { minScore: 0, maxPerType: 500, maxOpportunities: 500 } });
  const homepageQuickWin = result.opportunities.find(
    (o) => o.type === "quick-win" && o.landingPage === "/" && o.query === "moving to las vegas from california 2026"
  );
  assert.equal(homepageQuickWin, undefined, "'optimize the homepage for a long-tail query' is never the answer");
});

test("the CTR opportunity is measured against LVINIT's own baseline, not an industry curve", () => {
  const { result } = run(FIXTURE_DATASET, { output: { minScore: 0, maxPerType: 500, maxOpportunities: 500 } });
  const ctr = result.opportunities.find((o) => o.type === "ctr-opportunity");
  assert.ok(ctr, "expected a CTR opportunity");
  assert.equal(ctr.query, "what 500k buys in las vegas");
  assert.match(ctr.evidence.baselineSource, /LVINIT's own/);
  assert.match(ctr.evidence.baselineSource, /no external benchmark/i);
  assert.ok(ctr.evidence.lvinitBaselineRows >= 5, "the baseline must come from enough LVINIT rows to trust");
  assert.ok(ctr.metrics.ctr < ctr.evidence.lvinitBaselineCtr);
});

test("emerging searches are the new and the meaningfully growing", () => {
  const { result } = run(FIXTURE_DATASET, { output: { minScore: 0, maxPerType: 500, maxOpportunities: 500 } });
  const emerging = result.opportunities.filter((o) => o.type === "emerging-query");
  const queries = emerging.map((o) => o.query);
  assert.ok(queries.includes("southwest las vegas neighborhood"), "31 -> 66 impressions is real growth");
  for (const opp of emerging) {
    const grew = opp.metrics.impressionsChange > 0 || opp.metrics.previousImpressions === null;
    assert.ok(grew, `${opp.query} was reported as emerging but did not grow`);
  }
});

test("page momentum is detected in both directions and never both for one page", () => {
  const { result } = run(FIXTURE_DATASET, { output: { minScore: 0, maxPerType: 500, maxOpportunities: 500 } });
  const gaining = result.opportunities.filter((o) => o.type === "page-gaining-momentum");
  const losing = result.opportunities.filter((o) => o.type === "page-losing-momentum");

  assert.ok(gaining.some((o) => o.landingPage === "/neighborhoods/southwest-las-vegas"));
  assert.ok(losing.some((o) => o.landingPage === "/guides/will-las-vegas-home-prices-drop"));

  for (const opp of gaining) assert.equal(opp.recommendationKind, "optimize-existing-page");
  for (const opp of losing) {
    assert.equal(opp.recommendationKind, "investigate-existing-page");
    assert.match(opp.recommendedAction, /Investigate before acting/);
  }
  const overlap = gaining.filter((g) => losing.some((l) => l.landingPage === g.landingPage));
  assert.equal(overlap.length, 0, "one page cannot be both gaining and losing in the same window");
});

test("a content gap means no page answers the query, not merely a poor position", () => {
  const { result } = run(FIXTURE_DATASET, { output: { minScore: 0, maxPerType: 500, maxOpportunities: 500 } });
  const gaps = result.opportunities.filter((o) => o.type === "content-gap");
  assert.ok(gaps.some((o) => o.query === "rent first or buy when moving to las vegas"));
  // A perfectly-matching page ranking at 12.3 is an optimization, not a gap.
  assert.ok(
    !gaps.some((o) => o.query === "nevada property tax abatement"),
    "a query with a dedicated, well-matched page is not a content gap"
  );
  for (const gap of gaps) {
    assert.equal(gap.recommendationKind, "create-new-content");
    assert.ok(gap.editorialAngle, "a new-content recommendation must carry an editorial angle");
    assert.ok(gap.editorialAngle.length > 120, "the angle must be a brief, not a keyword");
    assert.ok(!/^Write an article about/i.test(gap.editorialAngle));
    assert.equal(
      gap.landingPageRole,
      "current-fallback",
      "a gap's URL is where Google fell back to, not a page to edit"
    );
    assert.match(gap.handoff.request, /No LVINIT page owns this search/);
  }
});

test("a query/page mismatch names a genuinely better existing page", () => {
  const { result } = run(FIXTURE_DATASET, { output: { minScore: 0, maxPerType: 500, maxOpportunities: 500 } });
  const mismatch = result.opportunities.find((o) => o.type === "query-page-mismatch");
  assert.ok(mismatch);
  assert.equal(mismatch.query, "henderson vs southwest las vegas");
  assert.equal(mismatch.evidence.rankingPage, "/neighborhoods/henderson");
  assert.equal(mismatch.evidence.betterMatchPage, "/guides/henderson-vs-southwest-las-vegas");
  assert.ok(mismatch.evidence.betterMatchScore > mismatch.evidence.rankingPageMatch);
  assert.ok(mismatch.evidence.betterMatchScore >= 0.5, "the alternative must be a real answer, not a lesser evil");
});

test("cannibalization requires two URLs on the same intent, close together", () => {
  const { result } = run(FIXTURE_DATASET, { output: { minScore: 0, maxPerType: 500, maxOpportunities: 500 } });
  const cannibal = result.opportunities.find((o) => o.type === "cannibalization");
  assert.ok(cannibal);
  assert.equal(cannibal.query, "summerlin vs henderson");
  assert.ok(cannibal.evidence.competingUrls.length >= 2);
  const [a, b] = cannibal.evidence.competingUrls;
  assert.notEqual(a.route, b.route);
  assert.ok(Math.abs(a.position - b.position) <= 12);
  assert.equal(cannibal.recommendationKind, "investigate-existing-page");
});

test("internal-link findings only name pages that do not already link to the target", () => {
  const { result } = run(FIXTURE_DATASET, { output: { minScore: 0, maxPerType: 500, maxOpportunities: 500 } });
  const links = result.opportunities.filter((o) => o.type === "internal-link");
  assert.ok(links.length > 0);
  for (const opp of links) {
    assert.equal(opp.recommendationKind, "add-internal-links");
    assert.ok(opp.evidence.suggestedSourcePages.length > 0);
    for (const source of opp.evidence.suggestedSourcePages) {
      const sourcePage = inventory.pages.get(source.route);
      assert.ok(sourcePage, `${source.route} must be a real page`);
      assert.ok(
        !sourcePage.linksTo.includes(opp.landingPage),
        `${source.route} already links to ${opp.landingPage} — it should not be suggested`
      );
    }
  }
});

// ---------------------------------------------------------------------------
// Fair Housing
// ---------------------------------------------------------------------------

test("no Fair-Housing-blocked query ever becomes a recommendation", () => {
  const { result } = run(FIXTURE_DATASET, { output: { minScore: 0, maxPerType: 500, maxOpportunities: 500 } });
  for (const opp of result.opportunities) {
    if (!opp.query) continue;
    assert.equal(checkFairHousing(opp.query).blocked, false, `"${opp.query}" should never be recommended`);
  }
});

test("blocked queries are reported as exclusions, with a reason and no recommendation", () => {
  const { result } = run(FIXTURE_DATASET);
  assert.equal(result.fairHousingExcluded.length, 2);
  const queries = result.fairHousingExcluded.map((e) => e.query).sort();
  assert.deepEqual(queries, ["best family neighborhoods in las vegas", "safest neighborhoods in henderson nv"]);
  for (const excluded of result.fairHousingExcluded) {
    assert.ok(excluded.category);
    assert.ok(excluded.reason);
    assert.equal(excluded.recommendedAction, undefined, "an exclusion must carry no recommendation at all");
  }
});

test("an off-topic query with real volume is not turned into content", () => {
  const { result } = run(FIXTURE_DATASET, { output: { minScore: 0, maxPerType: 500, maxOpportunities: 500 } });
  assert.ok(
    !result.opportunities.some((o) => o.query === "las vegas casino jobs"),
    "search volume alone does not make something LVINIT's job"
  );
});

// ---------------------------------------------------------------------------
// Empty and low-volume data
// ---------------------------------------------------------------------------

test("an empty dataset produces no findings and no invented conclusions", () => {
  const { result } = run(FIXTURE_EMPTY_DATASET);
  assert.deepEqual(result.opportunities, []);
  assert.equal(result.candidateCount, 0);
  assert.equal(result.totals.currentImpressions, 0);
  assert.equal(result.lowVolume, true);
  assert.ok(result.notes.some((n) => /low-volume threshold/.test(n)));
  assert.equal(result.fairHousingExcluded.length, 0);
});

test("an empty dataset yields no usable CTR baseline rather than a fabricated one", () => {
  const { result } = run(FIXTURE_EMPTY_DATASET);
  for (const band of result.ctrBaseline) {
    assert.equal(band.sufficient, false);
    assert.equal(band.ctr, null);
  }
});

test("a low-volume dataset says so instead of manufacturing recommendations", () => {
  const { result } = run(FIXTURE_LOW_VOLUME_DATASET);
  assert.equal(result.lowVolume, true);
  assert.equal(result.opportunities.length, 0, "13 impressions is not enough to recommend anything");
  assert.ok(result.notes.some((n) => /early signal, not a conclusion/.test(n)));
});

test("lowering thresholds surfaces early signals — the thresholds really are configurable", () => {
  const { result } = run(FIXTURE_LOW_VOLUME_DATASET, {
    thresholds: {
      minImpressions: 1,
      quickWin: { minImpressions: 1, worstPosition: 40 },
      internalLinks: { minImpressions: 1, worstPosition: 40 },
      momentum: { minImpressions: 1 },
      emerging: { minImpressions: 1, minAbsoluteGain: 1 },
    },
    output: { minScore: 0, maxPerType: 50, maxOpportunities: 50 },
  });
  assert.ok(result.candidateCount > 0, "with lower thresholds the same data yields candidates");
  assert.equal(result.lowVolume, true, "...but the report still says the volume is too thin");
});

// ---------------------------------------------------------------------------
// Duplicates
// ---------------------------------------------------------------------------

test("duplicate rows for one key are merged, not double-counted", () => {
  const rows = [
    { query: "summerlin vs henderson", clicks: 6, impressions: 100, ctr: 0.06, position: 8 },
    { query: "summerlin vs henderson", clicks: 4, impressions: 100, ctr: 0.04, position: 12 },
    { query: "other", clicks: 1, impressions: 10, ctr: 0.1, position: 3 },
  ];
  const indexed = indexRows(rows, (r) => r.query);
  assert.equal(indexed.size, 2);
  const merged = indexed.get("summerlin vs henderson");
  assert.equal(merged.clicks, 10);
  assert.equal(merged.impressions, 200);
  assert.equal(merged.ctr, 0.05, "CTR is recomputed from the merged totals");
  assert.equal(merged.position, 10, "position is impression-weighted, not naively averaged");
});

test("position merging is weighted by impressions, not by row count", () => {
  const indexed = indexRows(
    [
      { query: "q", clicks: 0, impressions: 900, ctr: 0, position: 10 },
      { query: "q", clicks: 0, impressions: 100, ctr: 0, position: 20 },
    ],
    (r) => r.query
  );
  assert.equal(indexed.get("q").position, 11);
});

test("rows with a null key are dropped rather than merged into a bucket of nothing", () => {
  const indexed = indexRows(
    [
      { page: null, clicks: 1, impressions: 1, ctr: 1, position: 1 },
      { page: "/a", clicks: 1, impressions: 1, ctr: 1, position: 1 },
    ],
    (r) => r.page
  );
  assert.equal(indexed.size, 1);
});

test("the duplicate-row fixture is counted once end to end", () => {
  const { result } = run(FIXTURE_DUPLICATE_DATASET, { output: { minScore: 0, maxPerType: 50, maxOpportunities: 50 } });
  assert.equal(result.totals.currentImpressions, 200, "two 100-impression rows for one query are 200, not 400");
  assert.equal(result.totals.uniqueQueries, 1);
  const forQuery = result.opportunities.filter((o) => o.query === "summerlin vs henderson");
  const keys = forQuery.map((o) => `${o.type}:${o.landingPage}:${o.recommendationKind}`);
  assert.equal(new Set(keys).size, keys.length, "no two findings may be identical");
});

test("two detectors recommending the same new article collapse into one finding", () => {
  const collapsed = dedupeRecommendations([
    { id: "a", type: "emerging-query", query: "x", landingPage: "/", recommendationKind: "create-new-content", score: 90 },
    { id: "b", type: "content-gap", query: "x", landingPage: "/", recommendationKind: "create-new-content", score: 80 },
  ]);
  assert.equal(collapsed.length, 1);
  assert.equal(collapsed[0].type, "content-gap", "the more diagnostic framing survives");
  assert.deepEqual(collapsed[0].alsoDetectedAs, ["emerging-query"]);
});

test("different diagnoses of the same page are NOT collapsed away", () => {
  const kept = dedupeRecommendations([
    { id: "a", type: "quick-win", query: "x", landingPage: "/p", recommendationKind: "optimize-existing-page", score: 90 },
    { id: "b", type: "query-page-mismatch", query: "x", landingPage: "/p", recommendationKind: "optimize-existing-page", score: 80 },
  ]);
  assert.equal(kept.length, 2, "a mismatch and a quick win call for different thinking");
});

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

test("every opportunity carries the full documented contract", () => {
  const { result } = run(FIXTURE_DATASET);
  for (const opp of result.opportunities) {
    assert.match(opp.id, /^GSC-\d{4}-\d{2}-\d{2}-\d{3}$/, "ids must be stable and quotable");
    assert.ok(OPPORTUNITY_TYPES.includes(opp.type));
    assert.ok(RECOMMENDATION_KINDS.includes(opp.recommendationKind));
    assert.ok(typeof opp.score === "number" && opp.score >= 0 && opp.score <= 100);
    assert.ok(["high", "medium", "low"].includes(opp.confidence.level));
    assert.ok(opp.whyItMatters.length > 40);
    assert.ok(opp.recommendedAction.length > 40);
    assert.ok(Array.isArray(opp.scoreBreakdown) && opp.scoreBreakdown.length > 0);

    for (const key of [
      "clicks",
      "impressions",
      "ctr",
      "position",
      "previousClicks",
      "previousImpressions",
      "previousCtr",
      "previousPosition",
      "clicksChange",
      "impressionsChange",
      "ctrChange",
      "positionChange",
    ]) {
      assert.ok(key in opp.metrics, `metrics.${key} must be present (null is fine, missing is not)`);
    }

    assert.ok(opp.provenance.raw.includes("impressions"));
    assert.ok(opp.provenance.calculated.includes("score"));
    assert.ok(opp.provenance.recommendation.includes("recommendedAction"));
  }
});

test("ids are unique and sequential within a report", () => {
  const { result } = run(FIXTURE_DATASET, { output: { minScore: 0, maxPerType: 500, maxOpportunities: 500 } });
  const ids = result.opportunities.map((o) => o.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.ok(id.startsWith(`GSC-${TEST_TODAY}-`));
});

test("every handoff is unauthorized and names Mikey as the approval layer", () => {
  const { result } = run(FIXTURE_DATASET);
  for (const opp of result.opportunities) {
    assert.equal(opp.handoff.agent, "lvinit-content-publisher");
    assert.equal(opp.handoff.authorized, false, "the agent must never hand work over by itself");
    assert.equal(opp.handoff.approvalRequired, "Mikey");
    assert.equal(opp.handoff.invoke, `Have the LVINIT Real Estate Content Publisher execute ${opp.id}.`);
  }
});

test("position change is stated so that a positive number means moving up the results", () => {
  const { result } = run(FIXTURE_DATASET, { output: { minScore: 0, maxPerType: 500, maxOpportunities: 500 } });
  const improving = result.opportunities.find((o) => o.metrics.previousPosition && o.metrics.position);
  assert.ok(improving);
  const expected = Number((improving.metrics.previousPosition - improving.metrics.position).toFixed(1));
  assert.equal(improving.metrics.positionChange, expected);
});

test("the reporting threshold and caps are respected", () => {
  const { result, config } = run(FIXTURE_DATASET);
  assert.ok(result.opportunities.length <= config.output.maxOpportunities);
  assert.ok(result.opportunities.every((o) => o.score >= config.output.minScore));
  const counts = new Map();
  for (const opp of result.opportunities) counts.set(opp.type, (counts.get(opp.type) ?? 0) + 1);
  for (const [type, count] of counts) {
    assert.ok(count <= config.output.maxPerType, `${type} exceeded the per-type cap`);
  }
});

test("findings are ordered by score, strongest first", () => {
  const { result } = run(FIXTURE_DATASET);
  const scores = result.opportunities.map((o) => o.score);
  assert.deepEqual(scores, [...scores].sort((a, b) => b - a));
});

test("trimmed findings are disclosed rather than silently dropped", () => {
  const { result } = run(FIXTURE_DATASET);
  assert.ok(result.candidateCount > result.opportunities.length);
  assert.ok(result.notes.some((n) => /cap|threshold/.test(n)), "the report must say what was left out and why");
});
