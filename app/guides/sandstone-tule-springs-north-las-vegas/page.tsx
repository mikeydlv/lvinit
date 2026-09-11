import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import Container from "@/components/ui/Container";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryPullQuote,
} from "@/components/story";

// ---------------------------------------------------------------------------
// LOCAL FEATURE — "Sandstone at Tule Springs." Built via the autonomous
// scheduled editorial-publishing routine on genuine, fresh, well-corroborated
// news: KB Home opened first-phase sales at a large new master-planned
// community in North Las Vegas. Grepped the repo for "Sandstone," "Tule
// Springs," "KB Home" before writing — "Tule Springs" already appears as a
// named-but-unlinked area in the North Las Vegas pillar guide; nothing else
// matches, so this is a genuine content gap, not a duplicate.
//
// FACT DISCIPLINE (read before editing) — every figure below is sourced to
// the pieces cited in the "Sources" section at the foot of the article.
//
// - Primary source: KB Home's own press release (PR Newswire), Sept 4, 2026,
//   "KB Home Opens Sandstone, a New Master-Planned Community of Over 1,500
//   Homes in a Prime North Las Vegas Location."
//   https://www.prnewswire.com/news-releases/kb-home-opens-sandstone-a-new-master-planned-community-of-over-1-500-homes-in-a-prime-north-las-vegas-location-302870298.html
// - Secondary, independently reported: Las Vegas Review-Journal (Eli Segall),
//   Sept 8, 2026, "Builder opens NLV project planned for more than 1,500
//   houses."
//   https://www.reviewjournal.com/business/housing/builder-opens-nlv-project-planned-for-more-than-1500-houses-3883476/
// - Community pricing/size detail confirmed directly on KB Home's own
//   community pages (kbhome.com), fetched this run:
//   /new-homes-las-vegas/landings-at-sandstone-at-tule-springs (from the high
//   $300s; ~1,572-2,469 sq ft; up to 5 bedrooms; 2-story) and
//   /new-homes-las-vegas/reserves-at-sandstone-at-tule-springs (from the mid
//   $400s; ~1,644-3,066 sq ft; up to 5 bedrooms; build-to-order, no move-in
//   ready inventory yet).
// - Background-only, land-purchase history (not re-asserted as current news):
//   Hoodline, March 2026 ("KB Home's 1,500-Home Desert Gambit Rises on North
//   Las Vegas Edge"), corroborating the ~$91 million / 200+ acre purchase in
//   late 2024 and confirming construction was already underway months before
//   this opening.
// - Community: Sandstone (marketed as "Sandstone at Tule Springs"), part of
//   the Villages at Tule Springs master-planned corridor. Four planned
//   sub-communities: Landings and Reserves (single-family, now open for
//   sale), Meadows (townhomes) and Gardens (single-family), both described
//   as "coming soon" in KB Home's own release — not yet open, not invented.
// - Scale: nearly 300 acres; more than 1,500 homes planned total. KB Home
//   calls it its largest new Southern Nevada community in a decade.
// - Location: north of the 215 Beltway (CC-215) at North Fifth Street /
//   Sandstone Ranch Parkway, North Las Vegas, zip 89084 — the same stretch
//   our North Las Vegas pillar guide already names "Tule Springs."
// - Land history: KB Home paid roughly $91 million for more than 200 acres
//   in late 2024, per property records reviewed by the Review-Journal and
//   corroborated by Hoodline.
// - Pricing: first-phase homes (Landings + Reserves) start in the high
//   $300,000s, per KB Home's own release and community pages. No blended
//   "community-wide" number is asserted beyond that — the two open
//   sub-communities have different starting points (high $300s vs. mid
//   $400s) and this piece states both rather than averaging them.
// - Home types: one- and two-story single-family homes and two-story
//   townhomes, up to 5 bedrooms, roughly 1,572-3,066 sq ft across the two
//   open sub-communities.
// - Amenities: 12+ acres of planned parks and trails, a trailhead connecting
//   to the Tule Springs Fossil Beds National Monument, pickleball and
//   basketball courts, a dog park, playgrounds. Clark County School District
//   named as the district; no specific school is named in the sourcing, so
//   none is asserted here.
// - Real, attributed quote: Jim McDade, KB Home's Las Vegas division
//   president ("Sandstone presents an opportunity for attainable
//   homeownership in a highly desirable setting.")
// - Deliberately NOT used: a "median newly built home price" figure that
//   turned up in one fetch of this story's market-context paragraph
//   ($535,000) — it doesn't match the $581,930 July 2026 new-construction
//   median LVINIT already published (sourced to Home Builders Research via
//   the RJ) and could not be independently reconciled this run. Rather than
//   publish two conflicting numbers for the same metric, this piece compares
//   Sandstone's pricing only to the already-verified $475,000 valley-wide
//   resale median (LVR, August 2026, already live on
//   /guides/las-vegas-home-prices-august-2026).
// - HOA fees: KB Home's own pages note association fees apply but do not
//   disclose an amount — not asserted here.
//
// IMAGERY — C:\LVINIT\Images was checked for and is not reachable from this
// cloud session (it lives on Mikey's local Windows machine). No existing
// repo photography depicts this specific, still-under-construction site —
// the closest candidates (the North Las Vegas pillar's licensed Shutterstock
// aerial, and the Summerlin/starter-home new-construction photos from other
// guides) are genuinely different places and would misrepresent this one.
// Per the standard fallback order, this piece carries a generated LVINIT
// editorial cover (registered in lib/content.ts as the card image only,
// imageMode "editorial-cover") and a photoless StoryHero.
//   node scripts/generate-guide-cover.mjs --slug sandstone-tule-springs-north-las-vegas \
//     --category "Local Feature" --subject "Sandstone, Tule Springs" \
//     --out sandstone-tule-springs-editorial-cover.webp
//   -> public/images/covers/sandstone-tule-springs-editorial-cover.webp
// ---------------------------------------------------------------------------

