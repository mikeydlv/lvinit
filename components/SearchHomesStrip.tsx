import Container from "./ui/Container";
import { ButtonLink } from "./ui/Button";

export default function SearchHomesStrip() {
  return (
    <section aria-label="Search homes" className="bg-lvinit-lightgray/60 py-12">
      <Container className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-body-lg text-lvinit-black">
            Ready to see homes for sale?
          </p>
          <p className="text-caption text-lvinit-warmgray">
            Full home search is coming in a future update.
          </p>
        </div>
        <ButtonLink href="#" variant="secondary">
          Search Homes
        </ButtonLink>
      </Container>
    </section>
  );
}
