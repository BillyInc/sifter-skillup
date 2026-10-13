# Lane 3 CCMAS source increment 027 — Railway Engineering rows 11–15

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.  
**Progress:** Five additional Railway Engineering occurrences compared; 15 of 42 now have source-comparison coverage.

## Findings

| Ordinal / course | Result |
|---|---|
| 11 — PHY 101, General Physics I | Metadata and eight outcomes align. The detail adds “Mechanics” to the table title. Local 400-character content is truncated before the rest of work/energy, rotation and gravitation. **Defect: content truncation.** |
| 12 — PHY 103, General Physics III | Metadata and six outcomes align. Detail adds “Behaviour of Matter” to the table title; local summary ends mid-Hooke's-law topic. **Defect: content truncation.** |
| 13 — PHY 107, General Practical Physics I | Metadata and five outcomes align. Local summary cuts off during the final official emphasis on measurement and data analysis. **Defect: content truncation.** |
| 14 — PHY 108, General Practical Physics II | Metadata and six outcomes align. Local summary cuts off mid-word in the final official course-content sentence. **Defect: content truncation.** |
| 15 — RAE 102, Introduction Railway Engineering | Table title omits “to”; the course detail includes it. Metadata and eight outcomes match and the 371-character local summary completely covers the published course contents. **Title wording variant preserved; no data edit recommended.** |

Railway's 100-level table is at printed p.1122; common Physics course blocks are in the NUC PDF's Physics/common-course section, and RAE 102 is detailed at printed pp.1130–1131. Shared CCMAS data was not edited.

## Local handoff

- PHY 101: restore the remaining mechanics syllabus after the 400-character cutoff.
- PHY 103: restore the remaining elasticity, hydrostatics and fluid syllabus after the cutoff.
- PHY 107/108: restore each complete final sentence on observation, measurement, data collection, analysis and deduction.
- No source-data change recommended for RAE 102.

Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_027.py`.

**Exact next cursor:** Railway Engineering, package 173, `engineering.json`, ordinal 16 — ENT 211.
