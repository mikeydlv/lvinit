// ---------------------------------------------------------------------------
// LVINIT CONTENT BRIEF GENERATOR — CONFIGURATION
//
// Every tunable number the agent uses lives here. Nothing else in the agent
// should hardcode a threshold, a weight, a cap, or a cadence.
//
// Overrides, in increasing order of precedence:
//   1. the defaults below
//   2. environment variables (BRIEFS_MIN_SCORE, ...)
//   3. CLI flags (--min-score=60, ...)
//
// This mirrors scripts/gsc/config.mjs, scripts/fact-decay/config.mjs and
// scripts/internal-links/config.mjs on purpose: one configuration philosophy
// across every LVINIT agent.
//
// See docs/CONTENT_BRIEF_GENERATOR.md for what each group means in plain English.
// ---------------------------------------------------------------------------

function envInt(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
  const n = Number.parseInt(String(raw), 10);
  return Number.isFinite(n) ? n : fallback;
}

function envFloat(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
  const n = Number.parseFloat(String(raw));
  return Number.isFinite(n) ? n : fallback;
}

function envBool(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
  return /^(1|true|yes|on)$/i.test(String(raw).trim());
}

export const ACTIONS = {
  UPDATE_EXISTING: "UPDATE_EXISTING",
  EXPAND_EXISTING: "EXPAND_EXISTING",
  NEW_ARTICLE: "NEW_ARTICLE",
  NEW_COMPARISON: "NEW_COMPARISON",
  INTERNAL_LINK_ONLY: "INTERNAL_LINK_ONLY",
  MONITOR_ONLY: "MONITOR_ONLY",
  REJECT_DUPLICATE: "REJECT_DUPLICATE",
  REJECT_LOW_VALUE: "REJECT_LOW_VALUE",
};

/** Actions that produce a full, Publisher-ready brief. */
export const BRIEF_ACTIONS = new Set([
  ACTIONS.UPDATE_EXISTING,
  ACTIONS.EXPAND_EXISTING,
  ACTIONS.NEW_ARTICLE,
  ACTIONS.NEW_COMPARISON,
]);

export const NEW_ACTIONS = new Set([ACTIONS.NEW_ARTICLE, ACTIONS.NEW_COMPARISON]);
export const UPDATE_ACTIONS = new Set([ACTIONS.UPDATE_EXISTING, ACTIONS.EXPAND_EXISTING]);

