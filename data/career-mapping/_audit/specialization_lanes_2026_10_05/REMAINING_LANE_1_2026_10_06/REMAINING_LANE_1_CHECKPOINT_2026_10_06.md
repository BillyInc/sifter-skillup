# Remaining lane 1 — global specialization/subgroup reconciliation

This lane covers all 32 assigned IDs. It consolidates existing global evidence and rechecks it against the current catalogue; it does not silently claim candidate areas are canonical.

## Counts

- Assigned/completed: 32/32
- Candidate area labels: 136
- Source records / unique URLs: 219 / 119
- Domains with zero candidate areas / direct-route disposition: 2
- Domains with zero visible subgroups: 16
- Domains with zero active roles: 7
- Canonical files changed: 0
- Role-to-specialization assignments: 0
- Nigerian-context reviews: 0

## Per-domain disposition

| ID | Domain | Candidate areas | Visible subgroups | Active roles | Action |
|---|---|---:|---:|---:|---|
| D004 | Cybersecurity | 8 | 0 | 12 | replace_or_reconcile_current_subgroup_records_before_activation |
| D008 | Telecommunications and Network Engineering | 4 | 4 | 15 | candidate_specialization_structure_pending_canonical_adoption |
| D012 | FinTech Engineering | 3 | 3 | 8 | candidate_specialization_structure_pending_canonical_adoption |
| D024 | Nursing | 0 | 0 | 38 | retain_or_make_direct_domain_to_role_route_until_parent_scope_is_resolved |
| D029 | Human Resources | 11 | 0 | 16 | replace_or_reconcile_current_subgroup_records_before_activation |
| D033 | Product Management | 4 | 3 | 51 | replace_or_reconcile_current_subgroup_records_before_activation |
| D037 | Legal Practice | 7 | 0 | 0 | replace_or_reconcile_current_subgroup_records_before_activation |
| D041 | Scientific Research | 6 | 0 | 12 | replace_or_reconcile_current_subgroup_records_before_activation |
| D045 | Public Administration and Policy | 4 | 0 | 0 | replace_or_reconcile_current_subgroup_records_before_activation |
| D049 | Automotive Engineering | 5 | 0 | 0 | replace_or_reconcile_current_subgroup_records_before_activation |
| D053 | Hospitality Services and Management | 4 | 0 | 0 | replace_or_reconcile_current_subgroup_records_before_activation |
| D057 | Digital Health and Health Technology | 3 | 4 | 12 | retain_or_make_direct_domain_to_role_route_until_parent_scope_is_resolved |
| D067 | Dentistry | 8 | 0 | 5 | replace_or_reconcile_current_subgroup_records_before_activation |
| D073 | Libraries, Archives and Information Management | 4 | 3 | 15 | replace_or_reconcile_current_subgroup_records_before_activation |
| D077 | Security Services | 4 | 2 | 31 | replace_or_reconcile_current_subgroup_records_before_activation |
| D081 | Office Administration and Secretarial Services | 4 | 5 | 12 | replace_or_reconcile_current_subgroup_records_before_activation |
| D099 | Masonry, Bricklaying, Tiling and Plastering | 3 | 0 | 14 | replace_or_reconcile_current_subgroup_records_before_activation |
| D103 | Jewellery Making and Goldsmithing | 2 | 4 | 13 | replace_or_reconcile_current_subgroup_records_before_activation |
| D107 | Leatherworking, Shoemaking and Leather Goods | 3 | 7 | 68 | replace_or_reconcile_current_subgroup_records_before_activation |
| D111 | Textile and Garment Machine Operations | 4 | 6 | 43 | replace_or_reconcile_current_subgroup_records_before_activation |
| D124 | Community Health Extension | 0 | 0 | 17 | retain_or_make_direct_domain_to_role_route_until_parent_scope_is_resolved |
| D128 | Social Welfare and Youth Services | 4 | 5 | 5 | replace_or_reconcile_current_subgroup_records_before_activation |
| D132 | Space Science and Exploration | 5 | 0 | 1 | replace_or_reconcile_current_subgroup_records_before_activation |
| D136 | Aeronautical and Aerospace Engineering | 2 | 4 | 7 | candidate_specialization_structure_pending_canonical_adoption |
| D140 | Robotics Engineering and Systems Design | 4 | 3 | 6 | candidate_specialization_structure_pending_canonical_adoption |
| D144 | Climate Science and Meteorology | 4 | 0 | 4 | replace_or_reconcile_current_subgroup_records_before_activation |
| D148 | Offshore and Subsea Engineering | 5 | 0 | 18 | replace_or_reconcile_current_subgroup_records_before_activation |
| D152 | Museums, Cultural Heritage, Archives and Archaeology | 5 | 4 | 0 | replace_or_reconcile_current_subgroup_records_before_activation |
| D156 | Land Surveying and Cadastral Mapping | 4 | 0 | 6 | replace_or_reconcile_current_subgroup_records_before_activation |
| D160 | Fashion Styling, Image Consulting and Personal Shopping | 4 | 5 | 0 | replace_or_reconcile_current_subgroup_records_before_activation |
| D164 | Urban Mobility and Smart City Systems | 4 | 0 | 12 | replace_or_reconcile_current_subgroup_records_before_activation |
| D168 | Esports and Creator Economy | 4 | 6 | 0 | replace_or_reconcile_current_subgroup_records_before_activation |

## Implementation boundary

The exact patch recommendation for each domain is in its per-domain JSON/Markdown artifact. Because candidate counts are internal syntheses and several parent boundaries remain open, this lane does not apply canonical subgroup replacements or role links. That is an audit-safe fix boundary, not a claim that the taxonomy is finished.

## Reproduction

python data/career-mapping/_audit/specialization_lanes_2026_10_05/REMAINING_LANE_1_2026_10_06/build_remaining_lane_1_reconciliation_2026_10_06.py
