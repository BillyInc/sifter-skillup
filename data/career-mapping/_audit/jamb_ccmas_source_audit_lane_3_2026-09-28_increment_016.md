# Lane 3 CCMAS source increment 016 — Petroleum Engineering MTH 101–PHY 101

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.  
**Progress:** four additional row occurrences compared in package 172. Twenty-six of 49 are now source-compared across increments 009–016; 23 remain. Package 172 remains open.

## Prior-work reconciliation

Increment 015 checked local package ordinals 5–8. This increment continues at ordinals 9–12. The official source contains multiple repeated course blocks across degree programmes; these comparisons use the Petroleum Engineering-specific detailed section (printed pp. 1091–1093), not a superficially similar block from another programme.

## Findings

| Local occurrence | Official NUC comparison | Local comparison | Disposition |
|---|---|---|---|
| 9 — MTH 101 Elementary Mathematics I | Table p. 1085; the Petroleum Engineering detail block pp. 1091–1092 specifies 2 C, LH 30, five outcomes, and the full algebra/trigonometry syllabus. | Structure and all five outcomes align. Local content ends at “trigonometric functions of angles of an,” before the official “any magnitude” and addition/factor formulae topics. | **Confirmed content defect.** |
| 10 — MTH 102 Elementary Mathematics II | Table p. 1085; Petroleum Engineering detail p. 1092 lists 2 C, LH 30 and nine outcomes, with content through approximate integration by trapezium and Simpson’s rule. | All nine outcomes, structure and content summary align. Detail title adds “(Calculus)” to the table title. | **Confirmed match for checked fields; descriptive title extension retained.** |
| 11 — MTH 103 Elementary Mathematics III | Table p. 1085; detailed block pp. 1092–1093 lists 2 C, LH 30, three outcomes and vectors/geometry/dynamics content. | All three outcomes and structure align. Local content ends mid-sentence at “Kinematics of a,” omitting the remaining mechanics topics. | **Confirmed content defect.** |
| 12 — PHY 101 General Physics I | Table p. 1085; detailed block p. 1093 lists 2 C, LH 30 and eight outcomes. | All eight outcomes and structure align. Local content ends at “conservation of linear,” before the remainder of momentum/energy, rotational mechanics and gravitation topics. | **Confirmed content defect.** |

No outcome-count mismatch was found in these four package occurrences. The defects in MTH 101, MTH 103 and PHY 101 are confined to visibly truncated content summaries; MTH 102’s nine outcomes are valid in this programme-specific block and were not incorrectly judged against another repeated course version.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_3_2026-09-28_increment_016.json`. Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_016.py`.
