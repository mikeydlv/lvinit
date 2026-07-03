# Placeholder images — REPLACE THESE

These are **temporary, generated SVG placeholders** so the homepage never shows
empty/gray image blocks. They are original generated vector art (no third-party
or copyrighted photos). Swap each one for your own real photo when ready.

**How to replace:** drop a real image at the same path (e.g. save your photo as
`hero-las-vegas-lifestyle.jpg`) and update the matching `src` in the component
listed below (change `.svg` → your file). Keep it local — never hotlink.

Regenerate the current placeholders anytime with:
`node scripts/generate-placeholder-images.mjs`

| File | Used in | Shot it stands in for |
|------|---------|-----------------------|
| `hero-las-vegas-lifestyle.svg` | `components/Hero.tsx` | Luxury LV lifestyle, golden hour, desert-modern home |
| `neighborhood-summerlin.svg` | Journey + grid (`NeighborhoodJourney`, `NeighborhoodGrid`) | Summerlin / Red Rock trail |
| `neighborhood-henderson.svg` | Journey + grid | Henderson parks, tree-lined |
| `neighborhood-downtown-arts-district.svg` | Journey + grid | Downtown Arts District at dusk |
| `neighborhood-green-valley.svg` | Journey + grid | Green Valley, established & shaded |
| `neighborhood-lake-las-vegas.svg` | Journey + grid | Lake Las Vegas water at dusk |
| `breathing-downtown-arts-district.svg` | `app/page.tsx` (BreathingPhoto #1) | Arts District street photography |
| `breathing-red-rock-trailhead.svg` | `app/page.tsx` (BreathingPhoto #2) | Red Rock / Summerlin trailhead |
| `resident-voice-backdrop.svg` | `components/ResidentVoice.tsx` | Quiet, low-contrast lifestyle backdrop |
| `meet-your-guide-mikey-portrait.svg` | `components/MeetYourGuide.tsx` | Environmental portrait of Mikey |
| `guide-summerlin-vs-henderson.svg` | `components/LocalGuides.tsx` | Guide lead image |
| `guide-cost-of-living-2026.svg` | `components/LocalGuides.tsx` | Guide image |
| `guide-downtown-arts-district-guide.svg` | `components/LocalGuides.tsx` | Guide image |
| `guide-first-summer-in-vegas.svg` | `components/LocalGuides.tsx` | Guide image |
| `video-affordability.svg` | `components/Videos.tsx` | Video poster/thumbnail |
| `video-heat.svg` | `components/Videos.tsx` | Video poster/thumbnail |
| `video-rent-vs-buy.svg` | `components/Videos.tsx` | Video poster/thumbnail |
| `video-schools.svg` | `components/Videos.tsx` | Video poster/thumbnail |

Neighborhood/guide/video assets are keyed by slug/id, so a real file at the same
name is picked up automatically.
