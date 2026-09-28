// ---------------------------------------------------------------------------
// SIGNALS — read what the specialist agents already produced
//
// The Weekly Publisher is the editor-in-chief layer. It never re-does an
// agent's work; it reads each agent's latest output from wherever that agent
// keeps it:
//
//   Local Trend Agent / Development Watch   lvinit-agent-state branch
//   Executive Producer (7 finished posts)   OneDrive\…\Weekly Posts\Week of <date>\
//                                           + footage/video inventory on the state branch
//   GSC Opportunity / Fact-Decay /          latest GitHub Actions artifact (gh CLI)
//   Internal Linking
//   Content Brief Generator / Site Quality  latest artifact, else Mikey's local reports/ copy
//   Published site + recent history         git (origin/main) + the site's own content files
//   YouTube uploads                         Mikey's public channel feed
//   Earlier weekly plans                    lvinit-agent-state reports/weekly-content/
//
// Every collector returns { name, ok, summary, text }. A missing or failed
// signal is recorded (and shown in the plan's PIPELINE STATUS) but never stops
// the run: a plan built from fewer signals beats no plan.
// ---------------------------------------------------------------------------

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { addDays } from "./week.mjs";

const STATE = "origin/lvinit-agent-state";
const MAX = 14000; // characters per signal handed to the editor

function git(repo, args) {
  return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 }).trim();
}

const clip = (s, n = MAX) => (s.length > n ? `${s.slice(0, n)}\n…[truncated]` : s);

function stateFiles(repo, dir) {
  try {
    return git(repo, ["ls-tree", "--name-only", `${STATE}:${dir}`]).split("\n").filter(Boolean);
  } catch {
    return [];
  }
}
const stateShow = (repo, path) => git(repo, ["show", `${STATE}:${path}`]);

async function collect(name, fn) {
  try {
    const r = await fn();
    return { name, ok: r.ok ?? true, summary: r.summary, text: r.text ?? "" };
  } catch (e) {
    return { name, ok: false, summary: `not available (${String(e?.message ?? e).split("\n")[0].slice(0, 160)})`, text: "" };
  }
}

// ---- GitHub Actions artifacts ------------------------------------------------

function latestArtifactRun(repo, workflow, gh) {
  const runs = JSON.parse(gh(repo, ["run", "list", "--workflow", workflow, "-L", "10", "--json", "databaseId,conclusion,createdAt,status"]));
  const ok = runs.find((r) => r.conclusion === "success");
  return { ok, latest: runs[0] };
}

function defaultGh(repo, args) {
  return execFileSync("gh", args, { cwd: repo, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 });
}

/** Downloads one artifact of the latest successful run; returns { dir, run, files } or throws. */
function downloadArtifact(repo, workflow, artifact, gh) {
  const { ok, latest } = latestArtifactRun(repo, workflow, gh);
  if (!ok) throw new Error(`no successful run of ${workflow}${latest ? ` (latest: ${latest.conclusion || latest.status})` : ""}`);
  const dir = mkdtempSync(join(tmpdir(), "lvinit-wp-"));
  gh(repo, ["run", "download", String(ok.databaseId), "-n", artifact, "-D", dir]);
  const files = readdirSync(dir, { recursive: true }).map(String);
  return { dir, run: ok, latest, files };
}

function newestMatching(files, re) {
  return files.filter((f) => re.test(f.replace(/\\/g, "/"))).sort().pop();
}

// ---- individual collectors ---------------------------------------------------

function gscSignal(repo, gh) {
  const a = downloadArtifact(repo, "gsc-opportunity-agent.yml", "gsc-opportunities", gh);
  try {
    const f = newestMatching(a.files, /gsc-opportunities-\d{4}-\d{2}-\d{2}\.json$/);
    const j = JSON.parse(readFileSync(join(a.dir, f), "utf8"));
    const opps = (j.opportunities ?? []).slice(0, 8);
    return {
      summary: `run ${a.run.createdAt.slice(0, 10)}: ${opps.length} opportunities; ${j.totals?.impressions ?? "?"} impressions site-wide${j.dataQuality?.lowVolume ? " (low volume, early signal)" : ""}`,
      text: clip(JSON.stringify({ reportDate: j.reportDate, totals: j.totals, dataQuality: j.dataQuality, opportunities: opps }, null, 1)),
    };
  } finally {
    rmSync(a.dir, { recursive: true, force: true });
  }
}

