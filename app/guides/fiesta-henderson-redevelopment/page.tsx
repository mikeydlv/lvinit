import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import Container from "@/components/ui/Container";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryPullQuote,
} from "@/components/story";

// ---------------------------------------------------------------------------
// LOCAL FEATURE — "The Fiesta Henderson site." Built via the autonomous
// scheduled editorial-publishing routine. Grepped for "Fiesta Henderson,"
// "Agora Realty," and "Lake Mead Parkway" before writing — the only prior
// LVINIT mentions are the Henderson pillar guide's own Development Watch
// entry (which explicitly said an announcement was expected "in fall 2026")
// and one unrelated background sentence in the One Civic Center guide about
// Agora's *other* project, Hylo Park, on the former Texas Station/Fiesta
// RANCHO site in North Las Vegas — a different property with a similar name,
// not this one. This piece is the follow-through on the Henderson guide's
// own prediction, not a duplicate of anything already published.
//
// FACT DISCIPLINE (read before editing) — every figure below is sourced to
// the "Sources" section at the foot of the article and was independently
// verified this run via direct fetch of the primary reporting (not a search
// summary). Do not add, round, or infer anything beyond what is listed here.
//
// - Primary sources (both filed from the same Sept 8, 2026 news conference,
//   fetched and read in full this run):
//   - Las Vegas Review-Journal, Eli Segall, "Former casino site in Henderson
//     penciled for big redevelopment project," Sept 8, 2026.
//   - Las Vegas Sun, Hillary Davis, "Transformed site of former Fiesta
//     Henderson will include sports complex," Sept 8, 2026.
// - Corroborating background on the site's history: Wikipedia's "Fiesta
//   Henderson" entry (opened Feb 10, 1998 as "The Reserve" under Ameristar
//   Casinos; Station Casinos took over Jan 30, 2001 and rebranded it Fiesta
//   Henderson after a $12M renovation, reopening Dec 29, 2001; demolition
//   began Sept 12, 2022) — used only for uncontroversial historical color
//   that doesn't conflict with the RJ/Sun reporting, not for anything about
//   the current deal.
// - News 3 Las Vegas (KSNV), "City of Henderson passes motion to purchase
//   site of Fiesta Henderson Casino" (Dec. 2022) — fetched this run (2026-09-
//   13) solely to pin the exact date of the city's $32M purchase vote
//   (unanimous, Tuesday, Dec. 13, 2022) for the new timeline graphic and the
//   "December 2022" references below; corroborated against a Fox5 Vegas
//   article from the same week. Not used for anything about the current deal.
// - The deal: City of Henderson has an agreement in principle to sell the
//   35-acre former Fiesta Henderson site (Lake Mead Parkway at the 215
//   Beltway/I-11 interchange, just west of downtown Henderson) to Agora
//   Realty & Management Inc. (California-based) for $30 million. Agora would
//   fund construction, retain ownership, and manage/operate the finished
//   project. The city itself paid $32 million for the same site on Dec. 13,
//   2022 (unanimous Henderson City Council vote), buying it from Station
//   Casinos after the casino was demolished.
// - The plan: a 150,000-square-foot indoor fieldhouse (10 basketball courts,
//   20 volleyball courts, 10,000 sq ft of batting cages) anchoring a
//   youth/tournament sports complex, plus outdoor sports fields, a hotel,
//   75,000 sq ft of retail and dining, 30,000 sq ft of office space, and
//   green open space/plazas.
// - Status: explicitly NOT approved yet. Aaron Lefton, Agora's president of
//   acquisitions and leasing, told the RJ this is "a conceptual plan at this
//   point" — development timeline and costs are still being worked out, and
//   Agora still needs city approval for both the real-estate purchase and
//   the project plans. The next milestone (per the Sun) is a public hearing
//   on the purchase-and-sale agreement and development agreement, to be
//   scheduled at a future Henderson City Council meeting — no date given.
// - Real, attributed quotes: Cary Lefton, Agora founder/CEO (the "vibrant
//   sports anchor destination" and "major indoor tournament sports facility"
//   lines, from the Sun); Aaron Lefton, Agora president of acquisitions and
//   leasing ("This location is incredible," and the "conceptual plan"
//   characterization, from the RJ); Mayor Michelle Romero (the "ideal
//   gateway," "lost restaurants, entertainment" and "new destination" lines,
//   from the Sun).
// - History: Henderson named Utah-based Woodbury Corp. as its developer of
//   choice for this site in summer 2024 and entered a 180-day exclusive
//   negotiation agreement; those talks fell apart (RJ). This is the site's
//   SECOND named developer, not its first attempt.
// - Deliberately NOT used: a "$108M" total project cost figure that surfaced
//   in several radio-station aggregator posts (coyotecountrylv.com,
//   x1075lasvegas.com, 963kklz.com) republishing what reads like a shared
//   wire writeup. None of those pages were fetchable this run (403s) to
//   check their own sourcing, and the figure directly contradicts the RJ's
//   on-the-record quote that "the development timeline and costs are still
//   being hashed out." Rather than publish a number the primary reporting
//   explicitly says doesn't exist yet, it's omitted here. Also not used: a
//   Hoodline breakdown claiming the city's 2022 purchase was funded as "$30M
//   redevelopment funds + $2M city land fund" — plausible, but not
//   independently confirmed in the RJ or Sun accounts, so left out rather
//   than stated as fact.
// - Deliberately NOT confused with: the separate, already-under-construction
//   "West Henderson Fieldhouse" (180,000 sq ft, ~$70M, city + KemperSports
//   public-private partnership, broke ground May 2025 near St. Rose Pkwy and
//   Maryland Pkwy, opening targeted fall 2026) — a different project, a
//   different site, a different funding structure, already covered in
//   LVINIT's Henderson pillar guide's own Development Watch. The two
//   projects share almost nothing but a city and a sport-facility premise,
//   and conflating them would be a real factual error, not a simplification.
//
// IMAGERY — C:\LVINIT\Images was checked for and is not reachable from this
// Linux cloud session (it's a path on Mikey's local Windows machine). No
// existing repo photography depicts this specific site — an empty lot with a
// standing parking garage, no construction yet, no rendering LVINIT has the
// rights to use. Per the standard fallback order, this piece carries a
// generated LVINIT editorial cover (registered in lib/content.ts as the card
// image only, imageMode "editorial-cover") and a photoless StoryHero — never
// a stand-in photo of Henderson generally, and never the site's own official
// renderings, which are the city's/Agora's copyrighted concept art, not
// LVINIT's to publish.
//   node scripts/generate-guide-cover.mjs --slug fiesta-henderson-redevelopment \
//     --category "Local Feature" --subject "Fiesta Henderson Site" \
//     --out fiesta-henderson-editorial-cover.webp
//   -> public/images/covers/fiesta-henderson-editorial-cover.webp
//
// On 2026-09-13, Mikey supplied three AI-generated graphics directly and
// explicitly approved bypassing CLAUDE.md's no-AI-imagery default for this
// one piece, on the condition the AI-rendered concept illustration carries an
// explicit disclosure caption (his call, after the disclosure requirement was
// flagged back to him). None of the three are real photography, none are the
// city's/Agora's actual copyrighted renderings, and none carry a photo credit
// (his request). Every factual detail baked into the timeline graphic (the
// March 2020 closure, the Sept. 2022 demolition, the Dec. 2022 $32M purchase,
// the summer 2024 Woodbury Corp. selection, and the Sept. 8, 2026 Agora
// announcement) was independently re-verified this run against the same
// primary sources above plus the City of Henderson's own Dec. 2022 purchase
// announcement and contemporaneous local coverage — see Sources. Filenames:
//   public/images/features/fiesta-henderson-site-location-map.webp
//   public/images/features/fiesta-henderson-redevelopment-timeline-graphic.webp
//   public/images/features/fiesta-henderson-ai-concept-illustration.webp
// The illustration's on-image signage ("Henderson Commons" etc.) is the AI
// generator's invention, not an announced project name — the article body
// and its caption both say so explicitly (see "What to watch next").
//
// Later the same day, Mikey asked for the concept illustration to be used as
// the StoryHero image too (it had only been an inline figure), because the
// photoless hero felt "blank." Flagged back to him that the hero has no
// caption slot, so a full-bleed illustration under a headline about "what's
// real" risked reading as documentary proof of a specific design — agreed
// approach: use it as the hero AND keep a visible (not just alt-text)
// disclosure notice immediately below the hero, before the lede. The
// formerly-duplicate inline copy of this image inside "What's actually
// planned" was removed since the hero now carries it. The card image in
// lib/content.ts is intentionally UNCHANGED (still the generated editorial
// cover) — only the hero was requested.
// ---------------------------------------------------------------------------

