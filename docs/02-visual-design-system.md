# 02 — Visual Design System
### LVINIT — Status: Approved

---

## 0. The Design Thesis

LVINIT looks like the definitive, most trustworthy guide to living in Las Vegas — and it would still be a great product if it never sold a single house. If a design decision only makes sense for a company trying to close transactions, it's the wrong decision for this brand. Transactions are the eventual business model (Doc 15); they are not the experience.

The test for every screen, every component, every piece of copy: ***"This doesn't feel like a Realtor website."*** No MLS-search hero, no automated valuation presented as fact, no stock photography of a couple holding house keys, no neighborhood page that's actually a filtered listing feed with a paragraph of filler above it.

---

## 1. Design Philosophy & References

- **Apple** — restraint, material honesty, the sense that every pixel was a decision.
- **Airbnb** — trust through photography and belonging, pointed at *neighborhoods and city life* rather than individual properties. Airbnb's real skill is making a stranger feel "I could live like this here" — that's the entire job of LVINIT's homepage.
- **Baanlyy** (baanlyy.com) — confirmed reference, reviewed directly. Baanlyy is a Bangkok-based relocation-research platform — guides, area comparisons, cost-of-living and visa tools, a full editorial and calculator ecosystem sitting alongside listings. What we're taking from it, per your direction, is the **feel**: premium, editorial, calm, minimal, confident typography, large imagery, generous whitespace, and the overall impression of a lifestyle platform rather than a brokerage. We are explicitly **not** adopting its layout conventions — its homepage actually leads with a filter-bar search hero and a featured-listings carousel, which is closer to a Phase 2, search-forward pattern than to the media-first Phase 1 you've specified for LVINIT. Where Baanlyy's structure is genuinely useful is at the information-architecture level, not the pixel level: its Relocation Hub, Area/Neighbourhood comparisons, and Cost of Living tools are close cousins of LVINIT's own Moving to Las Vegas, Honest Comparisons, and Neighborhood Guides — which makes sense, since it's effectively a sibling platform. LVINIT should feel like it belongs to the same family of quality, with its own distinct layout language, not a reskin.

One more thing worth naming: Baanlyy's own footer credits its content with **"Written & reviewed by Kirby Scofield · Editorial Team & Standards"** — a quiet, single-line author credit, not a co-brand lockup. That's precedent, not just theory, for exactly the pattern specified below for how Scofield Group and Mikey Del Rosario appear in LVINIT.

**What's not a load-bearing reference anymore:** Linear, Stripe, OpenAI, Arc, and Mercury (all present in an earlier draft of this system) have been dropped. They fit a software-trust, dashboard-adjacent product; LVINIT is a city media platform with a product layer, and keeping them around would dilute rather than sharpen the point of view.

---

## 2. Typography — Playfair Display + Inter

Two typefaces, used for distinct, non-overlapping jobs. Fewer typefaces reads as more disciplined, and Inter's tabular figures are strong enough that a dedicated numerals face isn't needed.

**Playfair Display — editorial headlines only.**
Playfair is a high-contrast, romantic serif in wide use, so the way it's handled has to do the differentiating work:
- **Black or Bold weight only** above ~32px. Regular weight at large sizes reads soft; Black weight reads confident and architectural.
- **Italic used deliberately** — kickers, pull quotes, a single emphasized word inside a headline ("Everything you need to know about *Summerlin*") — not as a default style.
- Never below 24px, never in UI copy, labels, or buttons. Playfair on a filter chip or a nav item is the exact "trying too hard" mistake this system exists to avoid.
- Pair a tight-set Playfair headline against a **wide-tracked, uppercase Inter** kicker above it ("NEIGHBORHOOD GUIDE"). The contrast between tight-and-dramatic and wide-and-restrained is what makes the pairing feel art-directed.

**Inter — everything else.** Body copy, navigation, buttons, labels, forms, captions, and all numerals (tabular-figure OpenType feature for anything comparative — prices, walk scores, commute times, school ratings). Inter is chosen specifically because it disappears and lets Playfair carry the personality.

**Scale:**
```
Caption / label (Inter)          12–13px
Body (Inter)                     16–17px
Body — large (Inter)             18–20px
Subhead (Inter, medium weight)   22–26px
Headline — small (Playfair)      32–40px
Headline (Playfair)              48–56px
Display (Playfair)               64–96px   — homepage hero, guide cover treatments
```

