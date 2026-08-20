import Container from "@/components/ui/Container";

export type LocalsNoteProps = {
  /** The body — one or more paragraphs. First one carries the emphasis. */
  children: React.ReactNode;
  /** Override the label. Almost never needed. */
  label?: string;
  /** Wrap in the muted Light-Gray band. On by default — it's a pause beat. */
  muted?: boolean;
  id?: string;
};

/**
 * THE LOCAL'S NOTE — the LVINIT signature callout (Doc 02 §21).
 *
 * Extracted verbatim from the treatment already shipped on the North Las Vegas
 * and Southwest Las Vegas guides (Playfair-italic blue label, left blue rule,
 * muted band) so every area guide renders it identically instead of each page
 * hand-rolling the markup. The visual result is unchanged from those pages.
 *
 * This is Mikey talking directly — first person, the thing he'd say in the car.
 * Not a summary of the section above it.
 */
export default function LocalsNote({
  children,
  label = "The Local's Note",
  muted = true,
  id,
}: LocalsNoteProps) {
  const inner = (
    <Container className={muted ? "py-16 sm:py-24" : "py-16 sm:py-20"}>
      <aside className="mx-auto max-w-3xl border-l-2 border-lvinit-blue pl-6 sm:pl-8">
        <p className="font-display italic text-subhead text-lvinit-blue">
          {label}
        </p>
        <div className="mt-4">{children}</div>
      </aside>
    </Container>
  );

  return (
    <section
      id={id}
      className={`scroll-mt-24 ${muted ? "bg-lvinit-lightgray/40" : ""}`}
    >
      {inner}
    </section>
  );
}
