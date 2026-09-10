import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryPullQuote,
  StoryGallery,
  StoryVideo,
} from "@/components/story";

// ---------------------------------------------------------------------------
// BUYER GUIDE — New build vs. resale in Las Vegas.
//
// The companion piece to Mikey's video of the same name
// (youtube.com/watch?v=2w-zkNv5Ta4). It is NOT a transcript: the video is a
// five-minute framing of the decision, and this page is the long version that
// adds the Las Vegas-specific ownership mechanics the video does not have room
// for (the tax-cap designation, SID/LID, inspector certification, the
// constructional-defect notice process) plus the already-verified local price
// data LVINIT has published elsewhere.
//
// FACT DISCIPLINE (read before editing):
// - VIDEO METADATA, verified 2026-09-10 by reading YouTube's own player data
//   for 2w-zkNv5Ta4: title "New Build vs Resale in Las Vegas: Which Should You
//   Buy?" (matches og:title, itemprop=name and oEmbed), lengthSeconds 309
//   (= 5:09 = PT5M9S), uploadDate 2026-09-09T18:15:01-07:00. Keep the
//   VideoObject here, the videos[] entry in lib/content.ts, and YouTube itself
//   in step if any of these change.
// - NAHB/WELLS FARGO HOUSING MARKET INDEX, AUGUST 2026 (released 2026-08-17,
//   verified this run against NAHB's Eye on Housing write-up
//   eyeonhousing.org/2026/08/affordability-pressures-keep-builder-confidence-low/):
//   "The use of sales incentives was 63% in August, unchanged from the previous
//   month." "35% of builders cut prices in August, down from 37% in July."
//   "The average price reduction was 6% in August, the same rate as the
//   previous month." HMI 35. This is a NATIONAL builder survey and is labeled
//   as national in the copy. It is NOT a Las Vegas figure and must never be
//   restated as one. The September 2026 HMI was confirmed not yet released as
//   of this publication date.
//   -> DATED IN THE COPY on purpose so a fact-decay pass can find it.
// - FREDDIE MAC PMMS, WEEK OF 2026-09-10 (fetched from freddiemac.com/pmms
//   this run): 30-year fixed average 6.76%, 15-year 6.09%. Note this is a
//   DIFFERENT week from /guides/las-vegas-mortgage-rates-september-2026, which
//   is dated to the week of September 3, 2026 (6.71%). Both are correct for
//   their own week; do not "reconcile" them. The rate appears exactly once
//   here, explicitly dated, and no payment math is built on top of it.
// - LOCAL NEW vs RESALE PRICE GAP: not re-derived here. Cited from LVINIT's
//   own already-sourced pieces — $581,930 median new-construction
//   single-family closing price (Home Builders Research via the Las Vegas
//   Review-Journal, July 2026) on /guides/las-vegas-new-home-sales-july-2026,
//   against the $480,000 median existing single-family resale price (Las Vegas
//   REALTORS, July 2026) on /guides/las-vegas-home-prices-july-2026. The ~21%
//   gap is that page's computation, presented here the same way it is there: a
//   snapshot of one month across two different products, never a like-for-like
//   claim. July 2026 is used rather than the newer August LVR figure precisely
//   so both sides of the comparison come from the same month.
// - NEVADA PROPERTY TAX ABATEMENT: no new claim is made. The
//   designation-not-reassessment mechanic is carried from the already
//   fact-checked /guides/nevada-property-tax-abatement-resale-buyers, which
//   holds the full source list. Linked, not restated in detail.
// - SID / LID: Clark County's own framing only — special assessments are
//   billed separately from real property taxes and are a lien on the parcel
//   until paid off. NO dollar amount is asserted, because none is knowable
//   without a parcel. Same discipline as
//   /guides/summerlin-vs-henderson-vs-southwest-las-vegas.
// - NRS 645D.160 (verified this run at leg.state.nv.us/nrs/nrs-645d.html):
//   "Any person who, in this state, engages in the business of, acts in the
//   capacity of, or advertises or assumes to act as an inspector without first
//   obtaining a certificate pursuant to this chapter is guilty of a
//   misdemeanor." Certificates are issued by the Real Estate Division of the
//   Department of Business and Industry.
// - NRS 40.600-40.695 (verified this run at leg.state.nv.us/nrs/nrs-040.html):
//   Nevada requires a written notice of constructional defect to the
//   contractor before a claimant commences or adds such a claim (NRS 40.645),
//   with a statutory response process (NRS 40.6472). Deliberately described in
//   general terms with NO day counts — secondary sources disagree on the
//   windows and the chapter has been amended more than once. Flagged as not
//   legal advice.
//
// CLAIMS DELIBERATELY NOT MADE:
// - That builders always, or even usually, beat resale financing. Incentives
//   vary by builder, community, phase and week, and are never described here
//   as guaranteed, permanent or universal.
// - That resale is cheaper, or that new construction appreciates better. There
//   is no verified Las Vegas data for either and neither is asserted.
// - Any named builder, named community incentive, or current promotion.
// - Any specific builder-warranty term structure (no "1-2-10"). Warranty terms
//   vary by builder; the copy says to read the actual document.
// - Any HOA, master assessment, SID or LID dollar figure.
//
// FAIR HOUSING: no school-quality claims, no crime or safety claims, no
// demographic characterization, no "good for families" steering. Fit is
// expressed only through housing stock, ownership cost, and stage of build-out.
//
// IMAGERY — six real, Mikey-owned frames from C:\LVINIT\Images, every one of
// them previously UNUSED on LVINIT so this piece has its own visual identity
// (checked against every /images reference in app/, components/ and lib/ on
// 2026-09-10). The video poster is Mikey's own YouTube title card for this
// video, used only as the click-to-play poster and never as article
// photography.
// ---------------------------------------------------------------------------

