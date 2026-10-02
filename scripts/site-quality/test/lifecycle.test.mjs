// Identity, grouping, severity, scoring, GSC ordering and week-to-week lifecycle.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { audit, healthySite, ofType, testConfig, TODAY } from "./helpers.mjs";
import { instance, groupInstances, fingerprintOf, prioritize, scoreHealth } from "../lib/findings.mjs";
import { buildHistory, readPreviousReports } from "../lib/history.mjs";
import { buildJsonReport } from "../lib/report.mjs";
import { ISSUE_TYPES } from "../lib/catalog.mjs";

const config = testConfig();

test("fingerprints ignore case, whitespace and the LVINIT origin, and differ by type/route/field", () => {
  const a = fingerprintOf({ type: "canonical-malformed", scope: "/x", field: "canonical", failure: "https://www.lvinit.com/X  " });
  const b = fingerprintOf({ type: "canonical-malformed", scope: "/x", field: "canonical", failure: "/x" });
  assert.equal(a, b);
  assert.notEqual(a, fingerprintOf({ type: "canonical-mismatch", scope: "/x", field: "canonical", failure: "/x" }));
  assert.notEqual(a, fingerprintOf({ type: "canonical-malformed", scope: "/y", field: "canonical", failure: "/x" }));
});

test("a grouped finding keeps its fingerprint when a new page joins the same root cause", () => {
  const mk = (routes) =>
    groupInstances(
      routes.map((route) => instance({ type: "link-broken-anchor", route, field: "a[href]", failure: "#x", groupBy: "broken-anchor:shared-components" })),
      config
    )[0];
  const two = mk(["/a", "/b"]);
  const three = mk(["/a", "/b", "/c"]);
  assert.equal(two.fingerprint, three.fingerprint);
  assert.equal(three.routes.length, 3);
  assert.equal(three.instances, 3);
});

test("severity: base by type; breadth never escalates; systemic types do; overrides win", () => {
  const many = Array.from({ length: 30 }, (_, i) => `/p${i}`);
  const anchors = groupInstances(many.map((route) => instance({ type: "link-broken-anchor", route, failure: "#x", groupBy: "g" })), config)[0];
  assert.equal(anchors.severity, "MEDIUM", "thirty pages sharing one bug is still MEDIUM");
  const canon = groupInstances(many.slice(0, 5).map((route) => instance({ type: "canonical-mismatch", route, failure: "-> /", groupBy: "c" })), config)[0];
  assert.equal(canon.severity, "CRITICAL");
  const canon4 = groupInstances(many.slice(0, 4).map((route) => instance({ type: "canonical-mismatch", route, failure: "-> /", groupBy: "c" })), config)[0];
  assert.equal(canon4.severity, "HIGH");
  const home = groupInstances([instance({ type: "noindex-unexpected", route: "/", severity: "CRITICAL" })], config)[0];
  assert.equal(home.severity, "CRITICAL");
  for (const [type, def] of Object.entries(ISSUE_TYPES)) {
    assert.ok(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"].includes(def.severity), type);
    assert.ok(["never", "conditional"].includes(def.fix), type);
  }
});

test("GSC reorders within a severity and tags search-visible pages, but never changes severity; absence is neutral", () => {
  const fs = groupInstances(
    [
      instance({ type: "title-missing", route: "/quiet" }),
      instance({ type: "title-missing", route: "/busy" }),
      instance({ type: "sitemap-missing-route", route: "/other", failure: "/other" }),
    ],
    config
  );
  const gsc = {
    multiplierFor: (route) => (route === "/busy" ? { value: 1.2, impressions: 400, clicks: 9 } : { value: 1, impressions: null, clicks: null }),
  };
  prioritize(fs, gsc, config);
  assert.deepEqual(fs.map((f) => f.route), ["/other", "/busy", "/quiet"], "HIGH first, then the search-visible MEDIUM");
  assert.equal(fs.find((f) => f.route === "/busy").severity, "MEDIUM");
  assert.equal(fs.find((f) => f.route === "/busy").search.searchVisible, true);
  assert.equal(fs.find((f) => f.route === "/quiet").search.multiplier, 1);
});

test("health: a shared root cause costs the site once and each page once; INFO/ignored cost nothing", () => {
  const f = [
    { severity: "MEDIUM", routes: ["/a", "/b"], status: "NEW" },
    { severity: "HIGH", routes: ["/a"], status: "PERSISTING" },
    { severity: "HIGH", routes: ["/b"], status: "IGNORED" },
    { severity: "INFO", routes: ["/b"], status: "NEW" },
  ];
  const h = scoreHealth(f, ["/a", "/b", "/c"], config);
  assert.equal(h.site, 100 - 5 - 15);
  assert.deepEqual(Object.fromEntries(h.pages.map((p) => [p.route, p.score])), { "/a": 80, "/b": 95, "/c": 100 });
});

function historyFrom(result, { date, mode = "report", pushed = false, commitHash = null } = {}) {
  const json = buildJsonReport({
    reportDate: date,
    generatedAt: `${date}T00:00:00Z`,
    mode,
    findings: result.findings,
    resolved: [],
    system: [],
    stats: {},
    health: result.health,
    summary: {},
    gsc: {},
    publisherHandoffs: [],
    execution: mode === "apply" ? { pushed, commitHash } : null,
  });
  return json;
}

test("lifecycle: NEW, then PERSISTING with the same id, then RESOLVED", async () => {
  const broken = healthySite();
  broken.pages["/guides/alpha"].title = null;
  const week1 = await audit(broken, { today: "2026-09-16" });
  const f1 = ofType(week1, "title-missing")[0];
  assert.equal(f1.status, "NEW");
  assert.match(f1.id, /^QA-2026-09-16-\d{3}$/);

  const h1 = buildHistory([historyFrom(week1, { date: "2026-09-16" })]);
  const week2 = await audit(broken, { history: h1 });
  const f2 = ofType(week2, "title-missing")[0];
  assert.equal(f2.status, "PERSISTING");
  assert.equal(f2.id, f1.id, "stable id across runs");
  assert.equal(f2.firstSeen, "2026-09-16");

  const h2 = buildHistory([historyFrom(week1, { date: "2026-09-16" }), historyFrom(week2, { date: TODAY })]);
  const week3 = await audit(healthySite(), { history: h2, today: "2026-09-30" });
  assert.equal(week3.resolved.length, 1);
  assert.equal(week3.resolved[0].id, f1.id);
});

test("lifecycle: an ignored fingerprint is IGNORED, costs nothing and is not reviewed", async () => {
  const broken = healthySite();
  broken.pages["/guides/alpha"].title = null;
  const first = await audit(broken);
  const fp = ofType(first, "title-missing")[0].fingerprint;
  const again = await audit(broken, { config: testConfig({ decisions: { ignored: [{ fingerprint: fp, note: "known" }] } }) });
  const f = ofType(again, "title-missing")[0];
  assert.equal(f.status, "IGNORED");
  assert.equal(f.disposition, "IGNORED");
  assert.equal(again.health.site, 100);
});

test("noise: an unchanged LOW item goes quiet after two full write-ups; MEDIUM never does", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].body += `<a href="/guides/beta/">b</a>`; // LOW trailing slash
  spec.pages["/guides/beta"].title = null; // MEDIUM
  const r1 = await audit(spec, { today: "2026-09-09" });
  const r2 = await audit(spec, { today: "2026-09-16", history: buildHistory([historyFrom(r1, { date: "2026-09-09" })]) });
  const r3 = await audit(spec, {
    today: TODAY,
    history: buildHistory([historyFrom(r1, { date: "2026-09-09" }), historyFrom(r2, { date: "2026-09-16" })]),
  });
  assert.equal(ofType(r3, "link-trailing-slash")[0].shownInFull, false);
  assert.equal(ofType(r3, "title-missing")[0].shownInFull, true);
});

