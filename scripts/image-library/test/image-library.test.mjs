import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

import { hintFor } from "../config.mjs";
import { checkSlug, allowedPlaces, uniqueName, slugify } from "../lib/naming.mjs";
import { sampleTimes, fmtTimestamp, localReject, hammingHex, nearest } from "../lib/frames.mjs";
import { parseGuides, topicNeeds, matchArticles } from "../lib/gaps.mjs";
import { selectFinal, settleNaming, rankClips } from "../run.mjs";
import { commitExactly } from "../lib/git.mjs";
import { loadConfig } from "../config.mjs";

test("folder hints use the longest prefix", () => {
  assert.equal(hintFor("Media/Henderson/Inspirada/DJI_0001.MP4").place, "Inspirada, Henderson");
  assert.equal(hintFor("Media/Henderson/x.MP4").place, "Henderson");
  assert.equal(hintFor("Media/KB Homes/x.MP4").place, null);
  assert.equal(hintFor("Somewhere/else.mp4").prefix, null);
});

test("filenames: good names pass", () => {
  const ev = { place: "Grand Park, Summerlin West", signage: [] };
  assert.ok(checkSlug("summerlin-west-new-construction-homes-aerial", ev).ok);
  assert.ok(checkSlug("Southwest Las Vegas neighborhood streetscape", { place: "Southwest Las Vegas" }).ok);
});

test("filenames: IDs, stuffing and unproven places fail", () => {
  assert.ok(!checkSlug("img-3882", { place: null }).ok);
  assert.ok(!checkSlug("frame001-homes-street", { place: null }).ok);
  assert.ok(!checkSlug("las-vegas-real-estate-best-homes-buy-house", { place: null }).ok);
  const r = checkSlug("summerlin-new-homes-street", { place: "Henderson" });
  assert.ok(!r.ok);
  assert.match(r.problems.join(), /unproven place: summerlin/);
});

test("signage can prove a place; sub-places imply their city", () => {
  assert.ok(checkSlug("inspirada-community-entrance-sign", { place: null, signage: ["Inspirada"] }).ok);
  assert.ok(allowedPlaces({ place: "Inspirada, Henderson" }).has("henderson"));
  assert.ok(allowedPlaces({ place: "Sandstone, Tule Springs, North Las Vegas" }).has("north-las-vegas"));
});

test("settleNaming strips an unproven place instead of losing a good frame", () => {
  const out = settleNaming({ filename: "summerlin-desert-neighborhood-rooftops-aerial", location: "Summerlin", locationEvidence: "folder", signageText: [] }, { place: "Henderson" });
  assert.equal(out.slug, "desert-neighborhood-rooftops-aerial");
  assert.equal(out.location, "Henderson");
  const none = settleNaming({ filename: "new-homes-street-view", location: "Summerlin", locationEvidence: "none", signageText: [] }, { place: null });
  assert.equal(none.location, "");
});

test("uniqueName only suffixes on collision", () => {
  assert.equal(uniqueName("a-b-c", new Set()), "a-b-c");
  assert.equal(uniqueName("a-b-c", new Set(["a-b-c"])), "a-b-c-2");
  assert.equal(slugify("Lake Las Vegas & MonteLago"), "lake-las-vegas-and-montelago");
});

test("sampleTimes avoids examined times and clip edges", () => {
  const t = sampleTimes(60, [], { min: 3, max: 10 });
  assert.ok(t.length >= 3 && t.every((x) => x > 0.7 && x < 59.3));
  const again = sampleTimes(60, t, { min: 3, max: 10, gap: 4, pass: t.length });
  assert.ok(again.every((x) => t.every((y) => Math.abs(x - y) >= 4)));
  assert.deepEqual(sampleTimes(1.2, []), []);
});

test("timestamps and local rejection", () => {
  assert.equal(fmtTimestamp(763.4), "00:12:43");
  const q = loadConfig().quality;
  assert.equal(localReject({ sharpness: 100, mean: 120, contrast: 50, clipped: 0, crushed: 0 }, q), "blurry or motion-blurred");
  assert.equal(localReject({ sharpness: 900, mean: 240, contrast: 50, clipped: 0.4, crushed: 0 }, q), "overexposed");
  assert.equal(localReject({ sharpness: 900, mean: 120, contrast: 50, clipped: 0, crushed: 0 }, q), null);
});

