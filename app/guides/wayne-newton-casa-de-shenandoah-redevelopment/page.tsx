import type { Metadata } from "next";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection, StoryGallery } from "@/components/story";

// ---------------------------------------------------------------------------
// LOCAL FEATURE — Wayne Newton's former Casa de Shenandoah estate is proposed
// to become a 77-lot single-family subdivision. Built via the autonomous
// scheduled editorial-publishing routine.
//
// TOPIC SELECTION: checked lib/content.ts and the live /guides catalog first.
// Already covered and explicitly excluded this run: the mortgage-rate thread
// (three installments already live, most recently the Sept 17 PMMS print at
// 6.95%), Gholson Landing, and Sandstone/Landings at Sandstone. A fourth
// mortgage-rate piece was considered — Freddie Mac's PMMS printed 7.03% for
// the week of Sept 24, 2026, the first weekly average above 7% since January
// 2025 (freddiemac.com/pmms; corroborated by GlobeNewswire, Yahoo Finance,
// Fox Business) — but four installments of the same weekly-print story in
// three weeks was judged too repetitive for one small site, so that fresh
// data point was set aside in favor of a genuinely new topic. Casa de
// Shenandoah is not mentioned anywhere in lib/content.ts or any existing page.
//
// FACT DISCIPLINE — every figure below is sourced to the "Sources" section at
// the foot of the article, independently corroborated across at least two
// outlets for every load-bearing number:
// - Developer (Blue Heron), site (~39.5 acres, southwest corner of Sunset and
//   Pecos roads), lot count (77), home size (2,000+ sq ft, one- and two-story),
//   and the plan to keep the existing man-made lake and perimeter walls: Las
//   Vegas Review-Journal (Eli Segall, Sept. 22-23, 2026), corroborated by CDC
//   Gaming's brief (citing the same RJ reporting) and KLAS/8 News Now
//   (Nicholas Sommer, Sept. 22, 2026).
// - Lot-size range (16,500-30,000 sq ft, ~20,500 sq ft average), private
//   40-foot streets, ~201,000 sq ft of common open space around the lake,
//   three architectural styles, and the 35-foot height cap: KLAS/8 News Now
//   only — attributed to that outlet specifically, not stated as multi-source
//   confirmed.
// - The October Clark County Commission hearing: the RJ's own reporting
//   (via search synthesis of that piece) says the Commission is "scheduled to
//   consider the plans next month" from a late-September publish date; only
//   Hoodline's Sept. 2026 piece names the specific date, Oct. 21 — so the
//   month is treated as corroborated and the specific date is attributed to
//   Hoodline alone, not asserted as independently confirmed.
// - Property history (1966 initial purchase, expansion to 39.5 acres by
//   1969-72, the 1978 mansion, the Arabian horses and car collection, the
//   2010 sale to CSD LLC, the 2013 departure, the 2015-2018 public-museum run,
//   and the 2019 sale to Smoketree LLC for $5.56M): Wikipedia's "Casa de
//   Shenandoah" entry, used only for uncontroversial background, not for
//   anything about the current 2026 redevelopment proposal.
// - Blue Heron's own identity and typical price range ($1.5M+ custom estates,
//   other Las Vegas Valley communities in Henderson, Lake Las Vegas, Southern
//   Highlands, and Ascaya): the builder's own site, blueheron.com. No price
//   point for THIS development has been announced anywhere, and none is
//   asserted.
// - Jurisdiction (Paradise, an unincorporated Clark County township, not the
//   City of Las Vegas or Henderson): Wikipedia's "Paradise, Nevada" entry,
//   cross-checked against Clark County's own township framing already used
//   and sourced on LVINIT's Southwest Las Vegas guide.
// - Deliberately NOT asserted: any home price, any confirmed sale timeline,
//   any HOA/amenity detail beyond the lake and walls, and any outcome of the
//   Commission hearing — nothing has been approved yet.
//
// IMAGERY — Updated 2026-09-28: Mikey supplied two real photographs of the
// property directly. Both are verified third-party Wikimedia Commons files,
// NOT Mikey's own photography, so neither is credited to him:
//   - Hero: aerial view of the estate taken from a departing airplane,
//     photographed by Ken Lund, May 25, 2015. Verified via the photo's own
//     Wikipedia caption ("Aerial view of Casa de Shenandoah in May 2015") and
//     the Wikimedia Commons file page. Licensed CC BY-SA 2.0 — credited
//     in a muted on-image line via StoryHero's `imageCredit`.
//   - Inline (car collection): photographed by Bob n Renee, Aug. 2, 2016,
//     verified via its Wikimedia Commons file page. Licensed CC BY 2.0.
// A third supplied photo (a ground-level fountain/facade shot) was NOT used:
// its actual source turned out to be landlopers.com, travel writer Matt
// Long's personal blog, with no Creative Commons license or reuse permission
// stated anywhere on the site — i.e. conventionally copyrighted, all rights
// reserved. It was not added to this article or the repository.
// Originally carried a generated LVINIT editorial cover and a photoless
// StoryHero (node scripts/generate-guide-cover.mjs ...); both are superseded
// by the real photography above and have been removed.
// ---------------------------------------------------------------------------

