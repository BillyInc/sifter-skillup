# Global specialization exception reconciliation — 2026-10-06

Global-only audit. This reconciles conflicting review recommendations; it does not edit canonical taxonomy or constitute external academic sign-off.

## Exact coverage and findings

- Catalogue: 168 domains.
- Review-artifact presence: 168/168 domains (presence is not correctness).
- Structured candidate-list conflicts: **7 domains** — D098, D118, D119, D120, D121, D122, D123.
- Domains with an explicit open/provisional/residual review status or dedicated residual field: **97/168**. This is a review queue, not confirmed errors.
- Domains with a no-universal/global-set recommendation are recorded separately: **4**.
- The candidate-list scan found no other conflicting candidate arrays among the paths listed by the current 168-domain coverage manifest.
- This finding is not a claim that undisputed proposals are academically approved, source-complete or canonical.

## Disputed domains and reconciled recommendation

### D098

Competing recorded candidate sets:

- `data/career-mapping/_audit/domain_specialization_review_2026_10_03.json` (source_reviewed_specialization_set_recommended): Precision Machining and Toolmaking; Precision Instruments, Optics and Metrology; Horology (Clock and Watchmaking).
- `data/career-mapping/_audit/specialization_lanes_2026_10_05/D001_D112_GLOBAL_RECONCILIATION/D098_global_specialization_reconciliation.json` (reconciled_recommendation_pending_shared_register_and_canonical_adoption): Precision Machining and Toolmaking; Precision Instruments and Optical Devices; Dimensional Metrology and Measurement Systems; Horology (Clock and Watchmaking).
- `data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/d098_shared_projection_reconciliation_001.json` (source_reviewed_candidate_set_recommended_scope_boundary_open): Precision Machining and Component Manufacturing; Tool, Die and Mould Making; Precision Instruments and Optical Devices; Dimensional Metrology and Measurement Systems.

**Reconciliation:** four_area_internal_recommendation; metrology_card_boundary_remains_open.

Recommended candidate areas:

- Precision Machining and Toolmaking
- Precision Instruments and Optical Devices
- Dimensional Metrology and Measurement Systems
- Horology (Clock and Watchmaking)

**Parent-domain fit:** All four are technical practice/learning areas within the stated precision-components-and-instruments scope; generic product inspection is excluded. The broad inspector role boundary remains separate.

**Boundary for each candidate:**

- **Precision Machining and Toolmaking:** Precision part/component manufacture plus production tooling; keep machine types nested.
- **Precision Instruments and Optical Devices:** Precision measuring and optical device design, assembly, testing, calibration or repair.
- **Dimensional Metrology and Measurement Systems:** Measurement systems, calibration, uncertainty and traceability; not generic inspection/QA.
- **Horology (Clock and Watchmaking):** Timepiece making, servicing and repair, explicitly named in the parent description.

**Still open:**

- Whether dimensional metrology warrants its own learner-facing card rather than being a shared method across the other three routes.

**Evidence used / limits:**

