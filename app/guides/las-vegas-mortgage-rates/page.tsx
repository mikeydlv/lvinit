import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import Container from "@/components/ui/Container";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// MARKET WATCH — the evergreen Las Vegas mortgage-rates page (D1,
// docs/LVINIT_CONTENT_CLUSTER_MAP.md, queue #4). One undated URL, UPDATED IN
// PLACE. Do not spawn a new dated rate URL for a new weekly print (hold H1).
//
// UPDATING IN PLACE: each Thursday's print goes into SNAPSHOT, the PRINTS
// table, the payment table, the lede/hero copy and Sources. Bump
// `dateModified`. Leave the explanatory sections alone unless a fact in them
// changed. The three older dated installments
// (las-vegas-mortgage-rates-september-2026, -approach-7-percent, -19-month-high)
// are untouched historical snapshots.
//
// FACT DISCIPLINE — verified 2026-10-05 by direct fetch:
// - Freddie Mac PMMS (freddiemac.com/pmms and /pmms/pmms_archives), week of
//   Oct 1, 2026: 30-year 7.28% (prior week 7.03%, year ago 6.34%); 15-year
//   6.60% (prior week 6.42%, year ago 5.55%). Archive shows Sept 24 = 7.03% /
//   6.42% and Sept 17 = 6.95% / 6.26%.
// - Aug 20 - Sept 10 prints (6.65, 6.66, 6.71, 6.76) are carried from LVINIT's
//   own earlier pieces, each verified against Freddie Mac when published.
//   Seven prints, six straight weekly increases (arithmetic on the table).
// - "Highest since Nov 22, 2023 (7.29%)": not Freddie Mac's own phrasing;
//   Fox Business coverage of the release states it, and search-result
//   summaries of the AP/Real Deal coverage agree. The Freddie archive page
//   fetched shows only the three most recent weeks, so the 2023 print itself
//   was not independently opened; it is attributed, not asserted.
// - Local price context: LVR August 2026 median single-family $475,000
//   (see /guides/las-vegas-home-prices-august-2026). LVR's September report
//   was not out as of 2026-10-05; none is asserted.
// - Payment table: principal & interest only, 30-year amortization, $475,000
//   loan, computed independently; labeled hypothetical.
// CLAIMS DELIBERATELY NOT MADE: any rate forecast; a single cause for the
// move (Freddie Mac names none); the Fox-cited 10-year yield and economist
// quotes (not independently re-verified); any local lender rate.
//
// IMAGERY — existing Mikey-owned Las Vegas residential aerial already in the
// repo (hero/las-vegas-residential-neighborhood-aerial-drone.webp, live on the
// DPA and August-prices pages). C:\LVINIT\Images is a Windows path and is not
// reachable from this Linux cloud session.
// ---------------------------------------------------------------------------

const PATH = "/guides/las-vegas-mortgage-rates";

const meta: StoryMeta = {
  title: "Las Vegas Mortgage Rates: Where They Are and What They Do to Your Payment | LVINIT",
  headline: "Las Vegas Mortgage Rates: Where They Are and What They Do to Your Payment",
  description:
    "Freddie Mac's 30-year fixed average hit 7.28% the week of October 1, 2026, the highest since November 2023. The latest print, the weekly history, and what a rate move does to a Las Vegas payment. Updated in place.",
  path: PATH,
  datePublished: "2026-10-05",
  dateModified: "2026-10-05",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Las Vegas Mortgage Rates", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are mortgage rates in Las Vegas right now?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mortgage rates are set nationally, not by city. Freddie Mac's weekly survey put the average 30-year fixed rate at 7.28% for the week of October 1, 2026, up from 7.03% the week before, with the 15-year at 6.60%. Your own quote depends on credit score, down payment, loan type, points and lender, and can land above or below the published average.",
      },
    },
    {
      "@type": "Question",
      name: "Are Las Vegas mortgage rates different from the national rate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not by geography. Lenders price off the same national bond market. What differs is the individual loan: credit, down payment, occupancy, loan type and any points or seller-paid buydown. Local factors, such as how much negotiating room sellers and builders offer, affect the deal around the rate rather than the rate itself.",
      },
    },
    {
      "@type": "Question",
      name: "How much does a higher rate add to a Las Vegas payment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On a hypothetical $475,000 loan, 30-year fixed, principal and interest only, moving from 6.65% to 7.28% adds roughly $200 a month. That example excludes taxes, insurance, HOA dues and mortgage insurance, and it is an illustration, not a quote.",
      },
    },
    {
      "@type": "Question",
      name: "Will mortgage rates go down?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nobody can say reliably, and this page does not forecast. A more useful test is whether the payment works at today's rate. If it only works at a lower rate, waiting can be reasonable; if it works today, waiting on a guess has its own cost.",
      },
    },
  ],
};

