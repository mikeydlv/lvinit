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
| Producer | *phase 2*, GitHub Actions, Monday morning |
| Shared state | `lvinit-agent-state` → `data/executive-producer/`, `reports/executive-producer/` |
| Private state | `~/.lvinit/executive-producer/` on Mikey's PC, **never pushed** |

## Build status

| Phase | What | Status |
|---|---|---|
| 1 | Footage Cataloger + complete video inventory | **built** |
| 2 | Producer core (candidates, judgment, validation, brief) on fixtures / dry run | next |
| 3 | Monday workflow + email via Resend | |
| 4 | Performance log + weekly learning loop | |
| 5 | Instagram analytics | |
| 6 | YouTube analytics | |

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
