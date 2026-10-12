import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

import sharp from "sharp";

import { runWeek, mondayOf } from "../weekly.mjs";
import { buildLedger, similarity, reconcilePublished, initialStatus } from "../lib/ledger.mjs";
import { checkComparatives, checkDistinctTakeaways, checkDuplicate } from "../lib/gate.mjs";
import { composeMessage } from "../lib/notify.mjs";
import { originalClips, verifyOriginal, recordWeek, overusedClips, pickTrack, validateShort } from "../lib/shorts.mjs";
import { assignToSlots, WEEK_MIX } from "../lib/schedule.mjs";

// --- unit checks ------------------------------------------------------------------

test("comparisons need official support: swapping 'closest' for 'nearer' doesn't pass", () => {
  const p = { slides: [{ headline: "Southern Highlands is nearer the south Strip." }], takeaway: "", caption: "" };
  assert.equal(checkComparatives(p, []).length, 1);
  assert.equal(checkComparatives({ slides: [{ headline: "Homes here are cheaper than in Summerlin." }] }, []).length, 1);
  assert.equal(checkComparatives({ slides: [{ headline: "Southern Highlands sits along I-15." }] }, []).length, 0);
});

test("distinct takeaways: three area posts teaching the same lesson are flagged", () => {
  const posts = [
    { day: "Wed", takeaway: "Henderson: same city, different routines depending on the part you pick." },
    { day: "Thu", takeaway: "Summerlin: same address, different days; pick the village." },
    { day: "Sat", takeaway: "Southwest: different routines, so ask which part." },
  ];
  const issues = checkDistinctTakeaways(posts);
  assert.ok(issues.get("Thu")?.length && issues.get("Sat")?.length);
  const distinct = [
    { day: "Wed", takeaway: "In Henderson, decide grown-in or brand-new first." },
    { day: "Thu", takeaway: "In Summerlin, walkability depends on distance to Downtown Summerlin." },
    { day: "Sat", takeaway: "In the Southwest, your commute depends on I-15 and 215 access." },
  ];
  assert.equal(checkDistinctTakeaways(distinct).size, 0);
});

test("drafts are not history; ready, approved, scheduled and published are", () => {
  const today = "2026-10-05";
  const post = { title: "HOA dues and SID assessments", takeaway: "Get the HOA and SID for the parcel." };
  assert.equal(checkDuplicate(post, [{ date: "2026-09-28", source: "batch", status: "draft", text: "HOA and SID costs", tags: ["hoa-sid-lid"] }], today).length, 0);
  for (const status of ["ready", "approved", "scheduled", "published"]) {
    assert.equal(checkDuplicate(post, [{ date: "2026-09-28", source: "batch", status, text: "HOA and SID costs", tags: ["hoa-sid-lid"] }], today).length, 1, status);
  }
});

test("published detection doesn't fire on generic word overlap, and needs a dated post after the batch", () => {
  const caption = "Two Las Vegas homes at the same price can carry very different monthly costs. HOA dues and SID assessments";
  assert.equal(similarity("6,000 New Homes Are Planned in Las Vegas", caption), 0);
  const root = mkdtempSync(join(tmpdir(), "ledger-"));
  const dir = join(root, "Week of 2026-09-28");
  mkdirSync(dir);
  const week = { weekOf: "2026-09-28", posts: [{ day: "Tue", title: "Monthly costs", caption }] };
  writeFileSync(join(dir, "week.json"), JSON.stringify(week));
  writeFileSync(join(dir, "status.json"), JSON.stringify(initialStatus(week)));
  assert.equal(reconcilePublished(root, [{ platform: "Instagram", date: "2026-09-20", text: caption, url: "x" }]).length, 0); // before the batch
  assert.equal(reconcilePublished(root, [{ platform: "YouTube", date: "2026-09-30", dateApprox: true, text: caption, url: "x" }]).length, 0); // undated
  assert.equal(reconcilePublished(root, [{ platform: "Instagram", date: "2026-09-30", text: caption, url: "x" }]).length, 1);
  assert.equal(JSON.parse(readFileSync(join(dir, "status.json"), "utf8")).posts.Tue.status, "published");
  const l = buildLedger({ outRoot: root, currentWeekOf: "2026-10-05" });
  assert.equal(l.find((e) => e.source === "batch").status, "published");
});

