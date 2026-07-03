"use client";

import Container from "./ui/Container";
import ImagePlaceholder from "./ui/ImagePlaceholder";
import { useInViewFade } from "@/lib/useInViewFade";
import type { ResidentQuote } from "@/lib/content";

export default function ResidentVoice({ quote, name, context }: ResidentQuote) {
  const { ref, isVisible } = useInViewFade<HTMLElement>();

  return (
    <section
      ref={ref}
      aria-label="A resident's perspective"
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-lvinit-black"
    >
      <ImagePlaceholder
        label="Placeholder — quiet, low-contrast lifestyle moment: soft morning light across a lived-in Las Vegas street, no one posing (kept muted so the quote reads)"
        aspect="aspect-auto"
        className="absolute inset-0 h-full w-full opacity-40 border-none"
      />
      <div className="absolute inset-0 bg-lvinit-black/50" />

      <Container
        className={`relative z-10 transition-all duration-700 ease-calm motion-reduce:transition-none motion-reduce:opacity-100 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <p className="mx-auto max-w-3xl text-center font-display italic text-[28px] leading-[34px] sm:text-[44px] sm:leading-[52px] text-lvinit-white">
          &ldquo;{quote}&rdquo;
        </p>
        <p className="mt-6 text-center text-caption uppercase tracking-wide text-lvinit-white/70">
          — {name}, {context}
        </p>
      </Container>
    </section>
  );
}
