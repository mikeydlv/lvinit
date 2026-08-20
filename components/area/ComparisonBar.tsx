import Container from "@/components/ui/Container";

export type ComparisonRow = {
  /** The dimension, phrased as a claim someone could check. */
  dimension: string;
  /** Which side it leans to. Must match one of the two side labels, or "Both". */
  leans: string;
  /** Optional one-line "why" — what actually causes the difference. */
  because?: string;
};

export type ComparisonBarProps = {
  heading: string;
  /** The two things being compared, left and right. */
  sides: [string, string];
  intro?: React.ReactNode;
  rows: ComparisonRow[];
  footnote?: React.ReactNode;
  id?: string;
};

/**
 * COMPARISON BAR — a head-to-head that names which way each dimension leans
 * without inventing a number to justify it.
 *
 * Explicitly NOT the homepage Compare tool (components/Comparisons.tsx), which
 * draws proportional bars from median price / walk score / commute / school
 * figures. Those figures don't exist for informally-bounded areas like
 * Southwest, so a scored comparison here would be fabricated precision. This
 * renders qualitative leanings only — no 1-10 ratings, no bars, no winner
 * tally.
 */
export default function ComparisonBar({
  heading,
  sides,
  intro,
  rows,
  footnote,
  id,
}: ComparisonBarProps) {
  if (!rows || rows.length === 0) return null;

  return (
    <section id={id} aria-labelledby={`${id ?? "comparison"}-heading`} className="scroll-mt-24">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2
            id={`${id ?? "comparison"}-heading`}
            className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black"
          >
            {heading}
          </h2>
          {intro && <div className="mt-5 max-w-[680px]">{intro}</div>}

          {/*
            A description list rather than a <table>. The content is only two
            columns wide, and a real table forces a ~200px text column on a
            phone, which wraps every dimension into a tall block. A <dl> gives
            the same semantics people actually need here and restacks cleanly:
            side-by-side from `sm` up, label-above-value below it. Toggling
            `display` on <table> elements would have kept the desktop look but
            stripped the table semantics on mobile, which is worse than not
            using a table at all.
          */}
          <div
            aria-hidden="true"
            className="mt-12 hidden border-b border-lvinit-black pb-3 sm:grid sm:grid-cols-[1fr_180px] sm:gap-8"
          >
            <p className="text-caption uppercase tracking-wide text-lvinit-warmgray">
              What you&rsquo;re comparing
            </p>
            <p className="text-caption uppercase tracking-wide text-lvinit-warmgray">
              Leans toward
            </p>
          </div>

          <dl
            aria-label={`How ${sides[0]} and ${sides[1]} differ, dimension by dimension`}
            className="border-t border-lvinit-black sm:border-t-0"
          >
            {rows.map((row) => (
              <div
                key={row.dimension}
                className="grid grid-cols-1 gap-1 border-b border-lvinit-lightgray py-6 sm:grid-cols-[1fr_180px] sm:gap-8"
              >
                <dt className="text-body text-lvinit-black">
                  {row.dimension}
                  {row.because && (
                    <span className="mt-1 block text-body text-lvinit-warmgray">
                      {row.because}
                    </span>
                  )}
                </dt>
                <dd className="mt-2 text-body font-medium text-lvinit-blue sm:mt-0">
                  <span className="mr-2 text-caption uppercase tracking-wide text-lvinit-warmgray sm:hidden">
                    Leans toward
                  </span>
                  {row.leans}
                </dd>
              </div>
            ))}
          </dl>

          {footnote && (
            <p className="mt-8 max-w-[680px] text-caption text-lvinit-warmgray">
              {footnote}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