test("notification text: success lists exceptions with a recommendation; failure names the step and reason", () => {
  const ok = composeMessage({ ok: true, weekOf: "2026-10-05", posts: 7, exceptions: [{ day: "Tue", title: "X", issues: [{ message: "Slide 2 text unreadable." }], resolution: "Replace slide 2's image." }], costs: { totalUsd: 1.2, apifyUsd: 0.4, anthropicUsd: 0.8 } });
  assert.match(ok.subject, /7 posts ready.*1 to decide/);
  assert.match(ok.text, /Recommended: Replace slide 2's image\./);
  const bad = composeMessage({ ok: false, weekOf: "2026-10-05", failedStep: "plan", error: "No key" });
  assert.match(bad.subject, /FAILED \(plan\)/);
  assert.match(bad.text, /Reason: No key/);
});

// --- the whole chain on synthetic media ------------------------------------------------

async function fixtureWorld() {
  const root = mkdtempSync(join(tmpdir(), "weekly-"));
  const media = join(root, "media");
  mkdirSync(join(media, "Media", "Test"), { recursive: true });
  const items = [];
  for (let i = 0; i < 20; i++) {
    const f = `Media/Test/p${String(i).padStart(2, "0")}.jpg`;
    // Visually distinct synthetic photos: large seeded blocks across the whole frame.
    let seed = i * 7919 + 13;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const blocks = Array.from({ length: 14 }, () => `<rect x="${Math.floor(rnd() * 1000)}" y="${Math.floor(rnd() * 1300)}" width="${200 + Math.floor(rnd() * 500)}" height="${200 + Math.floor(rnd() * 600)}" fill="rgb(${Math.floor(rnd() * 255)},${Math.floor(rnd() * 255)},${Math.floor(rnd() * 255)})"/>`).join("");
    const svg = `<svg width="1200" height="1500" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="1500" fill="rgb(40,50,70)"/>${blocks}<rect width="1200" height="480" fill="rgb(40,60,110)" opacity="0.85"/></svg>`;
    await sharp(Buffer.from(svg)).jpeg().toFile(join(media, f));
    items.push({ id: `i${i}`, path: f, folder: "Media/Test", type: "image", role: "photo", area: "valley-wide" });
  }
  // Synthetic "camera-original" clips for the short videos (metadata is injected via probeOriginal),
  // plus one edited export that the footage policy must never use.
  mkdirSync(join(media, "Media", "Clips"), { recursive: true });
  for (let i = 0; i < 18; i++) {
    const f = `Media/Clips/DJI_2026100${String(i).padStart(2, "0")}_D.MP4`;
    execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", `cellauto=rule=${30 + i * 11}:seed=${i + 1}:size=360x640:rate=30:random_fill_ratio=0.5,scale=720:1280:flags=neighbor`, "-t", "8", "-pix_fmt", "yuv420p", join(media, f)]);
    items.push({ id: `v${i}`, path: f, folder: "Media/Clips", type: "video", role: "b-roll", camera: "handheld", orientation: "vertical", durationSec: 8, area: "valley-wide", subject: `clip ${i}` });
  }
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", "testsrc2=size=720x1280:rate=30", "-t", "8", "-pix_fmt", "yuv420p", join(media, "Media/Clips/edited-export.mp4")]);
  items.push({ id: "e1", path: "Media/Clips/edited-export.mp4", folder: "Media/Clips", type: "video", role: "b-roll", camera: "edited", orientation: "vertical", durationSec: 8, area: "valley-wide", subject: "edited export" });
  const catalogPath = join(root, "catalog.json");
  writeFileSync(catalogPath, JSON.stringify({ items, folders: [{ folder: "Media/Test", photos: 20 }, { folder: "Media/Clips", videos: 19 }] }));
  const src = [{ claim: "c", url: "https://www.lvinit.com/neighborhoods/summerlin", authority: "lvinit", checked: "2026-10-05" }];
  const areas = ["Summerlin", "Henderson", "the Arts District", "Southwest Las Vegas", "North Las Vegas", "Green Valley", "Inspirada"];
  const lessons = ["trail access", "grocery runs", "parking on First Friday", "commute to I-15", "established streets", "HOA structure", "park access"];
  const posts = areas.map((a, i) => ({
    slug: `post-${i}`,
    title: `Post about ${a}`,
    category: "Local knowledge",
    format: "carousel",
    topics: [`topic-${i}`],
    takeaway: [`Trails start at the edge of ${a}.`, `${a} errands mean a short grocery drive.`, `${a} parking tightens on First Friday.`, `${a} commutes hinge on the I-15 ramps.`, `${a} has mature trees on older streets.`, `${a} HOAs stack two associations.`, `${a} parks anchor each village.`][i],
    cta: "Guide on lvinit.com",
    caption: `Caption about ${lessons[i]} in ${a}.`,
    hashtags: ["lvinit"],
    slides: [
      { source: { folder: "Media/Test" }, want: "a scene", headline: `${a}: ${lessons[i]}`, position: "top" },
      { source: { folder: "Media/Test" }, want: "another scene", headline: `More on ${lessons[i]} in ${a}`, position: "top" },
    ],
    sources: src,
    references: [],
  }));
  // Tue/Thu/Sat are short videos: five segments each, from the synthetic original clips.
  const shortDays = [1, 3, 5];
  for (const [k, i] of shortDays.entries()) {
    const { slides, ...rest } = posts[i];
    posts[i] = {
      ...rest,
      format: "short",
      cta: `More on ${areas[i]} at lvinit.com`,
      // Each short its own rhythm (the variety check rejects identical pacing).
      segments: Array.from({ length: 4 + k }, (_, j) => ({ clip: `Media/Clips/DJI_2026100${String(k * 6 + j).padStart(2, "0")}_D.MP4`, want: "a scene", dur: [3.8, 2.6, 4.4, 3.2, 2.4, 3.0][(j + k) % 6], headline: j === 0 ? `${areas[i]}: ${lessons[i]}` : `Beat ${j + 1} in ${areas[i]}` })),
    };
  }
  return { root, media, catalogPath, posts: posts.slice(0, 6) };
}

function services(posts, { failPlan = false, sent = [] } = {}) {
  const reply = (o) => ({ content: [{ type: "text", text: JSON.stringify(o) }], stop_reason: "end_turn", usage: { input_tokens: 1000, output_tokens: 100 } });
  const anthropic = {
    messages: {
      async create(req) {
        const c = req.messages[0].content;
        const text = Array.isArray(c) ? c.filter((x) => x.type === "text").map((x) => x.text).join("") : c;
        if (text.includes('Return JSON { "posts": [6]')) {
          if (failPlan) throw new Error("simulated API outage");
          return reply({ posts, backups: [] });
        }
        if (text.startsWith("Verify every factual claim")) return reply({ posts: posts.map((p, i) => ({ day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i], ok: true, problems: [] })), sameLesson: [] });
        if (text.includes("Tiles are numbered")) return reply({ pick: 0, reason: "test" });
        if (text.includes("finished slides") || text.includes("finished LVINIT short video")) return reply({ slides: [1, 2, 3, 4, 5].map((n) => ({ n, ok: true, issues: [], fix: "none" })) });
        throw new Error("unexpected call");
      },
    },
  };
  const fetchImpl = async (url, init = {}) => {
    const u = String(url);
    const json = (o) => ({ ok: true, status: 200, json: async () => o, text: async () => JSON.stringify(o) });
    if (u.includes("/acts/")) return json({ data: { id: "r", status: "SUCCEEDED", defaultDatasetId: "d", usageTotalUsd: 0.05 } });
    if (u.includes("/datasets/")) return json([]);
    if (u.includes("api.resend.com")) {
      sent.push(JSON.parse(init.body));
      return json({ id: "e1" });
    }
    return { ok: false, status: 503, text: async () => "offline", json: async () => ({}) }; // YouTube offline in tests
  };
  const scratch = mkdtempSync(join(tmpdir(), "weekly-svc-"));
  const probeOriginal = (abs) => ({ format: { tags: { encoder: /edited/.test(abs) ? "Lavf61.7.100" : "DJI OsmoPocket3" } }, streams: [] });
  return { anthropic, fetchImpl, probeOriginal, usageFile: join(scratch, "footage-usage.json"), musicDir: join(scratch, "no-music"), env: { APIFY_TOKEN: "t", ANTHROPIC_API_KEY: "k", LVINIT_INSTAGRAM: "me", RESEND_API_KEY: "r", LVINIT_NOTIFY_EMAIL: "me@example.com" }, notifyToast: false };
}

