// ---------------------------------------------------------------------------
// DATE WINDOW MATH
//
// One place decides which days the agent looks at. Nothing else in the codebase
// should build a date string.
//
// The model:
//
//   today            the day the report runs (UTC, or an injected date in tests)
//   lagDays          days skipped at the end for Search Console reporting lag
//   endDate          today - lagDays          <- last day we trust
//   current window   [endDate - (periodDays - 1) .. endDate]
//   previous window  the comparisonDays immediately before the current window
//
// We ALSO ask the API for dataState: "final", so the lag buffer is a second,
// independent guard rather than the only one. Both are configurable.
// ---------------------------------------------------------------------------

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parse "YYYY-MM-DD" into a UTC Date at midnight. Throws on a bad shape. */
export function parseISODate(value) {
  if (value instanceof Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  if (!m) throw new Error(`Expected a YYYY-MM-DD date, got: ${value}`);
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (Number.isNaN(d.getTime())) throw new Error(`Not a real date: ${value}`);
  return d;
}

/** Format a Date as "YYYY-MM-DD" in UTC. */
export function formatISODate(date) {
  return date.toISOString().slice(0, 10);
}

/** Shift a date by whole days (negative goes back). */
export function addDays(date, days) {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/** Inclusive day count between two YYYY-MM-DD strings. */
export function daysBetweenInclusive(startISO, endISO) {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}

/**
 * Build the current + previous comparison windows.
 *
 * @param {object}  opts
 * @param {number}  opts.periodDays      length of the current window
 * @param {number}  opts.lagDays         reporting-lag buffer
 * @param {number?} opts.comparisonDays  length of the previous window (defaults to periodDays)
 * @param {Date|string?} opts.today      injectable "now" so tests are deterministic
 * @returns {{current:{start:string,end:string,days:number},
 *            previous:{start:string,end:string,days:number},
 *            lagDays:number, today:string, comparable:boolean}}
 */
export function buildWindows({ periodDays, lagDays, comparisonDays = null, today = new Date() } = {}) {
  if (!Number.isInteger(periodDays) || periodDays < 1) {
    throw new Error(`periodDays must be a positive integer, got: ${periodDays}`);
  }
  if (!Number.isInteger(lagDays) || lagDays < 0) {
    throw new Error(`lagDays must be a non-negative integer, got: ${lagDays}`);
  }
  const compDays = comparisonDays == null ? periodDays : comparisonDays;
  if (!Number.isInteger(compDays) || compDays < 1) {
    throw new Error(`comparisonDays must be a positive integer or null, got: ${comparisonDays}`);
  }

  const todayUTC = parseISODate(today);
  const end = addDays(todayUTC, -lagDays);
  const start = addDays(end, -(periodDays - 1));
  const prevEnd = addDays(start, -1);
  const prevStart = addDays(prevEnd, -(compDays - 1));

  return {
    today: formatISODate(todayUTC),
    lagDays,
    current: { start: formatISODate(start), end: formatISODate(end), days: periodDays },
    previous: { start: formatISODate(prevStart), end: formatISODate(prevEnd), days: compDays },
    // Deltas are only an apples-to-apples comparison when the windows match.
    comparable: periodDays === compDays,
  };
}

/**
 * A shorter trailing window inside the current period, for "what's happening
 * right now" context. Never extends past the current window's end date.
 */
export function buildShortTrendWindow(windows, shortTrendDays) {
  const days = Math.max(1, Math.min(shortTrendDays, windows.current.days));
  const end = parseISODate(windows.current.end);
  const start = addDays(end, -(days - 1));
  return { start: formatISODate(start), end: windows.current.end, days };
}

/** Human sentence describing the comparison, for the report header. */
export function describeWindows(windows) {
  const base =
    `${windows.current.start} to ${windows.current.end} (${windows.current.days} complete days) ` +
    `vs ${windows.previous.start} to ${windows.previous.end} (${windows.previous.days} days)`;
  return windows.comparable
    ? base
    : `${base} — windows are DIFFERENT lengths, so treat every delta as indicative only`;
}
