// ---------------------------------------------------------------------------
// THE REPORT
//
// Two artifacts per run, following the conventions the GSC and Fact-Decay
// agents already established:
//
//   reports/internal-links/internal-links-YYYY-MM-DD.md    for Mikey
//   reports/internal-links/internal-links-YYYY-MM-DD.json  for the next run
//
// The Markdown report answers four questions in order: what changed, what needs
// a person, what is hard to find on the site, and what the agent refused to do.
// The JSON carries the fingerprints that let next week's run recognize the same
// opportunity.
//
// The report is deliberately short. A weekly list of forty suggestions is a
// second job, not a maintenance system.
// ---------------------------------------------------------------------------

import { REVIEW_REASON_LABELS } from "./opportunities.mjs";
import { tailOutput } from "./verify.mjs";

// 1.1.0: link context (contextual / citation / card), Content Brief signal,
// uppercase lifecycle status + disposition, quiet review items, vetoes.
// Additive only — every 1.0.0 field the Content Brief Generator reads is kept.
const REPORT_SCHEMA_VERSION = "1.1.0";

/** What this agent is structurally incapable of doing. Printed in every report. */
export const PROHIBITED_ACTIONS = [
  "create a new article, or rewrite a section of an existing one",
  "add, remove or reword a single word of published copy",
  "write a bridge sentence (proposed, never written — that is a Content Publisher job)",
  "change metadata, Open Graph, canonical URLs or JSON-LD schema",
  "change imagery, alt text or photo credits",
  "change navigation, the homepage, CTAs, lead forms or design",
  "change brokerage, licensing, Equal Housing or other compliance copy",
  "update a market fact, price, rate or statistic",
  "modify the GSC Opportunity Agent's, the Fact-Decay Agent's or the Content Brief Generator's reports, scoring or brief status",
  "link to an unpublished or proposed page, or create a link only because a brief exists",
  "force-push, rebase through a conflict, or push from a dirty or diverged tree",
];

