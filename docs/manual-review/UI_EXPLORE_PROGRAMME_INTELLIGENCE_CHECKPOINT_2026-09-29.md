# Explore and Programme Intelligence implementation checkpoint — 2026-09-29

## Scope

Continue the existing Popper UI handoff and the governing
`ADMIN_EXPLORE_PROGRAMME_MARKET_INTELLIGENCE_MOCKUP.md`, including the user's
latest portfolio-comparison requirements. Preserve the existing implementation.
Do not change Skills Matcher behavior or its screen.

## Completed in the current worktree

- Added an authenticated, institution-scoped API comparison for universities;
  secondary schools and tutorial centres must select two universities. A
  university can compare its own portfolio only against a selected peer.
- API returns peer-only programme offerings as a named list, current-only and
  shared offerings, each university's portfolio counts, and per-offering
  domain/specialization/role reach. Rows retain the university `offeringId`,
  canonical JAMB identity, and JAMB faculty context.
- Shared offerings are identity/context-bearing rows, not bare names, so
  same-titled but different JAMB identities/faculties are not collapsed. When
  two universities share the same JAMB identity, the API retains both
  university-specific offering rows and their context.
- Demand fields remain null and `coming_soon`; taxonomy reach is not treated as
  market demand. Programme Intelligence remains separate from demand-only
  Market Intelligence.
- Added a fixture for two same-named programmes with distinct JAMB/faculty
  contexts; the peer-only row retains its identity, faculty, and offering ID.
- Preserved earlier mockup-led UI implementation in programme preview,
  university Explore, educator Explore/provisioning, selection flow and
  Market Intelligence. No edits were made to `src/screens/SkillsMatcherScreen.tsx`.

## Verification

- `python -m pytest -q backend/tests/test_peer_programme_comparison.py backend/tests/test_domain_reach.py backend/tests/test_institution_access.py`
  — **96 passed**, one pytest cache-path warning.
- `pnpm.cmd run build` — **passed** (Vite); existing duplicate-key/style and
  large-chunk warnings remain outside this task.
- `$env:NODE_OPTIONS='--max-old-space-size=4096'; pnpm.cmd exec tsc --noEmit --pretty false`
  — **passed** after correcting the UI's actual domain-name field, a complete
  programme-coverage test fixture, and the demand-only market screen typing.
- `git diff --check` on changed API/UI comparison files — **passed**.
- `npm test -- --runInBand src/screens/admin/AdminExploreSurfaces.test.tsx src/lib/adminExploreState.test.ts src/lib/programmePreview.test.ts __tests__/provisioningFlow.test.ts __tests__/uiIssueFlow.test.ts`
  — **5 suites / 18 tests passed**. The Explore test uses async `act` for its
  two-stage fetch/effect sequence; no React `act(...)` warnings remain.

## Data limitations / remaining work

1. **Distinct source offering must be materialized in canonical programme data.**
   The source files preserve Administration `Accounting and Finance` at BCU
   separately from Social Sciences `Accounting and Finance` at FEDOTUOKE, with
   different source context and requirements. The current
   `backend/seed_career_pilot.sql` contains only the Administration JAMB
   identity. The API preserves separate identities when seeded, but cannot
   compare an identity that the canonical seed omits. Add/reconcile the Social
   Sciences identity and its institution offering through the checked-in source
   pipeline; do not reuse the Administration curriculum by title.
2. **Market demand:** no verified demand aggregation is exposed in this
   portfolio-comparison payload. Keep all demand counts unavailable/Coming
   soon until source-backed role/domain/subgroup demand and an as-of/provenance
   policy are implemented.
3. **Browser-level verification:** test the university workspace and a
   school/tutorial-centre comparison in the locally running app with real
   authorized API data. The build and component tests do not prove live
   endpoint/database contents.

## Full-brief continuation update (same date)

- Re-read this checkpoint, the complete governing mockup and original pasted
  UI issue brief before continuing.
- Expanded the reviewable mockup with report interaction states (offering
  index → individual JAMB offering → Direct/Functional/Adjacent → subgroup/AOS
  → role → taught/partial/verified-next-learning), explicit source/status
  requirements, peer portfolio drill-down and external-curriculum limits.
- Programme Intelligence now has an institution offering index with
  offering/JAMB/faculty identity and counts, and opens a single report with a
  return action. Curriculum outcomes are grouped by course code/title.
- Corrected the report to call the current rows a mapped CCMAS baseline, not
  institution-specific teaching. The report explicitly says the current API
  lacks a separate external-curriculum comparison layer. For an unanchored
  JAMB name, the UI does not invent a mapping or mark absent evidence as a
  student learning gap.
- Hardened the “verified learning gap” gate: taxonomy reach, generic URL, or
  default market-practice state alone is insufficient. An item must have an
  eligible type, bridge status, verified/approved evidence state, explicit
  `source_backed`/`verified`/`approved` data state, and a retained item source
  locator/reference. Added unit coverage and an offering report drill-down
  test.
- Updated item labels to display Skill, Competency, Tool and Certification;
  relationship details and source context remain distinct from learning links
  and demand.

### Current continuation verification

- Focused UI Jest after these changes: **7 suites / 21 tests passed**, including
  a university report-index-to-individual-offering interaction test.
- Backend comparison/domain/institution-access pytest: **96 passed**, with a
  pytest cache permission warning only.
- Vite production build: **passed** after the latest report-copy refinements;
  existing duplicate-key/style and large-bundle warnings remain outside this
  UI task.
- TypeScript (`NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit
  --pretty false`): **passed**.
- Local API started at `http://127.0.0.1:8000` and Vite dev server at
  `http://127.0.0.1:5173`. Vite required permission to scan the workspace; it
  then started normally. Browser proof remains unavailable because the
  computer-use provider reports no browser/app inventory and no IAB browser.
- FUOTUOKE Social Sciences Accounting and Finance remains an explicit source
  dependency; no ledgers/seeds were changed. This continuation did not edit
  Skills Matcher logic. The pre-existing dirty matcher-related files remain
  outside the selective push scope.

## No live deployment

This checkpoint describes local source/API behavior only. No SQL was applied,
and it is not evidence that the canonical seed or live Supabase contains the
new source-context identity or that demand data is live.
