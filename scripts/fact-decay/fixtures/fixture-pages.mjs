// ---------------------------------------------------------------------------
// SYNTHETIC FIXTURE PAGES — NOT LVINIT CONTENT
//
// Every page, figure, program, project and source below is INVENTED. None of it
// describes LVINIT's real published content, and no report generated from it
// should ever be acted on. Reports built from these fixtures are stamped
// "FIXTURE DATA" from the first line.
//
// They exist for two reasons:
//
//   1. so the whole pipeline can be run and read without credentials, without
//      network access, and without touching the real site
//   2. so the awkward cases have somewhere to live — an empty page, a page of
//      pure opinion, a page stuffed with numbers that are all durable history,
//      a passed deadline, a project whose hearing date has come and gone, a
//      claim with no source at all
//
// The fixtures are deliberately written as real .tsx source strings and passed
// through the REAL extraction code, so a fixture run exercises the parser
// rather than bypassing it.
// ---------------------------------------------------------------------------

import {
  extractTextBlocks,
  extractStoryMeta,
  extractFreshnessStamps,
  extractDeclaredSources,
  extractDevelopmentProjects,
  extractDataRows,
  extractExternalLinks,
} from "../lib/extract.mjs";
import { resolveLastReviewed } from "../lib/content-inventory.mjs";
import { daysBetween } from "../lib/dates.mjs";

/** A high-risk assistance-program guide with a deadline that has passed. */
const ASSISTANCE_GUIDE = `
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";

const meta: StoryMeta = {
  title: "Fixture Down Payment Help 2025 | LVINIT",
  headline: "Fixture Down Payment Help 2025",
  description: "A synthetic guide used only for testing.",
  path: "/guides/fixture-down-payment-help-2025",
  datePublished: "2025-06-01",
  dateModified: "2025-06-01",
};

export default function Page() {
  return (
    <StoryPage>
      <StorySection heading="What the program pays">
        <p>
          The Fixture Worker Advantage Program provides $20,000 in down payment
          assistance to eligible Nevada workers, structured as a no-interest
          second mortgage.
        </p>
        <p>
          Household income must be at or below $147,300 in Clark County, and the
          program is available only through December 31, 2025.
        </p>
        <p>
          The minimum credit score is 640, and buyers currently need at least
          3.5% down on an FHA loan.
        </p>
      </StorySection>
      <StorySection heading="What this costs">
        <p>
          HOA dues in the fixture community run about $95 a month, which is an
          estimate and should be confirmed with the association.
        </p>
      </StorySection>
      <AreaSources checked="Checked 1 June 2025" sources={sources} />
    </StoryPage>
  );
}

export const sources = [
  {
    label: "Fixture Housing Division: Worker Advantage",
    url: "https://example-fixture-housing.nv.gov/worker-advantage",
    used: "The $20,000 benefit amount, the $147,300 Clark County income limit, and the December 31, 2025 end date.",
  },
];
`;

/** A neighborhood guide whose Development Watch has drifted. */
const NEIGHBORHOOD_GUIDE = `
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { AreaSources, DevelopmentWatch } from "@/components/area";

const meta: StoryMeta = {
  title: "Fixture Village | LVINIT",
  headline: "Fixture Village",
  description: "A synthetic neighborhood page used only for testing.",
  path: "/neighborhoods/fixture-village",
  datePublished: "2026-01-15",
};

export default function Page() {
  return (
    <StoryPage>
      <StorySection heading="Getting around">
        <p>
          The CC-215 interchange rebuild is under construction and currently
          carries lane restrictions through a 55 mph work zone.
        </p>
        <p>
          Fixture Village sits about 14 minutes from the Strip, though that
          drive time will change while the interchange work continues.
        </p>
      </StorySection>
      <DevelopmentWatch heading="Development Watch" updated="Updated January 2026" projects={developmentProjects} />
      <AreaSources checked="Checked 15 January 2026" sources={sources} />
    </StoryPage>
  );
}

export const developmentProjects = [
  {
    name: "Fixture Commons apartments",
    status: "planned",
    where: "Fixture Parkway at the beltway",
    what: "A proposed five-story, 354-unit apartment building with about 6,556 square feet of commercial space.",
    source: {
      label: "Fixture Review-Journal, 14 August 2025",
      url: "https://example-fixture-news.com/fixture-commons",
    },
    caveat: "Proposed only. Commissioners were scheduled to consider it on 2 March 2026, which had not happened when this page was checked.",
  },
  {
    name: "Fixture Grand Park phase one",
    status: "open",
    where: "Fixture Sky Vista Drive",
    what: "The first of three phases of a 90-acre park, open now with ballfields, a splash pad and shaded picnic areas.",
    source: {
      label: "Fixture Review-Journal, 30 March 2026",
      url: "https://example-fixture-news.com/fixture-grand-park",
    },
  },
];

export const sources = [
  {
    label: "Fixture County: projects in construction",
    url: "https://example-fixture-county.gov/projects",
    used: "Which fixture road projects are under construction and what the work zone restrictions are.",
  },
];
`;

/** A dated market report: a record of a month, not an evergreen guide. */
const MARKET_REPORT = `
const meta = {
  title: "Fixture Home Prices July 2026 | LVINIT",
  headline: "Fixture Home Prices July 2026",
  description: "A synthetic market report used only for testing.",
  path: "/guides/fixture-home-prices-july-2026",
  datePublished: "2026-08-17",
};

export default function Page() {
  return (
    <StoryPage>
      <StorySection heading="The number">
        <p>
          As of July 2026 the fixture median single-family price was $480,000,
          down 2% from the record set in May.
        </p>
        <p>
          Supply sat at just under four months, and 80.0% of single-family homes
          sold within 60 days.
        </p>
      </StorySection>
    </StoryPage>
  );
}
`;

