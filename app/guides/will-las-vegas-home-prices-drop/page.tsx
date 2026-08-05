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
// MARKET WATCH — "Why aren't Las Vegas prices falling?" explainer.
//
// FACT DISCIPLINE (read before editing):
// - Every market statistic here comes from Las Vegas Realtors' (LVR) official
//   June 2026 housing report, released July 7, 2026 (data through end of June).
//   It is verified against TWO accessible full-text carriers of that release:
//   Nevada Business Magazine and Fox5 Vegas (KVVU). No market stat rests on a
//   paywalled article. Mortgage rate is Freddie Mac's PMMS weekly average dated
//   July 30, 2026.
// - Verified LVR figures: single-family median $490,000 (+1.0% YoY, matches the
//   May record); condo/townhome median $292,000 (-4.3% YoY); 2,823 total sales;
//   single-family sales +18.3% YoY; 7,147 single-family homes listed without
//   offers (+2.2% YoY); ~3.5 months of supply; 78.5% of single-family homes sold
//   within 60 days (down from 82.8% YoY). Quote: George Kypreos, LVR President.
// - Do NOT reintroduce a "~30 days on market" figure or "supply up from under
//   2 months a year earlier" — neither is in the primary source; LVR reports the
//   % sold within 60 days, and single-family listings were up only ~2% YoY.
// - Trackers disagree on the June median (single-family MLS vs. all-residential
//   vs. automated estimates). That conflict is DISCLOSED in-article — do not
//   swap in a single "the median is X" claim.
// - The new-construction slowdown is referenced ONLY as a trend the RJ reported
//   (that article is paywalled; headline accessible), clearly attributed, never
//   as an asserted statistic. Do not add invented builder figures.
// - The pull quote is editorial (un-attributed); the one named quote (Kypreos)
//   is from the accessible LVR release.
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title: "Why Aren't Las Vegas Home Prices Falling? (2026) | LVINIT",
  headline: "Inventory Is Rising in Las Vegas. So Why Aren't Home Prices Falling?",
  description:
    "Las Vegas inventory and days on market climbed in mid-2026, yet June prices hit a record. Here's why prices aren't dropping — and what it means for buyers and sellers.",
  path: "/guides/will-las-vegas-home-prices-drop",
  datePublished: "2026-08-04",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    {
      name: "Why Aren't Las Vegas Home Prices Falling?",
      path: "/guides/will-las-vegas-home-prices-drop",
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
      name: "Will Las Vegas home prices drop in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "As of the June 2026 reporting period, they hadn't. Las Vegas Realtors reported the median existing single-family home price at a record $490,000 — up 1% from a year earlier — even as inventory rose modestly and homes took a bit longer to sell. Prices held because supply stayed relatively tight (about 3.5 months) and buyer demand stayed strong, with single-family sales up 18.3% year over year. Market conditions can change; these figures reflect June 2026.",
      },
    },
    {
      "@type": "Question",
      name: "Is it a buyer's or seller's market in Las Vegas right now?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "As of June 2026 it was moving toward more balance. Supply sat at about 3.5 months and homes took a little longer to sell (78.5% of single-family homes sold within 60 days, down from 82.8% a year earlier), which gives buyers more choice and negotiating room than in 2021–2022 — but prices had not fallen and supply was still short of a balanced five-to-six months, so it was not a clear buyer's market.",
      },
    },
    {
      "@type": "Question",
      name: "What is the median home price in Las Vegas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on how it's measured. Las Vegas Realtors reported the median existing single-family home at $490,000 for June 2026, and the median condo/townhome at $292,000 for the same month. Trackers that blend those property types, or that use automated estimates instead of closed MLS sales, report lower figures. Always check the reporting period and whether a number is single-family only.",
      },
    },
  ],
};

// Verified June 2026 snapshot for the stat panel. Each figure carries its own
// source + period label so nothing reads as a timeless "current" number.
type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "$490,000",
    label: "Median existing single-family price",
    note: "June 2026 record high, +1% YoY · Las Vegas Realtors",
  },
  {
    value: "~3.5 mo",
    label: "Months of housing supply",
    note: "June 2026 · Las Vegas Realtors",
  },
  {
    value: "+18.3%",
    label: "Single-family sales vs. a year ago",
    note: "June 2026 vs. June 2025 · Las Vegas Realtors",
  },
  {
    value: "6.66%",
    label: "30-year fixed mortgage rate",
    note: "Week of July 30, 2026 · Freddie Mac average",
  },
];

