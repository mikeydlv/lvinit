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
// MARKET WATCH — the August 2026 follow-up to
// las-vegas-home-prices-july-2026 (which itself followed
// will-las-vegas-home-prices-drop). Built via the autonomous scheduled
// editorial-publishing routine.
//
// FACT DISCIPLINE (read before editing):
// - Every local market statistic here comes from Las Vegas Realtors' (LVR)
//   official August 2026 housing report. This run could reach only ONE
//   full-text, non-paywalled carrier of that release — Nevada Business
//   Magazine ("LVR Reports Fewer Homes Selling, and at Slightly Lower
//   Prices," published Sept 8, 2026) — fetched independently twice with
//   identical figures both times. LVR's own site (lasvegasrealtor.com)
//   returned HTTP 429 on every attempt this run and could not be reached
//   directly. No second full-text carrier (Review-Journal, Fox5 Vegas, Las
//   Vegas Sun all cover this release most months, per precedent in the July
//   and June pieces) turned up in search this run — search results for RJ/
//   Fox5/Sun coverage of "August 2026" repeatedly resurfaced last year's
//   August 2025 report instead, which is a DIFFERENT report with similar
//   numbers ($480,000 median, +0.7% YoY at the time) — do not conflate the
//   two. That August-2025 report is what independently corroborates the
//   YoY math used below: it gives the actual August 2025 baseline dollar
//   figures ($480,000 single-family, $298,000 condo/townhome), and the
//   percentages in the August 2026 release check out arithmetically against
//   those baselines ((480,000-475,000)/480,000 = 1.04% ≈ "-1.0%";
//   (299,900-298,000)/298,000 = 0.64% ≈ "+0.6%") — an independent
//   cross-check that the 2026 release's YoY percentages are internally
//   consistent, not a hallucinated artifact. If a second full-text 2026
//   carrier turns up later, add it here.
// - Verified LVR August 2026 figures (Nevada Business Magazine, Sept 8,
//   2026): single-family median $475,000 (-1.0% YoY vs. August 2025;
//   -3.1% off the $490,000 record set May-June 2026); condo/townhome
//   median $299,900 (+0.6% YoY; still below the $315,000 record set
//   October 2024); 2,252 total homes/condos/townhomes sold (single-family
//   -1.7% YoY, condo/townhome -7.4% YoY); 7,590 single-family homes listed
//   without offers at month-end (+5.3% YoY); 2,714 condo/townhomes listed
//   without offers (+6.0% YoY); supply just over 4.5 months; 74.8% of
//   single-family homes sold within 60 days (down from 77.5% a year
//   earlier); 68.9% of condos/townhomes sold within 60 days (down from
//   72.2%); cash transactions 21.9% (down from 22.9%); distressed sales
//   (short sales + foreclosures combined) 1.0% (up from 0.5% a year
//   earlier, off a very small base — flagged, not alarmed over). Quote:
//   George Kypreos, LVR President, from the same release.
// - Do NOT use the ~$1.2B / ~$136M total-dollar-volume figures that
//   surfaced in one AI-summarized pass of the source — they read as
//   internally inconsistent with the median-price and sales-count
//   direction (both down, yet volume reportedly up sharply) and could not
//   be independently re-confirmed this run. Left out rather than risk an
//   unverified number.
// - The July-vs-August comparison ($480,000 -> $475,000, a further ~1.0%
//   month-over-month step down) and the days-on-market reversal for
//   single-family homes (faster than a year ago in July, slower than a
//   year ago in August) are both original synthesis of LVINIT's own two
//   already-published, already-sourced pieces (las-vegas-home-prices-
//   july-2026 and this one) — not a claim from any single external source.
// - Mortgage-rate context reused, not re-derived, from LVINIT's own
//   already-published las-vegas-mortgage-rates-september-2026 piece:
//   Freddie Mac PMMS 30-year average 6.71% for the week of September 3,
//   2026, a 13-month high.
// - Image: no new photography exists for this reporting-period piece, and
//   C:\LVINIT\Images was not reachable from this cloud session. Reuses the
//   already-approved, already-in-repo Las Vegas residential aerial drone
//   photo (hero/las-vegas-residential-neighborhood-aerial-drone.webp,
//   already live on the down-payment-assistance guide) rather than a
//   generated cover, since a real, honest, valley-wide aerial exists and
//   fits a valley-wide statistics piece — same reuse pattern already
//   established elsewhere in this repo (e.g. the Fox Hill Park photo across
//   three pages). Deliberately NOT reused: the July piece's own card photo
//   (guide-las-vegas-home-prices-july-2026.webp), to avoid the July and
//   August cards looking identical side by side on /guides.
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title: "Las Vegas Home Prices Dipped Again in August 2026 | LVINIT",
  headline:
    "Las Vegas Home Prices Dipped Again in August 2026 — and Fewer Homes Are Selling",
  description:
    "LVR's August 2026 report puts the Las Vegas median single-family price at $475,000, down a second straight month, with sales slower and single-family homes now taking longer to sell too.",
  path: "/guides/las-vegas-home-prices-august-2026",
  image: "/images/hero/las-vegas-residential-neighborhood-aerial-drone.webp",
  imageWidth: 1908,
  imageHeight: 1070,
  imageAlt:
    "Aerial drone view of a Las Vegas residential neighborhood, with rows of tile-roofed tract homes, rooftop solar panels, and desert mountains under a blue sky in the background.",
  datePublished: "2026-09-09",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    {
      name: "Las Vegas Home Prices Dipped Again in August 2026",
      path: "/guides/las-vegas-home-prices-august-2026",
    },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

