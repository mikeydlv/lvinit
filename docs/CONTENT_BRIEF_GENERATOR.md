# Content Brief Generator

> Turns real search demand into a small number of LVINIT-specific editorial
> briefs — checked against everything LVINIT has already published — and hands
> the strongest ones to the Content Publisher.
>
> It **reads and briefs. It never writes to the site.** Research, writing,
> photography, metadata, links, build, commit and push all stay with the
> [Content Publisher](CONTENT_PUBLISHER_AGENT.md).

---

## The one-paragraph version

Every Tuesday it takes Monday's Search Console report and groups every query
into an underlying search intent ("summerlin vs southwest", "southwest vs
summerlin" and "is southwest cheaper than summerlin" are one intent). Then it
compares each intent against every published LVINIT page, decides whether that
intent needs an update, an expansion, a new page, a link, or nothing, and writes
a brief for the few that deserve one. A brief that clears every handoff
criterion goes into a queue the Publisher can pick up. A normal week produces a
handful of items, and **"No high-confidence content briefs this week" is a
normal, correct result.**

**Current state: DRY RUN.** The queue is written but stamped `dry-run`, and
nothing reads it. Turning handoff on is a separate decision — see
[Turning handoff on](#turning-handoff-on).

---

## What it does NOT do

* write or rewrite an article, or any part of one
* edit any page, metadata, schema, imagery, link, or registry entry
* publish, commit, push, or deploy
* trigger, dispatch or call the Content Publisher
* treat Search Console data as an editorial fact
* invent search volume, traffic value, leads, revenue, or conversion
* propose content framed around protected classes, school rankings, or safety
* modify the GSC, Fact-Decay, or Internal Linking agents' reports or scoring

These are enforced, not just stated. The agent has no code path that writes
outside `reports/content-briefs/`, which is gitignored. The workflow runs with
`contents: read`. And the queue is a file inside the agent's own artifact, so
there is nothing it could dispatch even if it wanted to.

---

## Where the files live

```
scripts/content-briefs/
  run.mjs                  the runner and its command line
  config.mjs               every threshold, weight, cap and switch
  lib/
    inputs.mjs             GSC / Fact-Decay / Internal Linking / history / git trailers (read-only)
    inventory.mjs          what LVINIT has published, in depth
    intent.mjs             query normalization and intent grouping
    coverage.mjs           the duplicate + cannibalization check
    classify.mjs           Fair Housing + low-value gates, UPDATE vs NEW decision
    score.mjs              the 0–100 score and the separate confidence
    brief.mjs              the brief itself (no facts, only assignments)
    history.mjs            fingerprints and week-to-week status
    handoff.mjs            handoff criteria and the queue file
    analyze.mjs            the pure pipeline
    report.mjs             Markdown, JSON, brief files
  fixtures/fixture-demand.mjs   SYNTHETIC search demand, clearly labelled
  test/                    103 tests (node:test, no dependencies)
.github/workflows/content-brief-generator.yml
reports/content-briefs/    generated, gitignored
```

**Zero new npm packages.** Like the other three agents, it uses Node built-ins
only, and it **imports** the other agents' modules rather than copying them:

| Reused from | What |
|---|---|
| GSC agent | Fair Housing rules, `classifyIntent`, `editorialRelevance`, `topicCluster`, generic-filler guard, scoring curves, confidence lines (150 / 40), `PAGE_LEVEL_TYPES`, tokenizer |
| Internal Linking agent | the link graph (page discovery, published/draft, links in/out), topic vocabulary and affinity, the narrow `single-family` Fair Housing exemption, `findLatestReport` |
| Fact-Decay agent | the `.tsx` prose/heading extractor, StoryMeta reader, editorial registry reader |

### One change outside this agent

The GSC report JSON gained a `searchDemand` block (schema **1.0.0 → 1.1.0**):
the raw query, page and query+page rows for both windows, capped at
`GSC_MAX_DEMAND_ROWS` (1000 per list). Before this, the artifact only carried
*findings* — on 17 September 2026 that was one finding out of 32 queries — and
no agent can group queries it cannot see. The change is purely additive: every
1.0.0 key is unchanged, the GSC agent's findings and scoring are untouched, and
the Fact-Decay and Internal Linking agents ignore the new key. Rows are
exported with a `fairHousingBlocked` flag, never hidden.

---

## How to run it

```bash
npm run briefs:report             # real run, report-only
npm run briefs:report:fixtures    # synthetic demand against the real site
npm run briefs:test               # the test suite
node scripts/content-briefs/run.mjs --help
```

| Flag | What it does |
|---|---|
| `--fixtures` | synthetic search demand; written to `reports/content-briefs/fixtures/`, stamped FIXTURE |
| `--dry-run` | analyze and print, write nothing |
| `--today=YYYY-MM-DD` | pretend it is a different day |
| `--min-score=N` | minimum score for a brief (default 50) |
| `--max-new=N` / `--max-updates=N` | caps on the report (default 3 / 2) |
| `--no-history` | ignore earlier brief reports |
| `--no-git` | skip git log (Publisher status becomes unverified, which blocks handoff) |
| `--out=DIR` | output directory |

Output, per run:

```
reports/content-briefs/
  content-opportunities-YYYY-MM-DD.md     for Mikey
  content-opportunities-YYYY-MM-DD.json   the machine contract
  briefs/BRIEF-YYYY-MM-DD-NNN.json        one per brief — what the Publisher reads
  handoff-queue-YYYY-MM-DD.json           the queue (dry-run until enabled)
  handoff-queue.json                      same, stable name
```

---

## How queries are grouped

1. **Normalize** — lowercase, fold punctuation, strip years (remembered, not
   used for grouping).
2. **Extract entities** from a small, explicit LVINIT vocabulary
   (`lib/intent.mjs → ENTITIES`):
   * **places** — Summerlin, Henderson, Southwest (incl. Mountain's Edge,
     Southern Highlands, Enterprise), North Las Vegas, Northwest, Downtown…
   * **subjects** — Monument Hills, Water Street, the Fiesta site, Tule
     Springs/Sandstone, One Civic Center, Four Seasons
   * **concepts** — new construction, resale, incentives, rent, buy, property
     tax, HOA, SID/LID, down payment, mortgage rates, home prices, where prices
     are heading, starter homes, relocation, summer heat, development,
     single-family, condos
   * **facets** — cost, commute, day-to-day life, housing stock, timing
3. **Decide the shape.** Two places (or two subjects, or two decision concepts
   like new vs resale / rent vs buy) with *vs / or / than / compare* is a
   **comparison**. Everything else is a **topic**.
4. **The intent key** is the shape plus the sorted entity set. For a comparison
   the facets are *not* in the key: "is X cheaper than Y" is the same decision
   as "X vs Y", asked from the cost side. For a topic they are, because
   "henderson property tax" and "henderson commute" are different questions.

Every group keeps its queries with their **raw** metrics. Group totals are
labelled **calculated**. Which pages Google showed comes from the query+page
rows only, so query and page aggregation are never mixed.

### Address and street lookups are set aside first

"summerlin avenue" and "summerlin rd" are someone looking for a road. They are
not the question "where is summerlin" or "summerlin nv neighborhood guide", and
grouping them together drags a real neighborhood intent's clarity down — it did,
in the 22 September 2026 run (clarity 0.6, which blocked the brief as
`INTENT_UNCLEAR`).

So before grouping, a query is set aside as **`NAVIGATIONAL_STREET_QUERY`**
when **both** hold:

1. a street **name** meets a street **suffix** at the end of the query (`rd`,
   `road`, `st`, `street`, `ave`, `avenue`, `blvd`, `boulevard`, `dr`, `drive`,
   `ln`, `lane`, `ct`, `court`, `way`, `pkwy`, `parkway`, `hwy`, `highway`,
   `cir`, `circle`, `pl`, `place`), allowing a trailing city, state or ZIP, and
   optionally a house number in front; **and**
2. **nothing** in the query is about traffic, construction, closures, a project
   or redevelopment, access, a commute, directions, a map, a neighborhood, a
   district, or housing.

The rule is deliberately narrow, because LVINIT writes about roads constantly.
These all stay: *summerlin parkway traffic*, *road construction summerlin*,
*charleston boulevard redevelopment*, *i-15 construction las vegas*, *water
street district henderson*, *summerlin las vegas map*, *where is summerlin*.
**A roadway in a query is not noise by itself.** `trail` is deliberately not a
suffix, because LVINIT writes about trails.

This is **not** a Fair Housing exclusion and says nothing about the searcher.
The raw rows are preserved and listed in their own report section with their
impressions, clicks and position, and they count toward no brief's demand,
score or confidence.

## How intent is determined

* **Intent type and depth** — the GSC agent's `classifyIntent` (relocation
  decision, comparison, cost research, informational…), with comparisons
  decided by the shape above.
* **LVINIT relevance** — the GSC agent's `editorialRelevance`, floored when the
  query names something in LVINIT's own vocabulary (it scores "monument hills"
  0.15 because its keyword list does not know it). Off-topic stays capped.