const PATH = "/guides/fiesta-henderson-redevelopment";

const meta: StoryMeta = {
  title:
    "The Fiesta Henderson Site Finally Has a Plan — What's Real, What Isn't | LVINIT",
  headline:
    "The Fiesta Henderson Site Finally Has a Plan. Here's What's Real, and What Isn't Yet",
  description:
    "Henderson and a California developer unveiled plans for a youth sports complex, hotel, and retail on the 35-acre former Fiesta Henderson casino site. Here's what's actually confirmed, and what's still just a concept.",
  path: PATH,
  datePublished: "2026-09-13",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "The Fiesta Henderson Site", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

function Figure({
  src,
  width,
  height,
  alt,
  label,
  caption,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
  label?: string;
  caption: string;
}) {
  return (
    <figure className="my-8">
      <div className="overflow-hidden rounded-lg border border-lvinit-lightgray bg-lvinit-lightgray">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(max-width: 768px) 100vw, 680px"
          className="h-auto w-full"
        />
      </div>
      <figcaption className="mt-3">
        {label && (
          <span className="block text-caption uppercase tracking-wide text-lvinit-blue">
            {label}
          </span>
        )}
        <span className={`block text-caption text-lvinit-warmgray ${label ? "mt-1" : ""}`}>
          {caption}
        </span>
      </figcaption>
    </figure>
  );
}

type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "35 acres",
    label: "The site",
    note: "Lake Mead Parkway at the 215 Beltway/I-11 interchange, just west of downtown Henderson",
  },
  {
    value: "$30M",
    label: "What Agora would pay the city",
    note: "The city itself paid $32M for the same land in December 2022",
  },
  {
    value: "150,000 sq ft",
    label: "Planned indoor fieldhouse",
    note: "10 basketball courts, 20 volleyball courts, 10,000 sq ft of batting cages",
  },
  {
    value: "Not yet approved",
    label: "Current status",
    note: "Agora's own leasing president called it a conceptual plan; no city council hearing has been scheduled",
  },
];

