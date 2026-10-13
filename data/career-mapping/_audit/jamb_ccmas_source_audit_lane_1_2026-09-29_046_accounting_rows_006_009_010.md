# JAMB–CCMAS source audit — Lane 1 increment 046

**Date/access date:** 2026-09-29 (Africa/Lagos)  
**Partition:** JAMB rows 001–140 and CCMAS package indices 001–079  
**CCMAS items:** Accounting package index 001, ordinals 6, 9 and 10. Civil Law's JAMB awarder-cell cursor remains unresolved; this increment made no additional JAMB source check.

## Exact prior coverage reconciled

Accounting checkpoint 002 has detailed source findings for ACC 101, ACC 102, ACC 203 and ACC 206, so those were not repeated here. It does not contain a detailed course-block adjudication for AMS 104, GST 212 or ENT 211. The deterministic report has no prior source-adjudication or original-source-review join for these three exact Accounting record IDs. Ordinals 7–8 are skipped because ACC 101/102 are already source-checked; their package-specific decision must be carried forward rather than replayed.

## Source and findings

Primary source: [NUC Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf), accessed 2026-09-29. Accounting global structure: printed pp. 31–32. Detail locators: AMS 104 p. 35; GST 212 pp. 35–36; ENT 211 pp. 36–37.

| Ordinal / code | Source comparison | Disposition |
|---|---|---|
| 6 / AMS 104 | Code, package ownership, title and 2 C / LH 30 load match. All five source outcomes are represented. The local list has extra project-process/resource statements and repeated/concatenated entries; recorded as a candidate. The content summary covers much of the source but omits actors, bottlenecks and project life cycle; held as a summary-coverage candidate. | Candidate |
| 9 / GST 212 | Code and package match; local title is abbreviated relative to the detailed source title. The global table's wrapped/reordered title wording is retained as an internal source variation. Hours match. The eighth local outcome has CCMAS course-content text appended to the final learning outcome, and the local content summary stops at “Impact of” while the NUC block continues. | Confirmed content/outcome defect; title variation retained |
| 10 / ENT 211 | Code, title, package and 2 C / LH 15 / PH 45 match. All eight outcomes match the Accounting-specific NUC block. The local summary cuts off mid-word; the source continues through contemporary issues, support institutions, barriers and e-commerce. | Confirmed content defect |

The comparison is specific to these Accounting course rows. It does not transfer findings to same-code courses in other CCMAS programmes.

## Progress and next cursor

- Three uncovered course rows compared: two contain confirmed content/outcome defects; one remains a candidate for extra outcome/content-summary review.
- JAMB next cursor remains row 001 Civil Law occurrence `13db7f702d56c6f9`; only the complete official awarder cell and continuation boundary are open.
- CCMAS next cursor is Accounting ordinal 11, `ACC 201`; checkpoint 002 already checked workload, so resume with content/outcomes and do not repeat the workload check.
- Shared ledgers unchanged; no downstream domain, subgroup or role audit performed.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_1_2026-09-29_046_accounting_rows_006_009_010.json`.
