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
`deploy-prod`, `cert-expiry`). **Only CI is ported here.** Deploys
still reference `secrets.SSH_PRIVATE_KEY` and friends and are a separate piece
of work; until they are ported or Actions is restored, dev deploys on push to
`main` and prod deploys on `v*` tags are **not running**.

## Server concurrency: why the agent runs one workflow at a time

The frontend workflow failed with status `error` — not `failure` — on every
run, while the backend passed. `error` means the workflow could not complete,
not that a test failed, and the difference matters: nothing was wrong with the
pipeline definition.

The agent log has the cause:

```
grpc error: extend(): code: Unavailable
  keepalive ping failed to receive ACK within timeout
failed to extend workflow lease
grpc error: update(): code: Unknown
  desc = database is locked
  desc = could not find step with uuid ... : sql: no rows in result set
```

The server stores everything in **SQLite** (`WOODPECKER_DATABASE_DRIVER:
sqlite3`), which serialises writes. With `WOODPECKER_MAX_WORKFLOWS: "4"` the
backend and frontend workflows ran concurrently, contended on that single
writer, and the gRPC keepalive timed out. The agent then lost its lease
mid-run and the workflow was abandoned.

The frontend lost every time because it is the longer of the two — its `install`
step alone takes ~5 minutes, so it holds a lease across far more contention
than the backend's single `tests` step.

**Fixed by setting `WOODPECKER_MAX_WORKFLOWS: "1"`** in
`~/woodpecker/docker-compose.yml` on storytime. Backend and frontend now run
sequentially. That costs wall-clock, but it is also the right call for this
box independently: storytime runs LevelUp, its API, KYS, storytime and
fetchit on 3.8 GB of RAM with ~1.1 GB free and 2.8 GB of swap already in use.

**The durable fix is Postgres**, not lower concurrency — SQLite is the actual
constraint and it will bite again the moment a third pipeline is added. Raising
`MAX_WORKFLOWS` before migrating the server database will reproduce this
exactly.

## Clone: LFS and submodules are explicitly off

The default clone runs `git submodule update --init --recursive` and
`git lfs fetch`. This repo has **neither** — no `.gitmodules`, no
`.gitattributes`, nothing tracked by LFS — yet those two commands accounted for
~158s of a ~160s clone step, on every workflow.

Both pipelines therefore declare the clone explicitly with `lfs: false` and
`recursive: false`. `partial: true` preserves the `tree:0` filter the implicit
clone already used. If submodules or LFS are ever introduced, these have to be
turned back on or the checkout will be silently incomplete.

## Deploy (dev)

`.woodpecker/deploy-dev.yml` ports `deploy-backend.yml` + `deploy-frontend.yml`.
It runs on push to `main` and `depends_on: [backend, frontend]`, so it deploys
only what passed CI and skips entirely if either fails.

> `depends_on` is what sequences this, **not** `WOODPECKER_MAX_WORKFLOWS=1`.
> That setting caps concurrency; it does not order workflows.

### Secrets to add (repo settings in the Woodpecker UI)

| secret | value |
|---|---|
| `ssh_private_key` | the storytime deploy key (`~/.ssh/storytime_rsa`) |
| `server_host` | `52.18.195.224` |
| `server_user` | `ubuntu` |
| `expo_public_privy_app_id` | same value as the GitHub secret |
| `expo_public_privy_web_client_id` | same |
| `expo_public_privy_native_client_id` | same |

The three `EXPO_PUBLIC_*` values are compiled into the shipped web bundle and
are public by design. `ssh_private_key` is not — add it yourself; nothing in
this repo should ever read or print it.

No `ENV_FILE` secret is needed for dev: the server's `.env` already exists and
the deploy never overwrites it.

### The web build has a memory preflight, and it can refuse to run

`expo export --platform web` wants ~1.5–2 GB. The agent runs on storytime,
which also serves levelup.com.ng, its API, KYS, storytime and fetchit on
3.8 GB. **An OOM here does not merely fail the build — the kernel picks a
victim, and that can be a live service.**

So `build-web` reads the host's real `MemAvailable` from `/proc/meminfo` and
**aborts with a clear message below 1800 MB** rather than starting a build that
could take something down. `NODE_OPTIONS=--max-old-space-size=1536` then caps
V8 below what the host can supply, so V8 fails its own allocation instead of
the kernel choosing for it.

If that preflight starts failing routinely, the answer is a build host with
headroom — not raising the threshold.

### Not ported

Prod (`v*` tags) stays on GitHub Actions. It needs the `production` approval
gate and an `ENV_FILE` secret that does not exist in either system yet, so
porting it would produce a deploy that fails at the first tag.

`codeql` has been **deleted**: CodeQL requires GitHub Advanced Security, which
is not available on a private repo on this plan, so every run failed with
`Advanced Security must be enabled for this repository to use code scanning`.
Three permanently-red checks on every PR train people to ignore red checks.
`.woodpecker/security.yml` (Semgrep OSS) is the replacement.

`cert-expiry` is Actions-only but no longer runs on a schedule — it was
demoted to `workflow_dispatch` and the daily check now runs from cron on
storytime. See `docs/CERT_EXPIRY_CRON.md`.

### Web is NOT deployed from here — it builds on EAS

`expo export --platform web` wants ~1.5–2 GB. The agent runs on storytime,
which also serves levelup.com.ng, its API, KYS, storytime and fetchit on
3.8 GB. An OOM there does not merely fail a build — the kernel picks a victim,
and that can be a live service. Paying that on every push to `main` is the
wrong trade, so the web build moved off the box entirely:

- `.eas/workflows/deploy-web.yml` — push to `main` → `type: deploy`, `prod: true`
- `.eas/workflows/preview-web.yml` — per-PR preview URL, `prod: false`

Both run on **EAS runners**. Worth knowing why this is a `type: deploy` job and
not `eas deploy` in a shell step: **`eas deploy` only uploads** — the export
still runs wherever you invoke the CLI, so it would not have moved the build at
all. Only the EAS job type does that.

The PR previews also replace the Netlify deploy previews being decommissioned.

#### One-time setup this needs

1. **EAS environment variables** (`eas env:create --environment production`):
   `EXPO_PUBLIC_API_URL=https://api.dev.levelup.com.ng`, plus
   `EXPO_PUBLIC_PRIVY_APP_ID`, `EXPO_PUBLIC_PRIVY_WEB_CLIENT_ID`,
   `EXPO_PUBLIC_PRIVY_NATIVE_CLIENT_ID`. These are compiled into the shipped
   bundle and are public by design — but they must **exist**, or the build
   silently ships an app that cannot reach the API or authenticate.
2. **DNS cutover:** `dev.levelup.com.ng` becomes a CNAME to the EAS Hosting
   domain instead of an A record to `52.18.195.224`. Add it as a custom domain
   in EAS Hosting first, then switch DNS.
   **`api.dev.levelup.com.ng` does not move** — nginx keeps serving the API.
3. `eas.json` `cli.version` was `>= 10.0.0`, which predates EAS Workflows.
   Raised to `>= 16.0.0`.

Until the DNS cutover, `~/levelup-frontend/` on storytime keeps serving the
last manually-built bundle. Nothing breaks by merging this; the EAS deploy just
publishes to a URL nobody is pointed at yet.
