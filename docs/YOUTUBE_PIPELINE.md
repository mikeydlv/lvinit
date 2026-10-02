# YouTube → Website Pipeline

Turns an approved LVINIT long-form video into a **Publisher-ready package**:
what the video should become on the site, a draft built from Mikey's own words,
metadata, FAQ, embed placement, VideoObject, link suggestions and a
fact-verification checklist. It never publishes. The Content Publisher stays the
execution layer.

```
video approved in the manifest
  → transcript (source material, never the article)
  → claims: fact / Mikey opinion / unclear / narrative, decay flags
  → overlap with every published page (SAME · SUBSTANTIAL · ADJACENT · DISTINCT)
  → action (new URL is the last resort)
  → draft · FAQ · embed · VideoObject · images · link suggestions
  → Fair Housing + voice gates → confidence → fingerprint / lifecycle
  → package + DRY-RUN handoff queue (max 2)  ──►  Content Publisher (later)
```

| | |
|---|---|
| Runner | `scripts/youtube-pipeline/run.mjs` (`npm run video:report`) |
| Input | `data/youtube-pipeline/manifest.json` + `data/youtube-pipeline/transcripts/` |
| Output | `reports/youtube-pipeline/` (gitignored): report `.md` + `.json`, `packages/VID-….json`, `handoff-queue-<date>.json` |
| Tests | `npm run video:test` (`node:test`) |
| Workflow | `.github/workflows/youtube-pipeline.yml` — manual, or on a push that changes `data/youtube-pipeline/**`. Never scheduled. |

## What it reuses (and does not duplicate)

| Need | Reused from |
|---|---|
| Site inventory (pages, H1s, headings, body, links) | Content Brief Generator `buildInventory` → Internal Linking graph + Fact-Decay extractor |
| Topic vocabulary, overlap bands, cannibalization | Content Brief Generator `intent.mjs` / `coverage.mjs`, same thresholds |
| Sentence fact / opinion / history / durable split | Fact-Decay `classifySentence`, categories |
| Fair Housing rules | GSC rules via the Internal Linking prose wrapper (unchanged) |
| Which pages embed which video | Executive Producer `videos.mjs` scanners (read-only) |
| Embed component | `StoryVideo` / `StoryVideoFacade` (youtube-nocookie, click-to-play poster) |
| VideoObject shape | `StoryMeta.video` → `buildStoryJsonLd` in `lib/story.ts` |
| Handoff conventions | Content Brief Generator queue: dry-run mode, commit trailers, retry ceiling |

The Executive Producer is untouched: it plans social posts and Shorts; this
pipeline only reads its embed scanner.

## Input — the manifest

List only what the site does not already know. Title, duration, poster and
existing embeds are read from `lib/content.ts` and the pages.

```json
{
  "youtubeId": "2rboWkJ9j48",
  "approved": true,
  "uploadDate": "2026-08-17T13:11:50-07:00",
  "durationSeconds": 488,
  "description": "…YouTube's own description…",
  "chapters": [{ "start": "0:00", "title": "…" }],
  "relatedRoute": null,
  "targetTopic": null,
  "transcript": { "path": "data/youtube-pipeline/transcripts/2rboWkJ9j48.txt", "verified": false, "source": "…" }
}
```

- `approved: false` (or absent) — listed but never processed.
- `uploadDate`, `durationSeconds`, `description` — from YouTube (Studio or the
  watch page). Never estimated. A missing value is reported as a BLOCKED
  VideoObject field.
- `chapters` — optional; when present they become the section outline.
- `relatedRoute` — optional; Mikey's own pick of the related page outranks the
  inferred one.
- `transcript.verified` — `true` only after Mikey has read it. It gates HIGH
  confidence.

