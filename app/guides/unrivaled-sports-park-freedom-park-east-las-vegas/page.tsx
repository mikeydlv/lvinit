import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// NEW & NOTEWORTHY: Unrivaled Sports Park Las Vegas (former Big League Dreams)
// inside the City of Las Vegas' Gary Reese Freedom Park, east Las Vegas.
// Built by the LVINIT Daily Publisher (2026-11-14) from Local Radar assignment
// LR-UNRIVALED-SPORTS-PARK-FREEDOM-PARK (READY - FIRST-PARTY MEDIA RECOMMENDED).
//
// FACT DISCIPLINE (sources read 2026-11-14):
// - PRIMARY: Unrivaled Sports release (PR Newswire, Las Vegas, Nov 10, 2026):
//   official unveiling Nov 10, 2026; former Big League Dreams complex opened
//   January 2010 and joined Unrivaled Sports January 2025; company committed
//   $2M in improvements over 18 months and has invested more than three times
//   that; $6M transformation; six rebuilt baseball fields with nearly 980,000
//   sq ft of new turf; replica outfield walls restored; home-run netting
//   replaced; landscaping/technology/infrastructure upgrades; about 6,000 sq
//   ft renovated across two restaurants; new signage. First property in the
//   company's portfolio to carry the Unrivaled Sports Park name. 2027 plans:
//   free community access days, baseball and softball clinics for Ward 3
//   youth, school playoff/championship games, annual back-to-school event
//   for Ward 3 families; Vegas for Athletes baseball tournament from 2027.
//   Quotes from Wade Martin (president) and Mayor Pro Tem Olivia Diaz.
//   Company operates 15 venues.
// - PRIMARY (context): City of Las Vegas Gary Reese Freedom Park page: 850 N.
//   Mojave Rd, 89101; 68 acres; park hours 7 a.m.-11 p.m.; amenities list;
//   coming in 2027: two sand volleyball courts, splash pad, restrooms, shade
//   structure. Page does not mention the ballpark operator.
// - KSNV News 3 (Nov 11, 2026): corner of Pecos Road and Washington Avenue.
// - Fox5 (Nov 10, 2026): replica walls of Fenway Park, Yankee Stadium, Dodger
//   Stadium, Wrigley Field, Angel Stadium and Crosley Field, scaled down for
//   youth players (attributed to Fox5 in copy); Fox5 reported "more than $4
//   million," so the $6M figure is attributed to Unrivaled Sports.
// OMITTED ON PURPOSE: ballpark hours, prices, walk-in access, 2027 event
//   dates, lease terms, the 3151 E. Washington Ave address (syndications
//   only), any first-person visit claim (no first-party media exists).
// IMAGERY (updated 2026-11-16): two images uploaded by Mikey to the repo
//   after publication, edited and extended with AI (per Mikey). Optimized to
//   WebP with Sharp at their native 1672x941 (q84); the uploaded PNGs were
//   replaced by the WebP copies. Every placement carries an "Image edited and
//   extended with AI" note. Hero/card/OG: daytime aerial of the complex.
//   Inline ("Before you go"): the entrance with the baseball sculpture. Not
//   Media Image Library files, so no usedOn/usage records change. The
//   generated editorial cover was deleted.
// ---------------------------------------------------------------------------

const PATH = "/guides/unrivaled-sports-park-freedom-park-east-las-vegas";
const HERO_IMG = "/images/hero/unrivaled-sports-park-las-vegas-hero.webp";
const HERO_ALT =
  "Aerial view of Unrivaled Sports Park in Las Vegas with baseball fields and mountains.";
const AI_NOTE = "Image edited and extended with AI.";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";
const RELEASE =
  "https://www.prnewswire.com/news-releases/unrivaled-sports-park-las-vegas-unveiled-following-6-million-transformation-302933588.html";
const CITY_PARK =
  "https://www.lasvegasnevada.gov/Residents/Parks-Facilities/Gary-Reese-Freedom-Park";
const KSNV =
  "https://news3lv.com/news/local/east-las-vegas-baseball-complex-6-million-remodeling-unrivaled-sports-big-league-dreams-gary-reese-freedom-southern-nevada";
const FOX5 =
  "https://www.fox5vegas.com/2026/11/11/renovated-youth-ballfields-reopen-las-vegas-park/";

const TITLE =
  "The Old Big League Dreams Fields in East Las Vegas Are Now Unrivaled Sports Park";

