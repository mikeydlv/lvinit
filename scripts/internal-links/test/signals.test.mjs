// The two optional signals: GSC prioritization and Fact-Decay destination
// eligibility. Both read real report files written to a temp directory, so the
// tests exercise the same parsing the weekly run does.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { loadGscSignal, loadFactDecaySignal, findLatestReport } from "../lib/signals.mjs";
import { testConfig, TODAY } from "./helpers.mjs";

/** A throwaway repo root with reports/gsc and reports/fact-decay in it. */
function scratch(files = {}) {
  const root = mkdtempSync(join(tmpdir(), "lvinit-links-"));
  for (const [path, contents] of Object.entries(files)) {
    const full = join(root, path);
    mkdirSync(join(full, ".."), { recursive: true });
    writeFileSync(full, JSON.stringify(contents, null, 2), "utf8");
  }
  return { root, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

const config = () => testConfig({ gsc: { enabled: true }, factDecay: { enabled: true } });

test("no GSC report means every multiplier is exactly neutral", () => {
  const { root, cleanup } = scratch();
  try {
    const signal = loadGscSignal({ repoRoot: root, config: config(), today: TODAY });
    assert.equal(signal.available, false);
    assert.equal(signal.multiplierFor("/guides/anything").value, 1);
    assert.match(signal.reason, /optional/);
  } finally {
    cleanup();
  }
});

test("a page absent from the GSC report is weighted neutrally, not penalised", () => {
  const { root, cleanup } = scratch({
    "reports/gsc/gsc-opportunities-2026-09-17.json": {
      reportDate: "2026-09-17",
      opportunities: [
        {
          id: "GSC-1",
          type: "internal-link",
          landingPage: "/guides/seen",
          metrics: { impressions: 300, clicks: 4 },
        },
      ],
    },
  });
  try {
    const signal = loadGscSignal({ repoRoot: root, config: config(), today: TODAY });
    assert.equal(signal.available, true);
    const absent = signal.multiplierFor("/guides/not-in-the-report");
    assert.equal(absent.value, 1, "absence is never a penalty");
    assert.match(absent.basis, /says nothing about the page's traffic/);
    const seen = signal.multiplierFor("/guides/seen");
    assert.ok(seen.value > 1, "a real positive signal is a boost");
    assert.ok(seen.value <= config().gsc.maxMultiplier * config().gsc.namedInternalLinkBoost);
  } finally {
    cleanup();
  }
});

test("a GSC internal-link opportunity naming a page is recognized as the other agent asking", () => {
  const { root, cleanup } = scratch({
    "reports/gsc/gsc-opportunities-2026-09-17.json": {
      reportDate: "2026-09-17",
      opportunities: [
        { id: "GSC-1", type: "internal-link", landingPage: "/guides/needs-links", metrics: { impressions: 97, clicks: 0 } },
      ],
    },
  });
  try {
    const signal = loadGscSignal({ repoRoot: root, config: config(), today: TODAY });
    assert.ok(signal.namedInternalLinkRoutes.has("/guides/needs-links"));
    const row = signal.multiplierFor("/guides/needs-links");
    assert.equal(row.named, true);
    assert.match(row.basis, /internal-link opportunity naming this exact page/);
  } finally {
    cleanup();
  }
});

test("a GSC report past the age limit is ignored", () => {
  const { root, cleanup } = scratch({
    "reports/gsc/gsc-opportunities-2026-01-01.json": {
      reportDate: "2026-01-01",
      opportunities: [{ id: "GSC-1", type: "internal-link", landingPage: "/guides/old", metrics: { impressions: 900 } }],
    },
  });
  try {
    const signal = loadGscSignal({ repoRoot: root, config: config(), today: TODAY });
    assert.equal(signal.available, false);
    assert.match(signal.reason, /days old/);
    assert.equal(signal.multiplierFor("/guides/old").value, 1);
  } finally {
    cleanup();
  }
});

test("the newest report wins, including one a CI download put in a subdirectory", () => {
  const { root, cleanup } = scratch({
    "reports/gsc/gsc-opportunities-2026-09-15.json": { reportDate: "2026-09-15", opportunities: [] },
    "reports/gsc/run-123/gsc-opportunities-2026-09-17.json": { reportDate: "2026-09-17", opportunities: [] },
  });
  try {
    const latest = findLatestReport(join(root, "reports/gsc"), "gsc-opportunities");
    assert.equal(latest.reportDate, "2026-09-17");
  } finally {
    cleanup();
  }
});

test("Fact-Decay: an ordinary finding does not block a destination", () => {
  const { root, cleanup } = scratch({
    "reports/fact-decay/fact-decay-2026-09-17.json": {
      reportDate: "2026-09-17",
      findings: [
        {
          id: "FACT-1",
          route: "/guides/ordinary",
          priority: 58,
          risk: { level: "medium" },
          verification: { result: "cannot-verify" },
        },
      ],
    },
  });
  try {
    const signal = loadFactDecaySignal({ repoRoot: root, config: config(), today: TODAY });
    const verdict = signal.eligibilityFor("/guides/ordinary");
    assert.equal(verdict.eligible, true);
    assert.equal(verdict.code, "FINDINGS_BELOW_BLOCKING_THRESHOLD");
    assert.match(verdict.reason, /routine maintenance/);
  } finally {
    cleanup();
  }
});

test("Fact-Decay: a high-risk contradicted claim blocks the destination", () => {
  const { root, cleanup } = scratch({
    "reports/fact-decay/fact-decay-2026-09-17.json": {
      reportDate: "2026-09-17",
      findings: [
        {
          id: "FACT-9",
          route: "/guides/wrong",
          priority: 60,
          risk: { level: "high" },
          verification: { result: "contradicts" },
        },
      ],
    },
  });
  try {
    const signal = loadFactDecaySignal({ repoRoot: root, config: config(), today: TODAY });
    const verdict = signal.eligibilityFor("/guides/wrong");
    assert.equal(verdict.eligible, false);
    assert.equal(verdict.code, "DESTINATION_REQUIRES_REFRESH");
    assert.match(verdict.reason, /FACT-9/);
  } finally {
    cleanup();
  }
});

test("Fact-Decay: a finding at the act-now priority blocks the destination", () => {
  const { root, cleanup } = scratch({
    "reports/fact-decay/fact-decay-2026-09-17.json": {
      reportDate: "2026-09-17",
      findings: [
        {
          id: "FACT-1",
          route: "/guides/urgent",
          priority: 77,
          risk: { level: "high" },
          verification: { result: "cannot-verify" },
        },
      ],
    },
  });
  try {
    const signal = loadFactDecaySignal({ repoRoot: root, config: config(), today: TODAY });
    const verdict = signal.eligibilityFor("/guides/urgent");
    assert.equal(verdict.eligible, false);
    assert.match(verdict.reason, /act now/);
  } finally {
    cleanup();
  }
});

test("Fact-Decay: an unreachable source is not treated as evidence the page is wrong", () => {
  const { root, cleanup } = scratch({
    "reports/fact-decay/fact-decay-2026-09-17.json": {
      reportDate: "2026-09-17",
      findings: [
        {
          id: "FACT-6",
          route: "/guides/paywalled-source",
          priority: 65,
          risk: { level: "high" },
          verification: { result: "source-unreachable" },
        },
      ],
    },
  });
  try {
    const signal = loadFactDecaySignal({ repoRoot: root, config: config(), today: TODAY });
    assert.equal(
      signal.eligibilityFor("/guides/paywalled-source").eligible,
      true,
      "a 403 from a source is a fetch problem, not a factual one"
    );
  } finally {
    cleanup();
  }
});

test("Fact-Decay: no report means destinations are eligible, and the report says so", () => {
  const { root, cleanup } = scratch();
  try {
    const signal = loadFactDecaySignal({ repoRoot: root, config: config(), today: TODAY });
    assert.equal(signal.available, false);
    assert.equal(signal.eligibilityFor("/guides/anything").eligible, true);
    assert.match(signal.reason, /could not be checked/);
  } finally {
    cleanup();
  }
});

test("both signals can be switched off in configuration", () => {
  const { root, cleanup } = scratch({
    "reports/gsc/gsc-opportunities-2026-09-17.json": { reportDate: "2026-09-17", opportunities: [] },
    "reports/fact-decay/fact-decay-2026-09-17.json": { reportDate: "2026-09-17", findings: [] },
  });
  try {
    const off = testConfig();
    assert.equal(loadGscSignal({ repoRoot: root, config: off, today: TODAY }).available, false);
    assert.equal(loadFactDecaySignal({ repoRoot: root, config: off, today: TODAY }).available, false);
  } finally {
    cleanup();
  }
});
