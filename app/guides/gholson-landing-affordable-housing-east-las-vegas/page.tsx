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
// LOCAL FEATURE — "Gholson Landing." Built via the autonomous scheduled
// editorial-publishing routine. Topic selection note: two open, unmerged PRs
// already cover the "mortgage rates near/at a multi-month high" story
// (las-vegas-mortgage-rates-hit-20-month-high, las-vegas-mortgage-rates-19-month-high);
// this run was explicitly told not to add a third piece to that thread, so a
// different, non-duplicative topic was researched instead. Grepped for
// "Gholson," "Gholson Landing," "Sunrise Ave," and "Home Means Nevada" across
// the repo before writing — zero prior matches anywhere on LVINIT.
//
// FACT DISCIPLINE (read before editing) — every figure below is sourced to
// the outlets cited in the "Sources" section at the foot of the article, all
// independently fetched/searched this run. Do not add, round, or infer
// anything beyond what is listed here.
//
// - Primary event: a ceremonial grand opening for Gholson Landing, a 121-unit
//   affordable apartment community at 2601 Sunrise Ave. (the "Downtown East"
//   area of Las Vegas, near Nellis Blvd.), held 8 a.m. Tuesday, Sept. 22,
//   2026. Hosted jointly by the Southern Nevada Regional Housing Authority
//   (SNRHA) and The Michaels Organization. Independently reported by Fox5
//   Vegas (a preview piece published Sept. 22 and a wrap-up published Sept.
//   23) and by KTNV (a separate on-the-ground report from the event, no
//   clear publish date on the fetched page but content matches the Sept.
//   22–23 event window). A Las Vegas Review-Journal headline
//   ("New $32M affordable-housing complex opens in Las Vegas") corroborates
//   the $32M figure and the "opens" framing, but the RJ article itself
//   returned a paywall/soft-block to direct fetch this run, so it is listed
//   in Sources as background/corroborating by headline only, not cited as
//   directly read — same discipline as the One Civic Center piece's
//   treatment of a source it couldn't fetch.
// - Numbers, independently confirmed across Fox5 and KTNV: $32 million total
//   development cost; 121 apartments; unit sizes 600–1,300 sq ft; one- to
//   four-bedroom floor plans; income eligibility 30%–80% of area median
//   income (AMI); construction finished earlier in 2026; already about 80%
//   leased as of the opening. On-site amenities per KTNV's own reporting: a
//   community clubhouse with a kitchen, a fitness center, a computer lab,
//   and an outdoor playground. No specific rent dollar figures are reported
//   anywhere in the sourcing, so none are guessed here.
// - Naming: the community honors Thomas Gholson, who served as deputy
//   executive director of the Las Vegas Housing Authority (SNRHA's
//   predecessor agency) from 1990 to 1996. Gholson himself once lived in
//   public housing, and during his tenure helped start resident job
//   apprenticeship programs, youth Late-Night Basketball leagues, and the
//   Community Peace coalition (per KTNV and The Michaels Organization's own
//   February 2026 release on the naming). Real, attributed quotes used
//   exactly as reported by KTNV: Thomas Gholson himself; Frank Stafford,
//   SNRHA's director of development and modernization; and Dandy Tellez, a
//   resident. SNRHA executive director Lewis Jordan is also quoted in
//   secondary coverage, but only in a paraphrased/indirect form this run
//   could confirm — so his framing is described in reported speech below,
//   not set in quotation marks, per the no-fabricated-quotes rule.
// - Companion project, background only: Beals-Henderson Pointe, an 80-unit
//   affordable community at 5901 W. Duncan Dr., completed April 2026, named
//   for civil-rights organizers Alversa Beals and Essie Henderson. The two
//   communities were announced together in Jan./Feb. 2026 (SNRHA press
//   materials via The Michaels Organization) as a combined "201 new
//   affordable apartment homes," funded in part through low-income housing
//   tax credits and American Rescue Plan Act (ARPA) dollars administered
//   through Nevada's Home Means Nevada Initiative. Beals-Henderson Pointe's
//   own opening isn't the subject of this piece and isn't described as if it
//   just happened — it's named here as context for the scale of the combined
//   program, with its own, separate completion date stated plainly.
// - Home Means Nevada Initiative: a real, $500 million statewide program
//   funded through ARPA state/local fiscal recovery dollars, announced by
//   the Nevada Housing Division in 2022 (Gov. Sisolak's office at the time).
//   Cited here only as background on how a project like this gets funded —
//   no claim is made about how much of that $500M went to this specific
//   project, because that figure isn't in any source found this run.
// - Deliberately omitted: exact AMI dollar-figure cutoffs (Clark County's AMI
//   table wasn't pulled this run, so no dollar conversion of "30%-80% of
//   AMI" is asserted); any waitlist/application-status claim beyond "about
//   80% leased" as reported; any claim that this is a path to homeownership
//   — it explicitly is not, and the piece says so.
//
// IMAGERY — C:\LVINIT\Images is a Windows path and was confirmed unreachable
// from this Linux cloud session this run (no /mnt/c mount exists). No
// existing repo photography depicts this specific East Las Vegas apartment
// community. Per the standard fallback order, this piece carries a generated
// LVINIT editorial cover (registered in lib/content.ts as the card image
// only, imageMode "editorial-cover") and a photoless StoryHero — never a
// fabricated stand-in "photo" of a building nobody here has actually seen.
//   node scripts/generate-guide-cover.mjs --slug gholson-landing-affordable-housing-east-las-vegas \
//     --category "Local Feature" --subject "Gholson Landing" \
//     --out gholson-landing-editorial-cover.webp
//   -> public/images/covers/gholson-landing-editorial-cover.webp
// ---------------------------------------------------------------------------

