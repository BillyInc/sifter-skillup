# Lane 3 CCMAS source increment 023 — Petroleum Engineering rows 33–35

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.  
**Progress:** Three previously unreviewed course occurrences compared. Forty-seven of 49 package occurrences are now source-compared; two remain.

## Prior-work reconciliation

Reconciled every lane-3 source checkpoint against all 49 local package rows, using ordinal plus course code so duplicate codes remain distinct. The only unreviewed rows were ordinals 33, 34, 35, 45 and 46. Ordinal 36 PEE 304 and ordinals 37–44/47–49 were already covered in increments 010–013 and were skipped. This corrects the cumulative count/cursor inherited from increment 022 without rewriting earlier append-only records.

## Findings

| Ordinal / course | Comparison | Disposition |
|---|---|---|
| 33 — GET 305, Engineering Statistics and Data Analytics | Table/detail agree on 3 C, LH 45; six outcomes align. Local content is cut off at 400 characters, before the published R language/statistical-programming topics. Local terminal period retained as punctuation only. | **Confirmed content truncation.** |
| 34 — GET 306, Renewable Energy Systems and Technologies | Table title/workload align (3 C, LH 30, PH 45), five outcomes align. Detail block uses singular “Technology.” Local 400-character summary omits later sustainability and the distinct practical contents section. | **Confirmed content truncation; preserve title variant.** |
| 35 — GET 307, Introduction to Artificial Intelligence, Machine Learning and Convergent Technologies | Table/detail agree on 3 C, LH 45; eight outcomes align. Local summary truncates before neural networks, deep learning and Python AI libraries. | **Confirmed content truncation.** |

Findings are recorded for local reconciliation. Shared CCMAS data remains untouched.

**Exact next cursor:** CCMAS package 172, local ordinal 45 — GET 402, Engineering Project I. Ordinal 46 (GET 404) is the only other unreviewed occurrence.

Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_023.py`.
