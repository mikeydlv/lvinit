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

        <div className="mt-12 grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-8">
          {([0, 1] as const).map((side) => {
            const neighborhood = side === 0 ? a : b;
            return (
              <div key={side} className="relative text-center sm:text-left">
                <button
                  type="button"
                  onClick={() =>
                    setOpenSelector((prev) => (prev === side ? null : side))
                  }
                  aria-expanded={openSelector === side}
                  className="font-display text-[32px] leading-[36px] sm:text-scoreboard font-black text-lvinit-black hover:text-lvinit-blue transition-colors duration-200 ease-calm text-left"
                >
                  {neighborhood.name}
                </button>

                {openSelector === side && (
                  <div className="absolute z-20 mt-2 w-64 border border-lvinit-lightgray bg-lvinit-white shadow-sm">
                    {neighborhoods.map((n, i) => (
                      <button
                        key={n.slug}
                        type="button"
                        onClick={() => selectNeighborhood(side, i)}
                        className="block w-full px-4 py-3 text-left text-body hover:bg-lvinit-lightgray/60"
                      >
                        {n.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <p className="font-display italic text-heading-sm text-lvinit-warmgray text-center">
            vs.
          </p>
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
          Ballpark figures to frame the tradeoffs — ask Mikey for today&rsquo;s
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
