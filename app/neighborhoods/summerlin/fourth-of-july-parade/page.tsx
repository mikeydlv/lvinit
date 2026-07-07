import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

const SITE_URL = "https://www.lvinit.com";
const PATH = "/neighborhoods/summerlin/fourth-of-july-parade";
const HERO_IMAGE = "/images/features/summerlin-fourth-of-july-parade-banner.webp";
const HERO_ALT =
  "Summerlin Fourth of July Parade in Las Vegas featuring the Summerlin community banner.";
const TITLE = "Summerlin Fourth of July Parade — A Local Feature | LVINIT";
const DESCRIPTION =
  "An editorial local's look at the Summerlin Fourth of July Parade — the atmosphere, the highlights, and why a tradition like this tells you so much about living in Summerlin, Las Vegas.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    url: `${SITE_URL}${PATH}`,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}${HERO_IMAGE}`,
        width: 1774,
        height: 887,
        alt: HERO_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${SITE_URL}${HERO_IMAGE}`],
  },
};

// Structured data — Article + breadcrumb. (No Event schema: we don't publish a
// fabricated date/route; the copy points readers to the official calendar.)
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Summerlin Fourth of July Parade",
      description: DESCRIPTION,
      image: `${SITE_URL}${HERO_IMAGE}`,
      datePublished: "2026-07-06",
      dateModified: "2026-07-06",
      author: { "@type": "Person", name: "Mikey Del Rosario" },
      publisher: {
        "@type": "Organization",
        name: "LVINIT",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
      },
      mainEntityOfPage: `${SITE_URL}${PATH}`,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: "Summerlin",
          item: `${SITE_URL}/neighborhoods/summerlin`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Fourth of July Parade",
          item: `${SITE_URL}${PATH}`,
        },
      ],
    },
  ],
};

export default function ParadeFeaturePage() {
  return (
    <>
      <Navbar />

      <main id="main-content" className="bg-lvinit-white">
        {/* Full-width hero — original parade photography */}
        <section className="relative flex min-h-[80vh] items-end overflow-hidden">
          <Image
            src={HERO_IMAGE}
            alt={HERO_ALT}
            title="Summerlin Fourth of July Parade — Photo by Mikey Del Rosario"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Subtle ~35–40% dark gradient for readability, natural photo */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-lvinit-black/45 via-lvinit-black/20 to-transparent"
          />
          <Container className="relative z-10 pb-14 pt-40 sm:pb-20">
            <Link
              href="/neighborhoods/summerlin"
              className="text-caption uppercase tracking-wide text-lvinit-white/80 hover:text-lvinit-white"
            >
              ← Summerlin
            </Link>
            <h1 className="mt-4 max-w-4xl font-display text-[40px] leading-[44px] font-black text-lvinit-white sm:text-display sm:leading-[84px]">
              Summerlin Fourth of July Parade
            </h1>
            <p className="mt-5 max-w-2xl text-body-lg text-lvinit-white/90">
              One of Las Vegas&rsquo; most beloved Independence Day
              traditions—and a perfect glimpse into what makes Summerlin such a
              special place to call home.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <ButtonLink href="#watch" variant="primary">
                ▶ Watch the Parade
              </ButtonLink>
              <ButtonLink
                href="/neighborhoods/summerlin"
                variant="tertiary"
                className="!text-lvinit-white decoration-lvinit-white"
              >
                Explore Summerlin
              </ButtonLink>
            </div>
          </Container>
        </section>

        <article>
          {/* Intro */}
          <Container className="py-16 sm:py-24">
            <div className="mx-auto max-w-[680px]">
              <p className="flex items-center gap-3 text-caption uppercase tracking-wide text-lvinit-warmgray">
                <span className="h-px w-8 bg-lvinit-blue" aria-hidden="true" />
                Summerlin · A Local Feature
              </p>
              <p className="mt-8 text-body-lg leading-[32px] text-lvinit-black first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-[58px] first-letter:leading-[46px] first-letter:font-black first-letter:text-lvinit-black">
                Every year, before the desert heat has fully found its footing,
                the streets of Summerlin fill with lawn chairs, coolers, and
                kids waving small flags they&rsquo;ll still be holding at
                nightfall. The Summerlin Council Patriotic Parade is one of the
                longest-running Fourth of July traditions in Las Vegas—and for a
                lot of families out here, it&rsquo;s the unofficial heartbeat of
                the community&rsquo;s year.
              </p>
              <p className="mt-6 text-body-lg text-lvinit-warmgray">
                If you&rsquo;re trying to understand what it&rsquo;s actually
                like to{" "}
                <Link
                  href="/neighborhoods/summerlin"
                  className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
                >
                  live in Summerlin
                </Link>
                , this one morning tells you more than any brochure could.
              </p>
            </div>
          </Container>

          {/* Video */}
          <section id="watch" aria-label="Watch the parade" className="scroll-mt-24">
            <Container className="pb-8">
              <div className="mx-auto max-w-[900px]">
                <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
                  See it for yourself
                </h2>
                <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
                  Photos only get you so far. Here&rsquo;s the parade in
                  motion—the floats, the bands, and a few thousand neighbors who
                  all decided to spend their morning in the same place.
                </p>
                <div className="relative mt-8 aspect-video w-full overflow-hidden border border-lvinit-lightgray bg-lvinit-black">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/hTEzzxcYhkg?start=342"
                    title="Summerlin Fourth of July Parade — video by Mikey Del Rosario"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
              </div>
            </Container>
          </section>

          {/* Atmosphere */}
          <Container className="py-16 sm:py-20">
            <div className="mx-auto max-w-[680px]">
              <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
                The atmosphere
              </h2>
              <p className="mt-5 text-body-lg text-lvinit-warmgray">
                It starts early. By the time the first float rounds the corner,
                the shaded spots along the route are long gone—claimed at dawn by
                families with pop-up tents, wagons, and enough snacks to outlast
                a heat wave. There&rsquo;s a low, happy hum to it: drumlines
                warming up, fire-truck sirens, kids sprinting for candy tossed
                from passing floats.
              </p>
              <p className="mt-5 text-body-lg text-lvinit-warmgray">
                And yes, it&rsquo;s hot. This is the Mojave in July; the morning
                is already climbing by nine. But there&rsquo;s a particular kind
                of joy in a community that shows up anyway—sunscreen, folding
                chairs, flags and all.
              </p>

              {/* PHOTO SLOT — atmosphere / crowd scene. Ready to fill:
                  <figure className="my-10 sm:my-12">
                    <div className="relative aspect-[3/2] w-full overflow-hidden">
                      <Image src="/images/features/summerlin-fourth-of-july-crowd.webp"
                        alt="Families lining the Summerlin Fourth of July Parade route" fill
                        sizes="(max-width:768px) 100vw, 680px" className="object-cover" />
                    </div>
                    <figcaption className="mt-3 text-caption text-lvinit-warmgray">Caption.</figcaption>
                  </figure> */}

              <blockquote className="my-10 border-l-2 border-lvinit-blue pl-6">
                <p className="font-display italic text-subhead sm:text-heading-sm text-lvinit-black">
                  It&rsquo;s the one morning a year when the whole neighborhood
                  is outside at the same time.
                </p>
              </blockquote>
            </div>
          </Container>

          {/* Highlights */}
          <Container className="py-16 sm:py-20">
            <div className="mx-auto max-w-[680px]">
              <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
                Parade highlights
              </h2>
              <p className="mt-5 text-body-lg text-lvinit-warmgray">
                It&rsquo;s a proper community parade, which means it&rsquo;s a
                little bit of everything. A few things always get the biggest
                cheers:
              </p>
              <ul className="mt-8 space-y-6">
                {[
                  ["The floats", "From the towering patriotic star to a beloved birthday-cake float, local businesses, HOAs, and community groups go all out—hand-built and unmistakably homemade in the best way."],
                  ["Bands and drumlines", "Local school and community bands set the tempo for the whole morning. You hear them before you see them."],
                  ["First responders", "Fire trucks and police units draw some of the loudest applause on the route—a small, genuine hometown moment."],
                  ["The kids' brigade", "Scouts, dance teams, little-league squads, and a rolling wave of decorated bikes and wagons. And, of course, the candy."],
                ].map(([label, body]) => (
                  <li key={label}>
                    <p className="text-body font-medium text-lvinit-black">
                      {label}
                    </p>
                    <p className="mt-1 text-body text-lvinit-warmgray">{body}</p>
                  </li>
                ))}
              </ul>

              {/* PHOTO SLOT — birthday cake float + other parade scenes go here.
                  Same <figure> pattern as above; drop in /images/features/*.webp
                  when the photos are ready. */}
            </div>
          </Container>

          {/* Why it says something about Summerlin */}
          <section className="bg-lvinit-lightgray/40">
            <Container className="py-16 sm:py-24">
              <div className="mx-auto max-w-[680px]">
                <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
                  Why it says something about Summerlin
                </h2>
                <p className="mt-5 text-body-lg text-lvinit-warmgray">
                  Master-planned communities can read a little sterile from the
                  outside—perfect lawns, quiet streets, everything in its place.
                  The parade is the counterargument. For a few hours, Summerlin
                  stops looking like a real-estate rendering and starts looking
                  like a hometown.
                </p>
                <p className="mt-5 text-body-lg text-lvinit-warmgray">
                  It&rsquo;s put on by the Summerlin Council and run largely by
                  volunteers, built around the neighborhoods themselves. It
                  isn&rsquo;t a spectacle imported for tourists—it&rsquo;s a
                  community showing up for itself, which is a harder thing to
                  build than any amenity.
                </p>
              </div>
            </Container>
          </section>

          {/* Why events like this matter when choosing a community */}
          <Container className="py-16 sm:py-24">
            <div className="mx-auto max-w-[680px]">
              <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
                Why this matters when you&rsquo;re choosing where to live
              </h2>
              <p className="mt-5 text-body-lg text-lvinit-warmgray">
                When people ask me how to pick a neighborhood, I tell them to
                look past the square footage and the granite. What you&rsquo;re
                really buying is a set of ordinary Tuesdays—and the occasional
                Fourth of July. A tradition like this is a signal: it tells you a
                place has a real community, not just an address.
              </p>
              <p className="mt-5 text-body-lg text-lvinit-warmgray">
                If you&rsquo;re relocating to Las Vegas and weighing Summerlin,
                come stand on the curb one July morning before you sign anything.
                You&rsquo;ll learn more in two hours than in ten showings—and
                you&rsquo;ll know pretty quickly whether it feels like home.
              </p>
            </div>
          </Container>

          {/* Visitor info */}
          <section className="bg-lvinit-lightgray/40">
            <Container className="py-16 sm:py-24">
              <div className="mx-auto max-w-[680px]">
                <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
                  If you want to go
                </h2>
                <p className="mt-5 text-body-lg text-lvinit-warmgray">
                  The parade runs the morning of July 4th, in the heart of
                  Summerlin. A few things worth knowing before you go:
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    ["Go early.", "The good shade and parking disappear fast — locals stake out spots well before the start."],
                    ["Plan for the heat.", "Water, sunscreen, and a hat, minimum. It's already warm by 9am."],
                    ["It's free and family-friendly.", "Strollers, wagons, and small flags everywhere — bring the kids."],
                    ["Bring your own seating.", "There's not much natural shade or seating along the route."],
                  ].map(([label, body]) => (
                    <li key={label} className="flex gap-3">
                      <span aria-hidden="true" className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-lvinit-blue" />
                      <p className="text-body text-lvinit-warmgray">
                        <span className="font-medium text-lvinit-black">{label}</span>{" "}
                        {body}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="mt-8 text-body text-lvinit-warmgray">
                  Routes and start times shift a little year to year. For the
                  current year&rsquo;s route, timing, and road closures, check the
                  official Summerlin events calendar at{" "}
                  <a
                    href="https://www.summerlin.com/events/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lvinit-blue underline underline-offset-4"
                  >
                    summerlin.com
                  </a>
                  .
                </p>
              </div>
            </Container>
          </section>

          {/* Closing CTA */}
          <Container className="py-20 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
                Thinking about calling Summerlin home?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-body-lg text-lvinit-warmgray">
                The parade is one morning. What keeps people here is everything
                around it—the trails, the schools, the way a master-planned
                community can still feel like a neighborhood. Here&rsquo;s the
                honest guide.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <ButtonLink href="/neighborhoods/summerlin" variant="primary">
                  Explore the Summerlin guide
                </ButtonLink>
                <ButtonLink href="/contact" variant="tertiary">
                  Talk to Mikey
                </ButtonLink>
              </div>
              <p className="mt-8 text-caption text-lvinit-warmgray">
                Weighing a few areas?{" "}
                <Link
                  href="/#neighborhoods"
                  className="text-lvinit-blue underline underline-offset-4"
                >
                  Compare Las Vegas neighborhoods
                </Link>
                .
              </p>
            </div>
          </Container>
        </article>
      </main>

      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
