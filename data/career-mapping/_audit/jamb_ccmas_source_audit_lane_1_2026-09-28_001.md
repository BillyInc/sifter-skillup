# JAMB–CCMAS source audit — Lane 1 checkpoint 001

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** scope/prior-work reconciliation started; source audit remains open.  
**Assigned scope:** canonical JAMB identities 001–140, every offering occurrence for those identities plus the unmatched “Sociology and Anthropology” source spelling; CCMAS package indices 001–079.  
**Scope boundary:** audit evidence only. No shared mappings, source JSON, seed, UI, or downstream domain/subgroup/role records changed.

## Prior coverage discovered so far

- The 2026-09-26 JAMB aggregate is a full-catalogue local/inventory reconciliation, not PDF-cell closure. It reports 441 parsed occurrences plus one separately retained manual occurrence (442 then); it explicitly leaves exact source-cell verification open and lists 103 wrapped/alias/boundary records and 419 identities with at least one unverified occurrence. Current 2026-09-28 discovery has 443 parsed offering occurrences, including one orphan source spelling, so historical totals are not reused as the current denominator.
- JAMB Lane A/B/C and the 2026-09-28 incremental checkpoints exist and must be joined by exact current occurrence before any prior result is credited. The scope-to-occurrence reconciliation is in progress; checkpoint existence alone is not closure.
- CCMAS selected-79 checkpoint 001 covers 79 packages / 3,342 then-current extracted course rows. It states only Pharmacology has a source comparison checkpoint (1/79); Physiotherapy is in progress and not yet complete. Selected-79 is a subset phase, not all 237 packages.
- Pharmacology checkpoint 001 contains package-level NUC source comparisons and confirmed findings; those exact adjudications will be carried forward, not repeated without a contradiction.
- Physiotherapy checkpoint 008 reports 19/48 detailed DPT-owned blocks checked, 29 remaining; that work does not close the package. Existing targeted checks and the fix log will be reconciled by exact course identity before continuing.
- Current automated discovery and extracted-text search are leads only; neither is treated as primary-source proof.

## Next work

1. Build an exact identity/occurrence-to-prior-checkpoint ledger for JAMB 001–140 and list only uncovered or conflicting occurrences.
2. Join CCMAS package indices 001–079 against existing exact package/course adjudications; resume at the first uncovered package/course block, saving a row-level evidence ledger in increments of at most 10 packages.
3. For every checked source item record official URL, access date, printed PDF page/table/course-block locator, observed source fields, local comparison, and one disposition (`confirmed_match`, `confirmed_defect`, `source_conflict`, `candidate`, or `unresolved`).

No whole-lane completion claim is made here.