type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "7.28%",
    label: "Average 30-year fixed rate",
    note: "Week of Oct 1, 2026, up from 7.03% · Freddie Mac PMMS",
  },
  {
    value: "6.60%",
    label: "Average 15-year fixed rate",
    note: "Week of Oct 1, 2026, up from 6.42% · Freddie Mac PMMS",
  },
  {
    value: "6.34%",
    label: "30-year, one year earlier",
    note: "Same week of 2025 · Freddie Mac PMMS",
  },
  {
    value: "$475,000",
    label: "Las Vegas single-family median",
    note: "August 2026, most recent verified LVR figure",
  },
];

const PRINTS: { week: string; r30: string; r15: string }[] = [
  { week: "Aug 20, 2026", r30: "6.65%", r15: "5.95%" },
  { week: "Aug 27, 2026", r30: "6.66%", r15: "5.98%" },
  { week: "Sept 3, 2026", r30: "6.71%", r15: "6.04%" },
  { week: "Sept 10, 2026", r30: "6.76%", r15: "6.09%" },
  { week: "Sept 17, 2026", r30: "6.95%", r15: "6.26%" },
  { week: "Sept 24, 2026", r30: "7.03%", r15: "6.42%" },
  { week: "Oct 1, 2026", r30: "7.28%", r15: "6.60%" },
];

const PAYMENTS: { rate: string; pi: string; note: string }[] = [
  { rate: "6.65%", pi: "$3,049", note: "Aug 20 print, the low before this run of increases" },
  { rate: "7.03%", pi: "$3,170", note: "Sept 24 print" },
  { rate: "7.28%", pi: "$3,250", note: "Oct 1 print, latest" },
  { rate: "6.50%", pi: "$3,002", note: "Hypothetical, not a forecast" },
];

const link =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

function SnapshotPanel() {
  return (
    <section id="latest" aria-label="Mortgage rate snapshot" className="scroll-mt-24">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            The latest print
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            Freddie Mac&rsquo;s weekly national average, with the most recent
            verified Las Vegas price for scale. Sources at the end.
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
            Last updated October 5, 2026. This page is updated in place as new
            weekly prints land; the figures above are the dated snapshot.
          </p>
        </div>
      </Container>
    </section>
  );
}

export default function LasVegasMortgageRatesPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Market Watch",
        headline: "Las Vegas Mortgage Rates: Where They Are and What They Do to Your Payment",
        subheadline:
          "The 30-year fixed average hit 7.28% the week of October 1, 2026, the highest since November 2023. The latest print, the history behind it, and the payment math for a Las Vegas buyer. Updated in place.",
        image: "/images/hero/las-vegas-residential-neighborhood-aerial-drone.webp",
        imageAlt:
          "Aerial drone view of a Las Vegas residential neighborhood, with rows of tile-roofed tract homes, rooftop solar panels, and desert mountains under a blue sky in the background.",
        backLink: { label: "Guides", href: "/guides" },
        ctas: [{ label: "See the latest print", href: "#latest", variant: "primary" }],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "The rate is half of what a home costs a buyer. Here is the other half, and what to do about both.",
        stories: [
          {
            name: "Is Las Vegas a Buyer's Market Right Now?",
            href: "/guides/is-las-vegas-a-buyers-market",
            category: "Buyer Guide",
            dek: "What buyers can negotiate while rates are above 7%, and when waiting makes sense.",
          },
          {
            name: "Las Vegas Home Prices Dipped Again in August 2026",
            href: "/guides/las-vegas-home-prices-august-2026",
            category: "Market Watch",
            dek: "The valley-wide median and inventory numbers behind the payment math.",
          },
          {
            name: "You Don't Need 20% Down To Buy a Home in Las Vegas",
            href: "/guides/las-vegas-down-payment-assistance-programs-2026",
            category: "Buyer Guide",
            dek: "Loan minimums and Nevada assistance programs, the other lever besides the rate.",
          },
          {
            name: "Will Las Vegas Home Prices Drop?",
            href: "/guides/will-las-vegas-home-prices-drop",
            category: "Market Watch",
            dek: "Why rising inventory hasn't pulled prices down the way many expected.",
          },
        ],
      }}
      ctas={{
        heading: "Want to know what today's rate does to your number?",
        body:
          "A national average is a starting point, not your quote. Tell me your target budget and I'll walk you through what it realistically looks like right now, rate included. No sales pitch.",
      }}
    >
      <StoryLede
        kicker="Market Watch"
        lead="Freddie Mac's weekly survey put the average 30-year fixed rate at 7.28% for the week of October 1, 2026, up from 7.03% a week earlier. That is the sixth straight weekly increase, and by the coverage of the release, the highest average since November 2023."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Mortgage rates are not a Las Vegas number. Local buyers borrow in the
          same national market as everyone else. What is local is what that rate
          does to a Las Vegas payment, and how much room a buyer has to
          negotiate around it. This page tracks both, and I update it in place
          instead of publishing a new article every time the number moves.
        </p>
      </StoryLede>

      <SnapshotPanel />

      <StorySection heading="How we got here: seven weeks of prints">
        <p className="text-body-lg text-lvinit-warmgray">
          Freddie Mac&rsquo;s Primary Mortgage Market Survey is a weekly
          national average built from loan applications submitted to its Loan
          Product Advisor. It is the benchmark most people mean when they say
          &ldquo;the mortgage rate.&rdquo;
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-body text-lvinit-warmgray">
            <thead>
              <tr className="border-b border-lvinit-lightgray text-left text-caption uppercase tracking-wide text-lvinit-warmgray">
                <th className="py-3 pr-4 font-normal">Week of</th>
                <th className="py-3 pr-4 font-normal">30-year fixed</th>
                <th className="py-3 font-normal">15-year fixed</th>
              </tr>
            </thead>
            <tbody>
              {PRINTS.map((p) => (
                <tr key={p.week} className="border-b border-lvinit-lightgray last:border-0">
                  <td className="py-3 pr-4 text-lvinit-black">{p.week}</td>
                  <td className="py-3 pr-4 text-lvinit-black">{p.r30}</td>
                  <td className="py-3">{p.r15}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The 30-year has risen six weeks running since the August 20 low. The
          latest step, 25 basis points, is the largest of the run. A year ago
          the same survey read 6.34%, so the 30-year is running about
          nine-tenths of a point higher. Freddie Mac&rsquo;s release names no
          single cause for the move, and neither does this page.
        </p>
      </StorySection>

      <StorySection muted heading="What a rate move does to a Las Vegas payment">
        <p className="text-body-lg text-lvinit-warmgray">
          Here is a <span className="text-lvinit-black">hypothetical example</span>,
          not a real transaction: a $475,000 loan, the size of the most recent
          verified Las Vegas single-family median (LVR, August 2026), at
          different 30-year rates. Principal and interest only.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-body text-lvinit-warmgray">
            <thead>
              <tr className="border-b border-lvinit-lightgray text-left text-caption uppercase tracking-wide text-lvinit-warmgray">
                <th className="py-3 pr-4 font-normal">Rate (30-year fixed)</th>
                <th className="py-3 pr-4 font-normal">Monthly P&amp;I</th>
                <th className="py-3 font-normal">Where it comes from</th>
              </tr>
            </thead>
            <tbody>
              {PAYMENTS.map((p) => (
                <tr key={p.rate} className="border-b border-lvinit-lightgray last:border-0">
                  <td className="py-3 pr-4 text-lvinit-black">{p.rate}</td>
                  <td className="py-3 pr-4 text-lvinit-black">{p.pi}</td>
                  <td className="py-3">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          From the August low to the latest print, that is about{" "}
          <span className="text-lvinit-black">$200 more a month</span>, roughly
          $2,400 a year, on the same loan. Taxes, homeowners insurance, HOA dues
          and mortgage insurance are on top of this and are not included. Since
          rates move the payment far more than most people expect, it is worth
          running your own number before you decide a house is in or out of
          range.
        </p>
      </StorySection>

      <StorySection heading="Which rate will you actually get?">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">The published average is not a quote.</span>{" "}
              Credit score, down payment, loan type (conventional, FHA, VA),
              occupancy and points paid all move your rate. Freddie Mac&rsquo;s
              number is a national weekly average and your lender&rsquo;s daily
              pricing can sit above or below it.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Local leverage is real, but it works around the rate.</span>{" "}
              Sellers and builders can fund a rate buydown or closing-cost
              credit. How much room you have depends on the home and the
              builder; see{" "}
              <Link href="/guides/is-las-vegas-a-buyers-market" className={link}>
                Is Las Vegas a Buyer&rsquo;s Market Right Now?
              </Link>{" "}
              and, for builder incentives,{" "}
              <Link href="/guides/buying-new-construction-las-vegas" className={link}>
                Buying New Construction in Las Vegas
              </Link>
              .
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">The loan amount is the other lever.</span>{" "}
              A bigger down payment or{" "}
              <Link href="/guides/las-vegas-down-payment-assistance-programs-2026" className={link}>
                a down-payment-assistance program
              </Link>{" "}
              changes what the rate applies to.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Budget the rate you have, not the one you hope for.</span>{" "}
              If the plan only works after a refinance, it is built on a guess.
              If the payment only works at a lower rate, waiting is a fair call.
              This page does not predict where rates go.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="The price side of the same math">
        <p className="text-body-lg text-lvinit-warmgray">
          LVR&rsquo;s August report put the valley&rsquo;s median single-family
          price at $475,000, with more homes sitting without offers than a year
          ago. Details are in{" "}
          <Link href="/guides/las-vegas-home-prices-august-2026" className={link}>
            our August 2026 coverage
          </Link>
          . To see what a given budget buys at these rates, start with{" "}
          <Link href="/guides/las-vegas-starter-home-prices-2026" className={link}>
            starter-home prices
          </Link>{" "}
          or{" "}
          <Link href="/guides/what-500k-buys-in-las-vegas" className={link}>
            what $500K buys
          </Link>
          , then{" "}
          <Link href="/search" className={link}>
            look at what is actually on the market
          </Link>{" "}
          at your number. For the older step-by-step run-up, the dated
          installments are still up:{" "}
          <Link href="/guides/las-vegas-mortgage-rates-19-month-high" className={link}>
            the September 17 print
          </Link>
          .
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Freddie Mac</span>, Primary
            Mortgage Market Survey, week of October 1, 2026: the source for
            every 30-year and 15-year figure for Sept 17 through Oct 1 and the
            year-ago comparison. Directly fetched from{" "}
            <a
              href="https://www.freddiemac.com/pmms"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              freddiemac.com/pmms
            </a>{" "}
            and its{" "}
            <a
              href="https://www.freddiemac.com/pmms/pmms_archives"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              archive
            </a>
            . The Aug 20 through Sept 10 prints come from our earlier coverage,
            each checked against Freddie Mac when published.
          </li>
          <li>
            <span className="text-lvinit-black">Fox Business</span>, coverage
            of the same release (
            <a
              href="https://www.foxbusiness.com/economy/mortgage-rates-10-1-2026"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              &ldquo;Mortgage rates rise to 7.28%&rdquo;
            </a>
            ): the source for the &ldquo;highest since November 22, 2023&rdquo;
            comparison, which is the reporter&rsquo;s framing, not Freddie
            Mac&rsquo;s.
          </li>
          <li>
            <span className="text-lvinit-black">Las Vegas Realtors (LVR)</span>,
            August 2026 housing report: the $475,000 median used in the
            payment example. See{" "}
            <Link href="/guides/las-vegas-home-prices-august-2026" className="text-lvinit-blue underline underline-offset-4">
              our coverage
            </Link>
            .
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Rates change daily and can move again before you read this. The
          payment examples are hypothetical principal-and-interest
          illustrations, not quotes. This page is general market commentary, not
          financial, lending, tax or investment advice.
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
