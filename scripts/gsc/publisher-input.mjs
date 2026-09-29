#!/usr/bin/env node
// ---------------------------------------------------------------------------
// GSC → PUBLISHER HANDOFF — builder CLI
//
//   node scripts/gsc/publisher-input.mjs --report-dir=reports/gsc \
//        --out=.agent-state/reports/gsc/publisher-input.json
//
// Reads the newest gsc-opportunities-YYYY-MM-DD.json in --report-dir (searched
// recursively, so a downloaded artifact directory works as-is), builds the
// sanitized public handoff, and writes it to --out.
//
// Exit 1 without writing when there is no report, or when the sanitizer
// refuses (a raw query would have been published). It never touches git.
// ---------------------------------------------------------------------------

import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

import { buildGscPublisherInput } from "./lib/publisher-input.mjs";

const REPORT_RE = /^gsc-opportunities-(\d{4}-\d{2}-\d{2})\.json$/;

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const [flag, ...rest] = raw.slice(2).split("=");
    args[flag] = rest.length ? rest.join("=") : true;
  }
  return args;
}

/** Newest report by REPORT DATE (not file time), searched recursively. */
export function findNewestReport(dir) {
  const found = [];
  const walk = (d) => {
    let entries;
    try {
      entries = readdirSync(d);
    } catch {
      return;
    }
    for (const name of entries) {
      const p = join(d, name);
      let st;
      try {
        st = statSync(p);
      } catch {
        continue;
      }
      if (st.isDirectory()) walk(p);
      else if (REPORT_RE.test(name)) found.push(p);
    }
  };
  walk(dir);
  found.sort((a, b) => basename(a).localeCompare(basename(b)));
  return found.at(-1) ?? null;
}

export function main(argv = process.argv.slice(2), { log = console.log, errorLog = console.error } = {}) {
  const args = parseArgs(argv);
  const reportDir = resolve(String(args["report-dir"] ?? "reports/gsc"));
  const out = args.out ? resolve(String(args.out)) : null;

  const path = findNewestReport(reportDir);
  if (!path) {
    errorLog(`No gsc-opportunities-*.json under ${reportDir}. Nothing to hand off.`);
    return { exitCode: 1 };
  }

  let doc;
  try {
    doc = buildGscPublisherInput(JSON.parse(readFileSync(path, "utf8")));
  } catch (err) {
    errorLog(`Handoff not built: ${err.message}`);
    return { exitCode: 1 };
  }

  log(`GSC publisher input from ${basename(path)}: ${doc.items.length} item(s), status ${doc.status}` +
    `, omitted ${Object.entries(doc.privacy.omitted).map(([k, v]) => `${k}=${v}`).join(" ")}` +
    `${doc.dataQuality.lowVolume ? ", LOW VOLUME (early signal)" : ""}${doc.fixture ? ", FIXTURE" : ""}`);

  if (out) {
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
    log(`Wrote ${out}`);
  }
  return { exitCode: 0, doc, source: path };
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) process.exitCode = main().exitCode;
