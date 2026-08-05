import Link from "next/link";
import Container from "./ui/Container";
import ImagePlaceholder from "./ui/ImagePlaceholder";
import { guides } from "@/lib/content";

export default function LocalGuides() {
  // Two placeholder guide cards follow the real Four Seasons feature card below,
  // keeping the row at three without shipping an extra dead placeholder.
  const rest = guides.slice(1, 3);

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
              A local look at one of Summerlin&rsquo;s favorite traditions — and
              what it says about living here.
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
          {/* $500K buyer guide — real, linked story (video companion). Card image
              reuses the article's existing local video poster. */}
          <Link
            href="/guides/what-500k-buys-in-las-vegas"
            className="group block"
          >
            <ImagePlaceholder
              src="/images/video-what-500k-gets-you-in-las-vegas.jpg"
              label="What $500K Buys in Las Vegas"
              aspect="aspect-[4/3]"
            />
            <p className="mt-3 text-caption uppercase tracking-wide text-lvinit-blue">
              Buyer Guide
            </p>
            <h3 className="mt-1 font-display text-heading-sm font-bold text-lvinit-black transition-colors duration-200 ease-calm group-hover:text-lvinit-blue">
              What $500K Buys in Las Vegas
            </h3>
            <p className="mt-2 text-caption text-lvinit-warmgray">
              Three real home tours showing how different the options can be at
              roughly the same budget.
            </p>
          </Link>

          {/* Four Seasons feature — real, linked story. TEMPORARY card image:
              the video-thumbnail art (has baked-in title text + unverified "$5B"
              claim); approved by Mikey as a stand-in. Swap for a clean drone
              still when one lands. */}
          <Link
            href="/neighborhoods/henderson/four-seasons-private-residences"
            className="group block"
          >
            <ImagePlaceholder
              src="/images/features/four-seasons-private-residences.webp"
              label="Four Seasons Private Residences construction site in MacDonald Highlands"
              aspect="aspect-[4/3]"
            />
            <p className="mt-3 text-caption uppercase tracking-wide text-lvinit-blue">
              Local Feature
            </p>
            <h3 className="mt-1 font-display text-heading-sm font-bold text-lvinit-black transition-colors duration-200 ease-calm group-hover:text-lvinit-blue">
              Four Seasons Private Residences
            </h3>
            <p className="mt-2 text-caption text-lvinit-warmgray">
              Henderson · MacDonald Highlands
            </p>
          </Link>

          {rest.map((guide) =>
            // Guides with a real published destination link out; the rest stay
            // display-only placeholders (no dead links).
            guide.href ? (
              <Link key={guide.slug} href={guide.href} className="group block">
                <ImagePlaceholder
                  src={guide.image ?? `/images/guide-${guide.slug}.jpg`}
                  label={guide.title}
                  aspect="aspect-[4/3]"
                />
                <p className="mt-3 text-caption uppercase tracking-wide text-lvinit-blue">
                  {guide.category}
                </p>
                <h3 className="mt-1 font-display text-heading-sm font-bold text-lvinit-black transition-colors duration-200 ease-calm group-hover:text-lvinit-blue">
                  {guide.title}
                </h3>
                <p className="mt-2 text-caption text-lvinit-warmgray">
                  {guide.byline} · {guide.date}
                </p>
              </Link>
            ) : (
              <article key={guide.slug}>
                <ImagePlaceholder
                  src={guide.image ?? `/images/guide-${guide.slug}.jpg`}
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
            )
          )}
        </div>
      </Container>
    </section>
  );
}
