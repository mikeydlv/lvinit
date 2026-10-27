import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import Container from "@/components/ui/Container";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryPullQuote,
  StoryGallery,
} from "@/components/story";

// ---------------------------------------------------------------------------
// GROWTH & DEVELOPMENT — Nevada's first standalone children's hospital.
// Built by the LVINIT Daily Publisher from the 2026-10-27 Local Radar
// assignment LR-CHILDRENS-HOSPITAL-HARRY-REID (primary assignment, READY).
//
// FACT DISCIPLINE — every figure below was read this run from:
// - Intermountain Health release, dateline Las Vegas, 26 Oct 2026 ("breaks
//   ground"): groundbreaking Monday evening Oct 26; 33-acre campus; ~828,600
//   sq ft; 180-bed initial inpatient tower expandable to 228; opening 2030;
//   $150M Felicia and Ben Horowitz commitment to the Intermountain Health
//   Nevada Campaign for Kids; planned services list; service area incl.
//   Arizona and Southern Utah; Gov. Lombardo quote. The release gives no
//   cross streets, cost, architects or contractors.
// - Intermountain release of July 1, 2025 (land lease): parties Intermountain,
//   The Gardner Group, UNLV Research Foundation; architects Shepley Bulfinch
//   and Gensler; Nevada patients often travel out of state for specialty care.
// - UNLV news (Oct 23, 2024): park is in Southwest Las Vegas, covers 122 acres.
// - 8 News Now (Clark County permit coverage): site "just northeast of the 215
//   Beltway at South Durango Drive" — secondary, hedged in copy.
// DELIBERATELY OMITTED (unresolved): total construction cost, contractors
// (secondary only), exact cross streets, building height, and the permit
// square-footage that differs from Intermountain's (826,600 vs ~828,600).
//
// IMAGERY — no LVINIT photography of the site exists yet. Hero and inline
// image are general Southwest Las Vegas Media Image Library stills, captioned
// as general area context, never as the hospital site.
// ---------------------------------------------------------------------------

const PATH = "/guides/nevada-first-standalone-childrens-hospital-southwest-las-vegas";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const HERO = "/images/editorial/southwest-las-vegas-office-buildings-freeway-aerial.jpg";
const HERO_ALT =
  "Aerial of new office buildings and a parking garage beside a freeway in Southwest Las Vegas, with the Las Vegas Strip skyline in the distance.";

const meta: StoryMeta = {
  title:
    "Nevada's First Standalone Children's Hospital Breaks Ground in Southwest Las Vegas | LVINIT",
  headline:
    "Nevada's First Standalone Children's Hospital Just Broke Ground in Southwest Las Vegas",
  description:
    "Intermountain Health broke ground Oct. 26 on a 33-acre children's hospital at UNLV's Harry Reid Research & Technology Park. What's confirmed, what isn't, and what it means for families in the southwest valley.",
  path: PATH,
  image: HERO,
  imageWidth: 1920,
  imageHeight: 1080,
  imageAlt: HERO_ALT,
  datePublished: "2026-10-27",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Southwest Las Vegas", path: "/neighborhoods/southwest-las-vegas" },
    { name: "Nevada's First Standalone Children's Hospital", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "33 acres",
    label: "Campus size",
    note: "About 828,600 square feet of hospital, per Intermountain",
  },
  {
    value: "180 beds",
    label: "Initial inpatient tower",
    note: "Expandable to 228 beds",
  },
  {
    value: "2030",
    label: "Expected opening",
    note: "Groundbreaking held Monday evening, Oct. 26, 2026",
  },
  {
    value: "$150M",
    label: "Horowitz commitment",
    note: "Felicia and Ben Horowitz, to the Nevada Campaign for Kids",
  },
];

