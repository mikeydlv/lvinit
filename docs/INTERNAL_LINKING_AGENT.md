# Internal Linking Agent

A weekly maintenance system that keeps LVINIT's contextual internal links in
good shape without you having to read a list of suggestions every Monday.

It is the only LVINIT agent allowed to change the site on its own. Everything
below is about why that is safe.

---

## The one-paragraph version

Once a week the agent reads every published LVINIT page, works out which pages
link to which, and looks for places where a page **already names another page's
subject in its own words** — "the Water Street District", "new build",
"Summerlin". Where that is clearly the right link and nothing about it is
risky, it wraps those existing words in a link, runs the typecheck, the linter
and a real production build, and pushes. Everything else goes in a short report
for you. A normal week is two or three links added and one or two things worth
a look.

---

## The rule that makes it safe

**The agent never writes, rewrites, reorders or deletes a word of published
copy. It only wraps words that are already there in a link.**

That is not a policy it tries to follow. It is a mechanism:

* Every edit goes through one function, `applyLinkEdit`, which reconstructs the
  page's rendered text before and after the change and **refuses the edit** if a
  single character moved.
* After the edits, the agent reads its own `git diff` and refuses to commit
  unless every removed line reappears with nothing but `<Link>` markup added
  around part of it.
* The diff may only touch `app/` and `lib/areas/`. Anything else aborts the
  commit.

So the worst case for a bad relevance judgement is a link you would not have
chosen. It is never a changed sentence.

---

## What it does

1. Builds the internal link graph from `app/**/page.tsx` (plus the data modules
   those pages import, like `lib/areas/summerlin.tsx`).
2. Finds orphaned and weakly linked pages, broken links, repeated links, and
   pages missing from the sitemap.
3. Finds places where one page already names another page's subject and does not
   link to it.
4. Scores each of those, applies every safety gate, and ranks what is left.
5. Adds the ones that clear every gate — at most **8 links across 5 pages, 2 per
   page**, per run.
6. Runs `tsc --noEmit`, `npm run lint` and `npm run build`. If any fails, it
   reverts every edit and ships nothing.
7. Commits and pushes to `main`.
8. Writes `reports/internal-links/internal-links-YYYY-MM-DD.{md,json}`.

## What it refuses to do

* create a new article, or rewrite a section of one
* add, remove or reword any published copy
* **write a bridge sentence** — see below
* change metadata, Open Graph, canonical URLs or JSON-LD schema
* change imagery, alt text or photo credits
* change navigation, the homepage, CTAs, lead forms or design
* change brokerage, licensing, Equal Housing or other compliance copy
* update a market fact, price, rate or statistic
* modify the GSC or Fact-Decay agents' reports or scoring
* force-push, rebase through a conflict, or push from a dirty or diverged tree

### About bridge sentences

The brief allowed one short bridge sentence to introduce a link. The agent
**does not write one**, deliberately.

A bridge sentence is new published prose in your voice. A script cannot write in
anyone's voice, and every template that would fit every paragraph ("For more on
X, see Y") is exactly the bolted-on link block LVINIT's own house rules forbid.

So when a link would need a sentence written for it, the agent reports the pair,
says what is missing, and hands it to the Content Publisher. The config flag
`autoExecute.allowBridgeSentence` exists and defaults to `false`; turning it on
does not make the agent write one. It is the switch a future implementation
would read.

---

## Where the files live

```
scripts/internal-links/
  config.mjs               every threshold, limit and weight
  run.mjs                  the runner and its command line
  lib/
    graph.mjs              the link graph
    topics.mjs             LVINIT's topic vocabulary and anchor phrases
    source.mjs             reading and editing TSX; the copy checksum
    opportunities.mjs      detection, scoring, gating, run limits
    signals.mjs            the GSC and Fact-Decay signals (read-only)
    analyze.mjs            the pure analysis pass
    apply.mjs              writing edits and re-checking them
    verify.mjs             typecheck / lint / build
    git.mjs                preflight, diff inspection, commit, push
    report.mjs             Markdown and JSON
    fair-housing.mjs       the one "single-family" prose normalization
  fixtures/fixture-site.mjs  a synthetic site, for demos and tests
  test/                    123 tests
.github/workflows/internal-linking-agent.yml
reports/internal-links/    generated, gitignored
```

