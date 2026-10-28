import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import Container from "@/components/ui/Container";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// BUYER NEWS — Zillow Home Loans' FHA down payment assistance, launched
// October 28, 2026, and what it means for Las Vegas Valley / Nevada buyers.
//
// FACT DISCIPLINE (read before editing) — every program term below comes from
// Zillow's own public pages, read during this build pass:
//
// - Zillow Group investor-relations release, October 28, 2026 (SEATTLE, via
//   PRNewswire), "Zillow Home Loans will now help eligible buyers cover their
//   FHA down payment." Source for: 43 states + D.C.; the seven excluded states
//   (AZ, DE, FL, MA, NY, RI, VA); up to 3.5% of the purchase price or
//   appraised value, "whichever is lower"; 640 minimum credit score; FHA
//   purchase loan through Zillow Home Loans; primary residence; buyer must
//   qualify for the full monthly payment under standard underwriting; second
//   loan at 0% interest with no monthly payment; forgiven after five years of
//   on-time mortgage payments and owner occupancy; due in full if the buyer
//   moves out, sells or refinances before year five; FHA mortgage insurance
//   applies; up to 6.5% of the buyer's own funds may be added to reach 10%
//   down; no income cap or first-time-buyer requirement.
// - Zillow's newsroom copy of the same announcement (zillow.com/news/...)
//   returned HTTP 403 to our fetch. Its URL is linked as the primary
//   announcement, but every claim here was read from the IR version.
// - Zillow Home Loans program page + FAQ (zillow.com/homeloans/fha-down-
//   payment-assistance/). Source for: down payment only, not closing costs;
//   a forgivable loan, not a grant; prior homeownership does not disqualify;
//   ~5-minute prequalification form with no credit impact (that claim is
//   about the initial form only, and the article says so); a loan officer
//   reviews eligibility; Zillow's advice to plan at least 21 days from rate
//   lock to closing; Zillow's FAQ figure that closing costs typically run
//   2-5% of the loan amount (attributed, never turned into a dollar
//   estimate); availability depends on where ZHL and its lending partner are
//   licensed.
// - Zillow's consumer handout and agent overview (supplied by Mikey) agree
//   with the above: forgivable second lien, no monthly payment on the
//   assistance, can cover the full FHA minimum down payment, eligibility
//   confirmed by the loan officer. The agent overview is marked confidential:
//   background only — nothing from it is linked, quoted, embedded or
//   attributed here. Existing rate locks are raised only as a question for
//   the loan officer, with no rule stated.
// - Eric Wilson's launch quote was NOT used: we could not confirm the full
//   wording character for character.
// - Dollar examples are plain arithmetic (price x 3.5%), not local price
//   statistics: 350,000 -> 12,250; 400,000 -> 14,000 (matches Zillow's own
//   FAQ example); 450,000 -> 15,750; 500,000 -> 17,500.
// - Deliberately NOT stated: FHA county loan limits (not verified with HUD
//   this pass), DTI limits, property-type rules, education requirements,
//   dollar caps, deadlines, funding limits, first-mortgage rate/APR/fees, or
//   whether this stacks with Nevada programs or seller credits. Not Zillow's
//   separate older 1%-down conventional program or its assistance directory.
// - Hero (also the homepage/guides card): supplied by Mikey and uploaded to
//   public/images/hero on 2026-10-28 at his direction. Not a Media Image
//   Library file, so there is no library `usage` entry to record.
// ---------------------------------------------------------------------------

const HERO_IMAGE = "/images/hero/zillow-down-payment-assistance-nevada-hero.png";
const HERO_ALT =
  "Smiling woman in a green sweater looking at her phone, next to a graphic reading: Your down payment, covered up to 3.5%. That's 14k on a $400k home.";

