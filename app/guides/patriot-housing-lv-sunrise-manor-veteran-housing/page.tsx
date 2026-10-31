import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// GROWTH & DEVELOPMENT — Patriot Housing LV. Built by the LVINIT Daily
// Publisher from Local Radar assignment LR-PATRIOT-HOUSING-LV.
//
// FACT DISCIPLINE — read this run (2026-10-31):
// - Fox5, Oct. 8 2026 (read): 7-0 vote Oct. 7; $90M; 348 units; 108 transitional
//   units for unhoused veterans; nearly 15 acres near Tree Line Dr and Vegas
//   Valley Dr; City Council sold the land for nearly $9M; completion 2028.
//   Land price and 2028 are Fox5-only and are attributed to Fox5 in copy.
// - KTNV (read): Oct. 7 meeting; item held from September over financing,
//   affordability and zoning concerns; staff cited the industrial character of
//   the area; amendments: affordable-housing certification within a set time
//   and a safeguard against non-affordable luxury apartments if the project
//   falls through. KTNV gives no vote count; quote from Levy Shultz.
// - Developer page (FIXX Development) fetched truncated this run: only the
//   mission statement was confirmed. Unit mix, square footage, the 15-year
//   deed restriction and amenities are DELIBERATELY OMITTED.
// OMITTED: rents, eligibility, financing sources, groundbreaking, exact
// amendment wording, county record (not read).
// IMAGERY: no LVINIT photography of east Las Vegas / Sunrise Manor in the
// image library. Photoless hero; nothing stands in for the site.
// ---------------------------------------------------------------------------

