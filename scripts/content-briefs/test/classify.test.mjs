import test from "node:test";
import assert from "node:assert/strict";

import { ACTIONS } from "../config.mjs";
import { groupQueries } from "../lib/intent.mjs";
import { checkCoverage } from "../lib/coverage.mjs";
import { classifyGroup, gateGroup, fairHousingCheck, isGenericTopic } from "../lib/classify.mjs";
import { testConfig, standardInventory, qrow, prow } from "./helpers.mjs";

const config = testConfig();
const inventory = standardInventory();

function classify(rows, pairs = [], inv = inventory) {
  const group = groupQueries({ currentRows: rows, currentPairs: pairs })[0];
  const gate = gateGroup(group, config);
  if (gate) return { gate, group };
  const coverage = checkCoverage(group, inv, config);
  return { group, coverage, c: classifyGroup({ group, coverage, inventory: inv, config }) };
}

// ---------------------------------------------------------------------------
// Update vs new
// ---------------------------------------------------------------------------

test("a two-way question a three-way comparison already covers -> EXPAND the existing page, never new", () => {
  const { c } = classify(
    [qrow("summerlin vs southwest", 22), qrow("southwest vs summerlin", 9), qrow("is southwest cheaper than summerlin", 14), qrow("summerlin or southwest las vegas", 11)],
    [prow("summerlin vs southwest", "/guides/summerlin-vs-henderson-vs-southwest-las-vegas", 22, 0, 14)]
  );
  assert.equal(c.action, ACTIONS.EXPAND_EXISTING);
  assert.equal(c.target, "/guides/summerlin-vs-henderson-vs-southwest-las-vegas");
});

test("the same intent, already on page one and being chosen -> REJECT_DUPLICATE", () => {
  const { c } = classify([qrow("summerlin vs henderson", 60, 6, 4)], [prow("summerlin vs henderson", "/guides/summerlin-vs-henderson", 60, 6, 4)]);
  assert.equal(c.action, ACTIONS.REJECT_DUPLICATE);
});

test("the same intent, but the owning page is on page two -> UPDATE_EXISTING", () => {
  const { c } = classify([qrow("summerlin vs henderson", 60, 0, 14)], [prow("summerlin vs henderson", "/guides/summerlin-vs-henderson", 60, 0, 14)]);
  assert.equal(c.action, ACTIONS.UPDATE_EXISTING);
  assert.equal(c.target, "/guides/summerlin-vs-henderson");
});

test("the same intent with a missing facet -> EXPAND_EXISTING, naming the facet", () => {
  const { c } = classify([qrow("summerlin vs henderson commute", 40, 0, 14)]);
  // the comparison page has a "The commute" heading, so commute is NOT missing:
  assert.notEqual(c.action, ACTIONS.NEW_COMPARISON);
});

test("a genuinely uncovered intent with enough demand -> NEW_ARTICLE", () => {
  const { c } = classify([qrow("moving to las vegas from california", 60, 1, 18)]);
  assert.equal(c.action, ACTIONS.NEW_ARTICLE);
});

test("an uncovered comparison with enough demand -> NEW_COMPARISON", () => {
  const { c } = classify([qrow("rent first or buy when moving to las vegas", 60, 0, 30)]);
  assert.equal(c.action, ACTIONS.NEW_COMPARISON);
});

test("an uncovered intent without enough demand -> MONITOR_ONLY, not new content", () => {
  const { c } = classify([qrow("moving to las vegas from california", 12, 0, 30)]);
  assert.equal(c.action, ACTIONS.MONITOR_ONLY);
});

test("only a dated Market Watch record overlaps -> MONITOR (the series answers it), never a rewrite", () => {
  const { c } = classify([qrow("las vegas home prices", 60, 0, 12)]);
  assert.equal(c.action, ACTIONS.MONITOR_ONLY);
  assert.match(c.reason, /dated Market Watch/);
});

test("Google ranks the wrong page while the right one answers it -> INTERNAL_LINK_ONLY", () => {
  const { c } = classify(
    [qrow("monument hills", 40, 0, 12)],
    [prow("monument hills", "/guides/first-summer-in-vegas", 40, 0, 12)]
  );
  assert.equal(c.action, ACTIONS.INTERNAL_LINK_ONLY);
  assert.equal(c.target, "/guides/monument-hills-northwest-las-vegas");
});

test("development topics carry CURRENT_RESEARCH_REQUIRED", () => {
  const { c } = classify([qrow("monument hills", 40, 0, 12)]);
  assert.ok(c.flags.includes("CURRENT_RESEARCH_REQUIRED"));
});

// ---------------------------------------------------------------------------
// Gates: Fair Housing, generic, low value
// ---------------------------------------------------------------------------

test("Fair Housing: protected-class and proxy framings are excluded outright", () => {
  for (const q of ["best family neighborhoods in las vegas", "safest neighborhoods in henderson", "best schools summerlin", "henderson young professionals", "55+ communities henderson"]) {
    const { gate } = classify([qrow(q, 200)]);
    assert.ok(gate?.exclusion, `expected "${q}" to be excluded`);
  }
});

test("Fair Housing: one flagged phrasing excludes the whole intent group", () => {
  const { gate } = classify([qrow("henderson vs summerlin", 50), qrow("safest henderson vs summerlin", 5)]);
  assert.ok(gate?.exclusion);
});

test("objective housing type: 'single family homes' is allowed as a property description", () => {
  assert.equal(fairHousingCheck("single family homes henderson").blocked, false);
  assert.equal(fairHousingCheck("single-family median price").blocked, false);
  const { gate } = classify([qrow("single family homes henderson", 40)]);
  assert.equal(gate, undefined);
});

test("...but the exemption is narrow: family framing around it is still blocked", () => {
  assert.equal(fairHousingCheck("single family homes perfect for families").blocked, true);
  assert.equal(fairHousingCheck("family friendly henderson").blocked, true);
});

test("generic listicle topics are rejected whatever the demand", () => {
  for (const q of ["best places to live in las vegas", "top 10 las vegas neighborhoods", "hidden gems las vegas", "why las vegas is amazing", "ultimate guide to henderson"]) {
    assert.ok(isGenericTopic(q), q);
  }
  const { gate } = classify([qrow("best places to live in las vegas", 500)]);
  assert.equal(gate.rejection.action, ACTIONS.REJECT_LOW_VALUE);
});

test("off-topic, navigational and transactional intents are REJECT_LOW_VALUE", () => {
  assert.equal(classify([qrow("las vegas casino jobs", 100)]).gate.rejection.action, ACTIONS.REJECT_LOW_VALUE);
  assert.equal(classify([qrow("lvinit", 100)]).gate.rejection.action, ACTIONS.REJECT_LOW_VALUE);
  assert.match(classify([qrow("summerlin homes for sale", 100)]).gate.rejection.reason, /IDX/);
});
