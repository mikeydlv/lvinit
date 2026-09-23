// ---------------------------------------------------------------------------
// REPORTS — Markdown for Mikey, JSON for machines
//
//   reports/development-watch/development-watch-YYYY-MM-DD.md
//   reports/development-watch/development-watch-YYYY-MM-DD.json
//   reports/development-watch/handoff-queue.json         (dry-run in v1)
//   reports/development-watch/local-development-signals.json
//   reports/development-watch/weekly.md                  (Mondays)
//
// Strong filtering is the point: a normal day is a few lines, and "0
// meaningful changes today" is a complete, correct report.
// ---------------------------------------------------------------------------

import { isHighPriority, isMonitor } from "./analyze.mjs";

const fmt = (n) => (n === null || n === undefined ? "—" : Number(n).toLocaleString("en-US"));

function countBy(list, key) {
  const m = new Map();
  for (const x of list) m.set(key(x), (m.get(key(x)) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function coverageLine(ev) {
  if (!ev.coverage.length) return "none";
  return ev.coverage.map((c) => `${c.route} (${c.kind}${c.publishedStatus ? `, published as "${c.publishedStatus}"` : ""})`).join("; ");
}

function sourcesBlock(ev) {
  return ev.sources
    .slice(0, 6)
    .map((s) => `  - ${s.authorityClass === "primary" ? "**PRIMARY** " : ""}${s.name} (authority ${s.authority} — ${s.authorityLabel})${s.published ? `, ${s.published.slice(0, 10)}` : ""}: ${s.url}${s.evidence ? `\n    > ${s.evidence}` : ""}`)
    .join("\n");
}

function eventBlock(ev) {
  return [
    `### ${ev.id} — ${ev.entityName}`,
    "",
    `- **Stable ID / fingerprint:** ${ev.id} · \`${ev.fingerprint}\` · project \`${ev.entityId}\`${ev.provisional ? " (provisional)" : ""}`,
    `- **Geography:** ${ev.areaLabel}${ev.jurisdiction ? ` · ${ev.jurisdiction}` : ""}`,
    `- **Change detected:** ${ev.changeClass} — ${ev.changes.map((c) => c.detail).join("; ")}`,
    `- **Prior status:** ${ev.priorStatus ?? "none on record"}${ev.priorFrom ? ` (from ${ev.priorFrom})` : ""}`,
    `- **Current status:** ${ev.status}`,
    `- **Date:** ${ev.date}`,
    `- **Scale:** ${ev.units ? `${fmt(ev.units)} homes/units (as reported)` : "units not stated"}${ev.acres ? ` · ${fmt(ev.acres)} acres` : ""}${ev.targetYear ? ` · target: ${ev.targetText}` : ""}`,
    `- **Confidence:** ${ev.confidence} — ${ev.confidenceReasons.join("; ")}`,
    `- **LVINIT relevance:** ${ev.score}/100 (${Object.entries(ev.scoreComponents).map(([k, v]) => `${k} ${v}`).join(", ")})`,
    `- **Existing LVINIT coverage:** ${coverageLine(ev)}`,
    `- **Recommended action:** ${ev.action}${ev.target ? ` → ${ev.target}` : ""} — ${ev.actionRationale}`,
    `- **Handoff:** ${ev.handoff.eligible ? "WOULD hand off (dry-run)" : `not eligible — ${ev.handoff.reasons.join("; ")}`}`,
    "",
    `**Detected:** ${ev.detected}`,
    "",
    `**Verified:** ${ev.verified.replace(/\n/g, "\n  ")}`,
    "",
    `**Interpretation (not fact):** ${ev.interpretation}`,
    "",
    `**Recommendation:** ${ev.recommendation ?? "—"}`,
    ...(ev.fairHousing.sensitiveSubject ? ["", `**Fair Housing:** the project's own framing touches a protected class (${ev.fairHousing.subjectHits.map((h) => `${h.category}: "${h.matched}"`).join(", ")}). Report objectively; human review before any content.`] : []),
    "",
    "**Sources:**",
    sourcesBlock(ev),
    "",
  ].join("\n");
}

export function buildDailyMarkdown(run) {
  const { today, fixture, events, triage, health, queue, signals, suppressedAgenda } = run;
  const high = events.filter(isHighPriority);
  const monitor = events.filter(isMonitor);
  const conflicts = events.filter((e) => e.changeClass === "CONFLICT" && ["NEW", "PERSISTING", "UPDATED"].includes(e.lifecycle));
  const newEvents = events.filter((e) => e.lifecycle === "NEW" && e.changeClass === "NEW");
  const material = events.filter((e) => ["NEW", "UPDATED"].includes(e.lifecycle) && e.changeClass === "MATERIAL_UPDATE");
  const dupes = events.filter((e) => e.changeClass === "DUPLICATE" || e.lifecycle === "PERSISTING" || e.lifecycle === "DUPLICATE");
  const rejectedEvents = events.filter((e) => e.action === "REJECT_LOW_VALUE");
  const checked = health.filter((h) => !h.skipped && !h.manual);
  const failed = checked.filter((h) => !h.ok);
  const manual = health.filter((h) => h.manual);
  const meaningful = high.length;

  const L = [];
  L.push(`# LVINIT Development Watch — ${today}`);
  L.push("");
  if (fixture) L.push("> **FIXTURE RUN** — synthetic items, nothing here is real.\n");
  L.push("Report only. Nothing was published, edited, committed to the site, or sent to the Publisher. Every fact must be re-verified at its source before it is used.");
  L.push("");
  L.push("## Executive summary");
  L.push("");
  L.push(`**${meaningful === 0 ? "0 meaningful changes today." : `${meaningful} meaningful change${meaningful === 1 ? "" : "s"} today.`}**`);
  L.push("");
  L.push(`- Sources checked: ${checked.length - failed.length} of ${checked.length} automated sources succeeded${failed.length ? ` · **${failed.length} failed**` : ""} · ${manual.length} manual-only (SOURCE_CHECK_REQUIRED) · ${health.filter((h) => h.skipped).length} not due (weekly cadence)`);
  L.push(`- Items read: ${fmt(triage.total)} · already processed, unchanged: ${fmt(triage.unchanged)} · older than ${run.maxAgeDays} days: ${fmt(triage.stale)} · passed the development gate: ${fmt(triage.passing)}`);
  L.push(`- New projects: ${newEvents.length} · material updates: ${material.length} · duplicates / unchanged ignored: ${dupes.length} · monitor-only: ${monitor.length} · source conflicts: ${conflicts.length}`);
  L.push(`- Noise suppressed at the gate: ${fmt(triage.rejected.length)}${triage.rejected.length ? ` (${countBy(triage.rejected, (r) => r.reason).slice(0, 4).map(([r, n]) => `${n} ${r}`).join(", ")})` : ""} · routine agenda items suppressed: ${fmt(suppressedAgenda.length)} · low-value events rejected: ${rejectedEvents.length}`);
  L.push(`- Publisher handoff candidates: ${queue.queue.length} (**${queue.mode}** — handoff is disabled in v1)`);
  L.push("");

  L.push("## High-priority changes");
  L.push("");
  if (!high.length) L.push("None. No verified, meaningful development change cleared the bar today. That is a real answer, not a gap.\n");
  for (const ev of high) L.push(eventBlock(ev));

  L.push("## What would be handed to the Publisher (dry-run)");
  L.push("");
  if (!queue.queue.length) L.push("Nothing qualifies. Handoff needs: score ≥ 70, High confidence, a primary source, a new or material change, no conflict, a clear Publisher action, clean Fair Housing, and not promotional-only.\n");
  for (const q of queue.queue) L.push(`${q.order}. ${q.id} — ${q.entityName}: ${q.action}${q.targetRoute ? ` → ${q.targetRoute}` : ""} (score ${q.score}, ${q.confidence}). Primary: ${q.primarySources.map((s) => s.url).join(", ")}`);
  if (queue.queue.length) L.push("");

  L.push("## Monitor list");
  L.push("");
  if (!monitor.length) L.push("Nothing new to watch.\n");
  for (const ev of monitor.slice(0, 12)) {
    L.push(`- **${ev.id}** ${ev.entityName} — ${ev.areaLabel} · ${ev.status} · ${ev.score}/100 · ${ev.confidence} (${ev.confidenceReasons[0] ?? ""}). ${ev.sources[0]?.name}: ${ev.sources[0]?.url}`);
  }
  if (monitor.length > 12) L.push(`- …and ${monitor.length - 12} more in the JSON report.`);
  L.push("");

  L.push("## Source conflicts");
  L.push("");
  if (!conflicts.length) L.push("None.\n");
  for (const ev of conflicts) {
    L.push(`- **${ev.id}** ${ev.entityName}: ${ev.conflicts.map((c) => c.detail).join("; ")} → ${ev.action}`);
    for (const c of ev.conflicts) for (const s of c.sides) L.push(`  - ${s.source ?? "?"}: ${s.status ?? (s.units ? `${fmt(s.units)} units` : "")}${s.url ? ` — ${s.url}` : ""}${s.evidence ? `\n    > ${s.evidence}` : ""}`);
  }
  if (conflicts.length) L.push("");

  L.push("## Suppressed as duplicate or noise");
  L.push("");
  const dupLines = dupes.filter((e) => e.lifecycle !== "PERSISTING");
  if (dupLines.length) {
    L.push("Already known, no change:");
    for (const ev of dupLines.slice(0, 10)) L.push(`- ${ev.entityName} — ${ev.changes.map((c) => c.detail).join("; ")} (${ev.sources.length} source${ev.sources.length === 1 ? "" : "s"})`);
    L.push("");
  }
  const persisting = events.filter((e) => e.lifecycle === "PERSISTING");
  if (persisting.length) L.push(`Persisting from earlier runs, unchanged, not re-surfaced: ${persisting.map((e) => e.id).join(", ")}\n`);
  if (rejectedEvents.length) {
    L.push("Low-value events:");
    for (const ev of rejectedEvents.slice(0, 8)) L.push(`- ${ev.entityName} — ${ev.actionRationale}`);
    L.push("");
  }
  L.push(`Gate noise by reason: ${countBy(triage.rejected, (r) => r.reason).map(([r, n]) => `${r} (${n})`).join(" · ") || "none"}`);
  L.push("");

  L.push("## Source health");
  L.push("");
  L.push("| Source | Authority | Method | Result | Last success |");
  L.push("|---|---|---|---|---|");
  for (const h of health) {
    const result = h.manual ? "SOURCE_CHECK_REQUIRED (not automated)" : h.skipped ? `not due — ${h.skipped}` : h.ok ? `ok${h.status === 304 ? " (not modified)" : ""} · ${fmt(h.items)} items${h.note ? ` · ${h.note}` : ""}` : `**FAILED** — ${h.error ?? h.status} → SOURCE_CHECK_REQUIRED`;
    L.push(`| ${h.name} | ${h.authority ?? "—"} | ${h.method ?? "—"} | ${result.replace(/\|/g, "/")} | ${run.lastSuccess?.[h.id] ?? (h.ok ? today : "never")} |`);
  }
  L.push("");
  const alerts = health.filter((h) => (run.consecutiveFailures?.[h.id] ?? 0) >= run.failureAlertAfter);
  if (alerts.length) L.push(`**Failing ${run.failureAlertAfter}+ runs in a row:** ${alerts.map((h) => h.name).join(", ")}\n`);

  L.push("## LOCAL_DEVELOPMENT_SIGNAL (for the Content Brief Generator)");
  L.push("");
  L.push(signals.length ? `${signals.length} signal(s) written to local-development-signals.json. Editorial intelligence — not search demand.` : "No signals today.");
  L.push("");
  return L.join("\n");
}

export function buildDailyJson(run) {
  return {
    schema_version: 1,
    agent: "development-watch",
    date: run.today,
    fixture: run.fixture,
    summary: {
      meaningfulChanges: run.events.filter(isHighPriority).length,
      sourcesChecked: run.health.filter((h) => !h.skipped && !h.manual).length,
      sourcesFailed: run.health.filter((h) => !h.skipped && !h.manual && !h.ok).map((h) => h.id),
      sourcesManual: run.health.filter((h) => h.manual).map((h) => h.id),
      itemsRead: run.triage.total,
      itemsUnchanged: run.triage.unchanged,
      itemsPassedGate: run.triage.passing,
      noiseSuppressed: run.triage.rejected.length,
      agendaItemsSuppressed: run.suppressedAgenda.length,
      newEvents: run.events.filter((e) => e.lifecycle === "NEW" && e.changeClass === "NEW").length,
      materialUpdates: run.events.filter((e) => ["NEW", "UPDATED"].includes(e.lifecycle) && e.changeClass === "MATERIAL_UPDATE").length,
      duplicatesIgnored: run.events.filter((e) => e.changeClass === "DUPLICATE" || ["PERSISTING", "DUPLICATE"].includes(e.lifecycle)).length,
      monitorOnly: run.events.filter(isMonitor).length,
      conflicts: run.events.filter((e) => e.changeClass === "CONFLICT").length,
      handoffCandidates: run.queue.queue.length,
      handoffMode: run.queue.mode,
    },
    events: run.events.map(({ sources, ...e }) => ({ ...e, sources: sources.map(({ itemId, ...s }) => s) })),
    noise: run.triage.rejected.map((r) => ({ title: r.title, url: r.url, source: r.sourceName, reason: r.reason })),
    suppressedAgenda: run.suppressedAgenda,
    health: run.health,
  };
}

export function buildWeeklyMarkdown({ today, dailies }) {
  const events = new Map();
  let noise = 0;
  let agenda = 0;
  let unchanged = 0;
  for (const d of dailies) {
    noise += d.summary?.noiseSuppressed ?? 0;
    agenda += d.summary?.agendaItemsSuppressed ?? 0;
    unchanged += d.summary?.itemsUnchanged ?? 0;
    for (const e of d.events ?? []) events.set(e.fingerprint, e);
  }
  const all = [...events.values()];
  const meaningful = all.filter(isHighPriority);
  const monitor = all.filter(isMonitor);
  const dupes = all.filter((e) => e.changeClass === "DUPLICATE" || ["PERSISTING", "DUPLICATE"].includes(e.lifecycle));
  const conflicts = all.filter((e) => e.changeClass === "CONFLICT");
  const L = [`# LVINIT Development Watch — week ending ${today}`, "", `_${dailies.length} daily report(s)._`, ""];
  L.push(`- **${meaningful.length} meaningful change${meaningful.length === 1 ? "" : "s"}**`);
  L.push(`- ${monitor.length} monitor item${monitor.length === 1 ? "" : "s"}`);
  L.push(`- ${conflicts.length} source conflict${conflicts.length === 1 ? "" : "s"}`);
  L.push(`- ${dupes.length + noise + agenda} duplicate/noise items suppressed (${dupes.length} duplicate events, ${noise} gate noise, ${agenda} routine agenda items) · ${unchanged} unchanged documents skipped`);
  L.push("");
  if (meaningful.length) {
    L.push("## Meaningful changes");
    for (const e of meaningful.sort((a, b) => b.score - a.score)) L.push(`- **${e.id}** ${e.entityName} — ${e.changes.map((c) => c.detail).join("; ")} · ${e.score}/100 · ${e.confidence} · ${e.action}${e.target ? ` → ${e.target}` : ""}`);
    L.push("");
  }
  if (monitor.length) {
    L.push("## Monitor");
    for (const e of monitor.slice(0, 10)) L.push(`- ${e.id} ${e.entityName} — ${e.status} · ${e.confidence}`);
    L.push("");
  }
  if (conflicts.length) {
    L.push("## Conflicts");
    for (const e of conflicts) L.push(`- ${e.id} ${e.entityName}: ${e.conflicts.map((c) => c.detail).join("; ")}`);
    L.push("");
  }
  return L.join("\n");
}
