import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// NEW & NOTEWORTHY — Nevada State Veterans Memorial, new permanent home at the
// northwest end of Thunderbird Family Sports Complex, 6105 N. Durango Dr.
// Built by the LVINIT Daily Publisher (2026-11-12) from Local Radar assignment
// LR-NV-STATE-VETERANS-MEMORIAL-THUNDERBIRD (READY - FIRST-PARTY MEDIA
// RECOMMENDED).
//
// FACT DISCIPLINE (sources read 2026-11-12):
// - PRIMARY: City of Las Vegas release, Nov 4, 2026 (govdelivery 4316aae):
//   opening ceremony Wed Nov 11, 2026, 4:30 p.m.; northwest end of Thunderbird
//   Family Sports Complex, 6105 N. Durango Drive; 18 larger-than-life bronze
//   statues by Douwe Blumberg, each about 7.5 ft; moved from outside the
//   former Grant Sawyer state building; commissioned by the state in 2011 to
//   honor American military service from the Revolutionary War to the
//   present; open-air promenade with landscaping, amphitheater, informational
//   signage; honors Nevada's 200,000-plus veterans; partnership of the State
//   of Nevada, City of Las Vegas and the Mayor's Fund for Las Vegas LIFE;
//   contractor Rafael Construction.
// - PRIMARY: City of Las Vegas release, Jan 12, 2026 (govdelivery 4031eeb):
//   groundbreaking 11 a.m. Wed Jan 14, 2026; statues relocated from outside
//   the shuttered Grant Sawyer state building; city manages the project;
//   budget $7.69 million.
// - Fox5, Nov 4, 2026: Las Vegas City Council voted to accept $3M from the
//   state toward construction.
// - Fox5, Nov 11, 2026 (post-event): memorial opened Wednesday; mayor, local
//   officials and the sheriff spoke; Allen-Palenske estimated 600-700
//   attendees vs 350 RSVPs; city planning an audio component for each
//   sculpture; working with CCSD and UNLV on curriculum/field trips; city
//   still raising money via the Mayor's Fund; Allen-Palenske: "the largest
//   veterans memorial in size and scope west of the Mississippi" (her claim,
//   attributed, not asserted).
// OMITTED ON PURPOSE: regular hours (none published), parking-lot specifics,
//   donor split of the budget, Boulder City relocation debate details, the
//   redevelopment use of the former Grant Sawyer site (sources conflict),
//   2015 dedication history (opinion-section source only), any first-person
//   visit claim (no first-party media exists).
// IMAGERY: no first-party photo of the new site exists yet and no Media Image
//   Library asset shows the memorial or Thunderbird park, so the page runs
//   without a hero photo (card uses a generated editorial cover). No Media
//   Image Library usage records change.
// ---------------------------------------------------------------------------

const PATH = "/guides/nevada-state-veterans-memorial-thunderbird-northwest-las-vegas";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";
const RELEASE_NOV = "https://content.govdelivery.com/accounts/NVLASVEGAS/bulletins/4316aae";
const RELEASE_JAN = "https://content.govdelivery.com/accounts/NVLASVEGAS/bulletins/4031eeb";

const TITLE =
  "The Nevada State Veterans Memorial Has a New Home in Northwest Las Vegas";

