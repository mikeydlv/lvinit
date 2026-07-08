# Story Page Standard

> The authoring standard for every LVINIT **story** — original lifestyle
> features, events, attractions, and local experiences. LVINIT will publish
> dozens of these; this document + the `components/story/` building blocks make
> every one share the same structure, spacing, and integrity rules.
>
> The pattern was **extracted from** the shipped Summerlin guide and the
> Summerlin Fourth of July Parade feature. It changes neither. New stories should
> use these components; the two original pages are left exactly as they are.
>
> **Related docs:** [PROJECT_STATE.md](PROJECT_STATE.md) ·
> [02 — Visual Design System](02-visual-design-system.md) ·
> [03 — Homepage Spec](03-homepage-spec.md)

---

## 1. What a "story" is

A single, focused editorial piece attached to a place — a neighborhood, a
community, an event. Not a neighborhood *pillar* guide (those are their own
thing), and not a listings page. A story reduces a reader's uncertainty by
showing them what somewhere is actually like.

Examples: the Fourth of July Parade feature; future pieces like "Four Seasons
Private Residences," "Green Valley Ranch," "First Friday in the Arts District."

---

## 2. The building blocks

All live in `components/story/` and are exported from one barrel:

```tsx
import {
  StoryPage, StoryLede, StorySection, StoryVideo,
  StoryPullQuote, StoryGallery,
} from "@/components/story";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
```

| Block | Role |
|---|---|
| `StoryPage` | Wrapper: nav, footer, hero, breadcrumbs, related, CTAs, and JSON-LD. The editorial body is its `children`. |
| `StoryHero` | Hero — category kicker, headline, subheadline, optional back-link + CTAs. Dark-over-photo, or bright editorial hero when there's no photo yet. |
| `StoryBreadcrumbs` | Visible breadcrumb trail at the top of the article (auto-rendered by `StoryPage`). |
| `StoryLede` | Opening paragraph with the drop cap + optional kicker rule. |
| `StorySection` | The workhorse: a titled section in the reading column. `paragraphs` for simple copy, `children` for rich content. `muted` for a Light-Gray beat. |
| `StoryVideo` | Optional YouTube embed (nocookie, lazy, no autoplay). |
| `StoryPullQuote` | Playfair-italic pull quote with a blue rule. |
| `StoryGallery` | 1- or 2-column figure gallery with captions. |
| `RelatedStories` | Content-cluster grid — real links + honest "coming soon" cards. |
| `RelatedNeighborhood` | The "up" link back to the parent neighborhood guide. |
| `StoryCTAs` | Closing Light-Gray band carrying the Contact + Search Homes CTAs. |

`lib/story.ts` holds the shared `StoryMeta` type and the
`buildStoryMetadata()` / `buildStoryJsonLd()` helpers.

---

## 3. Canonical structure & order

Every story follows this vertical order. `StoryPage` fixes the top and tail; you
compose the middle (the ★ blocks) as `children`.

1. **Global nav** (from `StoryPage`)
2. **Hero** — category · headline · subheadline · optional CTA(s)
3. **Breadcrumbs** — Home → Neighborhood → Story
4. ★ **Lede** — kicker + drop-cap opening, ideally with one in-context link to the parent guide
5. ★ **Video** *(optional)* — right after the lede if the story has one
6. ★ **Body sections** — titled `StorySection`s; drop in a pull quote, an image, or a gallery between them
7. ★ **Gallery** *(optional)* — a dedicated photo set, or inline figures within sections
8. ★ **"Why this matters" beat** *(optional)* — a single `muted` section
9. **Related Stories** — the content cluster
10. **Related Neighborhood** — the "up" link
11. **Closing CTAs** — Contact + Search Homes
12. **Footer + JSON-LD** (from `StoryPage`)

**Pacing:** alternate texture — don't stack three dense sections without a
lighter beat (photo, pull quote, muted band) between them. This mirrors the
homepage's pacing discipline (Doc 03 §4).

---

## 4. Layout & spacing

- **Page frame:** `Container` (max-width 1440px, responsive gutters) wraps every
  block. Never place raw content outside a `Container`.
- **Reading column:** body text is capped at **680px** (`max-w-[680px]`,
  centered). The video and 2-up gallery widen to **900px**. Full-bleed is
  reserved for the hero.
- **Vertical rhythm:** sections use `py-16 sm:py-20` (muted bands and the lede
  use `py-16 sm:py-24`). Paragraph spacing is `mt-5`/`mt-6`. Don't invent new
  spacing values — all of these come from the Doc 02 scale (`4,8,12,16,24,32,48,
  64,96…`).
- **Dividers:** hairline `border-lvinit-lightgray` at the top of Related Stories
  / Related Neighborhood; a `border-lvinit-black` top rule on linked cluster
  cards.
- **Anchors:** sections carry `scroll-mt-24` so a heading clears the fixed nav
  when linked to (e.g. a hero "Watch" button → `#watch`).

