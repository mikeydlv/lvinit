import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

const SITE_URL = "https://www.lvinit.com";
const PATH = "/neighborhoods/henderson";
const TITLE = "Henderson — A Neighborhood Guide | LVINIT";
const DESCRIPTION =
  "The honest local guide to living in Henderson, Nevada — the Las Vegas valley's widest range of communities and lifestyles. What it's actually like, who it fits, and the areas inside it, from Green Valley to Lake Las Vegas.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    url: `${SITE_URL}${PATH}`,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

// Structured data — breadcrumb only (Home → Henderson). No fabricated Place/rating
// data: this page makes no numeric claims, so none are asserted in schema either.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
    {
      "@type": "ListItem",
      position: 2,
      name: "Henderson",
      item: `${SITE_URL}${PATH}`,
    },
  ],
};

// "What it's actually like" — cautious, qualitative beats. No prices, minutes,
// walk scores, or rankings anywhere in this file, by design.
const beats = [
  {
    heading: "Lifestyle",
    body: "Henderson's real signature is range. Inside one city you'll find brand-new master-planned communities, established tree-lined neighborhoods, a resort community built around a lake, guard-gated hillside estates, and a historic downtown — each a genuinely different way to live. Most people don't move to “Henderson” so much as to one specific corner of it, and picking the corner matters more here than almost anywhere else in the valley.",
  },
  {
    heading: "Commute",
    body: "Henderson sits on the southeast side of the valley, which generally puts you closer to the airport and the east side than the west valley is — and farther from Summerlin and the northwest. But real drive times depend entirely on which part of Henderson you're in and where you're headed each day. Map your actual commute before you fall for a specific neighborhood; the city is big enough that the answer changes a lot from one community to the next.",
  },
  {
    heading: "Schools & family",
    body: "Henderson has long been shorthand for “the family choice” in the valley — a reputation built on parks, newer neighborhoods, and a settled, residential feel. Schools vary school to school, though, and boundaries change, so treat the reputation as a starting point rather than a guarantee and check the specifics for the exact address you're weighing.",
  },
  {
    heading: "Outdoor access",
    body: "You're close to a lot without being on top of it — regional and community parks, trail systems, and the water and open space around Lake Las Vegas and the hillside communities. It reads less like “trailhead out the back door” than the west side and more like a lot of green and open space woven through where people actually live.",
  },
  {
    heading: "Shopping, dining & entertainment",
    body: "Between The District at Green Valley Ranch, the resort casinos on this side of town, and the newer town centers inside the master plans, Henderson keeps most of everyday life close by. It isn't the nightlife-first part of the valley — it's more “good dinner, easy errands, something to do on the weekend” than “walk out into a scene.”",
  },
];

// Reasons people land here — fit-focused, not a stat sheet.
const reasons = [
  "Range at every stage of life — a first place, a growing family's home, a right-size later on, a resort-quiet chapter — often inside the same city.",
  "Newer construction, if that's what you want — several of the valley's most active master-planned communities are here.",
  "A settled, residential feel — Henderson generally reads calmer and more family-oriented than the areas pressed up against the Strip.",
  "Room to match a home to a life, not the other way around — precisely because the communities here are so different from one another.",
];

// Community roster. Honest, qualitative descriptions — NO stats, prices, or
// rankings. NOTE FOR MIKEY: please review each of these for local accuracy and
// tone before we treat any of it as final; correct anything that reads off.
const communities: Array<{ name: string; body: string }> = [
  {
    name: "Green Valley",
    body: "Henderson's original master-planned community, and the one most people picture first. It's the established, settled part of town — mature landscaping, streets that have had time to grow in, and The District at Green Valley Ranch giving it something close to a walkable center for dinner and errands. If you want Henderson with a track record rather than a construction timeline, this is usually where the conversation starts.",
  },
  {
    name: "Inspirada",
    body: "One of the newer master-planned communities on the southwest side, built around parks, trails, and open space. It skews family-first and is still filling in, so you'll find newer construction alongside a community actively growing into itself — a fit for buyers who want something recent and green with room to settle in.",
  },
  {
    name: "Cadence",
    body: "One of the largest of the new-generation master plans, out toward the east. It leans amenity- and event-forward — a big central park and a steady calendar of community happenings — and, like Inspirada, is still expanding. It tends to appeal to buyers who want a newer home with plenty built in close by.",
  },
  {
    name: "Lake Las Vegas",
    body: "The valley's resort curveball: a community built around a man-made lake, anchored by MonteLago Village and a genuinely unhurried, resort-quiet pace. It sits a little apart from the rest of Henderson, which is exactly the point for the people who choose it. Worth understanding on its own terms — there's a closer look coming below.",
  },
  {
    name: "Anthem",
    body: "A hillside area to the south, known for elevation and views. “Anthem” actually covers several distinct pieces — including an age-restricted section (Sun City Anthem) and guard-gated country-club living (Anthem Country Club) — so the name can mean very different things depending on which part you're looking at. Worth pinning down exactly which Anthem you mean early in the search.",
  },
  {
    name: "MacDonald Highlands",
    body: "Henderson's high-end, guard-gated hillside address, climbing above the valley with the long views that come with elevation. This is the luxury end of the Henderson map, where the specifics matter a great deal — the kind of area that's worth walking through in person and talking over directly.",
  },
  {
    name: "Water Street District",
    body: "Henderson's historic downtown — the original core, now well into a long revitalization. Civic buildings, events, and a walkable main-street stretch give it a different texture from the master-planned communities around it: older bones, a real sense of place, and genuine momentum.",
  },
];

