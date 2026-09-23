# Downstream/admin slice 005 report

Generated: 2026-09-21
Mode: read-only local contract audit; no app code, catalogue, seed transport, SQL, UI or browser-proof file was changed.

## Scope

- Programmes audited: **20**; overlap with prior tranche: **0**.
- Downstream routes: **81** domains, **221** subgroups, **3290** roles.
- Unresolved/not-established relationship queue represented by this slice: **5458**.

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
| Arts::Modern European Languages B.A (French) | 1 | 4 | 11 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Arts::Modern European Languages B.A (German) | 3 | 6 | 97 | `review_required` | `not_established` (212) | `pending_full_population_render` |
| Arts::Music | 3 | 11 | 159 | `review_required` | `not_established` (60) | `pending_full_population_render` |
| Arts::Philosophy | 2 | 5 | 50 | `review_required` | `review_required` (0) | `pending_full_population_render` |
| Arts::Religious Studies | 6 | 14 | 246 | `review_required` | `not_established` (292) | `pending_full_population_render` |
| Arts::Sharcah | 4 | 12 | 59 | `review_required` | `not_established` (60) | `pending_full_population_render` |
| Arts::Theatre Arts | 6 | 17 | 265 | `review_required` | `not_established` (548) | `pending_full_population_render` |
| Basic Medical Sciences::Human Anatomy | 7 | 21 | 292 | `review_required` | `not_established` (78) | `pending_full_population_render` |
| Basic Medical Sciences::Physiology | 5 | 16 | 162 | `review_required` | `not_established` (78) | `pending_full_population_render` |
| Communication and Media Studies::ADVERTISING — P12, P13, P14 | 3 | 10 | 167 | `review_required` | `not_established` (336) | `pending_full_population_render` |
| Communication and Media Studies::BROADCASTING — P12, P13, P14 | 5 | 13 | 250 | `review_required` | `not_established` (548) | `pending_full_population_render` |
| Communication and Media Studies::DEVELOPMENT COMMUNICATION STUDIES — P12, P13, P14 | 3 | 9 | 172 | `review_required` | `not_established` (298) | `pending_full_population_render` |
| Communication and Media Studies::FILM & MULTIMEDIA — P12, P13, P14 | 3 | 10 | 167 | `review_required` | `not_established` (336) | `pending_full_population_render` |
| Communication and Media Studies::INFORMATION AND MEDIA STUDIES — P12, P13, P14 | 4 | 10 | 229 | `review_required` | `not_established` (548) | `pending_full_population_render` |
| Communication and Media Studies::JOURNALISM AND MEDIA STUDIES — P12, P13, P14 | 4 | 10 | 229 | `review_required` | `not_established` (548) | `pending_full_population_render` |
| Communication and Media Studies::MASS COMMUNICATION — P12, P13, P14 | 4 | 10 | 229 | `review_required` | `not_established` (548) | `pending_full_population_render` |
| Communication and Media Studies::PUBLIC RELATIONS — P12, P13, P14 | 2 | 6 | 61 | `review_required` | `not_established` (38) | `pending_full_population_render` |
| Communication and Media Studies::STRATEGIC COMMUNICATION — P12, P13, P14 | 3 | 10 | 167 | `review_required` | `not_established` (336) | `pending_full_population_render` |
| Computing::Computer Science | 5 | 10 | 103 | `review_required` | `not_established` (218) | `pending_full_population_render` |
| Computing::Cybersecurity | 8 | 17 | 175 | `review_required` | `not_established` (376) | `pending_full_population_render` |

## Decision

The bounded local contract audit is complete for this 20-programme slice. Student approval is **not** granted: review-required, not-established, unavailable and admin-pending states remain fail-closed. Browser rendering, live payload verification and SQL deployment are explicitly outside this checkpoint.
