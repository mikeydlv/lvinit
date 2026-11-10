import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// GROWTH & DEVELOPMENT — Desert Pines golf course redevelopment, East Las Vegas.
// Built by the LVINIT Daily Publisher (2026-11-10) from Local Radar assignment
// LR-DESERT-PINES-EAST-LV (READY - first-party media recommended).
//
// FACT DISCIPLINE (sources re-read 2026-11-10):
// - City of Las Vegas factsheet, Aug 2025 (PDF read in full): McCormack Baron
//   Salazar + Urban Strategies; replace the 100-acre course with a mixed-use,
//   mixed-income, mixed-generational community; affordable AND market-rate
//   housing for families, seniors, persons with disabilities; homeownership
//   for first-time buyers; neighborhood retail/services, education, job
//   training. Goals: 1,125 mixed-income units, 441 homeownership units,
//   10,000 sq ft early education, 10,000 sq ft community center, 10 acres open
//   space & trails. Timeline graphic: development agreement + entitlements and
//   City Council Jul 2025; "Demo & Start Infrastructure" Mar 2026 (planned).
//   Info line 702-246-2908.
// - City State of the City blog, Apr 22, 2026: "about 1,500 units of mixed-use,
//   mixed income housing," commercial, workforce training center.
// - City blog, Aug 17, 2022: CSN East Training Center ~25,000 sq ft first
//   phase; trails, soccer field; course used ~400 acre-feet reclaimed water.
// - Fox5, Jul 11, 2026: course closed Sun. July 12, 2026 after 30 years;
//   no groundbreaking date announced.
// - News3LV, Jul 17, 2025: council approved $17.45M sale; ~$500M project;
//   Falcone cited affordable range for families earning ~$23k-$60k a year.
// - KTNV (undated): 97.94 acres appraised at $55.5M; ~$440M; $25M State
//   Infrastructure Bank loan for phase one; first affordable parcel 2027,
//   last Phase I parcel 2030, completion 2036; ~2/3 two- and three-bedroom.
// - 8News Now (via AOL, Jul 2026): wildlife letter; sale expected to close
//   in the fall.
// OMITTED ON PURPOSE: EDA grant (status unconfirmed), Clark County funding
//   figure (not read), exact street address, whether the land sale closed,
//   any "construction has started" claim.
// IMAGERY: hero and card image = aerial of the Desert Pines course supplied
//   by Mikey (uploaded 2026-11-10; capture date not documented, so the copy
//   makes no claim about when it was taken). Not a Media Image Library file.
// ---------------------------------------------------------------------------

const PATH = "/guides/desert-pines-golf-course-redevelopment-east-las-vegas";
const HERO_IMG = "/images/hero/desert-pines-golf-course-las-vegas-lvinit-hero.png";
const HERO_ALT =
  "Aerial view of the Desert Pines golf course in East Las Vegas, with ponds, pine trees and cart paths, a freeway and neighborhoods beyond, and mountains on the horizon.";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";
const FACTSHEET =
  "https://files.lasvegasnevada.gov/neighborhood-services/Factsheet_DesertPinesRedevelopment_Informational%20meeting%20Aug%202025.pdf";

const TITLE =
  "What's Happening to the Desert Pines Golf Course in East Las Vegas";

