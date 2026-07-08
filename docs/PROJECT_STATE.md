# LVINIT Project Overview

> **Living documentation.** This file is the fast-start briefing for any future
> Claude Code session (or human) picking up LVINIT. Update it after every major
> development sprint. Where this file and the code disagree, trust the code and
> fix this file.
>
> **Last audited:** 2026-07-08 · **Branch:** `main` · **Live:** https://www.lvinit.com

---

## Brand Mission

LVINIT is a **Las Vegas living, relocation, neighborhood, and real-estate media
platform**. It should feel **premium, editorial, bright, local, honest, and
modern** — the definitive, most trustworthy guide to *living* in Las Vegas
first, and a real-estate business second.

The governing test (Doc 02 §0): **"This doesn't feel like a Realtor website."**
No MLS-search hero, no automated valuations presented as fact, no stock photos of
a couple holding house keys, no neighborhood page that's secretly a filtered
listings feed. The sharper thesis (Doc 03): LVINIT helps someone move *through
uncertainty toward a confident answer to "where do I belong?"* — every section is
judged by whether a visitor leaves it feeling more sure of themselves.

- **Voice:** sounds like **Mikey Del Rosario** — direct, conversational, local,
  helpful. Not corporate, not fake luxury, not hype.
- **The Scofield Group** is the brokerage / compliance / trust layer. It is
  *quiet infrastructure* — it appears only in the footer, on Contact, in agent
  bios, and on legal pages. It never competes with the LVINIT brand during the
  content experience.

---

## Current Site Architecture

**Framework:** Next.js 14 (App Router) · TypeScript · Tailwind CSS.
**Rendering:** Static React Server Components by default; a handful of
`"use client"` islands for interactivity. No database, no CMS — all homepage copy
and data lives in [`lib/content.ts`](../lib/content.ts).

**Deployment:** GitHub → Vercel (active workflow). Push to GitHub only after a
task is completed and verified (`npm run build` + browser preview).

**Routing (App Router file map):**

```
app/
  layout.tsx                                   Root layout: fonts, global metadata, skip link, Analytics
  page.tsx                                      Homepage — assembles every section in order
  globals.css                                   Tailwind base + a11y (skip link, focus rings, reduced motion)
  robots.ts                                     robots.txt (allow all, points to sitemap)
  sitemap.ts                                    Hand-maintained sitemap (5 URLs today)
  icon.png                                      Favicon / app icon
  api/contact/route.ts                          POST lead handler (Resend); 503 → mailto fallback
  contact/page.tsx                              /contact — intro + ContactForm
  search/page.tsx                               /search — Matrix IDX (GLVAR MLS) iframe embed
  neighborhoods/summerlin/page.tsx              /neighborhoods/summerlin — first full neighborhood guide
  neighborhoods/summerlin/fourth-of-july-parade/page.tsx   Editorial lifestyle feature (Article + Breadcrumb JSON-LD)
```

**Path alias:** `@/*` → project root (see `tsconfig.json`).

---

## Existing Pages

| Route | Type | Status | Notes |
|---|---|---|---|
| `/` | Homepage | Live | 12 assembled sections; still contains placeholder content (see Pending Work) |
| `/neighborhoods/summerlin` | Neighborhood guide | Live | Real Mikey photography (Fox Hill Park drone hero); honest editorial "beats" |
| `/neighborhoods/summerlin/fourth-of-july-parade` | Editorial feature | Live | Full Article + Breadcrumb JSON-LD, embedded YouTube (nocookie), real banner photo |
| `/search` | IDX search | Live | Matrix IDX embed `idx=3652dd5`; do not modify embed behavior without instruction |
| `/contact` | Contact | Live | ContactForm → `/api/contact` (Resend) with mailto fallback |
| `/api/contact` | Route handler | Live | Returns 503 until `RESEND_API_KEY` is set, so no fake service ships |

**Homepage section order** (from [`app/page.tsx`](../app/page.tsx)):
Navbar → Hero → ThesisBeat → NeighborhoodDiscovery → Comparisons →
BreathingPhoto (Arts District) → MovingToLasVegas → Videos →
BreathingPhoto (Red Rock) → LocalGuides → MeetYourGuide → SearchHomesStrip →
Newsletter → Footer.

