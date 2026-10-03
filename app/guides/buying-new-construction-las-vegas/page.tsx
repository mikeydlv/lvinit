import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryVideo,
} from "@/components/story";

// ---------------------------------------------------------------------------
// BUYER GUIDE (Cluster D pillar) — Buying new construction in Las Vegas.
//
// SCOPE: HOW buying new construction works. It is deliberately NOT the "should
// I buy new?" piece — that decision lives at
// /guides/new-build-vs-resale-las-vegas and this page hands off to it.
//
// FACT DISCIPLINE (read before editing):
// - NAHB/WELLS FARGO HOUSING MARKET INDEX, SEPTEMBER 2026 (verified
//   2026-10-03 on nahb.org/news-and-economics/housing-economics/indices/
//   housing-market-index): index 32, "fell three points" from August; "66% of
//   builders reported using sales incentives in September, up from 63% in
//   August"; "38% of builders cut prices in September, up from 35% in
//   August"; average price cut 6%. NATIONAL builder survey, labeled national in
//   the copy, never restated as a Las Vegas figure. NOT used, because the
//   nahb.org page did not state them when fetched and the Eye on Housing post
//   could not be located: which incentive types were most popular, and whether
//   32 was the lowest reading of 2026. Re-verify before adding either.
// - SID: Clark County Treasurer, understanding-sids page, fetched 2026-10-03:
//   a special assessment is "a charge levied against properties within the
//   boundaries of an area known as a Special Improvement District (SID)";
//   "Special assessments are different than real property taxes, and are
//   billed separately"; typically billed and collected semi-annually. The page
//   does not say whether an SID appears on the tax bill, so neither does this
//   one. LID is described only as the same kind of separate lien, per
//   /guides/new-build-vs-resale-las-vegas. NO dollar amounts anywhere.
// - NRS 40.600-40.695 constructional defect process and NRS 645D.160 inspector
//   certification: carried from /guides/new-build-vs-resale-las-vegas, which
//   verified both against leg.state.nv.us. General terms, NO day counts. Not
//   legal advice.
// - Property-tax abatement: linked to
//   /guides/nevada-property-tax-abatement-resale-buyers, not restated.
// - LOCAL NUMBERS: $581,930 new-construction median vs $480,000 resale median
//   (July 2026) are cited only via their own LVINIT pages, not re-derived.
// - SANDSTONE: only what /guides/sandstone-tule-springs-north-las-vegas already
//   documents (Landings from the high $300,000s, Reserves build-to-order from
//   the mid $400,000s, Meadows and Gardens "coming soon", homesite premiums can
//   apply, Landings has no HOA per Mikey's walk of the community, an active
//   construction site). MONUMENT HILLS: land deal and plan only; first homes
//   not expected until spring 2028.
// - Process descriptions (agent registration, design center, phases, walk-
//   throughs) are general industry practice written with "typically" / "ask"
//   language. Builder policies differ; no builder policy is asserted.
//
// CLAIMS DELIBERATELY NOT MADE: named builder promotions or prices (other than
// the Sandstone figures above), warranty term structures, any HOA/SID/LID/lot
// premium dollar figure, that incentives beat resale financing, which areas
// are "best", or any firsthand Mikey observation beyond the Sandstone video.
// Fair Housing: no schools, safety, or demographic statements.
//
// IMAGERY — Mikey's own photo of the Landings at Sandstone model row (he
// confirmed he shot it; see the Sandstone page's IMAGERY note). Reused here
// from the repo, no new file. C:\LVINIT\Images was not reachable in this run.
// The Sandstone video is embedded the same way that page does, as a secondary
// embed; the Sandstone page remains its VideoObject owner.
// ---------------------------------------------------------------------------

const HERO_IMAGE =
  "/images/hero/landings-at-sandstone-model-homes-strip-view-hero.webp";
const HERO_ALT =
  "Three two-story model homes at Landings at Sandstone in North Las Vegas, with graded lots, the Las Vegas Strip, and mountains on the horizon";

