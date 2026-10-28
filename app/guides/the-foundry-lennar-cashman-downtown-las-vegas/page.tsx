import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import {
  StoryPage,
  StoryGallery,
  StoryLede,
  StorySection,
  StoryPullQuote,
} from "@/components/story";

// ---------------------------------------------------------------------------
// GROWTH & DEVELOPMENT — The Foundry (Lennar) at the former Cashman Center and
// Grant Sawyer sites. Built by the LVINIT Daily Publisher from Local Radar
// assignment LR-THE-FOUNDRY-CASHMAN (primary assignment, READY).
//
// FACT DISCIPLINE — read this run:
// - Nevada Governor's release, July 22, 2026: Lennar selected by the City of
//   Las Vegas through a competitive process; 1,000+ homes; $36.15M sale
//   approved by council March 2025; ~$207M state savings from relocating
//   employees; construction after demolition and after the Las Vegas Lights
//   FC 2026 season; part of the Cashman District redevelopment.
// - Fox5, Oct 15-16, 2026: ceremonial groundbreaking; 1,000+ homes; single
//   family + townhomes in six collections; starting in the $300,000s; 70+
//   acres; construction slated for "next October" (reported, secondary);
//   Summers-Armstrong amenity comments; near Las Vegas Blvd / Washington Ave.
// - News 3, Oct 15, 2026: project name "The Foundry"; Lombardo, Berkley and
//   Lennar attended; ~70 acres; ~1,000 homes at full build-out.
// DELIBERATELY OMITTED (unresolved): per-site unit counts, price by
// collection, exact construction start, sales-office/model timing.
// IMAGERY — Mikey-supplied LVINIT images (added 2026-10-28): the ceremonial
// groundbreaking (hero) and the Lennar / AB LA site-plan board shown at the
// event (inline). The site plan is a planning graphic, not built homes; the
// caption says so. People in the photo are not identified.
// ---------------------------------------------------------------------------

const HERO =
  "/images/the-foundry-lennar-homes-downtown-las-vegas-groundbreaking.webp";
const HERO_ALT =
  "Officials and Lennar representatives in hard hats turn gold shovels of gravel at the ceremonial groundbreaking for The Foundry, with a Deere loader, a stage and an American flag behind them.";
const MAP =
  "/images/the-foundry-lennar-homes-downtown-las-vegas-community-map.webp";
const MAP_ALT =
  "Lennar and AB LA site plan board for The Foundry showing rows of planned homes, with East Washington Avenue, North Maryland Parkway, Las Vegas Boulevard North and the Las Vegas Natural History Museum labeled.";

