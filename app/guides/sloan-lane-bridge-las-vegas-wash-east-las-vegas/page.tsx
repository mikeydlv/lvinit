import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// GROWTH & DEVELOPMENT — Sloan Lane extension and bridge over the Las Vegas Wash.
// Built by the LVINIT Daily Publisher (2026-11-05). Local Radar had no READY
// assignment; topic came from a Development Watch signal (KTNV, Nov 3).
//
// FACT DISCIPLINE (all read 2026-11-05):
// - Clark County project page (clarkcountynv.gov/news/092525-sloan-lane-construction):
//   $13.9M; Sloan Lane from Vegas Valley Dr to Ruby Creek Dr; bridge over the
//   Las Vegas Wash; sidewalks, median, curb/gutter, channel, storm drain,
//   streetlights, traffic signal, utility work, markings/signage; extra work at
//   Sahara Ave and Sloan Lane; completion expected "Winter 2026"; Segerblom quotes.
// - Fox5, Oct 24 2026: construction began Sept 2025; opened; mixed resident reaction.
// - KTNV, ~Nov 3 2026: opened to public Oct 23 per Commissioner Segerblom; gas-tax
//   funding per Segerblom; more east-side road work planned.
// OMITTED ON PURPOSE: lane count, bridge length, bike lanes, contractor, traffic
//   counts (none reported); exact groundbreaking day (county page gives no date).
// IMAGERY: hero is public/images/hero/sloan-lane-bridge.png, supplied by Mikey
//   for this article (2026-11-06). Its original capture source is not documented
//   in the repo, so no photographer credit or "I shot this" claim is made. Alt
//   text describes only what is visible.
// ---------------------------------------------------------------------------

const PATH = "/guides/sloan-lane-bridge-las-vegas-wash-east-las-vegas";
const HERO_IMG = "/images/hero/sloan-lane-bridge.png";
const HERO_ALT =
  "Newly paved road with marked crosswalks, yellow pedestrian-crossing signs on an overhead arm and posts, and a fenced concrete bridge wall alongside, with open desert and mountains in the distance under a clear blue sky.";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const TITLE =
  "The New Sloan Lane Bridge: What Clark County Just Opened Over the Las Vegas Wash";

