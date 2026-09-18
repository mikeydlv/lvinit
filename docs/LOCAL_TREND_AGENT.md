# LVINIT Local Trend Agent

**What it answers:** *What should Mikey talk about next that Las Vegas locals,
buyers, sellers, investors and relocators will actually care about?*

Each morning it reads targeted local sources, throws out the noise, checks what
LVINIT already covers, and writes one report that says what to **film**, what to
**post**, what to **write**, what to **ignore**, and what to **keep watching**.

It is a **discovery and prioritization** agent. It never publishes, posts,
edits the site, contacts builders or leads, or sends anything to anyone.

| | |
|---|---|
| Code | `scripts/local-trends/` |
| Workflow | `.github/workflows/local-trend-agent.yml` |
| Schedule | Daily 6:30 AM Pacific. Monday also rebuilds the weekly summary. |
| Output | the `lvinit-agent-state` branch (see [AGENT_STATE_BRANCH.md](AGENT_STATE_BRANCH.md)) |
| Secrets | `ANTHROPIC_API_KEY` (optional; without it the agent runs rules-only) |
| Cost | Claude judgment: about $0.40–$0.70 a day (see [Cost](#cost)). Everything else is free. |

---

## Where to read the reports

On GitHub, switch to the **`lvinit-agent-state`** branch:

- `reports/social-trends/YYYY-MM-DD-local-trends.md` is the daily report
- `reports/social-trends/weekly.md` is the latest weekly summary (older ones are in `weekly/`)
- `data/social-trends/watchlist.json` holds every project being monitored

Every run also puts the whole daily report on the **Actions run page**, and
attaches it as the `local-trends` artifact.

### The daily report

| Section | Meaning |
|---|---|
| 🔥 CREATE NOW | 34–40/40. Make it this week. |
| 🟡 STRONG OPPORTUNITIES | 28–33/40. Good content, less urgent. |
| 👀 WATCH LIST | 22–27/40. Not ready yet. Says what's missing and what would promote it. |
| ❌ SKIPPED NOISE | Reviewed and rejected, with the reason. These are remembered and never analyzed again. |
| Checked, no material change | Watched projects with new coverage but no new facts. Not resurfaced. |
| Run details | Which sources worked, model usage, and anything the validator corrected. |

An empty section is a real answer. The agent does not pad a quiet day.

---

## How it works

```
feeds + Google News ──► normalize & dedupe ──► drop already-reviewed ──► rules filter
                                                                            │
      report ◄── watchlist merge ◄── code validation ◄── Claude judgment ◄──┘
                 (resurface rules)   (status re-proven,    (or rules-only
                                      score computed)       fallback)
```

1. **Collect.** It reads about 12 RSS feeds plus about 40 targeted Google News searches.
   This takes a minute, with a polite delay between requests. It never crawls. If
   a source fails, that is recorded on the report and the run continues.
2. **Dedupe.** The same story from several outlets becomes one story. The
   official source is preferred, and the others are listed as "also reported by".
3. **Memory.** Every story it has decided on is in `reviewed.json`. Those stories,
   and near-identical headlines from the last 30 days, are skipped. The exception
   is a story about a watched project, which is kept because it may carry new facts.
4. **Rules filter.** This step is free. It drops stories outside the valley,
   crime, sports results, school-district operations, one-off event notices,
   career profiles and obituaries. It then ranks the rest by area priority,
   category, source quality and development language, and keeps the top 30.
5. **Article excerpts.** It reads the first few paragraphs of each shortlisted
   article where the publisher allows it. That gives status claims real text to
   quote.
6. **Existing content.** It lists every published LVINIT page (using the same
   inventory as the Internal Linking Agent) plus the videos in `lib/content.ts`.
7. **Judgment.** Claude groups stories into topics, scores them, finds the human
   angle, writes the hook, and plans the formats and the field shoot. Claude sees
   only the text that was fetched. It has no tools and no web access.
8. **Validation, in code.** Model output is never trusted as-is:
   - Every status needs a **verbatim quote** from a non-social source's own
     text, and that quote must contain the status's language ("approved", "broke
     ground", "now open"). If the quote isn't in the text, or doesn't support the
     claim, the status drops to the best one the source text itself states, down
     to RUMORED / UNCONFIRMED. A future opening ("set to open in 2027") is not
     OPEN. A dated past reference ("opened there in 2021") is not this project's
     status.
   - Totals and priority bands are **computed**, not taken from the model.
   - Any LVINIT route or story id the model invents is dropped.
   - Every SOURCE line (publisher, URL, date) comes from the fetched data. The
     model never writes a URL.
   - Every correction appears under "Validation notes" on the report.
9. **Watchlist merge.** New topics scoring 22 or more are added. Watched projects
   resurface only on a status change, material new information from a new source,
   a score move of 4 points or more, or a new connection to an existing LVINIT page.

### Project status

`RUMORED / UNCONFIRMED` < `PROPOSED` < `FILED` < `APPROVED` < `UNDER CONSTRUCTION` < `OPEN`

- A status only moves **up**, and only with a quote. A later, vaguer article
  never downgrades it.
- Reddit and other social posts are **never** evidence. They count only as
  demand signals: what people are asking and debating.
- A rumored or unconfirmed project is never CREATE NOW. The cap is STRONG
  OPPORTUNITY, marked "verify before creating".
- Audience questions and trends ("Is Henderson really cheaper?") are marked
  "not a development".

### Scoring (/40)

Eight criteria, each scored 1–5: local relevance, relocation value, conversation
potential, visual potential, evergreen value, real estate connection, novelty,
and LVINIT fit.

| Total | Priority |
|---|---|
| 34–40 | P1 — CREATE NOW |
| 28–33 | P2 — STRONG OPPORTUNITY |
| 22–27 | P3 — WATCH / POSSIBLE |
| below 22 | IGNORE |

---

## Rules-only mode

This runs when there is no `ANTHROPIC_API_KEY`, when the model call fails or
declines, or when `--no-llm` is passed. The report says so at the top.

- It still collects, filters, dedupes, remembers, finds status evidence
  (verbatim, from the source), and links related LVINIT pages.
- It **does not write hooks or angles.** Those fields read "Needs Mikey's
  angle". A template hook is exactly the generic content LVINIT avoids.
- It never marks anything CREATE NOW. The cap is P2.
- Stories it judged are tagged `rules:` in memory, so the first run with a key
  re-judges them properly.

---

## Setup

1. **Add the API key.** Go to GitHub → Settings → Secrets and variables →
   Actions → New repository secret, and create `ANTHROPIC_API_KEY`. Without it the
   agent still runs daily in rules-only mode.
2. **Recommended: protect `main`.** The workflow needs `contents: write` to push
   its state branch. GitHub can't scope that token to one branch. The shared
   action refuses to push anywhere but `lvinit-agent-state`, and a
   branch-protection rule on `main` makes that a second, independent lock.
3. The `lvinit-agent-state` branch is created automatically by the first run.

### Cost

One Claude call per day, using `claude-opus-5` with adaptive thinking at `high`
effort:

- Input is about 11–14k tokens (30 candidates with excerpts, signals, the site
  inventory, the watchlist). Output is typically 15–25k tokens including thinking.
- At $5 / $25 per million tokens that is roughly **$0.40–$0.70 a day, about
  $12–20 a month**. Later days usually cost less, because stories already
  reviewed are never sent again.
- A hard guard skips the call, falling back to rules-only, if the prompt estimate
  ever exceeds 90k tokens.
- To spend less, set `TRENDS_EFFORT=medium`, or lower `TRENDS_MAX_CANDIDATES`.
- The call opts into Anthropic's server-side refusal fallback (`fallbacks:
  "default"`). If the model declines, another model finishes the call rather than
  the run falling back to rules-only.

---

## Hand-maintained fields

Edit these directly on the `lvinit-agent-state` branch. The agent preserves them:

- **`content_created`** on a watchlist project, for example
  `["2026-09-20 field Reel", "/guides/fiesta-henderson-redevelopment update"]`.
  The report shows it, and the model factors it in so it doesn't re-pitch what
  you've already made.
- **`notes`** is free text the model reads as context.

To stop monitoring a project, delete its entry from `watchlist.json`.

---

## Running it locally

```bash
npm run trends:test              # the test suite (no network)
npm run trends:report:fixtures   # synthetic stories, canned judgment
npm run trends:report            # live feeds; rules-only unless ANTHROPIC_API_KEY is set
npm run trends:weekly            # rebuild weekly.md from the daily JSON files
```

Locally, output goes to `reports/social-trends/` and `data/social-trends/` in the
repo. Both are gitignored on `main`. Useful flags: `--dry-run`, `--no-llm`,
`--no-excerpts`, `--today=YYYY-MM-DD`, `--state-dir=DIR`, `--max-candidates=N`.

In GitHub Actions, **Run workflow** accepts `mode`, `no_llm`, `fixtures` and
`today`. Fixture runs commit nothing.

---

## Sources

| Source | Tier | Can establish status? |
|---|---|---|
| City of Henderson newsroom, City of Las Vegas newsroom | official | yes |
| Review-Journal (business, local), Las Vegas Sun (business, news), Vegas Inc, KTNV, 8 News Now, News 3, Nevada Current | news | yes |
| Google News targeted searches (areas × topics, builders, infrastructure, cost of living) | news, or official/builder by publisher domain | yes |
| Reddit: r/vegas, r/LasVegas, r/henderson, r/summerlin (one combined feed) | social | **never**, demand signal only |

All sources are in `scripts/local-trends/config.mjs`: feeds, areas, categories,
builders, noise rules and thresholds.

### Known limits

- **No Instagram, TikTok, X or Facebook.** They need paid or approved API access,
  and scraping them breaks their terms.
- **Reddit rate-limits** requests from shared cloud IPs. The agent retries once,
  then carries on without signals and marks the feed failed on the report.
- **Clark County has no working RSS feed.** County news arrives through Google
  News and local outlets.
- **Google News links are redirects.** They open the article in a browser, but
  the agent can't read the article behind them, so those items are judged on
  headline and publisher. Their status evidence can only come from the headline.
- **Paywalls.** Some article excerpts are unavailable (typically 40–60% get read).
  Status evidence then relies on the headline and feed summary.
- **"Recent social topics"** are not tracked automatically. Record what you've
  posted in `content_created`.

---

## Files

```
scripts/local-trends/
  config.mjs              every tunable: feeds, areas, categories, noise, scoring, model
  run.mjs                 the runner (daily / weekly / both)
  lib/feeds.mjs           RSS/Atom parsing, Google News queries, excerpts
  lib/classify.mjs        normalize, dedupe, area/category/noise, triage
  lib/status.mjs          status ladder and verbatim-evidence validation
  lib/inventory.mjs       what LVINIT already has (reuses the linking agent's graph)
  lib/judge.mjs           the Claude call, its schema, and output validation
  lib/heuristic.mjs       rules-only fallback
  lib/score.mjs           /40 total, bands, caps
  lib/state.mjs           watchlist + reviewed memory, resurfacing rules
  lib/report.mjs          daily and weekly Markdown
  fixtures/               fictional stories + canned judgment for tests
  test/                   node:test suite
```
