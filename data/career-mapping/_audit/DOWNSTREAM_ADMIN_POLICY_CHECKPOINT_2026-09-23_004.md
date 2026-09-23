# Downstream/admin policy checkpoint 004 (2026-09-23)

Append-only, read-only local validation after regeneration of the downstream
route audit. No SQL, frontend, live database, external source, or browser proof
was changed or claimed.

## Policy validation

| Policy | Result | Evidence |
| --- | --- | --- |
| Student lookup population is all JAMB identities | PASS | 420/420 identities present; JAMB and university route availability are independent of CCMAS support packages. |
| CCMAS packages are supporting evidence | PASS | 237/237 packages audited; 154 have a student route projection and 83 are explicit supporting-only package findings. |
| Missing CCMAS anchors do not hide JAMB entries | PASS | `all420IdentitiesPresent`, `missingCcmasDoesNotFailJambRoute`, and the admin `jambLookupPopulationPolicyPasses` gate are true. |
| Unresolved item-to-item relationships are internal non-blocking coverage | PASS | 408,163 canonical relationships; 2,305 unresolved/not-established rows remain internal and non-student-approved. The 21,235 programme-projected count is a repeated projection, not a second blocker population. |

## Regenerated route/admin counts

- Downstream route coverage: **237/237** CCMAS package records; **0** broken
  downstream package routes.
- JAMB route coverage: **420/420** identities; **420/420** JAMB programme
  routes; **420/420** university/offering routes; **0** broken JAMB routes.
- Supporting-package route findings: **83** explicit `no_jamb_identity` and
  `no_university_offering` package states; these do not reduce the 420-identity
  JAMB lookup population.
- Admin accepted/internal boundary: **PASS** locally; no rows are approved for
  student exposure.

## Intentional open boundaries

- Full rendered admin acceptance, browser proof, live payload proof, SQL
  deployment, and student-exposure approval remain **not claimed**.
- Review-required JAMB/resource and contextual evidence remains internal until
  explicit approval and the existing provenance/ownership gates are satisfied.

## Validation

Focused route/admin regression tests: **13 passed**.

Generated/validated artifacts:

- `data/career-mapping/_audit/audit_downstream_programme_routes_2026-09-19.py`
- `data/career-mapping/_audit/audit_all_programme_student_route_contract_2026-09-23.py`
- `data/career-mapping/_audit/audit_admin_acceptance_scale_2026-09-23.py`
- `data/career-mapping/_audit/DOWNSTREAM_PROGRAMME_ROUTE_AUDIT_2026-09-19.json`
- `data/career-mapping/_audit/ALL_PROGRAMME_STUDENT_ROUTE_CONTRACT_AUDIT_2026-09-23.json`
- `data/career-mapping/_audit/ADMIN_ACCEPTANCE_SCALE_AUDIT_2026-09-23.json`

This checkpoint is additive to prior dated reports; it does not replace their
historical results.
