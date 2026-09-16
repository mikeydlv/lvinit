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
// LOCAL FEATURE — "Henderson's Water Street District." Built via the
// autonomous scheduled editorial-publishing routine.
//
// TOPIC SELECTION: no fresh, corroborated breaking story from the last 24-72h
// cleared the sourcing bar this run (checked: LVR's Sept 2026 mid-month
// figures, a Downtown Summerlin apartment approval with an unclear publish
// date, several Henderson/Southwest development leads already covered).
// Fell back to a genuine, explicitly flagged content gap instead: LVINIT's own
// Henderson pillar guide (lib/areas/henderson.tsx) has carried a one-paragraph
// roster entry for "Water Street District" since the guide's August 2026
// rebuild, unlinked, exactly as docs/PROJECT_STATE.md's "Future Neighborhood
// Pages" section calls for — "Lake Las Vegas, Green Valley Ranch and the
// Water Street District are the strongest remaining candidates; each is
// already written up in the guide's roster and becomes a link by adding
// `href` to its entry." Grepped the repo for "Water Street," "Watermark," and
// "Atwell Suites" before writing — no existing LVINIT page covers any of this
// beyond that one roster paragraph and a couple of passing mentions in the
// Henderson guide's prose. Also checked the Southwest Las Vegas pillar's own
// UnCommons coverage (deep, current, and already tracks that campus's fifth
// office building) to confirm this piece doesn't duplicate that cluster.
//
// FACT DISCIPLINE — every figure below is sourced to the "Sources" section at
// the foot of the article.
//
// - Background history (Basic Magnesium origin, the district's boundary
//   definition, the 1995 Redevelopment Agency, the 2002 "Water Street
//   District" branding, and the roster of older fixtures like the Rainbow
//   Club Casino and Corley Center): Wikipedia's "Water Street District
//   (Henderson, Nevada)" entry, used only for uncontroversial background
//   color, not for anything about the Watermark's current 2026 status.
// - The Watermark's financing history: ACRES Capital's own transaction page
//   (acrescap.com/transactions/the-watermark/), fetched directly this run —
//   a $37.5 million construction loan to Strada Development Group (Founding
//   Partner Jeffrey Cruden) in 2021, for a 151-unit, seven-story building at
//   215 S. Water Street with roughly 9,928 sq ft retail, 14,725 sq ft
//   restaurant, and 11,923 sq ft office space. This is the primary source
//   for the unit/sq-ft breakdown; other outlets round differently (some say
//   "151 apartments and 30,000+ sq ft of commercial space" in aggregate),
//   and this piece uses ACRES's own itemized figures.
// - The bankruptcy and rescue: the Watermark's developer entity, DTH 215
//   Venture LLC (tied to Strada Development Group), filed for bankruptcy in
//   2024 after construction costs rose more than 20% amid supply-chain
//   problems and stalled around late 2023. A $27.9 million rescue loan closed
//   in February 2025, per court filings, and construction resumed — reported
//   independently by KTNV ("Watermark building in Henderson secures funding
//   after yearlong delay"), Fox5 Vegas ("Downtown Henderson project delayed
//   by bankruptcy resumes construction," Feb 21, 2025), and The Real Deal
//   ("Strada secures $28M loan to finish bankrupt Henderson project," Feb 20,
//   2025) — three independent outlets on the same financing event, with
//   only the loan amount rounded differently ($27.9M vs. "$28M").
// - Mayor Michelle Romero's quote is real and attributed, carried in the KTNV
//   piece above and corroborated verbatim by a local radio aggregator
//   (Coyote Country) republishing the same city/press statement.
// - The foreclosure and new ownership: the Las Vegas Review-Journal's own
//   article ("Big project on Water Street in downtown Henderson went into
//   foreclosure, has new landlord from California") returned HTTP 403 on
//   every direct WebFetch attempt this run (consistent with this project's
//   prior, documented experience of reviewjournal.com blocking automated
//   fetches). Rather than rely on a single AI search summary as the
//   underlying source, the load-bearing facts below were cross-checked
//   across multiple independent search passes that each returned the same
//   specific figures verbatim (the foreclosure occurring in "late April"
//   2026, the ">$41.5 million in unpaid debt... according to Clark County
//   records," Next Wave Investors as the buyer, and the "~70% leased" and
//   "modern industrial feel with exposed concrete" reporting), plus
//   independent, direct confirmation of Next Wave Investors' own identity
//   (San Clemente, California; co-founder David Sloan; 1,800+ unit
//   portfolio) via the firm's own site and LinkedIn/Crunchbase profiles. No
//   number in this section is asserted from a single unverifiable source.
// - Atwell Suites: PR Newswire's own release ("DeSimone Gaming Opens Atwell
//   Suites on Historic Water Street") and Hotel Online's syndication of the
//   same release, cross-checked against IHG's own property page — 90 rooms
//   (57 king, 33 double-queen), built on the former Pass Casino site, grand
//   opening Nov. 21, 2024.
// - America First Center: NHL.com's Vegas Golden Knights news item and
//   News3LV, both dating the rename from "Lifeguard Arena" to "America First
//   Center" to June 27, 2023, tied to a Foley Entertainment Group / America
//   First Credit Union partnership extension. Opened originally as Lifeguard
//   Arena on Nov. 10, 2020 (Wikipedia, corroborating background only).
// - Deliberately NOT asserted: an exact current completion status for "The
//   Waterfalls," a second Strada-linked, 22-story tower once planned for the
//   same district's old City Tower site. The most recent reporting this run
//   could independently verify described liens and stalled construction; no
//   source found this run confirms whether that project is still alive,
//   dead, or reorganized as of September 2026. The article says so plainly
//   rather than guessing.
// - FAIR HOUSING: no claims about who lives in the district, no "great for
//   young professionals"-style steering. Fit is expressed through what's
//   physically there and its redevelopment history only.
//
// IMAGERY — Mikey supplied two of his own Water Street District photos
// directly (uploaded to public/images/), superseding this run's original
// generated-cover fallback (deleted; nothing references it anymore):
//   - "water street district.png" -> cropped ~34% off the right edge (the
//     source's original framing put the gateway sign dead-center, directly
//     behind the hero headline's widest wrapped line) so the sign sits
//     clear of the text column, then optimized to color WebP. Used as the
//     StoryHero and the /guides + homepage card image:
//     public/images/hero/water-street-district-henderson-gateway-sign-hero.webp
//     The district's own illuminated gateway arch over South Water Street,
//     at the covered walkway connecting Henderson's City Hall complex to
//     its parking lot (confirmed via cityofhenderson.com's own walking-tour
//     page, which places this exact arch there).
//   - "water st district.png" -> optimized to color WebP, uncropped, placed
//     inline in "What else is actually open on Water Street" via
//     StoryGallery:
//     public/images/features/water-street-district-henderson-mackenzies-river-streetscape.webp
//     Looking down the street at MacKenzie's River Pub and the newer
//     apartments/retail alongside it.
//   Both processed with Sharp (existing project dependency): webp({ quality: 82 }),
//   the hero via an ordinary rectangular extract() first. Verified visually
//   with a real Playwright/Chromium screenshot at 1728px, not by inspecting
//   markup alone — the sign is fully clear of the headline at that width.
// ---------------------------------------------------------------------------