* **Cluster** — the GSC agent's `topicCluster`, corrected from the entities
  (area comparison, relocation, rent vs buy, new vs resale, development, cost
  of housing, commute, neighborhood orientation, market).
* **Clarity** — the share of the group's impressions whose own intent agrees
  with the lead query. Low clarity caps confidence and blocks handoff.

---

## Duplicate and cannibalization protection

Every intent is compared to **every** published page, on the fields you listed:
route, title, H1, meta description, section headings, article text, category
and topics. Each entity the intent is about is looked for in each field:

| Where it appears | Counts |
|---|---:|
| route, title or H1 | 1.0 |
| meta description or a section heading | 0.7 |
| article text, 2+ mentions | 0.4 |
| article text, a passing mention | 0.15 |

Then two corrections:

* **Page shape, for comparisons.** The same comparison ×1.0; a wider
  comparison that includes it (a three-way) ×0.7; a page with a heading setting
  them against each other ×0.8; anything else ×0.55.
* **Route precision, for topics.** How much of what the URL commits to is what
  the intent is about. `/neighborhoods/summerlin` is 1.0 for a Summerlin
  question; `/neighborhoods/summerlin/fourth-of-july-parade` is 0.25.

Same editorial cluster (category / related topics) lifts a page to at least
**adjacent**, never higher. A **dated record** (a monthly Market Watch piece)
is capped below "same": its period is part of what it is, and — the Fact-Decay
Agent's rule — it is not rewritten for newer demand.