const meta: StoryMeta = {
  title: "Unrivaled Sports Park Las Vegas: What Changed at Big League Dreams | LVINIT",
  headline: TITLE,
  description:
    "The former Big League Dreams complex at Gary Reese Freedom Park reopened Nov. 10 as Unrivaled Sports Park after a renovation the company puts at $6 million. What changed, what's planned for neighborhood families, and what's coming to the park in 2027.",
  path: PATH,
  image: HERO_IMG,
  imageWidth: 1672,
  imageHeight: 941,
  imageAlt: HERO_ALT,
  datePublished: "2026-11-14",
  dateModified: "2026-11-14",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Unrivaled Sports Park", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

/**
 * Inline body photo at its native 16:9 ratio: intrinsic width/height reserve
 * space (no layout shift), w-full h-auto scales without stretching or
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

export default function UnrivaledSportsParkPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "New & Noteworthy",
        headline: TITLE,
        subheadline:
          "Same six replica ballparks at Pecos and Washington, new name, new turf and renovated restaurants, plus free community days promised for 2027.",
        image: HERO_IMG,
        imageAlt: HERO_ALT,
        imageCredit: AI_NOTE,
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on what's changing on the east side of the valley.",
        stories: [
          {
            name: "Desert Pines Golf Course redevelopment",
            href: "/guides/desert-pines-golf-course-redevelopment-east-las-vegas",
            category: "Growth & Development",
            dek: "What's planned for the closed course at Bonanza and Pecos.",
          },
          {
            name: "Sloan Lane bridge over the Las Vegas Wash",
            href: "/guides/sloan-lane-bridge-las-vegas-wash-east-las-vegas",
            category: "Local Feature",
            dek: "A new east-side crossing and what it connects.",
          },
          {
            name: "Gholson Landing",
            href: "/guides/gholson-landing-affordable-housing-east-las-vegas",
            category: "Local Feature",
            dek: "New affordable housing on the east side.",
          },
        ],
      }}
      ctas={{
        heading: "Thinking about the east side?",
        body:
          "Parks, schools, commutes and what's actually changing. Tell me what you need day to day and I'll give you a straight answer on where it fits.",
      }}
    >
      <StoryLede
        kicker="New & Noteworthy"
        lead="If you grew up in east Las Vegas or had a kid in youth baseball here, you know Big League Dreams: the complex at Pecos and Washington with the mini versions of famous big-league ballparks. It has a new name now. On Nov. 10, Unrivaled Sports officially unveiled Unrivaled Sports Park Las Vegas after a renovation the company puts at $6 million. Here's what actually changed, what the company is promising the neighborhood, and what the city is adding to the rest of the park next year."
      />

      <StorySection heading="The short version">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">What:</span> the former Big
            League Dreams youth baseball complex, now called Unrivaled Sports
            Park Las Vegas.
          </li>
          <li>
            <span className="text-lvinit-black">Where:</span> inside the
            City of Las Vegas&rsquo; Gary Reese Freedom Park, at the corner of
            Pecos Road and Washington Avenue in east Las Vegas. The city lists
            the park at 850 N. Mojave Road.
          </li>
          <li>
            <span className="text-lvinit-black">What changed:</span> six
            rebuilt fields with nearly 980,000 square feet of new turf,
            restored replica outfield walls, new home-run netting, new signage
            and about 6,000 square feet of renovated restaurant space.
          </li>
          <li>
            <span className="text-lvinit-black">Cost:</span> $6 million,
            according to Unrivaled Sports. (Fox5 reported &ldquo;more than $4
            million&rdquo; in upgrades.)
          </li>
          <li>
            <span className="text-lvinit-black">Next:</span> free community
            access days and youth clinics for Ward 3 in 2027, plus a splash
            pad, sand volleyball, restrooms and shade the city plans for the
            surrounding park.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="From Big League Dreams to Unrivaled">
        <p className="text-body-lg text-lvinit-warmgray">
          The complex opened in January 2010 as Big League Dreams. Unrivaled
          Sports, a youth sports company whose brands include Cooperstown All
          Star Village and Ripken Experiences, took it over in January 2025.
          At the time, the company says, it committed $2 million in
          improvements over 18 months. It says it ended up spending more than
          three times that.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          According to the company, Las Vegas is the first of its venues to
          carry the Unrivaled Sports Park name. Unrivaled operates 15 venues in
          total.
        </p>
      </StorySection>

      <StorySection heading="What actually changed">
        <p className="text-body-lg text-lvinit-warmgray">
          The fields are the big one. All six baseball fields were rebuilt,
          with nearly 980,000 square feet of new artificial turf between them.
          The replica outfield walls, the thing most people remember about this
          place, were restored and reinforced rather than torn out. Fox5
          reports the six fields are scaled-down versions of Fenway Park,
          Yankee Stadium, Dodger Stadium, Wrigley Field, Angel Stadium and
          Crosley Field.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Beyond the fields, the company replaced the perimeter home-run
          netting, added new signage and wayfinding, and upgraded landscaping,
          technology and infrastructure. The two restaurants on site, about
          6,000 square feet combined, were renovated too.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          &ldquo;Our goal was never simply to put a new name on this park,&rdquo;
          Unrivaled Sports president Wade Martin said in the company&rsquo;s
          announcement.
        </p>
      </StorySection>

      <StorySection muted heading="What it means for people who live nearby">
        <p className="text-body-lg text-lvinit-warmgray">
          A complex like this mostly runs on leagues and tournaments, and the
          company is clearly aiming at both: it&rsquo;s pitching the park as a
          home field for local players and a stop for regional and national
          tournaments. Starting in 2027, it will also host the Vegas for
          Athletes baseball tournament.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The part that matters more for the surrounding neighborhood is what
          Unrivaled says it will do in 2027:
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>free community access days;</li>
          <li>baseball and softball clinics for Ward 3 youth;</li>
          <li>playoff and championship games for local schools;</li>
          <li>an annual back-to-school event for Ward 3 families.</li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          No dates have been announced for any of those. If you live on the
          east side and have kids in baseball or softball, they&rsquo;re worth
          watching for. The test will be whether they actually happen.
        </p>
      </StorySection>

      <StorySection heading="The rest of Freedom Park is getting work too">
        <p className="text-body-lg text-lvinit-warmgray">
          The ballpark sits inside Gary Reese Freedom Park, a 68-acre city park
          that already has a lot going on: a family pool, a skate park, a dog
          park with large and small dog runs, playgrounds, a disc golf field,
          a walking path, soccer practice fields and reservable picnic areas.
          City park hours are 7 a.m. to 11 p.m.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The city lists four additions coming in 2027: two sand volleyball
          courts, a new splash pad, restrooms and a new shade structure. Put
          that together with the ballpark renovation and this corner of the
          east side is getting real investment, the same stretch of Pecos where
          the{" "}
          <Link
            href="/guides/desert-pines-golf-course-redevelopment-east-las-vegas"
            className={linkCls}
          >
            Desert Pines golf course redevelopment
          </Link>{" "}
          is being planned a short drive south at Bonanza.
        </p>
      </StorySection>

      <StorySection muted heading="Before you go">
        <Figure
          src="/images/unrivaled-sports-park-las-vegas-entrance.webp"
          alt="Unrivaled Sports Park Las Vegas entrance with a large baseball sculpture."
          caption={`The entrance to Unrivaled Sports Park Las Vegas. ${AI_NOTE}`}
        />
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Park vs. ballpark:</span> the
            city&rsquo;s 7 a.m. to 11 p.m. hours are for Gary Reese Freedom
            Park. The ballpark complex is run by Unrivaled Sports and may keep
            its own schedule, so check with them before you go.
          </li>
          <li>
            <span className="text-lvinit-black">Leagues and teams:</span>{" "}
            Unrivaled Sports hasn&rsquo;t published league or rental pricing in
            its announcement. Contact the company through UnrivaledSports.com.
          </li>
          <li>
            <span className="text-lvinit-black">City park fields and
            pavilions:</span> those are booked through the City of Las Vegas,
            which has field-use and pavilion reservations on its{" "}
            <a href={CITY_PARK} className={extCls} target="_blank" rel="noopener noreferrer">
              Freedom Park page
            </a>
            .
          </li>
        </ul>
      </StorySection>

      <StorySection heading="What I haven't confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Hours and access.</span>{" "}
            Whether the public can walk in on non-event days, and when.
          </li>
          <li>
            <span className="text-lvinit-black">2027 dates.</span> No dates
            for the community days, clinics or back-to-school event.
          </li>
          <li>
            <span className="text-lvinit-black">The final cost.</span> $6
            million is the company&rsquo;s figure; Fox5 reported more than $4
            million.
          </li>
          <li>
            <span className="text-lvinit-black">Photos.</span> The images on
            this page were edited and extended with AI.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          New to the valley and trying to figure out the different sides of
          town? Start with{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            moving to Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection muted heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Unrivaled Sports</span>,
            Unrivaled Sports Park Las Vegas unveiled following $6 million
            transformation, Nov. 10, 2026.{" "}
            <a href={RELEASE} className={extCls} target="_blank" rel="noopener noreferrer">
              PR Newswire
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">City of Las Vegas</span>, Gary
            Reese Freedom Park.{" "}
            <a href={CITY_PARK} className={extCls} target="_blank" rel="noopener noreferrer">
              lasvegasnevada.gov
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KSNV News 3 Las Vegas</span>,
            Nov. 11, 2026.{" "}
            <a href={KSNV} className={extCls} target="_blank" rel="noopener noreferrer">
              news3lv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">FOX5 Las Vegas</span>, Nov.
            10, 2026.{" "}
            <a href={FOX5} className={extCls} target="_blank" rel="noopener noreferrer">
              fox5vegas.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
