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
- When adding photos, use **local files in `/public/images/`** with descriptive
  filenames (e.g. `hero/summerlin-drone-overlook-golden-hour.webp`).
- **Never hotlink** random external images.

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
