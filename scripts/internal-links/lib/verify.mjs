// ---------------------------------------------------------------------------
// VALIDATION — the repository's own checks, run against the edited tree
//
// The agent does not get to decide its edits are fine. The repository does:
// TypeScript, ESLint, and a real production build, in that order, each of which
// must exit 0. The order is cheapest-first, so a broken edit fails in seconds
// rather than after a full Next.js build.
//
// A non-zero exit from any of them means the edits are reverted and nothing is
// committed. There is no override.
// ---------------------------------------------------------------------------

import { spawnSync } from "node:child_process";

/**
 * Run one command. Never throws — a failure is data, not an exception.
 *
 * @returns {{key:string, label:string, command:string, ok:boolean, code:number|null,
 *            durationMs:number, output:string}}
 */
export function runCommand({ key, label, argv }, { cwd, timeoutMs, env = process.env }) {
  const started = Date.now();
  const [bin, ...args] = argv;
  // npm, npx and yarn are .cmd shims on Windows and cannot be spawned directly.
  // Everything else is spawned without a shell, which keeps arguments exactly
  // as written instead of handing them to cmd.exe to re-quote.
  const needsShell = process.platform === "win32" && /^(npm|npx|yarn|pnpm)$/.test(bin);
  const result = spawnSync(bin, args, {
    cwd,
    timeout: timeoutMs,
    encoding: "utf8",
    shell: needsShell,
    env: { ...env, CI: "1", FORCE_COLOR: "0" },
    maxBuffer: 32 * 1024 * 1024,
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  return {
    key,
    label,
    command: argv.join(" "),
    ok: result.status === 0,
    code: result.status,
    signal: result.signal ?? null,
    durationMs: Date.now() - started,
    output,
  };
}

/**
 * Run every configured validation command, stopping at the first failure.
 *
 * @returns {{ok:boolean, results:Array, failed:object|null, skipped:boolean}}
 */
export function runValidation({ repoRoot, config, log = () => {} }) {
  if (config.validation.skip) {
    return {
      ok: true,
      skipped: true,
      results: [],
      failed: null,
      note: "validation was skipped by configuration — no edit may be committed from a run in this state",
    };
  }

  const results = [];
  for (const command of config.validation.commands) {
    log(`  Running ${command.label} (${command.argv.join(" ")}) ...`);
    const result = runCommand(command, { cwd: repoRoot, timeoutMs: config.validation.timeoutMs });
    results.push(result);
    log(`    ${result.ok ? "passed" : `FAILED (exit ${result.code})`} in ${(result.durationMs / 1000).toFixed(1)}s`);
    if (!result.ok) return { ok: false, skipped: false, results, failed: result };
  }
  return { ok: true, skipped: false, results, failed: null };
}

/** The last N lines of a command's output, for the report. */
export function tailOutput(output, lines = 40) {
  return String(output ?? "").split("\n").slice(-lines).join("\n");
}
