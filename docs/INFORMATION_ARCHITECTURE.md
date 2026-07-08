# Information Architecture

> How LVINIT is organized today, and the plan for scaling it from a handful of
> pages into a premium Las Vegas relocation publication (hundreds of pages)
> without losing its calm, editorial clarity.
>
> **This document is strategy, not implementation.** Nothing here changes a page,
> a design, or a line of copy. Every "recommendation" below is a proposal to be
> scheduled and approved separately. Where it says *missing* or *fix*, that work
> has **not** been done yet.
>
> **Related docs:** [PROJECT_STATE.md](PROJECT_STATE.md) ·
> [STORY_PAGE_STANDARD.md](STORY_PAGE_STANDARD.md) ·
> [02 — Visual Design System](02-visual-design-system.md) ·
> [03 — Homepage Spec](03-homepage-spec.md)
>
> **Last updated:** 2026-07-08

---

## 1. Current architecture

### 1.1 Routes that exist today

| URL | Type | Notes |
|---|---|---|
| `/` | Homepage | 12 assembled sections; the de-facto hub for everything |
| `/neighborhoods/summerlin` | Neighborhood pillar | First full guide |
| `/neighborhoods/summerlin/fourth-of-july-parade` | Story (feature) | Place-nested under its neighborhood |
| `/neighborhoods/henderson` | Neighborhood pillar | Second pillar; 7-community roster, 4 coming-soon stories |
| `/search` | Utility | Matrix IDX (GLVAR) embed |
| `/contact` | Utility | Lead form |
| `/robots.txt`, `/sitemap.xml` | Machine | `robots.ts`, hand-maintained `sitemap.ts` |

Six real content/utility pages. The information architecture is currently
**homepage-centric**: most "sections" are anchors on `/`, not standalone routes.

### 1.2 Primary navigation (`components/Navbar.tsx`)

- **Links:** Neighborhoods `#neighborhoods` · Guides `#guides` · Compare
  `#compare` · Videos `#videos` · Moving to Las Vegas `#moving-to-las-vegas`
- **Utility:** Search Homes → `/search`
- **Logo:** → `/` (home)

### 1.3 Footer navigation (`components/Footer.tsx`)

- **Explore:** the same five homepage anchors as the primary nav
- **Company:** About `#meet-your-guide` · Meet Your Guide `#meet-your-guide` ·
  Contact `/contact`
- **Legal:** Privacy Policy `#` · Terms of Use `#` · Accessibility `#` *(all dead
  placeholders)*
- Compliance block (Scofield Group, license, Equal Housing, REALTOR®)

### 1.4 Homepage anchors (targets for the nav)

`#neighborhoods`, `#compare`, `#moving-to-las-vegas`, `#videos`, `#guides`,
`#meet-your-guide` — all present on `/`.

### 1.5 Findings (structural, today)

1. **Nav is homepage-scoped.** Primary/footer links use *bare* anchors
   (`#guides`), so they only work on `/`. On a subpage (e.g.
   `/neighborhoods/henderson`) they resolve against the current URL, find no such
   anchor, and effectively do nothing. Contrast the Summerlin page's back-link,
   which correctly uses a *cross-page* anchor `"/#neighborhoods"`.
2. **No section index pages.** "Neighborhoods," "Guides," and "Videos" are
   homepage sections, not landing routes — there is nowhere to send a visitor who
   wants "all neighborhoods" or "all guides."
3. **No taxonomy for content types or facets.** There is no home for Lifestyle,
   Things To Do, Events, New Construction, Luxury, or Communities as first-class
   sections yet.
4. **Dead legal links.** Privacy / Terms / Accessibility are `#`.
5. **One-way cluster link.** Henderson → Summerlin exists; Summerlin → Henderson
   does not (see §3).

None of these are urgent at 6 pages. All of them become blocking at 60+.

---

## 2. Future architecture

LVINIT's content is **multi-faceted**: some things are *places* (Neighborhoods,
Communities), some are *content types* (Guides, Lifestyle, Things To Do, Events,
Videos), and some are *market lenses* (New Construction, Luxury). A URL path can
only express one primary hierarchy; the rest must be cross-cutting hubs. The
scalable model:

- **The place spine (URL parent of place pages):** `/neighborhoods/…`
  Neighborhood pillars and the communities inside them. This is the backbone
  because LVINIT is a *place-first* publication.