const PATH = "/guides/wayne-newton-casa-de-shenandoah-redevelopment";

const meta: StoryMeta = {
  title: "Wayne Newton's Estate Could Become 77 Las Vegas Homes | LVINIT",
  headline:
    "Wayne Newton's Casa de Shenandoah Could Become a 77-Home Neighborhood",
  description:
    "A Las Vegas homebuilder wants to turn Wayne Newton's 39.5-acre former estate into 77 single-family lots around its existing lake. What's actually confirmed, what isn't yet, and where the property really sits.",
  path: PATH,
  image: "/images/hero/casa-de-shenandoah-estate-aerial-hero.webp",
  imageWidth: 2200,
  imageHeight: 1650,
  imageAlt:
    "Aerial view from a departing airplane of Wayne Newton's Casa de Shenandoah estate, showing the mansion, ponds, and grounds surrounded by the Las Vegas Valley, May 2015",
  datePublished: "2026-09-27",
  dateModified: "2026-09-28",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Casa de Shenandoah", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "39.5 acres",
    label: "The site",
    note: "Wayne Newton's former estate, southwest corner of Sunset and Pecos roads",
  },
  {
    value: "77 lots",
    label: "Proposed",
    note: "Single-family homes, one- and two-story, each over 2,000 sq ft",
  },
  {
    value: "~20,500 sq ft",
    label: "Average lot",
    note: "Roughly half an acre; lots range from 16,500 to 30,000 sq ft",
  },
  {
    value: "Not approved",
    label: "Status",
    note: "A Clark County Commission hearing is expected in October 2026",
  },
];

