type VideoPlaceholderProps = {
  label: string;
  aspect?: string;
  className?: string;
};

/** Stands in for real video per Doc 02 §9. Swap for a real player + source once produced. */
export default function VideoPlaceholder({
  label,
  aspect = "aspect-video",
  className = "",
}: VideoPlaceholderProps) {
  return (
    <div
      className={`${aspect} ${className} relative flex items-center justify-center bg-lvinit-black`}
      role="img"
      aria-label={label}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-lvinit-white/80">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 translate-x-[1px] fill-lvinit-white"
          aria-hidden="true"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      <span className="absolute bottom-3 left-3 text-caption uppercase tracking-wide text-lvinit-white/80">
        {label}
      </span>
    </div>
  );
}
