# JAMB–CCMAS source audit — Lane 1 increment 048

**Date/access date:** 2026-09-29 (Africa/Lagos)  
**Partition:** JAMB rows 001–140 and CCMAS package indices 001–079  
**CCMAS item:** Accounting package 001, ACC 202 (course ordinal 12), content/outcomes only.

## Exact prior coverage

Checkpoint 002 already source-checked the ACC 202 global-table workload and recorded the mismatch (source 3 C, LH 30, PH 45; local LH 45, PH null). That field is carried forward without a new comparison. Deterministic discovery has no source-adjudication join for this row's course detail. ACC 203 at ordinal 13 is skipped because checkpoint 002 already records its exact detailed-block outcome mismatch and workload comparison.

## Source-backed result

Primary source: [NUC Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf), accessed 2026-09-29; Accounting ACC 202 detailed block, printed pp. 38–39 (PDF text lines 1582–1599).

- `ACC 202 Financial Accounting II` and Accounting ownership match.
- All seven local learning outcomes match the Accounting-specific source block in sequence and substance, including its Revenue and Grants outcome.
- The local content summary covers the source's financial-reporting framework, SMEGA/Level 3 guidance, partnership accounts, IFRS 11 joint arrangements and goods-on-sale-or-return accounting.
- The prior workload discrepancy remains open for reconciliation; this increment did not repeat that check.

Disposition for newly reviewed content/outcomes: confirmed match. The row retains its prior workload defect.

## Progress and resume point

- New course rows with content/outcome review: 1 (`ACC 202`); new defects: 0.
- Previously source-checked workload fields repeated: 0.
- Next JAMB cursor remains row 001 Civil Law occurrence `13db7f702d56c6f9`, awarder cell unresolved.
- Next CCMAS cursor: Accounting ordinal 14 (`ACC 204`), content/outcomes only; carry forward checkpoint 002's workload result.
- Shared ledgers unchanged; no downstream domain/subgroup/role review.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_1_2026-09-29_048_accounting_acc202_detail.json`.
