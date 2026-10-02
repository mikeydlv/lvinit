// ---------------------------------------------------------------------------
// FAIR HOUSING + VOICE
//
// Fair Housing rules are LVINIT's shared ones (the GSC agent's, through the
// Internal Linking Agent's single "single-family" property-type exemption),
// reused unchanged. Two different jobs:
//
//   1. TRANSCRIPT SCAN. People say "great for families" or "safe area" on
//      camera without meaning to steer. Those sentences are FLAGGED with their
//      timecode so the Publisher never carries the framing into copy. A flag in
//      the transcript does not block the video — it blocks the sentence.
//
//   2. GENERATED TEXT GATE. Every title, meta line, heading, FAQ question and
//      answer, CTA and link anchor this pipeline proposes is checked. Anything
//      that trips a rule is a BLOCKER: the item cannot be handed off until a
//      human rewrites it with objective housing / amenity / access language.
//
// The voice check is editorial, not legal: it catches the generic, tourism and
// AI-boilerplate phrasing LVINIT never uses.
// ---------------------------------------------------------------------------

import { checkFairHousingForLinks } from "../../internal-links/lib/fair-housing.mjs";

/**
 * Spoken English uses "single" to mean "one" constantly ("before I looked at a
 * single listing", "a single-story home"), and the shared familial-status rule
 * reads every "single" as a household. Exactly those counting / building senses
 * are neutralized before the shared check, the same narrow way the Internal
 * Linking Agent neutralizes "single-family". A household sense ("single
 * people", "great for singles") is untouched and still blocked.
 */
const SINGLE_AS_ONE = [
  /\b(a|one|every|any|each|the)\s+single\s+(?!(?:people|person|persons|parents?|moms?|dads?|mothers?|fathers?|adults?|men|women|guys?)\b)/gi,
  /\bsingle[-\s](story|stor(?:e)?y|level|listing|lot|offer|day|week|month|year|time|thing|step|payment|number|biggest)\b/gi,
];

export function neutralizeCountingSingle(text) {
  let out = String(text ?? "");
  for (const re of SINGLE_AS_ONE) out = out.replace(re, (m) => m.replace(/single/i, "lone"));
  return out;
}

export function fairHousing(text) {
  return checkFairHousingForLinks(neutralizeCountingSingle(text));
}

/** Transcript sentences that must not be carried into copy as spoken. */
export function scanTranscript(sentences) {
  const flags = [];
  for (const s of sentences) {
    const v = fairHousing(s.text);
    if (v.blocked) flags.push({ timecode: s.timecode, sentence: s.text, category: v.category, matched: v.matched, reason: v.reason });
  }
  return flags;
}

/**
 * Check every generated string. `fields` is a flat list of { field, text }.
 * @returns {{clean:boolean, blocked:Array}}
 */
export function checkGenerated(fields) {
  const blocked = [];
  for (const { field, text } of fields) {
    if (!text) continue;
    const v = fairHousing(text);
    if (v.blocked) blocked.push({ field, text, category: v.category, matched: v.matched, reason: v.reason });
  }
  return { clean: blocked.length === 0, blocked };
}

/** The pipeline's Fair Housing status for one video. */
export function fairHousingStatus({ transcriptFlags, generated, topicVerdict }) {
  if (topicVerdict?.blocked) return { status: "BLOCKED", reason: `the video's topic itself trips the ${topicVerdict.category} rule` };
  if (!generated.clean) return { status: "BLOCKED", reason: `${generated.blocked.length} generated line(s) trip a Fair Housing rule` };
  if (transcriptFlags.length) return { status: "FLAGGED_SOURCE", reason: `${transcriptFlags.length} spoken line(s) must not be carried into copy as said` };
  return { status: "CLEAR", reason: "no Fair Housing language in the transcript or the generated draft" };
}

/** Phrases LVINIT never publishes. */
export const BANNED_PHRASES = [
  /\bvibrant\b/i,
  /\bsomething for everyone\b/i,
  /\bnestled\b/i,
  /\bhidden gems?\b/i,
  /\bbustling\b/i,
  /\bworld[- ]class\b/i,
  /\bsin city\b/i,
  /\bwhat happens in vegas\b/i,
  /\bentertainment capital\b/i,
  /\bdesert oasis\b/i,
  /\bparadise\b/i,
  /\bdream home\b/i,
  /\blook no further\b/i,
  /\bin today'?s (fast[- ]paced|market|world)\b/i,
  /\b(let'?s|we'?ll) dive (in|into)\b/i,
  /\bdelve\b/i,
  /\bwhether you'?re (a|an|looking)\b/i,
  /\bin conclusion\b/i,
  /\bultimate guide\b/i,
  /\beverything you need to know\b/i,
  /\bunlock\b/i,
];

export function voiceCheck(fields) {
  const hits = [];
  for (const { field, text } of fields) {
    for (const re of BANNED_PHRASES) {
      const m = re.exec(String(text ?? ""));
      if (m) hits.push({ field, matched: m[0] });
    }
  }
  return { clean: hits.length === 0, hits };
}