test("unattended run: 3 carousels + 3 validated short videos, no Sunday post, drafts status, costs, usage, email", { timeout: 600000 }, async () => {
  const w = await fixtureWorld();
  const sent = [];
  const svc = services(w.posts, { sent });
  const r = await runWeek(["--week=2026-10-05", `--out=${join(w.root, "out")}`, `--media-root=${w.media}`, `--catalog=${w.catalogPath}`, "--no-env"], { log: () => {}, services: { ...svc, notify: undefined } });
  assert.equal(r.exitCode, 0, JSON.stringify(r.report.steps));
  if (process.env.DEBUG_WEEK) console.log("EXC", JSON.stringify(r.report.exceptions), JSON.stringify(r.report.replaced));
  const dir = join(w.root, "out", "Week of 2026-10-05");
  const folders = readdirSync(dir).filter((f) => /^\d-/.test(f));
  assert.deepEqual(folders.map((f) => f.split("-")[1]), ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  for (const f of folders) {
    const video = /-(Tue|Thu|Sat)-/.test(f);
    assert.ok(existsSync(join(dir, f, video ? "short.mp4" : "01.jpg")) && existsSync(join(dir, f, "caption.txt")), f);
    if (video) {
      const v = validateShort(join(dir, f, "short.mp4"));
      assert.ok(v.ok, `${f}: ${v.problems.join("; ")}`);
      assert.equal(v.info.width, 1080);
      assert.equal(v.info.height, 1920);
      assert.ok(v.info.duration >= 15 && v.info.duration <= 30);
      assert.match(readFileSync(join(dir, f, "notes.md"), "utf8"), /ONLY Mikey's original camera footage[\s\S]*End card: LVINIT · Living Las Vegas from the Inside · Mikey Del Rosario · The Scofield Group · 702-779-9780/);
    }
  }
  assert.ok(existsSync(join(dir, "preview.html")) && existsSync(join(dir, "DONE.json")));
  const status = JSON.parse(readFileSync(join(dir, "status.json"), "utf8"));
  assert.ok(Object.values(status.posts).every((p) => p.status === "draft"));
  assert.equal(r.report.manual.length, 0);
  assert.ok(r.report.costs.apifyUsd > 0 && r.report.costs.anthropicUsd > 0);
  assert.equal(sent.length, 1);
  assert.match(sent[0].subject, /6 posts ready/);
  assert.match(sent[0].text, /3 carousels \+ 3 short videos; no Sunday post/);
  // Every slide in the week uses a different image.
  const week = JSON.parse(readFileSync(join(dir, "week.json"), "utf8"));
  const used = week.posts.flatMap((p) => (p.slides ?? []).map((s) => s.src.path));
  assert.equal(new Set(used).size, used.length);
  // Shorts used only camera-original clips, never the edited export, and the usage ledger recorded them.
  const clips = week.posts.flatMap((p) => (p.segments ?? []).map((s) => s.path));
  assert.equal(clips.length, 15); // 4 + 5 + 6 segments
  // Three different treatments in one week.
  assert.equal(new Set(week.posts.filter((p) => p.segments).map((p) => p.treatment)).size, 3);
  assert.ok(clips.every((c) => /DJI_/.test(c)));
  const usage = JSON.parse(readFileSync(svc.usageFile, "utf8"));
  assert.equal(usage.uses.filter((u) => u.kind === "short").length, 15);
  assert.match(week.gaps.join(" "), /No licensed music/);
});

test("unattended run failure: RUN-FAILED.md and a failure email", { timeout: 60000 }, async () => {
  const w = await fixtureWorld();
  const sent = [];
  const svc = services(w.posts, { failPlan: true, sent });
  const r = await runWeek(["--week=2026-10-05", `--out=${join(w.root, "out")}`, `--media-root=${w.media}`, `--catalog=${w.catalogPath}`, "--no-env"], { log: () => {}, services: svc });
  assert.equal(r.exitCode, 1);
  assert.ok(existsSync(join(w.root, "out", "Week of 2026-10-05", "RUN-FAILED.md")));
  assert.equal(sent.length, 1);
  assert.match(sent[0].subject, /FAILED \(plan\)/);
  assert.match(sent[0].text, /simulated API outage/);
});

test("mondayOf: a Sunday-evening run produces the week starting the next day", () => {
  assert.equal(mondayOf(new Date("2026-09-28T02:00:00Z")), "2026-09-28"); // Sun Sep 27, 7 PM Pacific
  assert.equal(mondayOf(new Date("2026-09-26T20:00:00Z")), "2026-09-28"); // Saturday
  assert.equal(mondayOf(new Date("2026-09-28T16:00:00Z")), "2026-09-28"); // Monday catch-up
  assert.equal(mondayOf(new Date("2026-10-01T16:00:00Z")), "2026-09-28"); // Thursday catch-up
});

test("an immediate batch counts for the next week's checks without marking that week done", () => {
  const root = mkdtempSync(join(tmpdir(), "lvinit-imm-"));
  const dir = join(root, "Immediate posting batch (from Sep 22, 2026)");
  mkdirSync(dir);
  const week = { weekOf: "2026-09-22", posts: [{ day: "Tue", title: "Announced is not built", takeaway: "Fiesta site", topics: ["development"] }] };
  writeFileSync(join(dir, "week.json"), JSON.stringify(week));
  writeFileSync(join(dir, "status.json"), JSON.stringify(initialStatus(week, "ready")));
  const ledger = buildLedger({ outRoot: root, currentWeekOf: "2026-09-28" });
  assert.equal(ledger.find((e) => e.source === "batch").status, "ready");
  assert.ok(!existsSync(join(root, "Week of 2026-09-28", "DONE.json")));
});

test("footage policy: only camera-original approved clips; recently used shorts clips are held back", () => {
  const catalog = { items: [
    { path: "Media/A/DJI_1.MP4", type: "video", role: "b-roll", camera: "drone", durationSec: 20 },
    { path: "Media/A/edited.mp4", type: "video", role: "b-roll", camera: "edited", durationSec: 20 },
    { path: "Videos/X/ai-expand-9x16-1.mp4", type: "video", role: "b-roll", camera: "handheld", durationSec: 20 },
    { path: "Media/A/stock-pexels-city.mp4", type: "video", role: "b-roll", camera: "handheld", durationSec: 20 },
    { path: "Media/A/IMG_2.MOV", type: "video", role: "short", camera: "phone", durationSec: 20 },
    { path: "Media/A/DJI_3.MP4", type: "video", role: "b-roll", camera: "handheld", durationSec: 20 },
  ] };
  const ok = originalClips(catalog, "C:/x", { exists: () => true }).map((c) => c.path);
  assert.deepEqual(ok, ["Media/A/DJI_1.MP4", "Media/A/DJI_3.MP4"]);
  assert.equal(verifyOriginal("C:/x/a.mp4", "Media/A/a.mp4", { probe: () => ({ format: { tags: { encoder: "Lavf61" } }, streams: [] }) }).ok, false);
  assert.equal(verifyOriginal("C:/x/b.mp4", "Media/A/b.mp4", { probe: () => ({ format: { tags: { encoder: "DJI Mini 5 Pro" } }, streams: [] }) }).camera, "drone");
  const usage = recordWeek({ uses: [], music: [] }, "2026-10-05", [{ day: "Tue", title: "t", segments: [{ path: "Media/A/DJI_1.MP4", start: 1, dur: 3 }], music: { file: "a.mp3" } }]);
  assert.ok(overusedClips(usage, "2026-10-19").has("media/a/dji_1.mp4"));
  assert.ok(!overusedClips(usage, "2026-11-09").has("media/a/dji_1.mp4"));
  const tracks = [{ file: "a.mp3" }, { file: "b.mp3" }];
  assert.equal(pickTrack(tracks, usage, []).file, "b.mp3");
  assert.equal(pickTrack(tracks, usage, ["b.mp3"]).file, "a.mp3");
  assert.equal(pickTrack([], usage, []), null);
});

test("weekly mix: carousels Mon/Wed/Fri, shorts Tue/Thu/Sat, nothing on Sunday", () => {
  const c = (t) => ({ title: t, format: "carousel", slides: [{}] });
  const v = (t) => ({ title: t, format: "short", segments: [{}] });
  const r = assignToSlots([v("s1"), c("c1"), c("c2"), v("s2"), c("c3"), v("s3"), c("c4")]);
  assert.deepEqual(r.posts.map((p) => `${p.day}:${p.title}`), ["Mon:c1", "Tue:s1", "Wed:c2", "Thu:s2", "Fri:c3", "Sat:s3"]);
  assert.deepEqual(r.extra.map((p) => p.title), ["c4"]);
  assert.deepEqual(assignToSlots([c("c1")]).missing.map((m) => m.day), ["Tue", "Wed", "Thu", "Fri", "Sat"]);
  assert.ok(!WEEK_MIX.some((m) => m.day === "Sun"));
});
