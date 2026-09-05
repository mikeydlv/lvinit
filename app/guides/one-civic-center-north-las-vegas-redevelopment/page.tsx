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
// LOCAL FEATURE — "One Civic Center." Genuine breaking-adjacent news
// (published via the autonomous scheduled editorial-publishing routine),
// grepped for "One Civic Center," "Agora Realty," "2200 Civic Center" before
// writing — zero prior matches anywhere on LVINIT. Downtown North Las
// Vegas's old, vacant City Hall site is being redeveloped into a mixed-use
// civic/housing/commercial campus, the city's first market-rate downtown
// housing in roughly two decades. Directly relevant to LVINIT's existing
// `/neighborhoods/north-las-vegas` pillar guide, which covers Aliante, Tule
// Springs, Valley Vista, Craig Ranch, and the northern growth edge — none of
// which is downtown/Civic Center Dr., so this is a genuinely new sub-area for
// that guide, not a restatement of anything already published.
//
// FACT DISCIPLINE (read before editing) — every figure below is sourced to
// the pieces cited in the "Sources" section at the foot of the article, and
// was independently re-verified this run via WebFetch/WebSearch against the
// primary source and four corroborating pieces. Do not add, round, or infer
// anything beyond what is listed here.
//
// - Primary source: Las Vegas Review-Journal, published Sept 3, 2026,
//   "Developer buys 16 acres for $1,575 for big project in North Las
//   Vegas."
//   https://www.reviewjournal.com/business/developer-buys-16-acres-for-less-than-1600-for-big-project-in-north-las-vegas-3881877/
// - Corroborating, independently reported on the Jan 2026 demolition kickoff:
//   Fox5 Vegas, News3LV, and KTNV (URLs in Sources). Corroborating on the
//   Sept 2026 land-sale story: Hoodline and NVBEX (URLs in Sources). The
//   City of North Las Vegas's own newsroom item returned a 403 to direct
//   fetch this run — its content is corroborated via the outlets above, so
//   it is listed as background context only, not cited as directly read.
// - Project name: One Civic Center. Site: 2200 Civic Center Dr., North Las
//   Vegas — the former City Hall complex, vacated in 2011 when staff moved
//   to a new administrative headquarters, and sitting empty for roughly 14
//   years / "more than a decade" before demolition began.
// - Demolition of the old City Hall buildings began January 2026 (Mayor
//   Pamela Goynes-Brown operated an excavator at the kickoff event).
// - Land deal: the City of North Las Vegas sold roughly 19 acres total to
//   Agora Realty & Management (Calabasas, California) for a combined
//   $1,938.80. The main ~15.8/16-acre parcel closed for $1,575 in July
//   2026 (approved by City Council in fall/October 2025). City staff had
//   appraised the property at roughly $6.8 million at one point and
//   roughly $13.5 million at another.
// - Contractual construction obligations tied to the sale: a minimum
//   15,000-sq-ft commercial building, an apartment complex of at least 100
//   units, and a new civic building of at least 30,000 sq ft, plus
//   gathering spaces/amenities including a recreation center.
// - City staff project the completed campus will generate roughly $20.5
//   million per year in economic output.
// - Timeline: construction targeted for late 2026 or early 2027, over a
//   60-month phased build. The final 3.9-acre parcel — the site of the
//   current police buildings — won't have its buildings demolished until
//   November 2027, with escrow on that last piece closing September 2028.
// - This is the first market-rate housing planned for downtown North Las
//   Vegas in roughly two decades, per city spokesman Greg Bortolin.
// - Real, attributed quotes: Aaron Lefton, Agora's president of
//   acquisitions and leasing ("a center-city that North Las Vegas never
//   had"); Greg Bortolin, City of North Las Vegas spokesman (the old City
//   Hall "sat empty for more than a decade with no interest"); Mayor Pamela
//   Goynes-Brown ("Our goal is to bring life into our downtown core.").
//   None are written in Mikey's voice — all attributed exactly as reported.
// - Background only, for context, not asserted as fact about this deal:
//   Agora is also behind Hylo Park (the former Texas Station/Fiesta Rancho
//   site) and the Nevada State University satellite campus lease in North
//   Las Vegas, plus its earlier 2013 acquisition of the adjacent Fiesta
//   Plaza. Named to show Agora already has a track record in this exact
//   part of the city — not treated as evidence about One Civic Center's own
//   outcome.
// - Deliberately omitted: any dollar-per-unit pricing, apartment rents, or
//   commercial-tenant names. None have been reported, and none are guessed
//   here.
//
// IMAGERY — C:\LVINIT\Images was checked for this run and is not reachable
// from this cloud session (it lives on Mikey's local Windows machine; this
// is a remote environment). No existing repo photography depicts this
// specific site (a downtown government block under active demolition, with
// no construction yet). Per the standard fallback order, this piece carries
// a generated LVINIT editorial cover (registered in lib/content.ts as the
// card image only, imageMode "editorial-cover") and a photoless StoryHero —
// never a fabricated stand-in "photo" of a site that doesn't look like
// anything yet, and never a reuse of the generic
// hero/north-las-vegas-aerial.jpg, which depicts a different part of the
// city.
//   node scripts/generate-guide-cover.mjs --slug one-civic-center-north-las-vegas-redevelopment \
//     --category "Local Feature" --subject "One Civic Center" \
//     --out one-civic-center-editorial-cover.webp
//   -> public/images/covers/one-civic-center-editorial-cover.webp
// ---------------------------------------------------------------------------

