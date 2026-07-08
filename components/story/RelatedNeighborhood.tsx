import Link from "next/link";
import Container from "@/components/ui/Container";

export type RelatedNeighborhoodProps = {
  /** The neighborhood name, e.g. "Summerlin". */
  name: string;
  /** The guide it links to, e.g. "/neighborhoods/summerlin". Real pages only. */
  href: string;
  /** Small blue kicker. Defaults to "Related neighborhood". */
  kicker?: string;
  blurb?: string;
  /** Link label. Defaults to "Explore {name}". */
  linkLabel?: string;
  /** Headline. Defaults to "Read the {name} guide". */
  heading?: string;
};

/**
 * A single card tying a story back up to its parent neighborhood guide — the
 * "up" link that keeps each content cluster connected.
 */
export default function RelatedNeighborhood({
  name,
  href,
  kicker = "Related neighborhood",
  blurb,
  linkLabel,
  heading,
}: RelatedNeighborhoodProps) {
  return (
    <Container className="pb-20 sm:pb-28">
      <Link
        href={href}
        className="group block border-t border-lvinit-lightgray pt-12"
      >
        <p className="text-caption uppercase tracking-wide text-lvinit-blue">
          {kicker}
        </p>
        <h2 className="mt-3 font-display text-heading-sm font-bold text-lvinit-black transition-colors duration-200 ease-calm group-hover:text-lvinit-blue">
          {heading ?? `Read the ${name} guide`}
        </h2>
        {blurb && (
          <p className="mt-3 max-w-xl text-body text-lvinit-warmgray">{blurb}</p>
        )}
        <span className="mt-5 inline-flex items-center gap-2 text-body font-medium text-lvinit-blue">
          {linkLabel ?? `Explore ${name}`}
          <span
            aria-hidden="true"
            className="transition-transform duration-200 ease-calm group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </Link>
    </Container>
  );
}
