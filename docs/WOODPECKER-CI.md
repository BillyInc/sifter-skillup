# Woodpecker CI

GitHub Actions is unavailable on this account — every job now fails in seconds
with *"The job was not started because recent account payments have failed or
your spending limit needs to be increased."* This is the replacement.

The pipelines live in [`.woodpecker/`](../.woodpecker/) and mirror
`.github/workflows/ci.yml` step for step. The GitHub workflows are left in
place: they cost nothing while disabled, and they are the reference if Actions
is ever restored.

## What maps to what

| GitHub Actions | Woodpecker |
|---|---|
| one `jobs:` entry | one file under `.woodpecker/` (workflows run in parallel) |
| `runs-on: ubuntu-latest` + setup actions | an `image:` per step |
| `defaults.run.working-directory` | `directory:` |
| `env:` | `environment:` |
| `on: [push, pull_request]` + branches | top-level `when:` |
| `actions/upload-artifact` | **no equivalent** — see below |

Steps in a workflow are separate containers sharing one workspace volume, so
`node_modules` written by the `install` step is still present for the steps
after it. That is why there is no per-step reinstall.

### The artifact gap

`ci.yml` uploaded `dist/` with 7-day retention. Woodpecker has no built-in
equivalent, so the `web-build` step still runs — it catches bundler failures
that `tsc` and `jest` do not — but the output is discarded. If that retention
was actually being used for something, wire an S3-compatible artifact plugin
into that step. Nothing currently consumes it.

## Verified locally

The pipelines were not just linted, they were executed with the real
Woodpecker CLI (`woodpeckerci/woodpecker-cli:v3`):

```
# lint
docker run --rm -v "$PWD:$PWD" -w "$PWD" \
  woodpeckerci/woodpecker-cli:v3 lint

# actually run a workflow
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$PWD:$PWD" -w "$PWD" \
  woodpeckerci/woodpecker-cli:v3 exec --backend-engine docker \
  --pipeline-event push --commit-branch main .woodpecker/backend.yml
```

`backend.yml` runs green end to end: **256 passed**. Mount the workspace at the
*same path* it has on the host — the CLI passes paths to the host docker
daemon, so a mismatched mount point silently produces an empty workspace.

> **Do not run `exec` against your own checkout.** The containers run as root
> and will leave root-owned files behind in `node_modules/`, `backend/.venv`
> and `dist/`, which breaks local development until you chown them back. Use a
> throwaway `git clone`, not a `git worktree` — a worktree's `.git` is a file
> pointing outside the mount, and git inside the container cannot follow it.

## Server setup — decisions still needed

Woodpecker needs a **server** (web UI + API, receives GitHub webhooks) and at
least one **agent** (runs the pipeline containers). Both would sit on
`storytime` (`52.18.195.224`) alongside the existing services.

Three things are deliberately left blank here, because guessing them would be
wrong:

1. **A port.** Ports on that box are assigned, not chosen ad hoc — see
   [`DEPLOY-SETUP.md`](../DEPLOY-SETUP.md), where `:8000` is LevelUp dev API
   and `:8001` is prod. Woodpecker's server needs its own, plus `:9000` for
   the gRPC agent connection. Assign them in `DEPLOY-SETUP.md` first so the
   registry stays the single source of truth.

2. **A hostname**, e.g. `ci.levelup.com.ng`, with DNS pointed at the box before
   certbot can issue a certificate — same ordering constraint as the existing
   nginx sites.

3. **Credentials**, which must be created and installed by a human:
   - a **GitHub OAuth app** (Settings → Developer settings → OAuth Apps) with
     callback `https://<host>/authorize`, giving a client ID and secret;
   - `WOODPECKER_AGENT_SECRET`, a shared secret between server and agent —
     generate with `openssl rand -hex 32`.

   These are secrets. Put them in an `.env` readable only by the service user;
   do not commit them, and do not paste them into a chat or a PR.

### Agent and the Docker socket

The agent needs a container runtime. The obvious configuration mounts
`/var/run/docker.sock` into the agent — **be aware this is root-equivalent on
the host.** Anything that can reach that socket can start a container that
bind-mounts `/` and runs as UID 0, which is a full escalation path from "can
run a pipeline" to "owns the box". Since pipelines execute code from pull
requests, that is a real exposure, not a theoretical one.

Prefer one of:

- **rootless Docker** for the agent's runtime, so a container escape lands as
  an unprivileged user rather than root;
- a **dedicated CI host** that is not also running production services — this
  box currently serves `levelup.com.ng`, its API, and KYS;
- Woodpecker's `local` backend, which avoids the socket but gives up the
  isolation containers provide (worse, generally — noted only for completeness).

At minimum, restrict which repositories may run pipelines
(`WOODPECKER_REPO_OWNERS` / admin allowlist) so an unrelated fork cannot
schedule work on the agent.

## Trigger parity

The GitHub workflows also cover deploys (`deploy-backend`, `deploy-frontend`,
`deploy-prod`, `codeql`, `cert-expiry`). **Only CI is ported here.** Deploys
still reference `secrets.SSH_PRIVATE_KEY` and friends and are a separate piece
of work; until they are ported or Actions is restored, dev deploys on push to
`main` and prod deploys on `v*` tags are **not running**.
