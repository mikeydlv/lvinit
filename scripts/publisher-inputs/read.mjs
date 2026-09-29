#!/usr/bin/env node
// ---------------------------------------------------------------------------
// PUBLISHER INPUTS — READER (read-only)
//
//   node scripts/publisher-inputs/read.mjs            fetch the state branch, assess all three
//   node scripts/publisher-inputs/read.mjs --json     machine-readable assessment
//   node scripts/publisher-inputs/read.mjs --no-fetch use the local origin/lvinit-agent-state
//   node scripts/publisher-inputs/read.mjs --today=YYYY-MM-DD
//
// Reads the three upstream handoff files from origin/lvinit-agent-state with
// `git fetch` + `git show`, and reports which are usable for prioritization
// under the freshness and exclusion rules in contract.mjs.
//
// It never writes a file, never commits, never pushes, and never downloads a
// GitHub Actions artifact. A missing or broken input is reported, not fatal:
// the exit code is 0 whenever the assessment itself ran.
// ---------------------------------------------------------------------------

import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { INPUTS, STATE_BRANCH, assessAll } from "./contract.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const [flag, ...rest] = raw.slice(2).split("=");
    args[flag] = rest.length ? rest.join("=") : true;
  }
  return args;
}

function git(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 16 * 1024 * 1024 });
}

/** Read one file from a ref. Returns { doc, error }. */
export function readFromRef(ref, path, { cwd = REPO_ROOT, show = git } = {}) {
  let text;
  try {
    text = show(["show", `${ref}:${path}`], cwd);
  } catch {
    return { doc: null, error: `not found at ${ref}:${path}` };
  }
  try {
    return { doc: JSON.parse(text), error: null };
  } catch (err) {
    return { doc: null, error: `unparseable JSON at ${ref}:${path} (${err.message})` };
  }
}

export function readAll({ ref = `origin/${STATE_BRANCH}`, cwd = REPO_ROOT, show = git } = {}) {
  const docs = {};
  const readErrors = {};
  for (const [kind, spec] of Object.entries(INPUTS)) {
    const { doc, error } = readFromRef(ref, spec.path, { cwd, show });
    docs[kind] = doc;
    if (error) readErrors[kind] = error;
  }
  return { docs, readErrors };
}

export function renderSummary(assessment) {
  const L = [`Publisher inputs — ${assessment.today}`, ""];
  for (const i of assessment.inputs) {
    const head =
      i.availability !== "available"
        ? i.availability.toUpperCase()
        : `${i.usableForPrioritization ? "USABLE" : "BACKGROUND ONLY"} · ${i.freshness ?? "no timestamp"}${i.ageDays !== null ? ` · ${i.ageDays}d old` : ""}`;
    L.push(`  ${i.kind.padEnd(9)} ${head}`);
    L.push(`            ${i.path}`);
    for (const r of i.reasons) L.push(`            - ${r}`);
    for (const n of i.notes) L.push(`            · ${n}`);
    if (i.availability === "available") {
      L.push(`            items: ${i.usableItems.length} usable, ${i.excludedItems.length} excluded${i.lowConfidenceItems.length ? `, ${i.lowConfidenceItems.length} low-confidence` : ""}`);
      for (const x of i.excludedItems) L.push(`              ${x.id}: ${x.reasons.join("; ")}`);
    }
  }
  L.push("");
  L.push(assessment.fallback ?? `Usable for prioritization: ${assessment.usable.join(", ")}`);
  L.push("Missing or stale inputs never block a run. Current repository state wins over any input.");
  return L.join("\n");
}

export function main(argv = process.argv.slice(2), { log = console.log, cwd = REPO_ROOT, show = git } = {}) {
  const args = parseArgs(argv);
  const today = typeof args.today === "string" ? args.today : new Date().toISOString().slice(0, 10);
  const ref = typeof args.ref === "string" ? args.ref : `origin/${STATE_BRANCH}`;

  let fetchError = null;
  if (!args["no-fetch"]) {
    try {
      show(["fetch", "--quiet", "origin",`${STATE_BRANCH}:refs/remotes/origin/${STATE_BRANCH}`], cwd);
    } catch (err) {
      fetchError = `git fetch failed (${String(err.message ?? err).split("\n")[0]}) — using whatever ${ref} is locally`;
    }
  }

  const { docs, readErrors } = readAll({ ref, cwd, show });
  const assessment = assessAll(docs, { today, readErrors });
  if (fetchError) assessment.fetchWarning = fetchError;

  if (args.json) log(JSON.stringify(assessment, null, 2));
  else {
    if (fetchError) log(`WARNING: ${fetchError}\n`);
    log(renderSummary(assessment));
  }
  return { exitCode: 0, assessment };
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) process.exitCode = main().exitCode;
