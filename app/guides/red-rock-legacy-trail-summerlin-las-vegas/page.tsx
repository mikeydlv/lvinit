import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection } from "@/components/story";

// ---------------------------------------------------------------------------
// NEIGHBORHOODS & LIVING / OUTDOORS — Red Rock Legacy Trail, Phase 1 open,
// west edge of Summerlin (Charleston Blvd & Sky Vista Dr, along SR-159).
// Built by the LVINIT Daily Publisher (2026-11-15) from Local Radar assignment
// LR-RED-ROCK-LEGACY-TRAIL (READY - FIRST-PARTY MEDIA RECOMMENDED).
//
// FACT DISCIPLINE (sources read 2026-11-15):
// - PRIMARY: Clark County project page "Red Rock Legacy Trail": nearly 19
//   miles from the edge of Summerlin to Blue Diamond Road, five phases.
//   Phase 1: 0.99 mi, 12-ft paved, from the northwest corner of W. Charleston
//   Blvd & Sky Vista Dr to the (then) Red Rock sign location; construction
//   began 7/14/25; sign to be relocated west with a new photo parking lot;
//   FLAP grant; design Jacobs, contractor Las Vegas Paving; extension to the
//   Visitor Center funded by RTC in Dec 2024, no start date. Phase 2: 6.61 mi
//   to the Scenic Loop exit, design 70% (Aug 2025), SNPLMA. Phase 3: 3.5 mi
//   Scenic Loop exit lot to Bonnie Springs Rd, SNPLMA. Phase 4: 2.1 mi Bonnie
//   Springs Rd to Castalia Rd in Blue Diamond, SNPLMA. Phase 5: ~3.9 mi from
//   the Blue Diamond Wash crossing at SR-159 to a future trailhead near
//   Hualapai Way & Blue Diamond Rd, FLAP. Parking: county lot southeast of
//   Charleston/Sky Vista. Contact: Meggan Holzer, Rural Towns Liaison.
//   NOTE: the county page still lists Phase 1 as under construction.
// - KSNV News 3 (Apr 29, 2026): Phase 1 opening celebration Tue Apr 28, 2026;
//   one mile of multi-use trail running west from Charleston & Sky Vista;
//   parking lot at the southeast corner; new traffic signal at the
//   intersection.
// - Fox5 (Apr 28, 2026): Phase 1 open to the public; dedicated trail lot; new
//   signal at Charleston & Sky Vista; Red Rock marker moved to a safer spot
//   with its own photo parking; partners thanked: Save Red Rock, BLM, NDOT,
//   FHWA, Southern Nevada Bicycle Coalition.
// - KTNV (undated): relocated Red Rock Canyon marker on the north side of
//   SR-159 about 1.7 mi west of Charleston & Sky Vista, in a new paved lot;
//   moved for safety as part of Phase 1. Heather Fisher (Save Red Rock) quote.
// OMITTED ON PURPOSE: total project cost (~$100M figure not on county page);
//   any Phase 2-5 construction dates (none set); trailhead hours (not
//   posted in any source read); Red Rock Canyon Scenic Loop status (BLM
//   facility, conflicting reports Nov 12-13); any claim that Phase 1 reaches
//   the relocated sign lot or the Visitor Center; any first-person visit
//   claim (no first-party media exists).
// IMAGERY (updated 2026-11-16): two images uploaded by Mikey after
//   publication. They are AI-processed versions of Las Vegas Review-Journal
//   photos, NOT unaltered originals and NOT LVINIT photography. Publication
//   permission was NOT confirmed when they were added; do not merge/publish
//   until they are cleared. Optimized to WebP with Sharp at their native
//   1672x941 (q84); the uploaded PNGs were replaced by the WebP copies. Every
//   placement carries the source credit and the AI-processing note.
//   Hero/card/OG: cyclists on the trail bridge. Inline ("What's open right
//   now"): aerial of the first mile beside Charleston Blvd. Not Media Image
//   Library files, so no usedOn/usage records change. The generated
//   editorial cover was deleted.
// ---------------------------------------------------------------------------

const PATH = "/guides/red-rock-legacy-trail-summerlin-las-vegas";
const HERO_IMG = "/images/hero/red-rock-legacy-trail-cyclists-bridge-hero.webp";
const HERO_ALT =
  "Cyclists crossing the Red Rock Legacy Trail bridge with mountains behind them.";
// Source attribution + AI disclosure, shown with every placement.
const IMG_CREDIT =
  "Photo: Las Vegas Review-Journal. AI-processed version, not the unaltered original.";
