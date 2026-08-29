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
// MARKET WATCH — a genuine content gap, not a restatement. LVINIT's existing
// Market Watch pieces (las-vegas-home-prices-july-2026,
// las-vegas-new-home-sales-july-2026) cover the valley-wide resale ($480,000)
// and new-construction ($581,930) medians, ACROSS ALL PRICE TIERS. Neither
// speaks to the entry point specifically. This piece covers Zillow's
// starter-home research, a distinct data set (bottom-third-of-market pricing)
// from a different question: what does it cost to buy the first home, and how
// has that changed over a decade.
//
// FACT DISCIPLINE (read before editing):
// - Primary source: "Zillow: Las Vegas starter home prices have more than
//   doubled since 2016," Las Vegas Review-Journal, reporter Patrick
//   Blennerhassett, published August 26, 2026:
//   https://www.reviewjournal.com/business/housing/starter-home-prices-have-more-than-doubled-in-las-vegas-in-10-years-report-says-3869698/
// - Independently re-fetched and verified directly from the source article
//   (not taken on secondhand summary) before publishing.
// - Zillow's own definition, quoted in the article: a starter home is "any
//   home within the bottom third of pricing within a specific residential
//   real estate market" and "a homebuyer's first purchase" — usually one to
//   two bedrooms, and increasingly a condo or townhome rather than a
//   single-family house. No square-footage figure is given in the source, so
//   none is invented here.
// - Verified figures (do not round differently):
//     Typical Las Vegas starter-home value, July 2026: $312,141.
//     Typical Las Vegas starter-home value, July 2025: $322,577.
//     Typical Las Vegas starter-home value, July 2016: $140,630.
//     Year-over-year change (Jul 2025 -> Jul 2026): -3.2% ($10,436 lower;
//       the source rounds this "about 3 percent").
//     Ten-year change (Jul 2016 -> Jul 2026): +122.0% ($171,511 higher;
//       the source calls this "more than doubled" — do not restate as
//       "tripled" or any other rounding).
// - Quote, Kara Ng, Zillow senior economist (attributed to Zillow, never put
//   in Mikey's mouth): "Historically, Las Vegas has been one of the most
//   accessible housing markets in the West, a place where first-time buyers
//   could actually get a foothold. And while starter home prices have more
//   than doubled over the last decade, there are early signs of relief:
//   prices are down about 3 percent from last year, a modest but meaningful
//   shift for buyers who have been waiting on the sidelines."
// - Quote, Matt Hennessy, identified in the source as "a local mortgage
//   advisor" (not further identified by firm in the source, so none is
//   invented here): "The drop in Las Vegas starter home sales is less about
//   waning demand and more about an affordability squeeze," and "One of the
//   most effective tools right now is negotiating a seller concession." He is
//   also paraphrased (not a direct quote) as saying high mortgage rates have
//   cut buying power by roughly 30% compared with rates during and before the
//   pandemic — presented below as his stated claim, not as an LVINIT-verified
//   figure, since the underlying rate comparison isn't independently sourced
//   here.
// - Do NOT reference the separate Aug. 25, 2026 National Multifamily Housing
//   Council apartment-shortage story — unrelated topic, different source.
// - Cross-referenced against LVINIT's own already-published, already-sourced
//   figures for the same broad period: $480,000 valley-wide resale median,
//   all price tiers (las-vegas-home-prices-july-2026, LVR, July 2026) and
//   $581,930 new-construction single-family median
//   (las-vegas-new-home-sales-july-2026, Home Builders Research, July 2026).
//   Both are simply cited from those already-verified pieces, not re-derived.
// - No claim here about which specific neighborhood has the most starter
//   stock — Zillow's figure is valley-wide, not submarket-specific, and
//   LVINIT has no verified submarket starter-home data to cite.
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title:
    "Las Vegas Starter Homes Have More Than Doubled Since 2016 | LVINIT",
  headline:
    "Las Vegas Starter Homes Have More Than Doubled Since 2016 — And They Just Got a Little Cheaper",
  description:
    "Zillow research reported by the Las Vegas Review-Journal puts the typical Las Vegas starter home at $312,141 in July 2026, more than double its $140,630 value in July 2016, but down 3.2% from a year earlier. Here's what that means for a first-time buyer.",
  path: "/guides/las-vegas-starter-home-prices-2026",
  datePublished: "2026-08-27",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    {
      name: "Las Vegas Starter Homes Have More Than Doubled Since 2016",
      path: "/guides/las-vegas-starter-home-prices-2026",
    },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

