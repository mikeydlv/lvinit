// ---------------------------------------------------------------------------
// DEVELOPMENT STATUS — a controlled vocabulary, proven by verbatim text
//
// Progress ladder (rank):
//
//   unclear 0
//   proposed 1 · announced 1
//   filed 2 · under review 2
//   approved 3 · entitled 3 · planned 3 (LVINIT roster label only)
//   pre-construction 4          demolition, site work, permits — not building yet
//   under construction 5
//   partially open 6            first phase / first homes / sales open
//   open 7
//
// Side states (no rank — they need their own explicit evidence):
//
//   delayed · paused · cancelled · denied
//
// A status is only ever taken from a sentence of a source's OWN text that
// contains that status's language. "Set to open in 2027" is not open; "broke
// ground in 2019" is not this year's construction; "will break ground" is not
// under construction. Marketing words ("coming soon", "now selling") never
// establish construction. The future/historical guards are the Local Trend
// Agent's own (../../lib/status.mjs), reused so both agents read time the same way.
// ---------------------------------------------------------------------------

import { FUTURE, HISTORICAL, OPEN_NOW, REQUIRES as TREND_REQUIRES, normalizeForMatch } from "../../lib/status.mjs";

export const STATUS = {
  UNCLEAR: "unclear",
  PROPOSED: "proposed",
  ANNOUNCED: "announced",
  FILED: "filed",
  UNDER_REVIEW: "under review",
  APPROVED: "approved",
  ENTITLED: "entitled",
  PLANNED: "planned",
  PRE_CONSTRUCTION: "pre-construction",
  UNDER_CONSTRUCTION: "under construction",
  PARTIALLY_OPEN: "partially open",
  OPEN: "open",
  DELAYED: "delayed",
  PAUSED: "paused",
  CANCELLED: "cancelled",
  DENIED: "denied",
};

const RANK = {
  unclear: 0,
  proposed: 1,
  announced: 1,
  filed: 2,
  "under review": 2,
  approved: 3,
  entitled: 3,
  planned: 3,
  "pre-construction": 4,
  "under construction": 5,
  "partially open": 6,
  open: 7,
};

export const SIDE_STATES = new Set([STATUS.DELAYED, STATUS.PAUSED, STATUS.CANCELLED, STATUS.DENIED]);
export const ALL_STATUSES = [...Object.keys(RANK), ...SIDE_STATES];
/** Statuses that mean the project is still early — too early for new content on its own. */
export const EARLY_STATUSES = new Set([STATUS.UNCLEAR, STATUS.PROPOSED, STATUS.ANNOUNCED, STATUS.FILED, STATUS.UNDER_REVIEW]);

export function statusRank(status) {
  return RANK[status] ?? -1;
}

export function isSideState(status) {
  return SIDE_STATES.has(status);
}

/** LVINIT's roster uses three states; map them onto the vocabulary. */
export function fromRosterStatus(s) {
  return { open: STATUS.OPEN, "under-construction": STATUS.UNDER_CONSTRUCTION, planned: STATUS.PLANNED }[s] ?? STATUS.UNCLEAR;
}