---

## 5. Typography

Straight from Doc 02 — no new sizes.

- **Headline (`h1`):** Playfair Black, `text-[40px]` mobile → `text-display`
  desktop.
- **Section headings (`h2`):** Playfair Bold, `text-heading-sm sm:text-heading`.
- **Card headings (`h3`):** Playfair Bold, `text-subhead`.
- **Body:** Inter, `text-body-lg` (lede/sections) or `text-body` (captions,
  cards), color `text-lvinit-warmgray`; lead sentence in `text-lvinit-black`.
- **Kickers/labels/breadcrumbs:** Inter, `text-caption uppercase tracking-wide`,
  Warm Gray (or Scofield Blue when it's a category label).
- **Pull quote:** Playfair *italic*, `text-subhead sm:text-heading-sm`.
- **Drop cap:** the first letter of the lede only (`StoryLede` handles it).
- Numerals, if any, are Inter tabular figures. Playfair never appears below 24px
  or in UI/labels.

---

## 6. Image rules

- **Hero:** one strong, real, landscape image via `next/image` with `priority`
  and `sizes="100vw"`; the component adds the dark gradient for legibility. **If
  no real hero photo exists yet, omit `image`** — `StoryHero` renders a bright,
  honest editorial hero instead. Never ship a fabricated or AI stand-in as a
  hero.
- **In-body figures & galleries:** `next/image`, consistent **3:2** crop,
  `object-cover`, Light-Gray placeholder fill. Provide real `sizes`.
- **Formats & files:** real photos as `.webp` under `/public/images/…` with
  descriptive, kebab-case filenames (e.g.
  `features/green-valley-ranch-district-evening.webp`). Never hotlink.
- **Captions:** short, specific, sensory; caption type ramp, Warm Gray.

---

## 7. Photography guidelines

Per Doc 02 §8 and the project imagery rules:

- **Real, Mikey-owned photography** unless explicitly noted otherwise. A global
  footer credit covers all original imagery, so individual shots aren't credited
  on-image (the hero may carry a discreet `title` credit).
- Place-and-life first: neighborhoods, streets, people *living* (documentary,
  not posed). **No** Strip/casino/neon imagery, **no** HDR or AI-looking edits,
  **no** generic stock.
- Keep a consistent, natural grade across a story's images.
- Until a real photo exists, leave the slot empty/honest rather than filling it
  with a fake — the hero's photoless mode and the gallery's "real images only"
  rule both enforce this.

---

## 8. SEO

Drive everything from one `StoryMeta` object and the helpers — the page `<title>`
metadata and the schema then can't drift apart.

```tsx
const meta: StoryMeta = {
  title: "Green Valley Ranch — A Local Feature | LVINIT", // full <title>, brand included
  headline: "Green Valley Ranch",                          // clean, used for OG + schema
  description: "…",                                         // ~150–170 chars, specific
  path: "/neighborhoods/henderson/green-valley-ranch",     // canonical, root-relative
  image: "/images/features/green-valley-ranch-….webp",     // omit if none yet
  imageWidth: 1774, imageHeight: 887, imageAlt: "…",
  datePublished: "2026-07-08",                             // real dates only
  author: "Mikey Del Rosario",                             // or "LVINIT Editorial"
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Henderson", path: "/neighborhoods/henderson" },
    { name: "Green Valley Ranch", path: "/neighborhoods/henderson/green-valley-ranch" },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);
```

`buildStoryMetadata` produces the title, description, canonical, Open Graph
(`type: "article"`), and Twitter card. OG/Twitter images are only set when a real
`image` is provided.

**Also:** add the story's URL to `app/sitemap.ts` (manual sitemap), keep exactly
one `h1`, and write a genuinely descriptive `description`.

---

## 9. Schema (JSON-LD)

`StoryPage` injects `buildStoryJsonLd(meta)` automatically — an `@graph` with:

- **`Article`** — headline, description, author (Person), publisher
  (Organization, LVINIT), `mainEntityOfPage`, and — *only when provided* —
  `image`, `datePublished`, `dateModified`.
- **`BreadcrumbList`** — built from `meta.breadcrumbs`, matching the visible
  trail.

We deliberately **don't** emit `Event` schema with invented dates/routes, or any
rating/price data we haven't sourced. If a story genuinely warrants `Event` (a
real, dated, verifiable event), add it explicitly and truthfully — don't
fabricate to satisfy a schema.

---

## 10. Internal linking

- **Down + up:** every story links **up** to its parent neighborhood
  (`RelatedNeighborhood`), and the parent guide should link **down** to the story
  once it's live.
- **Across:** `RelatedStories` connects siblings in the same cluster.
- **In-context:** put at least one contextual link to the parent guide inside the
  lede or an early section (not just in the footer cluster).
- **Only link real pages.** Unbuilt stories render as non-linked "coming soon"
  cards — `RelatedStories` does this when you omit `href`. No dead internal
  links, ever.
