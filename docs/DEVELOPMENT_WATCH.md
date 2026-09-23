# LVINIT Development Watch

**What it answers:** *Did something actually change around the valley that
could affect where people live, buy, rent or commute, and is it verified?*

It is an early-warning system for meaningful development change, not a news
feed:

```
monitor → detect a real change → verify → dedupe → score → classify → (dry-run) hand off
```

A normal day is a few lines, and **"0 meaningful changes today."** is a
complete, correct report.

It is a **module of the [Local Trend Agent](LOCAL_TREND_AGENT.md)**, not a
second agent. It runs in the same daily job, reads the same collection pass
(no feed is polled twice), and keeps its state on the same
[`lvinit-agent-state`](AGENT_STATE_BRANCH.md) branch.

| | |
|---|---|
| Code | `scripts/local-trends/devwatch/`, plus the shared source registry `scripts/local-trends/sources.mjs` |
| Workflow | `.github/workflows/local-trend-agent.yml` (the trend agent runs with `--devwatch`) |
| Schedule | Daily, 6:30 AM Pacific. Monday also writes the weekly summary. |
| Output | `reports/development-watch/` and `data/development-watch/` on `lvinit-agent-state` |
| Secrets | None. It runs on rules only, with no model call. |
| Cost | Free. About 25 extra requests a day on top of the trend agent's roughly 55. |
| Publisher handoff | **Off.** The queue file is always stamped `dry-run`, and nothing reads it. |

---

## How it relates to the other agents

| Agent | Question | Relationship |
|---|---|---|
| Local Trend Agent | What should Mikey *make* next? | Same run and same collection. Trends is the content-idea list. **Development Watch's `projects.json` is the source of truth for development project identity and status.** |
| Content Brief Generator | What do people *search* for? | Development Watch writes `local-development-signals.json` (`LOCAL_DEVELOPMENT_SIGNAL`, `notSearchDemand: true`): editorial intelligence, never demand. The Brief Generator does not read it yet. |
| Content Publisher | Research, write, publish | The execution layer. Development Watch never writes articles. Its queue shows what it *would* hand over, with the Publisher's instructions and commit trailers. |
| Fact-Decay / Internal Linking / GSC | | Untouched. |

---

## Where to read it

On GitHub, switch to the **`lvinit-agent-state`** branch:

- `reports/development-watch/development-watch-YYYY-MM-DD.md` is the daily report
- `reports/development-watch/weekly.md` is the latest weekly summary
- `reports/development-watch/handoff-queue.json` shows what WOULD go to the Publisher (dry-run)
- `reports/development-watch/local-development-signals.json` holds the signals for the Brief Generator
- `data/development-watch/projects.json` is the project registry

The run page of each workflow run also shows the whole report.

### Report sections

| Section | Contents |
|---|---|
| Executive summary | Sources checked and failed, items read, new projects, material updates, duplicates ignored, monitor-only, conflicts, handoff candidates |
| High-priority changes | New or material changes with a Publisher action or brief signal and at least Medium confidence. Each has a stable ID, prior and current status, sources, confidence, score and its breakdown, existing coverage, and the recommended action |
| What would be handed to the Publisher | The dry-run queue |
| Monitor list | Real, but not verified or not ready yet (one line each) |
| Source conflicts | Both sides kept, with links |
| Suppressed as duplicate or noise | Counts and examples, so the filtering is visible |
| Source health | Every source, its result, and its last success. Manual sources say `SOURCE_CHECK_REQUIRED` |

Every event keeps four things separate: **Detected** (what the text says),
**Verified** (primary-source evidence, quoted), **Interpretation** (templated
from extracted facts only, labelled "not fact"), and **Recommendation**.

---

## Sources and the source hierarchy

All sources live in one registry, `scripts/local-trends/sources.mjs`. The
Local Trend Agent's feed list is derived from it, with the same IDs and URLs.
Each record carries its organization, type, URL, geography, topics, method,
authority, cadence, `automatedReliable` (with the date it was verified), and
notes. The last successful check is runtime state, kept in
`data/development-watch/sources.json`.

