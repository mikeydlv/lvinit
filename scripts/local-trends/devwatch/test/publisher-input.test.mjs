import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { main } from "../run.mjs";
import { buildDevwatchPublisherInput, classify, nameInSources, looksLikePhrase, KNOWN_MISCLASSIFICATIONS, WINDOW_DAYS } from "../lib/publisher-input.mjs";
import { validateHandoff, assessInput } from "../../../publisher-inputs/contract.mjs";
import { TODAY } from "./helpers.mjs";

const quiet = () => {};

/** A daily-report event, shaped like buildDailyJson output. Synthetic. */
const ev = (over = {}) => ({
  id: "DEV-2026-09-27-001",
  fingerprint: "aaaaaaaaaaaa",
  entityId: "DEV-BELTWAY-TRAIL",
  entityName: "Beltway Trail",
  provisional: false,
  developer: null,
  jurisdiction: "North Las Vegas",
  area: "north-las-vegas",
  areaLabel: "North Las Vegas",
  topics: ["road"],
  eventType: "construction",
  status: "under construction",
  priorStatus: null,
  conflicts: [],
  date: "2026-09-27",
  evidence: "North Las Vegas broke ground on the 215 Northern Beltway Trail expansion.",
  score: 67,
  confidence: "Medium",
  fairHousing: { sensitiveSubject: false, framingClean: true },
  action: "ADD_TO_NEIGHBORHOOD_GUIDE",
  pillar: "/neighborhoods/north-las-vegas",
  firstSeen: "2026-09-27",
  sources: [{ name: "City of North Las Vegas", title: "Beltway Trail groundbreaking", url: "https://www.cityofnorthlasvegas.com/news/beltway-trail", authority: 2, evidence: null }],
  ...over,
});

const day = (date, events) => ({ schema_version: 1, agent: "development-watch", date, fixture: false, events });

test("valid Development Watch handoff: schema-valid, fresh, usable, primary source = verified", () => {
  const doc = buildDevwatchPublisherInput({ today: "2026-09-28", fixture: false, reports: [day("2026-09-27", [ev()])], generatedAt: "2026-09-28T13:40:00Z" });
  assert.equal(validateHandoff("devwatch", doc).valid, true);
  assert.equal(doc.status, "ok");
  const item = doc.items[0];
  assert.equal(item.project, "Beltway Trail");
  assert.equal(item.classification, "ok");
  assert.equal(item.verified, true);
  assert.equal(item.confidence, "medium");
  assert.deepEqual(item.sourceUrls, ["https://www.cityofnorthlasvegas.com/news/beltway-trail"]);
  const a = assessInput("devwatch", doc, { today: "2026-09-29" });
  assert.equal(a.freshness, "fresh");
  assert.equal(a.usableItems.length, 1);
});

test("only Publisher actions, only the last WINDOW_DAYS, newest event per project", () => {
  const reports = [
    day("2026-09-10", [ev({ id: "OLD", entityId: "DEV-OLD", entityName: "Old Project" })]),
    day("2026-09-24", [ev({ id: "E1", score: 50 }), ev({ id: "M", entityId: "DEV-M", action: "MONITOR_ONLY" }), ev({ id: "R", entityId: "DEV-R", action: "REJECT_LOW_VALUE" })]),
    day("2026-09-27", [ev({ id: "E2", score: 67 })]),
  ];
  const doc = buildDevwatchPublisherInput({ today: "2026-09-28", fixture: false, reports });
  assert.equal(WINDOW_DAYS, 7);
  assert.deepEqual(doc.items.map((i) => i.id), ["E2"]);
  assert.deepEqual(doc.window.reportsRead, ["2026-09-24", "2026-09-27"]);
});

