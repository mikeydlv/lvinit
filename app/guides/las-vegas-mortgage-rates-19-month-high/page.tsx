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
// MARKET WATCH — the third installment in LVINIT's mortgage-rate thread,
// direct sequel to las-vegas-mortgage-rates-approach-7-percent (published
// 2026-09-17, covering the week-of-Sept-10 print at 6.76% and daily trackers
// near 7% as of Sept 16). Built via the autonomous scheduled
// editorial-publishing routine. Genuinely new ground: that piece's own
// research notes stop at the Sept 10 weekly print and Sept 16 daily-tracker
// readings — it does not include the official Sept 17 weekly print below,
// which is a real escalation (a much bigger one-week jump than any of the
// prior four weeks) and crosses into "highest since Jan 2025" territory
// with an official weekly average, not just a daily tracker.
//
// FACT DISCIPLINE (read before editing) — every figure independently
// verified this run via direct fetch, not taken on secondhand summary:
//
// - Primary source: Freddie Mac's Primary Mortgage Market Survey (PMMS),
//   freddiemac.com/pmms, directly fetched twice (once via the live page,
//   once via the official Sept 17, 2026 release on GlobeNewswire,
//   globenewswire.com/news-release/2026/09/17/3364253, and cross-checked a
//   third time against the freddiemac.gcs-web.com investor-relations
//   mirror). All three agree:
//     Week of Sept 17, 2026: 30-year 6.95% (15-year 6.26%)
//     Week of Sept 10, 2026: 30-year 6.76% (15-year 6.09%) — already covered
//       in the prior piece
//     One year ago (Sept 17, 2025): 30-year 6.26% (15-year 5.41%)
//   Chief Economist Sam Khater's quote, verbatim from the same release:
//   "The 30-year fixed-rate mortgage continues to fluctuate as markets
//   assess economic data." Freddie Mac's own release includes no "highest
//   since" framing and no rate forecast — neither does this piece.
// - "19-month high" / "highest since Jan. 30, 2025" framing: NOT Freddie
//   Mac's own phrasing. Independently corroborated by the Associated Press
//   (byline Alex Veiga), carried on the Arkansas Democrat-Gazette
//   (arkansasonline.com/news/2026/sep/18/average-for-30-year-mortgage-
//   rates-rises-to-695/, whose own headline reads "highest in 19 months")
//   and separately summarized by CNBC's own coverage of the same Freddie
//   Mac release — both independently land on the same Jan. 30, 2025 date.
//   The AP text also states this was "the fourth week in a row that
//   mortgage rates have moved higher" and gives a national ($400,000 loan)
//   payment-impact figure of roughly $255/month more since the run-up
//   began — used here only as attributed context, not substituted for
//   LVINIT's own Las Vegas-specific math below. Bloomberg's headline on the
//   same release ("US Mortgage Rates Rise for Fourth Straight Week,
//   Approaching 7%") independently corroborates the four-straight-week
//   framing.
// - A "highest in 8 months / since January 2026" framing surfaced on one
//   lower-quality aggregator (karmactive.com) during this run's research —
//   deliberately excluded. It contradicts two independently reported,
//   higher-quality sources (AP/Arkansas Democrat-Gazette and CNBC) that
//   both land on January 2025, and reads like the kind of month/year
//   mix-up this project's sourcing discipline exists to catch.
// - Daily-tracker "right now" context: NerdWallet's own directly reported
//   30-year rate for Tuesday, September 22, 2026 — 7.02% APR (down 3 bps
//   day-over-day, roughly flat week-over-week) — corroborated the same day
//   by Forbes Advisor, Money.com/Mortgage Daily, and Nadlan Capital Group,
//   all independently reporting the 30-year in the 7.02%-7.04% range on
//   Sept 22. Deliberately NOT used: a same-day Zillow-sourced figure cited
//   by NerdWallet at 7.16% APR, an outlier well above every other daily
//   tracker checked this run — mixing it in risked implying trackers
//   disagree sharply, when in fact four independent trackers cluster
//   tightly around 7.02%-7.04%.
// - Local price/inventory context: reused, not re-derived, from LVINIT's
//   own already-published, already-sourced las-vegas-home-prices-august-2026
//   piece (LVR's official August 2026 report) — median single-family
//   $475,000, -1.0% YoY. No LVR September 2026 report exists yet (monthly
//   reports publish early the following month); none is asserted here.
// - The payment-math table is explicitly labeled hypothetical: standard
//   30-year amortization, principal & interest only, no taxes/insurance/
//   HOA/PMI, computed independently on a $475,000 loan (LVR's most recently
//   verified Las Vegas single-family median) at rates already cited above.
//   No forecast about where rates go next appears anywhere in this piece.
//
// IMAGERY — a financing-cost topic, not a place, so no repo photography
// fits. C:\LVINIT\Images (a Windows path) is not reachable from this Linux
// cloud session — confirmed this run (no /mnt/c mount exists, matching
// every prior autonomous run's own finding). No standing approval exists to
// substitute AI-generated imagery on this run (the two prior pieces' AI
// hero graphics were each a one-time, live, in-the-moment approval from
// Mikey — not a default this routine may reuse on its own). Ships instead
// with a generated LVINIT editorial cover (Market Watch motif) as the
// /guides card image only, and a photoless StoryHero, matching this
// thread's own original (pre-Mikey-edit) pattern:
//   node scripts/generate-guide-cover.mjs \
//     --slug las-vegas-mortgage-rates-19-month-high --category "Market Watch" \
//     --subject "MORTGAGE RATES" \
//     --out las-vegas-mortgage-rates-19-month-high-editorial-cover.webp
// ---------------------------------------------------------------------------

