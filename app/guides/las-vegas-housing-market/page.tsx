import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import Container from "@/components/ui/Container";
import { StoryPage, StoryLede, StorySection, StoryVideo } from "@/components/story";

// ---------------------------------------------------------------------------
// MARKET WATCH — the evergreen Las Vegas housing-market page (D2,
// docs/LVINIT_CONTENT_CLUSTER_MAP.md, queue #5). One undated URL, UPDATED IN
// PLACE as each month's Las Vegas Realtors (LVR) report lands. Do not spawn a
// default monthly URL (hold H2); the dated July/August pages stay as history.
//
// UPDATING IN PLACE: each month, replace SNAPSHOT and add a row to TREND,
// refresh the lede, "what the numbers say" copy and Sources, and bump
// `dateModified`. Leave explanatory sections alone unless a fact changed.
//
// FACT DISCIPLINE — verified 2026-10-07:
// - LVR's September 2026 report (released Tuesday Oct 6, 2026). LVR's own
//   site returned HTTP 503 this run, so figures come from three independent
//   carriers fetched this run that agree on every shared number: Nevada
//   Business Magazine (full release text), Fox 5 Vegas (Oct 6) and News 3 LV.
//   Vegas Inc. returned HTTP 402 and was not read; it is only a search-result
//   headline and is not cited.
// - Verified: single-family median $470,000 (-1.1% from August's $475,000;
//   same as September 2025);
//   all-time high $490,000 set May-June 2026; condo/townhome median $290,000
//   (-1.4% YoY; record $315,000 Oct 2024); 2,169 total sales; single-family
//   sales -7.4% YoY, condo/townhome -12.6% YoY; 7,995 single-family and 2,796
//   condo/townhomes listed without offers (+6.6% / +7.3% YoY); supply about
//   five months (about four a year earlier, per the release); 75.9% of homes /
//   70.5% of condos sold within 60 days (72.0% / 67.0% a year earlier); cash
//   23.5% (23.0%); distressed (short sales + foreclosures) 1.1% (0.5%).
//   Cash %, 60-day shares and distressed share come from Nevada Business
//   Magazine and Fox 5 only (News 3 LV omits them).
// - Quote: George Kypreos, LVR President, "Recently rising mortgage rates are
//   playing a bigger role in the housing market." (Nevada Business Magazine /
//   Fox 5 / News 3 LV.)
// - Trend rows July ($480,000) and August ($475,000) are LVINIT's own already
//   sourced pieces (las-vegas-home-prices-july-2026 / -august-2026). The
//   "$20,000 / about 4% below the record" figure is arithmetic on $490,000 vs
//   $470,000. Rate context (7.28%, Oct 1) is reused from
//   /guides/las-vegas-mortgage-rates (Freddie Mac PMMS, verified there).
// - NOT used: total-dollar-volume figures (reported inconsistently across
//   earlier months and not needed). No forecast, no cause beyond LVR's own
//   attribution to rates, no neighborhood-level claims.
// IMAGERY — Mikey's own drone photo, uploaded to the repo 2026-10-07 as
// lvinit-sky-canyon-drone.png and converted to WebP with Sharp. Used ONLY here
// (one image, one page). Location is not stated in the alt text: the hub is
// valley-wide and the filename's place name is not independently confirmed.
// ---------------------------------------------------------------------------

const PATH = "/guides/las-vegas-housing-market";

const meta: StoryMeta = {
  title: "Las Vegas Housing Market: Prices, Inventory and Sales Right Now | LVINIT",
  headline: "Las Vegas Housing Market: Prices, Inventory and Sales Right Now",
  description:
    "The Las Vegas median single-family price was $470,000 in September 2026, $20,000 below the May-June record, with sales down and supply near five months. Latest LVR numbers and what they mean. Updated in place.",
  path: PATH,
  datePublished: "2026-10-07",
  dateModified: "2026-10-07",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Las Vegas Housing Market", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the median home price in Las Vegas right now?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "According to Las Vegas Realtors' September 2026 report, the median price of an existing single-family home sold in the valley was $470,000, down 1.1% from August and the same as September 2025. The condo and townhome median was $290,000, down 1.4% from a year earlier. A median is a market-wide midpoint, not the price of any particular home or neighborhood.",
      },
    },
    {
      "@type": "Question",
      name: "Are Las Vegas home prices dropping?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Gently, not sharply. The single-family median has eased from the $490,000 record set in May and June 2026 to $480,000 in July, $475,000 in August and $470,000 in September, about 4% below the peak. It is flat compared with a year earlier. LVR's September report shows sales slowing and inventory rising, which is what a cooler market looks like, but it does not show a collapse.",
      },
    },
    {
      "@type": "Question",
      name: "How much inventory is there in Las Vegas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At the end of September 2026, LVR counted 7,995 single-family homes and 2,796 condos and townhomes listed for sale without an offer, up 6.6% and 7.3% from a year earlier. That is about a five-month supply at the current sales pace, up from roughly four months a year earlier.",
      },
    },
    {
      "@type": "Question",
      name: "Is it a good time to buy a home in Las Vegas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on your payment and your timeline, not on a headline. Buyers have more choices and more negotiating room than a year ago, but mortgage rates are higher and LVR names rising rates as a growing factor. The guide on whether Las Vegas is a buyer's market walks through what to negotiate and when waiting makes sense.",
      },
    },
  ],
};

