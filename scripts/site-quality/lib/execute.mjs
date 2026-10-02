// ---------------------------------------------------------------------------
// EXECUTION — applying planned fixes, proving them, and undoing them
//
// Two modes:
//
//   trial  apply -> inspect the diff -> run every validation command -> rebuild
//          and re-audit -> ALWAYS revert. Never commits. Only needs the files it
//          edits to be clean, so it can run beside unrelated work.
//   apply  the same, then commit and push — and only when autoFix.enabled is on
//          (off in v1). Needs a clean tree, the right branch, and a remote it can
//          fast-forward, exactly like the Internal Linking Agent, whose git
//          helpers are reused rather than re-implemented.
//
// A fix is proven by the RE-AUDIT, not by the edit succeeding: after the new
// build, every fixed fingerprint must be gone and no fingerprint may appear that
// was not there before. Anything else reverts everything.
// ---------------------------------------------------------------------------

import { existsSync, readFileSync, writeFileSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import {
  git,
  preflight,
  commit as gitCommit,
  push as gitPush,
  rebaseOntoRemote,
  dropOwnCommit,
  pathsAreClean,
  discardChanges,
} from "../../internal-links/lib/git.mjs";
import { runValidation, runCommand, tailOutput } from "../../internal-links/lib/verify.mjs";

export { git, preflight, pathsAreClean };

/** Apply a plan's edits to file text in memory. Throws if the source moved. */
export function applyEditsToText(text, edits) {
  const lines = text.split("\n");
  // Keep the file's own line endings: a Windows checkout (core.autocrlf) is CRLF.
  const eol = text.includes("\r\n") ? "\r" : "";
  const noCr = (l) => l.replace(/\r$/, "");
  // Bottom-up so earlier line numbers stay valid.
  const ordered = [...edits].sort((a, b) => (b.line ?? b.afterLine ?? b.startLine) - (a.line ?? a.afterLine ?? a.startLine) || (b.column ?? 0) - (a.column ?? 0));
  for (const e of ordered) {
    if (e.kind === "replace") {
      const line = lines[e.line - 1];
      const at = e.column - 1;
      if (line === undefined || line.slice(at, at + e.before.length) !== e.before) {
        throw new Error(`${e.file}:${e.line} no longer holds ${e.before} at column ${e.column} — the source changed since the audit`);
      }
      lines[e.line - 1] = line.slice(0, at) + e.after + line.slice(at + e.before.length);
    } else if (e.kind === "insert") {
      lines.splice(e.afterLine, 0, ...e.lines.map((l) => `${l}${eol}`));
    } else if (e.kind === "remove") {
      const current = lines.slice(e.startLine - 1, e.startLine - 1 + e.lines.length).map(noCr);
      if (current.join("\n") !== e.lines.map(noCr).join("\n")) {
        throw new Error(`${e.file}:${e.startLine} no longer holds the entry to remove — the source changed since the audit`);
      }
      lines.splice(e.startLine - 1, e.lines.length);
    } else {
      throw new Error(`unknown edit kind ${e.kind}`);
    }
  }
  return lines.join("\n");
}

/** Group every planned finding's edits by file. */
export function editsByFile(planned) {
  const map = new Map();
  for (const f of planned) {
    for (const e of f.fix.edits) map.set(e.file, [...(map.get(e.file) ?? []), e]);
  }
  return map;
}

/** Write the edits. Returns the originals so they can be restored byte-for-byte. */
export function applyPlanned({ repoRoot, planned }) {
  const originals = new Map();
  const expected = new Map();
  for (const [file, edits] of editsByFile(planned)) {
    const abs = join(repoRoot, file);
    const before = readFileSync(abs, "utf8");
    originals.set(file, before);
    expected.set(file, applyEditsToText(before, edits));
  }
  for (const [file, text] of expected) writeFileSync(join(repoRoot, file), text, "utf8");
  return { originals, expected };
}

export function restoreOriginals({ repoRoot, originals }) {
  for (const [file, text] of originals) writeFileSync(join(repoRoot, file), text, "utf8");
}

/**
 * The diff inspector. Independent of how the edits were made:
 *   * the set of changed files (per git, within `scope`) equals the planned set
 *   * every planned file on disk equals exactly the in-memory expected result
 *   * every changed line pair differs only by a planned literal, or is a
 *     planned inserted/removed sitemap line
 */
export function inspectFixDiff({ repoRoot, planned, expected, config, wholeTree }) {
  const plannedFiles = [...expected.keys()].sort();
  const names = git(repoRoot, ["diff", "--name-only", ...(wholeTree ? [] : ["--", ...plannedFiles])]);
  const changed = names.stdout ? names.stdout.split("\n").filter(Boolean).sort() : [];
  const problems = [];
  const unexpected = changed.filter((f) => !plannedFiles.includes(f));
  if (unexpected.length) problems.push(`files changed that no fix planned: ${unexpected.join(", ")}`);
  const untouched = plannedFiles.filter((f) => !changed.includes(f));
  if (untouched.length) problems.push(`planned files show no change: ${untouched.join(", ")}`);
  const disallowed = changed.filter((f) => !config.autoFix.allowedPathPrefixes.some((p) => f.startsWith(p)));
  if (disallowed.length) problems.push(`changed files outside the allowed paths: ${disallowed.join(", ")}`);
  for (const [file, text] of expected) {
    const disk = readFileSync(join(repoRoot, file), "utf8");
    if (disk !== text) problems.push(`${file} on disk differs from the planned result`);
  }

  // Line-level: removed lines must map to added lines by a planned literal swap.
  const swaps = planned.flatMap((f) => f.fix.edits.filter((e) => e.kind === "replace").map((e) => [e.before, e.after]));
  const noCr = (l) => l.replace(/\r$/, "");
  const insertedLines = planned.flatMap((f) => f.fix.edits.filter((e) => e.kind === "insert").flatMap((e) => e.lines.map(noCr)));
  const removedPlanned = planned.flatMap((f) => f.fix.edits.filter((e) => e.kind === "remove").flatMap((e) => e.lines.map(noCr)));
  const diff = git(repoRoot, ["diff", "--unified=0", "--", ...plannedFiles]);
  const removed = [];
  const added = [];
  for (const raw of diff.stdout.split("\n")) {
    const line = noCr(raw);
    if (line.startsWith("---") || line.startsWith("+++")) continue;
    if (line.startsWith("-")) removed.push(line.slice(1));
    else if (line.startsWith("+")) added.push(line.slice(1));
  }
  const swapped = (line) => swaps.reduce((s, [b, a]) => s.split(b).join(a), line);
  const addedPool = [...added];
  for (const r of removed) {
    const target = swapped(r);
    const i = addedPool.indexOf(target);
    if (i >= 0 && target !== r) addedPool.splice(i, 1);
    else if (!removedPlanned.includes(r)) problems.push(`a removed line is not explained by any planned fix: ${r.trim().slice(0, 100)}`);
  }
  for (const a of addedPool) {
    if (!insertedLines.includes(a)) problems.push(`an added line is not explained by any planned fix: ${a.trim().slice(0, 100)}`);
  }
  return { ok: problems.length === 0, problems, changed, diff: diff.stdout };
}

/** Rebuild and re-audit, then compare fingerprints. */
export async function reaudit({ runAudit, before, planned }) {
  const after = await runAudit();
  const beforeFps = new Set(before.map((f) => f.fingerprint));
  const afterFps = new Set(after.findings.map((f) => f.fingerprint));
  const cleared = planned.map((f) => ({ id: f.id, fingerprint: f.fingerprint, cleared: !afterFps.has(f.fingerprint) }));
  const introduced = after.findings.filter((f) => !beforeFps.has(f.fingerprint));
  return {
    ok: cleared.every((c) => c.cleared) && introduced.length === 0,
    cleared,
    introduced: introduced.map((f) => ({ type: f.type, route: f.route, detail: f.detail, fingerprint: f.fingerprint })),
  };
}

// --- run lock ----------------------------------------------------------------

export function acquireLock(repoRoot, config) {
  const gitDir = git(repoRoot, ["rev-parse", "--git-dir"]);
  if (!gitDir.ok) return { ok: false, reason: "not a git repository" };
  // `--git-dir` is relative (".git") in a normal checkout but absolute in a
  // linked worktree or submodule; resolve() handles both.
  const dir = resolve(repoRoot, gitDir.stdout);
  for (const marker of ["rebase-merge", "rebase-apply", "MERGE_HEAD", "CHERRY_PICK_HEAD"]) {
    if (existsSync(join(dir, marker))) return { ok: false, reason: `a git ${marker} is in progress` };
  }
  const lock = join(dir, "site-quality.lock");
  if (existsSync(lock)) {
    const age = Date.now() - statSync(lock).mtimeMs;
    if (age < config.git.lockMaxAgeMs) return { ok: false, reason: `another Site Quality run holds ${lock} (${Math.round(age / 1000)}s old)` };
  }
  writeFileSync(lock, `${process.pid} ${new Date().toISOString()}\n`, "utf8");
  return { ok: true, path: lock, release: () => rmSync(lock, { force: true }) };
}

// --- the orchestration --------------------------------------------------------

/**
 * Trial or apply the planned fixes.
 *
 * @param {object} o
 * @param {"trial"|"apply"} o.mode
 * @param {() => Promise<{findings:Array}>} o.runAudit  rebuild-free audit of the current tree
 */
export async function executeFixes({ repoRoot, config, planned, findings, mode, runAudit, reportDate, log = () => {}, preflightState = null }) {
  const execution = {
    mode,
    attempted: false,
    applied: false,
    reverted: false,
    committed: false,
    pushed: false,
    commitHash: null,
    validation: null,
    diff: null,
    reaudit: null,
    stoppedBecause: null,
  };
  if (!planned.length) {
    execution.stoppedBecause = "no finding cleared every auto-fix gate";
    return execution;
  }
  if (mode === "apply" && !config.autoFix.enabled) {
    execution.stoppedBecause = "auto-fix is disabled (autoFix.enabled / SITE_QUALITY_AUTO_FIX is off) — nothing was edited";
    return execution;
  }

  const files = [...new Set(planned.flatMap((f) => f.fix.edits.map((e) => e.file)))];
  if (mode === "trial") {
    const clean = pathsAreClean(repoRoot, files);
    if (!clean.ok) {
      execution.stoppedBecause = `the files a fix would edit have uncommitted changes (${clean.dirty.join(", ")}); the trial will not edit around them`;
      return execution;
    }
  } else if (!preflightState?.ok) {
    execution.stoppedBecause = `git preflight refused: ${preflightState?.reason ?? "not run"}`;
    return execution;
  }

  const lock = acquireLock(repoRoot, config);
  if (!lock.ok) {
    execution.stoppedBecause = `run lock refused: ${lock.reason}`;
    return execution;
  }

  let originals = new Map();
  const restore = () => {
    restoreOriginals({ repoRoot, originals });
    // Belt and braces: whatever was restored must now equal HEAD.
    discardChanges(repoRoot, files);
    execution.reverted = true;
  };
  try {
    execution.attempted = true;
    let expected;
    try {
      ({ originals, expected } = applyPlanned({ repoRoot, planned }));
      execution.applied = true;
    } catch (err) {
      execution.stoppedBecause = `could not apply: ${err.message}`;
      restore();
      return execution;
    }
    log(`  Applied ${planned.length} fix(es) to ${files.length} file(s).`);

    const inspection = inspectFixDiff({ repoRoot, planned, expected, config, wholeTree: mode === "apply" });
    execution.diff = { ok: inspection.ok, problems: inspection.problems, changed: inspection.changed, patch: inspection.diff };
    if (!inspection.ok) {
      execution.stoppedBecause = `the diff inspector refused: ${inspection.problems.join("; ")}`;
      restore();
      return execution;
    }

    log("  Validating...");
    const validation = runValidation({ repoRoot, config, log });
    execution.validation = {
      ok: validation.ok,
      skipped: validation.skipped,
      results: validation.results.map((r) => ({ key: r.key, label: r.label, command: r.command, ok: r.ok, code: r.code, durationMs: r.durationMs, tail: r.ok ? "" : tailOutput(r.output) })),
    };
    if (!validation.ok || validation.skipped) {
      execution.stoppedBecause = validation.skipped ? "validation was skipped, so nothing can be kept" : `${validation.failed.label} failed`;
      restore();
      return execution;
    }

    log("  Re-auditing the rebuilt site...");
    execution.reaudit = await reaudit({ runAudit, before: findings, planned });
    if (!execution.reaudit.ok) {
      execution.stoppedBecause = "the re-audit did not confirm the fix (a fixed issue remained, or a new one appeared)";
      restore();
      return execution;
    }

    if (mode === "trial") {
      restore();
      return execution;
    }

    // ---- apply: commit and push ----------------------------------------------
    if (!config.git.commit) {
      execution.stoppedBecause = "commit is switched off; the validated edits are left in the working tree";
      return execution;
    }
    const message = commitMessage({ config, reportDate, planned });
    const committed = gitCommit({ repoRoot, config, message, paths: files });
    if (!committed.ok) {
      execution.stoppedBecause = `commit failed: ${committed.reason}`;
      restore();
      return execution;
    }
    execution.committed = true;
    execution.commitHash = committed.hash;
    if (!config.git.push) {
      execution.stoppedBecause = "push is switched off; the commit is local";
      return execution;
    }
    const pushed = gitPush({ repoRoot, config, expectedRemoteHead: preflightState.state.remoteHead });
    if (pushed.ok) {
      execution.pushed = true;
      return execution;
    }
    if (pushed.remoteMoved) {
      const rebased = rebaseOntoRemote({ repoRoot, config, oldRemoteHead: preflightState.state.remoteHead, newRemoteHead: pushed.remoteHead, editedPaths: files });
      if (!rebased.ok) {
        execution.stoppedBecause = `remote moved and a clean rebase was not possible: ${rebased.reason}`;
        return execution;
      }
      const again = runValidation({ repoRoot, config, log });
      const recheck = inspectCommitScope({ repoRoot, files });
      if (!again.ok || !recheck.ok) {
        dropOwnCommit(repoRoot);
        execution.committed = false;
        execution.stoppedBecause = "after rebasing, validation or the diff inspection failed; the commit was dropped";
        return execution;
      }
      const second = gitPush({ repoRoot, config, expectedRemoteHead: pushed.remoteHead });
      execution.commitHash = rebased.hash ?? execution.commitHash;
      execution.pushed = second.ok;
      if (!second.ok) execution.stoppedBecause = `push after rebase failed: ${second.reason}`;
      return execution;
    }
    execution.stoppedBecause = `push failed: ${pushed.reason}`;
    return execution;
  } catch (err) {
    // Anything unexpected (a crashed validator, a re-audit that throws) must
    // still leave the tree exactly as it was, unless a commit already exists.
    if (execution.applied && !execution.committed && !execution.reverted) restore();
    execution.stoppedBecause = `unexpected error, every edit was reverted: ${err.message}`;
    return execution;
  } finally {
    lock.release();
  }
}

/**
 * Settle the three gates only execution can prove, on each planned finding,
 * from what actually happened. A stage that was never reached stays pending.
 */
export function settleGates(planned, execution) {
  if (!execution?.attempted) return;
  for (const f of planned) {
    const cleared = execution.reaudit?.cleared?.find((c) => c.fingerprint === f.fingerprint);
    const outcome = {
      "diff-scoped": execution.diff ? [execution.diff.ok, execution.diff.ok ? "the diff inspector found only the planned change" : execution.diff.problems.join("; ")] : null,
      "build-passes": execution.validation
        ? [execution.validation.ok, execution.validation.ok ? execution.validation.results.map((r) => r.label).join(", ") + " passed" : `${execution.validation.results.find((r) => !r.ok)?.label ?? "validation"} failed`]
        : null,
      "mechanically-validated": execution.reaudit
        ? [Boolean(cleared?.cleared) && execution.reaudit.introduced.length === 0, cleared?.cleared ? (execution.reaudit.introduced.length ? `cleared, but ${execution.reaudit.introduced.length} new finding(s) appeared` : "the rebuilt site's re-audit no longer reports it, and nothing new appeared") : "the re-audit still reports it"]
        : null,
    };
    f.fix.gates = f.fix.gates.map((g) => (outcome[g.key] ? { ...g, status: outcome[g.key][0] ? "pass" : "fail", note: outcome[g.key][1] } : g));
  }
}

/** After a rebase: the agent's one commit touches exactly its own files. */
export function inspectCommitScope({ repoRoot, files }) {
  const names = git(repoRoot, ["diff", "--name-only", "HEAD~1..HEAD"]);
  const changed = names.stdout ? names.stdout.split("\n").filter(Boolean).sort() : [];
  const ok = changed.length === files.length && changed.every((f) => files.includes(f));
  return { ok, changed };
}

export function commitMessage({ config, reportDate, planned }) {
  return [
    `${config.git.commitSubject} (${reportDate})`,
    "",
    `Repaired ${planned.length} deterministic technical issue${planned.length === 1 ? "" : "s"}. Every change`,
    "replaces a URL/path with one that already exists in the repository, or",
    "adds/removes one sitemap entry by the existing convention. No copy,",
    "metadata wording, alt text, schema claim or date was changed.",
    "",
    ...planned.map((f) => `  ${f.id}  ${f.type}  ${f.route ?? f.rootCause ?? ""}`),
    "",
    "Generated by the LVINIT Site Quality Agent (scripts/site-quality). Tests,",
    "TypeScript, ESLint, a production build and a full re-audit all passed.",
    "",
  ].join("\n");
}

/** Run the production build (used by --build and after a trial is reverted). */
export function runBuild({ repoRoot, config, log = () => {} }) {
  // A stale .next under OneDrive can make `next build` fail on readlink; the
  // documented cure is to remove it first. Harmless in CI.
  rmSync(join(repoRoot, ".next"), { recursive: true, force: true });
  log(`  Running ${config.validation.buildCommand.label} ...`);
  const r = runCommand(config.validation.buildCommand, { cwd: repoRoot, timeoutMs: config.validation.timeoutMs });
  log(`    ${r.ok ? "passed" : `FAILED (exit ${r.code})`} in ${(r.durationMs / 1000).toFixed(1)}s`);
  return r;
}