const meta: StoryMeta = {
  title: `${TITLE} | LVINIT`,
  headline: TITLE,
  description:
    "Clark County opened the $13.9 million Sloan Lane extension and bridge over the Las Vegas Wash on Oct. 23, 2026, linking Ruby Creek Drive to Vegas Valley Drive. What it connects, who is happy, who isn't, and what isn't confirmed.",
  path: PATH,
  image: HERO_IMG,
  imageWidth: 1676,
  imageHeight: 938,
  imageAlt: HERO_ALT,
  datePublished: "2026-11-05",
  dateModified: "2026-11-05",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Sloan Lane Bridge", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function SloanLaneBridgePage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Growth & Development",
        headline: TITLE,
        subheadline:
          "A $13.9 million road extension gives part of the east valley a new way to cross the wash. Residents are split on it.",
        image: HERO_IMG,
        imageAlt: HERO_ALT,
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on how the east side of the valley is changing.",
        stories: [
          {
            name: "Gholson Landing in East Las Vegas",
            href: "/guides/gholson-landing-affordable-housing-east-las-vegas",
            category: "Local Feature",
            dek: "121 affordable apartments that just opened on Sunrise Avenue.",
          },
          {
            name: "Patriot Housing LV in Sunrise Manor",
            href: "/guides/patriot-housing-lv-sunrise-manor-veteran-housing",
            category: "Local Feature",
            dek: "What commissioners approved for 348 veteran-focused apartments.",
          },
          {
            name: "Maryland Parkway and the RTC Red Line",
            href: "/guides/maryland-parkway-red-line-rtc-las-vegas",
            category: "Local Feature",
            dek: "The east-side transit line that launched in August.",
          },
        ],
      }}
      ctas={{
        heading: "Figuring out where to live in the valley?",
        body:
          "Tell me what your commute and daily life look like and I'll give you an honest read on where to look.",
      }}
    >
      <StoryLede
        kicker="Growth & Development"
        lead="Clark County opened the Sloan Lane extension on Oct. 23, 2026. It carries Sloan Lane over the Las Vegas Wash and links Ruby Creek Drive to Vegas Valley Drive. Some neighbors say it saves them time. Others say they didn't want it."
      />

      <StorySection heading="The short version">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">What:</span> a new paved
            extension of Sloan Lane with a bridge over the Las Vegas Wash,
            connecting Ruby Creek Drive and Vegas Valley Drive.
          </li>
          <li>
            <span className="text-lvinit-black">Cost:</span> $13.9 million,
            according to Clark County.
          </li>
          <li>
            <span className="text-lvinit-black">Timeline:</span> construction
            began in September 2025 and the bridge opened to the public on
            Oct. 23, 2026, per Commissioner Tick Segerblom. The county&rsquo;s
            project page had expected completion in winter 2026.
          </li>
          <li>
            <span className="text-lvinit-black">Also built:</span> sidewalks, a
            median, curb and gutter, storm drain, streetlights and a traffic
            signal, plus additional work at Sahara Avenue and Sloan Lane.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="What it means for people who live there">
        <p className="text-body-lg text-lvinit-warmgray">
          The point of a road like this is simple: before, getting between
          these neighborhoods and Vegas Valley Drive meant going around.
          Segerblom said the connection would save residents more than a mile
          of driving. One nearby resident told Fox5 it saves her family about
          a mile and a half on the trip to her kids&rsquo; activities. A
          cyclist told KTNV the new route lets him skip some of the traffic
          lights on Nellis Boulevard, and called the wider sidewalks a real
          improvement for people walking and biking.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The flip side is the one every new connector road runs into. Fox5
          also spoke with a neighbor who opposed the bridge because he valued
          how quiet the area was and expects more cut-through traffic. Another
          resident told KTNV that some drivers go slowly through the
          neighborhood while others fly through, and asked people to slow
          down. That is a fair read of the tradeoff: a faster connection for
          some, more cars on streets that used to see fewer.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If you&rsquo;re weighing a home near a new connector, it&rsquo;s
          worth walking the streets at rush hour before you decide. A road
          that opened weeks ago hasn&rsquo;t settled into its real traffic
          pattern yet.
        </p>
      </StorySection>

      <StorySection heading="Who paid for it, and what's next">
        <p className="text-body-lg text-lvinit-warmgray">
          Segerblom told KTNV the bridge was funded with gas tax money and that
          more road improvements are planned for the east side in the coming
          years. The county&rsquo;s project page doesn&rsquo;t break down
          funding, and no specific follow-up projects have been named, so treat
          that as direction, not a schedule. The county&rsquo;s own framing,
          in Segerblom&rsquo;s words: &ldquo;This bridge is more than
          infrastructure; it builds connection and access for our
          community.&rdquo;
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It lands alongside other east-side change I&rsquo;ve covered, from
          the{" "}
          <Link
            href="/guides/maryland-parkway-red-line-rtc-las-vegas"
            className={linkCls}
          >
            RTC Red Line on Maryland Parkway
          </Link>{" "}
          to new housing like{" "}
          <Link
            href="/guides/gholson-landing-affordable-housing-east-las-vegas"
            className={linkCls}
          >
            Gholson Landing
          </Link>{" "}
          and{" "}
          <Link
            href="/guides/patriot-housing-lv-sunrise-manor-veteran-housing"
            className={linkCls}
          >
            Patriot Housing LV
          </Link>
          . I&rsquo;m not claiming those projects sit next to this bridge. They
          are part of the same broader picture of the east valley getting
          attention and investment.
        </p>
      </StorySection>

      <StorySection muted heading="What I haven't confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Lanes and bridge length.</span>{" "}
            None of the coverage I found says, so I&rsquo;m not guessing.
          </li>
          <li>
            <span className="text-lvinit-black">Bike lanes.</span> One rider
            described the route as good for biking, but I haven&rsquo;t seen a
            county description of dedicated bike facilities.
          </li>
          <li>
            <span className="text-lvinit-black">Traffic counts.</span> No
            numbers have been published on how much traffic the bridge carries.
          </li>
          <li>
            <span className="text-lvinit-black">Official opening notice.</span>{" "}
            I didn&rsquo;t find a county press release on the opening itself.
            The Oct. 23 date comes from Segerblom as quoted by KTNV.
          </li>
          <li>
            <span className="text-lvinit-black">First-hand look.</span> I
            haven&rsquo;t filmed or walked this route for LVINIT yet, so this
            piece rests on county records and news reporting, not a site visit.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          New to the valley and trying to make sense of the map? Start with{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Clark County</span>, Sloan Lane
            improvements project page.{" "}
            <a
              href="https://www.clarkcountynv.gov/news/092525-sloan-lane-construction"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              clarkcountynv.gov
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>, Oct. 24,
            2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/10/25/sloan-lane-bridge-opening-comes-with-mixed-reactions-nearby-residents/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KTNV 13 Action News</span>,
            early November 2026.{" "}
            <a
              href="https://ktnv.com/neighborhoods/east-las-vegas/new-sloan-lane-bridge-sidewalk-improves-access-for-east-las-vegas-residents"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              ktnv.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
