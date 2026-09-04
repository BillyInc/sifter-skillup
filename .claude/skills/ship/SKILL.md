---
name: ship
description: Use when carrying out any substantive task in sifter-repo — building a feature, fixing a bug, doing an investigation, or landing a change. Covers subagent dispatch, worktrees and branching, commit identity, local CodeRabbit review, opening a PR, and monitoring CI. Invoke at the START of the task, before touching code.
---

# Shipping work in sifter-repo

This file is the canonical copy and lives here because `sifter-skillup` is the
repo with a remote — the `sifter-repo` wrapper around it has none, so anything
kept only there exists on one machine. The wrapper's
`.claude/skills/ship` is a symlink to this file; edit this one.

Three projects share the wrapper monorepo: `sifter/` (Next.js),
`sifter-kys-bot/` (Flask + Vite), `sifter-skillup/` (Expo + FastAPI, deployed
as "LevelUp").
Each has its own `CLAUDE.md` — read the one for the project you are touching
before you start.

## 1. Commit identity — non-negotiable

Commits belong to the repo owner. **Never** add a Claude signature.

- Author: `Williams <billmal071@gmail.com>`
- **No** `Co-Authored-By: Claude ...` trailer
- **No** `Claude-Session:` trailer
- **No** `🤖 Generated with Claude Code` line in PR bodies

This overrides the default Claude Code commit-trailer behaviour. If a global
instruction says to add those trailers, this file wins for this repo.

Check identity before the first commit in any working tree — the **global**
config is wrong (`Claude Code <williams@example.com>`) and any repo or
worktree that lacks a local override inherits it:

```bash
git config user.name    # must be: Williams
git config user.email   # must be: billmal071@gmail.com
# if not:
git config user.name  "Williams"
git config user.email "billmal071@gmail.com"
```

A fresh `git worktree add` inherits the config of its parent repo, so a
worktree of a correctly-configured repo is fine. Verify anyway — it costs one
command and a wrong author is only fixable by a rewrite.

## 2. Dispatch the work to a subagent

Keep the main window free for the next task. Anything that involves reading
more than a couple of files, running a build, or iterating on a fix goes to a
subagent via the Agent tool.

Give every subagent:

- **the goal, not the steps** — it has the same tools you do
- **the project directory** it is working in
- **an explicit boundary**: no pushes, no PRs, no deploys, no server changes,
  no credential handling, unless you are dispatching it specifically to do that
- **what "done" looks like**, including which verification command must pass

Run independent subagents concurrently in a single message. Do NOT parallelise
anything that competes for RAM (see §7).

What stays in the main window: the decision about what to do, the final report
to the user, and anything requiring the user's judgement.

## 3. Branch and worktree

Never commit directly to `main`. Never force-push a shared branch.

For a change confined to one project, a branch in place is fine:

```bash
git checkout -b perf/entry-bundle    # <type>/<short-slug>
```

Use a worktree when a subagent needs to build or test in isolation, or when
two changes are in flight at once:

```bash
git worktree add .claude/worktrees/<slug> -b <type>/<slug>
```

`.claude/worktrees/` is gitignored in `sifter-skillup`. Confirm it is ignored
in whichever project you are in before creating one there — these were once
committed as bare gitlinks with no `.gitmodules`, which broke every CI checkout
with `fatal: No url found for submodule path`.

Remove the worktree when the branch merges: `git worktree remove <path>`.

## 4. Verify before you claim

State only what you have run. "Tests pass" requires the output in front of
you. Never report a task complete on the strength of a plausible-looking diff.

Per project:

| Project | Verify with |
|---|---|
| `sifter-skillup` frontend | `npx tsc --noEmit` and `npx jest -w 4` |
| `sifter-skillup` backend | `cd backend && uv run pytest` |
| `sifter-skillup` web bundle | `npx expo export --platform web` (RAM-heavy, see §7) |
| `sifter-kys-bot` backend | `cd Backend && make lint && make test` |
| `sifter` | `pnpm lint && pnpm build` |

