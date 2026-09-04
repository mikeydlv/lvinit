// ---------------------------------------------------------------------------
// ANALYSIS — turning claims into a prioritized, explained refresh list
//
// The pipeline, in order:
//
//   1. extract claims from every in-scope page              (claims.mjs)
//   2. run the Fair Housing filter over ALL published prose (compliance queue)
//   3. score risk and staleness, independently              (risk / freshness)
//   4. find the source the page already cites for the claim (sources.mjs)
//   5. rank on a provisional priority
//   6. verify the top of that list against real sources     (verify.mjs)
//   7. re-rank with the verification result folded in
//   8. decide a recommended action and a confidence level
//   9. assign stable IDs, and carry forward identity from earlier reports
//
// Hard rules this module enforces:
//
//   * It NEVER edits, publishes, or hands anything off. Every finding carries a
//     handoff envelope with `authorized: false`; execution belongs to
//     lvinit-content-publisher, and only after Mikey approves a specific ID.
//   * A detected claim is a QUESTION. Only verify.mjs can answer it, and only
//     with an external source. Nothing here promotes analysis to evidence.
//   * No quota. If two claims clear the bar, the report has two findings.
//   * Fair Housing matters are routed to a separate compliance queue with no
//     automated recommendation, because the right response is a human decision
//     about advertising law, not a freshness update.
// ---------------------------------------------------------------------------

import { checkFairHousing } from "../../gsc/lib/fair-housing.mjs";

import { extractClaims, splitSentences } from "./claims.mjs";
import { scoreRisk } from "./risk.mjs";
import { scoreFreshness } from "./freshness.mjs";
import { supportingSourceFor } from "./sources.mjs";
import { extractYears } from "./dates.mjs";
import { GROUP_LABELS } from "./categories.mjs";

/** Every recommended action this agent is allowed to produce. */
export const RECOMMENDED_ACTIONS = [
  "update-factual-claim",
  "update-source-citation",
  "remove-unsupported-specificity",
  "clarify-uncertainty",
  "monitor-only",
  "no-change-needed",
  "manual-review-required",
];

export const ACTION_LABELS = {
  "update-factual-claim": "Update the factual claim",
  "update-source-citation": "Update the source or add one",
  "remove-unsupported-specificity": "Remove specificity the evidence does not support",
  "clarify-uncertainty": "Clarify the uncertainty in the copy",
  "monitor-only": "Monitor only — no action yet",
  "no-change-needed": "No change needed",
  "manual-review-required": "Manual review required",
};

const round = (n, places = 3) => (Number.isFinite(n) ? Number(n.toFixed(places)) : null);

/** Stable, human-quotable id: FACT-2026-09-04-001 */
function makeIdFactory(reportDate) {
  let n = 0;
  return () => {
    n += 1;
    return `FACT-${reportDate}-${String(n).padStart(3, "0")}`;
  };
}

/** The handoff envelope. Never authorized automatically. */
function handoffFor(id, request) {
  return {
    agent: "lvinit-content-publisher",
    authorized: false,
    approvalRequired: "Mikey",
    request,
    invoke: `Have the LVINIT Real Estate Content Publisher handle ${id}.`,
  };
}

/**
 * Priority = 100 x weighted(risk, staleness, verification) x trafficMultiplier.
 *
 * Risk and staleness stay separate judgements everywhere else; this is only how
 * the report is ordered.
 */
export function computePriority({ riskScore, stalenessScore, verificationResult, trafficMultiplier, config }) {
  const w = config.priority.weights;
  const severity = config.priority.verificationSeverity[verificationResult] ?? 0.4;
  // A claim an external source just confirmed HAS been checked, whatever the
  // page's own review stamp says. Ordering it as though nobody had looked would
  // put confirmed claims above contradicted ones.
  const effectiveStaleness =
    verificationResult === "confirms" ? stalenessScore * config.priority.confirmedStalenessFactor : stalenessScore;
  const blended = w.risk * riskScore + w.staleness * effectiveStaleness + w.verification * severity;
  const denominator = w.risk + w.staleness + w.verification;
  const base = denominator > 0 ? (100 * blended) / denominator : 0;
  return Math.min(100, Math.max(0, base * (trafficMultiplier ?? 1)));
}

