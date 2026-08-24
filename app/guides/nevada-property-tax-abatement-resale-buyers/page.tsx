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
// what a resale buyer actually needs to verify before closing.
//
// CORRECTION PASS (2026-08-22): the original version of this article claimed
// the seller's capped tax history "resets" and the buyer's bill gets
// "recalculated" at sale. No source supports that — Nevada does not reassess
// a home's taxable value to its sale price. What changes at a recorded
// transfer is the OWNER-OCCUPIED DESIGNATION, not the underlying assessed
// value. This pass rebuilds the article around that distinction and adds the
// October 1, 2025 filing-at-transfer pathway (AB377). Every source below was
// independently re-fetched/re-confirmed during this correction pass.
//
// FACT DISCIPLINE (read before editing):
// - NRS 361.4723 (owner-occupied primary residence, 3% cap): text confirmed
//   directly against the enrolled bill (AB377, 83rd Session (2025), Sec. 1,
//   archive.leg.state.nv.us/Session/83rd2025/Bills/AB/AB377_EN.pdf) and
//   nevada.public.law/statutes/nrs_361.4723. The statute itself does NOT say
//   what happens to abatement status the instant ownership changes — that
//   specific fact comes from Clark County Assessor's administrative guidance,
//   not the statute. Keep statute and county administrative practice clearly
//   distinguished in the article text.
// - NRS 361.4724 (qualifying residential RENTAL dwellings — rent at or below
//   HUD's published fair market rent for the county — also get the 3% cap,
//   not just owner-occupied primary residences): confirmed against the same
//   enrolled bill, Sec. 2, and nevada.public.law/statutes/nrs_361.4724. This
//   means "everything else is capped at 8%" is a false blanket statement.
//   Article language is scoped to "an owner-occupied primary residence"
//   specifically, with one sentence flagging the rental carve-out and its own
//   citation, rather than describing what "everything else" gets.
// - NRS 361.4722 (general/other-property abatement — the "up to 8%" figure):
//   confirmed via nevada.public.law/statutes/nrs_361.4722. The real mechanism
//   is NOT a choice among 0%/3%/8%. It's the GREATER of (a) the average
//   change in assessed valuation of all taxable property in the county over
//   the current and 9 preceding fiscal years, or (b) twice the CPI-U increase
//   — floored at zero — with the resulting figure capped at a MAXIMUM of 8%.
//   Per Mikey's pre-approved simplification, the article states this as
//   "Nevada's separate statutory abatement formula, subject to an 8% maximum"
//   rather than risk a wrong technical restatement.
// - AB377 (2025 Nevada Legislature, 83rd Session), effective October 1, 2025:
//   confirmed by reading the enrolled bill PDF directly (Sec. 3, amending NRS
//   375.060). It requires the Nevada Tax Commission's Declaration of Value
//   form — filed with every deed presented for recording — to include a
//   section where an owner can claim the NRS 361.4723 or 361.4724 partial
//   abatement AT THE TIME OF TRANSFER. The county recorder cannot charge a
//   fee for recording it (NRS 375.060(3)). Also confirmed current/live at
//   leg.state.nv.us/nrs/nrs-375.html#NRS375Sec060 as of this pass. This is a
//   genuinely new, current pathway and is the article's featured "what to
//   actually do" step; the older assessor-mailed-postcard process is
//   described as the pre-existing/backup mechanism, since Clark County's own
//   page (below) still describes only that postcard process.
// - Clark County Assessor's official tax-abatement page (confirmed live):
//   https://www.clarkcountynv.gov/government/general_information/tax-abatement
//   — quoted language: "Any ownership document recorded will remove your
//   Owner Occupied 3% abatement," and "The Assessor's Office mails new
//   postcards after July 1 to properties that have had a change in the
//   document number or ownership during that fiscal year." This is a
//   DESIGNATION fact, not proof the dollar amount is reassessed at sale — the
//   article does not extend it into a bill-recalculation claim.
// - Nevada does NOT reassess a home's taxable value to its sale price at
//   transfer (unlike, e.g., California's Prop 13 model). Clark County
//   Assessor's real-property page (confirmed live):
//   https://www.clarkcountynv.gov/government/assessor/real-property
//   describes a countywide mass-appraisal method — replacement cost of
//   improvements less statutory depreciation — not a reference to individual
//   sale prices. Stated plainly in the article per Mikey's instruction.
// - The one attributed quote — Clark County Assessor Briana Johnson: "It is
//   not an automatic 3%, they have to apply for that." — real, via Fox5
//   Vegas (KVVU), July 27, 2023 (confirmed live):
//   https://www.fox5vegas.com/2023/07/27/new-clark-county-homeowners-must-fill-out-tax-cap-notices-being-mailed-prevent-increase-property-taxes/
//   That article's stale, year-dated filing deadline is still not repeated —
//   only the quote and the general postcard process are used.
// - Assessor's office phone for tax-cap questions: (702) 455-3882, sourced
//   from the Assessor's own page above.
// - The former "Mikey's take" section asserted an opinion ("a genuinely good
//   protection," a favorable comparison to other states) Mikey never gave.
//   Removed and replaced with neutral, sourced buyer guidance — no invented
//   personal opinion.
// - No dollar-figure example is presented as real. The one example used below
//   (a neighbor's identical house with a lower bill) is explicitly
//   hypothetical, and is not used to predict what happens to any given
//   buyer's bill.
// - This is an ownership-cost / legal-mechanics explainer, not market news —
//   it does not restate or re-cite the LVR market statistics already covered
//   in /guides/las-vegas-home-prices-july-2026; that piece is linked as
//   further reading on the broader cost picture, not re-reported here.
// - Not tax, legal, or financial advice. Confirm current process and any
//   property-specific figure with the Clark County Assessor's Office.
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title: "Why the Seller's Nevada Property Tax Bill May Not Be Yours | LVINIT",
  headline: "Why the Seller's Nevada Property Tax Bill May Not Be Yours",
  description:
    "Nevada caps property tax increases at 3% a year for an owner-occupied home, but eligibility depends on the current owner establishing the home as their primary residence. Recording a sale removes the seller's designation, though the statutory calculation still references the property's prior-year taxes. Here's what actually changes at closing, what doesn't, and what to verify before you trust a listing's tax number.",
  path: "/guides/nevada-property-tax-abatement-resale-buyers",
  datePublished: "2026-08-21",
  dateModified: "2026-08-22",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    {
      name: "Why the Seller's Nevada Property Tax Bill May Not Be Yours",
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
      name: "Is the property tax figure on a Nevada resale listing what I'll actually pay?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not necessarily. That figure is the seller's bill, produced under whatever abatement status the seller had, very possibly a 3% owner-occupied cap built up over years. Nevada does not reassess a home's taxable value to its sale price at closing, so the underlying assessed value isn't what changes at a sale. What does change is designation: per the Clark County Assessor's own tax-abatement page, recording the new deed removes the previous owner's owner-occupied 3% abatement. Whether the parcel continues under that cap depends on whether the new owner files their own claim.",
      },
    },
    {
      "@type": "Question",
      name: "Is Nevada's 3% property tax cap automatic when you buy a house?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Clark County Assessor Briana Johnson has said it directly: \"It is not an automatic 3%, they have to apply for that.\" As of October 1, 2025, Nevada law (AB377, amending NRS 375.060) lets a new owner claim the owner-occupied abatement right on the Declaration of Value form filed with the deed at closing, with no fee for recording it. The older process, where the Assessor's office mails a postcard after the ownership change for the owner to complete and return, still exists as well. Call the Assessor's Office at (702) 455-3882 if you're unsure whether yours is on file.",
      },
    },
    {
      "@type": "Question",
      name: "What's the difference between Nevada's 3% property tax cap and the cap on other property?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The 3% cap (NRS 361.4723) applies to a single-family house, townhouse, condo, or manufactured home that is the owner's primary residence, one per owner. A separate statute (NRS 361.4724) extends the same 3% cap to qualifying residential rentals where the rent charged doesn't exceed HUD's published fair market rent for the county. Other property generally falls under Nevada's separate statutory abatement formula (NRS 361.4722), subject to an 8% maximum. That 8% is a ceiling on a formula recalculated annually, not a flat rate everything else automatically pays.",
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
        headline: "Why the Seller's Nevada Property Tax Bill May Not Be Yours",
        subheadline:
          "Nevada caps how much an owner-occupied home's property tax bill can rise each year at 3%. Eligibility depends on the current owner establishing the home as their primary residence, so when a home sells, the prior owner's designation is removed and the new owner has to establish their own. Here's what actually changes, what doesn't, and what to verify before closing.",
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
            dek: "The broader price picture: where the median actually sits right now, and what moved it.",
          },
          {
            name: "What $500K Buys in Las Vegas",
            href: "/guides/what-500k-buys-in-las-vegas",
            category: "Buyer guide",
            dek: "Three real home tours near the same budget. A concrete look at what a purchase actually costs beyond the sticker price.",
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
          "Tell me the address you're considering, and I'll walk you through how the cap works for that specific property before you make an offer, not after you're surprised by the first bill.",
      }}
    >
      <StoryLede
        kicker="Cost of Living"
        lead="Almost every resale listing in Las Vegas shows a property tax number, and it's tempting to treat that as your future bill. It's actually the seller's number, produced under whatever abatement the seller had, and the mechanics of what changes at a sale are easy to get wrong if you haven't seen them explained clearly."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Nevada caps how much an owner-occupied home&rsquo;s property tax
          bill can rise in a single year. That cap is real and it&rsquo;s
          written into state law, but eligibility for it depends on the
          current owner establishing the home as their primary residence, not
          on the house itself. The part worth understanding before you write
          an offer isn&rsquo;t a prediction about your future bill. It&rsquo;s
          the mechanism: what establishes eligibility, what happens
          to it when a home changes hands, and what you actually need to
          verify before closing.
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
              (a single-family house, townhouse, condo, or manufactured home
              on land that you actually live in, one property per owner) is
              capped at <span className="text-lvinit-black">3% per year</span>.
              This article is written for that case, since that&rsquo;s what
              almost every resale homebuyer is asking about.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Other property</span>{" "}
              generally falls under Nevada&rsquo;s separate statutory
              abatement formula, subject to an{" "}
              <span className="text-lvinit-black">8% maximum</span>. There&rsquo;s
              also a carve-out worth knowing: a qualifying residential rental
              , one where the rent charged doesn&rsquo;t exceed HUD&rsquo;s
              published fair market rent for the county, gets the same 3%
              cap as an owner-occupied home, under a separate statute (
              <a
                href="https://www.leg.state.nv.us/nrs/NRS-361.html#NRS361Sec4724"
                className={linkCls}
                target="_blank"
                rel="noopener noreferrer"
              >
                NRS 361.4724
              </a>
              ). If you&rsquo;re buying to rent the place out rather than live
              in it, that&rsquo;s a separate conversation with the Assessor&rsquo;s
              office, not something this guide walks through.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="What changes at a sale, and what doesn't">
        <p className="text-body-lg text-lvinit-warmgray">
          Start with what doesn&rsquo;t change. Unlike some states, Nevada
          doesn&rsquo;t reassess a home&rsquo;s taxable value to its sale
          price when it changes hands. Clark County&rsquo;s Assessor
          determines taxable value countywide with a mass-appraisal
          method (replacement cost of the improvements, less statutory
          depreciation), not by looking at what an individual buyer just paid.
          So the sale itself doesn&rsquo;t make the underlying assessed value
          jump to match the purchase price.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          What does change is designation. Eligibility for the owner-occupied
          3% abatement depends on the new owner establishing the property as
          their primary residence. It isn&rsquo;t automatic just because the
          house itself already carried the cap. The Clark County
          Assessor&rsquo;s own tax-abatement page says this plainly:
          &ldquo;Any ownership document recorded will remove your Owner
          Occupied 3% abatement.&rdquo; A recorded ownership change removes
          the prior owner&rsquo;s owner-occupied designation, but Nevada&rsquo;s
          statutory abatement calculation still references the property&rsquo;s
          prior-year taxes. It doesn&rsquo;t start over from zero or reset to
          the purchase price. What the parcel is taxed under after the sale
          turns on whether, and how quickly, the new owner establishes their
          own claim.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          And that claim doesn&rsquo;t happen automatically. Clark County
          Assessor Briana Johnson has said this directly about the process:
          &ldquo;It is not an automatic 3%, they have to apply for that.&rdquo;
          The next section covers exactly how a new owner does that, and it&rsquo;s
          more direct than it used to be.
        </p>
      </StorySection>

      <StoryPullQuote cite="Briana Johnson, Clark County Assessor">
        It is not an automatic 3%, they have to apply for that.
      </StoryPullQuote>

      <StorySection muted heading="Why this trips people up specifically on a resale purchase">
        <p className="text-body-lg text-lvinit-warmgray">
          A new-construction home doesn&rsquo;t hit this the same way. It&rsquo;s
          taxed at full assessed value in the year it&rsquo;s built, with no
          abatement, and only picks up whichever cap applies starting the
          following fiscal year. Resale is where the confusion lives, because
          a resale listing&rsquo;s advertised &ldquo;current taxes&rdquo;
          figure is the seller&rsquo;s bill, a bill that may have been
          quietly capped at 3% growth for years. That number tells you about
          the seller&rsquo;s current tax bill and abatement designation. It
          doesn&rsquo;t tell you what you&rsquo;ll
          be taxed as the new owner, because your designation is a separate,
          fresh claim.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Put concretely and purely hypothetically: say a longtime owner two
          doors down from a house you&rsquo;re considering has an identical
          floor plan and a noticeably lower tax bill. That&rsquo;s very
          possibly this exact mechanism at work: years of the 3% cap
          limiting how much their bill was allowed to grow, even on the same
          countywide assessed valuation everyone else is measured against. It
          is not a pricing error, and not a bill you inherit just by buying
          next door. What you&rsquo;re taxed as the new owner depends on your own
          designation, established through your own claim.
        </p>
      </StorySection>

      <StorySection heading="How to claim it, under current 2026 law">
        <p className="text-body-lg text-lvinit-warmgray">
          As of{" "}
          <span className="text-lvinit-black">October 1, 2025</span>, there&rsquo;s
          a more direct path than there used to be. Nevada&rsquo;s AB377
          (2025 Legislature) amended NRS 375.060 so the Declaration of
          Value (the form filed with every deed presented for recording, at
          every real property transfer) now includes a section where the
          owner can claim the owner-occupied (or qualifying-rental) partial
          abatement right there, at the time of transfer. There&rsquo;s no fee
          for recording it. That makes the claim part of closing itself,
          instead of a separate step afterward.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The older process still exists as a backup: the Assessor&rsquo;s
          office mails new owners a postcard after a change in ownership or
          document number, and it has to be completed and returned to claim
          or reclaim the 3% cap. If you didn&rsquo;t make the claim on the
          Declaration of Value at closing, or you&rsquo;re not sure whether
          it went through, that postcard or a direct call to the Assessor
          is how you fix it.
        </p>
        <ul className="mt-5 space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Don&rsquo;t treat a resale listing&rsquo;s &ldquo;current
              taxes&rdquo; line as your future bill. It reflects the
              seller&rsquo;s current tax bill and designation, not yours.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Ask your escrow or title company whether the owner-occupied
              abatement claim is being made on the Declaration of Value at
              closing. It&rsquo;s a new enough process (effective October
              2025) that it&rsquo;s worth confirming directly rather than
              assuming.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              If a postcard shows up from the Assessor&rsquo;s office after
              closing, complete and return it. It&rsquo;s the backup
              mechanism for exactly this claim.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              If you&rsquo;re ever unsure whether your designation or cap
              percentage is correct, call the Clark County Assessor&rsquo;s
              Office directly at{" "}
              <span className="text-lvinit-black">(702) 455-3882</span>. This
              is their process to confirm, not something a lender or agent
              can verify for you.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Don&rsquo;t assume either outcome before you&rsquo;ve verified
              it: that your bill will match the seller&rsquo;s, or that it
              will spike. Confirm your actual designation and figure with the
              Assessor or your title company before you finalize your budget.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="The bottom line for a resale buyer">
        <p className="text-body-lg text-lvinit-warmgray">
          The tax number on a resale listing tells you about the seller&rsquo;s
          current tax bill and designation, not your future bill. Nevada doesn&rsquo;t
          reassess the home&rsquo;s value to the sale price, but recording the
          sale does remove the seller&rsquo;s owner-occupied cap, so what you
          end up taxed under comes down to whether, and how, you establish
          your own claim. As of October 2025 that can happen right at closing
          on the Declaration of Value; the older assessor-notice process is
          still there as a backup. Either way, it&rsquo;s worth confirming
          directly with the Assessor&rsquo;s office or your escrow/title
          company rather than assuming.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If you&rsquo;re weighing a specific resale property and want to
          understand this before you write an offer, that&rsquo;s a
          conversation worth having early. And if the tax question is only one
          piece of a bigger &ldquo;can I actually afford this&rdquo; question,
          the{" "}
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
            <span className="text-lvinit-black">Nevada Revised Statutes</span>
            . NRS 361.4723, partial abatement of taxes on an owner-occupied
            single-family residence (the 3% cap), at{" "}
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
            <span className="text-lvinit-black">Nevada Revised Statutes</span>
            . NRS 361.4724, the same 3% cap extended to qualifying
            residential rentals, at{" "}
            <a
              href="https://www.leg.state.nv.us/NRS/NRS-361.html#NRS361Sec4724"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              leg.state.nv.us
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Nevada Revised Statutes</span>
            . NRS 361.4722, the general abatement formula and 8% ceiling for
            other property, at{" "}
            <a
              href="https://www.leg.state.nv.us/NRS/NRS-361.html#NRS361Sec4722"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              leg.state.nv.us
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Nevada Revised Statutes</span>
            . NRS 375.060, the Declaration of Value statute, as amended by
            AB377 (2025 Legislature, effective October 1, 2025) to add the
            at-transfer abatement-claim section, at{" "}
            <a
              href="https://www.leg.state.nv.us/nrs/nrs-375.html#NRS375Sec060"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              leg.state.nv.us
            </a>{" "}
            and the enrolled bill text,{" "}
            <a
              href="https://archive.leg.state.nv.us/Session/83rd2025/Bills/AB/AB377_EN.pdf"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              AB377 (83rd Session, 2025)
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">
              Clark County Assessor&rsquo;s Office
            </span>
            . Official tax-abatement page, source for the ownership-designation
            rule and the (702) 455-3882 tax-cap contact line, at{" "}
            <a
              href="https://www.clarkcountynv.gov/government/general_information/tax-abatement"
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
              Clark County Assessor&rsquo;s Office
            </span>
            . Real-property valuation page, source for the countywide
            mass-appraisal (replacement cost less depreciation) method used
            instead of reassessing to a sale price, at{" "}
            <a
              href="https://www.clarkcountynv.gov/government/assessor/real-property"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              clarkcountynv.gov
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Vegas (KVVU)</span>.
            &ldquo;New Clark County homeowners must fill out tax cap notices
            being mailed to prevent increase in property taxes,&rdquo; July
            27, 2023, source for the Assessor&rsquo;s quote and the general
            new-owner notice process, at{" "}
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
          percentages, deadlines, and county processes can change. Confirm
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
