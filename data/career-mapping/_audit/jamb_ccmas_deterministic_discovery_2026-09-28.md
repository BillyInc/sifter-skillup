# JAMB–CCMAS deterministic discovery report

Generated: 2026-09-30

This reproducible scan enumerates every current local identity/package and compares linked records. It is exhaustive for deterministic checks implemented here, but it is **not** an exhaustive authoritative-source audit.

## Coverage counts

- **jamb canonical identities:** 420
- **jamb identities with any discovery findings:** 244
- **jamb parsed source files:** 9
- **jamb parsed offering occurrences:** 443
- **jamb all parsed offering occurrences:** 443
- **jamb orphan source occurrences:** 0
- **jamb occurrences linked to canonical with explicit pdf flag and locator:** 358
- **jamb all occurrences with explicit pdf flag and locator:** 358
- **jamb occurrences with complete source metadata:** 443
- **jamb occurrences pending exact pdf cell verification:** 85
- **jamb occurrences without complete source metadata:** 0
- **jamb occurrences without faculty brochure url:** 0
- **jamb occurrences without stable inventory id:** 0
- **jamb occurrences matched to stable inventory id:** 443
- **jamb current occurrences not in older inventory signature:** 0
- **jamb older inventory occurrences not in current files:** 1
- **jamb occurrences with institution roster drift vs inventory:** 0
- **jamb selected course records:** 12543
- **jamb selected ccmas course records:** 12453
- **jamb selected external or custom course records:** 90
- **parsed source names without canonical identity:** 0
- **canonical identities without exact spelling in parsed ledgers:** 0
- **canonical identities without any normalized parsed occurrence:** 0
- **ccmas source files:** 17
- **ccmas programme packages:** 237
- **ccmas course rows:** 9842
- **ccmas packages with structural candidates:** 162

## JAMB finding types (nonexclusive)

- `compound_display_name_candidate`: 191
- `explicitly_unrepresented_programme_facets`: 2
- `offering_pdf_cell_verification_pending`: 85

## CCMAS structural candidate types (nonexclusive)

- `duplicate_course_code_within_package`: 43
- `empty_learning_outcomes`: 290
- `empty_or_placeholder_content_summary`: 649
- `repeated_outcome_text_within_course`: 3

## Cross-package course-code candidates

- Course-code groups used in multiple packages with different titles: **376**.
- Groups where course details/outcomes are reused under different titles: **77**.
- These are candidates for checking course ownership and extraction contamination; repeated codes may be legitimate and are not auto-corrected.

## Prior source-checkpoint reconciliation

- Original source-review rows: 122 total; 113 exact course joins; 8 same-code/title changes; 1 unmatched (explicitly listed in JSON).
- Open anomaly-adjudication rows: 10 total; 6 exact joins; 4 same-code/title changes.
- Empty-summary reconciliation rows: 16 joined at exact package/course-code level.
- Stable IDs absent from the current JAMB occurrence rows: 0.
- Same-code/title changes and unmatched records are carried forward for adjudication rather than dropped or auto-closed.

## Interpretation

Source-metadata and verification are separate: a row can have an official URL, local text locator, and access date while still awaiting exact PDF awarder-cell verification. The pending count is not a missing-link count.

Counts are nonexclusive; one identity/course may have multiple findings. Structural empties and duplicate course codes are candidates until compared to the exact NUC page. A local cross-ledger mismatch is a confirmed internal inconsistency, but source evidence decides the correct repair. JAMB source contexts remain occurrence-level and are never merged by display name.

The JSON report contains all 420 identity rows, every parsed JAMB occurrence including source spellings without a canonical identity, stable prior occurrence IDs where available, all 237 CCMAS packages, per-package candidate lists, and the local cross-ledger findings. Use the range fields as a work queue; after source adjudication, add evidence-backed decisions to the separate confirmed-findings register.
