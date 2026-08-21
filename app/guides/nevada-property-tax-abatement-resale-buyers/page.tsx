import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryPullQuote,
} from "@/components/story";

// ---------------------------------------------------------------------------
// COST OF LIVING / HOMEOWNERSHIP — Nevada's property tax abatement (cap) and
// the resale-buyer surprise it causes.
//
// FACT DISCIPLINE (read before editing):
// - Statute: NRS 361.4723 (Nevada's partial abatement of taxes on certain
//   single-family residences). The Legislature's own finding in the statute is
//   that a tax-bill increase of more than 3% year over year on an owner's
//   primary residence constitutes "severe economic hardship" under Article 10,
//   Section 1(10) of the Nevada Constitution. Verified via web search against
//   Justia's summary of the statute; primary citation used in-article is the
//   Nevada Legislature's own NRS Chapter 361 page (confirmed live, HTTP 200):
//   https://www.leg.state.nv.us/NRS/NRS-361.html#NRS361Sec4723
// - Two caps: owner-occupied primary residence (house, townhouse, condo, or
//   manufactured home on land) is capped at 3% per year. Everything else
//   (non-owner-occupied residential, land, commercial, business personal
//   property, aircraft) is capped at UP TO 8% — a ceiling, not a flat rate.
//   The actual annual figure is the greater of (a) the average percentage
//   change in assessed valuation of all taxable property in the county over
//   the fiscal year and the 9 preceding fiscal years, or (b) twice the
//   percentage increase in the national CPI-U — whichever of those two
//   applies, the final abatement percentage used is 0%, 3%, or 8%, whichever
//   is LESS than that calculated figure. Do NOT assert a specific lower
//   current-year computed number for the non-primary cap; only state that
//   both the 3% and 8% ceilings were confirmed current for Clark County FY
//   2026-27 by the Nevada Department of Taxation's own "Preliminary Revenue
//   Projections 26.27" document (confirmed live, HTTP 200):
//   https://tax.nv.gov/wp-content/uploads/2026/03/Preliminary-Revenue-Projections-26.27.pdf
// - The reset-on-sale mechanic and the "it's not automatic" framing come
//   directly from the Clark County Assessor's own official tax-abatement page
//   (confirmed live, HTTP 200):
//   https://www.clarkcountynv.gov/government/general_information/tax_abatement.php
//   — quoted language: "Any ownership document recorded will remove your
//   Owner Occupied 3% abatement."
// - The one attributed quote — Clark County Assessor Briana Johnson: "It is
//   not an automatic 3%, they have to apply for that." — is real and
//   confirmed via Fox5 Vegas (KVVU), "New Clark County homeowners must fill
//   out tax cap notices being mailed to prevent increase in property taxes,"
//   July 27, 2023 (confirmed live, HTTP 200):
//   https://www.fox5vegas.com/2023/07/27/new-clark-county-homeowners-must-fill-out-tax-cap-notices-being-mailed-prevent-increase-property-taxes/
//   Per instruction, that article's specific year-dated filing deadline
//   ("by June 2024") is NOT repeated here — only the general postcard/notice
//   process and the quote are used, since the deadline is stale.
// - Assessor's office phone for tax-cap questions: (702) 455-3882, sourced
//   from the Assessor's own page above.
// - No dollar-figure example is presented as real. The one example used below
//   (a neighbor's identical house with a lower bill) is explicitly hypothetical.
// - This is an ownership-cost / legal-mechanics explainer, not market news — it
//   does not restate or re-cite the LVR market statistics already covered in
//   /guides/las-vegas-home-prices-july-2026; that piece is linked as further
//   reading on the broader cost picture, not re-reported here.
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title: "Why Your Nevada Property Tax Bill Won't Match the Seller's | LVINIT",
  headline: "Why Your Nevada Property Tax Bill Won't Match the Seller's",
  description:
    "Nevada caps property tax increases at 3% a year for owner-occupied homes — but that cap resets when a home sells, and it isn't automatic. Here's the mechanism resale buyers need to know before they trust a listing's tax number.",
  path: "/guides/nevada-property-tax-abatement-resale-buyers",
  datePublished: "2026-08-21",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    {
      name: "Why Your Nevada Property Tax Bill Won't Match the Seller's",
      path: "/guides/nevada-property-tax-abatement-resale-buyers",
    },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

