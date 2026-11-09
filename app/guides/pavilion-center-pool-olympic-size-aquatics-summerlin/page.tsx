import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// NEW & NOTEWORTHY / NEIGHBORHOODS — Pavilion Center Pool Complex, Summerlin.
// Built by the LVINIT Daily Publisher (2026-11-09) from Local Radar assignment
// LR-PAVILION-CENTER-AQUATICS (READY - first-party media recommended).
//
// FACT DISCIPLINE (City of Las Vegas Pavilion Center Pool page re-read 2026-11-09):
// - 101 S. Pavilion Center Drive, 89144; 702-229-1488.
// - Indoor: 14-lane competitive pool, two 1-meter springboards, lockers.
// - Outdoor: Olympic-size, year-round, 7 ft deep throughout; 8-lane 50-meter,
//   8-lane 25-meter, 19-lane 25-yard; 900-seat bleachers (Local Radar, from
//   the City page + News3LV/Fox5).
// - Fees: $3 adult / $2 ages 4-17 and 50+ / free 3 and under; 1-month swim pass
//   $30 adult, $15 youth/senior; 3-month $35 / $70; valid at all City pools.
// - Closed Sundays and holidays. Outdoor hours posted through Dec 31, 2026 are
//   lap-swim blocks; indoor pool lists recreational swim.
// - News3LV: opened June 29, 2026; $18.9M; Korte Company; funding mix.
// - Fox5 (June 25): ribbon-cutting; parks director quote paraphrased only.
// OMITTED ON PURPOSE: outdoor open/recreational swim promises, hard-coded
//   hours (they change), groundbreaking date, specific event dates.
// IMAGERY: no first-party Pavilion Center photo exists. Hero is Mikey's drone
//   photo of Grand Park in Summerlin West, captioned as context only.
// ---------------------------------------------------------------------------

const PATH = "/guides/pavilion-center-pool-olympic-size-aquatics-summerlin";
const HERO_IMG = "/images/editorial/summerlin-west-grand-park-ballfields-playground-aerial.jpg";
const HERO_ALT =
  "Aerial view of Grand Park's shaded playground and ballfields with new homes and desert mountains behind in Summerlin West.";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";
const CITY_POOL =
  "https://www.lasvegasnevada.gov/Residents/Parks-Facilities/Pavilion-Center-Pool";

const TITLE =
  "Pavilion Center Pool in Summerlin: The City's New Outdoor Olympic-Size Pool, Costs and What to Know";

