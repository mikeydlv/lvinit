// ---------------------------------------------------------------------------
// LVINIT INTERNAL LINKING AGENT — CONFIGURATION
//
// Every tunable number the agent uses lives here. Nothing else in the agent
// should hardcode a threshold, a limit, a weight, or a cadence. Change a value
// here and the whole pipeline (graph, relevance, safety gates, run limits,
// editing, reporting) follows.
//
// Overrides, in increasing order of precedence:
//   1. the defaults below
//   2. environment variables (LINKS_MAX_LINKS_PER_RUN, ...)
//   3. CLI flags (--max-links=4, --apply, ...)
//
// This mirrors scripts/gsc/config.mjs and scripts/fact-decay/config.mjs on
// purpose. Three agents with three configuration philosophies would be three
// things to learn instead of one.
//
// See docs/INTERNAL_LINKING_AGENT.md for what each group means in plain English.
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

/** Read a boolean env var. "1", "true", "yes", "on" are true; anything else false. */
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
  // Scan scope — which pages are nodes in the link graph
  //
  // The agent reads the repository, not the live site. app/**/page.tsx is
  // authoritative for what exists; lib/content.ts supplies publication dates,
  // categories and draft status. Section names come from
  // scripts/gsc/lib/site-inventory.mjs so all three agents mean the same thing
  // by "a guide".
  // -------------------------------------------------------------------------
  content: {
    appDir: "app",
    componentsDir: "components",
    registryFile: "lib/content.ts",
    /** Sections that count as published editorial content — link graph nodes. */
    includeSections: envList("LINKS_INCLUDE_SECTIONS", [
      "guide",
      "neighborhood",
      "community",
      "place-story",
    ]),
    /** Extra routes to treat as editorial regardless of section. */
    includeRoutes: envList("LINKS_INCLUDE_ROUTES", []),
    /** Routes never scanned and never linked to, whatever their section. */
    excludeRoutes: envList("LINKS_EXCLUDE_ROUTES", []),
    /** Follow local data modules a page imports (lib/areas/*), as fact-decay does. */
    followCompanionModules: envBool("LINKS_FOLLOW_IMPORTS", true),
    companionPrefixes: envList("LINKS_COMPANION_PREFIXES", ["@/lib/areas/", "@/lib/"]),
    useGitDates: envBool("LINKS_USE_GIT", true),
  },

  // -------------------------------------------------------------------------
  // Link graph
  //
  // A link only counts as an EDITORIAL link when a human put it in a page file.
  // Header, footer and nav links appear on every page; counting them would make
  // every page look well-linked and nothing would ever be an orphan.
  // -------------------------------------------------------------------------
  graph: {
    /**
     * Component files whose links are site chrome, not editorial links. Matched
     * as a path suffix, so "components/Navbar.tsx" and "Navbar.tsx" both work.
     */
    chromeComponents: envList("LINKS_CHROME_COMPONENTS", [
      "components/Navbar.tsx",
      "components/Footer.tsx",
      "components/Analytics.tsx",
      "components/Newsletter.tsx",
      "components/SearchHomesStrip.tsx",
    ]),
    /**
     * Destination routes that are utilities or indexes, not editorial
     * destinations. They are never proposed as a link target and never counted
     * as editorial in-links.
     */
    nonEditorialTargets: envList("LINKS_NON_EDITORIAL_TARGETS", [
      "/",
      "/search",
      "/contact",
      "/guides",
      "/neighborhoods",
    ]),
    /** At or below this many unique editorial referrers, a page is "weakly linked". */
    weaklyLinkedAtOrBelow: envInt("LINKS_WEAK_THRESHOLD", 1),
    /** A page published within this many days is "new" for discovery purposes. */
    newlyPublishedDays: envInt("LINKS_NEW_PAGE_DAYS", 30),
  },

  // -------------------------------------------------------------------------
  // Relevance model
  //
  // confidence = wAnchor*anchorQuality + wParagraph*paragraphSupport
  //            + wPage*pageRelatedness + wTopic*topicAffinity
  //            + wStructure*structuralFit
  //
  // Every component is 0-1 and every one is reported, so a confidence figure is
  // always explainable. Traffic is NOT in this formula on purpose: how relevant
  // a link is to a reader cannot depend on how many people saw the page.
  // -------------------------------------------------------------------------
  relevance: {
    weights: {
      anchor: envFloat("LINKS_W_ANCHOR", 0.35),
      paragraph: envFloat("LINKS_W_PARAGRAPH", 0.25),
      page: envFloat("LINKS_W_PAGE", 0.2),
      topic: envFloat("LINKS_W_TOPIC", 0.1),
      structure: envFloat("LINKS_W_STRUCTURE", 0.1),
    },
    /** Confidence at or above which a link may be auto-executed. */
    autoExecuteMinConfidence: envFloat("LINKS_AUTO_MIN_CONFIDENCE", 0.72),
    /** Confidence at or above which an opportunity is worth reporting at all. */
    reportMinConfidence: envFloat("LINKS_REPORT_MIN_CONFIDENCE", 0.45),
    /**
     * HARD GATE. Distinctive tokens the destination and the source PARAGRAPH
     * must share beyond the anchor phrase itself. Without this, a page that
     * mentions a place once in passing looks like a topical match.
     */
    minSupportingTokens: envInt("LINKS_MIN_SUPPORTING_TOKENS", 1),
    /**
     * HARD GATE. Page-level relatedness floor. Two pages that share nothing but
     * an incidental phrase are not a link opportunity.
     */
    minPageRelatedness: envFloat("LINKS_MIN_PAGE_RELATEDNESS", 0.1),
    /**
     * The supporting-token gate has one alternative route through it: a proper
     * name that IS the destination's subject ("Summerlin", "Water Street
     * District") on a page this related to it. A place page's whole vocabulary
     * is its own name, so it could otherwise never clear a gate that ignores
     * the anchor's own words. Generic anchors get no such exemption.
     */
    minPageRelatednessForProperName: envFloat("LINKS_MIN_RELATEDNESS_PROPER", 0.3),
    /**
     * Two pages this similar are probably competing for the same search intent.
     * Consolidation is the real question there, and that is an editorial call,
     * so the pair is reported and never auto-linked.
     */
    intentOverlapThreshold: envFloat("LINKS_INTENT_OVERLAP", 0.8),
  },

  // -------------------------------------------------------------------------
  // Anchor text
  //
  // The anchor is ALWAYS words that are already on the page. The agent wraps
  // existing prose in a link; it never writes, rewrites or reorders a word of
  // published copy. That is the invariant that makes auto-execution safe, and
  // scripts/internal-links/test/edit.test.mjs enforces it.
  // -------------------------------------------------------------------------
  anchor: {
    minWords: envInt("LINKS_ANCHOR_MIN_WORDS", 1),
    maxWords: envInt("LINKS_ANCHOR_MAX_WORDS", 6),
    /**
     * A one-word anchor is only allowed when the word is a proper name that IS
     * the destination's subject ("Summerlin"). Everything else needs at least
     * two words, because one common noun is not a description of a destination.
     */
    singleWordRequiresProperName: envBool("LINKS_ANCHOR_SINGLE_WORD_PROPER", true),
    /**
     * And it has to be most of what the destination is about — in practice,
     * at least 60% of the destination's slug vocabulary.
     *
     * "Summerlin" scores 1.0 against the Summerlin pillar and is a fine anchor.
     * "first" scores 0.75 against "Surviving Your First Las Vegas Summer" and
     * "Sales" scores 0.75 against the July new-home-sales report; both are
     * words, not subjects, and both turned up in the first real dry run. A page
     * whose whole title is generic words plus a date has no honest one-word
     * anchor, and the right answer is to propose nothing.
     */
    minSingleWordQuality: envFloat("LINKS_ANCHOR_MIN_SINGLE_WORD_QUALITY", 0.8),
    /**
     * How many times the same anchor text may already point at the same
     * destination across the site before a further use is treated as
     * repetitive exact-match anchoring and demoted to report-only.
     */
    maxSameAnchorSiteWide: envInt("LINKS_MAX_SAME_ANCHOR", 3),
    /** Anchors that are never acceptable, however well they match. */
    banned: envList("LINKS_BANNED_ANCHORS", [
      "click here",
      "here",
      "this",
      "read more",
      "learn more",
      "this guide",
      "this page",
      "more info",
      "link",
    ]),
    /** The class attribute used for a new inline link, when the page has no local convention. */
    defaultClassName:
      process.env.LINKS_DEFAULT_CLASSNAME ||
      "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue",
    /**
     * Local class identifiers the agent will reuse when the page already
     * defines one (`const linkCls = ...`). Matching the page's own convention
     * keeps the diff indistinguishable from a hand-written link.
     */
    localClassIdentifiers: envList("LINKS_LOCAL_CLASS_IDENTIFIERS", ["linkCls", "linkClass"]),
  },

  // -------------------------------------------------------------------------
  // Link density
  //
  // Over-linking is the failure mode this agent has to avoid most. One
  // genuinely useful link beats three marginal ones, and a page that is already
  // linked well is left alone.
  // -------------------------------------------------------------------------
  density: {
    /** A page already carrying this many editorial out-links is left alone. */
    maxEditorialLinksPerPage: envInt("LINKS_MAX_LINKS_PER_PAGE_TOTAL", 12),
    /** At most this many internal links in any one paragraph, after the edit. */
    maxLinksPerParagraph: envInt("LINKS_MAX_LINKS_PER_PARAGRAPH", 1),
    /** Minimum words in a paragraph before it can carry an added link. */
    minParagraphWords: envInt("LINKS_MIN_PARAGRAPH_WORDS", 25),
    /** At most this many links to the SAME destination from one page. */
    maxLinksPerDestinationPerPage: envInt("LINKS_MAX_PER_DESTINATION", 1),
  },

  // -------------------------------------------------------------------------
  // Run limits — the safety ceiling on a single automated run
  // -------------------------------------------------------------------------
  limits: {
    maxPagesModifiedPerRun: envInt("LINKS_MAX_PAGES_PER_RUN", 5),
    maxLinksAddedPerPage: envInt("LINKS_MAX_LINKS_PER_PAGE", 2),
    maxLinksAddedPerRun: envInt("LINKS_MAX_LINKS_PER_RUN", 8),
  },

  // -------------------------------------------------------------------------
  // Auto-execution
  // -------------------------------------------------------------------------
  autoExecute: {
    /** Master switch. `--dry-run` also forces this off for a single run. */
    enabled: envBool("LINKS_AUTO_EXECUTE", true),
    /**
     * Bridge sentences are DELIBERATELY not automated. A bridge sentence is new
     * published prose in Mikey's voice, and a regex cannot write in anyone's
     * voice — every template that fits every paragraph ("For more on X, see Y")
     * is exactly the bolted-on link block LVINIT's own house rules forbid.
     *
     * When a link would need one, the opportunity is reported with the sentence
     * the agent would propose, and handed to the Content Publisher. Turning
     * this on does not make the agent write one; it is the switch a future
     * implementation would read, and it is documented as such.
     */
    allowBridgeSentence: envBool("LINKS_ALLOW_BRIDGE_SENTENCE", false),
  },

  // -------------------------------------------------------------------------
  // Fact-Decay signal — destination eligibility
  //
  // Read-only. The agent reads the Fact-Decay Agent's newest report off disk. A
  // page with a serious unresolved factual problem should not have more readers
  // pushed into it, so it is not strengthened with new inbound links until that
  // is dealt with. It is NOT blocked for having a low-priority finding — almost
  // every page on the site has one of those.
  //
  // The two blocking conditions below are calibrated against the Fact-Decay
  // Agent's own vocabulary:
  //
  //   * `contradicts` is the only verification result that means "the source
  //     actively disagrees with the page". Paired with high risk, that is a
  //     high-consequence claim that is probably wrong.
  //   * priority >= 75 is Fact-Decay's own "act now" urgency line
  //     (scripts/fact-decay/config.mjs, priority.urgency.now).
  //
  // `source-unreachable` is deliberately NOT a blocker. Fact-Decay's own
  // severity table scores it below `partially-confirms`, and its docs list bot
  // protection and paywalls as routine causes. A transient 403 is not evidence
  // that a page is wrong.
  // -------------------------------------------------------------------------
  factDecay: {
    enabled: envBool("LINKS_USE_FACT_DECAY", true),
    dir: process.env.LINKS_FACT_DECAY_DIR || "reports/fact-decay",
    /** Ignore a Fact-Decay report older than this. */
    maxReportAgeDays: envInt("LINKS_FACT_DECAY_MAX_AGE", 45),
    /** Block a destination carrying a finding at or above this priority. */
    blockPriority: envFloat("LINKS_FACT_DECAY_BLOCK_PRIORITY", 75),
    /** Block a destination whose cited source contradicts a high-risk claim on it. */
    blockOnHighRiskContradiction: envBool("LINKS_FACT_DECAY_BLOCK_CONTRADICTION", true),
  },

  // -------------------------------------------------------------------------
  // GSC signal — prioritization only
  //
  // Read-only, and strictly one-directional: traffic can reorder which safe
  // opportunities get done first, and nothing else. It cannot create an
  // opportunity, raise a confidence score, or make an unsafe link safe.
  //
  // Absence from the GSC report is NEUTRAL, never a penalty. That report lists
  // only pages that produced an opportunity, so a page can have real search
  // visibility and still not appear in it.
  // -------------------------------------------------------------------------
  gsc: {
    enabled: envBool("LINKS_USE_GSC", true),
    dir: process.env.LINKS_GSC_DIR || "reports/gsc",
    maxReportAgeDays: envInt("LINKS_GSC_MAX_AGE", 45),
    impressionReference: envInt("LINKS_GSC_IMPRESSION_REF", 300),
    neutralMultiplier: envFloat("LINKS_GSC_NEUTRAL_MULTIPLIER", 1),
    maxMultiplier: envFloat("LINKS_GSC_MAX_MULTIPLIER", 1.15),
    /**
     * Extra boost when the GSC agent itself raised an `internal-link`
     * opportunity naming this destination. That is not an inference about
     * traffic — it is the other agent saying, in its own vocabulary, that this
     * exact page needs internal links.
     */
    namedInternalLinkBoost: envFloat("LINKS_GSC_NAMED_BOOST", 1.1),
  },

  // -------------------------------------------------------------------------
  // Content Brief Generator signal — optional cluster context
  //
  // Read-only, and weaker than GSC on purpose. The Brief Generator's clusters
  // are broad (a dozen or more pages each), so sharing one is not evidence that
  // two pages belong linked together. It is used for three things only:
  //
  //   * CONTEXT in the report: which brief cluster a pair shares
  //   * ORDERING: a destination the Brief Generator itself named as an update
  //     or internal-link target moves up the queue slightly. Confidence is
  //     never touched, so this can never make an unsafe link safe.
  //   * CONFLICT AVOIDANCE: a page with a LIVE brief queued for the Content
  //     Publisher is not edited as a source this week — the Publisher may be
  //     rewriting it.
  //
  // A brief never creates a link, a proposed (unpublished) page is never a
  // destination, and nothing here writes to reports/content-briefs/.
  // -------------------------------------------------------------------------
  briefs: {
    enabled: envBool("LINKS_USE_BRIEFS", true),
    dir: process.env.LINKS_BRIEFS_DIR || "reports/content-briefs",
    /** Briefs describe a moment in search demand; ignore a stale report. */
    maxReportAgeDays: envInt("LINKS_BRIEFS_MAX_AGE", 21),
    /** Ordering boost for a destination the Brief Generator named INTERNAL_LINK_ONLY. */
    internalLinkTargetBoost: envFloat("LINKS_BRIEFS_LINK_BOOST", 1.1),
    /** Ordering boost for a destination it named UPDATE_EXISTING / EXPAND_EXISTING. */
    updateTargetBoost: envFloat("LINKS_BRIEFS_UPDATE_BOOST", 1.05),
  },

  // -------------------------------------------------------------------------
  // Editorial decisions — standing vetoes
  //
  // An opportunity fingerprint listed here is never auto-executed again and is
  // not re-reported. This is how a person says "no, not that link" once and
  // has it stick. Each entry: { fingerprint, note, date }.
  // -------------------------------------------------------------------------
  decisions: {
    rejectedFingerprints: envList("LINKS_REJECTED_FINGERPRINTS", []),
    rejected: [],
  },

  // -------------------------------------------------------------------------
  // Discovery weighting — how much a weakly-linked destination is prioritized
  //
  // This is ordering only, exactly like traffic. An orphan is not a reason to
  // manufacture a link; it is a reason to do a genuine link to it FIRST.
  // -------------------------------------------------------------------------
  discovery: {
    orphanMultiplier: envFloat("LINKS_DISCOVERY_ORPHAN", 1.3),
    weaklyLinkedMultiplier: envFloat("LINKS_DISCOVERY_WEAK", 1.15),
    newlyPublishedMultiplier: envFloat("LINKS_DISCOVERY_NEW", 1.1),
  },

  // -------------------------------------------------------------------------
  // Validation — what has to pass before an edit is allowed to survive
  // -------------------------------------------------------------------------
  validation: {
    /**
     * Run these, in order, after the edits are on disk. Each must exit 0.
     * Cheapest first: the four agents' own test suites take seconds, so a
     * change that broke shared helpers fails before a full Next.js build.
     */
    commands: [
      { key: "links-tests", label: "Internal Linking tests", argv: ["npm", "run", "links:test"] },
      { key: "gsc-tests", label: "GSC Opportunity tests", argv: ["npm", "run", "gsc:test"] },
      { key: "fact-tests", label: "Fact-Decay tests", argv: ["npm", "run", "fact:test"] },
      { key: "briefs-tests", label: "Content Brief tests", argv: ["npm", "run", "briefs:test"] },
      { key: "typecheck", label: "TypeScript", argv: ["npx", "tsc", "--noEmit"] },
      { key: "lint", label: "ESLint", argv: ["npm", "run", "lint"] },
      { key: "build", label: "Production build", argv: ["npm", "run", "build"] },
    ],
    timeoutMs: envInt("LINKS_VALIDATION_TIMEOUT_MS", 900000),
    /** Skip validation entirely. Only ever for fast local iteration. */
    skip: envBool("LINKS_SKIP_VALIDATION", false),
  },

  // -------------------------------------------------------------------------
  // Git — commit and push authority
  //
  // The agent IS authorized to commit and push safe link edits to main. The
  // safety is in the preconditions, not in asking permission: a clean tree
  // going in, a fast-forwardable remote, a diff that contains nothing but the
  // approved link edits, and every validation command green.
  // -------------------------------------------------------------------------
  git: {
    /** Commit the edits locally. Off => edits stay in the working tree. */
    commit: envBool("LINKS_GIT_COMMIT", true),
    /** Push the commit. THIS is the switch to flip to disable autonomous push. */
    push: envBool("LINKS_GIT_PUSH", true),
    remote: process.env.LINKS_GIT_REMOTE || "origin",
    branch: process.env.LINKS_GIT_BRANCH || "main",
    /** Commit subject. The run date is appended when `commitIncludeDate` is on. */
    commitSubject: process.env.LINKS_COMMIT_SUBJECT || "chore: improve LVINIT internal linking",
    commitIncludeDate: envBool("LINKS_COMMIT_INCLUDE_DATE", true),
    /**
     * Paths this agent is allowed to have touched when it inspects its own
     * diff. Anything outside this list aborts the commit — that is the
     * structural guarantee that it cannot ship a Content Publisher change, a
     * metadata change, or an image by accident.
     */
    allowedPathPrefixes: envList("LINKS_ALLOWED_PATHS", ["app/", "lib/areas/"]),
  },

  // -------------------------------------------------------------------------
  // Output
  // -------------------------------------------------------------------------
  output: {
    /** Directory for generated reports. Gitignored — the agent never commits reports. */
    dir: process.env.LINKS_OUTPUT_DIR || "reports/internal-links",
    /** Cap on report-only opportunities carried into the report. */
    maxReviewItems: envInt("LINKS_MAX_REVIEW_ITEMS", 12),
    /** Cap on the orphan / weak-page listing. */
    maxWeakPagesListed: envInt("LINKS_MAX_WEAK_PAGES", 25),
    /**
     * Cap on Content Publisher handoffs. These are the most expensive items in
     * the report — each one is "write a sentence" — so the list stays short
     * enough to actually get done.
     */
    maxBridgeHandoffs: envInt("LINKS_MAX_BRIDGE_HANDOFFS", 5),
    /**
     * Only call it a duplicate worth looking at when a page links the same
     * destination this many times. Twice is normal in a long LVINIT guide (once
     * in the body, once in a related block) and listing every instance produced
     * 141 rows of nothing on the first real run.
     */
    duplicateReportThreshold: envInt("LINKS_DUPLICATE_THRESHOLD", 3),
    /** How many previous reports to read back for stable-ID continuity. */
    historyLookback: envInt("LINKS_HISTORY_LOOKBACK", 12),
    /**
     * Where CI puts earlier runs' reports (one `run-<id>/` folder each). Kept
     * apart from `dir` so an artifact never contains every earlier one —
     * the Content Brief Generator's convention.
     */
    historyDir: process.env.LINKS_HISTORY_DIR || "reports/internal-links-history",
    /**
     * A review item that has already been shown in full this many times, and
     * has not materially changed, is listed as one line under "Still open"
     * instead of being written up again. Stops the same item resurfacing
     * forever.
     */
    quietAfterReports: envInt("LINKS_QUIET_AFTER_REPORTS", 2),
    /** A confidence move at least this large counts as a material change. */
    materialConfidenceChange: envFloat("LINKS_MATERIAL_CONFIDENCE_CHANGE", 0.05),
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