- [WorldSkills International — WorldSkills Occupational Standards: CNC Turning (2024)](https://worldskills.org/what/projects/wsos/2024/events/579/skills/1658/) (Occupation description and skill standard): International benchmark for precision turning tasks and process control. Limit: Competition occupational standard; not a universal learner taxonomy.
- [WorldSkills International — WorldSkills Occupational Standards: CNC Milling (2024)](https://worldskills.org/what/projects/wsos/2024/events/579/skills/1661/) (Occupation description and skill standard): International benchmark for precision milling, drawings and dimensional verification. Limit: Competition occupational standard; not a universal learner taxonomy.
- [US National Institute of Standards and Technology — Dimensional Metrology Group](https://www.nist.gov/pml/sensor-science/dimensional-metrology) (Programme description): Metrology is a distinct technical practice supporting measurement traceability and precision manufacturing. Limit: US national institute; does not set a global career taxonomy.
- [University of Tokyo — Precision Engineering curriculum](https://www.pe.t.u-tokyo.ac.jp/en/curriculum.html) (Published curriculum): Comparative evidence for precision engineering and measurement education. Limit: Institution-specific curriculum; corroborative only.

### D118

Competing recorded candidate sets:

- `data/career-mapping/_audit/domain_specialization_review_2026_10_03.json` (source_reviewed_specialization_set_recommended): Crop Production; Crop Protection; Horticulture and Landscape Management.
- `data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D113_D118_reviews_checkpoint_001.json` (source_reviewed_candidate_set_label_refinement_needed): Crop Production; Crop Protection and Plant Health; Horticultural Production.

**Reconciliation:** three_area_internal_recommendation; refine_names_and_narrow_landscape_claim.

Recommended candidate areas:

- Crop Production
- Crop Protection and Plant Health
- Horticultural and Nursery Production

**Parent-domain fit:** Crop growing, plant protection, horticulture and nursery production fit the root description. Landscape design/contracting is not established by the current parent scope and is excluded from the label.

**Boundary for each candidate:**

- **Crop Production:** Food and field crop cultivation and production systems.
- **Crop Protection and Plant Health:** Cross-crop pest, disease, plant-health and phytosanitary practice.
- **Horticultural and Nursery Production:** Fruit, vegetable, garden-plant and nursery production; exclude landscape-service management unless parent scope expands.

**Evidence used / limits:**

- [Food and Agriculture Organization of the United Nations — AGRIS/CARIS Categorization Scheme](https://www.fao.org/4/u1808e/U1808E01.htm) (F. Plant Science and Production; F01 Crop husbandry): Separates crop husbandry, horticulture/gardening and plant protection subject areas. Limit: Subject classification, not a required student subgroup count.
- [International Plant Protection Convention — About the IPPC](https://www.ippc.int/en/about/) (Convention purpose and phytosanitary framework): Plant-health and phytosanitary protection are distinct cross-crop functions. Limit: International treaty framework; not a curriculum taxonomy.
- [Food and Agriculture Organization of the United Nations — Introduction to horticulture](https://www.fao.org/4/x5642e/x5642e05.htm) (Horticulture structure table): Distinguishes crop-production horticulture from amenity horticulture and landscaping. Limit: Technical teaching text; does not establish Sifter's exact subgroup boundaries.

### D119

Competing recorded candidate sets:

- `data/career-mapping/_audit/domain_specialization_review_2026_10_03.json` (source_reviewed_specialization_set_recommended): Poultry Production; Ruminant and Dairy Production; Pig and Rabbit Production; Equine Production and Management; Apiculture and Insect Production.
- `data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D119_D124_reviews_checkpoint_002.json` (source_reviewed_candidate_set_with_conditional_area): Poultry Production; Ruminant Livestock and Dairy Production; Pig and Rabbit Production; Equine Production and Management; Apiculture and Insect Production.

**Reconciliation:** five_area_internal_recommendation; correct_ruminant_label_and_limit_bee_scope.

Recommended candidate areas:

- Poultry Production
- Ruminant Livestock and Dairy Production
- Pig and Rabbit Production
- Equine Production and Management
- Apiculture (Beekeeping)

**Parent-domain fit:** The parent description explicitly includes cattle, poultry, sheep, horses, bees and dairies. Keep dairy animal production distinct from dairy processing; do not broaden beekeeping to all insect farming without evidence.

**Boundary for each candidate:**

- **Poultry Production:** Poultry species and production systems.
- **Ruminant Livestock and Dairy Production:** Cattle, sheep/goats and dairy-animal husbandry; exclude dairy processing.
- **Pig and Rabbit Production:** Pig and rabbit production and husbandry.
- **Equine Production and Management:** Equine breeding and animal management.
- **Apiculture (Beekeeping):** Bee keeping and hive/colony production; do not imply all insect farming.

**Evidence used / limits:**

- [Food and Agriculture Organization of the United Nations — Global Farmer Field School Platform: Livestock](https://www.fao.org/farmer-field-schools/themes/livestock/en) (Livestock production-system themes): Recognizes poultry, dairy, pigs, rabbits, equine and beekeeping systems. Limit: Practice overview; not a global specialization taxonomy.
- [Food and Agriculture Organization of the United Nations — Global livestock production systems](https://www.fao.org/4/i2414e/i2414e.pdf) (Global production-system typology): Supports distinct animal production systems including cattle, small ruminants, pigs and chickens. Limit: Production typology; does not prescribe subgroup counts.
- [World Organisation for Animal Health — Terrestrial Animal Health Code](https://www.woah.org/fileadmin/Home/eng/Health_standards/tahc/2021/en_index.htm) (Species/system chapters): Recognizes species- and production-system-specific animal-health contexts. Limit: Animal-health standards, not a learner taxonomy.

### D120

Competing recorded candidate sets:

- `data/career-mapping/_audit/domain_specialization_review_2026_10_03.json` (source_reviewed_specialization_set_recommended): Aquaculture Production and Systems; Fisheries Management and Aquatic Resource Science; Fish Nutrition and Feed Technology; Fish Health and Pathology; Post-harvest Processing and Product Utilization; Fisheries Economics and Extension.
- `data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D119_D124_reviews_checkpoint_002.json` (source_reviewed_refined_candidate_set_parent_boundary_open): Aquaculture Production and Systems; Fisheries and Aquatic-Resource Management; Aquatic Animal Health and Biosecurity; Fisheries Post-harvest and Value Chains.

**Reconciliation:** three_area_internal_recommendation; remove_postharvest_from_this_parent.

Recommended candidate areas:

- Aquaculture Production and Systems
- Capture Fisheries and Aquatic-Resource Management
- Aquatic Animal Health and Biosecurity

**Parent-domain fit:** The checked parent description covers capture fisheries, aquatic-stock farming, hatcheries, fish health and harvest. Post-harvest processing/value chains are important adjacent work but fall outside this stated parent boundary; extension, economics, feed and nutrition remain topics unless distinct routes are established.

**Boundary for each candidate:**

- **Aquaculture Production and Systems:** Farmed aquatic stock, hatchery/rearing systems and production operations.
- **Capture Fisheries and Aquatic-Resource Management:** Wild capture, fisheries governance, stocks, ecosystems and aquatic-resource stewardship.
- **Aquatic Animal Health and Biosecurity:** Disease prevention, surveillance, aquatic veterinary/diagnostic practice and biosecurity across production contexts.

**Evidence used / limits:**

- [Food and Agriculture Organization of the United Nations — Code of Conduct for Responsible Fisheries](https://www.fao.org/4/v9878e/v9878e00.htm) (Articles 7, 9 and 12): Differentiates fisheries management, aquaculture development and fisheries research. Limit: International policy framework, not specialization count evidence.
- [Food and Agriculture Organization of the United Nations — FISH4ACP: Developing sustainable aquatic value chains](https://www.fao.org/sustainable-food-value-chains/library/detalles/es/c/1759733/) (Guide scope and value-chain methodology): Establishes post-harvest/value-chain practice as a distinct aquatic-food sector stage. Limit: Evidence that it is an adjacent practice; current D120 parent scope does not include processing.
- [World Organisation for Animal Health — Aquatic animals and health standards](https://www.woah.org/en/what-we-do/animal-health-and-welfare/aquatic-animals/) (Aquatic animal health and standards overview): Supports aquatic animal health, biosecurity and disease surveillance as substantive practice. Limit: Health standard scope; not a learner taxonomy.

### D121

Competing recorded candidate sets:

- `data/career-mapping/_audit/domain_specialization_review_2026_10_03.json` (source_reviewed_specialization_set_recommended): Forest Ecology, Wildlife and Conservation; Silviculture, Regeneration and Forest Restoration; Forest Management, Inventory and Planning; Forest Operations and Engineering; Forest Products and Utilization.
- `data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D119_D124_reviews_checkpoint_002.json` (source_reviewed_candidate_set_parent_scope_open): Forest Ecology, Silviculture and Regeneration; Forest Management, Inventory and Planning; Forest Operations and Products; Wildlife Ecology and Conservation Management.

**Reconciliation:** five_area_internal_recommendation; separate_forest_operations_from_products.

Recommended candidate areas:

- Forest Ecology, Wildlife and Conservation
- Silviculture, Regeneration and Restoration
- Forest Management, Inventory and Planning
- Forest Operations and Engineering
- Forest Products and Utilization

**Parent-domain fit:** The parent explicitly combines forestry and wildlife. The synthesis preserves their shared ecology/conservation foundation, while separating silvicultural treatment, planning/inventory, field operations/engineering and product utilization because these have distinct learning outputs.

**Boundary for each candidate:**

- **Forest Ecology, Wildlife and Conservation:** Forest/wildlife ecology, biodiversity and conservation foundations; whether wildlife warrants its own route remains open.
- **Silviculture, Regeneration and Restoration:** Stand establishment, regeneration, silvicultural treatment and restoration.
- **Forest Management, Inventory and Planning:** Forest resource measurement, inventory, management planning and allocation.
- **Forest Operations and Engineering:** Forest engineering, harvesting, access and field operations.
- **Forest Products and Utilization:** Wood/non-wood forest product processing, properties, preservation and utilization.

**Still open:**

- The five-area count is an internal minimum synthesis, not a universal forestry specialization standard; verify whether wildlife warrants a stand-alone route after role-task boundary work.

**Evidence used / limits:**

- [Food and Agriculture Organization of the United Nations — Forestry Curriculum Development and Revision](https://www.fao.org/4/y1842e/y1842e22.htm) (Annex V and Annex VIII course/subject headings): Separately identifies forest/wildlife ecology, silviculture, management planning/inventory, forest engineering and utilization of forest products. Limit: Reference curricula with regional examples; supports distinctions, not universal counts.
- [Food and Agriculture Organization of the United Nations — Forestry education: new trends and prospects](https://www.fao.org/4/ap438e/ap438e00.pdf) (Curriculum modules and specializations): Comparative curricula distinguish silviculture, inventory, operations/products, wildlife and policy themes. Limit: Comparative curriculum report, not accreditation standard.
- [Food and Agriculture Organization of the United Nations — Silviculture in natural forests](https://www.fao.org/sustainable-forest-management-toolbox/modules/silviculture-in-natural-forests/en) (Module definitions and practice scope): Defines silviculture/regeneration and its distinct forest-management practice. Limit: Technical practice guidance; not a subgroup count standard.

### D122

Competing recorded candidate sets:

- `data/career-mapping/_audit/domain_specialization_review_2026_10_03.json` (source_reviewed_specialization_set_recommended): Clinical Chemistry and Chemical Pathology; Haematology and Transfusion Science; Medical Microbiology and Parasitology; Histopathology and Cytology; Immunology and Serology; Molecular Diagnostics and Genetics.
- `data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D119_D124_reviews_checkpoint_002.json` (source_reviewed_candidate_set_and_root_label_refinement): Clinical Chemistry, Endocrinology and Toxicology; Hematology, Hemostasis and Transfusion Science; Clinical Microbiology and Immunology; Histology, Cytology and Anatomic Pathology Laboratory Science; Molecular Diagnostics and Medical Genetics.

**Reconciliation:** six_area_internal_recommendation; retain_immunology_as_distinct_candidate.

Recommended candidate areas:

- Clinical Chemistry, Endocrinology and Toxicology
- Hematology, Hemostasis and Transfusion Science
- Medical Microbiology and Infectious Disease Diagnostics
- Immunology and Serology
- Histopathology and Cytology
- Molecular Diagnostics and Medical Genetics

**Parent-domain fit:** All candidates are laboratory diagnostic disciplines within the medical-laboratory parent. Do not infer identical scope of practice or authorization across jurisdictions.

**Boundary for each candidate:**

- **Clinical Chemistry, Endocrinology and Toxicology:** Clinical chemistry testing, including endocrine/toxicology assays where the laboratory route shares this base.
- **Hematology, Hemostasis and Transfusion Science:** Blood-cell/coagulation testing, hematologic disorders and transfusion services.
- **Medical Microbiology and Infectious Disease Diagnostics:** Microbial, parasitic and infectious-disease testing and identification.
- **Immunology and Serology:** Immune-function and serologic testing; kept separate from microbiology pending cross-region route comparison.
- **Histopathology and Cytology:** Tissue/cell morphology, histopathology and cytology.
- **Molecular Diagnostics and Medical Genetics:** Nucleic-acid and molecular diagnostic methods plus medical genetics.

**Still open:**

- IFBLS provides global core competencies but does not prescribe specialty-card counts; six is a learner-facing synthesis. Immunology's distinct route should be checked against cross-region programme curricula before external sign-off.

**Evidence used / limits:**

- [International Federation of Biomedical Laboratory Science — IFBLS Guidelines for Core Competence](https://www.ifbls.org/images/IFBLS-Core-Competence---revised-2022.pdf) (Core competence scope and limits): Global professional framework for biomedical laboratory scientists and laboratory diagnostic-service competence. Limit: Explicitly non-prescriptive about tests, roles and functions; does not set specialty counts.
- [American Society for Clinical Laboratory Science — Scope of Practice and Personnel Standards](https://ascls.org/scope-of-practice/) (Discipline-specific expertise list): Names microbiology, hematology, immunology, transfusion medicine, clinical chemistry, toxicology, cytology, histology and molecular diagnostics as distinct expertise areas. Limit: US professional source; regional corroboration only.
- [American Society for Clinical Laboratory Science — Doctor of Clinical Laboratory Science Body of Knowledge](https://ascls.org/wp-content/uploads/2022/08/DCLS_BOK_ADOPTED_20220630.pdf) (Advanced clinical laboratory science chapters): Separately treats chemistry, hematopathology/hemostasis, immunology, microbiology, molecular diagnostics/genetics and transfusion services. Limit: US professional body of knowledge; corroboration, not global standard.

### D123

Competing recorded candidate sets:

- `data/career-mapping/_audit/domain_specialization_review_2026_10_03.json` (source_reviewed_specialization_set_recommended): General Diagnostic Radiography and Fluoroscopy; Computed Tomography (CT); Magnetic Resonance Imaging (MRI); Medical Ultrasound; Nuclear Medicine Imaging; Mammography and Breast Imaging.
- `data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D119_D124_reviews_checkpoint_002.json` (source_reviewed_candidate_set_root_boundary_open): Diagnostic Radiography and Fluoroscopy; Computed Tomography (CT); Magnetic Resonance Imaging (MRI); Medical Ultrasound; Nuclear Medicine Imaging; Mammography and Breast Imaging.

**Reconciliation:** six_diagnostic_imaging_areas; radiation_therapy_parent_scope_conflict_open.

Recommended candidate areas:

- Diagnostic Radiography and Fluoroscopy
- Computed Tomography (CT)
- Magnetic Resonance Imaging (MRI)
- Medical Ultrasound
- Nuclear Medicine Imaging
- Mammography and Breast Imaging

**Parent-domain fit:** These six are diagnostic-imaging routes. Radiotherapy/dosimetry is therapeutic, not an imaging specialization; the current domain description includes radiation treatment and therefore needs a separate parent-scope reconciliation before canonical mapping.

**Boundary for each candidate:**

- **Diagnostic Radiography and Fluoroscopy:** Projection radiography and fluoroscopic diagnostic/interventional imaging.
- **Computed Tomography (CT):** Cross-sectional X-ray computed imaging.
- **Magnetic Resonance Imaging (MRI):** Magnetic-resonance diagnostic imaging.
- **Medical Ultrasound:** Diagnostic sonography/ultrasound imaging.
- **Nuclear Medicine Imaging:** Radionuclide diagnostic imaging; not therapeutic radiopharmaceutical treatment as a generic imaging task.
- **Mammography and Breast Imaging:** Breast imaging and mammography; potentially nested under broader diagnostic imaging in some systems.

**Still open:**

- Current parent description combines diagnostic imaging with radiation therapy; do not force radiotherapy into one of the six imaging specializations.

**Evidence used / limits:**

- [International Atomic Energy Agency — Postgraduate Educational Course in Radiation Protection and the Safety of Radiation Sources](https://www-pub.iaea.org/MTCD/publications/PDF/TCS-56_%28Rev.1%29web.pdf) (Medical imaging curriculum topics): Separates radiography, mammography, CT, fluoroscopy, ultrasound, MRI, nuclear medicine and therapeutic applications in training content. Limit: International technical training publication; not a universal specialization taxonomy.
- [American Society of Radiologic Technologists — Practice Standards for Medical Imaging and Radiation Therapy](https://www.asrt.org/main/standards-and-regulations/professional-practice/practice-standards-online) (Profession definition and discipline-specific standards): Distinguishes radiography, CT, MRI, mammography, nuclear medicine, sonography and radiation therapy. Limit: US professional standard; corroboration only.
- [World Health Organization and International Atomic Energy Agency — Radiation Protection and Safety in Medical Uses of Ionizing Radiation](https://www.who.int/publications/m/item/radiation-protection-and-safety-in-medical-uses-of-ionizing-radiation) (Scope of medical uses): Distinguishes diagnostic radiological procedures from therapeutic radiation uses. Limit: Safety guidance, not a career taxonomy.

## Additional open-domain reconciliation

### D003 — Artificial Intelligence and Machine Learning

**Disposition:** candidate_set_reconciled_as_internal_synthesis; parent_scope_alignment_remains_a_prepublication_gate.

**Candidate set (5):** Machine Learning and Generative Models; Knowledge, Reasoning and Planning; Natural Language and Speech AI; Computer Vision and Perception; Intelligent Agents and Robotics.

**Parent fit:** The five proposed areas are within broad AI practice and each is corroborated by the joint CS2023 AI knowledge area and AAAI technical topics. The present parent description is materially narrower (learning, images, language and prediction) and omits knowledge representation/reasoning, planning, agents and robotics.

**Count / boundary:** Five is a compact internal display synthesis, not a count prescribed by either source. Cross-cutting ethics, generative model families and application sectors should not become separate top-level cards on this evidence alone.

**Remaining gate:** Broaden/reconcile the parent-domain definition before later canonical publication. No role-to-specialization assignments are made in this reconciliation.

**Evidence:**

- [ACM, IEEE Computer Society, and Association for the Advancement of Artificial Intelligence — Computer Science Curricula 2023: AI Knowledge Area](https://csed.acm.org/wp-content/uploads/2023/09/Version-Gamma.pdf) (AI Knowledge Area; knowledge units include machine learning, knowledge representation and reasoning, planning, agents, NLP, robotics, perception and computer vision): Joint curriculum guidance recognizes the breadth of AI knowledge areas relevant to the D003 candidate set. Limit: Computing curriculum guidance, not a formal subgroup taxonomy, licensure rule, role map or prescribed five-area count.
- [Association for the Advancement of Artificial Intelligence — AAAI-26 Main Technical Track and Keywords](https://aaai.org/conference/aaai/aaai-26/keywords/) (Submission groups and keywords for ML, NLP, computer vision, robotics, knowledge representation, multiagent systems, planning and reasoning): Independent AI research-community taxonomy corroborates the candidate areas and that these fields coexist as AI technical areas. Limit: Conference submission taxonomy is not a curriculum/accreditation standard and does not set the product's card count or learner-route boundaries.

## Existing unresolved/provisional cases retained

These were already documented and are not new candidate-list conflicts. They remain open for the reasons shown; the global phase must not treat a written recommendation as canonical approval.

- **D053–D056:** locally owned review slice. This lane only reads its current grouped record for catalogue accounting; the local reviewer owns candidate labels, counts and boundary decisions, and those artifacts were not edited here.
- **D057, D058, D060, D062–D066:** eight previously identified provisional decisions:
  - D057 (3 candidates): Keep flat for now; retain three possible learner routes only as candidates. Open: No approved subgroup set; validate distinct learning routes before adding cards.
  - D058 (0 candidates): Keep flat. Open: The reviewed global frameworks describe the field but do not establish a complete specialization set for this combined parent.
  - D060 (3 candidates): Three internal candidate areas. Open: Exact count is not internationally prescribed; retain as an internal synthesis.
  - D062 (2 candidates): Two internal candidate areas after narrowing the parent boundary. Open: Asset classes and trading styles stay nested themes, not top-level groups.
  - D063 (6 candidates): Six internal candidate areas. Open: JEL classification categories are source evidence, not subgroup counts.
  - D064 (8 candidates): Eight broad candidate areas. Open: Not exhaustive; cross-region titles and scope variations remain.
  - D065 (6 candidates): Six internal candidate areas. Open: Service modes and language/content sectors remain nested unless a distinct learning route is substantiated.
  - D066 (8 candidates): Eight internal candidate areas. Open: WOAH does not prescribe one global veterinary curriculum or specialization count.
- **D053–D056:** exact labels/counts are maintained by the local owner; see that review artifact rather than duplicating potentially changing values here.
- **D098:** four-area recommendation, but standalone metrology remains an explicit boundary question.
- **D121:** five-area synthesis remains internal; whether wildlife needs a separate learning route remains open.
- **D122:** six-area synthesis is internal; IFBLS supplies global core competence, not a prescribed specialty count; compare cross-region curricula before external sign-off.
- **D123:** radiotherapy is outside the six diagnostic-imaging areas, while the current parent description still includes it. Parent scope requires a separate resolution.

## Catalogue-wide explicit residual queue

The seven candidate-list conflicts above are not the entire unfinished audit. This structured queue reports the best current per-domain review status and any dedicated residual fields across the 168 IDs. A status such as ‘provisional’ means the recommendation is not treated as final; it does not mean the currently stored taxonomy has been changed.

- **parent scope title or boundary:** 73 domains — D003, D023, D024, D027, D031, D032, D033, D038, D039, D040, D041, D042, D043, D044, D047, D048, D049, D050, D051, D052, D053, D054, D055, D056, D058, D062, D063, D064, D065, D069, D070, D071, D072, D073, D074, D075, D076, D077, D079, D080, D081, D082, D083, D098, D101, D104, D105, D107, D109, D110, D111, D112, D113, D116, D121, D122, D123, D124, D125, D128, D132, D133, D137, D139, D148, D150, D151, D153, D155, D157, D161, D163, D164.
- **role or cross domain reconciliation dependency:** 11 domains — D025, D026, D028, D029, D030, D034, D035, D036, D037, D066, D144.
- **candidate count source or route validation:** 13 domains — D057, D060, D078, D084, D099, D100, D102, D103, D106, D108, D131, D140, D142.

- **D003** — `source_reviewed_candidate_set_recommended_scope_alignment_pending` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D003_specialization_review.json).
- **D023** — `parent_scope_reconciliation_required_before_specialization_count` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D023_specialization_review.json).
- **D024** — `parent_scope_reconciliation_required_before_specialization_count` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D024_specialization_review.json).
- **D025** — `source_reviewed_candidate_set_recommended_pending_role_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D025_specialization_review.json).
- **D026** — `source_reviewed_candidate_set_recommended_pending_role_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D026_specialization_review.json).
- **D027** — `source_reviewed_provisional_candidate_set_recommended_pending_parent_scope_and_role_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D027_specialization_review.json).
- **D028** — `source_reviewed_provisional_candidate_set_recommended_pending_role_and_cross_domain_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D028_specialization_review.json).
- **D029** — `source_reviewed_candidate_set_recommended_pending_catalogue_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D029_specialization_review.json).
- **D030** — `source_reviewed_candidate_set_recommended_pending_catalogue_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D030_specialization_review.json).
- **D031** — `source_reviewed_candidate_set_recommended_pending_parent_domain_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D031_specialization_review.json).
- **D032** — `source_reviewed_candidate_set_recommended_pending_parent_domain_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D032_specialization_review.json).
- **D033** — `source_reviewed_candidate_set_recommended_pending_parent_domain_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D033_specialization_review.json).
- **D034** — `source_reviewed_candidate_set_recommended_pending_catalogue_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D034_specialization_review.json).
- **D035** — `source_reviewed_candidate_set_recommended_pending_catalogue_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D035_specialization_review.json).
- **D036** — `source_reviewed_candidate_set_recommended_pending_catalogue_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D036_specialization_review.json).
- **D037** — `source_reviewed_provisional_candidate_families_pending_role_catalogue_rebuild` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D037_specialization_review.json).
- **D038** — `source_reviewed_provisional_candidate_set_pending_role_catalogue_rebuild_and_parent_scope_review` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D038_specialization_review.json).
- **D039** — `source_reviewed_provisional_candidate_set_pending_role_catalogue_rebuild_and_scope_correction` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D039_specialization_review.json).
- **D040** — `source_reviewed_provisional_candidate_set_pending_role_catalogue_rebuild_and_scope_correction` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D040_specialization_review.json).
- **D041** — `source_reviewed_parent_scope_and_current_groups_fail_specialization_test_candidate_fields_require_catalogue_boundary_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D041_specialization_review.json).
- **D042** — `source_reviewed_parent_scope_split_recommended_candidate_areas_provisional` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D042_specialization_review.json).
- **D043** — `source_reviewed_current_subgroup_rejected_parent_boundary_refinement_recommended` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D043_specialization_review.json).
- **D044** — `source_reviewed_current_subgroups_mixed_parent_scope_refinement_recommended` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D044_specialization_review.json).
- **D047** — `source_reviewed_scope_overlap_and_subgroup_structure_mixed_candidate_reframe` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D047_specialization_review.json).
- **D048** — `source_reviewed_scope_title_mismatch_and_subgroups_occupation_buckets_candidate_reframe` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D048_specialization_review.json).
- **D049** — `source_reviewed_scope_mismatch_and_stale_isco_subgroups_candidate_reframe` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D049_specialization_review.json).
- **D050** — `source_reviewed_scope_mismatch_and_stale_isco_subgroups_candidate_reframe` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D050_specialization_review.json).
- **D051** — `source_reviewed_isco_subgroups_not_specializations_scope_and_parent_fit_need_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D051_specialization_review.json).
- **D052** — `source_reviewed_parent_scope_mixes_management_engineering_and_trades_candidate_reframe` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D052_specialization_review.json).
- **D053** — `source_reviewed_provisional_candidate_sets_parent_and_role_reconciliation_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D053_D056_global_specialization_review_2026_10_06.json).
  - remaining_review: retain_four_area_global_recommendation; keep role-path activation pending independent domain-role audit and final global-plus-Nigerian reconciliation
- **D054** — `source_reviewed_provisional_candidate_sets_parent_and_role_reconciliation_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D053_D056_global_specialization_review_2026_10_06.json).
  - remaining_review: retain_seven_area_global_recommendation; keep role-path activation pending independent domain-role audit and final global-plus-Nigerian reconciliation
- **D055** — `source_reviewed_provisional_candidate_sets_parent_and_role_reconciliation_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D053_D056_global_specialization_review_2026_10_06.json).
  - remaining_review: test_nine_candidate_boundaries_for_unnecessary_splits_and_shared_foundation; keep role-path activation pending independent domain-role audit and global-plus-Nigerian reconciliation
- **D056** — `source_reviewed_provisional_candidate_sets_parent_and_role_reconciliation_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084/D053_D056_global_specialization_review_2026_10_06.json).
  - remaining_review: review_each_exact_role_task_against_candidate_boundaries_before_accepting_any_link
- **D057** — `source_reviewed_provisional_candidate_set` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D057_specialization_review.json).
- **D058** — `source_reviewed_provisional_set_and_parent_boundary` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D058_specialization_review.json).
- **D060** — `provisional_source_reviewed` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D060_specialization_review.json).
- **D062** — `provisional_candidate_set_recommended_parent_scope_boundary_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D062_specialization_review.json).
- **D063** — `provisional_candidate_set_recommended_set_granularity_and_parent_boundaries_need_catalogue_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D063_specialization_review.json).
- **D064** — `provisional_candidate_set_recommended_cross_region_title_and_scope_variation_remains` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D064_specialization_review.json).
- **D065** — `provisional_candidate_set_recommended_specialization_scope_and_count_need_catalogue_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D065_specialization_review.json).
- **D066** — `provisional_candidate_set_recommended_count_and_cross_domain_ownership_need_catalogue_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D066_specialization_review.json).
- **D069** — `provisional_candidate_set_recommended_parent_scope_and_computational_boundary_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D069_specialization_review.json).
- **D070** — `provisional_candidate_set_recommended_recorded_performance_boundary_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D070_specialization_review.json).
- **D071** — `provisional_candidate_set_recommended_parent_scope_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D071_specialization_review.json).
- **D072** — `provisional_candidate_set_recommended_parent_scope_and_count_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D072_specialization_review.json).
- **D073** — `provisional_candidate_set_recommended_parent_scope_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D073_specialization_review.json).
- **D074** — `provisional_candidate_set_recommended_jurisdiction_and_scope_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D074_specialization_review.json).
- **D075** — `provisional_candidate_set_recommended_scope_and_count_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D075_specialization_review.json).
- **D076** — `provisional_parent_scope_split_recommended` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D076_specialization_review.json).
- **D077** — `provisional_parent_scope_split_recommended` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D077_specialization_review.json).
- **D078** — `provisional_candidate_set_recommended_computational_crosscutting` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D078_specialization_review.json).
- **D079** — `provisional_three_area_synthesis_parent_boundary_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D079_specialization_review.json).
- **D080** — `provisional_parent_scope_split_recommended` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D080_specialization_review.json).
- **D081** — `provisional_four_area_synthesis_scope_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D081_specialization_review.json).
- **D082** — `provisional_core_areas_parent_scope_split_recommended` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D082_specialization_review.json).
- **D083** — `provisional_four_area_synthesis_parent_scope_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D083_specialization_review.json).
- **D084** — `provisional_two_area_synthesis_jurisdiction_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/D084_specialization_review.json).
- **D098** — `source_reviewed_candidate_set_recommended_scope_boundary_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D093_D168/D098_specialization_review.json).
- **D099** — `candidate_set_reviewed_with_explicit_residuals` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D099_specialization_candidate_review_2026_10_05.json).
  - remaining_review: Validate this candidate set against additional curriculum/professional evidence and the final parent-domain definition before any canonical implementation; preserve jurisdiction-specific regulation labels.