---

## How to run it

### See what it would do, change nothing

```bash
npm run links:report
```

This is the default. It scans, scores, and writes a report showing exactly what
it *would* change, down to the sentence and the character. It never touches a
page file.

### Try it with no repository scan at all

```bash
npm run links:report:fixtures
```

Runs against a synthetic five-page site built to show all three outcomes: one
link added, one refused for Fair Housing framing, one refused for being inside
compliance copy. Every line of that report is stamped FIXTURE DATA.

### Actually add the links

```bash
npm run links:apply
```

Edits, validates, commits and pushes. This is what the weekly job runs.

### Useful flags

| Flag | What it does |
|---|---|
| `--apply` | actually edit, validate, commit and push |
| `--no-push` | edit and commit, but leave the push to you |
| `--no-commit` | edit and validate, leave the diff in the working tree |
| `--dry-run` | force report-only even with `--apply` |
| `--max-links=N` | maximum links this run (default 8) |
| `--max-pages=N` | maximum pages modified this run (default 5) |
| `--min-confidence=N` | the auto-execution line, 0–1 (default 0.72) |
| `--route=/path` | only consider this page as a source. Repeatable |
| `--exclude=/path` | never touch this page. Repeatable |
| `--no-gsc` | ignore search data entirely |
| `--no-fact-decay` | ignore destination freshness entirely |
| `--today=YYYY-MM-DD` | pretend it is a different date |
| `--out=DIR` | write the reports somewhere else |

### Run the tests

```bash
npm run links:test
```

---

## How the link graph works

**Nodes** are published editorial routes: guides, neighborhood pillars,
communities, and stories nested under a place. Drafts and utility routes
(`/search`, `/contact`, `/guides`, `/`) are not nodes. Which section a route
belongs to is decided by the GSC agent's `classifyRoute`, reused so all three
agents mean the same thing by "a guide".

**Edges** are internal links a human wrote in a page file — or in a data module
that page imports.

**Chrome is not an edge.** The navbar links every page to `/guides`; the footer
links every page to `/contact`; the homepage card feed links whatever is newest.
If those counted, every page would look well connected and nothing would ever be
an orphan. They are collected and reported, never counted.

From that the agent derives:

* **orphans** — no editorial page links to them
* **weakly linked** — one referring page or fewer
* **newly published and hard to find** — published in the last 30 days with one
  referrer or fewer
* **broken links** — pointing at a route with no page file
* **repeat links** — the same destination linked 3+ times from one page (twice
  is normal in a long guide and is not reported)
* **sitemap drift** — editorial pages missing from `app/sitemap.ts`

The agent **never manufactures a link to clear an orphan.** An orphan is a
reason to do a genuine link first, not a reason to invent one.

---

## How relevance is scored

Detection is **anchor-first**. The agent does not decide two pages are related
and then hunt for somewhere to put a link. It finds a place where the source
page already names the destination's subject, and offers to make those words a
link.

### Where anchor phrases come from

Only from the destination itself:

1. its **slug** — `/guides/water-street-district-henderson` gives "water street
   district", "water street", "water"
2. **proper-noun runs in its own headline**, narrowed to the parts the slug backs
   up. LVINIT headlines are title-case sentences, so a capitalized run is not a
   name; every word in a headline phrase has to appear in the slug too, which is
   why "What Is Actually There Now" never becomes an anchor.
3. an optional per-route list in config (empty by default)

A phrase is then rejected unless it names something:

* it must contain at least one **distinctive** word. "Las Vegas", "homes",
  "market", "real estate", "guide", "neighborhood" and about sixty other words
  every LVINIT page uses are stripped before any comparison, so a phrase made
  only of them scores zero. This is the generic-word guard, and it is tested.
* a phrase of only **calendar words** is rejected. "August" is distinctive enough
  to tell you which report you are looking at, but linking the word "August" in
  "watch whether August and September hold onto July's pace" points a reader
  somewhere they were not going. (This rule came out of the first real dry run,
  which proposed exactly that.)
