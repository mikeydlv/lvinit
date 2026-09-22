// Shared test scaffolding for the Content Brief Generator.
//
// Everything here is synthetic. No test reads LVINIT's real content, and no
// number here describes LVINIT's real search performance.

import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { loadConfig } from "../config.mjs";
import { entityProfile, coverageBucketsFor, comparedPlacesFromRoute, isDatedRecord } from "../lib/inventory.mjs";
import { topicsFor } from "../../internal-links/lib/topics.mjs";

export const TODAY = "2026-09-22";

export function testConfig(overrides = {}) {
  return loadConfig({ inputs: { useGitLog: false }, inventory: { useGitDates: false }, ...overrides });
}

/** One synthetic inventory page. */
export function page({ route, title, h1 = null, description = "", headings = [], body = "", category = null, section = null, linksIn = [], linksOut = [], publishedAt = "2026-08-01", dateModified = null, isOrphan = false }) {
  const p = {
    route,
    file: `app${route}/page.tsx`,
    section: section ?? (route.startsWith("/neighborhoods/") ? (route.split("/").length > 3 ? "place-story" : "neighborhood") : "guide"),
    neighborhood: route.startsWith("/neighborhoods/") ? route.split("/")[2] : null,
    title,
    h1: h1 ?? title,
    description,
    category,
    topics: topicsFor({ route, title, category: category ?? "" }),
    publishedAt,
    dateModified,
    gitLastModified: null,
    inRegistry: true,
    inSitemap: true,
    headings,
    bodyWordCount: body.split(/\s+/).filter(Boolean).length,
    linksOut,
    linksIn,
    isOrphan,
    isWeaklyLinked: linksIn.length <= 1,
    datedRecord: isDatedRecord(route),
    comparedPlaces: comparedPlacesFromRoute(route),
  };
  p.buckets = coverageBucketsFor(p);
  p.profile = entityProfile({ route, title, h1: p.h1, description, headings, body });
  Object.defineProperty(p, "body", { value: body, enumerable: false });
  return p;
}

export function makeInventory(pages, extraRoutes = ["/", "/search", "/contact", "/guides", "/neighborhoods"]) {
  return {
    pages,
    byRoute: new Map(pages.map((p) => [p.route, p])),
    existingRoutes: new Set([...pages.map((p) => p.route), ...extraRoutes]),
    skipped: [],
    coverage: {},
    totals: { published: pages.length, skipped: 0 },
  };
}

/** A small LVINIT-shaped site. Synthetic copy. */
export function standardInventory() {
  return makeInventory([
    page({
      route: "/neighborhoods/summerlin",
      title: "Summerlin, Las Vegas: The Honest Guide",
      headings: ["The setting", "Daily life", "The commute", "Summerlin vs Henderson", "Housing stock and HOAs"],
      body: "Summerlin sits on the west edge. The commute east runs along the 215. HOA dues vary by village. Southwest Las Vegas is the comparison people make most. Southwest is further south.",
    }),
    page({
      route: "/neighborhoods/southwest-las-vegas",
      title: "Southwest Las Vegas: The Honest Guide",
      headings: ["The setting", "Daily life", "Southwest vs Summerlin", "What the housing costs"],
      body: "Southwest Las Vegas is a growth corridor. Summerlin is to the northwest. Costs vary. Summerlin comes up often.",
    }),
    page({
      route: "/neighborhoods/henderson",
      title: "Henderson: The Honest Guide",
      headings: ["The setting", "Henderson vs Southwest", "Development Watch"],
      body: "Henderson is an incorporated city. Southwest is not. Development continues. Southwest Las Vegas again.",
    }),
    page({
      route: "/guides/summerlin-vs-henderson",
      title: "Summerlin vs. Henderson: Where Should You Actually Move?",
      category: "Comparisons",
      headings: ["Master-plan culture", "The commute", "Costs"],
      body: "Summerlin and Henderson compared. Summerlin is west. Henderson is southeast.",
    }),
    page({
      route: "/guides/summerlin-vs-henderson-vs-southwest-las-vegas",
      title: "Summerlin vs Henderson vs Southwest Las Vegas",
      category: "Comparisons",
      headings: ["Three places, three tradeoffs", "HOAs, assessments, SID and LID, and what it really costs to own"],
      body: "Summerlin, Henderson and Southwest Las Vegas side by side. Summerlin. Henderson. Southwest. Costs differ.",
    }),
    page({
      route: "/guides/new-build-vs-resale-las-vegas",
      title: "New Build vs Resale in Las Vegas: Which Should You Buy?",
      category: "Buyer Guide",
      headings: ["What incentives do and do not cover", "Lot sizes", "SID and LID"],
      body: "New construction and resale compared. Builder incentives change often. Resale homes sit on larger lots. Incentives again.",
      isOrphan: true,
    }),
    page({
      route: "/guides/las-vegas-home-prices-august-2026",
      title: "Las Vegas Home Prices August 2026",
      category: "Market Watch",
      headings: ["The median", "Inventory"],
      body: "Home prices in August. The median home price moved. Home prices again.",
    }),
    page({
      route: "/guides/monument-hills-northwest-las-vegas",
      title: "Monument Hills Could Reshape the Northwest",
      category: "Local Feature",
      headings: ["What is planned", "What is confirmed"],
      body: "Monument Hills is a planned community. Development timeline. Monument Hills again.",
    }),
    page({
      route: "/guides/first-summer-in-vegas",
      title: "Surviving Your First Las Vegas Summer",
      category: "Moving Here",
      headings: ["The heat", "Monsoon"],
      body: "The first summer after moving here is the hardest. Heat. Summer again.",
    }),
  ]);
}

