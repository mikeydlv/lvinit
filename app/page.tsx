import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ThesisBeat from "@/components/ThesisBeat";
import NeighborhoodDiscovery from "@/components/NeighborhoodDiscovery";
import ResidentVoice from "@/components/ResidentVoice";
import Comparisons from "@/components/Comparisons";
import BreathingPhoto from "@/components/BreathingPhoto";
import MovingToLasVegas from "@/components/MovingToLasVegas";
import Videos from "@/components/Videos";
import LocalGuides from "@/components/LocalGuides";
import MeetYourGuide from "@/components/MeetYourGuide";
import SearchHomesStrip from "@/components/SearchHomesStrip";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { residentQuotes } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main id="main-content">
        <Hero />
        <ThesisBeat />
        <NeighborhoodDiscovery />

        <ResidentVoice {...residentQuotes[0]} />

        <Comparisons />

        <BreathingPhoto
          src="/images/breathing-downtown-arts-district.jpg"
          label="Placeholder — Downtown Arts District street photography: warm evening light on muralled brick, people out walking, unposed and lived-in"
          caption="Two blocks from the light rail. Around the corner from a bakery that remembers your order."
        />

        <MovingToLasVegas />
        <Videos />

        <BreathingPhoto
          src="/images/breathing-red-rock-trailhead.jpg"
          label="Placeholder — Red Rock / Summerlin trailhead at first light: a lone hiker heading out before the heat, red rock warming, wide and quiet"
          caption="Where the trailhead starts before the heat does."
        />

        <ResidentVoice {...residentQuotes[1]} />

        <LocalGuides />
        <MeetYourGuide />
        <SearchHomesStrip />
        <Newsletter />
      </main>

      <Footer />
    </>
  );
}
