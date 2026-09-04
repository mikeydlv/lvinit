// ---------------------------------------------------------------------------
// REPORT RENDERING — Markdown (for Mikey) and JSON (for machines)
//
// The Markdown report is written for someone who is not an SEO expert. It leads
// with a plain-English executive summary answering five questions per item:
//   1. What Google is showing us
//   2. Why it matters
//   3. What I recommend doing
//   4. Which LVINIT page is affected
//   5. Whether this needs an existing page updated or something new
//
// The JSON report is the machine contract — stable keys, stable ids, so an
// approved opportunity can be handed to lvinit-content-publisher later.
//
// Both make the same four categories visually distinct, every time:
//   RAW Search Console metric | CALCULATED | AGENT INTERPRETATION | RECOMMENDED ACTION
// ---------------------------------------------------------------------------

import { escapeCell, truncate } from "./text.mjs";
import { describeWindows } from "./windows.mjs";

const REPORT_SCHEMA_VERSION = "1.0.0";

const TYPE_LABELS = {
  "quick-win": "Quick win",
  "ctr-opportunity": "Clickthrough opportunity",
  "emerging-query": "Emerging search",
  "page-gaining-momentum": "Page gaining momentum",
  "page-losing-momentum": "Page losing momentum",
  "content-gap": "Content gap",
  "query-page-mismatch": "Query / page mismatch",
  cannibalization: "Possible cannibalization",
  "internal-link": "Internal-link opportunity",
};

/** Types whose subject is a page, not a query. */
export const PAGE_LEVEL_TYPES = new Set([
  "page-gaining-momentum",
  "page-losing-momentum",
  "internal-link",
]);

const KIND_LABELS = {
  "optimize-existing-page": "Update an existing page",
  "investigate-existing-page": "Investigate an existing page",
  "add-internal-links": "Add internal links",
  "create-new-content": "Create something new",
  "monitor-only": "Monitor only — no action yet",
};

