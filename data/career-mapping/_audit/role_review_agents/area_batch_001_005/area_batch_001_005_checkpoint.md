# Role-area/direct-route review checkpoint: batches 001–005

Generated: 2026-10-07T15:16:06.465512+00:00

## Scope

Processed only `role_area_direct_route_residual/batch-001.json` through `batch-005.json`. The conditional lane, area-source reconciliation files and canonical role files were not edited.

## Results

- Case groups processed: **500**.
- Role rows processed: **505**.
- Supported role-area-and-parent routes: **43**.
- Explicitly unsupported parent-domain cases: **1**.
- Preserved `review_required`: **461**.
- Independent parent-domain supported: **277**; review-required: **227**; unsupported: **1**.
- Area supported: **43**; area review-required: **461**; not applicable: **1**.

## Decision rule

A supported route requires source-linked role-task text, an independently supported parent-domain fit, a current same-domain area boundary, and a distinctive task-to-boundary match with a clear candidate margin. Candidate rankings and shared words are not treated as proof. Unresolved or conditional parent fits remain review-required.

## Important limitation

This result is an audit/disposition artifact, not a canonical seed or live deployment. It records the evidence-backed decisions for the assigned batches so they can be reconciled and applied through the guarded canonical route applicator later.

Machine-readable result: `area_batch_001_005_results.json`.
