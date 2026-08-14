# LevelUp — Self-Hosted Deployment (storytime)

LevelUp (this app) is self-hosted on the **storytime** box (`52.18.195.224`, user `ubuntu`),
mirroring the KYS deploy pattern. No Render / Netlify / Fly.

- **Backend:** FastAPI via `uvicorn` under systemd. Celery worker + beat as separate units.
- **Web:** `expo export --platform web` → static `dist/`, served by nginx (SPA fallback).
- **Deploy:** GitHub Actions → SSH/rsync → systemd. **Dev on push to `main`; prod on git tag `v*`.**
- **TLS:** nginx + certbot, auto-provisioned idempotently on first deploy (needs DNS first).

## Domains (levelup.com.ng — LevelUp is the flagship at the root; KYS prepends `kys.`)

| Env | Web | API | uvicorn port |
|-----|-----|-----|--------------|
| dev | `dev.levelup.com.ng` | `api.dev.levelup.com.ng` | `:8000` |
| prod | `levelup.com.ng` | `api.levelup.com.ng` | `:8001` |

## Redis DB indices (shared 6379; `0–9` reserved for storytime)

| App | dev | prod |
|-----|-----|------|
| storytime | 0–9 | 0–9 |
| KYS | 10 | 11 |
| **LevelUp** | **12** | **13** |

`REDIS_URL`, `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND` in each env's `.env` must use the
right index (dev → `redis://localhost:6379/12`, prod → `…/13`). **Critical:** dev and prod both
run celery-beat — a shared broker index would double-fire every scheduled task.

## Server directory layout (user `ubuntu`)

| Path | Contents |
|------|----------|
| `~/levelup-backend` | dev backend + `.env` + `.venv` + `logs/` + `systemd/*.service` |
| `~/levelup-backend-prod` | prod backend (same shape; units derived with `-prod` suffix + port 8001) |
| `~/levelup-frontend` | dev web `dist/` (nginx root) |
| `~/levelup-frontend-prod` | prod web `dist/` |

systemd units: `levelup-backend`, `levelup-celery-worker`, `levelup-celery-beat` (+ `-prod` variants).
nginx sites: `levelup-api-dev`, `levelup-web-dev`, `levelup-api-prod`, `levelup-web-prod`.

---

## What you must provision (one-time)

### 1. DNS — A records → `52.18.195.224` (needed before first deploy, so certbot can validate)
`dev.levelup.com.ng`, `api.dev.levelup.com.ng`, `levelup.com.ng`, `api.levelup.com.ng`

### 2. GitHub Environments (this repo → Settings → Environments)
Create **`development`** and **`production`** (add a required reviewer on production).

### 3. Secrets (per environment)
| Secret | Notes |
|--------|-------|
| `SSH_PRIVATE_KEY` | the storytime deploy key (`~/.ssh/storytime_rsa`) |
| `SERVER_HOST` | `52.18.195.224` |
| `SERVER_USER` | `ubuntu` |
| `ENV_FILE` | **entire backend `.env`** (see below) — written to the server once on first deploy, never overwritten |
| `EXPO_PUBLIC_PRIVY_APP_ID` | web build-time |
| `EXPO_PUBLIC_PRIVY_CLIENT_ID` | web build-time |
| `EXPO_PUBLIC_PRIVY_WEB_CLIENT_ID` | web build-time |
| `EXPO_PUBLIC_PRIVY_NATIVE_CLIENT_ID` | web build-time |

### 4. Variables (per environment)
| Var | dev | prod |
|-----|-----|------|
| `EXPO_PUBLIC_API_URL` | `https://api.dev.levelup.com.ng` | `https://api.levelup.com.ng` |

### 5. `ENV_FILE` contents (backend `.env`, per env)
Required keys (full list in `backend/config.py`):
```
SUPABASE_URL=...            SUPABASE_ANON_KEY=...      SUPABASE_SERVICE_KEY=...
JWT_SECRET=...              SINGLE_DEVICE_ENFORCEMENT=true   DEBUG=false
REDIS_URL=redis://localhost:6379/12          # prod: /13
CELERY_BROKER_URL=redis://localhost:6379/12  # prod: /13
CELERY_RESULT_BACKEND=redis://localhost:6379/12  # prod: /13
PRIVY_APP_ID=...  PRIVY_APP_SECRET=...  PRIVY_VERIFICATION_KEY=...
RESEND_API_KEY=re_...       # signup verification email; without it signup 502s
EMAIL_FROM=LevelUp <onboarding@resend.dev>    # see "Resend sender" below
ALLOWED_ORIGINS=https://dev.levelup.com.ng   # prod: https://levelup.com.ng
API_BASE_URL=https://api.dev.levelup.com.ng  # prod: https://api.levelup.com.ng
WEB_DASHBOARD_URL=https://dev.levelup.com.ng # prod: https://levelup.com.ng
```

Optional integrations as needed: `ANTHROPIC_API_KEY`, `FCM_SERVER_KEY`, `AIRTABLE_*`,
`GITHUB_CLIENT_ID/SECRET`, `TELEGRAM_BOT_TOKEN`, OAuth `*_CLIENT_ID/SECRET`.

### Resend sender

No custom domain is verified in Resend yet. Until one is, the account can only
send from the shared `onboarding@resend.dev` sender, and **only to the Resend
account owner's own address** -- mail to any other recipient is rejected. That
is fine for development, but real users cannot receive a signup code.

