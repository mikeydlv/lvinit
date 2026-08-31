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
  communities,
  developmentProjects,
  summerlinComparison,
  areaVideo,
  faqItems,
  sources,
} from "@/lib/areas/southwest-las-vegas";

// ---------------------------------------------------------------------------
// SOUTHWEST LAS VEGAS — the first full LVINIT AREA GUIDE.
//
// This page is the prototype for the area-guide system: Summerlin, Henderson,
// Centennial Hills, Skye Canyon, Lake Las Vegas and North Las Vegas should be
// buildable from the same blocks without copying this file's prose. The blocks
// live in components/area/; the content lives in lib/areas/. Reuse the
// structure, not the storytelling — each area's guide should lead with whatever
// that area's actual story is.
//
// ROUTE: unchanged. This page already existed at /neighborhoods/southwest-las-vegas
// as a shorter editorial guide, and four other pages link to it (the $500K
// guide, both market-watch guides, and the Arts District guide) plus the
// homepage discovery list and the sitemap. It was rebuilt in place rather than
// forked to a new URL, so every inbound link and the canonical stay intact. The
// verified facts and the photography from the original are carried forward.
//
// STILL DELIBERATELY NOT in the neighborhoods[] array in lib/content.ts — same
// call as North Las Vegas. That array feeds the homepage Compare tool, which
// needs a median price, walk score, commute and school rating. None of those
// exist for an area with no defensible boundary, and inventing them is exactly
// what this page spends its length arguing against.
//
// PHOTOGRAPHY: all real, Mikey-owned frames from the 2026-07-16 Southwest shoot
// (~9:45–10:15am, Samsung, JPG-sourced). Honest midday July daylight, no
// golden-hour regrade. Global footer credit covers them — no per-image credit,
// and explicitly not the North Las Vegas licensed-image treatment.
//
// THE MAP is a generated asset, not a drawing: scripts/generate-area-map.mjs
// projects real WGS84 coordinates. See that file for the accuracy model and for
// why Enterprise and Spring Valley are labeled rather than outlined.
//
// FACTS: every claim is sourced. The fact-check log lives at the top of
// lib/areas/southwest-las-vegas.tsx — read it before editing any figure.
//
// FAIR HOUSING: no school ratings, no crime or safety claims, no demographic
// characterization of residents, no "great for families"-style steering. Fit is
// expressed through housing stock and location only.
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title: "Southwest Las Vegas: Neighborhoods, Map & Local Guide | LVINIT",
  headline: "Southwest Las Vegas",
  description:
    "Understand Southwest Las Vegas like a local: neighborhoods, a real map, where Enterprise fits, housing, development, and what the area actually feels like.",
  path: "/neighborhoods/southwest-las-vegas",
  image: "/images/hero/southwest-las-vegas-uncommons-street.webp",
  imageWidth: 2400,
  imageHeight: 1350,
  imageAlt:
    "A quiet street through the UnCommons mixed-use campus in southwest Las Vegas at mid-morning, with three- and four-story offices housing BDO and CBRE, young shade trees, and desert landscaping along the curb.",
  datePublished: "2026-07-16",
  dateModified: "2026-08-20",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Southwest Las Vegas", path: "/neighborhoods/southwest-las-vegas" },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

const linkClass =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