// FAQ JSON-LD — three genuinely useful questions this article answers.
// Answers are drawn only from the cited, dated figures above.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What counts as a \"starter home\" in Las Vegas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Zillow defines a starter home as any home in the bottom third of pricing in a given market and typically a buyer's first purchase — usually one to two bedrooms, and increasingly a condo or townhome rather than a detached single-family house. It's a relative tier of the local market, not a fixed price or square footage.",
      },
    },
    {
      "@type": "Question",
      name: "How much has the typical Las Vegas starter home price changed since 2016?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It more than doubled. Zillow research reported by the Las Vegas Review-Journal put the typical Las Vegas starter-home value at $140,630 in July 2016 and $312,141 in July 2026 — an increase of about 122% over the decade.",
      },
    },
    {
      "@type": "Question",
      name: "Are Las Vegas starter home prices going up or down right now?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Down, modestly, over the past year. The typical Las Vegas starter-home value was $322,577 in July 2025 and $312,141 in July 2026, a decline of about 3.2%. Zillow senior economist Kara Ng called it \"a modest but meaningful shift for buyers who have been waiting on the sidelines,\" while still noting prices remain more than double where they stood a decade ago.",
      },
    },
  ],
};

// Verified figures for the stat panel. Each carries its own source + period
// label so nothing reads as a timeless "current" number.
type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "$312,141",
    label: "Typical Las Vegas starter-home value",
    note: "July 2026, down 3.2% YoY · Zillow via Las Vegas Review-Journal",
  },
  {
    value: "$322,577",
    label: "Typical starter-home value, a year earlier",
    note: "July 2025, for comparison · Zillow",
  },
  {
    value: "$140,630",
    label: "Typical starter-home value, a decade earlier",
    note: "July 2016, the baseline for the 10-year change · Zillow",
  },
  {
    value: "+122%",
    label: "Ten-year change",
    note: "July 2016 to July 2026 · Zillow",
  },
];

function SnapshotPanel() {
  return (
    <section id="by-the-numbers" aria-label="Las Vegas starter-home price snapshot" className="scroll-mt-24">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            The starter-home tier, by the numbers
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            Zillow&rsquo;s own figures for the bottom third of the Las Vegas market,
            the tier most first-time buyers are actually shopping in. Figures
            come from the source listed at the end of this article.
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
            Data reflects the reporting periods cited and can change. See the
            sources at the end of this article for the full research.
          </p>
        </div>
      </Container>
    </section>
  );
}

