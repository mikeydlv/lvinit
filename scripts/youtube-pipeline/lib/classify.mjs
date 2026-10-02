// ---------------------------------------------------------------------------
// CONTENT ACTION — what this video should become on the site
//
// A video is not an article by default. The tree is ordered so that a new URL
// is the LAST resort (the content cluster map's video companion rule, D6):
//
//   0. not approved                                   -> not analyzed at all
//   1. a Short, or off-mission                        -> MONITOR_ONLY
//   2. the video's own topic trips Fair Housing       -> MONITOR_ONLY (blocked)
//   3. already embedded on its companion page:
//        the video covers facets the page doesn't     -> UPDATE_EXISTING_ARTICLE
//        enough real Q&A and the page has no FAQ      -> CREATE_FAQ_SECTION
//        otherwise                                    -> REJECT_DUPLICATE
//   4. SAME page exists (video not on it):
//        facets missing from the page                 -> UPDATE_EXISTING_ARTICLE
//        otherwise                                    -> ADD_VIDEO_TO_EXISTING_ARTICLE
//   5. SUBSTANTIAL page exists:
//        facets missing                               -> UPDATE_EXISTING_ARTICLE
//        enough Q&A, page has no FAQ                  -> CREATE_FAQ_SECTION
//        otherwise                                    -> ADD_VIDEO_TO_EXISTING_ARTICLE
//   6. ADJACENT only:
//        a place comparison next to a comparison page -> CREATE_COMPARISON_SUPPORT
//        one place/subject next to its pillar         -> CREATE_NEIGHBORHOOD_SUPPORT
//        a distinct reader question + enough substance-> NEW_ARTICLE
//        otherwise                                    -> VIDEO_ONLY_NO_ARTICLE
//   7. DISTINCT: enough substance -> NEW_ARTICLE, else VIDEO_ONLY_NO_ARTICLE
//
// "Enough substance" is measured on the transcript. Without a transcript the
// action is still named (from the title and the site), but it is PROVISIONAL
// and nothing that needs copy is drafted: TRANSCRIPT_REQUIRED.
// ---------------------------------------------------------------------------

import { COPY_ACTIONS } from "../config.mjs";

/** Is there enough in the transcript to carry its own page? */
export function substance(transcript, claims, config) {
  if (!transcript || transcript.status !== "OK") return { known: false, enough: false, reason: "no transcript" };
  const substantive = (claims?.counts?.fact ?? 0) + (claims?.counts?.opinion ?? 0);
  const enough = transcript.words >= config.transcript.minWordsForArticle && substantive >= config.classify.minSubstantiveSentences;
  return {
    known: true,
    enough,
    words: transcript.words,
    substantiveSentences: substantive,
    reason: enough
      ? `${transcript.words} words, ${substantive} substantive sentences`
      : `${transcript.words} words / ${substantive} substantive sentences is below ${config.transcript.minWordsForArticle} / ${config.classify.minSubstantiveSentences}`,
  };
}

/**
 * @returns {{action, target, reasons:string[], provisional:boolean, transcriptRequired:boolean}}
 */