test("perceptual hash distance", () => {
  assert.equal(hammingHex("ffffffffffffffff", "ffffffffffffffff"), 0);
  assert.equal(hammingHex("0000000000000000", "000000000000000f"), 4);
  assert.equal(nearest("0000000000000000", []), 64);
});

const SRC = `export const guides: Guide[] = [
  {
    slug: "summerlin-vs-henderson",
    title: "Summerlin vs Henderson",
    category: "Comparisons",
    image: "/images/a.webp",
    href: "/guides/summerlin-vs-henderson",
  },
  {
    slug: "nevada-property-tax",
    title: "Nevada property tax",
    image: "/images/covers/x.webp",
    imageMode: "editorial-cover",
    href: "/guides/nevada-property-tax",
  },
];`;

test("guides registry parses and drives topic needs", () => {
  const g = parseGuides(SRC);
  assert.equal(g.length, 2);
  assert.equal(g[1].imageMode, "editorial-cover");
  const rows = topicNeeds({ articles: g, usage: new Map(), library: [] });
  const sum = rows.find((r) => r.topic === "summerlin");
  const lots = topicNeeds({ articles: g, usage: new Map(), library: Array.from({ length: 8 }, () => ({ topics: ["summerlin"] })) }).find((r) => r.topic === "summerlin");
  assert.ok(lots.priority < sum.priority, "a well-stocked topic ranks lower");
  assert.deepEqual(matchArticles(["henderson"], g).map((a) => a.slug), ["summerlin-vs-henderson"]);
});

test("rankClips prefers needed topics and fresh clips", () => {
  const clips = [
    { rel: "Media/Summerlin/a.MP4", folder: "Media/Summerlin", durationSec: 30, portrait: false, camera: "dji" },
    { rel: "Media/Henderson/b.MP4", folder: "Media/Henderson", durationSec: 30, portrait: false, camera: "dji" },
  ];
  const priorities = [{ topic: "henderson", priority: 9 }, { topic: "summerlin", priority: 1 }];
  const r = rankClips(clips, { priorities, index: { images: [] }, state: { examined: {} }, day: "2026-10-07" });
  assert.equal(r[0].rel, "Media/Henderson/b.MP4");
});

test("selectFinal enforces one per clip, place caps and distinct pictures", () => {
  const mk = (i, clip, place, hash) => ({ clip: { rel: clip, portrait: false }, hint: { place }, review: { location: place }, hash, score: 20 - i });
  const pool = [mk(0, "a", "X", "0000000000000000"), mk(1, "a", "X", "ffff000000000000"), mk(2, "b", "X", "0000000000000001"), mk(3, "c", "Y", "ffffffff00000000")];
  const out = selectFinal(pool, 2, { maxPerClip: 1, maxPerPlace: 3, maxPortrait: 2 });
  assert.equal(out.length, 2);
  assert.deepEqual(out.map((p) => p.clip.rel), ["a", "c"]); // b is a near-duplicate of a
});

test("commitExactly refuses unrelated changes", () => {
  const dir = mkdtempSync(join(tmpdir(), "il-git-"));
  try {
    const g = (...a) => execFileSync("git", ["-C", dir, ...a], { stdio: "ignore" });
    g("init", "-q");
    g("config", "user.email", "t@example.com");
    g("config", "user.name", "T");
    writeFileSync(join(dir, "keep.txt"), "x");
    g("add", ".");
    g("commit", "-qm", "init");
    writeFileSync(join(dir, "mine.jpg"), "img");
    writeFileSync(join(dir, "keep.txt"), "changed by someone else");
    const cfg = { authorName: "A", authorEmail: "a@example.com" };
    assert.throws(() => commitExactly(dir, ["mine.jpg"], "content: test", cfg), /unrelated changes/);
    g("checkout", "--", "keep.txt");
    const c = commitExactly(dir, ["mine.jpg"], "content: test", cfg);
    assert.deepEqual(c.files, ["mine.jpg"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
