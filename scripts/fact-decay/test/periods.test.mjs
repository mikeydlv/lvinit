// Regression tests for two classification problems found in the first real
// scheduled Fact-Decay report (2026-09-10):
//
//   1. Dated mortgage-rate figures were reported as contradicted because
//      Freddie Mac's CURRENT page showed a newer week's rate.
//   2. The monsoon-season window on /guides/first-summer-in-vegas was
//      classified as a deadline, and a record temperature as a home price.
//
// The sentences below are the real ones from that report.

import test from "node:test";
import assert from "node:assert/strict";

import {
  extractPeriods,
  periodForFigure,
  sourcePeriodNear,
  samePeriod,
  locateFigure,
  COMPARISON_BASELINE,
} from "../lib/periods.mjs";
import { classifySentence, annotatePeriods, extractFigures } from "../lib/claims.mjs";
import { findConflictingValues, createVerifier, HISTORICAL_PERIOD_MARKER } from "../lib/verify.mjs";
import { scoreFreshness } from "../lib/freshness.mjs";
import { decideAction } from "../lib/analyze.mjs";
import { classifySource } from "../lib/sources.mjs";
import { CATEGORY_BY_KEY, isClimatologyWithoutAction } from "../lib/categories.mjs";
import { createFixtureFetch } from "../fixtures/fixture-sources.mjs";
import { testConfig } from "./helpers.mjs";

const TODAY = "2026-09-17";
const config = testConfig({ verification: { enabled: true, perHostDelayMs: 0 } });

// --- The real claims from the 2026-09-10 report -----------------------------

const JULY_30_PANEL = "30-year fixed mortgage rate: 6.66% (Week of July 30, 2026 · Freddie Mac average)";
const AUGUST_13_PANEL = "30-year fixed mortgage rate: 6.67% (Week of August 13, 2026 · Freddie Mac average)";
const JULY_30_PROSE =
  "Freddie Mac put the 30-year fixed average at 6.66% for the week of July 30, 2026, and rates have mostly hovered in the mid-to-high 6% range this year, high by the standards of the last decade.";
const TWO_WEEKS_PROSE =
  "Freddie Mac put the 30-year fixed average at 6.69% for the week of August 6, 2026 and 6.67% for the week of August 13, consistent with where rates have sat for most of the year.";
const THIS_WEEK_PROSE = "This week’s release: the 30-year fixed averaged 6.71%, up from 6.66% the prior week.";

// What Freddie Mac's landing page showed on 2026-09-10: the latest week only.
const FREDDIE_CURRENT = `<html><head><title>Mortgage Rates - Freddie Mac</title></head><body>
  <h1>Primary Mortgage Market Survey</h1>
  <p>30-year Fixed-Rate Mortgage 6.76% 15-year Fixed-Rate Mortgage 6.09% Download Rates Since 1971.</p>
  <p>Mortgage Rates Average 6.76%. The 30-year fixed-rate mortgage averaged 6.76% for the week of September 10, 2026,
  as buyers continued to weigh affordability. The 15-year fixed-rate mortgage averaged 6.09% for the same release.
  Freddie Mac publishes these results weekly, and this page always shows the latest release.</p>
</body></html>`;

// A source that DOES state the July 30 value — and states a different one.
const FREDDIE_ARCHIVE_DIFFERENT = `<html><head><title>PMMS archive - Freddie Mac</title></head><body>
  <h1>Weekly results archive</h1>
  <p>The 30-year fixed-rate mortgage averaged 6.70% for the week of July 30, 2026, according to the revised
  Primary Mortgage Market Survey archive. Freddie Mac publishes these results weekly for the whole country.</p>
  <p>Each weekly release reports the average contract rate for conventional, conforming loans across the
  United States. Archived weeks remain available so that past results can be checked against later reporting,
  and this page is kept for historical reference rather than as a current rate quote.</p>
</body></html>`;

// A source that states the July 30 value and agrees with the page.
const FREDDIE_ARCHIVE_SAME = `<html><head><title>PMMS archive - Freddie Mac</title></head><body>
  <h1>Weekly results archive</h1>
  <p>The 30-year fixed-rate mortgage averaged 6.66% for the week of July 30, 2026, according to the Primary
  Mortgage Market Survey archive. Freddie Mac publishes these results weekly for the whole country.</p>
  <p>Each weekly release reports the average contract rate for conventional, conforming loans across the
  United States. Archived weeks remain available so that past results can be checked against later reporting,
  and this page is kept for historical reference rather than as a current rate quote.</p>
</body></html>`;

