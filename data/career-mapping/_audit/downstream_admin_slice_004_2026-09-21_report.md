# Downstream/admin slice 004 report

Generated: 2026-09-21
Mode: read-only local contract audit; no app code, catalogue, seed transport, SQL, UI or browser-proof file was changed.

## Scope

- Programmes audited: **20**; overlap with prior tranche: **0**.
- Downstream routes: **76** domains, **189** subgroups, **3622** roles.
- Unresolved/not-established relationship queue represented by this slice: **4160**.

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
| Architecture::Naval Architecture | 9 | 10 | 269 | `review_required` | `not_established` (26) | `pending_full_population_render` |
| Arts::African Languages and Literature Yoruba | 6 | 13 | 367 | `review_required` | `not_established` (510) | `pending_full_population_render` |
| Arts::African Tradition Religion | 2 | 4 | 129 | `review_required` | `not_established` (40) | `pending_full_population_render` |
| Arts::Arabic | 4 | 12 | 211 | `review_required` | `not_established` (272) | `pending_full_population_render` |
| Arts::Archaeology | 4 | 13 | 104 | `review_required` | `not_established` (60) | `pending_full_population_render` |
| Arts::Chinese Studies | 2 | 4 | 73 | `review_required` | `not_established` (212) | `pending_full_population_render` |
| Arts::Christian Religious Studies | 2 | 6 | 19 | `review_required` | `not_established` (40) | `pending_full_population_render` |
| Arts::Christian Theology | 6 | 13 | 303 | `review_required` | `not_established` (252) | `pending_full_population_render` |
| Arts::Classics | 2 | 6 | 132 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Arts::Efik | 3 | 6 | 194 | `review_required` | `not_established` (212) | `pending_full_population_render` |
| Arts::English Language and Literature | 6 | 19 | 332 | `review_required` | `not_established` (570) | `pending_full_population_render` |
| Arts::Film Production | 6 | 17 | 265 | `review_required` | `not_established` (548) | `pending_full_population_render` |
| Arts::Folklore Studies | 2 | 10 | 141 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Arts::Hausa | 2 | 4 | 73 | `review_required` | `not_established` (212) | `pending_full_population_render` |
| Arts::History/History and Diplomatic Studies | 4 | 15 | 179 | `review_required` | `not_established` (20) | `pending_full_population_render` |
| Arts::Ibibio | 3 | 6 | 194 | `review_required` | `not_established` (212) | `pending_full_population_render` |
| Arts::Igbo | 5 | 13 | 321 | `review_required` | `not_established` (510) | `pending_full_population_render` |
| Arts::Islamic Studies | 3 | 7 | 155 | `review_required` | `not_established` (40) | `pending_full_population_render` |
| Arts::Linguistics | 3 | 7 | 88 | `review_required` | `not_established` (212) | `pending_full_population_render` |
| Arts::Modern European Languages (Russian) | 2 | 4 | 73 | `review_required` | `not_established` (212) | `pending_full_population_render` |

## Decision

The bounded local contract audit is complete for this 20-programme slice. Student approval is **not** granted: review-required, not-established, unavailable and admin-pending states remain fail-closed. Browser rendering, live payload verification and SQL deployment are explicitly outside this checkpoint.
