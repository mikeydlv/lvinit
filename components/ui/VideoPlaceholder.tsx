type VideoPlaceholderProps = {
  label: string;
  /**
   * Local poster asset in /public/images (e.g. "/images/video-affordability.svg").
   * Swap the file — or this path — for a real thumbnail/player when ready.
   */
  src?: string;
  aspect?: string;
  className?: string;
};

/** Stands in for real video per Doc 02 §9. With `src`, shows a local poster
 * image behind the play button; without it, the plain black block. Swap for a
 * real player + source once produced. */
export default function VideoPlaceholder({
  label,
  src,
  aspect = "aspect-video",
  className = "",
}: VideoPlaceholderProps) {
  return (
    <div
      className={`${aspect} ${className} relative flex items-center justify-center overflow-hidden bg-lvinit-black`}
      role="img"
      aria-label={label}
    >
      {src && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- placeholder poster asset, swapped for real thumbnail later */}
          <img src={src} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-lvinit-black/30" />
        </>
      )}
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-lvinit-white/80 bg-lvinit-black/20">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 translate-x-[1px] fill-lvinit-white"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      {!src && (
        <span className="absolute bottom-3 left-3 text-caption uppercase tracking-wide text-lvinit-white/80">
          {label}
        </span>
      )}
    </div>
  );
}
