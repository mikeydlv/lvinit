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
// BUYER GUIDE — busting the "you need 20% down" myth with the real minimums by
// loan type, then Nevada's actual, current down-payment-assistance landscape.
// A genuine evergreen content gap: LVINIT had zero down-payment-size or
// down-payment-assistance coverage before this piece.
//
// FACT DISCIPLINE (read before editing) — every figure below was independently
// verified during this build pass, not taken on the researcher's word alone:
//
// - FHA minimum down payment: 3.5% with a credit score of 580+, 10% for scores
//   500-579. Long-standing, multi-source-confirmed FHA program rule, reconfirmed
//   current for 2026 (Freedom Mortgage, AmeriSave, First Residential, and
//   others all agree; not time-sensitive market data).
// - VA loans: 0% down for eligible veterans, active-duty service members, and
//   some surviving spouses with a Certificate of Eligibility; no PMI. VA
//   funding fee (most borrowers): 2.15% of the loan amount for a first-time
//   VA-loan use with $0 down (1.5% at 5-9% down, 1.25% at 10%+ down); 3.3% for
//   a subsequent use with $0 down. Usually financed into the loan rather than
//   paid at closing. Exempt from the fee: borrowers receiving VA disability
//   compensation, Purple Heart recipients on active duty, and certain
//   surviving spouses receiving Dependency and Indemnity Compensation.
//   (Confirmed via Veterans United / Freedom Mortgage / VA.gov news release,
//   cross-checked against each other.)
// - Conventional loans: 3% down is available for qualifying buyers through
//   specific programs — Freddie Mac Home Possible and the equivalent Fannie
//   Mae HomeReady — both income-restricted (Freddie Mac's own page: qualifying
//   income capped at 80% of the area median income for the property's
//   location, checked property-by-property on Freddie Mac's own eligibility
//   tool). 5% is the more typical minimum for a standard conventional loan
//   outside those programs. 2026 conforming loan limit used by Freddie Mac
//   Home Possible: $832,750 standard / $1,249,125 in high-cost areas
//   (confirmed via Freddie Mac's own February 2026 fact sheet).
// - USDA loans: 0% down exists, but is geography- and income-restricted to
//   eligible rural areas. This article does NOT claim any specific Las Vegas
//   Valley address or ZIP code qualifies — that was not verified — and USDA is
//   mentioned only in generic terms for completeness, not as a Las Vegas
//   Valley option.
// - Nevada Housing Division's "Home Is Possible" (homeispossiblenv.org) is a
//   STATE down-payment-assistance program, and is a completely different thing
//   from Freddie Mac's national "Home Possible" conventional loan product,
//   despite the near-identical name. Both were directly re-verified on their
//   own official pages during this pass (not taken secondhand):
//     - homeispossiblenv.org/home-possible (no first-time-buyer requirement):
//       "up to 5% of the loan value" toward down payment/closing costs; min
//       credit score 640 (660 for manufactured homes); qualifying income up to
//       $165,000; home price up to $832,750; usable with conventional, FHA,
//       USDA, or VA financing; requires a homebuyer education course and
//       owner-occupancy.
//     - homeispossiblenv.org/home-possible-program (restricted to buyers who
//       "have not owned a home in the past 3 years"): "up to 4% of total loan
//       amount," structured as a "30-year non-forgivable" second loan with a
//       fixed interest rate for the term; same 640/660 credit-score floor.
//   These two official pages disagree with each other on the percentage (5%
//   vs. 4%) and on forgiveness (the general page doesn't state a repayment
//   structure; the restricted page explicitly says non-forgivable). The
//   article does NOT resolve this into one confident number — it states what
//   each page says and tells the reader to confirm the exact track, structure,
//   and current terms with a participating lender or the Division directly
//   (verified phone numbers, from the Division's own worker-advantage FAQ
//   page: 702-486-7220 Southern Nevada, 775-687-2240 Northern Nevada).
// - Home Is Possible for Teachers: reverified directly on
//   homeispossiblenv.org/home-possible-teachers during this pass — CURRENT
//   figures (not the older $10,000 figure that circulates in 2016-2020 press
//   coverage): $7,500 usable toward down payment/closing costs, forgivable
//   after 5 years of homeownership, income limit $165,000, no first-time-buyer
//   requirement, same 640/660 credit floor, and — worth flagging — the
//   program's own page states it's available only through December 31, 2026.
// - Worker Advantage Program — the newest, best-corroborated program, and the
//   article's lead hook:
//     - Launched December 10, 2025 (Nevada Housing Division), funded at $18
//       million, targeting roughly 900 Nevada households. Confirmed via the
//       official press release at business.nv.gov and cross-corroborated by
//       local Las Vegas TV coverage (8 News Now, KTNV, Fox5 Vegas) and trade
//       coverage (Hoodline).
//     - $20,000 in down payment assistance, structured as a no-interest,
//       no-payment, non-forgivable 30-year second mortgage — this is stated
//       plainly and consistently on both the official program page and the
//       official press release; NOT self-contradictory like the standard HIP
//       pages above.
//     - Funds can go entirely to down payment/closing costs, or be split to
//       buy down the primary loan's rate via discount points, with any
//       remainder toward down payment/closing costs.
//     - Eligible workers: healthcare, education, public safety, and
//       construction-trades professions (the Division's own eligibility
//       materials enumerate specific job titles in each category; described
//       here only in general terms rather than an exact headcount, since the
//       precise list wasn't independently line-item-verified for this pass).
//     - Income limit: household income at or below 150% of Area Median Income
//       (AMI), which varies by county. CLARK COUNTY FIGURE: $147,300 — this
//       number was read directly off the Nevada Housing Division's own current
//       worker-advantage eligibility table (homeispossiblenv.org/worker-
//       advantage) during this pass, alongside the figures for every other
//       Nevada county on the same table (range: $101,550 in Mineral County to
//       $175,200 in Storey/Washoe Counties), which is internally consistent
//       and was NOT sourced from a secondary real-estate blog. One secondary
//       source found during research (rosehomeslv.com) states $142,350 for
//       Clark County instead — a discrepancy worth knowing about but not
//       enough to override a same-day read of the Division's own published
//       table. AMI limits are reviewed and can change; the article tells
//       readers to confirm the current figure with a participating lender or
//       the Division.
//     - Other requirements: minimum 640 credit score (660 manufactured),
//       6-month Nevada residency, primary-residence purchase up to $832,750,
//       first-come/first-served until funds are reserved, cannot be combined
//       with the standard Home Is Possible grant, HIP for Heroes, or HIP for
//       Teachers.
//     - Enabling legislation: the Nevada Housing Access and Attainability Act
//       (AB540), 2025 Nevada Legislature — confirmed via the official press
//       release.
//     - Quote, Steve Aichroth, Nevada Housing Division Administrator (verified
//       exact text via the official December 10, 2025 press release at
//       business.nv.gov): "Nevada's essential workers keep our communities
//       running—they care for us, teach our children, build our homes, and
//       protect our neighborhoods."
// - This piece deliberately does not re-report the LVR July 2026 market data
//   or the Zillow starter-home research — both are already published and
//   sourced elsewhere on LVINIT and are cited here only as already-established
//   context (las-vegas-home-prices-july-2026, las-vegas-starter-home-
//   prices-2026, what-500k-buys-in-las-vegas).
// - Not tax, legal, or lending advice. Program terms, income limits, and loan
//   limits change; confirm current eligibility and structure with a
//   participating lender or the Nevada Housing Division before assuming any
//   figure here still applies to a specific purchase.
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title: "You Don't Need 20% Down To Buy a Home in Las Vegas | LVINIT",
  headline: "You Don't Need 20% Down To Buy a Home in Las Vegas",
  description:
    "FHA starts at 3.5% down, VA loans can be 0%, and Nevada runs real down-payment-assistance programs, including one that launched in December 2025. Here's what buying with less than 20% down actually looks like.",
  path: "/guides/las-vegas-down-payment-assistance-programs-2026",
  image: "/images/hero/las-vegas-residential-neighborhood-aerial-drone.webp",
  imageWidth: 1908,
  imageHeight: 1070,
  imageAlt:
    "Aerial drone view of a Las Vegas residential neighborhood, with rows of tile-roofed tract homes, rooftop solar panels, and desert mountains under a blue sky in the background.",
  datePublished: "2026-08-29",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    {
      name: "You Don't Need 20% Down To Buy a Home in Las Vegas",
      path: "/guides/las-vegas-down-payment-assistance-programs-2026",
    },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

