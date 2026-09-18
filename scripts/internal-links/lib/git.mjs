// ---------------------------------------------------------------------------
// GIT — the commit and push authority, and every precondition on it
//
// This agent is allowed to push link edits to main without asking. The safety
// is not in asking; it is in refusing to proceed unless all of this is true:
//
//   BEFORE editing
//     * we are in a git repository, on the expected branch
//     * the working tree is clean — no half-finished human or Content Publisher
//       work is sitting there to be swept into this commit
//     * origin has been fetched, and the local branch is either level with it
//       or strictly behind it (which can be fast-forwarded)
//
//   BEFORE committing
//     * every path in the diff is inside the allowed prefixes
//     * the diff adds only <Link …> wrappers — no line loses or gains prose
//
//   BEFORE pushing
//     * the remote has not moved since the preflight
//
// Divergence, conflicts, dirty trees and unexpected paths all STOP the run and
// are reported. Nothing is forced, rebased through a conflict, or guessed at.
// ---------------------------------------------------------------------------

import { spawnSync } from "node:child_process";

/** Run git. Never throws; a failure is data. */
export function git(repoRoot, args, { timeoutMs = 60000 } = {}) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: timeoutMs,
    maxBuffer: 32 * 1024 * 1024,
  });
  return {
    ok: result.status === 0,
    code: result.status,
    stdout: (result.stdout ?? "").trim(),
    stderr: (result.stderr ?? "").trim(),
    command: `git ${args.join(" ")}`,
  };
}

/**
 * Everything that must be true before the agent is allowed to touch a file.
 *
 * @returns {{ok:boolean, reason:string|null, state:object}}
 */
export function preflight({ repoRoot, config, fetchRemote = true }) {
  const state = {
    isRepo: false,
    branch: null,
    clean: null,
    dirtyPaths: [],
    head: null,
    remoteHead: null,
    ahead: null,
    behind: null,
    fetched: false,
    fetchError: null,
  };

  const inside = git(repoRoot, ["rev-parse", "--is-inside-work-tree"]);
  if (!inside.ok || inside.stdout !== "true") {
    return { ok: false, reason: "this is not a git working tree, so nothing can be committed", state };
  }
  state.isRepo = true;

  const branch = git(repoRoot, ["rev-parse", "--abbrev-ref", "HEAD"]);
  state.branch = branch.ok ? branch.stdout : null;
  if (state.branch !== config.git.branch) {
    return {
      ok: false,
      reason: `the checkout is on "${state.branch}", not "${config.git.branch}". The agent only ships from its configured branch.`,
      state,
    };
  }

  const status = git(repoRoot, ["status", "--porcelain"]);
  state.clean = status.ok && status.stdout === "";
  // `git()` trims stdout, so the first porcelain line can lose its leading
  // status space. Splitting on whitespace is tolerant of both shapes.
  state.dirtyPaths = status.stdout
    ? status.stdout.split("\n").map((l) => l.trim().split(/\s+/).slice(1).join(" ")).filter(Boolean)
    : [];
  if (!state.clean) {
    return {
      ok: false,
      reason:
        `the working tree is not clean (${state.dirtyPaths.length} changed path(s): ${state.dirtyPaths
          .slice(0, 5)
          .join(", ")}). Someone else's work is in progress, and this agent will not edit around it.`,
      state,
    };
  }

  const head = git(repoRoot, ["rev-parse", "HEAD"]);
  state.head = head.ok ? head.stdout : null;

  if (fetchRemote) {
    const fetched = git(repoRoot, ["fetch", config.git.remote, config.git.branch], { timeoutMs: 120000 });
    state.fetched = fetched.ok;
    if (!fetched.ok) {
      state.fetchError = fetched.stderr || fetched.stdout;
      return {
        ok: false,
        reason: `could not fetch ${config.git.remote}/${config.git.branch} (${state.fetchError}). Without knowing where the remote is, pushing is guessing.`,
        state,
      };
    }
  }

  const remoteRef = `${config.git.remote}/${config.git.branch}`;
  const remoteHead = git(repoRoot, ["rev-parse", remoteRef]);
  state.remoteHead = remoteHead.ok ? remoteHead.stdout : null;

  const counts = git(repoRoot, ["rev-list", "--left-right", "--count", `${remoteRef}...HEAD`]);
  if (counts.ok) {
    const [behind, ahead] = counts.stdout.split(/\s+/).map((n) => Number.parseInt(n, 10));
    state.behind = Number.isFinite(behind) ? behind : null;
    state.ahead = Number.isFinite(ahead) ? ahead : null;
  }

  if (state.ahead > 0 && state.behind > 0) {
    return {
      ok: false,
      reason:
        `the local branch has diverged from ${remoteRef} (${state.ahead} ahead, ${state.behind} behind). ` +
        "Resolving that is a person's job — the agent stops rather than guessing.",
      state,
    };
  }

  if (state.behind > 0) {
    // Strictly behind: a fast-forward is safe and cannot conflict.
    const ff = git(repoRoot, ["merge", "--ff-only", remoteRef]);
    if (!ff.ok) {
      return {
        ok: false,
        reason: `could not fast-forward to ${remoteRef} (${ff.stderr || ff.stdout}). Stopping rather than forcing anything.`,
        state,
      };
    }
    const newHead = git(repoRoot, ["rev-parse", "HEAD"]);
    state.head = newHead.ok ? newHead.stdout : state.head;
    state.fastForwarded = true;
  }

  if (state.ahead > 0) {
    return {
      ok: false,
      reason:
        `the local branch is ${state.ahead} commit(s) ahead of ${remoteRef}. Something unpushed is already here, and ` +
        "this agent will not add to a stack it did not create.",
      state,
    };
  }

  return { ok: true, reason: null, state };
}

