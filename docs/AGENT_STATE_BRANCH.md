# The `lvinit-agent-state` branch

Shared, persistent storage for every LVINIT automation agent: trend reports,
watchlists, source records, and in future analytics snapshots, content planning
and anything else an agent needs to remember between runs.

## What it is

- An **orphan branch**. It shares no history with `main`, holds no site code,
  and is **never merged**.
- **Never deployed.** Every commit carries a `vercel.json` with
  `git.deploymentEnabled: false`, copied from `.github/agent-state/vercel.json`
  on `main`, so a push here produces no Vercel build. Production deploys only
  from `main` in any case.
- **Public.** The repository is public, so this branch is too. It must never
  hold credentials, lead or client data, or anything that isn't safe to publish.

## Layout

```
README.md                      rules for agents (mirrored from .github/agent-state/)
vercel.json                    deploymentEnabled: false (mirrored)
reports/<namespace>/           human-readable output
data/<namespace>/              machine state (JSON, with schema_version + agent)
```

| Agent | Namespace paths |
|---|---|
| Local Trend Agent | `reports/social-trends/`, `data/social-trends/` |

## How agents use it

Always through the shared composite action `.github/actions/agent-state`:

```yaml
permissions:
  contents: write            # needed to push the state branch

steps:
  - uses: actions/checkout@v4
    with: { persist-credentials: false }

  - uses: ./.github/actions/agent-state        # clone into .agent-state/
    with: { mode: checkout, token: ${{ secrets.GITHUB_TOKEN }} }

  - run: node scripts/<agent>/run.mjs --state-dir=.agent-state   # no token in env

  - uses: ./.github/actions/agent-state        # commit + push
    with:
      mode: commit
      token: ${{ secrets.GITHUB_TOKEN }}
      paths: reports/<namespace> data/<namespace>
      message: "<agent>: <what changed>"
```

The action enforces, in one place for every agent:

- it only ever pushes to `refs/heads/lvinit-agent-state`, and refuses the default branch
- each declared path must be `reports/<name>` or `data/<name>`
- if anything outside the declared paths (plus README/vercel.json) is staged, it refuses to commit
- the checkout leaves no credentials in the clone, so the agent step runs without them
- if another agent pushed first, it rebases and retries. Namespaces never overlap,
  so the rebase cannot conflict.
- if the branch doesn't exist yet, it creates the branch on first use

## Reading it without the action

```bash
git fetch origin lvinit-agent-state --depth=1
git show origin/lvinit-agent-state:data/social-trends/watchlist.json
```

Or browse it on GitHub by switching the branch selector to `lvinit-agent-state`.

## Adding a new agent

1. Pick a namespace name (lowercase, hyphens), for example `analytics`.
2. Write only under `reports/<name>/` and `data/<name>/`. Put `schema_version`
   and `agent` in every JSON file.
3. Use the action as shown above, declaring exactly those paths.
4. Add a row to the namespace table in `.github/agent-state/README.md` and in
   this doc.
5. Treat a missing file as "no history yet". Ignore fields you don't know.
   Read other namespaces freely, and never write to them.

## If Vercel ever builds this branch

It shouldn't. `vercel.json` on the branch disables deployments for it. If a
preview build ever appears for `lvinit-agent-state`, add an **Ignored Build Step**
in the Vercel project settings (Git → Ignored Build Step) as a second layer:

```bash
if [ "$VERCEL_GIT_COMMIT_REF" = "lvinit-agent-state" ]; then exit 0; else exit 1; fi
```

Exit code 0 tells Vercel to skip the build.
