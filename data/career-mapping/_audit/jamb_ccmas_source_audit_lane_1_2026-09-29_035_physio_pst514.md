# Lane 1 increment 035 — CCMAS Physiotherapy PST 514

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** package 038, Allied Health Sciences → DPT Physiotherapy, PST 514 Biostatistics.  
**Mode:** exact source comparison and correction of extraction/content/provenance defects.

## Coverage check and source

PST 513 named PST 514 as next. Broad discovery/mapping records exist, but no course-specific source comparison or correction checkpoint was found. The local row was checked against the official table and detailed block.

Primary source: National Universities Commission, *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences* (2023), <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf>, accessed 2026-09-29.

| Field | NUC global table, printed p. 589 | NUC detailed block, printed pp. 621–622 | Local row before reconciliation |
|---|---|---|---|
| Identity/load | PST 514 Biostatistics; 2 units, C, LH 30, PH dash | 2 Units C: LH 30 | Matching 500/2/C, LH 30, PH null |
| Outcomes | — | Three outcomes: research statistics; collating/summarising data; select/apply tests | Three; outcome 3 has “Allied Health Sciences 622 New” footer spill |
| Contents | — | Variables/scales/sampling/data; probability/normal distribution; hypothesis testing; parametric/non-parametric methods; named examples | 400 characters; cuts off during “Factors for considerati” |
| Source text note | — | Names include “Mann-Witney U” and “ANOA” | No source annotation |

## Reconciliation

Removed only the confirmed page-footer spill from outcome 3. Completed the summary with all source topics and listed test names. The CCMAS itself spells “Mann-Witney” and “ANOA”; those strings are preserved and explicitly flagged in `source_conflict_note`, rather than silently corrected or presented as normalized labels. Load and other outcomes were already supported and remain unchanged. Added NUC URL, printed-page locators and access date.

Guarded repair: `apply_ccmas_pst514_source_reconciliation_2026_09_29.py`. Regression: `test_ccmas_pst514_source_reconciliation_2026_09_29.py`.

**Next cursor:** PST 515. Verify exact prior coverage before comparing.
