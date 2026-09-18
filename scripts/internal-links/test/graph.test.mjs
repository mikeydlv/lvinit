// Link graph: extraction, incoming/outgoing counts, orphans, duplicates,
// broken links, and the rule that site chrome is never an editorial link.

import test from "node:test";
import assert from "node:assert/strict";

import { finalizeGraph, isChrome, daysBetween, anchorTextsFor } from "../lib/graph.mjs";
import { extractLinks, normalizeRoute } from "../lib/source.mjs";
import { graphFrom, testConfig, storyPage, section, TODAY } from "./helpers.mjs";

const PAGES = [
  {
    route: "/neighborhoods/summerlin",
    title: "Summerlin: A Local Guide",
    publishedAt: "2026-01-01",
    source: storyPage(
      section(
        "Where it is",
        'Summerlin sits on the western edge, and the <Link href="/guides/summerlin-vs-henderson" className={linkCls}>Summerlin vs Henderson guide</Link> covers the pairing in more depth than this page does.'
      )
    ),
  },
  {
    route: "/guides/summerlin-vs-henderson",
    title: "Summerlin vs. Henderson",
    publishedAt: "2026-02-01",
    source: storyPage(
      [
        section(
          "One",
          'Read the <Link href="/neighborhoods/summerlin" className={linkCls}>full Summerlin guide</Link> for the long version of all of this, because it goes much further than a comparison can.'
        ),
        section(
          "Two",
          'And again the <Link href="/neighborhoods/summerlin" className={linkCls}>Summerlin guide</Link> is worth a read, plus a <Link href="/guides/does-not-exist" className={linkCls}>dead route</Link> that goes nowhere at all.'
        ),
      ].join("\n\n")
    ),
  },
  {
    route: "/guides/water-street-district-henderson",
    title: "Water Street District, Henderson",
    publishedAt: "2026-09-15",
    source: storyPage(section("The district", "Nothing on this synthetic page links anywhere at all.")),
  },
];

test("extractLinks reads hrefs and their anchor text", () => {
  const links = extractLinks(PAGES[0].source);
  const link = links.find((l) => l.href === "/guides/summerlin-vs-henderson");
  assert.ok(link, "the link was found");
  assert.equal(link.anchor, "Summerlin vs Henderson guide");
  assert.equal(link.element, true);
  assert.ok(link.line > 0);
});

test("normalizeRoute strips trailing slashes, hashes and queries", () => {
  assert.equal(normalizeRoute("/guides/x/"), "/guides/x");
  assert.equal(normalizeRoute("/guides/x#y"), "/guides/x");
  assert.equal(normalizeRoute("/guides/x?a=1"), "/guides/x");
  assert.equal(normalizeRoute("https://example.com/x"), null);
});

test("incoming and outgoing counts are per-edge, referrers are unique", () => {
  const graph = graphFrom(PAGES);
  const summerlin = graph.pages.get("/neighborhoods/summerlin");
  // Two links from one page.
  assert.equal(summerlin.incomingEditorialCount, 2);
  assert.deepEqual(summerlin.uniqueReferrers, ["/guides/summerlin-vs-henderson"]);
  assert.equal(summerlin.outgoingEditorialCount, 1);
});

test("a page nothing links to is an orphan", () => {
  const graph = graphFrom(PAGES);
  assert.deepEqual(
    graph.orphans.map((p) => p.route),
    ["/guides/water-street-district-henderson"]
  );
  assert.equal(graph.pages.get("/neighborhoods/summerlin").isOrphan, false);
});

test("a page with one referring page is weakly linked", () => {
  const graph = graphFrom(PAGES);
  const weak = graph.weaklyLinked.map((p) => p.route);
  assert.ok(weak.includes("/neighborhoods/summerlin"));
  assert.ok(weak.includes("/guides/summerlin-vs-henderson"));
  // Orphans are listed separately, not twice.
  assert.ok(!weak.includes("/guides/water-street-district-henderson"));
});

test("a second link to the same destination from one page is a duplicate", () => {
  const graph = graphFrom(PAGES);
  const dupes = graph.duplicateLinks;
  assert.equal(dupes.length, 1);
  assert.equal(dupes[0].to, "/neighborhoods/summerlin");
  assert.equal(dupes[0].occurrence, 2);
});

test("a link to a route with no page file is broken, not an edge", () => {
  const graph = graphFrom(PAGES);
  assert.equal(graph.brokenLinks.length, 1);
  assert.equal(graph.brokenLinks[0].to, "/guides/does-not-exist");
  const source = graph.pages.get("/guides/summerlin-vs-henderson");
  assert.ok(!source.outgoing.some((e) => e.to === "/guides/does-not-exist"));
});

test("chrome links never count as editorial in-links", () => {
  const config = testConfig();
  const existingRoutes = new Set(["/guides/a"]);
  const pages = new Map([
    [
      "/guides/a",
      {
        route: "/guides/a",
        outgoing: [],
        incoming: [],
        chromeIncoming: [],
        duplicateOutgoing: [],
        brokenOutgoing: [],
        rawLinks: [],
        publishedAt: null,
        ageDays: null,
      },
    ],
  ]);
  const graph = finalizeGraph({
    pages,
    config,
    existingRoutes,
    chromeLinks: [{ href: "/guides/a", anchor: "Guides", file: "components/Navbar.tsx" }],
    componentLinks: [{ href: "/guides/a", anchor: "A card", file: "components/GuideCard.tsx" }],
  });
  const page = graph.pages.get("/guides/a");
  assert.equal(page.incomingEditorialCount, 0, "chrome and card links are not editorial");
  assert.equal(page.isOrphan, true, "a page reachable only from nav is still an editorial orphan");
  assert.equal(page.chromeIncoming.length, 2, "but they are recorded, not thrown away");
});

test("isChrome matches by path suffix", () => {
  const chrome = ["components/Navbar.tsx", "components/Footer.tsx"];
  assert.equal(isChrome("components/Navbar.tsx", chrome), true);
  assert.equal(isChrome("components/story/StorySection.tsx", chrome), false);
});

test("daysBetween is inclusive of direction and tolerant of nulls", () => {
  assert.equal(daysBetween("2026-09-10", TODAY), 7);
  assert.equal(daysBetween(null, TODAY), null);
  assert.equal(daysBetween("nonsense", TODAY), null);
});

test("anchorTextsFor collects every anchor pointing at a route", () => {
  const graph = graphFrom(PAGES);
  const anchors = anchorTextsFor(graph, "/neighborhoods/summerlin");
  assert.deepEqual(anchors.sort(), ["Summerlin guide", "full Summerlin guide"]);
});
