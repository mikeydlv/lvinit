import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export type StoryHeroCta = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "tertiary";
};

export type StoryHeroProps = {
  /** Small uppercase kicker above the headline — e.g. "Summerlin · A Local Feature". */
  category?: string;
  headline: string;
  subheadline?: string;
  /** Root-relative hero image. With one, the hero is full-bleed with a dark
   *  gradient + white text; without one, it's a bright, honest editorial hero
   *  with dark text (never a fabricated stand-in photo). */
  image?: string;
  imageAlt?: string;
  /** Optional title attr — used site-wide for a discreet in-image photo credit. */
  imageTitle?: string;
  backLink?: { label: string; href: string };
  ctas?: StoryHeroCta[];
};

export default function StoryHero({
  category,
  headline,
  subheadline,
  image,
  imageAlt,
  imageTitle,
  backLink,
  ctas,
}: StoryHeroProps) {
  const onDark = Boolean(image);

  const back = backLink && (
    <Link
      href={backLink.href}
      className={
        onDark
          ? "text-caption uppercase tracking-wide text-lvinit-white/80 hover:text-lvinit-white"
          : "text-caption uppercase tracking-wide text-lvinit-warmgray hover:text-lvinit-blue transition-colors duration-200 ease-calm"
      }
    >
      ← {backLink.label}
    </Link>
  );

  const kicker = category && (
    <p
      className={`text-caption uppercase tracking-wide ${
        onDark ? "text-lvinit-white/80" : "text-lvinit-warmgray"
      }`}
    >
      {category}
    </p>
  );

  const title = (
    <h1
      className={`max-w-4xl font-display text-[40px] leading-[44px] font-black sm:text-display sm:leading-[84px] ${
        category ? "mt-3" : ""
      } ${onDark ? "text-lvinit-white" : "text-lvinit-black"}`}
    >
      {headline}
    </h1>
  );

  const sub = subheadline && (
    <p
      className={`mt-5 max-w-2xl text-body-lg ${
        onDark ? "text-lvinit-white/90" : "text-lvinit-warmgray"
      }`}
    >
      {subheadline}
    </p>
  );

  const buttons = ctas && ctas.length > 0 && (
    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
      {ctas.map((c) => (
        <ButtonLink
          key={c.href + c.label}
          href={c.href}
          variant={c.variant ?? "primary"}
          className={
            onDark && (c.variant ?? "primary") === "tertiary"
              ? "!text-lvinit-white decoration-lvinit-white"
              : ""
          }
        >
          {c.label}
        </ButtonLink>
      ))}
    </div>
  );

  if (onDark) {
    return (
      <section className="relative flex min-h-[80vh] items-end overflow-hidden">
        <Image
          src={image as string}
          alt={imageAlt ?? headline}
          title={imageTitle}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-lvinit-black/45 via-lvinit-black/20 to-transparent"
        />
        <Container className="relative z-10 pb-14 pt-40 sm:pb-20">
          {back}
          <div className={backLink ? "mt-4" : ""}>
            {kicker}
            {title}
          </div>
          {sub}
          {buttons}
        </Container>
      </section>
    );
  }

  // Bright editorial hero (no photo yet). Honest stand-in, never fabricated scenery.
  return (
    <section className="relative flex min-h-[62vh] items-end overflow-hidden border-b border-lvinit-lightgray bg-gradient-to-b from-lvinit-lightgray/50 via-lvinit-white to-lvinit-white">
      <Container className="relative z-10 pb-14 pt-40 sm:pb-20 sm:pt-48">
        {back}
        <div className={backLink ? "mt-4" : ""}>
          {kicker}
          {title}
        </div>
        {sub}
        {buttons}
      </Container>
    </section>
  );
}
