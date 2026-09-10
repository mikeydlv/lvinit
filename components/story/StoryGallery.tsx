import Image from "next/image";
import Container from "@/components/ui/Container";

export type GalleryImage = {
  /** Root-relative path to a real, Mikey-owned photo. Never a fabricated stand-in. */
  src: string;
  /** Genuinely descriptive alt text (required). */
  alt: string;
  /**
   * Optional uppercase kicker above the caption — used when a figure stands for
   * something the reader needs named, e.g. the area a comparison frame
   * represents. Omit for ordinary figures and nothing renders.
   */
  label?: string;
  caption?: string;
};

export type StoryGalleryProps = {
  heading?: string;
  images: GalleryImage[];
  /**
   * 1 = stacked full-width figures (680px column); 2 = two-up grid (900px
   * column); 3 = three-up comparison row (1100px column), for a set where the
   * figures are meant to be read against each other.
   *
   * Defaults to 1 for a single image, 2 for several — unchanged, so every
   * existing gallery renders exactly as before.
   */
  columns?: 1 | 2 | 3;
};

const COLUMN_STYLES = {
  1: {
    width: "mx-auto max-w-[680px]",
    grid: "space-y-10",
    sizes: "(max-width: 768px) 100vw, 680px",
  },
  2: {
    width: "mx-auto max-w-[900px]",
    grid: "grid grid-cols-1 gap-6 sm:grid-cols-2",
    sizes: "(max-width: 768px) 100vw, 450px",
  },
  3: {
    width: "mx-auto max-w-[1100px]",
    // Stacks below md rather than sm: three 3:2 frames inside a 640px viewport
    // are too small to read, and the captions are the point of this variant.
    grid: "grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-5",
    sizes: "(max-width: 768px) 100vw, 360px",
  },
} as const;

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
  const style = COLUMN_STYLES[cols];

  return (
    <Container className="py-12 sm:py-16">
      <div className={style.width}>
        {heading && (
          <h2 className="mb-8 font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            {heading}
          </h2>
        )}
        <div className={style.grid}>
          {images.map((img) => (
            <figure key={img.src}>
              <div className="relative aspect-[3/2] w-full overflow-hidden bg-lvinit-lightgray">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes={style.sizes}
                  className="object-cover"
                />
              </div>
              {(img.label || img.caption) && (
                <figcaption className="mt-3">
                  {img.label && (
                    <span className="block text-caption uppercase tracking-wide text-lvinit-blue">
                      {img.label}
                    </span>
                  )}
                  {img.caption && (
                    <span
                      className={`block text-caption text-lvinit-warmgray ${
                        img.label ? "mt-1" : ""
                      }`}
                    >
                      {img.caption}
                    </span>
                  )}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </Container>
  );
}
