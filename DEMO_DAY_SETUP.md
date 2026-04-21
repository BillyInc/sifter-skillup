# Sifter SkillUp — Demo Day Setup Guide
## Starkzap Builder Bounty | Complete Integration

---

## STEP 0 — Before Anything Else (Do This First)

```bash
# Clone / unzip this project
cd sifter-skillup-integrated

# Install dependencies
npm install

# Install Starkzap SDK (CRITICAL — without this, all simulators run in MOCK mode)
npm install starkzap-native

# iOS native rebuild
cd ios && pod install && cd ..

# Android native rebuild
cd android && ./gradlew clean && cd ..
```

---

## STEP 1 — Environment Variables

Create `backend/.env` with ALL of these:

```env
# Supabase
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# Auth
JWT_SECRET=your_jwt_secret_min_32_chars

# Starknet RPC (round-robin pool — add more for resilience)
STARKNET_SEPOLIA_RPCS=["https://starknet-sepolia.public.blastapi.io/rpc/v0_7","https://free-rpc.nethermind.io/sepolia-juno/rpc/v0_7"]
STARKNET_MAINNET_RPCS=["https://starknet-mainnet.public.blastapi.io/rpc/v0_7"]

# AI (only needed for AI Explainer hints — NOT for scoring)
ANTHROPIC_API_KEY=your_key_optional

# Feed (optional — RSS works without this)
TWITTER_BEARER_TOKEN=your_token_optional

# Portfolio OAuth (optional for demo)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
```

---

## STEP 2 — Database Migrations (Supabase SQL Editor)

Run these SQL files **in order** in the Supabase SQL Editor:

### 2a. Core tables
```
supabase/migration_v2.sql
```

### 2b. New scoring + starknet tables
```
supabase/skillup_new_tables.sql
```

### 2c. Guild + supporting tables
```
supabase/guild_tables.sql
```

### 2d. Question bank (deterministic scoring)
```
supabase/interview_questions_seed_v2.sql
```

### 2e. Verify
```sql
-- Should return rows for each track/level
SELECT track_id, level, COUNT(*) as q_count
FROM interview_questions
GROUP BY track_id, level
ORDER BY track_id, level;

-- Should show starknet columns exist
SELECT column_name FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('starknet_address','starknet_auth','guild_id','xp_stage');
```

---

## STEP 3 — Start Backend

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# In a SEPARATE terminal: start Celery (for feed ingestion)
celery -A celery_worker worker --beat --loglevel=info

# Trigger first feed ingest manually
celery -A celery_worker call celery_worker.ingest_track_feeds
```

---

## STEP 4 — Pre-Fund Demo Wallet (CRITICAL)

Before demo, fund the wallet you'll use so the faucet banner doesn't appear:

1. Complete Starknet auth in the app to generate your demo wallet address
2. Copy the wallet address from the AddressPill
3. Go to **https://starknet-faucet.vercel.app** → request ETH
4. Go to **https://blastapi.io/faucets/starknet-sepolia-strk** → request STRK
5. Verify: open app, confirm ETH > 0.001 and STRK > 1

---

## STEP 5 — Start the App

```bash
# Development
npx expo start

# iOS device
npx expo run:ios --device

