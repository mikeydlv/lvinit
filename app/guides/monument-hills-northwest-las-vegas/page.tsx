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
// LOCAL FEATURE — "Monument Hills." Genuine breaking news (published via the
// autonomous scheduled editorial-publishing routine), not previously covered
// anywhere on LVINIT (grepped for "Monument Hills," "Olympia Companies,"
// "Bruin Capital," "940 acres" before writing — zero matches). A ~6,000-home
// master-planned community forming in the far northwest Las Vegas Valley,
// directly relevant to LVINIT's audience of relocators/buyers watching the
// valley's growth edge, and to the existing North Las Vegas pillar guide's
// "Tule Springs" / "Northern growth areas" material.
//
// FACT DISCIPLINE (read before editing) — every figure below is sourced to
// the pieces cited in the "Sources" section at the foot of the article. Do
// not add, round, or infer anything beyond what is listed here.
//
// - Primary source: Las Vegas Review-Journal, Eli Segall, published Sept 2,
//   2026, "Developers buy 940 acres for $94 million for Las Vegas' biggest
//   new community in years."
//   https://www.reviewjournal.com/business/housing/developers-buy-900-plus-acres-for-las-vegas-biggest-new-community-in-years-3873678/
// - Corroborating, independently reported: 8 News Now, News 3 LV, and KTNV
//   (URLs in Sources). Used only for facts that also appear in the RJ piece.
// - Background-only source (approval timeline, NOT used for any figure not
//   corroborated by the September 2026 reporting above): NVBEX, Aug 2025.
//   https://nevbex.com/2025/08/16/monument-hills-master-plan-las-vegas/
// - Project name: Monument Hills. Buyers: Olympia Companies and Bruin
//   Capital Partners, operating as Monument Hills Partners LLC.
// - Deal: ~940 acres (939.5 acres precisely, per approval-stage reporting)
//   for $94 million. Sale closed the last week of August 2026.
// - Deal structure (the actual news hook): a three-party transaction. The
//   Bureau of Land Management sold the land to the City of Las Vegas, which
//   then resold it to the developers. This is City of Las Vegas
//   jurisdiction — NOT the separate incorporated city of North Las Vegas.
//   Do not blur that distinction anywhere in this piece.
// - Location: upper northwest Las Vegas Valley, east of the Las Vegas
//   Paiute Tribe's golf course, along U.S. Highway 95, west of the Tule
//   Springs Fossil Beds National Monument, north of Moccasin Road.
// - Scale: up to 6,000 homes, described in the source as spanning
//   "attainable housing" through "executive-level homes." No specific price
//   points were reported and none are invented here.
// - Timeline: first homes expected spring 2028. Nothing here is buyable
//   today — state that plainly throughout, never imply present
//   availability.
// - Military/workforce housing: 290 dedicated military-housing units plus
//   300 workforce-housing units, intended for personnel connected to Nellis
//   Air Force Base and Creech Air Force Base.
// - Amenities/infrastructure: ~90 acres of parks and trails, two future
//   school sites, commercial space. No specific retailers, builders, or
//   school names were reported.
// - Real, attributed quotes: Las Vegas Mayor Shelley Berkley ("I can't wait
//   to put shovels in the ground and families into homes.") and Chris
//   Armstrong, Olympia Companies executive vice president ("It's definitely
//   the largest in a while."). Named for texture only, not quoted: Garry
//   Goett (Olympia founder), Larry Canarelli (Bruin Capital).
// - Approval timeline (background only, from NVBEX): the Las Vegas City
//   Council approved the purchase agreement in August 2025; the closing
//   reported in September 2026 completes that process.
// - Deliberately omitted: any Las Vegas Paiute Tribe appeal/petition. That
//   claim appears only in the older, single secondary source and is not
//   corroborated by the current reporting — omitted rather than risk a
//   stale or unverified claim.
//
// IMAGERY — C:\LVINIT\Images was checked for this run and is not reachable
// from this cloud session (it lives on Mikey's local Windows machine; this
// is a remote environment). No existing repo photography depicts this
// specific site (a still-vacant 940-acre parcel with no construction yet).
// Per the standard fallback order, this piece carries a generated LVINIT
// editorial cover (registered in lib/content.ts as the card image only,
// imageMode "editorial-cover") and a photoless StoryHero — never a
// fabricated stand-in "photo" of a community that doesn't exist yet.
//   node scripts/generate-guide-cover.mjs --slug monument-hills-northwest-las-vegas \
//     --category "Local Feature" --subject "Monument Hills" \
//     --out monument-hills-editorial-cover.webp
//   -> public/images/covers/monument-hills-editorial-cover.webp
// ---------------------------------------------------------------------------