const PATH = "/guides/one-civic-center-north-las-vegas-redevelopment";

const meta: StoryMeta = {
  title:
    "One Civic Center: North Las Vegas Redevelops Its Empty Downtown Core | LVINIT",
  headline:
    "One Civic Center: What's Actually Happening at North Las Vegas's Old City Hall Site",
  description:
    "North Las Vegas sold its vacant old City Hall site to Agora Realty for about $1,939, in exchange for a contractually required civic building, apartments, and commercial space. What's confirmed about One Civic Center, and when any of it might actually exist.",
  path: PATH,
  datePublished: "2026-09-05",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "One Civic Center", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

// Verified snapshot for the stat panel. Every figure is sourced in the
// article's own "Sources" section; nothing here is estimated or rounded
// differently from the source reporting.
type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "$1,938.80",
    label: "Total sale price, ~19 acres",
    note: "City staff had appraised the land at $6.8M–$13.5M at different points",
  },
  {
    value: "100+ / 15,000 / 30,000",
    label: "Apartment units / commercial sq ft / civic building sq ft, minimums",
    note: "Contractually required of the developer, not optional add-ons",
  },
  {
    value: "$20.5M / year",
    label: "Projected economic output",
    note: "City staff's projection once the campus is complete",
  },
  {
    value: "Late 2026–2027",
    label: "Construction targeted to begin",
    note: "Over a 60-month phased build — nothing here is buyable soon",
  },
];

function SnapshotPanel() {
  return (
    <section
      id="by-the-numbers"
      aria-label="One Civic Center snapshot"
      className="scroll-mt-24"
    >
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            One Civic Center, by the numbers
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            What&rsquo;s actually confirmed about the deal that closed this
            summer. See the sources at the end of this article for the full
            reporting.
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
            No apartments, storefronts, or civic building exist yet. This is a
            closed land sale and a set of construction obligations, not an
            available place to live or lease.
          </p>
        </div>
      </Container>
    </section>
  );
}

