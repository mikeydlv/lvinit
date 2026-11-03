import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryGallery,
} from "@/components/story";

// ---------------------------------------------------------------------------
// GROWTH & DEVELOPMENT / NEIGHBORHOODS — New Windsor Park, North Las Vegas.
// Built by the LVINIT Daily Publisher from Local Radar assignment
// LR-NEW-WINDSOR-PARK-NLV (run 11, handoff dated the evening of 2026-11-02).
//
// FACT DISCIPLINE:
// - PRIMARY (read 2026-11-03): developer site newwindsorpark.com. 93
//   single-story houses, 19 acres, Carey Ave and West St, given at no cost to
//   original Windsor Park families; Types A/B/C (1,400 / 1,820 / 2,100 sq ft,
//   renderings preliminary); council entitlements July 2025; first soil
//   turned Sept 2025; keys forecast December 2026.
// - Fox5 (read 2026-11-03): Mar 10, 2026 (permits in place, ~20 homes with
//   plywood walls, ~dozen framed, old homes to be torn down and replaced by a
//   park, $25M SB6 + $37M 2023 session); Apr 18, 2026 (construction began
//   Feb 26 after a year of permitting, $62M total, moisture test on every slab,
//   soil dug out/flooded/tested, developer says December promise stands).
// OMITTED ON PURPOSE: the older KTNV "60 of 93 homes, 33 await funding" report
//   (written before the $25M SB6 money; superseded by the $62M total), any
//   current completion percentage (none found newer than April 2026), the
//   number of residents who accepted relocation, resident names.
// IMAGERY: lead image supplied by Mikey in /public/images/hero/. Capture date
//   and photographer not documented in the repo, so it is captioned as an
//   aerial of homes under construction, supplied for this story, date not
//   confirmed. No claim of an LVINIT site visit is made anywhere in the copy.
// ---------------------------------------------------------------------------

const PATH = "/guides/new-windsor-park-north-las-vegas-93-homes";
const HERO =
  "/images/new-windsor-park-north-las-vegas-homes-under-construction-aerial.webp";
const HERO_ALT =
  "Aerial view of rows of single-story homes under construction in North Las Vegas, with tan sheathing, green weather barrier and white roofs, bulldozers on bare dirt, existing neighborhoods behind and mountains in the distance.";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const TITLE =
  "New Windsor Park: The 93 Homes North Las Vegas Is Building for a Sinking Neighborhood";

