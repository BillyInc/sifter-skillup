# Downstream/admin slice 006 report

Generated: 2026-09-21
Mode: read-only local contract audit; no app code, catalogue, seed transport, SQL, UI or browser-proof file was changed.

## Scope

- Programmes audited: **20**; overlap with prior tranche: **0**.
- Downstream routes: **113** domains, **288** subgroups, **4762** roles.
- Unresolved/not-established relationship queue represented by this slice: **3036**.

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
| Computing::Data Science | 5 | 7 | 129 | `review_required` | `not_established` (256) | `pending_full_population_render` |
| Computing::Information and Communication Technology | 7 | 16 | 134 | `review_required` | `not_established` (314) | `pending_full_population_render` |
| Computing::Information Systems | 8 | 17 | 220 | `review_required` | `not_established` (394) | `pending_full_population_render` |
| Computing::Information Technology | 8 | 18 | 159 | `review_required` | `not_established` (314) | `pending_full_population_render` |
| Computing::Software Engineering | 9 | 26 | 187 | `review_required` | `not_established` (356) | `pending_full_population_render` |
| Education::Adult and Continuing Education | 5 | 16 | 220 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Education::Agricultural Education | 6 | 15 | 289 | `review_required` | `not_established` (58) | `pending_full_population_render` |
| Education::Arabic | 3 | 9 | 167 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Education::Biology | 7 | 19 | 314 | `review_required` | `not_established` (198) | `pending_full_population_render` |
| Education::Business Education | 9 | 27 | 340 | `review_required` | `not_established` (20) | `pending_full_population_render` |
| Education::Chemistry | 7 | 19 | 306 | `review_required` | `not_established` (60) | `pending_full_population_render` |
| Education::Christian Religious Studies | 4 | 11 | 175 | `review_required` | `not_established` (40) | `pending_full_population_render` |
| Education::Computer Science | 4 | 5 | 188 | `review_required` | `not_established` (138) | `pending_full_population_render` |
| Education::Creative Arts Education | 6 | 16 | 344 | `review_required` | `not_established` (298) | `pending_full_population_render` |
| Education::Early Childhood Education | 2 | 5 | 198 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Education::Educational Management | 6 | 17 | 329 | `review_required` | `not_established` (60) | `pending_full_population_render` |
| Education::Educational Technology | 3 | 9 | 262 | `review_required` | `not_established` (298) | `pending_full_population_render` |
| Education::Efik-Ibibio Education | 3 | 9 | 167 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Education::English Language/Literature-in-English | 4 | 9 | 229 | `review_required` | `not_established` (212) | `pending_full_population_render` |
| Education::Entrepreneurship Education | 7 | 18 | 405 | `review_required` | `not_established` (20) | `pending_full_population_render` |

## Decision

The bounded local contract audit is complete for this 20-programme slice. Student approval is **not** granted: review-required, not-established, unavailable and admin-pending states remain fail-closed. Browser rendering, live payload verification and SQL deployment are explicitly outside this checkpoint.

## Concrete blockers

- Resource review: **20/20** programmes remain `review_required`; no student resource approval is inferred.
- Relationships: **16** programme queues are `not_established` and **4** are `review_required`; **3,036** unresolved/not-established rows are represented by this slice and remain staff-review-only.
- Admin acceptance: **20/20** programmes remain `pending_full_population_render`; local static/admin contract checks are not rendered-admin acceptance.
- Browser proof and live Supabase SQL verification: **not performed**.
