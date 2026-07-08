import Container from "@/components/ui/Container";

export type StoryLedeProps = {
  /** Uppercase kicker with a short blue rule — e.g. "Summerlin · A Local Feature". */
  kicker?: string;
  /** The opening paragraph. Gets the editorial drop cap unless dropCap={false}. */
  lead: string;
  /** Optional follow-on paragraphs (links/emphasis welcome) rendered under the lede. */
  children?: React.ReactNode;
  dropCap?: boolean;
};

/**
 * The article's opening move: an optional kicker, then a lede paragraph with the
 * signature drop cap. Reading column is capped at 680px per the standard.
 */
export default function StoryLede({
  kicker,
  lead,
  children,
  dropCap = true,
}: StoryLedeProps) {
  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-[680px]">
        {kicker && (
          <p className="flex items-center gap-3 text-caption uppercase tracking-wide text-lvinit-warmgray">
            <span className="h-px w-8 bg-lvinit-blue" aria-hidden="true" />
            {kicker}
          </p>
        )}
        <p
          className={`mt-8 text-body-lg leading-[32px] text-lvinit-black ${
            dropCap
              ? "first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-[58px] first-letter:leading-[46px] first-letter:font-black first-letter:text-lvinit-black"
              : ""
          }`}
        >
          {lead}
        </p>
        {children}
      </div>
    </Container>
  );
}