/** A raw query row. */
export const qrow = (query, impressions, clicks = 0, position = 12) => ({ query, impressions, clicks, ctr: impressions ? clicks / impressions : 0, position });
/** A raw query+page row. */
export const prow = (query, route, impressions, clicks = 0, position = 12) => ({ query, route, impressions, clicks, ctr: impressions ? clicks / impressions : 0, position });

/**
 * A minimal schema-1.1.0 GSC report around the given rows. Synthetic.
 */
export function gscReport({ queries = [], previous = [], pairs = [], pages = [], opportunities = [], reportDate = "2026-09-21", fixtureData = false, lowVolume = false } = {}) {
  const sum = (rows) => rows.reduce((s, r) => s + r.impressions, 0);
  return {
    schemaVersion: "1.1.0",
    reportDate,
    dataSource: fixtureData ? "fixture" : "search-console",
    fixtureData,
    windows: { current: { start: "2026-08-22", end: "2026-09-18", days: 28 }, previous: { start: "2026-07-25", end: "2026-08-21", days: 28 } },
    totals: { currentImpressions: sum(queries), currentClicks: 0, previousImpressions: sum(previous), previousClicks: 0, uniqueQueries: queries.length, uniquePages: pages.length },
    dataQuality: { lowVolume },
    opportunities,
    searchDemand: {
      current: { queries: { rows: queries }, pages: { rows: pages }, pairs: { rows: pairs } },
      previous: { queries: { rows: previous }, pages: { rows: [] }, pairs: { rows: [] } },
    },
  };
}

/** A loaded-GSC object as loadGsc would return it. */
export function loadedGsc(report, { mode = "rows" } = {}) {
  return { available: true, mode, reason: "test", report, reportPath: "(test)", reportDate: report.reportDate, ageDays: 1, fixtureData: Boolean(report.fixtureData), lowVolume: Boolean(report.dataQuality?.lowVolume) };
}

export const noFactDecay = { available: false, reason: "none in this test", byRoute: new Map() };
export const noInternalLinks = { available: false, reason: "none in this test", orphans: [], weaklyLinked: [], newPagesNeedingSupport: [], bridgeHandoffs: [], needsReview: [], topicsByRoute: new Map() };
export const gitVerified = (fingerprints = new Map()) => ({ available: true, reason: "test", fingerprints });

/** A throwaway directory. */
export function tempDir(prefix = "lvinit-briefs-") {
  return mkdtempSync(join(tmpdir(), prefix));
}

export function writeJson(dir, rel, value) {
  const full = join(dir, rel);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, typeof value === "string" ? value : JSON.stringify(value));
  return full;
}
