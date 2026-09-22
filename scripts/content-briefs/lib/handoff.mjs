// ---------------------------------------------------------------------------
// PUBLISHER HANDOFF — eligibility and the queue artifact
//
// The Brief Generator never publishes and never triggers the Publisher. When
// handoff is enabled (it is NOT in the first build), it writes a queue file into
// its own report artifact; the Publisher's scheduled routine reads the newest
// queue and executes at most one item per run. See
// docs/CONTENT_BRIEF_GENERATOR.md, "Handoff architecture".
//
// A brief is eligible only when EVERY one of these holds. Each failure is
// recorded as a named blocker, so "why was this not handed off?" always has a
// one-line answer.
// ---------------------------------------------------------------------------

import { BRIEF_ACTIONS, NEW_ACTIONS } from "../config.mjs";

export const BLOCKERS = {
  NOT_A_BRIEF_ACTION: "the action does not produce a Publisher task",
  SCORE_BELOW_THRESHOLD: "priority score below the handoff threshold",
  CONFIDENCE_NOT_HIGH: "confidence is not High",
  NOT_YET_PERSISTENT: "first time this intent has been seen — autonomous handoff waits for it to persist",
  CANNIBALIZATION: "existing pages compete for this intent — a human must choose the owner",
  DUPLICATE_CHECK_AMBIGUOUS: "the duplicate check is too close to a band edge to trust unattended",
  INTENT_UNCLEAR: "the grouped queries do not clearly share one intent",
  WEAK_EDITORIAL_FIT: "editorial fit is not clear enough",
  FAIR_HOUSING: "Fair Housing flagged a query or a generated line",
  GENERIC_TITLE: "the generated title reads as generic filler",
  GSC_NOT_VERIFIED: "the GSC input is not a fresh, real report",
  ALREADY_HANDED_OFF: "already handed to the Publisher",
  ALREADY_PUBLISHED: "already published",
  HANDOFF_STALLED: "handed off before and never published — needs Mikey",
  TARGET_MISSING: "the target page no longer exists",
  SLUG_COLLISION: "the proposed slug collides with an existing route",
  PUBLISHER_STATUS_UNVERIFIED: "Publisher execution status could not be read from git, so double-processing cannot be ruled out",
};

/**
 * @returns {{eligible:boolean, blockers:string[], reasons:string[]}}
 */
export function handoffEligibility({ item, brief, group, coverage, gsc, inventory, published, config }) {
  const h = config.handoff;
  const blockers = [];
  const add = (code) => blockers.push(code);

  if (!BRIEF_ACTIONS.has(item.action)) add("NOT_A_BRIEF_ACTION");
  if (!(item.score >= h.minScore)) add("SCORE_BELOW_THRESHOLD");
  if (item.confidence !== h.requiredConfidence) add("CONFIDENCE_NOT_HIGH");
  if (!((item.persistenceRuns ?? 1) >= h.minPersistenceRuns)) add("NOT_YET_PERSISTENT");
  if (coverage.cannibalization.status !== "none") add("CANNIBALIZATION");
  if (coverage.ambiguous) add("DUPLICATE_CHECK_AMBIGUOUS");
  if (group.intentClarity < 0.7) add("INTENT_UNCLEAR");
  if (group.relevance < 0.6 || group.cluster === "general") add("WEAK_EDITORIAL_FIT");
  if (brief && !brief.fairHousing.clean) add("FAIR_HOUSING");
  if (brief && !brief.genericTitleCheck.clean) add("GENERIC_TITLE");
  if (!gsc.available || gsc.fixtureData) add("GSC_NOT_VERIFIED");
  if (item.status === "HANDED_OFF") add("ALREADY_HANDED_OFF");
  if (item.status === "PUBLISHED") add("ALREADY_PUBLISHED");
  if (item.status === "HANDOFF_STALLED") add("HANDOFF_STALLED");
  if (!NEW_ACTIONS.has(item.action) && item.target && !inventory.byRoute.has(item.target)) add("TARGET_MISSING");
  if (NEW_ACTIONS.has(item.action) && item.proposedRoute && inventory.existingRoutes.has(item.proposedRoute)) add("SLUG_COLLISION");
  if (!published.available) add("PUBLISHER_STATUS_UNVERIFIED");

  return { eligible: blockers.length === 0, blockers, reasons: blockers.map((b) => BLOCKERS[b]) };
}

/**
 * The queue artifact. In dry-run mode it is written exactly as it would be in
 * live mode, stamped "dry-run", so what WOULD be handed over is inspectable.
 */
export function buildQueue({ items, config, reportDate, gsc, dryRunReason }) {
  const live = config.handoff.enabled && !gsc.fixtureData;
  const queue = items
    .filter((i) => i.handoff.eligible)
    .sort((a, b) => b.score - a.score)
    .slice(0, config.handoff.maxPerRun)
    .map((i, index) => ({
      order: index + 1,
      briefId: i.id,
      fingerprint: i.fingerprint,
      action: i.action,
      targetRoute: NEW_ACTIONS.has(i.action) ? null : i.target,
      proposedSlug: i.proposedSlug ?? null,
      proposedRoute: i.proposedRoute ?? null,
      workingTitle: i.workingTitle ?? null,
      briefPath: `briefs/${i.id}.json`,
      score: i.score,
      confidence: i.confidence,
      sourceGscReport: gsc.reportDate,
      sourceOpportunityIds: i.sourceOpportunityIds,
      supportingQueries: i.queries.slice(0, 5).map((q) => q.query),
      flags: i.flags,
      publisherInstructions: [
        "Research every fact independently and confirm it is current before writing. Search Console data in the brief is DEMAND evidence, never an editorial fact.",
        "Follow the brief's 'must not become' and Fair Housing notes.",
        `When the work is committed, add these trailers to the commit message:\n${config.handoff.trailerIdKey}: ${i.id}\n${config.handoff.trailerKey}: ${i.fingerprint}`,
        "Before starting, check `git log --grep` for that fingerprint; if a commit already carries it, stop — it has been done.",
        "If the work cannot be completed safely, stop and say why. Do not retry in a loop; the Brief Generator stops re-queuing after its retry ceiling and surfaces the stall.",
      ],
    }));
  return {
    schemaVersion: "1.0.0",
    agent: "content-brief-generator",
    reportDate,
    mode: live ? "live" : "dry-run",
    modeReason: live
      ? "handoff is enabled: the Publisher's scheduled routine may take the first item it has not already executed"
      : dryRunReason ?? "handoff is disabled (first build is dry-run only). Nothing reads this queue; it shows what WOULD be handed over",
    maxAttempts: config.handoff.maxAttempts,
    trailer: { id: config.handoff.trailerIdKey, fingerprint: config.handoff.trailerKey },
    queue,
  };
}