const meta: StoryMeta = {
  title: "Desert Pines Golf Course Redevelopment: What's Planned in East Las Vegas | LVINIT",
  headline: TITLE,
  description:
    "Desert Pines Golf Club closed in July 2026. The City of Las Vegas plans about 1,500 mixed-income homes, 10 acres of trails and a training center there. What's approved, what isn't, and the timeline.",
  path: PATH,
  image: HERO_IMG,
  imageWidth: 1614,
  imageHeight: 975,
  imageAlt: HERO_ALT,
  datePublished: "2026-11-10",
  dateModified: "2026-11-10",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Desert Pines redevelopment", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function DesertPinesRedevelopmentPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Growth & Development",
        headline: TITLE,
        subheadline:
          "The course at Bonanza and Pecos closed in July. Housing, trails and a job-training center are planned, but construction hasn't started.",
        image: HERO_IMG,
        imageAlt: HERO_ALT,
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on housing and what's changing on the east side.",
        stories: [
          {
            name: "Gholson Landing",
            href: "/guides/gholson-landing-affordable-housing-east-las-vegas",
            category: "Local Feature",
            dek: "121 affordable apartments that opened on Sunrise Avenue.",
          },
          {
            name: "Sloan Lane bridge",
            href: "/guides/sloan-lane-bridge-las-vegas-wash-east-las-vegas",
            category: "Local Feature",
            dek: "The new crossing over the Las Vegas Wash.",
          },
          {
            name: "The Foundry at Cashman",
            href: "/guides/the-foundry-lennar-cashman-downtown-las-vegas",
            category: "Local Feature",
            dek: "Another city-owned site turning into homes.",
          },
        ],
      }}
      ctas={{
        heading: "Trying to figure out the east side?",
        body:
          "Tell me what you need day to day and I'll give you an honest read on which parts of the valley fit, east side included.",
      }}
    >
      <StoryLede
        kicker="Growth & Development"
        lead="Desert Pines Golf Club played its last round on July 12, 2026. The City of Las Vegas owns the land and has a plan to turn it into a neighborhood: mixed-income apartments, homes for sale, trails, a community center and a job-training campus. The plan is approved. The bulldozers aren't there yet."
      />

      <StorySection heading="The short version">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Where:</span> the former Desert
            Pines Golf Club near Bonanza Road and Pecos Road in East Las
            Vegas.
          </li>
          <li>
            <span className="text-lvinit-black">What happened:</span> the course
            closed Sunday, July 12, 2026, after 30 years, Fox5 reported.
          </li>
          <li>
            <span className="text-lvinit-black">What&rsquo;s planned:</span> the
            City&rsquo;s August 2025 factsheet lists 1,125 mixed-income housing
            units, 441 homeownership units, 10 acres of open space and trails,
            a 10,000-square-foot community center and a 10,000-square-foot
            early education space.
          </li>
          <li>
            <span className="text-lvinit-black">Who&rsquo;s building it:</span>{" "}
            developer McCormack Baron Salazar and nonprofit partner Urban
            Strategies, in partnership with the City.
          </li>
          <li>
            <span className="text-lvinit-black">Status:</span> the City Council
            approved the development agreement and land-use entitlements in
            July 2025. As of the closure, no groundbreaking date had been
            announced.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="What's actually planned">
        <p className="text-body-lg text-lvinit-warmgray">
          The City&rsquo;s factsheet describes replacing the roughly 100-acre
          course with a &ldquo;mixed-use, mixed-income and
          mixed-generational&rdquo; community. That means affordable and
          market-rate housing for families, seniors and people with
          disabilities, homeownership opportunities for first-time buyers,
          neighborhood retail and services, and education and job-training
          space. Open-space walking trails and recreation areas are planned for
          residents.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Unit counts have moved around over the years. The City talked about
          more than 1,800 units when it first picked a developer in 2022. The
          2025 factsheet adds up to 1,566, and Mayor Shelley Berkley&rsquo;s
          April 2026 State of the City address described &ldquo;about 1,500
          units of mixed-use, mixed income housing.&rdquo; So the honest number
          right now is about 1,500, give or take, until building permits pin it
          down. KTNV reported the developer&rsquo;s partner saying about
          two-thirds of the units would be two- and three-bedroom, with no
          studios.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          This isn&rsquo;t an all-affordable project. It mixes income-restricted
          rentals with market-rate housing and for-sale homes. At the July 2025
          council meeting, the developer&rsquo;s consultant described the
          affordable range as families earning roughly $23,000 to $60,000 a
          year, according to News3LV. Eligibility rules for specific buildings
          haven&rsquo;t been published, so don&rsquo;t treat that range as a
          qualification guide.
        </p>
      </StorySection>

      <StorySection heading="The job-training piece">
        <p className="text-body-lg text-lvinit-warmgray">
          The College of Southern Nevada is part of the plan. When the City
          first announced the deal in 2022, it described a multi-phase CSN East
          Training Center, starting at about 25,000 square feet, with room to
          grow along Pecos Road toward the 515. The Mayor&rsquo;s 2026 address
          still lists a workforce training center as part of Desert Pines. CSN
          hasn&rsquo;t announced a construction date, and I&rsquo;d treat the
          size and phasing as a 2022 plan, not a final design.
        </p>
      </StorySection>

      <StorySection muted heading="The money and the land">
        <p className="text-body-lg text-lvinit-warmgray">
          The City Council approved selling the land for $17.45 million in July
          2025, News3LV reported. KTNV reported that a May appraisal valued the
          roughly 98 acres at $55.5 million, so the City is selling well below
          appraisal, with officials saying proceeds from parcels sold to home
          builders would be put back into the affordable housing. In July 2026,
          8News Now reported the sale was expected to close in the fall. I
          haven&rsquo;t confirmed that it has.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Total cost estimates have been reported at about $440 million (KTNV)
          and about $500 million (News3LV). KTNV also reported a $25 million
          State Infrastructure Bank loan for the first phase.
        </p>
      </StorySection>

      <StorySection heading="When anything happens">
        <p className="text-body-lg text-lvinit-warmgray">
          Dates on this project have slipped before, so here&rsquo;s what has
          been said and by whom. The City&rsquo;s August 2025 factsheet showed
          demolition and infrastructure starting in March 2026; the course
          actually stayed open until July. KTNV reported the first affordable
          housing parcel breaking ground in 2027, the last Phase I parcel in
          2030 and the whole project finishing around 2036. Fox5 reported at
          the closure that no groundbreaking date had been announced.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The realistic read: this is a decade-long buildout. Expect the site to
          look like a closed golf course for a while, then fill in parcel by
          parcel.
        </p>
      </StorySection>

      <StorySection muted heading="What it means if you live nearby">
        <p className="text-body-lg text-lvinit-warmgray">
          For neighbors around Bonanza and Pecos, the immediate change is losing
          a 30-year-old golf course and a big green space. The long-term
          change is a full neighborhood where a fairway used to be: housing,
          10 acres of trails and open space, a community center and a training
          campus. The 2022 City plan also called for a soccer field.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Water is part of the story too. The City said in 2022 that the course
          used about 400 acre-feet of reclaimed water a year from its treatment
          plant, and estimated the new community would use less than that.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Some former golfers have asked the City to protect the
          course&rsquo;s rabbits and waterfowl before work starts, 8News Now
          reported, including draining the ponds slowly and clearing in phases.
          If you have questions or want to be heard, the City&rsquo;s factsheet
          lists a project info line at 702-246-2908.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Desert Pines is the biggest piece of a wider east-side shift. Recent
          examples include{" "}
          <Link
            href="/guides/gholson-landing-affordable-housing-east-las-vegas"
            className={linkCls}
          >
            Gholson Landing on Sunrise Avenue
          </Link>
          ,{" "}
          <Link
            href="/guides/patriot-housing-lv-sunrise-manor-veteran-housing"
            className={linkCls}
          >
            Patriot Housing LV in Sunrise Manor
          </Link>{" "}
          and the{" "}
          <Link
            href="/guides/sloan-lane-bridge-las-vegas-wash-east-las-vegas"
            className={linkCls}
          >
            Sloan Lane bridge over the Las Vegas Wash
          </Link>
          . If the homeownership side is what interests you, the{" "}
          <Link
            href="/guides/las-vegas-down-payment-assistance-programs-2026"
            className={linkCls}
          >
            down payment assistance guide
          </Link>{" "}
          covers programs that exist today. New to the valley? Start with{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection heading="What I haven't confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Groundbreaking.</span> The 2027
            date for the first parcel comes from a single KTNV report. No
            official date has been announced.
          </li>
          <li>
            <span className="text-lvinit-black">The land sale closing.</span>{" "}
            It was expected this fall. I haven&rsquo;t seen it confirmed.
          </li>
          <li>
            <span className="text-lvinit-black">Federal grant money.</span> KTNV
            mentioned a federal economic development grant. I couldn&rsquo;t
            confirm its status, so it&rsquo;s left out of the numbers above.
          </li>
          <li>
            <span className="text-lvinit-black">What the photo shows.</span>{" "}
            The aerial above is the Desert Pines course itself, not a rendering
            of the planned community. The plans and timeline in this piece rest
            on City documents and news reporting.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">City of Las Vegas</span>,
            Desert Pines Golf Course Redevelopment factsheet, August 2025.{" "}
            <a href={FACTSHEET} className={extCls} target="_blank" rel="noopener noreferrer">
              lasvegasnevada.gov (PDF)
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">City of Las Vegas</span>, State
            of the City address, April 22, 2026.{" "}
            <a
              href="https://www.lasvegasnevada.gov/News/Blog/Detail/state-of-the-city-address-april-22-2026"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              lasvegasnevada.gov
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">City of Las Vegas</span>, New
            housing development at Desert Pines Golf Course, August 2022.{" "}
            <a
              href="https://www.lasvegasnevada.gov/News/Blog/Detail/new-housing-development-at-desert-pines-golf-course"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              lasvegasnevada.gov
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>, Desert
            Pines Golf Club closing after 30 years, July 11, 2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/07/12/desert-pines-golf-club-closing-after-30-years-affordable-housing-planned-site/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">News3LV</span>, Las Vegas
            approves $17.45M sale of Desert Pines Golf Course, July 17, 2025.{" "}
            <a
              href="https://news3lv.com/news/local/las-vegas-approves-1745m-sale-of-desert-pines-golf-course-for-housing-project"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              news3lv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KTNV</span>, Las Vegas
            officials look to break ground on Desert Pines redevelopment
            project in 2027.{" "}
            <a
              href="https://www.ktnv.com/news/las-vegas-officials-look-to-break-ground-on-desert-pines-redevelopment-project-in-2027"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              ktnv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">8News Now</span>, residents
            urge city leaders to protect wildlife before Desert Pines
            redevelopment, July 2026.{" "}
            <a
              href="https://www.aol.com/articles/residents-urge-city-leaders-protect-020103000.html"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              via aol.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
