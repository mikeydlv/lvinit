import test from "node:test";
import assert from "node:assert/strict";

import { analyzeQuery, classifyNavigational, extractEntities, groupQueries, normalizeQuery, partitionNavigational } from "../lib/intent.mjs";
import { qrow, prow } from "./helpers.mjs";

// ---------------------------------------------------------------------------
// Intent normalization
// ---------------------------------------------------------------------------

test("normalization lowercases, folds punctuation, and strips years but remembers them", () => {
  const n = normalizeQuery("Moving to Las Vegas from California (2026)?");
  assert.equal(n.text, "moving to las vegas from california");
  assert.deepEqual(n.years, ["2026"]);
});

test("a comparison is keyed on what is compared, not on word order", () => {
  assert.equal(analyzeQuery("summerlin vs southwest").key, analyzeQuery("southwest vs summerlin").key);
  assert.equal(analyzeQuery("summerlin vs southwest").key, "comparison:place:southwest+place:summerlin");
});

test("'cheaper than' and 'or' are comparisons too, with the cost angle kept as a facet", () => {
  const cheaper = analyzeQuery("is southwest cheaper than summerlin");
  assert.equal(cheaper.shape, "comparison");
  assert.equal(cheaper.key, "comparison:place:southwest+place:summerlin");
  assert.deepEqual(cheaper.facets, ["facet:cost"]);
  assert.equal(analyzeQuery("summerlin or southwest las vegas").key, cheaper.key);
});

test("community names fold into their place", () => {
  assert.deepEqual(analyzeQuery("mountains edge homes").places, ["place:southwest"]);
  assert.deepEqual(analyzeQuery("green valley henderson").places, ["place:henderson"]);
});

test("north las vegas is its own place, not 'las vegas' plus a direction", () => {
  const a = analyzeQuery("living in north las vegas");
  assert.deepEqual(a.places, ["place:north-las-vegas"]);
});

test("topic intents keep facets in the key — different questions about one place stay apart", () => {
  assert.notEqual(analyzeQuery("henderson property tax").key, analyzeQuery("henderson commute").key);
});

test("decision concepts form comparisons: new vs resale, rent vs buy", () => {
  assert.equal(analyzeQuery("new construction vs resale las vegas").key, "comparison:concept:new-construction+concept:resale");
  const rent = analyzeQuery("rent first or buy when moving to las vegas");
  assert.equal(rent.key, "comparison:concept:buy+concept:rent");
  assert.equal(rent.cluster, "rent-vs-buy");
});

test("starter-home pricing and a price forecast are different intents", () => {
  assert.notEqual(analyzeQuery("las vegas starter home prices").key, analyzeQuery("will las vegas home prices drop").key);
});

test("development subjects are recognised and flagged", () => {
  const a = analyzeQuery("monument hills las vegas");
  assert.deepEqual(a.subjects, ["subject:monument-hills"]);
  assert.equal(a.development, true);
  assert.equal(a.cluster, "development");
});

test("LVINIT's own named subjects are relevant even when the GSC keyword list does not know them", () => {
  assert.ok(analyzeQuery("monument hills las vegas").relevance >= 0.8);
  assert.ok(analyzeQuery("las vegas casino jobs").relevance <= 0.2, "off-topic stays capped");
});

// ---------------------------------------------------------------------------
// Query grouping
// ---------------------------------------------------------------------------

test("four phrasings of one comparison become ONE group with all four queries attached", () => {
  const groups = groupQueries({
    currentRows: [qrow("summerlin vs southwest", 22), qrow("southwest vs summerlin", 9), qrow("is southwest cheaper than summerlin", 14), qrow("summerlin or southwest las vegas", 11)],
  });
  assert.equal(groups.length, 1);
  assert.equal(groups[0].queries.length, 4);
  assert.equal(groups[0].metrics.impressions, 56);
  assert.equal(groups[0].leadQuery, "summerlin vs southwest");
  assert.deepEqual(groups[0].facets, ["facet:cost"]);
});

test("group metrics are CALCULATED from raw query rows; each query keeps its raw metrics untouched", () => {
  const [g] = groupQueries({ currentRows: [qrow("summerlin vs southwest", 30, 3, 10), qrow("southwest vs summerlin", 10, 0, 20)] });
  assert.equal(g.metrics.impressions, 40);
  assert.equal(g.metrics.clicks, 3);
  assert.equal(g.metrics.position, 12.5, "impression-weighted position");
  assert.match(g.metrics.scope, /calculated/);
  assert.deepEqual(g.queries[0].raw, { clicks: 3, impressions: 30, ctr: 0.1, position: 10 });
});

