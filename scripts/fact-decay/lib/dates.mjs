// ---------------------------------------------------------------------------
// DATE HANDLING
//
// One place decides what "today" means and how a date written in English turns
// into a comparable value. Nothing else in this agent should build or parse a
// date string.
//
// The three primitives (parse, format, add) are IMPORTED from the GSC agent's
// windows.mjs rather than reimplemented. Two agents in one repository disagreeing
// about what "2026-09-04" means is a bug waiting to happen, and that module is
// already the repository's answer. This file only READS it — the GSC agent is
// never modified by anything here.
// ---------------------------------------------------------------------------

import { parseISODate, formatISODate, addDays } from "../../gsc/lib/windows.mjs";

export { parseISODate, formatISODate, addDays };

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/** Whole days from `fromISO` to `toISO`. Negative means `toISO` is earlier. */
export function daysBetween(fromISO, toISO) {
  const from = parseISODate(fromISO);
  const to = parseISODate(toISO);
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

/** The calendar year of a YYYY-MM-DD string. */
export function yearOf(iso) {
  return Number(String(iso).slice(0, 4));
}

/**
 * Parse a date written the way LVINIT writes them, into YYYY-MM-DD.
 *
 * Handles the shapes that actually appear in the repository:
 *   "Checked 20 August 2026"      -> 2026-08-20
 *   "20 August 2026"              -> 2026-08-20
 *   "August 20, 2026"             -> 2026-08-20
 *   "December 2025"               -> 2025-12-01  (dayKnown: false)
 *   "2026-08-20"                  -> 2026-08-20
 *
 * Returns null rather than guessing. A month-only date resolves to the FIRST of
 * the month, and says so via `dayKnown`, because assuming the last day of a
 * month would quietly make content look fresher than it is.
 */
export function parseHumanDate(text) {
  const value = String(text ?? "").trim();
  if (!value) return null;

  const iso = /(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) return { iso: `${iso[1]}-${iso[2]}-${iso[3]}`, dayKnown: true, precision: "day" };

  const monthNames = MONTHS.join("|");

  // "20 August 2026"
  const dayFirst = new RegExp(`\\b(\\d{1,2})\\s+(${monthNames})\\s+(\\d{4})\\b`, "i").exec(value);
  if (dayFirst) return build(dayFirst[3], dayFirst[2], dayFirst[1]);

  // "August 20, 2026" / "August 20 2026"
  const monthFirst = new RegExp(`\\b(${monthNames})\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})\\b`, "i").exec(value);
  if (monthFirst) return build(monthFirst[3], monthFirst[1], monthFirst[2]);

  // "August 2026" — month precision only.
  const monthOnly = new RegExp(`\\b(${monthNames})\\s+(\\d{4})\\b`, "i").exec(value);
  if (monthOnly) {
    const built = build(monthOnly[2], monthOnly[1], 1);
    return built ? { ...built, dayKnown: false, precision: "month" } : null;
  }

  return null;

  function build(year, monthName, day) {
    const monthIndex = MONTHS.indexOf(String(monthName).toLowerCase());
    if (monthIndex < 0) return null;
    const d = Number(day);
    if (!Number.isFinite(d) || d < 1 || d > 31) return null;
    const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    try {
      parseISODate(iso);
    } catch {
      return null;
    }
    return { iso, dayKnown: true, precision: "day" };
  }
}

/**
 * Every date mentioned inside a piece of text, as YYYY-MM-DD, in the order they
 * appear. Used to spot deadlines and scheduled events that have already passed.
 */
export function extractDates(text) {
  const value = String(text ?? "");
  const found = [];
  const monthNames = MONTHS.join("|");

  const patterns = [
    new RegExp(`\\b\\d{1,2}\\s+(?:${monthNames})\\s+\\d{4}\\b`, "gi"),
    new RegExp(`\\b(?:${monthNames})\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+\\d{4}\\b`, "gi"),
    new RegExp(`\\b(?:${monthNames})\\s+\\d{4}\\b`, "gi"),
    /\b\d{4}-\d{2}-\d{2}\b/g,
  ];

  // The patterns are ordered most-specific first, and they overlap by design:
  // "1 June 2026" is matched by the day-first pattern AND by the month-only
  // one. A match whose span overlaps an already-accepted match is the same date
  // seen less precisely, so it is dropped rather than counted twice.
  const spans = [];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(value)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      if (spans.some(([s, e]) => start < e && end > s)) continue;
      const parsed = parseHumanDate(m[0]);
      if (!parsed) continue;
      spans.push([start, end]);
      found.push({ ...parsed, text: m[0], index: start });
    }
  }
  return found.sort((a, b) => a.index - b.index);
}

/** Every four-digit year mentioned in a piece of text. */
export function extractYears(text) {
  const years = [];
  const re = /\b(19|20)\d{2}\b/g;
  let m;
  while ((m = re.exec(String(text ?? ""))) !== null) years.push(Number(m[0]));
  return years;
}

/** Format a YYYY-MM-DD as "20 August 2026", the way the site writes dates. */
export function formatHuman(iso) {
  if (!iso) return "unknown";
  const d = parseISODate(iso);
  const month = MONTHS[d.getUTCMonth()];
  return `${d.getUTCDate()} ${month[0].toUpperCase()}${month.slice(1)} ${d.getUTCFullYear()}`;
}
