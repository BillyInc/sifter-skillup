# JAMB–CCMAS source audit — Lane 1 increment 051

**Date/access date:** 2026-09-29 (Africa/Lagos)  
**Partition:** JAMB rows 001–140 and CCMAS package indices 001–079  
**CCMAS item:** Accounting package 001, ENT 312 (course ordinal 17); full field review.

## Reconciled coverage before source review

Checkpoint 002 establishes Accounting's ordered course-code structure but explicitly leaves detailed fields open. The deterministic report has no exact source-adjudication join for this course. GST 312 (ordinal 16) was closed in increment 050 and ACC 301 (ordinal 18) already has a detailed-block finding in checkpoint 002; neither is repeated.

## Source-backed findings

Primary source: [NUC Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf), accessed 2026-09-29. The Accounting global table lists ENT 312 on printed p. 32 (PDF text P30); the detailed Accounting block is printed pp. 40–42 (PDF text P39–P40, lines 1713–1747).

- Identity and title match: `ENT 312 Venture Creation` in Accounting.
- Workload matches exactly: 2 units, C, LH 15, PH 45.
- The local outcomes include the source outcomes but fuse source outcomes 8 and 9 together and then repeat both as separate list entries. The result is redundant/duplicated structured outcome content.
- The local content summary ends after “Micro finance, personal savings,”; the source continues with the remaining entrepreneurship, marketing, communication, opportunity-discovery and technology/e-commerce curriculum. This is confirmed truncation.

## Progress and resume point

One new Accounting course row received full field review. Two field-level defects (outcome duplication/fusion and content truncation) were confirmed; no prior source check was repeated. Next CCMAS cursor is Accounting ordinal 19 (`ACC 302`), with checkpoint 002's detailed finding to be carried forward. JAMB remains at Civil Law occurrence `13db7f702d56c6f9`, awarder cell/boundary unresolved. No shared ledger or downstream domain/subgroup/role review.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_1_2026-09-29_051_accounting_ent312_detail.json`.
