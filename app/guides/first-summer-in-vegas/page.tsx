import type { Metadata } from "next";
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
// MOVING HERE — "Surviving Your First Las Vegas Summer." A house piece
// (byline: LVINIT Editorial, not a personal Mikey story) filling the second
// remaining homepage guide slot in lib/content.ts. Photoless hero on purpose —
// no real photo exists for this topic; the homepage card keeps using the
// existing neutral stand-in at /images/guide-first-summer-in-vegas.jpg.
//
// FACT DISCIPLINE (read before editing):
// - Monthly climate normals (1991-2020) and the all-time record high are from
//   NWS Las Vegas' own "Temperature Overview" document (weather.gov/media/vef/
//   Temperature%20Overview.pdf), corroborated by the NWS Las Vegas climate page
//   at weather.gov/vef. June 99.4/75.8, July 104.5/82.0 (hottest month), August
//   102.8/80.6, September 94.9/72.4 (all °F, avg high/avg low). Record high:
//   120°F on July 7, 2024. Do not round or adjust these.
// - Monsoon window: NWS Las Vegas (@NWSVegas) frames it as June 15-September 30
//   valley-wide, with Southern Nevada's locally active window roughly
//   July 1-September 30 and peak thunderstorm/flash-flood activity mid-July
//   through late August. The real risks to name are dust storms (haboobs),
//   flash flooding in washes/underpasses, and lightning — not "occasional
//   rain."
// - Clark County cooling stations: official, ongoing 2026 program, activated
//   at recreation centers/libraries/community centers valley-wide (Las Vegas,
//   North Las Vegas, Henderson, Boulder City, Laughlin, Mesquite) in response
//   to NWS extreme-heat warnings. Cited activations: Aug 18-21, 2026 (most
//   recent), Aug 6-11, 2026, and July 20-24, 2026. Some locations are
//   pet-friendly (leash/carrier). Full current list lives at
//   clarkcountynv.gov — do not list specific locations here since they change.
// - Heat-safety framing: Las Vegas Review-Journal, July 24, 2026 — Clark County
//   coroner's office documented at least 800 heat-related deaths in Clark
//   County combined across 2024-2025. Same article cites a Desert Research
//   Institute Nevada Heat Lab survey of 489 people across 37 cooling stations
//   (summer 2025) finding many residents don't know where cooling stations are
//   or how to use free-bus-pass transit to reach them. This is a Clark County
//   population-wide figure (many cases involve unhoused/vulnerable residents,
//   outdoor exposure, or no AC) — NOT a claim about homeowners specifically.
//   Present factually, once, without dramatizing it further.
// - No dollar figures for utility bills or AC repair/replacement are cited
//   anywhere in this piece — none were verified, so none are invented.
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title: "Surviving Your First Las Vegas Summer | LVINIT",
  headline: "Surviving Your First Las Vegas Summer",
  description:
    "The practical version, not the panicked version: what Las Vegas summer heat and monsoon season actually involve, and how to prepare a home, a car, and a routine for it.",
  path: "/guides/first-summer-in-vegas",
  datePublished: "2026-08-23",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    {
      name: "Surviving Your First Las Vegas Summer",
      path: "/guides/first-summer-in-vegas",
    },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

// Verified NWS Las Vegas climate normals (1991-2020) — see fact-discipline note.
type MonthStat = { month: string; high: string; low: string; note?: string };

const CLIMATE: MonthStat[] = [
  { month: "June", high: "99.4°F", low: "75.8°F" },
  { month: "July", high: "104.5°F", low: "82.0°F", note: "hottest month" },
  { month: "August", high: "102.8°F", low: "80.6°F" },
  { month: "September", high: "94.9°F", low: "72.4°F" },
];

function ClimateSnapshot() {
  return (
    <section
      id="the-numbers"
      aria-label="Las Vegas summer climate normals"
      className="scroll-mt-24"
    >
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            What &ldquo;hot&rdquo; actually means, month by month
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            These are the National Weather Service&rsquo;s official 30-year
            climate normals (1991&ndash;2020) for Las Vegas &mdash; the
            average high and low for each month, not a worst-case scenario.
          </p>

          <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-lvinit-lightgray bg-lvinit-lightgray sm:grid-cols-2 lg:grid-cols-4">
            {CLIMATE.map((m) => (
              <div key={m.month} className="bg-lvinit-white p-6">
                <dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                  {m.month}
                  {m.note ? ` · ${m.note}` : ""}
                </dt>
                <dd className="mt-2 font-display text-heading font-bold text-lvinit-blue">
                  {m.high}
                </dd>
                <p className="mt-2 text-caption text-lvinit-warmgray">
                  avg. low {m.low}
                </p>
              </div>
            ))}
          </dl>

          <p className="mt-6 max-w-[680px] text-body text-lvinit-warmgray">
            Those are averages, not ceilings. Las Vegas&rsquo; all-time record
            high &mdash; <span className="text-lvinit-black">120°F</span>,
            set July 7, 2024 &mdash; is the reminder that a normal July can
            still produce an abnormal week. Plan for the averages; don&rsquo;t
            be surprised by the outliers.
          </p>
        </div>
      </Container>
    </section>
  );
}

