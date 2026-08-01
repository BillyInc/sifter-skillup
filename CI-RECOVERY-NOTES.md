# CI Recovery Notes

`main` has been red across every CI check for reasons unrelated to any single
feature. This PR fixes everything that is safely code-fixable and documents the
rest here so the remaining work has clear owners. Buckets:

| Check | Status after this PR | Owner |
|-------|----------------------|-------|
| Frontend Checks (TypeScript + jest + web build) | ✅ fixed | — |
| Backend Checks (pytest) | ⚠️ 23 of 24 failures fixed; 1 documented below | backend dev |
| CodeQL (×3) | ❌ needs a repo setting (below) | repo admin |
| Netlify deploy previews (×6) | ⚠️ should recover now the web build compiles | infra / dev |

## Frontend Checks — fixed here

The `frontend` job has three steps; all three were red (the job stopped at the
first, which hid the other two). All now pass locally:

1. **TypeScript Check** (`tsc --noEmit`) — ~35 errors across ~30 screens, fixed.
   Root cause of ~25 of them: `src/theme/index.tsx`'s shared `webContainer` const
   widened `width: '100%'` to `string` instead of RN's `DimensionValue`; annotating
   it `ViewStyle` fixed every screen that spreads it. The rest were individual type
   bugs (missing `View` import, `active_track_id`→`active_track`, missing
   `Record<SavedEntityType,…>` keys, dead property accesses, `calc()`/`%` values
   typed as `DimensionValue`). No `@ts-ignore`/`any` used.
2. **Tests** (`jest`) — 4 suites were red. Three failed to *load* with
   `WorkletsError: Native part of Worklets doesn't seem to be initialized`:
   reanimated v4 pulls in `react-native-worklets`, and reanimated's own shipped jest
   mock re-`require`s the real module, so it doesn't help. Added a self-contained
   reanimated mock in `jest.setup.ts`. The 4th was a real **stale-closure bug** in
   `src/hooks/useLessonMechanics.ts`: `onAnswer` read `correctStreak` from a stale
   closure, so N rapid correct answers left the streak at 1 and mis-picked the
   celebration; fixed with a `correctStreakRef` (its own regression test now passes).
3. **Web Build** (`expo export --platform web`) — verified it compiles. This is the
   same build the Netlify preview runs, so the Netlify statuses should recover too.

---

## 1. CodeQL — needs GitHub Advanced Security (NOT a code fix)

All three CodeQL jobs fail with:

> Advanced Security must be enabled for this repository to use code scanning.

`.github/workflows/codeql.yml` runs CodeQL, but code scanning requires **GitHub
Advanced Security (GHAS)** to be enabled on the repo. On a private repo that is a
paid/admin toggle. Nothing in the codebase can satisfy this. Options for a repo
admin:

1. **Enable GHAS**: Settings → Code security and analysis → enable *Code scanning*.
2. **Or remove/disable** `.github/workflows/codeql.yml` if code scanning isn't wanted.
3. **Or** stop it gating PRs (make the check non-required in branch protection).

This PR deliberately does **not** touch `codeql.yml` — the decision is the owner's.

## 2. Netlify deploy previews

The 6 Netlify statuses (`deploy-preview`, `Header/Redirect/Pages rules`) come from
a failed Deploy Preview build. The web build (`expo export --platform web`) was
failing while the frontend did not type-check. With the TypeScript errors fixed in
this PR the web build should compile again; if the previews still fail afterward it
is a Netlify config/secret issue (build command, env vars) that needs someone with
Netlify access — not a code change.

## 3. Backend tests — 23 of 24 fixed; 1 documented (was: pre-existing test-vs-refactor divergence)

### Test-infra fixes
- **conftest DB mock never reached the live modules.** `tests/conftest.py` patched
  bare module names (`starknet_routes`, `device_sessions`, `phase5_routes`,
  `offline_sync`, `feed_routes`), but the app mounts `routes.starknet_routes`,
  `middleware.device_sessions`, `routes.phase5_routes`, `services.offline_sync`,
  `routes.feed_routes`. The real modules kept a live Supabase client, so tests hit
  the network (`httpx.ConnectError`). Now patched by identity sweep over
  `sys.modules` — robust to future moves. **This alone fixed ~10 failures.**
