# Downstream/admin slice 009 report

Generated: 2026-09-21
Mode: read-only local contract audit; no app code, catalogue, seed transport, SQL, UI or browser-proof file was changed.

## Scope

- Programmes audited: **20**; overlap with prior tranche: **0**.
- Downstream routes: **110** domains, **242** subgroups, **3586** roles.
- Unresolved/not-established relationship queue represented by this slice: **3154**.

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
| Engineering::MATERIALS AND METALLURGICAL ENGINEERING | 8 | 15 | 248 | `review_required` | `not_established` (222) | `pending_full_population_render` |
| Engineering::MATERIALS ENGINEERING | 8 | 16 | 257 | `review_required` | `not_established` (262) | `pending_full_population_render` |
| Engineering::MECHANICAL ENGINEERING | 11 | 34 | 336 | `review_required` | `not_established` (192) | `pending_full_population_render` |
| Engineering::MECHATRONICS ENGINEERING | 6 | 13 | 196 | `review_required` | `not_established` (164) | `pending_full_population_render` |
| Engineering::METALLURGICAL ENGINEERING | 6 | 10 | 227 | `review_required` | `not_established` (330) | `pending_full_population_render` |
| Engineering::MINERAL PROCESSING AND CHEMICAL-METALLURGICAL ENGINEERING | 6 | 11 | 182 | `review_required` | `not_established` (330) | `pending_full_population_render` |
| Engineering::MINING ENGINEERING | 8 | 14 | 259 | `review_required` | `not_established` (404) | `pending_full_population_render` |
| Engineering::NATURAL GAS ENGINEERING | 6 | 12 | 162 | `review_required` | `not_established` (100) | `pending_full_population_render` |
| Engineering::NUCLEAR ENGINEERING | 5 | 7 | 124 | `review_required` | `not_established` (106) | `pending_full_population_render` |
| Engineering::PETROCHEMICAL ENGINEERING | 6 | 14 | 215 | `review_required` | `not_established` (86) | `pending_full_population_render` |
| Engineering::PETROLEUM AND GAS ENGINEERING | 4 | 8 | 129 | `review_required` | `not_established` (172) | `pending_full_population_render` |
| Engineering::PETROLEUM ENGINEERING | 5 | 10 | 171 | `review_required` | `not_established` (232) | `pending_full_population_render` |
| Engineering::RAILWAY ENGINEERING | 6 | 15 | 229 | `review_required` | `not_established` (146) | `pending_full_population_render` |
| Engineering::STRUCTURAL ENGINEERING | 4 | 5 | 122 | `review_required` | `not_established` (88) | `pending_full_population_render` |
| Engineering::SYSTEMS ENGINEERING | 5 | 15 | 164 | `review_required` | `not_established` (138) | `pending_full_population_render` |
| Engineering::TELECOMMUNICATIONS ENGINEERING | 3 | 7 | 61 | `review_required` | `not_established` (102) | `pending_full_population_render` |
| Engineering::WATER RESOURCES ENGINEERING | 2 | 0 | 87 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Engineering::WOOD PRODUCTS ENGINEERING | 3 | 13 | 87 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Environmental Sciences::Building | 5 | 10 | 195 | `review_required` | `not_established` (80) | `pending_full_population_render` |
| Environmental Sciences::Clothing and Textile Design | 3 | 13 | 135 | `review_required` | `review_required` (0) | `pending_full_population_render` |

## Decision

The bounded local contract audit is complete for this 20-programme slice. Student approval is **not** granted: review-required, not-established, unavailable and admin-pending states remain fail-closed. Browser rendering, live payload verification and SQL deployment are explicitly outside this checkpoint.

## Extended downstream/admin gates