const fmtInt = (n) => (Number.isFinite(n) ? n.toLocaleString("en-US") : "—");
const fmtPct = (n) => (Number.isFinite(n) ? `${(n * 100).toFixed(1)}%` : "—");
const fmtPos = (n) => (Number.isFinite(n) ? n.toFixed(1) : "—");
const fmtDelta = (n, { suffix = "" } = {}) => {
  if (!Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n}${suffix}`;
};
const fmtPosDelta = (n) => {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "no change";
  return n > 0 ? `up ${n.toFixed(1)}` : `down ${Math.abs(n).toFixed(1)}`;
};

// ---------------------------------------------------------------------------
// JSON
// ---------------------------------------------------------------------------

export function buildJsonReport({ analysis, config, meta }) {
  return {
    schemaVersion: REPORT_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    reportDate: meta.reportDate,
    dataSource: meta.dataSource, // "search-console" | "fixture"
    fixtureData: meta.dataSource === "fixture",
    site: {
      property: meta.property ?? null,
      origin: config.site.origin,
    },
    windows: analysis.windows,
    configuration: {
      lagDays: config.windows.lagDays,
      periodDays: config.windows.periodDays,
      comparisonDays: analysis.windows.previous.days,
      dataState: config.site.dataState,
      minScoreReported: config.output.minScore,
      maxOpportunities: config.output.maxOpportunities,
      thresholds: config.thresholds,
      scoringWeights: config.scoring.weights,
    },
    totals: analysis.totals,
    dataQuality: {
      lowVolume: analysis.lowVolume,
      lowVolumeThreshold: config.output.lowVolumeTotalImpressions,
      notes: analysis.notes,
      candidateFindings: analysis.candidateCount,
      reportedFindings: analysis.opportunities.length,
    },
    ctrBaseline: {
      source: "LVINIT's own Search Console rows for the current window. No external or industry CTR benchmark is used.",
      bands: analysis.ctrBaseline,
    },
    fairHousing: {
      policy:
        "Queries touching protected classes or their recognized proxies are excluded from recommendations entirely, not down-ranked.",
      excludedCount: analysis.fairHousingExcluded.length,
      excluded: analysis.fairHousingExcluded,
    },
    byType: analysis.byType,
    opportunities: analysis.opportunities,
    prohibited: PROHIBITED_ACTIONS,
  };
}

export const PROHIBITED_ACTIONS = [
  "write or rewrite articles",
  "change titles, metadata, or schema on production pages",
  "add internal links directly",
  "modify neighborhood guides or any site file",
  "create public-facing pages",
  "publish content",
  "commit or push changes",
  "deploy the site",
  "send email or alter CRM data",
];

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

export function buildMarkdownReport({ analysis, config, meta }) {
  const lines = [];
  const isFixture = meta.dataSource === "fixture";

  lines.push(`# LVINIT Search Opportunities — ${meta.reportDate}`);
  lines.push("");

  if (isFixture) {
    lines.push("> ## ⚠️ FIXTURE DATA — NOT REAL SEARCH CONSOLE DATA");
    lines.push("> ");
    lines.push(
      "> Every number in this report came from a synthetic test dataset " +
        "(`scripts/gsc/fixtures/`), invented so the analysis logic can be tested before " +
        "Search Console access is connected. **None of it describes LVINIT's actual search " +
        "performance.** Do not act on anything below."
    );
    lines.push("");
  }

  lines.push(`**Data source:** ${isFixture ? "Synthetic fixture" : "Google Search Console API"}  `);
  if (meta.property) lines.push(`**Property:** \`${meta.property}\`  `);
  lines.push(`**Comparison:** ${describeWindows(analysis.windows)}  `);
  lines.push(
    `**Reporting lag buffer:** ${config.windows.lagDays} day${config.windows.lagDays === 1 ? "" : "s"} ` +
      `(plus \`dataState: ${config.site.dataState}\`, so only finalized rows are used)`
  );
  lines.push("");

  // --- Health check --------------------------------------------------------
  const t = analysis.totals;
  lines.push("## The numbers, before any interpretation");
  lines.push("");
  lines.push("*Raw Search Console totals for the two windows. Nothing here is calculated or interpreted.*");
  lines.push("");
  lines.push("| | Current period | Previous period | Change |");
  lines.push("|---|---:|---:|---:|");
  lines.push(
    `| Clicks | ${fmtInt(t.currentClicks)} | ${fmtInt(t.previousClicks)} | ${fmtDelta(t.currentClicks - t.previousClicks)} |`
  );
  lines.push(
    `| Impressions | ${fmtInt(t.currentImpressions)} | ${fmtInt(t.previousImpressions)} | ${fmtDelta(t.currentImpressions - t.previousImpressions)} |`
  );
  lines.push(`| Queries with data | ${fmtInt(t.uniqueQueries)} | — | — |`);
  lines.push(`| Pages with data | ${fmtInt(t.uniquePages)} | — | — |`);
  lines.push("");

  if (analysis.lowVolume) {
    lines.push(
      `> **Read this before anything else.** LVINIT had ${fmtInt(t.currentImpressions)} impressions in the ` +
        `current window, below the ${fmtInt(config.output.lowVolumeTotalImpressions)} threshold this agent ` +
        "uses for drawing firm conclusions. At this volume a single query moving can swing a percentage " +
        "wildly. Everything below is an early signal worth watching, not a verdict."
    );
    lines.push("");
  }

  // --- Executive summary ---------------------------------------------------
  lines.push("## Top opportunities this week");
  lines.push("");

  const top = selectExecutiveSummary(analysis.opportunities, config.output.maxExecutiveSummary);
  const topIds = new Set(top.map((o) => o.id));
  const rest = analysis.opportunities.filter((o) => !topIds.has(o.id));
  if (top.length === 0) {
    lines.push(
      "**Nothing cleared the bar this week.** That is a real answer, not an empty report — the agent " +
        "found no finding strong enough to be worth your time, and it will not manufacture one to fill " +
        "space. The most likely reasons are that the site is still accumulating search data, or that " +
        "nothing changed meaningfully since the last period."
    );
    lines.push("");
    if (analysis.candidateCount > 0) {
      lines.push(
        `For transparency: ${analysis.candidateCount} candidate finding${analysis.candidateCount === 1 ? "" : "s"} ` +
          `were detected but scored below the reporting threshold of ${config.output.minScore}.`
      );
      lines.push("");
    }
  } else {
    lines.push(
      `${top.length} item${top.length === 1 ? "" : "s"}, ranked by opportunity score. ` +
        "Each one answers the same five questions."
    );
    lines.push("");
    top.forEach((opp, i) => {
      lines.push(`### ${i + 1}. ${opp.id} — ${TYPE_LABELS[opp.type] ?? opp.type}`);
      lines.push("");
      lines.push(
        `**Score ${opp.score}/100** · Confidence: **${opp.confidence.level}** · ` +
          `${KIND_LABELS[opp.recommendationKind] ?? opp.recommendationKind}` +
          (opp.alsoDetectedAs?.length
            ? ` · also detected as: ${opp.alsoDetectedAs.map((t) => TYPE_LABELS[t] ?? t).join(", ")}`
            : "")
      );
      lines.push("");
      lines.push(`**1. What Google is showing us**  `);
      lines.push(summarizeSignal(opp));
      lines.push("");
      lines.push(`**2. Why it matters**  `);
      lines.push(opp.whyItMatters);
      lines.push("");
      lines.push(`**3. What I recommend doing**  `);
      lines.push(opp.recommendedAction);
      if (opp.editorialAngle) {
        lines.push("");
        lines.push(`> **The angle** — ${opp.editorialAngle}`);
      }
      lines.push("");
      lines.push(`**4. Which LVINIT page is affected**  `);
      lines.push(affectedPageLine(opp));
      lines.push("");
      lines.push(`**5. Existing page or something new?**  `);
      lines.push(`${KIND_LABELS[opp.recommendationKind] ?? opp.recommendationKind}.`);
      if (opp.confidence.caveats.length) {
        lines.push("");
        lines.push(`*Caveats: ${opp.confidence.caveats.join("; ")}.*`);
      }
      lines.push("");
      lines.push(
        `*To act on this:* \`Have the LVINIT Real Estate Content Publisher execute ${opp.id}.\` ` +
          "(Nothing happens until you say so — this agent never hands work over by itself.)"
      );
      lines.push("");
    });
  }

  // --- Full detail ---------------------------------------------------------
  if (rest.length) {
    lines.push("---");
    lines.push("");
    lines.push("## Everything else the agent found");
    lines.push("");
    lines.push(
      `${rest.length} further finding${rest.length === 1 ? "" : "s"}, same ranking, less detail. ` +
        "The summary above shows one finding per page, so a page can appear again here from a different angle."
    );
    lines.push("");
  }

  if (analysis.opportunities.length) {
    lines.push("### All findings");
    lines.push("");
    lines.push("| ID | Type | Query / Page | Clicks | Impr. | CTR | Pos. | Pos. change | Score | Conf. | Action |");
    lines.push("|---|---|---|---:|---:|---:|---:|---:|---:|---|---|");
    for (const opp of analysis.opportunities) {
      const subject =
        PAGE_LEVEL_TYPES.has(opp.type) || !opp.query
          ? opp.landingPage ?? "—"
          : `"${truncate(opp.query, 42)}"`;
      lines.push(
        `| ${opp.id} | ${TYPE_LABELS[opp.type] ?? opp.type} | ${escapeCell(subject)} | ` +
          `${fmtInt(opp.metrics.clicks)} | ${fmtInt(opp.metrics.impressions)} | ${fmtPct(opp.metrics.ctr)} | ` +
          `${fmtPos(opp.metrics.position)} | ${fmtPosDelta(opp.metrics.positionChange)} | ${opp.score} | ` +
          `${opp.confidence.level} | ${KIND_LABELS[opp.recommendationKind] ?? opp.recommendationKind} |`
      );
    }
    lines.push("");
    lines.push(
      "*Clicks, impressions, CTR and position are raw Search Console metrics. " +
        "Position change and score are calculated. Type and action are the agent's interpretation.*"
    );
    lines.push("");

    // Per-opportunity detail blocks for everything not in the summary.
    if (rest.length) {
      lines.push("### Detail");
      lines.push("");
      for (const opp of rest) {
        lines.push(`#### ${opp.id} — ${TYPE_LABELS[opp.type] ?? opp.type} · score ${opp.score}`);
        lines.push("");
        lines.push(summarizeSignal(opp));
        lines.push("");
        lines.push(`**Why it matters (agent interpretation):** ${opp.whyItMatters}`);
        lines.push("");
        lines.push(`**Recommended action:** ${opp.recommendedAction}`);
        if (opp.editorialAngle) {
          lines.push("");
          lines.push(`**The angle:** ${opp.editorialAngle}`);
        }
        lines.push("");
        lines.push(`**Page:** ${affectedPageLine(opp)}`);
        lines.push("");
        lines.push(
          `**Action type:** ${KIND_LABELS[opp.recommendationKind]} · ` +
            `**Confidence:** ${opp.confidence.level}` +
            (opp.alsoDetectedAs?.length
              ? ` · also detected as: ${opp.alsoDetectedAs.map((t) => TYPE_LABELS[t] ?? t).join(", ")}`
              : "")
        );
        lines.push("");
        lines.push(renderScoreBreakdown(opp));
        lines.push("");
      }
    }
  }

  // --- Score explainer -----------------------------------------------------
  lines.push("---");
  lines.push("");
  lines.push("## How the score works");
  lines.push("");
  lines.push(
    "Every finding gets a 0–100 score: a weighted average of seven components, each normalized to 0–1. " +
      "The weights change by opportunity type, because what makes a quick win valuable is not what makes " +
      "a content gap valuable. Nothing is hidden — each finding above carries its own arithmetic."
  );
  lines.push("");
  lines.push("| Component | What it measures |");
  lines.push("|---|---|");
  lines.push("| Size | How much search demand is attached, on a log curve so early signals are not crushed by big ones. |");
  lines.push("| Position potential | How much realistic ranking upside is left — peaks around position 11, falls off near position 1 and past position 45. |");
  lines.push("| CTR gap | How far below **LVINIT's own** median clickthrough for that position band this sits. No industry benchmark is used anywhere in this agent. |");
  lines.push("| Momentum | Period-over-period change. For declining pages the sign is flipped, so a worse decline scores higher — it is more urgent. |");
  lines.push("| Editorial | How close the query is to what LVINIT is actually for. |");
  lines.push("| Intent | How close the searcher is to a real housing or relocation decision. A ranking signal only — this agent never estimates leads, revenue, or conversion. |");
  lines.push("| Actionability | How cheap the fix is. Internal links and page edits are cheap; new content is not. |");
  lines.push("");
  lines.push(
    "**Confidence is deliberately separate from score.** A finding can be high-value and low-confidence at " +
      "the same time, and averaging those two together would hide it. Confidence comes from data volume: " +
      `**high** at ${fmtInt(config.scoring.confidence.highImpressions)}+ impressions, **medium** at ` +
      `${fmtInt(config.scoring.confidence.mediumImpressions)}+, **low** below that.`
  );
  lines.push("");

  // --- CTR baseline --------------------------------------------------------
  lines.push("## LVINIT's own clickthrough baseline");
  lines.push("");
  lines.push(
    "Built from LVINIT's own Search Console rows in this window — the impression-weighted median CTR at " +
      "each position band. This is what \"weak CTR\" is measured against. **No external or industry CTR " +
      "curve is used anywhere in this agent.**"
  );
  lines.push("");
  lines.push("| Position band | LVINIT median CTR | Queries in band | Impressions | Usable? |");
  lines.push("|---|---:|---:|---:|---|");
  for (const band of analysis.ctrBaseline) {
    lines.push(
      `| ${band.band} | ${band.sufficient ? fmtPct(band.ctr) : "—"} | ${fmtInt(band.rows)} | ` +
        `${fmtInt(band.impressions)} | ${band.sufficient ? "yes" : `no — under ${config.thresholds.ctr.minBaselineRows} queries`} |`
    );
  }
  lines.push("");

  // --- Fair Housing --------------------------------------------------------
  lines.push("## Fair Housing exclusions");
  lines.push("");
  if (analysis.fairHousingExcluded.length === 0) {
    lines.push("No queries in this window tripped the Fair Housing filter.");
  } else {
    lines.push(
      `${analysis.fairHousingExcluded.length} quer${analysis.fairHousingExcluded.length === 1 ? "y" : "ies"} ` +
        "appeared in Search Console but were **excluded from recommendations entirely**. They are listed " +
        "here so the exclusion is visible rather than silent. **No recommendation was generated for any of " +
        "them, and none should be.** Content framed around protected classes or their recognized proxies " +
        "— family status, schools-as-ranking, safety, age, race, religion, disability — is not something " +
        "LVINIT publishes, regardless of search volume."
    );
    lines.push("");
    lines.push("| Query | Impressions | Excluded because |");
    lines.push("|---|---:|---|");
    for (const row of analysis.fairHousingExcluded.slice(0, config.output.maxExcludedListed)) {
      lines.push(`| ${escapeCell(truncate(row.query, 50))} | ${fmtInt(row.impressions)} | ${escapeCell(row.reason)} |`);
    }
    if (analysis.fairHousingExcluded.length > config.output.maxExcludedListed) {
      lines.push("");
      lines.push(`*…and ${analysis.fairHousingExcluded.length - config.output.maxExcludedListed} more.*`);
    }
  }
  lines.push("");

  // --- Data quality notes --------------------------------------------------
  if (analysis.notes.length) {
    lines.push("## Data quality notes");
    lines.push("");
    for (const note of analysis.notes) lines.push(`- ${note}`);
    lines.push("");
  }

  // --- Boundaries ----------------------------------------------------------
  lines.push("---");
  lines.push("");
  lines.push("## What this agent did not do");
  lines.push("");
  lines.push(
    "This agent reads Search Console and writes this report. That is the whole job. It is prohibited from " +
      "doing any of the following, and the weekly automation has no permission to either:"
  );
  lines.push("");
  for (const action of PROHIBITED_ACTIONS) lines.push(`- ${action}`);
  lines.push("");
  lines.push(
    "Execution belongs to the **LVINIT Real Estate Content Publisher**, and only after you approve a " +
      "specific finding by its ID. Nothing above has been handed over."
  );
  lines.push("");

  return lines.join("\n");
}

