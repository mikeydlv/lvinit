import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// NEW & NOTEWORTHY / OUTDOORS — Lee Canyon 2026-27 season opening and the new
// West Bowl chairlift, Spring Mountains (end of SR-156 / Lee Canyon Rd).
// Built by the LVINIT Daily Publisher (2026-11-16) from Local Radar assignment
// LR-LEE-CANYON-WEST-BOWL-2026 (READY - FIRST-PARTY MEDIA RECOMMENDED).
//
// FACT DISCIPLINE (sources read 2026-11-16):
// - PRIMARY: leecanyonlv.com home page: "Ski and Ride season begin on Friday,
//   November 20!"; new "Let 'em Ride" rope tow for 26/27 (park laps); 445
//   acres of lift-served and hike-to terrain (Power Pass listing); $10 Lee
//   Cash for advance online lift-ticket purchases.
// - PRIMARY: leecanyonlv.com/experience-the-new-lee-canyon: new fixed-grip
//   quad chairlift in the new West Bowl zone, roughly 1,370 ft long, climbing
//   800 vertical ft, five new trails; a new surface lift and a rope tow; lift
//   count 5 -> 8; "$30 million" over the past 7 years; Ponderosa (Skytrac
//   fixed-grip quad, 1,500 ft, 1,800 pph) and the Ponderosa base area with a
//   450-stall lot (2022); Alpenglow 500-ft beginner surface lift; Hillside
//   Lodge, 10,000 sq ft, Dec 2019.
// - PRIMARY: leecanyonlv.com/directions: just under an hour from the Strip;
//   no cell service going up the mountain; check chain restrictions/road
//   conditions at 511 or nvroads.com; heavy weekend/holiday traffic.
// - KSNV News 3 (Nov 7, 2026): "Wild West Bowl" chairlift and terrain, six
//   new intermediate/advanced trails, reached from the main base via the
//   Bluebird chair, set to begin operations Sat Dec 12; GM Josh Bean quote
//   (skiable vertical to 1,000 ft); lift tickets from $9 with prices rising
//   after Nov 10; revamped Bighorn Grill and Bristlecone Bar menus.
// CONFLICTS HANDLED: trail count (5 official vs 6 KSNV) and terrain name
//   (West Bowl vs Wild West Bowl) are both attributed. Dec 12 is attributed
//   to KSNV and framed as snow-dependent. The $17M/5-yr figure on the same
//   official page is not used.
// OMITTED ON PURPOSE: current ticket prices, opening-day hours/lifts/runs,
//   summit/base elevations, specific chain-law wording, any first-person
//   visit claim (no first-party media exists yet).
// IMAGERY (updated 2026-11-16): three photos uploaded by Mikey to the repo
//   after publication, each AI-extended horizontally from a source photo (per
//   Mikey). Optimized to WebP with Sharp at their native 1672x941; the
//   uploaded PNGs were replaced by the WebP copies. Every placement carries an
//   "Image extended with AI" note. Hero/card/OG: lift terminal under
//   construction. Inline: crew assembling a lift terminal ("What's new this
//   season") and a snowy ridge ("The bigger picture"), captioned as winter
//   scenery, not current conditions. Not Media Image Library files, so no
//   usedOn/usage records change. The generated editorial cover was deleted.
// ---------------------------------------------------------------------------

const PATH = "/guides/lee-canyon-2026-27-season-west-bowl-las-vegas";
const HERO_IMG = "/images/hero/lee-canyon-west-bowl-2026-27-hero.webp";
const HERO_ALT =
  "Ski lift terminal under construction at Lee Canyon with a rocky mountain backdrop.";
const AI_NOTE = "Image extended with AI.";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";
const LC_HOME = "https://www.leecanyonlv.com/";
const LC_NEW = "https://www.leecanyonlv.com/experience-the-new-lee-canyon/";
const LC_DIRECTIONS = "https://www.leecanyonlv.com/directions/";
const NVROADS = "https://www.nvroads.com/";
const KSNV =
  "https://news3lv.com/news/local/lee-canyon-opens-2026-27-winter-season-nov-20-with-new-chairlift-and-expanded-terrain-wild-west-bowl-snowboarding-skiing-resort";

const TITLE =
  "Lee Canyon Opens Nov. 20 With a New Chairlift. Here's What's New on Las Vegas's Local Mountain";

