"use client";

import { useState } from "react";
import { filterChips, neighborhoods, type Neighborhood } from "@/lib/content";
import ImagePlaceholder from "./ui/ImagePlaceholder";
import { ButtonLink } from "./ui/Button";

export default function NeighborhoodGrid() {
  const [active, setActive] = useState<Set<Neighborhood["tags"][number]>>(
    new Set()
  );

  const toggle = (value: Neighborhood["tags"][number]) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const visible =
    active.size === 0
      ? neighborhoods
      : neighborhoods.filter((n) => n.tags.some((t) => active.has(t)));

  return (
    <div className="py-16 sm:py-24">
      <div className="flex flex-wrap gap-3">
        {filterChips.map((chip) => {
          const isActive = active.has(chip.value);
          return (
            <button
              key={chip.value}
              type="button"
              onClick={() => toggle(chip.value)}
              aria-pressed={isActive}
              className={`rounded-full border px-4 py-2 text-caption uppercase tracking-wide transition-colors duration-200 ease-calm ${
                isActive
                  ? "border-lvinit-blue bg-lvinit-blue text-lvinit-white"
                  : "border-lvinit-lightgray text-lvinit-warmgray hover:border-lvinit-blue hover:text-lvinit-blue"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((n) => (
          <a key={n.slug} href="#" className="group block">
            <ImagePlaceholder
              label={`Placeholder — ${n.photoDirection} (portrait crop)`}
              aspect="aspect-[4/5]"
              className="transition-opacity duration-300 ease-calm group-hover:opacity-90"
            />
            <h3 className="mt-4 font-display text-heading-sm font-bold text-lvinit-black">
              {n.name}
            </h3>
            <p className="mt-1 text-body text-lvinit-warmgray">
              {n.description}
            </p>
            <p className="mt-3 text-caption uppercase tracking-wide text-lvinit-warmgray tabular-nums">
              {n.headlineStat.value} {n.headlineStat.label}
            </p>
          </a>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-10 text-body text-lvinit-warmgray">
          No neighborhoods match every filter yet — try removing one.
        </p>
      )}

      <div className="mt-12">
        <ButtonLink href="#" variant="tertiary">
          View All Neighborhoods
        </ButtonLink>
      </div>
    </div>
  );
}
