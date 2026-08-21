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
} from "@/components/story";
import {
  AreaQuickFacts,
  LVINITMap,
  LocalsNote,
  AreaCommunities,
  DevelopmentWatch,
  ComparisonBar,
  AreaVideoSlot,
  AreaFAQ,
  AreaSources,
} from "@/components/area";
import {
  quickFacts,
  mapAsset,
  mapPlaces,
  mapOmitted,
  communities,
  developmentProjects,
  southwestComparison,
  areaVideo,
  faqItems,
  sources,
} from "@/lib/areas/summerlin";

// ---------------------------------------------------------------------------
// SUMMERLIN — the second full LVINIT AREA GUIDE.
//
// Built from the same blocks as Southwest (components/area/, content in
// lib/areas/) but deliberately NOT the same page with the names swapped. The
// two areas have opposite problems and the guides argue opposite things:
//
//   Southwest — an informal name with no boundary, covering many unrelated
//   developments. Its guide spends its length saying "there is no line here."
//
//   Summerlin — one plan, one developer, a real (private) boundary, and a name
//   so strong that people think it describes a neighborhood. Its guide spends
//   its length saying "the name is real, and it still doesn't narrow anything
//   down. Look at the village."
//
// ROUTE: unchanged. This page already existed at /neighborhoods/summerlin and
// seventeen internal links point at it — four guides, four neighborhood pages,
// the homepage discovery list, the sitemap. It was rebuilt in place rather than
// forked, so every inbound link and the canonical stay intact.
//
// CARRIED FORWARD FROM THE OLD PAGE: the Fox Hill Park drone hero and its
// in-image credit, the Red Rock framing, the honest tradeoffs beat, the
// restrained CTA, the Fourth of July Parade feature link, and the link to the
// Summerlin vs. Henderson guide.
//
// CUT FROM THE OLD PAGE, deliberately:
//   · "schools that consistently rank near the top of the valley" — an
//     unsourceable quality claim. The page now cites only the school COUNT.
//   · "Families who want top schools and trails out the back door" — describes
//     a household type. Replaced with housing and geography.
//   · "roughly 25 minutes from downtown and the Strip" — one drive time for a
//     22,500-acre community, quoted while two Clark County projects are dug into
//     the freeway that serves it.
//   · Two "Coming soon / In the works" cluster cards that had been in the works
//     for a year.
//
// STILL DELIBERATELY NOT REVISITED: the Summerlin entry in the neighborhoods[]
// array in lib/content.ts, which feeds the homepage Compare tool with a median
// price, walk score, commute and school rating. Those figures predate this
// guide and this page disagrees with the idea of them, but the Compare tool is
// its own piece of work and is not in this task's scope.
//
// THE MAP is generated, not drawn: scripts/generate-summerlin-map.mjs, from real
// coordinates and OpenStreetMap geometry committed at
// scripts/data/summerlin-map-geometry.json. Read that generator's header before
// touching it — in particular, why it draws no Summerlin boundary. Label
// placement is verified by scripts/check-summerlin-map.mjs.
//
// FACTS: every claim is sourced. The fact-check log lives at the top of
// lib/areas/summerlin.tsx — read it before editing any figure.
//
// FAIR HOUSING: no school ratings, no crime or safety claims, no demographic
// characterization of residents, no "great for families"-style steering. Fit is
// expressed through housing stock, geography and daily logistics only.
// ---------------------------------------------------------------------------

const HERO_IMAGE = "/images/hero/summerlin-fox-hill-park-red-rock-aerial-drone.webp";
const HERO_ALT =
  "Aerial view over Fox Hill Park in Summerlin, Las Vegas — a wide green lawn with a shaded playground and looping paths, tile-roofed homes running to the horizon on every side, and the ridgeline of the Spring Mountains rising behind the western edge of the community.";

