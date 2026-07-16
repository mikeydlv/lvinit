import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryPullQuote,
  StoryGallery,
} from "@/components/story";

// ---------------------------------------------------------------------------
// DOWNTOWN ARTS DISTRICT — neighborhood guide, built on the Story Page system.
//
// ROUTE: this is a place people live, so it lives on the place spine
// (/neighborhoods/…) alongside Summerlin, Henderson, and North Las Vegas —
// PROJECT_STATE lists it under "Future Neighborhood Pages," and it's already in
// the neighborhoods[] array. It is NOT a /guides/ story.
//
// PHOTOGRAPHY: all real, Mikey-owned frames from the 2026-07-15 Arts District
// shoot (Samsung, midday July). Global footer credit covers them — no per-image
// credit needed. The "Greetings from Las Vegas" dice/chips mural frame is kept
// OUT (tourism-cliché exclusion); it's social-only.
//
// FACTS: no invented prices, rents, walk scores, commute minutes, crime, or
// rankings. Only well-established, verifiable facts appear — the "18b" name and
// the Main St (Charleston→Colorado) core are documented by the district's own
// org and Wikipedia; businesses named (Red Kat, Koolsville Tattoo, the Colorado,
// ShareDowntown) are legible in the photos. First Friday is referenced cautiously
// and points readers to the official calendar rather than asserting a schedule.
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title: "Downtown Arts District — A Local's Neighborhood Guide | LVINIT",
  headline: "The Downtown Arts District",
  description:
    "An honest local guide to Las Vegas' 18b Arts District — the walkable, mural-covered stretch of Main Street north of the Strip. What it's actually like to live there, and who it's for.",
  path: "/neighborhoods/downtown-arts-district",
  image: "/images/hero/downtown-arts-district-main-street.webp",
  imageWidth: 2400,
  imageHeight: 1350,
  imageAlt:
    "Main Street in the Las Vegas Arts District at midday, looking north toward the Stratosphere tower, with the mid-century Colorado building on the left and The Red Kat vintage store on the right.",
  datePublished: "2026-07-15",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    {
      name: "Downtown Arts District",
      path: "/neighborhoods/downtown-arts-district",
    },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function DowntownArtsDistrictPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Downtown Las Vegas · Neighborhood Guide",
        headline: "The Downtown Arts District",
        subheadline:
          "The rare corner of Las Vegas built for walking — murals, coffee counters, vintage racks, and bars packed onto a few blocks of Main Street. Here's the honest local read on living here.",
        image: "/images/hero/downtown-arts-district-main-street.webp",
        imageAlt:
          "Main Street in the Las Vegas Arts District at midday, looking north toward the Stratosphere tower, with the mid-century Colorado building on the left and The Red Kat vintage store on the right.",
        backLink: { label: "Las Vegas neighborhoods", href: "/#neighborhoods" },
        ctas: [
          {
            label: "Search homes",
            href: "/search",
            variant: "tertiary",
          },
        ],
      }}
      relatedStories={{
        heading: "Compare it to the rest of the valley",
        intro:
          "The Arts District is the walkable counterpoint to the master-plans. If you're weighing it against the suburbs, these are the honest guides to the other side of that decision.",
        columns: 3,
        stories: [
          {
            name: "Summerlin",
            href: "/neighborhoods/summerlin",
            category: "Neighborhood guide",
            dek: "The master-planned west side against Red Rock — trails, top schools, and the trade-offs a brochure skips.",
          },
          {
            name: "Henderson",
            href: "/neighborhoods/henderson",
            category: "Neighborhood guide",
            dek: "The valley's widest range of communities, from new master-plans to a historic downtown and the hillside.",
          },
          {
            name: "North Las Vegas",
            href: "/neighborhoods/north-las-vegas",
            category: "Neighborhood guide",
            dek: "Its own city at the north end — established streets, big master-plans, and brand-new desert growth.",
          },
        ],
      }}
      ctas={{
        heading: "Curious whether downtown is your kind of Las Vegas?",
        body:
          "Tell me how you actually want to spend a Saturday, and I'll tell you honestly whether the Arts District fits — or point you somewhere that fits better. No pressure, no pitch.",
        footnote: (
          <>
            Weighing the suburbs instead?{" "}
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
      <StoryLede
        kicker="Downtown Las Vegas · Neighborhood Guide"
        lead="Most of Las Vegas asks you to drive. The Arts District is the rare corner that asks you to walk — a low, sun-bleached, mural-covered stretch of Main Street just north of the Strip, where galleries, coffee counters, vintage shops, and bars sit shoulder to shoulder instead of behind a parking lot."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Officially it&rsquo;s the{" "}
          <span className="text-lvinit-black">18b Arts District</span> — the name
          comes from the original eighteen-block arts zone — and it&rsquo;s the
          closest thing the city has to a walk-everywhere neighborhood. If
          you&rsquo;ve read the{" "}
          <Link
            href="/neighborhoods/summerlin"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Summerlin
          </Link>{" "}
          or{" "}
          <Link
            href="/neighborhoods/henderson"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Henderson
          </Link>{" "}
          guides, this is the opposite instinct: not a master-plan someone drew
          from the top down, but an old warehouse-and-antique district that grew a
          personality of its own.
        </p>
      </StoryLede>

      <StorySection heading="The honest overview">
        <p className="text-body-lg text-lvinit-warmgray">
          The heart of it runs along Main Street, roughly between Charleston
          Boulevard and Colorado Avenue, at the downtown edge of the city and just
          north of the Strip corridor. It started as the city&rsquo;s antique row
          and a scatter of warehouses, and over the last decade it filled in with
          galleries, coffee roasters, breweries, tattoo shops, record stores, and
          restaurants — most of them independent, most of them local.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It&rsquo;s compact. The walkable core is a handful of blocks, not a
          sprawling district, and that&rsquo;s the point — you can park once and
          spend an afternoon on foot, which is a genuinely unusual sentence to
          write about Las Vegas. What it is not is a polished, finished
          neighborhood. It&rsquo;s a real one, mid-transformation, with new money
          and rough edges on the same block.
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/downtown-arts-district-the-colorado-building.webp",
            alt: "The mid-century Colorado building at Main Street and Colorado Avenue in the Las Vegas Arts District, its clean white facade beside a large mural on the Red Kat vintage store.",
            caption:
              "The mid-century Colorado building at Main and Colorado — the district's bones are older than its reputation.",
          },
        ]}
      />

      <StorySection heading="What it actually feels like">
        <p className="text-body-lg text-lvinit-warmgray">
          Walk it in daylight and the first thing you notice is how low it is —
          one- and two-story buildings, wide desert sky, and murals on nearly
          every wall that has room for one. There&rsquo;s good mid-century bones
          here, like the Colorado building, mixed with warehouses that have been
          repainted and repurposed rather than torn down. It reads creative and
          lived-in, not manicured.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The rhythm is split. By day it&rsquo;s quiet and a little sleepy —
          coffee, browsing, the occasional gallery. In the evening, and
          especially on weekends, the bars and restaurants wake it up. Once a
          month, on First Friday, the whole district turns into a street festival.
          If you live here, you live with both versions of the block.
        </p>
      </StorySection>

      <StorySection heading="Walkable — genuinely, by Vegas standards">
        <p className="text-body-lg text-lvinit-warmgray">
          I want to be precise, because &ldquo;walkable&rdquo; gets thrown around.
          The Arts District is a walkable pocket inside a car city — not a
          walkable city. Within the core, you really can leave the car and move
          between coffee, lunch, a record shop, and a bar on foot. That&rsquo;s
          rare enough here to be the whole selling point.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          But be honest with yourself about the edges. Push a few blocks out and
          the sidewalks get gappy, the streets get wide and fast, and the shade
          disappears. For daily errands — a full grocery run, big-box anything —
          you&rsquo;ll still likely drive. It&rsquo;s walk-for-your-Saturday, not
          walk-for-everything.
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/guide-arts-district-walkable-sidewalk.webp",
            alt: "A tree-lined sidewalk along Main Street in the Las Vegas Arts District, with shaded storefronts and street trees running down the block.",
            caption:
              "The core blocks are shaded and genuinely walkable — a rare thing to be able to say in this city.",
          },
        ]}
      />

      <StorySection heading="Coffee, food, bars, vintage, and galleries">
        <p className="text-body-lg text-lvinit-warmgray">
          This is the district&rsquo;s real draw, and it&rsquo;s dense: specialty
          coffee, breweries and cocktail bars, restaurants that range from
          casual to serious, vintage-clothing and antique stores, tattoo shops,
          and working art galleries. The names turn over — that&rsquo;s the
          nature of an independent district — but the character holds. You&rsquo;ll
          find longtime fixtures like The Red Kat for vintage and Koolsville
          Tattoo alongside newer bars filling in the old buildings.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The one date worth knowing is First Friday — a monthly arts event
          that&rsquo;s run in some form since 2002 and takes over the district the
          first Friday of each month with vendors, art, music, and food. Because
          the exact footprint and hours shift season to season, check the{" "}
          <a
            href="https://www.18b.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            18b Arts District&rsquo;s official calendar
          </a>{" "}
          before you plan around it rather than trusting an old blog.
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/downtown-arts-district-main-street-shops.webp",
            alt: "Pedestrians walking a shaded Main Street sidewalk in the Las Vegas Arts District past restaurants and the pink Koolsville Tattoo storefront, with parked cars and string lights overhead.",
            caption:
              "A weekday afternoon on Main Street — people on foot, string lights up, the shops open.",
          },
        ]}
      />

      <StorySection heading="What's being built — the housing question">
        <p className="text-body-lg text-lvinit-warmgray">
          Here&rsquo;s where you have to reset your expectations. The Arts
          District is not a single-family-home neighborhood. Historically it was
          commercial and industrial, so what you&rsquo;ll actually find is a mix:
          older buildings and lofts, condos, and — increasingly — new apartment
          builds going up on the edges, leaning into the &ldquo;live here, walk
          there&rdquo; pitch. It&rsquo;s more a renter&rsquo;s district than an
          owner&rsquo;s, for now.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          For-sale inventory exists but it&rsquo;s thin and varied, and it moves —
          which is exactly why I won&rsquo;t hand you a price or a rent figure on
          this page. Those numbers are too situational to quote honestly from a
          brochure. When you&rsquo;re ready to look seriously, that&rsquo;s a
          conversation to have against real, current listings — the kind you can
          pull up on the{" "}
          <Link
            href="/search"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            search page
          </Link>
          .
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/downtown-arts-district-sharedowntown-apartments.webp",
            alt: "A newly built four-story apartment building on the edge of the Las Vegas Arts District with a large street-art mural, bike-share docks out front, and signage reading Live Here, Walk There.",
            caption:
              "New apartments with bike-share docks out front — the district's density is being built for people who'd rather not drive.",
          },
        ]}
      />

      <StorySection heading="Who it's for">
        <p className="text-body-lg text-lvinit-warmgray">
          This one has a real personality, which means it fits some people
          perfectly and others not at all. It&rsquo;s for the person who wants to
          walk to coffee and a bar, who&rsquo;d trade square footage and a yard
          for character and a front-row seat to the most creative part of the
          city. It suits renters, singles and couples, people in the arts and
          hospitality worlds, and anyone who&rsquo;s bored by the idea of a
          matching-beige master-plan.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If &ldquo;I want to feel like I live somewhere, not just park
          somewhere&rdquo; sounds like you, this is one of the only places in Las
          Vegas that delivers it.
        </p>
      </StorySection>

      <StoryPullQuote>
        The whole valley is built around the car. The Arts District is the one
        place that dares you to leave it parked.
      </StoryPullQuote>

      <StorySection heading="Who it's probably not for">
        <p className="text-body-lg text-lvinit-warmgray">
          I&rsquo;d be doing you no favors to pretend it fits everyone. If your
          top priorities are highly rated schools, a yard, a two-car garage, and
          quiet cul-de-sac evenings, this isn&rsquo;t your neighborhood, and
          that&rsquo;s no knock on you — it&rsquo;s just a different life. The
          suburbs do that far better, which is the entire reason the{" "}
          <Link
            href="/neighborhoods/henderson"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Henderson
          </Link>{" "}
          and{" "}
          <Link
            href="/neighborhoods/summerlin"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Summerlin
          </Link>{" "}
          guides exist.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It&rsquo;s also not for the light sleeper who wants silence on a
          weekend night, or for anyone expecting suburban convenience — big
          grocery stores, easy parking, everything ten minutes away — within
          walking distance. The trade for character is a little friction.
        </p>
      </StorySection>

      <StorySection heading="Parking, heat, noise, and nightlife hours">
        <p className="text-body-lg text-lvinit-warmgray">
          The practical stuff, straight. Parking is mostly street and small lots;
          it&rsquo;s easy on a quiet weekday and genuinely tight on First Friday
          and busy weekend nights — plan for it. The heat is real: these photos
          were taken at midday in July, and you can feel it in how empty the
          sidewalks are. Shade is thin between the core blocks, and summer
          afternoons here are a commitment.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Noise cuts both ways. The nightlife that makes the district fun also
          means the bars run late on weekends, so proximity to the action is a
          feature or a bug depending on which side of your window it&rsquo;s on.
          And the daily rhythm is genuinely nocturnal-leaning — sleepy mornings,
          lively nights. If you&rsquo;re an early-to-bed person, live a block or
          two off the loudest stretch.
        </p>
      </StorySection>

      <StorySection muted heading="How it's different from the Strip and Fremont Street">
        <p className="text-body-lg text-lvinit-warmgray">
          People new to the city lump downtown together, so it&rsquo;s worth being
          clear. The Strip is the resort corridor — casinos, tourists, and hotels,
          a place you visit more than live in. Fremont Street and Fremont East,
          a little to the north, are the older downtown tourist and bar zone under
          the light canopy. The Arts District is neither. There are no casinos in
          it; it&rsquo;s independent businesses, galleries, and locals, and it
          reads far more like a real neighborhood than an attraction.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That&rsquo;s the honest appeal. You get a walkable, creative slice of
          the city with the Strip close enough to see on the horizon — visible in
          nearly every photo on this page — without living inside the tourist
          machine. When you want to weigh that against the quieter, more
          conventional options, that&rsquo;s exactly what I&rsquo;m here for.
        </p>
      </StorySection>
    </StoryPage>
  );
}
