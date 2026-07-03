type ImagePlaceholderProps = {
  label: string;
  /**
   * Local placeholder asset in /public/images (e.g. "/images/hero-las-vegas-lifestyle.svg").
   * Swap the file — or this path — for real photography when it's ready.
   * When omitted, the original labeled gray placeholder is shown.
   */
  src?: string;
  aspect?: string; // Tailwind aspect-ratio class, e.g. "aspect-[4/5]"
  className?: string;
};

/**
 * Stands in for real photography per Doc 02 §8. With `src`, renders a local
 * placeholder image (object-cover) so the layout looks finished; without it,
 * falls back to the labeled gray box. Replace the /public/images asset (keep
 * the filename) with a real photo to go live.
 */
export default function ImagePlaceholder({
  label,
  src,
  aspect = "aspect-[4/5]",
  className = "",
}: ImagePlaceholderProps) {
  if (src) {
    return (
      <div
        className={`${aspect} ${className} overflow-hidden bg-lvinit-lightgray`}
        role="img"
        aria-label={label}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- placeholder SVG asset, swapped for real photography later */}
        <img src={src} alt="" aria-hidden="true" className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`${aspect} ${className} flex items-end bg-gradient-to-br from-lvinit-lightgray to-lvinit-warmgray/30 border border-lvinit-lightgray`}
      role="img"
      aria-label={label}
    >
      <span className="p-3 text-caption uppercase tracking-wide text-lvinit-warmgray bg-lvinit-white/70">
        {label}
      </span>
    </div>
  );
}
