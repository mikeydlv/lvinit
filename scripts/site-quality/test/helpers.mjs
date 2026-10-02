// Shared scaffolding for the Site Quality Agent's tests.
//
// Everything is synthetic: each test writes a tiny repository + build output
// into a temp directory with fixtures/fixture-site.mjs and audits that.

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

import { loadConfig } from "../config.mjs";
import { buildInventory } from "../lib/inventory.mjs";
import { analyze } from "../lib/audit.mjs";
import { buildHistory } from "../lib/history.mjs";
import { writeSite, healthyPage, storyJsonLd, ORIGIN } from "../fixtures/fixture-site.mjs";

export { writeSite, healthyPage, storyJsonLd, ORIGIN };

export const TODAY = "2026-09-23";

export const neutralGsc = {
  available: false,
  reason: "no GSC report in this test",
  multiplierFor: () => ({ value: 1, impressions: null, clicks: null }),
};

export function testConfig(overrides = {}) {
  return loadConfig({ gsc: { enabled: false }, ...overrides });
}

/** A temp directory holding the site; call cleanup() when done. */
export function site(spec) {
  const dir = mkdtempSync(join(tmpdir(), "lvinit-sq-test-"));
  writeSite(dir, spec);
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

/** Pages for a small healthy site: home, the guides index and N linked guides. */
export function healthySite(extraGuides = ["alpha", "beta", "gamma"]) {
  const pages = { "/": healthyPage("/", "Home"), "/guides": healthyPage("/guides", "Guides") };
  pages["/"].body += `<a href="/guides">Guides</a>`;
  for (const slug of extraGuides) {
    pages[`/guides/${slug}`] = healthyPage(`/guides/${slug}`, `${slug} guide`);
    pages["/guides"].body += `<a href="/guides/${slug}">${slug}</a>`;
  }
  return {
    pages,
    sitemap: Object.keys(pages).map((route) => ({ route })),
    registry: { guides: extraGuides.map((s) => ({ slug: s, href: `/guides/${s}`, publishedAt: "2026-09-01" })) },
  };
}

/** Audit a spec end to end. */
export async function audit(spec, { config = testConfig(), history = buildHistory([]), gsc = neutralGsc, today = TODAY } = {}) {
  const s = site(spec);
  try {
    const inv = await buildInventory({ repoRoot: s.dir, config });
    const result = analyze({ inv, config, today, gscSignal: gsc, history });
    return { ...result, inv, config };
  } finally {
    s.cleanup();
  }
}

export const ofType = (result, type) => result.findings.filter((f) => f.type === type);

/** git in a directory, synchronously; returns trimmed stdout. */
export function g(cwd, ...args) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  return (r.stdout ?? "").trim();
}

/** Turn a site directory into a git repo with one commit (and optionally a bare remote). */
export function gitify(dir, { remote = false } = {}) {
  g(dir, "init", "-b", "main");
  g(dir, "config", "user.email", "t@example.com");
  g(dir, "config", "user.name", "T");
  g(dir, "config", "core.autocrlf", "false");
  // The build output is ignored, exactly like the real repo.
  writeFileSync(join(dir, ".gitignore"), "/.next/\n/reports/\n", "utf8");
  g(dir, "add", ".");
  g(dir, "commit", "-m", "initial");
  if (!remote) return { dir };
  const bare = mkdtempSync(join(tmpdir(), "lvinit-sq-remote-"));
  spawnSync("git", ["init", "--bare", "-b", "main", bare], { encoding: "utf8" });
  g(dir, "remote", "add", "origin", bare);
  g(dir, "push", "origin", "main");
  g(dir, "fetch", "origin");
  return { dir, bare };
}

