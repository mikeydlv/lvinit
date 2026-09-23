#!/usr/bin/env node
// ---------------------------------------------------------------------------
// LVINIT INTERNAL LINKING AGENT — RUNNER
//
//   node scripts/internal-links/run.mjs                 report only, writes nothing to the site
//   node scripts/internal-links/run.mjs --apply         edit, validate, commit and push safe links
//   node scripts/internal-links/run.mjs --apply --no-push    edit and commit, leave the push to you
//   node scripts/internal-links/run.mjs --apply --no-commit  edit only, leave the diff in the tree
//   node scripts/internal-links/run.mjs --trial         edit, validate, then ALWAYS revert (proves a dry run builds)
//   node scripts/internal-links/run.mjs --fixtures      synthetic site, no repository scan
//   node scripts/internal-links/run.mjs --today=2026-12-01
//   node scripts/internal-links/run.mjs --help
//
// What it does, in order:
//   1. resolve config (defaults -> env -> CLI flags)
//   2. git preflight: right branch, clean tree, remote fetched, no divergence
//   3. build the internal link graph from app/**/page.tsx
//   4. load the optional GSC signal (ordering only), Fact-Decay signal
//      (destination eligibility) and Content Brief signal (cluster context,
//      ordering, live-handoff conflict avoidance), all read-only
//   5. read earlier internal-link reports (local + CI history), so findings
//      keep their identity and a link a person removed is never re-added
//   6. find, score and gate every candidate link
//   7. --apply only: edit, re-check each edit, run typecheck + lint + build
//   8. --apply only: inspect the diff, commit, re-check the remote, push
//      (if the remote moved without touching our files: clean rebase,
//      re-validate, re-inspect, then push — otherwise stop)
//      --trial instead: inspect the diff, then revert every edit
//   9. write reports/internal-links/internal-links-YYYY-MM-DD.{md,json}
//  10. print a short summary
//
// If ANY step in 7 or 8 fails, every edit is reverted and nothing ships. The
// report is still written, so a failed run explains itself.
// ---------------------------------------------------------------------------

import { mkdirSync, writeFileSync, readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig } from "./config.mjs";
import { analyze } from "./lib/analyze.mjs";
import { loadGscSignal, loadFactDecaySignal, loadBriefSignal } from "./lib/signals.mjs";
import { applyEdits, restore } from "./lib/apply.mjs";
import { runValidation } from "./lib/verify.mjs";
import {
  preflight,
  inspectDiff,
  commitMessage,
  commit,
  push,
  undoCommit,
  discardChanges,
  rebaseOntoRemote,
  dropOwnCommit,
  pathsAreClean,
} from "./lib/git.mjs";
import { LIFECYCLE } from "./lib/opportunities.mjs";
import { buildMarkdownReport, buildJsonReport, summaryLines } from "./lib/report.mjs";
import { buildFixtureGraph } from "./fixtures/fixture-site.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

const HELP = `
LVINIT Internal Linking Agent

  node scripts/internal-links/run.mjs [options]

By default this is a REPORT-ONLY run: it scans, scores, and writes a report.
Nothing on the site changes unless you pass --apply.

Options
  --apply               Actually add the safe links, validate, commit and push.
  --no-commit           With --apply: edit and validate, but leave the diff
                        uncommitted in the working tree.
  --no-push             With --apply: commit, but do not push.
  --dry-run             Force report-only even if --apply was passed.
  --trial               Apply the safe links TEMPORARILY, run every validation
                        check and the diff inspection against them, then revert
                        every edit. Never commits or pushes. Only the files it
                        edits need to be clean.
  --fixtures            Run against a synthetic site. No repository scan, no
                        edits. The report is stamped FIXTURE DATA throughout.
  --today=YYYY-MM-DD    Pretend today is this date.
  --max-links=N         Maximum links added this run (default 8).
  --max-pages=N         Maximum pages modified this run (default 5).
  --min-confidence=N    Auto-execution confidence line, 0-1 (default 0.72).
  --route=/path         Only consider this route as a SOURCE page. Repeatable.
  --exclude=/path       Never touch this route. Repeatable, comma-separated too.
  --no-gsc              Ignore the GSC signal entirely.
  --no-fact-decay       Ignore the Fact-Decay signal entirely (destinations are
                        then eligible regardless of factual state).
  --no-briefs           Ignore the Content Brief signal entirely.
  --skip-validation     Do not run typecheck/lint/build. Nothing may be
                        committed from a run in this state.
  --out=DIR             Output directory (default reports/internal-links).
  --json-only           Write only the JSON report.
  --help                This message.

Environment
  Nothing is required. Every threshold in scripts/internal-links/config.mjs has
  an environment override, named beside it in that file. To turn off autonomous
  pushing everywhere, set LINKS_GIT_PUSH=false. See
  docs/INTERNAL_LINKING_AGENT.md.
`;

