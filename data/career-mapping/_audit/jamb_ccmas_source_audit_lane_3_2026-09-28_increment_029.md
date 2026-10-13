# Lane 3 CCMAS source increment 029 — Railway Engineering rows 24–28

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.  
**Progress:** Five more course occurrences checked; 28 of 42 Railway Engineering rows now have source comparison.

## Findings

| Ordinal / course | Result |
|---|---|
| 24 — GET 208, Strength of Materials | Schedule metadata and all eight outcomes match. Local summary is only 96 characters and omits key source contents including equilibrium, composite members, generalized Hooke's law, temperature effects and beam/stress topics. **Incomplete summary.** |
| 25 — GET 209, Engineering Mathematics I | Metadata, all six outcomes and the 232-character concise summary match the complete short source contents list. **Confirmed match.** |
| 26 — GET 210, Engineering Mathematics II | Metadata and all seven outcomes match. Local 400-character summary stops mid-sentence, omitting the remaining calculus and complex-analysis topics. **Truncation.** |
| 27 — GET 211, Computing and Software Engineering | Metadata, all six outcomes and the Python/Java/C++ option align. Local summary truncates during basic computer-system contents, before programming, MATLAB, ICT, IoT and software engineering. **Truncation.** |
| 28 — RAE 201, Railway Communications and Signal | Local matches the Railway table (singular title; 2 C LH30); all three outcomes align. Contents truncate after colour-light signals. The detailed heading uses plural “Signals” and says 3 C LH45. **Truncation plus unresolved internal NUC table/detail conflict.** |

Locators: Railway Engineering 200-level schedule, printed p.1123; GET 208–211 details, pp.1135–1137; RAE 201 detail, pp.1138–1139. The offering table is retained as the source for offering-specific values, but conflicts with the detailed heading remain recorded—not silently overwritten.

## Local reconciliation handoff

- GET 208: expand its summary to cover the full source outline.
- GET 210: restore course contents after the 400-character cutoff.
- GET 211: restore the syllabus remainder, including programming, MATLAB, ICT, IoT and software-engineering elements.
- RAE 201: restore full Railway contents and preserve both table/detail title and hours values as an unresolved conflict pending authoritative clarification.
- No edit recommended for GET 209.

Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_029.py`.

**Exact next cursor:** package 173, Railway Engineering, `engineering.json`, ordinal 29 — GET 299. Rows 1–28 are covered; 14 of 42 course occurrences remain.