/** Urgency band, with a deliberate cap for low-confidence findings. */
export function urgencyFor({ priority, confidence, config }) {
  const { now, soon, routine } = config.priority.urgency;
  let band = priority >= now ? "now" : priority >= soon ? "soon" : priority >= routine ? "routine" : "monitor";
  // The brief is explicit: do not automatically turn low-confidence items into
  // high-priority corrections. A weak signal can be worth looking at soon; it
  // is never worth dropping everything for.
  if (confidence === "low" && band === "now") band = "soon";
  return band;
}

/**
 * Decide what should actually happen to this claim.
 *
 * The table below is the whole decision. It is deliberately readable, because
 * "why does it want me to do that" has to have an answer.
 */
export function decideAction({ claim, risk, freshness, verification, supporting }) {
  const hasPreciseFigure = (claim.figures?.dollars?.length ?? 0) + (claim.figures?.percents?.length ?? 0) > 0;
  const unsourced = !supporting?.url;
  const thinSource = Boolean(supporting?.classification?.thin);
  const hardOverride = freshness.overrides.length > 0;

  // Arithmetic beats everything: a stated deadline that has passed is not
  // "possibly stale", it is over.
  if (hardOverride) {
    return {
      action: "update-factual-claim",
      because: freshness.overrides[0].explanation,
    };
  }

  const found = sentenceCase(verification.reason);

  switch (verification.result) {
    case "contradicts":
      // "Update the claim" requires a source that is ATTACHED to this claim —
      // a Development Watch entry's own `source`. Anything picked out of the
      // page's bibliography by topic is an inference, and a page usually cites
      // several sources: the figure may simply have come from a different one.
      // Recommending an edit on that basis would be overconfident, so it asks
      // for a person instead.
      if (supporting?.origin !== "attached to the claim") {
        return {
          action: "manual-review-required",
          because:
            `${found} Note that this source was matched to the claim by topic rather than attached to it explicitly, ` +
            "so the figure may simply have come from one of the page's other sources. Read it before changing anything.",
        };
      }
      return {
        action: "update-factual-claim",
        because: `The current source no longer supports what the page says. ${found}`,
      };
    // An absence is not a disagreement. Neither of these results says the page
    // is wrong, so neither of them recommends changing what it says — the most
    // either can justify is asking a person to read the source.
    case "partially-confirms":
    case "value-not-found":
      return hasPreciseFigure && thinSource
        ? {
            action: "remove-unsupported-specificity",
            because:
              `The page is more precise than its evidence supports. ${found} ` +
              "Softening the figure to what the source actually backs up is safer than restating a number nobody can find.",
          }
        : {
            action: "manual-review-required",
            because:
              `${found} This is an absence of evidence, not evidence the page is wrong, so nothing should change until ` +
              "someone has read the source.",
          };
    case "confirms":
      return {
        action: "no-change-needed",
        because: `${found} Re-checked on this run, so the review clock restarts.`,
      };
    case "source-unreachable":
      return {
        action: "update-source-citation",
        because: `The claim may still be right, but the page can no longer point a reader at anything. ${found}`,
      };
    case "manual-check-required":
      return { action: "manual-review-required", because: found };
    case "cannot-verify":
      return risk.level === "high"
        ? { action: "manual-review-required", because: `A high-risk claim that could not be checked automatically. ${found}` }
        : { action: "monitor-only", because: found };
    default:
      break;
  }

  // Nothing was verified this run.
  if (unsourced && hasPreciseFigure) {
    return {
      action: "update-source-citation",
      because:
        "This sentence states a specific figure and the page cites nothing for it. Either attach the source it came from, or soften the figure to what can be supported.",
    };
  }
  if (risk.level === "high") {
    return {
      action: "manual-review-required",
      because: `A ${risk.level}-risk claim that is ${freshness.isOverdue ? "past its review cadence" : "approaching its review cadence"} and has not been checked against a source on this run.`,
    };
  }
  if (freshness.score >= 0.7) {
    return {
      action: "clarify-uncertainty",
      because:
        "The claim is well past its review cadence. If it cannot be re-sourced quickly, saying when it was true is more honest than leaving it undated.",
    };
  }
  return {
    action: "monitor-only",
    because: "Flagged so it is on the list, but nothing here suggests it is wrong yet.",
  };
}