const PATH = "/guides/gholson-landing-affordable-housing-east-las-vegas";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

const meta: StoryMeta = {
  title:
    "Gholson Landing: 121 New Affordable Apartments Open in East Las Vegas | LVINIT",
  headline:
    "Gholson Landing Just Opened 121 Affordable Apartments in East Las Vegas",
  description:
    "A $32 million, 121-unit affordable housing community opened this week at 2601 Sunrise Ave. Who it's for, what's actually inside, and why it's a real data point in the valley's affordability story — not a home you can buy.",
  path: PATH,
  datePublished: "2026-09-25",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Gholson Landing", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "121",
    label: "Apartments, one- to four-bedroom",
    note: "600–1,300 sq ft, already about 80% leased at opening",
  },
  {
    value: "$32M",
    label: "Total development cost",
    note: "Southern Nevada Regional Housing Authority + The Michaels Organization",
  },
  {
    value: "30%–80%",
    label: "Of area median income",
    note: "The income band this community is restricted to, per SNRHA",
  },
  {
    value: "2026",
    label: "Construction completed",
    note: "Grand opening ceremony held Tuesday, September 22, 2026",
  },
];

function SnapshotPanel() {
  return (
    <section
      id="by-the-numbers"
      aria-label="Gholson Landing snapshot"
      className="scroll-mt-24"
    >
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            Gholson Landing, by the numbers
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            What&rsquo;s actually confirmed about the community that opened
            this week. See the sources at the end of this article for the
            full reporting.
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

          <p className="mt-6 max-w-[680px] text-caption text-lvinit-warmgray">
            Gholson Landing is income-restricted rental housing, not a home
            for sale — worth saying plainly on a real estate site.
          </p>
        </div>
      </Container>
    </section>
  );
}