| Gate | Result | Evidence |
|---|---|---|
| `curriculum_course_evidence` | **PASS** | local contract/static evidence |
| `source_ownership_and_urls` | **PASS** | local contract/static evidence |
| `student_admin_language_and_summaries` | **PASS** | local contract/static evidence |
| `thematic_category_boundary` | **PASS** | local contract/static evidence |
| `role_learning_caps` | **PASS** | local contract/static evidence |
| `resource_state_handling` | **PASS** | local contract/static evidence |
| `relationship_state_handling` | **PASS** | local contract/static evidence |
| `student_exposure_fail_closed` | **PASS** | local contract/static evidence |
| `relationship_grouping_static` | **PASS** | local contract/static evidence |
| `resource_review_queue_closed` | **OPEN / DEFERRED** | local contract/static evidence |
| `relationship_review_queue_closed` | **OPEN / DEFERRED** | local contract/static evidence |
| `admin_render_acceptance` | **OPEN / DEFERRED** | local contract/static evidence |
| `full_admin_render_accepted` | **OPEN / DEFERRED** | local contract/static evidence |
| `browser_proof` | **OPEN / DEFERRED** | local contract/static evidence |
| `live_sql` | **OPEN / DEFERRED** | local contract/static evidence |

## Exact blockers

- Resource review is still open for 20/20 selected programmes; no generic homepage is substituted.
- Relationship review is still open for 20/20 selected programmes, representing 3154 unresolved/not-established rows.
- Admin render acceptance is pending for 20/20 selected programmes.
- Global role work-profile evidence remains absent for 119 roles; learnable-skill caps pass, but unsupported role preparation remains review-only.
- Browser proof, live payload verification and manual SQL are deferred final gates by instruction.

## Selected-slice source/category counters

| Programme | Courses | Outcomes | Resource | Relationship | Unresolved | Admin |
|---|---:|---:|---|---|---:|---|
| Engineering::MATERIALS AND METALLURGICAL ENGINEERING | 52 | 334 | `review_required` | `not_established` | 222 | `pending_full_population_render` |
| Engineering::MATERIALS ENGINEERING | 49 | 328 | `review_required` | `not_established` | 262 | `pending_full_population_render` |
| Engineering::MECHANICAL ENGINEERING | 51 | 324 | `review_required` | `not_established` | 192 | `pending_full_population_render` |
| Engineering::MECHATRONICS ENGINEERING | 49 | 308 | `review_required` | `not_established` | 164 | `pending_full_population_render` |
| Engineering::METALLURGICAL ENGINEERING | 51 | 295 | `review_required` | `not_established` | 330 | `pending_full_population_render` |
| Engineering::MINERAL PROCESSING AND CHEMICAL-METALLURGICAL ENGINEERING | 48 | 260 | `review_required` | `not_established` | 330 | `pending_full_population_render` |
| Engineering::MINING ENGINEERING | 49 | 398 | `review_required` | `not_established` | 404 | `pending_full_population_render` |
| Engineering::NATURAL GAS ENGINEERING | 50 | 380 | `review_required` | `not_established` | 100 | `pending_full_population_render` |
| Engineering::NUCLEAR ENGINEERING | 36 | 249 | `review_required` | `not_established` | 106 | `pending_full_population_render` |
| Engineering::PETROCHEMICAL ENGINEERING | 56 | 383 | `review_required` | `not_established` | 86 | `pending_full_population_render` |
| Engineering::PETROLEUM AND GAS ENGINEERING | 51 | 335 | `review_required` | `not_established` | 172 | `pending_full_population_render` |
| Engineering::PETROLEUM ENGINEERING | 49 | 313 | `review_required` | `not_established` | 232 | `pending_full_population_render` |
| Engineering::RAILWAY ENGINEERING | 42 | 274 | `review_required` | `not_established` | 146 | `pending_full_population_render` |
| Engineering::STRUCTURAL ENGINEERING | 47 | 397 | `review_required` | `not_established` | 88 | `pending_full_population_render` |
| Engineering::SYSTEMS ENGINEERING | 50 | 368 | `review_required` | `not_established` | 138 | `pending_full_population_render` |
| Engineering::TELECOMMUNICATIONS ENGINEERING | 52 | 377 | `review_required` | `not_established` | 102 | `pending_full_population_render` |
| Engineering::WATER RESOURCES ENGINEERING | 49 | 319 | `review_required` | `review_required` | 0 | `pending_full_population_render` |
| Engineering::WOOD PRODUCTS ENGINEERING | 50 | 291 | `review_required` | `review_required` | 0 | `pending_full_population_render` |
| Environmental Sciences::Building | 70 | 306 | `review_required` | `not_established` | 80 | `pending_full_population_render` |
| Environmental Sciences::Clothing and Textile Design | 34 | 165 | `review_required` | `review_required` | 0 | `pending_full_population_render` |