/** Opinion, durable geography and settled history. Nothing to flag. */
const OPINION_PIECE = `
const meta = {
  title: "Why I Like Fixture Ridge | LVINIT",
  headline: "Why I Like Fixture Ridge",
  description: "A synthetic opinion piece used only for testing.",
  path: "/guides/fixture-opinion-piece",
  datePublished: "2026-08-20",
};

export default function Page() {
  return (
    <StoryPage>
      <StorySection heading="An honest take">
        <p>
          Honestly, Fixture Ridge is my favourite part of the valley, and I think
          most people who move here end up feeling the same way.
        </p>
        <p>
          It sits between two washes on the western edge of the fixture valley,
          with the escarpment behind it and roughly 40 square miles of open
          desert beyond that.
        </p>
        <p>
          The land was purchased in 1952, the community was named in 1988, and
          the first village opened in 1990.
        </p>
      </StorySection>
    </StoryPage>
  );
}
`;

/** An empty page. It should scan cleanly and produce nothing. */
const EMPTY_PAGE = `
export default function Page() {
  return null;
}
`;

/** A page whose only notable sentence is a Fair Housing compliance candidate. */
const COMPLIANCE_PAGE = `
const meta = {
  title: "Fixture Family Guide | LVINIT",
  headline: "Fixture Family Guide",
  description: "A synthetic page used only for testing the compliance queue.",
  path: "/guides/fixture-compliance-page",
  datePublished: "2026-08-01",
};

export default function Page() {
  return (
    <StoryPage>
      <StorySection heading="Who lives here">
        <p>
          Fixture Ridge is often described as the safest neighborhood in the
          fixture valley, with the best schools for families.
        </p>
      </StorySection>
    </StoryPage>
  );
}
`;

/** An unsourced, very specific, high-risk claim. */
const UNSOURCED_PAGE = `
const meta = {
  title: "Fixture Property Tax Explainer | LVINIT",
  headline: "Fixture Property Tax Explainer",
  description: "A synthetic page used only for testing.",
  path: "/guides/fixture-property-tax",
  datePublished: "2025-03-10",
};

export default function Page() {
  return (
    <StoryPage>
      <StorySection heading="The cap">
        <p>
          The fixture owner-occupied property tax abatement caps annual increases
          at 3%, and the current fixture tax rate is 0.6541% of assessed value.
        </p>
      </StorySection>
    </StoryPage>
  );
}
`;

const FIXTURE_SOURCES = [
  { route: "/guides/fixture-down-payment-help-2025", section: "guide", source: ASSISTANCE_GUIDE, category: "Buyer Guide" },
  { route: "/neighborhoods/fixture-village", section: "neighborhood", source: NEIGHBORHOOD_GUIDE, category: "Neighborhoods" },
  { route: "/guides/fixture-home-prices-july-2026", section: "guide", source: MARKET_REPORT, category: "Market Watch" },
  { route: "/guides/fixture-opinion-piece", section: "guide", source: OPINION_PIECE, category: "Moving Here" },
  { route: "/guides/fixture-empty", section: "guide", source: EMPTY_PAGE, category: null },
  { route: "/guides/fixture-compliance-page", section: "guide", source: COMPLIANCE_PAGE, category: "Neighborhoods" },
  { route: "/guides/fixture-property-tax", section: "guide", source: UNSOURCED_PAGE, category: "Cost of Living" },
];

/**
 * Build a fixture inventory in exactly the shape buildContentInventory()
 * returns, by running the synthetic sources through the real extractors.
 */
export function buildFixtureInventory({ config, today }) {
  const pages = FIXTURE_SOURCES.map(({ route, section, source, category }) => {
    const storyMeta = extractStoryMeta(source);
    const stamps = extractFreshnessStamps(source);
    const file = `scripts/fact-decay/fixtures/fixture-pages.mjs#${route}`;

    const lastReviewed = resolveLastReviewed({
      stamps,
      commentDates: [],
      storyMeta,
      registryEntry: null,
      gitDate: null,
    });

    const documents = [
      {
        file,
        role: "page",
        blocks: extractTextBlocks(source, { minWords: config.claims.minWords }),
        declaredSources: [...extractDeclaredSources(source), ...extractExternalLinks(source)],
        developmentProjects: extractDevelopmentProjects(source),
        dataRows: extractDataRows(source),
      },
    ];

    return {
      route,
      section,
      file,
      title: storyMeta.headline || storyMeta.title || route,
      description: storyMeta.description ?? null,
      category,
      storyMeta,
      registryEntry: null,
      lastReviewed,
      daysSinceReviewed: lastReviewed.date ? daysBetween(lastReviewed.date, today) : null,
      documents,
      declaredSources: documents.flatMap((d) => d.declaredSources.map((s) => ({ ...s, file: d.file }))),
      developmentProjects: documents.flatMap((d) => d.developmentProjects.map((p) => ({ ...p, file: d.file }))),
      textBlockCount: documents.reduce((sum, d) => sum + d.blocks.length, 0),
    };
  });

  return {
    pages,
    skipped: [
      { route: "/", section: "home", reason: "section \"home\" is not published editorial content" },
      { route: "/search", section: "utility", reason: "section \"utility\" is not published editorial content" },
    ],
    registrySize: 0,
  };
}

export const FIXTURE_ROUTES = FIXTURE_SOURCES.map((f) => f.route);
