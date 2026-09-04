import test from "node:test";
import assert from "node:assert/strict";

import { createSearchConsoleClient, normalizeRow, normalizeRows } from "../lib/client.mjs";
import { stubFetch } from "./helpers.mjs";

const getAccessToken = async () => "test-token";
const noSleep = async () => {};

const row = (keys, clicks, impressions, position) => ({
  keys,
  clicks,
  impressions,
  ctr: impressions ? clicks / impressions : 0,
  position,
});

test("a missing site URL is refused rather than guessed at", () => {
  assert.throws(() => createSearchConsoleClient({ siteUrl: "", getAccessToken }), /GSC_SITE_URL is not set/);
});

test("the endpoint URL-encodes the property, including sc-domain properties", () => {
  const client = createSearchConsoleClient({ siteUrl: "sc-domain:lvinit.com", getAccessToken });
  assert.equal(
    client.endpoint,
    "https://searchconsole.googleapis.com/webmasters/v3/sites/sc-domain%3Alvinit.com/searchAnalytics/query"
  );
  const prefix = createSearchConsoleClient({ siteUrl: "https://www.lvinit.com/", getAccessToken });
  assert.ok(prefix.endpoint.includes("https%3A%2F%2Fwww.lvinit.com%2F"));
});

test("a query sends the window, dimensions, type and dataState, with a bearer token", async () => {
  const fetchImpl = stubFetch([{ body: { rows: [row(["summerlin"], 3, 40, 8.1)] } }]);
  const client = createSearchConsoleClient({ siteUrl: "sc-domain:lvinit.com", getAccessToken, fetchImpl });

  const rows = await client.query({
    startDate: "2026-08-05",
    endDate: "2026-09-01",
    dimensions: ["query"],
    rowLimit: 100,
  });

  assert.equal(rows.length, 1);
  const sent = JSON.parse(fetchImpl.calls[0].options.body);
  assert.equal(sent.startDate, "2026-08-05");
  assert.equal(sent.endDate, "2026-09-01");
  assert.deepEqual(sent.dimensions, ["query"]);
  assert.equal(sent.type, "web");
  assert.equal(sent.dataState, "final");
  assert.equal(sent.startRow, 0);
  assert.equal(fetchImpl.calls[0].options.headers.authorization, "Bearer test-token");
});

test("pagination continues while a full page comes back and stops when it does not", async () => {
  const fullPage = Array.from({ length: 2 }, (_, i) => row([`q${i}`], 1, 10, 5));
  const fetchImpl = stubFetch([
    { body: { rows: fullPage } },
    { body: { rows: fullPage } },
    { body: { rows: [row(["last"], 1, 10, 5)] } },
  ]);
  const client = createSearchConsoleClient({ siteUrl: "sc-domain:lvinit.com", getAccessToken, fetchImpl });

  const rows = await client.query({
    startDate: "2026-08-05",
    endDate: "2026-09-01",
    dimensions: ["query"],
    rowLimit: 2,
    maxPages: 10,
  });

  assert.equal(rows.length, 5);
  assert.equal(fetchImpl.calls.length, 3);
  assert.equal(JSON.parse(fetchImpl.calls[2].options.body).startRow, 4);
});

test("maxPages is a hard stop, so a misconfiguration cannot loop forever", async () => {
  const fullPage = [row(["a"], 1, 10, 5), row(["b"], 1, 10, 5)];
  const fetchImpl = stubFetch([
    { body: { rows: fullPage } },
    { body: { rows: fullPage } },
    { body: { rows: fullPage } },
  ]);
  const client = createSearchConsoleClient({ siteUrl: "sc-domain:lvinit.com", getAccessToken, fetchImpl });
  const rows = await client.query({
    startDate: "2026-08-05",
    endDate: "2026-09-01",
    dimensions: ["query"],
    rowLimit: 2,
    maxPages: 2,
  });
  assert.equal(rows.length, 4);
  assert.equal(fetchImpl.calls.length, 2);
});