export default function SouthwestLasVegasPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Las Vegas Area Guide",
        headline: "Southwest Las Vegas",
        subheadline:
          "Not one neighborhood. Not one master plan. And that's what makes it interesting.",
        image: "/images/hero/southwest-las-vegas-uncommons-street.webp",
        imageAlt:
          "A quiet street through the UnCommons mixed-use campus in southwest Las Vegas at mid-morning, with three- and four-story offices housing BDO and CBRE, young shade trees, and desert landscaping along the curb.",
        backLink: { label: "Las Vegas neighborhoods", href: "/#neighborhoods" },
        ctas: [{ label: "See the map", href: "#map", variant: "tertiary" }],
      }}
      relatedStories={{
        heading: "Read these next",
        intro:
          "Southwest is the newer, more spread-out answer. If you're weighing it against somewhere with more of a center, or trying to work out what your money buys before you pick a side of town, start here.",
        columns: 3,
        stories: [
          {
            name: "Summerlin",
            href: "/neighborhoods/summerlin",
            category: "Area guide",
            dek: "The master-planned west side against Red Rock, the comparison most Southwest buyers are actually making.",
          },
          {
            name: "Henderson",
            href: "/neighborhoods/henderson",
            category: "Area guide",
            dek: "An incorporated city with the valley's widest range of communities, from new master plans to a historic downtown.",
          },
          {
            name: "What $500K Actually Buys in Las Vegas",
            href: "/guides/what-500k-buys-in-las-vegas",
            category: "Buyer guide",
            dek: "Three real homes at the same price, including a Southwest single-family with a pool, and the tradeoffs between them.",
          },
          {
            name: "Henderson vs. Southwest Las Vegas",
            href: "/guides/henderson-vs-southwest-las-vegas",
            category: "Comparison",
            dek: "A closer comparison than it looks: an incorporated city against an informal name for a stretch of county.",
          },
        ],
      }}
      ctas={{
        heading: "Thinking about Southwest?",
        body:
          "Tell me what you're looking for and what matters most about where you live. I'll point you toward the Southwest neighborhoods I'd start with, even if that means I'd tell you to look somewhere else.",
        buttons: [
          { label: "Ask Mikey about Southwest", href: "/contact", variant: "primary" },
          { label: "Help me compare areas", href: "/#compare", variant: "secondary" },
        ],
        footnote: (
          <>
            Weighing the west side instead?{" "}
            <Link
              href="/neighborhoods/summerlin"
              className="text-lvinit-blue underline underline-offset-4"
            >
              Read the Summerlin guide
            </Link>
            .
          </>
        ),
      }}
    >
      <AreaQuickFacts facts={quickFacts} id="orientation" />

      <StoryLede
        kicker="Las Vegas Area Guide"
        lead="Drive the southwest valley on a weekday morning and you'll notice the same thing I do: almost none of it looks old. The walls are still tan, the trees are still short, and every few blocks there's a corner that was dirt a couple of years ago and is now framing lumber. This is the part of Las Vegas that is still being finished."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          It&rsquo;s also the part people get most confused about, and the
          confusion starts with the name.{" "}
          <span className="text-lvinit-black">
            &ldquo;Southwest Las Vegas&rdquo; isn&rsquo;t a place any government
            recognizes.
          </span>{" "}
          It&rsquo;s shorthand for master-planned communities and 1990s
          subdivisions, larger-lot pockets and apartment corridors, finished
          streets and half-built ones, all sitting next to each other across a
          big piece of the valley. This guide is my attempt to tell you what
          locals actually mean by it, where the lines roughly fall, and what
          you&rsquo;d be signing up for.
        </p>
      </StoryLede>

      {/* ---------------------------------------------------------------- */}
      {/* THE MAP                                                           */}
      {/* ---------------------------------------------------------------- */}

      <LVINITMap
        id="map"
        heading="Southwest Las Vegas Map"
        question="Where exactly is Southwest Las Vegas?"
        src={mapAsset.src}
        alt={mapAsset.alt}
        width={mapAsset.width}
        height={mapAsset.height}
        intro={
          <>
            <p className="text-body-lg text-lvinit-warmgray">
              There isn&rsquo;t an official answer, so this is mine. The dashed
              outline is the area essentially everyone means when they say
              Southwest: roughly Russell Road down past Blue Diamond, and
              Hualapai across to about Decatur, with the 215 Beltway curving
              through the middle of it.
            </p>
            <p className="mt-5 text-body-lg text-lvinit-warmgray">
              The lighter dotted outline is the part people argue about:
              Southern Highlands down against I-15, and the overlap with Spring
              Valley up north. I&rsquo;ve drawn both because pretending there
              was one clean boundary would be the single most misleading thing
              this page could do.
            </p>
          </>
        }
        caption="Southwest Las Vegas, as locals generally use the term. A schematic diagram, accurate in its relationships, not a survey."
        places={mapPlaces}
        disclaimer={
          <>
            Both outlines are LVINIT&rsquo;s reading of how the term is used
            locally. Neither is a government boundary, and nobody should treat
            them as one. Enterprise and Spring Valley <em>are</em> real
            administrative areas with real Clark County boundaries, but because
            we haven&rsquo;t ingested the county&rsquo;s official land-use
            geometry, they&rsquo;re labeled on this map rather than outlined.
            Drawing them by hand would be inventing a legal line. For the actual
            boundaries, go to{" "}
            <a
              href="https://www.clarkcountynv.gov/government/departments/comprehensive_planning_department/divisions/advanced_planning_division/enterprise"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Clark County Comprehensive Planning
            </a>
            .
          </>
        }
      />

      {/* ---------------------------------------------------------------- */}
      {/* WHERE IS IT                                                       */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="where" heading="Where Southwest Las Vegas actually is">
        <p className="text-body-lg text-lvinit-warmgray">
          Start with the thing that saves people the most confusion. There is no
          city limit, no legal boundary, and no line on a county map that says
          where Southwest starts and stops. It&rsquo;s a term locals and agents
          use loosely, and two people using it can easily mean two different
          chunks of the valley. Nobody is going to correct you, because
          there&rsquo;s nothing to correct you against.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          It&rsquo;s mostly not in the City of Las Vegas
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Here&rsquo;s the part that actually matters when you&rsquo;re buying.
          Most of what people call Southwest Las Vegas isn&rsquo;t in the City of
          Las Vegas at all. It&rsquo;s{" "}
          <span className="text-lvinit-black">unincorporated Clark County</span>,
          falling mainly across the county towns of Enterprise and Spring Valley.
          Your mailing address says Las Vegas. Your jurisdiction, in most cases,
          doesn&rsquo;t. That decides who you call about a permit, a pothole or a
          code question. Worth knowing before you&rsquo;re annoyed about it.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          So what is Enterprise?
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Enterprise is the answer to a question people don&rsquo;t realize
          they&rsquo;re asking. It&rsquo;s an{" "}
          <a
            href="https://www.clarkcountynv.gov/government/departments/comprehensive_planning_department/divisions/advanced_planning_division/enterprise"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            unincorporated town administered by Clark County
          </a>
          , covering 42,950 acres, about 67 square miles. It is not a
          neighborhood. It has no character of its own, because it&rsquo;s far
          too big to have one: master plans, 1990s tracts, brand-new infill,
          horse property and apartment corridors are all &ldquo;in
          Enterprise.&rdquo;
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          So no, Enterprise and Southwest Las Vegas are not the same thing. They
          overlap heavily, since Enterprise covers most of what people call
          Southwest, but one is an administrative unit with real boundaries and the other
          is a name people use. Spring Valley, the other town in play, sits north
          of Enterprise and picks up the top end of what some people file under
          Southwest. If a listing tells you a home is in Enterprise, it has told
          you which town advisory board covers it and almost nothing else. Shop
          by subdivision.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          Where it sits against Summerlin and Henderson
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Summerlin is directly north, on the far west side of the valley against
          Red Rock. From much of the Southwest you get there by running up the
          beltway, and the two are closer than people assume. Henderson is
          southeast, a genuinely separate incorporated city with its own
          government, and a real drive from here across the bottom of the valley.
          Southwest sits between them geographically and, in a lot of ways,
          culturally too.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          The 215 is the whole reason it works
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          If you take one practical thing from this guide, take this one. The
          beltway is the spine the entire Southwest hangs off. It curves through
          the area and connects you north toward Summerlin and east toward
          Henderson and the airport without putting you on surface streets for
          forty minutes. A lot of people move here for exactly that and nothing
          else.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          A technicality worth knowing, because people get it wrong: on this side
          of town it&rsquo;s{" "}
          <span className="text-lvinit-black">CC-215</span>, the county-maintained
          Bruce Woodbury Beltway. The Interstate 215 designation only applies east
          of I-15. Same road in your head, different sign, and it explains why
          you&rsquo;ll see both written down. Blue Diamond Road is SR-160, the
          other one people ask about. It&rsquo;s the diagonal that leaves I-15
          heading west toward Pahrump and cuts across the grid.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          Which parts are closest to the Strip and the airport
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          The eastern edge (anything close to I-15, which in practice means the
          Silverado Ranch and Southern Highlands side) is nearest to both the
          south Strip and Harry Reid International. From the Durango corridor
          you&rsquo;re taking the beltway east instead, which is still an easy
          run. The far southwest corner around Mountain&rsquo;s Edge is the
          longest trip of the three, and it&rsquo;s the tradeoff you make for
          being out on the desert edge.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          I&rsquo;m not going to hand you drive times in minutes, and be
          suspicious of any page that does.{" "}
          <span className="text-lvinit-black">
            &ldquo;Southwest&rdquo; is far too large for a single number to mean
            anything
          </span>
          : a home off Blue Diamond and a home at Durango and the 215
          aren&rsquo;t the same trip, and the answer swings with the hour, the
          direction and whichever ramp is currently torn up. Drive it yourself at
          the hour you&rsquo;d actually be driving it. That&rsquo;s the only test
          that means anything.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* THE LOCAL'S NOTE                                                  */}
      {/* ---------------------------------------------------------------- */}

      <LocalsNote id="locals-note">
        <p className="text-body-lg text-lvinit-black">
          Southwest can change surprisingly fast from one intersection to the
          next. You can have a newer gated subdivision, a large-lot home that
          feels almost rural, an apartment block, a good restaurant and several
          acres of raw dirt within a few minutes of each other.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">That empty land matters.</span> If
          you&rsquo;re buying out here, treat the vacant parcels near the house
          as part of the house. Find out what&rsquo;s zoned for them. Look at
          what the county has in design for the roads around you. The Southwest
          has several corridor projects running right now, and the quiet street
          you viewed on a Sunday may be a construction route next spring. Check
          whether the view you&rsquo;re paying for is protected by anything other
          than the fact that nobody has built there yet.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          I&rsquo;m not going to tell you what any of that does to your home
          value, because I don&rsquo;t know and neither does anyone else selling
          you a prediction. What I will tell you is that in an area still being
          assembled, today&rsquo;s view and today&rsquo;s traffic pattern are the
          least reliable things about it. Ask the questions before you&rsquo;re
          in escrow, not after the grading equipment shows up.
        </p>
      </LocalsNote>

      {/* ---------------------------------------------------------------- */}
      {/* IT ISN'T ONE THING                                                */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="subareas" heading="Southwest isn't one thing">
        <p className="text-body-lg text-lvinit-warmgray">
          People talk about &ldquo;the Southwest&rdquo; as one lifestyle the way
          they talk about North Las Vegas as one lifestyle, and they&rsquo;re
          wrong both times. It&rsquo;s at least five or six different
          propositions sharing a name. These groupings are rough (the edges
          blur, and locals wouldn&rsquo;t all draw them the same way) but
          they&rsquo;re a lot closer to how the area actually behaves than
          treating it as a single block.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          The Durango + 215 corridor
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          The densest, newest, most commercial part of the Southwest, and the
          only part with anything resembling a center. UnCommons and Durango
          Casino &amp; Resort sit either side of the freeway, with IKEA, The Bend
          and a growing stack of apartments around them. Offices, restaurants and
          a plaza people actually sit in, plus a great deal of ongoing
          construction.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          Mountain&rsquo;s Edge and the far southwest
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Master-planned suburban development out at the desert edge, organized
          around parks and trails. Newer housing, a lot of it, and open ground on
          two sides. This is the part that feels furthest from the rest of the
          city, which is either the appeal or the objection depending on who you
          are.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          Rhodes Ranch and the western Southwest
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Golf-centerd, guard-gated, and older than most of what surrounds it,
          which means the landscaping has actually grown in. Strong beltway
          access, a more finished feel, and a clear boundary between inside the
          gate and outside it.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          Nevada Trails and central Enterprise
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          The most mixed part of the area, and the best illustration of the whole
          point of this section. Established early-2000s subdivisions, newer
          infill squeezed between them, and larger-lot pockets that feel almost
          semi-rural. The housing character can change completely inside half a
          mile.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          Southern Highlands
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          A distinct master plan with its own identity at the very bottom of the
          valley. Its access patterns are shaped by I-15 and the southern edge
          rather than by the beltway, which is why daily life there points a
          different direction from the rest of the Southwest, and why some
          people don&rsquo;t count it as Southwest at all.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          And Enterprise across all of it
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          Worth repeating because it trips everyone up: Enterprise isn&rsquo;t
          one of these areas, it&rsquo;s the county town most of them sit inside.
          Sixty-seven square miles of it. When a listing says Enterprise, it
          isn&rsquo;t describing a neighborhood. It&rsquo;s describing
          jurisdiction.
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/southwest-las-vegas-uncommons-office-street.webp",
            alt: "A mid-morning street at the UnCommons campus in southwest Las Vegas, with a four-story office building signed for Morgan Stanley and Las Vegas Sotheby's International Realty, parked cars, and young trees casting shadows across the asphalt.",
            caption:
              "Offices at UnCommons. The southwest has quietly become a place people work, not just sleep.",
          },
        ]}
      />

      {/* ---------------------------------------------------------------- */}
      {/* WHAT IT FEELS LIKE                                                */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="feel" heading="What it actually feels like to drive">
        <p className="text-body-lg text-lvinit-warmgray">
          Here&rsquo;s what you notice in the first hour, in roughly the order
          you notice it.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            The neighborhoods change faster than you expect.
          </span>{" "}
          A polished gated entrance, then an arterial, then a strip center, then
          a field. Then another gated entrance that looks nothing like the first
          one. Master-planned stretches read as coherent: matching walls,
          consistent landscaping, a plan you can feel. The non-master-planned
          stretches in between read as a series of independent decisions, because
          that&rsquo;s exactly what they are.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            Old and new sit right next to each other.
          </span>{" "}
          A 1990s street with grown trees can be across the road from something
          finished last year with saplings staked against the wind. Housing age
          out here isn&rsquo;t a gradient from the middle of town outward. It
          jumps around, and so does what your money buys.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            The unfinished parcels are everywhere.
          </span>{" "}
          Newer retail facing raw desert. A sidewalk that stops. A beautiful
          street that ends at a wall. None of that is decline. It&rsquo;s an
          area mid-build, but if half-built horizons would wear on you, you
          should know that going in.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            The apartments cluster, and the big lots hide.
          </span>{" "}
          Multifamily concentrates along the arterials, especially around Durango
          and the beltway. Meanwhile, tucked off the main roads, there are
          pockets of genuinely large lots (some with room for a horse) that
          feel almost rural despite being ten minutes from a freeway. Both are
          normal here. Neither is what the drone footage shows you.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">And you will drive. All of it.</span>{" "}
          The street grid is wide and fast, the blocks are long, and the distance
          between a house and anything useful is measured in miles. That&rsquo;s
          my read from driving it, not a statistic. I&rsquo;m not going to quote
          you a walkability score I can&rsquo;t stand behind. RTC buses do run
          the main corridors; the Rainbow and Durango routes exist and people use
          them. But the area was planned around driveways, and it shows. If
          you&rsquo;re coming from somewhere you didn&rsquo;t need a car, this
          will be the adjustment, and a bigger one than the heat.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The exception is the Durango corridor, where UnCommons and The Bend
          have built a couple of blocks you genuinely walk around once
          you&rsquo;ve parked. It works. It&rsquo;s also about the size of a
          couple of city blocks in an area of tens of square miles, and
          I&rsquo;d be selling you something if I implied otherwise.
        </p>
      </StorySection>

      <StoryPullQuote>
        The southwest wasn&rsquo;t designed to be walked. It was designed to be
        driven, quickly, and it&rsquo;s honest enough not to pretend otherwise.
      </StoryPullQuote>

      <StoryGallery
        images={[
          {
            src: "/images/features/southwest-las-vegas-uncommons-paseo.webp",
            alt: "A shaded concrete walkway between apartment buildings at UnCommons in southwest Las Vegas, with low concrete seating walls, desert grasses, young trees, and parked cars visible at the far end.",
            caption:
              "The paseo at UnCommons: shade, benches, and somewhere to walk. It works, and it's about the size of a city block.",
          },
          {
            src: "/images/features/southwest-las-vegas-uncommons-vestra-apartments.webp",
            alt: "The four-story Vestra apartment building at UnCommons in southwest Las Vegas, with balconies, ground-floor retail bays, a leasing entrance, and cars parked along the street on a clear July morning.",
            caption:
              "Vestra at UnCommons, apartments over ground-floor retail, still a rare shape of building out here.",
          },
        ]}
      />

      {/* ---------------------------------------------------------------- */}
      {/* COMMUNITIES                                                       */}
      {/* ---------------------------------------------------------------- */}

      <AreaCommunities
        id="communities"
        heading="Communities and neighborhoods"
        intro={
          <p className="text-body-lg text-lvinit-warmgray">
            The names you&rsquo;ll hear on repeat, and what actually separates
            them. This is not a complete list, because the Southwest is a patchwork
            of far more builder tracts than it has famous names, but if someone is
            describing where they live out here, it&rsquo;s probably one of
            these.
          </p>
        }
        communities={communities}
        footnote={
          <>
            Each of these will get its own full guide over time. Until a
            guide&rsquo;s actually written, the name stays plain text rather than
            a link. No dead ends.
          </>
        }
      />

      {/* ---------------------------------------------------------------- */}
      {/* DEVELOPMENT WATCH                                                 */}
      {/* ---------------------------------------------------------------- */}

      <DevelopmentWatch
        id="development"
        heading="Southwest Development Watch"
        updated="Updated August 2026"
        intro={
          <p className="text-body-lg text-lvinit-warmgray">
            The Southwest changes faster than any page can keep up with, and most
            of what you&rsquo;ll find searching for it is two years stale.
            Here&rsquo;s where things actually stand, split by what&rsquo;s
            genuinely open, what&rsquo;s genuinely being built, and what&rsquo;s
            only been announced. Every status below is sourced, and if I
            couldn&rsquo;t verify which of the three a project was in, it
            isn&rsquo;t here.
          </p>
        }
        projects={developmentProjects}
        footnote={
          <>
            Clark County has further roadwork in construction across this side of
            the valley, including the Warm Springs Road corridor, the CC-215
            frontage road between Sunset and Decatur, and the South Beltway
            widening from Decatur to I-15. The county&rsquo;s{" "}
            <a
              href="https://www.clarkcountynv.gov/government/departments/public_works_department/projects-in-construction"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              projects-in-construction list
            </a>{" "}
            is the live version and is worth a look before you commit to a
            commute. Statuses here were checked on 20 August 2026 and will move.
            Check with the developer or the county before planning around any of
            them.
          </>
        }
      />

      {/* ---------------------------------------------------------------- */}
      {/* HOUSING                                                           */}
      {/* ---------------------------------------------------------------- */}

      <StorySection id="housing" heading="What the housing is actually like">
        <p className="text-body-lg text-lvinit-warmgray">
          The dominant product is a newer single-family home, often behind a
          gate, in a subdivision built by one builder over a short window. But
          the range around that is wider than the reputation suggests, and the
          differences are worth knowing before you start looking.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">Master-planned versus not.</span>{" "}
          Inside a master plan (Mountain&rsquo;s Edge, Southern Highlands,
          Rhodes Ranch) you get consistency: coordinated landscaping, planned
          parks, a general design logic. Outside one, you get whatever each
          builder did on each parcel, which can mean more variety and sometimes
          more house for the money, with less of a plan around it.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">Resale versus new build.</span>{" "}
          Both are genuinely available here, which isn&rsquo;t true everywhere in
          the valley. Resale in the Southwest often means an early-2000s home
          with a grown yard on a finished street. New build means the current
          spec, the current warranty, and living beside a construction site for a
          while. There&rsquo;s no right answer, but they&rsquo;re different
          purchases.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">Gates, golf, and everything else.</span>{" "}
          Guard-gated and self-gated communities are common, and two golf-centerd
          master plans (Rhodes Ranch with a public course, Southern Highlands
          with a private one) anchor their own housing markets. Townhomes and
          condos exist in meaningful numbers, mostly nearer the arterials.
          Apartments concentrate along Durango and the beltway. And in scattered
          pockets there are genuinely large lots, occasionally with horse
          privileges, that don&rsquo;t look like anything else out here.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          <span className="text-lvinit-black">
            HOAs and housing age vary enormously. Check both, per address.
          </span>{" "}
          There is no such thing as &ldquo;the Southwest HOA situation.&rdquo;
          Some communities have a master association plus a sub-association; some
          have essentially nothing. Housing age jumps from the mid-1990s to this
          year within a few blocks. Those two facts do more to determine what
          living somewhere out here is like than the area name does.
        </p>

        <h3 className="mt-10 font-display text-subhead font-bold text-lvinit-black">
          On prices, and why there isn&rsquo;t a number here
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          I&rsquo;m not going to publish an &ldquo;average Southwest Las Vegas
          home price,&rdquo; and I&rsquo;d be careful with anyone who does.
          You&rsquo;ve just read a thousand words explaining that this area has
          no agreed boundary, which means any median quoted for it depends
          entirely on where the person calculating it decided to draw the line.
          Include Southern Highlands and it moves. Include the Spring Valley
          overlap and it moves again. Nobody publishes a defensible Southwest
          submarket median, because there isn&rsquo;t a defensible submarket.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          What does exist is the valley-wide figure, and I keep that current in
          the{" "}
          <Link href="/guides/las-vegas-home-prices-july-2026" className={linkClass}>
            monthly market read
          </Link>
          . For what a specific budget actually gets you, including a real
          Southwest home, the{" "}
          <Link href="/guides/what-500k-buys-in-las-vegas" className={linkClass}>
            $500K walkthrough
          </Link>{" "}
          is more useful than any average would be. Real pricing here is a
          conversation against{" "}
          <Link href="/search" className={linkClass}>
            current listings
          </Link>
          , not a page like this.
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/southwest-las-vegas-the-bend-storefronts.webp",
            alt: "The sidewalk along a row of storefronts at The Bend in southwest Las Vegas, with St. Felix and Freed's signage, planted trellises against a stucco wall, trimmed hedges, parked trucks, and desert hills on the horizon.",
            caption:
              "The Bend at Sunset and Durango: good storefronts, wide sidewalk, and a parking lot you arrive in.",
          },
        ]}
      />

      {/* ---------------------------------------------------------------- */}
      {/* COMPARISONS                                                       */}
      {/* ---------------------------------------------------------------- */}

      <ComparisonBar
        id="vs-summerlin"
        heading="Southwest vs Summerlin"
        sides={["Southwest", "Summerlin"]}
        intro={
          <p className="text-body-lg text-lvinit-warmgray">
            This is the comparison most people are actually making, so let&rsquo;s
            do it properly. No scores, because there isn&rsquo;t honest data to
            score these on. Just which way each dimension leans and why.
          </p>
        }
        rows={summerlinComparison}
        footnote={
          <>
            The short version: Summerlin is one plan executed over decades and
            you can feel the plan. The Southwest is many separate developments
            that filled the same area over the same period, next to each other
            rather than with each other. You trade cohesion and a center for
            newer housing, more variety, and frequently more square footage.
            The{" "}
            <Link href="/neighborhoods/summerlin" className={linkClass}>
              Summerlin guide
            </Link>{" "}
            is the honest version of the other side.
          </>
        }
      />

      <StorySection id="vs-henderson" heading="Southwest vs Henderson">
        <p className="text-body-lg text-lvinit-warmgray">
          This one is less a comparison than a category error, and it&rsquo;s
          worth naming.{" "}
          <span className="text-lvinit-black">
            Henderson is an incorporated city.
          </span>{" "}
          It has its own government, its own police, its own parks department and
          its own rules, and it contains an enormous range of very different
          places, from new master plans to a historic downtown to hillside
          estates to lake communities. Reducing it to one lifestyle is as wrong
          as reducing the Southwest to one.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The Southwest is an informal name for a stretch of unincorporated
          county. So the real difference isn&rsquo;t vibe, it&rsquo;s structure:
          in Henderson you&rsquo;re a resident of a city that answers to you; in
          most of the Southwest you&rsquo;re a resident of Clark County. If
          separate-municipality matters to you (and for some people it genuinely
          does) that&rsquo;s a real distinction rather than a marketing one.
          Geographically they&rsquo;re at opposite ends of the valley&rsquo;s
          southern edge, so the practical question is usually just which side
          your work and your people are on.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The full{" "}
          <Link href="/neighborhoods/henderson" className={linkClass}>
            Henderson guide
          </Link>{" "}
          breaks the city down community by community, which is the only useful
          way to think about it, and the full{" "}
          <Link href="/guides/henderson-vs-southwest-las-vegas" className={linkClass}>
            Henderson vs. Southwest Las Vegas comparison
          </Link>{" "}
          goes through this pairing properly.
        </p>
      </StorySection>

      {/* ---------------------------------------------------------------- */}
      {/* VIDEO                                                             */}
      {/* ---------------------------------------------------------------- */}

      <AreaVideoSlot
        id="watch"
        heading="Not sure which side of the valley fits you?"
        intro="Summerlin, Henderson and Southwest can all work for someone moving to Las Vegas, but for very different reasons. This comparison breaks down how the three areas actually differ once you get beyond the house itself."
        video={areaVideo}
        pendingNote="Filming now. The video lands on this page when it publishes."
      />

      {/* ---------------------------------------------------------------- */}
      {/* FAQ                                                               */}
      {/* ---------------------------------------------------------------- */}

      <AreaFAQ
        id="faq"
        heading="Southwest Las Vegas, answered"
        intro={
          <p className="text-body-lg text-lvinit-warmgray">
            The questions people actually type in, answered as precisely as the
            facts allow, which sometimes means answering &ldquo;it
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
          Look here if a newer home matters to you, if the beltway solves your
          commute, if you&rsquo;re relaxed about driving, and if you&rsquo;d
          rather have more house than more character. That&rsquo;s a completely
          reasonable set of priorities, and the Southwest serves it better than
          almost anywhere else in the valley right now.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Look elsewhere if you want to walk places, if you want a neighborhood
          with a history and a center, or if construction noise and half-built
          horizons would grind on you. The{" "}
          <Link href="/neighborhoods/downtown-arts-district" className={linkClass}>
            Arts District
          </Link>{" "}
          is the opposite instinct entirely, and{" "}
          <Link href="/neighborhoods/summerlin" className={linkClass}>
            Summerlin
          </Link>{" "}
          is the polished version of the same suburban idea.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          My actual advice, and it costs nothing: pick a Tuesday, drive Durango
          from Blue Diamond up to the 215, then cut across Warm Springs, and do
          it at the hour you&rsquo;d really be commuting. You&rsquo;ll know within
          twenty minutes whether this is your side of town. It&rsquo;s a place
          that reveals itself from the driver&rsquo;s seat, which is fitting,
          because that&rsquo;s where you&rsquo;d be living.
        </p>
      </StorySection>

      <Container className="pb-6">
        <p className="mx-auto max-w-[680px] text-caption text-lvinit-warmgray">
          Photographed in southwest Las Vegas on 16 July 2026. Development status
          (what&rsquo;s open, under construction, or only announced) was
          checked on 20 August 2026 and will change; check with the developers or
          Clark County before planning around it.
        </p>
      </Container>

      <AreaSources checked="Checked 20 August 2026" sources={sources} />
    </StoryPage>
  );
}
