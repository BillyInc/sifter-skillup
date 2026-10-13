# Role-area/direct-route audit — batches 006–010

Status: **completed as an audit-only result**. No canonical role, domain, subgroup, area-source, or computational file was edited.

## Scope

- Queue lane: `role_area_direct_route_residual`.
- Batches: **011-033**; **2,250 groups / 2,250 role records**.
- Subgroup, area of specialization and area of practice are treated as the same layer.
- Parent-domain fit and role-to-area fit were kept as separate gates.

## Results

- Parent fit already supported: **1,518**; parent fit retained review-required: **732**.
- Supported-area candidates: **1**.
- Direct-domain candidates: **0**.
- Area routes retained review-required: **1,527**.
- Parent-blocked area cases: **722**.
- Duplicate role keys: **0**.

The `review_required` parent count and the area-route counts are separate dimensions; they must not be added together as unique roles.

## Evidence rule

A supported-area candidate requires supported parent-domain fit, a unique and strong match between the role task text and one area boundary, an external task-source URL, and an area-source URL. Titles, ISCO/ESCO membership and existing subgroup membership were never used as fit evidence.

## Output files
- `area_batch_011_033_results.json` — combined machine-readable result.
- `batch-011_result.json` through `batch-033_result.json` — per-batch machine-readable results.
- `run_area_batches_006_010.py` — reproducible read-only result builder.


Authoritative source families recorded in the queue include ESCO, O*NET, ILO/ISCO, WHO, NHTSA, IEEE/ACM and relevant professional bodies. Each record retains the exact source URLs supplied by the current queue; the result does not claim live URL reachability.

External verification sources consulted for this checkpoint: O*NET Data Warehousing Specialists and Database Architects; WHO primary-health-care guidance; and the CSCMP supply-chain glossary. These sources corroborate task/boundary interpretation only; they do not establish the catalogue's area count or replace role-specific fit review.
