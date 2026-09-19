# Downstream programme coverage checkpoint (2026-09-19)

This is a small, deterministic coordinator report over the existing
`programme_scaling_contract_2026-09-19.json` and
`SCALING_ACCEPTANCE_MATRIX_2026-09-19.md` outputs. It does not read the
contextual gzip, fetch URLs, apply SQL, or claim that every route rendered in
a browser.

## Full-population boundary

- Programme audit records: **237 / 237**.
- Generic programme records: **236**.
- Reviewed Sociology programme records: **1**.
- Unique programme keys: **237**.
- Active programme-to-domain links represented in the audit: **1,343**.
- Programmes without an active domain mapping: **1**.

Every parsed programme therefore has a downstream audit record. The one
unmapped programme is recorded as an explicit gap; it is not silently counted
as a complete domain/subgroup/role route. This is coverage evidence, not an
acceptance claim for live student exposure.

## Smoke fixtures are a separate sample

The existing route smoke covers three representative contracts and **15 route
helper transitions**. Those fixtures do not replace the 237-programme audit:

| Fixture | Audit key | Curriculum contract | Active domain links |
| --- | --- | --- | ---: |
| Sociology | `Social Sciences::Sociology` | `sociology_reviewed` | 5 |
| Nursing | `Allied Health Sciences::Nursing Sciences` | `generic` | 6 |
| Accounting | `Administration and Management::Accounting` | `generic` | 11 |

Sociology is the reviewed reference slice; Nursing and Accounting are generic
cross-programme smoke fixtures. Their smoke results must not be generalized to
all 237 rendered routes.

## Boundary and remaining proof

The local contract audit reports zero curriculum locator/state gaps and zero
context ownership/state/source-reference gaps. It also reports unresolved or
not-established relationships and unlabelled item link state. Those rows
remain fail-closed and require the planned source enrichment before student
promotion. Admin evidence may retain review/provenance detail, but this
checkpoint does not claim a full 237-programme admin render audit.

SQL/live deployment and browser verification remain deferred.

Evidence inputs:

- `data/career-mapping/_audit/programme_scaling_contract_2026-09-19.json`
- `data/career-mapping/_audit/SCALING_ACCEPTANCE_MATRIX_2026-09-19.md`
- `scripts/programmeGuidanceScaleSmoke.cjs`
