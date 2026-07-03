# 03 — Homepage Specification (Final — Phase 1 Locked)
### LVINIT — Built on Document 02 (Visual Design System, v1.0). Supersedes the previous draft of this document.

Status: Final. This is the Phase 1 homepage blueprint engineering builds from.

---

## 0. What This Pass Changed, and Why

The architecture from the previous draft is unchanged — same eleven content pillars, same order, same information priority (Neighborhoods, Honest Comparisons, Moving to Las Vegas, Videos, Local Guides, with Search Homes deliberately subordinate). What changed is pacing and craft: five new signature moments are woven into that architecture, four existing sections were reshaped so no two in a row share the same visual pattern, and every section's stated purpose was rewritten against a sharper thesis.

**The sharper thesis**: LVINIT isn't a neighborhood encyclopedia. It's the thing that helps someone move through uncertainty toward a confident answer to *"where do I belong?"* That's a different job than "present information," and it changes what "done" looks like for every section below — the test for each one is no longer just *is this accurate and well-designed*, it's *does a visitor leave this section feeling more sure of themselves than they were before it.*

**On drama without a dark section**: per direction, no black-background moment. Every dramatic beat below is built from scale, whitespace, typography, photography, and pacing — an oversized name, a full-stop photograph, a number given the whole screen, a longer pause before the next section starts. This is arguably the harder, more disciplined version of "premium," and it's the one this document commits to fully.

**One standing guardrail, worth stating before anything else**: this pass introduces real human voices — resident quotes, an emotional framing for local numbers, a personal quote from Mikey. All of it must be genuinely sourced. See Section 5. A platform whose entire premise is honesty cannot have a single fabricated testimonial anywhere on its own homepage; that would undercut the brand faster than any layout mistake could.

---

## 1. Section Map

Signature moments (the five to eight things a visitor should remember) are marked ★.

| # | Section | Shape |
|---|---|---|
| 1 | Global Navigation | Quiet, unchanged |
| 2 | Hero ★ | Full-bleed, slower, longer hold |
| 3 | The Thesis Beat ★ | Full-screen, almost pure typography |
| 4 | Neighborhood Discovery ★ | Journey (sequential) → Grid (searchable) |
| 5 | Resident Voice — Interlude I | Quote over quiet photograph |
| 6 | Honest Comparisons ★ | The Scoreboard Reveal |
| 7 | Breathing Photograph I ★ | Pure image, one caption line |
| 8 | Moving to Las Vegas ★ | Emotional numeral → quick-facts list |
| 9 | Videos | Featured + row, reframed around real doubts |
| 10 | Breathing Photograph II ★ | Pure image, one caption line |
| 11 | Resident Voice — Interlude II | Quote over quiet photograph, leads into Section 12 |
| 12 | Local Guides | Featured story + secondary list |
| 13 | Meet Your Guide ★ | The Cover Story |
| 14 | Search Homes (utility strip) | Quiet, unchanged, deliberately not a moment |
| 15 | Stay in the Loop | Quiet, unchanged |
| 16 | Footer | Quiet infrastructure, unchanged |

Eight sections carry a ★. The rest are deliberately calm — restated from the last draft's own logic: if everything is a moment, nothing is.

---

## 2. Global Foundations (reference, unchanged from Doc 02)

Grid, breakpoints, type (Playfair Display + Inter), color (Black / White / Warm Gray / Light Gray / Scofield Blue), spacing scale (`4,8,12,16,24,32,48,64,96,128,192`), and motion principles (calm, earned, reduced-motion respected) all carry over exactly as locked. One new discipline this pass adds on top of those tokens: **the largest type size in the system — Display, 64–96px Playfair — is now used in exactly two places on the entire homepage: the hero, and Mikey's name in Section 13.** Everywhere else that wants to feel large (the Thesis Beat, the Comparison scoreboard names, the emotional numeral) uses a dedicated, slightly smaller scale defined per-section below, so those two moments keep their specific weight rather than the page having five different things all claiming to be "the biggest text on the site."

---

## 3. Section-by-Section Specification

---

### 3.1 Global Navigation

Unchanged from the architecture pass. Fixed header, 88px condensing to 64px, primary links (Neighborhoods · Guides · Compare · Videos · Moving to Las Vegas) with Search Homes visually subordinate in a secondary cluster. No CTA button. This section stays deliberately invisible so the signature moments below don't have to compete with it. Full detail in the locked architecture; nothing here changes.

