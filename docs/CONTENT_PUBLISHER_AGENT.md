# Content Publisher Agent

> How to use the **`lvinit-content-publisher`** subagent — LVINIT's Content
> Publisher and Editorial Producer. It turns Mikey's real source material into a
> complete, connected, honest content package (website + social) without needing
> the LVINIT brand, architecture, integrity, photography, or publishing rules
> re-explained each time.
>
> **Agent file:** [`.claude/agents/lvinit-content-publisher.md`](../.claude/agents/lvinit-content-publisher.md)
> · **Related:** [PROJECT_STATE.md](PROJECT_STATE.md) ·
> [STORY_PAGE_STANDARD.md](STORY_PAGE_STANDARD.md) ·
> [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md)

---

## What it does

- Turns real photos, videos, transcripts, notes, and verified research into
  finished LVINIT content — no re-briefing required.
- Builds and updates **neighborhood guides**, **stories/features** (on the Story
  Page pattern), and **video companion pages**.
- **Ranks and places photography**, exports properly sized WebP derivatives with
  descriptive filenames and accurate alt text, and verifies crops on desktop and
  mobile.
- Writes **SEO metadata** (title, description, canonical, Open Graph, Twitter)
  and valid **structured data** (Article / Breadcrumb) via the existing
  `lib/story.ts` helpers, and updates the manual `app/sitemap.ts`.
- Wires **internal links** across real content clusters (pillar ↔ story, homepage
  cards/indexes) — real routes only.
- Packages video for **YouTube** (titles, description, chapters, hashtags, pinned
  comment, credits, end screen/cards, filename, thumbnail direction) and produces
  **platform-specific social copy** (Instagram, TikTok, Facebook, YouTube Shorts)
  with hooks, clip concepts, and a distribution plan.
- Runs the production build, verifies the browser preview, then commits and (for
  build tasks) pushes through the GitHub → Vercel workflow.

## What it does NOT do

- Fabricate prices, stats, ratings, dates, quotes, testimonials, events,
  businesses, amenities, milestones, or video scenes.
- Claim to have watched footage it couldn't inspect, or describe unseen shots.
- Use mismatched or AI-generated imagery as Mikey's real photography, or credit
  Mikey for images he didn't capture.
- Create fake "coming soon" pages or link to routes that don't exist.
- Change compliance / brokerage / license / Equal Housing / REALTOR® / analytics
  / contact / legal copy casually.
- Redesign the site or change design tokens unless the task explicitly asks.
- Act as an autonomous real-estate salesperson or a generic keyword-stuffing SEO
  writer.

When a fact is uncertain, it verifies from primary sources, phrases cautiously,
omits it, or flags it for your review — it does not guess.

## File location

`.claude/agents/lvinit-content-publisher.md` (project-scoped; committed to the
repo, so it travels with the project and is shared with anyone who clones it).

## How to invoke it

Mention it by name in a normal Claude Code message:

```
@"lvinit-content-publisher (agent)" <your request>
```

Claude Code may also delegate to it automatically when a request clearly matches
its description. You can always name it explicitly to force it.

## Example requests

```
@"lvinit-content-publisher (agent)" Review these uploaded Summerlin photos, rank
them for the site, and give me a placement plan. Do not edit yet.
```
```
@"lvinit-content-publisher (agent)" Build a companion story for this finished
YouTube video, connect it to the correct neighborhood pillar, add credits, verify
the page, commit, and push.
```
```
@"lvinit-content-publisher (agent)" Turn this neighborhood shoot into one website
story, three Shorts concepts, and platform-specific posting copy.
```
```
@"lvinit-content-publisher (agent)" Update the Henderson page with these real
photos. Select only the strongest images and verify desktop and mobile crops.
```
```
@"lvinit-content-publisher (agent)" Package this video for YouTube, Instagram,
TikTok, and Facebook, including chapters, pinned comment, credit language,
filenames, and a seven-day distribution plan.
```