- **Content-type sections (URL parent of editorial):** `/guides`, `/lifestyle`,
  `/things-to-do`, `/events`, `/videos` — each a section index with story pages
  beneath it. New editorial lives here by default and is *cross-linked* into the
  relevant place cluster.
- **Facet hubs (aggregators, not URL parents):** `/new-construction`, `/luxury`,
  `/communities` — curated landing pages that *collect* place + editorial pages
  by tag. A luxury community (e.g. MacDonald Highlands) still *lives* under its
  neighborhood; `/luxury` simply surfaces it.

This keeps every page in exactly one canonical location while letting it appear
in as many hubs as it earns — the standard fix for multi-facet IA.

### 2.1 Section model

| Section | Kind | Canonical home | Example page |
|---|---|---|---|
| Neighborhoods | Place spine | `/neighborhoods` | `/neighborhoods/henderson` |
| Communities | Facet hub | `/communities` (hub) | lives at `/neighborhoods/henderson/green-valley-ranch` |
| Guides | Content type | `/guides` | `/guides/cost-of-living-in-las-vegas` |
| Lifestyle | Content type | `/lifestyle` | `/lifestyle/first-friday-arts-district` |
| Things To Do | Content type | `/things-to-do` | `/things-to-do/red-rock-scenic-drive` |
| Events | Content type | `/events` | `/events/summerlin-patriotic-parade` |
| Videos | Content type | `/videos` | `/videos/is-las-vegas-affordable` |
| New Construction | Facet hub | `/new-construction` | collects new-build communities + guides |
| Luxury | Facet hub | `/luxury` | collects high-end communities + stories |

---

## 3. Internal linking audit

Current internal links (real routes only; homepage anchors excluded):

| From | Links to |
|---|---|
| Homepage | Summerlin guide, Henderson guide, parade feature, `/search`, `/contact` |
| Summerlin guide | parade feature (×2), `/search`, `/contact`, `/#neighborhoods` |
| Parade feature | Summerlin guide (×several), `/search`, `/contact`, `/#neighborhoods` |
| Henderson guide | Summerlin guide, `/search`, `/contact`, `/#neighborhoods` |

### 3.1 Missing / recommended links (NOT yet implemented)

Ordered by value. All are recommendations — do not action from this doc alone.

1. **Summerlin guide → Henderson guide.** The Summerlin page tells readers "other
   neighborhoods fit you better — and I'll point you to them," but never links
   Henderson. Make the cluster link bidirectional (mirror Henderson's existing
   "Weighing the west side?" card).
2. **Real section index routes** for the nav's targets, so nav works off the
   homepage: `/neighborhoods` at minimum, then `/guides`, `/videos` as those fill
   in. Until they exist, subpage nav clicks silently fail.
3. **Convert bare nav anchors to cross-page anchors or routes.** `#guides` →
   `/#guides` (works everywhere) as a stopgap, then `/guides` (a real page) at
   scale.
4. **Neighborhood pillars → their communities**, once community pages exist
   (Henderson's roster is text-only today; Green Valley Ranch etc. become links
   when built). Use the Story/Related components' "real links only" rule.
5. **Homepage guide/video cards → real pages.** `LocalGuides` secondary cards and
   `Videos` thumbnails are placeholders that resolve nowhere; wire them when the
   destination pages exist.
6. **Legal pages** (`/privacy`, `/terms`, `/accessibility`) to replace the footer
   `#` links.
7. **Cross-neighborhood "compare" entry** from pillar pages to the Compare tool
   (currently a homepage section only).

### 3.2 Linking rules that are already right (keep)

- Contact and Search are reachable from every page — correct (utilities should be
  omnipresent, visually subordinate).
- Unbuilt destinations render as non-linked "coming soon" cards — **never a dead
  internal link.** This is the standing rule (see `RelatedStories`); it must
  survive scaling.

---

## 4. URL conventions

Lowercase, hyphenated, no trailing slash, human-readable, stable (URLs are
permanent contracts — never rename a shipped one; redirect instead).

