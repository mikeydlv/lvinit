# Content Refresh + Fact-Decay Agent

> Reads LVINIT's published content once a week and tells you which factual
> claims have gone stale, are about to, or can no longer be backed up — in plain
> English, with the reasoning shown.
>
> It **inspects and recommends. It never writes.** It does not rewrite a single
> word of the site. Execution belongs to the
> [Content Publisher agent](CONTENT_PUBLISHER_AGENT.md), and only after you
> approve a specific finding by its ID.

---

## What it does

Every week it reads every published guide, neighborhood page and feature, pulls
out the sentences that make a time-sensitive factual claim, and asks three
separate questions about each one:

| Question | Answer | Where it lives |
|---|---|---|
| **How bad would it be if this were wrong?** | Risk: High / Medium / Low | `lib/risk.mjs` |
| **How likely is it that it has moved?** | Staleness: 0–1 | `lib/freshness.mjs` |
| **What does the source actually say now?** | Verification: an external check | `lib/verify.mjs` |

Then it ranks them, writes a report, and stops.

Each finding gets a stable ID like `FACT-2026-09-04-001`, so you can say:

> "Have the LVINIT Real Estate Content Publisher handle FACT-2026-09-04-001."

Nothing is handed over automatically. **You are the approval layer between
diagnosis and execution.**

---

## What it does NOT do

This is the important half. The agent — and the weekly job that runs it —
**must not**:

* rewrite or edit published articles
* modify public-facing pages
* update metadata, titles, or structured data
* change internal links
* publish corrections
* commit content changes
* push site changes
* deploy the website
* hand work to the Content Publisher without your approval
* send email or alter CRM data
* modify the GSC Opportunity Agent's scoring or reports

These are enforced, not just stated:

* the agent has no code path that writes anywhere except `reports/fact-decay/`
* `reports/fact-decay/` is gitignored, so its own output cannot be committed
* the GitHub workflow runs with `permissions: contents: read`, so its token
  physically cannot push to the repository
* every finding carries `"authorized": false` in its handoff block

It may **recommend** any of the actions above. It never takes one.

---

## Where the files live

```
scripts/fact-decay/
  run.mjs                       the command you run
  config.mjs                    EVERY threshold, cadence, weight and scope rule
  lib/
    dates.mjs                   date parsing and arithmetic
    extract.mjs                 reading prose and data out of .tsx pages
    content-inventory.mjs       which pages are in scope, and how fresh each is
    categories.mjs              the fact categories, cadences and base risks
    claims.mjs                  claim detection — and what it refuses to flag
    risk.mjs                    the risk model
    freshness.mjs               the staleness model
    sources.mjs                 the source hierarchy and source records
    verify.mjs                  external verification, and its honest limits
    gsc-signal.mjs              the optional traffic weighting
    analyze.mjs                 the pipeline
    report.mjs                  Markdown and JSON rendering
  fixtures/
    fixture-pages.mjs           SYNTHETIC test pages, clearly labelled
    fixture-sources.mjs         SYNTHETIC source responses, clearly labelled
  test/                         the test suite (node:test, no dependencies)

.github/workflows/fact-decay-agent.yml   the weekly scheduled run
reports/fact-decay/                       generated reports (gitignored)
docs/FACT_DECAY_AGENT.md                  this file
```

**Zero new npm packages.** Like the GSC agent, this uses only Node built-ins, so
nothing was added to the site's dependency tree.

---

## How to run it

### Right now, with no setup at all

```bash
npm run fact:report:fixtures
```

That runs the whole pipeline against synthetic test pages in
`scripts/fact-decay/fixtures/`. Every page, figure, program and source is
invented, and the report says so in a banner at the top. It exists so you can
see the output format without touching the real site or the network.

### Against the real site

```bash
npm run fact:report
```

This reads the repository and writes a report. **It makes no network requests.**
Everything in that report is detection: the agent's own analysis, clearly
labelled as not having been checked against anything.

### Against the real site, checking sources too

```bash
npm run fact:report:verify
```

This also re-fetches the sources the pages already cite, and reports what they
say now. This is the mode the weekly job uses.

### Useful flags

