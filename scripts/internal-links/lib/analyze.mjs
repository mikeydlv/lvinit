// ---------------------------------------------------------------------------
// THE ANALYSIS PASS
//
// Pure: it reads the repository and the two optional signal reports, and
// returns everything the runner needs to act and to report. It writes nothing
// and edits nothing. Every decision about what is safe is made here; the runner
// only carries it out.
// ---------------------------------------------------------------------------

import { buildLinkGraph } from "./graph.mjs";
import { classAttrFor } from "./apply.mjs";
import {
  findCandidates,
  classifyAndRank,
  findBridgeSentenceOpportunities,
  buildHistory,
  statusFor,
  resolvedSince,
  sentenceAround,
  REVIEW_REASONS,
} from "./opportunities.mjs";

/**
 * @param {object} opts
 * @param {object} opts.graph            a prebuilt graph (fixtures), or omit to scan
 * @param {string} opts.repoRoot
 * @param {object} opts.config
 * @param {string} opts.reportDate       YYYY-MM-DD, injected so runs are deterministic
 * @param {object} opts.gscSignal
 * @param {object} opts.factDecaySignal
 * @param {Array}  opts.previousReports
 * @param {string} opts.mode             "dry-run" | "apply"
 */
export function analyze({
  graph: prebuilt,
  repoRoot,
  config,
  reportDate,
  gscSignal,
  factDecaySignal,
  previousReports = [],
  mode = "dry-run",
}) {
  const graph = prebuilt ?? buildLinkGraph({ repoRoot, config, today: reportDate });

  const candidates = findCandidates({ graph, config });
  const { evaluated, autoExecuted, needsReview } = classifyAndRank({
    graph,
    candidates,
    config,
    gscSignal,
    factDecaySignal,
    reportDate,
  });

  const history = buildHistory(previousReports);
  for (const candidate of evaluated) {
    const { status, history: record } = statusFor(candidate, history);
    candidate.status = status;
    candidate.historyRecord = record;
    candidate.sentence = sentenceAround(candidate.paragraph, candidate.anchor);
    // The exact replacement text, computed whether or not this run will write
    // it. A dry run has to be able to show the change, character for character.
    candidate.proposedEdit = {
      before: candidate.anchor,
      after: `<Link href="${candidate.to}" ${classAttrFor(candidate, config)}>${candidate.anchor}</Link>`,
    };
    const needsPublisher = candidate.blockers?.some((b) =>
      [
        REVIEW_REASONS.DESTINATION_REQUIRES_REFRESH,
        REVIEW_REASONS.FAIR_HOUSING_REVIEW,
        REVIEW_REASONS.COMPLIANCE_COPY,
        REVIEW_REASONS.POSSIBLE_INTENT_OVERLAP,
      ].includes(b.code)
    );
    candidate.handoff = needsPublisher
      ? `Hand ${candidate.id} to the LVINIT Content Publisher. This agent is not allowed to resolve it.`
      : null;
  }

  const bridgeSentenceHandoffs = findBridgeSentenceOpportunities({ graph, candidates, config });
  const currentFingerprints = evaluated.map((c) => c.fingerprint);
  const resolved = resolvedSince(previousReports, currentFingerprints);

  const blockedDestinations = [
    ...new Set(
      evaluated
        .filter((c) => c.blockers.some((b) => b.code === REVIEW_REASONS.DESTINATION_REQUIRES_REFRESH))
        .map((c) => c.to)
    ),
  ].sort();

  const countBlocker = (code) =>
    evaluated.filter((c) => c.blockers.some((b) => b.code === code)).length;

  const weakRow = (p) => ({
    route: p.route,
    title: p.title,
    section: p.section,
    publishedAt: p.publishedAt,
    ageDays: p.ageDays,
    incomingEditorialCount: p.incomingEditorialCount,
    uniqueReferrers: p.uniqueReferrers,
    chromeReferrers: p.chromeIncoming.map((c) => c.from),
    inSitemap: p.inSitemap,
  });

  const missingFromSitemap = [...graph.pages.values()]
    .filter((p) => !p.inSitemap)
    .map((p) => p.route)
    .sort();

  return {
    reportDate,
    mode,
    graph,
    gscSignal,
    factDecaySignal,
    autoExecuted,
    needsReview,
    evaluated,
    bridgeSentenceHandoffs,
    resolved,
    blockedDestinations,
    orphans: graph.orphans.map(weakRow),
    weaklyLinked: graph.weaklyLinked.map(weakRow),
    newlyPublishedNeedingDiscovery: graph.newlyPublishedNeedingDiscovery.map(weakRow),
    brokenLinks: graph.brokenLinks.map((b) => ({ from: b.from, to: b.to, file: b.file, line: b.line })),
    duplicateLinks: graph.duplicateLinks.map((d) => ({
      from: d.from,
      to: d.to,
      file: d.file,
      line: d.line,
      occurrence: d.occurrence,
    })),
    missingFromSitemap,
    graphSummary: {
      pages: graph.totals.pages,
      editorialEdges: graph.totals.editorialEdges,
      allEdges: graph.totals.allEdges,
      chromeLinks: graph.chromeLinkCount + graph.componentLinkCount,
    },
    graphNodes: [...graph.pages.values()].map((p) => ({
      route: p.route,
      title: p.title,
      section: p.section,
      category: p.category,
      topics: p.topics,
      publishedAt: p.publishedAt,
      dateModified: p.dateModified,
      gitLastModified: p.gitLastModified,
      inRegistry: p.inRegistry,
      inSitemap: p.inSitemap,
      outgoing: p.outgoing.map((e) => ({
        to: e.to,
        anchor: e.anchor,
        line: e.line,
        file: e.file,
        editorial: e.editorialTarget,
        targetExists: e.targetExists,
      })),
      incoming: p.incoming.map((e) => ({ from: e.from, anchor: e.anchor, line: e.line })),
      uniqueReferrers: p.uniqueReferrers,
      incomingEditorialCount: p.incomingEditorialCount,
      outgoingEditorialCount: p.outgoingEditorialCount,
      isOrphan: p.isOrphan,
      isWeaklyLinked: p.isWeaklyLinked,
      isNewlyPublished: p.isNewlyPublished,
    })),
    totals: {
      pagesScanned: graph.totals.pages,
      pagesOutOfScope: graph.skipped.length,
      editorialLinks: graph.totals.editorialEdges,
      allInternalLinks: graph.totals.allEdges,
      candidatesExamined: candidates.length,
      opportunitiesDetected: evaluated.length,
      autoExecuted: autoExecuted.length,
      needsReview: needsReview.length,
      heldByRunLimits: countBlocker(REVIEW_REASONS.RUN_LIMIT_REACHED),
      blockedByFactDecay: countBlocker(REVIEW_REASONS.DESTINATION_REQUIRES_REFRESH),
      blockedByCompliance:
        countBlocker(REVIEW_REASONS.FAIR_HOUSING_REVIEW) + countBlocker(REVIEW_REASONS.COMPLIANCE_COPY),
      bridgeSentenceHandoffs: bridgeSentenceHandoffs.length,
      orphans: graph.orphans.length,
      weaklyLinked: graph.weaklyLinked.length,
      brokenLinks: graph.brokenLinks.length,
      duplicateLinks: graph.duplicateLinks.length,
    },
  };
}
