#!/usr/bin/env node
// ---------------------------------------------------------------------------
// LVINIT EXECUTIVE PRODUCER — WEEKLY RUNNER
//
//   node scripts/executive-producer/run.mjs                 this week's brief
//   node scripts/executive-producer/run.mjs --sample        real inputs + the in-repo sample judgment
//   node scripts/executive-producer/run.mjs --fixtures      synthetic everything (tests)
//   node scripts/executive-producer/run.mjs --shortlist     print the shortlist and offered clips, write nothing
//   node scripts/executive-producer/run.mjs --help
//
// In order:
//   1. read inputs: footage catalog + video inventory (required), published
//      pages, Local Trend Agent reports, search questions, earlier briefs
//   2. build candidates and pre-score them (rules, free)
//   3. match existing footage to each shortlisted idea
//   4. judge: Claude if ANTHROPIC_API_KEY is set, rules-only otherwise
//   5. validate in code: spouse test, clip ids, routes, every number
//   6. compute totals, ease, reuse and the new-filming decision; pick four
//   7. write the brief: email (short), production sheets (full), JSON
//
// It writes only under <state-dir>/reports/executive-producer. It never
// publishes, posts, sends, edits the site, or contacts anyone. Emailing the
// brief is a separate, later step (phase 3).
// ---------------------------------------------------------------------------

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { loadConfig } from "./config.mjs";
import { loadInputs } from "./lib/inputs.mjs";
import { buildCandidates, shortlist as makeShortlist } from "./lib/candidates.mjs";
import { matchFootage } from "./lib/footage.mjs";
import { buildSystemPrompt, buildUserMessage, callClaude, validateJudgment, estimateTokens } from "./lib/judge.mjs";
import { judgeWithRules } from "./lib/heuristic.mjs";
import { finalize, selectPicks } from "./lib/score.mjs";
import { buildEmailText, buildEmailMarkdown, buildFullMarkdown, buildJson } from "./lib/brief.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