function SnapshotPanel() {
  return (
    <section id="by-the-numbers" aria-label="Hospital snapshot" className="scroll-mt-24">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            The hospital, by the numbers
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            Figures are from Intermountain Health&rsquo;s October 26, 2026
            release. Nothing here is open or operating yet.
          </p>
          <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-lvinit-lightgray bg-lvinit-lightgray sm:grid-cols-2 lg:grid-cols-4">
            {SNAPSHOT.map((s) => (
              <div key={s.label} className="bg-lvinit-white p-6">
                <dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                  {s.label}
                </dt>
                <dd className="mt-2 font-display text-heading font-bold text-lvinit-blue">
                  {s.value}
                </dd>
                <p className="mt-2 text-caption text-lvinit-warmgray">{s.note}</p>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}

export default function ChildrensHospitalPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Growth & Development",
        headline:
          "Nevada's First Standalone Children's Hospital Just Broke Ground in Southwest Las Vegas",
        subheadline:
          "Intermountain Health held the groundbreaking Monday evening for a 33-acre campus at UNLV's Harry Reid Research & Technology Park. Here's what's confirmed, what isn't, and what it changes for families in the southwest valley.",
        image: HERO,
        imageAlt: HERO_ALT,
        backLink: { label: "Southwest Las Vegas", href: "/neighborhoods/southwest-las-vegas" },
        ctas: [{ label: "See the numbers", href: "#by-the-numbers", variant: "primary" }],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "More on the part of the valley this hospital is landing in, and how it compares with the other big suburban options.",
        stories: [
          {
            name: "Southwest Las Vegas: Neighborhoods, Map & Local Guide",
            href: "/neighborhoods/southwest-las-vegas",
            category: "Neighborhoods",
            dek: "The full LVINIT guide to the area, from Mountain's Edge to the 215 corridor.",
          },
          {
            name: "Henderson vs. Southwest Las Vegas: Where Should You Actually Move?",
            href: "/guides/henderson-vs-southwest-las-vegas",
            category: "Comparisons",
            dek: "A side-by-side look at two of the valley's biggest family-oriented areas.",
          },
          {
            name: "Moving to Las Vegas: Where to Start",
            href: "/guides/moving-to-las-vegas",
            category: "Moving Here",
            dek: "The practical starting point if you're weighing a move and want the big picture first.",
          },
        ],
      }}
      relatedNeighborhood={{
        name: "Southwest Las Vegas",
        href: "/neighborhoods/southwest-las-vegas",
      }}
      ctas={{
        heading: "Weighing the southwest valley for your family?",
        body:
          "A hospital that opens in 2030 is one factor among many. If you're thinking about a move and want an honest read on which part of the valley fits, tell me where you're starting from.",
      }}
    >
      <StoryLede
        kicker="Growth & Development"
        lead="On Monday evening, October 26, Intermountain Health broke ground on what it calls Nevada's first standalone children's hospital, in the southwest part of the Las Vegas Valley. It won't open until 2030, so nothing changes for families today. But it's the biggest healthcare project to land in this part of town in years, and it's worth understanding what has actually been confirmed."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          If you&rsquo;re already looking at the area, start with our{" "}
          <Link href="/neighborhoods/southwest-las-vegas" className={linkCls}>
            Southwest Las Vegas guide
          </Link>
          ; this story is about one project inside it.
        </p>
      </StoryLede>

      <StorySection heading="What was announced">
        <p className="text-body-lg text-lvinit-warmgray">
          The facility is named the{" "}
          <span className="text-lvinit-black">
            Intermountain Health Felicia and Ben Horowitz Children&rsquo;s
            Hospital
          </span>
          . Per Intermountain&rsquo;s release, it sits on a{" "}
          <span className="text-lvinit-black">33-acre campus</span> and totals
          about <span className="text-lvinit-black">828,600 square feet</span>.
          It opens with a{" "}
          <span className="text-lvinit-black">180-bed inpatient tower</span>{" "}
          that can expand to 228 beds, and Intermountain expects it to open in{" "}
          <span className="text-lvinit-black">2030</span>.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The groundbreaking followed an October 23 announcement of a{" "}
          <span className="text-lvinit-black">$150 million commitment</span>{" "}
          from Felicia and Ben Horowitz to the Intermountain Health Nevada
          Campaign for Kids, which Intermountain describes as one of the
          largest gifts to a children&rsquo;s hospital in the nation.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Planned services listed in the release include neonatal care,
          pediatric and cardiac intensive care, emergency and trauma care,
          orthopedics, cancer and bone marrow transplant services, behavioral
          health, and advanced medical and surgical care for children.
          Intermountain says it will serve families across Nevada and
          surrounding states, including Arizona and Southern Utah.
        </p>
      </StorySection>

      <SnapshotPanel />

      <StorySection heading="Where it's going">
        <p className="text-body-lg text-lvinit-warmgray">
          The campus is on UNLV&rsquo;s Harry Reid Research &amp; Technology
          Park in southwest Las Vegas. UNLV describes the park as covering 122
          acres. The land is under a lease among Intermountain Health, The
          Gardner Group and the UNLV Research Foundation.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Intermountain&rsquo;s groundbreaking release doesn&rsquo;t give cross
          streets. Local coverage of the county permit approvals places the
          site just northeast of the 215 Beltway at South Durango Drive.
          That&rsquo;s secondary reporting, so check a map before you plan
          around it. The site is an active construction zone and isn&rsquo;t
          open to visitors. The photo at the top of this page is a general
          view of Southwest Las Vegas, not the hospital site; LVINIT doesn&rsquo;t
          have its own photos of the site yet.
        </p>
      </StorySection>

      <StoryPullQuote cite="Gov. Joe Lombardo, in Intermountain Health's October 26, 2026 release">
        This hospital represents an investment in our children and the future
        strength and health of our state.
      </StoryPullQuote>

      <StorySection heading="What it means for families in the southwest valley">
        <p className="text-body-lg text-lvinit-warmgray">
          The practical case, in Intermountain&rsquo;s own framing, is that
          Nevada families who need specialty pediatric care shouldn&rsquo;t
          have to leave home for it. Its 2025 announcement said patients here
          often travel out of state for specialty care such as oncology and
          cardiovascular treatment. A dedicated children&rsquo;s hospital is
          meant to change that, though not until the doors open.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          For someone relocating with kids, that&rsquo;s a real long-term
          consideration for the southwest side of the valley, alongside the
          things that matter more day to day: schools, commute, and the kind
          of neighborhood you want. Our{" "}
          <Link href="/guides/henderson-vs-southwest-las-vegas" className={linkCls}>
            Henderson vs. Southwest comparison
          </Link>{" "}
          and{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            moving guide
          </Link>{" "}
          cover those.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          What it does <em>not</em> tell you: whether nearby home values will
          move, or how traffic will change around the site. Nobody has
          published data on either, and I&rsquo;m not going to guess. A hospital
          that opens in 2030 shouldn&rsquo;t drive a purchase decision today.
        </p>
      </StorySection>

      <StoryGallery
        columns={1}
        images={[
          {
            src: "/images/editorial/southwest-las-vegas-homes-under-construction-framing.jpg",
            alt: "New two-story homes under construction in Southwest Las Vegas, some in wood framing and one in stucco with scaffolding.",
            label: "Southwest Las Vegas",
            caption:
              "New homes going up in the southwest valley, the kind of growth the area has seen for years. General area photo, not near the hospital site.",
          },
        ]}
      />

      <StorySection muted heading="What's still unconfirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Total construction cost.</span>{" "}
            Intermountain&rsquo;s release doesn&rsquo;t state one. Earlier
            coverage tied a $1 billion figure to the overall fundraising
            campaign, and that isn&rsquo;t confirmed as the building cost.
          </li>
          <li>
            <span className="text-lvinit-black">Contractors.</span> Not named in
            the release, so none are named here.
          </li>
          <li>
            <span className="text-lvinit-black">Exact cross streets</span> and
            site access, as noted above.
          </li>
        </ul>
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Architects Shepley Bulfinch and Gensler were named in
          Intermountain&rsquo;s 2025 announcement.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Intermountain Health</span>,
            &ldquo;Intermountain Health breaks ground on a new era of
            children&rsquo;s health in Nevada,&rdquo; October 26, 2026.{" "}
            <a
              href="https://news.intermountainhealth.org/intermountain-health-breaks-ground-on-a-new-era-of-childrens-health-in-nevada/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              news.intermountainhealth.org
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Intermountain Health</span>,
            land lease agreement with the UNLV Research Foundation, July 1,
            2025.{" "}
            <a
              href="https://news.intermountainhealth.org/intermountain-health-and-gardner-group-complete-land-lease-agreement-with-unlv-research-foundation-for-location-of-future-stand-alone-comprehensive-childrens-hospital-in-las-vegas/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              news.intermountainhealth.org
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">UNLV</span>, site unveiling at
            the Harry Reid Research &amp; Technology Park, October 23, 2024.{" "}
            <a
              href="https://www.unlv.edu/news/article/intermountain-health-unveils-site-future-stand-alone-childrens-hospital-unlv-tech-park"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              unlv.edu
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">8 News Now</span>, county
            permit approval coverage (site location).{" "}
            <a
              href="https://www.8newsnow.com/news/local-news/permits-approved-for-las-vegass-first-standalone-childrens-hospital/amp/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              8newsnow.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