test("previous-window demand is attached, including queries only seen last period", () => {
  const [g] = groupQueries({
    currentRows: [qrow("summerlin vs southwest", 20)],
    previousRows: [qrow("summerlin vs southwest", 6), qrow("southwest vs summerlin", 4)],
  });
  assert.equal(g.metrics.previousImpressions, 10);
  assert.equal(g.metrics.hasPreviousPeriod, true);
});

test("no previous data is null, never zero", () => {
  const [g] = groupQueries({ currentRows: [qrow("summerlin vs southwest", 20)] });
  assert.equal(g.metrics.previousImpressions, null);
  assert.equal(g.metrics.hasPreviousPeriod, false);
});

test("page aggregation stays separate: ranking pages come from query+page rows only", () => {
  const [g] = groupQueries({
    currentRows: [qrow("summerlin vs southwest", 20)],
    currentPairs: [prow("summerlin vs southwest", "/guides/a", 15, 0, 9), prow("summerlin vs southwest", "/guides/b", 5, 0, 20), prow("unrelated", "/guides/c", 99)],
  });
  assert.deepEqual(g.rankingPages.map((p) => p.route), ["/guides/a", "/guides/b"]);
  assert.equal(g.metrics.impressions, 20, "query-dimension total is not replaced by pair totals");
});

test("intent clarity drops when grouped phrasings ask different things", () => {
  const [clear] = groupQueries({ currentRows: [qrow("summerlin vs southwest", 20), qrow("southwest vs summerlin", 20)] });
  assert.equal(clear.intentClarity, 1);
});

test("unrelated generic queries do not merge into one blob", () => {
  const groups = groupQueries({ currentRows: [qrow("las vegas weather", 10), qrow("las vegas zip", 10)] });
  assert.equal(groups.length, 2);
});

// ---------------------------------------------------------------------------
// Navigational / address queries
//
// A road in a query is not noise by itself. Only an address or street LOOKUP
// is set aside, and only when nothing in the query is about transport,
// development, access or a neighborhood.
// ---------------------------------------------------------------------------

const navVerdict = (q) => {
  const { text } = normalizeQuery(q);
  return classifyNavigational(text, extractEntities(text).entities);
};

test("address and street lookups are classified as navigational", () => {
  for (const q of ["summerlin avenue", "summerlin rd", "1234 summerlin avenue", "2150 water street"]) {
    const v = navVerdict(q);
    assert.ok(v, `expected "${q}" to be navigational`);
    assert.equal(v.code, "NAVIGATIONAL_STREET_QUERY");
  }
  assert.equal(navVerdict("1234 summerlin avenue").kind, "address lookup");
  assert.equal(navVerdict("summerlin avenue").kind, "street lookup");
  assert.equal(navVerdict("summerlin avenue las vegas").code, "NAVIGATIONAL_STREET_QUERY", "a trailing city does not change the lookup");
});

test("legitimate place, neighborhood, development, transport and access queries are KEPT", () => {
  for (const q of [
    "where is summerlin",
    "summerlin nv neighborhood guide",
    "summerlin las vegas map",
    "summerlin parkway traffic",
    "road construction summerlin",
    "charleston boulevard redevelopment",
    "i-15 construction las vegas",
    "water street district henderson",
    "summerlin area",
    "homes on summerlin parkway",
    "st rose parkway closure",
    "boulder highway redevelopment",
    "rtc route to summerlin",
  ]) {
    assert.equal(navVerdict(q), null, `expected "${q}" to be kept`);
  }
});

test("a navigational query is set aside before grouping, with its raw row preserved", () => {
  const rows = [qrow("summerlin nv neighborhood guide", 5), qrow("summerlin avenue", 2, 0, 52), qrow("where is summerlin", 3)];
  const { editorial, navigational } = partitionNavigational(rows);
  assert.deepEqual(editorial.map((r) => r.query), ["summerlin nv neighborhood guide", "where is summerlin"]);
  assert.equal(navigational.length, 1);
  assert.deepEqual(navigational[0].raw, { clicks: 0, impressions: 2, ctr: 0, position: 52 }, "raw GSC data is preserved for audit");
  assert.equal(navigational[0].code, "NAVIGATIONAL_STREET_QUERY");
});

test("street lookups never reach a group, so they cannot inflate demand or dilute clarity", () => {
  const rows = [qrow("summerlin nv neighborhood guide", 5), qrow("where is summerlin", 3), qrow("summerlin rd", 2), qrow("summerlin avenue", 2)];
  const { editorial } = partitionNavigational(rows);
  const groups = groupQueries({ currentRows: editorial });
  assert.equal(groups.length, 1);
  assert.equal(groups[0].metrics.impressions, 8, "only the editorial queries count");
  assert.equal(groups[0].queries.length, 2);
});
