# JAMB → CCMAS → domain mapping reconciliation — 2026-10-02

This checks all JAMB names against the mapping ledgers and their selected CCMAS course evidence. It is the reconciliation gate before downstream correction.

## Scope

- **jamb names:** 420
- **programme mapping rows:** 420
- **inheritance rows:** 420
- **scope rows:** 420
- **domain map rows:** 420

## Results

- `consistent_local_reconciliation`: 29
- `evidence:custom_component_source_evidence_complete`: 7
- `evidence:external_course_source_attached`: 112
- `evidence:selected_course_matches_duplicate_ccmas_variant`: 8397
- `issue:domain_link_not_present_in_component_score_catalogue`: 590
- `issue:domain_link_references_unselected_course`: 569
- `issue:domain_map_component_set_disagrees`: 7
- `issue:domain_map_selected_course_set_disagrees`: 166
- `reconcile_or_source_review`: 391

## Disposition

Rows marked `consistent_local_reconciliation` agree across the local mapping layers and selected course records. Rows marked `reconcile_or_source_review` contain an explicit mismatch, a held mapping, or a source-dependent case and must be corrected or source-adjudicated before downstream remapping.
