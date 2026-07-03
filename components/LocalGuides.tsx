import Container from "./ui/Container";
import ImagePlaceholder from "./ui/ImagePlaceholder";
import { ButtonLink } from "./ui/Button";
import { guides } from "@/lib/content";

export default function LocalGuides() {
  const [featured, ...rest] = guides;

  return (
    <section id="guides" aria-labelledby="guides-heading" className="py-16 sm:py-24">
      <Container>
        <h2
          id="guides-heading"
          className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black"
        >
          Local Guides
        </h2>

        <a href="#" className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 group block">
          <ImagePlaceholder
            label={`Placeholder — editorial photograph for "${featured.title}"`}
            aspect="aspect-[4/3]"
          />
          <div className="flex flex-col justify-center">
            <p className="text-caption uppercase tracking-wide text-lvinit-blue">
              {featured.category}
            </p>
            <h3 className="mt-2 font-display text-heading font-bold text-lvinit-black group-hover:text-lvinit-blue transition-colors duration-200 ease-calm">
              {featured.title}
            </h3>
            <p className="mt-4 text-body-lg text-lvinit-warmgray">
              {featured.dek}
            </p>
            {featured.pullQuote && (
              <p className="mt-4 font-display italic text-subhead text-lvinit-black">
                &ldquo;{featured.pullQuote}&rdquo;
              </p>
            )}
            <p className="mt-6 text-caption text-lvinit-warmgray">
              {featured.byline} · {featured.date}
            </p>
          </div>
        </a>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-lvinit-lightgray pt-10">
          {rest.map((guide) => (
            <a key={guide.slug} href="#" className="group block">
              <ImagePlaceholder
                label={`Placeholder — editorial photograph for "${guide.title}"`}
                aspect="aspect-[4/3]"
              />
              <p className="mt-3 text-caption uppercase tracking-wide text-lvinit-blue">
                {guide.category}
              </p>
              <h3 className="mt-1 font-display text-heading-sm font-bold text-lvinit-black group-hover:text-lvinit-blue transition-colors duration-200 ease-calm">
                {guide.title}
              </h3>
              <p className="mt-2 text-caption text-lvinit-warmgray">
                {guide.byline} · {guide.date}
              </p>
            </a>
          ))}
        </div>

        <div className="mt-12">
          <ButtonLink href="#" variant="tertiary">
            Read All Guides
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