const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";
const extCls = "text-lvinit-blue underline underline-offset-4";
const COUNTY_PAGE =
  "https://www.clarkcountynv.gov/government/board_of_county_commissioners/special-projects/red-rock-legacy-trail";
const KSNV =
  "https://news3lv.com/newsletter-daily/first-phase-red-rock-canyon-paved-trail-now-open-west-las-vegas-clark-county-bicycling-pedestrians-walking";
const FOX5 =
  "https://www.fox5vegas.com/2026/04/28/red-rock-legacy-trail-debuts-with-safety-upgrades-new-parking-summerlin/";
const KTNV =
  "https://www.ktnv.com/news/where-to-find-the-relocated-red-red-canyon-north-marker";

const TITLE =
  "The First Mile of the Red Rock Legacy Trail Is Open. Here's What You Can Use Now";

const meta: StoryMeta = {
  title: "Red Rock Legacy Trail: What's Open, Where to Park & What's Next | LVINIT",
  headline: TITLE,
  description:
    "Phase 1 of Clark County's Red Rock Legacy Trail is open: about a mile of 12-foot paved path heading west from Charleston and Sky Vista. Where to park, where the Red Rock sign moved, and what the other four phases would add.",
  path: PATH,
  image: HERO_IMG,
  imageWidth: 1672,
  imageHeight: 941,
  imageAlt: HERO_ALT,
  datePublished: "2026-11-15",
  dateModified: "2026-11-15",
  author: "LVINIT Editorial",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: "Red Rock Legacy Trail", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

/**
 * Inline body photo at its native 16:9 ratio: intrinsic width/height reserve
 * space (no layout shift), w-full h-auto scales without stretching or
 * cropping, and next/image lazy-loads it by default.
 */
function Figure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="mt-8">
      <Image
        src={src}
        alt={alt}
        width={1672}
        height={941}
        loading="lazy"
        sizes="(max-width: 768px) 100vw, 680px"
        className="h-auto w-full rounded-lg bg-lvinit-lightgray"
      />
      <figcaption className="mt-3 text-caption text-lvinit-warmgray">
        {caption}
      </figcaption>
    </figure>
  );
}

