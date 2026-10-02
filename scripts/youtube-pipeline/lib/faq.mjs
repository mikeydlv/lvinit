// ---------------------------------------------------------------------------
// FAQ CANDIDATES — only questions the video actually asks and answers
//
// A candidate is a question Mikey asks on camera, answered by the sentences he
// says right after it. Nothing is paraphrased into an answer he didn't give,
// and no question is invented to fill a section.
//
//   ready               every answer sentence is his opinion / guidance
//   needs-verification  the answer contains a fact that must be checked first
//   blocked             the question or answer trips a Fair Housing rule
//
// FAQ schema: guide pages on LVINIT emit FAQPage for a visible FAQ; area pillars
// deliberately do not (components/area/AreaFAQ.tsx explains why). The pipeline
// recommends schema only when the page will visibly show the same Q&A.
// ---------------------------------------------------------------------------

import { analyzeQuery } from "../../content-briefs/lib/intent.mjs";

import { fairHousing } from "./compliance.mjs";

/** Rhetorical tags and fragments that end in "?" but ask nothing. */
const NOT_A_QUESTION = /^(right|okay|ok|so|yeah|you know|make sense|does that make sense|why|how|what|really|huh|see)\??$/i;

/** A real question with something in it to answer. */
export function isUsableQuestion(text, { minWords = 5 } = {}) {
  const t = String(text ?? "").trim();
  if (!t.endsWith("?")) return false;
  if (NOT_A_QUESTION.test(t)) return false;
  if (t.split(/\s+/).length < minWords) return false;
  // It has to be about something LVINIT covers, or be a clear decision question.
  const q = analyzeQuery(t);
  const named = q.places.length + q.subjects.length + q.concepts.length + q.facets.length;
  return named > 0 || /\b(should|when|how much|how long|is it|do you|does it|can you|what('?s| is| are| do))\b/i.test(t);
}

/** Questions phrased to the viewer → the reader-facing form. Light touch only. */
export function readerQuestion(text) {
  return String(text)
    .trim()
    .replace(/^(so|and|but|now|okay|ok|well),?\s+/i, "")
    // Spoken list numbering: "Four, and this is the big one, if your home…"
    .replace(/^(?:first|second|third|fourth|fifth|one|two|three|four|five|number \w+)\b,?\s*(?:and\s+[^,?]{0,40},\s*)?/i, "")
    .replace(/^(?:at that point|in that case),\s*/i, "")
    .replace(/^./, (c) => c.toUpperCase());
}

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

/**
 * @param {Array} sentences  classified transcript sentences (claims.mjs)
 */
export function extractFaq(sentences, { maxAnswerSentences = 3, max = 6 } = {}) {
  const out = [];
  const seen = new Set();
  for (let i = 0; i < sentences.length; i++) {
    const q = sentences[i];
    if (!isUsableQuestion(q.text)) continue;
    const answer = [];
    for (let j = i + 1; j < sentences.length && answer.length < maxAnswerSentences; j++) {
      if (sentences[j].text.trim().endsWith("?")) break;
      answer.push(sentences[j]);
    }
    if (answer.length === 0) continue;
    const question = readerQuestion(q.text);
    const key = norm(question);
    if (seen.has(key)) continue;
    seen.add(key);

    const fh = [q, ...answer].map((s) => ({ s, v: fairHousing(s.text) })).filter((x) => x.v.blocked);
    const verify = answer.filter((s) => s.needsVerification);
    out.push({
      question,
      answer: answer.map((s) => s.text).join(" "),
      timecode: q.timecode,
      answerTimecodes: answer.map((s) => s.timecode),
      answerKinds: answer.map((s) => s.kind),
      status: fh.length ? "blocked" : verify.length ? "needs-verification" : "ready",
      fairHousing: fh.map((x) => ({ category: x.v.category, matched: x.v.matched, timecode: x.s.timecode })),
      verify: verify.map((s) => ({ timecode: s.timecode, claim: s.text, families: s.families })),
      source: "transcript",
    });
  }
  // Ready answers first, then ones that only need a fact checked.
  const rank = { ready: 0, "needs-verification": 1, blocked: 2 };
  return out.sort((a, b) => rank[a.status] - rank[b.status]).slice(0, max);
}

/** FAQ schema recommendation for a target route. */
export function faqSchemaRecommendation({ faq, targetRoute, targetSection }) {
  const usable = faq.filter((f) => f.status !== "blocked");
  if (usable.length === 0) return { recommend: false, reason: "no usable question/answer pairs from the video" };
  if (targetSection === "neighborhood" || /^\/neighborhoods\/[^/]+$/.test(String(targetRoute ?? ""))) {
    return {
      recommend: false,
      reason: "area pillars render AreaFAQ without FAQPage schema by design (components/area/AreaFAQ.tsx); a visible FAQ only",
    };
  }
  return {
    recommend: true,
    type: "FAQPage",
    condition: "only for questions rendered visibly on the page, with the same wording, after every needs-verification answer has been checked",
    reason: "LVINIT guide pages emit FAQPage for their visible FAQ section (e.g. /guides/is-las-vegas-a-buyers-market)",
    eligibleNow: usable.filter((f) => f.status === "ready").length,
    afterVerification: usable.filter((f) => f.status === "needs-verification").length,
  };
}
