#!/usr/bin/env node
// ---------------------------------------------------------------------------
// LVINIT DEVELOPMENT WATCH — RUNNER
//
// A module of the Local Trend Agent. In CI it runs inside the trend agent's
// daily job (scripts/local-trends/run.mjs --devwatch) on the SAME collection
// pass, so no feed is polled twice. Standalone, it collects for itself:
//
//   node scripts/local-trends/devwatch/run.mjs                  daily, live sources
//   node scripts/local-trends/devwatch/run.mjs --mode=both      daily + weekly summary
//   node scripts/local-trends/devwatch/run.mjs --fixtures       synthetic items, no network
//   node scripts/local-trends/devwatch/run.mjs --help
//
// Monitor → detect meaningful change → verify → dedupe → score → classify →
// (dry-run) handoff queue. It writes ONLY under <state-dir>/reports/development-watch
// and <state-dir>/data/development-watch. It never edits the site, publishes,
// commits, or dispatches the Publisher.
// ---------------------------------------------------------------------------

import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { loadDevConfig } from "./config.mjs";
import { SEED_ENTITIES } from "./entities.mjs";
import { validateRegistry, sourceById } from "../sources.mjs";
import { collect, fetchExcerpt } from "../lib/feeds.mjs";
import { loadCoverage, buildKnownEntities } from "./lib/coverage.mjs";
import { collectDevSources } from "./lib/collect.mjs";
import { triage, buildEvents, developmentSignals } from "./lib/analyze.mjs";
import { buildQueue, readPublishedTrailers } from "./lib/handoff.mjs";
import { loadState, saveState, trackedEntities, applyRun, rememberSeen, recordSourceHealth, writeJson } from "./lib/state.mjs";
import { buildDailyMarkdown, buildDailyJson, buildWeeklyMarkdown } from "./lib/report.mjs";
import { fixtureDevItems, FIXTURE_SEEDS } from "./fixtures/fixture-dev.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

const HELP = `
LVINIT Development Watch (a module of the Local Trend Agent)

  node scripts/local-trends/devwatch/run.mjs [options]

Report only. Reads public sources, writes a development-change report, a
dry-run Publisher queue and its own state. Never edits the site or publishes.

Options
  --mode=daily|weekly|both   What to generate (default daily).
  --fixtures                 Synthetic items, no network. Writes to
                             reports/development-watch/fixtures/ only.
  --dry-run                  Run everything, write nothing.
  --today=YYYY-MM-DD         Pretend today is this date.
  --state-dir=DIR            Root for reports/ and data/ (default: repo root;
                             CI passes a checkout of lvinit-agent-state).
  --no-excerpts              Do not fetch article pages.
  --no-git                   Do not read Publisher commit trailers (blocks handoff).
  --help                     This message.
`;

export function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const [flag, ...rest] = raw.slice(2).split("=");
    args[flag] = rest.length ? rest.join("=") : true;
  }
  return args;
}