- When a story ships, **flip its cluster card(s) elsewhere to real links** and
  add it to the sitemap (New Page Checklist in PROJECT_STATE.md).

---

## 11. Accessibility

- Landmarks: `StoryPage` provides `<main id="main-content">` and `<article>`;
  the skip link and focus rings are global.
- One `h1`; sections descend h2 → h3 in order.
- **Every image needs genuinely descriptive alt text** (required prop on gallery
  images; pass `imageAlt` on the hero).
- Breadcrumbs use `<nav aria-label="Breadcrumb">` + `aria-current="page"`.
- Video: accurate iframe `title`; **no autoplay, no sound**; provide captions/a
  transcript for produced video (Doc 02 §20).
- Color is never the only signal; interactive = Scofield Blue, with visible
  focus states. Touch targets ≥ 44px (the shared `Button` already satisfies
  this).
- Motion stays within the global reduced-motion rules; stories add no
  scroll-linked effects.

---

## 12. CTA placement

- **Hero CTAs (optional):** at most one or two — a primary (e.g. "Watch",
  jumping to `#watch`) and a tertiary (e.g. "Explore {Neighborhood}"). Keep the
  hero calm; it's not the conversion moment.
- **Closing CTAs (required):** `StoryCTAs` carries the two standing calls —
  **Contact** (`/contact`) and **Search Homes** (`/search`) — as a quiet
  Light-Gray band. Both appear on every story. A third contextual tertiary link
  (e.g. back to the pillar guide) is fine.
- Tone: helpful, never a hard sell. No fake urgency, no "luxury/exclusive"
  adjectives.

---

## 13. Content integrity (non-negotiable)

The same rules that govern the whole platform, restated where stories are most
tempted to break them:

- **No fabricated quotes.** An attributed `cite` on a pull quote, or any resident
  testimonial, must be a real, sourced line someone actually said. Un-attributed
  editorial pull quotes are fine.
- **No invented stats, prices, ratings, dates, or routes.** Use cautious,
  qualitative language; where a real figure isn't available, leave it out or ask.
- **No fake imagery.** See §6–§7.
- **Don't touch** brokerage/legal/compliance copy (it lives in the footer).
- If something real isn't ready, ship it **clearly unfinished** (photoless hero,
  coming-soon card) rather than faked.

---

## 14. Minimal example

```tsx
import type { Metadata } from "next";
import { buildStoryMetadata, type StoryMeta } from "@/lib/story";
import { StoryPage, StoryLede, StorySection, StoryPullQuote } from "@/components/story";

const meta: StoryMeta = {
  title: "Green Valley Ranch — A Local Feature | LVINIT",
  headline: "Green Valley Ranch",
  description: "…",
  path: "/neighborhoods/henderson/green-valley-ranch",
  breadcrumbs: [
    { name: "Home", path: "/" },
    { name: "Henderson", path: "/neighborhoods/henderson" },
    { name: "Green Valley Ranch", path: "/neighborhoods/henderson/green-valley-ranch" },
  ],
};

export const metadata: Metadata = buildStoryMetadata(meta);

export default function Page() {
  return (
    <StoryPage
      meta={meta}
      hero={{
        category: "Henderson · A Local Feature",
        headline: "Green Valley Ranch",
        subheadline: "…",
        // image: "/images/features/…webp",  // omit until a real photo exists
        backLink: { label: "Henderson", href: "/neighborhoods/henderson" },
      }}
      relatedStories={{ stories: [/* … real links or coming-soon … */] }}
      relatedNeighborhood={{ name: "Henderson", href: "/neighborhoods/henderson" }}
      ctas={{ heading: "Thinking about Green Valley Ranch?" }}
    >
      <StoryLede kicker="Henderson · A Local Feature" lead="…" />
      <StorySection heading="The setting" paragraphs={["…", "…"]} />
      <StoryPullQuote>…</StoryPullQuote>
      <StorySection heading="Why it says something about Henderson" muted paragraphs={["…"]} />
    </StoryPage>
  );
}
```

---

## 15. Building a new story — checklist

Use alongside the **New Page Checklist** in PROJECT_STATE.md:

- [ ] Route at `app/…/page.tsx`; compose with `StoryPage` + blocks.
- [ ] `StoryMeta` filled; `export const metadata = buildStoryMetadata(meta)`.
- [ ] Breadcrumbs: Home → Neighborhood → Story.
- [ ] Hero: real photo *or* photoless mode (never a fake).
- [ ] Body: lede → sections, paced with a quote/photo/muted beat.
- [ ] Related Stories + Related Neighborhood wired (real links only).
- [ ] Closing CTAs: Contact + Search Homes.
- [ ] Sitemap entry added.
- [ ] No fabricated stats, quotes, or imagery.
- [ ] `npm run build` clean; verify desktop **and** mobile.
