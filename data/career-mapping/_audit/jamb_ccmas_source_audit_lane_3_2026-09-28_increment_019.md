# Lane 3 CCMAS source increment 019 — Petroleum Engineering rows 17–20

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.  
**Progress:** Four new course occurrences compared. Thirty-three of 49 local course rows in CCMAS package 172 have now been source-compared across saved lane-3 increments; 16 remain. The package is still open.

## Prior-work reconciliation

Increment 017 completed ordinals 13–15. Ordinal 16, PEE 101, was previously checked in increment 009 and is deliberately skipped. This increment checks ordinals 17–20: GST 212, ENT 211, GET 201 and GET 202.

## Findings

| Ordinal / course | Comparison | Disposition |
|---|---|---|
| 17 — GST 212, Philosophy, Logic and Human Existence | Official table and detail agree on 2 C, LH 30; all eight outcomes exist, but the local eighth outcome has course-content prose appended. Its content summary is cut off at 400 characters mid-sentence. Official ending covers philosophy/politics, conduct, religion, values and character. | **Confirmed extraction contamination and summary truncation.** |
| 18 — ENT 211, Entrepreneurship and Innovation | Official table/detail agree on 2 C, LH 30; all eight outcomes align. Local 400-character content summary stops during the entrepreneur-character description, omitting innovation, enterprise formation/planning, contemporary issues and e-commerce. | **Confirmed summary truncation.** |
| 19 — GET 201, Applied Electricity I | Local title incorrectly absorbs “3 C 45 =” and typed units/LH/PH are null. Petroleum table p. 1085 says 3 C, LH 45 and prints “=” in PH; the detailed block pp. 1095–1096 says 3 units, LH 30, PH 45. Four outcomes align. | **Confirmed local parse defect; official table/detail workload conflict left unresolved.** |
| 20 — GET 202, Engineering Materials | Table/detail agree on 3 C, LH 45; all eight outcomes align. The local 400-character content summary ends before the course syllabus’ ceramics, polymers, composites, nanomaterials, corrosion and materials-performance topics. | **Confirmed summary truncation.** |

No shared CCMAS course records were edited. These findings are ready for local reconciliation as evidence; the unresolved GET 201 conflict must remain visible until adjudicated. Machine-readable evidence: `jamb_ccmas_source_audit_lane_3_2026-09-28_increment_019.json`.

**Exact next cursor:** CCMAS package 172, local course ordinal 21 — GET 204, Students Workshop Practice. 16 package course rows remain unreviewed for source adjudication.

Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_019.py`.