const PATH = "/guides/monument-hills-northwest-las-vegas";

const meta: StoryMeta = {
  title:
    "Monument Hills: What Las Vegas' Newest 6,000-Home Community Means for the Northwest Valley | LVINIT",
  headline:
    "Monument Hills: What a New 6,000-Home Community Means for Northwest Las Vegas",
  description:
    "Olympia Companies and Bruin Capital closed a $94 million, 940-acre land deal for Monument Hills, a planned 6,000-home community in the far northwest valley. What's confirmed, why it's City of Las Vegas land, and when homes might actually exist.",
  path: PATH,
  datePublished: "2026-09-03",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Monument Hills", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

// Verified snapshot for the stat panel. Every figure is sourced in the
// article's own "Sources" section; nothing here is estimated or rounded
// differently from the source reporting.
type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "940 acres",
    label: "Land purchased",
    note: "939.5 acres precisely, per approval-stage reporting · $94 million",
  },
  {
    value: "6,000",
    label: "Homes planned, up to",
    note: "Attainable through executive-level, per the developers",
  },
  {
    value: "Spring 2028",
    label: "First homes expected",
    note: "Nothing here is buyable today",
  },
  {
    value: "290 + 300",
    label: "Military + workforce housing units",
    note: "For personnel tied to Nellis AFB and Creech AFB",
  },
];

function SnapshotPanel() {
  return (
    <section
      id="by-the-numbers"
      aria-label="Monument Hills snapshot"
      className="scroll-mt-24"
    >
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            Monument Hills, by the numbers
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            What&rsquo;s actually confirmed about the deal that just closed.
            See the sources at the end of this article for the full
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
            No homes exist yet. This is a land sale and a plan, not an
            available community.
          </p>
        </div>
      </Container>
    </section>
  );
}

