import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryPullQuote,
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
  summerlinComparison,
  areaVideo,
  faqItems,
  sources,
} from "@/lib/areas/henderson";

// ---------------------------------------------------------------------------
// HENDERSON — the third full LVINIT AREA GUIDE.
//
// Built from the same blocks as Southwest and Summerlin (components/area/,
// content in lib/areas/), and deliberately NOT either of those pages with the
// names swapped. All three guides are about the same underlying problem — a
// place name that narrows things down far less than the person saying it
// thinks — and all three answer it differently, because the three places are
// different KINDS of thing:
//
//   Southwest — an informal name with no boundary at all, covering many
//   unrelated developments. Its guide says "there is no line here."
//
//   Summerlin — one private master plan with a real but unpublishable border.
//   Its guide says "the name is real, and you still need to name the village."
//
//   Henderson — an INCORPORATED CITY of roughly 118 square miles. Its guide
//   says "this is a city, here is its actual legal boundary, and the word tells
//   you less about someone's life than any of the community names inside it."
//
// That difference is why this is the only one of the three maps that draws a
// boundary. Henderson has a real, public, governmental line, so not drawing it
// would have been the dishonest choice here, exactly as drawing one would have
// been on the Summerlin map.
//
// ROUTE: unchanged. This page already existed at /neighborhoods/henderson and
// is pointed at by the Four Seasons feature, the Summerlin guide, the Southwest
// guide, the North Las Vegas and Arts District pages, the Summerlin vs
// Henderson comparison, the first-summer guide, the homepage discovery list and
// the sitemap. It was rebuilt in place rather than forked, so every inbound
// link and the canonical stay intact.
//
// CARRIED FORWARD FROM THE OLD PAGE: its central instinct, which was already
// right — that Henderson's real signature is range and that people move to one
// corner of it rather than to "Henderson". Also the Four Seasons Private
// Residences feature link, the link to the Summerlin guide, the link to the
// Summerlin vs. Henderson comparison, the restrained CTA tone, and the
// breadcrumb schema.
//
// CUT FROM THE OLD PAGE, deliberately:
//   · The entire "Schools & family" beat. It called Henderson "shorthand for
//     the family choice", which characterizes residents rather than housing.
//     Fair-housing problem, and unsupported besides.
//   · "Families and anyone who wants a settled, residential base" in the
//     who-it's-for block, for the same reason. Replaced with housing, geography
//     and daily logistics.
//   · "Henderson generally reads calmer and more family-oriented than the areas
//     pressed up against the Strip." Same problem again.
//   · Three "Coming soon" story cards (Lake Las Vegas, Green Valley Ranch,
//     Water Street District) that had been in the works for over a year and
//     rendered as if they were real articles.
//   · The claim that Henderson "generally puts you closer to the airport" as a
//     property of the city. It is true of most of Henderson and flatly untrue
//     of Lake Las Vegas and Anthem, which is the whole thesis of this rebuild.
//   · "Anthem ... known for elevation and views" left as a single description,
//     when Anthem is three materially different subdivisions.
//
// PHOTOGRAPHY: there is still no original Henderson photography in the repo.
// /images/neighborhood-henderson.jpg is one of the neutral placeholders
// documented in public/images/README.md, not a photograph of Henderson. So the
// hero runs in StoryHero's honest photoless mode, the same way the Four Seasons
// feature does, and the map carries the visual weight instead. Do not swap in a
// generic desert stock shot. When Mikey's own Henderson drone work lands, drop
// it at /images/hero/henderson-<descriptive-name>.webp and pass `image` to the
// hero and to `meta`, mirroring the Summerlin guide.
//
// THE MAP is generated, not drawn: scripts/generate-henderson-map.mjs, from the
// City of Henderson's own GIS boundary plus OpenStreetMap road geometry,
// committed at scripts/data/henderson-map-geometry.json. Read that generator's
// header before touching it. Label placement, marker placement and the
// boundary itself are verified by scripts/check-henderson-map.mjs, which also
// point-in-polygon tests every community against the official city line.
//
// FACTS: every claim is sourced. The fact-check log lives at the top of
// lib/areas/henderson.tsx — read it before editing any figure. In particular it
// records why two different city-published area figures appear on this page and
// why they are not merged.
//
// FAIR HOUSING: no school ratings, no crime or safety claims, no demographic
// characterization of residents, no "great for families"-style steering. Fit is
// expressed through housing stock, geography and daily logistics only.
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title: "Henderson, Nevada: Map, Communities & Local Guide | LVINIT",
  headline: "Henderson",
  description:
    "Understand Henderson like a local: a real map of the city limits, how Green Valley, Anthem, Inspirada, Cadence, Lake Las Vegas and West Henderson actually differ, and what's being built right now.",
  path: "/neighborhoods/henderson",
  datePublished: "2026-07-04",
  dateModified: "2026-08-27",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Henderson", path: "/neighborhoods/henderson" },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

const linkClass =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

