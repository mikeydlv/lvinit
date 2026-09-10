"use client";

import { useEffect, useState } from "react";
import Container from "./ui/Container";
import { ButtonLink } from "./ui/Button";
import { neighborhoods } from "@/lib/content";

type MetricKey = "medianPrice" | "walkScore" | "commuteToStrip" | "schoolRating";

const maxPrice = Math.max(...neighborhoods.map((n) => n.metrics.medianPrice));
const maxCommute = Math.max(...neighborhoods.map((n) => n.metrics.commuteToStrip));

const metricConfig: Array<{
  key: MetricKey;
  label: string;
  format: (v: number) => string;
  max: number;
  /** Whether a lower value wins this metric. Price has no "winner" — kept neutral. */
  lowerIsBetter?: boolean;
  neutral?: boolean;
}> = [
  {
    key: "medianPrice",
    label: "Median Price",
    format: (v) => `$${Math.round(v / 1000)}K`,
    max: maxPrice,
    neutral: true,
  },
  {
    key: "walkScore",
    label: "Walk Score",
    format: (v) => `${v}`,
    max: 100,
  },
  {
    key: "commuteToStrip",
    label: "Commute to the Strip",
    format: (v) => `${v} min`,
    max: maxCommute,
    lowerIsBetter: true,
  },
  {
    key: "schoolRating",
    label: "School Rating",
    format: (v) => `${v.toFixed(1)} / 10`,
    max: 10,
  },
];

export default function Comparisons() {
  const [pair, setPair] = useState<[number, number]>([0, 1]);
  const [openSelector, setOpenSelector] = useState<0 | 1 | null>(null);
  const [barsReady, setBarsReady] = useState(true);

  useEffect(() => {
    setBarsReady(false);
    const t = setTimeout(() => setBarsReady(true), 60);
    return () => clearTimeout(t);
  }, [pair]);

  const a = neighborhoods[pair[0]];
  const b = neighborhoods[pair[1]];

  const selectNeighborhood = (side: 0 | 1, index: number) => {
    setPair((prev) => {
      const next: [number, number] = [...prev];
      next[side] = index;
      return next;
    });
    setOpenSelector(null);
  };

  return (
    <section
      id="compare"
      aria-labelledby="compare-heading"
      className="bg-lvinit-lightgray/60 py-16 sm:py-24"
    >
      <Container>
        <h2
          id="compare-heading"
          className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black"
        >
          Compare Any Two Neighborhoods, Honestly
        </h2>

        {/*
          The scoreboard row: name · "vs." · name.

          ORDER MATTERS. The three-column template is `1fr auto 1fr` — a
          flexible track for each name with the "vs." sized to its content in
          between — so the <p> has to sit BETWEEN the two sides in the DOM, not
          after them. It used to be rendered last, which put it in the trailing
          1fr track and read "Summerlin Henderson vs."

          BREAKPOINT. The three-across row only turns on at `lg`. Each track
          carries an auto minimum, and a single-word name at text-scoreboard
          (64px Playfair Black) cannot wrap or shrink, so the row has a hard
          floor of roughly 780px — wider than the container below 1024px. Going
          three-across any earlier pushed the whole page into horizontal
          overflow. Below `lg` the three items stack, which every name fits at
          either type size. Don't move this back to `sm` without also solving
          the 64px names.
        */}
        <div className="mt-12 grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
          <NeighborhoodPicker
            neighborhood={a}
            open={openSelector === 0}
            onToggle={() => setOpenSelector((prev) => (prev === 0 ? null : 0))}
            onSelect={(i) => selectNeighborhood(0, i)}
          />

          <p className="font-display italic text-heading-sm text-lvinit-warmgray text-center">
            vs.
          </p>

          <NeighborhoodPicker
            neighborhood={b}
            open={openSelector === 1}
            onToggle={() => setOpenSelector((prev) => (prev === 1 ? null : 1))}
            onSelect={(i) => selectNeighborhood(1, i)}
          />
        </div>

        <div className="mt-12 space-y-8">
          {metricConfig.map((metric, i) => {
            const valueA = a.metrics[metric.key];
            const valueB = b.metrics[metric.key];
            const pctA = barsReady ? Math.min((valueA / metric.max) * 100, 100) : 0;
            const pctB = barsReady ? Math.min((valueB / metric.max) * 100, 100) : 0;

            let aWins = false;
            let bWins = false;
            if (!metric.neutral) {
              if (metric.lowerIsBetter) {
                aWins = valueA < valueB;
                bWins = valueB < valueA;
              } else {
                aWins = valueA > valueB;
                bWins = valueB > valueA;
              }
            }

            const delay = { transitionDelay: `${i * 80}ms` };

            return (
              <div key={metric.key}>
                <p className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                  {metric.label}
                </p>
                <div className="mt-2 space-y-2">
                  <BarRow
                    name={a.name}
                    value={metric.format(valueA)}
                    pct={pctA}
                    winning={aWins}
                    style={delay}
                  />
                  <BarRow
                    name={b.name}
                    value={metric.format(valueB)}
                    pct={pctB}
                    winning={bWins}
                    style={delay}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-caption text-lvinit-warmgray">
          Ballpark figures to frame the tradeoffs. Ask Mikey for today&rsquo;s
          numbers.
        </p>

        <div className="mt-8">
          <ButtonLink href="#neighborhoods" variant="tertiary">
            Explore the neighborhoods
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

/**
 * One side of the scoreboard row: the neighborhood name as a button that opens
 * the picker. Extracted from an inline map so the "vs." can be rendered between
 * the two sides in DOM order (see the note on the grid above).
 *
 * Text alignment tracks the grid: centered while the row is stacked, left
 * aligned once it goes three-across at `lg`.
 */
function NeighborhoodPicker({
  neighborhood,
  open,
  onToggle,
  onSelect,
}: {
  neighborhood: (typeof neighborhoods)[number];
  open: boolean;
  onToggle: () => void;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="relative text-center lg:text-left">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        // No text-align of its own: it inherits the wrapper's, so a name that
        // wraps (e.g. "Downtown Arts District") aligns the same way as one that
        // fits on a line. With an explicit text-left here, a short name centred
        // while a long one filled the column and read left, in the same row.
        // At `lg` the wrapper is text-left, so this is unchanged on desktop.
        className="font-display text-[32px] leading-[36px] sm:text-scoreboard font-black text-lvinit-black hover:text-lvinit-blue transition-colors duration-200 ease-calm"
      >
        {neighborhood.name}
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-64 border border-lvinit-lightgray bg-lvinit-white shadow-sm">
          {neighborhoods.map((n, i) => (
            <button
              key={n.slug}
              type="button"
              onClick={() => onSelect(i)}
              className="block w-full px-4 py-3 text-left text-body hover:bg-lvinit-lightgray/60"
            >
              {n.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BarRow({
  name,
  value,
  pct,
  winning,
  style,
}: {
  name: string;
  value: string;
  pct: number;
  winning: boolean;
  style: React.CSSProperties;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-40 flex-none truncate text-body text-lvinit-black">
        {name}
      </span>
      <div className="h-2 flex-1 bg-lvinit-white overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-calm motion-reduce:transition-none ${
            winning ? "bg-lvinit-blue" : "bg-lvinit-warmgray/50"
          }`}
          style={{ width: `${pct}%`, ...style }}
        />
      </div>
      <span className="w-20 flex-none text-right text-body tabular-nums text-lvinit-black">
        {value}
      </span>
    </div>
  );
}