| Overlap | Relation | Meaning |
|---:|---|---|
| ≥ 0.75 | same | the page already answers this |
| ≥ 0.50 | substantial | update/expand — **never** new |
| ≥ 0.25 | adjacent | link to it, differentiate from it |
| below | distinct | genuinely new |

**Cannibalization** is two or more existing, non-dated pages that each answer
the intent at the **same** level, within 0.15 of each other. It is
**potential** on overlap alone, **observed** when Search Console shows both for
the same queries, and also **observed** whenever the GSC agent's own
cannibalization finding names the query. Partial coverage — a pillar's "vs"
section next to a wider comparison — is support, not cannibalization. When
existing pages compete, **no new page is ever proposed**: the clear owner (same
intent *and* the page Google ranks) gets an update, otherwise it is monitor-only
because choosing the owner is a human call. Either way, handoff is blocked.

A verdict within 0.05 of the same/substantial edge is **ambiguous**:
confidence is capped at Medium and handoff is blocked.

---

## Update vs new — the decision

Every intent gets exactly one action, and new content is the last resort:

| Step | Condition | Action |
|---|---|---|
| 0 | any grouped query trips Fair Housing | excluded — never scored or briefed |
| 1 | off-topic, navigational, transactional (→ IDX), generic listicle, low relevance | `REJECT_LOW_VALUE` |
| 2 | under 8 impressions on the intent | counted, not listed |
| 3 | existing pages compete | `UPDATE_EXISTING` on the clear owner, else `MONITOR_ONLY` |
| 4 | Google shows the wrong page; the right one answers it | `INTERNAL_LINK_ONLY` |
| 5 | **same** intent exists — a facet is missing (15+ impr.) | `EXPAND_EXISTING` |
| 5 | **same** — page two or worse, not chosen on page one (≤1% CTR on 40+ impr.), or not shown at all (15+ impr.) | `UPDATE_EXISTING` |
| 5 | **same** — already on page one and being chosen | `REJECT_DUPLICATE` |
| 6 | **substantial** — only dated records | `MONITOR_ONLY` (the next monthly piece answers it) |
| 6 | **substantial** — 15+ impressions | `EXPAND_EXISTING` |
| 7 | adjacent / distinct — 25+ impressions | `NEW_COMPARISON` / `NEW_ARTICLE` |
| 8 | adjacent / distinct — less | `MONITOR_ONLY` |

