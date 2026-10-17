# D078 area-to-role visibility checkpoint — 2026-10-14

## Scope

Trace and repair why roles are absent beneath the seven canonical D078 areas. Preserve the canonical area set and existing reviewed direct/conditional route statuses. Do not infer new role fit or conditions, reintroduce legacy subgroup labels, change UI card components or `RoleDetailScreen`, apply SQL, or stage/commit.

## Initial state

Work started. The API/source path and graph artifact are the first inspection targets. The initial suspected failure point is a student-visibility filter that may suppress graph routes; this is a lead to verify, not yet a confirmed diagnosis. No role routes have been newly approved at this point.

## Incremental findings

- Confirmed seven catalog area IDs exactly match the seven D078 area IDs in the reviewed graph; the canonical area names include `Computational and Digital Social Science`.
- The reviewed graph contains 26 `area_to_role` edges across the seven areas, with per-area counts `7, 6, 4, 3, 3, 2, 1`. The edges carry the existing `reviewed_supported` or `reviewed_conditional` status; several roles intentionally have more than one area route.
- `backend/d078_guided_areas.py` attaches graph edges to canonical areas. `backend/routes/career_routes.py` builds area role options from those reviewed routes. `SubgroupDetailScreen` displays `areaRoleOptions` when present, then falls back to the roles' `areaIds`.
- The source audit verifies data availability, but not the live response observed by the user: no live API/browser session was used in this lane. The no-role screenshot therefore cannot be attributed to the current source graph or filtering code alone. A stale/unrestarted backend, a different running build, or live response mismatch remains to be checked during route verification.
- The graph's `student_visible` flag is false for these review-graph edges. It is distinct from each reviewed route status and is not a filter in the inspected D078 area builder. Its promotion semantics must not be guessed; this task does not change it.
- Roles with multiple supported areas remain linked to every recorded area. Confirmed examples include Criminologist (psychology + sociology), Economic Policy Officer (economics + politics), and Statistician (computational/digital social science + social research/evaluation).

## Changed files

- `backend/tests/test_d078_guided_areas.py` — assert the canonical seven-area names, route coverage in every area, existing reviewed statuses and multi-area route preservation.
- This checkpoint.

## Verification and remaining gaps

- `python -m py_compile backend/d078_guided_areas.py backend/tests/test_d078_guided_areas.py` passed.
- Direct graph assertions passed: seven canonical areas; 26 reviewed routes; per-area counts `7, 6, 4, 3, 3, 2, 1`; multi-area Criminologist and Statistician routes preserved; no `Computational Science` area label.
- The focused `pytest` invocation did not complete within the runner window and was interrupted; it produced no pass/fail output. The repository command runner intermittently returns `helper_unknown_error` in this session.
- Remaining: inspect the actual running backend response at `/api/career/domains/D078` and ensure it is running the current code; no SQL or seed action is authorized in this lane. Do not report the live issue fixed until the seven areas return the route counts above.
