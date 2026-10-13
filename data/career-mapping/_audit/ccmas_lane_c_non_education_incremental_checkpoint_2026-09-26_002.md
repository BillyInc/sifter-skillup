# Lane C non-Education CCMAS incremental checkpoint — 2026-09-26 (002)

This checkpoint records the bounded FAA 451 repair after exact source review.
The lane remains open for source classification of the remaining candidate
queues.

## FAA 451 repair

The official NUC Environmental Sciences CCMAS PDF prints the combined heading
`FAA 451: and FAA 442: Draughtsmanship` at printed page 252. The same block
contains exactly four outcomes:

1. to come to terms with the skill of interpreting art;
2. appreciate the visual form as cultural objects;
3. to identify with their definition as objects of value in society; and
4. come to terms with the process of their creation or the way they are rendered.

The source JSON now retains those four outcomes only. The appended FAE 311 and
FAE 321 Art Education outcomes were removed. The row remains coded `FAA 451`,
keeps the source-authored title fragment, and records `FAA 442` in
`source_aliases` with `source_state: source_combined_header`. No split or
second course row was guessed.

Source: `https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf`, printed p. 252, accessed 2026-09-26.

## Verification without duplicate edits

The existing allied-health repairs were verified and left untouched:
`DTH 527`, `OCT 525`, `OPT 203`, `OPT 698`, and `POT 317`. Existing Veterinary
`VEX 599` was also verified as one source-ordered copy of each outcome.

## Remaining candidate classification

- 897 non-Education empty-summary occurrences remain unresolved unless an exact
  source review establishes a source-defined blank. No summaries were invented.
- 164 catalogue title-boundary candidates remain unresolved pending exact NUC
  title/course-block locators.
- 50 non-Education duplicate-code groups (111 rows) remain unresolved pending
  exact NUC table/content adjudication. No rows were merged or deleted.
- Previously recorded source-authored repeated-outcome cases `DNT 309`,
  `DTH 521`, and `ANA 341` remain closed and were not reopened.

## Files changed

- `data/career-mapping/ccmas/environmental_sciences.json` — FAA 451 only.
- `repair_ccmas_faa451_source_combined_2026_09_26.py` — idempotent bounded repair/check.
- `test_ccmas_faa451_source_combined.py` — focused regression coverage.
- This checkpoint’s JSON and Markdown files.

`education.json` and all JAMB, generated, seed, SQL, taxonomy and UI files were
left outside this lane.
