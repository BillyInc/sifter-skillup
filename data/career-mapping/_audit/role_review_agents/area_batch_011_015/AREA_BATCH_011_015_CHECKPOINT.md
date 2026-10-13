# Role-area/direct-route audit — batches 011–015

Status: **completed as an audit-only result**. No canonical role, domain, subgroup, area-definition, area-source, or computational file was edited.

## Scope

- Queue lane: `role_area_direct_route_residual`.
- Batches: **011–015**; the complete assigned range was processed before this checkpoint was written.
- Subgroup, area of specialization and area of practice are treated as the same layer.
- Parent-domain fit and role-to-area fit were kept as separate gates.

## Results

- Groups processed: **500**; role records processed: **500**.
- Parent fit: **{'review_required': 164, 'supported': 336}**.
- Area/direct-route dispositions: **{'blocked_by_parent_fit': 161, 'review_required': 339}**.
- Counts are separate gates; parent-fit and area-route counts must not be added as unique roles.

## Evidence rule

Role tasks and recorded source references are retained for reconciliation. Titles, ISCO/ESCO membership and existing subgroup membership are not fit evidence. Lexical candidate ranking is not promoted into a route without a sufficiently specific task-boundary decision and source support.

## Resumption

- Exact next queue file: `batch-016.json`.
- Do not resume it until the local area-of-specialization/source reconciliation is complete.

## Output files

- `area_batch_011_015_results.json` — combined machine-readable result.
- `batch-011_result.json` through `batch-015_result.json` — per-batch results.
- `AREA_BATCH_011_015_CHECKPOINT.json` — machine-readable checkpoint.
- `run_area_batches_011_015.py` — reproducible runner.
