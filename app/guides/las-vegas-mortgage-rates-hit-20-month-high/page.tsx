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
// MARKET WATCH — the third mortgage-rate sequel: la-vegas-mortgage-rates-
// september-2026 (published 2026-09-07, week-of-Sept-3 print at 6.71%) ->
// las-vegas-mortgage-rates-approach-7-percent (published 2026-09-17 in the
// registry's own dating, actually the week-of-Sept-10 print at 6.76%, plus
// daily trackers already near 7%) -> this piece. Built via the autonomous
// scheduled editorial-publishing routine on genuinely fresh news: the week
// covered here (week of Sept 17, 2026) didn't exist when the prior piece
// published, and the jump itself (+19 bps in one week, nearly 4x the size of
// any single-week move in the preceding five weeks) is independently
// well-corroborated as a genuine news event on its own, not a restatement.
//
// FACT DISCIPLINE (read before editing) — every figure independently
// verified this run via direct fetch, not taken on secondhand summary:
//
// - Primary source: Freddie Mac's Primary Mortgage Market Survey (PMMS),
//   freddiemac.com/pmms, directly fetched, release date Sept 17, 2026.
//     30-year FRM: 6.95%, up from 6.76% the prior week (+19 bps).
//     15-year FRM: 6.26%, up from 6.09% the prior week (+17 bps).
//   Year-over-year comparison (from the same release, cross-checked against
//   an independent direct fetch of journal.firsttuesday.us's own rate-
//   tracking page, which separately lists "One year ago (9/18/25): 6.26%"):
//   30-year up from 6.26% a year ago (+69 bps YoY, matching the independently
//   reported "Up 69 Basis Points From Last Year" framing); 15-year up from
//   5.41% a year ago. Sam Khater's quote is verbatim from the same release,
//   also cross-checked against the official GlobeNewswire text
//   (globenewswire.com/news-release/2026/09/17/3364253).
//   Full five-week table (all directly fetched from Freddie Mac's own
//   archive, freddiemac.com/pmms/archive):
//     Aug 13: 6.67% / 5.96%   Aug 20: 6.65% / 5.95%   Aug 27: 6.66% / 5.98%
//     Sept 3: 6.71% / 6.04%   Sept 10: 6.76% / 6.09%   Sept 17: 6.95% / 6.26%
// - "Highest since January 2025" / "20-month high" framing: NOT Freddie
//   Mac's own phrasing. Independently corroborated by a Reuters wire story
//   (headline: "US 30-year mortgage rate hits highest since January 2025,
//   Freddie Mac says," Sept 17, 2026), directly fetched via its
//   investing.com syndication and cross-checked against the same wire copy
//   picked up separately by U.S. News, TradingView, AOL, and multiple local
//   radio-station newsrooms — a single Reuters story with wide, consistent
//   syndication, which clears the same sourcing bar the two prior pieces in
//   this series used for their own "highest since" framing. The Reuters copy
//   itself carries no economist quote or causal explanation (confirmed by
//   direct fetch) — it reports the rate move only.
// - Daily-tracker context: Yahoo Finance's own Saturday, Sept 19, 2026
//   mortgage-rate roundup (headline: "Mortgage rates move lower to start the
//   weekend"), citing Zillow's lender-marketplace daily average: 30-year
//   7.04%, down 1 basis point day-over-day but still above the 7% line.
//   Deliberately not mixed with Mortgage News Daily's own, more volatile
//   daily figure, for the same reason the prior piece in this series gave —
//   different methodology, not a second disagreeing number. The point made
//   here is narrower than the prior piece's: daily trackers aren't touching
//   7% for a single day anymore, they've been sitting above it for several
//   days running.
// - No Federal Reserve meeting occurred this week — the FOMC's most recent
//   decision (a quarter-point hike to 3.75%-4%, Sept 16, 2026) was already
//   covered in the prior piece in this series and isn't re-explained here.
//   This piece does not attribute the week's jump to any single cause; no
//   verified, on-the-record quote from this specific week explaining the
//   jump was found via this run's searches, so none is asserted.
// - Local price/inventory context: reused, not re-derived, from LVINIT's own
//   already-published, already-sourced las-vegas-home-prices-august-2026
//   piece (LVR's official August 2026 report) — median single-family
//   $475,000, -1.0% YoY. Checked and confirmed no LVR September 2026 report
//   exists yet as of this run (LVR reports monthly, typically early the
//   following month).
// - The payment-math table is explicitly labeled hypothetical: arithmetic
//   (standard amortization, 30-year term, no taxes/insurance/PMI) on a
//   $475,000 loan — the same loan size used in the prior piece, for a clean
//   apples-to-apples comparison — run at four already-cited rates,
//   independently computed this run (6.65% -> $3,049; 6.76% -> $3,084; both
//   match the prior piece's own published figures exactly, confirming the
//   methodology; 6.95% -> $3,144; 7.04% -> $3,173).
//
// IMAGERY — a financing-cost topic, not a place, so no repo photography
// fits, and C:\LVINIT\Images (a Windows path) is not reachable from this
// Linux cloud session — confirmed this run (no /mnt/c mount, and the literal
// Windows path also doesn't resolve). The prior two pieces in this series
// later received AI-generated hero images Mikey supplied and explicitly
// approved for those specific pieces (a one-piece-at-a-time bypass of
// CLAUDE.md's no-AI-imagery default, per those pages' own IMAGERY notes) —
// that approval doesn't carry over to a new piece, so this one ships with
// the safe default instead: a photoless StoryHero (no fabricated stand-in)
// and a generated LVINIT editorial cover as the /guides card image only,
// produced via:
//   node scripts/generate-guide-cover.mjs \
//     --slug las-vegas-mortgage-rates-hit-20-month-high \
//     --category "Market Watch" --subject "MORTGAGE RATES 6.95%" \
//     --out las-vegas-mortgage-rates-20-month-high-editorial-cover.webp
// -> public/images/covers/las-vegas-mortgage-rates-20-month-high-editorial-cover.webp
// ---------------------------------------------------------------------------

