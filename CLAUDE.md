# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sifter LevelUp is a Duolingo-style learning app for crypto literacy and quant finance. It has two main parts: a React Native/Expo mobile frontend and a FastAPI Python backend, backed by Supabase (Postgres) with Celery/Redis for background jobs.

## SUPABASE APPLY-NOW CONTRACT — READ BEFORE TESTING ADMIN, MATCHING, OR REPORTS

This is the visible deployment order Claude must follow when the task involves
Supabase, subject matching, school provisioning, account deletion, guidance
resume, or report printing. The configured REST keys cannot run DDL: use the
Supabase Dashboard SQL Editor or `psql` with the project database connection
string. The complete explanation and verification queries are in
`backend/COMPLETE_DATA_MIGRATION_2026-08-17.md` and
`backend/MIGRATION_RUNBOOK.md`.

### MANDATORY APPLY BEHAVIOUR

When the user asks Claude to seed, migrate, update, or prepare Supabase, this
section is an execution instruction, not a reading list. Claude must actually
apply every missing SQL file in the applicable order above, then verify the
result. Do not merely report the filenames, generate a plan, or say that the
schema is ready. Do not proceed to the E2E test until the required migrations
and seeds have been executed successfully.

For an existing project, Claude must:

1. Run the read-only preflight and use its table/column counts to identify what
   is already applied.
2. Apply each missing migration in dependency order, one file at a time, using
   the Supabase Dashboard SQL Editor or `psql` with the configured project
   connection. Keep each file's transaction intact and wait for a successful
   result before applying the next file.
3. Apply the data seeds only after their schema tables exist, in the exact seed
   order listed below. A seed that reports an error is not applied; stop and
   report the file and database error instead of continuing as if it succeeded.
4. Re-run the preflight, record the post-apply counts, and run the exhaustive
   matcher audit. Only then run provisioning, guidance, report, or claim-code
   tests.

If Claude cannot reach the SQL Editor or does not have a usable `psql`
connection, it must say that application is blocked and give the exact next
command/file to run. It must not claim that SQL was applied, must not treat a
REST-only check as DDL execution, and must not fabricate rows to bypass a
missing migration. For a populated production project, apply only files proven
missing by preflight; never use a destructive rebuild or the staging-only
`migration_career_v2.sql` without explicit approval.

### Existing Supabase project: apply missing items only

The current project is not assumed to be fully migrated. First inspect the
schema and counts. Do not blindly rerun a destructive taxonomy migration on a
populated database. For the current student/admin test goal, the required
missing surfaces are commonly these:

1. `backend/migration_school_identity.sql` — `schools.address`, `city`,
   `state`, `country`, and unique school affiliation codes.
2. `backend/migration_guidance_report_paths.sql` — durable student/admin
   guidance checkpoints used by report generation.
3. `backend/migration_goal_apply_now.sql` and, if still absent, the current
   additive auth/account patches listed in the complete migration runbook —
   account-type selection, provisioning, claim-code and deletion support,
   including `account_deletion_cooldowns`.
4. `backend/migration_institution_team_access.sql` and
   `backend/migration_institution_verification_proof.sql` when team or proof
   flows are being tested.
5. `backend/migration_subject_rule_records.sql` — typed national subject-rule
   authority table. This must exist before the subject seeds.

Then run the subject data in this exact order:

```text
backend/seed_subject_catalog.sql
backend/seed_career_pilot.sql
backend/seed_subject_rule_records.sql
backend/seed_subject_options.sql
```

`seed_subject_options.sql` is a replacement seed for the national matcher
tables; back up the affected tables first. The API intentionally fails closed
when `programme_subject_rule_records` is empty or does not agree with the
option seed. Do not call that state a passing matcher test.

### Fresh or explicitly approved staging database: full order

Apply the following groups in order, keeping each SQL file's transaction
intact:

```text
# 1. Base application
supabase-schema.sql
backend/migration_v2.sql
backend/migration_v2_atomic.sql
backend/migration_auth_profile.sql
backend/migration_fcm_device_tokens.sql
backend/migration_v2_offline_idempotency.sql
backend/migration_v2_offline_streak.sql

# 2. Career, subject, admission, and resource schema
backend/migration_career_base_registry.sql
backend/migration_subject_catalog.sql
backend/migration_career_pilot.sql
backend/migration_subject_rule_records.sql
backend/migration_career_v2.sql       # staging/empty rebuild only
backend/migration_admission_intelligence.sql
backend/migration_role_tools.sql
backend/migration_source_backed_career_layers.sql
backend/migration_enrichment_v1.sql
backend/migration_market_intelligence_v1.sql
backend/migration_role_detail_enrichment.sql
backend/migration_career_resources_v1.sql

# 3. Provisioning, onboarding, guidance, and institution access
backend/migration_provisioning.sql
backend/migration_school_identity.sql
backend/migration_institution_team_access.sql
backend/migration_student_pipeline_live.sql
backend/migration_ss3_secondary_starting_point_patch.sql
backend/migration_provisioning_guidance_variants.sql
backend/migration_guidance_report_paths.sql
backend/migration_saved_resource_support.sql
backend/migration_student_consent_requests.sql
backend/migration_institution_verification_proof.sql

# 4. Current auth/account/admin patches
backend/migration_goal_apply_now.sql
backend/migration_pending_account_type_patch.sql
backend/migration_signup_auth_apply_now_patch.sql
backend/migration_auth_onboarding_security_patch.sql
backend/migration_account_lifecycle_patch.sql
backend/migration_admin_access_grant.sql
backend/migration_internal_staff.sql
backend/migration_feedback_storage.sql
backend/migration_user_feedback.sql

# 5. Data seeds
backend/seed_subject_catalog.sql
backend/seed_career_pilot.sql
backend/seed_subject_rule_records.sql
backend/seed_subject_options.sql
backend/seed_career_v2.sql
backend/seed_phase8_9_enrichment.sql
backend/seed_career_resources_v1_parts/part-001.sql ... final part
backend/patch_subject_catalog_streams.sql
```

### Current career preview seed (new since the last push)

The current worktree contains one new SQL artifact:
`backend/seed_career_v2_preview_2026-08-25.sql`. It is a development-only
preview generated from the repaired subgroup taxonomy and the current
source-backed Nigerian context layer. Its purpose is to let a developer inspect
the corrected domain/subgroup/role rows, tools and provenance payload before
role enrichment is complete. It is not the production seed.

For a fresh or explicitly approved staging database, the career-specific order
for this preview is:

```text
backend/migration_career_base_registry.sql
backend/migration_subject_catalog.sql
backend/migration_career_pilot.sql
backend/migration_subject_rule_records.sql
backend/migration_career_v2.sql                 # staging/empty rebuild only
backend/migration_admission_intelligence.sql
backend/migration_role_tools.sql
backend/migration_source_backed_career_layers.sql
backend/migration_enrichment_v1.sql
backend/migration_market_intelligence_v1.sql
backend/migration_role_detail_enrichment.sql    # if role detail/cert data is used
backend/migration_career_resources_v1.sql       # if resources are used
backend/migration_saved_resource_support.sql    # after saved_items exists
backend/seed_career_v2_preview_2026-08-25.sql   # development only
```

The preview must not be applied to production or renamed into
`seed_career_v2.sql`. Before applying it, confirm that
`migration_role_tools.sql` and `migration_source_backed_career_layers.sql`
have been applied because the preview writes role-owned tool fields and
source-confidence, data-state, provenance and Nigerian-context columns. Keep
the preview transaction intact, record the database and date, and run the
post-seed count/orphan queries from
`backend/COMPLETE_DATA_MIGRATION_2026-08-17.md`. The Nigerian population gate
is currently closed; a production seed may be generated only after the
role-enrichment, provenance, reconciliation and completeness gates pass.

Do not claim that this SQL was applied based on a local generator run. SQL is
only applied through the Supabase SQL Editor or a verified `psql` connection.

### Global search parameter and career-intelligence routing

When changing `useGlobalSearchParams` or any `globalSearchParam` fix, verify
that legacy routing cannot consume or redirect a career-intelligence route's
parameters. Career-intelligence screens should use route-local parameters for
their entity identity and should receive only an explicit, allow-listed
guidance context. If the global search parameter causes legacy routing to
interfere with career-intelligence routing, disable the global search parameter
for that path. If it is genuinely required by an admin or shell flow, resolve
the conflict properly with route namespacing/allow-listing and route-integrity
tests; do not leave a global-parameter fallback that can hijack the career
intelligence flow.