/** Confidence in the FINDING, not in the claim. */
export function confidenceFor({ risk, freshness, verification }) {
  const caveats = [];

  if (freshness.overrides.length) {
    return {
      level: "high",
      caveats,
      because: "The date arithmetic is not an inference — the copy names a date that has passed.",
    };
  }
  if (verification.result === "contradicts" && verification.confidence === "high") {
    return { level: "high", caveats, because: "A current authoritative source clearly supersedes what the page says." };
  }
  if (["contradicts", "partially-confirms", "value-not-found", "confirms"].includes(verification.result)) {
    caveats.push(
      "the check compared the figures on the page against the text of the cited source; it is evidence, not a human reading of that source"
    );
    if (verification.result === "value-not-found" || verification.result === "partially-confirms") {
      caveats.push(
        "the source does not state a different figure — this is an absence, which is much weaker than a disagreement"
      );
    }
    return { level: "medium", caveats, because: "An external source was fetched and compared against the page." };
  }
  if (verification.result === "not-attempted" && freshness.isOverdue && freshness.score >= 0.7) {
    caveats.push("no external source was checked on this run — this rests on the review cadence alone");
    return {
      level: "medium",
      caveats,
      because: "The claim is well past the cadence for how fast this kind of fact moves, which is a strong reason to look, not proof of an error.",
    };
  }
  caveats.push("detected by analysis only — no external source has confirmed or contradicted it");
  if (risk.level === "high") caveats.push("treated as worth a human look because of the consequence, not because of the evidence");
  return { level: "low", caveats, because: "A potential issue was detected but could not be verified strongly." };
}

/**
 * The Fair Housing pass.
 *
 * Runs the GSC agent's compliance module — one rule list for the whole
 * repository, so the two agents can never drift apart on what is blocked — over
 * every sentence of published prose.
 *
 * These are CANDIDATES FOR A HUMAN READ, not violations, and the report says so.
 * Grouped per page and per rule so one page mentioning "families" eight times
 * is one queue item, not eight.
 */
export function complianceScan({ pages, config }) {
  const grouped = new Map();
  for (const page of pages) {
    for (const document of page.documents) {
      for (const block of document.blocks) {
        for (const sentence of splitSentences(block.text)) {
          const verdict = checkFairHousing(sentence);
          if (!verdict.blocked) continue;
          const key = `${page.route}|${verdict.category}`;
          const existing = grouped.get(key);
          if (existing) {
            existing.occurrences += 1;
            if (existing.examples.length < 3) {
              existing.examples.push({ text: sentence, file: document.file, line: block.line, matched: verdict.matched });
            }
            continue;
          }
          grouped.set(key, {
            route: page.route,
            pageTitle: page.title,
            rule: verdict.category,
            reason: verdict.reason,
            occurrences: 1,
            examples: [{ text: sentence, file: document.file, line: block.line, matched: verdict.matched }],
            recommendedAction: "manual-review-required",
            note:
              "Flagged for a human compliance read, not changed and not scored. Many of these will be innocuous in context — the point is that a person decides, not this agent.",
          });
        }
      }
    }
  }
  return [...grouped.values()]
    .sort((a, b) => b.occurrences - a.occurrences || a.route.localeCompare(b.route))
    .slice(0, config.output.maxComplianceListed * 3);
}