export function todayPacific(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function devPaths(stateDir, fixtures) {
  const reports = join(stateDir, "reports", "development-watch");
  const base = fixtures ? join(reports, "fixtures") : reports;
  const data = fixtures ? join(base, "data") : join(stateDir, "data", "development-watch");
  return {
    reports: base,
    data,
    projects: join(data, "projects.json"),
    events: join(data, "events.json"),
    seen: join(data, "seen.json"),
    sources: join(data, "sources.json"),
  };
}

/** Shared-pass health rows, labelled from the registry. */
function sharedHealth(health) {
  return (health ?? []).map((h) => {
    const src = sourceById(h.id);
    return { ...h, name: src?.name ?? h.name, authority: src?.authority ?? null, method: src?.method ?? "rss", shared: true };
  });
}

/**
 * Run Development Watch.
 * @param shared  { items, health } from the trend agent's collection, or null to collect here
 */
export async function runDevelopmentWatch({ today, mode = "daily", fixtures = false, dryRun = false, stateDir, repoRoot = REPO_ROOT, log = console.log, fetchImpl = fetch, delay, shared = null, useGit = true, excerpts = true, configOverrides = {} }) {
  const config = loadDevConfig(configOverrides);
  const paths = devPaths(stateDir, fixtures);
  let exitCode = 0;
  let daily = null;

  if (mode === "daily" || mode === "both") {
    const problems = validateRegistry();
    if (problems.length) {
      log(`  devwatch:  source registry is invalid — ${problems.join("; ")}`);
      return { exitCode: 1 };
    }
    daily = await runDaily({ config, today, fixtures, dryRun, paths, repoRoot, log, fetchImpl, delay, shared, useGit, excerpts });
    exitCode = daily.exitCode;
  }
  if (mode === "weekly" || mode === "both") {
    const start = new Date(Date.parse(`${today}T12:00:00Z`) - 6 * 86_400_000).toISOString().slice(0, 10);
    const dailies = existsSync(paths.reports)
      ? readdirSync(paths.reports)
          .filter((f) => /^development-watch-\d{4}-\d{2}-\d{2}\.json$/.test(f))
          .filter((f) => f.slice(18, 28) >= start && f.slice(18, 28) <= today)
          .map((f) => JSON.parse(readFileSync(join(paths.reports, f), "utf8")))
      : [];
    const md = buildWeeklyMarkdown({ today, dailies });
    if (!dryRun) {
      mkdirSync(join(paths.reports, "weekly"), { recursive: true });
      writeFileSync(join(paths.reports, "weekly.md"), md);
      writeFileSync(join(paths.reports, "weekly", `${today}-weekly.md`), md);
    }
    log(`  devwatch:  weekly summary from ${dailies.length} daily report(s)`);
  }
  return { exitCode, daily };
}

async function runDaily({ config, today, fixtures, dryRun, paths, repoRoot, log, fetchImpl, delay, shared, useGit, excerpts }) {
  const state = loadState(paths);
  const coverage = loadCoverage({ repoRoot, today });
  const known = buildKnownEntities({ seeds: fixtures ? [...SEED_ENTITIES, ...FIXTURE_SEEDS] : SEED_ENTITIES, rosters: coverage.rosters });
  for (const t of trackedEntities(state.projects)) {
    const k = known.get(t.id);
    if (k) k.aliases = [...new Set([...(k.aliases ?? []), ...(t.aliases ?? [])])];
    else known.set(t.id, t);
    known.get(t.id).currentStatus = state.projects[t.id]?.status ?? null;
  }
  log(`  devwatch:  ${known.size} known projects (${SEED_ENTITIES.length} seeds, ${coverage.rosters.reduce((n, r) => n + r.entries.length, 0)} roster rows, ${Object.keys(state.projects).length} tracked) · ${coverage.pages.length} LVINIT pages`);

  // 1. collect
  let raw = [];
  let health = [];
  let legistarVersions = null;
  let entityQueried = [];
  let suppressedAgenda = [];
  if (fixtures) {
    raw = fixtureDevItems(today);
    health = [{ id: "fixture", name: "Fixture items (synthetic)", authority: null, method: "fixture", ok: true, status: 200, items: raw.length }];
  } else {
    if (shared) {
      raw.push(...shared.items);
      health.push(...sharedHealth(shared.health));
    } else {
      const c = await collect(config.trends, { fetchImpl, log, ...(delay ? { delay } : {}) });
      raw.push(...c.items);
      health.push(...sharedHealth(c.health));
    }
    const d = await collectDevSources({ config, sourcesState: state.sources, today, fetchImpl, ...(delay ? { delay } : {}), log, knownEntities: [...known.values()] });
    raw.push(...d.items);
    health.push(...d.health);
    legistarVersions = d.legistarVersions;
    entityQueried = d.entityQueried;
    suppressedAgenda = d.suppressedAgenda;
  }
  const automated = health.filter((h) => !h.manual && !h.skipped);
  if (!fixtures && automated.length && automated.every((h) => !h.ok)) {
    log("  devwatch:  every automated source failed — no report written. This is a failure, not a quiet day.");
    return { exitCode: 1 };
  }

  // 2. triage
  const t = triage(raw, { config, today, seen: state.seen, knownEntities: known });
  log(`  devwatch:  ${raw.length} items → ${t.unchanged.length} unchanged since last run, ${t.stale.length} too old, ${t.passing.length} passed the development gate, ${t.rejected.length} noise`);

  // 3. excerpts for direct-URL items that passed
  if (excerpts && !fixtures) {
    let n = 0;
    for (const it of t.passing) {
      if (n >= config.sources.maxExcerptFetches) break;
      if (["google-news", "google-news-dev", "legistar"].includes(it.via) || it.excerpt) continue;
      const ex = await fetchExcerpt(it.url, config.trends, { fetchImpl });
      n += 1;
      if (ex.ok) it.excerpt = ex.text;
    }
  }

  // 4. events
  const published = fixtures ? { available: true, reason: "fixture", fingerprints: new Map() } : readPublishedTrailers(repoRoot, config, { useGit });
  const { events, entitiesById } = buildEvents(t.passing, { config, today, known, state, coverage, published, fixture: fixtures });
  const queue = buildQueue(events, { config, today, fixture: fixtures });
  const queued = new Set(queue.queue.map((q) => q.fingerprint));
  for (const ev of events) if (queued.has(ev.fingerprint)) ev.queuedMode = queue.mode;
  const signals = developmentSignals(events, today);

  // 5. state
  const nextState = applyRun(state, events, { today, entitiesById, published, config });
  const seenEntries = [
    ...t.passing.map((it) => ({ item: it, outcome: "event", entityId: events.find((e) => e.sources.some((s) => s.itemId === it.id))?.entityId })),
    ...t.rejected.map((it) => ({ item: it, outcome: `noise:${it.reason}` })),
  ];
  const seen = rememberSeen(state.seen, seenEntries, { today, retentionDays: config.lifecycle.seenRetentionDays });
  let sourcesState = recordSourceHealth(state.sources, health.filter((h) => !h.manual && h.id !== "fixture"), today);
  if (legistarVersions) sourcesState = { ...sourcesState, legistar: { events: legistarVersions } };
  if (entityQueried.length) sourcesState = { ...sourcesState, entityQueries: { ...(sourcesState.entityQueries ?? {}), ...Object.fromEntries(entityQueried.map((id) => [id, today])) } };

  const run = {
    today,
    fixture: fixtures,
    events,
    health,
    queue,
    signals,
    suppressedAgenda,
    maxAgeDays: config.gate.maxAgeDays,
    failureAlertAfter: config.sources.failureAlertAfter,
    lastSuccess: Object.fromEntries(Object.entries(sourcesState.sources ?? {}).map(([k, v]) => [k, v.last_success ?? "never"])),
    consecutiveFailures: Object.fromEntries(Object.entries(sourcesState.sources ?? {}).map(([k, v]) => [k, v.consecutive_failures ?? 0])),
    triage: { total: raw.length, unchanged: t.unchanged.length, stale: t.stale.length, passing: t.passing.length, rejected: t.rejected },
  };
  const markdown = buildDailyMarkdown(run);
  const json = buildDailyJson(run);
  const signalsFile = { schema_version: 1, agent: "development-watch", date: today, fixture: fixtures, signalType: "LOCAL_DEVELOPMENT_SIGNAL", notSearchDemand: true, signals };

  const high = json.summary.meaningfulChanges;
  log(`  devwatch:  ${high} meaningful change(s) · ${json.summary.newEvents} new · ${json.summary.materialUpdates} material updates · ${json.summary.duplicatesIgnored} duplicate/unchanged · ${json.summary.monitorOnly} monitor · ${json.summary.conflicts} conflicts · handoff ${queue.queue.length} (${queue.mode})`);

  if (!dryRun) {
    mkdirSync(paths.reports, { recursive: true });
    writeFileSync(join(paths.reports, `development-watch-${today}.md`), markdown);
    writeJson(join(paths.reports, `development-watch-${today}.json`), json);
    writeJson(join(paths.reports, "handoff-queue.json"), queue);
    writeJson(join(paths.reports, `handoff-queue-${today}.json`), queue);
    writeJson(join(paths.reports, "local-development-signals.json"), signalsFile);
    saveState(paths, { ...nextState, seen, sources: sourcesState }, today);
    log(`  devwatch:  wrote ${join(paths.reports, `development-watch-${today}.md`)}`);
  }
  return { exitCode: 0, run, markdown, json, queue, signals: signalsFile, state: { ...nextState, seen, sources: sourcesState } };
}

export async function main(argv = process.argv.slice(2), { log = console.log, repoRoot = REPO_ROOT, fetchImpl = fetch, delay } = {}) {
  const args = parseArgs(argv);
  if (args.help) {
    log(HELP);
    return { exitCode: 0 };
  }
  const mode = String(args.mode ?? "daily");
  if (!["daily", "weekly", "both"].includes(mode)) {
    log(`Unknown --mode=${mode}. Use daily, weekly or both.`);
    return { exitCode: 2 };
  }
  const today = args.today ? String(args.today) : todayPacific();
  const stateDir = resolve(repoRoot, String(args["state-dir"] ?? "."));
  log(`LVINIT Development Watch — ${mode} — ${today}${args.fixtures ? " — FIXTURES" : ""}${args["dry-run"] ? " — DRY RUN" : ""}`);
  return runDevelopmentWatch({ today, mode, fixtures: Boolean(args.fixtures), dryRun: Boolean(args["dry-run"]), stateDir, repoRoot, log, fetchImpl, delay, useGit: !args["no-git"], excerpts: !args["no-excerpts"] });
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  main().then(
    (r) => process.exit(r.exitCode),
    (error) => {
      console.error(error);
      process.exit(1);
    }
  );
}
