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
  StoryVideo,
} from "@/components/story";

// ---------------------------------------------------------------------------
// VIDEO COMPANION: "Aries Henderson." The written companion to Mikey's
// long-form video "This Used to Be a Mine. Now Henderson Is Building 3,000
// Homes Here" (youtube.com/watch?v=I1bWPO4q3FY, public, uploaded 2026-10-08,
// 845 s, read from the YouTube watch page 2026-10-11). Cluster D (New
// Construction), hung off the Henderson pillar and the D pillar per the
// cluster map's D4/D6 rules. Before this page, nothing on LVINIT mentioned
// Aries or the Three Kids Mine (whole-word grep of app/, lib/, docs/).
//
// SOURCE OF THE ANGLE: the FINAL cut, not the edit notes. The Notes\
// transcripts in C:\LVINIT\Videos\Aries Henderson are from the 9:36
// ARIES_02 assembly; the published cut is 14:05 and differs (longer Parklane
// tour, Garden Gate segment removed). The order of ideas, opinions, pros,
// cautions, fit and verdict below follow YouTube's own transcript of the
// published video, read 2026-10-11. Mikey's Take is no stronger than what he
// says at 12:58-13:29.
//
// FACT DISCIPLINE (all sources accessed 2026-10-11; full list in the Sources
// section on the page):
// - Mine history 1917-1961, manganese for the U.S. government: NDEP FAQ,
//   NDEP Fact Sheet #5 (May 2026), City of Henderson Lakemoor Canyon page.
//   The video says the mine shut down "in the 1960s"; published as 1961.
// - Cleanup: NDEP calls itself the lead agency. The video says the City of
//   Henderson and NDEP "have had oversight"; no primary source gives the city
//   an oversight role. The NDEP FAQ says land moved through the City of
//   Henderson Redevelopment Agency to PN II Inc. (Pulte) in Feb 2024 and that
//   the city doesn't own the land and won't be liable for the cleanup.
//   Published that way. Remediation dates are Fact Sheet #5's.
//   A Review-Journal quote from a city official that remediation was
//   "completed" conflicts with NDEP's 2028 closure; NDEP's wording is used.
// - 1,259 acres = the Lakemoor Canyon Redevelopment Area (City page, read in
//   the browser 2026-10-11). Aries itself: "more than 1,100 acres" (City
//   2025 announcement, FOX5, Review-Journal). Other documents give other
//   totals (1,146 / 1,165 / 1,026); not used.
// - ~3,000 homes: NDEP FAQ Q11 ("Approximately 3,000"), City 2025 State of
//   the City release. Published as "about 3,000", never as a hard number.
// - Neighborhoods + price bands: liveataries.com community pages. Oasis
//   Canyon plan prices: pulte.com community page. Both read 2026-10-11.
// - Lot sales to D.R. Horton / Richmond American: Review-Journal (property
//   records), "roughly 100" and "roughly 70". A cut VO line said 104/72;
//   counts differ between RJ pieces, so only the rounded figures are used.
//   Ember (Richmond American) and Sandbluff (D.R. Horton) are on the
//   community's own wayfinding sign in Mikey's footage; no builder page for
//   either was found, so neither gets a price or date.
// - HOA $75/mo and LID "$800 every six months" (video 7:21-7:40) were quoted
//   to Mikey at the model and could NOT be confirmed in any builder, HOA or
//   city document. Not published as numbers. The City of Henderson
//   assessment record (AMG, district T-23-1, parcel 160-34-312-001, a
//   Pulte-owned Dalea lot) confirms an LID exists with semiannual
//   installments through 12/1/2055; its amount is for a different lot type
//   and is not quoted.
// - Options "about $75,000" and model upgrades "$250K-$300K" (8:53-9:21)
//   are sales-team figures relayed in the video; unverifiable, so the article
//   describes them qualitatively and points to the timestamp.
// - "Just east of Cadence": not in a primary text, but confirmed by
//   OpenStreetMap geometry (the map below). "Across from Lake Las Vegas":
//   supported by the Ordinance 3995 / NDEP location text (south of Lake
//   Mead Parkway at Lake Las Vegas Parkway; south of Lake Las Vegas).
// - Greenbow Park: named on the park's own sign in Mikey's footage; FOX5
//   (9/16/2026) calls it Aries' first completed park.
//
// IMAGERY: all Mikey's own footage, shot 2026-10-06 (Media\Henderson\Aries),
// plus one Media Image Library still. Hero + 4 inline stills extracted from
// the original 4K DJI clips (the directory-sign frame from the final 1080p
// export, since its source clip is no longer in the media folder), optimized
// with Sharp. Full-size privacy check done: no readable plates, no
// identifiable private people, no readable house numbers. The location map is
// a frame of LVINIT's own graphic from the video, built on OpenStreetMap data
// (ODbL attribution in the caption). NDEP historical photos were NOT used:
// no usage terms are stated anywhere, and state works aren't automatically
// public domain. The YouTube thumbnail isn't used as a poster.
// ---------------------------------------------------------------------------

