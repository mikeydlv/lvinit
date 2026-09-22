# LVINIT Executive Producer

**What it answers:** *What should Mikey say on camera this week that is most
likely to make Las Vegas locals and relocation buyers stop, watch, comment,
share, save, follow, trust him, and eventually DM him?*

Every Monday it will email one short brief: four 30–60 second talking-head
videos, each with its hook, what to say, which **existing** footage to lay over
it, and whether any new filming is truly needed. Target: 45–60 minutes of A-roll
a week, recorded at the office, with little or no field filming.

It is a **decision** agent. It consumes the other agents' output (the Local
Trend Agent stays separate as background research). It never publishes, posts,
films, edits the site, or contacts anyone but Mikey.

| | |
|---|---|
| Footage Cataloger | `scripts/executive-producer/catalog.mjs`, **runs on Mikey's PC** |
| Producer | `scripts/executive-producer/run.mjs` (GitHub Actions on Mondays from phase 3) |
| Shared state | `lvinit-agent-state` → `data/executive-producer/`, `reports/executive-producer/` |
| Private state | `~/.lvinit/executive-producer/` on Mikey's PC, **never pushed** |

## Build status

| Phase | What | Status |
|---|---|---|
| 1 | Footage Cataloger + complete video inventory | **built**, catalog on the state branch |
| 2 | Producer core: candidates, spouse test, scoring, footage matching, brief | **built** (sample + fixtures) |
| 3 | Monday workflow + email via Resend | next |
| 4 | Performance log + weekly learning loop | |
| 5 | Instagram analytics | |
| 6 | YouTube analytics | |

---

## Monday production (current direction)

