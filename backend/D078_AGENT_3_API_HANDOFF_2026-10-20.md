# D078 Agent 3 API Repair Handoff

**Date:** 2026-10-20  
**Scope:** Backend career API serialization and focused backend tests only.

## Summary

The D078 backend helper was still reading the 2026-10-15 programme-to-role graph while the method-aware learner path is based on the 2026-10-19 graph. The old helper expected `area_to_role`/`domain_to_role` edge evidence and treated its absence as no visible route. The current graph uses `area_contains_supported_role` edges and a separate `method_area_role_routes` collection.

The helper now reads `data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json`. It resolves the graph's seven canonical areas and nineteen canonical roles, maps 26 area-to-role memberships, and attaches the 421 method/area/role route references to those memberships. This is identity and payload wiring; it does not promote the graph's global `student_visible` flag, alter approval flags, or infer method-to-role fit from area membership.

## Defects found and repaired

1. **Stale graph and edge contract.** `backend/d078_guided_areas.py` consumed the October 15 graph and filtered routes by fields such as `status`, `positive_task_evidence`, and `studentVisible` that are not present on the October 19 graph's membership edges. It now joins `area_contains_supported_role` edges to `method_area_role_routes` by canonical area ID and role graph ID. Its route payload includes graph role ID, area ID, method route IDs/count, role item IDs, and the graph's explicit method-fit claim.
2. **Role-to-area joins used display labels without a completeness check.** Domain serialization previously normalized names and built a dictionary that could silently overwrite duplicate API roles; role detail split the stable key and looked up a label. The API now resolves role details by exact stable `D078|<role-name>` key, verifies the key/name against the graph, rejects missing/duplicate/mismatched joins, and fails visibly if a graph role is hidden by the existing API data-state gate. Unmapped legacy rows such as `D078|philosopher` do not become area cards.
3. **D078 role detail must remain downstream of an explicitly selected area.** The current method-aware graph has 26 area-to-role memberships and zero direct domain-to-role edges. The role endpoint therefore requires an explicit area ID, verifies that it is linked to the requested role, and returns the normal `coming_soon` envelope if the area is missing or mismatched. It does not infer even a sole area. Tests cover connected-area context, missing-area rejection, and non-member-area rejection.
4. **Domain endpoint excluded role-owned resources before grouping them.** It called `_career_resources(..., include_role=False)` and then attempted to build role resource buckets from those results, which made reviewed role resources unreachable from the domain response. It now fetches the domain's resource rows across ownership levels, then places each row into its domain, subgroup, or role bucket and applies the existing review/ownership filters. A mocked endpoint test verifies a reviewed resource stays on the matching role and does not appear as a domain resource.

Existing claim review, learning-link, guidance-owner, data-state, relationship source, and resource approval gates remain in place. D078-owned runtime domain/area/role items continue through their existing `d078_guided_content` projections. Area tools carried into a selected role remain area-owned options; they are not rewritten as role-owned requirements. No content, role fit, SQL, migration, seed, graph, or UI files were changed.

## Files changed

- `backend/d078_guided_areas.py` - current graph loader, area/role mapping, strict API identity completeness checks.
- `backend/routes/career_routes.py` - exact graph/API joins, selected area routes, role-state gating for area cards, and resource query correction.
- `backend/tests/test_d078_guided_areas.py` - graph counts, all role identities, cross-area roles, and missing/ambiguous/mismatched join checks.
- `backend/tests/test_d078_api_identity.py` - mocked domain/role endpoint payload and failure tests, including role-resource ownership, hidden/legacy role cases, and required selected-area context.
- `backend/tests/test_student_guidance_contract.py` - exact response expectation now includes the serializer's existing `requirementScope` property.

## Verification

Command run from the repository root:

```powershell
python -m pytest backend/tests/test_d078_guided_areas.py backend/tests/test_d078_api_identity.py backend/tests/test_d078_guided_content.py backend/tests/test_d078_role_tools.py backend/tests/test_d078_role_item_contract_seed.py backend/tests/test_student_guidance_contract.py -q -p no:cacheprovider
```

Result from Agent 3's handoff run: **79 passed**. Local reconciliation then added
explicit D078 area selection and regression cases for missing and mismatched
areas. The current full focused suite reports **81 passed**.

Additional check:

```powershell
git diff --check -- backend/routes/career_routes.py backend/d078_guided_areas.py backend/tests/test_d078_guided_areas.py backend/tests/test_d078_api_identity.py backend/tests/test_student_guidance_contract.py
```

Result: no whitespace errors.

## Remaining verification limit

These endpoint tests use deterministic mocked service data. No live Supabase/API
request or browser acceptance was run, so production database joins and live
payload delivery remain unverified. The frontend journey source exists in this
checkout, but was intentionally outside Agent 3's backend-only scope; this
handoff verifies the backend payload boundary, not its rendered consumption.