**Article width**: cap the reading column at roughly **65–75 characters per line** (~640–700px at 17px) even inside a much wider page. Full-width body text is the fastest way for an article to feel like a web page pretending to be a magazine rather than one that actually is.

---

## 3. Color System

| Name | Approx. Hex | Role |
|---|---|---|
| **Black** | `#111111` | Primary text, headlines, dark UI surfaces. Warm-neutral near-black, not pure `#000`. |
| **White** | `#FFFFFF` | Primary background — kept genuinely white for crispness, not tinted toward "editorial cream." |
| **Warm Gray** | `#6E6A63` | Secondary text, captions, muted UI, section backgrounds. |
| **Light Gray** | `#E8E6E1` | Dividers, hairline borders, subtle fills, hover states, table stripes. |
| **Scofield Blue** *(primary accent)* | `#2B6CB0` | The one color that means "interactive" — links, primary buttons, active states, focus rings, data highlights in charts and comparisons. |

**One accent rule, strictly enforced:** Scofield Blue is the only color that means "you can click this." If two things on a screen need to signal "interactive" differently, that's a hierarchy problem to solve in layout, not a reason to add a second accent.

**On gold:** not used in UI chrome — buttons, links, icons, backgrounds. It pulls the brand back toward a luxury-brokerage cliché and fights with a blue accent rather than complementing it. The one place worth considering a restrained, muted brass (never bright or metallic-gradient) is a rare editorial marker — a "Local Favorite" tag inside guide content — and only after testing against real photography and content. The system works completely without it.

**Semantic colors** (success/warning/error states) stay desaturated and are treated as utility, not brand — kept out of the core palette table above.

---

## 4. Spacing System

