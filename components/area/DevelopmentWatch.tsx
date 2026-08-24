import Container from "@/components/ui/Container";

/**
 * The only three states a project is allowed to be in.
 *
 * "Coming soon" is not a status. Neither is "in the works". If we can't verify
 * which of these three a project is actually in, it doesn't go on the page.
 */
export type ProjectStatus = "open" | "under-construction" | "planned";

export type DevelopmentProject = {
  name: string;
  status: ProjectStatus;
  /** Cross-streets or corridor. */
  where: string;
  /** What it is and what it changes about the area. Plain language. */
  what: string;
  /**
   * Where the status came from. Required — an unsourced status claim is the
   * exact failure mode this section exists to avoid.
   */
  source: { label: string; url: string };
  /** Optional honest caveat: conflicting figures, no start date given, etc. */
  caveat?: string;
};

export type DevelopmentWatchProps = {
  heading: string;
  /** e.g. "Updated August 2026" — shown as a visible label, not just metadata. */
  updated: string;
  intro?: React.ReactNode;
  projects: DevelopmentProject[];
  footnote?: React.ReactNode;
  id?: string;
};

const GROUPS: Array<{ status: ProjectStatus; label: string; blurb: string }> = [
  {
    status: "open",
    label: "Open now",
    blurb: "Built, operating, and something you can go stand in today.",
  },
  {
    status: "under-construction",
    label: "Under construction",
    blurb: "Ground has actually been broken. Dates still move.",
  },
  {
    status: "planned",
    label: "Planned or proposed",
    blurb:
      "Announced, approved, or designed, but not built. Treat renderings accordingly.",
  },
];

const STATUS_STYLE: Record<ProjectStatus, string> = {
  open: "border-lvinit-blue text-lvinit-blue",
  "under-construction": "border-lvinit-black text-lvinit-black",
  planned: "border-lvinit-warmgray/50 text-lvinit-warmgray",
};

const STATUS_LABEL: Record<ProjectStatus, string> = {
  open: "Open",
  "under-construction": "Under construction",
  planned: "Planned",
};

/**
 * DEVELOPMENT WATCH — the standing "what's actually changing here" section.
 *
 * Content lives in a data array so this can be updated by editing a list of
 * objects, not by rewriting markup. Each entry carries its own source link and
 * is grouped strictly by verified status, which is the whole point: the common
 * failure on competitor pages is a proposed project described as if it were
 * being built.
 */
export default function DevelopmentWatch({
  heading,
  updated,
  intro,
  projects,
  footnote,
  id,
}: DevelopmentWatchProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <section
      id={id}
      aria-labelledby={`${id ?? "development-watch"}-heading`}
      className="bg-lvinit-lightgray/40 scroll-mt-24"
    >
      <Container className="py-16 sm:py-24">
        <div className="mx-auto max-w-[900px]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
            <h2
              id={`${id ?? "development-watch"}-heading`}
              className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black"
            >
              {heading}
            </h2>
            <p className="flex-none text-caption uppercase tracking-wide text-lvinit-warmgray">
              {updated}
            </p>
          </div>
          {intro && <div className="mt-5 max-w-[680px]">{intro}</div>}

          <div className="mt-12 space-y-14">
            {GROUPS.map((group) => {
              const items = projects.filter((p) => p.status === group.status);
              if (items.length === 0) return null;

              return (
                <div key={group.status}>
                  <h3 className="font-display text-subhead font-bold text-lvinit-black">
                    {group.label}
                  </h3>
                  <p className="mt-1 text-body text-lvinit-warmgray">
                    {group.blurb}
                  </p>

                  <ul className="mt-8 space-y-8">
                    {items.map((project) => (
                      <li
                        key={project.name}
                        className="border-t border-lvinit-lightgray pt-5"
                      >
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          <h4 className="text-body-lg font-medium text-lvinit-black">
                            {project.name}
                          </h4>
                          <span
                            className={`border px-2 py-[3px] text-caption uppercase tracking-wide ${
                              STATUS_STYLE[project.status]
                            }`}
                          >
                            {STATUS_LABEL[project.status]}
                          </span>
                        </div>
                        <p className="mt-2 text-caption uppercase tracking-wide text-lvinit-warmgray">
                          {project.where}
                        </p>
                        <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
                          {project.what}
                        </p>
                        {project.caveat && (
                          <p className="mt-2 max-w-[680px] text-body italic text-lvinit-warmgray">
                            {project.caveat}
                          </p>
                        )}
                        <p className="mt-3 text-caption text-lvinit-warmgray">
                          Status via{" "}
                          <a
                            href={project.source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lvinit-blue underline underline-offset-4 decoration-transparent hover:decoration-lvinit-blue"
                          >
                            {project.source.label}
                          </a>
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {footnote && (
            <p className="mt-14 max-w-[680px] text-caption text-lvinit-warmgray">
              {footnote}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
