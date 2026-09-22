// ---------------------------------------------------------------------------
// THE PIPELINE — pure: data in, analysis out. No file or network access.
//
//   demand rows -> intent groups -> gates (Fair Housing, low value, thin)
//     -> duplicate/cannibalization check against every page
//     -> classify (UPDATE / EXPAND / NEW / LINK / MONITOR / REJECT)
//     -> score + confidence (separate) -> fingerprint + week-to-week status
//     -> brief (brief actions only) -> handoff eligibility -> capped selection
// ---------------------------------------------------------------------------

import { ACTIONS, BRIEF_ACTIONS, NEW_ACTIONS } from "../config.mjs";
import { groupQueries } from "./intent.mjs";
import { checkCoverage, CLUSTER_TOPICS } from "./coverage.mjs";
import { gateGroup, classifyGroup } from "./classify.mjs";
import { scoreOpportunity, confidenceFor } from "./score.mjs";
import { buildBrief, proposeSlug, workingTitle, duplicateCheckSummary } from "./brief.mjs";
import { briefFingerprint, buildHistory, makeIdFactory, persistenceRuns, statusFor, resolvedSince } from "./history.mjs";
import { handoffEligibility, buildQueue } from "./handoff.mjs";
import { demandRows, gscFindingsIndex, factDecayNotesFor, weakTopics } from "./inputs.mjs";

