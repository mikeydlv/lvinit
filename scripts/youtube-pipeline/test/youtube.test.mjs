import { test } from "node:test";
import assert from "node:assert/strict";

import {
  clockToSeconds,
  extractVideoId,
  isoDurationToSeconds,
  isValidUploadDate,
  normalizeYouTubeUrl,
  secondsToIsoDuration,
  videoUrls,
} from "../lib/youtube.mjs";

test("video id extraction: every URL shape LVINIT sees", () => {
  const id = "2rboWkJ9j48";
  for (const v of [
    id,
    `https://www.youtube.com/watch?v=${id}`,
    `https://youtube.com/watch?v=${id}&t=42s`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}`,
    `https://youtu.be/${id}?si=abc`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`,
    `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube.com/live/${id}`,
    `youtube.com/watch?v=${id}`,
  ]) {
    assert.equal(extractVideoId(v), id, v);
  }
});

test("video id extraction: rejects anything that is not an 11-character YouTube id", () => {
  for (const v of ["", null, "abc", "https://vimeo.com/123456789", "https://www.youtube.com/watch?v=short", "https://example.com/watch?v=2rboWkJ9j48", "2rboWkJ9j48X"]) {
    assert.equal(extractVideoId(v), null, String(v));
  }
});

test("YouTube URL normalization: one canonical watch URL", () => {
  assert.equal(normalizeYouTubeUrl("https://youtu.be/2rboWkJ9j48?si=x"), "https://www.youtube.com/watch?v=2rboWkJ9j48");
  assert.equal(normalizeYouTubeUrl("https://www.youtube-nocookie.com/embed/2rboWkJ9j48"), "https://www.youtube.com/watch?v=2rboWkJ9j48");
  assert.equal(normalizeYouTubeUrl("not a url"), null);
  const u = videoUrls("2rboWkJ9j48");
  assert.equal(u.embed, "https://www.youtube.com/embed/2rboWkJ9j48");
  assert.equal(u.nocookieEmbed, "https://www.youtube-nocookie.com/embed/2rboWkJ9j48");
});

test("durations convert, never estimate", () => {
  assert.equal(clockToSeconds("8:08"), 488);
  assert.equal(clockToSeconds("1:02:03"), 3723);
  assert.equal(clockToSeconds("8:61"), null);
  assert.equal(secondsToIsoDuration(488), "PT8M8S");
  assert.equal(secondsToIsoDuration(3600), "PT1H");
  assert.equal(secondsToIsoDuration(0), null);
  assert.equal(secondsToIsoDuration(undefined), null);
  assert.equal(isoDurationToSeconds("PT14M34S"), 874);
  assert.equal(isoDurationToSeconds("PT"), null);
  assert.equal(isoDurationToSeconds("14:34"), null);
});

test("upload dates must be real ISO dates", () => {
  assert.ok(isValidUploadDate("2026-08-17"));
  assert.ok(isValidUploadDate("2026-08-17T13:11:50-07:00"));
  assert.ok(!isValidUploadDate("August 17, 2026"));
  assert.ok(!isValidUploadDate("2026-08-17T13:11:50"));
  assert.ok(!isValidUploadDate(null));
});
