# Lane 2 source-audit checkpoint 021 - JAMB identity 141: Pure and Applied Mathematics

## Why this identity is next

Lane 2 checkpoint 010 reconciled prior notes for all 140 assigned JAMB identities and instructed a residual pass against current offering occurrences. The 141-150 follow-up (checkpoint 001) left row 141's awarder cell unverified. Rechecking the current occurrence uncovered a more specific provenance defect: its stored locator points to lines 8004-8022 of the Sciences extraction, which are Microbiology requirements, while the record is marked `source_text_confirmed`.

## Source review

The official JAMB IBASS Sciences brochure index at printed p. 452 lists **Pure/Applied Mathematics** (#132). That confirms a directory name/title variant only. The raw body extraction has no exact `Pure and Applied Mathematics` / `Pure/Applied Mathematics` awarder heading for this record; the current source locator instead lands inside the Microbiology passage and cannot support the four associated institutions.

Official university sources were checked as corroboration, not substituted for the JAMB cell:

- UNIBEN's Physical Sciences department page describes undergraduate mathematics programmes and traditional pure/applied mathematics; a 2023 UNIBEN repository thesis also records a B.Sc. (Honours) degree in Pure and Applied Mathematics.
- LAUTECH's Faculty of Pure and Applied Sciences lists a Department of Pure and Applied Mathematics.
- Paul University's current undergraduate catalogue lists B.Sc. Mathematics, not the exact Pure and Applied Mathematics title.
- The located University of Port Harcourt 2026/2027 page concerns postgraduate Pure Mathematics and Applied Mathematics; it does not prove an undergraduate JAMB awarder cell.

These facts partially corroborate institutional mathematics context, but none supplies the complete JAMB 2026 awarder cell. Do not transfer a Mathematics/Applied Mathematics cell to this compound title.

## Disposition

- Confirmed: the stored source locator is wrong for this programme; it points to Microbiology requirements. The current `source_text_confirmed` state is too strong.
- Unresolved: the exact JAMB 2026 body cell and complete awarder list. The four institution tokens remain unverified as a set; the external institutional evidence above is item-specific but is not equivalent to the JAMB offering cell.
- Not concluded: the programme is not marked unavailable, and no institution is removed or added.
- No shared ledger, source mapping, curriculum data, or seed was edited.

The machine-readable checkpoint contains all source URLs, access dates, locators, per-institution evidence boundaries, and the repair handoff. `test_jamb_ccmas_source_audit_lane_2_checkpoint_021.py` protects the incorrect-locator finding and prevents it from being treated as a verified JAMB cell.
