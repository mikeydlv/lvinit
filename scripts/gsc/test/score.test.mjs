import test from "node:test";
import assert from "node:assert/strict";

import {
  sizeComponent,
  positionPotentialComponent,
  ctrGapComponent,
  momentumComponent,
  actionabilityComponent,
  confidenceFor,
  scoreOpportunity,
  buildCtrBaseline,
  bandFor,
} from "../lib/score.mjs";
import { testConfig } from "./helpers.mjs";

const config = testConfig();

test("size grows with impressions, saturates at the reference, and never exceeds 1", () => {
  assert.equal(sizeComponent(0, 400), 0);
  const small = sizeComponent(20, 400);
  const medium = sizeComponent(200, 400);
  const atRef = sizeComponent(400, 400);
  const huge = sizeComponent(40000, 400);
  assert.ok(small < medium && medium < atRef);
  assert.ok(Math.abs(atRef - 1) < 1e-9);
  assert.equal(huge, 1, "beyond the reference the component stays at 1");
});

test("size uses a log curve, so early growth matters more than late growth", () => {
  const earlyGain = sizeComponent(40, 400) - sizeComponent(20, 400);
  const lateGain = sizeComponent(320, 400) - sizeComponent(300, 400);
  assert.ok(earlyGain > lateGain, "20 -> 40 impressions should move the needle more than 300 -> 320");
});

test("position potential peaks at the sweet spot and is zero at the extremes", () => {
  const opts = { sweetSpot: 11, horizon: 45 };
  assert.equal(positionPotentialComponent(1, opts), 0, "position 1 has nothing left to win");
  assert.equal(positionPotentialComponent(11, opts), 1);
  assert.equal(positionPotentialComponent(45, opts), 0, "past the horizon it is not realistic yet");
  assert.equal(positionPotentialComponent(60, opts), 0);
  assert.ok(positionPotentialComponent(6, opts) > positionPotentialComponent(2, opts));
  assert.ok(positionPotentialComponent(20, opts) > positionPotentialComponent(40, opts));
});

test("position potential handles missing or nonsense positions", () => {
  const opts = { sweetSpot: 11, horizon: 45 };
  assert.equal(positionPotentialComponent(0, opts), 0);
  assert.equal(positionPotentialComponent(null, opts), 0);
  assert.equal(positionPotentialComponent(Number.NaN, opts), 0);
});

test("the CTR gap is zero without a trustworthy baseline — no benchmark is invented", () => {
  assert.equal(ctrGapComponent(0.001, null), 0);
  assert.equal(ctrGapComponent(0.001, 0), 0);
  assert.equal(ctrGapComponent(0.001, undefined), 0);
});

test("the CTR gap grows as CTR falls below LVINIT's own baseline", () => {
  assert.equal(ctrGapComponent(0.08, 0.08), 0, "at baseline there is no gap");
  assert.equal(ctrGapComponent(0.12, 0.08), 0, "above baseline there is no gap");
  assert.ok(Math.abs(ctrGapComponent(0.04, 0.08) - 0.5) < 1e-9);
  assert.equal(ctrGapComponent(0, 0.08), 1);
});

test("momentum is signed, and inverts for declining pages so a worse decline scores higher", () => {
  const opts = { saturation: 1 };
  assert.equal(momentumComponent(100, 100, opts), 0, "flat is zero");
  assert.equal(momentumComponent(200, 100, opts), 1, "doubling saturates");
  assert.equal(momentumComponent(50, 100, opts), 0, "a decline scores zero when growth is what we want");

  const declining = { saturation: 1, invert: true };
  assert.ok(momentumComponent(50, 100, declining) > 0);
  assert.ok(
    momentumComponent(20, 100, declining) > momentumComponent(80, 100, declining),
    "a steeper decline is more urgent"
  );
  assert.equal(momentumComponent(200, 100, declining), 0, "growth is not urgent for a losing-type finding");
});

test("a brand-new signal counts as full momentum, but nothing-to-nothing does not", () => {
  assert.equal(momentumComponent(50, 0, { saturation: 1 }), 1);
  assert.equal(momentumComponent(0, 0, { saturation: 1 }), 0);
});

test("cheap actions are more actionable than expensive ones", () => {
  assert.ok(actionabilityComponent("add-internal-links") > actionabilityComponent("create-new-content"));
  assert.ok(actionabilityComponent("optimize-existing-page") > actionabilityComponent("monitor-only"));
  assert.equal(actionabilityComponent("something-unknown"), 0.5, "an unknown kind falls back, it does not throw");
});

test("confidence tiers follow impression volume", () => {
  const base = { hasPreviousPeriod: true, config };
  assert.equal(confidenceFor({ ...base, currentImpressions: 500 }).level, "high");
  assert.equal(confidenceFor({ ...base, currentImpressions: 60 }).level, "medium");
  assert.equal(confidenceFor({ ...base, currentImpressions: 10 }).level, "low");
});

test("thin data adds an explicit caveat instead of quietly passing", () => {
  const thin = confidenceFor({ currentImpressions: 12, hasPreviousPeriod: true, config });
  assert.equal(thin.level, "low");
  assert.ok(thin.caveats.some((c) => /only 12 impressions/.test(c)));
});

test("a missing previous period downgrades high confidence and is stated", () => {
  const result = confidenceFor({ currentImpressions: 500, hasPreviousPeriod: false, config });
  assert.equal(result.level, "medium");
  assert.ok(result.caveats.some((c) => /previous period/.test(c)));
});

