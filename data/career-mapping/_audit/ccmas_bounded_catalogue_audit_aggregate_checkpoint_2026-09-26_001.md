# CCMAS bounded catalogue audit aggregate checkpoint — 2026-09-26

This append-only checkpoint records the completed bounded structural pass over the full CCMAS catalogue. It was written after the interruption checkpoint and after each bounded increment was saved.

## Scope and status

- 17 source files
- 237 programme packages
- 9,854 course records
- 12 bounded increments: 1–20, 21–40, 41–60, 61–80, 81–100, 101–120, 121–140, 141–160, 161–180, 181–200, 201–220, and 221–237
- Every increment is at most 20 packages; the final increment contains 17.
- No shared CCMAS source JSON, JAMB mapping, downstream taxonomy, or seed was edited.
- This pass is structural candidate detection. It is not source adjudication and does not confirm every candidate.

## Exact bounded checkpoint files

Each JSON file contains the exact package records, course counts, candidate codes/titles, source URL, locator status, and access date.

| Range | Packages | Course rows | Checkpoint |
|---|---:|---:|---|
| 001–020 | 20 | 727 | `ccmas_bounded_catalogue_audit_001_020_2026-09-26_001.json` |
| 021–040 | 20 | 878 | `ccmas_bounded_catalogue_audit_021_040_2026-09-26_001.json` |
| 041–060 | 20 | 506 | `ccmas_bounded_catalogue_audit_041_060_2026-09-26_001.json` |
| 061–080 | 20 | 703 | `ccmas_bounded_catalogue_audit_061_080_2026-09-26_001.json` |
| 081–100 | 20 | 826 | `ccmas_bounded_catalogue_audit_081_100_2026-09-26_001.json` |
| 101–120 | 20 | 791 | `ccmas_bounded_catalogue_audit_101_120_2026-09-26_001.json` |
| 121–140 | 20 | 608 | `ccmas_bounded_catalogue_audit_121_140_2026-09-26_001.json` |
| 141–160 | 20 | 985 | `ccmas_bounded_catalogue_audit_141_160_2026-09-26_001.json` |
| 161–180 | 20 | 985 | `ccmas_bounded_catalogue_audit_161_180_2026-09-26_001.json` |
| 181–200 | 20 | 1,286 | `ccmas_bounded_catalogue_audit_181_200_2026-09-26_001.json` |
| 201–220 | 20 | 860 | `ccmas_bounded_catalogue_audit_201_220_2026-09-26_001.json` |
| 221–237 | 17 | 699 | `ccmas_bounded_catalogue_audit_221_237_2026-09-26_001.json` |
| **Total** | **237** | **9,854** | **12 files** |

## Structural candidate totals

These are counts of detections across the bounded files and may include records already represented by another anomaly class. They are not confirmed defects:

- Empty-content-summary candidates: 1,092
- Duplicate-code-group candidates: 50
- Title-boundary candidates: 239
- Duplicate-outcome candidates: 7
- Page-header-spill candidates: 12

The earlier full deterministic inventory remains the reconciliation source for the post-repair totals: 1,092 empty-summary occurrences / 1,088 unique keys, 7 duplicate-outcome candidates, 6 page-header candidates, 164 title-truncation candidates, and 50 duplicate-code groups. The bounded detector is intentionally broader and therefore must be source-adjudicated before it changes that inventory.

## Confirmed issues already adjudicated

The confirmed records and their evidence are in `ccmas_open_anomaly_adjudication_checkpoint_2026-09-26_002.md` and its JSON ledger. The confirmed set is:

- Extraction spill/page boundary: DTH527, OCT525, OPT203, OPT698, POT317, CHM107.
- Duplicate/extraction boundary: VEX599.
- Education LIS reconstruction set: LIS215, LIS216, LIS222.
- Education SED101 source inconsistency/title-boundary case.
- Environmental FAA451 combined source-header case.

## Evidence and locator policy

The bounded records retain the authoritative NUC CCMAS PDF URL for the source file and access date `2026-09-26`. For candidates not yet adjudicated, the locator is explicitly recorded as `exact printed page pending source adjudication for this bounded slice`; no page is invented and no candidate is promoted. Confirmed source locators and official URLs are retained in the open-anomaly adjudication ledger. The interrupt checkpoint also records the exact 21 empty-summary records reconciled against the older source review: 18 source-backed table identities, 3 source-content-missing/unresolved identities, and 1,067 unique keys not present in that older review.

## Next action

Continue source adjudication from the per-range ledgers in bounded slices, starting with the highest-confidence candidate classes, while preserving these files append-only. Do not edit shared source JSON or downstream taxonomy until the evidence ledger and repair instructions are complete.
