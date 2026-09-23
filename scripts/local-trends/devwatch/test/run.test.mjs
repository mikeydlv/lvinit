import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { main } from "../run.mjs";
import { run as runTrends } from "../../run.mjs";
import { applyRun, assignLifecycles } from "../lib/state.mjs";
import { config, emptyState, published, TODAY } from "./helpers.mjs";

const quiet = () => {};
const tmp = () => mkdtempSync(join(tmpdir(), "lvinit-devwatch-"));
const fx = (s) => join(s, "reports", "development-watch", "fixtures");

test("fixture run: Markdown + JSON + dry-run queue + signals, with every required section", async () => {
  const s = tmp();
  const r = await main(["--fixtures", `--today=${TODAY}`, `--state-dir=${s}`], { log: quiet });
  assert.equal(r.exitCode, 0);
  const md = readFileSync(join(fx(s), `development-watch-${TODAY}.md`), "utf8");
  for (const h of ["## Executive summary", "## High-priority changes", "## What would be handed to the Publisher (dry-run)", "## Monitor list", "## Source conflicts", "## Suppressed as duplicate or noise", "## Source health", "FIXTURE RUN"]) assert.ok(md.includes(h), h);
  for (const f of ["**Stable ID / fingerprint:**", "**Prior status:**", "**Current status:**", "**Confidence:**", "**LVINIT relevance:**", "**Existing LVINIT coverage:**", "**Recommended action:**", "**Handoff:**", "**Detected:**", "**Verified:**", "**Interpretation (not fact):**"]) assert.ok(md.includes(f), f);

  const json = JSON.parse(readFileSync(join(fx(s), `development-watch-${TODAY}.json`), "utf8"));
  assert.equal(json.agent, "development-watch");
  for (const k of ["sourcesChecked", "sourcesFailed", "newEvents", "materialUpdates", "duplicatesIgnored", "monitorOnly", "handoffCandidates"]) assert.ok(k in json.summary, k);
  assert.ok(json.events.every((e) => /^DEV-\d{4}-\d{2}-\d{2}-\d{3}$/.test(e.id) && /^[0-9a-f]{12}$/.test(e.fingerprint)));

  const queue = JSON.parse(readFileSync(join(fx(s), "handoff-queue.json"), "utf8"));
  assert.equal(queue.mode, "dry-run", "v1 never goes live");
  assert.ok(queue.queue.length <= config.handoff.maxPerRun);
  for (const q of queue.queue) assert.ok(q.primarySources.length > 0 && q.publisherInstructions.some((i) => i.includes("LVINIT-DevWatch-Fingerprint")));

  const signals = JSON.parse(readFileSync(join(fx(s), "local-development-signals.json"), "utf8"));
  assert.equal(signals.signalType, "LOCAL_DEVELOPMENT_SIGNAL");
  assert.equal(signals.notSearchDemand, true);
  assert.equal(existsSync(join(s, "data")), false, "fixture runs never touch real state");
});

test("second run with the same items: nothing re-surfaces", async () => {
  const s = tmp();
  await main(["--fixtures", `--today=${TODAY}`, `--state-dir=${s}`], { log: quiet });
  const r = await main(["--fixtures", "--today=2026-09-23", `--state-dir=${s}`], { log: quiet });
  assert.equal(r.daily.json.summary.meaningfulChanges, 0);
  assert.ok(r.daily.markdown.includes("0 meaningful changes today."));
  assert.equal(r.daily.json.summary.itemsUnchanged, r.daily.json.summary.itemsRead);
});

test("dry run writes nothing", async () => {
  const s = tmp();
  const r = await main(["--fixtures", "--dry-run", `--today=${TODAY}`, `--state-dir=${s}`], { log: quiet });
  assert.equal(r.exitCode, 0);
  assert.equal(existsSync(join(s, "reports")), false);
});

