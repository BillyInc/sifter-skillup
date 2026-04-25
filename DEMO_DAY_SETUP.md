# Sifter SkillUp — Demo Day Setup Guide
## Starkzap Builder Bounty | Integration v2.1

---

## Demo-Day Checklist (run in order)

- [ ] **(a)** Apply Supabase migrations in order (see STEP 2) — **including `supabase/privy_did_migration.sql`**.
- [ ] **(b)** Privy dashboard configured: app ID copied, Starknet extended chain added, OAuth providers (Google / Apple / Twitter) + email OTP enabled.
- [ ] **(c)** Env vars set: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_PRIVY_APP_ID`, backend `PRIVY_APP_ID` + `PRIVY_APP_SECRET` (see STEP 1).
- [ ] **(d)** `pnpm build:web` (or `npx expo export --platform web`) is green.
- [ ] **(e)** Backend boots clean (`uv run uvicorn main:app --reload` — no missing-env errors).
- [ ] **(f)** Fresh-signup test: new email → Privy OTP → Starknet wallet created → routed to Island 18 → Level 291 loads.

---

## STEP 0 — Install

```bash
# Root
npm install          # Installs everything including starkzap-native (already in package.json)

# Backend uses uv
cd backend
uv sync
```

> `starkzap-native` is a **real dependency** in `package.json` — no extra install step. Simulators run live, not mocked.

---

## STEP 1 — Environment Variables

### Frontend `.env` (repo root)

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

### Backend `backend/.env`

```env
# Supabase
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# Privy (backend verifies Privy JWTs via JWKS — no shared secret with frontend)
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_privy_app_secret

# Legacy auth (still used for guest flow + backend-issued session JWTs)
JWT_SECRET=min_32_char_secret

# Starknet RPCs (round-robin pool)
STARKNET_SEPOLIA_RPCS=["https://starknet-sepolia.public.blastapi.io/rpc/v0_7","https://free-rpc.nethermind.io/sepolia-juno/rpc/v0_7"]
STARKNET_MAINNET_RPCS=["https://starknet-mainnet.public.blastapi.io/rpc/v0_7"]

# Optional
ANTHROPIC_API_KEY=       # only for AI Explainer hints; scoring is deterministic
TWITTER_BEARER_TOKEN=    # RSS feeds work without this

# Portfolio OAuth (GitHub only for demo — others fall back to manual-link UI)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
API_BASE_URL=http://localhost:8000   # used to build OAuth callback URL
```

---

## STEP 2 — Database Migrations (Supabase SQL Editor)

Run in this order:

1. `supabase/migration_v2.sql` — core 16 tables
2. `supabase/skillup_new_tables.sql` — Starknet + scoring tables
3. `supabase/guild_tables.sql` — guilds, guild_messages, guild_challenges
4. `supabase/interview_questions_seed_v2.sql` — deterministic question bank
5. `supabase/privy_did_migration.sql` — **NEW** — `users.privy_did` column, unique index, RLS policy

Verify:

```sql
-- Privy DID column present
SELECT column_name FROM information_schema.columns
WHERE table_name='users' AND column_name='privy_did';

-- Question bank populated
SELECT track_id, level, COUNT(*) FROM interview_questions
GROUP BY track_id, level ORDER BY track_id, level;
```

---

## STEP 3 — Privy Dashboard

1. Create a Privy app → copy the **App ID** into both `EXPO_PUBLIC_PRIVY_APP_ID` and backend `PRIVY_APP_ID`.
2. Copy the **App Secret** into backend `PRIVY_APP_SECRET`.
3. Login methods: enable **Email (OTP)**, **Google**, **Apple**, **Twitter**.
4. Embedded wallets → enable **Starknet** as an extended chain (Sepolia for demo).
5. Allowed origins: add your web origin (e.g. `http://localhost:8081`) and your production domain.

The frontend uses `useCreateWallet({ chainType: 'starknet' })` via Privy's extended-chains API. The backend verifies incoming Privy ID tokens against Privy's JWKS — no shared secret on the wire.

---

## STEP 4 — Start Services

```bash
# Backend
cd backend
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Optional: Celery (feed ingest)
uv run celery -A celery_worker worker --beat --loglevel=info

# Frontend (from repo root)
npx expo start                # dev client
npx expo start --web          # web build
npx expo run:ios --device     # iOS
npx expo run:android --device # Android
```

---

## STEP 5 — Pre-Fund Demo Wallet

Before demo, fund the Starknet wallet Privy mints for your demo account:

1. Sign in → copy the wallet address from the AddressPill in the app.
2. ETH → https://starknet-faucet.vercel.app
3. STRK → https://blastapi.io/faucets/starknet-sepolia-strk
4. Verify ETH > 0.001 and STRK > 1.

---

## The Demo Sequence

1. Open app → **Privy sheet** (email OTP or Google / Apple / Twitter).
2. Fresh account → **Starknet embedded wallet created** (extended chain). User routed to **Island 18**.
3. Complete any Island 18 level (Level 291 recommended).
4. Simulator calls **starkzap-native** → real Sepolia tx hash → Voyager link opens.
5. Complete **Level 310 boss** → **three track cards appear** (Navigator / Ecosystem / Cairo).
6. Choose **DeFi Navigator** → Lab 1 swap sim → live STRK/USDC quote → execute → tx on Voyager.

