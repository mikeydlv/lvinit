import test from "node:test";
import assert from "node:assert/strict";

import { groupQueries } from "../lib/intent.mjs";
import { checkCoverage, pageOverlap, routePrecision, missingFacets } from "../lib/coverage.mjs";
import { testConfig, standardInventory, makeInventory, page, qrow, prow } from "./helpers.mjs";

const config = testConfig();
const inventory = standardInventory();
const groupOf = (rows, pairs = []) => groupQueries({ currentRows: rows, currentPairs: pairs })[0];

// ---------------------------------------------------------------------------
// Duplicate detection
// ---------------------------------------------------------------------------

test("an existing dedicated comparison is the SAME intent", () => {
  const g = groupOf([qrow("summerlin vs henderson", 40)]);
  const c = checkCoverage(g, inventory, config);
  assert.equal(c.verdict, "same");
  assert.equal(c.best.route, "/guides/summerlin-vs-henderson");
  assert.ok(c.best.reasons.some((r) => /same comparison/.test(r)));
});

test("a wider three-way comparison SUBSTANTIALLY overlaps a two-way question", () => {
  const g = groupOf([qrow("summerlin vs southwest", 40)]);
  const c = checkCoverage(g, inventory, config);
  assert.equal(c.verdict, "substantial");
  assert.equal(c.best.route, "/guides/summerlin-vs-henderson-vs-southwest-las-vegas");
});

test("a pillar with a 'vs' heading covers a comparison better than one that just mentions the other place", () => {
  const g = groupOf([qrow("henderson vs summerlin", 40)]);
  const withHeading = pageOverlap(g, inventory.byRoute.get("/neighborhoods/summerlin"), config);
  const withoutHeading = pageOverlap(g, page({ route: "/neighborhoods/summerlin", title: "Summerlin", body: "Henderson is mentioned. Henderson again." }), config);
  assert.ok(withHeading.overlap > withoutHeading.overlap);
});

test("the comparison of fields includes headings and body text, not just the title", () => {
  const g = groupOf([qrow("new build incentives las vegas", 40)]);
  const m = pageOverlap(g, inventory.byRoute.get("/guides/new-build-vs-resale-las-vegas"), config);
  const incentives = m.entities.find((e) => e.entity === "concept:incentives");
  assert.equal(incentives.field, "heading");
});

test("a genuinely new intent is distinct", () => {
  const g = groupOf([qrow("boulder city commute", 40)]);
  const c = checkCoverage(g, inventory, config);
  assert.ok(["distinct", "adjacent"].includes(c.verdict));
});

test("a child story is not 'the same' as its place's pillar question (route precision)", () => {
  assert.equal(routePrecision("/neighborhoods/summerlin", ["place:summerlin"]), 1);
  assert.ok(routePrecision("/neighborhoods/summerlin/fourth-of-july-parade", ["place:summerlin"]) < 0.5);
});

test("a dated Market Watch record is capped below 'same'", () => {
  const g = groupOf([qrow("henderson property tax", 40)]);
  const dated = page({ route: "/guides/henderson-property-tax-august-2026", title: "Henderson Property Tax, August 2026", headings: ["Property tax"] });
  const m = pageOverlap(g, dated, config);
  assert.ok(m.overlap < config.overlap.same);
  assert.ok(m.reasons.some((r) => /dated record/.test(r)));
});

test("same editorial cluster makes a page at least adjacent, never more on topic alone", () => {
  const g = groupOf([qrow("moving to las vegas", 40)]);
  const m = pageOverlap(g, inventory.byRoute.get("/guides/first-summer-in-vegas"), config);
  assert.ok(m.overlap >= config.overlap.adjacent);
  assert.ok(m.overlap < config.overlap.substantial);
});

// ---------------------------------------------------------------------------
// Cannibalization
// ---------------------------------------------------------------------------

const twin = () =>
  makeInventory([
    page({ route: "/guides/henderson-property-tax", title: "Henderson Property Tax Explained", headings: ["Property tax"] }),
    page({ route: "/guides/property-tax-henderson", title: "Property Tax in Henderson", headings: ["Property tax"] }),
  ]);

test("two existing pages that each fully answer the intent are POTENTIAL cannibalization", () => {
  const g = groupOf([qrow("henderson property tax", 40)]);
  const c = checkCoverage(g, twin(), config);
  assert.equal(c.cannibalization.status, "potential");
  assert.equal(c.cannibalization.routes.length, 2);
});

test("...and OBSERVED when Search Console shows both for the same queries", () => {
  const g = groupOf([qrow("henderson property tax", 40)], [prow("henderson property tax", "/guides/henderson-property-tax", 20), prow("henderson property tax", "/guides/property-tax-henderson", 20)]);
  const c = checkCoverage(g, twin(), config);
  assert.equal(c.cannibalization.status, "observed");
});

test("partial coverage (a pillar section plus a wider comparison) is support, not cannibalization", () => {
  const g = groupOf([qrow("summerlin vs southwest", 40)]);
  const c = checkCoverage(g, inventory, config);
  assert.equal(c.cannibalization.status, "none");
});

test("a GSC cannibalization finding is evidence in its own right", () => {
  const g = groupOf([qrow("summerlin vs henderson", 40)]);
  const c = checkCoverage(g, inventory, config, {
    gscCannibalization: [{ id: "GSC-2026-09-21-004", query: "summerlin vs henderson", competingUrls: [{ route: "/guides/summerlin-vs-henderson" }, { route: "/neighborhoods/summerlin" }] }],
  });
  assert.equal(c.cannibalization.status, "observed");
  assert.equal(c.cannibalization.source, "GSC-2026-09-21-004");
});

test("missing facets are the parts of the question the page does not visibly address", () => {
  const g = groupOf([qrow("is southwest cheaper than summerlin", 40)]);
  const bare = page({ route: "/guides/x-vs-y", title: "Southwest vs Summerlin", body: "Nothing about money here." });
  assert.deepEqual(missingFacets(g, bare, config), ["facet:cost"]);
  assert.deepEqual(missingFacets(g, inventory.byRoute.get("/neighborhoods/southwest-las-vegas"), config), []);
});