const PATH = "/guides/sandstone-tule-springs-north-las-vegas";

const meta: StoryMeta = {
  title:
    "Sandstone at Tule Springs: KB Home Opens a 1,500-Home North Las Vegas Community | LVINIT",
  headline:
    "Sandstone at Tule Springs: KB Home Opens a 1,500-Home North Las Vegas Community",
  description:
    "KB Home just opened first-phase sales at Sandstone, a nearly-300-acre, 1,500-home community in North Las Vegas's Tule Springs area, with homes from the high $300,000s. What's actually built, what's still coming, and what it means for buyers.",
  path: PATH,
  datePublished: "2026-09-11",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Sandstone at Tule Springs", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "1,500+",
    label: "Homes planned",
    note: "Across four sub-communities on nearly 300 acres",
  },
  {
    value: "High $300Ks",
    label: "Starting price, first phase",
    note: "Landings; Reserves starts from the mid $400s",
  },
  {
    value: "$91M",
    label: "Land cost",
    note: "For 200+ acres, purchased late 2024",
  },
  {
    value: "2 of 4",
    label: "Sub-communities open",
    note: "Landings and Reserves; Meadows and Gardens are \u201ccoming soon\u201d",
  },
];

function SnapshotPanel() {
  return (
    <section
      id="by-the-numbers"
      aria-label="Sandstone at Tule Springs snapshot"
      className="scroll-mt-24"
    >
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            Sandstone, by the numbers
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            What&rsquo;s actually confirmed and open for sale today. See the
            sources at the end of this article for the full reporting.
          </p>

          <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-lvinit-lightgray bg-lvinit-lightgray sm:grid-cols-2 lg:grid-cols-4">
            {SNAPSHOT.map((s) => (
              <div key={s.label} className="bg-lvinit-white p-6">
                <dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                  {s.label}
                </dt>
                <dd className="mt-2 font-display text-heading font-bold text-lvinit-blue">
                  {s.value}
                </dd>
                <p className="mt-2 text-caption text-lvinit-warmgray">
                  {s.note}
                </p>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}

export default function SandstoneTuleSpringsPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Local Feature",
        headline:
          "Sandstone at Tule Springs: KB Home Opens a 1,500-Home North Las Vegas Community",
        subheadline:
          "First-phase homes are open for sale now in a nearly 300-acre master plan on North Las Vegas's northern edge, starting in the high $300,000s. Here's what's actually built, what's still coming, and how it fits the area we already cover as Tule Springs.",
        backLink: { label: "LVINIT", href: "/" },
        ctas: [
          { label: "See the numbers", href: "#by-the-numbers", variant: "primary" },
        ],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "Sandstone is one entry in the valley's active new-construction story. Here's the rest of the context.",
        stories: [
          {
            name: "Living in North Las Vegas",
            href: "/neighborhoods/north-las-vegas",
            category: "Area Guide",
            dek: "The incorporated city Sandstone sits inside, and the closest existing LVINIT guide to the Tule Springs area.",
          },
          {
            name: "Monument Hills: What a New 6,000-Home Community Means for Northwest Las Vegas",
            href: "/guides/monument-hills-northwest-las-vegas",
            category: "Local Feature",
            dek: "A much larger, much earlier-stage project just south of here \u2014 on City of Las Vegas land, with first homes not expected until spring 2028.",
          },
          {
            name: "Las Vegas New-Home Sales Jumped in July 2026",
            href: "/guides/las-vegas-new-home-sales-july-2026",
            category: "Market Watch",
            dek: "The valley-wide new-construction numbers Sandstone's opening adds to.",
          },
        ],
      }}
      relatedNeighborhood={{
        name: "North Las Vegas",
        href: "/neighborhoods/north-las-vegas",
        kicker: "The neighboring guide",
        heading: "Read the North Las Vegas guide",
        blurb:
          "Our North Las Vegas guide already names Tule Springs as a newer-growth area on the city's northern edge. Sandstone is a concrete, buyable example of exactly that.",
      }}
      ctas={{
        heading: "Weighing new construction on the valley's north edge?",
        body:
          "A community this new comes with real tradeoffs \u2014 distance from the valley's core, an HOA and homesite premiums that change the final price, phases still under construction nearby. Tell me what you're weighing and I'll give you the honest read.",
      }}
    >
      <StoryLede
        kicker="Local Feature"
        lead="KB Home just opened the first phase of Sandstone, a nearly 300-acre, 1,500-home master-planned community on North Las Vegas's northern edge \u2014 the company's largest new Southern Nevada community in a decade. Unlike some of the valley's other big announcements, this one isn't a future promise: homes are for sale right now, starting in the high $300,000s."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          The site sits in the area our{" "}
          <Link
            href="/neighborhoods/north-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            North Las Vegas guide
          </Link>{" "}
          already calls &ldquo;Tule Springs&rdquo; &mdash; here&rsquo;s what&rsquo;s
          actually built, what&rsquo;s still coming, and what a buyer should
          weigh before treating &ldquo;starting in the $300s&rdquo; as the
          whole story.
        </p>
      </StoryLede>

      <StorySection heading="What just opened">
        <p className="text-body-lg text-lvinit-warmgray">
          KB Home announced the opening of Sandstone on September 4, 2026,
          with the Las Vegas Review-Journal independently reporting on the
          launch on September 8. The community sits north of the 215
          Beltway&rsquo;s North Fifth Street interchange, within North Las
          Vegas&rsquo;s 89084 zip code &mdash; part of the broader Villages at
          Tule Springs master-planned corridor.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Sandstone is planned as four sub-communities across nearly 300
          acres. Two are open for sale today:{" "}
          <span className="text-lvinit-black">Landings</span>, one- and
          two-story single-family homes from the high $300,000s (roughly
          1,572 to 2,469 square feet, up to five bedrooms), and{" "}
          <span className="text-lvinit-black">Reserves</span>, build-to-order
          single-family homes from the mid $400,000s (roughly 1,644 to 3,066
          square feet, also up to five bedrooms). Two more &mdash;{" "}
          <span className="text-lvinit-black">Meadows</span> (two-story
          townhomes) and <span className="text-lvinit-black">Gardens</span>{" "}
          (two-story single-family) &mdash; are described by KB Home as
          &ldquo;coming soon,&rdquo; not yet open for sale.
        </p>
      </StorySection>

      <SnapshotPanel />

      <StorySection heading="Where this actually sits">
        <p className="text-body-lg text-lvinit-warmgray">
          &ldquo;North Las Vegas&rdquo; covers a lot of ground, and Sandstone
          sits at its active northern edge &mdash; exactly the stretch our{" "}
          <Link
            href="/neighborhoods/north-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            North Las Vegas guide
          </Link>{" "}
          already describes as Tule Springs: newer homes, big-sky
          surroundings, and a community still filling in. That guide&rsquo;s
          own honest framing applies directly here &mdash; this is the
          newest, farthest-out part of the city, with the longest drive back
          to the valley&rsquo;s core.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          On the plus side, KB Home&rsquo;s marketing points to real,
          checkable proximity: a trailhead connecting directly to the Tule
          Springs Fossil Beds National Monument, and beltway access via CC-215
          that reaches I-15 and I-11 toward Harry Reid International Airport
          and the region&rsquo;s employment centers, including Nellis and
          Creech Air Force Bases.
        </p>
      </StorySection>

      <StoryPullQuote cite="Jim McDade, KB Home Las Vegas division president">
        Sandstone presents an opportunity for attainable homeownership in a
        highly desirable setting.
      </StoryPullQuote>

      <StorySection heading="What it costs, and what that $300,000s number actually means">
        <p className="text-body-lg text-lvinit-warmgray">
          A high-$300,000s starting price is real news for anyone priced out
          of the valley&rsquo;s broader resale market. Las Vegas Realtors&rsquo;
          own August 2026 report puts the{" "}
          <Link
            href="/guides/las-vegas-home-prices-august-2026"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            valley-wide median resale price at $475,000
          </Link>
          . Sandstone&rsquo;s entry point runs well under that &mdash; a
          meaningful gap, worth taking seriously as a genuine attainability
          story rather than a marketing line.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Two honest caveats, both straight from KB Home&rsquo;s own listing
          pages. First, &ldquo;from the high $300,000s&rdquo; is the Landings
          sub-community specifically; Reserves, the other open
          sub-community, starts from the mid $400,000s for a larger,
          build-to-order home. Second, KB Home&rsquo;s own pages note that
          homesite premiums and HOA/association fees can apply on top of the
          base price, without disclosing a specific amount &mdash; get the
          actual out-the-door number, including any HOA dues, in writing
          before treating a listed starting price as your monthly budget.
        </p>
      </StorySection>

      <StorySection muted heading="What's still coming">
        <p className="text-body-lg text-lvinit-warmgray">
          Sandstone isn&rsquo;t finished, and it isn&rsquo;t fully open. KB
          Home describes Meadows (townhomes) and Gardens (single-family) as
          &ldquo;coming soon&rdquo; rather than available now &mdash; no
          pricing or opening date has been published for either. If
          you&rsquo;re shopping here, expect an active construction site
          around you for a while: this is a nearly 300-acre master plan
          filling in over multiple phases, not a finished neighborhood.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The land itself has a longer history than this week&rsquo;s
          headline suggests. Property records reviewed by the
          Review-Journal, and corroborated by earlier reporting, show KB Home
          paid roughly $91 million for more than 200 of Sandstone&rsquo;s
          acres in late 2024, with site work and construction already visible
          months before this first-phase opening.
        </p>
      </StorySection>

      <StorySection heading="How this fits the valley's bigger new-construction story">
        <p className="text-body-lg text-lvinit-warmgray">
          Sandstone is a useful contrast to{" "}
          <Link
            href="/guides/monument-hills-northwest-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Monument Hills
          </Link>
          , the much larger project a short distance south that made news
          earlier this month. Monument Hills is a land sale and a plan &mdash;
          nothing buyable until spring 2028 at the earliest, and on City of
          Las Vegas land rather than North Las Vegas. Sandstone is the
          opposite situation: a smaller footprint, but real homes for sale
          today. Both point to the same underlying pattern &mdash; the
          valley&rsquo;s new construction keeps concentrating on its outer
          edges, in this case the far north.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It also lands against a new-construction market that{" "}
          <Link
            href="/guides/las-vegas-new-home-sales-july-2026"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            our July 2026 coverage
          </Link>{" "}
          showed running well below year-ago permit and closing volumes
          valley-wide. A single community won&rsquo;t reverse that trend, but
          a builder committing to its largest Southern Nevada project in a
          decade is a real, concrete signal about where builders still see
          demand.
        </p>
      </StorySection>

      <StorySection heading="What to watch next">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue"
            />
            <span>
              Pricing and an opening date for Meadows and Gardens, the two
              sub-communities KB Home has named but not yet opened.
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue"
            />
            <span>
              The actual out-the-door monthly cost once HOA dues and any
              homesite premium are added to the base price &mdash; neither is
              published yet.
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue"
            />
            <span>
              Whether other builders follow into the broader Villages at
              Tule Springs corridor, the way builders have clustered around
              other growth edges of the valley.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">KB Home</span> (via PR
            Newswire), &ldquo;KB Home Opens Sandstone, a New Master-Planned
            Community of Over 1,500 Homes in a Prime North Las Vegas
            Location,&rdquo; published September 4, 2026 &mdash; the primary
            source for the community name, sub-community structure, acreage,
            home-count, amenities, and the attributed quote.{" "}
            <a
              href="https://www.prnewswire.com/news-releases/kb-home-opens-sandstone-a-new-master-planned-community-of-over-1-500-homes-in-a-prime-north-las-vegas-location-302870298.html"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              prnewswire.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">
              Las Vegas Review-Journal
            </span>{" "}
            (reporter Eli Segall), &ldquo;Builder opens NLV project planned
            for more than 1,500 houses,&rdquo; published September 8, 2026
            &mdash; independent corroboration of the opening, pricing, and
            the late-2024 land-purchase figures from property records.{" "}
            <a
              href="https://www.reviewjournal.com/business/housing/builder-opens-nlv-project-planned-for-more-than-1500-houses-3883476/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              reviewjournal.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KB Home</span> community
            pages for Landings at Sandstone at Tule Springs and Reserves at
            Sandstone at Tule Springs, fetched directly this run for the
            per-sub-community pricing, square footage, and bedroom counts.{" "}
            <a
              href="https://www.kbhome.com/new-homes-las-vegas/landings-at-sandstone-at-tule-springs"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              kbhome.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Hoodline</span>, March 2026
            &mdash; background only, for the land-acquisition history and
            confirmation that construction was already underway well before
            this opening.{" "}
            <a
              href="https://hoodline.com/2026/03/kb-home-s-1-500-home-desert-gambit-rises-on-north-las-vegas-edge/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              hoodline.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Las Vegas Realtors</span>,
            August 2026 housing report (via{" "}
            <Link
              href="/guides/las-vegas-home-prices-august-2026"
              className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
            >
              LVINIT&rsquo;s own coverage
            </Link>
            ) &mdash; the $475,000 valley-wide resale median used for
            comparison.
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Builder pricing, incentives, and available phases change often and
          without notice. Figures above reflect the sources and dates cited
          and should be confirmed directly with the builder before you rely
          on them. This article is general local reporting, not financial,
          lending, or investment advice.
        </p>
      </StorySection>

      <StorySection heading="About this coverage">
        <p className="text-body text-lvinit-warmgray">
          LVINIT Editorial &middot; The Scofield Group &middot; Nevada
          License S.0175577. Equal Housing Opportunity.
        </p>
      </StorySection>
    </StoryPage>
  );
}
