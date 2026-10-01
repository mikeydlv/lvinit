import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryPullQuote,
  StoryVideo,
  StoryGallery,
} from "@/components/story";

// ---------------------------------------------------------------------------
// MOVING HERE — "Moving to Las Vegas: The Local's Starting Point." The Cluster A
// hub (docs/LVINIT_CONTENT_CLUSTER_MAP.md, queue #2). It routes to existing
// LVINIT pages and states only a handful of independently verified facts.
//
// FACT DISCIPLINE (read before editing):
// - Nevada DMV (dmv.nv.gov, FAQ + registration pages, checked 2026-10-01): new
//   residents must obtain a Nevada driver's license and register their
//   vehicle within 30 days of establishing residency.
// - Nevada Department of Taxation (tax.nv.gov, "Income Tax in Nevada"):
//   Nevada residents do not pay state tax on salaries, wages, or similar
//   compensation. Sales, property and other taxes still exist. No rates or
//   dollar amounts are stated here on purpose — they change.
// - Market numbers are NOT restated. This page points to the dated pieces that
//   carry and source them (home prices, rates, starter homes).
// - No schools, safety or "who lives where" framing (Fair Housing). Area
//   descriptions track what the linked LVINIT pages already say.
// - Video: Mikey's own "Moving to Las Vegas in 2026? Choose the Area Before the
//   House" (YouTube nyK0cchUt14, 5:45, the featured homepage video). Title as
//   in the videos[] registry. Click-to-play facade with the local title-card
//   poster; no VideoObject JSON-LD because the upload date is not verified.
// - Inline photos are Mikey-owned and already live elsewhere on LVINIT; the
//   alt text is carried over from those pages. None repeats the hero.
// - Hero photo: same Mikey-owned valley-wide residential aerial already live on the
//   DPA and August price guides; the alt text makes no neighborhood claim.
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title: "Moving to Las Vegas: Where to Start | LVINIT",
  headline: "Moving to Las Vegas: Where to Start",
  description:
    "A local's starting point for moving to Las Vegas: choose the area first, understand summer and ownership costs, decide rent vs. buy, and handle the first-month basics.",
  path: "/guides/moving-to-las-vegas",
  image: "/images/hero/las-vegas-residential-neighborhood-aerial-drone.webp",
  imageWidth: 1908,
  imageHeight: 1070,
  imageAlt:
    "Aerial drone view of a Las Vegas residential neighborhood, with rows of tile-roofed tract homes, rooftop solar panels, and desert mountains under a blue sky in the background.",
  datePublished: "2026-10-01",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Moving to Las Vegas", path: "/guides/moving-to-las-vegas" },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

const linkCls = "text-lvinit-blue underline underline-offset-4";

