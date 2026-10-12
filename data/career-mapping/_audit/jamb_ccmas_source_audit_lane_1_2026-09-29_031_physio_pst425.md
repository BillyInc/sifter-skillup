# Lane 1 increment 031 — CCMAS Physiotherapy PST 425

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** package 038, Allied Health Sciences → DPT Physiotherapy, exact course PST 425.  
**Mode:** exact official-source comparison and local reconciliation.

## Coverage and source

Increment 030 named PST 425 as the next course. I checked the exact lane checkpoint/repair paths and the local row before comparing the official source. No exact PST 425 repair/checkpoint was found.

Primary source: National Universities Commission, *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences* (2023), <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf>, accessed 2026-09-29.

| Field | NUC source | Local row before reconciliation | Finding |
|---|---|---|---|
| Identity | PST 425, Psychiatry and Mental Health | Same title/context | Match |
| Units/status | 2 units, C | 2, C | Match |
| Hours | Global table printed p. 588: LH 15 / PH 15. Detailed course heading printed p. 619: LH 15; no PH stated. | LH 15 / PH 45 | **Source-internal conflict remains unresolved.** No value changed. |
| Outcomes | Five outcomes, detailed pp. 619–620 | Five outcomes; outcome 5 ends with `Allied Health Sciences  620  New` | Removed only the confirmed page-footer spill; preserved the outcome wording. |
| Contents | Printed p. 620 covers psychiatric conditions, management considerations/counselling, burnout and psychological testing tools. | 400 characters, ends mid-word at `neuros` | Completed the source-faithful summary; item-level provenance added. |

## Local reconciliation

Updated `CCMAS:Allied Health Sciences:Physiotherapy:PST 425` with the complete contents summary, clean fifth outcome, NUC URL/printed locators/access date, and an explicit source-conflict note for the inconsistent PH values. Retained `LH=15` and the existing `PH=45` without claiming that the disagreement is resolved. The separate global-table value `PH=15` is recorded in the note and JSON evidence. No outcome wording was otherwise rewritten.

Guarded repair: `apply_ccmas_pst425_content_provenance_repair_2026_09_29.py`. Regression: `test_ccmas_pst425_source_reconciliation_2026_09_29.py`.

**Next cursor:** PST 426. Check its exact source/repair coverage first, then compare its global table and detailed course/examination block.
