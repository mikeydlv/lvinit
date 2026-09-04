import test from "node:test";
import assert from "node:assert/strict";

import { checkFairHousing, isGenericFiller, partitionByFairHousing } from "../lib/fair-housing.mjs";

test("the exact examples Mikey named are blocked", () => {
  const named = [
    "best neighborhoods for families",
    "safest las vegas neighborhoods",
    "best schools neighborhoods las vegas",
    "best areas for young professionals in las vegas",
  ];
  for (const query of named) {
    const verdict = checkFairHousing(query);
    assert.equal(verdict.blocked, true, `"${query}" must be blocked`);
    assert.ok(verdict.category, "a blocked query must say which category tripped");
    assert.ok(verdict.reason.length > 20, "a blocked query must carry a readable reason");
  }
});

test("each protected-class category is actually reachable", () => {
  const cases = {
    "familial-status": "family friendly neighborhoods henderson",
    "schools-as-ranking": "best schools in summerlin",
    "safety-and-crime": "crime rate north las vegas",
    "race-ethnicity-national-origin": "hispanic neighborhoods las vegas",
    religion: "neighborhoods near a mormon church las vegas",
    age: "55+ communities in henderson",
    disability: "wheelchair accessible homes las vegas",
    "sex-gender-orientation": "lgbt friendly neighborhoods las vegas",
    "income-and-status-proxy": "section 8 housing las vegas",
  };
  for (const [category, query] of Object.entries(cases)) {
    const verdict = checkFairHousing(query);
    assert.equal(verdict.blocked, true, `"${query}" must be blocked`);
    assert.equal(verdict.category, category, `"${query}" should trip the ${category} rule`);
  }
});

test("coded proxies are blocked even when they sound harmless", () => {
  for (const query of ["good area to live in las vegas", "up and coming safe areas", "nice area henderson nv"]) {
    assert.equal(checkFairHousing(query).blocked, true, `"${query}" must be blocked`);
  }
});

test("legitimate LVINIT topics are NOT blocked", () => {
  const allowed = [
    "summerlin vs henderson",
    "moving to las vegas from california",
    "cost of living in las vegas 2026",
    "new construction vs resale las vegas",
    "commute from summerlin to the strip",
    "nevada property tax abatement resale",
    "rent first or buy when moving to las vegas",
    "hoa fees southwest las vegas",
    "lot sizes in mountains edge",
    "what is it like living in henderson",
  ];
  for (const query of allowed) {
    assert.equal(checkFairHousing(query).blocked, false, `"${query}" must NOT be blocked`);
  }
});

test("word boundaries stop innocent substrings from tripping the filter", () => {
  // "familiar" contains "famil", "preschool" contains "school", "safeway" contains "safe".
  assert.equal(checkFairHousing("familiar las vegas landmarks").blocked, false);
  assert.equal(checkFairHousing("preschool tuition las vegas").blocked, false);
  assert.equal(checkFairHousing("safeway near uncommons").blocked, false);
});

test("a plain mention of schools is allowed; ranking areas BY schools is not", () => {
  assert.equal(checkFairHousing("clark county school district calendar").blocked, false);
  assert.equal(checkFairHousing("best school district in las vegas").blocked, true);
});

test("the filter is case-insensitive", () => {
  assert.equal(checkFairHousing("SAFEST Neighborhoods In Henderson").blocked, true);
});

test("empty and non-string input is handled without throwing", () => {
  assert.equal(checkFairHousing("").blocked, false);
  assert.equal(checkFairHousing(null).blocked, false);
  assert.equal(checkFairHousing(undefined).blocked, false);
});

test("generic listicle filler is flagged separately from Fair Housing", () => {
  assert.equal(isGenericFiller("best places to live in las vegas"), true);
  assert.equal(isGenericFiller("top 10 las vegas suburbs"), true);
  assert.equal(isGenericFiller("ultimate guide to moving"), true);
  assert.equal(isGenericFiller("summerlin vs henderson"), false);
  // Generic filler is an editorial judgement, not a compliance block.
  assert.equal(checkFairHousing("best places to live in las vegas").blocked, false);
});

test("partitioning separates allowed rows from excluded ones and keeps the verdict", () => {
  const rows = [
    { query: "summerlin vs henderson", impressions: 100 },
    { query: "safest neighborhoods in henderson", impressions: 50 },
    { query: "cost of living las vegas", impressions: 30 },
  ];
  const { allowed, excluded } = partitionByFairHousing(rows);
  assert.deepEqual(allowed.map((r) => r.query), ["summerlin vs henderson", "cost of living las vegas"]);
  assert.equal(excluded.length, 1);
  assert.equal(excluded[0].fairHousing.category, "safety-and-crime");
  assert.equal(excluded[0].impressions, 50, "the original row data survives the partition");
});
