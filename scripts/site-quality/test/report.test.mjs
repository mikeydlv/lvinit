// The Markdown and JSON reports, and the runner's command line.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { audit, healthySite, testConfig } from "./helpers.mjs";
import { buildMarkdownReport, buildJsonReport, SCHEMA_VERSION } from "../lib/report.mjs";
import { parseArgs, overridesFromArgs, run } from "../run.mjs";
import { loadConfig } from "../config.mjs";

async function reportFor(spec, mode = "report") {
  const r = await audit(spec);
  return {
    reportDate: "2026-09-23",
    generatedAt: "2026-09-23T13:00:00Z",
    mode,
    fixtureData: false,
    findings: r.findings,
    resolved: r.resolved,
    system: r.system,
    stats: r.stats,
    health: r.health,
    validation: [],
    execution: null,
    publisherHandoffs: r.findings.filter((f) => f.publisherHandoff).map((f) => ({ id: f.id, route: f.route, need: f.publisherHandoff.need })),
    gsc: { available: false, reason: "not in this test" },
    summary: {
      pagesAudited: r.stats.pagesAudited, routesChecked: r.stats.routes, sitemapEntries: r.stats.sitemapEntries,
      metadataChecks: r.stats.metadataChecks, schemaChecks: r.stats.schemaBlocks, imagesChecked: r.stats.imagesChecked,
      imageSourceLiterals: r.stats.imageSourceLiterals, linksChecked: r.stats.linksChecked, counts: r.counts,
      autoFixed: 0, autoFixCandidates: r.findings.filter((f) => f.disposition === "AUTO_FIX_CANDIDATE").length,
      reviewRequired: r.findings.filter((f) => f.disposition === "REVIEW_REQUIRED").length, resolved: 0, ignored: 0,
      siteHealth: r.health.site, buildStatus: "fixture",
    },
  };
}

test("Markdown report has every required section, and a clean site says so plainly", async () => {
  const md = buildMarkdownReport(await reportFor(healthySite()), testConfig());
  for (const h of ["## Summary", "## Critical / High", "## Auto-fixed", "## Review required", "## Resolved", "## Source / system health", "## What this agent will never do"]) {
    assert.ok(md.includes(h), h);
  }
  assert.match(md, /None\. Nothing urgent this run\./);
  assert.match(md, /Site health \*\*100\/100\*\*/);
});

test("Markdown report: a review item names the owner, the reason automation stopped, and the fingerprint", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].title = null;
  const md = buildMarkdownReport(await reportFor(spec), testConfig());
  assert.match(md, /\*\*Owner: Publisher\*\*/);
  assert.match(md, /Why automation stopped:\*\* a title is editorial/);
  assert.match(md, /Fingerprint:\*\* `[0-9a-f]{12}`/);
  assert.match(md, /## Publisher handoffs \(not dispatched\)/);
});

test("Markdown report: an auto-fix candidate shows the exact edit and all twelve gates", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].body += `<a href="/Guides/Beta">b</a>`;
  spec.sources = { "app/guides/alpha/page.tsx": `const x = { href: "/Guides/Beta" };\n` };
  const md = buildMarkdownReport(await reportFor(spec), testConfig());
  assert.match(md, /### Would auto-fix \(1\)/);
  assert.match(md, /`app\/guides\/alpha\/page\.tsx:1` "\/Guides\/Beta" → "\/guides\/beta"/);
  assert.equal((md.match(/^  - (✅|⏳|❌) /gm) ?? []).length, 12);
});

test("JSON report carries identity, lifecycle, disposition, fix gates and the schema version", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].title = null;
  const json = buildJsonReport(await reportFor(spec));
  assert.equal(json.schemaVersion, SCHEMA_VERSION);
  assert.equal(json.agent, "lvinit-site-quality");
  const f = json.findings[0];
  for (const k of ["id", "fingerprint", "type", "severity", "status", "disposition", "firstSeen", "lastSeen", "routes", "owner", "publisherHandoffNeeded", "priorSeverity"]) {
    assert.ok(k in f, k);
  }
  assert.doesNotThrow(() => JSON.stringify(json));
});

test("CLI: flags parse into config overrides; --apply cannot enable auto-fix by itself", () => {
  const args = parseArgs(["--trial", "--max-fixes=2", "--no-gsc", "--out=x/y", "--today=2026-10-01"]);
  assert.equal(args.trial, true);
  assert.equal(args.today, "2026-10-01");
  const config = loadConfig(overridesFromArgs(args));
  assert.equal(config.autoFix.maxFixesPerRun, 2);
  assert.equal(config.gsc.enabled, false);
  assert.equal(config.output.dir, "x/y");
  assert.equal(loadConfig(overridesFromArgs(parseArgs(["--apply"]))).autoFix.enabled, false);
});

test("a fixture run writes both reports, stamps them FIXTURE, and edits nothing", async () => {
  const out = mkdtempSync(join(tmpdir(), "lvinit-sq-out-"));
  try {
    const logs = [];
    const report = await run(["--fixtures", "--trial", "--today=2026-09-23", `--out=${out}`], { log: (m) => logs.push(m) });
    assert.equal(report.mode, "report", "--trial is ignored for fixtures");
    assert.ok(existsSync(report.paths.markdown) && existsSync(report.paths.json));
    const md = readFileSync(report.paths.markdown, "utf8");
    assert.match(md, /FIXTURE DATA/);
    const json = JSON.parse(readFileSync(report.paths.json, "utf8"));
    assert.equal(json.fixtureData, true);
    assert.equal(json.summary.autoFixCandidates, 2);
    assert.ok(json.findings.some((f) => f.type === "link-placeholder" && f.disposition === "REVIEW_REQUIRED"));
    rmSync(report.paths.markdown);
    rmSync(report.paths.json);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test("--help prints and does nothing else", async () => {
  const logs = [];
  assert.equal(await run(["--help"], { log: (m) => logs.push(m) }), null);
  assert.match(logs.join("\n"), /--trial/);
});
