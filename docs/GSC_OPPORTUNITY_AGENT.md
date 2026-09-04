# GSC Opportunity Agent

> Reads LVINIT's real Google Search Console data once a week and tells you where
> the genuine organic-search opportunities are — in plain English, with the
> arithmetic shown.
>
> It **reads and recommends. It never writes.** Execution belongs to the
> [Content Publisher agent](CONTENT_PUBLISHER_AGENT.md), and only after you
> approve a specific finding.

---

## What it does

Every week it pulls the last 28 complete days of Search Console data, compares
them with the 28 days before that, and looks for nine specific things:

| Opportunity type | What it means |
|---|---|
| **Quick win** | A query where a well-matched LVINIT page already ranks, close enough that moving it is realistic. |
| **Clickthrough opportunity** | A page getting impressions at a decent position, but very few people click. The ranking works; the result is not being chosen. |
| **Emerging search** | A query that is new, or growing meaningfully versus the period before. |
| **Page gaining momentum** | A page whose clicks, impressions or position are improving. |
| **Page losing momentum** | A page that is sliding, and is worth understanding before it settles. |
| **Content gap** | Real search demand with no LVINIT page that actually answers it. |
| **Query / page mismatch** | Google is ranking one page, but a different existing page is a genuinely better answer. |
| **Possible cannibalization** | Two LVINIT URLs competing for the same search intent, splitting the signal. |
| **Internal-link opportunity** | A page with visibility that closely related LVINIT pages do not currently link to. |

Each finding gets a stable ID like `GSC-2026-09-04-001`, so you can say:

> "Have the LVINIT Real Estate Content Publisher execute GSC-2026-09-04-001."

Nothing is handed over automatically. **You are the approval layer between
discovery and execution.**

---

## Where the files live

```
scripts/gsc/
  run.mjs                       the command you run
  config.mjs                    EVERY threshold, weight, and window setting
  lib/
    auth.mjs                    Google service-account sign-in (read-only scope)
    client.mjs                  the Search Console API client
    windows.mjs                 date-window maths (lag buffer, comparison period)
    site-inventory.mjs          reads LVINIT's real routes, titles, and link graph
    text.mjs                    tokenizing and topical matching
    fair-housing.mjs            the compliance gate
    editorial.mjs               LVINIT's editorial priorities and search intent
    score.mjs                   the scoring model
    analyze.mjs                 the nine detectors
    report.mjs                  Markdown and JSON rendering
  fixtures/
    fixture-dataset.mjs         SYNTHETIC test data, clearly labelled
  test/                         the test suite (node:test, no dependencies)

.github/workflows/gsc-opportunity-agent.yml   the weekly scheduled run
reports/gsc/                                   generated reports (gitignored)
docs/GSC_OPPORTUNITY_AGENT.md                  this file
```

**Zero new npm packages.** The agent uses only Node built-ins, so nothing was
added to the site's dependency tree.

---

## How to run it

### Try it right now, with no credentials

```bash
npm run gsc:report:fixtures
```

This runs the whole pipeline against a synthetic dataset in
`scripts/gsc/fixtures/`. Every number is invented, and the report says so in a
banner at the top. It exists so you can see the output format and so the logic
can be tested before Search Console access is connected.

### Run against real Search Console data

Once the setup below is done, put the values in a local `.env` file (which is
already gitignored) and run:

```bash
npm run gsc:report:env
```

Or, if the variables are already in your shell environment:

```bash
npm run gsc:report
```

### Useful flags

```bash
node scripts/gsc/run.mjs --help              # every option
node scripts/gsc/run.mjs --period-days=7     # a shorter trend window
node scripts/gsc/run.mjs --lag-days=5        # a more cautious data-lag buffer
node scripts/gsc/run.mjs --min-score=60      # only the strongest findings
node scripts/gsc/run.mjs --dry-run           # analyze, write no files
node scripts/gsc/run.mjs --today=2026-09-04  # pretend it is a different day
```

### Run the tests

```bash
npm run gsc:test
```

---

## Setup you have to do yourself

The agent signs in as a **Google Cloud service account** — a robot account with
its own email address, which you add as a user on the Search Console property.
That is the right shape for an unattended weekly job: no browser login, no
refresh token to babysit, and it can be revoked from Search Console in one click.

**Do not paste the private key into a chat window, including to Claude.** It goes
straight from the downloaded file into GitHub's secret store.

### Step 1 — Create the service account

1. Open **https://console.cloud.google.com/**
2. Top bar, project dropdown → **New Project**. Name it `lvinit-seo` → **Create**.
   (If you already have a project you want to use, select that instead.)
