# HANDOFF — Remaining Work After Seeding (2026-07-20)

Audience: developer working with their own Claude Code/Codex session on this repo.
Read `CLAUDE.md` first. The companion document `MARKET_POLLER_SPEC_2026-07-20.md`
covers the background demand-data poller (do that as its own work stream).

---

## 1. What is DONE (do not redo)

### Data layer (seeded into live Supabase, schema `skillup_dev`)
- **6-layer skills/tools framework fully materialized**:
  - L0: 237 CCMAS programmes with taught-skills profiles.
  - L1: foundation skills on all live domains (≥30% prevalence rule, `{skill, prevalence, n}`).
  - L1T: domain tools (TF-IDF distinctive vs common) with cross-domain **leakage audit**
    applied (`data/career-mapping/_audit_tools_leakage.py` → drop-list consumed by the
    seed generator; leaked rows DELETEd from DB).
  - L2: 278/278 subgroups have cluster_skills (the 63 missing were computed:
    ≥25%-of-subgroup minus foundation names, never-empty floor).
  - L2T: subgroup tools.
  - L3: 4,006 live roles with essential/optional skills.
  - L3T: role-scoped tools for 3,094 roles via O*NET SOC crosswalk (76%;
    `domain_tools.scope='role'`, `role_id` FK). Unmatched roles fall back to
    subgroup tools — UI should label these "inherited".
- **Real ESCO URIs** (97% match, 72,141 rows; unmatched are absent, never fabricated).
- **University-pipeline scope**: 160 of 168 domains live. 8 hidden by REACHABILITY
  (no CCMAS programme link AND no JAMB name link): D086, D087, D088, D089, D100,
  D101, D108, D113. Do NOT hide by `institution_type[]` — that flag describes
  workforce staffing and would wrongly hide 28 reachable domains (Food Science,
  Chemical Engineering, agriculture, etc.).
- **Admissions**: 420 JAMB programmes, 778 schools, 7,888 school_programmes
  (institution-specific naming straight from the brochures — IBASS scraping is NOT
  needed), 420 subject-requirement texts (101 enriched files overlaid), cutoffs for
  10 universities (21 rows) with `jamb_programme_id` backfilled, formulas (17),
  competitiveness (20), national JAMB floor.
- **Subject catalog**: 44 WAEC/NECO/JAMB subjects with aliases matching the frontend pickers.
- **Structured subject options (SS3 match door)**: parser
  (`data/career-mapping/_parse_subject_options.py`) produced structured UTME
  combinations (required + one_of groups) for ~148+ programmes; cross-reference
  resolution ("as in X") and typo repair added after first run. Unparseable text is
  `parse_status='needs_review'` and the API falls back to requirement text.
- **Demand metrics baseline**: 12,018 role rows + 480 domain rows (× 3 lenses:
  global / ng_remote / ng_local). Derived from real local signals, labelled
  `source_confidence='low'`; 10 API-sampled roles overlaid at true confidence
  (16 rows). Provenance rows in `market_metric_sources`. This is the layer the
  background poller (document 2) progressively replaces with real data.
- **Live-data rule (owner decision)**: NO demo/test users, NO mock rows anywhere.
  Screens render DataState envelopes (`real|fallback|pending|coming_soon|locked|error`).
  Admin dashboards are university-agnostic.

### Code (merged)
- Frontend `FeedbackType` fixed to `confirm|flag|suggest` (was a crash-grade
  mismatch vs the DB check constraint) in `src/types/career.ts`,
  `MappingFeedbackButton.tsx`, `ExpertDossierScreen.tsx` (+ fallback chip).
- **Phase-7 backend + wiring** (tables SHIP EMPTY by design):
  - `backend/migration_phase7_content.sql`: `bridge_plans`, `elite_pathways`,
    `organisations`, `opportunities`, `scholarships`, `application_windows` (RLS
    closed, service-role only).
  - `backend/routes/career_routes.py`: real endpoints
    `GET /api/career/opportunities[/{id}]`, `/elite-pathways[/{id}]`,
    `/bridge-plans/{id}`, `/scholarships`, `/application-windows` (window status
    derived from dates at read time). All degrade to `coming_soon` while empty.
  - `src/lib/careerData.ts`: getOpportunities/getOpportunity/getScholarships/
    getApplicationWindows/getElitePathways/getElitePathway/getBridgePlan now call
    the API (no longer hardcoded coming_soon).
- Pipeline tooling: `RUN_PIPELINE.bat` (generate) / `RUN_PIPELINE.bat check`
  (verify: row counts + `backend/_verify_seed.py` 22 checks + `npx tsc --noEmit`),
  `backend/_check_db_state.py`, `backend/repair_demand_fkeys.sql`.
