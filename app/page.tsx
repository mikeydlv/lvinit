import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ThesisBeat from "@/components/ThesisBeat";
import NeighborhoodDiscovery from "@/components/NeighborhoodDiscovery";
import Comparisons from "@/components/Comparisons";
import BreathingPhoto from "@/components/BreathingPhoto";
import MovingToLasVegas from "@/components/MovingToLasVegas";
import Videos from "@/components/Videos";
import LocalGuides from "@/components/LocalGuides";
import MeetYourGuide from "@/components/MeetYourGuide";
import SearchHomesStrip from "@/components/SearchHomesStrip";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main id="main-content">
        <Hero />
        <ThesisBeat />
        <NeighborhoodDiscovery />

        <Comparisons />

        <BreathingPhoto
          src="/images/breathing-arts-district-joie-de-vivre-mural.webp"
          label="A large, colorful street mural in the Las Vegas Arts District, with the Strat tower rising behind it."
          caption="Beyond the Strip, Las Vegas has a personality of its own."
        />

        <MovingToLasVegas />
        <Videos />

        <BreathingPhoto
          src="/images/breathing-red-rock-canyon-scenic-drive.webp"
          label="The scenic drive toward Red Rock Canyon, its red-and-tan escarpment rising past open desert west of the city."
          caption="Where the city gives way to open desert."
        />

        <LocalGuides />
        <MeetYourGuide />
        <SearchHomesStrip />
        <Newsletter />
      </main>

      <Footer />
    </>
  );
}
