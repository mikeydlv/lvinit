import Container from "@/components/ui/Container";

export type AreaSource = {
  label: string;
  url: string;
  /** What this source was actually used for on the page. */
  used: string;
};

export type AreaSourcesProps = {
  heading?: string;
  /** When the facts on the page were last checked. Real date only. */
  checked: string;
  intro?: React.ReactNode;
  sources: AreaSource[];
  id?: string;
};

/**
 * SOURCES & UPDATES — a quiet, collapsed record of where the page's factual
 * claims came from and when they were last checked.
 *
 * Kept as a <details> so it adds credibility without putting an academic
 * bibliography in the middle of an editorial page. Inline citations stay in the
 * body where they matter; this is the audit trail for the rest.
 */
export default function AreaSources({
  heading = "Sources & updates",
  checked,
  intro,
  sources,
  id,
}: AreaSourcesProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <section id={id} className="scroll-mt-24">
      <Container className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-[680px] border-t border-lvinit-lightgray pt-8">
          <details className="group">
            <summary className="cursor-pointer list-none text-caption uppercase tracking-wide text-lvinit-warmgray transition-colors duration-200 ease-calm hover:text-lvinit-blue">
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 ease-calm group-open:rotate-90"
                >
                  &rsaquo;
                </span>
                {heading} &middot; {checked}
              </span>
            </summary>

            <div className="mt-6">
              {intro && (
                <div className="mb-6 text-caption text-lvinit-warmgray">
                  {intro}
                </div>
              )}
              <ul className="space-y-4">
                {sources.map((source) => (
                  <li key={source.url} className="text-caption text-lvinit-warmgray">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
                    >
                      {source.label}
                    </a>
                    <span className="block">{source.used}</span>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      </Container>
    </section>
  );
}
