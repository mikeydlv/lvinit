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
// GROWTH & DEVELOPMENT — Casara at West Henderson. Built by the LVINIT Daily
// Publisher from Local Radar assignment LR-CASARA-WEST-HENDERSON.
//
// FACT DISCIPLINE — read this run (2026-11-01):
// - KTNV (read): Ovation Homes; 390 units, 1-3 BR; nearly 19 acres of
//   undeveloped desert at Las Vegas Blvd and Larson Ln; council approved "on
//   Tuesday" (no date, no vote count); 60% of Clark County AMI, which KTNV puts
//   at about $80,000 (cap about $48,000, KTNV's own math); construction
//   expected by the holidays; completion by 2028; applications ~mid-2028.
// - Fox5, Oct. 22 2026 (read): unanimous at "Tuesday's meeting"; ~390 units;
//   near Las Vegas Blvd and Larson Ln, close to Inspirada; design review and
//   permitting still to finish. No developer/acreage/AMI in Fox5.
// - Hoodline, Oct. 22 2026 (read): two Clark County Community Housing Fund
//   awards totaling $21.9M in May 2024 to Ovation Development Corp. and
//   Coordinated Living of Southern Nevada; land described as former BLM land.
// OMITTED: exact vote date, rents, amenities, bill number (Henderson record not
// accessible), anything implying construction has started.
// IMAGERY: no LVINIT photography of the site. Photoless hero. One Inspirada
// aerial (Aug. 2026 footage) is used inline, captioned as area context only.
// ---------------------------------------------------------------------------

const PATH = "/guides/casara-west-henderson-affordable-apartments";
const CONTEXT =
  "/images/editorial/henderson-inspirada-aerial-homes-desert-mountains.jpg";
