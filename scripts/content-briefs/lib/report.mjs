// ---------------------------------------------------------------------------
// REPORT RENDERING — short Markdown for Mikey, full JSON for machines
//
// The Markdown is built to be read in two minutes. It leads with the answer
// ("N briefs would go to the Publisher" / "No high-confidence content briefs
// this week"), shows only what is NEW or materially changed in full, collapses
// everything already seen to one line, and caps every section.
//
// Every number is labelled as one of: RAW Search Console metric, CALCULATED,
// INTERPRETATION, or RECOMMENDED ACTION — the same four labels the GSC agent
// uses.
// ---------------------------------------------------------------------------

import { escapeCell, truncate } from "../../gsc/lib/text.mjs";

import { ACTIONS, NEW_ACTIONS } from "../config.mjs";
import { inventorySummary } from "./inventory.mjs";

export const REPORT_SCHEMA_VERSION = "1.0.0";

export const PROHIBITED_ACTIONS = [
  "write or rewrite an article, or any part of one",
  "edit any page, metadata, schema, imagery, link, or registry entry",
  "publish, commit, push, or deploy anything",
  "trigger or dispatch the Content Publisher",
  "treat Search Console data as an editorial fact",
  "invent search volume, traffic value, leads, revenue, or conversion",
  "propose content framed around protected classes, school rankings, or safety",
  "modify the GSC, Fact-Decay, or Internal Linking agents' reports or scoring",
];

const ACTION_LABELS = {
  [ACTIONS.UPDATE_EXISTING]: "Update existing page",
  [ACTIONS.EXPAND_EXISTING]: "Expand existing page",
  [ACTIONS.NEW_ARTICLE]: "New article",
  [ACTIONS.NEW_COMPARISON]: "New comparison",
  [ACTIONS.INTERNAL_LINK_ONLY]: "Internal links only",
  [ACTIONS.MONITOR_ONLY]: "Monitor only",
  [ACTIONS.REJECT_DUPLICATE]: "Rejected — duplicate",
  [ACTIONS.REJECT_LOW_VALUE]: "Rejected — low value",
};

const fmt = (n) => (Number.isFinite(n) ? n.toLocaleString("en-US") : "—");
const pct = (n) => (Number.isFinite(n) ? `${(n * 100).toFixed(1)}%` : "—");
const pos = (n) => (Number.isFinite(n) ? n.toFixed(1) : "—");

// ---------------------------------------------------------------------------
// JSON
// ---------------------------------------------------------------------------