// FAQ JSON-LD — kept in sync with the article body; answers drawn only from
// the cited, dated LVR figures above.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Did Las Vegas home prices drop again in August 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Las Vegas Realtors' August 2026 report put the median existing single-family home price at $475,000, down 1.0% from August 2025 and down about 3.1% from the $490,000 all-time high set in May and June 2026. That's a second straight monthly decline after July's $480,000. The median condo/townhome price moved the other way, up 0.6% year over year to $299,900, still below its own October 2024 record of $315,000.",
      },
    },
    {
      "@type": "Question",
      name: "Are single-family homes selling slower now in Las Vegas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, and that's a change from July. In July 2026, single-family homes actually sold slightly faster than a year earlier. In August, that reversed: 74.8% of single-family homes sold within 60 days, down from 77.5% a year earlier. Condos and townhomes, which were already the softer side of the market, slowed further too, selling within 60 days at 68.9%, down from 72.2%.",
      },
    },
    {
      "@type": "Question",
      name: "Why did Las Vegas home sales slow down in August 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Las Vegas Realtors President George Kypreos tied the slowdown directly to rising mortgage rates, calling it \"not surprising to see sales slowing down a bit, especially considering how mortgage rates have been rising recently.\" That lines up with Freddie Mac's own data: the 30-year fixed average climbed to 6.71% for the week of September 3, 2026, its highest print in 13 months.",
      },
    },
  ],
};

// Verified August 2026 snapshot for the stat panel. Each figure carries its
// own source + period label so nothing reads as a timeless "current" number.
type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "$475,000",
    label: "Median existing single-family price",
    note: "August 2026, -1.0% YoY, -3.1% off the record · Las Vegas Realtors",
  },
  {
    value: "$299,900",
    label: "Median condo/townhome price",
    note: "August 2026, +0.6% YoY · Las Vegas Realtors",
  },
  {
    value: "74.8%",
    label: "Single-family homes sold within 60 days",
    note: "August 2026, down from 77.5% a year earlier · Las Vegas Realtors",
  },
  {
    value: "4.5 mo",
    label: "Months of supply",
    note: "August 2026, up from July's near-4-month reading · Las Vegas Realtors",
  },
];