const CONTEXT_ALT =
  "Aerial view of modern homes and a community pool in Inspirada, Henderson, with open desert and mountains beyond.";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const meta: StoryMeta = {
  title:
    "Casara at West Henderson: 390 Affordable Apartments Approved Near Las Vegas Blvd and Larson Lane | LVINIT",
  headline:
    "Casara at West Henderson: 390 Affordable Apartments Approved Near Las Vegas Blvd and Larson Lane",
  description:
    "Henderson City Council approved Casara at West Henderson, 390 income-restricted apartments near Inspirada. Who qualifies, what's reported on timing, and what isn't confirmed.",
  path: PATH,
  datePublished: "2026-11-01",
  dateModified: "2026-11-01",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Casara at West Henderson", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function CasaraWestHendersonPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Growth & Development",
        headline:
          "Casara at West Henderson: 390 Affordable Apartments Approved Near Las Vegas Blvd and Larson Lane",
        subheadline:
          "Henderson's council signed off on a big income-restricted apartment community on empty desert near Inspirada. Here's who it's for, what's reported on timing, and what's still open.",
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on Henderson and on affordable housing across the valley.",
        stories: [
          {
            name: "Henderson Neighborhood Guide",
            href: "/neighborhoods/henderson",
            category: "Neighborhoods",
            dek: "Inspirada, Green Valley, MacDonald Highlands and how Henderson breaks down.",
          },
          {
            name: "Patriot Housing LV in Sunrise Manor",
            href: "/guides/patriot-housing-lv-sunrise-manor-veteran-housing",
            category: "Local Feature",
            dek: "Another large affordable housing approval, on the east side.",
          },
          {
            name: "Gholson Landing in East Las Vegas",
            href: "/guides/gholson-landing-affordable-housing-east-las-vegas",
            category: "Local Feature",
            dek: "A smaller affordable project already moving.",
          },
        ],
      }}
      ctas={{
        heading: "Figuring out where in the valley fits you?",
        body:
          "Tell me what matters to you and I'll give you an honest read on where to look.",
      }}
    >
      <StoryLede
        kicker="Growth & Development"
        lead="Henderson City Council has approved Casara at West Henderson, a 390-unit affordable apartment community planned by Ovation Homes at Las Vegas Boulevard and Larson Lane. It's approved, not built, and it's for households that fall under an income cap."
      />

      <StorySection heading="What was approved">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">The vote:</span> Fox5 reports
            the council approved it unanimously at a Tuesday meeting in
            October (its story ran Oct. 22). KTNV reports the approval
            without a vote count.
          </li>
          <li>
            <span className="text-lvinit-black">Size:</span> 390 apartments,
            from one to three bedrooms, on nearly 19 acres of undeveloped
            desert (KTNV).
          </li>
          <li>
            <span className="text-lvinit-black">Where:</span> the corner of Las
            Vegas Boulevard and Larson Lane in West Henderson, close to the
            Inspirada community (Fox5).
          </li>
          <li>
            <span className="text-lvinit-black">Developer:</span> Ovation
            Homes (KTNV).
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="Who qualifies">
        <p className="text-body-lg text-lvinit-warmgray">
          Per KTNV, the apartments are reserved for households earning 60% or
          less of Clark County&rsquo;s area median income. KTNV puts that median at
          roughly $80,000, which works out to a cap near $48,000 a year. That
          math is KTNV&rsquo;s, and the actual limits depend on household size and
          the income tables used when the project opens, so don&rsquo;t treat $48,000
          as a firm number.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Rents haven&rsquo;t been published in anything I read. Ovation Homes
          plans to start taking applications around mid-2028, according to
          KTNV.
        </p>
      </StorySection>

      <StorySection heading="Timing: what's reported, what isn't">
        <p className="text-body-lg text-lvinit-warmgray">
          KTNV reports construction is expected to start by the holidays and
          the complex is slated to finish by 2028. Fox5 adds that city staff
          and the developer still have design reviews and permitting to work
          through, and that approval clears the way toward groundbreaking
          rather than starting it. Earlier project materials pointed to a
          construction start at the end of 2025 or in the first half of 2026,
          per Hoodline, so treat today&rsquo;s dates as targets that have already
          slipped once.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Hoodline also reports that Clark County&rsquo;s Community Housing Fund
          awarded two grants totaling $21.9 million in May 2024 to Ovation
          Development Corporation and Coordinated Living of Southern Nevada
          for two communities. I haven&rsquo;t confirmed which grant, if any,
          applies to Casara specifically, so I&rsquo;m not tying that money to this
          project.
        </p>
      </StorySection>

      <StoryGallery
        columns={1}
        images={[
          {
            src: CONTEXT,
            alt: CONTEXT_ALT,
            label: "Area context",
            caption:
              "Inspirada from the air in August, with open desert and mountains beyond. This is nearby context, not the Casara site.",
          },
        ]}
      />

      <StorySection heading="What it means if you live in or are eyeing the south valley">
        <p className="text-body-lg text-lvinit-warmgray">
          West Henderson and the Inspirada area have been one of the valley&rsquo;s
          busiest growth corridors, mostly with market-rate homes and
          retail. This is a different kind of addition: nearly 400 homes
          aimed at households with moderate incomes, in a part of town where
          that&rsquo;s been harder to find. One resident told KTNV she supports it
          and hopes the project brings facilities for kids; no amenities
          have been published, so that&rsquo;s a hope, not a plan.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If you&rsquo;re comparing parts of the valley, my{" "}
          <Link href="/neighborhoods/henderson" className={linkCls}>
            Henderson neighborhood guide
          </Link>{" "}
          covers how the city breaks down. For other large affordable
          approvals, see{" "}
          <Link
            href="/guides/patriot-housing-lv-sunrise-manor-veteran-housing"
            className={linkCls}
          >
            Patriot Housing LV
          </Link>{" "}
          and{" "}
          <Link
            href="/guides/gholson-landing-affordable-housing-east-las-vegas"
            className={linkCls}
          >
            Gholson Landing
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
            <span className="text-lvinit-black">The exact vote date.</span>{" "}
            The reports say a Tuesday in October. I couldn&rsquo;t reach
            Henderson&rsquo;s agenda or minutes.
          </li>
          <li>
            <span className="text-lvinit-black">Rents and amenities.</span>{" "}
            Not published in the sources I read.
          </li>
          <li>
            <span className="text-lvinit-black">Groundbreaking.</span> I
            haven&rsquo;t seen a confirmed start; the &ldquo;by the holidays&rdquo; timing is
            KTNV&rsquo;s report.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          I haven&rsquo;t visited the site for this piece and have no LVINIT
          photos of it, so the page has no hero image rather than a
          stand-in.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">KTNV</span>, nearly 400
            affordable apartments coming to West Henderson.{" "}
            <a
              href="https://www.ktnv.com/neighborhoods/henderson/nearly-400-affordable-apartments-coming-to-west-henderson-by-2028-after-city-council-approves-project"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              ktnv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>, Oct. 22,
            2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/10/23/henderson-approves-nearly-400-new-affordable-apartments-south-valley/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Hoodline</span>, Oct. 22,
            2026.{" "}
            <a
              href="https://hoodline.com/2026/10/henderson-approves-390-affordable-apartments-near-las-vegas-boulevard-by-2028/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              hoodline.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
