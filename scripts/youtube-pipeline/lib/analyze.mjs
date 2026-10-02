// ---------------------------------------------------------------------------
// ANALYSIS — one approved video, end to end
//
//   transcript → claims (fact / opinion / verify) → topic → overlap with the
//   site → action → draft (only what the action needs) → FAQ → embed + schema
//   → images → link suggestions → Fair Housing + voice gates → confidence →
//   fingerprint / lifecycle → handoff eligibility
//
// Pure apart from reading the transcript file and the repo: no network, no
// writes. run.mjs does the writing.
// ---------------------------------------------------------------------------

import { extractEntities, normalizeQuery } from "../../content-briefs/lib/intent.mjs";

import { NEW_URL_ACTIONS, PUBLISHER_ACTIONS } from "../config.mjs";
import { analyzeClaims, verificationChecklist } from "./claims.mjs";
import { classifyVideo } from "./classify.mjs";
import { checkGenerated, fairHousingStatus, scanTranscript, voiceCheck } from "./compliance.mjs";
import { confidenceFor } from "./confidence.mjs";
import { ctaRecommendation, draftSections, embedPlacement, generatedFields, proposeHeadlines, proposeRoute, topicFairHousing } from "./draft.mjs";
import { extractFaq, faqSchemaRecommendation } from "./faq.mjs";
import { handoffEligibility } from "./handoff.mjs";
import { lifecycleFor, settledSkip, videoFingerprint } from "./history.mjs";
import { recommendImages } from "./images.mjs";
import { CLUSTER_PARENTS, suggestLinks } from "./links.mjs";
import { videoIntent, videoOverlap } from "./overlap.mjs";
import { articleSchemaPlan, proposeVideoMeta, validateVideoObject, videoObjectNode } from "./schema.mjs";
import { loadTranscript } from "./transcript.mjs";

const FAQ_ACTIONS = new Set(["NEW_ARTICLE", "UPDATE_EXISTING_ARTICLE", "CREATE_FAQ_SECTION", "CREATE_COMPARISON_SUPPORT", "CREATE_NEIGHBORHOOD_SUPPORT"]);

/** Sections of an update: the ones that carry what the page is missing. */
function sectionsForUpdate(sections, missingFacets) {
  if (!missingFacets.length) return sections.filter((s) => s.headingSource !== "opening").slice(0, 2);
  const hits = sections.filter((s) => s.headingSource !== "opening" && s.entities.some((e) => missingFacets.includes(e)));
  return hits.length ? hits : sections.filter((s) => s.headingSource !== "opening").slice(0, 2);
}