// Order matters: the first status whose language a sentence carries wins.
const DETECTORS = [
  {
    status: STATUS.CANCELLED,
    re: /\b(cancel+ed|scrapped|abandon(ed|s) (its |the )?(plans?|project)|pull(ed|s) the plug|won'?t (be built|move forward)|no longer (plans?|moving forward)|terminat(ed|es) (the |its )?(deal|agreement|contract)|deal (fell|falls|has fallen) (apart|through)|withdr[ae]w(n)? (the |its )?(application|proposal|plans?))\b/,
    guard: "future",
  },
  { status: STATUS.DENIED, re: /\b(denied|voted (\d+-\d+ )?(down|against)|turned down|rejected (the |a )?(plan|proposal|project|application|zoning|rezoning))\b/, guard: "future" },
  { status: STATUS.PAUSED, re: /\b(paused|on hold|halted|stalled|suspended (construction|work|the project))\b/, guard: "future" },
  {
    status: STATUS.DELAYED,
    re: /\b(project|construction|opening|completion|groundbreaking|work)\b[^.]{0,40}\b(delayed|pushed back|postponed|behind schedule)\b|\b(delayed|pushed back|postponed)\b[^.]{0,40}\b(opening|completion|construction|groundbreaking|until|to (early |late )?20\d\d)\b/,
    guard: null,
  },
  { status: STATUS.OPEN, re: TREND_REQUIRES.OPEN, guard: "open" },
  {
    status: STATUS.PARTIALLY_OPEN,
    re: /\b(first (phase|homes?|neighborhood|section)[^.]{0,30}\b(open|opened|opens)|open(ed|s)? (its )?first(-| )phase|first-phase sales|sales (are |now )?open|model homes? (are |now )?open|partially open|phase (one|1) (is |now )?open)\b/,
    guard: "open",
  },
  {
    status: STATUS.UNDER_CONSTRUCTION,
    re: new RegExp(`${TREND_REQUIRES["UNDER CONSTRUCTION"].source}|\\b\\d{1,3}% (complete|completed|finished|done)\\b`),
    guard: "construction",
  },
  {
    status: STATUS.PRE_CONSTRUCTION,
    re: /\b(demolition (is |has )?(began|begins|begun|underway|started|starts)|site (work|preparation|grading) (is |has )?(began|begun|underway|started)|permits? (were |was |have been )?(issued|pulled|granted))\b/,
    guard: "construction",
  },
  { status: STATUS.ENTITLED, re: /\bentitle(d|ments? (were |was |have been )?(approved|granted|secured))\b/, guard: "future" },
  { status: STATUS.APPROVED, re: TREND_REQUIRES.APPROVED, guard: "future" },
  {
    status: STATUS.UNDER_REVIEW,
    re: /\b(under review|public hearing|(planning commission|city council|county commission|commissioners|council members) (will|is set to|are set to|to|could) (consider|vote|hear|review)|scheduled (for|to go before) (a |the )?(vote|hearing|council|commission)|heads? to (the )?(council|commission)|held over|holdover)\b/,
    guard: null,
  },
  { status: STATUS.FILED, re: TREND_REQUIRES.FILED, guard: null },
  { status: STATUS.ANNOUNCED, re: /\b(announc\w*|unveil\w*|revealed plans|introduc(ed|es) plans)\b/, guard: null },
  { status: STATUS.PROPOSED, re: TREND_REQUIRES.PROPOSED, guard: null },
];

/** "which opened last year", "earlier this year" — a dated reference, not today's news. */
const RECENT_PAST = /\b(last (year|month|spring|summer|fall|winter)|earlier this year|previously|a year ago|the other)\b/;

function guarded(kind, q) {
  const now = OPEN_NOW.test(q);
  if ((kind === "open" || kind === "construction") && RECENT_PAST.test(q) && !now) return true;
  if (kind === "open") {
    if (HISTORICAL.test(q) && !now) return true;
    if (FUTURE.test(q) && !now && !/\bopened\b/.test(q)) return true;
    // "Grand opening set for Oct. 16" is a future event, not an open project.
    if (/\bgrand opening\b[^.]{0,30}\b(set|scheduled|planned|slated|will|on (mon|tue|wed|thu|fri|sat|sun)|in (early |late )?20\d\d|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\.? \d)/.test(q)) return true;
  }
  if (kind === "construction") {
    if (HISTORICAL.test(q) && !/\b(this (week|month|year)|today|on (monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/.test(q)) return true;
    if (/\b(will|to|set to|plans? to|expected to|slated to|could|would|aims? to) (break|breaks|begin|start|commence)\b/.test(q)) return true;
    if (/\b(groundbreaking|construction)\b[^.]{0,25}\b(expected|slated|set|scheduled|planned|could|would|will)\b/.test(q)) return true;
  }
  if (kind === "future") {
    if (/\b(could|would|may|might|expected to|set to|likely to|poised to|seeks?|seeking|asks?|asking|hopes? to|plans? to seek)\b[^.]{0,25}\b(approv\w*|entitle\w*|cancel\w*|deny|denied|pause\w*|halt\w*)/.test(q)) return true;
    if (/\b(approv\w*|vote)\b[^.]{0,20}\b(next (week|month)|expected|scheduled|pending)\b/.test(q)) return true;
  }
  return false;
}

/** The status a single sentence supports on its own wording (never above what it says). */
export function statusFromSentence(sentence) {
  const q = ` ${normalizeForMatch(sentence)} `;
  if (!q.trim()) return STATUS.UNCLEAR;
  for (const d of DETECTORS) {
    if (!d.re.test(q)) continue;
    if (d.guard && guarded(d.guard, q)) continue;
    return d.status;
  }
  return STATUS.UNCLEAR;
}

export function splitSentences(text) {
  return String(text ?? "")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9“"'])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 12);
}

/**
 * Pick the most informative status the item's own text states, with the
 * sentence that states it. Side states (cancelled, paused, delayed, denied)
 * beat ladder states: "construction began in 2024 but the project is now on
 * hold" is paused.
 *
 * `residentialCommunity`: a builder community "opening" is sales opening, not
 * a finished neighborhood — it is recorded as partially open.
 *
 * @returns {{status:string, evidence:string|null}}
 */
export function detectStatus(text, { residentialCommunity = false } = {}) {
  let best = { status: STATUS.UNCLEAR, evidence: null };
  for (const s of splitSentences(text)) {
    let st = statusFromSentence(s);
    if (st === STATUS.OPEN && residentialCommunity && !/\b(completed|built out|sold out|final homes)\b/i.test(s)) st = STATUS.PARTIALLY_OPEN;
    if (st === STATUS.UNCLEAR) continue;
    if (isSideState(st) && !isSideState(best.status)) {
      best = { status: st, evidence: s };
      continue;
    }
    if (isSideState(best.status)) continue;
    if (statusRank(st) > statusRank(best.status)) best = { status: st, evidence: s };
  }
  return best;
}

/** Is `next` progress over `prev`? Side states are always a change when they differ. */
export function isStatusChange(prev, next) {
  if (!next || next === STATUS.UNCLEAR) return false;
  if (!prev || prev === STATUS.UNCLEAR) return true;
  if (prev === next) return false;
  if (isSideState(next)) return true;
  if (isSideState(prev)) return statusRank(next) >= statusRank(STATUS.UNDER_CONSTRUCTION); // work resumed / opened
  if (prev === STATUS.PLANNED && statusRank(next) <= statusRank(STATUS.PLANNED)) return false;
  return statusRank(next) > statusRank(prev);
}
