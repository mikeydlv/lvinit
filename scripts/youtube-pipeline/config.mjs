// ---------------------------------------------------------------------------
// LVINIT YOUTUBE → WEBSITE PIPELINE — configuration
//
// Every threshold has an environment override named beside it. Nothing here is
// a secret, and nothing is required: the pipeline reads the repository, the
// approved-video manifest and transcript files, and writes report files.
//
// Publisher handoff is OFF. The first build writes a dry-run queue that nothing
// reads (docs/YOUTUBE_PIPELINE.md, "Handoff").
// ---------------------------------------------------------------------------

const envFloat = (name, fallback) => {
  const v = Number.parseFloat(process.env[name] ?? "");
  return Number.isFinite(v) ? v : fallback;
};
const envInt = (name, fallback) => {
  const v = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(v) ? v : fallback;
};
const envBool = (name, fallback) => {
  const v = process.env[name];
  if (v === undefined || v === "") return fallback;
  return /^(1|true|yes|on)$/i.test(v);
};

export const AGENT = "youtube-pipeline";
export const SCHEMA_VERSION = "1.0.0";

/** Every content action, in the order the classifier considers them. */
export const ACTIONS = [
  "NEW_ARTICLE",
  "UPDATE_EXISTING_ARTICLE",
  "ADD_VIDEO_TO_EXISTING_ARTICLE",
  "CREATE_FAQ_SECTION",
  "CREATE_COMPARISON_SUPPORT",
  "CREATE_NEIGHBORHOOD_SUPPORT",
  "VIDEO_ONLY_NO_ARTICLE",
  "MONITOR_ONLY",
  "REJECT_DUPLICATE",
];

/** Actions that create a new URL. */
export const NEW_URL_ACTIONS = new Set(["NEW_ARTICLE", "CREATE_COMPARISON_SUPPORT", "CREATE_NEIGHBORHOOD_SUPPORT"]);
/** Actions that change an existing page. */
export const EXISTING_PAGE_ACTIONS = new Set(["UPDATE_EXISTING_ARTICLE", "ADD_VIDEO_TO_EXISTING_ARTICLE", "CREATE_FAQ_SECTION"]);
/** Actions that produce a Publisher task at all. */
export const PUBLISHER_ACTIONS = new Set([...NEW_URL_ACTIONS, ...EXISTING_PAGE_ACTIONS]);
/** Actions that need written copy, and therefore a transcript. */
export const COPY_ACTIONS = new Set(["NEW_ARTICLE", "UPDATE_EXISTING_ARTICLE", "CREATE_FAQ_SECTION", "CREATE_COMPARISON_SUPPORT", "CREATE_NEIGHBORHOOD_SUPPORT"]);

export const LIFECYCLE = ["NEW", "ANALYZED", "READY_FOR_PUBLISHER", "HANDED_OFF", "PUBLISHED", "REJECTED", "DUPLICATE"];

export const DEFAULT_CONFIG = {
  inputs: {
    /** The approved-video manifest. The only thing Mikey edits. */
    manifest: process.env.YT_PIPELINE_MANIFEST || "data/youtube-pipeline/manifest.json",
    /** Earlier JSON reports, read for lifecycle history. */
    historyDirs: (process.env.YT_PIPELINE_HISTORY_DIRS || "reports/youtube-pipeline,reports/youtube-pipeline-history")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    maxHistoryReports: envInt("YT_PIPELINE_MAX_HISTORY", 12),
    /** Read `git log` for Publisher commit trailers (PUBLISHED status). */
    useGitLog: envBool("YT_PIPELINE_USE_GIT", true),
    /** Approved first-party photo library. Read-only, and only when present. */
    photoLibrary: process.env.YT_PIPELINE_PHOTO_LIBRARY || "C:\\LVINIT\\Images",
  },

  transcript: {
    /** Below this many words a transcript is treated as missing. */
    minWords: envInt("YT_PIPELINE_MIN_TRANSCRIPT_WORDS", 150),
    /** Below this many words a video cannot carry an article on its own. */
    minWordsForArticle: envInt("YT_PIPELINE_MIN_ARTICLE_WORDS", 600),
  },

  video: {
    /** Under this many seconds a video is a Short, not long-form. */
    minLongFormSeconds: envInt("YT_PIPELINE_MIN_LONG_FORM_SECONDS", 180),
  },

  classify: {
    /** Title-token similarity at which a page is treated as the same piece. */
    titleSame: envFloat("YT_PIPELINE_TITLE_SAME", 0.6),
    /** Facets of the video a page must be missing before an UPDATE beats an embed. */
    minMissingFacetsForUpdate: envInt("YT_PIPELINE_MIN_MISSING_FACETS", 1),
    /** Question/answer pairs the video needs before a FAQ section is proposed. */
    minFaqPairs: envInt("YT_PIPELINE_MIN_FAQ_PAIRS", 3),
    /** Substantive (claim or opinion) sentences needed for a new article. */
    minSubstantiveSentences: envInt("YT_PIPELINE_MIN_SUBSTANTIVE", 25),
  },

  draft: {
    maxSections: envInt("YT_PIPELINE_MAX_SECTIONS", 7),
    maxFaq: envInt("YT_PIPELINE_MAX_FAQ", 6),
    maxLinks: envInt("YT_PIPELINE_MAX_LINKS", 8),
    metaDescriptionMax: 160,
    metaTitleMax: 65,
  },

  handoff: {
    /** OFF. Turning it on is a separate, explicit decision. */
    enabled: envBool("YT_PIPELINE_HANDOFF_ENABLED", false),
    maxPerRun: envInt("YT_PIPELINE_HANDOFF_MAX_PER_RUN", 2),
    /** Live runs an item may be queued in before it is pulled and shown to Mikey. */
    maxAttempts: envInt("YT_PIPELINE_HANDOFF_MAX_ATTEMPTS", 2),
    trailerKey: "LVINIT-Video-Fingerprint",
    trailerIdKey: "LVINIT-Video",
  },

  output: {
    dir: process.env.YT_PIPELINE_OUT || "reports/youtube-pipeline",
  },
};

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function merge(base, overrides) {
  const out = { ...base };
  for (const [k, v] of Object.entries(overrides ?? {})) {
    out[k] = isPlainObject(v) && isPlainObject(base[k]) ? merge(base[k], v) : v;
  }
  return out;
}

export function loadConfig(overrides = {}) {
  return merge(DEFAULT_CONFIG, overrides);
}
