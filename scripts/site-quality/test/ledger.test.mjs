// The durable ledger on lvinit-agent-state: identity that outlives report
// artifacts, resolution, auto-fix commits, owners, and what it must never hold.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { audit, healthySite, ofType, testConfig } from "./helpers.mjs";
import { buildHistory } from "../lib/history.mjs";
import { buildJsonReport } from "../lib/report.mjs";
import { updateLedger, readLedger, emptyLedger, LEDGER_AGENT, LEDGER_SCHEMA_VERSION } from "../lib/ledger.mjs";
import { countBySeverity, scoreHealth } from "../lib/findings.mjs";

const config = testConfig();

function jsonOf(result, date, { mode = "report", commitHash = null, fixtureData = false } = {}) {
  return buildJsonReport({
    reportDate: date,
    generatedAt: `${date}T13:00:00Z`,
    mode,
    fixtureData,
    findings: result.findings,
    resolved: result.resolved ?? [],
    system: [],
    stats: {},
    health: result.health,
    summary: {},
    gsc: {},
    publisherHandoffs: [],
    execution: mode === "apply" ? { pushed: true, commitHash } : null,
  });
}

const brokenSite = () => {
  const s = healthySite();
  s.pages["/guides/alpha"].title = null;
  return s;
};

test("ledger: records id, first/last seen, severity, owner and disposition, stamped with schema_version and agent", async () => {
  const r1 = await audit(brokenSite(), { today: "2026-09-04" });
  const ledger = updateLedger(null, jsonOf(r1, "2026-09-04"));
  assert.equal(ledger.schema_version, LEDGER_SCHEMA_VERSION);
  assert.equal(ledger.agent, LEDGER_AGENT);
  const f = ofType(r1, "title-missing")[0];
  const e = ledger.issues[f.fingerprint];
  assert.equal(e.id, f.id);
  assert.equal(e.firstSeen, "2026-09-04");
  assert.equal(e.lastSeen, "2026-09-04");
  assert.equal(e.severity, "MEDIUM");
  assert.equal(e.status, "NEW");
  assert.equal(e.disposition, "REVIEW_REQUIRED");
  assert.equal(e.owner, "Publisher");
  assert.equal(e.resolvedOn, null);
  assert.deepEqual(ledger.lastRun.open, [f.fingerprint]);
});

test("ledger: identity survives expired report artifacts — same id, PERSISTING, original firstSeen", async () => {
  const r1 = await audit(brokenSite(), { today: "2026-06-05" });
  const ledger = updateLedger(null, jsonOf(r1, "2026-06-05"));
  // Months later, no report artifacts survive; only the ledger does.
  const r2 = await audit(brokenSite(), { today: "2026-10-02", history: buildHistory([], { ledger, reportDate: "2026-10-02" }) });
  const before = ofType(r1, "title-missing")[0];
  const after = ofType(r2, "title-missing")[0];
  assert.equal(after.id, before.id);
  assert.equal(after.status, "PERSISTING");
  assert.equal(after.firstSeen, "2026-06-05");
});

test("ledger: a fixed issue is RESOLVED with a date and a resolution, in the report and the ledger", async () => {
  const r1 = await audit(brokenSite(), { today: "2026-09-25" });
  const l1 = updateLedger(null, jsonOf(r1, "2026-09-25"));
  const r2 = await audit(healthySite(), { today: "2026-10-02", history: buildHistory([], { ledger: l1, reportDate: "2026-10-02" }) });
  assert.equal(r2.resolved.length, 1);
  assert.equal(r2.resolved[0].resolvedOn, "2026-10-02");
  assert.equal(r2.resolved[0].owner, "Publisher");
  const l2 = updateLedger(l1, jsonOf(r2, "2026-10-02"));
  const e = l2.issues[r2.resolved[0].fingerprint];
  assert.equal(e.status, "RESOLVED");
  assert.equal(e.resolvedOn, "2026-10-02");
  assert.match(e.resolution, /no longer detected/);
  assert.deepEqual(l2.lastRun.open, []);
});

test("ledger: severity change keeps the prior severity; a resolved issue that returns is reopened", async () => {
  const r1 = await audit(brokenSite(), { today: "2026-09-18" });
  const l1 = updateLedger(null, jsonOf(r1, "2026-09-18"));
  const fp = ofType(r1, "title-missing")[0].fingerprint;
  const bumped = jsonOf(r1, "2026-09-25");
  bumped.findings[0].severity = "HIGH";
  bumped.findings[0].status = "PERSISTING";
  const l2 = updateLedger(l1, bumped);
  assert.equal(l2.issues[fp].priorSeverity, "MEDIUM");
  assert.equal(l2.issues[fp].severity, "HIGH");

  const clean = await audit(healthySite(), { today: "2026-10-02" });
  const l3 = updateLedger(l2, jsonOf(clean, "2026-10-02"));
  assert.equal(l3.issues[fp].status, "RESOLVED");
  const back = await audit(brokenSite(), { today: "2026-10-09", history: buildHistory([], { ledger: l3, reportDate: "2026-10-09" }) });
  const f = ofType(back, "title-missing")[0];
  assert.equal(f.status, "NEW");
  assert.equal(f.reopened, true);
  const l4 = updateLedger(l3, jsonOf(back, "2026-10-09"));
  assert.equal(l4.issues[fp].reopenedCount, 1);
  assert.equal(l4.issues[fp].resolvedOn, null);
  assert.deepEqual(l4.issues[fp].events.map((e) => e.status), ["NEW", "PERSISTING", "RESOLVED", "NEW"]);
});

