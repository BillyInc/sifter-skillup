# Downstream/admin slice 008 report

Generated: 2026-09-21
Mode: read-only local contract audit; no app code, catalogue, seed transport, SQL, UI or browser-proof file was changed.

## Scope

- Programmes audited: **20**; overlap with prior tranche: **0**.
- Downstream routes: **142** domains, **329** subgroups, **4746** roles.
- Unresolved/not-established relationship queue represented by this slice: **3738**.

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
| Education::Special Needs Education | 3 | 9 | 176 | `review_required` | `not_established` (40) | `pending_full_population_render` |
| Education::Sustainable Development Studies | 5 | 10 | 232 | `review_required` | `not_established` (80) | `pending_full_population_render` |
| Education::Technology Education | 8 | 17 | 369 | `review_required` | `not_established` (90) | `pending_full_population_render` |
| Education::Yoruba | 3 | 9 | 167 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Engineering::AEROSPACE ENGINEERING | 11 | 26 | 281 | `review_required` | `not_established` (472) | `pending_full_population_render` |
| Engineering::AGRICULTURAL AND BIOSYSTEMS ENGINEERING | 7 | 16 | 213 | `review_required` | `not_established` (120) | `pending_full_population_render` |
| Engineering::AUTOMOTIVE ENGINEERING | 10 | 31 | 281 | `review_required` | `not_established` (86) | `pending_full_population_render` |
| Engineering::BIOMEDICAL ENGINEERING | 10 | 26 | 265 | `review_required` | `not_established` (342) | `pending_full_population_render` |
| Engineering::CHEMICAL ENGINEERING | 8 | 20 | 252 | `review_required` | `not_established` (218) | `pending_full_population_render` |
| Engineering::CIVIL ENGINEERING | 8 | 19 | 223 | `review_required` | `not_established` (226) | `pending_full_population_render` |
| Engineering::COMPUTER ENGINEERING | 6 | 9 | 178 | `review_required` | `not_established` (302) | `pending_full_population_render` |
| Engineering::ELECTRICAL AND ELECTRONIC ENGINEERING | 6 | 15 | 172 | `review_required` | `not_established` (192) | `pending_full_population_render` |
| Engineering::ELECTRICAL ENGINEERING | 9 | 20 | 234 | `review_required` | `not_established` (192) | `pending_full_population_render` |
| Engineering::ELECTRONIC ENGINEERING | 7 | 14 | 200 | `review_required` | `not_established` (182) | `pending_full_population_render` |
| Engineering::ENVIRONMENTAL ENGINEERING | 7 | 13 | 199 | `review_required` | `not_established` (80) | `pending_full_population_render` |
| Engineering::FOOD ENGINEERING | 8 | 16 | 371 | `review_required` | `not_established` (204) | `pending_full_population_render` |
| Engineering::FOOD SCIENCE AND TECHNOLOGY | 6 | 16 | 288 | `review_required` | `not_established` (178) | `pending_full_population_render` |
| Engineering::INDUSTRIAL AND PRODUCTION ENGINEERING | 7 | 14 | 274 | `review_required` | `not_established` (354) | `pending_full_population_render` |
| Engineering::INFORMATION AND COMMUNICATION ENGINEERING | 6 | 15 | 160 | `review_required` | `not_established` (380) | `pending_full_population_render` |
| Engineering::MARINE AND OFFSHORE ENGINEERING | 7 | 14 | 211 | `review_required` | `review_required` (0) | `pending_full_population_render` |

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
- Relationship review is still open for 20/20 selected programmes, representing 3738 unresolved/not-established rows.
- Admin render acceptance is pending for 20/20 selected programmes.
- Global role work-profile evidence remains absent for 119 roles; learnable-skill caps pass, but unsupported role preparation remains review-only.
- Browser proof, live payload verification and manual SQL are deferred final gates by instruction.

## Selected-slice source/category counters

| Programme | Courses | Outcomes | Resource | Relationship | Unresolved | Admin |
|---|---:|---:|---|---|---:|---|
| Education::Special Needs Education | 32 | 869 | `review_required` | `not_established` | 40 | `pending_full_population_render` |
| Education::Sustainable Development Studies | 28 | 625 | `review_required` | `not_established` | 80 | `pending_full_population_render` |
| Education::Technology Education | 68 | 1246 | `review_required` | `not_established` | 90 | `pending_full_population_render` |
| Education::Yoruba | 32 | 661 | `review_required` | `review_required` | 0 | `pending_full_population_render` |
| Engineering::AEROSPACE ENGINEERING | 53 | 383 | `review_required` | `not_established` | 472 | `pending_full_population_render` |
| Engineering::AGRICULTURAL AND BIOSYSTEMS ENGINEERING | 53 | 554 | `review_required` | `not_established` | 120 | `pending_full_population_render` |
| Engineering::AUTOMOTIVE ENGINEERING | 48 | 294 | `review_required` | `not_established` | 86 | `pending_full_population_render` |
| Engineering::BIOMEDICAL ENGINEERING | 53 | 575 | `review_required` | `not_established` | 342 | `pending_full_population_render` |
| Engineering::CHEMICAL ENGINEERING | 52 | 403 | `review_required` | `not_established` | 218 | `pending_full_population_render` |
| Engineering::CIVIL ENGINEERING | 49 | 409 | `review_required` | `not_established` | 226 | `pending_full_population_render` |
| Engineering::COMPUTER ENGINEERING | 50 | 302 | `review_required` | `not_established` | 302 | `pending_full_population_render` |
| Engineering::ELECTRICAL AND ELECTRONIC ENGINEERING | 50 | 327 | `review_required` | `not_established` | 192 | `pending_full_population_render` |
| Engineering::ELECTRICAL ENGINEERING | 50 | 376 | `review_required` | `not_established` | 192 | `pending_full_population_render` |
| Engineering::ELECTRONIC ENGINEERING | 51 | 377 | `review_required` | `not_established` | 182 | `pending_full_population_render` |
| Engineering::ENVIRONMENTAL ENGINEERING | 51 | 381 | `review_required` | `not_established` | 80 | `pending_full_population_render` |
| Engineering::FOOD ENGINEERING | 50 | 328 | `review_required` | `not_established` | 204 | `pending_full_population_render` |
| Engineering::FOOD SCIENCE AND TECHNOLOGY | 56 | 375 | `review_required` | `not_established` | 178 | `pending_full_population_render` |
| Engineering::INDUSTRIAL AND PRODUCTION ENGINEERING | 48 | 329 | `review_required` | `not_established` | 354 | `pending_full_population_render` |
| Engineering::INFORMATION AND COMMUNICATION ENGINEERING | 53 | 312 | `review_required` | `not_established` | 380 | `pending_full_population_render` |
| Engineering::MARINE AND OFFSHORE ENGINEERING | 60 | 387 | `review_required` | `review_required` | 0 | `pending_full_population_render` |
