import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Mikey — LVINIT",
  description:
    "Tell Mikey Del Rosario what you're weighing about moving to Las Vegas — timeline, neighborhoods, questions — and get the honest local version back.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main id="main-content" className="bg-lvinit-white">
        <Container className="pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Intro */}
            <div className="lg:col-span-5">
              <p className="flex items-center gap-3 text-caption uppercase tracking-wide text-lvinit-warmgray">
                <span className="h-px w-8 bg-lvinit-blue" aria-hidden="true" />
                Contact
              </p>
              <h1 className="mt-6 font-display text-heading-sm sm:text-heading font-bold text-lvinit-black">
                Let&rsquo;s talk.
              </h1>
              <p className="mt-6 max-w-md text-body-lg text-lvinit-warmgray">
                Tell me where you&rsquo;re moving from, what matters to you, and
                your timeline. I&rsquo;ll come back with the honest version —
                the neighborhoods that fit, the ones that don&rsquo;t, and what
                the listings won&rsquo;t tell you.
              </p>
              <p className="mt-4 max-w-md text-body text-lvinit-warmgray">
                No autoresponders, no pressure. Just a local who actually knows
                the valley.
              </p>
              <p className="mt-8 text-caption uppercase tracking-wide text-lvinit-warmgray">
                Mikey Del Rosario · REALTOR® · NV Lic. S.0175577 · The Scofield
                Group
              </p>
            </div>

            {/* Form */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </>
  );
}
