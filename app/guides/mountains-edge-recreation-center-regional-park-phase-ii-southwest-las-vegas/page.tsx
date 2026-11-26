import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// GROWTH & DEVELOPMENT — Mountain's Edge Recreation Center and Mountain's Edge
// Regional Park Phase II, southwest Las Vegas (Enterprise). Built by the
// LVINIT Daily Publisher from Local Radar assignment
// LR-MOUNTAINS-EDGE-REC-CENTER-PARK-PHASE-II.
//
// FACT DISCIPLINE — read this run (2026-11-19):
// - Clark County BCC action summary, Tue Nov. 17, 2026 (legistar, read):
//   item 10, approve selection of and contract with CORE West, Inc. dba CORE
//   Construction, RFP No. 607885-26, Preconstruction and Construction Services
//   for Mountain's Edge Recreation Center & Mountain's Edge Regional Park
//   Phase II (SNPLMA); contract "initially for Preconstruction Services".
//   ACTION: APPROVED.
// - RFP 607885-26 (read; published in the Review-Journal June 16, 2026): two
//   separate projects under one Construction Manager at Risk solicitation.
//   Scope 1 rec center funded by Clark County, est. $43.7M-$46M. Scope 2
//   Regional Park Phase II funded through SNPLMA, est. $41.42M-$43.6M.
//   Combined est. $85.12M-$89.6M. Proposals due July 16, 2026.
// - Clark County SNPLMA release (read; undated): $43,618,352 awarded for
//   enhancements in Mountain's Edge Regional Park; about 55 acres; soccer
//   complex, pickleball complex, community botanical garden; existing walking
//   loop realigned. Quote from Commissioner Justin Jones.
// DELIBERATELY OMITTED (unresolved / mustNotClaim): any design, groundbreaking
// or opening date (KSNV only; KSNV report not located this run); rec-center
// features, size, architect and exact site; any aquatic center; any contract
// price (the ranges are RFP estimates); any tie to the $222.5M bond item;
// the park's street address (not verified this run).
// IMAGERY — Hero and card image (added 2026-11-26): Mikey's own aerial of
// Mountain's Edge Regional Park, uploaded to public/images/hero/. Alt text
// describes the existing park only; it does not label any open desert in the
// frame as the Phase II or rec-center site (that site isn't published).
// Existing "park in Mountain's Edge" and Exploration Peak Park images are NOT
// this park and are not used.
// ---------------------------------------------------------------------------

const PATH =
  "/guides/mountains-edge-recreation-center-regional-park-phase-ii-southwest-las-vegas";
const TITLE =
  "Mountain's Edge Is Getting a Rec Center and a Bigger Regional Park. Here's What Clark County Just Approved";
