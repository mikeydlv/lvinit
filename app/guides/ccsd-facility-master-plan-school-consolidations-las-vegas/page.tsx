import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// NEIGHBORHOODS & LIVING — CCSD's initial Facility Master Plan
// recommendations: $3.7B in restricted bond funds, 19 renovations, 8
// replacements, 6 schools consolidated, ahead of a Dec. 2 board work session.
// Built by the LVINIT Daily Publisher from Local Radar assignment
// LR-CCSD-FACILITY-MASTER-PLAN-RECOMMENDATIONS-2026.
//
// FACT DISCIPLINE — re-read this run (2026-11-24):
// - CCSD FMP release (fmp.ccsd.net, read): $3.7B restricted bond funds; 19
//   renovations, 8 replacements, 6 consolidations; two-year "Building
//   Brighter Futures" process, 55 community forums, two surveys with 7,962
//   responses, enrollment and facility-condition analysis; ~45,000 fewer
//   students over five years, mainly declining birth rates; Board of School
//   Trustees work session Wed Dec 2, 2026, 4 p.m.; staff placed under
//   negotiated agreements; surplus property worked out with municipalities
//   and partners. Itemized changes 1-4 and 6 (release has no item 5) as
//   written below. The six consolidating schools named: Toland, Rundle,
//   Kahre, McCall, Cahlan, Sewell.
// - fmp.ccsd.net/documents (read): Draft Options PDFs hosted on SharePoint;
//   Final Plan "Coming Soon".
// - KSNV (read): same facts; adds Kahre campus continues to honor fallen LVMPD
//   Officer Marc A. Kahre.
// - CCSD newsroom, Matt Kelly groundbreaking (read): July 13, 2026; $76M; ~440
//   students; original school opened 1960; opens 2027-28; 2015 CIP funded.
//   Historic Westside location per KSNV/KTNV groundbreaking coverage.
// - School locations (directory listings, cross-checked): Toland 1735 D St
//   89106; Rundle 425 N Christy Ln 89110 (CCSD contact page); Keller 89110;
//   Kahre 7887 W Gowan Rd 89129; Eisenberg 7770 W Delhi Ave 89129; McCall 800
//   E Carey Ave, Cahlan 2801 Fort Sumter Dr, Bridger 2505 N Bruce St, all
//   North Las Vegas 89030; Sewell and Brown, Henderson 89015.
// MUST NOT CLAIM / OMITTED: that anything is approved or final; a vote date;
// the full 19/8 lists (Draft Options PDF not read); the meeting room (KSNV
// only); public-comment procedure specifics; locations for Molasky, Leavitt,
// Brinley, Mannion, Cortney, Williams, Edwards, Mendoza, Lincoln, Herron
// (not verified); the superintendent quote (KSNV only); any theory about the
// missing item 5.
// IMAGERY — Hero, OG and card image (added 2026-11-26 at Mikey's request):
// public/images/hero/ccsd-school-facilities-plan-las-vegas.png, uploaded by
// Mikey; served as an optimized .webp copy (original PNG kept). It is a
// general school-and-bus scene, NOT one of the named campuses, so the alt
// text and the in-article note don't identify a school or location. No CCSD
// renderings or news photos (no rights).
// ---------------------------------------------------------------------------

const PATH = "/guides/ccsd-facility-master-plan-school-consolidations-las-vegas";
const TITLE =
  "CCSD’s $3.7B School Plan: Which Las Vegas Schools Would Consolidate, Rebuild or Renovate";
const HERO = "/images/hero/ccsd-school-facilities-plan-las-vegas.webp";
const HERO_ALT =
  "A yellow school bus parked at the curb in front of a single-story tan block school building with teal trim and glass doors, with shade trees, palm trees and desert mountains under a blue sky.";
const RELEASE_URL =
  "https://fmp.ccsd.net/2026/11/24/ccsd-releases-facility-master-plan-recommendations/";
