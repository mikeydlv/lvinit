import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { run } from "../run.mjs";
import {
  buildGscPublisherInput,
  sanitizeOpportunity,
  looksPersonal,
  collectRawQueries,
  assertNoRawQueries,
} from "../lib/publisher-input.mjs";
import { main as buildMain, findNewestReport } from "../publisher-input.mjs";
import { validateHandoff, findForbiddenKeys, assessInput } from "../../publisher-inputs/contract.mjs";

const quiet = () => {};

/** One synthetic finding, shaped like analyze.mjs output. */
const opp = (over = {}) => ({
  id: "GSC-2026-09-28-001",
  type: "quick-win",
  query: "summerlin vs henderson commute",
  landingPage: "/guides/summerlin-vs-henderson",
  landingPageExists: true,
  metrics: { impressions: 140, clicks: 4, position: 8.6, positionChange: 1.2 },
  score: 71.3,
  confidence: { level: "medium", caveats: [] },
  editorial: { relevance: 1, matchedPriorities: ["core-places", "comparison", "commute-access"], intent: "comparison", topicCluster: "area-comparison" },
  recommendationKind: "optimize-existing-page",
  recommendedAction: 'Tighten the page for "summerlin vs henderson commute".',
  whyItMatters: 'Google shows the page for "summerlin vs henderson commute".',
  handoff: { instruction: 'optimize for the search "summerlin vs henderson commute"' },
  ...over,
});

const report = (opportunities, over = {}) => ({
  schemaVersion: "1.1.0",
  generatedAt: "2026-09-28T13:05:00.000Z",
  reportDate: "2026-09-28",
  dataSource: "search-console",
  fixtureData: false,
  windows: { current: { start: "2026-08-29", end: "2026-09-25" } },
  totals: { currentImpressions: 60, currentClicks: 0 },
  dataQuality: { lowVolume: true, lowVolumeThreshold: 200, reportedFindings: opportunities.length },
  fairHousing: { excluded: [{ query: "best neighborhoods for young families", impressions: 9 }] },
  opportunities,
  searchDemand: {
    current: {
      queries: { rows: [{ query: "villa borega las vegas", impressions: 25 }, { query: "summerlin vs henderson commute", impressions: 140 }] },
      pairs: { rows: [{ query: "villa borega las vegas", route: "/search", impressions: 25 }] },
    },
  },
  ...over,
});

test("valid GSC handoff from a real-shaped report: schema-valid, fresh, usable", () => {
  const doc = buildGscPublisherInput(report([opp()]), { generatedAt: "2026-09-28T13:06:00.000Z" });
  assert.equal(validateHandoff("gsc", doc).valid, true);
  assert.equal(doc.status, "ok");
  assert.equal(doc.fixture, false);
  const item = doc.items[0];
  assert.deepEqual(
    { id: item.id, page: item.page, impressions: item.impressions, clicks: item.clicks, position: item.position, confidence: item.confidence, recommendedAction: item.recommendedAction },
    { id: "GSC-2026-09-28-001", page: "/guides/summerlin-vs-henderson", impressions: 140, clicks: 4, position: 8.6, confidence: "medium", recommendedAction: "optimize-existing-page" }
  );
  assert.equal(item.topic.label, "Area comparison · Summerlin, Henderson");
  assert.equal(item.querySuppressed, true);
  const a = assessInput("gsc", doc, { today: "2026-09-29" });
  assert.equal(a.usableForPrioritization, true);
  assert.ok(a.notes.some((n) => n.includes("early signal")), "low-volume warning carried through");
});

test("GSC handoff contains no raw query field and no raw query text", () => {
  const src = report([opp(), opp({ id: "GSC-2", type: "page-gaining-momentum", query: "villa borega las vegas", landingPage: "/search", editorial: { matchedPriorities: [], intent: "discovery", topicCluster: "general" } })]);
  const doc = buildGscPublisherInput(src);
  assert.deepEqual(findForbiddenKeys(doc), []);
  const text = JSON.stringify(doc).toLowerCase();
  for (const q of collectRawQueries(src)) assert.equal(text.includes(q), false, `raw query leaked: ${q}`);
  // The free-text fields that embed queries are never copied.
  for (const k of ["recommendedAction\":\"tighten", "whyItMatters", "handoff", "editorialAngle"]) assert.equal(text.includes(k.toLowerCase()), false, k);
});

test("address-like, phone-like and email-like queries are omitted entirely", () => {
  assert.equal(looksPersonal("1234 w sahara ave las vegas"), true);
  assert.equal(looksPersonal("10512 hidden canyon dr summerlin"), true);
  assert.equal(looksPersonal("unit 204 summerlin condo"), true);
  assert.equal(looksPersonal("702 555 0199"), true);
  assert.equal(looksPersonal("someone@example.com"), true);
  assert.equal(looksPersonal("moving to las vegas 2026 best place"), false, "a year is not a house number");
  assert.equal(looksPersonal("summerlin vs henderson"), false);

  const doc = buildGscPublisherInput(report([opp({ id: "A", query: "10512 hidden canyon dr summerlin" }), opp({ id: "B" })]));
  assert.deepEqual(doc.items.map((i) => i.id), ["B"]);
  assert.equal(doc.privacy.omitted.addressLike, 1);
  assert.equal(JSON.stringify(doc).includes("hidden canyon"), false);
});

