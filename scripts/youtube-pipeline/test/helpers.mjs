// Shared test scaffolding for the YouTube → Website pipeline.
//
// Everything here is synthetic: no test reads a real transcript, and no page
// here is LVINIT's real content. The synthetic inventory is built with the
// Content Brief Generator's own test helpers so both agents score pages the
// same way.

import { loadConfig as loadBriefConfig } from "../../content-briefs/config.mjs";
import { makeInventory, page } from "../../content-briefs/test/helpers.mjs";

import { loadConfig } from "../config.mjs";
import { analyzeVideo } from "../lib/analyze.mjs";
import { buildHistory, makeIdFactory } from "../lib/history.mjs";
import { fixtureTranscript, fixtureVideo, substantiveLines } from "../fixtures/fixture-videos.mjs";

export const TODAY = "2026-10-02";

export const config = loadConfig({ inputs: { useGitLog: false, photoLibrary: "Z:\\does-not-exist" } });
export const briefConfig = loadBriefConfig({ inputs: { useGitLog: false }, inventory: { useGitDates: false } });

export { fixtureTranscript, fixtureVideo, makeInventory, page, substantiveLines };

export const NO_TRANSCRIPT = { status: "TRANSCRIPT_REQUIRED", reason: "no transcript is listed for this video", verified: false, source: null, path: null, format: null, segments: [], sentences: [], words: 0, hash: null };

/** A small synthetic site. */
export function syntheticSite() {
  return makeInventory([
    page({
      route: "/guides/new-build-vs-resale-las-vegas",
      title: "New Build vs Resale in Las Vegas: Which Should You Buy?",
      category: "Buyer Guide",
      headings: ["What a builder's price includes", "What a resale already paid for"],
      body: "new construction new build resale resale builders incentives cost cost price",
    }),
    page({
      route: "/neighborhoods/summerlin",
      title: "Summerlin",
      section: "neighborhood",
      category: "Neighborhoods",
      headings: ["Living in Summerlin", "Summerlin housing"],
      body: "summerlin summerlin summerlin trails parks villages",
    }),
    page({
      route: "/guides/moving-to-las-vegas",
      title: "Moving to Las Vegas: Where to Start",
      category: "Moving Here",
      headings: ["Choose the area before the house", "The first-month basics"],
      body: "moving to las vegas relocation summer heat rent rent buy",
    }),
    page({
      route: "/guides/henderson-vs-southwest-las-vegas",
      title: "Henderson vs. Southwest Las Vegas",
      category: "Comparisons",
      headings: ["Henderson vs Southwest: cost"],
      body: "henderson southwest henderson southwest commute cost",
    }),
    page({
      route: "/guides/las-vegas-home-prices-august-2026",
      title: "Las Vegas Home Prices Dipped Again in August 2026",
      category: "Market Watch",
      headings: ["The August numbers"],
      body: "home prices median price home prices inventory",
    }),
  ]);
}

/** Run the full per-video analysis against a synthetic site. */
export function analyze(video, transcript, { inventory = syntheticSite(), history = buildHistory([]), published = { available: true, fingerprints: new Map() }, cfg = config } = {}) {
  return analyzeVideo({
    video,
    repoRoot: process.cwd(),
    inventory,
    briefConfig,
    config: cfg,
    today: TODAY,
    history,
    published,
    nextId: makeIdFactory(TODAY),
    transcriptOverride: transcript,
  });
}
