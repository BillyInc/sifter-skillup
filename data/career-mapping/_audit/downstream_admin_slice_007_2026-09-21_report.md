# Downstream/admin slice 007 report

Generated: 2026-09-21
Mode: read-only local contract audit; no app code, catalogue, seed transport, SQL, UI or browser-proof file was changed.

## Scope

- Programmes audited: **20**; overlap with prior tranche: **0**.
- Downstream routes: **73** domains, **197** subgroups, **3948** roles.
- Unresolved/not-established relationship queue represented by this slice: **1430**.

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
| Education::Environmental Education | 3 | 4 | 183 | `review_required` | `not_established` (60) | `pending_full_population_render` |
| Education::French | 3 | 9 | 167 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Education::Geography | 7 | 19 | 324 | `review_required` | `not_established` (178) | `pending_full_population_render` |
| Education::Guidance and Counselling | 5 | 15 | 298 | `review_required` | `not_established` (40) | `pending_full_population_render` |
| Education::Hausa | 3 | 9 | 167 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Education::Health Education | 6 | 18 | 317 | `review_required` | `not_established` (306) | `pending_full_population_render` |
| Education::History | 4 | 15 | 200 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Education::Home Economics | 4 | 16 | 222 | `review_required` | `not_established` (40) | `pending_full_population_render` |
| Education::Human Kinetics/Physical Education | 2 | 5 | 156 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Education::Igbo | 3 | 9 | 167 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Education::Integrated Science | 3 | 7 | 198 | `review_required` | `not_established` (60) | `pending_full_population_render` |
| Education::Islamic Studies | 3 | 7 | 164 | `review_required` | `not_established` (40) | `pending_full_population_render` |
| Education::Language Arts and Communication | 3 | 6 | 194 | `review_required` | `not_established` (212) | `pending_full_population_render` |
| Education::Library and Information Science | 2 | 3 | 77 | `review_required` | `not_established` (212) | `pending_full_population_render` |
| Education::Mathematics | 2 | 4 | 50 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Education::Music | 3 | 8 | 177 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Education::Physics | 7 | 17 | 284 | `review_required` | `not_established` (202) | `pending_full_population_render` |
| Education::Political Science | 5 | 13 | 217 | `review_required` | `not_established` (20) | `pending_full_population_render` |
| Education::Primary Education | 2 | 5 | 156 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Education::Social Studies and Civic Education | 3 | 8 | 230 | `review_required` | `not_established` (60) | `pending_full_population_render` |

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
- Relationship review is still open for 20/20 selected programmes, representing 1430 unresolved/not-established rows.
- Admin render acceptance is pending for 20/20 selected programmes.
- Global role work-profile evidence remains absent for 119 roles; learnable-skill caps pass, but unsupported role preparation remains review-only.
- Browser proof, live payload verification and manual SQL are deferred final gates by instruction.

## Selected-slice source/category counters

| Programme | Courses | Outcomes | Resource | Relationship | Unresolved | Admin |
|---|---:|---:|---|---|---:|---|
| Education::Environmental Education | 24 | 427 | `review_required` | `not_established` | 60 | `pending_full_population_render` |
| Education::French | 30 | 549 | `review_required` | `review_required` | 0 | `pending_full_population_render` |
| Education::Geography | 31 | 579 | `review_required` | `not_established` | 178 | `pending_full_population_render` |
| Education::Guidance and Counselling | 30 | 841 | `review_required` | `not_established` | 40 | `pending_full_population_render` |
| Education::Hausa | 15 | 565 | `review_required` | `review_required` | 0 | `pending_full_population_render` |
| Education::Health Education | 40 | 790 | `review_required` | `not_established` | 306 | `pending_full_population_render` |
| Education::History | 32 | 750 | `review_required` | `review_required` | 0 | `pending_full_population_render` |
| Education::Home Economics | 24 | 580 | `review_required` | `not_established` | 40 | `pending_full_population_render` |
| Education::Human Kinetics/Physical Education | 12 | 646 | `review_required` | `review_required` | 0 | `pending_full_population_render` |
| Education::Igbo | 29 | 524 | `review_required` | `review_required` | 0 | `pending_full_population_render` |
| Education::Integrated Science | 37 | 766 | `review_required` | `not_established` | 60 | `pending_full_population_render` |
| Education::Islamic Studies | 33 | 857 | `review_required` | `not_established` | 40 | `pending_full_population_render` |
| Education::Language Arts and Communication | 37 | 484 | `review_required` | `not_established` | 212 | `pending_full_population_render` |
| Education::Library and Information Science | 24 | 574 | `review_required` | `not_established` | 212 | `pending_full_population_render` |
| Education::Mathematics | 36 | 749 | `review_required` | `review_required` | 0 | `pending_full_population_render` |
| Education::Music | 34 | 505 | `review_required` | `review_required` | 0 | `pending_full_population_render` |
| Education::Physics | 32 | 609 | `review_required` | `not_established` | 202 | `pending_full_population_render` |
| Education::Political Science | 37 | 631 | `review_required` | `not_established` | 20 | `pending_full_population_render` |
| Education::Primary Education | 27 | 564 | `review_required` | `review_required` | 0 | `pending_full_population_render` |
| Education::Social Studies and Civic Education | 36 | 668 | `review_required` | `not_established` | 60 | `pending_full_population_render` |
