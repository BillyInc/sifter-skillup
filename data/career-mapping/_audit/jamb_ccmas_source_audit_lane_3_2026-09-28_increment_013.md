# Lane 3 CCMAS source increment 013 — Petroleum Engineering PEE 312, 313, 401 and 405

**Checked:** 2026-09-28 (Africa/Lagos)  
**Primary source:** NUC, [Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), accessed 2026-09-28.  
**Progress:** four additional course rows compared. Fourteen of 49 package-172 row occurrences are now compared across increments 009–013; 35 remain. Package 172 is still open.

## Prior-work reconciliation

Increments 009–012 checked PEE 101, 201, 304–310 (selected rows) and two separate GET 399 SIWES occurrences. This increment checks PEE 312, 313, 401 and 405, which were not present in those prior lane-3 increments. Shared product ledgers were not edited.

## Findings

| Course | Source and local comparison | Disposition |
|---|---|---|
| PEE 312 — Production and Reservoir Laboratory | The 300-level global table (printed p. 1086) lists 2 C, PH 90. The detailed block (printed pp. 1107–1108) says 2 C, PH 45, and provides two outcomes and content on applying reservoir/production theories, Darcy's law, emulsion treatment and sand consolidation. Local title, units/status, outcomes and content align; local PH 90 matches the global table. | **Source conflict (practical hours).** Preserve both NUC values; do not overwrite the table-aligned local PH 90 based only on the course detail. |
| PEE 313 — Applied Geophysics and Petroleum Exploration | Global table p. 1086 and detailed block p. 1108 agree on 2 C, LH 30. Detail has three outcomes and continues content through geophysical borehole logging, prospecting and exploration. Local title/structure and three outcomes align, but its content ends after seismic reflection methods/time lapse. | **Confirmed content-truncation defect.** |
| PEE 401 — Entrepreneurship and Startup/Oil and Gas Business Project | The course-contents table p. 1086 lists 2 E, LH 30. The detailed block (printed p. 1110) gives four outcomes and extensive content: Nigerian/global business context, entrepreneurship/technopreneurship, Nigerian-content opportunities, registration/funding, joint ventures, marketing, personnel/client management, proposals/plans, oil-and-gas venture profiles, digitization/financial management, sustainability and team projects. Local title/metadata and four outcomes align, but local `content_summary` is only a title-like sentence and omits the detailed syllabus. | **Confirmed content omission.** Retain the slight title variation between the programme table and detailed block. |
| PEE 405 — Introduction to Well Logging and Interpretation | Course-contents table p. 1086 gives 2 C, LH 30 and the title `Introduction to Well Logging and Interpretation`; detailed block pp. 1110–1111 shortens the title to `Well Logging and Interpretation`. Eight outcomes and the source syllabus include logging tools, interpretation/cross-plots, formation properties, proper-log selection and PETREL-based analysis. Local title/metadata and eight outcomes align; local content stops at `Guidelines for`. | **Confirmed content-truncation defect; title variation preserved.** |

The PEE 312 contact-hour disagreement is a primary-source conflict, not an extraction defect. The other dispositions are based on substantive official syllabus text absent from the local content field, not on title similarity alone.

## Remaining work

Package 172 has **35 row occurrences** not source-adjudicated in Lane 3 across increments 009–013. The remaining rows include common engineering/GST/ENT courses and course-table occurrences; compare package ownership and exact row contexts rather than deduplicating shared codes. Lane-3 JAMB identity/offering occurrences 281–420 remain an independent open coverage dimension.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_3_2026-09-28_increment_013.json`.
