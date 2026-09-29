import test from "node:test";
import assert from "node:assert/strict";

import { INPUTS, ageInDays, freshnessFor, validateHandoff, assessInput, assessAll } from "../contract.mjs";
import { readAll, main as readMain } from "../read.mjs";

const TODAY = "2026-09-28";

// --- Synthetic, schema-valid handoff documents -------------------------------

const gscDoc = (over = {}) => ({
  schema_version: 1,
  agent: "gsc-opportunity-agent",
  generatedAt: "2026-09-22T18:10:00.000Z",
  reportDate: "2026-09-22",
  fixture: false,
  status: "ok",
  dataQuality: { lowVolume: false },
  items: [
    {
      id: "GSC-2026-09-22-001",
      opportunityType: "quick-win",
      page: "/neighborhoods/summerlin",
      topic: { label: "Neighborhood orientation · Summerlin", cluster: "neighborhood-orientation", places: ["summerlin"], priorities: [] },
      impressions: 120,
      clicks: 3,
      position: 9.4,
      score: 72,
      confidence: "medium",
      recommendedAction: "optimize-existing-page",
    },
  ],
  ...over,
});

const briefItem = (over = {}) => ({
  id: "BRIEF-2026-09-23-001",
  fingerprint: "abc123def456",
  recommendedAction: "UPDATE_EXISTING",
  cluster: "neighborhood-orientation",
  keyQuestions: ["What does someone deciding where to live need to understand about Summerlin?"],
  relatedPages: [{ route: "/neighborhoods/summerlin", relation: "same", overlap: 1 }],
  duplicateCheck: { verdict: "same" },
  confidence: "medium",
  sourceGscReportDate: "2026-09-22",
  fairHousingFlag: false,
  sourceValidation: "ok",
  ...over,
});

const briefDoc = (over = {}) => ({
  schema_version: 1,
  agent: "content-brief-generator",
  generatedAt: "2026-09-23T13:20:00.000Z",
  reportDate: "2026-09-23",
  fixture: false,
  status: "ok",
  items: [briefItem()],
  ...over,
});

const devItem = (over = {}) => ({
  id: "DEV-2026-09-27-001",
  project: "Beltway Trail",
  type: "construction",
  sourceUrls: ["https://www.cityofnorthlasvegas.com/news/beltway-trail"],
  significance: 67,
  confidence: "medium",
  verified: true,
  provisional: false,
  classification: "ok",
  fairHousingFlag: false,
  sourceValidation: "ok",
  reportDate: "2026-09-27",
  ...over,
});

const devDoc = (over = {}) => ({
  schema_version: 1,
  agent: "development-watch",
  generatedAt: "2026-09-27T13:35:00.000Z",
  reportDate: "2026-09-27",
  fixture: false,
  status: "ok",
  items: [devItem()],
  ...over,
});

// --- Paths and ownership -----------------------------------------------------

test("three stable paths, each on the state branch, each with one named writer", () => {
  assert.deepEqual(
    Object.values(INPUTS).map((i) => i.path),
    ["reports/gsc/publisher-input.json", "reports/content-briefs/publisher-input.json", "reports/development-watch/publisher-input.json"]
  );
  const writers = Object.values(INPUTS).map((i) => i.writer);
  assert.equal(new Set(writers).size, 3, "no file shares a writer entry");
  assert.ok(writers.every((w) => !/publisher/i.test(w.split(" ")[0])), "the Publisher writes none of them");
});

// --- Freshness ---------------------------------------------------------------

test("age and freshness bands match the documented thresholds", () => {
  assert.equal(ageInDays("2026-09-20", TODAY), 8);
  assert.equal(ageInDays("2026-09-20T23:59:00Z", TODAY), 8);
  assert.equal(ageInDays(null, TODAY), null);
  assert.equal(freshnessFor("gsc", 8), "fresh");
  assert.equal(freshnessFor("gsc", 9), "caution");
  assert.equal(freshnessFor("gsc", 15), "caution");
  assert.equal(freshnessFor("gsc", 16), "stale");
  assert.equal(freshnessFor("briefs", 8), "fresh");
  assert.equal(freshnessFor("briefs", 16), "stale");
  assert.equal(freshnessFor("devwatch", 2), "fresh");
  assert.equal(freshnessFor("devwatch", 3), "caution");
  assert.equal(freshnessFor("devwatch", 7), "caution");
  assert.equal(freshnessFor("devwatch", 8), "stale");
});

// --- Valid, fresh inputs -----------------------------------------------------

test("valid fresh GSC handoff is usable", () => {
  const a = assessInput("gsc", gscDoc(), { today: TODAY });
  assert.equal(a.availability, "available");
  assert.equal(a.freshness, "fresh");
  assert.equal(a.ageDays, 6);
  assert.equal(a.usableForPrioritization, true);
  assert.equal(a.usableItems.length, 1);
});

