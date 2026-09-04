import test from "node:test";
import assert from "node:assert/strict";

import {
  splitSentences,
  extractFigures,
  hasFigure,
  detectSignals,
  classifySentence,
  fingerprint,
  extractClaims,
} from "../lib/claims.mjs";
import { categorize, detectJurisdiction } from "../lib/categories.mjs";
import { testConfig, TEST_TODAY, fixturePage } from "./helpers.mjs";

const config = testConfig();
const classify = (text) => classifySentence(text, { config, today: TEST_TODAY });

// ---------------------------------------------------------------------------
// Sentence splitting
// ---------------------------------------------------------------------------

test("sentences split without breaking decimals, dollars or abbreviations", () => {
  const text = "The median hit $480,000. Supply sat at 3.5 months on W Sahara Ave. Prices held.";
  assert.deepEqual(splitSentences(text), [
    "The median hit $480,000.",
    "Supply sat at 3.5 months on W Sahara Ave.",
    "Prices held.",
  ]);
});

test("empty and whitespace-only text yields no sentences", () => {
  assert.deepEqual(splitSentences(""), []);
  assert.deepEqual(splitSentences("   \n  "), []);
  assert.deepEqual(splitSentences(null), []);
});

// ---------------------------------------------------------------------------
// Figures
// ---------------------------------------------------------------------------

test("dollar figures are captured without trailing punctuation", () => {
  assert.deepEqual(extractFigures("the median was $490,000, up 1% from a year earlier").dollars, ["$490,000"]);
  assert.deepEqual(extractFigures("a $206 million expansion").dollars, ["$206 million"]);
});

test("percentages are captured whatever follows them", () => {
  assert.deepEqual(extractFigures("6.66% (Week of July 30, 2026)").percents, ["6.66%"]);
  assert.deepEqual(extractFigures("up 1% from a year earlier").percents, ["1%"]);
  assert.deepEqual(extractFigures("cut buying power by roughly 30 percent").percents, ["30 percent"]);
});

test("a number welded into a compound term is not a measurement", () => {
  const figures = extractFigures("Watch the 30-year fixed and the 60-day window.");
  assert.deepEqual(figures.measurableNumbers, []);
  assert.equal(hasFigure(figures), false, '"the 30-year fixed" names a product, it does not quote a rate');
});

test("a bare year is a reference point, not a figure", () => {
  const figures = extractFigures("waiting for a 2008-style discount");
  assert.equal(hasFigure(figures), false);
  assert.deepEqual(figures.years, [2008], "the year is still recorded, it just does not count as a measurement");
});

test("dates inside a sentence are found and normalized", () => {
  const dates = extractFigures("available only through December 31, 2025").dates;
  assert.equal(dates.length, 1);
  assert.equal(dates[0].iso, "2025-12-31");
});

// ---------------------------------------------------------------------------
// Signals
// ---------------------------------------------------------------------------

test("signals separate a hedged, self-dating claim from a bare assertion", () => {
  const hedged = detectSignals("As of July 2026, HOA dues run about $95 a month; confirm with the association.");
  assert.equal(hedged.hedged, true);
  assert.equal(hedged.selfDated, true);
  assert.equal(hedged.tellsReaderToVerify, true);

  const bare = detectSignals("HOA dues are $95 a month.");
  assert.equal(bare.hedged, false);
  assert.equal(bare.selfDated, false);
  assert.equal(bare.tellsReaderToVerify, false);
});

test("obligation and named-authority signals fire on real program language", () => {
  const signals = detectSignals("Household income must be at or below $147,300 under the Worker Advantage program.");
  assert.equal(signals.obligation, true);
  assert.equal(signals.namedAuthority, true);
});

// ---------------------------------------------------------------------------
// Classification — the whole point is what it REFUSES to flag
// ---------------------------------------------------------------------------

test("a time-sensitive factual claim is flagged", () => {
  const verdict = classify("The Worker Advantage Program provides $20,000 in down payment assistance.");
  assert.equal(verdict.kind, "claim");
  assert.equal(verdict.categories[0].key, "assistance-programs");
});

test("editorial opinion with no factual assertion is not a claim", () => {
  assert.equal(classify("Honestly, this is my favourite part of the valley to drive through.").kind, "opinion");
});

test("but an opinionated sentence carrying a figure IS still a claim", () => {
  const verdict = classify("Honestly, $490,000 for a median price feels high to me for this valley.");
  assert.equal(verdict.kind, "claim", "the brief is explicit: a factual assertion inside opinion still counts");
});

test("forward-looking guidance is not a claim", () => {
  const verdict = classify("A sustained move lower in rates would pull more buyers back into the market.");
  assert.equal(verdict.kind, "opinion");
  assert.match(verdict.reason, /forward-looking/);
  // The same sentence with an imperative opener is also left alone, by the
  // instruction rule rather than the speculation rule.
  assert.equal(classify("Watch the 30-year fixed: a sustained move lower would pull buyers back.").kind, "not-a-claim");
});

test("an instruction to the reader is not a claim", () => {
  const verdict = classify("Find out what is zoned for them before you buy.");
  assert.equal(verdict.kind, "not-a-claim");
  assert.match(verdict.reason, /instruction/);
});

test("settled history is not a claim", () => {
  const verdict = classify("The land was purchased in 1952 and the first village opened in 1990.");
  assert.equal(verdict.kind, "historical");
});

test("history plus a current figure IS a claim — the current half can move", () => {
  const verdict = classify("Starter home prices have more than doubled since 2016, reaching $312,141 in July 2026.");
  assert.equal(verdict.kind, "claim");
});

test("durable geography is not a claim", () => {
  assert.equal(classify("It sits between two washes on the western edge of the valley.").kind, "durable");
});

