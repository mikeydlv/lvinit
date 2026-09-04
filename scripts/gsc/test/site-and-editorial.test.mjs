import test from "node:test";
import assert from "node:assert/strict";

import { classifyRoute, neighborhoodOf, routeFromUrl, SECTIONS } from "../lib/site-inventory.mjs";
import { topicalMatch, pageRelatedness, tokenize, looksLikeComparison, escapeCell, truncate } from "../lib/text.mjs";
import { editorialRelevance, classifyIntent, topicCluster } from "../lib/editorial.mjs";
import { testInventory } from "./helpers.mjs";

const inventory = testInventory();

// ---------------------------------------------------------------------------
// Site inventory
// ---------------------------------------------------------------------------

test("the inventory finds the real LVINIT routes from the filesystem", () => {
  assert.ok(inventory.routes.includes("/"));
  assert.ok(inventory.routes.includes("/neighborhoods/summerlin"));
  assert.ok(inventory.routes.includes("/guides/summerlin-vs-henderson"));
  assert.ok(inventory.routes.length > 10);
  assert.ok(!inventory.routes.some((r) => r.startsWith("/api")), "API routes are not search landing pages");
});

test("pages carry their real metadata title", () => {
  const summerlinVsHenderson = inventory.pages.get("/guides/summerlin-vs-henderson");
  assert.ok(summerlinVsHenderson);
  assert.ok(summerlinVsHenderson.title.length > 10);
  assert.doesNotMatch(summerlinVsHenderson.title, /\| LVINIT$/, "the brand suffix is stripped for matching");
});

test("routes are classified into IA sections", () => {
  assert.equal(classifyRoute("/"), SECTIONS.HOME);
  assert.equal(classifyRoute("/neighborhoods"), SECTIONS.INDEX);
  assert.equal(classifyRoute("/neighborhoods/henderson"), SECTIONS.NEIGHBORHOOD);
  assert.equal(classifyRoute("/neighborhoods/summerlin/fourth-of-july-parade"), SECTIONS.PLACE_STORY);
  assert.equal(classifyRoute("/guides"), SECTIONS.INDEX);
  assert.equal(classifyRoute("/guides/summerlin-vs-henderson"), SECTIONS.GUIDE);
  assert.equal(classifyRoute("/search"), SECTIONS.UTILITY);
  assert.equal(classifyRoute("/contact"), SECTIONS.UTILITY);
});

test("a route's neighborhood is read from the URL when it has one", () => {
  assert.equal(neighborhoodOf("/neighborhoods/henderson/four-seasons-private-residences"), "henderson");
  assert.equal(neighborhoodOf("/guides/summerlin-vs-henderson"), null);
});

test("the internal link graph is built from real hrefs in the source", () => {
  const linked = [...inventory.pages.values()].filter((p) => p.linksTo.length > 0);
  assert.ok(linked.length > 0, "some page must link somewhere");
  const withInbound = [...inventory.pages.values()].filter((p) => p.linkedFrom.length > 0);
  assert.ok(withInbound.length > 0, "some page must be linked to");
});

test("the sitemap is compared against the filesystem so drift is visible", () => {
  assert.ok(Array.isArray(inventory.sitemap.declared));
  assert.ok(inventory.sitemap.declared.includes("/neighborhoods/summerlin"));
  assert.ok(Array.isArray(inventory.sitemap.missingFromSitemap));
  assert.ok(Array.isArray(inventory.sitemap.sitemapOrphans));
});

test("Search Console page URLs map to local routes, and foreign URLs do not", () => {
  const origin = "https://www.lvinit.com";
  assert.equal(routeFromUrl("https://www.lvinit.com/guides/summerlin-vs-henderson", origin), "/guides/summerlin-vs-henderson");
  assert.equal(routeFromUrl("https://lvinit.com/neighborhoods/henderson", origin), "/neighborhoods/henderson");
  assert.equal(routeFromUrl("https://www.lvinit.com/", origin), "/");
  assert.equal(routeFromUrl("https://www.lvinit.com/guides/x/", origin), "/guides/x", "a trailing slash is normalized away");
  assert.equal(routeFromUrl("https://example.com/guides/x", origin), null);
  assert.equal(routeFromUrl("not a url", origin), null);
  assert.equal(routeFromUrl(null, origin), null);
});

// ---------------------------------------------------------------------------
// Text + matching
// ---------------------------------------------------------------------------

test("tokenizing drops stop words and terms every LVINIT page shares", () => {
  const tokens = tokenize("what is it like moving to las vegas nevada");
  assert.ok(!tokens.includes("las"));
  assert.ok(!tokens.includes("vegas"));
  assert.ok(!tokens.includes("nevada"));
  assert.ok(tokens.includes("moving"));
});

test("plurals fold onto singulars so neighborhoods matches neighborhood", () => {
  assert.deepEqual(tokenize("neighborhoods"), tokenize("neighborhood"));
});