test("an issue this agent auto-fixed that comes back is never re-applied", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].body += `<a href="/Guides/Beta">b</a>`;
  spec.sources = { "app/guides/alpha/page.tsx": `const x = { href: "/Guides/Beta" };\n` };
  const r1 = await audit(spec, { today: "2026-09-16" });
  const f1 = ofType(r1, "link-casing")[0];
  assert.equal(f1.disposition, "AUTO_FIX_CANDIDATE");
  f1.status = "AUTO_FIXED";
  const hist = buildHistory([historyFrom(r1, { date: "2026-09-16", mode: "apply", pushed: true, commitHash: "abc123" })]);
  const r2 = await audit(spec, { history: hist });
  const f2 = ofType(r2, "link-casing")[0];
  assert.equal(f2.fix.blockedBy, "PREVIOUSLY_AUTO_FIXED");
  assert.equal(f2.disposition, "REVIEW_REQUIRED");
  assert.equal(f2.reappearedAfterAutoFix.commit, "abc123");
});

test("history is read from the output dir and CI run folders; fixtures and other agents' files are skipped", () => {
  const dir = mkdtempSync(join(tmpdir(), "lvinit-sq-hist-"));
  try {
    const rep = (date, extra = {}) => JSON.stringify({ agent: "lvinit-site-quality", reportDate: date, mode: "report", findings: [], ...extra });
    writeFileSync(join(dir, "site-quality-2026-09-09.json"), rep("2026-09-09"));
    mkdirSync(join(dir, "run-1"));
    writeFileSync(join(dir, "run-1", "site-quality-2026-09-16.json"), rep("2026-09-16"));
    writeFileSync(join(dir, "site-quality-2026-09-02.json"), rep("2026-09-02", { fixtureData: true }));
    writeFileSync(join(dir, "site-quality-2026-08-26.json"), "{not json");
    writeFileSync(join(dir, "site-quality-2026-08-19.json"), JSON.stringify({ agent: "other", reportDate: "2026-08-19" }));
    writeFileSync(join(dir, "site-quality-2026-09-23.json"), rep("2026-09-23"));
    const got = readPreviousReports([dir], { excludeDate: "2026-09-23" });
    assert.deepEqual(got.map((r) => r.reportDate), ["2026-09-09", "2026-09-16"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
