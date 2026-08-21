import Container from "@/components/ui/Container";

export type AreaQuickFact = {
  /** Short uppercase label — e.g. "MAJOR CORRIDORS". */
  label: string;
  /**
   * One line. Keep it to a phrase; this is orientation, not a dashboard.
   *
   * Normally a plain string. Nodes are permitted for typographic control only —
   * a column that lists place names needs each name kept whole so lines break
   * between names rather than through them. Not a way to smuggle extra
   * structure, links or styling into the strip.
   */
  value: React.ReactNode;
};

export type AreaQuickFactsProps = {
  facts: AreaQuickFact[];
  /** Anchor id for in-page links. */
  id?: string;
};

/**
 * The orientation strip that sits under an area guide's hero: four or so
 * label/value pairs that tell a first-time reader where they are before the
 * essay starts.
 *
 * Deliberately NOT a stats dashboard — no numerals, no scores, no medians. Area
 * guides cover fuzzy, informally-bounded geography, so anything that looks like
 * a measured figure would be implying precision we don't have. Phrases only.
 */
export default function AreaQuickFacts({ facts, id }: AreaQuickFactsProps) {
  if (!facts || facts.length === 0) return null;

  return (
    <section
      id={id}
      aria-label="Quick orientation"
      className="border-b border-lvinit-lightgray scroll-mt-24"
    >
      <Container className="py-12 sm:py-14">
        <dl className="grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="border-t border-lvinit-black pt-4">
              <dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                {fact.label}
              </dt>
              <dd className="mt-2 text-body text-lvinit-black">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