/**
 * Inspect the diff the agent has just produced.
 *
 * Two independent checks: every path is one the agent is allowed to touch, and
 * every changed line is an added <Link> wrapper rather than a change to prose.
 */
export function inspectDiff({ repoRoot, config }) {
  const names = git(repoRoot, ["diff", "--name-only"]);
  const paths = names.stdout ? names.stdout.split("\n").filter(Boolean) : [];

  const disallowed = paths.filter(
    (p) => !config.git.allowedPathPrefixes.some((prefix) => p.startsWith(prefix))
  );

  const diff = git(repoRoot, ["diff", "--unified=0"]);
  const removed = [];
  const added = [];
  for (const line of diff.stdout.split("\n")) {
    if (line.startsWith("---") || line.startsWith("+++")) continue;
    if (line.startsWith("-")) removed.push(line.slice(1));
    else if (line.startsWith("+")) added.push(line.slice(1));
  }

  // Every removed line must reappear inside the added lines with <Link> markup
  // wrapped around part of it. If a removed line's text is simply gone, prose
  // was changed and the run is unsafe.
  const strip = (s) => s.replace(/<\/?Link\b[^>]*>/g, "").replace(/\s+/g, "");
  const addedStripped = added.map(strip);
  const orphanedRemovals = removed.filter((line) => {
    const target = strip(line);
    if (!target) return false;
    return !addedStripped.some((a) => a.includes(target));
  });

  return {
    paths,
    disallowed,
    addedLines: added.length,
    removedLines: removed.length,
    orphanedRemovals,
    onlyLinkWrappers: orphanedRemovals.length === 0,
    diff: diff.stdout,
  };
}

/** Build the commit message. */
export function commitMessage({ config, reportDate, candidates }) {
  const subject = config.git.commitIncludeDate
    ? `${config.git.commitSubject} (${reportDate})`
    : config.git.commitSubject;
  const body = [
    "",
    `Added ${candidates.length} contextual internal link${candidates.length === 1 ? "" : "s"} where the source page`,
    "already named the destination's subject in its own words. No published copy",
    "was added, removed or reworded: each change wraps existing text in a <Link>.",
    "",
    ...candidates.map((c) => `  ${c.id}  ${c.from} -> ${c.to}  (anchor: "${c.anchor}")`),
    "",
    "Generated by the LVINIT Internal Linking Agent (scripts/internal-links).",
    "TypeScript, ESLint and a production build all passed against these edits.",
  ];
  return `${subject}\n${body.join("\n")}\n`;
}

/** Stage the agent's paths, commit, and report the hash. */
export function commit({ repoRoot, config, message, paths }) {
  const add = git(repoRoot, ["add", "--", ...paths]);
  if (!add.ok) return { ok: false, reason: add.stderr || add.stdout, hash: null };

  // Staged-only check: nothing outside the agent's paths may be in this commit.
  const staged = git(repoRoot, ["diff", "--cached", "--name-only"]);
  const stagedPaths = staged.stdout ? staged.stdout.split("\n").filter(Boolean) : [];
  const unexpected = stagedPaths.filter((p) => !paths.includes(p));
  if (unexpected.length) {
    git(repoRoot, ["reset", "HEAD", "--", ...unexpected]);
    return {
      ok: false,
      reason: `unexpected paths were staged (${unexpected.join(", ")}); the commit was abandoned`,
      hash: null,
    };
  }

  const result = git(repoRoot, ["commit", "-m", message]);
  if (!result.ok) return { ok: false, reason: result.stderr || result.stdout, hash: null };
  const hash = git(repoRoot, ["rev-parse", "HEAD"]);
  return { ok: true, reason: null, hash: hash.ok ? hash.stdout : null };
}

/**
 * Push, after re-checking that the remote has not moved since the preflight.
 * Never forced. If the remote moved, the commit stays local and is reported.
 */
export function push({ repoRoot, config, expectedRemoteHead }) {
  const remoteRef = `${config.git.remote}/${config.git.branch}`;
  const refetch = git(repoRoot, ["fetch", config.git.remote, config.git.branch], { timeoutMs: 120000 });
  if (!refetch.ok) {
    return { ok: false, pushed: false, reason: `could not re-fetch before pushing (${refetch.stderr || refetch.stdout})` };
  }
  const now = git(repoRoot, ["rev-parse", remoteRef]);
  if (now.ok && expectedRemoteHead && now.stdout !== expectedRemoteHead) {
    return {
      ok: false,
      pushed: false,
      reason:
        `${remoteRef} moved from ${expectedRemoteHead.slice(0, 8)} to ${now.stdout.slice(0, 8)} while this run was ` +
        "working. The commit is on disk but was not pushed — rerun when the branch is quiet.",
    };
  }
  // A plain push. No --force, no --force-with-lease, no lease override: if the
  // remote will not take this as a fast-forward, the push fails and is reported.
  const result = git(repoRoot, ["push", config.git.remote, `HEAD:${config.git.branch}`]);
  if (!result.ok) return { ok: false, pushed: false, reason: result.stderr || result.stdout };
  return { ok: true, pushed: true, reason: null };
}

/** Undo a commit this run created, leaving the working tree clean. */
export function undoCommit(repoRoot) {
  return git(repoRoot, ["reset", "--hard", "HEAD~1"]);
}

/** Throw away uncommitted changes to specific paths. */
export function discardChanges(repoRoot, paths) {
  if (paths.length === 0) return { ok: true };
  return git(repoRoot, ["checkout", "--", ...paths]);
}
