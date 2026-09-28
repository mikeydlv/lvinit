# LVINIT Weekly Publisher

**The question it answers:** *What should Mikey actually create and post this week?*

Every **Sunday at 8:00 PM Pacific** it writes ONE file for the Monday–Sunday
week that starts the next day:

```
reports/weekly-content/<Monday>-weekly-content-plan.md     e.g. 2026-10-05-weekly-content-plan.md
reports/weekly-content/LATEST.md                           always names the newest week (or its failure)
```

Open `LATEST.md` on Monday morning. The plan starts with **MONDAY MORNING — START
HERE** (under a minute), then **WHAT TO POST THIS WEEK** day by day (content,
platform, format, time, status, exact asset, hook, caption, CTA, why), then the
3 priorities, website/SEO work, video + social (including exactly what Mikey
needs to film), and what Claude can build without Mikey. Agent diagnostics are
at the bottom.

It **plans and prepares only**. It never posts to Instagram, TikTok, YouTube or
Facebook, and it never publishes to the website.

## Where it sits: the LVINIT agent map

| Agent | Job | Output |
|---|---|---|
| **Local Trend Agent** | Finds local/current opportunities (news, development, social chatter) | `lvinit-agent-state` → `reports/social-trends/`, `reports/development-watch/` |
| **GSC Opportunity Agent** | Finds search opportunities in Search Console | Actions artifact `gsc-opportunities` |
| **Content Brief Generator** | Turns selected opportunities into structured briefs | Actions artifact / `reports/content-briefs/` |
| **Fact-Decay Agent** | Finds published facts that are going stale | Actions artifact `fact-decay-report` |
| **Internal Linking Agent** | Finds and (when safe) adds internal links | Actions artifact `internal-links-report` + link commits |
| **Site Quality Agent** | Audits the built site for technical issues | `reports/site-quality/` |
| **Executive Producer** | Produces 7 finished draft social posts for the week (Sunday 7 PM) | `OneDrive\Documents\LVINIT\Weekly Posts\Week of <Monday>\` |
| **lvinit-content-publisher** | Researches, builds and publishes **approved** site content (a Claude Code subagent Mikey invokes) | Site pages via its normal approval flow |
| **LVINIT Weekly Publisher** | **Editor-in-chief.** Reads all of the above and decides what Mikey makes and posts this week | `reports/weekly-content/` |

The Weekly Publisher is **not** the Content Publisher. The Content Publisher
builds and ships a specific piece of website content once it is approved; the
Weekly Publisher decides what the week's work should be and hands website items
to the Content Publisher as recommendations. The specialist agents collect
signals; the Weekly Publisher consumes their outputs and does not redo their
work.

## The Sunday chain

| Time (Pacific) | Task Scheduler task | What runs |
|---|---|---|
| Sunday 7:00 PM | `LVINIT Weekly Production` | Executive Producer → 7 finished draft posts |
| Sunday 8:00 PM | `LVINIT Weekly Publisher` | Weekly Publisher → the weekly plan (waits up to 60 min if the Producer is still running) |
| Monday ~8 AM | GitHub Actions `Weekly Publisher Watchdog` | If this week's plan is missing or FAILED on `lvinit-agent-state`, opens a GitHub issue (GitHub emails Mikey) |

Both tasks run on Mikey's PC because they need the local footage library,
Weekly Posts folder and credentials that never leave the PC.

**Time zone.** The tasks use the PC's local clock, and the registration script
refuses to run unless the PC is on Pacific Time. Windows applies PST/PDT itself,
so 8:00 PM stays 8:00 PM in Las Vegas year-round; nothing is pinned to a UTC
offset. (The GitHub watchdog's cron is UTC by necessity; it only checks, and a
one-hour seasonal drift on a Monday-morning check doesn't matter.)

**Runner checkout.** Both tasks start `%USERPROFILE%\.lvinit\weekly-publisher\sunday-runner.ps1`,
which updates `%USERPROFILE%\.lvinit\runner` (a git worktree that follows
`origin/main`; nobody edits or switches it), installs dependencies when
`package-lock.json` changes, and runs the job there. The working folder Mikey
uses day to day can be on any branch without affecting the Sunday run.

**Catch-up.** WakeToRun wakes a sleeping PC. If the PC was off, StartWhenAvailable
runs the task at the next startup; a Monday–Friday catch-up plans the current
week. Two retries, 30 minutes apart. A week that already has a plan is never
overwritten unless you pass `--force`.

## Failure is never silent

Every Sunday leaves one of these:

- **SUCCESS:** `<Monday>-weekly-content-plan.md` + `LATEST.md`, pushed to
  `lvinit-agent-state` (`reports/weekly-content/`), an email ("this week's
  content plan is ready", with the START HERE block) and a Windows notification.
- **FAILURE:** `<Monday>-weekly-content-plan-FAILED.md` saying which step failed
  and why, `LATEST.md` pointing at it, the same push, a failure email and a
  notification.
- **The job couldn't even start its code** (missing checkout, missing script,
  crash before reporting): the runner script, which lives outside the repo,
  writes the FAILED file and `LATEST.md` itself and shows a notification.
- **Nothing ran at all** (PC off all weekend): the Monday watchdog opens a
  GitHub issue.

Logs: `%USERPROFILE%\.lvinit\weekly-publisher\weekly-publisher.log` (publisher),
`%USERPROFILE%\.lvinit\executive-producer\weekly.log` (producer).
Per-run record: `reports/weekly-content/.runs/<Monday>-run.json`.

## How it decides

1. **Collect** (`lib/signals.mjs`): the latest output of every agent in the map,
   this week's Executive Producer batch, the last 3 weeks of batches, recent
   YouTube uploads, the video inventory, 4 weeks of `main` history and the
   published routes, and the last two weekly plans. A missing signal is noted in
   the plan's PIPELINE STATUS; it never stops the run.
2. **Edit** (`lib/editor.mjs`): one Claude call (`claude-opus-5`, a few web
   searches to confirm time-bound facts). Rules: reuse existing assets first;
   don't force seven posts; no same subject on consecutive days; vary hooks,
   caption structure and CTA; nothing from the last 21 days; no invented numbers;
   fair-housing and compliance rules; no marketing on sensitive dates. Server-side
   refusal fallback is enabled so a declined request is retried on a fallback
   model within the same call.
3. **Validate + render** (`lib/render.mjs`): 7 days with valid statuses,
   exactly 3 priorities, every website line filled (or `NONE`), no repeated CTA
   on consecutive days. An incomplete answer is sent back once; still incomplete
   → FAILED.
4. **Deliver** (`lib/deliver.mjs`): local files, state-branch push (its own
   `weekly-content` namespace only), email, notification.

Cost: about $1–3 per week in Anthropic usage (recorded in the run record).

## Commands

```bash
npm run publisher:week                       # plan the coming week now (skips if it exists)
node scripts/weekly-publisher/run.mjs --week=2026-10-05 --force   # re-plan a specific week
npm run publisher:dry-run                    # local file only, no push/email
node scripts/weekly-publisher/run.mjs --plan-json=plan.json --week=2026-09-28   # deliver a plan written in a Claude Code session
npm run publisher:test
```

Register or repair the Sunday tasks (once, from the repo folder):

```powershell
powershell -ExecutionPolicy Bypass -File scripts\weekly-publisher\schedule\register-sunday-tasks.ps1
```

## Credentials

Same file as the Executive Producer: `~/.lvinit/executive-producer/.env`
(`ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `LVINIT_NOTIFY_EMAIL`, `LVINIT_NOTIFY_FROM`).
GitHub access uses Mikey's normal git credentials and `gh` login on the PC.

## History

- **2026-09-27:** the Sunday 7 PM Executive Producer run failed with
  `MODULE_NOT_FOUND`. The task ran `weekly.mjs` from Mikey's working folder,
  which was on `main`; the Executive Producer code lived only on the unmerged
  `feat/executive-producer` branch. The failure went to a log file only, and no
  weekly plan layer existed, so Monday morning had no package and no warning.
- **2026-09-28:** Executive Producer merged into `main`; the Weekly Publisher,
  the runner checkout, the outside-the-repo runner script and the Monday watchdog
  added; the missed week (Sep 28 – Oct 4) planned in-session and delivered through
  the same pipeline (`--plan-json`).