- **D100** — `candidate_set_reviewed_with_explicit_residuals` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D100_specialization_candidate_review_2026_10_05.json).
  - remaining_review: Validate this candidate set against additional curriculum/professional evidence and the final parent-domain definition before any canonical implementation; preserve jurisdiction-specific regulation labels.
- **D101** — `source_gap_closed_candidate_boundary_or_count_remains_provisional` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D101_specialization_candidate_review_2026_10_05.json).
  - remaining_review: Validate this candidate set against additional curriculum/professional evidence and the final parent-domain definition before any canonical implementation; preserve jurisdiction-specific regulation labels.
- **D102** — `candidate_set_reviewed_with_explicit_residuals` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D102_specialization_candidate_review_2026_10_05.json).
  - remaining_review: Validate this candidate set against additional curriculum/professional evidence and the final parent-domain definition before any canonical implementation; preserve jurisdiction-specific regulation labels.
- **D103** — `candidate_set_reviewed_with_explicit_residuals` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D103_specialization_candidate_review_2026_10_05.json).
  - remaining_review: Validate this candidate set against additional curriculum/professional evidence and the final parent-domain definition before any canonical implementation; preserve jurisdiction-specific regulation labels.
- **D104** — `source_gap_closed_candidate_boundary_or_count_remains_provisional` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D104_specialization_candidate_review_2026_10_05.json).
  - remaining_review: Validate this candidate set against additional curriculum/professional evidence and the final parent-domain definition before any canonical implementation; preserve jurisdiction-specific regulation labels.
