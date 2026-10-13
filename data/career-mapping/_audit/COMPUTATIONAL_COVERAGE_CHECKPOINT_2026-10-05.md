# Catalogue-wide computational coverage checkpoint — 2026-10-05

This checkpoint supplements (does not replace or repeat) the completed deterministic candidate scan and explicit-link audit. It joins their current outputs to the external-source dispositions and records what the counts do—and do not—prove.

## Exact coverage counts

| Measure | Count |
|---|---:|
| `catalogue_domains` | 168 |
| `raw_scan_domains` | 168 |
| `domains_with_any_raw_keyword_hit` | 122 |
| `declared_method_or_computational_domains_in_manifest_plus_historical_pairs` | 36 |
| `raw_hit_domains_outside_declared_layer_set` | 87 |
| `raw_source_field_hits` | 1487 |
| `triaged_candidate_domains` | 107 |
| `triage_no_specific_signal_domains` | 61 |
| `triage_partition_total` | 168 |
| `triage_method_or_role_task_signal_domains` | 73 |
| `method_signal_domains_already_in_declared_layer_set` | 31 |
| `method_signal_domains_outside_declared_layer_set` | 42 |
| `method_signal_domains_with_direct_and_role_task_signals` | 21 |
| `method_signal_domains_with_role_task_only` | 52 |
| `triage_occupational_aggregate_only_domains` | 33 |
| `named_computational_field_candidates` | 1 |
| `direct_domain_or_declared_layer_signal_domains` | 22 |
| `role_task_signal_domains` | 74 |
| `unique_role_task_candidate_rows` | 325 |
| `base_domain_subgroup_records_scanned` | 557 |
| `emerging_subgroup_layer_records_scanned` | 76 |
| `declared_computational_layer_domains_in_coverage_audit` | 36 |
| `declared_computational_method_group_records` | 39 |
| `coverage_audit_roles_in_declared_domains` | 620 |
| `coverage_audit_roles_with_esco` | 517 |
| `coverage_audit_roles_with_onet` | 479 |
| `coverage_audit_roles_source_backed` | 579 |
| `explicit_role_method_links_only` | 4 |
| `manifest_groups_without_explicit_role_method_link` | 38 |
| `invalid_explicit_role_links` | 0 |
| `manifest_groups_missing_source_layer` | 0 |
| `externally_reviewed_candidate_dispositions` | 7 |
| `external_primary_and_professional_sources` | 12 |
| `method_signal_domains_case_dispositioned` | 73 |
| `method_signal_role_task_rows_without_exact_local_role_title_match` | 3 |

## How evidence was separated

- Domain-root text, subgroup/specialization text, role task text, and role occupational competency text are kept as distinct evidence layers.
- The lexical inventory produced 1,486 hits: role competencies 877, role tasks 459, base subgroup text 81, emerging subgroup text 28, domain-root text 24, and emerging domain-layer text 17. Many hits are repeated aggregate skills or general tools.
- Those hits occurred in 121 domains; the existing triage emits 107 candidate/follow-up domains and 61 no-specific-signal domains, exactly partitioning the 168-domain catalogue. The independent raw scan's 87 “outside declared layer” figure is a lexical-unrepresented count, not 87 validated missing specializations.
- 325 role-task rows are candidate signals across 74 domains. The ESCO/O*NET/ISCO aggregate-only tier is kept separate and never establishes parent-domain fit.
- Within the 73 method/task-signal queue, 31 are already in the declared layer set and 42 are not. The latter are review leads, not missing-specialization findings. 21 have both domain/layer and role-task signals; 52 are role-task-only.
- The existing method-link audit covers 39 manifest groups across 36 domains and 620 local role records. It found 4 explicit role-method links, 38 groups without one, 0 invalid explicit links and 0 missing source layers. No link is inferred from ISCO.
- There are 557 current base subgroup records and 76 emerging subgroup-layer records. These are inspected as candidate text inventories—not accepted as the correct student specialization taxonomy.

