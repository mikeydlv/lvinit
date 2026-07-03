"use client";

import { useRef, useState } from "react";
import { neighborhoods } from "@/lib/content";
import ImagePlaceholder from "./ui/ImagePlaceholder";

export default function NeighborhoodJourney() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = (index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const panel = scroller.children[index] as HTMLElement | undefined;
    panel?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setActiveIndex(index);
  };

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const index = Math.round(scroller.scrollLeft / scroller.clientWidth);
    setActiveIndex(Math.min(index, neighborhoods.length - 1));
  };

  return (
    <div className="border-b border-lvinit-lightgray">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {neighborhoods.map((n) => (
          <a
            key={n.slug}
            href="#"
            className="relative flex h-[70vh] sm:h-[80vh] w-full flex-none snap-start items-end"
          >
            <ImagePlaceholder
              src={`/images/neighborhood-${n.slug}.jpg`}
              label={`Placeholder — ${n.photoDirection}`}
              aspect="aspect-auto"
              className="absolute inset-0 h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-lvinit-black/70 via-transparent to-transparent" />
            <div className="relative z-10 p-6 sm:p-16">
              <h3 className="font-display text-[40px] leading-[44px] sm:text-scoreboard font-black text-lvinit-white">
                {n.name}
              </h3>
              <p className="mt-2 text-body text-lvinit-white/85">
                <span className="text-lvinit-white font-medium">
                  {n.headlineStat.value}
                </span>{" "}
                {n.headlineStat.label}
              </p>
            </div>
          </a>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 py-6">
        {neighborhoods.map((n, i) => (
          <button
            key={n.slug}
            type="button"
            aria-label={`Go to ${n.name}`}
            onClick={() => scrollToIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ease-calm ${
              i === activeIndex ? "w-6 bg-lvinit-blue" : "w-1.5 bg-lvinit-lightgray"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
