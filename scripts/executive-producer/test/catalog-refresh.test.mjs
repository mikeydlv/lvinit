// The weekly catalog refresh: recursive discovery, incremental probing, the
// per-folder privacy policy, moved/missing files, unreadable files, and clips
// kept out of the B-roll pool. Synthetic files and a fake ffprobe; nothing on
// Mikey's media drive or in ~/.lvinit is touched.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, renameSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { run, catalogDelta } from "../catalog.mjs";
import { describe as describeEntry } from "../lib/describe.mjs";
import { loadConfig } from "../config.mjs";
import { remapUsage } from "../lib/shorts.mjs";
import { composeMessage } from "../lib/notify.mjs";

const big = (n) => Buffer.alloc(n, 7);
function world() {
  const root = mkdtempSync(join(tmpdir(), "catref-"));
  const media = join(root, "LVINIT");
  const home = join(root, "home");
  const state = join(root, "state");
  for (const d of ["Media/A", "Media/A/New Shoot", "Media/B", "Media/Zeta Escrow/Client", "Videos/Memes"]) mkdirSync(join(media, d), { recursive: true });
  writeFileSync(join(media, "Media/A/DJI_0001.MP4"), big(20000));
  writeFileSync(join(media, "Media/A/DJI_0002.MP4"), big(30000));
  writeFileSync(join(media, "Media/A/talk.MP4"), big(40000));
  writeFileSync(join(media, "Media/A/DJI_0005.MP4"), big(1241)); // an aborted recording
  writeFileSync(join(media, "Media/A/New Shoot/DJI_0003.MP4"), big(25000)); // nested, never approved
  writeFileSync(join(media, "Media/Zeta Escrow/Client/DJI_0004.MP4"), big(26000)); // excluded by name
  writeFileSync(join(media, "Videos/Memes/movie-clip.mp4"), big(27000)); // excluded by name
  return { root, media, home, state };
}

// Fake ffprobe: tiny files are unreadable, others are 2-minute DJI drone clips.
function fakeProbe(calls) {
  return async (_ffprobe, file) => {
    calls.push(file);
    const size = readFileSync(file).length;
    if (size < 5000) return { error: "Invalid data found when processing input" };
    return { width: 3840, height: 2160, fps: 30, durationSec: 120, creationTime: null, encoder: "DJI Mini 5 Pro" };
  };
}

async function catalog(w, extra, calls) {
  process.env.LVINIT_PRODUCER_HOME = w.home;
  return run([`--media-root=${w.media}`, `--state-dir=${w.state}`, "--no-oembed", ...extra], { log: () => {}, probe: fakeProbe(calls) });
}

test("refresh: recursive, incremental, privacy-preserving, moves tracked, broken files rejected", async () => {
  const w = world();
  const calls1 = [];
  const r1 = await catalog(w, ["--approve=Media/A", "--approve=Media/B", "--exclude=Zeta Escrow", "--exclude=Memes", "--not-broll=Media/A/talk.MP4|talking head"], calls1);
  assert.equal(r1.exitCode, 0, r1.error);
  const pub = new Map(r1.catalog.items.map((i) => [i.path, i]));
  assert.equal(pub.get("Media/A/DJI_0001.MP4").role, "b-roll");
  assert.equal(pub.get("Media/A/talk.MP4").role, "a-roll"); // indexed, but never B-roll
  assert.equal(pub.get("Media/A/DJI_0005.MP4")?.role ?? "unreadable", "unreadable");
  assert.ok(r1.unreadable.some((u) => u.path === "Media/A/DJI_0005.MP4"));
  // The nested new folder is discovered but NOT approved by its parent's approval.
  assert.ok(!pub.has("Media/A/New Shoot/DJI_0003.MP4"));
  assert.deepEqual(r1.pendingFolders.map((f) => f.folder), ["Media/A/New Shoot"]);
  assert.equal(r1.pendingFolders[0].originalVideos, 1);
  // Excluded folders are never opened: not in any catalog, not even probed.
  const local = readFileSync(join(w.home, "footage-catalog.local.json"), "utf8");
  for (const s of ["Zeta Escrow", "Client", "movie-clip", "Memes/"]) {
    assert.ok(!local.includes(s), s);
    assert.ok(!JSON.stringify(r1.catalog).includes(s), s);
  }
  assert.ok(!calls1.some((c) => /Zeta Escrow|Memes/.test(c)));
  assert.equal(calls1.length, 5);

  // Next week: one clip moved to another approved folder, one new clip added.
  renameSync(join(w.media, "Media/A/DJI_0002.MP4"), join(w.media, "Media/B/DJI_0002.MP4"));
  writeFileSync(join(w.media, "Media/A/DJI_0006.MP4"), big(31000));
  const calls2 = [];
  const r2 = await catalog(w, [], calls2);
  assert.equal(calls2.length, 2, "only the new and moved files are probed again");
  assert.deepEqual(r2.delta.moved, [{ from: "Media/A/DJI_0002.MP4", to: "Media/B/DJI_0002.MP4", type: "video" }]);
  assert.deepEqual(r2.delta.added.map((a) => a.path), ["Media/A/DJI_0006.MP4"]);
  assert.equal(r2.delta.missing.length, 0);
  const pub2 = new Set(r2.catalog.items.map((i) => i.path));
  assert.ok(pub2.has("Media/B/DJI_0002.MP4") && !pub2.has("Media/A/DJI_0002.MP4"));
  // Privacy decisions persisted; nothing approved automatically.
  const privacy = JSON.parse(readFileSync(join(w.home, "privacy.json"), "utf8"));
  assert.ok(!privacy.approved.includes("Media/A/New Shoot"));
  assert.deepEqual(privacy.notBroll, [{ path: "Media/A/talk.MP4", reason: "talking head" }]);
});

