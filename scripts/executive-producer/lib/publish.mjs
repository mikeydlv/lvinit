// ---------------------------------------------------------------------------
// PUBLISH — push the sanitized catalog to lvinit-agent-state, from the PC
//
// The GitHub Action (.github/actions/agent-state) does this for CI agents. The
// cataloger runs on Mikey's PC, so this is the local equivalent, with the same
// locks:
//
//   * pushes only to refs/heads/lvinit-agent-state, never main
//   * works in a throwaway git worktree, so Mikey's checkout is untouched
//   * stages only the named files, and refuses to commit if anything outside
//     data/executive-producer/ or reports/executive-producer/ is staged
//   * if another agent pushed first, rebases once and retries (namespaces never
//     overlap, so the rebase cannot conflict)
//
// Uses Mikey's normal git credentials. No token is read or stored here.
// ---------------------------------------------------------------------------

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";

import { AGENT } from "../config.mjs";

function git(cwd, args, opts = {}) {
  return execFileSync("git", ["-C", cwd, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], ...opts }).trim();
}

export function assertAllowedPaths(paths, namespace = AGENT) {
  const allowed = [`data/${namespace}/`, `reports/${namespace}/`];
  const bad = paths.filter((p) => !allowed.some((a) => p.replace(/\\/g, "/").startsWith(a)));
  if (bad.length) throw new Error(`Refusing to commit outside the ${namespace} namespace: ${bad.join(", ")}`);
}

export function pushToStateBranch({ repoRoot, config, files, message, log = console.log, run = git }) {
  const { branch, remote } = config.state;
  if (branch !== "lvinit-agent-state") throw new Error(`Refusing to push to "${branch}". Only lvinit-agent-state is allowed.`);
  assertAllowedPaths(files.map((f) => f.rel));

  const dir = config.local.stateWorktree;
  const cleanup = () => {
    try {
      run(repoRoot, ["worktree", "remove", "--force", dir]);
    } catch {
      /* not registered */
    }
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
    try {
      run(repoRoot, ["worktree", "prune"]);
    } catch {
      /* nothing to prune */
    }
  };

  cleanup();
  run(repoRoot, ["fetch", remote, branch]);
  mkdirSync(dirname(dir), { recursive: true });
  run(repoRoot, ["worktree", "add", "--detach", dir, `${remote}/${branch}`]);
  try {
    for (const f of files) {
      const abs = join(dir, f.rel);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, f.content);
    }
    run(dir, ["add", "--", ...files.map((f) => f.rel)]);
    const staged = run(dir, ["diff", "--cached", "--name-only"]).split("\n").filter(Boolean);
    if (!staged.length) {
      log("State branch already has this catalog. Nothing to push.");
      return { pushed: false, reason: "no changes" };
    }
    assertAllowedPaths(staged);
    run(dir, ["commit", "-m", message]);
    try {
      run(dir, ["push", remote, `HEAD:refs/heads/${branch}`]);
    } catch {
      log("Push was rejected (another agent pushed first). Rebasing once and retrying.");
      run(dir, ["fetch", remote, branch]);
      run(dir, ["rebase", `${remote}/${branch}`]);
      run(dir, ["push", remote, `HEAD:refs/heads/${branch}`]);
    }
    const sha = run(dir, ["rev-parse", "--short", "HEAD"]);
    log(`Pushed ${staged.length} file(s) to ${branch} (${sha}).`);
    return { pushed: true, sha, files: staged };
  } finally {
    cleanup();
  }
}
