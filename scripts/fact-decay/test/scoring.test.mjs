import test from "node:test";
import assert from "node:assert/strict";

import { scoreRisk } from "../lib/risk.mjs";
import {
  scoreFreshness,
  overdueComponent,
  timeMarkerComponent,
  yearDriftComponent,
  sourceAgeComponent,
  sourceDateFromLabel,
} from "../lib/freshness.mjs";
import { computePriority, urgencyFor, confidenceFor, decideAction, buildHistory } from "../lib/analyze.mjs";
import { CATEGORY_BY_KEY } from "../lib/categories.mjs";
import { parseHumanDate, extractDates, daysBetween, formatHuman, yearOf } from "../lib/dates.mjs";
import { testConfig, TEST_TODAY } from "./helpers.mjs";

const config = testConfig();

/** A minimal claim, so each test states only what it is actually about. */
function claimOf({ categoryKey = "home-prices", figures = {}, signals = {}, structured = null } = {}) {
  return {
    text: "a test claim",
    category: CATEGORY_BY_KEY.get(categoryKey),
    figures: { dollars: [], percents: [], numbers: [], measurableNumbers: [], dates: [], years: [], ...figures },
    signals: { timeMarkers: [], ...signals },
    structured,
  };
}

const pageOf = (lastReviewed, daysSince) => ({
  lastReviewed: { date: lastReviewed, basis: "a test date" },
  daysSinceReviewed: daysSince,
});

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

test("the date shapes LVINIT actually writes all parse", () => {
  assert.equal(parseHumanDate("Checked 20 August 2026").iso, "2026-08-20");
  assert.equal(parseHumanDate("August 20, 2026").iso, "2026-08-20");
  assert.equal(parseHumanDate("2026-08-20").iso, "2026-08-20");
});

test("a month-only date resolves to the FIRST of the month, and says so", () => {
  const parsed = parseHumanDate("December 2025");
  assert.equal(parsed.iso, "2025-12-01");
  assert.equal(parsed.dayKnown, false, "assuming the end of the month would make content look fresher than it is");
});

test("nonsense dates return null rather than a guess", () => {
  assert.equal(parseHumanDate("sometime last year"), null);
  assert.equal(parseHumanDate("Smarch 45, 2026"), null);
  assert.equal(parseHumanDate(""), null);
});

test("every date in a sentence is found, in order", () => {
  const dates = extractDates("Open from 1 June 2026 through December 31, 2026, reviewed 2026-07-04.");
  assert.deepEqual(dates.map((d) => d.iso), ["2026-06-01", "2026-12-31", "2026-07-04"]);
});

test("day arithmetic and formatting are consistent", () => {
  assert.equal(daysBetween("2026-08-20", "2026-09-04"), 15);
  assert.equal(daysBetween("2026-09-04", "2026-08-20"), -15);
  assert.equal(yearOf("2026-09-04"), 2026);
  assert.equal(formatHuman("2026-09-04"), "4 September 2026");
});

// ---------------------------------------------------------------------------
// Risk
// ---------------------------------------------------------------------------

test("risk starts from the category and is reported with its reasoning", () => {
  const result = scoreRisk({ claim: claimOf({ categoryKey: "parks-and-amenities" }), config });
  assert.equal(result.baseLevel, "low");
  assert.equal(result.level, "low");
  assert.match(result.rationale, /Final risk: low\./);
});

test("a dollar amount and obligation language raise the risk, and are itemized", () => {
  const bare = scoreRisk({ claim: claimOf({ categoryKey: "eligibility-rule" }), config });
  const loaded = scoreRisk({
    claim: claimOf({ categoryKey: "eligibility-rule", figures: { dollars: ["$147,300"] }, signals: { obligation: true } }),
    config,
  });
  assert.ok(loaded.score > bare.score);
  assert.deepEqual(loaded.escalations.map((e) => e.key).sort(), ["dollarAmount", "obligation"]);
  assert.equal(loaded.escalations.reduce((s, e) => s + e.delta, 0) <= config.risk.maxEscalation + 1e-9, true);
});

test("a page that hedges and tells the reader to verify lowers its own risk", () => {
  const bare = scoreRisk({ claim: claimOf({ categoryKey: "hoa-fees", figures: { dollars: ["$95"] } }), config });
  const careful = scoreRisk({
    claim: claimOf({
      categoryKey: "hoa-fees",
      figures: { dollars: ["$95"] },
      signals: { hedged: true, tellsReaderToVerify: true, selfDated: true },
    }),
    config,
  });
  assert.ok(careful.score < bare.score);
  assert.ok(careful.deEscalations.length >= 2);
});

