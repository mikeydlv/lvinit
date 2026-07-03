# Photography placeholders — REPLACE THESE

These are **temporary, neutral photography placeholders** (plain warm-neutral
JPGs — no scenery, no illustration, no artwork) so the homepage looks clean and
finished until real Las Vegas photography is shot. They are intentionally blank
so they never pretend to be something they're not.

**How to replace:** drop your real photo at the same path with the same
filename (e.g. overwrite `hero-las-vegas-lifestyle.jpg` with your shot). No code
change needed — the components already point at these paths. Keep images local
(never hotlink) and use only photography you have the rights to.

| File | Used in | Shot it stands in for |
|------|---------|-----------------------|
| `hero/summerlin-drone-overlook-golden-hour.webp` | `components/Hero.tsx` | **Real photo** — golden-hour drone overlook (via next/image); not a placeholder |
| `neighborhood-summerlin.jpg` | Journey + grid (`NeighborhoodJourney`, `NeighborhoodGrid`) | Summerlin / Red Rock |
| `neighborhood-henderson.jpg` | Journey + grid | Henderson, parks, tree-lined |
| `neighborhood-downtown-arts-district.jpg` | Journey + grid | Downtown Arts District |
| `neighborhood-green-valley.jpg` | Journey + grid | Green Valley, established & shaded |
| `neighborhood-lake-las-vegas.jpg` | Journey + grid | Lake Las Vegas |
| `breathing-downtown-arts-district.jpg` | `app/page.tsx` (BreathingPhoto #1) | Arts District street photography |
| `breathing-red-rock-trailhead.jpg` | `app/page.tsx` (BreathingPhoto #2) | Red Rock / Summerlin trailhead |
| `resident-voice-backdrop.jpg` | `components/ResidentVoice.tsx` | Quiet, low-contrast lifestyle backdrop |
| `meet-your-guide-mikey-portrait.jpg` | `components/MeetYourGuide.tsx` | Environmental portrait of Mikey |
| `guide-summerlin-vs-henderson.jpg` | `components/LocalGuides.tsx` | Guide lead image |
| `guide-cost-of-living-2026.jpg` | `components/LocalGuides.tsx` | Guide image |
| `guide-downtown-arts-district-guide.jpg` | `components/LocalGuides.tsx` | Guide image |
| `guide-first-summer-in-vegas.jpg` | `components/LocalGuides.tsx` | Guide image |
| `video-affordability.jpg` | `components/Videos.tsx` | Video poster/thumbnail |
| `video-heat.jpg` | `components/Videos.tsx` | Video poster/thumbnail |
| `video-rent-vs-buy.jpg` | `components/Videos.tsx` | Video poster/thumbnail |
| `video-schools.jpg` | `components/Videos.tsx` | Video poster/thumbnail |

Neighborhood/guide/video assets are keyed by slug/id, so a real file at the same
name is picked up automatically.
