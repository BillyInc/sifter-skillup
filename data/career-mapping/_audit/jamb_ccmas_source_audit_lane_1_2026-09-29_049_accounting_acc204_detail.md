# JAMB–CCMAS source audit — Lane 1 increment 049

**Date/access date:** 2026-09-29 (Africa/Lagos)  
**Partition:** JAMB rows 001–140 and CCMAS package indices 001–079  
**CCMAS item:** Accounting package 001, ACC 204 (course ordinal 14); content/outcomes only.

## Reconciled coverage before source review

Checkpoint 002 already records ACC 204's workload difference (NUC 3 C, LH 30, PH 45; local 3 C, LH 45, PH null). I carried that finding forward without repeating the comparison. ACC 203 (ordinal 13) and ACC 206 (ordinal 15) have exact detailed-block findings in checkpoint 002 and were skipped. The deterministic discovery report has no exact source-adjudication join for ACC 204's outcomes/content.

## Source-backed findings

Primary source: [NUC Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf), accessed 2026-09-29. The global table is printed p. 32 (PDF text P30, ACC 204 row); the detailed course block is printed pp. 39–40 (PDF text lines 1632–1657).

- Identity, title and programme ownership match: `ACC 204 Cost Accounting`, Accounting.
- The local five outcomes are not the nine in the exact course block. The NUC outcomes address cost-accounting systems and departments; cost elements and behaviour; materials, labour and overhead; costing methods and process gains/losses; integrated/interlocking accounts; marginal/standard costing and variance analysis; and functional/cash budgets. The local list instead emphasizes decision applications, linear programming, investment proposals, transfer pricing and decision trees. This is a confirmed outcomes defect.
- The local content summary faithfully covers the source block's described scope; content is a confirmed match.
- The separate workload mismatch remains open from checkpoint 002 and was not rechecked here.

## Progress and resume point

One new exact course row received content/outcome comparison; one new defect was confirmed. No prior workload comparison was repeated. Next CCMAS cursor is Accounting ordinal 16 (`GST 312`), after checkpoint reconciliation. The JAMB cursor remains Civil Law occurrence `13db7f702d56c6f9`; its awarder cell/continuation boundary is unresolved, and title/faculty checks are not repeated. Shared ledgers and downstream domains/subgroups/roles were untouched.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_1_2026-09-29_049_accounting_acc204_detail.json`.
