# Lane 3 CCMAS source increment 026 — Railway Engineering rows 4–10

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.  
**Progress:** Seven additional Railway Engineering occurrences checked; ten of 42 rows now have source comparison.

## Findings

| Ordinal / course | Result |
|---|---|
| 4 — GET 102, Engineering Graphics and Solid modelling 1 | Metadata and seven outcomes align; title uses Railway table wording while the common detail spells out “Modelling I”. Local 400-character content is truncated before viewports, sheet/surface modelling and example tools. **Defect: content truncation.** |
| 5 — CHM 101, General Chemistry I | Table metadata aligns. Official block has 10 outcomes; local has 9 because outcome 10 is concatenated to outcome 9. Content is also cut at 400 characters. **Defect: merged outcome and content truncation.** |
| 6 — CHM 102, General Chemistry II | Metadata and all nine outcomes align. Local 400-character summary stops during the course contents. **Defect: content truncation.** |
| 7 — CHM 107, General Practical Chemistry I | Metadata and all seven outcomes match; local summary covers the complete short published contents paragraph. **Confirmed match.** |
| 8 — CHM 108, General Practical Chemistry II | Metadata and seven outcomes match. Local summary accurately represents the complete short source contents paragraph; the individual practical assays are already in outcomes. **Confirmed match.** |
| 9 — MTH 101, Elementary Mathematics I | Metadata and all five outcomes align. Local summary ends mid-trigonometry at 400 characters; detail block adds “Algebra and Trigonometry” to the table title. **Defect: content truncation; preserve title variant.** |
| 10 — MTH 103, Elementary Mathematics III | Metadata and three outcomes align. Local summary ends mid-kinematics at 400 characters; detail block adds “Vectors, Geometry and Dynamics” to the table title. **Defect: content truncation; preserve title variant.** |

Locators: Railway 100-level table, printed p.1122; chemistry blocks, pp.1126–1127 (also common blocks pp.126–127); GET 102, pp.45–46; mathematics, pp.206–209. Shared CCMAS data was not edited.

## Local handoff

- GET 102: restore all remaining contents, including viewports, sheet/surface modelling, material selection/rendering and named example tools.
- CHM 101: split source outcome 10 from outcome 9 and restore the full content summary.
- CHM 102: restore the missing contents through stereochemistry, organic compound classes and comparative inorganic chemistry.
- MTH 101/103: restore the remainder of each official content block after the 400-character cutoff.
- No changes recommended for CHM 107 or CHM 108.

Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_026.py`.

**Exact next cursor:** package 173, Railway Engineering, `engineering.json`, ordinal 11 — PHY 101.
