import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Search Homes — LVINIT",
  description:
    "Search homes for sale across Las Vegas on the live GLVAR MLS — by neighborhood, price, and what actually matters to you.",
};

export default function SearchPage() {
  return (
    <>
      <Navbar />

      <main id="main-content" className="bg-lvinit-white">
        <Container className="pt-32 pb-16 sm:pt-40 sm:pb-24">
          <header className="max-w-2xl">
            <p className="flex items-center gap-3 text-caption uppercase tracking-wide text-lvinit-warmgray">
              <span className="h-px w-8 bg-lvinit-blue" aria-hidden="true" />
              Las Vegas · Homes for Sale
            </p>
            <h1 className="mt-6 font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
              Search Homes for Sale
            </h1>
            <p className="mt-4 text-body-lg text-lvinit-warmgray">
              The full Las Vegas MLS, live — search by neighborhood, price, and
              the things that actually matter. When you find something worth a
              closer look, let&rsquo;s talk through what the listing doesn&rsquo;t
              tell you.
            </p>
          </header>

          {/* Matrix IDX embed (GLVAR). The iframe fills this sized panel so its
              height="100%" resolves; the panel keeps a min height on short screens. */}
          <div className="relative mt-10 h-[calc(100vh-9rem)] min-h-[640px] w-full overflow-hidden border border-lvinit-lightgray bg-lvinit-white sm:mt-12">
            <iframe
              src="https://las.mlsmatrix.com/Matrix/public/IDX.aspx?idx=3652dd5"
              title="Search Las Vegas homes for sale — GLVAR MLS (Matrix IDX)"
              loading="lazy"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </Container>
      </main>

      <Footer />
    </>
  );
}
