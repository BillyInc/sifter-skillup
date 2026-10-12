# Lane 3 CCMAS source increment 025 — Railway Engineering rows 1–3

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.  
**Progress:** Began the next uncovered lane-3 package, Railway Engineering (package 173). Three of 42 course occurrences are now source-compared.

## Findings

| Ordinal / course | Comparison | Disposition |
|---|---|---|
| 1 — GST 111, Communication in English | Table, 2 C, LH 15/PH 45, and all seven outcomes align. Local summary is exactly 400 characters and omits most of the remaining published contents. | **Confirmed content truncation.** |
| 2 — GST 112, Nigerian Peoples and Culture | Table, 2 C, LH 30/no PH, and all eight outcomes align. Local summary ends mid-phrase at “nationalist movement fo…” before most syllabus topics. | **Confirmed content truncation.** |
| 3 — GET 101, Engineer in Society | Common GET course identity, 1 C, LH 15/no PH, and five outcomes align with its Railway table occurrence. The 400-character local summary ends after “Safety”, omitting later content. | **Confirmed content truncation.** |

Railway's 100-level table is at printed p.1122; GST 111 and GST 112 course details are at pp.1124–1125. GET 101's common course detail is at pp.45–46; its appearance in Railway's table confirms that this is an included course, not an assumed programme-specific row. Shared course data was not edited.

## Local handoff

- GST 111: restore the rest of the published reasoning, ethics/copyright, writing, ICT, communication and public-speaking contents.
- GST 112: restore the remaining history/culture, nation-building, trade, justice, citizenship, values and re-orientation contents.
- GET 101: restore risk analysis, engineering competency skills and professional-association seminars/lectures after safety.

Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_025.py`.

**Exact next cursor:** Railway Engineering, package 173, `engineering.json`, ordinal 4 — GET 102.