/**
 * Pick the executive summary: highest-scoring findings, but at most one per
 * landing page, so the top of the report covers several different pages rather
 * than three angles on the same one.
 */
export function selectExecutiveSummary(opportunities, limit) {
  const seenPages = new Set();
  const picked = [];
  for (const opp of opportunities) {
    if (picked.length >= limit) break;
    const pageKey = opp.landingPage ?? `__no-page__${opp.id}`;
    if (seenPages.has(pageKey)) continue;
    seenPages.add(pageKey);
    picked.push(opp);
  }
  return picked;
}

/**
 * "Which LVINIT page is affected". A content gap has no owning page — naming
 * the page Google happened to pick would read as "edit this one", which is the
 * opposite of the recommendation.
 */
function affectedPageLine(opp) {
  if (opp.type === "content-gap") {
    return opp.landingPage
      ? `**No page owns this yet.** Google is currently falling back to \`${opp.landingPage}\`` +
          `${opp.landingPageTitle ? ` (${opp.landingPageTitle})` : ""}, which is not what the searcher asked for.`
      : "**No page owns this yet**, and nothing on LVINIT ranks for it at all.";
  }
  if (!opp.landingPage) return "No specific page — this is about content that does not exist yet.";
  return (
    `\`${opp.landingPage}\`${opp.landingPageTitle ? ` — ${opp.landingPageTitle}` : ""}` +
    (opp.landingPageExists
      ? ""
      : "  \n*(This URL has search data but no matching page in the repo — check for a redirect or a removed route.)*")
  );
}

