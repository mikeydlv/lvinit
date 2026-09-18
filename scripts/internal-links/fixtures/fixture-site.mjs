// ---------------------------------------------------------------------------
// FIXTURE SITE — a synthetic LVINIT, for demonstrating and testing the agent
//
// None of this is real LVINIT content. Every page, figure and claim here is
// invented for the purpose of exercising a code path, and every report
// generated from it is stamped FIXTURE DATA on its face.
//
// The fixture exists so that:
//   * `npm run links:report:fixtures` shows what the agent does, with no
//     repository scan and no risk of touching a real page
//   * the tests can assert on behaviour (orphan detection, the Fair Housing
//     gate, run limits) without depending on what LVINIT happens to publish
//     this week
//
// The pages are real TSX in the same shapes as the real site, so they go
// through exactly the same extraction the real pages do.
// ---------------------------------------------------------------------------

import { finalizeGraph } from "../lib/graph.mjs";
import { extractLinks } from "../lib/source.mjs";
import { topicsFor, distinctiveTokens, slugTokens } from "../lib/topics.mjs";

const page = (body) => `import Link from "next/link";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

const linkCls = "text-lvinit-blue underline underline-offset-4";

export default function FixturePage() {
  return (
    <StoryPage meta={meta} hero={{ headline: "Fixture" }}>
${body}
    </StoryPage>
  );
}
`;

/**
 * The synthetic pages.
 *
 * Each one is built to exercise something specific, noted above it.
 */
export const FIXTURE_PAGES = [
  {
    // A pillar page. Already linked; the source page's existing link to it
    // proves an existing link is never proposed a second time.
    route: "/neighborhoods/fixtureville",
    title: "Fixtureville: A Local Guide",
    category: "Neighborhoods",
    publishedAt: "2026-01-10",
    source: page(`      <StorySection heading="Where Fixtureville is">
        <p>
          Fixtureville sits on the invented western edge of a fictional valley, and everything written
          about it on this page is synthetic test data rather than reporting about any real place.
        </p>
      </StorySection>`),
  },
  {
    // THE AUTO-EXECUTION CASE. The second paragraph already names Ridgeway
    // Commons in the page's own words, in a paragraph that carries the
    // destination's whole vocabulary. Nothing has to be written for the link to
    // read naturally.
    route: "/guides/fixtureville-vs-testburg",
    title: "Fixtureville vs. Testburg: Where Should You Actually Move?",
    category: "Comparisons",
    publishedAt: "2026-02-01",
    source: page(`      <StorySection heading="Two different shapes">
        <p>
          Fixtureville is one master plan carried out consistently, and it is worth reading the
          <Link href="/neighborhoods/fixtureville" className={linkCls}>full Fixtureville guide</Link>
          for the long version of that.
        </p>
      </StorySection>

      <StorySection heading="Housing stock">
        <p>
          Testburg is not one master plan at all. It is several building eras layered together, and most
          people move to one specific corner of Testburg rather than to Testburg as a whole. Ridgeway Commons
          is the oldest of those corners, the redevelopment district with older bones and a genuine sense of
          place that none of the newer master-planned areas can replicate.
        </p>
      </StorySection>`),
  },
  {
    // An orphan, and the destination of the case above.
    route: "/guides/ridgeway-commons",
    title: "Ridgeway Commons: Inside the Testburg Redevelopment District",
    category: "Local Feature",
    publishedAt: "2026-08-20",
    source: page(`      <StorySection heading="The district today">
        <p>
          Ridgeway Commons is the synthetic redevelopment district at the centre of this fixture, and
          every detail written about it here exists only to give the agent something to link to.
        </p>
      </StorySection>`),
  },
  {
    // FAIR HOUSING. Names the same destination just as clearly, inside
    // protected-class framing. Reported, never linked.
    route: "/guides/choosing-a-testburg-street",
    title: "Choosing a Testburg Street",
    category: "Moving Here",
    publishedAt: "2026-03-05",
    source: page(`      <StorySection heading="Who each one suits">
        <p>
          Ridgeway Commons tends to suit families who want the best schools and a safe street, which is
          exactly the kind of framing this fixture exists to make the compliance gate refuse, however
          relevant the underlying Ridgeway Commons redevelopment district may be to the reader.
        </p>
      </StorySection>`),
  },
  {
    // COMPLIANCE COPY. Names the destination inside brokerage and licensing
    // copy, which is never edited for any reason.
    route: "/guides/coverage-and-sourcing",
    title: "How This Coverage Is Sourced",
    category: "Local Feature",
    publishedAt: "2026-04-01",
    source: page(`      <StorySection heading="About this coverage">
        <p>
          Fixture Author, Fixture Real Estate Advisor, The Scofield Group, Nevada License S.0000000.
          Equal Housing Opportunity. The Ridgeway Commons redevelopment district is named here only
          inside compliance copy, which this agent is never allowed to change for any reason at all.
        </p>
      </StorySection>`),
  },
];

/** Build a graph from the fixture pages, using the real derivation code. */
export function buildFixtureGraph({ config, today }) {
  const pages = new Map();
  const existingRoutes = new Set(FIXTURE_PAGES.map((p) => p.route));

  for (const fixture of FIXTURE_PAGES) {
    const file = `app${fixture.route}/page.tsx`;
    const documents = [{ file, absolute: file, role: "page", source: fixture.source }];
    const ageDays = fixture.publishedAt
      ? Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${fixture.publishedAt}T00:00:00Z`)) / 86400000)
      : null;

    pages.set(fixture.route, {
      route: fixture.route,
      section: fixture.route.startsWith("/guides") ? "guide" : "neighborhood",
      neighborhood: fixture.route.startsWith("/neighborhoods") ? fixture.route.split("/")[2] : null,
      file,
      absolute: file,
      title: fixture.title,
      description: null,
      category: fixture.category,
      publishedAt: fixture.publishedAt,
      dateModified: null,
      gitLastModified: null,
      ageDays,
      inRegistry: true,
      inSitemap: true,
      documents,
      topics: topicsFor({ route: fixture.route, title: fixture.title, category: fixture.category }),
      coreTokens: [...new Set(distinctiveTokens(slugTokens(fixture.route).join(" ")))],
      tokens: [...new Set([...distinctiveTokens(fixture.route), ...distinctiveTokens(fixture.title)])],
      outgoing: [],
      incoming: [],
      chromeIncoming: [],
      duplicateOutgoing: [],
      brokenOutgoing: [],
      rawLinks: extractLinks(fixture.source).map((l) => ({ ...l, file, documentRole: "page" })),
    });
  }

  return finalizeGraph({
    pages,
    config,
    existingRoutes,
    sitemapRoutes: [...existingRoutes],
    chromeLinks: [],
    componentLinks: [],
    skipped: [],
  });
}
