import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// BUYER GUIDE (Cluster C) — closing costs in Las Vegas (cluster map queue #8).
//
// FACT DISCIPLINE (read before editing):
// - Transfer tax: Nevada Department of Taxation, Real Property Transfer Tax
//   FAQ (tax.nv.gov/faqs/real-property-transfer-tax-faqs, fetched 2026-10-15):
//   $1.95 per $500 of value or part thereof statewide, Clark County adds $0.60,
//   combined $2.55 per $500; collected by the County Recorder; buyer and seller
//   are responsible "together and individually"; exemptions in NRS 375.090.
//   Rate composition ($0.65 NRS 375.020 + $1.30 NRS 375.023 state, +$0.60 Clark
//   school district) cross-checked in the Department's Q4 FY2024-25 RPTT report.
//   The Department's own FAQ worked example appears to miscount by one $500
//   unit, so this page does its own arithmetic: $500,000 / $500 = 1,000 units
//   x $2.55 = $2,550 (illustration only, not a quote).
// - Closing Disclosure: CFPB — lender must provide it at least three business
//   days before closing; certain changes trigger another three-business-day
//   wait (consumerfinance.gov/ask-cfpb/when-do-i-get-a-closing-disclosure-en-179/).
// - HOA resale package: reuses the facts already verified on the LVINIT HOA guide.
//
// CLAIMS DELIBERATELY NOT MADE: any typical closing-cost percentage or dollar
// total, any title/escrow/lender fee amount, any "customary" buyer/seller split
// in Southern Nevada (only brokerage blogs report these; no primary source
// found). The page says the purchase contract and Closing Disclosure decide.
// Not legal, tax or financial advice. Fair Housing: nothing about who lives where.
//
// IMAGERY — one Media Image Library still (Mikey-owned footage), used as a
// general "Las Vegas homes" hero only. No inline images: the topic is not
// visual and forcing images would add nothing.
// ---------------------------------------------------------------------------

const HERO_IMAGE =
  "/images/editorial/inspirada-henderson-townhomes-retail-center-aerial.jpg";
const HERO_ALT =
  "Aerial of townhomes beside a new shopping center in Inspirada, Henderson, with open desert and the distant Las Vegas Strip skyline.";

const PATH = "/guides/closing-costs-las-vegas-buyers";
const TITLE = "Closing Costs When Buying a Home in Las Vegas: What to Expect";

