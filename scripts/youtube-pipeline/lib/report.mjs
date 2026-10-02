// ---------------------------------------------------------------------------
// REPORTS — Markdown for Mikey, JSON for machines (and for next run's history)
//
//   reports/youtube-pipeline/youtube-pipeline-<date>.md
//   reports/youtube-pipeline/youtube-pipeline-<date>.json
//   reports/youtube-pipeline/packages/<VID-…>.json
//   reports/youtube-pipeline/handoff-queue-<date>.json (+ handoff-queue.json)
// ---------------------------------------------------------------------------

import { AGENT, SCHEMA_VERSION } from "../config.mjs";

export const PROHIBITED_ACTIONS = [
  "publish or edit any page",
  "commit, push or deploy",
  "trigger the Content Publisher",
  "add links to existing published pages",
  "invent transcript content, FAQ answers, upload dates or durations",
  "poll YouTube",
];

const ACTION_GROUPS = {
  newArticle: ["NEW_ARTICLE", "CREATE_COMPARISON_SUPPORT", "CREATE_NEIGHBORHOOD_SUPPORT"],
  update: ["UPDATE_EXISTING_ARTICLE", "CREATE_FAQ_SECTION"],
  embedOnly: ["ADD_VIDEO_TO_EXISTING_ARTICLE", "VIDEO_ONLY_NO_ARTICLE"],
  duplicate: ["REJECT_DUPLICATE"],
};

export function summarize(items) {
  const count = (pred) => items.filter(pred).length;
  return {
    videosAnalyzed: items.length,
    newArticleCandidates: count((i) => ACTION_GROUPS.newArticle.includes(i.action)),
    updateCandidates: count((i) => ACTION_GROUPS.update.includes(i.action)),
    embedOnlyCandidates: count((i) => ACTION_GROUPS.embedOnly.includes(i.action)),
    duplicates: count((i) => i.action === "REJECT_DUPLICATE" || i.lifecycle === "DUPLICATE"),
    monitorOnly: count((i) => i.action === "MONITOR_ONLY"),
    blocked: count((i) => !i.handoff.eligible && !["REJECT_DUPLICATE", "MONITOR_ONLY"].includes(i.action)),
    transcriptRequired: count((i) => i.transcriptRequired || i.transcript.status !== "OK"),
    readyForPublisher: count((i) => i.lifecycle === "READY_FOR_PUBLISHER"),
    verificationRequired: items.reduce((s, i) => s + i.checklist.length, 0),
    fairHousingBlocked: count((i) => i.fairHousing.status === "BLOCKED"),
  };
}

/** The JSON report. Transcript text itself is not repeated — it lives in its file. */
export function buildJsonReport({ items, queue, meta }) {
  return {
    schema_version: SCHEMA_VERSION,
    agent: AGENT,
    reportDate: meta.reportDate,
    generatedAt: meta.generatedAt,
    fixtureData: Boolean(meta.fixtureData),
    prohibitedActions: PROHIBITED_ACTIONS,
    inputs: meta.inputs,
    summary: summarize(items),
    videos: items.map((i) => ({
      id: i.id,
      fingerprint: i.fingerprint,
      lifecycle: i.lifecycle,
      youtubeId: i.video.youtubeId,
      url: i.video.urls?.watch ?? null,
      title: i.video.title,
      action: i.action,
      provisional: i.provisional,
      transcriptRequired: i.transcriptRequired,
      target: i.target,
      parent: i.parent,
      proposedRoute: i.proposed?.route ?? null,
      overlap: {
        verdict: i.overlap.verdict,
        distinctQuestion: i.overlap.distinctQuestion,
        committedBy: i.overlap.committedBy,
        cannibalization: i.overlap.cannibalization,
        topMatches: i.overlap.topMatches.map((m) => ({ route: m.route, label: m.label, overlap: m.overlap, titleSimilarity: m.titleSimilarity, embedsVideo: m.embedsVideo, missingFacets: m.missingFacets, reasons: m.reasons })),
      },
      classificationReasons: i.classificationReasons,
      confidence: i.confidence,
      transcript: { status: i.transcript.status, reason: i.transcript.reason, path: i.transcript.path, source: i.transcript.source, verified: i.transcript.verified, words: i.transcript.words, hash: i.transcript.hash, timestamps: i.transcript.timestamps ?? null, corrections: i.transcript.corrections ?? [] },
      claims: i.claimsSummary,
      group: i.group,
      fairHousing: { ...i.fairHousing, transcriptFlags: i.transcriptFairHousingFlags, generated: i.generatedFairHousing.blocked },
      voice: i.voice,
      verificationChecklist: i.checklist,
      schema: { blocked: i.schema.blocked, validation: i.schema.validation, conflicts: i.schema.conflicts },
      handoff: i.handoff,
      settled: i.settled,
      packagePath: `packages/${i.id}.json`,
    })),
    unlistedSiteVideos: meta.unlisted ?? [],
    handoff: queue,
  };
}