test("escalators cannot talk a low-risk claim all the way up to high", () => {
  const stacked = scoreRisk({
    claim: claimOf({
      categoryKey: "parks-and-amenities",
      figures: { dollars: ["$1"], percents: ["1%"], dates: [{ iso: "2026-01-01", text: "1 January 2026" }] },
      signals: { obligation: true, namedAuthority: true, deadlineContext: true },
    }),
    config,
  });
  assert.notEqual(stacked.level, "high", "keyword stacking must not manufacture risk");
});

// ---------------------------------------------------------------------------
// Freshness
// ---------------------------------------------------------------------------

test("the overdue curve is zero when fresh, 0.4 when due, and 1 at saturation", () => {
  assert.equal(overdueComponent(0, 30, 2), 0);
  assert.equal(Number(overdueComponent(30, 30, 2).toFixed(3)), 0.4, "due is not the same as wrong");
  assert.equal(overdueComponent(60, 30, 2), 1);
  assert.equal(overdueComponent(600, 30, 2), 1, "very late and extremely late are the same instruction");
});

test("missing inputs make a component unavailable rather than zero", () => {
  assert.equal(overdueComponent(null, 30, 2), null);
  assert.equal(timeMarkerComponent([]), null);
  assert.equal(yearDriftComponent([], TEST_TODAY, 2), null);
  assert.equal(sourceAgeComponent(null, TEST_TODAY, 540), null);
});

test("future years do not count as drift", () => {
  assert.equal(yearDriftComponent([2027], TEST_TODAY, 2), null);
  assert.equal(yearDriftComponent([2024], TEST_TODAY, 2), 1);
  assert.equal(yearDriftComponent([2026], TEST_TODAY, 2), 0);
});

test("a source date can be read off a source label when it carries one", () => {
  assert.equal(sourceDateFromLabel("Las Vegas Review-Journal, 30 March 2026"), "2026-03-30");
  assert.equal(sourceDateFromLabel("Clark County projects in construction"), null);
});

test("a claim inside its cadence scores low staleness; one long past it scores high", () => {
  const fresh = scoreFreshness({
    claim: claimOf({ categoryKey: "home-prices" }),
    page: pageOf("2026-09-01", 3),
    config,
    today: TEST_TODAY,
  });
  const stale = scoreFreshness({
    claim: claimOf({ categoryKey: "home-prices" }),
    page: pageOf("2025-06-01", 460),
    config,
    today: TEST_TODAY,
  });
  assert.ok(fresh.score < 0.2);
  assert.ok(stale.score > 0.8);
  assert.equal(stale.isOverdue, true);
  assert.equal(fresh.isOverdue, false);
});

test("a passed deadline is arithmetic, not a probability", () => {
  const result = scoreFreshness({
    claim: claimOf({
      categoryKey: "deadline-or-application-period",
      figures: { dates: [{ iso: "2025-12-31", text: "December 31, 2025" }] },
      signals: { deadlineContext: true },
    }),
    page: pageOf("2026-09-01", 3),
    config,
    today: TEST_TODAY,
  });
  assert.equal(result.score, 1, "a fresh page does not make a passed deadline current");
  assert.equal(result.overrides[0].kind, "passed-deadline");
  assert.match(result.overrides[0].explanation, /passed 247 days ago/);
});

test("a scheduled date that has passed is flagged, but below a passed deadline", () => {
  const result = scoreFreshness({
    claim: claimOf({
      categoryKey: "project-status",
      figures: { dates: [{ iso: "2026-09-02", text: "2 September 2026" }] },
      signals: { scheduledEventContext: true },
    }),
    page: pageOf("2026-08-20", 15),
    config,
    today: TEST_TODAY,
  });
  assert.equal(result.overrides[0].kind, "passed-scheduled-event");
  assert.equal(result.score, config.freshness.passedScheduledEventStaleness);
});

test("a future date does not trigger an override", () => {
  const result = scoreFreshness({
    claim: claimOf({
      categoryKey: "deadline-or-application-period",
      figures: { dates: [{ iso: "2027-12-31", text: "December 31, 2027" }] },
      signals: { deadlineContext: true },
    }),
    page: pageOf("2026-09-01", 3),
    config,
    today: TEST_TODAY,
  });
  assert.deepEqual(result.overrides, []);
});

