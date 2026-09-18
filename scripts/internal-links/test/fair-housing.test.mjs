// The Internal Linking Agent's narrow "single-family" normalization.
//
// Objective property-type terms are allowed; protected-class targeting is
// still blocked; and the shared GSC ruleset itself is untouched.

import test from "node:test";
import assert from "node:assert/strict";

import { checkFairHousingForLinks, neutralizePropertyTypeTerms } from "../lib/fair-housing.mjs";
import { checkFairHousing } from "../../gsc/lib/fair-housing.mjs";

const allowed = (text) => assert.equal(checkFairHousingForLinks(text).blocked, false, `allowed: "${text}"`);
const blocked = (text) => assert.equal(checkFairHousingForLinks(text).blocked, true, `blocked: "${text}"`);

test('"single-family home" is an objective property type and is allowed', () => {
  allowed("single-family home");
  allowed("a single-family home in Henderson");
  allowed("single-family homes");
});

test('"single-family detached home" is allowed', () => {
  allowed("single-family detached home");
  allowed("single family detached home");
});

test("the real LVINIT sentences that were over-firing are now allowed", () => {
  allowed("the $490,000 single-family median (+1.0% YoY), 2,823 total sales (single-family +18.3% YoY)");
  allowed("7,147 single-family homes listed without offers");
  allowed("Both resale and new build are genuinely available in both places.");
});

test('"perfect for families" is still blocked', () => {
  blocked("perfect for families");
  const verdict = checkFairHousingForLinks("perfect for families");
  assert.equal(verdict.category, "familial-status");
});

test('"best neighborhoods for families" is still blocked', () => {
  blocked("best neighborhoods for families");
});

test("a single-family term does not launder protected-class framing next to it", () => {
  blocked("a single-family home that is perfect for families");
  blocked("single-family homes near the best schools");
  blocked("single-family homes on a safe street");
  blocked("single-family homes, great for young professionals");
});

test("a bare 'single family' with no housing noun is a household, and is left to the filter", () => {
  blocked("ideal for a single family");
  blocked("singles and couples");
  assert.equal(neutralizePropertyTypeTerms("ideal for a single family"), "ideal for a single family");
});

test("only the property-type term is rewritten", () => {
  assert.equal(
    neutralizePropertyTypeTerms("the single-family median rose; families noticed"),
    "the detached-property-type median rose; families noticed"
  );
});

test("the shared GSC filter is unchanged — it still fires on 'single-family' for query text", () => {
  // The normalization lives only in this agent. The GSC and Fact-Decay agents
  // keep exactly the behaviour they had.
  assert.equal(checkFairHousing("single-family home").blocked, true);
  assert.equal(checkFairHousing("perfect for families").blocked, true);
});

test("every other protected category behaves exactly as the shared filter does", () => {
  for (const text of [
    "safest neighborhoods in Las Vegas",
    "best schools in Summerlin",
    "church nearby",
    "55+ community",
    "wheelchair accessible",
    "section 8 rentals",
    "diverse neighborhood",
    "Water Street District is Henderson's historic downtown",
  ]) {
    assert.deepEqual(checkFairHousingForLinks(text), checkFairHousing(text), text);
  }
});
