import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { run } from "../run.mjs";
import { buildBriefFile } from "../lib/report.mjs";
import { buildBriefPublisherInput, collectBriefQueries, publicKeyQuestions } from "../lib/publisher-input.mjs";
import { main as buildMain } from "../publisher-input.mjs";
import { validateHandoff, findForbiddenKeys, assessInput } from "../../publisher-inputs/contract.mjs";

const quiet = () => {};

/** A minimal, real-shaped brief report: one actionable intent, one rejected. Synthetic. */
function report(over = {}) {
  return {
    schemaVersion: "1.0.0",
    agent: "content-brief-generator",
    generatedAt: "2026-09-29T13:10:00.000Z",
    reportDate: "2026-09-29",
    fixtureData: false,
    inputs: { gsc: { available: true, reportDate: "2026-09-28", lowVolume: true } },
    summary: { handoffMode: "dry-run" },
    opportunities: [
      {
        id: "BRIEF-2026-09-29-001",
        fingerprint: "d585c5768966",
        intentKey: "topic:place:summerlin",
        action: "UPDATE_EXISTING",
        target: "/neighborhoods/summerlin",
        proposedRoute: null,
        workingTitle: null,
        leadQuery: "what is it like living in summerlin",
        cluster: "neighborhood-orientation",
        shape: "topic",
        queries: [{ query: "what is it like living in summerlin", raw: { impressions: 40 } }],
        rankingPages: [{ route: "/neighborhoods/summerlin", impressions: 40 }],
        duplicateCheck: { verdict: "same", ambiguous: false, bestMatch: { route: "/neighborhoods/summerlin", overlap: 1, relation: "same" }, cannibalization: { status: "none" } },
        flags: [],
        score: 61.2,
        confidence: "medium",
        status: "NEW",
        handoffStatus: "REPORT_ONLY",
        persistenceRuns: 1,
        sourceGscReportDate: "2026-09-28",
      },
      { id: "BRIEF-2026-09-29-002", fingerprint: "aaaaaaaaaaaa", action: "REJECT_DUPLICATE", leadQuery: "summerlin", queries: [], confidence: "high" },
    ],
    navigationalQueries: { queries: [{ query: "10512 hidden canyon dr", raw: { impressions: 3 } }] },
    ...over,
  };
}

const briefFile = {
  id: "BRIEF-2026-09-29-001",
  contentType: "focused update of an existing page",
  primarySearchQuestion: "What does someone deciding where to live need to understand about Summerlin?",
  underlyingIntent: { intent: "informational" },
  keyQuestions: [
    "What does someone deciding where to live need to understand about Summerlin?",
    'Searchers literally ask: "what is it like living in summerlin"',
  ],
  relevantExistingPages: [{ route: "/neighborhoods/summerlin", relation: "same", overlap: 1 }],
  fairHousing: { clean: true },
  audit: { sourceQueries: ["what is it like living in summerlin"] },
};

test("valid Brief handoff: schema-valid, fresh, only Publisher actions, provenance kept", () => {
  const doc = buildBriefPublisherInput(report(), new Map([[briefFile.id, briefFile]]), { generatedAt: "2026-09-29T13:11:00.000Z" });
  assert.equal(validateHandoff("briefs", doc).valid, true);
  assert.equal(doc.status, "ok");
  assert.deepEqual(doc.items.map((i) => i.id), ["BRIEF-2026-09-29-001"]);
  assert.deepEqual(doc.skippedByAction, { REJECT_DUPLICATE: 1 });
  const item = doc.items[0];
  assert.equal(item.recommendedAction, "UPDATE_EXISTING");
  assert.equal(item.target, "/neighborhoods/summerlin");
  assert.equal(item.sourceGscReportDate, "2026-09-28");
  assert.equal(item.fingerprint, "d585c5768966");
  assert.equal(item.duplicateCheck.bestMatch.route, "/neighborhoods/summerlin");
  assert.equal(assessInput("briefs", doc, { today: "2026-09-30" }).usableForPrioritization, true);
});

