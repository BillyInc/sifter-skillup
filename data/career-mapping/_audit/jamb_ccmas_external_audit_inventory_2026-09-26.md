# JAMB–CCMAS/external joined audit inventory — 2026-09-26

Status: joined inventory complete for the current local artifacts; source adjudication and fixes remain open.

The JAMB offering ledger and the CCMAS/external curriculum ledger are separate evidence layers joined at each identity and selected-course record.

## Join checks

- `jamb_identity_rows`: **420**
- `ccmas_programme_packages`: **237**
- `ccmas_course_records`: **9853**
- `jamb_scope_rows`: **420**
- `external_or_unanchored_scope_rows`: **7**

## Closure rule

A row is not closed merely because it has a component reference or a review label. Closure requires the JAMB offering context, CCMAS/external component evidence, selected course fidelity, item-level source locator/date, and a justified student-facing status. Downstream domain/subgroup/role repair remains deferred until this source phase is closed.

The full machine-readable row-level join is in the JSON artifact.