# Android device
npx expo run:android --device
```

---

## THE DEMO SEQUENCE (practise this 10 times)

### 🎯 Money Shot Flow
1. Open app → tap **"Continue with Starknet ⚡"**
2. Enter fresh email → wallet address generated → routed to **Island 18**
3. Complete any Island 18 level (Level 291 recommended)
4. Simulator shows Starkzap SDK call → **real tx hash** → tap Voyager link
5. Complete Level 310 boss → **THREE track cards appear** (Navigator / Ecosystem / Cairo)
6. Choose **DeFi Navigator** → Lab 1 → Swap simulator
7. Tap "Get Quote" → **real STRK/USDC quote from Sepolia**
8. Execute swap → unique tx hash → Voyager link opens ✅

---

## SCORING — FULLY DETERMINISTIC (No AI Required)

All question types across all tracks are scored by the platform, not AI:

| Question Type | Scoring Method | Source of Truth |
|---|---|---|
| MCQ (multiple choice) | `correct: number` index match | Platform-authored answer keys |
| Match3 / Memory | Exact pair matching | Platform-authored pairs |
| Fill-in / Judgment | `deterministicScorer.ts` | Keyword + number extraction from criteria |
| Boss Phase 1 MCQ | `Phase1BossRenderer.tsx` 80% threshold | Platform question bank (Supabase) |
| Boss Phase 2 | Structural code validation + snforge output parsing | Platform test files |
| Sepolia deployment | `starknet_getTransactionReceipt` RPC call | Blockchain (immutable) |
| Cairo audit | `AuditSim` answer key | Platform-curated security criteria |
| Branching interview | `BranchingInterviewRenderer.tsx` | Keyword + number scoring per branch |

**Zero Anthropic API calls in the scoring path.** `/api/ai/score` now uses `deterministic_score.py`.

### Scoring Criteria are Industry-Standard:
- Starknet STRK token address: `0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d` ✓
- Gas math: actual Starknet fee structure (STRK for gas, not ETH) ✓
- Protocol names: Ekubo, Vesu, AVNU, Nostra, Argent, Braavos ✓
- Cairo syntax: felt252, ContractState, #[storage], #[event] ✓
- STARK proof verification: real proof sizes and cost calculations ✓

---

## ARCHITECTURE — What Was Built

### Frontend (React Native / Expo Router)
```
src/
├── screens/
│   ├── AuthScreen.tsx           — Starknet auth → routes to Island 18
│   ├── StarknetTrackScreen.tsx  — DeFi Navigator (pink #EC4899)
│   ├── EcosystemTrackScreen.tsx — Ecosystem Deep Dive (indigo #6366F1)
│   ├── CairoBuilderTrackScreen.tsx — Cairo Builder (orange #F97316) ← NEW
│   ├── WorldScreen.tsx          — Fixed: reads labId, loads lab content
│   ├── IslandMapScreen.tsx      — Fixed: shows 3-track choice after boss 310
│   ├── LessonScreen.tsx         — Fixed: boss completion fires for all 3 tracks
│   ├── GuildScreen.tsx          — NEW: replaces CommunityScreen
│   └── PostIslandTrackSelection.tsx — Updated: 3 tracks (was 2)
│
├── components/simulators/
│   ├── SimulatorCard.tsx        — Fixed: all 20+ types registered
│   ├── StarkzapSimulatorCard.tsx — Fixed: all 9 modes including borrow/bridge/balance
│   ├── CairoBuilderSimulators.tsx — 8 Cairo types (typecheck/invoke/deploy/snforge/starkzap/audit/build/boss)
│   ├── JudgmentRenderer.tsx     — Deterministic scoring
│   ├── Phase1BossRenderer.tsx   — 15-question boss MCQ
│   ├── BranchingInterviewRenderer.tsx — Adaptive interview scoring
│   ├── ResearchWriterSandbox.tsx — Lab 6 research writer
│   ├── CairoBuilderPhase2Scorer.tsx — snforge output parser
│   └── starknetSepoliaSupport.tsx — Balance/explorer/faucet
│
├── lib/
│   ├── deterministicScorer.ts   — Zero-AI scoring engine
│   ├── starkzap.ts              — Starkzap SDK singleton + mock fallback
│   └── starknetFeed.ts          — 24 curated Starknet Twitter accounts
│
└── data/tracks/
    ├── starknet_defi_navigator/ — 11 labs, simulators, boss modes
    ├── starknet_ecosystem_deep_dive/ — 9 labs + primer, simulators
    └── cairo_builder/           — 12 labs, ALL_LABS, ALL_SIMULATORS
```

### Backend (FastAPI / Python)
```
backend/
├── main.py                  — Router registration (all routes wired)
├── starknet_routes.py       — RPC proxy, wallet auth, tx logging
├── game_extra_routes.py     — navigator/cairo/ecosystem lab-complete
├── boss_routes.py           — Boss phase scoring endpoints
├── interview_routes.py      — v2: deterministic question scoring
├── deterministic_score.py   — Python port of deterministicScorer.ts
├── guild_routes.py          — NEW: Guild system (replaces community social)
└── community_routes.py      — /api/ai/score now uses deterministic_score.py
```

### Database (Supabase)
```
supabase/
├── migration_v2.sql               — Core 16 tables
├── skillup_new_tables.sql         — Starknet + scoring tables
├── guild_tables.sql               — NEW: guilds, guild_messages, guild_challenges
└── interview_questions_seed_v2.sql — Question bank for deterministic scoring
```

---

## KNOWN DEMO MODE BEHAVIOUR

When `starkzap-native` is NOT installed (npm not run):
- All Starkzap simulators run in MOCK mode
- Swap quotes show static values (not live Sepolia prices)
- Tx hashes are generated client-side (not on-chain)
- A "Demo Mode" badge shows in each simulator
- **This is acceptable for first-run testing. Run `npm install starkzap-native` to go live.**

When `starkzap-native` IS installed:
- Live Sepolia prices and pool data
- Real tx hashes verifiable on voyager.online
- `isStarkzapAvailable()` returns `true`
- No "Demo Mode" badge

---

## QA CHECKLIST — Run Before Demo Day

Copy from `SifterSkillUp_QA_TestingProtocol.docx` and tick each item.
Critical path:

- [ ] `isStarkzapAvailable()` logs `true` in console
- [ ] Starknet auth button visible and distinct on AuthScreen
- [ ] Auth generates 0x... wallet address (63-64 hex chars)
- [ ] App routes to Island 18 map (NOT generic home) after auth
- [ ] Supabase: user row shows `starknet_auth: true` and address
- [ ] Level 291 loads and is completable
- [ ] Starkzap simulator in Island 18 shows real or mock tx hash (NOT a crash)
- [ ] Boss 310 completion shows **THREE** track cards
- [ ] DeFi Navigator Lab 1 content loads (NOT blank screen)
- [ ] Navigator Lab 1 boss (3001) fires → Lab 2 unlocks
- [ ] Cairo Builder track accessible and Lab 1 opens
- [ ] `cairo-invoke` shows a real, changing Sepolia block number
- [ ] `cairo-boss` completes all 3 steps
- [ ] Ecosystem track Primer unlocked on entry
- [ ] Feed tab shows content after Celery ingest
- [ ] Demo wallet pre-funded (needsFaucet = false)
- [ ] Guild tab loads (replaces Community tab)
- [ ] Portfolio push prompt appears after any boss completion
- [ ] Zero crashes in full demo run

---

*Sifter SkillUp — Integration v2.0 | Starkzap Builder Bounty | April 2026*