## Externally checked field/method candidates

| Candidate | Evidence-based disposition |
|---|---|
| `D065_COMPUTATIONAL_LINGUISTICS` (D065) | `recognized_global_field_candidate_local_parent_and_role_fit_unproven` — Retain in the D065 specialist review queue; verify linguistics/language-technology scope and actual local role records before proposing the area. Do not create an NLP occupation. |
| `D041_COMPUTATIONAL_SCIENCE_AND_ENGINEERING` (D041) | `cross_cutting_practice_candidate_parent_scope_review_required` — Keep methods/use cases contextual; reconcile the breadth of the Scientific Research parent before asserting a universal subgroup. |
| `PHYSICS_RESEARCH_METHODS` (D041, D132, D135) | `established_method_field_role_parent_fit_unresolved` — Preserve as method/specialist-route evidence. Do not add/move roles or infer a computational subgroup in D132/D135 until role-domain and parent-scope evidence is reconciled. |
| `COMPUTATIONAL_CHEMISTRY_AND_BIOLOGY` (D027, D138, D142, D155) | `fields_verified_existing_parent_fit_varies_do_not_duplicate` — Keep D142 as the explicit field; treat methods in D027/D138/D155 as optional candidates only when parent-specific course/task evidence supports them. |
| `CFD_AND_COMPUTATIONAL_MECHANICS` (D017, D018, D022, D138) | `task_specific_method_not_automatic_specialization` — Use only in a task-linked learning context where the exact role/domain fit is established; do not treat these generic phrases as evidence to add specializations. |
| `D078_COMPUTATIONAL_SOCIAL_RESEARCH` (D078) | `existing_candidate_supported_no_new_role_or_universal_requirement` — Preserve the label/method evidence; keep programming optional and question-dependent; defer role links to the independent task audit. |
| `D145_COMPUTATIONAL_NEUROSCIENCE_METHODS` (D145) | `existing_optional_method_candidate_no_universal_requirement` — Retain the optional specialist-method distinction; do not infer every neuroscience, cognitive science or BCI role requires computation. |

## Primary/global source set