```bash
node scripts/fact-decay/run.mjs --help              # every option
node scripts/fact-decay/run.mjs --today=2026-12-01  # what will be stale in December
node scripts/fact-decay/run.mjs --route=/guides/las-vegas-home-prices-july-2026
node scripts/fact-decay/run.mjs --exclude=/guides/first-summer-in-vegas
node scripts/fact-decay/run.mjs --min-priority=60   # only the strongest findings
node scripts/fact-decay/run.mjs --no-gsc            # ignore traffic weighting
node scripts/fact-decay/run.mjs --dry-run           # analyze, write no files
```

`--today` is the one worth knowing about. It answers "what will need attention
next month?" without waiting for next month.

> **On Windows, in Git Bash:** a flag whose value starts with `/` gets rewritten
> into a Windows path. Prefix the command with `MSYS_NO_PATHCONV=1`, or use
> PowerShell, where it is not an issue.

### Run the tests

```bash
npm run fact:test
```

---

## How facts are detected

The agent reads `app/**/page.tsx` and any local data module a page imports —
which matters, because Summerlin's Development Watch entries live in
`lib/areas/summerlin.tsx`, not in the page file.

Out of each file it pulls four different things:

1. **Prose** — the text inside JSX. Sentences broken across `<span>`s and
   `{" "}` expressions are stitched back together first, so a claim is not split
   down the middle.
2. **Data prose** — the `what` and `caveat` fields of a Development Watch entry,
   a guide's `dek`, an FAQ answer. Just as published as the prose is.
3. **Figure panels** — the `{ value, label, note }` rows the market guides use.
   These carry the fastest-decaying numbers on the site, each with its own
   period and source already attached.
4. **Sources** — both the structured `AreaSource[]` the neighborhood pages keep,
   and the inline `<a href>` citations the guides write instead.

Then every sentence is sorted into exactly one of five buckets:

| Bucket | What happens | Example |
|---|---|---|
| **claim** | Goes forward | "The program provides $20,000 in assistance." |
| **opinion** | Left alone | "Honestly, this is my favourite part of the valley." |
| **historical** | Left alone | "The land was purchased in 1952." |
| **durable** | Left alone | "It sits between two washes on the western edge." |
| **not a claim** | Left alone | "Find out what's zoned for them." |

The report prints all five counts, so you can see how much was read versus how
much was flagged. On a typical run it reads well over a thousand sentences and
flags a few dozen.

**What it deliberately refuses to flag:**

* editorial opinion — unless the sentence *also* carries a hard assertion, in
  which case "$490,000 feels high to me" is still a price claim
* forward-looking guidance — "a sustained move lower would pull buyers back in"
  describes what might happen; there is nothing to verify and nothing that can
  become false
* instructions to the reader — "Check with the association before you buy"
* settled history — every year in the sentence is at least three years old and
  the verb is past tense
* durable geography — boundaries, acreage, elevation, distances
* numbers welded into a compound term — "the 30-year fixed" names a product, it
  does not quote a rate
* bare years — "waiting for a 2008-style discount" is not a rent figure

**No language model is involved anywhere in this agent.** Detection is
deterministic pattern analysis over the repository, and the same input always
produces the same output. Extraction is regex over `.tsx`, not a TypeScript
parser — which is why every finding prints its file, line number and the
surrounding sentence, so you can check the machine in two seconds.

---

## Fact categories

Every flagged claim gets one primary category from `lib/categories.mjs`, and the
category decides how fast the fact is assumed to move and how much harm a wrong
version could do. They are grouped exactly as you specified:

| Group | Categories |
|---|---|
| **Real estate and housing** | home prices · rents · mortgage rates · inventory and days on market · HOA amounts · SID/LID and special assessments · property taxes · builder incentives · builder and community status · new-home availability · resale market conditions · down-payment requirements and financing programs · down-payment assistance and housing programs |
| **Local development** | project status · construction timelines · road and freeway projects · retail, casino and resort openings · parks and amenities · schools (factual claims only) · major employers · development approvals and zoning status · planned-community scope |
| **Government, law and regulation** | laws and regulations · rental and short-term-rental rules · licensing requirements · tax rules · government programs |
| **Transportation and infrastructure** | road closures and restrictions · RTC and transit service · travel and access claims |
| **Time-sensitive consumer information** | deadlines and application periods · fees and rates · prices and cost figures · eligibility rules · operating status and hours |

