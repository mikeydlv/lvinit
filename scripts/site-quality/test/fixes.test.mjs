// Safe auto-fix planning, the diff inspector, and the execution safety model:
// trial always reverts, dirty trees are refused, validation or re-audit
// failure reverts, apply is off by default, and a moving remote is handled
// without ever forcing anything.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { site, healthySite, testConfig, gitify, g, TODAY, neutralGsc } from "./helpers.mjs";
import { buildInventory } from "../lib/inventory.mjs";
import { analyze } from "../lib/audit.mjs";
import { buildHistory } from "../lib/history.mjs";
import { planFix, parseSitemapEntries } from "../lib/fixes.mjs";
import { applyEditsToText, inspectFixDiff, applyPlanned, executeFixes, preflight, settleGates, acquireLock } from "../lib/execute.mjs";

const NOOP = { key: "noop", label: "No-op check", argv: [process.execPath, "-e", "0"] };
const FAIL = { key: "build", label: "Production build", argv: [process.execPath, "-e", "process.exit(3)"] };
const fastConfig = (extra = {}) =>
  testConfig({ validation: { commands: [NOOP], buildCommand: NOOP }, ...extra });

/** A site with one link-casing problem in app/guides/alpha/page.tsx. */
function casingSpec() {
  const spec = healthySite();
  spec.pages["/guides/alpha"].body += `<a href="/Guides/Beta">beta</a>`;
  spec.sources = {
    "app/guides/alpha/page.tsx": `import Link from "next/link";\nconst PATH = "/guides/alpha";\nexport default function P() {\n  return <Link href="/Guides/Beta">beta</Link>;\n}\n`,
  };
  return spec;
}

async function analyzeDir(dir, config) {
  const inv = await buildInventory({ repoRoot: dir, config });
  return { inv, ...analyze({ inv, config, today: TODAY, gscSignal: neutralGsc, history: buildHistory([]) }) };
}

const stubAudit = (before, { introduce = false } = {}) => async () => ({
  findings: [
    ...before.filter((f) => f.disposition !== "AUTO_FIX_CANDIDATE"),
    ...(introduce ? [{ fingerprint: "brand-new", type: "title-missing", route: "/x", detail: "new" }] : []),
  ],
});

// --- planning -----------------------------------------------------------------

test("a letter-case link is a safe auto-fix: one literal, one real target, every static gate passes", async () => {
  const s = site(casingSpec());
  try {
    const r = await analyzeDir(s.dir, testConfig());
    const f = r.findings.find((x) => x.type === "link-casing");
    assert.equal(f.disposition, "AUTO_FIX_CANDIDATE");
    assert.deepEqual(f.fix.edits.map((e) => [e.file, e.before, e.after]), [["app/guides/alpha/page.tsx", '"/Guides/Beta"', '"/guides/beta"']]);
    const statuses = Object.fromEntries(f.fix.gates.map((gt) => [gt.key, gt.status]));
    assert.equal(statuses["mechanically-validated"], "pending");
    assert.ok(f.fix.gates.filter((gt) => gt.status !== "pending").every((gt) => gt.status === "pass"));
  } finally {
    s.cleanup();
  }
});

test("unsafe cases stay report-only: literal on a compliance line, literal outside a URL context", async () => {
  const onCompliance = casingSpec();
  onCompliance.sources["app/guides/alpha/page.tsx"] = `const disclosure = { brokerage: "Scofield Group", href: "/Guides/Beta" };\n`;
  let s = site(onCompliance);
  try {
    const f = (await analyzeDir(s.dir, testConfig())).findings.find((x) => x.type === "link-casing");
    assert.equal(f.disposition, "REVIEW_REQUIRED");
    assert.equal(f.fix.blockedBy, "no-compliance");
  } finally {
    s.cleanup();
  }

  const oddUse = casingSpec();
  oddUse.sources["app/guides/alpha/page.tsx"] = `const label = someFn("/Guides/Beta", 3);\n`;
  s = site(oddUse);
  try {
    const f = (await analyzeDir(s.dir, testConfig())).findings.find((x) => x.type === "link-casing");
    assert.equal(f.fix.ok, false);
    assert.equal(f.fix.blockedBy, "meaning-unchanged");
  } finally {
    s.cleanup();
  }
});

