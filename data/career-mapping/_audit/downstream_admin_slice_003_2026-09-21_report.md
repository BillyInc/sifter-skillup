# Downstream/admin slice 003 report

Generated: 2026-09-21
Mode: read-only local contract audit; no app code, catalogue, seed transport, SQL, UI or browser-proof file was changed.

## Scope

- Programmes audited: **20**; overlap with prior tranche: **0**.
- Downstream routes: **92** domains, **224** subgroups, **2510** roles.
- Unresolved/not-established relationship queue represented by this slice: **5718**.

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
| Allied Health Sciences::Environmental Health Science | 8 | 25 | 212 | `review_required` | `not_established` (178) | `pending_full_population_render` |
| Allied Health Sciences::Health Care Administration and Hospital Management | 5 | 15 | 175 | `review_required` | `not_established` (80) | `pending_full_population_render` |
| Allied Health Sciences::Health Information Management | 4 | 12 | 64 | `review_required` | `not_established` (98) | `pending_full_population_render` |
| Allied Health Sciences::Human Nutrition and Dietetics | 5 | 11 | 188 | `review_required` | `not_established` (60) | `pending_full_population_render` |
| Allied Health Sciences::Information Technology and Health Informatics | 7 | 14 | 187 | `review_required` | `not_established` (1230) | `pending_full_population_render` |
| Allied Health Sciences::Medical Laboratory Science | 5 | 16 | 173 | `review_required` | `not_established` (60) | `pending_full_population_render` |
| Allied Health Sciences::Nursing Sciences | 6 | 15 | 145 | `review_required` | `not_established` (366) | `pending_full_population_render` |
| Allied Health Sciences::Occupational Therapy | 4 | 10 | 81 | `review_required` | `not_established` (60) | `pending_full_population_render` |
| Allied Health Sciences::Optometry | 6 | 11 | 175 | `review_required` | `not_established` (1162) | `pending_full_population_render` |
| Allied Health Sciences::Pharmacology | 8 | 20 | 254 | `review_required` | `not_established` (804) | `pending_full_population_render` |
| Allied Health Sciences::Physiotherapy | 4 | 10 | 70 | `review_required` | `not_established` (60) | `pending_full_population_render` |
| Allied Health Sciences::Prosthetics and Orthotics | 2 | 5 | 53 | `review_required` | `not_established` (18) | `pending_full_population_render` |
| Allied Health Sciences::Public Health | 4 | 13 | 138 | `review_required` | `not_established` (80) | `pending_full_population_render` |
| Allied Health Sciences::Radiography | 7 | 23 | 132 | `review_required` | `not_established` (886) | `pending_full_population_render` |
| Allied Health Sciences::Speech-Language Therapy | 1 | 0 | 38 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Architecture::Architectural Technology | 5 | 5 | 164 | `review_required` | `not_established` (126) | `pending_full_population_render` |
| Architecture::Architecture | 4 | 11 | 94 | `review_required` | `not_established` (146) | `pending_full_population_render` |
| Architecture::Furniture Design | 2 | 3 | 57 | `review_required` | `not_established` (106) | `pending_full_population_render` |
| Architecture::Interior Architecture and Design | 2 | 0 | 45 | `review_required` | `not_established` (60) | `pending_full_population_render` |
| Architecture::Landscape Architecture | 3 | 5 | 65 | `review_required` | `not_established` (138) | `pending_full_population_render` |

## Decision

The bounded local contract audit is complete for this 20-programme slice. Student approval is **not** granted: review-required, not-established, unavailable and admin-pending states remain fail-closed. Browser rendering, live payload verification and SQL deployment are explicitly outside this checkpoint.
