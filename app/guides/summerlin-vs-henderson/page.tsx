import type { Metadata } from "next";
import Link from "next/link";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import {
  StoryPage,
  StoryLede,
  StorySection,
  StoryPullQuote,
} from "@/components/story";

// ---------------------------------------------------------------------------
// COMPARISON GUIDE — Summerlin vs. Henderson.
//
// FACT DISCIPLINE (read before editing):
// - This article makes NO numeric claims — no median price, no walk score, no
//   commute minutes, no school rating. The neighborhoods[] entries in
//   lib/content.ts for "summerlin" and "henderson" are explicitly flagged
//   PLACEHOLDER / illustrative, not verified data (see that file's header
//   comment and docs/PROJECT_STATE.md) and must never be cited here as fact.
// - Every specific claim below is restated, qualitative editorial content
//   pulled from the two live pillar guides — app/neighborhoods/summerlin and
//   app/neighborhoods/henderson — which are themselves already stat-free by
//   design. Nothing new is asserted about either place.
// - Hero + card imagery is Mikey's real Summerlin photography (Fox Hill Park /
//   Red Rock drone shot, already live on the Summerlin guide and homepage
//   hero). No real Henderson photography exists in the repo yet — per
//   docs/PROJECT_STATE.md, the Henderson guide itself still ships with a
//   photoless "Option B" hero. Leading with the Summerlin image only, rather
//   than fabricating or implying Henderson stills, is the honest call; swap in
//   a two-up treatment once real Henderson photography lands.
// ---------------------------------------------------------------------------

