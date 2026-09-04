// ---------------------------------------------------------------------------
// GOOGLE SERVICE-ACCOUNT AUTH (zero dependencies)
//
// Search Console has no unattended "user login" — for a scheduled job the clean
// path is a Google Cloud service account that Mikey adds as a user on the
// LVINIT Search Console property. That is what this module implements.
//
// The flow (OAuth 2.0 JWT bearer, RFC 7523):
//   1. build a JWT claiming the service account's identity + the readonly scope
//   2. sign it RS256 with the service account's private key (node:crypto)
//   3. POST it to Google's token endpoint
//   4. get back a short-lived access token, cached until just before it expires
//
// We deliberately do NOT pull in `googleapis`: it is a very large dependency for
// a site that currently ships four runtime packages, and this is ~60 lines of
// standard, well-documented protocol.
//
// CREDENTIALS NEVER LIVE IN THE REPOSITORY. They come from the environment:
//   GSC_SERVICE_ACCOUNT_JSON    the whole downloaded key file, as one string
//   -- or --
//   GSC_SERVICE_ACCOUNT_EMAIL   client_email from that file
//   GSC_SERVICE_ACCOUNT_KEY     private_key from that file (\n escapes are fine)
// ---------------------------------------------------------------------------

import { createSign } from "node:crypto";

export const GSC_READONLY_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
/** Refresh this many seconds before the token actually expires. */
const EXPIRY_SKEW_SECONDS = 60;

/** base64url without padding, as JWTs require. */
function base64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf8");
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Pull service-account credentials out of the environment.
 * Returns null (never throws) when nothing is configured, so callers can fall
 * back to fixtures with a clear message instead of a stack trace.
 */
export function readCredentialsFromEnv(env = process.env) {
  const rawJson = env.GSC_SERVICE_ACCOUNT_JSON;
  if (rawJson && rawJson.trim()) {
    let parsed;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      throw new Error(
        "GSC_SERVICE_ACCOUNT_JSON is set but is not valid JSON. Paste the whole " +
          "downloaded key file as a single-line secret."
      );
    }
    if (!parsed.client_email || !parsed.private_key) {
      throw new Error("GSC_SERVICE_ACCOUNT_JSON is missing client_email or private_key.");
    }
    return { clientEmail: parsed.client_email, privateKey: normalizeKey(parsed.private_key) };
  }

  const clientEmail = env.GSC_SERVICE_ACCOUNT_EMAIL;
  const privateKey = env.GSC_SERVICE_ACCOUNT_KEY;
  if (clientEmail && privateKey && clientEmail.trim() && privateKey.trim()) {
    return { clientEmail: clientEmail.trim(), privateKey: normalizeKey(privateKey) };
  }
  return null;
}

/**
 * Secret managers and .env files routinely turn real newlines into the two
 * characters \ and n. PEM parsing needs them back.
 */
export function normalizeKey(key) {
  const normalized = String(key).replace(/\\n/g, "\n").trim();
  if (!normalized.includes("BEGIN") || !normalized.includes("PRIVATE KEY")) {
    throw new Error(
      "The service-account private key does not look like a PEM block. It should " +
        "start with -----BEGIN PRIVATE KEY----- ."
    );
  }
  return `${normalized}\n`;
}

/**
 * Build and sign the assertion JWT. Exposed for testing (a test can generate a
 * throwaway key pair and verify the signature) — nothing else should call it.
 */
export function createAssertion({ clientEmail, privateKey, scope = GSC_READONLY_SCOPE, now = Math.floor(Date.now() / 1000), lifetimeSeconds = 3600 }) {
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: clientEmail,
    scope,
    aud: TOKEN_ENDPOINT,
    iat: now,
    exp: now + lifetimeSeconds,
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = base64url(signer.sign(privateKey));
  return `${signingInput}.${signature}`;
}

/**
 * A tiny access-token provider with in-process caching.
 *
 * @param {object} opts
 * @param {{clientEmail:string,privateKey:string}} opts.credentials
 * @param {typeof fetch} [opts.fetchImpl]  injectable for tests
 * @param {() => number} [opts.nowSeconds] injectable clock for tests
 */
export function createTokenProvider({ credentials, fetchImpl = globalThis.fetch, nowSeconds = () => Math.floor(Date.now() / 1000) }) {
  if (!credentials?.clientEmail || !credentials?.privateKey) {
    throw new Error("createTokenProvider needs { clientEmail, privateKey }.");
  }
  let cached = null; // { token, expiresAt }

  return async function getAccessToken() {
    const now = nowSeconds();
    if (cached && cached.expiresAt - EXPIRY_SKEW_SECONDS > now) return cached.token;

    const assertion = createAssertion({ ...credentials, now });
    const body = new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    });

    const res = await fetchImpl(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const text = await res.text();
    if (!res.ok) {
      // Google returns a JSON error body; surface it without leaking the key.
      throw new Error(
        `Google rejected the service-account token request (HTTP ${res.status}). ` +
          `Response: ${text.slice(0, 400)}`
      );
    }
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error(`Token endpoint returned non-JSON: ${text.slice(0, 200)}`);
    }
    if (!payload.access_token) {
      throw new Error(`Token endpoint returned no access_token: ${text.slice(0, 200)}`);
    }
    cached = {
      token: payload.access_token,
      expiresAt: now + (Number(payload.expires_in) || 3600),
    };
    return cached.token;
  };
}
