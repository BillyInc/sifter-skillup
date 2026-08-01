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
ALLOWED_ORIGINS=https://dev.levelup.com.ng   # prod: https://levelup.com.ng
API_BASE_URL=https://api.dev.levelup.com.ng  # prod: https://api.levelup.com.ng
WEB_DASHBOARD_URL=https://dev.levelup.com.ng # prod: https://levelup.com.ng
```
Optional integrations as needed: `ANTHROPIC_API_KEY`, `FCM_SERVER_KEY`, `AIRTABLE_*`,
`GITHUB_CLIENT_ID/SECRET`, `TELEGRAM_BOT_TOKEN`, OAuth `*_CLIENT_ID/SECRET`.

### 6. Server prerequisites (already true for KYS, verify)
`ubuntu` has passwordless `sudo` (systemctl/nginx/certbot); `nginx`, `certbot` (+`python3-certbot-nginx`),
`redis-server`, and `uv` installed; Redis running on `:6379`.

---

## Release flow
- **Dev:** `git push origin main` → `deploy-backend.yml` + `deploy-frontend.yml`.
- **Prod:** `git tag v1.0.0 && git push origin v1.0.0` → `deploy-prod.yml` (production approval gate).

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