function SnapshotPanel() {
  return (
    <section
      id="by-the-numbers"
      aria-label="Fiesta Henderson site snapshot"
      className="scroll-mt-24"
    >
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            The Fiesta Henderson site, by the numbers
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            What was actually announced at the Sept. 8, 2026 news conference.
            See the sources at the end of this article for the full reporting.
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

          <p className="mt-6 max-w-[680px] text-caption text-lvinit-warmgray">
            No purchase has closed and no groundbreaking has happened. This is
            a conceptual plan and an announced negotiation, not a project
            under construction.
          </p>
        </div>
      </Container>
    </section>
  );
}

export default function FiestaHendersonRedevelopmentPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Local Feature",
        headline:
          "The Fiesta Henderson Site Finally Has a Plan. Here's What's Real, and What Isn't Yet",
        subheadline:
          "Henderson and a California developer unveiled plans for a youth sports complex, hotel, and retail on the empty 35-acre lot at the gateway to downtown. It's the site's second named developer in two years, and by the developer's own admission, still a concept rather than an approved project.",
        // Mikey-supplied AI-generated illustration, added 2026-09-13 with his
        // explicit approval to bypass CLAUDE.md's no-AI-imagery default for
        // this one piece — not a real photograph, not Agora's or Henderson's
        // actual rendering, no photo credit per his request. See the visible
        // disclosure notice rendered immediately below the hero.
        image: "/images/features/fiesta-henderson-ai-concept-illustration.webp",
        imageAlt:
          "AI-generated illustration imagining a mixed-use sports, hotel, and retail development on the former Fiesta Henderson site — not an official rendering",
        backLink: { label: "LVINIT", href: "/" },
        ctas: [
          { label: "See the numbers", href: "#by-the-numbers", variant: "primary" },
        ],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "The Fiesta Henderson site is one of several Southern Nevada development stories LVINIT is tracking closely — here's how it compares to two others.",
        stories: [
          {
            name: "Living in Henderson",
            href: "/neighborhoods/henderson",
            category: "Area Guide",
            dek: "The full guide to Henderson's communities, including the Historic Henderson/Water Street area this site sits at the edge of.",
          },
          {
            name: "One Civic Center: What's Actually Happening at North Las Vegas's Old City Hall Site",
            href: "/guides/one-civic-center-north-las-vegas-redevelopment",
            category: "Local Feature",
            dek: "Same developer, Agora Realty & Management, redeveloping a different empty government-adjacent site in a different city — useful contrast for how these deals tend to unfold.",
          },
          {
            name: "Henderson vs. Southwest Las Vegas: Where Should You Actually Move?",
            href: "/guides/henderson-vs-southwest-las-vegas",
            category: "Comparisons",
            dek: "Zoom back out to how Henderson compares as a whole to the valley's other big growth corridor.",
          },
        ],
      }}
      relatedNeighborhood={{
        name: "Henderson",
        href: "/neighborhoods/henderson",
        kicker: "The parent guide",
        heading: "Read the Henderson guide",
        blurb:
          "The Fiesta Henderson site sits right at the edge of the Historic Henderson/Water Street area our full Henderson guide already covers, and its Development Watch section has been tracking this exact site since before this announcement.",
      }}
      ctas={{
        heading: "Weighing Henderson for your next move?",
        body:
          "Nothing at the Fiesta Henderson site is buyable, leasable, or even approved yet, but a city investing in one of its most visible empty lots is worth knowing about if you're looking anywhere near downtown Henderson. Tell me what you're weighing and I'll give you the honest read on where this fits.",
      }}
    >
      <div className="border-b border-lvinit-lightgray bg-lvinit-lightgray/40">
        <Container className="py-4">
          <p className="mx-auto max-w-[680px] text-caption text-lvinit-warmgray">
            <span className="font-bold uppercase tracking-wide text-lvinit-blue">
              AI-generated illustration —{" "}
            </span>
            the image above is an LVINIT-commissioned illustration imagining
            what a sports-anchored, mixed-use project could look like. It is
            not a rendering released by Agora Realty &amp; Management or the
            City of Henderson. No building layout, signage, or project name
            has actually been announced — see &ldquo;What&rsquo;s actually
            planned&rdquo; below for what&rsquo;s confirmed.
          </p>
        </Container>
      </div>

      <StoryLede
        kicker="Local Feature"
        lead="For most of the last six years, the 35 acres where Fiesta Henderson used to sit have been the kind of empty lot you stop noticing — a demolished casino, a lonely parking garage, and a chain-link fence at one of the busiest interchanges in the city. On September 8, 2026, Henderson officials and a California real estate firm stood on that lot and announced a plan to change that: a youth sports complex, a hotel, and retail, anchored by a 150,000-square-foot fieldhouse."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Our{" "}
          <Link
            href="/neighborhoods/henderson"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Henderson guide
          </Link>{" "}
          has been tracking this exact site for months, flagging it as
          &ldquo;planned&rdquo; and noting the city expected an announcement
          &ldquo;in fall 2026.&rdquo; That announcement came a couple of weeks
          early. Here&rsquo;s what was actually said, what it would cost, and
          why the developer himself is careful to call it a concept rather
          than a done deal.
        </p>
      </StoryLede>

      <StorySection heading="The deal: Agora would pay $30 million for land the city bought for $32 million">
        <p className="text-body-lg text-lvinit-warmgray">
          The Las Vegas Review-Journal and the Las Vegas Sun both reported
          from the same Sept. 8 news conference: the city of Henderson has an
          agreement in principle to sell the 35-acre former Fiesta Henderson
          site to{" "}
          <span className="text-lvinit-black">
            Agora Realty &amp; Management Inc.
          </span>
          , a California-based firm, for{" "}
          <span className="text-lvinit-black">$30 million</span>. Agora would
          fund construction of the project, retain ownership of it, and manage
          and operate the finished facility itself.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That $30 million is actually a modest discount from what the city
          itself paid. The Henderson City Council approved a{" "}
          <span className="text-lvinit-black">$32 million</span> purchase of
          the same land from Station Casinos in December 2022, after the
          locals-focused casino chain demolished the shuttered hotel-casino.
          Station had closed Fiesta Henderson permanently in March 2020, at
          the start of the pandemic casino shutdowns, and razed the hotel
          tower in 2022 — though the parking garage is still standing on the
          site today.
        </p>
        <Figure
          src="/images/features/fiesta-henderson-site-location-map.webp"
          width={1600}
          height={686}
          alt="Map showing the former Fiesta Henderson site at Lake Mead Parkway and the 215 Beltway/I-11 interchange in Henderson, Nevada"
          label="LVINIT editorial map"
          caption="The 35-acre site sits at Lake Mead Parkway and the 215 Beltway/I-11 interchange, at the edge of downtown Henderson."
        />
      </StorySection>

      <SnapshotPanel />

      <StorySection heading="What's actually planned: a fieldhouse, a hotel, and a lot of courts">
        <p className="text-body-lg text-lvinit-warmgray">
          The centerpiece is a{" "}
          <span className="text-lvinit-black">
            150,000-square-foot indoor fieldhouse
          </span>{" "}
          with{" "}
          <span className="text-lvinit-black">
            10 basketball courts, 20 volleyball courts, and 10,000 square
            feet of batting cages
          </span>
          . Around it, the plan calls for outdoor sports fields, a hotel,{" "}
          <span className="text-lvinit-black">
            75,000 square feet of retail and dining
          </span>
          , another{" "}
          <span className="text-lvinit-black">
            30,000 square feet of office space
          </span>
          , and green open space and plazas. It&rsquo;s a genuinely large
          program for one 35-acre parcel — closer in scale to a small
          mixed-use district than a single building.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Community input has consistently pointed this direction. Henderson
          collected thousands of survey responses and public-meeting comments
          over the years this site sat empty, and residents repeatedly ranked
          an indoor sports facility, hospitality, and family-oriented
          entertainment at the top of their wish list. Whatever else changes
          about this plan before it&rsquo;s built, the sports-anchor concept
          itself reflects what Henderson actually asked for.
        </p>
      </StorySection>

      <StoryPullQuote cite="Cary Lefton, founder and CEO, Agora Realty & Management">
        Our vision is to transform this property into a vibrant sports anchor
        destination built around activity, community and various experiences.
      </StoryPullQuote>

      <StorySection heading="Read the fine print: this is a concept, not an approval">
        <p className="text-body-lg text-lvinit-warmgray">
          It would be easy to read a news conference with a mayor, a
          developer, and site renderings as a done deal. It isn&rsquo;t one.
          Aaron Lefton, Agora&rsquo;s president of acquisitions and leasing,
          told the Review-Journal directly that this is{" "}
          <span className="text-lvinit-black">
            &ldquo;a conceptual plan at this point&rdquo;
          </span>{" "}
          — the development timeline and the project&rsquo;s costs are still
          being worked out, and Agora still has to secure city approval for
          both the real-estate purchase itself and the project plans. The
          next concrete milestone, per the Sun, is a public hearing on the
          purchase-and-sale agreement and a development agreement, to be
          scheduled at a future Henderson City Council meeting — no date has
          been set.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Worth noting, too: no total project cost has been confirmed
          anywhere in the primary reporting on this announcement. A few
          outlets circulated a $108 million figure in their headlines this
          week, but neither the Review-Journal nor the Sun&rsquo;s own
          coverage of the same news conference includes that number, and it
          directly conflicts with Agora&rsquo;s own statement that costs are
          still being hashed out. We&rsquo;re not repeating it here until it
          shows up in reporting that actually explains where it came from.
        </p>
      </StorySection>

      <StorySection heading="This site has been here before">
        <p className="text-body-lg text-lvinit-warmgray">
          Agora is not the first developer Henderson has picked for this lot.
          In summer 2024, the city named Utah-based{" "}
          <span className="text-lvinit-black">Woodbury Corp.</span> as its
          developer of choice and entered a 180-day exclusive negotiation
          agreement covering a plan with restaurants, retail, hotels,
          residential, medical office space, and an indoor sports complex of
          its own. Those talks eventually fell apart, and the site sat
          undeveloped for another two years while the city restarted its
          search. That history is the honest reason to treat this
          announcement as a real step forward and not the finish line — the
          last time Henderson stood up a developer for this exact lot, it
          didn&rsquo;t stick.
        </p>
        <Figure
          src="/images/features/fiesta-henderson-redevelopment-timeline-graphic.webp"
          width={1122}
          height={1402}
          alt="Timeline graphic of the former Fiesta Henderson site: closure in March 2020, demolition in September 2022, the city's $32 million purchase in December 2022, Woodbury Corp. named developer in summer 2024, those talks falling apart in 2025-2026, and Agora Realty's September 8, 2026 concept announcement"
          label="LVINIT editorial timeline"
          caption="Every date and figure above is independently sourced — see the Sources section at the end of this article. Concept announced; not yet approved."
        />
      </StorySection>

      <StoryPullQuote cite="Mayor Michelle Romero, City of Henderson">
        Its prominent location serves as the ideal gateway into downtown and
        East Henderson, and we wanted to have a say in what would ultimately
        be developed here.
      </StoryPullQuote>

      <StorySection muted heading="Don't confuse this with the other Henderson fieldhouse">
        <p className="text-body-lg text-lvinit-warmgray">
          If &ldquo;Henderson&rdquo; and &ldquo;fieldhouse&rdquo; sound
          familiar for a different reason, you&rsquo;re not wrong to be
          confused — there are genuinely two separate indoor sports projects
          moving through Henderson at the same time, on opposite sides of the
          city. The{" "}
          <span className="text-lvinit-black">West Henderson Fieldhouse</span>{" "}
          is a 180,000-square-foot venue near St. Rose Parkway and Maryland
          Parkway, built as a roughly $70 million public-private partnership
          between the city and KemperSports, which broke ground in May 2025
          and is targeting a fall 2026 opening. It has nothing to do with the
          Fiesta Henderson site, doesn&rsquo;t share a developer, and isn&rsquo;t
          part of this deal. This piece is about the other one — the one that
          doesn&rsquo;t have a name yet, sits at Lake Mead Parkway and the
          215/I-11 interchange, and exists only as a concept so far.
        </p>
      </StorySection>

      <StorySection heading="Why the same developer keeps showing up in these stories">
        <p className="text-body-lg text-lvinit-warmgray">
          Agora Realty &amp; Management isn&rsquo;t a new name on LVINIT.
          We&rsquo;ve already covered the firm&rsquo;s redevelopment of{" "}
          <Link
            href="/guides/one-civic-center-north-las-vegas-redevelopment"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            North Las Vegas&rsquo;s old City Hall site
          </Link>
          , and per the Review-Journal, the firm also has Hylo Park (the
          former Texas Station/Fiesta Rancho site) and a Nevada State
          University satellite-campus lease underway in North Las Vegas. That
          track record is background context, not evidence about how the
          Fiesta Henderson project itself turns out — a developer&rsquo;s
          activity elsewhere in the valley doesn&rsquo;t guarantee any one
          deal closes on schedule, and this is a different city with its own
          council and its own approval process. But it does mean Agora is a
          firm actively assembling a portfolio of these public-land
          redevelopment deals across Southern Nevada right now, which is
          useful to know if you&rsquo;re trying to read where the next one
          might land.
        </p>
      </StorySection>

      <StorySection heading="What this means if you're watching Henderson">
        <p className="text-body-lg text-lvinit-warmgray">
          If you already live near Water Street or the Lake Mead Parkway
          corridor, this is a real project to watch — a filled-in gateway lot
          changes how that stretch of the city feels to drive, whenever it
          actually happens. If you&rsquo;re considering buying in that part
          of Henderson specifically because of this announcement, slow down.
          Nothing here is entitled, nothing is under construction, and this
          exact site has already burned one announced developer before
          delivering anything. Treat this the way we&rsquo;d tell you to
          treat any conceptual plan: interesting, worth tracking, and not
          yet a reason to change a decision about where to live.
        </p>
      </StorySection>

      <StorySection heading="What to watch next">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue"
            />
            <span>
              Whether the purchase-and-sale agreement and development
              agreement actually get scheduled for a Henderson City Council
              hearing, and whether the council approves them.
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue"
            />
            <span>
              A real project cost and timeline, once Agora and the city
              finish working those out — not the unconfirmed figure
              circulating in some headlines this week.
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue"
            />
            <span>
              A formal project name — this piece and the initial coverage
              both refer to it only by the site&rsquo;s old name, Fiesta
              Henderson.
            </span>
          </li>
          <li className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue"
            />
            <span>
              Whether this developer relationship holds up better than the
              2024 Woodbury Corp. agreement did.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">
              Las Vegas Review-Journal
            </span>
            , Eli Segall, &ldquo;Former casino site in Henderson penciled for
            big redevelopment project,&rdquo; published September 8, 2026 —
            primary source for the deal terms, purchase price, the
            &ldquo;conceptual plan&rdquo; status, the Woodbury Corp. history,
            and Agora&rsquo;s other North Las Vegas projects.{" "}
            <a
              href="https://www.reviewjournal.com/local/henderson/former-casino-site-in-henderson-penciled-for-big-redevelopment-project-3883686/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              reviewjournal.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Las Vegas Sun</span>, Hillary
            Davis, &ldquo;Transformed site of former Fiesta Henderson will
            include sports complex,&rdquo; published September 8, 2026 —
            primary source for the fieldhouse specifications, the retail and
            office square footage, and the Cary Lefton and Mayor Romero
            quotes.{" "}
            <a
              href="https://lasvegassun.com/news/2026/sep/08/transformed-site-of-former-fiesta-henderson-will-i/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              lasvegassun.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Wikipedia</span>, &ldquo;Fiesta
            Henderson,&rdquo; consulted for uncontroversial background on the
            site&rsquo;s opening (1998, as The Reserve), 2001 rebrand, and
            2022 demolition date — background color only, not used for any
            fact about the current deal.{" "}
            <a
              href="https://en.wikipedia.org/wiki/Fiesta_Henderson"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              en.wikipedia.org
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">News 3 Las Vegas (KSNV)</span>,
            &ldquo;City of Henderson passes motion to purchase site of Fiesta
            Henderson Casino,&rdquo; December 2022 — consulted to confirm the
            exact date of the city&rsquo;s $32 million purchase vote (Tuesday,
            December 13, 2022), cited above and in the timeline graphic.{" "}
            <a
              href="https://news3lv.com/news/local/city-of-henderson-passes-motion-to-purchase-site-of-fiesta-henderson-casino"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              news3lv.com
            </a>
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Development plans can change substantially between a conceptual
          announcement and an approved, built project — as this exact site
          already demonstrated once. Figures above reflect the sources and
          dates cited and should not be treated as a guarantee of the final
          project. This article is general local reporting, not financial,
          lending, or investment advice.
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