type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "$470,000",
    label: "Single-family median",
    note: "September 2026, down 1.1% from August, same as Sept 2025 · LVR",
  },
  {
    value: "$290,000",
    label: "Condo and townhome median",
    note: "September 2026, down 1.4% from Sept 2025 · LVR",
  },
  {
    value: "2,169",
    label: "Homes, condos and townhomes sold",
    note: "September 2026. Single-family sales down 7.4%, condo/townhome down 12.6% vs Sept 2025 · LVR",
  },
  {
    value: "~5 months",
    label: "Supply at the current pace",
    note: "7,995 single-family homes listed without offers, up 6.6% from a year ago · LVR",
  },
];

const TREND: { month: string; median: string; note: string }[] = [
  { month: "May-June 2026", median: "$490,000", note: "All-time high for the single-family median" },
  { month: "July 2026", median: "$480,000", note: "Down 1.0% from July 2025" },
  { month: "August 2026", median: "$475,000", note: "Down 1.0% from August 2025" },
  { month: "September 2026", median: "$470,000", note: "Same as September 2025" },
];

const link =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extLink = "text-lvinit-blue underline underline-offset-4";

function SnapshotPanel() {
  return (
    <section id="latest" aria-label="Las Vegas housing market snapshot" className="scroll-mt-24">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            The latest numbers
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            Las Vegas Realtors&rsquo; September 2026 report, released October 6.
            Sources at the end.
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
            Last updated October 7, 2026. This page is updated in place each
            month as new LVR data lands; the figures above are the dated snapshot.
          </p>
        </div>
      </Container>
    </section>
  );
}