---

### 3.2 Hero ★

**Purpose**: Establish, in one unhurried breath, that this is a platform about belonging with confidence — not a search tool, and not in a rush to prove either.

**User goal**: "What is this, and does it already understand something about what I'm looking for?"

**Layout**: Full-bleed photography or a slow, ambient looping video — now specified at **15–20 seconds per loop** (up from the previous 8–12), with fewer cuts, so it reads as calm atmosphere rather than a highlight reel. The hero occupies a true **100vh minimum at every breakpoint**, including ultrawide desktop monitors — it should never feel like the next section is peeking into view before the visitor has scrolled. Text sits lower-left third, off-center, as before.

**Typography**: Headline in Playfair Display, Display scale (64–96px desktop, ~40px mobile), Black weight. Example direction, not final copy (Doc 08 governs language): *"Find Where You Belong."* — a direct statement of the confidence-and-belonging thesis rather than a service description. Subhead in Inter, Body-large: *"Neighborhood guides, honest comparisons, and a local you can actually trust — for anyone deciding where in Las Vegas to build a life."*

**Photography direction**: One extraordinary, specific, real neighborhood moment — Doc 02 §8 discipline applies at full strength here, since this is the highest-scrutiny image on the platform.

**Component behavior**: Muted autoplay loop; static first frame for reduced-motion visitors, styled identically.

**Mobile behavior**: Static portrait-cropped image, headline drops to Headline scale (~40px), CTA full-width.

**Calls to action**: Primary — **"Explore Neighborhoods."** Secondary/tertiary — **"Watch the guide."** No search bar.

**Whitespace**: Text block occupies roughly a third of the frame at most, unchanged principle.

**Interaction**: A slower, calmer scroll cue than before — the confidence move (per the earlier creative review) is refusing to rush toward proving utility. The cue can wait longer to appear (a few extra seconds) before it invites the first scroll at all.

**Why this section exists**: Same as before, with one addition — holding this section longer than instinct suggests is itself part of the message. A page that rushes to justify itself reads as unsure of its own value; a page willing to let one image breathe for an extra beat reads as confident.

---

### 3.3 The Thesis Beat ★ *(new)*

**Purpose**: Give the platform's real emotional premise — that this is about deciding where you belong, with confidence, not just gathering information — one uninterrupted screen before any interface appears.

**User goal**: Nothing transactional yet. This section's only job is to make a visitor feel understood for a moment before being asked to do anything.

**Layout**: Full-screen (100vh desktop, ~80vh mobile), White background, no photography or a single extremely subtle, almost imperceptible textural image at very low opacity. A single sentence, centered, enormous, with nothing else on the screen — no nav distraction beyond the already-condensed header, no card, no CTA.

**Typography**: A dedicated large scale, distinct from both the Hero's Display size and the Comparison scoreboard's scale below — roughly **48–64px**, Playfair, Black or Bold weight, generous line-height. Example direction: *"You're not choosing a neighborhood. You're deciding who you get to become."* — again, illustrative; Doc 08 owns the final line.

**Photography direction**: None, by default. If tested with a very quiet, desaturated background texture, it must stay secondary enough that the type is the entire experience.

**Component behavior**: Static. No animation beyond a simple, single fade-in as the section enters the viewport (one time, not scroll-linked, not parallax) — restrained enough to avoid the "trendy animation" trap while still marking the section as an arrival rather than a jump-cut.

**Mobile behavior**: Type scales to roughly 32–36px, still centered, still alone on the screen.

**Calls to action**: None. This is the one section on the entire homepage with zero interactive elements — deliberately, since introducing a button here would immediately undercut the pause it's designed to create.

**Whitespace**: Maximal — this is the emptiest screen on the page by design, which is exactly what makes it land after the density of a photographic hero and before the density of Discovery.

**Interaction**: None beyond the single entrance fade.

**Why this section exists**: This is the answer to the earlier critique that the page went straight from "beautiful photograph" to "here are some filter chips" with no room to breathe in between. It's also the first and most direct statement of the belonging-and-confidence thesis, stated plainly enough that everything after it can stay concrete and specific without needing to keep re-explaining the emotional stakes.

---

### 3.4 Neighborhood Discovery ★

This section now has two acts, replacing the single grid from the prior draft.

