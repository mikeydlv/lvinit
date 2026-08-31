import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryPullQuote,
  StoryVideo,
} from "@/components/story";

// ---------------------------------------------------------------------------
// COMPARISON GUIDE — Henderson vs. Southwest Las Vegas.
//
// Built by the autonomous scheduled editorial-publishing routine (topic
// selection: no fresh, corroborated breaking story cleared the 24-72h bar on
// this run, so the routine identified this genuine content-cluster gap
// instead — LVINIT had a Summerlin vs. Henderson comparison but nothing
// pairing the other two live pillar guides).
//
// FACT DISCIPLINE (read before editing):
// - This is a pure synthesis piece. Every specific claim below already exists,
//   sourced, on the two live pillar guides — app/neighborhoods/henderson and
//   app/neighborhoods/southwest-las-vegas — including their own existing
//   "Henderson vs Southwest" / "Southwest vs Henderson" StorySections. Nothing
//   new is asserted about either place, and no number appears here that isn't
//   already published on one of those two pages (there are almost none —
//   both guides deliberately publish no defensible median price for their
//   area, and neither asserts a commute-minutes figure, for reasons explained
//   on each page; this piece follows the same discipline rather than
//   inventing a number "for balance").
// - Mirrors the structure and honesty of /guides/summerlin-vs-henderson: no
//   score, no winner, an explicit "where each one falls short" beat, and a
//   pull quote that's original synthesis language (not a fact) rather than a
//   fabricated claim.
//
// IMAGE — updated 2026-08-31 at Mikey's explicit direction. He supplied
// hero/las-vegas-valley-lake-neighborhood-strip-skyline-aerial-drone.webp
// directly in chat. FLAGGED, not blocked: the source filename he was working
// from ("stripview-the-lakes-flyover") suggests this drone still is actually
// The Lakes, a west-valley lake/canal community unrelated to Henderson or
// Southwest Las Vegas — not a shot of either place this article compares.
// Per CLAUDE.md ("never use mismatched photography to represent a different
// place"), the alt text below is written to describe only what's verifiably
// in the frame (a lake-neighborhood aerial with the Strip on the horizon) and
// does NOT claim it depicts Henderson or Southwest. If this isn't the shot
// Mikey meant, swap it — the generated editorial cover this replaced is still
// at public/images/covers/henderson-vs-southwest-las-vegas-editorial-cover.webp.
//
// VIDEO — added 2026-08-31 at Mikey's request: a "Which area fits you best?"
// section right after the lede, embedding youtube.com/watch?v=ZAU9hPQ_1Hk via
// the existing click-to-play StoryVideoFacade (poster until clicked, then
// autoplay from 0:00 — no page-load autoplay). The poster is Mikey's own
// thumbnail, supplied directly in chat, showing the video is actually a
// three-way Summerlin/Henderson/Southwest comparison, not Henderson/Southwest
// only — the intro copy says so rather than implying a narrower scope. No
// VideoObject JSON-LD is added: this session could not independently verify
// the video's real upload date (YouTube's page wasn't fetchable and oEmbed
// was blocked), and StoryVideoMeta.uploadDate must be real, never guessed.
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title:
    "Henderson vs. Southwest Las Vegas: Where Should You Actually Move? | LVINIT",
  headline: "Henderson vs. Southwest Las Vegas: Where Should You Actually Move?",
  description:
    "An honest comparison of Henderson and Southwest Las Vegas: an incorporated city with a huge range of communities against an informal, still-forming growth corridor with no legal boundary.",
  path: "/guides/henderson-vs-southwest-las-vegas",
  image: "/images/hero/las-vegas-valley-lake-neighborhood-strip-skyline-aerial-drone.webp",
  imageWidth: 1892,
  imageHeight: 1027,
  imageAlt:
    "Aerial drone view over a Las Vegas valley lake-and-canal neighborhood at dusk, the Strip skyline visible on the horizon.",
  datePublished: "2026-08-31",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    {
      name: "Henderson vs. Southwest Las Vegas",
      path: "/guides/henderson-vs-southwest-las-vegas",
    },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

export default function HendersonVsSouthwestLasVegasPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Comparisons",
        headline: "Henderson vs. Southwest Las Vegas: Where Should You Actually Move?",
        subheadline:
          "Both get recommended to people relocating here, and for almost opposite reasons. Here's the honest side-by-side of an incorporated city against an informal, still-forming growth corridor.",
        image:
          "/images/hero/las-vegas-valley-lake-neighborhood-strip-skyline-aerial-drone.webp",
        imageAlt:
          "Aerial drone view over a Las Vegas valley lake-and-canal neighborhood at dusk, the Strip skyline visible on the horizon.",
        backLink: { label: "LVINIT", href: "/" },
      }}
      relatedStories={{
        heading: "Go deeper",
        intro:
          "This piece is the short version. Both full guides go further into what daily life actually looks like in each place, and the Summerlin comparison rounds out the three-way picture.",
        stories: [
          {
            name: "Henderson",
            href: "/neighborhoods/henderson",
            category: "Area guide",
            dek: "The full pillar guide: the real city boundary, its five very different regions, and what's being built right now.",
          },
          {
            name: "Southwest Las Vegas",
            href: "/neighborhoods/southwest-las-vegas",
            category: "Area guide",
            dek: "The full pillar guide: no boundary, no city hall, and the valley's fastest-growing stretch of county.",
          },
          {
            name: "Summerlin vs. Henderson",
            href: "/guides/summerlin-vs-henderson",
            category: "Comparison",
            dek: "The other half of the picture: a single master-planned community against the same whole city.",
          },
        ],
      }}
      ctas={{
        heading: "Trying to choose between Henderson and Southwest?",
        body:
          "Tell me what you're weighing (commute, budget, how finished a street you want to live on) and I'll give you the unfiltered version for your specific situation, not a sales pitch for either one.",
        footnote: (
          <>
            Comparing the west side instead? The{" "}
            <Link href="/guides/summerlin-vs-henderson" className="text-lvinit-blue underline underline-offset-4">
              Summerlin vs. Henderson guide
            </Link>{" "}
            covers that pairing.
          </>
        ),
      }}
    >
      <StoryLede
        kicker="Comparisons"
        lead="Henderson and Southwest Las Vegas both come up constantly when someone tells me they want new construction and a settled place to land, and people rarely weigh them against each other on purpose. They fall into one or the other because a listing caught their eye or a friend already lives there. That's a shame, because the two are closer to each other than either is to Summerlin, and the real difference between them isn't vibe. It's structure."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Full disclosure up front, same as always: I&rsquo;m not handing you a
          score and a winner. What I can do is walk through the real
          differences (read the{" "}
          <Link href="/neighborhoods/henderson" className={linkCls}>
            full Henderson guide
          </Link>{" "}
          and the{" "}
          <Link href="/neighborhoods/southwest-las-vegas" className={linkCls}>
            full Southwest guide
          </Link>{" "}
          for the long version of each) and let you match them to your own
          life instead of mine.
        </p>
      </StoryLede>

      <StoryVideo
        id="which-fits-you"
        heading="Which area fits you best?"
        intro="I put this same question on camera, with Summerlin thrown into the mix too, if you'd rather watch it than read it."
        youtubeId="ZAU9hPQ_1Hk"
        title="Summerlin vs. Henderson vs. Southwest Las Vegas — Where Would You Live?"
        poster="/images/video-summerlin-henderson-southwest-where-would-you-live.webp"
      />

      <StorySection heading="A city that answers to you vs. a name everyone uses">
        <p className="text-body-lg text-lvinit-warmgray">
          Start with the one fact that actually decides everything else.
          Henderson is an incorporated city, Nevada&rsquo;s second largest,
          with its own mayor, council, police and fire departments and its own
          parks department and zoning. When something goes wrong with a road,
          a permit or a code question inside the city limits, you call
          Henderson. It has a real, surveyed boundary you can look up.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          &ldquo;Southwest Las Vegas&rdquo; isn&rsquo;t a place any government
          recognizes. There is no city limit, no legal boundary, and no line
          on a county map that says where it starts and stops. It&rsquo;s
          shorthand locals and agents use loosely for a stretch of
          overwhelmingly unincorporated Clark County (mainly the towns of
          Enterprise and Spring Valley), filled in by many separate builders
          rather than planned as one thing. Two people using the term can
          mean two different chunks of the valley, and nobody is going to
          correct you, because there&rsquo;s nothing to correct you against.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That&rsquo;s the real distinction: in Henderson you&rsquo;re a
          resident of a city that answers to you. In most of the Southwest
          you&rsquo;re a resident of Clark County, and &ldquo;Southwest&rdquo;
          describes a general direction, not a jurisdiction. If knowing
          exactly who governs your address and what the rules are matters to
          you, Henderson can answer that in a way the Southwest genuinely
          can&rsquo;t.
        </p>
      </StorySection>

      <StorySection heading="Location, and why neither guide will hand you a drive time">
        <p className="text-body-lg text-lvinit-warmgray">
          Both full guides refuse to publish a single commute figure for their
          area, and for the same underlying reason: both areas are too large
          and too varied for one number to mean anything. Henderson spans
          about seventeen miles east to west, so a Green Valley address and a
          Lake Las Vegas address don&rsquo;t drive the same trip. The
          Southwest has no boundary at all, so a home off Blue Diamond and a
          home at Durango and the 215 aren&rsquo;t the same trip either. If a
          page hands you minutes, be suspicious of it. This one isn&rsquo;t
          going to.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          What is fair to say: the Southwest tends to run closer to the
          airport and the south Strip from most of its points, with its new
          construction scattered across infill parcels rather than
          concentrated the way a master plan concentrates it. Henderson
          gives you more established housing to choose from and, in West
          Henderson, an employment corridor the Southwest doesn&rsquo;t have
          an equivalent of. The two genuinely overlap geographically around
          St. Rose Parkway, which is why buyers so often end up cross-shopping
          both without realizing they&rsquo;ve crossed a city line. The 215
          beltway is the reason either side works at all: it&rsquo;s the
          spine the Southwest hangs off, and it&rsquo;s also the road that
          connects Henderson north toward Summerlin and the Southwest and east
          toward the airport.
        </p>
      </StorySection>

      <StoryPullQuote>
        One has a mayor. The other has a name everyone uses and no one can
        define.
      </StoryPullQuote>

      <StorySection heading="Housing stock and community character">
        <p className="text-body-lg text-lvinit-warmgray">
          Henderson&rsquo;s housing stock spans a genuinely wide range,
          because the city is a jurisdiction, not a product: the established,
          mature-tree-canopy resale of Green Valley; brand-new construction in
          Inspirada and Cadence; guard-gated custom hillside estates at
          MacDonald Highlands and Ascaya; a resort lake community at Lake Las
          Vegas; and a historic downtown at Water Street that predates all of
          it. That range exists because Henderson has had decades, and
          several different developers, to fill it in.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The Southwest&rsquo;s dominant product is a newer single-family
          home, often behind a gate, built by one builder over a short
          window &mdash; but the range around that is wider than the
          reputation suggests. Inside a master plan (Mountain&rsquo;s Edge,
          Southern Highlands, Rhodes Ranch) you get the coordinated
          consistency Henderson&rsquo;s newer communities also offer. Outside
          one, in stretches like Nevada Trails and central Enterprise, you get
          whatever each builder did on each parcel: more variety, sometimes
          more house for the money, with a lot less of a plan holding it
          together. Both resale and new build are genuinely available in both
          places, which isn&rsquo;t true everywhere in the valley.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Neither guide publishes an average price for its area, and for the
          same reason: Henderson&rsquo;s range (age-restricted condos to
          hillside homesites) makes a single median meaningless, and the
          Southwest has no agreed boundary to calculate one against in the
          first place. If a page hands you a submarket median for either
          area, that&rsquo;s worth asking where the line was drawn.
        </p>
      </StorySection>

      <StorySection heading="Who each one actually suits">
        <p className="text-body-lg text-lvinit-warmgray">
          Henderson suits people who want to compare genuinely different
          housing environments without leaving one city: established and
          grown-in against brand-new, valley floor against hillside, master
          plan against old main street. It also suits anyone whose life is
          anchored on the south or east side of the valley, who wants to be
          near the airport or the south Strip, who wants mature landscaping
          without needing a new build, or who specifically wants elevation
          and a long view and is willing to drive for it.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The Southwest suits people for whom a newer home matters more than
          an established one, who are relaxed about driving everywhere (the
          area was planned around driveways, not sidewalks), and who&rsquo;d
          rather have more house than more character or a walkable center. Its
          new construction and beltway access make it a reasonable answer for
          the same broad relocation profile Henderson often gets recommended
          to, just with newer streets and less institutional history behind
          them.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Neither is the fit if you want a genuinely walkable, historic
          center: Henderson has one small pocket of that at Water Street and
          The District at Green Valley Ranch; the Southwest has one at
          UnCommons and The Bend, and both are described on their own guides
          as pockets, not properties of the whole place.
        </p>
      </StorySection>

      <StorySection muted heading="Where each one falls short">
        <p className="text-body-lg text-lvinit-warmgray">
          Neither of these is the right move for everyone, and I&rsquo;d
          rather tell you that now than after you&rsquo;ve signed.
          Henderson&rsquo;s honest downside is the flip side of its biggest
          strength: the range that makes it flexible also makes
          &ldquo;Henderson&rdquo; a genuinely confusing answer until
          you&rsquo;ve picked a corner, some of that corner (the southern
          hillsides, Lake Las Vegas) adds real driving time to everything, and
          two major road projects (Boulder Highway through 2027, I-215
          widening through 2028) are dug into the city right now.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The Southwest&rsquo;s honest downsides: there&rsquo;s no legal
          boundary to hold anyone accountable to, which also means no
          defensible submarket data exists for it; HOA structure and housing
          age vary enormously street to street, with no such thing as
          &ldquo;the Southwest HOA situation&rdquo;; and it is, honestly,
          still being built &mdash; unfinished parcels, a sidewalk that stops,
          a beautiful street that ends at a wall. None of that is decline, but
          if half-built horizons and years of nearby construction would wear
          on you, it&rsquo;s worth knowing going in, the same way
          Henderson&rsquo;s growth areas (Inspirada, Cadence, West Henderson)
          come with their own construction-adjacent years.
        </p>
      </StorySection>

      <StorySection heading="So, which one actually wins?">
        <p className="text-body-lg text-lvinit-warmgray">
          Neither, and that&rsquo;s a real answer, not a dodge. If you want
          the option to compare genuinely different kinds of housing inside
          one jurisdiction, with an actual city government behind your
          address, Henderson gives you room the Southwest doesn&rsquo;t have.
          If you want newer construction, don&rsquo;t mind driving, and would
          rather not pay for decades of institutional history you won&rsquo;t
          use, the Southwest is very hard to beat on that specific trade.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The question worth answering isn&rsquo;t which one is objectively
          better. It&rsquo;s whether you want a place with a government behind
          it or a place that&rsquo;s still being written, and which side of
          St. Rose Parkway your actual daily life points toward. For that, the
          honest next step is usually a conversation, not another list. Tell
          me your budget, your commute, and what a good Tuesday looks like to
          you, and I&rsquo;ll tell you straight which side of the valley
          actually fits.
        </p>
      </StorySection>

      <StorySection heading="About this coverage">
        <p className="text-body text-lvinit-warmgray">
          Mikey Del Rosario · Las Vegas Real Estate Advisor · The Scofield
          Group · Nevada License S.0175577. Equal Housing Opportunity.
        </p>
      </StorySection>
    </StoryPage>
  );
}