export function analyzeVideo({ video, repoRoot, inventory, briefConfig, config, today, history, published, nextId, sourceText = "", transcriptOverride = null }) {
  const transcript = transcriptOverride ?? loadTranscript(repoRoot, video.transcript, config);
  const claims = analyzeClaims(transcript.status === "OK" ? transcript.sentences : [], { today });
  for (const s of claims.sentences) s.entities = extractEntities(normalizeQuery(s.text).text.replace(/\bdowntown\s+(summerlin|henderson)\b/g, "$1")).entities;

  const group = videoIntent(video, claims.sentences);
  const overlap = videoOverlap(video, group, inventory, { briefConfig, config });
  const transcriptFlags = scanTranscript(claims.sentences);
  const faqAll = extractFaq(claims.sentences, { max: config.draft.maxFaq });
  const topicFh = topicFairHousing(video);

  const classification = classifyVideo({ video, group, overlap, transcript, claims, faq: faqAll, topicFairHousing: topicFh, config });
  const { action } = classification;
  const targetPage = classification.target ? overlap.topMatches.find((m) => m.route === classification.target) ?? inventory.byRoute.get(classification.target) ?? null : null;
  const targetScored = classification.target
    ? (overlap.embeddedPages.find((p) => p.route === classification.target) ?? (overlap.manifestTarget?.route === classification.target ? overlap.manifestTarget : null) ?? overlap.topMatches.find((m) => m.route === classification.target) ?? null)
    : null;

  const proposed = NEW_URL_ACTIONS.has(action) ? proposeRoute({ video, group, inventory }) : null;
  const canDraft = transcript.status === "OK" && !classification.transcriptRequired;

  // ---- Draft: only what the action needs -----------------------------------
  let draft = null;
  if (PUBLISHER_ACTIONS.has(action) || action === "VIDEO_ONLY_NO_ARTICLE") {
    const allSections = canDraft ? draftSections(claims.sentences, transcriptFlags, { chapters: video.chapters, maxSections: config.draft.maxSections }) : [];
    const missingFacets = targetScored?.missingFacets ?? [];
    let sections = [];
    if (canDraft && (NEW_URL_ACTIONS.has(action))) sections = allSections;
    else if (canDraft && action === "UPDATE_EXISTING_ARTICLE") sections = sectionsForUpdate(allSections, missingFacets);

    const headlines = canDraft && NEW_URL_ACTIONS.has(action) ? proposeHeadlines({ video, sentences: claims.sentences, config }) : null;
    const faq = canDraft && FAQ_ACTIONS.has(action) ? faqAll : [];
    const faqRoute = proposed?.route ?? classification.target;
    const faqSection = proposed ? "guide" : targetScored?.section ?? inventory.byRoute.get(classification.target)?.section ?? null;
    draft = {
      kind: NEW_URL_ACTIONS.has(action) ? "new-article" : action === "UPDATE_EXISTING_ARTICLE" ? "update" : action === "CREATE_FAQ_SECTION" ? "faq-section" : "embed-only",
      headlines,
      existingPageMetadata: !NEW_URL_ACTIONS.has(action) && classification.target ? "keep the page's title, meta and publishedAt; set dateModified honestly if copy changes" : null,
      missingFacets,
      insertAfter: action === "UPDATE_EXISTING_ARTICLE" || action === "CREATE_FAQ_SECTION" ? (targetScored?.relevantSection ?? "the page's closest matching section") : null,
      sections,
      faq,
      faqSchema: faq.length ? faqSchemaRecommendation({ faq, targetRoute: faqRoute, targetSection: faqSection }) : null,
      embed: embedPlacement({ action, targetPage: targetScored ?? targetPage, video }),
      internalLinks: canDraft && (NEW_URL_ACTIONS.has(action) || action === "UPDATE_EXISTING_ARTICLE")
        ? suggestLinks({ action, target: classification.target, proposedRoute: proposed?.route, group, overlap, inventory, sections: allSections, config })
        : null,
      cta: NEW_URL_ACTIONS.has(action) ? ctaRecommendation(group) : null,
    };
  }

  // ---- Schema --------------------------------------------------------------
  const videoMeta = proposeVideoMeta(video);
  const node = videoObjectNode(videoMeta.video);
  const pageRoute = proposed?.route ?? classification.target ?? null;
  const schema = {
    storyVideoMeta: videoMeta.video,
    thumbnailSource: videoMeta.thumbnailSource,
    blocked: videoMeta.blocked,
    videoObject: node,
    validation: videoMeta.blocked.length
      ? { valid: false, errors: videoMeta.blocked.map((b) => `${b.field}: BLOCKED — ${b.reason}`), warnings: [] }
      : validateVideoObject(node, { expectedId: video.youtubeId, articleUrl: pageRoute ? `https://www.lvinit.com${pageRoute}` : null }),
    article: PUBLISHER_ACTIONS.has(action) ? articleSchemaPlan({ route: proposed?.route, title: draft?.headlines?.title, action, existingRoute: NEW_URL_ACTIONS.has(action) ? null : classification.target }) : null,
    existingOnSite: video.siteVideoObject ? { route: video.siteVideoObjectRoute, ...video.siteVideoObject } : null,
    conflicts: video.conflicts,
  };

  const images = NEW_URL_ACTIONS.has(action) ? recommendImages({ repoRoot, video, group, config, sourceText }) : null;
  const checklist = transcript.status === "OK" ? verificationChecklist(claims.sentences) : [];

  // ---- Gates ---------------------------------------------------------------
  const fields = draft ? generatedFields(draft) : [];
  const generated = checkGenerated(fields);
  const voice = voiceCheck(fields);
  const fh = fairHousingStatus({ transcriptFlags, generated, topicVerdict: topicFh });

  const confidence = confidenceFor({ transcript, group, overlap, classification, checklist, fairHousingStatus: fh });

  // ---- Identity ------------------------------------------------------------
  const fingerprint = videoFingerprint({ youtubeId: video.youtubeId, route: proposed?.route ?? classification.target, action });
  const item = {
    id: nextId(),
    fingerprint,
    video,
    transcript,
    claimsSummary: { counts: claims.counts, familyCounts: claims.familyCounts, verificationRequired: claims.verificationRequired },
    group: {
      key: group.key,
      shape: group.shape,
      cluster: group.cluster,
      places: group.places,
      subjects: group.subjects,
      concepts: group.concepts,
      facets: group.facets,
      intentClarity: group.intentClarity,
      dominantEntities: group.dominantEntities,
    },
    overlap,
    action,
    target: classification.target,
    // A new piece hangs off its cluster's hub when one exists, not off whichever
    // page happened to score closest.
    parent: NEW_URL_ACTIONS.has(action)
      ? (inventory.byRoute.has(CLUSTER_PARENTS[group.cluster]) ? CLUSTER_PARENTS[group.cluster] : classification.parent ?? classification.target ?? null)
      : null,
    provisional: classification.provisional,
    transcriptRequired: classification.transcriptRequired,
    classificationReasons: classification.reasons,
    proposed,
    draft,
    schema,
    images,
    checklist,
    transcriptFairHousingFlags: transcriptFlags,
    generatedFairHousing: generated,
    voice,
    fairHousing: fh,
    confidence,
  };

  const settled = settledSkip(fingerprint, transcript.hash, history, published);
  item.settled = settled;
  item.handoff = handoffEligibility({ item, inventory, history, published, config });
  if (settled.skip) item.handoff = { eligible: false, blockers: ["SETTLED"], reasons: [settled.reason] };
  item.lifecycle = settled.skip
    ? settled.lifecycle
    : lifecycleFor({ fingerprint, action, eligible: item.handoff.eligible, blockedFairHousing: fh.status === "BLOCKED", transcriptRequired: item.transcriptRequired }, history, published, config);
  return item;
}