test("a page with no established check date still scores, and says why it cannot measure", () => {
  const result = scoreFreshness({
    claim: claimOf({ categoryKey: "home-prices", signals: { timeMarkers: ["currently"] } }),
    page: { lastReviewed: { date: null, basis: "no date could be established" }, daysSinceReviewed: null },
    config,
    today: TEST_TODAY,
  });
  assert.ok(Number.isFinite(result.score));
  assert.match(result.explanation, /No check date could be established/);
});

test("cadence comes from how fast the fact moves, not from how risky it is", () => {
  const rate = scoreFreshness({ claim: claimOf({ categoryKey: "mortgage-rates" }), page: pageOf("2026-08-20", 15), config, today: TEST_TODAY });
  const tax = scoreFreshness({ claim: claimOf({ categoryKey: "property-tax" }), page: pageOf("2026-08-20", 15), config, today: TEST_TODAY });
  assert.equal(rate.cadenceDays, config.cadence["very-dynamic"]);
  assert.equal(tax.cadenceDays, config.cadence.moderate);
  assert.ok(rate.score > tax.score, "both are high risk; only one decays weekly");
});

// ---------------------------------------------------------------------------
// Priority, urgency, confidence
// ---------------------------------------------------------------------------

test("priority rises with risk, staleness and a contradicting source", () => {
  const low = computePriority({ riskScore: 0.2, stalenessScore: 0.1, verificationResult: "not-attempted", trafficMultiplier: 1, config });
  const high = computePriority({ riskScore: 0.9, stalenessScore: 0.9, verificationResult: "contradicts", trafficMultiplier: 1, config });
  assert.ok(high > low);
  assert.ok(high <= 100 && low >= 0);
});

test("a confirming source pushes priority DOWN", () => {
  const base = { riskScore: 0.8, stalenessScore: 0.8, trafficMultiplier: 1, config };
  assert.ok(
    computePriority({ ...base, verificationResult: "confirms" }) <
      computePriority({ ...base, verificationResult: "not-attempted" })
  );
});

test("a confirmed claim is ordered as freshly checked, and below a contradicted one", () => {
  const base = { riskScore: 0.9, trafficMultiplier: 1, config };
  const confirmedButOverdue = computePriority({ ...base, stalenessScore: 1, verificationResult: "confirms" });
  const contradictedAndFresh = computePriority({ ...base, stalenessScore: 0.2, verificationResult: "contradicts" });
  assert.ok(
    contradictedAndFresh > confirmedButOverdue,
    "a source saying the figure moved must outrank a source saying it did not"
  );
});

test("traffic can only reorder, and is bounded", () => {
  const base = { riskScore: 0.8, stalenessScore: 0.8, verificationResult: "not-attempted", config };
  const quiet = computePriority({ ...base, trafficMultiplier: config.gsc.minMultiplier });
  const busy = computePriority({ ...base, trafficMultiplier: config.gsc.maxMultiplier });
  assert.ok(busy > quiet);
  assert.ok(quiet > 0, "a zero-traffic page is still reported");
  assert.ok(busy <= 100);
});

test("a low-confidence finding is never promoted to top urgency", () => {
  assert.equal(urgencyFor({ priority: 95, confidence: "high", config }), "now");
  assert.equal(urgencyFor({ priority: 95, confidence: "low", config }), "soon");
  assert.equal(urgencyFor({ priority: 10, confidence: "high", config }), "monitor");
});

test("confidence is high only for arithmetic or a clear contradiction", () => {
  const withOverride = confidenceFor({
    risk: { level: "high" },
    freshness: { overrides: [{ kind: "passed-deadline" }], isOverdue: true, score: 1 },
    verification: { result: "not-attempted" },
  });
  assert.equal(withOverride.level, "high");

  const detectedOnly = confidenceFor({
    risk: { level: "high" },
    freshness: { overrides: [], isOverdue: false, score: 0.2 },
    verification: { result: "not-attempted" },
  });
  assert.equal(detectedOnly.level, "low");
  assert.match(detectedOnly.caveats.join(" "), /no external source/);
});

test("a fetched-source result is medium confidence, with the presence-check caveat", () => {
  const result = confidenceFor({
    risk: { level: "high" },
    freshness: { overrides: [], isOverdue: true, score: 0.6 },
    verification: { result: "confirms", confidence: "medium" },
  });
  assert.equal(result.level, "medium");
  assert.match(result.caveats.join(" "), /not a human reading of that source/);
});

// ---------------------------------------------------------------------------
// Recommended actions
// ---------------------------------------------------------------------------

