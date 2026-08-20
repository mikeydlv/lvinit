import Container from "@/components/ui/Container";

export type AreaFaqItem = {
  question: string;
  /** Answer as nodes so it can carry in-context links. */
  answer: React.ReactNode;
};

export type AreaFAQProps = {
  heading: string;
  intro?: React.ReactNode;
  items: AreaFaqItem[];
  id?: string;
};

// ON FAQPage SCHEMA — deliberately not emitted.
//
// Google restricted FAQ rich results to authoritative government and health
// sites in August 2023. For a publication like LVINIT the markup would be valid
// but would produce no rich result, so shipping it means adding schema because
// it exists rather than because it does anything — which the project's SEO
// standard rules out. If that guidance changes, add a FAQPage node to
// buildStoryJsonLd in lib/story.ts (where the rest of the graph is built) and
// pass the answers through as plain strings so the schema text matches the
// visible text exactly.

/**
 * The FAQ block for an area guide. Real questions people actually search, with
 * answers we can stand behind — a question we can only answer vaguely is left
 * off rather than padded.
 *
 * Semantics: a description list, questions as <dt> with an h3 inside so the
 * outline stays h2 -> h3 and each question is still a real heading.
 */
export default function AreaFAQ({ heading, intro, items, id }: AreaFAQProps) {
  if (!items || items.length === 0) return null;

  return (
    <section id={id} aria-labelledby={`${id ?? "faq"}-heading`} className="scroll-mt-24">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[680px]">
          <h2
            id={`${id ?? "faq"}-heading`}
            className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black"
          >
            {heading}
          </h2>
          {intro && <div className="mt-5">{intro}</div>}

          <dl className="mt-10">
            {items.map((item) => (
              <div
                key={item.question}
                className="border-t border-lvinit-lightgray py-7 first:border-lvinit-black"
              >
                <dt>
                  <h3 className="font-display text-subhead font-bold text-lvinit-black">
                    {item.question}
                  </h3>
                </dt>
                <dd className="mt-3 text-body text-lvinit-warmgray">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