test("low-volume GSC is flagged as an early signal", () => {
  const a = assessInput("gsc", gscDoc({ dataQuality: { lowVolume: true } }), { today: TODAY });
  assert.equal(a.usableForPrioritization, true);
  assert.ok(a.notes.some((n) => n.includes("early signal")));
});

test("valid fresh Brief handoff is usable", () => {
  const a = assessInput("briefs", briefDoc(), { today: TODAY });
  assert.equal(a.freshness, "fresh");
  assert.equal(a.usableForPrioritization, true);
  assert.equal(a.usableItems.length, 1);
});

test("valid fresh Development Watch handoff is usable, with a re-verify note", () => {
  const a = assessInput("devwatch", devDoc(), { today: TODAY });
  assert.equal(a.freshness, "fresh");
  assert.equal(a.usableForPrioritization, true);
  assert.ok(a.notes.some((n) => n.includes("re-verify")));
});

// --- GSC privacy -------------------------------------------------------------

test("a GSC handoff with a raw query field is invalid", () => {
  const doc = gscDoc();
  doc.items[0].query = "homes near 1234 example st";
  const v = validateHandoff("gsc", doc);
  assert.equal(v.valid, false);
  assert.ok(v.problems.some((p) => p.includes("forbidden query-bearing key at $.items[0].query")));
  assert.equal(assessInput("gsc", doc, { today: TODAY }).availability, "invalid");
});

test("a Brief handoff carrying gsc query rows is invalid", () => {
  const v = validateHandoff("briefs", briefDoc({ items: [briefItem({ leadQuery: "x" })] }));
  assert.equal(v.valid, false);
});

// --- Stale, missing, fixture -------------------------------------------------

test("stale timestamps: background only", () => {
  const gsc = assessInput("gsc", gscDoc({ generatedAt: "2026-09-10T00:00:00Z", reportDate: "2026-09-10" }), { today: TODAY });
  assert.equal(gsc.freshness, "stale");
  assert.equal(gsc.usableForPrioritization, false);
  assert.equal(gsc.usableItems.length, 0);
  const dev = assessInput("devwatch", devDoc({ generatedAt: "2026-09-19T00:00:00Z", reportDate: "2026-09-19" }), { today: TODAY });
  assert.equal(dev.freshness, "stale");
  assert.equal(dev.usableForPrioritization, false);
});

test("caution band stays usable but is reported", () => {
  const a = assessInput("gsc", gscDoc({ generatedAt: "2026-09-16T00:00:00Z", reportDate: "2026-09-16" }), { today: TODAY });
  assert.equal(a.freshness, "caution");
  assert.equal(a.usableForPrioritization, true);
  assert.ok(a.notes.some((n) => n.startsWith("caution")));
});

test("age runs from the OLDER timestamp — republishing old data does not freshen it", () => {
  const a = assessInput("gsc", gscDoc({ generatedAt: "2026-09-28T00:00:00Z", reportDate: "2026-09-05" }), { today: TODAY });
  assert.equal(a.freshness, "stale");
  assert.equal(a.usableForPrioritization, false);
});

test("missing timestamp: not usable for prioritization", () => {
  const noGen = assessInput("gsc", gscDoc({ generatedAt: undefined }), { today: TODAY });
  assert.equal(noGen.usableForPrioritization, false);
  assert.ok(noGen.reasons.includes("generatedAt is missing"));
  const noDate = assessInput("devwatch", devDoc({ reportDate: null }), { today: TODAY });
  assert.equal(noDate.usableForPrioritization, false);
  assert.ok(noDate.reasons.includes("reportDate is missing"));
});

test("future timestamp: not usable", () => {
  const a = assessInput("gsc", gscDoc({ generatedAt: "2026-10-09T00:00:00Z", reportDate: "2026-10-09" }), { today: TODAY });
  assert.equal(a.usableForPrioritization, false);
});

test("fixture = true: never usable", () => {
  const a = assessInput("gsc", gscDoc({ fixture: true, status: "fixture" }), { today: TODAY });
  assert.equal(a.usableForPrioritization, false);
  assert.ok(a.reasons.includes("fixture data"));
  const b = assessInput("briefs", briefDoc({ fixture: true }), { today: TODAY });
  assert.equal(b.usableForPrioritization, false);
});

// --- Item exclusions ---------------------------------------------------------

test("provisional Development Watch item is excluded", () => {
  const a = assessInput("devwatch", devDoc({ items: [devItem(), devItem({ id: "DEV-X", provisional: true })] }), { today: TODAY });
  assert.equal(a.usableForPrioritization, true);
  assert.deepEqual(a.usableItems.map((i) => i.id), ["DEV-2026-09-27-001"]);
  assert.deepEqual(a.excludedItems, [{ id: "DEV-X", reasons: ["provisional entity"] }]);
});

