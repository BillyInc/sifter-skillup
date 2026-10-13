# Lane 3 CCMAS source increment 032 — Railway Engineering rows 39–42

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.  
**Progress:** Final four course occurrences checked; all 42 Railway Engineering rows now have source comparison.

## Findings

| Ordinal / course | Result |
|---|---|
| 39 — RAE 301, Introduction to Railway | Official course has two outcomes. Local has six: it repeats all four RAE 302 outcomes in this row and again in RAE 302. Contents also truncate at 400 characters. **Cross-course outcome contamination and truncation.** |
| 40 — RAE 302, Principles of Soil Mechanics and Engineering Geology | Metadata and all four outcomes match. The 142-character summary omits soil formation/properties, compaction, earth pressure and consolidation. **Incomplete summary.** |
| 41 — RAE 303, Railway Train Operations Management | Table metadata and all three outcomes align. Table specifies PH45; the detailed header lists LH30 but does not specify PH. Contents truncate mid-syllabus at 400 characters. **Truncation; retain the locator difference without interpreting omission as zero.** |
| 42 — RAE 304, Railway Infrastructure Engineering | Schedule and all seven outcomes align. Contents truncate before switches/crossings, electrification, slab track and maintenance. Schedule says LH15/PH45; detail heading says LH30 and does not list PH. **Truncation and schedule/detail hours difference.** |

Locators: Railway schedule, printed p.1123; RAE 301 pp.1143–1144; RAE 302/303 p.1144; RAE 304 p.1145. All 42 Railway Engineering course occurrences are now source-compared. Shared data remains untouched.

## Local reconciliation handoff

- RAE 301: remove RAE 302’s four soil outcomes from RAE 301; keep its two official outcomes and restore the remainder of the contents.
- RAE 302: expand its content summary to cover soil formation/properties, compaction, earth pressures and consolidation.
- RAE 303: restore the complete contents and note the schedule’s PH45 versus the detailed header’s unspecified PH.
- RAE 304: restore switches/crossings, overhead electrification, slab track and maintenance; retain the table/detail hours difference for clarification.

Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_032.py`.

**Package closed:** package 173, Railway Engineering, 42/42 course occurrences source-compared.  
**Exact next cursor:** package 174, Structural Engineering, `engineering.json`, ordinal 1 — GST 111.
