# Publisher handoff — upstream inputs on `lvinit-agent-state`

How the Content Publisher gets the latest GSC, Content Brief and Development
Watch output without anyone copying reports around or downloading GitHub
Actions artifacts.

Each upstream agent owns **one stable file** on the `lvinit-agent-state` branch.
The Publisher reads all three and writes none of them.

| Input | File | Only writer | Publisher |
|---|---|---|---|
| GSC Opportunity Agent | `reports/gsc/publisher-input.json` | `gsc-opportunity-agent.yml`, `publish-state` job | read-only |
| Content Brief Generator | `reports/content-briefs/publisher-input.json` | `content-brief-generator.yml`, `publish-state` job | read-only |
| Development Watch | `reports/development-watch/publisher-input.json` | `local-trend-agent.yml` (Development Watch module) | read-only |

There is no combined file. Each writer commits only its own namespace through
the shared `.github/actions/agent-state` action, which pushes only to
`lvinit-agent-state`, refuses `main`, and refuses anything outside the declared
paths ([AGENT_STATE_BRANCH.md](AGENT_STATE_BRANCH.md)).

The contract — paths, schema, thresholds, exclusions — is code, in
`scripts/publisher-inputs/contract.mjs`. This doc explains it.

## Reading the inputs

```bash
git fetch origin lvinit-agent-state
git show origin/lvinit-agent-state:reports/gsc/publisher-input.json
git show origin/lvinit-agent-state:reports/content-briefs/publisher-input.json
git show origin/lvinit-agent-state:reports/development-watch/publisher-input.json
```

Or `node scripts/publisher-inputs/read.mjs` (`--json` for machine output). It
does the same fetch and show, applies every rule below, and prints which inputs
and items are usable. It never writes, commits, or downloads an artifact, and a
missing input is reported, not fatal.

## What each file carries

Every file has `schema_version` (1), `agent`, `generatedAt`, `reportDate`,
`fixture`, `status` (`ok` · `empty` · `fixture`) and `items[]`.

