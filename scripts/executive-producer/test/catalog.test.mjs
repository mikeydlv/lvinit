import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { loadConfig } from "../config.mjs";
import { detectCamera, subjectOf, captureDate, timeOfDay, describe, markDuplicates } from "../lib/describe.mjs";
import { parseProbe } from "../lib/probe.mjs";
import { readEmbeds, readHomepageVideos, routeForFile } from "../lib/videos.mjs";
import { assertAllowedPaths, pushToStateBranch } from "../lib/publish.mjs";
import { run } from "../catalog.mjs";

test("camera comes from the encoder tag, not the DJI_ prefix", () => {
  assert.equal(detectCamera({ name: "DJI_20260915084903_0129_D.MP4", encoder: "DJI OsmoPocket3", relPath: "Media/15 NB/x" }), "handheld");
  assert.equal(detectCamera({ name: "DJI_20260827100000_0001_D.MP4", encoder: "DJI Mini5Pro", relPath: "Media/x/y" }), "drone");
  assert.equal(detectCamera({ name: "DJI_0285.MP4", encoder: "Lavf56.15.102", relPath: "Media/x/y" }), "drone");
  assert.equal(detectCamera({ name: "20260622_121551.mp4", encoder: null, relPath: "Media/x/y" }), "phone");
  assert.equal(detectCamera({ name: "Short-#1.mp4", encoder: "Lavf61.1.100", relPath: "Videos/x/y" }), "edited");
});

test("subjects come from descriptive names only", () => {
  assert.equal(subjectOf("gvr-the-district-walkthrough.MP4"), "gvr the district walkthrough");
  assert.equal(subjectOf("mothership-coffee (2).MP4"), "mothership coffee");
  assert.equal(subjectOf("DJI_20260915084903_0129_D.MP4"), null);
  assert.equal(subjectOf("20260622_121551.mp4"), null);
});

test("capture dates are Las Vegas dates; implausible container dates fall back", () => {
  assert.deepEqual(captureDate({ creationTime: "2026-09-16T03:30:00Z", name: "x.mp4" }), { date: "2026-09-15", source: "camera" });
  assert.deepEqual(captureDate({ creationTime: "1970-01-01T00:00:00Z", name: "DJI_20260730144424_0017_D.MP4" }), { date: "2026-07-30", source: "filename" });
  assert.equal(timeOfDay("2026-08-19T01:30:00Z"), "golden-hour"); // 6:30 PM PDT
  assert.equal(timeOfDay("2026-08-19T16:00:00Z"), "morning"); // 9 AM PDT
});

test("ffprobe parsing swaps dimensions for rotated phone video and never keeps extra tags", () => {
  const p = parseProbe({
    streams: [{ codec_type: "video", width: 1920, height: 1080, avg_frame_rate: "30000/1001", side_data_list: [{ rotation: -90 }] }],
    format: { duration: "12.345", tags: { creation_time: "2026-07-01T10:00:00Z", encoder: "x", location: "+36.1-115.1/" } },
  });
  assert.deepEqual(p, { width: 1080, height: 1920, fps: 29.97, durationSec: 12.3, creationTime: "2026-07-01T10:00:00Z", encoder: "x" });
});

test("roles: A-roll, Shorts, long-form, thumbnails, B-roll", () => {
  const config = loadConfig();
  const d = (rel, probe, ext = rel.split(".").pop().toLowerCase()) =>
    describe({ rel, ext, size: 1, mtimeMs: 0 }, probe, { status: "public" }, config);
  assert.equal(d("Videos/Rent vs Buy/unpack.mp4", { encoder: "Lavf", durationSec: 40, width: 1080, height: 1920 }).role, "short");
  assert.equal(d("Videos/New vs Resale/New vs Resale/New vs Resale.mp4", { encoder: "Lavf", durationSec: 309, width: 3840, height: 2160 }).role, "long-form");
  assert.equal(d("Videos/Monument Hills/home-office-A-roll.MP4", { encoder: "DJI OsmoPocket3", durationSec: 300 }).role, "a-roll");
  assert.equal(d("Videos/Rent vs Buy/moving-to-las-vegas-rent-first-or-buy-thumbnail.png", {}).role, "thumbnail");
  const b = d("Media/Summerlin/Mesa Ridge park/DJI_0285.MP4", { encoder: "Lavf56", durationSec: 20, width: 3840, height: 2160 });
  assert.equal(b.role, "b-roll");
  assert.equal(b.place, "Mesa Ridge Park");
  assert.equal(b.area, "summerlin");
  const proj = d("Videos/New vs Resale/Short-#1.mp4", { encoder: "Lavf", durationSec: 30, width: 1080, height: 1920 });
  assert.equal(proj.project.youtubeId, "2w-zkNv5Ta4");
});

test("copies of the same clip in two folders are marked as duplicates", () => {
  const es = markDuplicates([
    { id: "a", _dupKey: "215-sunset-exit.mp4|10" },
    { id: "b", _dupKey: "215-sunset-exit.mp4|10" },
    { id: "c", _dupKey: "other|10" },
  ]);
  assert.equal(es[1].duplicateOf, "a");
  assert.equal(es[2].duplicateOf, undefined);
});

