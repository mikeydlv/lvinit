import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { cleanSpokenText, loadTranscript, parseJsonTranscript, parsePlainText, parseSubtitles, sentencesFromSegments, toSeconds } from "../lib/transcript.mjs";
import { config, substantiveLines } from "./helpers.mjs";

const dir = mkdtempSync(join(tmpdir(), "yt-pipeline-"));

test("transcript required: no transcript listed", () => {
  const t = loadTranscript(dir, null, config);
  assert.equal(t.status, "TRANSCRIPT_REQUIRED");
  assert.equal(t.sentences.length, 0);
});

test("transcript required: listed file does not exist", () => {
  const t = loadTranscript(dir, { path: "missing.srt" }, config);
  assert.equal(t.status, "TRANSCRIPT_REQUIRED");
  assert.match(t.reason, /not found/);
});

test("transcript required: too short to stand in for the video", () => {
  writeFileSync(join(dir, "short.txt"), "Hi, I'm Mikey. Here's a quick one.");
  const t = loadTranscript(dir, { path: "short.txt" }, config);
  assert.equal(t.status, "TRANSCRIPT_REQUIRED");
  assert.match(t.reason, /words/);
});

test("transcript parsing: SRT with timecodes", () => {
  const segs = parseSubtitles("1\n00:00:01,000 --> 00:00:04,000\nShould you rent first?\n\n2\n00:00:04,500 --> 00:00:08,000\nIt depends on <i>how well</i> you know the valley.\n");
  assert.equal(segs.length, 2);
  assert.equal(segs[0].start, 1);
  assert.equal(segs[1].text, "It depends on how well you know the valley.");
});

test("transcript parsing: WebVTT", () => {
  const segs = parseSubtitles("WEBVTT\n\n00:01.000 --> 00:03.000\nFirst line.\n\n00:03.000 --> 00:05.500\nSecond line.\n");
  assert.deepEqual(segs.map((s) => s.start), [1, 3]);
});

test("transcript parsing: Resolve GetTranscription JSON with HH:MM:SS:FF timecode and silence markers", () => {
  const segs = parseJsonTranscript({ language: "en", segments: [{ start: "00:00:10:15", end: "00:00:12:00", text: "Hello there." }, { start: "00:00:12:00", end: "00:00:20:00", text: "(...)" }] }, { fps: 30 });
  assert.equal(segs.length, 1);
  assert.equal(segs[0].start, 10.5);
  assert.equal(toSeconds("1:02:03"), 3723);
});

test("transcript parsing: plain text with optional [m:ss] stamps", () => {
  const segs = parsePlainText("[0:05] Opening line.\n1:10 - Second line.\nNo stamp here.");
  assert.deepEqual(segs.map((s) => s.start), [5, 70, null]);
});

test("cleaning removes filler and stutters, never rewords", () => {
  assert.equal(cleanSpokenText("um, so the the valley is, uh, big"), "So the valley is, big");
  assert.equal(cleanSpokenText("You know, I think it's fine."), "I think it's fine.");
});

test("known mis-hearings of names are corrected in the pipeline and reported, never in the file", () => {
  writeFileSync(join(dir, "asr.txt"), `${substantiveLines("Summerland").join(" ")} I'm Mikey Del Rosario with the Scoffield Group and this is live in it. Living Las Vegas from the inside.`);
  const t = loadTranscript(dir, { path: "asr.txt" }, config);
  const text = t.sentences.map((s) => s.text).join(" ");
  assert.ok(!/Summerland|Scoffield|live in it/.test(text));
  assert.match(text, /Summerlin/);
  assert.match(text, /Scofield Group and this is LVINIT/);
  assert.ok(t.corrections.some((c) => c.corrected === "Summerlin" && c.count > 1));
  assert.equal(t.timestamps, false);
});

test("sentences keep the timecode of the segment they start in", () => {
  const s = sentencesFromSegments([
    { start: 0, text: "Should you rent first?" },
    { start: 65, text: "I'd rent first if you don't know the valley. Here's why." },
  ]);
  assert.equal(s.length, 3);
  assert.equal(s[1].timecode, "1:05");
  assert.equal(s[2].timecode, "1:05");
});

test("a real-length transcript loads as OK and unverified by default", () => {
  writeFileSync(join(dir, "long.txt"), substantiveLines("Spring Valley").join("\n"));
  const t = loadTranscript(dir, { path: "long.txt" }, config);
  assert.equal(t.status, "OK");
  assert.equal(t.verified, false);
  assert.ok(t.words > 150);
  assert.match(t.hash, /^[0-9a-f]{12}$/);
});
