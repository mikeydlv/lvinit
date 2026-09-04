// ---------------------------------------------------------------------------
// REPORT RENDERING — Markdown (for Mikey) and JSON (for machines)
//
// Same contract as the GSC agent's reports, so there is one format to learn:
//
//   * the Markdown is written for someone who is not a developer
//   * the JSON is the machine contract — stable keys, stable IDs, so an
//     approved finding can be handed to lvinit-content-publisher later
//   * every value is labelled as one of five things:
//
//       DETECTED           what the page says (read from the repository)
//       CALCULATED         risk, staleness, priority — arithmetic over the above
//       EXTERNAL EVIDENCE  what a fetched source actually said
//       INTERPRETATION     the agent's reading of it
//       RECOMMENDED ACTION what it suggests a human do
//
// The distinction between DETECTED and EXTERNAL EVIDENCE is the one that
// matters most. Detection is analysis. Only external evidence is verification,
// and the report never lets the two look alike.
// ---------------------------------------------------------------------------

import { escapeCell, truncate } from "../../gsc/lib/text.mjs";

import { ACTION_LABELS } from "./analyze.mjs";
import { describeHierarchy } from "./sources.mjs";
import { GROUP_LABELS } from "./categories.mjs";
import { formatHuman } from "./dates.mjs";

const REPORT_SCHEMA_VERSION = "1.0.0";

export const PROHIBITED_ACTIONS = [
  "rewrite or edit published articles",
  "modify public-facing pages",
  "update metadata, titles, or structured data",
  "change internal links",
  "publish corrections",
  "commit content changes",
  "push site changes",
  "deploy the website",
  "hand work to the Content Publisher without Mikey's approval",
  "send email or alter CRM data",
  "modify the GSC Opportunity Agent's scoring or reports",
];

const RESULT_LABELS = {
  confirms: "Source confirms",
  contradicts: "Source contradicts",
  "partially-confirms": "Source partially confirms",
  "value-not-found": "Value not found on the source",
  "cannot-verify": "Cannot verify",
  "source-unreachable": "Source unreachable",
  "manual-check-required": "MANUAL_SOURCE_CHECK_REQUIRED",
  "not-attempted": "Not checked on this run",
};

const RISK_LABELS = { high: "High", medium: "Medium", low: "Low" };
const URGENCY_LABELS = {
  now: "Now",
  soon: "Soon",
  routine: "Routine",
  monitor: "Monitor",
};

const fmtInt = (n) => (Number.isFinite(n) ? n.toLocaleString("en-US") : "—");
const fmtDays = (n) => (Number.isFinite(n) ? `${n} day${n === 1 ? "" : "s"}` : "unknown");

// ---------------------------------------------------------------------------
// JSON
// ---------------------------------------------------------------------------