Base unit **4px**. Scale: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192`. Non-linear on purpose — tight at small sizes where the eye is precise, generous at large sizes where whitespace becomes the premium material (Section 17).

---

## 5. Grid System

**Desktop:** 12-column grid, generous gutters, wide outer margins. The grid hosts three distinct content modes: long-form articles (narrow, ~700px reading column, centered), comparison views (full-width, data-dense table or card-grid), and video (full-bleed or large-format, 16:9 respected).

**Mobile:** 4-column grid, 16–24px margins. Video and photography go full-bleed; comparison views collapse from side-by-side tables into stacked, swipeable cards (Section 13).

---

## 6. Iconography

Custom single-weight line icons, 1.5px stroke, geometric construction with soft (not fully rounded) terminals — one family, drawn at one sitting, never mixed from multiple icon libraries at different weights. **Vocabulary priority**: place attributes first — walk score, commute time, school rating, transit, parks/trails, elevation/view, distance to Strip vs. distance to work. Property-attribute icons (bed/bath/sqft) are designed too, but they're needed for Phase 2, not day one.

---

## 7. Illustration Style

As little as possible; never cartoon characters. **Avoid Las Vegas tourism iconography entirely** — no dice, cards, neon-sign lettering, showgirl silhouettes, Strip skyline clip art. This is the single most obvious visual cliché available for this subject matter, and using it would instantly signal "tourism site" over "living guide." Where a graphic device is needed, use the same architectural-line-drawing language as the rest of the system — a custom line-drawn neighborhood map rather than iconography borrowed from a casino's marketing department.

---

## 8. Photography Direction

**Place and life photography leads; property photography supports**, in this priority order:

1. **Neighborhood and street-level photography** — a Summerlin trailhead at 7am, a Downtown Arts District mural wall, a Henderson cul-de-sac in late light, the specific quality of desert light that every local knows and every stock photo misses.
2. **People living, not posing** — someone running before the heat sets in, a farmers market, kids at a neighborhood park — documentary-style, never a staged "happy family in front of a house" stock setup.
3. **Data made visual** — comparisons supported by side-by-side neighborhood imagery next to the stats, not just a table.
4. **Property photography** (Phase 2) — natural lenses, available light, consistent grade, no HDR-twilight-every-light-on — in service of the neighborhood story, not a separate product.

**Explicitly avoid**: Las Vegas Strip imagery, casino interiors, neon at night — anything that reads as "visiting" rather than "living." If the Strip appears, it's an honest data point (commute distance from a given neighborhood), never hero imagery.

**Consistent grade across every photographer and every neighborhood**, applied to a much wider ongoing shoot list than a rotating set of property listings — more work, but a compounding brand asset.

---

## 9. Motion Principles

Calm easing, no bounce or overshoot, 200–350ms for UI transitions. Motion is rare and earned — a homepage entrance or a featured-guide moment, not applied ambiently to every card in a grid. Video players carry the brand's restraint: custom-styled controls in Black/White/Scofield Blue, no platform-default chrome, autoplay (muted, if used at all) held to the same "earned, not ambient" standard as any other motion. Reduced-motion preference is respected everywhere without exception.

---

## 10. UI Personality

- **Knowledgeable, not salesy.** Authority comes from genuinely useful local information, not from self-applied adjectives like "luxury" or "exclusive."
- **Warm, not touristy.** Vegas as a place to live, photographed and written about with the same care as anywhere else people build a life — never borrowing tourism-identity personality it hasn't earned on its own.
- **Precise, not cold.** Exact alignment, spacing, and type — kept warm by palette, photography, and voice.
- **Editorial, not corporate.** Closer to a magazine's masthead than a brokerage's about page. This is the clearest day-to-day test for whether a screen has drifted back toward "Realtor website."

---

## 11. Signature Content Units

**The Neighborhood Card — primary unit.** Image-forward (place photography), Playfair headline for the neighborhood name, Inter for the one-line description and key stats (median price, walk score, commute-to-Strip) set as tabular data, not badges. No drop shadow — hairline Light Gray border or whitespace separation.

**The Comparison View — a primary pattern, not an edge case.** Comparison is core to the product's actual job (helping someone choose between neighborhoods), so it's designed as a clean, generously-spaced data table — Inter tabular figures, Scofield Blue highlighting the leading value in any row (lowest commute, highest walk score). This is one of the few places in the system where density is the right call over whitespace, because it's serving a different job than the rest of the product.

**The Property Card — secondary, held in reserve for Phase 2.** Image-forward, no shadow, data-typography pricing — same discipline as the Neighborhood Card, just not the component the system is built around yet.

---

## 12. Buttons

Three tiers: **Primary** (solid Scofield Blue fill), **Secondary** (Black outline, transparent fill), **Tertiary** (Scofield Blue text link, underline animates in on hover). Inter throughout, active-voice labels that match their resulting state (Doc 08 governs the copy itself). Generous horizontal padding — cramped buttons are a fast tell of an unconsidered UI.

---

## 13. Inputs & Discovery

The primary discovery pattern is **neighborhood exploration, not property search**:
- A primary "Explore neighborhoods" entry point — by lifestyle attribute (walkable, top schools, quiet/suburban, close to the Strip, up-and-coming), by area, or by a guided flow — rather than a bed/bath/price filter bar borrowed from MLS convention.
- On mobile, the Comparison View collapses from a side-by-side table into stacked, swipeable cards, one neighborhood per screen, with a persistent "add to compare" action.
- "Search Homes" exists in navigation, styled with the same restraint as everything else, but sits behind neighborhood discovery in both the IA and the nav — a supporting utility, not the hero action, until Phase 2 earns it more prominence.

---

## 14. Navigation

**Primary navigation, in priority order:** Neighborhoods, Guides, Compare, Videos, Moving to Las Vegas — with **Search Homes** present in the nav bar but positioned as a secondary utility, not a prominent CTA, consistent with MLS being a Phase 2 feature.

**Footer — where Scofield Group lives.** Scofield Group is quiet infrastructure: it provides brokerage, licensing, and compliance; it never competes visually with the LVINIT brand. Confirmed placement:
- **Footer** — brokerage-of-record language, license numbers, equal housing opportunity mark, and a small, genuinely legible "Brokerage services provided by The Scofield Group, LLC" line, set in Inter, Warm Gray — never 9px gray-on-gray.
- **Contact page** — brokerage identity and licensing appear alongside the contact flow, scoped to what's legally/practically necessary.
- **Agent bio** — this is where Scofield's identity is most visible, since agents are Scofield-affiliated; still framed as credential, not co-brand.
- **Legal / compliance pages** — full disclosure treatment per Doc 13, designed with the same care as everything else in the system.
- **Listing pages (Phase 2)** — brokerage disclosure appears at the point of transaction, as required.

Everywhere else — homepage, guides, neighborhood profiles, videos — Scofield Group does not appear. LVINIT is the only brand a visitor is aware of during the actual content experience.

---

## 15. Mobile Behavior

Full-bleed photography and video, bottom-sheet patterns for filters/details, thumb-reachable primary actions, and the Comparison View's card-stack (Section 13) as a native mobile pattern rather than a shrunk-down desktop feature.

---

## 16. Desktop Behavior

A split-view pattern (in the spirit of Apple Maps / Airbnb, executed calmer) pairs a map of Las Vegas — neighborhood boundaries, not listing pins — with guide content or comparison data. An editorial use of a familiar interaction pattern, better suited to a media-first product than a listings-map version would be.

---

## 17. White Space Philosophy

Whitespace governs guides, the homepage, and neighborhood profiles — this is still the clearest, cheapest differentiation from every listings-dense competitor in the category. The Comparison View (Section 11) is the deliberate, stated exception, because it's serving a genuinely different job. A system that applied one whitespace rule everywhere without exception would be less thoughtful, not more disciplined.

---

## 18. Editorial Authority Cues

The goal here is "feels authoritative," not "feels expensive": real bylines on guide content, a transparent methodology for any ranking or comparison ("how we calculate walk score," "how we chose these five neighborhoods"), no third-party ad units or affiliate clutter, and a masthead-style About page that reads like a publication's, not a brokerage's. The absence of ads matters especially here — a media platform's obvious business-model temptation (display ads, affiliate links) is exactly what would make LVINIT start to resemble a city-guide content farm instead of the definitive one.

---

## 19. Trust Cues

Two distinct trust systems, kept visually separate so neither dilutes the other:

- **Editorial trust** — real authorship. Guide and video content is voiced by **Mikey Del Rosario, LVINIT's trusted local guide** — named consistently, styled consistently (see The Local's Note, Section 21) — not "LVINIT Staff." Transparent methodology for rankings/comparisons. Dates on content so a two-year-old guide doesn't masquerade as current.
- **Regulatory/brokerage trust** — license numbers, fair housing notices, brokerage-of-record disclosure (the Scofield Group layer, Section 14), designed with full legibility per Doc 13, scoped to where it's actually required rather than spread across every content page where it would compete with editorial voice.

A reader should be able to tell, from design alone, when they're reading an honest local opinion and when they're looking at a regulated disclosure. Conflating the two — dressing compliance up as editorial, or the reverse — is a subtler version of the same dishonesty as a fake-urgency listing badge.

---

## 20. Accessibility

WCAG AAA contrast for body text, AA minimum for UI components — verified against real rendered components, not assumed from the palette table. Focus states always visible (Scofield Blue ring). Reduced motion respected system-wide. Every property photo gets genuinely descriptive alt text. Every video gets accurate captions and a transcript — not auto-generated captions left uncorrected — both an accessibility requirement and an SEO asset (Doc 06). Touch targets minimum 44×44px. Status is never color-only.

---

## 21. The Signature Element

**The Comparison Bar — primary signature.** A small, consistent visual device (a horizontal bar or dot-scale, Scofield Blue on Light Gray) that appears anywhere two or more places are measured against each other — median price, walk score, commute time. Recognizable at a glance, used identically in guides, comparison views, and eventually property pages. This is the most product-true signature available: it embodies the "help me choose" job the platform exists to do, and it's genuinely rare in a category where most sites present numbers as plain text or generic bar charts.

**The Local's Note — secondary signature.** A recurring callout box inside guide content — Playfair italic kicker, Inter body, a hairline Scofield Blue rule — consistently attributed to **Mikey Del Rosario**. This does double duty: a memorable editorial device, and the natural, non-intrusive place where local credibility and the Scofield relationship surface as a trusted-guide credential rather than a compliance footnote — the same footer-byline logic Baanlyy already uses with Kirby Scofield, applied here as a more visible, in-content device befitting Mikey's role as the face of LVINIT.

---

## Approved direction, confirmed for Phase 1 (Homepage forward)

- **Homepage priority**: Neighborhoods, Honest Comparisons, Moving to Las Vegas, Videos, Local Guides. Search Homes exists in navigation, does not dominate the homepage.
- **MLS search is Phase 2.** Nothing in this system's Phase 1 components (Sections 11, 13, 14) should be designed as if search is the primary job.
- **Scofield Group is quiet infrastructure** — Footer, Contact, Agent Bio, Legal/Compliance, and future Listing pages only. It never competes visually with LVINIT.
- **Mikey Del Rosario is the trusted local guide** — the named, consistent human voice behind guides, video, and The Local's Note.

This document is the source of truth for LVINIT's visual language going forward. Next: homepage specification, built directly against Sections 0, 11, 13, 14, and 21 above.