export function buildJsonReport({ analysis, config, meta }) {
  const a = analysis;
  return {
    schemaVersion: REPORT_SCHEMA_VERSION,
    agent: "content-brief-generator",
    generatedAt: new Date().toISOString(),
    reportDate: a.reportDate,
    fixtureData: Boolean(meta.fixtureData),
    mode: "report-only",
    inputs: {
      gsc: {
        available: a.gsc.available,
        mode: a.gsc.mode,
        reason: a.gsc.reason,
        reportDate: a.gsc.reportDate,
        ageDays: a.gsc.ageDays,
        schemaVersion: a.gsc.report?.schemaVersion ?? null,
        window: a.gsc.report?.windows ?? null,
        lowVolume: a.gsc.lowVolume ?? null,
        demandBasis: a.demandBasis,
      },
      factDecay: { available: a.factDecay.available, reason: a.factDecay.reason, reportDate: a.factDecay.reportDate ?? null },
      internalLinks: {
        available: a.internalLinks.available,
        reason: a.internalLinks.reason,
        reportDate: a.internalLinks.reportDate ?? null,
        orphans: a.internalLinks.orphans,
        weaklyLinked: a.internalLinks.weaklyLinked,
        newPagesNeedingSupport: a.internalLinks.newPagesNeedingSupport,
      },
      publisherStatus: { available: a.published.available, reason: a.published.reason, publishedFingerprints: a.published.fingerprints.size },
      historyReports: meta.historyCount ?? 0,
    },
    configuration: {
      demand: config.demand,
      overlap: config.overlap,
      scoring: config.scoring,
      confidence: config.confidence,
      editorial: config.editorial,
      output: { ...config.output, dir: undefined },
      handoff: { ...config.handoff },
    },
    demandTotals: a.demandTotals,
    summary: {
      intentGroups: a.groupsFound,
      belowMinimumDemand: a.thin,
      fairHousingExcluded: a.exclusions.length,
      classified: a.opportunities.length,
      byAction: Object.fromEntries(Object.values(ACTIONS).map((k) => [k, a.opportunities.filter((o) => o.action === k).length])),
      briefsWritten: a.opportunities.filter((o) => o.brief).length,
      newBriefsShown: a.selection.newBriefs.length,
      updateBriefsShown: a.selection.updateBriefs.length,
      reportOnlyShown: a.selection.reportOnly.length,
      rejected: a.rejected.length,
      wouldHandOff: a.queue.queue.length,
      handoffMode: a.queue.mode,
    },
    opportunities: a.opportunities.map(({ brief, history, ...rest }) => ({ ...rest, history: history ?? null, briefPath: brief ? `briefs/${rest.id}.json` : null })),
    handoff: a.queue,
    rejected: a.rejected,
    pageSignals: a.pageSignals,
    resolved: a.resolved,
    fairHousing: {
      policy: "Any grouped query touching a protected class or recognized proxy excludes the whole intent. Reuses the GSC agent's rules through the Internal Linking Agent's single 'single-family' property-type exemption.",
      excluded: a.exclusions,
    },
    navigationalQueries: {
      policy:
        "Address and street lookups are set aside before grouping so they cannot dilute a real neighborhood intent. This is NOT a Fair Housing exclusion and says nothing about the searcher: the raw rows are preserved here, and they count toward no brief's demand, score or confidence. A query about traffic, construction, development, access or a neighborhood is never treated this way, however many road words it contains.",
      code: "NAVIGATIONAL_STREET_QUERY",
      count: a.navigational?.length ?? 0,
      impressions: (a.navigational ?? []).reduce((s, n) => s + n.raw.impressions, 0),
      queries: a.navigational ?? [],
    },
    inventory: inventorySummary(a.inventory),
    notes: a.notes,
    prohibited: PROHIBITED_ACTIONS,
  };
}

/** One machine-readable file per brief — what the Publisher would read. */
export function buildBriefFile(opportunity, analysis) {
  return {
    schemaVersion: REPORT_SCHEMA_VERSION,
    agent: "content-brief-generator",
    ...opportunity.brief,
    fingerprint: opportunity.fingerprint,
    intentKey: opportunity.intentKey,
    status: opportunity.status,
    handoffStatus: opportunity.handoffStatus,
    handoffBlockers: opportunity.handoff.reasons,
    audit: {
      dateCreated: opportunity.dateCreated,
      reportDate: analysis.reportDate,
      sourceGscReportDate: opportunity.sourceGscReportDate,
      sourceOpportunityIds: opportunity.sourceOpportunityIds,
      sourceQueries: opportunity.queries.map((q) => q.query),
      metrics: opportunity.metrics,
      classification: { action: opportunity.action, reason: opportunity.classificationReason },
      score: opportunity.score,
      confidence: { level: opportunity.confidence, caveats: opportunity.confidenceCaveats },
      duplicateCheck: opportunity.duplicateCheck,
      persistenceRuns: opportunity.persistenceRuns,
      previousIds: opportunity.history?.previousIds ?? [],
      handoffStatus: opportunity.handoffStatus,
      publisherExecution: opportunity.publication ?? null,
    },
    publisherNote:
      "All facts must be independently researched and confirmed current before publication. Search Console figures in this brief describe search DEMAND and must never be published as editorial facts.",
  };
}

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

