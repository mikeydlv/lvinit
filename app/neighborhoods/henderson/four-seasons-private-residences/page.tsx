import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryVideo,
  StoryPullQuote,
} from "@/components/story";

// ---------------------------------------------------------------------------
// PHOTOGRAPHY: no real Four Seasons still photography exists in the repo yet, so
// this page runs the hero in its honest photoless mode and lets Mikey's drone
// FILM (the embedded video) carry the visuals. Do not swap in a mismatched or
// fabricated still. When real Four Seasons drone stills land, drop them at
// /images/hero/henderson-four-seasons-*.webp and pass `image` to the hero (and
// `image`/OG on `meta`), mirroring the Summerlin guide.
//
// FACTS: intentionally NO unit counts, story heights, pricing, square footage,
// completion dates, or specific amenity lists — those are unverifiable /
// promotional and the reader is pointed to confirm specifics directly. Only
// well-established, non-volatile facts appear (Four Seasons–branded residence in
// MacDonald Highlands, Henderson, in the McCullough foothills).
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title: "Four Seasons Private Residences, Henderson — A Local Feature | LVINIT",
  headline: "Four Seasons Private Residences",
  description:
    "An honest local read on Four Seasons Private Residences in Henderson's MacDonald Highlands — what a branded, hillside residence actually is, who it's for, and what it signals for luxury in the valley.",
  path: "/neighborhoods/henderson/four-seasons-private-residences",
  datePublished: "2026-07-08",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Henderson", path: "/neighborhoods/henderson" },
    {
      name: "Four Seasons Private Residences",
      path: "/neighborhoods/henderson/four-seasons-private-residences",
    },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function FourSeasonsPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Henderson · A Local Feature",
        headline: "Four Seasons Private Residences",
        subheadline:
          "A Four Seasons name, a hillside address in MacDonald Highlands, and a kind of luxury Henderson hasn't really had before. Here's the honest local read.",
        backLink: { label: "Henderson", href: "/neighborhoods/henderson" },
        ctas: [
          { label: "▶ Watch the film", href: "#watch", variant: "primary" },
          {
            label: "Explore Henderson",
            href: "/neighborhoods/henderson",
            variant: "tertiary",
          },
        ],
      }}
      relatedStories={{
        heading: "More Henderson Stories",
        intro:
          "Closer looks at the corners of Henderson worth their own story. These are in production — check back as they publish.",
        stories: [
          {
            name: "Lake Las Vegas",
            dek: "The resort community on the water — MonteLago Village, the pace, and who it's really for.",
          },
          {
            name: "Green Valley Ranch",
            dek: "Henderson's established heart, from The District to the neighborhoods around it.",
          },
          {
            name: "Water Street District",
            dek: "Henderson's historic downtown and what its revitalization actually feels like.",
          },
        ],
      }}
      relatedNeighborhood={{
        name: "Henderson",
        href: "/neighborhoods/henderson",
        blurb:
          "The full, honest guide to the city this sits in — every community, from the new master-plans to the hillside.",
      }}
      ctas={{
        heading: "Thinking seriously about Four Seasons?",
        body:
          "Tell me what you're weighing and I'll give you the unvarnished version — including whether it's the right fit, and what to actually verify before you fall for the view.",
        footnote: (
          <>
            Weighing the west side too?{" "}
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
        kicker="Henderson · A Local Feature"
        lead="Some homes you understand from a floor plan. This isn't one of them. Four Seasons Private Residences sits high in Henderson's MacDonald Highlands, where the valley falls away below you and the McCullough foothills rise behind — a setting that does more of the talking than any brochure could."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          It&rsquo;s the newest, and highest-profile, chapter of the story we told
          in the{" "}
          <Link
            href="/neighborhoods/henderson"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Henderson guide
          </Link>
          : the luxury, guard-gated end of the map, given a name most of the world
          already ties to a certain standard of service. Start with the film,
          then let&rsquo;s talk honestly about what it is — and who it&rsquo;s
          actually for.
        </p>
      </StoryLede>

      <StoryVideo
        youtubeId="ZDp8KSvNK6w"
        title="Four Seasons Private Residences, Henderson — aerial film by Mikey Del Rosario"
        heading="See the setting"
        intro="Press play. The footage is aerial — the honest way to read a hillside address is from above, watching how it sits over the valley. It says more than a page of adjectives could."
      />

      <StorySection
        heading="What a “branded residence” actually is"
        paragraphs={[
          "Strip away the marketing and a branded residence is a simple idea: a hospitality company lends its name — and, more to the point, its standards — to a place you own rather than book. When that name is Four Seasons, the promise leans on service and consistency more than square footage.",
          "It's a model that's long been common in places like Miami, Manhattan, and a handful of resort cities, and it's comparatively new to the Las Vegas valley. That's the first reason this one matters locally: it's less a single new building than a whole category arriving in Henderson.",
        ]}
      />

      <StorySection heading="Why MacDonald Highlands">
        <p className="text-body-lg text-lvinit-warmgray">
          If branded residences were going to land anywhere in Henderson, this is
          the address that makes sense. MacDonald Highlands is the guard-gated
          community climbing the McCullough foothills on the valley&rsquo;s
          southeast edge — the luxury, view-first corner of the{" "}
          <Link
            href="/neighborhoods/henderson#communities"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Henderson map
          </Link>
          .
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Elevation is the whole point. Get high enough on this side of the valley
          and the Strip becomes a distant line of light rather than a place you
          commute to — the view is the amenity. This setting was quietly
          expensive long before a hotel brand attached itself to it.
        </p>
      </StorySection>

      <StoryPullQuote>
        Most of Henderson is about choosing the right neighborhood. This is about
        choosing a life you don&rsquo;t have to maintain.
      </StoryPullQuote>

      <StorySection heading="Who it's really for">
        <p className="text-body-lg text-lvinit-warmgray">
          Let&rsquo;s be honest about the fit, because it&rsquo;s narrow. This
          isn&rsquo;t a starter home or a growing-family house, and it isn&rsquo;t
          trying to be. It&rsquo;s for the buyer who wants the view without the
          yard, the lock-and-leave freedom to be gone a month without arranging a
          thing, and a level of service they&rsquo;d rather not have to think
          about.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          If that&rsquo;s not you, that&rsquo;s no knock — most of Henderson,
          happily, is built for a different life, and the{" "}
          <Link
            href="/neighborhoods/henderson"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Henderson guide
          </Link>{" "}
          walks through those. If it is you, only a handful of addresses in the
          whole valley are having this conversation.
        </p>
      </StorySection>

      <StorySection muted heading="What it says about Henderson">
        <p className="text-body-lg text-lvinit-warmgray">
          Step back and this is a marker of something larger. For years the
          valley&rsquo;s luxury lived horizontally — big lots, low profiles,
          master-planned privacy, whether out here or across town in{" "}
          <Link
            href="/neighborhoods/summerlin"
            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
          >
            Summerlin
          </Link>
          .
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          A branded residential tower is a different proposition: luxury stacked
          vertically, hospitality-run, pointed at the view. Henderson getting one
          is a sign the city&rsquo;s top tier has grown past the single-family
          estate — that there&rsquo;s now a buyer here who wants the penthouse
          version of the desert, not just the biggest house on the cul-de-sac.
        </p>
      </StorySection>

      <StorySection
        heading="Before you get attached"
        paragraphs={[
          "One LVINIT rule, applied here as everywhere: we won't hand you numbers we can't stand behind. Pricing, availability, finishes, timing — the details on a development like this move, and they're too important to take from a brochure or a third-hand listing.",
          "When you're ready to weigh it seriously, that's exactly the kind of thing worth confirming directly, with someone who has no reason to oversell it. That's the whole job.",
        ]}
      />
    </StoryPage>
  );
}