const escapeCell = (text) => String(text ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const truncate = (text, max = 70) => {
  const s = String(text ?? "");
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
};

/** A compact serializable form of one opportunity. */
function serializeCandidate(candidate) {
  return {
    id: candidate.id,
    fingerprint: candidate.fingerprint,
    status: candidate.status ?? "NEW",
    disposition: candidate.disposition ?? null,
    shownInFull: candidate.shownInFull !== false,
    materialChange: candidate.materialChange ?? true,
    from: candidate.from,
    to: candidate.to,
    sourceTitle: candidate.source?.title ?? null,
    destinationTitle: candidate.destination?.title ?? null,
    anchor: candidate.anchor,
    anchorIsProperName: candidate.anchorIsProperName,
    anchorPhraseSources: candidate.anchorPhraseSources,
    file: candidate.file,
    line: candidate.line,
    container: candidate.container,
    heading: candidate.heading,
    sentence: candidate.sentence ?? null,
    paragraph: candidate.paragraph,
    confidence: candidate.confidence,
    components: candidate.components,
    supportingTokens: candidate.supportingTokens,
    relatedness: candidate.relatedness,
    direction: candidate.direction,
    priority: candidate.priority,
    traffic: candidate.traffic
      ? { value: candidate.traffic.value, basis: candidate.traffic.basis, named: candidate.traffic.named }
      : null,
    discovery: candidate.discovery,
    brief: candidate.brief
      ? { value: candidate.brief.value, basis: candidate.brief.basis, briefId: candidate.brief.briefId, sharedClusters: candidate.brief.sharedClusters ?? [] }
      : null,
    factDecay: candidate.eligibility
      ? {
          eligible: candidate.eligibility.eligible,
          code: candidate.eligibility.code,
          reason: candidate.eligibility.reason,
          findingCount: candidate.eligibility.findingCount ?? 0,
        }
      : null,
    blockers: (candidate.blockers ?? []).map((b) => ({
      code: b.code,
      label: REVIEW_REASON_LABELS[b.code] ?? b.code,
      detail: b.detail,
    })),
    bridgeSentenceRequired: false,
    proposedEdit: candidate.proposedEdit ?? null,
    edit: candidate.edit ?? null,
    validation: candidate.validation ?? null,
    history: candidate.historyRecord ?? null,
  };
}

/** The machine-readable report. */
export function buildJsonReport({ analysis, config, meta }) {
  return {
    schemaVersion: REPORT_SCHEMA_VERSION,
    agent: "lvinit-internal-linking-agent",
    generatedAt: new Date().toISOString(),
    reportDate: analysis.reportDate,
    dataSource: meta.dataSource,
    fixtureData: meta.dataSource === "fixture",
    site: { origin: meta.origin },
    mode: analysis.mode,
    configuration: {
      autoExecuteMinConfidence: config.relevance.autoExecuteMinConfidence,
      reportMinConfidence: config.relevance.reportMinConfidence,
      weights: config.relevance.weights,
      limits: config.limits,
      density: config.density,
      anchor: {
        minWords: config.anchor.minWords,
        maxWords: config.anchor.maxWords,
        maxSameAnchorSiteWide: config.anchor.maxSameAnchorSiteWide,
      },
      factDecay: {
        blockPriority: config.factDecay.blockPriority,
        blockOnHighRiskContradiction: config.factDecay.blockOnHighRiskContradiction,
      },
      gsc: { maxMultiplier: config.gsc.maxMultiplier, neutralMultiplier: config.gsc.neutralMultiplier },
      briefs: config.briefs
        ? { internalLinkTargetBoost: config.briefs.internalLinkTargetBoost, updateTargetBoost: config.briefs.updateTargetBoost }
        : null,
      output: { quietAfterReports: config.output.quietAfterReports, materialConfidenceChange: config.output.materialConfidenceChange },
      autoExecute: config.autoExecute,
      git: { commit: config.git.commit, push: config.git.push, branch: config.git.branch },
    },
    totals: analysis.totals,
    signals: {
      gsc: {
        available: analysis.gscSignal.available,
        reason: analysis.gscSignal.reason,
        reportDate: analysis.gscSignal.reportDate,
        ageDays: analysis.gscSignal.ageDays,
        fixtureData: analysis.gscSignal.fixtureData,
        namedInternalLinkRoutes: [...(analysis.gscSignal.namedInternalLinkRoutes ?? [])],
      },
      factDecay: {
        available: analysis.factDecaySignal.available,
        reason: analysis.factDecaySignal.reason,
        reportDate: analysis.factDecaySignal.reportDate,
        ageDays: analysis.factDecaySignal.ageDays,
        fixtureData: analysis.factDecaySignal.fixtureData,
        blockedDestinations: analysis.blockedDestinations,
      },
      briefs: analysis.briefSignal
        ? {
            available: analysis.briefSignal.available,
            reason: analysis.briefSignal.reason,
            reportDate: analysis.briefSignal.reportDate ?? null,
            ageDays: analysis.briefSignal.ageDays ?? null,
            fixtureData: Boolean(analysis.briefSignal.fixtureData),
            handoffMode: analysis.briefSignal.handoffMode ?? null,
            targets: [...(analysis.briefSignal.targets ?? new Map())].map(([route, t]) => ({ route, ...t })),
            pendingHandoffs: [...(analysis.briefSignal.pendingHandoffs ?? new Map())].map(([route, h]) => ({ route, ...h })),
          }
        : null,
    },
    graph: {
      pages: analysis.graphSummary.pages,
      editorialEdges: analysis.graphSummary.editorialEdges,
      contextualEdges: analysis.graphSummary.contextualEdges,
      citationEdges: analysis.graphSummary.citationEdges,
      cardEdges: analysis.graphSummary.cardEdges,
      allEdges: analysis.graphSummary.allEdges,
      chromeLinks: analysis.graphSummary.chromeLinks,
      nodes: analysis.graphNodes,
      orphans: analysis.orphans,
      weaklyLinked: analysis.weaklyLinked,
      newlyPublishedNeedingDiscovery: analysis.newlyPublishedNeedingDiscovery,
      brokenLinks: analysis.brokenLinks,
      duplicateLinks: analysis.duplicateLinks,
      missingFromSitemap: analysis.missingFromSitemap,
    },
    autoExecuted: analysis.autoExecuted.map(serializeCandidate),
    needsReview: analysis.needsReview.map(serializeCandidate),
    vetoed: (analysis.vetoed ?? []).map((c) => ({ id: c.id, fingerprint: c.fingerprint, from: c.from, to: c.to, anchor: c.anchor })),
    bridgeSentenceHandoffs: analysis.bridgeSentenceHandoffs,
    resolved: analysis.resolved,
    execution: analysis.execution,
    prohibited: PROHIBITED_ACTIONS,
  };
}

/** The human-readable report. */
export function buildMarkdownReport({ analysis, config, meta }) {
  const L = [];
  const t = analysis.totals;
  const x = analysis.execution;

  L.push(`# LVINIT Internal Linking Agent — ${analysis.reportDate}`);
  L.push("");
  if (meta.dataSource === "fixture") {
    L.push("> ⚠️ **FIXTURE RUN.** Every page, link and finding below is synthetic. Do not act on it.");
    L.push("");
  }
  const MODE_TEXT = {
    "dry-run": "Nothing was written, committed or pushed — this is what the agent *would* do.",
    trial:
      "The proposed links were applied TEMPORARILY, every validation check was run against them, and then every edit " +
      "was reverted. Nothing was committed or pushed, and the site is exactly as it was.",
    apply: "Safe links were applied, validated and shipped; everything else was reported.",
  };
  L.push(`Mode: **${analysis.mode}**. ${MODE_TEXT[analysis.mode] ?? ""}`);
  L.push("");

  // --- Run summary ---------------------------------------------------------
  L.push("## Run summary");
  L.push("");
  L.push("| | |");
  L.push("|---|---|");
  const g = analysis.graphSummary;
  L.push(`| Pages scanned | ${t.pagesScanned} |`);
  L.push(`| Links analyzed | ${g.allEdges} internal (${g.contextualEdges ?? "?"} contextual, ${g.citationEdges ?? "?"} citation, ${g.cardEdges ?? "?"} card, the rest to utility routes) + ${g.chromeLinks} chrome, not counted |`);
  L.push(`| Opportunities found | ${t.opportunitiesDetected} |`);
  L.push(`| **${analysis.mode === "apply" ? "Auto-executed" : "Would auto-execute"}** | **${t.autoExecuted}** |`);
  L.push(`| Report-only (needs review) | ${t.needsReview} (${t.reviewShownInFull ?? t.needsReview} written up, ${t.reviewStillOpenQuiet ?? 0} still open and unchanged) |`);
  L.push(`| Ignored (below the ${config.relevance.reportMinConfidence} reporting line) | ${t.ignoredBelowReportLine ?? 0} |`);
  if (t.vetoed) L.push(`| Vetoed by a standing decision | ${t.vetoed} |`);
  L.push(`| Held back by run limits | ${t.heldByRunLimits} |`);
  L.push(`| Blocked by Fact-Decay | ${t.blockedByFactDecay} |`);
  L.push(`| Blocked by Fair Housing / compliance | ${t.blockedByCompliance} |`);
  L.push(`| Orphaned editorial pages | ${t.orphans} |`);
  L.push(`| Weakly linked editorial pages | ${t.weaklyLinked} |`);
  L.push(`| Broken internal links | ${t.brokenLinks} |`);
  L.push(`| GSC artifact | ${analysis.gscSignal.available ? `${analysis.gscSignal.reportDate} (${analysis.gscSignal.ageDays}d old)` : "none used"} |`);
  L.push(`| Fact-Decay artifact | ${analysis.factDecaySignal.available ? `${analysis.factDecaySignal.reportDate} (${analysis.factDecaySignal.ageDays}d old)` : "none used"} |`);
  L.push(`| Content Brief artifact | ${analysis.briefSignal?.available ? `${analysis.briefSignal.reportDate} (${analysis.briefSignal.ageDays}d old)` : "none used"} |`);
  L.push(`| Build status | ${x.validation.summary} |`);
  L.push(`| Commit | ${x.commitHash ? `\`${x.commitHash.slice(0, 10)}\`` : "—"} |`);
  L.push(`| Pushed | ${x.pushed ? "yes" : x.pushAttempted ? `no — ${escapeCell(x.pushReason)}` : "not attempted"} |`);
  L.push("");

  if (x.fatal) {
    L.push(`> **The run stopped early.** ${x.fatal}`);
    L.push("");
  }

  // --- Signals -------------------------------------------------------------
  L.push("### Signals used");
  L.push("");
  L.push(
    `* **Search Console** — ${
      analysis.gscSignal.available ? `used for ordering only. ${analysis.gscSignal.reason}.` : analysis.gscSignal.reason
    }`
  );
  L.push(
    `* **Fact-Decay** — ${
      analysis.factDecaySignal.available
        ? `used to decide which destinations may be strengthened. ${analysis.factDecaySignal.reason}.`
        : analysis.factDecaySignal.reason
    }`
  );
  if (analysis.briefSignal) {
    L.push(
      `* **Content Briefs** — ${
        analysis.briefSignal.available
          ? `cluster context and ordering only, never confidence. ${analysis.briefSignal.reason}.`
          : analysis.briefSignal.reason
      }`
    );
  }
  L.push("");

  // --- Auto-executed -------------------------------------------------------
  L.push(analysis.mode === "apply" ? "## Auto-executed" : "## Would auto-execute");
  L.push("");
  if (analysis.mode !== "apply" && analysis.autoExecuted.length) {
    L.push(
      analysis.mode === "trial"
        ? "*Applied temporarily for validation, then reverted. These are exactly the edits a scheduled run would ship.*"
        : "*Not applied. These are exactly the edits a scheduled run would ship.*"
    );
    L.push("");
  }
  if (analysis.autoExecuted.length === 0) {
    L.push(
      "Nothing cleared every safety gate this run. That is a real answer, not an empty report — the site's contextual " +
        "linking may simply be in good shape."
    );
    L.push("");
  } else {
    for (const c of analysis.autoExecuted) {
      L.push(`### ${c.id} — ${c.from} → ${c.to}`);
      L.push("");
      L.push(`* **Anchor**: “${c.anchor}”`);
      L.push(`* **Where**: \`${c.file}\` line ${c.line}, inside \`<${c.container}>\`${c.heading ? ` under “${c.heading}”` : ""}`);
      L.push(`* **Destination**: ${c.destination?.title ?? c.to}`);
      L.push(`* **Confidence**: ${c.confidence} (priority ${c.priority}) · status ${c.status ?? "NEW"}`);
      L.push(`* **Bridge sentence added**: no — the anchor is words that were already on the page`);
      L.push("");
      L.push(analysis.mode === "apply" ? "**The sentence, as it now reads:**" : "**The sentence (its words do not change):**");
      L.push("");
      L.push(`> ${escapeCell(c.sentence ?? c.paragraph)}`);
      L.push("");
      L.push("**Exactly what changed:**");
      L.push("");
      L.push("```diff");
      L.push(`- ${c.edit?.before ?? c.proposedEdit?.before ?? c.anchor}`);
      L.push(`+ ${c.edit?.after ?? c.proposedEdit?.after ?? ""}`);
      L.push("```");
      L.push("");
      L.push("**Why the relevance was high confidence:**");
      L.push("");
      L.push(
        `* the source page already names this subject in its own words (anchor quality ${c.components.anchorQuality})`
      );
      L.push(
        `* the surrounding paragraph carries the destination's own vocabulary beyond the anchor` +
          (c.supportingTokens.length ? `: ${c.supportingTokens.map((s) => `\`${s}\``).join(", ")}` : "") +
          ` (paragraph support ${c.components.paragraphSupport})`
      );
      L.push(`* the two pages are ${Math.round((c.relatedness ?? 0) * 100)}% related on route and headline`);
      L.push(`* topic affinity ${c.components.topicAffinity}; structural fit ${c.components.structuralFit}`);
      L.push(`* ${c.discovery?.basis ?? "destination discovery: no adjustment"}`);
      L.push(`* traffic weighting ${c.traffic?.value ?? 1}: ${c.traffic?.basis ?? "no signal"}`);
      L.push(`* Fact-Decay: ${c.eligibility?.reason ?? "not checked"}`);
      if (c.brief) {
        L.push(
          `* Content Briefs: ${c.brief.basis}` +
            (c.brief.sharedClusters?.length ? `; both pages sit in the ${c.brief.sharedClusters.join(", ")} cluster (context only)` : "")
        );
      }
      L.push("");
      L.push("**Every safety gate it passed:**");
      L.push("");
      L.push(safetyChecklist(c, config));
      L.push("");
      L.push("**Validation:**");
      L.push("");
      if (c.validation) {
        L.push(`* destination resolves to a page on disk: ${c.validation.destinationResolves ? "yes" : "no"}`);
        L.push(`* duplicate link created: ${c.validation.duplicateCreated ? "yes" : "no"}`);
        L.push(`* published copy unchanged: ${c.validation.copyUnchanged ? "yes" : "no"}`);
        if (analysis.mode === "trial") L.push("* reverted after validation: yes");
      } else {
        L.push("* not applied in this mode, so no post-edit checks were run");
      }
      L.push("");
    }
  }

  // --- Needs review --------------------------------------------------------
  L.push("## Needs review");
  L.push("");
  const shown = analysis.shownReview ?? analysis.needsReview;
  const review = shown.slice(0, config.output.maxReviewItems);
  if (review.length === 0) {
    L.push(
      analysis.needsReview.length
        ? "Nothing new. Everything still open is listed once under “Still open” below."
        : "Nothing. Every opportunity the agent found was either safe enough to do or not worth your time."
    );
    L.push("");
  } else {
    L.push(
      `${shown.length} opportunit${shown.length === 1 ? "y" : "ies"} worth a look.` +
        (shown.length > review.length ? ` The ${review.length} most useful are below.` : "") +
        " None of these will be changed automatically."
    );
    L.push("");
    L.push("| ID | From | To | Anchor | Confidence | Why not automatic |");
    L.push("|---|---|---|---|---|---|");
    for (const c of review) {
      const primary = c.blockers[0];
      L.push(
        `| ${c.id} | ${escapeCell(c.from)} | ${escapeCell(c.to)} | ${escapeCell(truncate(c.anchor, 34))} | ` +
          `${c.confidence} | ${escapeCell(REVIEW_REASON_LABELS[primary?.code] ?? primary?.code ?? "—")} |`
      );
    }
    L.push("");
    if (review.some((c) => c.blockers.some((b) => b.code === "FAIR_HOUSING_REVIEW"))) {
      L.push(
        "> **On the Fair Housing rows.** The filter is the GSC Opportunity Agent's, reused rather than rewritten, and " +
          "it was tuned for search queries. The objective property type “single-family” is normalized before " +
          "the check; anything else it matches is reported here. That is the safe direction to be wrong in: it " +
          "costs a link, never a bad edit. The matched word is printed on each row so you can clear it in seconds."
      );
      L.push("");
    }
    for (const c of review) {
      L.push(`### ${c.id} — ${c.from} → ${c.to}`);
      L.push("");
      L.push(`* **Destination candidate**: ${c.destination?.title ?? c.to}`);
      L.push(`* **Proposed anchor**: “${c.anchor}” (confidence ${c.confidence}, priority ${c.priority}) · status ${c.status ?? "NEW"}`);
      L.push(`* **Where**: \`${c.file}\` line ${c.line}${c.heading ? ` under “${c.heading}”` : ""}`);
      if (c.sentence) {
        L.push("* **The sentence it would sit in**:");
        L.push("");
        L.push(`  > ${escapeCell(c.sentence)}`);
        L.push("");
      }
      L.push("* **Why it was not safe to automate**:");
      for (const blocker of c.blockers) {
        L.push(`  * **${REVIEW_REASON_LABELS[blocker.code] ?? blocker.code}** — ${blocker.detail}`);
      }
      if (c.handoff) L.push(`* **Handoff**: ${c.handoff}`);
      L.push(`* **Fingerprint**: \`${c.fingerprint}\` — add it to \`decisions.rejected\` in config to close this for good`);
      L.push("");
    }
  }

  const quiet = analysis.quietReview ?? [];
  if (quiet.length) {
    L.push("### Still open (not repeated)");
    L.push("");
    L.push(
      `Already written up ${config.output.quietAfterReports}+ times with nothing material changed. Listed once so they are not ` +
        "lost; they come back in full if their confidence or blockers change. To close one for good, add its fingerprint " +
        "to `decisions.rejected` in `scripts/internal-links/config.mjs`."
    );
    L.push("");
    for (const c of quiet) {
      const h = c.historyRecord;
      L.push(
        `* ${c.status} · ${c.from} → ${c.to} “${escapeCell(truncate(c.anchor, 40))}” ${c.confidence} — ` +
          `${REVIEW_REASON_LABELS[c.blockers[0]?.code] ?? c.blockers[0]?.code ?? "review"}; first seen ${h?.firstSeen ?? "?"} as ${h?.firstId ?? "?"} (fingerprint \`${c.fingerprint}\`)`
      );
    }
    L.push("");
  }

  // --- Bridge-sentence handoffs -------------------------------------------
  if (analysis.bridgeSentenceHandoffs.length) {
    L.push("## Would need a sentence written (Content Publisher)");
    L.push("");
    L.push(
      "These pairs belong together, but the source page never names the destination in its own words, so there is " +
        "nothing honest to wrap in a link. Connecting them means writing a sentence, and this agent does not write " +
        "published prose."
    );
    L.push("");
    L.push("| From | To | Relatedness | What is missing |");
    L.push("|---|---|---|---|");
    for (const h of analysis.bridgeSentenceHandoffs) {
      L.push(
        `| ${escapeCell(h.from)} | ${escapeCell(h.to)} | ${h.relatedness} | ${escapeCell(
          truncate(h.reason, 140)
        )} |`
      );
    }
    L.push("");
  }

  // --- Orphans and weak pages ---------------------------------------------
  L.push("## Orphans and weakly linked pages");
  L.push("");
  L.push(
    "*Header, footer, nav and card-feed links are excluded on purpose — they point at every page and would make " +
      "nothing look like an orphan. So are in-page “Keep reading” cards, CTA buttons and Sources citations: a page " +
      "reachable only from those is not supported by any copy a reader meets mid-article. The last column shows them " +
      "so an orphan here is never mistaken for an unreachable page.*"
  );
  L.push("");
  const listWeak = (rows, heading, empty) => {
    L.push(`### ${heading}`);
    L.push("");
    if (rows.length === 0) {
      L.push(empty);
      L.push("");
      return;
    }
    L.push("| Route | Published | Contextual referrers | Linked from (in prose) | Also reachable from (cards / sources, not counted) |");
    L.push("|---|---|---|---|---|");
    for (const p of rows.slice(0, config.output.maxWeakPagesListed)) {
      const other = [...new Set([...(p.cardReferrers ?? []), ...(p.citationReferrers ?? [])])];
      L.push(
        `| ${escapeCell(p.route)} | ${p.publishedAt ?? "—"} | ${p.uniqueReferrers.length} | ` +
          `${escapeCell(p.uniqueReferrers.join(", ") || "nothing")} | ${escapeCell(other.join(", ") || "—")} |`
      );
    }
    L.push("");
  };
  listWeak(analysis.orphans, "Orphaned", "None. Every published editorial page is reachable from at least one other one.");
  listWeak(
    analysis.weaklyLinked,
    `Weakly linked (at or below ${config.graph.weaklyLinkedAtOrBelow} editorial referrer)`,
    "None."
  );
  listWeak(
    analysis.newlyPublishedNeedingDiscovery,
    `Newly published and hard to find (last ${config.graph.newlyPublishedDays} days)`,
    "None."
  );
  L.push(
    "> The agent does **not** manufacture a link to clear an orphan. A page appears here so a person can decide " +
      "whether it deserves one; it is only linked automatically when a genuine, in-context opportunity exists."
  );
  L.push("");

  // --- Graph hygiene -------------------------------------------------------
  const heavyDuplicates = analysis.duplicateLinks.filter(
    (d) => d.occurrence >= config.output.duplicateReportThreshold
  );
  L.push("## Broken and duplicate links");
  L.push("");
  if (!analysis.brokenLinks.length && !heavyDuplicates.length && !analysis.missingFromSitemap.length) {
    L.push("None. No internal link points at a missing route, no page repeats one destination in its prose, and the sitemap lists every editorial page.");
    L.push("");
  } else {
    if (analysis.brokenLinks.length) {
      L.push(`**${analysis.brokenLinks.length} internal link(s) point at a route with no page file.**`);
      L.push("");
      for (const b of analysis.brokenLinks.slice(0, 15)) {
        L.push(`* \`${b.file}\` line ${b.line}: ${b.from} → ${b.to}`);
      }
      L.push("");
    }
    if (heavyDuplicates.length) {
      L.push(
        `**${heavyDuplicates.length} place(s) where one page links the same destination ` +
          `${config.output.duplicateReportThreshold}+ times in its prose.** Twice is normal in a long LVINIT guide and is not ` +
          `listed; Sources citations and "Keep reading" cards are never counted. (${analysis.duplicateLinks.length} repeat prose link(s) in total ` +
          "across the site — all of them are in the JSON report.) Removing a link is an editorial call, so this is report-only."
      );
      L.push("");
      for (const d of heavyDuplicates.slice(0, 15)) {
        L.push(`* ${d.from} → ${d.to} (occurrence ${d.occurrence}, \`${d.file}\` line ${d.line})`);
      }
      L.push("");
    }
    if (analysis.missingFromSitemap.length) {
      L.push(`**${analysis.missingFromSitemap.length} editorial page(s) are missing from \`app/sitemap.ts\`.**`);
      L.push("");
      for (const r of analysis.missingFromSitemap) L.push(`* ${r}`);
      L.push("");
      L.push("*The sitemap is hand-maintained and belongs to the Content Publisher. This agent reports the drift and does not touch it.*");
      L.push("");
    }
  }

  // --- Validation detail ---------------------------------------------------
  L.push("## Validation");
  L.push("");
  if (x.validation.skipped) {
    L.push("Validation was skipped by configuration. No edit may be committed from a run in this state.");
  } else if (x.validation.results.length === 0 && x.fatal && x.attempted) {
    L.push(`Validation did not run: ${x.fatal}`);
  } else if (x.validation.results.length === 0) {
    L.push("No edits were applied, so there was nothing to validate.");
  } else {
    L.push("| Check | Command | Result | Time |");
    L.push("|---|---|---|---|");
    for (const r of x.validation.results) {
      L.push(
        `| ${r.label} | \`${escapeCell(r.command)}\` | ${r.ok ? "passed" : `**failed** (exit ${r.code})`} | ` +
          `${(r.durationMs / 1000).toFixed(1)}s |`
      );
    }
    L.push("");
    if (x.validation.failed) {
      L.push("**The failing output:**");
      L.push("");
      L.push("```");
      L.push(tailOutput(x.validation.failed.output, 40));
      L.push("```");
      L.push("");
      L.push("Every edit from this run was reverted. Nothing was committed or pushed.");
    }
  }
  L.push("");

  if (x.diff) {
    L.push("### The diff the agent produced");
    L.push("");
    L.push(`Paths touched: ${x.diff.paths.map((p) => `\`${p}\``).join(", ") || "none"}`);
    L.push("");
    L.push(
      `Only \`<Link>\` wrappers were added: **${x.diff.onlyLinkWrappers ? "yes" : "no"}**` +
        (x.diff.disallowed.length ? ` — disallowed paths: ${x.diff.disallowed.join(", ")}` : "")
    );
    L.push("");
  }

  // --- Continuity ----------------------------------------------------------
  if (analysis.resolved.length) {
    L.push("## Resolved since the last run");
    L.push("");
    for (const r of analysis.resolved) {
      L.push(`* ${r.from} → ${r.to} (was ${r.id} on ${r.reportedOn}) no longer appears — it was linked, or the pages changed.`);
    }
    L.push("");
  }

  // --- Boundaries ----------------------------------------------------------
  L.push("## What this agent will never do");
  L.push("");
  for (const action of PROHIBITED_ACTIONS) L.push(`* ${action}`);
  L.push("");
  L.push(
    "Anything on that list that a finding above genuinely needs is a **Content Publisher** job. Quote the ID when you " +
      "hand it over."
  );
  L.push("");
  L.push("---");
  L.push("");
  L.push(
    `*Generated by \`scripts/internal-links/run.mjs\`. Thresholds live in \`scripts/internal-links/config.mjs\`; ` +
      `the plain-English version is \`docs/INTERNAL_LINKING_AGENT.md\`.*`
  );

  return L.join("\n");
}

