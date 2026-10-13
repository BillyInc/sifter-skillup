# Lane 1 increment 039 — Physiotherapy PST 421/PST 423 carry-forward verification

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** verify the previously source-corrected DPT Physiotherapy rows PST 421 and PST 423 and reconcile the package's remaining course-coverage cursor.  
**Mode:** carry-forward/source verification; no shared curriculum or offering ledger edited.

## Primary source and locators

National Universities Commission (NUC), *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences* (2023), [official PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf), accessed 2026-09-29.

- DPT global course table: printed p. 588, extracted source lines 22892–22896.
- PST 421 detailed block: printed pp. 617–618, lines 24037–24059; this has the detailed course heading, six learning outcomes, and full contents.
- PST 423 detailed block: printed pp. 618–619, lines 24083–24097; this has the detailed course heading, three learning outcomes, and seminar contents.

## Exact-row comparison

| DPT course | Official source | Current local row | Disposition |
|---|---|---|---|
| PST 421 — Neurological Physiotherapy-I | Global table: 2 C, LH 30, PH dash. Detailed heading: 2 Units, C, LH 30. Six outcomes cover neurological-care decision principles, approaches, clinical reasoning, neuro-rehabilitation approaches, motor-control theory, and condition aetiology/pathology/features/treatment plans. Contents include nervous-system anatomy/physiology; infectious, traumatic, degenerative and other neurological disorders; skull/spinal lesions; neurological assessment; medical and physiotherapy management. | Exact DPT row has 2 units/C/LH 30/PH 0; six outcomes; summary covers the listed topic groups and clinical management; item-specific NUC URL, printed-page locators and `source_accessed_on=2026-09-26` are present. | **Prior repair verified against both NUC source locations.** The table/detail title capitalization and hyphen spacing vary; they refer to the same code and same course, and the stored title follows the detailed heading. No course identity conflict. |
| PST 423 — Special Topics in Health Seminar | Global table: 1 C, LH dash, PH 45. Detailed heading: 1 Unit, C, PH 45. Three outcomes cover health-care issues, physiotherapists' contributions to population health/well-being, and advocacy/roles for special populations and population health. Contents cover health definitions/classifications, health promotion, Nigerian health context/policies, population statistics, selected populations, ethics, health financing/NHIS, cancer classification, HIV/AIDS and euthanasia. | Exact DPT row has 1 unit/C/LH 0/PH 45; three outcomes; summary covers the source topics; official URL, printed-page locators and `source_accessed_on=2026-09-26` are present. The old footer spill is absent. | **Prior source-backed correction verified.** No remaining title/load/outcome/content defect observed in the checked fields. |

The source PDF's extracted global table represents dash cells as absent text; the local `0` values are the repository's established representation of no scheduled hours, not inferred positive hours. Neither row has a source-internal hour disagreement.

## Coverage reconciliation and next cursor

Physiotherapy's DPT course structure contains 48 owned rows (14 at 300 level, 12 at 400, 12 at 500, and 10 at 600; global table printed pp. 587–589). The local package contains 57 PST-coded rows; nine are documented as Audiology or Speech-Language Therapy contexts and must not be treated as DPT courses. Prior exact-course checkpoints, full-block comparisons, and targeted repair verifications cover the DPT rows; PST 421 and PST 423 are now explicitly rechecked here. PST 318 remains only an unresolved reference in the PST 321 description, not a DPT global-table course row; do not invent a course or silently substitute another code. Source-internal issues already recorded (including PST 424/425/426 hour conflicts and the PST 516 title variation) remain unresolved where evidence conflicts; this carry-forward verification does not adjudicate them.

The immediately preceding lane-1 cursor PST 313 is already covered by increment 011 (all three same-code source contexts); PST 314–326 and subsequent audited rows are covered by increments 012–038 and the package source-audit increments 001–008. **The next package in repository CCMAS order is index 039, Allied Health Sciences → Audiology.** Start at the first Audiology course row not already covered by an exact source checkpoint; do not repeat the DPT source queries above.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_1_2026-09-29_039_physio_pst421_pst423_coverage.json`. Regression: `test_jamb_ccmas_source_audit_lane_1_2026_09_29_039.py`.