const PATH = "/guides/las-vegas-mortgage-rates-19-month-high";

const meta: StoryMeta = {
  title: "Mortgage Rates Hit a 19-Month High — What It Means for Las Vegas Buyers | LVINIT",
  headline: "Mortgage Rates Just Hit Their Highest Point Since January 2025",
  description:
    "Freddie Mac's official weekly average jumped to 6.95% the week of September 17, 2026 — its biggest one-week move of the current run-up, and its highest print since January 2025. Daily trackers already had it above 7% again by September 22. Here's the real math on a Las Vegas payment.",
  path: PATH,
  datePublished: "2026-09-23",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Mortgage Rates: 19-Month High", path: PATH },
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
      name: "What is the mortgage rate in Las Vegas right now, in late September 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There are two honest answers. Freddie Mac's official weekly survey — the industry benchmark — put the average 30-year fixed rate at 6.95% for the week of September 17, 2026, its highest level since January 30, 2025. Faster-moving daily trackers, which respond in hours rather than a five-day average, already had the 30-year back above 7% by September 22, 2026 (roughly 7.02%-7.04% across several independently checked sources). A specific buyer's actual locked rate still depends on credit score, down payment, loan type, and lender, and can land above or below either published number.",
      },
    },
    {
      "@type": "Question",
      name: "Why did mortgage rates jump so much in one week?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "This piece doesn't have a confirmed single cause, and neither Freddie Mac's own release nor the wire coverage of it names one. What's documented: this was the fourth straight weekly increase in Freddie Mac's survey, and the move from 6.76% to 6.95% (19 basis points) was larger than any of the three weekly increases before it. It also came the week after the Federal Reserve's September 16, 2026 quarter-point rate hike, its first in more than three years — but mortgage rates track the 10-year Treasury yield more closely than the Fed's own overnight rate, and the broader climb was already three weeks underway before that meeting, so this piece treats the Fed decision as backdrop, not a stated cause.",
      },
    },
    {
      "@type": "Question",
      name: "Does a 19-month-high mortgage rate mean Las Vegas home prices will drop further?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not automatically, and no source cited in this piece forecasts that. LVR's most recently verified report, for August 2026, already showed a second straight monthly price decline and more homes sitting without offers. Rates climbing further adds pressure on the demand side, but price is set by supply and demand together, and this piece makes no prediction about where either goes next.",
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
    value: "6.26%",
    label: "Average 15-year fixed rate",
    note: "Week of Sept 17, 2026, up from 6.09% · Freddie Mac PMMS",
  },
  {
    value: "~7.02%",
    label: "What daily trackers already show",
    note: "Sept 22, 2026 · NerdWallet and others",
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

export default function LasVegasMortgageRates19MonthHighPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Market Watch",
        headline: "Mortgage Rates Just Hit Their Highest Point Since January 2025",
        subheadline:
          "Freddie Mac's official average jumped to 6.95% the week of September 17, 2026 — a bigger one-week move than any of the three weekly increases before it, and the highest that average has been in 19 months. Daily trackers already had it back above 7% by September 22.",
        // Mikey-supplied AI-generated image ("Mortgage Rates 9-17-26.jpg") —
        // not a real photograph, not any actual Las Vegas neighborhood. See
        // the visible disclosure banner rendered immediately below the
        // hero, same convention as the AI hero graphics on
        // las-vegas-mortgage-rates-approach-7-percent and the Fiesta
        // Henderson concept illustration.
        image: "/images/hero/las-vegas-mortgage-rates-19-month-high-hero.webp",
        imageAlt:
          "AI-generated illustration of a family and a dog walking down a suburban Las Vegas street at sunset, with palm trees, tile-roofed homes, and the Stratosphere Tower visible in the distance — not a photograph of a real location",
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
            dek: "Our prior update, from six days earlier — the same climb, one reporting period back.",
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
        heading: "Trying to figure out what a 19-month-high rate actually does to your number?",
        body:
          "A national average, daily or weekly, is a starting point, not your quote. Your actual rate depends on your credit, your down payment, and your lender. Tell me your target budget and I'll walk you through what it realistically looks like right now, rate included. No sales pitch.",
      }}
    >
      <div className="border-b border-lvinit-lightgray bg-lvinit-lightgray/40">
        <Container className="py-4">
          <p className="mx-auto max-w-[680px] text-caption text-lvinit-warmgray">
            <span className="font-bold uppercase tracking-wide text-lvinit-blue">
              AI-generated illustration —{" "}
            </span>
            the image above is an AI-generated illustration of a generic
            Las Vegas-style residential street. It is not a photograph,
            and it does not depict any specific real address, subdivision,
            or view.
          </p>
        </Container>
      </div>

      <StoryLede
        kicker="Market Watch"
        lead="Six days ago, we wrote that daily rate trackers already had the 30-year fixed sitting at 7%, even as Freddie Mac's slower official average still read 6.76%. That gap closed fast. Freddie Mac's own weekly survey — the number the industry actually treats as the benchmark — jumped to 6.95% for the week of September 17, 2026, a fourth straight weekly increase and its highest print since January 30, 2025."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          What makes this print different from the three before it isn&rsquo;t
          just the level — it&rsquo;s the size of the move.{" "}
          <span className="text-lvinit-black">
            Nineteen basis points in one week
          </span>{" "}
          is a bigger single-week jump than any of the prior increases in
          this run-up. And the slower official number wasn&rsquo;t alone:
          daily trackers, which had briefly touched 7% and then eased,
          climbed right back above it by September 22. Here&rsquo;s what
          actually happened, and the real math on what it does to a Las
          Vegas payment.
        </p>
      </StoryLede>

      <StorySection heading="What actually happened since our last update">
        <p className="text-body-lg text-lvinit-warmgray">
          Freddie Mac&rsquo;s Primary Mortgage Market Survey (PMMS) is a
          national weekly average, not a Las Vegas number specifically —
          local buyers borrow against the same national market everyone
          else does, with their own rate then set by credit, down payment,
          loan type, and lender. Here&rsquo;s the last five weeks of that
          survey, all directly fetched from Freddie Mac&rsquo;s own site and
          cross-checked against its official press release:
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
          Week over week, that&rsquo;s the fourth straight increase since the
          August 20 low — and at 19 basis points, the biggest single jump of
          the four. A year earlier, in September 2025, the 30-year averaged
          6.26% and the 15-year averaged 5.41%, so this week&rsquo;s reading
          is running about seven-tenths of a point above where it sat twelve
          months ago. The Associated Press, in wire coverage of the same
          release, put it plainly: this is the highest the 30-year average
          has been since January 30, 2025 — about 19 months.
        </p>
      </StorySection>

      <SnapshotPanel />

      <StorySection heading="The daily numbers caught back up, too">
        <p className="text-body-lg text-lvinit-warmgray">
          Our last update noted that faster-moving daily rate trackers had
          briefly touched the 7% line around September 16. By late the
          following week, they were back there and a little past it.
          On Tuesday, September 22, 2026, NerdWallet&rsquo;s own daily rate
          put the 30-year fixed at{" "}
          <span className="text-lvinit-black">7.02% APR</span> — down
          slightly from the day before, but essentially flat with a week
          earlier. Three other trackers checked the same day (Forbes
          Advisor, Mortgage Daily, and Nadlan Capital Group) independently
          landed in the same narrow band, between 7.02% and 7.04%.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Freddie Mac&rsquo;s weekly survey and the daily trackers measure
          different things — a rolling five-day average versus a same-day
          snapshot — so they won&rsquo;t match exactly on any given day. What
          they agree on right now is the direction: both readings have moved
          up, not down, over the last two weeks.
        </p>
      </StorySection>

      <StoryPullQuote cite="Sam Khater, Freddie Mac Chief Economist">
        The 30-year fixed-rate mortgage continues to fluctuate as markets
        assess economic data.
      </StoryPullQuote>

      <StorySection muted heading="Why now: what's actually behind the bigger jump">
        <p className="text-body-lg text-lvinit-warmgray">
          This piece doesn&rsquo;t have a single confirmed cause for why the
          Sept 17 jump was larger than the three weeks before it, and neither
          Freddie Mac&rsquo;s own release nor the wire coverage of it names
          one definitively. What&rsquo;s documented: mortgage rates track the
          10-year Treasury yield more closely than the Federal
          Reserve&rsquo;s own overnight rate, and that yield had already been
          climbing through September on persistent inflation data before this
          print. The Fed itself raised its benchmark rate a quarter point to
          3.75%&ndash;4% on September 16, 2026 — the day before this
          release, and its first increase in more than three years — with
          the committee citing inflation that &ldquo;remains elevated.&rdquo;
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That timing is worth noting as backdrop, not as a stated cause —
          the broader climb was already three weeks underway before that
          meeting concluded, and this piece makes no forecast about where
          rates go from here. Neither does Freddie Mac&rsquo;s own release.
        </p>
      </StorySection>

      <StorySection heading="What a rate move like this actually does to a payment">
        <p className="text-body-lg text-lvinit-warmgray">
          Here&rsquo;s a{" "}
          <span className="text-lvinit-black">hypothetical example</span>,
          not a real transaction: a $475,000 loan — the size of LVR&rsquo;s
          most recently verified Las Vegas single-family median (August
          2026), not a specific home or buyer — run at three rates already
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
                <td className="py-3 pr-4 text-lvinit-black">7.02%</td>
                <td className="py-3 pr-4 text-lvinit-black">$3,167</td>
                <td className="py-3">
                  Illustrative only &mdash; where daily trackers sat on
                  Sept 22
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Just since our last update, that&rsquo;s roughly{" "}
          <span className="text-lvinit-black">$60 more a month</span> —
          about <span className="text-lvinit-black">$723 more a year</span> —
          in principal and interest alone, at Freddie Mac&rsquo;s official
          number. If a buyer actually locked at what daily trackers showed
          on September 22, the gap widens to about{" "}
          <span className="text-lvinit-black">$83 more a month</span>, or
          roughly $994 a year, before property taxes, homeowners insurance,
          HOA dues, or mortgage insurance, none of which are included in any
          of these figures. For national scale, the Associated Press
          separately reported that the roughly one-point climb since this
          run-up began works out to about $255 more a month on a $400,000
          loan nationally — a different loan size and a longer stretch of
          time than the Las Vegas-specific comparison above, included here
          only as outside context.
        </p>
      </StorySection>

      <StorySection heading="What this actually changes for someone shopping right now">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Which number you quote matters less than what your lender
              actually locks. Freddie Mac&rsquo;s weekly average and a daily
              tracker can sit a quarter point apart on the same day — your
              real rate depends on credit score, down payment, loan type,
              and points paid, not either published average.
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
              Neither Freddie Mac&rsquo;s release nor the AP&rsquo;s coverage
              of it forecasts one, and neither does this article — plan
              around what a rate does to your payment today, not a guess
              about next month.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Mikey's local take">
        <p className="text-body-lg text-lvinit-warmgray">
          Two updates ago the story was &ldquo;rates hit a 13-month high.&rdquo;
          Six days after that, it was &ldquo;daily trackers already show 7%.&rdquo;
          Now it&rsquo;s an official weekly average at 6.95%, the biggest
          single-week move of the run so far. That pattern — not any one
          number — is the actual signal: rates have been climbing steadily
          for a month, and the size of the moves has been getting bigger,
          not smaller. I&rsquo;m not going to pretend to know when that
          stops.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          What I do know is that a market with this much inventory sitting
          without offers still has real room for a seller concession or a
          buydown to absorb a chunk of this move. If you&rsquo;re trying to
          figure out whether a 19-month-high rate actually changes your
          plan, run your real number instead of the headline one. See what
          a{" "}
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
            Mortgage Market Survey (PMMS), week of September 17, 2026 — the
            source for every 30-year and 15-year rate figure and the
            week-over-week and year-over-year comparisons above, and for the
            quote from Chief Economist Sam Khater. Directly fetched from{" "}
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
            <span className="text-lvinit-black">
              Associated Press (Alex Veiga)
            </span>
            , wire coverage of the same release, carried on the{" "}
            <a
              href="https://www.arkansasonline.com/news/2026/sep/18/average-for-30-year-mortgage-rates-rises-to-695/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Arkansas Democrat-Gazette
            </a>{" "}
            — the source for the &ldquo;highest since Jan. 30, 2025&rdquo;
            (roughly 19-month) framing, the &ldquo;fourth week in a
            row&rdquo; characterization, and the national payment-impact
            figure cited above, independently corroborated by CNBC&rsquo;s
            own coverage of the same release and by{" "}
            <a
              href="https://www.bloomberg.com/news/articles/2026-09-17/us-mortgage-rates-rise-for-fourth-straight-week-approaching-7"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bloomberg&rsquo;s
            </a>{" "}
            headline on the same data.
          </li>
          <li>
            <span className="text-lvinit-black">
              NerdWallet, Forbes Advisor, Mortgage Daily, and Nadlan Capital
              Group
            </span>
            , each independently reporting daily 30-year mortgage rates for
            Tuesday, September 22, 2026 — the source for the ~7.02%-7.04%
            daily-tracker range used as current context above.
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
