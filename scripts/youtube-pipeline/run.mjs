#!/usr/bin/env node
// ---------------------------------------------------------------------------
// LVINIT YOUTUBE → WEBSITE PIPELINE — RUNNER
//
//   node scripts/youtube-pipeline/run.mjs                    every approved manifest video
//   node scripts/youtube-pipeline/run.mjs --video=<id|url>   one video (must be in the manifest)
//   node scripts/youtube-pipeline/run.mjs --fixtures         synthetic videos, real site
//   node scripts/youtube-pipeline/run.mjs --dry-run          analyze, write nothing
//
// In order:
//   1. read the approved-video manifest (data/youtube-pipeline/manifest.json)
//   2. read what the site already knows about every video (no YouTube calls)
//   3. build the content inventory the other agents share (read-only)
//   4. read earlier reports + Publisher commit trailers (lifecycle, dedupe)
//   5. per video: transcript → claims → overlap → action → draft → gates
//   6. write reports/youtube-pipeline/: Markdown + JSON report, one package per
//      video, and the handoff queue (dry-run unless explicitly enabled)
//
// Never: edits a page, writes an article into app/, commits, pushes, deploys,
// triggers the Publisher, or calls YouTube. Output is gitignored.
// ---------------------------------------------------------------------------

import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig as loadBriefConfig } from "../content-briefs/config.mjs";
import { buildInventory } from "../content-briefs/lib/inventory.mjs";

import { loadConfig } from "./config.mjs";
import { analyzeVideo } from "./lib/analyze.mjs";
import { buildPackage, buildQueue, validateQueue } from "./lib/handoff.mjs";
import { buildHistory, makeIdFactory, readPreviousReports, readPublishedFingerprints } from "./lib/history.mjs";
import { readSiteSourceText } from "./lib/images.mjs";
import { mergeVideo, readManifest, readSiteVideos, unlistedSiteVideos } from "./lib/registry.mjs";
import { buildJsonReport, buildMarkdownReport, summaryLines } from "./lib/report.mjs";
import { extractVideoId } from "./lib/youtube.mjs";
import { fixtureVideos } from "./fixtures/fixture-videos.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

const HELP = `
LVINIT YouTube → Website Pipeline

  node scripts/youtube-pipeline/run.mjs [options]

Report-only. Turns approved long-form videos into Publisher-ready packages and a
dry-run handoff queue in reports/youtube-pipeline/. Never edits the site, never
publishes, never triggers the Content Publisher, never calls YouTube.

Options
  --video=ID|URL      Analyze one manifest video.
  --fixtures          Synthetic videos and transcripts against the real site.
                      Written to reports/youtube-pipeline/fixtures/, stamped FIXTURE.
  --dry-run           Analyze and print the summary, write no files.
  --today=YYYY-MM-DD  Pretend today is this date.
  --no-history        Ignore earlier reports.
  --no-git            Do not read git log (Publisher status becomes unverified,
                      which blocks handoff).
  --out=DIR           Output directory (default reports/youtube-pipeline).
  --help              This message.

The manifest (data/youtube-pipeline/manifest.json) lists approved videos and
their transcripts. Everything else — title, duration, poster, where the video is
embedded — is read from the site. See docs/YOUTUBE_PIPELINE.md.
`;

