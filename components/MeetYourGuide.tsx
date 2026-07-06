import Image from "next/image";
import { ButtonLink } from "./ui/Button";

export default function MeetYourGuide() {
  return (
    <section
      id="meet-your-guide"
      aria-labelledby="guide-heading"
      className="overflow-hidden bg-lvinit-black"
    >
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-end gap-8 px-6 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:px-20">
        {/* Real environmental headshot (transparent cutout, sits on the dark) */}
        <div className="flex justify-center lg:col-span-5 lg:justify-start">
          <Image
            src="/images/team/mikey-del-rosario.webp"
            alt="Mikey Del Rosario"
            width={598}
            height={800}
            sizes="(max-width: 1024px) 70vw, 34vw"
            className="h-auto w-full max-w-xs object-contain lg:max-w-sm"
          />
        </div>

        {/* Bio + credentials */}
        <div className="pb-16 lg:col-span-7 lg:py-24">
          <p className="text-caption uppercase tracking-wide text-lvinit-white/70">
            Meet Your Guide
          </p>
          <h2
            id="guide-heading"
            className="mt-2 font-display text-[48px] leading-[52px] sm:text-heading font-black text-lvinit-white"
          >
            Mikey Del Rosario
          </h2>
          <p className="mt-6 max-w-xl font-display italic text-subhead sm:text-heading-sm text-lvinit-white">
            &ldquo;Buying a home isn&rsquo;t just about the house. It&rsquo;s
            about choosing the right place to build your life.&rdquo;
          </p>
          <p className="mt-6 max-w-lg text-body text-lvinit-white/80">
            I&rsquo;ve spent years helping people move to — and fall in love
            with — Las Vegas, not just close on a house in it. Tell me what
            you&rsquo;re weighing and I&rsquo;ll give you the honest version,
            neighborhood by neighborhood.
          </p>
          <p className="mt-6 text-caption uppercase tracking-wide text-lvinit-white/60">
            Mikey Del Rosario · REALTOR® · NV Lic. S.0175577 · The Scofield
            Group
          </p>
          <div className="mt-8 flex flex-wrap gap-6">
            <ButtonLink
              href="#videos"
              variant="tertiary"
              className="!text-lvinit-white decoration-lvinit-white"
            >
              Watch Mikey&rsquo;s story
            </ButtonLink>
            <ButtonLink
              href="/contact"
              variant="tertiary"
              className="!text-lvinit-white decoration-lvinit-white"
            >
              Get in touch
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