const PATH = "/guides/buying-new-construction-las-vegas";

const meta: StoryMeta = {
  title: "Buying New Construction in Las Vegas: How It Works | LVINIT",
  headline: "Buying New Construction in Las Vegas: How It Works",
  description:
    "How buying a new-construction home in Las Vegas actually works: the sales office, bringing your own agent, incentives versus price cuts, lot premiums, the design center, phases, HOA and SID/LID, inspections, and where to research a community.",
  path: PATH,
  image: HERO_IMAGE,
  imageWidth: 1908,
  imageHeight: 791,
  imageAlt: HERO_ALT,
  datePublished: "2026-10-03",
  dateModified: "2026-10-03",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Buying New Construction in Las Vegas", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

const STEPS = [
  {
    step: "Research the community before you visit",
    note: "Read what the builder has published, then check the city or county for what is planned around it. Phases still under construction, nearby parcels and the pace of build-out matter more here than they do on a resale street.",
  },
  {
    step: "Walk in with representation",
    note: "The sales office represents the builder. Many builders ask that a buyer's agent be introduced on the first visit, so ask the builder's policy before you go rather than after you have already walked in alone.",
  },
  {
    step: "Choose the homesite and plan",
    note: "Plan, elevation and lot are separate decisions, and lot can change the price. Ask what is still available, not just what the sign says.",
  },
  {
    step: "Get the real price in writing",
    note: "Base price, lot premium, structural options, design selections, and any incentive with its conditions, all on one sheet.",
  },
  {
    step: "Contract, design center and construction",
    note: "Selections are typically made on the builder's schedule, and many choices cannot be changed once construction reaches a given stage. Ask for those cutoffs up front.",
  },
  {
    step: "Inspection and walkthrough",
    note: "Hire your own certified inspector and attend the builder's walkthrough with a written list. More on this below.",
  },
  {
    step: "Closing and the first year",
    note: "Know how warranty requests are submitted before you need one, and keep everything in writing.",
  },
];

export default function BuyingNewConstructionLasVegasPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Buyer Guide",
        headline: "Buying New Construction in Las Vegas",
        subheadline:
          "How the process actually works, from the first model-home visit to the walkthrough, and where buyers lose money by not knowing it.",
        image: HERO_IMAGE,
        imageAlt: HERO_ALT,
        backLink: { label: "Guides", href: "/guides" },
        ctas: [
          { label: "See the steps", href: "#process", variant: "primary" },
        ],
      }}
      relatedStories={{
        heading: "Read these next",
        intro:
          "The decision behind this process, the local numbers, and the communities worth studying as real examples.",
        stories: [
          {
            name: "New Build vs Resale in Las Vegas: Which Should You Buy?",
            href: "/guides/new-build-vs-resale-las-vegas",
            category: "Buyer Guide",
            dek: "Whether to buy new at all. This page assumes you already lean that way.",
          },
          {
            name: "Is Las Vegas a Buyer's Market Right Now?",
            href: "/guides/is-las-vegas-a-buyers-market",
            category: "Buyer Guide",
            dek: "What buyers can negotiate right now, and how builder incentives fit in.",
          },
          {
            name: "Las Vegas New-Home Sales Jumped in July 2026",
            href: "/guides/las-vegas-new-home-sales-july-2026",
            category: "Market Watch",
            dek: "The builder-side numbers, including the new-construction median.",
          },
          {
            name: "Sandstone at Tule Springs",
            href: "/guides/sandstone-tule-springs-north-las-vegas",
            category: "Local Feature",
            dek: "A real, open-for-sale community to apply this checklist to.",
          },
          {
            name: "Monument Hills",
            href: "/guides/monument-hills-northwest-las-vegas",
            category: "Local Feature",
            dek: "The far end of the timeline: a plan, not a place to buy yet.",
          },
          {
            name: "You Don't Need 20% Down To Buy a Home in Las Vegas",
            href: "/guides/las-vegas-down-payment-assistance-programs-2026",
            category: "Buyer Guide",
            dek: "Down payment options worth knowing before you sit down with any lender.",
          },
        ],
      }}
      ctas={{
        heading: "Walking into a model home soon?",
        body:
          "Tell me which community you are looking at and I will help you go in with the right questions and the right representation before you sign anything.",
        footnote: (
          <>
            Not sure of the area yet? Start with{" "}
            <Link
              href="/guides/moving-to-las-vegas"
              className="text-lvinit-blue underline underline-offset-4"
            >
              Moving to Las Vegas
            </Link>
            .
          </>
        ),
      }}
    >
      <StoryLede
        kicker="Buyer Guide"
        lead="A model home is built to make you say yes. The sales office is run by the builder, the contract is the builder's contract, and the price on the sign is the start of the conversation. None of that is sinister. It just means new construction runs on different rules than a resale, and the buyers who do well are the ones who learn them before the first visit."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          This guide is about how the process works. Whether new construction is
          right for you at all is a different question, and I cover it in{" "}
          <Link href="/guides/new-build-vs-resale-las-vegas" className={linkCls}>
            New Build vs Resale
          </Link>
          .
        </p>
      </StoryLede>

      <StorySection id="process" heading="The process, start to finish">
        <p className="text-body-lg text-lvinit-warmgray">
          Every builder runs this a little differently, so treat it as a map of
          the usual order, not a rulebook.
        </p>
      </StorySection>

      <Container className="pb-8">
        <div className="mx-auto max-w-[900px]">
          <ol className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
            {STEPS.map((row, i) => (
              <li
                key={row.step}
                className="border-t border-lvinit-lightgray pt-4"
              >
                <p className="text-caption font-bold uppercase tracking-wide text-lvinit-blue">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 font-display text-subhead font-bold text-lvinit-black">
                  {row.step}
                </h3>
                <p className="mt-2 text-body text-lvinit-warmgray">{row.note}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>

      <StorySection id="representation" heading="Bring your own agent to the model home">
        <p className="text-body-lg text-lvinit-warmgray">
          The person at the sales office is a skilled professional who works for
          the builder. That is their job, and it is a fair one, but it means no
          one in the room is looking out for your side unless you bring someone.
          Because many builders ask that a buyer&rsquo;s agent be registered on
          the first visit, the order matters: ask the builder&rsquo;s policy,
          then go. If you walk in alone and sign in first, you may find you have
          already answered the question of who represents you.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Ask any agent how they are paid on a new-construction purchase and
          what you would be agreeing to. That is a normal question, and the
          answer should be clear before you start touring.
        </p>
      </StorySection>

      <StorySection muted id="incentives" heading="Incentives are not price cuts, and the lender string is part of the deal">
        <p className="text-body-lg text-lvinit-warmgray">
          A price cut lowers what you pay. An incentive changes the terms around
          what you pay: a rate buydown, closing-cost help, design-center credit.
          They are not interchangeable, and they do not always have the same
          value to you.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          For the national backdrop, the NAHB/Wells Fargo Housing Market Index
          for September 2026 (released mid-September) found 66% of builders using
          sales incentives, up from 63% in August, and 38% cutting prices, up
          from 35%, at an average cut of 6%. The index itself fell three points
          to 32. That is a national builder survey, not a Las Vegas number, but
          it describes the environment: incentives and price cuts are both part
          of how new homes are being sold right now.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Incentives usually come with strings, most often the builder&rsquo;s
          preferred lender. Ask what the incentive is worth in dollars, whether
          a buydown is temporary or permanent and what the payment becomes when
          it ends, and what happens to the incentive if you use your own lender.
          Then get one competing quote. I walk through the same logic, with the
          rate environment, in{" "}
          <Link href="/guides/is-las-vegas-a-buyers-market" className={linkCls}>
            Is Las Vegas a Buyer&rsquo;s Market?
          </Link>
          .
        </p>
      </StorySection>

      <StorySection id="price-stack" heading="Lot premiums, upgrades and the design center">
        <p className="text-body-lg text-lvinit-warmgray">
          The advertised price is usually written against a base homesite and
          base finishes. The final number is built from layers:
        </p>
        <ul className="mt-5 space-y-3 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Lot premium.</span> A corner, a
            view or a bigger yard can cost more than a standard lot. Ask the
            premium for the specific lot you want.
          </li>
          <li>
            <span className="text-lvinit-black">Structural options.</span> Extra
            bedrooms, a larger garage, covered patios. These are typically chosen
            early and are costly or impossible to add later.
          </li>
          <li>
            <span className="text-lvinit-black">Design center selections.</span>{" "}
            Flooring, counters, cabinets, fixtures. Ask what is included at base
            and the deadline for each choice.
          </li>
          <li>
            <span className="text-lvinit-black">Everything after closing.</span>{" "}
            Backyard, window coverings and appliances are often yours to supply.
            The full list is in{" "}
            <Link href="/guides/new-build-vs-resale-las-vegas" className={linkCls}>
              the new build vs resale guide
            </Link>
            .
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          A fair habit: keep a single sheet with every line, and never let a
          conversation move forward on a monthly payment alone. Ask for the
          out-the-door number in writing.
        </p>
      </StorySection>

      <StorySection muted id="phases" heading="Phases, and living next to a construction site">
        <p className="text-body-lg text-lvinit-warmgray">
          Large communities open in phases. Some of what you see on the plan map
          is not built, not priced and not scheduled. If you buy in an early
          phase, you may be living next to construction for a while. Ask which
          phases are open, which are announced and which are just lines on a map.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Two LVINIT pages show the range. At{" "}
          <Link
            href="/guides/sandstone-tule-springs-north-las-vegas"
            className={linkCls}
          >
            Sandstone at Tule Springs
          </Link>{" "}
          in North Las Vegas, KB Home has opened two sub-communities for sale
          (Landings from the high $300,000s, Reserves build-to-order from the
          mid $400,000s) while two more are described as coming soon, and
          homesite premiums can apply on top of base price. At{" "}
          <Link
            href="/guides/monument-hills-northwest-las-vegas"
            className={linkCls}
          >
            Monument Hills
          </Link>
          , the land deal has closed and first homes are not expected until
          spring 2028. One you can tour. The other you can only watch.
        </p>
      </StorySection>

      <StoryVideo
        youtubeId="aBdmoKLjoeY"
        title="Brand-New Homes Under $400K in Tule Springs? | Landings at Sandstone"
        eyebrow="Watch the walkthrough"
        heading="A real new-construction community, on camera"
        intro="My tour of Landings at Sandstone, covering the homes, lots, upgrades and the growth around the community."
        poster="/images/lvinit-tule-springs-new-homes-under-400k-thumbnail.png"
      />

      <StorySection id="ongoing-costs" heading="HOA, SID and LID: check before you fall for the plan">
        <p className="text-body-lg text-lvinit-warmgray">
          Ownership costs in a new community are set by the parcel, not the
          builder&rsquo;s brochure. Ask whether an HOA applies and what it
          covers. Ask whether the parcel sits in a Special Improvement District.
          Per Clark County&rsquo;s Treasurer, a special assessment is a charge
          levied against properties within an SID, and special assessments are
          different from real property taxes and are billed separately. Ask for
          the actual figures for the actual lot, because none of them can be
          known without the parcel. Landings at Sandstone, for example, has no
          HOA; that is not true of every community, and I would not assume it
          anywhere else.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Property tax is its own question on a home with no tax history. The
          owner-occupied cap works through a claim, not automatically, and I
          explain it in{" "}
          <Link
            href="/guides/nevada-property-tax-abatement-resale-buyers"
            className={linkCls}
          >
            the Nevada property tax guide
          </Link>
          .
        </p>
      </StorySection>

      <StorySection muted id="inspection" heading="Inspection, walkthrough and defects">
        <p className="text-body-lg text-lvinit-warmgray">
          Passing city inspections means the work met code at set stages. It is
          not an independent review on your behalf. Many buyers hire their own
          inspector during construction and again before closing. Nevada
          requires inspectors to be certified (NRS 645D.160), so ask to see the
          certificate. Then attend the builder&rsquo;s walkthrough with a
          written list and get every item recorded.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If a defect shows up after closing, Nevada has a statutory notice and
          response process for constructional defect claims on a residence
          (NRS 40.600 through 40.695). It is a legal process, not a help desk,
          and the timing details are the kind you should confirm with an
          attorney. Read the builder&rsquo;s warranty document before you sign,
          because terms vary by builder. This is a guide, not legal advice.
        </p>
      </StorySection>

      <StorySection id="where" heading="Where to research which areas are building">
        <p className="text-body-lg text-lvinit-warmgray">
          New construction is not spread evenly across the valley. Start with the
          area guides, then check the builder and the city or county for what is
          open and what is planned.
        </p>
        <ul className="mt-5 space-y-3 text-body-lg text-lvinit-warmgray">
          <li>
            <Link href="/neighborhoods/north-las-vegas" className={linkCls}>
              North Las Vegas
            </Link>
            : our guide names Tule Springs and Sandstone as where new
            construction is happening on the city&rsquo;s northern edge.
          </li>
          <li>
            <Link href="/neighborhoods/southwest-las-vegas" className={linkCls}>
              Southwest Las Vegas
            </Link>{" "}
            and{" "}
            <Link href="/neighborhoods/henderson" className={linkCls}>
              Henderson
            </Link>
            : both have a lot of new construction, structured differently, and
            the guides explain how.
          </li>
          <li>
            <Link href="/neighborhoods/summerlin" className={linkCls}>
              Summerlin
            </Link>
            : the master plan, where builders build neighborhoods on the parcels.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          For scale, in July 2026 the median closing price for a new-construction
          single-family home in Southern Nevada was $581,930, per the figures in
          our{" "}
          <Link
            href="/guides/las-vegas-new-home-sales-july-2026"
            className={linkCls}
          >
            July new-home sales report
          </Link>
          . If the down payment is the hurdle, read the{" "}
          <Link
            href="/guides/las-vegas-down-payment-assistance-programs-2026"
            className={linkCls}
          >
            down payment guide
          </Link>
          , and if you are still deciding whether to move at all, start with{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-4 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">
              NAHB/Wells Fargo Housing Market Index, September 2026
            </span>
            . Source for the national index (32) and the incentive (66%) and
            price-cut (38%, average 6%) figures, at{" "}
            <a
              href="https://www.nahb.org/news-and-economics/housing-economics/indices/housing-market-index"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              nahb.org
            </a>
            . National survey data, not Las Vegas specific.
          </li>
          <li>
            <span className="text-lvinit-black">Clark County Treasurer</span>.
            Understanding SIDs, for the description of special assessments and
            their separate billing, at{" "}
            <a
              href="https://www.clarkcountynv.gov/government/elected_officials/county_treasurer/understanding-sids"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              clarkcountynv.gov
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Nevada Revised Statutes</span>.
            NRS 645D.160 (inspector certification) and NRS 40.600 through 40.695
            (constructional defects), at{" "}
            <a
              href="https://www.leg.state.nv.us/nrs/nrs-645d.html"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              leg.state.nv.us
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">LVINIT coverage</span>. Sandstone
            and Monument Hills details, and the July 2026 $581,930 median, are
            cited from our own already-sourced pages linked above.
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Builder policies, incentives, pricing, warranties, assessments and
          phases change often and vary by builder and parcel. Nothing here is a
          representation that a particular incentive is available to you. This is
          general information, not legal, tax or financial advice. Confirm
          anything property specific with the builder, your lender and the
          relevant county office.
        </p>
      </StorySection>

      <StorySection heading="About this coverage">
        <p className="text-body text-lvinit-warmgray">
          LVINIT Editorial &middot; The Scofield Group &middot; Nevada License
          S.0175577. Equal Housing Opportunity.
        </p>
      </StorySection>
    </StoryPage>
  );
}