Do not run `backend/migration_career_intelligence.sql`; it is superseded.
After the subject seeds, run the exhaustive matcher audit:

```text
backend/.venv/Scripts/python.exe data/career-mapping/_audit_subject_match_exhaustive.py
```

Only after the audit reports zero oracle mismatches should Claude run the live
school-owner → school code → student provisioning → SS1 guidance → report →
claim-code test. Record the post-seed table counts and any remaining blocker
instead of silently substituting mock data.

### Current-database preflight (read-only)

When the user says to test against the database as it currently exists, run this
before the E2E flow. It never applies SQL or changes rows:

```text
cd backend
.venv\\Scripts\\python.exe _supabase_preflight.py
```

Use the JSON gates directly. `overall: blocked` means test the available paths
and report the exact blocked gates; it does not authorize bypassing the missing
schema with fabricated rows. In particular, `matcher: blocked` is expected
when `programme_subject_rule_records` is empty, and must be reported as no
personalized subject matches rather than as zero valid programmes.

## Commands

### Frontend (React Native / Expo)
```bash
# This project is pnpm, NOT npm. package.json pins
# "packageManager": "pnpm@10.33.0", pnpm-lock.yaml is the tracked lockfile,
# and CI installs with `pnpm install --frozen-lockfile`.
#
# Running `npm install` here looks fine locally — node_modules ends up correct,
# tsc and jest both pass — but it writes a stray package-lock.json and leaves
# pnpm-lock.yaml stale, so CI dies with ERR_PNPM_OUTDATED_LOCKFILE before a
# single test runs. Add and remove dependencies with pnpm.
pnpm install             # install dependencies
pnpm add <pkg>           # add a dependency (updates pnpm-lock.yaml)
npx expo start           # dev server (Expo Go or dev client)
npx expo start --android # Android emulator
npx expo start --ios     # iOS simulator
eas build --platform android  # EAS cloud build
eas build --platform ios      # EAS cloud build
```

### Lint / Format / Type-Check
```bash
npx tsc --noEmit                # TypeScript type check (no output)
npx expo lint                   # ESLint via Expo
npx prettier --check "src/**/*.{ts,tsx}"  # Check formatting
npx prettier --write "src/**/*.{ts,tsx}"  # Auto-format
```

### Backend (FastAPI — uses uv)
```bash
cd backend
uv sync                      # install dependencies (creates .venv)
uv run uvicorn main:app --reload  # dev server on :8000
uv run pytest                # run tests
```

### Backend Lint / Format
```bash
cd backend
uv run ruff check .          # Python linting
uv run ruff format .         # Python formatting
```

### Build
```bash
npx expo export              # Production JS bundle
eas build --platform android # EAS cloud build (Android)
eas build --platform ios     # EAS cloud build (iOS)
docker-compose build         # Build backend Docker image
```

### Docker (full stack)
```bash
docker-compose up -d   # starts api, celery worker, celery beat, redis
```

## Architecture

### Frontend (`app/`, `src/`)
- **Expo SDK 55**, React Native 0.76.7, React 19.2, TypeScript strict mode
- Path alias: `@/*` maps to `src/*`
- Navigation: **expo-router** (file-based) — routes live under `app/`, not in a
  navigator config. `@react-navigation/bottom-tabs` is NOT a dependency.
  `app/(tabs)/` currently holds the active destinations plus retained legacy
  learning routes: explore, feed, fields, guild, home, map, myworld,
  opportunities, portfolio, profile, settings, skills, and streaks. The old
  community route files are retired; stale `/community` browser entries are
  repaired by `RouteIntegrityGuard`.
  Which of these are surfaced in the visible tab bar is decided by
  `MOBILE_NAV` / `PRIMARY_NAV` in `src/components/shell/ReferenceShell.tsx`,
  not by the presence of a route directory.
- The `myworld` destination is labelled **Saved** pre-launch, via the
  flag-aware `WORLD_NAV`; it becomes **My World** when
  `featureFlags.myWorldLive` (`EXPO_PUBLIC_MY_WORLD_LIVE`) is on. The route,
  path and NavId stay `myworld` in both cases.
- UI typeface is **Inter** (`@expo-google-fonts/inter`, weights 400/500/600/700)
  with Spline Sans Mono for data/monospace — see `src/theme/fonts.ts`.