const PATH = "/guides/the-foundry-lennar-cashman-downtown-las-vegas";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const meta: StoryMeta = {
  title:
    "The Foundry: Lennar's 1,000-Home Neighborhood at Cashman, Explained | LVINIT",
  headline:
    "The Foundry: What Lennar's 1,000-Home Neighborhood at Cashman Means for Downtown Las Vegas",
  description:
    "Lennar broke ground on The Foundry, 1,000+ homes starting in the $300,000s on the former Cashman Center and Grant Sawyer sites. What's confirmed, what isn't, and what it means for downtown.",
  path: PATH,
  image: HERO,
  imageWidth: 1740,
  imageHeight: 904,
  imageAlt: HERO_ALT,
  datePublished: "2026-10-28",
  dateModified: "2026-10-28",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "The Foundry at Cashman", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function FoundryCashmanPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Growth & Development",
        headline:
          "The Foundry: What Lennar's 1,000-Home Neighborhood at Cashman Means for Downtown Las Vegas",
        subheadline:
          "A ceremonial groundbreaking on October 15 kicked off the biggest for-sale housing project downtown in years. Here's what's confirmed, what's still a reported timeline, and what it changes.",
        image: HERO,
        imageAlt: HERO_ALT,
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "More on new construction, downtown, and how big redevelopments are reshaping the valley.",
        stories: [
          {
            name: "New Build vs. Resale in Las Vegas",
            href: "/guides/new-build-vs-resale-las-vegas",
            category: "Homes & Real Estate",
            dek: "How to think about buying new versus existing before a project like this reaches the market.",
          },
          {
            name: "Downtown Las Vegas Arts District Guide",
            href: "/neighborhoods/downtown-arts-district",
            category: "Neighborhoods",
            dek: "The neighborhood just down the road from the Cashman site.",
          },
          {
            name: "Gholson Landing: Affordable Housing in East Las Vegas",
            href: "/guides/gholson-landing-affordable-housing-east-las-vegas",
            category: "Growth & Development",
            dek: "Another housing project reshaping part of the valley.",
          },
        ],
      }}
      ctas={{
        heading: "Thinking about downtown or a new build?",
        body:
          "A project that starts building homes in 2027 is a long runway. If you're deciding where to live now, tell me where you're starting from and I'll give you an honest read.",
      }}
    >
      <StoryLede
        kicker="Growth & Development"
        lead="On Thursday, October 15, Gov. Joe Lombardo, Mayor Shelley Berkley and Lennar held a ceremonial groundbreaking for The Foundry, a planned neighborhood of more than 1,000 homes on the former Cashman Center and Grant Sawyer State Office Building sites. It's the largest for-sale housing project downtown in years. It's also early: no homes are for sale, and the reported start of home construction is about a year out."
      />

      <StorySection heading="What was announced">
        <p className="text-body-lg text-lvinit-warmgray">
          The Foundry is a mix of{" "}
          <span className="text-lvinit-black">single-family homes and townhomes</span>,
          reported as six collections, with prices expected to start in the{" "}
          <span className="text-lvinit-black">$300,000s</span> (Fox5). Reporting
          puts the site at roughly <span className="text-lvinit-black">70 acres</span>,
          and the project at <span className="text-lvinit-black">1,000-plus homes</span>{" "}
          at full build-out. Lennar was selected by the City of Las Vegas
          through a competitive process, per the state&rsquo;s July release.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The land has a long public-sector history. The state sold the Grant
          Sawyer property for <span className="text-lvinit-black">$36.15 million</span>,
          approved by the Las Vegas City Council in March 2025, and says
          relocating state employees to a newer campus near Harry Reid
          International Airport saves about $207 million. Demolition of the
          Grant Sawyer building began in July.
        </p>
      </StorySection>

      <StorySection heading="Where it is">
        <p className="text-body-lg text-lvinit-warmgray">
          The site sits near Las Vegas Boulevard and East Washington Avenue,
          just north of the core of downtown, in the city&rsquo;s Cashman
          District. The site plan shown at the groundbreaking labels East
          Washington Avenue along the top and North Maryland Parkway along the
          bottom, with the Las Vegas Natural History Museum next door and a
          parcel along Las Vegas Boulevard North marked as proposed
          commercial. This is not the Arts District; it&rsquo;s a different
          pocket, with Cashman Field and the old state building as its
          anchors. Check a map before you plan around it, and note that the
          site is an active demolition and construction area, not open to the
          public.
        </p>
      </StorySection>

      <StoryPullQuote cite="Mayor Shelley Berkley, in the state's July 22, 2026 release">
        We need residential developments for all income levels.
      </StoryPullQuote>

      <StorySection heading="What it means for downtown">
        <p className="text-body-lg text-lvinit-warmgray">
          Downtown housing has leaned toward apartments and condos. A
          neighborhood of detached homes and townhomes starting in the $300,000s
          adds a different kind of option close to the urban core. Ward 5
          Councilwoman Shondra Summers-Armstrong described the homes as being
          in an affordable range and mentioned pools, pool houses, dog parks
          and children&rsquo;s parks as planned community features (Fox5).
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If you&rsquo;re weighing new construction in general, our{" "}
          <Link href="/guides/new-build-vs-resale-las-vegas" className={linkCls}>
            new build vs. resale guide
          </Link>{" "}
          and{" "}
          <Link href="/guides/buying-new-construction-las-vegas" className={linkCls}>
            new construction buying guide
          </Link>{" "}
          cover what to check. For the neighborhood next door to this one, see
          the{" "}
          <Link href="/neighborhoods/downtown-arts-district" className={linkCls}>
            Downtown Arts District guide
          </Link>
          . New to the area? Start with{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>
          .
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          What it does <em>not</em> tell you: final prices by collection, floor
          plans, HOA costs, or how traffic and nearby home values will change.
          None of that is published, and I&rsquo;m not going to guess.
        </p>
      </StorySection>

      <StoryGallery
        columns={1}
        images={[
          {
            src: MAP,
            alt: MAP_ALT,
            label: "The site plan",
            caption:
              "The Lennar and AB LA site plan board displayed at the groundbreaking. It's a planning graphic, not built homes, and the layout could change.",
          },
        ]}
      />

      <StorySection muted heading="What's still unconfirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">When homes start.</span> Fox5
            reports construction slated for October 2027. The state&rsquo;s
            release says construction follows demolition and the end of the
            Las Vegas Lights FC 2026 season. Treat 2027 as reported, not
            confirmed.
          </li>
          <li>
            <span className="text-lvinit-black">Unit counts by site</span> and
            pricing by collection.
          </li>
          <li>
            <span className="text-lvinit-black">Sales timing.</span> No model
            homes or sales office are open, and I haven&rsquo;t seen a
            published opening date.
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Nevada Governor&rsquo;s Office</span>,
            Grant Sawyer demolition release, July 22, 2026.{" "}
            <a
              href="https://gov.nv.gov/press-releases/grant-sawyer-building-demolition-marks-major-milestone-in-governor-lombardos-housing-agenda"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              gov.nv.gov
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>, downtown
            housing project coverage, October 2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/10/16/downtown-las-vegas-housing-project-bring-1000-homes-starting-300000s/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">News 3 Las Vegas</span>,
            groundbreaking coverage, October 15, 2026.{" "}
            <a
              href="https://news3lv.com/news/local/las-vegas-breaks-ground-on-1000-plus-homes-near-cashman-field-grant-sawyer-building"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              news3lv.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
