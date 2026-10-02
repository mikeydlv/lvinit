import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

import { run } from "../run.mjs";
import { mergeVideo, normalizeManifestEntry, readIdConstants } from "../lib/registry.mjs";

test("Markdown + JSON reports: fixture run against the real site", async () => {
  const out = mkdtempSync(join(tmpdir(), "yt-pipeline-run-"));
  const rel = relative(process.cwd(), out);
  const r = await run(["--fixtures", "--no-git", `--out=${rel}`, "--today=2026-10-02"], { log: () => {} });
  assert.equal(r.exitCode, 0);

  const md = readFileSync(r.paths.md, "utf8");
  assert.match(md, /^# YouTube → Website Pipeline — 2026-10-02/);
  assert.match(md, /FIXTURE RUN/);
  for (const h of ["## Summary", "Videos analyzed", "New-article candidates", "Update candidates", "Embed-only candidates", "Duplicates", "Transcript required", "Ready for Publisher", "Claims needing verification", "## Dry-run handoff queue"]) {
    assert.ok(md.includes(h), h);
  }

  const json = JSON.parse(readFileSync(r.paths.json, "utf8"));
  assert.equal(json.agent, "youtube-pipeline");
  assert.equal(json.fixtureData, true);
  assert.equal(json.videos.length, 2);
  for (const v of json.videos) {
    for (const k of ["youtubeId", "title", "action", "target", "overlap", "confidence", "verificationChecklist", "fairHousing", "handoff", "lifecycle", "fingerprint"]) assert.ok(k in v, k);
  }
  assert.equal(json.handoff.mode, "dry-run");
  assert.ok(existsSync(r.paths.queue));
  assert.ok(existsSync(join(r.paths.packages, `${json.videos[0].id}.json`)));
});

test("manifest entries are validated and merged over what the site knows", () => {
  const { entry, problems } = normalizeManifestEntry({ url: "https://youtu.be/2rboWkJ9j48", approved: true, transcript: { path: "t.json", verified: false } });
  assert.deepEqual(problems, []);
  assert.equal(entry.youtubeId, "2rboWkJ9j48");
  const merged = mergeVideo(entry, { titles: ["Rent First or Buy First?"], homepage: { id: "rent-first-or-buy-first-las-vegas", duration: "8:08" }, embeddedOn: new Set(), posters: new Set(["/images/video-rent-first-or-buy-first-las-vegas.jpg"]), videoObject: null });
  assert.equal(merged.title, "Rent First or Buy First?");
  assert.equal(merged.durationSeconds, 488);
  assert.equal(merged.thumbnail, "/images/video-rent-first-or-buy-first-las-vegas.jpg");
  assert.equal(merged.uploadDate, null, "never filled in when nobody stated it");
  assert.ok(normalizeManifestEntry({ url: "https://vimeo.com/1" }).problems.length > 0);
});

test("site scan finds embeds made through a named constant", () => {
  assert.deepEqual(readIdConstants('const YOUTUBE_ID = "aMeXy1frj-o";\n<StoryVideo youtubeId={YOUTUBE_ID} />'), ["aMeXy1frj-o"]);
});
