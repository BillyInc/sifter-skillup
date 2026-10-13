# JAMB–CCMAS source audit — Lane 1 increment 053

**Date/access date:** 2026-09-29 (Africa/Lagos)  
**Partition:** JAMB rows 001–140 and CCMAS package indices 001–079  
**CCMAS item:** Accounting package 001, ACC 305 (course ordinal 21); detailed content/outcomes review.

## Reconciled coverage before source review

Checkpoint 002 already recorded the ACC 305 workload defect (source table 3 C, LH 30, PH 45; local 3 C, LH 45, PH null); it is not repeated here. The 2026-09-29 deterministic report has no exact detailed-source-adjudication join for ACC 305. ACC 303 (ordinal 20) was skipped because checkpoint 002 contains detailed findings.

## Source-backed findings

Primary source: [NUC Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf), accessed 2026-09-29; Accounting ACC 305 detailed block, printed pp. 43–44 (PDF text P41–P42, lines 1837–1855). The global course structure is printed p. 32; workload is carried from checkpoint 002.

- Course identity, title and ownership match: `ACC 305 Taxation I` in Accounting.
- All three `learning_outcomes` match the source block; `content_summary` covers the block's Nigerian tax administration, authorities, procedures and named taxation areas.
- The separate local `skills_learned` field is inconsistent: its five items describe public-sector accounting and government reporting/auditing, not this tax course. This is recorded as a source-backed field defect; no shared ledger was changed.
- The workload defect remains open and was not rechecked.

## Progress and resume point

One detailed course row reviewed; one auxiliary-field defect confirmed. Next CCMAS cursor is Accounting ordinal 22 (`ACC 306`), after checking the exact checkpoint joins. The JAMB cursor remains Civil Law occurrence `13db7f702d56c6f9`, with awarder cell/boundary unresolved. Shared ledgers and downstream domain/subgroup/role work remain untouched.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_1_2026-09-29_053_accounting_acc305_detail.json`.
