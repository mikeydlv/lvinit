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
// GROWTH & DEVELOPMENT / NEIGHBORHOODS — I-215 Northern Beltway Trail.
// Built by the LVINIT Daily Publisher from Local Radar assignment
// LR-I215-NORTHERN-BELTWAY-TRAIL (run 12).
//
// FACT DISCIPLINE:
// - Source: Fox5 Las Vegas, Sept 23-24, 2026 (read 2026-11-04). The City of
//   North Las Vegas release returned 403, so this is single-outlet reporting.
// - Groundbreaking Wed Sept 23, 2026; Phase 1 N Decatur Blvd to Clayton St,
//   parallel to the freeway, completion expected late 2027; phases 2 and 3
//   (Clayton to N 5th St; N 5th to Losee Rd); paved paths, lighting,
//   landscaping, signage; network of about 45 miles to Henderson.
// OMITTED ON PURPOSE: cost/funding (unreported), any mileage totals or
//   per-phase mileage (Fox5 figures do not add up), the Aviary Park
//   groundbreaking venue (only in the Local Radar note, not the Fox5 text I read).
// IMAGERY: no first-party photo of the trail corridor exists in the library.
//   Hero is text-only. One inline image is a contextual North Las Vegas growth
//   shot and is captioned as NOT showing the trail.
// ---------------------------------------------------------------------------

const PATH = "/guides/i-215-northern-beltway-trail-north-las-vegas";
const CONTEXT_IMG = "/images/editorial/north-las-vegas-new-development-road-mountains.jpg";
const CONTEXT_ALT =
  "Divided road in North Las Vegas passing new homes and vacant desert lots toward rugged mountains under a cloudy sky.";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const TITLE =
  "The I-215 Northern Beltway Trail: What North Las Vegas Is Building and When You Can Use It";

const meta: StoryMeta = {
  title: `${TITLE} | LVINIT`,
  headline: TITLE,
  description:
    "North Las Vegas broke ground Sept. 23, 2026 on the I-215 Northern Beltway Trail. Where phase 1 runs, what the trail will include, the phases after it, and why nothing is open yet.",
  path: PATH,
  image: CONTEXT_IMG,
  imageWidth: 1920,
  imageHeight: 1080,
  imageAlt: CONTEXT_ALT,
  datePublished: "2026-11-04",
  dateModified: "2026-11-04",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "I-215 Northern Beltway Trail", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function BeltwayTrailPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Growth & Development",
        headline: TITLE,
        subheadline:
          "A paved, lit trail is being built alongside the 215 in North Las Vegas. Phase 1 is under construction. Here's what's confirmed and what isn't.",
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on how North Las Vegas is changing.",
        stories: [
          {
            name: "North Las Vegas Neighborhood Guide",
            href: "/neighborhoods/north-las-vegas",
            category: "Neighborhoods",
            dek: "How North Las Vegas breaks down and where it's growing.",
          },
          {
            name: "Sandstone and Tule Springs",
            href: "/guides/sandstone-tule-springs-north-las-vegas",
            category: "Local Feature",
            dek: "The newer growth on the north side.",
          },
          {
            name: "One Civic Center in North Las Vegas",
            href: "/guides/one-civic-center-north-las-vegas-redevelopment",
            category: "Local Feature",
            dek: "Another big project reshaping the city.",
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
        lead="North Las Vegas broke ground on Sept. 23, 2026 on a multi-phase trail along the I-215 Northern Beltway. Phase 1 is expected to finish in late 2027. Nothing is open yet, so this is one to watch rather than one to go use."
      />

      <StorySection heading="The short version">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">What:</span> paved pathways
            with dedicated lighting, landscaping and navigational signage,
            built parallel to the freeway, per Fox5.
          </li>
          <li>
            <span className="text-lvinit-black">Phase 1:</span> North Decatur
            Boulevard to Clayton Street. Completion is expected in late 2027.
          </li>
          <li>
            <span className="text-lvinit-black">Next:</span> a phase from
            Clayton Street to North 5th Street, then one from North 5th Street
            to Losee Road.
          </li>
          <li>
            <span className="text-lvinit-black">Big picture:</span> a network
            of about 45 miles connecting North Las Vegas and Henderson once
            fully built.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="What it means for people who live here">
        <p className="text-body-lg text-lvinit-warmgray">
          Right now, most of the north valley is built around driving. A
          continuous, lit, paved path next to the beltway gives walkers,
          runners and cyclists a dedicated option that doesn&rsquo;t share a
          road with traffic. For neighborhoods along the 215, that&rsquo;s a
          quality-of-life upgrade. For the city, it&rsquo;s one more piece of
          the growth story I cover in the{" "}
          <Link href="/neighborhoods/north-las-vegas" className={linkCls}>
            North Las Vegas guide
          </Link>
          .
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The long-term idea is the bigger deal. Fox5 reports the planned
          network would run about 45 miles and link North Las Vegas with
          Henderson. That is a long-range vision, and each phase still has to
          be built.
        </p>
      </StorySection>

      <StoryGallery
        columns={1}
        images={[
          {
            src: CONTEXT_IMG,
            alt: CONTEXT_ALT,
            label: "Context",
            caption:
              "Contextual photo of new development on a North Las Vegas boulevard. This is not the trail or its corridor.",
          },
        ]}
      />

      <StorySection heading="What I haven't confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Cost and funding.</span> The
            reporting I found doesn&rsquo;t say, so I&rsquo;m not guessing.
          </li>
          <li>
            <span className="text-lvinit-black">Mileage.</span> Published
            figures for the phases don&rsquo;t add up cleanly, so I&rsquo;m
            leaving distances out until the city&rsquo;s own numbers are
            available.
          </li>
          <li>
            <span className="text-lvinit-black">City records.</span> The City
            of North Las Vegas release wasn&rsquo;t accessible to me, so this
            rests on news reporting.
          </li>
          <li>
            <span className="text-lvinit-black">Dates after phase 1.</span> No
            completion dates for the later phases have been reported.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Looking for more on the north side? See{" "}
          <Link
            href="/guides/sandstone-tule-springs-north-las-vegas"
            className={linkCls}
          >
            Sandstone and Tule Springs
          </Link>
          , the{" "}
          <Link
            href="/guides/one-civic-center-north-las-vegas-redevelopment"
            className={linkCls}
          >
            One Civic Center redevelopment
          </Link>
          , or{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>{" "}
          if you&rsquo;re new.
        </p>
      </StorySection>

      <StorySection muted heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>, Sept.
            23-24, 2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/09/24/north-las-vegas-breaks-ground-27-mile-i-215-northern-beltway-trail-expansion/"
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