3. Left menu → **APIs & Services** → **Library**.
4. Search for **Google Search Console API** → click it → **Enable**.
5. Left menu → **IAM & Admin** → **Service Accounts** → **+ Create service account**.
6. Service account name: `lvinit-gsc-reader`. Click **Create and continue**.
7. On "Grant this service account access to project", click **Continue** — it
   needs **no** project roles. Then **Done**.

### Step 2 — Create its key

8. In the service-account list, click **lvinit-gsc-reader**.
9. Tab **Keys** → **Add key** → **Create new key** → choose **JSON** → **Create**.
10. A `.json` file downloads. **This is a credential — treat it like a password.**
    Keep it out of the repository and out of any chat window.
11. Open the file in a text editor and copy the value of **`client_email`**. It
    looks like `lvinit-gsc-reader@lvinit-seo.iam.gserviceaccount.com`.

### Step 3 — Give it read access to the Search Console property

12. Open **https://search.google.com/search-console/**
13. Select the **lvinit.com** property in the dropdown, top left.
14. Left menu, bottom → **Settings** → **Users and permissions**.
15. Click **Add user**.
16. **Email address:** paste the `client_email` from step 11.
17. **Permission:** choose **Restricted**. That is enough to read search
    analytics, and is the least access that works. (If you later get a
    permission error, switch it to **Full** — but try Restricted first.)
18. Click **Add**.

### Step 4 — Note the exact property string

19. Still in Search Console, look at the property dropdown at the top left.
    * If it shows **`lvinit.com`** with a globe icon, it is a *domain property*
      and your value is: `sc-domain:lvinit.com`
    * If it shows a full URL like **`https://www.lvinit.com/`**, it is a
      *URL-prefix property* and your value is exactly that URL, trailing slash
      included.
20. Write that string down — it is `GSC_SITE_URL`.

### Step 5 — Store the secrets in GitHub

21. Open your repository on GitHub → **Settings** (repo settings, not your
    account) → left menu **Secrets and variables** → **Actions**.
22. Click **New repository secret**.
    * **Name:** `GSC_SITE_URL`
    * **Secret:** the string from step 20
    * → **Add secret**
23. Click **New repository secret** again.
    * **Name:** `GSC_SERVICE_ACCOUNT_JSON`
    * **Secret:** open the JSON file from step 10, select **all** of it, and
      paste the entire contents (it starts with `{` and ends with `}`).
    * → **Add secret**
24. Delete the downloaded JSON file from your Downloads folder once both secrets
    are saved. GitHub has it now; your laptop does not need it.

### Step 6 — For local runs (optional)

If you also want to run it from your own machine, create a `.env` file in the
project root (it is gitignored — it will never be committed):

```
GSC_SITE_URL=sc-domain:lvinit.com
GSC_SERVICE_ACCOUNT_JSON={"type":"service_account", ... }
```

Then `npm run gsc:report:env`.

### Step 7 — Test it

25. GitHub → your repository → **Actions** tab → **GSC Opportunity Agent** in
    the left list → **Run workflow** button → **Run workflow**.
26. When it finishes, open the run and download the **gsc-opportunities**
    artifact at the bottom. The run page itself also shows a short summary.

---

## Environment variables

| Variable | Required | What it is |
|---|---|---|
| `GSC_SITE_URL` | yes | The Search Console property, exactly as GSC names it — `sc-domain:lvinit.com` or `https://www.lvinit.com/`. |
| `GSC_SERVICE_ACCOUNT_JSON` | yes* | The whole downloaded service-account key file, as one value. |
| `GSC_SERVICE_ACCOUNT_EMAIL` | yes* | Alternative to the above: the `client_email` field on its own. |
| `GSC_SERVICE_ACCOUNT_KEY` | yes* | Alternative to the above: the `private_key` field on its own. `\n` escapes are handled. |
| `GSC_SITE_ORIGIN` | no | Public origin used to map Search Console URLs to routes. Defaults to `https://www.lvinit.com`. |

\* Provide **either** `GSC_SERVICE_ACCOUNT_JSON`, **or** both
`GSC_SERVICE_ACCOUNT_EMAIL` and `GSC_SERVICE_ACCOUNT_KEY`.

Every threshold in `scripts/gsc/config.mjs` also has an environment override —
the variable name is written next to each value in that file.

Credentials are never stored in the repository. `.env` and `.env.local` are
gitignored, and `.env.example` contains placeholder names only.

---

## How authentication works

1. The agent builds a short-lived JWT saying "I am
   `lvinit-gsc-reader@…`, and I want the scope
   `https://www.googleapis.com/auth/webmasters.readonly`".