---

## Existing Neighborhoods

Data lives in [`lib/content.ts`](../lib/content.ts) as the `neighborhoods[]`
array. **All metrics below are flagged placeholder figures** (illustrative
scaffolding, not verified market data — see the header comment in that file).

| Slug | Name | Headline stat | Has a page? | Tags |
|---|---|---|---|---|
| `summerlin` | Summerlin | Walk Score 54 | ✅ Full guide + parade feature | top-schools, quiet-suburban |
| `henderson` | Henderson | Median $525K | ❌ **Next build** | top-schools, quiet-suburban |
| `downtown-arts-district` | Downtown Arts District | Walk Score 88 | ❌ | walkable, up-and-coming, close-to-strip |
| `green-valley` | Green Valley | School 8.6/10 | ❌ | top-schools, quiet-suburban |
| `lake-las-vegas` | Lake Las Vegas | Median $780K | ❌ | quiet-suburban |

Only **Summerlin** has real pages. The other four exist as editorial snapshots on
the homepage and as selectable options in the Comparison tool and contact form.

---

## Design Standards

Source of truth: [`docs/02-visual-design-system.md`](02-visual-design-system.md)
(Approved) and [`docs/03-homepage-spec.md`](03-homepage-spec.md) (Final — Phase 1
Locked). **Do not change these approved docs unless explicitly instructed.**
Every color, type size, and spacing value in the code traces back to a token in
Doc 02 — if a change needs a new token, update Doc 02 first, then
`tailwind.config.ts`.

- **Design references:** Apple (restraint), Airbnb (belonging through
  photography, pointed at *neighborhoods* not properties), Baanlyy (editorial
  relocation-platform *feel*, not layout).
- **One-accent rule (strict):** Scofield Blue `#2B6CB0` is the *only* color that
  means "you can click this." No second interactive accent.
- **Gold** is brand-wordmark only (the "NIT"); never in UI chrome.
- **No Vegas tourism clichés:** no dice, cards, neon lettering, showgirls, Strip
  skyline. The Strip appears only as an honest data point (commute distance).
- **Motion:** calm easing (`cubic-bezier(0.4,0,0.2,1)` = `ease-calm`),
  200–350ms, rare and earned, never ambient. Reduced motion respected
  system-wide (`globals.css` + `motion-reduce:` utilities).
- **Whitespace** governs everything except the Comparison view (the one
  intentional density exception).
- **Pacing rhythm (Doc 03 §4):** dense and quiet sections alternate; no two dense
  sections back-to-back past the hero. Three dense sections in a row = a pacing
  regression to fix.

### Color palette (`tailwind.config.ts` → `colors.lvinit`)

| Token | Hex | Role |
|---|---|---|
| `lvinit-black` | `#111111` | Warm near-black — primary text, dark surfaces |
| `lvinit-white` | `#FFFFFF` | Primary background (genuinely white, not cream) |
| `lvinit-warmgray` | `#6E6A63` | Secondary text, captions, muted UI, section fills |
| `lvinit-lightgray` | `#E8E6E1` | Dividers, hairline borders, subtle fills, hovers |
| `lvinit-blue` | `#2B6CB0` | **Scofield Blue** — the single interactive accent |
| `lvinit-gold` | `#C8A46A` | Wordmark "NIT" only |

---

## Typography

Two typefaces, non-overlapping jobs (loaded via `next/font/google` in
`app/layout.tsx`, exposed as CSS variables).

- **Playfair Display** (`font-display`, var `--font-playfair`) — editorial
  headlines only. Black/Bold weight above ~32px. Italic used deliberately
  (kickers, pull quotes). Never below 24px, never in UI/labels/buttons.
- **Inter** (`font-sans`, var `--font-inter`) — everything else: body, nav,
  buttons, labels, forms, captions, and **all numerals** (tabular figures for
  comparative data).

**Type scale** (`tailwind.config.ts` → `fontSize`, sourced from Doc 02 §2 / Doc
03 §2). The three largest sizes are reserved:

| Token | Size / line-height | Reserved for |
|---|---|---|
| `caption` | 13 / 18, tracking .06em | labels, kickers |
| `body` | 17 / 28 | body copy |
| `body-lg` | 19 / 30 | large body |
| `subhead` | 24 / 32 | subheads |
| `heading-sm` | 36 / 42 | small headlines |
| `heading` | 52 / 58 | headlines |
| `thesis` | 56 / 64 | **Thesis Beat only** |
| `scoreboard` | 64 / 68 | **Journey / Comparison names, emotional numeral** |
| `display` | 84 / 88 | **Hero + Mikey's name only** |

**Article width:** reading column capped at `max-w-prose` (700px) even inside
wider pages (~65–75 chars/line).

---

## Components

All in `components/`. Server components unless marked **client**.

| Component | Role | Notes |
|---|---|---|
| `Navbar.tsx` **client** | Fixed header, condenses 88→64px on scroll, full-screen mobile menu | Anchor links to homepage sections + Search Homes |
| `Hero.tsx` | Full-bleed hero photo + headline + CTAs | Bright cream washes (never dark); real drone photo |
| `ThesisBeat.tsx` **client** | Full-screen single-sentence typographic moment | One-time in-view fade via `useInViewFade` |
| `NeighborhoodDiscovery.tsx` | Featured Summerlin link + editorial list of other areas | **Simplified** vs. spec (see Known Notes) |
| `Comparisons.tsx` **client** | "Compare Any Two Neighborhoods" — animated Comparison Bars | Placeholder metrics; Scofield Blue marks the winner |
| `BreathingPhoto.tsx` | Full-bleed photo pause + one caption line | Used twice; wraps `ImagePlaceholder` |
| `MovingToLasVegas.tsx` | Emotional numeral ("27") + quick-facts index | **"27" is a placeholder figure** |
| `Videos.tsx` **client** | Featured video + selectable thumbnail row | Placeholder posters; click swaps featured only |
| `LocalGuides.tsx` | Featured feature (parade) + 3 secondary guide cards | Secondary cards are display-only (no pages yet) |
| `MeetYourGuide.tsx` | "Cover Story" — Mikey on dark bg, name at Display scale | Real transparent-cutout portrait |
| `SearchHomesStrip.tsx` | Quiet utility strip → `/search` | Deliberately not a "moment" |
| `Newsletter.tsx` **client** | Email capture | **No backend** — updates local UI state only |
| `Footer.tsx` | Sitemap columns + Scofield compliance block + photo credit | Compliance block is load-bearing — do not diminish |
| `ContactForm.tsx` **client** | Lead form → `/api/contact`, mailto fallback, `gtag` lead event | |
| `Analytics.tsx` | GA4 loader | Only loads when `NEXT_PUBLIC_GA_ID` is set |
| `ui/Button.tsx` | `Button` + `ButtonLink`, 3 variants (primary/secondary/tertiary) | Auto-detects external hrefs |
| `ui/Container.tsx` | Max-width 1440px + responsive gutters | Site-wide layout wrapper |
| `ui/ImagePlaceholder.tsx` | Real image (with `src`) or labeled gray box (without) | Swap asset at same path to go live |
| `ui/VideoPlaceholder.tsx` | Poster + play button or plain black block | |

**Shared hook:** `lib/useInViewFade.ts` — one-time IntersectionObserver fade-in
for quiet sections.

---

## Photography Standards

- **Use only real photography captured by Mikey Del Rosario** unless otherwise
  noted. A global credit line in the footer covers all original imagery.
- **Never generate fake neighborhood photography** — no AI-looking real-estate
  imagery, vector landscapes, or generic stock vibes unless explicitly approved.
- **Preserve a natural editorial look.** Avoid HDR or AI-looking edits — no
  twilight-every-light-on, no over-processed grade.
- **Place-and-life photography leads; property photography supports** (Doc 02
  §8). Priority: neighborhood/street-level → people living (documentary, not
  posed) → data-made-visual → property (Phase 2).
- **Explicitly avoid** Strip imagery, casinos, neon-at-night — anything that
  reads "visiting" rather than "living."
