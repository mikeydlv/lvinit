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
// NEIGHBORHOODS & LIVING — Nevada's nonfunctional grass ban (AB 356) starts
// Jan. 1, 2027; SNWA's board backed delaying water-waste charges to 2028.
// Built by the LVINIT Daily Publisher from Local Radar assignment
// LR-SNWA-NONFUNCTIONAL-TURF-ENFORCEMENT-2028.
//
// FACT DISCIPLINE — re-read this run (2026-11-25):
// - SNWA Board agenda + supporting materials, Nov 19, 2026, item 17 (PDF
//   getfile id=6834, READ): petitioner Colby N. Pellegrino; AB 356 (2021)
//   prohibits Colorado River water on nonfunctional turf; AB 220 (2023)
//   exempts properties "used exclusively as a single-family residence";
//   law effective Jan 1, 2027; supports delaying water-waste fees until 2028
//   (2029 with an abatement agreement); WSL rebate for eligible properties
//   through 2028 / rebates maintained through Jan 1, 2029. Resolution items:
//   waiver apply by Apr 1 2027; SNWA decides by Jul 1 2027; appeals by Sep 1
//   2027; appeals decided by Dec 1 2027; list to member agencies by Jan 1
//   2028; continued waivers for landscape/streetscape strips on single-family
//   parcels, not changing HOA obligations; charges supported after Jan 1
//   2028; 2028 charges waived for owners in an abatement agreement. Whereas
//   clauses: ~90% of member water from the Colorado River; landscape
//   irrigation is more than half of Nevada's Colorado River allocation;
//   Interior ROD for post-2026 operations, if implemented, allows a 71%
//   reduction of Nevada's existing allocation.
// - snwa.com laws page (READ): applies to commercial, multi-family,
//   government and other properties, not grass in single-family front/back
//   yards; nonfunctional/functional definitions as summarized below; WSL
//   rebate plus $100 per new tree; ~7,600 acres of recreational grass.
// - Fox5 (READ): board approved the resolution; ~19 million sq ft remains;
//   1B+ gallons/yr savings; warning first, then fees, via existing
//   water-waste processes; WSL $5/sq ft.
// MUST NOT CLAIM / OMITTED: that the ban is delayed; that single-family
//   yards are affected; any fine amount (LVVWD's proposal is only a
//   proposal); any lawsuit status; whether each member agency has adopted
//   its rule changes; the vote count (minutes pending).
// IMAGERY — No first-party morning media for this story. Hero and inline
//   photos are Mikey's existing photos of desert-landscaped streetscapes and
//   a park, captioned as context. None is presented as a converted or
//   non-compliant property.
// ---------------------------------------------------------------------------

const PATH = "/guides/las-vegas-nonfunctional-grass-ban-2027-fines-2028";
const TITLE =
  "Las Vegas’ Decorative Grass Ban Starts Jan. 1. Fines Wait Until 2028. Here’s Who It Affects";
const HERO_IMG = "/images/editorial/north-las-vegas-dr-horton-heartland-bay-entry-road.jpg";
const HERO_ALT =
  "Divided community entry road in North Las Vegas lined with desert shrubs and young trees instead of grass, with new homes and mountains behind.";
const CAMPUS_IMG = "/images/editorial/southwest-las-vegas-ufc-apex-commercial-campus.jpg";
const CAMPUS_ALT =
  "Commercial campus in southwest Las Vegas behind a parking lot landscaped with rock, shrubs and small trees rather than grass.";
const PARK_IMG = "/images/editorial/inspirada-henderson-park-walkway-shade-pavilions.jpg";
const PARK_ALT =
  "Park walkway lined with desert plants leads past shaded picnic pavilions toward sports fields in Inspirada, Henderson.";

const AGENDA_URL = "https://www.snwa.com/universal/agenda/getfile.cfml?id=6834";
const AGENDAS_URL = "https://www.snwa.com/apps/snwa-agendas/index.cfml";
const LAWS_URL = "https://www.snwa.com/conservation/understand-laws-ordinances/index.html";
const FOX5_URL =
  "https://www.fox5vegas.com/2026/11/24/southern-nevada-delays-enforcement-nonfunctional-decorative-grass-until-2028/";

const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";
const pCls = "text-body-lg text-lvinit-warmgray";
const strong = "text-lvinit-black";
const listCls = "mt-5 list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray";

