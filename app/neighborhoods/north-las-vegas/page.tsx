import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { StoryVideo } from "@/components/story";
import { buildStoryMetadata, SITE_URL, type StoryMeta } from "@/lib/story";

const PATH = "/neighborhoods/north-las-vegas";
// Real photograph LICENSED THROUGH SHUTTERSTOCK (asset 1094171159, contributor
// "Little Vignettes Photo") — NOT Mikey's own work, so it is NOT credited to him.
// A subtle "Photo: Little Vignettes Photo / Shutterstock" credit sits at the
// bottom of the hero, which satisfies the footer's global "photography by Mikey
// unless otherwise noted." next/image optimizes it (responsive sizes + modern
// formats) at serve time; the source file is left unaltered.
const HERO_IMAGE = "/images/hero/north-las-vegas-aerial.jpg";
const HERO_ALT =
  "Aerial view of North Las Vegas at golden hour — the residential street grid of the northern Las Vegas Valley stretching toward the desert mountains on the horizon.";

const meta: StoryMeta = {
  title:
    "Living in North Las Vegas: Neighborhoods, Homes & Local Guide | LVINIT",
  headline: "Living in North Las Vegas",
  description:
    "An honest local guide to North Las Vegas — its own city in the Las Vegas Valley. How the neighborhoods, housing, new construction, and growth actually differ from one area to the next.",
  path: PATH,
  image: HERO_IMAGE,
  imageWidth: 2500,
  imageHeight: 1667,
  imageAlt: HERO_ALT,
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "North Las Vegas", path: PATH },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

// Breadcrumb JSON-LD only — matches the Henderson pillar (a place guide, not an
// Article). Built from the same breadcrumb trail as the metadata above.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: meta.breadcrumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: `${SITE_URL}${c.path}`,
  })),
};

// "At a glance" — honest, qualitative. NO fabricated market numbers; where a
// figure would help, the copy points to confirming current data instead. A real
// market-snapshot block can slot in here later without changing the structure.
const glance = [
  {
    heading: "Where it sits",
    body: "North Las Vegas is a separate, incorporated city at the northern end of the valley — not a district of Las Vegas, despite the name. It runs from older, established central neighborhoods up into brand-new desert subdivisions still under construction.",
  },
  {
    heading: "Housing character",
    body: "This is the hardest part of the valley to generalize about. Within a few miles you'll find mature, established streets near the center, large amenity-driven master-planned communities, and new-build neighborhoods on the northern edge.",
  },
  {
    heading: "New construction",
    body: "North Las Vegas has been home to some of the valley's most active new-home building, concentrated in the north. Inventory and pricing move quickly here, so treat any snapshot as a starting point and check current numbers before you anchor to them.",
  },
  {
    heading: "Getting around",
    body: "I-15 runs straight through the city and the 215 Beltway wraps the valley's northern edge. Between them, your commute can be easy or long depending entirely on which part of North Las Vegas you're in and where you're headed.",
  },
  {
    heading: "Nellis Air Force Base",
    body: "Nellis Air Force Base sits along the northeast side of the Las Vegas Valley, near North Las Vegas — a major local employer and a real factor for military families considering this side of town. Military flight activity can also be part of life in some nearby areas, which is worth experiencing in person before you decide.",
  },
  {
    heading: "Room to grow",
    body: "The city has been among the valley's fastest-growing in recent years, with residential development steadily pushing north into open desert. That growth is a big part of why the housing up here is so varied.",
  },
];