const meta: StoryMeta = {
  title: `${TITLE} | LVINIT`,
  headline: TITLE,
  description:
    "What closing costs on a Las Vegas home purchase are made of, how Clark County's $2.55 per $500 transfer tax works, and how to use your Loan Estimate and Closing Disclosure.",
  path: PATH,
  image: HERO_IMAGE,
  imageWidth: 1920,
  imageHeight: 1080,
  imageAlt: HERO_ALT,
  datePublished: "2026-10-15",
  dateModified: "2026-10-15",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Closing Costs in Las Vegas", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

const BUCKETS = [
  {
    item: "Lender and loan costs",
    note: "Fees your lender charges to make the loan, plus third-party items it requires, such as an appraisal. They show up in the loan-costs section of your Loan Estimate and Closing Disclosure. Compare them lender to lender.",
  },
  {
    item: "Title and escrow",
    note: "The escrow company holds the money and documents and runs the closing. Title work checks that the seller can legally sell, and title insurance protects against problems with that. Your lender will require a policy for itself; an owner's policy protects you.",
  },
  {
    item: "Government fees and transfer tax",
    note: "Recording fees and Nevada's real property transfer tax, which in Clark County is $2.55 per $500 of value (more below).",
  },
  {
    item: "Prepaids and escrow deposits",
    note: "Items paid ahead of time, such as homeowner's insurance and, when applicable, interest from closing to the end of the month, plus any starting deposit for an impound account if your lender collects taxes and insurance with your payment.",
  },
  {
    item: "HOA charges",
    note: "If the home is in an association, transfer or resale fees and any amounts owed on the unit appear in the resale package. See our HOA guide for what the package must contain.",
  },
];

export default function ClosingCostsLasVegasBuyersPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Buyer Guide",
        headline: TITLE,
        subheadline:
          "What the number is made of, the one Nevada tax most buyers have never heard of, and the paperwork that lets you check it before you sign.",
        image: HERO_IMAGE,
        imageAlt: HERO_ALT,
        backLink: { label: "Guides", href: "/guides" },
        ctas: [{ label: "See the breakdown", href: "#breakdown", variant: "primary" }],
      }}
      relatedStories={{
        heading: "Read these next",
        intro: "The other cash-and-cost questions that sit next to closing costs.",
        stories: [
          {
            name: "You Don't Need 20% Down To Buy a Home in Las Vegas",
            href: "/guides/las-vegas-down-payment-assistance-programs-2026",
            category: "Buyer Guide",
            dek: "Programs that can go toward down payment or closing costs.",
          },
          {
            name: "HOA Fees in Las Vegas: What to Check Before You Make an Offer",
            href: "/guides/hoa-fees-las-vegas-what-to-check",
            category: "Buyer Guide",
            dek: "The resale package, transfer fees and your 5-day window.",
          },
          {
            name: "Why the Seller's Nevada Property Tax Bill May Not Be Yours",
            href: "/guides/nevada-property-tax-abatement-resale-buyers",
            category: "Buyer Guide",
            dek: "The ownership cost that does not simply carry over.",
          },
          {
            name: "Buying New Construction in Las Vegas: How It Works",
            href: "/guides/buying-new-construction-las-vegas",
            category: "Buyer Guide",
            dek: "Incentives, lender requirements and what to ask the sales office.",
          },
          {
            name: "Las Vegas Mortgage Rates",
            href: "/guides/las-vegas-mortgage-rates",
            category: "Market Watch",
            dek: "How the rate changes the monthly payment.",
          },
        ],
      }}
      ctas={{
        heading: "Want to see your numbers before you write an offer?",
        body: "Tell me the price range and the area and I will help you work through what cash to bring and what to ask for.",
        footnote: (
          <>
            Still choosing an area? Start with{" "}
            <Link href="/guides/moving-to-las-vegas" className="text-lvinit-blue underline underline-offset-4">
              Moving to Las Vegas
            </Link>
            .
          </>
        ),
      }}
    >
      <StoryLede
        kicker="Buyer Guide"
        lead="Most buyers plan for the down payment and the monthly payment, then get surprised by a third number: the cash it takes to actually close. It is not one fee. It is a stack of smaller ones, and a few of them are very Nevada."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          This guide breaks that stack into plain pieces, explains Clark
          County&rsquo;s real property transfer tax with the actual rate, and shows
          where in your paperwork to check the real numbers. It does not quote a
          typical total or percentage, because the honest answer depends on your
          loan, your price, the title company and what you negotiate. The
          documents your lender gives you are where the real figures live.
        </p>
      </StoryLede>

      <StorySection id="breakdown" heading="What closing costs are made of">
        <p className="text-body-lg text-lvinit-warmgray">
          Closing costs are the upfront costs of getting your loan and
          transferring ownership, as the Consumer Financial Protection Bureau
          describes them. They sit on top of your down payment. For a Las Vegas
          purchase they tend to fall into five buckets:
        </p>
        <ol className="mt-6 space-y-5">
          {BUCKETS.map((b, i) => (
            <li key={b.item} className="flex gap-4">
              <span className="font-semibold text-lvinit-blue">{i + 1}.</span>
              <div>
                <p className="text-body-lg font-semibold text-lvinit-black">{b.item}</p>
                <p className="mt-1 text-body-lg text-lvinit-warmgray">{b.note}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Not every item applies to every purchase. A cash buyer has no lender
          fees. A condo or townhome in an association has HOA charges that a
          home with no HOA does not. Your own list will be shorter or longer
          than this one.
        </p>
      </StorySection>

      <StorySection muted id="transfer-tax" heading="Clark County's transfer tax, in real numbers">
        <p className="text-body-lg text-lvinit-warmgray">
          Nevada charges a real property transfer tax when a deed is recorded.
          Per the Nevada Department of Taxation, the statewide base is $1.95 for
          every $500 of value or part of $500, and Clark County adds another
          $0.60, so the combined rate here is $2.55 per $500. The county
          recorder collects it when the transfer is recorded.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Here is the math as an illustration, not a quote. A $500,000 sale is
          1,000 units of $500. At $2.55 each, that is $2,550. Because the tax
          applies to each $500 or part of $500, you can estimate the tax on any
          price by dividing it by 500 and multiplying by $2.55, rounding up.
          Exemptions exist for certain transfers under NRS 375.090, but a normal
          arm&rsquo;s-length sale to a buyer is generally not one of them.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Who pays it? The Department says the buyer and seller are responsible
          together and individually for the tax. In practice, who actually
          bears the cost is a term of the purchase agreement. Do not assume
          either way. Look for it in your contract and confirm it on the
          settlement figures.
        </p>
      </StorySection>

      <StorySection id="who-pays" heading="Who pays what is a contract question">
        <p className="text-body-lg text-lvinit-warmgray">
          You will hear that certain costs are &ldquo;normally&rdquo; paid by the buyer or
          the seller. I have not found an official source that fixes those
          splits, and they can change with the contract, the type of loan and
          how hot the market is. Treat any rule of thumb as a starting point
          for a conversation with your agent, not a promise.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          What you can rely on is that every item is itemized, and that both
          sides of the table can see who is paying for it. If an offer includes
          a request that the seller contribute toward your costs, that is
          negotiated in the offer, and a lender can limit how much seller help it
          will allow on a given loan.
        </p>
      </StorySection>

      <StorySection muted id="paperwork" heading="Use the Loan Estimate and Closing Disclosure">
        <p className="text-body-lg text-lvinit-warmgray">
          Two federal forms do most of the work for you. The Loan Estimate comes
          early, and it is the one to shop with. The Closing Disclosure shows the
          final figures. Under CFPB rules, your lender must give you the Closing
          Disclosure at least three business days before closing, so you have time
          to compare it with the Loan Estimate. If certain things change
          after that, such as the loan terms, a new three-business-day wait can
          apply.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Put the two side by side and ask about every line that moved. If a
          cost jumped, ask your lender or the escrow officer to explain why
          before closing day, not at the table.
        </p>
      </StorySection>

      <StorySection id="new-and-resale" heading="New construction versus resale">
        <p className="text-body-lg text-lvinit-warmgray">
          The buckets are the same, but the conversation is different. A builder
          may offer incentives tied to using its preferred lender, and what is
          offered can change from community to community and month to month.
          Our{" "}
          <Link href="/guides/buying-new-construction-las-vegas" className={linkCls}>
            new-construction guide
          </Link>{" "}
          covers the questions to ask a sales office, and{" "}
          <Link href="/guides/new-build-vs-resale-las-vegas" className={linkCls}>
            New Build vs Resale
          </Link>{" "}
          compares the money side by side. On a resale in an association, the
          seller&rsquo;s resale package comes at the owner&rsquo;s expense under Nevada
          law, but the transfer fees it discloses are worth reading closely. Our{" "}
          <Link href="/guides/hoa-fees-las-vegas-what-to-check" className={linkCls}>
            HOA guide
          </Link>{" "}
          has the details.
        </p>
      </StorySection>

      <StorySection muted id="reducing" heading="Ways to plan for it (and reduce it)">
        <ul className="list-disc space-y-3 pl-6 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Ask for Loan Estimates from more than one lender</span>{" "}
            and compare the loan-costs section line by line.
          </li>
          <li>
            <span className="text-lvinit-black">Look into assistance.</span> Some
            programs can go toward closing costs, not just the down payment. We
            walk through the Nevada options in the{" "}
            <Link
              href="/guides/las-vegas-down-payment-assistance-programs-2026"
              className={linkCls}
            >
              down payment assistance guide
            </Link>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Budget the monthly side too.</span>{" "}
            Closing costs are a one-time bill, but the rate you lock sets the
            payment for years. See{" "}
            <Link href="/guides/las-vegas-mortgage-rates" className={linkCls}>
              Las Vegas mortgage rates
            </Link>{" "}
            and the{" "}
            <Link
              href="/guides/nevada-property-tax-abatement-resale-buyers"
              className={linkCls}
            >
              property tax guide
            </Link>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Keep a cushion.</span> A late
            surprise, like an extra lender requirement, is easier to absorb if
            you did not plan to the last dollar.
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-4 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Nevada Department of Taxation</span>
            , Real Property Transfer Tax FAQs, at{" "}
            <a
              href="https://tax.nv.gov/faqs/real-property-transfer-tax-faqs"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              tax.nv.gov
            </a>
            . Rate, collection and exemptions (NRS 375.090).
          </li>
          <li>
            <span className="text-lvinit-black">Consumer Financial Protection Bureau</span>
            , &ldquo;When do I get a Closing Disclosure?&rdquo; at{" "}
            <a
              href="https://www.consumerfinance.gov/ask-cfpb/when-do-i-get-a-closing-disclosure-en-179/"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              consumerfinance.gov
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">LVINIT coverage</span>. The HOA
            resale package details come from our HOA guide.
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Rates and rules change, and every purchase differs. This is general
          information, not legal, tax or financial advice. Confirm figures with
          your lender, your escrow officer and your agent.
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
