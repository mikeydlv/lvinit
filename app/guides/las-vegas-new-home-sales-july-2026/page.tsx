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
// MARKET WATCH — the new-construction companion to
// "Las Vegas Home Prices Pulled Back From Their Record High in July 2026"
// (app/guides/las-vegas-home-prices-july-2026/page.tsx). That piece covers the
// RESALE side of the July 2026 market (LVR data). This piece covers NEW
// CONSTRUCTION for the same reporting month — a genuinely different data set
// from a different primary source, not a restatement.
//
// FACT DISCIPLINE (read before editing):
// - Primary source: Home Builders Research (Las Vegas-based firm, founded
//   1987; publishes the monthly Las Vegas Housing Market Letter at
//   homebuildersresearch.com/housing-reports/monthly), as reported by the Las
//   Vegas Review-Journal (reporter Eli Segall), "Las Vegas builders land 28%
//   jump in home sales in July," published August 24, 2026:
//   https://www.reviewjournal.com/business/housing/homebuilders-landed-big-jump-in-monthly-sales-in-las-vegas-3868655/
// - Verified July 2026 figures (do not round differently or restate loosely):
//     Net home sales: 735 (signed contracts minus cancellations) — +28% from
//       June 2026, -7% from July 2025.
//     New-home permits: 620 — +~1.5% from June 2026, -23% from July 2025.
//     Closed sales: 706 — -12% from July 2025.
//     Year-to-date through July 2026: 4,750 closed sales (-20% vs. the same
//       seven-month stretch in 2025); 4,776 permits pulled (-25%).
//     Median price, all newly built homes: $535,114, +2.9% YoY.
//     Median single-family closing price (new construction): $581,930,
//       +2.1% YoY.
// - The article attributes the year's overall softness to "elevated borrowing
//   costs and high home prices." No specific builders, submarkets, or
//   incentive programs are named in the source — none are invented here.
// - Resale comparison figure ($480,000 median existing single-family price,
//   July 2026, Las Vegas Realtors) is NOT re-derived here — it is already
//   sourced and verified on the resale companion piece
//   (las-vegas-home-prices-july-2026) and simply cited from there.
// - The ONLY computed figure in this piece: $581,930 - $480,000 = $101,930,
//   which is ~21.2% of $480,000 ("roughly 21%"). This is presented explicitly
//   as "the gap this month," never as a like-for-like or causal claim — new
//   construction and resale are different products (different mix of home
//   sizes, ages, locations, and incentives).
// - This article and the resale July 2026 piece are cross-linked both
//   directions — do not remove either link.
//
// HERO PHOTO — a real photo of a Lennar new-construction street at
// Mockingbird in Summerlin, shot by Mikey Del Rosario (confirmed 2026-08-31),
// showing framing mid-build, finished homes under scaffolding, and work
// trucks at the curb. Mikey-owned, so the global footer credit covers it —
// no per-image credit line needed (not developer/licensed imagery).
// ---------------------------------------------------------------------------

const HERO_IMAGE = "/images/hero/lennar-mockingbird-summerlin-new-construction-drone.webp";
const HERO_ALT =
  "Elevated view of a Lennar new-construction street at Mockingbird in Summerlin, Las Vegas: finished stucco homes under scaffolding on the left, open timber framing mid-build on the right, work trucks and dumpsters along the curb, and the valley and mountains visible in the haze behind.";

const meta: StoryMeta = {
  title:
    "Las Vegas New-Home Sales Jumped in July 2026 — But Builders Are Still Pulling Back | LVINIT",
  headline:
    "Las Vegas New-Home Sales Jumped in July 2026 — But Builders Are Still Pulling Back",
  description:
    "Home Builders Research data reported by the Las Vegas Review-Journal shows builder sales up 28% from June to July 2026, still down 7% year over year, with new-construction permits down 23% and pricing well above the resale median.",
  path: "/guides/las-vegas-new-home-sales-july-2026",
  image: HERO_IMAGE,
  imageWidth: 2400,
  imageHeight: 1350,
  imageAlt: HERO_ALT,
  datePublished: "2026-08-25",
  dateModified: "2026-08-31",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    {
      name: "Las Vegas New-Home Sales Jumped in July 2026",
      path: "/guides/las-vegas-new-home-sales-july-2026",
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
      name: "Did new-home sales in Las Vegas go up in July 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, month over month. Home Builders Research data reported by the Las Vegas Review-Journal put net new-home sales (signed contracts minus cancellations) at 735 in July 2026, up 28% from June. That rebound didn't erase the yearly comparison, though: July's total was still down 7% from July 2025, and year-to-date closed sales through July were down 20% versus the same seven months of 2025.",
      },
    },
    {
      "@type": "Question",
      name: "Why are new-home permits still falling if sales rebounded?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Permits and sales measure different things. July's 620 permits were up only about 1.5% from June and still down 23% from July 2025, while year-to-date permits were down 25%. A stronger sales month doesn't automatically turn into more permits right away, and builders have been pulling back on new starts most of this year. The Review-Journal's coverage attributes the year's broader softness to elevated borrowing costs and high home prices making purchases difficult for many buyers.",
      },
    },
    {
      "@type": "Question",
      name: "Is new construction more expensive than resale in Las Vegas right now?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In July 2026, yes, by a meaningful margin. The median closing price for a new-construction single-family home was $581,930 (Home Builders Research), compared with a $480,000 median for an existing single-family resale (Las Vegas Realtors) in the same month — a gap of about $101,930, or roughly 21%. New construction and resale aren't identical products, so this is a snapshot of the gap that month, not proof either market is over- or under-priced.",
      },
    },
  ],
};

