# Global role → parent-domain audit — checkpoint 004

Date: 2026-10-06  
Scope completed for this continuation: exact role-key reconciliation and evidence dispositions for the former unresolved residual queue. Global occupational/professional sources only. No canonical taxonomy edits; role → specialization excluded; no Nigerian-specific research used.

## Exact-key result

| Disposition over canonical exact role keys | Count |
|---|---:|
| Supported | 2,348 |
| Conditional | 1,017 |
| Unsupported | 543 |
| Unresolved | 11 |
| Conflicting terminal statuses | 0 |
| **Canonical exact keys reconciled** | **3,919 / 3,919** |

The former unresolved residual was independently recounted at **44 exact keys** (not accepted from the previous headline alone). Every one now has a current explicit disposition with task evidence, rationale, sources, and stated limits:

- 33 moved to supported or conditional after task/source review;
- 11 remain unresolved because they are “All Other” catch-all categories with no specific task profile. Those 11 are documented individually in increment 004, including what task evidence would be needed to decide.

“Reconciled 3,919/3,919” means every exact canonical key has a disposition recorded and no conflicting terminal statuses. It does **not** mean all 3,919 links are supported or that the 11 catch-all roles have been conclusively mapped. The unresolved state is the defensible result until the catch-all rows are replaced or supplemented with identifiable occupations and tasks.

## Remaining 11 exact keys

```text
D007|Designers, All Other
D009|Mathematical Science Occupations, All Other
D010|Business Operations Specialists, All Other
D010|Financial Specialists, All Other
D022|Extraction Workers, All Other
D041|Physical Scientists, All Other
D042|Media and Communication Workers, All Other
D122|Health Technologists and Technicians, All Other
D124|Healthcare Support Workers, All Other
D126|Healthcare Diagnosing or Treating Practitioners, All Other
D150|Religious Workers, All Other
```

For each, the source confirms a residual/catch-all with no role-specific task evidence (or the record contains only that residual wording). Relevant detailed global occupational sources provide examples of what would count as a task match, but cannot tell us which unlisted occupation is represented by the catch-all. We therefore do not convert these into conditional links based on title, subgroup, or neighboring roles.

## Reproducibility and test result

Run from repository root:

```powershell
python data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_CONTINUATION_2026_10_06/reconcile_exact_role_fit_coverage.py
python -m unittest data.career-mapping._audit.role_fit_lanes_2026_10_05.GLOBAL_CONTINUATION_2026_10_06.test_reconcile_exact_role_fit_coverage
```

Latest run: **5 tests passed**; exact-key coverage 3,919; duplicate/conflicting keys 0; current residual 11. The tests check exact-key extraction, domain-only status fields, disjoint statuses, unique/evidence-complete incremental decisions, and full-catalogue reconciliation.

## Continuation artifacts

- `reconcile_exact_role_fit_coverage.py` — deterministic exact-key reconciliation across the D001–D084 reports, D085–D168 reports, the separately handled D119 ledger, and continuation decisions. Snapshot worklists are excluded as decisions.
- `exact_role_fit_coverage_2026_10_06.json` — latest current counts and unresolved keys.
- `role_domain_fit_dispositions_increment_001.json` through `_004.json` — 44 exact-key updates; increment 004 gives full unresolved evidence/rationale/limits for the 11 catch-all rows.
- `test_reconcile_exact_role_fit_coverage.py` — repeatable tests.

No file in canonical `domain_structure.json`, `role_library_v3*.json`, or canonical role/domain mapping data was changed.

