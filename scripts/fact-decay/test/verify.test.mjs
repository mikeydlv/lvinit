import test from "node:test";
import assert from "node:assert/strict";

import {
  createVerifier,
  htmlToText,
  titleFromHtml,
  declaredDateFromHtml,
  normalizeLastModified,
  matchFigures,
  findConflictingValues,
  loadCache,
  MANUAL_MARKER,
  VERIFICATION_RESULTS,
} from "../lib/verify.mjs";
import { classifySource, supportingSourceFor, describeHierarchy, hostOf } from "../lib/sources.mjs";
import { createFixtureFetch, FIXTURE_RESPONSES } from "../fixtures/fixture-sources.mjs";
import { CATEGORY_BY_KEY } from "../lib/categories.mjs";
import { testConfig, TEST_TODAY } from "./helpers.mjs";

const offlineConfig = testConfig();
const onlineConfig = testConfig({ verification: { enabled: true, perHostDelayMs: 0 } });

function verifier(config = onlineConfig, fetchImpl = createFixtureFetch()) {
  return createVerifier({ config, today: TEST_TODAY, fetchImpl, cache: { version: 1, entries: {} } });
}

function claimOf({ categoryKey = "assistance-programs", figures = {}, structured = null, text = "a test claim" } = {}) {
  return {
    text,
    heading: null,
    category: CATEGORY_BY_KEY.get(categoryKey),
    figures: { dollars: [], percents: [], numbers: [], measurableNumbers: [], dates: [], years: [], ...figures },
    signals: { timeMarkers: [] },
    structured,
  };
}

const sourceOf = (url, origin = "attached to the claim") => ({
  label: "test source",
  url,
  origin,
  classification: classifySource(url, onlineConfig),
});

// ---------------------------------------------------------------------------
// The boundary between analysis and evidence
// ---------------------------------------------------------------------------

test("a default run makes no network request at all", async () => {
  const v = createVerifier({
    config: offlineConfig,
    today: TEST_TODAY,
    fetchImpl: async () => {
      throw new Error("a detection-only run must never fetch");
    },
  });
  const result = await v.verifyClaim({ claim: claimOf(), supporting: sourceOf("https://example.gov/x"), priority: 99 });
  assert.equal(result.result, "not-attempted");
  assert.match(result.reason, /not enabled for this run/);
  assert.equal(v.stats.fetches, 0);
});

test("every result the verifier can produce is in the declared vocabulary", async () => {
  const v = verifier();
  const results = [];
  for (const url of Object.keys(FIXTURE_RESPONSES)) {
    const r = await v.verifyClaim({ claim: claimOf({ figures: { dollars: ["$20,000"] } }), supporting: sourceOf(url), priority: 99 });
    results.push(r.result);
  }
  for (const r of results) assert.ok(VERIFICATION_RESULTS.includes(r), `unexpected result "${r}"`);
});

test("a claim with no cited source is marked for a human, never guessed at", async () => {
  const result = await verifier().verifyClaim({ claim: claimOf(), supporting: null, priority: 99 });
  assert.equal(result.result, "manual-check-required");
  assert.equal(result.marker, MANUAL_MARKER);
  assert.match(result.reason, /no web-search capability/);
});

test("claims below the verification threshold are skipped, not invented", async () => {
  const v = verifier();
  const result = await v.verifyClaim({ claim: claimOf(), supporting: sourceOf("https://example-fixture-news.com/fixture-grand-park"), priority: 1 });
  assert.equal(result.result, "not-attempted");
  assert.equal(v.stats.fetches, 0);
});

// ---------------------------------------------------------------------------
// Figure comparison
// ---------------------------------------------------------------------------

test("figures are matched across the ways a source might write them", () => {
  const text = "the benefit is 25,000 dollars and the rate is 6.5 percent";
  const { found, missing } = matchFigures({ dollars: ["$25,000"], percents: ["6.5%"] }, text);
  assert.deepEqual(found.sort(), ["$25,000", "6.5%"]);
  assert.deepEqual(missing, []);
});

