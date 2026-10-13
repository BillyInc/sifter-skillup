# JAMB 141–280 / CCMAS 080–158 source-review checkpoint 001

**Date:** 2026-09-29 (Africa/Lagos)  
**Mode:** incremental source audit and evidence only. No shared ledger or curriculum source was edited. No downstream domain, subgroup, or role reassessment was done.

## Reconciled partition coverage

The current deterministic report enumerates canonical JAMB rows **141–280** as 140 identities and 141 distinct exact source occurrences. Each occurrence has its own `occurrence_id`; the saved range notes describe separate faculty contexts, including the two Fisheries occurrences. Fourteen occurrences currently carry both the explicit PDF flag and locator in the generated ledger. That flag is treated as a persisted checkpoint pointer, not as source truth by itself.

Before any new JAMB source lookup, the row matrix, 14 independent range notes, 28 authoritative follow-ups, and final-verification notes were reconciled. The matrix overlay already records which exact cells were seen, which were partial, and which were only catalogue/index mentions. Exact-cell-complete findings will be reused. The unresolved remainder is limited to the overlay's stated missing institution-cell/continuation, faculty, spelling, and distinct-occurrence checks. Existing school tokens remain unverified unless an exact awarding-institution cell was recorded.

The deterministic CCMAS package indices **080–158** contain 79 programme packages and 3,144 local course rows. Embedded course provenance shows seven rows with original-source-review references and one with a source-adjudication reference; those eight exact records are not automatically treated as package closure. The separate selected-79 package audit does not have a complete package-index crosswalk for this range and is not counted as coverage. Existing closed course-level repair checks are preserved at their exact row boundary.

## Increment 001 — package index 080

**Package:** `arts.json` / **Modern European Languages B.A (German)**  
**Local rows:** 42  
**Primary source:** [NUC Arts CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), printed pp. 467–468, Global Course Structure; accessed 2026-09-29.

I compared course identity, title, units, status, lecture hours, practical hours, and the package-level structure for the 42 local rows with the exact programme table. The table confirms the 100–400 Level structure and exposes multiple local differences:

- `GST 112` is listed locally where the source table has `GST 113 Nigerian Peoples and Cultures`.
- For Philosophy/Logic, the global course table lists `GST 211`, while the detailed course block is headed `GST 212`; the local row follows the detailed block. Keep this as a source-internal conflict.
- The source includes `ENT 211 Entrepreneurship and Innovation` (2 units, C, LH 15, PH 45); the local package has no exact `ENT 211` row.
- The global course table lists `GST 311 Peace and Conflict Resolutions`, while detailed source blocks contain `GST 222 Peace and Conflict Resolution` and `GST 312 Peace and Conflict Resolution`; the local rows follow those detailed blocks. Preserve the source-internal inconsistency.
- The source table lists `FRE 302 Listening Comprehension and Speech`; the local package has `GER 302` with a reordered title. This remains a source conflict pending detailed-block review.
- Local `GER 401` has no structured hours; the source gives LH 30 and PH 90. Local `GER 402` has blank units and hours; the source gives 2 units, C, LH 30, PH 90.
- Local `GER 407` has the right code, units, and status, but omits `/Project`, lacks source LH 30, and assigns PH 270 where the source shows no practical hours.
- Local `FAC 201` lacks structured hours and content summary, despite the source table's 2 units/C/LH 30. `GER 209` lacks structured hours and content summary despite source PH 90. `GER 207` and `FAC 301` have empty local content summaries.
- The global course table omits `FAC 202`, but its detailed block confirms `FAC 202 The Arts and Other Disciplines`; the local identity follows the detailed block. Preserve this source-internal inconsistency.

The focused source repairs for `GER 101` and `GER 103` are carried forward from `test_ccmas_german_rows_101_103_source_repair_2026_09_28.py`; their course details were not re-searched. This structure pass does **not** complete package 080: detailed content/outcome comparison remains open, including all other rows and the conflicts above. No curriculum data was changed.

## Regression protection and cursor

The accompanying test checks that this checkpoint remains inside the requested partition, pins the deterministic package identity/count and official source locator, and preserves the no-shared-ledger/no-downstream boundary.

**Coverage now:** JAMB 141–280 reconciled (140/140 identities; 141/141 exact occurrences indexed; 0 new occurrence adjudications in this tranche). CCMAS 080–158 reconciled (79/79 packages; 3,144 course rows indexed; 8 rows have earlier source-review provenance). New source audit: package 080 global table checked, **0/79 packages complete**; 42/3,144 package course records have at least the programme table fields checked.

**Next cursor:** CCMAS package 080 detailed content/outcome verification; JAMB row 141, first exact occurrence whose unresolved awarder/context fields remain after checkpoint overlay. Then continue in non-overlapping package/occurrence order.