const meta: StoryMeta = {
  title: "Summerlin Las Vegas: Map, Villages & Local Guide | LVINIT",
  headline: "Summerlin",
  description:
    "Understand Summerlin like a local — a real map, the villages, Summerlin West, Downtown Summerlin, housing, parks and what's actually being built right now.",
  path: "/neighborhoods/summerlin",
  image: HERO_IMAGE,
  imageWidth: 2200,
  imageHeight: 1650,
  imageAlt: HERO_ALT,
  datePublished: "2026-07-04",
  dateModified: "2026-08-20",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Summerlin", path: "/neighborhoods/summerlin" },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

const linkClass =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

export default function SummerlinPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Las Vegas Area Guide",
        headline: "Summerlin",
        subheadline:
          "Saying you want to live in Summerlin is a start. It narrows things down far less than you think.",
        image: HERO_IMAGE,
        imageAlt: HERO_ALT,
        imageTitle: "Fox Hill Park, Summerlin — Photo by Mikey Del Rosario",
        backLink: { label: "Las Vegas neighborhoods", href: "/#neighborhoods" },
        ctas: [{ label: "See the map", href: "#map", variant: "tertiary" }],
      }}
      relatedStories={{
        heading: "Read these next",
        intro:
          "Summerlin makes most sense next to the things people compare it against — and next to what actually happens here on an ordinary Saturday.",
        columns: 3,
        stories: [
          {
            name: "Summerlin Fourth of July Parade",
            href: "/neighborhoods/summerlin/fourth-of-july-parade",
            category: "Local feature",
            dek: "One morning a year when the master plan stops being a master plan and turns into a neighborhood.",
          },
          {
            name: "Summerlin vs. Henderson",
            href: "/guides/summerlin-vs-henderson",
            category: "Comparison",
            dek: "A community against a whole city — the honest side-by-side, without a brochure in sight.",
          },
          {
            name: "Southwest Las Vegas",
            href: "/neighborhoods/southwest-las-vegas",
            category: "Area guide",
            dek: "The other side of the west valley: no master plan, no boundary, and a great deal of new construction.",
          },
        ],
      }}
      ctas={{
        heading: "Thinking about Summerlin?",
        body:
          "Tell me what you're looking for and what matters most about where you live. I'll point you toward the parts of Summerlin I'd start with — even if that means telling you to look somewhere else.",
        buttons: [
          { label: "Ask Mikey about Summerlin", href: "/contact", variant: "primary" },
          { label: "Help me compare areas", href: "/#compare", variant: "secondary" },
        ],
        footnote: (
          <>
            Weighing it against the other side of the valley? The{" "}
            <Link
              href="/neighborhoods/southwest-las-vegas"
              className="text-lvinit-blue underline underline-offset-4"
            >
              Southwest guide
            </Link>{" "}
            is the honest version of that argument.
          </>
        ),
      }}
    >
      <AreaQuickFacts facts={quickFacts} id="orientation" />

      <StoryLede
        kicker="Las Vegas Area Guide"
        lead="Almost everyone moving to Las Vegas hears about Summerlin in the first week. It's the answer people give fastest, and it's usually a good answer. The trouble starts one question later, when you try to work out what you've actually been told."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Because Summerlin isn&rsquo;t a neighborhood.{" "}
          <span className="text-lvinit-black">
            It&rsquo;s 22,500 acres — about 35 square miles — of master-planned
            community that has been built village by village since 1990
          </span>{" "}
          and still isn&rsquo;t finished. Inside it you&rsquo;ll find streets with
          thirty-year-old trees and streets with staked saplings, guard-gated
          custom homes and lock-and-leave townhomes, a village where you can walk
          to a ballgame and villages where the nearest coffee is a drive. All the
          same address. All genuinely Summerlin.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          So this guide does the thing the brochures skip. Where the community
          actually is, what its parts are called, why &ldquo;Summerlin West&rdquo;
          doesn&rsquo;t mean what most people think, what&rsquo;s being built right
          now, and what changes about your day depending on which village you land
          in.
        </p>
      </StoryLede>

      {/* ---------------------------------------------------------------- */}
      {/* THE MAP                                                           */}
      {/* ---------------------------------------------------------------- */}

      <LVINITMap
        id="map"
        heading="Summerlin Las Vegas Map"
        question="Where exactly is Summerlin?"
        src={mapAsset.src}
        alt={mapAsset.alt}
        width={mapAsset.width}
        height={mapAsset.height}
        intro={
          <>
            <p className="text-body-lg text-lvinit-warmgray">
              Summerlin runs north–south down the western edge of the valley,
              which is why this map is a tall strip rather than a tidy square.
              That shape is the first useful thing to know about it: the
              community is roughly twice as long as it is wide, and the drive
              from one end to the other is a real drive.
            </p>
            <p className="mt-5 text-body-lg text-lvinit-warmgray">
              The <span className="text-lvinit-black">CC-215</span> runs straight
              through the middle. Villages west of it are what people mean by
              Summerlin West. The gold line on the left is the Red Rock Canyon
              conservation-area boundary — federal land, and the reason the
              western villages stop where they do.
            </p>
          </>
        }
        caption="Summerlin's villages, plotted at their real coordinates. A schematic diagram — accurate in its relationships, not a survey."
        places={mapPlaces}
        disclaimer={
          <>
            <span className="text-lvinit-black">
              There is no Summerlin boundary drawn on this map, on purpose.
            </span>{" "}
            Summerlin is a private master-planned community, so its extent is
            defined by the developer&rsquo;s plan rather than by any government
            map, and Summerlin publishes that line itself as the official
            Summerlin Border Map. That artwork is theirs; we&rsquo;re not going to
            copy it, trace it or redraw it. Nor is there a government boundary
            that stands in — Summerlin is not a city, not a Clark County town, and
            not a census place. Drawing a line and labeling it &ldquo;Summerlin&rdquo;
            would have made a cleaner picture and taught you something false. For
            the official border, go to{" "}
            <a
              href="https://summerlin.com/about/maps-guides/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Summerlin&rsquo;s own maps and guides
            </a>
            . A few smaller villages — {mapOmitted.join(", ")} — are named in the
            key below and covered in the villages section rather than lettered
            onto the drawing, because a map you can read beats one that lists
            everything. Roads and the conservation-area boundary come from{" "}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              OpenStreetMap
            </a>
            .
          </>
        }
      />

      {/* ---------------------------------------------------------------- */}
      {/* WHERE IT IS                                                       */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="where" heading="Where Summerlin actually is">
        <p className="text-body-lg text-lvinit-warmgray">
          Summerlin occupies the western edge of the Las Vegas Valley, from
          roughly the Lone Mountain area in the north down past Russell Road in
          the south, with Red Rock Canyon behind it and the rest of the city in
          front. Howard Hughes describes it as sitting about nine miles west of
          the Strip. It is one property development, not a district of the city —
          which is the source of most of the confusion that follows.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          It is not a city, and it never has been
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          There is no Summerlin city hall, no Summerlin mayor, no Summerlin police
          department. Most of the community sits inside the{" "}
          <span className="text-lvinit-black">City of Las Vegas</span>, where it
          exists as a PC — Planned Community — zoning district with its own
          development standards adopted by the City Council. The land was annexed
          to the city starting in November 1989, and a further 8,318 acres came in
          under a 1997 development agreement. The southern end sits under Clark
          County instead. Which of the two covers a given address decides who you
          call about a permit, a code question or a road.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          &ldquo;Summerlin&rdquo; and &ldquo;west Las Vegas&rdquo; are not the
          same thing
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          The west side of the valley is much bigger than Summerlin. Peccole
          Ranch, Queensridge, The Lakes, Canyon Gate, Spanish Trail and a long
          list of other communities sit west of the middle of town and are not in
          Summerlin. Summerlin&rsquo;s own materials make the point bluntly with
          one of its closest neighbours:{" "}
          <span className="text-lvinit-black">
            Red Rock Country Club is not technically part of the Summerlin master
            plan
          </span>
          , despite sitting right against it. Which brings us to the listing
          language.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          &ldquo;Near Summerlin&rdquo; means not in Summerlin
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          If a listing says &ldquo;near Summerlin,&rdquo; &ldquo;Summerlin
          area,&rdquo; or &ldquo;Summerlin-adjacent,&rdquo; read it as a statement
          that the home is not inside the master plan. That isn&rsquo;t
          necessarily bad — some excellent west-side neighborhoods are outside it
          — but it is a different purchase. Inside Summerlin you get the master
          association, the design standards, the trail network and the village
          amenities. Outside, you get whatever that particular community provides.
          Ask which one you&rsquo;re buying, and check the address rather than the
          adjective.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          ZIP codes don&rsquo;t settle it either
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          This one comes straight from the developer.{" "}
          <span className="text-lvinit-black">
            &ldquo;It&rsquo;s important for buyers to understand our community is
            defined by our official boundaries, not by zip code.&rdquo;
          </span>{" "}
          The ZIPs most associated with Summerlin are 89134, 89135, 89138 and
          89144, and the community also reaches into 89148. But those ZIPs contain
          plenty of homes that aren&rsquo;t in Summerlin, and a handful of genuine
          Summerlin neighborhoods fall outside the familiar four. A ZIP code
          tells you where the mail sorts. It does not tell you whether you&rsquo;re
          in the master plan.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          What Summerlin South actually means
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          People use &ldquo;Summerlin South&rdquo; loosely to mean anything at the
          southern end, and that&rsquo;s where it gets slippery, because the term
          has a real planning definition.{" "}
          <span className="text-lvinit-black">
            Summerlin South is a Clark County land-use planning area of about
            7,099 acres
          </span>
          , which the county describes as generally bounded by Charleston
          Boulevard on the north, Russell Road on the south, Hualapai Way on the
          east and the Red Rock conservation area on the west. Its land use guide
          was approved in 1995 and updated in 2005. Separately, there is a
          Summerlin South census-designated place, which is a different geography
          drawn for a different purpose. Neither is simply a synonym for
          &ldquo;the southern villages.&rdquo; If someone tells you a home is in
          Summerlin South, ask whether they mean the county planning area or just
          the general direction.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          How you get in and out
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Two roads carry almost everything. The{" "}
          <span className="text-lvinit-black">CC-215</span> — the county-maintained
          Bruce Woodbury Beltway, which only carries the Interstate 215
          designation east of I-15 — runs north-south through the middle of the
          community and connects south toward the airport side of the valley.{" "}
          <span className="text-lvinit-black">Summerlin Parkway</span> runs east
          from the beltway out to US-95 and downtown. Charleston, Sahara, Lake
          Mead and Cheyenne handle the surface traffic, and Town Center Drive is
          the internal spine most people navigate by.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Worth knowing before you time anything: Clark County currently has{" "}
          <span className="text-lvinit-black">two projects</span> dug into the
          CC-215 through Summerlin — a $130 million rebuild of the Summerlin
          Parkway interchange, and a widening past Downtown Summerlin. Both are
          detailed further down.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          Why you won&rsquo;t find a drive time here
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Every page about Summerlin wants to tell you it&rsquo;s twenty-five
          minutes to the Strip. Ours used to.{" "}
          <span className="text-lvinit-black">
            The number is meaningless across 22,500 acres.
          </span>{" "}
          A home in The Willows and a home at La Madre Peaks are separated by
          about ten miles of Summerlin before either of them reaches the freeway,
          and the answer changes again with the hour, the direction and which ramp
          is currently closed for the interchange rebuild. Pick the address
          you&rsquo;re actually considering, and drive it at the hour you&rsquo;d
          actually be driving. Nothing else is worth the pixels.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* THE LOCAL'S NOTE                                                  */}
      {/* ---------------------------------------------------------------- */}

      <LocalsNote id="locals-note">
        <p className="text-body-lg text-lvinit-black">
          The biggest mistake people make with Summerlin is treating the name like
          it describes one neighborhood. A house near Downtown Summerlin, one
          deep in The Paseos, and one in the newest western villages can all have
          a Summerlin address and give you three completely different days.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Near Downtown Summerlin you can walk to dinner and hear the ballpark on
          a summer evening. In The Paseos you get grown trees, a finished street
          and a short run to Red Rock — and you drive to everything else. Out at
          Grand Park or La Madre Peaks you get a brand-new house, an unbeatable
          view, construction on three sides and a longer trip to every single
          thing you do. None of those is the wrong answer. They&rsquo;re just not
          the same answer.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-black">
          So when someone tells you they&rsquo;re looking in Summerlin, my next
          question is always the same one:{" "}
          <span className="font-medium">which village?</span> That&rsquo;s the
          question that actually decides what your life looks like here. The word
          Summerlin mostly tells you what the mailing address says.
        </p>
      </LocalsNote>

      {/* ---------------------------------------------------------------- */}
      {/* THE THREE SUMMERLINS                                              */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="groups" heading="Summerlin isn't one neighborhood">
        <p className="text-body-lg text-lvinit-warmgray">
          The fastest way to get oriented is to stop thinking about a list of
          villages and start thinking about three broad chunks, each built in a
          different era. These aren&rsquo;t official divisions with surveyed
          lines, but they&rsquo;re how the community is actually talked about, and
          they map onto real geography you can see from the car.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          The established core, east of the beltway
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Where Summerlin started. The Hills opened in 1990 as the first village,
          394 acres of it; The Arbors, The Canyons, The Trails, The Crossing, The
          Pueblo and Sun City Summerlin followed through the 1990s. This is the
          part with{" "}
          <span className="text-lvinit-black">actual shade</span> — thirty-plus
          years of irrigation has produced tree canopy you can genuinely walk
          under, which almost nowhere else in this valley can say. Housing here is
          resale, mostly 1990s and early-2000s, ranging from modest to guard-gated
          custom. Two resorts and TPC Las Vegas sit inside it.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          The southern villages, below Charleston
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Downtown Summerlin anchors the top of this stretch, with Summerlin
          Center wrapped around it. Below that run The Willows, The Gardens,
          Siena, The Ridges and, at the very bottom, The Cliffs and The Mesa. The
          range here is the widest in the community — Downtown Summerlin
          apartments and The Ridges&rsquo; guard-gated custom homesites are in the
          same broad chunk. It&rsquo;s also further south than most people
          picture: The Cliffs sits below Russell Road, on land Summerlin only
          acquired in a 2002 exchange with the Bureau of Land Management.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          Summerlin West, everything past the 215
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          The whole western half, and the part with the most terminology attached
          to it. The Vistas, The Paseos and Stonebridge are here — and so are
          Redpoint, Redpoint Square, Kestrel, Kestrel Commons, Grand Park, La
          Madre Peaks and Reverence. The elevation climbs as you go west, the
          streets start bending around arroyos instead of running on a grid, and
          the mountains stop being a view and start being the end of the road. It
          gets its own section below, because it&rsquo;s the part people most
          often get wrong.
        </p>

        <p className="mt-10 text-body-lg text-lvinit-warmgray">
          A word of caution on those chunks: they are useful shorthand, not
          categories with legal force. &ldquo;Summerlin South&rdquo; in particular
          has a specific Clark County planning meaning that doesn&rsquo;t line up
          neatly with &ldquo;the southern villages,&rdquo; which is exactly why
          it&rsquo;s worth being precise about the village name instead.
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/summerlin-mesa-ridge-park-drone.webp",
            alt: "Aerial view looking east from above Mesa Ridge Park at the southern end of Summerlin, Las Vegas — a green park lawn with a playground, shaded ramadas and tall palms in the foreground, tile-roofed houses running to the horizon, the towers of the Las Vegas Strip small in the haze beyond, and desert mountain ranges on either side.",
            caption:
              "Looking east from Mesa Ridge Park, down at Summerlin's southern end. The Strip is that low cluster of towers on the horizon — a very different outlook from a street up against Red Rock.",
          },
        ]}
      />

      {/* ---------------------------------------------------------------- */}
      {/* HIERARCHY                                                         */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="hierarchy" heading="Villages, districts and neighborhoods — the words matter">
        <p className="text-body-lg text-lvinit-warmgray">
          Three words get used interchangeably in Summerlin conversation, and they
          mean genuinely different things. Getting them straight will save you a
          lot of confusion on a new-build tour.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The structure comes from the City of Las Vegas planning process, and it
          runs in one direction:{" "}
          <span className="text-lvinit-black">
            Summerlin &rarr; village &rarr; parcel &rarr; neighborhood.
          </span>{" "}
          Summerlin prepares a general development plan covering one or more
          villages. That gets approved. Then it prepares development plans setting
          land use and density for individual parcels inside those villages. Then
          builders build neighborhoods on the parcels. In the City&rsquo;s own
          documents the villages are referred to by number before they ever get a
          name.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          So in practice: <span className="text-lvinit-black">Summerlin</span> is
          the whole master plan.{" "}
          <span className="text-lvinit-black">Grand Park</span> is a village
          inside it.{" "}
          <span className="text-lvinit-black">A builder neighborhood</span> —
          twenty to a couple of hundred homes, one builder, one set of floor plans
          — sits inside Grand Park. When a salesperson says &ldquo;we&rsquo;re in
          Summerlin,&rdquo; they mean the outermost of those three. That&rsquo;s
          true and it&rsquo;s nearly useless on its own.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The practical version:{" "}
          <span className="text-lvinit-black">
            the village decides your parks, your trails, your commute and your
            neighbours. The builder neighborhood decides your house and, usually,
            your sub-association dues.
          </span>{" "}
          You&rsquo;ll hear &ldquo;district&rdquo; used too, mostly for the newer
          western areas — treat it as another word for village unless someone
          gives you a reason not to.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          One more layer worth knowing about: the plan zones land into categories
          beyond housing — Village Center, Town Center, Employment Center,
          Neighborhood Focus, Community Open Space. That&rsquo;s why a village can
          have a grocery store built into it while the one next door doesn&rsquo;t,
          and why Downtown Summerlin exists where it does. It was zoned Town
          Center decades before it was built.
        </p>
      </StorySection>

      <AreaCommunities
        id="villages"
        heading="The villages, one by one"
        intro={
          <p className="text-body-lg text-lvinit-warmgray">
            Not every Summerlin village — the community has been adding them for
            thirty-six years and a few of the smaller ones are grouped here — but
            these are the names you&rsquo;ll actually hear, and what separates
            them from each other.
          </p>
        }
        communities={communities}
        footnote={
          <>
            Several of these deserve their own full guide, and will get one. Until
            a guide is actually written the name stays plain text rather than a
            link — no dead ends. Acreages and village descriptions come from
            Summerlin&rsquo;s own published materials; the read on what each one is
            like is mine.
          </>
        }
      />

      {/* ---------------------------------------------------------------- */}
      {/* WHAT IT FEELS LIKE                                                */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="feel" heading="What it actually feels like to drive">
        <p className="text-body-lg text-lvinit-warmgray">
          Drive from the eastern edge of Summerlin out to La Madre Peaks and you
          cross about thirty-six years of construction in twenty minutes.
          Here&rsquo;s what changes on the way.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">The trees disappear.</span> This is
          the single most reliable tell. The older villages have mature canopy —
          real shade over the sidewalk, which in this climate is worth more than
          any amenity a brochure lists. The newest villages have staked saplings
          in gravel. That gap is fifteen to twenty-five years wide, and no amount
          of money closes it faster.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">The ground starts moving.</span>{" "}
          East of the beltway you&rsquo;re essentially on the valley floor, on a
          grid. West of it the land climbs — Summerlin puts Kestrel above 3,000
          feet and The Ridges around 4,000 — and the streets start following
          arroyos and contours instead of section lines. You feel it in the
          driveways, the retaining walls and the view out of the back window.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">The walls change character.</span>{" "}
          Perimeter village walls are a Summerlin signature, and the standards for
          them are written differently west of the 215 — taller walls and rockery
          retaining are permitted out there because of the terrain. It reads as a
          more dramatic, more sculpted streetscape, and also as a more enclosed
          one.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">The density swings hard.</span>{" "}
          Around Downtown Summerlin there are apartments over retail and townhomes
          on small lots. Twenty minutes away there are 171 acres divided into 167
          custom homesites. Both are Summerlin. The distance between those two
          propositions is bigger than the distance between Summerlin and most
          other parts of the valley.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            And the further west you go, the further everything gets.
          </span>{" "}
          The trailhead gets closer and everything else gets further — the grocery
          run, the school run, the airport, the friend who lives in Henderson.
          That trade is the whole decision on the western side, and it&rsquo;s
          worth making it deliberately rather than discovering it in March.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The constant through all of it is the beltway. Almost every trip in
          Summerlin that isn&rsquo;t within your own village involves getting to
          the CC-215 or crossing it, which is why two years of construction on it
          is a bigger deal here than the same work would be somewhere with more
          ways out.
        </p>
      </StorySection>

      <StoryPullQuote>
        Summerlin&rsquo;s villages were built over thirty-six years. You can read
        the decade off the trees.
      </StoryPullQuote>

      {/* ---------------------------------------------------------------- */}
      {/* DOWNTOWN SUMMERLIN                                                */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="downtown" heading="Downtown Summerlin, and what it isn't">
        <p className="text-body-lg text-lvinit-warmgray">
          Start with the correction, because it catches people relocating from out
          of state every week.{" "}
          <span className="text-lvinit-black">
            Downtown Summerlin is not downtown Las Vegas.
          </span>{" "}
          Downtown Las Vegas is the historic city center — Fremont Street, the
          courthouses, the{" "}
          <Link href="/neighborhoods/downtown-arts-district" className={linkClass}>
            Arts District
          </Link>{" "}
          — and it&rsquo;s about nine miles east. Downtown Summerlin is a purpose-built
          commercial district that opened in 2014. Same word, different centuries.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          What it is: a 400-acre district inside Summerlin South, bounded by
          Charleston on the north, Sahara on the south, the beltway on the west
          and Town Center Drive on the east. At the middle of it sits a 106-acre,
          1.6 million square foot open-air center with more than 125 shops, bars
          and restaurants, anchored by Dillard&rsquo;s and Macy&rsquo;s. It opened
          on 9 October 2014.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Around and inside it: <span className="text-lvinit-black">Red Rock
          Resort</span>, which actually predates the shops — it opened in April
          2006; <span className="text-lvinit-black">City National Arena</span>, the
          Vegas Golden Knights&rsquo; practice facility and headquarters, open
          since 2017 and also home to UNLV hockey; and{" "}
          <span className="text-lvinit-black">Las Vegas Ballpark</span>, where the
          Triple-A Aviators have played since 2019. Then a stack of offices that
          has grown steadily — One Summerlin, Two Summerlin, 1700 Pavilion, and
          most recently Meridian, a 147,602-square-foot class-A campus that opened
          in 2025 with Google Fiber among its tenants.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          The distinction that actually matters to you
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Every Summerlin listing mentions Downtown Summerlin. Almost none of them
          distinguish between{" "}
          <span className="text-lvinit-black">
            having it in your community and being able to walk to it
          </span>
          . The number of Summerlin homes within a genuine walk is small — the
          apartments and attached homes in Summerlin Centre, a few streets either
          side. Everyone else drives, parks, and then walks around, which is a
          perfectly good evening and a completely different thing from walkability.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If walking to dinner is genuinely the point for you, that narrows
          Summerlin to a handful of streets, and it&rsquo;s worth saying so out
          loud before you start looking. If driving eight minutes to a good
          evening is fine — and for most people it is — then having Downtown
          Summerlin in the community is a real advantage that most of the valley
          doesn&rsquo;t have.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* SUMMERLIN WEST                                                    */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="summerlin-west" heading="Summerlin West: what's actually happening out there">
        <p className="text-body-lg text-lvinit-warmgray">
          &ldquo;Summerlin West&rdquo; is the term you&rsquo;ll hear most from
          builders and agents, and the one most likely to be misunderstood. Two
          corrections up front.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            First: it&rsquo;s a region, not a subdivision.
          </span>{" "}
          Nobody lives &ldquo;in Summerlin West&rdquo; the way they live in
          Stonebridge. It covers roughly everything west of the CC-215 — a usage
          the City of Las Vegas echoes when its Summerlin standards write separate
          rules for &ldquo;areas west of the 215 Beltway.&rdquo; It also has a
          formal origin: 8,318 acres annexed under a 1997 development agreement
          and described in the City&rsquo;s own documents as the Summerlin West
          area.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Second: it doesn&rsquo;t mean new.
          </span>{" "}
          The Vistas and The Paseos are both west of the beltway and both were
          built out years ago, with grown landscaping and finished streets.
          Stonebridge started later. Redpoint, Kestrel, Grand Park and La Madre
          Peaks are the genuinely current ones. So &ldquo;we&rsquo;re looking in
          Summerlin West&rdquo; could mean a 2005 home under mature trees or a
          2026 home with a construction fence at the end of the block. Those are
          not the same search.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          Where the growth is right now
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          The active frontier runs north and west. Redpoint and Redpoint Square
          brought a denser, more walkable street pattern than the classic
          1990s village layout. Kestrel and Kestrel Commons repeat that
          contrast at higher elevation — Summerlin puts Kestrel above 3,000 feet.
          Grand Park, west of the beltway and north of Far Hills, is organized
          around a park of more than 90 acres, the largest in the community. La
          Madre Peaks is the outer edge, including Astra, a custom-homesite
          enclave of 167 lots across 171 acres that debuted in 2025.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Summerlin closed 2025 with ten new neighborhoods and has said it
          expects eleven more in 2026, nearly all of them out here. Howard Hughes
          puts roughly{" "}
          <span className="text-lvinit-black">5,000 gross acres</span> as still
          reserved for future growth — its own figure, and one that explicitly
          includes roads, open space and common areas rather than only future
          rooftops. (Summerlin&rsquo;s history page gives a materially smaller
          number for 2023; the two don&rsquo;t reconcile and I&rsquo;m not going to
          pretend to know which basis is right.)
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          What buying out here actually involves
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Newer house, better view, higher ground, and{" "}
          <span className="text-lvinit-black">
            years of living next to construction
          </span>
          . Dirt haulers on your street. A park that opens in phases. Retail that
          is promised and not yet built. Roads that change alignment. That&rsquo;s
          not a warning so much as a description — it&rsquo;s what an unfinished
          village is, and plenty of people happily accept it for the house and the
          view they get.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The thing that does deserve a warning: find out what&rsquo;s planned for
          the empty land near the house before you commit, not after. Out here the
          vacant parcel across the street is not a permanent feature. It&rsquo;s a
          scheduled one.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* DEVELOPMENT WATCH                                                 */}
      {/* ---------------------------------------------------------------- */}

      <DevelopmentWatch
        id="development"
        heading="Summerlin Development Watch"
        updated="Updated August 2026"
        intro={
          <p className="text-body-lg text-lvinit-warmgray">
            Summerlin changes faster than most pages about it can keep up with,
            and a lot of what you&rsquo;ll find searching is a rendering from
            three years ago. Here&rsquo;s where things actually stand, split by
            what&rsquo;s genuinely open, what&rsquo;s genuinely being built, and
            what has only been announced. Every status below is sourced, and if I
            couldn&rsquo;t verify which of the three a project was in, it
            isn&rsquo;t here.
          </p>
        }
        projects={developmentProjects}
        footnote={
          <>
            The two freeway projects are the ones to pay attention to if
            you&rsquo;re shopping here this year — they overlap on the same
            stretch of the CC-215, and that&rsquo;s the road most of Summerlin
            uses to leave. Clark County&rsquo;s{" "}
            <a
              href="https://www.clarkcountynv.gov/government/departments/public_works_department/projects-in-construction"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              projects-in-construction list
            </a>{" "}
            is the live version. For new neighborhoods, Summerlin&rsquo;s own{" "}
            <a
              href="https://summerlin.com/actively-selling/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              actively-selling list
            </a>{" "}
            is the only one worth trusting on the day you read it. Statuses here
            were checked on 20 August 2026 and will move.
          </>
        }
      />

      {/* ---------------------------------------------------------------- */}
      {/* PARKS, TRAILS, RED ROCK                                           */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="outdoors" heading="Parks, trails and Red Rock">
        <p className="text-body-lg text-lvinit-warmgray">
          This is the part of Summerlin that lives up to the brochure, so
          it&rsquo;s worth being precise about what you actually get and where.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The numbers, from Summerlin: more than{" "}
          <span className="text-lvinit-black">300 parks</span>, of which nearly 40
          are major community parks ranging from five to ninety acres, and{" "}
          <span className="text-lvinit-black">
            more than 200 miles of interconnected trails
          </span>{" "}
          with an eventual target above 250. What makes that work isn&rsquo;t the
          mileage, it&rsquo;s that the trails were designed into the arroyos
          between villages rather than added afterwards — so a walk to the park
          often doesn&rsquo;t involve an arterial road, which is genuinely rare in
          this valley.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Not all of it is one kind of path, either. Summerlin distinguishes
          street-side trails, village trails through natural arroyos, ten-foot
          multi-modal trails, urban trails that separate bikes from pedestrians,
          regional trails connecting to public land, and natural earthen hiking
          tread. Which of those you actually have depends on your village, and
          the newest villages are still growing theirs.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          And then there&rsquo;s Red Rock
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Red Rock Canyon National Conservation Area is federal land managed by
          the Bureau of Land Management, designated in 1990 — the seventh NCA in
          the country and the first in Nevada. It carries a thirteen-mile scenic
          drive and takes more than three million visitors a year. It is also the
          western boundary of Summerlin, and the reason the master plan stops
          where it does rather than continuing into the hills.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Two honest caveats.{" "}
          <span className="text-lvinit-black">
            First, proximity is not evenly distributed.
          </span>{" "}
          From Stonebridge or La Madre Peaks the conservation area really is close
          enough to change your weekends. From The Willows or The Hills, Red Rock
          is a drive — a shorter one than from most of the valley, but a drive.
          Summerlin is thirty-five square miles; not every home has Red Rock out
          the back.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Second, the scenic drive requires a booking.
          </span>{" "}
          From 1 October through 31 May you need a timed-entry reservation to
          drive the loop between 8am and 5pm. Trailheads outside the fee area work
          differently, but the spontaneous Saturday-morning drive up the canyon is
          a summer thing. Worth knowing before you buy a house for the view of
          somewhere you need to reserve.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Something to watch: the Red Rock Canyon Legacy Trails project is planned
          to connect cyclists and hikers from Stonebridge out toward the Red Rock
          visitor center, with a 5.5-mile first phase. If it gets built it changes
          what &ldquo;close to Red Rock&rdquo; means on the western side. No
          construction date has been published, so treat it as planned rather than
          coming.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* HOUSING                                                           */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="housing" heading="What the housing is actually like">
        <p className="text-body-lg text-lvinit-warmgray">
          Summerlin has a reputation as the expensive option, and on average
          that&rsquo;s fair. But &ldquo;luxury&rdquo; as a description of the whole
          community is wrong, and it costs people money — either by scaring them
          off before they look, or by getting them shown the wrong quarter of it.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">The range is enormous.</span> Inside
          one master plan you have age-restricted condos, apartments over retail at
          Downtown Summerlin, attached townhomes in the newer western districts,
          thirty-year-old single-family homes on grown-in streets, brand-new
          production homes, golf-course frontage, guard-gated enclaves and custom
          homesites sold by the acre. Ten golf courses. Twenty-six public, private
          and charter schools inside the community.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">Resale versus new is a real fork.</span>{" "}
          The established villages are resale only, and what you buy there is a
          finished street, mature landscaping and a house that&rsquo;s twenty to
          thirty-five years old. The western villages are where the new
          construction is, and what you buy there is current spec, a warranty, and
          a few years of living inside a construction site. Both are legitimate.
          They&rsquo;re priced differently for reasons that have nothing to do with
          which is better.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Gates and golf shape whole villages.
          </span>{" "}
          Guard-gated is common at the upper end — The Ridges, Willow Creek inside
          The Willows, and others. Golf courses anchor their own housing markets
          across the community, including TPC Las Vegas in The Canyons and
          Bear&rsquo;s Best in The Ridges. And Sun City Summerlin operates as
          age-restricted housing with its own architectural review committee,
          separate from the rest of the plan.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Expect at least two layers of association, and check both.
          </span>{" "}
          Summerlin has a master association covering community-wide standards and
          amenities, and most neighborhoods add a sub-association on top. Some add
          a gate, a private club or a golf membership structure as well. The total
          varies enormously between villages and between neighborhoods inside one
          village — ask for the actual figure on the actual address, not a range.
          Design review is real here too: exterior changes go through committee.
          Most people consider that a feature; some find it out the hard way.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          On prices, and why there isn&rsquo;t a number here
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          I&rsquo;m not going to publish an &ldquo;average Summerlin home
          price.&rdquo; You&rsquo;ve just read that this one community contains
          both age-restricted condos and custom homesites at 4,000 feet. A single
          median across that range describes nothing — it moves depending on
          whether whoever calculated it included Downtown Summerlin apartments, or
          The Ridges, or the new-build closings out west, and almost nobody says
          which they did.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          What is worth reading is the valley-wide figure, which I keep current in
          the{" "}
          <Link href="/guides/las-vegas-home-prices-july-2026" className={linkClass}>
            monthly market read
          </Link>
          , and a concrete walkthrough of what a specific budget buys in the{" "}
          <Link href="/guides/what-500k-buys-in-las-vegas" className={linkClass}>
            $500K guide
          </Link>
          . For Summerlin specifically, the honest answer is a conversation
          against{" "}
          <Link href="/search" className={linkClass}>
            current listings
          </Link>{" "}
          in the village you&rsquo;re actually considering.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* TRADEOFFS                                                         */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="tradeoffs" heading="The tradeoffs" muted>
        <p className="text-body-lg text-lvinit-warmgray">
          Summerlin is a good answer for a lot of people. Here&rsquo;s what
          you&rsquo;re trading for it, without manufacturing complaints to look
          balanced.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">You generally pay more.</span> Not
          uniformly, and not in every village, but as a broad pattern Summerlin
          costs more than comparable housing elsewhere in the valley. Some of that
          is the amenities and the standards; some of it is the name.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            You are buying into a governed environment.
          </span>{" "}
          Master association plus sub-association, design review, standards on
          walls and landscaping. That&rsquo;s precisely what keeps Summerlin
          looking the way it does thirty-six years in. It also means the community
          has an opinion about your front yard.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Consistency reads as calm to some people and as sameness to others.
          </span>{" "}
          The coordinated walls, the coordinated palette, the coordinated
          landscaping — it&rsquo;s genuinely restful, and it&rsquo;s genuinely
          repetitive. Nobody can tell you in advance which way you&rsquo;ll take
          it. Drive three villages and you&rsquo;ll know.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            The far west adds real driving time.
          </span>{" "}
          Every mile toward Red Rock is a mile away from the airport, the Strip,
          the medical district and anyone you know on the other side of town. If
          your life is anchored east — an office off the Strip, family in Henderson
          — do that arithmetic honestly before the sunsets do it for you.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Walkability is a pocket, not a property of the place.
          </span>{" "}
          Outside Summerlin Centre and a couple of the newer western districts,
          this is a drive-everywhere community with excellent trails for
          recreation. Trails are not errands.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            And right now, there&rsquo;s the freeway.
          </span>{" "}
          Two concurrent Clark County projects on the CC-215 through Summerlin,
          one of them a three-year interchange rebuild. It will be better
          afterwards. It is not better now, and anyone selling you on the commute
          this year should be mentioning it.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* COMPARISONS                                                       */}
      {/* ---------------------------------------------------------------- */}

      <ComparisonBar
        id="vs-southwest"
        heading="Summerlin vs Southwest Las Vegas"
        sides={["Summerlin", "Southwest"]}
        intro={
          <p className="text-body-lg text-lvinit-warmgray">
            The two big new-construction answers on this side of the valley, and
            the comparison people make most often. No scores, because there
            isn&rsquo;t honest data to score these on — just which way each
            dimension leans and why.
          </p>
        }
        rows={southwestComparison}
        footnote={
          <>
            The short version: Summerlin is one plan executed over thirty-six
            years, and you can feel the plan from the street. The Southwest is
            many separate developments that filled the same stretch of county over
            the same decades — next to each other rather than with each other. You
            trade cohesion, trails and a real center for more variety, frequently
            more house, and a shorter run to the airport side of town. The{" "}
            <Link href="/neighborhoods/southwest-las-vegas" className={linkClass}>
              Southwest guide
            </Link>{" "}
            is the honest version of the other side.
          </>
        }
      />

      <StorySection id="vs-henderson" heading="Summerlin vs Henderson">
        <p className="text-body-lg text-lvinit-warmgray">
          People put these two head to head constantly, and the comparison is
          shakier than it looks — because they aren&rsquo;t the same kind of thing.{" "}
          <span className="text-lvinit-black">
            Summerlin is one master-planned community. Henderson is an
            incorporated city.
          </span>{" "}
          Henderson has its own mayor, council, police department and parks
          department, and it contains dozens of very different communities: new
          master plans, a historic downtown, hillside estates, a lake. Comparing a
          community to a city means you&rsquo;re comparing a specific thing to an
          average of many things.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The useful comparison is Summerlin against{" "}
          <span className="text-lvinit-black">a specific Henderson community</span>{" "}
          — Green Valley, Anthem, Inspirada, Lake Las Vegas, Cadence. Those are
          apples to apples. &ldquo;Summerlin or Henderson&rdquo; usually turns out
          to mean &ldquo;west side or southeast side,&rdquo; which is really a
          question about where your work and your people are.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Geographically they sit at opposite corners: Summerlin against the
          mountains on the west, Henderson across the bottom-right of the valley
          toward Lake Mead. The full{" "}
          <Link href="/guides/summerlin-vs-henderson" className={linkClass}>
            Summerlin vs. Henderson comparison
          </Link>{" "}
          goes through it properly, and the{" "}
          <Link href="/neighborhoods/henderson" className={linkClass}>
            Henderson guide
          </Link>{" "}
          breaks the city down community by community, which is the only sensible
          way to think about it.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* VIDEO                                                             */}
      {/* ---------------------------------------------------------------- */}

      <AreaVideoSlot
        id="watch"
        heading="Summerlin, Henderson or Southwest?"
        intro="These three come up in almost every relocation conversation, and they're not three versions of the same thing — one is a master-planned community, one is a whole city, and one is an informal name for a stretch of county. This comparison walks through how differently they actually feel to live in."
        video={areaVideo}
        pendingNote="Filming now — the video lands on this page when it publishes."
      />

      {/* ---------------------------------------------------------------- */}
      {/* FAQ                                                               */}
      {/* ---------------------------------------------------------------- */}

      <AreaFAQ
        id="faq"
        heading="Summerlin, answered"
        intro={
          <p className="text-body-lg text-lvinit-warmgray">
            The questions people actually type in, answered as precisely as the
            facts allow — which sometimes means answering &ldquo;it
            depends,&rdquo; and saying why.
          </p>
        }
        items={faqItems}
      />

      {/* ---------------------------------------------------------------- */}
      {/* CLOSE                                                             */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="verdict" heading="So should you look here?">
        <p className="text-body-lg text-lvinit-warmgray">
          Look at Summerlin if you want the trails and the parks used properly,
          if a coordinated, well-maintained environment appeals to you rather than
          bores you, if being close to Red Rock genuinely changes your weekends,
          and if you&rsquo;re comfortable paying something for all of that.
          It&rsquo;s the most complete version of that idea in this valley, and
          thirty-six years of consistency is not nothing.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Look elsewhere if you want a neighborhood with history and an
          unplanned center, if you want the most house per dollar, if your life is
          anchored on the east or south side of the valley, or if design review on
          your own front yard would irritate you. The{" "}
          <Link href="/neighborhoods/downtown-arts-district" className={linkClass}>
            Arts District
          </Link>{" "}
          is the opposite instinct entirely, and{" "}
          <Link href="/neighborhoods/southwest-las-vegas" className={linkClass}>
            Southwest
          </Link>{" "}
          is the less curated version of the same suburban idea.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          And if you are looking here — do the thing this whole page has been
          asking you to do. Pick three villages that sound different from each
          other. Drive all three on the same afternoon, in that order, ending with
          the newest one. You&rsquo;ll feel the thirty-six years in about ninety
          minutes, and you&rsquo;ll know which decade of Summerlin you actually
          want to live in. That&rsquo;s a much better question than whether you
          want Summerlin.
        </p>
      </StorySection>

      <Container className="pb-6">
        <p className="mx-auto max-w-[680px] text-caption text-lvinit-warmgray">
          Photographed over Summerlin by Mikey Del Rosario. Development status —
          what&rsquo;s open, under construction, or only announced — was checked on
          20 August 2026 and will change; check with Summerlin, the builders or
          Clark County before planning around it.
        </p>
      </Container>

      <AreaSources checked="Checked 20 August 2026" sources={sources} />
    </StoryPage>
  );
}