// ---------------------------------------------------------------------------
// The contradiction bar: an absence is NOT a disagreement
// ---------------------------------------------------------------------------

test("a source stating a DIFFERENT value for the same thing is a contradiction", async () => {
  const result = await verifier().verifyClaim({
    claim: claimOf({
      text: "The Fixture Worker Advantage Program provides $20,000 in down payment assistance to eligible Nevada workers.",
      figures: { dollars: ["$20,000"] },
    }),
    supporting: sourceOf("https://example-fixture-housing.nv.gov/worker-advantage"),
    priority: 99,
  });
  assert.equal(result.result, "contradicts");
  assert.equal(result.conflicts.length, 1);
  assert.equal(result.conflicts[0].pageValue, "$20,000");
  assert.equal(result.conflicts[0].sourceValue, "$25,000");
  assert.match(result.reason, /states a different figure for the same thing/);
  assert.match(result.reason, /the page says \$20,000, the source says \$25,000/);
  assert.equal(result.record.datePublishedOrUpdated, "2026-07-01");
  assert.equal(result.record.sourceType, "Official government source");
  assert.ok(result.record.dateAccessed);
});

test("a figure simply MISSING from the source is value-not-found, not a contradiction", async () => {
  const result = await verifier().verifyClaim({
    claim: claimOf({
      categoryKey: "hoa-fees",
      text: "Homeowners association dues in the fixture community are $95 a month and cover amenities, water and common-area upkeep.",
      figures: { dollars: ["$95"] },
    }),
    supporting: sourceOf("https://example-fixture-housing.nv.gov/hoa-guidance"),
    priority: 99,
  });
  assert.equal(result.result, "value-not-found", "the source states no dues figure at all — that is an absence");
  assert.deepEqual(result.conflicts, []);
  assert.match(result.reason, /could not be found/);
  assert.match(result.reason, /does not state a different figure/);
  assert.doesNotMatch(result.reason, /revised/, "the agent must not speculate that the number changed");
});

test("a different value elsewhere on the page does NOT count without shared context", () => {
  const conflicts = findConflictingValues({
    missing: ["$20,000"],
    claimText: "The Worker Advantage Program provides $20,000 in down payment assistance to eligible Nevada workers.",
    sourceText:
      "Parking permits for the visitor lot cost $25,000 each year. Bicycle racks were installed near the north " +
      "entrance last spring, and the lobby was repainted at the same time.",
  });
  assert.deepEqual(conflicts, [], "an unrelated dollar figure is a coincidence, not a contradiction");
});

test("a conflicting value must match the unit as well as the subject", () => {
  const conflicts = findConflictingValues({
    missing: ["$20,000"],
    claimText: "The Worker Advantage Program provides $20,000 in down payment assistance to eligible Nevada workers.",
    sourceText: "The Worker Advantage Program provides assistance to eligible Nevada workers at a 3.5% rate.",
  });
  assert.deepEqual(conflicts, [], "a percentage is not a different dollar amount");
});

test("a shared phrase on one side of the number is not enough", () => {
  // Real false positive this rule exists to kill: "the down payment on a $500K
  // home" and "providing $20,000 in down payment assistance" share the phrase
  // "down payment", which appears in every other sentence of a down-payment
  // article — and they measure completely different things.
  const conflicts = findConflictingValues({
    missing: ["$500K"],
    claimText:
      "the down payment on a $500K home with, say, an FHA loan is roughly $17,500, not the $100,000 that 20% would imply",
    sourceText:
      "The program is designed to help essential workers purchase a primary residence in Nevada by providing " +
      "$20,000 in down payment assistance. Backed by $18 million in available funding.",
  });
  assert.deepEqual(conflicts, [], "the label must line up on BOTH sides of the figure");
});