/**
 * Pages whose title or URL carries an explicit year.
 *
 * The brief is careful here and so is this: an old year is NOT automatically a
 * reason to rewrite. A dated market report is a record of a month and should
 * stay one. An evergreen guide with a year in its title is a different case.
 * The agent states which shape it thinks the page is and hands the judgement
 * over; it never asserts the title should change.
 */
export function assessYearLabelledPages({ pages, findings, today }) {
  const currentYear = Number(today.slice(0, 4));
  const out = [];
  for (const page of pages) {
    const years = [...new Set([...extractYears(page.route), ...extractYears(page.title ?? "")])];
    if (years.length === 0) continue;
    const newest = Math.max(...years);
    const datedRecord = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/i.test(
      `${page.title ?? ""} ${page.route}`
    );
    const pageFindings = findings.filter((f) => f.route === page.route);
    const highRisk = pageFindings.filter((f) => f.risk.level === "high").length;

    let shape;
    let guidance;
    if (datedRecord) {
      shape = "dated record";
      guidance =
        "This piece is a record of a specific month. Its year is part of what it is, and it should NOT be rewritten to a newer year. If the underlying data has moved, the honest answer is a new companion piece, not an edited old one.";
    } else if (newest >= currentYear) {
      shape = "current-year evergreen";
      guidance =
        "The year in the title is the current one, so nothing is out of date on that count. Review it again when the underlying program or figure data changes, not on the calendar.";
    } else {
      shape = "past-year evergreen";
      guidance =
        `The title carries ${newest}, which is now behind us, and this reads as an evergreen guide rather than a record of that year. That is a judgement call for a person: a factual refresh, a title refresh, restructuring it as evergreen, or genuinely no change. ` +
        (highRisk > 0
          ? `${highRisk} high-risk claim${highRisk === 1 ? "" : "s"} on this page ${highRisk === 1 ? "was" : "were"} flagged below, which is the more useful place to start.`
          : "No high-risk claims were flagged on it, so there may be nothing to do beyond the title.");
    }

    out.push({
      route: page.route,
      title: page.title,
      yearsInTitleOrUrl: years.sort(),
      shape,
      guidance,
      flaggedClaims: pageFindings.length,
      highRiskClaims: highRisk,
      recommendedAction: shape === "past-year evergreen" ? "manual-review-required" : "no-change-needed",
    });
  }
  return out.sort((a, b) => a.route.localeCompare(b.route));
}

/** Read earlier reports so a claim keeps its identity across weeks. */
export function buildHistory(previousReports) {
  const byFingerprint = new Map();
  for (const report of previousReports) {
    for (const finding of report.findings ?? []) {
      const key = finding.fingerprint;
      if (!key) continue;
      const existing = byFingerprint.get(key);
      if (!existing) {
        byFingerprint.set(key, {
          firstSeen: report.reportDate,
          firstId: finding.id,
          lastSeen: report.reportDate,
          lastId: finding.id,
          timesReported: 1,
          previousIds: [finding.id],
        });
        continue;
      }
      existing.timesReported += 1;
      if (report.reportDate < existing.firstSeen) {
        existing.firstSeen = report.reportDate;
        existing.firstId = finding.id;
      }
      if (report.reportDate >= existing.lastSeen) {
        existing.lastSeen = report.reportDate;
        existing.lastId = finding.id;
      }
      if (!existing.previousIds.includes(finding.id)) existing.previousIds.push(finding.id);
    }
  }
  return byFingerprint;
}

/**
 * Main entry point.
 *
 * @param {object} input
 * @param {object} input.inventory   from buildContentInventory()
 * @param {object} input.config
 * @param {string} input.reportDate  YYYY-MM-DD
 * @param {object} input.gscSignal   from loadGscSignal()
 * @param {object} input.verifier    from createVerifier()
 * @param {Array}  [input.previousReports]
 */
