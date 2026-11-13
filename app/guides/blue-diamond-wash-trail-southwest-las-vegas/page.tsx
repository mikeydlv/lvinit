import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// GROWTH & DEVELOPMENT — Blue Diamond Wash Trail, Durango Dr to Hualapai Way,
// southwest Las Vegas Valley (unincorporated Clark County).
// Built by the LVINIT Daily Publisher (2026-11-13) from Local Radar assignment
// LR-BLUE-DIAMOND-WASH-TRAIL (READY - FIRST-PARTY MEDIA RECOMMENDED).
//
// FACT DISCIPLINE (sources read 2026-11-13):
// - PRIMARY: Clark County Public Works, Notice of Road Construction, "Blue
//   Diamond Wash Trail from Durango Drive to Hualapai Way" (PDF): located on
//   Blue Diamond Wash from Durango Drive to Hualapai Way; ADA compliant
//   12-foot to 15-foot wide paved trail with protective measures where the
//   trail may be introduced to erosive wash flows, collapsible bollards,
//   striping, wayfinding signage, an at-grade crossing at Fort Apache Road,
//   connections to existing trailheads on each end, within the existing
//   Clark County flood control easement or adjacent county-owned land.
//   Contractor Unicon LLC; Bid 607862-25; contract amount $2,790,000;
//   construction start Monday Aug 31, 2026; estimated completion February
//   2027; hours Mon-Fri 7 a.m.-3 p.m.; lanes may be restricted at times;
//   message boards give two weeks' notice of traffic-control changes; county
//   says cost and schedule are current best estimates, subject to change.
//   Map page (titled "Hualapai Way to Wigwam Avenue"): alignment on the south
//   side of the wash, north of Pebble Road, crossing Fort Apache Road, with an
//   "existing trailhead and parking lot" labeled near Wigwam Avenue.
// - KSNV News 3, Nov 10, 2026: Commissioner Justin Jones and Clark County
//   Public Works held a groundbreaking that day.
// OMITTED ON PURPOSE: trail length (not stated by the county), funding
//   source (not stated), the engineer's estimate on the bid listing
//   (superseded by the contract amount), any claim that the trail is open,
//   any first-person visit claim (no first-party media exists).
// IMAGERY: no first-party photo of the Blue Diamond Wash corridor exists and
//   no Media Image Library asset shows it, so the page runs without a hero
//   photo (card uses a generated editorial cover). No Media Image Library
//   usage records change.
// ---------------------------------------------------------------------------

const PATH = "/guides/blue-diamond-wash-trail-southwest-las-vegas";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";
const COUNTY_NOTICE =
  "https://www.clarkcountynv.gov/adobe/assets/urn:aaid:aem:59a3ab60-e065-46c5-8e76-a1eff50bbc89/original/as/Blue-Diamond-V2.pdf";
const KSNV =
  "https://news3lv.com/news/local/clark-county-breaks-ground-on-blue-diamond-wash-trail-project-in-southwest-valley";

const TITLE =
  "A Paved Trail Is Coming to the Blue Diamond Wash in Southwest Las Vegas";

