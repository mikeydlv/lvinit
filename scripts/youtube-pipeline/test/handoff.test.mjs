import { test } from "node:test";
import assert from "node:assert/strict";

import { buildPackage, buildQueue, validateQueue } from "../lib/handoff.mjs";
import { buildHistory, parseTrailers, videoFingerprint } from "../lib/history.mjs";
import { confidenceFor } from "../lib/confidence.mjs";
import { analyze, config, fixtureTranscript, fixtureVideo, NO_TRANSCRIPT, substantiveLines, TODAY } from "./helpers.mjs";

const newArticle = (overrides = {}, transcript = fixtureTranscript(substantiveLines("Las Vegas renting versus buying")), opts = {}) =>
  analyze(fixtureVideo({ title: "Should You Rent First or Buy First in Las Vegas?", ...overrides }), transcript, opts);

test("handoff fingerprint: stable for the same video + target + action, different otherwise", () => {
  const a = videoFingerprint({ youtubeId: "2rboWkJ9j48", route: "/guides/x", action: "NEW_ARTICLE" });
  assert.equal(a, videoFingerprint({ youtubeId: "2rboWkJ9j48", route: "/guides/x", action: "NEW_ARTICLE" }));
  assert.notEqual(a, videoFingerprint({ youtubeId: "2rboWkJ9j48", route: "/guides/x", action: "UPDATE_EXISTING_ARTICLE" }));
  assert.notEqual(a, videoFingerprint({ youtubeId: "2rboWkJ9j48", route: "/guides/y", action: "NEW_ARTICLE" }));
  assert.match(a, /^[0-9a-f]{12}$/);
  assert.equal(newArticle().fingerprint, newArticle().fingerprint);
});

test("confidence: HIGH needs a verified transcript and no factual blockers", () => {
  const base = { group: { intentClarity: 1 }, overlap: { ambiguous: false, cannibalization: { status: "none" } }, classification: { action: "NEW_ARTICLE", provisional: false }, fairHousingStatus: { status: "CLEAR" } };
  assert.equal(confidenceFor({ ...base, transcript: { status: "OK", verified: true }, checklist: [] }).level, "high");
  assert.equal(confidenceFor({ ...base, transcript: { status: "OK", verified: false }, checklist: [] }).level, "medium");
  assert.equal(confidenceFor({ ...base, transcript: { status: "OK", verified: true }, checklist: [{ blocking: true }] }).level, "medium");
  assert.equal(confidenceFor({ ...base, transcript: { status: "TRANSCRIPT_REQUIRED" }, checklist: [] }).level, "low");
  assert.equal(confidenceFor({ ...base, transcript: { status: "OK", verified: true }, checklist: [], fairHousingStatus: { status: "BLOCKED", reason: "x" } }).level, "low");
});

test("lifecycle: READY_FOR_PUBLISHER when eligible, NEW without a transcript", () => {
  assert.equal(newArticle().lifecycle, "READY_FOR_PUBLISHER");
  assert.equal(newArticle({}, NO_TRANSCRIPT).lifecycle, "NEW");
});

test("lifecycle: HANDED_OFF after a live queue, then stalled after the retry ceiling", () => {
  const first = newArticle();
  const report = (date) => ({ reportDate: date, handoff: { mode: "live", queue: [{ fingerprint: first.fingerprint }] }, videos: [{ id: first.id, fingerprint: first.fingerprint, lifecycle: "READY_FOR_PUBLISHER", transcript: { hash: first.transcript.hash } }] });
  const once = newArticle({}, undefined, { history: buildHistory([report("2026-09-25")]) });
  assert.equal(once.lifecycle, "HANDED_OFF");
  assert.ok(once.handoff.blockers.includes("ALREADY_HANDED_OFF"));
  const twice = newArticle({}, undefined, { history: buildHistory([report("2026-09-18"), report("2026-09-25")]) });
  assert.ok(twice.handoff.blockers.includes("HANDOFF_STALLED"));
});

