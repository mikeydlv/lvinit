// ---------------------------------------------------------------------------
// LVINIT SITE QUALITY AGENT — CONFIGURATION
//
// Every tunable number the agent uses lives here: severity weights, auto-fix
// limits, allowlists, the GSC urgency line, the validation commands and the
// git switches. Nothing else in scripts/site-quality/ hardcodes a threshold.
//
// Overrides, in increasing order of precedence:
//   1. the defaults below
//   2. environment variables (SITE_QUALITY_MAX_FIXES, ...)
//   3. CLI flags (--build, --trial, ...)
//
// This mirrors scripts/internal-links/config.mjs on purpose — one configuration
// philosophy across every LVINIT agent. See docs/SITE_QUALITY_AGENT.md.
// ---------------------------------------------------------------------------

function envInt(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
  const n = Number.parseInt(String(raw), 10);
  return Number.isFinite(n) ? n : fallback;
}

function envBool(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === null || String(raw).trim() === "") return fallback;
  return /^(1|true|yes|on)$/i.test(String(raw).trim());
}

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
  // The site
  // -------------------------------------------------------------------------
  site: {
    /** The one production origin. Every canonical, sitemap URL and schema URL must use it. */
    origin: process.env.SITE_QUALITY_ORIGIN || "https://www.lvinit.com",
    appDir: "app",
    publicDir: "public",
    registryFile: "lib/content.ts",
    sitemapSource: "app/sitemap.ts",
    robotsSource: "app/robots.ts",
    /** Where `next build` writes the prerendered HTML, sitemap.xml and robots.txt. */
    renderedDir: ".next/server/app",
    buildIdFile: ".next/BUILD_ID",
    /** Source roots scanned for literal hrefs, asset paths and dev URLs. */
    sourceDirs: ["app", "components", "lib"],
    /**
     * Routes that exist but are deliberately NOT in the sitemap. Today the
     * sitemap lists every page including /search and /contact, so this is
     * empty — Next's own 404 and API routes are never inventoried at all.
     */
    sitemapExcludedRoutes: envList("SITE_QUALITY_SITEMAP_EXCLUDE", []),
    /** Routes deliberately served with noindex. None today. */
    intentionalNoindexRoutes: envList("SITE_QUALITY_NOINDEX_ALLOW", []),
    /**
     * Route prefixes whose pages must have a `guides` registry entry in
     * lib/content.ts (that entry is what puts a piece on /guides and the
     * homepage feed). Neighborhood pillars are reached from the homepage and
     * nav, not the registry, so they are not required to have one.
     */
    registryRequiredPrefixes: ["/guides/"],
    /** Page patterns that are expected to carry Article JSON-LD (the StoryPage convention). */
    articleSchemaPrefixes: ["/guides/", "/neighborhoods/"],
    /** Of those, the ones where Article.datePublished is required (the registry contract). */
    datePublishedRequiredPrefixes: ["/guides/"],
  },

  // -------------------------------------------------------------------------
  // What counts as a forbidden URL anywhere in rendered output or source
  // -------------------------------------------------------------------------
  urls: {
    /** Hostnames that must never appear in a published link, canonical, schema or sitemap. */
    devHostPatterns: [
      "^localhost$",
      "^127\\.",
      "^0\\.0\\.0\\.0$",
      "^10\\.",
      "^192\\.168\\.",
      "\\.local$",
      "\\.vercel\\.app$",
      "(^|\\.)staging\\.",
      "^preview\\.",
      "\\.ngrok",
    ],
    /**
     * External image hosts allowed in a rendered <img src>. CLAUDE.md forbids
     * hotlinking random images, so this is deliberately empty: every image is
     * local (next/image or /public).
     */
    allowedImageHosts: envList("SITE_QUALITY_IMAGE_HOSTS", []),
    /** Video embed hosts the site's own components use. */
    videoEmbedHosts: ["www.youtube-nocookie.com", "www.youtube.com", "youtube.com", "youtube-nocookie.com"],
  },

  // -------------------------------------------------------------------------
  // Severity model — see lib/catalog.mjs for each issue type's base severity
  // -------------------------------------------------------------------------
  severity: {
    /** Health-score deductions. INFO never costs anything. */
    weights: { CRITICAL: 40, HIGH: 15, MEDIUM: 5, LOW: 1, INFO: 0 },
    /** Image files larger than this, served raw (not through next/image), are flagged LOW. */
    rawImageMaxBytes: envInt("SITE_QUALITY_RAW_IMAGE_MAX_BYTES", 1_000_000),
    /** og:image files larger than this are flagged (social crawlers reject big images). */
    ogImageMaxBytes: envInt("SITE_QUALITY_OG_IMAGE_MAX_BYTES", 5_000_000),
  },

  // -------------------------------------------------------------------------
  // GSC — prioritization ONLY. Never decides whether something is broken.
  // Read off disk exactly like the Internal Linking Agent does (its loader is
  // reused), so "absence is neutral, never a penalty" is the same code.
  // -------------------------------------------------------------------------
  gsc: {
    enabled: envBool("SITE_QUALITY_USE_GSC", true),
    dir: process.env.SITE_QUALITY_GSC_DIR || "reports/gsc",
    maxReportAgeDays: envInt("SITE_QUALITY_GSC_MAX_AGE", 45),
    impressionReference: envInt("SITE_QUALITY_GSC_IMPRESSION_REF", 300),
    neutralMultiplier: 1,
    maxMultiplier: 1.25,
    namedInternalLinkBoost: 1,
    /** A page at or above this many impressions is tagged "search-visible" in the report. */
    urgentImpressions: envInt("SITE_QUALITY_GSC_URGENT_IMPRESSIONS", 100),
  },

  // -------------------------------------------------------------------------
  // Auto-fix. v1 ships with it OFF: --trial proves fixes then reverts them;
  // --apply refuses unless this switch is on.
  // -------------------------------------------------------------------------
  autoFix: {
    enabled: envBool("SITE_QUALITY_AUTO_FIX", false),
    maxFixesPerRun: envInt("SITE_QUALITY_MAX_FIXES", 5),
    maxFilesPerRun: envInt("SITE_QUALITY_MAX_FILES", 5),
    /** Shared-infrastructure fixes (components/, lib/, sitemap) per run. */
    maxSharedRootCauseFixesPerRun: 1,
    /** Files an auto-fix may ever touch. Anything else aborts the run. */
    allowedPathPrefixes: envList("SITE_QUALITY_ALLOWED_PATHS", ["app/", "components/", "lib/"]),
    /** Files that are shared infrastructure (a fix here counts toward the shared limit). */
    sharedPathPrefixes: ["components/", "lib/", "app/sitemap.ts", "app/layout.tsx", "app/robots.ts"],
    /** Never edited by this agent, for any reason. */
    protectedPaths: envList("SITE_QUALITY_PROTECTED_PATHS", [
      "app/robots.ts",
      "app/layout.tsx",
      "app/api/",
      "components/Analytics.tsx",
      "components/ContactForm.tsx",
      "app/search/",
      "next.config.mjs",
    ]),
    /** A line containing any of these is compliance copy and is never edited. */
    protectedLinePatterns: [
      "Equal Housing",
      "Scofield",
      "license",
      "License",
      "brokerage",
      "Brokerage",
      "Fair Housing",
      "S\\.\\d{5,}",
      "BS\\.\\d{5,}",
      "disclaimer",
      "Disclaimer",
    ],
  },

  // -------------------------------------------------------------------------
  // Validation — the repository's own checks, run against a fix
  // -------------------------------------------------------------------------
  validation: {
    commands: [
      { key: "quality-tests", label: "Site Quality tests", argv: ["npm", "run", "quality:test"] },
      { key: "links-tests", label: "Internal Linking tests", argv: ["npm", "run", "links:test"] },
      { key: "typecheck", label: "TypeScript", argv: ["npx", "tsc", "--noEmit"] },
      { key: "lint", label: "ESLint", argv: ["npm", "run", "lint"] },
      { key: "build", label: "Production build", argv: ["npm", "run", "build"] },
    ],
    buildCommand: { key: "build", label: "Production build", argv: ["npm", "run", "build"] },
    timeoutMs: envInt("SITE_QUALITY_VALIDATION_TIMEOUT_MS", 900000),
    skip: envBool("SITE_QUALITY_SKIP_VALIDATION", false),
  },

  // -------------------------------------------------------------------------
  // Git — used only by --apply, which is off in v1
  // -------------------------------------------------------------------------
  git: {
    commit: envBool("SITE_QUALITY_GIT_COMMIT", true),
    push: envBool("SITE_QUALITY_GIT_PUSH", true),
    remote: process.env.SITE_QUALITY_GIT_REMOTE || "origin",
    branch: process.env.SITE_QUALITY_GIT_BRANCH || "main",
    commitSubject: "fix: repair LVINIT site-quality regressions",
    /** Read by the reused internal-links preflight; mirrors autoFix.allowedPathPrefixes. */
    allowedPathPrefixes: envList("SITE_QUALITY_ALLOWED_PATHS", ["app/", "components/", "lib/"]),
    /** A lock younger than this blocks a second concurrent run. */
    lockMaxAgeMs: 60 * 60 * 1000,
  },

  // -------------------------------------------------------------------------
  // Human decisions
  // -------------------------------------------------------------------------
  decisions: {
    /**
     * Fingerprints Mikey has looked at and decided to leave. They are counted
     * as IGNORED and never written up again. Add `{ fingerprint, note, date }`.
     * The SITE_QUALITY_IGNORED_FINGERPRINTS env var (comma-separated) adds more.
     */
    ignored: [],
  },

  // -------------------------------------------------------------------------
  // Output
  // -------------------------------------------------------------------------
  output: {
    dir: process.env.SITE_QUALITY_OUTPUT_DIR || "reports/site-quality",
    historyDir: process.env.SITE_QUALITY_HISTORY_DIR || "reports/site-quality-history",
    historyLookback: envInt("SITE_QUALITY_HISTORY_LOOKBACK", 12),
    /**
     * A LOW / INFO finding already written up this many times with nothing
     * material changed collapses to one line under "Still open". MEDIUM and
     * above always stay visible — they are the ones that need action.
     */
    quietAfterReports: envInt("SITE_QUALITY_QUIET_AFTER_REPORTS", 2),
    /** Affected routes listed per grouped finding before "and N more". */
    maxRoutesListed: 8,
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
  const config = merge(DEFAULT_CONFIG, overrides);
  const extra = envList("SITE_QUALITY_IGNORED_FINGERPRINTS", []);
  if (extra.length) {
    config.decisions = {
      ...config.decisions,
      ignored: [...config.decisions.ignored, ...extra.map((fingerprint) => ({ fingerprint, note: "env" }))],
    };
  }
  return config;
}
