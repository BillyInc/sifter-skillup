# JAMB–CCMAS source audit — Lane 1 increment 047

**Date/access date:** 2026-09-29 (Africa/Lagos)  
**Partition:** JAMB rows 001–140 and CCMAS package indices 001–079  
**CCMAS item:** Accounting package 001, ACC 201 (course ordinal 11), content/outcomes only.

## Coverage reconciliation

Checkpoint 002 already compared ACC 201's workload with the global course table and recorded the discrepancy (source 3 C, LH 30, PH 45; local LH 45, PH null). That source-closed field is carried forward and was not rechecked. The deterministic discovery report has no prior source-adjudication join for ACC 201's course detail. This increment compares only title/ownership, learning outcomes and content against the exact detailed block.

## Source-backed result

Primary source: [NUC Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf), accessed 2026-09-29; Accounting ACC 201 detailed block, printed pp. 37–38 (PDF text lines 1561–1579).

- The source and local row agree on `ACC 201 Financial Accounting I` and Accounting package ownership.
- All eight local learning outcomes correspond to the source sequence. The source repeats the IFRS 15 revenue outcome at positions 5 and 8, and the local row preserves that source repetition.
- The local content summary covers the source topics: the IASB framework; IFRS 15 and IAS 1; inventory under IAS 2; accounting policies under IAS 8; property, plant and equipment under IAS 16; grants under IAS 20; and borrowing costs under IAS 23.
- The prior workload discrepancy remains open for later reconciliation; no workload review was repeated.

Disposition for newly reviewed fields: confirmed match. Overall ACC 201 remains a row with a previously confirmed workload defect.

## Progress and resume point

- New course rows with content/outcome review: 1 (`ACC 201`).
- New defects: 0; previously checked workload fields repeated: 0.
- Next JAMB cursor: row 001 Civil Law occurrence `13db7f702d56c6f9`; complete awarder-cell evidence remains unresolved.
- Next CCMAS cursor: Accounting package 001, ordinal 12 (`ACC 202`), content/outcomes only; carry forward the checkpoint 002 workload result.
- Shared ledgers unchanged; no downstream domain/subgroup/role review.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_1_2026-09-29_047_accounting_acc201_detail.json`.