/**
 * The gates an auto-executed link cleared, one line each. Every one of these
 * was checked in code; the list is generated from the candidate, not typed.
 */
export function safetyChecklist(c, config) {
  const lines = [
    `source and destination are both published pages in the registry (${c.from}, ${c.to})`,
    `the anchor is ${c.anchor.split(/\s+/).length} existing word(s) of prose — nothing is written, reworded or removed`,
    `the anchor names the destination: anchor quality ${c.components?.anchorQuality}, supported by ${
      c.supportingTokens?.length ? c.supportingTokens.map((t) => `“${t}”`).join(", ") : "the destination's own proper name"
    } in the same paragraph`,
    `${c.from} does not already link to ${c.to} anywhere on the page`,
    `the paragraph has no link yet (${c.paragraphLinks ?? 0} of ${config.density.maxLinksPerParagraph} allowed) and at least ${config.density.minParagraphWords} words`,
    `the page has ${c.source?.outgoingEditorialCount ?? "?"} editorial links, under the ${config.density.maxEditorialLinksPerPage} density ceiling`,
    `exactly one destination fits these words (no competing candidate)`,
    `Fair Housing: clean on the anchor, paragraph, section heading and destination headline`,
    `not compliance, brokerage, licensing, disclaimer or sourcing copy${c.heading ? ` (section “${c.heading}”)` : ""}`,
    `Fact-Decay: ${c.eligibility?.code ?? "not checked"}`,
    `no live Content Publisher handoff on the source page; not previously removed by a person; not vetoed`,
    `confidence ${c.confidence} ≥ the ${config.relevance.autoExecuteMinConfidence} auto-execution line`,
    `no metadata, schema, nav, CTA, image or layout change — the edit is one <Link> wrapper inside <${c.container}>`,
  ];
  return lines.map((l) => `* ✓ ${l}`).join("\n");
}

/** The lines the runner prints to stdout. */
export function summaryLines(analysis) {
  const t = analysis.totals;
  const lines = [
    `  Pages scanned:        ${t.pagesScanned}`,
    `  Editorial links:      ${t.editorialLinks}`,
    `  Opportunities:        ${t.opportunitiesDetected}`,
    `  Auto-executed:        ${t.autoExecuted}`,
    `  Needs review:         ${t.needsReview} (${t.reviewShownInFull ?? t.needsReview} shown, ${t.reviewStillOpenQuiet ?? 0} quiet)`,
    `  Ignored:              ${t.ignoredBelowReportLine ?? 0} below the reporting line`,
    `  Orphans / weak pages: ${t.orphans} / ${t.weaklyLinked}`,
  ];
  return lines;
}