export default function LasVegasStarterHomePrices2026Page() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Market Watch",
        headline:
          "Las Vegas Starter Homes Have More Than Doubled Since 2016 — And They Just Got a Little Cheaper",
        subheadline:
          "Zillow research puts the typical Las Vegas starter home at $312,141 in July 2026 — more than double what it cost a decade ago, but down 3.2% from a year earlier. Here's what the entry point to homeownership actually looks like right now.",
        backLink: { label: "LVINIT", href: "/" },
        ctas: [{ label: "See the numbers", href: "#by-the-numbers", variant: "primary" }],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "The starter tier is one slice of the market. See how the valley-wide medians looked the same summer, and what a bigger budget actually buys.",
        stories: [
          {
            name: "Las Vegas Home Prices Pulled Back From Their Record High in July 2026",
            href: "/guides/las-vegas-home-prices-july-2026",
            category: "Market Watch",
            dek: "LVR's valley-wide resale median, across every price tier, for the same July 2026 window.",
          },
          {
            name: "What $500K Buys in Las Vegas",
            href: "/guides/what-500k-buys-in-las-vegas",
            category: "Buyer guide",
            dek: "Three real home tours well above the starter tier — a concrete look at what the next budget step up actually gets you.",
          },
          {
            name: "Why the Seller's Nevada Property Tax Bill May Not Be Yours",
            href: "/guides/nevada-property-tax-abatement-resale-buyers",
            category: "Cost of living",
            dek: "The property-tax mechanics every buyer should check before closing, starter home or not.",
          },
        ],
      }}
      ctas={{
        heading: "Trying to figure out what a starter budget actually gets you?",
        body:
          "A valley-wide starter-home figure is a research number, not your budget. What it buys depends entirely on where you're looking and what you're willing to trade off. Tell me your number, and I'll walk you through what it realistically gets you right now. No sales pitch.",
      }}
    >
      <StoryLede
        kicker="Market Watch"
        lead="Every buyer who's been priced out of Las Vegas has felt this without a chart to prove it: the cheapest homes on the market don't feel cheap anymore. Zillow research reported by the Las Vegas Review-Journal on August 26 puts a number on that feeling — and it's a bigger number than most people would guess."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          The typical Las Vegas starter home was worth{" "}
          <span className="text-lvinit-black">$312,141</span> in July 2026.
          A decade earlier, in July 2016, the same tier of the market was
          worth <span className="text-lvinit-black">$140,630</span>. That&rsquo;s
          more than double. There&rsquo;s a small piece of better news buried in
          the same data: over just the last year, starter-home values
          actually slipped, from $322,577 to $312,141. Here&rsquo;s what both of
          those numbers actually mean if you&rsquo;re trying to buy your first
          place here.
        </p>
      </StoryLede>

      <StorySection heading="What Zillow means by a &ldquo;starter home&rdquo;">
        <p className="text-body-lg text-lvinit-warmgray">
          &ldquo;Starter home&rdquo; isn&rsquo;t a fixed price or a specific
          floor plan. Zillow defines it as any home in the{" "}
          <span className="text-lvinit-black">bottom third of pricing</span>{" "}
          within a given local market, and typically a buyer&rsquo;s first
          purchase. In practice that usually means one to two bedrooms, and
          the Review-Journal&rsquo;s coverage of the research notes it&rsquo;s
          increasingly a condo or townhome rather than a detached
          single-family house. That last part matters: as the entry tier gets
          more expensive, more of what&rsquo;s actually available in it stops
          being a house with a yard.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Because it&rsquo;s a relative tier, not a fixed dollar figure, the
          $312,141 number below moves both with home prices generally and
          with how the bottom third of the market is composed. It&rsquo;s a
          valley-wide figure from Zillow, not a submarket-specific one — this
          article doesn&rsquo;t claim to know which Las Vegas neighborhood has
          the most starter-tier inventory, because that isn&rsquo;t in the
          source data.
        </p>
      </StorySection>

      <SnapshotPanel />

      <StorySection heading="The decade in one number">
        <p className="text-body-lg text-lvinit-warmgray">
          Run the math on Zillow&rsquo;s figures and the increase is roughly{" "}
          <span className="text-lvinit-black">122% over ten years</span> —
          from $140,630 in July 2016 to $312,141 in July 2026, an increase of
          $171,511. The Review-Journal&rsquo;s headline calls this &ldquo;more
          than doubled,&rdquo; which is the right way to say it plainly: what
          used to be the cheapest, most accessible slice of the Las Vegas
          market now costs more than twice what it did a decade ago.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That&rsquo;s the number worth sitting with if you&rsquo;re
          comparing what buying &ldquo;used to take&rdquo; against what it
          takes now. It isn&rsquo;t just that homes in general have gotten
          more expensive. The entry tier specifically — the one that&rsquo;s
          supposed to be the accessible starting point — has more than kept
          pace.
        </p>
      </StorySection>

      <StoryPullQuote cite="Kara Ng, Zillow senior economist">
        Historically, Las Vegas has been one of the most accessible housing
        markets in the West, a place where first-time buyers could actually
        get a foothold. And while starter home prices have more than doubled
        over the last decade, there are early signs of relief: prices are
        down about 3 percent from last year, a modest but meaningful shift
        for buyers who have been waiting on the sidelines.
      </StoryPullQuote>

      <StorySection heading="Why the last year looks different from the last decade">
        <p className="text-body-lg text-lvinit-warmgray">
          The year-over-year number is the more encouraging one, even if
          it&rsquo;s modest. Starter-home values fell from{" "}
          <span className="text-lvinit-black">$322,577 in July 2025</span> to{" "}
          <span className="text-lvinit-black">$312,141 in July 2026</span>, a
          drop of about{" "}
          <span className="text-lvinit-black">3.2%</span>. That&rsquo;s the
          same pullback Zillow&rsquo;s Kara Ng is describing above as
          &ldquo;a modest but meaningful shift&rdquo; — not a correction that
          undoes a decade of gains, but a real, measurable break from the
          direction prices had been moving.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Matt Hennessy, a local mortgage advisor quoted in the
          Review-Journal&rsquo;s coverage, frames the pullback as a demand
          problem more than a supply one: &ldquo;The drop in Las Vegas
          starter home sales is less about waning demand and more about an
          affordability squeeze,&rdquo; he said. He&rsquo;s cited in the
          article attributing much of that squeeze to higher mortgage rates,
          which he says have cut buying power by roughly 30% compared with
          rates during and before the pandemic. That&rsquo;s his stated
          estimate, not an independently verified LVINIT figure, but it lines
          up with the basic math: the same monthly payment buys meaningfully
          less home at today&rsquo;s rates than it did a few years ago.
        </p>
      </StorySection>

      <StorySection muted heading="Why this is a different number than the valley-wide medians">
        <p className="text-body-lg text-lvinit-warmgray">
          It&rsquo;s worth being precise about which market this figure describes.
          $312,141 is the bottom third of the market — it isn&rsquo;t the
          same number as the valley&rsquo;s overall resale median, which sat
          at{" "}
          <Link
            href="/guides/las-vegas-home-prices-july-2026"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            $480,000 across every price tier in July 2026
          </Link>
          , and it&rsquo;s further still from the{" "}
          <Link
            href="/guides/las-vegas-new-home-sales-july-2026"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            $581,930 median for a new-construction single-family home
          </Link>{" "}
          the same month. Those two figures describe the whole market,
          starter tier included. This one describes only the cheapest third
          of it — the number that actually matters if you&rsquo;re a
          first-time buyer, not the headline median that includes every move-up
          and luxury sale alongside it.
        </p>
      </StorySection>

      <StorySection heading="What buyers should know">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              &ldquo;Starter home&rdquo; increasingly means a condo or
              townhome, not a detached house with a yard. If a yard is
              non-negotiable, budget accordingly — you may be shopping above
              the strict starter tier to get one.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              A 3.2% year-over-year pullback is real, but it&rsquo;s a
              pullback from an all-time-high tier, not a return to
              affordability. $312,141 is still more than double where this
              tier sat a decade ago.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              If financing is the constraint rather than the price itself,
              Hennessy&rsquo;s point about negotiating seller concessions is
              worth raising with your lender and agent directly — rate
              buydowns and closing-cost credits can matter more than a
              small swing in list price.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Property taxes on a starter-tier home follow the same Nevada
              rules as any other purchase — worth understanding{" "}
              <Link
                href="/guides/nevada-property-tax-abatement-resale-buyers"
                className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
              >
                what changes at closing
              </Link>{" "}
              before you assume your monthly cost matches the seller&rsquo;s.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              If the down payment, not the price itself, is what makes the
              starter tier feel out of reach,{" "}
              <Link
                href="/guides/las-vegas-down-payment-assistance-programs-2026"
                className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
              >
                the real minimums and Nevada&rsquo;s assistance programs
              </Link>{" "}
              are worth a look before you assume you need 20% saved up.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="What to watch next">
        <p className="text-body-lg text-lvinit-warmgray">
          One year of a 3.2% pullback doesn&rsquo;t tell you whether the
          starter tier keeps easing or snaps back. Watch whether Zillow&rsquo;s
          next few monthly updates keep showing declines or flatten out —
          that&rsquo;s what would tell you if July 2026 was the start of a real
          shift or a single soft month inside a much longer run-up. Watch
          mortgage rates too: Hennessy&rsquo;s framing ties the affordability
          squeeze directly to borrowing costs, so a meaningful rate move in
          either direction would likely show up in this tier before it shows
          up in the valley-wide median.
        </p>
      </StorySection>

      <StorySection heading="Mikey's local take">
        <p className="text-body-lg text-lvinit-warmgray">
          The number that sticks with me here isn&rsquo;t the 3.2% pullback.
          It&rsquo;s the 122% decade. A 3% dip is a real, welcome data point
          for anyone who&rsquo;s been priced out and waiting, but it doesn&rsquo;t
          change the bigger fact underneath it: the entry point to owning in
          Las Vegas has moved a long way in ten years, and it isn&rsquo;t
          moving back to where it was.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If you&rsquo;re shopping the starter tier right now, treat the
          pullback as a small opening, not permission to wait for a bigger
          one. Get specific about your own number instead of anchoring to
          either the $312,141 valley-wide figure or the higher medians in
          our{" "}
          <Link
            href="/guides/las-vegas-home-prices-july-2026"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            resale
          </Link>{" "}
          and{" "}
          <Link
            href="/guides/las-vegas-new-home-sales-july-2026"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            new-construction
          </Link>{" "}
          coverage. Those are the whole market. Your budget is one home in
          it. If you want a concrete look at what a bigger step up from the
          starter tier actually buys, the{" "}
          <Link
            href="/guides/what-500k-buys-in-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            $500K home tours
          </Link>{" "}
          are a good next read, or{" "}
          <Link
            href="/search"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            browse what&rsquo;s actually on the market
          </Link>{" "}
          at your number today.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Zillow</span>, as reported by
            the{" "}
            <span className="text-lvinit-black">
              Las Vegas Review-Journal
            </span>{" "}
            (reporter Patrick Blennerhassett), &ldquo;Zillow: Las Vegas
            starter home prices have more than doubled since 2016,&rdquo;
            published August 26, 2026. The source for every figure and quote
            here: the $312,141 typical starter-home value (July 2026,
            &minus;3.2% YoY), the $322,577 value a year earlier (July 2025),
            the $140,630 value a decade earlier (July 2016), Zillow&rsquo;s
            bottom-third-of-market definition of a starter home, the quote
            from Zillow senior economist Kara Ng, and the quotes and
            estimate from local mortgage advisor Matt Hennessy. Read the full
            article at{" "}
            <a
              href="https://www.reviewjournal.com/business/housing/starter-home-prices-have-more-than-doubled-in-las-vegas-in-10-years-report-says-3869698/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              reviewjournal.com
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Las Vegas Realtors (LVR)</span>
            . Official July 2026 housing report — the source for the $480,000
            valley-wide, all-price-tier resale median cited for comparison.
            Full detail and sourcing in{" "}
            <Link
              href="/guides/las-vegas-home-prices-july-2026"
              className="text-lvinit-blue underline underline-offset-4"
            >
              our July 2026 resale coverage
            </Link>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Home Builders Research</span>
            , as reported by the Las Vegas Review-Journal. The source for the
            $581,930 new-construction single-family median cited for
            comparison. Full detail and sourcing in{" "}
            <Link
              href="/guides/las-vegas-new-home-sales-july-2026"
              className="text-lvinit-blue underline underline-offset-4"
            >
              our new-construction July 2026 coverage
            </Link>
            .
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Market conditions and property information can change. Data
          reflects the sources and reporting periods cited above and should
          not be treated as a guarantee of future results. This article is
          general market commentary, not financial, lending, tax, or
          investment advice.
        </p>
      </StorySection>

      <StorySection heading="About this coverage">
        <p className="text-body text-lvinit-warmgray">
          Mikey Del Rosario · Las Vegas Real Estate Advisor · The Scofield Group ·
          Nevada License S.0175577. Equal Housing Opportunity.
        </p>
      </StorySection>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </StoryPage>
  );
}
