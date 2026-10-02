import { test } from "node:test";
import assert from "node:assert/strict";

import { analyzeClaims } from "../lib/claims.mjs";
import { extractFaq, faqSchemaRecommendation } from "../lib/faq.mjs";
import { proposeVideoMeta, validateVideoObject, videoObjectNode } from "../lib/schema.mjs";
import { analyze, fixtureTranscript, fixtureVideo, substantiveLines, TODAY } from "./helpers.mjs";

const classified = (lines) => analyzeClaims(lines.map((text, index) => ({ index, text, timecode: `0:${String(index).padStart(2, "0")}` })), { today: TODAY }).sentences;

test("FAQ extraction: only questions asked AND answered on camera", () => {
  const faq = extractFaq(
    classified([
      "Should you rent first when you move to Las Vegas?",
      "I'd rent first if you don't know the valley yet.",
      "Right?",
      "What do mortgage rates look like right now?",
      "Mortgage rates are sitting around 7% right now.",
      "Is it a good idea?",
    ])
  );
  assert.equal(faq.length, 2);
  assert.equal(faq[0].status, "ready");
  assert.equal(faq[0].answer, "I'd rent first if you don't know the valley yet.");
  assert.equal(faq[1].status, "needs-verification");
  assert.ok(faq.every((f) => f.source === "transcript"));
});

test("FAQ schema: proposed only for a visible FAQ on a guide, never on an area pillar", () => {
  const faq = [{ status: "ready" }, { status: "needs-verification" }];
  assert.equal(faqSchemaRecommendation({ faq, targetRoute: "/guides/x", targetSection: "guide" }).recommend, true);
  assert.equal(faqSchemaRecommendation({ faq, targetRoute: "/neighborhoods/summerlin", targetSection: "neighborhood" }).recommend, false);
  assert.equal(faqSchemaRecommendation({ faq: [{ status: "blocked" }], targetRoute: "/guides/x" }).recommend, false);
});

test("missing uploadDate is BLOCKED, never estimated", () => {
  const { video, blocked } = proposeVideoMeta(fixtureVideo({ uploadDate: null }));
  assert.equal(video.uploadDate, null);
  assert.ok(blocked.some((b) => b.field === "uploadDate"));
});

test("missing duration is BLOCKED and omitted", () => {
  const { video, blocked } = proposeVideoMeta(fixtureVideo({ durationSeconds: null }));
  assert.equal("duration" in video, false);
  assert.ok(blocked.some((b) => b.field === "duration"));
});

test("VideoObject: matches lib/story.ts and validates", () => {
  const { video, blocked } = proposeVideoMeta(fixtureVideo({ thumbnail: "/images/video-x.jpg", thumbnailSource: "local poster" }));
  assert.equal(blocked.length, 0);
  const node = videoObjectNode(video);
  assert.equal(node.thumbnailUrl, "https://www.lvinit.com/images/video-x.jpg");
  assert.equal(node.url, node.contentUrl);
  assert.equal(node.duration, "PT9M");
  assert.deepEqual(validateVideoObject(node, { expectedId: "FIXTUREvid1", articleUrl: "https://www.lvinit.com/guides/x" }).errors, []);
});

test("VideoObject validation catches bad values and fabricated statistics", () => {
  const bad = { "@type": "VideoObject", name: "x", description: "y", thumbnailUrl: "/rel.jpg", uploadDate: "Aug 2026", duration: "8:08", embedUrl: "https://www.youtube.com/embed/OTHERvideo1", interactionStatistic: 5 };
  const r = validateVideoObject(bad, { expectedId: "FIXTUREvid1" });
  assert.equal(r.valid, false);
  for (const re of [/uploadDate/, /duration/, /thumbnailUrl/, /embedUrl/, /interactionStatistic/]) assert.ok(r.errors.some((e) => re.test(e)), String(re));
});

test("without a local poster the VideoObject uses YouTube's own thumbnail (site precedent), never a hotlinked hero", () => {
  const { video, thumbnailSource } = proposeVideoMeta(fixtureVideo());
  assert.equal(video.thumbnailUrl, "https://i.ytimg.com/vi/FIXTUREvid1/maxresdefault.jpg");
  assert.match(thumbnailSource, /precedent/);
});

test("internal-link suggestions: structured, Fair Housing-checked, never applied", () => {
  const item = analyze(fixtureVideo({ title: "Should You Rent First or Buy First in Las Vegas?" }), fixtureTranscript(substantiveLines("Las Vegas renting versus buying")));
  const links = item.draft.internalLinks;
  assert.ok(Array.isArray(links.outbound) && links.outbound.length > 0);
  for (const l of links.outbound) {
    for (const k of ["route", "relation", "anchorSuggestion", "placement", "reason"]) assert.ok(k in l, k);
    assert.notEqual(l.route, item.proposed.route);
  }
  assert.ok(links.outbound.some((l) => l.route === "/guides/moving-to-las-vegas" && l.relation === "parent"));
  assert.ok(links.inbound.every((l) => /not this pipeline/.test(l.appliedBy)));
});

test("draft: body lines are Mikey's words, facts carry [VERIFY]", () => {
  const item = analyze(fixtureVideo({ title: "Should You Rent First or Buy First in Las Vegas?" }), fixtureTranscript(substantiveLines("Las Vegas renting versus buying")));
  const body = item.draft.sections.flatMap((s) => s.bodyDraft).join(" ");
  assert.match(body, /\[VERIFY \d+:\d{2}\] Mortgage rates are sitting around 7%/);
  assert.ok(item.draft.headlines.metaDescription.length <= 160);
  assert.ok(!/\d/.test(item.draft.headlines.metaDescription), "no decaying figure in the meta description");
});
