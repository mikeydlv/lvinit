import test from "node:test";
import assert from "node:assert/strict";

import { loadConfig } from "../config.mjs";
import { defaultPrivacy, classifyFile, editPrivacy, isExcluded } from "../lib/privacy.mjs";
import { buildPublicCatalog, assertNoLeaks, privateTermsFor } from "../lib/sanitize.mjs";

const config = loadConfig({ privacy: { approvedSeed: ["Media/Fixture Park", "Videos/Fixture Project"] } });

function fresh() {
  const p = defaultPrivacy(config);
  editPrivacy(p, { exclude: ["Fixture Client Listing", "1234 Fixture"] });
  return p;
}

test("excluded folder names match at any depth", () => {
  const p = fresh();
  assert.equal(isExcluded("Media/Fixture Client Listing/a.mp4", p), true);
  assert.equal(isExcluded("Media/Fixture Park/1234 Fixture/a.mp4", p), true);
  assert.equal(classifyFile("Media/Fixture Park/1234 fixture/a.mp4", p, config).status, "excluded");
  assert.equal(isExcluded("Media/Fixture Park/a.mp4", p), false);
});

test("approval is per exact folder: new subfolders are held local-only", () => {
  const p = fresh();
  assert.equal(classifyFile("Media/Fixture Park/drone.mp4", p, config).status, "public");
  const r = classifyFile("Media/Fixture Park/New Shoot/clip.mp4", p, config);
  assert.equal(r.status, "local-only");
  assert.equal(r.pendingFolder, "Media/Fixture Park/New Shoot");
  assert.equal(classifyFile("Media/Brand New/clip.mp4", p, config).status, "local-only");
});

test("private-looking file names are held even inside approved folders", () => {
  const p = fresh();
  for (const name of ["house-invoice.jpeg", "Text 2.jpeg", "ride-along.MP4", "9876-Fixtureburg-short.mp4", "1234 Maple.mp4", "tour_5678_oak.mp4"]) {
    assert.equal(classifyFile(`Media/Fixture Park/${name}`, p, config).status, "local-only", name);
  }
});

test("freeway numbers, years and counts are not addresses", () => {
  const p = fresh();
  for (const name of [
    "215-sunset-exit.MP4", "15n-215-fork.MP4", "215-and-aliante-drive.MP4", "95 NB.mp4",
    "las-vegas-2026-hero.png", "moving-to-las-vegas-2026-choose-the-area.mp4",
    "monument-hills-6000-homes-thumbnail.png", "summerlin-parade-250-Cover.jpg", "DJI_20260915084903_0129_D.MP4",
  ]) {
    assert.equal(classifyFile(`Media/Fixture Park/${name}`, p, config).status, "public", name);
  }
});

test("--approve releases a single held file; --hold keeps one back", () => {
  const p = fresh();
  editPrivacy(p, { approve: ["Media/Fixture Park/ride-along.MP4"], hold: ["Media/Fixture Park/secret.mp4|Mikey said so"] });
  assert.equal(classifyFile("Media/Fixture Park/ride-along.MP4", p, config).status, "public");
  const held = classifyFile("Media/Fixture Park/secret.mp4", p, config);
  assert.equal(held.status, "local-only");
  assert.equal(held.reason, "Mikey said so");
});

const entry = (path, status, extra = {}) => ({
  id: path.length.toString(16) + path.slice(-4),
  path,
  folder: path.split("/").slice(0, -1).join("/"),
  type: "video",
  role: "b-roll",
  durationSec: 10,
  ...extra,
  privacy: { status, ...(extra.privacy ?? {}) },
});

test("the public catalog carries only public items and whitelisted fields", () => {
  const entries = [
    entry("Media/Fixture Park/a.mp4", "public", { sizeMB: 12, probeError: null, secret: "x" }),
    entry("Media/Held/b.mp4", "local-only", { privacy: { pendingFolder: "Media/Held" } }),
  ];
  const cat = buildPublicCatalog(entries, { generatedAt: "2026-09-17T00:00:00Z", excludedFolders: 2 });
  assert.equal(cat.items.length, 1);
  assert.deepEqual(Object.keys(cat.items[0]).sort(), ["durationSec", "folder", "id", "path", "role", "type"]);
  assert.equal(cat.totals.heldLocalOnly, 1);
  assert.equal(cat.totals.excludedFolders, 2);
});

test("the leak guard trips on coordinates, location keys, drive paths and private names", () => {
  assert.throws(() => assertNoLeaks(`{"x":"+36.1699-115.1398/"}`, []), /GPS coordinates/);
  assert.throws(() => assertNoLeaks(`{"a":"36.169941, -115.139832"}`, []), /GPS coordinates/);
  assert.throws(() => assertNoLeaks(`{"latitude": 1}`, []), /location/);
  assert.throws(() => assertNoLeaks(`{"p":"C:\\\\LVINIT\\\\Media"}`, []), /absolute/);
  assert.throws(() => assertNoLeaks(`{"p":"C:/LVINIT/Media"}`, []), /absolute/);
  assert.throws(() => assertNoLeaks(`{"s":"9876 fixtureburg short"}`, ["9876 Fixtureburg"]), /private item/);
});

test("the leak guard does not mistake URLs for drive paths", () => {
  assert.equal(assertNoLeaks(`{"url":"https://www.youtube.com/watch?v=abcdefghijk"}`, []), true);
});

test("private terms cover held paths, file names, name stems and unapproved folder names", () => {
  const p = fresh();
  const entries = [
    entry("Videos/Fixture Project/9876-Fixtureburg-short.mp4", "local-only"),
    entry("Media/Mystery Shoot/DJI_20260101010101_0001_D.MP4", "local-only", { privacy: { pendingFolder: "Media/Mystery Shoot" } }),
    entry("Media/Fixture Park/DJI_20260101010101_0001_D.MP4", "public"),
  ];
  const terms = privateTermsFor(entries, p);
  assert.ok(terms.includes("9876 Fixtureburg short"));
  assert.ok(terms.includes("Mystery Shoot"));
  assert.ok(terms.includes("Fixture Client Listing"));
  // Generic camera names are shared with public clips, so they aren't terms.
  assert.ok(!terms.includes("DJI_20260101010101_0001_D.MP4"));
});

test("a held export folder named exactly like a public Short is not a leak term", () => {
  const p = fresh();
  const entries = [
    entry("Videos/Fixture Project/Short-8.mp4", "public"),
    entry("Videos/Fixture Project/Short-8/Short-8.mp4", "local-only", { privacy: { pendingFolder: "Videos/Fixture Project/Short-8" } }),
  ];
  const terms = privateTermsFor(entries, p);
  assert.ok(!terms.includes("Short-8"));
  assert.ok(terms.includes("Videos/Fixture Project/Short-8"));
});
