import Image from "next/image";
import Container from "./ui/Container";
import { ButtonLink } from "./ui/Button";

// Hero background photo. If this file isn't present yet, upload it to
// public/images/hero/ (keep the name) — the layout already points at it.
// TODO(real-photo): swap for the final approved hero image if this changes.
const HERO_IMAGE = "/images/hero/summerlin-drone-overlook-golden-hour.webp";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-lvinit-white">
      {/* Full-bleed landscape background photo */}
      <Image
        src={HERO_IMAGE}
        alt="Aerial view of a Las Vegas hillside neighborhood at golden hour — homes and a green golf course below the desert mountains"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Airy cream wash keeps the photo subtle (~35–45% visible), never dark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-lvinit-white/45"
      />
      {/* Softer white gradient behind the text — lets a bit more photo show
          through the copy while keeping the headline easy to read */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-lvinit-white/85 via-lvinit-white/70 to-transparent"
      />
      {/* Whisper-warm tint at the base so the bright white stays inviting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-lvinit-lightgray/30 to-transparent"
      />

      <Container className="relative z-10 pb-24 pt-32 sm:pt-40 lg:pb-32">
        <div className="max-w-xl">
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
      </Container>
    </section>
  );
}
