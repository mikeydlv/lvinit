import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Summerlin — A Neighborhood Guide | LVINIT",
  description:
    "The honest local guide to living in Summerlin, Las Vegas — the setting, the daily life, the commute, the tradeoffs, and who it actually fits.",
  alternates: { canonical: "/neighborhoods/summerlin" },
};

// Original LVINIT photography by Mikey Del Rosario.
const HERO_IMAGE =
  "/images/hero/summerlin-fox-hill-park-red-rock-aerial-drone.webp";

const beats = [
  {
    heading: "The setting",
    body: "Summerlin sits on the western edge of the valley, where the city runs out and Red Rock Canyon begins. On a clear morning the sandstone turns the color of the name. It's the reason people trade a shorter commute for this side of town — you're minutes from real trailheads, not a landscaped approximation of them.",
  },
  {
    heading: "Daily life",
    body: "This is a master-planned community, and it feels like one — in the good and the ordinary sense. Parks you can walk to, schools that consistently rank near the top of the valley, and Downtown Summerlin for the errands and the dinners you didn't want to plan. It's calm. Some people read that as a little quiet. They're not wrong.",
  },
  {
    heading: "The commute",
    body: "You're roughly 25 minutes from downtown and the Strip on a normal morning, and longer when the 215 decides otherwise. If your life is anchored east — an office off the Strip, family in Henderson — do that math honestly before you fall for the sunsets.",
  },
  {
    heading: "The tradeoffs",
    body: "You pay for Summerlin. It's one of the pricier places to land in the valley, and the master-planned polish means a certain sameness from street to street. Summers are hot everywhere here, but the newer, more exposed pockets feel it most. None of that is a dealbreaker — it's just the math worth doing with your eyes open.",
  },
];

export default function SummerlinPage() {
  return (
    <>
      <Navbar />

      <main id="main-content" className="bg-lvinit-white">
        {/* Hero — real Summerlin photography */}
        <section className="relative flex min-h-[78vh] items-end overflow-hidden">
          <Image
            src={HERO_IMAGE}
            alt="Aerial view of Fox Hill Park in Summerlin with Red Rock Canyon in the background, photographed by Mikey Del Rosario."
            title="Fox Hill Park, Summerlin — Photo by Mikey Del Rosario"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-lvinit-black/45 via-lvinit-black/10 to-transparent"
          />
          <Container className="relative z-10 pb-14 pt-40 sm:pb-20">
            <Link
              href="/#neighborhoods"
              className="text-caption uppercase tracking-wide text-lvinit-white/80 hover:text-lvinit-white"
            >
              ← Neighborhoods
            </Link>
            <h1 className="mt-4 font-display text-[52px] leading-[54px] font-black text-lvinit-white sm:text-display sm:leading-[88px]">
              Summerlin
            </h1>
            <p className="mt-4 max-w-xl text-body-lg text-lvinit-white/90">
              Master-planned, trail-laced, and pressed right up against Red Rock.
            </p>
          </Container>
        </section>

        {/* Lead — the honest framing */}
        <Container className="py-20 sm:py-28">
          <p className="flex items-center gap-3 text-caption uppercase tracking-wide text-lvinit-warmgray">
            <span className="h-px w-8 bg-lvinit-blue" aria-hidden="true" />
            Las Vegas · A Neighborhood Guide
          </p>
          <p className="mt-8 max-w-3xl font-display text-[28px] leading-[38px] text-lvinit-black sm:text-thesis sm:leading-[64px]">
            Ask anyone where to live in Las Vegas and Summerlin comes up fast —
            usually first. Here&rsquo;s the honest version.
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
                <p className="mt-4 text-body-lg text-lvinit-warmgray">{beat.body}</p>
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
                Families who want top schools and trails out the back door.
                Anyone who&rsquo;d rather be near the mountains than the Strip.
                People who value calm — and are willing to pay for it.
              </p>
            </div>
            <div>
              <p className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                Who it might not be
              </p>
              <p className="mt-4 max-w-md text-body-lg text-lvinit-warmgray">
                If you want to walk to a bar, live cheaply, or be ten minutes
                from a downtown office, other neighborhoods fit you better —
                and I&rsquo;ll happily point you to them.
              </p>
            </div>
          </div>
        </Container>

        {/* Related lifestyle feature */}
        <Container className="pb-20 sm:pb-28">
          <Link
            href="/neighborhoods/summerlin/fourth-of-july-parade"
            className="group grid grid-cols-1 gap-6 border-t border-lvinit-lightgray pt-12 sm:grid-cols-2 sm:items-center sm:gap-10"
          >
            <div className="relative aspect-[3/2] w-full overflow-hidden">
              <Image
                src="/images/features/summerlin-fourth-of-july-parade-banner.webp"
                alt="Summerlin Fourth of July Parade"
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-caption uppercase tracking-wide text-lvinit-blue">
                Local feature
              </p>
              <h2 className="mt-3 font-display text-heading-sm font-bold text-lvinit-black transition-colors duration-200 ease-calm group-hover:text-lvinit-blue">
                Summerlin Fourth of July Parade
              </h2>
              <p className="mt-3 max-w-md text-body text-lvinit-warmgray">
                See how one local tradition shows the community side of
                Summerlin.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-body font-medium text-lvinit-blue">
                Read the feature
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 ease-calm group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </div>
          </Link>
        </Container>

        {/* Related Summerlin Stories — content cluster (only real pages link) */}
        <Container className="pb-20 sm:pb-28">
          <div className="border-t border-lvinit-lightgray pt-12">
            <h2 className="font-display text-heading-sm font-bold text-lvinit-black">
              Related Summerlin Stories
            </h2>
            <ul className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-3">
              <li>
                <Link
                  href="/neighborhoods/summerlin/fourth-of-july-parade"
                  className="group block border-t border-lvinit-black pt-4"
                >
                  <p className="text-caption uppercase tracking-wide text-lvinit-blue">
                    Local feature
                  </p>
                  <h3 className="mt-2 font-display text-subhead font-bold text-lvinit-black transition-colors duration-200 ease-calm group-hover:text-lvinit-blue">
                    Summerlin Fourth of July Parade
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-2 text-body text-lvinit-blue">
                    Read
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 ease-calm group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </li>
              {["Downtown Summerlin", "Fox Hill Park"].map((title) => (
                <li key={title} className="border-t border-lvinit-lightgray pt-4">
                  <p className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                    Coming soon
                  </p>
                  <h3 className="mt-2 font-display text-subhead font-bold text-lvinit-warmgray">
                    {title}
                  </h3>
                  <span className="mt-3 inline-block text-body text-lvinit-warmgray/70">
                    In the works
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Container>

        {/* Gentle contact CTA — not a brokerage hard sell */}
        <section className="bg-lvinit-lightgray/50">
          <Container className="py-16 text-center sm:py-20">
            <h2 className="mx-auto max-w-2xl font-display text-heading-sm font-bold text-lvinit-black sm:text-heading">
              Thinking about Summerlin?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-body-lg text-lvinit-warmgray">
              Tell me what you&rsquo;re weighing and I&rsquo;ll give you the
              unfiltered version — including the neighborhoods I&rsquo;d point
              you to instead if it&rsquo;s not the fit.
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
    </>
  );
}