**Jurisdiction is tagged separately, not as a category.** "Clark County rules",
"City of Las Vegas rules", "Henderson rules", "North Las Vegas rules" and
"Nevada laws" are the same *kind* of fact with different owners. Splitting them
into five near-identical categories would duplicate every pattern and let the
risk table drift apart, so the agent tags the jurisdiction on the finding
instead and prints it. Nothing is lost.

A **specific category always beats a generic one**: "HOA dues are $95 a month"
is an HOA-fee claim reviewed on a budget cycle, not a generic "fee" claim
reviewed weekly.

---

## How risk is scored

Risk answers one question: **if this specific sentence is wrong, how badly could
it mislead a buyer, renter, homeowner, or reader?**

It is *not* "how likely is it to be wrong" — that is staleness, and the two are
kept apart on purpose. A mortgage rate quoted last week is high risk and low
staleness. A restaurant's opening hours from two years ago are low risk and high
staleness. Averaging them into one number would hide both.

| Level | What it means |
|---|---|
| **High** | Inaccuracy could materially mislead someone making a decision — laws, financing rules, assistance eligibility, HOA fees, taxes, project status, special assessments, mortgage rates, major pricing claims. |
| **Medium** | May affect a decision, but slightly stale is unlikely to cause material harm — construction timelines, retailer and project openings, inventory references, builder status, amenity availability. |
| **Low** | Easy to update, unlikely to change a decision — dates in copy, minor business details, descriptive detail that may have moved. |

The arithmetic:

```
base (from the category)  +  escalators  −  de-escalators  =  score 0–1
```

