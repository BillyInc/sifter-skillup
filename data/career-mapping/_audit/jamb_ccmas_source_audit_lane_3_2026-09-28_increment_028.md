# Lane 3 CCMAS source increment 028 — Railway Engineering rows 16–23

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.  
**Progress:** Eight more course occurrences checked; 23 of 42 Railway Engineering rows now have source comparison.

## Findings

| Ordinal / course | Result |
|---|---|
| 16 — ENT 211, Entrepreneurship and Innovation | Schedule metadata and all eight outcomes match. Local 400-character contents stop during the entrepreneur-characteristics section; major later syllabus areas are missing. **Confirmed truncation.** |
| 17 — GST 212, Philosophy, Logic and Human Existence | Schedule and eight outcomes match except the last local outcome contains a spillover: after its actual final sentence, it appends syllabus text beginning “inference. Informal fallacies…”. The separate content summary is also cut at 400 characters and repeats part of that text. **Field-boundary contamination and truncation.** |
| 18 — GET 201, Applied Electricity I | Four outcomes match, including the source's split outcome 3/4 phrasing. The 64-character local summary omits most listed topics. The Railway schedule says LH45/no PH, while the generic detail says LH30/PH45; local follows the Railway-specific schedule. **Incomplete summary; source-hours conflict retained unresolved.** |
| 19 — GET 202, Engineering Materials | Schedule and all eight outcomes match. Contents stop at 400 characters, before most materials topics. **Confirmed truncation.** |
| 20 — GET 203 | Local title has “2 C 15 45” appended; units and hours are null. Railway's table gives 2 C LH15 PH45, while the generic detailed heading gives 3 C LH30 PH45. Five outcomes align in substance; the 109-character summary omits most of the published course coverage. **Extraction corruption, incomplete summary, and unresolved source-hours conflict.** |
| 21 — GET 204, Students Workshop Practice | Local matches Railway table metadata and all six outcomes, but contents are cut mid-word at 400 characters. The generic detailed heading adds LH15; the Railway schedule leaves LH blank and lists PH45. **Truncation; preserve the unresolved schedule/detail discrepancy.** |
| 22 — GET 205, Fundamentals of Fluid Mechanics | Railway schedule metadata, all eight outcomes and the complete concise contents paragraph align. **Confirmed match; no repair recommended.** |
| 23 — GET 206, Fundamentals of Thermodynamics | Railway title and schedule metadata match local; detailed heading adds “Engineering.” All 13 outcomes align. Contents are cut at 400 characters. **Confirmed truncation; preserve title variant.** |

Railway schedule locator: printed p.1123. Railway detailed blocks: pp.1132–1136. The title/hours discrepancies on GET 201, GET 203 and GET 204 are not silently resolved: offering-specific schedules and generic course-detail headings differ. In each row, retain the Railway schedule values while flagging the separate detail conflict for reconciliation. Duplicate course-code occurrences remain distinct by ordinal.

## Local reconciliation handoff

- ENT 211: restore contents after the 400-character cutoff through innovation, enterprise formation, contemporary entrepreneurship and e-commerce.
- GST 212: remove syllabus spillover from outcome 8, retain only the actual outcome, and rebuild the complete separate content summary without duplicated text.
- GET 201: expand the short summary to cover the official topic list; retain Railway schedule hours and separately log the generic-detail discrepancy.
- GET 202: restore the complete contents after the cutoff, including ceramics, polymers, composites, nanomaterials, testing and integrity assessment.
- GET 203: separate schedule tokens from the title, restore Railway table values (2/C/LH15/PH45), expand the summary, and leave the generic-detail hours conflict unresolved.
- GET 204: restore contents after the cutoff; preserve Railway-table hours and separately record detailed-block LH15/PH45.
- GET 206: restore the remaining thermodynamics contents; keep the Railway title and document the longer detail title.
- No data edit recommended for GET 205.

Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_028.py`.

**Exact next cursor:** package 173, Railway Engineering, `engineering.json`, ordinal 24 — GET 208. Rows 1–23 are covered; 19 of 42 course occurrences remain.
