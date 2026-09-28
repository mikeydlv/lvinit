// ---------------------------------------------------------------------------
// DELIVER — every Sunday leaves an obvious result, success or failure
//
//   1. local file   <LVINIT repo>\reports\weekly-content\<Monday>-weekly-content-plan.md
//                   (or …-FAILED.md) + LATEST.md, which always names the newest week
//   2. GitHub       the same files on lvinit-agent-state → reports/weekly-content/
//                   (readable from a phone; the Monday watchdog checks it)
//   3. email        Resend, same account and recipient as the Executive Producer
//   4. toast        Windows notification on the PC
//
// The state-branch push follows the shared rules in docs/AGENT_STATE_BRANCH.md:
// only refs/heads/lvinit-agent-state, only this agent's namespace, a throwaway
// worktree so Mikey's checkout is untouched, one rebase-and-retry.
// ---------------------------------------------------------------------------

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { homedir } from "node:os";

export const NAMESPACE = "weekly-content";
export const STATE_BRANCH = "lvinit-agent-state";
export const GITHUB_WEB = "https://github.com/mikeydlv/lvinit/blob/lvinit-agent-state/reports/weekly-content";

function git(cwd, args) {
  return execFileSync("git", ["-C", cwd, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

export function assertNamespace(paths) {
  const ok = [`reports/${NAMESPACE}/`, `data/${NAMESPACE}/`];
  const bad = paths.filter((p) => !ok.some((a) => p.replace(/\\/g, "/").startsWith(a)));
  if (bad.length) throw new Error(`Refusing to commit outside the ${NAMESPACE} namespace: ${bad.join(", ")}`);
}

/** files: [{ rel: "reports/weekly-content/x.md", content }] */
export function pushToStateBranch({ repo, files, message, log = console.log, run = git, worktree = join(homedir(), ".lvinit", "weekly-publisher", "state-worktree") }) {
  assertNamespace(files.map((f) => f.rel));
  const cleanup = () => {
    try {
      run(repo, ["worktree", "remove", "--force", worktree]);
    } catch {
      /* not registered */
    }
    if (existsSync(worktree)) rmSync(worktree, { recursive: true, force: true });
    try {
      run(repo, ["worktree", "prune"]);
    } catch {
      /* nothing to prune */
    }
  };
  cleanup();
  run(repo, ["fetch", "origin", STATE_BRANCH]);
  mkdirSync(dirname(worktree), { recursive: true });
  run(repo, ["worktree", "add", "--detach", worktree, `origin/${STATE_BRANCH}`]);
  try {
    for (const f of files) {
      const abs = join(worktree, f.rel);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, f.content);
    }
    run(worktree, ["add", "--", ...files.map((f) => f.rel)]);
    const staged = run(worktree, ["diff", "--cached", "--name-only"]).split("\n").filter(Boolean);
    if (!staged.length) return { pushed: false, reason: "no changes" };
    assertNamespace(staged);
    run(worktree, ["-c", "user.name=LVINIT Weekly Publisher", "-c", "user.email=weekly-publisher@lvinit.com", "commit", "-m", message]);
    try {
      run(worktree, ["push", "origin", `HEAD:refs/heads/${STATE_BRANCH}`]);
    } catch {
      log("Push rejected (another agent pushed first). Rebasing once and retrying.");
      run(worktree, ["fetch", "origin", STATE_BRANCH]);
      run(worktree, ["rebase", `origin/${STATE_BRANCH}`]);
      run(worktree, ["push", "origin", `HEAD:refs/heads/${STATE_BRANCH}`]);
    }
    return { pushed: true, sha: run(worktree, ["rev-parse", "--short", "HEAD"]) };
  } finally {
    cleanup();
  }
}

export function writeLocal(outDir, files) {
  mkdirSync(outDir, { recursive: true });
  for (const [name, content] of Object.entries(files)) writeFileSync(join(outDir, name), content);
}