* a **one-word anchor** must be a proper name that is most of what the
  destination is about. "Summerlin" scores 1.0 against the Summerlin pillar and
  is fine. "Street" scores 0.63 against the Water Street District guide and is
  not.
* `click here`, `here`, `this`, `read more`, `learn more` and friends are banned
  outright.

### The score

```
confidence = 0.35 × anchor quality
           + 0.25 × paragraph support
           + 0.20 × page relatedness
           + 0.10 × topic affinity
           + 0.10 × structural fit
```

| Component | What it measures |
|---|---|
| **anchor quality** | how much of the destination's slug vocabulary the anchor names, and how much of the anchor is on-subject |
| **paragraph support** | how much of the destination's vocabulary the whole paragraph carries |
| **page relatedness** | the GSC agent's own `pageRelatedness` — slug and headline overlap, plus a bonus for the same neighborhood |
| **topic affinity** | 1.0 for the same subject, otherwise a documented pair weight (new construction ↔ resale is 0.95; mortgage rates ↔ financing is 0.95) |
| **structural fit** | 1.0 inside a `<StorySection>`, 0.9 in a `<StoryLede>`, 0.85 in a `<LocalsNote>`, and nowhere else at all |

**Search traffic is deliberately not in this formula.** How useful a link is to a
reader cannot depend on how many people saw the page.

### Two hard gates before the score matters

* **Supporting vocabulary.** The paragraph must carry at least one of the
  destination's own words *beyond the anchor itself*. A paragraph that mentions
  a place once in passing is a mention, not a subject. The one exception: a
  proper name that *is* the destination's subject, on a page at least 0.3
  related — a place page's whole vocabulary is its own name, so it could never
  clear a gate that ignores the anchor's words.
* **Page relatedness ≥ 0.10.** Two pages sharing nothing but an incidental
  phrase are not a link opportunity.

---

## Exact auto-execution thresholds

A link is added automatically only when **all** of this is true:

| | |
|---|---|
| confidence | **≥ 0.72** |
| both pages exist and are published | yes (re-checked at the moment of the edit) |
| source already links the destination | no |
| the anchor | already-present words, 1–6 of them, not banned, not a date, not repeated exact-match |
| where it sits | body prose inside `StorySection` / `StoryLede` / `LocalsNote` |
| paragraph length | ≥ 25 words |
| links already in that paragraph | 0 |
| editorial links already on that page | < 12 |
| the same anchor already pointing at that destination site-wide | < 3 times |
| a new factual claim needed | never — the anchor is existing words, so no claim can be introduced |
| Fair Housing | clean on the anchor, the paragraph, the section heading and the destination headline |
| compliance copy | not brokerage, licensing, Equal Housing, disclaimer or sourcing copy |
| competing destinations | exactly one candidate for those words |
| search-intent overlap | the two pages are not ≥ 0.80 related on identical topics |
| Fact-Decay | the destination is eligible (below) |
| `next/link` imported | yes |

Below 0.72 but at or above **0.45**, it is reported with the exact sentence and
anchor it would have used. Below 0.45 it is not reported at all — that is the
difference between a maintenance system and a weekly homework list.

## Maximum changes per run

| | Default | Env override |
|---|---|---|
| Links added per run | **8** | `LINKS_MAX_LINKS_PER_RUN` |
| Pages modified per run | **5** | `LINKS_MAX_PAGES_PER_RUN` |
| Links added per page | **2** | `LINKS_MAX_LINKS_PER_PAGE` |
| Links to one destination from one page | **1** | `LINKS_MAX_PER_DESTINATION` |

Anything past a ceiling is ranked, reported, and picked up next week.

---

## How search data affects priority

The agent reads the GSC Opportunity Agent's newest report **off disk**. It never
calls Search Console, never re-scores a GSC finding, and never writes to
`reports/gsc/`.

Traffic can do exactly one thing: **reorder which safe links get done first.**

