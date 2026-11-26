import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// GROWTH & DEVELOPMENT — Iron Mountain Road extension and the Decatur Blvd
// closure, northwest Las Vegas. Built by the LVINIT Daily Publisher from Local
// Radar assignment LR-IRON-MOUNTAIN-RD-EXTENSION.
//
// FACT DISCIPLINE — read this run (2026-11-17):
// - City of Las Vegas release "Work Begins On Iron Mountain Road Improvements
//   Nov. 16" (govdelivery bulletin 432fd38, read): extends Iron Mountain Rd
//   between Thom Blvd and Bradley Rd; Decatur work starts Nov. 16 to prepare;
//   $13.4M; completion expected Q4 2027. Phase 1: Decatur fully closed between
//   Iron Mountain and the Ice Age Fossils State Park entrance; Decatur traffic
//   to Brent Lane and Iron Mountain, Thom Blvd for north/south; 7 a.m.-6 p.m.
//   Mon-Fri. Phase 2: Iron Mountain closed between Decatur and Bradley, Thom
//   closed just south of Iron Mountain; storm drain, pavement, curbs, gutters,
//   sidewalks, streetlights; starts at the northbound lane at Iron
//   Mountain/Bradley. Alternates: Brent Lane east/west, Bradley Rd southbound.
//   Contractor Tand Inc.; funded by RTC of Southern Nevada and Clark County
//   Regional Flood Control District. Construction questions: 702-308-4914.
// - KSNV / News 3, Nov. 16, 2026 (read): matches the release.
// DELIBERATELY OMITTED (Local Radar mustNotClaim / unresolved): Phase 2 start
// date; Phase 1 duration; any change to Ice Age Fossils State Park access or
// hours; the road's current condition between Thom and Bradley; lane counts,
// bike lanes, traffic volumes; compass directions between streets not stated
// in the release.
// IMAGERY — No LVINIT photography of this corridor exists in the image library
// and no first-party media was added the morning of publication. Photoless
// StoryHero and no card image, per the standard fallback. Nearby Monument
// Hills imagery was not used: it is a different place.
// ---------------------------------------------------------------------------

