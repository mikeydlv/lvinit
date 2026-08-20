import Link from "next/link";
import Container from "@/components/ui/Container";

export type AreaCommunity = {
  name: string;
  /** Root-relative link to the community's own guide. OMIT until that page
   *  actually exists — an unlinked entry is correct, a dead link never is. */
  href?: string;
  /** Where it sits, in plain cross-streets. */
  where: string;
  /** One or two sentences on what it is. */
  summary: string;
  /** What the housing stock is actually like. */
  housing: string;
  /** The thing that separates it from its neighbors. */
  distinct: string;
  /**
   * Who might want to look here — framed by housing and location only.
   * FAIR HOUSING: never by household type, age, income, or any protected
   * class. "Newer housing near the far southwest edge", not "great for
   * families".
   */
  worthExploring: string;
};

export type AreaCommunitiesProps = {
  heading: string;
  intro?: React.ReactNode;
  communities: AreaCommunity[];
  /** Shown under the grid — e.g. that individual guides are still being written. */
  footnote?: React.ReactNode;
  id?: string;
};

/**
 * The communities roster for an area guide. Editorial entries under a hairline
 * rule rather than heavy cards — the guide is a publication, not a directory.
 *
 * Each entry is authored to become its own child page later
 * (/neighborhoods/southwest-las-vegas/mountains-edge and so on). Adding `href`
 * to the data is the only change needed the day one ships; until then the entry
 * renders as plain text with no link, so the page never carries a dead one.
 */
export default function AreaCommunities({
  heading,
  intro,
  communities,
  footnote,
  id,
}: AreaCommunitiesProps) {
  if (!communities || communities.length === 0) return null;

  return (
    <section id={id} aria-labelledby={`${id ?? "communities"}-heading`} className="scroll-mt-24">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2
            id={`${id ?? "communities"}-heading`}
            className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black"
          >
            {heading}
          </h2>
          {intro && <div className="mt-5 max-w-[680px]">{intro}</div>}

          <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-12 sm:grid-cols-2">
            {communities.map((community) => (
              <article
                key={community.name}
                className="border-t border-lvinit-black pt-5"
              >
                <h3 className="font-display text-subhead font-bold text-lvinit-black">
                  {community.href ? (
                    <Link
                      href={community.href}
                      className="transition-colors duration-200 ease-calm hover:text-lvinit-blue"
                    >
                      {community.name}
                    </Link>
                  ) : (
                    community.name
                  )}
                </h3>
                <p className="mt-2 text-caption uppercase tracking-wide text-lvinit-warmgray">
                  {community.where}
                </p>
                <p className="mt-4 text-body text-lvinit-warmgray">
                  {community.summary}
                </p>

                <dl className="mt-5 space-y-3">
                  <div>
                    <dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                      Housing
                    </dt>
                    <dd className="mt-1 text-body text-lvinit-black">
                      {community.housing}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                      What makes it different
                    </dt>
                    <dd className="mt-1 text-body text-lvinit-black">
                      {community.distinct}
                    </dd>
                  </div>
                </dl>

                <p className="mt-5 border-l-2 border-lvinit-lightgray pl-4 text-body text-lvinit-warmgray">
                  {community.worthExploring}
                </p>
              </article>
            ))}
          </div>

          {footnote && (
            <p className="mt-12 max-w-[680px] text-caption text-lvinit-warmgray">
              {footnote}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
