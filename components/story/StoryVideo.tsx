import Container from "@/components/ui/Container";

export type StoryVideoProps = {
  /** YouTube video id only (not a full URL). Embedded via youtube-nocookie. */
  youtubeId: string;
  /** Accessible iframe title — describe the clip, credit the creator. */
  title: string;
  heading?: string;
  intro?: string;
  /** Anchor id so a hero CTA can jump here. Default "watch". */
  id?: string;
};

/**
 * Optional privacy-friendly YouTube embed (youtube-nocookie, lazy-loaded), in a
 * slightly wider 900px column so the 16:9 frame breathes. No autoplay, ever.
 */
export default function StoryVideo({
  youtubeId,
  title,
  heading = "See it for yourself",
  intro,
  id = "watch",
}: StoryVideoProps) {
  return (
    <section id={id} aria-label={heading} className="scroll-mt-24">
      <Container className="py-8">
        <div className="mx-auto max-w-[900px]">
          {heading && (
            <h2 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
              {heading}
            </h2>
          )}
          {intro && (
            <p className="mt-3 max-w-[680px] text-body text-lvinit-warmgray">
              {intro}
            </p>
          )}
          <div className="relative mt-8 aspect-video w-full overflow-hidden border border-lvinit-lightgray bg-lvinit-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
              title={title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
