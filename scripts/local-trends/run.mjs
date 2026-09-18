#!/usr/bin/env node
// ---------------------------------------------------------------------------
// LVINIT LOCAL TREND AGENT — RUNNER
//
//   node scripts/local-trends/run.mjs                     daily report
//   node scripts/local-trends/run.mjs --mode=weekly       weekly summary only
//   node scripts/local-trends/run.mjs --mode=both         daily, then weekly
//   node scripts/local-trends/run.mjs --fixtures          synthetic stories, no network
//   node scripts/local-trends/run.mjs --help
//
// Daily, in order:
//   1. resolve config and read state (watchlist + reviewed-story memory)
//   2. collect targeted RSS/Atom feeds and Google News searches
//   3. normalize, dedupe, drop stories already reviewed, filter noise
//   4. fetch short article excerpts for the short list
//   5. read what LVINIT already has (pages + videos)
//   6. judge — Claude if ANTHROPIC_API_KEY is set, rules-only otherwise
//   7. validate in code: statuses re-proven, totals/priorities computed
//   8. merge into the watchlist, decide what resurfaces
//   9. write the report (Markdown + JSON) and the updated state
//
// It is a DISCOVERY + PRIORITIZATION agent. It writes only under
// <state-dir>/reports/social-trends and <state-dir>/data/social-trends. It
// never publishes, posts, edits the site, contacts anyone, or commits — the
// workflow commits its state to the lvinit-agent-state branch, never main.
// ---------------------------------------------------------------------------

import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig } from "./config.mjs";
import { collect, fetchExcerpt } from "./lib/feeds.mjs";
import { normalizeItems, dedupe, triage } from "./lib/classify.mjs";
import { buildInventory } from "./lib/inventory.mjs";
import { SYSTEM_PROMPT, buildUserMessage, callClaude, validateJudgment, estimateTokens } from "./lib/judge.mjs";
import { judgeWithRules } from "./lib/heuristic.mjs";
import { prioritize } from "./lib/score.mjs";
import { loadWatchlist, loadReviewed, mergeTopics, updateReviewed, writeJson } from "./lib/state.mjs";
import { buildDailyMarkdown, buildWeeklyMarkdown } from "./lib/report.mjs";
import { fixtureItems, fixtureHealth, fixtureJudgment } from "./fixtures/fixture-feed.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