- **`migration_v2.sql`** wrapped in `BEGIN;`/`COMMIT;` (smoke test).
- **`test_starknet_routes.py`** imports the real `routes.starknet_routes` (the root
  `starknet_routes.py` is an `import *` shim that can't expose `_verify_privy_token`)
  and uses a JWT-shaped token stub so it passes `_looks_like_jwt`.

### Production regressions restored (the refactor dropped these; tests correctly guarded them)
> ⚠️ **Deployment note:** the offline-sync and merch/XP fixes call the atomic Postgres
> functions defined in **`migration_v2_atomic.sql`** (`increment_user_points`,
> `decrement_merch_credits`, `try_award_offline_xp`). They must be applied to the
> database for these paths to work at runtime. The tests mock the RPCs, so green tests
> alone don't prove the functions are deployed — verify before shipping.

- **`services/offline_sync.py`** — the live drain endpoint had lost, vs the stale root
  reference, its abuse protections. Restored: per-item XP cap (`MAX_XP_PER_ITEM=500`),
  per-batch XP cap (`MAX_XP_PER_BATCH=5000`, reject-up-front pre-pass), clock-skew hard
  reject (`MAX_CLOCK_SKEW_SECONDS=24h`), and routing XP awards through the atomic
  `try_award_offline_xp` RPC with a "capped → REJECTED" result. (Unknown-endpoint
  rejection and priority ordering were already present — those 2 tests only needed the
  import fix so the `_already_applied` monkeypatch reached the live module.)
- **`routes/starknet_routes.py`** — restored `0x`-hex transaction-hash format
  validation on `POST /api/starknet/transactions` (was persisting arbitrary strings).
  Plus the read-only RPC method allowlist on `StarknetRPCRequest` (422 on unknown).
- **`routes/phase5_routes.py`** — restored the atomic-RPC design the migration intends:
  `POST /xp/event` now uses `increment_user_points` (was a read-then-write race) and
  caps client XP at `MAX_XP_PER_EVENT=1000`; `POST /merch/redeem` uses
  `decrement_merch_credits` (atomic check-and-deduct; was a TOCTOU race on a stale
  read); `GET /xp/history?limit=` is bounded (`le=100` → 422 over cap).

### Test-only fixes (genuine refactors — updated the test, no prod change)
- `test_second_device_revokes_first` — the live middleware notifies the old device via
  a module-level `_send_logout_push(...)` coroutine (the `FCMService.send_device_logout_notification`
  path was refactored out); the test now patches the actual symbol.
- `test_debug_fallback` → replaced with `test_new_user_email_auth_creates_account`, a
  direct-call test of the real current email-auth happy path (the old DEBUG bypass it
  exercised no longer exists; it mocked `_verify_privy_token` with the wrong signature).

### Still failing — needs the dev's decision (1)
- **`test_middleware_missing_x_device_id_rejects`** — expects a request with **no
  `X-Device-Id` header** to be rejected `401 device_required` when single-device
  enforcement is on. The live `DeviceSessionMiddleware` deliberately lets such requests
  through (`"No device_id header = old client version, let it through"`).
  **This one is a genuine product/security tradeoff and was left as-is:**
  `SINGLE_DEVICE_ENFORCEMENT` **defaults to `true`**, so flipping this would immediately
  `401` every currently-deployed client that doesn't send the header. It's coherent to
  require it (the enforcement model is meaningless without a device id, and
  `validate_device_header` returns `True` on no-session so registration still works) —
  but the rollout needs all clients updated first. **Decide: require the header (tighten
  `middleware/session_middleware.py`), or update the test to the current lenient contract.**

### Cleanup worth doing
Delete the stale root duplicates (`offline_sync.py`, `device_sessions.py`,
`phase5_routes.py`, `feed_routes.py`, `session_middleware.py`, and the
`starknet_routes.py` shim) once nothing imports them, so tests can't target dead code
again — they're what caused most of this divergence.