test("an image whose case matches two files is never guessed", () => {
  const finding = { type: "image-path-case", fixability: "conditional", grouped: true, evidence: [{ referenced: "/images/a.webp", actual: ["/images/A.webp", "/images/A.WEBP"] }] };
  const plan = planFix(finding, { inv: { sources: [] }, config: testConfig() });
  assert.equal(plan.ok, false);
  assert.equal(plan.gates.find((gt) => gt.key === "unambiguous").status, "fail");
});

test("sitemap add copies the section convention and refuses when the convention is ambiguous", async () => {
  const spec = healthySite(["a", "b", "c", "d"]);
  spec.sitemap = spec.sitemap.filter((e) => e.route !== "/guides/d");
  let s = site(spec);
  try {
    const f = (await analyzeDir(s.dir, testConfig())).findings.find((x) => x.type === "sitemap-missing-route");
    assert.equal(f.fix.ok, true);
    const ins = f.fix.edits[0];
    assert.equal(ins.kind, "insert");
    assert.deepEqual(ins.lines.map((l) => l.trim()), ["{", "url: `${BASE_URL}/guides/d`,", 'changeFrequency: "monthly",', "priority: 0.7,", "},"]);
    const after = applyEditsToText(readFileSync(join(s.dir, "app/sitemap.ts"), "utf8"), f.fix.edits);
    assert.ok(parseSitemapEntries(after).some((e) => e.route === "/guides/d" && e.priority === "0.7"));
  } finally {
    s.cleanup();
  }

  const mixed = healthySite(["a", "b", "c", "d"]);
  mixed.sitemap = [
    { route: "/" },
    { route: "/guides" },
    { route: "/guides/a", changeFrequency: "monthly", priority: 0.7 },
    { route: "/guides/b", changeFrequency: "yearly", priority: 0.7 },
    { route: "/guides/c", changeFrequency: "weekly", priority: 0.5 },
  ];
  s = site(mixed);
  try {
    const f = (await analyzeDir(s.dir, testConfig())).findings.find((x) => x.type === "sitemap-missing-route");
    assert.equal(f.fix.ok, false);
    assert.equal(f.fix.blockedBy, "unambiguous");
  } finally {
    s.cleanup();
  }
});

test("sitemap remove targets exactly the stale entry", async () => {
  const spec = healthySite();
  spec.sitemap = [...spec.sitemap, { route: "/guides/gone" }];
  const s = site(spec);
  try {
    const f = (await analyzeDir(s.dir, testConfig())).findings.find((x) => x.type === "sitemap-stale-route");
    assert.equal(f.fix.ok, true);
    const after = applyEditsToText(readFileSync(join(s.dir, "app/sitemap.ts"), "utf8"), f.fix.edits);
    assert.equal(parseSitemapEntries(after).some((e) => e.route === "/guides/gone"), false);
    assert.equal(parseSitemapEntries(after).length, 5);
  } finally {
    s.cleanup();
  }
});

test("run limits: at most N fixes per run; the rest wait", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].body += `<a href="/Guides/Beta">b</a><a href="/Guides/Gamma">g</a>`;
  spec.sources = { "app/guides/alpha/page.tsx": `const a = { href: "/Guides/Beta" };\nconst b = { href: "/Guides/Gamma" };\n` };
  const s = site(spec);
  try {
    const r = await analyzeDir(s.dir, testConfig({ autoFix: { maxFixesPerRun: 1 } }));
    assert.equal(r.fixPlan.planned.length, 1);
    assert.equal(r.findings.filter((f) => f.fix?.blockedBy === "RUN_LIMIT").length, 1);
  } finally {
    s.cleanup();
  }
});

