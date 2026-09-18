// Shared test scaffolding for the Internal Linking Agent.
//
// Everything here is synthetic. No test reads or writes LVINIT's real content.

import { loadConfig } from "../config.mjs";
import { finalizeGraph } from "../lib/graph.mjs";
import { extractLinks } from "../lib/source.mjs";
import { topicsFor, distinctiveTokens, slugTokens } from "../lib/topics.mjs";

export const TODAY = "2026-09-17";

/** A config with the given overrides, and every optional signal switched off. */
export function testConfig(overrides = {}) {
  return loadConfig({
    gsc: { enabled: false },
    factDecay: { enabled: false },
    content: { useGitDates: false },
    ...overrides,
  });
}

/** A neutral GSC signal — never available, always a multiplier of exactly 1. */
export const neutralGsc = {
  available: false,
  reason: "no GSC report in this test",
  reportDate: null,
  ageDays: null,
  fixtureData: false,
  namedInternalLinkRoutes: new Set(),
  multiplierFor: () => ({ value: 1, basis: "no GSC report in this test", named: false }),
};

/** A Fact-Decay signal that lets everything through. */
export const permissiveFactDecay = {
  available: false,
  reason: "no Fact-Decay report in this test",
  reportDate: null,
  ageDays: null,
  fixtureData: false,
  eligibilityFor: () => ({ eligible: true, code: "NO_FACT_DECAY_DATA", reason: "not checked", worstFinding: null }),
};

/** A Fact-Decay signal that blocks exactly the named routes. */
export function blockingFactDecay(blockedRoutes, reason = "blocked in this test") {
  const blocked = new Set(blockedRoutes);
  return {
    available: true,
    reason: "synthetic Fact-Decay signal",
    reportDate: TODAY,
    ageDays: 0,
    fixtureData: true,
    eligibilityFor: (route) =>
      blocked.has(route)
        ? { eligible: false, code: "DESTINATION_REQUIRES_REFRESH", reason, worstFinding: null, findingCount: 1 }
        : { eligible: true, code: "NO_OPEN_FINDINGS", reason: "clean", worstFinding: null, findingCount: 0 },
  };
}

/** Wrap a body in a minimal but realistic LVINIT story page. */
export function storyPage(body, { withLinkImport = true } = {}) {
  return `${withLinkImport ? 'import Link from "next/link";\n' : ""}import { StoryPage, StoryLede, StorySection } from "@/components/story";

const meta = { title: "Test | LVINIT", path: "/test", breadcrumbs: [] };
const linkCls = "text-lvinit-blue underline underline-offset-4";

export default function TestPage() {
  return (
    <StoryPage meta={meta} hero={{ headline: "Test" }}>
${body}
    </StoryPage>
  );
}
`;
}

/** A <StorySection> with one paragraph. */
export function section(heading, paragraph) {
  return `      <StorySection heading="${heading}">
        <p>
          ${paragraph}
        </p>
      </StorySection>`;
}

/**
 * Build a graph from `{route, title, category, publishedAt, source}` records,
 * using the same derivation code the real scan uses.
 */
export function graphFrom(records, config = testConfig(), today = TODAY) {
  const pages = new Map();
  const existingRoutes = new Set(records.map((r) => r.route));
  for (const record of records) {
    const file = `app${record.route}/page.tsx`;
    const ageDays = record.publishedAt
      ? Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${record.publishedAt}T00:00:00Z`)) / 86400000)
      : null;
    pages.set(record.route, {
      route: record.route,
      section: record.route.startsWith("/guides") ? "guide" : "neighborhood",
      neighborhood: record.route.startsWith("/neighborhoods") ? record.route.split("/")[2] : null,
      file,
      absolute: file,
      title: record.title,
      description: null,
      category: record.category ?? null,
      publishedAt: record.publishedAt ?? null,
      dateModified: null,
      gitLastModified: null,
      ageDays,
      inRegistry: true,
      inSitemap: true,
      documents: [{ file, absolute: file, role: "page", source: record.source }],
      topics: topicsFor({ route: record.route, title: record.title, category: record.category ?? "" }),
      coreTokens: [...new Set(distinctiveTokens(slugTokens(record.route).join(" ")))],
      tokens: [...new Set([...distinctiveTokens(record.route), ...distinctiveTokens(record.title)])],
      outgoing: [],
      incoming: [],
      chromeIncoming: [],
      duplicateOutgoing: [],
      brokenOutgoing: [],
      rawLinks: extractLinks(record.source).map((l) => ({ ...l, file, documentRole: "page" })),
    });
  }
  return finalizeGraph({
    pages,
    config,
    existingRoutes,
    sitemapRoutes: [...existingRoutes],
    chromeLinks: [],
    componentLinks: [],
    skipped: [],
  });
}