To send to real users, add `levelup.com.ng` under Resend > Domains, publish the
DKIM/SPF records it generates, and once it shows Verified switch `EMAIL_FROM`
to `LevelUp <noreply@levelup.com.ng>`.

`EMAIL_FROM` is not a secret and is set directly in each `.env`.
`RESEND_API_KEY` is; it is never committed.

### 6. Server prerequisites (already true for KYS, verify)
`ubuntu` has passwordless `sudo` (systemctl/nginx/certbot); `nginx`, `certbot` (+`python3-certbot-nginx`),
`redis-server`, and `uv` installed; Redis running on `:6379`.

---

## Release flow
- **Dev:** `git push origin main` → `deploy-backend.yml` + `deploy-frontend.yml`.
- **Prod:** `git tag v1.0.0 && git push origin v1.0.0` → `deploy-prod.yml` (production approval gate).

---

## Deploy safety model (how the workflows avoid stepping on KYS)

- **Concurrency.** Both dev workflows share one fixed group `levelup-deploy-dev-storytime`
  (not ref-scoped) with `cancel-in-progress: false`, so rsync + `systemctl restart` can
  never overlap and a cancelled run can't leave a half-copied tree. Prod uses its own
  fixed group so a release isn't queued behind a dev push.
- **nginx/certbot lock.** Every nginx step takes `flock` on `/tmp/levelup-nginx-deploy.lock`
  before touching config — prod runs its backend and frontend jobs in parallel, and
  `nginx -t` / `systemctl reload nginx` / `certbot` are global to the box (shared with KYS).
- **nginx rollback.** If `nginx -t` fails after our site is symlinked, the symlink is removed
  and the step fails — otherwise a bad LevelUp config would break the *next* nginx reload
  performed by a KYS deploy.
- **Port guard.** Before first start, the deploy aborts if `:8000` (dev) / `:8001` (prod) is
  already bound by something that isn't our unit.
- **Loopback binding.** uvicorn binds `127.0.0.1`, not `0.0.0.0` — the API is only reachable
  through nginx/TLS, so no firewall rule is required to keep `:8000`/`:8001` off the internet.
- **Host key.** The runner pins the host key with `ssh-keyscan` into a fresh `known_hosts`
  and then uses `StrictHostKeyChecking=yes`. This is trust-on-first-use *per run*; the
  stronger option is a committed/pinned host key, which would need a new secret — see
  "Human decisions" below.
- **Secrets on the runner.** The private key and the `ENV_FILE` temp copy are written under
  `umask 077`, mode `0600`, into `$RUNNER_TEMP`, deleted via `trap ... EXIT`, and the key is
  removed again in a `if: always()` cleanup step so a failed deploy doesn't leave it behind.
  `.env` is `chmod 600` immediately after upload, and is never echoed.
- **`.env` never overwritten.** Seeded only when absent; deploy aborts if the `ENV_FILE`
  secret is empty rather than writing an empty `.env` and restarting into a broken app.
- **No automatic rollback.** A failed `uv sync` aborts before any restart (`set -euo pipefail`),
  so the running service keeps serving. But if the *new* code starts and fails its health
  check, the deploy fails **red with the service down** — recovery is manual: re-run the
  previous green commit/tag, or `git checkout` the old ref and re-deploy. Adding a
  release-directory + symlink swap would fix this properly and is out of scope here.
- **Prod/dev Redis split.** The prod deploy refuses to run if prod's `CELERY_BROKER_URL`
  is identical to dev's, which would make both beats double-fire every scheduled task.

## Human decisions still open

1. **Host key pinning.** Add a `SSH_HOST_KEY` secret (output of `ssh-keyscan -H 52.18.195.224`)
   and write it to `known_hosts` instead of scanning at deploy time. Deliberately not done
   here — it introduces a new secret.
2. **Firewall.** With loopback binding, `ufw` is not required for `:8000`/`:8001`. If you
   want defence in depth anyway, enable `ufw` allowing only 22/80/443 — do this by hand,
   since a wrong rule locks out both LevelUp and KYS.
3. **systemd syscall filtering.** The units stop short of `SystemCallFilter=@system-service`;
   it's usually fine for Python but can break native extensions, so it should be enabled and
   verified on the box rather than blind-shipped.
4. **KYS Redis migration** (below) is still a manual, separately-scheduled step.

## Migrating KYS off Redis 0/1 → 10/11 (separate step — touches live KYS)
In `BillyInc/sifter-kys-bot`: update `REDIS_URL` (and any `CELERY_*`) in the dev `ENV_FILE` secret
`…/0 → …/10` and prod `…/1 → …/11`; update `~/sifter-backend/.env` and `~/sifter-backend-prod/.env`
on the server; `sudo systemctl restart` the KYS backend + celery units. (Redis DB is a broker/cache —
in-flight queued jobs in the old index are dropped on switch, which is fine.)

## Decommissioning

**Done in this PR:** `render.yaml`, `netlify.toml`, `fly.toml` and
`.github/workflows/deploy-web.yml` are removed here, so the old Netlify/Render
path can no longer deploy from `main` and PR builds stop failing against it.

**Still manual, and ordering matters** — do these only after LevelUp is verified
live on storytime, since merging this PR removes the previous deploy path:
- Disconnect the two Netlify sites (`sifter-skillup`, and the stray `skiliup`) in
  the Netlify dashboard. Until this is done Netlify keeps building every PR from
  the repo connection alone — deleting `netlify.toml` does not stop it.
- Delete the Render service.
