// ---------------------------------------------------------------------------
// GIT — commit only the run's own files and push safely
//
// The daily job runs in its own worktree (%USERPROFILE%\.lvinit\image-library\repo)
// that follows origin/main; nobody edits it. Rules:
//
//   - stage ONLY the intended paths; refuse if anything else is staged/dirty
//   - never force-push, never reset someone else's work
//   - if origin/main moved: fetch, rebase the one image commit (it only adds new
//     files and updates the index this agent alone writes), push again
//   - a rebase conflict aborts cleanly and fails the run
//   - an unpushed commit from an earlier failed push is retried before new work
// ---------------------------------------------------------------------------

import { execFileSync } from "node:child_process";

export function git(repo, args, { allowFail = false, env } = {}) {
  try {
    return execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env: env ? { ...process.env, ...env } : process.env }).trim();
  } catch (e) {
    if (allowFail) return null;
    throw new Error(`git ${args.join(" ")} failed: ${String(e.stderr || e.message).trim().slice(-400)}`);
  }
}

/** Paths that differ from HEAD (staged, unstaged or untracked). */
export function dirtyPaths(repo) {
  const out = git(repo, ["status", "--porcelain", "--untracked-files=all"]);
  return out ? out.split("\n").map((l) => l.slice(3).replace(/^"|"$/g, "")) : [];
}

export function unpushed(repo, { remote, branch }) {
  const out = git(repo, ["rev-list", `${remote}/${branch}..HEAD`], { allowFail: true });
  return out ? out.split("\n").filter(Boolean) : [];
}

/** Bring the worktree to origin/main, unless it holds an unpushed commit or local changes. */
export function syncToRemote(repo, cfg) {
  git(repo, ["fetch", "--quiet", cfg.remote, cfg.branch]);
  const pending = unpushed(repo, cfg);
  if (pending.length) return { synced: false, pending };
  const dirty = dirtyPaths(repo);
  if (dirty.length) throw new Error(`The image-library worktree has unexpected changes: ${dirty.slice(0, 5).join(", ")}. Not touching them.`);
  git(repo, ["checkout", "--quiet", "--detach", `${cfg.remote}/${cfg.branch}`]);
  return { synced: true, head: git(repo, ["rev-parse", "--short", "HEAD"]) };
}

/** Stage exactly `paths` and commit. Throws if anything else would be included. */
export function commitExactly(repo, paths, message, cfg) {
  const intended = new Set(paths.map((p) => p.replace(/\\/g, "/")));
  const dirty = dirtyPaths(repo);
  const stray = dirty.filter((p) => !intended.has(p));
  if (stray.length) throw new Error(`Refusing to commit: unrelated changes present (${stray.slice(0, 5).join(", ")}).`);
  git(repo, ["add", "--", ...intended]);
  const staged = git(repo, ["diff", "--cached", "--name-only"]).split("\n").filter(Boolean);
  const extra = staged.filter((p) => !intended.has(p));
  if (extra.length) throw new Error(`Refusing to commit: unexpected staged files (${extra.join(", ")}).`);
  if (!staged.length) throw new Error("Nothing staged to commit.");
  const env = { GIT_AUTHOR_NAME: cfg.authorName, GIT_AUTHOR_EMAIL: cfg.authorEmail, GIT_COMMITTER_NAME: cfg.authorName, GIT_COMMITTER_EMAIL: cfg.authorEmail };
  git(repo, ["commit", "--quiet", "-m", message], { env });
  return { commit: git(repo, ["rev-parse", "HEAD"]), files: staged };
}

/** Push HEAD to main; on rejection rebase onto the new origin/main and retry. Never forces. */
export function pushSafely(repo, cfg, { attempts = 3 } = {}) {
  let lastErr = null;
  for (let i = 0; i < attempts; i++) {
    const ok = git(repo, ["push", "--quiet", cfg.remote, `HEAD:refs/heads/${cfg.branch}`], { allowFail: true });
    if (ok !== null) return { pushed: true, commit: git(repo, ["rev-parse", "HEAD"]), attempts: i + 1 };
    lastErr = "push rejected";
    git(repo, ["fetch", "--quiet", cfg.remote, cfg.branch]);
    const rebased = git(repo, ["rebase", "--quiet", `${cfg.remote}/${cfg.branch}`], { allowFail: true });
    if (rebased === null) {
      git(repo, ["rebase", "--abort"], { allowFail: true });
      return { pushed: false, error: "origin/main moved and the image commit could not be rebased cleanly (conflict). Nothing was pushed." };
    }
  }
  return { pushed: false, error: `${lastErr} after ${attempts} attempts` };
}
