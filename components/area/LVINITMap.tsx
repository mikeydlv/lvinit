import Image from "next/image";
import Container from "@/components/ui/Container";

export type MapPlace = {
  /** What's marked on the map. */
  name: string;
  /** One line of orientation — where it sits, why it's on the map. */
  note: string;
};

export type LVINITMapProps = {
  heading: string;
  /** The question the map answers, rendered as the section's opening line. */
  question?: string;
  /** Paragraphs of context around the map. Semantic text beats a bare image. */
  intro?: React.ReactNode;
  /** Root-relative path to the generated map asset. Never an external URL. */
  src: string;
  /** Required. Describes the map's actual content, not "a map". */
  alt: string;
  width: number;
  height: number;
  /** Short line under the figure. */
  caption?: string;
  /** The "what's on this map" key — also gives the image real semantic context. */
  places?: MapPlace[];
  /** Heading for the places list. */
  placesHeading?: string;
  /** The boundary honesty note. Rendered in caption type under the key. */
  disclaimer?: React.ReactNode;
  id?: string;
};

/**
 * THE LVINIT MAP — the reusable map block for area guides.
 *
 * The map itself is a generated, self-contained SVG committed under
 * /public/images/maps/ (see scripts/generate-area-map.mjs). It is rendered
 * through next/image as a real image resource with a descriptive filename and
 * alt text, because the goal is for it to be indexable in Google Images —
 * inline SVG is page markup and doesn't get indexed as an image.
 *
 * `unoptimized` is set deliberately: SVG is already resolution-independent, and
 * routing it through the image optimizer would require enabling
 * `dangerouslyAllowSVG` globally for no benefit.
 *
 * MOBILE: the map carries a lot of small type, so it scrolls horizontally
 * inside its own container below ~760px rather than shrinking its labels into
 * illegibility. The places key underneath carries the same information as text,
 * so nothing on the map is only available to people who can scroll it.
 */
export default function LVINITMap({
  heading,
  question,
  intro,
  src,
  alt,
  width,
  height,
  caption,
  places,
  placesHeading = "What's on this map",
  disclaimer,
  id,
}: LVINITMapProps) {
  return (
    <section id={id} aria-labelledby={`${id ?? "lvinit-map"}-heading`} className="scroll-mt-24">
      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-[900px]">
          <h2
            id={`${id ?? "lvinit-map"}-heading`}
            className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black"
          >
            {heading}
          </h2>
          {question && (
            <p className="mt-4 font-display italic text-subhead text-lvinit-warmgray">
              {question}
            </p>
          )}
          {intro && <div className="mt-5 max-w-[680px]">{intro}</div>}

          <figure className="mt-10">
            <div className="overflow-x-auto border border-lvinit-lightgray bg-lvinit-white">
              <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                unoptimized
                sizes="(max-width: 900px) 100vw, 900px"
                className="h-auto w-full min-w-[760px]"
              />
            </div>
            {caption && (
              <figcaption className="mt-3 text-caption text-lvinit-warmgray">
                {caption}
              </figcaption>
            )}
          </figure>

          {places && places.length > 0 && (
            <div className="mt-10 border-t border-lvinit-lightgray pt-8">
              <h3 className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                {placesHeading}
              </h3>
              <dl className="mt-6 grid grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2">
                {places.map((place) => (
                  <div key={place.name}>
                    <dt className="text-body font-medium text-lvinit-black">
                      {place.name}
                    </dt>
                    <dd className="mt-1 text-body text-lvinit-warmgray">
                      {place.note}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {disclaimer && (
            <p className="mt-8 max-w-[680px] text-caption text-lvinit-warmgray">
              {disclaimer}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