- Auth state managed via `src/hooks/useAuth` (React Context), token stored in SecureStore (migrated from AsyncStorage)
- API client in `src/lib/api.ts` — all requests go through FastAPI backend, uses `EXPO_PUBLIC_API_URL` env var
- Reanimated plugin must be last in `babel.config.js` plugins array
- Learning content defined as data files: `src/data/levels.ts`, `quantLevels.ts`, `pythonLevels.ts`, `islands.ts`

### Backend (`backend/`)
- **FastAPI** with Pydantic v2 models (`models.py`)
- Auth (`auth.py`): Telegram initData HMAC, Base wallet EIP-191 signatures, guest auto-create — all issue JWTs
- Database (`database.py`): Supabase client, schema `skillup_dev`
- Config (`config.py`): pydantic-settings, reads from `.env`
- Background jobs: Celery + Redis (`celery_worker.py`)
- Portfolio routes split into `portfolio_routes.py`

### Database (Supabase)
- Schema lives in `supabase-schema.sql` (+ `portfolio-schema.sql` for portfolio tables)
- All tables under the `skillup_dev` schema
- Key tables: `users`, `game_states`, `level_scores`, `transactions`
- User progress tracked via `completed_levels`, `perfect_levels`, `python_chapters_completed` arrays on the users table

### Learning Tracks
Three quant tracks with prerequisite chains:
- **Quant Trader**: Lab 0-7 (math) → Python ch. 1-5 → Lab 8 (applied)
- **Quant Researcher**: Lab 0 (math foundation), no prereqs
- **Quant Developer**: requires Python ch. 1-5 first

## Notable Patterns
- Frontend env: create `.env` with `EXPO_PUBLIC_API_URL=http://localhost:8000`
- Backend env: copy `backend/.env.example` to `backend/.env` and fill in Supabase credentials, JWT secret, etc.

## Skills to Load

Load these skills at the start of relevant work sessions:

### Frontend (React Native / Expo)
- `/react-native-expo` — Breaking changes, New Architecture, SDK 52+ migration
- `/react-native-expert` — Navigation, platform-specific code, FlatList optimization
- `/react-native-architecture` — Project structure, auth flows, offline-first patterns
- `/react-native-best-practices` — FPS, re-renders, bundle size, TTI optimization
- `/vercel-react-native-skills` — List performance, animations, UI patterns, state management

### Data Fetching
- `/tanstack-query-setup` — Query/mutation setup, optimistic updates, infinite queries
- `/tanstack-query-best-practices` — Query keys, caching, prefetching, SSR integration

### Backend (Python / FastAPI)
- `/python-patterns` — Framework selection, async vs sync, project structure, Pydantic
- `/python-performance-optimization` — Profiling, memory optimization, async I/O, caching

### Security
- `/senior-security` — Application security, penetration testing, secure coding practices

### QA & Testing
- `/senior-qa` — Quality assurance, test automation, testing strategy

### Git & Workflow
- `/git-workflow` — Conventional commits, branch naming, PR guidelines

## Mandatory Sifter LevelUp Design & Implementation Brief

This section is the startup contract for any Claude Code session that changes the
product experience. Read it before implementing UI, navigation, onboarding,
career intelligence, or opportunity features. The full source brief is kept at
[`docs/SIFTER_LEVELUP_CLAUDE_DESIGN_IMPLEMENTATION_INSTRUCTIONS-1.md`](docs/SIFTER_LEVELUP_CLAUDE_DESIGN_IMPLEMENTATION_INSTRUCTIONS-1.md),
and the supplied visual references are in
[`design/mockups-20260814T165448Z-1-001`](design/mockups-20260814T165448Z-1-001).
Use both, but treat the running code and real data as the product source of
truth.

### Mission and product principle

Act as the lead product designer, UX architect, interaction designer, and
senior frontend engineer for the existing Sifter LevelUp product. Improve the
real application in place; do not create a disconnected prototype or duplicate
route tree. The product should make complex education and career decisions
understandable to a secondary-school student while supporting deep exploration.

The guiding principle is **simple at the surface, deep underneath**. Make the
following relationship discoverable when the actual data model supports it:

`Subjects → Programmes → Domains/Sub-groups → Roles → Skills → Opportunities`

