# D099–D112 source-gap supplement 002

Date: 2026-10-05. This continues the source triage in `D099_D112_specialization_source_triage_001.md`; it does not repeat the whole lane or change canonical data.

## Scope and outcome

The previous triage identified eight source gaps: D101, D104, D105, D107, D109, D110, D111 and D112. Each was rechecked against primary, intergovernmental, standards-body, or occupational-standard evidence. All eight now have added authoritative evidence and an explicit boundary disposition. This closes the *source-discovery gap* for this pass; it does not mean that all eight area counts are universally standardized or that all candidate areas are approved as canonical subgroups.

| Domain | Current evidence-based disposition | What must not be inferred |
|---|---|---|
| D101 Painting, Decorating and Surface Treatment | Building/decorative finishes and industrial protective coatings are distinct practice families. Protective coatings fit the current “surface treatment” wording, subject to parent-scope confirmation. | AMPP credentials are not universal requirements; metal production/finishing does not become D101 merely because a coating is involved. |
| D104 Pottery, Ceramics and Glasswork | Pottery/ceramic making and glass manufacture are distinct material practices. Craft and industrial plant operation remain separate contexts. | Occupational groupings and professional-society courses do not prescribe a universal student-facing count. |
| D105 Handicrafts, Basketry and Textile Crafts | Textile/fibre crafts and basketry/plant-fibre crafts are defensible material families. | UNCTAD explicitly warns that craft-product boundaries can be subjective; “other crafts” is not admitted without parent evidence. |
| D107 Leatherworking, Shoemaking and Leather Goods | Footwear has an approved occupational standard in England and is independently distinguishable from tanning/leather processing in ISCO task groups. Three output families remain a provisional synthesis. | The English standard is not a global legal/credential requirement; footwear work is not automatically raw-leather processing. |
| D109 Metal Processing, Foundry and Casting Operations | Casting/moulding and metal-plant processing are supported practice families. | The ILO model is regional; a three-area count and separate primary-processing/forming/finishing cards are not yet established. Welding/fabrication is not imported. |
| D110 Chemical, Rubber and Plastics Plant Operations | Chemical process-plant tasks and polymer/rubber/plastics processing are materially distinguishable. | ISCO and Australia’s training package are not a universal specialization prescription; lab chemistry and chemical-engineering design remain out of scope. |
| D111 Textile and Garment Machine Operations | ISO textile-machinery scope supports spinning, fabric formation, and dyeing/finishing process families. Garment-machine production remains a parent-boundary candidate. | ISO machinery committees and a UK occupational standard do not define a global learner taxonomy; D105 handcraft and D106 design/patternmaking remain distinct. |
| D112 Wood, Pulp and Paper Processing | Industrial wood processing and pulp/papermaking are distinct process families; TAPPI documents machine-tender learning. | Paper converting/finishing is not a separate area without a distinct route; joinery/furniture remains D102. |

Full locators, claim limits and URLs are in `D099_D112_source_gap_supplement_002.json`.

## Cross-lane verification

- Shared-register projection: checkpoint 019 records 20/20 missing D057–D084 projections prepared in a collision-safe, lane-owned package; four source-ID/locator/claim collisions are namespaced rather than merged. No shared-register or canonical write was made; there are zero unresolved projection collisions in that package.
- Computational scan: the existing disposition file classifies all 73 method/task-signal domains as 21 with direct-domain/existing-layer evidence, 10 already-declared layers with role-task-only signals, and 42 role-task-only optional-method cases. This is not role-to-domain sign-off. Four task-signal role titles still have no exact local role-title match.
- D085–D097: the checkpoint identifies 13 existing source-reviewed register records to reuse after provenance checks; do not treat the area count as externally mandated.
- D098: material conflict remains between the register’s three areas (including Horology) and the lane’s four candidates (including separate metrology). Keep both records; resolve only after evaluating the parent scope and metrology’s learner-path independence.
- D099–D112: 14/14 screened; the eight previously open source sets now have additional authoritative evidence. Their count/parent-boundary questions remain explicit, not silently “closed” by source existence.
- No role-to-specialization assignment, role-domain decision, shared-register update, or canonical taxonomy edit was made.

## Validation

Run:

```powershell
python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/test_d099_d112_source_gap_supplement_002.py data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/test_d057_d084_register_projection_checkpoint_019.py data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/test_d085_d112_specialization_checkpoint_001.py data/career-mapping/_audit/test_computational_domain_coverage_reconciliation_2026_10_05.py data/career-mapping/_audit/test_computational_coverage_checkpoint_2026_10_05.py data/career-mapping/_audit/test_computational_method_signal_domain_dispositions_2026_10_05.py
```

The first supplement test validates the exact eight-domain queue, evidence completeness, claim-limit fields, and no-canonical-write boundary. Existing checkpoint tests validate their respective generated artifacts.

**Run result:** 20 passed in 1.98s across the supplement, D057–D084 projection, D085–D112 coverage, and computational-disposition/checkpoint tests.