// Verified July 2026 snapshot for the stat panel. Each figure carries its own
// source + period label so nothing reads as a timeless "current" number.
type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "735",
    label: "Net new-home sales",
    note: "July 2026, +28% from June, -7% from July 2025 · Home Builders Research",
  },
  {
    value: "620",
    label: "New-home permits",
    note: "July 2026, -23% from July 2025 · Home Builders Research",
  },
  {
    value: "$581,930",
    label: "Median new-construction single-family closing price",
    note: "July 2026, +2.1% YoY · Home Builders Research",
  },
  {
    value: "$480,000",
    label: "Median existing single-family resale price",
    note: "July 2026, for comparison · Las Vegas Realtors",
  },
];

function SnapshotPanel() {
  return (
    <section id="by-the-numbers" aria-label="Las Vegas new-construction July 2026 snapshot" className="scroll-mt-24">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            New construction, by the numbers
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            A snapshot of where builder activity stood in the July 2026
            reporting period. Figures come from the sources listed at the end
            of this article and reflect that period only.
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

export default function LasVegasNewHomeSalesJuly2026Page() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Market Watch",
        headline:
          "Las Vegas New-Home Sales Jumped in July 2026 — But Builders Are Still Pulling Back",
        subheadline:
          "Home Builders Research data shows builder sales up 28% month over month, but still down from a year ago — and new-home permits keep shrinking, which says something different about what's coming next.",
        image: HERO_IMAGE,
        imageAlt: HERO_ALT,
        backLink: { label: "LVINIT", href: "/" },
        ctas: [{ label: "See the numbers", href: "#by-the-numbers", variant: "primary" }],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "New construction is only half the picture. See how the resale side of the market looked the same month, and what a real budget buys.",
        stories: [
          {
            name: "Las Vegas Home Prices Pulled Back in July 2026",
            href: "/guides/las-vegas-home-prices-july-2026",
            category: "Market Watch",
            dek: "The resale side of the same July 2026 reporting period — LVR's median, sales pace, and inventory numbers.",
          },
          {
            name: "What $500K Buys in Las Vegas",
            href: "/guides/what-500k-buys-in-las-vegas",
            category: "Buyer guide",
            dek: "Three real home tours near the same price. A concrete look at the tradeoffs behind the median.",
          },
          {
            name: "Las Vegas Starter Homes Have More Than Doubled Since 2016",
            href: "/guides/las-vegas-starter-home-prices-2026",
            category: "Market Watch",
            dek: "New construction runs well above the resale median. The entry-level tier is a different market again, and it's moved even further over the last decade.",
          },
        ],
      }}
      relatedNeighborhood={{
        name: "Summerlin",
        href: "/neighborhoods/summerlin",
        blurb:
          "Another master-planned community where new-construction activity has stayed steady, and how it fits into the builder numbers above.",
      }}
      ctas={{
        heading: "Weighing new construction against resale?",
        body:
          "This month's numbers say the pipeline of future new supply is shrinking while builders sell what they've got. What that means for your specific budget and timeline depends on where you're looking. Tell me what you're working with, and I'll walk you through it. No sales pitch.",
      }}
    >
      <StoryLede
        kicker="Market Watch"
        lead="Builders had a good July. Home Builders Research data, reported by the Las Vegas Review-Journal on August 24, shows net new-home sales jumped 28% from June to July 2026. That's the good headline. The harder one sits right underneath it: sales were still down from a year ago, and the number of new permits builders are pulling keeps shrinking."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Net sales came in at 735 for the month, up 28% from June but down
          7% from July 2025. New-home permits, the better read on what
          builders expect to sell later, came in at 620 — essentially flat
          from June and down 23% from a year earlier. Both things are true at
          once: builders moved more homes than they did the month before, and
          they&rsquo;re still building toward a smaller pipeline than they
          were a year ago. Here&rsquo;s what the July numbers actually say,
          and how they line up against what resale buyers are seeing in the
          same market.
        </p>
      </StoryLede>

      <StorySection heading="What the July 2026 builder numbers actually say">
        <p className="text-body-lg text-lvinit-warmgray">
          According to Home Builders Research, reported by the Las Vegas
          Review-Journal, Las Vegas-area builders logged{" "}
          <span className="text-lvinit-black">735 net home sales</span> in
          July 2026 — newly signed contracts minus cancellations. That was up{" "}
          <span className="text-lvinit-black">28% from June</span>, the
          month-over-month jump the Review-Journal&rsquo;s headline led with. Set
          against July 2025, though, sales were down{" "}
          <span className="text-lvinit-black">7%</span>. Closed sales for the
          month, a stricter measure than signed contracts, came to 706, down
          12% from a year earlier.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          New-home permits — effectively builders&rsquo; bet on demand a few months
          out — told a flatter month-over-month story: 620 permits, up only
          about 1.5% from June, but down 23% from July 2025. Zoom out to the
          full year and the softness is broader. Through July,{" "}
          <span className="text-lvinit-black">
            year-to-date closed sales sat at 4,750
          </span>
          , down 20% versus the same seven months of 2025, and{" "}
          <span className="text-lvinit-black">
            year-to-date permits sat at 4,776
          </span>
          , down 25%. One strong month didn&rsquo;t undo seven months of a
          smaller new-construction market than last year.
        </p>
      </StorySection>

      <SnapshotPanel />

      <StorySection heading="The part that matters more than the headline: permits, not just sales">
        <p className="text-body-lg text-lvinit-warmgray">
          It&rsquo;s easy to read &ldquo;sales jumped 28%&rdquo; as builders
          turning a corner. Permits say something more specific. Sales
          measure what&rsquo;s moving off builders&rsquo; lots right now —
          often homes that were already under construction or sitting
          finished. Permits measure what builders are committing to build{" "}
          <em>next</em>. In July, permits barely moved from June (+1.5%) and
          were down 23% from a year earlier. That&rsquo;s a pipeline
          that&rsquo;s still shrinking even in the month sales rebounded.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Put plainly: builders sold more of what they already had in July.
          They didn&rsquo;t meaningfully ramp up what they&rsquo;re planning
          to have available later. If you&rsquo;re weighing &ldquo;wait for a
          new-construction community to open near where I want to
          live&rdquo; against &ldquo;buy resale now,&rdquo; this is the
          number that should factor in — the supply of future new homes
          isn&rsquo;t growing right now, based on what&rsquo;s actually been
          permitted.
        </p>
      </StorySection>

      <StoryPullQuote>
        A 28% month-over-month jump in sales and a 23% year-over-year drop in
        permits aren&rsquo;t contradictory. They&rsquo;re the same builders
        selling harder into a smaller pipeline.
      </StoryPullQuote>

      <StorySection heading="New construction vs. resale: the price gap this month">
        <p className="text-body-lg text-lvinit-warmgray">
          New construction also isn&rsquo;t cheap right now, and it&rsquo;s
          getting a little less cheap. The median price across all newly
          built homes was{" "}
          <span className="text-lvinit-black">$535,114</span> in July 2026,
          up 2.9% year over year. Narrow that to single-family new
          construction specifically, and the median closing price was{" "}
          <span className="text-lvinit-black">$581,930</span>, up 2.1% year
          over year.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Compare that with the resale side of the market for the same
          month, covered in{" "}
          <Link
            href="/guides/las-vegas-home-prices-july-2026"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            our July 2026 resale piece
          </Link>
          : Las Vegas Realtors put the median existing single-family resale
          price at $480,000 for the same period. That puts new-construction
          single-family closings about{" "}
          <span className="text-lvinit-black">
            $101,930, or roughly 21%, above
          </span>{" "}
          the resale median in July.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Worth being careful with that number. New construction and resale
          aren&rsquo;t the same product — different mix of home sizes, ages,
          locations, lot sizes, and built-in incentives (rate buydowns,
          upgrade credits) that don&rsquo;t show up in a headline median. This
          is the gap between the two medians <em>this month</em>, not a claim
          that a new build and a comparable resale home are $101,930 apart, or
          that one market is priced &ldquo;correctly&rdquo; and the other
          isn&rsquo;t.
        </p>
      </StorySection>

      <StorySection muted heading="Why this matters if you're choosing between new and resale">
        <p className="text-body-lg text-lvinit-warmgray">
          If you&rsquo;re actively deciding between waiting for a
          new-construction community and buying resale now, both halves of
          this report matter to that decision. Builders are motivated sellers
          this month — incentives are clearly doing some of the work behind
          that 28% jump. But the shrinking permit count means the
          new-construction options available to you a year from now may not
          be any bigger than what&rsquo;s available today, and could be
          smaller in some corridors.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Where you&rsquo;re looking still matters more than the valley-wide
          numbers. Newer-growth corridors like{" "}
          <Link
            href="/neighborhoods/southwest-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Southwest Las Vegas
          </Link>{" "}
          and master-planned areas like{" "}
          <Link
            href="/neighborhoods/summerlin"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Summerlin
          </Link>{" "}
          are where most of the valley&rsquo;s active new-construction building has
          been happening. Neither this report nor either of those guides
          publishes a submarket-specific price or permit count, so treat the
          valley-wide figures above as the honest context, not a number
          specific to either area.
        </p>
      </StorySection>

      <StorySection heading="What buyers should know">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Builders sold more in July than in June, which usually means
              incentives are on the table. If new construction is on your
              list, this is a reasonable month to ask what a builder is
              actually offering right now, not just their sticker price.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              A shrinking permit count means fewer new communities are being
              queued up behind the ones selling today. If you&rsquo;re set on
              a specific new-construction community, don&rsquo;t assume there
              will be
              more competing options a year from now.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              New construction ran about 21% above the resale median in July.
              That premium can be worth it — a warranty, current codes, no
              deferred maintenance — but it&rsquo;s a real number to weigh against
              what the same budget gets on the resale side.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="What to watch next">
        <p className="text-body-lg text-lvinit-warmgray">
          One good month doesn&rsquo;t reverse a down year on its own. Watch
          whether August and September hold onto July&rsquo;s sales pace or
          give it back — that tells us whether July was a real rebound or a
          one-month incentive push. Watch permits more closely than sales;
          that&rsquo;s the
          number that tells you whether builders are actually planning for
          more demand or just clearing what they already built. And watch
          whether the new-construction premium over resale (roughly 21% in
          July) widens or narrows as both medians move through the rest of
          2026.
        </p>
      </StorySection>

      <StorySection heading="Mikey's local take">
        <p className="text-body-lg text-lvinit-warmgray">
          I read this as builders working hard to move inventory, not as a
          new-construction market that&rsquo;s turned a corner. A 28%
          month-over-month jump gets a headline. A permit count that&rsquo;s
          still down 23% from last year is the number I&rsquo;d actually make
          a decision
          on if I were choosing between a new-construction community and a
          resale home right now.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If new construction is genuinely what you want — the warranty, the
          layout, the fact that nothing&rsquo;s been lived in — this can be a
          good month to negotiate, because builders are clearly motivated.
          If you&rsquo;re on the fence between new and resale purely on
          price, the
          resale side is running meaningfully cheaper right now. Read the{" "}
          <Link
            href="/guides/las-vegas-home-prices-july-2026"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            resale numbers for the same month
          </Link>
          , look at{" "}
          <Link
            href="/guides/what-500k-buys-in-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            what a real budget actually buys
          </Link>
          , or{" "}
          <Link
            href="/search"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            browse current listings
          </Link>{" "}
          across both.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Home Builders Research</span>,
            as reported by the{" "}
            <span className="text-lvinit-black">
              Las Vegas Review-Journal
            </span>{" "}
            (reporter Eli Segall), &ldquo;Las Vegas builders land 28% jump in
            home sales in July,&rdquo; published August 24, 2026. The source
            for every builder figure here: 735 net home sales (+28% from
            June, -7% from July 2025), 620 permits (+~1.5% from June, -23%
            from July 2025), 706 closed sales (-12% YoY), year-to-date
            through July of 4,750 closed sales (-20%) and 4,776 permits
            (-25%), a $535,114 median price across all newly built homes
            (+2.9% YoY), and a $581,930 median single-family closing price
            (+2.1% YoY). Home Builders Research is a Las Vegas-based firm,
            founded 1987, that publishes the monthly Las Vegas Housing Market
            Letter at{" "}
            <a
              href="https://homebuildersresearch.com/housing-reports/monthly"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              homebuildersresearch.com
            </a>
            . Read the Review-Journal&rsquo;s coverage at{" "}
            <a
              href="https://www.reviewjournal.com/business/housing/homebuilders-landed-big-jump-in-monthly-sales-in-las-vegas-3868655/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              reviewjournal.com
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Las Vegas Realtors (LVR)</span>.
            Official July 2026 housing report, released August 6, 2026 — the
            source for the $480,000 median existing single-family resale
            price used as the comparison figure above. Full detail and
            sourcing in{" "}
            <Link
              href="/guides/las-vegas-home-prices-july-2026"
              className="text-lvinit-blue underline underline-offset-4"
            >
              our resale-side July 2026 coverage
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
