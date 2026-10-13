# Global specialization reconciliation — D001–D002, provisional D057–D066, D092–D112

Date: 2026-10-06. This disjoint lane reuses and checks current source-backed artifacts; it does not silently recreate completed review work.

## Scope and counts

- Expected/examined: **31/31 domain IDs**.
- Per-domain reconciliation artifacts: **31 JSON + 31 Markdown**.
- Unique source URLs carried into the reconciliations: **135**.
- Missing candidate-evidence domains: **0** (none).
- Nigerian-specific research: **not performed**, as explicitly required.
- Canonical taxonomy edits / role assignments: **0 / 0**.

## Interpretation

The 23 requested IDs outside the provisional D057–D066 slice already had review recommendations in the shared register and/or the D099–D112 lane. The eight carried-forward provisional D057–D066 records are normalized from their lane reviews without repeating completed source research. This reconciliation does not claim recommendations are canonical or academically approved. Country- and institution-specific international examples are corroboration only, not global requirements.

The eight explicitly open/provisional D057–D091 IDs are D057, D058, D060, D062, D063, D064, D065 and D066. Their parent/count/coverage limits and source records are retained in their per-domain outputs.

D098 is the explicit conflict: the original shared register says three candidate areas, while the later sourced adjudication recommends four (precision production; precision instruments/optics; dimensional metrology; horology). The four-area version is recorded as the latest lane recommendation, but it remains to be reconciled into the shared register and is not a canonical change.

## Domain dispositions (31 IDs)

| ID | Domain | Candidate areas | Existing review disposition |
|---|---|---:|---|
| D001 | Software Engineering | 6 | source_reviewed_specialization_set_recommended |
| D002 | Data Engineering and Architecture | 4 | source_reviewed_specialization_set_recommended |
| D057 | Digital Health and Health Technology | 0 | source_reviewed_provisional_candidate_set |
| D058 | Education Technology and Learning Experience Design | None | source_reviewed_provisional_set_and_parent_boundary |
| D060 | Banking and Credit Services | None | provisional_source_reviewed |
| D062 | Trading | 2 | provisional_candidate_set_recommended_parent_scope_boundary_open |
| D063 | Economics and Policy Analysis | 6 | provisional_candidate_set_recommended_set_granularity_and_parent_boundaries_need_catalogue_reconciliation |
| D064 | Psychology and Counselling | 8 | provisional_candidate_set_recommended_cross_region_title_and_scope_variation_remains |
| D065 | Translation, Interpretation and Linguistics | 6 | provisional_candidate_set_recommended_specialization_scope_and_count_need_catalogue_reconciliation |
| D066 | Veterinary Science | 8 | provisional_candidate_set_recommended_count_and_cross_domain_ownership_need_catalogue_reconciliation |
| D092 | Culinary Arts, Catering and Food Service | 4 | source_reviewed_specialization_set_recommended |
| D093 | Electrical Installation, Wiring and Maintenance | 2 | source_reviewed_specialization_set_recommended |
| D094 | Electronics and ICT Equipment Servicing, Smart Systems Installation | 4 | source_reviewed_specialization_set_recommended |
| D095 | Motor Vehicle Mechanics and Repairs | 3 | source_reviewed_specialization_set_recommended |
| D096 | Agricultural Machinery and Farm Operations | 2 | source_reviewed_specialization_set_recommended |
| D097 | Welding, Fabrication and Blacksmithing | 3 | source_reviewed_specialization_set_recommended |
| D098 | Precision Engineering and Toolmaking | 4 | reconciled_recommendation_pending_shared_register_and_canonical_adoption |
| D099 | Masonry, Bricklaying, Tiling and Plastering | 3 | candidate_set_reviewed_with_explicit_residuals |
| D100 | Plumbing, Pipefitting and Building Climate Systems | 3 | candidate_set_reviewed_with_explicit_residuals |
| D101 | Painting, Decorating and Surface Treatment | 2 | source_gap_closed_candidate_boundary_or_count_remains_provisional |
| D102 | Carpentry, Joinery, Wood Technology and Furniture Making | 3 | candidate_set_reviewed_with_explicit_residuals |
| D103 | Jewellery Making and Goldsmithing | 2 | candidate_set_reviewed_with_explicit_residuals |
| D104 | Pottery, Ceramics and Glasswork | 2 | source_gap_closed_candidate_boundary_or_count_remains_provisional |
| D105 | Handicrafts, Basketry and Textile Crafts | 2 | source_gap_closed_candidate_boundary_or_count_remains_provisional |
| D106 | Garment Making, Tailoring and Dressmaking | 3 | candidate_set_reviewed_with_explicit_residuals |
| D107 | Leatherworking, Shoemaking and Leather Goods | 3 | source_gap_closed_candidate_boundary_or_count_remains_provisional |
| D108 | Printing Technology, Pre-press and Print Finishing | 3 | candidate_set_reviewed_with_explicit_residuals |
| D109 | Metal Processing, Foundry and Casting Operations | 3 | source_gap_closed_candidate_boundary_or_count_remains_provisional |
| D110 | Chemical, Rubber and Plastics Plant Operations | 2 | source_gap_closed_candidate_boundary_or_count_remains_provisional |
| D111 | Textile and Garment Machine Operations | 4 | source_gap_closed_candidate_boundary_or_count_remains_provisional |
| D112 | Wood, Pulp and Paper Processing | 3 | source_gap_closed_candidate_boundary_or_count_remains_provisional |

## Source limitations

- This is a source-grounded internal taxonomy review, not endorsement, accreditation, or sign-off by an academic body.
- WorldSkills and international professional/standards sources establish recognizable practice boundaries, not a universally mandated subgroup count.
- Foreign national standards and institutional curricula can corroborate a practice but cannot establish Nigerian licensing, curriculum requirements, or workforce demand; those belong to a later separately labeled Nigeria pass.
- Candidate count is based on distinct learning/practice scope and source-backed boundaries, never current subgroup count, ISCO buckets, role frequency, or keyword hits.
- Role-to-domain and role-to-specialization fit remains separate; no roles were attached here.

## Reproduction

`python data/career-mapping/_audit/specialization_lanes_2026_10_05/D001_D112_GLOBAL_RECONCILIATION/build_global_specialization_reconciliation_2026_10_06.py`