const meta: StoryMeta = {
  title: "Las Vegas Grass Ban 2027: Fines Delayed to 2028 | LVINIT",
  headline: TITLE,
  description:
    "Nevada's ban on watering decorative grass with Colorado River water still starts Jan. 1, 2027. SNWA backed waiting until 2028 to charge for it. Who's affected, who isn't, the 2027 waiver deadlines and the rebate.",
  path: PATH,
  image: HERO_IMG,
  imageWidth: 1920,
  imageHeight: 1080,
  imageAlt: HERO_ALT,
  datePublished: "2026-11-25",
  dateModified: "2026-11-25",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Las Vegas Grass Ban", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function NonfunctionalGrassBanPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Neighborhoods & Living",
        headline: TITLE,
        subheadline:
          "The law itself isn't delayed. What changed is when water providers start charging for it, plus new 2027 deadlines for property owners who think their grass should count as functional.",
        image: HERO_IMG,
        imageAlt: HERO_ALT,
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on what it's actually like to live here.",
        stories: [
          {
            name: "HOA Fees in Las Vegas: What to Check",
            href: "/guides/hoa-fees-las-vegas-what-to-check",
            category: "Homes & Real Estate",
            dek: "What your dues pay for, including common-area landscaping.",
          },
          {
            name: "Your First Summer in Vegas",
            href: "/guides/first-summer-in-vegas",
            category: "Moving to Las Vegas",
            dek: "What the heat actually means day to day.",
          },
          {
            name: "Moving to Las Vegas",
            href: "/guides/moving-to-las-vegas",
            category: "Moving to Las Vegas",
            dek: "The practical starting point if you're new to the valley.",
          },
        ],
      }}
      ctas={{
        heading: "Trying to figure out what this means for a place you're looking at?",
        body:
          "If you're buying in an HOA community or a condo, I can help you figure out what questions to ask about common-area landscaping and where to get the official answer.",
      }}
    >
      <StoryLede
        kicker="Neighborhoods & Living"
        lead="Starting Jan. 1, 2027, Nevada law bars using Colorado River water to irrigate nonfunctional grass in Southern Nevada. That date hasn't moved. What has changed: on Nov. 19, the Southern Nevada Water Authority board took up a resolution backing a delay in water-waste charges for that grass until 2028, or 2029 for owners who sign an agreement to remove it. Fox5 reports the board approved it. If you live in a house with a front or back lawn, this law isn't about your yard."
      />

      <StorySection heading="What actually changed this month">
        <p className={pCls}>
          The ban comes from Assembly Bill 356, passed in 2021. In 2023,
          lawmakers clarified through AB 220 that it doesn&rsquo;t apply to
          properties &ldquo;used exclusively as a single-family
          residence.&rdquo; The prohibition still takes effect Jan. 1, 2027.
          What the SNWA resolution addresses is enforcement, which runs through
          the water providers: the Las Vegas Valley Water District, Henderson,
          North Las Vegas and Boulder City.
        </p>
        <p className={`mt-5 ${pCls}`}>Here&rsquo;s what the resolution says:</p>
        <ul className={listCls}>
          <li>
            <span className={strong}>Charges wait until 2028.</span> SNWA
            supports charging customers for water waste when they irrigate
            nonfunctional grass after Jan. 1, 2028.
          </li>
          <li>
            <span className={strong}>One more year with an abatement agreement.</span>{" "}
            Owners who tell their water provider they intend to remove the
            grass by entering an abatement agreement would have their 2028
            charges waived.
          </li>
          <li>
            <span className={strong}>Rebates stay open.</span> SNWA says it
            will keep rebates for removing nonfunctional grass through Jan. 1,
            2029.
          </li>
          <li>
            <span className={strong}>Waivers finally get deadlines.</span> The
            resolution notes that owners asking for waivers hadn&rsquo;t been
            given deadlines before. Now there&rsquo;s a 2027 timeline (below).
          </li>
        </ul>
        <p className={`mt-5 ${pCls}`}>
          According to Fox5, the process will start with a warning
          notification, with fees possible if the watering continues. The
          resolution doesn&rsquo;t set fee amounts; those come from each water
          provider&rsquo;s own rules. SNWA&rsquo;s official minutes for the
          meeting were still listed as pending when this was published.
        </p>
      </StorySection>

      <StoryGallery
        columns={1}
        images={[
          {
            src: CAMPUS_IMG,
            alt: CAMPUS_ALT,
            label: "Context",
            caption:
              "A commercial parking lot in southwest Las Vegas landscaped with rock, shrubs and trees. LVINIT photo used for context on what desert landscaping looks like, not as an example of a conversion.",
          },
        ]}
      />

      <StorySection muted heading="Who this affects, and who it doesn’t">
        <p className={pCls}>
          SNWA says the law applies to commercial, multi-family, government
          and other properties. It does not apply to grass at single-family
          homes, such as front and back yards. In practice, the properties
          that need to pay attention are:
        </p>
        <ul className={listCls}>
          <li>
            <span className={strong}>Shopping centers, office parks and business frontage.</span>{" "}
            Grass along streets, sidewalks, driveways and parking lots is on
            SNWA&rsquo;s nonfunctional list.
          </li>
          <li>
            <span className={strong}>Apartment and condo complexes.</span> Grass
            in front of, between or behind buildings counts, with a limited
            allowance for resident recreation areas (more on that below).
          </li>
          <li>
            <span className={strong}>HOA common areas.</span> This is the one
            that surprises people. SNWA&rsquo;s definition covers HOA-managed
            grass that doesn&rsquo;t provide a recreational benefit,
            regardless of how the property is zoned. So a single-family
            neighborhood can be exempt at the house level while its
            association&rsquo;s entry grass, medians and streetscape strips are
            not.
          </li>
          <li>
            <span className={strong}>Government property.</span> Including
            decorative grass around public buildings.
          </li>
        </ul>
        <p className={`mt-5 ${pCls}`}>
          One more single-family detail: SNWA says it will keep granting
          waivers, as a normal course of business, for landscape or
          streetscape strips located on a single-family parcel. The resolution
          also says that waiver doesn&rsquo;t change anything between a
          homeowner and their HOA. If your HOA has its own landscaping rules
          for that strip, those still apply.
        </p>
      </StorySection>

      <StorySection heading="What counts as “nonfunctional” grass">
        <p className={pCls}>
          SNWA&rsquo;s short version: nonfunctional grass is irrigated grass
          that doesn&rsquo;t provide a functional use. The definitions came
          from a citizens advisory committee and were adopted by the SNWA
          board. The main categories of nonfunctional grass are:
        </p>
        <ul className={listCls}>
          <li>
            <span className={strong}>Streetscape grass:</span> along public or
            private streets, sidewalks, driveways and parking lots, including
            medians, roundabouts and community or business frontage.
          </li>
          <li>
            <span className={strong}>Building grass:</span> in front of,
            between, behind or next to buildings on property not zoned
            exclusively for single-family homes, including maintenance and
            common areas.
          </li>
          <li>
            <span className={strong}>Certain HOA areas:</span> HOA-managed grass
            that doesn&rsquo;t provide a recreational benefit.
          </li>
        </ul>
        <p className={`mt-5 ${pCls}`}>
          Functional grass is grass that provides a recreational benefit and
          generally sits at least 10 feet from a street, on slopes under 25
          percent, and not in medians, along streetscapes or at the front of
          entryways. SNWA&rsquo;s functional categories include:
        </p>
        <ul className={listCls}>
          <li>
            Athletic fields and active recreation areas of at least 1,500
            contiguous square feet, with specific rules on dimensions and
            distance from streets
          </li>
          <li>Playground grass at parks, schools, daycares and HOA play areas</li>
          <li>Golf course play areas, from tee boxes to the rough</li>
          <li>Designated areas at cemeteries and mortuaries</li>
          <li>
            Small pet relief areas (up to 200 square feet) at businesses that
            serve pets
          </li>
          <li>
            Resident area grass of up to 150 square feet per unit at
            apartments, multi-family mixed-use properties and assisted living
            centers
          </li>
        </ul>
        <p className={`mt-5 ${pCls}`}>
          The full definitions have more conditions than fit here. If
          you&rsquo;re on an HOA board or manage a property, read them on{" "}
          <a href={LAWS_URL} className={extCls} target="_blank" rel="noopener noreferrer">
            SNWA&rsquo;s laws and ordinances page
          </a>{" "}
          rather than relying on a summary, this one included.
        </p>
      </StorySection>

      <StoryGallery
        columns={1}
        images={[
          {
            src: PARK_IMG,
            alt: PARK_ALT,
            label: "Context",
            caption:
              "A community park in Inspirada, Henderson, with sports fields beyond the pavilions. Grass used for recreation at parks and fields is treated differently from decorative grass. LVINIT photo for context; SNWA decides individual sites.",
          },
        ]}
      />

      <StorySection muted heading="The 2027 waiver deadlines">
        <p className={pCls}>
          If an owner thinks their grass substantially meets the functional
          definitions, this is the timeline SNWA set in the resolution:
        </p>
        <ul className={listCls}>
          <li>
            <span className={strong}>April 1, 2027:</span> deadline to apply
            for a waiver.
          </li>
          <li>
            <span className={strong}>July 1, 2027:</span> SNWA finishes
            processing applications and tells owners whether the waiver was
            granted, partially granted or denied.
          </li>
          <li>
            <span className={strong}>Sept. 1, 2027:</span> deadline to appeal.
          </li>
          <li>
            <span className={strong}>Dec. 1, 2027:</span> SNWA finishes deciding
            appeals.
          </li>
          <li>
            <span className={strong}>Jan. 1, 2028:</span> SNWA gives the water
            providers a list of properties that still have nonfunctional grass
            with no waiver.
          </li>
        </ul>
        <p className={`mt-5 ${pCls}`}>
          SNWA says it has already identified where nonfunctional grass remains
          and told property owners. If you&rsquo;re on an HOA board and
          haven&rsquo;t seen that notice, that&rsquo;s the first thing to track
          down.
        </p>
      </StorySection>

      <StorySection heading="The rebate">
        <p className={pCls}>
          The Water Smart Landscapes rebate pays commercial, multi-family and
          government property owners cash for grass that&rsquo;s removed and
          replaced with desert landscaping. Fox5 reports it&rsquo;s $5 per
          square foot, and SNWA&rsquo;s site lists a $100 bonus for each new
          tree. Single-family homeowners aren&rsquo;t required to remove
          anything, but SNWA encourages voluntary conversions and offers an
          incentive for those too. Check SNWA&rsquo;s rebate page for current
          terms before you start a project.
        </p>
      </StorySection>

      <StorySection muted heading="Why this matters here">
        <p className={pCls}>
          About 90 percent of the water SNWA&rsquo;s member agencies use comes
          from the Colorado River, through Lake Mead, and landscape irrigation
          uses more than half of Nevada&rsquo;s Colorado River allocation,
          according to the resolution. It also notes that a federal decision
          on how the river is run after 2026, if implemented, would let the
          Interior secretary cut Nevada&rsquo;s existing allocation by 71
          percent. Fox5, citing SNWA, reports about 19 million square feet of
          nonfunctional grass remains in the valley, and replacing it would
          save more than 1 billion gallons a year.
        </p>
        <p className={`mt-5 ${pCls}`}>
          For people who live here, the visible result is already familiar:
          medians, entries and business frontage going from lawn to rock,
          shrubs and trees. That shift will keep happening through 2027.
          Grass at parks, schools and sports fields isn&rsquo;t the target.
          SNWA estimates about 7,600 acres of grass in the valley is used for
          recreation.
        </p>
      </StorySection>

      <StorySection heading="What to do if you live here or are moving here">
        <ul className={listCls}>
          <li>
            <span className={strong}>Homeowner with a lawn:</span> nothing is
            required of you under this law. If you&rsquo;re in an HOA, your
            association&rsquo;s common areas may still change, and that can
            show up in landscaping projects and budgets. The{" "}
            <Link href="/guides/hoa-fees-las-vegas-what-to-check" className={linkCls}>
              HOA fees guide
            </Link>{" "}
            covers what to ask about what your dues pay for.
          </li>
          <li>
            <span className={strong}>HOA board member or property manager:</span>{" "}
            the dates that matter now are April 1, 2027 for waivers and Jan.
            1, 2028 for charges. An abatement agreement buys one more year
            without charges if you&rsquo;re committed to removal.
          </li>
          <li>
            <span className={strong}>Renter:</span> your complex may convert
            grass around the buildings. Resident recreation areas of limited
            size can still qualify as functional.
          </li>
          <li>
            <span className={strong}>Buying in an HOA community or condo:</span>{" "}
            it&rsquo;s fair to ask whether the association has received an
            SNWA notice and whether a conversion is planned or budgeted. If
            you&rsquo;re new to the valley, start with{" "}
            <Link href="/guides/moving-to-las-vegas" className={linkCls}>
              Moving to Las Vegas
            </Link>
            , and{" "}
            <Link href="/guides/first-summer-in-vegas" className={linkCls}>
              your first summer here
            </Link>{" "}
            will explain why water is such a big deal in this town.
          </li>
        </ul>
        <p className={`mt-5 ${pCls}`}>
          A few things this article doesn&rsquo;t cover because they
          aren&rsquo;t settled: the actual fee amounts each water provider will
          charge, whether every provider has finished updating its rules, and
          the outcome of any legal challenge to how grass has been classified.
          We&rsquo;ll update this when SNWA posts the meeting minutes.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className={strong}>Southern Nevada Water Authority</span>,
            Board of Directors agenda and supporting materials, Nov. 19, 2026,
            item 17, &ldquo;A Resolution Supporting the Local Enforcement of
            the Non-Functional Turf Ban.&rdquo;{" "}
            <a href={AGENDA_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              snwa.com
            </a>{" "}
            (
            <a href={AGENDAS_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              agendas and minutes
            </a>
            )
          </li>
          <li>
            <span className={strong}>Southern Nevada Water Authority</span>,
            &ldquo;Understand laws and ordinances.&rdquo;{" "}
            <a href={LAWS_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              snwa.com
            </a>
          </li>
          <li>
            <span className={strong}>Fox5 Las Vegas (KVVU)</span>, report on SNWA
            delaying enforcement for nonfunctional grass until 2028, November
            2026.{" "}
            <a href={FOX5_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              fox5vegas.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