**UPDATE** sharpens how a page already answers the question. **EXPAND** adds
the part of the question it does not answer. An update brief proposes the
section(s) to add or sharpen — never a new article outline.

Page-level GSC findings (internal-link, momentum) have no query, so they can
never define an intent or become a brief. They are listed report-only. An
internal-link finding the repository has already fixed is reported as done.

---

## The score (0–100)

```
score = 100 × Σ(weight × component) ÷ Σ(weight)
```

| Component | Measures | New | Update | Other |
|---|---|---:|---:|---:|
| demand | impressions on the intent, log curve saturating at 150 | 2 | 2 | 2 |
| position | ranking upside (GSC triangle, peak at 11); none = neutral 0.5 | 1 | 2 | 1 |
| growth | vs previous period (GSC momentum); none = neutral 0.5 | 1.5 | 1 | 1 |
| intent | how close to a real housing decision | 2 | 1.5 | 1 |
| relevance | how LVINIT it is | 2 | 1.5 | 1.5 |
| cluster | value of the editorial cluster (+0.15 if Internal Linking says it is weak) | 1.5 | 1 | 1 |
| distinctness | new: 1 − best overlap. update: how specific the gap is | 2 | 1 | 0.5 |
| actionability | how cheap and safe the action is | 0.5 | 1.5 | 0.5 |
| evidence | distinct queries, previous period, persistence, GSC findings naming it | 1.5 | 1.5 | 1 |

Demand is 2 of ~14 weight: **impressions alone cannot carry an idea** (a test
proves a sharp 40-impression comparison beats a vague 2,000-impression topic).
Absence of data is always neutral, never a penalty. Every brief carries its
own component arithmetic.

## Confidence (High / Medium / Low) — separate from score

Starts from the intent's volume, using the GSC agent's own lines (**150+ high,
40+ medium**). Medium becomes High only once the intent has **persisted for 2
runs**. Then it can only go down:

* first sight, below 150 impressions → at most Medium
* the whole GSC window is low-volume and this is first sight → at most Medium
  (**one thin week is not proof of durable demand**)
* ambiguous duplicate check → at most Medium
* potential or observed cannibalization → at most Medium
* intent clarity below 0.7 → Medium; below 0.5 → Low
* findings-only GSC input (no raw rows) → at most Medium

---

## Exact auto-handoff threshold

A brief enters the queue only when **every** one of these holds. Each failure
is a named blocker printed on the brief:

| Criterion | Value |
|---|---|
| action | `NEW_ARTICLE`, `NEW_COMPARISON`, `UPDATE_EXISTING` or `EXPAND_EXISTING` |
| score | **≥ 70** (`BRIEFS_HANDOFF_MIN_SCORE`) |
| confidence | **High** |
| persistence | seen in **≥ 2 runs** (`BRIEFS_HANDOFF_MIN_PERSISTENCE`) — never a one-week spike |
| cannibalization | none |
| duplicate check | not ambiguous |
| intent clarity | ≥ 0.7 |
| editorial fit | relevance ≥ 0.6 and a real cluster |
| Fair Housing | clean on every query **and** every generated title, angle and heading |
| generic-title guard | clean |
| GSC input | a real (non-fixture), fresh, valid report |
| status | not already handed off, published, or stalled |
| target | an update's page still exists; a new slug does not collide |
| Publisher status | git log readable, so double-processing can be ruled out |

