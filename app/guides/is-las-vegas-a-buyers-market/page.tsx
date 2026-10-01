import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryPullQuote,
  StoryVideo,
} from "@/components/story";

// ---------------------------------------------------------------------------
// BUYER GUIDE — "Is Las Vegas a buyer's market right now?"
//
// The evergreen, canonical LVINIT answer to the buyer-leverage question, and
// the companion piece to Mikey's video "The Las Vegas Housing Market Finally
// Shifted… But There's a Catch" (youtube.com/watch?v=aMeXy1frj-o). It is NOT a
// transcript: the video is the seven-minute version of the argument, this page
// carries the dated numbers, the payment math, and the routing into the deeper
// buyer guides.
//
// INTENT / CANNIBALIZATION (checked 2026-10-01 against every title in
// lib/content.ts and docs/LVINIT_CONTENT_CLUSTER_MAP.md):
// - This page owns the buyer-leverage / "buyer's market?" / "should I buy now
//   or wait for rates" intent. Nothing else on the site targets it.
// - It is NOT the future housing-market hub (/guides/las-vegas-housing-market,
//   D2) and NOT the future evergreen rates page (/guides/las-vegas-mortgage-rates,
//   D1). Those own "the market right now" and "the rate right now". Neither
//   exists yet; when they do, the "latest numbers" lines here should link to
//   them and stay brief rather than turn into a second market report.
// - will-las-vegas-home-prices-drop keeps "will prices fall" (R12). This page
//   links to it rather than re-answering it.
//
// UPDATING IN PLACE: the dated numbers live in SNAPSHOT, the "where things
// stand" section, the payment table and the Sources list. When LVR's September
// 2026 report lands (not released as of 2026-10-01), update those, bump
// `dateModified`, and leave the argument alone.
//
// FACT DISCIPLINE — every figure verified 2026-10-01 against raw page text
// (curl), not secondhand summaries:
// - LVR AUGUST 2026 (Nevada Business Magazine, Sept 8, 2026; Las Vegas Sun /
//   VEGAS INC, Sept 9, 2026; LVR's own resale-news copy on reviewjournal.com):
//   $475,000 single-family median (-1.0% YoY; record $490,000 May-June 2026);
//   7,590 single-family homes listed without offers (+5.3% YoY); "a housing
//   supply of just over four and a half months, up slightly from one year ago"
//   (LVR does not say single-family only, so the copy doesn't either); 74.8%
//   of homes sold within 60 days vs 77.5% a year earlier. lasvegasrealtor.com
//   itself returned HTTP 429 this run.
// - NAR: "Generally, a 6-month supply is considered a balanced market."
//   (REALTOR Magazine, "Strength in Numbers," Nov 11, 2024.) The common
//   4-to-6-month "balanced" band could not be traced to an authoritative source
//   and is deliberately not used.
// - REDFIN, buyers vs sellers, Aug 2026 (published Sept 10, 2026): Las Vegas
//   metro 117% more sellers than buyers (up from 102% in July), a record gap
//   for the metro (Redfin data back to 2013). Redfin's definition: more than
//   10% more sellers than buyers = buyer's market.
// - REDFIN, concessions, 3 months ending Aug 2026 (published Sept 18, 2026):
//   Las Vegas metro 66.7% of sales had a seller concession, +6.0 points YoY;
//   U.S. 44.7%.
// - FREDDIE MAC PMMS, week of Oct 1, 2026: 30-year 7.28%, 15-year 6.60%
//   (prior week 7.03% / 6.42%; a year earlier 6.34% / 5.55%). Confirmed on
//   freddiemac.com/pmms, the GlobeNewswire release, and FRED MORTGAGE30US.
//   "Highest since Nov. 22, 2023" is the AP's framing (Michelle Chapman, Oct 1,
//   2026), checked against FRED. NATIONAL average, labeled as such.
// - NAR rate-drop research (REALTOR Magazine, Dec 11, 2025): "a 1% decrease in
//   rates could add about 5.5 million households, including 1.6 million
//   renters, to the pool of potential buyers." NATIONAL. NOTE: the video's own
//   on-screen graphic attributes the "1% drop, millions more households" point
//   to Zillow research; the verified source is NAR, so this page cites NAR.
//   No Zillow figure is used here: zillow.com could not be read directly this
//   run, and the Zillow rate-scenario figures that surfaced only in search
//   snippets were not verifiable.
// - NAHB/Wells Fargo HMI, Sept 2026 (nahb.org, Sept 16, 2026): 66% of
//   builders using sales incentives (highest since December), 38% cutting
//   prices, average cut 6%. NATIONAL.
// - LENNAR Q3 FY2026 (newsroom.lennar.com, Sept 16, 2026): average sales price
//   $372,000 "reflecting approximately 12.0% in incentives." Company-wide, not
//   Las Vegas.
// - HOME BUILDERS RESEARCH via the Las Vegas Review-Journal (Eli Segall, Sept
//   25, 2026): August 2026 Southern Nevada new-home net sales 502 (-31% YoY),
//   permits 448 (-31% YoY), median closing price among ALL newly built homes
//   an all-time high $552,990. Do not compare that all-new-homes median to the
//   $581,930 July figure used elsewhere on LVINIT; that one is single-family
//   only.
// - PAYMENT TABLE: standard 30-year amortization, principal and interest only,
//   computed independently on a $380,000 loan (20% down on the $475,000 LVR
//   August median). Explicitly hypothetical.
//
// CLAIMS DELIBERATELY NOT MADE: any forecast of rates, prices or competition;
// that 7% is "historically normal"; that falling rates WILL raise prices or
// demand (framed only as a scenario, supported by NAR's national research);
// that a buyer can refinance later; any Las Vegas builder incentive figure (the
// only Las Vegas-specific incentive numbers found trace to a brokerage blog).
// Mikey is not a lender; the financing disclaimer stays.
//
// VIDEO METADATA (read from YouTube's own player data, 2026-10-01): title "The
// Las Vegas Housing Market Finally Shifted… But There's a Catch", uploadDate
// 2026-09-30T18:45:35-07:00, lengthSeconds 461 (= 7:41 = PT7M41S). Embedded
// with the standard StoryVideo direct lazy embed (YouTube's own thumbnail, no
// duplicate local poster asset). VideoObject thumbnail points at YouTube's
// own maxresdefault image.
//
// IMAGERY — hero is a real, Mikey-owned drone frame from C:\LVINIT\Images
// (lvinit-west-summerlin.png, copied and optimized; original untouched),
// previously unused anywhere on LVINIT. It shows finished new homes, homes
// still being built and the established valley beyond in one frame, which is
// the new-vs-resale choice this piece keeps returning to.
// ---------------------------------------------------------------------------