---

## Scoring — 100% Deterministic

All question types scored by the platform, not AI.

| Type | Engine | Source of truth |
|---|---|---|
| MCQ / Match / Memory | index / pair match | Platform answer keys |
| Fill-in / Judgment | `deterministicScorer.ts` | Keywords + numbers from criteria |
| Boss Phase 1 MCQ | `Phase1BossRenderer` (80% threshold) | Supabase question bank |
| Boss Phase 2 | snforge output + structural validation | Platform test files |
| Sepolia deploy | `starknet_getTransactionReceipt` | Chain (immutable) |
| Cairo audit | `AuditSim` answer key | Curated security criteria |
| Branching interview | `BranchingInterviewRenderer` | Per-branch keyword + number |

Zero Anthropic calls in the scoring path. `/api/ai/score` → `deterministic_score.py`.

---

## Architecture

### Frontend (`src/`)
```
screens/
  AuthScreen.tsx              Privy sheet → Starknet wallet → Island 18
  StarknetTrackScreen.tsx     DeFi Navigator
  EcosystemTrackScreen.tsx    Ecosystem Deep Dive
  CairoBuilderTrackScreen.tsx Cairo Builder
  WorldScreen.tsx             Island / lab map
  LessonScreen.tsx            Level runner + boss
  GuildScreen.tsx             Guild tab
  PortfolioScreen.tsx         Portfolio hub (OAuth + manual-link fallback)
components/simulators/
  StarkzapSimulatorCard.tsx   9 modes (swap / borrow / bridge / balance / …)
  CairoBuilderSimulators.tsx  8 Cairo types
  Phase1BossRenderer.tsx      15-question boss MCQ
  BranchingInterviewRenderer.tsx
lib/
  starkzap.ts                 starkzap-native singleton
  portfolioOAuth.ts           Web/native OAuth branch (web: popup + poll)
  deterministicScorer.ts      Zero-AI scoring
data/tracks/
  starknet_defi_navigator/    11 labs
  starknet_ecosystem_deep_dive/ 9 labs + primer
  cairo_builder/              12 labs
```

### Backend (`backend/`)
```
main.py                Router registration
auth.py                Privy JWKS verification + legacy guest/wallet auth
starknet_routes.py     RPC proxy, tx logging
game_extra_routes.py   lab-complete endpoints
boss_routes.py         Boss scoring
interview_routes.py    Deterministic question scoring
deterministic_score.py Python port of deterministicScorer.ts
guild_routes.py        Guild API
portfolio_routes.py    OAuth + manual-link + submission packages
```

### Database (`supabase/`)
```
migration_v2.sql               Core 16 tables
skillup_new_tables.sql         Starknet + scoring
guild_tables.sql               Guilds
interview_questions_seed_v2.sql Question bank
privy_did_migration.sql        Privy DID column + RLS
```

---

## Portfolio Hub — OAuth Status

- **GitHub** — live OAuth end-to-end on web and native. On web the app opens the Privy / GitHub consent flow in a popup and polls `/api/portfolio/accounts` to detect completion (the backend issues a `sifter://` redirect at the end that a browser can't reach, but the account row is already written by that point).
- **All other platforms (LinkedIn, Twitter, Medium, Reddit, Behance, Dribbble, YouTube, Vimeo, …)** — show a **manual-link** UI ("Paste your profile URL") and, for package-only platforms, a **Get package** button under My Work. No OAuth is attempted for these in demo.

Add credentials later by setting the matching `*_CLIENT_ID` / `*_CLIENT_SECRET` pair in `backend/.env` and expanding `OAUTH_LIVE_PLATFORMS` in `src/lib/portfolioOAuth.ts`.

---

## QA Checklist — Demo Day

- [ ] Privy sheet opens, email OTP + at least one OAuth provider visible
- [ ] New sign-in creates Starknet wallet (0x… address, 63–64 hex chars)
- [ ] User lands on **Island 18** after signup
- [ ] Supabase `users` row: `privy_did` set, `starknet_address` set
- [ ] Level 291 loads and completes
- [ ] `isStarkzapAvailable()` returns `true` in console
- [ ] Starkzap simulator produces a real Sepolia tx hash
- [ ] Level 310 boss completion reveals **three** track cards
- [ ] Navigator Lab 1 swap returns a live quote and executes
- [ ] Cairo Builder `cairo-invoke` shows a changing Sepolia block number
- [ ] Ecosystem track Primer unlocks on entry
- [ ] Guild tab loads
- [ ] Feed tab populates after Celery ingest (or mock feed)
- [ ] Portfolio → GitHub → OAuth completes on web and native
- [ ] Portfolio → any other platform shows manual-link UI (no OAuth attempt)
- [ ] Zero crashes in full run-through

---

*Sifter SkillUp — Integration v2.1 | Starkzap Builder Bounty | April 2026*