export function buildMarkdownReport({ analysis, config, meta }) {
  const a = analysis;
  const L = [];
  const push = (...lines) => L.push(...lines);

  push(`# LVINIT Content Briefs — ${a.reportDate}`, "");
  if (meta.fixtureData) {
    push("> ⚠️ **FIXTURE DATA.** Every Search Console number below is synthetic. Nothing here reflects LVINIT's real search demand, and nothing from a fixture run can ever be handed to the Publisher.", "");
  }
  push(`**Mode:** report-only · **Publisher handoff:** ${a.queue.mode === "live" ? "LIVE" : "DRY RUN — nothing is dispatched"}  `);
  push(`**Search demand:** ${a.gsc.available ? `GSC report ${a.gsc.reportDate} (${a.gsc.report.windows?.current?.start} to ${a.gsc.report.windows?.current?.end}), ${a.demandBasis}` : "unavailable"}  `);
  push(`**Fact-Decay:** ${a.factDecay.available ? a.factDecay.reportDate : "not used"} · **Internal Linking:** ${a.internalLinks.available ? a.internalLinks.reportDate : "not used"} · **Earlier brief runs read:** ${meta.historyCount ?? 0}`, "");

  // --- Bottom line -----------------------------------------------------------
  push("## Bottom line", "");
  const q = a.queue.queue;
  if (q.length) {
    push(`**${q.length} brief${q.length === 1 ? "" : "s"} ${a.queue.mode === "live" ? "queued for" : "would be handed to"} the Content Publisher.**`, "");
  } else {
    push("**No high-confidence content briefs this week.**", "");
  }
  const s = a.selection;
  push(
    `${a.groupsFound} search intent${a.groupsFound === 1 ? "" : "s"} found · ${a.thin.groups} below the ${a.thin.threshold}-impression minimum · ${(a.navigational ?? []).length} address/street lookups set aside · ${a.exclusions.length} excluded (Fair Housing) · ${a.rejected.length} rejected · ${s.newBriefs.length} new-content brief${s.newBriefs.length === 1 ? "" : "s"} · ${s.updateBriefs.length} update brief${s.updateBriefs.length === 1 ? "" : "s"} · ${s.reportOnly.length} report-only`,
    ""
  );
  for (const note of a.notes) push(`- ${note}`);
  if (a.notes.length) push("");

  // --- Would hand off ----------------------------------------------------------
  push(`## ${a.queue.mode === "live" ? "Queued for the Publisher" : "What would be handed to the Publisher"}`, "");
  push(`*${a.queue.modeReason}.*`, "");
  if (q.length === 0) {
    push("Nothing cleared every handoff criterion. That is the expected result on thin data — see the criteria at the end.", "");
  } else {
    push("| # | Brief | Action | Target / proposed slug | Score | Confidence |", "|---|---|---|---|---:|---|");
    for (const item of q) {
      push(`| ${item.order} | ${item.briefId} | ${ACTION_LABELS[item.action]} | \`${item.targetRoute ?? item.proposedRoute}\` | ${item.score} | ${item.confidence} |`);
    }
    push("");
  }

  // --- Briefs ------------------------------------------------------------------
  const briefSection = (title, list) => {
    push(`## ${title}`, "");
    if (list.length === 0) {
      push("None this week.", "");
      return;
    }
    for (const o of list) renderBrief(push, o);
  };
  briefSection("New-content briefs", s.newBriefs);
  briefSection("Update briefs", s.updateBriefs);

  // --- Report-only -------------------------------------------------------------
  push("## Report-only", "");
  const pageSignalRoom = Math.max(0, config.output.maxReportOnly - s.reportOnly.length);
  const pageSignals = a.pageSignals.slice(0, pageSignalRoom);
  const hiddenSignals = a.pageSignals.length - pageSignals.length;
  if (s.reportOnly.length === 0 && pageSignals.length === 0) push("None.", "");
  for (const o of s.reportOnly) {
    push(`- **${o.id}** · ${ACTION_LABELS[o.action]} · "${escapeCell(o.leadQuery)}" (${o.queries.length} quer${o.queries.length === 1 ? "y" : "ies"}, ${o.metrics.impressions} impressions RAW) · score ${o.score} · ${o.confidence} confidence  `);
    push(`  ${o.reportOnlyReason ? `${o.reportOnlyReason}. ` : ""}${o.classificationReason}`);
  }
  for (const p of pageSignals) {
    push(`- **${p.id}** (GSC, ${p.type}) · \`${p.route}\` · ${fmt(p.impressions)} impressions (${p.scope}) · ${ACTION_LABELS[p.action]}  `);
    push(`  ${p.reason}`);
  }
  if (s.overflow + hiddenSignals) push(`- ${s.overflow + hiddenSignals} more item${s.overflow + hiddenSignals === 1 ? "" : "s"} beyond the report caps ${s.overflow + hiddenSignals === 1 ? "is" : "are"} in the JSON.`);
  push("");

  // --- Still open ----------------------------------------------------------
  if (s.stillOpen.length || a.resolved.length) {
    push("## Seen before", "");
    for (const o of s.stillOpen) {
      const h = o.history;
      push(`- ${o.status} · ${ACTION_LABELS[o.action]} · "${escapeCell(o.leadQuery)}" — first seen ${h?.firstSeen ?? "?"} as ${h?.firstId ?? "?"}, ${h?.timesSeen ?? 0} earlier report${h?.timesSeen === 1 ? "" : "s"}${o.status === "HANDOFF_STALLED" ? " — **handed off and never published; needs you**" : ""}`);
    }
    for (const r of a.resolved) push(`- ${r.status} · ${r.id} (${ACTION_LABELS[r.action] ?? r.action}) from ${r.reportedOn} no longer appears`);
    push("");
  }

  // --- Rejected -----------------------------------------------------------------
  push("## Rejected", "");
  if (a.rejected.length === 0) push("Nothing was rejected.", "");
  else {
    push(`${a.rejected.length} intent${a.rejected.length === 1 ? "" : "s"} rejected${a.rejected.length > config.output.maxRejectedListed ? `; the ${config.output.maxRejectedListed} largest are listed` : ""}.`, "");
    push("| Lead query | Queries | Impr. (RAW) | Why |", "|---|---:|---:|---|");
    for (const r of a.rejected.slice(0, config.output.maxRejectedListed)) push(`| ${escapeCell(truncate(r.leadQuery, 50))} | ${r.queries} | ${r.impressions} | ${escapeCell(r.reason)} |`);
    push("");
  }

  // --- Search demand -------------------------------------------------------
  push("## The search demand, before interpretation", "");
  if (!a.demandTotals) push("No usable GSC report.", "");
  else {
    const t = a.demandTotals;
    push("| Measure | Impressions | Clicks | Rows |", "|---|---:|---:|---:|");
    push(`| Query dimension, rows this run used (RAW) | ${fmt(t.queryDimension.currentImpressions)} | ${fmt(t.queryDimension.currentClicks)} | ${t.queryDimension.queries} queries |`);
    if (t.pageDimension) push(`| Page dimension (RAW, includes anonymized queries) | ${fmt(t.pageDimension.currentImpressions)} | ${fmt(t.pageDimension.currentClicks)} | ${t.pageDimension.pages} pages |`);
    push(`| GSC report's own totals (RAW) | ${fmt(t.gscReportTotals.currentImpressions)} | ${fmt(t.gscReportTotals.currentClicks)} | ${t.gscReportTotals.uniqueQueries} queries / ${t.gscReportTotals.uniquePages} pages |`);
    push("", "*Query and page totals are aggregated differently by Google and are never added together or compared as one number.*", "");
  }

  // --- Signals ------------------------------------------------------------------
  push("## Other signals used", "");
  push(`- **Fact-Decay:** ${a.factDecay.reason}.`);
  push(`- **Internal Linking:** ${a.internalLinks.reason}.${a.internalLinks.available ? ` Orphans: ${a.internalLinks.orphans.map((o) => `\`${o.route}\``).join(", ") || "none"}. Weakly linked: ${a.internalLinks.weaklyLinked.length}. New pages needing support: ${a.internalLinks.newPagesNeedingSupport.length}. Used for link plans and a small weak-cluster bonus — never to invent an article.` : ""}`);
  push(`- **Publisher status:** ${a.published.reason}; ${a.published.fingerprints.size} executed brief${a.published.fingerprints.size === 1 ? "" : "s"} found.`, "");

  // --- Inventory --------------------------------------------------------------
  const inv = inventorySummary(a.inventory);
  push("## Content inventory", "");
  push(`${inv.totals.published} published editorial pages compared against every intent (${inv.totals.skipped} routes out of scope).`, "");
  push("| Coverage | Pages |", "|---|---:|");
  for (const [bucket, v] of Object.entries(inv.coverage)) push(`| ${bucket} | ${v.count} |`);
  push("", "<details><summary>Every page</summary>", "", "| Route | Category | Published | Modified | Links in / out | Headings | Words |", "|---|---|---|---|---:|---:|---:|");
  for (const p of inv.pages) push(`| \`${p.route}\` | ${p.category ?? "—"} | ${p.publishedAt ?? "—"} | ${p.dateModified ?? "—"} | ${p.linksIn} / ${p.linksOut} | ${p.headings} | ${fmt(p.bodyWords)} |`);
  push("", "</details>", "");

  // --- Fair Housing ------------------------------------------------------------
  push("## Fair Housing exclusions", "");
  if (a.exclusions.length === 0) push("No query tripped the Fair Housing rules.", "");
  else {
    push("Excluded entirely — never scored, never briefed:", "");
    for (const e of a.exclusions) push(`- "${escapeCell(e.query)}" (${e.impressions} impressions RAW) — ${e.category}: ${e.reason}`);
    push("");
  }

  // --- Navigational queries ------------------------------------------------
  const nav = a.navigational ?? [];
  if (nav.length) {
    push("## Address and street lookups (not briefed)", "");
    push(
      "Set aside **before** grouping so they cannot dilute a real neighborhood intent. This is not a Fair Housing exclusion and says nothing about the searcher — the raw numbers are below, and they count toward no brief.",
      ""
    );
    push("| Query | Impr. (RAW) | Clicks | Pos. | Why |", "|---|---:|---:|---:|---|");
    for (const n of nav) push(`| ${escapeCell(n.query)} | ${n.raw.impressions} | ${n.raw.clicks} | ${pos(n.raw.position)} | ${n.kind} ("${escapeCell(n.matched)}") |`);
    push("", "*A query about traffic, construction, development, access or a neighborhood is never set aside this way — a roadway in a query is not noise by itself.*", "");
  }

  // --- How it decides ------------------------------------------------------------
  push("## How this report decides", "");
  push(
    "- **Grouping:** queries are normalized and reduced to the places, projects and housing decisions they name. A comparison is keyed on what is being compared, so \"X vs Y\", \"Y vs X\" and \"is X cheaper than Y\" are one intent with several supporting queries.",
    `- **Duplicate check:** every intent is compared to every published page — route, title, H1, meta description, headings, article text, category, topics — and rated same (≥ ${config.overlap.same}), substantial (≥ ${config.overlap.substantial}), adjacent (≥ ${config.overlap.adjacent}) or distinct.`,
    "- **Update before new:** same or substantial overlap means update or expand the existing page, never a new one. Two existing pages competing means nothing new, ever.",
    "- **Score (0–100)** weighs demand, ranking upside, growth, intent depth, LVINIT relevance, cluster value, distinctness, actionability and evidence strength; demand is a minority share. **Confidence** is separate and only comes from volume, persistence and a clean duplicate check.",
    `- **Handoff** requires score ≥ ${config.handoff.minScore}, High confidence, no cannibalization or ambiguity, clear intent, clear LVINIT fit, clean Fair Housing, a real and fresh GSC report, verifiable Publisher status, and an action of NEW_ARTICLE, NEW_COMPARISON, UPDATE_EXISTING or EXPAND_EXISTING.`,
    ""
  );

  push("## What this agent did not do", "");
  for (const p of PROHIBITED_ACTIONS) push(`- ${p}`);
  push("");
  return L.join("\n");
}