export default function RedRockLegacyTrailPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Neighborhoods & Living",
        headline: TITLE,
        subheadline:
          "About a mile of paved path now runs west from Charleston and Sky Vista toward Red Rock Canyon. The full trail is planned at about 19 miles, but the rest doesn't have construction dates yet.",
        image: HERO_IMG,
        imageAlt: HERO_ALT,
        imageCredit: IMG_CREDIT,
        backLink: { label: "All guides", href: "/guides" },
      }}
      relatedStories={{
        heading: "Keep reading",
        intro: "More on Summerlin and the trails going in around the west side.",
        stories: [
          {
            name: "Summerlin",
            href: "/neighborhoods/summerlin",
            category: "Neighborhoods",
            dek: "The villages, a real map, and what living out west is like.",
          },
          {
            name: "Summerlin Parkway Trail",
            href: "/guides/summerlin-parkway-trail-summerlin-las-vegas",
            category: "Local Feature",
            dek: "What the city is building from the 215 to Rampart.",
          },
          {
            name: "Blue Diamond Wash Trail",
            href: "/guides/blue-diamond-wash-trail-southwest-las-vegas",
            category: "Local Feature",
            dek: "A paved trail going in along the wash in the southwest valley.",
          },
        ],
      }}
      ctas={{
        heading: "Thinking about living close to Red Rock?",
        body:
          "Tell me how much you'd actually use the trails and I'll give you an honest read on which parts of the west side make sense.",
      }}
    >
      <StoryLede
        kicker="Neighborhoods & Living"
        lead="For years, getting from Summerlin to Red Rock Canyon on foot or by bike meant riding the shoulder of a fast state highway. The Red Rock Legacy Trail is Clark County's plan to fix that with a separate paved path, and the first piece of it is open. It's short, about a mile, but it comes with a new trailhead lot, a new traffic signal and a safer home for the Red Rock Canyon sign everybody takes photos with. Here's what's actually there now and what's still on paper."
      />

      <StorySection heading="The short version">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">What&rsquo;s open:</span>{" "}
            Phase 1, a 12-foot-wide paved multi-use path the county lists at
            0.99 miles. Clark County celebrated its opening on Tuesday, April
            28, 2026.
          </li>
          <li>
            <span className="text-lvinit-black">Where it starts:</span> at
            West Charleston Boulevard and Sky Vista Drive, on the western edge
            of Summerlin, heading west along State Route 159 toward Red Rock
            Canyon.
          </li>
          <li>
            <span className="text-lvinit-black">Parking:</span> a county lot
            at the southeast corner of Charleston and Sky Vista, with a new
            traffic signal at the intersection.
          </li>
          <li>
            <span className="text-lvinit-black">The Red Rock sign moved:</span>{" "}
            the big Red Rock Canyon marker now sits in its own paved lot on
            the north side of SR-159, about 1.7 miles west of Charleston and
            Sky Vista.
          </li>
          <li>
            <span className="text-lvinit-black">The full plan:</span> about 19
            miles, per Clark County, from the edge of Summerlin to Blue
            Diamond Road, built in five phases. Phases 2 through 5 are still
            in design, with no construction dates set.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="What's open right now">
        <p className="text-body-lg text-lvinit-warmgray">
          Phase 1 is a paved, 12-foot-wide path for people walking, running
          and riding. The county&rsquo;s project page describes it as running
          0.99 miles from the northwest corner of Charleston and Sky Vista
          west to where the Red Rock sign used to stand. Construction started
          in July 2025, and the county and its partners marked the opening on
          April 28, 2026, as reported by{" "}
          <a href={KSNV} className={extCls} target="_blank" rel="noopener noreferrer">
            KSNV
          </a>{" "}
          and{" "}
          <a href={FOX5} className={extCls} target="_blank" rel="noopener noreferrer">
            Fox5
          </a>
          .
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          One thing worth knowing: the county&rsquo;s own project page
          hasn&rsquo;t caught up and still lists Phase 1 as under
          construction. The opening is documented by the April coverage, which
          ran with a photo from Clark County.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Set your expectations accordingly. This first stretch gets you off
          the highway shoulder for the first mile out of town. It does not
          reach the Red Rock Canyon Visitor Center or the Scenic Loop yet. The
          county says an extension toward the Visitor Center was part of the
          original design but was split off because of funding. The RTC
          approved money for it in December 2024, and no start date has been
          set.
        </p>
        <Figure
          src="/images/red-rock-legacy-trail-first-mile-aerial.webp"
          alt="Aerial view of cyclists on the Red Rock Legacy Trail beside Charleston Boulevard."
          caption={IMG_CREDIT}
        />
      </StorySection>

      <StorySection heading="Where to park and where the sign went">
        <p className="text-body-lg text-lvinit-warmgray">
          The trail lot is on the southeast corner of Charleston and Sky
          Vista, and the intersection now has a traffic signal, which matters
          if you&rsquo;ve ever tried to cross there. Fox5 described it as a
          dedicated parking lot for trail visitors. I haven&rsquo;t seen
          posted hours for the lot in any of the sources, so check the signs
          when you get there.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The Red Rock Canyon sign, the big stone marker people pull over to
          photograph, was moved as part of this phase. According to{" "}
          <a href={KTNV} className={extCls} target="_blank" rel="noopener noreferrer">
            KTNV
          </a>
          , it now sits in a new paved lot on the north side of SR-159, about
          1.7 miles west of Charleston and Sky Vista. The point was safety.
          &ldquo;What this does is it moves the big rock sign from next to the
          road to off to the side,&rdquo; Save Red Rock president Heather
          Fisher told the station. In other words, no more standing on the
          highway for the photo.
        </p>
      </StorySection>

      <StorySection muted heading="What the other four phases would add">
        <p className="text-body-lg text-lvinit-warmgray">
          The county&rsquo;s plan is a continuous paved trail along the Red
          Rock corridor, all the way south to Blue Diamond Road. Here&rsquo;s
          how it breaks down on the county&rsquo;s project page:
        </p>
        <ul className="mt-5 list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Phase 2 (6.61 miles):</span>{" "}
            from the end of Phase 1 to the Scenic Loop exit. Design was 70%
            complete as of August 2025.
          </li>
          <li>
            <span className="text-lvinit-black">Phase 3 (3.5 miles):</span>{" "}
            from the Scenic Loop exit parking lot to Bonnie Springs Road.
          </li>
          <li>
            <span className="text-lvinit-black">Phase 4 (2.1 miles):</span>{" "}
            from Bonnie Springs Road to Castalia Road in Blue Diamond.
          </li>
          <li>
            <span className="text-lvinit-black">Phase 5 (about 3.9 miles):</span>{" "}
            from the Blue Diamond Wash crossing at SR-159 to a future
            trailhead and parking lot near Hualapai Way and Blue Diamond Road.
          </li>
        </ul>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The money is lined up through two federal programs: the Federal
          Lands Access Program for Phases 1 and 5, and the Southern Nevada
          Public Lands Management Act for Phases 2 through 4. What isn&rsquo;t
          lined up is a schedule. None of the later phases has a published
          construction start, so treat anything beyond the first mile as
          planned, not coming soon.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          A small note on the math: the phase lengths the county lists add up
          to roughly 17 miles, while the same page calls the whole trail
          nearly 19 miles. I&rsquo;m using &ldquo;about 19 miles&rdquo;
          because that&rsquo;s the county&rsquo;s own figure.
        </p>
      </StorySection>

      <StorySection heading="Why it matters if you live out west">
        <p className="text-body-lg text-lvinit-warmgray">
          Being close to Red Rock is one of the biggest reasons people pick
          the western villages of{" "}
          <Link href="/neighborhoods/summerlin" className={linkCls}>
            Summerlin
          </Link>
          . But &ldquo;close&rdquo; has mostly meant close by car. Road
          cyclists ride out on SR-159, but plenty of people won&rsquo;t,
          because sharing a highway shoulder with fast traffic isn&rsquo;t
          for everyone. A separated paved path changes who can
          realistically get out there under their own power.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Right now, the first mile is mostly a safer start: a place to park,
          a signal to cross at and a path that gets you away from Summerlin
          traffic toward the escarpment. If the later phases get built, it
          becomes something bigger, a paved route from the edge of the city
          through the conservation area to Blue Diamond.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          It also fits a pattern across the valley. The city is building the{" "}
          <Link href="/guides/summerlin-parkway-trail-summerlin-las-vegas" className={linkCls}>
            Summerlin Parkway Trail
          </Link>{" "}
          closer in, and the county is paving a path along the{" "}
          <Link href="/guides/blue-diamond-wash-trail-southwest-las-vegas" className={linkCls}>
            Blue Diamond Wash
          </Link>{" "}
          in the southwest valley. If you&rsquo;re weighing where to live and
          trail access is genuinely high on the list, the{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            Moving to Las Vegas guide
          </Link>{" "}
          is a good place to compare areas.
        </p>
      </StorySection>

      <StorySection muted heading="Before you go">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">The Legacy Trail is not the
            Scenic Loop.</span> The Scenic Loop inside Red Rock Canyon
            is a separate Bureau of Land Management facility with its own
            entry rules and closures. Check Red Rock Canyon&rsquo;s official
            channels before heading in.
          </li>
          <li>
            <span className="text-lvinit-black">Stay on the path.</span> Use
            the trail and the lots rather than stopping on SR-159.
          </li>
          <li>
            <span className="text-lvinit-black">Questions:</span> the county
            lists Meggan Holzer, Rural Towns Liaison, as the project contact
            at (702) 455-0341.
          </li>
        </ul>
      </StorySection>

      <StorySection heading="What I haven't confirmed">
        <ul className="list-disc space-y-3 pl-5 text-body-lg text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Hours.</span> None of the
            sources list hours for the trail or the lots.
          </li>
          <li>
            <span className="text-lvinit-black">Exactly where the pavement
            ends today.</span> The county describes Phase 1 as ending at the
            old sign location. I haven&rsquo;t confirmed whether the path now
            continues to the relocated sign lot.
          </li>
          <li>
            <span className="text-lvinit-black">Total cost.</span> The county
            page doesn&rsquo;t give one, so I&rsquo;m not citing one.
          </li>
          <li>
            <span className="text-lvinit-black">Photos.</span> LVINIT
            doesn&rsquo;t have its own photos of the Legacy Trail yet, so this
            page runs without one rather than passing off another part of Red
            Rock as this trail.
          </li>
        </ul>
      </StorySection>

      <StorySection muted heading="Sources">
        <ul className="space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">Clark County</span>, Red Rock
            Legacy Trail project page (phases, lengths, funding, parking,
            contact).{" "}
            <a href={COUNTY_PAGE} className={extCls} target="_blank" rel="noopener noreferrer">
              clarkcountynv.gov
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KSNV News 3 Las Vegas</span>,
            first phase of Red Rock Canyon paved trail now open, April 29,
            2026.{" "}
            <a href={KSNV} className={extCls} target="_blank" rel="noopener noreferrer">
              news3lv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">FOX5 Las Vegas</span>, Red
            Rock Legacy Trail debuts with safety upgrades, new parking, April
            28, 2026.{" "}
            <a href={FOX5} className={extCls} target="_blank" rel="noopener noreferrer">
              fox5vegas.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">KTNV 13 Action News</span>,
            where to find the relocated Red Rock Canyon north marker.{" "}
            <a href={KTNV} className={extCls} target="_blank" rel="noopener noreferrer">
              ktnv.com
            </a>
          </li>
        </ul>
      </StorySection>
    </StoryPage>
  );
}