test("two different measures on the same programme page are not a conflict", () => {
  const conflicts = findConflictingValues({
    missing: ["$7,500"],
    claimText: "Home Is Possible for Teachers offers $7,500 usable toward down payment and closing costs.",
    sourceText: "Qualifying income up to $165,000 and a home price up to $832,750 apply to this program.",
  });
  assert.deepEqual(conflicts, [], "a benefit amount and an income cap are not the same measure");
});

test("the same measure with a revised value IS a conflict, even across rewording", () => {
  const conflicts = findConflictingValues({
    missing: ["6.69%"],
    claimText: "Freddie Mac put the 30-year fixed average at 6.69% for the week of August 6, 2026.",
    sourceText: "The 30-year fixed-rate mortgage averaged 6.71% for the week ending September 3, 2026.",
  });
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].sourceValue, "6.71%");
  assert.ok(conflicts[0].sharedTerms.includes("average"), "\"average\" and \"averaged\" are the same label word");
});

test("a figure with no label on one side cannot support a contradiction", () => {
  const conflicts = findConflictingValues({
    missing: ["$20,000"],
    claimText: "$20,000",
    sourceText: "The programme provides $25,000 in assistance to eligible workers.",
  });
  assert.deepEqual(conflicts, [], "with nothing around the number, there is no way to know what it measures");
});

test("the conflict threshold is configurable and raising it makes contradictions rarer", () => {
  const args = {
    missing: ["$20,000"],
    claimText: "The Worker Advantage Program provides $20,000 in assistance.",
    sourceText: "The Worker Advantage Program provides $25,000 in assistance.",
  };
  assert.equal(findConflictingValues({ ...args, minSharedTerms: 2 }).length, 1);
  assert.equal(findConflictingValues({ ...args, minSharedTerms: 99 }).length, 0);
});

test("a removed source is unreachable, not a contradiction — it says nothing at all", async () => {
  const result = await verifier().verifyClaim({
    claim: claimOf({ figures: { dollars: ["$1"] } }),
    supporting: sourceOf("https://example-fixture-news.com/removed-article"),
    priority: 99,
  });
  assert.equal(result.result, "source-unreachable");
  assert.match(result.reason, /gone \(HTTP 404\)/);
  assert.match(result.reason, /says nothing about whether the claim is still true/);
});

test("a confirmation says plainly that it is a presence check, not comprehension", async () => {
  const result = await verifier().verifyClaim({
    claim: claimOf({
      text: "The minimum credit score is 640 for the Fixture Worker Advantage Program.",
      figures: { measurableNumbers: ["640"], percents: [] },
    }),
    supporting: sourceOf("https://example-fixture-housing.nv.gov/worker-advantage"),
    priority: 99,
  });
  assert.equal(result.result, "cannot-verify", "a bare integer is not a dollar figure or a percentage");
  assert.match(result.reason, /nothing for an automated presence check to match/);
});

test("a claim with no figures cannot be presence-checked, and says so", async () => {
  const result = await verifier().verifyClaim({
    claim: claimOf({ text: "The program is open to healthcare and education workers across Nevada." }),
    supporting: sourceOf("https://example-fixture-housing.nv.gov/worker-advantage"),
    priority: 99,
  });
  assert.equal(result.result, "cannot-verify");
});

// ---------------------------------------------------------------------------
// Project status
// ---------------------------------------------------------------------------

test("a project the source says has broken ground contradicts a planned status", async () => {
  const result = await verifier().verifyClaim({
    claim: claimOf({
      categoryKey: "project-status",
      text: "Fixture Commons apartments is listed as planned or proposed.",
      structured: { kind: "development-project", name: "Fixture Commons apartments", status: "planned" },
    }),
    supporting: sourceOf("https://example-fixture-news.com/fixture-commons"),
    priority: 99,
  });
  assert.equal(result.result, "contradicts", "the source mentions approval AND construction — the furthest stage wins");
  assert.match(result.reason, /under construction/);
});

