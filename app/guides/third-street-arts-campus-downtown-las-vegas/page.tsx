import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// GROWTH & DEVELOPMENT — THIRD Street arts campus in the former downtown movie
// theater at 814 S. Third St, Las Vegas Arts District.
// Built by the LVINIT Daily Publisher (2026-11-11) from Local Radar assignment
// LR-THIRD-STREET-ARTS-HUB (READY).
//
// FACT DISCIPLINE (sources re-read 2026-11-11):
// - City of Las Vegas RDA agenda summary, meeting of Nov 4, 2026 (PDF read):
//   Agency Reimbursement Agreement with Third Street, Inc., adaptive reuse
//   improvements at 814 South Third Street (APN 139-34-401-014); $4,200,000
//   from the RDA Special Revenue Fund; Redevelopment Area 1, Ward 3; purpose:
//   arts performances, arts education, theatre workforce development and
//   arts-focused community events in the Arts District; recommendation
//   Approval.
// - Resolution backup / draft agreement (scanned PDF, pages read):
//   Attachment C: Phase 1A = large flexible studio theatre combining former
//   Cinemas 1 and 2, approx. 250 seats (final specs subject to design, code,
//   permitting, pricing); Level 1 lobby; public stair Levels 2-3; concession;
//   north back-of-house (restrooms, showers, dressing, wardrobe, loading);
//   back-of-house connections. Attachment E: Phase 1A ROM total $7,470,126
//   (OCMI rough order of magnitude 3.5.26). Attachment G: construction start
//   target within 9 months of the Effective Date (outside 12); substantial
//   completion target 8 months after start (outside 12); closeout 60/90 days.
//   Attachment H: fundraising objectives $500K (90 days), ~$1.65M (6 months),
//   ~$3.3M non-RDA (9 months). Disclosure: THIRD Street Inc., Nevada
//   nonprofit, 814 S. 3rd St.
// - Fox5, Nov 5, 2026: approval of conditional reimbursement agreement up to
//   $4.2M; financing must be secured before the city distributes funds;
//   opening scheduled summer 2028.
// - Fox5, Nov 6, 2026: vacant former Eclipse Theatres; RDA approved the
//   agreement; founder Daz Weller; lease signed end of last year; education
//   partnerships with high schools, CSN, UNLV; groundbreaking in about eight
//   months; doors projected summer 2028; $7.4M price tag, city $4.2M.
// - KNPR, Feb 23, 2026: former Downtown Cinemas complex; three venues planned
//   at 250, 150 and 600 seats; four resident companies.
// OMITTED ON PURPOSE: building square footage (41,500 vs 52,000 conflict),
//   600-seat figure as Phase 1A (it belongs to the long-range plan),
//   closure date of the cinema, agreement effective date, final vote record,
//   any "construction has started" claim.
// IMAGERY: hero/card = AI illustration supplied and explicitly approved by
//   Mikey for this article (Local Radar imageDirective, 2026-11-11). Labeled
//   as an illustration in alt text, on-image caption and body copy; not an
//   official rendering. Not a Media Image Library file, so no usage records.
// ---------------------------------------------------------------------------

const PATH = "/guides/third-street-arts-campus-downtown-las-vegas";
const HERO_IMG =
  "/images/hero/third-street-las-vegas-arts-center-exterior-ai-illustration-lvinit.png";
const HERO_ALT =
  "Illustration (AI-generated, not an official rendering) of a modern arts center with THIRD Street signage, a glass entry and a second-floor terrace at sunset.";
const HERO_CREDIT =
  "AI illustration · not an official rendering";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";
const AGENDA =
  "https://files.lasvegasnevada.gov/eud/RDA%20Meeting%20Notices/2026/Nov-4-2026/Agenda-Summary-Page.pdf";
const RESOLUTION =
  "https://files.lasvegasnevada.gov/eud/RDA%20Meeting%20Notices/2026/Nov-4-2026/Resolution-No-RA-XX-2026.pdf";

const TITLE =
  "The Old Downtown Movie Theater on Third Street Is Becoming an Arts Campus";