export function classifyVideo({ video, group, overlap, transcript, claims, faq, topicFairHousing, config }) {
  const reasons = [];
  const done = (action, target, extra = {}) => {
    const transcriptRequired = COPY_ACTIONS.has(action) && transcript?.status !== "OK";
    if (transcriptRequired) reasons.push("TRANSCRIPT_REQUIRED: this action needs written copy, and no usable transcript exists — nothing is drafted from the title alone");
    return { action, target: target ?? null, reasons, provisional: transcriptRequired, transcriptRequired, ...extra };
  };
  const enough = substance(transcript, claims, config);
  const faqPairs = (faq ?? []).filter((f) => f.status !== "blocked").length;
  const facetMin = config.classify.minMissingFacetsForUpdate;

  // 1. Shorts and off-mission videos.
  if (video.durationSeconds && video.durationSeconds < config.video.minLongFormSeconds) {
    reasons.push(`${video.durationSeconds}s is a Short, not a long-form video — the pipeline only turns long-form videos into site content`);
    return done("MONITOR_ONLY");
  }
  if (group.offTopic || (group.cluster === "general" && group.relevance < 0.5 && (overlap.best?.relation ?? "distinct") === "distinct")) {
    reasons.push("the video's topic sits outside LVINIT's clusters");
    return done("MONITOR_ONLY");
  }

  // 2. Fair Housing on the topic itself.
  if (topicFairHousing?.blocked) {
    reasons.push(`the video's title trips the ${topicFairHousing.category} Fair Housing rule ("${topicFairHousing.matched}") — a human decides how, or whether, it becomes site content`);
    return done("MONITOR_ONLY", null, { blocked: true });
  }

  // 3. Already embedded on its companion.
  const companion =
    overlap.embeddedPages.find((p) => p.route === video.siteVideoObjectRoute) ??
    overlap.embeddedPages.find((p) => p.relation === "same" || p.relation === "substantial") ??
    null;
  if (companion) {
    reasons.push(`already embedded on ${companion.route} (${companion.label})${companion.route === video.siteVideoObjectRoute ? ", which carries its VideoObject" : ""}`);
    const missing = enough.known ? companion.missingFacets : [];
    if (missing.length >= facetMin && enough.enough) {
      reasons.push(`the video covers ${missing.join(", ")}, which ${companion.route} does not visibly address`);
      return done("UPDATE_EXISTING_ARTICLE", companion.route);
    }
    if (faqPairs >= config.classify.minFaqPairs && !companion.hasFaq) {
      reasons.push(`${faqPairs} question/answer pairs come straight from the video, and ${companion.route} has no FAQ section`);
      return done("CREATE_FAQ_SECTION", companion.route);
    }
    reasons.push("its companion already covers what the video says — nothing to add");
    return done("REJECT_DUPLICATE", companion.route);
  }
  if (overlap.embeddedPages.length) {
    reasons.push(`embedded on ${overlap.embeddedPages.map((p) => p.route).join(", ")}, but none of those pages is about this video's question`);
  }

  // A deliberate manifest target outranks the inferred best match.
  const best = overlap.manifestTarget && overlap.manifestTarget.relation !== "distinct" ? overlap.manifestTarget : overlap.best;
  if (overlap.manifestTarget && best === overlap.manifestTarget) reasons.push(`the manifest names ${best.route} as the related page`);
  const relation = best?.datedRecord && best.relation !== "distinct" ? "adjacent" : best?.relation ?? "distinct";
  if (best?.datedRecord && best.relation !== relation) reasons.push(`${best.route} is a dated record; it is never rewritten for an evergreen video`);

  if (overlap.cannibalization?.status && overlap.cannibalization.status !== "none") {
    reasons.push(`existing pages already compete for this question (${overlap.cannibalization.routes.join(", ")}) — no new URL`);
  }

  // 4-5. SAME / SUBSTANTIAL.
  if (relation === "same" || relation === "substantial") {
    const missing = enough.known ? best.missingFacets : [];
    reasons.push(`${best.route} is ${best.label} (overlap ${best.overlap}${best.titleSimilarity ? `, title similarity ${best.titleSimilarity}` : ""})`);
    if (missing.length >= facetMin && enough.enough) {
      reasons.push(`the video covers ${missing.join(", ")}, which the page does not visibly address`);
      return done("UPDATE_EXISTING_ARTICLE", best.route);
    }
    if (relation === "substantial" && faqPairs >= config.classify.minFaqPairs && !best.hasFaq) {
      reasons.push(`${faqPairs} question/answer pairs from the video, and the page has no FAQ section`);
      return done("CREATE_FAQ_SECTION", best.route);
    }
    reasons.push("the page already answers the question; the video adds a firsthand version of it");
    return done("ADD_VIDEO_TO_EXISTING_ARTICLE", best.route);
  }

  if (overlap.cannibalization?.status && overlap.cannibalization.status !== "none") {
    return done("VIDEO_ONLY_NO_ARTICLE", best?.route ?? null);
  }

  // 6. ADJACENT.
  if (relation === "adjacent") {
    reasons.push(`closest page: ${best.route} (ADJACENT, overlap ${best.overlap})`);
    const placeComparison = group.shape === "comparison" && group.compared.every((k) => k.startsWith("place:"));
    if (placeComparison && /-vs-/.test(best.route) && enough.enough) {
      reasons.push("a place comparison next to an existing comparison page: a supporting piece that links to it, not a rival");
      return done("CREATE_COMPARISON_SUPPORT", best.route);
    }
    const singlePlace = group.shape === "topic" && group.places.length + group.subjects.length === 1;
    const pillar = singlePlace ? overlap.topMatches.find((m) => m.section === "neighborhood" && m.relation !== "distinct") : null;
    if (pillar && enough.enough) {
      reasons.push(`one place or project, next to its pillar ${pillar.route}: a child story under it`);
      return done("CREATE_NEIGHBORHOOD_SUPPORT", pillar.route);
    }
    if (overlap.distinctQuestion && (enough.enough || !enough.known)) {
      reasons.push("no published page commits to this question in its route or headline — a distinct reader question");
      if (!enough.known) reasons.push("substance can't be judged without a transcript");
      return done("NEW_ARTICLE", null, { parent: best.route });
    }
    reasons.push(overlap.distinctQuestion ? `not enough substance for its own page (${enough.reason})` : `${overlap.committedBy.join(", ")} already commits to this question`);
    return done("VIDEO_ONLY_NO_ARTICLE", best.route);
  }

  // 7. DISTINCT.
  reasons.push("nothing published covers this question");
  if (enough.enough || !enough.known) {
    if (!enough.known) reasons.push("substance can't be judged without a transcript");
    return done("NEW_ARTICLE", null);
  }
  reasons.push(`not enough substance for its own page (${enough.reason})`);
  return done("VIDEO_ONLY_NO_ARTICLE", null);
}