**GSC** — per item: `id`, `opportunityType`, `page`, `topic` (`label`,
`cluster`, `places`, `priorities`, `intent`), `impressions`, `clicks`,
`position`, `positionChange`, `score`, `confidence`, `recommendedAction` (the
agent's action kind, e.g. `optimize-existing-page`). Plus `dataQuality`
(`lowVolume` and what it means) and `privacy.omitted` counts.

**Content Brief** — per item: `id`, `fingerprint`, `intentKey`, `workingTitle`,
`primaryQuestion`, `intent`, `cluster`, `contentType`, `recommendedAction`,
`target` / `proposedRoute`, `keyQuestions`, `relatedPages`, `duplicateCheck`,
`flags`, `score`, `confidence`, `status`, `handoffStatus`, `sourceGscReportDate`,
`fairHousingFlag`, `sourceValidation`. Only Publisher actions are listed
(update, expand, new article, new comparison, internal links only); monitor-only
and rejected intents stay in the artifact.

**Development Watch** — per item: `id`, `fingerprint`, `entityId`, `project`,
`jurisdiction`, `area`, `type`, `status`, `action`, `pillar`, `sourceUrls`,
`significance`, `confidence`, `verified` (a primary source, authority 1–7, is
cited), `provisional`, `classification` (`ok` · `needs_revalidation`) with
`classificationReasons`, `fairHousingFlag`, `sourceValidation`, `eventDate`,
`reportDate`. Only Publisher-action events from the last 7 days of daily
reports, one per project. The detailed daily reports, registry and dry-run queue
are unchanged.

## GSC privacy — no raw queries on the public branch

The repository, and so this branch, is public. The GSC and Brief files **never
contain a raw Search Console query string.** The full reports, with every query,
stay in the private workflow artifacts (`gsc-opportunities`, `content-briefs`)
for Mikey and for debugging, exactly as before.

How a GSC finding is described without its query:

- the LVINIT page it concerns (our own route), and
- a topic built **only** from fixed vocabulary: the GSC agent's topic cluster,
  its editorial-priority keys, and a closed list of place names. Nothing the
  searcher typed is copied through.

A finding is **omitted** when its query looks like an address, unit, phone
number or email; when its query is Fair Housing blocked; or when it cannot be
described without the query (no LVINIT page owns it and the vocabulary finds no
topic or place). Omissions are counted in `privacy.omitted`.

Brief files drop the "Searchers literally ask: …" questions and anything else
quoting a query.

**Fail closed.** Both builders scan their own output before writing: any
query-bearing key (`query`, `queries`, `leadQuery`, …) or any raw query string
from the source report that is not made purely of our own vocabulary makes the
builder exit 1. Nothing is committed and the previous file simply ages — better
no handoff than a leaked query.

## Freshness

Age is measured from the **older** of `generatedAt` and `reportDate`, so
re-publishing old data never makes it fresh.

| Input | Fresh | Caution | Stale for prioritization |
|---|---|---|---|
| GSC | ≤ 8 days | 9–15 days | > 15 days |
| Content Brief | ≤ 8 days | 9–15 days | > 15 days |
| Development Watch report | ≤ 2 days | 3–7 days | > 7 days |

A brief also needs its `sourceGscReportDate` to be no older than 15 days.
Development Watch items are signals: the Publisher **always re-verifies the
underlying primary source** before publishing a factual claim or prioritizing a
time-sensitive story.

## When an input or item is never a ranking reason

- `generatedAt` or `reportDate` missing, or a timestamp in the future
- `fixture: true`
- `provisional: true`
- `classification: "needs_revalidation"`
- an unresolved Fair Housing / compliance flag (`fairHousingFlag: true`)
- source validation failed (`sourceValidation: "failed"`)
- the file is stale, or fails the schema

Low-confidence items may support a decision but may never be its sole reason.
While GSC reports `dataQuality.lowVolume`, GSC is an early signal, not
definitive search demand.

### `needs_revalidation`

Development Watch marks an item `needs_revalidation` when its attribution is
suspect:

- it is on the reviewed list of known misclassifications
  (`KNOWN_MISCLASSIFICATIONS` in `scripts/local-trends/devwatch/lib/publisher-input.mjs`)
  — currently **Apex Industrial Park**, which was credited with Switch
  data-center coverage that never names Apex;
- the project's name appears in none of its own sources or evidence (the same
  pattern, caught generally);
- the "name" reads like a quoted phrase rather than a project;
- its sources conflict.

To clear a known misclassification, confirm the attribution against a primary
source and remove the entry.

## Failure behavior (Publisher)

- **Unavailable** — report it and continue from the repo, the strategy map and
  the other inputs.
- **Stale** — report it; background only, never a primary ranking reason.
- **Agents disagree** — prefer stronger direct evidence: GSC measurements
  outrank Brief inference; verified primary agency/developer evidence outranks
  secondary development reporting. Explain it in the run summary.
- **Repository reality contradicts an input** — current repository state wins.
- **All inputs unavailable** — operate from current repo state,
  `docs/LVINIT_CONTENT_CLUSTER_MAP.md` and current factual research. Missing
  inputs never block a safe run.

## Writer failure behavior

- A failed analysis job skips `publish-state`; the old file stays and ages.
- Fixture runs build and validate the file but never commit it (Development
  Watch writes fixture output under `reports/development-watch/fixtures/`,
  which is never committed either).
- A Development Watch publisher-input failure is logged and never breaks the
  daily report.

## Tests

- `scripts/publisher-inputs/test/` — contract: schema, freshness, exclusions,
  missing inputs, the reader (`node --test "scripts/publisher-inputs/test/*.test.mjs"`)
- `scripts/gsc/test/publisher-input.test.mjs` — sanitization and the leak guard
- `scripts/content-briefs/test/publisher-input.test.mjs`
- `scripts/local-trends/devwatch/test/publisher-input.test.mjs` — classification,
  including Apex / Switch