export function buildJsonReport({ analysis, config, meta }) {
  return {
    schemaVersion: REPORT_SCHEMA_VERSION,
    agent: "lvinit-fact-decay-agent",
    generatedAt: new Date().toISOString(),
    reportDate: analysis.reportDate,
    dataSource: meta.dataSource, // "repository-scan" | "fixture"
    fixtureData: meta.dataSource === "fixture",
    site: { origin: meta.origin ?? "https://www.lvinit.com" },
    configuration: {
      scanScope: {
        includeSections: config.content.includeSections,
        includeRoutes: config.content.includeRoutes,
        excludeRoutes: config.content.excludeRoutes,
        excludeCategories: config.content.excludeCategories,
        followCompanionModules: config.content.followCompanionModules,
      },
      cadenceDays: config.cadence,
      riskThresholds: { high: config.risk.highThreshold, medium: config.risk.mediumThreshold },
      freshnessWeights: config.freshness.weights,
      priorityWeights: config.priority.weights,
      verification: {
        enabled: config.verification.enabled,
        minPriorityToVerify: config.verification.minPriorityToVerify,
        maxSourceFetches: config.verification.maxSourceFetches,
        cacheTtlDays: config.verification.cacheTtlDays,
      },
      output: {
        minPriority: config.output.minPriority,
        maxFindings: config.output.maxFindings,
      },
    },
    totals: analysis.totals,
    sourceHierarchy: describeHierarchy(config),
    gscSignal: analysis.gscSignal,
    verificationStats: {
      fetches: analysis.verificationStats?.fetches ?? 0,
      cacheEntries: analysis.verificationStats?.cacheEntries ?? 0,
    },
    findings: analysis.findings,
    confirmedStillStanding: {
      note:
        "Claims an external source confirmed on this run. They are not refreshes — they are the work the agent did that found nothing wrong — so they are listed separately rather than competing for space with claims that need attention.",
      items: analysis.confirmed ?? [],
    },
    pages: analysis.pages,
    pagesWithNoDetectedIssues: analysis.cleanPages.map((p) => ({
      route: p.route,
      title: p.title,
      claimsReviewed: p.claimsReviewed,
      lastReviewed: p.lastReviewed,
    })),
    pagesOutOfScope: analysis.skipped,
    yearLabelledPages: analysis.yearLabelled,
    fairHousingComplianceQueue: {
      policy:
        "Published prose is scanned with the same Fair Housing rule list the GSC Opportunity Agent uses. Matches are flagged for a human compliance read and are never edited, scored, or handed to the Content Publisher by this agent.",
      items: analysis.compliance,
    },
    dataQuality: { notes: analysis.notes },
    prohibited: PROHIBITED_ACTIONS,
  };
}

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

