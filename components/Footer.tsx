import Image from "next/image";
import Container from "./ui/Container";

const columns = [
  {
    heading: "Explore",
    links: [
      { label: "Neighborhoods", href: "#neighborhoods" },
      { label: "Guides", href: "#guides" },
      { label: "Compare", href: "#compare" },
      { label: "Videos", href: "#videos" },
      { label: "Moving to Las Vegas", href: "#moving-to-las-vegas" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Meet Your Guide", href: "#meet-your-guide" },
      { label: "Contact", href: "mailto:hello@lvinit.com" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Use", href: "#" },
      { label: "Accessibility", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-lvinit-lightgray bg-lvinit-white">
      <Container className="pt-16 pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-sans text-subhead font-extrabold tracking-[0.1em]">
              <span className="text-lvinit-black">LVI</span>
              <span className="text-lvinit-gold">NIT</span>
            </p>
            <p className="mt-3 max-w-[220px] text-caption text-lvinit-warmgray">
              An honest guide to actually living in Las Vegas — the
              neighborhoods, the tradeoffs, and a local who&rsquo;ll tell you
              the parts a brochure won&rsquo;t.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-lvinit-lightgray/50">
                <Image
                  src="/images/team/mikey-del-rosario.webp"
                  alt="Mikey Del Rosario"
                  fill
                  sizes="64px"
                  className="object-cover object-top"
                />
              </div>
              <div>
                <p className="text-body font-medium text-lvinit-black">
                  Mikey Del Rosario
                </p>
                <p className="text-caption text-lvinit-warmgray">
                  Las Vegas Real Estate Advisor
                </p>
              </div>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <p className="text-caption uppercase tracking-wide text-lvinit-warmgray">
                {col.heading}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-body text-lvinit-black hover:text-lvinit-blue transition-colors duration-200 ease-calm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Required compliance block — Doc 03 §3.16 / §3.14. Do not remove
            or visually diminish; every element here was specified explicitly. */}
        <div className="mt-16 border-t border-lvinit-lightgray pt-10">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-6">
            <div className="relative h-12 w-52">
              <Image
                src="/images/logos/the-scofield-group.webp"
                alt="The Scofield Group"
                fill
                sizes="208px"
                className="object-contain object-left"
              />
            </div>
            <div className="relative h-14 w-14">
              <Image
                src="/images/logos/equal-housing-opportunity.webp"
                alt="Equal Housing Opportunity"
                fill
                sizes="56px"
                className="object-contain"
              />
            </div>
            <div className="relative h-14 w-14">
              <Image
                src="/images/logos/realtor.webp"
                alt="REALTOR®"
                fill
                sizes="56px"
                className="object-contain"
              />
            </div>
          </div>

          <div className="mt-6 space-y-1 text-caption text-lvinit-warmgray">
            <p>Mikey Del Rosario, REALTOR® — Nevada License S.0175577</p>
            <p>Brokered by The Scofield Group.</p>
            <p>
              LVINIT is an independent media and information platform.
              Brokerage services are provided by The Scofield Group.
            </p>
          </div>

          <p className="mt-6 text-caption text-lvinit-warmgray/70">
            © {new Date().getFullYear()} LVINIT. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
