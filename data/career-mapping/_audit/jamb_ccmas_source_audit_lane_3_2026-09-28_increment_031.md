# Lane 3 CCMAS source increment 031 — Railway Engineering rows 34–38

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.  
**Progress:** Five further rows checked; 38 of 42 Railway Engineering occurrences now have source comparison.

## Findings

| Ordinal / course | Result |
|---|---|
| 34 — GET 304, Technical Writing and Communication | Metadata and all three outcomes align; local contents cut at 400 characters, before technical reports, proposals, research/data handling, presentations and IP. **Truncation.** |
| 35 — GET 305, Engineering Statistics and Data Analytics | Metadata and six outcomes align. Local contents cut at 400 characters before substantial R/statistical programming content. The source names R, Python, Mathematica, MATLAB and Design Expert. **Truncation.** |
| 36 — GET 306, Renewable Energy Systems and Technology | Five outcomes match, but local contents truncate at 400. Railway table gives LH45 and a literal underscore in PH; detailed heading gives LH30/PH45. **Truncation plus unresolved schedule/detail conflict.** |
| 37 — GET 307, Artificial Intelligence, Machine Learning and Convergent Technologies | Eight outcomes match; summary truncates before convergent technology, neural networks, deep learning and Python AI libraries. Railway table says LH30; detail says LH45. **Truncation plus unresolved conflict.** |
| 38 — GET 399, SIWES II | Local has 15 outcomes where the official GET 399 block has seven: two GET 402 outcomes and six GET 404 outcomes have leaked into this record. The summary is also truncated. Railway schedule says 4* units/12 weeks; detailed SIWES II block says 3 units/12 weeks. **Course-boundary contamination and unresolved source-units conflict.** |

Locators: Railway 300-level table, printed p.1123; GET 304–307 details, pp.1141–1144; GET 399 detail, pp.1145–1147. Preserve the Railway schedule/detail discrepancies; no value has been inferred.

## Local reconciliation handoff

- GET 304/305: restore contents after the current cutoffs.
- GET 306/307: restore complete course contents and retain each hours discrepancy as unresolved.
- GET 399: retain only its seven SIWES II outcomes; separate the GET 402 and GET 404 outcomes into their own source rows; restore the full contents; retain the 4* versus 3-unit conflict for adjudication.

Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_031.py`.

**Exact next cursor:** package 173, Railway Engineering, `engineering.json`, ordinal 39 — RAE 301. Rows 1–38 are covered; four remain.
