// The runner's command-line surface: flag parsing, the config overrides those
// flags produce, report history discovery, and the end-to-end dry run against
// the fixture site.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { parseArgs, overridesFromArgs, readPreviousReports, formatISODate, run } from "../run.mjs";
import { loadConfig } from "../config.mjs";

test("flags parse, including repeats and values", () => {
  const args = parseArgs(["--apply", "--max-links=3", "--route=/a", "--route=/b", "--no-push"]);
  assert.equal(args.apply, true);
  assert.equal(args["max-links"], "3");
  assert.deepEqual(args.route, ["/a", "/b"]);
  assert.equal(args["no-push"], true);
});

test("--no-push and --no-commit switch off shipping without touching anything else", () => {
  const config = loadConfig(overridesFromArgs(parseArgs(["--no-push"])));
  assert.equal(config.git.push, false);
  assert.equal(config.git.commit, true, "the commit still happens; only the push is held");

  const noCommit = loadConfig(overridesFromArgs(parseArgs(["--no-commit"])));
  assert.equal(noCommit.git.commit, false);
});

test("run limits and the confidence line are settable from the command line", () => {
  const config = loadConfig(
    overridesFromArgs(parseArgs(["--max-links=3", "--max-pages=2", "--min-confidence=0.9"]))
  );
  assert.equal(config.limits.maxLinksAddedPerRun, 3);
  assert.equal(config.limits.maxPagesModifiedPerRun, 2);
  assert.equal(config.relevance.autoExecuteMinConfidence, 0.9);
});

test("--no-gsc and --no-fact-decay switch the optional signals off", () => {
  const config = loadConfig(overridesFromArgs(parseArgs(["--no-gsc", "--no-fact-decay"])));
  assert.equal(config.gsc.enabled, false);
  assert.equal(config.factDecay.enabled, false);
});

test("LINKS_GIT_PUSH is the documented kill switch for autonomous pushing", async () => {
  const previous = process.env.LINKS_GIT_PUSH;
  process.env.LINKS_GIT_PUSH = "false";
  try {
    // config.mjs reads env at module load, so re-import it fresh.
    const fresh = await import(`../config.mjs?kill-switch=${Date.now()}`);
    assert.equal(fresh.loadConfig().git.push, false);
  } finally {
    if (previous === undefined) delete process.env.LINKS_GIT_PUSH;
    else process.env.LINKS_GIT_PUSH = previous;
  }
});

test("previous reports are read newest-last, and the current date is excluded", () => {
  const dir = mkdtempSync(join(tmpdir(), "lvinit-links-reports-"));
  try {
    mkdirSync(dir, { recursive: true });
    for (const date of ["2026-09-03", "2026-09-10", "2026-09-17"]) {
      writeFileSync(
        join(dir, `internal-links-${date}.json`),
        JSON.stringify({ reportDate: date, autoExecuted: [], needsReview: [] }),
        "utf8"
      );
    }
    writeFileSync(join(dir, "internal-links-broken.json"), "{ not json", "utf8");
    const reports = readPreviousReports(dir, { limit: 12, excludeDate: "2026-09-17" });
    assert.deepEqual(
      reports.map((r) => r.reportDate),
      ["2026-09-03", "2026-09-10"]
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a malformed previous report is skipped rather than failing the run", () => {
  const dir = mkdtempSync(join(tmpdir(), "lvinit-links-reports-"));
  try {
    writeFileSync(join(dir, "internal-links-2026-09-10.json"), "{{{", "utf8");
    assert.deepEqual(readPreviousReports(dir, {}), []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("formatISODate is a plain UTC date", () => {
  assert.equal(formatISODate(new Date("2026-09-17T23:30:00Z")), "2026-09-17");
});

test("a fixture run writes both reports, changes nothing, and stays a dry run", async () => {
  const out = mkdtempSync(join(tmpdir(), "lvinit-links-out-"));
  const lines = [];
  try {
    const result = await run(["--fixtures", "--today=2026-09-17", `--out=${out}`], {
      log: (line) => lines.push(String(line)),
      errorLog: (line) => lines.push(String(line)),
    });
    assert.equal(result.exitCode, 0);
    assert.equal(result.analysis.mode, "dry-run");
    assert.equal(result.json.fixtureData, true);
    assert.ok(existsSync(join(out, "internal-links-2026-09-17.md")));
    assert.ok(existsSync(join(out, "internal-links-2026-09-17.json")));

    // The fixture is built so that exactly one link is safe, and the other two
    // candidates are refused for the two compliance reasons.
    assert.equal(result.analysis.autoExecuted.length, 1);
    assert.equal(result.analysis.autoExecuted[0].to, "/guides/ridgeway-commons");
    const reasons = result.analysis.needsReview.flatMap((c) => c.blockers.map((b) => b.code));
    assert.ok(reasons.includes("FAIR_HOUSING_REVIEW"));
    assert.ok(reasons.includes("COMPLIANCE_COPY"));

    // A dry run applies nothing, whatever it found.
    assert.equal(result.analysis.execution.editsApplied, 0);
    assert.equal(result.analysis.execution.committed, false);
    assert.equal(result.analysis.execution.pushed, false);
    assert.ok(lines.join("\n").includes("FIXTURE RUN"));

    const md = readFileSync(join(out, "internal-links-2026-09-17.md"), "utf8");
    assert.match(md, /Nothing was written, committed or pushed/);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test("--apply is ignored for a fixture run, because there is nothing real to edit", async () => {
  const out = mkdtempSync(join(tmpdir(), "lvinit-links-out-"));
  try {
    const result = await run(["--fixtures", "--apply", "--today=2026-09-17", `--out=${out}`], { log: () => {} });
    assert.equal(result.analysis.mode, "dry-run");
    assert.equal(result.analysis.execution.editsApplied, 0);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test("--help prints and does nothing else", async () => {
  const lines = [];
  const result = await run(["--help"], { log: (l) => lines.push(String(l)) });
  assert.equal(result.exitCode, 0);
  assert.equal(result.analysis, undefined);
  assert.match(lines.join("\n"), /LINKS_GIT_PUSH=false/);
});
