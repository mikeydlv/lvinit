import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryPullQuote,
  StoryGallery,
  StoryVideo,
} from "@/components/story";

// ---------------------------------------------------------------------------
// COMPARISON GUIDE — Summerlin vs. Henderson vs. Southwest Las Vegas.
//
// The three-way piece the cluster was missing. LVINIT already had two of the
// three pairings (/guides/summerlin-vs-henderson and
// /guides/henderson-vs-southwest-las-vegas); this is the page the video is
// actually about, and it is the one that puts the structural distinction
// (master plan vs. city vs. informal area name) up front.
//
// FACT DISCIPLINE (read before editing):
// - Structural and place-level claims are carried forward from the three live
//   pillar guides and their fact-check logs: lib/areas/summerlin.tsx (verified
//   2026-08-20), lib/areas/henderson.tsx (2026-08-27) and
//   lib/areas/southwest-las-vegas.tsx (2026-08-20). Nothing new is asserted
//   about any of the three areas. Re-check there, not here, before changing a
//   figure.
// - NO median price is published for Summerlin, Henderson or Southwest as
//   submarkets, and none should ever be added. Summerlin and Henderson span too
//   wide a range for one number to mean anything, and "Southwest Las Vegas" has
//   no defensible boundary to calculate one against. The only market figures on
//   this page are valley-wide LVR numbers, dated in the copy.
// - NO commute-minute claims. All three pillar guides refuse to publish one,
//   for the same reason, and this page follows that.
// - The neighborhoods[] entries in lib/content.ts are explicitly flagged
//   PLACEHOLDER (median price, walk score, commute, school rating). They are
//   illustrative scaffolding and must never be cited here as fact.
//
// FRESH RESEARCH — verified 2026-09-10 (this page's only new claims):
//  · LVR AUGUST 2026 REPORT. Median existing
//    single-family price $475,000, down 1.0% YoY, down from the $490,000 record
//    set in May and June 2026. Condo/townhome median $299,900, up 0.6% YoY.
//    Single-family homes listed without offers 7,590, up 5.3% YoY.
//    Condos/townhomes listed without offers 2,714, up 6.0% YoY. Total sales
//    2,252. 74.8% of single-family homes sold within 60 days, down from 77.5%.
//    Supply over 4.5 months.
//    Sources: Nevada Business Magazine's carry of the LVR release, and Fox5
//    Vegas, both 9 September 2026. Cross-checked; the figures agree.
//    -> DATED IN THE COPY on purpose ("the August 2026 Las Vegas REALTORS
//       report"), so a fact-decay pass can find and update it.
//    -> The report's RELEASE DAY is deliberately not asserted in the copy.
//       Fox5's story (9 Sept) says "released Wednesday", while the registry
//       note on /guides/las-vegas-home-prices-august-2026 puts the Nevada
//       Business Magazine carry at 8 Sept. Those may both be right, but the
//       two LVINIT pages should not state different days for one release, so
//       this one names the report and not the date. If the exact release day
//       is ever pinned down, set it on both pages at once.
//  · SUMMERLIN 2026 MASTER ASSESSMENTS. Monthly: $74 Summerlin North, $76
//    Summerlin South, $69 Summerlin West, effective 1 January 2026, each
//    already including the Summerlin Council's $37 share.
//    Source: Las Vegas Review-Journal, Kevin J. Barr, 8 October 2025.
//    -> These are MASTER association figures only. They are NOT a total, and
//       they are NOT what any given Summerlin home pays: a neighborhood
//       sub-association sits on top of them. The copy says so explicitly and
//       must keep saying so.
//  · CLARK COUNTY ON SPECIAL ASSESSMENTS. The County Treasurer states that
//    "special assessments are different than real property taxes, and are
//    billed separately", and that an assessment is a lien on the property until
//    it is paid off. No SID or LID dollar amount is asserted anywhere on this
//    page, because none is knowable without a parcel.
//
// HERO — deliberately the photoless editorial treatment (StoryHero with no
// `image`), at Mikey's direction. Every strong frame in the library belongs to
// one of the three areas, and leading with any one of them made the page read
// as an article about that area. The three-up StoryGallery immediately below
// the lede is the opening visual instead, with all three areas labeled and
// given equal weight. `meta.image` is Mikey's own video title card, which is
// itself a three-area comparison, so the social/OG card stays balanced too.
//
// VIDEO — youtube.com/watch?v=ZAU9hPQ_1Hk, embedded through the existing
// click-to-play StoryVideoFacade (local poster, no YouTube request until the
// visitor clicks). VideoObject JSON-LD IS emitted here: the sibling guide had
// to omit it because the upload date could not be verified, but Mikey has since
// supplied the real one (2 September 2026, 6:45pm Pacific). Title confirmed via
// YouTube oEmbed. Duration carried from the videos[] registry in lib/content.ts.
//
// FAIR HOUSING: no school ratings, no crime or safety claims, no demographic
// characterization, no "great for families" steering. Fit is expressed through
// housing stock, structure and location only. Schools are handled by pointing
// readers at independent research rather than making a qualitative claim.
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title: "Summerlin vs Henderson vs Southwest Las Vegas | LVINIT",
  headline: "Summerlin vs Henderson vs Southwest Las Vegas",
  description:
    "Comparing Summerlin, Henderson and Southwest Las Vegas? See how they differ on home value, location, new construction, parks, HOA costs and day-to-day lifestyle.",
  path: "/guides/summerlin-vs-henderson-vs-southwest-las-vegas",
  image: "/images/video-summerlin-henderson-southwest-where-would-you-live.webp",
  imageWidth: 1280,
  imageHeight: 720,
  imageAlt:
    "Title card for the LVINIT video comparing Summerlin, Henderson and Southwest Las Vegas, with one photo from each of the three areas.",
  datePublished: "2026-09-10",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    {
      name: "Summerlin vs Henderson vs Southwest Las Vegas",
      path: "/guides/summerlin-vs-henderson-vs-southwest-las-vegas",
    },
  ],
  video: {
    name: "Summerlin vs Henderson vs Southwest Las Vegas: Which Area Fits You Best?",
    description:
      "Mikey Del Rosario compares Summerlin, Henderson and Southwest Las Vegas on housing, location, new construction, established character, parks and the true cost of owning in each.",
    thumbnailUrl:
      "/images/video-summerlin-henderson-southwest-where-would-you-live.webp",
    uploadDate: "2026-09-02T18:45:00-07:00",
    // 14:34 is what YouTube's own player reports for this video, and the live
    // runtime is the source of truth. The videos[] registry in lib/content.ts
    // read "14:33" when this page shipped; it was corrected to match on
    // 2026-09-10. Keep the two in step.
    duration: "PT14M34S",
    embedUrl: "https://www.youtube.com/embed/ZAU9hPQ_1Hk",
    contentUrl: "https://www.youtube.com/watch?v=ZAU9hPQ_1Hk",
  },
};