function SnapshotPanel() {
  return (
    <section
      id="by-the-numbers"
      aria-label="Casa de Shenandoah redevelopment snapshot"
      className="scroll-mt-24"
    >
      <div className="mx-auto max-w-[900px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
          The proposal, by the numbers
        </h2>
        <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
          Nothing here is built or approved yet. This is what&rsquo;s actually
          on paper right now &mdash; see the sources at the end of this
          article for the full reporting.
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
              <p className="mt-2 text-caption text-lvinit-warmgray">
                {s.note}
              </p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default function CasaDeShenandoahRedevelopmentPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Local Feature",
        headline:
          "Wayne Newton's Casa de Shenandoah Could Become a 77-Home Neighborhood",
        subheadline:
          "A Las Vegas luxury homebuilder has filed plans to turn the entertainer's 39.5-acre former estate into 77 single-family lots around the property's existing lake. Nothing is approved yet, and the property isn't in Las Vegas or Henderson at all \u2014 here's what's actually going on.",
        image: "/images/hero/casa-de-shenandoah-estate-aerial-hero.webp",
        imageAlt:
          "Aerial view from a departing airplane of Wayne Newton's Casa de Shenandoah estate, showing the mansion, ponds, and grounds surrounded by the Las Vegas Valley, May 2015",
        imageCredit: "Photo: Ken Lund / Wikimedia Commons / CC BY-SA 2.0",
        ctas: [
          { label: "See the proposal", href: "#by-the-numbers", variant: "primary" },
        ],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "Casa de Shenandoah sits in a part of the valley LVINIT hasn't covered directly yet. Here's how it connects to what we have covered.",
        stories: [
          {
            name: "Living in Henderson",
            href: "/neighborhoods/henderson",
            category: "Area Guide",
            dek: "The closest full LVINIT pillar guide to this site \u2014 a genuinely different jurisdiction, a few minutes away.",
          },
          {
            name: "Henderson vs. Southwest Las Vegas: Where Should You Actually Move?",
            href: "/guides/henderson-vs-southwest-las-vegas",
            category: "Comparisons",
            dek: "More on why \"which government actually runs this address\" is a real Las Vegas Valley question, not a technicality.",
          },
          {
            name: "Las Vegas Home Prices, August 2026",
            href: "/guides/las-vegas-home-prices-august-2026",
            category: "Market Watch",
            dek: "The valley-wide resale median this proposal's eventual homes would be compared against.",
          },
        ],
      }}
      ctas={{
        heading: "Curious what else is actually for sale nearby?",
        body:
          "This particular property is years from being buyable, if it happens at all. If you want something real right now \u2014 in Henderson, the southwest valley, or anywhere else in the Las Vegas Valley \u2014 tell me what you're looking for and I'll give you the honest read.",
      }}
    >
      <StoryLede
        kicker="Local Feature"
        lead="For decades, Wayne Newton's Casa de Shenandoah was one of the most recognizable private addresses in Las Vegas: horses, vintage cars, a private lake, and a wall most people only ever saw from the road. Now a homebuilder wants to turn the whole 39.5-acre property into a 77-lot subdivision. Nobody has broken ground, and the county hasn't approved anything &mdash; but the filing itself is worth understanding, because it says something about how hard even a famous property can be to sell in one piece."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Here&rsquo;s what&rsquo;s actually been proposed, what history got
          the property here, and one honest correction about where this
          address really sits.
        </p>
      </StoryLede>

      <StorySection heading="What's actually been proposed">
        <p className="text-body-lg text-lvinit-warmgray">
          Las Vegas homebuilder Blue Heron has filed plans with Clark County
          to develop the roughly 39.5-acre site &mdash; at the southwest
          corner of Sunset and Pecos roads &mdash; into 77 single-family
          lots, according to the Las Vegas Review-Journal. The homes would be
          one- and two-story, each more than 2,000 square feet, built in
          three architectural styles with a 35-foot height cap, according to
          KLAS/8 News Now&rsquo;s review of the filing. Lots would run from
          16,500 to 30,000 square feet, averaging around 20,500 square feet
          &mdash; roughly half an acre each, considerably larger than most
          new-construction lots going up elsewhere in the valley right now.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Two things from the existing property would stay. The estate&rsquo;s
          man-made lake, refilled by a private well, would remain as the
          centerpiece of roughly 201,000 square feet of common open space,
          and the perimeter walls &mdash; in place for decades &mdash; are
          described in the filing as intended to stay put. Streets inside the
          new subdivision would be private, 40 feet wide.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Blue Heron builds mostly custom and semi-custom homes elsewhere in
          the valley, including in Henderson, Lake Las Vegas, Southern
          Highlands, and Ascaya, with typical custom-estate pricing starting
          around $1.5 million per the builder&rsquo;s own site. No price point
          has been announced for this specific project, and we&rsquo;re not
          going to guess one. This is a land-use filing, not a sales launch.
        </p>
      </StorySection>

      <SnapshotPanel />

      <StorySection heading="Nothing is approved. That part matters.">
        <p className="text-body-lg text-lvinit-warmgray">
          This is a proposal, not a done deal. The Review-Journal reports the
          Clark County Commission is scheduled to take up the plans next
          month; Hoodline&rsquo;s reporting names a specific hearing date,
          October 21, 2026, though we could only confirm that exact date in
          that one outlet, so treat it as reported-but-not-independently-
          verified rather than locked in. Commission hearings can result in
          approval, conditions, delay, or denial. If you&rsquo;re reading this
          months from now, check with Clark County directly before assuming
          anything below is still current.
        </p>
      </StorySection>

      <StorySection muted heading="How a famous property ended up here">
        <p className="text-body-lg text-lvinit-warmgray">
          Wayne Newton bought the first five acres of what became Casa de
          Shenandoah in 1966 and kept expanding it, reaching the full 39.5
          acres by the early 1970s. The main mansion, completed in 1978, sat
          alongside a private aviary, a heliport, roughly 70 Arabian horses
          at the property&rsquo;s peak, and a car collection that included a
          1929 Duesenberg once owned by Howard Hughes. It was, for most of
          Newton&rsquo;s career, a working ranch and private home rather than
          a tourist stop.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That changed in 2010, when an investment group bought the estate
          for $18.7 million with Newton retaining a minority stake, planning
          to turn it into a public attraction. The project ran into legal
          disputes over the property&rsquo;s management, and Newton and his
          family moved out in 2013. Casa de Shenandoah reopened as a
          for-profit museum in September 2015, offering tours of the house,
          the car collection, and the animals &mdash; then closed again in
          April 2018, with Newton withdrawing its operating permits later that
          year.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          A new ownership group, Smoketree LLC, bought the property in July
          2019 for about $5.56 million &mdash; a steep discount from the 2010
          sale price. It has since been listed for sale as a single estate
          more than once, at prices reported as high as roughly $31 million,
          without finding a buyer for the whole property. A 77-lot
          subdivision is, in effect, a different answer to the same problem:
          if nobody will buy a 39.5-acre celebrity compound in one piece,
          selling it as 77 ordinary building lots might actually work.
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/casa-de-shenandoah-car-collection.webp",
            alt: "Vintage Rolls-Royce and Bentley limousines on display along a red carpet in Wayne Newton's car collection at Casa de Shenandoah",
            caption:
              "Newton's car collection on display during the property's 2015–2018 run as a public museum. Photo: Bob n Renee / Wikimedia Commons / CC BY 2.0",
          },
        ]}
      />

      <StorySection heading="One honest correction: this isn't Las Vegas, and it isn't Henderson">
        <p className="text-body-lg text-lvinit-warmgray">
          Here&rsquo;s the part worth knowing if a property like this
          eventually interests you. Sunset and Pecos roads sit in{" "}
          <span className="text-lvinit-black">Paradise</span>, an
          unincorporated Clark County township &mdash; not the City of Las
          Vegas, and not the City of Henderson, even though it&rsquo;s a
          short drive from both. Paradise is the same unincorporated township
          that holds the Las Vegas Strip, Harry Reid International Airport,
          and UNLV. A mailing address here typically says &ldquo;Las
          Vegas,&rdquo; but the government that actually issues permits,
          zones the land, and heard this very filing is Clark County, not any
          city council.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          This is the same lesson LVINIT&rsquo;s Southwest Las Vegas guide
          makes about Enterprise and Spring Valley: a lot of the valley that
          feels like &ldquo;Las Vegas&rdquo; on a map isn&rsquo;t governed by
          the City of Las Vegas at all. It&rsquo;s worth confirming for any
          property you&rsquo;re seriously considering, not just this one.
        </p>
      </StorySection>

      <StorySection heading="Who this might actually matter to">
        <p className="text-body-lg text-lvinit-warmgray">
          If this gets approved and eventually built, it would be a rare
          thing in the built-out core of the valley: 77 large, half-acre-
          average lots inside existing decades-old perimeter walls, wrapped
          around a private lake, minutes from the Strip and the airport
          rather than out on the growth edge. That&rsquo;s a genuinely
          different product than most of what&rsquo;s being built in North
          Las Vegas or the far southwest right now.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It&rsquo;s not for anyone looking for a bargain, a walkable
          Main Street, or a finished master-planned community with amenities
          beyond a lake and a wall &mdash; none of that is what&rsquo;s on the
          table. And right now, honestly, it&rsquo;s not for anyone who wants
          certainty: no price has been set, no lots have been graded, and the
          county hasn&rsquo;t voted. We&rsquo;ll update this piece if and when
          that changes.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">
              Las Vegas Review-Journal
            </span>{" "}
            (Eli Segall), &ldquo;Wayne Newton&rsquo;s former Vegas compound
            could become new luxury housing development,&rdquo; Sept. 22-23,
            2026 &mdash; primary source for the developer, site, lot count,
            home size, and the lake/wall preservation plan.{" "}
            <a
              href="https://www.reviewjournal.com/business/housing/wayne-newtons-former-compound-penciled-for-housing-development-3889589/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              reviewjournal.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KLAS / 8 News Now</span>{" "}
            (Nicholas Sommer), &ldquo;Wayne Newton&rsquo;s former Las Vegas
            estate could become luxury community,&rdquo; Sept. 22, 2026 &mdash;
            source for the lot-size range, private street width, common
            open-space figure, architectural-style count, and height cap.{" "}
            <a
              href="https://www.8newsnow.com/news/local-news/wayne-newtons-former-las-vegas-estate-could-become-luxury-community/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              8newsnow.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Hoodline</span>, &ldquo;Wayne
            Newton&rsquo;s Former Las Vegas Estate Could Become 77-Home
            Neighborhood,&rdquo; Sept. 2026 &mdash; the only source found this
            run naming the specific Oct. 21 Clark County Commission hearing
            date.{" "}
            <a
              href="https://hoodline.com/2026/09/wayne-newton-s-former-las-vegas-estate-could-become-77-home-neighborhood/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              hoodline.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Wikipedia</span>,
            &ldquo;Casa de Shenandoah,&rdquo; consulted for uncontroversial
            background only: the 1966 purchase, the property&rsquo;s
            expansion and 1978 mansion, the 2010 sale and 2013 departure, the
            2015-2018 public-museum run, and the 2019 sale to Smoketree LLC.
            Not used for any fact about the 2026 redevelopment proposal.{" "}
            <a
              href="https://en.wikipedia.org/wiki/Casa_de_Shenandoah"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              en.wikipedia.org
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Wikipedia</span>,
            &ldquo;Paradise, Nevada,&rdquo; source for the township&rsquo;s
            unincorporated status and its role as the home of the Strip,
            Harry Reid International Airport, and UNLV.{" "}
            <a
              href="https://en.wikipedia.org/wiki/Paradise,_Nevada"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              en.wikipedia.org
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Blue Heron</span>, own site
            &mdash; source for the builder&rsquo;s identity, other Las Vegas
            Valley communities, and typical custom-estate price range. No
            price for this specific project is published anywhere and none is
            asserted here.{" "}
            <a
              href="https://blueheron.com/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              blueheron.com
            </a>
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          This is a land-use proposal, not an approved or built project.
          Details &mdash; including whether it&rsquo;s approved at all &mdash;
          can change after the county hearing referenced above. Nothing in
          this article is legal, investment, or brokerage advice.
        </p>
      </StorySection>

      <StorySection heading="About this coverage">
        <p className="text-body text-lvinit-warmgray">
          LVINIT Editorial · The Scofield Group · Nevada License S.0175577.
          Equal Housing Opportunity.
        </p>
      </StorySection>
    </StoryPage>
  );
}
