import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryGallery,
} from "@/components/story";

// ---------------------------------------------------------------------------
// BUYER GUIDE (Cluster C) — HOA fees in Las Vegas (cluster map queue #7).
//
// FACT DISCIPLINE (read before editing):
// - Every legal point below comes from the Nevada Revised Statutes, chapter
//   116, as published at leg.state.nv.us/nrs/nrs-116.html (fetched 2026-10-11):
//   * NRS 116.4109 (resales): resale package contents (declaration, bylaws,
//     rules + the NRS 116.41095 information statement; statement of the
//     monthly assessment and unpaid obligations; current budget and
//     year-to-date financials with reserves summary; unsatisfied judgments and
//     pending legal actions; transfer/resale fees; current and expected fees;
//     proof of association insurance); provided at the OWNER's expense; the
//     association has 10 calendar days after written request; the package is
//     effective 90 calendar days; buyer may cancel by written notice until
//     midnight of the fifth calendar day after receiving it; a buyer who has
//     accepted the conveyance cannot cancel solely over a missing or
//     incomplete package; the buyer is not liable for unpaid assessments above
//     the amount in the association's documents. Fee limits as written in the
//     statute text: certificate not more than $185, statement of demand not
//     more than $165, with CPI-based increases of no more than 3% a year.
//     Because of those annual adjustments, the copy never says what the limit
//     is "today".
//   * NRS 116.31152: reserve study at least once every 5 years; the board
//     reviews results each year.
//   * NRS 116.3116: the lien for assessments attaches when an assessment
//     becomes due.
// - NEW BUILDS: the statute's resale rules cover resales. New-from-builder
//   sales follow a different disclosure path (NRS 116.4108/116.4103); the page
//   only says the path differs and sends readers to the builder guide.
// - $934 monthly HOA on a downtown high-rise condo: cited only via
//   /guides/what-500k-buys-in-las-vegas, not re-derived.
// - Landings at Sandstone has no HOA: only as documented on the Sandstone page.
//
// CLAIMS DELIBERATELY NOT MADE: any typical or average HOA dollar figure, any
// community's dues (other than the two above), which communities have HOAs,
// what any named community's association maintains, that a particular fee is
// "fair". Not legal advice. Fair Housing: nothing about who lives where.
//
// IMAGERY — Media Image Library stills (Mikey-owned footage). The hero
// (Lake Las Vegas) and the inline Inspirada park still are used for the broad
// "shared amenities" concept only; neither is described as HOA-maintained.
// ---------------------------------------------------------------------------

const HERO_IMAGE =
  "/images/editorial/lake-las-vegas-golf-course-homes-mountains-aerial.jpg";
const HERO_ALT =
  "Aerial over the lake at Lake Las Vegas toward a golf fairway, rows of homes and rugged desert mountains.";

const PATH = "/guides/hoa-fees-las-vegas-what-to-check";

