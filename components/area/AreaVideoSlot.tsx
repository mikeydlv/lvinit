import Container from "@/components/ui/Container";
import StoryVideo from "@/components/story/StoryVideo";

export type AreaVideoConfig = {
  /**
   * Real, published YouTube video id. Leave undefined until the video is
   * actually live — the slot then renders an honest "in production" note
   * instead of a broken player. NEVER guess an id.
   */
  youtubeId?: string;
  /** Accessible iframe title. Used only when youtubeId is set. */
  title: string;
  /** Local poster in /public/images. Enables click-to-play (no YouTube request
   *  until the visitor clicks). Only used when youtubeId is set. */
  poster?: string;
};

export type AreaVideoSlotProps = {
  heading: string;
  intro: string;
  video: AreaVideoConfig;
  /** Shown in place of the player while the video is unpublished. */
  pendingNote: React.ReactNode;
  id?: string;
};

/**
 * The video slot for an area guide.
 *
 * Publishing the video is a one-line change: set `youtubeId` in the guide's
 * data file. Until then this renders the heading, the intro, and an honest note
 * that the video is still being made — no placeholder player, no fabricated
 * URL, nothing that looks broken to a visitor.
 */
export default function AreaVideoSlot({
  heading,
  intro,
  video,
  pendingNote,
  id = "watch",
}: AreaVideoSlotProps) {
  if (video.youtubeId) {
    return (
      <StoryVideo
        id={id}
        youtubeId={video.youtubeId}
        title={video.title}
        heading={heading}
        intro={intro}
        poster={video.poster}
      />
    );
  }

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[680px] border-l-2 border-lvinit-lightgray pl-6 sm:pl-8">
          <h2
            id={`${id}-heading`}
            className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black"
          >
            {heading}
          </h2>
          <p className="mt-5 text-body-lg text-lvinit-warmgray">{intro}</p>
          <p className="mt-5 text-caption uppercase tracking-wide text-lvinit-warmgray">
            {pendingNote}
          </p>
        </div>
      </Container>
    </section>
  );
}