const PATH = "/guides/is-las-vegas-a-buyers-market";
const YOUTUBE_ID = "aMeXy1frj-o";
const VIDEO_TITLE =
  "The Las Vegas Housing Market Finally Shifted… But There's a Catch";

const HERO_IMAGE =
  "/images/hero/west-summerlin-new-and-established-homes-aerial-drone.webp";
const HERO_ALT =
  "Aerial drone view over newer homes on the west side of Summerlin in Las Vegas: finished modern homes with rooftop solar in the foreground, homes still under construction behind them, and established neighborhoods running toward the Red Rock escarpment.";

const meta: StoryMeta = {
  title: "Is Las Vegas a Buyer's Market Right Now? | LVINIT",
  headline: "Is Las Vegas a Buyer's Market Right Now?",
  description:
    "Las Vegas buyers have more leverage than they've had in years, but rates are above 7%. What you can negotiate, how to weigh the payment, and when waiting makes sense.",
  path: PATH,
  image: HERO_IMAGE,
  imageWidth: 1887,
  imageHeight: 1056,
  imageAlt: HERO_ALT,
  datePublished: "2026-10-01",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Is Las Vegas a Buyer's Market?", path: PATH },
  ],
  video: {
    name: VIDEO_TITLE,
    description:
      "Mikey Del Rosario on why the Las Vegas housing market has shifted toward buyers, with more homes for sale, longer days on market and sellers more willing to negotiate, and the catch: mortgage rates around 7%. Covers why the monthly payment matters more than a single rate number, what lower rates could do to buyer competition, new construction incentives versus resale, and when waiting to buy does make sense.",
    thumbnailUrl: `https://i.ytimg.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`,
    uploadDate: "2026-09-30T18:45:35-07:00",
    duration: "PT7M41S",
    embedUrl: `https://www.youtube.com/embed/${YOUTUBE_ID}`,
    contentUrl: `https://www.youtube.com/watch?v=${YOUTUBE_ID}`,
  },
};

export const metadata: Metadata = buildStoryMetadata(meta);

const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "7,590",
    label: "Single-family homes listed without offers",
    note: "End of August 2026, +5.3% YoY · Las Vegas REALTORS",
  },
  {
    value: "4.5+ mo",
    label: "Housing supply",
    note: "August 2026, \u201cjust over four and a half months\u201d · Las Vegas REALTORS",
  },
  {
    value: "$475,000",
    label: "Median existing single-family price",
    note: "August 2026, -1.0% YoY · Las Vegas REALTORS",
  },
  {
    value: "7.28%",
    label: "30-year fixed, national average",
    note: "Week of Oct 1, 2026 · Freddie Mac PMMS (not a Las Vegas figure)",
  },
];

