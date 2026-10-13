# Lane 3 CCMAS source increment 020 — Petroleum Engineering rows 21–24

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.  
**Progress:** Four new course rows compared. Thirty-seven of 49 local occurrences in CCMAS package 172 have now been source-compared; 12 remain. Package 172 is still open.

## Prior-work reconciliation

Increment 019 checked ordinals 17–20. This increment continues immediately with ordinals 21–24: GET 204, GET 205, GET 206 and GET 209. No rows in this increment were previously checked.

## Findings

| Ordinal / course | Comparison | Disposition |
|---|---|---|
| 21 — GET 204, Students Workshop Practice | Table/detail agree on 2 C, LH 15, PH 45; all six outcomes align. Local content summary ends mid-word at “bra”; official text continues with brazing/soldering, foundry, CNC, electrical practice and energy measurement/conservation. | **Confirmed content truncation.** |
| 22 — GET 205, Fundamentals of Fluid Mechanics | Table/detail agree on 3 C, LH 45; eight outcomes and compact content statement align. | **Confirmed match.** |
| 23 — GET 206, Fundamentals of Thermodynamics | Petroleum table title is “Fundamentals of Thermodynamics”; detailed block expands it to “Fundamentals of Engineering Thermodynamics.” Workload and all 13 outcomes align. Local content summary stops at 400 characters, before cycles, heat engines, refrigeration and efficiencies. | **Confirmed content truncation; preserve title variant.** |
| 24 — GET 209, Engineering Mathematics I | Table/detail agree on 3 C, LH 45; six outcomes and compact content statement align. | **Confirmed match.** |

No shared CCMAS rows were changed. Findings are recorded for local reconciliation in the machine-readable checkpoint; title variants remain source-faithful and no unsupported correction was applied.

**Exact next cursor:** CCMAS package 172, local course ordinal 25 — GET 210, Engineering Mathematics II. 12 rows remain unreviewed for source adjudication.

Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_020.py`.
