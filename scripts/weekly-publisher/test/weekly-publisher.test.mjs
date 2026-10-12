import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { mondayOf, weekDays, assertMonday } from "../lib/week.mjs";
import { validatePlan, renderPlan, STATUSES } from "../lib/render.mjs";
import { assertNamespace } from "../lib/deliver.mjs";
import { parseJson } from "../lib/editor.mjs";
import { runPublisher } from "../run.mjs";

function samplePlan(weekOf = "2026-10-05") {
  const days = weekDays(weekOf).map((d, i) => ({
    day: d.day,
    date: d.date,
    primary: { what: `Post ${i}`, platform: "Instagram", topic: `Topic ${i}`, format: "Carousel", time: "12:00 PM" },
    supporting: ["Story"],
    status: STATUSES[i % STATUSES.length],
    asset: "None yet",
    hook: `Hook ${i}`,
    caption: `Caption ${i}\nsecond line`,
    cta: `CTA ${i}`,
    why: "Because.",
  }));
  return {
    mondayStart: { postToday: "a", claudeReady: "b", mikeyShootToday: "Nothing today", mostImportantTask: "d" },
    days,
    priorities: [{ title: "1", why: "x" }, { title: "2", why: "y" }, { title: "3", why: "z" }],
    website: { publish: "NONE", update: "x", research: "NONE", internalLink: "x", gsc: "NONE", localTrend: "NONE" },
    videoSocial: { notes: [], repurpose: [], mikeyFilm: [] },
    claudeCanBuild: [{ item: "Carousel", forDay: "Tue", detail: "x" }],
    sources: [],
  };
}

test("Sunday 8 PM Pacific plans the next Monday, in both PDT and PST", () => {
  // Sun Oct 4 2026 20:00 PDT = Mon Oct 5 03:00 UTC
  assert.equal(mondayOf(new Date("2026-10-05T03:00:00Z")), "2026-10-05");
  // Sun Nov 8 2026 20:00 PST = Mon Nov 9 04:00 UTC (after the DST change)
  assert.equal(mondayOf(new Date("2026-11-09T04:00:00Z")), "2026-11-09");
  // Sun Mar 14 2027 20:00 PDT = Mon Mar 15 03:00 UTC (after spring forward)
  assert.equal(mondayOf(new Date("2027-03-15T03:00:00Z")), "2027-03-15");
});

test("a Monday catch-up plans the current week; Saturday plans the next", () => {
  assert.equal(mondayOf(new Date("2026-09-28T16:00:00Z")), "2026-09-28"); // Mon 9 AM PDT
  assert.equal(mondayOf(new Date("2026-10-01T19:00:00Z")), "2026-09-28"); // Thu
  assert.equal(mondayOf(new Date("2026-10-03T19:00:00Z")), "2026-10-05"); // Sat
});

test("week days run Monday to Sunday", () => {
  const d = weekDays("2026-09-28");
  assert.equal(d.length, 7);
  assert.equal(d[0].date, "2026-09-28");
  assert.equal(d[6].date, "2026-10-04");
  assert.equal(d[6].day, "Sunday");
  assert.throws(() => assertMonday("2026-09-29"));
});

test("a complete plan validates; holes are named", () => {
  assert.deepEqual(validatePlan(samplePlan(), "2026-10-05"), []);
  const p = samplePlan();
  p.days[3].status = "MAYBE";
  p.days[4].cta = p.days[3].cta;
  p.priorities.pop();
  delete p.website.gsc;
  const problems = validatePlan(p, "2026-10-05").join("\n");
  assert.match(problems, /status "MAYBE"/);
  assert.match(problems, /same CTA as the day before/);
  assert.match(problems, /exactly 3 priorities/);
  assert.match(problems, /website\.gsc/);
});