| Page type | Pattern | Example |
|---|---|---|
| Homepage | `/` | `/` |
| Neighborhood index | `/neighborhoods` | `/neighborhoods` |
| Neighborhood pillar | `/neighborhoods/{neighborhood}` | `/neighborhoods/henderson` |
| Community (within a neighborhood) | `/neighborhoods/{neighborhood}/{community}` | `/neighborhoods/henderson/green-valley-ranch` |
| Content-type index | `/{type}` | `/guides`, `/lifestyle`, `/events`, `/videos`, `/things-to-do` |
| Story / feature | `/{type}/{slug}` | `/events/summerlin-patriotic-parade` |
| Facet hub | `/{facet}` | `/luxury`, `/new-construction`, `/communities` |
| Legal | `/{slug}` | `/privacy`, `/terms`, `/accessibility` |

### 4.1 The place-nested story exception

The parade lives at `/neighborhoods/summerlin/fourth-of-july-parade` — a story
nested under its neighborhood. That URL **stays** (shipped URLs are permanent).

**Going forward, prefer content-type namespaces** (`/events/{slug}`,
`/lifestyle/{slug}`) for new stories, and cross-link them into the neighborhood
cluster via `RelatedStories` / `RelatedNeighborhood`. Rationale: type namespaces
give every story a clean section index, keep neighborhood paths reserved for
*places*, and prevent a neighborhood folder from ballooning with mixed children.

**Rule of thumb for a new story's home:**
- Bound to a dated happening → `/events/{slug}`
- An activity/attraction → `/things-to-do/{slug}`
- Evergreen how-to/relocation → `/guides/{slug}`
- A place's texture/culture → `/lifestyle/{slug}`
- A place *itself* → it's a Community or Neighborhood, under `/neighborhoods/…`

### 4.2 Slugs

Descriptive and durable; avoid dates in slugs (put dates in content/metadata) so
an annual event's page can persist year to year (matches how the parade page
points at the live calendar rather than baking in a date).

---

## 5. Navigation hierarchy

### 5.1 Now (≤ ~15 pages) — low-risk, incremental

Keep the current 5-item nav. Two safe improvements when scheduled:

- Make nav targets **cross-page** (`/#neighborhoods` etc.) or point the first
  ones at real index routes as they ship, so nav stops silently failing on
  subpages.
- Add `/neighborhoods` as the first real index route; point "Neighborhoods" at it.

Primary order stays per Doc 02 §14 (Neighborhoods first; Search Homes a
subordinate utility, never a loud CTA).

### 5.2 Mid (~15–50 pages)

Promote sections from homepage anchors to real routes as they earn a landing
page. Likely nav:

`Neighborhoods · Guides · Lifestyle · Videos · Moving to Las Vegas`
(+ Search Homes utility)

"Compare" moves from a top-level nav slot to a prominent module on
`/neighborhoods` and each pillar, since it's a tool, not a section.

### 5.3 Scale (~100 pages) — see §9 for the full mega-menu

Primary nav caps at ~5 top-level items with a mega-menu; facets (Luxury, New
Construction, Events, Communities) surface inside the menu and via hubs, not as
top-level competitors. The nav's job is orientation, not exhaustiveness.

---

## 6. Breadcrumb strategy

Breadcrumbs are already modeled in code: `StoryMeta.breadcrumbs` drives both the
visible `StoryBreadcrumbs` trail and the `BreadcrumbList` JSON-LD
(`lib/story.ts`). Standardize the trail per page type:

| Page type | Breadcrumb trail |
|---|---|
| Neighborhood pillar | Home → Neighborhoods → {Neighborhood} |
| Community | Home → Neighborhoods → {Neighborhood} → {Community} |
| Story (type-namespaced) | Home → {Type} → {Story} |
| Story (place-nested, legacy) | Home → {Neighborhood} → {Story} *(current parade pattern)* |
| Facet hub | Home → {Facet} |

Rules:
- The trail mirrors the **canonical URL path**, not the marketing hierarchy.
- Last crumb = current page, non-linked, `aria-current="page"` (already handled).
- Every breadcrumb ancestor must be a **real page** — don't render a crumb for a
  section index that doesn't exist yet. (So add `/neighborhoods` before adding a
  "Neighborhoods" crumb to pillar pages.)
- Visible trail and JSON-LD always match (guaranteed by using one `breadcrumbs`
  array).

---

## 7. Content clustering strategy

The model is **pillar → cluster**, with a hub layer on top:

- **Pillar** = a neighborhood guide (`/neighborhoods/{n}`). The authoritative,
  broad page for a place.
- **Cluster children** = communities, stories, and videos about that place. Each
  links **up** to the pillar (`RelatedNeighborhood`); the pillar links **down**
  to each child; siblings link **across** (`RelatedStories`).