export const metadata: Metadata = buildStoryMetadata(meta);

const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

/** The one distinction the whole page hangs off. Three different kinds of thing. */
const WHAT_THEY_ACTUALLY_ARE = [
  {
    area: "Summerlin",
    kind: "A master-planned community",
    body: "One plan, one master developer, one set of design standards, carried out village by village across about thirty-five square miles on the western edge of the valley. It has no mayor and no city limit.",
    href: "/neighborhoods/summerlin",
  },
  {
    area: "Henderson",
    kind: "An incorporated city",
    body: "Nevada's second largest, incorporated in 1953, with its own mayor and council, its own police and fire, its own parks department and its own zoning, across nearly 118.5 square miles. It contains master plans. It is not one.",
    href: "/neighborhoods/henderson",
  },
  {
    area: "Southwest Las Vegas",
    kind: "A name people use",
    body: "No city limit, no county boundary, no census place by that name. Mostly unincorporated Clark County, largely the towns of Enterprise and Spring Valley, filled in by many separate builders rather than planned as one thing.",
    href: "/neighborhoods/southwest-las-vegas",
  },
];

/** Starting points, not recommendations. The copy above and below says so. */
const BUYER_STARTING_POINTS = [
  {
    want: "A newer home, parks and trails out the door, restaurants you can get to without making a project of it, and no particular need for a big yard.",
    lean: "Start in Summerlin",
    why: "This is the trade the master plan is built around. You are likely giving up lot size and some square footage to get the surroundings.",
  },
  {
    want: "An older home with some character, mature landscaping, and streets that have had decades to grow in.",
    lean: "Start in the established parts of Henderson",
    why: "Green Valley was Southern Nevada's first master-planned community, with a 1978 grand opening, and it reads that way on the ground. Water Street is older still.",
  },
  {
    want: "Four bedrooms, a usable yard, quick freeway access, and a budget you are being honest about.",
    lean: "Start in the Southwest",
    why: "Newer housing, a lot of it, hung off the beltway. This is where the same money most often turns into more house.",
  },
  {
    want: "Elevation, a long view, and a budget that can carry a custom hillside address.",
    lean: "That is a different search entirely",
    why: "It usually means luxury Summerlin, or MacDonald Highlands and Ascaya on the Henderson side. Worth naming early, because it narrows the map fast.",
  },
];

/** The stack the page argues you should compare, instead of list price alone. */
const OWNERSHIP_STACK = [
  {
    line: "List price",
    note: "The only number most people compare, and the only one that means the same thing everywhere.",
  },
  {
    line: "Master or community assessment",
    note: "Where one applies. Summerlin has these. Many Southwest and Henderson neighborhoods do not.",
  },
  {
    line: "Neighborhood HOA dues",
    note: "The sub-association for your specific street or gate. Separate from any master assessment, and it varies enormously.",
  },
  {
    line: "SID or LID balance",
    note: "Where one is attached to the parcel. Common on newer construction. Billed separately from property taxes.",
  },
  {
    line: "Property taxes on that parcel",
    note: "Including which tax cap the property is actually carrying once it changes hands.",
  },
  {
    line: "Property-specific costs",
    note: "Lot premium, upgrades, a pool, or an age that is about to need a roof and two air conditioners.",
  },
];