export async function analyze({ inventory, config, reportDate, gscSignal, verifier, previousReports = [] }) {
  const notes = [];
  const history = buildHistory(previousReports);

  // --- 1. Claims -----------------------------------------------------------
  const candidates = [];
  const pageSummaries = [];
  let claimsReviewed = 0;
  let fairHousingGated = 0;
  const buckets = { claim: 0, opinion: 0, historical: 0, durable: 0, "not-a-claim": 0 };

  for (const page of inventory.pages) {
    const { claims, reviewed, buckets: pageBuckets } = extractClaims({ page, config, today: reportDate });
    claimsReviewed += reviewed;
    for (const [key, value] of Object.entries(pageBuckets)) buckets[key] += value;

    if (!page.lastReviewed.date) {
      notes.push(
        `No check date could be established for ${page.route}. Its claims are reported without a staleness measurement — add a "Checked <date>" stamp or a dateModified so the cadence has something to measure against.`
      );
    }

    const scored = [];
    for (const claim of claims) {
      // FAIR HOUSING GATE. A sentence that trips the compliance filter is
      // routed to the compliance queue and NOWHERE else. It never becomes an
      // ordinary freshness finding, because the recommended action would then
      // be "update this claim" on protected-class language — and the correct
      // response to that is a human decision about advertising law, not a
      // refreshed figure. The sentence is still surfaced; just in the right
      // place, with no automated recommendation attached.
      if (checkFairHousing(claim.text).blocked) {
        fairHousingGated += 1;
        continue;
      }

      const risk = scoreRisk({ claim, config });
      const freshness = scoreFreshness({ claim, page, config, today: reportDate });
      const supporting = supportingSourceFor(claim, page, config);
      const traffic = gscSignal.multiplierFor(page.route);
      const provisionalPriority = computePriority({
        riskScore: risk.score,
        stalenessScore: freshness.score,
        verificationResult: "not-attempted",
        trafficMultiplier: traffic.value,
        config,
      });
      scored.push({ claim, page, risk, freshness, supporting, traffic, provisionalPriority });
    }

    // Per-page cap, weakest dropped first, so one very long guide cannot flood
    // the run before verification even starts.
    scored.sort((a, b) => b.provisionalPriority - a.provisionalPriority);
    const kept = scored.slice(0, config.claims.maxClaimsPerPage);
    if (scored.length > kept.length) {
      notes.push(
        `${page.route}: ${scored.length - kept.length} lower-priority claims were dropped by the per-page cap of ${config.claims.maxClaimsPerPage}.`
      );
    }
    candidates.push(...kept);

    pageSummaries.push({
      route: page.route,
      title: page.title,
      section: page.section,
      category: page.category,
      file: page.file,
      lastReviewed: page.lastReviewed.date,
      lastReviewedBasis: page.lastReviewed.basis,
      daysSinceReviewed: page.daysSinceReviewed,
      claimsReviewed: reviewed,
      claimsDetected: claims.length,
      declaredSources: page.declaredSources.length,
      developmentProjects: page.developmentProjects.length,
      traffic: gscSignal.multiplierFor(page.route),
    });
  }

  // --- 2. Rank, then verify the top of the list ----------------------------
  candidates.sort((a, b) => b.provisionalPriority - a.provisionalPriority || a.claim.fingerprint.localeCompare(b.claim.fingerprint));

  const findings = [];
  for (const candidate of candidates) {
    const { claim, page, risk, freshness, supporting, traffic, provisionalPriority } = candidate;

    const verification = await verifier.verifyClaim({
      claim,
      supporting,
      priority: provisionalPriority,
    });

    const priority = computePriority({
      riskScore: risk.score,
      stalenessScore: freshness.score,
      verificationResult: verification.result,
      trafficMultiplier: traffic.value,
      config,
    });

    const confidence = confidenceFor({ risk, freshness, verification });
    const { action, because } = decideAction({ claim, risk, freshness, verification, supporting });
    const urgency = urgencyFor({ priority: Math.round(priority), confidence: confidence.level, config });

    findings.push({
      fingerprint: claim.fingerprint,
      route: page.route,
      pageTitle: page.title,
      file: claim.file,
      line: claim.line,
      documentRole: claim.documentRole,
      heading: claim.heading,
      origin: claim.origin,
      claim: claim.text,
      context: claim.context,
      currentPublishedValue: describeCurrentValue(claim),
      category: {
        key: claim.category.key,
        label: claim.category.label,
        group: claim.category.group,
        groupLabel: GROUP_LABELS[claim.category.group],
        dynamism: claim.category.dynamism,
        why: claim.category.why,
      },
      secondaryCategories: claim.secondaryCategories,
      jurisdiction: claim.jurisdiction,
      structured: claim.structured,
      risk,
      freshness,
      supportingSource: supporting
        ? {
            label: supporting.label,
            url: supporting.url,
            used: supporting.used ?? null,
            origin: supporting.origin,
            type: supporting.classification.label,
            tier: supporting.classification.tier,
            tierRank: supporting.classification.rank,
            thinlySourced: supporting.classification.thin,
          }
        : null,
      verification: {
        result: verification.result,
        marker: verification.marker,
        reason: verification.reason,
        evidence: verification.evidence,
        // Non-empty ONLY when the source explicitly states a different value.
        // Its emptiness is what distinguishes an absence from a disagreement,
        // so it is carried into the JSON contract rather than left implicit.
        conflicts: verification.conflicts ?? [],
        // `contradicts` is now only ever produced by an explicit conflicting
        // value or an explicitly different project stage, so the result itself
        // is the flag.
        explicitContradiction: verification.result === "contradicts",
        source: verification.record,
      },
      priority: Math.round(priority),
      priorityInputs: {
        risk: risk.score,
        staleness: freshness.score,
        verificationSeverity: config.priority.verificationSeverity[verification.result] ?? 0.4,
        trafficMultiplier: traffic.value,
        trafficBasis: traffic.basis,
        weights: config.priority.weights,
      },
      urgency,
      confidence,
      recommendedAction: action,
      recommendedActionLabel: ACTION_LABELS[action],
      recommendedActionReason: because,
      whyFlagged: buildWhyFlagged({ claim, risk, freshness, verification }),
      history: history.get(claim.fingerprint) ?? null,
    });
  }

  // --- 3. Final ordering, threshold, cap, and IDs --------------------------
  findings.sort(
    (a, b) =>
      b.priority - a.priority ||
      riskRank(a.risk.level) - riskRank(b.risk.level) ||
      a.fingerprint.localeCompare(b.fingerprint)
  );

  // A claim an external source just confirmed is not a refresh. It is proof of
  // work done, and it belongs in its own section rather than competing for
  // space with the claims that actually need attention.
  const confirmed = findings.filter((f) => f.verification.result === "confirms");
  const needingAttention = findings.filter((f) => f.verification.result !== "confirms");

  const belowThreshold = needingAttention.filter((f) => f.priority < config.output.minPriority).length;
  const reported = needingAttention
    .filter((f) => f.priority >= config.output.minPriority)
    .slice(0, config.output.maxFindings);

  const nextId = makeIdFactory(reportDate);
  for (const finding of [...reported, ...confirmed]) {
    finding.id = nextId();
    finding.handoff = handoffFor(
      finding.id,
      `${finding.recommendedAction} on ${finding.route} (${finding.file}:${finding.line}) — ${finding.category.label}`
    );
    finding.provenance = {
      detected: ["claim", "context", "category", "figures", "line"],
      calculated: ["risk", "freshness", "priority", "priorityInputs"],
      externalEvidence: ["verification", "supportingSource"],
      interpretation: ["whyFlagged", "confidence"],
      recommendation: ["recommendedAction", "recommendedActionReason", "handoff"],
    };
  }

  const compliance = complianceScan({ pages: inventory.pages, config });
  const yearLabelled = assessYearLabelledPages({ pages: inventory.pages, findings: reported, today: reportDate });

  const routesWithFindings = new Set(reported.map((f) => f.route));
  const cleanPages = pageSummaries.filter((p) => !routesWithFindings.has(p.route));

  if (!gscSignal.available) notes.push(`GSC traffic signal: ${gscSignal.reason}.`);
  if (gscSignal.fixtureData) {
    notes.push("The GSC report used for traffic weighting was itself fixture data, so the traffic multipliers are synthetic.");
  }
  if (fairHousingGated > 0) {
    notes.push(
      `${fairHousingGated} detected claim${fairHousingGated === 1 ? " was" : "s were"} withheld from the findings ` +
        "list because the sentence trips the Fair Housing filter. They appear in the compliance queue instead, with " +
        "no automated recommendation attached — the right response to protected-class language is a human decision " +
        "about advertising law, not a refreshed figure."
    );
  }
  if (!config.verification.enabled) {
    notes.push(
      "External verification was not enabled for this run (`--verify`). Every finding below is detection only — none of it has been checked against a source."
    );
  }

  return {
    reportDate,
    totals: {
      pagesInScope: inventory.pages.length,
      pagesSkipped: inventory.skipped.length,
      claimsReviewed,
      claimsDetected: candidates.length,
      findingsReported: reported.length,
      findingsBelowThreshold: belowThreshold,
      confirmedStillStanding: confirmed.length,
      high: reported.filter((f) => f.risk.level === "high").length,
      medium: reported.filter((f) => f.risk.level === "medium").length,
      low: reported.filter((f) => f.risk.level === "low").length,
      pagesRequiringReview: routesWithFindings.size,
      pagesWithNoDetectedIssues: cleanPages.length,
      sentenceBuckets: buckets,
      fairHousingGated,
    },
    findings: reported,
    confirmed,
    pages: pageSummaries,
    cleanPages,
    skipped: inventory.skipped,
    compliance,
    yearLabelled,
    gscSignal: {
      available: gscSignal.available,
      reason: gscSignal.reason,
      reportPath: gscSignal.reportPath,
      reportDate: gscSignal.reportDate,
      ageDays: gscSignal.ageDays,
      fixtureData: gscSignal.fixtureData,
    },
    verificationStats: verifier.stats,
    notes,
  };
}

