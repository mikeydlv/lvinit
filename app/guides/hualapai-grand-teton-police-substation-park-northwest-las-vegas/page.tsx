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
// GROWTH & DEVELOPMENT — LVMPD substation and 2-acre city park, Hualapai Way
// and Grand Teton Drive, northwest Las Vegas.
// Built by the LVINIT Daily Publisher (2026-11-06) from Local Radar WATCH item
// LR-HUALAPAI-GRAND-TETON-SUBSTATION-PARK, upgraded after the primary source
// was read.
//
// FACT DISCIPLINE (read 2026-11-06):
// - PRIMARY: City of Las Vegas release, "Construction To Begin On New Las Vegas
//   Metropolitan Police Department Substation And City Park" (govdelivery,
//   Oct. 2025): 9735 Hualapai Way; groundbreaking Oct. 29, 2025; $27.2M for
//   substation + park; 13,300 sq ft substation; 2-acre park with three picnic
//   pavilions, skate park, walking trail, playground; park partly funded by a
//   $1M Green Valley Grocery donation; architect Simpson Coulter Design Studio;
//   contractor CORE Construction; city is project manager; early 2027 finish;
//   serves Providence, Skye Canyon and Sunstone.
// - KTNV (undated page, read 2026-11-06): construction began Oct. 2025,
//   "significant progress", still targeting early 2027; officers now work from
//   a station near Cheyenne Ave and the 215; ~20 min response to some
//   neighborhoods; Councilwoman Nancy Brune estimates at least halved.
// OMITTED ON PURPOSE: opening date beyond "early 2027", staffing, current
//   percent complete, and KTNV's "covered area for kids" (differs from the
//   city's "playground"; the city's wording is used).
// IMAGERY: LVINIT drone stills (Skye Canyon, Sunstone) show the surrounding
//   growth area only. NEITHER shows the substation site; captions say so.
// ---------------------------------------------------------------------------

const PATH = "/guides/hualapai-grand-teton-police-substation-park-northwest-las-vegas";
const HERO_IMG =
  "/images/editorial/skye-canyon-northwest-las-vegas-neighborhood-aerial-mountains.jpg";
const HERO_ALT =
  "Aerial view of Skye Canyon neighborhoods in northwest Las Vegas spreading toward open desert and the Spring Mountains.";
const INLINE_IMG =
  "/images/editorial/sunstone-northwest-las-vegas-model-homes-aerial.jpg";
const INLINE_ALT =
  "Aerial view of a new-home model complex at Sunstone in northwest Las Vegas, with graded lots and mountains beyond.";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const TITLE =
  "A New Police Substation and 2-Acre Park Are Going Up at Hualapai and Grand Teton";

