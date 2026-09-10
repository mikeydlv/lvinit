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
// MARKET WATCH — mortgage rates, not sale prices. Built via the autonomous
// scheduled editorial-publishing routine. Grepped the repo for "mortgage
// rate," "Freddie Mac," and "PMMS" before writing: rates are mentioned only
// in passing inside will-las-vegas-home-prices-drop,
// las-vegas-starter-home-prices-2026, first-summer-in-vegas, and
// las-vegas-down-payment-assistance-programs-2026 (and the two July 2026
// Market Watch pieces cite single PMMS weekly prints for date-stamping only).
// No existing LVINIT piece is dedicated to the rate move itself — this one
// fills that gap with fresh news, not a restatement.
//
// FACT DISCIPLINE (read before editing) — every figure independently
// re-verified this run, not taken on secondhand summary:
//
// - Primary source: Freddie Mac Primary Mortgage Market Survey (PMMS),
//   freddiemac.com/pmms, week of September 3, 2026. Directly fetched.
//     30-year FRM: 6.71%, up from 6.66% the prior week (+5 bps).
//     15-year FRM: 6.04%, up from 5.98% the prior week (+6 bps).
//     One year ago (September 2025): 30-year 6.50%; 15-year 5.60%.
//   Also confirmed via the official release on GlobeNewswire (Sept 3, 2026,
//   "Mortgage Rates Average 6.71%") and Freddie Mac's own investor-relations
//   mirror (freddiemac.gcs-web.com). Freddie Mac's Chief Economist Sam
//   Khater's quote, from the same release: "Purchase demand has remained
//   relatively stable indicating steady interest from buyers adapting to
//   evolving market conditions." Freddie Mac's own release does not forecast
//   where rates go next — none is added here either.
// - "13-month high" framing: NOT a phrase pulled from Freddie Mac's own
//   release (its release states the rate and the week-over-week/year-over-
//   year change, not a "highest since" framing). Independently corroborated
//   via wire-service coverage of the same release: an AP report syndicated
//   by Yahoo Finance, WTOP, and KSAT all describe the 6.71% print as "its
//   highest level in 13 months," and separately report the rate hadn't been
//   this high since July 31, 2025 (6.72%) — three independent outlets
//   carrying the same wire copy, which clears the sourcing bar for this
//   claim. CNN's coverage separately frames it as "a new high for 2026."
// - Local price/inventory context: reused, not re-derived, from LVINIT's own
//   already-published, already-sourced las-vegas-home-prices-july-2026
//   piece — Las Vegas Realtors' (LVR) official July 2026 report: median
//   existing single-family price $480,000 (-1.0% YoY, -2.0% off the
//   $490,000 record set in May/June 2026); 7,442 single-family homes listed
//   without offers (+4.1% YoY); supply near 4 months; 80.0% of single-family
//   homes sold within 60 days (up from 78.8% YoY). Quote, LVR President
//   George Kypreos, from that same LVR release (already sourced on-site).
// - Checked directly for an LVR August 2026 report before writing (LVR's own
//   site and Review-Journal coverage): NOT YET PUBLISHED as of this run. The
//   only August figures findable were on uncorroborated real-estate-blog
//   sites (a Substack investment-market report and a couple of lead-gen
//   sites), not LVR itself or a newsroom citing LVR — explicitly rejected
//   per the same sourcing standard already applied elsewhere on this site.
//   Do NOT add an August 2026 median, "$485K," or similar figure anywhere in
//   this piece; the July 2026 LVR figures are the most current verified
//   local data available.
// - The payment-math walkthrough below is explicitly labeled hypothetical
//   (a $480,000 loan scenario, tied to the already-sourced LVR median) —
//   arithmetic on the two verified PMMS rates, not a new market claim. No
//   taxes/insurance/PMI are folded in; the note beneath it says so.
// - No prediction about where rates go next is included anywhere in this
//   piece — Freddie Mac's own release contains none, so none is added.
//
// IMAGERY — originally published photoless (C:\LVINIT\Images unreachable
// from this cloud session; a generated LVINIT editorial cover registered in
// lib/content.ts as the card image only — command preserved for history:
//   node scripts/generate-guide-cover.mjs --slug las-vegas-mortgage-rates-september-2026 \
//     --category "Market Watch" --subject "MORTGAGE RATES" \
//     --out las-vegas-mortgage-rates-editorial-cover.webp).
// On 2026-09-10, Mikey supplied an AI-generated hero graphic directly and
// explicitly approved bypassing CLAUDE.md's no-AI-imagery default for this
// one piece. It is not real photography, carries no photo credit (his
// request), and is used for both the story hero and the /guides card —
// public/images/hero/las-vegas-mortgage-rates-september-2026-hero.webp.
// ---------------------------------------------------------------------------