const page = (body) => ({ status: 200, body, headers: {} });
const fetchImpl = createFixtureFetch({
  "https://www.freddiemac.com/pmms": page(FREDDIE_CURRENT),
  "https://www.freddiemac.com/pmms/archive-different": page(FREDDIE_ARCHIVE_DIFFERENT),
  "https://www.freddiemac.com/pmms/archive-same": page(FREDDIE_ARCHIVE_SAME),
});

const verifier = () => createVerifier({ config, today: TODAY, fetchImpl, cache: { version: 1, entries: {} } });

function claimFor(text, categoryKey = "mortgage-rates") {
  const verdict = classifySentence(text, { config, today: TODAY });
  const figures = verdict.figures ?? extractFigures(text);
  return {
    text,
    heading: null,
    category: CATEGORY_BY_KEY.get(categoryKey),
    figures,
    signals: verdict.signals,
    periodInfo: annotatePeriods(text, figures, TODAY),
    structured: null,
  };
}

const sourceAt = (url) => ({ label: "Freddie Mac PMMS", url, origin: "attached to the claim", classification: classifySource(url, config) });

// ===========================================================================
// 1. Period awareness
// ===========================================================================

test("REGRESSION: July 30 rate 6.66% vs the current 6.76% is NOT a contradiction", async () => {
  const result = await verifier().verifyClaim({
    claim: claimFor(JULY_30_PANEL),
    supporting: sourceAt("https://www.freddiemac.com/pmms"),
    priority: 99,
  });
  assert.notEqual(result.result, "contradicts");
  assert.equal(result.result, "historical-period-not-verified");
  assert.equal(result.marker, HISTORICAL_PERIOD_MARKER);
  assert.deepEqual(result.conflicts, []);
  assert.match(result.reason, /July 30, 2026/);
  assert.match(result.reason, /6\.76%/, "the report says what the source actually shows");
  assert.match(result.reason, /different period, not a correction/);
});

test("REGRESSION: August 13 rate 6.67% vs the current 6.76% is NOT a contradiction", async () => {
  const result = await verifier().verifyClaim({
    claim: claimFor(AUGUST_13_PANEL),
    supporting: sourceAt("https://www.freddiemac.com/pmms"),
    priority: 99,
  });
  assert.notEqual(result.result, "contradicts");
  assert.equal(result.result, "historical-period-not-verified");
  assert.match(result.reason, /August 13, 2026/);
});

test("REGRESSION: a source saying the July 30 value was 6.70% IS a contradiction", async () => {
  const result = await verifier().verifyClaim({
    claim: claimFor(JULY_30_PANEL),
    supporting: sourceAt("https://www.freddiemac.com/pmms/archive-different"),
    priority: 99,
  });
  assert.equal(result.result, "contradicts");
  assert.equal(result.conflicts.length, 1);
  assert.equal(result.conflicts[0].pageValue, "6.66%");
  assert.equal(result.conflicts[0].sourceValue, "6.70%");
  assert.equal(result.conflicts[0].period, "2026-07-30");
  assert.match(result.reason, /for the same period/);
});

test("a source stating the SAME value for the same week confirms it", async () => {
  const result = await verifier().verifyClaim({
    claim: claimFor(JULY_30_PANEL),
    supporting: sourceAt("https://www.freddiemac.com/pmms/archive-same"),
    priority: 99,
  });
  assert.equal(result.result, "confirms");
});

test("the period rule is what prevents the false contradiction — the label rule alone would not", () => {
  const claim = claimFor(JULY_30_PANEL);
  const sourceText = FREDDIE_CURRENT.replace(/<[^>]+>/g, " ");
  const withoutPeriods = findConflictingValues({ missing: ["6.66%"], claimText: JULY_30_PANEL, sourceText });
  const withPeriods = findConflictingValues({
    missing: ["6.66%"],
    claimText: JULY_30_PANEL,
    sourceText,
    figurePeriods: claim.periodInfo.figurePeriods,
    defaultYear: 2026,
  });
  assert.equal(withoutPeriods.length, 1, "measure matches: this is exactly the pair the Sept 10 run reported");
  assert.deepEqual(withPeriods, [], "different week, so it is not a contradiction");
  assert.equal(withPeriods.otherPeriodValues[0].sourceValue, "6.76%");
  assert.equal(withPeriods.otherPeriodValues[0].sourcePeriod.key, "2026-09-10");
});

