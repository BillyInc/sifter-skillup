# Lane 3 CCMAS source increment 021 — Petroleum Engineering rows 25–28

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.  
**Progress:** Four new course rows compared. Forty-one of 49 local occurrences in CCMAS package 172 have now been source-compared; eight remain. Package 172 remains open.

## Prior-work reconciliation

Increment 020 checked ordinals 21–24. This increment continues at ordinals 25–28: GET 210, GET 211, GET 301 and PEE 201.

## Findings

| Ordinal / course | Comparison | Disposition |
|---|---|---|
| 25 — GET 210, Engineering Mathematics II | Table/detail agree on 3 C, LH 45; seven outcomes align. The local 400-character content summary ends mid-word and omits the latter syllabus topics through complex analysis, contour integration and special functions. | **Confirmed content truncation.** |
| 26 — GET 211, Computing and Software Engineering | Table/detail agree on 3 C, LH 30, PH 45; six outcomes align. Source phrases Python, Java or C++ as preferred language options. The local summary is truncated mid-word before programming paradigms, MATLAB, ICT/IoT and software-engineering topics. | **Confirmed content truncation; do not reinterpret language options as mandatory all-at-once requirements.** |
| 27 — GET 301, Engineering Mathematics III | Table/detail agree on 3 C, LH 45; five outcomes align. The Petroleum table places GET 301 under its **200 Level** heading, so the local level is correct despite the course code. Local `content_summary` is contaminated with outcome prose; official syllabus instead covers linear algebra, geometry, integrals, vector calculus and complex functions. | **Confirmed content-field contamination; preserve source table level.** |
| 28 — PEE 201, Petroleum Geology | Table/detail agree on 3 C, LH 30, PH 45; six outcomes align. Detail title expands to “Petroleum Geology with Field Trip.” Local `content_summary` only repeats that title phrase; actual geological syllabus topics are absent. | **Confirmed missing content; preserve title variant.** |

No shared CCMAS rows were changed. Findings are recorded for local reconciliation. The next check continues immediately at the exact cursor below.

**Exact next cursor:** CCMAS package 172, local course ordinal 29 — PEE 202. Eight rows remain unreviewed for source adjudication.

Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_021.py`.
