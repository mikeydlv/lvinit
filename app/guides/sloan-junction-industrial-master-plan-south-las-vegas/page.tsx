import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// GROWTH & DEVELOPMENT — "Sloan Junction," the Sloan Economic Development
// (Industrial) Master Plan, around the I-15 Sloan Road exit at the south end
// of the valley (unincorporated Clark County). Built by the LVINIT Daily
// Publisher from Local Radar assignment LR-SLOAN-JUNCTION-INDUSTRIAL-MASTER-PLAN.
//
// FACT DISCIPLINE — all three primary records re-read this run (2026-11-21):
// - Staff report, BCC agenda item, File ID 26-2441, cleared for 11/17/2026
//   (read): "Receive a presentation regarding the Sloan Economic Development
//   Master Plan ('Sloan Junction')". Commissioner Jones requested the item.
//   ~774 acres; industrial park focused on advanced manufacturing,
//   transportation and logistics; mix of sporadic existing industrial,
//   undeveloped private land and public land requested from BLM through the
//   Clark County Lands Bill; infrastructure: municipal water, sanitary sewer,
//   flood control facilities, road network. Fiscal impact: N/A.
// - Action summary, joint meeting Tue Nov 17, 2026 (read): item 44 "ACTION:
//   RECEIVED."
// - Presentation "Sloan Junction Industrial Master Plan" (14 pages, read as
//   images): Clark County Economic Development with RAFI and Purdue Marion &
//   Associates. Sloan Road exit off the 15; 2 miles south of the urban Las
//   Vegas Valley; 27 miles north of the California border; "Not Sloan Canyon
//   NCA"; 270 miles from the ports of Long Beach and Los Angeles; 14.9 miles
//   south of Harry Reid. "How did we get here": Sloan Road (aka No Man's
//   Land), no road network, piecemeal development, need for developable
//   industrial land, BLM land transfer, economic development funds, Brightline
//   maintenance facility. History: 1912 Nevada Lime and Plaster; LA & Salt
//   Lake Railroad; mining camp; 1919 first post office; 1922 name changed from
//   Ehret to Sloan. 1980s Roark Estates manufactured home community; early
//   2000s batch plants and outside storage; master plan changed to industrial.
//   Existing conditions: street name confusion, piecemeal development, lack of
//   coordinated infrastructure. Stakeholders listed (agencies and private).
//   Takeaways: unanimous support for coordination; "The Gateway Reality";
//   outside storage is necessary; air quality & industrial compatibility; low
//   priority for rail spurs. Infrastructure: utilities, Regional Flood Control
//   master drainage, internal road network, street name change application.
//   Overlay: prohibit incompatible uses; allow more compatible uses without
//   use permits; reduce landscaping; taller outside storage consistent with
//   Fire Code; minimize screening; metal fencing along the I-15 frontage.
//   Planned land use to IE (Industrial Employment). SID under NRS 271 (bonds
//   for utility loops, gravity sewer mains, regional drainage, paved
//   heavy-haul roads; repaid by assessments on benefited parcels, billed
//   semi-annually). Public RFP for a master developer.
// MUST NOT CLAIM (Local Radar mustNotClaim + this run): that the plan was
// adopted or approved; any timeline, cost or job count; any Brightline
// facility status; that BLM land has transferred; any confusion with Sloan
// Canyon NCA. The 21-page image-only handout was not reviewed and nothing is
// drawn from it.
// IMAGERY — No Sloan-area photography exists in the image library and no
// first-party media was added before this run. Photoless StoryHero and no
// card image. No county deck photos or renderings (rights not confirmed) and
// no other part of the valley standing in for Sloan.
// ---------------------------------------------------------------------------

