// ---------------------------------------------------------------------------
// LVINIT CONTENT REFRESH + FACT-DECAY AGENT — CONFIGURATION
//
// Every tunable number the agent uses lives here. Nothing else in the agent
// should hardcode a date, a threshold, a cadence, or a weight. Change a value
// here and the whole pipeline (discovery, detection, risk, freshness,
// verification, reporting) follows.
//
// Overrides, in increasing order of precedence:
//   1. the defaults below
//   2. environment variables (FACT_DECAY_CADENCE_DYNAMIC, ...)
//   3. CLI flags (--min-priority=50, --verify, ...)
//
// This mirrors scripts/gsc/config.mjs on purpose. Two agents with two different
// configuration philosophies would be two things to learn instead of one.
//
// See docs/FACT_DECAY_AGENT.md for what each group means in plain English.
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

/** Read a boolean env var. "1", "true", "yes" are true; anything else is false. */
function envBool(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
  return /^(1|true|yes|on)$/i.test(String(raw).trim());
}

/** Read a comma-separated list env var. */
function envList(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const DEFAULT_CONFIG = {
  // -------------------------------------------------------------------------
  // Scan scope — which pages count as "published editorial content"
  //
  // The agent reads the repository, not the live site. app/**/page.tsx is
  // authoritative for what exists; lib/content.ts supplies publication dates.
  // -------------------------------------------------------------------------
  content: {
    /** Where the routes live, relative to the repo root. */
    appDir: "app",
    /**
     * The editorial registry, read for publishedAt / category / draft status.
     * Optional: if it is missing, the agent falls back to on-page dates.
     */
    registryFile: "lib/content.ts",
    /**
     * Route sections that count as published editorial content. These are the
     * section names from scripts/gsc/lib/site-inventory.mjs, reused so both
     * agents mean the same thing by "a guide".
     *
     * Deliberately excludes: home, index pages, and utility routes (/search,
     * /contact, /api) — those are UI, not editorial claims.
     */
    includeSections: envList("FACT_DECAY_INCLUDE_SECTIONS", [
      "guide",
      "neighborhood",
      "community",
      "place-story",
    ]),
    /** Extra routes to scan regardless of section, e.g. "/about". */
    includeRoutes: envList("FACT_DECAY_INCLUDE_ROUTES", []),
    /**
     * Routes never scanned, whatever their section. Add a route here to take a
     * page permanently out of scope. Exact match on the route path.
     */
    excludeRoutes: envList("FACT_DECAY_EXCLUDE_ROUTES", []),
    /**
     * Categories never flagged anywhere on the site. Use a category key from
     * lib/categories.mjs, e.g. "parks-and-amenities".
     */
    excludeCategories: envList("FACT_DECAY_EXCLUDE_CATEGORIES", []),
    /**
     * Follow a page's local data imports (e.g. `@/lib/areas/summerlin`) and
     * scan those too. Summerlin's Development Watch entries live in one of
     * those files, so without this the richest structured claims on the site
     * would be invisible.
     */
    followCompanionModules: envBool("FACT_DECAY_FOLLOW_IMPORTS", true),
    /** Which import prefixes count as "a companion data module of this page". */
    companionPrefixes: envList("FACT_DECAY_COMPANION_PREFIXES", ["@/lib/areas/", "@/lib/"]),
    /**
     * Ask git when a file was last modified, as one input to article age. Off
     * in environments with no git history (a shallow CI checkout still works —
     * the call fails soft and the agent falls back to on-page dates).
     */
    useGitDates: envBool("FACT_DECAY_USE_GIT", true),
  },

  // -------------------------------------------------------------------------
  // Claim extraction
  // -------------------------------------------------------------------------
  claims: {
    /** Sentences shorter than this are fragments, not claims. */
    minWords: envInt("FACT_DECAY_MIN_WORDS", 5),
    /** Longer than this and it is almost certainly a run-on of several claims. */
    maxChars: envInt("FACT_DECAY_MAX_CLAIM_CHARS", 420),
    /** How much surrounding text to keep with each claim, for review context. */
    contextChars: envInt("FACT_DECAY_CONTEXT_CHARS", 260),
    /**
     * A year this many years or more in the past, used with a past-tense verb,
     * reads as settled history ("opened in 1990") rather than a stale claim.
     * Three years is deliberately conservative.
     */
    historicalYearsBack: envInt("FACT_DECAY_HISTORICAL_YEARS", 3),
    /**
     * Hard cap per page, so one very long neighborhood guide cannot flood a
     * report. Claims are kept in priority order, so the cap drops the weakest.
     */
    maxClaimsPerPage: envInt("FACT_DECAY_MAX_CLAIMS_PER_PAGE", 60),
    /**
     * Skip sentences that read as editorial opinion unless they also carry a
     * hard factual assertion (a figure, a date, a legal or program term).
     * LVINIT's voice is opinionated on purpose; opinion is not a fact to verify.
     */
    skipOpinion: envBool("FACT_DECAY_SKIP_OPINION", true),
  },

  // -------------------------------------------------------------------------
  // Refresh cadence, in days, by how fast a KIND of fact moves
  //
  // These are review intervals, not expiry dates. Passing one does not mean the
  // fact is wrong — it means nobody has checked it recently enough to say it is
  // still right. The reasoning behind each default is in the docs and in the
  // `why` field of each category in lib/categories.mjs.
  //
  //   very dynamic  weekly-to-fortnightly publication cycles (rates, closures,
  //                 builder incentives, deadlines)
  //   dynamic       monthly publication cycles (prices, inventory, permits,
  //                 project status)
  //   moderate      changes on budget, legislative or planning cycles
  //   stable        durable facts; reviewed annually or on manual request
  // -------------------------------------------------------------------------
  cadence: {
    "very-dynamic": envInt("FACT_DECAY_CADENCE_VERY_DYNAMIC", 10),
    dynamic: envInt("FACT_DECAY_CADENCE_DYNAMIC", 30),
    moderate: envInt("FACT_DECAY_CADENCE_MODERATE", 75),
    stable: envInt("FACT_DECAY_CADENCE_STABLE", 365),
  },

  // -------------------------------------------------------------------------
  // Risk model
  //
  // Risk answers ONE question: if this specific sentence is wrong, how badly
  // could it mislead a buyer, renter, homeowner, or reader?
  //
  // Base value comes from the claim's category. Escalators and de-escalators
  // adjust it for what the sentence actually says. Every adjustment applied is
  // recorded on the finding, so a High is always explainable.
  // -------------------------------------------------------------------------
  risk: {
    /** Starting value for each category-level base risk. */
    base: {
      high: envFloat("FACT_DECAY_RISK_BASE_HIGH", 0.82),
      medium: envFloat("FACT_DECAY_RISK_BASE_MEDIUM", 0.52),
      low: envFloat("FACT_DECAY_RISK_BASE_LOW", 0.24),
    },
    /** Score at or above which a finding is reported as High / Medium. */
    highThreshold: envFloat("FACT_DECAY_RISK_HIGH", 0.7),
    mediumThreshold: envFloat("FACT_DECAY_RISK_MEDIUM", 0.4),
    /**
     * Escalators — things that make a wrong answer more consequential.
     * Capped in total by `maxEscalation` so no claim can be talked all the way
     * up from Low to High by keyword stacking alone.
     */
    escalators: {
      /** A specific dollar amount someone could plan around. */
      dollarAmount: envFloat("FACT_DECAY_ESC_DOLLAR", 0.08),
      /** A specific percentage — rates, shares, minimums. */
      percentage: envFloat("FACT_DECAY_ESC_PERCENT", 0.06),
      /** Obligation language: must, required, cannot, not eligible. */
      obligation: envFloat("FACT_DECAY_ESC_OBLIGATION", 0.1),
      /** A named program, bill, or statute a reader could go and look up. */
      namedAuthority: envFloat("FACT_DECAY_ESC_AUTHORITY", 0.06),
      /** A hard date that can simply pass. */
      hardDate: envFloat("FACT_DECAY_ESC_DATE", 0.06),
    },
    maxEscalation: envFloat("FACT_DECAY_MAX_ESCALATION", 0.16),
    /**
     * De-escalators — the page is already being honest about uncertainty, so a
     * reader is less likely to be misled even if the figure has moved.
     */
    deEscalators: {
      /** Hedged: about, roughly, around, approximately. */
      hedged: envFloat("FACT_DECAY_DEESC_HEDGED", 0.06),
      /** The page tells the reader to confirm it themselves. */
      tellsReaderToVerify: envFloat("FACT_DECAY_DEESC_VERIFY", 0.12),
      /** The claim is explicitly time-stamped ("as of August 2026"). */
      selfDated: envFloat("FACT_DECAY_DEESC_SELF_DATED", 0.05),
      /** A caveat is attached to the claim in the source data. */
      carriesCaveat: envFloat("FACT_DECAY_DEESC_CAVEAT", 0.08),
    },
    maxDeEscalation: envFloat("FACT_DECAY_MAX_DEESCALATION", 0.2),
  },

  // -------------------------------------------------------------------------
  // Freshness / staleness model
  //
  // Staleness is 0-1: how likely is it that this claim has moved since anyone
  // last checked? Four weighted signals, plus two hard overrides.
  // -------------------------------------------------------------------------
  freshness: {
    weights: {
      /** How far past its review cadence the claim is. The main signal. */
      overdue: envFloat("FACT_DECAY_W_OVERDUE", 0.55),
      /** Language that ties the claim to the moment: "currently", "right now". */
      timeMarkers: envFloat("FACT_DECAY_W_TIME_MARKERS", 0.2),
      /** An explicit year in the claim, compared against the current year. */
      yearDrift: envFloat("FACT_DECAY_W_YEAR_DRIFT", 0.15),
      /** Age of the source the page cited for it, when that is knowable. */
      sourceAge: envFloat("FACT_DECAY_W_SOURCE_AGE", 0.1),
    },
    /**
     * Overdue saturates at this multiple of the cadence: at 2x cadence the
     * overdue component is 1. Beyond that it cannot get any more overdue —
     * "very late" and "extremely late" are the same instruction to a human.
     */
    overdueSaturationMultiple: envFloat("FACT_DECAY_OVERDUE_SATURATION", 2),
    /** Years of drift that saturate the year-drift component. */
    yearDriftSaturation: envInt("FACT_DECAY_YEAR_DRIFT_SATURATION", 2),
    /** Days of source age that saturate the source-age component. */
    sourceAgeSaturationDays: envInt("FACT_DECAY_SOURCE_AGE_SATURATION", 540),
    /**
     * HARD OVERRIDE: a deadline stated in the copy that has already passed.
     * Nothing about this is probabilistic — the sentence is now false.
     */
    passedDeadlineStaleness: envFloat("FACT_DECAY_PASSED_DEADLINE", 1),
    /**
     * HARD OVERRIDE: a "scheduled to be considered on <date>" where the date
     * has passed. The outcome is knowable and the page does not know it.
     */
    passedScheduledEventStaleness: envFloat("FACT_DECAY_PASSED_EVENT", 0.95),
  },

  // -------------------------------------------------------------------------
  // Priority — the ordering of the report
  //
  //   priority = 100 x (wRisk*risk + wStale*staleness + wVerif*verification)
  //              x trafficMultiplier
  //
  // Risk and staleness are independent judgements and stay that way; priority
  // is only how the two get ordered on the page, plus what the outside world
  // said when we checked.
  // -------------------------------------------------------------------------
  priority: {
    weights: {
      risk: envFloat("FACT_DECAY_P_RISK", 0.45),
      staleness: envFloat("FACT_DECAY_P_STALENESS", 0.35),
      verification: envFloat("FACT_DECAY_P_VERIFICATION", 0.2),
    },
    /**
     * How much each verification outcome contributes. "Not attempted" sits in
     * the middle on purpose: an unchecked claim should not outrank a
     * contradicted one, nor be buried beneath a confirmed one.
     */
    verificationSeverity: {
      // The source explicitly states something different. The strongest signal
      // there is, and the only one that means "the page is probably wrong".
      contradicts: 1,
      // Some figures found, some not — and no conflicting value. An absence.
      "partially-confirms": 0.65,
      // The figure could not be found and the source states nothing different.
      // Deliberately BELOW partially-confirms: it is the weakest kind of
      // "something might be off", and it must never outrank real evidence.
      "value-not-found": 0.6,
      "source-unreachable": 0.55,
      "cannot-verify": 0.5,
      "manual-check-required": 0.5,
      "not-attempted": 0.4,
      confirms: 0.05,
    },
    /**
     * When an external source CONFIRMS a claim on this run, that claim has just
     * been checked — whatever the page's own review stamp says. Ordering it as
     * if nobody had looked at it in a month would contradict the report's own
     * words ("re-checked on this run, so the review clock restarts") and would
     * push confirmed claims above contradicted ones.
     *
     * The reported staleness is unchanged: it still describes the page's review
     * state, which is a real thing worth seeing. This only affects the ordering.
     */
    confirmedStalenessFactor: envFloat("FACT_DECAY_CONFIRMED_STALENESS_FACTOR", 0.15),

    /** Urgency labels, by priority score. */
    urgency: {
      now: envFloat("FACT_DECAY_URGENCY_NOW", 75),
      soon: envFloat("FACT_DECAY_URGENCY_SOON", 55),
      routine: envFloat("FACT_DECAY_URGENCY_ROUTINE", 35),
    },
  },

  // -------------------------------------------------------------------------
  // Optional GSC signal
  //
  // A stale fact on a page nobody reads is still a stale fact. A stale fact on
  // a page people are actually landing on is more urgent. That is the ONLY
  // thing traffic is allowed to change: the ordering. It can never create,
  // suppress, or re-risk a finding.
  //
  // The agent reads the GSC agent's newest report from disk. It never calls
  // Search Console, never re-scores GSC findings, and never writes to
  // reports/gsc/.
  // -------------------------------------------------------------------------
  gsc: {
    enabled: envBool("FACT_DECAY_USE_GSC", true),
    /** Where the GSC agent leaves its reports. Read-only. */
    dir: process.env.FACT_DECAY_GSC_DIR || "reports/gsc",
    /** Ignore a GSC report older than this — traffic data goes stale too. */
    maxReportAgeDays: envInt("FACT_DECAY_GSC_MAX_AGE", 45),
    /** Impressions on a route that earn the full multiplier. */
    impressionReference: envInt("FACT_DECAY_GSC_IMPRESSION_REF", 300),
    /** The multiplier range. 1.0 is "no adjustment". */
    maxMultiplier: envFloat("FACT_DECAY_GSC_MAX_MULTIPLIER", 1.3),
    minMultiplier: envFloat("FACT_DECAY_GSC_MIN_MULTIPLIER", 0.9),
  },

  // -------------------------------------------------------------------------
  // Source verification
  //
  // What this can honestly do: re-fetch a source the page ALREADY cites and
  // check whether it is still reachable, when it was last modified, and whether
  // the page's own figures still appear in it.
  //
  // What it cannot do: search the web for a better source. There is no search
  // API wired to this agent. Anything that needs one is marked
  // MANUAL_SOURCE_CHECK_REQUIRED rather than guessed at.
  //
  // Off by default. Network access is opt-in per run (--verify).
  // -------------------------------------------------------------------------
  verification: {
    enabled: envBool("FACT_DECAY_VERIFY", false),
    /** Only spend a request on claims that cleared this risk+staleness bar. */
    minPriorityToVerify: envFloat("FACT_DECAY_VERIFY_MIN_PRIORITY", 45),
    /** Hard ceiling on requests per run, so a bad config cannot crawl. */
    maxSourceFetches: envInt("FACT_DECAY_MAX_FETCHES", 40),
    /** Per-request timeout. */
    timeoutMs: envInt("FACT_DECAY_FETCH_TIMEOUT_MS", 12000),
    /** Stop reading a response after this much — we only need the text. */
    maxBytes: envInt("FACT_DECAY_FETCH_MAX_BYTES", 2_000_000),
    /** Politeness gap between requests to the same host, in milliseconds. */
    perHostDelayMs: envInt("FACT_DECAY_HOST_DELAY_MS", 1500),
    /** Identify the agent honestly. */
    userAgent:
      process.env.FACT_DECAY_USER_AGENT ||
      "LVINIT-FactDecayAgent/1.0 (+https://www.lvinit.com; content freshness check)",
    /**
     * How many distinctive words the text around a candidate figure on the
     * source must share with the claim before the two count as being about the
     * same thing.
     *
     * This is the guard on the word "contradicts". A source page can carry a
     * dozen dollar figures about a dozen different things; finding *a*
     * different number proves nothing. Only a different value for the SAME
     * measure, anchored to the same subject, is a contradiction. Everything
     * else is "the figure could not be found", which is an absence and is
     * reported as one.
     *
     * Raising this makes contradictions rarer and more certain. Lowering it
     * below 2 is not advisable — one shared word is a coincidence.
     */
    conflictMinSharedTerms: envInt("FACT_DECAY_CONFLICT_MIN_SHARED_TERMS", 2),
    /**
     * How many words on either side of a figure make up the LABEL that says
     * what it measures. Kept deliberately tight — widening this compares topics
     * rather than measures, and on a dense programme page every number then
     * looks related to every other one.
     */
    conflictLabelWordsBefore: envInt("FACT_DECAY_CONFLICT_WORDS_BEFORE", 6),
    conflictLabelWordsAfter: envInt("FACT_DECAY_CONFLICT_WORDS_AFTER", 4),
    /**
     * Re-use a cached fetch of the same URL for this many days. Stable sources
     * do not need re-fetching every week, and the cache keeps runs cheap.
     */
    cacheTtlDays: envInt("FACT_DECAY_CACHE_TTL_DAYS", 7),
    /** Where the cache lives. Gitignored along with the rest of the reports. */
    cacheFile: process.env.FACT_DECAY_CACHE_FILE || "reports/fact-decay/.source-cache.json",
  },

  // -------------------------------------------------------------------------
  // Source hierarchy
  //
  // Preference order from the brief, as a score. Used to describe how much
  // weight a source carries, and to warn when a claim rests only on a weak one.
  // -------------------------------------------------------------------------
  sources: {
    tiers: [
      { key: "official-government", rank: 1, label: "Official government source", weight: 1 },
      { key: "primary", rank: 2, label: "Primary source", weight: 0.95 },
      { key: "developer-or-administrator", rank: 3, label: "Developer or program administrator", weight: 0.85 },
      { key: "authoritative-housing-data", rank: 4, label: "MLS-supported or authoritative housing data", weight: 0.8 },
      { key: "reputable-local-reporting", rank: 5, label: "Reputable local reporting", weight: 0.65 },
      { key: "other-credible", rank: 6, label: "Other credible source", weight: 0.45 },
      { key: "not-acceptable", rank: 99, label: "Not an acceptable source", weight: 0 },
    ],
    /** At or below this weight, the report says the claim is thinly sourced. */
    thinSourceWeight: envFloat("FACT_DECAY_THIN_SOURCE_WEIGHT", 0.5),
  },

  // -------------------------------------------------------------------------
  // Output
  // -------------------------------------------------------------------------
  output: {
    /** Directory for generated reports. Gitignored — the agent never commits. */
    dir: process.env.FACT_DECAY_OUTPUT_DIR || "reports/fact-decay",
    /** Minimum priority for a finding to be reported at all. */
    minPriority: envFloat("FACT_DECAY_MIN_PRIORITY", 35),
    /** Hard cap on findings carried into the report. */
    maxFindings: envInt("FACT_DECAY_MAX_FINDINGS", 40),
    /** How many findings get the full detail block at the top. */
    maxHighlighted: envInt("FACT_DECAY_MAX_HIGHLIGHTED", 8),
    /**
     * At most this many findings from any ONE page in the highlights. Without
     * it, one guide with a bad month buries every other page on the site.
     */
    maxHighlightedPerPage: envInt("FACT_DECAY_MAX_HIGHLIGHTED_PER_PAGE", 2),
    /** Cap on the compliance-review appendix. */
    maxComplianceListed: envInt("FACT_DECAY_MAX_COMPLIANCE", 20),
    /** How many previous reports to read back for stable-ID continuity. */
    historyLookback: envInt("FACT_DECAY_HISTORY_LOOKBACK", 12),
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
