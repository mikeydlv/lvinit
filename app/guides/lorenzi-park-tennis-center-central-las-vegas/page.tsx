import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// NEW & NOTEWORTHY — Lorenzi Park tennis center expansion, central Las Vegas.
// Built by the LVINIT Daily Publisher from Local Radar assignment
// LR-LORENZI-PARK-TENNIS-CENTER.
//
// FACT DISCIPLINE — read this run (2026-11-18):
// - City of Las Vegas release "New Tennis Amenities Coming To Lorenzi Park"
//   (Mon Nov. 16, 2026; govdelivery bulletin 4310405, read): three new tennis
//   courts; refinish the 10 existing courts; new clubhouse with check-in area,
//   multipurpose room, restrooms and storage; $4.9M; renamed the Marty
//   Hennessey Tennis Center at Lorenzi Park; groundbreaking Thu Nov. 19, 9 a.m.,
//   Lorenzi Park, 3333 W. Washington Ave., with Ward 5 Councilwoman Shondra
//   Summers-Armstrong; Starke Contractors builds; TSK Architects design;
//   Public Works manages; funded through the Southern Nevada Public Land
//   Management Act (federal land sale proceeds in the valley go back to
//   communities and public lands).
// - FOX5, Nov. 16, 2026 (read): matches the release.
// TIMING — Published Wed Nov. 18, the day BEFORE the groundbreaking. The
// ceremony is described as scheduled, never as held.
// DELIBERATELY OMITTED (unresolved / mustNotClaim): completion date; who Marty
// Hennessey is (no source); whether courts stay open during construction;
// pickleball; any figures not in the release.
// IMAGERY — No LVINIT photography of Lorenzi Park exists in the image library
// and no first-party media was added before this run. Photoless StoryHero and
// no card image, per the standard fallback. No generic tennis stock.
// ---------------------------------------------------------------------------