The user should move from uncertainty to clarity: know where to start,
understand the available options, understand why an option fits, and know the
next useful action.

### Non-negotiable source-of-truth rules

- Audit the repository, routes, components, state, API/data layer, persistence,
  and current UX before changing implementation.
- Use only values present in the codebase or returned by its real data sources.
  Never invent universities, programmes, subjects, cut-offs, JAMB facts,
  careers, skills, opportunities, companies, locations, salaries, dates,
  statistics, testimonials, user details, or match percentages.
- Mockup content is visual reference material only. Examples shown in a mockup
  must not be copied into the product as factual content.
- If data is unavailable, hide the section, derive a transparent value from
  existing data, or show an honest empty/locked state. Do not use fabricated
  filler to make a screen look complete.
- Do not silently change business rules, matching logic, filtering, or source
  data to satisfy a visual design. Record data defects separately.
- Prefer the existing routing, components, API client, hooks, state management,
  utilities, and tokens. Refactor shared patterns rather than creating a
  parallel architecture.

### Required work sequence

For a substantial redesign or feature, follow this order and report the result:

1. **Discover:** inspect the actual entry points, routes, screens, layouts,
   shared components, hooks, services, assets, styling/tokens, auth,
   persistence, API/data sources, and animation conventions.
2. **Audit:** document Critical, High, Medium, and Low UX issues. For each
   important issue state the current behavior, user impact, recommended fix,
   supporting reference pattern, and affected code area.
3. **Plan:** map navigation, information architecture, data relationships, and
   the core user journeys before writing UI code.
4. **Specify behavior:** create screen contracts, component inventories,
   state transitions, data flow, acceptance criteria, and edge-case handling.
5. **Visualize:** inspect the supplied mockups and create/validate visual
   representations of the proposed major states using actual routes and data.
6. **Implement:** build in the existing application, with reusable components
   and real data. Do not stop at a static screenshot match.
7. **Refine:** verify responsive behavior, accessibility, loading, empty/error/
   locked/success states, transitions, and long-content behavior.
8. **Verify:** run the relevant tests/type checks/lint/build and exercise the
   core journeys. Report what works, what is blocked, assumptions, and data
   limitations.

### Core journeys to preserve and improve

Audit these where the codebase supports them, plus any additional existing
journeys:

- New user: landing → onboarding → account/guest → setup → subjects → goals →
  exploration/recommendations.
- Programme discovery: explore → search → programme → requirements → schools/
  cut-offs → careers → pathways.
- Domain/career discovery: explore → domain or role → sub-groups/skills →
  programmes → opportunities.
- Opportunities: search/filter → result → detail → save/apply, using only
  supported actions and fields.
- Saved/My World: discover → save → review saved items → continue exploring.
- Returning user: authentication → personalized home/explore → recommendations
  and saved items, with state preserved according to existing persistence rules.

### Screen and component behavior contract

Treat every screen and control as a stateful interactive system, not a static
image. Before implementation, document for each major screen:

- name, route, purpose, entry/exit points, parent/children;
- real data required and its source;
- initial, loading, populated, empty, error, locked, selected, saved, and
  disabled states;
- user actions and the exact system response/state change after each action;
- success feedback, error recovery, retry behavior, and duplicate-submission
  handling;
- navigation/back behavior, deep links where applicable, and what persists
  across leaving, returning, refresh, and session changes;
- mobile, tablet, desktop, and large-screen behavior;
- labels, focus order, keyboard/touch behavior, contrast, target size, and
  reduced-motion behavior.

For every important component record its props/data dependency, local/shared
state, events, side effects, navigation effects, persistence effects, and
possible states. Use this event shape when reasoning about behavior:

`user action → system response → state/data change → UI feedback → next action`

Trace important data end-to-end, for example:

`input → search state → existing service/API/data source → results → selected
entity → parent form/onboarding state → persistence → next screen`.

Do not create a local UI state that contradicts the application's real state or
duplicate an important source of truth.

### Form, search, and selection requirements

Every form needs a behavior contract covering allowed values, required versus
optional fields, validation, character limits, formatting, focus/blur, keyboard
behavior, clear/edit, submit-disabled conditions, loading, success, failure,
retry, persistence, Back, and partial completion.