const meta: StoryMeta = {
  title: "Nevada State Veterans Memorial at Thunderbird: What's There & Where | LVINIT",
  headline: TITLE,
  description:
    "The 18 bronze statues that stood outside the old Grant Sawyer state building now stand at Thunderbird Family Sports Complex on North Durango Drive. What's there, where to find it and why it moved.",
  path: PATH,
  datePublished: "2026-11-12",
  dateModified: "2026-11-12",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Nevada State Veterans Memorial", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function NevadaStateVeteransMemorialPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "New & Noteworthy",
        headline: TITLE,
        subheadline:
          "Eighteen bronze statues, an amphitheater and a promenade, now in a city park on North Durango Drive. It opened on Veterans Day.",
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on what's new in the northwest valley and for local veterans.",
        stories: [
          {
            name: "Hualapai and Grand Teton substation park",
            href: "/guides/hualapai-grand-teton-police-substation-park-northwest-las-vegas",
            category: "Local Feature",
            dek: "A police substation and 2-acre city park going up in the northwest.",
          },
          {
            name: "Monument Hills",
            href: "/guides/monument-hills-northwest-las-vegas",
            category: "Local Feature",
            dek: "What a planned 6,000-home community means for the northwest valley.",
          },
          {
            name: "Patriot Housing LV",
            href: "/guides/patriot-housing-lv-sunrise-manor-veteran-housing",
            category: "Local Feature",
            dek: "Housing for veterans on the east side.",
          },
        ],
      }}
      ctas={{
        heading: "Getting to know the northwest valley?",
        body:
          "Tell me what you want close to home and I'll give you an honest read on Centennial Hills and the rest of the northwest.",
      }}
    >
      <StoryLede
        kicker="New & Noteworthy"
        lead="For years, the Nevada State Veterans Memorial stood outside a state office building near downtown that most people only visited to deal with paperwork. Now it has a real home. The 18 bronze statues were moved to the northwest end of Thunderbird Family Sports Complex on North Durango Drive, set along a new promenade with an amphitheater, and the City of Las Vegas opened the site on Veterans Day, Nov. 11. Here's what's there, where to find it and how it got here."
      />

      <StorySection heading="The short version">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Where:</span> the northwest
            end of Thunderbird Family Sports Complex, 6105 N. Durango Drive, in
            the Centennial Hills area of northwest Las Vegas.
          </li>
          <li>
            <span className="text-lvinit-black">What:</span> 18
            larger-than-life bronze statues by sculptor Douwe Blumberg, each
            about 7.5 feet tall, honoring American military service from the
            Revolutionary War to the present.
          </li>
          <li>
            <span className="text-lvinit-black">The new setting:</span> an
            open-air promenade with landscaping, an amphitheater and
            informational signs.
          </li>
          <li>
            <span className="text-lvinit-black">When:</span> the city
            broke ground on Jan. 14, 2026 and held the opening ceremony on
            Veterans Day, Nov. 11, 2026.
          </li>
          <li>
            <span className="text-lvinit-black">Cost:</span> the city put the
            project budget at $7.69 million when construction started. The
            City Council accepted $3 million from the state toward it on Nov. 4.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="What's at the memorial">
        <p className="text-body-lg text-lvinit-warmgray">
          The heart of it is the same set of statues many locals walked past
          downtown: 18 bronze figures by Douwe Blumberg, each about seven and a
          half feet tall. The state commissioned them in 2011, and together they
          trace American military service from the Revolutionary War to today.
          The city describes the memorial as a tribute to Nevada&rsquo;s more
          than 200,000 veterans.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          What&rsquo;s new is the space around them. The statues now line an
          open-air promenade with landscaping, and the site includes an
          amphitheater and informational signage. The city called it &ldquo;a
          dedicated place of healing, inspiration and education&rdquo; when it
          announced construction. In other words, it&rsquo;s built to be
          visited and used for gatherings, not just passed on the way into a
          building.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          More is planned. Fox5 reported after the opening that the city is
          working on an audio component so visitors can hear the history
          behind each sculpture, and is working with CCSD and UNLV on
          curriculum and field trips. Neither has a public launch date yet.
        </p>
      </StorySection>

      <StorySection heading="Why it moved">
        <p className="text-body-lg text-lvinit-warmgray">
          The statues used to stand outside the Grant Sawyer State Office
          Building near downtown. The state moved its offices out, and the
          city&rsquo;s January release described the building as shuttered;
          it has since been demolished. That left the memorial without a
          permanent home.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The new site came together as a partnership between the State of
          Nevada, the City of Las Vegas and the Mayor&rsquo;s Fund for Las
          Vegas LIFE, a nonprofit that supports city projects. The city
          managed construction, with Rafael Construction as the contractor.
          Fox5 reported that the state covered almost half the cost, donors
          covered the rest, and the city is still raising money through the
          Mayor&rsquo;s Fund.
        </p>
      </StorySection>

      <StorySection muted heading="The opening on Veterans Day">
        <p className="text-body-lg text-lvinit-warmgray">
          The city scheduled the ceremony for 4:30 p.m. on Veterans Day, with
          Mayor Shelley Berkley, Ward 4 Councilwoman Francis Allen-Palenske,
          state officials and local veterans, plus the Joint Armed Forces
          Color Guard and a Nellis Air Force Base flyover on the program.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          According to Fox5, it drew a bigger crowd than planned. The city had
          rented 350 chairs for 350 RSVPs, and Allen-Palenske estimated 600 to
          700 people showed up. She called it &ldquo;the largest veterans
          memorial in size and scope west of the Mississippi.&rdquo; That&rsquo;s
          her description; I haven&rsquo;t seen a source that measures it
          against other memorials.
        </p>
      </StorySection>

      <StorySection heading="Why it matters if you live here">
        <p className="text-body-lg text-lvinit-warmgray">
          The memorial now sits inside a park a lot of northwest families
          already use for sports. That makes it easy to fold a visit
          into a normal day instead of making a special trip downtown, and it
          gives local schools, scout troops and veterans&rsquo; groups a place
          with seating and room to gather.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It&rsquo;s also another sign of how much public investment is
          heading to the northwest valley. Elsewhere in the area, the city is
          building a{" "}
          <Link
            href="/guides/hualapai-grand-teton-police-substation-park-northwest-las-vegas"
            className={linkCls}
          >
            police substation and 2-acre park at Hualapai and Grand Teton
          </Link>
          , and further out, the planned{" "}
          <Link href="/guides/monument-hills-northwest-las-vegas" className={linkCls}>
            Monument Hills community
          </Link>{" "}
          will add thousands of homes. If you&rsquo;re weighing where to live
          in the valley, start with{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection muted heading="Before you go">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Address:</span> Thunderbird
            Family Sports Complex, 6105 N. Durango Drive. The memorial is at the
            northwest end of the complex.
          </li>
          <li>
            <span className="text-lvinit-black">Hours:</span> the city
            hasn&rsquo;t published separate hours for the memorial. I&rsquo;d
            check with the City of Las Vegas before planning an early-morning
            or after-dark visit.
          </li>
          <li>
            <span className="text-lvinit-black">Cost:</span> it&rsquo;s in a
            public city park. The opening ceremony was free and open to the
            public.
          </li>
          <li>
            <span className="text-lvinit-black">Sports days:</span> the
            complex hosts youth and adult games, so weekend parking can fill up.
            Be mindful of teams and families on the fields if you&rsquo;re
            taking photos.
          </li>
        </ul>
      </StorySection>

      <StorySection heading="What I haven't confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Hours and parking.</span> No
            official hours or closest-lot details are published yet.
          </li>
          <li>
            <span className="text-lvinit-black">Final cost.</span> The $7.69
            million figure is the budget the city announced at groundbreaking,
            not a final accounting.
          </li>
          <li>
            <span className="text-lvinit-black">Photos.</span> LVINIT
            doesn&rsquo;t have its own photos of the new site yet, so this page
            runs without one rather than borrowing an image of somewhere else.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">City of Las Vegas</span>, New
            Nevada State Veterans Memorial to open with Veterans Day ceremony,
            Nov. 4, 2026.{" "}
            <a href={RELEASE_NOV} className={extCls} target="_blank" rel="noopener noreferrer">
              City release
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">City of Las Vegas</span>,
            Construction set to begin on new Nevada State Veterans Memorial,
            Jan. 12, 2026.{" "}
            <a href={RELEASE_JAN} className={extCls} target="_blank" rel="noopener noreferrer">
              City release
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>, Nevada
            State Veterans Memorial one step closer to opening after $3M state
            funding approval, Nov. 4, 2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/11/05/nevada-state-veterans-memorial-one-step-closer-opening-after-3m-state-funding-approval/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>, Nevada
            State Veterans Memorial opens in northwest Las Vegas Valley, Nov.
            11, 2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/11/12/nevada-state-veterans-memorial-opens-northwest-las-vegas-valley/"
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
