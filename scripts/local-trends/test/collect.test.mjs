import test from "node:test";
import assert from "node:assert/strict";

import { loadConfig } from "../config.mjs";
import { parseFeed, cleanGoogleNewsItem, buildGoogleQueries, tierForDomain, collect } from "../lib/feeds.mjs";
import { canonicalUrl, normalizeItems, dedupe, classifyItem, triage, titleSimilarity } from "../lib/classify.mjs";

const config = loadConfig();

const RSS = `<?xml version="1.0"?><rss version="2.0"><channel>
<item><title><![CDATA[Crews break ground on Fixture Parkway]]></title><link>https://example.com/a?utm_source=x</link>
<pubDate>Tue, 15 Sep 2026 10:00:00 GMT</pubDate><description>&lt;p&gt;Clark County crews broke ground.&lt;/p&gt;</description></item>
</channel></rss>`;

const ATOM = `<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>What is being built in Summerlin?</title>
<link href="https://www.reddit.com/r/vegas/comments/1/x/"/><updated>2026-09-16T01:00:00+00:00</updated></entry></feed>`;

const GOOGLE = `<rss><channel><item><title>Fixture Ridge approved in West Henderson - Fixture Journal</title>
<link>https://news.google.com/rss/articles/abc?oc=5</link><pubDate>Wed, 16 Sep 2026 03:11:00 GMT</pubDate>
<description>&lt;a href="x"&gt;Fixture Ridge approved in West Henderson&lt;/a&gt;</description>
<source url="https://www.reviewjournal.com">Fixture Journal</source></item></channel></rss>`;

test("parses RSS, decoding CDATA and escaped HTML", () => {
  const [it] = parseFeed(RSS);
  assert.equal(it.title, "Crews break ground on Fixture Parkway");
  assert.equal(it.snippet, "Clark County crews broke ground.");
  assert.equal(it.published, "2026-09-15T10:00:00.000Z");
});

test("parses Atom (Reddit)", () => {
  const [it] = parseFeed(ATOM);
  assert.equal(it.url, "https://www.reddit.com/r/vegas/comments/1/x/");
  assert.ok(it.published.startsWith("2026-09-16"));
});

test("Google News: publisher split from the headline, repeated snippet dropped", () => {
  const it = cleanGoogleNewsItem(parseFeed(GOOGLE)[0]);
  assert.equal(it.title, "Fixture Ridge approved in West Henderson");
  assert.equal(it.sourceName, "Fixture Journal");
  assert.equal(it.snippet, "");
  assert.equal(it.sourceUrl, "https://www.reviewjournal.com");
});

test("Google News: hyphenated publishers and section labels are stripped", () => {
  const it = cleanGoogleNewsItem({ title: "High-rise condo sales hit a record year | New Homes | Homes - Las Vegas Review-Journal", snippet: "", sourceName: "Las Vegas Review-Journal" });
  assert.equal(it.title, "High-rise condo sales hit a record year");
});

test("every Google query carries Las Vegas context", () => {
  for (const q of buildGoogleQueries(config)) assert.match(q, /Las Vegas|Henderson|Nevada|Clark County|Harry Reid|NV/i, q);
});

test("source tiers", () => {
  assert.equal(tierForDomain("cityofhenderson.com", config), "official");
  assert.equal(tierForDomain("clarkcountynv.gov", config), "official");
  assert.equal(tierForDomain("lennar.com", config), "builder");
  assert.equal(tierForDomain("reviewjournal.com", config), "news");
});

test("canonical URLs drop tracking params and www", () => {
  assert.equal(canonicalUrl("https://www.example.com/a/?utm_source=x&id=2#top"), "https://example.com/a?id=2");
});