2. It signs that JWT with the service account's private key (RS256, using Node's
   built-in `node:crypto`).
3. It posts the signed JWT to Google's token endpoint and gets back an access
   token valid for an hour, cached in memory for the run.
4. It calls the Search Console `searchAnalytics.query` endpoint with that token.

The scope is **read-only**, and `searchAnalytics.query` is the only endpoint the
client module knows how to call. There is no code path that could write anything
to Google.

---

## How the score works

Every finding gets a **0–100 score**: a weighted average of seven components,
each normalized to 0–1.

```
score = 100 × Σ(weight × component) ÷ Σ(weight)
```

| Component | What it measures | Why it is shaped that way |
|---|---|---|
| **Size** | How much search demand is attached. | A log curve saturating at 400 impressions, so on a young site the jump from 20 to 200 counts for far more than 2,000 to 2,200. |
| **Position potential** | How much realistic ranking upside is left. | Peaks at position 11 — visible and climbable. Falls to zero at position 1 (nothing left to win) and past position 45 (not realistic yet). |
| **CTR gap** | How far below **LVINIT's own** median clickthrough for that position band the result sits. | Zero when there is no trustworthy baseline. **No industry CTR benchmark is used anywhere in this agent.** |
| **Momentum** | Period-over-period change. | For a *losing* page the sign is flipped, so a worse decline scores higher — it is more urgent. |
| **Editorial** | How close the query is to what LVINIT is actually for. | A high-traffic query about show tickets scores zero. |
| **Intent** | How close the searcher is to a real housing or relocation decision. | A ranking signal only. The agent **never** estimates leads, revenue, conversion, or search volume. |
| **Actionability** | How cheap the fix is. | Internal links and page edits are cheap; commissioning new content is not. |

The weights differ per opportunity type, because what makes a quick win valuable
is not what makes a content gap valuable. The weight table lives in
`scripts/gsc/config.mjs` under `scoring.weights`, and every report carries the
exact weights it used in its JSON.

Each finding in the report shows its own component-by-component arithmetic, so
"why is this ranked above that" always has a checkable answer.

### Confidence is separate from score, on purpose

A finding can be high-value and low-confidence at the same time. Averaging those
together would hide it. Confidence comes from data volume alone:

* **high** — 150+ impressions in the current window
* **medium** — 40+
* **low** — below that

Plus explicit caveats when there is no comparable previous period, or when
LVINIT's own CTR baseline for that position band is too thin to trust.

---

## Time windows and the data-lag buffer

Search Console data is not final the moment it appears. The agent guards against
that twice:

1. It asks the API for `dataState: "final"` — Google's own guarantee that the
   rows will not be revised.
2. It also skips the most recent **3 days** entirely (`lagDays`), as a second,
   independent belt.

The default comparison is:

* **Current period:** the most recent 28 complete days, ending 3 days ago
* **Previous period:** the 28 days immediately before that — no gap, no overlap

Both lengths are configurable. If you set them to different values, the report
says so at the top and warns that deltas are indicative only.

---

## Changing thresholds and reporting periods

Everything lives in **`scripts/gsc/config.mjs`**, grouped and commented. You can
change a value three ways, in increasing order of precedence:

1. Edit the default in `config.mjs`
2. Set the environment variable named beside it (e.g. `GSC_MIN_SCORE=60`)
3. Pass a CLI flag (e.g. `--min-score=60`)

The ones you are most likely to want:

| What you want | Where |
|---|---|
| Report more / fewer findings | `output.minScore` (default 40), `output.maxOpportunities` (15), `output.maxPerType` (3) |
| Change the comparison period | `windows.periodDays` (28), `windows.comparisonDays` (defaults to the same) |
| Be more or less cautious about fresh data | `windows.lagDays` (3) |
| Surface smaller signals while the site is young | `thresholds.minImpressions` (15) and the per-detector `minImpressions` values |
| Change what counts as "striking distance" | `thresholds.quickWin.bestPosition` / `worstPosition` |
| Change how weak CTR has to be to flag | `thresholds.ctr.shortfallRatio` (0.5 = half of LVINIT's own band median) |
| Re-weight what the score cares about | `scoring.weights` |

Thresholds are set deliberately low, because LVINIT is still a growing site and
setting them high would erase the early signals that are the whole point.

---

## What the report contains

Two files per run, in `reports/gsc/`:

* `gsc-opportunities-YYYY-MM-DD.md` — written for you, not for an SEO
* `gsc-opportunities-YYYY-MM-DD.json` — the machine contract, stable keys

The Markdown report is ordered:

1. **The numbers, before any interpretation** — raw Search Console totals
2. **Top opportunities this week** — up to five, each answering the same five
   questions: what Google is showing us, why it matters, what I recommend,
   which page is affected, and whether it needs an existing page updated or
   something new. One finding per page, so the summary covers several pages
   rather than three angles on one.
3. **Everything else the agent found** — the full table plus detail blocks
4. **How the score works** — the explainer above, in short
5. **LVINIT's own clickthrough baseline** — the numbers "weak CTR" was measured against
6. **Fair Housing exclusions** — what was excluded and why
7. **Data quality notes** — what was left out, and what the data cannot support
8. **What this agent did not do** — the prohibition list

Both formats label every number as one of four things: a **raw** Search Console
metric, a **calculated** value, the **agent's interpretation**, or a
**recommended action**.

---

## Fair Housing

This is a **hard gate, not a scoring penalty**. A query that trips it can never
become a recommendation, no matter how much traffic it has.

Blocked: familial status, schools-as-a-ranking, safety and crime framing, race,
ethnicity, national origin, religion, age (including 55+ and retiree framing),
disability, sex/gender/orientation, and income or status proxies.

That means the agent will never recommend "best neighborhoods for families",
"safest Las Vegas neighborhoods", "best schools neighborhoods", or "best areas
for young professionals" — the four examples you named, and everything shaped
like them.

Excluded queries are still **listed** in the report, with the reason and with no
recommendation attached, so the exclusion is visible rather than silent. Nothing
about the exclusion list is a suggestion.

What the agent recommends instead: geography, housing stock, commute and access,
development, costs, property characteristics, and the practical tradeoffs of
living in one area versus another.

---

## What the agent is deliberately prohibited from doing

The agent — and the weekly job that runs it — **must not**:

* write or rewrite articles
* change titles, metadata, or schema on production pages
* add internal links directly
* modify neighborhood guides or any site file
* create public-facing pages
* publish content
* commit or push changes
* deploy the site
* send email or alter CRM data

These are enforced, not just stated:

* the agent has no code path that writes anywhere except `reports/gsc/`
* `reports/gsc/` is gitignored, so its own output cannot be committed
* the GitHub workflow runs with `permissions: contents: read`, so its token
  physically cannot push to the repository
* the Google scope is `webmasters.readonly`

It may **recommend** any of those actions. Execution belongs to the
[Content Publisher](CONTENT_PUBLISHER_AGENT.md), after you approve it.

---

## The weekly automation

`.github/workflows/gsc-opportunity-agent.yml` runs every **Monday at 13:00 UTC**
(about 06:00 in Las Vegas). It:

1. checks out the repository read-only
2. runs the agent's own test suite
3. authenticates with the service account
4. fetches Search Console data and runs the analysis
5. uploads `reports/gsc/` as a workflow artifact (kept 90 days)
6. prints the summary on the run page

It can also be run on demand from the **Actions** tab with **Run workflow**,
where you can override the period, lag buffer and minimum score — or tick
`fixtures` to do a dry run with synthetic data.

Reports are **artifacts, not commits**. To keep one permanently, download it.

---

## Handing a finding to the Content Publisher

Every finding carries a `handoff` block:

```json
{
  "agent": "lvinit-content-publisher",
  "authorized": false,
  "approvalRequired": "Mikey",
  "invoke": "Have the LVINIT Real Estate Content Publisher execute GSC-2026-09-04-001."
}
```

`authorized` is always `false`. The agent never triggers the Content Publisher.
When you have read a finding and want it done, say the `invoke` line yourself.

For a **create-new-content** recommendation, the finding carries an *editorial
angle*, not an article — a brief describing what the search suggests people are
weighing, what LVINIT already covers nearby, and what would genuinely be new.
The Content Publisher does the research, photography, writing, metadata, and
linking from there.

---

## Limits worth knowing

* **Search Console anonymizes rare queries.** Some real searches will never
  appear in the data at all. Absence is not evidence of absence.
* **Query totals and page totals do not add up to each other.** That is Google's
  behaviour, not a bug — a single search can involve more than one page, and
  anonymized rows are dropped from some dimensions and not others.
* **Topical matching is token overlap, not comprehension.** It compares the
  query against the page's route slug, title and description. It is good enough
  to tell a dedicated comparison guide from an adjacent neighborhood page, and
  it is not a semantic model. Every match score is printed so you can disagree
  with it.
* **The internal link graph is read from `href="/…"` in the source.** Links built
  dynamically from data would not be seen.
* **Thin data is thin data.** Below 200 impressions in a window, the report says
  so at the top and asks you to treat everything as an early signal.
