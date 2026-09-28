#!/usr/bin/env node
// ---------------------------------------------------------------------------
// LVINIT WEEKLY PUBLISHER — the editor-in-chief run (Sunday 8:00 PM Pacific)
//
// Answers ONE question: what should Mikey actually create and post this week?
// It reads the specialist agents' output, decides, and writes ONE file:
//
//   reports/weekly-content/<Monday>-weekly-content-plan.md   (+ LATEST.md)
//
// It is NOT the lvinit-content-publisher (which researches, builds and
// publishes approved site content), and it never posts or publishes anything.
//
//   node scripts/weekly-publisher/run.mjs                   plan the coming week (Pacific)
//   node scripts/weekly-publisher/run.mjs --week=2026-10-05 a specific week (a Monday)
//   ... --force            re-plan a week that already has a plan
//   ... --plan-json=FILE   render + deliver a plan written elsewhere (e.g. in a
//                          Claude Code session) instead of calling Claude
//   ... --dry-run          write locally only: no GitHub push, no email, no toast
//   ... --main-repo=PATH   Mikey's LVINIT checkout (output + local agent reports)
//   ... --out=DIR          output folder (default <main-repo>/reports/weekly-content)
//
// Credentials: ~/.lvinit/executive-producer/.env (ANTHROPIC_API_KEY, RESEND_*),
// the same file the Executive Producer uses. Never printed.
// ---------------------------------------------------------------------------

import { readFileSync, existsSync, rmSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

import { mondayOf, assertMonday, pacificStamp, laDate } from "./lib/week.mjs";
import { collectSignals } from "./lib/signals.mjs";
import { editWeek } from "./lib/editor.mjs";
import { validatePlan, renderPlan, renderFailure, renderLatest, startHereText, planFileName, failureFileName } from "./lib/render.mjs";
import { pushToStateBranch, writeLocal, GITHUB_WEB, NAMESPACE } from "./lib/deliver.mjs";
import { sendEmail, toast } from "../executive-producer/lib/notify.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ENV_FILE = join(homedir(), ".lvinit", "executive-producer", ".env");
const CHANNEL = "UChMtjruOgmhDJl3efLv8_wA";

export function parseArgs(argv) {
  const a = {};
  for (const r of argv) if (r.startsWith("--")) {
    const [k, ...v] = r.slice(2).split("=");
    a[k] = v.length ? v.join("=") : true;
  }
  return a;
}

/** KEY=value lines into process.env. Values are never logged. */
export function loadEnv(file, env = process.env) {
  if (!existsSync(file)) return [];
  const keys = [];
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || !m[2]) continue;
    if (!env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    keys.push(m[1]);
  }
  return keys;
}

const escHtml = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function emailBody({ ok, weekOf, startHere, localPath, webUrl, error, step }) {
  const lines = ok
    ? [`This week's LVINIT content plan is ready (week of ${weekOf}).`, "", "MONDAY MORNING — START HERE", startHere, "", `Full plan: ${webUrl}`, `On your PC: ${localPath}`, "", "Nothing was posted or published."]
    : [`The weekly content plan for the week of ${weekOf} FAILED at "${step}".`, "", `Reason: ${error}`, "", `Failure report: ${localPath}`, webUrl ? `On GitHub: ${webUrl}` : "", "", "Fix: open Claude Code in the LVINIT repo and say \"The weekly content plan failed — fix it and produce this week's plan.\""];
  const text = lines.filter((l) => l !== undefined).join("\n");
  return { text, html: `<div style="font:15px/1.5 -apple-system,Segoe UI,Arial,sans-serif;color:#111">${text.split("\n").map((l) => (l ? `<p style="margin:0 0 6px">${escHtml(l)}</p>` : "<br>")).join("")}</div>` };
}

