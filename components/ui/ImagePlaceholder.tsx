type ImagePlaceholderProps = {
  label: string;
  aspect?: string; // Tailwind aspect-ratio class, e.g. "aspect-[4/5]"
  className?: string;
};

/**
 * Stands in for real photography per Doc 02 §8. Replace the parent element's
 * children with a real <img> / next/image once photography is produced —
 * every usage is labeled so it's obvious what shot is needed where.
 */
export default function ImagePlaceholder({
  label,
  aspect = "aspect-[4/5]",
  className = "",
}: ImagePlaceholderProps) {
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