* A page with real impressions gets a multiplier up to **1.15**.
* A page the GSC agent itself flagged with an `internal-link` opportunity gets a
  further **1.10** — that is not an inference about traffic, that is the other
  agent asking for this work in its own vocabulary.
* **Absence from the GSC report is exactly neutral (1.0), never a penalty.** That
  report lists only pages that produced an opportunity, so a page can have real
  search visibility and not appear in it. Treating absence as "quiet" would
  invent a penalty out of missing data.
* A report older than 45 days is ignored, and the run says so.
* No GSC report at all is completely fine. Everything is ranked on relevance and
  discovery need, and the report says that on its face.

Traffic can never create an opportunity, raise a confidence score, or make an
unsafe link safe.

---

## How Fact-Decay affects destination eligibility

Same arrangement: read-only, off disk, never re-scored.

A page with a serious unresolved factual problem should not have more readers
pushed into it. But almost every LVINIT page carries *some* Fact-Decay finding —
that is what a market site looks like — so "has a finding" cannot be the bar or
nothing would ever be linkable.

A destination is **blocked** (`DESTINATION_REQUIRES_REFRESH`) when its newest
Fact-Decay report shows either:

1. a finding that is **high risk AND `contradicts`** — `contradicts` is the only
   verification result that means the cited source actively disagrees with the
   page, so paired with high risk it is a high-consequence claim that is
   probably wrong; or
2. a finding at **priority ≥ 75**, which is the Fact-Decay Agent's own "act now"
   urgency line.

Everything else is allowed, and the report prints the destination's worst open
finding anyway so you can see what was waved through.

**`source-unreachable` is deliberately not a blocker.** Fact-Decay's own severity
table scores it *below* `partially-confirms`, and its docs list bot protection
and paywalls as routine causes. A transient 403 is not evidence that a page is
wrong.

If no Fact-Decay report is on disk, the agent still runs and the report says the
check could not be made.

---

## How conflicts with the Content Publisher are prevented

The Content Publisher creates articles, does the research, sets the imagery,
writes the metadata and schema, and does the major SEO work. That is unchanged.

Five separate things keep the two out of each other's way:

1. **Disjoint change surface.** This agent can only wrap existing words in a
   link. It cannot write prose, and it is structurally incapable of touching
   metadata, schema, imagery, the registry, the sitemap, CTAs, lead forms or
   navigation — those regions are on a protected list and the diff inspector
   rejects any change outside `app/` and `lib/areas/`.
2. **Clean-tree precondition.** If the working tree has any uncommitted change,
   the agent stops before editing anything. It will not edit around work in
   progress.
3. **Re-validation at the moment of the edit.** The exact anchor text must still
   be byte-identical at that position. If the Content Publisher rewrote that
   paragraph in the meantime, the edit is cleanly skipped and reported, never
   applied to shifted text.
4. **Never force, never guess.** Diverged from origin, or ahead of it? Stop and
   report. Strictly behind? Fast-forward only. Remote moved during the run? The
   commit stays local and says so.
5. **Handoffs, not attempts.** Anything needing real editorial work — a bridge
   sentence, a Fair Housing judgement, two pages competing for one search intent
   — is written up with a stable ID and handed over. The agent never tries it.

---

## Commit and push authority

The agent **is** authorized to commit and push safe link edits to `main` without
asking. The safety is in the preconditions, not in asking permission.

Before editing: right branch, clean tree, `origin` fetched, no divergence.
Before committing: every path allowed, every diff line an added `<Link>`, every
validation command green.
Before pushing: the remote has not moved since the preflight.

Commit message:

```
chore: improve LVINIT internal linking (2026-09-17)

Added 2 contextual internal links where the source page already named the
destination's subject in its own words. No published copy was added, removed
or reworded: each change wraps existing text in a <Link>.

  LINK-2026-09-17-001  /guides/… -> /guides/…  (anchor: "…")
```

Never `--force`, never `--force-with-lease`, never a rebase through a conflict,
never a commit that mixes in unrelated work.

### How to disable auto-push

Pick whichever fits:

