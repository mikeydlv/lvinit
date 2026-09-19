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
// LOCAL FEATURE — "Henderson Sport & Social opens." Built via the autonomous
// scheduled editorial-publishing routine. Grepped the repo for "Henderson
// Sport & Social," "West Henderson Fieldhouse," and "St. Rose Pkwy" before
// writing — the only prior LVINIT mention is the Henderson pillar guide's own
// Development Watch entry, which already had this project (under its old
// name, "West Henderson Fieldhouse") listed as under construction with a
// "fall 2026, early October reported" caveat. This piece is the confirmed
// follow-through on that entry, not a duplicate of anything already
// published — and it also isn't the Fiesta Henderson piece
// (/guides/fiesta-henderson-redevelopment), a different Henderson sports
// project at a different site that this article explicitly disambiguates
// from, mirroring the disambiguation that piece already carries in the other
// direction.
//
// FACT DISCIPLINE (read before editing) — every figure below was independently
// verified this run via direct fetch of the source itself (not a search
// summary), across five separately published outlets that agree with each
// other on every number reused here:
// - Nevada Business Magazine, "Henderson Sport & Social Announces Grand
//   Opening in West Henderson, Oct. 16," published Sept. 2026 — primary
//   source for the confirmed grand-opening date, the soft-opening schedule,
//   the amenities list, and the Swanlund/Romero quotes.
//   https://nevadabusiness.com/2026/09/henderson-sport-social-announces-grand-opening-in-west-henderson-oct-16/
// - News 3 Las Vegas (KSNV), "Henderson Sport and Social sets opening date for
//   new community fieldhouse" — corroborates the opening schedule, address,
//   size, cost, and no-membership-required public access.
//   https://news3lv.com/news/local/henderson-sport-social-opening-date-community-fieldhouse-st-rose-parkway-las-vegas-valley-nevada
// - FOX5 Vegas, "City of Henderson announces new name," published June 2,
//   2026 — source for the June 2026 rename from West Henderson Fieldhouse,
//   the $60M city / $10M KemperSports funding split, the GM's name and title,
//   and the early membership/league pricing figures (flagged below as
//   pre-opening, not final).
//   https://www.fox5vegas.com/2026/06/02/city-henderson-announces-new-name-west-henderson-fieldhouse-project/
// - KTNV, "Groundbreaking date set for 'state-of-the-art' West Henderson
//   Fieldhouse" — source for the May 21, 2025 groundbreaking date, the exact
//   address (3375 St. Rose Pkwy, at St. Rose and Maryland Pkwys, behind
//   Chicken N Pickle), and the public-funding breakdown (bond sale + West
//   Henderson Development Fund + city municipal facilities fund).
//   https://www.ktnv.com/news/groundbreaking-date-set-for-state-of-the-art-west-henderson-fieldhouse
// - KemperSports' own property page for Henderson Sport & Social — confirms
//   the address, 180,000 sq ft figure, and the operator's own description of
//   the amenities and the public-private partnership structure.
//   https://www.kempersports.com/properties/henderson-sport-and-social/
//
// - Square footage note: the pre-groundbreaking KTNV coverage (May 2025) put
//   the building at 160,000 sq ft; every source published closer to opening
//   (Nevada Business Magazine, News 3, KemperSports' own page) says 180,000
//   sq ft. This piece uses the more recent, closer-to-opening figure and
//   doesn't speculate about why it grew.
// - Pricing caveat: the ~$55/month fitness membership and ~$100/season youth
//   league figures come only from the June 2026 FOX5 piece, reported months
//   before opening. Nothing published closer to the Sept. 2026 grand-opening
//   announcements repeats a specific price, so this piece states those
//   numbers as June-reported estimates and tells readers to confirm current
//   pricing at hendersonsportandsocial.com rather than treating them as
//   today's rate card.
// - Deliberately NOT used: the pre-construction economic-impact projections
//   circulated in 2025 coverage (200+ permanent jobs, $1.5M in annual tax
//   revenue, etc.) — those are a city projection made before the building
//   existed, not a verified outcome, and repeating them here as if they were
//   confirmed results would overstate what's actually known.
// - Deliberately NOT confused with: the separate, still-conceptual
//   redevelopment of the former Fiesta Henderson casino site at Lake Mead
//   Parkway and the 215/I-11 interchange, covered in
//   /guides/fiesta-henderson-redevelopment. Different site, different
//   developer (Agora Realty & Management, not KemperSports), different
//   funding structure, and — as of this piece's publish date — not approved,
//   let alone built.
//
// IMAGERY — C:\LVINIT\Images was checked for and confirmed not reachable
// from this Linux cloud session (it's a path on Mikey's local Windows
// machine, not mounted here). No existing repo photography depicts this
// specific building — it doesn't open to the public until Oct. 16, 2026, and
// LVINIT has no rights to KemperSports' or the city's own renderings. Per the
// standard fallback order, this piece carries a generated LVINIT editorial
// cover (registered in lib/content.ts as the card image only, imageMode
// "editorial-cover") and a photoless StoryHero — never a stand-in photo of
// Henderson generally.
//   node scripts/generate-guide-cover.mjs \
//     --slug henderson-sport-social-grand-opening --category "Local Feature" \
//     --subject "Henderson Sport & Social"
//   -> public/images/covers/henderson-sport-social-grand-opening-editorial-cover.webp
// ---------------------------------------------------------------------------

