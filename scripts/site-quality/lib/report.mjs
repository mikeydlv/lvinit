// ---------------------------------------------------------------------------
// REPORTS — Markdown for Mikey, JSON for machines and next week's run
//
// The Markdown is built to be read in two minutes: the summary table, then only
// the urgent items, then what the agent fixed (or would fix), then what needs a
// person. Grouped findings print once with their affected routes; unchanged
// LOW/INFO items collapse to one line.
// ---------------------------------------------------------------------------

import { NEVER_AUTO_FIX, SEVERITY_RANK } from "./catalog.mjs";

export const SCHEMA_VERSION = "1.0.0";

const routesLine = (f, max) => {
  if (!f.routes.length) return f.sources[0] ? `\`${f.sources[0].file}${f.sources[0].line ? `:${f.sources[0].line}` : ""}\`` : "site-wide";
  const shown = f.routes.slice(0, max).map((r) => `\`${r}\``).join(", ");
  return f.routes.length > max ? `${shown} and ${f.routes.length - max} more` : shown;
};

const srcLine = (f) =>
  f.sources.length
    ? f.sources
        .slice(0, 4)
        .map((s) => `\`${s.file}${s.line ? `:${s.line}` : ""}\``)
        .join(", ")
    : null;

function searchNote(f) {
  if (!f.search?.impressions) return null;
  return `${f.search.impressions} impressions / ${f.search.clicks} clicks on \`${f.search.route}\` in the newest GSC report${f.search.searchVisible ? " — **search-visible page, do this first**" : ""}`;
}

function findingBlock(f, config) {
  const lines = [];
  lines.push(`### ${f.id} · ${f.severity} · ${f.title}`);
  lines.push("");
  lines.push(`- **Status:** ${f.status}${f.reopened ? " (reopened)" : ""}${f.severityChanged ? ` (was ${f.priorSeverity})` : ""} · first seen ${f.firstSeen}`);
  lines.push(`- **Where:** ${routesLine(f, config.output.maxRoutesListed)}${f.grouped && f.routes.length > 1 ? ` — one root cause, ${f.routes.length} pages` : ""}`);
  const src = srcLine(f);
  if (src) lines.push(`- **Source:** ${src}`);
  lines.push(`- **What:** ${f.detail}`);
  if (f.grouped && Array.isArray(f.evidence)) {
    const variants = [
      ...new Set(f.evidence.filter((e) => e.href !== undefined).map((e) => (e.text ? `"${e.text}" → ${e.href || "(empty)"}` : e.href))),
    ];
    if (variants.length > 1) lines.push(`- **Variants:** ${variants.slice(0, 10).map((v) => `\`${v}\``).join(", ")}`);
  }
  if (f.severityBasis !== "base severity for this issue type") lines.push(`- **Severity basis:** ${f.severityBasis}`);
  const sn = searchNote(f);
  if (sn) lines.push(`- **Search:** ${sn}`);
  if (f.disposition === "REVIEW_REQUIRED") {
    lines.push(`- **Why automation stopped:** ${f.reviewReason}`);
    lines.push(`- **Recommended owner:** ${f.owner}`);
  }
  if (f.reappearedAfterAutoFix) lines.push(`- **Note:** this agent fixed it on ${f.reappearedAfterAutoFix.date} and it came back; it will not be re-applied.`);
  lines.push(`- **Fingerprint:** \`${f.fingerprint}\` (add to \`decisions.ignored\` to silence)`);
  lines.push("");
  return lines.join("\n");
}

function fixBlock(f, execution) {
  const lines = [];
  lines.push(`### ${f.id} · ${f.title}`);
  lines.push("");
  lines.push(`- **Where:** ${f.route ? `\`${f.route}\`` : f.routes.map((r) => `\`${r}\``).join(", ") || "site-wide"}`);
  lines.push(`- **Issue:** ${f.detail}`);
  lines.push("- **Exact fix:**");
  for (const e of f.fix.edits) {
    if (e.kind === "replace") lines.push(`  - \`${e.file}:${e.line}\` ${e.before} → ${e.after}`);
    if (e.kind === "insert") lines.push(`  - \`${e.file}\` insert after line ${e.afterLine}:\n\n    \`\`\`ts\n${e.lines.map((l) => `    ${l}`).join("\n")}\n    \`\`\``);
    if (e.kind === "remove") lines.push(`  - \`${e.file}\` remove lines ${e.startLine}-${e.startLine + e.lines.length - 1}`);
  }
  lines.push("- **Why it was deterministic:**");
  for (const g of f.fix.gates) lines.push(`  - ${g.status === "pass" ? "✅" : g.status === "pending" ? "⏳" : "❌"} ${g.label} — ${g.note}`);
  if (execution?.attempted) {
    const cleared = execution.reaudit?.cleared?.find((c) => c.fingerprint === f.fingerprint);
    lines.push(
      `- **Validation:** ${execution.validation?.ok ? "tests, typecheck, lint and build passed" : execution.validation ? "FAILED" : "not reached"}; ` +
        `re-audit ${cleared ? (cleared.cleared ? "confirmed it cleared" : "did NOT clear it") : "not reached"}${execution.reaudit && execution.reaudit.introduced.length ? `, and ${execution.reaudit.introduced.length} new finding(s) appeared` : ""}`
    );
  }
  if (f.status === "AUTO_FIXED") lines.push(`- **Commit:** ${execution?.commitHash ?? "?"}`);
  lines.push("");
  return lines.join("\n");
}