test("classification = needs_revalidation is excluded (the Apex / Switch case)", () => {
  const apex = devItem({ id: "DEV-APEX", project: "Apex Industrial Park", classification: "needs_revalidation" });
  const a = assessInput("devwatch", devDoc({ items: [apex] }), { today: TODAY });
  assert.equal(a.usableItems.length, 0);
  assert.deepEqual(a.excludedItems[0].reasons, ["classification needs revalidation"]);
});

test("Fair Housing flag and failed source validation exclude an item", () => {
  const a = assessInput(
    "devwatch",
    devDoc({ items: [devItem({ id: "A", fairHousingFlag: true }), devItem({ id: "B", sourceValidation: "failed", sourceUrls: [] })] }),
    { today: TODAY }
  );
  assert.equal(a.usableItems.length, 0);
  assert.match(a.excludedItems[0].reasons[0], /Fair Housing/);
  assert.match(a.excludedItems[1].reasons[0], /source validation failed/);
});

test("a brief built on GSC data older than 15 days is excluded", () => {
  const a = assessInput("briefs", briefDoc({ items: [briefItem({ sourceGscReportDate: "2026-09-10" }), briefItem({ id: "B2", sourceGscReportDate: null })] }), { today: TODAY });
  assert.equal(a.usableItems.length, 0);
  assert.match(a.excludedItems[0].reasons[0], /18 days old/);
  assert.match(a.excludedItems[1].reasons[0], /no source GSC report date/);
});

test("low-confidence items are usable but marked as never the sole reason", () => {
  const a = assessInput("gsc", gscDoc({ items: [{ ...gscDoc().items[0], confidence: "low" }] }), { today: TODAY });
  assert.deepEqual(a.lowConfidenceItems, ["GSC-2026-09-22-001"]);
  assert.ok(a.notes.some((n) => n.includes("sole reason")));
});

// --- Invalid schema ----------------------------------------------------------

test("invalid schema: wrong agent, wrong version, bad items", () => {
  assert.equal(validateHandoff("gsc", gscDoc({ agent: "someone-else" })).valid, false);
  assert.equal(validateHandoff("gsc", gscDoc({ schema_version: 2 })).valid, false);
  assert.equal(validateHandoff("briefs", briefDoc({ items: "nope" })).valid, false);
  assert.equal(validateHandoff("devwatch", devDoc({ items: [devItem({ classification: "fine" })] })).valid, false);
  assert.equal(validateHandoff("devwatch", devDoc({ items: [devItem({ verified: "yes" })] })).valid, false);
  assert.equal(validateHandoff("gsc", []).valid, false);
  const a = assessInput("devwatch", devDoc({ status: "great" }), { today: TODAY });
  assert.equal(a.availability, "invalid");
  assert.equal(a.usableForPrioritization, false);
});

// --- Missing inputs never block ----------------------------------------------

test("one missing upstream input: reported unavailable, the others still usable", () => {
  const r = assessAll({ gsc: gscDoc(), briefs: null, devwatch: devDoc() }, { today: TODAY });
  const briefs = r.inputs.find((i) => i.kind === "briefs");
  assert.equal(briefs.availability, "unavailable");
  assert.deepEqual(r.usable, ["gsc", "devwatch"]);
  assert.equal(r.canProceed, true);
  assert.equal(r.fallback, null);
});

test("all inputs missing: still proceeds, from repo + cluster map + research", () => {
  const r = assessAll({}, { today: TODAY });
  assert.equal(r.canProceed, true);
  assert.deepEqual(r.usable, []);
  assert.match(r.fallback, /LVINIT_CONTENT_CLUSTER_MAP/);
});

// --- Reader (git show is injected — no network, no repo writes) ---------------

test("reader: reads via git show, tolerates a missing file and bad JSON, never throws", () => {
  const files = {
    "origin/lvinit-agent-state:reports/gsc/publisher-input.json": JSON.stringify(gscDoc()),
    "origin/lvinit-agent-state:reports/content-briefs/publisher-input.json": "{ not json",
  };
  const calls = [];
  const show = (args) => {
    calls.push(args.join(" "));
    if (args[0] === "fetch") return "";
    if (args[0] !== "show") throw new Error("unexpected git command");
    if (!(args[1] in files)) throw new Error("fatal: path does not exist");
    return files[args[1]];
  };
  const { docs, readErrors } = readAll({ show });
  assert.ok(docs.gsc);
  assert.equal(docs.briefs, null);
  assert.match(readErrors.briefs, /unparseable/);
  assert.match(readErrors.devwatch, /not found/);

  const out = [];
  const r = readMain([`--today=${TODAY}`, "--json"], { log: (s) => out.push(s), show });
  assert.equal(r.exitCode, 0);
  assert.deepEqual(r.assessment.usable, ["gsc"]);
  assert.ok(calls.every((c) => c.startsWith("fetch ") || c.startsWith("show ")), "read-only git commands only");
  assert.ok(!calls.some((c) => /run download|artifact/.test(c)));
});
