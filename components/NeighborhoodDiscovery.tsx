import Container from "./ui/Container";
import NeighborhoodJourney from "./NeighborhoodJourney";
import NeighborhoodGrid from "./NeighborhoodGrid";

export default function NeighborhoodDiscovery() {
  return (
    <section id="neighborhoods" aria-labelledby="neighborhoods-heading">
      <Container className="pt-16 sm:pt-24">
        <h2
          id="neighborhoods-heading"
          className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black"
        >
          Explore Las Vegas by Neighborhood
        </h2>
        <p className="mt-3 max-w-xl text-body text-lvinit-warmgray">
          Five flagship neighborhoods to start — then narrow by what actually
          matters to you.
        </p>
      </Container>

      <div className="mt-10">
        <NeighborhoodJourney />
      </div>

      <Container>
        <NeighborhoodGrid />
      </Container>
    </section>
  );
}