- **CRITICAL OPS RULE**: `migration_career_v2.sql` DROPs and recreates the taxonomy
  tables. Never re-apply it after seeding unless immediately followed by
  `migration_role_tools.sql` → `seed_career_v2.sql` → `seed_phase8_9_enrichment.sql`
  → `repair_demand_fkeys.sql`. (This exact mistake wiped 9 tables once already.)

---

## 2. What is LEFT (ordered; each item is independently shippable)

### 2.1 Verify the recovered seed (do this FIRST, 10 min)
Run `.\RUN_PIPELINE.bat check`. Expect **all 22 checks PASS** (last known state had
9 fails caused by a post-seed re-apply of migration_career_v2.sql; the recovery
sequence was issued but the final green run was never pasted back). Also confirm the
`npx tsc --noEmit` tail is clean. Fix anything red before moving on.

### 2.2 Phase 4 — per-user-type verification (½ day)
Start backend (`cd backend && uv run uvicorn main:app --reload`) + Expo app. Verify
against LIVE data, mechanically (per the always-verify-completeness rule):
- Guest: `/api/career/search` disambiguation; explore domain detail.
- SS1/SS2: onboarding subject picker → domains via career mapping.
- SS3 three doors, especially "match by my subjects" — now served by structured
  options (`_match_structured_subject_options`), confirm `matchBasis:"structured"`.
- Domain detail: all 6 layers render (foundation+prevalence, domain tools
  distinctive/common, subgroup skills/tools, role list, gateway certs, demand strip
  with low-confidence labelling).
- Role detail: L3 skills + L3T tools (or "inherited" subgroup fallback) + demand.
- Admin dashboards: 3 lenses (global/ng_local/ng_remote) on domain ranking,
  programme demand, role demand; university-agnostic.
- UNIZIK-style displayName check: a school's programme shows its OWN name
  (e.g. "Civil Law") via the school_programmes join, not the generic JAMB name.

### 2.3 Institution verification flow — audit + finish (1–2 days)
`POST /api/institutions/verify` now creates/reuses a `schools` row and links
`institution_members` (no longer a pure echo stub — partially fixed by a codex
session). Known gaps found in audit, to close:
- `_resolve_org`/`_membership_for_user` take the FIRST membership row and ignore
  `verified=false` — decide and enforce gating (verified-only for admin scopes).
- Educator identity is still client-local (`src/lib/educatorProfile.ts`,
  AsyncStorage) — migrate to the server flow.
- `/{id}/alerts` and `/affiliation` are hard stubs — implement or remove from UI.
- No proof-review loop: `verification_status` stays pending forever; add an admin
  action to verify/reject (data_admin role in `user_roles` exists for this).

### 2.4 Subject parser tail (½ day, optional quality)
- ~48 programmes were `needs_review` before the cross-ref/typo extension; re-run
  parser, re-apply `seed_subject_options.sql`, then hand-fix the residue (mostly
  institution-specific prose) directly in `jamb/enrich/*.json`.
- 223 programmes have EMPTY requirement text — extract from the brochure PDFs in
  the jamb brochure folder into `jamb/enrich/` (same shape as existing files),
  regenerate. This is data entry, not code.

### 2.5 Phase-7 content authoring (ongoing, non-engineering)
Tables are live and endpoints work; they show `coming_soon` until rows exist.
Author real rows (SQL editor is fine for a handful): 17 elite pathways +
bridge plans, initial opportunities/organisations, scholarships, application
windows. NO placeholder/mock rows — owner rule.

### 2.6 Demand data population — see document 2
The background poller replaces `source_confidence='low'` rows with real API data.
Full spec: `MARKET_POLLER_SPEC_2026-07-20.md`.

### 2.7 Calendar-gated / recurring (from FETCH_PLAN, not now)
- Cutoffs 10 → 50 universities: Dec–Jan window (post-UTME publications).
- Cert enrichment (489/508 lack price/url): quarterly batches from cached
  `_source_downloads/prof_body_pages/`.
- Poly/NBTE + NCE curricula (L0 for non-university): deferred with the
  non-university pipeline; the 8 hidden domains stay hidden until then.
- Annual: JAMB brochure re-extraction, BLS OEWS, Stack Overflow survey.

---

## 3. Security constraints (verbatim, non-negotiable)
- Load provider credentials from `.env` / `backend/.env` only. Do not print secrets.
- Verify that no generated output (SQL, JSON, logs, committed files) contains API keys.
- Direct Supabase access for student/institution tables stays REVOKEd; all reads go
  through FastAPI with the service-role client.