function SnapshotPanel() {
  return (
    <section
      id="by-the-numbers"
      aria-label="Las Vegas buyer's market snapshot"
      className="scroll-mt-24"
    >
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            Where things stand
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            The most recent verified Las Vegas figures, plus the national rate
            they&rsquo;re up against. Each number carries its own reporting
            period. Sources are listed at the end of this guide.
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
                <p className="mt-2 text-caption text-lvinit-warmgray">{s.note}</p>
              </div>
            ))}
          </dl>

          <p className="mt-6 max-w-[680px] text-caption text-lvinit-warmgray">
            Las Vegas REALTORS&rsquo; September 2026 report had not been
            released when this guide was published. This page is updated as
            new data lands.
          </p>
        </div>
      </Container>
    </section>
  );
}

/** Hypothetical payment table: $380,000 loan (20% down on $475,000). */
const PAYMENT_ROWS = [
  { rate: "7.28%", pi: "$2,600", note: "Freddie Mac national average, week of Oct 1, 2026" },
  { rate: "7.00%", pi: "$2,528", note: "Round number for comparison" },
  { rate: "6.50%", pi: "$2,402", note: "Hypothetical" },
  { rate: "6.00%", pi: "$2,278", note: "Hypothetical, not a forecast" },
];

const NEGOTIABLES = [
  {
    item: "Price",
    note: "Especially on a home that has sat. Days on market and price history are leverage, and in a market with more sellers than buyers they show up more often.",
  },
  {
    item: "Seller concessions",
    note: "Money toward your closing costs, or toward buying down your rate. In a payment-driven market, a concession can be worth more to you than the same amount off the price.",
  },
  {
    item: "Repairs and credits",
    note: "Inspection items are back on the table. Ask for the repair, or a credit in lieu of it.",
  },
  {
    item: "Timeline and terms",
    note: "Closing date, rent-back, what conveys with the house. Small terms are easier for a seller to give, and they add up.",
  },
  {
    item: "Builder incentives",
    note: "On new construction: rate buydowns, closing-cost credits, design center credits, or price. Usually tied to the builder's preferred lender, and set home by home.",
  },
];

const WAIT_REASONS = [
  {
    line: "Your income or job isn't settled yet",
    note: "A new job you haven't started, a probation period, a business that just changed. Lenders care about this, and so should you.",
  },
  {
    line: "You might move again within a few years",
    note: "Buying and selling costs real money on both ends. A short horizon gives a home very little time to earn those costs back.",
  },
  {
    line: "The purchase would wipe out your cushion",
    note: "Closing with nothing left for the first repair, the first summer power bill, or a slow month is a bad trade, whatever the market is doing.",
  },
  {
    line: "The payment only works at a rate you don't have",
    note: "If the plan depends on refinancing later, it's a plan built on a guess. Buy a payment you can carry at today's rate, or wait.",
  },
  {
    line: "You don't know the valley yet",
    note: "If you're relocating and still deciding between areas, renting first while you learn the commute and the neighborhoods can be the right call.",
  },
  {
    line: "Your credit or savings are about to improve",
    note: "If a few months would meaningfully change your loan terms or your down payment, that's a concrete reason to wait. Waiting on a rate prediction isn't.",
  },
];

