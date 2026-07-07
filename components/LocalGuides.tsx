import Link from "next/link";
import Container from "./ui/Container";
import ImagePlaceholder from "./ui/ImagePlaceholder";
import { guides } from "@/lib/content";

export default function LocalGuides() {
  const rest = guides.slice(1);

  return (
    <section id="guides" aria-labelledby="guides-heading" className="py-16 sm:py-24">
      <Container>
        <h2
          id="guides-heading"
          className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black"
        >
          Local Guides
        </h2>

        {/* Featured: our first real published feature (links to the article) */}
        <Link
          href="/neighborhoods/summerlin/fourth-of-july-parade"
          className="group mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <ImagePlaceholder
            src="/images/features/summerlin-fourth-of-july-parade-banner.webp"
            label="Summerlin Fourth of July Parade"
            aspect="aspect-[4/3]"
          />
          <div className="flex flex-col justify-center">
            <p className="text-caption uppercase tracking-wide text-lvinit-blue">
              Local Feature
            </p>
            <h3 className="mt-2 font-display text-heading font-bold text-lvinit-black transition-colors duration-200 ease-calm group-hover:text-lvinit-blue">
              Summerlin Fourth of July Parade
            </h3>
            <p className="mt-4 text-body-lg text-lvinit-warmgray">
              One of Las Vegas&rsquo; most beloved Independence Day traditions —
              and a window into what living in Summerlin actually feels like.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-body font-medium text-lvinit-blue">
              Read the feature
              <span
                aria-hidden="true"
                className="transition-transform duration-200 ease-calm group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </div>
        </Link>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-lvinit-lightgray pt-10">
          {rest.map((guide) => (
            <article key={guide.slug}>
              <ImagePlaceholder
                src={`/images/guide-${guide.slug}.jpg`}
                label={guide.title}
                aspect="aspect-[4/3]"
              />
              <p className="mt-3 text-caption uppercase tracking-wide text-lvinit-blue">
                {guide.category}
              </p>
              <h3 className="mt-1 font-display text-heading-sm font-bold text-lvinit-black">
                {guide.title}
              </h3>
              <p className="mt-2 text-caption text-lvinit-warmgray">
                {guide.byline} · {guide.date}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