test("a source value with NO period beside it cannot contradict a dated figure", () => {
  const claim = claimFor(JULY_30_PANEL);
  const conflicts = findConflictingValues({
    missing: ["6.66%"],
    claimText: JULY_30_PANEL,
    sourceText: "The 30-year fixed mortgage rate averaged 6.76% (Week summary, national average).",
    figurePeriods: claim.periodInfo.figurePeriods,
    defaultYear: 2026,
  });
  assert.deepEqual(conflicts, [], "without a stated period there is no way to know it is the same week");
});

test("the real July 30 prose sentence is not contradicted, but IS still reviewed for freshness", async () => {
  const claim = claimFor(JULY_30_PROSE);
  assert.equal(claim.periodInfo.periodBound, true);
  assert.equal(claim.periodInfo.datedRecord, false, "\"rates have mostly hovered … this year\" speaks about the present");
  assert.equal(claim.signals.presentFraming, true);

  const result = await verifier().verifyClaim({ claim, supporting: sourceAt("https://www.freddiemac.com/pmms"), priority: 99 });
  assert.notEqual(result.result, "contradicts");
  assert.equal(result.result, "historical-period-not-verified");

  const freshness = scoreFreshness({
    claim,
    page: { lastReviewed: { date: "2026-08-04", basis: "test" }, daysSinceReviewed: 44 },
    config,
    today: TODAY,
  });
  assert.equal(freshness.datedRecord, false);
  assert.equal(freshness.cadenceDays, config.cadence["very-dynamic"], "the present-tense framing keeps the rate cadence");
  assert.equal(freshness.isOverdue, true);

  const { action, because } = decideAction({
    claim,
    risk: { level: "high" },
    freshness,
    verification: result,
    supporting: sourceAt("https://www.freddiemac.com/pmms"),
  });
  assert.equal(action, "clarify-uncertainty", "the framing aged; the dated figure did not");
  assert.match(because, /dated figure itself is fine/);
});

test("the real two-week sentence attaches each rate to its own week and contradicts neither", async () => {
  const claim = claimFor(TWO_WEEKS_PROSE);
  const byFigure = Object.fromEntries(claim.periodInfo.figurePeriods.map((fp) => [fp.figure, fp.period.key]));
  assert.equal(byFigure["6.69%"], "2026-08-06");
  assert.equal(byFigure["6.67%"], "2026-08-13", "the second rate belongs to the second week, not the nearer first one");

  const result = await verifier().verifyClaim({ claim, supporting: sourceAt("https://www.freddiemac.com/pmms"), priority: 99 });
  assert.notEqual(result.result, "contradicts");
});

test("\"up from 6.66% the prior week\" can never be contradicted — its period cannot be pinned down", async () => {
  const claim = claimFor(THIS_WEEK_PROSE);
  const byFigure = Object.fromEntries(claim.periodInfo.figurePeriods.map((fp) => [fp.figure, fp.period]));
  assert.equal(byFigure["6.71%"].type, "relative");
  assert.equal(byFigure["6.66%"].key, COMPARISON_BASELINE.key);

  const result = await verifier().verifyClaim({ claim, supporting: sourceAt("https://www.freddiemac.com/pmms"), priority: 99 });
  assert.notEqual(result.result, "contradicts");
  assert.equal(claim.periodInfo.datedRecord, false, "\"this week\" is present framing, and it has aged");
});

test("a dated record is reviewed on the stable cadence, and its year is not staleness", () => {
  const claim = claimFor(JULY_30_PANEL);
  assert.equal(claim.periodInfo.datedRecord, true);
  const freshness = scoreFreshness({
    claim,
    page: { lastReviewed: { date: "2026-08-04", basis: "test" }, daysSinceReviewed: 44 },
    config,
    today: TODAY,
  });
  assert.equal(freshness.cadenceDays, config.cadence.stable);
  assert.equal(freshness.isOverdue, false, "a newer weekly rate does not make a dated weekly rate overdue");
  assert.equal(freshness.components.find((c) => c.component === "yearDrift").available, false);
  assert.equal(freshness.components.find((c) => c.component === "timeMarkers").available, false);
  assert.match(freshness.explanation, /dated record/);
});