| Authority | Kind | Sources today |
|---|---|---|
| 1 | Official government | City of Henderson newsroom (RSS), City of Las Vegas newsroom (RSS) · Clark County and NLV newsrooms are **manual** (404/403 to automation) |
| 2 | Planning / zoning / council records | **Clark County Legistar API**: Commission, Planning Commission, Zoning Commission, Redevelopment Agency |
| 3 | NDOT | manual (403) |
| 4 | RTC | manual (403, Cloudflare) |
| 5 | Developer / builder | Summerlin (WordPress JSON), Skye Canyon, Cadence, Lake Las Vegas (RSS), Inspirada (timing out) |
| 6 | Project documents | Henderson 215 schedule: manual (image/JS page) |
| 7 | Corporate filings | SEC EDGAR: manual, not automated in v1 |
| 8 | Reputable local reporting | RJ, Sun, Vegas Inc, KTNV, 8 News Now, News 3, Nevada Current, Nevada Business Magazine, and Google News results from these publishers |
| 9 | Other credible | Unknown publishers in Google News |
| 10 | Community | Reddit: a lead for the trend agent, **never** evidence here |

**Primary = authority 1–7.** Google News results take their *publisher's*
authority. Google itself proves nothing. Press-release wires count as the
company's own announcement (5) and are treated as promotional.

`manual` sources are never fetched. The report lists them as
`SOURCE_CHECK_REQUIRED` so the gap is visible. A source that fails is
recorded, never guessed around, and flagged after 3 failures in a row.

### Efficiency

- **Shared collection:** the trend agent's feeds and ~40 Google News searches are reused.
- **Processed-document memory** (`seen.json`): a URL with unchanged content is skipped.
- **Conditional GETs** (ETag / Last-Modified) for developer feeds.
- **Cadence:** weekly sources are polled once a week.
- **Legistar:** one request per meeting, skipped when the meeting record has not changed since the last run.
- **Tracked-project queries:** one rotating `"<name>" (Las Vegas OR Henderson OR Nevada)` search per unfinished project, 12 a day, oldest first.

---

## The development gate (what counts)

An item passes only if it has **all** of:

1. a development topic: residential, mixed-use/retail, roads/access,
   transit, parks/amenities, employment center, redevelopment, land, or
   casino/resort *project*
2. an action: approved, filed, proposed, broke ground, opened, delayed,
   cancelled, bought acres, and so on
3. a valley location. A local outlet's own feed counts as the valley. A
   "Las Vegas" story that is really about Kingman, Phoenix, Boulder City or
   Reno does not

It must also trip **no noise rule**. The trend agent's rules (crime, sports,
shows, obituaries, weather, school operations, one-off events) come first,
then Development Watch's own: small tenant or restaurant openings, routine
maintenance and short closures, ceremonial or promotional announcements,
generic business news, market statistics, and opinion/advice pieces. Every
rejection is counted by reason on the report.

**Clark County agendas** carry roughly 80 items a meeting. An applicant's
bundle is kept only when it includes an **entitlement action** (zone change,
tentative map, PUD, plan amendment, development agreement, or a use permit
for a resort or mixed use) **and** it is either ≥150 units/lots, or ≥40 acres
of residential, mixed-use, commercial or resort land. It is also kept if it
names a tracked project. Outlying towns (Moapa, Searchlight, Jean…) are
dropped.

---

## Project identity

Every project has a persistent ID such as `DEV-MONUMENT-HILLS`. Projects come
from four places:

1. **Seeds** (`devwatch/entities.mjs`): the projects LVINIT already covers,
   with aliases ("West Henderson Fieldhouse" and "Henderson Sport & Social"
   are one project), context rules for common words ("The Bend" only counts
   near Sunset/Durango), and the dedicated article that covers each.
2. **Every roster row** in the neighborhood pillars' Development Watch
   sections (`lib/areas/*.tsx`), read automatically along with the status
   and source LVINIT publishes.
3. **Clark County applicants:** `DEV-CC-<APPLICANT>-<PLANNING AREA>`, stable
   across hearings.
