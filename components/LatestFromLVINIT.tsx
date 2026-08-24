import Link from "next/link";
import Container from "./ui/Container";
import GuideCard from "./GuideCard";
import { latestGuides } from "@/lib/content";

/**
 * "Latest from LVINIT" — the homepage editorial feed (formerly "Local Guides").
 *
 * It renders the three newest published pieces straight off the canonical
 * registry in lib/content.ts. Nothing is hard-coded: publishing a new guide
 * there rotates the oldest of the three off automatically, so this file should
 * not need editing per article.
 *
 * Keeps `id="guides"` — the "Guides" nav item and the Moving to Las Vegas
 * quick-fact links both target that anchor.
 */
export default function LatestFromLVINIT() {
  const latest = latestGuides(3);

  return (
    <section id="guides" aria-labelledby="guides-heading" className="py-16 sm:py-24">
      <Container>
        <h2
          id="guides-heading"
          className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black"
        >
          Latest from LVINIT
        </h2>
        <p className="mt-4 max-w-prose text-body-lg text-lvinit-warmgray">
          Useful guides, local updates, and things worth knowing before you buy,
          rent, or move around Las Vegas.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {latest.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>

        <div className="mt-12 border-t border-lvinit-lightgray pt-8">
          <Link
            href="/guides"
            className="group inline-flex items-center gap-2 text-body font-medium text-lvinit-blue"
          >
            View all guides
            <span
              aria-hidden="true"
              className="transition-transform duration-200 ease-calm group-hover:translate-x-1 motion-reduce:transition-none"
            >
              →
            </span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
