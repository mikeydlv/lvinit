import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadGsc, validateGscReport, demandRows, loadFactDecay, factDecayNotesFor, loadInternalLinks, weakTopics, readPreviousReports, parseTrailers } from "../lib/inputs.mjs";
import { buildInventory } from "../lib/inventory.mjs";
import { testConfig, tempDir, writeJson, gscReport, qrow, TODAY } from "./helpers.mjs";

const config = testConfig();

// ---------------------------------------------------------------------------
// GSC artifact: missing / corrupt / stale / fixture / findings-only
// ---------------------------------------------------------------------------

test("a missing GSC artifact degrades to 'no briefs', never to guessing", () => {
  const gsc = loadGsc({ repoRoot: tempDir(), config, today: TODAY });
  assert.equal(gsc.available, false);
  assert.match(gsc.reason, /no GSC Opportunity Agent report/);
});

test("a corrupt GSC artifact is refused", () => {
  const dir = tempDir();
  writeJson(dir, "reports/gsc/gsc-opportunities-2026-09-21.json", "{ not json");
  const gsc = loadGsc({ repoRoot: dir, config, today: TODAY });
  assert.equal(gsc.available, false);
  assert.match(gsc.reason, /could not be read/);
});

test("a stale GSC artifact is refused", () => {
  const dir = tempDir();
  writeJson(dir, "reports/gsc/gsc-opportunities-2026-08-01.json", gscReport({ reportDate: "2026-08-01", queries: [qrow("x", 10)] }));
  const gsc = loadGsc({ repoRoot: dir, config, today: TODAY });
  assert.equal(gsc.available, false);
  assert.match(gsc.reason, /days old/);
});

test("a fixture GSC artifact is refused in a real run", () => {
  assert.ok(validateGscReport(gscReport({ fixtureData: true })).some((p) => /FIXTURE/.test(p)));
  assert.deepEqual(validateGscReport(gscReport({ fixtureData: true }), { allowFixture: true }), []);
});

test("a malformed searchDemand block is refused", () => {
  const r = gscReport();
  r.searchDemand.current.pairs = null;
  assert.ok(validateGscReport(r).some((p) => /malformed/.test(p)));
});

test("the newest report by DATE wins, one directory deep (CI artifact layout)", () => {
  const dir = tempDir();
  writeJson(dir, "reports/gsc/run-2/gsc-opportunities-2026-09-15.json", gscReport({ reportDate: "2026-09-15" }));
  writeJson(dir, "reports/gsc/run-1/gsc-opportunities-2026-09-21.json", gscReport({ reportDate: "2026-09-21" }));
  const gsc = loadGsc({ repoRoot: dir, config, today: TODAY });
  assert.equal(gsc.reportDate, "2026-09-21");
  assert.equal(gsc.mode, "rows");
});

test("a pre-1.1.0 report is used in findings-only mode, from query-level findings only", () => {
  const r = gscReport();
  delete r.searchDemand;
  r.schemaVersion = "1.0.0";
  r.opportunities = [
    { id: "GSC-1", type: "content-gap", query: "summerlin vs southwest", landingPage: "/", metrics: { clicks: 0, impressions: 30, ctr: 0, position: 20, hasPreviousPeriod: false } },
    { id: "GSC-2", type: "internal-link", query: null, landingPage: "/guides/a", metrics: { impressions: 97 } },
  ];
  const dir = tempDir();
  writeJson(dir, "reports/gsc/gsc-opportunities-2026-09-21.json", r);
  const gsc = loadGsc({ repoRoot: dir, config, today: TODAY });
  assert.equal(gsc.mode, "findings-only");
  const rows = demandRows(gsc);
  assert.deepEqual(rows.current.map((q) => q.query), ["summerlin vs southwest"]);
  assert.equal(rows.pages.length, 0, "page-level findings never become query rows");
});

// ---------------------------------------------------------------------------
// Fact-Decay and Internal Linking signal ingestion
// ---------------------------------------------------------------------------

test("Fact-Decay findings are ingested per route and only high-priority ones are named", () => {
  const dir = tempDir();
  writeJson(dir, "reports/fact-decay/fact-decay-2026-09-18.json", {
    reportDate: "2026-09-18",
    findings: [
      { id: "FACT-1", route: "/guides/a", priority: 80, risk: { level: "high" }, verification: { result: "cannot-verify" } },
      { id: "FACT-2", route: "/guides/a", priority: 30, risk: { level: "low" }, verification: { result: "not-attempted" } },
    ],
  });
  const fd = loadFactDecay({ repoRoot: dir, config, today: TODAY });
  assert.equal(fd.available, true);
  const notes = factDecayNotesFor(fd, "/guides/a", config);
  assert.equal(notes.openFindings, 2);
  assert.deepEqual(notes.highPriority.map((f) => f.id), ["FACT-1"]);
  assert.equal(factDecayNotesFor(fd, "/guides/none", config).instruction, null);
});

test("no Fact-Decay report is fine", () => {
  const fd = loadFactDecay({ repoRoot: tempDir(), config, today: TODAY });
  assert.equal(fd.available, false);
});