test("a dated record that was not verified recommends nothing but monitoring", () => {
  const claim = claimFor(JULY_30_PANEL);
  const { action } = decideAction({
    claim,
    risk: { level: "high" },
    freshness: { overrides: [], isOverdue: false, score: 0.05 },
    verification: { result: "historical-period-not-verified", reason: "the source moved on." },
    supporting: sourceAt("https://www.freddiemac.com/pmms"),
  });
  assert.equal(action, "monitor-only");
});

test("REGRESSION GUARD: a figure beside a DEADLINE is never a dated record", () => {
  const text =
    "Household income must be at or below $147,300 in Clark County, and the program is available only through December 31, 2025.";
  const claim = claimFor(text, "deadline-or-application-period");
  assert.equal(claim.periodInfo.periodBound, false, "a deadline is not a reporting period");
  assert.equal(claim.periodInfo.datedRecord, false);
  assert.equal(claim.periodInfo.figurePeriods[0].period, null, "the income limit does not attach across \", and\"");
});

// --- Period primitives ------------------------------------------------------

test("periods are read in every shape LVINIT and its sources write them", () => {
  const keys = (s) => extractPeriods(s, { defaultYear: 2026 }).map((p) => `${p.type}:${p.key}`);
  assert.deepEqual(keys("Week of Sept 3, 2026"), ["day:2026-09-03"]);
  assert.deepEqual(keys("as of 09/10/2026"), ["day:2026-09-10"]);
  assert.deepEqual(keys("in July 2026"), ["month:2026-07"]);
  assert.deepEqual(keys("in the third quarter of 2026"), ["quarter:2026-Q3"]);
  assert.deepEqual(keys("Q2 2026"), ["quarter:2026-Q2"]);
  assert.deepEqual(keys("the week of August 13"), ["day:2026-08-13"], "a missing year is inherited");
  assert.equal(extractPeriods("up 1% from a year earlier")[0].type, "relative");
  assert.deepEqual(keys("February 30, 2026"), [], "impossible dates are not periods");
});

test("only identical explicit periods match", () => {
  const [a] = extractPeriods("July 30, 2026");
  const [b] = extractPeriods("7/30/2026");
  const [c] = extractPeriods("September 10, 2026");
  const [r] = extractPeriods("the prior week");
  assert.equal(samePeriod(a, b), true);
  assert.equal(samePeriod(a, c), false);
  assert.equal(samePeriod(r, r), false, "relative periods never match, even themselves");
  assert.equal(samePeriod(a, null), false);
});

test("a source value's period is the NEAREST date beside it, not any date on the page", () => {
  const text = "Week of July 30, 2026: 6.66. Week of August 6, 2026: 6.69.";
  const p = sourcePeriodNear(text, text.indexOf("6.69"), 4, { radius: 160 });
  assert.equal(p.key, "2026-08-06");
});

test("figures are located on number boundaries, not as substrings", () => {
  assert.equal(locateFigure("the 6.66% rate and a 6% range", "6%"), 21);
  assert.equal(locateFigure("costs $1,480,000 now", "$480,000"), -1);
  assert.equal(periodForFigure([], 0, 3), null);
});

// ===========================================================================
// 2. Seasonal / climatology claims
// ===========================================================================

const MONSOON =
  "The National Weather Service frames Southern Nevada’s monsoon window as running June 15 through September 30, with the valley typically seeing its own active stretch from early July into August.";
const RECORD_HIGH =
  "Las Vegas’ all-time record high (120°F, set July 7, 2024) is the reminder that a normal July can still produce an abnormal week.";

test("REGRESSION: the monsoon window is seasonal climatology, not a deadline", () => {
  const verdict = classifySentence(MONSOON, { config, today: TODAY });
  assert.equal(verdict.kind, "claim");
  const keys = verdict.categories.map((c) => c.key);
  assert.equal(keys[0], "seasonal-climatology");
  assert.ok(!keys.includes("deadline-or-application-period"), "a recurring weather season is not an application deadline");
  assert.equal(verdict.signals.deadlineContext, false);
  assert.equal(verdict.signals.scheduledEventContext, false);
  assert.equal(isClimatologyWithoutAction(MONSOON), true);
});

