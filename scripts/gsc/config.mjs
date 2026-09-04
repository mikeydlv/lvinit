// ---------------------------------------------------------------------------
// LVINIT GSC OPPORTUNITY AGENT — CONFIGURATION
//
// Every tunable number the agent uses lives here. Nothing else in the agent
// should hardcode a date, a threshold, or a weight. Change a value here and the
// whole pipeline (detection, scoring, reporting) follows.
//
// Overrides, in increasing order of precedence:
//   1. the defaults below
//   2. environment variables (GSC_PERIOD_DAYS, GSC_LAG_DAYS, ...)
//   3. CLI flags (--period-days=28, --lag-days=3, ...)
//
// See docs/GSC_OPPORTUNITY_AGENT.md for what each group means in plain English.
// ---------------------------------------------------------------------------

/** Read an integer env var, falling back when unset/blank/unparseable. */
function envInt(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
  const n = Number.parseInt(String(raw), 10);
  return Number.isFinite(n) ? n : fallback;
}

/** Read a float env var, falling back when unset/blank/unparseable. */
function envFloat(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
  const n = Number.parseFloat(String(raw));
  return Number.isFinite(n) ? n : fallback;
}

export const DEFAULT_CONFIG = {
  // -------------------------------------------------------------------------
  // Site + API
  // -------------------------------------------------------------------------
  site: {
    /**
     * The Search Console property, exactly as GSC names it. Two valid shapes:
     *   domain property : "sc-domain:lvinit.com"
     *   URL prefix      : "https://www.lvinit.com/"
     * Set via GSC_SITE_URL. There is no safe default — a wrong value returns
     * 403, so the agent refuses to guess.
     */
    siteUrl: process.env.GSC_SITE_URL || "",
    /** Canonical public origin, used to turn GSC page URLs into local routes. */
    origin: process.env.GSC_SITE_ORIGIN || "https://www.lvinit.com",
    /** GSC searchType. "web" is the only one this agent interprets. */
    searchType: "web",
    /**
     * Only ask Google for finalized rows. This is the API's own guarantee that
     * the numbers will not be revised under us; the lag buffer below is a
     * second, independent belt.
     */
    dataState: "final",
    /** Max rows per API page (Google's ceiling is 25000). */
    rowLimit: envInt("GSC_ROW_LIMIT", 5000),
    /** Hard cap on pages fetched per dimension set, so a bad config cannot loop. */
    maxPages: envInt("GSC_MAX_PAGES", 5),
  },

  // -------------------------------------------------------------------------
  // Time windows
  // -------------------------------------------------------------------------
  windows: {
    /**
     * Days of Search Console reporting lag to skip before the window ends.
     * Google documents Search Analytics data as typically finalized about two
     * days back, occasionally later. 3 is a deliberately conservative default
     * and is configurable rather than scattered through the code.
     */
    lagDays: envInt("GSC_LAG_DAYS", 3),
    /** Length of the current window, in complete days. */
    periodDays: envInt("GSC_PERIOD_DAYS", 28),
    /**
     * Length of the comparison window. Null means "same length as the current
     * window", placed immediately before it.
     */
    comparisonDays: envInt("GSC_COMPARISON_DAYS", 0) || null,
    /** Shorter secondary window used for the "recent trend" context block. */
    shortTrendDays: envInt("GSC_SHORT_TREND_DAYS", 7),
  },

  // -------------------------------------------------------------------------
  // Detection thresholds
  //
  // LVINIT is a young site. These are set low on purpose so real early signal
  // survives, and every one is overridable.
  // -------------------------------------------------------------------------
  thresholds: {
    /** Floor for a query/page to be considered at all in the current window. */
    minImpressions: envInt("GSC_MIN_IMPRESSIONS", 15),

    quickWin: {
      /** Ignore anything already this good — there is little upside left. */
      bestPosition: envFloat("GSC_QUICKWIN_BEST_POSITION", 3.5),
      /** Ignore anything this far back — improvement is not realistic yet. */
      worstPosition: envFloat("GSC_QUICKWIN_WORST_POSITION", 20),
      minImpressions: envInt("GSC_QUICKWIN_MIN_IMPRESSIONS", 20),
    },

    ctr: {
      minImpressions: envInt("GSC_CTR_MIN_IMPRESSIONS", 40),
      /**
       * A row is a CTR opportunity when its CTR is at or below this fraction of
       * LVINIT's OWN median CTR for the same position band. No external or
       * industry CTR benchmark is used anywhere in this agent.
       */
      shortfallRatio: envFloat("GSC_CTR_SHORTFALL_RATIO", 0.5),
      /**
       * A position band needs at least this many qualifying LVINIT rows before
       * its baseline is trusted. Below it, the baseline is reported as
       * "insufficient" and no CTR opportunity is raised from that band.
       */
      minBaselineRows: envInt("GSC_CTR_MIN_BASELINE_ROWS", 5),
      /** Position bands used to build LVINIT's internal CTR baseline. */
      bands: [
        { key: "1-3", min: 0, max: 3 },
        { key: "4-6", min: 3, max: 6 },
        { key: "7-10", min: 6, max: 10 },
        { key: "11-20", min: 10, max: 20 },
        { key: "21+", min: 20, max: Infinity },
      ],
    },

    emerging: {
      minImpressions: envInt("GSC_EMERGING_MIN_IMPRESSIONS", 15),
      /** At or below this many impressions last period counts as "new". */
      previousMaxForNew: envInt("GSC_EMERGING_PREV_MAX", 2),
      /** Fractional impression growth that counts as "meaningfully growing". */
      growthRatio: envFloat("GSC_EMERGING_GROWTH_RATIO", 0.5),
      /** ...but only if the absolute gain is at least this many impressions. */
      minAbsoluteGain: envInt("GSC_EMERGING_MIN_GAIN", 10),
    },

    momentum: {
      minImpressions: envInt("GSC_MOMENTUM_MIN_IMPRESSIONS", 25),
      /** Click change (either direction) that counts on its own. */
      minClickDelta: envInt("GSC_MOMENTUM_MIN_CLICK_DELTA", 3),
      /** Impression change ratio that counts on its own. */
      impressionRatio: envFloat("GSC_MOMENTUM_IMPRESSION_RATIO", 0.3),
      /** Average-position change (in positions) that counts on its own. */
      minPositionDelta: envFloat("GSC_MOMENTUM_MIN_POSITION_DELTA", 2),
    },

    contentGap: {
      minImpressions: envInt("GSC_GAP_MIN_IMPRESSIONS", 25),
      /**
       * If some LVINIT page is already ranking this well for the query, Google
       * evidently thinks it answers it — so it is not a content gap, whatever
       * the topical match says.
       */
      answeredPositionCeiling: envFloat("GSC_GAP_ANSWERED_POSITION", 3),
      /**
       * Topical match (0-1) between the query and the ranking page's
       * route/title. At or below this, the ranking page is treated as an
       * accidental match rather than a real answer.
       */
      maxTopicalMatch: envFloat("GSC_GAP_MAX_TOPICAL_MATCH", 0.34),
    },

    mismatch: {
      minImpressions: envInt("GSC_MISMATCH_MIN_IMPRESSIONS", 20),
      /**
       * Another existing LVINIT page must beat the ranking page's topical match
       * by at least this much before a mismatch is claimed.
       */
      minMatchAdvantage: envFloat("GSC_MISMATCH_MIN_ADVANTAGE", 0.2),
      /**
       * ...and that other page must actually be a good answer in its own right.
       * Without this floor, "a slightly less bad page exists" reads as a
       * mismatch when the truth is that nothing on the site answers the query.
       */
      minAlternativeMatch: envFloat("GSC_MISMATCH_MIN_ALTERNATIVE_MATCH", 0.5),
    },

    cannibalization: {
      /** Each competing URL must clear this on its own. */
      minImpressionsPerUrl: envInt("GSC_CANNIBAL_MIN_IMPRESSIONS", 10),
      /** Only consider URLs actually visible enough to interfere. */
      maxPosition: envFloat("GSC_CANNIBAL_MAX_POSITION", 30),
      /** Competing URLs must be within this many positions of each other. */
      positionProximity: envFloat("GSC_CANNIBAL_POSITION_PROXIMITY", 12),
    },

    internalLinks: {
      minImpressions: envInt("GSC_LINKS_MIN_IMPRESSIONS", 25),
      /** Pages already top-3 rarely need an internal-link nudge. */
      bestPosition: envFloat("GSC_LINKS_BEST_POSITION", 3.5),
      worstPosition: envFloat("GSC_LINKS_WORST_POSITION", 25),
      /** Minimum topical relatedness between two routes to suggest a link. */
      minRelatedness: envFloat("GSC_LINKS_MIN_RELATEDNESS", 0.25),
      /** Never suggest more than this many source pages for one target. */
      maxSuggestionsPerTarget: envInt("GSC_LINKS_MAX_SOURCES", 3),
    },
  },

  // -------------------------------------------------------------------------
  // Scoring
  //
  // Every opportunity gets a 0-100 score: a weighted average of normalized
  // components. Weights differ per opportunity type because "what makes this
  // worth doing" genuinely differs. See lib/score.mjs for the maths and
  // docs/GSC_OPPORTUNITY_AGENT.md for the plain-English version.
  // -------------------------------------------------------------------------
  scoring: {
    /**
     * Impressions that count as a "full-size" opportunity for this site. Used
     * as the saturation point of a log curve, NOT as a minimum.
     */
    impressionReference: envInt("GSC_SCORE_IMPRESSION_REFERENCE", 400),
    /** Position where realistic upside peaks (page-2-ish, climbable). */
    positionSweetSpot: envFloat("GSC_SCORE_POSITION_SWEET_SPOT", 11),
    /** Beyond this position, upside is discounted as unrealistic for now. */
    positionHorizon: envFloat("GSC_SCORE_POSITION_HORIZON", 45),
    /** Trend delta (as a ratio) that saturates the momentum component. */
    trendSaturation: envFloat("GSC_SCORE_TREND_SATURATION", 1.0),

    /** Per-type component weights. Missing components score 0 and still count. */
    weights: {
      "quick-win":             { size: 3, positionPotential: 3, ctrGap: 1, momentum: 1, editorial: 2, intent: 1, actionability: 2 },
      "ctr-opportunity":       { size: 3, positionPotential: 1, ctrGap: 4, momentum: 1, editorial: 2, intent: 1, actionability: 2 },
      "emerging-query":        { size: 2, positionPotential: 2, ctrGap: 0, momentum: 4, editorial: 2, intent: 2, actionability: 1 },
      "page-gaining-momentum": { size: 2, positionPotential: 2, ctrGap: 1, momentum: 3, editorial: 2, intent: 1, actionability: 2 },
      "page-losing-momentum":  { size: 3, positionPotential: 1, ctrGap: 0, momentum: 4, editorial: 2, intent: 1, actionability: 2 },
      "content-gap":           { size: 3, positionPotential: 2, ctrGap: 0, momentum: 2, editorial: 3, intent: 3, actionability: 1 },
      "query-page-mismatch":   { size: 2, positionPotential: 3, ctrGap: 1, momentum: 1, editorial: 2, intent: 2, actionability: 2 },
      "cannibalization":       { size: 3, positionPotential: 2, ctrGap: 1, momentum: 1, editorial: 2, intent: 1, actionability: 2 },
      "internal-link":         { size: 2, positionPotential: 3, ctrGap: 1, momentum: 1, editorial: 2, intent: 1, actionability: 3 },
    },

    /** Confidence tiers, by current-window impressions on the row. */
    confidence: {
      highImpressions: envInt("GSC_CONFIDENCE_HIGH", 150),
      mediumImpressions: envInt("GSC_CONFIDENCE_MEDIUM", 40),
    },
  },

  // -------------------------------------------------------------------------
  // Output
  // -------------------------------------------------------------------------
  output: {
    /** Directory for generated reports. Gitignored — the agent never commits. */
    dir: process.env.GSC_OUTPUT_DIR || "reports/gsc",
    /** How many opportunities to carry into the report at all. */
    maxOpportunities: envInt("GSC_MAX_OPPORTUNITIES", 15),
    /**
     * How many findings of any ONE type can appear. Without this, a good week
     * for quick wins buries the single page that is losing ground — and the
     * page losing ground is the thing you actually needed to see.
     */
    maxPerType: envInt("GSC_MAX_PER_TYPE", 3),
    /** How many make the executive summary at the top. */
    maxExecutiveSummary: envInt("GSC_MAX_EXEC_SUMMARY", 5),
    /**
     * Minimum score for an opportunity to be reported. Deliberately keeps the
     * report short: five strong findings beat twenty weak ones.
     */
    minScore: envFloat("GSC_MIN_SCORE", 40),
    /**
     * Below this many total current-window impressions, the whole report is
     * flagged as too thin to draw conclusions from.
     */
    lowVolumeTotalImpressions: envInt("GSC_LOW_VOLUME_IMPRESSIONS", 200),
    /** Cap on the Fair Housing exclusions appendix. */
    maxExcludedListed: envInt("GSC_MAX_EXCLUDED_LISTED", 15),
  },
};

/** Deep-merge plain objects (arrays and non-objects are replaced wholesale). */
function merge(base, override) {
  if (!override) return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    const prev = out[key];
    const bothPlain =
      prev && value && typeof prev === "object" && typeof value === "object" &&
      !Array.isArray(prev) && !Array.isArray(value);
    out[key] = bothPlain ? merge(prev, value) : value;
  }
  return out;
}

/** Build the effective config: defaults (env already folded in), then overrides. */
export function loadConfig(overrides = {}) {
  return merge(DEFAULT_CONFIG, overrides);
}
