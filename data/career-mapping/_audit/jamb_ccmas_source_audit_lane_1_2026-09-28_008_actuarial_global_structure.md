# Lane 1 checkpoint 008 — Actuarial Science global-structure reconciliation

**Access date:** 2026-09-28 (Africa/Lagos)  
**Scope:** CCMAS package index 002, Administration and Management → Actuarial Science; all 35 local course rows compared with the NUC global course structure.  
**Status:** global-structure course-code coverage reconciled; package remains open because detailed course content/outcomes have not been checked in this increment. One verified local load repair is applied; this does not close the package.

## Source and comparison

NUC, [Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf), Actuarial Science global course structure, printed pp. 54–56. The source lists 35 course occurrences across levels 100–400. The local package also has 35 rows with the same course-code set. The complete source table and machine-readable comparison are in `jamb_ccmas_source_audit_lane_1_2026-09-28_008_actuarial_global_structure.json`.

### Confirmed defect: ACS 311 current hours

The NUC 300-level table on printed p. 55 lists **ACS 311, Entrepreneurship in Actuarial Profession** as 2 units, core, **15 lecture hours and 45 practical hours**. The prior local JSON had **30 lecture hours and no practical-hours value**. This was a confirmed defect in two fields and contradicted checkpoint 003's earlier note. It is now corrected to the NUC table and the existing detailed-course locator remains attached. The guarded script and regression test are `apply_ccmas_acs311_hours_repair_2026_09_28.py` and `test_ccmas_acs311_hours_repair_2026_09_28.py`.

### Source conflict: GST 212 / GST 211

The NUC global table on printed p. 55 lists **GST 212, Philosophy, Logic, and human existence**. The course-detail section on printed p. 56 labels the same-named course **GST 211**. The current row uses GST 212, agreeing with the global table. Because the primary source conflicts internally, retain `source_conflict`; do not change the code by inference. The local title is abbreviated (`Philosophy, Logic & Human Exist.`) and this row lacks item-level source URL/locator/date; those are captured as follow-up field/provenance work, not as a resolved source fact.

Two additional exact title-text differences are capitalization-only: source `Numerical analysis` vs local `Numerical Analysis` (ACS 307), and source `Pension funds and Social Insurance` vs local `Pension Funds and Social Insurance` (ACS 402). They remain normalization candidates, not substantive curriculum defects.

## What remains open

- Compare the course-detail blocks and outcomes for the full Actuarial package against the current row content; the global table alone does not close the package.
- Resolve the GST 212/211 internal source conflict if a further authoritative NUC correction or erratum exists.
- Compare the full ACS 311 detailed content/outcomes and other course rows against their exact blocks; the hours repair does not close that course or package.

The exact expected course rows and regression check are stored alongside this checkpoint. This increment does not certify the rest of the course summaries/outcomes and does not count the package as complete.
