# Lane 3 CCMAS source increment 022 — Petroleum Engineering rows 29–32

**Checked:** 2026-09-29 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.  
**Progress:** Four new rows compared. Forty-five of 49 Petroleum Engineering package rows have now been source-compared; four remain. The package is not yet closed.

## Cursor correction

Increment 021's next-cursor field named PEE 202. Re-enumerating the actual local package array shows ordinal 29 is GET 299, followed by GST 312, ENT 312 and GET 304. The earlier checkpoint remains unchanged as an append-only record; this increment resumes at the actual first unchecked row.

## Findings

| Ordinal / course | Comparison | Disposition |
|---|---|---|
| 29 — GET 299, SIWES I | Official table says SIWES I: Students Work Experience Scheme, 3 C, 9 weeks; detail calls it Students Industrial Work Experience I. The local title absorbs “3 C 9 Weeks,” units are null, and only two of the four official outcomes remain. The summary also cuts off at “fab”. | **Confirmed title/field parse defect, two missing outcomes and summary truncation.** |
| 30 — GST 312, Peace and Conflict Resolution | Two C, LH 30 and all five outcomes align. Local 400-character summary ends during the conflict-causes list; the official syllabus continues across peacebuilding, justice, peacekeeping, institutions and post-conflict topics. | **Confirmed summary truncation.** |
| 31 — ENT 312, Venture Creation | Two C, LH 15, PH 45 and all nine outcomes align. Local summary cuts off during entrepreneurial-finance sources, omitting later management, negotiation, pitching and technology/e-commerce material. | **Confirmed summary truncation.** |
| 32 — GET 304, Engineering Communication, Technical Writing and Presentation | Table title matches the local form; detailed block uses “Technical Writing and Communication.” Three outcomes and workload align. Local summary is truncated at 400 characters before report writing, proposals, presentation, IP and case studies. | **Confirmed summary truncation; retain title variants.** |

Findings are recorded for local reconciliation; no shared CCMAS rows were edited.

**Exact next cursor:** CCMAS package 172, local course ordinal 33 — GET 305, Engineering Statistics and Data Analytics. Four rows remain unreviewed for source adjudication.

Regression test: `test_jamb_ccmas_source_audit_lane_3_increment_022.py`.
