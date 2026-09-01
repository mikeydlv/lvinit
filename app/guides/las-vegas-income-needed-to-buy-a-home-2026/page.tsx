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
// MARKET WATCH — a genuine content gap. LVINIT's existing Market Watch pieces
// (las-vegas-home-prices-july-2026, las-vegas-new-home-sales-july-2026,
// las-vegas-starter-home-prices-2026) all report what homes cost. None report
// what income a household actually needs to qualify for one — the number that
// turns a median price into a real go/no-go for a buyer or relocator. This
// piece fills that gap with Redfin's income-needed-to-afford research, fresh
// as of this publish (RJ coverage ran August 31, 2026, the day before this
// piece was built).
//
// FACT DISCIPLINE (read before editing):
// - Primary source #1: Redfin's national affordability report, "The Income
//   Needed to Afford Typical American Home Holds Steady Near Record High of
//   $110,000," published August 5, 2026, data as of June 2026:
//   https://www.redfin.com/news/affordability-homebuying-2026/
//   Independently fetched and verified directly (not taken secondhand).
// - Primary source #2: Las Vegas Review-Journal (reporter Patrick
//   Blennerhassett), "How much do you need to make to afford a home in the
//   Las Vegas Valley?", published August 31, 2026:
//   https://www.reviewjournal.com/business/housing/how-much-do-you-need-to-make-to-afford-a-home-in-the-las-vegas-valley-3872567/
//   Independently fetched and verified directly. Figures cross-checked
//   against the Redfin report itself and matched exactly.
// - Redfin's methodology, quoted from the report: affordability assumes a
//   buyer taking out a mortgage would spend no more than 30% of their income
//   on their monthly housing payment, "based on a Redfin analysis of median
//   home sale prices, prevailing mortgage rates and property-tax payments,
//   and assumes a 15% down payment." The report describes June 2026 mortgage
//   rates generally as "still elevated in the mid-6% range" but does not
//   state one specific rate used in the calculation, so none is invented
//   here beyond that qualitative range.
// - Verified figures, Las Vegas, NV metro, June 2026 (do not round
//   differently):
//     Income needed to afford the typical home: $116,563.
//     Year-over-year change: down 2.0%.
//     Redfin's estimated median household income, Las Vegas metro: $82,975.
//     Share of income the median household would spend on the typical home:
//       42.1% (vs. Redfin's 30% affordability threshold).
//     Share of active listings affordable to the median local household:
//       18.5%.
// - Verified figures, national, June 2026, for comparison:
//     Income needed to afford the typical home: $109,796 (down 0.5% YoY,
//       just under the prior year's record of $110,382).
//     Redfin's estimated median household income: $87,599.
//     Income gap (needed minus median): $22,197 — narrower than $26,125 a
//       year earlier and $28,834 two years earlier.
//     Share of income for the typical home: 37.6%.
//     Share of listings affordable to the median household: 34.2%.
// - Quote, Yingqi Xu, Redfin senior economist (from the Redfin report,
//   attributed to Redfin, never put in Mikey's mouth): "The earnings needed
//   to buy a house have stabilized after several years of deterioration, but
//   that doesn't mean homes are affordable to the average American." A
//   second Xu quote from the same report: "There's still a double-digit gap
//   between what the typical household earns and what they need to
//   comfortably buy a home, leaving many prospective first-time buyers
//   stalled on the sidelines."
// - The Review-Journal's own reporting adds one piece of local context not in
//   the Redfin report itself: a lack of developable land in the Las Vegas
//   Valley (much of it under federal control) as a reason cited for home
//   prices staying elevated compared with other Sun Belt metros such as
//   Austin and Nashville. Presented here as the Review-Journal's framing, not
//   restated as an LVINIT-verified causal claim.
// - Do NOT assert a formal "least affordable metro" ranking — the source
//   material gives Las Vegas's own figures and the national comparison, not a
//   full metro-by-metro rank order. The comparison here is limited to what's
//   actually sourced: 18.5% of Las Vegas listings affordable to the median
//   local household vs. 34.2% nationally.
// - Mortgage-rate context, Freddie Mac Primary Mortgage Market Survey
//   (primary source, independently fetched from freddiemac.com/pmms): 30-year
//   fixed averaged 6.66% as of August 27, 2026, up from 6.65% the prior week;
//   15-year fixed averaged 5.98%, up from 5.95%. Used only as current-rate
//   context, not as the rate Redfin's calculation used.
// - Cross-referenced against LVINIT's own already-published, already-sourced
//   figures for the same broad period: $480,000 valley-wide resale median,
//   all price tiers (las-vegas-home-prices-july-2026, LVR, July 2026) and the
//   real minimums by loan type in las-vegas-down-payment-assistance-programs-2026
//   — both simply cited from those already-verified pieces, not re-derived.
//   Redfin's 15%-down assumption for this affordability calculation is
//   explicitly flagged as different from the loan-type minimums in that other
//   piece (which run from 0% to 5% for many buyers) — this is a research
//   modeling assumption, not a claim about what any individual buyer must put
//   down.
// - No claim about which specific Las Vegas neighborhood is most or least
//   affordable — Redfin's figure here is metro-wide, not submarket-specific,
//   and this piece does not have verified submarket income-to-price data to
//   cite.
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title:
    "A Las Vegas Household Needs $116,563 a Year To Afford the Median Home | LVINIT",
  headline:
    "A Las Vegas Household Needs $116,563 a Year To Afford the Median Home",
  description:
    "Redfin's latest affordability research, reported by the Las Vegas Review-Journal on August 31, 2026, puts the income needed to afford a typical Las Vegas home at $116,563 — well above the metro's estimated $82,975 median household income. Here's what that gap actually means.",
  path: "/guides/las-vegas-income-needed-to-buy-a-home-2026",
  datePublished: "2026-09-01",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    {
      name: "A Las Vegas Household Needs $116,563 a Year To Afford the Median Home",
      path: "/guides/las-vegas-income-needed-to-buy-a-home-2026",
    },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