const meta: StoryMeta = {
  title: "HOA Fees in Las Vegas: What to Check Before You Make an Offer | LVINIT",
  headline: "HOA Fees in Las Vegas: What to Check Before You Make an Offer",
  description:
    "What HOA dues cover in Las Vegas, how master and sub-associations stack, and what Nevada's resale package and 5-day cancellation window give you before you commit.",
  path: PATH,
  image: HERO_IMAGE,
  imageWidth: 1920,
  imageHeight: 1080,
  imageAlt: HERO_ALT,
  datePublished: "2026-10-11",
  dateModified: "2026-10-11",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "HOA Fees in Las Vegas", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

const CHECKLIST = [
  {
    item: "The monthly assessment, and what it covers",
    note: "Get the number and the list of what it pays for. Water, trash, landscaping, gate access, pool and exterior insurance are covered in some associations and not in others.",
  },
  {
    item: "Every other layer",
    note: "Ask whether a master association sits above the neighborhood association, whether a separate sub-association applies, and what each one charges.",
  },
  {
    item: "The budget and the reserve summary",
    note: "The resale package includes the current operating budget and a year-to-date financial statement with a reserves summary. Read whether money is being set aside for big replacements.",
  },
  {
    item: "Pending lawsuits and unsatisfied judgments",
    note: "The package must include a statement of unsatisfied judgments and pending legal actions against the association.",
  },
  {
    item: "Transfer and resale fees",
    note: "The package must state any transfer, transaction or other resale fees, and the current and expected fees or charges for the unit.",
  },
  {
    item: "The rules",
    note: "Declaration, bylaws and rules cover things that matter to daily life, such as parking, rentals, exterior changes and RVs. Read them before you assume you can do something.",
  },
];

export default function HoaFeesLasVegasPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Buyer Guide",
        headline: "HOA Fees in Las Vegas: What to Check Before You Make an Offer",
        subheadline:
          "What the dues actually pay for, how layers of associations stack, and the Nevada protections that give you time to read the paperwork.",
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
          "The other costs that sit next to HOA dues, and the guides that put them in context.",
        stories: [
          {
            name: "Why the Seller's Nevada Property Tax Bill May Not Be Yours",
            href: "/guides/nevada-property-tax-abatement-resale-buyers",
            category: "Buyer Guide",
            dek: "The other ownership cost that does not simply carry over from the seller.",
          },
          {
            name: "Buying New Construction in Las Vegas: How It Works",
            href: "/guides/buying-new-construction-las-vegas",
            category: "Buyer Guide",
            dek: "HOA, SID and LID questions to ask a builder before you fall for the plan.",
          },
          {
            name: "New Build vs Resale in Las Vegas: Which Should You Buy?",
            href: "/guides/new-build-vs-resale-las-vegas",
            category: "Buyer Guide",
            dek: "How HOA and assessments change the monthly cost on each side.",
          },
          {
            name: "What $500K Actually Gets You in Las Vegas",
            href: "/guides/what-500k-buys-in-las-vegas",
            category: "Buyer Guide",
            dek: "Three homes at one price, with very different HOA situations.",
          },
          {
            name: "Summerlin vs Henderson vs Southwest Las Vegas",
            href: "/guides/summerlin-vs-henderson-vs-southwest-las-vegas",
            category: "Neighborhood Comparison",
            dek: "Where HOA structure and assessments differ across the three big areas.",
          },
          {
            name: "Las Vegas Mortgage Rates",
            href: "/guides/las-vegas-mortgage-rates",
            category: "Market Watch",
            dek: "Dues are part of the monthly number the lender qualifies you on.",
          },
        ],
      }}
      ctas={{
        heading: "Looking at a home with an HOA?",
        body:
          "Send me the address or the community and I will help you work through the resale package before your window closes.",
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
        lead="The listing says the HOA is a certain amount a month, and most buyers stop reading there. That number is only the start. What it pays for, what sits on top of it, and what the association has put away for big repairs all decide whether the home is the deal it looks like."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Nevada gives resale buyers a real tool for this: a package of
          association documents and a short window to cancel after you get it.
          This guide covers what dues typically pay for, the layers that can
          stack, and how to use that window. It does not quote a typical Las
          Vegas HOA amount, because dues vary too much by community and by
          building for an average to mean anything.
        </p>
      </StoryLede>

      <StorySection id="what-dues-cover" heading="What HOA dues actually pay for">
        <p className="text-body-lg text-lvinit-warmgray">
          Dues fund the association&rsquo;s operating budget and its reserves.
          Operating costs are the day-to-day items: common-area maintenance,
          landscaping, management, insurance the association has to carry, and
          whatever services the community offers. Reserves are savings for
          big replacements down the road.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          What is bundled in changes a lot from place to place. In a downtown
          high-rise on our{" "}
          <Link href="/guides/what-500k-buys-in-las-vegas" className={linkCls}>
            $500K comparison
          </Link>
          , a $934 monthly HOA covers the amenities, water and common-area
          upkeep. In a Southwest house on the same page, there is no HOA at all.
          Same price tier, completely different monthly math. Treat dues as a
          line in the budget, and always ask what they include.
        </p>
      </StorySection>

      <StoryGallery
        columns={1}
        images={[
          {
            src: "/images/editorial/inspirada-henderson-park-walkway-shade-pavilions.jpg",
            alt: "Park walkway lined with desert plants leads past shaded picnic pavilions toward sports fields in Inspirada, Henderson.",
            caption:
              "Shared parks, paths and landscaping are the kind of common area that dues can help maintain in some communities. Who maintains a given park, the HOA or the city, depends on the community.",
          },
        ]}
      />

      <StorySection muted id="layers" heading="Master associations, sub-associations and other layers">
        <p className="text-body-lg text-lvinit-warmgray">
          &ldquo;The HOA is sixty dollars&rdquo; is rarely the whole answer.
          Some communities have a master association over the whole development
          and a separate association for the individual neighborhood or
          building, and each can charge its own dues. Ask for every layer by
          name.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          HOA dues are also not the same thing as a Special Improvement District
          or Local Improvement District assessment, which is a separate charge
          tied to the parcel. Our{" "}
          <Link href="/guides/sids-and-lids-las-vegas-home-buyers" className={linkCls}>
            SID and LID guide
          </Link>{" "}
          covers how to look one up, and we explain the new-build side in the{" "}
          <Link href="/guides/buying-new-construction-las-vegas" className={linkCls}>
            new-construction guide
          </Link>
          , and the{" "}
          <Link
            href="/guides/summerlin-vs-henderson-vs-southwest-las-vegas"
            className={linkCls}
          >
            three-way area comparison
          </Link>{" "}
          covers how HOA, SID and LID costs tend to differ by area. Not every
          home has an HOA. Landings at Sandstone in North Las Vegas, for
          example, has none, per our{" "}
          <Link
            href="/guides/sandstone-tule-springs-north-las-vegas"
            className={linkCls}
          >
            Sandstone guide
          </Link>
          , but I would never assume that about any other community.
        </p>
      </StorySection>

      <StorySection id="resale-package" heading="Nevada's resale package and your 5-day window">
        <p className="text-body-lg text-lvinit-warmgray">
          When you buy a resale in a Nevada common-interest community, the
          seller has to furnish a resale package, at the seller&rsquo;s expense,
          under NRS 116.4109. It includes:
        </p>
        <ul className="mt-5 list-disc space-y-2 pl-6 text-body-lg text-lvinit-warmgray">
          <li>
            The declaration, bylaws and association rules, plus a state-required
            information statement.
          </li>
          <li>
            A statement of the monthly assessment and any unpaid obligations the
            selling owner currently owes.
          </li>
          <li>
            The current operating budget and year-to-date financial statement,
            including a reserves summary.
          </li>
          <li>
            A statement of unsatisfied judgments and pending legal actions
            against the association.
          </li>
          <li>
            Any transfer, transaction or other resale fees, and the current and
            expected fees or charges for the unit.
          </li>
          <li>Proof of the insurance the association is required to carry.</li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The association has 10 calendar days after the owner&rsquo;s written
          request to furnish its documents. Once the package is in your hands,
          you can cancel by written notice until midnight of the fifth calendar
          day after you receive it, without penalty, and your payments are
          refunded. The package stays effective for 90 calendar days. If the
          association misses its 10-day deadline, the statute says you are not
          liable for the delinquent assessment.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Two practical points. First, the clock starts when you receive the
          package, not when the offer is accepted, so ask your agent to confirm
          the exact date it landed. Second, once you have accepted the
          conveyance at closing, you cannot cancel or seek damages solely
          because the package was missing or incomplete. Read it while you still
          have the window. The statute also caps what an association can charge
          for these documents; the amounts are written into NRS 116.4109 and
          adjust with inflation, so check the current figure rather than
          trusting a number in an article, including this one.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          This is the resale rule. Buying new from a builder follows a different
          disclosure path, so ask the builder what you will receive and when.
          Our{" "}
          <Link href="/guides/buying-new-construction-las-vegas" className={linkCls}>
            new-construction guide
          </Link>{" "}
          walks through that side. Exempt sales also exist, so confirm with your
          agent which rules apply to your purchase.
        </p>
      </StorySection>

      <StorySection muted id="reserves" heading="The reserve study: the part that predicts special assessments">
        <p className="text-body-lg text-lvinit-warmgray">
          Under NRS 116.31152, an association&rsquo;s board must have a reserve
          study done at least every five years and review the results each year
          to decide whether reserves are sufficient. The study is the
          association&rsquo;s own estimate of what major components will cost to
          replace and whether it has been saving enough.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          For you, the question is simple. Is the association saving on a
          steady plan, or does the budget suggest big bills will be covered by
          raising dues or levying an assessment on owners later? A thin reserve
          is not an automatic no. It is a number to price in, and a fair
          question to ask your agent and, if you want a professional read,
          an attorney. The statute requires the reserve study to be available for
          inspection, so ask to see it.
        </p>
      </StorySection>

      <StorySection id="checklist" heading="What to check before you make an offer">
        <p className="text-body-lg text-lvinit-warmgray">
          Use this list on any home that sits inside an association.
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

      <StorySection muted id="monthly-budget" heading="Put the dues in the real monthly number">
        <p className="text-body-lg text-lvinit-warmgray">
          HOA dues sit next to your mortgage payment, property tax and
          insurance, and lenders count them when they qualify you. Run the
          numbers on the whole payment, not just principal and interest. Our{" "}
          <Link href="/guides/las-vegas-mortgage-rates" className={linkCls}>
            mortgage-rates page
          </Link>{" "}
          shows how rates move the payment, and the{" "}
          <Link
            href="/guides/nevada-property-tax-abatement-resale-buyers"
            className={linkCls}
          >
            property tax guide
          </Link>{" "}
          explains why the seller&rsquo;s tax bill may not be yours. If cash up
          front is the hurdle, see the{" "}
          <Link
            href="/guides/las-vegas-down-payment-assistance-programs-2026"
            className={linkCls}
          >
            down payment guide
          </Link>
          , and our{" "}
          <Link href="/guides/closing-costs-las-vegas-buyers" className={linkCls}>
            closing costs guide
          </Link>{" "}
          covers the rest of the cash you bring to the table. For a side-by-side look at new versus resale monthly costs, read{" "}
          <Link href="/guides/new-build-vs-resale-las-vegas" className={linkCls}>
            New Build vs Resale
          </Link>
          .
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          One more reason to read the unpaid-obligations statement: under NRS
          116.3116, the association&rsquo;s lien for assessments attaches when an
          assessment becomes due. The statement of what is owed on the unit is
          how you confirm that nothing unexpected comes with the home.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-4 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Nevada Revised Statutes, Chapter 116</span>
            . NRS 116.4109 (resales of units), NRS 116.31152 (study of reserves)
            and NRS 116.3116 (lien for assessments), at{" "}
            <a
              href="https://www.leg.state.nv.us/nrs/nrs-116.html"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              leg.state.nv.us
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">LVINIT coverage</span>. The $934
            downtown high-rise HOA and the no-HOA Southwest home are cited from
            our $500K guide; the Sandstone detail from our Sandstone guide.
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Statutes are amended, and associations differ. This is general
          information, not legal, tax or financial advice. Confirm anything
          property specific with your agent, the association and, where it
          matters, an attorney.
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