- **D105** — `source_gap_closed_candidate_boundary_or_count_remains_provisional` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D105_specialization_candidate_review_2026_10_05.json).
  - remaining_review: Validate this candidate set against additional curriculum/professional evidence and the final parent-domain definition before any canonical implementation; preserve jurisdiction-specific regulation labels.
- **D106** — `candidate_set_reviewed_with_explicit_residuals` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D106_specialization_candidate_review_2026_10_05.json).
  - remaining_review: Validate this candidate set against additional curriculum/professional evidence and the final parent-domain definition before any canonical implementation; preserve jurisdiction-specific regulation labels.
- **D107** — `source_gap_closed_candidate_boundary_or_count_remains_provisional` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D107_specialization_candidate_review_2026_10_05.json).
  - remaining_review: Validate this candidate set against additional curriculum/professional evidence and the final parent-domain definition before any canonical implementation; preserve jurisdiction-specific regulation labels.
- **D108** — `candidate_set_reviewed_with_explicit_residuals` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D108_specialization_candidate_review_2026_10_05.json).
  - remaining_review: Validate this candidate set against additional curriculum/professional evidence and the final parent-domain definition before any canonical implementation; preserve jurisdiction-specific regulation labels.
- **D109** — `source_gap_closed_candidate_boundary_or_count_remains_provisional` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D109_specialization_candidate_review_2026_10_05.json).
  - remaining_review: Validate this candidate set against additional curriculum/professional evidence and the final parent-domain definition before any canonical implementation; preserve jurisdiction-specific regulation labels.
