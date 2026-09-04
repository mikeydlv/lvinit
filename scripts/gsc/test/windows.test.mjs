import test from "node:test";
import assert from "node:assert/strict";

import {
  buildWindows,
  buildShortTrendWindow,
  describeWindows,
  parseISODate,
  formatISODate,
  addDays,
  daysBetweenInclusive,
} from "../lib/windows.mjs";

test("the current window ends lagDays before today and is periodDays long", () => {
  const w = buildWindows({ periodDays: 28, lagDays: 3, today: "2026-09-04" });
  assert.equal(w.current.end, "2026-09-01"); // 4th minus 3 days
  assert.equal(w.current.start, "2026-08-05"); // 28 inclusive days back
  assert.equal(daysBetweenInclusive(w.current.start, w.current.end), 28);
});

test("the previous window sits immediately before the current one, with no overlap or gap", () => {
  const w = buildWindows({ periodDays: 28, lagDays: 3, today: "2026-09-04" });
  assert.equal(w.previous.end, "2026-08-04");
  assert.equal(w.previous.start, "2026-07-08");
  assert.equal(daysBetweenInclusive(w.previous.start, w.previous.end), 28);
  // The day after the previous window ends is the day the current one starts.
  assert.equal(formatISODate(addDays(parseISODate(w.previous.end), 1)), w.current.start);
});

test("a zero lag buffer ends the window on today", () => {
  const w = buildWindows({ periodDays: 7, lagDays: 0, today: "2026-09-04" });
  assert.equal(w.current.end, "2026-09-04");
  assert.equal(w.current.start, "2026-08-29");
});

test("the lag buffer is configurable and shifts both windows together", () => {
  const a = buildWindows({ periodDays: 28, lagDays: 2, today: "2026-09-04" });
  const b = buildWindows({ periodDays: 28, lagDays: 5, today: "2026-09-04" });
  assert.equal(a.current.end, "2026-09-02");
  assert.equal(b.current.end, "2026-08-30");
  assert.equal(daysBetweenInclusive(b.current.start, b.current.end), 28);
  assert.equal(daysBetweenInclusive(b.previous.start, b.previous.end), 28);
});

test("a different comparison length is allowed but marked not comparable", () => {
  const w = buildWindows({ periodDays: 28, lagDays: 3, comparisonDays: 14, today: "2026-09-04" });
  assert.equal(w.previous.days, 14);
  assert.equal(daysBetweenInclusive(w.previous.start, w.previous.end), 14);
  assert.equal(w.comparable, false);
  assert.match(describeWindows(w), /DIFFERENT lengths/);
});

test("equal-length windows are reported as comparable", () => {
  const w = buildWindows({ periodDays: 28, lagDays: 3, today: "2026-09-04" });
  assert.equal(w.comparable, true);
  assert.doesNotMatch(describeWindows(w), /DIFFERENT/);
});

test("short trend windows sit inside the current window and never run past its end", () => {
  const w = buildWindows({ periodDays: 28, lagDays: 3, today: "2026-09-04" });
  const short = buildShortTrendWindow(w, 7);
  assert.equal(short.end, w.current.end);
  assert.equal(short.start, "2026-08-26");
  const clamped = buildShortTrendWindow(w, 90);
  assert.equal(clamped.days, 28, "a trend window longer than the period is clamped, not extended");
  assert.equal(clamped.start, w.current.start);
});

test("month and year boundaries are handled in UTC without drift", () => {
  const w = buildWindows({ periodDays: 28, lagDays: 3, today: "2027-01-15" });
  assert.equal(w.current.end, "2027-01-12");
  assert.equal(w.current.start, "2026-12-16");
  assert.equal(w.previous.end, "2026-12-15");
  assert.equal(w.previous.start, "2026-11-18");
});

test("leap day is a real day, not a skipped one", () => {
  const w = buildWindows({ periodDays: 7, lagDays: 0, today: "2028-03-01" });
  assert.equal(w.current.start, "2028-02-24");
  assert.ok(w.current.start <= "2028-02-29" && "2028-02-29" <= w.current.end);
});

test("bad inputs are rejected rather than silently coerced", () => {
  assert.throws(() => buildWindows({ periodDays: 0, lagDays: 3 }), /periodDays/);
  assert.throws(() => buildWindows({ periodDays: 28, lagDays: -1 }), /lagDays/);
  assert.throws(() => buildWindows({ periodDays: 28, lagDays: 3, comparisonDays: 0.5 }), /comparisonDays/);
  assert.throws(() => parseISODate("04/09/2026"), /YYYY-MM-DD/);
  assert.throws(() => parseISODate("not-a-date"), /YYYY-MM-DD/);
});

test("a Date instance and its ISO string produce identical windows", () => {
  const fromString = buildWindows({ periodDays: 28, lagDays: 3, today: "2026-09-04" });
  const fromDate = buildWindows({
    periodDays: 28,
    lagDays: 3,
    today: new Date(Date.UTC(2026, 8, 4, 23, 59, 59)),
  });
  assert.deepEqual(fromDate.current, fromString.current);
  assert.deepEqual(fromDate.previous, fromString.previous);
});
