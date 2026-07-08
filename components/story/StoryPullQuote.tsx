import Container from "@/components/ui/Container";

export type StoryPullQuoteProps = {
  children: React.ReactNode;
  /**
   * Optional attribution — first name + neighborhood, or a name.
   * CONTENT INTEGRITY: only set this when the quote is a real, sourced line
   * someone actually said. Un-attributed editorial pull quotes are fine; a
   * fabricated attributed testimonial is not (see docs/STORY_PAGE_STANDARD.md).
   */
  cite?: string;
};

/**
 * A pull quote — Playfair italic with a Scofield-Blue rule. Self-contained
 * (own reading column), so it can sit as a top-level block between sections.
 */
export default function StoryPullQuote({ children, cite }: StoryPullQuoteProps) {
  return (
    <Container className="py-4">
      <div className="mx-auto max-w-[680px]">
        <blockquote className="my-6 border-l-2 border-lvinit-blue pl-6 sm:my-8">
          <p className="font-display italic text-subhead sm:text-heading-sm text-lvinit-black">
            {children}
          </p>
          {cite && (
            <cite className="mt-3 block text-caption uppercase not-italic tracking-wide text-lvinit-warmgray">
              — {cite}
            </cite>
          )}
        </blockquote>
      </div>
    </Container>
  );
}