/** Parse --flag and --flag=value into a plain object. Repeats become arrays. */
export function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const [flag, value] = raw.slice(2).split("=");
    const parsed = value === undefined ? true : value;
    if (flag in args) {
      args[flag] = Array.isArray(args[flag]) ? [...args[flag], parsed] : [args[flag], parsed];
    } else {
      args[flag] = parsed;
    }
  }
  return args;
}

const asList = (value) =>
  (Array.isArray(value) ? value : [value])
    .filter((v) => typeof v === "string")
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);

/** Turn CLI flags into a config override object. */
export function overridesFromArgs(args) {
  const overrides = { limits: {}, relevance: {}, content: {}, gsc: {}, factDecay: {}, briefs: {}, git: {}, output: {}, validation: {}, autoExecute: {} };
  if (args["max-links"]) overrides.limits.maxLinksAddedPerRun = Number.parseInt(args["max-links"], 10);
  if (args["max-pages"]) overrides.limits.maxPagesModifiedPerRun = Number.parseInt(args["max-pages"], 10);
  if (args["min-confidence"] !== undefined && args["min-confidence"] !== true) {
    overrides.relevance.autoExecuteMinConfidence = Number.parseFloat(args["min-confidence"]);
  }
  if (args.exclude) overrides.content.excludeRoutes = asList(args.exclude);
  if (args["no-gsc"]) overrides.gsc.enabled = false;
  if (args["no-fact-decay"]) overrides.factDecay.enabled = false;
  if (args["no-briefs"]) overrides.briefs.enabled = false;
  if (args["no-commit"]) overrides.git.commit = false;
  if (args["no-push"]) overrides.git.push = false;
  if (args["skip-validation"]) overrides.validation.skip = true;
  if (args.out) overrides.output.dir = String(args.out);
  return overrides;
}

/**
 * Earlier internal-link JSON reports, oldest first, for stable-ID continuity.
 *
 * Reads the output directory (local runs) and, when given, the CI history
 * directory, where each earlier run's artifact sits in its own `run-<id>/`
 * folder. One report per date: if the same date appears twice, an APPLY report
 * wins over a dry run, because it is the one that says what actually shipped.
 * Fixture reports are never history for a real run.
 */
export function readPreviousReports(dirs, { limit, excludeDate, allowFixture = false } = {}) {
  const list = (Array.isArray(dirs) ? dirs : [dirs]).filter(Boolean);
  const byDate = new Map();
  for (const dir of list) {
    if (!existsSync(dir)) continue;
    const files = [];
    const collect = (from) => {
      for (const entry of readdirSync(from, { withFileTypes: true })) {
        if (entry.isFile() && /^internal-links-\d{4}-\d{2}-\d{2}\.json$/.test(entry.name)) files.push(join(from, entry.name));
      }
    };
    collect(dir);
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) collect(join(dir, entry.name));
    }
    for (const file of files) {
      let report;
      try {
        report = JSON.parse(readFileSync(file, "utf8"));
      } catch {
        continue;
      }
      if (!report?.reportDate || (excludeDate && report.reportDate === excludeDate)) continue;
      if (report.fixtureData && !allowFixture) continue;
      const existing = byDate.get(report.reportDate);
      if (!existing || (existing.mode !== "apply" && report.mode === "apply")) byDate.set(report.reportDate, report);
    }
  }
  return [...byDate.values()]
    .sort((a, b) => a.reportDate.localeCompare(b.reportDate))
    .slice(-Math.max(1, limit ?? 12));
}

