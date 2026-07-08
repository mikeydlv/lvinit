# LVINIT

The definitive, honest guide to *living* in Las Vegas — neighborhood guides,
honest comparisons, and a local you can actually trust. A media platform first,
a real-estate business second.

Built from the approved design docs:

- `docs/02-visual-design-system.md` — visual language (Approved)
- `docs/03-homepage-spec.md` — Phase 1 homepage blueprint (Final)
- `docs/PROJECT_STATE.md` — **living project state; read this first**

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Resend (contact email).
No database, no CMS — content lives in `lib/content.ts`. Fonts (Playfair Display
+ Inter) via `next/font/google`. Hosting: Vercel. Source: GitHub.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Other scripts: `npm run build`,
`npm run start`, `npm run lint`.

## Routes

```
/                                                     Homepage
/neighborhoods/summerlin                              Summerlin neighborhood guide
/neighborhoods/summerlin/fourth-of-july-parade        Editorial lifestyle feature
/search                                               Matrix IDX (GLVAR MLS) embed
/contact                                              Contact form → /api/contact
/api/contact                                          Lead handler (Resend + mailto fallback)
```

## Project structure

```
app/
  layout.tsx         Root layout: fonts, global metadata, skip link, Analytics
  page.tsx           Homepage — assembles every section in order
  globals.css        Tailwind base + accessibility helpers (skip link, focus states, reduced motion)
  robots.ts          robots.txt (allow all, points to sitemap)
  sitemap.ts         Hand-maintained sitemap — add each new page's URL here
  api/contact/route.ts   POST lead handler (Resend); 503 → mailto fallback until configured
  contact/page.tsx
  search/page.tsx
  neighborhoods/summerlin/page.tsx
  neighborhoods/summerlin/fourth-of-july-parade/page.tsx
components/
  Navbar.tsx             Sticky nav, condenses on scroll, full-screen mobile menu
  Hero.tsx
  ThesisBeat.tsx         Full-screen single-sentence typographic moment
  NeighborhoodDiscovery.tsx   Featured Summerlin link + editorial snapshot of the rest
  Comparisons.tsx        "Compare Any Two Neighborhoods" — animated Comparison Bars
  BreathingPhoto.tsx     Full-bleed photo pause + one caption (used twice)
  MovingToLasVegas.tsx   Emotional numeral + quick-facts index
  Videos.tsx             Featured video + selectable thumbnail row
  LocalGuides.tsx        Featured feature + secondary guide cards
  MeetYourGuide.tsx      The "Cover Story" — Mikey, name at Display scale
  SearchHomesStrip.tsx
  Newsletter.tsx
  Footer.tsx             Sitemap columns + required Scofield compliance block
  ContactForm.tsx        Lead form (client), mailto fallback, GA4 lead event
  Analytics.tsx          GA4 loader (only when NEXT_PUBLIC_GA_ID is set)
  ui/
    Button.tsx           Primary / secondary / tertiary (Doc 02 §12)
    Container.tsx        Consistent max-width + gutters
    ImagePlaceholder.tsx Real image, or a labeled gray box until one exists
    VideoPlaceholder.tsx
lib/
  content.ts             Homepage copy + data (see "Placeholder content" below)
  useInViewFade.ts       Shared one-time entrance-fade hook
tailwind.config.ts       Color, type, and spacing tokens — sourced from Doc 02
```

## What was intentionally *not* built (and why)

`docs/03-homepage-spec.md` describes three components that are **deliberately
absent** from this build:

- **`NeighborhoodJourney`** (a swipeable full-bleed neighborhood carousel) and
  **`NeighborhoodGrid`** (a lifestyle-attribute filter grid) — Discovery is
  instead a single, simpler `NeighborhoodDiscovery` component: a featured link to
  the one live guide (Summerlin) plus an honest editorial snapshot of the other
  areas. We build the richer Journey/Grid once there's real content and
  photography behind more than one neighborhood, rather than shipping an
  interactive shell around placeholders.
- **`ResidentVoice`** (two resident-quote interludes) — **not built on purpose.**
  The platform's whole premise is honesty, and Doc 03 §5 forbids fabricated
  testimonials. Rather than ship invented resident quotes, these sections were
  omitted until real, sourced interviews exist.

**Do not recreate these components to "match the spec."** Their absence is a
content-integrity decision, not an oversight. When real content is ready, revisit
the spec deliberately.

## Placeholder content — read before launch

Everything under the **PLACEHOLDER CONTENT** header in `lib/content.ts`, plus the
neutral image stand-ins in `public/images/`, is illustrative scaffolding, not
verified copy. It must be replaced with real material before it can be considered
done (not just before it looks finished):

- **Neighborhood metrics** (median price, walk score, commute, school rating) are
  illustrative figures, not verified market data.
- **The "27" emotional numeral** in `MovingToLasVegas` needs a real, checkable
  commute time.
- **Guide and video cards** (`LocalGuides` secondary entries, `Videos`) are
  display-only until real articles/videos and destination pages exist — they do
  not yet link out.
- **Photography** — real Mikey Del Rosario photos are in place for the Summerlin
  hero(s), the parade banner, Mikey's portrait, and the compliance logos.
  Everything else in `public/images/` is a neutral placeholder; overwrite it in
  place (keep the filename) with a real photo. Never hotlink. See
  `public/images/README.md`.
- **Newsletter** (`components/Newsletter.tsx`) only updates local UI state — wire
  it to a real provider before relying on it.
- **Footer legal links** (Privacy / Terms / Accessibility) are `href="#"`
  placeholders.
- **Compliance block** (footer): license number and brokerage-of-record language
  are real per instruction and must not be changed without explicit direction.

## Environment variables

All optional — the site runs without them (see `.env.example`).

| Var | Purpose | When unset |
|---|---|---|
| `RESEND_API_KEY` | Contact-form email sending | `/api/contact` returns 503 → mailto fallback |
| `CONTACT_FROM_EMAIL` | Verified Resend sender | Defaults to `LVINIT <hello@lvinit.com>` |
| `CONTACT_TO_EMAIL` | Where leads land | Defaults to `hello@lvinit.com` |
| `NEXT_PUBLIC_GA_ID` | GA4 Measurement ID | Analytics doesn't load |

## Design system compliance

Every color, type size, and spacing value traces back to a token in
`docs/02-visual-design-system.md` (see `tailwind.config.ts`). If a change needs a
new color or size, update that document first, then the config — not the other
way around. Do not change the approved docs unless explicitly instructed.