test("an empty response is a valid answer, not an error", async () => {
  const fetchImpl = stubFetch([{ body: {} }]);
  const client = createSearchConsoleClient({ siteUrl: "sc-domain:lvinit.com", getAccessToken, fetchImpl });
  const rows = await client.query({ startDate: "2026-08-05", endDate: "2026-09-01", dimensions: ["query"] });
  assert.deepEqual(rows, []);
});

test("transient failures are retried, then succeed", async () => {
  const fetchImpl = stubFetch([
    { status: 503, body: "temporarily unavailable" },
    { status: 429, body: "rate limited" },
    { body: { rows: [row(["ok"], 1, 10, 5)] } },
  ]);
  const client = createSearchConsoleClient({
    siteUrl: "sc-domain:lvinit.com",
    getAccessToken,
    fetchImpl,
    sleepImpl: noSleep,
  });
  const rows = await client.query({ startDate: "2026-08-05", endDate: "2026-09-01", dimensions: ["query"] });
  assert.equal(rows.length, 1);
  assert.equal(fetchImpl.calls.length, 3);
});

test("a 403 names the most likely cause: the service account is not on the property", async () => {
  const fetchImpl = stubFetch([{ status: 403, body: "forbidden" }]);
  const client = createSearchConsoleClient({
    siteUrl: "sc-domain:lvinit.com",
    getAccessToken,
    fetchImpl,
    sleepImpl: noSleep,
  });
  await assert.rejects(
    () => client.query({ startDate: "2026-08-05", endDate: "2026-09-01", dimensions: ["query"] }),
    /not added as a user on that property/
  );
});

test("a non-retryable error is surfaced immediately", async () => {
  const fetchImpl = stubFetch([{ status: 400, body: "bad request" }]);
  const client = createSearchConsoleClient({
    siteUrl: "sc-domain:lvinit.com",
    getAccessToken,
    fetchImpl,
    sleepImpl: noSleep,
  });
  await assert.rejects(
    () => client.query({ startDate: "2026-08-05", endDate: "2026-09-01", dimensions: ["query"] }),
    /HTTP 400/
  );
  assert.equal(fetchImpl.calls.length, 1, "a 400 must not be retried");
});

test("retries give up after maxRetries and say so", async () => {
  const fetchImpl = stubFetch([
    { status: 500, body: "boom" },
    { status: 500, body: "boom" },
  ]);
  const client = createSearchConsoleClient({
    siteUrl: "sc-domain:lvinit.com",
    getAccessToken,
    fetchImpl,
    sleepImpl: noSleep,
    maxRetries: 1,
  });
  await assert.rejects(
    () => client.query({ startDate: "2026-08-05", endDate: "2026-09-01", dimensions: ["query"] }),
    /HTTP 500/
  );
});

test("normalizeRow maps dimension keys positionally and never fabricates a metric", () => {
  const normalized = normalizeRow(row(["summerlin vs henderson", "https://www.lvinit.com/guides/x"], 4, 100, 7.5), [
    "query",
    "page",
  ]);
  assert.equal(normalized.query, "summerlin vs henderson");
  assert.equal(normalized.page, "https://www.lvinit.com/guides/x");
  assert.equal(normalized.clicks, 4);
  assert.equal(normalized.impressions, 100);
  assert.equal(normalized.position, 7.5);
  assert.equal(normalized.ctr, 0.04);
});

test("missing metrics normalize to zero rather than undefined or NaN", () => {
  const normalized = normalizeRow({ keys: ["q"] }, ["query"]);
  assert.deepEqual(
    { clicks: normalized.clicks, impressions: normalized.impressions, ctr: normalized.ctr, position: normalized.position },
    { clicks: 0, impressions: 0, ctr: 0, position: 0 }
  );
});

test("a missing key becomes an empty string, not undefined", () => {
  const normalized = normalizeRow({ keys: [], clicks: 1, impressions: 2, ctr: 0.5, position: 1 }, ["query"]);
  assert.equal(normalized.query, "");
});

test("normalizeRows maps a whole batch", () => {
  const rows = normalizeRows([row(["a"], 1, 10, 2), row(["b"], 2, 20, 3)], ["query"]);
  assert.deepEqual(rows.map((r) => r.query), ["a", "b"]);
});