test("a project whose source still says open confirms", async () => {
  const result = await verifier().verifyClaim({
    claim: claimOf({
      categoryKey: "project-status",
      text: "Fixture Grand Park phase one is listed as open now.",
      structured: { kind: "development-project", name: "Fixture Grand Park phase one", status: "open" },
    }),
    supporting: sourceOf("https://example-fixture-news.com/fixture-grand-park"),
    priority: 99,
  });
  assert.equal(result.result, "confirms");
});

// ---------------------------------------------------------------------------
// Failure modes — none of which may fabricate a result
// ---------------------------------------------------------------------------

test("bot protection is reported as MANUAL_SOURCE_CHECK_REQUIRED, with the reason", async () => {
  const result = await verifier().verifyClaim({
    claim: claimOf({ figures: { dollars: ["$1"] } }),
    supporting: sourceOf("https://example-fixture-county.gov/projects"),
    priority: 99,
  });
  assert.equal(result.result, "manual-check-required");
  assert.equal(result.marker, MANUAL_MARKER);
  assert.match(result.reason, /bot protection or authentication/);
});

test("a JavaScript-only page concludes nothing", async () => {
  const result = await verifier().verifyClaim({
    claim: claimOf({ figures: { percents: ["6.66%"] } }),
    supporting: sourceOf("https://example-fixture-spa.com/rates"),
    priority: 99,
  });
  assert.equal(result.result, "manual-check-required");
  assert.match(result.reason, /rendered in the browser by JavaScript/);
});

test("a server error is unreachable, not wrong", async () => {
  const result = await verifier().verifyClaim({
    claim: claimOf({ figures: { dollars: ["$1"] } }),
    supporting: sourceOf("https://example-fixture-news.com/broken"),
    priority: 99,
  });
  assert.equal(result.result, "source-unreachable");
});

test("a network failure is reported, not swallowed and not guessed", async () => {
  const failing = verifier(onlineConfig, async () => {
    throw new Error("ECONNRESET");
  });
  const result = await failing.verifyClaim({
    claim: claimOf({ figures: { dollars: ["$1"] } }),
    supporting: sourceOf("https://example-fixture-news.com/fixture-grand-park"),
    priority: 99,
  });
  assert.equal(result.result, "manual-check-required");
  assert.match(result.reason, /ECONNRESET/);
});

test("an unacceptable source is refused rather than checked against", async () => {
  const result = await verifier().verifyClaim({
    claim: claimOf({ figures: { dollars: ["$1"] } }),
    supporting: sourceOf("https://www.reddit.com/r/vegas/comments/x"),
    priority: 99,
  });
  assert.equal(result.result, "manual-check-required");
  assert.match(result.reason, /not an acceptable authority/);
});

test("the per-run fetch budget is a hard stop", async () => {
  const budgeted = verifier(testConfig({ verification: { enabled: true, perHostDelayMs: 0, maxSourceFetches: 1 } }));
  const supporting = sourceOf("https://example-fixture-news.com/fixture-grand-park");
  const other = sourceOf("https://example-fixture-housing.nv.gov/worker-advantage");
  await budgeted.verifyClaim({ claim: claimOf({ figures: { dollars: ["$1"] } }), supporting, priority: 99 });
  const second = await budgeted.verifyClaim({ claim: claimOf({ figures: { dollars: ["$1"] } }), supporting: other, priority: 99 });
  assert.equal(second.result, "not-attempted");
  assert.match(second.reason, /fetch budget/);
  assert.equal(budgeted.stats.fetches, 1);
});

test("a repeated URL is served from cache rather than re-fetched", async () => {
  const v = verifier();
  const supporting = sourceOf("https://example-fixture-news.com/fixture-grand-park");
  await v.verifyClaim({ claim: claimOf({ figures: { dollars: ["$1"] } }), supporting, priority: 99 });
  await v.verifyClaim({ claim: claimOf({ figures: { dollars: ["$1"] } }), supporting, priority: 99 });
  assert.equal(v.stats.fetches, 1);
});

test("a missing or corrupt cache file degrades to an empty cache", () => {
  assert.deepEqual(loadCache("does/not/exist.json"), { version: 1, entries: {} });
  assert.deepEqual(loadCache(null), { version: 1, entries: {} });
});

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------