test("ledger: an auto-fix records its commit, and the ledger alone stops it being re-applied later", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].body += `<a href="/Guides/Beta">b</a>`;
  spec.sources = { "app/guides/alpha/page.tsx": `const x = { href: "/Guides/Beta" };\n` };
  const r1 = await audit(spec, { today: "2026-09-04" });
  const f1 = ofType(r1, "link-casing")[0];
  f1.status = "AUTO_FIXED";
  const ledger = updateLedger(null, jsonOf(r1, "2026-09-04", { mode: "apply", commitHash: "abc1234" }));
  const e = ledger.issues[f1.fingerprint];
  assert.equal(e.autoFixCommit, "abc1234");
  assert.equal(e.autoFixedOn, "2026-09-04");
  assert.match(e.resolution, /auto-fixed .*abc1234/);
  assert.ok(!ledger.lastRun.open.includes(f1.fingerprint));

  // Someone puts the old link back. No report artifact is left — only the ledger.
  const r2 = await audit(spec, { today: "2026-10-02", history: buildHistory([], { ledger, reportDate: "2026-10-02" }) });
  const f2 = ofType(r2, "link-casing")[0];
  assert.equal(f2.fix.blockedBy, "PREVIOUSLY_AUTO_FIXED");
  assert.equal(f2.reappearedAfterAutoFix.commit, "abc1234");
});

test("ledger: a same-day re-run compares against the run before, so new issues stay NEW", async () => {
  const clean = await audit(healthySite(), { today: "2026-09-25" });
  const l1 = updateLedger(null, jsonOf(clean, "2026-09-25"));
  const first = await audit(brokenSite(), { today: "2026-10-02", history: buildHistory([], { ledger: l1, reportDate: "2026-10-02" }) });
  const l2 = updateLedger(l1, jsonOf(first, "2026-10-02"));
  const rerun = await audit(brokenSite(), { today: "2026-10-02", history: buildHistory([], { ledger: l2, reportDate: "2026-10-02" }) });
  const f = ofType(rerun, "title-missing")[0];
  assert.equal(f.status, "NEW");
  assert.equal(f.id, ofType(first, "title-missing")[0].id);
  const l3 = updateLedger(l2, jsonOf(rerun, "2026-10-02"));
  assert.equal(l3.issues[f.fingerprint].timesSeen, 1, "a re-run the same day is not a second sighting");
  assert.equal(l3.previousRun.reportDate, "2026-09-25");
});

test("ledger: holds no Search Console data, ignores fixture runs, and reads tolerantly", async () => {
  const r1 = await audit(brokenSite(), { today: "2026-10-02" });
  r1.findings[0].search = { route: "/guides/alpha", impressions: 900, clicks: 12, multiplier: 1.2, searchVisible: true };
  const ledger = updateLedger(null, jsonOf(r1, "2026-10-02"));
  const text = JSON.stringify(ledger);
  assert.ok(!/impressions|clicks|searchVisible|multiplier/.test(text), "no GSC numbers on the public branch");

  assert.deepEqual(updateLedger(null, jsonOf(r1, "2026-10-02", { fixtureData: true })), emptyLedger());

  const dir = mkdtempSync(join(tmpdir(), "lvinit-sq-ledger-"));
  try {
    assert.equal(readLedger(join(dir, "missing.json")), null);
    writeFileSync(join(dir, "bad.json"), "{nope");
    assert.equal(readLedger(join(dir, "bad.json")), null);
    writeFileSync(join(dir, "other.json"), JSON.stringify({ agent: "someone-else", issues: {} }));
    assert.equal(readLedger(join(dir, "other.json")), null);
    writeFileSync(join(dir, "ok.json"), JSON.stringify(ledger));
    assert.equal(readLedger(join(dir, "ok.json")).issues[r1.findings[0].fingerprint].id, r1.findings[0].id);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("ledger: long-resolved issues are forgotten after a year; auto-fixed ones are kept", async () => {
  const r1 = await audit(brokenSite(), { today: "2025-01-03" });
  const l1 = updateLedger(updateLedger(null, jsonOf(r1, "2025-01-03")), jsonOf(await audit(healthySite(), { today: "2025-01-10" }), "2025-01-10"));
  const fp = ofType(r1, "title-missing")[0].fingerprint;
  assert.ok(l1.issues[fp]);
  l1.issues.keepme = { ...l1.issues[fp], fingerprint: "keepme", autoFixCommit: "def5678" };
  const later = updateLedger(l1, jsonOf(await audit(healthySite(), { today: "2026-10-02" }), "2026-10-02"));
  assert.equal(later.issues[fp], undefined);
  assert.ok(later.issues.keepme);
});

test("apply run: an auto-fixed finding no longer counts toward severity totals or health", () => {
  const findings = [
    { status: "AUTO_FIXED", severity: "HIGH", routes: ["/a"] },
    { status: "PERSISTING", severity: "MEDIUM", routes: ["/a"] },
  ];
  assert.deepEqual(countBySeverity(findings), { CRITICAL: 0, HIGH: 0, MEDIUM: 1, LOW: 0, INFO: 0 });
  const h = scoreHealth(findings, ["/a"], config);
  assert.equal(h.site, 95);
  assert.equal(h.pages[0].score, 95);
});

test("an oversized share image is its own LOW type, not a raw-image warning", async () => {
  const spec = healthySite();
  spec.pages["/guides/alpha"].ogImage = "/images/huge-share.jpg";
  spec.public = { "/images/huge-share.jpg": 5_100_000 };
  const r = await audit(spec);
  const f = ofType(r, "og-image-oversized");
  assert.equal(f.length, 1);
  assert.equal(f[0].severity, "LOW");
  assert.equal(ofType(r, "image-oversized").length, 0);
});