// --- edits and the diff inspector -----------------------------------------------

test("applyEditsToText replaces exactly, keeps CRLF, and refuses when the source moved", () => {
  const text = 'a\r\nconst x = { href: "/Old" };\r\nb\r\n';
  const edit = { kind: "replace", file: "f", line: 2, column: 19, before: '"/Old"', after: '"/old"' };
  assert.equal(applyEditsToText(text, [edit]), 'a\r\nconst x = { href: "/old" };\r\nb\r\n');
  assert.equal(applyEditsToText(text, [{ kind: "insert", file: "f", afterLine: 1, lines: ["new"] }]), 'a\r\nnew\r\nconst x = { href: "/Old" };\r\nb\r\n');
  assert.throws(() => applyEditsToText(text.replace("/Old", "/Moved"), [edit]), /source changed/);
});

test("diff scoping: only the planned literal may change; anything else is refused", async () => {
  const s = site(casingSpec());
  try {
    gitify(s.dir);
    const config = testConfig();
    const r = await analyzeDir(s.dir, config);
    const planned = r.fixPlan.planned;
    const { expected } = applyPlanned({ repoRoot: s.dir, planned });
    assert.equal(inspectFixDiff({ repoRoot: s.dir, planned, expected, config, wholeTree: true }).ok, true);

    // Someone (or a bug) also changes a word of copy in the same file.
    const file = join(s.dir, "app/guides/alpha/page.tsx");
    writeFileSync(file, readFileSync(file, "utf8").replace(">beta<", ">Beta guide<"));
    const bad = inspectFixDiff({ repoRoot: s.dir, planned, expected, config, wholeTree: true });
    assert.equal(bad.ok, false);
    g(s.dir, "checkout", "--", ".");

    // ...or a different file.
    applyPlanned({ repoRoot: s.dir, planned });
    writeFileSync(join(s.dir, "app/sitemap.ts"), "// edited\n");
    const other = inspectFixDiff({ repoRoot: s.dir, planned, expected, config, wholeTree: true });
    assert.equal(other.ok, false);
    assert.match(other.problems.join(" "), /no fix planned: app\/sitemap\.ts/);
  } finally {
    s.cleanup();
  }
});

// --- execution ----------------------------------------------------------------

test("trial: applies, validates, re-audits, then ALWAYS reverts — byte for byte", async () => {
  const s = site(casingSpec());
  try {
    gitify(s.dir);
    const config = fastConfig();
    const r = await analyzeDir(s.dir, config);
    const file = join(s.dir, "app/guides/alpha/page.tsx");
    const before = readFileSync(file, "utf8");
    const ex = await executeFixes({ repoRoot: s.dir, config, planned: r.fixPlan.planned, findings: r.findings, mode: "trial", runAudit: stubAudit(r.findings), reportDate: TODAY });
    assert.equal(ex.stoppedBecause, null);
    assert.equal(ex.validation.ok, true);
    assert.equal(ex.reaudit.ok, true);
    assert.equal(ex.reverted, true);
    assert.equal(readFileSync(file, "utf8"), before);
    assert.equal(g(s.dir, "status", "--porcelain"), "");
    settleGates(r.fixPlan.planned, ex);
    assert.deepEqual([...new Set(r.fixPlan.planned[0].fix.gates.map((gt) => gt.status))], ["pass"], "all twelve gates proven");
  } finally {
    s.cleanup();
  }
});

test("trial: a failing build or a re-audit that finds something new reverts everything", async () => {
  for (const [label, config, introduce] of [
    ["build", testConfig({ validation: { commands: [NOOP, FAIL], buildCommand: NOOP } }), false],
    ["re-audit", fastConfig(), true],
  ]) {
    const s = site(casingSpec());
    try {
      gitify(s.dir);
      const r = await analyzeDir(s.dir, config);
      const ex = await executeFixes({ repoRoot: s.dir, config, planned: r.fixPlan.planned, findings: r.findings, mode: "trial", runAudit: stubAudit(r.findings, { introduce }), reportDate: TODAY });
      assert.ok(ex.stoppedBecause, label);
      assert.equal(ex.reverted, true, label);
      assert.equal(g(s.dir, "status", "--porcelain"), "", label);
    } finally {
      s.cleanup();
    }
  }
});