test("duplicate handoff prevention: a published fingerprint is never queued again", () => {
  const first = newArticle();
  const published = { available: true, fingerprints: new Map([[first.fingerprint, { commit: "abcdef1234567", date: TODAY }]]) };
  const again = newArticle({}, undefined, { published });
  assert.equal(again.lifecycle, "PUBLISHED");
  assert.equal(again.handoff.eligible, false);
  const q = buildQueue({ items: [again], config, reportDate: TODAY });
  assert.equal(q.queue.length, 0);
});

test("duplicate handoff prevention: a settled video is skipped until its transcript changes", () => {
  const dup = analyze(fixtureVideo({ title: "New Build vs Resale in Las Vegas: Which Should You Buy?", embeddedOn: ["/guides/new-build-vs-resale-las-vegas"], siteVideoObjectRoute: "/guides/new-build-vs-resale-las-vegas" }), NO_TRANSCRIPT);
  const history = buildHistory([{ reportDate: "2026-09-25", handoff: { mode: "dry-run", queue: [] }, videos: [{ id: dup.id, fingerprint: dup.fingerprint, lifecycle: "DUPLICATE", transcript: { hash: null } }] }]);
  const again = analyze(fixtureVideo({ title: "New Build vs Resale in Las Vegas: Which Should You Buy?", embeddedOn: ["/guides/new-build-vs-resale-las-vegas"], siteVideoObjectRoute: "/guides/new-build-vs-resale-las-vegas" }), NO_TRANSCRIPT, { history });
  assert.equal(again.settled.skip, true);
  assert.equal(again.lifecycle, "DUPLICATE");
});

test("Publisher commit trailers are parsed", () => {
  const log = "abc123\x1f2026-10-03\x1fAdd rent-first guide\n\nLVINIT-Video: VID-2026-10-02-001\nLVINIT-Video-Fingerprint: 0123456789ab\n\x1e";
  const map = parseTrailers(log, config);
  assert.equal(map.get("0123456789ab").commit, "abc123");
});

test("Publisher queue schema: dry-run, at most 2, low never queued, validated", () => {
  const items = [newArticle({ youtubeId: "FIXTUREvidA" }), newArticle({ youtubeId: "FIXTUREvidB" }), newArticle({ youtubeId: "FIXTUREvidC" }), newArticle({ youtubeId: "FIXTUREvidD" }, NO_TRANSCRIPT)];
  const q = buildQueue({ items, config, reportDate: TODAY });
  assert.equal(q.mode, "dry-run");
  assert.equal(q.queue.length, 2);
  assert.ok(q.queue.every((x) => x.confidence !== "low"));
  assert.deepEqual(validateQueue(q).problems, []);
  const bad = { ...q, mode: "live", fixtureData: true, queue: [...q.queue, { ...q.queue[0] }] };
  const r = validateQueue(bad);
  assert.equal(r.valid, false);
  assert.ok(r.problems.some((p) => /fixture/.test(p)));
  assert.ok(r.problems.some((p) => /max 2/.test(p)));
  assert.ok(r.problems.some((p) => /duplicate fingerprint/.test(p)));
});

test("handoff package carries every field the Publisher needs", () => {
  const pkg = buildPackage(newArticle(), { reportDate: TODAY, config });
  for (const k of ["fingerprint", "video", "transcript", "action", "proposedTitle", "proposedSlug", "proposedRoute", "metadata", "draft", "faq", "embed", "schema", "images", "internalLinks", "verificationChecklist", "confidence", "blockers", "publisherInstructions"]) {
    assert.ok(k in pkg, k);
  }
  assert.equal(pkg.video.url, "https://www.youtube.com/watch?v=FIXTUREvid1");
  assert.ok(pkg.publisherInstructions.some((s) => s.includes(config.handoff.trailerKey)));
});