const FAQS: { q: string; text: string; a: React.ReactNode }[] = [
  {
    q: "Is Las Vegas a buyer's market right now?",
    text: "It depends on the yardstick, and both say buyers have gained ground. By Redfin's measure, which compares active sellers to active buyers, the Las Vegas metro had 117% more sellers than buyers in August 2026, a record gap for the metro in data going back to 2013. By the traditional months-of-supply measure, Las Vegas REALTORS put supply at just over four and a half months in August 2026, up slightly from a year earlier but still short of the roughly six months the National Association of REALTORS describes as balanced. In practice, buyers have more choice, more time and more room to negotiate than they've had in years.",
    a: (
      <>
        It depends on the yardstick, and both say buyers have gained ground. By
        Redfin&rsquo;s measure, which compares active sellers to active buyers,
        the Las Vegas metro had 117% more sellers than buyers in August 2026, a
        record gap for the metro in data going back to 2013. By the traditional
        months-of-supply measure, Las Vegas REALTORS put supply at just over
        four and a half months in August 2026, up slightly from a year earlier
        but still short of the roughly six months the National Association of
        REALTORS describes as balanced. In practice, buyers have more choice,
        more time and more room to negotiate than they&rsquo;ve had in years.
      </>
    ),
  },
  {
    q: "Should I wait for mortgage rates to drop before buying in Las Vegas?",
    text: "Nobody can tell you when or whether rates will fall, and this guide doesn't try. What you can compare is the deal available today against a hypothetical one later. Today, Las Vegas buyers have unusual negotiating leverage, which can include seller concessions that buy down the rate. If rates did fall, the payment would improve, but more buyers could also return and that leverage could shrink. If the payment works for you at today's rate and you plan to stay, waiting for a rate guess may cost you more than it saves. If it only works at a lower rate, waiting is reasonable.",
    a: (
      <>
        Nobody can tell you when or whether rates will fall, and this guide
        doesn&rsquo;t try. What you can compare is the deal available today
        against a hypothetical one later. Today, Las Vegas buyers have unusual
        negotiating leverage, which can include seller concessions that buy
        down the rate. If rates did fall, the payment would improve, but more
        buyers could also return and that leverage could shrink. If the payment
        works for you at today&rsquo;s rate and you plan to stay, waiting for a
        rate guess may cost you more than it saves. If it only works at a lower
        rate, waiting is reasonable.
      </>
    ),
  },
  {
    q: "What can buyers negotiate in Las Vegas right now?",
    text: "Price, especially on homes that have been sitting; seller concessions toward closing costs or a rate buydown; repairs or credits after inspection; and terms like closing date. Concessions are common: Redfin found that 66.7% of Las Vegas-area home sales in the three months ending August 2026 included a seller concession, up 6 percentage points from a year earlier. On new construction, builders may offer rate buydowns, closing-cost credits or design credits, usually tied to their preferred lender and set home by home.",
    a: (
      <>
        Price, especially on homes that have been sitting; seller concessions
        toward closing costs or a rate buydown; repairs or credits after
        inspection; and terms like closing date. Concessions are common: Redfin
        found that 66.7% of Las Vegas-area home sales in the three months ending
        August 2026 included a seller concession, up 6 percentage points from a
        year earlier. On new construction, builders may offer rate buydowns,
        closing-cost credits or design credits, usually tied to their preferred
        lender and set home by home. The{" "}
        <Link href="/guides/new-build-vs-resale-las-vegas" className={linkCls}>
          new build vs resale guide
        </Link>{" "}
        covers how to compare the two.
      </>
    ),
  },
  {
    q: "Is a 7% mortgage rate normal?",
    text: "This guide doesn't label it. What's documented: Freddie Mac's national 30-year average was 7.28% for the week of October 1, 2026, up from 6.34% a year earlier, and the Associated Press reported it as the highest since November 2023. Your own rate depends on credit, down payment, loan type and lender, and a qualified loan officer is the right person to quote it.",
    a: (
      <>
        This guide doesn&rsquo;t label it. What&rsquo;s documented: Freddie
        Mac&rsquo;s national 30-year average was 7.28% for the week of October
        1, 2026, up from 6.34% a year earlier, and the Associated Press reported
        it as the highest since November 2023. Your own rate depends on credit,
        down payment, loan type and lender, and a qualified loan officer is the
        right person to quote it.
      </>
    ),
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.text },
  })),
};

export default function IsLasVegasABuyersMarketPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Buyer Guide",
        headline: "Is Las Vegas a Buyer's Market Right Now?",
        subheadline:
          "More homes are sitting, sellers are negotiating, and builders are leaning on incentives. The catch is a mortgage rate above 7%. Here's how to weigh the two honestly.",
        image: HERO_IMAGE,
        imageAlt: HERO_ALT,
        backLink: { label: "Guides", href: "/guides" },
        ctas: [
          { label: "Watch the video", href: "#watch", variant: "primary" },
          { label: "See the numbers", href: "#by-the-numbers", variant: "tertiary" },
        ],
      }}
      relatedStories={{
        heading: "Go deeper",
        intro:
          "Once you know the market is on your side, these are the decisions that come next: what kind of home, at what budget, with how much down.",
        stories: [
          {
            name: "New Build vs Resale in Las Vegas: Which Should You Buy?",
            href: "/guides/new-build-vs-resale-las-vegas",
            category: "Buyer Guide",
            dek: "How to compare a builder's incentives against a resale seller's concessions, line by line.",
          },
          {
            name: "What $500K Buys in Las Vegas",
            href: "/guides/what-500k-buys-in-las-vegas",
            category: "Buyer Guide",
            dek: "Three real home tours near the same budget. What the leverage is actually buying.",
          },
          {
            name: "You Don't Need 20% Down To Buy a Home in Las Vegas",
            href: "/guides/las-vegas-down-payment-assistance-programs-2026",
            category: "Buyer Guide",
            dek: "Real loan minimums and Nevada's assistance programs, the other lever on your payment.",
          },
          {
            name: "Summerlin vs Henderson vs Southwest Las Vegas",
            href: "/guides/summerlin-vs-henderson-vs-southwest-las-vegas",
            category: "Comparisons",
            dek: "Leverage only helps once you know where you want to use it.",
          },
        ],
      }}
      ctas={{
        heading: "Want to know what this market means for your number?",
        body:
          "Tell me your budget, your timeline and where you're looking. I'll show you what sellers and builders are actually offering on homes that fit, and whether buying now or waiting makes more sense for you. No sales pitch.",
      }}
    >
      <StoryLede
        kicker="Buyer Guide"
        lead="For most of the last few years, buying a home in Las Vegas meant competing: multiple offers, waived inspections, paying over asking. That isn't the market today. Buyers here now have more choice, more time and more room to negotiate than they've had in years. The catch is the mortgage rate, and it's the reason a lot of people who waited for exactly this market still aren't buying."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          So is it a buyer&rsquo;s market? By one widely used measure, clearly
          yes. By the traditional one, not quite. In practice, the leverage is
          real, and the question worth your time isn&rsquo;t the label. It&rsquo;s
          whether today&rsquo;s leverage at today&rsquo;s rate beats a lower
          rate in a market that might be more crowded. This guide walks through
          the numbers, what you can actually negotiate, and the situations where
          waiting genuinely makes sense.
        </p>
      </StoryLede>

      <StorySection id="short-answer" heading="The short answer depends on the yardstick">
        <p className="text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            By the seller-to-buyer measure, Las Vegas is one of the strongest
            buyer&rsquo;s markets in the country.
          </span>{" "}
          Redfin compares how many people are actively selling against how many
          are actively buying in each metro. In August 2026, the Las Vegas area
          had 117% more sellers than buyers, up from 102% in July and the widest
          gap Redfin has recorded for the metro in data going back to 2013.
          Redfin counts anything over 10% more sellers than buyers as a
          buyer&rsquo;s market.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            By the traditional months-of-supply measure, it isn&rsquo;t there
            yet.
          </span>{" "}
          Months of supply is how long the current inventory would last at the
          current pace of sales. Las Vegas REALTORS put it at just over four and
          a half months in August 2026, up slightly from a year earlier. The
          National Association of REALTORS describes about six months as a
          balanced market, so by that yardstick Las Vegas has moved toward
          balance, not past it.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Both are true at once, and the practical takeaway is the same: on a
          given home, today&rsquo;s buyer usually has room to ask for something.
          Whether that&rsquo;s enough to offset a 7% rate is the actual
          decision.
        </p>
      </StorySection>

      <StoryVideo
        id="watch"
        eyebrow="Watch"
        heading="The market finally shifted toward buyers. Here's the catch."
        intro="Seven minutes on what I'm seeing on the ground: why buyers have leverage again, why a 7% rate doesn't automatically mean you shouldn't buy, and when waiting actually does make sense."
        youtubeId={YOUTUBE_ID}
        title={`${VIDEO_TITLE} | Mikey Del Rosario, LVINIT`}
      />

      <SnapshotPanel />

      <StorySection id="why-buyer-friendly" heading="What makes this market more buyer-friendly">
        <p className="text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">More homes are sitting.</span> At
          the end of August 2026, Las Vegas REALTORS counted 7,590 single-family
          homes listed for sale without any offer, up 5.3% from a year earlier.
          Every one of those is a seller who hasn&rsquo;t found a buyer yet.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">Homes are taking longer to sell.</span>{" "}
          In August, 74.8% of existing homes sold within 60 days, down from
          77.5% a year earlier. That&rsquo;s a modest shift, but it&rsquo;s the
          kind that changes how a seller reacts to an offer below asking.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">Prices have eased, not collapsed.</span>{" "}
          The median existing single-family price was $475,000 in August, down
          1.0% from a year earlier and below the $490,000 record set in May and
          June. That&rsquo;s a second straight monthly decline, covered in
          detail in{" "}
          <Link href="/guides/las-vegas-home-prices-august-2026" className={linkCls}>
            the August 2026 market report
          </Link>
          . If you&rsquo;ve been waiting for a crash, this isn&rsquo;t one, and{" "}
          <Link href="/guides/will-las-vegas-home-prices-drop" className={linkCls}>
            why prices have held up
          </Link>{" "}
          is its own story.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">Sellers are paying to close deals.</span>{" "}
          Redfin found that 66.7% of Las Vegas-area sales in the three months
          ending August 2026 included a seller concession, up 6 percentage
          points from a year earlier and well above the 44.7% national share.
          That&rsquo;s the most direct sign of where the leverage sits.
        </p>
      </StorySection>

      <StorySection id="negotiate" heading="What buyers can realistically negotiate today">
        <p className="text-body-lg text-lvinit-warmgray">
          Leverage isn&rsquo;t a discount that applies to every house. A
          freshly listed, well-priced home in a popular pocket can still draw
          competition. But across the market, these are the things that are
          genuinely negotiable again:
        </p>
      </StorySection>

      <Container className="pb-8">
        <div className="mx-auto max-w-[900px]">
          <ul className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
            {NEGOTIABLES.map((row) => (
              <li key={row.item} className="border-t border-lvinit-lightgray pt-4">
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
          None of this is guaranteed on any specific home, and none of it is a
          figure I can promise you in advance. What changes the odds is
          knowing how long a home has been sitting, what similar homes actually
          closed for, and what the seller needs. That&rsquo;s the homework worth
          doing before you write an offer.
        </p>
      </StorySection>

      <StoryPullQuote>
        The leverage is real. The question isn&rsquo;t whether it&rsquo;s a
        buyer&rsquo;s market. It&rsquo;s whether today&rsquo;s deal at
        today&rsquo;s rate beats a lower rate in a more crowded market.
      </StoryPullQuote>

      <StorySection id="rates" heading="Where a 7% rate fits in">
        <p className="text-body-lg text-lvinit-warmgray">
          Freddie Mac&rsquo;s weekly survey put the national average 30-year
          fixed rate at{" "}
          <span className="text-lvinit-black">7.28% for the week of October 1, 2026</span>
          , up from 7.03% the week before and 6.34% a year earlier. The
          Associated Press reported it as the highest since November 2023. That
          is a national average, not a Las Vegas rate and not your rate. What a
          specific buyer is quoted depends on credit, down payment, loan type,
          points and lender. I&rsquo;m not a lender, and a qualified loan
          officer is the right person to price your loan.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The rate moves weekly, and I track it in the{" "}
          <Link href="/guides/las-vegas-mortgage-rates-19-month-high" className={linkCls}>
            mortgage rate coverage
          </Link>
          . For this decision, the weekly number matters less than what it does
          to the payment.
        </p>
      </StorySection>

      <StorySection id="payment" heading="Why the monthly payment matters more than the rate">
        <p className="text-body-lg text-lvinit-warmgray">
          Here&rsquo;s a{" "}
          <span className="text-lvinit-black">hypothetical example</span>, not a
          quote: a $475,000 home (the August 2026 Las Vegas single-family
          median) with 20% down, which leaves a $380,000 loan, at a few
          different 30-year fixed rates. Principal and interest only.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-body text-lvinit-warmgray">
            <thead>
              <tr className="border-b border-lvinit-lightgray text-left text-caption uppercase tracking-wide text-lvinit-warmgray">
                <th className="py-3 pr-4 font-normal">Rate (30-year fixed)</th>
                <th className="py-3 pr-4 font-normal">Principal &amp; interest, monthly</th>
                <th className="py-3 font-normal">Note</th>
              </tr>
            </thead>
            <tbody>
              {PAYMENT_ROWS.map((row, i) => (
                <tr
                  key={row.rate}
                  className={i < PAYMENT_ROWS.length - 1 ? "border-b border-lvinit-lightgray" : ""}
                >
                  <td className="py-3 pr-4 text-lvinit-black">{row.rate}</td>
                  <td className="py-3 pr-4 text-lvinit-black">{row.pi}</td>
                  <td className="py-3">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          On this example, the gap between 7.28% and 6% is about{" "}
          <span className="text-lvinit-black">$322 a month</span>. That&rsquo;s
          real money, and it&rsquo;s why waiting for a lower rate is tempting.
          For comparison, negotiating $15,000 off the price at today&rsquo;s
          rate saves about $82 a month. To get the same payment at 7.28% that
          this loan would have at 6%, you&rsquo;d need to borrow roughly $47,000
          less.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          So price alone rarely closes a rate gap. What can move the payment is
          the full package: price, a seller concession or builder incentive that
          buys down the rate, and the size of your down payment. That&rsquo;s
          why the payment you can carry, with every piece on the table, is a
          better decision tool than a single rate number. If the down payment is
          the constraint,{" "}
          <Link
            href="/guides/las-vegas-down-payment-assistance-programs-2026"
            className={linkCls}
          >
            the down payment guide
          </Link>{" "}
          covers real loan minimums and Nevada&rsquo;s assistance programs. And
          remember that taxes, insurance, HOA dues and summer power bills sit on
          top of every number in that table.
        </p>
      </StorySection>

      <StorySection id="if-rates-fall" muted heading="What could change if rates come down">
        <p className="text-body-lg text-lvinit-warmgray">
          This section is a scenario, not a forecast. I don&rsquo;t know where
          rates are going, and neither does anyone quoting you a date.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If rates did fall meaningfully, the obvious effect is a lower payment.
          The less obvious one is who else shows up. National Association of
          REALTORS research estimates that, nationally, a 1-percentage-point
          decrease in rates could add about 5.5 million households, including
          1.6 million renters, to the pool of potential buyers. Not all of them
          would buy, and that&rsquo;s a national estimate, not a Las Vegas one.
          But it describes the mechanism: lower rates don&rsquo;t just help you
          qualify, they help your competition qualify too.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Lower rates could also bring more sellers. Some owners have stayed put
          because they don&rsquo;t want to trade a low locked-in rate for a
          higher one, and a lower rate could change that math for some of them.
          More listings would add choice. How those two forces would net out in
          Las Vegas, and whether prices or competition would rise, is exactly
          what nobody can promise you in advance.
        </p>
      </StorySection>

      <StorySection id="lower-rates-not-better" heading="Why lower rates don't automatically mean a better time to buy">
        <p className="text-body-lg text-lvinit-warmgray">
          A lower rate improves one line of the deal. The leverage you have
          today improves several. If more buyers came back, the things that are
          negotiable now (price on a home that&rsquo;s been sitting, a seller
          concession, an inspection credit, an extra week to decide) could get
          harder to ask for. The rate would be better and the deal around it
          could be worse.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          You&rsquo;ll also hear that you can buy now and refinance later. Maybe.
          Refinancing depends on where rates actually go, whether you qualify at
          the time, and what it costs, and none of that is knowable today. Treat
          it as a possible bonus, never as the thing that makes the payment work.
        </p>
      </StorySection>

      <StorySection id="new-vs-resale" heading="New construction incentives vs resale opportunities">
        <p className="text-body-lg text-lvinit-warmgray">
          Builders are under the most pressure in this market, and it shows. In
          Southern Nevada, new-home net sales fell to 502 in August 2026, down
          31% from a year earlier, with permits down 31% too, according to Home
          Builders Research data reported by the Las Vegas Review-Journal. The
          median closing price across all newly built homes was still a record
          $552,990, which tells you builders are more likely to move on
          incentives than on the sticker.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Nationally, the September 2026 NAHB/Wells Fargo Housing Market Index
          found 66% of builders using sales incentives, the highest share since
          December, and 38% cutting prices. Lennar, one of the country&rsquo;s largest
          homebuilders, reported incentives of roughly 12% of its average sales
          price company-wide last quarter. Neither is a Las Vegas-specific
          number, and incentives vary by builder, community and even individual
          home. But the direction is clear: a builder&rsquo;s rate buydown can
          move a monthly payment more than a price cut, and it usually comes
          tied to their preferred lender.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Resale has its own opening. A seller with a home that&rsquo;s been
          sitting can offer a concession that does similar work, on a house in a
          finished neighborhood with the yard, the window coverings and the
          trees already paid for. The right comparison is total payment and
          total finished cost, side by side. I walk through exactly how to run
          that in{" "}
          <Link href="/guides/new-build-vs-resale-las-vegas" className={linkCls}>
            New Build vs Resale in Las Vegas
          </Link>
          , and{" "}
          <Link href="/guides/what-500k-buys-in-las-vegas" className={linkCls}>
            What $500K Buys in Las Vegas
          </Link>{" "}
          shows what that budget looks like on the ground.
        </p>
      </StorySection>

      <StorySection id="when-waiting-makes-sense" heading="When waiting to buy genuinely makes sense">
        <p className="text-body-lg text-lvinit-warmgray">
          I&rsquo;m not going to tell you everyone should buy right now. Waiting
          is the right call for a lot of people. It&rsquo;s just usually right
          for reasons about your life, not a guess about rates.
        </p>
      </StorySection>

      <Container className="pb-12">
        <div className="mx-auto max-w-[900px]">
          <ol className="grid grid-cols-1 gap-7">
            {WAIT_REASONS.map((row, i) => (
              <li key={row.line} className="flex gap-5 border-t border-lvinit-lightgray pt-5">
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
                  <p className="mt-2 text-body text-lvinit-warmgray">{row.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>

      <StorySection>
        <p className="text-body-lg text-lvinit-warmgray">
          If you&rsquo;re still choosing a part of the valley, start with{" "}
          <Link
            href="/guides/summerlin-vs-henderson-vs-southwest-las-vegas"
            className={linkCls}
          >
            Summerlin vs Henderson vs Southwest Las Vegas
          </Link>
          . Leverage only helps once you know where you want to use it.
        </p>
      </StorySection>

      <StorySection id="mikeys-take" heading="Mikey's local take">
        <p className="text-body-lg text-lvinit-warmgray">
          For years, buyers told me they&rsquo;d jump in when sellers stopped
          holding all the cards. Sellers have stopped holding all the cards. The
          rate is what&rsquo;s keeping a lot of those buyers on the sidelines,
          and I get it. But there&rsquo;s no guarantee this kind of leverage is
          still here if the crowd comes back.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          My advice is simple. Run your real payment, not the headline rate.
          Use the leverage that exists right now to bring that payment down,
          whether that&rsquo;s a builder buydown or a resale seller&rsquo;s
          concession. If the number works at today&rsquo;s rate and you&rsquo;re
          planning to stay, this is a good market to be a buyer in. If it only
          works at a rate you&rsquo;re hoping for, wait, and keep watching.
          Either way, you can{" "}
          <Link href="/search" className={linkCls}>
            browse what&rsquo;s on the market
          </Link>{" "}
          today and see how long the homes you like have been sitting.
        </p>
      </StorySection>

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
                  <dd className="mt-3 text-body text-lvinit-warmgray">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <StorySection heading="Sources">
        <ul className="space-y-4 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Las Vegas REALTORS (LVR)</span>,
            August 2026 housing report: the $475,000 single-family median
            (&minus;1.0% YoY; $490,000 record in May and June), 7,590
            single-family homes listed without offers (+5.3% YoY), a housing
            supply of &ldquo;just over four and a half months,&rdquo; and the
            share of homes sold within 60 days. Verified against the full
            release text carried by{" "}
            <a
              href="https://nevadabusiness.com/2026/09/lvr-reports-fewer-homes-selling-and-at-slightly-lower-prices/"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              Nevada Business Magazine
            </a>{" "}
            and{" "}
            <a
              href="https://vegasinc.lasvegassun.com/business/2026/sep/09/las-vegas-home-sales-prices-ease-from-record-high/"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              VEGAS INC / Las Vegas Sun
            </a>
            . Full context in{" "}
            <Link href="/guides/las-vegas-home-prices-august-2026" className={linkCls}>
              our August 2026 report
            </Link>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Redfin</span>,{" "}
            <a
              href="https://www.redfin.com/news/buyers-vs-sellers-august-2026/"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              sellers vs. buyers, August 2026
            </a>{" "}
            (published September 10, 2026): Las Vegas metro 117% more sellers
            than buyers, a record gap for the metro, and Redfin&rsquo;s
            buyer&rsquo;s-market definition. Redfin,{" "}
            <a
              href="https://www.redfin.com/news/home-seller-concessions-august-2026/"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              seller concessions, three months ending August 2026
            </a>{" "}
            (published September 18, 2026): 66.7% of Las Vegas metro sales
            with a concession, 44.7% nationally.
          </li>
          <li>
            <span className="text-lvinit-black">
              National Association of REALTORS
            </span>
            ,{" "}
            <a
              href="https://www.nar.realtor/magazine/real-estate-news/strength-in-numbers"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              &ldquo;Strength in Numbers&rdquo;
            </a>{" "}
            (REALTOR Magazine, November 2024), for the six-month balanced-market
            benchmark, and{" "}
            <a
              href="https://www.nar.realtor/magazine/real-estate-news/economy/a-mortgage-rate-drop-to-6-would-ring-in-more-home-buying"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              NAR research on a 1-point rate decrease
            </a>{" "}
            (REALTOR Magazine, December 11, 2025). National estimates.
          </li>
          <li>
            <span className="text-lvinit-black">Freddie Mac</span>, Primary
            Mortgage Market Survey, week of October 1, 2026 (30-year 7.28%,
            15-year 6.60%; 7.03% the prior week; 6.34% a year earlier), at{" "}
            <a
              href="https://www.freddiemac.com/pmms"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              freddiemac.com/pmms
            </a>
            . National average. The &ldquo;highest since November 2023&rdquo;
            framing is from{" "}
            <a
              href="https://www.ksat.com/business/2026/10/01/average-long-term-us-mortgage-rate-churns-upward-to-its-highest-level-in-nearly-3-years-at-728/"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              Associated Press coverage
            </a>{" "}
            of the same release.
          </li>
          <li>
            <span className="text-lvinit-black">Home Builders Research</span>,
            August 2026 Southern Nevada new-home data, as reported by the{" "}
            <a
              href="https://www.reviewjournal.com/business/housing/continued-weakness-southern-nevada-buyers-keep-pulling-back-from-newly-built-homes-3890956/"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              Las Vegas Review-Journal
            </a>{" "}
            (September 25, 2026).
          </li>
          <li>
            <span className="text-lvinit-black">
              NAHB/Wells Fargo Housing Market Index
            </span>
            ,{" "}
            <a
              href="https://www.nahb.org/news-and-economics/press-releases/2026/09/builder-sentiment-falls-on-higher-interest-rates-and-costs"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              September 2026
            </a>{" "}
            (66% of builders using incentives, 38% cutting prices). National
            survey. <span className="text-lvinit-black">Lennar</span>,{" "}
            <a
              href="https://newsroom.lennar.com/2026-09-16-Lennar-Reports-Third-Quarter-2026-Results"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              third quarter 2026 results
            </a>{" "}
            (September 16, 2026), company-wide.
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Market conditions, mortgage rates, builder incentives and seller
          concessions change constantly. Figures reflect the sources and
          reporting periods cited above. The payment example is a hypothetical
          illustration of principal and interest only. It excludes taxes,
          insurance, HOA dues and mortgage insurance, and is not a quote.
          Mikey Del Rosario is a real estate agent, not a lender: talk to a
          qualified loan professional about your financing options. This guide
          is general information, not financial, lending, tax or investment
          advice, and nothing here predicts future rates, prices or demand.
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