export function buildMarkdownReport(r, config) {
  const L = [];
  const { summary } = r;
  L.push(`# LVINIT Site Quality — ${r.reportDate}`);
  L.push("");
  if (r.fixtureData) {
    L.push("> **FIXTURE DATA.** This report was generated from the synthetic fixture site, not LVINIT. Nothing in it describes the real website.");
    L.push("");
  }
  L.push(
    `Mode: **${r.mode}**${r.mode === "report" ? " (audit only — nothing was edited)" : r.mode === "trial" ? " (fixes applied, validated, then reverted — nothing kept)" : ""}. ` +
      `Site health **${summary.siteHealth}/100**.`
  );
  L.push("");

  L.push("## Summary");
  L.push("");
  L.push("| | |");
  L.push("|---|---|");
  const rows = [
    ["Pages audited (rendered)", summary.pagesAudited],
    ["Routes in source", summary.routesChecked],
    ["Sitemap entries", summary.sitemapEntries],
    ["Metadata checks", summary.metadataChecks],
    ["JSON-LD blocks checked", summary.schemaChecks],
    ["Images checked (rendered + source literals)", `${summary.imagesChecked} + ${summary.imageSourceLiterals}`],
    ["Links checked", summary.linksChecked],
    ["Critical / High / Medium / Low / Info", `${summary.counts.CRITICAL} / ${summary.counts.HIGH} / ${summary.counts.MEDIUM} / ${summary.counts.LOW} / ${summary.counts.INFO}`],
    ["Auto-fixed", summary.autoFixed],
    ["Auto-fix candidates", summary.autoFixCandidates],
    ["Review required", summary.reviewRequired],
    ["Resolved since last report", summary.resolved],
    ["Ignored by decision", summary.ignored],
    ["Site health score", `${summary.siteHealth}/100`],
    ["Build / test status", summary.buildStatus],
    ["History", `${summary.historyReports ?? 0} earlier report(s); ledger ${summary.ledger ?? "none yet"}`],
    ["GSC prioritization", r.gsc.available ? `used — ${r.gsc.reason}` : `not used — ${r.gsc.reason}`],
  ];
  for (const [k, v] of rows) L.push(`| ${k} | ${v} |`);
  L.push("");

  const open = r.findings.filter((f) => f.status !== "IGNORED");
  const urgent = open.filter((f) => SEVERITY_RANK[f.severity] >= SEVERITY_RANK.HIGH);
  L.push("## Critical / High");
  L.push("");
  if (!urgent.length) L.push("None. Nothing urgent this run.\n");
  for (const f of urgent) L.push(findingBlock(f, config));

  const fixed = open.filter((f) => f.status === "AUTO_FIXED");
  const candidates = open.filter((f) => f.disposition === "AUTO_FIX_CANDIDATE" && f.status !== "AUTO_FIXED");
  L.push("## Auto-fixed");
  L.push("");
  if (!fixed.length) {
    L.push(r.mode === "apply" ? "Nothing was auto-fixed this run." : "Nothing — auto-fix is not enabled in this mode (v1 ships report + trial only).");
    L.push("");
  }
  for (const f of fixed) L.push(fixBlock(f, r.execution));
  if (candidates.length) {
    L.push(`### Would auto-fix (${candidates.length})`);
    L.push("");
    if (r.execution?.attempted) {
      L.push(
        `Trial result: ${r.execution.stoppedBecause ? `stopped — ${r.execution.stoppedBecause}` : "applied, validated, re-audited clean, and reverted"}.`
      );
      L.push("");
    }
    for (const f of candidates) L.push(fixBlock(f, r.execution));
  }

  const review = open.filter((f) => f.disposition === "REVIEW_REQUIRED" && SEVERITY_RANK[f.severity] < SEVERITY_RANK.HIGH && f.shownInFull);
  L.push("## Review required");
  L.push("");
  if (!review.length) L.push("Nothing beyond the items above.\n");
  const byOwner = new Map();
  for (const f of review) byOwner.set(f.owner, [...(byOwner.get(f.owner) ?? []), f]);
  for (const [owner, list] of byOwner) {
    L.push(`**Owner: ${owner}**`);
    L.push("");
    for (const f of list) L.push(findingBlock(f, config));
  }

  const observe = open.filter((f) => f.disposition === "OBSERVE" && f.shownInFull);
  if (observe.length) {
    L.push("## Low / informational");
    L.push("");
    for (const f of observe) L.push(`- ${f.id} · ${f.severity} · ${f.title} — ${routesLine(f, 4)}. ${f.detail} (\`${f.fingerprint}\`)`);
    L.push("");
  }

  const quiet = open.filter((f) => !f.shownInFull);
  if (quiet.length) {
    L.push("## Still open (not repeated)");
    L.push("");
    for (const f of quiet) L.push(`- ${f.id} · ${f.severity} · ${f.title} — ${routesLine(f, 3)} (since ${f.firstSeen})`);
    L.push("");
  }

  L.push("## Resolved");
  L.push("");
  if (!r.resolved.length) L.push("Nothing resolved since the last report.\n");
  for (const f of r.resolved) L.push(`- ${f.id} · ${f.severity} · ${f.title} — ${f.route ?? (f.routes ?? []).join(", ")} (open ${f.firstSeen} → resolved ${f.resolvedOn ?? r.reportDate}; ${f.resolution ?? "no longer detected"})`);
  if (r.resolved.length) L.push("");

  if (r.publisherHandoffs.length) {
    L.push("## Publisher handoffs (not dispatched)");
    L.push("");
    L.push("Written up for the Content Publisher. v1 never dispatches the Publisher on its own.");
    L.push("");
    for (const h of r.publisherHandoffs) L.push(`- ${h.id} · \`${h.route ?? "site"}\` — ${h.need}`);
    L.push("");
  }

  const worst = r.health.pages.filter((p) => p.score < 100).slice(0, 10);
  L.push("## Page health");
  L.push("");
  L.push(`Site ${r.health.site}/100. Deductions per open finding: CRITICAL ${r.health.weights.CRITICAL}, HIGH ${r.health.weights.HIGH}, MEDIUM ${r.health.weights.MEDIUM}, LOW ${r.health.weights.LOW}, INFO 0 (a shared root cause costs the site once).`);
  L.push("");
  if (!worst.length) L.push("Every audited page scores 100.\n");
  else {
    L.push("| Page | Score |");
    L.push("|---|---|");
    for (const p of worst) L.push(`| \`${p.route}\` | ${p.score} |`);
    L.push(`\n${r.health.pages.filter((p) => p.score === 100).length} other page(s) score 100.\n`);
  }

  L.push("## Source / system health");
  L.push("");
  for (const s of r.system) L.push(`- ${s.ok ? "✅" : "⚠️"} **${s.check}** — ${s.note}`);
  L.push("");

  if (r.validation?.length) {
    L.push("## Validation");
    L.push("");
    for (const v of r.validation) L.push(`- ${v.ok ? "✅" : "❌"} ${v.label} (\`${v.command}\`)${v.ok ? "" : ` — exit ${v.code}\n\n\`\`\`\n${v.tail}\n\`\`\``}`);
    L.push("");
  }
  if (r.execution?.diff?.patch) {
    L.push("<details><summary>Trial diff (reverted)</summary>\n\n```diff\n" + r.execution.diff.patch + "\n```\n</details>\n");
  }

  L.push("## What this agent will never do");
  L.push("");
  for (const n of NEVER_AUTO_FIX) L.push(`- ${n}`);
  L.push("");
  return L.join("\n");
}

export function buildJsonReport(r) {
  return {
    schemaVersion: SCHEMA_VERSION,
    agent: "lvinit-site-quality",
    reportDate: r.reportDate,
    generatedAt: r.generatedAt,
    mode: r.mode,
    fixtureData: Boolean(r.fixtureData),
    summary: r.summary,
    gsc: r.gsc,
    health: r.health,
    system: r.system,
    stats: r.stats,
    validation: r.validation ?? [],
    execution: r.execution
      ? { ...r.execution, diff: r.execution.diff ? { ok: r.execution.diff.ok, problems: r.execution.diff.problems, changed: r.execution.diff.changed } : null }
      : null,
    findings: r.findings.map((f) => ({
      id: f.id,
      fingerprint: f.fingerprint,
      type: f.type,
      area: f.area,
      title: f.title,
      severity: f.severity,
      baseSeverity: f.baseSeverity,
      priorSeverity: f.priorSeverity,
      severityBasis: f.severityBasis,
      status: f.status,
      disposition: f.disposition,
      reopened: f.reopened ?? false,
      firstSeen: f.firstSeen,
      lastSeen: f.lastSeen,
      route: f.route,
      routes: f.routes,
      grouped: f.grouped,
      rootCause: f.rootCause,
      field: f.field,
      failure: f.failure,
      detail: f.detail,
      instances: f.instances,
      sources: f.sources,
      evidence: f.evidence,
      owner: f.owner,
      reviewReason: f.reviewReason,
      publisherHandoffNeeded: Boolean(f.publisherHandoff),
      search: f.search,
      priority: f.priority,
      shownInFull: f.shownInFull,
      fix: f.fix ? { ok: f.fix.ok, blockedBy: f.fix.blockedBy ?? null, reason: f.fix.reason ?? null, gates: f.fix.gates, edits: f.fix.edits } : null,
      autoFixCommit: f.status === "AUTO_FIXED" ? r.execution?.commitHash ?? null : null,
      reappearedAfterAutoFix: f.reappearedAfterAutoFix ?? null,
    })),
    resolved: r.resolved,
    publisherHandoffs: r.publisherHandoffs,
  };
}
