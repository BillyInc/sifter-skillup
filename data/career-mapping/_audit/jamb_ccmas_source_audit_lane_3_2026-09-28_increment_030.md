# Lane 3 CCMAS source increment 030 — Railway Engineering rows 29–33

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.  
**Progress:** Five further occurrences checked; 33 of 42 Railway Engineering rows now have source comparison.

## Findings

| Ordinal / course | Result |
|---|---|
| 29 — GET 299, SIWES I | Local title absorbs `3 C 9 weeks`; units are null, and only outcomes 3–4 of four are present. The summary is cut mid-word. The table marks it 3* C, nine weeks and experiential/not counted in total. **Title/metadata extraction corruption, missing outcomes and truncation.** |
| 30 — GST 312 | Railway schedule calls it Venture Creation, 2 units, LH15/PH45. The detailed GST 312 block calls it Peace and Conflict Resolution, 2 units, LH30. Local title/hours follow the table, but its outcomes and contents are peace/conflict. **Unresolved primary-source identity/hours conflict; local fields mix the two.** |
| 31 — ENT 312 | Railway schedule calls it Peace and Conflict Resolution, 2 units/LH30. Detailed ENT 312 calls it Venture Creation, 2 units/LH15/PH45. Local title/hours follow the table, but outcomes and contents are venture creation. **Paired unresolved identity/hours conflict.** |
| 32 — GET 301, Engineering Mathematics III | Metadata and all five outcomes align. Local `content_summary` repeats outcome text instead of the source course contents. **Course-content field contamination; actual syllabus summary missing.** |
| 33 — GET 302, Engineering Mathematics IV | Metadata and all six outcomes align. Local contents omit much of the source’s transforms, finite differences, interpolation and numerical methods. **Incomplete summary.** |

Locators: Railway schedules, printed pp.1123–1124; GET 299 and GST/ENT 312, pp.1137–1140; GET 301/302, p.1140. The GST/ENT discrepancy is retained for source adjudication; neither row is “fixed” by guessing which part of the CCMAS is wrong.

## Local reconciliation handoff

- GET 299: restore the clean SIWES title, units and duration in their proper fields; add the two missing outcomes and finish the contents. Keep the asterisk/experiential-total note.
- GST 312 / ENT 312: hold remapping until the paired schedule/detail reversal is resolved; preserve both source statements and flag that the current row combines them.
- GET 301: replace the outcomes copied into `content_summary` with the actual official contents.
- GET 302: complete the summary through transforms, finite differences, numerical methods and integration/differentiation.

Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_030.py`.

**Exact next cursor:** package 173, Railway Engineering, `engineering.json`, ordinal 34 — GET 304. Rows 1–33 are covered; 9 of 42 remain.