test("Internal Linking orphans and weak pages are ingested, and their topics mark weak clusters", () => {
  const dir = tempDir();
  writeJson(dir, "reports/internal-links/internal-links-2026-09-17.json", {
    reportDate: "2026-09-17",
    graph: {
      orphans: [{ route: "/guides/new-build-vs-resale-las-vegas", uniqueReferrers: [] }],
      weaklyLinked: [],
      newlyPublishedNeedingDiscovery: [],
      nodes: [{ route: "/guides/new-build-vs-resale-las-vegas", topics: ["theme:new-construction", "theme:resale"] }],
    },
    bridgeSentenceHandoffs: [],
    needsReview: [],
  });
  const il = loadInternalLinks({ repoRoot: dir, config, today: TODAY });
  assert.equal(il.available, true);
  assert.equal(il.orphans[0].route, "/guides/new-build-vs-resale-las-vegas");
  assert.ok(weakTopics(il).has("theme:new-construction"));
});

// ---------------------------------------------------------------------------
// Content inventory (a synthetic repository on disk)
// ---------------------------------------------------------------------------

test("content inventory reads published routes, titles, H1, headings, dates, links and skips drafts", () => {
  const dir = tempDir();
  const pageTsx = (route, headline, extra = "") => `
import Link from "next/link";
const meta = { title: "${headline} | LVINIT", headline: "${headline}", description: "About ${headline}.", path: "${route}", datePublished: "2026-09-01", dateModified: "2026-09-10" };
export default function Page() {
  return (<StorySection heading="The commute">
    <p>Summerlin is on the west side and the commute runs along the 215 every morning for most people. ${extra}</p>
  </StorySection>);
}`;
  mkdirSync(join(dir, "app/guides/summerlin-vs-southwest-las-vegas"), { recursive: true });
  writeFileSync(join(dir, "app/guides/summerlin-vs-southwest-las-vegas/page.tsx"), pageTsx("/guides/summerlin-vs-southwest-las-vegas", "Summerlin vs Southwest", '<Link href="/guides/draft-piece">draft</Link>'));
  mkdirSync(join(dir, "app/guides/draft-piece"), { recursive: true });
  writeFileSync(join(dir, "app/guides/draft-piece/page.tsx"), pageTsx("/guides/draft-piece", "Draft Piece"));
  mkdirSync(join(dir, "lib"), { recursive: true });
  writeFileSync(
    join(dir, "lib/content.ts"),
    `export const guides = [\n  {\n    slug: "sw",\n    href: "/guides/summerlin-vs-southwest-las-vegas",\n    category: "Comparisons",\n    publishedAt: "2026-09-01",\n  },\n  {\n    slug: "draft",\n    href: "/guides/draft-piece",\n    category: "Buyer Guide",\n    status: "draft",\n  },\n];\n`
  );
  const inv = buildInventory({ repoRoot: dir, config, today: TODAY });
  assert.deepEqual(inv.pages.map((p) => p.route), ["/guides/summerlin-vs-southwest-las-vegas"]);
  const p = inv.pages[0];
  assert.equal(p.h1, "Summerlin vs Southwest");
  assert.equal(p.category, "Comparisons");
  assert.equal(p.publishedAt, "2026-09-01");
  assert.equal(p.dateModified, "2026-09-10");
  assert.ok(p.headings.includes("The commute"));
  assert.deepEqual(p.comparedPlaces, ["place:southwest", "place:summerlin"]);
  assert.ok(p.buckets.includes("comparison"));
  assert.ok(p.profile["place:summerlin"].route);
  assert.ok(inv.skipped.some((s) => s.route === "/guides/draft-piece"));
});

// ---------------------------------------------------------------------------
// History + Publisher trailers
// ---------------------------------------------------------------------------

test("earlier brief reports are read from both history dirs, oldest first, fixtures ignored", () => {
  const dir = tempDir();
  const r = (date, extra = {}) => ({ agent: "content-brief-generator", reportDate: date, opportunities: [], ...extra });
  writeJson(dir, "reports/content-briefs/content-opportunities-2026-09-15.json", r("2026-09-15"));
  writeJson(dir, "reports/content-briefs-history/run-9/content-opportunities-2026-09-08.json", r("2026-09-08"));
  writeJson(dir, "reports/content-briefs/fixtures/content-opportunities-2026-09-14.json", r("2026-09-14", { fixtureData: true }));
  writeJson(dir, "reports/content-briefs/content-opportunities-2026-09-22.json", r("2026-09-22"));
  const reports = readPreviousReports({ repoRoot: dir, config, beforeDate: TODAY });
  assert.deepEqual(reports.map((x) => x.reportDate), ["2026-09-08", "2026-09-15"]);
});

test("Publisher commit trailers are parsed into fingerprints", () => {
  const log = `abc123def4567\x1f2026-09-25\x1fAdd rent vs buy guide\n\nLVINIT-Brief: BRIEF-2026-09-22-001\nLVINIT-Brief-Fingerprint: 0123456789ab\n\x1e`;
  const fps = parseTrailers(log, config);
  assert.deepEqual(fps.get("0123456789ab"), { commit: "abc123def456", date: "2026-09-25", briefId: "BRIEF-2026-09-22-001" });
});
