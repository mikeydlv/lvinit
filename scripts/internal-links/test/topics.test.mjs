// Topical matching: distinctive vocabulary, anchor phrase generation, anchor
// quality, topic affinity, and the generic-word false-positive guard.

import test from "node:test";
import assert from "node:assert/strict";

import {
  distinctiveTokens,
  destinationPhrases,
  properNounPhrases,
  slugTokens,
  anchorQuality,
  topicAffinity,
  topicsFor,
  isDistinctivePhrase,
  GENERIC_TOKENS,
  CALENDAR_TOKENS,
} from "../lib/topics.mjs";

test("words every LVINIT page uses are not distinctive", () => {
  assert.deepEqual(distinctiveTokens("Las Vegas homes"), []);
  assert.deepEqual(distinctiveTokens("the real estate market"), []);
  assert.deepEqual(distinctiveTokens("a complete guide to living here"), []);
  assert.deepEqual(distinctiveTokens("best neighborhoods"), []);
});

test("the generic list survives stemming", () => {
  // "guides" stems to "guid", which is not literally in the list. If the stem
  // check regresses, the section prefix of every guide route becomes a shared
  // token and every guide looks related to every other guide.
  assert.deepEqual(distinctiveTokens("/guides/"), []);
  assert.ok(GENERIC_TOKENS.has("guide"));
  assert.ok(!distinctiveTokens("guides").includes("guid"));
});

test("real subjects survive", () => {
  assert.deepEqual(distinctiveTokens("Water Street District"), ["water", "street", "district"]);
  assert.ok(distinctiveTokens("Summerlin").includes("summerlin"));
  assert.ok(distinctiveTokens("mortgage rates").includes("mortgage"));
});

test("a phrase made only of generic words names nothing", () => {
  assert.equal(isDistinctivePhrase("Las Vegas homes"), false);
  assert.equal(isDistinctivePhrase("the market"), false);
  assert.equal(isDistinctivePhrase("Water Street District"), true);
});

test("a date is not a subject, so it cannot be an anchor on its own", () => {
  assert.ok(CALENDAR_TOKENS.has("august"));
  assert.equal(isDistinctivePhrase("August"), false);
  assert.equal(isDistinctivePhrase("August 2026"), false);
  assert.equal(isDistinctivePhrase("2026"), false);
  // Still fine inside a phrase that names something.
  assert.equal(isDistinctivePhrase("Summerlin in August"), true);
});

test("slugTokens drops the ambient place words and the year", () => {
  assert.deepEqual(slugTokens("/guides/las-vegas-home-prices-august-2026"), [
    "home",
    "prices",
    "august",
  ]);
  assert.deepEqual(slugTokens("/neighborhoods/summerlin"), ["summerlin"]);
});

test("properNounPhrases returns maximal capitalized runs", () => {
  // It returns runs, not names — LVINIT headlines are title case, so "Just
  // Survived" is part of the run. Narrowing a run down to the part that is
  // actually a name is destinationPhrases' job, using the slug.
  const phrases = properNounPhrases(
    "Henderson's Water Street District Just Survived a Bankruptcy",
    { maxWords: 12 }
  );
  assert.ok(phrases.includes("Henderson"));
  assert.ok(phrases.some((p) => p.startsWith("Water Street District")));
});

test("a headline phrase the slug does not back up is not the page's name", () => {
  const phrases = destinationPhrases({
    route: "/guides/ridgeway-commons-testburg",
    title: "Ridgeway Commons, Testburg: What Is Actually There Now",
  });
  const keys = phrases.map((p) => p.key);
  assert.ok(keys.includes("ridgeway commons"));
  assert.ok(
    !keys.includes("what is actually there now"),
    "a title-case sentence fragment is not an anchor phrase"
  );
});

test("destination phrases come from the slug and the headline, never invented", () => {
  const phrases = destinationPhrases({
    route: "/guides/water-street-district-henderson",
    title: "Henderson's Water Street District Just Survived a Bankruptcy",
  });
  const keys = phrases.map((p) => p.key);
  assert.ok(keys.includes("water street district"));
  assert.ok(keys.includes("water street"));
  for (const phrase of phrases) {
    assert.ok(
      phrase.sources.every((s) => ["slug", "headline", "config"].includes(s)),
      "every phrase traces back to the destination itself"
    );
  }
});

test("a name starts where the capitalized run starts — no interior slices", () => {
  const phrases = destinationPhrases({
    route: "/guides/water-street-district-henderson",
    title: "Henderson's Water Street District Just Survived a Bankruptcy",
  });
  const keys = phrases.map((p) => p.key);
  assert.ok(keys.includes("water street district"));
  assert.ok(
    !keys.includes("street district"),
    "an interior slice of a title-case run is a fragment, not a name"
  );
  assert.ok(!keys.some((k) => k.includes("just") || k.includes("survived")));
});

test("a one-word anchor must be most of what the destination is about", () => {
  // The bar is anchorQuality >= 0.8, which means a single word has to carry at
  // least 60% of the destination's slug vocabulary.
  assert.equal(anchorQuality("Summerlin", ["summerlin"]), 1, "a place page's whole subject is its name");
  assert.ok(
    anchorQuality("first", ["first", "summer"]) < 0.8,
    '"first" is a word, not the subject of "Surviving Your First Las Vegas Summer"'
  );
  assert.ok(
    anchorQuality("sales", ["sale", "july"]) < 0.8,
    '"Sales" is a word, not the subject of a July new-home-sales report'
  );
  assert.ok(anchorQuality("Street", ["water", "street", "district", "henderson"]) < 0.8);
});

test("a one-word place name is marked as a proper name; a slug fragment is not", () => {
  const phrases = destinationPhrases({
    route: "/neighborhoods/summerlin",
    title: "Summerlin, Las Vegas: A Local Guide",
  });
  const summerlin = phrases.find((p) => p.key === "summerlin");
  assert.ok(summerlin);
  assert.equal(summerlin.properName, true);
});

test("anchor quality rewards naming the destination, not length", () => {
  const core = ["water", "street", "district", "henderson"];
  const full = anchorQuality("Water Street District", core);
  const partial = anchorQuality("Water Street", core);
  const offTopic = anchorQuality("Las Vegas", core);
  assert.ok(full > partial, "naming more of the destination scores higher");
  assert.equal(offTopic, 0, "an anchor with none of the destination's words scores zero");
  assert.ok(full <= 1 && partial >= 0);
});

test("anchor quality is zero when the anchor is only generic words", () => {
  assert.equal(anchorQuality("the market", ["mortgag", "rate"]), 0);
  assert.equal(anchorQuality("homes", ["summerlin"]), 0);
});

test("topics are read off the route, the headline and the category", () => {
  assert.ok(
    topicsFor({ route: "/guides/new-build-vs-resale-las-vegas", title: "New Build vs Resale" }).includes(
      "theme:new-construction"
    )
  );
  assert.ok(
    topicsFor({ route: "/neighborhoods/henderson", title: "Henderson" }).includes("place:henderson")
  );
});

test("topic affinity: same subject is 1, a listed pair is its weight, unrelated is 0", () => {
  assert.equal(topicAffinity(["place:henderson"], ["place:henderson", "theme:development"]), 1);
  assert.equal(
    topicAffinity(["theme:new-construction"], ["theme:resale"]),
    0.95,
    "new construction and resale are the brief's own example"
  );
  assert.equal(topicAffinity(["theme:mortgage-rates"], ["theme:financing"]), 0.95);
  assert.equal(topicAffinity(["theme:event"], ["theme:property-tax"]), 0);
  assert.equal(topicAffinity([], ["theme:resale"]), 0);
});