/** "What Google is showing us" — raw metrics, phrased as a sentence. */
function summarizeSignal(opp) {
  const m = opp.metrics;
  const pageLevel = PAGE_LEVEL_TYPES.has(opp.type) || !opp.query;
  const subject = pageLevel
    ? `The page **${opp.landingPage}**${opp.query ? ` (strongest search: "${opp.query}")` : ""}`
    : `The search **"${opp.query}"**`;
  const parts = [
    `${subject} brought **${fmtInt(m.clicks)} click${m.clicks === 1 ? "" : "s"}** from ` +
      `**${fmtInt(m.impressions)} impression${m.impressions === 1 ? "" : "s"}** (${fmtPct(m.ctr)} clickthrough) ` +
      `at an average position of **${fmtPos(m.position)}**.`,
  ];
  if (m.hasPreviousPeriod) {
    parts.push(
      `Last period: ${fmtInt(m.previousClicks)} click${m.previousClicks === 1 ? "" : "s"} from ` +
        `${fmtInt(m.previousImpressions)} impression${m.previousImpressions === 1 ? "" : "s"} ` +
        `at position ${fmtPos(m.previousPosition)} — impressions ${fmtDelta(m.impressionsChange)}, ` +
        `position ${fmtPosDelta(m.positionChange)}.`
    );
  } else {
    parts.push("There is no comparable data for the previous period, so no trend can be stated.");
  }
  return parts.join(" ");
}

/** The score arithmetic, rendered as a table. */
function renderScoreBreakdown(opp) {
  const rows = ["| Score component | Weight | Value (0–1) | Share of score |", "|---|---:|---:|---:|"];
  for (const row of opp.scoreBreakdown) {
    rows.push(`| ${row.component} | ${row.weight} | ${row.value} | ${row.sharePct}% |`);
  }
  rows.push(`| **Total** | | | **${opp.score}/100** |`);
  return rows.join("\n");
}