export function buildMarkdownReport({ analysis, config, meta }) {
  const lines = [];
  const isFixture = meta.dataSource === "fixture";
  const t = analysis.totals;

  lines.push(`# LVINIT Content Refresh Report — ${analysis.reportDate}`);
  lines.push("");

  if (isFixture) {
    lines.push("> ## ⚠️ FIXTURE DATA — NOT LVINIT'S REAL CONTENT");
    lines.push("> ");
    lines.push(
      "> Every page, claim and source below came from a synthetic test fixture " +
        "(`scripts/fact-decay/fixtures/`), invented so the logic can be exercised without touching the " +
        "real site or the network. **None of it describes LVINIT's published content.** Do not act on it."
    );
    lines.push("");
  }

  lines.push(`**Scan date:** ${analysis.reportDate} (${formatHuman(analysis.reportDate)})  `);
  lines.push(`**Scanned:** ${isFixture ? "synthetic fixture pages" : "the LVINIT repository — `app/**/page.tsx` and the data modules those pages import"}  `);
  lines.push(
    `**External verification:** ${
      config.verification.enabled
        ? `on — ${analysis.verificationStats?.fetches ?? 0} source request${(analysis.verificationStats?.fetches ?? 0) === 1 ? "" : "s"} made this run`
        : "**off** — nothing below has been checked against a source. Run with `--verify` to check cited sources."
    }`
  );
  lines.push("");

  // --- The counts, before any interpretation -------------------------------
  lines.push("## What was scanned");
  lines.push("");
  lines.push("*Counts only. Nothing here is interpreted.*");
  lines.push("");
  lines.push("| | |");
  lines.push("|---|---:|");
  lines.push(`| Pages scanned | ${fmtInt(t.pagesInScope)} |`);
  lines.push(`| Pages out of scope | ${fmtInt(t.pagesSkipped)} |`);
  lines.push(`| Sentences reviewed | ${fmtInt(t.claimsReviewed)} |`);
  lines.push(`| Time-sensitive claims detected | ${fmtInt(t.claimsDetected)} |`);
  lines.push(`| **High-risk items** | **${fmtInt(t.high)}** |`);
  lines.push(`| **Medium-risk items** | **${fmtInt(t.medium)}** |`);
  lines.push(`| **Low-risk items** | **${fmtInt(t.low)}** |`);
  lines.push(`| Pages requiring review | ${fmtInt(t.pagesRequiringReview)} |`);
  lines.push(`| Pages with no detected issues | ${fmtInt(t.pagesWithNoDetectedIssues)} |`);
  if (t.confirmedStillStanding) {
    lines.push(`| Claims checked and still standing | ${fmtInt(t.confirmedStillStanding)} |`);
  }
  lines.push("");
  lines.push(
    `Of the ${fmtInt(t.claimsReviewed)} sentences reviewed, ${fmtInt(t.sentenceBuckets.opinion)} were read as editorial ` +
      `opinion, ${fmtInt(t.sentenceBuckets.historical)} as settled history, ${fmtInt(t.sentenceBuckets.durable)} as durable ` +
      `geography, and ${fmtInt(t.sentenceBuckets["not-a-claim"])} matched no time-sensitive fact category. Those four groups ` +
      "were deliberately not flagged — the agent is supposed to leave them alone."
  );
  lines.push("");
  if (t.findingsBelowThreshold > 0) {
    lines.push(
      `${fmtInt(t.findingsBelowThreshold)} further claim${t.findingsBelowThreshold === 1 ? "" : "s"} scored below the ` +
        `reporting threshold of ${config.output.minPriority} and ${t.findingsBelowThreshold === 1 ? "is" : "are"} not listed. ` +
        "The threshold is in `scripts/fact-decay/config.mjs` if you want to see more."
    );
    lines.push("");
  }

  // --- Highest-priority refreshes ------------------------------------------
  lines.push("## Highest-priority refreshes");
  lines.push("");

  const highlighted = selectHighlights(analysis.findings, config);
  const rest = analysis.findings.filter((f) => !highlighted.includes(f));

  if (analysis.findings.length === 0) {
    lines.push(
      "**Nothing cleared the bar this run.** That is a real answer, not an empty report. The agent will not " +
        "manufacture findings to look productive — if two claims need attention, it reports two, and if none " +
        "do, it says so."
    );
    lines.push("");
  } else if (highlighted.length === 0) {
    lines.push("Everything found is in the table below; nothing was strong enough to lead with.");
    lines.push("");
  } else {
    lines.push(
      `${highlighted.length} item${highlighted.length === 1 ? "" : "s"}, in priority order. Each one shows what the ` +
        "page says, why it was flagged, what an external source said, and what is recommended."
    );
    lines.push("");
    for (const finding of highlighted) lines.push(...renderFinding(finding, config));
  }

  // --- Everything else ------------------------------------------------------
  if (analysis.findings.length) {
    lines.push("---");
    lines.push("");
    lines.push("## All findings");
    lines.push("");
    lines.push("| ID | Page | Claim | Category | Risk | Priority | Urgency | Verification | Conf. | Recommended action |");
    lines.push("|---|---|---|---|---|---:|---|---|---|---|");
    for (const f of analysis.findings) {
      lines.push(
        `| ${f.id} | \`${escapeCell(f.route)}\` | ${escapeCell(truncate(f.claim, 60))} | ${escapeCell(f.category.label)} | ` +
          `${RISK_LABELS[f.risk.level]} | ${f.priority} | ${URGENCY_LABELS[f.urgency]} | ` +
          `${RESULT_LABELS[f.verification.result]} | ${f.confidence.level} | ${ACTION_LABELS[f.recommendedAction]} |`
      );
    }
    lines.push("");
    lines.push(
      "*Claim and category are **detected** from the repository. Risk, priority and urgency are **calculated**. " +
        "Verification is **external evidence** — or the absence of it. The recommended action is the agent's " +
        "**suggestion**, and nothing acts on it until you say so.*"
    );
    lines.push("");

    if (rest.length) {
      lines.push("### The rest, in detail");
      lines.push("");
      for (const finding of rest) lines.push(...renderFinding(finding, config, { compact: true }));
    }
  }

  // --- Checked and still standing -------------------------------------------
  const confirmed = analysis.confirmed ?? [];
  if (confirmed.length) {
    lines.push("---");
    lines.push("");
    lines.push("## Checked, and still standing");
    lines.push("");
    lines.push(
      `${confirmed.length} claim${confirmed.length === 1 ? "" : "s"} ${confirmed.length === 1 ? "was" : "were"} checked ` +
        "against the source the page cites, and the figures still appear there. These are not refreshes — they are the " +
        "work that found nothing wrong — so they are listed here rather than competing for space above. Their review " +
        "clock restarts today."
    );
    lines.push("");
    lines.push("| ID | Page | Claim | Source checked |");
    lines.push("|---|---|---|---|");
    for (const f of confirmed) {
      lines.push(
        `| ${f.id} | \`${escapeCell(f.route)}\` | ${escapeCell(truncate(f.claim, 60))} | ` +
          `${f.verification.source?.sourceUrl ? `[${escapeCell(truncate(f.verification.source.sourceTitle ?? f.verification.source.sourceUrl, 40))}](${f.verification.source.sourceUrl})` : "—"} |`
      );
    }
    lines.push("");
    lines.push(
      "*A presence check, not a reading of the source: it establishes that the figures still appear there, not that " +
        "the source still means what it did.*"
    );
    lines.push("");
  }

  // --- Pages with no detected issues ---------------------------------------
  lines.push("---");
  lines.push("");
  lines.push("## Pages with no detected issues");
  lines.push("");
  if (analysis.cleanPages.length === 0) {
    lines.push("Every scanned page produced at least one finding.");
  } else {
    lines.push("| Page | Sentences reviewed | Facts last checked |");
    lines.push("|---|---:|---|");
    for (const page of analysis.cleanPages) {
      lines.push(
        `| \`${escapeCell(page.route)}\` | ${fmtInt(page.claimsReviewed)} | ` +
          `${page.lastReviewed ? formatHuman(page.lastReviewed) : "**no date found**"} |`
      );
    }
    lines.push("");
    lines.push("*No detected issue is not the same as verified-correct. It means nothing on the page crossed the reporting threshold on this run.*");
  }
  lines.push("");

  // --- Year-labelled pages --------------------------------------------------
  if (analysis.yearLabelled.length) {
    lines.push("## Pages with a year in the title or URL");
    lines.push("");
    lines.push(
      "An old year is **not** automatically a reason to rewrite anything. A dated market report is a record of " +
        "that month and should stay one. The agent says which shape it thinks each page is and leaves the " +
        "judgement to you."
    );
    lines.push("");
    for (const page of analysis.yearLabelled) {
      lines.push(`- **\`${page.route}\`** — *${page.shape}* (${page.yearsInTitleOrUrl.join(", ")}). ${page.guidance}`);
    }
    lines.push("");
  }

  // --- Compliance queue -----------------------------------------------------
  lines.push("## Fair Housing compliance queue");
  lines.push("");
  if (analysis.compliance.length === 0) {
    lines.push("No published sentence tripped the Fair Housing filter on this run.");
  } else {
    lines.push(
      "These sentences matched LVINIT's Fair Housing rule list — the same list the GSC Opportunity Agent uses, " +
        "read from `scripts/gsc/lib/fair-housing.mjs` so the two agents can never disagree about what is blocked. " +
        "**They are candidates for a human read, not violations, and nothing here has been changed or scored.** " +
        "Many will be entirely innocuous in context. The point is that a person decides, not this agent."
    );
    lines.push("");
    lines.push("| Page | Rule | Mentions | Example |");
    lines.push("|---|---|---:|---|");
    for (const item of analysis.compliance.slice(0, config.output.maxComplianceListed)) {
      lines.push(
        `| \`${escapeCell(item.route)}\` | ${escapeCell(item.rule)} | ${item.occurrences} | ` +
          `${escapeCell(truncate(item.examples[0]?.text ?? "", 70))} |`
      );
    }
    if (analysis.compliance.length > config.output.maxComplianceListed) {
      lines.push("");
      lines.push(`*…and ${analysis.compliance.length - config.output.maxComplianceListed} more.*`);
    }
  }
  lines.push("");

  // --- How the model works --------------------------------------------------
  lines.push("---");
  lines.push("");
  lines.push("## How this report decides things");
  lines.push("");
  lines.push("### Risk — how badly a wrong answer could mislead someone");
  lines.push("");
  lines.push("| Level | What it means |");
  lines.push("|---|---|");
  lines.push("| **High** | Getting it wrong could materially mislead a buyer, renter or homeowner — laws, financing rules, assistance eligibility, HOA fees, taxes, project status, special assessments, mortgage rates, major pricing. |");
  lines.push("| **Medium** | May affect a decision, but slightly stale is unlikely to cause material harm — construction timelines, openings, inventory references, builder status, amenities. |");
  lines.push("| **Low** | Easy to fix, unlikely to change anyone's decision — dates in copy, minor details that may have moved. |");
  lines.push("");
  lines.push(
    `Risk starts from the claim's category and is adjusted for what the sentence actually says. It becomes High at ` +
      `${config.risk.highThreshold} and Medium at ${config.risk.mediumThreshold}. Every adjustment that fired is printed with the finding.`
  );
  lines.push("");
  lines.push("### Freshness — how likely it is the fact has moved");
  lines.push("");
  lines.push("| How fast this kind of fact moves | Reviewed every | Why |");
  lines.push("|---|---:|---|");
  lines.push(`| Very dynamic | ${config.cadence["very-dynamic"]} days | Weekly publication cycles: mortgage rates, road closures, builder incentives, deadlines. |`);
  lines.push(`| Dynamic | ${config.cadence.dynamic} days | Monthly publication cycles: prices, inventory, permits, project status. |`);
  lines.push(`| Moderate | ${config.cadence.moderate} days | Budget, legislative and planning cycles: taxes, HOA amounts, zoning, licensing. |`);
  lines.push(`| Stable | ${config.cadence.stable} days | Durable facts, reviewed annually or on request. |`);
  lines.push("");
  lines.push(
    "**Being due is not being wrong.** Passing a cadence means nobody has checked recently enough to say the claim " +
      "still holds. The only exception is date arithmetic: a deadline written in the copy that has already passed is " +
      "not a probability, and the report says so plainly."
  );
  lines.push("");
  lines.push("### Priority and confidence are separate");
  lines.push("");
  lines.push(
    `Priority orders the list: ${config.priority.weights.risk} risk + ${config.priority.weights.staleness} staleness + ` +
      `${config.priority.weights.verification} verification, then multiplied by a traffic weighting if a recent GSC ` +
      "report is on disk. Confidence is about the strength of the evidence, and is deliberately kept out of that " +
      "number — a low-confidence finding is never promoted to a top-priority correction."
  );
  lines.push("");
  lines.push("| Confidence | What it means |");
  lines.push("|---|---|");
  lines.push("| **High** | A current authoritative source clearly contradicts or supersedes the page, or the copy names a date that has demonstrably passed. |");
  lines.push("| **Medium** | Evidence strongly suggests the page may be stale, but the context needs a human read. |");
  lines.push("| **Low** | A potential issue was detected but could not be verified strongly. |");
  lines.push("");

  // --- Sources --------------------------------------------------------------
  lines.push("### Which sources count");
  lines.push("");
  for (const tier of describeHierarchy(config)) lines.push(`${tier.rank}. ${tier.label}`);
  lines.push("");
  lines.push(
    "Scraped SEO sites, anonymous blogs, AI-generated summaries, stale aggregators and forum posts are not " +
      "acceptable sources, and a claim resting on one is reported as needing a better source rather than verified " +
      "against it."
  );
  lines.push("");
  lines.push(
    "**The agent cannot search the web.** It can only re-check sources the page already cites. Anything that needs " +
      "a source nobody has cited yet is marked `MANUAL_SOURCE_CHECK_REQUIRED`, with the reason, and left for a person."
  );
  lines.push("");

  // --- GSC relationship -----------------------------------------------------
  lines.push("### How search traffic affected the ordering");
  lines.push("");
  lines.push(
    analysis.gscSignal.available
      ? `The newest GSC Opportunity Agent report was ${analysis.gscSignal.reason}. Pages people are actually landing ` +
        "on were nudged up the list; pages with no rows were nudged down. Traffic **only reorders** — it can never " +
        "create a finding, hide one, or change a risk level, and nothing in `reports/gsc/` was modified."
      : `No traffic weighting was applied: ${analysis.gscSignal.reason}. GSC data is optional — this agent works without it.`
  );
  lines.push("");

  // --- Data quality ---------------------------------------------------------
  if (analysis.notes.length) {
    lines.push("## Notes and limitations from this run");
    lines.push("");
    for (const note of analysis.notes) lines.push(`- ${note}`);
    lines.push("");
  }
  lines.push(
    "Claims are extracted from `.tsx` source with pattern matching, not a TypeScript parser. That is why every " +
      "finding prints its file, line number and surrounding context: so you can check the machine in two seconds. " +
      "**No language model is involved anywhere in this agent** — detection is deterministic, and the same input " +
      "always produces the same output."
  );
  lines.push("");

  // --- Boundaries -----------------------------------------------------------
  lines.push("---");
  lines.push("");
  lines.push("## What this agent did not do");
  lines.push("");
  lines.push(
    "This agent reads published content and writes this report. That is the whole job. It is prohibited from doing " +
      "any of the following, and the weekly automation has no permission to either:"
  );
  lines.push("");
  for (const action of PROHIBITED_ACTIONS) lines.push(`- ${action}`);
  lines.push("");
  lines.push(
    "Execution belongs to the **LVINIT Real Estate Content Publisher**, and only after you approve a specific " +
      "finding by its ID:"
  );
  lines.push("");
  lines.push("```");
  lines.push(`Have the LVINIT Real Estate Content Publisher handle ${analysis.findings[0]?.id ?? "FACT-YYYY-MM-DD-001"}.`);
  lines.push("```");
  lines.push("");
  lines.push("Nothing above has been handed over.");
  lines.push("");

  return lines.join("\n");
}

