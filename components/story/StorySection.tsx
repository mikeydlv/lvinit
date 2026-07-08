import Container from "@/components/ui/Container";

export type StorySectionProps = {
  heading?: string;
  /**
   * Simple sections: pass an array of paragraph strings and they're rendered in
   * the standard body style. For richer content (links, lists, an inline image,
   * a pull quote), pass `children` instead. If both are given, `children` wins.
   */
  paragraphs?: string[];
  children?: React.ReactNode;
  /** Wrap the section in the muted Light-Gray band — use sparingly, for a
   *  "why this matters" beat, not every section. */
  muted?: boolean;
  /** Anchor id for in-page links (adds scroll-margin so headings clear the nav). */
  id?: string;
};

/**
 * A titled editorial content section in the 680px reading column. This is the
 * workhorse block — most story bodies are a stack of these.
 */
export default function StorySection({
  heading,
  paragraphs,
  children,
  muted = false,
  id,
}: StorySectionProps) {
  const body =
    children ??
    paragraphs?.map((text, i) => (
      <p
        key={i}
        className={`text-body-lg text-lvinit-warmgray ${i > 0 ? "mt-5" : ""}`}
      >
        {text}
      </p>
    ));

  const inner = (
    <Container className={muted ? "py-16 sm:py-24" : "py-16 sm:py-20"}>
      <div className="mx-auto max-w-[680px]">
        {heading && (
          <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            {heading}
          </h2>
        )}
        <div className={heading ? "mt-5" : ""}>{body}</div>
      </div>
    </Container>
  );

  if (muted) {
    return (
      <section id={id} className="bg-lvinit-lightgray/40 scroll-mt-24">
        {inner}
      </section>
    );
  }
  return (
    <section id={id} className="scroll-mt-24">
      {inner}
    </section>
  );
}
