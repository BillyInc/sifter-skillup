# Partition 02 — increment 028: row 206 canonical bridge repair

Recorded 2026-09-25 (Africa/Lagos). This append-only addendum corrects an oversight in increment 027. Increment 027 said the row was consistent across its listed artifacts but omitted inspection of `jamb_ccmas_inheritance_canonical_2026-08-17.json`; that bridge still contained the old ENP component, `ready_partial`, and eight active links. The prior parity statement was incomplete and should not be relied on for the bridge.

## Repair

Updated only row 206 in `data/career-mapping/_audit/jamb_ccmas_inheritance_canonical_2026-08-17.json` to match the already-corrected mapping and scope:

- Primary/component reference: `Sciences::Industrial Chemistry` (`ICH`).
- Curriculum scope: `partial_scope_review_required`, 43 course codes matching the corrected scope.
- Mapping status: `review_required`; `domain_links: []`; `current_jamb_domain_link_count: 0`.
- The eight former ENP-derived links remain in `candidate_ccmas_domain_links` for audit only, with `candidate_ccmas_domain_links_status` explicitly marking them as historical candidates from the superseded ENP scope, not confirmed Industrial Chemistry links.
- Component-domain evidence now reports zero reviewed/confirmed links.

The previous bridge row (ENP, eight active links) is preserved in [`row_206_inheritance_bridge_before_2026-09-25.json`](../row_206_inheritance_bridge_before_2026-09-25.json). The guarded row-only repair is [`reconcile_row_206_inheritance_bridge_2026_09_25.py`](../reconcile_row_206_inheritance_bridge_2026_09_25.py).

## Cross-artifact verification

Read-only invariants passed across all five artifacts:

1. `programme_mapping.json`: row 206 maps to ICH / Sciences / Industrial Chemistry.
2. `jamb_curriculum_scopes_2026-08-17.json`: row 206 component is `Sciences::Industrial Chemistry`, scope is review-required, 43 unique selected course codes, and no links.
3. `jamb_ccmas_inheritance_canonical_2026-08-17.json`: same component and codes, review-required, zero active links/count, with eight prior links retained only as audit candidates.
4. `jamb_domain_map_ccmas_derived_2026-08-17.json` and `jamb_domain_map.json`: same component/scope/codes, review-required, zero active links.
5. The before-snapshot confirms the bridge's prior ENP component and eight links.

Focused regressions: `python -m pytest -q data/career-mapping/_audit/test_jamb_ccmas_materializer.py data/career-mapping/_audit/test_jamb_manual_scope_review_holds.py` — **5 passed**.

The bridge's top-level aggregate `counts` were not regenerated or edited, per the instruction not to regenerate global artifacts. Those stored totals were already inconsistent with the bridge rows before this repair; use a later dedicated whole-file audit to reconcile aggregate metadata. This does not affect the verified row-206 cross-artifact invariants.

## Still open

The exact JAMB awarder-table row and CCU association, local ICH 422 outcome extraction, and row-specific domain/subgroup/role review remain open. This repair is not seed generation, SQL proof, student-path approval, or closure of row 206 or the 141–280 tranche.
