# Computational residual resolution — 2026-10-06

This is a source-bounded audit overlay. It resolves the computational residual queue into explicit dispositions; it does not edit canonical domain, subgroup, role-library, or role-link files.

## Counts

- External candidate classes: **7**
- Parent-specific dispositions: **10**
- Exact local-title residuals: **0**
- Stale unmatched signals reconciled to existing local role rows: **3**
- D140 alias resolutions: **1**
- Method groups without explicit role links resolved: **38/38**
- Source records with URL, locator, supports, and limits: **57**
- Canonical changes: **0**

## Important stale-count correction

The prior checkpoint said four D139/D140 exact-title mismatches. The current disposition data shows three unmatched D139 titles. The D140 `robotics engineer` signal is already resolved through an explicit `also_known_as` match to the local `mechatronics engineer` record; it must not create a duplicate role.

## Candidate-class dispositions

| Candidate | Affected parents | Exact disposition | Canonical action |
|---|---|---|---|
| `D065_COMPUTATIONAL_LINGUISTICS` | D065 | `recognized_field_local_parent_fit_unproven_retain_review_only` | no_change |
| `D041_COMPUTATIONAL_SCIENCE_AND_ENGINEERING` | D041 | `existing_declared_computational_layer_retain_no_duplicate` | retain_existing_layer_no_new_subgroup |
| `PHYSICS_RESEARCH_METHODS` | D041, D132, D135 | `recognized_method_route_retain_contextual_split_by_parent` | no_new_shared_physics_subgroup |
| `COMPUTATIONAL_CHEMISTRY_AND_BIOLOGY` | D027, D138, D142, D155 | `retain_d142_existing_field_contextual_methods_elsewhere` | no_duplicate_computational_subgroups |
| `CFD_AND_COMPUTATIONAL_MECHANICS` | D017, D018, D022, D138 | `parent_specific_method_use_case_not_automatic_specialization` | retain_method_evidence_no_blanket_taxonomy_change |
| `D078_COMPUTATIONAL_SOCIAL_RESEARCH` | D078 | `existing_declared_method_group_supported_optional` | retain_existing_layer |
| `D145_COMPUTATIONAL_NEUROSCIENCE_METHODS` | D145 | `existing_optional_method_candidate_retain_no_universal_requirement` | retain_existing_optional_method_context |

The detailed reason, next gate, source references, and limits are in the JSON register.

## Parent-specific decisions

| Domain | Method | Disposition | Role-link rule |
|---|---|---|---|
| `D017` | computational mechanics / CFD | `supported_method_in_parent_not_new_subgroup` | not inferred |
| `D018` | computational mechanics | `supported_civil_engineering_method_not_new_subgroup` | not inferred |
| `D022` | CFD | `mining_ventilation_use_case_only` | requires exact mining-ventilation task evidence |
| `D041` | computational science / physics | `retain_existing_computational_quantitative_layer` | separate role-domain audit |
| `D065` | computational linguistics | `external_field_only_local_parent_unresolved` | no link |
| `D132` | computational astrophysics | `space-science_method_route_contextual` | no universal link |
| `D135` | nuclear/radiation modelling | `nuclear_method_route_contextual` | no universal link |
| `D138` | computational biomedical engineering / mechanics | `biomedical_method_contextual` | no automatic link |
| `D142` | computational biology / bioinformatics | `existing_parent_field_retain_no_duplicate` | separate role audit |
| `D155` | computational chemistry / materials modelling | `conditional_parent_method_no_promotion` | requires parent-specific evidence |

## Exact local-title residuals

| Domain | Title | Disposition | Local action |
|---|---|---|---|

D140 `robotics engineer`: `external_title_resolved_to_existing_local_alias_no_new_role` → existing local role `mechatronics engineer` via `explicit_also_known_as`. No new role is proposed.

## The 38 method groups without explicit role links

Each of these groups is explicitly resolved as `method_group_retained_no_explicit_role_link`. The absence is not auto-filled: a method group is not a role path, and ISCO membership/shared skills cannot establish one. A later role link requires exact role-task evidence plus parent-domain/subgroup fit.

