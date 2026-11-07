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
// GROWTH & DEVELOPMENT / NEIGHBORHOODS — Summerlin Parkway Trail.
// Built by the LVINIT Daily Publisher (2026-11-07) from Local Radar assignment
// LR-SUMMERLIN-PARKWAY-TRAIL (run 15, READY - first-party media recommended).
//
// FACT DISCIPLINE (read 2026-11-07):
// - City of Las Vegas release (govdelivery, Aug 15 2025): construction begins
//   Aug 18 2025; $26M; ~18 months; Rampart Blvd west to CC-215; lighting;
//   pedestrian bridge over the wash west of Rampart; underpass at Crestdale Ln;
//   Las Vegas Paving; federal funds plus RTC tax funds; 702.808.5801.
// - City Public Works Ongoing Projects page: 3.5-mile, 12-ft-wide asphalt trail
//   between the Summerlin Interchange and Rampart; lighting, fencing, trash
//   receptacles; three at-grade crossings (Anasazi, Town Center, Rampart);
//   Mon-Fri 7am-6pm; expected completion Spring 2027; status Underway.
// - Local Radar also verified (fact sheet / Dec 2025 update / KLAS Jan 2026 /
//   Fox5 Feb 2026): 12-ft asphalt, Crestdale closure from Jan 2026 for about
//   three months, County interchange project with three pedestrian bridges.
// OMITTED ON PURPOSE: current construction progress, whether the Crestdale
//   tunnel is finished, any opening date, which segments are open. None found.
// IMAGERY: no first-party photo of the trail exists. Hero and inline photos are
//   Mikey's Summerlin drone/stills, captioned as context, not the trail.
// ---------------------------------------------------------------------------

const PATH = "/guides/summerlin-parkway-trail-summerlin-las-vegas";
const HERO_IMG = "/images/editorial/summerlin-community-road-flags-desert-cliffs.jpg";
const HERO_ALT =
  "Curving Summerlin road with blue banner flags and a neighborhood directional sign beneath tall desert cliffs.";
const CONTEXT_IMG = "/images/editorial/summerlin-west-grand-park-aerial-mountains.jpg";
const CONTEXT_ALT =
  "Aerial view of Grand Park in Summerlin West with a green lawn, walking paths, shaded playgrounds and desert mountains behind.";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const TITLE =
  "The Summerlin Parkway Trail: What the City Is Building From the 215 to Rampart";