- **D110** — `source_gap_closed_candidate_boundary_or_count_remains_provisional` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D110_specialization_candidate_review_2026_10_05.json).
  - remaining_review: Validate this candidate set against additional curriculum/professional evidence and the final parent-domain definition before any canonical implementation; preserve jurisdiction-specific regulation labels.
- **D111** — `source_gap_closed_candidate_boundary_or_count_remains_provisional` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D111_specialization_candidate_review_2026_10_05.json).
  - remaining_review: Validate this candidate set against additional curriculum/professional evidence and the final parent-domain definition before any canonical implementation; preserve jurisdiction-specific regulation labels.
- **D112** — `source_gap_closed_candidate_boundary_or_count_remains_provisional` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D112_specialization_candidate_review_2026_10_05.json).
  - remaining_review: Validate this candidate set against additional curriculum/professional evidence and the final parent-domain definition before any canonical implementation; preserve jurisdiction-specific regulation labels.
- **D113** — `source_reviewed_candidate_set_parent_scope_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D113_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: The root combines two materially different scopes: materials manufacture (glass/ceramics/mineral building products) and boiler/steam-plant operation. Preserve the requested parent for this lane, but flag a root-domain split/relabel decision before canonical implementation; don't use the proposed child set to certify every current role link.
- **D116** — `source_reviewed_candidate_set_parent_boundary_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D116_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: Earthmoving and heavy equipment operation is a coherent operational parent if it is bounded to mobile construction/earthmoving plant. Crane/hoisting work shares plant-operation context but has a distinct load-handling hazard/task set; validate whether the parent intends to include it. Dredging is equipment-specific and should not become a separate area by default.
- **D121** — `source_reviewed_candidate_set_parent_scope_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D121_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: The parent combines forestry and wildlife management, two related but distinct natural-resource disciplines. Preserve parent in this lane, but make shared foundations explicit and avoid implying that forestry operations qualify a learner for wildlife science or vice versa.
- **D122** — `source_reviewed_candidate_set_and_root_label_refinement` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D122_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: Recommend a student-facing label such as Medical Laboratory Science, retaining legacy/local title aliases in search. Laboratory disciplines are candidate routes; shared foundations include specimen lifecycle, quality, safety, method validation, data integrity and clinical collaboration. Do not present scope-of-practice or result interpretation as identical across jurisdictions/qualification levels.
- **D123** — `source_reviewed_candidate_set_root_boundary_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D123_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: The parent combines diagnostic imaging with radiography and mentions radiation treatment. Diagnostic imaging modalities can form learning routes; radiation therapy/dosimetry is a distinct therapeutic discipline and should be excluded or the root explicitly broadened. Role authorization varies by jurisdiction and modality.
- **D124** — `source_reviewed_no_global_specialization_set_parent_title_ambiguous` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D124_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: The phrase 'community health extension' is not a universally standardized global profession title. WHO guidance explicitly says community-health worker roles and required competencies vary widely by country, health system, program and specific role. Do not equate this domain automatically with every CHW, community nurse, public-health worker or community-based practitioner.
  - no_specialization_disposition: Evidence supports no universal specialization cards for the current ambiguous parent title. Establish the exact profession/jurisdiction or revise the domain scope before adding child areas; a direct domain-to-context-specific-role route is safer.