| Group | Label | Source IDs | Exact disposition |
|---|---|---|---|
| `D007|21` | Visual, Interaction & Motion Design | global_esco, global_onet, global_sfia, ng_cpn, ng_creative | `method_group_retained_no_explicit_role_link` |
| `D007|25` | Product & Interaction Design | global_esco, global_onet, global_sfia, ng_cpn, ng_creative | `method_group_retained_no_explicit_role_link` |
| `D008|13` | Telecom & IT Leadership | global_esco, global_onet, global_sfia, ng_cpn, ng_telecom | `method_group_retained_no_explicit_role_link` |
| `D008|21` | Radio & Network Engineering | global_esco, global_onet, global_sfia, ng_cpn, ng_telecom | `method_group_retained_no_explicit_role_link` |
| `D008|25` | Network Architecture & Planning | global_esco, global_onet, global_sfia, ng_cpn, ng_telecom | `method_group_retained_no_explicit_role_link` |
| `D008|35` | Network Support Technicians | global_esco, global_onet, global_sfia, ng_cpn, ng_telecom | `method_group_retained_no_explicit_role_link` |
| `D026|21` | Epidemiology & Health Data | global_esco, global_onet, global_health, ng_health, ng_nbs | `method_group_retained_no_explicit_role_link` |
| `D027|21` | Computational & Life Science Research | global_esco, global_onet, global_health, ng_health, ng_nuc | `method_group_retained_no_explicit_role_link` |
| `D050|21` | Automation & Mechatronics Engineers | global_esco, global_onet, global_sfia, ng_engineering, ng_nbte | `method_group_retained_no_explicit_role_link` |
| `D057|13` | Clinical Informatics Management | global_esco, global_onet, global_health, ng_health, ng_cpn | `method_group_retained_no_explicit_role_link` |
| `D057|25` | Health Informatics & Development | global_esco, global_onet, global_health, ng_health, ng_cpn | `method_group_retained_no_explicit_role_link` |
| `D072|21` | Geospatial Data & Spatial Analysis | global_esco, global_onet, global_built_environment, ng_engineering, ng_environment | `method_group_retained_no_explicit_role_link` |
| `D145|21` | Neuroscience & Cognitive Research | nih_nimh | `method_group_retained_no_explicit_role_link` |
| `D041|21` | Computational & Quantitative Science | global_esco, global_onet, ng_education, ng_nbs | `method_group_retained_no_explicit_role_link` |
| `D138|21` | Biomedical Systems & Computational Engineering | global_esco, global_onet, global_health, ng_health, ng_engineering | `method_group_retained_no_explicit_role_link` |
| `D138|31` | Biomedical Engineering Technicians | global_esco, global_onet, global_health, ng_health, ng_engineering | `method_group_retained_no_explicit_role_link` |
| `D138|32` | Biomedical Laboratory Support | global_esco, global_onet, global_health, ng_health, ng_engineering | `method_group_retained_no_explicit_role_link` |
| `D139|21` | Game Art & Animation | global_esco, global_onet, global_game_dev, global_creative, ng_creative | `method_group_retained_no_explicit_role_link` |
| `D139|25` | Gameplay Programming | global_esco, global_onet, global_game_dev, global_sfia, ng_cpn | `method_group_retained_no_explicit_role_link` |
| `D139|26` | Creative Direction | global_esco, global_onet, global_game_dev, global_creative, ng_creative | `method_group_retained_no_explicit_role_link` |
| `D143|25` | Cybersecurity & Digital Forensics | global_esco, global_onet, global_nice, ng_cpn | `method_group_retained_no_explicit_role_link` |
| `D147|21` | Automation & Control Engineers | global_esco, global_onet, global_sfia, ng_engineering, ng_nbte | `method_group_retained_no_explicit_role_link` |
| `D155|21` | Nanoscience & Advanced Materials Research | global_esco, global_onet, global_nuclear, ng_engineering | `method_group_retained_no_explicit_role_link` |
| `D155|31` | Nanofabrication & Materials Technicians | global_esco, global_onet, global_nuclear, ng_engineering | `method_group_retained_no_explicit_role_link` |
| `D156|21` | Geospatial Surveying & Cadastral Systems | global_esco, global_onet, global_built_environment, ng_engineering, ng_environment | `method_group_retained_no_explicit_role_link` |
| `D164|21` | Smart Mobility & Urban Systems | global_esco, global_onet, global_built_environment, ng_engineering | `method_group_retained_no_explicit_role_link` |
| `D166|25` | Self-Driving Software Engineers | global_esco, global_onet, global_sfia, global_xr, ng_cpn, ng_engineering | `method_group_retained_no_explicit_role_link` |
| `D009|33` | Statistical Operations & Data Support | global_esco, global_onet, ng_nbs, ng_education | `method_group_retained_no_explicit_role_link` |
| `D009|25` | Data & AI Engineers | global_esco, global_onet, global_sfia, ng_cpn | `method_group_retained_no_explicit_role_link` |
| `D010|24` | Business Analysis & Strategy | global_esco, global_onet, ng_business, ng_nbs | `method_group_retained_no_explicit_role_link` |
| `D010|33` | Statistical Operations & Data Support | global_esco, global_onet, ng_business, ng_nbs | `method_group_retained_no_explicit_role_link` |
| `D010|25` | Data & Systems Engineering | global_esco, global_onet, global_sfia, ng_cpn, ng_business | `method_group_retained_no_explicit_role_link` |
| `D011|24` | Investment & Risk Analysts | global_esco, global_onet, ng_finance, ng_nbs | `method_group_retained_no_explicit_role_link` |
| `D011|33` | Traders & Brokers | global_esco, global_onet, ng_finance, ng_nbs | `method_group_retained_no_explicit_role_link` |
| `D014|24` | Insurance Risk Analysts | global_esco, global_onet, ng_finance, ng_nbs | `method_group_retained_no_explicit_role_link` |
| `D014|33` | Insurance & Claims Specialists | global_esco, global_onet, ng_finance, ng_nbs | `method_group_retained_no_explicit_role_link` |
| `D041|31` | Laboratory & Field Technicians | global_esco, global_onet, ng_education, ng_nbs | `method_group_retained_no_explicit_role_link` |
| `D063|24` | Economic Policy & Analysis | global_esco, global_onet, ng_education, ng_nbs, ng_finance | `method_group_retained_no_explicit_role_link` |

## Evidence limits

- A professional or government source can establish that a field, method, or title exists; it cannot establish this catalogue's exact subgroup count.
- Role-to-domain fit and role-to-subgroup fit remain separate decisions based on the role's actual tasks and the parent scope; ISCO membership is not fit evidence.
- No new role is proposed from a stale scanner title: D139 titles found in current role files are not duplicated; their role-to-domain and role-to-area fit remains a separate task-evidence gate.
- The 38 no-link method groups are resolved as no-link-needed pending exact task evidence, not as missing data to be filled by inference.
- No Nigerian demand, licensing, salary, or local professional requirement is inferred from the global sources in this register.

## Verification

Run:

```powershell
python data/career-mapping/_audit/build_computational_residual_resolution_2026_10_06.py
python -m pytest -q data/career-mapping/_audit/test_computational_residual_resolution_2026_10_06.py
```

The register is intentionally not a taxonomy seed and is not live deployment evidence.
