import Image from "next/image";
import Container from "@/components/ui/Container";

export type GalleryImage = {
  /** Root-relative path to a real, Mikey-owned photo. Never a fabricated stand-in. */
  src: string;
  /** Genuinely descriptive alt text (required). */
  alt: string;
  caption?: string;
};

export type StoryGalleryProps = {
  heading?: string;
  images: GalleryImage[];
  /**
   * 1 = stacked full-width figures (680px column); 2 = two-up grid (900px column).
   * Defaults to 1 for a single image, 2 for several.
   */
  columns?: 1 | 2;
};

/**
 * An image gallery of real photography. Figures use a consistent 3:2 crop,
 * object-cover, and Light-Gray placeholder fill while loading. Captions in the
 * caption type ramp. Every image must have descriptive alt text.
 */
export default function StoryGallery({
  heading,
  images,
  columns,
}: StoryGalleryProps) {
  if (!images || images.length === 0) return null;
  const cols = columns ?? (images.length > 1 ? 2 : 1);

  return (
    <Container className="py-12 sm:py-16">
      <div className={cols === 2 ? "mx-auto max-w-[900px]" : "mx-auto max-w-[680px]"}>
        {heading && (
          <h2 className="mb-8 font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            {heading}
          </h2>
        )}
        <div
          className={
            cols === 2
              ? "grid grid-cols-1 gap-6 sm:grid-cols-2"
              : "space-y-10"
          }
        >
          {images.map((img) => (
            <figure key={img.src}>
              <div className="relative aspect-[3/2] w-full overflow-hidden bg-lvinit-lightgray">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes={
                    cols === 2
                      ? "(max-width: 768px) 100vw, 450px"
                      : "(max-width: 768px) 100vw, 680px"
                  }
                  className="object-cover"
                />
              </div>
              {img.caption && (
                <figcaption className="mt-3 text-caption text-lvinit-warmgray">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </Container>
  );
}
