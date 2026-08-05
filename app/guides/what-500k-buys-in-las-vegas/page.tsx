import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import Container from "@/components/ui/Container";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryVideo,
} from "@/components/story";

// ---------------------------------------------------------------------------
// VIDEO-FIRST BUYER GUIDE — companion article to Mikey's "$500K" home-tour video.
// The video (id Tzxid_nM2nA) carries the visuals; this page adds context + a
// comparison. Photoless editorial hero on purpose — no still exists and the OG
// image is the existing local video poster.
//
// FACTS: every price/spec below is from verified listing data supplied for this
// build (rewritten, not copied from MLS). Cherokee's HOA is NOT verified and is
// deliberately OMITTED everywhere (no "Not listed", no empty cell) — do not
// invent one. No numbers beyond the verified set; no fabricated views/ratings.
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title: "What $500K Buys in Las Vegas: 3 Real Home Tours | LVINIT",
  headline: "What $500K Actually Gets You in Las Vegas",
  description:
    "Tour three real Las Vegas homes near the $500K price point and compare their locations, features and buyer tradeoffs.",
  path: "/guides/what-500k-buys-in-las-vegas",
  image: "/images/video-what-500k-gets-you-in-las-vegas.jpg",
  imageWidth: 1280,
  imageHeight: 720,
  imageAlt:
    "What $500K buys in Las Vegas — three real home tours with Mikey Del Rosario",
  datePublished: "2026-08-04",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    {
      name: "What $500K Actually Gets You in Las Vegas",
      path: "/guides/what-500k-buys-in-las-vegas",
    },
  ],
  video: {
    name: "What $500K Buys in Las Vegas | 3 Real Home Tours",
    description:
      "A walkthrough of three real Las Vegas homes near the $500K mark — a Southwest single-family with a pool, a high-rise condo near the Strip, and an older Spring Valley home with more space — and the tradeoffs between them.",
    thumbnailUrl: "/images/video-what-500k-gets-you-in-las-vegas.jpg",
    uploadDate: "2026-08-04",
    duration: "PT12M16S",
    embedUrl: "https://www.youtube.com/embed/Tzxid_nM2nA",
    contentUrl: "https://www.youtube.com/watch?v=Tzxid_nM2nA",
  },
};

export const metadata: Metadata = buildStoryMetadata(meta);

// Page-local comparison data — verified specs only. HOA is intentionally NOT a
// comparison row (Cherokee's is unverified; see note in the array). The Martin
// has no private lot (high-rise).
type CompareRow = { label: string; values: [string, string, string] };

const HOMES = [
  "Julesburg Dr · Southwest",
  "The Martin · High-rise",
  "Cherokee Ave · Spring Valley",
] as const;

const COMPARISON: CompareRow[] = [
  { label: "Asking price", values: ["$485,999", "$499,000", "$497,000"] },
  {
    label: "General location",
    values: [
      "Southwest Las Vegas (Blue Diamond Ranch)",
      "Near the Strip (The Martin)",
      "Spring Valley (Villa Bonita Oeste)",
    ],
  },
  {
    label: "Type",
    values: [
      "Single-family, one story",
      "High-rise condo, 26th floor",
      "Single-family, one story",
    ],
  },
  { label: "Beds / baths", values: ["3 bd / 2 ba", "2 bd / 2 ba", "3 bd / 2 ba"] },
  { label: "Interior size", values: ["1,362 sq ft", "1,111 sq ft", "1,656 sq ft"] },
  { label: "Year built", values: ["2003", "2007", "1981"] },
  {
    label: "Lot / outdoor",
    values: [
      "6,098 sq ft lot · heated pool + spa, RV parking",
      "High-rise, no private lot",
      "8,712 sq ft corner lot · private pool",
    ],
  },
  // HOA intentionally omitted from the shared comparison: Cherokee's HOA is
  // unverified, and a 3-up matrix can't show it for two homes while saying
  // nothing for the third without leaving a placeholder cell. Verified HOA
  // facts (Julesburg: None · The Martin: $934/mo) live in their property blocks.
  {
    label: "Standout feature",
    values: [
      "Heated pool + spa and RV gate/parking",
      "Floor-to-ceiling views + full-service building",
      "Largest home & lot with a flexible bonus room",
    ],
  },
  {
    label: "Strongest advantage",
    values: [
      "Outdoor living and freedom, no HOA, under $500K",
      "Lock-and-leave, amenity-rich living near the Strip",
      "Most interior space and yard around the price",
    ],
  },
  {
    label: "Main compromise",
    values: [
      "Compact interior for a single-family home",
      "Less private space + a significant monthly HOA",
      "Oldest of the three — condition matters most here",
    ],
  },
];

