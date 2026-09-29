#!/usr/bin/env node
// ---------------------------------------------------------------------------
// CONTENT BRIEFS → PUBLISHER HANDOFF — builder CLI
//
//   node scripts/content-briefs/publisher-input.mjs --report-dir=reports/content-briefs \
//        --out=.agent-state/reports/content-briefs/publisher-input.json
//
// Reads the newest content-opportunities-YYYY-MM-DD.json directly inside
// --report-dir (not recursive: fixture runs live in fixtures/ and must be
// pointed at explicitly), plus its briefs/*.json, and writes the public
// handoff to --out.
//
// Exit 1 without writing when there is no report or the builder refuses.
// It never touches git.
// ---------------------------------------------------------------------------

import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildBriefPublisherInput } from "./lib/publisher-input.mjs";

const REPORT_RE = /^content-opportunities-(\d{4}-\d{2}-\d{2})\.json$/;

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const [flag, ...rest] = raw.slice(2).split("=");
    args[flag] = rest.length ? rest.join("=") : true;
  }
  return args;
}

export function findNewestBriefReport(dir) {
  let names = [];
  try {
    names = readdirSync(dir).filter((n) => REPORT_RE.test(n)).sort();
  } catch {
    return null;
  }
  return names.length ? join(dir, names.at(-1)) : null;
}

export function readBriefFiles(dir) {
  const files = new Map();
  const briefsDir = join(dir, "briefs");
  if (!existsSync(briefsDir)) return files;
  for (const name of readdirSync(briefsDir)) {
    if (!name.endsWith(".json")) continue;
    try {
      const doc = JSON.parse(readFileSync(join(briefsDir, name), "utf8"));
      if (doc?.id) files.set(doc.id, doc);
    } catch {
      // An unreadable brief only costs that item its key questions.
    }
  }
  return files;
}

export function main(argv = process.argv.slice(2), { log = console.log, errorLog = console.error } = {}) {
  const args = parseArgs(argv);
  const reportDir = resolve(String(args["report-dir"] ?? "reports/content-briefs"));
  const out = args.out ? resolve(String(args.out)) : null;

  const path = findNewestBriefReport(reportDir);
  if (!path) {
    errorLog(`No content-opportunities-*.json in ${reportDir}. Nothing to hand off.`);
    return { exitCode: 1 };
  }

  let doc;
  try {
    const report = JSON.parse(readFileSync(path, "utf8"));
    // Only briefs from THIS report: brief ids carry the report date.
    const briefs = new Map([...readBriefFiles(reportDir)].filter(([id]) => (report.opportunities ?? []).some((o) => o.id === id)));
    doc = buildBriefPublisherInput(report, briefs);
  } catch (err) {
    errorLog(`Handoff not built: ${err.message}`);
    return { exitCode: 1 };
  }

  log(`Brief publisher input from ${path.split(/[\\/]/).at(-1)}: ${doc.items.length} item(s), status ${doc.status}` +
    `, GSC source ${doc.source.gscReportDate ?? "none"}${doc.fixture ? ", FIXTURE" : ""}`);

  if (out) {
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
    log(`Wrote ${out}`);
  }
  return { exitCode: 0, doc, source: path };
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) process.exitCode = main().exitCode;