const meta: StoryMeta = {
  title: "Zillow FHA Down Payment Assistance: What Nevada Buyers Need to Know | LVINIT",
  headline: "Zillow Launches Down Payment Assistance: What Nevada Buyers Need to Know",
  description:
    "Zillow Home Loans can now cover up to 3.5% of an FHA down payment, and Nevada is included. Who qualifies, the five-year forgiveness rules, and what Las Vegas buyers still pay.",
  path: "/guides/zillow-down-payment-assistance-nevada",
  image: HERO_IMAGE,
  imageWidth: 1672,
  imageHeight: 941,
  imageAlt: HERO_ALT,
  datePublished: "2026-10-28",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    {
      name: "Zillow Launches Down Payment Assistance: What Nevada Buyers Need to Know",
      path: "/guides/zillow-down-payment-assistance-nevada",
    },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

// FAQ JSON-LD — mirrors the FAQ section rendered below, word for word.
const FAQS: { q: string; a: string }[] = [
  {
    q: "Is Zillow's down payment assistance available in Nevada?",
    a: "Yes. Nevada is one of the 43 states (plus Washington, D.C.) where Zillow Home Loans launched the program on October 28, 2026. Being in Nevada only covers the geography, though. You still have to meet the program rules and qualify for the FHA loan through Zillow Home Loans.",
  },
  {
    q: "Do I have to be a first-time homebuyer?",
    a: "No. Zillow says there's no first-time-buyer requirement, and its FAQ says owning a home before doesn't disqualify you. The home you're buying does have to be your primary residence.",
  },
  {
    q: "Is there an income limit?",
    a: "Zillow says there's no income cap. That isn't the same as no income check: you still have to qualify for the full monthly mortgage payment under standard underwriting, which means your income gets verified.",
  },
  {
    q: "Does the assistance cover closing costs?",
    a: "No. Zillow's FAQ says the assistance applies to the down payment only. Closing costs, prepaid items and reserves are separate, so ask your loan officer for the total cash you'd need to close.",
  },
  {
    q: "Do I ever have to pay the assistance back?",
    a: "It can be forgiven, but it isn't a grant. Zillow says the assistance is forgiven after five years of on-time mortgage payments and owner occupancy. If you sell, refinance or move out before year five, the full amount is due.",
  },
  {
    q: "What credit score do I need?",
    a: "Zillow lists a 640 minimum credit score for the program. That's the program floor, not an approval. A loan officer still reviews your full file.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

const ZILLOW_NEWS =
  "https://www.zillow.com/news/zillow-home-loans-will-now-help-eligible-buyers-cover-their-fha-down-payment/";
const ZILLOW_PROGRAM = "https://www.zillow.com/homeloans/fha-down-payment-assistance/";
const ZILLOW_IR =
  "https://investors.zillowgroup.com/news-and-events/news/news-details/2026/Zillow-Home-Loans-will-now-help-eligible-buyers-cover-their-FHA-down-payment/default.aspx";

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className={linkCls} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
      <span>{children}</span>
    </li>
  );
}

const FACTS: { label: string; value: string }[] = [
  { label: "Announced", value: "October 28, 2026, by Zillow Home Loans" },
  { label: "Where", value: "43 states plus Washington, D.C. Nevada is included." },
  { label: "Not available in", value: "Arizona, Delaware, Florida, Massachusetts, New York, Rhode Island, Virginia" },
  { label: "Loan", value: "FHA purchase mortgage through Zillow Home Loans, primary residence only" },
  { label: "Assistance", value: "Up to 3.5% of the purchase price or appraised value, whichever is lower" },
  { label: "Structure", value: "Forgivable second loan: 0% interest, no monthly payment" },
  { label: "Minimum credit score", value: "640" },
  { label: "First-time buyer rule", value: "None" },
  { label: "Income cap", value: "None, but you must qualify for the full payment" },
  { label: "Covers", value: "Down payment only, not closing costs" },
  { label: "Forgiven", value: "After 5 years of on-time mortgage payments and owner occupancy" },
  { label: "Repaid in full", value: "If you sell, refinance or move out before year five" },
];

function FactsPanel() {
  return (
    <section id="program-facts" aria-label="Program facts" className="scroll-mt-24">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            The program at a glance
          </h2>
          <dl className="mt-8 overflow-hidden rounded-lg border border-lvinit-lightgray">
            {FACTS.map((f, i) => (
              <div
                key={f.label}
                className={`grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-[220px_1fr] sm:gap-6 ${
                  i % 2 ? "bg-lvinit-white" : "bg-lvinit-lightgray/40"
                }`}
              >
                <dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">{f.label}</dt>
                <dd className="text-body text-lvinit-black">{f.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-caption text-lvinit-warmgray">
            Source: Zillow&rsquo;s October 28, 2026 announcement and program FAQ. Terms can
            change, and eligibility requires lender approval.
          </p>
        </div>
      </Container>
    </section>
  );
}

const EXAMPLES: { price: string; assist: string }[] = [
  { price: "$350,000", assist: "$12,250" },
  { price: "$400,000", assist: "$14,000" },
  { price: "$450,000", assist: "$15,750" },
  { price: "$500,000", assist: "$17,500" },
];

export default function ZillowDownPaymentAssistanceNevadaPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Buyer Guide",
        headline: "Zillow Launches Down Payment Assistance: What Nevada Buyers Need to Know",
        subheadline:
          "Zillow Home Loans can now cover up to 3.5% of an FHA down payment for eligible buyers, and Nevada is in. Here's who qualifies, what it costs you if you leave early, and what you still pay.",
        image: HERO_IMAGE,
        imageAlt: HERO_ALT,
        backLink: { label: "LVINIT", href: "/" },
        ctas: [{ label: "See the program facts", href: "#program-facts", variant: "primary" }],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "The down payment is one piece of the cost of buying here. These cover the rest.",
        stories: [
          {
            name: "You Don't Need 20% Down To Buy a Home in Las Vegas",
            href: "/guides/las-vegas-down-payment-assistance-programs-2026",
            category: "Buyer Guide",
            dek: "Real minimums by loan type, plus Nevada's own state assistance programs and how they're structured.",
          },
          {
            name: "Las Vegas Mortgage Rates",
            href: "/guides/las-vegas-mortgage-rates",
            category: "Market Watch",
            dek: "Where rates are and what a move does to a Las Vegas payment. The assistance doesn't change your first-mortgage rate.",
          },
          {
            name: "HOA Fees in Las Vegas: What to Check Before You Make an Offer",
            href: "/guides/hoa-fees-las-vegas-what-to-check",
            category: "Buyer Guide",
            dek: "One of the monthly costs the down payment help doesn't touch.",
          },
          {
            name: "What $500K Buys in Las Vegas",
            href: "/guides/what-500k-buys-in-las-vegas",
            category: "Buyer guide",
            dek: "Three real home tours near the same budget.",
          },
        ],
      }}
      ctas={{
        heading: "Thinking about buying in the Las Vegas Valley?",
        body:
          "I can help you find the home and walk through the costs of buying here. Whether you qualify for this program, and on what terms, is up to the lender, not me or LVINIT. Get in touch when you're ready to start looking.",
      }}
    >
      <StoryLede
        kicker="Buyer News"
        lead="On October 28, 2026, Zillow Home Loans started offering down payment assistance on FHA loans, and Nevada is one of the states included. For an eligible Las Vegas-area buyer, that's one more possible way past the upfront cash hurdle."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          The short version: eligible buyers can get up to 3.5% of the home&rsquo;s price
          covered, which is the full minimum FHA down payment. It&rsquo;s a forgivable
          second loan, not a gift. It comes with conditions for five years, and it only
          works if you qualify for the full mortgage on your own. Here&rsquo;s what Zillow
          has actually published, from its{" "}
          <Ext href={ZILLOW_NEWS}>launch announcement</Ext> and{" "}
          <Ext href={ZILLOW_PROGRAM}>program FAQ</Ext>, and what to ask before you count
          on it.
        </p>
      </StoryLede>

      <FactsPanel />

      <StorySection muted heading="Is Zillow's down payment assistance available in Nevada?">
        <p className="text-body-lg text-lvinit-warmgray">
          Yes. Zillow launched it in 43 states plus Washington, D.C., and Nevada isn&rsquo;t
          on the exclusion list. The seven states left out are Arizona, Delaware, Florida,
          Massachusetts, New York, Rhode Island and Virginia. If you&rsquo;ve been looking at
          homes across the river in Arizona as well, that side is out.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          So a buyer in Las Vegas,{" "}
          <Link href="/neighborhoods/henderson" className={linkCls}>Henderson</Link> or{" "}
          <Link href="/neighborhoods/north-las-vegas" className={linkCls}>North Las Vegas</Link>{" "}
          is in a state where the program exists. That&rsquo;s all geography settles. Every
          borrower and every property still has to meet the program rules and FHA
          requirements, and Zillow notes availability depends on where Zillow Home Loans
          and its lending partner are licensed.
        </p>
      </StorySection>

      <StorySection heading="Who qualifies?">
        <p className="text-body-lg text-lvinit-warmgray">
          There are two layers here, and it helps to keep them separate.
        </p>
        <h3 className="mt-6 text-body-lg font-semibold text-lvinit-black">The program rules Zillow lists</h3>
        <ul className="mt-3 space-y-3 text-body-lg text-lvinit-warmgray">
          <Bullet>An FHA purchase loan through Zillow Home Loans.</Bullet>
          <Bullet>The home is your primary residence.</Bullet>
          <Bullet>A credit score of at least 640.</Bullet>
          <Bullet>No first-time-buyer requirement, and no income cap.</Bullet>
        </ul>
        <h3 className="mt-6 text-body-lg font-semibold text-lvinit-black">Normal mortgage underwriting</h3>
        <p className="mt-3 text-body-lg text-lvinit-warmgray">
          You have to qualify for the full monthly mortgage payment through standard
          underwriting. &ldquo;No income cap&rdquo; means earning more doesn&rsquo;t shut you
          out. It doesn&rsquo;t mean your income goes unchecked. Your income, debts, credit
          and the property itself still get reviewed. A Zillow Home Loans loan officer
          decides eligibility, not your real estate agent.
        </p>
      </StorySection>

      <StorySection muted heading="How much could you receive?">
        <p className="text-body-lg text-lvinit-warmgray">
          Up to 3.5% of the purchase price or the appraised value, whichever is lower. If
          the home appraises below your contract price, the assistance is figured on the
          appraisal. A few examples:
        </p>
        <div className="mt-6 overflow-hidden rounded-lg border border-lvinit-lightgray bg-lvinit-white">
          <table className="w-full text-left text-body">
            <thead>
              <tr className="border-b border-lvinit-lightgray">
                <th scope="col" className="px-5 py-3 text-caption uppercase tracking-wide text-lvinit-warmgray font-normal">
                  Purchase price
                </th>
                <th scope="col" className="px-5 py-3 text-caption uppercase tracking-wide text-lvinit-warmgray font-normal">
                  Up to 3.5%
                </th>
              </tr>
            </thead>
            <tbody>
              {EXAMPLES.map((e) => (
                <tr key={e.price} className="border-b border-lvinit-lightgray last:border-0">
                  <td className="px-5 py-3 text-lvinit-black">{e.price}</td>
                  <td className="px-5 py-3 font-semibold text-lvinit-blue">{e.assist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          These are illustrations, not local price statistics or promised amounts. They
          assume the home appraises at or above the purchase price, you qualify for the
          loan, and the loan fits within the applicable FHA limits. Zillow also says you
          can add up to 6.5% of your own money to reach a 10% down payment.
        </p>
      </StorySection>

      <StorySection heading="What happens if you sell, refinance, or move?">
        <p className="text-body-lg text-lvinit-warmgray">
          This is the part to understand before you sign. The assistance is a second loan
          on the home at 0% interest with no monthly payment. Zillow says it&rsquo;s
          forgiven after{" "}
          <span className="text-lvinit-black">
            five years of on-time mortgage payments and owner occupancy
          </span>
          . Both conditions matter. Simply owning the home for five years isn&rsquo;t the
          test.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If you <span className="text-lvinit-black">sell, refinance or move out before
          year five</span>, the full amount is due. On a $400,000 purchase, that could mean
          paying back $14,000 out of your sale proceeds or new loan. So if you might
          relocate for work, turn the home into a rental, or refinance if rates drop
          within five years, plan around that before you lean on this program. A future
          refinance isn&rsquo;t an automatic fix for affordability, since doing it early
          triggers repayment.
        </p>
      </StorySection>

      <StorySection muted heading="What expenses are still your responsibility?">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <Bullet>
            <span className="text-lvinit-black">Closing costs.</span> The assistance covers
            the down payment only. Zillow&rsquo;s FAQ says closing costs typically run 2% to
            5% of the loan amount. Your Loan Estimate will show your actual figure, and
            our{" "}
            <Link href="/guides/closing-costs-las-vegas-buyers" className={linkCls}>
              Las Vegas closing costs guide
            </Link>{" "}
            explains what goes into it.
          </Bullet>
          <Bullet>
            <span className="text-lvinit-black">Your first mortgage.</span> It carries its
            own interest rate and monthly payment. The 0% and no-payment terms only apply to
            the assistance loan. See where{" "}
            <Link href="/guides/las-vegas-mortgage-rates" className={linkCls}>
              Las Vegas mortgage rates
            </Link>{" "}
            stand.
          </Bullet>
          <Bullet>
            <span className="text-lvinit-black">FHA mortgage insurance.</span> Zillow
            confirms it applies. Ask how much it adds to your payment.
          </Bullet>
          <Bullet>
            <span className="text-lvinit-black">Ongoing ownership costs</span>: property
            taxes, homeowners insurance and, in many valley neighborhoods,{" "}
            <Link href="/guides/hoa-fees-las-vegas-what-to-check" className={linkCls}>
              HOA dues
            </Link>
            . Resale buyers should also understand how{" "}
            <Link href="/guides/nevada-property-tax-abatement-resale-buyers" className={linkCls}>
              Nevada&rsquo;s property tax abatement
            </Link>{" "}
            affects their bill.
          </Bullet>
        </ul>
      </StorySection>

      <StorySection heading="What should you ask before applying?">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <Bullet>What&rsquo;s my total cash needed to close, in writing, with and without the assistance?</Bullet>
          <Bullet>
            What are the rate, APR and fees on the first mortgage? Get a written Loan
            Estimate and compare total costs with at least one other lender. Zillow
            hasn&rsquo;t said this program comes with any pricing advantage.
          </Bullet>
          <Bullet>
            How is forgiveness documented after five years, and what do I receive to
            show the second lien is released?
          </Bullet>
          <Bullet>
            What happens to forgiveness if I make a late payment during those five years?
          </Bullet>
          <Bullet>
            I already have a loan in process or a rate locked. Does that affect whether
            I can use the program? Confirm this with the loan officer before you change
            anything.
          </Bullet>
          <Bullet>
            Can this be combined with a seller credit, a Nevada assistance program or any
            other incentive? Don&rsquo;t assume it can.
          </Bullet>
          <Bullet>
            What timeline should I plan for? Zillow advises at least 21 days between rate
            lock and closing. That&rsquo;s their planning guidance, not a promised date.
          </Bullet>
        </ul>
      </StorySection>

      <StorySection muted heading="Next steps">
        <p className="text-body-lg text-lvinit-warmgray">
          Zillow says the first step is a prequalification form that takes about five
          minutes and doesn&rsquo;t affect your credit. That describes the first form only,
          so ask before any later step whether it involves a credit check. A loan officer then reviews
          your eligibility and options.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          This is also one option among several. Nevada&rsquo;s own programs, including
          Home Is Possible and the Worker Advantage Program, are laid out in our{" "}
          <Link href="/guides/las-vegas-down-payment-assistance-programs-2026" className={linkCls}>
            guide to buying with less than 20% down
          </Link>
          . Don&rsquo;t confuse this launch with Zillow&rsquo;s separate, older
          conventional-loan offer or its general assistance directory. This one is
          FHA-only.
        </p>
      </StorySection>

      <StorySection heading="Frequently asked questions">
        <div className="space-y-8">
          {FAQS.map((f) => (
            <div key={f.q}>
              <h3 className="text-body-lg font-semibold text-lvinit-black">{f.q}</h3>
              <p className="mt-2 text-body-lg text-lvinit-warmgray">{f.a}</p>
            </div>
          ))}
        </div>
      </StorySection>

      <StorySection muted heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Zillow Home Loans</span>, &ldquo;Zillow Home
            Loans will now help eligible buyers cover their FHA down payment,&rdquo; October
            28, 2026: <Ext href={ZILLOW_NEWS}>Zillow newsroom</Ext> and{" "}
            <Ext href={ZILLOW_IR}>Zillow Group investor relations</Ext>.
          </li>
          <li>
            <span className="text-lvinit-black">Zillow Home Loans</span>,{" "}
            <Ext href={ZILLOW_PROGRAM}>FHA down payment assistance program page and FAQ</Ext>.
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Published October 28, 2026, the day of Zillow&rsquo;s announcement. This is general
          information, not lending or financial advice. LVINIT and The Scofield Group
          don&rsquo;t offer, fund or approve this assistance. Program terms and
          availability can change, and eligibility requires approval from Zillow Home
          Loans.
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