const meta: StoryMeta = {
  title: `${TITLE} | LVINIT`,
  headline: TITLE,
  description:
    "The City of Las Vegas opened a $18.9 million outdoor Olympic-size pool at the Pavilion Center in Summerlin. Daily swim is $2 to $3. Here's what's there, what it costs and what to check first.",
  path: PATH,
  image: HERO_IMG,
  imageWidth: 1920,
  imageHeight: 1080,
  imageAlt: HERO_ALT,
  datePublished: "2026-11-09",
  dateModified: "2026-11-09",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Pavilion Center Pool", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function PavilionCenterPoolPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "New & Noteworthy",
        headline: TITLE,
        subheadline:
          "A second pool at the Pavilion Center opened June 29, 2026. Public swim costs $2 to $3 a day.",
        image: HERO_IMG,
        imageAlt: HERO_ALT,
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on parks, amenities and what's changing in Summerlin.",
        stories: [
          {
            name: "The Summerlin Parkway Trail",
            href: "/guides/summerlin-parkway-trail-summerlin-las-vegas",
            category: "Local Feature",
            dek: "The $26 million trail the City is building from the 215 to Rampart.",
          },
          {
            name: "Municipal Gym at Downtown Summerlin",
            href: "/guides/municipal-gym-downtown-summerlin",
            category: "Local Feature",
            dek: "A new gym coming to Downtown Summerlin.",
          },
          {
            name: "Summerlin vs. Henderson",
            href: "/guides/summerlin-vs-henderson",
            category: "Comparison",
            dek: "How the two big master-planned areas compare.",
          },
        ],
      }}
      ctas={{
        heading: "Thinking about Summerlin?",
        body:
          "Tell me how you like to spend your weekends and I'll give you an honest read on which part of the valley fits.",
      }}
    >
      <StoryLede
        kicker="New & Noteworthy"
        lead="The City of Las Vegas now has an outdoor Olympic-size pool in Summerlin. It sits next to the existing indoor pool at the Pavilion Center, it's open to the public for a few dollars, and it's built for serious swimming more than splashing around."
      />

      <StorySection heading="The short version">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Where:</span> the Pavilion Center
            Pool Complex, 101 S. Pavilion Center Drive, Las Vegas 89144, in
            Summerlin. It&rsquo;s a City of Las Vegas facility.
          </li>
          <li>
            <span className="text-lvinit-black">What&rsquo;s new:</span> an
            outdoor, year-round, Olympic-size pool that opened to the public on
            June 29, 2026, after a ribbon-cutting on June 25. It joins the
            existing 14-lane indoor pool.
          </li>
          <li>
            <span className="text-lvinit-black">Cost to build:</span> $18.9
            million, per News3LV. Roughly $9 million came from a Southern Nevada
            Public Lands Management Act grant and $1 million from the Southern
            Nevada Sandpipers Swimming Booster Club, with city funds covering the
            rest.
          </li>
          <li>
            <span className="text-lvinit-black">Cost to swim:</span> $3 for
            adults, $2 for ages 4 to 17 and 50+, free for ages 3 and under,
            according to the City.
          </li>
          <li>
            <span className="text-lvinit-black">Closed:</span> Sundays and City
            holidays.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="What's at the complex">
        <p className="text-body-lg text-lvinit-warmgray">
          The City describes the outdoor pool as 7 feet deep throughout. It
          includes an 8-lane, 50-meter pool, an 8-lane, 25-meter pool and a
          19-lane, 25-yard pool, with bleachers for about 900 people, plus a
          classroom and lockers. That layout is what lets the facility host
          regional and national swim meets, not just daily laps. Korte Company
          built it and the City&rsquo;s Public Works department managed the
          project.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The indoor side has a 14-lane competitive pool, two 1-meter
          springboards, lockers, patios and a pavilion. The City lists swim
          lessons (group, semi-private and private), water exercise classes for
          ages 16 and up, birthday party and pool rentals, and youth water polo,
          artistic swimming, diving and swim teams. Fox5 reported that the
          outdoor pool also opens the door to programs like kayaking and
          fitness classes.
        </p>
      </StorySection>

      <StorySection heading="What it costs">
        <p className="text-body-lg text-lvinit-warmgray">
          Per the City&rsquo;s posted fees: daily open swim is $3 for adults
          and $2 for ages 4 to 17 and 50+, with ages 3 and under free. A
          1-month swim pass is $30 for adults and $15 for youth and seniors,
          and a 3-month pass is $70 and $35. Swim passes are valid at all City
          of Las Vegas pools, so a pass here also works at the City&rsquo;s other
          pools. Water exercise runs $3 a class.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Rules to know before you go: children under 7, or under 48 inches
          tall, must be with an adult 18 or older, and the City is strict about
          swim attire.
        </p>
      </StorySection>

      <StorySection muted heading="Who it's actually for">
        <p className="text-body-lg text-lvinit-warmgray">
          Read the posted schedule before you plan a family pool day. The
          City&rsquo;s current outdoor hours are lap-swim blocks, long course
          or short course, with a minimum of two lap lanes available, while the
          indoor pool lists recreational swim hours. I can&rsquo;t tell you from
          what&rsquo;s published that the outdoor pool is a drop-in recreational
          swim spot, so don&rsquo;t show up with the kids expecting that. For
          lap swimmers, club swimmers and anyone training, it&rsquo;s a real
          upgrade, and it&rsquo;s one of very few places in the valley to swim
          laps outside year-round.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Hours are posted through Dec. 31, 2026 and change with the season,
          and November has several closures. Rather than repeat a schedule
          that will go stale, use the{" "}
          <a
            href={CITY_POOL}
            className={extCls}
            target="_blank"
            rel="noopener noreferrer"
          >
            City&rsquo;s Pavilion Center Pool page
          </a>{" "}
          or call 702-229-1488.
        </p>
      </StorySection>

      <StorySection heading="Why it matters for Summerlin living">
        <p className="text-body-lg text-lvinit-warmgray">
          Summerlin is known for parks and trails, and public aquatics is part
          of that. Fox5 quoted the City&rsquo;s parks director saying the City
          had not opened an outdoor Olympic-size pool in at least two decades,
          so this is a notable addition rather than a routine upgrade. If
          you&rsquo;re weighing neighborhoods, it&rsquo;s a day-to-day amenity
          worth knowing about, the same way you&rsquo;d note a park or a
          recreation center. I&rsquo;m not making any claim about home values.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          For the bigger picture, start with the{" "}
          <Link href="/neighborhoods/summerlin" className={linkCls}>
            Summerlin neighborhood guide
          </Link>
          . Other recent additions nearby include the{" "}
          <Link
            href="/guides/summerlin-parkway-trail-summerlin-las-vegas"
            className={linkCls}
          >
            Summerlin Parkway Trail
          </Link>{" "}
          and the coming{" "}
          <Link
            href="/guides/municipal-gym-downtown-summerlin"
            className={linkCls}
          >
            Municipal Gym at Downtown Summerlin
          </Link>
          . New to the valley? Start with{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection muted heading="What I haven't confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Outdoor recreational swim.</span>{" "}
            The posted outdoor hours are lap swim. I haven&rsquo;t found
            anything promising open play outdoors.
          </li>
          <li>
            <span className="text-lvinit-black">Current hours.</span> They
            change by season and with events. Check the City before you go.
          </li>
          <li>
            <span className="text-lvinit-black">First-hand look.</span> I
            haven&rsquo;t swum or filmed at the pool for LVINIT yet, so this
            piece rests on City sources and news reporting. The photo above is
            contextual: it shows Grand Park in Summerlin West, not the Pavilion
            Center.
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">City of Las Vegas</span>,
            Pavilion Center Pool.{" "}
            <a href={CITY_POOL} className={extCls} target="_blank" rel="noopener noreferrer">
              lasvegasnevada.gov
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">City of Las Vegas</span>,
            Aquatics.{" "}
            <a
              href="https://www.lasvegasnevada.gov/aquatics"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              lasvegasnevada.gov
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">News3LV</span>, Las Vegas opens
            $18.9M aquatics center with second Olympic-size pool.{" "}
            <a
              href="https://news3lv.com/news/local/las-vegas-opens-189m-aquatics-center-with-second-olympic-sized-pool"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              news3lv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>, June 25,
            2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/06/25/las-vegas-opens-new-olympic-sized-outdoor-pool-pavilion-center-summerlin/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