const meta: StoryMeta = {
  title: "Blue Diamond Wash Trail: Route, Timeline & What's Being Built | LVINIT",
  headline: TITLE,
  description:
    "Clark County is building a 12- to 15-foot paved trail along the Blue Diamond Wash from Durango Drive to Hualapai Way, with a crossing at Fort Apache Road. Where it runs, what it connects and when it should be done.",
  path: PATH,
  datePublished: "2026-11-13",
  dateModified: "2026-11-13",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Blue Diamond Wash Trail", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function BlueDiamondWashTrailPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Growth & Development",
        headline: TITLE,
        subheadline:
          "Clark County is paving a walking and biking path along the wash between Durango Drive and Hualapai Way. The county estimates it will be done in February 2027.",
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on the southwest valley and the trails going in around Las Vegas.",
        stories: [
          {
            name: "Southwest Las Vegas",
            href: "/neighborhoods/southwest-las-vegas",
            category: "Neighborhoods",
            dek: "The neighborhoods, a real map, and where Enterprise fits.",
          },
          {
            name: "Echo Trail Park community center",
            href: "/guides/echo-trail-park-community-center-southwest-las-vegas",
            category: "Local Feature",
            dek: "A county community center planned for the southwest valley.",
          },
          {
            name: "Summerlin Parkway Trail",
            href: "/guides/summerlin-parkway-trail-summerlin-las-vegas",
            category: "Local Feature",
            dek: "What the city is building from the 215 to Rampart.",
          },
        ],
      }}
      ctas={{
        heading: "Looking at the southwest valley?",
        body:
          "Tell me how you want to live day to day and I'll give you an honest read on which parts of the southwest fit.",
      }}
    >
      <StoryLede
        kicker="Growth & Development"
        lead="If you drive Durango, Fort Apache or Hualapai in the southwest valley, you've crossed the Blue Diamond Wash: a wide strip of desert running between neighborhoods that, for most people, is just something you see out the window. Clark County is now building a paved trail along it. Work started at the end of August, the county held a groundbreaking on Nov. 10, and the current estimate is for it to be finished in February 2027. Here's where it runs, what's being built and what it adds to the area."
      />

      <StorySection heading="The short version">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Where:</span> along the Blue
            Diamond Wash from Durango Drive west to Hualapai Way, in the
            unincorporated southwest valley. The county&rsquo;s map puts the
            trail on the south side of the wash, north of Pebble Road.
          </li>
          <li>
            <span className="text-lvinit-black">What:</span> a paved,
            ADA-compliant multi-use trail 12 to 15 feet wide, with a street
            crossing at Fort Apache Road and connections to existing trailheads
            at both ends.
          </li>
          <li>
            <span className="text-lvinit-black">Who:</span> Clark County
            Public Works, with Unicon LLC as the contractor. Commissioner
            Justin Jones led the Nov. 10 groundbreaking.
          </li>
          <li>
            <span className="text-lvinit-black">Cost:</span> the construction
            contract is $2.79 million.
          </li>
          <li>
            <span className="text-lvinit-black">When:</span> construction
            started Aug. 31, 2026. The county&rsquo;s estimated completion is
            February 2027, and it says that date is a best estimate and could
            change.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="What's being built">
        <p className="text-body-lg text-lvinit-warmgray">
          The main piece is the trail itself: a paved path 12 to 15 feet wide,
          built to ADA standards so it works for wheelchairs, strollers and
          bikes, not just people on foot. The county&rsquo;s sample cross
          section shows a 15-foot paved surface where there&rsquo;s room.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Because it runs next to an active wash, a good part of the work is
          keeping the trail from washing out. The county lists protective
          measures where the path could be exposed to erosive flows during
          storms. The rest is the stuff that makes a trail usable: collapsible
          bollards to keep cars off, striping, wayfinding signs and an at-grade
          crossing at Fort Apache Road, meaning trail users will cross at street
          level rather than going over or under the road.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          All of it sits inside the county&rsquo;s existing flood-control
          easement along the wash or on county-owned land right next to it. In
          plain terms, the trail goes where the county already controls the
          land, not through anyone&rsquo;s backyard.
        </p>
      </StorySection>

      <StorySection heading="Where it runs and how it connects">
        <p className="text-body-lg text-lvinit-warmgray">
          The county&rsquo;s construction notice describes the project as
          running from Durango Drive to Hualapai Way. On its project map, the
          trail follows the south edge of the wash, passes between existing
          neighborhoods and open desert, crosses Fort Apache Road, and ties into
          an existing trailhead and parking lot the map labels near Wigwam
          Avenue at the eastern end. The notice says the trail will connect to
          existing trailheads on each end.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The county hasn&rsquo;t published a length in miles, so I&rsquo;m not
          going to guess one. What&rsquo;s clear from the map is the idea: turn
          a wash corridor that already cuts through these neighborhoods into a
          continuous, paved route people can actually walk, run or ride.
        </p>
      </StorySection>

      <StorySection muted heading="Why it matters if you live here">
        <p className="text-body-lg text-lvinit-warmgray">
          The southwest valley has filled in fast, and a lot of it was built
          around cars: walled subdivisions, wide arterials and long blocks. A
          paved path along the wash gives the neighborhoods near Durango, Fort
          Apache and Hualapai a place to walk the dog, ride with kids or get a
          run in without sharing a busy arterial with traffic.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It&rsquo;s also part of a bigger pattern. Cities and the county are
          building trails along washes, beltways and parkways all over the
          valley right now, including the{" "}
          <Link href="/guides/summerlin-parkway-trail-summerlin-las-vegas" className={linkCls}>
            Summerlin Parkway Trail
          </Link>{" "}
          on the west side and the{" "}
          <Link href="/guides/i-215-northern-beltway-trail-north-las-vegas" className={linkCls}>
            I-215 Northern Beltway Trail
          </Link>{" "}
          in North Las Vegas. Elsewhere in the southwest, the county has also approved
          a{" "}
          <Link
            href="/guides/echo-trail-park-community-center-southwest-las-vegas"
            className={linkCls}
          >
            new community center at Echo Trail Park
          </Link>
          . If you&rsquo;re trying to get a feel for the area as a whole, start
          with the{" "}
          <Link href="/neighborhoods/southwest-las-vegas" className={linkCls}>
            Southwest Las Vegas guide
          </Link>
          .
        </p>
      </StorySection>

      <StorySection heading="During construction">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Work hours:</span> Monday
            through Friday, 7 a.m. to 3 p.m., per the county.
          </li>
          <li>
            <span className="text-lvinit-black">Traffic:</span> the county
            says some lanes may be restricted, reduced or closed at times, and
            that message boards will go up two weeks before traffic-control
            changes. Fort Apache, where the crossing is being built, is the
            spot to watch.
          </li>
          <li>
            <span className="text-lvinit-black">It&rsquo;s not open yet:</span>{" "}
            the trail is an active work zone inside a flood-control easement.
            Stay out of the wash and fenced areas until the county opens it.
          </li>
          <li>
            <span className="text-lvinit-black">Questions:</span> Clark County
            Public Works takes general questions at (702) 455-6000, at
            InTheWorks@clarkcountynv.gov, or through the FixIt Clark County app.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="What I haven't confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Length.</span> The county
            hasn&rsquo;t published how long the trail is.
          </li>
          <li>
            <span className="text-lvinit-black">Funding.</span> The notice
            gives the contract amount but not where the money comes from.
          </li>
          <li>
            <span className="text-lvinit-black">Opening date.</span> February
            2027 is the county&rsquo;s estimate, not a scheduled opening.
          </li>
          <li>
            <span className="text-lvinit-black">Photos.</span> LVINIT
            doesn&rsquo;t have its own photos of the wash corridor yet, so this
            page runs without one rather than borrowing an image of somewhere
            else.
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Clark County Department of
            Public Works</span>, Notice of Road Construction: Blue Diamond Wash
            Trail from Durango Drive to Hualapai Way (includes project map).{" "}
            <a href={COUNTY_NOTICE} className={extCls} target="_blank" rel="noopener noreferrer">
              County notice (PDF)
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KSNV News 3 Las Vegas</span>,
            Clark County breaks ground on Blue Diamond Wash Trail project in
            southwest valley, Nov. 10, 2026.{" "}
            <a href={KSNV} className={extCls} target="_blank" rel="noopener noreferrer">
              news3lv.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
