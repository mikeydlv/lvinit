#!/usr/bin/env node
// ---------------------------------------------------------------------------
// LVINIT INTERNAL LINKING AGENT — RUNNER
//
//   node scripts/internal-links/run.mjs                 report only, writes nothing to the site
//   node scripts/internal-links/run.mjs --apply         edit, validate, commit and push safe links
//   node scripts/internal-links/run.mjs --apply --no-push    edit and commit, leave the push to you
//   node scripts/internal-links/run.mjs --apply --no-commit  edit only, leave the diff in the tree
//   node scripts/internal-links/run.mjs --fixtures      synthetic site, no repository scan
//   node scripts/internal-links/run.mjs --today=2026-12-01
//   node scripts/internal-links/run.mjs --help
//
// What it does, in order:
//   1. resolve config (defaults -> env -> CLI flags)
//   2. git preflight: right branch, clean tree, remote fetched, no divergence
//   3. build the internal link graph from app/**/page.tsx
//   4. load the optional GSC signal (ordering only) and Fact-Decay signal
//      (destination eligibility), both read-only
//   5. read earlier internal-link reports, so findings keep their identity
//   6. find, score and gate every candidate link
//   7. --apply only: edit, re-check each edit, run typecheck + lint + build
//   8. --apply only: inspect the diff, commit, re-check the remote, push
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
import { loadGscSignal, loadFactDecaySignal } from "./lib/signals.mjs";
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
} from "./lib/git.mjs";
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
  const overrides = { limits: {}, relevance: {}, content: {}, gsc: {}, factDecay: {}, git: {}, output: {}, validation: {}, autoExecute: {} };
  if (args["max-links"]) overrides.limits.maxLinksAddedPerRun = Number.parseInt(args["max-links"], 10);
  if (args["max-pages"]) overrides.limits.maxPagesModifiedPerRun = Number.parseInt(args["max-pages"], 10);
  if (args["min-confidence"] !== undefined && args["min-confidence"] !== true) {
    overrides.relevance.autoExecuteMinConfidence = Number.parseFloat(args["min-confidence"]);
  }
  if (args.exclude) overrides.content.excludeRoutes = asList(args.exclude);
  if (args["no-gsc"]) overrides.gsc.enabled = false;
  if (args["no-fact-decay"]) overrides.factDecay.enabled = false;
  if (args["no-commit"]) overrides.git.commit = false;
  if (args["no-push"]) overrides.git.push = false;
  if (args["skip-validation"]) overrides.validation.skip = true;
  if (args.out) overrides.output.dir = String(args.out);
  return overrides;
}

/** Earlier internal-link JSON reports, newest last, for stable-ID continuity. */
export function readPreviousReports(dir, { limit, excludeDate } = {}) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /^internal-links-\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .filter((f) => !excludeDate || !f.includes(excludeDate))
    .sort()
    .slice(-Math.max(1, limit ?? 12))
    .map((f) => {
      try {
        return JSON.parse(readFileSync(join(dir, f), "utf8"));
      } catch {
        return null;
      }
    })
    .filter(Boolean);
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
  const wantsApply = Boolean(args.apply) && !args["dry-run"] && !useFixtures;
  const reportDate = args.today ? String(args.today) : formatISODate(new Date());
  const onlySources = args.route ? new Set(asList(args.route)) : null;

  log("LVINIT Internal Linking Agent");
  log(`  Run date:  ${reportDate}`);
  log(`  Mode:      ${wantsApply ? "APPLY — safe links will be edited, validated and shipped" : "REPORT ONLY — nothing on the site will change"}`);

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
  }

  // --- Signals -------------------------------------------------------------
  const gscSignal = loadGscSignal({ repoRoot: REPO_ROOT, config, today: reportDate });
  const factDecaySignal = loadFactDecaySignal({ repoRoot: REPO_ROOT, config, today: reportDate });
  log(`  Traffic:   ${gscSignal.available ? `GSC report ${gscSignal.reportDate} (${gscSignal.ageDays}d old)` : "no GSC weighting"}`);
  log(`  Freshness: ${factDecaySignal.available ? `Fact-Decay report ${factDecaySignal.reportDate} (${factDecaySignal.ageDays}d old)` : "no Fact-Decay gate"}`);

  // --- Analyze -------------------------------------------------------------
  const outDir = resolve(REPO_ROOT, config.output.dir);
  const previousReports = readPreviousReports(outDir, {
    limit: config.output.historyLookback,
    excludeDate: reportDate,
  });

  // A dry run still resolves the full auto-execution list, because the point of
  // a dry run is to show exactly what the agent WOULD change. The difference is
  // that nothing is written, committed or pushed.
  const canApply = wantsApply && !execution.fatal;
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
      previousReports,
      mode: canApply ? "apply" : "dry-run",
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

  // --- Apply ---------------------------------------------------------------
  if (canApply && analysis.autoExecuted.length > 0) {
    execution.attempted = true;
    log("");
    log(`  Applying ${analysis.autoExecuted.length} safe link edit(s)...`);

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
        const diff = inspectDiff({ repoRoot: REPO_ROOT, config: runConfig });
        execution.diff = {
          paths: diff.paths,
          disallowed: diff.disallowed,
          addedLines: diff.addedLines,
          removedLines: diff.removedLines,
          onlyLinkWrappers: diff.onlyLinkWrappers,
          orphanedRemovals: diff.orphanedRemovals.slice(0, 10),
        };

        if (diff.disallowed.length || !diff.onlyLinkWrappers) {
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
            log(pushed.pushed ? `  Pushed to ${runConfig.git.remote}/${runConfig.git.branch}` : `  Push failed: ${pushed.reason}`);
            if (!pushed.pushed) {
              // The commit is local and correct. Leaving it is the honest
              // outcome: the work is done, the branch is just busy.
              execution.fatal = `The edits were committed locally but not pushed: ${pushed.reason}`;
            }
          } else if (result.ok) {
            log("  Push is switched off for this run; the commit is local.");
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
  } else if (canApply) {
    log("");
    log("  Nothing cleared every safety gate, so there was nothing to apply.");
  }

  // --- Report --------------------------------------------------------------
  analysis.execution = execution;
  analysis.mode = canApply ? "apply" : "dry-run";
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
  for (const candidate of analysis.autoExecuted) {
    log(`  ${candidate.id}  ${String(candidate.priority).padStart(3)}  APPLIED   ${candidate.from} -> ${candidate.to}  "${candidate.anchor}"`);
  }
  for (const candidate of analysis.needsReview.slice(0, runConfig.output.maxReviewItems)) {
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
    exitCode: execution.fatal && execution.reverted ? 1 : 0,
    analysis,
    markdown,
    json,
    paths: { mdPath, jsonPath },
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
