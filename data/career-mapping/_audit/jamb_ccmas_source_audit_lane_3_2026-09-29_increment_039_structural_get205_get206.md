# Lane 3 CCMAS source increment 039 — Structural Engineering GET 205 and GET 206

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf).  
**Scope:** package index 174, Structural Engineering, local course-array ordinals 21–22.  
**Progress:** 22 of 47 package course occurrences have package-specific source comparisons; 25 remain.

## Comparisons

| Ordinal | Course | Source findings | Disposition |
|---:|---|---|---|
| 21 | GET 205 — Fundamentals of Fluid Mechanics | Structural schedule p. 1162 and shared course detail pp. 90–91 both give 3 units, C, LH 45, with no PH value. All eight local outcomes and the concise contents summary match. The saved Railway Engineering comparison of the same shared block was reused; this increment checks the Structural schedule occurrence. | `confirmed_match` |
| 22 | GET 206 — Fundamentals of Thermodynamics | Structural schedule p. 1162 gives 3 units, C, LH 45 and the title “Fundamentals of Thermodynamics”. The detailed block at pp. 90–92 and repeated in this programme at p. 1175 gives the same metadata but titles it “Fundamentals of Engineering Thermodynamics”. All 13 local outcomes match. The local 400-character summary stops mid-topic during ideal-gas contents. | `source_conflict` for title wording; confirmed summary truncation |

No source conflict was silently resolved and no shared curriculum field was changed.

## Next cursor

Package 174, Structural Engineering, local one-based course-array ordinal 23: GET 208. Rows 1–22 now have package-specific table checks and applicable detailed-block comparisons; 25 of the 47 course occurrences remain.

The full assigned scope remains 140 canonical JAMB identities / 151 linked offering occurrences plus one orphan occurrence, and 79 CCMAS packages / 3,938 course occurrences. JAMB exact awarder-cell coverage is still being reconciled occurrence by occurrence; the next open source target remains row 281's exact offering context.

Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_036.py`. No shared ledger or another partition was edited.
