import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryPullQuote,
  StoryGallery,
} from "@/components/story";

// ---------------------------------------------------------------------------
// SOUTHWEST LAS VEGAS — area guide, built on the Story Page system.
//
// ROUTE: a place people live, so it sits on the place spine (/neighborhoods/…)
// alongside Summerlin, Henderson, North Las Vegas, and the Arts District.
//
// It is deliberately NOT added to the neighborhoods[] array in lib/content.ts —
// same call as North Las Vegas. That array drives the homepage Compare tool,
// which needs median price / walk score / commute / school figures we do not
// have verified for this area. Adding it would surface fabricated metrics.
// It's linked directly from the homepage discovery list instead.
//
// PHOTOGRAPHY: all real, Mikey-owned frames, shot 2026-07-16 ~9:45–10:15am
// (Samsung, JPG-sourced). Global footer credit covers them — no per-image
// credit. Explicitly NOT the North Las Vegas treatment, which carries a visible
// Shutterstock credit because that hero is licensed, not Mikey's.
// Kept honest midday July daylight — no golden-hour regrade.
//
// FACTS — every claim below is sourced; see the research notes:
//  · "Southwest Las Vegas" is an informal, colloquial term with no legal
//    boundary; the area is overwhelmingly unincorporated Clark County, mapping
//    mainly onto the towns of Enterprise and Spring Valley.
//  · Enterprise grew ~60% 2010–2023 vs ~20% valley-wide (Clark County figures
//    via Las Vegas Review-Journal); ~46 sq mi; growth driven by developable land.
//  · West of I-15 the beltway is county-maintained CC-215 (Bruce Woodbury
//    Beltway, renamed 2004), NOT Interstate 215.
//  · Blue Diamond Rd = SR-160.
//  · UnCommons: 40 acres at Durango just south of the 215, across from Durango
//    Casino & Resort; 4 office buildings (>335,000 sq ft) open and effectively
//    fully leased; retail/dining, Vestra apartments, The Quad, Kiln coworking
//    all OPEN. Domus (~455 units) ANNOUNCED. A 5th office building was
//    ANNOUNCED May 2026, tenant-ready target Q1 2028, no construction start
//    date given. NOTE: Matter's own site advertises 500,000 sq ft office and
//    800 residential units — those are FULL BUILD-OUT TARGETS, not built. Do
//    not restate them as existing. Unit counts conflict across sources
//    (385 vs 352) so no precise count is stated.
//  · The Bend: Sunset Rd & Durango Dr (NOT Blue Diamond/Fort Apache), by Dapper
//    Companies, across from the IKEA, roughly 10 acres. Substantially OPEN.
//    Square footage conflicts across sources (113k vs 157k) so it is not stated.
//    Killer Whale Creamery is the only tenant the site marks "coming soon."
//  · The $490,000 June 2026 median is Las Vegas REALTORS' SOUTHERN NEVADA
//    MLS-WIDE figure for existing single-family homes — NOT a Southwest
//    submarket median. It is labeled as such and must stay that way. No
//    Southwest-specific median is published anywhere I could verify.
//  · Car-dependence/walkability is framed as Mikey's firsthand observation, not
//    a cited statistic — no authoritative source quantifies it, and no Walk
//    Score is asserted.
//
// FAIR HOUSING: no school ratings, no crime claims, no demographic
// characterization of residents, no "great for families"-type steering. The
// population figures used are total counts / growth rates only.
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title: "Living in Southwest Las Vegas: What It's Actually Like | LVINIT",
  headline: "Living in Southwest Las Vegas",
  description:
    "An honest local guide to Southwest Las Vegas — the valley's fastest-growing residential side. Newer housing, easy 215 access, and a car-dependent life that's still filling in.",
  path: "/neighborhoods/southwest-las-vegas",
  image: "/images/hero/southwest-las-vegas-uncommons-street.webp",
  imageWidth: 2400,
  imageHeight: 1350,
  imageAlt:
    "A quiet street through the UnCommons mixed-use campus in southwest Las Vegas at mid-morning, with three- and four-story offices housing BDO and CBRE, young shade trees, and desert landscaping along the curb.",
  datePublished: "2026-07-16",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Southwest Las Vegas", path: "/neighborhoods/southwest-las-vegas" },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function SouthwestLasVegasPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Las Vegas Valley · An Area Guide",
        headline: "Living in Southwest Las Vegas",
        subheadline:
          "Newer than most of the valley, easier to get out of, and still deciding what it wants to be. The honest read on the fastest-growing side of Las Vegas.",
        image: "/images/hero/southwest-las-vegas-uncommons-street.webp",
        imageAlt:
          "A quiet street through the UnCommons mixed-use campus in southwest Las Vegas at mid-morning, with three- and four-story offices housing BDO and CBRE, young shade trees, and desert landscaping along the curb.",
        backLink: { label: "Las Vegas neighborhoods", href: "/#neighborhoods" },
        ctas: [{ label: "Search homes", href: "/search", variant: "tertiary" }],
      }}
      relatedStories={{
        heading: "Compare it to the rest of the valley",
        intro:
          "Southwest is the newer, more spread-out option. If you're weighing it against somewhere with more of a center — or more of a history — these are the honest guides to the alternatives.",
        columns: 3,
        stories: [
          {
            name: "Summerlin",
            href: "/neighborhoods/summerlin",
            category: "Neighborhood guide",
            dek: "The master-planned west side against Red Rock — the comparison most Southwest buyers are actually making.",
          },
          {
            name: "Henderson",
            href: "/neighborhoods/henderson",
            category: "Neighborhood guide",
            dek: "The valley's widest range of communities, from new master-plans to a historic downtown and the hillside.",
          },
          {
            name: "Downtown Arts District",
            href: "/neighborhoods/downtown-arts-district",
            category: "Neighborhood guide",
            dek: "The walkable, mural-covered counterpoint — everything the suburbs deliberately aren't.",
          },
        ],
      }}
      ctas={{
        heading: "Trying to figure out if Southwest is your side of town?",
        body:
          "Tell me how you actually spend a week — where you work, what you drive, what you want within ten minutes — and I'll tell you honestly whether this area fits or whether you'd be happier somewhere else.",
        footnote: (
          <>
            Weighing the west side instead?{" "}
            <Link
              href="/neighborhoods/summerlin"
              className="text-lvinit-blue underline underline-offset-4"
            >
              Read the Summerlin guide
            </Link>
            .
          </>
        ),
      }}
    >
      <StoryLede
        kicker="Las Vegas Valley · An Area Guide"
        lead="Drive the southwest valley on a weekday morning and you'll notice the same thing I do: almost none of it looks old. The walls are still tan, the trees are still short, and every few blocks there's a corner that was dirt a couple of years ago and is now framing lumber. This is the part of Las Vegas that is still being finished."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          That&rsquo;s the honest starting point. Southwest Las Vegas isn&rsquo;t
          a place with a center you can walk to and a history you can point at.
          It&rsquo;s a big, newer, fast-filling stretch of the valley organized
          around one very good piece of infrastructure — the 215 — and it asks
          you to drive for basically everything. Whether that&rsquo;s a fair
          trade is the whole question, and it&rsquo;s a different answer than
          you&rsquo;d get from the{" "}
          <Link
            href="/neighborhoods/summerlin"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Summerlin
          </Link>{" "}
          or{" "}
          <Link
            href="/neighborhoods/downtown-arts-district"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Arts District
          </Link>{" "}
          guides.
        </p>
      </StoryLede>

      <StorySection heading="Where &ldquo;Southwest&rdquo; actually is">
        <p className="text-body-lg text-lvinit-warmgray">
          First, a clarification that saves people a lot of confusion:{" "}
          <span className="text-lvinit-black">
            &ldquo;Southwest Las Vegas&rdquo; isn&rsquo;t an official place.
          </span>{" "}
          There&rsquo;s no city limit, no legal boundary, no line on a county map
          that says where it starts and stops. It&rsquo;s a term locals and
          agents use loosely, and two people using it can easily mean two
          different chunks of the valley.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Here&rsquo;s the part that actually matters when you&rsquo;re buying:
          most of what people call Southwest Las Vegas isn&rsquo;t in the City of
          Las Vegas at all. It&rsquo;s{" "}
          <span className="text-lvinit-black">unincorporated Clark County</span>,
          falling mainly across the county towns of{" "}
          <a
            href="https://www.clarkcountynv.gov/government/departments/comprehensive_planning_department/divisions/advanced_planning_division/enterprise"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Enterprise
          </a>{" "}
          and Spring Valley. Your mailing address says Las Vegas. Your
          jurisdiction, in most cases, doesn&rsquo;t. That affects who you call
          about a permit, a pothole, or a code question — worth knowing before
          you&rsquo;re annoyed about it.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          In practice, when I say Southwest I mean roughly the area framed by
          Durango, Fort Apache, and Rainbow running north to south, and Warm
          Springs, Russell, and Blue Diamond Road — that&rsquo;s SR-160 — running
          east to west, with the 215 curving through the middle of all of it.
          Push the edges however you like. Nobody&rsquo;s going to correct you,
          because there&rsquo;s nothing to correct you against.
        </p>
      </StorySection>

      <StorySection heading="It's growing faster than anywhere else in the valley">
        <p className="text-body-lg text-lvinit-warmgray">
          This is the one claim about the Southwest that isn&rsquo;t marketing.
          Enterprise — the roughly 46-square-mile county town that covers much of
          this area — grew close to{" "}
          <span className="text-lvinit-black">60% between 2010 and 2023</span>,
          against about 20% for the Las Vegas Valley overall, per Clark County
          figures{" "}
          <a
            href="https://www.reviewjournal.com/business/housing/how-fast-is-the-southwest-las-vegas-valley-growing-3046446/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            reported by the Review-Journal
          </a>
          . That&rsquo;s not a small gap. That&rsquo;s the valley&rsquo;s growth
          happening disproportionately in one corner.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The reason is unglamorous: land. Las Vegas is boxed in by federal
          ground on most sides — Red Rock&rsquo;s conservation area to the west,
          Lake Mead to the east — and the southwest had room left to build. So it
          got built. That&rsquo;s why the housing here skews new, and it&rsquo;s
          also why so much of it went up at once, which is a thing you can feel
          when you drive it.
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/southwest-las-vegas-uncommons-office-street.webp",
            alt: "A mid-morning street at the UnCommons campus in southwest Las Vegas, with a four-story office building signed for Morgan Stanley and Las Vegas Sotheby's International Realty, parked cars, and young trees casting shadows across the asphalt.",
            caption:
              "Offices at UnCommons — the southwest has quietly become a place people work, not just sleep.",
          },
        ]}
      />

      <StorySection heading="The 215 is the whole reason it works">
        <p className="text-body-lg text-lvinit-warmgray">
          If you take one practical thing from this guide, take this one. The
          beltway — officially the Bruce Woodbury Beltway — is the spine the
          entire southwest hangs off. It curves through the area and connects you
          north toward Summerlin and east toward Henderson and the airport
          without putting you on surface streets for forty minutes. A lot of
          people move here for exactly that and nothing else.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          A small technicality worth knowing, because people get it wrong: on
          this side of town it&rsquo;s{" "}
          <span className="text-lvinit-black">CC-215</span>, a county-maintained
          route. The Interstate 215 designation only applies east of I-15. Same
          road in your head, different sign, and it explains why you&rsquo;ll see
          both written down.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Realistically: your drive depends far more on which side of the beltway
          you land on and where you&rsquo;re going than on any number I could
          print here. Getting to the airport or the south Strip is genuinely
          quick from most of the Southwest. Getting across the valley to
          Henderson&rsquo;s far side, or up to the northwest, is a real drive at
          rush hour. I&rsquo;m not going to hand you a commute time in minutes —
          it swings too much by time of day and by exactly which street
          you&rsquo;re on, and any number I gave you would be a guess dressed up
          as a fact. Drive it yourself at the hour you&rsquo;d actually be
          driving it. That&rsquo;s the only test that means anything.
        </p>
      </StorySection>

      <StorySection heading="What the housing actually looks like">
        <p className="text-body-lg text-lvinit-warmgray">
          Mostly newer single-family homes, and a lot of them behind gates.
          Master-planned and gated communities are the dominant pattern out here
          — Mountain&rsquo;s Edge, Rhodes Ranch, and Southern Highlands are the
          names you&rsquo;ll hear most — mixed in with townhomes, a growing stock
          of apartments, and pockets that are still actively under construction.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The important nuance:{" "}
          <span className="text-lvinit-black">
            these are not all the same neighborhood.
          </span>{" "}
          The Southwest is big, and a gated street off Blue Diamond and a
          four-story apartment building at Durango and the 215 are not remotely
          the same product or the same life. People talk about &ldquo;the
          Southwest&rdquo; as one thing the way they talk about North Las Vegas
          as one thing, and they&rsquo;re wrong both times. What holds across
          most of it is the age of the housing and the fact you&rsquo;ll be
          driving.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          On price, I&rsquo;ll be straight with you about what I can and
          can&rsquo;t say. There is no published median specific to Southwest Las
          Vegas that I&rsquo;d be willing to quote — the submarket boundaries
          don&rsquo;t officially exist, so nobody reports on them cleanly. What
          does exist is the valley-wide number: Las Vegas REALTORS put the median
          for existing single-family homes sold through the MLS at{" "}
          <a
            href="https://nevadabusiness.com/2026/07/lvr-reports-local-home-prices-hovering-at-record-high/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            $490,000 in June 2026
          </a>
          , holding at the record set the month before. That&rsquo;s Southern
          Nevada as a whole,{" "}
          <span className="text-lvinit-black">not this area specifically</span>,
          and I&rsquo;d rather give you an honest wide number than a precise
          local one I invented. Real pricing here is a conversation against{" "}
          <Link
            href="/search"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            current listings
          </Link>
          , not a page like this.
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/southwest-las-vegas-uncommons-vestra-apartments.webp",
            alt: "The four-story Vestra apartment building at UnCommons in southwest Las Vegas, with balconies, ground-floor retail bays, a leasing entrance, and cars parked along the street on a clear July morning.",
            caption:
              "Vestra at UnCommons — apartments over ground-floor retail, which is still a rare shape of building out here.",
          },
        ]}
      />

      <StorySection heading="You're going to drive. All of it, every day.">
        <p className="text-body-lg text-lvinit-warmgray">
          I want to be blunt here, because this is where people get surprised.
          The Southwest is built around the car. Not &ldquo;mostly.&rdquo; Not
          &ldquo;except for a few errands.&rdquo; The street grid is wide and
          fast, the blocks are long, the distances between a house and anything
          useful are measured in miles, and the summer makes walking those
          distances a genuinely bad idea for months at a stretch.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That&rsquo;s my read from driving it, not a statistic — I&rsquo;m not
          going to quote you a walkability score I can&rsquo;t stand behind. RTC
          buses do run the main corridors out here; the Durango, Fort Apache, and
          Rainbow routes exist and people use them. But the area was planned
          around driveways, and it shows. If you&rsquo;re coming from a city
          where you didn&rsquo;t need a car, this will be the adjustment, and
          it&rsquo;ll be a bigger one than the heat.
        </p>
      </StorySection>

      <StoryPullQuote>
        The southwest wasn&rsquo;t designed to be walked. It was designed to be
        driven, quickly, and it&rsquo;s honest enough not to pretend otherwise.
      </StoryPullQuote>

      <StorySection heading="UnCommons is the exception, not the rule">
        <p className="text-body-lg text-lvinit-warmgray">
          The photos on this page are mostly from UnCommons, so let me be careful
          about what they do and don&rsquo;t prove. UnCommons is a 40-acre
          mixed-use campus on Durango just south of the 215, across from the
          Durango casino, and it&rsquo;s the most concentrated attempt anyone has
          made to build a &ldquo;center&rdquo; in this part of town. Four office
          buildings are up and effectively full. There&rsquo;s a real cluster of
          food and coffee — Blue Bottle, Urth Caff&eacute;, Salt &amp; Straw —
          plus a coworking space, an event venue, and a central plaza people
          actually sit in. The Vestra apartments are open and leasing.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It is also{" "}
          <span className="text-lvinit-black">
            not what the rest of the Southwest looks like
          </span>
          , and I&rsquo;d be selling you something if I implied otherwise. It is
          one campus. Walk ten minutes past its edge and you&rsquo;re back to
          arterial roads and parking lots. What UnCommons genuinely tells you is
          the direction of travel: there are now real offices out here, which
          means some people&rsquo;s commute is five minutes, and that used to not
          be true at all.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Still coming, as of this writing: a second apartment building and a
          fifth office building, announced in May 2026 with a tenant-ready target
          of early 2028. Announced is not built — no construction start date has
          been given, and I&rsquo;d treat any renderings you see accordingly.
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/southwest-las-vegas-uncommons-paseo.webp",
            alt: "A shaded concrete walkway between apartment buildings at UnCommons in southwest Las Vegas, with low concrete seating walls, desert grasses, young trees, and parked cars visible at the far end.",
            caption:
              "The paseo at UnCommons — shade, benches, and somewhere to walk. It works, and it's about the size of a city block.",
          },
        ]}
      />

      <StorySection heading="The Bend, and the everyday errand map">
        <p className="text-body-lg text-lvinit-warmgray">
          About a mile and a half down Durango, at Sunset, is The Bend — a
          dining-and-retail development from Dapper Companies sitting across from
          the IKEA on roughly ten acres. It&rsquo;s largely open and doing real
          business: Electric Pickle, Mothership Coffee, Marufuku Ramen, Aces
          &amp; Ales, St. Felix, Freed&rsquo;s, Butcher &amp; Thief. There&rsquo;s
          another phase still to come, and at least one tenant the developer
          still lists as coming soon, so it isn&rsquo;t finished — but
          it&rsquo;s not a construction site either.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          I&rsquo;m including it for one reason, and it isn&rsquo;t the tenant
          list. The Bend is a good honest picture of how this area actually
          works: a well-made cluster of good places that you drive to, park at,
          walk about two hundred feet inside of, and drive home from. That
          isn&rsquo;t a criticism — it&rsquo;s genuinely nice, and the food is
          good. It&rsquo;s just the shape of the place. Between UnCommons, The
          Bend, and the retail strung along Rainbow, Fort Apache, and Blue
          Diamond, your daily-errand life out here is well covered. It just
          happens through a windshield.
        </p>
      </StorySection>

      <StoryGallery
        images={[
          {
            src: "/images/features/southwest-las-vegas-the-bend-storefronts.webp",
            alt: "The sidewalk along a row of storefronts at The Bend in southwest Las Vegas, with St. Felix and Freed's signage, planted trellises against a stucco wall, trimmed hedges, parked trucks, and desert hills on the horizon.",
            caption:
              "The Bend at Sunset and Durango — good storefronts, wide sidewalk, and a parking lot you arrive in.",
          },
        ]}
      />

      <StorySection heading="How it's different from Summerlin">
        <p className="text-body-lg text-lvinit-warmgray">
          This is the comparison most people are actually making, so let&rsquo;s
          do it properly. Summerlin is a master plan. One developer, one long
          plan, decades of execution — which is why it has a genuine center in
          Downtown Summerlin, a trail system that connects, mature landscaping,
          and a consistency to it. You can feel the plan.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The Southwest isn&rsquo;t that. It&rsquo;s many separate developments
          that filled in the same general area over the same couple of decades,
          next to each other rather than with each other. The result is patchier:
          a polished gated community can sit across an arterial from a strip
          center and a lot that hasn&rsquo;t been built on yet. What you get in
          exchange is newer housing, frequently more square footage for the
          money, and the beltway right there. What you give up is cohesion and a
          center. If you want the full version of the other side of that trade,
          the{" "}
          <Link
            href="/neighborhoods/summerlin"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Summerlin guide
          </Link>{" "}
          is the honest one.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Against{" "}
          <Link
            href="/neighborhoods/henderson"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Henderson
          </Link>
          , briefly, because it&rsquo;s the other question I get: Henderson is
          its own city with its own government and its own services, and it has
          more variety — older established areas, a real downtown, lakes,
          hillside. The Southwest has none of that history and isn&rsquo;t a city
          at all. If separate-municipality matters to you, that&rsquo;s a real
          difference, not a vibe.
        </p>
      </StorySection>

      <StorySection muted heading="My honest take">
        <aside className="mx-auto max-w-3xl border-l-2 border-lvinit-blue pl-6 sm:pl-8">
          <p className="font-display italic text-subhead text-lvinit-blue">
            The Local&rsquo;s Note
          </p>
          <p className="mt-4 text-body-lg text-lvinit-black">
            The Southwest gives you the two things a lot of buyers say they want:
            a newer house and a fast way out. Those are real, and I&rsquo;d never
            talk anyone out of valuing them.
          </p>
          <p className="mt-5 text-body-lg text-lvinit-warmgray">
            What I&rsquo;d want you to walk in knowing is that much of it still
            feels fragmented and unfinished. Not bad — unfinished. You&rsquo;ll
            find a beautiful street that ends at a wall, retail that arrived
            before the sidewalks connected to it, and stretches where the trees
            need another decade before they do anything for you in August. There
            isn&rsquo;t a there there yet, in the way Summerlin has one. Places
            like UnCommons are building one, and it&rsquo;s working, but
            it&rsquo;s one campus in a very large area.
          </p>
          <p className="mt-5 text-body-lg text-lvinit-warmgray">
            And I want to be fair about the suburban part, because that&rsquo;s
            not the criticism. Plenty of the valley is suburban and works
            beautifully. The Southwest&rsquo;s tradeoff isn&rsquo;t that
            it&rsquo;s suburban — it&rsquo;s that it&rsquo;s suburban{" "}
            <span className="text-lvinit-black">without the master plan</span>.
            You&rsquo;re buying into a place that&rsquo;s still assembling
            itself. If you&rsquo;re the kind of person who finds that exciting —
            new construction, room to grow, the sense of getting somewhere early
            — this is a genuinely good bet. If you want to move somewhere that
            already knows what it is, be honest with yourself now and save
            yourself two years.
          </p>
        </aside>
      </StorySection>

      <StorySection heading="So should you look here?">
        <p className="text-body-lg text-lvinit-warmgray">
          Look here if a newer home matters to you, if the beltway solves your
          commute, if you&rsquo;re relaxed about driving, and if you&rsquo;d
          rather have more house than more character. That&rsquo;s a completely
          reasonable set of priorities and the Southwest serves it better than
          almost anywhere else in the valley right now.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Look elsewhere if you want to walk places, if you want a neighborhood
          with a history and a center, or if construction noise and half-built
          horizons would wear on you. The{" "}
          <Link
            href="/neighborhoods/downtown-arts-district"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Arts District
          </Link>{" "}
          is the opposite instinct entirely, and{" "}
          <Link
            href="/neighborhoods/summerlin"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Summerlin
          </Link>{" "}
          is the polished version of the same suburban idea.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          My actual advice, and it costs nothing: pick a Tuesday, drive Durango
          from Blue Diamond up to the 215, then cut across Warm Springs, and do
          it at the hour you&rsquo;d really be commuting. You&rsquo;ll know
          within twenty minutes whether this is your side of town. It&rsquo;s a
          place that reveals itself from the driver&rsquo;s seat, which is
          fitting, because that&rsquo;s where you&rsquo;d be living.
        </p>
      </StorySection>

      <Container className="pb-4">
        <p className="mx-auto max-w-[680px] text-caption text-lvinit-warmgray">
          Photographed in southwest Las Vegas on July 16, 2026. Development
          status — what&rsquo;s open, under construction, or only announced —
          was accurate as of that date and will change; check with the
          developers before planning around it.
        </p>
      </Container>
    </StoryPage>
  );
}
