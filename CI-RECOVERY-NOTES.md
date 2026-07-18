# CI Recovery Notes

`main` has been red across every CI check for reasons unrelated to any single
feature. This PR fixes everything that is safely code-fixable and documents the
rest here so the remaining work has clear owners. Buckets:

| Check | Status after this PR | Owner |
|-------|----------------------|-------|
| Frontend Checks (TypeScript + jest + web build) | ✅ fixed | — |
| Backend Checks (pytest) | ⚠️ 10 of 24 failures fixed; 14 documented below | backend dev |
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

## 3. Backend tests — pre-existing test-vs-refactor divergence (14)

### Fixed here (real, unambiguous)
- **conftest DB mock never reached the live modules.** `tests/conftest.py` patched
  bare module names (`starknet_routes`, `device_sessions`, `phase5_routes`,
  `offline_sync`, `feed_routes`), but the app mounts `routes.starknet_routes`,
  `middleware.device_sessions`, `routes.phase5_routes`, `services.offline_sync`,
  `routes.feed_routes`. The real modules kept a live Supabase client, so tests hit
  the network (`httpx.ConnectError`). Now patched by identity sweep over
  `sys.modules` — robust to future moves. **This alone fixed ~10 failures.**
- **RPC method allowlist** restored on `StarknetRPCRequest` (rejects non-allowlisted
  methods with 422; read-only methods only).
- **`migration_v2.sql`** wrapped in `BEGIN;`/`COMMIT;` (smoke test).
- **`test_starknet_routes.py`** imports the real `routes.starknet_routes` (the root
  `starknet_routes.py` is an `import *` shim that can't expose `_verify_privy_token`,
  and patching the shim wouldn't affect the live route anyway), and uses a
  JWT-shaped token stub so it passes `_looks_like_jwt`. (7/9 starknet tests now pass.)

### Still failing — need the backend dev's intent (do NOT silently bless)
These tests were written against **older implementations** that have since been
refactored and/or relocated. Each is either a **real regression to fix in code** or
an **intended change that needs the test updated** — and only the dev can say which.
Several touch **security-relevant behavior**, so they were left failing rather than
guessed at.

**`tests/test_offline_sync.py` (5)** — written for the stale root `offline_sync.py`
(has `MAX_XP_PER_ITEM`, `MAX_CLOCK_SKEW_SECONDS`, per-item XP cap, unknown-endpoint
rejection). The app mounts `services/offline_sync.py`, a refactor with a different
API (`_ENDPOINT_MAP`, `MAX_ITEM_AGE_HOURS`, `MAX_BATCH_SIZE`; no XP/skew constants):
- `test_unknown_endpoint_rejected` — refactor returns `applied`, not `rejected`, for
  an unknown endpoint. **Security: should unknown offline endpoints be rejected?**
- `test_xp_amount_capped_to_max_per_item` — no per-item XP cap in the refactor.
- `test_per_batch_cap_enforced` — no per-batch XP cap in the refactor.
- `test_clock_skew_rejects_batch` — no clock-skew rejection in the refactor.
- `test_priority_order_critical_first` — priority ordering differs.

**`tests/test_device_sessions.py` (2)** — written for root `device_sessions.py`
(imports `FCMService`); app mounts `middleware/device_sessions.py` (no `FCMService`):
- `test_second_device_revokes_first` — patches `device_sessions.FCMService`, absent
  on the live module; second-device revocation/notification path differs.
- `test_middleware_missing_x_device_id_rejects` — middleware rejection behavior differs.

**`tests/test_starknet_routes.py` (2)**:
- `test_debug_fallback` — exercises a DEBUG bypass the refactored route no longer has
  (route always requires `PRIVY_APP_SECRET`; test mocks `_verify_privy_token` as an
  async fn returning an address, but it is sync returning a claims dict). Needs a test
  rewrite or a route decision on whether a DEBUG fallback should exist.
- `test_invalid_hash_rejected` — the route no longer format-validates the tx hash
  (accepts `"not-a-hash"`). **Security: restore `0x`-hex hash validation?**

**`tests/test_phase5_routes.py` (5)**:
- `test_xp_event_capped` — XP event amount no longer validated/capped.
- `test_limit_too_large_rejected` — XP-history `limit` no longer bounded.
- `test_xp_event_uses_atomic_rpc` — route no longer calls the `increment_user_points`
  atomic RPC. **Atomicity: intended, or a regression?**
- `test_insufficient_credits`, `test_success` (MerchRedeem) — route reads credits via
  `.data[...]`; the test's mock shape doesn't match the refactored data access, so the
  route hits `MagicMock < int`. Needs the mock updated to the current access pattern.

### Recommended next step for the dev
Go test-by-test: if the old behavior is still wanted (esp. the security items —
unknown-endpoint rejection, hash validation, XP/credit caps, atomic RPC), restore it
in the live `routes.*`/`services.*`/`middleware.*` modules. If the refactor is
intended, update the test to the new contract. Also consider deleting the stale root
duplicates (`offline_sync.py`, `device_sessions.py`, `phase5_routes.py`,
`feed_routes.py`, `starknet_routes.py` shim) once nothing imports them, so tests can't
target dead code again.