export default function FirstSummerInVegasPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Moving Here",
        headline: "Surviving Your First Las Vegas Summer",
        subheadline: "The practical version, not the panicked version.",
        backLink: { label: "LVINIT", href: "/" },
        ctas: [{ label: "See the numbers", href: "#the-numbers", variant: "primary" }],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "More practical ground for people getting settled here, and a couple of neighborhoods worth seeing for yourself before the heat sets your schedule.",
        stories: [
          {
            name: "What $500K Buys in Las Vegas",
            href: "/guides/what-500k-buys-in-las-vegas",
            category: "Buyer guide",
            dek: "Three real home tours near the same price — a concrete look at the tradeoffs behind the median.",
          },
          {
            name: "Summerlin",
            href: "/neighborhoods/summerlin",
            category: "Area guide",
            dek: "Established master-planned streets with real tree canopy and trail access before sunrise matters most.",
          },
          {
            name: "Southwest Las Vegas",
            href: "/neighborhoods/southwest-las-vegas",
            category: "Area guide",
            dek: "The valley's fastest-growing side — and a good example of what newer construction hasn't grown into yet: shade.",
          },
        ],
      }}
      ctas={{
        heading: "Getting ready for your first Las Vegas summer?",
        body:
          "Whether you're still deciding where to land or already evaluating a specific home, I'm happy to walk through what a property's AC, orientation, and location actually mean for you day to day.",
      }}
    >
      <StoryLede
        kicker="Moving Here"
        lead="Every longtime Las Vegan remembers their first real summer here — the one where the forecast stops being a number you glance at and starts being a variable you plan a day around. This isn't that story dressed up for drama. It's the practical version: what the heat actually does month to month, what monsoon season means beyond 'it might rain,' and what to actually change about how you live."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          None of this is meant to scare anyone off. People live full, active,
          outdoor lives here every summer — they just adjust the schedule and
          take a few things seriously that newer residents sometimes don&rsquo;t
          know to.
        </p>
      </StoryLede>

      <ClimateSnapshot />

      <StorySection heading="The monsoon season most newcomers don't see coming">
        <p className="text-body-lg text-lvinit-warmgray">
          Ask a new arrival what worries them about a Vegas summer and
          they&rsquo;ll usually say the dry heat. Fewer expect the monsoon.
          The National Weather Service frames Southern Nevada&rsquo;s monsoon
          window as running June 15 through September 30, with the valley
          typically seeing its own active stretch from around July 1 through
          the end of September and the heaviest thunderstorm activity landing
          mid-July through late August.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          What that actually looks like on the ground isn&rsquo;t a gentle
          afternoon shower. It&rsquo;s a wall of dust &mdash; a haboob &mdash;
          rolling across the valley with almost no warning, cutting visibility
          on the freeway to nearly nothing. It&rsquo;s a wash or an underpass
          that&rsquo;s bone dry all year suddenly running with fast-moving
          water, which is exactly why Clark County&rsquo;s flash-flood
          messaging is so blunt about never driving into water on a road you
          can&rsquo;t see the bottom of. And it&rsquo;s lightning &mdash; real,
          frequent, valley-wide lightning, which is not something most desert
          newcomers associate with a place this dry.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The practical takeaway: when a storm rolls through in July or
          August, treat it like the genuine hazard it is &mdash; pull over in
          a dust storm rather than trying to outdrive it, and never cross a
          flooded roadway, no matter how familiar the street usually is.
        </p>
      </StorySection>

      <StoryPullQuote>
        The heat is the headline. The monsoon is the plot twist nobody warned
        you about.
      </StoryPullQuote>

      <StorySection heading="The habits that actually change here">
        <p className="text-body-lg text-lvinit-warmgray">
          Most of this is common sense, but it&rsquo;s common sense that only
          becomes automatic once you&rsquo;ve lived a summer here. A few
          things worth building into your routine early:
        </p>
        <ul className="mt-5 space-y-4 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Air conditioning is a
              utility, not a luxury.</span> Treat it the way you&rsquo;d treat
              heat in a cold-climate winter. Get it serviced before summer
              hits its stride, not after it stops keeping up &mdash; a system
              that quietly struggles in June can fail outright by August.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Cars turn into ovens fast.</span>{" "}
              Never leave kids or pets in a parked car, even &ldquo;just for a
              minute&rdquo; with the windows cracked. Check the back seat as a
              habit, every time.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Move your outdoor hours,
              not your outdoor life.</span> Hikes, runs, and yard work belong
              in the early morning here, not the afternoon. Watching a
              Summerlin trailhead parking lot fill up before sunrise and empty
              out by 9am tells you everything about how locals actually time
              their day.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Hydration and sun
              protection stop being optional.</span> Water in the car, water
              on the trail, and real sun protection &mdash; hat, sunglasses,
              sunscreen &mdash; even on an overcast-feeling day, because the
              UV exposure doesn&rsquo;t take a day off just because it doesn&rsquo;t
              feel like 105°F yet.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Check on people, not just
              yourself.</span> Elderly neighbors, anyone new to the desert, and
              anyone whose AC you know is unreliable are worth an actual
              check-in during a heat spell &mdash; a text or a knock on the
              door is a small thing that matters here.
            </span>
          </li>
        </ul>
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          None of this is medical advice &mdash; it&rsquo;s just how people
          who&rsquo;ve done a few of these summers actually operate.
        </p>
      </StorySection>

      <StorySection
        muted
        heading="Why &ldquo;survive&rdquo; isn't just a headline word"
      >
        <p className="text-body-lg text-lvinit-warmgray">
          Clark County runs an active cooling-station program every summer
          &mdash; emergency daytime cooling sites at recreation centers,
          libraries, and community centers across the valley, from Las Vegas
          and North Las Vegas to Henderson, Boulder City, Laughlin, and
          Mesquite, activated whenever the National Weather Service issues an
          extreme-heat warning. The county activated stations most recently
          August 18&ndash;21, 2026, and repeatedly through the summer before
          that &mdash; including August 6&ndash;11 and July 20&ndash;24. Some
          locations are pet-friendly with a leash or carrier. The current
          location list is always posted at{" "}
          <a
            href="https://www.clarkcountynv.gov/news/cooling-stations-activated"
            className="text-lvinit-blue underline underline-offset-4"
            target="_blank"
            rel="noopener noreferrer"
          >
            clarkcountynv.gov
          </a>
          , since it changes with the warnings.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That safety net exists because the heat here is a genuine risk, not
          just a discomfort. The Las Vegas Review-Journal reported in July
          2026 that the Clark County coroner&rsquo;s office had documented at
          least 800 heat-related deaths across the county combined over 2024
          and 2025. The same reporting cited a Desert Research Institute
          Nevada Heat Lab survey of 489 people across 37 cooling stations,
          finding that a real barrier isn&rsquo;t just the heat itself &mdash;
          it&rsquo;s that many residents don&rsquo;t know where the cooling
          stations are or how to use the county&rsquo;s free bus pass to reach
          one. That figure reflects the county&rsquo;s population as a whole,
          not homeowners specifically &mdash; many of these cases involve
          unhoused residents, prolonged outdoor exposure, or homes without
          working air conditioning. But it&rsquo;s the honest reason this
          article is titled &ldquo;surviving,&rdquo; not just &ldquo;enjoying&rdquo;
          your first Las Vegas summer, and why knowing the resource exists is
          worth thirty seconds even if you never expect to need it.
        </p>
      </StorySection>

      <StorySection heading="If you're evaluating a home for your first Las Vegas summer">
        <p className="text-body-lg text-lvinit-warmgray">
          This is where the practical advice turns into a real-estate
          question. A few things worth actually checking when you&rsquo;re
          touring or evaluating a home here, beyond the usual list:
        </p>
        <ul className="mt-5 space-y-4 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Ask about the AC
              unit&rsquo;s age and service history,</span> not just whether
              it currently blows cold. A unit nearing the end of its life is a
              very different summer than a recently serviced one, and it&rsquo;s
              a fair thing to ask a seller or listing agent directly.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Notice the shade &mdash;
              or the lack of it.</span> Established neighborhoods with mature
              trees and covered patios genuinely feel different in July than
              a newer block that hasn&rsquo;t grown into its landscaping yet.
              Walk a street at midday, not just during a golden-hour showing,
              and see how it actually feels.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Check window and patio
              orientation,</span> not just square footage. A west-facing wall
              of glass with no overhang does real, felt work on a summer
              cooling bill; a shaded east-facing patio is a very different
              daily experience.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">If solar is installed,
              understand what it actually covers</span> &mdash; system size,
              panel condition, and whether it&rsquo;s owned, financed, or
              leased are all fair questions before assuming it offsets your
              summer cooling load.
            </span>
          </li>
        </ul>
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          This is also a genuinely useful lens for choosing where to live in
          the first place. A walkable neighborhood like the{" "}
          <Link
            href="/neighborhoods/downtown-arts-district"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Downtown Arts District
          </Link>{" "}
          is a real asset most of the year, but summer is the season that
          actually tests whether &ldquo;walkable&rdquo; still holds up at
          2pm in August &mdash; shade and shortcuts between air-conditioned
          stops start to matter as much as walk score. Newer, fast-growing
          areas like{" "}
          <Link
            href="/neighborhoods/southwest-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Southwest Las Vegas
          </Link>{" "}
          trade mature tree canopy for newer construction and modern
          efficiency standards &mdash; a real tradeoff, not a downgrade.
          Established master-planned communities like{" "}
          <Link
            href="/neighborhoods/summerlin"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Summerlin
          </Link>{" "}
          and{" "}
          <Link
            href="/neighborhoods/henderson"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Henderson
          </Link>{" "}
          have had decades to grow shade trees and settle in, which is worth
          factoring in alongside the usual price and school questions. And
          valley-wide programs like the cooling stations above reach every
          side of town, including{" "}
          <Link
            href="/neighborhoods/north-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            North Las Vegas
          </Link>
          , so it&rsquo;s not a resource tied to any one part of the valley.
        </p>
      </StorySection>

      <StorySection heading="The bottom line">
        <p className="text-body-lg text-lvinit-warmgray">
          Las Vegas summers are genuinely intense &mdash; averaging over 100°F
          for three straight months isn&rsquo;t marketing copy, it&rsquo;s the
          official record. But it&rsquo;s also a season people here have long
          since figured out how to live well through: mornings outside,
          afternoons indoors, a well-maintained AC system, and a little
          respect for monsoon storms. Know where the cooling stations are even
          if you never need one, check on the people around you when it gets
          extreme, and treat your first summer here as something to plan for,
          not panic about.
        </p>
      </StorySection>

      <StorySection heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">National Weather Service, Las Vegas</span>{" "}
            &mdash; official 1991&ndash;2020 climate normals (monthly average
            highs/lows for June&ndash;September) and the all-time record high
            of 120°F on July 7, 2024, from the &ldquo;Temperature
            Overview&rdquo; document and the office&rsquo;s Climate of Las
            Vegas page &mdash;{" "}
            <a
              href="https://www.weather.gov/media/vef/Temperature%20Overview.pdf"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              weather.gov/media/vef/Temperature Overview.pdf
            </a>{" "}
            and{" "}
            <a
              href="https://www.weather.gov/vef/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              weather.gov/vef
            </a>
            .
          </li>
          <li>
            <span className="text-lvinit-black">National Weather Service, Las Vegas (@NWSVegas)</span>{" "}
            &mdash; the official June 15&ndash;September 30 monsoon window and
            Southern Nevada&rsquo;s locally active period and peak
            thunderstorm/flash-flood activity.
          </li>
          <li>
            <span className="text-lvinit-black">Clark County</span> &mdash;
            cooling-station activation program, including the August
            18&ndash;21, 2026, August 6&ndash;11, 2026, and July 20&ndash;24,
            2026 activations &mdash;{" "}
            <a
              href="https://www.clarkcountynv.gov/news/cooling-stations-activated"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              clarkcountynv.gov/news/cooling-stations-activated
            </a>
            , corroborated by Fox5 Las Vegas and the Las Vegas Review-Journal.
          </li>
          <li>
            <span className="text-lvinit-black">Las Vegas Review-Journal</span>{" "}
            &mdash; &ldquo;Las Vegas has hidden defenses against deadly heat.
            Most people miss them,&rdquo; July 24, 2026, citing Clark County
            coroner&rsquo;s office data (at least 800 heat-related deaths
            combined across 2024&ndash;2025) and a Desert Research Institute
            Nevada Heat Lab survey of 489 people across 37 cooling stations
            &mdash;{" "}
            <a
              href="https://www.reviewjournal.com/news/environment/las-vegas-has-hidden-defenses-against-deadly-heat-most-people-miss-them-3854739/"
              className="text-lvinit-blue underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              reviewjournal.com
            </a>
            .
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Weather and public-safety programs can change year to year. This
          article reflects the sources and dates cited above and is general
          local-living guidance, not medical, safety, or emergency advice —
          in an emergency, call 911.
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
