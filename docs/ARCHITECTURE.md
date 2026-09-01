# Sifter LevelUp — System Design & Build Specification

> **Purpose.** This is the authoritative architecture document for
> Sifter LevelUp. It describes what exists, what we're building toward,
> and the path between them in enough detail to onboard a new engineer,
> brief a stakeholder, or drive a sprint. Everything else — CLAUDE.md,
> DEPLOY-SETUP.md, migration runbooks, per-domain briefs — refines a
> section of this document.
>
> **Owners.** Product engineering. Update this file in the same PR that
> changes the system.

---

## Document changelog

- **v2 (2026-08-20)** — Major product pivot. The platform is reframed as
  a **Career Intelligence Platform for Students**. Learning, gamification,
  crypto, wallets, community, feeds, portfolio, and merchandise are
  relegated from the primary surface. Auth simplifies to email + 2FA.
  Skills stop being a top-level layer and become embedded in Domains /
  Sub-groups / Roles. Offline becomes a platform-wide capability. School
  administrators become first-class users. See §4 for the governing
  principle, §17 for the feature-classification audit, and §25 for the
  revised migration path.
- **v1 (2026-08-19)** — Initial architecture document.

---

## The one-line product identity

> **Sifter LevelUp is a Career Intelligence Platform for Students** —
> a structured discovery journey from
> **Subjects → Mini Programmes / Programmes → Universities → Programme
> Overview → Domains → Sub-Groups → Roles → Embedded Skills →
> Opportunities → My World**.

Learning, gamification, crypto/Web3 experiences, community, feeds,
portfolio, and merchandise remain available where strategically useful,
but they no longer compete with or define the primary experience.

---

## Table of contents

