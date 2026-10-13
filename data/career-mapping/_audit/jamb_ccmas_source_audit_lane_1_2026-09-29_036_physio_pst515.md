# Lane 1 increment 036 — CCMAS Physiotherapy PST 515

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** package 038, Allied Health Sciences → DPT Physiotherapy, PST 515.  
**Mode:** exact global/detailed source comparison and local content/provenance repair.

## Coverage check and source

No exact PST 515 checkpoint or prior repair was found. PST 514 was the preceding source-verified row. The official source is the National Universities Commission, *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences* (2023), <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf>, accessed 2026-09-29.

| Field | NUC global table, printed p. 589 | NUC detailed block, printed p. 622 | Local row before reconciliation |
|---|---|---|---|
| Identity/load | PST 515 Spinal and Peripheral Joint Manipulation; 2, C, LH 30, PH dash | 2 Units C: LH 30 | Same title/load; null PH correctly represents dash |
| Outcomes | — | Five outcomes on mobilisation/manipulation, indications/contraindications, procedure and spinal techniques | Five, substantively matching |
| Contents | — | Mobilisation principles/procedure, manual cervical/lumbar traction, VBI safety/tests/signs; Cyriax, Mennel, Kaltenborn, Maitland, Nwuga and McKenzie | 400 characters, truncates during traction discussion |

## Reconciliation

The course identity, load and outcomes were already supported. Completed the truncated summary with the source's safety content (including VBI) and named techniques, and added NUC URL, printed-page locators and access date. No load or learning-outcome edits were needed.

The next course in the printed 500-level sequence is PST 516, but it was source-checked and repaired already in the 2026-09-28 Physiotherapy increments 002–003. That work also records the global-table versus detailed-block title variation. It is skipped rather than repeated; next uncovered code is PST 521.

Guarded repair: `apply_ccmas_pst515_content_provenance_repair_2026_09_29.py`. Regression: `test_ccmas_pst515_source_reconciliation_2026_09_29.py`.

**Next cursor:** PST 521. Check exact prior coverage before comparing.
