# Lane 1 increment 034 — CCMAS Physiotherapy PST 513

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** package 038, Allied Health Sciences → DPT Physiotherapy, PST 513 Research Methods.  
**Mode:** exact source comparison and confirmed content/provenance repair.

## Coverage check and source

PST 512's checkpoint identified PST 513 as the next cursor. General mapping/discovery indexes mention PST 513, but no exact DPT course-level reconciliation or repair was found. I checked the actual course row against both global and detailed CCMAS evidence.

Primary source: National Universities Commission, *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences* (2023), <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf>, accessed 2026-09-29.

| Field | NUC global table, printed p. 589 | NUC detailed block, printed p. 621 | Local row before reconciliation |
|---|---|---|---|
| Identity | PST 513 Research Methods | PST 513: Research Methods | Same |
| Load | 2 units, C, LH 30, PH dash | 2 Units C: LH 30 | 2, C, LH 30, PH null |
| Outcomes | — | Four outcomes: identify problems; describe search/review; describe designs/sampling; describe investigation process | Four, all substantively aligned |
| Contents | — | Research problems; literature search/review, electronic search and meta-analysis; designs/sampling/variables/data handling; referencing styles and dissertation/journal manuscripts | 400 characters, ends at “Referencing” |

## Reconciliation

The identity, workload and outcomes are supported and already correct. Completed only the truncated content summary to include the omitted referencing styles and manuscript-preparation content. Added the official URL, table/detail printed-page locators and access date. No course load or outcome text was changed.

Guarded repair: `apply_ccmas_pst513_content_provenance_repair_2026_09_29.py`. Regression: `test_ccmas_pst513_source_reconciliation_2026_09_29.py`.

**Next cursor:** PST 514. Check its exact audit/repair coverage before comparison.