// Areas people researching North Las Vegas tend to hear about. Descriptions are
// deliberately general — no invented boundaries. Structured so each can become
// its own linked guide later. NOTE FOR MIKEY: please sanity-check these for
// local accuracy before we treat them as final.
const areas = [
  {
    name: "Aliante",
    body: "A large master-planned community in the north, built around a regional park, golf, and its own casino-resort. One of the more established of the city's newer areas — amenity-rich and fairly self-contained.",
  },
  {
    name: "Tule Springs",
    body: "A newer-growth area on the northern edge, near the Tule Springs Fossil Beds National Monument. Newer homes, big-sky surroundings, and still filling in. People use the name loosely for a broad stretch of the far north.",
  },
  {
    name: "Valley Vista",
    body: "A newer master-planned community on the north side — the kind of newer-development area where a lot of recent building has happened. Phases and edges are still evolving as it grows.",
  },
  {
    name: "Craig Ranch area",
    body: "Centered on Craig Ranch Regional Park, this is more established, central North Las Vegas — older housing stock and mature surroundings rather than new construction.",
  },
  {
    name: "Northern growth areas",
    body: "The active edge of the city, where brand-new subdivisions meet open desert. The newest homes, the longest drives to the valley's core, and the part of North Las Vegas changing fastest — what's true today may not be in a year.",
  },
];

