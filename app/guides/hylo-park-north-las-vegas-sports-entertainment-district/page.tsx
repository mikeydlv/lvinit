import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// GROWTH & DEVELOPMENT / NEW & NOTEWORTHY — Hylo Park, North Las Vegas.
// Built by the LVINIT Daily Publisher (2026-11-08) from Local Radar assignment
// LR-HYLO-PARK-NLV (run 16, CONDITIONAL; handoff forDate read as 2026-11-09,
// one day ahead of the Pacific publication date; story still timely/unpublished).
//
// FACT DISCIPLINE (all read 2026-11-08):
// - News3LV (Oct 1 2026): city leaders + Agora marked start of final phase
//   Wed Sept 30 2026; 73 acres; 250,000 sq ft field house; Hylo Park Ice Arena
//   renovation; phase 2 retail completed July 2026; The West End ~400 homes.
// - Fox5 (Sept 30 2026): arena operating with a temporary basketball floor over
//   the ice, hosting youth games; Craig Ranch Regional Park ~2M visitors last
//   year; Special Olympics / elite youth basketball partnerships planned;
//   sports-focused charter school; Mayor Goynes-Brown quotes.
// - KTNV: Cardenas, In-N-Out, Ross, Starbucks at Hylo Park South; Hylo Park
//   North expected "around this time next year"; Lefton quote.
// - REBusiness (Oct 7 2026): $375M, 25 acres, 177-key hotel, late 2027,
//   Lennar building The West End.
// OMITTED ON PURPOSE: hotel brand (sources conflict), $380M figure, the
//   November tournament (KTNV only), any opening date, any claim a primary
//   Agora or city release was read (city site 403, hylopark.com has no detail).
// IMAGERY: no first-party Hylo Park photo exists yet, and the library's North
//   Las Vegas photos are from a different part of the city. No image used.
// ---------------------------------------------------------------------------

const PATH = "/guides/hylo-park-north-las-vegas-sports-entertainment-district";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const TITLE =
  "Hylo Park in North Las Vegas: What's Open, What's Being Built, and What Comes Next";

