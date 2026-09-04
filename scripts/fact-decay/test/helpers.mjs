// Shared test scaffolding for the Fact-Decay agent test suite.
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig } from "../config.mjs";
import { buildFixtureInventory } from "../fixtures/fixture-pages.mjs";
import { createFixtureFetch } from "../fixtures/fixture-sources.mjs";
import { createVerifier } from "../lib/verify.mjs";

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/** Every test pins the date, so nothing in the suite changes meaning tomorrow. */
export const TEST_TODAY = "2026-09-04";

export function testConfig(overrides = {}) {
  return loadConfig(overrides);
}

export function testInventory(config = testConfig(), today = TEST_TODAY) {
  return buildFixtureInventory({ config, today });
}

/** A verifier wired to fixture responses, with the politeness delay removed. */
export function testVerifier(config = testConfig({ verification: { enabled: true, perHostDelayMs: 0 } })) {
  return createVerifier({
    config,
    today: TEST_TODAY,
    fetchImpl: createFixtureFetch(),
    cache: { version: 1, entries: {} },
  });
}

/** A verifier that never checks anything — the default, detection-only mode. */
export function offlineVerifier(config = testConfig()) {
  return createVerifier({
    config,
    today: TEST_TODAY,
    fetchImpl: async () => {
      throw new Error("a detection-only run must never make a network request");
    },
    cache: { version: 1, entries: {} },
  });
}

/** A GSC signal stand-in with no traffic weighting at all. */
export const neutralGscSignal = {
  available: false,
  reason: "no GSC report was used in this test",
  reportPath: null,
  reportDate: null,
  ageDays: null,
  fixtureData: false,
  routes: new Map(),
  multiplierFor: () => ({ value: 1, basis: "no traffic weighting in this test" }),
};

/** Find one fixture page by route. */
export function fixturePage(route, config = testConfig()) {
  const page = testInventory(config).pages.find((p) => p.route === route);
  if (!page) throw new Error(`No fixture page for route ${route}`);
  return page;
}
