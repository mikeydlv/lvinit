// Shared test scaffolding for the GSC agent test suite.
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig } from "../config.mjs";
import { buildSiteInventory } from "../lib/site-inventory.mjs";
import { normalizeRows } from "../lib/client.mjs";
import { buildWindows } from "../lib/windows.mjs";

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

export const TEST_TODAY = "2026-09-04";

export function testConfig(overrides = {}) {
  return loadConfig(overrides);
}

export function testInventory() {
  return buildSiteInventory({ repoRoot: REPO_ROOT, origin: "https://www.lvinit.com" });
}

export function testWindows(config = testConfig()) {
  return buildWindows({
    periodDays: config.windows.periodDays,
    lagDays: config.windows.lagDays,
    comparisonDays: config.windows.comparisonDays,
    today: TEST_TODAY,
  });
}

/** Turn a raw fixture window into the normalized shape analyze() expects. */
export function normalizeWindow(window) {
  return {
    queries: normalizeRows(window.queries, ["query"]),
    pages: normalizeRows(window.pages, ["page"]),
    pairs: normalizeRows(window.pairs, ["query", "page"]),
  };
}

export function normalizeDataset(dataset) {
  return {
    current: normalizeWindow(dataset.current),
    previous: normalizeWindow(dataset.previous),
  };
}

/** A fetch stand-in that replays queued responses and records the requests. */
export function stubFetch(responses) {
  const calls = [];
  const queue = [...responses];
  const impl = async (url, options) => {
    calls.push({ url, options });
    const next = queue.shift();
    if (!next) throw new Error(`stubFetch ran out of responses after ${calls.length} calls`);
    if (typeof next === "function") return next(url, options);
    return {
      ok: next.status === undefined || (next.status >= 200 && next.status < 300),
      status: next.status ?? 200,
      json: async () => next.body,
      text: async () => (typeof next.body === "string" ? next.body : JSON.stringify(next.body)),
    };
  };
  impl.calls = calls;
  return impl;
}
