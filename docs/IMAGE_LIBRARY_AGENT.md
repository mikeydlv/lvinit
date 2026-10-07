# LVINIT Media Image Library Agent

Builds a growing library of authentic, reusable Las Vegas imagery from Mikey's
own LVINIT footage, so the Content Publisher can use real LVINIT images instead
of generated or generic ones.

**Every run creates exactly 10 new, distinct, article-ready images**, or it
fails safely and says why. It never fills the quota with weak frames.

| | |
|---|---|
| Scheduled task | **LVINIT Media Image Library**, daily 8:00 PM Pacific (Windows Task Scheduler on Mikey's PC) |
| Code | `scripts/image-library/` (`run.mjs`, `config.mjs`, `lib/`, `test/`, `schedule/`) |
| Runs from | `%USERPROFILE%\.lvinit\image-library\repo`, a dedicated worktree that follows `origin/main` (never Mikey's working folder) |
| Index (source of truth) | `data/image-library/lvinit-image-library.json` (committed) |
| Index mirror (read-only) | `C:\LVINIT\Automation\lvinit-image-library.json` |
| Images on the PC | `C:\LVINIT\Images\<name>.jpg` (added only, never overwritten) |
| Images on the site | `public/images/editorial/<name>.jpg` → `/images/editorial/<name>.jpg` |
| Run logs | `%USERPROFILE%\.lvinit\image-library\runs\<run>.md` + `.json`, and `image-library.log` |
| Processing state | `%USERPROFILE%\.lvinit\image-library\state.json` (local) |

## What one run does

1. **Preflight.** Footage root, `C:\LVINIT\Images` writable, ffmpeg/ffprobe,
   the Anthropic key (`~/.lvinit/executive-producer/.env`), a clean worktree.
2. **Git.** Pushes any commit an earlier run couldn't push, then follows
   `origin/main`.
3. **Gaps.** Reads the `guides` registry (`lib/content.ts`), the neighborhood
   pillars and `docs/LVINIT_CONTENT_CLUSTER_MAP.md`. For each topic in the LVINIT
   universe (`TOPICS` in `config.mjs`), need = articles + weak imagery (editorial
   cover, reused photo, no image) + strategy-map mentions, divided by how many
   library images already cover it. High-need, low-supply topics are sampled first.
4. **Footage.** Only clips the Executive Producer's local privacy file marks
   **public** are ever sampled (`~/.lvinit/executive-producer/privacy.json`).
   Excluded folders (client listings, addresses) are never opened; new folders
   stay unsampled until Mikey approves them. Graphics, Shorts, OpusClip, review
   renders, A-roll/talking-head cuts and footage under 1280px are skipped.
5. **Candidates.** Evenly spaced frames per clip (offset differently each pass,
   never within 4 s of a time already examined, or 10 s of a frame already
   used). Local checks reject blur/motion blur, under/over-exposure, flat
   low-information frames and near-duplicates (64-bit dHash ≤ 10 bits from any
   library image or any existing photo in `C:\LVINIT\Images` or
   `public/images`). The best two distinct frames per clip are refined to the
   sharpest frame ±⅓ s.
6. **Photo review.** Claude (`claude-opus-5-5`) sees each surviving candidate at
   ~1024 px and keeps or rejects it against the LVINIT standard: dashboard
   frames, transitions, title cards, captions, awkward freeze-frames, private
   information (house numbers, plates, faces in focus, interiors of occupied
   homes) and low article value are rejected. For keepers it writes the subject,
   description, category, topics, alt text, filename, keywords, possible
   article uses and existing-article matches.
7. **Location honesty.** A place may appear in a filename or `location` only
   with evidence: the folder's documented place (`FOLDER_HINTS`), a place read
   on visible signage, or an unmistakable landmark. The code re-checks every
   filename (`lib/naming.mjs`) and strips unproven place names.
8. **Selection.** Best-scoring 10, at most one per clip, one per folder, two per place, three per area (Summerlin, Henderson…), two
   portrait, all visually distinct. Fewer than 10 → the run fails and records
   why; nothing is saved.
9. **Export.** Source-resolution frame (HDR/HLG tone-mapped to SDR), resized to
   a 1920 px long edge (never upscaled), mozjpeg quality 82, ≤ 900 KB.
10. **Publish.** Writes the JPGs into `public/images/editorial/`, appends the
    records to the index, validates it, commits **only** those files
    (`content: add 10 LVINIT editorial images`), copies the JPGs into
    `C:\LVINIT\Images`, and pushes to `main`. If `origin/main` moved, it
    rebases its one commit and retries; a conflict aborts cleanly. It never
    force-pushes.

## Failure behavior

Any failed step ends the run with a FAILED log entry and a Windows toast; no
partial work is pushed. If the commit was made but the push failed, the commit
stays in the worktree and is pushed first on the next run. A crash before the
commit removes the run's new repo files.

## Index record

```json
{
  "filename": "henderson-inspirada-community-park-aerial.jpg",
  "localPath": "C:\\LVINIT\\Images\\henderson-inspirada-community-park-aerial.jpg",
  "repoPath": "public/images/editorial/henderson-inspirada-community-park-aerial.jpg",
  "webPath": "/images/editorial/henderson-inspirada-community-park-aerial.jpg",
  "sourceVideo": "Media/Henderson/Inspirada/aventura-park-basketball.MP4",
  "sourceVideoPath": "C:\\LVINIT\\Media\\Henderson\\Inspirada\\aventura-park-basketball.MP4",
  "timestamp": "00:00:04", "timestampSec": 4.2,
  "captureDate": "2026-10-07", "footageDate": "2026-07-15",
  "location": "Inspirada, Henderson", "locationEvidence": "folder",
  "subject": "…", "category": "park-trail", "description": "…", "altText": "…",
  "topics": ["henderson", "outdoors"], "keywords": ["…"],
  "possibleArticleUses": ["…"],
  "existingArticleMatches": [{ "slug": "…", "title": "…", "href": "/guides/…" }],
  "orientation": "landscape", "aspectRatio": "16:9", "width": 1920, "height": 1080, "bytes": 412345,
  "hash": "dHash hex", "quality": { "photo": 8, "articleValue": 8, "sharpness": 2795 },
  "usedOn": [],
  "github": { "status": "pushed", "commit": "…" },
  "addedAt": "…", "runId": "…"
}
```

`usedOn` (pages already referencing the image) and `github` are refreshed on
every run. A record's own commit hash is filled in by the next run (a commit
can't contain its own hash); the PC mirror has it immediately.

## Content Publisher connection

`.claude/agents/lvinit-content-publisher.md` §5.0b makes the index the first
image source for every new or substantially updated article. This agent never
edits or republishes articles; it only marks likely matches in
`existingArticleMatches`.

## Commands

```
node scripts/image-library/run.mjs --dry-run      # choose + export to ~/.lvinit/image-library/dry-run, no commit
npm run images:test                               # unit tests
Start-ScheduledTask -TaskName "LVINIT Media Image Library"     # trigger the real job now
Get-ScheduledTask -TaskName "LVINIT Media Image Library" | Get-ScheduledTaskInfo
powershell -ExecutionPolicy Bypass -File scripts\image-library\schedule\register-daily-task.ps1   # (re)install
```

Approve a new footage folder (e.g. a new community shoot) so the agent can
sample it. This is Mikey's decision and also applies to the Executive Producer:

```
npm run producer:catalog -- --approve="Media/<Folder>"
```

## Cost and size

About 6 Claude review calls per run (~$0.40–0.80/day at Opus 5.5 list price;
the exact figure is in each run log). About 10 × 300–500 KB = 3–5 MB of images
are added to the repo per day.