function ComparisonBlock() {
  return (
    <section id="compare" aria-label="Compare the three homes" className="scroll-mt-24">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            The three homes, side by side
          </h2>
          <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
            The three homes were listed between approximately $486,000 and
            $499,000 when this article was prepared — close enough in price to
            make the differences the whole point.
          </p>

          {/* Desktop: table */}
          <div className="mt-8 hidden md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="w-[19%] border-b border-lvinit-black pb-3 pr-4 align-bottom text-caption uppercase tracking-wide text-lvinit-warmgray">
                    <span className="sr-only">Attribute</span>
                  </th>
                  {HOMES.map((home) => (
                    <th
                      key={home}
                      className="w-[27%] border-b border-lvinit-black pb-3 pr-4 align-bottom font-display text-subhead font-bold text-lvinit-black"
                    >
                      {home}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.label} className="align-top">
                    <th
                      scope="row"
                      className="border-b border-lvinit-lightgray py-3 pr-4 text-caption uppercase tracking-wide text-lvinit-warmgray"
                    >
                      {row.label}
                    </th>
                    {row.values.map((value, i) => (
                      <td
                        key={i}
                        className="border-b border-lvinit-lightgray py-3 pr-4 text-body text-lvinit-black"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards */}
          <div className="mt-8 space-y-8 md:hidden">
            {HOMES.map((home, homeIndex) => (
              <div
                key={home}
                className="border-t border-lvinit-black pt-4"
              >
                <h3 className="font-display text-subhead font-bold text-lvinit-black">
                  {home}
                </h3>
                <dl className="mt-3">
                  {COMPARISON.map((row) => (
                    <div
                      key={row.label}
                      className="flex flex-col border-b border-lvinit-lightgray py-3"
                    >
                      <dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                        {row.label}
                      </dt>
                      <dd className="mt-1 text-body text-lvinit-black">
                        {row.values[homeIndex]}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          <p className="mt-6 max-w-[680px] text-caption text-lvinit-warmgray">
            Prices, availability and property details were accurate when this
            article was prepared and may have changed since publication. Verify
            current information before making a real estate decision.
          </p>
        </div>
      </Container>
    </section>
  );
}

export default function What500KBuysPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Buyer Guide",
        headline: "What $500K Actually Gets You in Las Vegas",
        subheadline:
          "Three real homes, three very different lives — all sitting around the same half-million-dollar price. Watch the tours, then compare what you'd actually be trading for.",
        backLink: { label: "LVINIT", href: "/" },
        ctas: [{ label: "▶ Watch the tours", href: "#watch", variant: "primary" }],
      }}
      relatedStories={{
        heading: "Keep exploring",
        intro:
          "Where these homes sit on the map, and more Las Vegas living on video.",
        stories: [
          {
            name: "Southwest Las Vegas",
            href: "/neighborhoods/southwest-las-vegas",
            category: "Area guide",
            dek: "The valley's fastest-growing side — where the first of these three homes sits, and what living out here actually feels like.",
          },
          {
            name: "Moving to Las Vegas",
            href: "/#moving-to-las-vegas",
            category: "On the homepage",
            dek: "The quick-facts index for anyone weighing a move — cost of living, getting around, and the rest.",
          },
          {
            name: "More Las Vegas on video",
            href: "/#videos",
            category: "Video",
            dek: "The rest of the LVINIT video library — home tours and honest takes on living here.",
          },
        ],
      }}
      relatedNeighborhood={{
        name: "Southwest Las Vegas",
        href: "/neighborhoods/southwest-las-vegas",
        blurb:
          "The area guide for the fastest-growing side of the valley — the part of town the first home in this tour calls home.",
      }}
      ctas={{
        heading: "What does your budget buy in Las Vegas?",
        body:
          "The answer depends on where you want to live, what compromises you're willing to make, and what your normal week looks like. Tell me your budget and what matters most, and I'll help you narrow down the right parts of the valley.",
      }}
    >
      <StoryLede
        kicker="Buyer Guide"
        lead="A $500,000 budget doesn't buy one standard version of Las Vegas. It buys a choice. Move the same money around the valley and it becomes a single-story house with a pool, a high-rise condo with the Strip out the window, or an older home with more room to spread out — and each one asks you to give up something the others keep."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Location, age, layout, lot, upgrades, and the neighborhood around it do
          most of the work. Two homes a few miles apart, listed within a few
          thousand dollars of each other, can feel like they belong to different
          cities. To make that concrete, I toured three real listings near the
          $500K mark — one out in{" "}
          <Link
            href="/neighborhoods/southwest-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Southwest Las Vegas
          </Link>
          , one in a high-rise near the Strip, and one in an established Spring
          Valley pocket. Start with the tour, then let&rsquo;s break down the
          tradeoffs.
        </p>
      </StoryLede>

      <StoryVideo
        youtubeId="Tzxid_nM2nA"
        title="What $500K Buys in Las Vegas | 3 Real Home Tours — by Mikey Del Rosario"
        poster="/images/video-what-500k-gets-you-in-las-vegas.jpg"
        heading="Watch the three tours"
        intro="Twelve minutes, three homes, one budget. Watch how differently the same money lives depending on where you spend it — then use the comparison below to weigh them against each other."
      />

      <StorySection heading="The quick takeaway">
        <ul className="space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Nearly identical prices can buy very different housing experiences —
              a yard and a pool, a full-service tower, or extra square footage.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Location is the biggest lever. What you gain in one part of the
              valley, you usually trade for somewhere else on the map.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Condition, age, lot, and layout can matter more than finishes — an
              older home with good bones can beat a newer one that&rsquo;s tighter.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              Compare lifestyle and long-term fit, not just price per square foot.
              The &ldquo;best deal&rdquo; is the one that matches how you actually
              live.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="Home 1 — Southwest, with a pool and no HOA">
        <p className="text-body-lg text-lvinit-warmgray">
          The first stop is on{" "}
          <a
            href="https://mikey.scofieldgroup.com/search/detail/267886642?s[mlsId][0]=2803533&s[mainInputSearch]=false"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Julesburg Drive in Blue Diamond Ranch
          </a>
          , out in{" "}
          <Link
            href="/neighborhoods/southwest-las-vegas"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Southwest Las Vegas
          </Link>
          . It&rsquo;s a single-story home tucked onto a small cul-de-sac of four
          houses, and its whole personality is out back: a private heated
          in-ground pool and spa, a covered patio, and — the part buyers keep
          asking about — an RV gate with room to park one. There&rsquo;s no HOA,
          which under $500K is genuinely hard to find.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Inside, it&rsquo;s an open living-dining-kitchen layout with luxury
          vinyl plank flooring, a downstairs primary bedroom, and a separate
          family room. The honest tradeoff: the interior is on the compact side
          for a single-family home. You&rsquo;re prioritizing the backyard,
          the flexibility, and the freedom from monthly dues over maximizing
          indoor square footage — which is exactly the point for the right buyer.
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-lvinit-lightgray pt-6 text-body text-lvinit-black sm:grid-cols-3">
          <div><dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">Price</dt><dd className="mt-1">$485,999</dd></div>
          <div><dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">Beds / baths</dt><dd className="mt-1">3 bd / 2 ba</dd></div>
          <div><dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">Interior</dt><dd className="mt-1">1,362 sq ft</dd></div>
          <div><dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">Year built</dt><dd className="mt-1">2003</dd></div>
          <div><dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">Lot</dt><dd className="mt-1">6,098 sq ft</dd></div>
          <div><dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">HOA</dt><dd className="mt-1">None</dd></div>
        </dl>
      </StorySection>

      <StorySection heading="Home 2 — a high-rise near the Strip">
        <p className="text-body-lg text-lvinit-warmgray">
          The second home trades the yard for elevation. It&rsquo;s a residence on
          the 26th floor of The Martin, the{" "}
          <a
            href="https://mikey.scofieldgroup.com/search/detail/266543823?s[mlsId][0]=2795570&s[mainInputSearch]=false"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            high-rise on Dean Martin Drive
          </a>{" "}
          just off the Strip. Floor-to-ceiling windows pull in city, mountain, and
          Strip views; the layout is open, with a spa-inspired primary bath and a
          second bedroom that works just as well as an office or guest room.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          What you&rsquo;re really buying here is the building. Concierge,
          24-hour security, a fitness center, an infrared sauna, a pool and spa,
          and a business center come with the address — the lock-and-leave life
          where you can be gone a month without arranging a thing. The tradeoff is
          twofold: less private indoor and outdoor space than a house, and a
          monthly HOA of $934 that covers the amenities, water, and common-area
          upkeep. A similar half-million here buys lifestyle and services instead
          of a lot.
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-lvinit-lightgray pt-6 text-body text-lvinit-black sm:grid-cols-3">
          <div><dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">Price</dt><dd className="mt-1">$499,000</dd></div>
          <div><dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">Beds / baths</dt><dd className="mt-1">2 bd / 2 ba</dd></div>
          <div><dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">Interior</dt><dd className="mt-1">1,111 sq ft</dd></div>
          <div><dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">Year built</dt><dd className="mt-1">2007</dd></div>
          <div><dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">Floor</dt><dd className="mt-1">26th</dd></div>
          <div><dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">HOA</dt><dd className="mt-1">$934 / mo</dd></div>
        </dl>
      </StorySection>

      <StorySection heading="Home 3 — more room in Spring Valley">
        <p className="text-body-lg text-lvinit-warmgray">
          The third home, on{" "}
          <a
            href="https://mikey.scofieldgroup.com/search/detail/260346132?s[mlsId][0]=2759018&s[mainInputSearch]=false"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            West Cherokee Avenue
          </a>{" "}
          in the Villa Bonita Oeste pocket of Spring Valley, makes the case for
          space. It&rsquo;s the largest of the
          three inside and out — the biggest interior footprint and the biggest
          lot, a corner parcel — and it still has a private in-ground pool. Inside
          there&rsquo;s an open layout with a kitchen island, a gas fireplace,
          double-pane windows, a downstairs primary bedroom, and a casita or
          bonus room that flexes into a game room, office, or guest space.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The catch is age: built in 1981, it&rsquo;s the oldest of the three. That
          isn&rsquo;t a strike against it, but it does shift where your attention
          goes. Instead of judging it on size alone, this is the home where
          you&rsquo;d want a close look at condition, systems, and what&rsquo;s
          been updated versus what you might improve over time. An established
          location like this can hand you more traditional space around the same
          price — as long as you go in with eyes open.
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-lvinit-lightgray pt-6 text-body text-lvinit-black sm:grid-cols-3">
          <div><dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">Price</dt><dd className="mt-1">$497,000</dd></div>
          <div><dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">Beds / baths</dt><dd className="mt-1">3 bd / 2 ba</dd></div>
          <div><dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">Interior</dt><dd className="mt-1">1,656 sq ft</dd></div>
          <div><dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">Year built</dt><dd className="mt-1">1981</dd></div>
          <div><dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">Lot</dt><dd className="mt-1">8,712 sq ft (corner)</dd></div>
        </dl>
      </StorySection>

      <ComparisonBlock />

      <StorySection muted heading="What you're really choosing between">
        <p className="text-body-lg text-lvinit-warmgray">
          Line these three up and the decision stops being about price and starts
          being about priorities. Each pairing below is a real tradeoff these homes
          put in front of you:
        </p>
        <ul className="mt-6 space-y-3 text-body-lg text-lvinit-warmgray">
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Location vs. interior space</span> —
              the tower&rsquo;s address near the Strip against Cherokee&rsquo;s
              extra square footage in Spring Valley.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Newer condition vs. established surroundings</span> —
              the 2003 and 2007 homes against a settled 1981 neighborhood with
              mature streets.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Finished upgrades vs. future potential</span> —
              move-in-ready features today against an older home you can improve on
              your own timeline.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Larger lot vs. lower maintenance</span> —
              Cherokee&rsquo;s corner lot and Julesburg&rsquo;s pool against a
              high-rise where the building handles the upkeep.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Layout usefulness vs. raw square footage</span> —
              a flexible bonus room or a downstairs primary can beat a bigger
              number on paper.
            </span>
          </li>
          <li className="flex gap-3">
            <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lvinit-blue" />
            <span>
              <span className="text-lvinit-black">Immediate appeal vs. long-term fit</span> —
              the home that wows you on the tour isn&rsquo;t always the one that
              fits your next ten years.
            </span>
          </li>
        </ul>
      </StorySection>

      <StorySection heading="A note on the listings">
        <p className="text-body text-lvinit-warmgray">
          These homes were toured with permission from colleagues at The Scofield
          Group. Listing credits: the Julesburg Drive home is represented by
          Trisha Sivongxay; the residence at The Martin (Dean Martin Drive) by
          Beth Legge; and the West Cherokee Avenue home by Leona Sala and
          Janezzta Sukaneeyouth — all of The Scofield Group.
        </p>
      </StorySection>
    </StoryPage>
  );
}
