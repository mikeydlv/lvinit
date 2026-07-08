import Link from "next/link";
import Container from "@/components/ui/Container";

export type RelatedStory = {
  name: string;
  /** Omit to render an honest "coming soon" card — we never ship a dead link. */
  href?: string;
  /** Small blue kicker, e.g. "Local feature". Defaults to "Story". */
  category?: string;
  dek?: string;
};

export type RelatedStoriesProps = {
  heading?: string;
  intro?: string;
  stories: RelatedStory[];
  columns?: 2 | 3;
};

/**
 * The content-cluster grid at the foot of a story. Real pages link; unbuilt ones
 * render as non-linked "In the works" cards. Flip a card to a live link the day
 * its page ships (New Page Checklist).
 */
export default function RelatedStories({
  heading = "Related Stories",
  intro,
  stories,
  columns = 3,
}: RelatedStoriesProps) {
  if (!stories || stories.length === 0) return null;

  return (
    <Container className="pb-20 sm:pb-28">
      <div className="border-t border-lvinit-lightgray pt-12">
        <h2 className="font-display text-heading-sm font-bold text-lvinit-black">
          {heading}
        </h2>
        {intro && (
          <p className="mt-4 max-w-2xl text-body text-lvinit-warmgray">{intro}</p>
        )}
        <ul
          className={`mt-10 grid grid-cols-1 gap-x-10 gap-y-8 ${
            columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
          }`}
        >
          {stories.map((story) =>
            story.href ? (
              <li key={story.name}>
                <Link
                  href={story.href}
                  className="group block border-t border-lvinit-black pt-4"
                >
                  <p className="text-caption uppercase tracking-wide text-lvinit-blue">
                    {story.category ?? "Story"}
                  </p>
                  <h3 className="mt-2 font-display text-subhead font-bold text-lvinit-black transition-colors duration-200 ease-calm group-hover:text-lvinit-blue">
                    {story.name}
                  </h3>
                  {story.dek && (
                    <p className="mt-2 text-body text-lvinit-warmgray">
                      {story.dek}
                    </p>
                  )}
                  <span className="mt-3 inline-flex items-center gap-2 text-body text-lvinit-blue">
                    Read
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 ease-calm group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ) : (
              <li key={story.name} className="border-t border-lvinit-lightgray pt-4">
                <p className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                  Coming soon
                </p>
                <h3 className="mt-2 font-display text-subhead font-bold text-lvinit-warmgray">
                  {story.name}
                </h3>
                {story.dek && (
                  <p className="mt-2 text-body text-lvinit-warmgray/80">
                    {story.dek}
                  </p>
                )}
                <span className="mt-3 inline-block text-body text-lvinit-warmgray/70">
                  In the works
                </span>
              </li>
            )
          )}
        </ul>
      </div>
    </Container>
  );
}
