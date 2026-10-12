# JAMB offering-source verification — Lane B checkpoint 026 (Arts 1–36 cumulative reconciliation)

Date: 2026-09-28  
Scope: cumulative reconciliation of Arts brochure rows 1–36, using checkpoints 002–003, 020–025. The five specifically approved skips are Classical Studies, Christian Studies, Peace Studies, Anthropology, and Efik-Ibibio. Every other one of the 31 rows has now been checked or explicitly dispositioned. No Lane-A or Sciences work repeated; no CCMAS or downstream mapping performed.

Official source: [JAMB IBASS Arts/Humanities degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), accessed 2026-09-28. Item-specific extracted body locators and full awarder lists are in the cited incremental checkpoints and (for rows 1, 3, 5, 7–10) the row-level `source_verification` evidence present in `data/career-mapping/jamb/arts_hum_offerings.json`. The direct web text view is JS-gated; official indexed table snippets and the checked-in complete extraction `data/career-mapping/_jamb_txt/arts_hum.txt` were used for body/title/continuation checks. A confirmed source cell is not the same as a corrected canonical ledger row.

## Cumulative disposition

| Disposition | Rows | Count | Meaning |
|---|---|---:|---|
| Exact source title and complete source awarder cell established | 1, 3, 7, 8, 9, 10, 11, 12, 13, 14, 17, 18, 19, 20, 22, 23, 24, 25, 27, 29, 30, 32, 34, 36 | 24 | The body cell is distinguishable from adjacent titles; the ledger may still contain title/header spillover and is not thereby repaired. Locators/lists are retained in checkpoints 021–025 and source metadata. |
| Complete source body cell found; canonical/index identity wording needs reconciliation | 5, 15, 35 | 3 | Row 5: body `CHRISTIAN RELIGIOUS STUDIES` vs shorter ledger `Christian Religious`. Row 15: body `FRENCH WITH GERMAN/RUSSIAN` vs index `French and German/Russian`. Row 35: body `POLITICAL SCIENCE AND CONFLICT RESOLUTION` vs truncated ledger `Political Science and Conflict`. Keep separate until identity normalization is explicitly justified. |
| Exact title/list unresolved (full cell not yet established) | 2, 16, 21, 28 | 4 | Row 2 has a body/index wording difference (`ARABIC LANGUAGE AND LITERATURE` vs `Arabic Language and Literature Studies`) and only a partial recovered awarder excerpt. Row 16 is a truncated International Studies title with multiple neighboring combinations; row 21 spans separate Linguistics/language offerings; row 28 spans several Religious Studies/theology offerings. No complete awarder list is inferred. |
| Explicitly skipped under prior evidence | 4, 6, 26, 31, 33 | 5 | Classical Studies, Christian Studies, Peace Studies, Anthropology, Efik-Ibibio; prior exact title/awarder records are in checkpoints 002–003. |

Thus, **31/31** non-skipped Arts rows have source dispositions; **24** have exact title/list source cells, **3** have complete source cells but title-identity variants, and **4** still need exact complete body-cell evidence. This does not make every canonical ledger row ready for promotion: the checked-in arrays still have source-title/header contamination, and this audit-only request did not repair them.

## Next Lane-B boundary

Do **not** advance to another JAMB context yet. First resolve the three title/identity discrepancies (rows 5, 15, 35) and obtain complete cell evidence for rows 2, 16, 21, 28. Rows 37–43 remain as checkpoint 019 recorded, but note the current regression check below: the live working ledger now marks the Psychology occurrence verified although checkpoint 019 held it; no re-audit of rows 37–43 was performed in this increment. Reconcile that state conflict before treating Arts as fully closed.

The required post-Arts Lane-B range check is still to inspect the existing assigned ledgers for the next disjoint row with no evidence state, excluding Lane A and Sciences; do not assume the old “87/87” scope count means there are no such rows. That check remains pending until the Arts source/context conflicts above are resolved.

## Worktree integrity note

`git diff` shows the working tree's authoritative file `data/career-mapping/jamb/arts_hum_offerings.json` is modified, including awarder-array and verification-metadata changes. This cumulative audit/checkpoint did not apply those changes. The current task requested audit/documentation only; inspect ownership/provenance of that existing diff before any further promotion. The checkpoint is not a claim that the source ledger remained untouched globally.

## Verification

The focused audit tests for checkpoints 020–026 passed together: **7 passed**. The older checkpoint-019 test was also tried and fails against the current ledger because row 39 (Psychology) is now `verified`, while that test expects it to remain held. Its metadata currently points to a Creative Arts options row, so this conflict is not accepted as proof and needs reconciliation; rows 37–43 were not re-audited here.