**Escalators** — things that make being wrong more consequential: a specific
dollar amount, a specific percentage, obligation language ("must", "not
eligible"), a named program or bill, a hard date that can pass.

**De-escalators** — the page is already being honest about the uncertainty: the
figure is hedged, the page tells the reader to confirm it, the claim dates
itself, or an explicit caveat is attached.

Both are **capped**, so no claim can be talked all the way from Low to High on
keyword stacking alone. Every adjustment that fired is printed with the finding,
so a "High" always has a reason you can argue with.

**Risk is never manufactured.** A Low-risk claim with no escalators stays Low,
and the report is allowed to be short.

---

## How freshness is scored

Staleness answers: **how likely is it that this claim has moved since anybody
last checked it?**

Four weighted signals:

| Signal | Weight | What it measures |
|---|---:|---|
| Overdue | 0.55 | How far past its review cadence the claim is |
| Time markers | 0.20 | "currently", "as of", "right now", "still" |
| Year drift | 0.15 | An explicit year, against the current year |
| Source age | 0.10 | How old the cited source is, when that is knowable |

A signal with **no data available is dropped and the remaining weights are
renormalized**, rather than scored as zero. Scoring an unknown as zero would
quietly make content look fresher than anyone can honestly claim it is.

The overdue curve is deliberately not a straight line:

* just checked → 0
* exactly at the cadence ("due") → 0.4
* at twice the cadence → 1

"Due" and "long overdue" are different instructions to a human, and the score
says so.

### Two hard overrides

These are not probabilistic. They are arithmetic:

* **a deadline written in the copy whose date has passed** — the sentence is now
  false, not "possibly stale"
* **a "scheduled to be considered on `<date>`" whose date has passed** — the
  outcome is knowable and the page does not know it

Both produce a High-confidence finding regardless of how fresh the page is
otherwise.

### Refresh cadence

| How fast the fact moves | Reviewed every | Why that default |
|---|---:|---|
| **Very dynamic** | 10 days | Weekly publication cycles: mortgage rates are published weekly, road closures are measured in weeks, builder incentives change per quarter or per weekend, and a deadline can pass on any given day. |
| **Dynamic** | 30 days | Monthly publication cycles: LVR and the builder-research shops republish prices, inventory, permits and days-on-market monthly, so a figure older than one cycle is quoting a superseded report. |
| **Moderate** | 75 days | Budget, legislative and planning cycles: HOA budgets, tax rules, zoning cases, licensing requirements. Slower than monthly, faster than annual. |
| **Stable** | 365 days | Durable facts. Reviewed annually, or when you ask. |

**Being due is not being wrong.** Passing a cadence means nobody has checked
recently enough to say the claim still holds. The report never asserts a claim
is false on age alone.

Change any of these in `scripts/fact-decay/config.mjs` under `cadence`, or with
the environment variables named beside them.

### Where "last checked" comes from

In preference order, and the report always says which one it used:

1. a visible `checked="Checked 20 August 2026"` stamp on the page
2. the page's own `dateModified`
3. the page's own `datePublished`
4. the editorial registry's `publishedAt` in `lib/content.ts`
5. the file's last git commit

If none of those exist, the report says the cadence had nothing to measure
against — and that is itself worth fixing.

---

## How sources are verified

**Detection is analysis. Verification is evidence. They are never the same
thing.** Nothing in this agent reports a claim as checked because a pattern
matched. A verification result requires an external source that was actually
fetched, and every result records the URL and the timestamp so you can repeat
the check by hand.

### The source hierarchy

1. Official government sources
2. Primary sources
3. Developers and program administrators
4. MLS-supported or authoritative housing data
5. Reputable local reporting
6. Other credible sources, only when nothing better exists

Scraped SEO sites, anonymous blogs, AI-generated summaries, stale aggregators
and forum posts are **not acceptable**. A claim resting on one is reported as
needing a better source rather than verified against it.

That "not acceptable" list is deliberately **short and explicit**. Guessing that
an unknown domain is a content farm would be exactly the kind of unearned
confidence this agent exists to avoid, so an unrecognised domain is filed as
"other credible", flagged as thinly sourced, and left to you.

### What a check can honestly establish

With `--verify`, the agent re-fetches a source the page **already cites** and
determines:

* whether it is still reachable at all
* when it says it was last modified
* whether the figures the sentence states still appear in it
* if one does not, whether the source states a **different** value for the same
  thing — which is a contradiction — or simply no longer carries the figure,
  which is only an absence
* for a project-status claim, whether the source still describes the same stage

That last one compares the *furthest-along* stage the source describes against
what the page says, so "the page says planned, the source says construction is
underway" comes out as a contradiction rather than a false confirmation.

### What it cannot do

**It cannot search the web.** There is no search API wired to this agent, and
inventing one would mean inventing results. A claim that needs a source nobody
has cited yet is marked

```
MANUAL_SOURCE_CHECK_REQUIRED
```

with the reason attached, and a person goes and looks.

The same marker is used when a fetch is blocked by bot protection, a paywall,
authentication, a rate limit, or JavaScript-only rendering. If a page returns
almost no readable text, the agent says so rather than concluding the figure is
gone.

**A figure-presence check is not comprehension.** "Every figure still appears on
the cited page" is real evidence and it is weaker than a human reading that
page. Results say which they are, and confidence is capped accordingly.

### Every verification result

| Result | Meaning |
|---|---|
| `confirms` | Every figure the sentence states still appears on the cited source. |
| `contradicts` | **The source explicitly states something different** — a different value for the same measure, anchored to the same subject, or a project at a different stage. |
| `partially-confirms` | Some figures still appear; at least one could not be found, and the source states no different value. |
| `value-not-found` | The figure could not be found on a source that is still about the same subject, **and the source states no different figure.** An absence, not a disagreement. |
| `cannot-verify` | The source is reachable but nothing in it could be matched at all. |
| `source-unreachable` | The source returned an error, or has been removed (404/410). |
| `manual-check-required` | Blocked, JavaScript-only, unsourced, or an unacceptable source. Carries the `MANUAL_SOURCE_CHECK_REQUIRED` marker. |
| `not-attempted` | Verification was off, or the claim was below the threshold for spending a request. |

### The contradiction bar

**A figure disappearing from a source is not the source disagreeing with the
page.** Pages get restructured, figures move behind a tab, tables get rebuilt,
a stat moves into a linked PDF. "I could not find the number" and "the source
states a different number" are completely different pieces of evidence, and
only the second one is a contradiction.

So `contradicts` is reserved for two cases, and nothing else reaches it:

1. **A conflicting value.** The source states a different value *for the same
   measure*. What makes that judgement honest is how narrowly it is anchored:
   the agent compares the handful of words touching each figure — the label
   that says what it measures — and requires them to line up on **both sides**
   of the number.

   Comparing the wider paragraph does not work. A down-payment page says
   "assistance", "programme", "income" and "payment" in every paragraph, so any
   two numbers on it look related. In testing, the looser version paired
   "the down payment on a **$500K** home" with "providing **$20,000** in down
   payment assistance" — they share the phrase "down payment" and measure
   completely different things. Requiring both sides to match kills that while
   keeping the real ones:

   | Page says | Source says | Verdict |
   |---|---|---|
   | "the 30-year fixed average at **6.69%** for the week of…" | "the 30-year fixed-rate mortgage averaged **6.71%** for the week ending…" | **contradiction** — same measure |
   | "household income must be at or below **$147,300** in Clark County" | "household income must be at or below **$151,900** in Fixture County" | **contradiction** — same measure |
   | "the down payment on a **$500K** home" | "providing **$20,000** in down payment assistance" | not a conflict |
   | "Teachers offers **$7,500** toward down payment" | "qualifying income up to **$165,000**" | not a conflict |

   Both values, and the words they matched on, are printed in the report.
2. **A different project stage.** The source describes a project as further
   along (or less far along) than the page says.

Everything softer comes back as `value-not-found` or `partially-confirms`, and
**neither ever recommends changing the copy.** The most either can justify is
`manual-review-required` — asking a person to read the source — or, when the
page is more precise than a thin source supports,
`remove-unsupported-specificity`. The report states plainly on each one: *"No
conflicting value was found on the source. This is an absence, not a
disagreement — it does not show the page is wrong."*

A **removed source (404/410)** is `source-unreachable`, not a contradiction: a
page that no longer exists says nothing at all. What is definitely wrong there
is the citation, so the recommendation is `update-source-citation`.

The threshold is tunable at `verification.conflictMinSharedTerms` (default 2),
`verification.conflictLabelWordsBefore` (6) and
`verification.conflictLabelWordsAfter` (4). Raising the first, or narrowing the
other two, makes contradictions rarer and more certain.

### When sources conflict

If two sources disagree, that is not resolved into one confident number. It is
reported as a conflict with both figures shown, and the recommended action is
`manual-review-required`. LVINIT's existing down-payment guide already handles a
real case of this — two official pages of the same program stating different
percentages — and the agent's job is to surface that, not to pick a winner.

### When verification fails

Nothing is fabricated, ever. A failed check produces a result that says what
failed and why, with the source URL and the attempt timestamp, and the finding
is marked low confidence. A high-risk claim that could not be checked becomes
`manual-review-required` rather than a correction.

### Keeping it cheap

The agent does not crawl. Its strategy, in order:

1. detect claims first, and score risk and staleness before spending anything
2. only verify claims that clear the priority threshold (default 45)
3. only ever fetch sources the pages already cite — never a discovered link
4. cache every fetch for 7 days, so stable sources are not re-fetched weekly
5. a hard ceiling of 40 requests per run
6. a politeness delay between requests to the same host

A typical weekly run makes a few dozen read-only GETs.

---

## How search traffic affects prioritization

The GSC Opportunity Agent measures search performance. This agent measures
factual freshness. **They stay separate systems.**

But a stale figure on a page people are actually landing on matters more than
the same figure on a page nobody has found yet. So this agent reads the GSC
agent's newest report **off disk** and turns it into one number per route: a
priority multiplier between 0.9 and 1.3.

The boundaries are hard:

* it only **reads** `reports/gsc/*.json`. It never calls Search Console, never
  re-scores a GSC finding, and never writes anything into `reports/gsc/`
* traffic can **only reorder**. It can never create a finding, suppress one, or
  change a risk level. A stale claim on a zero-traffic page is still reported —
  lower down, with the reason stated
* if no GSC report exists, is unreadable, or is more than 45 days old, every
  multiplier is exactly 1.0 and the report says so

**GSC data is never required for this agent to run.**

### How the weekly job gets hold of it

`reports/gsc/` is gitignored, and every GitHub Actions run starts from a fresh
checkout — so the GSC report is **not** in the repository the Fact-Decay job
checks out. It has to be fetched, and the workflow does that explicitly before
the scan:

1. `gh run list --workflow gsc-opportunity-agent.yml --status success --limit 5`
   gets the five most recent successful GSC runs.
2. It walks them newest-first, calling
   `gh run download <id> --name gsc-opportunities --dir reports/gsc`, and stops
   at the first one that yields the artifact. Walking back matters: artifacts
   expire after 90 days, and a run can succeed while producing no artifact at
   all, so giving up on the first miss would silently lose the signal.
3. It then prints which file actually landed, so the run log answers "did the
   traffic weighting apply?" without anyone having to guess.

`gh` is preinstalled on GitHub-hosted runners, so this uses GitHub's own tooling
rather than a third-party action. The job adds `actions: read` to its
permissions purely to read that artifact — it stays read-only throughout, and
the step is `continue-on-error`, because a missing traffic signal is a
degradation, not a failure.

The agent looks for `gsc-opportunities-YYYY-MM-DD.json` both directly in
`reports/gsc/` and one level down, so it works whether `gh` unpacks the artifact
flat or into its own subdirectory. Both layouts are covered by tests.

---

## How priority and confidence work

**Priority** orders the list:

```
priority = 100 × (0.45·risk + 0.35·staleness + 0.20·verification) × traffic
```

**Confidence** is about the strength of the evidence, and is deliberately kept
out of that number:

| Confidence | What it means |
|---|---|
| **High** | A current authoritative source **explicitly** contradicts or supersedes the page, or the copy names a date that has demonstrably passed. |
| **Medium** | Evidence strongly suggests the page may be stale, but the context needs a human read. |
| **Low** | A potential issue was detected but could not be verified strongly. |

A **low-confidence finding is never promoted to top urgency**, whatever its
priority score. Urgency bands are Now / Soon / Routine / Monitor.

---

## Recommended actions

Every finding gets exactly one:

| Action | When |
|---|---|
| `update-factual-claim` | A source **explicitly states something different**, or a stated date has passed. Never recommended off a missing value alone. |
| `update-source-citation` | The claim may still be right, but the page cites nothing, or can no longer point a reader at anything. |
| `remove-unsupported-specificity` | The page is more precise than its evidence supports. |
| `clarify-uncertainty` | Well past cadence and hard to re-source. Saying when it was true is more honest than leaving it undated. |
| `monitor-only` | Flagged so it is on the list; nothing suggests it is wrong yet. |
| `no-change-needed` | Re-checked against its source and still stands. |
| `manual-review-required` | A person has to look — high risk and unverifiable, blocked source, conflicting sources, or a Fair Housing matter. |

---

## Fair Housing

Published prose is scanned with **the same Fair Housing rule list the GSC
Opportunity Agent uses** — the agent imports `scripts/gsc/lib/fair-housing.mjs`
rather than keeping a second copy, so the two can never drift apart on what is
blocked. That module is read and never modified.

A sentence that trips the filter is routed to a **compliance queue** and nowhere
else. It never becomes an ordinary freshness finding, because the recommended
action would then be "update this claim" on protected-class language — and the
right response to that is a human decision about advertising law, not a
refreshed figure.

Items in the queue are **candidates for a human read, not violations.** Nothing
is changed, nothing is scored, and many will be entirely innocuous in context.
They are grouped per page and per rule, so one page mentioning "families" eight
times is one queue item rather than eight.

The agent never recommends safe/unsafe framing, good/bad-for-families framing,
best-schools rankings, or ideal-for-a-demographic framing, and it never
introduces demographic targeting into a recommendation.

---

## Current-year references

Pages with a year in the title or URL get their own section, because **an old
year is not automatically a reason to rewrite anything.**

The agent says which shape it thinks the page is:

| Shape | What it recommends |
|---|---|
| **Dated record** — the title names a month and a year, e.g. "Las Vegas Home Prices July 2026" | **Do not rewrite it to a newer year.** Its year is part of what it is. If the data has moved, the honest answer is a new companion piece, not an edited old one. |
| **Current-year evergreen** | Nothing is out of date on that count. Revisit when the underlying data changes, not on the calendar. |
| **Past-year evergreen** — e.g. "Las Vegas Down Payment Assistance Programs 2026" once 2026 is behind us | A judgement call for you: a factual refresh, a title refresh, restructuring it as evergreen, or genuinely no change. The agent points at the high-risk claims flagged on that page as the more useful place to start. |

It never asserts that a title should change.

---

## The report

Two files per run, in `reports/fact-decay/`:

* `fact-decay-YYYY-MM-DD.md` — written for you, not for a developer
* `fact-decay-YYYY-MM-DD.json` — the machine contract, stable keys, stable IDs

The Markdown report is ordered:

1. **What was scanned** — counts only, nothing interpreted
2. **Highest-priority refreshes** — the full detail blocks, capped at two per
   page so the top covers several pages rather than one bad guide
3. **All findings** — the complete table, then detail on the rest
4. **Pages with no detected issues** — listed, not silently omitted
5. **Pages with a year in the title or URL**
6. **Fair Housing compliance queue**
7. **How this report decides things** — risk, freshness, priority, confidence
8. **Which sources count** — the hierarchy, and what the agent cannot check
9. **Notes and limitations from this run**
10. **What this agent did not do** — the prohibition list

Every value is labelled as one of five things: **detected** (what the page
says), **calculated** (risk, staleness, priority), **external evidence** (what a
fetched source actually said), **interpretation** (the agent's reading), or
**recommended action**. The distinction between *detected* and *external
evidence* is the one that matters most, and the report never lets the two look
alike.

### Each finding carries

stable ID · page title · route · file and line number · the claim · the
surrounding context · fact category and group · jurisdiction · the currently
published value · risk level and why · staleness and why · when the page's facts
were last checked and what that date rests on · the review cadence · the source
currently supporting the page · the source the agent checked · that source's
type and stated date · the date accessed · the verification result · the
recommended action and its reason · confidence and its caveats · urgency · the
priority arithmetic · and the handoff line.

---

## Stable IDs

Every finding gets an ID of the form:

```
FACT-2026-09-04-001
```

Assigned in priority order, so `-001` is always the most urgent item in that
run.

Underneath, each finding also carries a **fingerprint** — a short hash of the
route, the category and the normalized claim text. The fingerprint is what makes
identity stable *across* runs: the same claim keeps the same fingerprint next
week even though its ID changes with the date, and cosmetic differences (a curly
apostrophe, an em dash) do not create a new one.

The agent reads its own previous reports out of `reports/fact-decay/`, so a
repeat finding shows:

> *Previously reported: first seen 2026-08-21 as FACT-2026-08-21-007, 3 times in
> earlier reports.*

That is how you tell "this is new" from "this has been sitting here for a month".

### The audit trail

Between the page's own `AreaSources` block and the report's source records, the
trail preserves: what the page said, what source originally supported it, what
that source says now, when it was checked, and what changed. LVINIT's existing
source convention is reused — no second system to maintain by hand.

---

## The weekly automation

`.github/workflows/fact-decay-agent.yml` runs every **Thursday at 13:00 UTC**
(about 06:00 in Las Vegas). Thursday deliberately, not Monday: the GSC agent
runs on Monday, so there is always a fresh traffic report to read, and the two
reports do not land on the same morning competing for attention.

It:

1. checks out the repository read-only (with full history, so the "last
   modified" fallback date works)
2. runs the agent's own test suite
3. downloads the newest usable GSC artifact as an optional traffic signal — see
   [How the weekly job gets hold of it](#how-the-weekly-job-gets-hold-of-it)
4. scans the published content and re-checks cited sources
5. uploads `reports/fact-decay/` as a workflow artifact (kept 90 days)
6. prints the summary on the run page

It can also be run on demand from the **Actions** tab with **Run workflow**,
where you can override the minimum priority, the maximum number of findings, the
date, turn verification off, or tick `fixtures` for a synthetic dry run.

**No secrets. No credentials.** This agent has none of either.

Reports are **artifacts, not commits**. To keep one permanently, download it.

---

## Adjusting it

Everything lives in **`scripts/fact-decay/config.mjs`**, grouped and commented.
You can change a value three ways, in increasing order of precedence:

1. edit the default in `config.mjs`
2. set the environment variable named beside it (e.g. `FACT_DECAY_MIN_PRIORITY=60`)
3. pass a CLI flag (e.g. `--min-priority=60`)

The ones you are most likely to want:

| What you want | Where |
|---|---|
| A shorter or longer report | `output.minPriority` (35), `output.maxFindings` (40) |
| Review a kind of fact more or less often | `cadence` — the four values |
| Change what counts as High risk | `risk.highThreshold` (0.7) and `risk.mediumThreshold` (0.4) |
| Weight staleness differently | `freshness.weights` |
| Reorder the report | `priority.weights` |
| Turn traffic weighting off | `gsc.enabled`, or `--no-gsc` |
| Spend more or fewer source requests | `verification.maxSourceFetches` (40), `verification.minPriorityToVerify` (45) |
| Re-check sources more often | `verification.cacheTtlDays` (7) |

### Excluding a page

Add its route to `content.excludeRoutes`, or set
`FACT_DECAY_EXCLUDE_ROUTES=/guides/first-summer-in-vegas`, or pass
`--exclude=/guides/first-summer-in-vegas`. Excluded pages are still listed in
the report as out of scope, with the reason — the exclusion is visible rather
than silent.

By default the agent scans only published editorial content: guides,
neighborhood pages, community pages and place stories. The homepage, index
pages, `/search`, `/contact` and the API routes are UI, not editorial claims,
and are out of scope. Anything marked `status: "draft"` in `lib/content.ts` is
skipped too.

### Excluding a fact type

Add its category key to `content.excludeCategories`, or set
`FACT_DECAY_EXCLUDE_CATEGORIES=parks-and-amenities`. The keys are the `key`
fields in `lib/categories.mjs`.

---

## Relationship to the other agents

```
GSC Opportunity Agent          Fact-Decay Agent
  measures search                 measures factual
  performance                     freshness
        │                               │
        │  (optional, read-only)        │
        └──────── traffic ──────────────┤
                                        │
                                   a report
                                        │
                                   YOU approve
                                        │
                                        ▼
                          LVINIT Content Publisher
                            (the execution layer)
```

* **GSC Opportunity Agent** — separate system. This agent reads its output as an
  optional signal and never touches its scoring or its reports.
* **Content Publisher** — the execution layer. Its authority to write, commit and
  push is unchanged by this work. It acts on a fact-refresh item only when you
  give it a specific ID.

A page can be performing well in search *and* carry an outdated financing
statistic. That combination makes the fact-decay issue more important, not less,
because more people are seeing it — which is exactly what the traffic
multiplier encodes.

---

## Limits worth knowing

* **Extraction is heuristic, not a parser.** It is regex over `.tsx` source.
  It occasionally clips a sentence at a component boundary, and it cannot read
  text built inside a JavaScript expression. That is why every finding prints
  its file, line and context.
* **A figure-presence check is not comprehension.** It establishes that a number
  still appears on a page, not that the page still means what it did.
* **The agent cannot search the web.** It can only re-check what a page already
  cites. Anything else is `MANUAL_SOURCE_CHECK_REQUIRED`.
* **Sources that cannot be checked reliably**: anything behind bot protection,
  a paywall, or a login; anything rendered entirely by JavaScript; PDFs (the
  text extractor reads HTML). Government sites in particular vary — Clark
  County and the state sites are usually fine, some are not. Each one reports
  its own failure rather than a guess.
* **A page with no date cannot be measured.** The cadence needs something to
  count from. Pages without a `checked` stamp or a `dateModified` are reported,
  with a note saying the staleness figure has no anchor.
* **"No detected issues" is not "verified correct."** It means nothing on that
  page crossed the reporting threshold on this run.
