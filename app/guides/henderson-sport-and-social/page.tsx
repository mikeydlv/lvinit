import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildStoryMetadata, SITE_URL, type StoryMeta } from "@/lib/story";
import Container from "@/components/ui/Container";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryVideo,
} from "@/components/story";
import { LocalsNote } from "@/components/area";

// ---------------------------------------------------------------------------
// EVERGREEN VISITOR GUIDE — Henderson Sport & Social.
//
// HISTORY: this is the same article first published 2026-09-19 at
// /guides/henderson-sport-social-grand-opening (built by the scheduled Content
// Publisher routine as a grand-opening news piece). On 2026-10-15, as an
// approved one-time Content Publisher assignment from Mikey, it was moved to
// this evergreen URL and rebuilt as a full visitor guide. The old URL 301s
// here (next.config.mjs). datePublished stays 2026-09-19; dateModified is the
// rebuild date. There is only one canonical article for this subject.
//
// FIRST-PARTY SOURCE MATERIAL — Mikey toured the venue on Wednesday,
// 2026-10-14 (10:58–11:47 AM), ahead of the Oct. 16–17 grand opening. Every
// first-person observation and quote below comes from his own footage and
// the DaVinci Resolve transcript of it (Notes\HSS_03_Transcript.md, with his
// visual shot log HSS_04 and footage inventory HSS_01). Quotes are lightly
// cleaned of hesitations only. He did NOT play bowling, laser tag, mini golf,
// darts or the arcade on camera, and the article never says he did.
//
// FACT SOURCES (checked 2026-10-15):
// - hendersonsportandsocial.com — home (hours, address, phone, "no membership
//   needed" to visit the Social House), /social-house/attractions/ (all
//   activity, pass and arcade pricing), /memberships/ (tiers, inclusions,
//   discounts, $50 annual fee), /child-watch/ (ages, hours, rules),
//   /sports-complex/, /social-house/eat-drink/, and the Sept. 3, 2026
//   grand-opening announcement on its blog ($70M, 180,000 sq ft, amenity
//   counts, opening schedule, City-owns / KemperSports-operates structure).
// - City of Henderson "West Henderson Fieldhouse" initiative page — funding
//   sources, 4 courts / 2 turf fields, resident 20% discount wording. NOTE:
//   the city page still says 160,000 sq ft (pre-construction figure); the
//   venue and KemperSports say 180,000. We use 180,000 and note it.
// - $60M city / $10M KemperSports split and the May 21, 2025 groundbreaking:
//   FOX5 (June 2, 2026) and KTNV — attributed to press, not the venue.
// - Front-desk materials Mikey photographed 2026-10-14: the fitness
//   membership flyer (incl. Family Fitness + Social $345, which is not on the
//   website) and the Henderson resident price sheet ($48/$140/$124/$276).
//
// UNRESOLVED ON THE OFFICIAL SITE (stated as such in the copy):
// - Krazy Darts: priced "per bay, up to 8" in two places, "per person" in one.
// - MVP Pass laser tag: "1 round" vs. 2 rounds on the other passes.
// - Child Watch: header/section hours vs. a conflicting footer banner; no
//   published price; members-only status not stated.
// - Whether the 20% Henderson discount applies to attractions or only
//   memberships (city says all amenities; venue lists it under memberships).
//
// IMAGERY — 12 original LVINIT images, all from the 2026-10-14 visit, none
// from the Media Image Library (it has no records for this venue yet, so no
// usedOn/usage updates apply). Nine are Mikey's Galaxy S26 Ultra stills
// (C:\LVINIT\Media\Henderson\Henderson Sport and Social - Walkthrough\
// Images\): hero = 20261014_111237, plus 114518, 114558, 114609, 114255,
// 114649, 114738, 114339, 114421. Three are stills from his landscape
// walkthrough footage (DJI 4K, Rec.709 SDR — not the HLG portrait take, so
// no tone mapping was needed), taken from the 1080p review render
// (HSS_01_First_Cut_review_v1_compressed.mp4) at 8:44 (fitness floor), 10:05
// (Play Zone) and 11:02 (balcony). Ordinary crop/resize/WebP only. The new
// hero has no prior hero placement; the Sept. 22 construction-era hero and
// inline images are retired from this page but left on disk.
// ---------------------------------------------------------------------------

const PATH = "/guides/henderson-sport-and-social";
const CHECKED = "October 15, 2026";
const OFFICIAL = "https://hendersonsportandsocial.com/";
const ATTRACTIONS = "https://hendersonsportandsocial.com/social-house/attractions/";
const MEMBERSHIPS = "https://hendersonsportandsocial.com/memberships/";
const CHILD_WATCH = "https://hendersonsportandsocial.com/child-watch/";
const HERO = "/images/hero/henderson-sport-and-social-exterior-entrance-signage-st-rose-parkway.webp";
const HERO_ALT =
  "The navy-blue entrance wing of Henderson Sport & Social with large HENDERSON SPORT & SOCIAL lettering, the 3375 St. Rose Pkwy address and a COMPETE banner, under a clear blue sky in West Henderson";

const meta: StoryMeta = {
  title: "Henderson Sport & Social: Prices, Hours & Full Tour (2026) | LVINIT",
  headline:
    "Henderson Sport & Social: Full Tour, Prices, Hours & What to Know Before Visiting",
  description:
    "Explore Henderson Sport & Social in West Henderson with a firsthand video tour, bowling prices, memberships, operating hours, original photos, and visitor tips.",
  path: PATH,
  image: HERO,
  imageWidth: 2000,
  imageHeight: 1500,
  imageAlt: HERO_ALT,
  datePublished: "2026-09-19",
  dateModified: "2026-10-15",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Henderson", path: "/neighborhoods/henderson" },
    { name: "Henderson Sport & Social", path: PATH },
  ],
  video: {
    name: "Inside Henderson's NEW $70 Million Sports & Entertainment Complex!",
    description:
      "Mikey Del Rosario walks through Henderson Sport & Social in West Henderson before its grand opening: bowling and VIP lanes, the arcade, Krazy Darts, outdoor mini golf, basketball courts, indoor turf fields, the fitness center, the Play Zone, event spaces and the view from the upstairs balcony.",
    thumbnailUrl: "https://i.ytimg.com/vi/hBjCrdjhi8A/maxresdefault.jpg",
    uploadDate: "2026-10-15T11:30:01-07:00",
    duration: "PT14M54S",
    embedUrl: "https://www.youtube-nocookie.com/embed/hBjCrdjhi8A",
    contentUrl: "https://www.youtube.com/watch?v=hBjCrdjhi8A",
  },
};