- **D125** — `source_reviewed_candidate_routes_parent_label_and_granularity_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D125_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: The root is a narrow health-administration support occupation family, not a clinical discipline. Consider a student-facing root rename such as Medical Office and Clinical Administration Support; do not absorb full Health Information Management or coding professions without boundary decisions and distinct curricula.
- **D128** — `source_reviewed_candidate_set_parent_scope_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D128_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: The root contains diverse settings, populations and intervention levels. IFSW/IASSW global standards explicitly recognize practice diversity by setting, population/issues and micro/mezzo/macro methods. A coherent route taxonomy should separate substantive population/service context from role grade and method. The root may need splitting if youth development and statutory/social welfare services have different foundation requirements.
- **D131** — `source_reviewed_candidate_routes_not_standardized` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D131_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: Keep this as engineering applied to competition vehicles and their competition use. It overlaps aerospace/automotive engineering at the technical-method level, but the competition-vehicle context, regulation, rapid iteration and trackside performance distinguish its application. Separate motorsport engineering from race operations/driver services and general vehicle manufacturing.
- **D132** — `source_reviewed_candidate_routes_parent_boundary_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D132_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: For a research-facing learner taxonomy, define the parent as scientific study using space-based observations, in-situ missions and spaceflight environments. Treat spacecraft engineering, astronautics and mission operations as adjacent distinct domains or an explicitly separate branch, not as science specializations by default.
- **D133** — `source_reviewed_no_universal_set_parent_scope_inconsistent` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D133_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: The parent title conflates a market positioning/quality level ('luxury'), a way of commissioning/making ('bespoke') and interior design. First decide whether this is interior design in premium contexts or a broader luxury craft/product domain. Until then, its current contents do not support a reliable student-facing specialization taxonomy.
  - no_specialization_disposition: Hold all subgroup candidates at the review layer: the present parent scope is internally inconsistent, and 'luxury/bespoke' alone cannot determine a globally valid set of interior or craft specializations. Clarify parent scope first; then source candidate routes from international design-professional and education frameworks plus cross-market practice evidence.
- **D137** — `source_reviewed_candidate_specialties_parent_scope_needs_clinical_role_boundary` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D137_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: The root combines medical physics with radiation-therapy and diagnostic-imaging occupations. Keep the science/technical scope explicit: application of physics to clinical imaging, nuclear medicine, therapeutic radiation and radiation protection. Radiographers and radiation therapists are distinct regulated clinical professions, not automatically medical-physics specializations; their learning routes need separate profession-specific ownership or carefully bounded cross-links.
- **D139** — `source_reviewed_parent_label_scope_mismatch_candidate_routes` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D139_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: The existing coverage is game development/production, not game design alone. Rename or narrow the parent before finalizing subgroup count. If broad coverage is intended, use game development as the parent and distinguish design, art, engineering, audio, production and quality disciplines; not every game-adjacent business/legal/support role belongs in the same specialization tree.
- **D140** — `source_reviewed_candidate_routes_not_standardized` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D140_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: Keep the root on engineering and integration of robotic systems: mechanisms, actuation, sensing, control, software, autonomy, safety and deployment. Robotics is applied across industry, field/service, healthcare and other sectors; an application domain is not automatically a specialization unless it adds a distinct learning path. Teaching is an occupation, not a robotics specialization.
- **D142** — `source_reviewed_candidate_internal_routes_needs_learning_path_validation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D142_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: Retain the joint field as computational and quantitative analysis of biological systems and data. It overlaps health/biomedical informatics, statistics, software engineering and laboratory science; keep those boundaries task-based. Separate bioinformatics (data/information pipelines and interpretation) from computational biology (models and computational investigation of biological mechanisms) only where educational objectives and actual practice distinguish them.
- **D144** — `source_reviewed_candidate_areas_count_needs_role_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D144_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: Retain atmospheric weather and climate science, including observation, physical understanding, prediction and climate analysis. Hydrology and ocean science are closely coupled Earth-system fields but should be cross-linked or included only when the parent explicitly covers them. Separate scientific/operational meteorology from public warning or policy functions where learning differs.
- **D148** — `source_reviewed_scope_boundary_open_offshore_energy_conditional` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D148_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: Retain engineered systems installed/operated offshore and subsea, but decide whether this is intentionally oil-and-gas subsea production or a broader offshore engineering domain. ISO's 2025 subsea production-system standard covers concept through decommissioning and includes low-carbon energy in its title; offshore renewables and marine construction require deliberate scope and source coverage, not silent exclusion.
- **D150** — `source_reviewed_global_plurality_and_parent_boundaries_required` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D150_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: Keep academic study of religion/theology distinct from faith-specific ministry and spiritual-care practice. Interfaith leadership is a cross-tradition civic/community practice, not a universal credential or single theology. Do not assume one tradition's ministry model, titles or qualifications apply globally.
- **D151** — `source_reviewed_candidate_paths_require_professional_boundary_reconciliation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D151_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: The parent combines a social-science field (criminology), the justice-system lifecycle and corrections. Keep research/policy and justice-service practice paths distinct. Courts/legal advocacy, policing, forensic science and clinical rehabilitation overlap but have separate professional scope; do not imply a criminology route licenses policing, legal practice or clinical treatment.
- **D153** — `source_reviewed_zero_role_coverage_scope_and_candidates_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D153_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: The title says music production but the description also includes recording, sound engineering, arrangement, composition, conductors and live events. Narrow the parent to recorded music/audio production or broaden and clarify it as music and audio production. Performance/conducting and film/game sound design need explicit domain boundaries; they are not automatically music-production specializations.
- **D155** — `source_reviewed_parent_scope_and_count_need_validation` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D155_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: Retain research, engineering and application of nanoscale systems/materials and advanced materials, but make clear that scale is not the only organizing axis. Materials chemistry, characterization, fabrication and application sectors may have distinct learning paths. Do not treat nanotechnology as every material or every product containing nanoscale features.
- **D157** — `source_reviewed_zero_role_coverage_tax_scope_open` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D157_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: Clarify whether this is broad tax advisory or international tax/transfer pricing. Tax law, compliance, dispute resolution and accounting overlap but have distinct jurisdictions and professional qualifications. OECD's transfer-pricing framework is international guidance while each country's tax law and administration determine legal application.
- **D161** — `source_reviewed_parent_blends_response_and_development_candidate_routes_provisional` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D161_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: Keep humanitarian response and development connected only as a broad cross-sector umbrella; expose the operational distinction. Humanitarian work is needs-based, crisis-context response and protection; international development includes longer-term systems, policy and programme work. Do not imply all humanitarian practitioners work across every technical sector.
- **D163** — `source_reviewed_occupational_groups_unfit_patent_scope_supported_other_ip_routes_need_more_evidence` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D163_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: Retain a coherent IP practice parent only if patent practice is not treated as all of intellectual property. Make patent prosecution/examination, trademarks/designs/copyright, transactions/licensing and portfolio strategy distinct candidate routes where education and task sequences differ.
- **D164** — `source_reviewed_custom_group_partly_relevant_parent_smart_city_scope_needs_boundary` (data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D168/D164_specialization_candidate_review_2026_10_05.json).
  - parent_scope_disposition: Retain mobility as the anchor. Treat urban mobility planning, public transport/service operations and transport-system engineering/data as coherent branches; include smart-city integration only where it is mobility-relevant. The title may overstate citywide smart-systems scope.
## Method, limits and next checkpoint

- The script scans the actual per-domain artifact paths in `specialization_review_artifact_coverage_2026_10_06.json`, including central register, lane reviews and explicit reconciliation records. Candidate labels are compared case-insensitively and in order; counts follow list lengths.
- The residual queue is extracted from explicit structured status/residual fields and prioritizes domain-specific reviews over grouped/central records. It is an evidence-backed work queue, not a judgment that every listed domain contains an error.
- D118–D123 claims were checked against primary global or international sources where available. US professional standards and institution-specific curricula are explicitly only corroborative. The rest of the 135 URLs carried forward in the earlier 31-domain checkpoint have not all been live-rechecked.
- No Nigerian-specific search was made. No canonical `domain_structure.json`, `role_library_v3*.json`, subgroup script/report or shared register was edited. No role was assigned to a specialization.
- Next: continue source/parent-boundary adjudication on D053–D056 and the retained provisional set; recheck source locators for carried-forward recommendations; then rerun this extractor and tests. Do not implement before the full global pass and the separately requested Nigerian-context pass.

## Reproduction

```powershell
python data/career-mapping/_audit/specialization_lanes_2026_10_05/D001_D112_GLOBAL_RECONCILIATION/audit_global_specialization_exception_reconciliation_2026_10_06.py
python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D001_D112_GLOBAL_RECONCILIATION/test_global_specialization_exception_reconciliation_2026_10_06.py
```
