import Container from "./ui/Container";
import { ButtonLink } from "./ui/Button";

const quickFacts = [
  { label: "Cost of Living", href: "#guides" },
  { label: "Getting Around", href: "#guides" },
  { label: "Schools & Family", href: "#guides" },
  { label: "Climate & Lifestyle", href: "#guides" },
];

export default function MovingToLasVegas() {
  return (
    <section
      id="moving-to-las-vegas"
      aria-labelledby="moving-heading"
      className="py-16 sm:py-24"
    >
      <Container>
        <h2 id="moving-heading" className="sr-only">
          Moving to Las Vegas
        </h2>

        <div className="text-center">
          <p className="font-sans text-scoreboard font-bold tabular-nums text-lvinit-black">
            27
          </p>
          <p className="mx-auto mt-4 max-w-xl font-display italic text-subhead text-lvinit-warmgray">
            The minutes between waking up in Summerlin and sitting at your
            desk downtown. Long enough for a coffee. Short enough to still
            feel like home.
          </p>
          <p className="mt-3 text-caption text-lvinit-warmgray">
            A typical morning drive — yours will shift with where in Summerlin
            you land.
          </p>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row sm:flex-wrap gap-x-10 gap-y-4 border-t border-lvinit-lightgray pt-8">
          {quickFacts.map((fact) => (
            <a
              key={fact.label}
              href={fact.href}
              className="text-body text-lvinit-black hover:text-lvinit-blue transition-colors duration-200 ease-calm"
            >
              {fact.label} →
            </a>
          ))}
        </div>

        <div className="mt-8">
          <ButtonLink href="#guides" variant="tertiary">
            Start with the moving-to-Vegas guides
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