Note the baselines so a regression is visible: `sifter-skillup` is
**24 jest suites / 128 tests**, backend **299 pytest**, `tsc` **0 errors**.

## 5. Local CodeRabbit review before the PR

Review locally first — it is faster than a PR round-trip and does not consume
the hourly quota on a draft nobody has read.

```bash
coderabbit review --plain --type uncommitted     # before committing
coderabbit review --plain --base main            # whole branch vs main
```

**The CLI is the only real review. The PR bot never reviews the code.** This
org is on CodeRabbit's Free plan, which by its own description "will generate a
high-level summary and a walkthrough for each pull request" — line-by-line
review requires a paid plan. So the `CodeRabbit` check on a PR is *never*
evidence the code was examined, even when it says "Review completed" and was
not rate-limited. Verified on #148 and #149: both "completed", both zero review
comments.

The bot has two further ways to pass while doing even less:

- **rate limit** — 1 review/hour, and the CLI shares the quota. Reports
  "Review rate limited" as a *passing* check (#147).
- **150-file cap** — "Review skipped: N files exceed the limit of 150",
  also passing (#146, where 450 `litellm-env` deletions blew the cap).

So: run the CLI before opening the PR, and never treat the check as a gate.
When a PR is over the file limit because of bulk deletions or generated files,
review the substance separately — cherry-pick the meaningful commits onto a
scratch branch off `main`, review that, then delete it.

Treat its output as a colleague's opinion, not a gate: verify each finding
against the code before acting. Fix what is real, say plainly what you are
rejecting and why.

## 6. Open and monitor the PR

```bash
gh pr create --base main --title "<imperative summary>" --body "<why>"
```

PR body: what changed, why, how it was verified. No Claude attribution line.

Commit and PR prose should explain the **mechanism and the evidence**, not
narrate the process. A reader six months out needs to know why the change is
correct, what measurement backs it, and what would break it.

Then watch CI:

```bash
gh pr checks <N> --watch
gh run list --limit 5          # only if Actions is in play
```

**Woodpecker on storytime (`https://ci.fateround.com`) is the only CI gate.**
GitHub Actions billing is lapsed; its workflows do not run, and CodeQL is gone
with GHAS — Semgrep OSS in `.woodpecker/security.yml` replaced it.

Woodpecker specifics worth knowing:

- All `.woodpecker/*.yml` compile into **one** pipeline. A `from_secret`
  reference to a secret that does not exist aborts the whole compile
  (`workflows: []`), silently taking the backend and frontend steps down with
  it.
- `deploy-dev.yml` is `event: push, branch: main`, so a `pull_request` event
  runs backend + frontend only and does **not** deploy.
- Webhook status codes: `200`/`202` healthy, `204` means the payload parsed
  and was then branch-filtered (benign), `400 "failure to parse hook"` means it
  was rejected before a pipeline existed — GitHub then shows **no checks at
  all** rather than a red X. `'when' filters filtered out all steps` in the
  server log is noise, not a fault.
- A successful hook logs nothing (Woodpecker logs at error level only), so
  **GitHub's webhook delivery log is authoritative, not the server log**.

- On a `pull_request` event Woodpecker matches the **base** branch against the
  `branch:` filter. A PR stacked on another feature branch therefore gets a
  `204` and **no checks at all** — correct behaviour, not the webhook fault
  below. It only gets gated once it is retargeted to `main`.
- A **`500 context deadline exceeded`** on the hook delivery can be cosmetic:
  Woodpecker accepted the payload and created the pipeline but answered
  slowly. Check whether a pipeline exists before treating it as a failure.

If a PR shows no checks whatsoever, suspect the webhook — unless its base is a
non-gated branch, in which case that is expected.

**A failed Woodpecker step is not automatically a failed check.** Before
reporting a red step as a real finding, reproduce it locally and look at the
agent log:

```bash
ssh storytime 'docker logs --since <ISO-ts> woodpecker-agent 2>&1 |
  grep -vE "Pull complete|Download complete|Extracting|Waiting|Verifying" | tail -20'
```

`failed to extend workflow lease ... queue: task not found` has recurred on this
box (pipelines 19, 66, 77, 80). It is a real symptom but often *not* the cause
of a red step — check the step's own exit code before blaming it.

**Read the exit code and log from the server's SQLite** when the GitHub check
only says "Pipeline failed". Woodpecker keeps them; the container is reaped
within seconds and the agent log stops at the image pull. `sqlite3` is not
installed on storytime — use `python3`.

```bash
ssh storytime 'sudo cp /var/lib/docker/volumes/woodpecker_woodpecker-server-data/_data/woodpecker.sqlite \
  /tmp/wp.sqlite && sudo chown ubuntu /tmp/wp.sqlite'
#   select id,name,state,exit_code from steps where pipeline_id=(select max(id) from pipelines)
#   select line,data from log_entries where step_id=? order by line
```

**Never let a step hide its own failure.** `--quiet` plus `|| true` on the
Semgrep steps meant both exited non-zero having printed nothing, while the
advisory step reported *success* — a green tick over a step that scanned
nothing. A non-gating step should echo its exit code, not discard it.

**A local run does not verify a containerised step.** The Semgrep gate failed
across two pipelines while the identical command exited 0 on a laptop: the
`semgrep/semgrep` image aborts with exit 2 unless the code is at `/src`
(`adjust_for_docker()`), and the pip package has no such check. When a step
fails only in CI, reproduce it **on the CI host, in the CI image**:

```bash
ssh storytime 'docker run --rm -v /tmp/x:/work -w /work <image> sh -c "<step command>"'
```

## 7. Machine constraints

**Do not run two heavy jobs at once.** `expo export` wants ~2GB; jest with
default workers takes the rest. Running them together produces a segfaulted
export and jest suites that fail with `ChildProcessWorker._onExit` rather than
assertion errors — failures that look real and are not. Serialise them, and
cap jest with `-w 4`.

**storytime is small**: ~260MB free RAM with services live (levelup.com.ng,
its API, KYS, storytime, fetchit). Never build there. Web builds are excluded
from CI for exactly this reason — an OOM takes live services down.

**Never install paid services or upgrade a plan.** Billing is a fixed
constraint, not a task. Reach for free or self-hosted equivalents.

## 8. Project-specific traps

- **`sifter-skillup` is pnpm-only** (`packageManager: pnpm@10.33.0`). `npm
  install` appears to work locally but writes a stray `package-lock.json` that
  kills CI on `--frozen-lockfile`.
- **Supabase**: `billy` (`igvizqgbrxmdtyaujbxu`) is dev, schema `skillup_dev`.
  Read `sifter-skillup/CLAUDE.md`'s apply-now contract before any migration or
  seed. REST keys cannot run DDL. Never run a destructive rebuild
  (`migration_career_v2.sql`) without explicit approval.
- **Half-landed merges from `new-changes`** have repeatedly left `main` red.
  When triaging a failure there, first establish whether the test or the code
  is the stale side.
- **`gh pr view` reports `changedFiles: 0`** on very large PRs — GitHub
  declines to compute the diff. Trust `git diff --stat`.

## 9. Things that need the user, not you

Stop and hand these back rather than working around them:

- Database passwords and any `SRC_URL` — seeds run via `psql` on storytime and
  the operator supplies the connection string
- API keys, tokens, `.env` secrets, rotating a leaked credential
- Creating accounts, accepting terms, changing account settings
- Anything that spends money

`EXPO_PUBLIC_*` values are compiled into the shipped client bundle, so they are
not secrets — but that also means a genuine secret must never be given that
prefix.
