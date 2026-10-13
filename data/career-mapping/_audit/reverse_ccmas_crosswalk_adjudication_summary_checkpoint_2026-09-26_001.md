# Reverse CCMAS crosswalk adjudication summary — 2026-09-26 (001)

This checkpoint was produced by reading all nine numbered append-only
adjudication files for the 83-package reverse CCMAS crosswalk. It does not
rewrite the underlying JSONL ledger or any shared mapping file.

## Coverage

| Measure | Count |
|---|---:|
| CCMAS packages in reverse crosswalk | 83 |
| JAMB identities checked by the crosswalk | 420 |
| Adjudication slices read | 9 (entries 001–083) |
| Component/offering matches recorded | 43 |
| Candidates still requiring source evidence | 38 |
| No-support findings in the defined 420-identity universe | 2 |
| Machine-ledger rows still labelled `candidate requiring source evidence` | 83 |

The 43/38/2 disposition totals are evidence from the adjudication checkpoints,
not a promotion decision. The machine ledger remains unchanged because its
records still need reconciliation with the checkpoint dispositions, including
the exact JAMB offering contexts and item-level course/outcome evidence.

## Exact adjudication artifacts read

- `data/career-mapping/_audit/jamb_ccmas_mapping_quality_2026-09-24/crosswalk-adjudication-001-entries-001-010-2026-09-25.md`
- `data/career-mapping/_audit/jamb_ccmas_mapping_quality_2026-09-24/crosswalk-adjudication-002-entries-011-020-2026-09-25.md`
- `data/career-mapping/_audit/jamb_ccmas_mapping_quality_2026-09-24/crosswalk-adjudication-003-entries-021-030-2026-09-25.md`
- `data/career-mapping/_audit/jamb_ccmas_mapping_quality_2026-09-24/crosswalk-adjudication-004-entries-031-040-2026-09-25.md`
- `data/career-mapping/_audit/jamb_ccmas_mapping_quality_2026-09-24/crosswalk-adjudication-005-entries-041-050-2026-09-25.md`
- `data/career-mapping/_audit/jamb_ccmas_mapping_quality_2026-09-24/crosswalk-adjudication-006-entries-051-060-2026-09-25.md`
- `data/career-mapping/_audit/jamb_ccmas_mapping_quality_2026-09-24/crosswalk-adjudication-007-entries-061-070-2026-09-25.md`
- `data/career-mapping/_audit/jamb_ccmas_mapping_quality_2026-09-24/crosswalk-adjudication-008-entries-071-080-2026-09-25.md`
- `data/career-mapping/_audit/jamb_ccmas_mapping_quality_2026-09-24/crosswalk-adjudication-009-entries-081-083-2026-09-25.md`

The machine-readable reconciliation is:

- `data/career-mapping/_audit/reverse_ccmas_crosswalk_reconciliation_2026-09-26_001.json`

## Remaining source-phase work

Reconcile the 43 recorded matches and 2 no-support findings into the source
ledger only after checking each exact JAMB occurrence and course/outcome
locator. Resolve the 38 candidates with item-specific evidence or retain them
as explicit candidates. Do not treat the 83-entry reverse crosswalk as a
student-facing mapping and do not start downstream domain/subgroup/role work.