export const metadata: Metadata = buildStoryMetadata(meta);

const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

function Ext({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className={linkCls} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function Figure({
  src,
  alt,
  caption,
  priority = false,
}: {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
}) {
  return (
    <figure className="my-8">
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg border border-lvinit-lightgray bg-lvinit-lightgray">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 680px"
          className="object-cover"
          priority={priority}
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-caption text-lvinit-warmgray">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function H3({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h3
      id={id}
      className="mt-12 scroll-mt-24 font-display text-subhead font-bold text-lvinit-black first:mt-0"
    >
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-body-lg text-lvinit-warmgray">{children}</p>;
}

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-6 border-l-2 border-lvinit-blue pl-5 text-body-lg italic text-lvinit-black">
      {children}
    </blockquote>
  );
}

function Table({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-left text-body text-lvinit-warmgray">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-lvinit-black">
            {head.map((h) => (
              <th
                key={h}
                scope="col"
                className="py-3 pr-4 text-caption uppercase tracking-wide text-lvinit-black"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-lvinit-lightgray align-top">
              {r.map((c, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className="py-3 pr-4 font-normal text-lvinit-black">
                    {c}
                  </th>
                ) : (
                  <td key={j} className="py-3 pr-4">
                    {c}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const QUICK_FACTS: { label: string; value: React.ReactNode }[] = [
  {
    label: "Where",
    value: "3375 St. Rose Pkwy, Henderson, NV 89052 — St. Rose and Maryland Pkwys, West Henderson",
  },
  { label: "Size", value: "About 180,000 sq ft over two levels (about $70 million to build)" },
  {
    label: "What's inside",
    value:
      "20 bowling lanes (6 VIP), arcade, laser tag, Krazy Darts, outdoor 18-hole mini golf, 4 basketball courts, 2 indoor turf fields, fitness center, restaurant and bar, event rooms, Child Watch",
  },
  {
    label: "Opened",
    value: "Soft opening Oct. 5, 2026; grand opening weekend Oct. 16–17, 2026",
  },
  { label: "Admission", value: "No general entry fee — activities are pay as you go" },
  {
    label: "Membership needed?",
    value: "Only for the fitness center. Not for bowling, games, food or leagues",
  },
  { label: "Phone", value: "(702) 899-0242" },
  {
    label: "Official site",
    value: <Ext href={OFFICIAL}>hendersonsportandsocial.com</Ext>,
  },
];

type Faq = { q: string; a: string };

const FAQS: Faq[] = [
  {
    q: "Where is Henderson Sport & Social?",
    a: "3375 St. Rose Pkwy, Henderson, NV 89052, near St. Rose and Maryland Parkways in West Henderson, right behind Chicken N Pickle.",
  },
  {
    q: "Is Henderson Sport & Social open?",
    a: "Yes. It soft-opened October 5, 2026, with an official grand opening weekend on October 16–17, 2026. The Social House is open Sunday–Thursday 8 AM–11 PM and Friday–Saturday 8 AM–1 AM. Check the official site for holiday hours.",
  },
  {
    q: "Is there a general admission fee?",
    a: "No. You can walk in without a membership or a ticket and pay only for what you do — bowling, laser tag, mini golf, darts, arcade credits, or food and drinks.",
  },
  {
    q: "Do I need a membership?",
    a: "Only if you want the fitness center. The venue says no membership is needed to visit the Social House, register for sports programs or book experiences.",
  },
  {
    q: "How much is bowling at Henderson Sport & Social?",
    a: "Standard lanes are $45 per lane per hour Monday–Thursday and $55 Friday–Sunday and holidays, for up to six people per lane. Shoe rental is $5 per person (prices checked October 15, 2026).",
  },
  {
    q: "How much is VIP bowling?",
    a: "The six VIP lanes are $55 per lane per hour Monday–Thursday and $75 Friday–Sunday and holidays, up to six people per lane. The pricing page also lists $5 shoe rental; confirm at the desk whether it's included.",
  },
  {
    q: "Does Henderson Sport & Social have mini golf?",
    a: "Yes — an outdoor 18-hole course. It's $12 per person Monday–Thursday and $15 Friday–Sunday and holidays, and it may close in bad weather.",
  },
  {
    q: "How much is laser tag?",
    a: "$10 per person for one game, $17 for two and $25 for three. It's recommended for ages 5 and up, and players must be able to handle the equipment on their own.",
  },
  {
    q: "What is included with the Discovery Pass?",
    a: "The Discovery Pass is $25 per person and lets you choose any two of: one hour of bowling with shoes, two rounds of laser tag, 18 holes of mini golf, 45 minutes of Krazy Darts, or a $10 arcade card. The arcade card is one of the two choices, not an extra. Passes are sold in person only.",
  },
  {
    q: "Does it have an arcade?",
    a: "Yes. Arcade cards load at $1 = 5 credits with a $1 new-card fee, and larger loads add bonus value — for example, $20 buys 125 credits ($25 value).",
  },
  {
    q: "Is there indoor soccer?",
    a: "Yes. There are two indoor hybrid turf fields used for soccer and other field sports, plus leagues and tournaments run by the venue.",
  },
  {
    q: "Does it have basketball courts?",
    a: "Yes — four indoor courts that convert for volleyball and pickleball. Open play is included with memberships on a limited, scheduled basis; leagues and rentals are booked separately.",
  },
  {
    q: "Is there a fitness center?",
    a: "Yes. The fitness center is open daily 6 AM–10 PM and requires a membership, which starts at $60 a month for an individual (before discounts).",
  },
  {
    q: "Does Henderson Sport & Social have Child Watch?",
    a: "Yes. Child Watch takes children 9 months to 11 years old, for up to two hours per visit. Posted hours are Monday–Friday 6 AM–noon and 3:30–8 PM, and Saturday–Sunday 8 AM–noon, though one banner on the site lists different hours. The site does not publish a price.",
  },
  {
    q: "Can parents leave during Child Watch?",
    a: "No. A parent or guardian has to stay inside the facility the whole time, stay reachable by phone, and come back right away if called. It is not drop-off daycare.",
  },
  {
    q: "Is there a Henderson resident discount?",
    a: "Yes. Henderson locals get 20% off memberships with valid ID on the first visit — for example, $48 instead of $60 for individual fitness. The City of Henderson describes the discount as covering all amenities; confirm at the front desk whether it applies to the activity you're paying for.",
  },
  {
    q: "Are reservations available?",
    a: "Yes, for bowling lanes, Krazy Darts bays and parties, which can be booked online. Laser tag, mini golf and attraction passes are bought in person when you arrive. Evenings and weekends book up, so reserve ahead.",
  },
  {
    q: "Is food available?",
    a: "Yes. There's a full-service restaurant and bar with shareable boards, burgers, bowls and pizza, plus a quick food counter, and food can be served at the bowling lanes.",
  },
  {
    q: "Can you book events at Henderson Sport & Social?",
    a: "Yes. There are event rooms off the arcade, a multipurpose room upstairs called The Flex, and full-venue buyouts for groups of up to 1,000. Inquiries go to events@hendersonsportandsocial.com.",
  },
  {
    q: "Where can I watch a complete video walkthrough?",
    a: "Mikey Del Rosario's full walkthrough is embedded on this page and on YouTube as \"Inside Henderson's NEW $70 Million Sports & Entertainment Complex!\"",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

// The venue itself, as the article's subject. Only facts published by the
// venue — no ratings, reviews, price ranges or hours (hours conflict for
// Child Watch, so they're left to the article body).
const venueJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  "@id": `${SITE_URL}${PATH}#venue`,
  name: "Henderson Sport & Social",
  url: OFFICIAL,
  telephone: "+1-702-899-0242",
  address: {
    "@type": "PostalAddress",
    streetAddress: "3375 St. Rose Pkwy",
    addressLocality: "Henderson",
    addressRegion: "NV",
    postalCode: "89052",
    addressCountry: "US",
  },
};

export default function HendersonSportAndSocialPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Henderson · Visitor Guide",
        headline:
          "Henderson Sport & Social: Full Tour, Prices, Hours & What to Know Before Visiting",
        subheadline:
          "I walked through West Henderson's new 180,000-square-foot sports and entertainment complex two days before its grand opening. Here's what's inside, what it costs, and whether you actually need a membership.",
        image: HERO,
        imageAlt: HERO_ALT,
        backLink: { label: "Henderson", href: "/neighborhoods/henderson" },
        ctas: [
          { label: "Watch the tour", href: "#watch", variant: "primary" },
          { label: "See prices", href: "#prices", variant: "secondary" },
        ],
      }}
      relatedStories={{
        heading: "Keep exploring Henderson",
        intro: "Where Henderson Sport & Social fits in the rest of LVINIT's Henderson coverage.",
        stories: [
          {
            name: "Living in Henderson",
            href: "/neighborhoods/henderson",
            category: "Area Guide",
            dek: "The full guide to Henderson's communities, including the West Henderson planning area this venue sits in.",
          },
          {
            name: "Aries, Henderson",
            href: "/guides/aries-henderson",
            category: "New Construction",
            dek: "A look at another part of Henderson that's being built out right now.",
          },
          {
            name: "Henderson vs. Southwest Las Vegas",
            href: "/guides/henderson-vs-southwest-las-vegas",
            category: "Comparisons",
            dek: "How Henderson stacks up against the valley's other big growth corridor.",
          },
          {
            name: "Summerlin vs. Henderson",
            href: "/guides/summerlin-vs-henderson",
            category: "Comparisons",
            dek: "The two master-planned heavyweights, side by side.",
          },
        ],
      }}
      relatedNeighborhood={{
        name: "Henderson",
        href: "/neighborhoods/henderson",
        kicker: "The parent guide",
        heading: "Read the Henderson guide",
        blurb:
          "Henderson Sport & Social is in the West Henderson planning area. Our Henderson guide covers the communities around it, from Inspirada to the newer neighborhoods off St. Rose.",
      }}
      ctas={{
        heading: "Thinking about West Henderson?",
        body: "If a place like this is part of why you're looking at this side of town, I'm happy to tell you what the neighborhoods around it are actually like — the good parts and the tradeoffs.",
      }}
    >
      <StoryLede
        kicker="Firsthand visitor guide"
        lead="On Wednesday, October 14, 2026, I got a walkthrough of Henderson Sport & Social two days before its grand opening. It's a city-owned, privately run indoor sports and entertainment complex at St. Rose and Maryland Parkways in West Henderson — bowling, an arcade, laser tag, mini golf, basketball courts, indoor turf fields, a gym and a restaurant, all under one roof."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          The short version: you don&rsquo;t need a membership to go. You walk
          in, pay for whatever you want to do, and leave. Memberships are for
          the fitness center. Below is everything I saw, what it costs (checked
          against the official price list on {CHECKED}), and what I&rsquo;d
          want to know before taking my own family.
        </p>
      </StoryLede>

      <section aria-labelledby="quick-facts" className="scroll-mt-24">
        <Container className="py-10 sm:py-12">
          <div className="mx-auto max-w-[900px]">
            <h2
              id="quick-facts"
              className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black"
            >
              Quick facts
            </h2>
            <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-lvinit-lightgray bg-lvinit-lightgray sm:grid-cols-2">
              {QUICK_FACTS.map((f) => (
                <div key={f.label} className="bg-lvinit-white p-5">
                  <dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                    {f.label}
                  </dt>
                  <dd className="mt-2 text-body text-lvinit-black">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <StoryVideo
        youtubeId="hBjCrdjhi8A"
        title="Inside Henderson's NEW $70 Million Sports & Entertainment Complex! — full walkthrough by Mikey Del Rosario, LVINIT"
        eyebrow="Full video tour"
        heading="Watch My Full Henderson Sport & Social Walkthrough"
        intro="About 15 minutes, start to finish: the front desk, bowling and VIP lanes, the arcade, the courts and turf, the gym, the Play Zone, and the view from the upstairs balcony."
      />
      <Container className="pb-4">
        <p className="mx-auto max-w-[900px] text-caption text-lvinit-warmgray">
          Prefer YouTube?{" "}
          <Ext href="https://www.youtube.com/watch?v=hBjCrdjhi8A">
            Watch it on YouTube
          </Ext>
          .
        </p>
      </Container>

      <StorySection heading="What's inside Henderson Sport & Social?" id="inside">
        <p className="text-body-lg text-lvinit-warmgray">
          The building splits into two halves. The front is the{" "}
          <span className="text-lvinit-black">Social House</span>: the lobby,
          bar and restaurant, bowling, arcade, laser tag and darts, with mini
          golf out the side doors. Behind it is the{" "}
          <span className="text-lvinit-black">sports complex</span> — the
          courts and turf fields — with the gym and Child Watch upstairs.
          Partway through the tour I described it on camera as &ldquo;basically
          a Dave and Busters with Lucky Strike into it, with some basketball
          hoops, a gym all in one.&rdquo; That&rsquo;s still the quickest way
          to explain it.
        </p>

        <H3 id="bowling">Bowling and VIP lanes</H3>
        <P>
          There are 20 lanes in total: 14 in the main bowling area and 6 VIP
          lanes in their own room. The main lanes have blacklight lighting, big
          LED walls above the pins and lounge seating behind the approach.
        </P>
        <Figure
          src="/images/features/henderson-sport-and-social-bowling-lanes.webp"
          alt="Main bowling lanes at Henderson Sport & Social under purple lighting, with colorful LED screens above the pins, overhead score monitors and leather lounge seating in the foreground"
        />
        <P>
          The VIP room is quieter, with upholstered sofas, low tables and its
          own LED wall. It&rsquo;s the one I&rsquo;d book for a birthday or a
          work group, because you aren&rsquo;t sharing the space with the rest
          of the floor. VIP lanes cost $10–$20 more per lane-hour than standard
          (see <a href="#prices" className={linkCls}>prices</a>).
        </P>
        <Figure
          src="/images/features/henderson-sport-and-social-vip-bowling-lanes-lounge.webp"
          alt="The VIP bowling room at Henderson Sport & Social, with tan upholstered sofas and small tables facing a row of lanes under a geometric LED wall"
          caption="The separate VIP lane room, October 14, 2026."
        />

        <H3 id="arcade">Arcade and laser tag</H3>
        <P>
          The arcade fills the middle of the building: claw and prize machines,
          basketball games, racing cabinets (including a multi-screen Fast
          &amp; Furious racer that I very much wanted to try), rides for younger
          kids, and a prize counter. The double-decker laser tag arena is right
          off the arcade floor. The arcade runs on a reloadable card, priced
          separately from the attraction passes.
        </P>
        <Figure
          src="/images/features/henderson-sport-and-social-arcade-claw-machines.webp"
          alt="Rows of brightly lit claw and prize machines on the patterned carpet of the Henderson Sport & Social arcade"
        />

        <H3 id="krazy-darts">Krazy Darts</H3>
        <P>
          Krazy Darts is the darts lounge just off the lobby — I counted five
          bays on my walkthrough, each with a big screen, high-top tables and
          bench seating. The venue prices it by the bay (up to eight people),
          and bays can be reserved online.
        </P>
        <Figure
          src="/images/features/henderson-sport-and-social-krazy-darts-bays.webp"
          alt="The Krazy Darts lounge at Henderson Sport & Social, with high-top tables and booth seating in front of individual dart bays topped by screens labeled Krazy Darts"
        />

        <H3 id="mini-golf">Outdoor mini golf</H3>
        <P>
          The 18-hole mini golf course is outside, through the doors by the
          lobby, next to a covered patio with picnic tables. It&rsquo;s turf
          with desert landscaping and a few big blue shade umbrellas. Keep in
          mind this is the one outdoor activity here. On a July afternoon,
          that shade won&rsquo;t do much, and the venue notes the course may
          close in bad weather.
        </P>
        <Figure
          src="/images/features/henderson-sport-and-social-outdoor-mini-golf.webp"
          alt="Outdoor 18-hole mini golf course beside the Henderson Sport & Social building, with green turf, blue shade umbrellas, desert landscaping and a colorful mural on the wall"
        />

        <H3 id="basketball">Basketball courts</H3>
        <P>
          This is where the size of the building really hit me. The court hall
          has four full courts on one maple floor, with retractable hoops,
          bleachers and clerestory windows. A volleyball net was set up in the
          back when I was there; the courts also convert for pickleball. From
          the upstairs mezzanine you can look down over all four.
        </P>
        <Figure
          src="/images/features/henderson-sport-and-social-indoor-basketball-courts.webp"
          alt="The large indoor court hall at Henderson Sport & Social, with a maple floor marked for multiple courts, retractable basketball hoops and high steel trusses"
        />

        <H3 id="turf">Indoor turf fields</H3>
        <P>
          Through a tunnel past the courts are two full-size indoor turf fields
          with goals and high-bay lighting. I said on camera that you
          could probably split them into smaller fields for younger kids. The
          City of Henderson lists the fields for indoor soccer, box lacrosse and
          indoor football.
        </P>
        <Quote>
          &ldquo;Nobody wants to play soccer out in the heat on some hot
          grass.&rdquo;
        </Quote>
        <Figure
          src="/images/features/henderson-sport-and-social-indoor-turf-field.webp"
          alt="An indoor turf field at Henderson Sport & Social, with white and yellow field lines under bright high-bay lights"
        />

        <H3 id="fitness">Fitness center</H3>
        <P>
          The fitness center (sponsored as the Bighorn Law Fitness Center) is
          upstairs. All the equipment is brand new: selectorized strength
          machines, free weights, a big functional training rig, and a row of
          cardio machines facing a window that looks down onto the basketball
          courts. Next door is The Studio, a group-fitness room with mirrors, a
          barre and spin bikes. This is the part of the building you need a
          membership for.
        </P>
        <Figure
          src="/images/features/henderson-sport-and-social-fitness-center-floor.webp"
          alt="The fitness center floor at Henderson Sport & Social, with rows of new strength machines and a large functional training rig under black open ceilings"
          caption="Still from my walkthrough footage, October 14, 2026."
        />

        <H3 id="child-watch">Child Watch / Play Zone</H3>
        <P>
          Child Watch happens in the Play Zone, a bright room upstairs near the
          gym with soft play mats, a play fence, a tunnel, bean bags and
          kid-size tables. As I noted on camera, only water is allowed inside,
          and staff don&rsquo;t change diapers or take kids to the bathroom. More on how it works under{" "}
          <a href="#kids" className={linkCls}>Visiting with kids</a>.
        </P>
        <Figure
          src="/images/features/henderson-sport-and-social-child-watch-play-zone.webp"
          alt="The Play Zone Child Watch room at Henderson Sport & Social, with a fenced soft-play area, a rainbow play tunnel, a toddler basketball hoop and bean bag seats"
          caption="The Play Zone, empty on my visit. Still from my walkthrough footage."
        />

        <H3 id="food-events">Restaurant, bar and event spaces</H3>
        <P>
          The restaurant and bar take up the front of the building, with a long
          bar, a wall of TVs showing sports and a big dining room.
          There&rsquo;s also a quick food counter with snacks and drinks. The
          official menu leans into shareable &ldquo;social boards,&rdquo; smash
          burgers, bowls and pizza, and food is served at the lanes too.
        </P>
        <Figure
          src="/images/features/henderson-sport-and-social-bar-dining-room.webp"
          alt="The bar at Henderson Sport & Social, with a long white counter, orange-backed stools, sports on a row of TVs above, and a mountain mural on the far wall of the dining area"
        />
        <P>
          For parties, there&rsquo;s a row of event rooms off the arcade —
          I counted about five, and the one I filmed opens into the next through
          a movable partition — plus The Flex, a
          multipurpose room upstairs that opens onto a balcony and can be booked
          for business or educational events. The venue says groups of up to
          1,000 can book out the whole building.
        </P>
      </StorySection>

      <StorySection heading="Henderson Sport & Social prices" id="prices">
        <p className="text-body-lg text-lvinit-warmgray">
          Everything here is pay as you go at the front desk. These prices come
          from the venue&rsquo;s{" "}
          <Ext href={ATTRACTIONS}>official attractions page</Ext>, checked{" "}
          <span className="text-lvinit-black">{CHECKED}</span>, and they match
          the price screens I filmed at the front desk on October 14. Prices and
          availability can change, so check before you go.
        </p>
        <Table
          caption={`Henderson Sport & Social activity prices, checked ${CHECKED}`}
          head={["Activity", "Mon–Thu", "Fri–Sun & holidays", "Unit and notes"]}
          rows={[
            ["Bowling (standard)", "$45", "$55", "Per lane, per hour, up to 6 people. Shoes $5 per person"],
            ["Bowling (VIP)", "$55", "$75", "Per lane, per hour, up to 6 people. $5 shoe rental listed; confirm if included"],
            ["Mini golf (outdoor, 18 holes)", "$12", "$15", "Per person"],
            ["Laser tag", "$10 / $17 / $25", "Same", "Per person, for 1 / 2 / 3 games. Ages 5+ recommended"],
            ["Krazy Darts", "$55", "$65", "Per bay, up to 8 people (see note below)"],
          ]}
        />
        <p className="mt-5 text-body text-lvinit-warmgray">
          <span className="text-lvinit-black">Per lane vs. per person:</span>{" "}
          bowling is priced by the lane, so six people splitting a standard lane
          on a weeknight works out to $7.50 each for the hour, plus shoes. Mini
          golf and laser tag are per person.{" "}
          <span className="text-lvinit-black">Krazy Darts caveat:</span> the
          official page lists it per bay in two places and per person in one,
          so confirm the unit when you book.
        </p>

        <H3 id="arcade-prices">Arcade credits</H3>
        <P>
          Every $1 loads 5 credits, and most games cost 2–12 credits. There&rsquo;s
          a $1 fee for a new card. Bigger loads add bonus value:
        </P>
        <Table
          caption={`Henderson Sport & Social arcade card prices, checked ${CHECKED}`}
          head={["You pay", "Credits", "Listed value"]}
          rows={[
            ["$20", "125", "$25"],
            ["$45", "275", "$55"],
            ["$65", "400", "$80"],
            ["$105", "625", "$125"],
            ["$175", "1,025", "$205"],
            ["$325", "2,500", "$500"],
          ]}
        />
      </StorySection>

      <StorySection heading="Are the attraction passes worth it?" id="passes">
        <p className="text-body-lg text-lvinit-warmgray">
          The venue sells three per-person passes that bundle activities. They
          are sold in person only, at the front desk.
        </p>
        <Table
          caption={`Henderson Sport & Social attraction passes, checked ${CHECKED}`}
          head={["Pass", "Price", "What you get"]}
          rows={[
            [
              "Discovery",
              "$25 per person",
              "Choose any 2 from the list below",
            ],
            [
              "Challenger",
              "$36 per person",
              "Choose any 3 from the list below",
            ],
            [
              "MVP",
              "$60 per person",
              "All of them, including a $20 arcade card",
            ],
          ]}
        />
        <p className="mt-5 text-body text-lvinit-warmgray">
          The menu you choose from: 1 hour of bowling (shoes included), 2
          rounds of laser tag, 18 holes of mini golf, 45 minutes of Krazy
          Darts, or an arcade card ($10 value with Discovery, $15 with
          Challenger).
        </p>
        <P>
          Two things that are easy to get wrong:
        </P>
        <ul className="mt-4 space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              On Discovery and Challenger,{" "}
              <span className="text-lvinit-black">
                the arcade card is one of your picks, not a bonus
              </span>
              . Pick &ldquo;mini golf + arcade&rdquo; on a Discovery Pass and
              that&rsquo;s your two.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Passes are per person, while bowling is normally priced per lane.
              The venue doesn&rsquo;t spell out how pass holders share a lane,
              so ask at the desk before you assume a group of passes covers
              one lane.
            </span>
          </li>
        </ul>
        <P>
          <span className="text-lvinit-black">My read:</span> for one person
          who&rsquo;d do two or three activities anyway — say, mini golf and
          laser tag on a weekend ($15 + $17 = $32 bought separately) — a $25
          Discovery Pass is the cheaper way in. Whether it beats paying
          separately for your group depends on how many people share a lane
          and which activities you actually want, so do the quick math at the
          desk. One detail to confirm: the official page currently lists laser
          tag as 1 round on the MVP Pass and 2 rounds on the others.
        </P>
      </StorySection>

      <StorySection heading="Do you need a membership?" id="membership" muted>
        <p className="text-body-lg text-lvinit-black">
          No — not to visit. There&rsquo;s no general admission fee, and the
          venue says you don&rsquo;t need a membership to use the Social House,
          sign up for sports programs or book experiences. A membership is
          required only for the fitness center.
        </p>
        <P>
          Here&rsquo;s how the pieces fit together:
        </P>
        <ul className="mt-4 space-y-3 text-body-lg text-lvinit-warmgray">
          {[
            ["Walking in", "Free. You pay only for what you do."],
            ["Pay as you go", "Bowling, laser tag, mini golf, darts and arcade, at the front desk or booked online."],
            ["Attraction passes", "A one-day, per-person bundle of activities. No membership."],
            ["Fitness membership", "Monthly. The gym, classes, locker rooms, and limited open play on the courts and turf."],
            ["Family membership", "The same, for up to four people."],
            ["Social membership", "Fitness plus monthly bowling, laser tag, mini golf and darts."],
            ["Sports leagues and tournaments", "Registered separately. Fees vary by league and season."],
          ].map(([k, v]) => (
            <li key={k} className="flex gap-3">
              <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
              <span className="min-w-0 break-words">
                <span className="text-lvinit-black">{k}:</span> {v}
              </span>
            </li>
          ))}
        </ul>
      </StorySection>

      <StorySection heading="Fitness memberships and Henderson resident discounts" id="memberships">
        <p className="text-body-lg text-lvinit-warmgray">
          Monthly prices from the{" "}
          <Ext href={MEMBERSHIPS}>official memberships page</Ext> and the
          membership flyer and resident price sheet I photographed at the front
          desk on October 14, 2026.
        </p>
        <Table
          caption="Henderson Sport & Social monthly membership prices"
          head={["Membership", "Monthly", "Henderson resident (20% off)", "Includes"]}
          rows={[
            ["Fitness (individual)", "$60", "$48", "Fitness center, group classes, locker rooms and showers"],
            ["Family Fitness", "$175", "$140", "The same, for up to 4 people"],
            ["Social (individual Fitness + Social)", "$155", "$124", "Fitness, plus bowling, laser tag, mini golf and Krazy Darts each month"],
            ["Family Fitness + Social", "$345*", "$276*", "Family fitness plus the Social perks"],
          ]}
        />
        <p className="mt-4 text-caption text-lvinit-warmgray">
          *Family Fitness + Social appears on the front-desk flyer and resident
          price sheet, not on the website. The flyer lists the Social perks as 4
          rounds of mini golf, 8 hours of bowling, 10 rounds of laser tag and 4
          hours of Krazy Darts per month, with conditions at the front desk.
        </p>
        <H3>What every membership includes</H3>
        <P>
          According to the official page: the fitness center, locker rooms and
          showers, group fitness classes, priority registration for leagues,
          tournaments and events, 10% off parties, food and drinks, and
          attractions (arcade excluded), and basketball, soccer, volleyball and
          pickleball open play with &ldquo;limited availability.&rdquo; Most
          memberships also carry a{" "}
          <span className="text-lvinit-black">$50 annual fee</span> for
          activation and setup. Personal training ($75 a session) and small
          group training ($35 per person) are extra.
        </P>
        <H3>Resident, senior, military and first-responder discounts</H3>
        <P>
          The membership page lists{" "}
          <span className="text-lvinit-black">20% off for Henderson locals</span>
          , <span className="text-lvinit-black">$15 off for seniors 60+</span>,
          and <span className="text-lvinit-black">$10 off for military and first responders</span>.
          You need a valid ID on your first visit. The page doesn&rsquo;t say
          whether discounts can be combined, so don&rsquo;t assume they stack.
        </P>
        <P>
          The City of Henderson&rsquo;s project page says residents get 20% off
          &ldquo;all amenities,&rdquo; but the venue&rsquo;s attraction price
          list doesn&rsquo;t mention a resident rate. If you live in Henderson
          and you&rsquo;re paying for bowling or a pass, bring ID and ask.
        </P>
      </StorySection>

      <StorySection heading="Hours, reservations and visitor information" id="hours">
        <p className="text-body-lg text-lvinit-warmgray">
          Hours from the <Ext href={OFFICIAL}>official site</Ext>, checked{" "}
          {CHECKED}. The venue says it&rsquo;s open every day except Christmas
          Day, open on most holidays, and that holiday pricing may apply.
        </p>
        <Table
          caption={`Henderson Sport & Social hours, checked ${CHECKED}`}
          head={["Area", "Sun–Thu", "Fri–Sat"]}
          rows={[
            ["Social House (bowling, arcade, games, restaurant)", "8 AM–11 PM", "8 AM–1 AM"],
            ["Sports complex (courts and turf)", "6 AM–10 PM", "6 AM–1 AM"],
            ["Fitness center", "6 AM–10 PM", "6 AM–10 PM"],
            ["Child Watch", "Mon–Fri: 6 AM–noon and 3:30–8 PM", "Sat–Sun: 8 AM–noon"],
          ]}
        />
        <ul className="mt-6 space-y-3 text-body-lg text-lvinit-warmgray">
          {[
            ["Reservations", "Bowling lanes, Krazy Darts bays and parties can be booked online. Evenings and weekends fill up first."],
            ["Walk-ins", "Laser tag, mini golf and attraction passes are bought in person when you arrive."],
            ["Restaurant", "Same hours as the Social House. No membership needed."],
            ["Events", "events@hendersonsportandsocial.com. Tournaments have their own inquiry form."],
            ["Parking", "There's a surface parking lot on site (you can see it from the balcony in my video). The venue doesn't publish parking details."],
            ["Phone", "(702) 899-0242"],
          ].map(([k, v]) => (
            <li key={k} className="flex gap-3">
              <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
              <span className="min-w-0 break-words">
                <span className="text-lvinit-black">{k}:</span> {v}
              </span>
            </li>
          ))}
        </ul>
      </StorySection>

      <StorySection heading="Visiting with kids" id="kids">
        <p className="text-body-lg text-lvinit-warmgray">
          This is a very kid-friendly building: arcade, laser tag (ages 5+
          recommended), mini golf and bowling, plus party rooms. The main thing
          to understand is Child Watch, because it isn&rsquo;t daycare.
        </p>
        <H3>How Child Watch works</H3>
        <ul className="mt-4 space-y-3 text-body-lg text-lvinit-warmgray">
          {[
            "Ages 9 months to 11 years, and kids need to be able to take part safely in a group.",
            "A parent or guardian must stay inside the facility, stay reachable by phone, and come back right away if called. You can work out or bowl. You can't leave the building.",
            "Up to 2 hours per visit, 1 session a day, up to 5 visits a week.",
            "First come, first served. No reservations, and capacity limits may apply.",
            "The same parent signs the child in and out, with ID or member verification at pickup.",
            "No diaper changes, and kids need to use the restroom on their own — staff will call you.",
            "No outside food. Water only, in a bottle or sippy cup.",
            "Kids with a fever, vomiting or diarrhea in the past 24 hours can be turned away.",
          ].map((t) => (
            <li key={t} className="flex gap-3">
              <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <P>
          <span className="text-lvinit-black">What&rsquo;s not published:</span>{" "}
          the official <Ext href={CHILD_WATCH}>Child Watch page</Ext> doesn&rsquo;t
          list a price, and it doesn&rsquo;t say whether Child Watch is for
          members only (the membership page lists it as an add-on). The site
          also shows two different sets of hours: the schedule in the table
          above, and a banner listing 6 AM–8 PM Monday–Thursday and 6 AM–10 PM
          Friday–Sunday. Call (702) 899-0242 before you plan around it.
        </P>
      </StorySection>

      <StorySection heading="My take after touring Henderson Sport & Social" id="take">
        <p className="text-body-lg text-lvinit-warmgray">
          A few honest notes from the walkthrough, beyond the highlights:
        </p>
        <ul className="mt-4 space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">The scale is the headline.</span>{" "}
              Four courts and two full turf fields under one roof, with the
              whole entertainment side on top of that.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Indoor is the point.</span>{" "}
              In a Las Vegas summer, air-conditioned courts and turf matter more
              than any one attraction. (If you&rsquo;re new here, our{" "}
              <Link href="/guides/first-summer-in-vegas" className={linkCls}>
                first-summer guide
              </Link>{" "}
              explains why.)
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Who it&rsquo;s less for:</span>{" "}
              if you only want a gym, a $60 monthly fitness membership plus the
              annual fee is easy to compare with the gyms you already know.
              The value here is in using more than the gym.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Plan around weekends.</span>{" "}
              Friday–Sunday prices are higher and the venue itself says evenings
              and weekends book up, so weeknights are the easy time to try it.
            </span>
          </li>
        </ul>
      </StorySection>

      <LocalsNote id="my-take" muted={false}>
        <p className="text-body-lg text-lvinit-black">
          It went way above my expectations. I&rsquo;d heard about this project
          when it was announced, and I had no idea it was going to look like
          this. The size of the building is just unreal.
        </p>
        <p className="mt-4 text-body text-lvinit-warmgray">
          The courts and the turf fields are what sold me. If you live in
          Vegas or Henderson, you know how hot the summers get, and having this
          much indoor space for sports is a big deal. What makes it different
          is that it isn&rsquo;t only a gym or only an arcade. You could spend
          a few hours here working out and playing in a league, or come with
          the family and do bowling, the arcade and mini golf. I think people
          in town are going to use it for years.
        </p>
        <p className="mt-5 text-caption uppercase tracking-wide text-lvinit-warmgray">
          Mikey Del Rosario · toured October 14, 2026
        </p>
      </LocalsNote>

      <StorySection heading="What this means for West Henderson" id="west-henderson" muted>
        <p className="text-body-lg text-lvinit-warmgray">
          From the upstairs windows I pointed out Costco across the street, and
          Chicken N Pickle shares the parking lot. Looking out over St. Rose, I
          said on camera that I can remember this stretch being basically
          nothing:
        </p>
        <Quote>
          &ldquo;I&rsquo;d end up on St. Rose and be kind of mad that I made it
          this far into town. But right now it&rsquo;s just got its own
          community.&rdquo;
        </Quote>
        <Figure
          src="/images/features/henderson-sport-and-social-balcony-west-henderson-view.webp"
          alt="Outdoor seating on the upstairs balcony of Henderson Sport & Social, looking out over the parking lot, St. Rose Parkway area and mountains across the Las Vegas Valley"
          caption="The view from the upstairs balcony off The Flex. Still from my walkthrough footage, October 14, 2026."
        />
        <P>
          Inspirada is just to the south, and the neighborhoods off St. Rose
          now have a place to go for leagues, birthday parties and a weeknight
          out without driving across the valley. The venue is a public-private
          partnership: the City of Henderson owns it and KemperSports operates
          it. It&rsquo;s one more piece of the everyday infrastructure West
          Henderson has been adding.
        </P>
        <P>
          A new amenity doesn&rsquo;t set home prices on its own, and I&rsquo;m
          not going to tell you it will. What it does change is what living out
          here is like day to day. If you&rsquo;re comparing this side of town
          with others, our{" "}
          <Link href="/neighborhoods/henderson" className={linkCls}>
            Henderson guide
          </Link>
          ,{" "}
          <Link href="/guides/henderson-vs-southwest-las-vegas" className={linkCls}>
            Henderson vs. Southwest Las Vegas
          </Link>{" "}
          and{" "}
          <Link href="/guides/summerlin-vs-henderson" className={linkCls}>
            Summerlin vs. Henderson
          </Link>{" "}
          are good places to start. For newer homes nearby, see{" "}
          <Link href="/guides/buying-new-construction-las-vegas" className={linkCls}>
            buying new construction in Las Vegas
          </Link>
          .
        </P>
        <P>
          If &ldquo;Henderson sports complex&rdquo; made you think of the old
          Fiesta Henderson site, that&rsquo;s a separate, much earlier-stage
          proposal on the other side of the city. We cover it in{" "}
          <Link href="/guides/fiesta-henderson-redevelopment" className={linkCls}>
            the Fiesta Henderson redevelopment
          </Link>
          .
        </P>
      </StorySection>

      <StorySection heading="Frequently asked questions" id="faq">
        <div className="divide-y divide-lvinit-lightgray border-y border-lvinit-lightgray">
          {FAQS.map((f) => (
            <div key={f.q} className="py-5">
              <h3 className="font-display text-subhead font-bold text-lvinit-black">
                {f.q}
              </h3>
              <p className="mt-2 break-words text-body text-lvinit-warmgray">{f.a}</p>
            </div>
          ))}
        </div>
      </StorySection>

      <StorySection heading="Sources" id="sources">
        <p className="text-body text-lvinit-warmgray">
          <span className="text-lvinit-black">Firsthand:</span> my own walkthrough
          on October 14, 2026, including the front-desk price screens, the
          membership flyer and the resident price sheet I photographed there.
        </p>
        <ul className="mt-4 space-y-3 text-body text-lvinit-warmgray">
          <li>
            Henderson Sport &amp; Social —{" "}
            <Ext href={OFFICIAL}>home page and hours</Ext>,{" "}
            <Ext href={ATTRACTIONS}>attractions and pricing</Ext>,{" "}
            <Ext href={MEMBERSHIPS}>memberships</Ext>,{" "}
            <Ext href={CHILD_WATCH}>Child Watch</Ext>, and the{" "}
            <Ext href="https://hendersonsportandsocial.com/blog/henderson-sport-social-announces-grand-opening-in-west-henderson-oct-16/">
              Sept. 3, 2026 grand-opening announcement
            </Ext>{" "}
            ($70 million, 180,000 sq ft, amenity counts, opening schedule,
            ownership and operator). All checked {CHECKED}.
          </li>
          <li>
            City of Henderson,{" "}
            <Ext href="https://www.cityofhenderson.com/our-city/initiatives/west-henderson-fieldhouse">
              West Henderson Fieldhouse project page
            </Ext>{" "}
            — funding sources, courts and fields, resident discount. (The city
            page still lists the earlier 160,000 sq ft planning figure; the
            venue now says 180,000.)
          </li>
          <li>
            FOX5 Vegas,{" "}
            <Ext href="https://www.fox5vegas.com/2026/06/02/city-henderson-announces-new-name-west-henderson-fieldhouse-project/">
              June 2, 2026
            </Ext>{" "}
            and KTNV,{" "}
            <Ext href="https://www.ktnv.com/news/groundbreaking-date-set-for-state-of-the-art-west-henderson-fieldhouse">
              groundbreaking coverage
            </Ext>{" "}
            — the rename from West Henderson Fieldhouse, the $60 million city /
            $10 million KemperSports split, and the May 21, 2025 groundbreaking.
          </li>
          <li>
            KemperSports,{" "}
            <Ext href="https://www.kempersports.com/properties/henderson-sport-and-social/">
              Henderson Sport &amp; Social property page
            </Ext>{" "}
            — operator.
          </li>
        </ul>
        <p className="mt-6 text-caption text-lvinit-warmgray">
          Prices, hours and policies were checked on {CHECKED} and can change.
          Confirm with the venue before you go. This is independent local
          coverage, not an endorsement or a paid partnership.
        </p>
      </StorySection>

      <StorySection heading="About this coverage">
        <p className="text-body text-lvinit-warmgray">
          Mikey Del Rosario · LVINIT · The Scofield Group · Nevada License
          S.0175577. Equal Housing Opportunity.
        </p>
      </StorySection>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(venueJsonLd) }}
      />
    </StoryPage>
  );
}