const riskRank = (level) => ({ high: 0, medium: 1, low: 2 }[level] ?? 3);

/**
 * Capitalize a fragment being spliced into the middle of a sentence. The
 * verification reasons are written to read as clauses ("none of the figures
 * appear…"), which is right where they are quoted on their own and wrong when
 * they follow a full stop.
 */
export function sentenceCase(text) {
  const value = String(text ?? "").trim();
  if (!value) return "";
  return value[0].toUpperCase() + value.slice(1);
}

/** What the page currently says, isolated from the sentence around it. */
function describeCurrentValue(claim) {
  if (claim.structured?.kind === "development-project") {
    return `${claim.structured.name} — status "${claim.structured.status}"`;
  }
  if (claim.structured?.kind === "data-row") {
    return `${claim.structured.subject} = ${claim.structured.value} (${claim.structured.note})`;
  }
  const parts = [
    ...(claim.figures?.dollars ?? []),
    ...(claim.figures?.percents ?? []),
    ...(claim.figures?.dates ?? []).map((d) => d.text),
  ];
  return parts.length ? parts.join(" · ") : "no isolated figure — the whole sentence is the claim";
}

/** Plain-English "why is this on my list". */
function buildWhyFlagged({ claim, risk, freshness, verification }) {
  const parts = [risk.rationale, freshness.explanation];
  if (verification.result !== "not-attempted") {
    parts.push(`Checked against the cited source: ${verification.reason}`);
  }
  if (!claim.signals?.selfDated && (claim.figures?.dollars?.length || claim.figures?.percents?.length)) {
    parts.push("The figure is stated without a date attached, so a reader has no way to judge how current it is.");
  }
  return parts.filter(Boolean).join(" ");
}

export { round };