const DOCS_URL = "https://fmp.ccsd.net/documents";
const KELLY_URL =
  "https://www.ccsd.net/about/newsroom/new-details/~board/ccsd-newsroom/post/ccsd-breaks-ground-on-new-matt-kelly-elementary-school-campus";
const KSNV_URL =
  "https://news3lv.com/news/local/ccsd-recommends-consolidating-six-schools-in-37-billion-facility-plan";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";
const pCls = "text-body-lg text-lvinit-warmgray";
const strong = "text-lvinit-black";

const meta: StoryMeta = {
  title: "CCSD Facility Master Plan: School Consolidations & Rebuilds | LVINIT",
  headline: TITLE,
  description:
    "CCSD's draft facility plan would spend $3.7B to renovate 19 schools, replace 8 and consolidate 6. Here are the named schools by area and year, what's not decided, and the Dec. 2 board work session.",
  path: PATH,
  image: HERO,
  imageWidth: 1672,
  imageHeight: 941,
  imageAlt: HERO_ALT,
  datePublished: "2026-11-24",
  dateModified: "2026-11-26",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "CCSD Facility Master Plan", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function CcsdFacilityMasterPlanPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Neighborhoods & Living",
        headline: TITLE,
        subheadline:
          "The Clark County School District just named the first specific schools in its long-range building plan. Here's what's proposed, where those schools are, and what's still not decided.",
        image: HERO,
        imageAlt: HERO_ALT,
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on how different parts of the valley are changing.",
        stories: [
          {
            name: "Moving to Las Vegas",
            href: "/guides/moving-to-las-vegas",
            category: "Moving to Las Vegas",
            dek: "The practical starting point if you're new to the valley.",
          },
          {
            name: "North Las Vegas",
            href: "/neighborhoods/north-las-vegas",
            category: "Neighborhood",
            dek: "Where three of the named schools are.",
          },
          {
            name: "Henderson",
            href: "/neighborhoods/henderson",
            category: "Neighborhood",
            dek: "Home to the Sewell and Brown campuses.",
          },
        ],
      }}
      ctas={{
        heading: "Figuring out schools as part of a move?",
        body:
          "School zones are one of the first things people ask me about. I can't tell you which school is right for your family, but I can help you understand the area and where to check the official answers.",
      }}
    >
      <StoryLede
        kicker="Neighborhoods & Living"
        lead="The Clark County School District has released the first recommendations from its Facility Master Plan. The draft would spend $3.7 billion in restricted bond money to renovate 19 schools, replace eight and consolidate six, with the changes phased in from the 2027-28 school year through 2029-30. None of it is final. The Board of School Trustees is scheduled to discuss the recommendations at a work session on Wednesday, Dec. 2, at 4 p.m."
      />

      <StorySection heading="Why CCSD is doing this">
        <p className={pCls}>
          CCSD says it expects about 45,000 fewer students over the next five
          years, mostly because of declining birth rates. At the same time, a
          lot of its buildings are old. One of the schools on the list is in a
          70-year-old building that the district says has major infrastructure
          failures.
        </p>
        <p className={`mt-5 ${pCls}`}>
          The recommendations come out of a two-year process the district
          calls &ldquo;Building Brighter Futures.&rdquo; CCSD says it included
          55 community forums, two districtwide surveys with 7,962 responses,
          enrollment analysis and building-condition evaluations. The money is
          restricted bond funding, meaning it&rsquo;s for buildings, not
          day-to-day operating costs.
        </p>
      </StorySection>

      <StorySection muted heading="The six schools that would consolidate">
        <p className={pCls}>
          The district&rsquo;s release spells out the consolidations and the
          rebuilds tied to them. Here they are by school year, with where each
          campus is so you can tell whether it&rsquo;s your part of town.
        </p>

        <h3 className="mt-8 font-display text-heading-sm font-bold text-lvinit-black">2027-28</h3>
        <ul className="mt-4 list-disc space-y-4 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className={strong}>
              Helen Anderson Toland International Academy &rarr; new Matt Kelly
              campus (Historic Westside, Las Vegas).
            </span>{" "}
            Toland, on D Street, is the school in the 70-year-old building.
            Its magnet program would move to the new Matt Kelly Elementary
            campus, which opens in 2027-28 with a community center. CCSD broke
            ground on that $76 million campus in July, on the site of the
            original 1960 school. The combined school&rsquo;s proposed name
            still needs School Name Committee approval. Kelly families could
            choose Wendell Williams Elementary instead.
          </li>
          <li>
            <span className={strong}>
              Richard J. Rundle Elementary &rarr; Charlotte and Jerry Keller
              Elementary (east Las Vegas, 89110).
            </span>{" "}
            Rundle students would move to the Keller campus, which gets an
            extensive renovation finished by 2028-29. Some students west of
            Nellis Boulevard would be rezoned to Elbert Edwards Elementary,
            and some south of Charleston Boulevard to John F. Mendoza
            Elementary.
          </li>
        </ul>

        <h3 className="mt-8 font-display text-heading-sm font-bold text-lvinit-black">2028-29</h3>
        <ul className="mt-4 list-disc space-y-4 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className={strong}>
              Marc A. Kahre Elementary &rarr; Dorothy Eisenberg Elementary
              (northwest Las Vegas, 89129).
            </span>{" "}
            Kahre, on West Gowan Road, would consolidate into Eisenberg, which
            is prioritized for near-term renovation. The Kahre campus would
            become CCSD School Police headquarters. Families could also apply
            to the renovated Irwin and Susan Molasky Pre-K-8 Magnet School,
            opening fall 2028.
          </li>
          <li>
            <span className={strong}>Molasky middle-school students.</span>{" "}
            Students zoned for Molasky Junior High could apply to that new
            Pre-K-8 magnet, or be zoned to Justice Myron E. Leavitt Middle
            School (slated for renovation) or J. Harold Brinley Middle School
            (replaced in 2025).
          </li>
        </ul>

        <h3 className="mt-8 font-display text-heading-sm font-bold text-lvinit-black">2029-30</h3>
        <ul className="mt-4 list-disc space-y-4 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className={strong}>
              Quannah McCall and Marion Cahlan elementaries &rarr; rebuilt Jim
              Bridger Pre-K-8 (North Las Vegas, 89030).
            </span>{" "}
            Most students from both schools would be rezoned to a
            reconstructed Jim Bridger, reopening in 2029 as a Pre-K-8 magnet.
            Some Cahlan students could go to Lincoln Elementary (built in 2017)
            or Fay Herron Elementary, which would be fully reconstructed by
            2030.
          </li>
          <li>
            <span className={strong}>
              C.T. Sewell Elementary &rarr; rebuilt B. Mahlon Brown Pre-K-8
              (Henderson, 89015).
            </span>{" "}
            Brown would be rebuilt as a Pre-K-8 magnet reopening in fall 2029,
            and Sewell would consolidate into it. Parts of Brown&rsquo;s
            current middle-school zone would move to Jack and Terry Mannion
            Middle School, which is prioritized for near-term renovation, and
            Francis H. Cortney Junior High (renovated in 2021). The Sewell
            campus would be repurposed in 2029.
          </li>
        </ul>
      </StorySection>

      <StorySection heading="What isn’t in the release">
        <p className={pCls}>
          A few things you won&rsquo;t find here, because CCSD hasn&rsquo;t
          put them in its announcement:
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className={strong}>The full renovation and replacement lists.</span>{" "}
            The release names the schools tied to the six consolidations, not
            all 19 renovations and eight replacements. The district&rsquo;s
            draft options documents are posted on its{" "}
            <a href={DOCS_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              Facility Master Plan documents page
            </a>
            . If you want to know about a specific school that isn&rsquo;t
            named here, check there and don&rsquo;t take anyone&rsquo;s word
            for it, including mine.
          </li>
          <li>
            <span className={strong}>A vote date.</span> Dec. 2 is a work
            session for discussion. CCSD hasn&rsquo;t published when the board
            would vote on a final plan, and the &ldquo;Final Plan&rdquo; is
            still listed as coming soon.
          </li>
          <li>
            <span className={strong}>What happens to surplus buildings.</span>{" "}
            Other than Kahre becoming School Police headquarters, CCSD says
            it will work out surplus properties with cities and community
            partners. Teachers and support staff at affected schools would be
            placed at other campuses under negotiated agreements.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="What this means if you live here or are moving here">
        <p className={pCls}>
          If your kids go to one of the schools above, the honest takeaway is
          that nothing changes this year or next. The earliest moves are
          proposed for fall 2027, and every piece of this can still change
          before the board acts. The Dec. 2 work session is the first real
          checkpoint. CCSD posts the agenda, livestream and public comment
          details through its board meeting portal at ccsd.net.
        </p>
        <p className={`mt-5 ${pCls}`}>
          If you&rsquo;re shopping for a home, this is a good reminder that
          school zones aren&rsquo;t permanent. A listing that says
          &ldquo;zoned for&rdquo; a certain school is telling you about today.
          Rezoning is part of this plan in east Las Vegas, North Las Vegas and
          Henderson, so always confirm the current zone with CCSD&rsquo;s own
          school locator, and watch how this plan shakes out if a particular
          school matters to you.
        </p>
        <p className={`mt-5 ${pCls}`}>
          It&rsquo;s also worth noticing where the money goes. Most of the
          named campuses are in the valley&rsquo;s older neighborhoods: the
          Historic Westside, east Las Vegas, North Las Vegas and
          Henderson&rsquo;s original core. Those are the same areas seeing a
          lot of other reinvestment right now, from{" "}
          <Link href="/guides/one-civic-center-north-las-vegas-redevelopment" className={linkCls}>
            One Civic Center in North Las Vegas
          </Link>{" "}
          to the{" "}
          <Link href="/guides/desert-pines-golf-course-redevelopment-east-las-vegas" className={linkCls}>
            Desert Pines redevelopment in east Las Vegas
          </Link>{" "}
          and{" "}
          <Link href="/guides/water-street-district-henderson" className={linkCls}>
            Henderson&rsquo;s Water Street District
          </Link>
          . If you&rsquo;re still getting your bearings, start with the{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>{" "}
          guide, or compare areas in{" "}
          <Link href="/guides/summerlin-vs-henderson-vs-southwest-las-vegas" className={linkCls}>
            Summerlin vs. Henderson vs. Southwest Las Vegas
          </Link>
          .
        </p>
        <p className={`mt-5 ${pCls}`}>
          The photo at the top is a general school scene, not one of the
          campuses named in the plan. We&rsquo;ll update this after the
          Dec. 2 work session.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className={strong}>Clark County School District</span>,
            &ldquo;CCSD Releases Facility Master Plan Recommendations,&rdquo;
            Facility Master Plan news, November 2026.{" "}
            <a href={RELEASE_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              fmp.ccsd.net
            </a>
          </li>
          <li>
            <span className={strong}>Clark County School District</span>,
            Facility Master Plan documents.{" "}
            <a href={DOCS_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              fmp.ccsd.net/documents
            </a>
          </li>
          <li>
            <span className={strong}>Clark County School District</span>,
            &ldquo;CCSD breaks ground on new Matt Kelly Elementary School
            campus,&rdquo; July 13, 2026.{" "}
            <a href={KELLY_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              ccsd.net
            </a>
          </li>
          <li>
            <span className={strong}>News 3 Las Vegas (KSNV)</span>,
            &ldquo;CCSD recommends consolidating six schools in $3.7 billion
            facility plan.&rdquo;{" "}
            <a href={KSNV_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              news3lv.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