const HELP = `
LVINIT Executive Producer

  node scripts/executive-producer/run.mjs [options]

Decides what Mikey should say on camera this week. Reads, judges, writes a
brief. Never publishes, posts, sends or edits the site.

Options
  --sample             Real inputs, judged by the in-repo sample judgment
                       (fixtures/sample-judgment.mjs). Written under samples/.
  --fixtures           Synthetic inputs and judgment. Written under fixtures/.
  --shortlist          Print the shortlist with offered clip ids. Write nothing.
  --no-llm             Rules-only judgment even if a key is set.
  --dry-run            Run everything, write nothing.
  --today=YYYY-MM-DD   The Monday this brief is for (default: today, Pacific).
  --state-dir=DIR      Root for data/ and reports/ (CI: a checkout of lvinit-agent-state).
  --gsc-dir=DIR        Where to look for Search Console reports.
  --help               This message.

Environment
  ANTHROPIC_API_KEY    Enables the Claude judgment. Without it the brief is
                       rules-only and says so at the top.
  PRODUCER_*           Overrides in scripts/executive-producer/config.mjs.
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

function summarizeInputs(inputs) {
  const t = inputs.trends;
  const rulesTrend = t.reports.length && t.reports.every((r) => r.mode === "rules");
  return [
    `Footage catalog: ${inputs.catalog?.totals?.public ?? 0} clips and stills, ${inputs.catalog?.totals?.videoMinutes ?? 0} min of video${inputs.catalogAge !== null ? `, refreshed ${inputs.catalogAge} day(s) ago` : ""}.`,
    `Published videos: ${inputs.inventory?.totals?.videos ?? 0}, with ${inputs.inventory?.totals?.shortsAlreadyCut ?? 0} Shorts already cut.`,
    `Published LVINIT pages read: ${inputs.pages.length}.`,
    `Local Trend Agent: ${t.topics.length} topic(s) from ${t.reports.length} report(s) this week${rulesTrend ? " (rules-only, so topics are weak signals)" : ""}.`,
    inputs.search.queries.length ? `Search questions: ${inputs.search.queries.length} from the ${inputs.search.reportDate} Search Console report.` : "Search questions: none with real queries yet.",
    inputs.performance ? "Performance log: present." : "Performance log: not started yet (phase 4).",
    inputs.history.length ? `Earlier briefs: ${inputs.history.length}.` : "Earlier briefs: none yet.",
  ];
}

export async function run(argv = process.argv.slice(2), { log = console.log, repoRoot = REPO_ROOT, claudeClient = null, now = new Date() } = {}) {
  const args = parseArgs(argv);
  if (args.help) {
    log(HELP);
    return { exitCode: 0 };
  }
  const config = loadConfig(args["no-llm"] ? { producer: { llm: { enabled: false } } } : {});
  const today = args.today ? String(args.today) : todayPacific(now);
  const fixtures = Boolean(args.fixtures);
  const sample = Boolean(args.sample);
  const dryRun = Boolean(args["dry-run"]);

  // 1. inputs
  let inputs;
  let sampleJudgment = null;
  if (fixtures) {
    const fx = await import(pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), "fixtures", "fixture-inputs.mjs")).href);
    inputs = fx.fixtureInputs(today);
    sampleJudgment = fx.fixtureJudgment;
  } else {
    const stateDir = resolve(repoRoot, String(args["state-dir"] ?? "."));
    inputs = loadInputs({ repoRoot, stateDir, today, gscDir: args["gsc-dir"] ? resolve(String(args["gsc-dir"])) : undefined });
    if (sample) sampleJudgment = (await import(pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), "fixtures", "sample-judgment.mjs")).href)).sampleJudgment;
  }
  if (inputs.missing?.length) {
    log(`Missing required input(s): ${inputs.missing.join(", ")}. Run the footage cataloger (npm run producer:catalog:push) first.`);
    return { exitCode: 2 };
  }

  // 2–3. candidates, shortlist, footage
  const candidates = buildCandidates({ inputs, config, today });
  const short = makeShortlist(candidates, config);
  const matches = new Map(short.map((c) => [c.id, matchFootage(c, inputs.catalog, config)]));

  if (args.shortlist) {
    for (const c of short) {
      log(`\n${c.prescore}  ${c.id}\n    ${c.title}\n    areas: ${c.areas.join(", ")} | ${c.prescoreReasons.join("; ")}`);
      for (const x of matches.get(c.id).clips) log(`      ${x.id}  ${x.path}  [${x.why}]`);
    }
    return { exitCode: 0, shortlist: short, matches };
  }

  // 4–5. judge + validate
  let mode = "rules";
  let usage = null;
  let model = null;
  const notes = [];
  let judged;
  if (sampleJudgment) {
    mode = fixtures ? "fixture" : "sample";
    judged = validateJudgment(sampleJudgment, { shortlist: short, matches });
  } else if (config.producer.llm.enabled && process.env.ANTHROPIC_API_KEY) {
    const system = buildSystemPrompt(config);
    const userMessage = buildUserMessage({ today, shortlist: short, matches, history: inputs.history, performance: inputs.performance, config });
    const est = estimateTokens(system + userMessage);
    if (est > config.producer.llm.maxInputTokensEstimate) {
      notes.push(`Prompt estimate ${est} tokens is over the ${config.producer.llm.maxInputTokensEstimate} guard; ran rules-only.`);
    } else {
      const res = await callClaude({ config, system, userMessage, client: claudeClient });
      if (res.ok) {
        mode = "live";
        usage = res.usage;
        model = res.model;
        judged = validateJudgment(res.raw, { shortlist: short, matches });
      } else {
        notes.push(`Claude judgment unavailable (${res.error}); ran rules-only.`);
      }
    }
  } else {
    notes.push(config.producer.llm.enabled ? "No ANTHROPIC_API_KEY; ran rules-only." : "--no-llm; ran rules-only.");
  }
  if (!judged) judged = { assessments: judgeWithRules(short, matches), dropped: [], notes: [] };
  notes.push(...judged.notes);

  // 6. score + pick
  const finalized = finalize(judged.assessments, matches, config);
  const byId = new Map(candidates.map((c) => [c.id, c]));
  const { picks, minutes, budgetNote, runnersUp } = selectPicks(finalized, byId, config);
  for (const p of picks) notes.push(...(p.newFilmingRequest?.needed && !p.newFilming.required ? [`${p.title}: ${p.newFilming.why}`] : []));

  // 7. write
  const sub = fixtures ? "fixtures" : sample ? "samples" : "";
  const sheetsUrl = `${config.producer.sheetsUrlBase}/${sub ? `${sub}/` : ""}${today}-brief.md`;
  const inputsSummary = summarizeInputs(inputs);
  const payload = { date: today, mode, picks, minutes, budgetNote, runnersUp, dropped: judged.dropped, notes, inputsSummary, sheetsUrl, usage, model };
  const out = {
    emailText: buildEmailText(payload),
    emailMd: buildEmailMarkdown(payload),
    fullMd: buildFullMarkdown(payload),
    json: buildJson(payload),
  };

  log(out.emailText);
  if (dryRun) return { exitCode: 0, ...out, picks };

  const stateDir = fixtures ? resolve(repoRoot, String(args["state-dir"] ?? ".")) : resolve(repoRoot, String(args["state-dir"] ?? "."));
  const dir = join(stateDir, config.state.reportsDir, sub);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${today}-brief.md`), out.fullMd);
  writeFileSync(join(dir, `${today}-email.txt`), out.emailText);
  writeFileSync(join(dir, `${today}-email.md`), out.emailMd);
  writeFileSync(join(dir, `${today}-brief.json`), JSON.stringify(out.json, null, 2) + "\n");
  if (!sub) writeFileSync(join(dir, "latest.md"), out.fullMd);
  log(`Wrote ${join(dir, `${today}-brief.md`)}`);
  return { exitCode: 0, ...out, picks, dir };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().then(
    (r) => process.exit(r.exitCode),
    (err) => {
      console.error(err?.stack ?? err);
      process.exit(1);
    },
  );
}