// Featured stories — none of these pages exist yet, so every card is a
// non-linked "in the works" placeholder (same honesty rule as the Summerlin
// cluster: we never ship a dead internal link). Flip a card to a <Link> as each
// story is actually published, per the New Page Checklist.
const stories = [
  {
    name: "Four Seasons Private Residences",
    dek: "A closer look at branded, service-forward residential living arriving in Henderson.",
  },
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
];

export default function HendersonPage() {
  return (
    <>
      <Navbar />

      <main id="main-content" className="bg-lvinit-white">
        {/* HERO — Option B: shipping with a clean, bright editorial treatment
            until Mikey's own Henderson photography lands. To go live with a
            photo, drop it at /images/hero/henderson-<descriptive-name>.webp and
            restore the full-bleed <Image> + dark-gradient treatment used in
            app/neighborhoods/summerlin/page.tsx. No fabricated scenery is used
            in the meantime. */}
        <section className="relative flex min-h-[62vh] items-end overflow-hidden border-b border-lvinit-lightgray bg-gradient-to-b from-lvinit-lightgray/50 via-lvinit-white to-lvinit-white">
          <Container className="relative z-10 pb-14 pt-40 sm:pb-20 sm:pt-48">
            <Link
              href="/#neighborhoods"
              className="text-caption uppercase tracking-wide text-lvinit-warmgray hover:text-lvinit-blue transition-colors duration-200 ease-calm"
            >
              ← Neighborhoods
            </Link>
            <h1 className="mt-4 font-display text-[52px] leading-[54px] font-black text-lvinit-black sm:text-display sm:leading-[88px]">
              Henderson
            </h1>
            <p className="mt-5 max-w-2xl text-body-lg text-lvinit-warmgray">
              The valley&rsquo;s widest range of communities — brand-new
              master-plans, a lake, a historic downtown, and hillside estates.
              One city, a dozen different ways to live.
            </p>
            <a
              href="#communities"
              className="mt-8 inline-flex items-center gap-2 text-body font-medium text-lvinit-blue"
            >
              Explore Henderson&rsquo;s communities
              <span aria-hidden="true">↓</span>
            </a>
          </Container>
        </section>

        {/* Lead — the honest framing (distinct from Summerlin's) */}
        <Container className="py-20 sm:py-28">
          <p className="flex items-center gap-3 text-caption uppercase tracking-wide text-lvinit-warmgray">
            <span className="h-px w-8 bg-lvinit-blue" aria-hidden="true" />
            Las Vegas · A Neighborhood Guide
          </p>
          <p className="mt-8 max-w-3xl font-display text-[28px] leading-[38px] text-lvinit-black sm:text-thesis sm:leading-[64px]">
            From lakeside living to luxury estates to family-friendly
            master-planned communities, Henderson offers more variety than
            anywhere else in Southern Nevada.
          </p>
          <p className="mt-8 max-w-2xl text-body-lg text-lvinit-warmgray">
            That&rsquo;s the honest headline here. &ldquo;Henderson&rdquo; isn&rsquo;t
            really one place you move to — it&rsquo;s a dozen, each with its own
            pace, price, and personality. So this guide spends less time selling
            you the city and more time helping you find your corner of it.
          </p>
        </Container>

        {/* Beats — what it's actually like */}
        <Container className="pb-8">
          <div className="grid grid-cols-1 gap-x-16 gap-y-14 border-t border-lvinit-lightgray pt-12 md:grid-cols-2">
            {beats.map((beat) => (
              <div key={beat.heading} className="max-w-xl">
                <h2 className="font-display text-heading-sm font-bold text-lvinit-black">
                  {beat.heading}
                </h2>
                <p className="mt-4 text-body-lg text-lvinit-warmgray">
                  {beat.body}
                </p>
              </div>
            ))}
          </div>
        </Container>

        {/* Who it's for — honest, not a sales pitch */}
        <Container className="py-20 sm:py-28">
          <div className="grid grid-cols-1 gap-12 border-t border-lvinit-lightgray pt-12 md:grid-cols-2">
            <div>
              <p className="text-caption uppercase tracking-wide text-lvinit-blue">
                Who it&rsquo;s for
              </p>
              <p className="mt-4 max-w-md text-body-lg text-lvinit-black">
                Families and anyone who wants a settled, residential base. Buyers
                drawn to newer construction and master-planned amenities. People
                who&rsquo;d rather choose from many different kinds of community
                than settle for one — and anyone whose life leans toward the east
                side or the airport.
              </p>
            </div>
            <div>
              <p className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                Who it might not be
              </p>
              <p className="mt-4 max-w-md text-body-lg text-lvinit-warmgray">
                If you want to walk out into nightlife, be minutes from a
                west-side or Strip office, or live in a single dense, walkable
                urban core, other parts of the valley will fit you better — and
                I&rsquo;ll happily point you to them.
              </p>
            </div>
          </div>
        </Container>

        {/* Why people choose Henderson — fit-focused, leads into the roster */}
        <section className="bg-lvinit-lightgray/40">
          <Container className="py-20 sm:py-28">
            <h2 className="max-w-3xl font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
              Why people choose Henderson
            </h2>
            <p className="mt-5 max-w-2xl text-body-lg text-lvinit-warmgray">
              There&rsquo;s no single Henderson buyer, and that&rsquo;s the whole
              point. People land here for different reasons, and the city is big
              and varied enough to actually deliver on most of them.
            </p>
            <ul className="mt-10 grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
              {reasons.map((reason) => (
                <li key={reason} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-lvinit-blue"
                  />
                  <p className="text-body-lg text-lvinit-black">{reason}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* Community roster — the page's signature section */}
        <section id="communities" className="scroll-mt-24">
          <Container className="py-20 sm:py-28">
            <p className="text-caption uppercase tracking-wide text-lvinit-blue">
              Explore Henderson&rsquo;s communities
            </p>
            <h2 className="mt-3 max-w-3xl font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
              Every part of Henderson feels different
            </h2>
            <p className="mt-5 max-w-2xl text-body-lg text-lvinit-warmgray">
              A quick, honest tour of the areas people mean when they say
              Henderson — from the established and settled to the brand-new, the
              resort-quiet, and the historic. Start with the one that sounds like
              your life; we can go deeper on any of them together.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-x-16 gap-y-12 border-t border-lvinit-lightgray pt-12 md:grid-cols-2">
              {communities.map((c) => (
                <div key={c.name} className="max-w-xl">
                  <h3 className="font-display text-subhead font-bold text-lvinit-black">
                    {c.name}
                  </h3>
                  <p className="mt-3 text-body text-lvinit-warmgray">{c.body}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Featured Henderson Stories — all "in the works" (no dead links) */}
        <Container className="pb-20 sm:pb-28">
          <div className="border-t border-lvinit-lightgray pt-12">
            <h2 className="font-display text-heading-sm font-bold text-lvinit-black">
              Featured Henderson Stories
            </h2>
            <p className="mt-4 max-w-2xl text-body text-lvinit-warmgray">
              Closer looks at the corners of Henderson worth their own story.
              These are in production — check back as they publish.
            </p>
            <ul className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
              {stories.map((story) => (
                <li
                  key={story.name}
                  className="border-t border-lvinit-lightgray pt-4"
                >
                  <p className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                    Coming soon
                  </p>
                  <h3 className="mt-2 font-display text-subhead font-bold text-lvinit-warmgray">
                    {story.name}
                  </h3>
                  <p className="mt-2 text-body text-lvinit-warmgray/80">
                    {story.dek}
                  </p>
                  <span className="mt-3 inline-block text-body text-lvinit-warmgray/70">
                    In the works
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Container>

        {/* Cross-link to the other live pillar (real link only) */}
        <Container className="pb-20 sm:pb-28">
          <Link
            href="/neighborhoods/summerlin"
            className="group block border-t border-lvinit-lightgray pt-12"
          >
            <p className="text-caption uppercase tracking-wide text-lvinit-blue">
              Weighing the west side?
            </p>
            <h2 className="mt-3 font-display text-heading-sm font-bold text-lvinit-black transition-colors duration-200 ease-calm group-hover:text-lvinit-blue">
              Read the Summerlin guide
            </h2>
            <p className="mt-3 max-w-xl text-body text-lvinit-warmgray">
              Henderson&rsquo;s natural counterpoint across the valley — trails,
              Red Rock, and a different kind of master-planned life. Here&rsquo;s
              the honest version.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-body font-medium text-lvinit-blue">
              Explore Summerlin
              <span
                aria-hidden="true"
                className="transition-transform duration-200 ease-calm group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </Link>
        </Container>

        {/* Gentle contact + search CTA — not a brokerage hard sell */}
        <section className="bg-lvinit-lightgray/50">
          <Container className="py-16 text-center sm:py-20">
            <h2 className="mx-auto max-w-2xl font-display text-heading-sm font-bold text-lvinit-black sm:text-heading">
              Not sure which Henderson is yours?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-body-lg text-lvinit-warmgray">
              Tell me what you&rsquo;re weighing — the stage of life, the budget,
              the commute that has to work — and I&rsquo;ll help you narrow a
              dozen communities down to the two or three actually worth your time.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <ButtonLink href="/contact" variant="primary">
                Get in touch
              </ButtonLink>
              <ButtonLink href="/search" variant="tertiary">
                Browse homes in Las Vegas
              </ButtonLink>
            </div>
          </Container>
        </section>
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
