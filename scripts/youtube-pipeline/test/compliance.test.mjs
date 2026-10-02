import { test } from "node:test";
import assert from "node:assert/strict";

import { checkGenerated, fairHousing, fairHousingStatus, scanTranscript, voiceCheck } from "../lib/compliance.mjs";
import { analyze, fixtureTranscript, fixtureVideo, substantiveLines } from "./helpers.mjs";

test("Fair Housing block: steering phrases in generated text", () => {
  for (const phrase of ["The safest neighborhood in Las Vegas", "Best schools in Henderson", "Perfect for families", "A young professional area", "Great for retirees"]) {
    assert.ok(fairHousing(phrase).blocked, phrase);
  }
  const r = checkGenerated([{ field: "title", text: "Perfect for families: Summerlin" }]);
  assert.equal(r.clean, false);
  assert.equal(r.blocked[0].category, "familial-status");
});

test("Fair Housing: objective property and counting language is not blocked", () => {
  for (const ok of ["a single-family home", "before I looked at a single listing", "a single-story floor plan", "the commute to the Strip", "HOA dues and SID assessments"]) {
    assert.equal(fairHousing(ok).blocked, false, ok);
  }
  // …but the household sense of "single" still is.
  assert.ok(fairHousing("great for single people").blocked);
  assert.ok(fairHousing("popular with singles").blocked);
});

test("Fair Housing: spoken lines are flagged with their timecode, not silently dropped", () => {
  const flags = scanTranscript([
    { text: "This is a really safe area.", timecode: "3:10" },
    { text: "The drive to Summerlin is easy.", timecode: "3:20" },
  ]);
  assert.equal(flags.length, 1);
  assert.equal(flags[0].timecode, "3:10");
  assert.equal(flags[0].category, "safety-and-crime");
});

test("Fair Housing: a transcript flag never reaches the draft copy", () => {
  const lines = [...substantiveLines("Spring Valley"), "Honestly it's a really safe neighborhood for families."];
  const item = analyze(fixtureVideo({ title: "Living in Spring Valley, Las Vegas" }), fixtureTranscript(lines));
  assert.equal(item.fairHousing.status, "FLAGGED_SOURCE");
  const body = JSON.stringify(item.draft.sections);
  assert.ok(!/safe neighborhood for families/.test(body));
  assert.match(body, /FAIR HOUSING — removed/);
});

test("Fair Housing: a blocked video topic is never turned into content", () => {
  const item = analyze(fixtureVideo({ title: "Best Family-Friendly Neighborhoods in Las Vegas" }), fixtureTranscript(substantiveLines("Henderson")));
  assert.equal(item.action, "MONITOR_ONLY");
  assert.equal(item.fairHousing.status, "BLOCKED");
  assert.equal(item.lifecycle, "REJECTED");
  assert.equal(item.handoff.eligible, false);
});

test("status precedence: blocked > flagged > clear", () => {
  assert.equal(fairHousingStatus({ transcriptFlags: [], generated: { clean: true, blocked: [] } }).status, "CLEAR");
  assert.equal(fairHousingStatus({ transcriptFlags: [{}], generated: { clean: true, blocked: [] } }).status, "FLAGGED_SOURCE");
  assert.equal(fairHousingStatus({ transcriptFlags: [{}], generated: { clean: false, blocked: [{}] } }).status, "BLOCKED");
});

test("voice: no tourism or AI-boilerplate phrasing", () => {
  assert.equal(voiceCheck([{ field: "dek", text: "A vibrant community with something for everyone." }]).clean, false);
  assert.equal(voiceCheck([{ field: "dek", text: "Rent first if you don't know the valley yet." }]).clean, true);
});
