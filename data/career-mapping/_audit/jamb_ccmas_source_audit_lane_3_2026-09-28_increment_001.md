# Lane 3 CCMAS source increment 001 — packages 159–160

**Checked:** 2026-09-28 (Africa/Lagos)  
**Source:** NUC, [Engineering and Technology CCMAS PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf).  
**Progress:** 2 packages begun, 0 packages fully source-audited; 5 course rows checked against the official PDF. Do not read this as closure of the packages.

## Prior-work reconciliation

The bounded checkpoint for packages 141–160 contains both assigned packages but explicitly labels them structural candidates requiring exact-source adjudication. The selected 79-package primary-source pass does not include either Engineering package. A targeted search of the lane’s existing audit/fix artifacts found no exact source adjudication for the course rows checked below. No shared source or seed was changed.

## Findings

| Package | Source comparisons | Disposition |
|---|---|---|
| 159 — Industrial and Production Engineering | `GET 102`, `IPE 102`, and `GET 299` are listed in the NUC course tables with distinct title, units/status, and hours/duration. Current extracted rows have table columns appended into titles and lose unit/hour fields. Evidence: printed pp. 578–579; IPE 102 detail at p. 586. | Three confirmed extraction/data-contract defects. Remaining 45 course records and complete scope still need checking. |
| 160 — Marine and Offshore Engineering | `MAR 124` title and four outcomes match the NUC course detail at pp. 625–626. The NUC table lists `MAR 532` (p. 617), but the detailed course block for the same title is headed `MAR 513` (p. 645); the local `MAR 532` record also has contaminated title and no outcomes. The shared SIWES row `GET 299` has the same title/unit extraction defect. | One checked match; two confirmed table-field defects plus an unresolved primary-source code conflict. Do not copy MAR 513 outcomes into MAR 532 without source adjudication. Remaining 58 course records and all specialisation structures remain open. |

The machine-readable row evidence, including exact printed locators and the distinction between confirmed defect and source conflict, is in `jamb_ccmas_source_audit_lane_3_2026-09-28_increment_001.json`.

## Next

Continue with package indices 161–170. Keep every course-row result, and mark a package complete only after its full NUC programme structure and all local rows’ code/title/units/status/LH/PH/content/outcomes have been reconciled.