test("the file starts with the title, week, and START HERE, then the schedule", () => {
  const md = renderPlan(samplePlan(), { weekOf: "2026-10-05", generatedAt: "now" });
  const lines = md.split("\n");
  assert.equal(lines[0], "# LVINIT — THIS WEEK");
  assert.match(lines[2], /^Week of: Monday, October 5, 2026/);
  const order = ["## MONDAY MORNING — START HERE", "## WHAT TO POST THIS WEEK", "## THE 3 PRIORITIES THIS WEEK", "## WEBSITE CONTENT", "## VIDEO + SOCIAL", "## CLAUDE CAN BUILD THIS WEEK"].map((h) => md.indexOf(h));
  assert.ok(order.every((x) => x > 0));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  assert.match(md, /### MONDAY \/ OCT 5/);
  assert.match(md, /MIKEY NEEDS TO FILM:\n\nNOTHING this week/);
});

test("state-branch writes are locked to the weekly-content namespace", () => {
  assert.doesNotThrow(() => assertNamespace(["reports/weekly-content/LATEST.md"]));
  assert.throws(() => assertNamespace(["reports/social-trends/x.md"]));
  assert.throws(() => assertNamespace(["app/page.tsx"]));
});

test("Claude's JSON is found even with text around it", () => {
  assert.deepEqual(parseJson('Here you go:\n{"a":1}\nDone.'), { a: 1 });
  assert.throws(() => parseJson("no json"));
});

const quiet = { log: () => {}, envFile: "none", push: () => ({ pushed: false, reason: "test" }), sendEmail: async () => ({ sent: false, reason: "test" }), toast: async () => ({ shown: false }) };

test("success writes the plan and LATEST.md, and never re-plans a finished week", async () => {
  const out = mkdtempSync(join(tmpdir(), "wp-"));
  const env = { ANTHROPIC_API_KEY: "x" };
  const svc = { ...quiet, env, now: new Date("2026-10-05T03:00:00Z"), collectSignals: async () => [{ name: "A", ok: true, summary: "fine", text: "" }], editWeek: async () => ({ plan: samplePlan(), usd: 0.5 }) };
  const r = await runPublisher([`--out=${out}`], svc);
  assert.equal(r.exitCode, 0);
  const md = readFileSync(join(out, "2026-10-05-weekly-content-plan.md"), "utf8");
  assert.match(md, /^# LVINIT — THIS WEEK/);
  assert.match(md, /PIPELINE STATUS[\s\S]*\*\*A:\*\* fine/);
  assert.match(readFileSync(join(out, "LATEST.md"), "utf8"), /2026-10-05-weekly-content-plan\.md/);
  const again = await runPublisher([`--out=${out}`], svc);
  assert.equal(again.skipped, true);
});

test("failure is never silent: FAILED report + LATEST.md + notification", async () => {
  const out = mkdtempSync(join(tmpdir(), "wp-"));
  const sent = [];
  const r = await runPublisher([`--out=${out}`], {
    ...quiet,
    env: { ANTHROPIC_API_KEY: "x" },
    now: new Date("2026-10-05T03:00:00Z"),
    collectSignals: async () => [],
    editWeek: async () => {
      throw new Error("API down");
    },
    push: (x) => (sent.push(x.files.map((f) => f.rel)), { pushed: true }),
    sendEmail: async (m) => (sent.push(m.subject), { sent: true }),
  });
  assert.equal(r.exitCode, 1);
  const fail = readFileSync(join(out, "2026-10-05-weekly-content-plan-FAILED.md"), "utf8");
  assert.match(fail, /FAILED/);
  assert.match(fail, /API down/);
  assert.match(readFileSync(join(out, "LATEST.md"), "utf8"), /FAILED/);
  assert.ok(!existsSync(join(out, "2026-10-05-weekly-content-plan.md")));
  assert.deepEqual(sent[0], ["reports/weekly-content/2026-10-05-weekly-content-plan-FAILED.md", "reports/weekly-content/LATEST.md"]);
  assert.match(sent[1], /FAILED/);
});

test("a missing API key fails visibly instead of producing nothing", async () => {
  const out = mkdtempSync(join(tmpdir(), "wp-"));
  const r = await runPublisher([`--out=${out}`], { ...quiet, env: {}, now: new Date("2026-10-05T03:00:00Z"), collectSignals: async () => [] });
  assert.equal(r.exitCode, 1);
  assert.match(readFileSync(join(out, "2026-10-05-weekly-content-plan-FAILED.md"), "utf8"), /ANTHROPIC_API_KEY/);
});

test("--plan-json renders a prepared plan and a later success clears an old failure", async () => {
  const out = mkdtempSync(join(tmpdir(), "wp-"));
  writeFileSync(join(out, "2026-10-05-weekly-content-plan-FAILED.md"), "old");
  const pj = join(out, "plan.json");
  writeFileSync(pj, JSON.stringify(samplePlan()));
  const r = await runPublisher([`--out=${out}`, "--week=2026-10-05", `--plan-json=${pj}`], { ...quiet, env: {} });
  assert.equal(r.exitCode, 0);
  assert.ok(!existsSync(join(out, "2026-10-05-weekly-content-plan-FAILED.md")));
});

// --- footage + video inventory: current vs. stale -------------------------------
import { footageSignal } from "../lib/signals.mjs";

function footageWorld({ generatedAt, run } = {}) {
  const root = mkdtempSync(join(tmpdir(), "wp-foot-"));
  const data = join(root, "repo", "data", "executive-producer");
  mkdirSync(data, { recursive: true });
  if (generatedAt) {
    writeFileSync(join(data, "video-inventory.json"), JSON.stringify({ generatedAt, totals: { videos: 2 }, videos: [{ youtubeId: "a" }, { youtubeId: "b" }] }));
    writeFileSync(join(data, "footage-catalog.json"), JSON.stringify({ generatedAt, totals: { videos: 10, videoMinutes: 30 }, folders: [{ folder: "Media/Henderson/Aries", place: "Henderson", area: "henderson", videos: 5, minutes: 12, roles: { "b-roll": 4 }, drone: 3, vertical: 0, dateRange: ["2026-10-06", "2026-10-06"] }] }));
  }
  const posts = join(root, "Weekly Posts");
  if (run) {
    mkdirSync(join(posts, "Week of 2026-10-19"), { recursive: true });
    writeFileSync(join(posts, "Week of 2026-10-19", "run.json"), JSON.stringify(run));
  }
  return { mainRepo: join(root, "repo"), weeklyPostsRoot: posts };
}

test("footage signal: the Sunday 7 PM refresh is used and reported as current", () => {
  const w = footageWorld({ generatedAt: "2026-10-19T02:05:00Z", run: { steps: [{ name: "catalog", ok: true }], gaps: [], catalog: { added: 12, moved: [], missing: [], unreadable: [], pendingFolders: [{ folder: "Media/Secret New Shoot" }], pendingStill: 31 } } }); // Sun Oct 18, 7:05 PM PDT
  const s = footageSignal({ ...w, repo: ".", weekOf: "2026-10-19", stateShowImpl: () => { throw new Error("should not read GitHub"); } });
  assert.equal(s.ok, true);
  assert.match(s.summary, /^current \(refreshed 2026-10-18\): 2 published videos; 10 approved footage videos, 30 min/);
  assert.match(s.summary, /12 new files indexed, 1 new folder\(s\) awaiting approval/);
  assert.ok(s.text.includes("Media/Henderson/Aries"));
  assert.ok(!s.text.includes("Secret New Shoot"), "unapproved folder names never reach the editor or the plan");
});

test("footage signal: an old refresh or a failed one is labeled STALE, never current", () => {
  const old = footageWorld({ generatedAt: "2026-10-12T02:00:00Z" });
  const a = footageSignal({ ...old, repo: ".", weekOf: "2026-10-19" });
  assert.equal(a.ok, false);
  assert.match(a.summary, /^STALE \(last refreshed 2026-10-11; the Sunday 2026-10-18 refresh didn't run\)/);
  const failed = footageWorld({ generatedAt: "2026-10-19T02:05:00Z", run: { steps: [{ name: "catalog", ok: true }], gaps: ["The footage catalog couldn't be refreshed (disk); last week's catalog was used."] } });
  const b = footageSignal({ ...failed, repo: ".", weekOf: "2026-10-19" });
  assert.equal(b.ok, false);
  assert.match(b.summary, /^STALE \(The footage catalog couldn't be refreshed/);
});

test("footage signal: no local files → the older GitHub copy, labeled STALE", () => {
  const none = footageWorld({});
  const s = footageSignal({ ...none, repo: ".", weekOf: "2026-10-19", stateShowImpl: () => JSON.stringify({ generatedAt: "2026-09-18T21:42:30Z", videos: [{}] }) });
  assert.equal(s.ok, false);
  assert.match(s.summary, /^STALE \(the local refreshed catalog is missing\).*\[state-branch copy\]/);
});
