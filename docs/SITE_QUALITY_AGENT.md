# Site Quality Agent

A weekly technical audit that protects LVINIT.com from SEO, site-quality and
publishing regressions. It is not a redesign agent, a content writer or a
cleanup bot.

**Audit → detect → classify severity → plan safe fixes → (prove them) → report.**

It ships **report-only**. It proposes fixes and can prove them in a trial that
always reverts, but it never commits. Autonomous repair is wired into the
workflow and switched off by one repository variable (see
[Turning auto-fix on](#turning-auto-fix-on)).

---

## The one-paragraph version

Every Friday the agent builds the site exactly as Vercel does, then reads what
the build produced: every prerendered page's `<head>`, JSON-LD, headings, images
and links, plus `sitemap.xml` and `robots.txt`. It compares that against the
repository: which pages exist, what the sitemap and the `lib/content.ts`
registry say, which images are in `public/` with their exact letter case, and
which are committed. Real problems become findings with a stable ID and a
severity. One component bug that touches thirty pages is one finding, not
thirty. A handful of purely mechanical problems (a link or image path with the
wrong letter case, a sitemap missing a published page) get an exact proposed
fix. Everything else goes to the right owner with the reason automation stopped.
A normal week is zero to three items.

---

## Why it reads the build, not the TSX

Every LVINIT route is statically prerendered, so `.next/server/app/<route>.html`
is exactly what Google gets. Reading it catches things source-reading cannot:

* **Canonical inheritance.** `app/layout.tsx` sets `alternates.canonical: "/"`.
  A page that forgets its own `alternates` inherits the homepage canonical
  without any error. The rendered `<link rel="canonical">` shows it.
* **og:url inheritance.** Same mechanism. This is live today on `/contact` and
  `/search`.
* **Anchors that only exist on one page.** Navbar and Footer link to `#compare`,
  `#videos`, etc. Those ids exist only on the homepage.

The React Server Component payload is stripped before anything is parsed, so
serialized props are never mistaken for markup. The few things that only live
there (a video facade's `youtubeId` and `poster`) are read from it separately.

The source layer is still used for what only the repo knows: which page files
exist, `app/sitemap.ts` (where a fix goes), the registry, exact-case asset
paths (Windows forgives `Foo.webp` vs `foo.webp`, but Vercel's Linux filesystem
404s it), and whether an asset is committed. An untracked image works locally
and 404s in production.

---

## Where the files live

```
scripts/site-quality/
  config.mjs                 every threshold, limit, allowlist and switch
  run.mjs                    the runner and its command line
  lib/
    catalog.mjs              every issue type: area, base severity, owner, fixability
    inventory.mjs            routes, build output, sitemap/robots, public/ index, registry
    html.mjs                 dependency-free reader for prerendered HTML
    urls.mjs                 href classification; locating a literal in source
    checks/
      routes-sitemap-robots.mjs
      metadata.mjs           titles, descriptions, canonicals, robots meta, share images
      schema.mjs             JSON-LD
      images-headings-copy.mjs
      links.mjs              internal/anchor/mailto/tel/dev URLs, technical orphans
      registry-video.mjs     lib/content.ts contract, YouTube embeds and posters
    findings.mjs             grouping, fingerprints, severity, GSC ordering, health score
    history.mjs              lifecycle across runs (ledger + earlier reports)
    ledger.mjs               the durable issue ledger on lvinit-agent-state
    fixes.mjs                safe auto-fix planning and the twelve gates
    execute.mjs              trial/apply, diff inspector, re-audit, git (reused)
    audit.mjs                runs every check and assembles findings
    report.mjs               Markdown + JSON
  fixtures/fixture-site.mjs  a synthetic repo + build output, for tests and demos
  test/                      81 tests
.github/workflows/site-quality-agent.yml
reports/site-quality/            generated, gitignored
reports/site-quality-history/    earlier CI reports, downloaded each run, gitignored
```

### What is reused, not rebuilt

| From | What |
|---|---|
| Internal Linking Agent `lib/git.mjs` | preflight (branch, clean tree, fetch, no divergence), commit with staged-path check, push with remote-moved detection, clean-rebase-onto-remote, drop-own-commit, trial path cleanliness |
| Internal Linking Agent `lib/verify.mjs` | the validation runner (tests, `tsc --noEmit`, `next lint`, `next build`) |
| Internal Linking Agent `lib/signals.mjs` | `loadGscSignal`, so "absence from GSC is neutral, never a penalty" is the same code |
| GSC Agent `lib/site-inventory.mjs` | `classifyRoute`, so every agent means the same thing by "a guide" |
| All report agents | Markdown + JSON in `reports/<agent>/`, gitignored; CI artifact + history download; stable `PREFIX-YYYY-MM-DD-NNN` IDs; fingerprints; quiet-after-N rule |

| Shared `lvinit-agent-state` branch + `.github/actions/agent-state` | the durable issue ledger, `data/site-quality/ledger.json` (see [Lifecycle](#lifecycle-and-noise)) |

The audit job reads the ledger from a read-only clone and never holds a write
token. A separate `publish-state` job, the same split the GSC and Content Brief
workflows use, commits only `data/site-quality/` back through the shared
action.

---

## How to run it

```bash
npm run quality:report            # audit the existing build (fast; warns if the build is stale)
npm run quality:audit             # fresh production build + tsc + lint, then audit (what CI runs)
npm run quality:trial             # fresh build, then prove every safe fix and revert it
npm run quality:report:fixtures   # the synthetic demo site, stamped FIXTURE DATA
npm run quality:test
```

| Flag | What it does |
|---|---|
| `--build` | `rm -rf .next` then `npm run build` first (also cures the OneDrive `readlink` flake) |
| `--validate` | also run TypeScript and ESLint and report a failure as a finding |
| `--trial` | apply safe fixes → diff inspector → tests/tsc/lint/build → rebuild + re-audit → **always revert** → rebuild |
| `--apply` | same, then commit and push. Refused unless `SITE_QUALITY_AUTO_FIX=true` |
| `--no-gsc` | ignore search data |
| `--max-fixes=N` | auto-fix limit per run (default 5) |
| `--state-dir=DIR` | a checkout of `lvinit-agent-state`; reads `data/site-quality/ledger.json` there. Without it, the ledger copy beside the local reports is used. |
| `--today=YYYY-MM-DD`, `--out=DIR`, `--no-push`, `--no-commit`, `--no-rebuild` | as named |

`--trial` only needs the files it would edit to be clean, so it can run beside
unrelated work.

---

## Audit areas

| Area | What is checked |
|---|---|
| **Routes** | inventory from `app/**/page.tsx` (route groups and private folders handled, `/api` excluded); two files serving one URL; uppercase in a route; a page file the build did not render |
| **Sitemap** | rendered `sitemap.xml` vs the inventory: missing published pages, stale entries (404s), duplicates, malformed `<loc>` (wrong origin/protocol, trailing slash, uppercase, query), listing a noindex page, listing a page that canonicalizes elsewhere. `site.sitemapExcludedRoutes` holds intentional exclusions (none today, since the sitemap lists every page). |
| **Robots** | rendered `robots.txt`: parse, Google's longest-match allow/disallow, a site-wide block, a block on any sitemap route, missing/wrong `Sitemap:` line, malformed lines, dev hosts |
| **Metadata** | title and description present, duplicates across pages (one finding per shared value), og:url vs canonical, noindex/nofollow on a published page, share image exists and is < 5 MB |
| **Canonical** | exactly one; absolute on `https://www.lvinit.com`; no query/fragment/trailing or double slash; equals the page's own route. Pointing at another route is a mismatch. |
| **Structured data** | every block parses; schema.org `@context`; no duplicate blocks or duplicate Article/BreadcrumbList; `Article.mainEntityOfPage` = the page URL; last breadcrumb = the page; breadcrumb targets exist; ISO dates, not in the future, modified ≥ published; guides carry `datePublished`; schema images/logo/thumbnails exist; a story page lacks Article only when most of its peers have one |
| **Images** | every rendered `<img>` (decoding `/_next/image?url=`): file exists, exact case, committed; alt attribute present; empty alt allowed when decorative (`aria-hidden`, `role=presentation`, inside a `role="img"` wrapper) and flagged only when the registry says it is a real photo; external hotlinks; raw (unoptimized) files > 1 MB. Plus every `"/images/..."` literal in source, outside comments. |
| **Headings** | exactly one non-empty H1; heading level skips (LOW) |
| **Links** | internal target exists (exact case); trailing/double slash; wrong LVINIT protocol/host; same-page and cross-page `#anchors` exist; `href="#"`/empty/`javascript:`; mailto/tel syntax; external URL parses; localhost/staging/`*.vercel.app` anywhere in output **or** source; **technical orphans**: pages no chain of links from the homepage reaches |
| **Registry** | the `lib/content.ts` contract: `href` resolves; no duplicate slug/href; `publishedAt` valid and **equal to the page's Article `datePublished`**; card image exists; photo mode has `imageAlt`, covers don't; every live `/guides/*` page has an entry; a draft isn't live in the sitemap; `videos[]` ids valid and `/images/video-<id>.jpg` exists; a module whose header declares `PLACEHOLDER CONTENT` isn't rendered in production |
| **Video / embeds** | YouTube id format in iframes, facade props and source literals; poster exists; VideoObject `embedUrl`/`contentUrl` agree and name a video the page actually shows |
| **Placeholder copy** | lorem ipsum, TODO, TBD, FIXME, `[insert …]`, unrendered `{{template}}`, `[object Object]`, `undefined`/`NaN` in visible text |
| **Build** | `next build`, `tsc`, `next lint` failures become CRITICAL/HIGH findings |

External link availability is **not** crawled in v1. It is slow and flaky, and a
transient 403 is not a site regression.

---

## Severity

Decided by issue type in `lib/catalog.mjs`. Only two documented rules adjust it:

* **Context rules in a check.** For example, noindex on the homepage is CRITICAL.
* **A type's own systemic severity.** `canonical-mismatch` and `noindex-unexpected`
  become CRITICAL when one root cause hits ≥ 5 pages ("canonical architecture
  broken across many pages").

Breadth alone never raises a severity: thirty pages sharing one footer bug is
one MEDIUM finding that names thirty pages. Search traffic never changes a
severity.

| | Examples |
|---|---|
| **CRITICAL** | build fails; sitemap.xml or robots.txt missing; robots blocks the site; homepage or ≥5 pages noindex; ≥5 pages canonicalizing to one wrong URL |
| **HIGH** | published page missing from the sitemap; stale sitemap entry; broken internal link; canonical to another page; two canonicals; unparseable JSON-LD; missing/case-mismatched/uncommitted image; dev URL; tsc/lint failure |
| **MEDIUM** | missing/duplicate title or description; broken anchor; placeholder link; missing alt; schema URL mismatch, bad date, missing Article; registry date mismatch; technical orphan |
| **LOW** | heading skip; trailing slash; og:url mismatch; oversized image; cover with imageAlt |
| **INFO** | reserved; nothing is currently raised as INFO |

### Health score

A page starts at 100 and loses **40 / 15 / 5 / 1 / 0** (CRITICAL…INFO) for each
open finding naming it. The site starts at 100 and loses each finding's weight
**once**, so a root cause shared by thirty pages costs the site once. Ignored
findings cost nothing. The score is for ordering; severity is what matters.

### GSC

Read-only, off disk, via the Internal Linking Agent's loader. It **reorders
findings within the same severity** and tags a page with ≥ 100 impressions as
search-visible ("do this first"). It never decides whether something is broken.
A page absent from the GSC report is neutral, never deprioritized.

---

## Safe auto-fix

A fix is planned only for types marked `conditional` in the catalog, and only in
two mechanical shapes:

1. **Literal replacement.** A URL/path string literal in code becomes a value
   that already exists in the repo (a real route or a real file):
   letter-case link, trailing/double slash, wrong LVINIT protocol/host,
   letter-case image path (only when exactly one file matches), a
   canonical/schema URL that names *this* page with wrong case/slashes/host.
2. **Sitemap entry.** Add one entry for a live, indexable, self-canonical,
   non-draft guide or neighborhood page, copying the `changeFrequency`/`priority`
   its section already uses (≥ 3 peers, ≥ 60 % agreement). Or remove one entry
   whose route has no page file and no redirect.

Every fix records all **twelve gates** from the brief. Nine are checked when
the fix is planned: deterministic, unambiguous, no editorial judgment, no new
copy, no SEO strategy decision, no compliance line (Equal Housing, license,
brokerage, Scofield, disclaimer, Fair Housing), no design change, meaning
unchanged (every occurrence must sit in a URL/path context), tightly scoped
(≤ 10 occurrences in ≤ 3 allowed files). Three can only be proven by applying
the fix: validation, build, and diff scope. A trial or apply settles them:

* the **diff inspector** requires the changed-file set to equal the planned set,
  every file on disk to equal the in-memory plan byte for byte, and every
  changed line to be explained by a planned literal swap or sitemap line;
* **validation**: Site Quality + Internal Linking tests, `tsc --noEmit`,
  `next lint`, `next build`;
* **re-audit** of the rebuilt site: every fixed fingerprint gone, and no new
  fingerprint anywhere.

Any failure reverts everything. Limits per run: **5 fixes, 5 files, 1
shared-infrastructure root cause** (a second sitemap entry in the same file is
the same root cause). A fix this agent shipped that later comes back is never
re-applied (`PREVIOUSLY_AUTO_FIXED`). A person changed it, and the agent does
not fight that.

Protected paths, never edited: `app/robots.ts`, `app/layout.tsx`, `app/api/`,
`app/search/` (Matrix IDX), `components/Analytics.tsx`,
`components/ContactForm.tsx`, `next.config.mjs`.

### Always report-only

Titles, descriptions, headings, article copy, alt text, CTAs, forms, navigation
and footer links, schema types and claims, dates, prices/rates/stats/housing or
development facts, compliance copy, Fair Housing language, image choices,
deleting pages, redirects, robots policy, analytics, Vercel settings,
dependencies. So are editorial internal links (Internal Linking Agent) and
factual freshness (Fact-Decay Agent).

---

## Lifecycle and noise

Each finding gets `QA-YYYY-MM-DD-NNN` and a 12-char **fingerprint**:
`sha1(type | route or root cause | field | normalized failure)`. The
normalization lowercases, collapses whitespace and strips the LVINIT origin. A
grouped finding's fingerprint is its root cause, so a new page joining an
existing bug does not create a new issue.

* `status`: **NEW** (or reopened) → **PERSISTING** (same ID, `firstSeen` kept,
  `priorSeverity` shown if it changed) → **RESOLVED** when gone, or
  **AUTO_FIXED** when an apply run pushed it. **IGNORED** if its fingerprint is
  in `config.decisions.ignored` (or `SITE_QUALITY_IGNORED_FINGERPRINTS`).
* `disposition`: **AUTO_FIX_CANDIDATE**, **REVIEW_REQUIRED** (with the reason
  automation stopped and a recommended owner: Publisher, Internal Linking Agent,
  human/dev or Fact-Decay), or **OBSERVE** (LOW with nothing to decide).
* LOW items shown in full twice without change collapse to one line under
  "Still open". MEDIUM and above never go quiet.

### The ledger

`data/site-quality/ledger.json` on `lvinit-agent-state` (`schema_version`,
`agent: "lvinit-site-quality"`). One entry per fingerprint:

| Field | |
|---|---|
| `id`, `fingerprint`, `type`, `title`, `area` | identity |
| `firstSeen`, `lastSeen`, `timesSeen` | when |
| `severity`, `priorSeverity` | current and the one before a change |
| `status`, `disposition` | lifecycle and what should happen (REVIEW_REQUIRED etc.) |
| `resolvedOn`, `resolution` | "no longer detected by the audit", "auto-fixed by this agent in <commit>", "ignored by decision" |
| `autoFixCommit`, `autoFixedOn` | kept for good, so a fix a person undid is never re-applied |
| `owner` | handoff owner: Publisher, Internal Linking Agent, Fact-Decay, human/dev |
| `routes`, `routeCount`, `rootCause` | where |
| `reopenedCount`, `events[]` | the last 20 status/severity changes |

`lastRun` / `previousRun` hold the open set of the last two runs, so a
same-day re-run compares against the run before it. Resolved entries are
dropped a year after they resolve, except auto-fixed ones. The ledger never
holds Search Console numbers (the branch is public); `publish-state` refuses a
ledger that does.

History precedence: the ledger wins on identity and on "what was open last
run" whenever it is at least as new as the newest report. The report
artifacts (90 days) are the fallback for a first run.

## Publisher handoffs

Findings that need editorial work (a missing description, alt text, Article
schema, a date to reconcile, placeholder copy) are written up under
"Publisher handoffs (not dispatched)" in both reports. v1 never dispatches the
Publisher.

---

## Schedule and permissions

```
Monday     13:00 UTC   GSC Opportunity Agent
Monday     15:00 UTC   Weekly Publisher watchdog
Tuesday    13:00 UTC   Content Brief Generator
Wednesday  13:00 UTC   Internal Linking Agent   (pushes link edits)
Thursday   13:00 UTC   Fact-Decay Agent
Friday     13:00 UTC   Site Quality Agent       (this one)
Daily      13:30/14:30 Local Trend + Development Watch (state branch only)
```

Friday audits the week's finished state, after Wednesday's link edits and the
week's Publisher work, and before the weekend. Nothing depends on the exact
start time; scheduled runs have started 4–5 hours late, and a late Friday start
audits the same week.

| Job | Runs | Permissions |
|---|---|---|
| `audit` | always | `contents: read`, `actions: read` |
| `autofix` | only if `vars.SITE_QUALITY_AUTO_FIX == 'true'`, the audit planned ≥ 1 safe fix, and no CRITICAL is open | `contents: write` (main), `actions: read` |
| `publish-state` | whenever the audit wrote a report (also on a CRITICAL week) | `contents: write`, used only by the agent-state action (state branch, `data/site-quality/`) |

The run fails (red X, so GitHub notifies) only when a **CRITICAL** finding is
open.

### Turning auto-fix on

When you are ready, set the repository variable `SITE_QUALITY_AUTO_FIX` to
`true` (GitHub → Settings → Secrets and variables → Actions → Variables).
Delete it to switch repair off again. Nothing else changes.

Each apply run then needs a clean tree on `main`, fetches, fast-forwards only,
and applies at most 5 fixes. It validates, re-audits, commits only the planned
files and pushes. If the remote moved, it rebases only when the new commits
touched none of its files, then re-validates. It never force-pushes. Set the
repository variable `SITE_QUALITY_GIT_PUSH` to `false` to commit without
pushing. The apply run's report and ledger supersede the audit's for that week.

---

## Limits worth knowing

* **Needs a build.** Without a fresh `.next`, every rendered check is skipped and
  the report says so. `--build` (and CI) always builds first.
* **Static routes only.** A dynamic `[slug]` route cannot be enumerated from the
  filesystem; it would be reported as unaudited. LVINIT has none today.
* **Regex over TSX for fix locations.** A literal must sit on one line in a
  URL/path context, or the fix is refused, never guessed.
* **Registry evaluation.** `lib/content.ts` is transpiled with the project's own
  TypeScript and imported. If it ever imports another module, registry checks
  report that they could not run.
* **No external link crawling** in v1.
* **Placeholder detection is pattern-based.** It catches the obvious markers, not
  plausible-looking invented copy. That is the Publisher's integrity rules.
* **The OneDrive flake.** `next build` can fail with `EINVAL … readlink`;
  `--build` removes `.next` first, which avoids it.
