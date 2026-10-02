// ---------------------------------------------------------------------------
// PUBLISHER HANDOFF — eligibility, the package, and the dry-run queue
//
// The Content Publisher stays the execution layer: final fact verification,
// final copy, metadata, images, schema, build, commit, push. This pipeline
// never publishes and never triggers the Publisher. It writes:
//
//   packages/<VID-…>.json      one handoff package per analyzed video
//   handoff-queue-<date>.json  at most `maxPerRun` (2) eligible packages
//
// In v1 the queue is DRY-RUN: written exactly as a live one would be, stamped
// "dry-run", and read by nothing. It follows the Content Brief Generator's
// queue conventions (mode, trailer keys, retry ceiling), so turning it on later
// is a config change plus a Publisher-side reader — not a new system.
// ---------------------------------------------------------------------------

import { EXISTING_PAGE_ACTIONS, NEW_URL_ACTIONS, PUBLISHER_ACTIONS } from "../config.mjs";

export const QUEUE_SCHEMA_VERSION = "1.0.0";

export const BLOCKERS = {
  NOT_A_PUBLISHER_ACTION: "the action does not produce a Publisher task",
  TRANSCRIPT_REQUIRED: "no usable transcript — nothing that needs copy can be drafted",
  CONFIDENCE_LOW: "confidence is Low — Low never reaches the Publisher",
  FAIR_HOUSING: "a generated line trips a Fair Housing rule",
  VOICE: "a generated line uses phrasing LVINIT never publishes",
  TARGET_MISSING: "the target page no longer exists",
  SLUG_COLLISION: "the proposed route already exists",
  CANNIBALIZATION: "existing pages compete for this question — a human chooses the owner",
  ALREADY_HANDED_OFF: "already handed to the Publisher",
  ALREADY_PUBLISHED: "already published",
  HANDOFF_STALLED: "handed off before and never published — needs Mikey",
  PUBLISHER_STATUS_UNVERIFIED: "Publisher commit trailers could not be read from git, so double-processing cannot be ruled out",
  VIDEO_METADATA_BLOCKED: "required VideoObject fields are unknown (see schema.blocked)",
};

/**
 * Blocking reasons for one analyzed video. VideoObject gaps are recorded but
 * do NOT block: the Publisher fills uploadDate/duration from YouTube at publish
 * time, and the package says exactly which fields.
 */
export function handoffEligibility({ item, inventory, history, published, config }) {
  const blockers = [];
  const add = (code) => blockers.push(code);
  if (!PUBLISHER_ACTIONS.has(item.action)) add("NOT_A_PUBLISHER_ACTION");
  if (item.transcriptRequired) add("TRANSCRIPT_REQUIRED");
  if (item.confidence.level === "low") add("CONFIDENCE_LOW");
  if (item.fairHousing.status === "BLOCKED") add("FAIR_HOUSING");
  if (item.voice && !item.voice.clean) add("VOICE");
  if (EXISTING_PAGE_ACTIONS.has(item.action) && item.target && !inventory.byRoute.has(item.target)) add("TARGET_MISSING");
  if (NEW_URL_ACTIONS.has(item.action) && item.proposedRoute && inventory.existingRoutes.has(item.proposedRoute)) add("SLUG_COLLISION");
  if (NEW_URL_ACTIONS.has(item.action) && item.overlap.cannibalization?.status && item.overlap.cannibalization.status !== "none") add("CANNIBALIZATION");
  const rec = history.byFingerprint.get(item.fingerprint);
  if (rec?.liveQueueAttempts >= config.handoff.maxAttempts) add("HANDOFF_STALLED");
  else if (rec?.liveQueueAttempts > 0) add("ALREADY_HANDED_OFF");
  if (published.fingerprints?.has(item.fingerprint)) add("ALREADY_PUBLISHED");
  if (!published.available) add("PUBLISHER_STATUS_UNVERIFIED");
  return { eligible: blockers.length === 0, blockers, reasons: blockers.map((b) => BLOCKERS[b]) };
}

/** The structured handoff package for one video. */
export function buildPackage(item, { reportDate, config }) {
  return {
    schemaVersion: QUEUE_SCHEMA_VERSION,
    agent: "youtube-pipeline",
    id: item.id,
    fingerprint: item.fingerprint,
    reportDate,
    video: {
      youtubeId: item.video.youtubeId,
      url: item.video.urls?.watch ?? null,
      sourceTitle: item.video.title,
      uploadDate: item.video.uploadDate,
      durationSeconds: item.video.durationSeconds,
      onHomepage: item.video.onHomepage,
      embeddedOn: item.video.embeddedOn,
    },
    transcript: {
      path: item.transcript.path,
      source: item.transcript.source,
      status: item.transcript.status,
      verified: item.transcript.verified,
      words: item.transcript.words,
      hash: item.transcript.hash,
      timestamps: item.transcript.timestamps ?? null,
      corrections: item.transcript.corrections ?? [],
    },
    action: item.action,
    provisional: item.provisional,
    targetRoute: EXISTING_PAGE_ACTIONS.has(item.action) || item.action === "VIDEO_ONLY_NO_ARTICLE" || item.action === "REJECT_DUPLICATE" ? item.target : null,
    parentRoute: item.parent ?? null,
    proposedTitle: item.draft?.headlines?.title ?? null,
    proposedSlug: NEW_URL_ACTIONS.has(item.action) ? item.proposed?.slug ?? null : null,
    proposedRoute: NEW_URL_ACTIONS.has(item.action) ? item.proposed?.route ?? null : null,
    overlap: {
      verdict: item.overlap.verdict,
      best: item.overlap.best ? { route: item.overlap.best.route, label: item.overlap.best.label, overlap: item.overlap.best.overlap } : null,
      distinctQuestion: item.overlap.distinctQuestion,
    },
    metadata: item.draft?.headlines ?? null,
    draft: item.draft ? { sections: item.draft.sections, missingFacets: item.draft.missingFacets ?? [] } : null,
    faq: item.draft?.faq ?? [],
    faqSchema: item.draft?.faqSchema ?? null,
    embed: item.draft?.embed ?? null,
    schema: item.schema,
    images: item.images ?? null,
    internalLinks: item.draft?.internalLinks ?? null,
    cta: item.draft?.cta ?? null,
    verificationChecklist: item.checklist,
    fairHousing: item.fairHousing,
    confidence: item.confidence,
    blockers: item.handoff.blockers,
    publisherInstructions: [
      "This is a draft package, not copy. Every [VERIFY] line is a claim made on camera — confirm it against a current primary source or cut it. The transcript alone is never a source for a figure, rate, price, HOA amount, incentive, timeline, law or market statistic.",
      "Mikey's opinions may be published as his, attributed; never restate an opinion as fact.",
      "Do not carry any [FAIR HOUSING — removed] framing into copy. Use objective housing, amenity, access, commute and development language.",
      "Fill every BLOCKED VideoObject field from YouTube (Studio or the watch page). Never estimate an upload date or duration.",
      "Build a complementary article, not a transcript. Embed with StoryVideo (youtube-nocookie, no autoplay, start 0:00).",
      `When the work is committed, add these trailers:\n${config.handoff.trailerIdKey}: ${item.id}\n${config.handoff.trailerKey}: ${item.fingerprint}`,
      "Before starting, run `git log --grep` for the fingerprint; if a commit already carries it, stop.",
      "If it can't be done safely, stop and say why. Don't retry in a loop.",
    ],
  };
}

