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
// MARKET WATCH — the direct sequel to las-vegas-mortgage-rates-september-2026
// (published 2026-09-07, covering the week-of-Sept-3 print at 6.71%). Built
// via the autonomous scheduled editorial-publishing routine on fresh,
// well-corroborated news: rates kept climbing after that piece shipped, and
// by mid-September crossed a psychologically significant line several
// outlets flagged independently. Not a restatement — every figure below is
// from a reporting period after the prior piece's own cutoff.
//
// FACT DISCIPLINE (read before editing) — every figure independently
// verified this run via direct fetch, not taken on secondhand summary:
//
// - Primary source: Freddie Mac's Primary Mortgage Market Survey (PMMS),
//   freddiemac.com/pmms and freddiemac.com/pmms/archive, both directly
//   fetched. Weekly 30-year prints, most recent first:
//     Sept 10, 2026: 6.76% (15-year 6.09%) — up from 6.71% the week before
//     Sept 3, 2026:  6.71% (15-year 6.04%) — already covered in the prior piece
//     Aug 27, 2026:  6.66% (15-year 5.98%)
//     Aug 20, 2026:  6.65% (15-year 5.95%) — the recent low point
//     Aug 13, 2026:  6.67% (15-year 5.96%)
//   That's three consecutive weekly increases since the Aug 20 low. The
//   Sept 10 release (cross-checked against the official text on GlobeNewswire,
//   globenewswire.com/news-release/2026/09/10/3359803) also gives the
//   year-over-year comparison used below: 6.35% (30-year) and 5.50%
//   (15-year) in September 2025. The Sam Khater quote used as the pull quote
//   is verbatim from that same GlobeNewswire release.
// - "Highest since June 2025" / "over 14 months" framing: NOT Freddie Mac's
//   own phrasing (its release states the rate and the comparisons only).
//   Independently corroborated by two outlets covering the same Sept 10
//   release: Bloomberg ("Mortgage Rates in the US Rise to 6.76%, Highest
//   Since June 2025") and WTOP ("...its highest level in over 14 months").
//   Both cleared via direct fetch/search this run.
// - Daily-tracker context (the "already near/at 7%" claim): sourced to two
//   independent outlets, both citing Zillow's daily rate data for
//   September 16, 2026 — NerdWallet (30-year 7.02% APR, +5bps day-over-day,
//   +23bps week-over-week) and Norada Real Estate (30-year 7.00%, 15-year
//   6.36%). Deliberately NOT used: Mortgage News Daily's own same-day
//   figure (7.24%), which runs on a different, more volatile daily-lock
//   methodology than either Freddie Mac or Zillow — mixing a third
//   methodology into one piece risked implying three sources disagree on
//   one number, when in fact each is measuring something different. The
//   piece explains the PMMS-is-a-lagging-average / daily-trackers-move-
//   faster distinction plainly instead of picking a winner.
// - Federal Reserve context: the FOMC raised its benchmark rate 25 basis
//   points to 3.75%-4% on September 16, 2026 — its first hike in more than
//   three years, citing persistent inflation — independently verified via
//   CNBC's coverage. Framed carefully: mortgage rates had already climbed
//   for three straight weeks BEFORE this meeting (they track the 10-year
//   Treasury yield more closely than the Fed's own overnight rate), so the
//   hike is cited as backdrop/context for a "higher for longer" rate
//   environment, not as the direct cause of the prior three weeks' move.
//   No rate forecast is included anywhere in this piece.
// - Local price/inventory context: reused, not re-derived, from LVINIT's own
//   already-published, already-sourced las-vegas-home-prices-august-2026
//   piece (LVR's official August 2026 report) — median single-family
//   $475,000, -1.0% YoY, -3.1% off the May/June record.
// - The payment-math table is explicitly labeled hypothetical: arithmetic
//   (standard amortization, 30-year term, no taxes/insurance/PMI) on a
//   $475,000 loan — the size of LVR's most recently verified Las Vegas
//   single-family median — run at four already-cited rates. No taxes,
//   insurance, HOA dues, or mortgage insurance are folded in; the note
//   beneath the table says so.
//
// IMAGERY — a financing-cost topic, not a place, so no repo photography
// fits, and C:\LVINIT\Images (a Windows path) is not reachable from this
// Linux cloud session — confirmed this run (no /mnt/c mount exists).
// Originally carried a generated LVINIT editorial cover as the /guides card
// image only, with a photoless StoryHero (see git history for that version).
//
// Updated 2026-09-17: Mikey supplied an AI-generated image directly (an
// aerial-style view of a generic Las Vegas hillside residential street with
// the Strip skyline in the distance) with his explicit approval to bypass
// CLAUDE.md's no-AI-imagery default for this one piece — confirmed by him
// to be AI-generated, not a real photograph of any actual Las Vegas
// neighborhood, and not his own photography, so no Mikey photo credit runs.
// It now serves as both the StoryHero image and the /guides card image
// (public/images/hero/las-vegas-mortgage-rates-valley-homes.webp, optimized
// from his 1672x941 PNG upload). `imageMode` stays "editorial-cover" in
// lib/content.ts — same convention already used for this site's other
// Mikey-supplied AI imagery (the prior mortgage-rates piece's hero graphic,
// the Fiesta Henderson concept illustration) — so the card renders it
// honestly as a graphic, not a claimed photograph, and a visible disclosure
// banner runs immediately below the hero on this page for the same reason.
// The superseded generated cover (las-vegas-mortgage-rates-7-percent-
// editorial-cover.webp) is no longer referenced and was removed.
// ---------------------------------------------------------------------------