const HERO = "/images/hero/mountains-edge-regional-park-las-vegas-hero.webp";
const HERO_ALT =
  "Aerial view of Mountain's Edge Regional Park in southwest Las Vegas: lighted baseball and softball fields, a turf field, a playground, shade structures and parking lots, with open desert, neighborhoods and mountains beyond under a cloudy sky.";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const meta: StoryMeta = {
  title: "Mountain's Edge Recreation Center & Regional Park Phase II | LVINIT",
  headline: TITLE,
  description:
    "Clark County picked CORE Construction for a new Mountain's Edge recreation center and Phase II of Mountain's Edge Regional Park, estimated at $85M to $90M combined. What's planned and what isn't set yet.",
  path: PATH,
  image: HERO,
  imageWidth: 1448,
  imageHeight: 1086,
  imageAlt: HERO_ALT,
  datePublished: "2026-11-19",
  dateModified: "2026-11-26",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Mountain's Edge Rec Center & Park Phase II", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function MountainsEdgeRecCenterParkPhaseIIPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Growth & Development",
        headline: TITLE,
        subheadline:
          "Two linked projects, one builder and roughly $85 million to $90 million in estimated cost. Here's what's actually decided and what isn't yet.",
        image: HERO,
        imageAlt: HERO_ALT,
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on what's being built in the southwest valley.",
        stories: [
          {
            name: "Southwest Las Vegas",
            href: "/neighborhoods/southwest-las-vegas",
            category: "Neighborhoods",
            dek: "The full LVINIT guide to the area, Mountain's Edge included.",
          },
          {
            name: "Echo Trail Park community center",
            href: "/guides/echo-trail-park-community-center-southwest-las-vegas",
            category: "Local Feature",
            dek: "Another county community center on the way in the southwest.",
          },
          {
            name: "Blue Diamond Wash Trail",
            href: "/guides/blue-diamond-wash-trail-southwest-las-vegas",
            category: "Local Feature",
            dek: "A new paved trail under construction a few miles north.",
          },
        ],
      }}
      ctas={{
        heading: "Weighing Mountain's Edge against other parts of town?",
        body:
          "Parks and rec centers are a big part of why people pick the southwest. Tell me what matters to you and I'll give you a straight answer on where to look.",
      }}
    >
      <StoryLede
        kicker="Growth & Development"
        lead="Mountain's Edge is about to get a lot more public space. On Tuesday, November 17, the Clark County Commission approved CORE Construction to deliver two linked projects in the southwest valley: a brand-new Mountain's Edge Recreation Center and Phase II of Mountain's Edge Regional Park. The county's own estimate for the two together is $85.1 million to $89.6 million."
      />

      <StorySection heading="What the county approved">
        <p className="text-body-lg text-lvinit-warmgray">
          The vote picked a builder. It didn&rsquo;t start construction. The
          commission approved CORE West, Inc., doing business as CORE
          Construction, as the construction manager for both projects, on the
          consent agenda. The contract starts with preconstruction services,
          which is the stage where the builder works alongside the designers on
          cost, scheduling and constructability before anything gets built.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The county bid both projects together under one solicitation, but
          they&rsquo;re separate projects with separate money:
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">
              Mountain&rsquo;s Edge Recreation Center.
            </span>{" "}
            Paid for by Clark County. Estimated at $43.7 million to $46
            million.
          </li>
          <li>
            <span className="text-lvinit-black">
              Mountain&rsquo;s Edge Regional Park Phase II.
            </span>{" "}
            Paid for through the Southern Nevada Public Land Management Act.
            Estimated at $41.42 million to $43.6 million.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Those are the estimate ranges from the county&rsquo;s request for
          proposals, published in June. They aren&rsquo;t a final contract
          price.
        </p>
      </StorySection>

      <StorySection muted heading="What Phase II adds to the park">
        <p className="text-body-lg text-lvinit-warmgray">
          The county has been clearest about the park side. When it announced
          a $43,618,352 federal land-sale grant for Mountain&rsquo;s Edge
          Regional Park, it said the project would develop about 55 acres of
          the park and add:
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">A soccer complex</span>
          </li>
          <li>
            <span className="text-lvinit-black">A pickleball complex</span>
          </li>
          <li>
            <span className="text-lvinit-black">A community botanical garden</span>
          </li>
          <li>
            <span className="text-lvinit-black">A realigned walking loop</span>{" "}
            so the existing trail connects better to the new amenities
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Commissioner Justin Jones put it this way in the county&rsquo;s
          announcement: &ldquo;This new phase will transform the park into a
          special gathering place with activities for everyone.&rdquo;
        </p>
      </StorySection>

      <StorySection heading="Who's paying for it">
        <p className="text-body-lg text-lvinit-warmgray">
          The two halves are funded very differently, and that&rsquo;s worth
          understanding.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The park expansion runs on Southern Nevada Public Land Management Act
          money. Under that federal law, proceeds from selling federal land in
          the Las Vegas Valley come back to the area for parks, trails and
          public lands. The county says the program has generated more than
          $4.5 billion over 20 rounds. In plain terms, the valley growing out
          onto former federal land is helping pay for the parks those new
          neighborhoods use.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The recreation center is county-funded. The solicitation says the
          builder has to keep separate budgets, schedules and records for each
          project, so the federal money and the county money don&rsquo;t mix.
        </p>
      </StorySection>

      <StorySection muted heading="Why it matters for Mountain's Edge">
        <p className="text-body-lg text-lvinit-warmgray">
          Mountain&rsquo;s Edge is the biggest single master plan in the
          southwest corner of the valley. Clark County describes it as about
          2,500 acres in the town of Enterprise, generally south of Blue
          Diamond Road and west of Rainbow Boulevard, with roughly 700 acres
          set aside for public facilities. Parks are a big part of why people
          end up out here, and the regional park is one of the anchors.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The rec center is the piece that could change everyday life the
          most. An indoor county facility is the kind of place where classes,
          programs and somewhere to go in July end up happening, close to home
          instead of across town. Pair it with new fields, pickleball courts
          and a botanical garden at the park, and the county is estimating
          close to $90 million of public investment in one community.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It also fits a pattern. The county already approved a{" "}
          <Link
            href="/guides/echo-trail-park-community-center-southwest-las-vegas"
            className={linkCls}
          >
            new community center at Echo Trail Park
          </Link>
          , and the{" "}
          <Link
            href="/guides/blue-diamond-wash-trail-southwest-las-vegas"
            className={linkCls}
          >
            Blue Diamond Wash Trail
          </Link>{" "}
          is under construction a few miles north. The public side of the
          southwest is finally catching up with how many people live there.
          For the bigger picture on the area, from Mountain&rsquo;s Edge to the
          Durango corridor, read our{" "}
          <Link href="/neighborhoods/southwest-las-vegas" className={linkCls}>
            Southwest Las Vegas guide
          </Link>
          . If you&rsquo;re still deciding between the southwest and the other
          big options, start with{" "}
          <Link
            href="/guides/summerlin-vs-henderson-vs-southwest-las-vegas"
            className={linkCls}
          >
            Summerlin vs. Henderson vs. Southwest Las Vegas
          </Link>{" "}
          or{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection heading="What isn't set yet">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">When it opens.</span> The
            county documents I read don&rsquo;t give a groundbreaking or
            opening date. This vote starts preconstruction, so it&rsquo;s
            early. I&rsquo;m not going to guess at a year.
          </li>
          <li>
            <span className="text-lvinit-black">
              What&rsquo;s inside the rec center.
            </span>{" "}
            The county hasn&rsquo;t published a building size, a floor plan or
            a feature list in what I reviewed. That includes a pool. Nothing I
            read says one is planned.
          </li>
          <li>
            <span className="text-lvinit-black">Exactly where it goes.</span>{" "}
            The rec center&rsquo;s spot in or next to the park isn&rsquo;t
            published, so don&rsquo;t read any open patch of ground as the
            site.
          </li>
          <li>
            <span className="text-lvinit-black">The final price.</span> The
            $85.1 million to $89.6 million figure is the county&rsquo;s
            estimate range from the solicitation, not a signed construction
            price.
          </li>
          <li>
            <span className="text-lvinit-black">What the photo shows.</span>{" "}
            The aerial at the top is the park as it is today. The open desert
            around it isn&rsquo;t a confirmed expansion or rec-center site.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">
              Clark County Board of County Commissioners
            </span>
            , action summary, November 17, 2026, consent item 10.{" "}
            <a
              href="https://clark.legistar.com/View.ashx?M=E1&ID=1454768&GUID=509EECE5-A13D-451E-A381-DAC3ECBA743D"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              Action summary (PDF)
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Clark County</span>, RFP No.
            607885-26, Mountain&rsquo;s Edge Recreation Center &amp;
            Mountain&rsquo;s Edge Regional Park Phase II (SNPLMA), published
            June 16, 2026.{" "}
            <a
              href="https://www.clarkcountynv.gov/assets/documents/business/business_opportunities/607885-26-gvc.pdf"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              Solicitation notice (PDF)
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Clark County</span>, news
            release on SNPLMA funding for Mountain&rsquo;s Edge Regional Park.{" "}
            <a
              href="https://www.clarkcountynv.gov/news/news-detail-t28-r1077"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              clarkcountynv.gov
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">
              Clark County Comprehensive Planning
            </span>
            , Mountain&rsquo;s Edge.{" "}
            <a
              href="https://www.clarkcountynv.gov/government/departments/comprehensive_planning_department/library/mountains-edge"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              clarkcountynv.gov
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
