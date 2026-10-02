#!/usr/bin/env node
// ---------------------------------------------------------------------------
// LVINIT SITE QUALITY AGENT — runner
//
//   audit -> detect -> classify severity -> plan safe fixes -> (trial|apply)
//   -> validate -> re-audit -> report
//
// Default is an audit: read the build output and the repository, write a
// Markdown + JSON report, change nothing. See docs/SITE_QUALITY_AGENT.md.
// ---------------------------------------------------------------------------

import { mkdirSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

import { loadConfig } from "./config.mjs";
import { buildInventory } from "./lib/inventory.mjs";
import { analyze, validationInstances } from "./lib/audit.mjs";
import { readPreviousReports, buildHistory } from "./lib/history.mjs";
import { readLedger, updateLedger, LEDGER_FILE, LEDGER_STATE_PATH } from "./lib/ledger.mjs";
import { countBySeverity, scoreHealth } from "./lib/findings.mjs";
import { executeFixes, runBuild, preflight, settleGates } from "./lib/execute.mjs";
import { buildMarkdownReport, buildJsonReport } from "./lib/report.mjs";
import { loadGscSignal } from "../internal-links/lib/signals.mjs";
import { runCommand, tailOutput } from "../internal-links/lib/verify.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..", "..");

const HELP = `LVINIT Site Quality Agent

  node scripts/site-quality/run.mjs [flags]

Modes (default: audit only, nothing edited)
  --build            run a fresh production build first, so rendered checks are current
  --validate         also run TypeScript and ESLint and report failures as findings
  --trial            apply every safe fix, validate, re-audit, then ALWAYS revert
  --apply            apply, validate, commit and push (refused unless SITE_QUALITY_AUTO_FIX=true)
  --fixtures         audit the synthetic fixture site instead of LVINIT

Options
  --no-gsc           ignore the GSC report entirely
  --no-push          (apply) commit locally, do not push
  --no-commit        (apply) leave validated edits uncommitted
  --no-rebuild       (trial) do not rebuild after reverting
  --max-fixes=N      auto-fix limit per run (default 5)
  --today=YYYY-MM-DD pretend it is a different date
  --out=DIR          write reports somewhere else
  --state-dir=DIR    a checkout of lvinit-agent-state; data/site-quality/ledger.json there is the durable history
  --help
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

export function overridesFromArgs(args) {
  const o = { gsc: {}, autoFix: {}, git: {}, output: {} };
  if (args["no-gsc"]) o.gsc.enabled = false;
  if (args["no-push"]) o.git.push = false;
  if (args["no-commit"]) o.git.commit = false;
  if (args["max-fixes"]) o.autoFix.maxFixesPerRun = Number.parseInt(args["max-fixes"], 10);
  if (args.out) o.output.dir = String(args.out);
  return o;
}

export function formatISODate(date) {
  return date.toISOString().slice(0, 10);
}

function buildStatusLine({ inv, buildResult, validation }) {
  const parts = [];
  if (buildResult) parts.push(buildResult.ok ? "production build passed this run" : "PRODUCTION BUILD FAILED this run");
  else if (!inv.build.present) parts.push("no build output — rendered checks skipped");
  else parts.push(inv.build.fresh ? `existing build (${inv.build.builtAt}), current with source` : "existing build is STALE — rerun with --build");
  for (const v of validation) if (v.key !== "build") parts.push(`${v.label} ${v.ok ? "passed" : "FAILED"}`);
  return parts.join("; ");
}

/**
 * Run the agent. Returns the report object (also written to disk).
 */
export async function run(argv = process.argv.slice(2), { log = console.log, repoRoot: rootOverride = null } = {}) {
  const args = parseArgs(argv);
  if (args.help) {
    log(HELP);
    return null;
  }
  const config = loadConfig(overridesFromArgs(args));
  const today = typeof args.today === "string" ? args.today : formatISODate(new Date());
  const fixtures = Boolean(args.fixtures);
  let repoRoot = rootOverride ?? REPO_ROOT;
  let fixtureDir = null;
  let mode = args.apply ? "apply" : args.trial ? "trial" : "report";

  if (fixtures) {
    const { writeFixtureSite } = await import("./fixtures/fixture-site.mjs");
    fixtureDir = mkdtempSync(join(tmpdir(), "lvinit-site-quality-fixture-"));
    writeFixtureSite(fixtureDir);
    repoRoot = fixtureDir;
    config.gsc.enabled = false;
    if (mode !== "report") {
      log("Fixture run: --trial / --apply are ignored; there is nothing real to edit.");
      mode = "report";
    }
  }

  log(`LVINIT Site Quality Agent — ${today} — mode: ${mode}${fixtures ? " (FIXTURE SITE)" : ""}`);

  // Apply mode: git preflight BEFORE the audit, so a fast-forward is audited.
  let preflightState = null;
  if (mode === "apply") {
    if (!config.autoFix.enabled) {
      log("Auto-fix is disabled (SITE_QUALITY_AUTO_FIX is not true). Running as an audit; nothing will be edited.");
    } else {
      preflightState = preflight({ repoRoot, config });
      log(preflightState.ok ? "Git preflight passed." : `Git preflight refused: ${preflightState.reason}`);
    }
  }

  const validation = [];
  let buildResult = null;
  if (args.build && !fixtures) {
    buildResult = runBuild({ repoRoot, config, log });
    validation.push({ key: "build", label: "Production build", command: buildResult.command, ok: buildResult.ok, code: buildResult.code, tail: buildResult.ok ? "" : tailOutput(buildResult.output) });
  }
  if (args.validate && !fixtures) {
    for (const c of config.validation.commands.filter((x) => x.key === "typecheck" || x.key === "lint")) {
      log(`  Running ${c.label} ...`);
      const r = runCommand(c, { cwd: repoRoot, timeoutMs: config.validation.timeoutMs });
      log(`    ${r.ok ? "passed" : `FAILED (exit ${r.code})`}`);
      validation.push({ key: c.key, label: c.label, command: r.command, ok: r.ok, code: r.code, tail: r.ok ? "" : tailOutput(r.output) });
    }
  }

  const outDir = fixtures ? resolve(REPO_ROOT, config.output.dir, "fixtures") : resolve(repoRoot, config.output.dir);
  const previous = fixtures
    ? []
    : readPreviousReports([resolve(repoRoot, config.output.dir), resolve(repoRoot, config.output.historyDir)], {
        limit: config.output.historyLookback,
        excludeDate: today,
      });
  // The durable ledger: from the state-branch checkout when given, otherwise the
  // copy the last local run left beside its reports.
  const ledgerPath = fixtures
    ? null
    : typeof args["state-dir"] === "string"
      ? resolve(String(args["state-dir"]), LEDGER_STATE_PATH)
      : join(outDir, LEDGER_FILE);
  const ledger = readLedger(ledgerPath);
  const history = buildHistory(previous, { ledger, reportDate: today });
  const gscSignal = config.gsc.enabled
    ? loadGscSignal({ repoRoot, config, today })
    : { available: false, reason: "GSC prioritization is switched off for this run (--no-gsc)", multiplierFor: () => ({ value: 1, impressions: null, clicks: null }) };

  const audit = async () => {
    const inv = await buildInventory({ repoRoot, config });
    return { inv, ...analyze({ inv, config, today, gscSignal, history, extraInstances: validationInstances(validation) }) };
  };

  log("Auditing...");
  const result = await audit();
  const { inv } = result;
  log(`  ${result.stats.pagesAudited} pages, ${result.stats.sitemapEntries} sitemap entries, ${result.stats.linksChecked} links, ${result.stats.imagesChecked} images.`);
  log(`  ${result.findings.length} finding(s): ${Object.entries(result.counts).map(([k, v]) => `${v} ${k}`).join(", ")}.`);
  log(`  ${result.fixPlan.planned.length} auto-fix candidate(s).`);

  let execution = null;
  if (mode === "trial" || (mode === "apply" && config.autoFix.enabled)) {
    log(`${mode === "trial" ? "Trial" : "Applying"} ${result.fixPlan.planned.length} fix(es)...`);
    execution = await executeFixes({
      repoRoot,
      config,
      planned: result.fixPlan.planned,
      findings: result.findings,
      mode,
      reportDate: today,
      preflightState,
      log,
      runAudit: async () => {
        const inv2 = await buildInventory({ repoRoot, config });
        return analyze({ inv: inv2, config, today, gscSignal, history });
      },
    });
    settleGates(result.fixPlan.planned, execution);
    log(`  ${execution.stoppedBecause ? `Stopped: ${execution.stoppedBecause}` : mode === "trial" ? "Trial passed; every edit was reverted." : "Shipped."}`);
    if (mode === "apply" && execution.pushed) {
      for (const f of result.fixPlan.planned) {
        f.status = "AUTO_FIXED";
        f.autoFixCommit = execution.commitHash ?? null;
      }
      // A fixed issue no longer counts against the site.
      result.counts = countBySeverity(result.findings);
      result.health = scoreHealth(result.findings, result.health.pages.map((p) => p.route), config);
    }
    if (mode === "trial" && execution.applied && !args["no-rebuild"]) {
      log("Rebuilding so .next matches the reverted tree...");
      runBuild({ repoRoot, config, log });
    }
  }

  const publisherHandoffs = result.findings
    .filter((f) => f.publisherHandoff && f.disposition === "REVIEW_REQUIRED" && f.status !== "IGNORED")
    .map((f) => ({ id: f.id, fingerprint: f.fingerprint, severity: f.severity, route: f.publisherHandoff.route ?? f.route, need: f.publisherHandoff.need, dispatched: false }));

  const report = {
    reportDate: today,
    generatedAt: new Date().toISOString(),
    mode,
    fixtureData: fixtures,
    findings: result.findings,
    resolved: result.resolved,
    system: result.system,
    stats: result.stats,
    health: result.health,
    validation,
    execution,
    publisherHandoffs,
    gsc: {
      available: gscSignal.available,
      reason: gscSignal.reason,
      reportDate: gscSignal.reportDate ?? null,
      note: "GSC only reorders findings of the same severity and flags search-visible pages; it never decides whether something is broken, and absence from GSC is neutral.",
    },
    summary: {
      pagesAudited: result.stats.pagesAudited,
      routesChecked: result.stats.routes,
      sitemapEntries: result.stats.sitemapEntries,
      metadataChecks: result.stats.metadataChecks,
      schemaChecks: result.stats.schemaBlocks,
      imagesChecked: result.stats.imagesChecked,
      imageSourceLiterals: result.stats.imageSourceLiterals,
      linksChecked: result.stats.linksChecked,
      counts: result.counts,
      autoFixed: result.findings.filter((f) => f.status === "AUTO_FIXED").length,
      autoFixCandidates: result.findings.filter((f) => f.disposition === "AUTO_FIX_CANDIDATE" && f.status !== "AUTO_FIXED").length,
      reviewRequired: result.findings.filter((f) => f.disposition === "REVIEW_REQUIRED").length,
      resolved: result.resolved.length,
      ignored: result.findings.filter((f) => f.status === "IGNORED").length,
      siteHealth: result.health.site,
      buildStatus: buildStatusLine({ inv, buildResult, validation }),
      historyReports: history.reports,
      ledger: history.ledger ? "read" : "none yet",
    },
  };

  mkdirSync(outDir, { recursive: true });
  const base = join(outDir, `site-quality-${today}`);
  writeFileSync(`${base}.md`, buildMarkdownReport(report, config), "utf8");
  const json = buildJsonReport(report);
  writeFileSync(`${base}.json`, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  log(`Reports: ${base}.md / .json`);
  let ledgerOut = null;
  if (!fixtures) {
    // The updated ledger rides along with the reports; the workflow's
    // publish-state job commits it to lvinit-agent-state.
    ledgerOut = join(outDir, LEDGER_FILE);
    writeFileSync(ledgerOut, `${JSON.stringify(updateLedger(ledger, json), null, 2)}\n`, "utf8");
    log(`Ledger: ${ledgerOut} (${ledger ? "updated" : "started"})`);
  }
  if (fixtureDir) rmSync(fixtureDir, { recursive: true, force: true });
  report.paths = { markdown: `${base}.md`, json: `${base}.json`, ledger: ledgerOut };
  return report;
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
