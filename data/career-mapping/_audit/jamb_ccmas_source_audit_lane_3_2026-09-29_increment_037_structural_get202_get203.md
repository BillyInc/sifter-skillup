# Lane 3 CCMAS source increment 037 — Structural Engineering GET 202 and GET 203

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf).  
**Scope:** package index 174, Structural Engineering, local course-array ordinals 18–19.  
**Progress:** 19 of 47 package course occurrences have package-specific source comparisons; 28 remain.

## Comparisons

| Ordinal | Course | Schedule vs detailed block | Local finding | Disposition |
|---:|---|---|---|---|
| 18 | GET 202 — Engineering Materials | Schedule p. 1162: 3 units, C, LH 45. Detail pp. 1172–1173: 3 units, E, LH 45. Eight outcomes and a broad materials syllabus are present. | Local title, units, hours and eight outcomes align. Local C matches the schedule but conflicts with detail E. Its summary stops at the 400-character boundary during metals/alloys and omits later topics. | `source_conflict`; confirmed summary truncation. |
| 19 | GET 203 — Engineering Graphics and Solid Modelling II | Schedule p. 1162: 2 units, C, LH 15, PH 45. Detail p. 1173: 3 units, C, LH 30, PH 45; the detail title uses US spelling “Modeling”. | Local fields match the schedule. All five outcomes align with the detail block. The compact summary covers major design topics without an evident cutoff. | `source_conflict`; summary remains a candidate. |

The NUC Structural Engineering schedule is used for programme-specific course metadata. Both rows have source-internal disagreements between the package schedule and detailed course blocks; this checkpoint preserves those conflicts without editing the local curriculum.

## Next cursor

Package 174, Structural Engineering, local one-based course-array ordinal 20: GET 204. Rows 1–19 now have package-specific comparison coverage. Package 174 remains open at 28 unreviewed course occurrences. The wider partition still includes JAMB identities 281–420, the orphan offering occurrence, and CCMAS package indices 159–237.

Regression coverage remains in `test_jamb_ccmas_source_audit_lane_3_increment_036.py`; no shared ledger was edited.