const PATH = "/guides/patriot-housing-lv-sunrise-manor-veteran-housing";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const meta: StoryMeta = {
  title:
    "Patriot Housing LV: Clark County Approves 348 Veteran-Focused Apartments in Sunrise Manor | LVINIT",
  headline:
    "Patriot Housing LV: What Clark County Approved for 348 Veteran-Focused Apartments in Sunrise Manor",
  description:
    "Clark County commissioners approved the $90M Patriot Housing LV project 7-0 on Oct. 7, after staff recommended denial. What's approved, what safeguards were added, and what isn't known yet.",
  path: PATH,
  datePublished: "2026-10-31",
  dateModified: "2026-10-31",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Patriot Housing LV", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function PatriotHousingPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Growth & Development",
        headline:
          "Patriot Housing LV: What Clark County Approved for 348 Veteran-Focused Apartments in Sunrise Manor",
        subheadline:
          "County staff recommended denial. Commissioners approved it 7-0 anyway, with conditions. Here's what's settled and what isn't.",
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on affordable housing and growth across the valley.",
        stories: [
          {
            name: "Gholson Landing in East Las Vegas",
            href: "/guides/gholson-landing-affordable-housing-east-las-vegas",
            category: "Local Feature",
            dek: "Another affordable housing project on the east side.",
          },
          {
            name: "One Civic Center in North Las Vegas",
            href: "/guides/one-civic-center-north-las-vegas-redevelopment",
            category: "Local Feature",
            dek: "A look at redevelopment up the road.",
          },
          {
            name: "Moving to Las Vegas: Where to Start",
            href: "/guides/moving-to-las-vegas",
            category: "Moving to Las Vegas",
            dek: "The starting point if you're new to the valley.",
          },
        ],
      }}
      ctas={{
        heading: "Figuring out where in Las Vegas fits you?",
        body:
          "Tell me what matters to you and I'll give you an honest read on where to look.",
      }}
    >
      <StoryLede
        kicker="Growth & Development"
        lead="On Wednesday, Oct. 7, Clark County commissioners approved Patriot Housing LV, a roughly $90 million, 348-unit apartment project near Tree Line Drive and Vegas Valley Drive in Sunrise Manor. About 108 of the units are planned as transitional housing for unhoused veterans. It's approved, not built."
      />

      <StorySection heading="What was approved">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">The vote:</span> 7-0 on
            Oct. 7, 2026 (Fox5).
          </li>
          <li>
            <span className="text-lvinit-black">Size and cost:</span> 348
            units at about $90 million (Fox5), on nearly 15 acres.
          </li>
          <li>
            <span className="text-lvinit-black">Who it&rsquo;s for:</span> 108 of
            the units are transitional housing for unhoused veterans (Fox5).
            The developer, FIXX Development, describes the aim as expanding
            access to affordable housing for veterans and their families,
            with services that support long-term stability.
          </li>
          <li>
            <span className="text-lvinit-black">The land:</span> Fox5
            reports the Las Vegas City Council sold the parcel for nearly
            $9 million. I haven&rsquo;t confirmed that figure elsewhere.
          </li>
          <li>
            <span className="text-lvinit-black">Timing:</span> Fox5 reports
            completion is expected in 2028. Treat that as a target.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="Why staff pushed back, and what commissioners added">
        <p className="text-body-lg text-lvinit-warmgray">
          KTNV reports county staff recommended denial, citing the industrial
          character of the surrounding area. The item was held from September
          after long public comment and concerns about financing,
          affordability and zoning.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The approval came with amendments. According to KTNV, the developer
          must get affordable-housing certification within a set time period,
          and a safeguard bars another developer from building non-affordable
          luxury apartments on the site if this project falls through. That
          second piece is the one to watch: it&rsquo;s meant to keep the land from
          turning into something other than what was pitched.
        </p>
      </StorySection>

      <StorySection heading="Who's backing it">
        <p className="text-body-lg text-lvinit-warmgray">
          Levy Shultz, president of the Nevada Veterans Caucus and Nevada
          Veterans Fund, told KTNV the site is &ldquo;20 minutes from the
          base, which is perfect,&rdquo; and that lower rents would let
          veterans afford essentials. Vincent Palmieri of Purple Heart USA
          told Fox5 a church and a school are nearby and that residents would
          be 10 to 15 minutes from what veterans need.
        </p>
      </StorySection>

      <StorySection heading="What it means if you live here or are watching the east valley">
        <p className="text-body-lg text-lvinit-warmgray">
          This is a big swing at one of the valley&rsquo;s hardest problems, in an
          area that&rsquo;s mostly industrial today. If it&rsquo;s built as approved, it
          would add a few hundred affordable and supportive homes on the
          east side. If you live nearby, the realistic expectation is
          paperwork and site work before anything rises. For a comparable east-side
          affordable project, see{" "}
          <Link
            href="/guides/gholson-landing-affordable-housing-east-las-vegas"
            className={linkCls}
          >
            Gholson Landing
          </Link>
          , and for another redevelopment story, our look at{" "}
          <Link
            href="/guides/one-civic-center-north-las-vegas-redevelopment"
            className={linkCls}
          >
            One Civic Center in North Las Vegas
          </Link>
          . New to the valley? Start with{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection muted heading="What I haven't confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Rents and eligibility.</span>{" "}
            Nothing I read publishes them.
          </li>
          <li>
            <span className="text-lvinit-black">Financing.</span> The sources
            I read don&rsquo;t say how the $90 million is funded.
          </li>
          <li>
            <span className="text-lvinit-black">Groundbreaking date</span> and
            the exact deadline and wording of the affordability certification.
          </li>
          <li>
            <span className="text-lvinit-black">The county record.</span> I
            haven&rsquo;t read the commission agenda or minutes, so details here
            come from news reports.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          I haven&rsquo;t visited the site for this piece and there are no LVINIT
          photos of it yet, so this page has no imagery rather than a
          stand-in.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>, Oct. 8,
            2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/10/08/clark-county-approves-90m-affordable-housing-project-veterans-sunrise-manor/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KTNV</span>, plans for
            affordable veteran and military housing in Sunrise Manor.{" "}
            <a
              href="https://www.ktnv.com/news/plans-for-affordable-veteran-and-military-housing-in-sunrise-manor-move-forward"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              ktnv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">FIXX Development</span>, project
            page.{" "}
            <a
              href="https://fixxdevelopment.com/projects/patriot-housing-lv"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              fixxdevelopment.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