const meta: StoryMeta = {
  title: "Lee Canyon 2026-27: Opening Day, New West Bowl Lift & What to Know | LVINIT",
  headline: TITLE,
  description:
    "Lee Canyon, the ski area up Lee Canyon Road from Las Vegas, opens for the 2026-27 season on Friday, Nov. 20. What the new West Bowl chairlift adds, when the new terrain is expected, and what to know before you drive up.",
  path: PATH,
  image: HERO_IMG,
  imageWidth: 1672,
  imageHeight: 941,
  imageAlt: HERO_ALT,
  datePublished: "2026-11-16",
  dateModified: "2026-11-16",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Lee Canyon 2026-27 Season", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

/**
 * Inline body photo at its native landscape ratio: intrinsic width/height
 * reserve space (no layout shift), w-full h-auto scales without stretching or
 * cropping, and next/image lazy-loads it by default.
 */
function Figure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="mt-8">
      <Image
        src={src}
        alt={alt}
        width={1672}
        height={941}
        loading="lazy"
        sizes="(max-width: 768px) 100vw, 680px"
        className="h-auto w-full rounded-lg bg-lvinit-lightgray"
      />
      <figcaption className="mt-3 text-caption text-lvinit-warmgray">
        {caption}
      </figcaption>
    </figure>
  );
}

