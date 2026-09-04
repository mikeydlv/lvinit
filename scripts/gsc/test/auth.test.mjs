import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, createVerify } from "node:crypto";

import {
  readCredentialsFromEnv,
  normalizeKey,
  createAssertion,
  createTokenProvider,
  GSC_READONLY_SCOPE,
} from "../lib/auth.mjs";
import { stubFetch } from "./helpers.mjs";

/** A throwaway RSA key pair, generated per run. Never a real credential. */
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});

const TEST_EMAIL = "lvinit-gsc-test@example.iam.gserviceaccount.com";

const b64urlDecode = (segment) =>
  Buffer.from(segment.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");

test("credentials are read from a whole service-account JSON blob", () => {
  const creds = readCredentialsFromEnv({
    GSC_SERVICE_ACCOUNT_JSON: JSON.stringify({ client_email: TEST_EMAIL, private_key: privateKey }),
  });
  assert.equal(creds.clientEmail, TEST_EMAIL);
  assert.match(creds.privateKey, /BEGIN PRIVATE KEY/);
});

test("credentials are read from split email/key env vars", () => {
  const creds = readCredentialsFromEnv({
    GSC_SERVICE_ACCOUNT_EMAIL: TEST_EMAIL,
    GSC_SERVICE_ACCOUNT_KEY: privateKey,
  });
  assert.equal(creds.clientEmail, TEST_EMAIL);
});

test("missing credentials return null rather than throwing, so fixtures stay usable", () => {
  assert.equal(readCredentialsFromEnv({}), null);
  assert.equal(readCredentialsFromEnv({ GSC_SERVICE_ACCOUNT_EMAIL: TEST_EMAIL }), null);
  assert.equal(readCredentialsFromEnv({ GSC_SERVICE_ACCOUNT_JSON: "   " }), null);
});

test("malformed credential env vars produce an actionable error", () => {
  assert.throws(() => readCredentialsFromEnv({ GSC_SERVICE_ACCOUNT_JSON: "{oops" }), /not valid JSON/);
  assert.throws(
    () => readCredentialsFromEnv({ GSC_SERVICE_ACCOUNT_JSON: JSON.stringify({ client_email: TEST_EMAIL }) }),
    /missing client_email or private_key/
  );
  assert.throws(
    () => readCredentialsFromEnv({ GSC_SERVICE_ACCOUNT_EMAIL: TEST_EMAIL, GSC_SERVICE_ACCOUNT_KEY: "hunter2" }),
    /does not look like a PEM block/
  );
});

test("escaped newlines in a secret are restored before PEM parsing", () => {
  const escaped = privateKey.replace(/\n/g, "\\n");
  const restored = normalizeKey(escaped);
  assert.ok(restored.includes("\n"));
  assert.ok(!restored.includes("\\n"));
  assert.match(restored, /^-----BEGIN PRIVATE KEY-----\n/);
});

test("the assertion JWT carries the right claims and a verifiable RS256 signature", () => {
  const now = 1_800_000_000;
  const jwt = createAssertion({ clientEmail: TEST_EMAIL, privateKey, now });
  const [headerB64, claimsB64, signatureB64] = jwt.split(".");

  const header = JSON.parse(b64urlDecode(headerB64));
  assert.deepEqual(header, { alg: "RS256", typ: "JWT" });

  const claims = JSON.parse(b64urlDecode(claimsB64));
  assert.equal(claims.iss, TEST_EMAIL);
  assert.equal(claims.scope, GSC_READONLY_SCOPE);
  assert.equal(claims.aud, "https://oauth2.googleapis.com/token");
  assert.equal(claims.iat, now);
  assert.equal(claims.exp, now + 3600);

  const verifier = createVerify("RSA-SHA256");
  verifier.update(`${headerB64}.${claimsB64}`);
  verifier.end();
  const signature = Buffer.from(signatureB64.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  assert.ok(verifier.verify(publicKey, signature), "signature must verify against the public key");
});

test("the requested scope is read-only", () => {
  assert.equal(GSC_READONLY_SCOPE, "https://www.googleapis.com/auth/webmasters.readonly");
});

test("the token provider exchanges the assertion and posts form-encoded body", async () => {
  const fetchImpl = stubFetch([{ body: { access_token: "token-abc", expires_in: 3600 } }]);
  const getToken = createTokenProvider({
    credentials: { clientEmail: TEST_EMAIL, privateKey },
    fetchImpl,
    nowSeconds: () => 1_800_000_000,
  });
  assert.equal(await getToken(), "token-abc");

  const [call] = fetchImpl.calls;
  assert.equal(call.url, "https://oauth2.googleapis.com/token");
  assert.equal(call.options.headers["content-type"], "application/x-www-form-urlencoded");
  const params = new URLSearchParams(call.options.body);
  assert.equal(params.get("grant_type"), "urn:ietf:params:oauth:grant-type:jwt-bearer");
  assert.ok(params.get("assertion").split(".").length === 3);
});

test("a cached token is reused until it is close to expiring", async () => {
  let clock = 1_800_000_000;
  const fetchImpl = stubFetch([
    { body: { access_token: "first", expires_in: 3600 } },
    { body: { access_token: "second", expires_in: 3600 } },
  ]);
  const getToken = createTokenProvider({
    credentials: { clientEmail: TEST_EMAIL, privateKey },
    fetchImpl,
    nowSeconds: () => clock,
  });

  assert.equal(await getToken(), "first");
  clock += 100;
  assert.equal(await getToken(), "first", "still fresh — no second network call");
  assert.equal(fetchImpl.calls.length, 1);

  clock += 3600; // past expiry
  assert.equal(await getToken(), "second");
  assert.equal(fetchImpl.calls.length, 2);
});

test("a rejected token request explains itself without leaking the key", async () => {
  const fetchImpl = stubFetch([{ status: 400, body: { error: "invalid_grant" } }]);
  const getToken = createTokenProvider({
    credentials: { clientEmail: TEST_EMAIL, privateKey },
    fetchImpl,
  });
  await assert.rejects(getToken, (err) => {
    assert.match(err.message, /Google rejected the service-account token request \(HTTP 400\)/);
    assert.ok(!err.message.includes("PRIVATE KEY"), "the private key must never appear in an error");
    return true;
  });
});

test("a token response with no access_token is treated as a failure", async () => {
  const fetchImpl = stubFetch([{ body: { expires_in: 3600 } }]);
  const getToken = createTokenProvider({
    credentials: { clientEmail: TEST_EMAIL, privateKey },
    fetchImpl,
  });
  await assert.rejects(getToken, /no access_token/);
});