// FAQ JSON-LD — genuinely useful questions this article answers, kept in sync
// with the article body. Answers rest only on the verified facts documented in
// the header comment above.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do you really need 20% down to buy a house in Las Vegas?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. 20% is the amount that lets you skip mortgage insurance on a conventional loan, not a minimum to qualify. FHA loans allow 3.5% down with a 580+ credit score, VA loans allow 0% down for eligible veterans and service members, and some conventional programs allow as little as 3% down for qualifying buyers. Nevada also runs its own down-payment-assistance programs on top of any of these.",
      },
    },
    {
      "@type": "Question",
      name: "What is the minimum down payment for an FHA loan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "3.5% of the purchase price, if your credit score is 580 or higher. If your score is between 500 and 579, FHA requires 10% down instead. Individual FHA-approved lenders can and often do require a higher score in practice than FHA's own minimum.",
      },
    },
    {
      "@type": "Question",
      name: "Is Nevada's Home Is Possible program the same as Freddie Mac's Home Possible loan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, and the nearly identical names cause real confusion. Home Is Possible (homeispossiblenv.org) is a Nevada state down-payment-assistance program run by the Nevada Housing Division. Home Possible is a separate, national Freddie Mac conventional loan product that allows as little as 3% down for income-qualified buyers, capped at 80% of the area median income for the property's location. They come from different organizations, with different eligibility rules, and a buyer could in some cases use Nevada's assistance alongside a Home Possible loan, but they are not the same program.",
      },
    },
    {
      "@type": "Question",
      name: "What is Nevada's Worker Advantage Program?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Nevada Housing Division program launched December 10, 2025, offering $20,000 in down payment assistance to essential workers in healthcare, education, public safety, and construction trades. It's structured as a no-interest, no-payment, non-forgivable 30-year second mortgage, funded at $18 million to help roughly 900 Nevada households, first-come/first-served until the funds are reserved. Eligibility includes a household income at or below 150% of the area median income for the county (Clark County's current limit is $147,300, per the Division's own eligibility table), a minimum 640 credit score, and at least 6 months of Nevada residency.",
      },
    },
    {
      "@type": "Question",
      name: "Is Nevada's down payment assistance forgivable, or does it have to be paid back?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on the specific program and track, and Nevada Housing Division's own materials aren't fully consistent about it. The Worker Advantage Program's $20,000 is explicitly non-forgivable, a 30-year second mortgage repaid with no interest and no monthly payments. Home Is Possible for Teachers, by contrast, is forgivable after 5 years. The standard Home Is Possible grant's forgiveness structure differs between the Division's own program pages depending on the buyer track. Confirm the exact structure for your situation with a participating lender or the Division directly before assuming either outcome.",
      },
    },
  ],
};