export default function NorthLasVegasPage() {
  return (
    <>
      <Navbar />

      <main id="main-content" className="bg-lvinit-white">
        {/* Hero — real aerial photograph. Focal point tuned (object-[center_40%])
            so the mountain range and the valley grid both stay prominent across
            desktop, tablet, and mobile crops. Subtle bottom gradient only, for
            text readability; natural colors preserved. */}
        <section className="relative flex min-h-[78vh] items-end overflow-hidden">
          <Image
            src={HERO_IMAGE}
            alt={HERO_ALT}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_40%]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-lvinit-black/55 via-lvinit-black/15 to-transparent"
          />
          {/* Subtle licensed-image credit — muted, bottom edge, out of the way
              of the headline/subheadline. */}
          <p className="absolute bottom-2 right-4 z-10 text-[11px] leading-none tracking-wide text-lvinit-white/50">
            Photo: Little Vignettes Photo / Shutterstock
          </p>
          <Container className="relative z-10 pb-14 pt-40 sm:pb-20">
            <Link
              href="/#neighborhoods"
              className="text-caption uppercase tracking-wide text-lvinit-white/80 hover:text-lvinit-white"
            >
              ← Neighborhoods
            </Link>
            <h1 className="mt-4 font-display text-[52px] leading-[54px] font-black text-lvinit-white sm:text-display sm:leading-[88px]">
              North Las Vegas
            </h1>
            <p className="mt-4 max-w-2xl text-body-lg text-lvinit-white/90">
              Often lumped in with Las Vegas, North Las Vegas is its own city —
              with its own neighborhoods, its own growth story, and a housing
              market that changes a lot depending on where you look.
            </p>
          </Container>
        </section>

        {/* Lead framing */}
        <Container className="pt-20 sm:pt-28">
          <p className="flex items-center gap-3 text-caption uppercase tracking-wide text-lvinit-warmgray">
            <span className="h-px w-8 bg-lvinit-blue" aria-hidden="true" />
            Las Vegas Valley · An Area Guide
          </p>
          <p className="mt-8 max-w-3xl font-display text-[28px] leading-[38px] text-lvinit-black sm:text-thesis sm:leading-[64px]">
            One of the most misunderstood parts of the valley — mostly because
            people talk about North Las Vegas like every part of it is the same.
          </p>
        </Container>

        {/* The Local's Note — LVINIT signature callout (Doc 02 §21) */}
        <Container className="py-14 sm:py-16">
          <aside className="mx-auto max-w-3xl border-l-2 border-lvinit-blue pl-6 sm:pl-8">
            <p className="font-display italic text-subhead text-lvinit-blue">
              The Local&rsquo;s Note
            </p>
            <p className="mt-4 text-body-lg text-lvinit-black">
              When people tell me they&rsquo;re moving to &ldquo;Las Vegas,&rdquo;
              their actual home search usually spans three different cities —
              Las Vegas, Henderson, and North Las Vegas — without them realizing
              it. North Las Vegas especially gets treated like one single kind of
              place. It isn&rsquo;t. Where you land inside the city can completely
              change your experience of living here.
            </p>
            <p className="mt-5 text-caption uppercase tracking-wide text-lvinit-warmgray">
              Mikey Del Rosario
            </p>
          </aside>
        </Container>

        {/* North Las Vegas at a glance */}
        <Container className="py-8">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            North Las Vegas at a glance
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-x-16 gap-y-12 border-t border-lvinit-lightgray pt-10 md:grid-cols-2">
            {glance.map((item) => (
              <div key={item.heading} className="max-w-xl">
                <h3 className="font-display text-subhead font-bold text-lvinit-black">
                  {item.heading}
                </h3>
                <p className="mt-3 text-body text-lvinit-warmgray">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>

        {/* Home tour video — reuses the shared StoryVideo (responsive 16:9,
            youtube-nocookie, lazy, no autoplay) */}
        <div className="pt-12 sm:pt-16">
          <StoryVideo
            youtubeId="HuUUHgq2Sn8"
            title="Inside a North Las Vegas home — tour by Mikey Del Rosario"
            heading="Inside a North Las Vegas Home"
            intro="Sometimes the easiest way to understand an area's housing is to walk through a home. Here's a look inside a North Las Vegas property with a private pool and a layout representative of the kind of established housing you'll find in parts of the city — not the whole city, and not a luxury benchmark. Just a real, useful reference point."
            id="home-tour"
          />
        </div>

        {/* What living here actually feels like */}
        <Container className="py-16 sm:py-24">
          <div className="mx-auto max-w-[680px]">
            <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
              What living in North Las Vegas actually feels like
            </h2>
            <p className="mt-5 text-body-lg text-lvinit-warmgray">
              More than almost anywhere else in the valley, the honest answer to
              &ldquo;what&rsquo;s it like?&rdquo; is: it depends on where. North
              Las Vegas isn&rsquo;t one neighborhood with one feel — it&rsquo;s a
              wide city that reads completely differently from one part to the
              next.
            </p>
            <p className="mt-5 text-body-lg text-lvinit-warmgray">
              The <span className="text-lvinit-black">established areas</span>{" "}
              near the center are older and lived-in — mature trees, settled
              streets, closer to downtown and to Nellis. The{" "}
              <span className="text-lvinit-black">
                newer master-planned areas
              </span>{" "}
              trade that history for amenities and newer homes: parks, trails,
              and community built in from the start. And the{" "}
              <span className="text-lvinit-black">northern growth areas</span>{" "}
              are the newest of all — brand-new construction on the edge of open
              desert, big-sky quiet, and longer drives to the rest of the valley.
            </p>
            <p className="mt-5 text-body-lg text-lvinit-warmgray">
              The mistake I see relocating buyers make is judging all of North
              Las Vegas by the one neighborhood they happened to drive through, or
              the one listing they found online. In some parts of North Las
              Vegas, you can drive a few minutes and go from older established
              neighborhoods to areas filled with much newer construction.
            </p>
          </div>
        </Container>

        {/* Areas to know */}
        <section className="bg-lvinit-lightgray/40">
          <Container className="py-20 sm:py-28">
            <p className="text-caption uppercase tracking-wide text-lvinit-blue">
              Areas to know
            </p>
            <h2 className="mt-3 max-w-3xl font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
              The names you&rsquo;ll hear
            </h2>
            <p className="mt-5 max-w-2xl text-body-lg text-lvinit-warmgray">
              A quick, honest orientation to the areas people researching North
              Las Vegas tend to come across. Where you&rsquo;ll hear these names
              used, the exact lines between them can vary — treat them as general
              areas, not precise boundaries.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-x-16 gap-y-12 border-t border-lvinit-lightgray pt-12 md:grid-cols-2">
              {areas.map((area) => (
                <div key={area.name} className="max-w-xl">
                  <h3 className="font-display text-subhead font-bold text-lvinit-black">
                    {area.name}
                  </h3>
                  <p className="mt-3 text-body text-lvinit-warmgray">
                    {area.body}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-10 max-w-2xl text-caption text-lvinit-warmgray">
              Each of these is worth its own guide. As we publish them, this is
              where they&rsquo;ll link from.
            </p>
          </Container>
        </section>

        {/* The honest take */}
        <Container className="py-20 sm:py-28">
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            The honest take
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-12 border-t border-lvinit-lightgray pt-12 md:grid-cols-2">
            <div>
              <p className="text-caption uppercase tracking-wide text-lvinit-blue">
                Where it makes sense
              </p>
              <p className="mt-4 max-w-md text-body-lg text-lvinit-black">
                North Las Vegas can be a smart call if you&rsquo;re weighing
                housing across a range of price points, want newer construction
                without the valley&rsquo;s top-tier pricing, or your life is
                oriented toward the north end of the valley. There&rsquo;s
                genuine variety here — and often more house for the money than
                some higher-cost corners of town.
              </p>
            </div>
            <div>
              <p className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                What to weigh honestly
              </p>
              <p className="mt-4 max-w-md text-body-lg text-lvinit-warmgray">
                The catch is that &ldquo;North Las Vegas&rdquo; isn&rsquo;t one
                answer. Location inside the city matters enormously — commute,
                amenities, and the feel of a neighborhood swing hard from one
                area to the next. Drive it at rush hour, walk it in person, and
                don&rsquo;t judge the whole city by a single street or a single
                listing.
              </p>
            </div>
          </div>
        </Container>

        {/* North Las Vegas vs. the rest of the valley */}
        <Container className="pb-20 sm:pb-28">
          <div className="border-t border-lvinit-lightgray pt-12">
            <h2 className="font-display text-heading-sm font-bold text-lvinit-black">
              North Las Vegas vs. the rest of the valley
            </h2>
            <p className="mt-4 max-w-2xl text-body text-lvinit-warmgray">
              Usually the real question isn&rsquo;t &ldquo;is North Las Vegas
              good?&rdquo; — it&rsquo;s how it compares to the other places
              you&rsquo;re weighing. Start with the guides that exist;
              side-by-side comparisons will follow.
            </p>
            <ul className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-3">
              <li>
                <Link
                  href="/neighborhoods/henderson"
                  className="group block border-t border-lvinit-black pt-4"
                >
                  <p className="text-caption uppercase tracking-wide text-lvinit-blue">
                    Compare
                  </p>
                  <h3 className="mt-2 font-display text-subhead font-bold text-lvinit-black transition-colors duration-200 ease-calm group-hover:text-lvinit-blue">
                    North Las Vegas vs. Henderson
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-2 text-body text-lvinit-blue">
                    Read the Henderson guide
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 ease-calm group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/neighborhoods/summerlin"
                  className="group block border-t border-lvinit-black pt-4"
                >
                  <p className="text-caption uppercase tracking-wide text-lvinit-blue">
                    Compare
                  </p>
                  <h3 className="mt-2 font-display text-subhead font-bold text-lvinit-black transition-colors duration-200 ease-calm group-hover:text-lvinit-blue">
                    North Las Vegas vs. Summerlin
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-2 text-body text-lvinit-blue">
                    Read the Summerlin guide
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 ease-calm group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </li>
              <li className="border-t border-lvinit-lightgray pt-4">
                <p className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                  Coming soon
                </p>
                <h3 className="mt-2 font-display text-subhead font-bold text-lvinit-warmgray">
                  North Las Vegas vs. Las Vegas
                </h3>
                <span className="mt-3 inline-block text-body text-lvinit-warmgray/70">
                  Comparison in the works
                </span>
              </li>
            </ul>
          </div>
        </Container>

        {/* Soft CTA */}
        <section className="bg-lvinit-lightgray/50">
          <Container className="py-16 text-center sm:py-20">
            <h2 className="mx-auto max-w-3xl font-display text-heading-sm font-bold text-lvinit-black sm:text-heading">
              Trying to figure out whether North Las Vegas actually fits your
              lifestyle?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-body-lg text-lvinit-warmgray">
              Choosing where to land in the valley is about more than finding a
              house — it&rsquo;s matching an area to how you actually live. Tell
              me what you&rsquo;re weighing and I&rsquo;ll give you the honest
              read, including the parts of North Las Vegas I&rsquo;d point you
              toward, or away from.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <ButtonLink href="/contact" variant="primary">
                Ask Mikey about North Las Vegas
              </ButtonLink>
              <ButtonLink href="/#neighborhoods" variant="tertiary">
                Explore the Las Vegas Valley
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
