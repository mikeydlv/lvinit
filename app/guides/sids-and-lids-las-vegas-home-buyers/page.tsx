import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// BUYER GUIDE (Cluster C) — SIDs and LIDs in Las Vegas (cluster map queue #13).
//
// FACT DISCIPLINE (read before editing). All fetched 2026-10-17.
// - Clark County Treasurer, "Understanding SIDs"
//   (clarkcountynv.gov/government/elected_officials/county_treasurer/understanding-sids):
//   a special assessment is a charge on properties within a Special
//   Improvement District's boundaries; typical projects are streets,
//   sidewalks, curbs and gutters, streetlights, and sewer and water
//   facilities; only parcels that directly benefit can be assessed; costs are
//   divided by front footage, area, zone or another equitable basis; no
//   assessment can exceed the parcel's reasonable market value or estimated
//   maximum special benefit; the assessment is a lien until paid off; it is
//   separate from, and billed separately from, real property taxes; the County
//   typically issues bonds and bills principal and interest twice a year;
//   late-payment penalties are substantial; if an owner is delinquent the
//   County begins foreclosure proceedings within 60 days.
// - Clark County Treasurer, "SID payment options" (sid_payment_options.php):
//   can be paid in full at any time with a 3% prepayment penalty on the unpaid
//   balance; late installments carry a 2% monthly penalty plus accrued
//   interest; a missed installment makes the whole unpaid principal due, with
//   an option to begin foreclosure. Quoted as the County's SID terms, NOT as
//   terms of every district.
// - NRS chapter 271 (Consolidated Local Improvements Law,
//   leg.state.nv.us/nrs/nrs-271.html): 271.045 assessment definition;
//   271.405(5) owner may pay off the full unpaid principal at any time plus
//   accrued interest and penalties, with any prepayment premium set in the
//   ordinance and capped at 5%; 271.410 a missed installment can accelerate
//   the unpaid principal at the municipality's option, and the owner can cure
//   before the sale day; 271.415 installments spread over not less than 2 nor
//   more than 30 years, delinquency interest may not exceed 2% a month, and the
//   ordinance states these terms; 271.420 the assessment lien is coequal with
//   the latest general-tax lien and prior and superior to other liens and
//   encumbrances other than assessment and general-tax liens.
//   The fetched statute page was read in chunks; sections 271.285-271.405
//   were read only where cited here.
// - Assessment Management Group (amgnv.com): parcel search "to find information
//   about the assessments of any property in Clark County" covering Clark
//   County, North Las Vegas, Las Vegas and Henderson among others; its
//   disclaimer says a property closing escrow within 15 days before the
//   assessment bill's mailing date, or after it, "MUST BE PAID FROM ESCROW",
//   and that bills are mailed once before the due date.
// - NRS 113.130/113.150 (seller disclosure): form served at least 10 days
//   before conveyance. The fetched statute text does not mention special
//   assessments or SIDs, so the page does NOT claim the form asks about them.
// - Aries (Henderson): LID district T-23-1, semiannual installments (June 1,
//   December 1) through December 2055, from the City of Henderson assessment
//   record for one Pulte-owned lot, as already sourced on
//   /guides/aries-henderson. The quoted dollar amounts there were unconfirmed
//   and are NOT repeated here.
// - Cross-page facts reused, not re-derived: SID text on
//   /guides/buying-new-construction-las-vegas and /guides/new-build-vs-resale-las-vegas.
//
// CLAIMS DELIBERATELY NOT MADE: any real SID/LID dollar amount, rate, term or
// district boundary; which communities or builders have SIDs/LIDs (other than
// the Aries record); that LID and SID differ legally (the page says
// "SID or LID" are used for this kind of charge and that the label depends on
// the issuing government, which is NOT in the sources, so it is not asserted);
// how any lender or title company treats the charge; who pays at closing
// (a contract negotiation). The hypothetical figures below are labeled and are
// arithmetic only. Not legal advice. Fair Housing: nothing about who lives where.
//
// IMAGERY: one Media Image Library still (Mikey-owned footage), hero only,
// described as a generic Southwest Las Vegas arterial and neighborhoods view
// and never as an assessment district.
// ---------------------------------------------------------------------------

const HERO_IMAGE =
  "/images/editorial/southwest-las-vegas-shopping-center-mountains-aerial.jpg";
const HERO_ALT =
  "Aerial of a shopping center and wide road in southwest Las Vegas with neighborhoods and mountains in the distance.";