export default function LeeCanyonSeasonPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "New & Noteworthy",
        headline: TITLE,
        subheadline:
          "The ski area up Lee Canyon Road opens Friday, Nov. 20. This season adds a new chairlift and a new zone of trails on the west side of the mountain, plus two more surface lifts.",
        image: HERO_IMG,
        imageAlt: HERO_ALT,
        imageCredit: AI_NOTE,
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on the northwest valley and getting outside around Las Vegas.",
        stories: [
          {
            name: "Sandstone at Tule Springs",
            href: "/guides/sandstone-tule-springs-north-las-vegas",
            category: "Local Feature",
            dek: "A newer community on the north side of the valley, closer to the mountains.",
          },
          {
            name: "Monument Hills",
            href: "/guides/monument-hills-northwest-las-vegas",
            category: "Local Feature",
            dek: "What a planned 6,000-home community means for the far northwest valley.",
          },
          {
            name: "Red Rock Legacy Trail",
            href: "/guides/red-rock-legacy-trail-summerlin-las-vegas",
            category: "Local Feature",
            dek: "The first mile of a paved path toward Red Rock Canyon is open.",
          },
        ],
      }}
    >
      <StoryLede
        kicker="New & Noteworthy"
        lead="One of the things nobody tells you before you move to Las Vegas: you can ski here. Lee Canyon sits at the top of Lee Canyon Road in the Spring Mountains, and the resort says it's just under an hour from the Strip. The 2026-27 season starts Friday, Nov. 20, and this is a bigger year than usual. There's a new chairlift, a new zone of trails on the west side of the mountain, and two more surface lifts. Here's what's actually new, what's still a few weeks out, and what to know before you drive up."
      />

      <StorySection heading="The short version">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Opening day:</span> Friday,
            Nov. 20, 2026, per{" "}
            <a href={LC_HOME} className={extCls} target="_blank" rel="noopener noreferrer">
              Lee Canyon
            </a>
            . Like any ski opening, what&rsquo;s running that day depends on
            conditions.
          </li>
          <li>
            <span className="text-lvinit-black">The big addition:</span> a new
            fixed-grip quad chairlift in a new West Bowl zone. Lee Canyon says
            it&rsquo;s roughly 1,370 feet long, climbs 800 vertical feet and
            brings five new trails.
          </li>
          <li>
            <span className="text-lvinit-black">When the new terrain opens:</span>{" "}
            not on opening day.{" "}
            <a href={KSNV} className={extCls} target="_blank" rel="noopener noreferrer">
              KSNV
            </a>{" "}
            reported the terrain, which it calls the Wild West Bowl, is set to
            begin operations Saturday, Dec. 12. Treat that as the target, not
            a guarantee.
          </li>
          <li>
            <span className="text-lvinit-black">More lifts:</span> a new
            surface lift and a new &ldquo;Let &rsquo;em Ride&rdquo; rope tow
            take Lee Canyon from five lifts to eight.
          </li>
          <li>
            <span className="text-lvinit-black">Before you go:</span> buy
            online ahead of time, check chain restrictions at 511 or
            nvroads.com, and save your directions, because the resort says
            there&rsquo;s no cell service on the way up.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="What's new this season">
        <p className="text-body-lg text-lvinit-warmgray">
          The headline is the West Bowl. On its{" "}
          <a href={LC_NEW} className={extCls} target="_blank" rel="noopener noreferrer">
            &ldquo;Experience the New Lee Canyon&rdquo; page
          </a>
          , the resort describes a new fixed-grip quad chairlift in a new West
          Bowl zone, roughly 1,370 feet long and climbing 800 vertical feet,
          that &ldquo;brings five new trails to the mountain.&rdquo;
        </p>
        <Figure
          src="/images/lee-canyon-west-bowl-lift-construction.webp"
          alt="Workers assembling a green ski lift terminal at Lee Canyon."
          caption={`Lift construction at Lee Canyon. ${AI_NOTE}`}
        />
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          KSNV&rsquo;s Nov. 7 report uses a slightly different version of the
          details. It calls the area the Wild West Bowl, counts six new trails
          for intermediate and advanced skiers and snowboarders, and says
          you&rsquo;ll get there from the main base by riding the Bluebird
          chairlift first. General manager Josh Bean told the station,
          &ldquo;The Wild West Bowl chair increases our skiable vertical drop
          to 1,000 feet.&rdquo; Lee Canyon&rsquo;s own page says five trails,
          so I&rsquo;d expect the final trail map to settle that.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The other new pieces are smaller but useful. The resort is
          installing a new surface lift and a rope tow, which takes the total
          lift count from five to eight. The rope tow is branded &ldquo;Let
          &rsquo;em Ride,&rdquo; and the resort pitches it as a way to make
          terrain park laps easier. KSNV also reported revamped food and drink
          menus at the Bighorn Grill and the Bristlecone Bar.
        </p>
      </StorySection>

      <StorySection heading="Opening day vs. the new terrain">
        <p className="text-body-lg text-lvinit-warmgray">
          This is the part people will mix up. The season opens Nov. 20, but
          the West Bowl isn&rsquo;t expected to run that day. KSNV reported a
          Dec. 12 start for the new terrain. I couldn&rsquo;t find that date on
          Lee Canyon&rsquo;s own pages, and new terrain on a Southern Nevada
          mountain depends on snow, natural or made. If you&rsquo;re driving
          up specifically to ride the new chair, check the resort&rsquo;s
          lift and trail status that morning.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Lee Canyon hasn&rsquo;t posted opening-day hours or which lifts and
          runs will be open on the pages I read. That&rsquo;s normal this far
          out. It usually comes down to the snow in the days before.
        </p>
      </StorySection>

      <StorySection muted heading="The bigger picture: a different mountain than a few years ago">
        <p className="text-body-lg text-lvinit-warmgray">
          If your memory of Lee Canyon is from a while back, it&rsquo;s worth
          another look. The resort says the West Bowl caps $30 million in
          facility and guest-experience investment over the past seven years.
          Here&rsquo;s what came before it, according to Lee Canyon:
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Hillside Lodge (December 2019):</span>{" "}
            a 10,000-square-foot base lodge.
          </li>
          <li>
            <span className="text-lvinit-black">Ponderosa chairlift (2022):</span>{" "}
            a fixed-grip quad, 1,500 feet long, rated for 1,800 riders an
            hour, along with the Ponderosa base area and a 450-stall parking
            lot.
          </li>
          <li>
            <span className="text-lvinit-black">Alpenglow:</span> a 500-foot
            surface lift built for beginners.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The resort lists 445 acres of lift-served and hike-to terrain.
          It&rsquo;s not Utah or Tahoe, and it doesn&rsquo;t pretend to be.
          What it is: real snow, a real lift-served mountain and a beginner
          area, close enough to the valley for a half day.
        </p>
        <Figure
          src="/images/lee-canyon-snowy-mountain-winter.webp"
          alt="Snow-covered mountain ridge and pine forest at Lee Canyon."
          caption={`Lee Canyon in winter. Not a view of current conditions. ${AI_NOTE}`}
        />
      </StorySection>

      <StorySection heading="Tickets: buy ahead">
        <p className="text-body-lg text-lvinit-warmgray">
          Lee Canyon pushes advance online purchases, and its home page says
          buying lift tickets online ahead of time gets you $10 in Lee Cash to
          spend on food, drinks, gear and rentals. KSNV reported early lift
          tickets starting as low as $9, with prices going up after Nov. 10,
          so the cheapest window has already passed. I&rsquo;m not quoting a
          current price because I haven&rsquo;t confirmed one. Check the{" "}
          <a href={LC_HOME} className={extCls} target="_blank" rel="noopener noreferrer">
            resort&rsquo;s site
          </a>{" "}
          for the date you want. As with most resorts, buying early usually
          beats buying at the window.
        </p>
      </StorySection>

      <StorySection muted heading="Getting there from the valley">
        <p className="text-body-lg text-lvinit-warmgray">
          Lee Canyon is at the end of Lee Canyon Road (State Route 156), which
          climbs into the Spring Mountains off US-95 northwest of the valley.
          From the northwest side of town (Centennial Hills, Skye Canyon,
          the newer communities going in around{" "}
          <Link href="/guides/sandstone-tule-springs-north-las-vegas" className={linkCls}>
            Tule Springs
          </Link>{" "}
          and{" "}
          <Link href="/guides/monument-hills-northwest-las-vegas" className={linkCls}>
            the far northwest
          </Link>
          ), you&rsquo;re already pointed the right way. From Henderson or
          the southwest, plan for more time on the 215 or the 95 first.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The resort&rsquo;s{" "}
          <a href={LC_DIRECTIONS} className={extCls} target="_blank" rel="noopener noreferrer">
            directions page
          </a>{" "}
          has three practical warnings worth taking seriously:
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">No cell service going up.</span>{" "}
            Save your directions before you leave.
          </li>
          <li>
            <span className="text-lvinit-black">Check the road first.</span>{" "}
            Chain restrictions and road conditions are posted through 511 and{" "}
            <a href={NVROADS} className={extCls} target="_blank" rel="noopener noreferrer">
              nvroads.com
            </a>
            . Conditions can change with the weather, and a dry day in the
            valley doesn&rsquo;t mean a dry road at the top.
          </li>
          <li>
            <span className="text-lvinit-black">Leave early.</span> Traffic is
            heavy on weekends and holidays.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The mountain and the valley floor can feel like two different
          climates on the same day. If you&rsquo;re still getting used to the
          valley&rsquo;s other extreme, the{" "}
          <Link href="/guides/first-summer-in-vegas" className={linkCls}>
            first summer in Vegas guide
          </Link>{" "}
          covers that.
        </p>
      </StorySection>

      <StorySection heading="Why it matters if you live here">
        <p className="text-body-lg text-lvinit-warmgray">
          Most people picture Las Vegas as desert, and most of it is. But the
          Spring Mountains are a big part of everyday life here, for cooler
          summer hikes and for snow when locals want winter
          without flying anywhere. A local ski area with a new chairlift and
          new terrain is a real quality-of-life amenity, and it doesn&rsquo;t
          show up in the usual pitch for living here.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If you&rsquo;re weighing a move and getting outside matters to you,
          the{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas guide
          </Link>{" "}
          is a good place to compare parts of the valley. Closer to Red Rock is
          a different trade-off, covered in the{" "}
          <Link href="/guides/red-rock-legacy-trail-summerlin-las-vegas" className={linkCls}>
            Red Rock Legacy Trail
          </Link>{" "}
          story.
        </p>
      </StorySection>

      <StorySection muted heading="What I haven't confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">The West Bowl opening date.</span>{" "}
            Dec. 12 comes from KSNV. It isn&rsquo;t on the resort pages I read,
            and it depends on snow.
          </li>
          <li>
            <span className="text-lvinit-black">The trail count and name.</span>{" "}
            Lee Canyon says five new trails in the West Bowl. KSNV says six
            and calls it the Wild West Bowl.
          </li>
          <li>
            <span className="text-lvinit-black">Opening-day details.</span>{" "}
            Hours, lifts and runs for Nov. 20 weren&rsquo;t published on the
            pages I read.
          </li>
          <li>
            <span className="text-lvinit-black">Current ticket prices.</span>{" "}
            Not quoted here. Check the resort&rsquo;s site.
          </li>
          <li>
            <span className="text-lvinit-black">Photos.</span> The photos on
            this page were extended horizontally with AI from source photos,
            and the snow photo isn&rsquo;t a view of current conditions.
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Lee Canyon</span>, home page
            (Nov. 20 opening, &ldquo;Let &rsquo;em Ride&rdquo; rope tow, 445
            acres, Lee Cash for advance purchases).{" "}
            <a href={LC_HOME} className={extCls} target="_blank" rel="noopener noreferrer">
              leecanyonlv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Lee Canyon</span>, Experience
            the New Lee Canyon (West Bowl chairlift, new trails, lift count,
            investment, past upgrades).{" "}
            <a href={LC_NEW} className={extCls} target="_blank" rel="noopener noreferrer">
              leecanyonlv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Lee Canyon</span>, Directions
            (drive time, cell service, road conditions).{" "}
            <a href={LC_DIRECTIONS} className={extCls} target="_blank" rel="noopener noreferrer">
              leecanyonlv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KSNV News 3 Las Vegas</span>,
            Lee Canyon opens 2026-27 winter season Nov. 20 with new chairlift
            and expanded terrain, Nov. 7, 2026.{" "}
            <a href={KSNV} className={extCls} target="_blank" rel="noopener noreferrer">
              news3lv.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
