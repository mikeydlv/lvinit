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
// MARKET WATCH — the July 2026 follow-up to "Why Aren't Las Vegas Home Prices
// Falling?" (app/guides/will-las-vegas-home-prices-drop/page.tsx). That piece
// covered the June 2026 record; this one covers the pullback that followed it.
//
// FACT DISCIPLINE (read before editing):
// - Every market statistic here comes from Las Vegas Realtors' (LVR) official
//   July 2026 housing report, released Thursday, August 6, 2026 (data through
//   end of July). Verified against THREE accessible, non-paywalled carriers of
//   that release: Nevada Business Magazine, the Las Vegas Review-Journal, and
//   the Las Vegas Sun (Fox5 Vegas also covered it same-day and is cited as a
//   fourth confirming source). No market stat rests on a single outlet.
// - Verified LVR figures: single-family median $480,000 (-1.0% YoY, -2.0% from
//   the $490,000 record set in May/June 2026); condo/townhome median $290,000
//   (flat YoY, still below the $315,000 record set October 2024); 2,587 total
//   sales; single-family sales +1.2% YoY; condo/townhome sales -1.1% YoY;
//   7,442 single-family homes listed without offers (+4.1% YoY); 2,719
//   condo/townhome listed without offers (+3.7% YoY); supply near 4 months;
//   80.0% of single-family homes sold within 60 days (up from 78.8% YoY —
//   NOTE this is an improvement, not a slowdown); 67.6% of condos/townhomes
//   sold within 60 days (down from 73.5% YoY). Quote: George Kypreos, LVR
//   President, from the same release.
// - Do NOT round the price change to "2% YoY" — it is 1.0% YoY and a separate
//   2.0% off the May/June record; keep those two comparisons distinct, as the
//   source does.
// - The single-family 80.0%-within-60-days figure is a genuine nuance: it rose
//   year over year even as supply grew. Do not flatten this into "the market
//   is slowing across the board" — condos are the softer story here, not
//   single-family homes. Keep that distinction explicit in-article.
// - Mortgage rate is Freddie Mac's PMMS weekly average. Two consecutive weeks
//   are cited (6.69% week of Aug 6, 2026; 6.67% week of Aug 13, 2026) — both
//   sourced from Freddie Mac's own release headlines. Reconfirm at
//   freddiemac.com/pmms before editing either figure.
// - This article and the June 2026 piece are cross-linked both directions —
//   do not remove either link. Do not restate the June piece's own guardrail
//   figures here; link to it instead.
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title: "Las Vegas Home Prices Pulled Back in July 2026 | LVINIT",
  headline:
    "Las Vegas Home Prices Pulled Back From Their Record High in July 2026",
  description:
    "LVR's July 2026 report shows the Las Vegas median single-family price slipped to $480,000, down 2% from the record set in May and June. Here's the honest read on what changed — and what didn't.",
  path: "/guides/las-vegas-home-prices-july-2026",
  datePublished: "2026-08-17",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    {
      name: "Las Vegas Home Prices Pulled Back in July 2026",
      path: "/guides/las-vegas-home-prices-july-2026",
    },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

// FAQ JSON-LD — three genuinely useful questions this article answers. Kept in
// sync with the article body; answers are drawn only from cited, dated figures.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Did Las Vegas home prices drop in July 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, modestly. Las Vegas Realtors' official July 2026 report put the median existing single-family home price at $480,000 — down 1.0% from a year earlier and down 2.0% from the $490,000 all-time high set in May and June 2026. The median condo/townhome price held flat year over year at $290,000, still below its own October 2024 record of $315,000.",
      },
    },
    {
      "@type": "Question",
      name: "Is this the start of a bigger price drop in Las Vegas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It's too early to call it a trend off one month of data. The pullback was small — 1 to 2 percent — and single-family homes actually sold slightly faster than a year earlier (80.0% within 60 days, up from 78.8%), even as more homes sat without offers. That's not the pattern of a market coming apart. Condos told a softer story, selling within 60 days at 67.6%, down from 73.5% a year earlier. Whether July was a blip or the start of something depends on what August and September show.",
      },
    },
    {
      "@type": "Question",
      name: "Are Las Vegas condos and single-family homes moving at the same pace right now?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. In the July 2026 LVR report, single-family sales were up 1.2% year over year and homes sold slightly faster than a year earlier. Condo and townhome sales were down 1.1% year over year, and a smaller share sold within 60 days (67.6%, down from 73.5%). Single-family and condo/townhome are behaving like two different markets right now, not one.",
      },
    },
  ],
};