export default function MonumentHillsPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Local Feature",
        headline:
          "Monument Hills: What a New 6,000-Home Community Means for Northwest Las Vegas",
        subheadline:
          "Developers just closed on 940 acres for what's being called Las Vegas' biggest new community in years. Here's what's actually confirmed, why the land sits inside the City of Las Vegas and not North Las Vegas, and why nobody can buy in yet.",
        backLink: { label: "LVINIT", href: "/" },
        ctas: [
          { label: "See the numbers", href: "#by-the-numbers", variant: "primary" },
        ],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "Monument Hills is one story in a much bigger northwest-valley growth pattern. Here's the rest of the context.",
        stories: [
          {
            name: "Living in North Las Vegas",
            href: "/neighborhoods/north-las-vegas",
            category: "Area Guide",
            dek: "The incorporated city just north of Monument Hills' site — a different jurisdiction, but the closest existing LVINIT guide to this stretch of the valley.",
          },
          {
            name: "Southwest Las Vegas",
            href: "/neighborhoods/southwest-las-vegas",
            category: "Area Guide",
            dek: "The valley's other major growth corridor, on the opposite side of town — for comparison, not confusion.",
          },
          {
            name: "Las Vegas New-Home Sales Jumped in July 2026",
            href: "/guides/las-vegas-new-home-sales-july-2026",
            category: "Market Watch",
            dek: "What builders were actually selling and permitting valley-wide the month before this deal closed.",
          },
        ],
      }}
      relatedNeighborhood={{
        name: "North Las Vegas",
        href: "/neighborhoods/north-las-vegas",
        kicker: "The neighboring guide",
        heading: "Read the North Las Vegas guide",
        blurb:
          "Monument Hills sits just south of areas our North Las Vegas guide already covers as \"Tule Springs\" and \"Northern growth areas\" — but it's City of Las Vegas land, a different city government entirely. Worth reading both to keep the jurisdictions straight.",
      }}
      ctas={{
        heading: "Watching the northwest valley's growth edge?",
        body:
          "Monument Hills won't have homes to buy for a while yet, but the direction of the valley's growth matters for anyone planning a move 1-3 years out. Tell me what you're weighing and I'll give you the honest read on where this fits.",
      }}
    >
      <StoryLede
        kicker="Local Feature"
        lead="A 940-acre stretch of desert in the far northwest Las Vegas Valley just changed hands for $94 million — the land under what's being planned as Las Vegas' biggest new community in years. Nobody can buy a home there yet. First homes aren't expected until spring 2028. But the deal that closed in late August 2026 is worth understanding now, especially the part most coverage glosses over: this land sits inside the City of Las Vegas, not the separate incorporated city of North Las Vegas, even though it borders territory our own North Las Vegas guide already covers."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Here&rsquo;s what&rsquo;s actually confirmed, what the deal
          structure tells you about who governs this land, and what a
          relocator or buyer planning a year or two out should actually watch
          for. (More on that{" "}
          <Link
            href="/neighborhoods/north-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            North Las Vegas guide
          </Link>{" "}
          below.)
        </p>
      </StoryLede>

      <StorySection heading="The deal: 940 acres, $94 million, three parties">
        <p className="text-body-lg text-lvinit-warmgray">
          The Las Vegas Review-Journal reported on September 2, 2026 that
          Olympia Companies and Bruin Capital Partners, operating together as
          Monument Hills Partners LLC, bought roughly{" "}
          <span className="text-lvinit-black">940 acres</span> (939.5 acres,
          precisely, per the earlier approval-stage reporting) for{" "}
          <span className="text-lvinit-black">$94 million</span>. The sale
          closed the last week of August 2026. The story was independently
          corroborated the same week by 8 News Now, News 3 LV, and KTNV.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The land sits in the upper northwest Las Vegas Valley: east of the
          Las Vegas Paiute Tribe&rsquo;s golf course, along U.S. Highway 95,
          west of the Tule Springs Fossil Beds National Monument, and north
          of Moccasin Road. It&rsquo;s the far edge of the valley&rsquo;s
          developable desert, the same general direction our{" "}
          <Link
            href="/neighborhoods/north-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            North Las Vegas guide
          </Link>{" "}
          already flags as the valley&rsquo;s active northern growth edge.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          What made this a genuinely unusual sale isn&rsquo;t the acreage —
          it&rsquo;s who was involved. This wasn&rsquo;t a simple developer
          purchase from a private landowner. It was a three-party
          transaction: the federal Bureau of Land Management sold the land to
          the City of Las Vegas, which then resold it to Monument Hills
          Partners. Public land, sold to a city government, resold to
          developers.
        </p>
      </StorySection>

      <SnapshotPanel />

      <StorySection heading="Whose land this actually is — and why that's easy to get wrong">
        <p className="text-body-lg text-lvinit-warmgray">
          &ldquo;Northwest Las Vegas&rdquo; is a location, not a claim about
          which government runs it, and Monument Hills is exactly the kind of
          project that gets that confused. The land the BLM sold went to the{" "}
          <span className="text-lvinit-black">City of Las Vegas</span>,
          which then resold it to the developers. That means Monument Hills
          is within City of Las Vegas jurisdiction — full stop. It is{" "}
          <em>not</em> in the separate, incorporated city of North Las Vegas,
          even though the site borders territory our North Las Vegas guide
          already discusses as &ldquo;Tule Springs&rdquo; and
          &ldquo;Northern growth areas.&rdquo;
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          This is the same distinction we make elsewhere on LVINIT — Henderson
          is its own city, North Las Vegas is its own city, and Las Vegas
          proper is its own city, and none of them are interchangeable with
          the informal, everyday phrase &ldquo;Las Vegas&rdquo; people use for
          the whole valley. Monument Hills adds one more wrinkle: it&rsquo;s
          geographically in the far northwest of the valley, which sounds
          like it should be North Las Vegas, but the government that will
          actually approve its permits, zoning, and services is the City of
          Las Vegas.
        </p>
      </StorySection>

      <StoryPullQuote cite="Las Vegas Mayor Shelley Berkley">
        I can&rsquo;t wait to put shovels in the ground and families into
        homes.
      </StoryPullQuote>

      <StorySection heading="What's actually planned">
        <p className="text-body-lg text-lvinit-warmgray">
          Monument Hills is planned for up to{" "}
          <span className="text-lvinit-black">6,000 homes</span> across a
          range of market segments — the reporting describes it spanning
          &ldquo;attainable housing&rdquo; through &ldquo;executive-level
          homes.&rdquo; No specific price points have been reported, and we
          won&rsquo;t guess at any until a builder actually publishes them.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          A meaningful share of the plan is dedicated housing:{" "}
          <span className="text-lvinit-black">
            290 units of military housing
          </span>{" "}
          plus{" "}
          <span className="text-lvinit-black">
            300 units of workforce housing
          </span>
          , intended for personnel connected to Nellis Air Force Base and
          Creech Air Force Base — both bases our North Las Vegas guide already
          names as a real factor for military families weighing this side of
          the valley.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The plan also includes roughly{" "}
          <span className="text-lvinit-black">90 acres of parks and
          trails</span>, two future school sites, and commercial space. No
          specific builders, retailers, or school names have been announced.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          &ldquo;It&rsquo;s definitely the largest in a while,&rdquo; Chris
          Armstrong, an Olympia Companies executive vice president, told the
          Review-Journal. Garry Goett, Olympia&rsquo;s founder, and Larry
          Canarelli of Bruin Capital are the named principals behind the
          two development companies partnering on the project.
        </p>
      </StorySection>

      <StorySection muted heading="The timeline: there is nothing to buy here yet">
        <p className="text-body-lg text-lvinit-warmgray">
          Worth saying plainly, because coverage of a project this size can
          make it sound closer than it is: Monument Hills doesn&rsquo;t exist
          yet. This was a land sale, not a community opening. First homes
          aren&rsquo;t expected until{" "}
          <span className="text-lvinit-black">spring 2028</span> — roughly a
          year and a half out from this deal closing. There&rsquo;s no
          model home, no sales office, no reservation list to get on right
          now.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That makes this a &ldquo;watch this&rdquo; story for relocators and
          buyers thinking a year or two ahead, not a &ldquo;go buy here&rdquo;
          story for anyone moving soon. If your timeline is measured in
          months, Monument Hills isn&rsquo;t a real option yet. If it&rsquo;s
          measured in years, it&rsquo;s worth keeping on the radar.
        </p>
      </StorySection>

      <StorySection heading="How this fits into the valley's growth story">
        <p className="text-body-lg text-lvinit-warmgray">
          This isn&rsquo;t the valley&rsquo;s only active growth corridor.{" "}
          <Link
            href="/neighborhoods/southwest-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Southwest Las Vegas
          </Link>{" "}
          has been the valley&rsquo;s other big building edge on the opposite
          side of town — mostly unincorporated Clark County rather than a
          single city, a different pattern from Monument Hills&rsquo;
          City-of-Las-Vegas land. Together they say the same thing two
          different ways: the valley&rsquo;s newest housing keeps forming on
          the outer edges, under different governments, and &ldquo;which
          jurisdiction actually runs this?&rdquo; is a real question worth
          asking before you fall in love with a location on a map.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It also lands the same week{" "}
          <Link
            href="/guides/las-vegas-new-home-sales-july-2026"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            our coverage of July 2026 new-home sales
          </Link>{" "}
          showed builder permits still running well below a year earlier
          valley-wide. A single 6,000-home project won&rsquo;t reverse that
          trend on its own, and it won&rsquo;t add supply for a while — but
          it is a concrete data point that at least one part of the valley&rsquo;s
          new-construction pipeline is being planned at real scale for the
          back half of this decade.
        </p>
      </StorySection>

      <StorySection heading="The approval history, briefly">
        <p className="text-body-lg text-lvinit-warmgray">
          This deal didn&rsquo;t happen overnight. The Las Vegas City Council
          approved the purchase agreement in August 2025; the land sale
          reported in September 2026 is the closing that actually completes
          that approval. It&rsquo;s a reminder that a project like this moves
          through public approvals well before dirt moves — worth watching
          for as Monument Hills works through the next round of permitting
          and site planning over the next year.
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
              Builder announcements. No builder has been named publicly yet
              for the residential phases — that&rsquo;s usually the next
              concrete milestone on a project like this.
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue"
            />
            <span>
              City of Las Vegas planning and zoning filings, since this is
              City of Las Vegas land and its process, not North Las Vegas
              or Clark County&rsquo;s.
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue"
            />
            <span>
              Actual pricing once it&rsquo;s published. &ldquo;Attainable
              through executive-level&rdquo; is a wide range, and nothing
              specific has been reported yet.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">
              Las Vegas Review-Journal
            </span>{" "}
            (reporter Eli Segall), &ldquo;Developers buy 940 acres for $94
            million for Las Vegas&rsquo; biggest new community in
            years,&rdquo; published September 2, 2026 — the primary source
            for the deal terms, the three-party BLM / City of Las Vegas /
            developer structure, the location, the 6,000-home scale, the
            spring 2028 timeline, the military and workforce housing
            counts, the parks/trails and school-site figures, and both
            attributed quotes.{" "}
            <a
              href="https://www.reviewjournal.com/business/housing/developers-buy-900-plus-acres-for-las-vegas-biggest-new-community-in-years-3873678/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              reviewjournal.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">8 News Now</span>,
            &ldquo;Northwest Las Vegas land sale sets stage for Monument
            Hills master-planned community.&rdquo; Independently reported,
            corroborating coverage.{" "}
            <a
              href="https://www.8newsnow.com/news/local-news/northwest-las-vegas-land-sale-sets-stage-for-monument-hills-master-planned-community/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              8newsnow.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">News 3 LV</span>,
            &ldquo;Historic federal land sale completed for Monument Hills
            community in northwest Las Vegas.&rdquo; Independently reported,
            corroborating coverage.{" "}
            <a
              href="https://news3lv.com/news/local/historic-federal-land-sale-completed-for-monument-hills-community-in-northwest-las-vegas"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              news3lv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KTNV</span>, &ldquo;Northwest
            Las Vegas preparing to create thousands of new homes.&rdquo;
            Independently reported, corroborating coverage.{" "}
            <a
              href="https://www.ktnv.com/neighborhoods/northwest-las-vegas/northwest-las-vegas-preparing-to-create-thousands-of-new-homes"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              ktnv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">NVBEX</span>, August 2025 —
            used only for the background approval-timeline detail (the Las
            Vegas City Council&rsquo;s August 2025 approval of the purchase
            agreement), which isn&rsquo;t reasserted anywhere else in the
            current reporting.{" "}
            <a
              href="https://nevbex.com/2025/08/16/monument-hills-master-plan-las-vegas/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              nevbex.com
            </a>
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Development plans can change between land purchase and completed
          homes. Figures above reflect the sources and dates cited and
          should not be treated as a guarantee of the final project. This
          article is general local reporting, not financial, lending, or
          investment advice.
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
