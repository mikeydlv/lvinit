// ---------------------------------------------------------------------------
// SEARCH CONSOLE CLIENT
//
// A thin, read-only wrapper over the Search Analytics endpoint:
//   POST https://searchconsole.googleapis.com/webmasters/v3/sites/{site}/searchAnalytics/query
//
// Read-only by construction: this module has no other endpoints and the token
// it uses carries only the webmasters.readonly scope.
//
// It handles pagination (startRow), retries transient failures, and returns raw
// Google rows untouched. Nothing here interprets, rounds, or invents a metric.
// ---------------------------------------------------------------------------

const API_BASE = "https://searchconsole.googleapis.com/webmasters/v3/sites";
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

/** Sleep helper for retry backoff. */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create a Search Console client.
 *
 * @param {object} opts
 * @param {string} opts.siteUrl        "sc-domain:lvinit.com" or "https://www.lvinit.com/"
 * @param {() => Promise<string>} opts.getAccessToken
 * @param {typeof fetch} [opts.fetchImpl]
 * @param {number} [opts.maxRetries]
 * @param {(ms:number)=>Promise<void>} [opts.sleepImpl]  injectable for tests
 */
export function createSearchConsoleClient({
  siteUrl,
  getAccessToken,
  fetchImpl = globalThis.fetch,
  maxRetries = 3,
  sleepImpl = sleep,
}) {
  if (!siteUrl) {
    throw new Error(
      "GSC_SITE_URL is not set. Use the property exactly as Search Console names " +
        'it, e.g. "sc-domain:lvinit.com" or "https://www.lvinit.com/".'
    );
  }
  const endpoint = `${API_BASE}/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;

  async function post(body) {
    let lastError = null;
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const token = await getAccessToken();
      let res;
      try {
        res = await fetchImpl(endpoint, {
          method: "POST",
          headers: {
            authorization: `Bearer ${token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
        });
      } catch (networkError) {
        lastError = networkError;
        if (attempt === maxRetries) break;
        await sleepImpl(2 ** attempt * 500);
        continue;
      }

      if (res.ok) return res.json();

      const text = await res.text();
      if (RETRYABLE_STATUS.has(res.status) && attempt < maxRetries) {
        lastError = new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
        await sleepImpl(2 ** attempt * 500);
        continue;
      }
      if (res.status === 403) {
        throw new Error(
          `Search Console returned 403 for "${siteUrl}". The service account is ` +
            "probably not added as a user on that property, or the property " +
            `string is wrong. Response: ${text.slice(0, 300)}`
        );
      }
      throw new Error(`Search Console request failed (HTTP ${res.status}): ${text.slice(0, 300)}`);
    }
    throw new Error(`Search Console request failed after ${maxRetries + 1} attempts: ${lastError?.message ?? "unknown error"}`);
  }

  /**
   * Query one dimension set for one date window, following pagination.
   * Returns Google's rows verbatim.
   */
  async function query({ startDate, endDate, dimensions, rowLimit = 5000, maxPages = 5, searchType = "web", dataState = "final", dimensionFilterGroups }) {
    const rows = [];
    for (let page = 0; page < maxPages; page += 1) {
      const body = {
        startDate,
        endDate,
        dimensions,
        rowLimit,
        startRow: page * rowLimit,
        type: searchType,
        dataState,
      };
      if (dimensionFilterGroups) body.dimensionFilterGroups = dimensionFilterGroups;

      const payload = await post(body);
      const batch = payload?.rows ?? [];
      rows.push(...batch);
      if (batch.length < rowLimit) break;
    }
    return rows;
  }

  return { query, endpoint };
}

/**
 * Normalize one Google row into the shape the rest of the agent uses.
 * `keys` order follows the `dimensions` array that produced it.
 *
 * These are RAW Search Console metrics — clicks, impressions, ctr, position —
 * carried through unchanged. Anything derived is computed elsewhere and clearly
 * labelled as calculated.
 */
export function normalizeRow(row, dimensions) {
  const out = {
    clicks: Number(row.clicks) || 0,
    impressions: Number(row.impressions) || 0,
    ctr: Number(row.ctr) || 0,
    position: Number(row.position) || 0,
  };
  dimensions.forEach((dim, i) => {
    out[dim] = row.keys?.[i] ?? "";
  });
  return out;
}

/** Normalize a whole result set. */
export function normalizeRows(rows, dimensions) {
  return rows.map((row) => normalizeRow(row, dimensions));
}