// Verified July 2026 snapshot for the stat panel. Each figure carries its own
// source + period label so nothing reads as a timeless "current" number.
type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "$480,000",
    label: "Median existing single-family price",
    note: "July 2026, -1.0% YoY, -2.0% off the record · Las Vegas Realtors",
  },
  {
    value: "$290,000",
    label: "Median condo/townhome price",
    note: "July 2026, flat YoY · Las Vegas Realtors",
  },
  {
    value: "80.0%",
    label: "Single-family homes sold within 60 days",
    note: "July 2026, up from 78.8% a year earlier · Las Vegas Realtors",
  },
  {
    value: "6.67%",
    label: "30-year fixed mortgage rate",
    note: "Week of August 13, 2026 · Freddie Mac average",
  },
];

function SnapshotPanel() {
  return (
    <section id="by-the-numbers" aria-label="Las Vegas July 2026 snapshot" className="scroll-mt-24">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            The Las Vegas market, by the numbers
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            A snapshot of where things stood in the July 2026 reporting period.
            Figures come from the sources listed at the end of this article and
            reflect that period only.
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
            sources at the end of this article for the full release.
          </p>
        </div>
      </Container>
    </section>
  );
}

export default function LasVegasHomePricesJuly2026Page() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Market Watch",
        headline:
          "Las Vegas Home Prices Pulled Back From Their Record High in July 2026",
        subheadline:
          "The median single-family price slipped to $480,000 — down 2% from the record set in May and June. It's a small move, not a crash, and it didn't hit every part of the market the same way.",
        backLink: { label: "LVINIT", href: "/" },
        ctas: [{ label: "See the numbers", href: "#by-the-numbers", variant: "primary" }],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "Put these numbers to work — see what a real budget buys, and where in the valley it goes furthest.",
        stories: [
          {
            name: "What $500K Buys in Las Vegas",
            href: "/guides/what-500k-buys-in-las-vegas",
            category: "Buyer guide",
            dek: "Three real home tours near the same price — a concrete look at the tradeoffs behind the median.",
          },
          {
            name: "Southwest Las Vegas",
            href: "/neighborhoods/southwest-las-vegas",
            category: "Area guide",
            dek: "The fastest-growing side of the valley, where much of the new-construction activity lives.",
          },
          {
            name: "Summerlin",
            href: "/neighborhoods/summerlin",
            category: "Area guide",
            dek: "One of the master-planned communities that keeps drawing buyers even in a slower year.",
          },
        ],
      }}
      relatedNeighborhood={{
        name: "Summerlin",
        href: "/neighborhoods/summerlin",
        blurb:
          "A closer look at one of the valley's most in-demand master-planned communities — and how homes there tend to move relative to the wider market.",
      }}
      ctas={{
        heading: "Trying to time your move?",
        body:
          "One month of softer prices doesn't tell you what to do with your specific budget and timeline. Tell me what you're working with, and I'll walk you through what the data actually means for your decision — not a sales pitch.",
      }}
    >
      <StoryLede
        kicker="Market Watch"
        lead="A month ago, I wrote about why Las Vegas home prices weren't falling even as inventory climbed. Las Vegas Realtors' July 2026 report, released August 6, gives that question its first real answer: they finally did — a little."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          The median single-family home price came in at $480,000, down 1.0%
          from a year earlier and down 2.0% from the $490,000 record set in
          May and June. That&rsquo;s a genuine pullback, and worth taking
          seriously. It&rsquo;s also a single month, a modest percentage, and
          — as the numbers underneath it show — not the same story in every
          corner of the market. Here&rsquo;s what actually happened, and what
          it does and doesn&rsquo;t mean.
        </p>
      </StoryLede>

      <StorySection heading="What the July 2026 numbers actually say">
        <p className="text-body-lg text-lvinit-warmgray">
          According to Las Vegas Realtors&rsquo; official July 2026 housing
          report (released August 6, 2026), the median price of an existing
          single-family home in Southern Nevada was{" "}
          <span className="text-lvinit-black">$480,000</span> — down 1.0% from
          a year earlier and down 2.0% from the all-time high of $490,000 set
          in May and June. The median condo/townhome price held at{" "}
          <span className="text-lvinit-black">$290,000</span>, flat compared
          with a year earlier and still well below the $315,000 record set
          back in October 2024.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Sales activity told a mixed story by property type. Total sales for
          the month came to 2,587 across all property types. Single-family
          sales were up 1.2% year over year, while condo and townhome sales
          were down 1.1%. Inventory grew on both sides: 7,442 single-family
          homes were listed without offers at the end of July, up 4.1% year
          over year, and 2,719 condos/townhomes were listed without offers, up
          3.7%. Supply sat at just under four months — the Review-Journal
          described that as similar to where it stood a year earlier.
        </p>
      </StorySection>

      <SnapshotPanel />

      <StorySection heading="The nuance worth understanding: single-family and condos aren't moving the same way">
        <p className="text-body-lg text-lvinit-warmgray">
          Here&rsquo;s the part that&rsquo;s easy to miss if you just read the
          headline price. More single-family homes sat on the market without
          offers in July than a year earlier — and yet single-family homes
          actually sold a little <em>faster</em>: 80.0% sold within 60 days,
          up from 78.8% a year earlier. More supply, but not slower selling.
          That&rsquo;s not the pattern you&rsquo;d expect from a market that&rsquo;s
          losing steam.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Condos and townhomes tell a different, softer story. Only{" "}
          <span className="text-lvinit-black">67.6%</span> sold within 60
          days, down from 73.5% a year earlier — a real slowdown, paired with
          sales that were down 1.1% year over year. If you only look at the
          combined median or the single-family number, you&rsquo;d miss that
          the condo/townhome segment is where the actual softening is
          concentrated this month.
        </p>
      </StorySection>

      <StoryPullQuote>
        More supply and faster sales at the same time isn&rsquo;t a market
        breaking down — it&rsquo;s a market where the homes worth buying are
        still getting snapped up. The softening is real, but it&rsquo;s not
        evenly spread.
      </StoryPullQuote>

      <StorySection heading="Why prices eased, in LVR's own words">
        <p className="text-body-lg text-lvinit-warmgray">
          Las Vegas Realtors President George Kypreos framed the July numbers
          as a small step down from an unusually strong run, not a change in
          direction: &ldquo;Despite the slight decline in prices during July,
          we&rsquo;re seeing a steady demand for homes here in Southern
          Nevada, and that continues to drive home sales and keep prices near
          record levels.&rdquo;
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That lines up with the numbers: sales weren&rsquo;t falling off a
          cliff (single-family sales were still up year over year), and
          supply, while a little looser, remained under four months — short of
          the five-to-six-month range that usually signals real buyer
          leverage. A 1-to-2% pullback from a record high, with demand still
          intact underneath it, reads less like a turn and more like a market
          that ran a little hot in May and June and gave a little of that back
          in July.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Mortgage rates were roughly flat over the period. Freddie Mac put
          the 30-year fixed average at{" "}
          <span className="text-lvinit-black">6.69% for the week of August 6, 2026</span>{" "}
          and{" "}
          <span className="text-lvinit-black">6.67% for the week of August 13</span>
          , consistent with where rates have sat for most of the year rather
          than a sudden move that would explain a shift in buyer behavior on
          its own.
        </p>
      </StorySection>

      <StorySection muted heading="Why this matters in Las Vegas">
        <p className="text-body-lg text-lvinit-warmgray">
          If you read the{" "}
          <Link
            href="/guides/will-las-vegas-home-prices-drop"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            June 2026 piece
          </Link>{" "}
          asking why prices weren&rsquo;t falling despite rising inventory,
          July is the update to that question — inventory kept building, and
          this time the median gave a little ground. But &ldquo;a little&rdquo;
          is doing real work in that sentence: this is a 1-to-2% move, not the
          kind of correction that changes what a given budget can buy in a
          given neighborhood.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Where you&rsquo;re shopping still matters more than the valley-wide
          median. Established, in-demand master-planned areas like{" "}
          <Link
            href="/neighborhoods/summerlin"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Summerlin
          </Link>{" "}
          tend to hold their own pace, while newer-growth corridors like{" "}
          <Link
            href="/neighborhoods/southwest-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Southwest Las Vegas
          </Link>{" "}
          carry more new-construction competition, which can pull resale
          pricing in a different direction than the countywide number
          suggests. And if you&rsquo;re weighing a condo against a house, this
          report is a reminder that those are genuinely two different markets
          right now, not one number with two labels.
        </p>
      </StorySection>

      <StorySection heading="What buyers should know">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              A 1-to-2% pullback isn&rsquo;t the discount some buyers have
              been waiting for, but it does confirm prices aren&rsquo;t only
              capable of moving up. Treat it as a data point, not a green
              light to lowball every offer.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              If you&rsquo;re shopping condos or townhomes, you likely have
              more real leverage than a single-family buyer right now — sales
              are down year over year and fewer are selling within 60 days.
              That&rsquo;s room to negotiate on price, concessions, or timing.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Single-family homes are still selling slightly faster than a
              year ago despite more listings — don&rsquo;t assume every
              well-priced house will sit. Move deliberately, but don&rsquo;t
              expect to have unlimited time on the ones you actually want.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="What sellers and homeowners should know">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              If you own a single-family home, July&rsquo;s numbers are mild:
              a small median pullback, but homes in your category are still
              selling slightly faster than they did a year ago. Price to
              recent comparables, not to the May/June peak.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              If you&rsquo;re selling a condo or townhome, take the slower
              pace seriously. A meaningfully smaller share sold within 60 days
              than a year ago — sharp pricing and real presentation matter
              more here than they do on the single-family side right now.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              One month of softer prices isn&rsquo;t proof of a trend. If your
              plans depend on where the median goes from here, don&rsquo;t
              overreact to July alone — watch whether August and September
              confirm the pullback or reverse it.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="What to watch next">
        <p className="text-body-lg text-lvinit-warmgray">
          One month doesn&rsquo;t make a trend, so here&rsquo;s what would
          confirm or undercut this one. Watch whether the single-family
          median keeps drifting below $480,000 in August and September, or
          bounces back toward the record — that tells us whether July was the
          start of something or a one-month give-back. Watch condo and
          townhome sales specifically; that segment is already showing more
          real softening than single-family, and it&rsquo;s the one to track
          for an early signal. And watch the 30-year fixed — it barely moved
          between the two most recent Freddie Mac readings, so a sustained
          move in either direction would be the more likely trigger for a
          bigger shift than anything in July&rsquo;s report on its own.
        </p>
      </StorySection>

      <StorySection heading="Mikey's local take">
        <p className="text-body-lg text-lvinit-warmgray">
          I wouldn&rsquo;t call July a turning point, and I&rsquo;d be careful
          about anyone who does. A 1% year-over-year dip and a 2% step down
          from a two-month record is exactly what you&rsquo;d expect after a
          market runs hot for a stretch — it&rsquo;s a breath, not a
          reversal. What I do think is real: condos and townhomes are quietly
          softer than single-family homes right now, and that gap is worth
          paying attention to if that&rsquo;s the part of the market you&rsquo;re in.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If you&rsquo;re trying to decide whether to buy now or wait for
          more room, the honest answer is still the same one I gave last
          month: the valley-wide median is a headline, not your budget. Go
          look at what your actual number gets you today. Start with the{" "}
          <Link
            href="/guides/what-500k-buys-in-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            $500K home tours
          </Link>
          , read the{" "}
          <Link
            href="/guides/will-las-vegas-home-prices-drop"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            June piece
          </Link>{" "}
          for the fuller backstory on why prices held as long as they did, or{" "}
          <Link
            href="/search"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            browse current listings
          </Link>{" "}
          for your price range.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Las Vegas Realtors (LVR)</span> —
            official July 2026 housing report, released Thursday, August 6,
            2026 (data through end of July). The primary source for every
            local figure here: the $480,000 single-family median (&minus;1.0%
            YoY, &minus;2.0% off the May/June record), the $290,000
            condo/townhome median (flat YoY), 2,587 total sales
            (single-family +1.2% YoY, condo/townhome &minus;1.1% YoY), 7,442
            single-family and 2,719 condo/townhome properties listed without
            offers, supply near 4 months, 80.0% of single-family homes and
            67.6% of condos/townhomes selling within 60 days, and the quote
            from LVR President George Kypreos. Verified against three
            independent, accessible carriers of the same release:{" "}
            <a
              href="https://nevadabusiness.com/2026/08/lvr-reports-local-home-prices-pull-back-from-record-high/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Nevada Business Magazine
            </a>
            ,{" "}
            <a
              href="https://www.reviewjournal.com/homes/resale-news/lvr-reports-local-home-prices-pull-back-from-record-high-3864239/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Las Vegas Review-Journal
            </a>
            , and the{" "}
            <a
              href="https://lasvegassun.com/news/2026/aug/06/report-las-vegas-home-prices-slip-slightly-in-july/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Las Vegas Sun
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Vegas (KVVU)</span> —
            &ldquo;Report: Las Vegas home prices pull back from record high in
            July 2026,&rdquo; August 6, 2026. Additional same-day local
            coverage confirming the same LVR figures —{" "}
            <a
              href="https://www.fox5vegas.com/2026/08/06/report-las-vegas-home-prices-pull-back-record-high-july-2026/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Freddie Mac</span> — Primary
            Mortgage Market Survey, 30-year fixed averages of 6.69% (week of
            August 6, 2026) and 6.67% (week of August 13, 2026) —{" "}
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
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Market conditions and property information can change. Data reflects
          the sources and reporting periods cited above and should not be
          treated as a guarantee of future results. This article is general
          market commentary, not financial, lending, tax, or investment advice.
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
