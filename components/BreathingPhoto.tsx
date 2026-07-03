import ImagePlaceholder from "./ui/ImagePlaceholder";

export default function BreathingPhoto({
  label,
  caption,
  src,
}: {
  label: string;
  caption: string;
  src?: string;
}) {
  return (
    <section aria-label="Photograph" className="relative min-h-[80vh]">
      <ImagePlaceholder
        src={src}
        label={label}
        aspect="aspect-auto"
        className="absolute inset-0 h-full w-full"
      />
      <p className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 max-w-sm text-body text-lvinit-black bg-lvinit-white/80 px-3 py-2">
        {caption}
      </p>
    </section>
  );
}
