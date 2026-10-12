# Lane 1 increment 033 — CCMAS Physiotherapy PST 512

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** package 038, Allied Health Sciences → DPT Physiotherapy, PST 512.  
**Mode:** checkpoint-first exact source comparison and confirmed-field reconciliation.

## Coverage check

The prior cursor PST 511 was not reopened: increments 002–003 explicitly compared it with the official global/detailed source and verified its repaired outcomes and complete summary. Search of exact PST 512 audit/repair paths found no item-level checkpoint. The automated source inventory's truncation/provenance flags were treated as candidates, not as proof.

Primary source: National Universities Commission, *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences* (2023), <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf>, accessed 2026-09-29.

| Field | NUC global structure, printed p. 589 | NUC detailed block, printed p. 621 | Local row before reconciliation |
|---|---|---|---|
| Title | Physiotherapy Clinical Rotation in Neurology-II | Physiotherapy Clinical Rotation In Neurology | Detailed-style title without II |
| Load | 2 units, C; LH dash; PH 90 | 2 Units C: PH 90 | 2, C; LH null; PH null |
| Outcomes | — | Four clinical outcomes | Four matching outcomes; third differs only in punctuation/conjunction form |
| Content | — | Assessment and treatment for head/spinal injuries and neurosurgical cases; patient management-plan communication | 400 characters, cuts off mid-word before the complete communication scope |

## Reconciliation

- Set `ph=90`; both independent NUC presentations agree. Kept `lh=null`, matching the table dash.
- Used the global structure's `Neurology-II` in the canonical course title and added a note that the detailed heading omits “II”. This is a title notation variation within the same PST 512 identity, not a new course.
- Replaced the truncated summary with a faithful concise account of assessment, treatment/evaluation, neurosurgical cases and communication of management plans.
- Preserved all four outcomes. The local/source punctuation variation in outcome 3 does not change meaning, so it was not rewritten.
- Added official URL, both printed locators and access date.

Guarded repair: `apply_ccmas_pst512_source_reconciliation_2026_09_29.py`. Regression: `test_ccmas_pst512_source_reconciliation_2026_09_29.py`.

**Next cursor:** PST 513. Check exact prior coverage before source comparison.