const PATH = "/guides/water-street-district-henderson";

const meta: StoryMeta = {
  title:
    "Henderson's Water Street District: What's Actually There Now | LVINIT",
  headline:
    "Henderson's Water Street District Just Survived a Bankruptcy. Here's What's Actually There Now",
  description:
    "Downtown Henderson's biggest new building, The Watermark, went bankrupt, got rescued, opened — and then went into foreclosure anyway. The honest state of Water Street: what's open, what's new, and what's still stalled.",
  path: PATH,
  datePublished: "2026-09-15",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Henderson", path: "/neighborhoods/henderson" },
    { name: "Water Street District", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "1995",
    label: "Redevelopment Agency formed",
    note: "The start of Henderson's 30-year push to revive its original downtown",
  },
  {
    value: "151 units",
    label: "The Watermark",
    note: "Now open under new ownership, after a 2024 bankruptcy and a 2026 foreclosure",
  },
  {
    value: "90 rooms",
    label: "Atwell Suites",
    note: "Water Street's first hotel, opened November 21, 2024, on the former Pass Casino site",
  },
  {
    value: "2023",
    label: "America First Center",
    note: "The Henderson Silver Knights' rink, renamed that June from Lifeguard Arena",
  },
];

function SnapshotPanel() {
  return (
    <section
      id="by-the-numbers"
      aria-label="Water Street District snapshot"
      className="scroll-mt-24"
    >
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            Water Street, by the numbers
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            What&rsquo;s actually built, actually open, or actually confirmed
            right now. See the sources at the end of this article for the
            full reporting.
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
                <p className="mt-2 text-caption text-lvinit-warmgray">
                  {s.note}
                </p>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}

export default function WaterStreetDistrictHendersonPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Local Feature",
        headline:
          "Henderson's Water Street District Just Survived a Bankruptcy. Here's What's Actually There Now",
        subheadline:
          "Downtown Henderson's biggest new building went bankrupt, got an emergency loan, opened to residents — and then went into foreclosure anyway. It's open again under new ownership. That messy, honest arc is the most useful way to understand where the district actually stands.",
        // Mikey's own photo of the district's illuminated gateway arch, at
        // the walkway between Henderson City Hall and its parking lot.
        image:
          "/images/hero/water-street-district-henderson-gateway-sign-hero.webp",
        imageAlt:
          "The Water Street District gateway arch spanning South Water Street in downtown Henderson, with palm trees and the City Hall complex alongside it",
        backLink: { label: "Living in Henderson", href: "/neighborhoods/henderson" },
        ctas: [
          { label: "See the numbers", href: "#by-the-numbers", variant: "primary" },
        ],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "Water Street is one corner of a much bigger city. Here's how it connects to the rest of what LVINIT has covered in Henderson.",
        stories: [
          {
            name: "Living in Henderson",
            href: "/neighborhoods/henderson",
            category: "Area Guide",
            dek: "The full guide to Henderson's communities, including the Historic Henderson/Water Street area this piece zooms in on.",
          },
          {
            name: "The Fiesta Henderson Site Finally Has a Plan",
            href: "/guides/fiesta-henderson-redevelopment",
            category: "Local Feature",
            dek: "A different empty Henderson site, a few minutes away, going through its own honesty-first redevelopment story.",
          },
          {
            name: "Henderson vs. Southwest Las Vegas: Where Should You Actually Move?",
            href: "/guides/henderson-vs-southwest-las-vegas",
            category: "Comparisons",
            dek: "Zoom back out to how Henderson compares to the valley's other big growth corridor, Water Street included.",
          },
        ],
      }}
      relatedNeighborhood={{
        name: "Henderson",
        href: "/neighborhoods/henderson",
        kicker: "The parent guide",
        heading: "Read the Henderson guide",
        blurb:
          "Water Street is one of five ways LVINIT's full Henderson guide organizes the city. Read it for the other four, and for how Water Street fits against Green Valley, Cadence, Lake Las Vegas, and the hillside communities.",
      }}
      ctas={{
        heading: "Curious about downtown Henderson?",
        body:
          "Water Street is the one part of Henderson that's old, walkable, and still visibly under construction all at once. Tell me what you're actually looking for and I'll give you the honest read on whether that fits, or whether you'd be happier somewhere else in the city.",
      }}
    >
      <StoryLede
        kicker="Local Feature"
        lead="Henderson's own pillar guide calls Water Street the one part of the city with 'pre-master-plan bones' — a real main street instead of a designed one. That's true, and it undersells how much has actually happened there in the last three years. A six-story hotel opened. An ice rink got a new name and a new sponsor. And the district's single biggest new building went bankrupt, got rescued with an emergency loan, opened its doors to renters — and then went into foreclosure anyway."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          None of that is a reason to write Water Street off. It&rsquo;s the
          reason to actually look at it closely instead of taking a press
          release&rsquo;s word for it. Here&rsquo;s what&rsquo;s real on the
          ground right now.
        </p>
      </StoryLede>

      <StorySection heading="Why Water Street is older than the rest of Henderson">
        <p className="text-body-lg text-lvinit-warmgray">
          Water Street exists because Henderson does. The street takes its
          name from a water main built in 1941 to serve the Basic Magnesium
          plant that gave the city its start as a wartime company town, and
          the roughly one-mile stretch of South Water Street between Ocean
          Avenue and Lake Mead Parkway was that company town&rsquo;s original
          main street. Everywhere else in Henderson is a master plan someone drew
          on paper before anyone lived there. Water Street is the one place
          that just grew.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It didn&rsquo;t stay vibrant on its own. As newer commercial areas
          opened elsewhere in the valley through the 1980s and &rsquo;90s
          &mdash; the 1996 opening of the Galleria at Sunset mall was
          especially rough on it &mdash; Water Street&rsquo;s retail
          hollowed out. The city responded in{" "}
          <span className="text-lvinit-black">1995</span> by forming a
          Redevelopment Agency with a 30-year mandate to reinvest in the
          area, and in{" "}
          <span className="text-lvinit-black">2002</span> formally branded
          the corridor the &ldquo;Water Street District.&rdquo; By 2011 the
          agency had already put more than $60 million into it. That
          three-decade, still-running redevelopment effort is the frame for
          everything below &mdash; this is a corridor the city has been
          deliberately rebuilding for longer than some Henderson residents
          have been alive, and it is still visibly mid-project.
        </p>
      </StorySection>

      <SnapshotPanel />

      <StorySection heading="The building that almost didn't happen: The Watermark">
        <p className="text-body-lg text-lvinit-warmgray">
          The clearest single measure of how hard this district has been to
          rebuild is one building: The Watermark, a seven-story, 151-unit
          mixed-use project at 215 S. Water Street, across from the America
          First Center ice rink. On paper it&rsquo;s exactly what a
          redevelopment agency wants &mdash; apartments over retail,
          restaurant, and office space, the tallest building on the street.
          In practice, it took most of five years and two separate financial
          rescues to actually deliver.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          New York-based lender ACRES Capital put up a{" "}
          <span className="text-lvinit-black">$37.5 million</span>{" "}
          construction loan in 2021 to Nevada-based Strada Development Group,
          for a building the lender&rsquo;s own records describe as roughly
          9,928 sq ft of retail, 14,725 sq ft of restaurant space, and
          11,923 sq ft of office space on top of the residential floors.
          Construction stalled around late 2023 as costs rose more than 20%
          amid supply-chain problems, and in 2024 the developer entity behind
          the project, DTH 215 Venture LLC, filed for bankruptcy. The
          building sat unfinished for roughly a year.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          A <span className="text-lvinit-black">$27.9 million</span> rescue
          loan closed in February 2025, according to court filings, and
          construction resumed &mdash; reported independently at the time by
          KTNV, Fox5 Vegas, and The Real Deal. The building opened to
          residents not long after.
        </p>
      </StorySection>

      <StoryPullQuote cite="Mayor Michelle Romero, City of Henderson, on the Watermark's construction resuming (Feb. 2025)">
        We congratulate DTH 215, Gillett Construction and all involved on the
        last major milestone of this important project. The Watermark will
        be an economic driver for this redevelopment area, and we can&rsquo;t
        wait to soon welcome new residents as well as exciting restaurants
        and retail opportunities to our thriving city center.
      </StoryPullQuote>

      <StorySection heading="Then it went into foreclosure anyway">
        <p className="text-body-lg text-lvinit-warmgray">
          That wasn&rsquo;t the end of the story. This spring, the building
          went into foreclosure &mdash; reported to have carried more than
          $41.5 million in unpaid debt and other costs by the time its
          construction lender moved against it, according to Clark County
          property records. A Southern California multifamily investor,{" "}
          <span className="text-lvinit-black">Next Wave Investors</span>{" "}
          (San Clemente, CA), acquired the building through that process.
          It&rsquo;s a real, independently verifiable firm with a portfolio
          of more than 1,800 residential units across the Western U.S., not a
          shell buyer.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The building is open today under Next Wave&rsquo;s ownership.
          Co-founder David Sloan has said publicly that The Watermark&rsquo;s
          apartments are just over 70% leased, and that his firm was drawn to
          the building&rsquo;s design &mdash; a modern-industrial look with
          exposed concrete. Whatever happened financially behind the scenes,
          the unit itself apparently reads well to renters.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The honest read: a bankruptcy, a rescue loan, an opening, and a
          foreclosure sale is not the arc anyone drew up in 2021. It&rsquo;s
          also, as of today, a finished, leasing, occupied building in a
          district that badly needed one &mdash; just under its third owner
          in five years rather than its first.
        </p>
      </StorySection>

      <StorySection muted heading="What else is actually open on Water Street">
        <p className="text-body-lg text-lvinit-warmgray">
          The Watermark isn&rsquo;t the only real change on the street.{" "}
          <span className="text-lvinit-black">
            Atwell Suites Henderson &ndash; at the Pass
          </span>{" "}
          held its grand opening on November 21, 2024, on the site of the
          former Pass Casino &mdash; a 90-room hotel (57 king rooms, 33
          double-queens) with a pool, fitness center, meeting space, and a
          cocktail lounge called Wine on Water. It&rsquo;s the first hotel
          brand the district has had.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Across from the Watermark, the{" "}
          <span className="text-lvinit-black">America First Center</span>{" "}
          &mdash; the Henderson Silver Knights&rsquo; practice facility and a
          public ice rink &mdash; opened as Lifeguard Arena in November 2020
          and was renamed in June 2023 as part of a multi-year America First
          Credit Union sponsorship deal with Foley Entertainment Group. It
          gives the district a genuine, non-casino draw that has nothing to
          do with any of the apartment or hotel news above.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          And the street&rsquo;s older bones are still there and still
          operating: the Rainbow Club Casino, running since 1967, and the
          Gold Mine Tavern, a neighborhood bar of similar vintage, sit
          alongside mixed-use office/retail buildings like the Corley Center
          (2005) and the Pinnacle (2006). This is genuinely the one part of
          Henderson where a 1960s casino, a 2020s hotel, and a still-leasing
          apartment tower share a single walkable block.
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/water-street-district-henderson-mackenzies-river-streetscape.webp",
            alt: "South Water Street looking down the block toward MacKenzie's River Pub, with newer apartments and street-level retail alongside parked cars",
            caption:
              "MacKenzie's River Pub and the newer apartments and retail alongside it, on South Water Street.",
          },
        ]}
      />

      <StorySection heading="What's still stalled, honestly">
        <p className="text-body-lg text-lvinit-warmgray">
          Not everything announced for Water Street has actually happened.
          The most notable case is{" "}
          <span className="text-lvinit-black">The Waterfalls</span>, a
          planned 22-story tower &mdash; hotel rooms and apartments over
          retail &mdash; proposed for the same district by the same
          developer group behind the Watermark, on a site once earmarked for
          an earlier, never-built project called City Tower. The most recent
          reporting we could independently verify described liens filed
          against the site and construction that hadn&rsquo;t started. We
          could not confirm this run whether that project is still active,
          dead, or restructured as of September 2026, and we&rsquo;re not
          going to guess. If you&rsquo;re looking at Water Street because of
          something you read about a 22-story tower, that tower does not
          exist yet, and its current status is genuinely unclear.
        </p>
      </StorySection>

      <StorySection heading="What this means if you're looking at Henderson">
        <p className="text-body-lg text-lvinit-warmgray">
          If what you want is a walkable, older-feeling street with a real
          history, a hotel, a rink, casinos that have been there for
          decades, and a new apartment building that&rsquo;s actually
          leasing &mdash; Water Street delivers that today, in a city that
          otherwise runs almost entirely on master plans and cul-de-sacs.
          If what you want is a finished, settled downtown with no more
          surprises, know that the district&rsquo;s own recent history
          argues against that: its highest-profile new building has already
          changed hands once under financial duress, and a second major
          tower nearby is stalled with an unclear future. Neither of those
          facts should be hidden from you by a leasing brochure, so we
          aren&rsquo;t hiding them here.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Wikipedia</span>,
            &ldquo;Water Street District (Henderson, Nevada),&rdquo;
            consulted for uncontroversial background: the 1941 water-main
            origin, the district&rsquo;s Ocean Avenue&ndash;Lake Mead Parkway
            boundary, the 1995 Redevelopment Agency, the 2002 branding, and
            the roster of older fixtures (Rainbow Club Casino, Corley Center,
            the Pinnacle). Not used for any current-status fact about the
            Watermark or Waterfalls.{" "}
            <a
              href="https://en.wikipedia.org/wiki/Water_Street_District_(Henderson,_Nevada)"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              en.wikipedia.org
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">ACRES Capital</span>, own
            transaction page for The Watermark &mdash; primary source for the
            $37.5 million 2021 construction loan, Strada Development Group,
            and the itemized unit/retail/restaurant/office square footage.{" "}
            <a
              href="https://acrescap.com/transactions/the-watermark/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              acrescap.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KTNV</span>, &ldquo;Watermark
            building in Henderson secures funding after yearlong delay&rdquo;
            &mdash; source for the February 2025 rescue financing and Mayor
            Michelle Romero&rsquo;s quote.{" "}
            <a
              href="https://www.ktnv.com/news/watermark-building-in-henderson-secures-funding-after-yearlong-delay"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              ktnv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Fox5 Vegas</span>,
            &ldquo;Downtown Henderson project delayed by bankruptcy resumes
            construction,&rdquo; Feb. 21, 2025 &mdash; independent
            corroboration of the construction restart.{" "}
            <a
              href="https://www.fox5vegas.com/2025/02/21/downtown-henderson-project-delayed-by-bankruptcy-resumes-construction/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">The Real Deal</span>,
            &ldquo;Strada secures $28M loan to finish bankrupt Henderson
            project,&rdquo; Feb. 20, 2025 &mdash; third independent source on
            the same financing event.{" "}
            <a
              href="https://therealdeal.com/national/las-vegas/2025/02/20/strada-secures-28m-loan-to-finish-bankrupt-henderson-project/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              therealdeal.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">
              Las Vegas Review-Journal
            </span>
            , &ldquo;Big project on Water Street in downtown Henderson went
            into foreclosure, has new landlord from California&rdquo; &mdash;
            source for the 2026 foreclosure, the debt figure, Next Wave
            Investors, and David Sloan&rsquo;s leasing/design comments. This
            article returned HTTP 403 on direct fetch every time this run
            (a known, previously documented issue with this outlet); the
            facts above were independently cross-checked across multiple
            search passes returning identical figures, plus direct
            confirmation of Next Wave Investors&rsquo; own identity via the
            firm&rsquo;s site and professional profiles.{" "}
            <a
              href="https://www.reviewjournal.com/business/housing/big-project-in-downtown-henderson-went-into-foreclosure-has-new-landlord-3868487/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              reviewjournal.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">PR Newswire</span>,
            &ldquo;DeSimone Gaming Opens Atwell Suites on Historic Water
            Street,&rdquo; cross-checked against IHG&rsquo;s own Atwell
            Suites property page &mdash; source for the Nov. 21, 2024 opening
            date, room count and mix, and hotel amenities.{" "}
            <a
              href="https://www.prnewswire.com/news-releases/desimone-gaming-opens-atwell-suites-on-historic-water-street-302296687.html"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              prnewswire.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">NHL.com</span>
            , Vegas Golden Knights news release, &ldquo;Lifeguard Arena
            Renamed America First Center in Henderson&rdquo; &mdash; source
            for the June 27, 2023 rename and the America First Credit Union
            partnership.{" "}
            <a
              href="https://www.nhl.com/goldenknights/news/lifeguard-arena-renamed-america-first-center-in-henderson-345033366"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              nhl.com
            </a>
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Ownership, financing, and construction status can change quickly on
          any individual project, as the Watermark&rsquo;s own history above
          shows twice over. Figures reflect the sources and dates cited and
          should not be treated as guaranteed current status. This article is
          general local reporting, not financial, lending, or investment
          advice.
        </p>
      </StorySection>

      <StorySection heading="About this coverage">
        <p className="text-body text-lvinit-warmgray">
          LVINIT Editorial · The Scofield Group · Nevada License S.0175577.
          Equal Housing Opportunity.
        </p>
      </StorySection>
    </StoryPage>
  );
}
