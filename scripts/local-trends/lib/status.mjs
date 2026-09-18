// ---------------------------------------------------------------------------
// PROJECT STATUS — never upgraded without evidence
//
// The ladder, lowest to highest:
//
//   RUMORED / UNCONFIRMED < PROPOSED < FILED < APPROVED < UNDER CONSTRUCTION < OPEN
//
// A status is only accepted when a VERBATIM quote from a non-social source's
// own text supports it. The quote is checked here, in code — not trusted from
// the model — against the headline, feed snippet and article excerpt the agent
// actually fetched. If the quote is not in that text, or does not contain the
// language that status requires, the status is lowered to what the quote DOES
// support, down to RUMORED / UNCONFIRMED.
//
// A watched project's status only ever moves up, and only with such a quote.
// A later, vaguer article never downgrades it — the evidence already on file
// still stands.
// ---------------------------------------------------------------------------

export const RUMORED = "RUMORED / UNCONFIRMED";
export const NOT_A_PROJECT = "NOT A PROJECT";
export const STATUS_LADDER = [RUMORED, "PROPOSED", "FILED", "APPROVED", "UNDER CONSTRUCTION", "OPEN"];
export const ALL_STATUSES = [...STATUS_LADDER, NOT_A_PROJECT];

export function statusRank(status) {
  const i = STATUS_LADDER.indexOf(status);
  return i === -1 ? -1 : i;
}

const FUTURE = /\b(will|would|set to|slated|expected|(?<!master[- ])planned|plans to|scheduled|targeted|could|aims? to|coming|next (year|spring|summer|fall|winter)|by (early |late )?20\d\d|in (early |late )?20\d\d|later this year)\b/;

/** A dated past reference: "opened there in 2021", "since 1963", "years ago". */
const HISTORICAL = /\b(in|since|back in) (19|20)\d\d\b|\b(decades|years) ago\b|\bhistoric(al)?\b/;

/** Wording that says it is open NOW, which a year in the sentence cannot undo. */
const OPEN_NOW = /\b(now open|grand opening|ribbon[- ]cutting|opened (today|this week|on (monday|tuesday|wednesday|thursday|friday|saturday|sunday)))\b/;

/** Language each status needs in its evidence quote. */
const REQUIRES = {
  OPEN: /\b(now open|opened|opens|grand opening|officially open|is open|welcomed (its )?first|ribbon[- ]cutting|debuted)\b/,
  "UNDER CONSTRUCTION": /\b(under construction|construction (is )?(underway|began|begins|has begun|started)|broke ground|breaks ground|groundbreaking|crews (are|have)|topping[- ]out|being built|work (is )?underway|construction continues)\b/,
  APPROVED: /\b(approv\w*|green[- ]?light\w*|ok'?d|signed off|voted (\d+-\d+ )?to (approve|allow|advance)|authoriz\w*|unanimously (backed|passed)|won approval|entitle\w*)\b/,
  FILED: /\b(filed|filing|application|applied|submitted|site plan|zoning (request|change|application)|tentative map|seeks? (approval|permission)|requested|request(s|ing)? (approval|to))\b/,
  PROPOSED: /\b(propos\w*|plan(s|ned)?|pitch\w*|envision\w*|concept|announc\w*|unveil\w*|would (bring|build|include)|eye(s|ing)|considering|could (bring|build))\b/,
};

export function normalizeForMatch(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/** Highest status a single quote supports on its own wording. */
export function statusSupportedBy(quote) {
  const q = ` ${normalizeForMatch(quote)} `;
  if (!q.trim()) return RUMORED;
  for (const status of ["OPEN", "UNDER CONSTRUCTION", "APPROVED", "FILED", "PROPOSED"]) {
    if (!REQUIRES[status].test(q)) continue;
    // "set to open next spring" is not OPEN. Nor is "opened there in 2021":
    // that dates something else, not this project.
    const now = OPEN_NOW.test(q);
    if ((status === "OPEN" || status === "UNDER CONSTRUCTION") && HISTORICAL.test(q) && !now) continue;
    if (status === "OPEN" && FUTURE.test(q) && !now && !/\bopened\b/.test(q)) continue;
    return status;
  }
  return RUMORED;
}

/**
 * Validate a claimed status against the source text the agent fetched.
 *
 * @param {object} claim   { status, evidence, evidenceId }
 * @param {Map<string,object>} itemsById  candidates the claim may cite
 * @returns {{status:string, evidence:string|null, evidenceId:string|null, note:string|null}}
 */
export function validateStatus(claim, itemsById, topicItems = []) {
  const claimed = ALL_STATUSES.includes(claim.status) ? claim.status : RUMORED;
  if (claimed === NOT_A_PROJECT) return { status: NOT_A_PROJECT, evidence: null, evidenceId: null, note: null };
  if (claimed === RUMORED) return { status: RUMORED, evidence: null, evidenceId: null, note: null };

  // When the claim fails, fall back to the best status the topic's own
  // source text states verbatim — never above what was claimed.
  const fallback = (why) => {
    let best = { status: RUMORED, evidence: null, evidenceId: null };
    for (const it of topicItems) {
      if (!it) continue;
      const d = detectStatus(it);
      if (d.evidence && statusRank(d.status) > statusRank(best.status) && statusRank(d.status) <= statusRank(claimed)) {
        best = { status: d.status, evidence: d.evidence, evidenceId: it.id };
      }
    }
    const tail = best.status === RUMORED ? `held at ${RUMORED}` : `the source text itself supports ${best.status}`;
    return { ...best, note: `claimed ${claimed} but ${why} — ${tail}` };
  };

  const item = itemsById.get(claim.evidenceId);
  if (!item) return fallback("cited no fetched source");
  if (item.tier === "social") return fallback("cited a social post, which is never evidence");

  const haystack = normalizeForMatch(`${item.title} . ${item.snippet ?? ""} . ${item.excerpt ?? ""}`);
  const quote = normalizeForMatch(claim.evidence).replace(/^["'.\s]+|["'.\s]+$/g, "");
  if (!quote || quote.length < 12 || !haystack.includes(quote)) return fallback("the evidence quote is not in the source text");

  const supported = statusSupportedBy(quote);
  if (statusRank(supported) < statusRank(claimed)) {
    const fb = fallback(`the quote only supports ${supported}`);
    if (statusRank(fb.status) >= statusRank(supported)) return fb;
    return { status: supported, evidence: claim.evidence, evidenceId: item.id, note: `claimed ${claimed}; the quote only supports ${supported}` };
  }
  return { status: claimed, evidence: claim.evidence, evidenceId: item.id, note: null };
}

/**
 * For rules-only mode: find the sentence in an item's own text that supports
 * the highest status, and return it verbatim as evidence.
 */
export function detectStatus(item) {
  const text = `${item.title}. ${item.snippet ?? ""} ${item.excerpt ?? ""}`;
  const sentences = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length >= 12);
  let best = { status: RUMORED, evidence: null };
  for (const s of sentences) {
    const st = statusSupportedBy(s);
    if (statusRank(st) > statusRank(best.status)) best = { status: st, evidence: s };
  }
  if (item.tier === "social") return { status: RUMORED, evidence: null };
  return best;
}

/** The status a watched project should carry after this run. Up only. */
export function mergeStatus(previous, next) {
  if (!previous || statusRank(next.status) > statusRank(previous)) return { status: next.status, changed: Boolean(previous) && next.status !== previous };
  return { status: previous, changed: false };
}
