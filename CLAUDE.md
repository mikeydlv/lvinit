# CLAUDE.md — Working Rules for LVINIT

Permanent working rules for Claude Code on the LVINIT project. Read this before
making changes. When a request conflicts with a rule here, stop and confirm.

## What LVINIT is

LVINIT is a Las Vegas living, relocation, neighborhood, and real estate media
platform. It should feel **premium, editorial, bright, local, honest, and
modern** — a trustworthy guide to living in Las Vegas first, a real estate
business second.

## Voice & tone

- Sound like **Mikey**: direct, conversational, local, helpful. Not corporate,
  not fake luxury, not hype.

## Content integrity (do not fabricate)

- **Do not invent** testimonials, resident quotes, legal copy, compliance copy,
  MLS data, pricing, stats, or market claims. If real content isn't available,
  leave it clearly unfinished or ask — never fake it.
- **Never change** brokerage / legal / license / Equal Housing / compliance copy
  unless explicitly instructed.

## Imagery

- **Do not** use fake AI-looking real estate imagery, vector landscapes, or
  generic stock vibes unless explicitly approved.
- **Prefer real, Mikey-owned photography** whenever available.
- `C:\LVINIT\Images` is an **approved first-party LVINIT photography library**
  — all Mikey-captured and Mikey-owned, confirmed permanently. Search it first for
  article imagery; never ask to reconfirm ownership or licensing for files from
  it; never modify the originals (copy out, optimize the copy).
- When adding photos, use **local files in `/public/images/`** with descriptive
  filenames (e.g. `hero/summerlin-drone-overlook-golden-hour.webp`).
- **Never hotlink** random external images.
- **Image reuse: ONE IMAGE → MAXIMUM ONE HERO PLACEMENT** (Mikey's policy,
  2026-10-07; the Content Publisher routine §6.7/§6.8/§6.11 and the agent file
  §5.0b.7/§5.0b.8 carry the same policy). Before choosing an image, check its
  image-library `usedOn` and `usage`, and check whether its path is referenced
  in `app/`, `lib/` or `components/` when needed.
  - **Hero images:** The same image may only serve as a hero image on ONE
    article. Never use an image as a hero if its `usage` history already
    contains a hero placement, which makes it permanently hero-ineligible.
    Previous inline use does NOT disqualify an image from becoming a hero.
    Hero uniqueness depends on previous HERO usage, not on earlier use of any
    kind. For an image used before `usage` tracking began, check the
    referencing file. If it was a hero, or you can't tell, treat it as a prior
    hero placement.
  - **Inline images:** Prefer unused inline images whenever equally relevant
    alternatives exist. Inline images may be reused when they genuinely
    support the section and are the best available visual. A previous hero
    may appear inline, and a previous inline image may be reused inline, when
    genuinely useful. Don't reuse inline images merely for convenience, and
    avoid repeating the same inline image across many articles when other
    relevant images are available.
  - **Tracking:** Keep `usedOn` in its existing format so the nightly Image
    Library Agent can rebuild it safely. Keep the separate persistent `usage`
    array (one entry per placement: role hero or inline, article slug, article
    URL, article section when practical, assignment/publication date). Never
    alter or remove previous `usage` records. Only write usage after the
    article is verified live. If publishing fails, don't add the article to
    `usedOn` and don't add a `usage` entry.
  - If no eligible, suitable image exists, use a new one or the no-image
    fallback.

## Brand & design system

- **The Scofield Group** is the brokerage / compliance / trust layer.
- Primary accent: **Scofield Blue `#2B6CB0`**.
- Typography: **Playfair Display** for major editorial headlines, **Inter** for
  body and UI — unless instructed otherwise.
- The LVINIT wordmark is **LVI** in near-black and **NIT** in gold `#C8A46A`.
- **Do not redesign unrelated sections.** Change only what the task asks for.
- **Do not change approved docs** (e.g. under `docs/`) unless explicitly
  instructed.

## Working process

- **Before major structural changes, explain the plan first.**
- **If something is unknown, stop and ask** instead of guessing.
- **Build and verify before committing** (`npm run build`, then verify in the
  browser preview).
- **Commit with clear messages.**
- **Push to GitHub only after** the requested task is completed and verified.

## IDX / MLS

- Keep IDX/MLS integration **compliant**. Do not modify the Matrix embed
  behavior unless explicitly instructed.

---

## Current Project Status

- **Live site:** https://www.lvinit.com
- **IDX search page:** `/search` (Matrix IDX embed)
- **First neighborhood page:** `/neighborhoods/summerlin`
- **Workflow:** GitHub + Vercel workflow is active.
- **Photo library:** still being built — real photography is being added over
  time; neutral stand-ins remain in some sections until real photos land.
- **Current priority:** homepage polish, real Summerlin photography,
  neighborhood pages, and Four Seasons content.