const meta: StoryMeta = {
  title: `${TITLE} | LVINIT`,
  headline: TITLE,
  description:
    "93 single-story homes are going up at Carey Ave and West St in North Las Vegas for families from the sinking Windsor Park neighborhood. Who is building them, how they're funded, and the December 2026 target.",
  path: PATH,
  image: HERO,
  imageWidth: 2103,
  imageHeight: 748,
  imageAlt: HERO_ALT,
  datePublished: "2026-11-03",
  dateModified: "2026-11-03",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "New Windsor Park", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function NewWindsorParkPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Growth & Development",
        headline: TITLE,
        subheadline:
          "A new neighborhood is under construction in North Las Vegas for families whose original homes have been sinking for decades. Here's what's being built and where it stands.",
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on what's being built across the valley.",
        stories: [
          {
            name: "North Las Vegas Neighborhood Guide",
            href: "/neighborhoods/north-las-vegas",
            category: "Neighborhoods",
            dek: "How North Las Vegas breaks down and where it's growing.",
          },
          {
            name: "Patriot Housing LV in Sunrise Manor",
            href: "/guides/patriot-housing-lv-sunrise-manor-veteran-housing",
            category: "Local Feature",
            dek: "Another housing project built for a specific group of residents.",
          },
          {
            name: "Casara at West Henderson",
            href: "/guides/casara-west-henderson-affordable-apartments",
            category: "Local Feature",
            dek: "390 affordable apartments approved in West Henderson.",
          },
        ],
      }}
      ctas={{
        heading: "Thinking about North Las Vegas?",
        body:
          "Tell me what matters to you and I'll give you an honest read on where to look.",
      }}
    >
      <StoryLede
        kicker="Growth & Development"
        lead="Ninety-three single-story homes are under construction on about 19 acres at Carey Avenue and West Street in North Las Vegas. They are replacements for families from the original Windsor Park, a neighborhood that has been sinking for decades. The developer's target is to hand over keys in December 2026."
      />

      <StoryGallery
        columns={1}
        images={[
          {
            src: HERO,
            alt: HERO_ALT,
            label: "Under construction",
            caption:
              "Aerial of new homes under construction in North Las Vegas, supplied for this story. The capture date isn't confirmed, so read it as a look at the build, not a current progress report.",
          },
        ]}
      />

      <StorySection heading="The short version">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">What:</span> 93 new
            single-story houses in three floor plans, per the developer.
          </li>
          <li>
            <span className="text-lvinit-black">Where:</span> Carey Avenue and
            West Street, about a mile from the original Windsor Park, per
            Fox5.
          </li>
          <li>
            <span className="text-lvinit-black">Who they&rsquo;re for:</span>{" "}
            families from the original neighborhood. The developer says the
            homes are given at no cost to those families.
          </li>
          <li>
            <span className="text-lvinit-black">Money:</span> about $62
            million in state funding, per Fox5.
          </li>
          <li>
            <span className="text-lvinit-black">Timeline:</span> construction
            began Feb. 26, 2026. The developer is forecasting key handover in
            December 2026.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="Why this neighborhood is being rebuilt">
        <p className="text-body-lg text-lvinit-warmgray">
          The original Windsor Park was built in the 1960s for Black families,
          according to Fox5. Residents have been asking for help since the
          1980s, after the ground began to sink. Fox5 reports that proper
          studies weren&rsquo;t done before the neighborhood was built, and the
          ground shifted after groundwater was later removed. Lawmakers who
          toured the old neighborhood this spring saw split sidewalks, uneven
          streets and cracked foundations. Some homes were leveled in the
          1990s and their owners were paid to move out.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The replacement neighborhood is on new ground. Fox5 reports the homes
          sit on soil that was dug out, flooded and tested, and that a moisture
          test goes into every slab, according to developer Frank Hawkins, who
          grew up in Windsor Park. The old homes are planned to be torn down
          and replaced by a park.
        </p>
      </StorySection>

      <StorySection heading="What's being built">
        <p className="text-body-lg text-lvinit-warmgray">
          Per the developer&rsquo;s project site, the houses come in three
          single-story plans of roughly 1,400, 1,820 and 2,100 square feet. The
          site describes a low, desert-modern look, with the largest plan
          wrapped around a courtyard. Those are renderings and the developer
          labels exterior colors as preliminary, so what gets built may look
          different.
        </p>
      </StorySection>

      <StorySection muted heading="How it got here">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">2023:</span> the Legislature
            allocated $37 million in a special session.
          </li>
          <li>
            <span className="text-lvinit-black">July 2025:</span> the City of
            North Las Vegas cleared the entitlements, per the developer.
          </li>
          <li>
            <span className="text-lvinit-black">September 2025:</span> the
            developer lists this as when the first soil was turned.
          </li>
          <li>
            <span className="text-lvinit-black">November 2025:</span> Senate
            Bill 6 added $25 million, signed by the governor, per Fox5.
          </li>
          <li>
            <span className="text-lvinit-black">Feb. 26, 2026:</span> Fox5
            reports construction began after about a year of permitting.
          </li>
          <li>
            <span className="text-lvinit-black">March 2026:</span> the city
            confirmed all permits were in hand. Fox5 counted about 20 homes
            with plywood walls up and roughly a dozen more framed.
          </li>
          <li>
            <span className="text-lvinit-black">April 2026:</span> lawmakers
            toured the site. Hawkins said the December promise is one he
            intends to keep.
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Where it stands now">
        <p className="text-body-lg text-lvinit-warmgray">
          The newest status reporting I could find is from April 2026, so I
          can&rsquo;t tell you how many homes are finished today. December is
          the developer&rsquo;s forecast, not a guarantee, and construction
          schedules move. Nobody has publicly confirmed that residents have
          moved in.
        </p>
      </StorySection>

      <StorySection muted heading="What it means if you live nearby">
        <p className="text-body-lg text-lvinit-warmgray">
          This isn&rsquo;t a subdivision for sale. It&rsquo;s a replacement
          neighborhood for people who already live in North Las Vegas, so it
          won&rsquo;t show up in home searches. For the surrounding area, the
          visible change is a block of new construction in an established part
          of the city, and eventually a park where the old neighborhood stands.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          For the bigger picture, my{" "}
          <Link href="/neighborhoods/north-las-vegas" className={linkCls}>
            North Las Vegas guide
          </Link>{" "}
          covers how the city breaks down, and{" "}
          <Link
            href="/guides/sandstone-tule-springs-north-las-vegas"
            className={linkCls}
          >
            Sandstone and Tule Springs
          </Link>{" "}
          covers the newer growth on the north side. Other recent projects aimed
          at specific households include{" "}
          <Link
            href="/guides/patriot-housing-lv-sunrise-manor-veteran-housing"
            className={linkCls}
          >
            Patriot Housing LV
          </Link>{" "}
          and{" "}
          <Link
            href="/guides/casara-west-henderson-affordable-apartments"
            className={linkCls}
          >
            Casara at West Henderson
          </Link>
          . New to the valley? Start with{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection heading="What I haven't confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Current progress.</span> No
            completion count newer than spring 2026.
          </li>
          <li>
            <span className="text-lvinit-black">Move-in order and numbers.</span>{" "}
            I haven&rsquo;t found how many original residents accepted
            relocation or who moves in first.
          </li>
          <li>
            <span className="text-lvinit-black">City and state records.</span>{" "}
            I relied on the developer and news reports, not the council or
            legislative documents.
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">The New Windsor Park</span>,
            developer project site.{" "}
            <a
              href="https://newwindsorpark.com/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              newwindsorpark.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>, March
            10, 2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/03/10/homes-rapidly-going-up-new-windsor-park-north-las-vegas"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>, April
            18, 2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/04/18/new-windsor-park-homes-rise-decades-long-fight-nears-end/"
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