const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

type MinRow = { loan: string; down: string; note: string };

const MINIMUMS: MinRow[] = [
  { loan: "FHA", down: "3.5%", note: "with a 580+ credit score (10% for 500-579)" },
  { loan: "VA", down: "0%", note: "for eligible veterans, service members, some surviving spouses" },
  { loan: "Conventional, qualifying buyers", down: "3%", note: "income-restricted programs (e.g. Freddie Mac Home Possible)" },
  { loan: "Conventional, typical", down: "5%", note: "the more common conventional minimum otherwise" },
];

function MinimumsPanel() {
  return (
    <section id="the-minimums" aria-label="Minimum down payment by loan type" className="scroll-mt-24">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            The actual minimums, by loan type
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            None of these require 20% down. 20% is the threshold that lets you
            skip mortgage insurance on a conventional loan, not a minimum to
            qualify for financing.
          </p>

          <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-lvinit-lightgray bg-lvinit-lightgray sm:grid-cols-2 lg:grid-cols-4">
            {MINIMUMS.map((m) => (
              <div key={m.loan} className="bg-lvinit-white p-6">
                <dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                  {m.loan}
                </dt>
                <dd className="mt-2 font-display text-heading font-bold text-lvinit-blue">
                  {m.down}
                </dd>
                <p className="mt-2 text-caption text-lvinit-warmgray">{m.note}</p>
              </div>
            ))}
          </dl>

          <p className="mt-6 max-w-[680px] text-caption text-lvinit-warmgray">
            USDA loans can also reach 0% down, but only in eligible rural
            areas, so they aren&rsquo;t shown here as a general Las Vegas Valley
            option. Loan terms and program income/price limits change; confirm
            current numbers with a lender before budgeting around any figure
            here.
          </p>
        </div>
      </Container>
    </section>
  );
}

