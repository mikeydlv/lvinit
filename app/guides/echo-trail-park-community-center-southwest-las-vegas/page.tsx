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
// NEW & NOTEWORTHY / GROWTH — Echo Trail Park community center. Built by the
// LVINIT Daily Publisher from Local Radar assignment
// LR-ECHO-TRAIL-COMMUNITY-CENTER (read 2026-11-02).
//
// FACT DISCIPLINE:
// - PRIMARY (read this run): Clark County news release
//   clarkcountynv.gov/news/090226-echo-trail-community-center. Unanimous Board
//   of Commissioners approval; two-story 58,000 sq ft center at the southwest
//   corner of the site, west of the existing park; gym, indoor walking track,
//   dance/yoga studio, multipurpose classrooms, arts and crafts room, offices,
//   conference rooms; Naft also named a fitness space and demonstration
//   kitchen; 288 new parking spaces (321 total), pedestrian path, signage,
//   landscaping; expected to open 2028; park opened 2022 (tennis/pickleball,
//   playground, splash pad, walking trail); modeled on Silverado Ranch
//   Community Center. The release gives no approval date, cost or funding.
// - Vote date Wed Sept 2, 2026 per Fox5 (Local Radar read it 2026-11-02).
// OMITTED: the $40M figure (KTNV only), construction start, hours/fees.
// IMAGERY: lead image (card/OG, first figure; the hero is text-only so the
// headline doesn't sit over the sign's own lettering) = LVINIT photo of the county's "Future Site of Your Community
// Center" sign (not a rendering). Inline = LGA Architecture concept rendering
// from Clark County materials, labeled as a concept. Both supplied by Mikey.
// ---------------------------------------------------------------------------

const PATH = "/guides/echo-trail-park-community-center-southwest-las-vegas";
const HERO =
  "/images/echo-trail-park-future-community-center-sign-southwest-las-vegas.webp";
const HERO_ALT =
  "Green Clark County sign on the lawn at Echo Trail Park in southwest Las Vegas reading Future Site of Your Community Center, with Commissioner Michael Naft's name and a drawing of the planned building, and homes and mountains in the distance.";
const RENDERING =
  "/images/echo-trail-community-center-rendering-lga-architecture-clark-county.webp";
const RENDERING_ALT =
  "Architect's rendering of the planned Echo Trail Community Center: a two-story entrance with a copper-colored canopy and Echo Trail Community Center signage, desert landscaping and lavender plantings, and people walking and biking out front. A concept, not a photo.";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const TITLE =
  "Echo Trail Park: Clark County Approves a 58,000 Sq Ft Community Center for Southwest Las Vegas";