export function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const i = raw.indexOf("=");
    if (i < 0) args[raw.slice(2)] = true;
    else args[raw.slice(2, i)] = raw.slice(i + 1);
  }
  return args;
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export async function run(argv = process.argv.slice(2), { log = console.log, repoRoot = REPO_ROOT } = {}) {
  const args = parseArgs(argv);
  if (args.help) {
    log(HELP);
    return { exitCode: 0 };
  }
  const overrides = { inputs: {}, output: {} };
  if (args["no-git"]) overrides.inputs.useGitLog = false;
  if (args.out) overrides.output.dir = String(args.out);
  const config = loadConfig(overrides);
  const briefConfig = loadBriefConfig({ inputs: { useGitLog: false }, inventory: { useGitDates: false } });
  const fixtures = Boolean(args.fixtures);
  const today = args.today ? String(args.today) : todayIso();

  log("LVINIT YouTube → Website Pipeline (report-only)");

  const manifest = fixtures ? { available: true, path: "fixtures", videos: [], problems: [] } : readManifest(repoRoot, config.inputs.manifest);
  const siteVideos = readSiteVideos(repoRoot);
  let records;
  let transcripts = new Map();
  if (fixtures) {
    const fx = fixtureVideos();
    records = fx.map((f) => f.video);
    transcripts = new Map(fx.map((f) => [f.video.youtubeId, f.transcript]));
  } else {
    records = manifest.videos.filter((v) => v.approved).map((entry) => mergeVideo(entry, siteVideos.get(entry.youtubeId)));
  }
  if (args.video) {
    const id = extractVideoId(args.video);
    records = records.filter((v) => v.youtubeId === id);
    if (!records.length) {
      log(`  ${args.video} is not an approved video in ${config.inputs.manifest}. Add it there first.`);
      return { exitCode: 1 };
    }
  }
  log(`  Manifest:  ${manifest.path} — ${manifest.videos.length} listed, ${records.length} to analyze${manifest.problems.length ? ` (problems: ${manifest.problems.join("; ")})` : ""}`);

  const inventory = buildInventory({ repoRoot, config: briefConfig, today });
  log(`  Site:      ${inventory.totals.published} published editorial pages, ${siteVideos.size} videos referenced`);

  const previousReports = args["no-history"] || fixtures ? [] : readPreviousReports({ repoRoot, config, beforeDate: today });
  const history = buildHistory(previousReports);
  const published = readPublishedFingerprints({ repoRoot, config });
  const sourceText = readSiteSourceText(repoRoot);
  const nextId = makeIdFactory(today);

  const items = records.map((video) =>
    analyzeVideo({ video, repoRoot, inventory, briefConfig, config, today, history, published, nextId, sourceText, transcriptOverride: transcripts.get(video.youtubeId) ?? null })
  );
  const queue = buildQueue({ items, config, reportDate: today, fixtureData: fixtures });
  const queueCheck = validateQueue(queue, { maxPerRun: config.handoff.maxPerRun });
  if (!queueCheck.valid) throw new Error(`handoff queue failed its own schema: ${queueCheck.problems.join("; ")}`);

  const meta = {
    reportDate: today,
    generatedAt: new Date().toISOString(),
    fixtureData: fixtures,
    unlisted: fixtures ? [] : unlistedSiteVideos(siteVideos, manifest.videos),
    inputs: {
      manifest: manifest.path,
      manifestVideos: manifest.videos.length,
      approved: manifest.videos.filter((v) => v.approved).length,
      manifestProblems: manifest.problems,
      sitePages: inventory.totals.published,
      siteVideos: siteVideos.size,
      publisherStatus: published.available ? "read" : `unverified (${published.reason})`,
      historyReports: previousReports.length,
    },
  };
  const json = buildJsonReport({ items, queue, meta });
  const markdown = buildMarkdownReport({ items, queue, meta });

  const outDir = join(repoRoot, config.output.dir, fixtures ? "fixtures" : "");
  const paths = {
    md: join(outDir, `youtube-pipeline-${today}.md`),
    json: join(outDir, `youtube-pipeline-${today}.json`),
    queue: join(outDir, `handoff-queue-${today}.json`),
    queueLatest: join(outDir, "handoff-queue.json"),
    packages: join(outDir, "packages"),
  };
  if (!args["dry-run"]) {
    mkdirSync(paths.packages, { recursive: true });
    for (const name of existsSync(paths.packages) ? readdirSync(paths.packages) : []) {
      if (name.startsWith(`VID-${today}-`)) rmSync(join(paths.packages, name));
    }
    writeFileSync(paths.md, `${markdown}\n`, "utf8");
    writeFileSync(paths.json, `${JSON.stringify(json, null, 2)}\n`, "utf8");
    for (const item of items) writeFileSync(join(paths.packages, `${item.id}.json`), `${JSON.stringify(buildPackage(item, { reportDate: today, config }), null, 2)}\n`, "utf8");
    writeFileSync(paths.queue, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
    writeFileSync(paths.queueLatest, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
  }

  log("");
  for (const line of summaryLines(items, queue)) log(line);
  log("");
  log(args["dry-run"] ? "  --dry-run: no files written." : `  Wrote ${paths.md}\n        ${paths.json}\n        ${paths.queue}`);
  if (fixtures) log("\n  ⚠️  FIXTURE RUN — the videos above are synthetic. Do not act on them.");
  return { exitCode: 0, items, queue, json, markdown, paths };
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  run()
    .then((r) => {
      process.exitCode = r.exitCode ?? 0;
    })
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    });
}
