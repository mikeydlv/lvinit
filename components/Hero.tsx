import Image from "next/image";
import Container from "./ui/Container";
import { ButtonLink } from "./ui/Button";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-lvinit-white">
      {/* Subtle warm-gray wash keeps the white bright, not clinical */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-lvinit-lightgray/40 via-lvinit-white to-lvinit-white"
      />

      <Container className="relative z-10 grid grid-cols-1 items-center gap-14 pb-24 pt-32 sm:pt-40 lg:grid-cols-12 lg:gap-20 lg:pb-32">
        {/* Editorial text column */}
        <div className="lg:col-span-6 xl:col-span-5">
          <p className="flex items-center gap-3 text-caption uppercase tracking-wide text-lvinit-warmgray">
            <span className="h-px w-8 bg-lvinit-blue" aria-hidden="true" />
            Las Vegas · A Local&apos;s Guide
          </p>

          <h1 className="mt-6 font-display text-[40px] leading-[44px] font-black text-lvinit-black sm:text-display sm:leading-[88px]">
            Find Where You Belong.
          </h1>

          <p className="mt-6 max-w-lg text-body-lg text-lvinit-warmgray">
            Neighborhood guides, honest comparisons, and a local you can
            actually trust — for anyone deciding where in Las Vegas to build
            a life.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink href="#neighborhoods" variant="primary">
              Explore Neighborhoods
            </ButtonLink>
            <ButtonLink href="#videos" variant="tertiary">
              Watch the guide
            </ButtonLink>
          </div>
        </div>

        {/* Luxury lifestyle photography column */}
        <div className="lg:col-span-6 xl:col-span-7">
          <figure className="relative">
            {/* Warm-gray panel offset behind the image for editorial depth */}
            <div
              aria-hidden="true"
              className="absolute -bottom-6 -right-6 hidden h-full w-full bg-lvinit-lightgray/50 lg:block"
            />
            <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[3/4] lg:aspect-[4/5]">
              <Image
                src="/images/hero/summerlin-drone-overlook-golden-hour.webp"
                alt="Aerial view of a Las Vegas hillside neighborhood at golden hour — homes and a green golf course below the desert mountains"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
              {/* Soft dark gradient on the left edge only, kept subtle so the
                  photo stays natural while anchoring it toward the headline. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-transparent"
              />
            </div>
            <figcaption className="relative mt-4 text-caption uppercase tracking-wide text-lvinit-warmgray">
              Summerlin — the quiet hour before the heat
            </figcaption>
          </figure>
        </div>
      </Container>
    </section>
  );
}
