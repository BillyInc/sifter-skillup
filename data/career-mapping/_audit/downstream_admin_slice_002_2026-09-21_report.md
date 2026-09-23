# Downstream/admin slice 002 report

Generated: 2026-09-21
Mode: read-only local contract audit; no app code, catalogue, seed transport, SQL, UI or browser-proof file was changed.

## Scope

- Programmes audited: **20**; overlap with prior tranche: **0**.
- Downstream routes: **136** domains, **406** subgroups, **4288** roles.
- Unresolved/not-established relationship queue represented by this slice: **2316**.

## Gate results

- `curriculum_contract_present`: **20/20** pass.
- `active_mapping_present`: **20/20** pass.
- `active_relationship_types_only`: **20/20** pass.
- `downstream_route_complete`: **20/20** pass.
- `domain_contexts_present`: **20/20** pass.
- `ownership_and_state_complete`: **20/20** pass.
- `category_ownership_and_aggregate_boundary`: **20/20** pass.
- `provenance_complete`: **20/20** pass.
- `resource_state_explicit`: **20/20** pass.
- `relationship_state_explicit`: **20/20** pass.
- `admin_state_explicit`: **20/20** pass.
- `student_exposure_fail_closed`: **20/20** pass.
- `bounded_role_learning_caps`: **PASS** (global role audit: max 12 essential / 5 optional student skills).

## Static student/admin boundary

- `student_language_boundary`: **PASS**.
- `admin_language_boundary`: **PASS**.
- `admin_provenance_and_queue`: **PASS**.
- `student_fail_closed_boundary`: **PASS**.
- `student_relationship_fail_closed_boundary`: **PASS**.
- `relationship_grouping`: **PASS**.

## Programme queue summary

| Programme | Domains | Subgroups | Roles | Resource | Relationship | Admin |
|---|---:|---:|---:|---|---|---|
| Administration and Management::Securities and Investments Management | 11 | 22 | 300 | `review_required` | `not_established` (40) | `pending_full_population_render` |
| Administration and Management::Taxation | 7 | 24 | 139 | `review_required` | `not_established` (80) | `pending_full_population_render` |
| Administration and Management::Transport Management | 7 | 22 | 421 | `review_required` | `not_established` (20) | `pending_full_population_render` |
| Agricultural Science::Agribusiness | 6 | 16 | 199 | `review_required` | `not_established` (58) | `pending_full_population_render` |
| Agricultural Science::Agricultural Economics | 7 | 19 | 273 | `review_required` | `not_established` (118) | `pending_full_population_render` |
| Agricultural Science::Agricultural Extension | 5 | 11 | 154 | `review_required` | `not_established` (118) | `pending_full_population_render` |
| Agricultural Science::Animal Science | 7 | 31 | 239 | `review_required` | `not_established` (80) | `pending_full_population_render` |
| Agricultural Science::B. Agriculture | 8 | 31 | 229 | `review_required` | `not_established` (158) | `pending_full_population_render` |
| Agricultural Science::B.Sc./B.Tech Food Science and Technology | 7 | 25 | 314 | `review_required` | `not_established` (80) | `pending_full_population_render` |
| Agricultural Science::Crop Science | 9 | 32 | 237 | `review_required` | `not_established` (178) | `pending_full_population_render` |
| Agricultural Science::Family and Consumer Sciences | 5 | 16 | 181 | `review_required` | `not_established` (20) | `pending_full_population_render` |
| Agricultural Science::Fisheries and Aquaculture | 8 | 25 | 331 | `review_required` | `not_established` (80) | `pending_full_population_render` |
| Agricultural Science::Forest Resources and Wildlife Management | 7 | 28 | 216 | `review_required` | `not_established` (118) | `pending_full_population_render` |
| Agricultural Science::Horticulture and Landscape Management | 7 | 25 | 209 | `review_required` | `not_established` (158) | `pending_full_population_render` |
| Agricultural Science::Soil Science | 9 | 27 | 209 | `review_required` | `not_established` (178) | `pending_full_population_render` |
| Agricultural Science::Water Resources Management and Agro-Meteorology | 7 | 11 | 176 | `review_required` | `not_established` (138) | `pending_full_population_render` |
| Allied Health Sciences::Audiology | 5 | 15 | 161 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Allied Health Sciences::Complementary and Alternative Medicine | 3 | 6 | 68 | `review_required` | `not_established` (16) | `pending_full_population_render` |
| Allied Health Sciences::Dental Technology | 5 | 10 | 101 | `review_required` | `not_established` (140) | `pending_full_population_render` |
| Allied Health Sciences::Dental Therapy | 6 | 10 | 131 | `review_required` | `not_established` (538) | `pending_full_population_render` |

## Decision

The bounded local contract audit is complete for this 20-programme slice. Student approval is **not** granted: review-required, not-established, unavailable and admin-pending states remain fail-closed. Browser rendering, live payload verification and SQL deployment are explicitly outside this checkpoint.