Transcripts: `.srt`, `.vtt`, `.json` (`{segments:[{start,end,text}]}`, the
shape Resolve's `GetTranscription()` returns, timecode `HH:MM:SS:FF` accepted),
or `.txt` (optional `[m:ss]` line stamps). Known name mis-hearings
("Summerland" → Summerlin, "Scoffield" → Scofield, "live in it" → LVINIT) are
corrected **in the pipeline**, counted in the report, never in the file.

**No transcript → `TRANSCRIPT_REQUIRED`.** The action is still named from the
title and the site, but marked provisional; no title, meta line, section, body
or FAQ is written, and it can never be handed off.

## Actions

| Action | When |
|---|---|
| `REJECT_DUPLICATE` | already embedded on its companion page, and the video adds nothing it lacks |
| `UPDATE_EXISTING_ARTICLE` | a SAME / SUBSTANTIAL page misses facets the video covers |
| `CREATE_FAQ_SECTION` | the companion / substantial page has no FAQ, and the video asks and answers ≥ 3 real questions |
| `ADD_VIDEO_TO_EXISTING_ARTICLE` | a SAME / SUBSTANTIAL page already answers it — embed only |
| `CREATE_COMPARISON_SUPPORT` | a place comparison next to an existing comparison page |
| `CREATE_NEIGHBORHOOD_SUPPORT` | one place / project next to its area pillar |
| `NEW_ARTICLE` | ADJACENT or DISTINCT, no page commits to the question in its route/headline, and the transcript has the substance |
| `VIDEO_ONLY_NO_ARTICLE` | related but too thin for its own page, or pages already compete |
| `MONITOR_ONLY` | a Short, off-mission, or the topic itself trips Fair Housing |

The tree runs in that order of preference: a new URL is the last resort (cluster
map rule D6: "don't create a page just because a video exists"). A dated record
(a monthly Market Watch piece) is never "the same" as an evergreen video. For a
topic video, a page sharing most of the title's distinctive words counts as the
same piece (it catches tours and events the vocabulary has no word for); for a
comparison, the shared shape logic decides.

## Transcript handling

Every sentence is one of: **fact** (time-sensitive assertion — verify),
**unclear** (sweeping or superlative with no source), **opinion** (Mikey's
judgement, advice, experience or a hypothetical example — publishable as his,
attributed), **narrative**. Anything touching a decaying subject (prices, rates,
HOA, incentives, development status, market stats, laws, commute, builder
availability, construction timelines, programs) is flagged even inside an
opinion. Clock times ("drive it at 5:00 on a Tuesday") are advice, not
measurements. Each checklist item carries the claim, why it decays, the
preferred source type, and `transcriptSufficient: false`.

## Draft

The body draft is the video's own sentences, cleaned of filler only:

- no marker — Mikey's words, publishable as his
- `[VERIFY m:ss]` — check before it ships
- `[FAIR HOUSING — removed: …]` — spoken framing never carried into copy

Sections follow the manifest's chapters, else the questions Mikey asks on
camera. Title/H1 is the video's published title; meta description and dek come
from YouTube's description (never containing a figure), else the opening. All
generated lines pass the Fair Housing and voice gates. The Publisher writes the
final, complementary article — not a transcript.

## Schema

`StoryMeta.video` is proposed exactly as `lib/story.ts` consumes it: name,
YouTube's description, local poster (else YouTube's own thumbnail URL — the
`/guides/is-las-vegas-a-buyers-market` precedent), uploadDate, ISO duration,
embed/watch URLs. Missing fields are BLOCKED, never invented; viewCount /
ratings are never proposed. FAQPage is recommended only for a visible FAQ on a
guide page; area pillars render `AreaFAQ` without it by design.

## Confidence

HIGH needs: a verified transcript, a clear topic, a clear relationship to
existing content, no unresolved factual blockers, no Fair Housing issue, and a
non-provisional action. LOW (no transcript, Fair Housing block, provisional,
monitor) is never handed off. Everything else is MEDIUM.

## Lifecycle, dedupe, handoff

`fingerprint = sha1(videoId | target-or-proposed route | action)[0:12]`

`NEW` (transcript required) → `ANALYZED` → `READY_FOR_PUBLISHER` → `HANDED_OFF`
→ `PUBLISHED` (a commit carries `LVINIT-Video-Fingerprint: <fp>`), plus
`REJECTED` (monitor / Fair Housing) and `DUPLICATE`. A PUBLISHED, DUPLICATE or
REJECTED fingerprint with an unchanged transcript is skipped on later runs; a
live-queued item that never publishes is pulled after `maxAttempts`.

**Handoff is a dry run.** `handoff-queue-<date>.json` holds at most 2 eligible
packages, highest confidence first, and nothing reads it. Turning it on
(`YT_PIPELINE_HANDOFF_ENABLED=true`) is a separate decision that also needs a
Publisher-side reader; until then the Publisher can be pointed at a package by
hand. When the Publisher executes one, it adds the `LVINIT-Video` and
`LVINIT-Video-Fingerprint` trailers.

## Never

Publishes or edits a page · commits, pushes or deploys · triggers the Publisher
· adds links to existing pages · invents transcript text, FAQ answers, upload
dates or durations · polls YouTube.
