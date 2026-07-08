import Container from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

export type StoryCtaButton = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "tertiary";
};

export type StoryCTAsProps = {
  heading: string;
  body?: string;
  /**
   * Defaults to the standard pair: Contact (primary) + Search Homes (secondary).
   * Both CTAs should appear on every story; override labels/order as needed.
   */
  buttons?: StoryCtaButton[];
  footnote?: React.ReactNode;
};

const DEFAULT_BUTTONS: StoryCtaButton[] = [
  { label: "Get in touch", href: "/contact", variant: "primary" },
  { label: "Search homes", href: "/search", variant: "secondary" },
];

/**
 * The closing call-to-action band — a quiet Light-Gray terminator carrying the
 * two standing CTAs (Contact + Search Homes), never a hard sell.
 */
export default function StoryCTAs({
  heading,
  body,
  buttons = DEFAULT_BUTTONS,
  footnote,
}: StoryCTAsProps) {
  return (
    <section className="bg-lvinit-lightgray/50">
      <Container className="py-16 text-center sm:py-20">
        <h2 className="mx-auto max-w-2xl font-display text-heading-sm font-bold text-lvinit-black sm:text-heading">
          {heading}
        </h2>
        {body && (
          <p className="mx-auto mt-4 max-w-lg text-body-lg text-lvinit-warmgray">
            {body}
          </p>
        )}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
          {buttons.map((b) => (
            <ButtonLink key={b.href + b.label} href={b.href} variant={b.variant ?? "primary"}>
              {b.label}
            </ButtonLink>
          ))}
        </div>
        {footnote && (
          <p className="mt-8 text-caption text-lvinit-warmgray">{footnote}</p>
        )}
      </Container>
    </section>
  );
}