// FAQ JSON-LD — three genuinely useful questions this article answers, drawn
// only from the cited, dated figures above.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much income do you need to afford a home in Las Vegas right now?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "According to Redfin research reported by the Las Vegas Review-Journal on August 31, 2026, a Las Vegas Valley household needed $116,563 a year to afford the typical home as of June 2026 — assuming a 15% down payment and monthly housing costs no greater than 30% of income. That's down 2% from a year earlier, but still well above Redfin's estimated $82,975 median household income for the metro.",
      },
    },
    {
      "@type": "Question",
      name: "How does Las Vegas compare to the national income-needed-to-buy figure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The income needed to afford a typical U.S. home was $109,796 as of June 2026, versus $116,563 in Las Vegas — meaning Las Vegas requires roughly $6,800 more in annual income than the national figure. Nationally, 34.2% of listings are affordable to the median household; in Las Vegas, only 18.5% are, per Redfin.",
      },
    },
    {
      "@type": "Question",
      name: "What percentage of income would a typical Las Vegas household spend on a home?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "42.1%, according to Redfin's June 2026 estimate — well above the 30% share Redfin treats as the affordability threshold. Nationally, the comparable figure is 37.6%.",
      },
    },
  ],
};

type Stat = { value: string; label: string; note: string };

const LAS_VEGAS_SNAPSHOT: Stat[] = [
  {
    value: "$116,563",
    label: "Income needed to afford the typical home",
    note: "Las Vegas metro, June 2026, down 2.0% YoY · Redfin",
  },
  {
    value: "$82,975",
    label: "Redfin's estimated median household income",
    note: "Las Vegas metro, June 2026 · Redfin",
  },
  {
    value: "42.1%",
    label: "Share of income the median household would spend",
    note: "On the typical home, vs. Redfin's 30% threshold",
  },
  {
    value: "18.5%",
    label: "Share of active listings affordable to that household",
    note: "Las Vegas metro, June 2026 · Redfin",
  },
];

const NATIONAL_SNAPSHOT: Stat[] = [
  {
    value: "$109,796",
    label: "Income needed to afford the typical U.S. home",
    note: "June 2026, down 0.5% YoY · Redfin",
  },
  {
    value: "$87,599",
    label: "Redfin's estimated median U.S. household income",
    note: "June 2026 · Redfin",
  },
  {
    value: "37.6%",
    label: "Share of income the median U.S. household would spend",
    note: "On the typical home, vs. the same 30% threshold",
  },
  {
    value: "34.2%",
    label: "Share of active listings affordable nationally",
    note: "June 2026 · Redfin",
  },
];