// FAQ JSON-LD — three genuinely useful questions this article answers, kept
// in sync with the article body. Answers rest only on the verified facts
// documented in the header comment above.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Why did my property taxes jump after buying a resale home in Nevada?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nevada caps how much a homeowner's property tax bill can rise each year, but that cap is tied to the owner, not the house. Per the Clark County Assessor's own tax-abatement page, any recorded ownership document removes the previous owner's 3% abatement — so when a home sells, the buyer's own bill is recalculated and the abatement has to be claimed again. If it isn't claimed in time, the new bill can be assessed nearer the much higher non-owner-occupied ceiling instead of the 3% primary-residence cap.",
      },
    },
    {
      "@type": "Question",
      name: "Is Nevada's 3% property tax cap automatic when you buy a house?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Clark County Assessor Briana Johnson has said it directly: \"It is not an automatic 3%, they have to apply for that.\" The Assessor's office mails new owners a notice after an ownership change; the owner has to complete and return it to claim (or reclaim) the 3% owner-occupied primary-residence cap. Call the Assessor's Office at (702) 455-3882 if you're unsure whether yours is on file.",
      },
    },
    {
      "@type": "Question",
      name: "What's the difference between Nevada's 3% and 8% property tax caps?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The 3% cap applies to an owner-occupied primary residence — a single-family house, townhouse, condo, or manufactured home on land, one per owner. Everything else — non-owner-occupied residential property, land, commercial property, business personal property, and aircraft — is capped at up to 8%. That 8% is a ceiling, not a flat rate: the actual figure is recalculated every year from a statutory formula and is never allowed to exceed 8%. Nevada's Department of Taxation confirmed both the 3% and 8% ceilings as current for Clark County in its Preliminary Revenue Projections for fiscal year 2026-27.",
      },
    },
  ],
};

const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

