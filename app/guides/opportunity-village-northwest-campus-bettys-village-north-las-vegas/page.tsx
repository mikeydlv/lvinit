import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// GROWTH & DEVELOPMENT — Opportunity Village's $59M Northwest Campus and
// Betty's Village North at Rome and Thom, off N. Decatur Blvd and the I-215.
// Built by the LVINIT Daily Publisher from Local Radar assignment
// LR-OPPORTUNITY-VILLAGE-NORTHWEST-CAMPUS-BETTYS-VILLAGE-NORTH.
//
// FACT DISCIPLINE — re-read this run (2026-11-23):
// - Opportunity Village press release, Feb 23, 2026 (read): $59M; 17.6 acres
//   at North Thom and Rome boulevards, just off N. Decatur and I-215; fourth
//   large-scale OV campus; day habilitation program spaces, onsite workforce
//   training, an Opportunity Village Thrift Store boutique, OV Artworks Studio
//   workshop and gallery, and a cafe; campus projected fall 2026. Betty's
//   Village North: second OV residential community, 90 residences (1- and
//   2-bedroom apartments and 4-bedroom homes), 125+ residents, gated,
//   front-porch living, walking/bike paths, barbecue area, community park;
//   first residents December 2026, move-ins over six months. Original
//   Betty's Village, 7755 W. Oquendo Rd, opened 2021 and filled within five
//   months. Bob Brown (president and CEO) quotes, incl. waiting list of
//   "hundreds" and "can't build them fast enough."
// - OV fact sheet PDF (text extracted and read): 5080 W. Rome Blvd (campus,
//   89131); program services building 16,500 sq ft (day habilitation and
//   prevocational programs); OVintage Boutique, Cafe and OV Artworks Studio
//   Workshop and Gallery about 17,000 sq ft at 5030 W. Rome Blvd; Betty's
//   Village North at 6700 Thom Blvd; 126 bedrooms; 1-BR 730 sq ft, 2-BR
//   1,018 sq ft, 4-BR 2,050 sq ft; accessible showers, side grip features;
//   ~12,000 sq ft clubhouse (lounge, kitchenette, game room, office, business
//   center, contemplation room, accessible gym, pool, hot tub, meeting
//   spaces). First residents November 2026 over six months (conflicts; see
//   below).
// - OV program page (read): "Coming Late 2026"; first residents December 2026
//   over four months; adults with and without disabilities; range from
//   independent living without supports to higher care; residents choose
//   certified providers; on-site concierge staff; 24-hour services available
//   for higher-care residents.
// - KTNV (read, undated): quotes Chief Program Officer Chuck Neuwohner on
//   inviting the community in ("from the park, to the shops, to the many
//   events that we'll be hosting on site").
// TIMING CONFLICT HANDLED: first-resident month (Nov vs Dec) and move-in
// period (four vs six months) differ across OV's own materials; the article
// says "late 2026" and names the discrepancy instead of picking one.
// MUST NOT CLAIM / OMITTED: that the campus or Betty's Village North is open
// or has residents (no announcement found; OVNorthwest.org 503 this run);
// any opening/ribbon-cutting date; boutique/cafe hours; eligibility, rents or
// application steps; KTNV's ~$60M / ~20 acres figures; that LVINIT toured it.
// IMAGERY — No LVINIT photography of Rome/Thom/Decatur exists in the image
// library and no first-party media was added the morning of publication.
// Photoless StoryHero and no card image, per the standard fallback. No OV
// renderings or news photos (no rights).
// ---------------------------------------------------------------------------

const PATH = "/guides/opportunity-village-northwest-campus-bettys-village-north-las-vegas";
const TITLE =
  "What’s Being Built at Rome and Thom: Opportunity Village’s $59M Northwest Campus and Betty’s Village North";
const RELEASE_URL = "https://www.opportunityvillage.org/press-releases/northwest-campus-opening";
const PROGRAM_URL =
  "https://www.opportunityvillage.org/disability-programs-and-services/northwest-campus";
const FACT_SHEET_URL =
  "https://www.opportunityvillage.org/wp-content/uploads/2026/09/OV-Northwest-Campus-Bettys-Village-North-Fact-Sheet-9.pdf";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";