const HERO_IMAGE =
  "/images/hero/summerlin-established-neighborhood-red-rock-aerial-drone.webp";
const HERO_ALT =
  "Aerial drone view over an established Las Vegas neighborhood of tile-roofed homes with grown-in trees and a green golf corridor, the 215 Beltway running across the foreground and the Red Rock escarpment and La Madre range on the horizon.";

const meta: StoryMeta = {
  title: "New Build vs Resale in Las Vegas: Which Should You Buy? | LVINIT",
  headline: "New Build vs Resale in Las Vegas: Which Should You Buy?",
  description:
    "Two Las Vegas homes can carry the same price and still be very different deals. What a builder's price does and doesn't include, how incentives change the monthly number, what a resale already paid for, and how to compare the two honestly.",
  path: "/guides/new-build-vs-resale-las-vegas",
  image: HERO_IMAGE,
  imageWidth: 1897,
  imageHeight: 1062,
  imageAlt: HERO_ALT,
  datePublished: "2026-09-10",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    {
      name: "New Build vs Resale in Las Vegas",
      path: "/guides/new-build-vs-resale-las-vegas",
    },
  ],
  video: {
    name: "New Build vs Resale in Las Vegas: Which Should You Buy?",
    description:
      "Mikey Del Rosario breaks down what Las Vegas buyers should actually compare between new construction and resale: what the price includes, builder financing incentives, finished backyards and landscaping, established neighborhoods versus communities still being built, and why an inspection matters either way.",
    thumbnailUrl: "/images/video-new-build-vs-resale-las-vegas.webp",
    uploadDate: "2026-09-09T18:15:01-07:00",
    duration: "PT5M9S",
    embedUrl: "https://www.youtube.com/embed/2w-zkNv5Ta4",
    contentUrl: "https://www.youtube.com/watch?v=2w-zkNv5Ta4",
  },
};

export const metadata: Metadata = buildStoryMetadata(meta);

const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

// FAQ JSON-LD — four questions this article genuinely answers. Every answer
// below is also rendered visibly on the page, in the same words, and rests
// only on the verified facts documented in the header comment.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is new construction more expensive than resale in Las Vegas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In July 2026, the latest month with both data sets published, the median closing price for a new-construction single-family home in Southern Nevada was $581,930 (Home Builders Research, reported by the Las Vegas Review-Journal), against a $480,000 median for an existing single-family resale (Las Vegas REALTORS) in the same month. That is a gap of about 21%. It is not a like-for-like comparison, though: new and existing homes differ in size, age, location and condition, and a builder's price can move with incentives that a median never captures. Treat it as the shape of the market, not as the price difference between two specific homes.",
      },
    },
    {
      "@type": "Question",
      name: "Do Las Vegas builders offer better mortgage rates than resale sellers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sometimes, and usually with conditions. Builder financing incentives are typically tied to using the builder's preferred lender, and they are offered community by community and phase by phase rather than as a standing policy. Nationally, the August 2026 NAHB/Wells Fargo Housing Market Index found 63% of builders using sales incentives, unchanged from July. None of that makes a builder rate automatically better than what you could get on a resale home. Compare the full cost of the loan rather than the headline rate, ask whether a buydown is temporary or permanent and what the payment becomes when it ends, and get at least one competing quote. Resale sellers can offer concessions that do similar work.",
      },
    },
    {
      "@type": "Question",
      name: "Should you get a home inspection on a brand-new Las Vegas home?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, and the municipal inspections a builder passes are not a substitute. Those confirm the work met code at set stages of construction; they are not an independent review done on your behalf. Nevada certifies home inspectors through the Real Estate Division of the Department of Business and Industry, and NRS 645D.160 makes acting as an inspector without that certificate a misdemeanor, so you are hiring a regulated professional either way. On a new build, an inspection catches grading and drainage, roof and stucco details, missing or misplaced insulation, and systems that were installed but never balanced. On a resale, it tells you what the next ten years of maintenance actually look like.",
      },
    },
    {
      "@type": "Question",
      name: "What should you compare besides the purchase price?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Compare the finished cost and the full monthly cost. Finished cost means the price plus everything the home still needs before it is livable the way you want it: backyard, landscaping, window coverings, flooring, appliances and storage on a new build, or repairs, replacements and updates on a resale. Monthly cost means the payment plus HOA dues, any master or community assessment, any special assessment such as a SID or LID attached to the parcel, insurance, utilities and the property tax the parcel will actually carry under your ownership. In Nevada, the owner-occupied tax cap is tied to the owner's claim rather than passed along automatically with the house, so the seller's tax figure is not necessarily yours.",
      },
    },
  ],
};