At most **2** per run (`BRIEFS_HANDOFF_MAX_PER_RUN`), highest score first.
Everything else is report-only.

---

## Handoff architecture

**Recommended: a queue file inside this agent's artifact, pulled by the
Publisher's existing scheduled routine, with completion recorded as a git
commit trailer.**

```
Tuesday  Brief Generator ──writes──▶ artifact "content-briefs"/handoff-queue.json
                                             │   (mode: dry-run | live)
Publisher's scheduled routine ──reads newest──┘
   └─ executes ONE item it has not already done
   └─ commits with trailers:  LVINIT-Brief: BRIEF-2026-09-29-001
                              LVINIT-Brief-Fingerprint: 3f2a9c01d4e5
Next Tuesday  Brief Generator ──reads git log──▶ that fingerprint is PUBLISHED
```

Why this shape:

* **Least complex that fits.** The Publisher's routine already exists, and
  already fills content-cluster gaps on runs with no fresh story. The queue
  just gives that fallback a better source than its own judgement. No new
  workflow, no cross-workflow dispatch, no reusable-workflow plumbing.
* **Read-only stays read-only.** This agent needs no write permission. A
  repo-based queue file would need `contents: write` for a job that otherwise
  only reads.
* **No double-processing.** The Publisher checks
  `git log --grep "LVINIT-Brief-Fingerprint: <fp>"` before starting, and this
  agent never re-queues a fingerprint that is published or already in a live
  queue.
* **No endless retries.** A brief queued in **2** live runs without a commit
  carrying its fingerprint becomes `HANDOFF_STALLED`: pulled from the queue
  and shown at the top of the report for Mikey.
* **Failures are visible.** The Publisher routine's own run log shows a failed
  attempt; the stall status shows it here a week later at most.
* **Durable audit trail.** The commit trailer is permanent and append-only.
  Each brief file carries its source GSC report, source opportunity IDs,
  queries, metrics, classification, score, confidence, duplicate check and
  handoff status. Artifacts are kept 90 days.

### Turning handoff on

Not done in the first build. When you approve:

1. Confirm the Publisher's scheduled routine can run
   `gh run download --repo <owner>/lvinit --name content-briefs` (it needs a
   token with `actions: read`). If it cannot, handoff stays off — the agent
   must not pretend a handoff it cannot verify.
2. Add to the Publisher routine's topic-selection step, *after* the fresh-news
   check and *before* its own gap-filling: *"If the newest
   `content-briefs/handoff-queue.json` has `mode: live`, take the first item
   whose fingerprint no commit already carries, read its brief file, research
   every fact independently, execute it, and commit with the two trailers. If
   it cannot be done safely, stop and say why."*
3. Set the repository variable **`BRIEFS_HANDOFF_ENABLED`** to `true`.

To turn it off again, delete the variable or set it to `false`. The queue goes
back to `dry-run` on the next run, and nothing else changes.

---

## Week-to-week identity (no repeat briefs)

* **ID** — `BRIEF-2026-09-22-003`, in priority order, new every week.
* **Fingerprint** — `sha1(intent key | action | target or slug | cluster)`,
  first 12 hex characters. Stable across weeks.
* **Intent fingerprint** — the intent key alone, so persistence is counted on
  the demand even if the action changes.

| Status | Meaning | Shown as |
|---|---|---|
| NEW | first time seen | full brief |
| PERSISTING | reported before, still open | **one line** — unless the score rose 10+ or confidence rose, or it is being handed off |
| HANDED_OFF | in an earlier live queue, not yet published | one line; never re-queued |
| PUBLISHED | a commit carries its fingerprint | one line; never re-queued |
| HANDOFF_STALLED | queued twice, never published | one line, flagged for you |
| REJECTED | rejected before, still rejected | counted |
| RESOLVED | reported last run, gone now | one line |

In CI, earlier artifacts are downloaded into `reports/content-briefs-history/`
— never into the output directory, or every artifact would nest every earlier
one.

