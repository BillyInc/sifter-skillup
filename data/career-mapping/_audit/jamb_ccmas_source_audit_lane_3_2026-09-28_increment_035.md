# Lane 3 CCMAS source increment 035 — Structural Engineering rows 11–15

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), schedule printed pp.1161–1162; course details pp.1168–1170.  
**Progress:** Fifteen of 47 Structural Engineering course occurrences source-compared.

## Findings

| Ordinal / course | Schedule owner | Result |
|---|---|---|
| 11 — PHY 101, General Physics I | Basic Sciences | All 8 outcomes and hours align; summary truncates before rotational mechanics, gravitation and satellite motion. Detail heading adds “(Mechanics)”. |
| 12 — PHY 103, General Physics III | Basic Sciences | All 6 outcomes/hours align; summary truncates in elasticity before moduli, hydrostatics, fluid flow and related topics. Detail heading adds “(Behaviour of Matter)”. |
| 13 — PHY 107, General Practical Physics I | Basic Sciences practical | All 5 outcomes/hours align; summary truncates before the source’s concluding emphasis on observation, measurement, data collection, analysis and deduction. |
| 14 — PHY 108, General Practical Physics II | Basic Sciences practical | All 6 outcomes/hours align; summary truncates before the full concluding physical-technique emphasis. |
| 15 — GST 212, Philosophy, Logic and Human Existence | ENT/GST | The first eight outcome texts align, but the local eighth element appends syllabus prose (“inference. Informal fallacies…”). The separate summary is also truncated. This is a field-boundary defect hidden by the matching count of eight. |

Course-area ownership is taken from the NUC Structural Engineering course structure and schedule groupings; it is not inferred solely from course-code prefixes. No shared CCMAS ledger was edited.

## Reconciliation handoff

Restore the cut-off summaries for PHY 101, PHY 103, PHY 107 and PHY 108. For GST 212, remove the appended syllabus fragment from outcome 8 (which ends “philosophy and logic.”) and store that material under course contents, restoring the remaining contents from NUC. Keep the detail-heading qualifiers for PHY 101/103 in provenance while following the shorter schedule titles.

Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_035.py`.  
**Next cursor:** package 174, Structural Engineering, ordinal 16 — GET 201. Rows 1–15 are covered.
