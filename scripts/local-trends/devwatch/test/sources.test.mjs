import test from "node:test";
import assert from "node:assert/strict";

import { SOURCES, validateRegistry, trendFeeds, authorityForDomain, sourcesFor, PRIMARY_MAX_AUTHORITY } from "../../sources.mjs";
import { loadConfig as loadTrendConfig } from "../../config.mjs";
import { authorityOf, authorityClass, withAuthority } from "../lib/authority.mjs";
import { collectDevSources, fetchConditional, isDue, agendaMaterial, collectLegistar } from "../lib/collect.mjs";
import { config, TODAY } from "./helpers.mjs";

test("source registry: every record is complete and valid", () => {
  assert.deepEqual(validateRegistry(), []);
  for (const s of SOURCES) for (const k of ["name", "organization", "type", "url", "geography", "topics", "method", "authority", "cadence", "automatedReliable", "notes"]) assert.ok(k in s, `${s.id}.${k}`);
});

test("source registry: invalid records are reported, not ignored", () => {
  const bad = [{ id: "x", name: "X", organization: "X", type: "local-news", url: "not a url", geography: [], topics: [], method: "carrier-pigeon", authority: 42, cadence: "hourly", notes: "", usedBy: [], automatedReliable: "yes" }];
  const problems = validateRegistry(bad);
  for (const want of ["url is not a URL", "unknown method", "authority must be 1–10", "cadence must be", "automatedReliable"]) assert.ok(problems.some((p) => p.includes(want)), want);
});

test("the Local Trend Agent reads its feeds from the same registry — nothing changed for it", () => {
  const feeds = loadTrendConfig().sources.feeds;
  assert.deepEqual(feeds.map((f) => f.id), ["henderson-news", "city-lv-news", "rj-business", "rj-local", "sun-business", "sun-news", "vegas-inc", "ktnv", "8newsnow", "news3lv", "nevada-current", "reddit"]);
  assert.deepEqual(feeds, trendFeeds());
  assert.equal(feeds.find((f) => f.id === "reddit").tier, "social");
});

test("source hierarchy: primary vs secondary vs lead", () => {
  assert.equal(authorityForDomain("cityofhenderson.com"), 1);
  assert.equal(authorityForDomain("www.dot.nv.gov"), 3);
  assert.equal(authorityForDomain("rtcsnv.com"), 4);
  assert.equal(authorityForDomain("kbhome.com"), 5);
  assert.equal(authorityForDomain("reviewjournal.com"), 8);
  assert.equal(authorityForDomain("some-seo-blog.biz"), 9);
  assert.equal(authorityForDomain("reddit.com"), 10);
  assert.equal(authorityForDomain("anything.nv.gov"), 1);
  assert.equal(authorityClass(2), "primary");
  assert.equal(authorityClass(PRIMARY_MAX_AUTHORITY), "primary");
  assert.equal(authorityClass(8), "secondary");
  assert.equal(authorityClass(10), "lead");
  // Google News items take the PUBLISHER's authority, never Google's.
  assert.equal(authorityOf({ via: "google-news", sourceDomain: "", sourceName: "Las Vegas Review-Journal" }), 8);
  assert.equal(authorityOf({ via: "google-news", sourceDomain: "", sourceName: "Random Aggregator" }), 9);
  assert.equal(authorityOf({ via: "legistar" }), 2);
  assert.equal(authorityOf({ via: "henderson-news" }), 1);
  const [w] = withAuthority([{ via: "google-news", sourceDomain: "prnewswire.com", sourceName: "PR Newswire" }]);
  assert.equal(w.authority, 5);
  assert.equal(w.pressWire, true);
});

test("inaccessible and manual sources are recorded as SOURCE_CHECK_REQUIRED, never guessed", async () => {
  const fetchImpl = async () => ({ ok: false, status: 403, headers: { get: () => null }, text: async () => "Forbidden" });
  const r = await collectDevSources({ config, sourcesState: { sources: {} }, today: TODAY, fetchImpl, delay: async () => {} });
  assert.equal(r.items.length, 0);
  const manual = r.health.filter((h) => h.manual);
  assert.ok(manual.length >= 5);
  assert.ok(manual.every((h) => h.status === "SOURCE_CHECK_REQUIRED"));
  const failed = r.health.filter((h) => !h.manual && !h.skipped);
  assert.ok(failed.length > 0 && failed.every((h) => !h.ok));
});

test("malformed sources fail loudly, not silently", async () => {
  const legistar = sourcesFor("development-watch").find((s) => s.method === "legistar");
  const fetchImpl = async () => ({ ok: true, status: 200, headers: { get: () => null }, text: async () => "<html>not json</html>" });
  const r = await collectLegistar(legistar, { config, sourcesState: {}, today: TODAY, fetchImpl, delay: async () => {} });
  assert.equal(r.health.ok, false);
  assert.match(r.health.error, /malformed/);
  const rssFetch = async () => ({ ok: true, status: 200, headers: { get: () => null }, text: async () => "<rss><channel>no items</channel></rss>" });
  const d = await collectDevSources({ config, sourcesState: { sources: {} }, today: TODAY, fetchImpl: rssFetch, delay: async () => {} });
  const skye = d.health.find((h) => h.id === "skye-canyon-news");
  assert.equal(skye.ok, false);
  assert.match(skye.error, /no items parsed/);
});

test("efficiency: conditional GETs and weekly cadence", async () => {
  let sent = null;
  const fetchImpl = async (_url, opts) => {
    sent = opts.headers;
    return { ok: false, status: 304, headers: { get: () => null }, text: async () => "" };
  };
  const r = await fetchConditional("https://example.com/feed", { fetchImpl, config, etag: '"abc"', lastModified: "Mon, 21 Sep 2026 00:00:00 GMT" });
  assert.equal(r.notModified, true);
  assert.equal(sent["If-None-Match"], '"abc"');
  assert.equal(sent["If-Modified-Since"], "Mon, 21 Sep 2026 00:00:00 GMT");
  const weekly = { id: "w", cadence: "weekly" };
  assert.equal(isDue(weekly, { sources: { w: { last_success: "2026-09-20" } } }, TODAY), false);
  assert.equal(isDue(weekly, { sources: { w: { last_success: "2026-09-14" } } }, TODAY), true);
  assert.equal(isDue({ id: "d", cadence: "daily" }, { sources: { d: { last_success: TODAY } } }, TODAY), true);
});

test("agenda materiality: routine items suppressed, real entitlements kept", () => {
  const m = (t) => agendaMaterial([t], { config, knownEntities: [] });
  assert.equal(m("DR-26-0457-FOREST HILL: DESIGN REVIEW for residential models in conjunction with a single-family residential development on 4.73 acres within Enterprise.").material, false);
  assert.equal(m("DR-26-0100-BIG LAND: DESIGN REVIEW for an existing industrial site on a portion of 214.3 acres within Whitney.").material, false, "big parcel, no entitlement");
  assert.equal(m("TM-26-500098-ROOHANI: TENTATIVE MAP for a 113 single-family residential lots on 14.92 acres within Enterprise.").material, false, "below 150");
  assert.equal(m("TM-26-599001-BIG HOMES LLC: TENTATIVE MAP consisting of 420 single-family residential lots on 61 acres within Enterprise.").material, true);
  assert.equal(m("ZC-26-0377-SIMPLOT: ZONE CHANGES to reclassify 500 acres to residential within Moapa Valley.").material, false, "outlying town");
  assert.equal(m("UC-26-0466-PATRIOT: USE PERMIT for a proposed rock crushing facility on 32.5 acres within Sloan.").material, false);
});