const PATH = "/guides/sids-and-lids-las-vegas-home-buyers";
const TITLE = "SIDs and LIDs in Las Vegas: The Assessment Some Buyers Don't See Coming";

const meta: StoryMeta = {
  title: `${TITLE} | LVINIT`,
  headline: TITLE,
  description:
    "What a Special Improvement District assessment is, why it is billed apart from property tax, how to look up a parcel, and what to ask before you buy in Las Vegas.",
  path: PATH,
  image: HERO_IMAGE,
  imageWidth: 1920,
  imageHeight: 1080,
  imageAlt: HERO_ALT,
  datePublished: "2026-10-17",
  dateModified: "2026-10-17",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "SIDs and LIDs in Las Vegas", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

const CHECKLIST = [
  {
    item: "Is the parcel in an SID or LID at all?",
    note: "Search the exact parcel on the assessment administrator's parcel lookup before you rely on anything said at a showing or in a listing.",
  },
  {
    item: "The installment amount and when it is billed",
    note: "Get the actual figure for this parcel and the billing dates. Two bills a year is common, but confirm it for the district.",
  },
  {
    item: "The last payment date",
    note: "A district can run for many years. Ask when the final installment is due so you know how long the cost follows the home.",
  },
  {
    item: "The unpaid balance and the payoff terms",
    note: "Ask what it costs to pay the whole balance off and whether a prepayment premium applies.",
  },
  {
    item: "Who is paying what at closing",
    note: "Whether the seller pays the balance off or the installments carry over to you is a term of your purchase contract. Settle it in writing with your agent.",
  },
  {
    item: "That nothing is delinquent",
    note: "A missed installment can accelerate the whole unpaid principal, so ask escrow to confirm the account is current.",
  },
];

export default function SidsAndLidsPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Buyer Guide",
        headline: TITLE,
        subheadline:
          "A charge tied to the parcel, billed apart from your property tax, that can follow a home for years. Here is how to find it before you make an offer.",
        image: HERO_IMAGE,
        imageAlt: HERO_ALT,
        backLink: { label: "Guides", href: "/guides" },
        ctas: [
          { label: "See the checklist", href: "#checklist", variant: "primary" },
        ],
      }}
      relatedStories={{
        heading: "Read these next",
        intro:
          "The other costs that sit beside a special assessment, and the guides that put them in context.",
        stories: [
          {
            name: "HOA Fees in Las Vegas: What to Check Before You Make an Offer",
            href: "/guides/hoa-fees-las-vegas-what-to-check",
            category: "Buyer Guide",
            dek: "The association layer, which is a different charge from an SID or LID.",
          },
          {
            name: "Buying New Construction in Las Vegas: How It Works",
            href: "/guides/buying-new-construction-las-vegas",
            category: "Buyer Guide",
            dek: "Where a new community's assessment questions fit in the buying process.",
          },
          {
            name: "New Build vs Resale in Las Vegas: Which Should You Buy?",
            href: "/guides/new-build-vs-resale-las-vegas",
            category: "Buyer Guide",
            dek: "How special assessments change the monthly cost on each side.",
          },
          {
            name: "Why the Seller's Nevada Property Tax Bill May Not Be Yours",
            href: "/guides/nevada-property-tax-abatement-resale-buyers",
            category: "Buyer Guide",
            dek: "The tax bill is a separate question from the assessment bill.",
          },
          {
            name: "Closing Costs When Buying a Home in Las Vegas: What to Expect",
            href: "/guides/closing-costs-las-vegas-buyers",
            category: "Buyer Guide",
            dek: "The rest of the cash you bring to the table.",
          },
          {
            name: "Aries Henderson: What Buyers Should Know About Henderson's New Community",
            href: "/guides/aries-henderson",
            category: "Local Feature",
            dek: "One real community where a City of Henderson LID record exists.",
          },
        ],
      }}
      ctas={{
        heading: "Looking at a specific home?",
        body:
          "Send me the address or the community and I will help you look up the parcel and line up the right questions before you commit.",
        footnote: (
          <>
            Still choosing an area? Start with{" "}
            <Link
              href="/guides/moving-to-las-vegas"
              className="text-lvinit-blue underline underline-offset-4"
            >
              Moving to Las Vegas
            </Link>
            .
          </>
        ),
      }}
    >
      <StoryLede
        kicker="Buyer Guide"
        lead="Most buyers check the price, the HOA and the property tax. A special assessment is a fourth line that does not always show up in the first three places people look, and it can stay attached to the parcel for years."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          This guide explains what a Special Improvement District (SID) or
          Local Improvement District (LID) assessment is, how it differs from
          property tax and HOA dues, and how to find out whether a parcel
          carries one. It does not quote a typical amount, because the number
          depends entirely on the district and the parcel.
        </p>
      </StoryLede>

      <StorySection id="what-it-is" heading="What an SID or LID assessment is">
        <p className="text-body-lg text-lvinit-warmgray">
          Per the Clark County Treasurer, a special assessment is a charge on
          properties within the boundaries of a Special Improvement District.
          The County lists typical projects as streets, sidewalks, curbs and
          gutters, streetlights, and sewer and water facilities. Only parcels
          that directly benefit from a project can be assessed, and the cost is
          divided among them by front footage, area, zone or another equitable
          basis. The County also says an assessment cannot exceed the
          parcel&rsquo;s reasonable market value or its estimated maximum
          special benefit.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          In plain terms, infrastructure gets built, usually financed with
          bonds, and the parcels that benefit repay it over time. Both labels
          show up in local records: Clark County&rsquo;s Treasurer says SID, and
          the City of Henderson record for Aries below says LID. Nevada&rsquo;s
          Consolidated Local Improvements Law, NRS chapter 271, is the
          statute behind this kind of assessment.
        </p>
      </StorySection>

      <StorySection muted id="not-tax-not-hoa" heading="Not property tax, and not an HOA">
        <p className="text-body-lg text-lvinit-warmgray">
          Clark County is explicit that special assessments are different from
          real property taxes and are billed separately. That is why a buyer who
          only studies the tax bill can miss one. The county bills principal and
          interest twice a year, typically to repay the bonds that funded the
          project.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It is also not an HOA charge. Dues go to a private association and
          follow Nevada&rsquo;s common-interest community rules, which we cover
          in the{" "}
          <Link href="/guides/hoa-fees-las-vegas-what-to-check" className={linkCls}>
            HOA fees guide
          </Link>
          . A home can have both, one, or neither. For the tax side, which has
          its own surprise for buyers, see{" "}
          <Link
            href="/guides/nevada-property-tax-abatement-resale-buyers"
            className={linkCls}
          >
            why the seller&rsquo;s property tax bill may not be yours
          </Link>
          .
        </p>
      </StorySection>

      <StorySection id="lien" heading="The lien, and why it matters to a buyer">
        <p className="text-body-lg text-lvinit-warmgray">
          The assessment is a lien on the property until it is paid off. Under
          NRS 271.420, an assessment lien is coequal with the latest lien for
          general taxes and prior and superior to other liens and encumbrances,
          apart from assessment and general-tax liens. Practically, that means
          the obligation is attached to the parcel, not just to the person who
          was living there when it was levied.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Missing payments is costly. Clark County says late installments carry a
          2% monthly penalty plus interest, that a missed installment can make
          the whole unpaid principal due, and that it begins foreclosure
          proceedings within 60 days of delinquency. NRS 271.410 lets an owner
          cure before the sale day by paying the delinquent installments,
          interest, penalties and collection costs. You do not want to learn
          any of this after closing.
        </p>
      </StorySection>

      <StorySection muted id="how-long" heading="How long it lasts and what paying it off looks like">
        <p className="text-body-lg text-lvinit-warmgray">
          Under NRS 271.415, installments are spread over not less than two nor
          more than thirty years, and the assessment ordinance states the
          number of installments, any prepayment privilege and the interest rate
          on delinquent payments. So terms vary by district.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Owners can generally pay off the full unpaid principal early. NRS
          271.405 allows payoff at any time with accrued interest and any
          penalties, and lets the ordinance set a prepayment premium capped at
          5%. Clark County states its own SID assessments can be paid in full at
          any time with a 3% prepayment penalty on the unpaid balance. That is
          the County&rsquo;s stated term, not a rule for every district, so ask
          for the terms of the one you are buying into.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Here is a purely hypothetical illustration of the arithmetic. If a
          district billed $1,000 every six months, that would be $2,000 a year,
          or about $167 a month to set against your budget. If a 3% prepayment
          penalty applied to a $20,000 unpaid balance, that penalty would be
          $600 on top of the balance. These are made-up round numbers to show
          the math, not figures from any real district.
        </p>
      </StorySection>

      <StorySection id="real-example" heading="One real example: Aries in Henderson">
        <p className="text-body-lg text-lvinit-warmgray">
          In our{" "}
          <Link href="/guides/aries-henderson" className={linkCls}>
            Aries guide
          </Link>
          , the City of Henderson&rsquo;s assessment record for one Pulte-owned
          lot shows an LID, district T-23-1, billed twice a year with
          installments scheduled through December 2055. That is one lot, and the
          record is for that parcel. A neighboring lot can differ, which is the
          point: the only reliable answer is the record for the exact parcel you
          are buying.
        </p>
      </StorySection>

      <StorySection muted id="look-it-up" heading="How to find out if a parcel has one">
        <p className="text-body-lg text-lvinit-warmgray">
          Assessment Management Group runs a parcel search you can use by
          parcel number, owner name or street. It says it can show assessment
          information for any property in Clark County, and it covers Clark
          County, Las Vegas, North Las Vegas and Henderson among other
          jurisdictions. Clark County&rsquo;s Treasurer also points owners to AMG
          for SID status and payment information.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Do not rely on the seller disclosure form alone. Nevada requires the
          seller to serve a completed disclosure form at least 10 days before
          conveyance under NRS 113.130, but the statute text does not itself
          list special assessments, so verify the parcel directly. Ask your title
          or escrow officer to confirm any assessment on the parcel as well.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Timing at closing matters too. AMG notes that a property closing
          escrow within 15 days before the assessment bill&rsquo;s mailing date,
          or after it, must be paid from escrow, and that bills are mailed only
          once before the due date. Ask escrow how the current installment will
          be handled so nothing is missed.
        </p>
      </StorySection>

      <StorySection id="new-vs-resale" heading="New construction and resale">
        <p className="text-body-lg text-lvinit-warmgray">
          Because assessments fund infrastructure, they are more often a
          question in newer areas, but I would not assume either way. A resale
          home can carry one, and a new community may not. Our{" "}
          <Link href="/guides/buying-new-construction-las-vegas" className={linkCls}>
            new-construction guide
          </Link>{" "}
          covers where to ask the builder, and{" "}
          <Link href="/guides/new-build-vs-resale-las-vegas" className={linkCls}>
            New Build vs Resale
          </Link>{" "}
          shows how special assessments change the full monthly cost on each
          side. Whatever the home, put the assessment in the same budget as the
          payment, HOA dues and insurance, and include it when you work through{" "}
          <Link href="/guides/closing-costs-las-vegas-buyers" className={linkCls}>
            closing costs
          </Link>
          .
        </p>
      </StorySection>

      <StorySection muted id="checklist" heading="What to check before you make an offer">
        <p className="text-body-lg text-lvinit-warmgray">
          Use this list on any home, new or resale.
        </p>
        <ol className="mt-6 space-y-5">
          {CHECKLIST.map((c, i) => (
            <li key={c.item} className="flex gap-4">
              <span className="font-semibold text-lvinit-blue">{i + 1}.</span>
              <div>
                <p className="text-body-lg font-semibold text-lvinit-black">
                  {c.item}
                </p>
                <p className="mt-1 text-body-lg text-lvinit-warmgray">{c.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-4 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Clark County Treasurer</span>
            . Understanding SIDs and SID payment options, at{" "}
            <a
              href="https://www.clarkcountynv.gov/government/elected_officials/county_treasurer/understanding-sids"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              clarkcountynv.gov
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Nevada Revised Statutes</span>
            . Chapter 271 (NRS 271.405, 271.410, 271.415, 271.420) and NRS
            113.130, at{" "}
            <a
              href="https://www.leg.state.nv.us/nrs/nrs-271.html"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              leg.state.nv.us
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Assessment Management Group</span>
            . Parcel search and closing-escrow notice, at{" "}
            <a
              href="https://www.amgnv.com"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              amgnv.com
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">LVINIT coverage</span>
            . The Aries district record is drawn from our Aries guide, which
            cites the City of Henderson assessment record.
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Statutes are amended, and each district has its own terms. This is
          general information, not legal, tax or financial advice. Confirm
          anything property specific with the assessment administrator, your
          title company, your agent and, where it matters, an attorney.
        </p>
      </StorySection>

      <StorySection heading="About this coverage">
        <p className="text-body text-lvinit-warmgray">
          LVINIT Editorial &middot; The Scofield Group &middot; Nevada License
          S.0175577. Equal Housing Opportunity.
        </p>
      </StorySection>
    </StoryPage>
  );
}