**Part I — Context**
1. [Executive summary](#1-executive-summary)
2. [Product framing](#2-product-framing)
3. [Architecture principles](#3-architecture-principles)
4. [Governing principle & non-goals](#4-governing-principle--non-goals)

**Part II — Current system (as-is)**
5. [System context](#5-system-context)
6. [Container view](#6-container-view)
7. [Client architecture](#7-client-architecture)
8. [Backend architecture](#8-backend-architecture)
9. [Data architecture](#9-data-architecture)
10. [API design & response envelope](#10-api-design--response-envelope)
11. [Identity, auth & authorization](#11-identity-auth--authorization)
12. [Background jobs & schedules](#12-background-jobs--schedules)
13. [External integrations](#13-external-integrations)
14. [Deployment topology](#14-deployment-topology)
15. [Observability](#15-observability)
16. [Security posture](#16-security-posture)
17. [Feature classification (audit)](#17-feature-classification-audit)

**Part III — Target system (Career Intelligence-first)**
18. [Target principles](#18-target-principles)
19. [Target client architecture](#19-target-client-architecture)
20. [Target backend architecture](#20-target-backend-architecture)
21. [Platform-wide offline architecture](#21-platform-wide-offline-architecture)
22. [Content & intelligence pipeline](#22-content--intelligence-pipeline)
23. [Roles: student, school admin, staff](#23-roles-student-school-admin-staff)
24. [Performance & scale targets](#24-performance--scale-targets)

**Part IV — How we build it**
25. [Migration path](#25-migration-path)
26. [Definition of done, per phase](#26-definition-of-done-per-phase)
27. [Testing strategy](#27-testing-strategy)
28. [Release & rollback](#28-release--rollback)
29. [Governance](#29-governance)

**Part V — Reference**
30. [Endpoint inventory](#30-endpoint-inventory)
31. [Data model inventory](#31-data-model-inventory)
32. [Environment variables](#32-environment-variables)
33. [Directory layout](#33-directory-layout)
34. [Glossary](#34-glossary)
35. [Decision log](#35-decision-log)

---

# Part I — Context

## 1. Executive summary

Sifter LevelUp is a **Career Intelligence Platform for Students**. Its
job is to help a student move from what they already know — school
subjects, academic interests — toward a clear, personalised view of
possible programmes, universities, career domains, sub-groups, roles,
the skills those roles require, and the opportunities that follow.

Users progressively build a **My World** — a saved, personal exploration
space that grows as they discover.

The system is a **two-tier monolith**: an Expo React Native client
(native + web) and a FastAPI backend, sharing one Supabase Postgres and
one Redis. Background work runs in Celery. Everything runs on a single
self-hosted Ubuntu host (`storytime`) under systemd, with nginx +
certbot at the edge. This shape is deliberate — it matches the sibling
KYS deploy, keeps ops cheap, and defers orchestration until scale
forces it.

The **Skill Up learning surface** that gave the codebase its name still
exists in the architecture — its data, endpoints, and screens are not
gone. It is now a **supporting engagement mechanism**, not the product
identity. The same is true of gamification, crypto/wallet integrations,
community, feed, portfolio, and merchandise: retained where useful,
relegated from primary navigation, and never allowed to redefine what
the product is.

The **next arc of work** is a coordinated reframe:

- Rebrand the landing, onboarding, and primary navigation around Career
  Intelligence.
- Simplify auth to **email + 2FA**; retire wallet, Telegram, and Privy as
  primary channels.
- Consolidate the client onto a single navigation surface — the Career
  Intelligence surface.
- Redesign offline as a **platform-wide capability**, not a gaming-only
  fallback.
- Reorganise the API around the IA (Subjects → Programmes → Universities
  → Domains → Sub-groups → Roles → Embedded Skills → Opportunities →
  My World).
- Hide cutoffs, relegate pathways, drop labour-market fetches to a
  monthly cadence.
- Add school-administrator as a first-class user type on the same
  platform.
- Lock down admin surfaces, ship observability.
- Land the ~44 new endpoints that back the Career Intelligence model.

## 2. Product framing

### Audience

- **Primary — students.** Nigerian secondary (SS2/SS3) and undergraduate
  students exploring subjects, programmes, universities, career domains,
  and roles.
- **Primary — school administrators.** First-class users with role-based
  access to the same platform. Deliverable via the primary web app first,
  with room for a wrapped web app or dedicated mobile experience later.
- **Supporting — internal staff.** Curriculum, ops, moderation, content.

### Primary purpose

> **Career discovery through structured career intelligence.**

The learning loop, gamification, and any Web3 integrations exist in the
background as supporting capabilities. They must not compete with career
discovery for attention or dominate the initial experience.

### Information architecture

The one hierarchy the product surfaces — it drives the client's route
tree, the backend router groupings, and the data model:

```
Subjects
  → Mini Programmes / Programmes
    → Universities
      → Programme Overview
        → Domains
          → Sub-Groups
            → Roles
              → (Embedded Skills)
                → Opportunities
                  → My World  (personal saved exploration space)
```

**Skills are not a top-level layer.** They are embedded within Domains,
Sub-groups, and Roles, so a user discovers a skill in the context that
makes it relevant. Never create a standalone Skills discovery layer
alongside or above Domains/Sub-groups/Roles.

### Primary first-time user journey

1. **Landing**
2. **Authentication** (email + 2FA)
3. **Account selection / setup** (student or school admin)
4. **Subject selection**
5. **Mini Programmes and Universities**
6. **Programme overview**
7. **Domains and their skills**
8. **Sub-groups and their skills**
9. **Roles and their skills**
10. **Save to My World**

Navigation, state management, API routes, and offline caching are
organised to make this journey the primary path.

### Business drivers

- **Data honesty.** No fabricated content — real sources or an honest
  empty state. Reinforces the intelligence-platform positioning.
- **Universal offline resilience.** Career discovery must remain
  meaningfully usable offline (not just XP).
- **Institutional distribution.** Schools onboard cohorts and administer
  them via the same platform.
- **Extensibility, not premature integration.** Wallet / Telegram /
  chain integrations can return as opt-in surfaces later; keeping the
  architecture extensible matters more than shipping them now.

## 3. Architecture principles

Every decision traces back to one of these. When two conflict, the
earlier one wins.

1. **Real data or nothing.** If we don't have it, hide the surface or
   show an honest empty/locked state. Never fabricate examples into
   product copy.
2. **Server is the referee, client is the fast path.** The client moves
   ahead optimistically; the server owns the record and reconciles on
   sync.
3. **One surface per concern.** One navigation stack, one content
   pipeline, one auth middleware. Parallel systems are the failure
   mode; consolidate before adding.
4. **Migrations are code.** Every schema change ships as a numbered
   `migration_*.sql`, applied in order, verifiable in prod and dev the
   same way.
5. **Environments are cheap; data is not.** Dev and prod are as similar
   as possible in shape and as separate as possible in data. Prod is
   `vkgfw`, dev is `billy`.
6. **Explicit gating.** Admin, staff, and institution scopes enforced
   in middleware, not per endpoint.
7. **Boring infra.** Single VM, systemd, nginx, certbot. Complexity
   only when metrics force it.
8. **The design brief is law for UX.** Mockups are references; running
   code + real data are the source of truth.
9. **Offline is platform-wide.** Career discovery must work meaningfully
   offline, not only progression/XP.
10. **The API is generated, not hand-written on both sides.** Response
    models are typed; the client consumes generated wrappers.

## 4. Governing principle & non-goals

### Governing principle

> **Everything visible by default supports career intelligence and
> career discovery. Everything else must either support that mission or
> remain in the background.**

This applies to landing, authentication, onboarding, navigation, the
dashboard, the API surface, offline support, external integrations,
data models, search, discovery, recommendations, and future
prioritisation.

### The test for any surface

> Does this directly support the user's career intelligence and career
> discovery journey?

If not, it is backgrounded, retained for future use, or removed. See
§17 for the classification of every existing feature.

### Non-goals

Explicit constraints. Departures need an RFC (§29); drifting into them
accidentally is the failure mode.

- **The product is not a learning app, a game, a Web3 app, or a
  community.** These experiences exist as supporting capabilities;
  they may not define the primary product identity.
- **No wallet / chain auth as a primary path.** Base, Starknet, and
  Privy remain in the codebase as future or optional surfaces; they
  are not primary authentication or primary user-facing integrations.
- **No Telegram bot as a primary surface.** Retained for internal ops
  or future opt-in; not primary.
- **No standalone Skills discovery layer.** Skills are embedded in
  Domains / Sub-groups / Roles.
- **No cutoffs on the current user-facing surface.** Data isn't reliable
  enough yet; the schema remains, the UI does not.
- **No pathways in primary flows** until the experience is ready.
- **No Kubernetes / no orchestrator.** Single-VM systemd matches KYS
  and is intentional.
- **No microservice split.** The monolith is fine at this scale.
- **No parallel design system** or duplicate route tree.
- **No new system-of-record.** Supabase is authoritative; WatermelonDB
  is a local cache, DuckDB/Redis ephemeral.
- **No fabricated content** in any screen (Principle 1).
- **No Render / Netlify / Fly** as production deploy targets.

---

# Part II — Current system (as-is)

> **Read this part knowing that most of what is described was built for
> the Skill Up / crypto-learning framing.** Nothing on the server needs
> to be deleted overnight; §17 classifies each surface as **Core**,
> **Supporting**, **Future**, **Legacy / deprioritised**, or **Remove**,
> and Part IV sequences the reframe.

## 5. System context

The box is Sifter LevelUp. Outside it are user surfaces and external
services. In the target state (Part III), several of these external
surfaces move to Future.

### Actors

| Actor | Channel | Purpose | Target status |
|-------|---------|---------|---------------|
| Student | Mobile app · web (`dev.levelup.com.ng`, `levelup.com.ng`) | Career discovery, saving to My World | **Core** |
| School admin | Web app (role-based access) | Cohort provisioning, admin surfaces | **Core** (elevate from institutional-only) |
| Internal staff | Web app (admin routes) | Content ops, moderation, feedback triage | **Supporting** |
| Telegram bot | Telegram Web App handoff | Auth on-ramp | **Legacy** (retire from primary) |
| OAuth callback | Redirect callbacks | Career-profile evidence linking | **Future** (Google first when needed) |

### External systems

| System | Role | Failure mode | Target status |
|--------|------|--------------|---------------|
| Supabase Postgres | System-of-record | API 5xx; offline UI still renders | **Core** |
| Redis (localhost) | Celery broker + result backend; cache | Beat stalls; jobs queue on restart | **Core** |
| Resend | Transactional email (signup, 2FA, reset) | Signup 502; email flows blocked | **Core** (primary auth channel) |
| Airtable | Content ops UX | Sync stops; last-synced content stays live | **Supporting** |
| FCM | Push delivery | No pushes; in-app surfaces still work | **Supporting** |
| Labour-market data sources | Feeds `domain_demand_metrics` | Metrics go stale (monthly refresh) | **Core** (cadence: monthly) |
| Privy | Wallet + auth (RN + web) | Wallet auth blocked | **Future** (opt-in wallet only) |
| Base RPC | On-chain reads/writes for Base | Chain features degrade | **Future** |
| Starknet RPCs | Cairo builder track | Read-only fallback | **Future** |
| Coinbase Wallet SDK | Wallet connect | Alternative to Privy | **Future** |
| Telegram Bot API | initData verification | Telegram sign-in blocked | **Legacy** |
| GitHub / LinkedIn / Twitter / Instagram / FB / Medium / Reddit / Behance / Dribbble / Vimeo OAuth | Career-profile evidence | Profile linking blocked | **Future** (Google is the first re-addition) |

## 6. Container view

Inside the box: one API, one background worker, one database, one
broker, two client shells (native + web).

```
                     ┌─────────────────────────────────┐
    ┌──────────────▶ │   API — FastAPI (uvicorn)       │
    │                │   :8000 dev · :8001 prod         │
    │   HTTPS/JSON   │   inline handlers + ~15 routers  │
    │   JWT + X-Device-Id                                │
    │                └───────┬─────────────┬───────────┘
    │                        │             │
┌───┴───────────────┐        │             │
│  Client           │        │ SQL          │
│  Expo RN + Web    │        │ (service role)
│  SDK 51 · RN 0.74 │        ▼             ▼
│  expo-router +    │  ┌───────────┐  ┌─────────────┐
│  legacy screens   │  │ Postgres  │  │ Redis 6379  │
│  Zustand · SecureStore│ skillup_dev│  │ 12 dev/13 pr│
└──────────────────────┘  │ ~100 tables│  └──────┬──────┘
                          │ (Supabase) │         │
                          └───────────┘         │ broker + backend
                                                ▼
                                         ┌────────────────┐
                                         │ Celery worker  │
                                         │ Celery beat    │
                                         │ ~13 scheduled  │
                                         │ tasks          │
                                         └────────────────┘
```

Each container has a single systemd unit in prod
(`levelup-backend[-prod]`, `levelup-celery-worker[-prod]`,
`levelup-celery-beat[-prod]`). The web client is static
(`expo export --platform web` → `dist/`) served directly by nginx with
SPA fallback.

## 7. Client architecture

### Runtime

- Expo SDK 51, RN 0.74, TypeScript strict, path alias `@/*` → `src/*`,
  Reanimated plugin last in `babel.config.js`. New Architecture waits
  for Expo 55 (Part III).
- Notable deps: `expo-router`, `@tanstack/react-query`,
  `@nozbe/watermelondb`, `@privy-io/expo` (retiring), `@coinbase/wallet-mobile-sdk`
  (retiring), `@solana/web3.js` (retiring), `ethers` (retiring),
  `@supabase/supabase-js`, `@shopify/flash-list`, `expo-secure-store`,
  `expo-notifications`, `expo-local-authentication`, `react-native-passkeys`.

### Navigation — two surfaces today, one Career Intelligence surface tomorrow

- **`app/`** — expo-router file-based.
  - `(auth)` — sign-in, signup, forgot-password, onboarding (Core after reframe)
  - `(tabs)` — 14 tabs today (home, map, skills, portfolio, community,
    feed, fields, guild, myworld, opportunities, profile, settings,
    streaks, explore). **Most of these tabs are backgrounded post-reframe.**
    Core tabs: home (career discovery), explore, fields, myworld,
    opportunities, profile, settings.
  - `(admin)` — internal admin (Supporting)
  - Track roots — `cairo-builder-track`, `ecosystem-track`,
    `starknet-track`, `merchandise`, `skills`, `world`, `track-room`
    (**Legacy / Future** — see §17)
- **`src/screens/`** — ~40 legacy screens. Same classification applies
  per screen (Career/CareerProfile/CareerHome = Core; Home/Explore/
  Fields/MyWorld/Opportunities = Core; Portfolio/Community/GitHub/
  Guild/Interview/Track = Legacy or Supporting).

Post-reframe there is **one navigation surface — the Career
Intelligence surface**. Legacy screens migrate to `app/` or are
retired; parallel navigation for game/portfolio/community is deleted
from primary nav (may remain deep-linkable if the surface is retained).

### State

- **`authStore`** (Zustand) — token, profile, device ID, role
  (student / school-admin / staff).
- **`gameStore`** (Zustand) — legacy; kept while learning surface
  remains, moves to WatermelonDB observables.
- **`useAuth`** — React context wrapper.
- Post-reframe: server state via TanStack Query, local persisted state
  via WatermelonDB, ephemeral via component state.

### Data access & auth flow

Single Axios instance in `src/lib/api.ts`; base URL from
`EXPO_PUBLIC_API_URL`; attaches `Authorization` and `X-Device-Id` on
every request. On auth success, server returns `{ token, user, device_id }`;
token in SecureStore. Session middleware rejects mismatched device IDs
with 401 the client uses to clear state.

### Offline (partial today; platform-wide tomorrow)

- Today: XP writes hardened via PR #63 — buffered on-device, flushed on
  next connection, deduped server-side. Everything else assumes online.
- Target (§21): the **entire Career Intelligence surface** is offline-
  usable — saved programmes, universities, domains, sub-groups, roles,
  embedded skills, saved My World items, and cached opportunity data.

### Content

- Today: bundled in `src/data/*.ts` (levels, quantLevels, pythonLevels,
  islands).
- Target: **career intelligence data** flows from the server via typed
  endpoints and is cached in WatermelonDB; bundled crypto/quant lesson
  data is deleted after the learning surface is backgrounded.

## 8. Backend architecture

### Shape

Single FastAPI app in `backend/main.py`. Auth, users, and the core
game loop are inline on `app`; everything else is a domain router
attached via `include_router`. New routers live in `backend/routes/`;
older ones still at `backend/<name>_routes.py` — both are wired in
`main.py`. Consolidation into `backend/routes/` is Phase 2 in §25.

### Cross-cutting modules

| Module | Responsibility |
|--------|----------------|
| `config.py` | pydantic-settings; loads `.env`; single source of URLs, keys, flags |
| `database.py` | Supabase client factory; enforces `skillup_dev` schema |
| `auth.py` | JWT issue/verify; channel-specific verifiers |
| `middleware/session_middleware.py` | Validates `X-Device-Id` on every authenticated request |
| `middleware/device_sessions.py` | Device session model + helpers |
| `email_delivery.py`, `email_codes.py`, `db_email_codes.py` | Email code generation, Resend delivery, DB persistence |
| `fcm_service.py` | FCM push send |
| `crypto_utils.py` | EIP-191 / HMAC helpers |
| `celery_worker.py` | Celery app, task registry, beat schedule |
| `airtable_sync.py` | Airtable → Postgres content sync |

### Router groupings today (see §17 for target classification)

| Group | Routers | Post-reframe status |
|-------|---------|---------------------|
| **Identity** | inline `/api/auth/*`, `auth.py` | **Core** — simplify to email + 2FA |
| **User profile** | inline `/api/users/*`, `users_extra` | **Core** |
| **Career intelligence** | `career` (30 endpoints — largest router) | **Core** — grows |
| **Admissions & institutions** | `institutions` (19), `admission` (9), `provisioning` (25), `student_pipeline` (17) | **Core** for institutions/admission; **Supporting** for provisioning/pipeline |
| **Entrepreneurship** | `entrepreneurship` | **Supporting** |
| **Interview** | `interview` | **Supporting** (career prep) |
| **AI & scenarios** | `ai`, `scenarios` | **Supporting** (career prep) |
| **Content** | `content`, `airtable` | **Core** (career-intelligence content) |
| **Feedback** | `feedback` | **Core** (feeds intelligence quality) |
| **Devices & offline** | `device`, `offline`, `notifications` | **Core** (offline redesign) |
| **Game loop** | inline `/api/game/*`, `game_extra` | **Legacy / deprioritised** — supporting only |
| **Portfolio** | `portfolio`, `position`, `flags`, `reviews`, `analytics_extra` | **Legacy / deprioritised** |
| **Community & social** | `community`, `community_v2`, `social`, `social_blast`, `social_rewards`, `feed` | **Legacy / deprioritised** |
| **Gameplay layer** | `guild`, `boss`, `phase5` | **Legacy** |
| **Chain** | `starknet` | **Future** (keep extensibility, don't surface) |

### Middleware stack (order)

1. CORS (`ALLOWED_ORIGINS`)
2. Request ID (`logger.py`)
3. `SessionMiddleware` — device binding; skip list: `/health`,
   `/api/auth/*`, `/api/github/callback`
4. Route dispatch

## 9. Data architecture

### Store

- **Supabase Postgres**, schema `skillup_dev`, ~100 tables. Two
  projects: `billy` (dev, shared) and `vkgfw` (prod, isolated). RLS not
  used; API acts with service role, enforces at application layer.

### Tables by domain (representative)

Full regen in §31. Table groupings mapped to target IA:

- **IA — Subjects → Programmes → Universities → Programme Overview**:
  `jamb_programmes`, `jamb_programme_domain`, `application_windows`,
  `admission_snapshot_version`, `enrichment_version`,
  `course_competitiveness`, `institution_members`,
  `institution_member_invites`, `institution_verification_submissions`,
  `guidance_report_paths`
- **IA — Domains → Sub-groups → Roles → (Embedded skills)**:
  `domains`, `domain_roles`, `domain_subgroups`, `domain_tools`,
  `domain_certifications`, `domain_bridge_skills`,
  `domain_demand_metrics`, `domain_overlap`, `domain_source_registry`,
  `career_role_families`, `career_role_family_members`,
  `career_role_family_aliases`, `career_role_family_domains`,
  `computational_method_evidence`, `computational_role_subgroup_links`,
  `expert_profiles`, `elite_pathways`, `adjacent_prerequisites`,
  `bridge_plans`, `career_learning_resources` (160,914 rows — the
  authoritative resource index)
- **IA — Opportunities**: (opportunity tables backfill during Phase 6)
- **IA — My World** (new / to expand): saved-item tables per resource
  type, plus a unified `my_world_items` index
- **Identity**: `users`, `auth_email_codes`, `active_sessions`,
  `account_deletion_cooldowns`, `student_consent_requests`
- **Entrepreneurship (supporting)**: `entrepreneurship_roles`,
  `entrepreneurship_role_evidence`, `entrepreneurship_domain_coverage`,
  `entrepreneurship_entitlement_config`,
  `entrepreneurship_evidence_registry`,
  `entrepreneurship_institution_engagement`
- **Interview (supporting)**: `interview_questions`,
  `interview_sessions`
- **Content / cache**: `content_cache`, `mapping_feedback`
- **Legacy progression**: `game_states`, `level_scores`,
  `daily_xp_caps`, `challenges`, `challenge_participants`, `badges`,
  `claim_codes` — retained for the backgrounded engagement layer
- **Legacy community/feed**: `feed_items`, `feed_interactions` —
  retained but not surfaced primary

### Migrations

Flat `backend/migration_*.sql` (~40). Order in `MIGRATION_RUNBOOK.md`.
Forward-only by convention. Career-resource seed partitioned into ~1000
numbered SQL parts under `backend/seed_career_resources_v1_parts/`;
each keeps its own `BEGIN;/COMMIT;`. Regeneration + validate gate in
CLAUDE.md.

### Lifecycle

PII (email, name, school, phone) never in URLs, query strings, or logs.
`DELETE /api/users/me` triggers a cooldown; hard delete after via
`cleanup_expired_sessions`. Content cache expires weekly on Sunday via
`expire_old_sync_log`.

## 10. API design & response envelope

### Conventions

- **Base path**: `/api/`. Health at `/health`, no auth.
- **Auth**: `Authorization: Bearer <JWT>` + `X-Device-Id`.
- **Content type**: JSON only.
- **Pagination**: opaque cursor for unbounded lists.
- **Idempotency**: `Idempotency-Key` on retryable mutations.
- **Versioning**: URL-based when breaking (`community_v2` is
  precedent).
- **OpenAPI**: auto-generated at `/docs` (dev). Phase 8 (§25) codifies
  response models so the client consumes generated wrappers.

### Envelope

```
{ "success": true,  "data": { ... }, "error": null }
{ "success": false, "data": null,    "error": { "code": "...", "message": "..." } }
```

Domain errors are HTTP 200 with `success: false`; transport / auth /
validation failures return 4xx/5xx separately.

### Target router organisation (§20)

Post-reframe the primary surface is organised around the IA — read
paths named after what the user sees:

```
/api/subjects
/api/programmes
/api/programmes/{id}/universities
/api/programmes/{id}/overview
/api/universities/{id}
/api/domains
/api/domains/{id}/subgroups
/api/domains/{id}/roles
/api/roles/{id}         # embedded skills come with the role payload
/api/subgroups/{id}     # embedded skills come with the subgroup payload
/api/opportunities
/api/me/world           # My World read
/api/me/world/items     # save / unsave / list
/api/labour-market/…    # aggregated intelligence
```

Legacy `game`, `portfolio`, `community`, `feed`, `social*`, `guild`,
`boss`, `phase5`, `starknet` routes stay mounted but are not exposed on
the primary client navigation.

## 11. Identity, auth & authorization

### Channels — current vs. target

| Channel | Endpoint | Verification | Post-reframe status |
|---------|----------|--------------|---------------------|
| **Email + password** | `POST /api/auth/signup`, `POST /api/auth/login` | Argon2 hash; email confirmation via code | **Core — primary** |
| **Email code / 2FA** | `POST /api/auth/email-code/request`, `POST /api/auth/mfa/*` | Resend delivery; TTL + max-attempts | **Core — primary** |
| **Password reset** | `POST /api/auth/password-reset/{request,confirm}` | Resend delivery; TTL | **Core** |
| **Guest** | `POST /api/auth/guest` | Auto-provision anonymous, upgradeable | **Supporting** (still enables no-friction exploration) |
| **Google (planned)** | — | OAuth 2.0 | **Future** — first re-addition when we need social sign-in |
| **Telegram Web App** | `POST /api/auth/telegram` | HMAC over initData | **Legacy** — retire from primary UI |
| **Base wallet** | `POST /api/auth/base-wallet` | EIP-191 signature | **Legacy** — retire from primary UI |
| **Privy** | (SDK) | Server verifies with `PRIVY_VERIFICATION_KEY` | **Legacy / Future** — retained for optional wallet features |

### Session model

- All active channels issue the same internal JWT (HS256; TTL drops
  from 90d → ~1d access + 30d refresh in Phase 8).
- JWT carries `user_id`, `device_id`, `role`, `iat`, `exp`.
- Device binding via `SessionMiddleware` + `active_sessions`.
- `SINGLE_DEVICE_ENFORCEMENT` on in prod.
- Passkeys wired via `react-native-passkeys` — promote alongside email
  + 2FA when the platform supports it.

### Authorization tiers (target)

- **Anonymous** — only `/health`, `/api/auth/*`.
- **Guest** — read the discovery surface; can't save to My World until
  they upgrade.
- **Student** — full Career Intelligence surface including My World.
- **School admin** — student surface + cohort provisioning, invites,
  cohort dashboards, verification submissions. Scoped by
  `institution_id` on the JWT and enforced via
  `require_institution_member` middleware.
- **Internal staff** — admin surface + content ops + moderation +
  feedback triage. Gated in middleware via `require_staff`.
- **Admin (super)** — full admin surface + audit log export.
  Middleware-enforced via `require_admin`.

## 12. Background jobs & schedules

Celery consumes from Redis DB 12 (dev) or 13 (prod). Post-reframe the
schedule below changes cadence for labour-market data and quietens the
Skill Up loop; targets in **bold**.

| Job | Cron today | **Target cadence** | Purpose |
|-----|-----------|--------------------|---------|
| `reset_daily_quests` | daily 00:00 | daily (only if game surface retained) | Reset per-day XP caps, quests, streak grace |
| `update_guild_ranks` | daily 01:00 | **retire** | Guild leaderboards (Legacy) |
| `cleanup_notifications` | Mon 02:00 | **weekly** (keep) | Prune old FCM/in-app notifications |
| `process_withdrawals` | every 4h | **daily** or retire | Portfolio (Legacy) |
| `sync_airtable` | every N min | **hourly** default | Airtable → content tables |
| `cleanup_expired_sessions` | daily 03:30 | daily | Drop expired `active_sessions` |
| `ingest_track_feeds` | every 2h :15 | **daily** or retire | External track feeds (Legacy) |
| `expire_old_sync_log` | Sun 04:00 | Sun 04:00 | Offline sync log retention |
| `fetch_labour_market_demand` | every 6h :30 | **monthly** (first of month 03:00) | Refresh `domain_demand_metrics` |
| `compute_elite_composite` | daily 05:00 | **weekly** | Elite pathway rollups |
| `compile_admission_snapshot` | Jan 15 10:00 | Jan 15 10:00 | Annual admissions snapshot |
| `check_enrichment_freshness` | Mon 06:00 | Mon 06:00 | Alert on stale enrichment |
| `reconcile_student_merge_candidates` | every 6h :10 | **daily** | Merge duplicate student records |

### Labour-market intelligence model (§22, target)

- Initial ingestion runs once per source.
- Normalisation + validation gate before promotion.
- **Monthly refresh** is the default cadence.
- Change detection where the source supports it.
- Historical snapshots preserved via `enrichment_version`.
- Manual refresh available for exceptional cases.

Rationale: labour-market data does not change on a 6-hour horizon;
constant fetching burns API quota and adds noise.

## 13. External integrations

| Integration | Where | Failure mode | Target |
|-------------|-------|--------------|--------|
| Supabase | `database.py` | 5xx; offline surfaces still render | **Core** |
| Redis | `celery_worker.py` | Beat stalls; jobs queue after restart | **Core** |
| Resend | `email_delivery.py` | Signup 502 | **Core** (primary auth channel) |
| Airtable | `airtable_sync.py` | Sync stops; last-synced content stays live | **Supporting** |
| FCM | `fcm_service.py` | No pushes; in-app feed still delivered | **Supporting** |
| Labour-market data sources | `fetch_labour_market_demand` | Metrics go stale (monthly refresh) | **Core** |
| Google OAuth | (planned) | Auth degrades to email + password | **Future** |
| Privy | `@privy-io/expo` | Wallet auth blocked | **Future** (opt-in wallet only) |
| Base RPC | chain 8453 | Chain features degrade | **Future** |
| Starknet RPCs | pooled | Cairo track read-only | **Future** |
| Coinbase Wallet SDK | `wallet-mobile-sdk` | Wallet connect blocked | **Future** |
| Telegram | HMAC | Sign-in blocked | **Legacy** |
| GitHub / LinkedIn / Twitter / Instagram / FB / Medium / Reddit / Behance / Dribbble / Vimeo OAuth | `config.py` | Profile-evidence linking blocked | **Future** |

## 14. Deployment topology

Full detail in [`DEPLOY-SETUP.md`](../DEPLOY-SETUP.md). Single VM
(`storytime`, `52.18.195.224`, user `ubuntu`) shared with KYS.

| Env | Web | API | Port | Supabase | Redis |
|-----|-----|-----|------|----------|-------|
| dev | `dev.levelup.com.ng` | `api.dev.levelup.com.ng` | `:8000` | billy | db 12 |
| prod | `levelup.com.ng` | `api.levelup.com.ng` | `:8001` | vkgfw | db 13 |

- **systemd**: `levelup-backend[-prod]`, `levelup-celery-worker[-prod]`,
  `levelup-celery-beat[-prod]`
- **nginx**: `levelup-api-{dev,prod}`, `levelup-web-{dev,prod}`; TLS via
  certbot
- **paths**: `~/levelup-backend[-prod]` (uvicorn + .env + .venv + logs),
  `~/levelup-frontend[-prod]` (nginx root)
- **CI/CD**: GitHub Actions → SSH/rsync → systemd. Dev on push to
  `main`; prod on `git tag v*` (production env has required reviewer).
- **EAS**: manual per team decision; web target validates in CI.
- **Redis DB indices are load-bearing**: storytime `0–9`, KYS
  `10/11`, LevelUp `12/13`.

## 15. Observability

**Today.** Structured JSON logs via `logger.py` to `logs/`, rotated by
systemd. No off-box shipping. No app metrics. No alerting.
`check_enrichment_freshness` is the closest to a health signal.

**Target (Phase 8).** Request-ID middleware on every response. Log
shipping to storytime's pipeline (same as KYS). Celery task metrics.
FCM delivery observability. Off-box uptime probe on `/health`.

## 16. Security posture

### Secrets

Per-environment `.env` on the host, written once via `ENV_FILE` GitHub
secret, never overwritten by CI. Rotation manual. Shai-Hulud incident
(2026-06-25) forced a GitHub-token rotation across eight orgs — treat
GitHub tokens as high-value.

### PII & wallets

PII collected: email, name, school, phone. Never in URLs, logs, or
errors. `DELETE /api/users/me` is a real delete after cooldown, not a
soft flag. We never hold private keys — Privy custody or user-held
(wallet paths remain in the code as Future).

### Threat model (informal)

| Threat | Control today | Gap |
|--------|---------------|-----|
| Session theft | Device binding, single-device enforcement | 90d JWT (long, but bound) — refresh model in Phase 8 |
| Signature replay (auth) | Server nonce; short TTL | OK; only matters for retained wallet paths |
| Content injection | Airtable trusted; moderation | No formal moderation queue |
| API data exfil | Service role + app checks | No RLS; app is last line |
| Admin misuse | Per-endpoint gating | No audit log |
| Cross-tenant leakage (school admin ↔ another institution) | Per-endpoint scoping (fragile) | `require_institution_member` middleware in Phase 5 |
| RPC MITM | HTTPS RPC + Privy | Only matters if chain paths return to Core |

## 17. Feature classification (audit)

Every surface classified against the governing principle (§4). This
table is the authoritative audit that drives Part IV. Statuses:

- **Core** — keep and prioritise; primary user surface.
- **Supporting** — retain, keep in the background.
- **Future** — preserve architectural extensibility, do not surface.
- **Legacy / deprioritised** — remove from primary flows; may remain
  deep-linkable if the surface is retained.
- **Remove** — no longer useful; delete at first safe opportunity.

### Client — screens & routes

| Surface | Status | Notes |
|---------|--------|-------|
| `app/(auth)/*` (sign-in, signup, forgot-password, onboarding) | **Core** | Simplify to email + 2FA |
| `app/(tabs)/home` | **Core** | Reframe as Career Intelligence dashboard |
| `app/(tabs)/explore` | **Core** | Discovery entry point |
| `app/(tabs)/fields` | **Core** | Domains / sub-groups / roles browser |
| `app/(tabs)/myworld` | **Core** | Personal saved exploration space |
| `app/(tabs)/opportunities` | **Core** | Opportunity discovery |
| `app/(tabs)/profile` | **Core** | User + role settings |
| `app/(tabs)/settings` | **Core** | |
| `app/(tabs)/skills` | **Legacy** | Skills are embedded; no standalone tab. Remove from primary nav |
| `app/(tabs)/map` | **Legacy** | Duolingo-style skill-tree map — background |
| `app/(tabs)/portfolio` | **Legacy** | Remove from primary nav |
| `app/(tabs)/community` | **Legacy** | Remove from primary nav |
| `app/(tabs)/feed` | **Legacy** | Remove from primary nav |
| `app/(tabs)/guild` | **Legacy** | Remove from primary nav |
| `app/(tabs)/streaks` | **Legacy** | Remove from primary nav |
| `app/cairo-builder-track` | **Future** | Retain extensibility, no primary surface |
| `app/starknet-track` | **Future** | Same |
| `app/ecosystem-track` | **Future** | Same |
| `app/merchandise` | **Legacy** | Not a career intelligence surface |
| `app/track-room` | **Legacy** | |
| `app/world` | **Legacy** | Distinct from My World — rename or remove |
| `app/(admin)/*` | **Core** | Elevate; add school-admin scopes |
| `src/screens/HomeScreen`, `IslandMapScreen`, `QuantMapScreen` | **Legacy** | Skill Up map framing |
| `src/screens/LessonScreen` | **Supporting** | Retained learning surface, not primary |
| `src/screens/CareerHomeScreen`, `CareerProfileScreen`, `careerIntelligence/*` | **Core** | Rename and elevate |
| `src/screens/ExploreScreen`, `FieldsScreen`, `MyWorldScreen`, `OpportunitiesScreen` | **Core** | Migrate to `app/(tabs)/*` under Phase 3 |
| `src/screens/PortfolioHubScreen`, `PortfolioScreen`, `CommunityScreen`, `FeedScreen`, `GuildScreen`, `GitHubScreen`, `StreaksScreen`, `LeaderboardScreen`, `DiaryScreen` | **Legacy** | |
| `src/screens/InterviewModeScreen` | **Supporting** | Career prep |
| `src/screens/StarknetTrackScreen`, `CairoBuilderTrackScreen`, `DownloadTrackScreen`, `PostIslandTrackSelection` | **Future / Legacy** | `EcosystemTrackScreen` was deleted — it was unrouted and unreferenced, and its static import pulled a 1.1MB lesson corpus toward the web entry chunk |
| `src/screens/MerchandiseScreen` | **Legacy** | |
| `src/screens/ReferralScreen` | **Supporting** | If retained, background |
| `src/screens/admin/*` | **Core** | Elevate |
| `src/data/levels.ts`, `quantLevels.ts`, `pythonLevels.ts`, `islands.ts` | **Remove** (after learning surface backgrounded) | Bundled crypto/quant lesson content |

### Backend routers

| Router | Status | Notes |
|--------|--------|-------|
| inline `/api/auth/*` (email, password, 2FA, reset, guest) | **Core** | Simplify: only email + 2FA primary |
| inline `/api/auth/telegram` | **Legacy** | Retire from client UI |
| inline `/api/auth/base-wallet` | **Legacy** | Retire from client UI |
| inline `/api/users/*`, `users_extra` | **Core** | |
| inline `/api/game/*`, `game_extra` | **Legacy / Supporting** | Behind the learning surface |
| `career` | **Core — highest priority** | Grows to power IA reads |
| `institutions` | **Core** | Universities / schools |
| `admission` | **Core** | Programme requirements |
| `provisioning` | **Supporting** | Institutional onboarding |
| `student_pipeline` | **Supporting** | |
| `entrepreneurship` | **Supporting** | Career-adjacent |
| `interview` | **Supporting** | Career prep |
| `ai`, `scenarios` | **Supporting** | Career prep |
| `content`, `airtable` | **Core** | Career intelligence content pipeline |
| `feedback` | **Core** | Feeds intelligence quality |
| `device`, `offline`, `notifications` | **Core** | Offline redesign |
| `portfolio`, `position`, `flags`, `reviews`, `analytics_extra` | **Legacy** | |
| `community`, `community_v2`, `social`, `social_blast`, `social_rewards` | **Legacy** | |
| `feed` | **Legacy** | |
| `guild`, `boss`, `phase5` | **Legacy** | |
| `starknet` | **Future** | |

### External integrations

| Integration | Status | Notes |
|-------------|--------|-------|
| Supabase, Redis, Resend | **Core** | |
| Airtable, FCM | **Supporting** | |
| Labour-market data sources | **Core** (monthly cadence) | |
| Google OAuth | **Future — first re-addition** | |
| Privy, Base RPC, Starknet RPCs, Coinbase Wallet SDK | **Future** | |
| Telegram Bot | **Legacy** | |
| GitHub / LinkedIn / Twitter / Instagram / FB / Medium / Reddit / Behance / Dribbble / Vimeo OAuth | **Future** | Add on demand |

### Data — kept, backgrounded, hidden

| Data | Status | Notes |
|------|--------|-------|
| Career-intelligence tables (see §9) | **Core** | Primary IA |
| Cutoff data (schema retained) | **Hidden** | Do not expose in UI; keep the tables |
| Pathways (schema retained) | **Hidden** | Same — relegate the experience |
| `game_states`, `level_scores`, `daily_xp_caps`, `challenges`, `badges` | **Supporting** | Only if engagement layer retained |
| `feed_items`, `feed_interactions` | **Legacy** | |
| Portfolio tables | **Legacy** | |

---

# Part III — Target system (Career Intelligence-first)

## 18. Target principles

Same as §3, applied through the governing principle in §4. The client
lands, authenticates, onboards, and navigates as a Career Intelligence
Platform. Everything else supports that mission or lives in the
background.

## 19. Target client architecture

- **Expo 55 / RN 0.83 / React 19.** New Architecture on by default. Do
  **after** the offline redesign so WatermelonDB lands on the current
  arch first.
- **One navigation surface — Career Intelligence.** Primary tabs:
  Discover, Fields (Domains / Sub-groups / Roles), Opportunities, My
  World, Profile. Everything else is deep-linkable or removed from
  primary nav.
- **State**: server via TanStack Query; local persisted via
  WatermelonDB; ephemeral via component state; auth in SecureStore +
  Zustand.
- **Career-intelligence data** flows from the server via typed
  endpoints, cached in WatermelonDB.
- **Auth** unified on email + 2FA; passkeys promoted where supported;
  Google as the first Future addition.
- **Design** — Compass tokens the only source of truth.

### Primary route tree (target)

```
app/
├── (auth)/
│   ├── sign-in.tsx           # email + password, or magic code
│   ├── signup.tsx
│   ├── forgot-password.tsx
│   ├── mfa.tsx               # 2FA challenge
│   └── onboarding.tsx        # role choice → subjects → discovery
├── (tabs)/
│   ├── discover.tsx          # home — recommendations + entry points
│   ├── fields/               # Domains / Sub-groups / Roles browser
│   │   ├── index.tsx
│   │   ├── [domainId].tsx
│   │   ├── [domainId]/subgroups/[subgroupId].tsx
│   │   └── roles/[roleId].tsx
│   ├── programmes/
│   │   ├── index.tsx
│   │   ├── [programmeId].tsx
│   │   └── [programmeId]/universities/[universityId].tsx
│   ├── opportunities/
│   │   ├── index.tsx
│   │   └── [opportunityId].tsx
│   ├── my-world/
│   │   ├── index.tsx
│   │   └── [itemId].tsx
│   └── profile.tsx
├── (admin)/                  # staff + school admin surfaces
│   ├── cohorts/
│   ├── invites/
│   ├── verification/
│   ├── content/
│   ├── feedback/
│   └── audit/
├── _layout.tsx
└── index.tsx                 # landing
```

Legacy `(tabs)` — portfolio, community, feed, guild, streaks, map, skills,
merchandise — are removed from primary navigation. Any code retained is
deep-linkable or lives under a "More" surface.

## 20. Target backend architecture

- **Same monolith.** No microservice split.
- **Routers reorganised around IA** (see §10). New primary routers:
  `subjects`, `programmes`, `universities`, `domains`, `subgroups`,
  `roles`, `opportunities`, `me_world`, `labour_market`. Existing
  `career`, `institutions`, `admission`, `content` routers wrap the
  compute.
- **Legacy routers stay mounted** — `game`, `portfolio`, `community`,
  `feed`, `social*`, `guild`, `boss`, `phase5`, `starknet` — but are
  not exposed in the primary client navigation.
- **All admin routes** enforced by `require_admin` / `require_staff` /
  `require_institution_member` middleware; `audit_log` records every
  action.
- **Typed response models** for every endpoint; OpenAPI is
  authoritative; client wrappers generated.
- **`Idempotency-Key`** on every retryable mutation.
- **Refresh-token model** — JWT drops from 90d to ~1d access + 30d
  refresh, rotating on use.

## 21. Platform-wide offline architecture

Offline is no longer a gaming-only fallback. The **entire Career
Intelligence surface** is offline-usable.

### What's offline-usable

- Saved programmes, universities, and their overviews
- Domains, sub-groups, roles the user has visited or saved
- Skills embedded in those (roles include skills; sub-groups include
  skills; domains include skills)
- Saved My World items — the full personal exploration space
- Cached opportunities where the platform has visibility
- Core navigation and discovery flows
- Any assessment / journal-style writes the user makes

### Sync protocol (`offline_router`)

- `POST /api/offline/pull` — server returns deltas since a client
  watermark plus authoritative reconciliations.
- `POST /api/offline/push` — client sends a batch of local mutations
  (client id, device id, idempotency key); server returns
  accepted / rejected / merged per mutation.

### Storage

- **WatermelonDB** on the client, schemas mirroring the read side of
  the career-intelligence model (`subjects`, `programmes`,
  `universities`, `domains`, `subgroups`, `roles`, `skills`,
  `opportunities`, `my_world_items`).
- **Cache eviction**: LRU per resource type, respect a device-storage
  budget, always keep My World items.
- **Progressive availability**: content sync in the background;
  discovery surfaces render partial with a "loading more" state.
- **Conflict resolution**: server wins on state, client wins on
  intent; a rejected mutation surfaces to the user with an actionable
  message.

## 22. Content & intelligence pipeline

- **Airtable** stays as the ops UX where humans curate.
- **Celery `sync_airtable`** hydrates `content_*` and career-intelligence
  tables.
- **`content_router` + IA routers** serve everything to the client via
  typed endpoints, cached in WatermelonDB.
- **Bundled `src/data/*.ts` (crypto/quant lesson content) is removed**
  after the learning surface is backgrounded.
- **Versioning**: every content unit carries a `content_version`;
  client refetches when the head moves.

### Labour-market intelligence

- **Monthly refresh** by default (first of month, 03:00 UTC).
- Change detection where source supports it.
- Historical snapshots preserved via `enrichment_version`.
- Manual / exceptional refresh available via an admin action.

### Cutoffs & pathways

- **Cutoffs**: schema retained; UI hidden until data reliability meets
  the bar.
- **Pathways**: schema retained; primary UI relegated until the
  experience is ready.

## 23. Roles: student, school admin, staff

The platform is one system with role-based experience — not a separate
platform per user type.

- **Student** (default) — Discover, Fields, Programmes, Universities,
  Opportunities, My World, Profile.
- **School administrator** — Student surface, plus:
  - Cohort provisioning (`provisioning` router)
  - Invite management (`institution_member_invites`)
  - Verification submissions (`institution_verification_submissions`)
  - Cohort dashboards + student pipeline (`student_pipeline`)
  - Scoped by `institution_id` on the JWT
- **Internal staff / admin** — Student surface, plus content ops,
  moderation, feedback triage, audit-log export.
- **Delivery** — primary web app first with role-based access. Wrapped
  web or dedicated mobile experience is a Future consideration; the
  underlying architecture supports all three without a platform fork.

## 24. Performance & scale targets

| Surface | p50 | p95 | Notes |
|---------|-----|-----|-------|
| `/api/domains` (list) | 200 ms | 600 ms | Cursor pagination, cached |
| `/api/roles/{id}` (with embedded skills) | 250 ms | 700 ms | Single-role read |
| `/api/programmes/{id}/universities` | 250 ms | 800 ms | Backed by `institution_*` + `jamb_*` |
| `/api/opportunities` search | 400 ms | 1.2 s | With filters |
| `/api/me/world` (list) | 150 ms | 400 ms | User-scoped; small |
| `/api/offline/pull` | 300 ms | 1 s | Batched deltas |
| Cold app start | 2 s | 4 s | Post-Expo 55 + Hermes |
| Discovery interaction | 60 fps | 60 fps | List virtualisation via FlashList |

**Scale.** Hundreds of users today; design for ~50k active in year one,
including school-admin cohorts. Reads dominated by career-intelligence
and content; add Redis read-through if p95 slips. Writes dominated by
saved-item + My World mutations; the offline path batches these. One
Supabase instance suffices; monitor `career_learning_resources` query
plans as domain filters grow.

---

# Part IV — How we build it

## 25. Migration path

Ordered by dependency, not calendar. Each phase is independently
releasable; do not batch. Definition of done per phase in §26.

### Phase 0 — Guardrails (in flight)

- Green CI on frontend (tsc, jest, web build) and backend (pytest, ruff).
- Land every pending migration on `vkgfw` before any `v*` deploy.
- Audit every config path for `redis://…/0`; must be 12 (dev) or 13
  (prod).
- Land outstanding LevelUp v2 admin patches.

### Phase 1 — Product reframe (identity, landing, primary nav)

The visible layer of the pivot. Ship this before the deeper changes so
users, stakeholders, and the team all see the same product.

- Rebrand landing, onboarding copy, and app metadata around Career
  Intelligence.
- Rewrite primary navigation: **Discover, Fields, Programmes,
  Opportunities, My World, Profile**. Remove portfolio, community,
  feed, guild, streaks, map, skills, merchandise from the tab bar.
- Hide cutoffs UI (schema retained).
- Relegate pathways (schema retained; no primary surface).
- Move learning surface behind a "More" or backgrounded entry point.
- Update store metadata and marketing surface.

### Phase 2 — Auth simplification (email + 2FA only in primary)

- Primary auth = email + password + 2FA + password reset.
- Retain `guest` as a supporting path.
- Remove Telegram, Base wallet, Privy from the client sign-in UI.
- Leave server endpoints mounted for now (Future); mark deprecated in
  OpenAPI.
- Prepare Google OAuth as the first Future addition (behind a flag).

### Phase 3 — Consolidate navigation & migrate legacy screens

- Inventory every `src/screens/*` file and its call sites.
- Map each screen to a target route in `app/`.
- Migrate leaf-first, keeping `authStore` / `gameStore` contracts
  intact.
- Delete each legacy screen after its expo-router replacement passes
  smoke tests.
- Do not add a third surface.

### Phase 4 — Backend router reorganisation around IA

- Introduce the IA-shaped routers (`subjects`, `programmes`,
  `universities`, `domains`, `subgroups`, `roles`, `opportunities`,
  `me_world`, `labour_market`). Delegate compute to existing
  `career`, `institutions`, `admission`, `content` routers.
- Server-backed career-intelligence content flows through these
  routers; client consumes typed wrappers.
- Legacy routers (`game`, `portfolio`, `community`, `feed`, `social*`,
  `guild`, `boss`, `phase5`, `starknet`) stay mounted; mark
  deprecated in OpenAPI, remove from primary client calls.

### Phase 5 — Platform-wide offline (WatermelonDB across the IA)

- WatermelonDB schemas mirror the target career-intelligence data
  model.
- All career-intelligence reads and writes go through the sync
  protocol.
- My World is fully offline-usable.
- LRU cache eviction respecting a device-storage budget; always
  preserve My World.
- Deprecate direct `POST /api/game/*` from the client (already partly
  handled via PR #63).

### Phase 6 — School administrator as a first-class role

- Role added to JWT: `student | school_admin | staff | admin`.
- `require_institution_member` middleware enforces cross-tenant
  boundary.
- Admin surface under `app/(admin)/*` exposes cohort provisioning,
  invites, verification, cohort dashboards, student pipeline.
- Delivery: primary web app first; the architecture stays open to a
  wrapped web app or dedicated mobile experience later.

### Phase 7 — Labour-market cadence + intelligence quality

- Move `fetch_labour_market_demand` from every 6h to monthly (first of
  month, 03:00 UTC).
- Add change-detection where sources support it.
- Preserve historical snapshots via `enrichment_version`.
- Manual-refresh admin action for exceptional cases.
- `check_enrichment_freshness` becomes a monthly alert threshold, not
  weekly.

### Phase 8 — Admin lockdown, audit, observability

- `require_admin` / `require_staff` / `require_institution_member`
  middleware everywhere; deny-by-default.
- `audit_log` table + unified event stream; backfill missing entries
  where migrations already wrote data.
- Ship structured logs off-box (join storytime's log pipeline).
- Celery task metrics; FCM delivery observability; `/health` uptime
  probe.
- Move JWT from 90d to ~1d access + 30d refresh.

### Phase 9 — Platform upgrade (Expo 55 / RN 0.83 / React 19)

- Do this **after** offline lands.
- Follow the react-native-expo breaking-change matrix.
- Manual EAS; Netlify preview validates web target.
- Snapshot performance before/after — hero surfaces stay at 60 fps.

### Phase 10 — 44 new endpoints (Career Intelligence v2)

- Depends on IA-router reorganisation (Phase 4), offline (Phase 5),
  admin gating (Phase 8).
- Grouped under IA routers; each endpoint gets an OpenAPI-typed
  response model; client consumes a generated wrapper.
- Feature-flag user-visible rollouts.

### Phase 11 — Retire or archive Legacy surfaces

Only after Phases 1–10 are stable and telemetry shows no primary use:

- Delete `src/data/*.ts` crypto/quant lesson bundles.
- Remove or archive `guild`, `boss`, `phase5`, `starknet`, `portfolio`,
  `community`, `feed`, `social*` routers if telemetry confirms zero
  primary use.
- Retain the tables (`game_states`, `feed_items`, etc.) unless a
  storage audit says otherwise; deleting user data is a one-way door.

## 26. Definition of done, per phase

Every phase completes only when all are true:

- **Migrations applied** on both `billy` and `vkgfw`, verified in
  Supabase, recorded in `MIGRATION_RUNBOOK.md`.
- **Endpoints documented** in §30 with a request / response shape.
- **Tests green** — pytest, jest, tsc, web build.
- **Docs updated** — this file plus the domain brief in `docs/`.
- **Feature flag decisioned** — either flagged for rollout or removed.
- **Rollback plan** — for schema-breaking work, an explicit down path.
- **Telemetry** — a request-log entry or metric to observe the surface
  in prod.
- **Product framing check** — the change does not reintroduce Skill Up
  / gaming / crypto framing to the primary surface (governing
  principle, §4).

## 27. Testing strategy

### Backend

- **Unit**: pure logic, no network, mock Supabase at the boundary.
- **Integration**: real Supabase test project or Postgres in Docker;
  covers migrations end-to-end.
- **Contract**: envelope, JWT verification paths, admin gating,
  cross-tenant boundary (school-admin scoping).
- **Do not mock what you can run** — prefer real Postgres.

### Frontend

- **Type check**: `npx tsc --noEmit`.
- **Unit**: Jest + Testing Library for hooks / reducers / utilities.
- **Screen tests**: only where branching logic warrants; snapshots
  banned.
- **Web build**: `expo export --platform web` is the last CI gate.
- **Manual**: EAS build + on-device smoke test before every release
  tag.

### End-to-end (target)

- Detox on-device for the primary journey (Landing → Auth → Subject
  select → Programmes → Universities → Programme overview → Domain →
  Sub-group → Role → Save to My World). Add during Phase 9.

## 28. Release & rollback

### Cadence

- **Dev** — every push to `main` deploys to `dev.levelup.com.ng`.
- **Prod** — `git tag v*` deploys after production-environment
  reviewer approval.
- **Mobile** — EAS builds manual; internal testing before store
  rollout.

### Migrations

Applied to `vkgfw` before the tagged prod deploy. Never in the same PR
as unrelated app code. Applied via the runbook, not ad-hoc.

### Rollback

- **App code** — redeploy the previous tag.
- **Migrations** — forward-only; ship a paired down migration for
  anything destructive.
- **Content** — `content_router` reads by version; roll back if bad
  content lands.

## 29. Governance

| Change | Ceremony |
|--------|----------|
| Bugfix in an existing endpoint | PR + review |
| New endpoint under an existing router | PR + review + §30 doc update |
| New router / new external integration | Short RFC in `docs/rfcs/` |
| Schema change | Migration PR + runbook update + prod-drift check |
| Auth / admin / security surface | RFC + security review |
| Reintroducing a Legacy surface to primary nav | RFC + governing-principle review (§4) |
| New system-of-record | Full RFC + non-goal review (§4) |

**RFCs** live in `docs/rfcs/` as `NNNN-title.md` with context,
decision, alternatives, consequences. One reviewer minimum; two for
schema / security / product-framing changes. An accepted RFC updates
this doc in the same PR.

**Deprecations** announced in `docs/CHANGELOG.md` with a
`Deprecation: true` response header; removed no earlier than two
releases later.

---

# Part V — Reference

## 30. Endpoint inventory

Counts from source at authoring time. Verify against
`backend/main.py` and `backend/routes/`.

| Router | File | Endpoints | §17 status |
|--------|------|----------:|------------|
| `career` | `backend/routes/career_routes.py` | 30 | **Core** |
| inline | `backend/main.py` | 26 | **Core** (auth, users, game) |
| `provisioning` | `backend/routes/provisioning_routes.py` | 25 | **Supporting** |
| `institutions` | `backend/routes/institutions_routes.py` | 19 | **Core** |
| `student_pipeline` | `backend/routes/student_pipeline_routes.py` | 17 | **Supporting** |
| `phase5` (×2 files) | `backend/routes/phase5_routes.py` · `backend/phase5_routes.py` | 9 + 9 | **Legacy** |
| `admission` | `backend/routes/admission_routes.py` | 9 | **Core** |
| `feed` (×2 files) | `backend/feed_routes.py` · `backend/routes/feed_routes.py` | 6 + 5 | **Legacy** |
| `social_rewards` (×2) | (two files) | 5 + 5 | **Legacy** |
| `boss` | `backend/routes/boss_routes.py` | 4 | **Legacy** |
| `interview` / `content` (×2 each) | (two files each) | 3 + 3 | **Supporting / Core** |
| `feedback` | `backend/routes/feedback_routes.py` | 2 | **Core** |
| `entrepreneurship` | `backend/routes/entrepreneurship_routes.py` | 2 | **Supporting** |

Router-file duplication (`backend/<name>_routes.py` and
`backend/routes/<name>_routes.py`) is a migration in flight — new work
goes under `backend/routes/`. See §17.

### Notable inline endpoints (`main.py`)

- **Health**: `GET /health`
- **Auth (Core)**: `POST /api/auth/email-code/request`,
  `POST /api/auth/password-reset/request`,
  `POST /api/auth/password-reset/confirm`, `GET /api/auth/mfa`,
  `POST /api/auth/mfa/{request,verify,defer}`,
  `POST /api/auth/signup`, `POST /api/auth/login`
- **Auth (Legacy)**: `POST /api/auth/telegram`,
  `POST /api/auth/base-wallet`
- **Auth (Supporting)**: `POST /api/auth/guest`
- **Onboarding draft**: `GET/PUT/DELETE /api/users/onboarding-draft`,
  `POST /api/users/onboarding-complete`
- **User**: `GET /api/users/me`, `PUT /api/users/me`,
  `POST /api/users/legal-acceptance`, `DELETE /api/users/me`,
  `POST /api/users/streak` (Legacy)
- **Game (Legacy)**: `POST /api/game/complete-level`,
  `GET /api/game/state`, `POST /api/game/state`,
  `GET /api/game/quant-gate`

## 31. Data model inventory

~100 tables in `skillup_dev`. Regenerate authoritatively:

```bash
cd sifter-skillup
grep -h "CREATE TABLE" backend/*.sql \
  | sed -E 's/.*TABLE (IF NOT EXISTS )?[[:space:]]*(skillup_dev\.)?"?([a-z_]+)"?.*/\3/' \
  | sort -u
```

Domain groupings live in §9; classification in §17.

## 32. Environment variables

Source of truth: `backend/config.py` + `DEPLOY-SETUP.md`.

### Backend

```
SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_KEY
JWT_SECRET / JWT_ALGORITHM=HS256 / JWT_EXPIRE_HOURS
SINGLE_DEVICE_ENFORCEMENT / DEBUG
REDIS_URL / CELERY_BROKER_URL / CELERY_RESULT_BACKEND
RESEND_API_KEY / EMAIL_FROM / EMAIL_CODE_TTL_MINUTES
EMAIL_CODE_MAX_ATTEMPTS / EMAIL_CODE_STORAGE
ALLOWED_ORIGINS / AIRTABLE_SYNC_INTERVAL_MINUTES

# Future / Legacy (retained for extensibility)
PRIVY_APP_ID / PRIVY_APP_SECRET / PRIVY_VERIFICATION_KEY
TELEGRAM_BOT_TOKEN
BASE_RPC_URL / BASE_CHAIN_ID=8453
GITHUB / LINKEDIN / TWITTER / INSTAGRAM / FACEBOOK / MEDIUM /
REDDIT / BEHANCE / DRIBBBLE / GOOGLE / VIMEO — _CLIENT_ID + _SECRET
```

### Frontend (Expo, build-time)

```
EXPO_PUBLIC_API_URL
# Future
EXPO_PUBLIC_PRIVY_APP_ID / _CLIENT_ID / _WEB_CLIENT_ID / _NATIVE_CLIENT_ID
```

## 33. Directory layout

```
sifter-skillup/
├── app/                          # expo-router (target)
│   ├── (auth)/                   # email + 2FA flows, onboarding
│   ├── (tabs)/                   # target primary tabs (Discover / Fields / Programmes / Opportunities / My World / Profile)
│   ├── (admin)/                  # staff + school-admin surfaces
│   ├── cairo-builder-track/      # Future
│   ├── ecosystem-track/          # Future
│   ├── starknet-track/           # Future
│   ├── merchandise/  skills/  world/  track-room/  # Legacy
│   └── index.tsx  _layout.tsx
├── src/
│   ├── components/  hooks/  lib/  services/  stores/  theme/  types/
│   ├── data/                     # bundled lesson content (Remove after learning surface backgrounded)
│   └── screens/                  # legacy screens (retiring Phase 3)
├── backend/
│   ├── main.py  auth.py  config.py  database.py  models.py  logger.py
│   ├── crypto_utils.py  email_delivery.py  email_codes.py  db_email_codes.py
│   ├── fcm_service.py  device_sessions.py
│   ├── middleware/               # session_middleware, device_sessions, require_admin/staff/institution_member
│   ├── celery_worker.py  airtable_sync.py
│   ├── routes/                   # newer routers (target home)
│   ├── <name>_routes.py          # older routers (migrating)
│   ├── migration_*.sql           # ~40 flat migrations
│   ├── seed_career_resources_v1_parts/   # ~1000 SQL parts
│   ├── MIGRATION_RUNBOOK.md
│   └── COMPLETE_DATA_MIGRATION_2026-08-17.md
├── data/                         # career-mapping source data + builders
├── docs/                         # this file, design brief, plans, mockups
├── design/                       # mockups, tokens, exports
├── docker-compose.yml  Dockerfile
├── eas.json  app.json  babel.config.js  metro.config.js
├── package.json  tsconfig.json
├── CLAUDE.md  DEPLOY-SETUP.md  DEMO_DAY_SETUP.md
```

## 34. Glossary

- **Career Intelligence Platform** — the product identity. See §1.
- **My World** — the personal saved exploration space each user
  builds by saving programmes, universities, domains, sub-groups,
  roles, and opportunities.
- **IA** — information architecture: Subjects → Mini Programmes /
  Programmes → Universities → Programme Overview → Domains →
  Sub-groups → Roles → Embedded Skills → Opportunities → My World.
- **Embedded skills** — skills as attributes of Domains / Sub-groups /
  Roles, not a standalone discovery layer.
- **billy** — the shared dev Supabase project.
- **vkgfw** — the isolated prod Supabase project.
- **storytime** — the shared Ubuntu host at `52.18.195.224`.
- **Compass** — the LevelUp design system.
- **CCMAS** — Nigerian curriculum standard surfaced in the
  degree-skills flow.
- **JAMB** — Nigerian tertiary admissions authority.
- **Response envelope** — the `{success, data, error}` shape every
  endpoint returns.
- **Device binding** — `X-Device-Id` + `active_sessions` enforcement.
- **Skill Up** — the previous product framing (learning-first,
  Duolingo-style). Retained in name (repo, systemd units, schema) but
  no longer the product identity.

## 35. Decision log

Format: **date · decision · rationale · reversibility**.

- **2026-08-20 · Reframe as Career Intelligence Platform.** Rationale:
  align product identity with primary user value; stop competing with
  Web3 / gaming / learning framings. Reversibility: medium — the
  reframe is a one-way door for the surface but the underlying
  architecture retains extensibility.
- **2026-08-20 · Email + 2FA is the only primary auth.** Rationale:
  conventional, secure, appropriate for students and school admins.
  Reversibility: high — other channels remain server-side.
- **2026-08-20 · Skills embedded in Domains / Sub-groups / Roles, not
  a top-level layer.** Rationale: users encounter skills in the
  context they matter. Reversibility: medium — schema unchanged, only
  IA / UI changes.
- **2026-08-20 · Offline is platform-wide.** Rationale: career
  discovery must survive flaky networks, not just XP. Reversibility:
  high in intent, medium once WatermelonDB schemas land.
- **2026-08-20 · Labour-market fetch → monthly cadence.** Rationale:
  data does not change on a 6h horizon; constant fetching adds noise.
  Reversibility: high — cron config change.
- **2026-08-20 · Cutoffs hidden until data is reliable.** Rationale:
  fabricated / stale cutoffs erode trust in the platform.
  Reversibility: high — schema retained.
- **2026-08-20 · Pathways relegated from primary flows until ready.**
  Reversibility: high.
- **2026-08-20 · School administrators are first-class users on the
  same platform.** Rationale: role-based experience, not a separate
  platform fork. Reversibility: medium once role scoping ships.
- **2026-08-19 · Single-VM systemd deploy.** Rationale: match KYS,
  keep ops cheap. Reversibility: high.
- **2026-08-19 · Two auth envelopes (HTTP + `success` flag).** Lets
  clients distinguish transport from domain failures. Reversibility:
  medium.
- **2026-08-19 · WatermelonDB as offline store.** Observables + sync
  out of the box. Reversibility: medium.
- **2026-08-19 · Consolidate on expo-router; delete `src/screens/`.**
  One navigation surface. Reversibility: low once files deleted.
- **2026-08-19 · Redis DB indices 12/13 are load-bearing.** Shared
  broker would double-fire beat. Reversibility: high (reassign) but
  audit every time.

---

*Last verified against repo state on 2026-08-20. When editing, update
the verification date and the affected sections. Cross-reference
against `backend/main.py`, `backend/routes/`, `DEPLOY-SETUP.md`, and
`backend/MIGRATION_RUNBOOK.md` before shipping structural changes.*
