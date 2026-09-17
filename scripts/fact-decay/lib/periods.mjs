// ---------------------------------------------------------------------------
// REPORTING PERIODS — what time a figure is ABOUT
//
// "6.66% for the week of July 30, 2026" is not a claim about today. It is a
// claim about one specific week, and it stays true after the rate moves. A
// source that now says 6.76% for a LATER week is not disagreeing with it; it is
// describing a different week.
//
// So before anything can be called a contradiction, the agent has to know which
// period each figure refers to, and whether the source's value refers to the
// same one. This module answers that, and only that.
//
// Two kinds of period reference:
//
//   explicit   a date, a "week of", a month-and-year, a quarter. These have a
//              key ("2026-07-30", "2026-07", "2026-Q3") and can be matched
//              against the same period stated on a source.
//   relative   "this week", "the prior week", "a year earlier", "year over
//              year". These tie a figure to a period too — but one that cannot
//              be pinned to a calendar date from the sentence alone, so a
//              figure attached to one can NEVER be contradicted. That is the
//              conservative choice, and it is deliberate.
//
// Deterministic, no network, no model.
// ---------------------------------------------------------------------------

const MONTH_NUMBERS = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

// Longest names first so "sept" wins over "sep" and "june" over "jun".
const MONTH_ALT = Object.keys(MONTH_NUMBERS)
  .sort((a, b) => b.length - a.length)
  .join("|");

const pad = (n) => String(n).padStart(2, "0");

