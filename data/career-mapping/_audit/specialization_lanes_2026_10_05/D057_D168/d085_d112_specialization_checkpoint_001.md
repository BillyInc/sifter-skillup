# D085-D112 specialization checkpoint 001

Existing review artifacts were inspected before starting new domain research. Existing source-reviewed rows are reused; an artifact is not treated as canonical taxonomy or external academic approval.

## Counts

- `domain_ids_in_range`: **28**
- `existing_source_reviewed_register_records_D085_D097`: **13**
- `lane_vs_register_conflicts`: **1**
- `domains_without_any_review_artifact_D099_D112`: **14**
- `domains_screened_in_source_triage_D099_D112`: **14**
- `total_source_ids_with_evidence_register_resolution`: **68**
- `unresolved_shared_evidence_id_references`: **0**

## Per-domain disposition

| ID | Domain | Register areas | Lane areas | State | Sources |
|---|---|---:|---:|---|---:|
| D085 | Retail Sales and Shop Operations | 3 | — | `existing_source_reviewed_register_record_reuse_after_provenance_check` | 3 |
| D086 | Gaming, Betting and Lottery Operations | 4 | — | `existing_source_reviewed_register_record_reuse_after_provenance_check` | 2 |
| D087 | Hairdressing, Barbering & Hair Technology | 3 | — | `existing_source_reviewed_register_record_reuse_after_provenance_check` | 4 |
| D088 | Beauty Therapy, Aesthetics & Spa Services | 6 | — | `existing_source_reviewed_register_record_reuse_after_provenance_check` | 5 |
| D089 | Funeral and Mortuary Services | 3 | — | `existing_source_reviewed_register_record_reuse_after_provenance_check` | 5 |
| D090 | Animal Care, Grooming and Pet Services | 4 | — | `existing_source_reviewed_register_record_reuse_after_provenance_check` | 4 |
| D091 | Driving Instruction | 4 | — | `existing_source_reviewed_register_record_reuse_after_provenance_check` | 5 |
| D092 | Culinary Arts, Catering and Food Service | 4 | — | `existing_source_reviewed_register_record_reuse_after_provenance_check` | 7 |
| D093 | Electrical Installation, Wiring and Maintenance | 2 | — | `existing_source_reviewed_register_record_reuse_after_provenance_check` | 6 |
| D094 | Electronics and ICT Equipment Servicing, Smart Systems Installation | 4 | — | `existing_source_reviewed_register_record_reuse_after_provenance_check` | 5 |
| D095 | Motor Vehicle Mechanics and Repairs | 3 | — | `existing_source_reviewed_register_record_reuse_after_provenance_check` | 5 |
| D096 | Agricultural Machinery and Farm Operations | 2 | — | `existing_source_reviewed_register_record_reuse_after_provenance_check` | 3 |
| D097 | Welding, Fabrication and Blacksmithing | 3 | — | `existing_source_reviewed_register_record_reuse_after_provenance_check` | 6 |
| D098 | Precision Engineering and Toolmaking | 3 | 4 | `material_lane_vs_register_conflict_reconcile_before_completion` | 8 |
| D099 | Masonry, Bricklaying, Tiling and Plastering | 0 | — | `unreviewed_needs_source_based_specialization_review` | 0 |
| D100 | Plumbing, Pipefitting & HVAC Technology | 0 | — | `unreviewed_needs_source_based_specialization_review` | 0 |
| D101 | Painting, Decorating & Surface Treatment | 0 | — | `unreviewed_needs_source_based_specialization_review` | 0 |
| D102 | Carpentry, Joinery, Wood Technology and Furniture Making | 0 | — | `unreviewed_needs_source_based_specialization_review` | 0 |
| D103 | Jewellery Making and Goldsmithing | 0 | — | `unreviewed_needs_source_based_specialization_review` | 0 |
| D104 | Pottery, Ceramics and Glasswork | 0 | — | `unreviewed_needs_source_based_specialization_review` | 0 |
| D105 | Handicrafts, Basketry and Textile Crafts | 0 | — | `unreviewed_needs_source_based_specialization_review` | 0 |
| D106 | Garment Making, Tailoring and Dressmaking | 0 | — | `unreviewed_needs_source_based_specialization_review` | 0 |
| D107 | Leatherworking, Shoemaking and Leather Goods | 0 | — | `unreviewed_needs_source_based_specialization_review` | 0 |
| D108 | Printing Technology, Pre-press and Print Finishing | 0 | — | `unreviewed_needs_source_based_specialization_review` | 0 |
| D109 | Metal Processing, Foundry and Casting Operations | 0 | — | `unreviewed_needs_source_based_specialization_review` | 0 |
| D110 | Chemical, Rubber and Plastics Plant Operations | 0 | — | `unreviewed_needs_source_based_specialization_review` | 0 |
| D111 | Textile and Garment Machine Operations | 0 | — | `unreviewed_needs_source_based_specialization_review` | 0 |
| D112 | Wood, Pulp and Paper Processing | 0 | — | `unreviewed_needs_source_based_specialization_review` | 0 |

## Evidence and boundaries

- D085-D097: reuse the existing register entries only after checking source IDs and claim limits; do not infer correctness from present subgroup counts.
- D098: preserve both versions in lane-owned artifacts; the four-area proposal remains provisional with the metrology boundary unresolved. No roles are assigned.
- D099-D112: source research must decide whether proposed areas are distinct, correctly inside their parent, and plain-language; ISCO buckets and current role counts are not specialization evidence.
- D099-D112 source-screen: `data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D099_D112_specialization_source_triage_001.md` records all 14 candidate boundaries and identifies the eight domains whose evidence must be strengthened before final disposition.
- Geography: use global/international evidence where available; explicitly mark country-specific standards as corroboration, not global requirements.
- Tests: `python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/test_d085_d112_specialization_checkpoint_001.py data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/test_d098_shared_projection_reconciliation_001.py`.

Checkpoint only; no shared register, canonical specialization/subgroup data, role library, subgroup scripts/reports, or role-to-domain mapping was edited.
