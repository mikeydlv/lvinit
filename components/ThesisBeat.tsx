"use client";

import Container from "./ui/Container";
import { useInViewFade } from "@/lib/useInViewFade";

export default function ThesisBeat() {
  const { ref, isVisible } = useInViewFade<HTMLElement>();

  return (
    <section
      ref={ref}
      aria-label="Our philosophy"
      className="flex min-h-[80vh] items-center justify-center bg-lvinit-white"
    >
      <Container>
        <p
          className={`mx-auto max-w-4xl text-center font-display text-[32px] leading-[38px] sm:text-thesis font-black text-lvinit-black transition-all duration-700 ease-calm motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          You&rsquo;re not choosing a neighborhood. You&rsquo;re deciding who
          you get to become.
        </p>
      </Container>
    </section>
  );
}