function factDecaySignal(repo, gh) {
  const a = downloadArtifact(repo, "fact-decay-agent.yml", "fact-decay-report", gh);
  try {
    const f = newestMatching(a.files, /fact-decay-\d{4}-\d{2}-\d{2}\.json$/);
    const j = JSON.parse(readFileSync(join(a.dir, f), "utf8"));
    const top = (j.findings ?? [])
      .slice()
      .sort((x, y) => (y.score ?? y.riskScore ?? 0) - (x.score ?? x.riskScore ?? 0))
      .slice(0, 10);
    return { summary: `run ${a.run.createdAt.slice(0, 10)}: ${(j.findings ?? []).length} findings`, text: clip(JSON.stringify({ reportDate: j.reportDate, totals: j.totals, top }, null, 1)) };
  } finally {
    rmSync(a.dir, { recursive: true, force: true });
  }
}

function linksSignal(repo, gh) {
  const a = downloadArtifact(repo, "internal-linking-agent.yml", "internal-links-report", gh);
  try {
    const f = newestMatching(a.files, /internal-links-\d{4}-\d{2}-\d{2}\.json$/);
    const j = JSON.parse(readFileSync(join(a.dir, f), "utf8"));
    return {
      summary: `run ${a.run.createdAt.slice(0, 10)}: ${(j.autoExecuted ?? []).length} applied, ${(j.needsReview ?? []).length} for review`,
      text: clip(JSON.stringify({ reportDate: j.reportDate, needsReview: j.needsReview, signals: j.signals, autoExecuted: j.autoExecuted }, null, 1)),
    };
  } finally {
    rmSync(a.dir, { recursive: true, force: true });
  }
}