test("prose matching no fact category is not a claim", () => {
  assert.equal(classify("The coffee shop on the corner is where the regulars gather.").kind, "not-a-claim");
});

test("a page full of numbers that are all durable or historical flags nothing", () => {
  const sentences = [
    "The community covers 22,500 acres on the western edge of the valley.",
    "The land was purchased in 1952 and named in 1988.",
    "It sits about nine miles from the Strip.",
  ];
  const kinds = sentences.map((s) => classify(s).kind);
  assert.ok(!kinds.includes("claim"), `expected nothing flagged, got ${kinds.join(", ")}`);
});

test("fragments and run-ons are rejected on length alone", () => {
  assert.equal(classify("Prices fell.").kind, "not-a-claim");
  assert.equal(classify(`The median was $480,000. ${"and it kept going ".repeat(40)}`).kind, "not-a-claim");
});

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

test("a specific category beats a generic one", () => {
  const matches = categorize("HOA dues run $95 a month.", { hasFigure: true });
  assert.equal(matches[0].key, "hoa-fees", "not the generic fee-or-rate-figure catch-all");
});

test("master-planned does not read as a project status", () => {
  const matches = categorize("One of the master-planned communities that keeps drawing buyers.", { hasFigure: false });
  assert.ok(!matches.some((c) => c.key === "project-status"));
});

test("a bare mention of zoning is not a zoning-approval claim", () => {
  const matches = categorize("Henderson runs its own building permits and its own zoning.", { hasFigure: false });
  assert.ok(!matches.some((c) => c.key === "development-approval-and-zoning"));

  const real = categorize("Commissioners were scheduled to consider the rezoning request.", { hasFigure: false });
  assert.ok(real.some((c) => c.key === "development-approval-and-zoning"));
});

test("jurisdiction is tagged separately from the category", () => {
  assert.equal(detectJurisdiction("a Clark County rule").key, "clark-county");
  assert.equal(detectJurisdiction("the City of Henderson code").key, "henderson");
  assert.equal(detectJurisdiction("an FHA loan").key, "federal");
  assert.equal(detectJurisdiction("the coffee shop on the corner"), null);
});

// ---------------------------------------------------------------------------
// Fingerprints and extraction
// ---------------------------------------------------------------------------

test("a fingerprint is stable across runs and cosmetic punctuation changes", () => {
  const a = fingerprint({ route: "/guides/x", categoryKey: "home-prices", text: "The median was $480,000." });
  const b = fingerprint({ route: "/guides/x", categoryKey: "home-prices", text: "The median was $480,000." });
  const curly = fingerprint({ route: "/guides/x", categoryKey: "home-prices", text: "The median was $480,000—." });
  assert.equal(a, b);
  assert.equal(a.length, 12);
  assert.equal(a, curly, "an em dash is not a different claim");
});

test("a fingerprint changes when the route, category or wording changes", () => {
  const base = { route: "/guides/x", categoryKey: "home-prices", text: "The median was $480,000." };
  assert.notEqual(fingerprint(base), fingerprint({ ...base, route: "/guides/y" }));
  assert.notEqual(fingerprint(base), fingerprint({ ...base, categoryKey: "rents" }));
  assert.notEqual(fingerprint(base), fingerprint({ ...base, text: "The median was $490,000." }));
});

test("an empty page produces no claims and no errors", () => {
  const page = fixturePage("/guides/fixture-empty", config);
  const { claims, reviewed } = extractClaims({ page, config, today: TEST_TODAY });
  assert.deepEqual(claims, []);
  assert.equal(reviewed, 0);
});

test("a page of pure opinion and history produces no claims", () => {
  const page = fixturePage("/guides/fixture-opinion-piece", config);
  const { claims, reviewed, buckets } = extractClaims({ page, config, today: TEST_TODAY });
  assert.deepEqual(claims, [], "opinion, geography and settled history must all be left alone");
  assert.ok(reviewed > 0, "but the sentences were still read");
  assert.ok(buckets.opinion > 0);
});

test("Development Watch entries become structured claims carrying their source", () => {
  const page = fixturePage("/neighborhoods/fixture-village", config);
  const { claims } = extractClaims({ page, config, today: TEST_TODAY });
  const project = claims.find((c) => c.structured?.name === "Fixture Commons apartments");
  assert.ok(project);
  assert.equal(project.structured.status, "planned");
  assert.equal(project.structured.source.url, "https://example-fixture-news.com/fixture-commons");
  assert.equal(project.category.key, "project-status");
});

test("a project's caveat date is read, so a passed hearing date is visible", () => {
  const page = fixturePage("/neighborhoods/fixture-village", config);
  const { claims } = extractClaims({ page, config, today: TEST_TODAY });
  const project = claims.find((c) => c.structured?.name === "Fixture Commons apartments");
  assert.ok(project.figures.dates.some((d) => d.iso === "2026-03-02"));
  assert.equal(project.signals.scheduledEventContext, true);
});

test("duplicate claims on one page collapse to a single finding", () => {
  const page = fixturePage("/guides/fixture-down-payment-help-2025", config);
  const { claims } = extractClaims({ page, config, today: TEST_TODAY });
  const prints = claims.map((c) => c.fingerprint);
  assert.equal(new Set(prints).size, prints.length);
});

test("an excluded category is never emitted", () => {
  const excluded = testConfig({ content: { excludeCategories: ["assistance-programs"] } });
  const page = fixturePage("/guides/fixture-down-payment-help-2025", excluded);
  const { claims } = extractClaims({ page, config: excluded, today: TEST_TODAY });
  assert.ok(!claims.some((c) => c.category.key === "assistance-programs"));
});