/**
 * Pick the highlighted findings: highest priority first, but capped per page so
 * the top of the report covers several pages rather than one bad guide.
 */
export function selectHighlights(findings, config) {
  const perPage = new Map();
  const picked = [];
  for (const finding of findings) {
    if (picked.length >= config.output.maxHighlighted) break;
    const count = perPage.get(finding.route) ?? 0;
    if (count >= config.output.maxHighlightedPerPage) continue;
    perPage.set(finding.route, count + 1);
    picked.push(finding);
  }
  return picked;
}

/** One finding, rendered. */
function renderFinding(f, config, { compact = false } = {}) {
  const lines = [];
  lines.push(
    compact
      ? `#### ${f.id} — ${f.category.label} · priority ${f.priority} · ${RISK_LABELS[f.risk.level]} risk`
      : `### ${f.id} — ${f.category.label}`
  );
  lines.push("");
  lines.push(
    `**Priority ${f.priority}/100** · Risk: **${RISK_LABELS[f.risk.level]}** · Urgency: **${URGENCY_LABELS[f.urgency]}** · ` +
      `Confidence: **${f.confidence.level}**`
  );
  lines.push("");
  lines.push(`**Page:** \`${f.route}\`${f.pageTitle ? ` — ${f.pageTitle}` : ""}  `);
  lines.push(`**Where:** \`${f.file}:${f.line}\`${f.heading ? ` — under “${f.heading}”` : ""}  `);
  lines.push(`**Fact category:** ${f.category.label} (${GROUP_LABELS[f.category.group]})${f.jurisdiction ? ` · ${f.jurisdiction.label}` : ""}`);
  lines.push("");
  lines.push(`**The claim (detected):**`);
  lines.push("");
  lines.push(`> ${f.claim}`);
  lines.push("");
  if (!compact && f.context && f.context !== f.claim) {
    lines.push(`**Surrounding context:** ${f.context}`);
    lines.push("");
  }
  lines.push(`**Currently published value:** ${f.currentPublishedValue}  `);
  lines.push(
    `**Facts on this page last checked:** ${
      f.freshness.lastReviewed ? `${formatHuman(f.freshness.lastReviewed)} (${fmtDays(f.freshness.daysSinceReviewed)} ago, from ${f.freshness.lastReviewedBasis})` : "**no date could be established**"
    }  `
  );
  lines.push(
    `**Review cadence for this kind of fact:** every ${f.freshness.cadenceDays} days` +
      (f.freshness.isOverdue ? ` — currently **${fmtDays(f.freshness.overdueByDays)} past that**` : " — inside that window")
  );
  lines.push("");
  lines.push(`**Why it was flagged (interpretation):** ${f.whyFlagged}`);
  lines.push("");

  // Sources
  lines.push(
    `**Source currently supporting the page:** ${
      f.supportingSource
        ? `[${f.supportingSource.label}](${f.supportingSource.url}) — ${f.supportingSource.type}` +
          (f.supportingSource.thinlySourced ? " · **thinly sourced for a claim of this kind**" : "") +
          (f.supportingSource.used ? `\n> Used on the page for: ${f.supportingSource.used}` : "")
        : "**none cited.** This is a time-sensitive claim with nothing behind it."
    }`
  );
  lines.push("");
  const record = f.verification.source ?? {};
  lines.push(`**Verification (external evidence):** ${RESULT_LABELS[f.verification.result]}`);
  lines.push("");
  lines.push(`- **Source checked:** ${record.sourceUrl ? `[${record.sourceTitle ?? record.sourceUrl}](${record.sourceUrl})` : "none"}`);
  lines.push(`- **Source type:** ${record.sourceType ?? "unknown"}`);
  lines.push(`- **Source published/updated:** ${record.datePublishedOrUpdated ?? "not stated by the source"}`);
  lines.push(`- **Date accessed:** ${record.dateAccessed ?? "not accessed on this run"}`);
  lines.push(`- **Result:** ${f.verification.reason}`);
  if (f.verification.marker) {
    lines.push(`- **Marker:** \`${f.verification.marker}\``);
  }
  if (f.verification.conflicts?.length) {
    lines.push(`- **Conflicting values found on the source:**`);
    for (const c of f.verification.conflicts) {
      lines.push(`  - page: \`${c.pageValue}\` · source: \`${c.sourceValue}\` — “${escapeCell(truncate(c.quote, 180))}”`);
    }
  } else if (["value-not-found", "partially-confirms"].includes(f.verification.result)) {
    lines.push(
      "- **No conflicting value was found on the source.** This is an absence, not a disagreement — it does not show the page is wrong."
    );
  }
  if (f.verification.evidence?.length) {
    for (const item of f.verification.evidence) lines.push(`- Evidence: ${item}`);
  }
  if (record.notes?.length) {
    for (const note of record.notes) lines.push(`- Note: ${note}`);
  }
  lines.push("");
  lines.push(`**Recommended action:** ${ACTION_LABELS[f.recommendedAction]}`);
  lines.push("");
  lines.push(f.recommendedActionReason);
  lines.push("");
  if (f.confidence.caveats?.length) {
    lines.push(`*Confidence caveats: ${f.confidence.caveats.join("; ")}.*`);
    lines.push("");
  }
  if (f.history) {
    lines.push(
      `*Previously reported: first seen ${f.history.firstSeen} as ${f.history.firstId}, ` +
        `${f.history.timesReported} time${f.history.timesReported === 1 ? "" : "s"} in earlier reports.*`
    );
    lines.push("");
  }
  if (!compact) {
    lines.push(renderPriorityBreakdown(f));
    lines.push("");
  }
  lines.push(`*To act on this:* \`${f.handoff.invoke}\` (Nothing happens until you say so.)`);
  lines.push("");
  return lines;
}

function renderPriorityBreakdown(f) {
  const i = f.priorityInputs;
  const rows = [
    "| Priority input | Weight | Value (0–1) |",
    "|---|---:|---:|",
    `| Risk | ${i.weights.risk} | ${i.risk} |`,
    `| Staleness | ${i.weights.staleness} | ${i.staleness} |`,
    `| Verification | ${i.weights.verification} | ${i.verificationSeverity} |`,
    `| Traffic multiplier | — | ×${i.trafficMultiplier} |`,
    `| **Priority** | | **${f.priority}/100** |`,
  ];
  rows.push("");
  rows.push(`*Traffic: ${i.trafficBasis}*`);
  return rows.join("\n");
}