/** Artifact first, then Mikey's local copy under reports/<dir>/ in the main checkout. */
function artifactOrLocal({ repo, mainRepo, gh, workflow, artifact, localDir, re, pick }) {
  let dir, file, from;
  try {
    const a = downloadArtifact(repo, workflow, artifact, gh);
    const f = newestMatching(a.files, re);
    if (f) ({ dir, file, from } = { dir: a.dir, file: f, from: `artifact ${a.run.createdAt.slice(0, 10)}` });
    else rmSync(a.dir, { recursive: true, force: true });
  } catch {
    /* fall through to the local copy */
  }
  if (!file) {
    const local = join(mainRepo, "reports", localDir);
    if (!existsSync(local)) throw new Error(`no artifact and no local reports/${localDir}`);
    const f = readdirSync(local).filter((n) => re.test(n)).sort().pop();
    if (!f) throw new Error(`no report in reports/${localDir}`);
    ({ dir, file, from } = { dir: null, file: join(local, f), from: `local copy ${f.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? ""}` });
  }
  try {
    const j = JSON.parse(readFileSync(dir ? join(dir, file) : file, "utf8"));
    const r = pick(j);
    return { summary: `${from}: ${r.summary}`, text: clip(JSON.stringify(r.data, null, 1)) };
  } finally {
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
}

function briefsSignal(repo, mainRepo, gh) {
  return artifactOrLocal({
    repo, mainRepo, gh,
    workflow: "content-brief-generator.yml", artifact: "content-briefs", localDir: "content-briefs",
    re: /content-opportunities-\d{4}-\d{2}-\d{2}\.json$/,
    pick: (j) => ({ summary: `${(j.opportunities ?? []).length} brief(s)`, data: { reportDate: j.reportDate, summary: j.summary, opportunities: (j.opportunities ?? []).slice(0, 6), notes: j.notes } }),
  });
}

function qualitySignal(repo, mainRepo, gh) {
  return artifactOrLocal({
    repo, mainRepo, gh,
    workflow: "site-quality-agent.yml", artifact: "site-quality-report", localDir: "site-quality",
    re: /site-quality-\d{4}-\d{2}-\d{2}\.json$/,
    pick: (j) => ({ summary: `${(j.findings ?? []).length} finding(s)`, data: { reportDate: j.reportDate, summary: j.summary, findings: (j.findings ?? []).slice(0, 6) } }),
  });
}

function trendSignal(repo, weekOf) {
  const files = stateFiles(repo, "reports/social-trends").filter((f) => /^\d{4}-\d{2}-\d{2}-local-trends\.md$/.test(f)).sort();
  const since = addDays(weekOf, -8);
  const recent = files.filter((f) => f.slice(0, 10) >= since).slice(-4);
  if (!recent.length) throw new Error("no Local Trend reports in the last 8 days");
  const weekly = stateFiles(repo, "reports/social-trends/weekly").sort().pop();
  const parts = recent.map((f) => `### ${f}\n${clip(stateShow(repo, `reports/social-trends/${f}`), 4000)}`);
  if (weekly) parts.unshift(`### weekly/${weekly}\n${clip(stateShow(repo, `reports/social-trends/weekly/${weekly}`), 4000)}`);
  return { summary: `${recent.length} daily report(s) through ${recent.at(-1).slice(0, 10)}${weekly ? `, weekly ${weekly.slice(0, 10)}` : ""}`, text: clip(parts.join("\n\n"), MAX * 1.5) };
}

function devWatchSignal(repo, weekOf) {
  const files = stateFiles(repo, "reports/development-watch").filter((f) => /^development-watch-\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort();
  const since = addDays(weekOf, -8);
  const recent = files.filter((f) => f.slice(18, 28) >= since).slice(-3);
  if (!recent.length) throw new Error("no Development Watch reports in the last 8 days");
  return { summary: `${recent.length} report(s) through ${recent.at(-1).slice(18, 28)}`, text: clip(recent.map((f) => `### ${f}\n${clip(stateShow(repo, `reports/development-watch/${f}`), 5000)}`).join("\n\n")) };
}

function producerSignal({ weeklyPostsRoot, weekOf, producerLog }) {
  const dir = join(weeklyPostsRoot, `Week of ${weekOf}`);
  const logTail = producerLog && existsSync(producerLog) ? readFileSync(producerLog, "utf8").split(/\r?\n/).slice(-12).join("\n") : "";
  if (existsSync(join(dir, "RUN-FAILED.md"))) {
    return { ok: false, summary: `this week's social batch FAILED (see ${join(dir, "RUN-FAILED.md")})`, text: readFileSync(join(dir, "RUN-FAILED.md"), "utf8") };
  }
  if (!existsSync(join(dir, "week.json"))) {
    if (existsSync(join(dir, ".run.lock"))) return { ok: false, summary: "this week's social batch is still being produced", text: "" };
    return { ok: false, summary: `no social batch for the week of ${weekOf} (Executive Producer did not deliver). Last log lines: ${logTail.replace(/\s+/g, " ").slice(-300)}`, text: "" };
  }
  const w = JSON.parse(readFileSync(join(dir, "week.json"), "utf8"));
  const posts = (w.posts ?? []).map((p, i) => ({
    folder: readdirSync(dir).filter((n) => n.startsWith(`${i + 1}-`))[0] ?? null,
    day: p.day, date: p.date, format: p.format, title: p.title, category: p.category, takeaway: p.takeaway, cta: p.cta,
    caption: p.caption, hashtags: p.hashtags, slides: (p.slides ?? []).length || undefined, sources: (p.sources ?? []).map((s) => s.url),
  }));
  return {
    summary: `${posts.length} finished draft posts in "${dir}" (${(w.exceptions ?? []).length} exceptions)`,
    text: clip(JSON.stringify({ folder: dir, preview: join(dir, "preview.html"), posts, exceptions: w.exceptions, backups: (w.backups ?? []).map((b) => b.title) }, null, 1), MAX * 2),
  };
}

function recentBatchesSignal({ weeklyPostsRoot, weekOf }) {
  // Earlier batches (last 3 weeks) so the plan never recycles an angle Mikey
  // already has queued or posted.
  if (!existsSync(weeklyPostsRoot)) throw new Error(`${weeklyPostsRoot} not found`);
  const since = addDays(weekOf, -21);
  const out = [];
  for (const d of readdirSync(weeklyPostsRoot, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name === `Week of ${weekOf}` || /\((rehearsal|acceptance|end-to-end test)\)/i.test(d.name)) continue;
    const wj = join(weeklyPostsRoot, d.name, "week.json");
    if (!existsSync(wj) || statSync(wj).mtime.toISOString().slice(0, 10) < since) continue;
    const w = JSON.parse(readFileSync(wj, "utf8"));
    let status = {};
    try {
      status = JSON.parse(readFileSync(join(weeklyPostsRoot, d.name, "status.json"), "utf8")).posts ?? {};
    } catch {
      /* no status file */
    }
    out.push({ batch: d.name, posts: (w.posts ?? []).map((p) => ({ day: p.day, title: p.title, takeaway: p.takeaway, cta: p.cta })), status });
  }
  return { summary: `${out.length} earlier batch(es) in the last 3 weeks`, text: clip(JSON.stringify(out, null, 1)) };
}

function siteSignal(repo, weekOf) {
  const since = addDays(weekOf, -28);
  const log = git(repo, ["log", "origin/main", `--since=${since}`, "--date=short", "--pretty=%ad %s"]);
  // Published pages: every guide/neighborhood route with its title, from the
  // Internal Linking Agent's graph (the shared definition of "published").
  let pages = [];
  try {
    const files = git(repo, ["ls-tree", "-r", "--name-only", "origin/main", "app/guides", "app/neighborhoods"]).split("\n").filter((f) => f.endsWith("page.tsx"));
    pages = files.map((f) => "/" + f.replace(/^app\//, "").replace(/\/page\.tsx$/, "")).filter((r) => !r.includes("["));
  } catch {
    /* listing is best effort */
  }
  let guides = "";
  try {
    guides = git(repo, ["show", "origin/main:lib/guides.ts"]).match(/(slug|title|date|published\w*):\s*["'`][^"'`]+["'`]/g)?.join("\n") ?? "";
  } catch {
    /* no guides registry */
  }
  return { summary: `${log.split("\n").filter(Boolean).length} commits to main in 4 weeks; ${pages.length} static routes`, text: clip(`RECENT COMMITS (origin/main):\n${log}\n\nROUTES:\n${pages.join("\n")}\n\nGUIDE REGISTRY:\n${guides}`, MAX * 1.5) };
}

async function youtubeSignal(channelId, fetchImpl) {
  const res = await fetchImpl(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
  if (!res.ok) throw new Error(`YouTube feed HTTP ${res.status}`);
  const xml = await res.text();
  const items = [...xml.matchAll(/<entry>[\s\S]*?<yt:videoId>([^<]+)<\/yt:videoId>[\s\S]*?<title>([^<]+)<\/title>[\s\S]*?<published>([^<]+)<\/published>/g)]
    .slice(0, 12)
    .map((m) => `${m[3].slice(0, 10)}  ${m[2]}  https://youtu.be/${m[1]}`);
  return { summary: `${items.length} recent uploads (newest ${items[0]?.slice(0, 10) ?? "none"})`, text: items.join("\n") };
}

function inventorySignal(repo) {
  const inv = JSON.parse(stateShow(repo, "data/executive-producer/video-inventory.json"));
  return { summary: `video inventory ${String(inv.generatedAt).slice(0, 10)}: ${(inv.videos ?? []).length} videos`, text: clip(JSON.stringify({ totals: inv.totals, videos: inv.videos }, null, 1)) };
}

function earlierPlansSignal(repo, weekOf) {
  const plans = stateFiles(repo, "reports/weekly-content").filter((f) => /^\d{4}-\d{2}-\d{2}-weekly-content-plan\.md$/.test(f) && f.slice(0, 10) < weekOf).sort().slice(-2);
  if (!plans.length) return { summary: "no earlier weekly plans yet", text: "" };
  return { summary: `${plans.length} earlier plan(s): ${plans.map((p) => p.slice(0, 10)).join(", ")}`, text: clip(plans.map((f) => `### ${f}\n${clip(stateShow(repo, `reports/weekly-content/${f}`), 6000)}`).join("\n\n")) };
}

export async function collectSignals({ repo, mainRepo, weekOf, weeklyPostsRoot, producerLog, channelId, gh = defaultGh, fetchImpl = fetch, log = console.log }) {
  try {
    git(repo, ["fetch", "--quiet", "origin", "main", "lvinit-agent-state"]);
  } catch (e) {
    log(`warning: git fetch failed, using what is already local (${String(e.message).split("\n")[0]})`);
  }
  const all = await Promise.all([
    collect("Executive Producer (this week's social batch)", () => producerSignal({ weeklyPostsRoot, weekOf, producerLog })),
    collect("Local Trend Agent", () => trendSignal(repo, weekOf)),
    collect("Development Watch", () => devWatchSignal(repo, weekOf)),
    collect("GSC Opportunity Agent", () => gscSignal(repo, gh)),
    collect("Content Brief Generator", () => briefsSignal(repo, mainRepo, gh)),
    collect("Fact-Decay Agent", () => factDecaySignal(repo, gh)),
    collect("Internal Linking Agent", () => linksSignal(repo, gh)),
    collect("Site Quality Agent", () => qualitySignal(repo, mainRepo, gh)),
    collect("Published site + git history", () => siteSignal(repo, weekOf)),
    collect("YouTube uploads", () => youtubeSignal(channelId, fetchImpl)),
    collect("Video inventory", () => inventorySignal(repo)),
    collect("Recent social batches", () => recentBatchesSignal({ weeklyPostsRoot, weekOf })),
    collect("Earlier weekly plans", () => earlierPlansSignal(repo, weekOf)),
  ]);
  return all;
}
