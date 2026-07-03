import ImagePlaceholder from "./ui/ImagePlaceholder";
import { ButtonLink } from "./ui/Button";

export default function MeetYourGuide() {
  return (
    <section
      id="meet-your-guide"
      aria-labelledby="guide-heading"
      className="relative flex min-h-screen items-end overflow-hidden bg-lvinit-black"
    >
      <ImagePlaceholder
        src="/images/meet-your-guide-mikey-portrait.svg"
        label="Placeholder — environmental portrait of Mikey Del Rosario on location in a real Las Vegas neighborhood at golden hour, relaxed and mid-conversation, magazine-cover crop — not a studio backdrop"
        aspect="aspect-auto"
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-lvinit-black/90 via-lvinit-black/30 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-20 pb-16 sm:pb-24">
        <p className="text-caption uppercase tracking-wide text-lvinit-white/70">
          Meet Your Guide
        </p>
        <h2
          id="guide-heading"
          className="mt-2 font-display text-[56px] leading-[58px] sm:text-display sm:leading-[88px] font-black text-lvinit-white"
        >
          Mikey Del Rosario
        </h2>
        <p className="mt-6 max-w-xl font-display italic text-subhead sm:text-heading-sm text-lvinit-white">
          &ldquo;Buying a home isn&rsquo;t just about the house. It&rsquo;s
          about choosing the right place to build your life.&rdquo;
        </p>
        <p className="mt-6 max-w-lg text-body text-lvinit-white/80">
          Mikey has spent years helping people move to, and fall in love
          with, Las Vegas — not just close on a house in it. Licensed real
          estate professional, Nevada License S.0175577. Brokered by
          The Scofield Group.
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
            href="mailto:hello@lvinit.com"
            variant="tertiary"
            className="!text-lvinit-white decoration-lvinit-white"
          >
            Get in Touch
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