/** YYYY-MM-DD for a Date, in UTC. */
export function formatISODate(date) {
  return date.toISOString().slice(0, 10);
}

/** A fresh, empty execution record. */
function emptyExecution() {
  return {
    attempted: false,
    editsApplied: 0,
    editsFailed: [],
    validation: { summary: "not run — nothing was edited", results: [], skipped: false, failed: null },
    diff: null,
    committed: false,
    commitHash: null,
    commitReason: null,
    pushAttempted: false,
    pushed: false,
    pushReason: null,
    reverted: false,
    fatal: null,
    preflight: null,
    rebase: null,
    trial: null,
  };
}

export async function run(argv = process.argv.slice(2), { log = console.log, errorLog = console.error } = {}) {
  const args = parseArgs(argv);
  if (args.help) {
    log(HELP);
    return { exitCode: 0 };
  }

  const config = loadConfig(overridesFromArgs(args));
  const useFixtures = Boolean(args.fixtures);
  // --trial wins over --apply: it can edit, but it can never commit or push.
  const wantsTrial = Boolean(args.trial) && !args["dry-run"] && !useFixtures;
  const wantsApply = Boolean(args.apply) && !wantsTrial && !args["dry-run"] && !useFixtures;
  const reportDate = args.today ? String(args.today) : formatISODate(new Date());
  const onlySources = args.route ? new Set(asList(args.route)) : null;

  log("LVINIT Internal Linking Agent");
  log(`  Run date:  ${reportDate}`);
  log(
    `  Mode:      ${
      wantsApply
        ? "APPLY — safe links will be edited, validated and shipped"
        : wantsTrial
          ? "TRIAL — safe links will be applied, validated, and then reverted. Nothing is committed"
          : "REPORT ONLY — nothing on the site will change"
    }`
  );

  const execution = emptyExecution();

  // --- Git preflight -------------------------------------------------------
  // Runs even in report-only mode, because "the tree is dirty" is worth knowing
  // before a scheduled run tries to act on the same repository next week.
  if (!useFixtures) {
    const pre = preflight({ repoRoot: REPO_ROOT, config, fetchRemote: wantsApply });
    execution.preflight = { ok: pre.ok, reason: pre.reason, ...pre.state };
    log(`  Git:       ${pre.ok ? `clean on ${pre.state.branch}` : `NOT SAFE TO EDIT — ${pre.reason}`}`);
    if (!pre.ok && wantsApply) {
      execution.fatal = `The git preflight failed: ${pre.reason}`;
    }
    // A trial never commits, so an unrelated untracked file elsewhere does not
    // stop it. It still needs a git checkout, and (checked below) every file it
    // will edit must be unmodified so that reverting restores it exactly.
    if (wantsTrial && !pre.state.isRepo) {
      execution.fatal = "A trial needs a git working tree to revert against.";
    }
  }

  // --- Signals -------------------------------------------------------------
  const gscSignal = loadGscSignal({ repoRoot: REPO_ROOT, config, today: reportDate });
  const factDecaySignal = loadFactDecaySignal({ repoRoot: REPO_ROOT, config, today: reportDate });
  const briefSignal = loadBriefSignal({ repoRoot: REPO_ROOT, config, today: reportDate, allowFixture: useFixtures });
  log(`  Traffic:   ${gscSignal.available ? `GSC report ${gscSignal.reportDate} (${gscSignal.ageDays}d old)` : "no GSC weighting"}`);
  log(`  Freshness: ${factDecaySignal.available ? `Fact-Decay report ${factDecaySignal.reportDate} (${factDecaySignal.ageDays}d old)` : "no Fact-Decay gate"}`);
  log(`  Briefs:    ${briefSignal.available ? `Content Brief report ${briefSignal.reportDate} (${briefSignal.ageDays}d old, handoff ${briefSignal.handoffMode ?? "?"})` : "no brief context"}`);

  // --- Analyze -------------------------------------------------------------
  // A fixture run writes beside, never over, the real report for the same date
  // (the Content Brief Generator's convention). Both it and this agent's own
  // history reader ignore fixture reports in a real run.
  const realOutDir = resolve(REPO_ROOT, config.output.dir);
  const outDir = useFixtures && !args.out ? join(realOutDir, "fixtures") : realOutDir;
  const previousReports = readPreviousReports([realOutDir, resolve(REPO_ROOT, config.output.historyDir)], {
    limit: config.output.historyLookback,
    excludeDate: reportDate,
    allowFixture: useFixtures,
  });
  log(`  History:   ${previousReports.length ? `${previousReports.length} earlier report(s), newest ${previousReports.at(-1).reportDate}` : "none — every finding is NEW"}`);

  // A dry run still resolves the full auto-execution list, because the point of
  // a dry run is to show exactly what the agent WOULD change. The difference is
  // that nothing is written, committed or pushed.
  const canApply = wantsApply && !execution.fatal;
  const canTrial = wantsTrial && !execution.fatal;
  const canEdit = canApply || canTrial;
  const runMode = canApply ? "apply" : canTrial ? "trial" : "dry-run";
  const runConfig = config;

  let analysis;
  try {
    let graph;
    if (useFixtures) {
      log("  Source:    FIXTURE SITE (synthetic — not LVINIT's real content)");
      graph = buildFixtureGraph({ config: runConfig, today: reportDate });
    }
    analysis = analyze({
      graph,
      repoRoot: REPO_ROOT,
      config: runConfig,
      reportDate,
      gscSignal,
      factDecaySignal,
      briefSignal,
      previousReports,
      mode: runMode,
    });
  } catch (err) {
    errorLog(`\nCould not analyze the site: ${err.message}`);
    return { exitCode: 1 };
  }

  if (onlySources) {
    analysis.autoExecuted = analysis.autoExecuted.filter((c) => onlySources.has(c.from));
    analysis.needsReview = analysis.needsReview.filter((c) => onlySources.has(c.from));
    analysis.totals.autoExecuted = analysis.autoExecuted.length;
    analysis.totals.needsReview = analysis.needsReview.length;
  }

  if (!useFixtures) {
    log(`  Source:    the LVINIT repository — ${analysis.totals.pagesScanned} published editorial page(s), ${analysis.totals.editorialLinks} editorial link(s)`);
  }

  // --- Trial precondition ------------------------------------------------
  if (canTrial && analysis.autoExecuted.length > 0) {
    const files = [...new Set(analysis.autoExecuted.map((c) => c.file))];
    const clean = pathsAreClean(REPO_ROOT, files);
    if (!clean.ok) {
      execution.fatal = `A trial will not edit files that already have uncommitted changes (${clean.dirty.join(", ")}).`;
    }
  }

  // --- Apply ---------------------------------------------------------------
  if (canEdit && !execution.fatal && analysis.autoExecuted.length > 0) {
    execution.attempted = true;
    log("");
    log(`  ${canTrial ? "Trial-applying" : "Applying"} ${analysis.autoExecuted.length} safe link edit(s)...`);

    const { applied, failed, snapshots } = applyEdits({
      repoRoot: REPO_ROOT,
      candidates: analysis.autoExecuted,
      config: runConfig,
      existingRoutes: analysis.graph.existingRoutes,
    });
    execution.editsApplied = applied.length;
    execution.editsFailed = failed.map((f) => ({ id: f.candidate.id, from: f.candidate.from, to: f.candidate.to, reason: f.reason }));

    for (const failure of failed) {
      log(`    ${failure.candidate.id}: NOT applied — ${failure.reason}`);
    }

    const appliedFingerprints = new Set(applied.map((a) => a.fingerprint));
    for (const candidate of analysis.autoExecuted) {
      const match = applied.find((a) => a.fingerprint === candidate.fingerprint);
      if (match) {
        candidate.edit = match.edit;
        candidate.validation = match.validation;
      }
    }
    // Anything that could not be applied moves into the review list, with the
    // reason, rather than being reported as if it had shipped.
    const notApplied = analysis.autoExecuted.filter((c) => !appliedFingerprints.has(c.fingerprint));
    for (const candidate of notApplied) {
      const failure = failed.find((f) => f.candidate.fingerprint === candidate.fingerprint);
      candidate.blockers = [
        ...(candidate.blockers ?? []),
        { code: "EDIT_FAILED", detail: failure?.reason ?? "the edit could not be applied" },
      ];
    }
    analysis.autoExecuted = analysis.autoExecuted.filter((c) => appliedFingerprints.has(c.fingerprint));
    analysis.needsReview = [...notApplied, ...analysis.needsReview];
    analysis.totals.autoExecuted = analysis.autoExecuted.length;
    analysis.totals.needsReview = analysis.needsReview.length;

    if (applied.length > 0) {
      // --- Validation ------------------------------------------------------
      log("");
      const validation = runValidation({ repoRoot: REPO_ROOT, config: runConfig, log });
      execution.validation = {
        summary: validation.skipped
          ? "skipped by configuration"
          : validation.ok
            ? "all checks passed"
            : `FAILED at ${validation.failed.label}`,
        results: validation.results,
        skipped: validation.skipped,
        failed: validation.failed,
      };

      if (!validation.ok || validation.skipped) {
        const why = validation.skipped
          ? "validation was skipped, and an unvalidated edit is never allowed to ship"
          : `${validation.failed.label} failed`;
        log("");
        log(`  ${why}. Reverting every edit from this run.`);
        restore(REPO_ROOT, snapshots);
        discardChanges(REPO_ROOT, [...snapshots.keys()]);
        execution.reverted = true;
        execution.fatal = `${why}; every edit was reverted and nothing was committed or pushed.`;
        for (const candidate of analysis.autoExecuted) {
          candidate.blockers = [
            ...(candidate.blockers ?? []),
            { code: "VALIDATION_FAILED", detail: why },
          ];
        }
        analysis.needsReview = [...analysis.autoExecuted, ...analysis.needsReview];
        analysis.autoExecuted = [];
        analysis.totals.autoExecuted = 0;
        analysis.totals.needsReview = analysis.needsReview.length;
      } else {
        // --- Diff inspection ----------------------------------------------
        // A real run inspects the WHOLE tree (it started clean, so anything
        // else there is a problem). A trial inspects only what it edited.
        const diff = inspectDiff({
          repoRoot: REPO_ROOT,
          config: runConfig,
          paths: canTrial ? [...snapshots.keys()].map((p) => p.split("\\").join("/")) : null,
        });
        execution.diff = {
          paths: diff.paths,
          disallowed: diff.disallowed,
          addedLines: diff.addedLines,
          removedLines: diff.removedLines,
          onlyLinkWrappers: diff.onlyLinkWrappers,
          orphanedRemovals: diff.orphanedRemovals.slice(0, 10),
        };

        if (canTrial) {
          // --- Trial: always revert -----------------------------------------
          restore(REPO_ROOT, snapshots);
          discardChanges(REPO_ROOT, [...snapshots.keys()]);
          const after = pathsAreClean(REPO_ROOT, [...new Set(analysis.autoExecuted.map((c) => c.file))]);
          execution.reverted = true;
          execution.trial = {
            diffAcceptable: !diff.disallowed.length && diff.onlyLinkWrappers,
            restoredClean: after.ok,
            diffText: diff.diff,
          };
          log("");
          log(`  Trial diff: ${execution.trial.diffAcceptable ? "only <Link> wrappers, in allowed paths" : "REJECTED — it would not have shipped"}`);
          log(`  Trial edits reverted: ${after.ok ? "yes, every edited file matches HEAD again" : `NO — check ${after.dirty.join(", ")}`}`);
          if (!execution.trial.diffAcceptable) {
            execution.fatal = "the trial diff contained more than <Link> wrappers; a real run would have reverted and shipped nothing.";
          }
        } else if (diff.disallowed.length || !diff.onlyLinkWrappers) {
          const why = diff.disallowed.length
            ? `the diff touches paths this agent is not allowed to change (${diff.disallowed.join(", ")})`
            : "the diff contains changes that are not simply an added <Link> wrapper";
          log("");
          log(`  ${why}. Reverting.`);
          restore(REPO_ROOT, snapshots);
          discardChanges(REPO_ROOT, [...snapshots.keys()]);
          execution.reverted = true;
          execution.fatal = `${why}; every edit was reverted and nothing was committed or pushed.`;
          analysis.needsReview = [...analysis.autoExecuted, ...analysis.needsReview];
          analysis.autoExecuted = [];
          analysis.totals.autoExecuted = 0;
          analysis.totals.needsReview = analysis.needsReview.length;
        } else if (runConfig.git.commit) {
          // --- Commit ------------------------------------------------------
          const message = commitMessage({ config: runConfig, reportDate, candidates: analysis.autoExecuted });
          const result = commit({ repoRoot: REPO_ROOT, config: runConfig, message, paths: diff.paths });
          execution.committed = result.ok;
          execution.commitHash = result.hash;
          execution.commitReason = result.reason;
          log("");
          log(result.ok ? `  Committed ${result.hash?.slice(0, 10)}` : `  Commit failed: ${result.reason}`);

          // --- Push --------------------------------------------------------
          if (result.ok && runConfig.git.push) {
            execution.pushAttempted = true;
            const pushed = push({
              repoRoot: REPO_ROOT,
              config: runConfig,
              expectedRemoteHead: execution.preflight?.remoteHead ?? null,
            });
            execution.pushed = pushed.pushed;
            execution.pushReason = pushed.reason;
            if (!pushed.pushed && pushed.remoteMoved) {
              const retried = rebaseAndRetryPush({
                config: runConfig,
                execution,
                oldRemoteHead: execution.preflight?.remoteHead ?? null,
                newRemoteHead: pushed.remoteHead,
                editedPaths: diff.paths,
                log,
              });
              execution.pushed = retried.pushed;
              execution.pushReason = retried.reason;
              if (retried.hash) execution.commitHash = retried.hash;
              if (retried.dropped) execution.committed = false;
            }
            log(execution.pushed ? `  Pushed to ${runConfig.git.remote}/${runConfig.git.branch}` : `  Push failed: ${execution.pushReason}`);
            if (execution.pushed) {
              for (const candidate of analysis.autoExecuted) candidate.status = LIFECYCLE.AUTO_FIXED;
            }
            if (!execution.pushed) {
              // The commit is local and correct. Leaving it is the honest
              // outcome: the work is done, the branch is just busy.
              execution.fatal = `The edits were ${execution.committed ? "committed locally but" : ""} not pushed: ${execution.pushReason}`;
            }
          } else if (result.ok) {
            log("  Push is switched off for this run; the commit is local.");
            for (const candidate of analysis.autoExecuted) candidate.status = LIFECYCLE.AUTO_FIXED;
          }

          if (!result.ok) {
            restore(REPO_ROOT, snapshots);
            discardChanges(REPO_ROOT, [...snapshots.keys()]);
            execution.reverted = true;
            execution.fatal = `The commit failed (${result.reason}); every edit was reverted.`;
          }
        } else {
          log("");
          log("  Commit is switched off for this run; the edits are in the working tree.");
        }
      }
    }
  } else if (canEdit && !execution.fatal) {
    log("");
    log("  Nothing cleared every safety gate, so there was nothing to apply.");
  }

  // --- Report --------------------------------------------------------------
  analysis.execution = execution;
  analysis.mode = runMode;
  const meta = { dataSource: useFixtures ? "fixture" : "repository-scan", origin: "https://www.lvinit.com" };
  const markdown = buildMarkdownReport({ analysis, config: runConfig, meta });
  const json = buildJsonReport({ analysis, config: runConfig, meta });

  const mdPath = join(outDir, `internal-links-${reportDate}.md`);
  const jsonPath = join(outDir, `internal-links-${reportDate}.json`);
  mkdirSync(outDir, { recursive: true });
  if (!args["json-only"]) writeFileSync(mdPath, `${markdown}\n`, "utf8");
  writeFileSync(jsonPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");

  // --- Summary -------------------------------------------------------------
  log("");
  for (const line of summaryLines(analysis)) log(line);
  log("");
  const shipped = execution.pushed || (execution.committed && !runConfig.git.push);
  const autoLabel = runMode === "apply" ? (shipped ? "APPLIED  " : "NOT SHIPPED") : "WOULD ADD";
  for (const candidate of analysis.autoExecuted) {
    log(`  ${candidate.id}  ${String(candidate.priority).padStart(3)}  ${autoLabel}  ${candidate.from} -> ${candidate.to}  "${candidate.anchor}"`);
  }
  for (const candidate of (analysis.shownReview ?? analysis.needsReview).slice(0, runConfig.output.maxReviewItems)) {
    const primary = candidate.blockers?.[0]?.code ?? "REVIEW";
    log(`  ${candidate.id}  ${String(candidate.priority).padStart(3)}  ${primary.padEnd(28)} ${candidate.from} -> ${candidate.to}`);
  }
  if (analysis.evaluated.length === 0) {
    log("  No candidate cleared the reporting threshold. That is a real answer, not an empty report.");
  }
  log("");
  if (execution.fatal) {
    log(`  ⚠️  ${execution.fatal}`);
    log("");
  }
  log(`  Wrote ${args["json-only"] ? "" : `${mdPath}\n        `}${jsonPath}`);
  if (useFixtures) {
    log("");
    log("  ⚠️  FIXTURE RUN — every page and link above is synthetic. Do not act on it.");
  }

  return {
    exitCode:
      runMode === "trial"
        ? execution.fatal || (execution.trial && !execution.trial.restoredClean) ? 1 : 0
        : execution.fatal && execution.reverted ? 1 : 0,
    analysis,
    markdown,
    json,
    paths: { mdPath, jsonPath },
  };
}

/**
 * The remote moved during the run. Rebase onto it only when that is provably
 * safe, re-validate the rebased tree from scratch, re-inspect the commit's own
 * diff, and push once. Any failure leaves nothing pushed and says why.
 */
function rebaseAndRetryPush({ config, execution, oldRemoteHead, newRemoteHead, editedPaths, log }) {
  log("");
  log(`  ${config.git.remote}/${config.git.branch} moved during the run. Checking whether a clean rebase is safe...`);
  const rebased = rebaseOntoRemote({ repoRoot: REPO_ROOT, config, oldRemoteHead, newRemoteHead, editedPaths });
  execution.rebase = { attempted: true, ok: rebased.ok, reason: rebased.reason, remotePaths: rebased.remotePaths ?? [] };
  if (!rebased.ok) {
    return { pushed: false, reason: `not rebased: ${rebased.reason}. The commit is local only.` };
  }
  log("  Rebased cleanly. Re-running every check against the rebased tree...");
  const validation = runValidation({ repoRoot: REPO_ROOT, config, log });
  execution.rebase.validation = validation.ok ? "all checks passed" : `FAILED at ${validation.failed?.label}`;
  const diff = inspectDiff({ repoRoot: REPO_ROOT, config, range: "HEAD~1..HEAD" });
  execution.rebase.diffAcceptable = !diff.disallowed.length && diff.onlyLinkWrappers;
  if (!validation.ok || validation.skipped || !execution.rebase.diffAcceptable) {
    const dropped = dropOwnCommit(REPO_ROOT);
    return {
      pushed: false,
      dropped: dropped.ok,
      reason: `after rebasing, ${!validation.ok ? `${validation.failed?.label} failed` : "the commit's diff was no longer only <Link> wrappers"}; the agent's commit was dropped and nothing was pushed`,
    };
  }
  const again = push({ repoRoot: REPO_ROOT, config, expectedRemoteHead: newRemoteHead });
  return {
    pushed: again.pushed,
    hash: rebased.hash,
    reason: again.pushed ? null : `rebased and re-validated, but the push still failed (${again.reason}). Not retried again.`,
  };
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  run()
    .then((result) => {
      process.exitCode = result.exitCode ?? 0;
    })
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    });
}