export default function LasVegasDownPaymentAssistanceProgramsPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Buyer Guide",
        headline: "You Don't Need 20% Down To Buy a Home in Las Vegas",
        subheadline:
          "It's the most common reason buyers think they're years away from owning here. FHA starts at 3.5% down, VA can be 0%, and Nevada runs real down-payment-assistance programs on top of any of them, including one most Las Vegas buyers haven't heard of yet.",
        image: "/images/hero/las-vegas-residential-neighborhood-aerial-drone.webp",
        imageAlt:
          "Aerial drone view of a Las Vegas residential neighborhood, with rows of tile-roofed tract homes, rooftop solar panels, and desert mountains under a blue sky in the background.",
        backLink: { label: "LVINIT", href: "/" },
        ctas: [{ label: "See the minimums", href: "#the-minimums", variant: "primary" }],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "The down payment is one piece of what it actually costs to buy here. These go further into the rest of it.",
        stories: [
          {
            name: "What $500K Buys in Las Vegas",
            href: "/guides/what-500k-buys-in-las-vegas",
            category: "Buyer guide",
            dek: "Three real home tours near the same budget, a concrete look at what your monthly numbers would actually be financing against.",
          },
          {
            name: "Las Vegas Starter Homes Have More Than Doubled Since 2016",
            href: "/guides/las-vegas-starter-home-prices-2026",
            category: "Market Watch",
            dek: "What the entry tier of the market actually costs right now, and why the down payment question matters more at that price point, not less.",
          },
          {
            name: "Why the Seller's Nevada Property Tax Bill May Not Be Yours",
            href: "/guides/nevada-property-tax-abatement-resale-buyers",
            category: "Cost of living",
            dek: "The other number on a resale listing that isn't automatically yours. Worth understanding before you finalize a budget.",
          },
        ],
      }}
      ctas={{
        heading: "Not sure which loan type or program actually fits you?",
        body:
          "The math is different for everyone: credit score, income, whether you've owned before, what you do for work. Tell me where you're starting from, and I'll help you figure out which door is actually open, before you rule yourself out over a number that isn't the real requirement.",
      }}
    >
      <StoryLede
        kicker="Buyer Guide"
        lead="Ask people why they haven't started looking for a home in Las Vegas, and one answer comes up constantly: they think they need 20% down first. It's one of the most common, most avoidable reasons a ready buyer waits years longer than they actually have to."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          20% is a threshold, not a requirement. It&rsquo;s the amount that lets
          you skip private mortgage insurance on a conventional loan. It has
          nothing to do with the minimum amount a lender will actually let you
          put down. The real minimums are lower, in some cases much lower, and
          Nevada runs its own down-payment-assistance programs that can close
          the rest of the gap. Here&rsquo;s what&rsquo;s actually required, and
          what&rsquo;s actually available.
        </p>
      </StoryLede>

      <MinimumsPanel />

      <StorySection heading="The fine print on each loan type">
        <ul className="space-y-4 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">FHA</span>: 3.5% down with a
              credit score of 580 or higher. If your score is between 500 and
              579, FHA requires 10% down instead. Note that many
              FHA-approved lenders set their own, stricter minimum score in
              practice, even though FHA&rsquo;s own floor is lower.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">VA</span>: 0% down for
              eligible veterans, active-duty service members, and some
              surviving spouses with a Certificate of Eligibility. There&rsquo;s
              no monthly mortgage insurance, but most borrowers pay a one-time
              VA funding fee, commonly around 2.15% of the loan amount on a
              first use with nothing down (less if you put more down), usually
              rolled into the loan rather than paid out of pocket. Veterans
              receiving VA disability compensation, Purple Heart recipients on
              active duty, and certain surviving spouses are exempt from the
              fee entirely.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Conventional</span>: as low
              as 3% down through specific programs built for qualifying
              buyers, income-restricted (Freddie Mac Home Possible and Fannie
              Mae HomeReady are the two you&rsquo;ll hear about most). Outside
              those programs, 5% is the more typical conventional minimum.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">USDA</span>: 0% down exists,
              but it&rsquo;s restricted to eligible rural areas and household
              income limits. We haven&rsquo;t verified that any specific Las
              Vegas Valley address qualifies, so treat this as a general
              option elsewhere in Nevada rather than something to count on
              here.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="Two programs with almost the same name that are not the same thing">
        <p className="text-body-lg text-lvinit-warmgray">
          Here&rsquo;s a mix-up worth clearing up directly, because the names
          are genuinely confusing. Nevada&rsquo;s state down-payment-assistance
          program is branded{" "}
          <span className="text-lvinit-black">Home Is Possible</span>{" "}
          (homeispossiblenv.org), run by the Nevada Housing Division.
          Separately, Freddie Mac has a national conventional loan product
          called <span className="text-lvinit-black">Home Possible</span> that
          allows as little as 3% down for income-qualified buyers, capped at
          80% of the area median income for wherever the property sits.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          These are two unrelated things from two different organizations.
          Nevada&rsquo;s Home Is Possible is assistance money layered on top
          of a loan (conventional, FHA, USDA, or VA); Freddie Mac&rsquo;s Home
          Possible is the loan itself. In some cases a buyer could actually use
          both at once, Nevada&rsquo;s assistance covering part of the down
          payment on a Freddie Mac Home Possible loan, but they&rsquo;re not
          interchangeable, and assuming one is the other is a good way to
          misunderstand what you actually qualify for.
        </p>
      </StorySection>

      <StorySection heading="Nevada's own assistance: Home Is Possible">
        <p className="text-body-lg text-lvinit-warmgray">
          The Nevada Housing Division&rsquo;s Home Is Possible program comes in
          more than one track, and it&rsquo;s worth being upfront that the
          Division&rsquo;s own current pages don&rsquo;t fully agree with each
          other on the specifics, so we&rsquo;re presenting exactly what each
          says rather than picking one number to round to.
        </p>
        <ul className="mt-5 space-y-4 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              The general track, with{" "}
              <span className="text-lvinit-black">no first-time-buyer
              requirement</span>, describes assistance of{" "}
              <span className="text-lvinit-black">up to 5% of the loan
              value</span> toward down payment or closing costs. Minimum
              credit score 640 (660 for manufactured homes), qualifying income
              up to $165,000, home price up to $832,750, and it works with
              conventional, FHA, USDA, or VA financing.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              A separate track, restricted to buyers who{" "}
              <span className="text-lvinit-black">haven&rsquo;t owned a home
              in the past 3 years</span>, describes assistance of{" "}
              <span className="text-lvinit-black">up to 4% of the total loan
              amount</span>, structured as a 30-year, non-forgivable second
              loan at a fixed rate for the term.
            </span>
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          5% versus 4%, and one page states a non-forgivable structure while
          the other doesn&rsquo;t state a repayment structure at all. That&rsquo;s
          not us rounding carelessly, that&rsquo;s what the Division&rsquo;s own
          site currently shows. Which track, percentage, and structure applies
          to you depends on your situation and your lender&rsquo;s enrollment
          in the program, so confirm it directly with a participating lender or
          the Nevada Housing Division (702-486-7220 in Southern Nevada,
          775-687-2240 in Northern Nevada) before assuming which number is
          yours.
        </p>
      </StorySection>

      <StorySection muted heading="Home Is Possible for Teachers">
        <p className="text-body-lg text-lvinit-warmgray">
          The Division also runs a teacher-specific track: currently{" "}
          <span className="text-lvinit-black">$7,500</span> toward down
          payment or closing costs, forgivable after 5 years of homeownership,
          for licensed full-time K-12 public school classroom teachers, no
          first-time-buyer requirement, income limit $165,000, same 640/660
          credit floor as the other Home Is Possible tracks. Worth flagging:
          the program&rsquo;s own page currently states it&rsquo;s available
          only through <span className="text-lvinit-black">December 31,
          2026</span>, so a teacher weighing this shouldn&rsquo;t assume it
          will still be open next year.
        </p>
      </StorySection>

      <StorySection heading="The newest option: the Worker Advantage Program">
        <p className="text-body-lg text-lvinit-warmgray">
          This is the piece most Las Vegas buyers haven&rsquo;t heard of yet,
          because it&rsquo;s less than a year old. The Nevada Housing Division
          launched the{" "}
          <span className="text-lvinit-black">Worker Advantage Program</span>{" "}
          on <span className="text-lvinit-black">December 10, 2025</span>,
          funded at <span className="text-lvinit-black">$18 million</span> to
          help roughly <span className="text-lvinit-black">900 Nevada
          households</span>. It offers{" "}
          <span className="text-lvinit-black">$20,000</span> in down payment
          assistance, structured as a no-interest, no-payment, non-forgivable
          30-year second mortgage, one of the more concrete, unambiguous
          structures among Nevada&rsquo;s assistance programs.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Buyers can put the full $20,000 toward their down payment, or split
          it: using part to buy down the primary loan&rsquo;s interest rate
          through discount points, with the remainder going toward down
          payment or closing costs.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It&rsquo;s not open to everyone. Eligibility is built around{" "}
          <span className="text-lvinit-black">essential workers</span> in
          healthcare, education, public safety, and construction trades.
          Household income has to be at or below{" "}
          <span className="text-lvinit-black">150% of the area median income
          (AMI)</span> for the county, which varies statewide. In{" "}
          <span className="text-lvinit-black">Clark County, that limit is
          currently $147,300</span>, per the Division&rsquo;s own eligibility
          table. Other requirements: a minimum 640 credit score (660 for
          manufactured homes), at least 6 months of Nevada residency, and a
          primary-residence purchase price up to $832,750. It&rsquo;s
          first-come, first-served until the $18 million is reserved, and it
          can&rsquo;t be combined with the standard Home Is Possible grant,
          HIP for Heroes, or HIP for Teachers.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The program came out of the{" "}
          <span className="text-lvinit-black">Nevada Housing Access and
          Attainability Act</span> (AB540), passed by the 2025 Nevada
          Legislature. Local Las Vegas TV coverage (8 News Now, KTNV, Fox5
          Vegas) corroborated the launch alongside the Division&rsquo;s own
          announcement.
        </p>
      </StorySection>

      <StoryPullQuote cite="Steve Aichroth, Nevada Housing Division Administrator">
        Nevada&rsquo;s essential workers keep our communities running—they
        care for us, teach our children, build our homes, and protect our
        neighborhoods.
      </StoryPullQuote>

      <StorySection muted heading="What this means for your timeline">
        <p className="text-body-lg text-lvinit-warmgray">
          Put this next to the rest of what LVINIT has already reported this
          year and the picture gets more useful, not less. Las Vegas home
          prices{" "}
          <Link href="/guides/las-vegas-home-prices-july-2026" className={linkCls}>
            pulled back from a record high in July 2026
          </Link>
          , and the{" "}
          <Link href="/guides/las-vegas-starter-home-prices-2026" className={linkCls}>
            starter tier of the market
          </Link>{" "}
          eased slightly too, even after more than doubling over the past
          decade. Neither of those is a dramatic correction. But if the thing
          actually holding you back was a belief that you needed six figures
          saved up before you could even apply, that belief was never
          accurate, and it&rsquo;s worth separating from the real question of
          whether current prices and rates work for your budget.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          A concrete example helps here more than a rule of thumb does. Our{" "}
          <Link href="/guides/what-500k-buys-in-las-vegas" className={linkCls}>
            look at three real homes near $500K
          </Link>{" "}
          shows what that budget actually buys around the valley. Run the
          minimums above against a number like that, and the down payment on a
          $500K home with, say, an FHA loan is roughly $17,500, not the
          $100,000 that 20% would imply, before any assistance program is even
          factored in.
        </p>
      </StorySection>

      <StorySection heading="What to actually do next">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Talk to a lender about your actual credit score and loan options
              before ruling yourself out. The FHA/VA/conventional minimums
              above are the floor, not a guess.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              If you work in healthcare, education, public safety, or a
              construction trade, ask your lender directly whether they
              participate in the Worker Advantage Program before you assume
              it&rsquo;s unavailable or already exhausted.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Don&rsquo;t assume Nevada&rsquo;s Home Is Possible and Freddie
              Mac&rsquo;s Home Possible are the same conversation with your
              lender. Ask about each by name.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              If you&rsquo;re a K-12 teacher, ask now whether Home Is Possible
              for Teachers is still funded and available before December 31,
              2026 rather than waiting until later in the year.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Confirm every income limit, price cap, and repayment structure
              directly with a participating lender or the Nevada Housing
              Division before you build a budget around it. These programs
              change.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Nevada Housing Division</span>.
            Official program pages, current as of this writing:{" "}
            <a href="https://homeispossiblenv.org/home-possible" className={linkCls} target="_blank" rel="noopener noreferrer">
              Home Is Possible
            </a>
            ,{" "}
            <a href="https://homeispossiblenv.org/home-possible-program" className={linkCls} target="_blank" rel="noopener noreferrer">
              the first-time-buyer track
            </a>
            ,{" "}
            <a href="https://homeispossiblenv.org/home-possible-teachers" className={linkCls} target="_blank" rel="noopener noreferrer">
              Home Is Possible for Teachers
            </a>
            , and{" "}
            <a href="https://homeispossiblenv.org/worker-advantage" className={linkCls} target="_blank" rel="noopener noreferrer">
              Worker Advantage
            </a>
            , the source for every Nevada program detail, credit-score floor,
            income limit, and the Clark County AMI figure above.
          </li>
          <li>
            <span className="text-lvinit-black">Nevada Governor&rsquo;s Office of Business and Industry (business.nv.gov)</span>
            . &ldquo;Nevada Housing Division Launches New Down Payment
            Assistance Program to Help Essential Workers Become
            Homeowners,&rdquo; December 10, 2025 — source for the Worker
            Advantage launch date, funding amount, household target, and the
            quote from Administrator Steve Aichroth, at{" "}
            <a
              href="https://www.business.nv.gov/news-media/press-releases/2025/housing/nevada-housing-division-launches-new-down-payment-assistance-program-to-help-essential-workers-become-homeowners"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              business.nv.gov
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Local Las Vegas television coverage</span>{" "}
            corroborating the Worker Advantage launch: 8 News Now, KTNV, and
            Fox5 Vegas.
          </li>
          <li>
            <span className="text-lvinit-black">Freddie Mac</span>. Official
            Home Possible program pages and February 2026 fact sheet — source
            for the 3% conventional down payment minimum, the 80% area-median-income
            limit, and the 2026 conforming loan limits, at{" "}
            <a href="https://sf.freddiemac.com/working-with-us/origination-underwriting/mortgage-products/home-possible" className={linkCls} target="_blank" rel="noopener noreferrer">
              sf.freddiemac.com
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">FHA and VA program minimums</span>{" "}
            — the 3.5%/580 and 10%/500-579 FHA thresholds, and the VA funding
            fee structure and exemptions, are well-established, multi-source-
            confirmed federal loan program rules, cross-checked across
            Freedom Mortgage, AmeriSave, Veterans United, and VA.gov during
            this pass.
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          This article is general information, not lending, tax, or financial
          advice. Program terms, income and price limits, credit-score
          requirements, and funding availability change and can be exhausted
          before a program&rsquo;s stated end date. Confirm current eligibility and
          structure with a participating lender or the Nevada Housing Division
          before making a decision.
        </p>
      </StorySection>

      <StorySection heading="About this coverage">
        <p className="text-body text-lvinit-warmgray">
          Mikey Del Rosario · Las Vegas Real Estate Advisor · The Scofield
          Group · Nevada License S.0175577. Equal Housing Opportunity.
        </p>
      </StorySection>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </StoryPage>
  );
}