- **Files live in `/public/images/`** with descriptive filenames (e.g.
  `hero/summerlin-fox-hill-park-red-rock-aerial-drone.webp`). Never hotlink.
- Real photos ship as `.webp` via `next/image`; neutral stand-ins are plain
  `.jpg` files that get overwritten in place when a real shot lands.

**Real photography already in place:**
`hero/summerlin-drone-overlook-golden-hour.webp`,
`hero/summerlin-fox-hill-park-red-rock-aerial-drone.webp`,
`features/summerlin-fourth-of-july-parade-banner.webp`,
`team/mikey-del-rosario.webp`, and the three compliance logos.
Everything else in `/public/images/` (neighborhood-*, guide-*, video-*,
breathing-*, resident-voice-backdrop) is still a neutral placeholder — see
[`public/images/README.md`](../public/images/README.md).

---

## Editorial Standards

- **Honesty over sales.** Every guide names who a place *isn't* for and points
  readers elsewhere when it's not a fit (see the Summerlin "Who it might not be"
  block). Authority comes from useful local information, not adjectives like
  "luxury" or "exclusive."
- **Do not fabricate.** Never invent testimonials, resident quotes, legal
  copy, MLS data, pricing, stats, or market claims. If real content isn't
  available, leave it clearly unfinished or ask. (This is why the two
  spec'd Resident Voice interludes were **not built** — see Known Notes.)
- **Never change** brokerage / legal / license / Equal Housing / compliance copy
  unless explicitly instructed.
- **Real bylines and dates** on content. Mikey is the named human voice;
  editorial pieces are "LVINIT Editorial." Transparent methodology for any
  ranking or comparison.
- **Two separate trust systems** (Doc 02 §19): editorial trust (real authorship,
  dates) and regulatory trust (license, fair housing, brokerage disclosure) —
  kept visually distinct so neither is dressed up as the other.

---

## SEO Standards

- **Per-page metadata** via the App Router `metadata` export (title,
  description, canonical). Root defaults + `metadataBase` in `app/layout.tsx`.
- **Open Graph + Twitter cards.** Site-wide default OG image
  (`/og-image.jpg`, 1200×630); article pages set `type: "article"` with their
  own OG/Twitter image (e.g. the parade banner).
- **Canonical URLs** on every page (`alternates.canonical`).
- **Structured data (JSON-LD):** the parade feature ships `Article` +
  `BreadcrumbList` via `@graph`. No `Event` schema (we don't publish a
  fabricated date/route — copy points to the official calendar instead). Extend
  this pattern to future features/guides.
- **`sitemap.ts`** is hand-maintained — **add each new page's URL** with an
  appropriate `changeFrequency`/`priority` when you ship it.
- **`robots.ts`** allows all and points to the sitemap.
- **Accessibility doubles as SEO:** descriptive alt text on every image, one H1
  per page, H2 per section, semantic landmarks, skip link, visible focus rings.

---

## Internal Linking Strategy

The goal is discoverable **content clusters** around each neighborhood, with
links flowing both up (feature → guide → homepage) and down (guide → feature).

- Homepage `NeighborhoodDiscovery` and `LocalGuides` feature and link to the
  live Summerlin guide and the parade feature.
- The Summerlin guide links **down** to the parade feature (twice: a hero-style
  card and a "Related Summerlin Stories" cluster) and **out** to `/search` and
  `/contact`.
- The parade feature links **up** to the Summerlin guide (multiple contextual
  links), and across to `/search`, `/contact`, and the homepage compare anchor.
- **Only real, live pages are linked.** "Coming soon" cluster items (Downtown
  Summerlin, Fox Hill Park) are rendered as non-links until their pages exist —
  no dead internal links.
- Breadcrumb JSON-LD reinforces the Home → Summerlin → Feature hierarchy.

---

## Completed Features

- Phase 1 homepage — all 12 assembled sections, responsive, accessible.
- Design system implemented as Tailwind tokens traceable to Doc 02.
- Summerlin neighborhood guide with real drone photography.
- Summerlin Fourth of July Parade editorial feature (JSON-LD, embedded video).
- Live IDX search page (Matrix / GLVAR).
- Contact form with Resend handler + mailto fallback + GA4 lead event.
- GA4 analytics scaffolding (opt-in via env var).
- `robots.ts`, `sitemap.ts`, per-page metadata, OG/Twitter cards.
- Footer compliance block (license, brokerage-of-record, Equal Housing, REALTOR®).

---

## Current Content Clusters

1. **Summerlin cluster** (the only real cluster today):
   - `/neighborhoods/summerlin` — the pillar guide
   - `/neighborhoods/summerlin/fourth-of-july-parade` — lifestyle feature
   - *Planned children:* Downtown Summerlin, Fox Hill Park (marked "coming soon")

All other homepage guide/video cards are placeholders that do not yet resolve to
pages.

---

## Future Neighborhood Pages

Build order follows the current priority and existing `neighborhoods[]` data:

1. **Henderson** — *the next major content pillar* (this sprint). Green Valley
   sits inside/adjacent to the Henderson story, so decide early whether Green
   Valley is its own pillar or a section within Henderson.
2. Downtown Arts District (the walkable, up-and-coming counterpoint).
3. Green Valley.
4. Lake Las Vegas.
5. Four Seasons / high-rise living (appears in the contact form's area list;
   a current stated content priority).

Each should follow the Summerlin guide's shape: real hero photo, honest "beats,"
a "who it's / isn't for" block, a related-stories cluster (real links only), a
gentle contact CTA, canonical + OG metadata, and a sitemap entry. A dedicated
**Neighborhood Profile page spec** is the logical next design doc (per Doc 03 §8).

---

## New Page Checklist

Run through this every time a new page ships, in order:

- [ ] **Add route** — create `app/<path>/page.tsx` (reuse `Navbar`, `Footer`,
      `Container`, `ui/Button`; do not change site design).
- [ ] **Add metadata** — `title`, `description`, and
      `alternates.canonical`; add Open Graph / Twitter (and JSON-LD for
      articles/features) matching the parade-feature pattern.
- [ ] **Add sitemap entry** — append the URL to `app/sitemap.ts` with a sensible
      `changeFrequency` / `priority` (the sitemap is manual).
- [ ] **Add internal links** — link the new page into its content cluster both
      ways (pillar ↔ feature, homepage where relevant). Link only real, live
      pages — no dead links.
- [ ] **Verify build** — `npm run build` passes clean (no type/lint errors).
- [ ] **Verify mobile** — check the layout at a mobile breakpoint in the browser
      preview, not just desktop.
- [ ] **Confirm no fake stats/testimonials** — every figure is real and
      checkable; no fabricated quotes or metrics (leave clearly unfinished or ask
      instead).
- [ ] **Confirm CTA paths work** — every button/link resolves to a real
      destination (`/contact`, `/search`, cluster pages), no `href="#"`
      placeholders shipped as if functional.

---

## Future Lifestyle Content

- Neighborhood lifestyle features in the parade mold (events, parks, trails,
  local traditions) — one strong cluster child per pillar neighborhood.
- The four homepage guides currently shown as placeholder cards need real
  articles before their cards should link anywhere:
  *Summerlin vs. Henderson*, *What It Costs to Live in Las Vegas in 2026*,
  *A Local's Guide to the Downtown Arts District*, *Surviving Your First Vegas Summer*.
- Real produced videos to replace the four placeholder posters (topics already
  framed around real doubts: affordability, heat, rent-vs-buy, schools).
- A **Relocation Hub** ("Moving to Las Vegas") landing destination for the
  quick-facts index (Cost of Living, Getting Around, Schools & Family, Climate).

---

## Technical Stack

- **Next.js** `^14.2.5` (App Router, React Server Components)
- **React** `^18.3.1` / **React DOM** `^18.3.1`
- **TypeScript** `^5.5.4`
- **Tailwind CSS** `^3.4.7` (+ `postcss`, `autoprefixer`)
- **Resend** `^6.17.1` (contact email)
- **ESLint** `^8.57.0` + `eslint-config-next`
- Fonts via `next/font/google` (Playfair Display, Inter)
- **Hosting:** Vercel · **Source:** GitHub
- **External embeds:** Matrix IDX (GLVAR MLS), YouTube (nocookie)

**Scripts:** `npm run dev` · `npm run build` · `npm run start` · `npm run lint`.

---

## Environment Variables

All optional — the site runs without them (see `.env.example`). Set in Vercel
(Settings → Environment Variables).

| Var | Purpose | Behavior when unset |
|---|---|---|
| `RESEND_API_KEY` | Contact-form email sending | `/api/contact` returns 503 → form falls back to a mailto draft |
| `CONTACT_FROM_EMAIL` | Verified Resend sender | Defaults to `LVINIT <hello@lvinit.com>` |
| `CONTACT_TO_EMAIL` | Where leads land | Defaults to `hello@lvinit.com` |
| `NEXT_PUBLIC_GA_ID` | GA4 Measurement ID (`G-XXXX…`) | Analytics simply doesn't load |

---

## Pending Work

Placeholder content that must be replaced before it can be considered "done"
(flagged in `lib/content.ts`, the READMEs, and inline comments):

- **`lib/content.ts` metrics** — median price, walk score, commute, school
  ratings for all neighborhoods are illustrative, not verified.
- **The "27" emotional numeral** (`MovingToLasVegas`) — needs a real, checkable
  commute figure.
- **Placeholder guide + video cards** (`LocalGuides` secondary, `Videos`) — need
  real articles/videos and real destination pages before they link out.
- **Neutral photo placeholders** in `/public/images/` — replace in place with
  real Mikey photography (keep filenames).
- **Newsletter** — no backend; wire to a real provider or serverless function.
- **Footer legal links** — Privacy / Terms / Accessibility are `href="#"`.

---

## Roadmap

**Now (this sprint):** Henderson neighborhood guide — the next major content
pillar. (Awaiting plan approval before any code.)

**Next:**
- Neighborhood Profile page spec (design doc) to standardize guide structure.
- Remaining neighborhood pages (Downtown Arts District, Green Valley, Lake Las
  Vegas, Four Seasons/high-rise).
- Real guide articles + real videos; wire up their cards.
- Relocation Hub landing.
- Replace remaining placeholder photography and all placeholder metrics.
- Wire the newsletter; add real legal pages.

**Phase 2 (out of scope for Phase 1, per Doc 02/03 §7):** MLS-style property
search as a primary job, property listing cards, agent directory, accounts/login.

---

## Known Technical Notes

- **Spec vs. build divergence (important).** `docs/03-homepage-spec.md` specifies
  a swipeable **Journey** carousel, a filterable **Grid** with lifestyle chips,
  and two **Resident Voice** interludes. The shipped homepage does **not** build
  these: `NeighborhoodDiscovery` is a simpler editorial list (featured Summerlin +
  text snapshot of the rest), and the Resident Voice sections were intentionally
  omitted rather than ship fabricated quotes (content-integrity guardrail, Doc 03
  §5). The README's component list is stale as a result. This is a deliberate,
  honesty-driven simplification, not a bug — but keep it in mind when reconciling
  the spec against the code.
- **No `next.config` image domains** — all images are local, so none are needed.
- **IDX/MLS is compliance-sensitive.** Keep the Matrix embed behavior as-is
  (`app/search/page.tsx`, `idx=3652dd5`). Do not modify without explicit
  instruction.
- **Sitemap is manual.** New pages won't appear in `sitemap.xml` unless added to
  `app/sitemap.ts`.
- **The footer compliance block is load-bearing** (Doc 03 §3.16). Don't remove or
  visually diminish it, and don't touch license/brokerage/Equal-Housing copy.
- **Reduced motion** is honored globally via `globals.css` and `motion-reduce:`
  utilities — preserve this in any new animated component.
- **`ImagePlaceholder`/`VideoPlaceholder`** intentionally use a raw `<img>` (with
  an eslint-disable) for placeholder assets; real hero/feature imagery uses
  `next/image`.

---

*Keep this document current. After each sprint, update Existing Pages, Existing
Neighborhoods, Completed Features, Content Clusters, Pending Work, and Roadmap.*