const meta: StoryMeta = {
  title: "Opportunity Village Northwest Campus & Betty's Village North | LVINIT",
  headline: TITLE,
  description:
    "The big project going up at Rome and Thom off Decatur and the 215 is Opportunity Village's $59M Northwest Campus: program space, a thrift boutique, cafe and art gallery, plus Betty's Village North, 90 homes for adults with and without disabilities.",
  path: PATH,
  datePublished: "2026-11-23",
  dateModified: "2026-11-23",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Opportunity Village Northwest Campus", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function OpportunityVillageNorthwestCampusPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Growth & Development",
        headline: TITLE,
        subheadline:
          "If you've driven Decatur near the 215 and wondered what's going up just north of the Costco, this is it. Here's what's planned, what neighbors will actually be able to use, and what's still unconfirmed.",
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on how the northwest valley is changing.",
        stories: [
          {
            name: "Decatur and the Iron Mountain Road project",
            href: "/guides/iron-mountain-road-extension-decatur-closure-northwest-las-vegas",
            category: "Local Feature",
            dek: "The road work changing how you get around up Decatur.",
          },
          {
            name: "Nevada State Veterans Memorial",
            href: "/guides/nevada-state-veterans-memorial-thunderbird-northwest-las-vegas",
            category: "Local Feature",
            dek: "Another new public place taking shape in the northwest.",
          },
          {
            name: "Hualapai & Grand Teton Substation and Park",
            href: "/guides/hualapai-grand-teton-police-substation-park-northwest-las-vegas",
            category: "Local Feature",
            dek: "A police substation and park coming to northwest Las Vegas.",
          },
        ],
      }}
      ctas={{
        heading: "Trying to get a feel for the northwest valley?",
        body:
          "What's being built nearby says a lot about where an area is headed. If you want an honest local read on this side of town, ask me.",
      }}
    >
      <StoryLede
        kicker="Growth & Development"
        lead="The buildings going up at Rome Boulevard and Thom Boulevard, just off North Decatur and the 215, belong to Opportunity Village. The Las Vegas nonprofit, which serves people with intellectual and developmental disabilities, is building a $59 million, 17.6-acre project there. It has two parts: the Northwest Campus, with program space, a thrift boutique, a cafe and an art gallery, and Betty's Village North, a gated community of 90 homes. Opportunity Village's own materials put both in late 2026. As of this writing, it hasn't announced an opening date."
      />

      <StorySection heading="What’s actually going in">
        <p className="text-body-lg text-lvinit-warmgray">
          This is Opportunity Village&rsquo;s fourth large-scale campus in
          the Las Vegas area. According to its fact
          sheet, the site splits into three pieces:
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">
              Program services building, 5080 W. Rome Blvd.
            </span>{" "}
            About 16,500 square feet for day habilitation and prevocational
            programs, the hands-on activities, exercise, social time and real
            work experience Opportunity Village is known for. The press release
            also lists onsite workforce training.
          </li>
          <li>
            <span className="text-lvinit-black">
              OVintage Boutique, cafe and OV Artworks, 5030 W. Rome Blvd.
            </span>{" "}
            About 17,000 square feet for a thrift boutique, a cafe, and an OV
            Artworks studio workshop and gallery.
          </li>
          <li>
            <span className="text-lvinit-black">
              Betty&rsquo;s Village North, 6700 N. Thom Blvd.
            </span>{" "}
            The residential side, covered below.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="The part neighbors will use">
        <p className="text-body-lg text-lvinit-warmgray">
          Most of the campus is program space, but the Rome Boulevard
          storefront building is the piece the rest of us will notice. A
          thrift boutique, a cafe and an art gallery are the kind of places
          you stop into on the way back from Costco, and Opportunity Village
          clearly means for people to do that. Chief Program Officer Chuck
          Neuwohner told KTNV the goal is to invite the community in,
          &ldquo;from the park, to the shops, to the many events that
          we&rsquo;ll be hosting on site.&rdquo;
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          What I can&rsquo;t tell you yet is when the boutique, cafe and
          gallery open to the public, or what their hours will be. Opportunity
          Village hasn&rsquo;t published that. The campus phone number is
          still listed as &ldquo;TBD&rdquo; on its fact sheet.
        </p>
      </StorySection>

      <StorySection heading="Betty’s Village North">
        <p className="text-body-lg text-lvinit-warmgray">
          The original Betty&rsquo;s Village opened in 2021 at 7755 W.
          Oquendo Rd. Opportunity Village says it was full
          within five months. Betty&rsquo;s Village North is the second one,
          and it&rsquo;s bigger. Here&rsquo;s what Opportunity Village has
          published:
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Size:</span> 90 residences
            with 126 bedrooms, housing more than 125 people.
          </li>
          <li>
            <span className="text-lvinit-black">Home types:</span>{" "}
            One-bedroom apartments (730 square feet), two-bedroom apartments
            (1,018 square feet) and four-bedroom homes (2,050 square feet),
            with front porches, accessible showers and grip features.
          </li>
          <li>
            <span className="text-lvinit-black">Shared spaces:</span> A
            roughly 12,000-square-foot clubhouse with a lounge, kitchenette,
            game room, business center, contemplation room, accessible gym,
            meeting space, pool and hot tub. Outside, walking and bike paths,
            a barbecue area and a community park.
          </li>
          <li>
            <span className="text-lvinit-black">Who lives there:</span>{" "}
            Adults with and without disabilities. Opportunity Village says
            living arrangements range from fully independent to higher levels
            of care, with on-site concierge staff and 24-hour support
            available for residents who need it. It&rsquo;s a gated
            community.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Opportunity Village hasn&rsquo;t published rents, eligibility or an
          application process. Its{" "}
          <a href={PROGRAM_URL} className={extCls} target="_blank" rel="noopener noreferrer">
            Northwest Campus page
          </a>{" "}
          points anyone interested in living there to its housing contact.
          If that&rsquo;s you or someone in your family, go straight to them.
          I&rsquo;m not going to guess at any of it.
        </p>
      </StorySection>

      <StorySection muted heading="So when does it open?">
        <p className="text-body-lg text-lvinit-warmgray">
          Late 2026 is the honest answer, and even Opportunity
          Village&rsquo;s own materials don&rsquo;t quite agree on the
          details. Its February press release projected a fall 2026 campus
          opening and first Betty&rsquo;s Village North residents in December,
          with move-ins spread over six months. The fact sheet says November
          over six months. The program page, labeled &ldquo;Coming Late
          2026,&rdquo; says December over four months.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          As of Nov. 23, I haven&rsquo;t found a ribbon cutting, a grand
          opening or a first move-in announced anywhere, and the project
          site, OVNorthwest.org, wasn&rsquo;t loading when I checked. So treat
          it as close, not open. We&rsquo;ll update this when Opportunity
          Village sets a date.
        </p>
      </StorySection>

      <StorySection heading="Why it matters up here">
        <p className="text-body-lg text-lvinit-warmgray">
          Opportunity Village&rsquo;s president and CEO, Bob Brown, put the
          need plainly in the February release: &ldquo;We feel like we
          can&rsquo;t build them fast enough.&rdquo; He said the waiting list
          for Betty&rsquo;s Village runs to hundreds of people, and that the
          project &ldquo;helps answer the question of what will happen to my
          loved one when I&rsquo;m gone.&rdquo; For a lot of Las Vegas
          families, that&rsquo;s the whole story.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          For everyone else in the area, it&rsquo;s a big piece of the Decatur
          and 215 corner filling in with something other than more retail or
          another subdivision. The northwest has a lot going on right now,
          from the{" "}
          <Link
            href="/guides/iron-mountain-road-extension-decatur-closure-northwest-las-vegas"
            className={linkCls}
          >
            Iron Mountain Road work up Decatur
          </Link>{" "}
          to the{" "}
          <Link
            href="/guides/nevada-state-veterans-memorial-thunderbird-northwest-las-vegas"
            className={linkCls}
          >
            Nevada State Veterans Memorial
          </Link>{" "}
          and new communities like{" "}
          <Link href="/guides/monument-hills-northwest-las-vegas" className={linkCls}>
            Monument Hills
          </Link>
          . If you&rsquo;re new to the valley and still figuring out where
          everything is, the{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas
          </Link>{" "}
          guide is a good place to start.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          LVINIT hasn&rsquo;t photographed the site for this story, so
          there are no photos here rather than borrowed renderings. We&rsquo;ll
          add our own from the street when we have them.
        </p>
      </StorySection>

      <StorySection muted heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Opportunity Village</span>,
            &ldquo;Opportunity Village&rsquo;s Northwest Campus and
            Betty&rsquo;s Village North Slated to Open in Late 2026,&rdquo;
            press release, Feb. 23, 2026.{" "}
            <a href={RELEASE_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              opportunityvillage.org
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Opportunity Village</span>,
            Northwest Campus and Betty&rsquo;s Village North fact sheet,
            2026.{" "}
            <a href={FACT_SHEET_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              opportunityvillage.org (PDF)
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Opportunity Village</span>,
            Northwest Campus and Betty&rsquo;s Village North program page.{" "}
            <a href={PROGRAM_URL} className={extCls} target="_blank" rel="noopener noreferrer">
              opportunityvillage.org
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KTNV</span>, &ldquo;New
            Opportunity Village campus, residential project set to open this
            fall in northwest Valley.&rdquo;{" "}
            <a
              href="https://www.ktnv.com/neighborhoods/northwest-las-vegas/new-opportunity-village-campus-residential-project-set-to-open-this-fall-in-northwest-valley"
              className={extCls}
              target="_blank"
              rel="noopener noreferrer"
            >
              ktnv.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