function SnapshotPanel() {
  return (
    <section id="by-the-numbers" aria-label="Las Vegas August 2026 snapshot" className="scroll-mt-24">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            The Las Vegas market, by the numbers
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            A snapshot of where things stood in the August 2026 reporting
            period. Figures come from the sources listed at the end of this
            article and reflect that period only.
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

export default function LasVegasHomePricesAugust2026Page() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Market Watch",
        headline:
          "Las Vegas Home Prices Dipped Again in August 2026 — and Fewer Homes Are Selling",
        subheadline:
          "The median single-family price slipped to $475,000, a second straight monthly decline. This time the slowdown reached single-family homes too, not just condos.",
        image: "/images/hero/las-vegas-residential-neighborhood-aerial-drone.webp",
        imageAlt:
          "Aerial drone view of a Las Vegas residential neighborhood, with rows of tile-roofed tract homes, rooftop solar panels, and desert mountains under a blue sky in the background.",
        backLink: { label: "LVINIT", href: "/" },
        ctas: [{ label: "See the numbers", href: "#by-the-numbers", variant: "primary" }],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "Put these numbers in context. See what changed the month before, what's happening with financing costs, and what a real budget buys right now.",
        stories: [
          {
            name: "Las Vegas Home Prices Pulled Back From Their Record High in July 2026",
            href: "/guides/las-vegas-home-prices-july-2026",
            category: "Market Watch",
            dek: "The first pullback from the May/June record — the report this piece picks up from.",
          },
          {
            name: "Mortgage Rates Just Hit a 13-Month High",
            href: "/guides/las-vegas-mortgage-rates-september-2026",
            category: "Market Watch",
            dek: "The financing-cost side LVR's own president pointed to as a reason sales slowed.",
          },
          {
            name: "Inventory Is Rising in Las Vegas. So Why Aren't Home Prices Falling?",
            href: "/guides/will-las-vegas-home-prices-drop",
            category: "Market Watch",
            dek: "The original question this whole Market Watch thread is answering, one month at a time.",
          },
          {
            name: "What $500K Buys in Las Vegas",
            href: "/guides/what-500k-buys-in-las-vegas",
            category: "Buyer guide",
            dek: "Three real home tours near the same price. A concrete look at the tradeoffs behind the median.",
          },
        ],
      }}
      relatedNeighborhood={{
        name: "Summerlin",
        href: "/neighborhoods/summerlin",
        blurb:
          "A closer look at one of the valley's most in-demand master-planned communities, and how homes there tend to move relative to the wider market.",
      }}
      ctas={{
        heading: "Trying to time your move?",
        body:
          "Two months of softer prices still doesn't tell you what to do with your specific budget and timeline. Tell me what you're working with, and I'll walk you through what the data actually means for your decision. No sales pitch.",
      }}
    >
      <StoryLede
        kicker="Market Watch"
        lead="Last month, I wrote about Las Vegas home prices finally pulling back from their May/June record. Las Vegas Realtors' August 2026 report, released the first week of September, shows that pullback wasn't a one-month blip — and this time, it's showing up in more places than just the headline price."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          The median single-family home price came in at $475,000 in August,
          down 1.0% from a year earlier and down about 3.1% from the $490,000
          record set in May and June. That&rsquo;s a second straight monthly
          decline, following July&rsquo;s $480,000. Fewer homes sold overall,
          and for the first time in this stretch, single-family homes are
          also taking longer to sell than they did a year ago, not just
          condos and townhomes. Here&rsquo;s what actually happened.
        </p>
      </StoryLede>

      <StorySection heading="What the August 2026 numbers actually say">
        <p className="text-body-lg text-lvinit-warmgray">
          According to Las Vegas Realtors&rsquo; official August 2026 housing
          report, the median price of an existing single-family home in
          Southern Nevada was{" "}
          <span className="text-lvinit-black">$475,000</span>, down 1.0% from
          August 2025 and down roughly 3.1% from the all-time high of
          $490,000 set in May and June 2026. The median condo/townhome price
          moved the other direction, up 0.6% year over year to{" "}
          <span className="text-lvinit-black">$299,900</span>, still short of
          its own record of $315,000 set back in October 2024.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Sales activity slowed on both sides of the market. A combined 2,252
          homes, condos, and townhomes sold in August, with single-family
          sales down 1.7% year over year and condo/townhome sales down a
          sharper 7.4%. Inventory kept building: 7,590 single-family homes
          were listed without offers at the end of August, up 5.3% year over
          year, and 2,714 condos/townhomes were listed without offers, up
          6.0%. Supply moved to just over 4.5 months, up from the near-4-month
          reading in July.
        </p>
      </StorySection>

      <SnapshotPanel />

      <StorySection heading="What's different from July: single-family homes are slowing down too">
        <p className="text-body-lg text-lvinit-warmgray">
          Here&rsquo;s the part worth paying attention to if you read last
          month&rsquo;s piece. In July, single-family homes actually sold{" "}
          <em>faster</em> than a year earlier, even with more homes listed.
          Condos and townhomes were the soft spot. In August, that pattern
          changed: single-family homes sold within 60 days at{" "}
          <span className="text-lvinit-black">74.8%</span>, down from 77.5%
          a year earlier. That&rsquo;s a genuine reversal, not a rounding
          error.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Condos and townhomes slowed further too:{" "}
          <span className="text-lvinit-black">68.9%</span> sold within 60
          days, down from 72.2% a year earlier, on top of sales that were
          down 7.4% year over year. Cash transactions dipped slightly to
          21.9% of sales (from 22.9%), and distressed sales (short sales and
          foreclosures combined) ticked up to 1.0% of transactions from 0.5%
          a year earlier. That&rsquo;s still a small share of the market by
          any historical standard, worth noting rather than worrying over on
          its own.
        </p>
      </StorySection>

      <StoryPullQuote>
        One soft month can be noise. Two months where the slowdown spreads
        from condos into single-family homes too starts to look like a
        pattern worth tracking, not a blip worth ignoring.
      </StoryPullQuote>

      <StorySection heading="Why sales slowed, in LVR's own words">
        <p className="text-body-lg text-lvinit-warmgray">
          Las Vegas Realtors President George Kypreos framed the August
          numbers as continuity, not alarm: &ldquo;Local home prices have
          been pretty stable this year &ndash; and really for the past two
          years or so. It&rsquo;s not surprising to see sales slowing down a
          bit, especially considering how mortgage rates have been rising
          recently and that can be a drag on the housing market.&rdquo;
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That points straight at financing cost as the likely driver, and
          the timing lines up. Freddie Mac&rsquo;s Primary Mortgage Market
          Survey put the 30-year fixed average at{" "}
          <span className="text-lvinit-black">6.71% for the week of September 3, 2026</span>,
          its highest print in 13 months (see{" "}
          <Link
            href="/guides/las-vegas-mortgage-rates-september-2026"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            the full rate breakdown
          </Link>{" "}
          for what that does to a monthly payment). Rates climbing through
          August into September is a plausible, LVR-stated reason buyers
          slowed down, even as prices themselves moved only modestly.
        </p>
      </StorySection>

      <StorySection muted heading="Why this matters in Las Vegas">
        <p className="text-body-lg text-lvinit-warmgray">
          Put the last three reports together and a shape starts to emerge.{" "}
          <Link
            href="/guides/will-las-vegas-home-prices-drop"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            June asked why prices weren&rsquo;t falling
          </Link>{" "}
          despite rising inventory.{" "}
          <Link
            href="/guides/las-vegas-home-prices-july-2026"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            July gave the first small answer
          </Link>
          : a 1-to-2% pullback, concentrated in condos. August confirms the
          pullback continued and broadens it to single-family homes, while
          keeping the overall move modest &mdash; a combined 3.1% off the
          record in three months, not a collapse.
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
          tend to hold their pace better than the countywide average
          suggests, while entry-tier buyers should look at the{" "}
          <Link
            href="/guides/las-vegas-starter-home-prices-2026"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            starter-home data
          </Link>{" "}
          directly rather than the all-tier median, which can move
          differently than the bottom of the market.
        </p>
      </StorySection>

      <StorySection heading="What buyers should know">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              You have more real leverage than a month ago, on both
              single-family homes and condos. More listings sat without
              offers in August, and both segments are taking longer to sell
              than a year ago. That&rsquo;s room to negotiate on price,
              concessions, or closing timeline.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              A rising rate environment is part of why sales slowed, per LVR
              itself. If a higher monthly payment is what&rsquo;s giving you
              pause, run the actual numbers before assuming you&rsquo;re
              priced out &mdash; a modestly lower purchase price can offset
              some of a higher rate.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Two consecutive monthly declines is a real trend, not a single
              blip. It still isn&rsquo;t a crash: the median is down about
              3.1% from its record over three months, not double digits.
              Calibrate your expectations to that scale.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="What sellers and homeowners should know">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Price to August&rsquo;s comparables, not to the May/June peak.
              Single-family homes are now selling slower than a year ago for
              the first time in this stretch, which means overpricing carries
              more risk of sitting than it did even last month.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              If you&rsquo;re selling a condo or townhome, take the slower
              pace seriously. Sales are down 7.4% year over year and fewer
              are closing within 60 days. Sharp pricing and real presentation
              matter more here than on the single-family side.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Distressed sales ticked up slightly, but the level (1.0% of
              transactions) is still low by any historical standard. This
              isn&rsquo;t a market defined by forced sales; it&rsquo;s one
              where ordinary buyers have gained a little more say.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="What to watch next">
        <p className="text-body-lg text-lvinit-warmgray">
          Two months of decline is a trend, not yet a verdict. Watch whether
          September confirms it: a third straight monthly step down would be
          harder to wave off as noise. Watch single-family days-on-market
          specifically; August was the first month it moved the wrong way
          year over year, and a second month of that would matter more than
          the price itself. And watch the 30-year fixed rate, since LVR&rsquo;s
          own president pointed to it directly &mdash; if rates ease off
          their 13-month high, that&rsquo;s the more likely trigger for
          sales to pick back up than anything on the price side alone.
        </p>
      </StorySection>

      <StorySection heading="Mikey's local take">
        <p className="text-body-lg text-lvinit-warmgray">
          Two months in a row is enough for me to stop calling this noise. A
          combined 3.1% off the record isn&rsquo;t dramatic, but the shift
          from &ldquo;just condos are soft&rdquo; to &ldquo;single-family
          homes are slowing too&rdquo; is the kind of detail that tells you
          something real is happening underneath the headline number, even
          if the headline number itself is barely moving.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          I still wouldn&rsquo;t call it a correction. What I would say: if
          you&rsquo;ve been waiting for a reason to negotiate harder, this is
          it. Sellers are competing more than they were a year ago, on both
          sides of the market. Go see what that actually looks like for your
          number, starting with the{" "}
          <Link
            href="/guides/what-500k-buys-in-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            $500K home tours
          </Link>
          , or{" "}
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
            <span className="text-lvinit-black">Las Vegas Realtors (LVR)</span>.
            Official August 2026 housing report (data through end of August).
            The primary source for every local figure here: the $475,000
            single-family median (&minus;1.0% YoY, &minus;3.1% off the
            May/June record), the $299,900 condo/townhome median (+0.6%
            YoY), 2,252 total sales (single-family &minus;1.7% YoY,
            condo/townhome &minus;7.4% YoY), 7,590 single-family and 2,714
            condo/townhome properties listed without offers, supply just
            over 4.5 months, 74.8% of single-family homes and 68.9% of
            condos/townhomes selling within 60 days, cash sales at 21.9%,
            distressed sales at 1.0%, and the quote from LVR President
            George Kypreos. LVR&rsquo;s own site could not be reached
            directly this run (returned an HTTP 429 rate-limit response on
            every attempt); the figures above are verified against the full
            text of{" "}
            <a
              href="https://nevadabusiness.com/2026/09/lvr-reports-fewer-homes-selling-and-at-slightly-lower-prices/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Nevada Business Magazine&rsquo;s coverage
            </a>{" "}
            of the release, published September 8, 2026, fetched
            independently twice with identical figures both times, and
            cross-checked arithmetically against separately reported August
            2025 baseline dollar figures.
          </li>
          <li>
            <span className="text-lvinit-black">Freddie Mac</span>. Primary
            Mortgage Market Survey, 30-year fixed average of 6.71% for the
            week of September 3, 2026, as reported in LVINIT&rsquo;s own{" "}
            <Link
              href="/guides/las-vegas-mortgage-rates-september-2026"
              className="text-lvinit-blue underline underline-offset-4"
            >
              mortgage-rates coverage
            </Link>{" "}
            of the same release, at{" "}
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