export default function OneCivicCenterPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Local Feature",
        headline:
          "One Civic Center: What's Actually Happening at North Las Vegas's Old City Hall Site",
        subheadline:
          "North Las Vegas just sold the block where its old City Hall sat empty for over a decade — for about $1,939. Here's what the developer is actually obligated to build, why the price looks strange until you read the fine print, and when any of it might actually exist.",
        backLink: { label: "LVINIT", href: "/" },
        ctas: [
          { label: "See the numbers", href: "#by-the-numbers", variant: "primary" },
        ],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "One Civic Center is one piece of a bigger question worth asking about any part of the valley: what's actually confirmed, and what's still just a plan?",
        stories: [
          {
            name: "Living in North Las Vegas",
            href: "/neighborhoods/north-las-vegas",
            category: "Area Guide",
            dek: "The incorporated city this redevelopment sits inside — our full guide to how its neighborhoods actually differ, downtown included.",
          },
          {
            name: "Monument Hills: What a New 6,000-Home Community Means for Northwest Las Vegas",
            href: "/guides/monument-hills-northwest-las-vegas",
            category: "Local Feature",
            dek: "A different kind of northwest-valley land deal, on City of Las Vegas land — useful contrast for how these development stories tend to unfold.",
          },
          {
            name: "Las Vegas New-Home Sales Jumped in July 2026",
            href: "/guides/las-vegas-new-home-sales-july-2026",
            category: "Market Watch",
            dek: "What builders were actually selling and permitting valley-wide the month before this deal closed — useful context for how this fits the bigger new-construction picture.",
          },
        ],
      }}
      relatedNeighborhood={{
        name: "North Las Vegas",
        href: "/neighborhoods/north-las-vegas",
        kicker: "The parent guide",
        heading: "Read the North Las Vegas guide",
        blurb:
          "One Civic Center sits in North Las Vegas's actual downtown core — a different stretch of the city than the Aliante, Tule Springs, and northern-growth areas our North Las Vegas guide already covers. Worth reading both to see the full range of what \"North Las Vegas\" actually means.",
      }}
      ctas={{
        heading: "Watching what happens downtown?",
        body:
          "Nothing at One Civic Center is buyable or leasable yet, but a city investing in its own downtown core is a real signal for anyone weighing North Las Vegas over a longer timeline. Tell me what you're weighing and I'll give you the honest read on where this fits.",
      }}
    >
      <StoryLede
        kicker="Local Feature"
        lead="For more than a decade, the block at 2200 Civic Center Drive in downtown North Las Vegas sat empty — the city's old City Hall, vacated in 2011 and left standing with no real plan for it. That changed this year. Demolition started in January 2026, and in July the city closed a land sale that hands the site to a private developer under one condition: build something specific, on a set schedule, or the deal doesn't hold up its end."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Here&rsquo;s what the deal actually requires, why the sale price
          looks almost like a typo, and how long it&rsquo;ll really be before
          any of this is a place you can visit, rent, or buy into. (More on
          how this fits the rest of the city in our{" "}
          <Link
            href="/neighborhoods/north-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            North Las Vegas guide
          </Link>{" "}
          below.)
        </p>
      </StoryLede>

      <StorySection heading="The deal: about $1,939 for land once appraised near $13.5 million">
        <p className="text-body-lg text-lvinit-warmgray">
          The Las Vegas Review-Journal reported on September 3, 2026 that the
          City of North Las Vegas sold roughly{" "}
          <span className="text-lvinit-black">19 acres</span> along Civic
          Center Drive, just north of Lake Mead Boulevard, to{" "}
          <span className="text-lvinit-black">
            Agora Realty &amp; Management
          </span>
          , a Calabasas, California-based firm, for a combined{" "}
          <span className="text-lvinit-black">$1,938.80</span>. The main
          parcel — about 15.8 acres — closed for $1,575 in July 2026, after
          the City Council approved the deal in the fall of 2025.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Read that price again: not $1.9 million. Nineteen hundred thirty-
          eight dollars and eighty cents, for land the city&rsquo;s own staff
          had appraised at roughly{" "}
          <span className="text-lvinit-black">$6.8 million</span> at one
          point, and roughly{" "}
          <span className="text-lvinit-black">$13.5 million</span> at
          another. On its own, that gap looks like a giveaway. It isn&rsquo;t
          one — at least not an unconditional one. It&rsquo;s a below-market
          land conveyance made in exchange for a specific set of construction
          obligations the developer is contractually on the hook for. That
          structure isn&rsquo;t unusual for redevelopment deals like this one;
          it&rsquo;s a city trading land value for a private developer taking
          on the cost and risk of actually building something on a site
          nobody else touched for fourteen years. Whether it turns out to be
          a good trade for North Las Vegas depends entirely on whether the
          construction obligations below actually get built on schedule.
        </p>
      </StorySection>

      <SnapshotPanel />

      <StorySection heading="What Agora is actually obligated to build">
        <p className="text-body-lg text-lvinit-warmgray">
          The nominal price comes with strings attached. Per the sale terms,
          Agora is required to build, at minimum: a{" "}
          <span className="text-lvinit-black">
            15,000-square-foot commercial building
          </span>
          , an{" "}
          <span className="text-lvinit-black">
            apartment complex of at least 100 units
          </span>
          , and a{" "}
          <span className="text-lvinit-black">
            new civic building of at least 30,000 square feet
          </span>
          . The plan also calls for gathering spaces and amenities, including
          a recreation center. City staff project the completed campus will
          generate roughly{" "}
          <span className="text-lvinit-black">
            $20.5 million a year in economic output
          </span>{" "}
          once it&rsquo;s built and operating.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          City spokesman Greg Bortolin put the old building&rsquo;s condition
          plainly: the former City Hall &ldquo;sat empty for more than a
          decade with no interest,&rdquo; he said, describing the
          redevelopment&rsquo;s benefit as both the economic activity above
          and something North Las Vegas hasn&rsquo;t had in a while —
          Bortolin said the project brings{" "}
          <span className="text-lvinit-black">
            market-rate housing to downtown North Las Vegas for the first
            time in roughly two decades
          </span>
          .
        </p>
      </StorySection>

      <StoryPullQuote cite="Aaron Lefton, Agora Realty & Management, president of acquisitions and leasing">
        A center-city that North Las Vegas never had.
      </StoryPullQuote>

      <StorySection heading="A downtown block that's been empty since 2011">
        <p className="text-body-lg text-lvinit-warmgray">
          The old City Hall complex was vacated in 2011, when city staff
          moved to a newer administrative headquarters. Once occupied, it sat
          empty on prime downtown real estate for the better part of fifteen
          years, one of those buildings every longtime valley resident
          half-notices and stops wondering about. Demolition of the original
          structures formally began in{" "}
          <span className="text-lvinit-black">January 2026</span>, with
          Mayor Pamela Goynes-Brown operating an excavator at the kickoff
          event — the same event that put the project&rsquo;s name, One
          Civic Center, on the record.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          &ldquo;Our goal is to bring life into our downtown core,&rdquo;
          Mayor Goynes-Brown said of the project. It&rsquo;s a reasonable
          summary of what a decade-plus of an empty government building in
          the middle of downtown actually costs a city — not just the lost
          tax base, but the signal it sends about whether downtown is a place
          worth investing in at all.
        </p>
      </StorySection>

      <StorySection muted heading="The timeline: nothing here is available yet">
        <p className="text-body-lg text-lvinit-warmgray">
          Worth stating plainly, the same way we do with every land deal we
          cover: a signed sale and a construction requirement are not a
          finished building. Construction is targeted to begin in{" "}
          <span className="text-lvinit-black">late 2026 or early 2027</span>
          , unfolding over an anticipated{" "}
          <span className="text-lvinit-black">60-month phased build</span> —
          five years, roughly, from first shovel to full build-out. There is
          no apartment to tour, no storefront to lease, and no civic building
          to walk into right now.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The deal also isn&rsquo;t fully closed. A final{" "}
          <span className="text-lvinit-black">3.9-acre parcel</span> — the
          site of the city&rsquo;s current police buildings — is part of the
          overall footprint but won&rsquo;t have its buildings demolished
          until{" "}
          <span className="text-lvinit-black">November 2027</span>, with
          escrow on that last piece of land scheduled to close in{" "}
          <span className="text-lvinit-black">September 2028</span>. Those
          buildings are still doing their job today; nothing about this
          project displaces active police operations on any near-term
          timeline.
        </p>
      </StorySection>

      <StorySection heading="Agora already has a foothold on this block">
        <p className="text-body-lg text-lvinit-warmgray">
          Agora isn&rsquo;t a new name to this stretch of Civic Center Drive.
          The firm is also behind{" "}
          <span className="text-lvinit-black">Hylo Park</span>, the
          mixed-use redevelopment of the former Texas Station/Fiesta Rancho
          site elsewhere in North Las Vegas, and holds the lease for{" "}
          <span className="text-lvinit-black">
            Nevada State University&rsquo;s satellite campus
          </span>{" "}
          in the city. It&rsquo;s background context, not evidence about how
          One Civic Center itself will turn out — a developer&rsquo;s
          existing local presence doesn&rsquo;t guarantee any one project
          delivers on schedule — but it does mean this isn&rsquo;t an
          untested outside firm making its first bet on downtown North Las
          Vegas.
        </p>
      </StorySection>

      <StorySection heading="How this fits the rest of the city">
        <p className="text-body-lg text-lvinit-warmgray">
          Our{" "}
          <Link
            href="/neighborhoods/north-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            North Las Vegas guide
          </Link>{" "}
          already makes the point that the city reads completely differently
          depending on where you are — established central neighborhoods,
          amenity-driven master plans, and brand-new construction on the
          northern edge. One Civic Center adds a fourth data point: an
          actual downtown core, one the city itself is now trying to build
          into something people spend time in, not just drive past.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It&rsquo;s a different kind of growth story than{" "}
          <Link
            href="/guides/monument-hills-northwest-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Monument Hills
          </Link>
          , the roughly 6,000-home community planned on the far northwest
          edge of the valley on City of Las Vegas land. Monument Hills is new
          desert being turned into new suburbs. One Civic Center is the
          opposite motion — an existing, already-central government block
          being redeveloped into something more mixed and more urban. Two
          very different bets on where the valley&rsquo;s growth goes next,
          in two different jurisdictions, both years away from anything a
          buyer can actually walk into.
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
              Whether construction actually breaks ground on the targeted
              late-2026/early-2027 window — a required-but-unbuilt project
              is still just a plan until dirt moves.
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue"
            />
            <span>
              Which commercial tenants, if any, get named for the required
              15,000-square-foot building — none have been reported yet.
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue"
            />
            <span>
              Actual apartment pricing once it&rsquo;s published. No rents or
              purchase prices have been reported for the required 100-plus
              unit complex, and none are guessed here.
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue"
            />
            <span>
              Progress on the final 3.9-acre police-building parcel, which
              stays on its current schedule (demolition November 2027,
              escrow close September 2028) independent of the rest of the
              site.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">
              Las Vegas Review-Journal
            </span>
            , &ldquo;Developer buys 16 acres for $1,575 for big project in
            North Las Vegas,&rdquo; published September 3, 2026 — the primary
            source for the deal terms, appraisal figures, construction
            obligations, projected economic output, the full timeline, and
            all three attributed quotes.{" "}
            <a
              href="https://www.reviewjournal.com/business/developer-buys-16-acres-for-less-than-1600-for-big-project-in-north-las-vegas-3881877/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              reviewjournal.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Vegas</span>,
            &ldquo;North Las Vegas kicks off downtown transformation with
            former city hall demolition.&rdquo; Independently reported,
            corroborating the January 2026 demolition kickoff.{" "}
            <a
              href="https://www.fox5vegas.com/2026/01/22/north-las-vegas-kicks-off-downtown-transformation-with-former-city-hall-demolition/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">News 3 LV</span>,
            &ldquo;City of North Las Vegas begins demolition process of
            former city hall.&rdquo; Independently reported, corroborating
            the January 2026 demolition kickoff.{" "}
            <a
              href="https://news3lv.com/news/local/city-of-north-las-vegas-begins-demolition-process-of-former-city-hall"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              news3lv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KTNV</span>, &ldquo;North Las
            Vegas begins new era with city hall demolition for mixed-use
            development.&rdquo; Independently reported, corroborating the
            January 2026 demolition kickoff.{" "}
            <a
              href="https://www.ktnv.com/news/north-las-vegas-begins-new-era-with-city-hall-demolition-for-mixed-use-development"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              ktnv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Hoodline</span>,
            &ldquo;North Las Vegas Sells 16 Acres to Agora Realty for
            $1,600,&rdquo; September 2026. Independently reported,
            corroborating the land-sale terms and Agora&rsquo;s other North
            Las Vegas projects.{" "}
            <a
              href="https://hoodline.com/2026/09/agora-realty-snags-16-acres-in-north-las-vegas-for-under-1-600/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              hoodline.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">NVBEX</span>, &ldquo;Agora
            Realty &amp; Management Redeveloping North Las Vegas Civic
            Center,&rdquo; January 2026. Independently reported, background
            on the project&rsquo;s January 2026 launch.{" "}
            <a
              href="https://nevbex.com/2026/01/28/north-las-vegas-one-civic-center-development/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              nevbex.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">
              City of North Las Vegas
            </span>{" "}
            newsroom item on the demolition/groundbreaking. Its own page
            returned an access error to direct fetch this run; its content
            is corroborated by the independently reported outlets above, so
            it is listed here as background context rather than cited as
            directly read.
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Development plans can change between a land sale and completed
          construction. Figures above reflect the sources and dates cited
          and should not be treated as a guarantee of the final project.
          This article is general local reporting, not financial, lending,
          or investment advice.
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