> **You do not need to restate LVINIT's brand, brokerage, architecture,
> integrity, photography, or publishing rules in a normal request.** The agent
> already carries them (and reads the repo's docs on each task). Just give it the
> material and the goal.

## Expected inputs

Original Samsung / DJI / drone / camera photography (DNG, JPG, PNG, WebP), a
YouTube URL, a transcript or voiceover script, visit notes, a finished long-form
video, vertical/short-form clips, screenshots, a content idea, a neighborhood
name, or a plain instruction ("build this," "publish this," "package this for
social"). Incomplete inputs are fine — the agent uses honest fallbacks (see
below) rather than fabricating.

## Default action rules

- **Read-only verbs** — *audit, review, recommend, rank, plan, "tell me where
  these should go"* → the agent stays read-only and returns a recommendation or
  plan; it does not edit.
- **Build verbs** — *build, create, add, update, replace, publish, wire this in,
  put this on the site, make this live* → the agent implements the full
  reasonable scope (edit → optimize assets → metadata/schema → sitemap → internal
  links → cards/indexes → docs → build → verify desktop/mobile → commit → push)
  without asking again for ordinary decisions.
- It asks **one focused question only when genuinely blocked** — contradictory
  facts, third-party asset permission, a missing embed URL, an identity/compliance
  issue, a destructive structural change, or a risk of publishing false info.
- **Honest fallbacks:** no real hero → photoless editorial mode; no verified
  metric → omit it; no extra photos → strong text-and-video layout; unbuilt
  related story → non-linked "coming soon" only if it belongs; inaccessible video
  → use the transcript/notes, invent no visuals; unverifiable current fact → omit
  or flag.

## Honesty and attribution rules

- **No fabricated** stats, prices, ratings, dates, quotes, testimonials, events,
  or video scenes. Changeable facts get verified against official sources first.
- **Mikey-owned photography** is covered by the global footer credit (no per-image
  credit unless a page needs a specific caption).
- **Licensed / developer / promotional / rendering / third-party imagery** keeps a
  clear source record, gets an appropriate visible credit where required (like the
  North Las Vegas hero's "Photo: … / Shutterstock" line), is **never** presented
  as Mikey's own, and carries matching credit language into any video it appears
  in. Uncertain licensing is flagged, not assumed.
- Reports distinguish **built locally → committed → pushed → deploying → verified
  live** — the agent never calls something "live" just because it was committed.

## How project memory is used

The agent uses the project's file-based memory for **durable lessons only** —
established writing patterns, approved page structures, image-placement rules,
preferred metadata patterns, known content clusters, confirmed local corrections
from Mikey, repeated workflow decisions, attribution conventions, and mistakes to
avoid. It never stores temporary chatter, unverified facts, secrets, or personal
data, and **memory never overrides newer code or docs** — the repository stays the
source of truth.

> **Note on the `memory: project` frontmatter field.** The original setup brief
> recommended `memory: project`, `effort: high`, and `permissionMode: default` in
> the agent's YAML. These are **not confirmed-supported subagent frontmatter
> fields** in the installed Claude Code, and the project rule is "do not invent
> unsupported settings," so they were intentionally left out of the frontmatter.
> Persistent memory is instead wired through the body instructions (§10 of the
> agent) using the file-based memory system, which every agent in this project can
> already use. Reasoning effort is a session-level setting; the default permission
> mode is already the default. If a future Claude Code version documents these as
> valid subagent fields, add them to the frontmatter then.

## How to update the agent later

1. Edit [`.claude/agents/lvinit-content-publisher.md`](../.claude/agents/lvinit-content-publisher.md)
   directly — the body is plain Markdown; the top is YAML frontmatter.
2. Keep the frontmatter to fields the installed Claude Code version supports
   (`name`, `description`, `tools`, `model`, `color`). Leave `tools` unset to
   inherit the full project toolset (needed so the agent can inspect the repo,
   research, edit, optimize images, build, preview, and verify).
3. If you change what the agent is *for*, update its `description` (that's what
   triggers automatic delegation) and this doc's "What it does / does not do".
4. Re-check this file's examples and rules stay in sync with the agent body.
5. Commit the change with a scoped message. A restart of Claude Code is only
   needed the very first time the `.claude/agents/` directory is created (see
   PROJECT_STATE.md).
