import Link from "next/link";
import type { Guide } from "@/lib/content";

/**
 * The editorial card shared by the homepage "Latest from LVINIT" feed and the
 * `/guides` library, so the two never drift apart visually.
 *
 * Image rule (Doc: CLAUDE.md → Imagery). Three states, in order of preference:
 *
 *   1. a real photograph (`imageMode` unset or "photo") — rendered with its
 *      `imageAlt`.
 *   2. a generated LVINIT editorial cover (`imageMode: "editorial-cover"`) —
 *      abstract artwork from scripts/generate-guide-cover.mjs. Rendered with an
 *      empty alt: everything the artwork says is already read out as text right
 *      beside it, and inventing descriptive alt text would only misrepresent a
 *      drawing as a scene.
 *   3. no image at all — the designed fallback panel below. Kept deliberately:
 *      a piece can always reach a feed before its cover has been generated, and
 *      the card must still look finished when it does.
 *
 * A generic stand-in photo is never any of these. All three states are
 * `aspect-[4/3]`, so an image arriving later shifts nothing.
 */
export default function GuideCard({
  guide,
  headingLevel = "h3",
}: {
  guide: Guide;
  /** Set to "h2" where the card sits directly under the page's h1. */
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  const isEditorialCover = guide.imageMode === "editorial-cover";

  return (
    <article className="flex h-full flex-col">
      <Link href={guide.href!} className="group flex h-full flex-col">
        {guide.image ? (
          <div className="aspect-[4/3] overflow-hidden bg-lvinit-lightgray">
            {/* eslint-disable-next-line @next/next/no-img-element -- matches the site's existing plain-img convention */}
            <img
              src={guide.image}
              alt={isEditorialCover ? "" : guide.imageAlt ?? ""}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          /* Decorative by design — the category and title are already read out
             as text below, so this panel is hidden from assistive tech rather
             than given invented alt text for a photo that does not exist. */
          <div
            aria-hidden="true"
            className="aspect-[4/3] flex flex-col justify-between border-t-2 border-lvinit-blue bg-lvinit-lightgray/40 p-5 sm:p-6"
          >
            <p className="text-caption uppercase tracking-wide text-lvinit-blue">
              {guide.category}
            </p>
            <p className="self-end font-sans text-body font-extrabold tracking-[0.1em]">
              <span className="text-lvinit-black">LVI</span>
              <span className="text-lvinit-gold">NIT</span>
            </p>
          </div>
        )}

        <p className="mt-4 text-caption uppercase tracking-wide text-lvinit-blue">
          {guide.category}
        </p>
        <Heading className="mt-2 font-display text-subhead font-bold text-lvinit-black transition-colors duration-200 ease-calm group-hover:text-lvinit-blue">
          {guide.title}
        </Heading>
        <p className="mt-3 text-body text-lvinit-warmgray">{guide.dek}</p>

        {/* mt-auto pins the byline + CTA to the bottom so uneven title and dek
            lengths still produce a balanced row of cards. */}
        <div className="mt-auto pt-5">
          <p className="text-caption text-lvinit-warmgray">
            {guide.byline} · {guide.date}
          </p>
          <span className="mt-3 inline-flex items-center gap-2 text-body font-medium text-lvinit-blue">
            Read guide
            <span
              aria-hidden="true"
              className="transition-transform duration-200 ease-calm group-hover:translate-x-1 motion-reduce:transition-none"
            >
              →
            </span>
          </span>
        </div>
      </Link>
    </article>
  );
}