const noOverrides = { overrides: [], isOverdue: true, score: 0.6 };

test("a contradicting attached source means update the claim", () => {
  const { action } = decideAction({
    claim: claimOf({ figures: { dollars: ["$20,000"] } }),
    risk: { level: "high" },
    freshness: noOverrides,
    verification: { result: "contradicts", reason: "the figure is gone." },
    supporting: { url: "https://example.gov/x", origin: "attached to the claim", classification: { thin: false } },
  });
  assert.equal(action, "update-factual-claim");
});

test("a contradiction from an inferred source asks for a human, not an edit", () => {
  for (const origin of ["the page's strongest listed source", "matched from the page's source list"]) {
    const { action, because } = decideAction({
      claim: claimOf({ figures: { dollars: ["$20,000"] } }),
      risk: { level: "high" },
      freshness: noOverrides,
      verification: { result: "contradicts", reason: "the figure is gone." },
      supporting: { url: "https://example.com/x", origin, classification: { thin: true } },
    });
    assert.equal(action, "manual-review-required", origin);
    assert.match(because, /matched to the claim by topic/);
  }
});

test("a confirming source means no change is needed", () => {
  const { action } = decideAction({
    claim: claimOf(),
    risk: { level: "high" },
    freshness: noOverrides,
    verification: { result: "confirms", reason: "every figure still appears." },
    supporting: { url: "https://example.gov/x", origin: "attached to the claim", classification: { thin: false } },
  });
  assert.equal(action, "no-change-needed");
});

test("a precise figure with no source at all asks for a source", () => {
  const { action } = decideAction({
    claim: claimOf({ figures: { dollars: ["$934"] } }),
    risk: { level: "high" },
    freshness: noOverrides,
    verification: { result: "not-attempted", reason: "not checked." },
    supporting: null,
  });
  assert.equal(action, "update-source-citation");
});

test("a precision claim beyond thin evidence asks for the specificity to go", () => {
  const { action } = decideAction({
    claim: claimOf({ figures: { dollars: ["$312,141"] } }),
    risk: { level: "high" },
    freshness: noOverrides,
    verification: { result: "partially-confirms", reason: "one figure moved." },
    supporting: { url: "https://example.com/x", origin: "attached to the claim", classification: { thin: true } },
  });
  assert.equal(action, "remove-unsupported-specificity");
});

test("an unverifiable low-risk claim is only monitored", () => {
  const { action } = decideAction({
    claim: claimOf({ categoryKey: "parks-and-amenities" }),
    risk: { level: "low" },
    freshness: noOverrides,
    verification: { result: "cannot-verify", reason: "nothing numeric to match." },
    supporting: { url: "https://example.gov/x", origin: "attached to the claim", classification: { thin: false } },
  });
  assert.equal(action, "monitor-only");
});

test("date arithmetic overrides every verification result", () => {
  const { action, because } = decideAction({
    claim: claimOf(),
    risk: { level: "low" },
    freshness: { overrides: [{ explanation: "The deadline passed." }], isOverdue: false, score: 1 },
    verification: { result: "confirms", reason: "every figure still appears." },
    supporting: { url: "https://example.gov/x", origin: "attached to the claim", classification: { thin: false } },
  });
  assert.equal(action, "update-factual-claim");
  assert.equal(because, "The deadline passed.");
});

// ---------------------------------------------------------------------------
// Cross-run identity
// ---------------------------------------------------------------------------

test("history carries a claim's identity across earlier reports", () => {
  const history = buildHistory([
    { reportDate: "2026-08-21", findings: [{ fingerprint: "abc123", id: "FACT-2026-08-21-004" }] },
    { reportDate: "2026-08-28", findings: [{ fingerprint: "abc123", id: "FACT-2026-08-28-002" }] },
  ]);
  const entry = history.get("abc123");
  assert.equal(entry.firstSeen, "2026-08-21");
  assert.equal(entry.firstId, "FACT-2026-08-21-004");
  assert.equal(entry.timesReported, 2);
  assert.deepEqual(entry.previousIds, ["FACT-2026-08-21-004", "FACT-2026-08-28-002"]);
});

test("history tolerates malformed or empty earlier reports", () => {
  assert.equal(buildHistory([]).size, 0);
  assert.equal(buildHistory([{ reportDate: "2026-08-21" }]).size, 0);
  assert.equal(buildHistory([{ reportDate: "2026-08-21", findings: [{ id: "x" }] }]).size, 0);
});