test("dirty-tree refusal: trial will not edit a file with uncommitted work; apply preflight refuses any dirty tree", async () => {
  const s = site(casingSpec());
  try {
    gitify(s.dir, { remote: true });
    const config = fastConfig({ autoFix: { enabled: true } });
    const r = await analyzeDir(s.dir, config);
    const file = join(s.dir, "app/guides/alpha/page.tsx");
    writeFileSync(file, `${readFileSync(file, "utf8")}// work in progress\n`);
    const trial = await executeFixes({ repoRoot: s.dir, config, planned: r.fixPlan.planned, findings: r.findings, mode: "trial", runAudit: stubAudit(r.findings), reportDate: TODAY });
    assert.match(trial.stoppedBecause, /uncommitted changes/);
    assert.equal(trial.attempted, false);

    const pf = preflight({ repoRoot: s.dir, config });
    assert.equal(pf.ok, false);
    assert.match(pf.reason, /not clean/);
    const apply = await executeFixes({ repoRoot: s.dir, config, planned: r.fixPlan.planned, findings: r.findings, mode: "apply", preflightState: pf, runAudit: stubAudit(r.findings), reportDate: TODAY });
    assert.match(apply.stoppedBecause, /preflight refused/);
    assert.match(readFileSync(file, "utf8"), /work in progress/, "the person's work is untouched");
  } finally {
    s.cleanup();
  }
});

test("apply is refused while auto-fix is disabled (the v1 default)", async () => {
  const s = site(casingSpec());
  try {
    const config = fastConfig();
    assert.equal(config.autoFix.enabled, false);
    const r = await analyzeDir(s.dir, config);
    const ex = await executeFixes({ repoRoot: s.dir, config, planned: r.fixPlan.planned, findings: r.findings, mode: "apply", runAudit: stubAudit(r.findings), reportDate: TODAY });
    assert.match(ex.stoppedBecause, /auto-fix is disabled/);
    assert.equal(ex.attempted, false);
  } finally {
    s.cleanup();
  }
});

function otherClone(bare) {
  const other = mkdtempSync(join(tmpdir(), "lvinit-sq-other-"));
  spawnSync("git", ["clone", "-c", "core.autocrlf=false", bare, other], { encoding: "utf8" });
  g(other, "config", "user.email", "o@example.com");
  g(other, "config", "user.name", "O");
  g(other, "config", "core.autocrlf", "false");
  return {
    dir: other,
    push(file, text) {
      writeFileSync(join(other, file), text);
      g(other, "add", ".");
      g(other, "commit", "-m", "someone else");
      g(other, "push", "origin", "main");
    },
  };
}

test("apply: commits only the planned file and pushes when the remote is still", async () => {
  const s = site(casingSpec());
  try {
    const { bare } = gitify(s.dir, { remote: true });
    const config = fastConfig({ autoFix: { enabled: true } });
    const pf = preflight({ repoRoot: s.dir, config });
    assert.equal(pf.ok, true, pf.reason);
    const r = await analyzeDir(s.dir, config);
    const ex = await executeFixes({ repoRoot: s.dir, config, planned: r.fixPlan.planned, findings: r.findings, mode: "apply", preflightState: pf, runAudit: stubAudit(r.findings), reportDate: TODAY });
    assert.equal(ex.pushed, true, ex.stoppedBecause);
    assert.equal(g(s.dir, "diff", "--name-only", "HEAD~1..HEAD"), "app/guides/alpha/page.tsx");
    assert.equal(g(s.dir, "rev-parse", "HEAD"), g(bare, "rev-parse", "main"));
    assert.match(g(s.dir, "log", "-1", "--format=%B"), /QA-2026-09-23-\d{3}\s+link-casing/);
    rmSync(bare, { recursive: true, force: true });
  } finally {
    s.cleanup();
  }
});