const meta: StoryMeta = {
  title: `${TITLE} | LVINIT`,
  headline: TITLE,
  description:
    "The City of Las Vegas is building a 13,300 sq ft LVMPD substation and a 2-acre park at 9735 Hualapai Way for $27.2 million, targeting early 2027. What the park gets, who it serves, and what isn't confirmed.",
  path: PATH,
  image: HERO_IMG,
  imageWidth: 1920,
  imageHeight: 1080,
  imageAlt: HERO_ALT,
  datePublished: "2026-11-06",
  dateModified: "2026-11-06",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Hualapai Substation and Park", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function HualapaiSubstationParkPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Growth & Development",
        headline: TITLE,
        subheadline:
          "A $27.2 million city project for the fast-growing northwest edge of the valley, with a park next to the station.",
        image: HERO_IMG,
        imageAlt: HERO_ALT,
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on how the northwest and the rest of the valley are changing.",
        stories: [
          {
            name: "Monument Hills in Northwest Las Vegas",
            href: "/guides/monument-hills-northwest-las-vegas",
            category: "Local Feature",
            dek: "A look at the new-home community going in near Sunstone.",
          },
          {
            name: "The I-215 Northern Beltway Trail",
            href: "/guides/i-215-northern-beltway-trail-north-las-vegas",
            category: "Local Feature",
            dek: "Another public amenity taking shape on the north side.",
          },
          {
            name: "Moving to Las Vegas",
            href: "/guides/moving-to-las-vegas",
            category: "Moving Here",
            dek: "The practical starting point if you're new to the valley.",
          },
        ],
      }}
      ctas={{
        heading: "Weighing the northwest?",
        body:
          "Tell me how you'd use the area day to day and I'll give you an honest read on whether it fits.",
      }}
    >
      <StoryLede
        kicker="Growth & Development"
        lead="The City of Las Vegas broke ground in October 2025 on a Metro police substation and a two-acre park at 9735 Hualapai Way, near Grand Teton Drive. The city says both should be finished in early 2027."
      />

      <StorySection heading="The short version">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">What:</span> a 13,300 square
            foot Las Vegas Metropolitan Police Department substation with a
            two-acre city park beside it.
          </li>
          <li>
            <span className="text-lvinit-black">Where:</span> 9735 Hualapai
            Way, near the corner of Hualapai Way and Grand Teton Drive in
            northwest Las Vegas.
          </li>
          <li>
            <span className="text-lvinit-black">Cost:</span> $27.2 million for
            the substation and park together, per the city.
          </li>
          <li>
            <span className="text-lvinit-black">Timeline:</span> groundbreaking
            was Oct. 29, 2025. The city&rsquo;s target is early 2027, and
            KTNV reports crews have made significant progress and still aim for
            that window.
          </li>
          <li>
            <span className="text-lvinit-black">Who it serves:</span> the city
            names the Providence, Skye Canyon and Sunstone areas.
          </li>
        </ul>
      </StorySection>

      <StoryGallery
        columns={1}
        images={[
          {
            src: INLINE_IMG,
            alt: INLINE_ALT,
            label: "The growth area",
            caption:
              "LVINIT drone still of a model-home complex at Sunstone, one of the areas the city says the substation will serve. It does not show the substation site.",
          },
        ]}
      />

      <StorySection muted heading="What the park gets">
        <p className="text-body-lg text-lvinit-warmgray">
          The park is the part most neighbors will use. According to the
          city, the two-acre park next to the substation includes three
          picnic pavilions, a skate park, a walking trail and a playground.
          It is partly funded by a $1 million donation from Green Valley
          Grocery; the rest of the $27.2 million covers the substation and the
          remainder of the park.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Pairing a police facility with a public park is a deliberate choice
          for a part of town that is still filling in. Whether it feels like a
          real neighborhood park once it opens is something I can only judge
          after I see it finished.
        </p>
      </StorySection>

      <StorySection heading="Why the substation matters here">
        <p className="text-body-lg text-lvinit-warmgray">
          KTNV reports that officers serving this area currently work out of a
          station near Cheyenne Avenue and the 215 Beltway, and that response
          to some neighborhoods can take around 20 minutes. Ward 6
          Councilwoman Nancy Brune told the station she expects the new
          building to cut that at least in half. That is her estimate, not a
          published Metro target, so treat it as an expectation.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          For anyone shopping new construction out here, it is a practical
          data point. The northwest edge has added a lot of homes quickly, and
          services are catching up. If you are looking at the area, my{" "}
          <Link
            href="/guides/monument-hills-northwest-las-vegas"
            className={linkCls}
          >
            Monument Hills guide
          </Link>{" "}
          covers one of the new-home communities in the same part of the
          valley. I&rsquo;m not saying that community sits next to this site.
        </p>
      </StorySection>

      <StorySection muted heading="Who is building it">
        <p className="text-body-lg text-lvinit-warmgray">
          The City of Las Vegas is managing the project. Per the city&rsquo;s
          release, the architect is Simpson Coulter Design Studio and the
          contractor is CORE Construction.
        </p>
      </StorySection>

      <StorySection heading="What I haven't confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">An opening date.</span> Only
            &ldquo;early 2027&rdquo; has been given, and I found no 2026
            release from the city with a firmer date.
          </li>
          <li>
            <span className="text-lvinit-black">Percent complete.</span>{" "}
            KTNV says &ldquo;significant progress.&rdquo; No figure is
            published.
          </li>
          <li>
            <span className="text-lvinit-black">Staffing and hours.</span> I
            found nothing on how many officers will work from the substation.
          </li>
          <li>
            <span className="text-lvinit-black">Play features.</span> The city
            lists a playground; one news report describes a covered kids&rsquo;
            area. I&rsquo;ve used the city&rsquo;s wording.
          </li>
          <li>
            <span className="text-lvinit-black">First-hand look.</span> I
            haven&rsquo;t filmed this site for LVINIT. The photos here show
            nearby growth areas, not the construction.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          New to the valley? Start with{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">City of Las Vegas</span>,
            groundbreaking announcement, October 2025.{" "}
            <a
              href="https://content.govdelivery.com/accounts/NVLASVEGAS/bulletins/3f90671"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              govdelivery.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KTNV 13 Action News</span>,
            progress report.{" "}
            <a
              href="https://www.ktnv.com/neighborhoods/northwest-las-vegas/new-lvmpd-substation-city-of-las-vegas-park-coming-to-skye-canyon-in-early-2027"
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