| | |
|---|---|
| **In CI, permanently** | set the repository variable `LINKS_GIT_PUSH` to `false` |
| **In CI, for one run** | `workflow_dispatch` → set **push** to false |
| **CI, report only** | `workflow_dispatch` → set **apply** to false |
| **Anywhere** | export `LINKS_GIT_PUSH=false` |
| **Locally, one run** | `npm run links:apply -- --no-push` |
| **Stop it committing too** | `--no-commit`, or `LINKS_GIT_COMMIT=false` |
| **Stop it entirely** | `LINKS_AUTO_EXECUTE=false`, or disable the workflow in the Actions tab |

None of these lose the report.

---

## Fail-safe behaviour

| What happens | What the agent does |
|---|---|
| The working tree is dirty | stops before editing; reports why |
| Not on `main` | stops; reports why |
| Local branch diverged from origin | stops; reports both counts |
| Local branch ahead of origin | stops — something unpushed is already there |
| Local branch behind origin | fast-forwards only, and only if clean |
| The anchor text moved since the scan | skips that edit, reports it, applies nothing on that page |
| A destination stopped resolving | skips; nothing on that page is applied |
| The edit would change published copy | refuses the edit outright |
| Typecheck, lint or build fails | **reverts every edit**, commits nothing, reports the failing output |
| The diff touches a path it should not | reverts everything |
| The diff contains anything but added `<Link>` wrappers | reverts everything |
| The commit fails | reverts everything |
| The remote moved mid-run | keeps the commit local, does not push, reports it |
| Validation was skipped | nothing may be committed from that run |
| Malformed page, unexpected structure | that candidate is skipped, not guessed at |

A diagnostic report is written in every one of these cases. Nothing is ever
forced through because the schedule said so.

---

## Fair Housing

The agent reuses the **GSC Opportunity Agent's** Fair Housing ruleset
(`scripts/gsc/lib/fair-housing.mjs`) rather than writing a competing one. That
module is read, never modified.

Four things are checked, and a match on any of them means report-only, never
automatic:

* the anchor text
* the paragraph the link would sit in
* the section heading
* the destination's own headline

That last one matters: it is how the agent avoids *strengthening* content framed
around "safest neighborhoods", "best schools", or "perfect for families".

That filter was tuned for search queries, and on editorial prose it fired on one
objective housing term: "single-family", which trips the familial-status rule on
the word "family" even though it describes a building, not who lives in it. So
this agent — and only this agent — neutralizes that one property-type term
before running the shared check (`scripts/internal-links/lib/fair-housing.mjs`):

* hyphenated "single-family", or "single family" followed by a housing noun
  (home, house, residence, lot, median, ...), is treated as a property type
* a bare "single family" with no housing noun can describe a household, so it is
  left to the filter
* every other word is still checked: "a single-family home, perfect for
  families" is still blocked on "families"
* no rule is removed or loosened, and the shared GSC module is unchanged — the
  GSC and Fact-Decay agents behave exactly as before

Anything else the filter matches is still report-only, with the matched word
printed so you can clear it in seconds.

Separately, brokerage, licensing, Equal Housing, disclaimer and sourcing copy is
never edited at all, for any reason.

---

## The report

`reports/internal-links/internal-links-YYYY-MM-DD.md` and `.json`, gitignored —
the agent commits link edits, never its own output. In CI both are attached to
the run as the `internal-links-report` artifact.

The Markdown has:

* **Run summary** — pages scanned, links analyzed, opportunities detected,
  auto-executed, report-only, skipped, build status, commit hash, push result
* **Auto-executed** — for each: stable ID, source, destination, anchor, the exact
  sentence, the exact diff, why the relevance was high confidence, whether a
  bridge sentence was added (always no), and the post-edit validation
* **Needs review** — source, destination candidates, confidence, why it was not
  safe to automate, and the handoff where one applies
* **Would need a sentence written** — Content Publisher handoffs, capped at five
* **Orphans and weakly linked pages** — including newly published pages that are
  hard to find
* **Graph hygiene** — broken links, heavy repeat linking, sitemap drift
* **Validation** — every command, its result, and the failing output if any
* **What this agent will never do**