test("weekly summary counts meaningful changes and suppressed noise", async () => {
  const s = tmp();
  await main(["--fixtures", `--today=${TODAY}`, `--state-dir=${s}`], { log: quiet });
  await main(["--fixtures", "--mode=weekly", "--today=2026-09-23", `--state-dir=${s}`], { log: quiet });
  const weekly = readFileSync(join(fx(s), "weekly.md"), "utf8");
  assert.match(weekly, /meaningful change/);
  assert.match(weekly, /duplicate\/noise items suppressed/);
});

test("lifecycle: NEW → PERSISTING → RESOLVED when superseded; UPDATED on first primary source", () => {
  const today1 = "2026-09-22";
  const ev = (over) => ({ fingerprint: "aaaaaaaaaaaa", entityId: "DEV-X", entityName: "X", changeClass: "NEW", changes: [{ kind: "NEW_PROJECT", detail: "new" }], eventType: "approval", status: "approved", sources: [{ name: "RJ", url: "u1", authority: 8 }], coverage: [], action: "MONITOR_ONLY", confidence: "Medium", handoff: { eligible: false, blockers: [] }, ...over });
  let state = emptyState();
  let n = 0;
  const nextId = () => `DEV-${today1}-${String(++n).padStart(3, "0")}`;
  const e1 = assignLifecycles(state, [ev()], { today: today1, published: published(), nextId });
  assert.equal(e1[0].lifecycle, "NEW");
  state = { ...state, ...applyRun(state, e1, { today: today1, entitiesById: new Map(), published: published(), config }) };

  const e2 = assignLifecycles(state, [ev({ changeClass: "DUPLICATE" })], { today: "2026-09-23", published: published(), nextId });
  assert.equal(e2[0].lifecycle, "PERSISTING");
  assert.equal(e2[0].id, e1[0].id, "a persisting event keeps its id");

  const e3 = assignLifecycles(state, [ev({ changeClass: "DUPLICATE", sources: [{ name: "City", url: "u2", authority: 1 }] })], { today: "2026-09-24", published: published(), nextId });
  assert.equal(e3[0].lifecycle, "UPDATED", "verification improved");

  const e4 = assignLifecycles(state, [ev({ fingerprint: "bbbbbbbbbbbb", changeClass: "MATERIAL_UPDATE", status: "under construction" })], { today: "2026-09-30", published: published(), nextId });
  state = { ...state, ...applyRun(state, e4, { today: "2026-09-30", entitiesById: new Map(), published: published(), config }) };
  assert.equal(state.events.aaaaaaaaaaaa.lifecycle, "RESOLVED");
  assert.equal(state.events.aaaaaaaaaaaa.superseded_by, "bbbbbbbbbbbb");

  const aged = applyRun(state, [], { today: "2026-12-30", entitiesById: new Map(), published: published(), config });
  assert.equal(aged.events.bbbbbbbbbbbb.lifecycle, "RESOLVED", "aged out after staleAfterDays");
});

test("the Local Trend Agent runs Development Watch on its own collection with --devwatch", async () => {
  const s = tmp();
  const r = await runTrends(["--fixtures", "--devwatch", `--today=${TODAY}`, `--state-dir=${s}`], { log: quiet });
  assert.equal(r.exitCode, 0);
  assert.ok(r.devwatch && r.devwatch.exitCode === 0);
  assert.ok(readdirSync(fx(s)).includes(`development-watch-${TODAY}.md`));
  assert.ok(readdirSync(join(s, "reports", "social-trends", "fixtures")).includes(`${TODAY}-local-trends.md`), "trend report still written");
});

test("without --devwatch the Local Trend Agent is unchanged", async () => {
  const s = tmp();
  const r = await runTrends(["--fixtures", `--today=${TODAY}`, `--state-dir=${s}`], { log: quiet });
  assert.equal(r.devwatch, null);
  assert.equal(existsSync(join(s, "reports", "development-watch")), false);
});