const PATH = "/guides/aries-henderson";
const HERO = "/images/hero/aries-henderson-monument-sign-mountains.webp";
const HERO_ALT =
  "The Aries monument sign at the community entrance in east Henderson, with new landscaping in front and desert mountains behind it under a blue sky.";

const meta: StoryMeta = {
  title: "Aries Henderson: What Buyers Should Know | LVINIT",
  headline:
    "Aries Henderson: What Buyers Should Know About Henderson's New Community",
  description:
    "Aries is Pulte's new master plan on the former Three Kids Mine site in east Henderson, with about 3,000 homes planned. Mine history, what's for sale now, costs, and who it fits.",
  path: PATH,
  image: HERO,
  imageWidth: 2400,
  imageHeight: 1350,
  imageAlt: HERO_ALT,
  datePublished: "2026-10-11",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Henderson", path: "/neighborhoods/henderson" },
    { name: "Aries", path: PATH },
  ],
  video: {
    name: "This Used to Be a Mine. Now Henderson Is Building 3,000 Homes Here",
    description:
      "Mikey Del Rosario tours Aries in east Henderson, the new master-planned community on the former Three Kids Mine site: the mine history and cleanup, Pulte's Parklane model at Oasis Canyon, ownership costs, what's still unfinished, and who the community fits.",
    thumbnailUrl: "https://i.ytimg.com/vi/I1bWPO4q3FY/maxresdefault.jpg",
    uploadDate: "2026-10-08",
    duration: "PT14M5S",
    embedUrl: "https://www.youtube.com/embed/I1bWPO4q3FY",
    contentUrl: "https://www.youtube.com/watch?v=I1bWPO4q3FY",
  },
};

export const metadata: Metadata = buildStoryMetadata(meta);

const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

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
        <span
          className={`block text-caption text-lvinit-warmgray ${label ? "mt-1" : ""}`}
        >
          {caption}
        </span>
      </figcaption>
    </figure>
  );
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-5 space-y-3 text-body-lg text-lvinit-warmgray">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

type Stat = { value: string; label: string; note: string };

const SNAPSHOT: Stat[] = [
  {
    value: "~3,000",
    label: "Homes planned",
    note: "Phased through about 2032, per NDEP",
  },
  {
    value: "1917\u20131961",
    label: "Three Kids Mine",
    note: "Manganese for the U.S. government",
  },
  {
    value: "4 + 1",
    label: "Pulte neighborhoods",
    note: "Four selling, Sundale pricing coming soon",
  },
  {
    value: "2028",
    label: "Cleanup closure target",
    note: "Site-wide, per NDEP Fact Sheet #5",
  },
];