test("topical match scores a dedicated page above an adjacent one", () => {
  const comparison = inventory.pages.get("/guides/henderson-vs-southwest-las-vegas");
  const pillar = inventory.pages.get("/neighborhoods/henderson");
  const query = "henderson vs southwest las vegas";
  assert.ok(topicalMatch(query, comparison) > topicalMatch(query, pillar));
  assert.equal(topicalMatch(query, comparison), 1);
});

test("topical match is 0 for an unrelated page and never exceeds 1", () => {
  const home = inventory.pages.get("/");
  assert.equal(topicalMatch("moving to las vegas from california 2026", home), 0);
  for (const page of inventory.pages.values()) {
    const score = topicalMatch("summerlin vs henderson", page);
    assert.ok(score >= 0 && score <= 1);
  }
});

test("an empty query matches nothing rather than everything", () => {
  assert.equal(topicalMatch("", inventory.pages.get("/neighborhoods/summerlin")), 0);
  assert.equal(topicalMatch("las vegas", inventory.pages.get("/neighborhoods/summerlin")), 0);
});

test("page relatedness is symmetric-ish, self-zero, and boosted within a neighborhood", () => {
  const henderson = inventory.pages.get("/neighborhoods/henderson");
  const fourSeasons = inventory.pages.get("/neighborhoods/henderson/four-seasons-private-residences");
  const summerlin = inventory.pages.get("/neighborhoods/summerlin");
  assert.equal(pageRelatedness(henderson, henderson), 0);
  assert.ok(pageRelatedness(henderson, fourSeasons) > pageRelatedness(henderson, summerlin));
});

test("comparison phrasing is recognized in the forms people actually type", () => {
  for (const query of ["summerlin vs henderson", "henderson versus summerlin", "difference between summerlin and henderson"]) {
    assert.equal(looksLikeComparison(query), true, `"${query}" should read as a comparison`);
  }
  assert.equal(looksLikeComparison("summerlin homes for sale"), false);
});

test("table cells are escaped and truncated safely", () => {
  assert.equal(escapeCell("a|b"), "a\\|b");
  assert.equal(escapeCell("a\nb"), "a b");
  assert.equal(truncate("abcdef", 4), "abc…");
  assert.equal(truncate("abc", 10), "abc");
});

// ---------------------------------------------------------------------------
// Editorial relevance + intent
// ---------------------------------------------------------------------------

test("LVINIT's stated editorial priorities score high", () => {
  const priorities = [
    "summerlin vs henderson",
    "moving to las vegas from california",
    "rent first or buy in henderson",
    "new construction vs resale las vegas",
    "commute from summerlin to the strip",
    "hoa fees in southwest las vegas",
    "what is it like living in henderson",
    "uncommons development las vegas",
    "nevada property tax abatement",
  ];
  for (const query of priorities) {
    const { score } = editorialRelevance(query);
    assert.ok(score >= 0.75, `"${query}" should be clearly on-brief, scored ${score}`);
  }
});

test("Las Vegas topics that are not LVINIT's job score near zero", () => {
  for (const query of ["las vegas casino jobs", "sphere concert tickets", "best buffet on the strip"]) {
    const { score, offTopic } = editorialRelevance(query);
    assert.equal(offTopic, true, `"${query}" should be flagged off-topic`);
    assert.ok(score <= 0.2, `"${query}" scored ${score}`);
  }
});

test("stacking two priorities scores higher than either alone", () => {
  const both = editorialRelevance("summerlin vs henderson commute").score;
  const one = editorialRelevance("summerlin").score;
  assert.ok(both >= one);
  assert.ok(both <= 1);
});

test("intent separates browsing from deciding", () => {
  assert.equal(classifyIntent("moving to las vegas from california").intent, "relocation-decision");
  assert.equal(classifyIntent("summerlin vs henderson").intent, "comparison");
  assert.equal(classifyIntent("how much are hoa fees in summerlin").intent, "cost-research");
  assert.equal(classifyIntent("homes for sale in henderson").intent, "transactional");
  assert.equal(classifyIntent("lvinit").intent, "navigational");
  assert.equal(classifyIntent("summerlin").intent, "discovery");
});

test("intent depth ranks a real decision above idle browsing", () => {
  assert.ok(classifyIntent("should i rent first in las vegas").depth > classifyIntent("summerlin").depth);
  assert.ok(classifyIntent("lvinit").depth < classifyIntent("summerlin vs henderson").depth);
  for (const query of ["summerlin", "moving to las vegas", "lvinit"]) {
    const { depth } = classifyIntent(query);
    assert.ok(depth >= 0 && depth <= 1);
  }
});

test("topic clusters route a query to the right editorial angle", () => {
  assert.equal(topicCluster("summerlin vs henderson"), "area-comparison");
  assert.equal(topicCluster("moving to las vegas from california"), "relocation");
  assert.equal(topicCluster("new construction vs resale"), "area-comparison");
  assert.equal(topicCluster("commute from summerlin to the strip"), "commute-access");
  assert.equal(topicCluster("hoa fees southwest las vegas"), "cost-of-housing");
  assert.equal(topicCluster("uncommons development"), "development");
});