test("Fair-Housing-blocked queries never reach the handoff", () => {
  const r = sanitizeOpportunity(opp({ query: "best neighborhoods for young families in summerlin" }));
  assert.equal(r.omit, "fairHousing");
});

test("a finding that cannot be described without its query is omitted", () => {
  const r = sanitizeOpportunity(
    opp({ type: "content-gap", query: "villa borega hoa gate code", landingPage: "/search", landingPageExists: true, editorial: { matchedPriorities: [], topicCluster: "general" } })
  );
  assert.equal(r.omit, "notRepresentable");
});

test("page-level findings without a query are kept, labelled by page", () => {
  const r = sanitizeOpportunity(opp({ type: "page-gaining-momentum", query: null, landingPage: "/guides/las-vegas-home-prices-july-2026", editorial: { matchedPriorities: [], topicCluster: null } }));
  assert.equal(r.item.topic.label, "Page gaining momentum · /guides/las-vegas-home-prices-july-2026");
  assert.equal(r.item.querySuppressed, false);
});

test("leak guard: refuses when a raw query or query key would be published", () => {
  const raw = new Set(["villa borega las vegas"]);
  assert.throws(() => assertNoRawQueries({ items: [{ topic: { label: "Villa Borega Las Vegas" } }] }, raw), /raw query/);
  assert.throws(() => assertNoRawQueries({ items: [{ topic: { label: "x" }, note: "villa borega las vegas" }] }, raw), /raw query/);
  assert.throws(() => assertNoRawQueries({ items: [{ query: "x" }] }, new Set()), /query-bearing key/);
  // A query made only of our own vocabulary is not a leak.
  assert.doesNotThrow(() => assertNoRawQueries({ items: [{ topic: { label: "Summerlin" } }] }, new Set(["summerlin"])));
});

test("fixture report: handoff is stamped fixture and never usable", async () => {
  const r = await run(["--fixtures", "--dry-run", "--today=2026-09-28"], { log: quiet });
  const doc = buildGscPublisherInput(r.json);
  assert.equal(doc.fixture, true);
  assert.equal(doc.status, "fixture");
  assert.deepEqual(findForbiddenKeys(doc), []);
  assert.ok(collectRawQueries(r.json).size > 10, "the fixture really has queries to leak");
  assert.doesNotThrow(() => assertNoRawQueries(doc, collectRawQueries(r.json)));
  // Multi-word fixture queries never appear verbatim.
  const text = JSON.stringify(doc).toLowerCase();
  for (const q of collectRawQueries(r.json)) if (q.split(" ").length >= 3) assert.equal(text.includes(q), false, `fixture query leaked: ${q}`);
  assert.equal(assessInput("gsc", doc, { today: "2026-09-28" }).usableForPrioritization, false);
});

test("CLI: picks the newest report by date from a downloaded-artifact tree, writes only --out", () => {
  const dir = mkdtempSync(join(tmpdir(), "lvinit-gsc-pi-"));
  mkdirSync(join(dir, "reports", "run-1"), { recursive: true });
  mkdirSync(join(dir, "reports", "run-2"), { recursive: true });
  writeFileSync(join(dir, "reports", "run-2", "gsc-opportunities-2026-09-21.json"), JSON.stringify(report([opp()], { reportDate: "2026-09-21" })));
  writeFileSync(join(dir, "reports", "run-1", "gsc-opportunities-2026-09-28.json"), JSON.stringify(report([opp()])));
  assert.match(findNewestReport(join(dir, "reports")), /2026-09-28/);

  const out = join(dir, "state", "reports", "gsc", "publisher-input.json");
  const r = buildMain([`--report-dir=${join(dir, "reports")}`, `--out=${out}`], { log: quiet, errorLog: quiet });
  assert.equal(r.exitCode, 0);
  const written = JSON.parse(readFileSync(out, "utf8"));
  assert.equal(written.reportDate, "2026-09-28");
  assert.equal(validateHandoff("gsc", written).valid, true);
});

test("CLI: no report → exit 1, nothing written", () => {
  const dir = mkdtempSync(join(tmpdir(), "lvinit-gsc-pi-"));
  const out = join(dir, "publisher-input.json");
  const r = buildMain([`--report-dir=${dir}`, `--out=${out}`], { log: quiet, errorLog: quiet });
  assert.equal(r.exitCode, 1);
  assert.equal(existsSync(out), false);
});