const PATH = "/guides/las-vegas-mortgage-rates-september-2026";

const meta: StoryMeta = {
  title:
    "Mortgage Rates Hit a 13-Month High — What It Means for Las Vegas Buyers | LVINIT",
  headline:
    "Mortgage Rates Just Hit a 13-Month High. Here's What It Actually Means for Las Vegas Buyers.",
  description:
    "Freddie Mac's 30-year average climbed to 6.71% the week of September 3, 2026, its highest level in 13 months. Here's what that does to a Las Vegas buyer's monthly payment, in a market LVR itself already calls more balanced than it's been in years.",
  path: PATH,
  datePublished: "2026-09-07",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    {
      name: "Mortgage Rates Hit a 13-Month High",
      path: PATH,
    },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

// FAQ JSON-LD — answers drawn only from the cited, dated figures above.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the current mortgage rate in Las Vegas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Las Vegas mortgage rates track the national average Freddie Mac publishes weekly, not a separate local rate. As of the week of September 3, 2026, Freddie Mac's Primary Mortgage Market Survey put the average 30-year fixed rate at 6.71% and the 15-year fixed rate at 6.04%. A specific buyer's actual rate depends on credit score, down payment, loan type, and lender, and can run above or below the survey average.",
      },
    },
    {
      "@type": "Question",
      name: "Why did mortgage rates just hit a 13-month high?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Freddie Mac's own September 3, 2026 release doesn't state a cause, only the rate itself: 6.71% on the 30-year, up from 6.66% the week before. Freddie Mac's Chief Economist Sam Khater described purchase demand as \"relatively stable\" even as rates rose, rather than attributing the increase to a single factor.",
      },
    },
    {
      "@type": "Question",
      name: "Do higher mortgage rates mean Las Vegas home prices will drop?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not automatically, and LVR's most recent verified data doesn't show that yet. The July 2026 LVR report already showed a market with more inventory and a small pullback from the May/June record ($480,000, down 2% from the record). Rates rising further adds pressure on the demand side, but price is set by both supply and demand together — this piece doesn't forecast where prices go next, because no source cited here does either.",
      },
    },
  ],
};

// Verified snapshot for the stat panel. Every figure is sourced in the
// article's own "Sources" section.
type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "6.71%",
    label: "Average 30-year fixed rate",
    note: "Week of Sept 3, 2026, up from 6.66% · Freddie Mac PMMS",
  },
  {
    value: "6.04%",
    label: "Average 15-year fixed rate",
    note: "Week of Sept 3, 2026, up from 5.98% · Freddie Mac PMMS",
  },
  {
    value: "13 months",
    label: "How long since the 30-year was this high",
    note: "Last seen July 31, 2025, at 6.72% · wire coverage of the same release",
  },
  {
    value: "$480,000",
    label: "Las Vegas single-family median",
    note: "July 2026, most recent verified LVR figure",
  },
];

function SnapshotPanel() {
  return (
    <section
      id="by-the-numbers"
      aria-label="Mortgage rate snapshot"
      className="scroll-mt-24"
    >
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            The rate move, by the numbers
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            Freddie Mac&rsquo;s weekly national average, alongside the most
            recent verified Las Vegas price figure for context. Sources at the
            end of this article.
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
            Data reflects the reporting periods cited and changes weekly. See
            the sources at the end of this article for the full research.
          </p>
        </div>
      </Container>
    </section>
  );
}