const meta: StoryMeta = {
  title: `${TITLE} | LVINIT`,
  headline: TITLE,
  description:
    "The City of Las Vegas is building a $26 million, 3.5-mile shared-use trail along Summerlin Parkway, with a wash bridge and a Crestdale Lane underpass. What it connects, the city's Spring 2027 target, and what isn't confirmed.",
  path: PATH,
  image: HERO_IMG,
  imageWidth: 1920,
  imageHeight: 1080,
  imageAlt: HERO_ALT,
  datePublished: "2026-11-07",
  dateModified: "2026-11-07",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Summerlin Parkway Trail", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function SummerlinParkwayTrailPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Growth & Development",
        headline: TITLE,
        subheadline:
          "A $26 million, 3.5-mile trail is going in along Summerlin Parkway. The city lists Spring 2027 for completion.",
        image: HERO_IMG,
        imageAlt: HERO_ALT,
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on trails, parks and amenities across the valley.",
        stories: [
          {
            name: "The I-215 Northern Beltway Trail",
            href: "/guides/i-215-northern-beltway-trail-north-las-vegas",
            category: "Local Feature",
            dek: "What North Las Vegas is building along the 215 and when.",
          },
          {
            name: "Municipal Gym at Downtown Summerlin",
            href: "/guides/municipal-gym-downtown-summerlin",
            category: "Local Feature",
            dek: "A new gym coming to Downtown Summerlin.",
          },
          {
            name: "Summerlin vs. Henderson",
            href: "/guides/summerlin-vs-henderson",
            category: "Comparison",
            dek: "How the two big master-planned areas compare.",
          },
        ],
      }}
      ctas={{
        heading: "Thinking about Summerlin?",
        body:
          "Tell me how you like to spend your mornings and I'll give you an honest read on which part of the valley fits.",
      }}
    >
      <StoryLede
        kicker="Growth & Development"
        lead="The City of Las Vegas started building a shared-use trail along Summerlin Parkway in August 2025. When it's done, it will link the CC-215 Beltway Trail with the Bonanza Trail, with a bridge over the wash and a tunnel under Crestdale Lane along the way."
      />

      <StorySection heading="The short version">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">What:</span> a 3.5-mile,
            12-foot-wide asphalt shared-use trail along Summerlin Parkway
            between the Summerlin interchange at the 215 and Rampart Boulevard,
            per the City&rsquo;s Public Works page.
          </li>
          <li>
            <span className="text-lvinit-black">Cost:</span> $26 million, with
            federal funds plus Regional Transportation Commission tax funds,
            according to the City.
          </li>
          <li>
            <span className="text-lvinit-black">Timeline:</span> construction
            began Aug. 18, 2025. The City&rsquo;s release said about 18 months.
            Its current project page lists completion as Spring 2027 and the
            status as underway.
          </li>
          <li>
            <span className="text-lvinit-black">Built into it:</span> lighting,
            fencing, trash receptacles, a pedestrian bridge over the wash west
            of Rampart, an underpass at Crestdale Lane, and at-grade crossings
            at Anasazi Drive, Town Center Drive and Rampart Boulevard.
          </li>
          <li>
            <span className="text-lvinit-black">Contractor:</span> Las Vegas
            Paving.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="Where it goes">
        <p className="text-body-lg text-lvinit-warmgray">
          The trail runs parallel to Summerlin Parkway. According to the City,
          it sits on the north side of the parkway from the interchange to
          Anasazi Drive, then on the south side from Anasazi to Rampart. The
          City says it connects the Beltway Trail on the west end to the
          Bonanza Trail on the east, which fills in a gap for anyone who walks,
          runs or rides between those routes.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The two grade-separated pieces are the interesting part. A pedestrian
          bridge crosses the wash west of Rampart, and a tunnel takes the trail
          under Crestdale Lane so people don&rsquo;t have to cross that street
          at grade. The three at-grade crossings at Anasazi, Town Center and
          Rampart are the places you&rsquo;ll still be sharing the road
          intersection with cars.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Separately, Clark County is rebuilding the Summerlin Parkway and
          CC-215 interchange. Fox5 reported in February 2026 that the project
          was about one-third complete with a March 2028 finish, and that three
          new pedestrian bridges there will tie into the City&rsquo;s trail
          system. Those are County projects with their own schedule.
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
              "Contextual LVINIT drone photo of Grand Park in Summerlin West. This is not the trail or its corridor.",
          },
        ]}
      />

      <StorySection heading="What it means if you live in or near Summerlin">
        <p className="text-body-lg text-lvinit-warmgray">
          Summerlin already has a lot of trail and park space, but getting
          along the parkway corridor on foot or bike has meant working around
          traffic. A continuous, lit, off-street path changes that for nearby
          neighborhoods. If you&rsquo;re looking at Summerlin, it&rsquo;s a
          quality-of-life detail worth knowing about, the same way you&rsquo;d
          note a park or a grocery store nearby. I&rsquo;m not making a claim
          about home values, because nothing I read supports one.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The construction itself has had real impact. The City said work would
          mostly not affect roadway traffic, apart from Crestdale Lane, and
          KLAS reported that Crestdale was closed starting Jan. 5, 2026 between
          Trailwood and Covington Cross so crews could build the tunnel. The
          City said that closure would run about three months. The City&rsquo;s
          project page says full road closures are expected during tunnel
          construction. I haven&rsquo;t found a notice saying when Crestdale
          reopened, so check current conditions before you route around it.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          For the broader neighborhood picture, start with the{" "}
          <Link href="/neighborhoods/summerlin" className={linkCls}>
            Summerlin neighborhood guide
          </Link>
          . Trail projects are also happening elsewhere in the valley, like
          the{" "}
          <Link
            href="/guides/i-215-northern-beltway-trail-north-las-vegas"
            className={linkCls}
          >
            I-215 Northern Beltway Trail in North Las Vegas
          </Link>
          , and Downtown Summerlin keeps adding things to do, like the coming{" "}
          <Link
            href="/guides/municipal-gym-downtown-summerlin"
            className={linkCls}
          >
            Municipal Gym
          </Link>
          .
        </p>
      </StorySection>

      <StorySection muted heading="What I haven't confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Where construction stands now.</span>{" "}
            I couldn&rsquo;t find a November 2026 progress update, so I
            can&rsquo;t tell you which segments are paved, lit or open.
          </li>
          <li>
            <span className="text-lvinit-black">The Crestdale tunnel.</span>{" "}
            No official notice that it is finished or that the road has
            reopened.
          </li>
          <li>
            <span className="text-lvinit-black">An opening date.</span> The
            City lists Spring 2027 for completion. That is a target, not an
            opening date, and the City&rsquo;s page notes its status may have
            changed.
          </li>
          <li>
            <span className="text-lvinit-black">Early access.</span> I
            haven&rsquo;t seen anything saying any segment is open to the
            public before the whole trail is done.
          </li>
          <li>
            <span className="text-lvinit-black">First-hand look.</span> I
            haven&rsquo;t filmed or walked the corridor for LVINIT yet, so
            this piece rests on City sources and news reporting.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Questions about construction can go to the City&rsquo;s project
          line at 702.808.5801. New to the valley? Start with{" "}
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
            construction announcement, Aug. 15, 2025.{" "}
            <a
              href="https://content.govdelivery.com/accounts/NVLASVEGAS/bulletins/3edeccb"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              govdelivery.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">City of Las Vegas</span>, Public
            Works Ongoing Projects.{" "}
            <a
              href="https://www.lasvegasnevada.gov/Government/Departments/Public-Works/Ongoing-Projects"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              lasvegasnevada.gov
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KLAS / 8 News Now</span>,
            Crestdale Lane closure, Jan. 2026.{" "}
            <a
              href="https://www.yahoo.com/news/articles/driving-crazy-3-month-closures-192826572.html"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              yahoo.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>, Summerlin
            Parkway-215 interchange milestone, Feb. 2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/02/10/summerlin-parkway-215-project-celebrates-1-year-milestone/"
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