const esc = (s) => String(s ?? "").replace(/\|/g, "\\|");
const list = (arr) => (arr?.length ? arr.join(", ") : "—");

export function buildMarkdownReport({ items, queue, meta }) {
  const s = summarize(items);
  const L = [];
  L.push(`# YouTube → Website Pipeline — ${meta.reportDate}`);
  L.push("");
  if (meta.fixtureData) L.push("> ⚠️ **FIXTURE RUN.** Synthetic videos against the real site. Do not act on it.\n");
  L.push("Report-only. Nothing here is published, committed, or handed to the Publisher. The handoff queue is a **dry run**.");
  L.push("");
  L.push("## Summary");
  L.push("");
  L.push("| | |");
  L.push("|---|---|");
  L.push(`| Videos analyzed | ${s.videosAnalyzed} |`);
  L.push(`| New-article candidates | ${s.newArticleCandidates} |`);
  L.push(`| Update candidates | ${s.updateCandidates} |`);
  L.push(`| Embed-only candidates | ${s.embedOnlyCandidates} |`);
  L.push(`| Duplicates | ${s.duplicates} |`);
  L.push(`| Monitor only | ${s.monitorOnly} |`);
  L.push(`| Blocked (named blockers) | ${s.blocked} |`);
  L.push(`| Transcript required | ${s.transcriptRequired} |`);
  L.push(`| Ready for Publisher | ${s.readyForPublisher} |`);
  L.push(`| Claims needing verification | ${s.verificationRequired} |`);
  L.push("");
  L.push(`Inputs: manifest \`${meta.inputs.manifest}\` (${meta.inputs.manifestVideos} listed, ${meta.inputs.approved} approved) · ${meta.inputs.sitePages} published pages · Publisher trailers: ${meta.inputs.publisherStatus} · history: ${meta.inputs.historyReports} earlier report(s)`);
  if (meta.inputs.manifestProblems?.length) L.push(`\nManifest problems: ${meta.inputs.manifestProblems.join("; ")}`);
  L.push("");

  for (const i of items) {
    L.push(`## ${i.id} · ${esc(i.video.title)}`);
    L.push("");
    L.push(`| | |`);
    L.push(`|---|---|`);
    L.push(`| Video | [${i.video.youtubeId}](${i.video.urls?.watch}) · ${i.video.durationSeconds ? `${Math.floor(i.video.durationSeconds / 60)}:${String(i.video.durationSeconds % 60).padStart(2, "0")}` : "duration unknown"} · uploaded ${i.video.uploadDate ?? "**unknown**"} |`);
    L.push(`| Transcript | ${i.transcript.status}${i.transcript.status === "OK" ? ` · ${i.transcript.words} words · ${i.transcript.verified ? "verified" : "**unverified**"}${i.transcript.timestamps === false ? " · no timestamps" : ""}${i.transcript.corrections?.length ? ` · name corrections: ${i.transcript.corrections.map((c) => `${c.heard}→${c.corrected} ×${c.count}`).join(", ")}` : ""}` : ""} · ${esc(i.transcript.reason)} |`);
    L.push(`| Action | **${i.action}**${i.provisional ? " (provisional)" : ""} |`);
    L.push(`| Target route | ${i.target ?? "—"}${i.proposed ? ` · proposed **${i.proposed.route}**` : ""}${i.parent ? ` · parent ${i.parent}` : ""} |`);
    L.push(`| Overlap | ${i.overlap.verdict}${i.overlap.best ? ` — ${i.overlap.best.route} (${i.overlap.best.overlap})` : ""} · distinct question: ${i.overlap.distinctQuestion ? "yes" : `no (${list(i.overlap.committedBy)})`} |`);
    L.push(`| Confidence | **${i.confidence.level.toUpperCase()}** — ${esc(i.confidence.reasons.join("; ") || "all HIGH conditions met")} |`);
    L.push(`| Fair Housing | ${i.fairHousing.status} — ${esc(i.fairHousing.reason)} |`);
    L.push(`| Lifecycle | ${i.lifecycle} · fingerprint \`${i.fingerprint}\` |`);
    L.push(`| Handoff | ${i.handoff.eligible ? "eligible (dry-run queue)" : `not eligible — ${esc(i.handoff.reasons.join("; "))}`} |`);
    L.push("");
    L.push("**Why this action**");
    L.push("");
    for (const r of i.classificationReasons) L.push(`- ${r}`);
    L.push("");
    L.push("**Existing-content overlap (top matches)**");
    L.push("");
    L.push("| Route | Relation | Overlap | Title sim. | Embeds video | Missing facets |");
    L.push("|---|---|---|---|---|---|");
    for (const m of i.overlap.topMatches.slice(0, 5)) L.push(`| ${m.route} | ${m.label} | ${m.overlap} | ${m.titleSimilarity} | ${m.embedsVideo ? "yes" : ""} | ${list(m.missingFacets)} |`);
    L.push("");
    if (i.transcript.status === "OK") {
      const c = i.claimsSummary.counts;
      L.push(`**Transcript reading:** ${c.fact} factual · ${c.opinion} Mikey opinion/experience · ${c.unclear} unclear/sweeping · ${c.narrative} narrative. Decaying subjects: ${Object.entries(i.claimsSummary.familyCounts).map(([k, v]) => `${k} ${v}`).join(", ") || "none"}.`);
      L.push("");
    }

    const d = i.draft;
    if (d?.headlines) {
      L.push("**Proposed article**");
      L.push("");
      L.push(`- Title / H1: ${esc(d.headlines.title)}`);
      L.push(`- Route: \`${i.proposed.route}\` (${i.proposed.source})`);
      L.push(`- Meta title: ${esc(d.headlines.metaTitle)}`);
      L.push(`- Meta description: ${esc(d.headlines.metaDescription ?? "—")} _(${d.headlines.metaDescriptionSource ?? "none"})_`);
      L.push(`- Dek: ${esc(d.headlines.dek ?? "—")}`);
      L.push("");
    }
    if (d?.sections?.length) {
      L.push(`**${d.kind === "update" ? `Sections to add (insert after "${d.insertAfter}")` : "Section outline"}** — body drafts are in the package; every line is Mikey's own words`);
      L.push("");
      for (const sec of d.sections) L.push(`${sec.order}. ${esc(sec.heading)} _(${sec.timeRange}; ${sec.factsToVerify.length} to verify${sec.fairHousingRemoved.length ? `; ${sec.fairHousingRemoved.length} FH removed` : ""})_`);
      L.push("");
    }
    if (d?.embed) {
      L.push(`**Embed:** ${esc(d.embed.placement)}${d.embed.component ? ` — ${esc(d.embed.component)}` : ""}`);
      L.push("");
    }
    if (d?.faq?.length) {
      L.push(`**FAQ candidates** (${d.faqSchema?.recommend ? `FAQPage schema: yes, ${d.faqSchema.condition}` : `FAQPage schema: no — ${d.faqSchema?.reason ?? "n/a"}`})`);
      L.push("");
      for (const f of d.faq) L.push(`- [${f.status}] ${f.timecode ?? ""} ${esc(f.question)}`);
      L.push("");
    }
    if (d?.internalLinks?.outbound?.length) {
      L.push("**Internal-link suggestions** (not applied)");
      L.push("");
      for (const l of d.internalLinks.outbound) L.push(`- → ${l.route} (${l.relation}) — "${esc(l.anchorSuggestion ?? "anchor blocked")}" · ${esc(l.placement)}`);
      for (const l of d.internalLinks.inbound) L.push(`- ← from ${l.from}: ${esc(l.reason)}`);
      L.push("");
    }
    if (i.images) {
      L.push(`**Images:** hero ${i.images.hero.path ? `\`${i.images.hero.path}\`` : "none"} — ${esc(i.images.hero.why)}. Poster: ${i.images.poster.path ?? "none"}. Photo library ${i.images.photoLibrary.reachable ? `reachable (${i.images.photoLibrary.candidates.length} filename matches)` : "not reachable from this run"}.`);
      L.push("");
    }
    L.push("**Schema (StoryMeta.video → VideoObject)**");
    L.push("");
    if (i.schema.blocked.length) for (const b of i.schema.blocked) L.push(`- BLOCKED \`${b.field}\`: ${esc(b.reason)}`);
    else L.push(`- valid${i.schema.validation.warnings.length ? ` (${i.schema.validation.warnings.join("; ")})` : ""}`);
    if (i.schema.conflicts?.length) for (const c of i.schema.conflicts) L.push(`- CONFLICT \`${c.field}\`: manifest ${c.manifest} vs site ${c.site}`);
    L.push("");
    if (i.checklist.length) {
      L.push(`**Verification checklist** (${i.checklist.length}; the transcript alone is sufficient for none of them)`);
      L.push("");
      L.push("| At | Claim | Why | Check against |");
      L.push("|---|---|---|---|");
      for (const c of i.checklist) L.push(`| ${c.timecode ?? ""} | ${esc(c.claim)} | ${esc(c.reason)} | ${esc(c.preferredSourceType)} |`);
      L.push("");
    }
    if (i.transcriptFairHousingFlags.length) {
      L.push("**Spoken lines that must not be carried into copy (Fair Housing)**");
      L.push("");
      for (const f of i.transcriptFairHousingFlags) L.push(`- ${f.timecode ?? ""} [${f.category}] "${esc(f.sentence)}"`);
      L.push("");
    }
  }

  L.push("## Dry-run handoff queue");
  L.push("");
  L.push(`Mode: **${queue.mode}** — ${queue.modeReason}. Max ${queue.maxPerRun} per run.`);
  L.push("");
  if (queue.queue.length) for (const q of queue.queue) L.push(`${q.order}. ${q.id} · ${q.action} · ${q.proposedRoute ?? q.targetRoute} · ${q.confidence} · \`${q.packagePath}\``);
  else L.push("Nothing eligible this run.");
  L.push("");
  if (meta.unlisted?.length) {
    L.push("## Site videos not in the manifest (not processed)");
    L.push("");
    for (const v of meta.unlisted) L.push(`- ${v.youtubeId} — ${esc(v.title ?? "untitled")}${v.embeddedOn.length ? ` · on ${v.embeddedOn.join(", ")}` : ""}${v.onHomepage ? " · homepage" : ""}`);
    L.push("");
  }
  L.push("---");
  L.push(`This pipeline never: ${PROHIBITED_ACTIONS.join("; ")}.`);
  return L.join("\n");
}

export function summaryLines(items, queue) {
  const s = summarize(items);
  const lines = [
    `  Analyzed ${s.videosAnalyzed} video(s): ${s.newArticleCandidates} new · ${s.updateCandidates} update · ${s.embedOnlyCandidates} embed-only · ${s.duplicates} duplicate · ${s.monitorOnly} monitor`,
    `  Transcript required: ${s.transcriptRequired} · verification items: ${s.verificationRequired} · ready for Publisher: ${s.readyForPublisher}`,
    `  Queue (${queue.mode}): ${queue.queue.length} item(s)`,
  ];
  for (const i of items) lines.push(`    ${i.id} ${i.video.youtubeId} → ${i.action}${i.proposed ? ` ${i.proposed.route}` : i.target ? ` ${i.target}` : ""} [${i.confidence.level}] ${i.lifecycle}`);
  return lines;
}