test("Apex / Switch: a known misclassification is never published as ok", () => {
  assert.ok(KNOWN_MISCLASSIFICATIONS["DEV-APEX-INDUSTRIAL-PARK"]);
  const apex = ev({
    id: "DEV-2026-09-25-001",
    entityId: "DEV-APEX-INDUSTRIAL-PARK",
    entityName: "Apex Industrial Park",
    evidence: "Residents have questions after Switch data center expansion approved in southwest Las Vegas",
    sources: [{ title: "Switch proposes 175-acre data center campus in North Las Vegas", url: "https://ktnv.com/news/switch", authority: 8 }],
  });
  const doc = buildDevwatchPublisherInput({ today: "2026-09-28", fixture: false, reports: [day("2026-09-25", [apex])] });
  assert.equal(doc.items[0].classification, "needs_revalidation");
  assert.equal(doc.counts.needsRevalidation, 1);
  assert.equal(assessInput("devwatch", doc, { today: "2026-09-28" }).usableItems.length, 0);
});

test("misattribution heuristic: the project's name must appear in its own sources", () => {
  const good = ev();
  assert.equal(nameInSources(good), true);
  const bad = ev({ entityName: "Paradise Hills", evidence: "A company pulled out of a data center on BLM land.", sources: [{ title: "Developer pulls out of hyperscale data center", url: "https://x.example/a", authority: 8 }] });
  assert.equal(nameInSources(bad), false);
  assert.equal(classify(bad).classification, "needs_revalidation");
  assert.equal(nameInSources(bad, ["Paradise Hills", "BLM land"]), true, "aliases count");
});

test("a quoted phrase is not a project name", () => {
  assert.equal(looksLikePhrase("It’s not even about the money,"), true);
  assert.equal(looksLikePhrase("Beltway Trail"), false);
  assert.equal(classify(ev({ entityName: "It’s not even about the money," })).classification, "needs_revalidation");
});

test("provisional item is listed but excluded from prioritization", () => {
  const doc = buildDevwatchPublisherInput({ today: "2026-09-28", fixture: false, reports: [day("2026-09-28", [ev({ provisional: true })])] });
  assert.equal(doc.items[0].provisional, true);
  assert.deepEqual(assessInput("devwatch", doc, { today: "2026-09-28" }).excludedItems[0].reasons, ["provisional entity"]);
});

test("conflicting sources, Fair Housing framing, and no source URLs are all surfaced", () => {
  const doc = buildDevwatchPublisherInput({
    today: "2026-09-28",
    fixture: false,
    reports: [
      day("2026-09-28", [
        ev({ entityId: "A", conflicts: [{ field: "status" }] }),
        ev({ entityId: "B", entityName: "Beltway Trail", fairHousing: { sensitiveSubject: true, framingClean: true } }),
        ev({ entityId: "C", sources: [] }),
      ]),
    ],
  });
  const by = Object.fromEntries(doc.items.map((i) => [i.entityId, i]));
  assert.equal(by.A.classification, "needs_revalidation");
  assert.equal(by.B.fairHousingFlag, true);
  assert.equal(by.C.sourceValidation, "failed");
  assert.equal(assessInput("devwatch", doc, { today: "2026-09-28" }).usableItems.length, 0);
});

test("fixture run writes publisher-input.json into fixtures/, stamped fixture, never usable", async () => {
  const s = mkdtempSync(join(tmpdir(), "lvinit-devwatch-pi-"));
  const r = await main(["--fixtures", `--today=${TODAY}`, `--state-dir=${s}`], { log: quiet });
  assert.equal(r.exitCode, 0);
  const path = join(s, "reports", "development-watch", "fixtures", "publisher-input.json");
  assert.ok(existsSync(path));
  assert.equal(existsSync(join(s, "reports", "development-watch", "publisher-input.json")), false, "fixture never writes the real path");
  const doc = JSON.parse(readFileSync(path, "utf8"));
  assert.equal(doc.fixture, true);
  assert.equal(doc.status, "fixture");
  assert.equal(validateHandoff("devwatch", doc).valid, true);
  assert.equal(assessInput("devwatch", doc, { today: TODAY }).usableForPrioritization, false);
});

test("dry run writes no publisher input", async () => {
  const s = mkdtempSync(join(tmpdir(), "lvinit-devwatch-pi-"));
  await main(["--fixtures", "--dry-run", `--today=${TODAY}`, `--state-dir=${s}`], { log: quiet });
  assert.equal(existsSync(join(s, "reports")), false);
});