export default function GholsonLandingPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Local Feature",
        headline:
          "Gholson Landing Just Opened 121 Affordable Apartments in East Las Vegas",
        subheadline:
          "A $32 million community named for a man who once lived in public housing himself opened this week at 2601 Sunrise Ave. Here's who it's actually for, what's inside, and why it's worth understanding even if you're not the one renting it.",
        // Not Mikey's own photography and not AI-generated — a real
        // photograph of the property that Mikey found online and supplied
        // for this piece (source not independently confirmed). See the
        // visible credit banner rendered immediately below the hero, before
        // the lede, mirroring the KB Home / sandstone-tule-springs pattern.
        image: "/images/hero/gholson-landing-affordable-housing-hero.webp",
        imageAlt:
          "Straight-on view of a three-story stucco apartment building at Gholson Landing with red front doors, private balconies, new landscaping, blue benches, and a lawn in the foreground",
        backLink: { label: "LVINIT", href: "/" },
        ctas: [
          { label: "See the numbers", href: "#by-the-numbers", variant: "primary" },
        ],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "Gholson Landing is one piece of a bigger picture LVINIT has been tracking all year: what housing in this valley actually costs, for buyers and renters alike.",
        stories: [
          {
            name: "Las Vegas Down-Payment Assistance Programs, Explained",
            href: "/guides/las-vegas-down-payment-assistance-programs-2026",
            category: "Buyer Guide",
            dek: "The real minimums by loan type, and Nevada's actual down-payment-assistance programs, for anyone weighing ownership instead of renting.",
          },
          {
            name: "Las Vegas Home Prices, August 2026",
            href: "/guides/las-vegas-home-prices-august-2026",
            category: "Market Watch",
            dek: "The valley-wide resale picture the same month this community finished leasing up — useful context for how tight things still are.",
          },
          {
            name: "Las Vegas Starter-Home Prices, 2026",
            href: "/guides/las-vegas-starter-home-prices-2026",
            category: "Market Watch",
            dek: "What the entry tier of the for-sale market actually costs right now — the ownership-side counterpart to this rental story.",
          },
        ],
      }}
      ctas={{
        heading: "Weighing renting versus buying here?",
        body:
          "Gholson Landing isn't a home you can buy into, but the question behind it — what actually fits your budget in this valley right now — is one I help people work through every day. Tell me where you're starting from and I'll give you the honest read.",
      }}
    >
      <div className="border-b border-lvinit-lightgray bg-lvinit-lightgray/40">
        <Container className="py-4">
          <p className="mx-auto max-w-[680px] text-caption text-lvinit-warmgray">
            <span className="font-bold uppercase tracking-wide text-lvinit-blue">
              Photo note —{" "}
            </span>
            the image above is a real photograph of Gholson Landing, not
            captured by Mikey Del Rosario or LVINIT and not AI-generated. Its
            original source hasn&rsquo;t been independently confirmed.
          </p>
        </Container>
      </div>

      <StoryLede
        kicker="Local Feature"
        lead="This week, a new 121-unit apartment community opened at 2601 Sunrise Ave. in Las Vegas, not far from Nellis Boulevard. It's income-restricted, not for sale, and it's not the kind of story LVINIT usually leads with. But it's a real, verifiable data point in the same affordability conversation running through everything else we cover this year — from starter-home prices to down-payment assistance — so it's worth understanding on its own terms."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Here&rsquo;s what actually opened, who it&rsquo;s for, and how it
          connects to the{" "}
          <Link
            href="/guides/las-vegas-down-payment-assistance-programs-2026"
            className={linkCls}
          >
            ownership-side affordability guides
          </Link>{" "}
          we&rsquo;ve already published.
        </p>
      </StoryLede>

      <StorySection heading="What actually opened, and who it's for">
        <p className="text-body-lg text-lvinit-warmgray">
          The Southern Nevada Regional Housing Authority (SNRHA) and its
          development partner, The Michaels Organization, held a ceremonial
          grand opening for{" "}
          <span className="text-lvinit-black">Gholson Landing</span> at 8
          a.m. on Tuesday, September 22, 2026. The community sits at{" "}
          <span className="text-lvinit-black">2601 Sunrise Ave.</span>, in the
          part of the valley sometimes referred to as &ldquo;Downtown
          East,&rdquo; a stretch of the city LVINIT hasn&rsquo;t covered
          before.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It&rsquo;s a{" "}
          <span className="text-lvinit-black">$32 million</span>, 121-unit
          development with one- to four-bedroom floor plans ranging from{" "}
          <span className="text-lvinit-black">600 to 1,300 square feet</span>.
          Construction finished earlier in 2026, and by the time of the
          opening the property was already{" "}
          <span className="text-lvinit-black">about 80% leased</span>. On-site
          amenities include a community clubhouse with a kitchen, a fitness
          center, a computer lab, and an outdoor playground.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The units are restricted to households earning between{" "}
          <span className="text-lvinit-black">30% and 80% of the area
          median income (AMI)</span>. That&rsquo;s a workforce- and low-income
          eligibility band, not a homebuying program — nobody builds equity
          here or works toward a purchase. It&rsquo;s worth saying plainly, on
          a real estate site: this is a place to rent, not a home to buy.
        </p>
      </StorySection>

      <SnapshotPanel />

      <StorySection heading="The name behind the building">
        <p className="text-body-lg text-lvinit-warmgray">
          The community is named for{" "}
          <span className="text-lvinit-black">Thomas Gholson</span>, who
          served as deputy executive director of the Las Vegas Housing
          Authority — SNRHA&rsquo;s predecessor agency — from 1990 to 1996.
          Gholson himself once lived in public housing, and during his tenure
          he helped start resident job-apprenticeship programs, youth
          Late-Night Basketball leagues, and the Community Peace coalition.
        </p>
      </StorySection>

      <StoryPullQuote cite="Thomas Gholson, the community's namesake, on the residents he worked with as deputy executive director of the Las Vegas Housing Authority">
        I could not have been what I was without the tenants who were the
        lifeblood of the housing authority.
      </StoryPullQuote>

      <StorySection heading="Why this particular corner of the valley">
        <p className="text-body-lg text-lvinit-warmgray">
          Frank Stafford, SNRHA&rsquo;s director of development and
          modernization, pointed to what&rsquo;s nearby as part of the case
          for the site: &ldquo;Less than one mile away, there&rsquo;s a
          one-stop career center that will help people here use other tools
          for gainful employment,&rdquo; he said, calling the project a step
          toward &ldquo;revitalizing this community.&rdquo;
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          One resident, Dandy Tellez, described the appeal in more personal
          terms: &ldquo;I just like this area here because my mom is like
          five minutes up the road, my mother-in-law is five minutes the
          opposite way,&rdquo; she said. &ldquo;Around here it&rsquo;s really
          quiet, everybody&rsquo;s very friendly.&rdquo;
        </p>
      </StorySection>

      <StorySection muted heading="It's part of a bigger, named program — not a one-off">
        <p className="text-body-lg text-lvinit-warmgray">
          Gholson Landing isn&rsquo;t SNRHA&rsquo;s only project this cycle.
          Announced alongside it, back in early 2026, is{" "}
          <span className="text-lvinit-black">Beals-Henderson Pointe</span>,
          an 80-unit affordable community at 5901 W. Duncan Dr. that finished
          construction in April 2026 and is named for civil-rights organizers
          Alversa Beals and Essie Henderson. Together, SNRHA and The Michaels
          Organization describe the two communities as{" "}
          <span className="text-lvinit-black">
            201 new affordable apartment homes
          </span>
          , funded in part through low-income housing tax credits and federal
          American Rescue Plan Act (ARPA) dollars administered through
          Nevada&rsquo;s statewide{" "}
          <span className="text-lvinit-black">Home Means Nevada
          Initiative</span> — a roughly $500 million program the state
          launched in 2022 to fund new affordable construction, preservation,
          and homeownership incentives. We couldn&rsquo;t find any figure
          breaking out exactly how much of that statewide pool went to
          Gholson Landing specifically, so none is claimed here.
        </p>
      </StorySection>

      <StorySection heading="How this fits the rest of the valley's affordability story">
        <p className="text-body-lg text-lvinit-warmgray">
          LVINIT spends most of its Market Watch coverage on the resale and
          new-construction side of the market — where{" "}
          <Link
            href="/guides/las-vegas-home-prices-august-2026"
            className={linkCls}
          >
            resale prices sat in August 2026
          </Link>
          , or how{" "}
          <Link
            href="/guides/las-vegas-starter-home-prices-2026"
            className={linkCls}
          >
            the starter tier
          </Link>{" "}
          has moved. Gholson Landing is a different data point entirely: not
          a price for a home, but a supply answer for households the for-sale
          market isn&rsquo;t built to serve at all, at least not yet. It
          doesn&rsquo;t change anyone&rsquo;s down payment math, and it
          isn&rsquo;t a substitute for the{" "}
          <Link
            href="/guides/las-vegas-down-payment-assistance-programs-2026"
            className={linkCls}
          >
            real down-payment-assistance programs
          </Link>{" "}
          that exist for buyers. But it&rsquo;s a useful reminder that
          &ldquo;housing affordability in Las Vegas&rdquo; is a bigger
          question than the one this site usually answers, and a valley that
          opens 121 income-restricted units this week is a valley still
          actively working the problem from more than one direction.
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
              Whether SNRHA announces further Home Means Nevada-funded
              projects, and where in the valley they land.
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue"
            />
            <span>
              Whether the remaining roughly 20% of units lease up quickly,
              given the reported demand.
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue"
            />
            <span>
              Any reporting on rent levels for specific unit types — none has
              been published yet, and none is guessed here.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Fox5 Vegas</span>,
            &ldquo;Southern Nevada Regional Housing Authority hosting grand
            opening for new affordable apartments,&rdquo; published
            September 22, 2026 — event details, unit count, income band, and
            historical background on Thomas Gholson.{" "}
            <a
              href="https://www.fox5vegas.com/2026/09/22/southern-nevada-regional-housing-authority-hosting-grand-opening-new-affordable-apartments/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Vegas</span>,
            &ldquo;New Las Vegas affordable housing community Gholson Landing
            opens,&rdquo; published September 23, 2026 — post-event coverage
            confirming the $32 million cost, unit sizes, and leasing status.{" "}
            <a
              href="https://www.fox5vegas.com/2026/09/23/new-las-vegas-affordable-housing-community-gholson-landing-opens/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KTNV</span>, &ldquo;New
            affordable housing complex opens in east Las Vegas&rdquo; —
            independently reported, on-the-ground coverage with the on-site
            amenity list and the Stafford/Tellez/Gholson quotes used in this
            piece.{" "}
            <a
              href="https://www.ktnv.com/neighborhoods/east-las-vegas/new-affordable-housing-complex-opens-in-east-las-vegas"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              ktnv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">
              Las Vegas Review-Journal
            </span>
            , &ldquo;New $32M affordable-housing complex opens in Las
            Vegas.&rdquo; Corroborates the $32M figure and the opening by
            headline; the article itself returned a paywall/soft-block to
            direct fetch this run, so it&rsquo;s listed here as
            corroborating, not directly read.{" "}
            <a
              href="https://www.reviewjournal.com/business/housing/new-affordable-housing-complex-opens-in-east-las-vegas-3889789/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              reviewjournal.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">
              The Michaels Organization
            </span>
            , &ldquo;Southern Nevada Regional Housing Authority Names Two New
            Affordable Housing Communities to Honor Local Housing and Civil
            Rights Champions,&rdquo; February 2026 — background on the
            Beals-Henderson Pointe companion project, the combined 201-unit
            figure, and the ARPA/Home Means Nevada funding context.{" "}
            <a
              href="https://tmo.com/southern-nevada-regional-housing-authority-names-two-new-affordable-housing-communities-to-honor-local-housing-and-civil-rights-champions/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              tmo.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">
              Nevada Housing Division / Governor&rsquo;s Office
            </span>
            , &ldquo;Nevada Housing Division outlines $500 million Home Means
            Nevada housing initiative,&rdquo; 2022 — background only, on the
            statewide ARPA-funded program referenced above.{" "}
            <a
              href="https://gov.nv.gov/News/Press/2022/2022-3-1_Home_Means_Nevada/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              gov.nv.gov
            </a>
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Gholson Landing is income-restricted rental housing, not a
          for-sale property. This article is general local reporting, not
          housing, financial, or legal advice, and not an application or
          leasing channel — contact SNRHA directly for eligibility and
          availability.
        </p>
      </StorySection>

      <StorySection heading="About this coverage">
        <p className="text-body text-lvinit-warmgray">
          LVINIT Editorial · The Scofield Group · Nevada License S.0175577.
          Equal Housing Opportunity.
        </p>
      </StorySection>
    </StoryPage>
  );
}
