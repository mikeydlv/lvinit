import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import GuideCard from "@/components/GuideCard";
import { publishedGuides } from "@/lib/content";
import { SITE_URL } from "@/lib/story";

// ---------------------------------------------------------------------------
// GUIDES INDEX — the complete editorial library.
//
// Reads the same canonical registry (lib/content.ts) and the same GuideCard as
// the homepage "Latest from LVINIT" feed, so a newly published guide appears in
// both without either file being edited. The homepage shows the newest three;
// this page shows everything published, newest first.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Guides — Living, Moving, and Buying in Las Vegas | LVINIT",
  description:
    "Every LVINIT guide in one place: neighborhood comparisons, cost of living, market updates, and the practical things worth knowing before you move to Las Vegas.",
  alternates: { canonical: `${SITE_URL}/guides` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/guides`,
    siteName: "LVINIT",
    title: "Guides — Living, Moving, and Buying in Las Vegas",
    description:
      "Every LVINIT guide in one place: neighborhood comparisons, cost of living, market updates, and the practical things worth knowing before you move to Las Vegas.",
  },
};

export default function GuidesIndexPage() {
  return (
    <>
      <Navbar />

      <main id="main-content" className="bg-lvinit-white">
        <Container className="pt-32 pb-16 sm:pt-40 sm:pb-24">
          <h1 className="font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
            Guides
          </h1>
          <p className="mt-4 max-w-prose text-body-lg text-lvinit-warmgray">
            Useful guides, local updates, and things worth knowing before you
            buy, rent, or move around Las Vegas.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {publishedGuides.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} headingLevel="h2" />
            ))}
          </div>
        </Container>
      </main>

      <Footer />
    </>
  );
}
