# CCMAS confirmed-anomaly repair checkpoint — 2026-09-26 (001)

This follows the source adjudication in
`ccmas_open_anomaly_adjudication_checkpoint_2026-09-26_002.md`.

## Repairs applied

- Six confirmed page-header/equipment/next-course spills were repaired:
  `DTH 527`, `OCT 525`, `OPT 203`, `OPT 698`, `POT 317`, and `CHM 107`.
- The three verified next-course outcome tails were removed only from `OPT
  203`, `POT 317`, and `CHM 107`; source-owned outcomes before each boundary
  were retained.
- `VEX 599` had its repeated three-outcome extractor duplicate reduced to one
  copy of each outcome.
- Each repaired row retains an official NUC URL, printed locator, and access
  date. No LIS/SED/FAA record was changed because those require deeper course
  reconstruction.

## Verification

- 237 packages and 9,854 course records remain present.
- Deterministic anomaly counts after repair: 1,092 empty-summary candidates,
  6 duplicate-outcome candidates, 0 page-header spills, 0 unresolved
  cross-reference candidates, and 0 replacement-character candidates.
- Focused regression: six tests pass.
- Rebuilt JAMB curriculum scopes and inheritance audit; all 420 JAMB scope rows
  still join, with no stored component mismatch.

This is a source-data repair checkpoint, not downstream domain/subgroup/role
approval or seed/deployment proof.