- **Hubs** = section indexes (`/guides`, `/events`, …) and facet hubs
  (`/luxury`, `/new-construction`) that aggregate across clusters.

Each cluster should be **bidirectionally complete**: if the pillar names a child,
and the child page exists, both directions link. If the child doesn't exist yet,
it shows as "coming soon" (non-linked) on the pillar and is *not* promised
elsewhere. This is exactly how Summerlin ↔ parade and Henderson's roster already
behave — the strategy is to keep that discipline as volume grows.

SEO intent: concentrate topical authority on the pillar, funnel it through dense
internal linking, and let hubs provide the alternate (facet-based) paths a
place-based path can't.

---

## 8. Parent / child page relationships

| Page type | Parent | Children | Cross-links |
|---|---|---|---|
| Homepage | — | section indexes, featured pillars/stories | Search, Contact |
| Neighborhood index | Homepage | neighborhood pillars | Compare tool |
| Neighborhood pillar | Neighborhoods index | communities, place stories, videos | sibling neighborhoods, Search, Contact |
| Community | its neighborhood pillar | community stories (optional) | pillar, related communities, facet hubs |
| Content-type index | Homepage | stories of that type | related neighborhoods |
| Story / feature | its type index (or neighborhood, legacy) | — | parent neighborhood, related stories, Search, Contact |
| Facet hub | Homepage | *(aggregates; owns none)* | every page it tags |
| Utility (Search/Contact) | Homepage | — | linked from everywhere |
| Legal | Footer | — | — |

"Owns" (parent→child, breadcrumb, canonical path) is distinct from "references"
(cross-links, hub membership). A page has exactly one owner and many references.

---

## 9. Content relationship map

The requested top-down funnel — how a visitor flows toward a decision:

```
                          ┌─────────────┐
                          │  HOMEPAGE   │
                          └──────┬──────┘
                                 │
                 ┌───────────────┼───────────────┐
                 ▼               ▼                ▼
        ┌────────────────┐  ┌─────────┐   ┌──────────────┐
        │ NEIGHBORHOOD   │  │ VIDEOS  │   │ CONTENT-TYPE │
        │ GUIDES (pillar)│  │         │   │ INDEXES      │
        └───────┬────────┘  └────┬────┘   │ guides/      │
                │                │        │ lifestyle/   │
                ▼                │        │ events/ …    │
        ┌────────────────┐       │        └──────┬───────┘
        │ COMMUNITY PAGES│       │               │
        └───────┬────────┘       │               ▼
                │                │        ┌──────────────┐
                ▼                └───────▶│  LIFESTYLE / │
        ┌────────────────┐               │  STORIES     │
        │  FACET HUBS     │◀─────────────┤  (features)  │
        │ luxury/         │  (tagged)    └──────┬───────┘
        │ new-construction│                     │
        └────────┬────────┘                     │
                 │            every content page │
                 └───────────────┬──────────────┘
                                 ▼
                          ┌─────────────┐
                          │   SEARCH    │  (utility, omnipresent)
                          └──────┬──────┘
                                 ▼
                          ┌─────────────┐
                          │   CONTACT   │  (conversion, omnipresent)
                          └─────────────┘
```

But the *real* structure is a bidirectional graph, not a one-way funnel — this is
what keeps clusters connected and authority flowing:

```
   HOMEPAGE ◀──────────────────────────────────────────────┐
      │  ▲                                                   │
      ▼  │ (logo = home, on every page)                      │
 NEIGHBORHOOD PILLAR ◀────────────┐                          │
      │  ▲     ▲                  │ up-link                  │
 down │  │     └───────── sibling neighborhoods              │
      ▼  │                        │                          │
 COMMUNITY PAGE ──────────────────┘                          │
      │  ▲                                                   │
      ▼  │  across (related)                                 │
 LIFESTYLE / EVENT / STORY ◀──▶ VIDEOS                       │
      │        │                  │                          │
      │        └── tagged into ── FACET HUBS (luxury/new-con)│
      ▼                                                      │
   SEARCH ──▶ CONTACT ────────────────────────────────────▶─┘
   (utilities linked from every content page above)
```

Legend: **down** = pillar→child, **up** = child→pillar (`RelatedNeighborhood`),
**across** = sibling stories (`RelatedStories`), **tagged** = facet-hub
membership. Search and Contact are reachable from every content page.

---

## 10. Future menu structure (~100 pages)