Every Sunday by 8:00 PM Pacific the Producer delivers **seven finished draft posts** for the coming week (Mon–Sun) to
`OneDrive\Documents\LVINIT\Weekly Posts\Week of <date>\`, with one `preview.html`,
a ZIP, and an email saying it's ready or that it failed and why. Nothing is ever
published.

```bash
node scripts/executive-producer/weekly.mjs                    # this week (Pacific)
node scripts/executive-producer/rehearsal/run-rehearsal.mjs   # full chain, paid services simulated
```

### The unattended chain

| Step | What happens | Service |
|---|---|---|
| ledger | Refresh Mikey's recent posts (Instagram/TikTok via Apify, YouTube from his public channel); mark drafts that were actually posted as published | Apify, YouTube |
| research | Other creators on Instagram and TikTok | Apify |
| plan | 7 posts + 3 backups | Claude (text) |
| verify | Local gate + claim-by-claim meaning check against the cited evidence; up to two rewrites (unsupported sentences are deleted, not reworded); then a backup through the same check; any day still missing gets a new post written for it and checked, so the week reaches seven | Claude (text) |
| frames | Candidates from approved footage; local variety rules (no repeats, no burst twins, clip moments far apart); Claude picks from a low-res sheet | Claude (images) |
| render | Slides / reel | local |
| review | Claude reviews every finished post (readability, crop, relevance, repeats, excluded content). Readability: move text, then pull exposure (two steps), then change the image. Wrong/private/repeated image: exclude it and search wider. Three repair rounds; a middle slide with no usable image is dropped (4+ slides kept). What remains becomes an exception with a recommended resolution | Claude (images) |
| package | `week.json`, `status.json`, preview, ZIP | local |
| notify | Email (Resend) + Windows notification, success or failure | Resend |

`run.json` records each step's time, **costs per service and per step**, token
counts, **manual interventions** (separately from steps skipped for missing
credentials), gate replacements, and exceptions. Setup: copy
`scripts/executive-producer/env.example` to `~/.lvinit/executive-producer/.env`.

### Slide type standard (default for every batch)

Set by Mikey on 2026-09-22 and built into the shared template (`lib/render.mjs`, `TYPE`):

- Real photos, white Inter text, letter-shaped shadow, small LVI/NIT wordmark. No panels or boxes.
- Headline 92px on a 1080×1350 slide, reduced only as far as 76px to stay within three lines. Supporting text 46px, 42px at the smallest, up to four lines.
- Line breaks are balanced (no single stranded word), and place names and short dates ("Las Vegas", "Sept. 8") never split.
- Planner copy limits: headline 8 words or fewer, supporting line 20 words or fewer. Copy that still doesn't fit is sent back to be shortened with the same meaning; the type is never shrunk further.
- Slide 1 states the hook and what the carousel delivers. The last slide gives the save/send reason and the CTA.
- Never state a pictured home's orientation (for example, west-facing) or anything else the source doesn't verify.
- The visual review looks at each slide at about 800px, so house numbers, plates and signage are caught, not just layout.

### Post states

`draft` (every generated post) → `approved` / `scheduled` (optional, in the week's
`status.json`) → `published` (detected automatically from Mikey's own posts).
Only approved, scheduled and published count as history for duplicate checks.
**Gap:** posts scheduled inside Instagram/Meta Business Suite or TikTok are not
visible to the system; every run and email says so.

### The editorial gate (`lib/gate.mjs`) and claim check

| Check | Rule |
|---|---|
| Duplicate | Primary topic matches something approved, scheduled or published in the last 21 days |
| Superlative / comparison | "best", "closest", "-est", "nearer", "X-er than", "more X than": needs an official or news source; rewording a comparison doesn't make it supported |
| Claim meaning | Every factual sentence must be stated by the cited evidence with the same meaning (Claude, per claim) |
| Distinct takeaways | No two posts in a week teach the same lesson |
| Financial / legal | Official or news source checked within 30 days; no figures older than 6 months; never implies a program is available |
| Generic | Las Vegas-specific detail on the images; no stock Realtor phrasing |
| Images | No repeated file/moment this week or the last 4; no near-identical crops |

### Missed starts, duplicates, failures

`schedule/register-weekly-task.ps1` starts the run **Sunday 7:00 PM Pacific**
for delivery by 8:00 PM (Mikey's choice), producing the week that starts the
next day. It wakes the PC (WakeToRun), catches up at next startup if the PC was
off (StartWhenAvailable; a Monday–Friday catch-up produces the current week), retries
twice, never overlaps. `DONE.json` makes re-runs of a finished week exit. Any
failure writes `RUN-FAILED.md` and sends a failure email naming the step and
reason. **Gap:** if the PC stays off all week, nothing runs and nothing is sent.

### What leaves the PC

| Where | What |
|---|---|
| Apify | Search keywords and Mikey's public handles. No media. |
| Anthropic (text) | Research results, ledger, LVINIT page text, catalog metadata, the week's copy |
| Anthropic (images) | **Low-res sheets of candidate frames from approved clips** (frame picking; `LVINIT_VISION_FRAMES=off` disables it) and **low-res strips of the finished slides** (visual review) |
| Resend | The notification email to Mikey |
| GitHub (public state branch) | Sanitized footage catalog metadata only |
| OneDrive | The finished posts, preview and ZIP (synced to Microsoft's cloud) |

Raw footage, held/excluded files and the privacy rules never leave the PC.

---

## Phase 2: the Producer

```bash
npm run producer:brief         # this week's brief (Claude if ANTHROPIC_API_KEY is set, rules-only otherwise)
npm run producer:sample        # real pages + real footage, judged by the in-repo sample judgment
npm run producer:fixtures      # synthetic everything
node scripts/executive-producer/run.mjs --shortlist   # what it's choosing between, with offered clips
```

### How it decides

1. **Candidates**, deliberately not news-first:
   - every published LVINIT page, as a 45-second take on something Mikey already researched
   - published videos with no companion page
   - real search questions from Search Console that LVINIT doesn't answer head-on
   - Local Trend Agent topics, as background research, capped at one pick a week
2. **Pre-score (free rules).** Headline language that matches the Summerlin vs Henderson
   pattern scores up: debates, myths, "nobody tells you", hidden costs, relocation
   and new-build decisions. Comparisons, buyer guides and cost-of-living pieces
   score up. Generic market updates score down. Anything recommended in the last
   four weeks is held back. The top 14 go to judgment.
3. **Footage matching.** Each idea gets the best existing B-roll from the catalog.
   Comparisons get a clip from every side. Topic words find the right library
   vocabulary (rent → apartment clips; new build → builder communities). Already-cut
   Shorts and graphics from the related video project come along too.
4. **Judgment (one Claude call a week).** For each idea: the **spouse test** (a fail
   drops it), hook, a 45–60 second beat-by-beat script with B-roll per beat, talking
   points tied to a source page, packaging (thumbnail, carousel, Story, YouTube,
   DM-keyword lead gen, comment prompt), and 1–5 scores for scroll-stop, comment,
   share, save, follow, DM/lead and trust.
5. **Validation in code.** Clips it wasn't offered are removed. A talking point
   citing a page it wasn't given is downgraded to opinion. **Every number is
   checked against the LVINIT page text**, and one that isn't there is flagged
   "confirm before recording".
6. **Scoring and picks.** Ease and reuse are computed. The total weights Mikey's
   order: comments and scroll-stop, then follows, shares, saves, DMs, trust, ease,
   reuse. **New filming is YES only if the idea scores 85+ and the library can't
   cover it.** Four picks are chosen with no two versions of the same debate, at
   most two of one format, at most one news item, and never two from one page.

### What Mikey gets

- **Email (short):** per priority: title, hook, why it should work, existing
  B-roll, new filming YES/NO, recording time. Then total A-roll minutes and a link
  to the sheets.
- **Production sheets (full):** the script table (timing, what to say, which clip),
  talking points with sources, spouse test, emotional angle, audience, why people
  will comment/share/save, footage paths, ready-made Shorts, packaging, scorecard,
  anything to check.

### Without an API key

Rules-only mode still picks four ideas and matches footage. The hooks are the
published headlines and the beats are the page's own sections, so the email says
at the top that the angles need Mikey. It never writes a template hook.

To enable the full judgment, add an `ANTHROPIC_API_KEY` repository secret. The
Local Trend Agent uses the same secret. Cost is one Opus call a week, roughly
$1–2.

---

## Phase 1: the Footage Cataloger

The raw footage lives in `C:\LVINIT` on Mikey's PC, where GitHub Actions can't
see it. The cataloger reads it locally and produces a **sanitized, metadata-only**
catalog the Producer can use in the cloud.

```bash
npm run producer:catalog            # scan + write; review before pushing
npm run producer:catalog:push       # same, then push the sanitized catalog
npm run producer:test               # test suite (no media, no network)
node scripts/executive-producer/catalog.mjs --help
```

Run it after adding footage (weekly is plenty). The first run probes every file
(a few seconds; ffprobe reads headers only). Later runs only probe new files.

### What it records per file

Folder, place and area; video, photo, graphic or script; role (B-roll, A-roll,
Short, long-form, thumbnail, graphic); camera (drone, handheld, phone, edited),
from the **encoder tag**, since on Mikey's gear a `DJI_…` file can be the Mini 5
Pro drone *or* the Osmo Pocket 3; orientation; duration; capture date and time
of day (golden hour, midday…); a subject from descriptive file names; and, for
`Videos/` projects, which published YouTube video it belongs to.

It does **not** look inside the frame. A clip named `DJI_0285.MP4` in
`Mesa Ridge park` is "a drone clip at Mesa Ridge Park", nothing more.

### The video inventory

`lib/content.ts` lists the five homepage videos. Four more published videos exist
only as embeds inside pages. The inventory reads both, plus YouTube's live
titles, and records for each video the pages it's on, its local project folder,
and the Shorts, A-roll and thumbnails already cut for it.

### Privacy: what may leave the PC

Every file gets exactly one status:

| Status | Meaning | Leaves the PC? |
|---|---|---|
| **excluded** | Inside a folder on the exclude list (client listings, property addresses, private shoots), matched at any depth | Never read, never listed, not even locally |
| **local-only** | Folder not approved yet, held on purpose, or the file name looks private (a document, screenshot, text message, street address, or a drive past individual homes) | No |
| **public** | In an explicitly approved folder and nothing flagged it | Only as metadata in the sanitized catalog |

- **Approval is per exact folder.** A new subfolder, even under `Summerlin`, stays
  local-only until approved, so nothing new leaks by inheritance.
- **No media is ever uploaded.** No GPS: ffprobe is only asked for duration,
  dimensions, frame rate, creation time and encoder.
- **The rules live on the PC** in `~/.lvinit/executive-producer/privacy.json`.
  The repo is public, so client and address names never appear in it.
- **A leak guard** reads the final JSON before anything is written and refuses if
  it finds coordinates, location fields, drive paths, or the name of any
  excluded or held item. It caught a real one on the first run: a Short whose
  file name contained an excluded property address.

**Deciding on held items.** `~/.lvinit/executive-producer/catalog-review.md` lists
them, each with the command to run:

```bash
npm run producer:catalog -- --approve="Media/New Folder"      # general B-roll
npm run producer:catalog -- --exclude="Smith Listing"          # private, never read
npm run producer:catalog -- --hold="Media/X/clip.mp4|reason"   # keep local-only
```

### Files

```
scripts/executive-producer/
  config.mjs          media roots, folder → area map, project → YouTube map, privacy patterns
  catalog.mjs         the local runner
  lib/privacy.mjs     excluded / local-only / public
  lib/scan.mjs        read-only walk; excluded folders pruned before entry
  lib/probe.mjs       ffprobe, whitelisted fields, cached
  lib/describe.mjs    role, camera, area, subject, capture time
  lib/sanitize.mjs    public catalog + leak guard
  lib/videos.mjs      complete video inventory
  lib/review.mjs      the local review report
  lib/publish.mjs     push to lvinit-agent-state (namespace-locked)
  test/               node:test suite
```

Output on `lvinit-agent-state`:

```
data/executive-producer/footage-catalog.json   sanitized catalog + per-folder summaries
data/executive-producer/video-inventory.json   every published video + what's already cut
```
