# JAMB → CCMAS → domain mapping reconciliation — 2026-10-02

This checks all JAMB names against the mapping ledgers and their selected CCMAS course evidence. It is the reconciliation gate before downstream correction.

## Scope

- **jamb names:** 420
- **programme mapping rows:** 420
- **inheritance rows:** 420
- **scope rows:** 420
- **domain map rows:** 420

## Results

- `consistent_local_reconciliation`: 117
- `evidence:custom_component_source_evidence_complete`: 3
- `evidence:external_course_source_attached`: 91
- `evidence:selected_course_matches_duplicate_ccmas_variant`: 6028
- `issue:domain_link_not_present_in_component_score_catalogue`: 497
- `issue:domain_link_references_unselected_course`: 383
- `issue:external_component_requires_source_check`: 4
- `issue:mapping_explicitly_held_for_review`: 41
- `issue:selected_course_not_found_in_current_ccmas`: 42
- `reconcile_or_source_review`: 303

## Disposition

Rows marked `consistent_local_reconciliation` agree across the local mapping layers and selected course records. Rows marked `reconcile_or_source_review` contain an explicit mismatch, a held mapping, or a source-dependent case and must be corrected or source-adjudicated before downstream remapping.
