# CCMAS encoding-artifact normalization checkpoint — 2026-09-26

## Scope

- Scanned all 17 CCMAS source JSON files: 237 programme packages and 9,854
  course records.
- The extraction contained the Unicode replacement character (`U+FFFD`) in
  course text and source-context strings. It was an encoding artifact, not a
  verified curriculum character.

## Repair

- Replaced only `U+FFFD` with a neutral en dash (`U+2013`) across all JSON
  string values. No course words, outcomes, ownership, or curriculum rows
  were inferred, merged, or deleted.
- The repair was idempotent and ran in two passes because the initial narrow
  pass covered course fields before the remaining source-context/equipment
  strings were included. Total normalized occurrences: 1,129; the final pass
  normalized the remaining 444.

## Verification

- `audit_ccmas_extraction_anomalies_2026_09_26.py`: replacement-character
  candidates fell from 268 to 0; unresolved cross-reference candidates remain
  0.
- Regression: `test_ccmas_mojibake_normalization.py` passes.
- Remaining CCMAS anomaly categories are still open and must not be treated as
  resolved by this encoding-only repair: 1,092 empty summaries, 7 duplicate
  outcome candidates, and 6 compound page-header candidates.

