import { test } from "node:test";
import assert from "node:assert/strict";

import { videoIntent, videoOverlap } from "../lib/overlap.mjs";
import { analyze, briefConfig, config, fixtureTranscript, fixtureVideo, makeInventory, NO_TRANSCRIPT, page, substantiveLines, syntheticSite } from "./helpers.mjs";

const overlapFor = (title, inventory = syntheticSite(), extra = {}) => {
  const video = fixtureVideo({ title, ...extra });
  return videoOverlap(video, videoIntent(video, []), inventory, { briefConfig, config });
};

test("overlap SAME: a page already answers the video's question", () => {
  const o = overlapFor("New Build vs Resale in Las Vegas: Which Should You Buy?");
  assert.equal(o.verdict, "SAME");
  assert.equal(o.best.route, "/guides/new-build-vs-resale-las-vegas");
});

test("overlap SUBSTANTIAL: a page covers most of it", () => {
  // A wider three-way comparison covers a two-way question substantially.
  const inv = makeInventory([
    page({ route: "/guides/summerlin-vs-henderson-vs-southwest-las-vegas", title: "Summerlin vs Henderson vs Southwest Las Vegas", category: "Comparisons", headings: ["Cost"], body: "summerlin henderson southwest" }),
  ]);
  const o = overlapFor("Summerlin vs Henderson: Where Should You Live?", inv);
  assert.equal(o.verdict, "SUBSTANTIAL");
});

test("overlap ADJACENT: related, but no page commits to the question", () => {
  const o = overlapFor("Should You Rent First or Buy First in Las Vegas?");
  assert.equal(o.verdict, "ADJACENT");
  assert.equal(o.distinctQuestion, true);
});

test("overlap DISTINCT: nothing published is about it", () => {
  const o = overlapFor("Boulder City Day Trip Notes");
  assert.equal(o.verdict, "DISTINCT");
});

test("new article: distinct question, real substance", () => {
  const item = analyze(fixtureVideo({ title: "Should You Rent First or Buy First in Las Vegas?" }), fixtureTranscript(substantiveLines("Las Vegas renting versus buying")));
  assert.equal(item.action, "NEW_ARTICLE");
  assert.ok(item.proposed.route.startsWith("/guides/"));
  assert.equal(item.parent, "/guides/moving-to-las-vegas");
  assert.ok(item.draft.headlines.title);
  assert.ok(item.draft.sections.length > 1);
});

test("update existing: SAME page that misses facets the video covers", () => {
  // The fixture transcript talks about commute and daily life; the page doesn't.
  const item = analyze(fixtureVideo({ title: "New Build vs Resale in Las Vegas: Which Should You Buy?" }), fixtureTranscript(substantiveLines("new construction")));
  assert.equal(item.action, "UPDATE_EXISTING_ARTICLE");
  assert.equal(item.target, "/guides/new-build-vs-resale-las-vegas");
  assert.ok(item.draft.missingFacets.length >= 1);
  assert.equal(item.draft.kind, "update");
});

test("embed-only: SAME page that already covers what the video says", () => {
  const item = analyze(fixtureVideo({ title: "New Build vs Resale in Las Vegas: Which Should You Buy?" }), NO_TRANSCRIPT);
  assert.equal(item.action, "ADD_VIDEO_TO_EXISTING_ARTICLE");
  assert.equal(item.draft.kind, "embed-only");
  assert.ok(item.draft.embed.component.includes("StoryVideo"));
});

test("duplicate: the video is already embedded on its companion", () => {
  const item = analyze(
    fixtureVideo({ title: "New Build vs Resale in Las Vegas: Which Should You Buy?", embeddedOn: ["/guides/new-build-vs-resale-las-vegas"], siteVideoObjectRoute: "/guides/new-build-vs-resale-las-vegas" }),
    NO_TRANSCRIPT
  );
  assert.equal(item.action, "REJECT_DUPLICATE");
  assert.equal(item.lifecycle, "DUPLICATE");
  assert.equal(item.handoff.eligible, false);
});

test("FAQ section: companion exists, video has real Q&A, page has no FAQ", () => {
  const lines = substantiveLines("Summerlin");
  const item = analyze(fixtureVideo({ title: "Living in Summerlin", embeddedOn: ["/neighborhoods/summerlin"], siteVideoObjectRoute: "/neighborhoods/summerlin" }), fixtureTranscript(lines), {
    cfg: { ...config, classify: { ...config.classify, minMissingFacetsForUpdate: 99 } },
  });
  assert.equal(item.action, "CREATE_FAQ_SECTION");
  assert.ok(item.draft.faq.length >= 3);
  // Area pillars render a visible FAQ without FAQPage schema, by design.
  assert.equal(item.draft.faqSchema.recommend, false);
});

test("video only: adjacent, but too thin for its own page", () => {
  const thin = fixtureTranscript(substantiveLines("renting", 6));
  const item = analyze(fixtureVideo({ title: "Should You Rent First or Buy First in Las Vegas?" }), thin);
  assert.equal(item.action, "VIDEO_ONLY_NO_ARTICLE");
});

test("monitor only: a Short is never turned into an article", () => {
  const item = analyze(fixtureVideo({ title: "Rent first?", durationSeconds: 45 }), fixtureTranscript(substantiveLines("renting")));
  assert.equal(item.action, "MONITOR_ONLY");
});

test("transcript required: no copy is drafted from the title alone", () => {
  const item = analyze(fixtureVideo({ title: "Should You Rent First or Buy First in Las Vegas?" }), NO_TRANSCRIPT);
  assert.equal(item.action, "NEW_ARTICLE");
  assert.equal(item.provisional, true);
  assert.equal(item.transcriptRequired, true);
  assert.equal(item.draft.headlines, null);
  assert.equal(item.draft.sections.length, 0);
  assert.equal(item.lifecycle, "NEW");
  assert.ok(item.handoff.blockers.includes("TRANSCRIPT_REQUIRED"));
});