/** At most `maxPerRun` eligible packages, highest confidence first. */
export function buildQueue({ items, config, reportDate, fixtureData = false }) {
  const live = config.handoff.enabled && !fixtureData;
  const rank = { high: 0, medium: 1, low: 2 };
  const queue = items
    .filter((i) => i.handoff.eligible)
    .sort((a, b) => rank[a.confidence.level] - rank[b.confidence.level] || a.id.localeCompare(b.id))
    .slice(0, config.handoff.maxPerRun)
    .map((i, index) => ({
      order: index + 1,
      id: i.id,
      fingerprint: i.fingerprint,
      youtubeId: i.video.youtubeId,
      action: i.action,
      targetRoute: NEW_URL_ACTIONS.has(i.action) ? null : i.target,
      proposedRoute: NEW_URL_ACTIONS.has(i.action) ? i.proposed?.route ?? null : null,
      proposedTitle: i.draft?.headlines?.title ?? null,
      confidence: i.confidence.level,
      packagePath: `packages/${i.id}.json`,
      verificationItems: i.checklist.length,
      blockedSchemaFields: (i.schema?.blocked ?? []).map((b) => b.field),
    }));
  return {
    schemaVersion: QUEUE_SCHEMA_VERSION,
    agent: "youtube-pipeline",
    reportDate,
    mode: live ? "live" : "dry-run",
    modeReason: live
      ? "handoff is enabled: the Publisher may take the first item it has not already executed"
      : fixtureData
        ? "fixture run — never live"
        : "handoff is disabled (v1 is dry-run only). Nothing reads this queue; it shows what WOULD be handed over",
    maxPerRun: config.handoff.maxPerRun,
    maxAttempts: config.handoff.maxAttempts,
    trailer: { id: config.handoff.trailerIdKey, fingerprint: config.handoff.trailerKey },
    fixtureData,
    queue,
  };
}

/** Structural validation of a queue document. */
export function validateQueue(doc, { maxPerRun = 2 } = {}) {
  const problems = [];
  const isStr = (v) => typeof v === "string" && v.length > 0;
  if (!doc || typeof doc !== "object") return { valid: false, problems: ["not an object"] };
  if (doc.schemaVersion !== QUEUE_SCHEMA_VERSION) problems.push(`schemaVersion must be ${QUEUE_SCHEMA_VERSION}`);
  if (doc.agent !== "youtube-pipeline") problems.push('agent must be "youtube-pipeline"');
  if (!["live", "dry-run"].includes(doc.mode)) problems.push("mode must be live | dry-run");
  if (doc.fixtureData && doc.mode === "live") problems.push("a fixture queue can never be live");
  if (!Array.isArray(doc.queue)) problems.push("queue must be an array");
  else {
    if (doc.queue.length > maxPerRun) problems.push(`queue holds ${doc.queue.length} items (max ${maxPerRun})`);
    const seen = new Set();
    doc.queue.forEach((q, i) => {
      const p = (m) => problems.push(`queue[${i}]: ${m}`);
      if (!isStr(q.id)) p("id is required");
      if (!/^[0-9a-f]{12}$/.test(String(q.fingerprint))) p("fingerprint must be 12 hex characters");
      if (seen.has(q.fingerprint)) p("duplicate fingerprint");
      seen.add(q.fingerprint);
      if (!PUBLISHER_ACTIONS.has(q.action)) p(`action ${q.action} is not a Publisher action`);
      if (!["high", "medium"].includes(q.confidence)) p("confidence must be high or medium (low never queues)");
      if (NEW_URL_ACTIONS.has(q.action) && !isStr(q.proposedRoute)) p("a new-URL action needs proposedRoute");
      if (EXISTING_PAGE_ACTIONS.has(q.action) && !isStr(q.targetRoute)) p("an existing-page action needs targetRoute");
      if (!/^[A-Za-z0-9_-]{11}$/.test(String(q.youtubeId))) p("youtubeId must be 11 characters");
    });
  }
  return { valid: problems.length === 0, problems };
}
