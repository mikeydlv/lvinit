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
          src="/images/breathing-downtown-arts-district.jpg"
          label="The Downtown Arts District at dusk"
          caption="Two blocks from the light rail. Around the corner from a bakery that remembers your order."
        />

        <MovingToLasVegas />
        <Videos />

        <BreathingPhoto
          src="/images/breathing-red-rock-trailhead.jpg"
          label="The Red Rock trailhead near Summerlin at first light"
          caption="Where the trailhead starts before the heat does."
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