const meta: StoryMeta = {
  title: `${TITLE} | LVINIT`,
  headline: TITLE,
  description:
    "Clark County approved a two-story, 58,000-square-foot community center at Echo Trail Park on Buffalo Dr. What's inside, the parking and path changes, and what's expected by 2028.",
  path: PATH,
  image: HERO,
  imageWidth: 1672,
  imageHeight: 941,
  imageAlt: HERO_ALT,
  datePublished: "2026-11-02",
  dateModified: "2026-11-02",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Echo Trail Park community center", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function EchoTrailCommunityCenterPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "New & Noteworthy",
        headline: TITLE,
        subheadline:
          "A big indoor recreation building is coming to the park on Buffalo Dr. Here's what the county approved, what's inside, and what to expect before 2028.",
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on what's changing in the southwest valley.",
        stories: [
          {
            name: "Southwest Las Vegas Neighborhood Guide",
            href: "/neighborhoods/southwest-las-vegas",
            category: "Neighborhoods",
            dek: "How the southwest breaks down and what's being built there.",
          },
          {
            name: "Nevada's First Standalone Children's Hospital",
            href: "/guides/nevada-first-standalone-childrens-hospital-southwest-las-vegas",
            category: "Local Feature",
            dek: "Another major southwest project, now under construction.",
          },
          {
            name: "Municipal Gym at Downtown Summerlin",
            href: "/guides/municipal-gym-downtown-summerlin",
            category: "Local Feature",
            dek: "Another public recreation facility in the works.",
          },
        ],
      }}
      ctas={{
        heading: "Thinking about the southwest valley?",
        body:
          "Tell me what matters to you and I'll give you an honest read on where to look.",
      }}
    >
      <StoryLede
        kicker="New & Noteworthy"
        lead="Clark County's Board of Commissioners has unanimously approved a two-story, 58,000-square-foot community center at Echo Trail Park, at Buffalo Drive and Russell Road in southwest Las Vegas. The county expects it to open in 2028."
      />

      <StoryGallery
        columns={1}
        images={[
          {
            src: HERO,
            alt: HERO_ALT,
            label: "On site",
            caption:
              "Clark County's \u201cFuture Site of Your Community Center\u201d sign on the lawn at Echo Trail Park. The drawing on the sign is artwork, not a photo of a finished building.",
          },
        ]}
      />

      <StorySection heading="What the county approved">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">The vote:</span> unanimous
            approval from the Clark County Board of Commissioners. Fox5
            reported the vote on Wednesday, Sept. 2, 2026. Chairman Michael
            Naft spoke in support and called it &ldquo;an exciting step
            forward for the southwest.&rdquo;
          </li>
          <li>
            <span className="text-lvinit-black">The building:</span> two
            stories and 58,000 square feet, on the southwest corner of the
            park site, just west of the existing park.
          </li>
          <li>
            <span className="text-lvinit-black">Parking and access:</span> 288
            new parking spaces, bringing the total to 321, plus a new
            pedestrian pathway, new signage and added landscaping.
          </li>
          <li>
            <span className="text-lvinit-black">Opening:</span> expected in
            2028, per the county.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="What's planned inside">
        <p className="text-body-lg text-lvinit-warmgray">
          The county&rsquo;s list: a gymnasium, an indoor walking track, a
          dance and yoga studio, multipurpose classrooms, an arts and crafts
          room, offices and conference rooms. Naft also described a fitness
          space and a demonstration kitchen, with programming rooms meant for
          all ages. He said the center is modeled on the Silverado Ranch
          Community Center.
        </p>
      </StorySection>

      <StoryGallery
        columns={1}
        images={[
          {
            src: RENDERING,
            alt: RENDERING_ALT,
            label: "Concept rendering",
            caption:
              "Rendering of the planned Echo Trail Community Center by LGA Architecture, shown in Clark County materials. A concept, not a photo; final design details may differ.",
          },
        ]}
      />

      <StorySection heading="What's there now">
        <p className="text-body-lg text-lvinit-warmgray">
          Echo Trail Park opened in 2022. Today it has tennis and pickleball
          courts, a playground, a splash pad and a walking trail. The sign in
          the photo at the top of this page sits on the lawn at the park,
          marking where the county says the community center is going. Nothing
          is under construction yet, as far as I could confirm.
        </p>
      </StorySection>

      <StorySection muted heading="What it means if you live in the southwest valley">
        <p className="text-body-lg text-lvinit-warmgray">
          Most of the southwest&rsquo;s recent growth has been homes, shopping
          and medical projects. This one is an indoor, public place to work
          out, take a class or meet up, and it sits inside a park that already
          has a trail and a splash pad. If you live nearby, the practical
          change to expect is more activity and more parking at the park
          itself.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          For the bigger picture, my{" "}
          <Link href="/neighborhoods/southwest-las-vegas" className={linkCls}>
            Southwest Las Vegas guide
          </Link>{" "}
          covers how the area breaks down. Another major project in this part
          of town is{" "}
          <Link
            href="/guides/nevada-first-standalone-childrens-hospital-southwest-las-vegas"
            className={linkCls}
          >
            Nevada&rsquo;s first standalone children&rsquo;s hospital
          </Link>
          . For a similar public facility on the other side of the valley, see{" "}
          <Link href="/guides/municipal-gym-downtown-summerlin" className={linkCls}>
            the municipal gym at Downtown Summerlin
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
            <span className="text-lvinit-black">Cost.</span> The county&rsquo;s
            release doesn&rsquo;t give one, so I&rsquo;m not printing a figure.
          </li>
          <li>
            <span className="text-lvinit-black">Construction start.</span> No
            groundbreaking date has been published. The county&rsquo;s parks
            page for the project still describes it as in initial planning.
          </li>
          <li>
            <span className="text-lvinit-black">Hours, fees and
            registration.</span> None announced.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The 2028 date is the county&rsquo;s estimate, so treat it as a
          target.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Clark County</span>, news
            release on the Echo Trail Community Center.{" "}
            <a
              href="https://www.clarkcountynv.gov/news/090226-echo-trail-community-center"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              clarkcountynv.gov
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>, Sept. 2,
            2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/09/02/echo-trail-park-approved-massive-58000-square-foot-expansion/"
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