/** What a builder's advertised price often does not carry. */
const FINISHED_COST_ITEMS = [
  {
    item: "The lot",
    note: "Advertised base pricing is usually written against a base homesite. A corner, a view, a bigger yard, or backing to open space instead of another house typically carries a premium on top.",
  },
  {
    item: "Structural options",
    note: "A fourth bedroom, a casita, an extended garage bay, a covered patio, a second-floor loft. These get chosen before the slab goes down and cannot be added later without real money.",
  },
  {
    item: "Design center selections",
    note: "Flooring, counters, cabinets, fixtures, and the electrical you will wish you had run. Base finishes are real finishes, but most buyers do not stop at base.",
  },
  {
    item: "Window coverings",
    note: "Almost never included, and a whole house of them is not a small number in a valley where west-facing glass matters.",
  },
  {
    item: "The backyard",
    note: "Frequently delivered as graded dirt or rock behind the fence. Landscaping, irrigation, hardscape, a patio cover and a pool are all post-closing costs, and they are usually the largest ones.",
  },
  {
    item: "The everyday things",
    note: "Refrigerator, washer and dryer, ceiling fans, garage storage, epoxy, screens, a water softener. Individually small, collectively not.",
  },
];

/** The stack the page argues you should compare, instead of list price alone. */
const COMPARISON_STACK = [
  {
    line: "Finished cost, not list price",
    note: "Price plus everything the home still needs to be livable the way you want it. On a new build that is usually the yard, the coverings and the appliances. On a resale it is whatever the last owner deferred.",
  },
  {
    line: "The full monthly number",
    note: "Payment, HOA dues, any master or community assessment, any special assessment attached to the parcel, insurance, utilities, and the property tax the parcel will actually carry once you own it.",
  },
  {
    line: "Timeline",
    note: "A resale can close in weeks. A build can take months, and the rate you can lock and the payment you end up with may not be the ones you started with.",
  },
  {
    line: "Location, judged on a normal day",
    note: "Drive the route at the hour you would actually drive it, both directions. This is the easiest thing on the list to check and the one buyers skip most.",
  },
  {
    line: "Neighborhood maturity",
    note: "Established means you can see what you are getting. Still building means you are partly buying a plan. Neither is wrong, but only one of them is verifiable today.",
  },
  {
    line: "What you would change either way",
    note: "Price out the resale's updates and the new build's finishing costs on the same sheet. Then the two numbers finally mean the same thing.",
  },
  {
    line: "How long you actually plan to stay",
    note: "Short horizons make finishing costs hurt more, because you pay them up front and only get part of them back. Long horizons make deferred maintenance hurt more.",
  },
];

const FAQS = [
  {
    q: "Is new construction more expensive than resale in Las Vegas?",
    a: (
      <>
        In July 2026, the latest month with both data sets published, the median
        closing price for a new-construction single-family home in Southern
        Nevada was $581,930 (Home Builders Research, reported by the Las Vegas
        Review-Journal), against a $480,000 median for an existing single-family
        resale (Las Vegas REALTORS) in the same month. That is a gap of about
        21%. It is not a like-for-like comparison, though: new and existing
        homes differ in size, age, location and condition, and a builder&rsquo;s
        price can move with incentives that a median never captures. Treat it as
        the shape of the market, not as the price difference between two
        specific homes. The full numbers are in the{" "}
        <Link
          href="/guides/las-vegas-new-home-sales-july-2026"
          className={linkCls}
        >
          new-home sales report
        </Link>
        .
      </>
    ),
  },
  {
    q: "Do Las Vegas builders offer better mortgage rates than resale sellers?",
    a: (
      <>
        Sometimes, and usually with conditions. Builder financing incentives are
        typically tied to using the builder&rsquo;s preferred lender, and they
        are offered community by community and phase by phase rather than as a
        standing policy. Nationally, the August 2026 NAHB/Wells Fargo Housing
        Market Index found 63% of builders using sales incentives, unchanged
        from July. None of that makes a builder rate automatically better than
        what you could get on a resale home. Compare the full cost of the loan
        rather than the headline rate, ask whether a buydown is temporary or
        permanent and what the payment becomes when it ends, and get at least
        one competing quote. Resale sellers can offer concessions that do
        similar work.
      </>
    ),
  },
  {
    q: "Should you get a home inspection on a brand-new Las Vegas home?",
    a: (
      <>
        Yes, and the municipal inspections a builder passes are not a
        substitute. Those confirm the work met code at set stages of
        construction; they are not an independent review done on your behalf.
        Nevada certifies home inspectors through the Real Estate Division of the
        Department of Business and Industry, and NRS 645D.160 makes acting as an
        inspector without that certificate a misdemeanor, so you are hiring a
        regulated professional either way. On a new build, an inspection catches
        grading and drainage, roof and stucco details, missing or misplaced
        insulation, and systems that were installed but never balanced. On a
        resale, it tells you what the next ten years of maintenance actually
        look like.
      </>
    ),
  },
  {
    q: "What should you compare besides the purchase price?",
    a: (
      <>
        Compare the finished cost and the full monthly cost. Finished cost means
        the price plus everything the home still needs before it is livable the
        way you want it: backyard, landscaping, window coverings, flooring,
        appliances and storage on a new build, or repairs, replacements and
        updates on a resale. Monthly cost means the payment plus HOA dues, any
        master or community assessment, any special assessment such as a SID or
        LID attached to the parcel, insurance, utilities and the property tax
        the parcel will actually carry under your ownership. In Nevada, the
        owner-occupied tax cap is tied to the owner&rsquo;s claim rather than
        passed along automatically with the house, so{" "}
        <Link
          href="/guides/nevada-property-tax-abatement-resale-buyers"
          className={linkCls}
        >
          the seller&rsquo;s tax figure is not necessarily yours
        </Link>
        .
      </>
    ),
  },
];

export default function NewBuildVsResaleLasVegasPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Buyer Guide",
        headline: "New Build vs Resale in Las Vegas",
        subheadline:
          "Two homes can carry the same price here and still be completely different decisions. Here is what actually separates them.",
        image: HERO_IMAGE,
        imageAlt: HERO_ALT,
        backLink: { label: "Guides", href: "/guides" },
        ctas: [{ label: "Watch the video", href: "#watch", variant: "primary" }],
      }}
      relatedStories={{
        heading: "Read these next",
        intro:
          "The local numbers behind this comparison, the ownership costs that decide it, and the guides worth reading before you pick a side.",
        stories: [
          {
            name: "Las Vegas New-Home Sales in July 2026",
            href: "/guides/las-vegas-new-home-sales-july-2026",
            category: "Market Watch",
            dek: "The builder side of the market, with the new-construction median and how far it sat above resale that month.",
          },
          {
            name: "Why the Seller's Nevada Property Tax Bill May Not Be Yours",
            href: "/guides/nevada-property-tax-abatement-resale-buyers",
            category: "Buyer Guide",
            dek: "The most misread number on a Las Vegas listing, and what actually happens to it when the deed records.",
          },
          {
            name: "Las Vegas Mortgage Rates",
            href: "/guides/las-vegas-mortgage-rates-september-2026",
            category: "Market Watch",
            dek: "Where financing costs sit right now, and what a move in the rate does to a Las Vegas payment.",
          },
          {
            name: "What $500K Buys in Las Vegas",
            href: "/guides/what-500k-buys-in-las-vegas",
            category: "Buyer Guide",
            dek: "Three real homes near one budget. The most concrete look at what these tradeoffs cost in practice.",
          },
          {
            name: "Summerlin vs Henderson vs Southwest Las Vegas",
            href: "/guides/summerlin-vs-henderson-vs-southwest-las-vegas",
            category: "Comparisons",
            dek: "Once you know which product you want, this is the piece about where to want it.",
          },
          {
            name: "Surviving Your First Las Vegas Summer",
            href: "/guides/first-summer-in-vegas",
            category: "Moving Here",
            dek: "Why shade, orientation and a finished backyard are worth more here than they sound on paper.",
          },
        ],
      }}
      ctas={{
        heading: "Still torn between the two?",
        body:
          "If you are weighing a specific new-build community against a specific resale street, that comparison is worth doing on paper before you fall for either one. Reach out and we can price both the same way, or start with the guides above.",
        footnote: (
          <>
            Not sure which part of the valley yet? Start with{" "}
            <Link
              href="/guides/summerlin-vs-henderson-vs-southwest-las-vegas"
              className="text-lvinit-blue underline underline-offset-4"
            >
              Summerlin vs Henderson vs Southwest
            </Link>
            , then come back to this question.
          </>
        ),
      }}
    >
      <StoryLede
        kicker="Buyer Guide"
        lead="Two houses, same price, same bedroom count. One is brand new, with a builder flag snapping out front and a design center appointment on the calendar. The other is fifteen years old on a street where the trees have finally filled in, and the last owner already put in the pool. On a search results page they look like the same purchase. They are not, and the difference usually does not surface until you are already under contract."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          I am not going to tell you which one to buy. Anyone who answers that
          without seeing your budget, your timeline and your commute is
          guessing. What I can do is show you where the two actually diverge,
          because in Las Vegas the gap between them is wider than it looks and
          almost none of it lives in the list price. If you are still choosing an
          area first, do that in the{" "}
          <Link
            href="/guides/summerlin-vs-henderson-vs-southwest-las-vegas"
            className={linkCls}
          >
            area comparison
          </Link>{" "}
          and come back here after.
        </p>
      </StoryLede>

      <StoryVideo
        id="watch"
        heading="The short version, on camera"
        intro="Five minutes on the same question, including the parts that are easier to show than to write."
        youtubeId="2w-zkNv5Ta4"
        title="New Build vs Resale in Las Vegas: Which Should You Buy?"
        poster="/images/video-new-build-vs-resale-las-vegas.webp"
      />

      {/* ---------------------------------------------------------------- */}
      {/* 1. THE PRICE                                                      */}
      {/* ---------------------------------------------------------------- */}

      <StorySection
        id="finished-price"
        heading="The list price and the finished price are two different numbers"
      >
        <p className="text-body-lg text-lvinit-warmgray">
          This is the whole article in one idea, so I will spend a minute on it.
          A resale listing is a price for a house that already exists, in the
          condition you walked through. A builder&rsquo;s advertised price is a
          starting point for a house that does not exist yet, on a homesite that
          may not be the one you want, with finishes you have not chosen.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Neither of those is dishonest. They are just different kinds of number,
          and comparing them side by side is the most common mistake I see. Here
          is what typically sits between a builder&rsquo;s advertised price and
          the number you actually spend.
        </p>
      </StorySection>

      <Container className="pb-8">
        <div className="mx-auto max-w-[900px]">
          <ul className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
            {FINISHED_COST_ITEMS.map((row) => (
              <li
                key={row.item}
                className="border-t border-lvinit-lightgray pt-4"
              >
                <h3 className="font-display text-subhead font-bold text-lvinit-black">
                  {row.item}
                </h3>
                <p className="mt-2 text-body text-lvinit-warmgray">{row.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <StorySection>
        <p className="text-body-lg text-lvinit-warmgray">
          None of that is a knock on builders. Options and premiums are how the
          model works, and plenty of buyers happily pay for them because they get
          exactly the house they wanted. The point is only that the number on the
          sign and the number on your closing statement are rarely the same
          number, and the gap between them is where the real comparison happens.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          For scale on the local market: in July 2026, the last month with both
          data sets out, the median closing price for a new-construction
          single-family home in Southern Nevada was $581,930, against a $480,000
          median for an existing single-family resale in the same month. That is
          roughly a 21% gap. It is a snapshot of two different products, not the
          price difference between two specific homes, and I unpack it properly
          in the{" "}
          <Link
            href="/guides/las-vegas-new-home-sales-july-2026"
            className={linkCls}
          >
            new-home sales piece
          </Link>{" "}
          and the{" "}
          <Link
            href="/guides/las-vegas-home-prices-july-2026"
            className={linkCls}
          >
            resale market piece
          </Link>
          .
        </p>
      </StorySection>

      <StoryGallery
        columns={2}
        images={[
          {
            src: "/images/features/las-vegas-new-construction-model-home-builder-flag.webp",
            alt: "A two-story new-construction model home in southwest Las Vegas with a builder flag on a pole out front, a low metal rail along the sidewalk, young shrubs in fresh rock landscaping, and neighboring new homes on either side.",
            label: "New construction",
            caption:
              "A model home is a sales tool. Most of what you like about one is an option, an upgrade, or a cost that lands after closing.",
          },
          {
            src: "/images/features/the-lakes-las-vegas-established-neighborhood-aerial-drone.webp",
            alt: "Aerial drone view at dusk over The Lakes in Las Vegas, an established waterfront neighborhood of tile-roofed homes with mature trees, private docks and small boats along the water, with the valley and the Strip skyline in the distance.",
            label: "Established resale",
            caption:
              "Decades of landscaping, hardscape and shade, all of it already paid for by somebody else.",
          },
        ]}
      />

      {/* ---------------------------------------------------------------- */}
      {/* 2. WHAT RESALE ALREADY INCLUDES                                   */}
      {/* ---------------------------------------------------------------- */}

      <StorySection
        id="resale-includes"
        heading="What a resale home may already have paid for"
      >
        <p className="text-body-lg text-lvinit-warmgray">
          The strongest argument for resale is not that it is cheaper. Sometimes
          it is not. The argument is that a lived-in home has usually already
          absorbed the costs that hit a new-build buyer in the first eighteen
          months, and absorbed them at somebody else&rsquo;s expense.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">The backyard is the big one.</span>{" "}
          A finished yard here is not a weekend project. It is grading,
          irrigation on a timer, hardscape, a patio cover that actually casts
          shade, and often a pool. On a resale that work is done, grown in, and
          baked into a price the market has already tested. On a new build it is
          a line item you carry after closing, when your savings are at their
          thinnest.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">Then the quiet ones.</span> Window
          coverings on every window. Flooring the previous owner upgraded out of
          builder base. Garage storage and shelving. Ceiling fans. A water
          softener. Screens. Landscape lighting. None of these are exciting and
          all of them cost money, and on a resale they usually convey.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            And shade, which is a real asset here.
          </span>{" "}
          A tree that throws shade on a west wall took ten or fifteen years to
          get that way. You cannot buy that at a design center, and in a valley
          where{" "}
          <Link href="/guides/first-summer-in-vegas" className={linkCls}>
            summer decides how you live
          </Link>
          , it is worth more than it sounds.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The honest caveat: none of this is automatic. Plenty of resale homes
          have a dirt yard, base carpet and no coverings, and plenty have a pool
          that is about to need a new pump.{" "}
          <span className="text-lvinit-black">Resale is not a feature list.</span>{" "}
          It is an opportunity to buy work that is already done, and you still
          have to check what condition that work is in.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* 3. WHAT NEW CONSTRUCTION GIVES YOU                                */}
      {/* ---------------------------------------------------------------- */}

      <StorySection
        id="new-construction"
        heading="What new construction actually gives you"
      >
        <p className="text-body-lg text-lvinit-warmgray">
          The case for a new build is just as real, and it is mostly about the
          things you do not think about until they fail.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">Everything is new at once.</span>{" "}
          Roof, air conditioning, water heater, plumbing, electrical, appliances.
          In a climate that runs air conditioning half the year, starting the
          clock at zero on every one of those is worth something specific: for
          the first stretch of ownership your maintenance line is close to
          nothing, and you know roughly when each item comes due, because they
          all started together.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            The floorplan reflects how people live now.
          </span>{" "}
          Bigger primary suites, more usable open space, flex rooms that can be
          an office, better-placed laundry, more storage designed in rather than
          added later. Walk a 2005 floorplan and a current one back to back and
          the difference is not subtle.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            You get to choose instead of inherit.
          </span>{" "}
          Finishes, layout options, where the outlets go. If you have ever bought
          a house and immediately spent money undoing someone else&rsquo;s taste,
          that has a value you already understand.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">And there is a warranty.</span>{" "}
          Most builders provide a limited warranty on a new home, but the terms
          are not standardized and they are not all the same. What is covered,
          for how long, what counts as a defect, and what the process is all vary
          by builder, so read the actual document rather than assuming. Nevada
          also has a statutory notice-and-response process governing
          constructional defect claims on a residence, at NRS 40.600 through
          40.695. That is a genuine protection, and it is also a legal process
          rather than a customer service line. This is a guide, not legal advice.
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/inspirada-henderson-new-build-townhomes-street.webp",
            alt: "Street-level view of newly built three-story townhomes in Inspirada, Henderson, with flat-roofed modern massing, rooftop pergolas, ground-floor garages and young desert landscaping along the curb.",
            caption:
              "Newer product in Inspirada. Contemporary massing, rooftop decks, and floorplans that did not exist in this valley twenty years ago.",
          },
        ]}
      />

      {/* ---------------------------------------------------------------- */}
      {/* 4. INCENTIVES                                                     */}
      {/* ---------------------------------------------------------------- */}

      <StorySection
        id="incentives"
        heading="Builder incentives can move the monthly number more than the price does"
      >
        <p className="text-body-lg text-lvinit-warmgray">
          This is the part that makes a straight price comparison fall apart, and
          it is the part buyers get wrong in both directions.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Builders have levers a private seller mostly does not. They can credit
          closing costs, credit design center dollars, or buy down your interest
          rate, and any of those can change a monthly payment more than a
          five-figure price cut would. Nationally, the August 2026 NAHB/Wells
          Fargo Housing Market Index found 63% of builders using sales
          incentives, unchanged from the month before, with 35% cutting prices at
          an average reduction of 6%. That is a national builder survey rather
          than a Las Vegas figure, but it tells you the environment: incentives
          have been a standing part of how new homes get sold, not a rare event.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Here is the discipline, though. A builder incentive is almost always
          conditional, and it is almost always temporary.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            It usually requires the preferred lender.
          </span>{" "}
          That is not a scam, it is the mechanism. But it does mean the incentive
          and the loan pricing are a package, so the only fair comparison is the
          whole package against a competing quote on the same house. Get the
          second quote anyway. A good preferred lender will survive it.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Ask whether a buydown is temporary or permanent.
          </span>{" "}
          A permanent buydown lowers the rate for the life of the loan. A
          temporary one lowers it for the first year or few, then steps back up
          to the note rate. Both are legitimate, and they are completely
          different commitments. The question is not what the payment is now. It
          is what the payment becomes when the buydown ends, and whether you can
          carry that number.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">And it can be gone next month.</span>{" "}
          Incentives get set per builder, per community, sometimes per phase or
          per standing-inventory home, and they move with the market. Nothing on
          this page should be read as a promise that a particular incentive
          exists right now where you are shopping. Ask, in writing, for the
          specific home you are considering.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The other half of this: resale sellers have a version of the same tool.
          A seller concession can pay closing costs or fund a rate buydown too,
          and in a market carrying inventory it is negotiable. For context on
          what you would be buying the rate down from, Freddie Mac put the
          30-year fixed average at 6.76% for the week of September 10, 2026, and
          I track what moves in the{" "}
          <Link
            href="/guides/las-vegas-mortgage-rates-september-2026"
            className={linkCls}
          >
            mortgage rate guide
          </Link>
          . If you are early in the process, the{" "}
          <Link
            href="/guides/las-vegas-down-payment-assistance-programs-2026"
            className={linkCls}
          >
            down payment assistance guide
          </Link>{" "}
          covers programs that can apply on either side of this comparison.
        </p>
      </StorySection>

      <StoryPullQuote>
        The right question is not which one is cheaper. It is which one is
        cheaper once it is finished, furnished, and actually livable the way you
        want to live in it.
      </StoryPullQuote>

      {/* ---------------------------------------------------------------- */}
      {/* 5. ESTABLISHED VS DEVELOPING                                      */}
      {/* ---------------------------------------------------------------- */}

      <StorySection
        id="neighborhoods"
        heading="Established neighborhoods versus communities still being built"
      >
        <p className="text-body-lg text-lvinit-warmgray">
          This one usually gets framed as a strike against new construction, and
          it should not be. It is a genuine tradeoff, and which side you want
          depends on what you value.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            An established neighborhood is verifiable.
          </span>{" "}
          You can drive it on a Tuesday morning and again on a Saturday night.
          The grocery store is open. The park is built, and you can see whether
          anyone uses it. The HOA has a track record you can read. The
          landscaping is what it is going to be. There is very little left to
          imagine, which is exactly the point.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            A developing community is partly a plan.
          </span>{" "}
          Some of what is on the site map is under construction, some is
          entitled, and some is an intention. Retail, parks, trails, schools and
          road connections generally arrive after the rooftops that justify them,
          which means the first residents live through the build-out:
          construction traffic, dust, model-home traffic on your street, a
          grocery run longer than it will eventually be. In exchange you are
          early, in a place designed as one thing rather than assembled over
          decades.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The practical move is to separate what is built from what is promised.
          Ask which phase you would be in, what is actually under construction
          right now versus planned, and what the timeline is for the things that
          made you like the community in the first place. Then decide whether you
          want to live through that or skip it. Both answers are reasonable. For
          how differently this plays out across the valley, the guides to{" "}
          <Link href="/neighborhoods/summerlin" className={linkCls}>
            Summerlin
          </Link>
          ,{" "}
          <Link href="/neighborhoods/henderson" className={linkCls}>
            Henderson
          </Link>{" "}
          and{" "}
          <Link href="/neighborhoods/southwest-las-vegas" className={linkCls}>
            Southwest Las Vegas
          </Link>{" "}
          each cover what is still being built in them.
        </p>
      </StorySection>

      <StoryGallery
        columns={2}
        images={[
          {
            src: "/images/features/summerlin-west-new-homes-graded-lots-aerial-drone.webp",
            alt: "Aerial drone view of a new Summerlin West neighborhood: finished tile-roofed homes along a completed street on the left, a wide new arterial road on the right, and graded dirt pads and untouched desert running toward the mountains beyond.",
            label: "Still being built",
            caption:
              "Finished homes on one side, graded pads and a brand-new road on the other. Everything past the curb is still a plan.",
          },
          {
            src: "/images/features/rhodes-ranch-mature-master-planned-community-drone.webp",
            alt: "Aerial drone view of the Rhodes Ranch entry sign in southwest Las Vegas, backed by tall mature palms, a green golf corridor with water features, and homes among grown-in landscaping with mountains on the horizon.",
            label: "Already grown in",
            caption:
              "Rhodes Ranch, decades on. The palms, the greens and the streetscape are finished products, not renderings.",
          },
        ]}
      />

      {/* ---------------------------------------------------------------- */}
      {/* 6. INSPECTIONS                                                    */}
      {/* ---------------------------------------------------------------- */}

      <StorySection
        id="inspections"
        heading="New does not mean perfect. Old does not mean problem."
      >
        <p className="text-body-lg text-lvinit-warmgray">
          I would get an inspection on either one, and I say that to every buyer
          who asks. The reasons are just different.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            On a new build, the municipal inspections are not your inspection.
          </span>{" "}
          Those confirm the work met code at set stages. They are not an
          independent review done on your behalf, they are not looking out for
          your interests specifically, and a house can pass every one of them and
          still hand you a punch list. Houses get built fast, by people, in the
          heat. An independent inspector looks at grading and drainage away from
          the foundation, roof and stucco details, insulation that is missing or
          in the wrong place, and systems that were installed but never balanced.
          If your builder allows a pre-drywall walk, take it. That is the only
          time anyone sees the framing, the rough plumbing and the wiring again.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            On a resale, the inspection is a budget, not a verdict.
          </span>{" "}
          A twenty-year-old house is not a bad house. It is a house with a known
          maintenance schedule, and the inspection tells you where on that
          schedule you are standing: how much roof is left, how old the air
          conditioning is, what the water heater is about to do, whether the pool
          equipment is original. None of that has to kill a deal. It just has to
          be priced, either into the offer or into your first two years.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Either way, hire someone certified. Nevada certifies home inspectors
          through the Real Estate Division of the Department of Business and
          Industry, and NRS 645D.160 makes acting as an inspector in this state
          without that certificate a misdemeanor. Ask for the certificate number.
          It is a normal question, and any good inspector answers it without
          blinking.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* 7. OWNERSHIP COSTS                                                */}
      {/* ---------------------------------------------------------------- */}

      <StorySection
        id="ownership-costs"
        muted
        heading="The ownership costs that show up on neither listing"
      >
        <p className="text-body-lg text-lvinit-warmgray">
          Two homes at the same price can carry very different monthly numbers in
          this county, and the reasons are usually invisible until escrow.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">Property taxes.</span> Nevada caps
          annual increases for an owner-occupied primary residence, but that cap
          is tied to the owner claiming it rather than riding along with the
          house. Recording a new deed removes the previous owner&rsquo;s
          owner-occupied designation, which means the tax figure printed on a
          resale listing is the seller&rsquo;s number and not necessarily yours.
          This catches people on both new construction and resale, and it is
          worth understanding before you build a budget around a listing figure.
          The full mechanics, with sources, are in{" "}
          <Link
            href="/guides/nevada-property-tax-abatement-resale-buyers"
            className={linkCls}
          >
            the property tax guide
          </Link>
          .
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Special assessments, the SID and LID kind.
          </span>{" "}
          These fund infrastructure, and they are frequently attached to newer
          construction, because someone had to pay for the roads and utilities
          that made the subdivision possible. Clark County is clear that special
          assessments are different from real property taxes and are billed
          separately, and that an assessment is a lien on the property until it
          is paid off. There is no typical amount, because it is parcel specific.
          Ask for the actual balance on the actual property.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            HOA dues, and sometimes a second layer.
          </span>{" "}
          In a large master-planned community you can be paying a master
          assessment and a neighborhood sub-association on top of it. That is
          normal here and it is not a criticism, but it does mean
          &ldquo;the HOA is sixty dollars&rdquo; is rarely the whole answer. Get
          every line.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">And the cost to finish.</span> Put
          the new build&rsquo;s backyard, coverings and appliances on the same
          sheet as the resale&rsquo;s roof, air conditioning and updates. That is
          the only version of this comparison where the two numbers mean the same
          thing.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* 8. HOW TO COMPARE                                                 */}
      {/* ---------------------------------------------------------------- */}

      <StorySection
        id="how-to-compare"
        heading="How to actually compare the two"
      >
        <p className="text-body-lg text-lvinit-warmgray">
          If you take one thing from this page, take this list. Run both homes
          through all seven lines before you fall in love with either.
        </p>
      </StorySection>

      <Container className="pb-12">
        <div className="mx-auto max-w-[900px]">
          <ol className="grid grid-cols-1 gap-7">
            {COMPARISON_STACK.map((row, i) => (
              <li
                key={row.line}
                className="flex gap-5 border-t border-lvinit-lightgray pt-5"
              >
                <span
                  aria-hidden="true"
                  className="mt-1 shrink-0 font-display text-subhead font-bold tabular-nums text-lvinit-blue"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-subhead font-bold text-lvinit-black">
                    {row.line}
                  </h3>
                  <p className="mt-2 text-body text-lvinit-warmgray">
                    {row.note}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>

      {/* ---------------------------------------------------------------- */}
      {/* 9. BOTTOM LINE                                                    */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="bottom-line" heading="The bottom line">
        <p className="text-body-lg text-lvinit-warmgray">
          There is no winner here, and I would be suspicious of anyone who hands
          you one. New construction sells you time you do not have to spend on
          maintenance, a floorplan built for how people live now, and the chance
          to pick your own finishes. Resale sells you a finished product in a
          neighborhood you can verify today, with somebody else&rsquo;s money
          already sunk into the yard, the coverings and the trees.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          What actually decides it is narrower than the debate suggests. Which
          one costs less once it is finished the way you want it. Which one costs
          less every month once every line is on the page. And which one sits
          where your week actually happens. Answer those three honestly and the
          choice usually makes itself.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If it still does not, that is a sign the two homes are genuinely close,
          which is a good problem to have. Go drive both neighborhoods at the
          hour you would really be driving them, and buy the one you would rather
          come home to.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* FAQ                                                               */}
      {/* ---------------------------------------------------------------- */}

      <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-24">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto max-w-[680px]">
            <h2
              id="faq-heading"
              className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black"
            >
              Common questions
            </h2>
            <dl className="mt-10">
              {FAQS.map((item) => (
                <div
                  key={item.q}
                  className="border-t border-lvinit-lightgray py-7 first:border-lvinit-black"
                >
                  <dt>
                    <h3 className="font-display text-subhead font-bold text-lvinit-black">
                      {item.q}
                    </h3>
                  </dt>
                  <dd className="mt-3 text-body text-lvinit-warmgray">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* SOURCES                                                           */}
      {/* ---------------------------------------------------------------- */}

      <StorySection heading="Sources">
        <ul className="space-y-4 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">
              NAHB/Wells Fargo Housing Market Index, August 2026
            </span>
            . Source for the national builder incentive and price-cut figures
            (63% using sales incentives, 35% cutting prices, average reduction
            6%), released August 17, 2026, at{" "}
            <a
              href="https://eyeonhousing.org/2026/08/affordability-pressures-keep-builder-confidence-low/"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              eyeonhousing.org
            </a>
            . National survey data, not Las Vegas specific.
          </li>
          <li>
            <span className="text-lvinit-black">Freddie Mac</span>. Primary
            Mortgage Market Survey, week of September 10, 2026, source for the
            6.76% 30-year fixed average, at{" "}
            <a
              href="https://www.freddiemac.com/pmms"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              freddiemac.com/pmms
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">
              Home Builders Research and Las Vegas REALTORS
            </span>
            , July 2026, for the $581,930 new-construction and $480,000 resale
            single-family medians. Both are cited from LVINIT&rsquo;s own
            already-sourced coverage,{" "}
            <Link
              href="/guides/las-vegas-new-home-sales-july-2026"
              className={linkCls}
            >
              new-home sales
            </Link>{" "}
            and{" "}
            <Link
              href="/guides/las-vegas-home-prices-july-2026"
              className={linkCls}
            >
              resale prices
            </Link>
            , where the primary reporting is linked in full.
          </li>
          <li>
            <span className="text-lvinit-black">Nevada Revised Statutes</span>.
            NRS 645D.160, requiring certification to act as an inspector of
            structures in Nevada, at{" "}
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
            <span className="text-lvinit-black">Nevada Revised Statutes</span>.
            NRS 40.600 through 40.695, the constructional defect notice and
            response provisions for a residence, at{" "}
            <a
              href="https://www.leg.state.nv.us/nrs/nrs-040.html"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              leg.state.nv.us
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Clark County</span>. Property tax
            and special assessment mechanics, including the owner-occupied
            designation and the separate billing of special assessments, are
            carried from LVINIT&rsquo;s{" "}
            <Link
              href="/guides/nevada-property-tax-abatement-resale-buyers"
              className={linkCls}
            >
              Nevada property tax guide
            </Link>
            , which holds the full Assessor and Treasurer source list.
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Builder incentives, loan pricing, warranty terms, assessments and
          community build-out schedules change constantly and vary by builder,
          community and parcel. Nothing here is a representation that a
          particular incentive, rate or program is available to you. This article
          is general information, not tax, legal, or financial advice. Verify
          anything property specific with the builder, the lender, the HOA, and
          the Clark County Assessor and Treasurer before you rely on it.
        </p>
      </StorySection>

      <StorySection heading="About this coverage">
        <p className="text-body text-lvinit-warmgray">
          Mikey Del Rosario &middot; Las Vegas Real Estate Advisor &middot; The
          Scofield Group &middot; Nevada License S.0175577. Equal Housing
          Opportunity.
        </p>
      </StorySection>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </StoryPage>
  );
}