At scale, a flat 5-link bar can't expose the catalog, and an exhaustive one
would betray the brand's restraint. Use a **calm mega-menu**: ~5 top-level
triggers, each opening a quiet, well-spaced panel. Facets and utilities live
inside panels, not as top-level shouting.

**Top-level (desktop):**
`Neighborhoods ▾   Guides ▾   Lifestyle ▾   Videos ▾   Moving to Las Vegas ▾`
with **Search Homes** as a subordinate utility at the right, per Doc 02 §14.

**Example panels:**

```
NEIGHBORHOODS ▾
  Featured: Summerlin · Henderson · Downtown Arts District
  By region: West Valley · Southeast (Henderson) · Downtown/Central · Lake Las Vegas
  Communities  →  /communities        Compare neighborhoods  →  (tool)
  All neighborhoods  →  /neighborhoods

GUIDES ▾
  Moving Here · Cost of Living · Schools & Family · Buying vs Renting
  New Construction  →  /new-construction
  All guides  →  /guides

LIFESTYLE ▾
  Things To Do  →  /things-to-do      Events  →  /events
  Food & Drink · Outdoors · Arts & Culture
  Luxury living  →  /luxury
  All stories  →  /lifestyle

VIDEOS ▾
  Featured film · Neighborhood tours · "Real talk" answers
  All videos  →  /videos

MOVING TO LAS VEGAS ▾
  Relocation Hub · Cost of Living · Getting Around · Climate · Schools
```

Principles at scale:
- **Cap top-level at ~5.** New sections join a panel, not the bar.
- **Facets (Luxury, New Construction, Events, Communities) are panel entries and
  hub pages**, never top-level competitors to the place spine.
- **Search Homes stays subordinate** until/unless Phase 2 elevates it.
- **Mobile:** the mega-menu collapses to the existing full-screen menu pattern
  (accordion sections), reusing today's `Navbar` mobile behavior — no new
  interaction model.
- **Footer becomes the full sitemap** (every section index + legal), the
  reliable "everything" surface so the header can stay minimal.

---

## 11. Future expansion recommendations

Sequenced so each step is non-breaking and independently shippable. **None are
done; each is a separate, approvable task.**

1. **Fix nav portability** — make the five nav targets cross-page (`/#…`) so they
   work off the homepage. (Small, high value.)
2. **Ship `/neighborhoods` index**, point "Neighborhoods" at it, add the
   Neighborhoods breadcrumb crumb to pillar pages.
3. **Close the Summerlin ↔ Henderson loop** (add the missing Summerlin→Henderson
   link).
4. **Stand up content-type indexes** as their libraries fill: `/guides`,
   `/videos`, then `/lifestyle` / `/events` / `/things-to-do`. Build stories on
   the Story Page pattern (`STORY_PAGE_STANDARD.md`).
5. **Introduce facet hubs** (`/luxury`, `/new-construction`, `/communities`) once
   there's enough tagged content to make a hub worth visiting (rule of thumb: ≥ 5
   qualifying pages before a hub earns its place — never a hub of one).
6. **Add a lightweight tagging field** to content data (e.g. `facets: ["luxury"]`)
   so hubs can be generated from data rather than hand-curated lists as volume
   grows.
7. **Real legal pages** (`/privacy`, `/terms`, `/accessibility`); retire the `#`
   footer links.
8. **Adopt the mega-menu** (§10) only when top-level sections exceed what a flat
   bar can carry — not before.
9. **Consider dynamic routing + a content source** (MDX or a CMS) before
   hand-authoring dozens of near-identical story routes; the Story Page pattern is
   already the render layer this would feed.
10. **Automate the sitemap** (it's manual today) once page count makes hand-editing
    `sitemap.ts` error-prone.

### 11.1 Guardrails that must survive scaling

- **Only ever link real pages;** unbuilt = "coming soon," non-linked.
- **URLs are permanent** — redirect, never rename.
- **One canonical home per page;** everything else is a cross-reference or a hub
  membership.
- **No fabricated content** to fill a new section — an empty section index waits
  for real content rather than shipping filler (content-integrity rules,
  CLAUDE.md + STORY_PAGE_STANDARD.md §13).
- **Search stays subordinate, Scofield stays quiet** (Doc 02 §14) regardless of
  how large the nav grows.

---

*Update this document whenever a section index, facet hub, or new content type is
introduced, and whenever the navigation model changes.*