export async function runPublisher(argv = process.argv.slice(2), services = {}) {
  const args = parseArgs(argv);
  const log = services.log ?? console.log;
  const env = services.env ?? process.env;
  loadEnv(services.envFile ?? ENV_FILE, env);
  const now = services.now ?? new Date();
  const weekOf = args.week ? assertMonday(String(args.week)) : mondayOf(now);
  const mainRepo = resolve(String(args["main-repo"] ?? REPO));
  const outDir = resolve(String(args.out ?? join(mainRepo, "reports", "weekly-content")));
  const dry = Boolean(args["dry-run"]);
  const generatedAt = pacificStamp(now);
  const planName = planFileName(weekOf);
  const failName = failureFileName(weekOf);
  const record = { weekOf, startedAt: now.toISOString(), mode: args["plan-json"] ? "plan-json" : "claude", usd: 0, steps: [] };
  let step = "startup";
  let pipeline = [];

  if (existsSync(join(outDir, planName)) && !args.force) {
    log(`Week of ${weekOf} already has a plan (${join(outDir, planName)}). Nothing to do. Use --force to re-plan.`);
    return { exitCode: 0, skipped: true, weekOf };
  }

  const deliver = async ({ ok, files, subject, startHere, localName, error }) => {
    step = "deliver";
    writeLocal(outDir, files);
    if (ok) rmSync(join(outDir, failName), { force: true });
    const localPath = join(outDir, localName);
    const webUrl = `${GITHUB_WEB}/${localName}`;
    let push = { pushed: false, reason: "dry run" };
    if (!dry) {
      try {
        push = (services.push ?? pushToStateBranch)({
          repo: services.repo ?? REPO,
          files: Object.entries(files).map(([name, content]) => ({ rel: `reports/${NAMESPACE}/${name}`, content })),
          message: `weekly-publisher: ${ok ? "plan" : "FAILED"} for the week of ${weekOf}`,
          log,
        });
      } catch (e) {
        push = { pushed: false, reason: String(e.message).split("\n")[0] };
      }
    }
    let email = { sent: false, reason: "dry run" };
    let desk = { shown: false };
    if (!dry) {
      const body = emailBody({ ok, weekOf, startHere, localPath, webUrl: push.pushed || push.reason === "no changes" ? webUrl : null, error, step: record.failedStep });
      email = await (services.sendEmail ?? sendEmail)({ subject, ...body }, { env }).catch((e) => ({ sent: false, reason: String(e.message) }));
      desk = await (services.toast ?? toast)(subject, ok ? "Open reports\\weekly-content\\LATEST.md in the LVINIT repo." : String(error).slice(0, 150));
    }
    return { localPath, webUrl, push, email, toast: desk };
  };

  try {
    let plan;
    if (args["plan-json"]) {
      step = "load plan";
      plan = JSON.parse(readFileSync(resolve(String(args["plan-json"])), "utf8"));
      const problems = validatePlan(plan, weekOf);
      if (problems.length) throw new Error(`The supplied plan is incomplete: ${problems.slice(0, 6).join("; ")}`);
      pipeline = plan.pipeline ?? [];
    } else {
      // The Executive Producer starts at 7 PM; if it is still producing this
      // week's posts, wait for it (up to --wait-producer minutes, default 60)
      // so the plan is built on the finished batch.
      step = "wait for Executive Producer";
      const weeklyPosts = String(args["weekly-posts"] ?? join(homedir(), "OneDrive", "Documents", "LVINIT", "Weekly Posts"));
      const lock = join(weeklyPosts, `Week of ${weekOf}`, ".run.lock");
      const waitUntil = Date.now() + Number(args["wait-producer"] ?? 60) * 60_000;
      while (existsSync(lock) && Date.now() < waitUntil) {
        log("Executive Producer is still running for this week; waiting 2 minutes.");
        await (services.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms))))(120_000);
      }

      step = "collect signals";
      const signals = await (services.collectSignals ?? collectSignals)({
        repo: services.repo ?? REPO,
        mainRepo,
        weekOf,
        weeklyPostsRoot: weeklyPosts,
        producerLog: join(homedir(), ".lvinit", "executive-producer", "weekly.log"),
        channelId: CHANNEL,
        log,
      });
      pipeline = signals.map((s) => ({ name: s.name, ok: s.ok, summary: s.summary }));
      record.steps.push({ step, signals: pipeline });
      step = "editor (Claude)";
      if (!env.ANTHROPIC_API_KEY && !services.anthropic) throw new Error(`ANTHROPIC_API_KEY is not set (expected in ${ENV_FILE}).`);
      const r = await (services.editWeek ?? editWeek)({ weekOf, signals, now: `${laDate(now)} (${generatedAt})`, anthropic: services.anthropic, maxSearches: Number(args.searches ?? 6) });
      record.usd += r.usd ?? 0;
      plan = r.plan;
    }

    step = "render";
    const md = renderPlan(plan, { weekOf, generatedAt, mode: args["plan-json"] ? String(args.mode ?? "prepared plan") : "automatic", pipeline });
    const startHere = startHereText(plan);
    const latest = renderLatest({ weekOf, fileName: planName, ok: true, generatedAt, startHere });
    const d = await deliver({ ok: true, files: { [planName]: md, "LATEST.md": latest }, subject: `LVINIT: this week's content plan is ready (week of ${weekOf})`, startHere, localName: planName });
    record.delivery = d;
    record.finishedAt = new Date().toISOString();
    writeLocal(join(outDir, ".runs"), { [`${weekOf}-run.json`]: JSON.stringify(record, null, 2) });
    log(`SUCCESS: weekly content plan created for the week of ${weekOf}: ${d.localPath}`);
    log(`GitHub: ${d.push.pushed ? d.webUrl : `not pushed (${d.push.reason})`}. Email: ${d.email.sent ? "sent" : d.email.reason}.`);
    return { exitCode: 0, weekOf, path: d.localPath, delivery: d };
  } catch (e) {
    const error = String(e?.message ?? e);
    record.failedStep = step;
    record.error = error;
    record.usd += e?.usd ?? 0;
    const failMd = renderFailure({ weekOf, generatedAt, step, error, pipeline, logPath: join(homedir(), ".lvinit", "weekly-publisher", "weekly-publisher.log") });
    let d = null;
    try {
      d = await deliver({
        ok: false,
        files: { [failName]: failMd, "LATEST.md": renderLatest({ weekOf, fileName: failName, ok: false, generatedAt }) },
        subject: `LVINIT: weekly content plan FAILED (week of ${weekOf})`,
        localName: failName,
        error,
      });
    } catch (x) {
      log(`Could not even write the failure report: ${x.message}`);
    }
    record.delivery = d;
    try {
      writeLocal(join(outDir, ".runs"), { [`${weekOf}-run.json`]: JSON.stringify(record, null, 2) });
    } catch {
      /* the wrapper script reports this case */
    }
    log(`FAILURE at ${step}: ${error}`);
    return { exitCode: 1, weekOf, error, step };
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runPublisher().then((r) => {
    process.exitCode = r.exitCode;
  });
}