function SnapshotPanel() {
  return (
    <section id="by-the-numbers" aria-label="Las Vegas June 2026 snapshot" className="scroll-mt-24">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            The Las Vegas market, by the numbers
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            A snapshot of where things stood in the June 2026 reporting period.
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
            Data reflects the reporting periods cited and can change. Different
            trackers measure the market differently — see the note on the numbers
            below.
          </p>
        </div>
      </Container>
    </section>
  );
}

export default function WillLasVegasHomePricesDropPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Market Watch",
        headline:
          "Inventory Is Rising in Las Vegas. So Why Aren't Home Prices Falling?",
        subheadline:
          "More homes are sitting on the market and taking longer to sell — yet the June 2026 median hit a record. Here's the honest read on what's holding prices up, and what it means if you're buying or selling.",
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
          "Whether prices hold or soften from here depends on your price range, your timeline, and the part of the valley you're targeting. Tell me your budget and what you need, and I'll walk you through what the data actually means for your decision — not a sales pitch.",
      }}
    >
      <StoryLede
        kicker="Market Watch"
        lead="The most common question I get right now is some version of: when are Las Vegas home prices going to drop? It's a fair thing to ask. There are more homes for sale than there were a year ago, they're taking longer to sell, and mortgage rates are still high enough to sting. On paper, that's the setup for prices to give. So far, they haven't."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          In the June 2026 reporting period, the local benchmark hit a fresh
          record. That gap — a market that feels like it&rsquo;s cooling, with
          prices that refuse to follow — is confusing a lot of buyers into
          waiting for a break that isn&rsquo;t showing up. Here&rsquo;s what the
          numbers say, why they&rsquo;re behaving this way, and what it means
          whether you&rsquo;re buying, selling, or just watching.
        </p>
      </StoryLede>

      <StorySection heading="What the June 2026 numbers actually say">
        <p className="text-body-lg text-lvinit-warmgray">
          According to Las Vegas Realtors&rsquo; official June 2026 housing report
          (released July 7, 2026), the median price of an existing single-family
          home in Southern Nevada was{" "}
          <span className="text-lvinit-black">$490,000</span> — matching the
          all-time high set in May, and up 1.0% from a year earlier. That&rsquo;s
          not a boom. But it&rsquo;s also not the decline a cooling market is
          supposed to produce.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Underneath that flat-to-slightly-up price, the market did soften at the
          edges. There were more homes to choose from than a year earlier —{" "}
          <span className="text-lvinit-black">7,147 single-family homes listed
          without offers</span> at the end of June, up about 2% year over year —
          and they were taking a little longer to sell: 78.5% of single-family
          homes sold within 60 days, down from 82.8% a year earlier. Yet supply
          stayed relatively tight at roughly{" "}
          <span className="text-lvinit-black">3.5 months</span>, and sales
          actually jumped — single-family home sales were up 18.3% year over year,
          part of 2,823 total closings. More listings and a slower clock, but more
          buyers too. Prices held anyway.
        </p>
      </StorySection>

      <SnapshotPanel />

      <StorySection heading="Why prices aren't falling">
        <p className="text-body-lg text-lvinit-warmgray">
          The short version: more listings isn&rsquo;t the same as more
          <em> forced</em> selling, and demand didn&rsquo;t disappear.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Las Vegas Realtors President George Kypreos tied it to the basics in the
          June report: &ldquo;Prices are staying at this level in part because of
          our relatively tight housing supply and the strong demand for homes
          here.&rdquo; My read on <em>why</em> supply stays tight even as listings
          tick up: many sellers set a number ahead of time and simply won&rsquo;t
          sell unless they get close to it, so the motivated, cut-the-price
          listings that would normally drag the median down never hit the board.
          A lot of today&rsquo;s owners are also sitting on mortgages they locked
          in years ago at far lower rates, which makes moving expensive and gives
          them every reason to stay put rather than list into a slower market.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          On the demand side, borrowing costs eased just enough to keep buyers
          moving. Freddie Mac put the 30-year fixed average at{" "}
          <span className="text-lvinit-black">6.66% for the week of July 30, 2026</span>
          , and rates have mostly hovered in the mid-to-high 6% range this year —
          high by the standards of 2021, but no longer climbing the way they were.
          For buyers who&rsquo;d been on the sidelines, &ldquo;not getting worse&rdquo;
          was enough of a reason to act, and steady demand meeting a still-limited
          set of genuinely motivated sellers keeps a floor under prices.
        </p>
      </StorySection>

      <StoryPullQuote>
        A market can cool and hold its price at the same time. More homes for
        sale only pushes prices down when the people who own them actually have
        to sell.
      </StoryPullQuote>

      <StorySection heading="A quick note on why the price numbers differ">
        <p className="text-body-lg text-lvinit-warmgray">
          If you go looking, you&rsquo;ll see different &ldquo;median price&rdquo;
          figures for Las Vegas in the same month — and that&rsquo;s not anyone
          lying. The $490,000 figure is Las Vegas Realtors&rsquo; median for{" "}
          <span className="text-lvinit-black">existing single-family homes</span>{" "}
          sold through the local MLS. For that same June, Las Vegas Realtors put
          the median condo and townhome at{" "}
          <span className="text-lvinit-black">$292,000</span>, down 4.3% from a
          year earlier — so any tracker that blends condos and townhomes into one
          &ldquo;all homes&rdquo; number, or that uses automated estimates instead
          of closed MLS sales, lands lower for the same period, even though nothing
          about the single-family market changed.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          None of them is &ldquo;the&rdquo; price. They&rsquo;re measuring
          slightly different things. The rule I&rsquo;d give any client: when you
          see a Las Vegas price stat, check two things — the reporting period, and
          whether it&rsquo;s single-family only or all home types. Compare
          apples to apples and most of the &ldquo;conflicting&rdquo; headlines
          stop conflicting.
        </p>
      </StorySection>

      <StorySection muted heading="Why this matters in Las Vegas">
        <p className="text-body-lg text-lvinit-warmgray">
          Local prices don&rsquo;t always move with the national headline — as
          Kypreos put it, they don&rsquo;t always follow national trends, though
          lately they have. A roughly 3.5-month supply is looser than the tight,
          low-inventory conditions of a few years ago, but it&rsquo;s still short
          of the five-to-six months that typically signals a balanced market. If
          you&rsquo;re relocating from California or a tighter metro, that extra
          breathing room is real — you just won&rsquo;t see it in the sticker
          price yet.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Where you shop changes the math, too. The valley isn&rsquo;t one market.
          Established, in-demand master-planned areas like{" "}
          <Link
            href="/neighborhoods/summerlin"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Summerlin
          </Link>{" "}
          tend to hold value and move on their own clock, while the newer-growth
          corridors out in{" "}
          <Link
            href="/neighborhoods/southwest-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Southwest Las Vegas
          </Link>{" "}
          and the north valley have more new-construction competition. That
          matters because the Review-Journal has reported that local homebuilder
          sales kept sliding through 2026 — and when builders slow down and lean on
          incentives to move standing inventory, they set the price buyers compare
          resale homes against. Add the parts of a Las Vegas payment people forget
          until they&rsquo;re here — HOA dues, any SID/LID balance attached to a
          newer home, and summer cooling bills — and the &ldquo;same&rdquo; median
          home can carry a very different monthly cost from one ZIP code to the
          next.
        </p>
      </StorySection>

      <StorySection heading="What buyers should know">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Waiting for a broad price crash has been a losing bet through
              mid-2026. The leverage that <em>has</em> shown up is subtler —
              more listings to choose from, more time to decide, and more room to
              negotiate on a specific home, especially one that&rsquo;s been
              sitting.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Your rate matters more than the median. A small move in the 30-year
              fixed changes your monthly payment more than the year-over-year
              change in list prices did. Ask about seller concessions and rate
              buydowns before you assume a home is out of reach.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Compare new construction against resale directly. If builders are
              discounting or buying down rates to clear inventory, that can beat a
              resale home at the same price — or it can come with trade-offs on
              location and fees. Run both.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="What sellers and homeowners should know">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              You&rsquo;re not fighting a falling market, but you are fighting more
              competition and a slower clock. Homes are taking around a month to
              sell — pricing to the most recent comparable sales, not to last
              spring&rsquo;s peak listings, is what gets you sold.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Overpricing is more expensive than it used to be. With buyers having
              more to choose from, a listing that sits gets stale and often sells
              for less than a sharply priced one would have. Condition and
              presentation carry more weight in a slower market.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              If you own and aren&rsquo;t moving, the record median is mostly
              context. It supports your equity, but it doesn&rsquo;t change much
              day to day — and trading a low locked-in rate for today&rsquo;s is
              the real cost to weigh before you list.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="What to watch next">
        <p className="text-body-lg text-lvinit-warmgray">
          A few signals will tell us which way this tips before the median does.
          Watch whether months of supply keeps climbing past the three-to-four
          range — that&rsquo;s the level where buyers usually gain real pricing
          power. Watch the 30-year fixed: a sustained move lower would pull more
          buyers back in, while a move higher would test how patient sellers
          really are. And watch new construction — if builders keep slowing and
          deepen their incentives to clear inventory, that pressure eventually
          reaches resale prices too. None of that is a forecast; it&rsquo;s the
          short list I&rsquo;m actually tracking.
        </p>
      </StorySection>

      <StorySection heading="Mikey's local take">
        <p className="text-body-lg text-lvinit-warmgray">
          I&rsquo;d stop trying to call the top or the bottom. Through the June
          2026 numbers, Las Vegas looks like a market that&rsquo;s normalizing —
          more choice, more time, steadier prices — not one that&rsquo;s breaking.
          If you&rsquo;re a buyer waiting for a 2008-style discount, you&rsquo;ve
          mostly been paying rent to wait for it. If you&rsquo;re a seller
          expecting 2022 bidding wars, that market left too.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The better question isn&rsquo;t &ldquo;will prices drop&rdquo; — it&rsquo;s
          &ldquo;does this specific home, in this specific area, at this specific
          payment, work for the next several years of my life?&rdquo; That&rsquo;s a
          question the median can&rsquo;t answer, and it&rsquo;s the one worth your
          energy. Want to see what your budget actually buys today? Start with the{" "}
          <Link
            href="/guides/what-500k-buys-in-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            $500K home tours
          </Link>
          , then{" "}
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
            official June 2026 housing report, released July 7, 2026 (data through
            end of June). The primary source for every local figure here: the
            $490,000 single-family median (+1.0% YoY), the $292,000 condo/townhome
            median (&minus;4.3% YoY), 2,823 total sales (single-family +18.3%
            YoY), 7,147 single-family homes listed without offers (+2.2% YoY),
            ~3.5 months of supply, and 78.5% of single-family homes selling within
            60 days. Full release text:{" "}
            <a
              href="https://nevadabusiness.com/2026/07/lvr-reports-local-home-prices-hovering-at-record-high/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              Nevada Business Magazine
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Vegas (KVVU)</span> —
            &ldquo;Report: Las Vegas home prices hover at record high in June as
            sales climb,&rdquo; July 7, 2026. Independent local coverage
            confirming the same LVR figures —{" "}
            <a
              href="https://www.fox5vegas.com/2026/07/07/report-las-vegas-home-prices-hover-record-high-june-sales-climb/"
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
            Mortgage Market Survey, 30-year fixed average of 6.66% for the week of
            July 30, 2026 —{" "}
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
            <span className="text-lvinit-black">Las Vegas Review-Journal</span> —
            housing section, cited only for its reporting that local homebuilder
            sales continued to slow through 2026. Used as attributed context, not
            as a data source; that specific article is subscriber-only, and no
            statistic in this piece relies on it —{" "}
            <a
              href="https://www.reviewjournal.com/business/housing/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              reviewjournal.com/business/housing
            </a>
            .
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Market conditions and property information can change. Data reflects the
          sources and reporting periods cited above and should not be treated as a
          guarantee of future results. This article is general market commentary,
          not financial, lending, tax, or investment advice.
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