test("video inventory reads StoryVideo props, iframes and the homepage list", () => {
  const embeds = readEmbeds(`
    <StoryVideo
      youtubeId="HuUUHgq2Sn8"
      title="Inside a North Las Vegas home: tour by Mikey Del Rosario"
    />
    <iframe src="https://www.youtube-nocookie.com/embed/hTEzzxcYhkg" title="Summerlin parade film" />
    const ld = { url: "https://www.youtube.com/watch?v=ZAU9hPQ_1Hk" };`);
  assert.deepEqual(embeds.map((e) => e.youtubeId).sort(), ["HuUUHgq2Sn8", "ZAU9hPQ_1Hk", "hTEzzxcYhkg"]);
  assert.equal(embeds.find((e) => e.youtubeId === "HuUUHgq2Sn8").title, "Inside a North Las Vegas home: tour by Mikey Del Rosario");
  const home = readHomepageVideos(`export const videos: VideoItem[] = [
  {
    id: "rent-first",
    youtubeId: "2rboWkJ9j48",
    title: "Rent First or Buy First?",
    duration: "8:08",
  },
];`);
  assert.deepEqual(home, [{ homepageId: "rent-first", youtubeId: "2rboWkJ9j48", title: "Rent First or Buy First?", duration: "8:08" }]);
  assert.equal(routeForFile("app/guides/foo/page.tsx"), "/guides/foo");
  assert.equal(routeForFile("app/neighborhoods/henderson/four-seasons-private-residences/page.tsx"), "/neighborhoods/henderson/four-seasons-private-residences");
  assert.equal(routeForFile("lib/areas/summerlin.tsx"), "/neighborhoods/summerlin");
});

test("state-branch pushes stay inside the namespace and on lvinit-agent-state", () => {
  assert.doesNotThrow(() => assertAllowedPaths(["data/executive-producer/footage-catalog.json", "reports/executive-producer/x.md"]));
  assert.throws(() => assertAllowedPaths(["data/social-trends/watchlist.json"]), /outside/);
  assert.throws(() => assertAllowedPaths(["app/page.tsx"]), /outside/);
  const config = loadConfig({ state: { branch: "main" } });
  assert.throws(() => pushToStateBranch({ repoRoot: ".", config, files: [], message: "x", run: () => "" }), /Only lvinit-agent-state/);
});

test("end to end on a fixture library: excluded folders unread, held items withheld, nothing absolute or private in the output", async () => {
  const root = mkdtempSync(join(tmpdir(), "lvinit-media-"));
  const home = mkdtempSync(join(tmpdir(), "lvinit-home-"));
  const repo = mkdtempSync(join(tmpdir(), "lvinit-repo-"));
  const put = (rel) => {
    mkdirSync(join(root, rel, ".."), { recursive: true });
    writeFileSync(join(root, rel), "x");
  };
  put("Media/Summerlin/summerlin-ridge-drone.MP4");
  put("Media/Summerlin/1234-Fixture-Lane-tour.mp4");
  put("Media/Fixture Client Listing/DJI_0001.MP4");
  put("Media/Unsorted Shoot/clip.mp4");
  put("Media/Summerlin/clip.LRF");
  mkdirSync(join(repo, "lib"), { recursive: true });
  writeFileSync(join(repo, "lib", "content.ts"), `export const videos = [\n  {\n    id: "x",\n    youtubeId: "2rboWkJ9j48",\n    title: "Fixture video",\n  },\n];\n`);

  process.env.LVINIT_PRODUCER_HOME = home;
  const logs = [];
  try {
    const r = await run([`--media-root=${root}`, "--no-probe", "--no-oembed", "--exclude=Fixture Client Listing"], {
      log: (m) => logs.push(m),
      repoRoot: repo,
    });
    assert.equal(r.exitCode, 0, logs.join("\n"));
    const pub = readFileSync(join(repo, "data", "executive-producer", "footage-catalog.json"), "utf8");
    assert.match(pub, /summerlin-ridge-drone/);
    assert.doesNotMatch(pub, /Fixture Client|1234-Fixture|Unsorted Shoot|\.LRF/i);
    assert.doesNotMatch(pub, new RegExp(root.replace(/[\\]/g, "\\\\")));
    const inv = JSON.parse(readFileSync(join(repo, "data", "executive-producer", "video-inventory.json"), "utf8"));
    assert.equal(inv.videos[0].youtubeId, "2rboWkJ9j48");
    // Private details exist only in the local home directory.
    assert.ok(existsSync(join(home, "privacy.json")));
    assert.match(readFileSync(join(home, "catalog-review.md"), "utf8"), /Unsorted Shoot/);
    assert.doesNotMatch(readFileSync(join(home, "footage-catalog.local.json"), "utf8"), /Fixture Client Listing\/DJI/);
  } finally {
    delete process.env.LVINIT_PRODUCER_HOME;
  }
});