4. **Discovered:** a name the source introduces ("Fixture Ridge, a 350-home
   community"). If no name can be read, the project is **provisional**
   (`DEV-P-…`), capped at Low confidence, and never handed off.

Aliases match as whole, case-sensitive names, so "a life time of memories" is
not the Life Time gym.

`projects.json` records the name, aliases, area, jurisdiction, developer,
type, current and prior status, status history with evidence, units, acres,
target date, source history, the LVINIT pages that cover it, and when it was
last verified by a primary source. Fields no source supports stay empty.

**Baselines.** For a covered project, "prior status" starts as what LVINIT
itself publishes, taken from its roster row or transcribed from its dedicated
article with the route cited. So the first sighting of a covered project
compares against the site, and a retelling of what LVINIT already says is a
duplicate, not news.

---

## Status vocabulary

```
unclear → proposed / announced → filed / under review → approved / entitled
        → pre-construction → under construction → partially open → open
side states: delayed · paused · cancelled · denied
```

- A status is taken **only** from a sentence in the source's own text that
  carries that status's language. That sentence is kept as the evidence.
- Time guards (shared with the trend agent): "set to open in 2027" is not
  open, "will break ground" is not construction, "which opened last year" is
  not today's news, and "grand opening set for Oct. 16" is not open.
- Marketing never establishes construction or opening. A builder "opening"
  a community means sales are open, so it is recorded as **partially open**.
- A vaguer later story never lowers a status. Side states need their own
  explicit evidence. "Traffic delays" is not a project delay.
- LVINIT's roster label `planned` sits at the approval rung, so an approval
  story about a roster "planned" project is not news.

---

## Change detection and dedupe

All of a run's items about one project become **one observation**: the
status the sources prove, the unit count, and the target date. That
observation is compared with the project's tracked record, or failing that
with LVINIT's published baseline:

| Change | Meaning |
|---|---|
| `NEW` | The project was never seen and LVINIT does not cover it |
| `MATERIAL_UPDATE` | Status moved, the unit count changed more than 15% (with change language or a primary source), or the opening/completion year moved |
| `DUPLICATE` | Same facts as already known, so it is suppressed |
| `CONFLICT` | Sources disagree: a side state against construction or opening, unit counts more than 15% apart, or a non-primary count against the record. Both sides are kept |

**Fingerprint** = `sha1(project | status | units rounded to 10 | target year)`,
first 12 hex characters. It identifies the project's *state*, not an article.
Four outlets on one approval produce **one** event with four sources. Next
week's retelling has the same fingerprint and is not re-surfaced.

**Event ID:** `DEV-2026-09-23-001`, issued once, when a fingerprint first appears.

**Lifecycle:** `NEW` → `PERSISTING` (seen again unchanged, counted, not
shown) · `UPDATED` (same state, first primary source) · `HANDED_OFF` (in a
live queue, never in v1) · `PUBLISHED` (a commit carries the fingerprint) ·
`RESOLVED` (superseded by a newer state of the same project, or unseen for 45
days) · `DUPLICATE` · `REJECTED`.

Only verified, non-conflicting, not-Low changes move the project record.
Low-confidence claims wait in the event ledger until something stronger
confirms them.

---

## LVINIT relevance score (0–100)

| Component | Max | Measures |
|---|---:|---|
| geography | 15 | Tier 1 area 15 · Tier 2 10 · valley-wide 6 |
| housing impact | 15 | residential, by unit count (log) · mixed-use 5 |
| neighborhood impact | 10 | parks, retail, redevelopment, employment near homes |
| commute / access | 10 | roads, interchanges, transit |
| scale | 10 | units / acres / dollars, log-scaled, capped |
| change magnitude | 10 | opening, delay or cancellation 9–10 · approval 9 · filing 5 · duplicate 0 |
| source authority | 10 | authority 1–4 → 10 · 5–7 → 8 · 8 → 6 · 9 → 3 |
| status certainty | 5 | primary body text 5 → headline-only 2 |
| existing coverage fit | 10 | dedicated article 10 · roster 9 · mention 7 · has a pillar 6 |
| decision value | 5 | changes a reader's timeline (approval, construction, open, delay…) |

Scale is only 10 points out of 100. A certain, small change in a covered
neighborhood can outscore a giant, distant project, and a test proves it.
Each event prints its component breakdown.

## Confidence (separate from score)

- **High:** a primary source's own text states the status, the project is
  named, there is no conflict, it is not an early filing, and it is not
  promotional-only.
- **Medium:** reputable reporting states it in article text, or two
  independent outlets do. Early-stage items (proposed, filed, under review)
  are capped here even with a primary source. So is a developer's own
  channel alone.
- **Low:** a single headline, only "other" sources, a provisional project,
  conflicting sources, no status, a construction/opening claim made in a
  headline only, or one made only in marketing.

**Low confidence never triggers anything.**

---

## Content action, one per event

| Order | When | Action |
|---|---|---|
| 1 | Nothing new against what is known | `DUPLICATE` |
| 2 | Sources conflict | `MANUAL_RESEARCH_REQUIRED` |
| 3 | Score < 40 | `REJECT_LOW_VALUE` |
| 4 | Low confidence | `MONITOR_ONLY` |
| 5 | LVINIT has a dedicated article | `UPDATE_EXISTING_ARTICLE` (that route) |
| 6 | It's a roster row | `UPDATE_EXISTING_ARTICLE` (the pillar's roster) |
| 7 | Still early | `CONTENT_BRIEF_INPUT` at score ≥ 55, else `MONITOR_ONLY` |
| 8 | Its area has a pillar, approved or later, score < 75 | `ADD_TO_NEIGHBORHOOD_GUIDE` |
| 9 | Distinct, verified, approved or later, score ≥ 65 | `NEW_DEVELOPMENT_ARTICLE` (housing/land) or `NEW_LOCAL_FEATURE` |
| 10 | Otherwise | `MONITOR_ONLY` |