function validDay(year, month, day) {
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

const QUARTER_WORDS = { first: 1, second: 2, third: 3, fourth: 4 };

/**
 * Every period reference in a piece of text, in order.
 *
 * A day with no year ("the week of August 13") inherits the first explicit
 * year stated elsewhere in the same text, and otherwise `defaultYear`. That is
 * how LVINIT writes a run of weekly figures: the year appears once.
 *
 * @returns {Array<{type:"day"|"month"|"quarter"|"relative", key:string,
 *                  text:string, index:number, end:number}>}
 */
export function extractPeriods(text, { defaultYear = null } = {}) {
  const value = String(text ?? "");
  const found = [];
  const taken = [];
  const free = (start, end) => !taken.some(([s, e]) => start < e && end > s);
  const add = (entry) => {
    if (!free(entry.index, entry.end)) return;
    taken.push([entry.index, entry.end]);
    found.push(entry);
  };

  const firstYear = (() => {
    const m = /\b(19|20)\d{2}\b/.exec(value);
    return m ? Number(m[0]) : defaultYear;
  })();

  const day = (year, month, dayOfMonth, m) => {
    const y = year ?? firstYear;
    if (!y || !validDay(y, month, dayOfMonth)) return;
    add({ type: "day", key: `${y}-${pad(month)}-${pad(dayOfMonth)}`, text: m[0], index: m.index, end: m.index + m[0].length });
  };

  let m;

  // "July 30, 2026" · "Sept 3, 2026" · "August 13"
  const monthFirst = new RegExp(`\\b(${MONTH_ALT})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b(?:,?\\s+(\\d{4})\\b)?`, "gi");
  while ((m = monthFirst.exec(value)) !== null) {
    day(m[3] ? Number(m[3]) : null, MONTH_NUMBERS[m[1].toLowerCase()], Number(m[2]), m);
  }

  // "30 July 2026" · "7 July"
  const dayFirst = new RegExp(`\\b(\\d{1,2})\\s+(${MONTH_ALT})\\.?\\b(?:,?\\s+(\\d{4})\\b)?`, "gi");
  while ((m = dayFirst.exec(value)) !== null) {
    day(m[3] ? Number(m[3]) : null, MONTH_NUMBERS[m[2].toLowerCase()], Number(m[1]), m);
  }

  // "7/30/2026" · "07/30/26"
  const numeric = /\b(\d{1,2})\/(\d{1,2})\/(\d{4}|\d{2})\b/g;
  while ((m = numeric.exec(value)) !== null) {
    const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    day(year, Number(m[1]), Number(m[2]), m);
  }

  // "2026-07-30"
  const iso = /\b(\d{4})-(\d{2})-(\d{2})\b/g;
  while ((m = iso.exec(value)) !== null) {
    day(Number(m[1]), Number(m[2]), Number(m[3]), m);
  }

  // "Q3 2026" · "third quarter of 2026"
  const quarter = /\b(?:Q([1-4])\s*(\d{4})|(first|second|third|fourth)\s+quarter(?:\s+of)?\s+(\d{4}))\b/gi;
  while ((m = quarter.exec(value)) !== null) {
    const q = m[1] ? Number(m[1]) : QUARTER_WORDS[m[3].toLowerCase()];
    const y = Number(m[2] ?? m[4]);
    add({ type: "quarter", key: `${y}-Q${q}`, text: m[0], index: m.index, end: m.index + m[0].length });
  }

  // "July 2026" — checked after the day patterns, so "July 30, 2026" is not
  // also read as a month.
  const monthYear = new RegExp(`\\b(${MONTH_ALT})\\.?\\s+(\\d{4})\\b`, "gi");
  while ((m = monthYear.exec(value)) !== null) {
    const month = MONTH_NUMBERS[m[1].toLowerCase()];
    add({ type: "month", key: `${m[2]}-${pad(month)}`, text: m[0], index: m.index, end: m.index + m[0].length });
  }

  // Relative references: a period, but not a calendar-matchable one.
  const relative =
    /\b(?:(?:this|last|the prior|the previous|prior|previous|the same|that)\s+(?:week|month|quarter|year)(?:'s|’s)?|a (?:week|month|year) (?:earlier|ago|before)|(?:year|month|week) over (?:year|month|week)|yoy|mom)\b/gi;
  while ((m = relative.exec(value)) !== null) {
    add({
      type: "relative",
      key: `relative:${m[0].toLowerCase().replace(/['’]s$/, "")}`,
      text: m[0],
      index: m.index,
      end: m.index + m[0].length,
    });
  }

  return found.sort((a, b) => a.index - b.index);
}

/**
 * Where a figure actually sits in a sentence.
 *
 * Not `indexOf`: "6%" is a substring of "6.66%", so a plain search puts the
 * mid-to-high 6% range at the wrong position — and attaches it to the wrong
 * period. The figure must not be preceded by a digit or decimal point, nor
 * followed by a digit.
 */
export function locateFigure(text, figure) {
  const escaped = String(figure).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = new RegExp(`(?<![\\d.,])${escaped}(?![\\d])`).exec(String(text ?? ""));
  return m ? m.index : -1;
}

/** Another figure sitting between a number and a date breaks the attachment. */
const FIGURE_BETWEEN = /\d+(?:\.\d+)?\s?%|\$\s?\d/;

/** So does a clause break: a semicolon, ", and", ", but", ", while", a full stop. */
const CLAUSE_BREAK = /;|,\s*(?:and|but|while|which|whereas|so)\b|\.\s/i;

/**
 * A figure introduced as the thing something moved AWAY from — "up from
 * 6.66%", "compared with 5.98%" — is a comparison baseline. Its period is the
 * earlier one, which the sentence usually does not state.
 */
const BASELINE_BEFORE = /(?:\b(?:up|down|rising|falling|climbing|dropping|rose|fell|increased|decreased)\s+)?\b(?:from|compared (?:with|to)|versus|vs\.?|than)\s*\$?\s*$/i;

export const COMPARISON_BASELINE = {
  type: "relative",
  key: "relative:comparison-baseline",
  text: "comparison baseline (an earlier, unstated period)",
  index: -1,
  end: -1,
};

/**
 * The period a figure belongs to. Returns null when nothing is attached — a
 * figure with no period is an ordinary, undated claim.
 *
 * How English attaches a period to a number, in order:
 *
 *   1. "up from 6.66%" — a comparison baseline. Its period is the earlier,
 *      unstated one, never the date elsewhere in the sentence.
 *   2. "6.69% for the week of August 6" — the nearest period AFTER the figure,
 *      as long as no other figure sits in between.
 *   3. "This week's release: … averaged 6.71%" — otherwise the nearest period
 *      BEFORE it, again with no other figure in between.
 *
 * Rule 2 before rule 3 matters: in "6.69% for the week of August 6, 2026 and
 * 6.67% for the week of August 13", the 6.67% is closer to "August 6" than to
 * "August 13", and belongs to the second.
 */
export function periodForFigure(
  periods,
  figureIndex,
  figureLength,
  { maxGap = 90, maxFollowingGap = 40, maxPrecedingGap = 60, text = null } = {}
) {
  const figureEnd = figureIndex + figureLength;

  if (text != null && BASELINE_BEFORE.test(String(text).slice(Math.max(0, figureIndex - 30), figureIndex))) {
    return COMPARISON_BASELINE;
  }

  // Nothing may sit between a figure and its period: no other figure, and no
  // clause break. Without the clause rule, "income must be at or below
  // $147,300 in Clark County, and the program is available only through
  // December 31, 2025" attached the income limit to the program's DEADLINE —
  // and a deadline is not a reporting period.
  const clearBetween = (from, to) => {
    if (text == null) return true;
    const gap = String(text).slice(from, to);
    return !FIGURE_BETWEEN.test(gap) && !CLAUSE_BREAK.test(gap);
  };

  let following = null;
  let preceding = null;
  for (const p of periods) {
    if (p.index >= figureEnd) {
      const gap = p.index - figureEnd;
      if (gap <= Math.min(maxGap, maxFollowingGap) && clearBetween(figureEnd, p.index) && (!following || gap < following.gap)) {
        following = { period: p, gap };
      }
    } else if (p.end <= figureIndex) {
      const gap = figureIndex - p.end;
      if (gap <= Math.min(maxGap, maxPrecedingGap) && clearBetween(p.end, figureIndex) && (!preceding || gap < preceding.gap)) {
        preceding = { period: p, gap };
      }
    } else {
      return p; // the figure sits inside the period reference itself
    }
  }
  return (following ?? preceding)?.period ?? null;
}

/**
 * The period a value on a SOURCE page refers to: the nearest explicit period
 * reference within `radius` characters of it. Only the nearest one counts —
 * a history table lists many dates, and "any date nearby matches" would pair a
 * value with the wrong row.
 */
export function sourcePeriodNear(text, index, length, { radius = 160, defaultYear = null } = {}) {
  const value = String(text ?? "");
  const start = Math.max(0, index - radius);
  const end = Math.min(value.length, index + length + radius);
  const periods = extractPeriods(value.slice(start, end), { defaultYear })
    .filter((p) => p.type !== "relative")
    .map((p) => ({ ...p, index: p.index + start, end: p.end + start }));
  return periodForFigure(periods, index, length, { maxGap: radius, text: value });
}

/**
 * Do two period references denote the same period?
 * Relative references never match anything — they cannot be pinned down.
 */
export function samePeriod(a, b) {
  if (!a || !b) return false;
  if (a.type === "relative" || b.type === "relative") return false;
  return a.type === b.type && a.key === b.key;
}

/** Human-readable description of a period, for report text. */
export function describePeriod(p) {
  if (!p) return "no stated period";
  if (p.type === "relative") return `"${p.text}"`;
  return `${p.text.trim()} (${p.key})`;
}