test("the thin-baseline caveat only appears where the baseline was actually used", () => {
  const irrelevant = confidenceFor({
    currentImpressions: 500,
    hasPreviousPeriod: true,
    baselineSufficient: false,
    baselineRelevant: false,
    config,
  });
  assert.equal(irrelevant.caveats.length, 0);

  const relevant = confidenceFor({
    currentImpressions: 500,
    hasPreviousPeriod: true,
    baselineSufficient: false,
    baselineRelevant: true,
    config,
  });
  assert.ok(relevant.caveats.some((c) => /CTR baseline/.test(c)));
});

test("scoring returns a 0-100 number with a breakdown that adds up", () => {
  const result = scoreOpportunity({
    type: "quick-win",
    components: {
      currentImpressions: 200,
      previousImpressions: 150,
      currentPosition: 11,
      currentCtr: 0.02,
      baselineCtr: 0.08,
      editorialRelevance: 1,
      intentDepth: 0.9,
      recommendationKind: "optimize-existing-page",
    },
    config,
  });
  assert.ok(result.score > 0 && result.score <= 100);
  const weightSum = result.breakdown.reduce((s, r) => s + r.weight, 0);
  const contributionSum = result.breakdown.reduce((s, r) => s + r.weight * r.value, 0);
  assert.ok(Math.abs((100 * contributionSum) / weightSum - result.score) < 0.11);
  assert.ok(result.breakdown.every((r) => r.value >= 0 && r.value <= 1));
});

test("a zero-weight component is excluded from the average entirely", () => {
  const result = scoreOpportunity({
    type: "emerging-query", // ctrGap has weight 0 for this type
    components: {
      currentImpressions: 100,
      previousImpressions: 0,
      currentPosition: 11,
      currentCtr: 0,
      baselineCtr: 0.08,
      editorialRelevance: 1,
      intentDepth: 1,
      recommendationKind: "create-new-content",
    },
    config,
  });
  assert.ok(!result.breakdown.some((r) => r.component === "ctrGap"));
});

test("a bigger opportunity outscores a smaller one, all else equal", () => {
  const make = (impressions) =>
    scoreOpportunity({
      type: "quick-win",
      components: {
        currentImpressions: impressions,
        previousImpressions: impressions,
        currentPosition: 11,
        currentCtr: 0.05,
        baselineCtr: 0.05,
        editorialRelevance: 0.8,
        intentDepth: 0.8,
        recommendationKind: "optimize-existing-page",
      },
      config,
    }).score;
  assert.ok(make(300) > make(30));
});

test("an off-topic query scores below an on-topic one with identical metrics", () => {
  const make = (relevance) =>
    scoreOpportunity({
      type: "content-gap",
      components: {
        currentImpressions: 100,
        previousImpressions: 50,
        currentPosition: 15,
        currentCtr: 0.02,
        baselineCtr: null,
        editorialRelevance: relevance,
        intentDepth: 0.5,
        recommendationKind: "create-new-content",
      },
      config,
    }).score;
  assert.ok(make(1) > make(0.1));
});

test("an unknown opportunity type is a programming error, not a silent zero", () => {
  assert.throws(
    () => scoreOpportunity({ type: "not-a-type", components: {}, config }),
    /No scoring weights configured/
  );
});

test("the CTR baseline uses LVINIT's own rows and refuses thin bands", () => {
  const rows = [
    { ctr: 0.10, impressions: 100, position: 8 },
    { ctr: 0.08, impressions: 100, position: 8.5 },
    { ctr: 0.07, impressions: 100, position: 9 },
    { ctr: 0.06, impressions: 100, position: 9.5 },
    { ctr: 0.05, impressions: 100, position: 7 },
    // only two rows in the 4-6 band — under minBaselineRows
    { ctr: 0.20, impressions: 100, position: 5 },
    { ctr: 0.18, impressions: 100, position: 4.5 },
  ];
  const baseline = buildCtrBaseline(rows, config);
  const band710 = baseline.get("7-10");
  assert.equal(band710.sufficient, true);
  assert.equal(band710.rows, 5);
  assert.ok(band710.ctr > 0 && band710.ctr <= 0.1);

  const band46 = baseline.get("4-6");
  assert.equal(band46.sufficient, false);
  assert.equal(band46.ctr, null, "an untrustworthy band must report null, not a guess");
});

test("the baseline is a weighted median, so one outlier cannot define it", () => {
  const rows = [
    { ctr: 0.9, impressions: 20, position: 8 }, // outlier: high CTR, few impressions
    { ctr: 0.05, impressions: 100, position: 8 },
    { ctr: 0.05, impressions: 100, position: 8 },
    { ctr: 0.05, impressions: 100, position: 8 },
    { ctr: 0.05, impressions: 100, position: 8 },
    { ctr: 0.05, impressions: 100, position: 8 },
  ];
  const baseline = buildCtrBaseline(rows, config);
  assert.equal(baseline.get("7-10").ctr, 0.05, "the outlier must not drag the baseline up");
});

test("an empty dataset produces no usable baseline bands", () => {
  const baseline = buildCtrBaseline([], config);
  for (const band of baseline.values()) {
    assert.equal(band.sufficient, false);
    assert.equal(band.ctr, null);
  }
});

test("positions map to the right bands, including the edges", () => {
  assert.equal(bandFor(1, config), "1-3");
  assert.equal(bandFor(3, config), "1-3");
  assert.equal(bandFor(3.1, config), "4-6");
  assert.equal(bandFor(10, config), "7-10");
  assert.equal(bandFor(10.1, config), "11-20");
  assert.equal(bandFor(85, config), "21+");
});
