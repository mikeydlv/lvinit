// ---------------------------------------------------------------------------
// FIXTURES — synthetic videos for `--fixtures` and the tests
//
// Nothing here is a real LVINIT video, a real transcript, or a real fact about
// Las Vegas. Ids start with "FIXTURE" so they can never be mistaken for real
// ones, and every report built from them is stamped FIXTURE.
// ---------------------------------------------------------------------------

import { createHash } from "node:crypto";

import { sentencesFromSegments } from "../lib/transcript.mjs";
import { videoUrls } from "../lib/youtube.mjs";

/** A transcript object as loadTranscript would return it, from plain lines. */
export function fixtureTranscript(lines, { verified = true, startStep = 6 } = {}) {
  const segments = lines.map((text, i) => ({ start: i * startStep, end: i * startStep + startStep, text }));
  const sentences = sentencesFromSegments(segments);
  const fullText = sentences.map((s) => s.text).join(" ");
  return {
    status: "OK",
    reason: verified ? "verified transcript" : "unverified transcript",
    verified,
    source: "fixture",
    path: "fixtures/synthetic",
    format: "fixture",
    segments,
    sentences,
    words: fullText.split(/\s+/).filter(Boolean).length,
    hash: createHash("sha1").update(fullText).digest("hex").slice(0, 12),
  };
}

export function fixtureVideo(overrides = {}) {
  const youtubeId = overrides.youtubeId ?? "FIXTUREvid1";
  return {
    youtubeId,
    approved: true,
    urls: videoUrls(youtubeId),
    title: "Fixture Video",
    titleSource: "manifest",
    siteTitles: [],
    uploadDate: "2026-09-01",
    uploadDateSource: "manifest",
    durationSeconds: 540,
    durationSource: "manifest",
    description: "A synthetic description for a fixture video.",
    thumbnail: null,
    thumbnailSource: null,
    chapters: [],
    sourceNotes: null,
    targetTopic: null,
    relatedRoute: null,
    metadataSource: null,
    transcript: { path: null, verified: true },
    onHomepage: false,
    homepageId: null,
    embeddedOn: [],
    siteVideoObject: null,
    siteVideoObjectRoute: null,
    conflicts: [],
    ...overrides,
  };
}

/** A long, substantive, synthetic spoken transcript about one question. */
export function substantiveLines(topic = "Spring Valley", n = 40) {
  const opinions = [
    `If I were moving here, I'd spend a weekend driving around ${topic} before I looked at a single listing.`,
    `I think the biggest mistake people make with ${topic} is choosing the house before they understand the area.`,
    `What I tell my clients is to drive the commute at rush hour before they write an offer in ${topic}.`,
    `Honestly, the trade-off in ${topic} is location versus newer construction, and you have to pick which matters more.`,
    `I'd rather be close to the things I do every week than have an extra bedroom I never use.`,
  ];
  const questions = [
    `So what is it actually like to live in ${topic} day to day?`,
    `Should you buy in ${topic} or keep looking further out?`,
    `How much does the drive matter when you're choosing ${topic}?`,
    `What kind of homes do you actually find in ${topic}?`,
  ];
  const lines = [];
  for (let i = 0; i < n; i++) {
    if (i > 0 && i % 9 === 0) lines.push(questions[(i / 9 - 1) % questions.length]);
    lines.push(opinions[i % opinions.length]);
  }
  lines.push(`Right now builders around ${topic} are offering incentives, and HOA dues run about $95 a month in some communities.`);
  lines.push(`Mortgage rates are sitting around 7% right now, which changes the monthly payment a lot.`);
  return lines;
}

export function fixtureVideos() {
  return [
    {
      video: fixtureVideo({ youtubeId: "FIXTUREvid1", title: "FIXTURE: Living in Spring Valley, Las Vegas" }),
      transcript: fixtureTranscript(substantiveLines("Spring Valley")),
    },
    {
      video: fixtureVideo({ youtubeId: "FIXTUREvid2", title: "FIXTURE: Monument Hills update", transcript: null }),
      transcript: { status: "TRANSCRIPT_REQUIRED", reason: "no transcript is listed for this video", verified: false, source: null, path: null, format: null, segments: [], sentences: [], words: 0, hash: null },
    },
  ];
}