Search must have a clear focus state, contextual placeholder, query/update
behavior, loading state, real result hierarchy, no-results recovery, request
error recovery, clear/reset, keyboard accessibility, and selection behavior.

Subject selection should use search plus selectable chips/grid, selected count,
obvious selected state, and Continue—not five independent dropdowns—unless the
existing data model genuinely requires another interaction. The allowed
subjects and maximum selection count must come from product logic.

Goal selection should use selectable cards when multiple supported goals exist;
show only actual goals and explain each clearly.

For school or entity search, support the full lifecycle when the data model
allows it: empty → focused → typing → searching → results → selected → saved;
also no results → add flow → validating → adding → added, plus duplicate,
failure, retry, edit, cancel, Back, and repeated-submission behavior. Preserve
entered text on failure and keep a successful selection visible in parent state.
Continue must use the actual selected/created entity without requiring a second
search.

### Visual and responsive direction

Use the supplied references as the visual and interaction system, not as
immutable screens. Favor light surfaces, dark navy/charcoal text, orange
primary actions, green positive states, blue information, amber warnings, red
errors, thin borders, subtle shadows, moderate radius, generous whitespace,
clear Inter-style typography, compact chips, and strong contextual search.
Avoid excessive gradients, shadows, badges, nested cards, clutter, and generic
school-portal styling.

Mobile should use thumb-friendly stacked layouts, bottom navigation where the
existing app supports it, progressive disclosure, and bottom-sheet filters when
appropriate. Desktop must not merely stretch mobile: use the existing platform
capabilities for persistent navigation, wider content, multi-column layouts,
comparison/context panels, and search/filter toolbars. Follow the project's
actual responsive conventions and breakpoints rather than inventing competing
ones.

Centralize or reuse tokens for primary/semantic colors, text, muted text,
border, background/surface, radius, spacing, typography, shadows, motion
durations, and easing. Reuse or improve shared components such as Button,
IconButton, Input/SearchInput, Chip, Badge, Card, domain/programme/opportunity/
school cards, MatchScore, ProgressIndicator, Tabs, Modal/BottomSheet, Toast,
EmptyState, LockedState, LoadingState, FilterBar, Sidebar, and navigation—only
where the pattern is actually reused.

### Interaction, motion, and accessibility

Every interactive element must communicate default, hover (where relevant),
focus, pressed, disabled, loading, success, error, empty, selected, saved, and
locked states as applicable. Empty states explain what happened and the next
action. Locked states explain what is locked, why, and how it unlocks.

Keep motion purposeful and restrained: roughly 200–300 ms fade/slide-up page
transitions, 150–250 ms card appearance, about 100 ms button press feedback,
subtle input-focus transitions, short error feedback, and unobtrusive success
toasts. Match existing animation libraries/conventions and honor
`prefers-reduced-motion` or the platform equivalent. Audit semantic roles,
heading hierarchy, accessible labels, visible focus, keyboard navigation,
screen-reader context, contrast, touch targets, validation/error recovery, and
reduced motion.

### Acceptance and verification standard

A screen is not complete because it resembles a mockup. It is complete only
when hierarchy, real data, interactions, state changes, navigation, loading,
errors, empty/locked states, persistence, responsiveness, accessibility, and
integration with the rest of the product work together.

Deliberately test relevant edge cases: no/one/many results, duplicates, long
text, special characters, empty/invalid input, slow/failed requests, retry,
double submission, Back/cancel, refresh, navigation away and return, existing
saved state, partial completion, mobile keyboard, small screens, large screens,
long programme names, and large datasets. Run the appropriate frontend/backend
checks from the Commands section and report any pre-existing failures separately.

Final implementation notes should include:

1. UX audit and severity of findings.
2. Updated navigation, information architecture, and user journeys.
3. Screen/component behavior map: states, events, data, side effects,
   navigation, persistence, and error recovery.
4. Visual references/mockups used and how they were adapted to real data.
5. Reusable components/tokens and motion/accessibility decisions.
6. Verification performed, known limitations, assumptions, and blocked work.

Do not overwrite the product with screenshots. Preserve correct functionality
and data behavior first, then improve usability and adapt the visual system
around reality. The full brief in `docs/` is authoritative for the complete
design rationale and detailed examples; this section is the operational
checklist Claude Code must follow automatically.

## JAMB Subject SQL Pipeline