function SnapshotPanel() {
  return (
    <section
      id="at-a-glance"
      aria-label="Aries at a glance"
      className="scroll-mt-24"
    >
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            Aries at a glance
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            As of October 11, 2026, from the City of Henderson, the Nevada
            Division of Environmental Protection and the builder. Sources are
            listed at the end.
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

type Plan = { name: string; price: string; size: string; beds: string; garage: string };

const OASIS_PLANS: Plan[] = [
  { name: "Stella", price: "$569,990", size: "2,210+", beds: "3", garage: "2\u20133 car" },
  { name: "Gardengate", price: "$579,990", size: "2,294+", beds: "3\u20134", garage: "3 car" },
  { name: "Parklane (the model I toured)", price: "$599,990", size: "2,519+", beds: "3\u20134", garage: "2\u20133 car" },
];

type Neighborhood = { name: string; builder: string; status: string };

const NEIGHBORHOODS: Neighborhood[] = [
  { name: "Dalea", builder: "Pulte", status: "Selling. Two-story townhomes, from the high $300,000s" },
  { name: "Desert Mesa", builder: "Pulte", status: "Selling. From the mid-to-high $400,000s" },
  { name: "Sora", builder: "Pulte", status: "Selling. From the mid-to-high $400,000s" },
  { name: "Oasis Canyon", builder: "Pulte", status: "Selling. Single-story, from $569,990" },
  { name: "Sundale", builder: "Pulte", status: "Coming soon. Pricing not yet published" },
  { name: "Del Webb (55+)", builder: "Del Webb", status: "Planned. \u201cComing soon in 2027\u201d" },
  { name: "Ember", builder: "Richmond American", status: "On the community sign. No pricing found" },
  { name: "Sandbluff", builder: "D.R. Horton", status: "On the community sign. No pricing found" },
];

export default function AriesHendersonPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Henderson \u00b7 New Construction",
        headline:
          "Aries Henderson: What Buyers Should Know About Henderson\u2019s New Community",
        subheadline:
          "An old manganese mine in east Henderson is becoming a master plan of about 3,000 homes. Here\u2019s what\u2019s actually there today, what\u2019s still coming, and what to understand before you fall for a model home.",
        image: HERO,
        imageAlt: HERO_ALT,
        imageTitle: "Photo: Mikey Del Rosario",
        backLink: { label: "Henderson", href: "/neighborhoods/henderson" },
        ctas: [{ label: "Watch the tour", href: "#watch", variant: "primary" }],
      }}
      relatedStories={{
        heading: "Keep reading",
        intro:
          "Aries makes more sense next to the rest of Henderson, and next to how buying new construction actually works.",
        stories: [
          {
            name: "Buying New Construction in Las Vegas: How It Works",
            href: "/guides/buying-new-construction-las-vegas",
            category: "Buyer Guide",
            dek: "Bringing your own agent, incentives, lot premiums, the design center, phases and SID/LID, before your first model visit.",
          },
          {
            name: "New Build vs Resale in Las Vegas: Which Should You Buy?",
            href: "/guides/new-build-vs-resale-las-vegas",
            category: "Buyer Guide",
            dek: "Whether to buy new at all, before you narrow down a builder.",
          },
          {
            name: "Summerlin vs. Henderson",
            href: "/guides/summerlin-vs-henderson",
            category: "Comparison",
            dek: "The other side of the valley, if you're still deciding which side you want.",
          },
          {
            name: "Henderson vs. Southwest Las Vegas",
            href: "/guides/henderson-vs-southwest-las-vegas",
            category: "Comparison",
            dek: "Another place a lot of new-construction shoppers end up comparing.",
          },
          {
            name: "Sandstone at Tule Springs",
            href: "/guides/sandstone-tule-springs-north-las-vegas",
            category: "Local Feature",
            dek: "A new master plan on the opposite edge of the valley, also early in its buildout.",
          },
          {
            name: "Moving to Las Vegas",
            href: "/guides/moving-to-las-vegas",
            category: "Moving Here",
            dek: "Choosing a part of the valley before you choose a house.",
          },
        ],
      }}
      relatedNeighborhood={{
        name: "Henderson",
        href: "/neighborhoods/henderson",
        kicker: "The area guide",
        heading: "Read the Henderson guide",
        blurb:
          "Aries sits in what our Henderson guide calls the eastern half of the city, next to Cadence and Lake Las Vegas. The guide explains how that side compares with Green Valley, Anthem and Inspirada.",
      }}
      ctas={{
        heading: "Weighing Aries?",
        body:
          "If Aries is on your list, I can help you compare the builders, the homes that are actually available, lot premiums, incentives and what it really costs to own there, HOA and LID included. We can line it up against other new construction in Henderson and around Las Vegas, so you see the tradeoffs before you pick a builder.",
      }}
    >
      <StoryLede
        kicker="Henderson · New Construction"
        lead="This used to be a manganese mine. Now it's Aries, a master-planned community on the east side of Henderson with about 3,000 homes planned. The model homes are nice. They're also the least important thing to understand about buying here."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          I went out to Aries to see what it actually is: what&rsquo;s already
          built, what&rsquo;s still dirt, and whether buying this early in a
          community this big makes sense. This page is the written companion to
          that video. It follows the same order, with the facts checked and
          dated. For how Aries fits the rest of the city, start with the{" "}
          <Link href="/neighborhoods/henderson" className={linkCls}>
            Henderson guide
          </Link>
          .
        </p>
      </StoryLede>

      <StoryVideo
        youtubeId="I1bWPO4q3FY"
        title="This Used to Be a Mine. Now Henderson Is Building 3,000 Homes Here, by Mikey Del Rosario, LVINIT"
        eyebrow="Watch the tour"
        heading="This used to be a mine. Now Henderson is building 3,000 homes here"
        intro="My 14-minute walk through Aries: the mine history, Pulte's Parklane model at Oasis Canyon, ownership costs, what's unfinished, and who I think it fits."
      />

      <SnapshotPanel />

      <StorySection heading="Where Aries is in Henderson">
        <p className="text-body-lg text-lvinit-warmgray">
          Aries is on the far east side of Henderson, on the south side of Lake
          Mead Parkway, across from Lake Las Vegas and east of Cadence. Lake
          Mead is farther east again. That makes it a completely different side
          of Henderson from places like Inspirada, Seven Hills or Green Valley,
          and that matters. When people tell me they want to live in
          Henderson, those areas can feel like different cities.
        </p>
        <Figure
          src="/images/maps/aries-henderson-location-map-green-valley-seven-hills-inspirada.webp"
          width={1920}
          height={1080}
          alt="LVINIT map of Henderson showing Aries at the city's eastern edge just south of Lake Las Vegas, east of Cadence, with straight-line distances of about 10 miles to Green Valley, 13 miles to Seven Hills and 16 miles to Inspirada."
          label="Same city, different feel"
          caption="Aries sits at Henderson's eastern edge, south of Lake Las Vegas. Distances are straight-line, center to center, not driving distance. Map: LVINIT. Boundaries and map data © OpenStreetMap contributors (ODbL)."
        />
        <p className="text-body-lg text-lvinit-warmgray">
          Aries is a newer-edge-of-the-valley kind of development. You get
          mountains, open desert, and Lake Las Vegas and Lake Mead nearby, but
          you&rsquo;re also buying into an area that&rsquo;s still being built
          out. Some people are going to love that. Other people will get here
          and decide it&rsquo;s too far out for them. I&rsquo;d rather you see
          that for yourself before you commit to anything.
        </p>
      </StorySection>

      <StorySection muted heading="From Three Kids Mine to Aries">
        <p className="text-body-lg text-lvinit-warmgray">
          Before any houses were here, this land was part of the Three Kids
          Mine. It was discovered in 1917, and manganese was mined here for the
          U.S. government until 1961, mostly for ships and tanks in both World
          Wars, according to the Nevada Division of Environmental Protection
          (NDEP). Government manganese stockpiles stayed on the site into the early 2000s.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The City of Henderson adopted the{" "}
          <span className="text-lvinit-black">
            Lakemoor Canyon Redevelopment Area
          </span>{" "}
          in 2009. It covers 1,259 acres, including the former mine, and the
          city says the site is being restored and redeveloped for residential
          use. A 2014 federal law allowed the federal land to be transferred.
          In February 2024 it passed through the City of Henderson
          Redevelopment Agency to PN II Inc., a Pulte subsidiary that is
          carrying out the cleanup. Aries itself covers more than 1,100 acres.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That&rsquo;s what makes this more interesting to me than another new
          subdivision. Nobody just extended a street into empty desert. This
          land had a whole different life before the houses showed up.
        </p>
      </StorySection>

      <StorySection heading="What happened with the cleanup">
        <p className="text-body-lg text-lvinit-warmgray">
          Whenever you hear &ldquo;old mine,&rdquo; the next question is what
          happened with the cleanup. NDEP is the lead agency overseeing it. In
          the video I said the City of Henderson shares that oversight. That
          isn&rsquo;t how the official documents describe it. The city&rsquo;s
          redevelopment agency handled the land transfer and the redevelopment
          agreement. NDEP says the city doesn&rsquo;t own the land and
          won&rsquo;t be liable for the cleanup. The cleanup is funded
          privately up front and reimbursed over time from property taxes
          generated by the new homes.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          According to NDEP&rsquo;s May 2026 fact sheet:
        </p>
        <Bullets
          items={[
            "Cleanup started in May 2024. Asbestos removal finished in February 2025.",
            "Mine tailings were excavated and contained, with that work completed in June 2025.",
            "The former Hydro Pit was backfilled, lined and covered with native soil. NDEP's FAQ says a community park is planned on top of it.",
            "Waste-rock reclamation and native soil cover are scheduled to finish by March 2028, with site-wide environmental closure targeted for 2028.",
          ]}
        />
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          So the cleanup isn&rsquo;t finished site-wide yet, even with people
          already living here. I&rsquo;m not saying that as a scare tactic. If
          I were buying here, I&rsquo;d read NDEP&rsquo;s fact sheet and FAQ,
          ask the builder where my lot sits relative to the former pits, and
          read the disclosures line by line. That&rsquo;s homework, not a
          reason to panic.
        </p>
      </StorySection>

      <StorySection id="planned" heading="What Aries is planned to become">
        <p className="text-body-lg text-lvinit-warmgray">
          This isn&rsquo;t supposed to be one little Pulte subdivision. NDEP
          puts the plan at approximately 3,000 homes, built in phases through
          about 2032. Pulte is the master developer and the biggest name you
          see today, but it isn&rsquo;t the only builder. In May 2026 Pulte
          sold roughly 100 lots to D.R. Horton and roughly 70 to Richmond
          American, according to Review-Journal reporting from property
          records. If you drive out today and think Aries is just Pulte, it
          will look a lot different in a few years.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Here&rsquo;s how I&rsquo;d separate what exists from what&rsquo;s
          promised:
        </p>
        <h3 className="mt-8 font-display text-subhead font-bold text-lvinit-black">
          Open now
        </h3>
        <Bullets
          items={[
            "Four Pulte neighborhoods selling homes: Dalea, Desert Mesa, Sora and Oasis Canyon.",
            "Finished, occupied streets in the first sections, next to graded lots and active construction.",
            "Greenbow Park, which FOX5 reported as Aries' first completed park when the community held its grand opening in September 2026.",
          ]}
        />
        <h3 className="mt-8 font-display text-subhead font-bold text-lvinit-black">
          Planned or coming soon
        </h3>
        <Bullets
          items={[
            "Sundale, another Pulte neighborhood. Pricing hadn't been published when I checked.",
            "Del Webb homes for buyers 55 and older, listed by the community as coming in 2027.",
            "Neighborhoods from Richmond American (Ember) and D.R. Horton (Sandbluff), both named on the on-site sign. I couldn't find published pricing or opening dates for either.",
            "More parks and trails. The community's site says three parks are coming, and the City of Henderson's 2025 announcement mentioned 40 acres of parks.",
          ]}
        />
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Treat everything in that second list as planned, not promised.
          Timelines on big master plans move, and a park on a site plan
          won&rsquo;t help you on the day you move in.
        </p>
      </StorySection>

      <StoryPullQuote>
        Model homes always look finished. The community isn&rsquo;t.
      </StoryPullQuote>

      <StorySection heading="What you can buy at Aries right now">
        <p className="text-body-lg text-lvinit-warmgray">
          These are the neighborhoods and starting-price bands shown on the
          official Aries and Pulte sites on October 11, 2026. Builder pricing
          changes often, so treat these as a starting point.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left text-body text-lvinit-warmgray">
            <caption className="sr-only">
              Aries neighborhoods, builders and status as of October 11, 2026
            </caption>
            <thead>
              <tr className="border-b border-lvinit-black">
                <th scope="col" className="py-3 pr-4 text-caption uppercase tracking-wide text-lvinit-black">
                  Neighborhood
                </th>
                <th scope="col" className="py-3 pr-4 text-caption uppercase tracking-wide text-lvinit-black">
                  Builder
                </th>
                <th scope="col" className="py-3 text-caption uppercase tracking-wide text-lvinit-black">
                  Status (Oct. 11, 2026)
                </th>
              </tr>
            </thead>
            <tbody>
              {NEIGHBORHOODS.map((n) => (
                <tr key={n.name} className="border-b border-lvinit-lightgray">
                  <th scope="row" className="py-3 pr-4 font-normal text-lvinit-black">
                    {n.name}
                  </th>
                  <td className="py-3 pr-4">{n.builder}</td>
                  <td className="py-3">{n.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Figure
          src="/images/features/aries-henderson-community-directory-sign-builders.webp"
          width={1140}
          height={750}
          alt="Aries wayfinding sign beside a community road listing Dalea, Sundale, Oasis Canyon, Sora and Desert Mesa by Pulte Homes, Ember by Richmond American and Sandbluff by D.R. Horton, with a Sundale models coming soon billboard behind it."
          label="Inside Aries, October 2026"
          caption="The community's own wayfinding sign already lists three builders. The billboard behind it says Sundale models are coming soon."
        />
        <h3 className="mt-8 font-display text-subhead font-bold text-lvinit-black">
          Oasis Canyon and the Parklane model
        </h3>
        <p className="mt-4 text-body-lg text-lvinit-warmgray">
          I toured Oasis Canyon, Pulte&rsquo;s single-story neighborhood. The
          model I walked through is the Parklane, listed from $599,990 on
          Pulte&rsquo;s site on October 11, 2026. That&rsquo;s the same
          number I read on camera.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left text-body text-lvinit-warmgray">
            <caption className="sr-only">
              Oasis Canyon floor plans from Pulte, as listed October 11, 2026
            </caption>
            <thead>
              <tr className="border-b border-lvinit-black">
                <th scope="col" className="py-3 pr-4 text-caption uppercase tracking-wide text-lvinit-black">Plan</th>
                <th scope="col" className="py-3 pr-4 text-caption uppercase tracking-wide text-lvinit-black">From</th>
                <th scope="col" className="py-3 pr-4 text-caption uppercase tracking-wide text-lvinit-black">Sq. ft.</th>
                <th scope="col" className="py-3 pr-4 text-caption uppercase tracking-wide text-lvinit-black">Beds</th>
                <th scope="col" className="py-3 text-caption uppercase tracking-wide text-lvinit-black">Garage</th>
              </tr>
            </thead>
            <tbody>
              {OASIS_PLANS.map((p) => (
                <tr key={p.name} className="border-b border-lvinit-lightgray">
                  <th scope="row" className="py-3 pr-4 font-normal text-lvinit-black">{p.name}</th>
                  <td className="py-3 pr-4 tabular-nums">{p.price}</td>
                  <td className="py-3 pr-4 tabular-nums">{p.size}</td>
                  <td className="py-3 pr-4 tabular-nums">{p.beds}</td>
                  <td className="py-3">{p.garage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          The Parklane model is set up with four bedrooms. To get the fourth,
          the third garage bay is converted, leaving a two-car garage. You can
          keep it at three bedrooms with the bigger garage instead. The guest
          rooms are up front by the entry, away from the primary suite at the
          back, and there&rsquo;s an office with French doors. The living room,
          with its black stone fireplace wall, is the showpiece. The kitchen
          island seats five.
        </p>
      </StorySection>

      <StorySection muted heading="The model is not the base house">
        <p className="text-body-lg text-lvinit-warmgray">
          The model is fully decked out. On the tour I was told what the
          average buyer typically spends on options on top of the list price,
          and roughly what it would take to make a house look like the model.
          Both are sales-office figures I can&rsquo;t verify, so I&rsquo;m not
          repeating them here as fact. You can hear them in the video at 8:53.
          The takeaway holds either way. The model shows you what the plan{" "}
          <em>can</em> look like, and the list price shows you what it costs
          to start.
        </p>
        <Figure
          src="/images/features/aries-henderson-oasis-canyon-parklane-model-living-room.webp"
          width={1800}
          height={1013}
          alt="Living room of Pulte's Parklane model at Oasis Canyon in Aries, with curved white sofas, a black stone fireplace wall with a linear electric fireplace, a wall-mounted TV and framed black-and-white art."
          label="Parklane model, Oasis Canyon"
          caption="The model's finishes and furniture are upgrades and staging, not the base-price spec."
        />
        <p className="text-body-lg text-lvinit-warmgray">
          When you walk a model, ask for the standard-features list and a
          priced options sheet. Then compare the house you&rsquo;d actually buy
          with the house you&rsquo;re standing in. The{" "}
          <Link href="/guides/buying-new-construction-las-vegas" className={linkCls}>
            new-construction buying guide
          </Link>{" "}
          walks through the design center and how upgrades get priced.
        </p>
      </StorySection>

      <StorySection id="costs" heading="The costs beyond the base price">
        <p className="text-body-lg text-lvinit-warmgray">
          The list price is where the cost starts. At Aries, plan on at least
          these on top of it:
        </p>
        <Bullets
          items={[
            <>
              <span className="text-lvinit-black">HOA dues.</span> Pulte&rsquo;s
              own pages say community association fees may apply and that its
              payment estimates don&rsquo;t include them. At the model I was
              quoted a monthly HOA figure (7:21 in the video), but I
              couldn&rsquo;t confirm it in a builder or HOA document. Get the
              number for your specific neighborhood in writing. The{" "}
              <Link href="/guides/hoa-fees-las-vegas-what-to-check" className={linkCls}>
                HOA fees guide
              </Link>{" "}
              covers what to ask for.
            </>,
            <>
              <span className="text-lvinit-black">An LID assessment.</span>{" "}
              Aries has a City of Henderson Local Improvement District. The
              city&rsquo;s assessment record for one Pulte-owned Aries lot
              shows district T-23-1, billed twice a year (June 1 and December 1)
              with installments scheduled through December 2055. Amounts vary
              by lot, and the figure I was quoted at the model is for that
              specific home. Ask for the exact assessment on the lot
              you&rsquo;re buying, and whether you can pay it off.
            </>,
            <>
              <span className="text-lvinit-black">Lot premiums.</span> Oasis
              Canyon is laid out on rising ground. The higher you go, the more
              of a view you get toward the mountains or the Strip, and the
              higher the lot premium.
            </>,
            <>
              <span className="text-lvinit-black">Options and upgrades.</span>{" "}
              See above. Budget for them, because almost nobody buys the base
              house exactly as listed.
            </>,
          ]}
        />
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If HOAs, SIDs and LIDs are new to you, the{" "}
          <Link href="/guides/buying-new-construction-las-vegas" className={linkCls}>
            new-construction guide
          </Link>{" "}
          explains how they work in Southern Nevada.
        </p>
      </StorySection>

      <StorySection muted heading="What living here is actually like right now">
        <p className="text-body-lg text-lvinit-warmgray">
          This is where I think most builder videos stop too early. Right now
          Aries is clearly in its early stages. Some streets are built and some
          houses are occupied. Other sections are still dirt, and there&rsquo;s
          construction everywhere. Pulte markets future parks, walking trails
          and more community amenities as Aries develops.
        </p>
        <Figure
          src="/images/features/aries-henderson-oasis-canyon-homes-graded-lots-aerial.webp"
          width={1800}
          height={1013}
          alt="Aerial view over a single-story model home and its parking lot in Pulte's Oasis Canyon at Aries, with finished homes, walled empty lots, new streets and desert mountains behind."
          label="Oasis Canyon, October 2026"
          caption="Finished homes on some streets, walled and graded lots on the next ones."
        />
        <p className="text-body-lg text-lvinit-warmgray">
          This isn&rsquo;t a knock on the neighborhood. It&rsquo;s just what
          buying into a brand-new master plan looks like. You&rsquo;re trading
          maturity for opportunity. You get a newer home and the chance to buy
          early, but you have to be okay living around construction while the
          rest of the neighborhood catches up.
        </p>
        <Figure
          src="/images/features/aries-henderson-greenbow-park-construction-aerial.webp"
          width={1800}
          height={1013}
          alt="Aerial view of Greenbow Park at Aries, with green turf, shade structures and terraced rock retaining walls, and a loader, trucks and graded dirt in the foreground."
          label="Greenbow Park, October 2026"
          caption="The first park is open. Graded dirt and work trucks are still all around it."
        />
      </StorySection>

      <StorySection id="too-far-out" heading="Does Aries feel too far out?">
        <p className="text-body-lg text-lvinit-warmgray">
          This was my biggest question before I drove out, and the honest
          answer is that it depends on what you&rsquo;re comparing it to. If
          you live in Green Valley now and everything you use is five minutes
          away, this will probably feel farther out. If you specifically want
          Lake Las Vegas, Lake Mead or this side of Henderson, it makes a lot
          more sense.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          That&rsquo;s why I always tell people{" "}
          <Link href="/guides/moving-to-las-vegas" className={linkCls}>
            moving to Las Vegas
          </Link>{" "}
          not to pick neighborhoods off a map. Ten miles here can completely
          change how an area feels. Lake Las Vegas is right across this side
          of town, Lake Mead is farther east, and{" "}
          <Link href="/guides/water-street-district-henderson" className={linkCls}>
            downtown Henderson and Water Street
          </Link>{" "}
          are back to the west. Boulder Highway is one of the main corridors
          connecting this side of Henderson to everything else.
        </p>
        <Figure
          src="/images/editorial/lake-las-vegas-golf-course-homes-mountains-aerial.jpg"
          width={1920}
          height={1080}
          alt="Aerial over the lake at Lake Las Vegas toward a green golf fairway, rows of homes and rugged desert mountains under a clear sky."
          label="Lake Las Vegas"
          caption="The established lake community on the north side of Lake Mead Parkway, across from Aries."
        />
        <p className="text-body-lg text-lvinit-warmgray">
          So Aries isn&rsquo;t disconnected. It just doesn&rsquo;t have the
          built-out feel of Henderson&rsquo;s older, established areas. I think
          that difference matters more than whether the model has quartz or
          granite.
        </p>
      </StorySection>

      <StorySection muted heading="The case for buying early">
        <Bullets
          items={[
            "Early can be a good thing, if the larger community actually develops the way it's planned.",
            "More than one builder is coming. That gives you more options than one builder controlling everything.",
            "The setting. You've got the mountains, access toward Lake Mead and Lake Las Vegas, and it feels completely different from much of the west side.",
            "The homes themselves are competitive with what I'm seeing in other new-construction areas around the valley.",
          ]}
        />
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          None of that is a promise about prices or appreciation, and I
          wouldn&rsquo;t buy anywhere on that basis. Buying early gets you a
          new house and a first look at the lots. It doesn&rsquo;t get you a
          finished neighborhood.
        </p>
      </StorySection>

      <StorySection heading="The case for waiting">
        <Bullets
          items={[
            "You're early. That means construction, dust, trucks, empty land and waiting.",
            "If you want established restaurants, grocery stores, mature landscaping and everything already around your neighborhood, Aries probably won't give you that today.",
            "So much is still coming. I wouldn't rush into one builder or floor plan without understanding what else is planned, including the Richmond American, D.R. Horton and Del Webb neighborhoods that haven't opened yet.",
            "The cleanup's site-wide closure is targeted for 2028. Some buyers will simply want to see that finished first.",
          ]}
        />
      </StorySection>

      <StorySection muted heading="Who Aries makes sense for, and who should think twice">
        <h3 className="font-display text-subhead font-bold text-lvinit-black">
          Probably a fit if you
        </h3>
        <Bullets
          items={[
            "specifically want a new home in Henderson,",
            "don't mind being part of an early-stage master plan, construction included,",
            "like this side of the valley: Lake Las Vegas, Lake Mead and the open desert.",
          ]}
        />
        <h3 className="mt-8 font-display text-subhead font-bold text-lvinit-black">
          Think twice if you
        </h3>
        <Bullets
          items={[
            "want something more central and fully developed,",
            "want every amenity already built around you,",
            "need short drives to the west side of the valley.",
          ]}
        />
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          In that case I&rsquo;d show you other parts of Henderson too. There
          isn&rsquo;t one best neighborhood in Henderson, just the one that
          makes the most sense for how you actually live. The{" "}
          <Link href="/neighborhoods/henderson" className={linkCls}>
            Henderson guide
          </Link>{" "}
          and{" "}
          <Link href="/guides/new-build-vs-resale-las-vegas" className={linkCls}>
            new build vs resale
          </Link>{" "}
          are good next reads.
        </p>
      </StorySection>

      <StorySection heading="Before You Buy at Aries, Ask These 6 Questions">
        <ol className="list-decimal space-y-3 pl-6 text-body-lg text-lvinit-warmgray marker:text-lvinit-blue">
          <li>
            Which LID assessment applies to this lot, how many installments are
            left, and can I pay it off?
          </li>
          <li>What is the actual monthly HOA amount for this neighborhood?</li>
          <li>What is the lot premium on this specific lot, and why?</li>
          <li>
            What does this plan cost with the options I&rsquo;d actually choose,
            compared with the model?
          </li>
          <li>Which incentives are available right now, and what are the conditions?</li>
          <li>
            What&rsquo;s being built around this lot next, when is Del Webb
            coming, and how is the drive for my own routine?
          </li>
        </ol>
        <p className="mt-5 text-body text-lvinit-warmgray">
          The background for each one is above, in{" "}
          <a href="#costs" className={linkCls}>
            the costs beyond the base price
          </a>
          ,{" "}
          <a href="#planned" className={linkCls}>
            what Aries is planned to become
          </a>{" "}
          and{" "}
          <a href="#too-far-out" className={linkCls}>
            does Aries feel too far out
          </a>
          .
        </p>
      </StorySection>

      <StorySection heading="Mikey's take">
        <p className="text-body-lg text-lvinit-warmgray">
          Would I rule Aries out because it used to be a mine? No. I&rsquo;d do
          my homework on the remediation, understand the disclosures, and then
          judge the community on what it is today and what&rsquo;s actually
          planned.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Would I buy here just because the models look good? Also no. I&rsquo;d
          compare the price, location, lot, incentives and future builder
          options against the rest of Henderson first.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          I do think Aries is one of the more interesting new areas to watch,
          because it&rsquo;s clearly going to be much bigger than another
          Pulte subdivision. That&rsquo;s why I wanted to see it before the
          whole thing is finished. For the right buyer it&rsquo;s worth a
          serious look. It isn&rsquo;t a place to buy on impulse.
        </p>
      </StorySection>

      <StorySection muted heading="Sources">
        <p className="text-body text-lvinit-warmgray">
          All accessed October 11, 2026.
        </p>
        <ul className="mt-4 space-y-3 text-body text-lvinit-warmgray">
          <li>
            <span className="text-lvinit-black">
              Nevada Division of Environmental Protection
            </span>
            , Three Kids Mine Fact Sheet #5 (May 2026): history, lead agency,
            cleanup milestones and the 2028 closure target.{" "}
            <a href="https://ndep.nv.gov/uploads/env-sitecleanup-active-bmi-threekids/three-kids-mine-fact-sheet.pdf" className="text-lvinit-blue underline underline-offset-4" target="_blank" rel="noopener noreferrer">
              ndep.nv.gov
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">NDEP</span>, Three Kids Mine
            FAQ: 1917&ndash;1961 mining, the February 2024 land transfer, the
            city&rsquo;s lack of ownership and liability, approximately 3,000
            homes phased through 2032, and plans over the former pits.{" "}
            <a href="https://ndep.nv.gov/uploads/env-sitecleanup-active-bmi-threekids/three-kids-mine-faq.pdf" className="text-lvinit-blue underline underline-offset-4" target="_blank" rel="noopener noreferrer">
              ndep.nv.gov
            </a>{" "}
            and the{" "}
            <a href="https://ndep.nv.gov/environmental-cleanup/black-mountain-industrial-bmi-complex/three-kids-mine" className="text-lvinit-blue underline underline-offset-4" target="_blank" rel="noopener noreferrer">
              NDEP site page
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">City of Henderson</span>,
            Lakemoor Canyon Redevelopment Area: 1,259 acres, adopted 2009,
            the 2014 federal act and redevelopment for residential use.{" "}
            <a href="https://www.cityofhenderson.com/government/departments/redevelopment/redevelopment-areas/lakemoor-canyon" className="text-lvinit-blue underline underline-offset-4" target="_blank" rel="noopener noreferrer">
              cityofhenderson.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">City of Henderson</span>, 2025
            State of the City release (Nov. 13, 2025): Aries announced with
            3,000 homes and 40 acres of parks.{" "}
            <a href="https://www.cityofhenderson.com/Home/Components/News/News/1692/15" className="text-lvinit-blue underline underline-offset-4" target="_blank" rel="noopener noreferrer">
              cityofhenderson.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Aries</span> official site
            and neighborhood pages: builders, neighborhoods, price bands,
            Sundale status, Del Webb timing and planned parks.{" "}
            <a href="https://www.liveataries.com/" className="text-lvinit-blue underline underline-offset-4" target="_blank" rel="noopener noreferrer">
              liveataries.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Pulte Homes</span>, Oasis
            Canyon at Aries: plan names, starting prices, sizes and the HOA
            fee disclaimer.{" "}
            <a href="https://www.pulte.com/homes/nevada/las-vegas/henderson/oasis-canyon-at-aries-211706" className="text-lvinit-blue underline underline-offset-4" target="_blank" rel="noopener noreferrer">
              pulte.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">
              Assessment Management Group
            </span>{" "}
            (City of Henderson assessment administrator), assessment record
            for parcel 160-34-312-001: LID district T-23-1 and its payment
            schedule.{" "}
            <a href="https://www.amgnv.com/parcelsearch_results_detail_non_pop1.asp?searches=&menu=7&Dist_ID=7822&PARCEL=16034312001" className="text-lvinit-blue underline underline-offset-4" target="_blank" rel="noopener noreferrer">
              amgnv.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">Las Vegas Review-Journal</span>{" "}
            (Eli Segall), &ldquo;Builder opens big new community at former
            mining site in Henderson,&rdquo; Sept. 11, 2026: lot sales to D.R.
            Horton and Richmond American, from property records.{" "}
            <a href="https://www.reviewjournal.com/business/housing/builder-opens-big-new-community-at-former-mining-site-in-henderson-3885180/" className="text-lvinit-blue underline underline-offset-4" target="_blank" rel="noopener noreferrer">
              reviewjournal.com
            </a>
          </li>
          <li>
            <span className="text-lvinit-black">FOX5 Las Vegas</span>, Sept.
            16, 2026: the grand opening and Greenbow Park as the first
            completed park.{" "}
            <a href="https://www.fox5vegas.com/2026/09/16/new-1100-acre-master-planned-community-aries-opens-henderson/" className="text-lvinit-blue underline underline-offset-4" target="_blank" rel="noopener noreferrer">
              fox5vegas.com
            </a>
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Photos: Mikey Del Rosario, shot at Aries in October 2026. Location
          map: LVINIT, built on OpenStreetMap data. Builder pricing,
          incentives, fees and assessments change often and vary by lot.
          Confirm them with the builder and in your purchase documents before
          you rely on them. This article is general local reporting, not
          legal, environmental, financial or investment advice.
        </p>
      </StorySection>

      <StorySection heading="About this coverage">
        <p className="text-body text-lvinit-warmgray">
          Mikey Del Rosario &middot; The Scofield Group &middot; Nevada
          License S.0175577. Equal Housing Opportunity.
        </p>
      </StorySection>
    </StoryPage>
  );
}
