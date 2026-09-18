# lvinit-agent-state

Shared, persistent storage for LVINIT's automation agents: reports, watchlists,
source records, analytics snapshots and content-planning state.

**This is not the website.** It is an orphan branch with no history in common
with `main`. It is never merged, never deployed, and never read by the site.

> This README and `vercel.json` are copied here from `.github/agent-state/` on
> `main` on every agent commit. Edit them on `main`, not here.

## Rules for every agent

1. **One namespace per agent.** An agent writes only under its own
   directories, and only the paths it declares to the shared commit action
   (`.github/actions/agent-state`). The action refuses to commit anything else.
2. **Reports go in `reports/<namespace>/`, machine state in `data/<namespace>/`.**
3. **Every JSON file carries `schema_version` and `agent`.** Bump
   `schema_version` when a field changes meaning, and keep reading the old one.
4. **Readers are tolerant.** A missing file means "no history yet", not an
   error. Unknown fields are ignored. An agent may read another agent's
   namespace, and may never write to it.
5. **Nothing secret, nothing private.** The repository is public, so this branch
   is public too. No credentials, no lead or client data, no personal
   information, nothing that is not already public or safe to publish.
6. **Never deployed.** `vercel.json` sets `git.deploymentEnabled: false`, so a
   push here never builds on Vercel. Do not remove it.
7. **Only automation writes here.** Human edits are fine for the documented
   hand-maintained fields (such as `content_created` in the trend watchlist).
   Make them in a single commit and the next agent run picks them up.

## Namespaces

| Agent | Workflow | Writes | Notes |
|---|---|---|---|
| Local Trend Agent | `.github/workflows/local-trend-agent.yml` | `reports/social-trends/`, `data/social-trends/` | Daily 6:30 AM Pacific; weekly on Monday. See `docs/LOCAL_TREND_AGENT.md` on `main`. |
| Executive Producer | local `npm run producer:catalog:push` (footage catalog); Monday workflow in a later phase | `reports/executive-producer/`, `data/executive-producer/` | Sanitized metadata only; private rules stay on Mikey's PC. See `docs/EXECUTIVE_PRODUCER.md` on `main`. |

When you add an agent, add a row here (on `main`) and give the agent its own
namespace.

## Reading this branch from another agent or workflow

```bash
git fetch origin lvinit-agent-state --depth=1
git show origin/lvinit-agent-state:data/social-trends/watchlist.json
```

Or use the shared action's `checkout` mode, which clones this branch into
`.agent-state/` without leaving credentials on disk.