export function analyze({ gsc, inventory, factDecay, internalLinks, previousReports = [], published, config, reportDate }) {
  const notes = [];
  const rows = demandRows(gsc);
  const findings = gscFindingsIndex(gsc);
  const history = buildHistory(previousReports);
  const weak = weakTopics(internalLinks);
  const window = gsc.available ? gsc.report.windows?.current ?? null : null;

  if (!gsc.available) notes.push(`No briefs: ${gsc.reason}.`);
  if (gsc.mode === "findings-only") notes.push(`GSC input is findings-only: ${gsc.reason}.`);
  if (gsc.available && gsc.lowVolume) {
    notes.push(
      `LVINIT's whole GSC window is below the GSC agent's low-volume line (${gsc.report.totals.currentImpressions} query impressions). Nothing seen for the first time can be High confidence, so nothing new is handed off on this data alone.`
    );
  }
  if (!published.available) notes.push(`Publisher execution status is unverified: ${published.reason}. Handoff is blocked until it can be read.`);

  const groups = groupQueries({ currentRows: rows.current, previousRows: rows.previous, currentPairs: rows.pairs });

  const exclusions = [];
  const rejections = [];
  let thinGroups = 0;
  let thinImpressions = 0;
  const candidates = [];

  for (const group of groups) {
    const gate = gateGroup(group, config);
    if (gate?.exclusion) {
      exclusions.push(gate.exclusion);
      continue;
    }
    if (group.metrics.impressions < config.demand.minGroupImpressions) {
      thinGroups += 1;
      thinImpressions += group.metrics.impressions;
      continue;
    }
    const sourceOpportunityIds = [...new Set(group.queries.flatMap((q) => (findings.byQuery.get(q.query) ?? []).map((f) => f.id)))];
    if (gate?.rejection) {
      rejections.push({ group, action: gate.rejection.action, reason: gate.rejection.reason, sourceOpportunityIds });
      continue;
    }
    const gscCannibalization = group.queries.flatMap((q) => (findings.byQuery.get(q.query) ?? []).filter((f) => f.type === "cannibalization"));
    const coverage = checkCoverage(group, inventory, config, { gscCannibalization });
    const classification = classifyGroup({ group, coverage, inventory, config });
    candidates.push({ group, coverage, classification, sourceOpportunityIds });
  }

  // --- Score, confidence, identity -----------------------------------------
  const items = candidates.map(({ group, coverage, classification, sourceOpportunityIds }) => {
    const runs = persistenceRuns(history, group.intentFingerprint);
    const clusterWeak = (CLUSTER_TOPICS[group.cluster] ?? []).some((t) => weak.has(t));
    const score = scoreOpportunity({ group, classification, coverage, persistenceRuns: runs, gscFindingIds: sourceOpportunityIds, clusterWeak, config });
    const confidence = confidenceFor({ group, coverage, persistenceRuns: runs, gsc, config });
    const proposed = NEW_ACTIONS.has(classification.action) ? proposeSlug(group, inventory.existingRoutes) : null;
    const fingerprint = briefFingerprint({
      intentKey: group.key,
      action: classification.action,
      target: classification.target ?? proposed?.slug ?? null,
      cluster: group.cluster,
    });
    const status = statusFor({ fingerprint, action: classification.action, score: score.score, confidence: confidence.level }, history, published.fingerprints, config);
    return {
      group,
      coverage,
      classification,
      sourceOpportunityIds,
      clusterWeak,
      persistenceRuns: runs,
      scoreDetail: score,
      confidenceDetail: confidence,
      proposed,
      fingerprint,
      statusDetail: status,
    };
  });

  // Page-level GSC findings have no query — they cannot define an intent, so
  // they never become a brief. They are carried as report-only context.
  const pageSignals = findings.pageLevel.map((f) => {
    const sources = (f.suggestedSourcePages ?? []).map((s) => s.route).filter(Boolean);
    const alreadyLinked = sources.filter((src) => inventory.byRoute.get(src)?.linksOut.includes(f.landingPage));
    const resolved = f.type === "internal-link" && sources.length > 0 && alreadyLinked.length === sources.length;
    return {
      id: f.id,
      type: f.type,
      route: f.landingPage,
      impressions: f.metrics?.impressions ?? null,
      scope: "page dimension (RAW) — not comparable to query-dimension totals",
      action: f.type === "internal-link" ? ACTIONS.INTERNAL_LINK_ONLY : ACTIONS.MONITOR_ONLY,
      resolvedInRepo: resolved,
      reason:
        f.type === "internal-link"
          ? resolved
            ? `Already done: ${alreadyLinked.join(", ")} now link${alreadyLinked.length === 1 ? "s" : ""} to this page in the current repository. Nothing to brief.`
            : "A GSC internal-link finding. That is the Internal Linking Agent's job (it runs Wednesday and reads the same report); no article is justified by it."
          : "A page-level momentum signal with no query attached. Without a query there is no search intent to brief; watch it, and let the Fact-Decay and Internal Linking agents handle page health.",
    };
  });

  // --- Order, ids, briefs, handoff -----------------------------------------
  const rank = (i) => (BRIEF_ACTIONS.has(i.classification.action) ? 0 : i.classification.action === ACTIONS.INTERNAL_LINK_ONLY || i.classification.action === ACTIONS.MONITOR_ONLY ? 1 : 2);
  items.sort((a, b) => rank(a) - rank(b) || b.scoreDetail.score - a.scoreDetail.score || a.group.key.localeCompare(b.group.key));
  const nextId = makeIdFactory(reportDate);

  const opportunities = [];
  for (const it of items) {
    const { group, coverage, classification } = it;
    const id = nextId();
    const briefAction = BRIEF_ACTIONS.has(classification.action);
    const belowBriefLine = briefAction && it.scoreDetail.score < config.output.minBriefScore;
    const factDecayNotes = classification.target ? factDecayNotesFor(factDecay, classification.target, config) : null;

    const brief =
      briefAction && !belowBriefLine
        ? buildBrief({
            id,
            group,
            classification,
            coverage,
            score: { value: it.scoreDetail.score, breakdown: it.scoreDetail.breakdown, weights: it.scoreDetail.weights },
            confidence: it.confidenceDetail,
            inventory,
            factDecay,
            internalLinks,
            gscEvidence: it.sourceOpportunityIds.map((fid) => findGscFinding(gsc, fid)).filter(Boolean),
            gscMeta: { reportDate: gsc.reportDate, window },
            config,
            factDecayNotes,
          })
        : null;

    const item = {
      id,
      fingerprint: it.fingerprint,
      intentFingerprint: group.intentFingerprint,
      intentKey: group.key,
      action: classification.action,
      reportOnlyReason: belowBriefLine ? `score ${it.scoreDetail.score} is below the ${config.output.minBriefScore} brief line — reported, not briefed` : null,
      target: classification.target,
      proposedSlug: it.proposed?.slug ?? null,
      proposedRoute: it.proposed?.route ?? null,
      workingTitle: brief?.workingTitle ?? (NEW_ACTIONS.has(classification.action) ? workingTitle(group) : null),
      leadQuery: group.leadQuery,
      cluster: group.cluster,
      shape: group.shape,
      queries: group.queries.map((q) => ({ query: q.query, raw: q.raw, previous: q.previous })),
      metrics: group.metrics,
      rankingPages: group.rankingPages,
      classificationReason: classification.reason,
      flags: classification.flags,
      duplicateCheck: duplicateCheckSummary(coverage),
      score: it.scoreDetail.score,
      scoreBreakdown: it.scoreDetail.breakdown,
      confidence: it.confidenceDetail.level,
      confidenceCaveats: it.confidenceDetail.caveats,
      persistenceRuns: it.persistenceRuns,
      status: it.statusDetail.status,
      materialChange: it.statusDetail.materialChange,
      history: it.statusDetail.history,
      publication: it.statusDetail.publication ?? null,
      sourceGscReportDate: gsc.reportDate,
      sourceOpportunityIds: it.sourceOpportunityIds,
      factDecay: factDecayNotes,
      dateCreated: it.statusDetail.history?.firstSeen ?? reportDate,
      brief,
    };
    item.handoff = handoffEligibility({ item, brief, group, coverage, gsc, inventory, published, config });
    if (!brief) {
      item.handoff.eligible = false;
      if (!item.handoff.blockers.includes("NOT_A_BRIEF_ACTION") && briefAction) {
        item.handoff.blockers.push("SCORE_BELOW_THRESHOLD");
        item.handoff.reasons.push("score below the brief line");
      }
    }
    opportunities.push(item);
  }

  const dryRunReason = !config.handoff.enabled
    ? "handoff is disabled (first build is dry-run only). Nothing reads this queue; it shows what WOULD be handed over"
    : gsc.fixtureData
      ? "fixture data can never be handed to the Publisher"
      : null;
  const queue = buildQueue({ items: opportunities, config, reportDate, gsc, dryRunReason });
  const queuedFingerprints = new Set(queue.queue.map((q) => q.fingerprint));
  for (const o of opportunities) {
    o.handoffStatus = queuedFingerprints.has(o.fingerprint)
      ? queue.mode === "live" ? "QUEUED_FOR_PUBLISHER" : "WOULD_HAND_OFF (dry run)"
      : o.status === "HANDED_OFF" || o.status === "PUBLISHED" || o.status === "HANDOFF_STALLED"
        ? o.status
        : BRIEF_ACTIONS.has(o.action) && o.brief
          ? "REPORT_ONLY"
          : "NOT_APPLICABLE";
    if (o.brief) o.brief.handoffStatus = o.handoffStatus;
  }

  // --- Capped selection for the report --------------------------------------
  // Anything going to the Publisher is always shown in full; otherwise only
  // what is new or materially changed. Everything else is one line.
  const visible = (o) => queuedFingerprints.has(o.fingerprint) || o.status === "NEW" || (o.status === "PERSISTING" && o.materialChange);
  const briefed = opportunities.filter((o) => o.brief);
  const newBriefs = briefed.filter((o) => NEW_ACTIONS.has(o.action) && visible(o)).slice(0, config.output.maxNewBriefs);
  const updateBriefs = briefed.filter((o) => !NEW_ACTIONS.has(o.action) && visible(o)).slice(0, config.output.maxUpdateBriefs);
  const shownIds = new Set([...newBriefs, ...updateBriefs].map((o) => o.id));
  // Report-only: open items with no brief (monitor, internal-link-only, or a
  // brief action that scored below the brief line).
  const reportOnly = opportunities
    .filter((o) => !o.brief && !shownIds.has(o.id) && !/^REJECT_/.test(o.action) && visible(o))
    .slice(0, config.output.maxReportOnly);
  const stillOpen = opportunities.filter((o) => !shownIds.has(o.id) && !visible(o) && ["PERSISTING", "HANDED_OFF", "HANDOFF_STALLED", "PUBLISHED"].includes(o.status));
  const overflow = opportunities.filter((o) => visible(o) && !shownIds.has(o.id) && !reportOnly.includes(o) && !/^REJECT_/.test(o.action)).length;

  const rejectedItems = [
    ...opportunities.filter((o) => /^REJECT_/.test(o.action)).map((o) => ({ id: o.id, action: o.action, leadQuery: o.leadQuery, queries: o.queries.length, impressions: o.metrics.impressions, reason: o.classificationReason, status: o.status })),
    ...rejections.map((r) => ({ id: null, action: r.action, leadQuery: r.group.leadQuery, queries: r.group.queries.length, impressions: r.group.metrics.impressions, reason: r.reason, status: "NEW" })),
  ].sort((a, b) => b.impressions - a.impressions);

  const resolved = resolvedSince(history, opportunities.map((o) => o.fingerprint), published.fingerprints);

  if (opportunities.length === 0 && gsc.available) {
    notes.push(
      groups.length > 0
        ? `${groups.length} intent group${groups.length === 1 ? "" : "s"} found; none cleared the gates and the ${config.demand.minGroupImpressions}-impression minimum.`
        : gsc.mode === "findings-only"
          ? `The GSC report saw ${gsc.report.totals.uniqueQueries} queries, but none reached a query-level finding and this report does not carry the raw rows — so there was nothing to group.`
          : "Search Console returned no query rows for this window."
    );
  }

  return {
    reportDate,
    gsc,
    demandBasis: rows.basis,
    demandTotals: demandTotals(gsc, rows),
    groupsFound: groups.length,
    thin: { groups: thinGroups, impressions: thinImpressions, threshold: config.demand.minGroupImpressions },
    exclusions,
    opportunities,
    selection: { newBriefs, updateBriefs, reportOnly, stillOpen, overflow },
    rejected: rejectedItems,
    pageSignals,
    resolved,
    queue,
    factDecay,
    internalLinks,
    published,
    inventory,
    notes,
  };
}

