# LVINIT — Phase 1 Homepage

The definitive guide to living in Las Vegas. This is the Phase 1 MVP homepage,
built directly from:

- `docs/02-visual-design-system.md`
- `docs/03-homepage-spec.md`

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · no database, no CMS, no
IDX, no auth — content lives in `lib/content.ts`.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Project structure

```
app/
  layout.tsx        Root layout, fonts (Playfair Display + Inter), metadata
  page.tsx           Assembles every homepage section in order
  globals.css        Tailwind base + accessibility helpers (skip link, focus states)
components/
  Navbar.tsx         Sticky nav, condenses on scroll, full-screen mobile menu
  Hero.tsx
  ThesisBeat.tsx
  NeighborhoodDiscovery.tsx   Wraps the Journey + Grid
  NeighborhoodJourney.tsx     Horizontal, user-controlled flagship sequence
  NeighborhoodGrid.tsx        Filterable card grid
  ResidentVoice.tsx           Reused for both quote interludes
  Comparisons.tsx             The Scoreboard Reveal
  BreathingPhoto.tsx          Reused for both full-bleed photo pauses
  MovingToLasVegas.tsx
  Videos.tsx
  LocalGuides.tsx
  MeetYourGuide.tsx           The Cover Story
  SearchHomesStrip.tsx
  Newsletter.tsx
  Footer.tsx                  Sitemap + required compliance block
  ui/
    Button.tsx       Primary / secondary / tertiary, per Doc 02 §12
    Container.tsx    Consistent grid margins
    ImagePlaceholder.tsx
    VideoPlaceholder.tsx
lib/
  content.ts          All homepage copy and data — see warning below
  useInViewFade.ts     Shared entrance-fade hook for the quiet sections
tailwind.config.ts     Color, type, and spacing tokens — sourced from Doc 02
```

## Before this goes live — read this

Everything under **PLACEHOLDER CONTENT** at the top of `lib/content.ts` needs
to be replaced with real material before launch, not just before it looks
finished:

- **Resident quotes** (both `ResidentVoice` instances) are illustrative, not
  real interviews. Doc 03 §5 (Content Integrity Guardrails) requires these to
  be genuinely sourced — a platform built on "honest" can't ship a fabricated
  testimonial.
- **The emotional numeral** in `MovingToLasVegas` ("27 minutes...") is an
  illustrative figure, not a verified commute time.
- **Mikey's pulled quote** in `MeetYourGuide` is illustrative and needs to be
  something he actually said.
- **All photography and video** are styled placeholder boxes
  (`ImagePlaceholder` / `VideoPlaceholder`), labeled with what real shot or
  clip belongs there. Swap them for real `<Image>` / video sources —
  no `next.config.js` image-domain setup has been added since none is needed
  yet.
- **Navigation and CTA links**: on-page anchors (`#neighborhoods`,
  `#compare`, `#videos`, `#guides`, `#moving-to-las-vegas`) work today since
  those sections exist on this homepage. Everything pointing to a page that
  doesn't exist yet (Search Homes, View All Neighborhoods, Read All Guides,
  Privacy/Terms/Accessibility, About) is a `href="#"` placeholder — wire
  these up as those pages get built.
- **Newsletter form** (`components/Newsletter.tsx`) only updates local UI
  state right now — no email actually gets captured. Wire it to a real
  provider or a Vercel serverless function before relying on it.
- **Compliance block** (footer): Mikey Del Rosario's license number and
  "Brokered by The Scofield Group" are set as real text per your instructions.
  The three logo marks (The Scofield Group, Equal Housing Opportunity,
  REALTOR®) are dashed-border placeholders — drop in the real marks as
  image assets before launch.

## Design system compliance

Every color, type size, and spacing value in this codebase traces back to a
token in `docs/02-visual-design-system.md` (see `tailwind.config.ts`). If a
future change needs a new color or size, update that document first, then
the config — not the other way around.
