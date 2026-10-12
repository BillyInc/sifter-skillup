# JAMB–CCMAS source audit — Lane 1 increment 050

**Date/access date:** 2026-09-29 (Africa/Lagos)  
**Partition:** JAMB rows 001–140 and CCMAS package indices 001–079  
**CCMAS item:** Accounting package 001, GST 312 (course ordinal 16); content/outcomes only.

## Reconciled coverage before source review

Checkpoint 002 established the Accounting package's shared-course structure context. The NUC Accounting table and local record both show GST 312 as 2 C, LH 30; workload is carried forward, not checked again. Deterministic discovery has no exact source-adjudication join for this row's detailed content/outcomes. GST 312 occurs in multiple programme contexts, so this review is limited to the Accounting occurrence at ordinal 16 and the detailed block inside Accounting.

## Source-backed findings

Primary source: [NUC Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf), accessed 2026-09-29; Accounting GST 312 block, printed pp. 40–41 (PDF text P39, lines 1683–1711).

- Identity/title/ownership match the Accounting-specific `GST 312: Peace and Conflict Resolution` block.
- The first five local outcomes cover the five source outcomes. Four extra local entries are redundant: the final outcome appears as a split duplicate and a spelling-variant duplicate, and the first outcome is repeated with `analyse` instead of `analyze`. This is a confirmed structured-outcome defect.
- The local `content_summary` ends mid-word/phrase after “ethnic disputes and r”. The source continues through causes and examples of conflict, peacebuilding, mediation, alternative dispute resolution, international organisations, internally displaced people/refugees and NGOs. The summary is source-confirmed truncated.
- Workload was not rechecked.

## Progress and resume point

One exact course row received new detail/outcome review; one row-level defect finding (two affected fields) was confirmed. Next CCMAS cursor is Accounting ordinal 17 (`ENT 312`), after reconciling its existing source joins. JAMB remains on Civil Law occurrence `13db7f702d56c6f9`, with awarder cell/boundary unresolved. No shared ledger or downstream domain/subgroup/role review.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_1_2026-09-29_050_accounting_gst312_detail.json`.