test("REGRESSION: the monsoon window never produces a passed-deadline finding, even after September 30", () => {
  const verdict = classifySentence(MONSOON, { config, today: "2026-10-15" });
  const claim = {
    text: MONSOON,
    category: verdict.categories[0],
    figures: { ...verdict.figures, dates: [{ iso: "2026-09-30", text: "September 30", index: 0 }] },
    signals: verdict.signals,
    periodInfo: annotatePeriods(MONSOON, verdict.figures, "2026-10-15"),
  };
  const freshness = scoreFreshness({
    claim,
    page: { lastReviewed: { date: "2026-08-23", basis: "test" }, daysSinceReviewed: 53 },
    config,
    today: "2026-10-15",
  });
  assert.deepEqual(freshness.overrides, [], "the end of a season is not a deadline that expired");
  assert.equal(freshness.cadenceDays, config.cadence.stable);
});

test("seasonal climatology is low risk and reviewed annually", () => {
  const category = CATEGORY_BY_KEY.get("seasonal-climatology");
  assert.equal(category.baseRisk, "low");
  assert.equal(category.dynamism, "stable");
  assert.equal(category.group, "durable");
});

test("REGRESSION: a record temperature is climatology, not a home price", () => {
  const keys = classifySentence(RECORD_HIGH, { config, today: TODAY }).categories.map((c) => c.key);
  assert.equal(keys[0], "seasonal-climatology");
  assert.ok(!keys.includes("home-prices"));
});

test("a record-high PRICE is still a home-price claim", () => {
  const keys = classifySentence("The median single-family price hit a record high of $490,000 in June 2026.", {
    config,
    today: TODAY,
  }).categories.map((c) => c.key);
  assert.equal(keys[0], "home-prices");
});

test("a weather sentence that asks the reader to ACT keeps its deadline", () => {
  const text = "Apply for the summer heat bill-assistance program before the deadline of September 30, 2026, when temperatures peak.";
  assert.equal(isClimatologyWithoutAction(text), false);
  const keys = classifySentence(text, { config, today: TODAY }).categories.map((c) => c.key);
  assert.ok(keys.includes("deadline-or-application-period"), "a real consumer deadline is not climatology");
});

test("weather prose with no figure is not a claim at all", () => {
  assert.notEqual(
    classifySentence("Summer afternoons bring the kind of heat and humidity that changes how you plan a day.", {
      config,
      today: TODAY,
    }).kind,
    "claim"
  );
});

// ===========================================================================
// 3. End to end: where these claims land in the report
// ===========================================================================

import { analyze } from "../lib/analyze.mjs";
import {
  extractTextBlocks,
  extractDataRows,
  extractDeclaredSources,
  extractExternalLinks,
  extractDevelopmentProjects,
} from "../lib/extract.mjs";

function inventoryFor(route, source, lastReviewed) {
  const document = {
    file: `test#${route}`,
    role: "page",
    blocks: extractTextBlocks(source, { minWords: config.claims.minWords }),
    declaredSources: [...extractDeclaredSources(source), ...extractExternalLinks(source)],
    developmentProjects: extractDevelopmentProjects(source),
    dataRows: extractDataRows(source),
  };
  return {
    pages: [
      {
        route,
        section: "guide",
        file: document.file,
        title: "Test rates page",
        description: null,
        category: "Market Watch",
        storyMeta: {},
        registryEntry: null,
        lastReviewed: { date: lastReviewed, basis: "test" },
        daysSinceReviewed: 44,
        documents: [document],
        declaredSources: document.declaredSources,
        developmentProjects: [],
        textBlockCount: document.blocks.length,
      },
    ],
    skipped: [],
    registrySize: 0,
  };
}

const neutralGsc = { available: false, reason: "test", fixtureData: false, multiplierFor: () => ({ value: 1, basis: "test" }) };

async function runPage(sourceUrl) {
  const tsx = `
const SNAPSHOT = [
  { value: "6.66%", label: "30-year fixed mortgage rate", note: "Week of July 30, 2026 · Freddie Mac average" },
];
export default function Page() {
  return (
    <StorySection heading="Sources">
      <ul>
        <li>Freddie Mac weekly survey. <a href="${sourceUrl}">Freddie Mac PMMS</a></li>
      </ul>
    </StorySection>
  );
}
`;
  return analyze({
    inventory: inventoryFor("/guides/test-rates", tsx, "2026-08-04"),
    config: testConfig({ verification: { enabled: true, perHostDelayMs: 0 }, output: { minPriority: 0 } }),
    reportDate: TODAY,
    gscSignal: neutralGsc,
    verifier: verifier(),
  });
}

