# D113–D168 existing-role and Nigerian-context checkpoint — 2026-10-07

## Scope and current progress

- Sparse-candidate adjudication is complete: **44/44** candidate records across 9 domains; 13 add-eligible, 20 review-required, 9 rejected, and 2 rejected bundles. Eight bundle components were separately dispositioned. No canonical files were edited.
- Existing active role population is **847 unique role keys across 54 populated domains** (D153 and D157 have no active rows in the current source set). This deduplicates exact `(domain_id, normalized role_name)` keys across the cleaned library and two overlays; excluded/review-only/audit-only rows are omitted.
- Existing per-domain parent-task review artifacts match **828/847** active role keys. **19** active keys lack an exact decision in those artifacts and need task evidence review rather than inheriting a neighboring title's decision.
- Existing role-area metadata is not a completed area audit: 9 records are currently marked `supported`, 61 `direct_domain_role`, and **777 have no explicit area-fit status**. These labels are evidence to reconcile, not accepted proof. The normalized 709-area catalog and Step 1 boundaries govern.
- The prior D113–D168 Nigerian area-context ledger contains **269 evidence/disposition records**: 58 `nigeria_specific_overlay_supported`, 110 `unresolved_source_or_scope_conflict`, and 101 `no_primary_nigerian_evidence_found_after_search`. All 269 include URL, locator, claim and limitation fields; these are prior evidence records, not yet reconciled to every normalized catalog area.

## Remaining in this lane

- Existing role/area-fit audit: **847 role keys remain to be emitted in the new candidate-by-candidate reconciliation artifact**. Reuse prior exact task profiles/source refs only as evidence inputs; assess parent fit independently from area fit. Uncertainty remains `review_required`; no ISCO/ESCO group, title-only match or subgroup code is fit evidence.
- Nigerian area-context pass: reconcile evidence for all **213 Step 1 area entries** in D113–D168 against the normalized catalog. Carry supported Nigerian overlays only with exact source, locator, claim and limitation; retain explicit `no_direct_Nigerian_context_found` when no qualifying evidence exists; keep unresolved/conflicting evidence separate. Do not infer demand or vacancies.
- No canonical role/domain/area files may be edited in this lane.

## Inputs inspected

- `SPARSE_ROLE_ENRICHMENT_LEDGER_2026_10_07.json`
- `specialization_lanes_2026_10_05/STEP1_RECONCILIATION_2026_10_06/global_step1_specialization_reconciliation_2026_10_06.json`
- `domain_specialization_catalog.json`
- `role_library_v3_cleaned.json`, `thin_domain_role_overlays.json`, `emerging_role_overlays.json`
- per-domain role task-fit reviews under `_audit/role_fit_lanes_2026_10_05/D085_D168/`
- `specialization_lanes_2026_10_05/STEP1_RECONCILIATION_2026_10_06/STEP2_NIGERIAN_CONTEXT_2026_10_06/D113_D168_nigerian_context_evidence_2026_10_06.json`

## Checkpoint status

`checkpoint_saved_continue_work`: yes. Sparse candidates are exhausted; existing-role fit and normalized Nigerian-context reconciliation are still in progress. This checkpoint does not claim those later passes are complete.