test("remote-move safety: an unrelated remote commit is rebased onto and re-validated; one touching our file stops the push", async () => {
  for (const overlap of [false, true]) {
    const s = site(casingSpec());
    try {
      const { bare } = gitify(s.dir, { remote: true });
      const other = otherClone(bare);
      const config = fastConfig({ autoFix: { enabled: true } });
      const pf = preflight({ repoRoot: s.dir, config });
      const r = await analyzeDir(s.dir, config);
      // The remote moves while the agent is re-auditing.
      const runAudit = async () => {
        if (overlap) other.push("app/guides/alpha/page.tsx", "export default function P() { return 1; }\n");
        else other.push("app/guides/beta/page.tsx", "export default function P() { return 2; }\n");
        return stubAudit(r.findings)();
      };
      const ex = await executeFixes({ repoRoot: s.dir, config, planned: r.fixPlan.planned, findings: r.findings, mode: "apply", preflightState: pf, runAudit, reportDate: TODAY });
      if (overlap) {
        assert.equal(ex.pushed, false);
        assert.match(ex.stoppedBecause, /clean rebase was not possible/);
        assert.notEqual(g(bare, "log", "-1", "--format=%s", "main"), "fix: repair LVINIT site-quality regressions (2026-09-23)");
      } else {
        assert.equal(ex.pushed, true, ex.stoppedBecause);
        assert.equal(g(s.dir, "rev-parse", "HEAD"), g(bare, "rev-parse", "main"));
        assert.match(g(bare, "log", "-2", "--format=%s", "main"), /someone else/);
      }
      rmSync(other.dir, { recursive: true, force: true });
      rmSync(bare, { recursive: true, force: true });
    } finally {
      s.cleanup();
    }
  }
});

test("the run lock works in a linked git worktree (absolute --git-dir), and blocks a second run", () => {
  const s = site(healthySite());
  const wt = mkdtempSync(join(tmpdir(), "lvinit-sq-wt-"));
  try {
    gitify(s.dir);
    rmSync(wt, { recursive: true, force: true });
    g(s.dir, "worktree", "add", "--detach", wt, "HEAD");
    const first = acquireLock(wt, fastConfig());
    assert.equal(first.ok, true, first.reason);
    assert.ok(!first.path.startsWith(join(wt, wt.slice(0, 3))), "lock path is not the repo path glued to an absolute git dir");
    const second = acquireLock(wt, fastConfig());
    assert.equal(second.ok, false);
    assert.match(second.reason, /another Site Quality run/);
    first.release();
    assert.equal(acquireLock(wt, fastConfig()).ok, true);
  } finally {
    g(s.dir, "worktree", "remove", "--force", wt);
    rmSync(wt, { recursive: true, force: true });
    s.cleanup();
  }
});

test("trial: an unexpected crash after the edit (a re-audit that throws) still reverts everything", async () => {
  const s = site(casingSpec());
  try {
    gitify(s.dir);
    const config = fastConfig();
    const r = await analyzeDir(s.dir, config);
    const file = join(s.dir, "app/guides/alpha/page.tsx");
    const before = readFileSync(file, "utf8");
    const ex = await executeFixes({
      repoRoot: s.dir,
      config,
      planned: r.fixPlan.planned,
      findings: r.findings,
      mode: "trial",
      runAudit: async () => {
        throw new Error("simulated crash");
      },
      reportDate: TODAY,
    });
    assert.match(ex.stoppedBecause, /unexpected error.*simulated crash/);
    assert.equal(ex.reverted, true);
    assert.equal(readFileSync(file, "utf8"), before);
    assert.equal(g(s.dir, "status", "--porcelain"), "");
    assert.equal(acquireLock(s.dir, config).ok, true, "the lock was released");
  } finally {
    s.cleanup();
  }
});