const PATH = "/guides/iron-mountain-road-extension-decatur-closure-northwest-las-vegas";
const TITLE =
  "Decatur Is Closed Near Ice Age Fossils State Park: What the Iron Mountain Road Project Means";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const meta: StoryMeta = {
  title:
    "Decatur Closure and Iron Mountain Road Extension, Northwest Las Vegas | LVINIT",
  headline: TITLE,
  description:
    "The City of Las Vegas started a $13.4M project to extend Iron Mountain Road on Nov. 16, fully closing Decatur Blvd up to the Ice Age Fossils State Park entrance. Detours, phases and the expected finish.",
  path: PATH,
  datePublished: "2026-11-17",
  dateModified: "2026-11-17",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Iron Mountain Road Extension", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function IronMountainRoadExtensionPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Growth & Development",
        headline: TITLE,
        subheadline:
          "A $13.4 million city project to extend Iron Mountain Road started Nov. 16. Here's what's closed, how the city says to get around it, and when it's supposed to be done.",
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on how the northwest valley is changing.",
        stories: [
          {
            name: "Monument Hills",
            href: "/guides/monument-hills-northwest-las-vegas",
            category: "Local Feature",
            dek: "The big planned community taking shape at the valley's northwest edge.",
          },
          {
            name: "Hualapai & Grand Teton Substation and Park",
            href: "/guides/hualapai-grand-teton-police-substation-park-northwest-las-vegas",
            category: "Local Feature",
            dek: "Another public project coming to northwest Las Vegas.",
          },
          {
            name: "Moving to Las Vegas: Where to Start",
            href: "/guides/moving-to-las-vegas",
            category: "Moving to Las Vegas",
            dek: "The starting point if you're new to the valley.",
          },
        ],
      }}
      ctas={{
        heading: "Figuring out if the northwest valley fits you?",
        body:
          "Roads, commutes and what's still being built are part of the decision. Tell me what matters to you and I'll give you an honest read.",
      }}
    >
      <StoryLede
        kicker="Growth & Development"
        lead="If you drive Decatur Boulevard in the far northwest valley, your route just changed. On Monday, November 16, the City of Las Vegas fully closed Decatur between Iron Mountain Road and the entrance to Ice Age Fossils State Park. It's the first phase of a $13.4 million project to extend Iron Mountain Road between Thom Boulevard and Bradley Road, and the city expects the whole thing to wrap up in the fourth quarter of 2027."
      />

      <StorySection heading="What's closed right now">
        <p className="text-body-lg text-lvinit-warmgray">
          Phase 1 is on Decatur. According to the city, Decatur Boulevard is
          fully closed between Iron Mountain Road and the entrance to Ice Age
          Fossils State Park. The work prepares Decatur for the Iron Mountain
          extension.
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Detour:</span> Decatur traffic
            is being sent to Brent Lane and Iron Mountain Road, with Thom
            Boulevard handling north/south travel.
          </li>
          <li>
            <span className="text-lvinit-black">Work hours:</span> 7 a.m. to 6
            p.m., Monday through Friday.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          One thing the city&rsquo;s announcement does not say: that the state
          park itself is closed or that its hours have changed. It only says
          Decatur is closed up to the park entrance. If you&rsquo;re planning a
          visit, check with Nevada State Parks for current access before you
          go rather than assuming either way.
        </p>
      </StorySection>

      <StorySection muted heading="What comes next: Phase 2">
        <p className="text-body-lg text-lvinit-warmgray">
          The second phase moves to Iron Mountain itself. The city says Iron
          Mountain Road will close between Decatur and Bradley Road, and Thom
          Boulevard will close just south of Iron Mountain. That phase starts
          at the northbound lane at the Iron Mountain and Bradley intersection.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          For Phase 2, the city recommends Brent Lane for east/west trips and
          Bradley Road for southbound trips. The city has not published a start
          date for Phase 2, so I&rsquo;m not going to guess one.
        </p>
      </StorySection>

      <StorySection heading="What's actually being built">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">The road:</span> an extension
            of Iron Mountain Road between Thom Boulevard and Bradley Road.
          </li>
          <li>
            <span className="text-lvinit-black">What goes in:</span> storm
            drains, pavement, curbs, gutters, sidewalks and streetlights.
          </li>
          <li>
            <span className="text-lvinit-black">Cost:</span> $13.4 million.
          </li>
          <li>
            <span className="text-lvinit-black">Who pays:</span> the Regional
            Transportation Commission of Southern Nevada and the Clark County
            Regional Flood Control District.
          </li>
          <li>
            <span className="text-lvinit-black">Contractor:</span> Tand Inc.
          </li>
          <li>
            <span className="text-lvinit-black">Expected finish:</span> the
            fourth quarter of 2027, according to the city.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The flood control district money is worth noticing. Storm drains are
          a big part of this job, not just new asphalt. In a valley where
          summer monsoon storms can turn streets into channels, drainage is
          usually what makes a road like this usable year-round.
        </p>
      </StorySection>

      <StorySection muted heading="What it means if you live up here">
        <p className="text-body-lg text-lvinit-warmgray">
          Plan on this being part of your drive for about a year. The
          practical stuff: Brent Lane and Thom Boulevard are the routes the
          city is pointing people to now, and Bradley Road joins the mix once
          Phase 2 starts. Work runs on weekdays during the day, so weekday
          commutes are where you&rsquo;ll feel it most.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The bigger picture is that the far northwest is still filling in.
          New neighborhoods keep going up out here, and the streets connecting
          them are still being finished. Projects like this are what that
          looks like on the ground: a stretch of short-term detours that ends
          with a more complete street, with sidewalks, lights and drainage.
          For more on how this part of the valley is growing, see our guides
          to{" "}
          <Link href="/guides/monument-hills-northwest-las-vegas" className={linkCls}>
            Monument Hills
          </Link>
          , the{" "}
          <Link
            href="/guides/hualapai-grand-teton-police-substation-park-northwest-las-vegas"
            className={linkCls}
          >
            new police substation and park at Hualapai and Grand Teton
          </Link>
          , and the{" "}
          <Link
            href="/guides/nevada-state-veterans-memorial-thunderbird-northwest-las-vegas"
            className={linkCls}
          >
            Nevada State Veterans Memorial at Thunderbird Family Sports Complex
          </Link>
          . Across the line in North Las Vegas, KB Home&rsquo;s{" "}
          <Link href="/guides/sandstone-tule-springs-north-las-vegas" className={linkCls}>
            Sandstone at Tule Springs
          </Link>{" "}
          is another sign of how much is happening up north. New to the
          valley? Start with{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection heading="What I haven't confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">When Phase 2 starts</span>{" "}
            and how long Phase 1 lasts. The city hasn&rsquo;t published either.
          </li>
          <li>
            <span className="text-lvinit-black">State park access.</span> The
            city&rsquo;s release doesn&rsquo;t address it, and I couldn&rsquo;t
            confirm anything from the park, so I&rsquo;m not saying it&rsquo;s
            affected or unaffected.
          </li>
          <li>
            <span className="text-lvinit-black">What the road looks like today</span>{" "}
            between Thom and Bradley. I haven&rsquo;t been out to see it for
            this piece, and there are no LVINIT photos of the corridor yet, so
            this page has no imagery rather than a stand-in.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Construction questions go to the city&rsquo;s project line at{" "}
          <a href="tel:+17023084914" className={extCls}>
            702-308-4914
          </a>
          .
        </p>
      </StorySection>

      <StorySection muted heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">City of Las Vegas</span>,
            &ldquo;Work Begins On Iron Mountain Road Improvements Nov.
            16.&rdquo;{" "}
            <a
              href="https://content.govdelivery.com/accounts/NVLASVEGAS/bulletins/432fd38"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              City news release
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KSNV News 3 Las Vegas</span>,
            November 16, 2026.{" "}
            <a
              href="https://news3lv.com/news/local/134-million-iron-mountain-rd-project-begins-in-northwest-valley-adds-drains-and-lights"
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
