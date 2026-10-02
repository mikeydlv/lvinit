// ---------------------------------------------------------------------------
// ISSUE CATALOG — every issue type the agent can raise, in one table
//
// Each type fixes, once, its audit area, base severity, recommended owner and
// whether an auto-fix is ever possible for it. Severity is decided HERE, by
// type, and adjusted only by a check's documented context rule or a type's own
// systemic severity (see findings.mjs). Breadth alone and search traffic never
// change a severity.
//
// `fix` is one of:
//   "never"        — always report-only, whatever the evidence
//   "conditional"  — lib/fixes.mjs may plan a fix, and then only if every
//                    safe-auto-fix gate passes for this specific instance
// ---------------------------------------------------------------------------

export const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
export const SEVERITY_RANK = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, INFO: 0 };

export const OWNERS = {
  PUBLISHER: "Publisher",
  LINKING: "Internal Linking Agent",
  DEV: "human/dev",
  FACT_DECAY: "Fact-Decay",
  AGENT: "Site Quality Agent",
};

const T = (area, severity, owner, fix, title, extra = {}) => ({ area, severity, owner, fix, title, ...extra });
const { PUBLISHER, DEV, AGENT } = OWNERS;

export const ISSUE_TYPES = {
  // --- build / system -------------------------------------------------------
  "build-failed": T("build", "CRITICAL", DEV, "never", "Production build fails"),
  "typecheck-failed": T("build", "HIGH", DEV, "never", "TypeScript check fails"),
  "lint-failed": T("build", "HIGH", DEV, "never", "ESLint fails"),

  // --- routes ---------------------------------------------------------------
  "route-not-rendered": T("routes", "HIGH", DEV, "never", "Page exists in source but not in the build output"),
  "route-duplicate": T("routes", "HIGH", DEV, "never", "Two page files resolve to the same URL"),
  "route-casing": T("routes", "MEDIUM", DEV, "never", "Route contains uppercase characters"),

  // --- sitemap --------------------------------------------------------------
  "sitemap-unavailable": T("sitemap", "CRITICAL", DEV, "never", "sitemap.xml is missing or unparseable"),
  "sitemap-missing-route": T("sitemap", "HIGH", AGENT, "conditional", "Published page missing from the sitemap"),
  "sitemap-stale-route": T("sitemap", "HIGH", AGENT, "conditional", "Sitemap lists a route that does not exist"),
  "sitemap-duplicate": T("sitemap", "LOW", DEV, "never", "Sitemap lists the same URL twice"),
  "sitemap-malformed-url": T("sitemap", "HIGH", DEV, "never", "Malformed sitemap URL"),
  "sitemap-noindex-conflict": T("sitemap", "MEDIUM", DEV, "never", "Sitemap lists a noindex page"),
  "sitemap-canonical-conflict": T("sitemap", "MEDIUM", DEV, "never", "Sitemap lists a page that canonicalizes elsewhere"),

  // --- robots ---------------------------------------------------------------
  "robots-unavailable": T("robots", "CRITICAL", DEV, "never", "robots.txt is missing"),
  "robots-blocks-site": T("robots", "CRITICAL", DEV, "never", "robots.txt blocks the whole site"),
  "robots-blocks-route": T("robots", "HIGH", DEV, "never", "robots.txt blocks a published route"),
  "robots-missing-sitemap": T("robots", "MEDIUM", DEV, "never", "robots.txt has no Sitemap line"),
  "robots-sitemap-mismatch": T("robots", "MEDIUM", DEV, "never", "robots.txt points at the wrong sitemap"),
  "robots-malformed": T("robots", "MEDIUM", DEV, "never", "robots.txt has a malformed line"),

  // --- metadata -------------------------------------------------------------
  "title-missing": T("metadata", "MEDIUM", PUBLISHER, "never", "Missing <title>"),
  "title-duplicate": T("metadata", "MEDIUM", PUBLISHER, "never", "Duplicate <title> across pages"),
  "description-missing": T("metadata", "MEDIUM", PUBLISHER, "never", "Missing meta description"),
  "description-duplicate": T("metadata", "MEDIUM", PUBLISHER, "never", "Duplicate meta description across pages"),
  "canonical-missing": T("canonical", "MEDIUM", DEV, "never", "Missing canonical"),
  "canonical-multiple": T("canonical", "HIGH", DEV, "never", "More than one canonical on a page"),
  "canonical-malformed": T("canonical", "HIGH", AGENT, "conditional", "Malformed canonical URL"),
  "canonical-mismatch": T("canonical", "HIGH", DEV, "never", "Canonical points at a different route", {
    systemicSeverity: "CRITICAL",
    systemicRoutes: 5,
  }),
  "og-url-mismatch": T("metadata", "LOW", DEV, "never", "og:url disagrees with the canonical"),
  "noindex-unexpected": T("metadata", "HIGH", DEV, "never", "Published page is noindex", {
    systemicSeverity: "CRITICAL",
    systemicRoutes: 5,
  }),
  "nofollow-unexpected": T("metadata", "MEDIUM", DEV, "never", "Published page is nofollow"),
  "dev-url": T("links", "HIGH", DEV, "never", "Development / staging / local URL in published output"),
  "og-image-missing": T("images", "HIGH", PUBLISHER, "never", "Social share image file is missing"),
  "og-image-oversized": T("images", "LOW", PUBLISHER, "never", "Social share image is too large for crawlers"),

  // --- structured data ------------------------------------------------------
  "schema-parse-error": T("schema", "HIGH", DEV, "never", "JSON-LD does not parse"),
  "schema-missing-context": T("schema", "MEDIUM", DEV, "never", "JSON-LD has no schema.org @context"),
  "schema-url-mismatch": T("schema", "MEDIUM", AGENT, "conditional", "Schema URL disagrees with the page URL"),
  "schema-breadcrumb-broken": T("schema", "MEDIUM", DEV, "never", "Breadcrumb points at a route that does not exist"),
  "schema-duplicate-entity": T("schema", "MEDIUM", DEV, "never", "Duplicate or conflicting JSON-LD entity"),
  "schema-missing-article": T("schema", "MEDIUM", PUBLISHER, "never", "Story page has no Article schema"),
  "schema-bad-date": T("schema", "MEDIUM", PUBLISHER, "never", "Malformed or impossible schema date"),
  "schema-missing-date": T("schema", "MEDIUM", PUBLISHER, "never", "Article schema has no datePublished"),
  "schema-asset-missing": T("schema", "HIGH", PUBLISHER, "never", "Schema image / thumbnail file is missing"),

  // --- images ---------------------------------------------------------------
  "image-missing-file": T("images", "HIGH", PUBLISHER, "never", "Image file does not exist"),
  "image-path-case": T("images", "HIGH", AGENT, "conditional", "Image path differs from the file only by letter case"),
  "image-untracked": T("images", "HIGH", DEV, "never", "Image exists locally but is not committed"),
  "image-alt-missing": T("images", "MEDIUM", PUBLISHER, "never", "Image has no alt attribute"),
  "image-alt-empty-photo": T("images", "MEDIUM", PUBLISHER, "never", "A real photograph renders with empty alt"),
  "image-hotlink": T("images", "MEDIUM", PUBLISHER, "never", "Image hotlinked from an external host"),
  "image-oversized": T("images", "LOW", PUBLISHER, "never", "Large image served without optimization"),

  // --- headings -------------------------------------------------------------
  "h1-missing": T("headings", "MEDIUM", DEV, "never", "Page has no H1"),
  "h1-multiple": T("headings", "MEDIUM", DEV, "never", "Page has more than one H1"),
  "h1-empty": T("headings", "MEDIUM", DEV, "never", "H1 is empty"),
  "heading-skip": T("headings", "LOW", DEV, "never", "Heading level skipped"),

  // --- links ----------------------------------------------------------------
  "link-broken-internal": T("links", "HIGH", DEV, "never", "Internal link to a route that does not exist"),
  "link-casing": T("links", "HIGH", AGENT, "conditional", "Internal link differs from the real route only by letter case"),
  "link-trailing-slash": T("links", "LOW", AGENT, "conditional", "Internal link has a trailing slash (redirects)"),
  "link-double-slash": T("links", "MEDIUM", AGENT, "conditional", "Internal link contains a double slash"),
  "link-origin-malformed": T("links", "LOW", AGENT, "conditional", "Absolute LVINIT link uses the wrong protocol or host"),
  "link-broken-anchor": T("links", "MEDIUM", DEV, "never", "Link points at an anchor that is not on the page"),
  "link-placeholder": T("links", "MEDIUM", DEV, "never", "Placeholder link (href=\"#\" or empty)"),
  "link-mailto-malformed": T("links", "MEDIUM", DEV, "never", "Malformed mailto: link"),
  "link-tel-malformed": T("links", "MEDIUM", DEV, "never", "Malformed tel: link"),
  "link-external-malformed": T("links", "MEDIUM", PUBLISHER, "never", "Malformed external URL"),
  "link-asset-missing": T("links", "HIGH", DEV, "never", "Link to a local file that does not exist"),
  "page-unreachable": T("links", "MEDIUM", OWNERS.LINKING, "never", "Page cannot be reached by following links from the homepage"),

  // --- content registry -----------------------------------------------------
  "registry-href-broken": T("registry", "HIGH", PUBLISHER, "never", "Registry entry links to a route that does not exist"),
  "registry-duplicate": T("registry", "MEDIUM", PUBLISHER, "never", "Duplicate registry slug or href"),
  "registry-missing-entry": T("registry", "MEDIUM", PUBLISHER, "never", "Published guide has no registry entry"),
  "registry-date-mismatch": T("registry", "MEDIUM", PUBLISHER, "never", "Registry publishedAt disagrees with the page's datePublished"),
  "registry-date-invalid": T("registry", "MEDIUM", PUBLISHER, "never", "Registry date is not a valid YYYY-MM-DD"),
  "registry-missing-date": T("registry", "MEDIUM", PUBLISHER, "never", "Registry entry has no publishedAt, so it is excluded from feeds"),
  "registry-image-missing": T("registry", "HIGH", PUBLISHER, "never", "Registry card image file is missing"),
  "registry-photo-alt-missing": T("registry", "MEDIUM", PUBLISHER, "never", "Registry photo has no imageAlt"),
  "registry-cover-has-alt": T("registry", "LOW", PUBLISHER, "never", "Editorial cover carries imageAlt (convention says decorative)"),
  "registry-draft-live": T("registry", "MEDIUM", PUBLISHER, "never", "Draft registry entry is live and in the sitemap"),
  "registry-unavailable": T("registry", "MEDIUM", DEV, "never", "Content registry could not be read"),
  "source-declared-placeholder": T("registry", "MEDIUM", DEV, "never", "Module that declares itself placeholder content is rendered in production"),

  // --- video / embeds -------------------------------------------------------
  "video-id-malformed": T("video", "HIGH", DEV, "never", "Malformed YouTube video id"),
  "video-poster-missing": T("video", "HIGH", PUBLISHER, "never", "Video poster file is missing"),
  "video-schema-mismatch": T("video", "MEDIUM", PUBLISHER, "never", "VideoObject schema names a video the page does not show"),

  // --- placeholder copy -----------------------------------------------------
  "placeholder-copy": T("placeholder", "MEDIUM", PUBLISHER, "never", "Placeholder copy in published text"),
};

export function issueType(type) {
  const def = ISSUE_TYPES[type];
  if (!def) throw new Error(`Unknown site-quality issue type: ${type}`);
  return def;
}

/** Everything the agent will never change, whatever the evidence. Printed in every report. */
export const NEVER_AUTO_FIX = [
  "rewrite a title, meta description, heading or any article copy",
  "write alt text (new descriptive alt is editorial; it is handed to the Publisher)",
  "change a CTA, form, navigation link or footer link",
  "change a schema type, or add a structured-data claim",
  "alter a date, price, rate, statistic, housing fact or development fact",
  "change brokerage, license, Equal Housing or other compliance copy",
  "change an image for any reason other than a letter-case path correction",
  "delete a page, add a redirect, or change robots policy",
  "touch analytics, tracking, Vercel settings or dependencies",
  "add editorial internal links (the Internal Linking Agent's job)",
  "judge factual freshness (the Fact-Decay Agent's job)",
];