const PATH = "/guides/las-vegas-mortgage-rates-hit-20-month-high";

const meta: StoryMeta = {
  title:
    "Mortgage Rates Just Hit a 20-Month High — What It Means for Las Vegas Buyers | LVINIT",
  headline:
    "Mortgage Rates Jumped to 6.95% in a Week. Daily Trackers Now Sit Above 7%.",
  description:
    "Freddie Mac's weekly average jumped 19 basis points to 6.95% the week of September 17, 2026 — its highest level since January 2025 — and daily trackers have held above 7% for days since. Here's the real math on a Las Vegas payment.",
  path: PATH,
  datePublished: "2026-09-21",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Mortgage Rates Hit a 20-Month High", path: PATH },
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
      name: "What is the mortgage rate right now, and how high is it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Freddie Mac's official weekly survey put the average 30-year fixed rate at 6.95% for the week of September 17, 2026 — up 19 basis points from 6.76% the week before, and its highest level since January 2025, per Reuters' reporting on the same release. Faster-moving daily trackers were already running a bit higher: Zillow-sourced data cited by Yahoo Finance had the 30-year at 7.04% on September 19, 2026. A specific buyer's actual locked rate still depends on credit score, down payment, loan type, and lender.",
      },
    },
    {
      "@type": "Question",
      name: "Why did mortgage rates jump so much in one week?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Reuters wire report that carried this rate move didn't include an economist quote or a stated cause, and this piece doesn't guess one either. What's verifiable is the size of the move: at 19 basis points, it's roughly four times larger than any single week's change in the five weeks before it. No Federal Reserve meeting happened during this specific week — the Fed's most recent rate decision was the week before.",
      },
    },
    {
      "@type": "Question",
      name: "Does a jump like this mean Las Vegas home prices will drop further?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not automatically, and no source cited in this piece forecasts that. LVR's most recently verified report, for August 2026, already showed a second straight monthly price decline and more homes sitting without offers. A rate jump this size adds pressure on the demand side, but price is set by supply and demand together, and this piece makes no prediction about where either goes next.",
      },
    },
  ],
};

// Verified snapshot for the stat panel. Every figure is sourced in the
// article's own "Sources" section.
type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "6.95%",
    label: "Average 30-year fixed rate",
    note: "Week of Sept 17, 2026, up from 6.76% · Freddie Mac PMMS",
  },
  {
    value: "+19 bps",
    label: "One-week jump",
    note: "The largest single-week move in the last six weeks",
  },
  {
    value: "7.04%",
    label: "What daily trackers showed",
    note: "Sept 19, 2026 · Zillow data via Yahoo Finance",
  },
  {
    value: "$475,000",
    label: "Las Vegas single-family median",
    note: "August 2026, most recent verified LVR figure",
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
            Freddie Mac&rsquo;s weekly national average, a faster daily
            tracker for the most current picture, and the most recent
            verified Las Vegas price figure for context. Sources at the end
            of this article.
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
            Data reflects the reporting periods cited and changes weekly (in
            Freddie Mac&rsquo;s case) or daily (in the trackers&rsquo; case).
            See the sources at the end of this article for the full research.
          </p>
        </div>
      </Container>
    </section>
  );
}