test("continuous takes of 10+ minutes stay out of the B-roll pool until classified", () => {
  const config = loadConfig();
  const file = { rel: "Videos/Some Project/DJI_20260929135503_0165_D.MP4", ext: "mp4", size: 1e9, mtimeMs: 0 };
  const e = describeEntry(file, { width: 3840, height: 2160, durationSec: 2175, encoder: "DJI OsmoPocket3" }, { status: "public" }, config);
  assert.equal(e.role, "long-take");
  const short = describeEntry({ ...file, rel: "Media/X/DJI_1.MP4" }, { width: 3840, height: 2160, durationSec: 40, encoder: "DJI OsmoPocket3" }, { status: "public" }, config);
  assert.equal(short.role, "b-roll");
});

test("moved files keep their reuse history; the email lists folders awaiting approval", () => {
  const usage = { uses: [{ weekOf: "2026-10-05", kind: "short", path: "Media/Henderson/215-eastbound.MP4" }] };
  assert.equal(remapUsage(usage, [{ from: "Media/Henderson/215-eastbound.MP4", to: "Media/Henderson/215/215-eastbound.MP4" }]), 1);
  assert.equal(usage.uses[0].path, "Media/Henderson/215/215-eastbound.MP4");
  const d = catalogDelta([{ path: "a/x.mp4", sizeMB: 1, type: "video" }, { path: "a/y.mp4", sizeMB: 2, type: "video" }], [{ path: "b/x.mp4", sizeMB: 1, type: "video" }]);
  assert.deepEqual(d.moved, [{ from: "a/x.mp4", to: "b/x.mp4", type: "video" }]);
  assert.deepEqual(d.missing, [{ path: "a/y.mp4", type: "video" }]);
  const m = composeMessage({ ok: true, weekOf: "2026-10-19", posts: 6, catalog: { added: 3, moved: [{}], missing: [], unreadable: [{}], pendingFolders: [{ folder: "Media/New Place", videos: 4, originalVideos: 4, images: 0 }] } });
  assert.match(m.text, /waiting for your approval[\s\S]*Media\/New Place: 4 videos \(4 original\)[\s\S]*--approve="Media\/New Place"/);
  assert.match(m.text, /1 moved \(paths updated\).*1 unreadable/);
});

test("leak guard: an approved subfolder may show its parent's name; the parent's other files stay private", async () => {
  const { privateTermsFor } = await import("../lib/sanitize.mjs");
  const entries = [
    { path: "Videos/Project X/Portrait/DJI_1.MP4", privacy: { status: "public" } },
    { path: "Videos/Project X/client-walkthrough.mp4", privacy: { status: "local-only", pendingFolder: "Videos/Project X" } },
    { path: "Videos/Project X/Notes/edit_notes.md", privacy: { status: "local-only", pendingFolder: "Videos/Project X/Notes" } },
    { path: "Videos/Secret Shoot/raw.mp4", privacy: { status: "local-only", pendingFolder: "Videos/Secret Shoot" } },
  ];
  const t = privateTermsFor(entries, { excluded: ["Zeta Escrow"], localOnly: [] }).map((x) => x.toLowerCase());
  assert.ok(!t.includes("videos/project x"), "parent of an approved folder");
  assert.ok(!t.includes("notes"), "generic working-folder name");
  assert.ok(t.includes("videos/project x/client-walkthrough.mp4") && t.includes("client walkthrough"));
  assert.ok(t.includes("videos/project x/notes"));
  assert.ok(t.includes("videos/secret shoot") && t.includes("secret shoot"));
  assert.ok(t.includes("zeta escrow"));
});

test("talking heads, teleprompter screens and long walkthroughs are not B-roll by name; short walks are", () => {
  const config = loadConfig();
  const role = (rel, durationSec) => describeEntry({ rel, ext: "mp4", size: 1, mtimeMs: 0 }, { width: 3840, height: 2160, durationSec, encoder: "DJI OsmoPocket3" }, { status: "public" }, config).role;
  assert.equal(role("Media/Henderson/Aries/Gardengate walkthrough pt 1.MP4", 125), "a-roll");
  assert.equal(role("Media/Henderson/Aries/Voiceover pt 1.MP4", 21), "a-roll");
  assert.equal(role("Media/Henderson/Aries/Intro far.MP4", 204), "a-roll");
  assert.equal(role("Media/Henderson/gvr-the-district-walkthrough.MP4", 26), "b-roll");
  assert.equal(role("Media/Henderson/gvr-the-district-restaurants-walkthrough.MP4", 58), "b-roll");
  assert.equal(role("Media/Summerlin/introduction-park.MP4", 30), "b-roll");
});