export default function LasVegasMortgageRatesSeptember2026Page() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Market Watch",
        headline:
          "Mortgage Rates Just Hit a 13-Month High. Here's What It Actually Means for Las Vegas Buyers.",
        subheadline:
          "Freddie Mac's average 30-year rate climbed to 6.71% the week of September 3, 2026 — its highest print in over a year. Here's the actual math on what that does to a monthly payment, in a Las Vegas market that already has more room to negotiate than it's had in a long time.",
        // Mikey-supplied AI-generated graphic, added 2026-09-10 with his
        // explicit approval to bypass CLAUDE.md's no-AI-imagery default for
        // this one piece — not a real photograph, no credit per his request.
        image: "/images/hero/las-vegas-mortgage-rates-september-2026-hero.webp",
        imageAlt:
          "Editorial graphic of a Las Vegas home with mountain and skyline backdrop, with a stat callout reading Mortgage Rates 6.71%, September 2026",
        backLink: { label: "LVINIT", href: "/" },
        ctas: [
          { label: "See the numbers", href: "#by-the-numbers", variant: "primary" },
        ],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "The rate is one half of what a home actually costs a buyer. Here's the other half, and what it looks like to actually get into the market at today's numbers.",
        stories: [
          {
            name: "Las Vegas Home Prices Dipped Again in August 2026",
            href: "/guides/las-vegas-home-prices-august-2026",
            category: "Market Watch",
            dek: "LVR's most recent verified valley-wide median and inventory numbers — and LVR's own president pointing at rising rates as a reason sales slowed.",
          },
          {
            name: "Las Vegas Home Prices Pulled Back From Their Record High in July 2026",
            href: "/guides/las-vegas-home-prices-july-2026",
            category: "Market Watch",
            dek: "The prior month's report — the price side of this same math, one reporting period earlier.",
          },
          {
            name: "Las Vegas Starter Homes Have More Than Doubled Since 2016",
            href: "/guides/las-vegas-starter-home-prices-2026",
            category: "Market Watch",
            dek: "The entry tier of the market, and a local mortgage advisor's take on how higher rates have already cut buying power.",
          },
          {
            name: "You Don't Need 20% Down To Buy a Home in Las Vegas",
            href: "/guides/las-vegas-down-payment-assistance-programs-2026",
            category: "Buyer Guide",
            dek: "Real loan-type minimums and Nevada's down-payment-assistance programs — the other lever besides the rate itself.",
          },
        ],
      }}
      ctas={{
        heading: "Trying to figure out what today's rate actually does to your number?",
        body:
          "A national average is a starting point, not your quote. Your actual rate depends on your credit, your down payment, and your lender. Tell me your target budget and I'll walk you through what it realistically looks like right now, rate included. No sales pitch.",
      }}
    >
      <StoryLede
        kicker="Market Watch"
        lead="Freddie Mac's weekly survey put the average 30-year fixed mortgage rate at 6.71% for the week of September 3, 2026 — up from 6.66% the week before, and the highest that average has been in 13 months. If you've been sitting on the sidelines waiting for rates to ease, this week's print moved in the wrong direction. Here's what that actually does to a Las Vegas buyer's math, and why it isn't the whole story."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          The last time the 30-year average was this high was{" "}
          <span className="text-lvinit-black">July 31, 2025</span>, at 6.72%.
          The 15-year average moved the same direction, to{" "}
          <span className="text-lvinit-black">6.04%</span> from 5.98%. Both
          numbers are still below where they sat during the highest points of
          the last few years, but the direction, not just the level, is
          what&rsquo;s worth paying attention to right now.
        </p>
      </StoryLede>

      <StorySection heading="What actually happened this week">
        <p className="text-body-lg text-lvinit-warmgray">
          Freddie Mac&rsquo;s Primary Mortgage Market Survey (PMMS) is the
          benchmark most of the industry quotes when it says &ldquo;mortgage
          rates.&rdquo; It&rsquo;s a national weekly average, not a Las Vegas
          number specifically — there&rsquo;s no separate Las Vegas mortgage
          rate; local buyers borrow against the same national market
          everyone else does, with their own rate then set by their credit,
          down payment, loan type, and lender.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          This week&rsquo;s release: the 30-year fixed averaged{" "}
          <span className="text-lvinit-black">6.71%</span>, up from 6.66% the
          prior week. The 15-year fixed averaged{" "}
          <span className="text-lvinit-black">6.04%</span>, up from 5.98%.
          Both are up from a year earlier too — 6.50% and 5.60%, respectively,
          in September 2025. Freddie Mac&rsquo;s own release doesn&rsquo;t
          frame this as a milestone; it just states the number. The
          &ldquo;13-month high&rdquo; framing comes from wire-service coverage
          of the same release, which independently traced the last time the
          30-year average was this high back to July 31, 2025.
        </p>
      </StorySection>

      <SnapshotPanel />

      <StorySection heading="What a rate move like this actually does to a payment">
        <p className="text-body-lg text-lvinit-warmgray">
          Rates get discussed in headlines as a single number, but what
          actually matters to a buyer is the payment. Here&rsquo;s a{" "}
          <span className="text-lvinit-black">hypothetical example</span>,
          not a real transaction: a $480,000 loan — the size of LVR&rsquo;s
          most recently verified Las Vegas single-family median, not a
          specific home or buyer — run at two different 30-year rates from
          this year&rsquo;s survey.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-body text-lvinit-warmgray">
            <thead>
              <tr className="border-b border-lvinit-lightgray text-left text-caption uppercase tracking-wide text-lvinit-warmgray">
                <th className="py-3 pr-4 font-normal">Rate (30-year fixed)</th>
                <th className="py-3 pr-4 font-normal">Principal &amp; interest, monthly</th>
                <th className="py-3 font-normal">On a $480,000 loan</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-lvinit-lightgray">
                <td className="py-3 pr-4 text-lvinit-black">6.50%</td>
                <td className="py-3 pr-4 text-lvinit-black">$3,034</td>
                <td className="py-3">September 2025&rsquo;s average</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-lvinit-black">6.71%</td>
                <td className="py-3 pr-4 text-lvinit-black">$3,101</td>
                <td className="py-3">This week&rsquo;s average</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That&rsquo;s roughly{" "}
          <span className="text-lvinit-black">$67 more a month</span>, or
          about <span className="text-lvinit-black">$800 a year</span>, in
          principal and interest alone on the same loan amount — before
          property taxes, homeowners insurance, HOA dues, or mortgage
          insurance, none of which are included in this figure. It&rsquo;s
          not a dramatic swing on its own. It&rsquo;s also not nothing,
          especially stacked against a year of similar moves — the real
          effect of higher rates shows up less in any single week and more
          in how much loan a given monthly budget can actually support.
        </p>
      </StorySection>

      <StoryPullQuote cite="Sam Khater, Freddie Mac Chief Economist">
        Purchase demand has remained relatively stable indicating steady
        interest from buyers adapting to evolving market conditions.
      </StoryPullQuote>

      <StorySection muted heading="The part rate headlines usually leave out: the Las Vegas market itself has shifted too">
        <p className="text-body-lg text-lvinit-warmgray">
          A rate story lands differently depending on the market underneath
          it. LVR&rsquo;s most recently verified report — July 2026, the most
          current available as of this piece; an August report had not yet
          been published — showed the Las Vegas single-family median at{" "}
          <Link
            href="/guides/las-vegas-home-prices-july-2026"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            $480,000, down 2% from the record set in May and June
          </Link>
          , with more single-family homes sitting without offers than a year
          earlier and supply running near four months. That&rsquo;s not a
          market in freefall — LVR President George Kypreos described demand
          as steady in that same report — but it is a market with
          meaningfully more room to negotiate than the tightest points of the
          last few years.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Put those two facts next to each other and the honest read isn&rsquo;t
          simply &ldquo;rates up, bad time to buy.&rdquo; It&rsquo;s that the
          math changed on both sides at once: borrowing costs a little more
          this week than they did last week, in a market that&rsquo;s already
          giving buyers more negotiating leverage on price, seller
          concessions, and closing costs than it has in a while. Whether that
          nets out better or worse for a specific buyer depends entirely on
          their own number, not on the rate headline alone.
        </p>
      </StorySection>

      <StorySection heading="What this actually changes for someone shopping right now">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              A locked rate matters more than a survey average. Freddie
              Mac&rsquo;s number is a national weekly benchmark — what a
              specific lender quotes a specific buyer depends on credit
              score, down payment, loan type, and points paid, and can land
              meaningfully above or below 6.71%.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              More inventory and softer prices give buyers leverage that
              didn&rsquo;t exist a few years ago — a seller-paid rate buydown
              or closing-cost credit can offset a rate move like this one
              more directly than waiting for rates to drop on their own.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              If the rate is the obstacle rather than the price,{" "}
              <Link
                href="/guides/las-vegas-down-payment-assistance-programs-2026"
                className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
              >
                a larger down payment or a down-payment-assistance program
              </Link>{" "}
              changes the loan amount the rate applies to, which is worth
              running alongside any rate-buydown conversation with a lender.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              This piece makes no prediction about where rates go from here.
              Freddie Mac&rsquo;s own release doesn&rsquo;t forecast, and
              neither does this article — plan around what a rate does to
              your payment today, not a guess about next month.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Mikey's local take">
        <p className="text-body-lg text-lvinit-warmgray">
          The number I&rsquo;d actually sit with here isn&rsquo;t 6.71% —
          it&rsquo;s $67 a month on a $480,000 loan. That&rsquo;s a real cost,
          but it&rsquo;s a manageable one, and it&rsquo;s smaller than what a
          decent seller concession or rate buydown can offset in the current
          market. The bigger mistake I see buyers make isn&rsquo;t buying at
          6.71% instead of 6.50%. It&rsquo;s waiting on the sidelines for a
          rate that may or may not show up, in a market that&rsquo;s already
          giving them more room on price and terms than it has in years.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If you&rsquo;re trying to figure out whether this week&rsquo;s rate
          actually changes your plan, run your real number instead of the
          headline one. See what a{" "}
          <Link
            href="/guides/las-vegas-starter-home-prices-2026"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            starter-tier budget
          </Link>{" "}
          or a{" "}
          <Link
            href="/guides/what-500k-buys-in-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            $500K budget
          </Link>{" "}
          actually gets you today, then{" "}
          <Link
            href="/search"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            look at what&rsquo;s actually on the market
          </Link>{" "}
          at that number.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Freddie Mac</span>, Primary
            Mortgage Market Survey (PMMS), week of September 3, 2026. The
            source for the 30-year and 15-year rate figures, the
            week-over-week and year-over-year comparisons, and the quote from
            Chief Economist Sam Khater. Directly fetched from{" "}
            <a
              href="https://www.freddiemac.com/pmms"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              freddiemac.com/pmms
            </a>{" "}
            and cross-checked against the official release on{" "}
            <a
              href="https://www.globenewswire.com/news-release/2026/09/03/3356148/0/en/mortgage-rates-average-6-71.html"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              GlobeNewswire
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">
              Wire-service coverage of the same release
            </span>{" "}
            — the source for the &ldquo;13-month high&rdquo; framing and the
            July 31, 2025 (6.72%) reference point, independently reported by{" "}
            <a
              href="https://finance.yahoo.com/real-estate/articles/freddie-mac-says-average-rate-160100149.html"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Yahoo Finance
            </a>
            ,{" "}
            <a
              href="https://wtop.com/national/2026/09/freddie-mac-says-the-average-rate-on-a-30-year-mortgage-rose-to-6-71-this-week-its-highest-level-in-13-months"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              WTOP
            </a>
            , and{" "}
            <a
              href="https://www.ksat.com/business/2026/09/03/average-rate-on-a-30-year-mortgage-climbs-to-highest-level-in-13-months/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              KSAT
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Las Vegas Realtors (LVR)</span>
            . Official July 2026 housing report — the source for the $480,000
            valley-wide single-family median, the inventory and days-on-market
            figures, and the quote from LVR President George Kypreos cited for
            local context. Full detail and sourcing in{" "}
            <Link
              href="/guides/las-vegas-home-prices-july-2026"
              className="text-lvinit-blue underline underline-offset-4"
            >
              our July 2026 resale coverage
            </Link>
            . An LVR report for August 2026 had not been published as of this
            article; no August figure is asserted anywhere above.
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Mortgage rates and market conditions change weekly and can move
          again before you read this. The payment example above is a
          hypothetical illustration of principal and interest only — it
          excludes taxes, insurance, HOA dues, and mortgage insurance, and is
          not a quote. This article is general market commentary, not
          financial, lending, tax, or investment advice.
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