export default function MovingToLasVegasPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Moving Here",
        headline: "Moving to Las Vegas: Where to Start",
        subheadline:
          "Pick the part of the valley before you pick the house. Here's the order I'd tackle it in, and where to go deeper on each step.",
        image: "/images/hero/las-vegas-residential-neighborhood-aerial-drone.webp",
        imageAlt:
          "Aerial drone view of a Las Vegas residential neighborhood, with rows of tile-roofed tract homes, rooftop solar panels, and desert mountains under a blue sky in the background.",
        backLink: { label: "LVINIT", href: "/" },
        ctas: [{ label: "Start with the area", href: "#choose-the-area", variant: "primary" }],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "The three guides most people open next.",
        stories: [
          {
            name: "Summerlin vs Henderson vs Southwest Las Vegas",
            href: "/guides/summerlin-vs-henderson-vs-southwest-las-vegas",
            category: "Comparison",
            dek: "The three big suburban options compared on money, location, new construction and parks.",
          },
          {
            name: "Surviving Your First Las Vegas Summer",
            href: "/guides/first-summer-in-vegas",
            category: "Moving Here",
            dek: "The practical version of heat and monsoon season, not the panicked one.",
          },
          {
            name: "You Don't Need 20% Down To Buy a Home in Las Vegas",
            href: "/guides/las-vegas-down-payment-assistance-programs-2026",
            category: "Buyer Guide",
            dek: "The real minimums and the Nevada programs that sit on top of them.",
          },
        ],
      }}
      ctas={{
        heading: "Planning a move to Las Vegas?",
        body:
          "Tell me where you are in the process, and I'll help you narrow the area before you spend a weekend on listings.",
      }}
    >
      <StoryLede
        kicker="Moving Here"
        lead="Most people who move to Las Vegas start with the house: a price, a bedroom count, a listing site. Almost everyone who's lived here a few years would tell you to start somewhere else. The valley is big, the pieces of it are very different, and the area you land in shapes your commute, your summers, and what you pay far more than the floor plan does."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          This page is the starting map. It doesn&rsquo;t try to answer
          everything. It puts the decisions in order and sends you to the
          LVINIT guide that goes deep on each one.
        </p>
      </StoryLede>

      <StoryVideo
        id="watch"
        heading="Prefer to watch first?"
        intro="This is the short video version of the area-first approach. The sections below go deeper on each step."
        youtubeId="nyK0cchUt14"
        title="Moving to Las Vegas in 2026? Choose the Area Before the House"
        poster="/images/video-moving-to-las-vegas-2026-choose-the-area.jpg"
      />

      <StorySection heading="1. Choose the area before the house" >
        <div id="choose-the-area" className="scroll-mt-24" />
        <p className="text-body-lg text-lvinit-warmgray">
          &ldquo;Las Vegas&rdquo; is a city, a metro area, and a shorthand
          locals use for a lot of places that aren&rsquo;t technically the
          City of Las Vegas. Henderson and North Las Vegas are their own
          cities. Summerlin is a master-planned community mostly within the City of
          Las Vegas. Southwest Las Vegas is a name for a fast-growing stretch
          of county with no boundary of its own. Knowing which is which makes
          every listing, tax bill and commute easier to read.
        </p>
        <ul className="mt-5 space-y-4 text-body-lg text-lvinit-warmgray">
          <li>
            <Link href="/neighborhoods/summerlin" className={linkCls}>
              Summerlin
            </Link>
            : established master-planned villages on the west side, with the
            Red Rock backdrop.
          </li>
          <li>
            <Link href="/neighborhoods/henderson" className={linkCls}>
              Henderson
            </Link>
            : its own city southeast of the Strip, with a wide range of
            communities from Water Street to MacDonald Highlands.
          </li>
          <li>
            <Link href="/neighborhoods/southwest-las-vegas" className={linkCls}>
              Southwest Las Vegas
            </Link>
            : the valley&rsquo;s newer-construction growth side.
          </li>
          <li>
            <Link href="/neighborhoods/north-las-vegas" className={linkCls}>
              North Las Vegas
            </Link>
            : its own city, with new communities like{" "}
            <Link
              href="/guides/sandstone-tule-springs-north-las-vegas"
              className={linkCls}
            >
              Sandstone at Tule Springs
            </Link>
            .
          </li>
          <li>
            <Link href="/neighborhoods/downtown-arts-district" className={linkCls}>
              The Downtown Arts District
            </Link>
            : the walkable, urban option.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If you&rsquo;re torn between the three big suburban options, start
          with{" "}
          <Link
            href="/guides/summerlin-vs-henderson-vs-southwest-las-vegas"
            className={linkCls}
          >
            the three-way comparison
          </Link>
          , or the pairings:{" "}
          <Link href="/guides/summerlin-vs-henderson" className={linkCls}>
            Summerlin vs. Henderson
          </Link>{" "}
          and{" "}
          <Link href="/guides/henderson-vs-southwest-las-vegas" className={linkCls}>
            Henderson vs. Southwest Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/hero/summerlin-established-neighborhood-red-rock-aerial-drone.webp",
            alt: "Aerial drone view over an established Las Vegas neighborhood of tile-roofed homes with grown-in trees and a green golf corridor, the 215 Beltway running across the foreground and the Red Rock escarpment and La Madre range on the horizon.",
            caption:
              "One valley, many different settings: a freeway, a finished neighborhood and the mountains all within a few miles.",
          },
        ]}
      />

      <StoryPullQuote>
        Same city name, very different daily lives. Choose the area first and
        the house gets easier.
      </StoryPullQuote>

      <StorySection heading="2. Understand summer before you sign anything">
        <p className="text-body-lg text-lvinit-warmgray">
          The heat is the thing every newcomer has heard about. The monsoon
          season and the way heat changes your daily schedule are the things
          they haven&rsquo;t. Air conditioning is a utility here, not a
          luxury, and a home&rsquo;s orientation, shade and AC age are worth
          checking on any tour. The full version is in{" "}
          <Link href="/guides/first-summer-in-vegas" className={linkCls}>
            Surviving Your First Las Vegas Summer
          </Link>
          .
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/southwest-las-vegas-rooftops-vacant-land-aerial-drone.webp",
            alt: "Aerial view in southwest Las Vegas of a finished block of homes ending abruptly at open, undeveloped desert, with a newly built road and an empty parking lot alongside.",
            caption:
              "Parts of the valley are still being built out, with young landscaping and little established shade. Worth noticing on a summer-afternoon tour.",
          },
        ]}
      />

      <StorySection heading="3. Know what the market looks like right now" muted>
        <p className="text-body-lg text-lvinit-warmgray">
          Prices, inventory and mortgage rates move, so this page doesn&rsquo;t
          repeat numbers that will go stale. LVINIT&rsquo;s dated reports carry
          the sourced figures:{" "}
          <Link href="/guides/las-vegas-home-prices-august-2026" className={linkCls}>
            the latest Las Vegas REALTORS price report
          </Link>
          ,{" "}
          <Link href="/guides/will-las-vegas-home-prices-drop" className={linkCls}>
            why prices haven&rsquo;t fallen with inventory rising
          </Link>
          ,{" "}
          <Link href="/guides/las-vegas-starter-home-prices-2026" className={linkCls}>
            starter-home prices
          </Link>{" "}
          and{" "}
          <Link
            href="/guides/las-vegas-mortgage-rates-september-2026"
            className={linkCls}
          >
            what mortgage rates mean for a Las Vegas payment
          </Link>
          . For a concrete picture of a budget, see{" "}
          <Link href="/guides/what-500k-buys-in-las-vegas" className={linkCls}>
            What $500K Buys in Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection heading="4. Decide how you'll buy, and what it costs to own">
        <p className="text-body-lg text-lvinit-warmgray">
          Three questions come up for almost every relocating buyer, and each
          has a Las Vegas-specific answer:
        </p>
        <ul className="mt-5 space-y-4 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">How much cash do I need?</span>{" "}
            Less than many people assume. See{" "}
            <Link
              href="/guides/las-vegas-down-payment-assistance-programs-2026"
              className={linkCls}
            >
              the down-payment guide
            </Link>
            .
          </li>
          <li>
            <span className="text-lvinit-black">New build or resale?</span>{" "}
            Two homes at the same price can be very different deals. See{" "}
            <Link href="/guides/new-build-vs-resale-las-vegas" className={linkCls}>
              New Build vs Resale in Las Vegas
            </Link>
            .
          </li>
          <li>
            <span className="text-lvinit-black">
              Will my tax bill look like the seller&rsquo;s?
            </span>{" "}
            Not necessarily. See{" "}
            <Link
              href="/guides/nevada-property-tax-abatement-resale-buyers"
              className={linkCls}
            >
              the Nevada property-tax abatement guide
            </Link>
            .
          </li>
        </ul>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/las-vegas-new-construction-model-home-builder-flag.webp",
            alt: "A two-story new-construction model home in southwest Las Vegas with a builder flag on a pole out front, a low metal rail along the sidewalk, young shrubs in fresh rock landscaping, and neighboring new homes on either side.",
            caption:
              "A model home is a sales tool. Most of what you like about one is an option, an upgrade, or a cost that lands after closing.",
          },
        ]}
      />

      <StorySection heading="5. The first-month basics" muted>
        <p className="text-body-lg text-lvinit-warmgray">
          Two things are worth knowing early. First, the Nevada DMV says new
          residents need to get a Nevada driver&rsquo;s license and register
          their vehicle within 30 days of establishing residency. Check the
          DMV&rsquo;s own pages for the current documents and process.
          Second, Nevada doesn&rsquo;t tax salaries and wages at the state
          level, according to the Nevada Department of Taxation. That
          doesn&rsquo;t make living here tax-free. Sales and property taxes
          still apply, so budget for them rather than assuming the savings.
        </p>
      </StorySection>

      <StorySection heading="Where I'd start">
        <p className="text-body-lg text-lvinit-warmgray">
          Pick two areas to compare, read the guides for both, then look at
          what your budget buys in each. If you&rsquo;re moving from out of
          state and want a second opinion on where to focus,{" "}
          <Link href="/contact" className={linkCls}>
            get in touch
          </Link>
          . If you already know the area,{" "}
          <Link href="/search" className={linkCls}>
            start your home search
          </Link>
          .
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Nevada DMV</span>. New-resident
            driver&rsquo;s license and vehicle registration timing, at{" "}
            <a
              href="https://dmv.nv.gov/faqs.htm"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              dmv.nv.gov
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">Nevada Department of Taxation</span>
            . &ldquo;Income Tax in Nevada,&rdquo; at{" "}
            <a
              href="https://tax.nv.gov/about-nevada-department-of-taxation/income-tax-in-nevada/"
              className={linkCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              tax.nv.gov
            </a>
            .
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Rules and programs change. This is general local guidance, not tax,
          legal or lending advice.
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
