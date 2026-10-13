# Specialization lane checkpoint 014 — D003–D084

Date: 2026-10-05

## Status and boundary

- Assigned local slice: D003–D056; parallel specialist covers D057–D091.
- Local source-reviewed coverage: **15/54 (D003–D017)**; next cursor: **D018**.
- Recommendation register currently contains 28 domain sets in total; the catalogue inventory must be refreshed before reporting total remaining counts.
- These are review recommendations only. Canonical subgroup records and role links remain unchanged; role-to-specialization mapping is deferred.

## D017 — Mechanical Engineering

- Added five candidate areas: Mechanical Design and Applied Mechanics; Thermal, Fluid and Energy Systems; Manufacturing and Production Engineering; Materials, Integrity and Reliability; Building Services and HVAC.
- The two current excluded subgroup records are generic ISCO skill-level categories and did not determine the proposed areas or count.
- Evidence registered from ABET mechanical-engineering criteria, ASME technical divisions and IMechE academic-accreditation guidance. The recommendation explicitly separates shared mechanical practice from D019 Renewable Energy Engineering, D049 Automotive Engineering and D050 Industrial Automation, and treats other industries as applications/cross-domain routes unless the parent-domain review supports a restructure.
- No role fit or role assignment is approved; the recommendations are not external academic sign-off.

## Verification

- JSON parse passed.
- `python -m pytest data/career-mapping/_audit/test_domain_subgroup_role_taxonomy_audit_2026_10_03.py -q` — **25 passed**.

## Next

Continue at D018 Civil Engineering. Use cross-regional primary evidence, check domain boundaries against adjacent catalogue roots, and record topics/methods that should not become their own specialization. Keep role fit independent.
