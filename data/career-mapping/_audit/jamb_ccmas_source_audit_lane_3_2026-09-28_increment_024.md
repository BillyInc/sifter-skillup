# Lane 3 CCMAS source increment 024 — Petroleum Engineering rows 45–46

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.  
**Progress:** Checked the final two previously open course occurrences. All 49 Petroleum Engineering rows now have occurrence-specific source-comparison coverage across increments 009–024; duplicate GET 399 rows remain separate occurrences.

## Findings

| Ordinal / course | Comparison | Disposition |
|---|---|---|
| 45 — GET 402, Engineering Project I | The Petroleum table and detailed block agree on 2 units, C, PH 90, and two learning outcomes. Local data has LH 90 / PH blank, so the hours are assigned to the wrong field. Its concise content summary is broadly aligned but omits the source's group-work preference and satisfactory-review qualifier. | **Confirmed local hours defect; exact local repair handed off.** |
| 46 — GET 404 | The programme table says “Engineering Valuation and Costing”; its detailed block says “Engineering Valuation and Appraisal.” Local title matches the table. LH 30 and six outcomes match, and all substantive content topics are represented. Preserve the title variation and the source's repeated “personal property” phrase in outcome 6. | **Official source title conflict; no local title change recommended.** |

The course table is at printed pp. 1086–1087; the detailed GET 402/404 blocks are at printed pp. 1109–1110. Shared source data was not edited in this audit increment.

## Local handoff

- GET 402: in `engineering.json`, move 90 hours from `lh` to `ph`, retain the title/units/status/outcomes, and restore the two omitted content details in a concise summary.
- GET 404: no source-data change; retain the programme-table title and document the distinct detailed-block title.

Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_024.py`.

**Exact next cursor:** package 173, RAILWAY ENGINEERING, `engineering.json`, ordinal 1 — GST 111.