const HELP = `
LVINIT Local Trend Agent

  node scripts/local-trends/run.mjs [options]

Discovery and prioritization only. Reads public feeds, writes a trend report
and its own state. Never publishes, posts, edits the site, or contacts anyone.

Options
  --mode=daily|weekly|both   What to generate (default daily).
  --fixtures                 Synthetic stories and a canned judgment — no
                             network, no API key. Writes to
                             reports/social-trends/fixtures/ only.
  --no-llm                   Rules-only judgment even if a key is set.
  --no-excerpts              Do not fetch article pages for the short list.
  --dry-run                  Run everything, write nothing.
  --today=YYYY-MM-DD         Pretend today is this date.
  --state-dir=DIR            Root for reports/ and data/ (default: repo root;
                             CI passes a checkout of lvinit-agent-state).
  --max-candidates=N         Judgment budget (default 30).
  --help                     This message.

Environment
  ANTHROPIC_API_KEY          Enables Claude judgment. Without it the agent
                             runs rules-only and says so on the report.
  TRENDS_*                   Every threshold in scripts/local-trends/config.mjs
                             has an override named beside it.
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

/** Today's date in Las Vegas, not UTC — a 6:30 AM run belongs to that day. */
export function todayPacific(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function paths(stateDir, fixtures) {
  const reports = join(stateDir, "reports", "social-trends");
  if (fixtures) {
    const base = join(reports, "fixtures");
    return { reports: base, data: join(base, "data") };
  }
  return { reports, data: join(stateDir, "data", "social-trends") };
}

export async function run(argv = process.argv.slice(2), { log = console.log, repoRoot = REPO_ROOT, fetchImpl = fetch, claudeClient = null, delay } = {}) {
  const args = parseArgs(argv);
  if (args.help) {
    log(HELP);
    return { exitCode: 0 };
  }
  const overrides = { selection: {}, llm: {}, sources: {} };
  if (args["max-candidates"] !== undefined) overrides.selection.maxCandidates = Number.parseInt(args["max-candidates"], 10);
  if (args["no-llm"]) overrides.llm.enabled = false;
  if (args["no-excerpts"]) overrides.sources.fetchExcerpts = false;
  const config = loadConfig(overrides);

  const fixtures = Boolean(args.fixtures);
  const dryRun = Boolean(args["dry-run"]);
  const today = args.today ? String(args.today) : todayPacific();
  const mode = String(args.mode ?? "daily");
  if (!["daily", "weekly", "both"].includes(mode)) {
    log(`Unknown --mode=${mode}. Use daily, weekly or both.`);
    return { exitCode: 2 };
  }
  const stateDir = resolve(repoRoot, String(args["state-dir"] ?? config.state.dir));
  const dirs = paths(stateDir, fixtures);

  log(`LVINIT Local Trend Agent — ${mode} — ${today}${fixtures ? " — FIXTURES" : ""}${dryRun ? " — DRY RUN" : ""}`);
  log(`  state:     ${stateDir}`);

  let exitCode = 0;
  let daily = null;
  if (mode === "daily" || mode === "both") {
    daily = await runDaily({ config, today, fixtures, dryRun, dirs, repoRoot, log, fetchImpl, claudeClient, delay });
    exitCode = daily.exitCode;
  }
  if (mode === "weekly" || mode === "both") {
    const weekly = runWeekly({ today, dirs, dryRun, log });
    exitCode = Math.max(exitCode, weekly.exitCode);
  }
  return { exitCode, daily };
}

async function runDaily({ config, today, fixtures, dryRun, dirs, repoRoot, log, fetchImpl, claudeClient, delay }) {
  const watchlistFile = join(dirs.data, "watchlist.json");
  const reviewedFile = join(dirs.data, "reviewed.json");
  const watchlist = loadWatchlist(watchlistFile);
  const reviewed = loadReviewed(reviewedFile);
  log(`  watchlist: ${watchlist.projects.length} projects · memory: ${Object.keys(reviewed.items).length} reviewed stories`);

  // 2. collect
  let raw;
  let health;
  if (fixtures) {
    raw = fixtureItems(today);
    health = fixtureHealth();
  } else {
    ({ items: raw, health } = await collect(config, { fetchImpl, log, ...(delay ? { delay } : {}) }));
  }
  const sourcesOk = health.filter((h) => h.ok).length;
  if (!raw.length) {
    log("  Every source failed or returned nothing. No report written — this run is a failure, not a quiet day.");
    for (const h of health) log(`    ${h.id}: ${h.error ?? h.status}`);
    return { exitCode: 1 };
  }

  // 3. normalize, dedupe, triage
  const normalized = normalizeItems(raw);
  const { kept, duplicates } = dedupe(normalized, { similarity: config.selection.duplicateTitleSimilarity });
  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) || Boolean(claudeClient);
  const modelAvailable = config.llm.enabled && (hasKey || fixtures);
  const t = triage(kept, config, { today, reviewed, watchlist, modelAvailable });
  log(`  collected: ${raw.length} items → ${kept.length} distinct → ${t.candidates.length} candidates, ${t.signals.length} signals, ${t.filtered.length} filtered, ${t.alreadyReviewed.length} already reviewed`);

  // 4. excerpts — direct publisher URLs only
  if (config.sources.fetchExcerpts && !fixtures) {
    let fetched = 0;
    for (const c of t.candidates) {
      if (fetched >= config.sources.maxExcerptFetches) break;
      if (c.via === "google-news" || c.tier === "social") continue;
      const ex = await fetchExcerpt(c.url, config, { fetchImpl });
      fetched += 1;
      if (ex.ok) {
        c.excerpt = ex.text;
        if (!c.published && ex.published) c.published = ex.published;
      }
    }
    log(`  excerpts:  ${t.candidates.filter((c) => c.excerpt).length}/${fetched} article pages read`);
  }

  // 5. inventory
  const inventory = buildInventory({ repoRoot, today });
  log(`  site:      ${inventory.totals.pages} published pages, ${inventory.totals.videos} videos`);

  // 6. judge
  let judgment;
  let judgeMode = "rules";
  let modeReason = "";
  let usage = null;
  let model = null;
  const ctx = { candidates: t.candidates, signals: t.signals, inventory, watchlist };

  if (!t.candidates.length && !t.signals.length) {
    judgment = { topics: [], rejected: [], unassessed: [], warnings: [] };
    judgeMode = "claude";
    modeReason = "nothing new to judge";
  } else if (fixtures && config.llm.enabled) {
    judgment = validateJudgment(fixtureJudgment(ctx), ctx);
    judgeMode = "claude";
    model = "fixture (canned response)";
  } else if (!config.llm.enabled) {
    modeReason = "model judgment switched off (--no-llm / TRENDS_LLM=false)";
  } else if (!hasKey) {
    modeReason = "no ANTHROPIC_API_KEY is configured";
  } else {
    const userMessage = buildUserMessage({ today, ...ctx });
    const estimate = estimateTokens(SYSTEM_PROMPT) + estimateTokens(userMessage);
    if (estimate > config.llm.maxInputTokensEstimate) {
      modeReason = `prompt estimate ${estimate} tokens exceeds the ${config.llm.maxInputTokensEstimate} cap`;
    } else {
      log(`  judging:   ${t.candidates.length} candidates with ${config.llm.model} (~${estimate} input tokens)`);
      const res = await callClaude({ config, userMessage, client: claudeClient });
      if (res.ok) {
        judgment = validateJudgment(res.raw, ctx);
        judgeMode = "claude";
        usage = res.usage;
        model = res.model ?? config.llm.model;
      } else {
        modeReason = `the model call failed — ${res.error}`;
        usage = res.usage ?? null;
      }
    }
  }
  if (!judgment) {
    log(`  RULES-ONLY: ${modeReason}`);
    judgment = judgeWithRules({ ...ctx, config });
  }
  const rulesOnly = judgeMode === "rules";

  // 7. score
  const scored = judgment.topics.map((topic) => ({ ...topic, ...prioritize(topic, config, { rulesOnly }) }));

  // 8. merge
  const merged = mergeTopics(watchlist, scored, { today, config });
  const topics = merged.topics;
  const quiet = topics.filter((x) => !x.surface && x.isExisting && x.priority !== "IGNORE");

  // Memory: every story decided today, so it is never analyzed twice.
  const outcomeById = new Map();
  // Rules-judged stories are tagged "rules:" so a later run with a model re-judges them.
  const tag = rulesOnly ? "rules:" : "";
  for (const topic of topics) for (const s of topic.sources) outcomeById.set(s.id, `${tag}topic:${topic.key}`);
  for (const r of judgment.rejected) outcomeById.set(r.id, `rejected:${r.reason}`);
  const entries = [
    ...t.candidates.filter((c) => outcomeById.has(c.id)).map((c) => ({ ...c, outcome: outcomeById.get(c.id) })),
    ...t.filtered.map((f) => ({ ...f, outcome: `filtered:${f.reason}` })),
    ...t.signals.map((s) => ({ ...s, outcome: "signal" })),
    ...duplicates.map((d) => ({ ...d, outcome: "duplicate of another outlet's story" })),
  ];
  const nextReviewed = updateReviewed(reviewed, entries, { today, retentionDays: config.state.reviewedRetentionDays });

  const run = {
    today,
    fixture: fixtures,
    mode: judgeMode,
    modeReason,
    model,
    topics,
    rejected: judgment.rejected,
    filtered: t.filtered,
    quiet,
    health,
    warnings: judgment.warnings,
    usage,
    counts: {
      read: raw.length,
      sourcesOk,
      fresh: t.candidates.length + t.deferred.length + t.filtered.length + t.signals.length,
      judged: t.candidates.length,
      alreadyReviewed: t.alreadyReviewed.length,
      deferred: t.deferred.length,
    },
  };

  const markdown = buildDailyMarkdown(run);
  const summary = {
    schema_version: 1,
    agent: "local-trends",
    date: today,
    fixture: fixtures,
    mode: judgeMode,
    modeReason,
    model,
    counts: run.counts,
    usage,
    health,
    topics: topics.map(({ statusNote, ...x }) => ({ ...x, statusNote: statusNote ?? null })),
    rejected: judgment.rejected,
    filtered: t.filtered.map((f) => ({ title: f.title, url: f.url, reason: f.reason, sourceName: f.sourceName })),
    warnings: judgment.warnings,
  };

  const surfaced = topics.filter((x) => x.surface);
  const count = (p) => surfaced.filter((x) => x.priority === p).length;
  log(`  result:    ${count("P1")} CREATE NOW · ${count("P2")} strong · ${count("P3")} watch · ${judgment.rejected.length} rejected · ${quiet.length} quiet re-checks (${rulesOnly ? "rules-only" : "Claude"})`);
  if (usage) log(`  usage:     ${usage.input_tokens ?? 0} in (${usage.cache_read_input_tokens ?? 0} cached) · ${usage.output_tokens ?? 0} out`);
  for (const w of judgment.warnings) log(`  note:      ${w}`);

  if (!dryRun) {
    mkdirSync(dirs.reports, { recursive: true });
    const mdFile = join(dirs.reports, `${today}-local-trends.md`);
    writeFileSync(mdFile, markdown);
    writeJson(join(dirs.reports, `${today}-local-trends.json`), summary);
    writeJson(watchlistFile, merged.watchlist);
    writeJson(reviewedFile, nextReviewed);
    log(`  wrote:     ${mdFile}`);
  }
  return { exitCode: 0, run, markdown, summary, watchlist: merged.watchlist, reviewed: nextReviewed };
}

function runWeekly({ today, dirs, dryRun, log }) {
  const start = new Date(Date.parse(`${today}T12:00:00Z`) - 6 * 86_400_000).toISOString().slice(0, 10);
  const dailies = existsSync(dirs.reports)
    ? readdirSync(dirs.reports)
        .filter((f) => /^\d{4}-\d{2}-\d{2}-local-trends\.json$/.test(f))
        .map((f) => f.slice(0, 10))
        .filter((d) => d >= start && d <= today)
        .map((d) => JSON.parse(readFileSync(join(dirs.reports, `${d}-local-trends.json`), "utf8")))
    : [];
  const watchlist = loadWatchlist(join(dirs.data, "watchlist.json"));
  const markdown = buildWeeklyMarkdown({ today, dailies, watchlist });
  log(`  weekly:    ${dailies.length} daily report(s) from ${start} to ${today}`);
  if (!dryRun) {
    mkdirSync(join(dirs.reports, "weekly"), { recursive: true });
    writeFileSync(join(dirs.reports, "weekly.md"), markdown);
    writeFileSync(join(dirs.reports, "weekly", `${today}-weekly.md`), markdown);
    log(`  wrote:     ${join(dirs.reports, "weekly.md")}`);
  }
  return { exitCode: 0, markdown };
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  run().then(
    (r) => process.exit(r.exitCode),
    (error) => {
      console.error(error);
      process.exit(1);
    }
  );
}