const PATH = "/guides/las-vegas-mortgage-rates-approach-7-percent";

const meta: StoryMeta = {
  title: "Mortgage Rates Are Nearing 7% — What It Means for Las Vegas Buyers | LVINIT",
  headline:
    "Mortgage Rates Kept Climbing. Daily Trackers Already Show 7%.",
  description:
    "Freddie Mac's official weekly average climbed to 6.76% the week of September 10, 2026 — its highest since June 2025 — and faster-moving daily trackers already had the 30-year fixed at 7% by September 16. Here's what changed since our last update, and the real math on a Las Vegas payment.",
  image: "/images/hero/las-vegas-mortgage-rates-valley-homes.webp",
  path: PATH,
  datePublished: "2026-09-17",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Mortgage Rates Near 7%", path: PATH },
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
      name: "What is the mortgage rate in Las Vegas right now?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There are two honest answers, depending on which number you're looking at. Freddie Mac's official weekly survey — the benchmark most of the industry quotes — put the average 30-year fixed rate at 6.76% for the week of September 10, 2026, its highest level since June 2025. But that's a lagging five-day average. Faster-moving daily rate trackers already showed the 30-year sitting right at 7% by September 16, 2026 (7.00%-7.02%, per Zillow-sourced data cited by NerdWallet and Norada Real Estate). A specific buyer's actual locked rate still depends on credit score, down payment, loan type, and lender, and can land above or below either number.",
      },
    },
    {
      "@type": "Question",
      name: "Did the Federal Reserve's September 2026 rate hike cause mortgage rates to rise?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not directly, and not by itself. Mortgage rates had already climbed for three straight weekly readings before the Fed's September 16, 2026 meeting — they track the 10-year Treasury yield more closely than the Fed's own overnight benchmark rate. The Fed did raise its benchmark rate a quarter point that same day, its first hike in more than three years, citing persistently elevated inflation. That reinforces the broader 'rates staying higher for longer' backdrop several outlets pointed to, but it isn't the direct cause of the climb that was already underway.",
      },
    },
    {
      "@type": "Question",
      name: "Does this mean Las Vegas home prices will drop further?",
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
    value: "6.76%",
    label: "Average 30-year fixed rate",
    note: "Week of Sept 10, 2026, up from 6.71% · Freddie Mac PMMS",
  },
  {
    value: "6.09%",
    label: "Average 15-year fixed rate",
    note: "Week of Sept 10, 2026, up from 6.04% · Freddie Mac PMMS",
  },
  {
    value: "~7.00%",
    label: "What daily trackers already show",
    note: "Sept 16, 2026 · Zillow data via NerdWallet / Norada",
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

export default function LasVegasMortgageRatesApproach7PercentPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Market Watch",
        headline: "Mortgage Rates Kept Climbing. Daily Trackers Already Show 7%.",
        subheadline:
          "Ten days ago Freddie Mac's average hit a 13-month high. It didn't stop there — the 30-year fixed climbed to 6.76% the week of September 10, its highest since June 2025, and faster-moving daily trackers already had it sitting right at 7% by September 16.",
        // Mikey-supplied AI-generated image — not a real photograph, not a
        // depiction of any actual Las Vegas neighborhood. See the visible
        // disclosure notice rendered immediately below the hero.
        image: "/images/hero/las-vegas-mortgage-rates-valley-homes.webp",
        imageAlt:
          "AI-generated illustration of a Las Vegas-style hillside residential neighborhood with the Strip skyline visible in the distance — not a photograph of a real location",
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
            name: "Mortgage Rates Just Hit a 13-Month High",
            href: "/guides/las-vegas-mortgage-rates-september-2026",
            category: "Market Watch",
            dek: "Our last update, from ten days earlier — the same climb, one reporting period back.",
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
        heading: "Trying to figure out what a 7% headline actually does to your number?",
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
            Las Vegas-style hillside neighborhood. It is not a photograph,
            and it does not depict any specific real address, subdivision,
            or view.
          </p>
        </Container>
      </div>

      <StoryLede
        kicker="Market Watch"
        lead="Ten days ago, we wrote about mortgage rates hitting a 13-month high. They kept climbing. Freddie Mac's official weekly survey — the slower, more stable number the industry treats as the benchmark — put the 30-year fixed average at 6.76% for the week of September 10, 2026, a third straight weekly increase and the highest that average has been since June 2025."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          That&rsquo;s the lagging number. The faster one already crossed a
          line worth noticing: daily rate trackers, which respond in hours
          instead of a five-day average, had the 30-year fixed sitting right
          at{" "}
          <span className="text-lvinit-black">7%</span> by September 16,
          2026. Two different ways of measuring &ldquo;the mortgage
          rate&rdquo; are both saying the same thing this month &mdash; up,
          and not slowing down yet. Here&rsquo;s what each number actually
          means, and the real math on what it does to a Las Vegas payment.
        </p>
      </StoryLede>

      <StorySection heading="What actually happened since our last update">
        <p className="text-body-lg text-lvinit-warmgray">
          Freddie Mac&rsquo;s Primary Mortgage Market Survey (PMMS) is a
          national weekly average, not a Las Vegas number specifically —
          local buyers borrow against the same national market everyone
          else does, with their own rate then set by credit, down payment,
          loan type, and lender. Here&rsquo;s the last five weeks of that
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
              <tr>
                <td className="py-3 pr-4 text-lvinit-black">Sept 10, 2026</td>
                <td className="py-3 pr-4 text-lvinit-black">6.76%</td>
                <td className="py-3">6.09%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          From the recent low on August 20 to the most current reading, the
          30-year average has risen three straight weeks running. A year
          earlier, in September 2025, the 30-year averaged 6.35% and the
          15-year averaged 5.50% — both measures are running meaningfully
          above where they sat twelve months ago. Freddie Mac&rsquo;s own
          release doesn&rsquo;t frame this with a &ldquo;highest since&rdquo;
          headline; that comes from coverage of the same release, which
          independently traced the last time the 30-year average was this
          high back to June 2025.
        </p>
      </StorySection>

      <SnapshotPanel />

      <StorySection heading="Two ways to measure 'right now' — and why they disagree">
        <p className="text-body-lg text-lvinit-warmgray">
          Freddie Mac&rsquo;s PMMS is an average of rate-lock applications
          from the prior five business days. That makes it stable and
          comparable week over week, but it also means it&rsquo;s always a
          few days behind the market. Daily rate trackers move faster
          because they price actual locks on a given day, not a rolling
          average.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          By September 16, 2026, two independent trackers citing Zillow&rsquo;s
          daily rate data both had the 30-year fixed effectively at the 7%
          line: 7.02% APR, and separately 7.00%, with the 15-year at 6.36%.
          Neither of those is Freddie Mac&rsquo;s own number, and neither is
          this week&rsquo;s official PMMS print &mdash; they&rsquo;re a
          same-week, faster-moving read on the same direction Freddie
          Mac&rsquo;s slower survey has been showing for three straight
          weeks. The honest takeaway isn&rsquo;t &ldquo;rates are exactly
          X%.&rdquo; It&rsquo;s that every measure of the average rate,
          fast or slow, has been climbing since late August.
        </p>
      </StorySection>

      <StoryPullQuote cite="Sam Khater, Freddie Mac Chief Economist">
        Aspiring buyers should remember shopping around for the best
        mortgage rate and getting multiple quotes can potentially save them
        thousands.
      </StoryPullQuote>

      <StorySection muted heading="Why now: what's actually driving the climb">
        <p className="text-body-lg text-lvinit-warmgray">
          Rates track the 10-year Treasury yield more closely than the
          Federal Reserve&rsquo;s own overnight rate, and that yield has been
          climbing through September on persistent inflation data. That
          climb was already three weeks underway before the Fed&rsquo;s own
          September 16, 2026 meeting concluded — the same day daily trackers
          showed rates near 7%. At that meeting, the Fed raised its
          benchmark rate a quarter point to a range of 3.75%&ndash;4%, its
          first increase in more than three years, with the committee
          citing inflation that &ldquo;remains elevated.&rdquo;
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That doesn&rsquo;t mean the Fed&rsquo;s move caused mortgage rates
          to rise — the two don&rsquo;t move in lockstep, and this
          month&rsquo;s climb predates the meeting. What it does mean is
          that the backdrop behind higher mortgage rates &mdash; inflation
          the Fed itself is now actively fighting again &mdash; isn&rsquo;t
          a one-week story. This piece makes no forecast about where rates
          go from here; neither the Fed&rsquo;s brief statement nor Freddie
          Mac&rsquo;s own release does either.
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
                <td className="py-3 pr-4 text-lvinit-black">6.71%</td>
                <td className="py-3 pr-4 text-lvinit-black">$3,068</td>
                <td className="py-3">Our last update, Sept 3</td>
              </tr>
              <tr className="border-b border-lvinit-lightgray">
                <td className="py-3 pr-4 text-lvinit-black">6.76%</td>
                <td className="py-3 pr-4 text-lvinit-black">$3,084</td>
                <td className="py-3">This week&rsquo;s Freddie Mac average</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-lvinit-black">7.00%</td>
                <td className="py-3 pr-4 text-lvinit-black">$3,160</td>
                <td className="py-3">
                  Illustrative only &mdash; where daily trackers already sat
                  on Sept 16
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Just since our last update ten days ago, that&rsquo;s roughly{" "}
          <span className="text-lvinit-black">$16 more a month</span> in
          principal and interest on the same loan amount, at Freddie
          Mac&rsquo;s official number alone. If a buyer actually locked at
          the 7% level daily trackers were already showing, the gap from our
          last update widens to about{" "}
          <span className="text-lvinit-black">$92 more a month</span>, or
          roughly $1,100 a year &mdash; before property taxes, homeowners
          insurance, HOA dues, or mortgage insurance, none of which are
          included in any of these figures.
        </p>
      </StorySection>

      <StorySection heading="What this actually changes for someone shopping right now">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Which number you quote matters less than what your lender
              actually locks. Freddie Mac&rsquo;s weekly average and a daily
              tracker can sit a third of a point apart on the same day —
              your real rate depends on credit score, down payment, loan
              type, and points paid, not either published average.
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
              Neither Freddie Mac&rsquo;s release nor the Fed&rsquo;s own
              statement forecasts one, and neither does this article — plan
              around what a rate does to your payment today, not a guess
              about next month.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Mikey's local take">
        <p className="text-body-lg text-lvinit-warmgray">
          The number that actually matters here isn&rsquo;t 6.76% or 7% —
          it&rsquo;s the roughly $16 to $92 a month that separates them on a
          typical Las Vegas loan. That&rsquo;s a real cost, and it&rsquo;s
          bigger than it was ten days ago, but it&rsquo;s still smaller than
          what a decent seller concession or rate buydown can offset in a
          market with this much inventory sitting without offers. I&rsquo;d
          rather see a buyer lock a number they can actually plan around
          today than sit on the sidelines waiting for a rate that may not
          show up.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If you&rsquo;re trying to figure out whether this month&rsquo;s
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
            August 13 through September 10, 2026. The source for every
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
            , cross-checked against the official Sept 10, 2026 release on{" "}
            <a
              href="https://www.globenewswire.com/news-release/2026/09/10/3359803/0/en/mortgage-rates-average-6-76.html"
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
              Financial-press coverage of that release
            </span>{" "}
            — the source for the &ldquo;highest since June 2025&rdquo; and
            &ldquo;over 14 months&rdquo; framing, independently reported by{" "}
            <a
              href="https://www.bloomberg.com/news/articles/2026-09-10/mortgage-rates-in-the-us-rise-to-6-76-highest-since-june-2025"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bloomberg
            </a>{" "}
            and{" "}
            <a
              href="https://wtop.com/national/2026/09/the-average-rate-on-a-30-year-mortgage-rose-to-6-76-this-week-freddie-mac-says-the-highest-level-in-over-14-months"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              WTOP
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">
              NerdWallet and Norada Real Estate
            </span>
            , both citing Zillow&rsquo;s daily mortgage-rate data for
            September 16, 2026 — the source for the same-day 30-year figures
            near/at 7% (7.02% APR and 7.00%, respectively) used as the
            faster-moving daily-tracker context above.
          </li>
          <li>
            <span className="text-lvinit-black">CNBC</span>, coverage of the
            Federal Reserve&rsquo;s September 16, 2026 policy decision — the
            source for the quarter-point rate hike to 3.75%&ndash;4% and the
            committee&rsquo;s &ldquo;inflation remains elevated&rdquo;
            statement, cited as backdrop context only.
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