const meta: StoryMeta = {
  title: `${TITLE} | LVINIT`,
  headline: TITLE,
  description:
    "Hylo Park is a 73-acre youth sports and entertainment district on the old Fiesta Rancho site in North Las Vegas. What's open now, what the final phase adds, and what isn't confirmed.",
  path: PATH,
  datePublished: "2026-11-08",
  dateModified: "2026-11-08",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Hylo Park", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function HyloParkPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Growth & Development",
        headline: TITLE,
        subheadline:
          "A 73-acre sports and entertainment district is taking shape where the Fiesta Rancho casino used to be. Some of it is open. The biggest piece isn't built yet.",
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on what's being built in North Las Vegas.",
        stories: [
          {
            name: "North Las Vegas Neighborhood Guide",
            href: "/neighborhoods/north-las-vegas",
            category: "Neighborhoods",
            dek: "How North Las Vegas breaks down and where it's growing.",
          },
          {
            name: "One Civic Center: North Las Vegas Redevelopment",
            href: "/guides/one-civic-center-north-las-vegas-redevelopment",
            category: "Local Feature",
            dek: "Another Agora Realty project, on the old City Hall site.",
          },
          {
            name: "The I-215 Northern Beltway Trail",
            href: "/guides/i-215-northern-beltway-trail-north-las-vegas",
            category: "Local Feature",
            dek: "What North Las Vegas is building along the 215.",
          },
        ],
      }}
      ctas={{
        heading: "Thinking about North Las Vegas?",
        body:
          "Tell me what matters to you and I'll give you an honest read on where to look.",
      }}
    >
      <StoryLede
        kicker="Growth & Development"
        lead="Hylo Park is a planned 73-acre youth sports and entertainment district on the former Fiesta Rancho casino site in North Las Vegas. City leaders and the developer, Agora Realty, marked the start of the third and final phase on Wednesday, Sept. 30, 2026."
      />

      <StorySection heading="The short version">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">What:</span> a 73-acre
            master-planned district built around youth and collegiate sports,
            with retail, a school and, in the final phase, an indoor field house.
          </li>
          <li>
            <span className="text-lvinit-black">Open now:</span> Hylo Park
            South, a retail center finished in July 2026, and a renovated arena
            that Fox5 reported is already hosting youth games.
          </li>
          <li>
            <span className="text-lvinit-black">Still coming:</span> a field
            house of roughly 250,000 square feet, plus more shops, restaurants,
            a family entertainment center and a hotel.
          </li>
          <li>
            <span className="text-lvinit-black">Timing:</span> trade reporting
            says late 2027. No official opening date has been published.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="What's open today">
        <p className="text-body-lg text-lvinit-warmgray">
          The second phase, Hylo Park South, is a grocery-anchored shopping
          center of about 90,750 square feet, according to REBusiness. KTNV
          lists Cardenas, In-N-Out, Ross and Starbucks among its tenants.
          News3LV reports it was completed in July 2026.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The arena is the other piece in use. It is the former Fiesta Rancho
          ice rink, now called the Hylo Park Ice Arena and being renovated.
          Fox5 reported on Sept. 30 that it was already operating, with a
          temporary basketball floor laid over the ice, and hosting youth
          games. Construction continues on the rest of the site.
        </p>
      </StorySection>

      <StorySection heading="What the final phase adds">
        <p className="text-body-lg text-lvinit-warmgray">
          REBusiness reports the third phase at $375 million on 25 acres, with
          completion slated for late 2027. The reported pieces:
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            A multi-sport indoor field house of about 250,000 square feet
            (reported by both KTNV and REBusiness).
          </li>
          <li>The renovated arena.</li>
          <li>An outdoor public space and community field.</li>
          <li>Shops, restaurants and a family entertainment center.</li>
          <li>
            A 177-key hotel, per REBusiness. I&rsquo;m not naming a brand,
            because the reports don&rsquo;t agree on one.
          </li>
          <li>
            Game Changers Sports Academy, a sports-focused school on the
            campus.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Agora CEO Cary Lefton told KTNV the park will be &ldquo;a place where
          North Las Vegas families can enjoy sports, movie nights, concerts and
          watch parties.&rdquo; Fox5 reported partnerships planned with Special
          Olympics and elite youth basketball programs.
        </p>
      </StorySection>

      <StorySection muted heading="Why the city cares">
        <p className="text-body-lg text-lvinit-warmgray">
          Fox5 reported that city officials point to Craig Ranch Regional Park,
          which they say drew about 2 million visitors last year, as the model.
          Mayor Pamela Goynes-Brown called Hylo Park &ldquo;a sports tourism
          win&rdquo; for the city&rsquo;s economic development effort. News3LV
          says the city expects the complex to host youth and collegiate
          events, including local and national tournaments.
        </p>
      </StorySection>

      <StorySection heading="What it means if you live nearby">
        <p className="text-body-lg text-lvinit-warmgray">
          For North Las Vegas families, the practical change is a place for
          organized sports and events that doesn&rsquo;t require driving across
          the valley, plus everyday shopping already open. Next door, Lennar is
          building a community called The West End, reported at about 400
          homes. If tournaments draw out-of-town teams, expect more weekend
          traffic and activity around the site once the field house opens.
          That&rsquo;s my read, not something the city has projected.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          For the bigger picture, my{" "}
          <Link href="/neighborhoods/north-las-vegas" className={linkCls}>
            North Las Vegas guide
          </Link>{" "}
          covers how the city breaks down. Agora is also behind{" "}
          <Link
            href="/guides/one-civic-center-north-las-vegas-redevelopment"
            className={linkCls}
          >
            the redevelopment of the old City Hall site
          </Link>
          , and for another recreation project in the city, see{" "}
          <Link
            href="/guides/i-215-northern-beltway-trail-north-las-vegas"
            className={linkCls}
          >
            the I-215 Northern Beltway Trail
          </Link>
          . New to the valley? Start with{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection muted heading="What I haven't confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">An opening date.</span> KTNV
            said the north phase is expected around this time next year;
            REBusiness said late 2027. Neither is an official date, so treat
            both as targets.
          </li>
          <li>
            <span className="text-lvinit-black">The hotel brand.</span> Reports
            differ, so I&rsquo;m leaving it out.
          </li>
          <li>
            <span className="text-lvinit-black">Primary documents.</span> I
            couldn&rsquo;t read a city or Agora release for the final phase, so
            the cost and schedule come from news and trade reports.
          </li>
          <li>
            <span className="text-lvinit-black">Public access.</span> I
            haven&rsquo;t confirmed arena schedules, ticketing or hours, and
            this page has no photos of the site yet.
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">News3LV</span>, Oct. 1, 2026.{" "}
            <a
              href="https://news3lv.com/news/local/north-las-vegas-sports-entertainment-complex-celebrates-final-construction-phase"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              news3lv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>, Sept. 30,
            2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/09/30/new-73-acre-community-sports-hub-planned-north-las-vegas/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KTNV</span>, Hylo Park final
            phase.{" "}
            <a
              href="https://www.ktnv.com/neighborhoods/north-las-vegas/hylo-park-final-phase-moving-forward-in-north-las-vegas"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              ktnv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">REBusiness</span>, Oct. 7, 2026.{" "}
            <a
              href="https://rebusinessonline.com/agora-realty-breaks-ground-on-375m-final-phase-of-mixed-use-entertainment-project-in-north-las-vegas/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              rebusinessonline.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
