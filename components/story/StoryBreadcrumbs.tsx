import Link from "next/link";
import Container from "@/components/ui/Container";
import type { Breadcrumb } from "@/lib/story";

/**
 * Visible breadcrumb trail, sitting at the top of the article reading column.
 * Pairs with the BreadcrumbList JSON-LD emitted by StoryPage so the trail is
 * both human- and machine-readable. Uses the same trail array as StoryMeta.
 */
export default function StoryBreadcrumbs({ trail }: { trail: Breadcrumb[] }) {
  if (!trail || trail.length === 0) return null;

  return (
    <Container className="pt-10 sm:pt-12">
      <nav aria-label="Breadcrumb" className="mx-auto max-w-[680px]">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption uppercase tracking-wide text-lvinit-warmgray">
          {trail.map((crumb, i) => {
            const isLast = i === trail.length - 1;
            return (
              <li key={crumb.path} className="flex items-center gap-x-2">
                {isLast ? (
                  <span aria-current="page" className="text-lvinit-black">
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    href={crumb.path}
                    className="hover:text-lvinit-blue transition-colors duration-200 ease-calm"
                  >
                    {crumb.name}
                  </Link>
                )}
                {!isLast && (
                  <span aria-hidden="true" className="text-lvinit-lightgray">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </Container>
  );
}
