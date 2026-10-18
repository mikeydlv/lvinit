import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

import { hintFor } from "../config.mjs";
import { checkSlug, allowedPlaces, uniqueName, slugify } from "../lib/naming.mjs";
import { sampleTimes, fmtTimestamp, localReject, hammingHex, nearest } from "../lib/frames.mjs";
import { parseGuides, topicNeeds, matchArticles } from "../lib/gaps.mjs";
import { selectFinal, settleNaming, rankClips, committedToday, autoApprovedFolders } from "../run.mjs";
import { commitExactly, dirtyPaths } from "../lib/git.mjs";
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
  const mk = (i, clip, place, hash) => ({ clip: { rel: clip, folder: `F/${clip}`, portrait: false }, hint: { place }, review: { location: place }, hash, score: 20 - i });
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

test("selectFinal caps one area even when place names differ", () => {
  const mk = (i, clip, folder, place, hash) => ({ clip: { rel: `${folder}/${clip}`, folder, portrait: false }, hint: { place, topics: ["summerlin"] }, review: { location: place }, hash, score: 30 - i });
  const hashes = ["0000000000000000", "00000000ffffffff", "ffffffff00000000", "ffffffffffffffff", "0f0f0f0f0f0f0f0f"];
  const pool = [
    mk(0, "a", "Media/Summerlin/GrandPark West", "Grand Park", hashes[0]),
    mk(1, "b", "Media/Summerlin/Downtown Summerlin", "Downtown Summerlin", hashes[1]),
    mk(2, "c", "Media/Summerlin/Red Rock", "Red Rock Canyon", hashes[2]),
    mk(3, "d", "Media/Summerlin/Mesa Ridge park", "Mesa Ridge", hashes[3]),
    { ...mk(4, "e", "Media/Henderson", "Henderson", hashes[4]), hint: { place: "Henderson", topics: ["henderson"] } },
  ];
  const out = selectFinal(pool, 4, { maxPerClip: 1, maxPerPlace: 2, maxPerFolder: 2, maxPerArea: 3, maxPortrait: 2 });
  assert.deepEqual(out.map((p) => p.clip.rel.split("/").pop()), ["a", "b", "c", "e"]);
});

// Regression: every nightly run from 2026-10-07 to 10-17 failed with "unrelated
// changes present (ata/image-library/…)". The index is a tracked file whose
// porcelain line (" M data/…") sorts first, and trimming the output dropped its
// leading space, so slice(3) cut the path's first letter.
test("commitExactly accepts a modified tracked file that sorts first", () => {
  const dir = mkdtempSync(join(tmpdir(), "il-git-"));
  try {
    const g = (...a) => execFileSync("git", ["-C", dir, ...a], { stdio: "ignore" });
    g("init", "-q");
    g("config", "user.email", "t@example.com");
    g("config", "user.name", "T");
    mkdirSync(join(dir, "data", "image-library"), { recursive: true });
    writeFileSync(join(dir, "data", "image-library", "index.json"), "{}");
    g("add", ".");
    g("commit", "-qm", "init");
    writeFileSync(join(dir, "data", "image-library", "index.json"), '{"images":[1]}');
    mkdirSync(join(dir, "public", "images", "editorial"), { recursive: true });
    writeFileSync(join(dir, "public", "images", "editorial", "a.jpg"), "img");
    assert.deepEqual(dirtyPaths(dir).sort(), ["data/image-library/index.json", "public/images/editorial/a.jpg"]);
    const c = commitExactly(dir, ["public/images/editorial/a.jpg", "data/image-library/index.json"], "content: test", { authorName: "A", authorEmail: "a@example.com" });
    assert.deepEqual(c.files.sort(), ["data/image-library/index.json", "public/images/editorial/a.jpg"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("committedToday: one batch per Pacific day, failed pre-commit runs don't count", () => {
  const state = { runs: [
    { runId: "2026-10-17-2000", status: "success", commit: "abc1234" },
    { runId: "2026-10-18-2000", status: "failed", failedStep: "select", commit: null },
  ] };
  assert.equal(committedToday(state, "2026-10-18"), null);
  state.runs.push({ runId: "2026-10-18-2105", status: "failed", failedStep: "push", commit: "def5678" });
  assert.equal(committedToday(state, "2026-10-18").commit, "def5678"); // committed, push pending: still today's batch
  assert.equal(committedToday({}, "2026-10-18"), null);
});

test("autoApprovedFolders: everything under Media/ incl. new folders; nothing outside; junctions that leave the tree are refused", () => {
  const cfg = { mediaRoot: "C:/LVINIT", autoApproveTree: "Media" };
  // A fake filesystem: Media/Linked is a junction to D:/Elsewhere.
  const realpath = (p) => {
    const f = p.replace(/\\/g, "/");
    return /\/Media\/Linked(\/|$)/i.test(f) ? f.replace(/^C:\/LVINIT\/Media\/Linked/i, "D:/Elsewhere") : p;
  };
  const files = [
    { rel: "Media/Henderson/Henderson Sport and Social - Walkthrough/a.mp4" },
    { rel: "Media/Brand New Project 2027/Drone/b.MP4" },
    { rel: "Media/c.mp4" },
    { rel: "Media/Linked/d.mp4" },
    { rel: "Videos/Aries Henderson/Review/e.mp4" },
    { rel: "MediaBackup/f.mp4" },
    { rel: "Media/../Videos/g.mp4" },
  ];
  const { folders, outside } = autoApprovedFolders(files, cfg, realpath);
  assert.deepEqual(folders.sort(), ["Media", "Media/Brand New Project 2027/Drone", "Media/Henderson/Henderson Sport and Social - Walkthrough"]);
  assert.deepEqual(outside, ["Media/Linked"]);
  assert.deepEqual(autoApprovedFolders(files, { ...cfg, autoApproveTree: null }, realpath).folders, []);
});

test("blanket approval keeps the privacy file's exclusions, holds and file-name flags", async () => {
  const { classifyFile } = await import("../../executive-producer/lib/privacy.mjs");
  const { loadConfig: producerConfig } = await import("../../executive-producer/config.mjs");
  const pc = producerConfig();
  const files = ["Media/New Area/a.mp4", "Media/Client X/b.mp4", "Media/SouthWest/ride-along.MP4", "Media/New Area/1234 Maple Ave.mp4"].map((rel) => ({ rel }));
  const privacy = { excluded: ["Client X"], approved: [], approvedFiles: [], localOnly: [{ path: "Media/SouthWest/ride-along.MP4", reason: "held" }] };
  const { folders } = autoApprovedFolders(files, { mediaRoot: "C:/LVINIT", autoApproveTree: "Media" }, (p) => p);
  const il = { ...privacy, approved: folders };
  assert.equal(classifyFile("Media/New Area/a.mp4", il, pc).status, "public");
  assert.equal(classifyFile("Media/Client X/b.mp4", il, pc).status, "excluded");
  assert.equal(classifyFile("Media/SouthWest/ride-along.MP4", il, pc).status, "local-only");
  assert.equal(classifyFile("Media/New Area/1234 Maple Ave.mp4", il, pc).status, "local-only");
  assert.deepEqual(privacy.approved, []); // the shared privacy object is never mutated
});
