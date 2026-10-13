# Lane 1 increment 037 — CCMAS Physiotherapy PST 521

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** package 038, Allied Health Sciences → DPT Physiotherapy, PST 521 Physiotherapy in Geriatrics.  
**Mode:** exact source comparison and confirmed content/provenance repair.

## Coverage check and source

PST 515's checkpoint advanced the lane to PST 521 after skipping the previously audited PST 516. No exact PST 521 detail audit or repair was found. The NUC source used is *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences* (2023), <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf>, accessed 2026-09-29.

| Field | NUC global table, printed p. 589 | NUC detailed block, printed p. 623 | Local row before reconciliation |
|---|---|---|---|
| Identity/load | PST 521 Physiotherapy in Geriatrics; 2, C, LH 30, PH dash | 2 Units C: LH 30 | Same; 2/C/LH 30, PH null |
| Outcomes | — | Four outcomes on age-related changes, geriatrics/gerontology, management and safety | Four matching outcomes |
| Contents | — | Ageing theories/effects; common disorders; population and Nigerian care challenges; family support, home/institutional care, multidisciplinary geriatric care | Exactly 400 characters; cuts off at “breaking down of tradition” |

## Reconciliation

The course identity, workload and four outcomes are supported and already match. Completed the source-faithful content summary to include the family-support change, home versus institutional care and multidisciplinary approach; added the official URL, table/detail locators and access date. No values or outcomes were changed.

Guarded repair: `apply_ccmas_pst521_content_provenance_repair_2026_09_29.py`. Regression: `test_ccmas_pst521_source_reconciliation_2026_09_29.py`.

**Next cursor:** PST 522. Check its exact prior audit and repair before deciding whether to skip.