export default function LasVegasMortgageRatesHit20MonthHighPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Market Watch",
        headline:
          "Mortgage Rates Jumped to 6.95% in a Week. Daily Trackers Now Sit Above 7%.",
        subheadline:
          "Freddie Mac's average has climbed for four straight weeks, but this week's move was different in kind, not just degree: a 19-basis-point jump to 6.95%, the highest that average has been since January 2025. Daily trackers, which move faster, have now held above 7% for several days running.",
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
            name: "Mortgage Rates Kept Climbing. Daily Trackers Already Show 7%.",
            href: "/guides/las-vegas-mortgage-rates-approach-7-percent",
            category: "Market Watch",
            dek: "Our prior update — the week before this one, when Freddie Mac's average was still under 6.8%.",
          },
          {
            name: "Las Vegas Home Prices Dipped Again in August 2026",
            href: "/guides/las-vegas-home-prices-august-2026",
            category: "Market Watch",
            dek: "The most recently verified valley-wide median and inventory numbers — the price side of this same math.",
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
        heading:
          "Trying to figure out what a rate this high actually does to your number?",
        body:
          "A national average, daily or weekly, is a starting point, not your quote. Your actual rate depends on your credit, your down payment, and your lender. Tell me your target budget and I'll walk you through what it realistically looks like right now, rate included. No sales pitch.",
      }}
    >
      <StoryLede
        kicker="Market Watch"
        lead="A week ago, we wrote about mortgage rates sitting at 6.76% and daily trackers already flirting with 7%. This week's Freddie Mac release changed the picture more than a normal week does: the 30-year fixed average jumped 19 basis points to 6.95%, the biggest single-week move in over a month and the highest that average has been since January 2025."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          The daily numbers moved with it. By September 19, 2026, Zillow-sourced
          daily tracking had the 30-year sitting at{" "}
          <span className="text-lvinit-black">7.04%</span> — not a single day
          brushing the 7% line, which is what the last update described, but
          several days running above it. Here&rsquo;s what actually changed,
          what didn&rsquo;t, and the real math on what it does to a Las Vegas
          payment.
        </p>
      </StoryLede>

      <StorySection heading="What actually happened since our last update">
        <p className="text-body-lg text-lvinit-warmgray">
          Freddie Mac&rsquo;s Primary Mortgage Market Survey (PMMS) is a
          national weekly average, not a Las Vegas number specifically —
          local buyers borrow against the same national market everyone
          else does, with their own rate then set by credit, down payment,
          loan type, and lender. Here&rsquo;s the last six weeks of that
          survey, all directly fetched from Freddie Mac&rsquo;s own archive:
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
              <tr className="border-b border-lvinit-lightgray">
                <td className="py-3 pr-4 text-lvinit-black">Aug 13, 2026</td>
                <td className="py-3 pr-4 text-lvinit-black">6.67%</td>
                <td className="py-3">5.96%</td>
              </tr>
              <tr className="border-b border-lvinit-lightgray">
                <td className="py-3 pr-4 text-lvinit-black">Aug 20, 2026</td>
                <td className="py-3 pr-4 text-lvinit-black">6.65%</td>
                <td className="py-3">5.95%</td>
              </tr>
              <tr className="border-b border-lvinit-lightgray">
                <td className="py-3 pr-4 text-lvinit-black">Aug 27, 2026</td>
                <td className="py-3 pr-4 text-lvinit-black">6.66%</td>
                <td className="py-3">5.98%</td>
              </tr>
              <tr className="border-b border-lvinit-lightgray">
                <td className="py-3 pr-4 text-lvinit-black">Sept 3, 2026</td>
                <td className="py-3 pr-4 text-lvinit-black">6.71%</td>
                <td className="py-3">6.04%</td>
              </tr>
              <tr className="border-b border-lvinit-lightgray">
                <td className="py-3 pr-4 text-lvinit-black">Sept 10, 2026</td>
                <td className="py-3 pr-4 text-lvinit-black">6.76%</td>
                <td className="py-3">6.09%</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-lvinit-black">Sept 17, 2026</td>
                <td className="py-3 pr-4 text-lvinit-black">6.95%</td>
                <td className="py-3">6.26%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Notice the size of that last move. Every prior week in this table
          shifted the 30-year average by 5 basis points or less — some weeks
          barely moved at all. The jump to 6.95% was 19 basis points,
          roughly four times any single week before it. A year earlier, the
          30-year averaged 6.26% and the 15-year averaged 5.41% — this
          week&rsquo;s 30-year print is running 69 basis points above where
          it sat twelve months ago. Freddie Mac&rsquo;s own release
          doesn&rsquo;t frame this with a &ldquo;highest since&rdquo;
          headline; that comes from wire coverage of the same release, which
          independently traced the last time the 30-year average was this
          high back to January 2025 &mdash; about 20 months.
        </p>
      </StorySection>

      <SnapshotPanel />

      <StorySection heading="The daily numbers moved too — and stayed there">
        <p className="text-body-lg text-lvinit-warmgray">
          Freddie Mac&rsquo;s PMMS is an average of rate-lock applications
          from the prior five business days, which makes it stable and
          comparable week over week but a few days behind the market. Daily
          rate trackers move faster because they price actual locks on a
          given day.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Our last update described daily trackers brushing 7% on a single
          day. This time the picture held: Zillow-sourced daily data, cited
          by Yahoo Finance, had the 30-year fixed at 7.04% on Saturday,
          September 19, 2026 &mdash; down a single basis point from the day
          before, but still solidly above the 7% line, days after Freddie
          Mac&rsquo;s own weekly print landed at 6.95%. Neither of those
          numbers is a quote for any specific buyer; a locked rate still
          depends on credit, down payment, loan type, and lender. The honest
          read is that both the slow official average and the faster daily
          trackers are now telling the same story, not two different ones.
        </p>
      </StorySection>

      <StoryPullQuote cite="Sam Khater, Freddie Mac Chief Economist">
        Aspiring buyers should remember shopping around for the best
        mortgage rate and getting multiple quotes can potentially save them
        thousands.
      </StoryPullQuote>

      <StorySection muted heading="What we don't know: why this particular week jumped so much">
        <p className="text-body-lg text-lvinit-warmgray">
          We looked for an on-the-record explanation of this specific
          week&rsquo;s jump before writing this piece, and didn&rsquo;t find
          one that cleared our sourcing bar. The Reuters wire story that
          carried the 6.95% figure reports the rate move itself and the
          &ldquo;highest since January 2025&rdquo; comparison, with no
          economist quote or stated cause attached. No Federal Reserve
          meeting happened during this specific week — the Fed&rsquo;s most
          recent rate decision, a quarter-point hike, was the week before
          and is already covered in our prior piece.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Mortgage rates generally track the 10-year Treasury yield more
          closely than the Fed&rsquo;s own overnight rate, and that
          relationship almost certainly explains some of this move. But
          naming a specific cause for one week&rsquo;s size of jump, without
          a source that actually says so, would be a guess dressed up as
          reporting — so this piece states the number and leaves the
          &ldquo;why&rdquo; for a specific week at that.
        </p>
      </StorySection>

      <StorySection heading="What a rate move like this actually does to a payment">
        <p className="text-body-lg text-lvinit-warmgray">
          Here&rsquo;s a{" "}
          <span className="text-lvinit-black">hypothetical example</span>,
          not a real transaction: a $475,000 loan — the size of LVR&rsquo;s
          most recently verified Las Vegas single-family median (August
          2026), not a specific home or buyer — run at four rates already
          cited above.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-body text-lvinit-warmgray">
            <thead>
              <tr className="border-b border-lvinit-lightgray text-left text-caption uppercase tracking-wide text-lvinit-warmgray">
                <th className="py-3 pr-4 font-normal">Rate (30-year fixed)</th>
                <th className="py-3 pr-4 font-normal">Principal &amp; interest, monthly</th>
                <th className="py-3 font-normal">On a $475,000 loan</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-lvinit-lightgray">
                <td className="py-3 pr-4 text-lvinit-black">6.65%</td>
                <td className="py-3 pr-4 text-lvinit-black">$3,049</td>
                <td className="py-3">August 20&rsquo;s recent low</td>
              </tr>
              <tr className="border-b border-lvinit-lightgray">
                <td className="py-3 pr-4 text-lvinit-black">6.76%</td>
                <td className="py-3 pr-4 text-lvinit-black">$3,084</td>
                <td className="py-3">Our last update, Sept 10</td>
              </tr>
              <tr className="border-b border-lvinit-lightgray">
                <td className="py-3 pr-4 text-lvinit-black">6.95%</td>
                <td className="py-3 pr-4 text-lvinit-black">$3,144</td>
                <td className="py-3">This week&rsquo;s Freddie Mac average</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-lvinit-black">7.04%</td>
                <td className="py-3 pr-4 text-lvinit-black">$3,173</td>
                <td className="py-3">
                  Illustrative only &mdash; where daily trackers sat on
                  Sept 19
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Since our last update a week ago, that&rsquo;s roughly{" "}
          <span className="text-lvinit-black">$60 more a month</span> in
          principal and interest on the same loan amount, at Freddie
          Mac&rsquo;s official number alone. Measured against the recent low
          on August 20 — five weeks ago — the gap widens to about{" "}
          <span className="text-lvinit-black">$95 more a month</span>, or
          roughly $1,140 a year &mdash; before property taxes, homeowners
          insurance, HOA dues, or mortgage insurance, none of which are
          included in any of these figures.
        </p>
      </StorySection>

      <StorySection heading="What this actually changes for someone shopping right now">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              A one-week, 19-basis-point move is unusually large. It&rsquo;s
              a reason to lock in a rate you can plan around rather than
              wait for a specific number to reappear — nothing cited here
              says rates are heading back down, and nothing says they
              aren&rsquo;t either.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              A rate climbing this steadily makes a seller-paid buydown or
              closing-cost credit worth asking for directly — in{" "}
              <Link
                href="/guides/las-vegas-home-prices-august-2026"
                className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
              >
                the market LVR&rsquo;s August report already describes
              </Link>
              , with more homes sitting without offers, that ask has more
              room to land than it did a year or two ago.
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
              Neither Freddie Mac&rsquo;s release nor the wire coverage of
              it forecasts one, and neither does this article — plan around
              what a rate does to your payment today, not a guess about next
              month.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Mikey's local take">
        <p className="text-body-lg text-lvinit-warmgray">
          A 19-basis-point jump in one week gets your attention, but the
          number that actually matters is still the payment, not the
          headline rate. On a typical Las Vegas loan, this week&rsquo;s move
          costs about $60 more a month than last week and about $95 more
          than the August low. That&rsquo;s a real cost, and it&rsquo;s
          bigger than most weekly moves &mdash; but it&rsquo;s still
          smaller than what a decent seller concession or rate buydown can
          offset in a market with this much inventory sitting without
          offers. I&rsquo;d rather see a buyer lock a number they can
          actually plan around today than sit on the sidelines waiting for a
          rate that may not show back up.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If you&rsquo;re trying to figure out whether this week&rsquo;s
          rate actually changes your plan, run your real number instead of
          the headline one. See what a{" "}
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
            Mortgage Market Survey (PMMS) and archive, weekly prints from
            August 13 through September 17, 2026. The source for every
            30-year and 15-year rate figure and the week-over-week and
            year-over-year comparisons above, and for the quote from Chief
            Economist Sam Khater. Directly fetched from{" "}
            <a
              href="https://www.freddiemac.com/pmms"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              freddiemac.com/pmms
            </a>{" "}
            and{" "}
            <a
              href="https://www.freddiemac.com/pmms/archive"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              freddiemac.com/pmms/archive
            </a>
            , cross-checked against the official Sept 17, 2026 release on{" "}
            <a
              href="https://www.globenewswire.com/news-release/2026/09/17/3364253/0/en/mortgage-rates-average-6-95.html"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              GlobeNewswire
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Reuters</span> — the source
            for the &ldquo;highest since January 2025&rdquo; / 20-month-high
            framing, via its wire story on the same release, directly
            fetched through its{" "}
            <a
              href="https://www.investing.com/news/economy-news/us-30year-mortgage-rate-hits-highest-since-january-2025-freddie-mac-says-4906121"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Investing.com syndication
            </a>{" "}
            and cross-checked against the same wire copy carried separately
            by{" "}
            <a
              href="https://money.usnews.com/investing/news/articles/2026-09-17/us-30-year-mortgage-rate-hits-highest-since-january-2025-freddie-mac-says"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              U.S. News
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Yahoo Finance</span>, daily
            mortgage-rate roundup for Saturday, September 19, 2026, citing
            Zillow&rsquo;s lender-marketplace daily average &mdash; the
            source for the 7.04% daily-tracker figure used as
            faster-moving context above.
          </li>
          <li>
            <span className="text-lvinit-black">Las Vegas Realtors (LVR)</span>
            . Official August 2026 housing report — the source for the
            $475,000 valley-wide single-family median used in the payment
            example above. Full detail and sourcing in{" "}
            <Link
              href="/guides/las-vegas-home-prices-august-2026"
              className="text-lvinit-blue underline underline-offset-4"
            >
              our August 2026 coverage
            </Link>
            .
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Mortgage rates and market conditions change daily and can move
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