The JAMB subject data is split between matchable picker rows and a complete
typed rule-record layer. SQL files are generated from
`data/career-mapping/`; they are not automatically executed in Supabase.

Apply the schema in this dependency order:

1. `backend/migration_career_base_registry.sql`
2. `backend/migration_subject_catalog.sql`
3. `backend/migration_career_pilot.sql`
4. `backend/migration_subject_rule_records.sql`
5. `backend/migration_student_pipeline_live.sql`

Then apply the subject data in this order:

1. `backend/seed_subject_catalog.sql`
2. `backend/seed_career_pilot.sql`
3. `backend/seed_subject_rule_records.sql`
4. `backend/seed_subject_options.sql`

Current generated coverage is 46 catalog subjects, 420 JAMB programme names,
9,130 unique university offerings, 596 national matcher options, 7,793 option
items, and 1,260 typed requirement records. The typed records preserve
conditions, cross-references, direct-entry requirements, source variants, and
14 explicitly source-missing layers. Only directly matchable records become
subject-picker options; missing source text must never be guessed.

`seed_subject_options.sql` is a replacement transaction for the two national
matcher tables. It is not an ordinary additive seed and requires a backup or
controlled deployment on an existing Supabase project.

After regenerating `seed_subject_options.sql`, run
`python data/career-mapping/_audit_subject_option_seed.py`. The audit checks
option capacity, named-source subject coverage, option-item foreign-key codes,
and that every emitted programme and requirement ID exists in the prerequisite
career seed, and that every option agrees with a matchable typed rule record.
A passing generator run alone is not sufficient. The runtime matcher also
fails closed when the typed rule layer is absent or stale, so both replacement
subject seeds must be deployed together.

After applying the SQL, verify the counts and foreign-key checks in
`backend/COMPLETE_DATA_MIGRATION_2026-08-17.md`. A successful local generator
run does not prove that Supabase has been updated; the SQL editor results are
the deployment proof.

## Career Resource SQL Migration

This repository does not use monolithic career-resource JSON or SQL files.
The resource population is partitioned so it remains pushable to GitHub.

### Source and generated artifacts

- JSON manifest: `data/career-mapping/learning_resource_population.manifest.json`
- JSON parts: `data/career-mapping/learning_resource_population_parts/part-*.json`
- JSON loader: `data/career-mapping/_learning_resource_population_io.py`
- SQL migration: `backend/migration_career_resources_v1.sql`
- SQL manifest: `backend/seed_career_resources_v1.manifest.json`
- SQL seed parts: `backend/seed_career_resources_v1_parts/part-*.sql`
- Full legacy files `learning_resource_population.json` and
  `seed_career_resources_v1.sql` are intentionally absent. Do not recreate
  them for deployment.

### Regenerate and validate

Run from the repository root after changing source data:

```powershell
python data/career-mapping/_build_learning_resource_population.py
python data/career-mapping/validate_career_resource_seed_gate.py
python data/career-mapping/_gen_career_resource_seed.py
python data/career-mapping/validate_career_resource_seed_gate.py
```

The builder recreates the JSON parts and checksum manifest. The SQL generator
loads those parts and recreates the ordered SQL parts and SQL manifest. The
gate must pass before applying or committing regenerated resource SQL. Expected
resource population: 160,914 rows, 160 visible domains, and zero validation
errors.

### Apply to Supabase

1. Apply `backend/migration_career_resources_v1.sql` once.
2. Apply `backend/migration_saved_resource_support.sql` after the `saved_items`
   table exists. It only permits canonical resource URLs to be stored as
   `resource` items; it does not invent or seed resource links.
3. Apply every file in `backend/seed_career_resources_v1_parts/` in numeric
   order, from `part-001.sql` through the final numbered part.
4. Keep each part's `BEGIN;` and `COMMIT;` transaction intact.
5. Do not paste JSON into Supabase. JSON is a build/audit input; the backend
   reads the seeded `skillup_dev.career_learning_resources` table.
6. Verify the final row count and orphan foreign-key checks using the queries
   in `backend/COMPLETE_DATA_MIGRATION_2026-08-17.md`.

### Git workflow for this migration

After validation, commit the manifests, parts, generator changes, and
documentation together. Push project changes to `origin/new-changes`. Leave
machine-local files such as `.claude/settings.local.json` uncommitted.