#### 3.4a — The Journey

**Purpose**: Give a visitor who doesn't know Las Vegas at all a confident mental map of the city's real shapes — five flagship neighborhoods, one at a time — before asking them to filter or search anything.

**User goal**: "Show me around before you ask me to know what I'm looking for."

**Layout**: A horizontal, swipeable, snap-scrolling sequence — 4 to 5 full-bleed panels (Summerlin, Henderson, Downtown Arts District, Green Valley, a fifth flagship area), each roughly 80vh tall, full viewport width. Each panel: one strong photograph, an oversized neighborhood name in Playfair overlaid low on the image, and exactly one number beneath it (walk score, or median price, or another single defining figure — one only, never a stat block).

**Typography**: Neighborhood name at a dedicated large scale (56–72px, between the Thesis Beat and the Hero's Display size), Playfair Black. The single supporting number in Inter tabular figures, modest size (16–18px), Warm Gray label beside it.

**Photography direction**: The strongest single image available for each of these five neighborhoods — this sequence is effectively the homepage's second-most scrutinized photography moment after the hero, since it's setting the visual standard the rest of Discovery's grid will be judged against.

**Component behavior**: User-controlled only — swipe or drag on touch, click-and-drag or arrow controls on desktop. **No autoplay, no forced auto-advance.** A thin, quiet progress indicator (a line or a row of small dots, Scofield Blue for the active position) shows where the visitor is in the sequence. This is a restrained, classic interaction pattern, not a scroll-jack — the visitor is always in control of pace, which is what keeps it from becoming the kind of "trendy animation" this pass was told to avoid.

**Mobile behavior**: Same horizontal swipe pattern, panels sized to roughly 70vh for comfortable one-handed browsing.

**Calls to action**: Each panel is itself clickable through to that neighborhood's profile; no separate button needed.

**Whitespace**: The panels are full-bleed by design — the "whitespace" in this act is temporal, not spatial: the pacing of one neighborhood at a time, at the visitor's own speed, is what creates the sense of being shown around rather than handed a spreadsheet.

**Interaction**: The swipe/drag itself, plus a very subtle parallax-free cross-fade (150ms) between panels if the visitor uses arrow controls rather than a physical swipe — small enough to feel like a page turn, not an effect.

**Why this section exists**: This is the direct answer to the earlier critique that Discovery skipped straight to utility with no on-ramp. A newcomer to Las Vegas doesn't yet have the vocabulary to filter by "walkable" or "up-and-coming" — this sequence gives them five concrete anchors first, which is what turns the grid in Act 3.4b from a cold database into a continuation of a story already started.

#### 3.4b — The Grid

**Purpose**: Once oriented, let a visitor refine by what actually matters to them.

**User goal**: "Now that I've seen the shapes, help me narrow toward mine."

**Layout, typography, photography, component behavior, mobile behavior, calls to action, whitespace, interaction**: Unchanged from the prior draft's Neighborhood Discovery specification — lifestyle-attribute filter chips (Walkable · Top Schools · Quiet & Suburban · Close to the Strip · Up-and-Coming), 3-column card grid, Neighborhood Cards per Doc 02 §11, hover reveals a second photograph, "View All Neighborhoods" tertiary link at the end.

**Why this section exists**: Same rationale as before, now strengthened by the Journey preceding it — this grid is no longer the visitor's introduction to the section, it's their second, more purposeful pass.

---

### 3.5 Resident Voice — Interlude I *(new)*

**Purpose**: Let a real person's actual words carry the confidence-building work for a moment, after the density of the Discovery grid.

**User goal**: Nothing active — a brief pause to feel, not evaluate.

**Layout**: Full-width, generous height (~70vh), a single real quote set large and centered over a quiet, softly composed photograph (not the same photographs used in Discovery — a distinct, calmer image, ideally not dominated by architecture, more about a person's daily life).

**Typography**: Quote in Playfair, italic, roughly 40–48px — smaller than the Thesis Beat's scale, so the two full-screen typography moments on the page don't compete for the same visual weight. Attribution set small in Inter beneath: first name and neighborhood only (e.g., *"— Jenna, Green Valley"*).

**Photography direction**: Quiet, low-contrast, almost background-like — the quote is the subject, the photograph is atmosphere.

**Component behavior**: Static.

**Mobile behavior**: Quote scales to ~28–32px, still centered, image crops to portrait.

**Calls to action**: None.

**Whitespace**: Very generous — this is one of the page's quiet moments by design.

**Interaction**: A single entrance fade, matching the Thesis Beat's restraint.

**Why this section exists**: Reduces uncertainty the way nothing else on the page can — not through data or design quality, but through proof that someone else made this same decision and it worked out. Used exactly once here and once more later (Section 3.11), so each occurrence stays genuinely affecting rather than becoming a testimonial carousel.

---

### 3.6 Honest Comparisons — The Scoreboard Reveal ★

**Purpose**: Make LVINIT's single most differentiated capability the most dramatic, satisfying interaction on the homepage — because helping someone weigh two real options, honestly, is the clearest possible expression of "helping people confidently decide where they belong."

**User goal**: "I'm actually torn between two places. Show me, plainly, what's really different."

**Layout**: Full-width section. Two neighborhood names, set enormous, side by side, separated by a large italic Playfair *"vs."* — this replaces the previous dropdown-driven layout entirely. Beneath the names, the Comparison Bars (Doc 02 §21) — Median Price, Walk Score, Commute to the Strip, School Rating — each a labeled horizontal bar, Scofield Blue highlighting the leading value per row.

**Typography**: The two neighborhood names use their own dedicated large scale — matching the Journey panels' scale (56–72px) rather than the Hero/Meet Your Guide Display scale, so the page's absolute largest type stays reserved for those two moments as stated in Section 2. Bar labels and all figures in Inter, tabular numerals.

**Photography direction**: A small thumbnail image beside each name — enough to keep the moment feeling like two real places, not two abstract labels — no larger imagery here; this section's drama comes from typographic scale and motion, not photography.

**Component behavior**: Tapping either name opens a lightweight, focused overlay — a single search field to choose a different neighborhood, not a plain dropdown, closer to a spotlight-search moment than a form control. On selection, the overlay closes and the new name **cross-fades in with a slight vertical settle** (roughly 400ms) rather than snapping instantly. The Comparison Bars then redraw with real, felt weight: each bar briefly retracts and regrows to its new value, staggered slightly across the four metrics (each starting ~80ms after the last) rather than updating all at once. This staggered, weighted redraw — not an instant value swap — is the section's signature motion, and it's a deliberate, editorial-data-graphic technique rather than a novelty effect, which keeps it inside the "avoid trendy animation" boundary while still being the most memorable interaction on the page.

**Mobile behavior**: Names stack with "vs." centered between them; bars remain full-width and stacked, as before.

**Calls to action**: **"Compare Any Two Neighborhoods"** — leading to the fuller comparison tool with more metrics.

**Whitespace**: Less than the sections around it, as established previously — the Warm Gray background carries over from the prior draft to mark this as an intentional mode change.

**Interaction**: The tap-to-swap-and-reveal choreography described above is the section's whole reason for being elevated — it should feel less like adjusting a form and more like watching a decision get clearer in real time.

**Why this section exists**: If a visitor remembers exactly one interaction from this entire homepage, this should be it — it's the platform's actual differentiated value, made physical and satisfying rather than just described in copy.

---

### 3.7 Breathing Photograph I ★ *(new)*

**Purpose**: A full, deliberate stop after the intensity of the Comparison reveal — pure image, nothing to parse.

**User goal**: None active. This section exists to let the previous one land.

**Layout**: Full-bleed photograph, full viewport height (100vh) or close to it. One caption line, small, bottom-left or bottom-center, Inter, Warm Gray or White depending on the image.

**Typography**: The caption is the only type on screen — small (14–16px), quiet, never competing with the image. Example direction: *"Two blocks from the light rail. Around the corner from a bakery that remembers your order."* — concrete, sensory, specific to a real place, not generic inspirational language.

**Photography direction**: A genuinely beautiful, specific image — this section's entire job is the photograph, so it needs to be one of the strongest images on the platform, not a filler shot.

**Component behavior**: Static. No overlay text box, no gradient scrim beyond what's needed for the caption's legibility.

**Mobile behavior**: Image crops to portrait; caption remains legible and small.

**Calls to action**: None.

**Whitespace**: The entire section is whitespace, functionally — a photograph with almost no UI is the visual equivalent of a full blank margin in print.

**Interaction**: None.

**Why this section exists**: The prior draft never gave the page a single moment of pure visual silence — every section carried a headline, a grid, a CTA. This is the cheapest, least gimmicky way to make the scroll feel like a magazine rather than a product page, and it earns its place specifically by having nothing else competing for attention in it.

---

### 3.8 Moving to Las Vegas — The Number That Means Something ★

**Purpose**: Replace a generic relocation-facts feature grid with one real, specific number, framed emotionally — because a fact that's just accurate doesn't reduce uncertainty the way a fact that's been made to mean something does.

**User goal**: "Give me one thing that makes this move feel real and manageable, not just a checklist."

**Layout**: Act one — a full-width moment, one oversized number, Playfair, with a single grounding line beneath it in Inter. Act two — beneath that, a much quieter, compact horizontal quick-facts list (Cost of Living · Getting Around · Schools & Family · Climate & Lifestyle), styled as a slim index rather than a card grid, so this section's shape doesn't repeat Discovery's or Guides'.

**Typography**: The numeral itself at a dedicated, very large scale — comparable to the Journey/Comparison scale (56–72px) — set in Inter tabular figures (numerals are always Inter, even in an otherwise Playfair-led moment, per Doc 02's numeral rule). The grounding line beneath in Playfair italic, modest size (24–28px). The quick-facts list beneath uses standard Inter body/label sizes, no headline treatment.

**Content direction — this is the modified idea**: the number must be real, specific, and framed around what it actually means for a day in someone's life, not a generic relocation statistic presented flatly. Example direction, illustrative only: *"27 — the minutes between waking up in Summerlin and sitting at your desk downtown. Long enough for a coffee. Short enough to still feel like home."* This is a real commute figure given an emotional consequence, not an invented anecdote about a fictional family — see Section 5 for why that distinction matters here.

**Photography direction**: Minimal for Act one (the numeral moment can stand on typography alone, perhaps with a very quiet supporting image); Act two can use small icons per Doc 02 §6 rather than photography, consistent with its more utilitarian register.

**Component behavior**: The quick-facts list links out to the fuller Relocation Hub topics; the numeral moment itself is static, letting the line do the work rather than an interaction.

**Mobile behavior**: Numeral scales down proportionally but remains the dominant element on the screen at this breakpoint too; the quick-facts list stacks into a simple vertical list.

**Calls to action**: **"Visit the Relocation Hub"** tertiary link beneath the quick-facts list.

**Whitespace**: Generous around the numeral moment specifically — it should feel like its own small event, not just a bigger version of a stat card.

**Interaction**: None beyond standard link states in Act two.

**Why this section exists**: This is the section most directly rewritten against the new thesis. A feature grid of "Cost of Living / Getting Around / Schools / Climate" presents information; one true number, framed around an actual daily consequence, builds the specific kind of confidence a relocating visitor needs — proof that the practical details resolve into something livable, not just a checklist to get through.

---

### 3.9 Videos

**Purpose**: Build trust through a real person, on camera, and — reframed under the new thesis — specifically through him addressing the doubts a relocating visitor is actually carrying.

**User goal**: "Does this person actually get the things I'm worried about?"

**Layout, typography, photography, component behavior, mobile behavior**: Unchanged structurally from the prior draft — featured video + row of secondary thumbnails, custom player per Doc 02 §9, real on-location frames as thumbnails.

**Content direction (new)**: video topics and titles should skew toward real uncertainty — *"Is Las Vegas actually affordable right now?"*, *"What nobody tells you about the heat"*, *"Renting first vs. buying first — what I tell my clients"* — rather than purely descriptive neighborhood tours. This is a content-strategy note more than a visual one, but it belongs here because it's what makes this section do the confidence-building work the new thesis asks of every section, not just present footage.

**Calls to action**: **"Visit the Video Library"** tertiary link, unchanged.

**Whitespace, interaction**: Unchanged from the prior draft.

**Why this section exists**: Unchanged rationale, sharpened — this is where a visitor's specific doubts get addressed by a real, named person, which does more for confidence than any amount of well-designed data.

---

### 3.10 Breathing Photograph II ★ *(new)*

Identical specification to Section 3.7 — full-bleed image, one caption line, 100vh, no other UI — placed here as the second and last of the two "pure image" pauses, following Videos and preceding the final Resident Voice interlude. A different photograph and a different caption line from Section 3.7, maintaining the "used exactly twice" discipline that keeps both instances feeling deliberate rather than like a repeating template component.

---

### 3.11 Resident Voice — Interlude II *(new)*

Same specification as Section 3.5, with one difference in content direction: this second and final quote should be specifically about **trusting a person** during the decision (rather than about a neighborhood or a photograph), so that it functions as a natural narrative bridge into Section 3.13. Example direction: *"— Marcus, formerly of Chicago, on working with Mikey: 'He told me not to buy in the first neighborhood I liked. That's when I trusted him.'"* Real, sourced quote required — see Section 5.

**Why this section exists**: Beyond the standalone value described in 3.5, this second instance does double duty as a lead-in — it hands the emotional baton directly to Mikey before Local Guides and Meet Your Guide arrive.

---

### 3.12 Local Guides

**Purpose**: Prove editorial depth — now explicitly in service of reducing uncertainty rather than just demonstrating content volume.

**User goal**: "Is the writing here actually good and specific enough to trust with a decision this size?"

**Layout**: Reshaped from the prior three-equal-card grid — now one large **featured story** (big image, a real pulled quote from the piece set in Playfair italic, full editorial treatment) with three smaller secondary entries listed beneath it, more compact than the featured piece (image, category, Playfair headline at a smaller size, byline/date) — not equally weighted cards.

**Typography**: Featured story headline at Headline scale (48–56px); secondary entries at Headline-small (32px), otherwise following Doc 02 §2 article conventions.

**Photography direction**: The featured story's image should be the strongest single editorial photograph in this section — genuinely good, reporting-grade, not a generic header image, since it's now carrying more visual weight than before.

**Component behavior**: Static; ordering can be recency-based or editorially curated once there's enough content to curate meaningfully.

**Mobile behavior**: Featured story stacks first, full-width; secondary entries follow as a simple vertical list.

**Calls to action**: **"Read All Guides"** tertiary link.

**Whitespace, interaction**: Standard section padding; hover states follow the underline-in convention used system-wide.

**Why this section exists**: Same as before, now visually distinct from both the Discovery grid before it and the Cover Story after it, closing the "four sections shared one shape" problem raised in the earlier review.

---

### 3.13 Meet Your Guide — The Cover Story ★

**Purpose**: Deliver the homepage's emotional and trust climax — the single person whose expertise and honesty the entire platform's credibility rests on, given the full weight of a magazine cover rather than a modest bio card.

**User goal**: "I'm ready to actually trust someone with this decision. Show me who."

**Layout**: Full-bleed, full-height environmental portrait of Mikey Del Rosario — on location in a real Las Vegas neighborhood, not a studio backdrop. His name overlaps the bottom of the image the way a magazine cover line sits over its photograph. Beneath or beside it, a single real, specific pulled quote from him, set large in italic Playfair.

**Typography**: Mikey's name uses the **Display scale (64–96px)**, Playfair Black — the only other place on the homepage besides the Hero permitted to use this size, per the discipline established in Section 2. The pulled quote beneath is set smaller (32–40px), italic, so the name remains the single largest element in the section. The Scofield Group credential line stays small and quiet — Inter, Warm Gray, per Doc 02 §14 — positioned near his short bio, never competing with the name or the quote.

**Content direction**: the pulled quote must be something Mikey actually said — specific and a little unexpected, the kind of line that reveals judgment rather than generic warmth (example direction only: *"I've told people not to buy the house they were sure about. That's the job."*). A generic quote ("I love helping people find their home!") would undercut the entire point of elevating this section.

**Photography direction**: This portrait deserves the same production standard as the hero image — natural light, a real setting, not a corporate headshot. It's doing the most concentrated trust-building work of any single image on the site.

**Component behavior**: A quiet **"Watch Mikey's story"** link ties back to Section 3.9's video content for a visitor who wants more before fully committing to trust.

**Mobile behavior**: Portrait crops to a tall vertical frame; name scales to Headline scale (~48–56px) while remaining the dominant type on the screen; quote and credential stack beneath.

**Calls to action**: **"Get in Touch"** tertiary link, routing to Contact (where Scofield's fuller compliance presence lives, unchanged from the architecture pass).

**Whitespace**: The most generous pacing on the page outside the Thesis Beat and the Hero — this section should feel like arriving somewhere, not scrolling past another module.

**Interaction**: None beyond standard link states — the section earns its weight through photography, scale, and the specificity of the quote, not through motion.

**Why this section exists**: This is the direct answer to the earlier critique that the section carrying the most trust-building weight on the page had the least ambitious layout. Elevating it to the same typographic scale as the hero is a deliberate structural statement: the platform's opening promise and the person who backs it up are the two biggest things on the page, and nothing else is allowed to compete with either.

---

### 3.14 Search Homes (Utility Strip)

Unchanged from the architecture pass, and deliberately not elevated. Quiet Warm Gray strip, Inter only, one line of copy, one outline-style button, minimal padding. Its restraint is precisely what makes the eight ★ sections above it read as genuine moments rather than one of many equally loud things on the page.

---

### 3.15 Stay in the Loop

Unchanged from the architecture pass. Centered, quiet, generous closing pacing before the footer — a calm landing after the Cover Story rather than another dense module.

---

### 3.16 Footer

Unchanged from the architecture pass. Sitemap-style link columns, the Scofield Group compliance block (brokerage-of-record language, license numbers, equal housing mark, "Brokerage services provided by The Scofield Group, LLC"), legal links — all designed with full legibility, none of it hidden, none of it loud.

---

## 4. Pacing Rhythm (new — the connective logic across Sections 2–13)

Stated explicitly because it's the mechanism behind most of this pass's improvements: the page now alternates between **dense** sections (real UI, real information, real interaction — Discovery's Grid, Comparisons, Moving to Vegas's quick-facts list, Videos, Guides) and **quiet** sections (the Thesis Beat, both Breathing Photographs, both Resident Voice interludes, the Journey) that contain little or no interface at all. No two dense sections sit back-to-back without a quiet one between them anywhere past the hero. This alternating rhythm — not any single effect — is what should make the page feel like it was paced by an editor, and it's reproducible and checkable: if a future addition to this homepage ever creates three dense sections in a row, that's a pacing regression to fix, not a matter of taste.

---

## 5. Content Integrity Guardrails

This pass introduces real human material — resident quotes (3.5, 3.11), an emotionally-framed local statistic (3.8), and a personal quote from Mikey (3.13). All of it is sourced from real people and real, verifiable data:

- **Resident quotes** are drawn from actual interviews conducted as part of content production (a Doc 07 content-ops task, not something written in the design process). They are never composed to sound authentic; they're transcribed and lightly edited for length from something someone actually said.
- **The emotional numeral** in Section 3.8 is built from a real, checkable figure (an actual commute time, an actual price delta, an actual rating) and reframed in human terms — it is not a rounded, invented, or composite statistic, and it's never attached to a fictional or composited person's story.
- **Mikey's quote** in Section 3.13 is something he actually said, sourced the same way editorial content elsewhere on the platform is (Doc 07/08), not written on his behalf for the sake of a good pull-quote.

This isn't a stylistic nicety — a platform whose central promise is *honest* comparisons and *trustworthy* local guidance cannot have a single fabricated human moment anywhere on its own homepage without quietly contradicting its own premise.

---

## 6. Cross-Section Rules (carried over, unchanged)

Heading hierarchy (one H1 at the hero, H2 per section, H3 at card level), consistent photographic grading across every image on the page, hero-first perceived load priority with lazy-loading below the fold, no autoplay sound anywhere, and full accessibility baseline (skip-to-content link, landmark regions per section, visible Scofield Blue focus states) — all unchanged from the architecture pass and fully binding on this version.

---

## 7. Explicitly Out of Scope

Unchanged from the architecture pass: no MLS search interface, no property listing cards as homepage content, no agent directory, no account/login system design. This creative pass adds emotional and typographic ambition; it does not expand the page's functional scope.

---

## 8. Final Sign-Off Note

This document, together with Doc 02, is the complete Phase 1 homepage blueprint. Engineering should be able to build directly from the two together without needing further design clarification on any of the sixteen sections above. Anything discovered during build that isn't covered here (a specific easing curve, an exact overlay component for the Comparison scoreboard's neighborhood-swap search) should be resolved in the spirit of the principles stated throughout — calm, earned, never denser or louder than the section actually needs to be — and folded back into Doc 02's component library rather than improvised ad hoc.

Next logical step, once this is approved: the Neighborhood Profile page spec, since it's the primary destination this homepage sends the most traffic toward.