---

## Fair Housing

A **hard gate**, reusing the GSC agent's rules unchanged, through the Internal
Linking Agent's one narrow exemption: hyphenated `single-family`, or
`single family` followed by a housing noun, is an objective property type and
is allowed. Everything else is checked as-is — "single family homes perfect for
families" is still blocked on "families". **No shared rule is loosened**, and
the shared module is not modified.

One flagged phrasing excludes the **whole** intent group. Excluded queries are
listed with the rule that caught them. Generated titles, angles, questions and
headings are checked again before a brief is allowed out.

---

## The weekly schedule

```
Monday     13:00 UTC   GSC Opportunity Agent
Tuesday    13:00 UTC   Content Brief Generator   ← reads Monday's GSC report
Wednesday  13:00 UTC   Internal Linking Agent
Thursday   13:00 UTC   Fact-Decay Agent
```

Tuesday gives it a one-day-old GSC report, last Thursday's Fact-Decay report
and last Wednesday's Internal Linking report, with no other report landing the
same morning.

## GitHub permissions

```yaml
permissions:
  contents: read   # cannot write to the repository
  actions: read    # download the other agents' artifacts and its own earlier ones
```

No secrets. `fetch-depth: 0` so the Publisher's commit trailers are readable.

---

## Fail-safe behaviour

| What happens | What the agent does |
|---|---|
| no GSC report | no briefs; the report says why |
| GSC report unreadable, malformed, or fixture in a real run | no briefs; the report says which |
| GSC report older than 10 days | no briefs |
| GSC report predates raw rows (schema 1.0.0) | findings-only mode, confidence capped at Medium |
| data too thin | confidence capped; nothing first-seen is handed off |
| duplicate check ambiguous | confidence capped, handoff blocked |
| existing pages compete | never new; handoff blocked |
| Fair Housing flags a query or generated line | excluded / handoff blocked |
| an update's target page disappeared | handoff blocked |
| git log unreadable | Publisher status unverified; handoff blocked |
| Fact-Decay / Internal Linking missing or stale | briefs lose that context; nothing else changes |

"No high-confidence content briefs this week." is a real answer. The agent does
not produce filler to avoid it.

---

## Adjusting it

Everything is in `scripts/content-briefs/config.mjs`, with an environment
override beside each value.

| Want | Change |
|---|---|
| fewer, stronger briefs | raise `BRIEFS_MIN_SCORE` (50) |
| new content only on more demand | raise `BRIEFS_MIN_NEW_IMPRESSIONS` (25) |
| a stricter handoff | raise `BRIEFS_HANDOFF_MIN_SCORE` (70) or `BRIEFS_HANDOFF_MIN_PERSISTENCE` (2) |
| a shorter report | lower `BRIEFS_MAX_NEW` (3), `BRIEFS_MAX_UPDATES` (2), `BRIEFS_MAX_REPORT_ONLY` (3) |
| stricter duplicate check | lower `BRIEFS_OVERLAP_SUBSTANTIAL` (0.5) |
| turn handoff on | repository variable `BRIEFS_HANDOFF_ENABLED=true` (see above) |

---

## Limits worth knowing

* **The vocabulary is small and explicit.** A place or project not in
  `ENTITIES` falls back to its own words and may not group well. Adding one is
  a one-line change, and that is deliberate — no model guesses at intent.
* **Coverage is where words appear, not what a page means.** It is good at
  telling a dedicated comparison from a pillar's section, and every overlap is
  printed with the field that decided it so you can disagree.
* **Search Console anonymizes rare queries.** Some real demand never appears;
  absence is never treated as a negative signal.
* **The GSC report caps its own findings at 15**, so a GSC cannibalization
  finding can be cut before this agent sees it. The agent's own overlap check
  still runs on every intent.
* **Briefs are templates, not prose.** Titles and angles are proposals in
  LVINIT's voice. The Publisher owns the final words and every fact.
* **Handoff depends on the Publisher routine.** Until that routine reads the
  queue and writes the trailer, handoff cannot be verified and stays off.