Existing coverage is checked against every published page (the same
inventory the Internal Linking Agent uses): dedicated articles by route and
title, roster rows with the status LVINIT publishes, and name mentions in
page text (code comments excluded).

---

## Publisher handoff (built, dry-run)

An event qualifies only if **every** one of these holds, and each failure is
a named blocker on the report:

- a Publisher action (update, add to guide, new article or feature)
- score ≥ 70
- confidence High
- at least one primary source
- a `NEW` or `MATERIAL_UPDATE` change
- no conflict
- first report of this fingerprint
- not already handed off
- not already published: no commit carries its fingerprint
- Fair Housing clean on both the subject and our own framing
- not promotional-only
- not provisional
- the target page exists
- git log readable

At most 2 per run.

The queue matches the Content Brief Generator's shape. Each item carries its
primary sources, the change, detected, verified, interpretation and
recommendation, and Publisher instructions ending with:

```
LVINIT-DevWatch: DEV-2026-09-23-001
LVINIT-DevWatch-Fingerprint: 3f2a9c01d4e5
```

Development Watch reads those trailers from `git log`, which is why the
workflow checks out full history, so it never re-queues work already
published.

**Turning it on is a separate decision.** Nothing is wired today. When you
approve it: give the Publisher's scheduled routine a step to read the newest
`handoff-queue.json` from `lvinit-agent-state`, then set
`DEVWATCH_HANDOFF_ENABLED=true` in the workflow's environment. Until then,
the mode is `dry-run` whatever the queue contains.

---

## Fair Housing

The shared rules (`scripts/gsc/lib/fair-housing.mjs`) apply through the
Internal Linking Agent's single `single-family` exemption.

- **Subject:** a project framed around a protected class (age-restricted
  "55+", income-program language, "family" targeting…) is reported
  objectively and is **never** handed off. Road-*safety* projects are exempt
  from this subject check, because they are objective infrastructure.
- **Framing:** everything Development Watch writes is checked, with no
  exemptions. The interpretation templates describe housing, roads,
  amenities, location and scale only. They never say who a place is "good
  for".

---

## Running it

```bash
npm run devwatch:test               # test suite (no network)
npm run devwatch:report:fixtures    # synthetic items, no network
npm run devwatch:report             # live sources, standalone (does its own shared collection)
node scripts/local-trends/run.mjs --devwatch   # the way CI runs it: trend agent + Development Watch on one collection
```

Flags: `--mode=daily|weekly|both`, `--fixtures`, `--dry-run`,
`--today=YYYY-MM-DD`, `--state-dir=DIR`, `--no-excerpts`, `--no-git`. Every
threshold is in `scripts/local-trends/devwatch/config.mjs`, with a
`DEVWATCH_*` environment override.

Locally, output goes to `reports/development-watch/` and
`data/development-watch/`. Both are gitignored on `main`.

---

## Known limits

- **No model.** Everything is deterministic. Project names come from simple
  patterns, so an unnamed story becomes provisional rather than getting a
  guessed name. The cost is some missed grouping: two outlets that describe
  the same site differently can become two events.
- **Google News is headline-only.** Its links are redirects, so claims that
  exist only in a headline stay at Low confidence.
- **Several primary sources block automation:** Clark County and NLV
  newsrooms, NDOT, RTC, and the Henderson 215 schedule. They are listed as
  `SOURCE_CHECK_REQUIRED`, and their news arrives second-hand through local
  outlets.
- **Only Clark County is on Legistar.** The cities of Las Vegas, Henderson and
  North Las Vegas are not on the public API, so their council actions come
  from city newsrooms and local reporting.
- **Agenda applicants and news stories are separate projects.** A county
  item names an LLC while the news names a brand, so matching them is left
  to a human (or to a future alias).
- **Paywalls:** some article excerpts cannot be read, which lowers
  certainty, never raises it.