const PATH = "/guides/lorenzi-park-tennis-center-central-las-vegas";
const TITLE =
  "Lorenzi Park Is Getting a $4.9M Tennis Center. Here's What's Being Built";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const meta: StoryMeta = {
  title: "Lorenzi Park Tennis Center Expansion, Central Las Vegas | LVINIT",
  headline: TITLE,
  description:
    "The City of Las Vegas breaks ground Nov. 19 on a $4.9M Lorenzi Park tennis project: three new courts, 10 refinished courts, a new clubhouse and a new name, the Marty Hennessey Tennis Center.",
  path: PATH,
  datePublished: "2026-11-18",
  dateModified: "2026-11-18",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Lorenzi Park Tennis Center", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function LorenziParkTennisCenterPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "New & Noteworthy",
        headline: TITLE,
        subheadline:
          "Three new courts, a refresh of the 10 that are already there, a clubhouse and a new name. The city breaks ground Thursday, Nov. 19.",
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More public places the city is building or rebuilding.",
        stories: [
          {
            name: "Third Street Arts Campus",
            href: "/guides/third-street-arts-campus-downtown-las-vegas",
            category: "Local Feature",
            dek: "Another city project reshaping the urban core.",
          },
          {
            name: "Municipal Gym in Downtown Summerlin",
            href: "/guides/municipal-gym-downtown-summerlin",
            category: "Local Feature",
            dek: "A new public gym on the west side of the valley.",
          },
          {
            name: "Unrivaled Sports Park at Freedom Park",
            href: "/guides/unrivaled-sports-park-freedom-park-east-las-vegas",
            category: "Local Feature",
            dek: "A big recreation project in east Las Vegas.",
          },
        ],
      }}
      ctas={{
        heading: "Trying to figure out which part of town fits you?",
        body:
          "Parks, courts and what's close to home matter more than people expect. Tell me how you like to live and I'll give you an honest read on where to look.",
      }}
    >
      <StoryLede
        kicker="New & Noteworthy"
        lead="The public tennis courts at Lorenzi Park in central Las Vegas are about to get a real upgrade. The City of Las Vegas is breaking ground Thursday, November 19, on a $4.9 million project that adds three new courts, refinishes the 10 existing ones and builds a new clubhouse. When it's done, the complex will have a new name: the Marty Hennessey Tennis Center at Lorenzi Park."
      />

      <StorySection heading="What's being built">
        <p className="text-body-lg text-lvinit-warmgray">
          Here&rsquo;s the scope, straight from the city&rsquo;s announcement:
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Three new tennis courts,</span>{" "}
            added to the existing complex.
          </li>
          <li>
            <span className="text-lvinit-black">The 10 existing courts</span>{" "}
            get refinished.
          </li>
          <li>
            <span className="text-lvinit-black">A new clubhouse</span> with a
            check-in area, a multipurpose room, restrooms and storage.
          </li>
          <li>
            <span className="text-lvinit-black">A new name:</span> the Marty
            Hennessey Tennis Center at Lorenzi Park.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Add it up and the complex goes from 10 courts to 13. The clubhouse
          may be the bigger day-to-day change, though. Restrooms, a place to
          check in and a room that can host meetings or clinics are the kind of
          basics that make a court complex feel like a real tennis center
          instead of just a row of fenced courts.
        </p>
      </StorySection>

      <StorySection muted heading="The groundbreaking">
        <p className="text-body-lg text-lvinit-warmgray">
          The ceremony is scheduled for Thursday, November 19, at 9 a.m. at
          Lorenzi Park, 3333 W. Washington Ave. Ward 5 Councilwoman Shondra
          Summers-Armstrong and the community are holding it, according to the
          city.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The project team, per the city: Starke Contractors is building it,
          TSK Architects designed it, and the city&rsquo;s Public Works
          Department is managing it.
        </p>
      </StorySection>

      <StorySection heading="Who's paying for it">
        <p className="text-body-lg text-lvinit-warmgray">
          The $4.9 million comes from the Southern Nevada Public Land
          Management Act, not the city&rsquo;s general budget. Under that
          federal law, money from selling federal land in the Las Vegas Valley
          has to go back into the community and public lands. Put simply, as
          the valley grows onto former federal land, some of that money comes
          back to places like this one: parks, trails and public facilities
          people actually use.
        </p>
      </StorySection>

      <StorySection muted heading="Why it matters for central Las Vegas">
        <p className="text-body-lg text-lvinit-warmgray">
          A lot of the new public amenities in the valley land out on the
          edges, in master-planned communities and newer suburbs. Lorenzi Park
          is different. It sits in an older, established part of central Las
          Vegas, west of downtown, off Washington Avenue. Putting real money
          into public courts here means people who live in the middle of the
          city get an upgraded place to play without driving out to Summerlin
          or Henderson.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It fits a pattern we&rsquo;ve been following. The city is also
          building the{" "}
          <Link href="/guides/third-street-arts-campus-downtown-las-vegas" className={linkCls}>
            Third Street arts campus downtown
          </Link>
          , and across the valley public recreation keeps growing, from the{" "}
          <Link
            href="/guides/unrivaled-sports-park-freedom-park-east-las-vegas"
            className={linkCls}
          >
            Unrivaled Sports Park at Freedom Park
          </Link>{" "}
          in east Las Vegas to the{" "}
          <Link href="/guides/municipal-gym-downtown-summerlin" className={linkCls}>
            municipal gym in Downtown Summerlin
          </Link>{" "}
          and the{" "}
          <Link
            href="/guides/echo-trail-park-community-center-southwest-las-vegas"
            className={linkCls}
          >
            Echo Trail park and community center
          </Link>{" "}
          in the southwest. If you&rsquo;re new here and trying to get a feel
          for the different parts of town, start with{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection heading="What I haven't confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">When it opens.</span> The city
            hasn&rsquo;t published a completion date, so I&rsquo;m not going to
            guess one.
          </li>
          <li>
            <span className="text-lvinit-black">Court access during construction.</span>{" "}
            The announcement doesn&rsquo;t say whether the existing courts stay
            open while the work happens. If you play there regularly, check
            with the city before you head over.
          </li>
          <li>
            <span className="text-lvinit-black">Who Marty Hennessey is.</span>{" "}
            The city&rsquo;s release doesn&rsquo;t explain the name, and I
            haven&rsquo;t found a source I trust that does, so I&rsquo;m
            leaving it there for now.
          </li>
          <li>
            <span className="text-lvinit-black">Pickleball.</span> It
            isn&rsquo;t mentioned anywhere in the announcement. This is a tennis
            project as described.
          </li>
          <li>
            <span className="text-lvinit-black">Photos.</span> There are no
            LVINIT photos of Lorenzi Park yet, so this page has no imagery
            rather than a stand-in. The city&rsquo;s release links to a
            rendering of the new clubhouse.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">City of Las Vegas</span>,
            &ldquo;New Tennis Amenities Coming To Lorenzi Park,&rdquo; November
            16, 2026.{" "}
            <a
              href="https://content.govdelivery.com/accounts/NVLASVEGAS/bulletins/4310405"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              City news release
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">FOX5 Las Vegas</span>, November
            16, 2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/11/17/las-vegas-break-ground-49-million-lorenzi-park-tennis-project/"
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