function findGscFinding(gsc, id) {
  const f = gsc.report?.opportunities?.find((o) => o.id === id);
  return f ? { id: f.id, type: f.type, query: f.query ?? null, landingPage: f.landingPage ?? null, score: f.score, confidence: f.confidence?.level ?? null } : null;
}

/**
 * Totals, with query and page aggregation kept apart. They are different
 * measurements and never summed or compared as if they were one.
 */
function demandTotals(gsc, rows) {
  if (!gsc.available) return null;
  const sum = (list, k) => list.reduce((s, r) => s + (Number(r[k]) || 0), 0);
  return {
    queryDimension: {
      label: "RAW — query dimension (anonymized queries are absent)",
      currentImpressions: sum(rows.current, "impressions"),
      currentClicks: sum(rows.current, "clicks"),
      previousImpressions: rows.previous.length ? sum(rows.previous, "impressions") : null,
      queries: rows.current.length,
    },
    pageDimension: rows.pages.length
      ? {
          label: "RAW — page dimension (includes anonymized queries; NOT comparable to the query total)",
          currentImpressions: sum(rows.pages, "impressions"),
          currentClicks: sum(rows.pages, "clicks"),
          pages: rows.pages.length,
        }
      : null,
    gscReportTotals: { label: "RAW — as stated by the GSC report itself", ...gsc.report.totals },
  };
}

