// End to end: applying edits to a real temp tree, the failed-build rollback,
// git divergence safety, the diff inspector, and both report formats.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { applyEdits, restore, classAttrFor } from "../lib/apply.mjs";
import { runCommand, runValidation, tailOutput } from "../lib/verify.mjs";
import { preflight, inspectDiff, commitMessage, git } from "../lib/git.mjs";
import { analyze } from "../lib/analyze.mjs";
import { buildMarkdownReport, buildJsonReport, PROHIBITED_ACTIONS } from "../lib/report.mjs";
import { findPhraseOccurrences, readPageProse } from "../lib/opportunities.mjs";
import { buildFixtureGraph } from "../fixtures/fixture-site.mjs";
import {
  graphFrom,
  testConfig,
  storyPage,
  section,
  neutralGsc,
  permissiveFactDecay,
  TODAY,
} from "./helpers.mjs";

const PARAGRAPH =
  "Henderson is not one master plan. The Water Street District is Henderson&rsquo;s historic downtown, with older bones than any of the newer master-planned areas on either side of the valley.";

function scratchRepo() {
  const root = mkdtempSync(join(tmpdir(), "lvinit-links-repo-"));
  const file = "app/guides/summerlin-vs-henderson/page.tsx";
  mkdirSync(join(root, "app/guides/summerlin-vs-henderson"), { recursive: true });
  const source = storyPage(section("One master plan vs a dozen", PARAGRAPH));
  writeFileSync(join(root, file), source, "utf8");
  return { root, file, source, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

/** The candidate the agent would produce for the fixture paragraph. */
function candidateFor({ file, source, to = "/guides/water-street-district-henderson" }) {
  const config = testConfig();
  const page = {
    route: "/guides/summerlin-vs-henderson",
    documents: [{ file, absolute: file, role: "page", source }],
  };
  const prose = readPageProse(page, config);
  const hit = findPhraseOccurrences(prose.code, "Water Street District")[0];
  return {
    id: "LINK-2026-09-17-001",
    fingerprint: "abc123abc123",
    from: "/guides/summerlin-vs-henderson",
    to,
    file,
    anchor: hit.text,
    start: hit.start,
    end: hit.end,
    line: prose.lineOf(hit.start),
    linkClass: prose.linkClass,
  };
}

test("applying an edit writes the link and leaves the copy untouched", () => {
  const { root, file, source, cleanup } = scratchRepo();
  try {
    const candidate = candidateFor({ file, source });
    const result = applyEdits({
      repoRoot: root,
      candidates: [candidate],
      config: testConfig(),
      existingRoutes: new Set(["/guides/water-street-district-henderson"]),
    });
    assert.equal(result.applied.length, 1, JSON.stringify(result.failed));
    const after = readFileSync(join(root, file), "utf8");
    assert.ok(
      after.includes(
        '<Link href="/guides/water-street-district-henderson" className={linkCls}>Water Street District</Link>'
      )
    );
    assert.equal(after.replace(/<\/?Link[^>]*>/g, ""), source);
    assert.equal(result.applied[0].validation.destinationResolves, true);
  } finally {
    cleanup();
  }
});

test("an edit to a destination that does not exist is refused, and the file is untouched", () => {
  const { root, file, source, cleanup } = scratchRepo();
  try {
    const candidate = candidateFor({ file, source, to: "/guides/does-not-exist" });
    const result = applyEdits({
      repoRoot: root,
      candidates: [candidate],
      config: testConfig(),
      existingRoutes: new Set(["/guides/water-street-district-henderson"]),
    });
    assert.equal(result.applied.length, 0);
    assert.match(result.failed[0].reason, /does not resolve/);
    assert.equal(readFileSync(join(root, file), "utf8"), source);
  } finally {
    cleanup();
  }
});

test("restore puts every touched file back exactly as it was", () => {
  const { root, file, source, cleanup } = scratchRepo();
  try {
    const candidate = candidateFor({ file, source });
    const { snapshots } = applyEdits({
      repoRoot: root,
      candidates: [candidate],
      config: testConfig(),
      existingRoutes: new Set(["/guides/water-street-district-henderson"]),
    });
    assert.notEqual(readFileSync(join(root, file), "utf8"), source);
    restore(root, snapshots);
    assert.equal(readFileSync(join(root, file), "utf8"), source, "the rollback is byte exact");
  } finally {
    cleanup();
  }
});

test("a failing validation command is reported as data, not thrown", () => {
  const config = testConfig({
    validation: {
      commands: [{ key: "fail", label: "Deliberate failure", argv: ["node", "-e", "process.exit(3)"] }],
    },
  });
  const result = runValidation({ repoRoot: process.cwd(), config });
  assert.equal(result.ok, false);
  assert.equal(result.failed.code, 3);
  assert.equal(result.failed.label, "Deliberate failure");
});

test("validation stops at the first failure and never runs the rest", () => {
  const config = testConfig({
    validation: {
      commands: [
        { key: "fail", label: "First", argv: ["node", "-e", "process.exit(1)"] },
        { key: "never", label: "Second", argv: ["node", "-e", "console.log('ran')"] },
      ],
    },
  });
  const result = runValidation({ repoRoot: process.cwd(), config });
  assert.equal(result.results.length, 1, "the expensive build is never reached after a type error");
});

test("skipped validation is reported as skipped, and says nothing may ship", () => {
  const result = runValidation({ repoRoot: process.cwd(), config: testConfig({ validation: { skip: true } }) });
  assert.equal(result.skipped, true);
  assert.match(result.note, /no edit may be committed/);
});

test("runCommand captures output and exit code", () => {
  const result = runCommand(
    { key: "echo", label: "Echo", argv: ["node", "-e", "console.log('hello from the check')"] },
    { cwd: process.cwd(), timeoutMs: 30000 }
  );
  assert.equal(result.ok, true);
  assert.match(result.output, /hello from the check/);
  assert.match(tailOutput(result.output, 1), /hello/);
});

// --- Git -------------------------------------------------------------------

function initRepo() {
  const root = mkdtempSync(join(tmpdir(), "lvinit-links-git-"));
  const run = (...args) => spawnSync("git", args, { cwd: root, encoding: "utf8" });
  run("init", "-b", "main");
  run("config", "user.email", "test@example.com");
  run("config", "user.name", "Test");
  mkdirSync(join(root, "app/guides/x"), { recursive: true });
  writeFileSync(join(root, "app/guides/x/page.tsx"), storyPage(section("One", PARAGRAPH)), "utf8");
  run("add", ".");
  run("commit", "-m", "initial");
  return { root, run, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

test("the preflight refuses a dirty working tree", () => {
  const { root, cleanup } = initRepo();
  try {
    writeFileSync(join(root, "app/guides/x/page.tsx"), "// someone else is mid-edit\n", "utf8");
    const result = preflight({ repoRoot: root, config: testConfig(), fetchRemote: false });
    assert.equal(result.ok, false);
    assert.match(result.reason, /not clean/);
    assert.ok(result.state.dirtyPaths.includes("app/guides/x/page.tsx"), "the path is parsed correctly");
  } finally {
    cleanup();
  }
});

test("the preflight refuses the wrong branch", () => {
  const { root, run, cleanup } = initRepo();
  try {
    run("checkout", "-b", "some-other-branch");
    const result = preflight({ repoRoot: root, config: testConfig(), fetchRemote: false });
    assert.equal(result.ok, false);
    assert.match(result.reason, /some-other-branch/);
  } finally {
    cleanup();
  }
});

test("the preflight refuses a tree that is ahead of the remote", () => {
  const { root, run, cleanup } = initRepo();
  const remote = mkdtempSync(join(tmpdir(), "lvinit-links-remote-"));
  try {
    spawnSync("git", ["init", "--bare", "-b", "main", remote], { encoding: "utf8" });
    run("remote", "add", "origin", remote);
    run("push", "origin", "main");
    writeFileSync(join(root, "app/guides/x/extra.txt"), "unpushed work\n", "utf8");
    run("add", ".");
    run("commit", "-m", "an unpushed commit");
    const result = preflight({ repoRoot: root, config: testConfig(), fetchRemote: true });
    assert.equal(result.ok, false);
    assert.match(result.reason, /ahead of/);
  } finally {
    cleanup();
    rmSync(remote, { recursive: true, force: true });
  }
});

test("a clean tree on the right branch passes the preflight", () => {
  const { root, cleanup } = initRepo();
  try {
    const result = preflight({ repoRoot: root, config: testConfig(), fetchRemote: false });
    assert.equal(result.ok, true, result.reason);
    assert.equal(result.state.branch, "main");
    assert.equal(result.state.clean, true);
  } finally {
    cleanup();
  }
});

test("the diff inspector accepts an added Link and rejects a reworded sentence", () => {
  const { root, cleanup } = initRepo();
  const config = testConfig();
  try {
    const file = join(root, "app/guides/x/page.tsx");
    const original = readFileSync(file, "utf8");

    writeFileSync(
      file,
      original.replace(
        "Water Street District",
        '<Link href="/guides/w" className={linkCls}>Water Street District</Link>'
      ),
      "utf8"
    );
    const good = inspectDiff({ repoRoot: root, config });
    assert.equal(good.onlyLinkWrappers, true, "wrapping existing words passes");
    assert.deepEqual(good.disallowed, [], "app/ is an allowed path");

    writeFileSync(file, original.replace("historic downtown", "the very best downtown"), "utf8");
    const bad = inspectDiff({ repoRoot: root, config });
    assert.equal(bad.onlyLinkWrappers, false, "rewording published copy is caught");
    assert.ok(bad.orphanedRemovals.length > 0);
  } finally {
    cleanup();
  }
});

test("the diff inspector rejects a path outside the allowed prefixes", () => {
  const { root, run, cleanup } = initRepo();
  try {
    writeFileSync(join(root, "README.md"), "# readme\n", "utf8");
    run("add", ".");
    run("commit", "-m", "add readme");
    writeFileSync(join(root, "README.md"), "# readme, edited\n", "utf8");
    const result = inspectDiff({ repoRoot: root, config: testConfig() });
    assert.deepEqual(result.disallowed, ["README.md"]);
  } finally {
    cleanup();
  }
});

test("git() returns failures as data rather than throwing", () => {
  const { root, cleanup } = initRepo();
  try {
    const result = git(root, ["rev-parse", "refs/heads/not-a-branch"]);
    assert.equal(result.ok, false);
    assert.ok(result.stderr.length > 0);
  } finally {
    cleanup();
  }
});

test("the commit message names every link and never mixes in other work", () => {
  const message = commitMessage({
    config: testConfig(),
    reportDate: TODAY,
    candidates: [
      { id: "LINK-2026-09-17-001", from: "/a", to: "/b", anchor: "Water Street District" },
      { id: "LINK-2026-09-17-002", from: "/c", to: "/d", anchor: "new build" },
    ],
  });
  assert.match(message, /^chore: improve LVINIT internal linking \(2026-09-17\)/);
  assert.match(message, /LINK-2026-09-17-001\s+\/a -> \/b/);
  assert.match(message, /LINK-2026-09-17-002/);
  assert.match(message, /No published copy/);
});

// --- Reports ---------------------------------------------------------------

function fixtureAnalysis(configOverrides = {}) {
  const config = testConfig(configOverrides);
  const graph = buildFixtureGraph({ config, today: TODAY });
  const analysis = analyze({
    graph,
    config,
    reportDate: TODAY,
    gscSignal: neutralGsc,
    factDecaySignal: permissiveFactDecay,
    previousReports: [],
    mode: "dry-run",
  });
  analysis.execution = {
    attempted: false,
    editsApplied: 0,
    editsFailed: [],
    validation: { summary: "not run", results: [], skipped: false, failed: null },
    diff: null,
    committed: false,
    commitHash: null,
    pushAttempted: false,
    pushed: false,
    pushReason: null,
    reverted: false,
    fatal: null,
    preflight: null,
  };
  return { analysis, config };
}

test("the Markdown report has every required section", () => {
  const { analysis, config } = fixtureAnalysis();
  const md = buildMarkdownReport({ analysis, config, meta: { dataSource: "fixture", origin: "https://www.lvinit.com" } });
  for (const heading of [
    "## Run summary",
    "## Auto-executed",
    "## Needs review",
    "## Orphans and weakly linked pages",
    "## Validation",
    "## What this agent will never do",
  ]) {
    assert.ok(md.includes(heading), `${heading} is present`);
  }
  assert.match(md, /Pages scanned \| 5/);
  assert.match(md, /FIXTURE RUN/, "a fixture report says so on its face");
});

test("the JSON report carries the fingerprints and the configuration it ran with", () => {
  const { analysis, config } = fixtureAnalysis();
  const json = buildJsonReport({
    analysis,
    config,
    meta: { dataSource: "fixture", origin: "https://www.lvinit.com" },
  });
  assert.equal(json.agent, "lvinit-internal-linking-agent");
  assert.equal(json.reportDate, TODAY);
  assert.equal(json.fixtureData, true);
  assert.equal(json.configuration.limits.maxLinksAddedPerRun, config.limits.maxLinksAddedPerRun);
  assert.ok(Array.isArray(json.graph.nodes) && json.graph.nodes.length === 5);
  assert.deepEqual(json.prohibited, PROHIBITED_ACTIONS);
  for (const item of [...json.autoExecuted, ...json.needsReview]) {
    assert.match(item.id, /^LINK-\d{4}-\d{2}-\d{2}-\d{3}$/);
    assert.equal(item.fingerprint.length, 12);
    assert.ok(item.proposedEdit, "a dry run still shows exactly what it would write");
  }
});

test("the report says plainly when nothing cleared the gates", () => {
  const config = testConfig({ relevance: { autoExecuteMinConfidence: 0.99 } });
  const graph = graphFrom(
    [
      {
        route: "/guides/a",
        title: "A",
        publishedAt: "2026-01-01",
        source: storyPage(section("x", "Nothing here relates to anything else in this tiny synthetic site at all.")),
      },
    ],
    config
  );
  const analysis = analyze({
    graph,
    config,
    reportDate: TODAY,
    gscSignal: neutralGsc,
    factDecaySignal: permissiveFactDecay,
    mode: "dry-run",
  });
  analysis.execution = fixtureAnalysis().analysis.execution;
  const md = buildMarkdownReport({ analysis, config, meta: { dataSource: "fixture", origin: "x" } });
  assert.match(md, /That is a real answer, not an empty report/);
});

test("the report never claims a bridge sentence was written", () => {
  const { analysis, config } = fixtureAnalysis({ relevance: { autoExecuteMinConfidence: 0.3 } });
  const md = buildMarkdownReport({ analysis, config, meta: { dataSource: "fixture", origin: "x" } });
  if (analysis.autoExecuted.length > 0) {
    assert.match(md, /\*\*Bridge sentence added\*\*: no/);
  }
  assert.ok(
    PROHIBITED_ACTIONS.some((a) => a.includes("bridge sentence")),
    "the prohibition is stated in every report"
  );
});

test("classAttrFor matches the page's own convention", () => {
  const config = testConfig();
  assert.equal(classAttrFor({ linkClass: { expression: "linkCls" } }, config), "className={linkCls}");
});