The JSON adds the whole link graph node by node, every scoring component, and
the fingerprints.

### Stable IDs

Each opportunity gets `LINK-YYYY-MM-DD-NNN`, plus a **fingerprint**: a hash of
source, destination and normalized anchor. The fingerprint survives re-typesetting
and re-numbering, so across weeks the agent can tell:

* **new** — first time seen
* **persisting** — reported before, still open
* **auto-fixed-previously** — the agent linked it in an earlier run
* **resolved** — reported last week, gone now

---

## The weekly schedule

```
Monday     13:00 UTC   GSC Opportunity Agent     search performance
Wednesday  13:00 UTC   Internal Linking Agent    reads Monday's GSC report
Thursday   13:00 UTC   Fact-Decay Agent          factual freshness
```

About 06:00 Las Vegas time. Wednesday is chosen so this agent always has a fresh
GSC report to prioritize with, and so there is a day between its push and
Thursday's Fact-Decay scan — that scan then sees the linked site rather than
racing it. A `concurrency` group means two of these can never overlap.

## Required GitHub permissions

```yaml
permissions:
  contents: write   # the only elevated permission: committing its own link edits
  actions: read     # solely to download the other two agents' report artifacts
```

Nothing else. No `pull-requests`, no `issues`, no `packages`, no `id-token`, no
`deployments`, no secrets. `contents: write` is unavoidable for an agent whose
whole job is to commit — the containment is in the diff inspector and the
allowed-paths list, both of which run before the commit.

---

## Adjusting it

Everything tunable is in `scripts/internal-links/config.mjs`, and every value
has an environment override named beside it. The ones you are most likely to
want:

| Want | Change |
|---|---|
| fewer, safer links | raise `LINKS_AUTO_MIN_CONFIDENCE` (0.72 → 0.80) |
| more links, more review | lower it (0.72 → 0.68) |
| a quieter report | raise `LINKS_REPORT_MIN_CONFIDENCE` (0.45 → 0.55) |
| a smaller weekly batch | lower `LINKS_MAX_LINKS_PER_RUN` |
| leave a page alone forever | add it to `LINKS_EXCLUDE_ROUTES` |
| link denser pages | raise `LINKS_MAX_LINKS_PER_PAGE_TOTAL` (12) |
| stop pushing | `LINKS_GIT_PUSH=false` |

---

## Limits worth knowing

* **The anchor has to already be on the page.** If a page never names another
  page's subject in its own words, there is no link to make, however related the
  two are. Those become Content Publisher handoffs. This is the agent's biggest
  recall limitation and it is deliberate.
* **The anchor must sit on one line of source.** A phrase that wraps across a
  line break in the TSX is skipped rather than reflowed. Conservative on purpose.
* **Extraction is regex over TSX, not a parser.** It is the same approach the
  Fact-Decay Agent uses. Every finding prints its file, line and paragraph so you
  can check the machine in two seconds.
* **Only one page's worth of a data module is read.** Links written in
  `lib/areas/*.tsx` are counted in the graph, but the agent only ever edits the
  page file itself.
* **Market-update pages are nearly unlinkable by design.** "Las Vegas Home Prices
  August 2026" is generic words plus a date, so it has no honest short anchor.
  The agent reports nothing rather than inventing one.
* **Topic affinity is a small hand-written table, not a model.** It is a bonus
  worth 0.10 of the score, and anything not in it simply scores zero there.
* **The Fair Housing filter is query-tuned** and can still over-fire on prose
  beyond the one "single-family" normalization. Costs recall, never safety.
* **"No opportunities" is a real answer.** It usually means the Content Publisher
  has been linking well, which is the point.
* **Running it locally can hit a OneDrive flake.** This repo lives under
  OneDrive, and `next build` sometimes fails clearing `.next` with
  `EINVAL: invalid argument, readlink … app-paths-manifest.json`. That has
  nothing to do with the agent, but the agent treats any build failure as real
  and reverts its edits. If you see that error, `rm -rf .next` and run it again.
  It does not happen in CI, where the checkout is a plain filesystem.