export default function HendersonPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Las Vegas Area Guide",
        headline: "Henderson",
        subheadline:
          "Saying you want to live in Henderson barely narrows anything down. It's a whole city, and it's about seventeen miles wide.",
        backLink: { label: "Las Vegas neighborhoods", href: "/#neighborhoods" },
        ctas: [
          { label: "See the map", href: "#map", variant: "primary" },
          { label: "Which Henderson?", href: "#groups", variant: "tertiary" },
        ],
      }}
      relatedStories={{
        heading: "Read these next",
        intro:
          "Henderson makes most sense next to the things people weigh it against, and next to the one corner of it we've already covered in depth.",
        columns: 3,
        stories: [
          {
            name: "Four Seasons Private Residences",
            href: "/neighborhoods/henderson/four-seasons-private-residences",
            category: "Local feature",
            dek: "A closer look at the branded towers going up in MacDonald Highlands, and the honest read on what they are.",
          },
          {
            name: "Summerlin vs. Henderson",
            href: "/guides/summerlin-vs-henderson",
            category: "Comparison",
            dek: "A community against a whole city. The honest side-by-side, without a brochure in sight.",
          },
          {
            name: "Summerlin",
            href: "/neighborhoods/summerlin",
            category: "Area guide",
            dek: "The other end of the valley: one master plan, thirty-six years, and a name with the opposite problem.",
          },
        ],
      }}
      ctas={{
        heading: "Which Henderson are you actually looking at?",
        body:
          "Tell me what matters most about where you live and I'll tell you which two or three parts of Henderson are worth your afternoon, even if that means telling you to look somewhere else entirely.",
        buttons: [
          { label: "Ask Mikey about Henderson", href: "/contact", variant: "primary" },
          { label: "Help me compare areas", href: "/#compare", variant: "secondary" },
        ],
        footnote: (
          <>
            Weighing the other side of the valley? The{" "}
            <Link
              href="/neighborhoods/summerlin"
              className="text-lvinit-blue underline underline-offset-4"
            >
              Summerlin guide
            </Link>{" "}
            and the{" "}
            <Link
              href="/neighborhoods/southwest-las-vegas"
              className="text-lvinit-blue underline underline-offset-4"
            >
              Southwest guide
            </Link>{" "}
            are the honest versions of those arguments.
          </>
        ),
      }}
    >
      <AreaQuickFacts facts={quickFacts} id="orientation" />

      <StoryLede
        kicker="Las Vegas Area Guide"
        lead="When somebody moving to Las Vegas tells me they're looking in Henderson, I've learned not to start showing them houses. I ask a question back first, and it's always the same one."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Which Henderson? Because{" "}
          <span className="text-lvinit-black">
            Henderson is not a neighborhood and it is not a master-planned
            community. It is an incorporated city, Nevada&rsquo;s second largest,
            and the city puts its own area at nearly 118.5 square miles
          </span>
          . It has its own mayor, its own council, its own police and fire
          departments and its own parks department. Summerlin is about 35 square
          miles. Henderson is more than three times that.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Inside that line you&rsquo;ll find streets that opened in 1978 with
          trees you can walk under, a 1940s main street built for a wartime
          magnesium plant, custom lots blasted into a hillside, a man-made lake
          with resorts on it, age-restricted golf communities, brand-new
          townhomes, and a 2.4 million square foot factory going up on the far
          western edge. All the same city. All genuinely Henderson.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          So this guide does the thing the listing sites skip. Where the city
          actually is and where it actually ends, what its parts are called, why
          two of the most common Henderson names get mixed up constantly,
          what&rsquo;s being built right now, and what changes about your day
          depending on which corner you land in.
        </p>
      </StoryLede>

      {/* ---------------------------------------------------------------- */}
      {/* THE MAP                                                           */}
      {/* ---------------------------------------------------------------- */}

      <LVINITMap
        id="map"
        heading="Henderson, Nevada Map"
        question="When somebody says Henderson, where are these places actually?"
        src={mapAsset.src}
        alt={mapAsset.alt}
        width={mapAsset.width}
        height={mapAsset.height}
        intro={
          <>
            <p className="text-body-lg text-lvinit-warmgray">
              Look at the shape before you look at anything else. Henderson runs
              roughly{" "}
              <span className="text-lvinit-black">
                17.6 miles east to west against 16.1 miles north to south
              </span>
              , it reaches west across I-15 to Las Vegas Boulevard, and it pushes
              a long arm south-east through empty desert toward Railroad Pass.
              That is not the tidy square people picture when they say
              &ldquo;Henderson.&rdquo;
            </p>
            <p className="mt-5 text-body-lg text-lvinit-warmgray">
              Now look at the distance between Lake Las Vegas in the top right
              and Inspirada in the bottom left. Those two sit in the same city
              and answer to the same council, and they are about{" "}
              <span className="text-lvinit-black">
                sixteen miles apart in a straight line
              </span>
              , which is further than Summerlin is from the Strip. A buyer
              choosing between them is not choosing between two neighborhoods.
              They&rsquo;re choosing between two completely different lives.
            </p>
          </>
        }
        caption="The official City of Henderson boundary with its communities plotted at their real coordinates. A schematic diagram, accurate in its relationships, not a survey."
        places={mapPlaces}
        disclaimer={
          <>
            <span className="text-lvinit-black">
              This boundary is the real one.
            </span>{" "}
            Henderson is an incorporated city, so unlike Summerlin it has a
            genuine public line, and there was no excuse for approximating it.
            The outline comes from the City of Henderson&rsquo;s own GIS
            city-boundary layer, published through the city&rsquo;s{" "}
            <a
              href="https://gis-hendersonnv.opendata.arcgis.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              open-data portal
            </a>
            , requested in WGS84 and drawn without smoothing. No ZIP-code
            boundary, MLS area or hand-drawn blob was used or substituted. The
            polygon measures 121.96 square miles, slightly more than the
            &ldquo;nearly 118.5&rdquo; the city quotes on its fact sheet; both
            are the city&rsquo;s own numbers, from different vintages, and
            we&rsquo;re not going to average them into a third one that nobody
            published. A few more names ({mapOmitted.join(", ")}) are covered in
            the communities section rather than lettered onto the drawing,
            because a map you can read beats one that lists everything. Roads,
            the Sloan Canyon boundary and the lake come from{" "}
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

      <StorySection id="where" heading="Where Henderson actually is">
        <p className="text-body-lg text-lvinit-warmgray">
          Henderson occupies the south-eastern corner of the Las Vegas Valley,
          between the Las Vegas city limits and unincorporated county on one
          side and the McCullough Range, Sloan Canyon and Lake Mead on the other.
          The city describes itself as sitting on the southern rim of the valley,
          and the shape follows the terrain: it spreads sideways because the
          mountains stop it going south, and the federal land around Lake Mead
          stops it going east.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          It is a city, and that is not a technicality
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Henderson was incorporated on{" "}
          <span className="text-lvinit-black">16 April 1953</span>, and it exists
          because of the Second World War. Around 2,700 workers began building
          the Basic Magnesium plant in September 1941; when it opened the
          following February it drew roughly 15,000 people, and at its peak it
          produced about a quarter of the nation&rsquo;s magnesium. The town grew
          up around the plant. Everything else in this guide was built later, on
          top of that.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Practically, being a separate city means Henderson runs its own police
          and fire departments, its own parks department, its own building
          permits and its own zoning. When something goes wrong with a road, a
          permit or a code question, you call Henderson, not Clark County and not
          Las Vegas. It also means the boundary is a real legal line rather than
          a marketing one, which brings us to the thing that trips people up.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          A Henderson address is not the same as the City of Henderson
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Postal addresses follow delivery routes, not city limits, and in the
          south valley the two diverge in both directions.{" "}
          <span className="text-lvinit-black">
            Southern Highlands, Silverado Ranch and Harry Reid International
            Airport all sit outside the city
          </span>{" "}
          despite being close to it and often discussed alongside it. Meanwhile
          the M Resort, which nearly everyone assumes is unincorporated county
          out on Las Vegas Boulevard, is{" "}
          <span className="text-lvinit-black">inside</span> the Henderson city
          limits. Every marker on the map above was checked against the
          city&rsquo;s own boundary polygon before it was plotted, which is how
          we know.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          This matters when it matters: which city issues your permits, which
          police department answers, which parks system you pay into and use,
          and which city&rsquo;s rules apply to what you can build. If any of
          that is relevant to you, check the address against the city&rsquo;s
          GIS rather than the envelope.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          There are 22 holes in the city
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          The official boundary is not a simple outline. It is one outer ring
          with{" "}
          <span className="text-lvinit-black">
            22 interior rings cut out of it
          </span>
          : pockets of unincorporated Clark County that the city grew around
          without ever annexing. All 22 are cut out of the shape on the map
          above, so the area it encloses is exactly the city&rsquo;s, but only
          the four large enough to see are outlined. The rest are a few hundred
          feet across and sit below what a map of a whole city can draw.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          Why you won&rsquo;t find one drive time here
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Every page about Henderson wants to tell you it&rsquo;s twenty minutes
          to the Strip. Ours used to say something similar.{" "}
          <span className="text-lvinit-black">
            The number is meaningless across a city seventeen miles wide.
          </span>{" "}
          A home on Las Vegas Boulevard at the western edge and a home at Lake
          Las Vegas are separated by most of Henderson before either of them
          gets anywhere, and the answer changes again with the hour, the
          direction, and which of the two major road projects currently dug into
          the city is in your way. Pick the address you&rsquo;re actually
          considering, and drive it at the hour you&rsquo;d actually be driving.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* THE LOCAL'S NOTE                                                  */}
      {/* ---------------------------------------------------------------- */}

      <LocalsNote id="locals-note">
        <p className="text-body-lg text-lvinit-black">
          The word Henderson is less useful than almost anyone using it thinks it
          is. People say it the way they&rsquo;d say a neighborhood name, as if
          it has narrowed the search. It hasn&rsquo;t. It has told me which third
          of the valley to point the car at, and nothing else.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          I&rsquo;ve driven the same buyer from Green Valley to Lake Las Vegas in
          one afternoon and watched them realize, somewhere out past the last
          stoplight on Lake Mead Parkway, that they&rsquo;d been treating two
          completely different propositions as one search. Grown-in trees and a
          grocery store four minutes away, then twenty minutes of open desert and
          a lake. Both Henderson. Both good answers to somebody. Not the same
          answer.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-black">
          So when someone tells me they&rsquo;re looking in Henderson, my next
          question is always the same one:{" "}
          <span className="font-medium">which part?</span> That&rsquo;s the
          question that actually decides what your life looks like here. The word
          Henderson mostly tells you who picks up your trash.
        </p>
      </LocalsNote>

      {/* ---------------------------------------------------------------- */}
      {/* HOW TO THINK ABOUT HENDERSON                                      */}
      {/* ---------------------------------------------------------------- */}

      {/* The heading carries the "not official" caveat itself, not just the body
          copy. Somebody scanning H2s should never come away thinking these five
          are City of Henderson districts. The body says it again, and the
          section closes by saying it a third time. */}
      <StorySection id="groups" heading="Five Hendersons: my shorthand, not the city's">
        <p className="text-body-lg text-lvinit-warmgray">
          Henderson has no official sub-regions. The city doesn&rsquo;t publish a
          list of districts and there is no council-defined taxonomy to hand you.
          What follows is{" "}
          <span className="text-lvinit-black">
            an LVINIT way of organizing the city
          </span>
          , not a government one. It exists because it&rsquo;s how the place
          actually sorts itself when you drive it, and because each group was
          built in a different decade, which you can see from the car.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          1. Historic Henderson and Water Street
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          The original town, in the middle-east of the city. This is where
          Henderson started, around the magnesium plant, and it has the only
          pre-master-plan bones in the city: a real main street, civic buildings,
          older and smaller housing stock, and a walkable core that grew rather
          than being designed. The city&rsquo;s redevelopment agency has been
          working on it since 1995 and it is visibly still changing.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          2. The Green Valley core
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          The established middle, and the part most people actually mean when
          they say Henderson. Green Valley opened in 1978 as Southern
          Nevada&rsquo;s first master-planned community, twelve years before
          Summerlin broke ground. Green Valley Ranch, Green Valley South and
          Whitney Ranch sit in and around it. This is resale territory with
          mature landscaping, and it is the shortest run from Henderson to the
          rest of the valley.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          3. The southern hillsides
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Everything climbing toward the McCullough Range: Seven Hills, Anthem,
          MacDonald Highlands, Ascaya, Sun City Anthem. Mostly late 1990s and
          2000s, with custom hillside development continuing today. The land
          starts moving, the streets stop running on a grid, the views get long,
          and everything you need is downhill and a drive. This is also where
          Henderson&rsquo;s guard gates and its highest prices are.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          4. West Henderson
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          The growth front, west and south of St. Rose Parkway.{" "}
          <span className="text-lvinit-black">
            West Henderson is a City of Henderson planning area, not a community
          </span>
          , which is why it appears on the map as a label with no marker. Its
          Land Use Plan was approved by City Council in December 2014. Inspirada
          is the big residential community inside it; the rest is the city&rsquo;s
          push to become somewhere people work rather than somewhere they drive
          home to, and it is where the newest construction and the newest jobs
          both are.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          5. The eastern half
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Cadence and Lake Las Vegas, plus the Boulder Highway corridor running
          between them. Cadence is the newest large master plan on this side.
          Lake Las Vegas is further out again, past several miles of open desert,
          and functions almost as its own place. This half of the city is closest
          to Lake Mead and furthest from everything on the west side of the
          valley.
        </p>

        <p className="mt-10 text-body-lg text-lvinit-warmgray">
          A word of caution on those five: they are useful shorthand, not
          categories with legal force. Nobody in Henderson city government will
          know what you mean by &ldquo;the southern hillsides.&rdquo; What they
          will know is the community name, which is exactly why the next section
          is organized by those instead.
        </p>
      </StorySection>

      <AreaCommunities
        id="communities"
        heading="The communities people actually mean"
        intro={
          <p className="text-body-lg text-lvinit-warmgray">
            Not every named community in Henderson is here, and a few smaller
            ones are grouped into the sections above, but these are the names
            you&rsquo;ll actually hear, where they sit, and what separates them
            from each other. Note that they are not all the same kind of thing:
            some are master plans, two are custom-home developments, and one is a
            downtown.
          </p>
        }
        communities={communities}
        footnote={
          <>
            Several of these deserve their own full guide, and will get one.
            Until a guide is actually written the name stays plain text rather
            than a link. No dead ends. Dates, acreages and developer history are
            sourced below; the read on what each one is like is mine. Tuscany,
            Sun City Anthem, Anthem Country Club, Sun City MacDonald Ranch,
            Calico Ridge, Mission Hills and Madeira Canyon are real Henderson
            names too, left out here only for length.
          </>
        }
      />

      {/* ---------------------------------------------------------------- */}
      {/* WHAT IT FEELS LIKE                                                */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="feel" heading="What it actually feels like to drive">
        <p className="text-body-lg text-lvinit-warmgray">
          Drive from Water Street out to Inspirada and then up to Ascaya and you
          cross about eighty years of building in under an hour. Here&rsquo;s
          what changes on the way.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">The trees appear and vanish.</span>{" "}
          This is the most reliable tell in the valley. Green Valley has been
          irrigated since 1978 and has real canopy over the sidewalk, which
          almost nowhere else in Southern Nevada can say. Inspirada and Cadence
          have staked saplings in gravel. That gap is decades wide and no amount
          of money closes it faster.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">The ground starts moving.</span>{" "}
          North and central Henderson is valley floor on a grid. South of Horizon
          Ridge the land climbs, the streets start following contours instead of
          section lines, and you start seeing retaining walls, benched lots and
          driveways with a real slope on them. At Ascaya the lots were blasted
          into the hillside, which is about as far from a grid as this valley
          gets.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            The gaps between things get longer.
          </span>{" "}
          In Green Valley, everything is four minutes away. Out toward Lake Las
          Vegas you drive past the last stoplight and then keep driving. That
          stretch of empty desert is the single most underestimated thing about
          Henderson, and the only way to understand it is to sit through it once.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            The street pattern changes era by era.
          </span>{" "}
          The 1990s and 2000s parts of Henderson are long collector roads and
          deep cul-de-sac loops behind walls. Inspirada was laid out later and
          reads more like a village grid with parks in it. Water Street is older
          than both and just has streets. Same city, three different theories of
          how a neighborhood should work.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            And walkability is a pocket, not a property of the place.
          </span>{" "}
          The District at Green Valley Ranch and Water Street are both genuinely
          walkable once you&rsquo;re there. Almost nowhere else is. For most of
          Henderson, &ldquo;walkable&rdquo; means you drive, park, and then walk
          around, which is a perfectly good evening and a completely different
          thing.
        </p>
      </StorySection>

      <StoryPullQuote>
        Lake Las Vegas and Inspirada share a mayor, a council and a police
        department. They also share about sixteen miles of desert.
      </StoryPullQuote>

      {/* ---------------------------------------------------------------- */}
      {/* HOUSING                                                           */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="housing" heading="What the housing is actually like">
        <p className="text-body-lg text-lvinit-warmgray">
          Henderson has a reputation as the expensive, established option, and
          like most reputations it is true of part of the city and misleading
          about the rest. The honest version is that Henderson contains a wider
          range of housing than any other single name in this valley, because it
          is not a product, it is a jurisdiction.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">Resale versus new is the first fork.</span>{" "}
          Green Valley, Green Valley Ranch, Whitney Ranch and most of Seven Hills
          are resale only, and what you buy is a finished street, mature
          landscaping and a house that&rsquo;s twenty to forty-eight years old.
          Inspirada, Cadence and parts of Lake Las Vegas are where the new
          construction is, and what you buy there is current spec, a warranty,
          and a few years of living next to a construction site. Both are
          legitimate. They are priced differently for reasons that have nothing
          to do with which is better.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            The top and the bottom of the range are further apart than people
            expect.
          </span>{" "}
          Older single-story homes on the Boulder Highway side of the city and
          custom homesites at Ascaya are both Henderson. So are attached
          townhomes in Inspirada, lakefront condos at Lake Las Vegas,
          golf-course frontage at Anthem Country Club and 1980s tract homes in
          Green Valley. Any average across that describes nothing.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">Gates and golf shape whole areas.</span>{" "}
          Guard-gated is common at the upper end: MacDonald Highlands, Anthem
          Country Club, parts of Seven Hills, much of Lake Las Vegas. The
          city&rsquo;s own fact sheet lists ten golf courses in Henderson,
          municipal, public and private, and several of them anchor their own
          housing markets.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Age-restricted housing is a real category here, not a hint.
          </span>{" "}
          Sun City Anthem and Sun City MacDonald Ranch are legally age-restricted
          products with their own facilities, rules and associations. That is a
          fact about the housing, and it is worth knowing it exists because it
          shapes whole sections of the southern hillsides. Whether it&rsquo;s
          relevant to you is entirely your call.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Expect at least two layers of association, and check both.
          </span>{" "}
          Most Henderson communities have a master association plus a
          sub-association, and gated or golf communities add more on top. The
          total varies enormously between communities and between neighborhoods
          inside one community. Ask for the actual figure on the actual address,
          not a range.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          On prices, and why there isn&rsquo;t a number here
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          I&rsquo;m not going to publish an &ldquo;average Henderson home
          price.&rdquo; You&rsquo;ve just read that one city contains
          age-restricted condos and hillside homesites sold by the lot. A single
          median across that range describes nothing, and it moves depending on
          whether whoever calculated it included Lake Las Vegas, or Ascaya, or
          the new-build closings in Cadence, and almost nobody says which they
          did.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          What is worth reading is the valley-wide figure, which I keep current
          in the{" "}
          <Link href="/guides/las-vegas-home-prices-july-2026" className={linkClass}>
            monthly market read
          </Link>
          , the{" "}
          <Link href="/guides/las-vegas-new-home-sales-july-2026" className={linkClass}>
            new-construction read
          </Link>{" "}
          if you&rsquo;re looking at Inspirada or Cadence, and a concrete
          walkthrough of what a specific budget buys in the{" "}
          <Link href="/guides/what-500k-buys-in-las-vegas" className={linkClass}>
            $500K guide
          </Link>
          . For Henderson specifically, the honest answer is a conversation
          against{" "}
          <Link href="/search" className={linkClass}>
            current listings
          </Link>{" "}
          in the community you&rsquo;re actually considering.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* GETTING AROUND                                                    */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="getting-around" heading="Getting around, and why it depends">
        <p className="text-body-lg text-lvinit-warmgray">
          This section matters more in Henderson than in Summerlin or the
          Southwest, because the city is big enough that two Henderson addresses
          can have genuinely opposite commutes. Start with the names, because
          several of them changed recently and a lot of pages haven&rsquo;t
          caught up.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          The freeway is I-11 now, not I-515
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          The main freeway through Henderson carries{" "}
          <span className="text-lvinit-black">I-11</span>, running concurrently
          with US-93 and US-95. I-11 was extended through the Las Vegas Valley in
          May 2024 and{" "}
          <span className="text-lvinit-black">I-515 was decommissioned</span> at
          that point. Plenty of maps, signs and websites still say I-515,
          including the city&rsquo;s own fact sheet. They mean the same road. It
          runs north-west to south-east across the city, out past Railroad Pass
          toward Boulder City and eventually the Hoover Dam bridge.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The beltway across northern Henderson is{" "}
          <span className="text-lvinit-black">I-215</span>. Only the western leg,
          over on the Summerlin side, is the county-maintained CC-215. The other
          names worth knowing are all state routes: St. Rose Parkway is SR-146,
          Boulder Highway is SR-582, and Lake Mead Parkway is SR-564.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          Two major projects are dug into the city right now
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Reimagine Boulder Highway is rebuilding{" "}
          <span className="text-lvinit-black">7.52 miles</span> of Boulder
          Highway, cutting it from six lanes to four and adding center-running
          transit lanes, protected bike lanes and wider sidewalks. The Henderson
          215 Project is adding two lanes each way to I-215 between Pecos and
          Stephanie, with a diverging diamond interchange at Green Valley
          Parkway. Both are detailed further down. Between them they affect the
          two roads most of central and northern Henderson uses to leave.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          Where you land changes the answer completely
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Green Valley and Whitney Ranch
          </span>{" "}
          have the most ways out: I-215 across the top, I-11 on the east, and the
          shortest run of anywhere in Henderson to the airport, the Strip and
          the eastern side of Las Vegas.{" "}
          <span className="text-lvinit-black">West Henderson and Inspirada</span>{" "}
          hang off St. Rose Parkway and I-15, which points them at the Southwest
          valley and the south Strip rather than at central Las Vegas.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            The southern hillsides
          </span>{" "}
          add real driving time to everything. From Anthem you are getting down
          the hill before you start, and Sloan Canyon means there is no southern
          route out. And{" "}
          <span className="text-lvinit-black">Lake Las Vegas</span> is its own
          category: several miles of open desert between it and the rest of the
          city, on Lake Mead Parkway, with the practical consequence that
          spontaneous trips into town mostly stop happening.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The one thing that is true almost everywhere in Henderson: getting to
          Summerlin or the northwest valley is a long trip. They are at opposite
          corners of the same valley, and no part of Henderson is close to any
          part of Summerlin. If your work or your people are on the west side,
          that arithmetic should happen before you fall for a house.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          One more correction worth making, because it comes up weekly:{" "}
          <span className="text-lvinit-black">
            Harry Reid International Airport is not in Henderson
          </span>
          . It is in Paradise. Most of Henderson is genuinely convenient to it,
          which is probably where the confusion started. Henderson does have its
          own airport, Henderson Executive, off St. Rose Parkway, but it handles
          general aviation rather than commercial flights.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* PARKS AND OUTDOORS                                                */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="outdoors" heading="Parks, trails and what's outside the city">
        <p className="text-body-lg text-lvinit-warmgray">
          Henderson runs its own parks department and publishes its own numbers:{" "}
          <span className="text-lvinit-black">76 city parks</span> including five
          school parks, nearly 1,400 acres of developed parks and trails, and{" "}
          <span className="text-lvinit-black">
            more than 300 miles of multi-use trails
          </span>
          , plus eleven aquatic facilities across six locations and seven skate
          parks.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Worth being precise about what that means, though. Henderson&rsquo;s
          trail network was assembled over decades by a city, not designed into
          the arroyos from the start the way Summerlin&rsquo;s was. The result is
          a lot of genuinely good local trail, unevenly distributed. Which of
          those 300 miles you actually have depends heavily on where you land,
          and the Pittman Wash and River Mountains corridors are worth walking
          before you assume.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          Sloan Canyon, and a closure to know about
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          The{" "}
          <span className="text-lvinit-black">
            Sloan Canyon National Conservation Area
          </span>{" "}
          covers 48,438 acres of BLM land along Henderson&rsquo;s southern edge,
          and it is the reason the city stops climbing into the McCullough Range.
          Its centerpiece is Petroglyph Canyon, which holds more than 300 rock
          art panels with around 1,700 individual design elements. It is day-use
          only.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If trail access to Sloan Canyon is part of why you&rsquo;re looking at
          Anthem or the southern hillsides, check before you drive out:{" "}
          <span className="text-lvinit-black">
            Nawghaw Poa Road and its parking area are closed from 12 November
            2024 to 11 November 2026
          </span>{" "}
          while the BLM builds a permanent visitor contact station. The
          Petroglyph Canyon and 101 trails have been rerouted and parking has
          moved to Democracy Drive.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          Lake Mead is genuinely close, from part of the city
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          The Lake Mead National Recreation Area sits immediately east of
          Henderson, and from the eastern half of the city, Cadence and Lake Las
          Vegas especially, it changes what a weekend looks like. From Inspirada
          or the western edge it is most of the way across the city first. Same
          caveat as everything else here: proximity to Lake Mead is a real
          Henderson advantage and it is not evenly distributed.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Closer to home, the city&rsquo;s more unusual public spaces are worth
          knowing about: the Henderson Bird Viewing Preserve, Whitney Mesa Nature
          Preserve and the Acacia Demonstration Gardens are all city facilities
          and all a long way from what people expect a desert suburb to have.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* DEVELOPMENT WATCH                                                 */}
      {/* ---------------------------------------------------------------- */}

      <DevelopmentWatch
        id="development"
        heading="Henderson Development Watch"
        updated="Updated August 2026"
        intro={
          <p className="text-body-lg text-lvinit-warmgray">
            Henderson changes faster than most pages about it can keep up with,
            and a lot of what you&rsquo;ll find searching is an announcement from
            three years ago being recycled as news. Here&rsquo;s where things
            actually stand, split by what&rsquo;s genuinely open, what&rsquo;s
            genuinely being built, and what has only been proposed. Every status
            below is sourced, and if I couldn&rsquo;t verify which of the three a
            project was in, it isn&rsquo;t here.
          </p>
        }
        projects={developmentProjects}
        footnote={
          <>
            The two road projects are the ones to pay attention to if you&rsquo;re
            shopping here this year, because between them they cover the roads
            most of Henderson uses to leave. The city&rsquo;s own{" "}
            <a
              href="https://www.cityofhenderson.com/government/departments/public-works/road-work-projects/current-projects"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              current projects list
            </a>{" "}
            is the live version. Nothing in the planned section is a promise:
            entitlements are not construction, and the Fiesta site in particular
            has already had one developer agreement lapse. Statuses here were
            checked on 27 August 2026 and will move.
          </>
        }
      />

      {/* ---------------------------------------------------------------- */}
      {/* TRADEOFFS                                                         */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="tradeoffs" heading="The tradeoffs" muted>
        <p className="text-body-lg text-lvinit-warmgray">
          Henderson is a good answer for a lot of people. Here&rsquo;s what
          you&rsquo;re trading for it, without manufacturing complaints to look
          balanced.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            The size is the benefit and the problem.
          </span>{" "}
          No other single name in this valley covers as many different housing
          environments, for the simple reason that no other single name is a
          whole city. That same range is why the word is nearly useless as a
          search filter, and why choosing &ldquo;Henderson&rdquo; without
          choosing a part of it usually wastes a weekend.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Some of it is genuinely far from the rest of the valley.
          </span>{" "}
          Anthem, the southern hillsides and Lake Las Vegas add real driving time
          to everything, and Lake Las Vegas adds it to trips inside Henderson
          too. That is the price of the setting, and for a lot of people
          it&rsquo;s worth paying. Just make sure you&rsquo;ve priced it.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            The established areas trade newness for shade.
          </span>{" "}
          Green Valley has been irrigated since 1978, and almost nothing else in
          this valley has had that long to grow in. The houses under those trees
          are twenty to forty-eight years old, with the roofs, systems and floor
          plans of their decade. You cannot have the trees and
          the new build in the same place. Nobody can.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            The growth areas trade shade for years of construction.
          </span>{" "}
          Inspirada, Cadence and West Henderson mean dirt haulers, phased
          amenities, retail that is promised and not yet built, and roads that
          change alignment. That is not a warning so much as a description of
          what an unfinished community is. Find out what&rsquo;s planned for the
          empty land near the house before you commit, not after.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Lake Las Vegas is not a Henderson neighborhood with a lake.
          </span>{" "}
          It is a separate resort community that happens to be inside the city
          limits, with its own economics, its own history including a
          bankruptcy, and its own relationship to the rest of the world. Evaluate
          it on its own terms or not at all.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            And right now, there are the roads.
          </span>{" "}
          Boulder Highway is being rebuilt through 2027 and I-215 is being
          widened through 2028. It will be better afterwards. It is not better
          now, and anyone selling you on the commute this year should be
          mentioning it.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* WHO IT'S FOR                                                      */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="verdict" heading="Who should look here, and who shouldn't">
        <p className="text-body-lg text-lvinit-warmgray">
          Look at Henderson if you want to compare genuinely different housing
          environments without leaving one city: established and grown-in against
          brand-new, valley floor against hillside, master plan against old main
          street. Almost nowhere else in Southern Nevada lets you do that inside
          one jurisdiction, and if you don&rsquo;t yet know what you want, that
          optionality is worth a lot.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Look here too if your life is anchored on the south or east side of the
          valley, if you want to be near the airport or the south Strip, if you
          want mature landscaping and don&rsquo;t need a new build, or if you
          specifically want elevation and a long view and are willing to drive
          for it.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Look elsewhere if your work or your people are on the west side of the
          valley. From Henderson, Summerlin and the northwest are a genuinely
          long trip, and no amount of liking a house fixes that.{" "}
          <Link href="/neighborhoods/summerlin" className={linkClass}>
            Summerlin
          </Link>{" "}
          is the answer if you want one coordinated plan and Red Rock at the back
          door.{" "}
          <Link href="/neighborhoods/southwest-las-vegas" className={linkClass}>
            Southwest Las Vegas
          </Link>{" "}
          is the answer if you want new construction with a shorter run to the
          airport and less interest in a master plan. And the{" "}
          <Link href="/neighborhoods/downtown-arts-district" className={linkClass}>
            Arts District
          </Link>{" "}
          is the answer if you want to walk out of your front door into
          something, which outside Water Street is not what Henderson does.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          And if you are looking here, do the thing this whole page has been
          asking you to do. Pick three parts of Henderson that sound different
          from each other, and drive all three on the same afternoon. Green
          Valley, then Inspirada, then Lake Las Vegas is the version I&rsquo;d
          suggest, in that order. You&rsquo;ll feel the whole argument in about
          two hours, and you&rsquo;ll know which Henderson you actually want.
          That&rsquo;s a much better question than whether you want Henderson.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* COMPARISONS                                                       */}
      {/* ---------------------------------------------------------------- */}

      <ComparisonBar
        id="vs-summerlin"
        heading="Henderson vs Summerlin"
        sides={["Henderson", "Summerlin"]}
        intro={
          <p className="text-body-lg text-lvinit-warmgray">
            The comparison people make most often, and the shakiest one, because
            these are not the same kind of thing.{" "}
            <span className="text-lvinit-black">
              Summerlin is one master-planned community with a single developer
              and one set of standards. Henderson is an incorporated city with
              many communities, many developers and a city council.
            </span>{" "}
            Comparing them means comparing a specific thing to an average of many
            things. Here&rsquo;s which way each dimension leans anyway, and why.
            No scores, because there isn&rsquo;t honest data to score these on.
          </p>
        }
        rows={summerlinComparison}
        footnote={
          <>
            The genuinely useful version of this comparison is Summerlin against{" "}
            <span className="text-lvinit-black">
              one specific Henderson community
            </span>
            : Summerlin against Green Valley, or against Anthem, or against
            Cadence. Those are apples to apples. &ldquo;Summerlin or
            Henderson&rdquo; usually turns out to mean &ldquo;west side or
            south-east side,&rdquo; which is really a question about where your
            work and your people are. The{" "}
            <Link href="/guides/summerlin-vs-henderson" className={linkClass}>
              full comparison guide
            </Link>{" "}
            goes through it properly, and the{" "}
            <Link href="/neighborhoods/summerlin" className={linkClass}>
              Summerlin guide
            </Link>{" "}
            is the other side in its own words.
          </>
        }
      />

      <StorySection id="vs-southwest" heading="Henderson vs Southwest Las Vegas">
        <p className="text-body-lg text-lvinit-warmgray">
          A less common comparison and a more useful one, because these two are
          closer to each other than either is to Summerlin. Both are large,
          loosely-defined areas on the southern half of the valley with a lot of
          new construction. The difference is structure.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <Link href="/neighborhoods/southwest-las-vegas" className={linkClass}>
            Southwest Las Vegas
          </Link>{" "}
          is an{" "}
          <span className="text-lvinit-black">informal name</span> for a stretch
          of unincorporated Clark County with no boundary at all, filled in by
          many separate builders. Henderson is the opposite: a real city with a
          surveyed line, its own government, and communities that were planned as
          communities. If you want to know exactly who governs your address and
          what the rules are, Henderson answers that and the Southwest
          genuinely can&rsquo;t.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Practically, the Southwest is closer to the airport and the south Strip
          from most points, and its new construction is scattered across infill
          parcels rather than concentrated in master plans. Henderson gives you
          more established housing to choose from, more coordinated communities,
          and, in West Henderson, an employment corridor the Southwest
          doesn&rsquo;t have an equivalent of. The two overlap geographically at
          St. Rose Parkway, which is why buyers so often end up looking at both
          without realizing they&rsquo;ve crossed a city line.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* VIDEO                                                             */}
      {/* ---------------------------------------------------------------- */}

      <AreaVideoSlot
        id="watch"
        heading="Summerlin, Henderson or Southwest?"
        intro="These three come up in almost every relocation conversation, and they're not three versions of the same thing. One is a master-planned community, one is a whole city, and one is an informal name for a stretch of county. This comparison walks through how differently they actually feel to live in."
        video={areaVideo}
        pendingNote="Filming now. The video lands on this page when it publishes."
      />

      {/* ---------------------------------------------------------------- */}
      {/* FAQ                                                               */}
      {/* ---------------------------------------------------------------- */}

      <AreaFAQ
        id="faq"
        heading="Henderson, answered"
        intro={
          <p className="text-body-lg text-lvinit-warmgray">
            The questions people actually type in, answered as precisely as the
            facts allow, which sometimes means answering &ldquo;it
            depends,&rdquo; and saying why.
          </p>
        }
        items={faqItems}
      />

      <Container className="pb-6">
        <p className="mx-auto max-w-[680px] text-caption text-lvinit-warmgray">
          The map on this page was built from the City of Henderson&rsquo;s own
          GIS boundary and OpenStreetMap road geometry. Development status
          (what&rsquo;s open, under construction, or only proposed) was checked on
          27 August 2026 and will change; check with the City of Henderson, the
          builders or the agency involved before planning around it.
        </p>
      </Container>

      <AreaSources checked="Checked 27 August 2026" sources={sources} />
    </StoryPage>
  );
}