- [Association for Computational Linguistics (ACL): ACL Anthology and Computational Linguistics venue](https://aclanthology.org/venues/cl/) — Computational linguistics is an established global research field, not merely generic computer use. Claim limit: That computational linguistics is already a student-facing D065 specialization, that a D065 role mapping is correct, or any invented NLP occupation title.
- [American Physical Society (APS): Division of Computational Physics](https://engage.aps.org/dcomp/home) — Computational physics is an established research area and computation is a method applied across physics specialties. Claim limit: A computational specialization in every physics-related domain, or the fit of any current local physicist role to D041, D132 or D135.
- [Society for Industrial and Applied Mathematics (SIAM): 2024 SIAM Task Force Report: The Future of Computational Science](https://www.siam.org/media/cfufuosh/siam-report-on-the-future-of-computational-science.pdf) — Computational science/engineering is an established cross-disciplinary field/practice, not simply a software tool. Claim limit: A fixed subgroup count or automatic addition of the same specialization to each scientific or engineering parent domain.
- [American Chemical Society (ACS): Computational Chemistry](https://www.acs.org/careers/chemical-sciences/fields/computational-chemistry.html) — Computational chemistry is a distinct chemistry practice with research and industrial applications; computational methods are use-case-specific. Claim limit: That every biology, biomedical, food, materials or nanotechnology role in the local catalogue is a computational chemist or needs these methods.
- [American Society of Mechanical Engineers (ASME): Introduction to Computational Fluid Dynamics](https://www.asme.org/learning-development/find-course/introduction-computational-fluid-dynamics/online) — CFD is an established engineering method for specified fluid/heat-transfer problems. Claim limit: CFD as a universal subgroup, role, or required skill in mining, mechanical or other domains; local role-to-domain fit needs its own evidence.
- [International Society for Computational Biology (ISCB): About ISCB](https://www.iscb.org/about-iscb) — Bioinformatics/computational biology is an established global interdisciplinary field; it supports the named D142 parent and may inform relevant biological-science branches. Claim limit: A role assignment, a required programming level for every biologist, or duplicating D142's field as a specialization under every biology-adjacent parent.
- [American Sociological Association (ASA): Section Calls for Submissions: Mathematical Sociology](https://www.asanet.org/wp-content/uploads/section_calls_for_submissions.pdf) — Computational social research has distinct research methods relevant to social sciences and sociology. Claim limit: A universal programming requirement or an exhaustive specialization taxonomy.
- [National University of Singapore: Centre for Computational Social Science and Humanities](https://cssh.nus.edu.sg/) — Computational social science is a cross-disciplinary practice with question-dependent methods. Claim limit: A universal course sequence, standardized specialization count, or employment qualification.
- [University of California San Diego: Computational Social Science](https://css.ucsd.edu/) — A recognized academic route combines social-science reasoning with computational methods. Claim limit: A global credential standard or a requirement for every social scientist.
- [Kobe University: Center for Computational Social Science](https://ccss.kobe-u.ac.jp/en/index.html) — Cross-regional existence of computational social-science research. Claim limit: A fixed global specialization count or universal occupational title.
- [The University of Hong Kong Social Sciences Research Centre: Research: Computational Social Science](https://www.socsc.hku.hk/ssrc/research/) — Cross-regional scholarly use of computational social research. Claim limit: An exhaustive taxonomy, standardized job title or requirement for all social-science learners.
- [US National Institute of Mental Health (NIMH/NIH): Theoretical and Computational Neuroscience Program](https://www.nimh.nih.gov/about/organization/dnbbs/behavioral-science-and-integrative-neuroscience-research-branch/theoretical-and-computational-neuroscience-program) — Computational modelling/neural-data analysis are legitimate specialist neuroscience methods. Claim limit: A universal computational requirement across neuroscience, cognitive science or BCI roles.

## Remaining exact work

- The 73 method/task-signal domains now have a durable case-level disposition in computational_method_signal_domain_dispositions_2026_10_05.json: 21 direct-scope/existing-layer cases, 10 already-declared-layer task-only cases and 42 role-task-only cases. This classifies scan findings; it does not close the independent role-to-domain audit.
- Four D139/D140 task-signal titles have no exact local role-title match (gameplay programmer, technical artist, game environment artist, robotics engineer). They remain explicitly unmatched rather than being assigned to similar role records.
- The one external named-field candidate outside the current declared layer set is D065 computational linguistics; external field recognition is established, but local D065 role/domain fit remains unproven.
- D041/D132/D135 computational-physics and scientific-computing signals need exact role-parent fit reconciliation; no role reassignment is authorized in this lane.
- D022 CFD and D017/D018/D138 computational-mechanics signals remain task/method candidates; source recognition does not validate current local role placement.
- 38 of 39 manifest method-group records have no explicit role-method link. This is a coverage fact, not an automatic defect; role-to-specialization linkage waits for the specialization and role-domain audits.
- No external academic-body sign-off has been obtained, and no canonical taxonomy was edited.

## Reproduction

```powershell
python data/career-mapping/_audit/triage_computational_candidate_hits_2026_10_05.py
python data/career-mapping/_audit/audit_computational_taxonomy_candidates_2026_10_05.py
python data/career-mapping/_audit_computational_coverage.py
python data/career-mapping/_audit/classify_computational_method_signal_domains_2026_10_05.py
python data/career-mapping/_audit/build_computational_coverage_checkpoint_2026_10_05.py
python -m pytest -q data/career-mapping/_audit/test_computational_domain_coverage_reconciliation_2026_10_05.py data/career-mapping/_audit/test_computational_coverage_checkpoint_2026_10_05.py
```

No writes were made to `domain_structure.json`, `role_library_v3*.json`, subgroup scripts/reports, or role-to-domain files. The field review is an audit result, not academic-body sign-off.