export const DEFAULT_CONFIG = {
  // -------------------------------------------------------------------------
  // Inputs — every one read off disk, read-only. Only GSC is required for a
  // brief to exist; the other two only enrich.
  // -------------------------------------------------------------------------
  inputs: {
    gscDir: process.env.BRIEFS_GSC_DIR || "reports/gsc",
    /**
     * Weekly cadence: Monday's GSC report is one day old on Tuesday. Eight days
     * tolerates one delayed run; anything older is stale search demand and the
     * run degrades to "no briefs" rather than briefing on last month's data.
     */
    gscMaxAgeDays: envInt("BRIEFS_GSC_MAX_AGE_DAYS", 10),
    factDecayDir: process.env.BRIEFS_FACT_DECAY_DIR || "reports/fact-decay",
    factDecayMaxAgeDays: envInt("BRIEFS_FACT_DECAY_MAX_AGE_DAYS", 14),
    /** Fact-Decay's own "act now" line, reused (scripts/internal-links/config.mjs). */
    factDecayUrgentPriority: envInt("BRIEFS_FACT_DECAY_URGENT_PRIORITY", 75),
    /** A HIGH-risk Fact-Decay finding at or above this priority is named in a brief. */
    factDecayNotePriority: envInt("BRIEFS_FACT_DECAY_NOTE_PRIORITY", 60),
    internalLinksDir: process.env.BRIEFS_INTERNAL_LINKS_DIR || "reports/internal-links",
    internalLinksMaxAgeDays: envInt("BRIEFS_INTERNAL_LINKS_MAX_AGE_DAYS", 14),
    /**
     * Where earlier Brief Generator reports are read from, for week-to-week
     * identity. In CI the workflow downloads earlier artifacts HERE — never into
     * the output directory, or each artifact would nest every earlier one.
     */
    historyDirs: (process.env.BRIEFS_HISTORY_DIRS || "reports/content-briefs,reports/content-briefs-history")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    /** How many earlier reports to read. */
    maxHistoryReports: envInt("BRIEFS_MAX_HISTORY", 12),
    /** Read `git log` for Publisher commit trailers (PUBLISHED status). */
    useGitLog: envBool("BRIEFS_USE_GIT", true),
  },

  // -------------------------------------------------------------------------
  // Content inventory. Page discovery is the Internal Linking Agent's graph,
  // so all four agents agree on what exists and what is published.
  // -------------------------------------------------------------------------
  inventory: {
    useGitDates: envBool("BRIEFS_USE_GIT_DATES", true),
    /** Body text is read up to this many words per page (dup detection only). */
    maxBodyWords: envInt("BRIEFS_MAX_BODY_WORDS", 6000),
  },

  // -------------------------------------------------------------------------
  // Demand thresholds. Counted on the INTENT GROUP (all grouped queries
  // together), current window, query dimension. Low on purpose: LVINIT is a
  // young site and small, real signals should stay visible.
  // -------------------------------------------------------------------------
  demand: {
    /** Below this, a group is not an opportunity at all (counted, not listed). */
    minGroupImpressions: envInt("BRIEFS_MIN_GROUP_IMPRESSIONS", 8),
    /** Minimum for any UPDATE/EXPAND brief. */
    minUpdateImpressions: envInt("BRIEFS_MIN_UPDATE_IMPRESSIONS", 15),
    /** Minimum for a NEW_ARTICLE / NEW_COMPARISON brief. New content costs more. */
    minNewImpressions: envInt("BRIEFS_MIN_NEW_IMPRESSIONS", 25),
    /** A page already ranking this well for the intent is answering it. */
    answeredPosition: envFloat("BRIEFS_ANSWERED_POSITION", 3.5),
    /** At or below this CTR on page one, the result is not being chosen. */
    weakCtr: envFloat("BRIEFS_WEAK_CTR", 0.01),
    /** ...but only judged with at least this many impressions (the GSC CTR floor). */
    weakCtrMinImpressions: envInt("BRIEFS_WEAK_CTR_MIN_IMPRESSIONS", 40),
    /** Past this position the owning page is on page two or worse: worth sharpening. */
    updatePosition: envFloat("BRIEFS_UPDATE_POSITION", 10),
  },

  // -------------------------------------------------------------------------
  // Duplicate / cannibalization detection (0-1 overlap between an intent and
  // a page; see lib/coverage.mjs for how each is computed).
  // -------------------------------------------------------------------------
  overlap: {
    /** At or above: the page answers the same intent. */
    same: envFloat("BRIEFS_OVERLAP_SAME", 0.75),
    /** At or above: substantially overlapping — update/expand, never new. */
    substantial: envFloat("BRIEFS_OVERLAP_SUBSTANTIAL", 0.5),
    /** At or above: adjacent — link to it, differentiate from it. */
    adjacent: envFloat("BRIEFS_OVERLAP_ADJACENT", 0.25),
    /**
     * A verdict within this distance of a band edge is "ambiguous": the
     * classification stands, but confidence is capped and handoff is refused.
     */
    ambiguityMargin: envFloat("BRIEFS_OVERLAP_AMBIGUITY", 0.05),
    /**
     * Two pages only COMPETE (cannibalization) when their overlap is within this
     * margin. A page further ahead owns the intent; the rest are support.
     */
    dominanceMargin: envFloat("BRIEFS_OVERLAP_DOMINANCE", 0.15),
    /** A body facet counts as covered when its terms appear at least this often. */
    minBodyMentions: envInt("BRIEFS_MIN_BODY_MENTIONS", 2),
  },

  // -------------------------------------------------------------------------
  // Scoring. score = 100 × Σ(weight × component) ÷ Σ(weight). Demand is capped
  // at a minority share on purpose — raw impressions must not dominate.
  // -------------------------------------------------------------------------
  scoring: {
    impressionReference: envInt("BRIEFS_IMPRESSION_REFERENCE", 150),
    positionSweetSpot: envFloat("BRIEFS_POSITION_SWEET_SPOT", 11),
    positionHorizon: envFloat("BRIEFS_POSITION_HORIZON", 45),
    trendSaturation: envFloat("BRIEFS_TREND_SATURATION", 1.0),
    weights: {
      new: { demand: 2, position: 1, growth: 1.5, intent: 2, relevance: 2, cluster: 1.5, distinctness: 2, actionability: 0.5, evidence: 1.5 },
      update: { demand: 2, position: 2, growth: 1, intent: 1.5, relevance: 1.5, cluster: 1, distinctness: 1, actionability: 1.5, evidence: 1.5 },
      other: { demand: 2, position: 1, growth: 1, intent: 1, relevance: 1.5, cluster: 1, distinctness: 0.5, actionability: 0.5, evidence: 1 },
    },
    /** How much of the editorial cluster value a weak cluster (per Internal Linking) adds. */
    weakClusterBonus: envFloat("BRIEFS_WEAK_CLUSTER_BONUS", 0.15),
  },

  // -------------------------------------------------------------------------
  // Confidence — SEPARATE from score. Tiers reuse the GSC agent's own
  // impression lines (150 / 40), applied to the intent group.
  // -------------------------------------------------------------------------
  confidence: {
    highImpressions: envInt("BRIEFS_CONFIDENCE_HIGH", 150),
    mediumImpressions: envInt("BRIEFS_CONFIDENCE_MEDIUM", 40),
    /**
     * Runs (including this one) an intent must appear in before thin data may
     * be called durable. One low-volume week is not proof of demand.
     */
    persistenceRunsForHigh: envInt("BRIEFS_PERSISTENCE_FOR_HIGH", 2),
  },

  // -------------------------------------------------------------------------
  // LVINIT's editorial clusters and their value. Keys are the GSC agent's
  // topicCluster() vocabulary, so the two agents mean the same thing.
  // -------------------------------------------------------------------------
  editorial: {
    clusterValue: {
      "area-comparison": 1.0,
      relocation: 0.95,
      "rent-vs-buy": 0.9,
      "new-vs-resale": 0.9,
      development: 0.85,
      "cost-of-housing": 0.85,
      "commute-access": 0.85,
      "neighborhood-orientation": 0.75,
      market: 0.6,
      general: 0.35,
    },
    /** Minimum GSC editorialRelevance for a group to be considered at all. */
    minRelevance: envFloat("BRIEFS_MIN_RELEVANCE", 0.4),
  },

  // -------------------------------------------------------------------------
  // Output caps — a short report is the point.
  // -------------------------------------------------------------------------
  output: {
    dir: process.env.BRIEFS_OUTPUT_DIR || "reports/content-briefs",
    minBriefScore: envFloat("BRIEFS_MIN_SCORE", 50),
    maxNewBriefs: envInt("BRIEFS_MAX_NEW", 3),
    maxUpdateBriefs: envInt("BRIEFS_MAX_UPDATES", 2),
    /** Report-only (monitor / internal-link-only) items listed. */
    maxReportOnly: envInt("BRIEFS_MAX_REPORT_ONLY", 3),
    /** Rejections are always COUNTED; only this many are listed with reasons. */
    maxRejectedListed: envInt("BRIEFS_MAX_REJECTED_LISTED", 5),
    /** Queries listed as evidence per brief. */
    maxQueriesPerBrief: envInt("BRIEFS_MAX_QUERIES_PER_BRIEF", 8),
  },

  // -------------------------------------------------------------------------
  // Publisher handoff. OFF. The first build is dry-run only: the queue file is
  // written with mode "dry-run" and nothing reads it. Turning it on is a
  // separate, explicit decision (docs/CONTENT_BRIEF_GENERATOR.md).
  // -------------------------------------------------------------------------
  handoff: {
    enabled: envBool("BRIEFS_HANDOFF_ENABLED", false),
    minScore: envFloat("BRIEFS_HANDOFF_MIN_SCORE", 70),
    requiredConfidence: "high",
    /**
     * Runs (this one included) the intent must have appeared in. Autonomous
     * publishing never reacts to a single week, however large the spike.
     */
    minPersistenceRuns: envInt("BRIEFS_HANDOFF_MIN_PERSISTENCE", 2),
    /** Briefs queued per run. The Publisher executes one per run, so keep this small. */
    maxPerRun: envInt("BRIEFS_HANDOFF_MAX_PER_RUN", 2),
    /**
     * A brief queued in this many live runs without a Publisher commit carrying
     * its fingerprint is HANDOFF_STALLED: pulled from the queue and shown to
     * Mikey. This is the retry ceiling — nothing is retried endlessly.
     */
    maxAttempts: envInt("BRIEFS_HANDOFF_MAX_ATTEMPTS", 2),
    /** The commit trailer the Publisher writes when it executes a brief. */
    trailerKey: "LVINIT-Brief-Fingerprint",
    trailerIdKey: "LVINIT-Brief",
  },
};

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

export function loadConfig(overrides = {}) {
  return merge(DEFAULT_CONFIG, overrides);
}
