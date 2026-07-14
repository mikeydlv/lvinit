import Link from "next/link";
import Container from "./ui/Container";
import { neighborhoods } from "@/lib/content";

export default function NeighborhoodDiscovery() {
  const summerlin = neighborhoods.find((n) => n.slug === "summerlin")!;
  const others = neighborhoods.filter((n) => n.slug !== "summerlin");

  return (
    <section
      id="neighborhoods"
      aria-labelledby="neighborhoods-heading"
      className="py-20 sm:py-28"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="flex items-center gap-3 text-caption uppercase tracking-wide text-lvinit-warmgray">
            <span className="h-px w-8 bg-lvinit-blue" aria-hidden="true" />
            Neighborhoods
          </p>
          <h2
            id="neighborhoods-heading"
            className="mt-6 font-display text-heading-sm sm:text-heading font-bold text-lvinit-black"
          >
            Las Vegas, one neighborhood at a time
          </h2>
          <p className="mt-4 text-body-lg text-lvinit-warmgray">
            Not a listings feed — honest, first-person guides to the places
            you&rsquo;d actually live. I&rsquo;m writing them one at a time,
            starting with the corner of the valley I know best.
          </p>
        </div>

        {/* Featured guide — Summerlin (the one page that's live) */}
        <Link
          href="/neighborhoods/summerlin"
          className="group mt-12 block border-t border-lvinit-lightgray pt-10"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-caption uppercase tracking-wide text-lvinit-blue">
                The first full guide
              </p>
              <h3 className="mt-3 font-display text-[40px] leading-[44px] sm:text-scoreboard font-black text-lvinit-black transition-colors duration-200 ease-calm group-hover:text-lvinit-blue">
                Summerlin
              </h3>
              <p className="mt-4 max-w-xl text-body-lg text-lvinit-warmgray">
                {summerlin.description} The honest version — who it fits, who it
                doesn&rsquo;t, and the parts a listing won&rsquo;t tell you.
              </p>
            </div>
            <span className="inline-flex flex-none items-center gap-2 text-body font-medium text-lvinit-blue">
              Read the Summerlin guide
              <span
                aria-hidden="true"
                className="transition-transform duration-200 ease-calm group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </div>
        </Link>

        {/* The rest of the valley — an honest editorial snapshot */}
        <div className="mt-16 border-t border-lvinit-lightgray pt-10">
          <p className="text-caption uppercase tracking-wide text-lvinit-warmgray">
            More of the valley
          </p>
          <ul className="mt-8 grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2">
            {/* North Las Vegas — a live area guide, linked here directly (kept
                out of the content.ts metrics array so it never shows fabricated
                numbers in the Compare tool). */}
            <li className="border-b border-lvinit-lightgray pb-6">
              <Link href="/neighborhoods/north-las-vegas" className="group block">
                <h4 className="font-display text-subhead font-bold text-lvinit-black transition-colors duration-200 ease-calm group-hover:text-lvinit-blue">
                  North Las Vegas
                </h4>
                <p className="mt-2 text-body text-lvinit-warmgray">
                  Its own city at the north end of the valley — established
                  streets, big master-planned communities, and brand-new desert
                  growth, all under one name.
                </p>
                <span className="mt-3 inline-flex items-center gap-2 text-body font-medium text-lvinit-blue">
                  Read the North Las Vegas guide
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-200 ease-calm group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </Link>
            </li>
            {others.map((n) => {
              // Only real, live guides are linked (Summerlin is featured above;
              // Henderson now has its own pillar). The rest stay honest text
              // snapshots until their pages exist — no dead links.
              if (n.slug === "henderson") {
                return (
                  <li
                    key={n.slug}
                    className="border-b border-lvinit-lightgray pb-6"
                  >
                    <Link href="/neighborhoods/henderson" className="group block">
                      <h4 className="font-display text-subhead font-bold text-lvinit-black transition-colors duration-200 ease-calm group-hover:text-lvinit-blue">
                        {n.name}
                      </h4>
                      <p className="mt-2 text-body text-lvinit-warmgray">
                        {n.description}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-2 text-body font-medium text-lvinit-blue">
                        Read the Henderson guide
                        <span
                          aria-hidden="true"
                          className="transition-transform duration-200 ease-calm group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              }
              return (
                <li
                  key={n.slug}
                  className="border-b border-lvinit-lightgray pb-6"
                >
                  <h4 className="font-display text-subhead font-bold text-lvinit-black">
                    {n.name}
                  </h4>
                  <p className="mt-2 text-body text-lvinit-warmgray">
                    {n.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