test("dedupe keeps one story per event, preferring the official source", () => {
  const items = normalizeItems([
    { title: "Henderson council approves Fixture Ridge community", url: "https://example.com/1", tier: "news", sourceName: "TV" },
    { title: "Fixture Ridge community approved by Henderson council", url: "https://example.com/2", tier: "official", sourceName: "City" },
    { title: "Fixture Ridge community approved?", url: "https://example.com/3", tier: "social", sourceName: "Reddit" },
  ]);
  const { kept, duplicates } = dedupe(items);
  assert.equal(kept.filter((k) => k.tier !== "social").length, 1);
  assert.equal(kept.find((k) => k.tier !== "social").sourceName, "City");
  assert.equal(duplicates.length, 1);
  assert.equal(kept.filter((k) => k.tier === "social").length, 1, "social is never merged into news");
});

test("a North Carolina 'West Henderson' is out of area", () => {
  const c = classifyItem({ title: "West Henderson hosts North Buncombe in flag football", snippet: "", via: "google-news" }, config);
  assert.equal(c.outOfArea, true);
  assert.deepEqual(c.areas, []);
});

test("local sources imply Vegas context", () => {
  const c = classifyItem({ title: "Henderson opens new park near Inspirada", snippet: "", via: "henderson-news" }, config);
  assert.ok(c.areas.includes("henderson"));
  assert.ok(c.areas.includes("inspirada"));
  assert.ok(c.categories.includes("neighborhood-change"));
});

test("noise rules catch crime headlines", () => {
  const c = classifyItem({ title: "Police investigate shooting in Summerlin", snippet: "", via: "rj-local" }, config);
  assert.equal(c.noise, "crime / public safety");
});

test("triage: already-reviewed stories are skipped; near-identical headlines too", () => {
  const items = normalizeItems([
    { title: "Summerlin gets a new grocery store at Fixture Park", url: "https://example.com/g1", tier: "news", via: "rj-business", published: "2026-09-16T00:00:00Z" },
    { title: "New grocery store at Fixture Park in Summerlin gets approval", url: "https://example.com/g2", tier: "news", via: "sun-business", published: "2026-09-16T00:00:00Z" },
  ]);
  const reviewed = { items: { x: { url: "https://example.com/g1", title: "Summerlin gets a new grocery store at Fixture Park", first_seen: "2026-09-15" } } };
  const t = triage(items, config, { today: "2026-09-17", reviewed, watchlist: { projects: [] } });
  assert.equal(t.alreadyReviewed.length, 2);
  assert.equal(t.candidates.length, 0);
});

test("triage: stale stories are dropped, social becomes a signal", () => {
  const items = normalizeItems([
    { title: "Summerlin trail extension approved", url: "https://example.com/old", tier: "news", via: "rj-local", published: "2026-08-01T00:00:00Z" },
    { title: "Why is everyone moving to Summerlin?", url: "https://example.com/r1", tier: "social", via: "reddit", published: "2026-09-16T00:00:00Z" },
  ]);
  const t = triage(items, config, { today: "2026-09-17", reviewed: { items: {} }, watchlist: { projects: [] } });
  assert.equal(t.candidates.length, 0);
  assert.equal(t.signals.length, 1);
});

test("headline similarity", () => {
  assert.ok(titleSimilarity("Council approves Fixture Ridge", "Fixture Ridge approved by council") >= 0.5);
  assert.ok(titleSimilarity("Council approves Fixture Ridge", "New coffee shop in Arts District") < 0.2);
});

test("collect survives a failing feed and records it", async () => {
  const cfg = loadConfig({
    sources: {
      feeds: [
        { id: "ok", name: "OK", tier: "news", url: "https://example.com/ok" },
        { id: "bad", name: "Bad", tier: "news", url: "https://example.com/bad" },
      ],
      googleNews: { enabled: false },
      politeDelayMs: 0,
    },
  });
  const fetchImpl = async (url) =>
    url.endsWith("/ok")
      ? { ok: true, status: 200, url, text: async () => RSS }
      : { ok: false, status: 503, url, text: async () => "" };
  const { items, health } = await collect(cfg, { fetchImpl, delay: async () => {} });
  assert.equal(items.length, 1);
  assert.equal(health.find((h) => h.id === "bad").ok, false);
  assert.equal(health.find((h) => h.id === "ok").ok, true);
});