test("HTML is reduced to readable text, scripts and styles removed", () => {
  const html = "<html><head><style>p{color:red}</style></head><body><script>var x=1</script><p>Hello  there</p></body></html>";
  assert.equal(htmlToText(html), "Hello there");
});

test("titles and declared dates are read when the source states them", () => {
  assert.equal(titleFromHtml("<title>A Source</title>"), "A Source");
  assert.equal(titleFromHtml("<body>no title</body>"), null);
  assert.equal(declaredDateFromHtml('{"dateModified":"2026-07-01"}'), "2026-07-01");
  assert.equal(declaredDateFromHtml("<p>nothing</p>"), null);
  assert.equal(normalizeLastModified("Wed, 01 Jul 2026 12:00:00 GMT"), "2026-07-01");
  assert.equal(normalizeLastModified(null), null);
  assert.equal(normalizeLastModified("not a date"), null);
});

// ---------------------------------------------------------------------------
// Source hierarchy
// ---------------------------------------------------------------------------

test("the hierarchy ranks government above reporting above the unknown", () => {
  const gov = classifySource("https://www.clarkcountynv.gov/projects", onlineConfig);
  const news = classifySource("https://www.reviewjournal.com/story", onlineConfig);
  const unknown = classifySource("https://some-agent-blog.example/post", onlineConfig);
  assert.equal(gov.tier, "official-government");
  assert.equal(news.tier, "reputable-local-reporting");
  assert.equal(unknown.tier, "other-credible");
  assert.ok(gov.rank < news.rank && news.rank < unknown.rank);
  assert.equal(unknown.thin, true, "an unrecognised domain is thin, not condemned");
});

test("forums and content aggregators are never acceptable", () => {
  for (const url of ["https://www.reddit.com/r/x", "https://www.city-data.com/x", "https://boards.someforum.com/t/1"]) {
    assert.equal(classifySource(url, onlineConfig).acceptable, false, url);
  }
});

test("an unparseable URL degrades instead of throwing", () => {
  assert.equal(hostOf("not a url"), null);
  assert.equal(classifySource("not a url", onlineConfig).tier, "other-credible");
});

test("a claim's own attached source always wins over the page's list", () => {
  const claim = claimOf({
    structured: { kind: "development-project", source: { label: "RJ", url: "https://www.reviewjournal.com/alpha" } },
  });
  const page = { declaredSources: [{ label: "Clark County", url: "https://www.clarkcountynv.gov/x", used: "everything" }] };
  const supporting = supportingSourceFor(claim, page, onlineConfig);
  assert.equal(supporting.url, "https://www.reviewjournal.com/alpha");
  assert.equal(supporting.origin, "attached to the claim");
});

test("with no attached source, the closest listed one is chosen and labelled as a match", () => {
  const claim = claimOf({ text: "The interchange rebuild carries lane restrictions through a work zone." });
  const page = {
    declaredSources: [
      { label: "Summerlin history", url: "https://summerlin.com/about/history/", used: "The 1952 land purchase." },
      { label: "Clark County", url: "https://www.clarkcountynv.gov/projects", used: "Interchange rebuild lane restrictions and work zone." },
    ],
  };
  const supporting = supportingSourceFor(claim, page, onlineConfig);
  assert.equal(supporting.url, "https://www.clarkcountynv.gov/projects");
  assert.match(supporting.origin, /matched from the page's source list/);
});

test("a page citing nothing returns no supporting source", () => {
  assert.equal(supportingSourceFor(claimOf(), { declaredSources: [] }, onlineConfig), null);
});

test("the hierarchy rendered for the report is ordered and excludes the banned tier", () => {
  const hierarchy = describeHierarchy(onlineConfig);
  assert.deepEqual(hierarchy.map((t) => t.rank), [1, 2, 3, 4, 5, 6]);
  assert.ok(!hierarchy.some((t) => /not an acceptable/i.test(t.label)));
});