const PATH = "/guides/sloan-junction-industrial-master-plan-south-las-vegas";
const TITLE =
  "What Is ‘Sloan Junction’? Clark County’s Plan for a 774-Acre Industrial Hub at the Valley’s South Edge";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const meta: StoryMeta = {
  title: "Sloan Junction: Clark County's 774-Acre Industrial Plan | LVINIT",
  headline: TITLE,
  description:
    "Clark County presented a master plan to turn about 774 acres around the I-15 Sloan Road exit into a coordinated industrial park. What's in it, what it isn't, and what happens next.",
  path: PATH,
  datePublished: "2026-11-21",
  dateModified: "2026-11-21",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Sloan Junction", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function SloanJunctionPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Growth & Development",
        headline: TITLE,
        subheadline:
          "The county wants the patchwork of batch plants and yards off the Sloan exit to become a planned industrial park. Here's what was presented, and what hasn't been decided.",
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on how the south and southwest valley are changing.",
        stories: [
          {
            name: "Southwest Las Vegas",
            href: "/neighborhoods/southwest-las-vegas",
            category: "Neighborhoods",
            dek: "The full LVINIT guide to the area, including the industrial corridors already there.",
          },
          {
            name: "SIDs and LIDs in Las Vegas",
            href: "/guides/sids-and-lids-las-vegas-home-buyers",
            category: "Buyer Guide",
            dek: "How Special Improvement District assessments work, and how to look one up.",
          },
          {
            name: "Henderson vs. Southwest Las Vegas",
            href: "/guides/henderson-vs-southwest-las-vegas",
            category: "Comparisons",
            dek: "The two sides of the south valley, compared honestly.",
          },
        ],
      }}
      ctas={{
        heading: "Watching the south end of the valley?",
        body:
          "If you're weighing a home somewhere along the I-15 south corridor, ask me. I'll tell you what's planned nearby and what's just talk.",
      }}
    >
      <StoryLede
        kicker="Growth & Development"
        lead="If you've driven I-15 toward California, you've passed it: the Sloan Road exit, a scatter of concrete batch plants, storage yards and warehouses tucked against the hills just past where the houses stop. Clark County wants to turn that area into something more deliberate. On Tuesday, Nov. 17, county commissioners received a presentation on what the county is calling Sloan Junction, a master plan for an industrial park of about 774 acres focused on advanced manufacturing, transportation and logistics."
      />

      <StorySection heading="First, which Sloan">
        <p className="text-body-lg text-lvinit-warmgray">
          This is not Sloan Canyon National Conservation Area, the
          petroglyph and hiking area on Henderson&rsquo;s south side. The
          county&rsquo;s own presentation says so in a bullet point, which
          tells you how often the two get mixed up. It&rsquo;s also not
          Sloan Lane in east Las Vegas, where the county is building{" "}
          <Link
            href="/guides/sloan-lane-bridge-las-vegas-wash-east-las-vegas"
            className={linkCls}
          >
            a new bridge over the Las Vegas Wash
          </Link>
          .
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Sloan Junction is the area around the Sloan Road exit off I-15 in
          unincorporated Clark County. The county describes it as about 2
          miles south of the urban Las Vegas Valley, 27 miles north of the
          California border and 14.9 miles south of Harry Reid International
          Airport.
        </p>
      </StorySection>

      <StorySection muted heading="Why the county is doing this">
        <p className="text-body-lg text-lvinit-warmgray">
          Sloan has been industrial for a long time, just never on purpose.
          According to the county&rsquo;s presentation, the place started as
          a mining camp: Nevada Lime and Plaster in 1912, the Los Angeles and
          Salt Lake Railroad running through, a post office in 1919, and a
          name change from Ehret to Sloan in 1922. The Roark Estates
          manufactured home community came in the 1980s. Starting in the
          early 2000s, batch plants and outdoor storage filled in to supply
          the valley&rsquo;s construction boom.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          What it never got was a plan. The county&rsquo;s list of problems
          is blunt: Sloan Road, which the deck calls &ldquo;No Man&rsquo;s
          Land,&rdquo; has no real road network, development has been
          piecemeal, infrastructure isn&rsquo;t coordinated, and even the
          street names are confusing. Meanwhile, the county says the valley
          needs more land where industrial users can actually build.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The 774 acres are a mix of what&rsquo;s already there, undeveloped
          private land, and public land the county has requested from the
          Bureau of Land Management through the Clark County Lands Bill. That
          last piece matters: the county has asked for that land, but the
          records presented don&rsquo;t say it has changed hands, so
          don&rsquo;t read this as a done deal on the federal side.
        </p>
      </StorySection>

      <StorySection heading="What the plan actually proposes">
        <p className="text-body-lg text-lvinit-warmgray">
          The presentation came from Clark County Economic Development, with
          consultants RAFI and Purdue Marion &amp; Associates. Strip away the
          slides and it comes down to four moves.
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Build the basics.</span>{" "}
            Municipal water, sanitary sewer, flood control and an internal road
            network, worked out with the utilities and the Regional Flood
            Control District.
          </li>
          <li>
            <span className="text-lvinit-black">
              Pay for it with a Special Improvement District.
            </span>{" "}
            Under Chapter 271 of Nevada law, Public Works would form an SID,
            issue municipal bonds for the upfront cost of utility loops, sewer
            mains, drainage and paved heavy-haul roads, then bill the
            benefited parcels in semi-annual assessments over a period of
            years. In other words, the property owners who gain from the
            infrastructure pay it back, not the general taxpayer. If SIDs are
            new to you, our{" "}
            <Link
              href="/guides/sids-and-lids-las-vegas-home-buyers"
              className={linkCls}
            >
              SIDs and LIDs explainer
            </Link>{" "}
            covers how they work on the residential side.
          </li>
          <li>
            <span className="text-lvinit-black">Hire a master developer.</span>{" "}
            The county would issue a public request for proposals. The winner
            would build out the infrastructure alongside the SID, subdivide
            parcels and market them to logistics and advanced-manufacturing
            users.
          </li>
          <li>
            <span className="text-lvinit-black">Change the rules on the ground.</span>{" "}
            An overlay would prohibit incompatible uses, let more compatible
            uses in without a use permit, reduce landscaping and screening
            requirements, allow taller outdoor storage consistent with fire
            code, and call for metal fencing along the I-15 frontage. The
            planned land use would change to Industrial Employment, which
            allows a broader range of industrial zoning. There&rsquo;s also a
            street-name change application in the mix.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The county&rsquo;s pitch for why Sloan works: it sits on I-15 about
          270 miles from the ports of Long Beach and Los Angeles, and the
          presentation frames it as a one-day truck trip to a large share of
          the West. Its own stakeholder takeaways are worth noting too:
          outdoor storage is a necessity there, air quality and industrial
          compatibility are concerns, and rail spurs are a low priority.
        </p>
      </StorySection>

      <StorySection muted heading="What it isn't, yet">
        <p className="text-body-lg text-lvinit-warmgray">
          This is the part to get right. The commission&rsquo;s official
          action on Nov. 17 was &ldquo;received.&rdquo; That means commissioners
          heard the presentation. It does not mean the plan was adopted, that
          the overlay or land-use change has been approved, or that an SID
          exists. None of those steps has happened yet.
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">No timeline.</span> The
            records don&rsquo;t give dates for the RFP, the SID or
            construction.
          </li>
          <li>
            <span className="text-lvinit-black">No price tag or job count.</span>{" "}
            The staff report lists no fiscal impact for this item, and none of
            the materials estimate infrastructure cost or jobs. If you see a
            number, ask where it came from.
          </li>
          <li>
            <span className="text-lvinit-black">No tenants.</span> Nobody has
            been announced for the park.
          </li>
          <li>
            <span className="text-lvinit-black">Brightline.</span> The
            presentation lists a Brightline maintenance facility among the
            reasons the county started planning here. It doesn&rsquo;t
            describe that facility&rsquo;s status, so neither will I.
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Why it matters if you live here">
        <p className="text-body-lg text-lvinit-warmgray">
          Most of us will never set foot in Sloan. But the valley&rsquo;s
          industrial growth has to go somewhere, and over the past few years
          a lot of it has landed in the southwest, next to homes. Our{" "}
          <Link href="/neighborhoods/southwest-las-vegas" className={linkCls}>
            Southwest Las Vegas guide
          </Link>{" "}
          already flags the logistics parks around Rainbow and Blue Diamond
          and the truck traffic that comes with them. A planned industrial
          district at the edge of the valley, on the interstate, is the
          county saying it would rather steer that kind of use somewhere
          designed for it.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It&rsquo;s also the gateway. Sloan is what people see in the last
          stretch of I-15 before the valley opens up, and the county&rsquo;s
          own takeaway list includes &ldquo;the Gateway Reality.&rdquo; How
          this area gets built, from the overlay&rsquo;s fencing along the
          freeway to how much outdoor storage is allowed, shapes that first
          impression.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          For people living on the south end, in Southern Highlands,
          Enterprise or southwest Henderson, the practical questions are
          traffic on I-15 and Las Vegas Boulevard South and air quality,
          which the county itself named as a concern. Those answers will
          depend on details that haven&rsquo;t been written yet. If
          you&rsquo;re comparing this part of the valley with others, start
          with{" "}
          <Link
            href="/guides/henderson-vs-southwest-las-vegas"
            className={linkCls}
          >
            Henderson vs. Southwest Las Vegas
          </Link>{" "}
          or{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>
          .
        </p>
      </StorySection>

      <StorySection muted heading="What to watch for next">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            A land-use or overlay item for the Sloan area on a Clark County
            Commission or planning agenda.
          </li>
          <li>Public Works starting the SID formation process.</li>
          <li>A county RFP for a Sloan Junction master developer.</li>
          <li>
            Movement on the BLM land the county requested through the Lands
            Bill.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          LVINIT hasn&rsquo;t photographed the Sloan area yet, so this page
          has no imagery rather than a stand-in from another part of town.
          We&rsquo;ll update it when there&rsquo;s a real next step.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Clark County</span>, staff
            report for the Nov. 17, 2026 Board of County Commissioners agenda
            item on the Sloan Economic Development Master Plan (&ldquo;Sloan
            Junction&rdquo;), File ID 26-2441.{" "}
            <a
              href="https://clark.legistar.com/View.ashx?M=F&ID=16126636&GUID=1478F755-53CF-427D-8673-E621FE119112"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              clark.legistar.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">
              Clark County Economic Development, RAFI and Purdue Marion &amp;
              Associates
            </span>
            , &ldquo;Sloan Junction Industrial Master Plan&rdquo; presentation.{" "}
            <a
              href="https://clark.legistar.com/View.ashx?M=F&ID=16148162&GUID=A5D42A3E-C0D1-4168-96B8-9FE63F8E3BB2"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              clark.legistar.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Clark County</span>, action
            summary for the Nov. 17, 2026 joint meeting (item 44: received).{" "}
            <a
              href="https://clark.legistar.com/View.ashx?M=E1&ID=1454768&GUID=509EECE5-A13D-451E-A381-DAC3ECBA743D"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              clark.legistar.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