test("Brief handoff never carries a raw query — including 'Searchers literally ask' questions", () => {
  const src = report();
  const doc = buildBriefPublisherInput(src, new Map([[briefFile.id, briefFile]]));
  assert.deepEqual(findForbiddenKeys(doc), []);
  assert.deepEqual(doc.items[0].keyQuestions, ["What does someone deciding where to live need to understand about Summerlin?"]);
  const text = JSON.stringify(doc).toLowerCase();
  for (const q of collectBriefQueries(src, briefFile)) if (q.includes(" ")) assert.equal(text.includes(q), false, q);
});

test("publicKeyQuestions drops any question containing a raw query", () => {
  const raw = new Set(["is southwest cheaper than summerlin"]);
  assert.deepEqual(publicKeyQuestions(["How do they differ?", "Is Southwest cheaper than Summerlin, really?"], raw), ["How do they differ?"]);
});

test("Fair Housing issue in generated text is flagged, and excludes the item", () => {
  const doc = buildBriefPublisherInput(report(), new Map([[briefFile.id, { ...briefFile, fairHousing: { clean: false } }]]));
  assert.equal(doc.items[0].fairHousingFlag, true);
  const a = assessInput("briefs", doc, { today: "2026-09-30" });
  assert.equal(a.usableItems.length, 0);
});

test("GSC unavailable to the Brief run: items marked source validation failed", () => {
  const doc = buildBriefPublisherInput(report({ inputs: { gsc: { available: false } } }));
  assert.equal(doc.items[0].sourceValidation, "failed");
  assert.equal(assessInput("briefs", doc, { today: "2026-09-30" }).usableItems.length, 0);
});

test("fixture Brief run: full pipeline → handoff stamped fixture, no raw queries, never usable", async () => {
  const r = await run(["--fixtures", "--dry-run", "--today=2026-09-29", "--no-history"], { log: quiet });
  assert.equal(r.exitCode, 0);
  const files = new Map(r.analysis.opportunities.filter((o) => o.brief).map((o) => [o.id, buildBriefFile(o, r.analysis)]));
  const doc = buildBriefPublisherInput(r.json, files);
  assert.equal(doc.fixture, true);
  assert.equal(doc.status, "fixture");
  assert.ok(doc.items.length > 0);
  assert.equal(validateHandoff("briefs", doc).valid, true);
  const text = JSON.stringify(doc).toLowerCase();
  for (const q of collectBriefQueries(r.json, ...files.values())) if (q.split(" ").length >= 3) assert.equal(text.includes(q), false, `leaked: ${q}`);
  assert.equal(assessInput("briefs", doc, { today: "2026-09-29" }).usableForPrioritization, false);
});

test("CLI: newest report in the directory (not fixtures/), its own briefs, writes only --out", () => {
  const dir = mkdtempSync(join(tmpdir(), "lvinit-brief-pi-"));
  mkdirSync(join(dir, "briefs"), { recursive: true });
  mkdirSync(join(dir, "fixtures"), { recursive: true });
  writeFileSync(join(dir, "content-opportunities-2026-09-22.json"), JSON.stringify(report({ reportDate: "2026-09-22" })));
  writeFileSync(join(dir, "content-opportunities-2026-09-29.json"), JSON.stringify(report()));
  writeFileSync(join(dir, "fixtures", "content-opportunities-2026-10-05.json"), JSON.stringify(report({ reportDate: "2026-10-05", fixtureData: true })));
  writeFileSync(join(dir, "briefs", `${briefFile.id}.json`), JSON.stringify(briefFile));
  const out = join(dir, "state", "publisher-input.json");
  const r = buildMain([`--report-dir=${dir}`, `--out=${out}`], { log: quiet, errorLog: quiet });
  assert.equal(r.exitCode, 0);
  const written = JSON.parse(readFileSync(out, "utf8"));
  assert.equal(written.reportDate, "2026-09-29");
  assert.equal(written.fixture, false);
  assert.equal(written.items[0].keyQuestions.length, 1);
});

test("CLI: no report → exit 1, nothing written", () => {
  const dir = mkdtempSync(join(tmpdir(), "lvinit-brief-pi-"));
  const out = join(dir, "publisher-input.json");
  assert.equal(buildMain([`--report-dir=${dir}`, `--out=${out}`], { log: quiet, errorLog: quiet }).exitCode, 1);
  assert.equal(existsSync(out), false);
});