test("END TO END: a dated rate the current page has moved past is filed as history, not a refresh", async () => {
  const analysis = await runPage("https://www.freddiemac.com/pmms");
  const inList = analysis.findings.find((f) => f.claim.includes("6.66%"));
  const filed = analysis.datedRecords.find((f) => f.claim.includes("6.66%"));
  assert.equal(inList, undefined, "it must not appear as a refresh, even with the threshold at zero");
  assert.ok(filed, "it is listed in the dated-records section instead");
  assert.equal(filed.verification.result, "historical-period-not-verified");
  assert.equal(filed.verification.explicitContradiction, false);
  assert.equal(filed.freshness.isOverdue, false);
  assert.equal(analysis.totals.datedRecordsNotContradicted, 1);
});

test("END TO END: the same dated rate, contradicted for its own week, stays in the refresh list", async () => {
  const analysis = await runPage("https://www.freddiemac.com/pmms/archive-different");
  const inList = analysis.findings.find((f) => f.claim.includes("6.66%"));
  assert.ok(inList, "a same-period contradiction is a real finding");
  assert.equal(inList.verification.result, "contradicts");
  assert.equal(inList.verification.conflicts[0].sourceValue, "6.70%");
  assert.equal(analysis.datedRecords.length, 0);
});

// ===========================================================================
// 4. Found on the 2026-09-17 re-run
// ===========================================================================

const AS_OF_SEPT_3 =
  "As of the week of September 3, 2026, Freddie Mac's Primary Mortgage Market Survey put the average 30-year fixed rate at 6.71% and the 15-year fixed rate at 6.04%.";

test("REGRESSION: an introductory \"As of <date>,\" dates every figure in the sentence", () => {
  const claim = claimFor(AS_OF_SEPT_3);
  const byFigure = Object.fromEntries(claim.periodInfo.figurePeriods.map((fp) => [fp.figure, fp.period?.key]));
  assert.equal(byFigure["6.71%"], "2026-09-03", "85 characters from its date, but the \"as of\" scopes the sentence");
  assert.equal(byFigure["6.04%"], "2026-09-03");
  assert.equal(claim.periodInfo.datedRecord, true);
});

test("REGRESSION: the \"As of September 3\" rates are not contradicted by a later week's 6.76%", async () => {
  const result = await verifier().verifyClaim({
    claim: claimFor(AS_OF_SEPT_3),
    supporting: sourceAt("https://www.freddiemac.com/pmms"),
    priority: 99,
  });
  assert.notEqual(result.result, "contradicts");
  assert.equal(result.result, "historical-period-not-verified");
});

test("an introductory \"In July 2026,\" dates the figures after it", () => {
  const text = "In July 2026, the median single-family price was $480,000 and 80.0% of homes sold within 60 days.";
  const claim = claimFor(text, "home-prices");
  assert.ok(claim.periodInfo.figurePeriods.every((fp) => fp.period?.key === "2026-07"));
});

test("a sentence whose date is only in the PREVIOUS sentence stays undated — no guessing across sentences", () => {
  const claim = claimFor("The 15-year fixed averaged 6.04%, up from 5.98%.");
  assert.equal(claim.periodInfo.periodBound, false);
});

test("a dated record that was not fetched is monitored, not sent for manual review", () => {
  const claim = claimFor(JULY_30_PANEL);
  for (const result of ["not-attempted", "cannot-verify"]) {
    const { action } = decideAction({
      claim,
      risk: { level: "high" },
      freshness: { overrides: [], isOverdue: false, score: 0.05 },
      verification: { result, reason: "not checked." },
      supporting: sourceAt("https://www.freddiemac.com/pmms"),
    });
    assert.equal(action, "monitor-only", result);
  }
});

test("…but a dated record that a source contradicts for its own period still asks for an update", () => {
  const claim = claimFor(JULY_30_PANEL);
  const { action } = decideAction({
    claim,
    risk: { level: "high" },
    freshness: { overrides: [], isOverdue: false, score: 0.05 },
    verification: { result: "contradicts", reason: "the source states 6.70% for the week of July 30, 2026." },
    supporting: sourceAt("https://www.freddiemac.com/pmms/archive-different"),
  });
  assert.equal(action, "update-factual-claim");
});