function SnapshotGrid({ title, intro, stats }: { title: string; intro: string; stats: Stat[] }) {
  return (
    <div className="mt-10">
      <h3 className="font-display text-subhead font-bold text-lvinit-black">{title}</h3>
      <p className="mt-2 max-w-[680px] text-body text-lvinit-warmgray">{intro}</p>
      <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-lvinit-lightgray bg-lvinit-lightgray sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-lvinit-white p-6">
            <dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">
              {s.label}
            </dt>
            <dd className="mt-2 font-display text-heading-sm font-bold text-lvinit-blue">
              {s.value}
            </dd>
            <p className="mt-2 text-caption text-lvinit-warmgray">{s.note}</p>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SnapshotPanel() {
  return (
    <section id="by-the-numbers" aria-label="Las Vegas income-to-buy snapshot" className="scroll-mt-24">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            The gap, by the numbers
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            Redfin&rsquo;s own figures, Las Vegas metro against the national
            picture, both for the same June 2026 window. Figures come from the
            sources listed at the end of this article.
          </p>

          <SnapshotGrid
            title="Las Vegas metro"
            intro="What it actually takes to qualify here, and how far that is from what a typical household brings home."
            stats={LAS_VEGAS_SNAPSHOT}
          />
          <SnapshotGrid
            title="For comparison: nationally"
            intro="The same math, run on the U.S. as a whole."
            stats={NATIONAL_SNAPSHOT}
          />

          <p className="mt-6 max-w-[680px] text-caption text-lvinit-warmgray">
            Data reflects the reporting periods cited and can change. See the
            sources at the end of this article for the full research.
          </p>
        </div>
      </Container>
    </section>
  );
}

export default function LasVegasIncomeNeededToBuyAHome2026Page() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Market Watch",
        headline:
          "A Las Vegas Household Needs $116,563 a Year To Afford the Median Home",
        subheadline:
          "Redfin's latest affordability research, reported by the Las Vegas Review-Journal on August 31, puts a real number on what most buyers here already feel. Here's what the gap between that number and local paychecks actually means.",
        // No real photo depicts this data-driven, valley-wide topic. Per the
        // established Market Watch pattern (e.g. will-las-vegas-home-prices-drop),
        // the hero stays photoless — the generated editorial cover below is
        // used only as the guides-registry card image, never as the hero/OG
        // image, since it's a card-sized (4:3) decorative asset, not a
        // landscape hero photo.
        backLink: { label: "LVINIT", href: "/" },
        ctas: [{ label: "See the numbers", href: "#by-the-numbers", variant: "primary" }],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "This is the income side of the equation. See what those dollars actually buy, and where the down payment can come from.",
        stories: [
          {
            name: "Las Vegas Home Prices Pulled Back From Their Record High in July 2026",
            href: "/guides/las-vegas-home-prices-july-2026",
            category: "Market Watch",
            dek: "LVR's valley-wide resale median, across every price tier, for the same summer window this piece's income figures are anchored to.",
          },
          {
            name: "You Don't Need 20% Down To Buy a Home in Las Vegas",
            href: "/guides/las-vegas-down-payment-assistance-programs-2026",
            category: "Buyer Guide",
            dek: "Redfin's 15%-down assumption here is a research model, not a rule — see the real loan-type minimums and Nevada's assistance programs.",
          },
          {
            name: "Las Vegas Starter Homes Have More Than Doubled Since 2016",
            href: "/guides/las-vegas-starter-home-prices-2026",
            category: "Market Watch",
            dek: "The entry tier of the market, and how it's moved over the last decade and the last year.",
          },
        ],
      }}
      ctas={{
        heading: "Trying to figure out where your number actually lands?",
        body:
          "A metro-wide income figure is a research model, not your personal budget. What you can actually afford depends on your down payment, your rate, your debt, and where you're looking. Tell me your number, and I'll walk you through what it realistically gets you right now. No sales pitch.",
      }}
    >
      <StoryLede
        kicker="Market Watch"
        lead="Every renter who's run the numbers on buying in Las Vegas has hit the same wall: the math doesn't work at what they actually make. Redfin research reported by the Las Vegas Review-Journal on August 31 puts a real figure behind that feeling."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          A Las Vegas Valley household needed{" "}
          <span className="text-lvinit-black">$116,563</span> a year, as of
          June 2026, to afford the typical local home without spending more
          than 30% of income on it. Redfin&rsquo;s own estimate of the
          metro&rsquo;s median household income is{" "}
          <span className="text-lvinit-black">$82,975</span> — a gap of about{" "}
          <span className="text-lvinit-black">$33,600</span>. Here&rsquo;s
          what that gap actually means, and what&rsquo;s (slightly) better
          about it than it was a year ago.
        </p>
      </StoryLede>

      <StorySection heading="How Redfin gets to $116,563">
        <p className="text-body-lg text-lvinit-warmgray">
          This isn&rsquo;t a loan-approval number from a lender — it&rsquo;s a
          research calculation. Redfin defines a home as affordable when a
          buyer&rsquo;s monthly housing payment (mortgage principal and
          interest, taxes, and insurance) wouldn&rsquo;t exceed{" "}
          <span className="text-lvinit-black">30% of household income</span>.
          The calculation assumes a{" "}
          <span className="text-lvinit-black">15% down payment</span> and
          runs it against prevailing mortgage rates, which Redfin describes as
          still elevated in the mid-6% range as of its June 2026 data window.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That 15% assumption is worth flagging on its own, because it&rsquo;s
          not what every buyer actually has to put down. It&rsquo;s a modeling
          choice Redfin uses to compare markets consistently, not a rule.{" "}
          <Link
            href="/guides/las-vegas-down-payment-assistance-programs-2026"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            FHA loans start at 3.5% down, VA loans can be 0% for eligible
            borrowers, and some conventional programs go as low as 3%
          </Link>
          . A lower down payment changes the loan amount and the monthly
          payment math, which changes the income needed to qualify — usually
          upward, since more of the price is financed. Redfin&rsquo;s
          $116,563 figure is the picture at 15% down specifically, not a
          floor or ceiling on what any individual buyer needs.
        </p>
      </StorySection>

      <SnapshotPanel />

      <StorySection heading="The gap is real, but it's smaller than it was">
        <p className="text-body-lg text-lvinit-warmgray">
          The $116,563 figure is down{" "}
          <span className="text-lvinit-black">2% from a year earlier</span>,
          per Redfin. That tracks with the national trend: the income needed
          to afford the typical U.S. home was $109,796 in June 2026, down 0.5%
          year over year and just under the prior year&rsquo;s record of
          $110,382. Redfin frames the national gap between what households
          earn and what they need to comfortably buy as narrowing — $22,197 as
          of June 2026, down from $26,125 a year earlier and $28,834 two years
          earlier.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That&rsquo;s a real, measurable easing. It is not the same thing as
          affordable. In Las Vegas, the gap between the income needed
          ($116,563) and Redfin&rsquo;s estimated median household income
          ($82,975) is still well over $30,000 — and the share of listings a
          median local household could actually afford, 18.5%, is barely more
          than half the national share of 34.2%.
        </p>
      </StorySection>

      <StoryPullQuote cite="Yingqi Xu, Redfin senior economist">
        The earnings needed to buy a house have stabilized after several
        years of deterioration, but that doesn&rsquo;t mean homes are
        affordable to the average American.
      </StoryPullQuote>

      <StorySection heading="Why Las Vegas runs hotter than the national number">
        <p className="text-body-lg text-lvinit-warmgray">
          Xu&rsquo;s second point from the same report cuts closer to what a
          local buyer actually feels: &ldquo;There&rsquo;s still a
          double-digit gap between what the typical household earns and what
          they need to comfortably buy a home, leaving many prospective
          first-time buyers stalled on the sidelines.&rdquo; In Las Vegas
          that gap runs wider than the national one — 42.1% of median income
          required here versus 37.6% nationally.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The Review-Journal&rsquo;s coverage points to one structural reason
          Las Vegas home prices have stayed elevated relative to other Sun
          Belt metros people compare it to, like Austin and Nashville: a
          shortage of developable land, much of it under federal control,
          that keeps a lid on how much new supply the valley can add. That&rsquo;s
          the Review-Journal&rsquo;s framing of a contributing factor, not a
          single explanation for the whole gap — Redfin&rsquo;s report itself
          doesn&rsquo;t attribute Las Vegas&rsquo;s specific number to any one
          cause.
        </p>
      </StorySection>

      <StorySection muted heading="Where this number fits against the rest of what LVINIT has reported">
        <p className="text-body-lg text-lvinit-warmgray">
          This figure describes affordability, not price. It&rsquo;s a
          different question from{" "}
          <Link
            href="/guides/las-vegas-home-prices-july-2026"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            what the typical home actually sold for
          </Link>{" "}
          ($480,000 valley-wide, all price tiers, July 2026 per LVR) or{" "}
          <Link
            href="/guides/las-vegas-starter-home-prices-2026"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            what the entry tier of the market costs
          </Link>{" "}
          ($312,141, July 2026 per Zillow). Those are price numbers. This one
          is an income threshold, modeled at a 15% down payment and a specific
          debt-to-income assumption — it moves with mortgage rates and home
          prices together, not with price alone.
        </p>
      </StorySection>

      <StorySection heading="What this actually means if you're buying or relocating">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              $116,563 is a research benchmark at 15% down, not a wall. A
              smaller down payment raises the income needed to carry the same
              home; a larger one lowers it. Run your own numbers with a
              lender against your actual down payment before assuming this
              figure applies to you.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              If a 15%–20% down payment is the barrier rather than your
              income,{" "}
              <Link
                href="/guides/las-vegas-down-payment-assistance-programs-2026"
                className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
              >
                the real loan-type minimums and Nevada&rsquo;s
                down-payment-assistance programs
              </Link>{" "}
              change this math meaningfully — some buyers qualify with far
              less down than Redfin&rsquo;s model assumes.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Mortgage rates move this number directly. Freddie Mac&rsquo;s
              own weekly survey had the 30-year fixed rate at 6.66% as of
              August 27, 2026 — a rate move of even half a point in either
              direction would shift the income needed to qualify without any
              change in home prices at all.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              An 18.5% affordable-listing share isn&rsquo;t zero. It means
              roughly one in five active Las Vegas listings would fit a
              median local household&rsquo;s budget under Redfin&rsquo;s
              math — a real, if narrow, set of options, concentrated toward{" "}
              <Link
                href="/guides/las-vegas-starter-home-prices-2026"
                className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
              >
                the lower end of the market
              </Link>
              .
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="What to watch next">
        <p className="text-body-lg text-lvinit-warmgray">
          Two things move this number month to month: mortgage rates and home
          prices. Watch Freddie Mac&rsquo;s weekly survey for rate direction,
          and LVR&rsquo;s monthly reports for whether the resale median keeps
          the same slow pullback it showed in July. A meaningful move in
          either direction — rates down, or the median holding flat while
          local incomes grow — is what would actually close a gap this size,
          rather than a single month&rsquo;s data point.
        </p>
      </StorySection>

      <StorySection heading="Mikey's local take">
        <p className="text-body-lg text-lvinit-warmgray">
          The number that matters most here isn&rsquo;t $116,563. It&rsquo;s
          the fact that it&rsquo;s $33,600 above what Redfin thinks a typical
          household here actually makes. That&rsquo;s the real story: not
          that Las Vegas is unaffordable in some abstract sense, but that a
          specific, sizable stretch is required to close the gap, and most of
          the ways to close it — a bigger down payment, a lower rate, more
          income, a different price point — are things a buyer has some real
          control over.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If Redfin&rsquo;s 15%-down model doesn&rsquo;t match your actual
          plan, don&rsquo;t anchor to $116,563 as your number. Get specific:
          run your real down payment,{" "}
          <Link
            href="/guides/las-vegas-down-payment-assistance-programs-2026"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            check whether an assistance program changes the math
          </Link>
          , and see{" "}
          <Link
            href="/search"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            what&rsquo;s actually on the market
          </Link>{" "}
          at the number you land on, not the research metro-wide average.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Redfin</span>, &ldquo;The
            Income Needed to Afford Typical American Home Holds Steady Near
            Record High of $110,000,&rdquo; published August 5, 2026, data as
            of June 2026. The source for every income-needed, median-income,
            share-of-income, and share-of-listings figure in this article
            (both Las Vegas metro and national), the 15%-down/30%-income
            methodology, and both quotes from Redfin senior economist Yingqi
            Xu. Read the full report at{" "}
            <a
              href="https://www.redfin.com/news/affordability-homebuying-2026/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              redfin.com
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">
              Las Vegas Review-Journal
            </span>{" "}
            (reporter Patrick Blennerhassett), &ldquo;How much do you need to
            make to afford a home in the Las Vegas Valley?&rdquo;, published
            August 31, 2026. Source for the local framing of Redfin&rsquo;s
            data and the developable-land context comparing Las Vegas with
            other Sun Belt metros. Read the full article at{" "}
            <a
              href="https://www.reviewjournal.com/business/housing/how-much-do-you-need-to-make-to-afford-a-home-in-the-las-vegas-valley-3872567/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              reviewjournal.com
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Freddie Mac</span>, Primary
            Mortgage Market Survey. Source for the current 30-year and
            15-year fixed mortgage rates cited as rate context (6.66% and
            5.98% respectively, as of August 27, 2026). Published at{" "}
            <a
              href="https://www.freddiemac.com/pmms"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              freddiemac.com/pmms
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
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Market conditions, mortgage rates, and income estimates can change.
          Data reflects the sources and reporting periods cited above and
          should not be treated as a guarantee of future results or as a
          statement of what any individual buyer will qualify for. This
          article is general market commentary, not financial, lending, tax,
          or investment advice.
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