const meta: StoryMeta = {
  title: "THIRD Street Arts Campus: What's Going Into the Old Downtown Theater | LVINIT",
  headline: TITLE,
  description:
    "Nonprofit THIRD Street is turning the former movie theater at 814 S. Third St into a performing arts and training venue. What the city's $4.2M covers, the 250-seat first phase, and when it could open.",
  path: PATH,
  image: HERO_IMG,
  imageWidth: 1672,
  imageHeight: 941,
  imageAlt: HERO_ALT,
  datePublished: "2026-11-11",
  dateModified: "2026-11-11",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "THIRD Street arts campus", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function ThirdStreetArtsCampusPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Growth & Development",
        headline: TITLE,
        subheadline:
          "A nonprofit plans a roughly 250-seat studio theatre first, with the city reimbursing up to $4.2 million. Construction hasn't started.",
        image: HERO_IMG,
        imageAlt: HERO_ALT,
        imageCredit: HERO_CREDIT,
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedNeighborhood={{
        name: "the Arts District",
        href: "/neighborhoods/downtown-arts-district",
        kicker: "Related neighborhood",
        heading: "Read the Downtown Arts District guide",
        linkLabel: "Explore the Arts District",
        blurb:
          "What the 18b Arts District is like day to day: Main Street, First Friday, parking and who it suits.",
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on what's changing in and around downtown.",
        stories: [
          {
            name: "The Foundry at Cashman",
            href: "/guides/the-foundry-lennar-cashman-downtown-las-vegas",
            category: "Local Feature",
            dek: "New homes going up on city land near Cashman Center.",
          },
          {
            name: "RTC Red Line on Maryland Parkway",
            href: "/guides/maryland-parkway-red-line-rtc-las-vegas",
            category: "Local Feature",
            dek: "The bus rapid transit line linking downtown to UNLV and the airport.",
          },
          {
            name: "Desert Pines redevelopment",
            href: "/guides/desert-pines-golf-course-redevelopment-east-las-vegas",
            category: "Local Feature",
            dek: "Another city-backed project turning an old use into something new.",
          },
        ],
      }}
      ctas={{
        heading: "Thinking about living near downtown?",
        body:
          "Tell me what you want walking distance from home and I'll give you an honest read on whether the Arts District and the neighborhoods around it fit.",
      }}
    >
      <StoryLede
        kicker="Growth & Development"
        lead="The empty movie theater on Third Street in the Arts District has a plan. A downtown nonprofit called THIRD Street holds the lease and wants to turn it into a home for live theater, opera, music and comedy, plus training for people who want to work behind the scenes. On Nov. 4 the City of Las Vegas Redevelopment Agency took up a deal to cover up to $4.2 million of the first phase. Here's what that money buys, what it doesn't, and when you might actually see a show there."
      />

      <StorySection heading="The short version">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Where:</span> 814 S. Third
            St., the former downtown cinema building in the Arts District.
            Fox5 calls it the former Eclipse Theatres; KNPR calls it the
            former Downtown Cinemas complex.
          </li>
          <li>
            <span className="text-lvinit-black">Who:</span> THIRD Street Inc.,
            a Nevada nonprofit. Founder and CEO Daz Weller told Fox5 the group
            signed a lease on the building at the end of 2025.
          </li>
          <li>
            <span className="text-lvinit-black">What&rsquo;s first:</span> a
            flexible studio theatre of about 250 seats, built by combining two
            of the old auditoriums, plus a new lobby, a public stair, a
            concession stand and backstage space.
          </li>
          <li>
            <span className="text-lvinit-black">The money:</span> the first
            phase is estimated at about $7.5 million. The city&rsquo;s
            Redevelopment Agency would reimburse up to $4.2 million of it.
            THIRD Street has to raise the rest.
          </li>
          <li>
            <span className="text-lvinit-black">When:</span> THIRD Street
            projects opening in summer 2028, Fox5 reported. No construction
            has started.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="What's actually being built first">
        <p className="text-body-lg text-lvinit-warmgray">
          The city agreement only covers what it calls Phase 1A, &ldquo;the
          first complete and executable construction package&rdquo; inside
          the old theater. The centerpiece is a large flexible studio theatre
          made by combining the former Cinema 1 and Cinema 2. The agreement
          puts audience capacity at approximately 250 seats and says final
          specs still depend on design, code review, permitting and
          construction pricing.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Around that theatre, Phase 1A includes a rebuilt ground-floor lobby,
          a new public stair connecting the second and third levels, a
          concession area, and a back-of-house wing with restrooms, showers,
          dressing rooms, wardrobe space and loading. It&rsquo;s the
          unglamorous stuff, but it&rsquo;s what turns a closed multiplex into
          a working performance venue.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The bigger vision is larger. In February, THIRD Street described
          plans to KNPR for three venues of about 250, 150 and 600 seats, with
          four resident companies: Vegas Theater Company, Vegas City Opera,
          Las Vegas Sinfonietta and Laugh After Dark. Some coverage of the
          city vote has described the 600-seat figure as part of this
          project. It isn&rsquo;t in the city agreement, and later phases
          haven&rsquo;t been defined or funded.
        </p>
      </StorySection>

      <StorySection heading="What the city is paying for, and what it isn't">
        <p className="text-body-lg text-lvinit-warmgray">
          The Redevelopment Agency&rsquo;s agenda lists the deal as an Agency
          Reimbursement Agreement for up to $4.2 million from its Special
          Revenue Fund, in Redevelopment Area 1, Ward 3. City staff recommended
          approval, and Fox5 reported it was approved. The stated purpose:
          arts performances, arts education, theatre workforce development
          and arts-focused community events in the Arts District.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          &ldquo;Reimbursement&rdquo; is the key word. This isn&rsquo;t a
          check up front. The city repays eligible construction costs after
          THIRD Street spends them, and only once the nonprofit hits its own
          fundraising milestones. The draft agreement&rsquo;s schedule asks
          THIRD Street to line up about $500,000 in pledges or closed funds
          within 90 days, about $1.65 million within six months and about $3.3
          million, its full non-city share, within nine months.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The about $7.5 million Phase 1A budget is an early, rough-order
          estimate dated March 2026. Roughly $4.75 million of it is
          construction, about $1.66 million covers fees, permits and
          contingency, and about $1.05 million is theater equipment. Expect
          those numbers to move once design is finished and the job is bid.
        </p>
      </StorySection>

      <StorySection muted heading="When it could open">
        <p className="text-body-lg text-lvinit-warmgray">
          The agreement&rsquo;s schedule runs off its effective date, which
          hasn&rsquo;t been published. From that date, THIRD Street is
          targeting the start of construction within nine months (12 months
          at the latest), and substantial completion about eight months after
          that (12 at the latest). Weller&rsquo;s team told Fox5 they expect to
          break ground in about eight months and to open the doors by summer
          2028.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Treat summer 2028 as THIRD Street&rsquo;s projection, not a promise.
          It depends on the fundraising coming in on time, and nonprofit
          capital campaigns don&rsquo;t always hit their dates.
        </p>
      </StorySection>

      <StorySection heading="Why it matters for downtown">
        <p className="text-body-lg text-lvinit-warmgray">
          THIRD Street&rsquo;s pitch is that Las Vegas builds stages for
          visitors faster than it builds them for local companies. Weller told
          KNPR that a city of two and a half million people doesn&rsquo;t have
          the cultural infrastructure other cities its size do, and Vegas City
          Opera&rsquo;s leadership described working out of borrowed city and
          library spaces. A 250-seat flexible room in the Arts District would
          give those groups a home base downtown.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The training piece is what the city is leaning on. Weller told Fox5
          the plan is to mentor local talent through partnerships with high
          schools, CSN and UNLV, so the Strip&rsquo;s entertainment industry
          can hire people who grew up here. If it works, the building becomes
          a daytime place, not just a nighttime one.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It also puts a dark building back to use. A closed theater is a dead
          spot on a block; a working venue brings foot traffic to the
          galleries, bars and restaurants around it. If you&rsquo;re new to the
          area, the{" "}
          <Link href="/neighborhoods/downtown-arts-district" className={linkCls}>
            Downtown Arts District guide
          </Link>{" "}
          covers what the neighborhood is like now, including First Friday
          and parking. For the wider downtown picture, see how{" "}
          <Link
            href="/guides/the-foundry-lennar-cashman-downtown-las-vegas"
            className={linkCls}
          >
            The Foundry is adding homes near Cashman Center
          </Link>{" "}
          and how the{" "}
          <Link href="/guides/maryland-parkway-red-line-rtc-las-vegas" className={linkCls}>
            RTC Red Line on Maryland Parkway
          </Link>{" "}
          connects downtown to UNLV. Still deciding where to land in the
          valley? Start with{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection muted heading="What I haven't confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">The final vote and terms.</span>{" "}
            The approval comes from Fox5&rsquo;s reporting. The agreement I read
            is the draft attached to the agenda, so the signed version could
            differ.
          </li>
          <li>
            <span className="text-lvinit-black">The building&rsquo;s size.</span>{" "}
            Reports range from about 41,500 to 52,000 square feet, and the city
            documents don&rsquo;t say, so I&rsquo;ve left it out.
          </li>
          <li>
            <span className="text-lvinit-black">Later phases.</span> Anything
            beyond the first 250-seat theatre isn&rsquo;t defined or funded in
            the city agreement.
          </li>
          <li>
            <span className="text-lvinit-black">The image above.</span> It&rsquo;s
            an AI illustration made for this story, not a photo of the
            building and not an official THIRD Street or city rendering. The
            real site is the existing former cinema, and the finished venue
            won&rsquo;t necessarily look like this.
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">City of Las Vegas Redevelopment Agency</span>,
            agenda summary, meeting of Nov. 4, 2026.{" "}
            <a href={AGENDA} className={extCls} target="_blank" rel="noopener noreferrer">
              lasvegasnevada.gov (PDF)
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">City of Las Vegas Redevelopment Agency</span>,
            resolution and draft Agency Reimbursement Agreement with Third
            Street, Inc. (Attachments C, E, G and H).{" "}
            <a href={RESOLUTION} className={extCls} target="_blank" rel="noopener noreferrer">
              lasvegasnevada.gov (PDF)
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>, Las Vegas
            City Council approves up to $4.2M for downtown arts and media hub,
            Nov. 5, 2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/11/05/las-vegas-city-council-approves-up-42m-downtown-arts-media-hub/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Las Vegas</span>, Las Vegas
            to turn former Eclipse Theatres into performing arts center, Nov.
            6, 2026.{" "}
            <a
              href="https://www.fox5vegas.com/2026/11/06/las-vegas-turn-former-eclipse-theatres-into-performing-arts-center/"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KNPR</span>, New creative arts
            campus in the works for Downtown Las Vegas, Feb. 23, 2026.{" "}
            <a
              href="https://www.knpr.org/show/knprs-state-of-nevada/2026-02-23/new-creative-arts-campus-in-the-works-for-downtown-las-vegas"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              knpr.org
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