export default function NevadaPropertyTaxAbatementResaleBuyersPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Cost of Living",
        headline: "Why Your Nevada Property Tax Bill Won't Match the Seller's",
        subheadline:
          "Nevada's property tax cap is one of the best deals a homeowner can get — a 3% ceiling on how much your bill can rise each year. It's also tied to the owner, not the house, and it resets the day a resale home changes hands.",
        backLink: { label: "LVINIT", href: "/" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "This is one piece of the real cost of owning here. These go further into the rest of it.",
        stories: [
          {
            name: "Las Vegas Home Prices Pulled Back in July 2026",
            href: "/guides/las-vegas-home-prices-july-2026",
            category: "Market Watch",
            dek: "The broader price picture — where the median actually sits right now, and what moved it.",
          },
          {
            name: "What $500K Buys in Las Vegas",
            href: "/guides/what-500k-buys-in-las-vegas",
            category: "Buyer guide",
            dek: "Three real home tours near the same budget — a concrete look at what a purchase actually costs beyond the sticker price.",
          },
          {
            name: "Summerlin vs. Henderson",
            href: "/guides/summerlin-vs-henderson",
            category: "Comparisons",
            dek: "An honest read on two of the valley's most-recommended suburbs, if you're still deciding where to buy.",
          },
        ],
      }}
      ctas={{
        heading: "Not sure what your actual tax bill will look like?",
        body:
          "Tell me the address you're considering, and I'll walk you through how the cap works for that specific property before you make an offer — not after you're surprised by the first bill.",
      }}
    >
      <StoryLede
        kicker="Cost of Living"
        lead="Almost every resale listing in Las Vegas shows a property tax number, and almost every buyer assumes that number is what they'll pay. It usually isn't — and the reason is a genuinely good piece of Nevada law that most people have never heard explained clearly."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Nevada caps how much a homeowner&rsquo;s property tax bill can rise
          in a single year. That cap is real, it&rsquo;s written into state
          law, and it has quietly saved longtime owners a lot of money. The
          part that catches resale buyers off guard is simpler than any of the
          math: the cap belongs to the owner, not the house, and it doesn&rsquo;t
          automatically follow you into a new purchase.
        </p>
      </StoryLede>

      <StorySection heading="The mechanism: Nevada's property tax cap">
        <p className="text-body-lg text-lvinit-warmgray">
          The law behind this is{" "}
          <a
            href="https://www.leg.state.nv.us/NRS/NRS-361.html#NRS361Sec4723"
            className={linkCls}
            target="_blank"
            rel="noopener noreferrer"
          >
            NRS 361.4723
          </a>
          , Nevada&rsquo;s partial abatement of taxes on single-family
          residences. The Nevada Legislature&rsquo;s own finding, written
          directly into the statute, is that a property tax increase of more
          than 3% in a single year on a homeowner&rsquo;s primary residence
          amounts to a &ldquo;severe economic hardship&rdquo; under the Nevada
          Constitution. So the law caps it there.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          There are really two different caps, and mixing them up is where a
          lot of the confusion starts:
        </p>
        <ul className="mt-5 space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Owner-occupied primary residence</span>{" "}
              — a single-family house, townhouse, condo, or manufactured home
              on land that you actually live in, one property per owner — is
              capped at <span className="text-lvinit-black">3% per year</span>.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Everything else</span> —
              non-owner-occupied residential property, rentals, land,
              commercial property, business personal property, aircraft — is
              capped at{" "}
              <span className="text-lvinit-black">up to 8% per year</span>.
            </span>
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That &ldquo;up to&rdquo; matters. The 8% figure people quote is a
          ceiling, not a flat rate every non-primary property automatically
          pays. The real annual number is recalculated every year from a
          formula — the greater of the average change in assessed valuation
          across the county over the current and nine prior fiscal years, or
          twice the national CPI-U — and then capped at whichever of 0%, 3%,
          or 8% is lower than that result. Nevada&rsquo;s Department of
          Taxation confirmed both the 3% and 8% ceilings as current for Clark
          County in its{" "}
          <a
            href="https://tax.nv.gov/wp-content/uploads/2026/03/Preliminary-Revenue-Projections-26.27.pdf"
            className={linkCls}
            target="_blank"
            rel="noopener noreferrer"
          >
            Preliminary Revenue Projections
          </a>{" "}
          for fiscal year 2026-27. We&rsquo;re not going to hand you a
          computed number below that ceiling here — the honest version is
          that 8% is the maximum a non-primary bill could rise, not a promise
          of what it will.
        </p>
      </StorySection>

      <StorySection heading="The part nobody explains to resale buyers">
        <p className="text-body-lg text-lvinit-warmgray">
          Here&rsquo;s the mechanic that actually affects you as a buyer. The
          3% cap isn&rsquo;t attached to the house forever — it&rsquo;s
          attached to the current owner claiming it as their primary
          residence. The Clark County Assessor&rsquo;s own tax-abatement page
          says this plainly: &ldquo;Any ownership document recorded will
          remove your Owner Occupied 3% abatement.&rdquo; Sell the house, and
          the seller&rsquo;s abatement goes with them.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          And it doesn&rsquo;t come back automatically for the new owner,
          either. Clark County Assessor Briana Johnson has said this directly
          about the process: &ldquo;It is not an automatic 3%, they have to
          apply for that.&rdquo; When ownership changes, the Assessor&rsquo;s
          office mails the new owner a notice asking them to confirm the
          property is their primary residence. That notice has to be
          completed and returned to claim the 3% cap — skip it, or miss the
          window, and the property can be assessed nearer the non-owner-occupied
          ceiling instead.
        </p>
      </StorySection>

      <StoryPullQuote cite="Briana Johnson, Clark County Assessor">
        It is not an automatic 3%, they have to apply for that.
      </StoryPullQuote>

      <StorySection muted heading="Why this trips people up specifically on a resale purchase">
        <p className="text-body-lg text-lvinit-warmgray">
          A new-construction home doesn&rsquo;t have this problem in quite the
          same way — it&rsquo;s taxed at full assessed value in the year it&rsquo;s
          built, with no abatement, and only picks up whichever cap applies
          starting the following fiscal year. Resale is where the surprise
          lives, because a resale listing&rsquo;s advertised &ldquo;current
          taxes&rdquo; figure is the seller&rsquo;s bill — a bill that may
          have been quietly capped at 3% growth for years, even while the
          home&rsquo;s real assessed value climbed faster than that. After
          the sale is recorded, that suppressed number resets. Your own first
          bill as the new owner gets recalculated, and until you successfully
          file the primary-residence claim, it can land closer to the
          non-owner-occupied ceiling than to 3%.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Put concretely and purely hypothetically: say a longtime owner
          two doors down from a house you&rsquo;re considering has an
          identical floor plan and a noticeably lower tax bill. That&rsquo;s
          very possibly this exact mechanism at work — years of a 3% cap
          holding their bill well below what the home would be assessed at
          today — not a pricing error, and not something you inherit just by
          buying next door.
        </p>
      </StorySection>

      <StorySection heading="What to actually do about it">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Don&rsquo;t treat a resale listing&rsquo;s &ldquo;current
              taxes&rdquo; line as your future bill. It reflects the
              seller&rsquo;s capped history, not your recalculated number as
              the new owner.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              When the Assessor&rsquo;s office mails you a notice after
              closing, complete and return it right away. That&rsquo;s the
              step that claims your 3% owner-occupied cap — it doesn&rsquo;t
              happen on its own.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              If you ever think your cap percentage is wrong — too high, or
              missing the primary-residence rate you&rsquo;re entitled to —
              call the Clark County Assessor&rsquo;s Office directly at{" "}
              <span className="text-lvinit-black">(702) 455-3882</span>. This
              is their process, not something a lender or agent can fix for
              you.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Build your monthly-payment math around your own recalculated
              bill, not the seller&rsquo;s. That number can be meaningfully
              higher than what&rsquo;s printed on the listing, and it belongs
              in your budget before you write an offer, not after your first
              bill arrives.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Mikey's take">
        <p className="text-body-lg text-lvinit-warmgray">
          This isn&rsquo;t a flaw in the system — the 3% cap is a genuinely
          good protection, and it&rsquo;s one of the quieter reasons owning in
          Nevada can be more predictable than owning in a lot of other states.
          The problem is purely that almost nobody explains the ownership-reset
          part before someone&rsquo;s standing at the closing table. If you
          take one thing from this: the tax number on a resale listing tells
          you about the seller&rsquo;s history, not your future bill — and the
          fix is a form you have to actually send back, not something that
          happens for you.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If you&rsquo;re weighing a specific resale property and want the
          real picture before you write an offer, that&rsquo;s a conversation
          worth having early. And if the tax question is only one piece of a
          bigger &ldquo;can I actually afford this&rdquo; question, the{" "}
          <Link href="/guides/las-vegas-home-prices-july-2026" className={linkCls}>
            current market numbers
          </Link>{" "}
          and a look at{" "}
          <Link href="/guides/what-500k-buys-in-las-vegas" className={linkCls}>
            what a real budget buys
          </Link>{" "}
          are good next stops, or just{" "}
          <Link href="/search" className={linkCls}>
            browse current listings
          </Link>{" "}
          with this in mind.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Nevada Revised Statutes</span>{" "}
            — NRS 361.4723, partial abatement of taxes levied on certain
            single-family residences —{" "}
            <a
              href="https://www.leg.state.nv.us/NRS/NRS-361.html#NRS361Sec4723"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              leg.state.nv.us
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">
              Clark County Assessor&rsquo;s Office
            </span>{" "}
            — official tax-abatement page, source for the 3%/8% caps, the
            ownership-reset rule, and the (702) 455-3882 tax-cap contact
            line —{" "}
            <a
              href="https://www.clarkcountynv.gov/government/general_information/tax_abatement.php"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              clarkcountynv.gov
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">
              Nevada Department of Taxation
            </span>{" "}
            — &ldquo;Preliminary Revenue Projections 26.27,&rdquo; confirming
            the 3% and 8% abatement ceilings for Clark County for fiscal year
            2026-27 —{" "}
            <a
              href="https://tax.nv.gov/wp-content/uploads/2026/03/Preliminary-Revenue-Projections-26.27.pdf"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              tax.nv.gov
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Vegas (KVVU)</span> —
            &ldquo;New Clark County homeowners must fill out tax cap notices
            being mailed to prevent increase in property taxes,&rdquo; July
            27, 2023, source for the Assessor&rsquo;s quote and the general
            new-owner notice process —{" "}
            <a
              href="https://www.fox5vegas.com/2023/07/27/new-clark-county-homeowners-must-fill-out-tax-cap-notices-being-mailed-prevent-increase-property-taxes/"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
            .
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          This article explains a public tax mechanism in general terms. It
          isn&rsquo;t tax, legal, or financial advice, and abatement
          percentages, deadlines, and county processes can change — confirm
          the current process and any property-specific figure with the
          Clark County Assessor&rsquo;s Office before making a decision.
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