const PATH = "/guides/henderson-sport-social-grand-opening";

const meta: StoryMeta = {
  title:
    "Henderson Sport & Social Opens Oct. 16 — What's Actually Inside | LVINIT",
  headline:
    "Henderson Sport & Social Opens October 16. Here's What West Henderson Is Getting",
  description:
    "The $70 million, 180,000-square-foot sports and entertainment complex at St. Rose and Maryland Parkways has a confirmed grand-opening date. What's actually inside, what it costs, and how it's different from the Fiesta Henderson site.",
  path: PATH,
  datePublished: "2026-09-19",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Henderson Sport & Social", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

// FAQ JSON-LD — answers drawn only from the cited, dated figures above.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Where is Henderson Sport & Social?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "3375 St. Rose Pkwy, Henderson, Nevada — at the corner of St. Rose and Maryland Parkways in West Henderson, behind Chicken N Pickle.",
      },
    },
    {
      "@type": "Question",
      name: "When does Henderson Sport & Social open?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A soft opening begins Monday, October 5, 2026, with limited operating hours on Wednesday, October 7 and Thursday, October 15. The grand opening is confirmed for Friday, October 16, 2026, with a silent auction running through Saturday, October 17 benefiting the Cure 4 The Kids Foundation.",
      },
    },
    {
      "@type": "Question",
      name: "Do you need a membership to visit Henderson Sport & Social?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The venue is open to the public with no membership required for general access — bowling, laser tag, mini golf, the arcade, and the restaurant are pay-as-you-go. A fitness membership and youth sports league registration are separate, optional add-ons.",
      },
    },
    {
      "@type": "Question",
      name: "Is Henderson Sport & Social the same project as the Fiesta Henderson redevelopment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Henderson Sport & Social is a finished, opening building at St. Rose and Maryland Parkways in West Henderson, funded by the city and KemperSports. The Fiesta Henderson site is a separate, still-conceptual redevelopment proposal at Lake Mead Parkway and the 215/I-11 interchange, with a different developer (Agora Realty & Management) and no approved project yet.",
      },
    },
  ],
};

export default function HendersonSportSocialGrandOpeningPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Henderson · Local Feature",
        headline:
          "Henderson Sport & Social Opens October 16. Here's What West Henderson Is Getting",
        subheadline:
          "The $70 million, 180,000-square-foot sports and entertainment complex the city broke ground on in May 2025 as the West Henderson Fieldhouse has a confirmed grand-opening date, a new name, and a full list of what's actually inside.",
        backLink: { label: "LVINIT", href: "/" },
        ctas: [
          { label: "See the numbers", href: "#by-the-numbers", variant: "primary" },
        ],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "Henderson Sport & Social is one of two Henderson sports-facility stories LVINIT is tracking right now — here's how it fits with the rest.",
        stories: [
          {
            name: "Living in Henderson",
            href: "/neighborhoods/henderson",
            category: "Area Guide",
            dek: "The full guide to Henderson's communities, including the West Henderson planning area this venue sits inside.",
          },
          {
            name: "The Fiesta Henderson Site Finally Has a Plan",
            href: "/guides/fiesta-henderson-redevelopment",
            category: "Local Feature",
            dek: "A separate, still-conceptual sports-and-retail proposal on the other side of the city — different site, different developer, not approved yet.",
          },
          {
            name: "Henderson vs. Southwest Las Vegas: Where Should You Actually Move?",
            href: "/guides/henderson-vs-southwest-las-vegas",
            category: "Comparisons",
            dek: "Zoom out to how Henderson compares to the valley's other big growth corridor, including the West Henderson employment push.",
          },
        ],
      }}
      relatedNeighborhood={{
        name: "Henderson",
        href: "/neighborhoods/henderson",
        kicker: "The parent guide",
        heading: "Read the Henderson guide",
        blurb:
          "Henderson Sport & Social sits inside the West Henderson planning area our full Henderson guide already covers, and its Development Watch section has been tracking this exact project since before it had its current name.",
      }}
      ctas={{
        heading: "Weighing West Henderson for your next move?",
        body:
          "A new $70 million amenity doesn't change a home's price by itself, but it's a real, honest data point about where the city is investing next. Tell me what you're weighing and I'll give you the straight read on West Henderson versus everywhere else you're considering.",
      }}
    >
      <StoryLede
        kicker="Local Feature"
        lead="For a little over a year, the lot at St. Rose and Maryland Parkways has been a construction site most people driving past only half-noticed. On October 16, 2026, it opens as Henderson Sport & Social — a 180,000-square-foot indoor sports and entertainment complex, and the largest single amenity the city has added to its western side since the hospital that opened a few miles away in 2024."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Our{" "}
          <Link
            href="/neighborhoods/henderson"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Henderson guide
          </Link>{" "}
          has been tracking this project since before it had its current
          name, when it was still listed under construction as the West
          Henderson Fieldhouse. The opening date is now confirmed. Here&rsquo;s
          what&rsquo;s actually inside, what it costs to walk in, and why
          it&rsquo;s not the same project as the other Henderson sports
          complex making headlines this month.
        </p>
      </StoryLede>

      <section id="by-the-numbers" aria-label="Henderson Sport & Social snapshot" className="scroll-mt-24">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto max-w-[900px]">
            <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
              Henderson Sport &amp; Social, by the numbers
            </h2>
            <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
              What&rsquo;s actually confirmed, sourced to the announcements
              below. See the Sources section at the end of this article for
              the full reporting.
            </p>

            <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-lvinit-lightgray bg-lvinit-lightgray sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  value: "180,000 sq ft",
                  label: "The building",
                  note: "Two levels, at St. Rose and Maryland Pkwys in West Henderson",
                },
                {
                  value: "$70M",
                  label: "Total project cost",
                  note: "$60M from the City of Henderson, $10M from KemperSports",
                },
                {
                  value: "Oct. 16, 2026",
                  label: "Confirmed grand opening",
                  note: "Soft opening starts Oct. 5; limited hours Oct. 7 and Oct. 15",
                },
                {
                  value: "No membership required",
                  label: "General access",
                  note: "Open to the public; fitness and youth-league sign-ups are separate",
                },
              ].map((s) => (
                <div key={s.label} className="bg-lvinit-white p-6">
                  <dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                    {s.label}
                  </dt>
                  <dd className="mt-2 font-display text-heading font-bold text-lvinit-blue">
                    {s.value}
                  </dd>
                  <p className="mt-2 text-caption text-lvinit-warmgray">
                    {s.note}
                  </p>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <StorySection heading="What's actually inside">
        <p className="text-body-lg text-lvinit-warmgray">
          The building splits roughly into a sports side and a family-
          entertainment side. The sports side has{" "}
          <span className="text-lvinit-black">
            four convertible basketball courts
          </span>{" "}
          that switch over to volleyball or pickleball, plus{" "}
          <span className="text-lvinit-black">
            two hybrid turf fields
          </span>{" "}
          for indoor soccer, box lacrosse, and indoor football, along with a
          full fitness center that runs group classes.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The entertainment side is a roughly{" "}
          <span className="text-lvinit-black">30,000-square-foot</span> zone
          built for walk-in visitors rather than league players:{" "}
          <span className="text-lvinit-black">
            20 bowling lanes, including six luxury VIP lanes
          </span>
          , a double-decker laser tag arena, a mini-golf course, an arcade,
          and a full-service restaurant and bar. There&rsquo;s also a
          child-watch area and dedicated community and event rooms for things
          like birthday parties.
        </p>
      </StorySection>

      <StorySection heading="How Henderson paid for it">
        <p className="text-body-lg text-lvinit-warmgray">
          This is a public-private partnership, not a purely private
          development. The City of Henderson owns the property; KemperSports,
          a national sports-and-hospitality management firm, financed part of
          the build and operates the venue long-term. Of the roughly{" "}
          <span className="text-lvinit-black">$70 million</span> total
          project cost, KemperSports put in{" "}
          <span className="text-lvinit-black">$10 million</span>, with the
          rest coming from the city through a public infrastructure bond
          sale, the West Henderson Development Fund, and the city&rsquo;s
          municipal facilities fund.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The city broke ground on{" "}
          <span className="text-lvinit-black">May 21, 2025</span>, under the
          project&rsquo;s original working name, the West Henderson
          Fieldhouse. It was renamed{" "}
          <span className="text-lvinit-black">Henderson Sport &amp; Social</span>{" "}
          in June 2026 — if you&rsquo;ve seen the older name on a map listing
          or an older article, it&rsquo;s the same building.
        </p>
      </StorySection>

      <StoryPullQuote cite="Mayor Michelle Romero, City of Henderson">
        This public-private partnership is a strategic investment in our
        community that will attract tournaments and visitors, support local
        businesses, create jobs and generate economic activity.
      </StoryPullQuote>

      <StorySection heading="What it costs to walk in">
        <p className="text-body-lg text-lvinit-warmgray">
          General access doesn&rsquo;t require a membership. Bowling, laser
          tag, mini golf, the arcade, and the restaurant are pay-as-you-go,
          the same as any family entertainment center. A fitness membership
          and youth sports league registration are separate, optional tiers
          for people who want to use the venue regularly rather than visit
          once.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The only specific pricing reported so far came from a June 2026
          FOX5 Vegas story, months before opening: a fitness membership
          around <span className="text-lvinit-black">$55 a month</span> and a
          youth sports league season around{" "}
          <span className="text-lvinit-black">$100</span>, both with a{" "}
          <span className="text-lvinit-black">20% discount for Henderson
          residents</span>. Nothing published closer to the October opening
          repeats those exact figures, so treat them as a June estimate, not
          today&rsquo;s rate card — check hendersonsportandsocial.com for
          current pricing before you plan around it.
        </p>
      </StorySection>

      <StoryPullQuote cite="Jeff Swanlund, General Manager, Henderson Sport & Social">
        This venue is designed to give guests a place to gather, have fun and
        create lasting memories year-round.
      </StoryPullQuote>

      <StorySection muted heading="Don't confuse this with the Fiesta Henderson site">
        <p className="text-body-lg text-lvinit-warmgray">
          Henderson has two sports-facility stories in the news at the same
          time right now, on opposite sides of the city, and it&rsquo;s
          genuinely easy to mix them up.{" "}
          <span className="text-lvinit-black">Henderson Sport &amp; Social</span>{" "}
          is the finished building this article is about — funded by the
          city and KemperSports, opening October 16 at St. Rose and Maryland
          Parkways in West Henderson. The{" "}
          <Link
            href="/guides/fiesta-henderson-redevelopment"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Fiesta Henderson site
          </Link>{" "}
          is a different, still-conceptual proposal at Lake Mead Parkway and
          the 215/I-11 interchange near downtown Henderson, with a different
          developer (Agora Realty &amp; Management) and no approved project or
          construction start yet. Same city, same general idea, two entirely
          separate projects.
        </p>
      </StorySection>

      <StorySection heading="What this means if you're looking at West Henderson">
        <p className="text-body-lg text-lvinit-warmgray">
          A new sports and entertainment complex doesn&rsquo;t change a
          home&rsquo;s price by itself, and this piece isn&rsquo;t claiming it
          will — no source cited here makes that claim either. What it does
          confirm is a pattern our{" "}
          <Link
            href="/neighborhoods/henderson"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Henderson guide
          </Link>{" "}
          already flagged: West Henderson, the growth front west and south of
          St. Rose Parkway, keeps adding the kind of everyday infrastructure
          that used to require a drive across town — a hospital in 2024, and
          now a family amenity this size. If you&rsquo;re weighing Inspirada,
          Cadence, or anywhere else on this side of the city partly on
          &ldquo;what&rsquo;s actually out there,&rdquo; this is a real,
          checkable answer, not a developer&rsquo;s promise about something
          that hasn&rsquo;t broken ground.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It&rsquo;s also worth knowing about if you already live nearby and
          have young kids in travel sports or rec leagues — a 180,000-square-
          foot venue with four courts and two turf fields is a genuinely
          different tournament-hosting option than what West Henderson had a
          year ago.
        </p>
      </StorySection>

      <StorySection heading="If you want to see it early">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Monday, October 5</span> —
              soft opening begins.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">
                Wednesday, October 7 and Thursday, October 15
              </span>{" "}
              — limited operating hours during the soft-opening window.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">
                Friday, October 16 — grand opening.
              </span>{" "}
              A silent auction runs through Saturday, October 17, with
              proceeds benefiting the Cure 4 The Kids Foundation.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Nevada Business Magazine</span>
            , &ldquo;Henderson Sport &amp; Social Announces Grand Opening in
            West Henderson, Oct. 16,&rdquo; published September 2026 —
            primary source for the confirmed grand-opening date, the
            soft-opening schedule, the amenities list, and the Swanlund and
            Romero quotes.{" "}
            <a
              href="https://nevadabusiness.com/2026/09/henderson-sport-social-announces-grand-opening-in-west-henderson-oct-16/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              nevadabusiness.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">News 3 Las Vegas (KSNV)</span>,
            &ldquo;Henderson Sport and Social sets opening date for new
            community fieldhouse&rdquo; — corroborates the opening schedule,
            address, size, cost, and no-membership-required public access.{" "}
            <a
              href="https://news3lv.com/news/local/henderson-sport-social-opening-date-community-fieldhouse-st-rose-parkway-las-vegas-valley-nevada"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              news3lv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">FOX5 Vegas</span>, &ldquo;City
            of Henderson announces new name for West Henderson Fieldhouse
            project,&rdquo; published June 2, 2026 — source for the June 2026
            rename, the $60M/$10M city/KemperSports funding split, and the
            early (pre-opening) membership and youth-league pricing figures.{" "}
            <a
              href="https://www.fox5vegas.com/2026/06/02/city-henderson-announces-new-name-west-henderson-fieldhouse-project/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KTNV</span>, &ldquo;Groundbreaking
            date set for &lsquo;state-of-the-art&rsquo; West Henderson
            Fieldhouse&rdquo; — source for the May 21, 2025 groundbreaking
            date, the exact address, and the public-funding breakdown.{" "}
            <a
              href="https://www.ktnv.com/news/groundbreaking-date-set-for-state-of-the-art-west-henderson-fieldhouse"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              ktnv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KemperSports</span>, official
            Henderson Sport &amp; Social property page — confirms the address,
            the 180,000-square-foot figure, and the operator&rsquo;s own
            description of the amenities and public-private partnership.{" "}
            <a
              href="https://www.kempersports.com/properties/henderson-sport-and-social/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              kempersports.com
            </a>
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Opening-week plans, hours, and pricing can still change between now
          and October 16 — confirm current details at
          hendersonsportandsocial.com before you visit. This article is
          general local reporting, not an endorsement, membership offer, or
          investment advice.
        </p>
      </StorySection>

      <StorySection heading="About this coverage">
        <p className="text-body text-lvinit-warmgray">
          LVINIT Editorial · The Scofield Group · Nevada License S.0175577.
          Equal Housing Opportunity.
        </p>
      </StorySection>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </StoryPage>
  );
}