function renderBrief(push, o) {
  const b = o.brief;
  push(`### ${o.id} — ${ACTION_LABELS[o.action]}${b.workingTitle ? `: ${b.workingTitle}` : ""}`, "");
  push(`**Score ${o.score}/100** · Confidence **${o.confidence}** · ${o.status}${o.status === "PERSISTING" ? ` (first seen ${o.history?.firstSeen ?? "?"}${o.materialChange ? ", materially changed" : ""})` : ""} · Handoff: **${o.handoffStatus}**`, "");
  if (o.handoff.reasons.length) push(`*Not handed off because:* ${o.handoff.reasons.join("; ")}.`, "");
  push(`**Primary search question:** ${b.primarySearchQuestion}  `);
  push(`**Intent:** ${b.underlyingIntent.intent} · cluster ${b.underlyingIntent.cluster}${b.underlyingIntent.facets.length ? ` · facets: ${b.underlyingIntent.facets.join(", ")}` : ""} · clarity ${b.underlyingIntent.clarity}  `);
  if (NEW_ACTIONS.has(o.action)) push(`**Proposed slug:** \`${b.newContent.proposedRoute}\``);
  if (b.update) push(`**Target:** \`${b.update.targetRoute}\` — ${b.update.targetTitle}`);
  push("", `**Why LVINIT:** ${b.whyLvinit}`, "");
  push("**Search evidence** *(RAW Search Console, query dimension — demand, not facts)*", "");
  push("| Query | Impr. | Clicks | CTR | Pos. | Prev. impr. |", "|---|---:|---:|---:|---:|---:|");
  for (const q of b.gscEvidence.queries) push(`| ${escapeCell(q.query)} | ${q.raw.impressions} | ${q.raw.clicks} | ${pct(q.raw.ctr)} | ${pos(q.raw.position)} | ${q.previous ? q.previous.impressions : "—"} |`);
  if (b.gscEvidence.additionalQueries) push(`| …and ${b.gscEvidence.additionalQueries} more | | | | | |`);
  push("", `*CALCULATED:* ${b.gscEvidence.calculated.impressions} impressions across the group, impression-weighted position ${pos(b.gscEvidence.calculated.weightedPosition)}.${b.gscEvidence.gscFindings.length ? ` GSC findings: ${b.gscEvidence.gscFindings.map((f) => `${f.id} (${f.type})`).join(", ")}.` : ""}`, "");
  const dc = b.duplicateCheck;
  push(`**Duplicate check:** ${dc.meaning}${dc.bestMatch ? ` — closest \`${dc.bestMatch.route}\` (${dc.bestMatch.relation}, overlap ${dc.bestMatch.overlap}${dc.bestMatch.reasons.length ? `; ${dc.bestMatch.reasons.join("; ")}` : ""})` : ""}.${dc.cannibalization.status !== "none" ? ` **Cannibalization (${dc.cannibalization.status}):** ${dc.cannibalization.reason}` : ""}${dc.ambiguous ? " *Near a band edge — treat the verdict with care.*" : ""}`, "");
  push(`**Recommended action:** ${b.recommendedAction}`, "");
  push(`**LVINIT angle:** ${b.editorialAngle}`, "");
  if (b.update) {
    push(`**Missing intent:** ${b.update.exactIntentMissing}  `);
    push(`**Current relevant section:** ${b.update.currentRelevantSection ?? "none clearly matches"}  `);
    push(`**Improve:** ${b.update.whatNeedsImprovement}  `);
    push(`**Do not rewrite:** ${b.update.whatNotToRewrite.join("; ")}  `);
    push(`**dateModified:** ${b.update.dateModified}`);
    if (b.update.factDecay?.highPriority?.length) push(`**Fact-Decay on this page:** ${b.update.factDecay.highPriority.map((f) => `${f.id} (priority ${f.priority}, ${f.riskLevel} risk, ${f.verification})`).join("; ")}. ${b.update.factDecay.instruction}`);
    if (b.update.internalLinkingNotes) push(`**Internal Linking:** ${b.update.internalLinkingNotes.join(" ")}`);
    push("");
  }
  if (b.newContent) {
    push(`**Why existing content does not answer it:** ${b.newContent.whyExistingContentDoesNotAnswerIt}`);
    if (b.newContent.differentiation.length) push(`**Differentiate from:** ${b.newContent.differentiation.join(" ")}`);
    push("");
  }
  push("**Must not become:** " + b.mustNotBecome.join("; ") + ".", "");
  push("**Key questions:**", ...b.keyQuestions.map((k) => `- ${k}`), "");
  push(`**${b.update ? "Section(s) to add or sharpen" : "Likely sections"}:** ` + b.likelySections.join(" → "), "");
  push("**Links out:** " + (b.internalLinksOut.map((l) => `\`${l.route}\`${l.note ? ` (${l.note})` : ""}`).join(", ") || "none identified"));
  push(`**${b.update ? "Internal links to revisit" : "Should later link in"}:** ` + (b.pagesThatShouldLinkIn.map((l) => `\`${l.route}\``).join(", ") || "none identified"), "");
  push("**Research requirements:**", ...b.researchRequirements.map((r) => `- ${r}`), "");
  push(`**Fair Housing:** ${b.fairHousing.clean ? "clean" : `FLAGGED — ${b.fairHousing.issues.map((i) => i.matched).join(", ")}`}. ${b.fairHousing.notes}  `);
  push(`**CTA:** ${b.cta}  `);
  push(`**Video:** ${b.video}`, "");
  push(`<details><summary>Score arithmetic</summary>`, "", "| Component | Weight | Value | Share |", "|---|---:|---:|---:|");
  for (const r of o.scoreBreakdown) push(`| ${r.component} | ${r.weight} | ${r.value} | ${r.sharePct}% |`);
  push("", `Confidence caveats: ${o.confidenceCaveats.join("; ") || "none"}.`, "", "</details>", "");
}

/** The short summary printed to the console / run page. */
export function summaryLines(analysis) {
  const a = analysis;
  const lines = [];
  lines.push(`  Search demand: ${a.gsc.available ? `${a.gsc.reportDate} (${a.gsc.mode})` : `UNAVAILABLE — ${a.gsc.reason}`}`);
  lines.push(`  Intents:       ${a.groupsFound} found, ${a.thin.groups} below minimum, ${(a.navigational ?? []).length} address/street lookups, ${a.exclusions.length} Fair Housing excluded, ${a.rejected.length} rejected`);
  lines.push(`  Briefs:        ${a.selection.newBriefs.length} new-content, ${a.selection.updateBriefs.length} update, ${a.selection.reportOnly.length} report-only`);
  lines.push(`  Handoff:       ${a.queue.queue.length} ${a.queue.mode === "live" ? "queued" : "would be handed off (dry run)"}`);
  if (a.queue.queue.length === 0) lines.push("  No high-confidence content briefs this week.");
  for (const item of a.queue.queue) lines.push(`    ${item.briefId}  ${String(item.score).padStart(5)}  ${item.action.padEnd(16)} ${item.targetRoute ?? item.proposedRoute}`);
  return lines;
}