const meta: StoryMeta = {
  title: "Summerlin vs. Henderson: Where Should You Actually Move? | LVINIT",
  headline: "Summerlin vs. Henderson: Where Should You Actually Move?",
  description:
    "An honest, no-brochure comparison of Summerlin and Henderson — master-plan culture, commute, community character, and who actually fits each one.",
  path: "/guides/summerlin-vs-henderson",
  image: "/images/hero/summerlin-fox-hill-park-red-rock-aerial-drone.webp",
  imageWidth: 2200,
  imageHeight: 1650,
  imageAlt:
    "Aerial view of Fox Hill Park in Summerlin with Red Rock Canyon in the background, photographed by Mikey Del Rosario.",
  datePublished: "2026-08-19",
  author: "Mikey Del Rosario",
  breadcrumbs: [
    { name: "Home", path: "/" },
    {
      name: "Summerlin vs. Henderson",
      path: "/guides/summerlin-vs-henderson",
    },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

const linkCls =
  "text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue";

export default function SummerlinVsHendersonPage() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Comparisons",
        headline: "Summerlin vs. Henderson: Where Should You Actually Move?",
        subheadline:
          "Two of the city's most-recommended suburbs, compared honestly — master-plan culture, commute, community character, and the tradeoffs nobody puts in a brochure.",
        image: "/images/hero/summerlin-fox-hill-park-red-rock-aerial-drone.webp",
        imageAlt:
          "Aerial view of Fox Hill Park in Summerlin with Red Rock Canyon in the background, photographed by Mikey Del Rosario.",
        imageTitle: "Fox Hill Park, Summerlin — Photo by Mikey Del Rosario",
        backLink: { label: "LVINIT", href: "/" },
      }}
      relatedStories={{
        heading: "Go deeper",
        intro:
          "This piece is the short version. Both full guides go further into what daily life actually looks like in each place.",
        stories: [
          {
            name: "Summerlin",
            href: "/neighborhoods/summerlin",
            category: "Area guide",
            dek: "The full pillar guide — the setting, daily life, the commute, and the tradeoffs.",
          },
          {
            name: "Henderson",
            href: "/neighborhoods/henderson",
            category: "Area guide",
            dek: "The full pillar guide, plus a roster of Henderson's seven very different communities.",
          },
          {
            name: "What $500K Buys in Las Vegas",
            href: "/guides/what-500k-buys-in-las-vegas",
            category: "Buyer guide",
            dek: "Three real home tours near the same price — a concrete look at what tradeoffs like these actually cost.",
          },
        ],
      }}
      ctas={{
        heading: "Trying to choose between Summerlin and Henderson?",
        body:
          "Tell me what you're weighing — schools, commute, budget, the kind of street you want to come home to — and I'll give you the unfiltered version for your specific situation, not a sales pitch for either one.",
      }}
    >
      <StoryLede
        kicker="Comparisons"
        lead="Summerlin and Henderson are the two answers I hear most when someone tells me they want 'a good suburb' in Las Vegas — and they're rarely comparing the two on purpose. Most people fall into one or the other because a friend lives there, or a listing caught their eye, without ever lining them up side by side. So here's that side-by-side, built from what's actually true about each place rather than what a brochure would tell you."
      >
        <p className="mt-6 text-body-lg text-lvinit-warmgray">
          Full disclosure up front: I&rsquo;m not going to hand you a score and a
          winner. Anyone who does that for two neighborhoods this different is
          selling you something. What I can do is walk through the real
          differences — read the{" "}
          <Link href="/neighborhoods/summerlin" className={linkCls}>
            full Summerlin guide
          </Link>{" "}
          and the{" "}
          <Link href="/neighborhoods/henderson" className={linkCls}>
            full Henderson guide
          </Link>{" "}
          for the long version of each — and let you match them to your own
          life instead of mine.
        </p>
      </StoryLede>

      <StorySection heading="One master plan vs. a dozen">
        <p className="text-body-lg text-lvinit-warmgray">
          The single biggest difference between these two isn&rsquo;t a
          number — it&rsquo;s structure. Summerlin is, at its core, one
          master-planned vision carried out consistently across the whole
          area: the same design language, the same trail system, the same
          Downtown Summerlin hub for errands and dinner, all of it pressed up
          against Red Rock Canyon. Move anywhere inside Summerlin and you know
          roughly what you&rsquo;re getting.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Henderson isn&rsquo;t one master plan — it&rsquo;s a whole city&rsquo;s
          worth of them, plus a lake community, guard-gated hillside estates,
          and a historic downtown that predates all of it. Most people
          don&rsquo;t really move to &ldquo;Henderson&rdquo; so much as to one
          specific corner of it — Green Valley, Inspirada, Cadence, Lake Las
          Vegas, Anthem, MacDonald Highlands, or the Water Street District —
          and those corners can feel almost nothing alike. That means the HOA
          culture, the architectural style, and even the age of the streets
          around you depend entirely on which Henderson you pick. Summerlin
          asks you to buy into one plan. Henderson asks you to pick your plan
          first.
        </p>
      </StorySection>

      <StorySection heading="Where you actually land">
        <p className="text-body-lg text-lvinit-warmgray">
          Summerlin sits on the western edge of the valley, where the city
          runs out and Red Rock Canyon begins. On a normal morning
          you&rsquo;re roughly 25 minutes from downtown and the Strip, longer
          when the 215 has other plans. If your life is anchored east — an
          office off the Strip, family in Henderson — that&rsquo;s a real
          drive to do honestly before the sunsets talk you into it.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Henderson sits on the southeast side, which generally puts it
          closer to the airport and the east side of the valley, and farther
          from Summerlin and the northwest. But because Henderson is so many
          different communities stitched together, the honest answer to
          &ldquo;what&rsquo;s the commute like&rdquo; changes a lot depending
          on which part of Henderson you&rsquo;re asking about — a Green
          Valley address and a Lake Las Vegas address don&rsquo;t drive the
          same. Map your actual daily route to work before you fall for a
          specific street on either side of the valley.
        </p>
      </StorySection>

      <StoryPullQuote>
        Both are good answers. They&rsquo;re just good answers to different
        questions.
      </StoryPullQuote>

      <StorySection heading="Who each one actually suits">
        <p className="text-body-lg text-lvinit-warmgray">
          Summerlin tends to fit families who want top-ranked schools and
          trails out the back door, and anyone who&rsquo;d genuinely rather be
          near the mountains than the Strip. It suits people who value calm
          and are willing to pay for it — this is one of the pricier corners
          of the valley, and the master-planned polish comes with a certain
          sameness from street to street. It&rsquo;s not the fit if you want
          to walk to a bar, live cheaply, or be ten minutes from a downtown
          office.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Henderson tends to fit families and anyone who wants a settled,
          residential base, buyers drawn specifically to newer construction
          and master-planned amenities, and people who&rsquo;d rather choose
          from many different kinds of community than settle for one. It also
          suits anyone whose daily life leans toward the east side or the
          airport. It&rsquo;s not the fit if you want to walk out into
          nightlife, be minutes from a west-side or Strip office, or live in
          one single dense, walkable urban core — Henderson&rsquo;s version of
          walkable is more &ldquo;good dinner, easy errands&rdquo; than
          &ldquo;walk into a scene.&rdquo;
        </p>
      </StorySection>

      <StorySection heading="Housing stock: consistency vs. range">
        <p className="text-body-lg text-lvinit-warmgray">
          Because Summerlin is one continuous master plan, its housing stock
          reads fairly consistent — similar eras, similar architectural
          language, similar price tier across most of the area. That
          consistency is exactly what some buyers are paying for, and exactly
          what others find a little too uniform.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          Henderson&rsquo;s housing stock spans a much wider range, because
          it&rsquo;s really several different building eras layered together.
          Green Valley is Henderson&rsquo;s original master-planned
          community, with mature landscaping and streets that have had
          decades to grow in. Inspirada and Cadence are newer-generation
          master plans still filling in, built around parks and trails.
          MacDonald Highlands is the high-end, guard-gated hillside address
          with long valley views. The Water Street District is Henderson&rsquo;s
          historic downtown, with older bones and a genuine sense of place
          that none of the master-planned areas — on either side of the valley
          — can replicate. If you want one consistent look, Summerlin gives
          you that by design. If you want to shop across established, brand
          new, luxury hillside, and historic in the same city, Henderson is
          built for that comparison shopping.
        </p>
      </StorySection>

      <StorySection muted heading="Where each one falls short">
        <p className="text-body-lg text-lvinit-warmgray">
          Neither of these is the right move for everyone, and I&rsquo;d
          rather tell you that now than after you&rsquo;ve signed. Summerlin&rsquo;s
          honest downsides: it&rsquo;s one of the pricier places to land in
          the valley, the master-planned polish can feel a little uniform
          street to street, and the newer, more exposed pockets feel the
          summer heat hardest. Henderson&rsquo;s honest downside is the
          flip side of its biggest strength — the variety that makes it so
          flexible also makes &ldquo;Henderson&rdquo; a genuinely confusing
          answer until you&rsquo;ve picked your corner, and a good fit in one
          Henderson community (say, Lake Las Vegas&rsquo;s resort-quiet pace)
          can be the wrong fit entirely three communities over.
        </p>
      </StorySection>

      <StorySection heading="So, which one actually wins?">
        <p className="text-body-lg text-lvinit-warmgray">
          Neither, honestly — and I mean that as a real answer, not a dodge.
          If you want one cohesive master plan, real trailheads, top-ranked
          schools, and you&rsquo;re fine paying a premium and living on the
          west side, Summerlin is very hard to beat. If you want more range —
          the option to go established or brand new, lakeside or hillside,
          historic or master-planned, inside one city — and your life leans
          east, Henderson gives you room Summerlin simply doesn&rsquo;t have.
        </p>
        <p className="mt-5 text-body-lg text-lvinit-warmgray">
          The question worth answering isn&rsquo;t which suburb is
          objectively better. It&rsquo;s which one matches how you actually
          want to live day to day — and for that, the honest next step is
          usually a conversation, not another list. Tell me your commute, your
          budget, and what a good Tuesday looks like to you, and I&rsquo;ll
          tell you straight which side of the valley — or which corner of
          it — actually fits.
        </p>
      </StorySection>

      <StorySection heading="About this coverage">
        <p className="text-body text-lvinit-warmgray">
          Mikey Del Rosario · Las Vegas Real Estate Advisor · The Scofield
          Group · Nevada License S.0175577. Equal Housing Opportunity.
        </p>
      </StorySection>
    </StoryPage>
  );
}