export default function LasVegasHousingMarketPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Market Watch",
        headline: "Las Vegas Housing Market: Prices, Inventory and Sales Right Now",
        subheadline:
          "The single-family median slipped to $470,000 in September, about 4% under the record, while sales fell and supply grew. The latest numbers and what they mean for buyers, sellers and owners. Updated in place.",
        image: "/images/hero/las-vegas-suburban-homes-mountains-aerial-drone.webp",
        imageAlt:
          "Aerial drone view of a Las Vegas suburban neighborhood: rows of tile-roofed homes and curving streets in the foreground, open desert beyond, and a mountain range under a blue sky with scattered clouds.",
        backLink: { label: "Guides", href: "/guides" },
        ctas: [{ label: "See the latest numbers", href: "#latest", variant: "primary" }],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "The market numbers are one input. Here is how they connect to rates, budgets and the buying decision.",
        stories: [
          {
            name: "Las Vegas Mortgage Rates: Where They Are and What They Do to Your Payment",
            href: "/guides/las-vegas-mortgage-rates",
            category: "Market Watch",
            dek: "The latest Freddie Mac print and the payment math on a Las Vegas loan.",
          },
          {
            name: "Is Las Vegas a Buyer's Market Right Now?",
            href: "/guides/is-las-vegas-a-buyers-market",
            category: "Buyer Guide",
            dek: "What buyers can negotiate, and when waiting makes sense.",
          },
          {
            name: "Will Las Vegas Home Prices Drop?",
            href: "/guides/will-las-vegas-home-prices-drop",
            category: "Market Watch",
            dek: "Why rising inventory hasn't pulled prices down the way many expected.",
          },
          {
            name: "What $500K Buys in Las Vegas",
            href: "/guides/what-500k-buys-in-las-vegas",
            category: "Buyer Guide",
            dek: "What a real budget gets you across the valley.",
          },
        ],
      }}
      ctas={{
        heading: "Want to know what these numbers mean for your move?",
        body:
          "A valley-wide median is a starting point, not your neighborhood or your budget. Tell me what you're planning and I'll walk you through what it realistically looks like right now. No sales pitch.",
      }}
    >
      <StoryLede
        kicker="Market Watch"
        lead="Las Vegas Realtors' September 2026 report put the median single-family price at $470,000, down 1.1% from August and the same as a year earlier. That is $20,000, or about 4%, below the $490,000 record set in May and June."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Sales fell 7.4% for single-family homes and 12.6% for condos and
          townhomes compared with September 2025, and the number of homes
          listed without an offer keeps climbing. This is the page I keep
          current for where the Las Vegas market stands. I update it in place
          each month instead of publishing a new article every time LVR
          releases data.
        </p>
      </StoryLede>

      <SnapshotPanel />

      <StoryVideo
        id="watch"
        eyebrow="Watch"
        heading="Prefer the quick version?"
        intro="I walk through why the Las Vegas market has shifted toward buyers, and the catch: mortgage rates around 7%. Watch it here, then pick up with the numbers below."
        youtubeId="aMeXy1frj-o"
        title="The Las Vegas Housing Market Finally Shifted… But There's a Catch | Mikey Del Rosario, LVINIT"
      />

      <StorySection heading="Where the median has been since the peak">
        <p className="text-body-lg text-lvinit-warmgray">
          The single-family median is the midpoint of every existing home sold
          that month. It has stepped down three months running from the record:
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-body text-lvinit-warmgray">
            <thead>
              <tr className="border-b border-lvinit-lightgray text-left text-caption uppercase tracking-wide text-lvinit-warmgray">
                <th className="py-3 pr-4 font-normal">Month</th>
                <th className="py-3 pr-4 font-normal">Single-family median</th>
                <th className="py-3 font-normal">Context</th>
              </tr>
            </thead>
            <tbody>
              {TREND.map((t) => (
                <tr key={t.month} className="border-b border-lvinit-lightgray last:border-0">
                  <td className="py-3 pr-4 text-lvinit-black">{t.month}</td>
                  <td className="py-3 pr-4 text-lvinit-black">{t.median}</td>
                  <td className="py-3">{t.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Each step is small, and September matches September 2025 exactly. This
          is a market easing off a peak, not one in free fall. The month-by-month
          detail is in our{" "}
          <Link href="/guides/las-vegas-home-prices-july-2026" className={link}>
            July
          </Link>{" "}
          and{" "}
          <Link href="/guides/las-vegas-home-prices-august-2026" className={link}>
            August
          </Link>{" "}
          write-ups, and{" "}
          <Link href="/guides/will-las-vegas-home-prices-drop" className={link}>
            why prices haven&rsquo;t fallen faster
          </Link>{" "}
          is its own explainer.
        </p>
      </StorySection>

      <StorySection muted heading="What the rest of the report says">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">More to choose from.</span>{" "}
              7,995 single-family homes and 2,796 condos and townhomes were
              listed without an offer at the end of September, up 6.6% and 7.3%
              from a year earlier. LVR puts supply at about five months, up from
              roughly four a year ago.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Homes are still moving.</span>{" "}
              75.9% of single-family homes sold within 60 days, up from 72.0% a
              year earlier. For condos and townhomes it was 70.5%, up from 67.0%.
              Fewer homes are selling, but the ones that sell are not sitting
              longer than they did last year.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Cash is steady, distress is small.</span>{" "}
              Cash was 23.5% of sales (23.0% a year ago). Short sales and
              foreclosures together were 1.1% of sales, up from 0.5% but still a
              very small slice.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">LVR points at rates.</span>{" "}
              LVR President George Kypreos said: &ldquo;Recently rising mortgage
              rates are playing a bigger role in the housing market.&rdquo; See
              where rates stand on our{" "}
              <Link href="/guides/las-vegas-mortgage-rates" className={link}>
                mortgage-rates page
              </Link>
              .
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="What this actually means">
        <h3 className="font-display text-heading-sm font-bold text-lvinit-black">
          If you are buying
        </h3>
        <p className="mt-3 text-body-lg text-lvinit-warmgray">
          You have more inventory and a median that is no longer climbing, which
          is real leverage on price, repairs and closing help. The offset is the
          rate: the same loan costs more per month than it did in late summer.
          Judge a home by the payment, not the median. The{" "}
          <Link href="/guides/is-las-vegas-a-buyers-market" className={link}>
            buyer&rsquo;s-market guide
          </Link>{" "}
          covers what to negotiate, and{" "}
          <Link href="/guides/las-vegas-down-payment-assistance-programs-2026" className={link}>
            down-payment assistance
          </Link>{" "}
          can change the loan itself. If you are weighing a builder, see{" "}
          <Link href="/guides/buying-new-construction-las-vegas" className={link}>
            how buying new construction works
          </Link>
          .
        </p>
        <h3 className="mt-8 font-display text-heading-sm font-bold text-lvinit-black">
          If you are selling
        </h3>
        <p className="mt-3 text-body-lg text-lvinit-warmgray">
          Pricing off the May-June peak is a risk. With about five months of
          supply and buyers who can see plenty of alternatives, price to
          today&rsquo;s closed sales, not spring&rsquo;s. Three out of four
          single-family homes still sold within 60 days in September, so
          well-priced homes are moving. Recent closed sales near you matter more
          than a valley-wide median.
        </p>
        <h3 className="mt-8 font-display text-heading-sm font-bold text-lvinit-black">
          If you own and are not selling
        </h3>
        <p className="mt-3 text-body-lg text-lvinit-warmgray">
          A median that is flat year over year and about 4% below its peak is
          not a reason to panic. It is a reason not to count on the spring
          numbers if you are planning a sale or a refinance.
        </p>
        <h3 className="mt-8 font-display text-heading-sm font-bold text-lvinit-black">
          If you are moving here
        </h3>
        <p className="mt-3 text-body-lg text-lvinit-warmgray">
          Valley-wide numbers hide big differences between areas. Start with{" "}
          <Link href="/guides/moving-to-las-vegas" className={link}>
            Moving to Las Vegas: Where to Start
          </Link>
          , pick the part of the valley first, then price it. The{" "}
          <Link href="/guides/what-500k-buys-in-las-vegas" className={link}>
            $500K guide
          </Link>{" "}
          and{" "}
          <Link href="/guides/las-vegas-starter-home-prices-2026" className={link}>
            starter-home prices
          </Link>{" "}
          show what budgets look like on the ground, and the{" "}
          <Link href="/guides/las-vegas-new-home-sales-july-2026" className={link}>
            new-home sales data
          </Link>{" "}
          covers the builder side.
        </p>
      </StorySection>

      <StorySection muted heading="How to read a valley-wide number">
        <p className="text-body-lg text-lvinit-warmgray">
          LVR&rsquo;s figures cover the whole Las Vegas valley and existing
          homes only. A median is a midpoint: it can move because the mix of
          homes that sold changed, not just because prices did. It says little
          about Summerlin, Henderson, North Las Vegas or any single street. For
          a specific area, start with the{" "}
          <Link href="/neighborhoods/summerlin" className={link}>
            Summerlin
          </Link>
          ,{" "}
          <Link href="/neighborhoods/henderson" className={link}>
            Henderson
          </Link>
          ,{" "}
          <Link href="/neighborhoods/southwest-las-vegas" className={link}>
            Southwest
          </Link>{" "}
          or{" "}
          <Link href="/neighborhoods/north-las-vegas" className={link}>
            North Las Vegas
          </Link>{" "}
          guides, then{" "}
          <Link href="/search" className={link}>
            look at what is actually on the market
          </Link>
          . This page does not predict where prices go next.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Las Vegas Realtors (LVR)</span>,
            September 2026 housing report, released October 6, 2026. LVR&rsquo;s
            own site was unreachable when this was written, so the figures were
            checked against three outlets carrying the release:{" "}
            <a
              href="https://nevadabusiness.com/2026/10/lvr-reports-fewer-homes-selling-as-interest-rates-rise/"
              className={extLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Nevada Business Magazine
            </a>
            ,{" "}
            <a
              href="https://www.fox5vegas.com/2026/10/06/las-vegas-realtors-report-fewer-homes-selling-interest-rates-rise/"
              className={extLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Fox 5 Vegas
            </a>{" "}
            and{" "}
            <a
              href="https://news3lv.com/news/instagram/fewer-homes-sell-around-las-vegas-in-september-amid-rising-interest-rates"
              className={extLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              News 3 LV
            </a>
            . Cash, 60-day and distressed-sale shares come from the first two.
          </li>
          <li>
            <span className="text-lvinit-black">LVINIT&rsquo;s earlier coverage</span>{" "}
            of LVR&rsquo;s{" "}
            <Link href="/guides/las-vegas-home-prices-july-2026" className={extLink}>
              July
            </Link>{" "}
            and{" "}
            <Link href="/guides/las-vegas-home-prices-august-2026" className={extLink}>
              August
            </Link>{" "}
            reports for the $480,000 and $475,000 medians. The &ldquo;$20,000,
            about 4% below the record&rdquo; figure is simple arithmetic on
            $490,000 and $470,000.
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Market statistics change monthly and describe the past. This page is
          general market commentary, not financial, lending, tax or investment
          advice.
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