const DECIDING_QUESTIONS = [
  "How much house do you actually want, and what are you willing to give up to get it?",
  "How important is Red Rock and everyday outdoor access, honestly?",
  "How often do you really need the airport?",
  "Do you want new construction, or do you want a finished neighborhood?",
  "Do you care about mature landscaping and streets that have grown in?",
  "Do you want a built-in commercial center you can reach in five minutes?",
  "How much driving are you genuinely comfortable with on a normal Tuesday?",
  "How much do HOA dues, assessments and total ownership cost matter to your monthly number?",
];

export default function SummerlinVsHendersonVsSouthwestPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Comparisons",
        headline: "Summerlin vs Henderson vs Southwest Las Vegas",
        subheadline:
          "Three of the most compared parts of the valley, and three very different ways to live here.",
        backLink: { label: "LVINIT", href: "/" },
      }}
      relatedStories={{
        heading: "Read these next",
        intro:
          "The full guide to each area, the two other comparisons in this cluster, and the pieces that go deeper on price and on what a Las Vegas home actually costs to own.",
        stories: [
          {
            name: "Summerlin",
            href: "/neighborhoods/summerlin",
            category: "Area guide",
            dek: "The villages one by one, what Summerlin West is actually doing, the parks and trails, and the tradeoffs.",
          },
          {
            name: "Henderson",
            href: "/neighborhoods/henderson",
            category: "Area guide",
            dek: "The real city boundary, its five very different regions, and what is being built right now.",
          },
          {
            name: "Southwest Las Vegas",
            href: "/neighborhoods/southwest-las-vegas",
            category: "Area guide",
            dek: "No boundary, no city hall, and the valley's fastest-growing stretch of county.",
          },
          {
            name: "Summerlin vs. Henderson",
            href: "/guides/summerlin-vs-henderson",
            category: "Comparison",
            dek: "The head-to-head version: one master plan against a whole city, without the third option in the room.",
          },
          {
            name: "Henderson vs. Southwest Las Vegas",
            href: "/guides/henderson-vs-southwest-las-vegas",
            category: "Comparison",
            dek: "The other pairing. A city with a government behind it against a place that is still being written.",
          },
          {
            name: "What $500K Buys in Las Vegas",
            href: "/guides/what-500k-buys-in-las-vegas",
            category: "Buyer guide",
            dek: "Three real home tours near the same budget. The most concrete look at what these tradeoffs actually cost.",
          },
        ],
      }}
      ctas={{
        heading: "Not sure which side of the valley fits you?",
        body:
          "If you are moving to Las Vegas and narrowing down Summerlin, Henderson, Southwest or somewhere else entirely, start with the area guides above. Or reach out if you want help comparing specific neighborhoods and specific homes.",
        footnote: (
          <>
            Already down to two? There are head-to-head versions for{" "}
            <Link
              href="/guides/summerlin-vs-henderson"
              className="text-lvinit-blue underline underline-offset-4"
            >
              Summerlin vs. Henderson
            </Link>{" "}
            and{" "}
            <Link
              href="/guides/henderson-vs-southwest-las-vegas"
              className="text-lvinit-blue underline underline-offset-4"
            >
              Henderson vs. Southwest
            </Link>
            .
          </>
        ),
      }}
    >
      <StoryLede
        kicker="Comparisons"
        lead="These three come up in almost every relocation conversation I have, usually in the same breath, usually as if they are three versions of the same thing. They are not. Before you compare a single listing across them, you need to know that you are comparing three completely different kinds of thing, and that one difference quietly decides almost everything else on this page."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          I am not going to hand you a winner. Anyone who does that for three
          places this different is selling you something. What I can do is lay
          out the real differences and let you match them to how you actually
          want to live. The long version of each one lives in the{" "}
          <Link href="/neighborhoods/summerlin" className={linkCls}>
            Summerlin guide
          </Link>
          , the{" "}
          <Link href="/neighborhoods/henderson" className={linkCls}>
            Henderson guide
          </Link>{" "}
          and the{" "}
          <Link href="/neighborhoods/southwest-las-vegas" className={linkCls}>
            Southwest Las Vegas guide
          </Link>
          .
        </p>
      </StoryLede>

      {/* ---------------------------------------------------------------- */}
      {/* THE BIGGEST DIFFERENCE                                            */}
      {/* ---------------------------------------------------------------- */}

      <StorySection
        id="the-difference"
        heading="Start with what each one actually is"
      >
        <p className="text-body-lg text-lvinit-warmgray">
          This is the part almost every comparison skips, and it is the reason
          most of them are useless. These are not three neighborhoods. They are
          not even three of the same category of thing.
        </p>
      </StorySection>

      <Container className="pb-8">
        <div className="mx-auto max-w-[1100px]">
          <ul className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
            {WHAT_THEY_ACTUALLY_ARE.map((item) => (
              <li key={item.area} className="border-t-2 border-lvinit-blue pt-5">
                <h3 className="font-display text-subhead font-bold text-lvinit-black">
                  {item.area}
                </h3>
                <p className="mt-1 text-caption uppercase tracking-wide text-lvinit-warmgray">
                  {item.kind}
                </p>
                <p className="mt-3 text-body text-lvinit-warmgray">
                  {item.body}
                </p>
                <Link href={item.href} className={`mt-3 inline-block text-body ${linkCls}`}>
                  Full guide
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <StorySection>
        <p className="text-body-lg text-lvinit-warmgray">
          Line those up and the problem with the usual comparison is obvious.
          Asking whether Summerlin beats Henderson is close to asking whether a
          single planned development beats an entire city. Asking whether
          Henderson beats the Southwest at least compares two large, varied
          places, but only one of them has a government you can call. And
          asking anything about &ldquo;the Southwest&rdquo; means asking about a
          term two people can use to mean two different chunks of the valley,
          because there is nothing to correct either of them against.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That matters practically, not just semantically. Summerlin can promise
          consistency because one plan controls it. Henderson can offer range
          because it has had decades and many different developers. The
          Southwest can move fast and vary street to street because nobody is
          coordinating it. Every difference further down this page traces back
          to those three sentences.
        </p>
      </StorySection>

      <StoryGallery
        columns={3}
        images={[
          {
            src: "/images/features/summerlin-la-madre-peaks-new-homes-aerial-drone.webp",
            alt: "Aerial view of new homes at La Madre Peaks on the western edge of Summerlin, a wide arterial road running past graded desert toward the mountains.",
            label: "Summerlin",
            caption:
              "New villages at La Madre Peaks, on the western edge, where the master plan is still being built out.",
          },
          {
            src: "/images/features/henderson-inspirada-rooftops-aerial-drone.webp",
            alt: "Aerial view over the rooftops of Inspirada in Henderson, streets and homes running toward the mountains in the distance.",
            label: "Henderson",
            caption:
              "Inspirada, one of many communities inside the city limits. Henderson is far too broad to treat as one place.",
          },
          {
            src: "/images/features/southwest-las-vegas-exploration-peak-park-aerial-drone.webp",
            alt: "Aerial view of Exploration Peak Park in Mountain's Edge, southwest Las Vegas, green parkland beside an arterial road with homes and open desert beyond.",
            label: "Southwest Las Vegas",
            caption:
              "Exploration Peak Park in Mountain's Edge, one of several separate master plans inside an area with no boundary.",
          },
        ]}
      />

      <StoryVideo
        id="watch"
        heading="The video version"
        intro="I walked through this same comparison on camera, including the parts that are easier to show than to describe."
        youtubeId="ZAU9hPQ_1Hk"
        title="Summerlin vs Henderson vs Southwest Las Vegas: Which Area Fits You Best?"
        poster="/images/video-summerlin-henderson-southwest-where-would-you-live.webp"
      />

      {/* ---------------------------------------------------------------- */}
      {/* 1. MONEY                                                          */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="money" heading="Where does your money go further?">
        <p className="text-body-lg text-lvinit-warmgray">
          I am not going to publish a median price for any of these three, and
          you should be suspicious of pages that do. Summerlin and Henderson
          both span too wide a range for one number to describe, and the
          Southwest has no agreed boundary to calculate one against in the first
          place. What I can give you is the shape of the tradeoff, which is more
          useful anyway.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Summerlin usually asks you to compromise somewhere first.
          </span>{" "}
          At a given budget something tends to give: square footage, lot size,
          the age of the home, or how far west and north you are willing to go
          to find it. That is not a knock on the place. It is what happens when
          demand concentrates on one master plan with a fixed footprint.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The honest counterpoint is that a real part of what you are buying in
          Summerlin sits outside the four walls. The master plan itself, the
          trail system built into the arroyos between villages, more than 300
          parks, Red Rock along the western edge, Downtown Summerlin for errands
          and dinner, and decades of community infrastructure that already
          exists rather than being promised. Whether that is worth the
          compromise is a personal question, but it is a real thing you are
          paying for, not marketing.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Henderson gives you more directions to go.
          </span>{" "}
          Because it is a city rather than a product, one budget can be spent
          several genuinely different ways inside it: established resale with
          grown-in landscaping, brand-new construction in a current master plan,
          a hillside address, a lake community, or an older downtown. You are
          not choosing a price point so much as choosing which Henderson you are
          shopping in, and that choice moves what your money does far more than
          the city line does.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            The Southwest is where the same money most often turns into more
            house.
          </span>{" "}
          Newer construction, more square footage, sometimes a bigger lot. The
          catch is what comes with it, which the next few sections are about.
          And whichever way you lean, the real comparison is not list price
          against list price. It is the whole ownership picture, further down
          this page.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* 2. CONVENIENCE                                                    */}
      {/* ---------------------------------------------------------------- */}

      <StorySection
        id="convenience"
        heading="Which area is actually more convenient?"
      >
        <p className="text-body-lg text-lvinit-warmgray">
          Convenient to what? That is not me dodging. All three of these places
          are large enough that convenience only means something once you say
          where you actually spend your time. None of the three LVINIT area
          guides publishes a commute figure and this page will not either.
          Henderson runs about seventeen and a half miles east to west, so a
          Green Valley address and a Lake Las Vegas address are not the same
          trip. Summerlin is thirty-five square miles. The Southwest has no
          edges at all. Any page handing you a single number for one of these is
          guessing.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Summerlin works if your life points west.
          </span>{" "}
          Red Rock, Downtown Summerlin, the west-side office and medical
          corridor, the beltway running down the western edge. If your week
          mostly happens on that side of the valley it is genuinely easy. If
          your office is off the Strip or your family is in Henderson, drive it
          at your actual hour before the mountain views talk you into it.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Henderson convenience varies more than anywhere else in this
            comparison.
          </span>{" "}
          Green Valley and the communities along the 215 are geographically a
          different proposition from Lake Las Vegas, which sits well east of
          almost everything. Two people can both say they live in Henderson and
          have completely unrelated daily drives. Pick the corner first, then
          judge the commute.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            The Southwest&rsquo;s position on the beltway is its strongest
            practical argument.
          </span>{" "}
          The whole area is oriented to the 215, which is also the road running
          north toward Summerlin and east toward the airport. If your routine is
          spread across several parts of the valley rather than anchored in one,
          that matters more than any single drive time. It is the most common
          reason I see people who started out looking at Summerlin buy out here
          instead.
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/southwest-las-vegas-215-beltway-aerial-drone.webp",
            alt: "Aerial view along the 215 beltway through southwest Las Vegas, offices and rooftops on both sides of the freeway and the Strip skyline on the horizon.",
            caption:
              "The 215 through the Southwest, with the Strip on the horizon. The beltway is the reason this part of the valley works the way it does.",
          },
        ]}
      />

      {/* ---------------------------------------------------------------- */}
      {/* 3. NEW CONSTRUCTION                                               */}
      {/* ---------------------------------------------------------------- */}

      <StorySection
        id="new-construction"
        heading="Where can you still buy new construction?"
      >
        <p className="text-body-lg text-lvinit-warmgray">
          All three, and that surprises people. New construction is not a
          Southwest-only story. The difference is in how it arrives, not whether
          it exists.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Summerlin keeps expanding westward.
          </span>{" "}
          Summerlin West is where the current villages are going in, and the
          master developer opens new neighborhoods there on a rolling basis. You
          are buying inside an existing plan, which is the point: the standards,
          the trail connections and the eventual parks are decided before your
          street exists.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Henderson has its own growth areas.
          </span>{" "}
          Inspirada, Cadence and the broader West Henderson planning area are
          where the newer housing is concentrated, and West Henderson in
          particular has an employment corridor forming around it that the other
          two have no real equivalent of.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            The Southwest builds by infill.
          </span>{" "}
          Instead of one plan advancing in one direction, many builders fill in
          many separate parcels, which is why housing age can change from one
          street to the next. It is also why the Southwest often has the most
          genuinely new homes listed at any given moment.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Here is the distinction that actually costs people money.{" "}
          <span className="text-lvinit-black">
            A new home is not the same thing as a finished neighborhood.
          </span>{" "}
          Before you sign on a new build in any of these three, get straight
          answers on what is complete and what is not. Are the surrounding
          arterials built or still dirt? Is the retail open, under construction,
          approved, or only drawn on a plan? Are the parks in your phase funded
          and scheduled, or in a later phase with no date? What is going on the
          vacant parcel behind you, and who decides? Those answers are the
          difference between moving into a neighborhood and moving into a
          construction zone with a nice kitchen.
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/summerlin-west-new-construction-framing-drone.webp",
            alt: "New homes under construction in Summerlin West, open timber framing on two houses beside a finished stucco home still under scaffolding, with a dumpster and work truck at the curb.",
            caption:
              "New construction in Summerlin West. Summerlin is still building, which is why treating new builds as a Southwest-only option starts you off in the wrong comparison.",
          },
        ]}
      />

      {/* ---------------------------------------------------------------- */}
      {/* 4. ESTABLISHED                                                    */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="established" heading="Which area feels most established?">
        <p className="text-body-lg text-lvinit-warmgray">
          Not one of these three has a single uniform character, and anyone who
          tells you otherwise has not spent much time in them.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Inside Summerlin, the older villages and the newest ones feel almost
          nothing alike. The eastern and central villages have had decades to
          grow in, with mature landscaping, filled-in trails and established
          retail. Summerlin West is still arriving: newer streets, younger
          trees, parks in phases. Same master plan, same standards, two very
          different daily experiences.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Henderson has the widest spread of the three, because it has been
          building the longest and under the most different hands. Green Valley
          was Southern Nevada&rsquo;s first master-planned community, with a
          1978 grand opening, and it reads that way on the ground. The Water
          Street District is older still. Inspirada and Cadence are current.
          Those are not variations on a theme, they are different eras sharing a
          city.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The Southwest holds both at once, often within a mile.
          Mountain&rsquo;s Edge, Southern Highlands and Rhodes Ranch have been
          in the ground long enough to feel settled. A few streets away you will
          find a finished block that ends at a wall, a sidewalk that stops, and
          raw desert with a road already cut through it. None of that is
          decline. It is a place that is still being written. But if half-built
          horizons would wear on you over a few years, that is worth knowing
          before you buy rather than after.
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/southwest-las-vegas-rooftops-vacant-land-aerial-drone.webp",
            alt: "Aerial view in southwest Las Vegas of a finished block of homes ending abruptly at open, undeveloped desert, with a newly built road and an empty parking lot alongside.",
            caption:
              "A finished street in the Southwest running straight into undeveloped land. The house can be done long before the neighborhood is.",
          },
        ]}
      />

      {/* ---------------------------------------------------------------- */}
      {/* 5. WHAT KIND OF HOUSE                                             */}
      {/* ---------------------------------------------------------------- */}

      <StorySection
        id="what-house"
        heading="What kind of house do you actually want?"
      >
        <p className="text-body-lg text-lvinit-warmgray">
          This is usually the question that unlocks the whole thing. People
          arrive trying to pick an area and get stuck, because area is the hard
          way in. Describe the house and the week you want, and the map narrows
          itself.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          A few common ones. Treat these as starting points for where to look
          first, not as recommendations. Every one of them has exceptions in all
          three areas.
        </p>

        <dl className="mt-8 space-y-6">
          {BUYER_STARTING_POINTS.map((b) => (
            <div key={b.lean} className="border-l-2 border-lvinit-lightgray pl-6">
              <dt className="text-body-lg text-lvinit-black">{b.want}</dt>
              <dd className="mt-2">
                <span className="text-caption uppercase tracking-wide text-lvinit-blue">
                  {b.lean}
                </span>
                <span className="mt-1 block text-body text-lvinit-warmgray">
                  {b.why}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 text-body-lg text-lvinit-warmgray">
          If schools are part of your decision, and for a lot of people they
          are, do that research independently rather than taking any
          agent&rsquo;s word for it, mine included. Attendance zones do not
          follow community names, they change, and the answer for your specific
          address is the only one worth having. Start with the Clark County
          School District zone lookup and the state&rsquo;s own school reports.
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/henderson-macdonald-highlands-hillside-homes-drone.webp",
            alt: "Aerial view of custom contemporary homes stepping up a hillside at MacDonald Highlands in Henderson, with graded homesites and the ridgeline behind them.",
            caption:
              "Custom hillside homes at MacDonald Highlands in Henderson. Elevation and a long view is a different search from everything else on this page.",
          },
        ]}
      />

      {/* ---------------------------------------------------------------- */}
      {/* 6. PARKS AND OUTDOORS                                             */}
      {/* ---------------------------------------------------------------- */}

      <StorySection
        id="outdoors"
        heading="Parks, trails and what is actually around you"
      >
        <p className="text-body-lg text-lvinit-warmgray">
          Summerlin has the clearest advantage here, and it is worth being
          precise about why. More than 300 parks, nearly 40 of them major
          community parks, and more than 200 miles of interconnected trails.
          What makes that work is not the mileage, it is that the trails were
          designed into the arroyos between villages instead of added
          afterwards, so getting to a park often does not involve crossing an
          arterial. That is genuinely rare in this valley.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Red Rock Canyon National Conservation Area forms the western boundary,
          which is why the master plan stops where it does. Two honest caveats,
          both of which are on the full Summerlin guide. Proximity is not evenly
          distributed: Summerlin is thirty-five square miles, and from an
          eastern village the canyon is a drive like it is for everyone else.
          And from 1 October through 31 May the scenic drive needs a
          timed-entry reservation between 8am and 5pm, so the spontaneous
          Saturday drive up the canyon is mostly a summer thing.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Henderson runs a real municipal park system, which is a different
          model. It is a city department, funded and maintained by the city, and
          Sloan Canyon National Conservation Area sits on its southern side. The
          Southwest has more than people expect too, including Exploration Peak
          and the trail network through Mountain&rsquo;s Edge, though it arrived
          community by community rather than as one plan.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The question I would actually put to yourself: how often will you use
          any of it? Trail access is worth paying for if you are out there on a
          Tuesday morning. It is worth much less if the honest answer is twice a
          year, and twice a year is a completely reasonable answer. A lot of
          people pay a premium for outdoor access they never touch, then feel
          the square footage they gave up for it every single day.
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/summerlin-grand-park-summerlin-west-aerial-drone.webp",
            alt: "Aerial view of Grand Park in Summerlin West, a green lawn and shaded playground with walking paths, new rooftops on the left and the mountains behind.",
            caption:
              "Grand Park in Summerlin West. The first phase opened in early 2026; two further phases are still in planning.",
          },
        ]}
      />

      {/* ---------------------------------------------------------------- */}
      {/* 7. TRUE COST TO OWN                                               */}
      {/* ---------------------------------------------------------------- */}

      <StorySection
        id="cost-to-own"
        muted
        heading="HOAs, assessments, SID and LID, and what it really costs to own"
      >
        <p className="text-body-lg text-lvinit-warmgray">
          This is the section I would keep if I had to delete every other one.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Take a $650,000 home in Summerlin and a $650,000 home in the
          Southwest. Same list price. They are almost certainly not the same
          cost to own, and the gap is not small. The pieces stack differently in
          each area, and only one of those pieces shows up in the listing.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            HOA dues can apply in all three areas,
          </span>{" "}
          and the amount varies by neighborhood far more than it varies by area.
          Some Henderson and Southwest neighborhoods have no traditional HOA at
          all, which buyers are sometimes delighted and sometimes horrified to
          discover.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Summerlin adds a layer the other two generally do not.
          </span>{" "}
          Alongside whatever your specific neighborhood association charges,
          Summerlin properties sit under a community-level master association.
          As a concrete example of how that structure works, the published 2026
          monthly master assessments were $74 in Summerlin North, $76 in
          Summerlin South and $69 in Summerlin West, each already including the
          Summerlin Council&rsquo;s $37 share. Read those as an illustration of
          the layers, not as what any given home pays. They are the master
          figure only, your neighborhood sub-association sits on top, and
          neither number is the same across Summerlin.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">Then there is SID and LID.</span>{" "}
          A Special Improvement District or Local Improvement District lets a
          local government finance public infrastructure with bonds and assign a
          repayment assessment to every parcel inside the district. They turn up
          most often on newer construction, in all three areas. The part people
          miss is in Clark County&rsquo;s own words: special assessments are
          different from real property taxes and are billed separately, and an
          assessment is a lien on the property until it is paid off. Checking
          the property tax figure does not tell you whether one is attached. Ask
          for the disclosure, pull the parcel record, and read Schedule B of the
          title commitment during escrow.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          I am not going to publish typical dollar amounts for any of this,
          because there is no such thing. HOA dues, master assessments, SID and
          LID balances and the tax figure are all parcel-specific, and every one
          of them has to be verified against the actual property. Anyone quoting
          you an area-wide number is making it up.
        </p>

        <div className="mt-10 border border-lvinit-lightgray bg-lvinit-white p-6 sm:p-8">
          <p className="text-caption uppercase tracking-wide text-lvinit-warmgray">
            What to compare instead of list price
          </p>
          <dl className="mt-6 space-y-4">
            {OWNERSHIP_STACK.map((row, i) => (
              <div key={row.line} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="w-4 shrink-0 pt-0.5 text-body font-medium text-lvinit-blue"
                >
                  {i === 0 ? "" : "+"}
                </span>
                <div>
                  <dt className="text-body font-medium text-lvinit-black">
                    {row.line}
                  </dt>
                  <dd className="mt-1 text-body text-lvinit-warmgray">
                    {row.note}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex gap-4 border-t border-lvinit-black pt-5">
            <span
              aria-hidden="true"
              className="w-4 shrink-0 text-body font-medium text-lvinit-blue"
            >
              =
            </span>
            <p className="font-display text-subhead font-bold text-lvinit-black">
              What it actually costs you to own
            </p>
          </div>
        </div>

        <p className="mt-8 text-body-lg text-lvinit-warmgray">
          One more piece worth understanding before you compare anything: how
          Nevada&rsquo;s property tax cap works, and what happens to it when a
          home changes hands. That catches out more relocating buyers than
          anything else on this list, and it has{" "}
          <Link
            href="/guides/nevada-property-tax-abatement-resale-buyers"
            className={linkCls}
          >
            its own guide here
          </Link>
          .
        </p>
      </StorySection>

      <StoryPullQuote>
        Do not just compare the purchase price. Compare what each property is
        actually going to cost you to own.
      </StoryPullQuote>

      {/* ---------------------------------------------------------------- */}
      {/* 8. WHICH ONE WOULD I CHOOSE                                       */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="which-one" heading="So which one would I choose?">
        <p className="text-body-lg text-lvinit-warmgray">
          There is no universal winner here, and I mean that as an answer rather
          than a dodge. What I can give you is which way each one leans.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">Summerlin leans toward</span>{" "}
          buyers willing to trade some house for their surroundings: the master
          planning, the trail system, Red Rock proximity, Downtown Summerlin,
          and a west-side ecosystem that already exists rather than being
          scheduled. If those things will genuinely be part of your week, the
          compromise is worth arguing for.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">Henderson leans toward</span>{" "}
          buyers who want the widest range of options and are prepared to do the
          work of narrowing down which part of Henderson fits. That work is not
          optional. Henderson only becomes a good answer once it stops being the
          answer and becomes a specific community.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">The Southwest leans toward</span>{" "}
          buyers prioritizing newer housing, practical beltway access, real
          housing variety, and potentially more house for the money. The
          tradeoff is less institutional history behind your address and, in
          places, years of nearby construction.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If you want the two-way versions with more room to breathe, there is a{" "}
          <Link href="/guides/summerlin-vs-henderson" className={linkCls}>
            Summerlin vs. Henderson
          </Link>{" "}
          guide and a{" "}
          <Link
            href="/guides/henderson-vs-southwest-las-vegas"
            className={linkCls}
          >
            Henderson vs. Southwest
          </Link>{" "}
          guide.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* 9. MARKET ROOM                                                    */}
      {/* ---------------------------------------------------------------- */}

      <StorySection
        id="room-to-compare"
        heading="You have more room to compare right now"
      >
        <p className="text-body-lg text-lvinit-warmgray">
          A quick note on timing, then back to the evergreen part. As of the
          August 2026 Las Vegas REALTORS report, there were 7,590 single-family
          homes listed without offers, up 5.3% from a year earlier, with supply
          over four and a half months and fewer homes selling. The median
          existing single-family price was $475,000, down 1.0% year over year
          and down from the $490,000 record set in May and June.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That is not a crash and I am not going to sell it as one. What it is
          is more room to compare than buyers had during the tightest recent
          stretches. More listings, more time to decide, and less pressure to
          commit to an area before you have tested it against the others.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          So use it. If you like Summerlin, look at Summerlin. Then take the
          same money to Henderson and see what it does there. Then take that
          number into the Southwest. Make the areas compete for your money
          instead of picking one and hoping. That exercise takes an afternoon,
          and it is the single most useful thing you can do at this stage.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Those figures come from{" "}
          <a
            href="https://nevadabusiness.com/2026/09/lvr-reports-fewer-homes-selling-and-at-slightly-lower-prices/"
            className={linkCls}
            target="_blank"
            rel="noopener noreferrer"
          >
            Las Vegas REALTORS&rsquo; August 2026 report
          </a>{" "}
          and were cross-checked against{" "}
          <a
            href="https://www.fox5vegas.com/2026/09/09/report-las-vegas-home-prices-dip-again-august-sales-slow/"
            className={linkCls}
            target="_blank"
            rel="noopener noreferrer"
          >
            local coverage of the same release
          </a>
          . They are valley-wide, not specific to any of the three areas on this
          page. The{" "}
          <Link
            href="/guides/las-vegas-home-prices-august-2026"
            className={linkCls}
          >
            full breakdown of that report
          </Link>{" "}
          has its own guide, along with the longer read on{" "}
          <Link
            href="/guides/will-las-vegas-home-prices-drop"
            className={linkCls}
          >
            why rising inventory has not produced falling prices
          </Link>{" "}
          and the{" "}
          <Link
            href="/guides/las-vegas-new-home-sales-july-2026"
            className={linkCls}
          >
            new-construction side of the market
          </Link>
          .
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* BOTTOM LINE                                                       */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="bottom-line" heading="The bottom line">
        <p className="text-body-lg text-lvinit-warmgray">
          I am not going to recap the whole page at you. Instead, here is the
          set of questions that actually decides this, in roughly the order they
          matter.
        </p>
        <ul className="mt-8 space-y-4 text-body-lg text-lvinit-warmgray">
          {DECIDING_QUESTIONS.map((q) => (
            <li key={q} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue"
              />
              <span>{q}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-body-lg text-lvinit-warmgray">
          There is no universal winner between Summerlin, Henderson and the
          Southwest. The choice usually gets much easier the moment you know
          what you are not willing to compromise on. Everything else is
          negotiable, and once you have named the one thing that is not, the map
          gets very small very quickly.
        </p>
      </StorySection>

      <StorySection heading="About this coverage">
        <p className="text-body text-lvinit-warmgray">
          Structural and place-level detail on this page is carried from the
          LVINIT{" "}
          <Link href="/neighborhoods/summerlin" className={linkCls}>
            Summerlin
          </Link>
          ,{" "}
          <Link href="/neighborhoods/henderson" className={linkCls}>
            Henderson
          </Link>{" "}
          and{" "}
          <Link href="/neighborhoods/southwest-las-vegas" className={linkCls}>
            Southwest Las Vegas
          </Link>{" "}
          area guides, each of which carries its own sourced fact-check log.
          Market figures are Las Vegas REALTORS&rsquo; August 2026 report. The
          Summerlin master assessment figures were reported by the Las Vegas
          Review-Journal on 8 October 2025. The
          description of how special assessments are billed is Clark
          County&rsquo;s own. No median price is published here for any of the
          three areas, and no HOA, SID or LID amount is quoted for any property.
          Verify those per address.
        </p>
        <p className="mt-5 text-body text-lvinit-warmgray">
          Mikey Del Rosario · Las Vegas Real Estate Advisor · The Scofield
          Group · Nevada License S.0175577. Equal Housing Opportunity.
        </p>
      </StorySection>
    </StoryPage>
  );
}
