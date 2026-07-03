"use client";

import { useEffect, useState } from "react";
import Container from "./ui/Container";

const primaryLinks = [
  { label: "Neighborhoods", href: "#neighborhoods" },
  { label: "Guides", href: "#guides" },
  { label: "Compare", href: "#compare" },
  { label: "Videos", href: "#videos" },
  { label: "Moving to Las Vegas", href: "#moving-to-las-vegas" },
];

export default function Navbar() {
  const [condensed, setCondensed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu overlay is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,height] duration-300 ease-calm motion-reduce:transition-none ${
        condensed
          ? "h-16 bg-lvinit-white border-b border-lvinit-lightgray"
          : "h-[88px] bg-transparent border-b border-transparent"
      }`}
    >
      <Container className="flex h-full items-center justify-between">
        <a
          href="#main-content"
          className="font-display text-subhead font-bold tracking-tight text-lvinit-black"
        >
          LVINIT
        </a>

        <nav
          aria-label="Primary"
          className="hidden lg:flex items-center gap-8"
        >
          {primaryLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-body text-lvinit-black tracking-wide hover:text-lvinit-blue transition-colors duration-200 ease-calm"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-6">
          <a
            href="#"
            title="Coming soon — Phase 2"
            className="text-caption uppercase tracking-wide text-lvinit-warmgray hover:text-lvinit-blue transition-colors duration-200"
          >
            Search Homes
          </a>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="lg:hidden flex h-10 w-10 items-center justify-center"
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <div className="flex flex-col gap-[5px]">
            <span
              className={`h-[1.5px] w-6 bg-lvinit-black transition-transform duration-200 ${
                menuOpen ? "translate-y-[6.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[1.5px] w-6 bg-lvinit-black transition-opacity duration-200 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-[1.5px] w-6 bg-lvinit-black transition-transform duration-200 ${
                menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </Container>

      {menuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-lvinit-white overflow-y-auto">
          <nav aria-label="Mobile" className="flex flex-col gap-8 px-6 py-10">
            {primaryLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="font-display text-heading-sm text-lvinit-black"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#"
              onClick={() => setMenuOpen(false)}
              className="text-caption uppercase tracking-wide text-lvinit-warmgray"
            >
              Search Homes
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
