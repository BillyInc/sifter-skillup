# D078 full domain item-inventory review (research checkpoint)

Reviewed: 2026-10-08  
Status: research candidate; not canonical or student-approved.

This is a new, expanded review and does not overwrite the earlier candidate-only pass. It audits every label in the existing D078 domain-skill provenance inventory plus the recorded D078 computational-method and subgroup-cluster candidates. The area names below are only used to describe possible content support; this is not an area/role fit audit.

## Scope and gate status

No individual roles were inspected. No canonical domain, area/subgroup, role, SQL, matcher, API/UI data or prior review artifact was edited. The implementation plan still places the programme overview and pre-domain-entry gates before approval of D078 domain learning-path content. This review therefore produces evidence-backed candidates and holds, not student-approved content.

## Learner-facing overview candidate

Social Sciences & Behavioural Research looks at how people live, behave and relate to one another, and how communities, institutions and wider conditions shape those experiences. When researchers investigate a question, they use evidence: quantitative evidence is expressed in numbers, while qualitative evidence uses words, observations or records to understand meaning and experience. Different questions call for different approaches; some projects combine them, and many paths do not require every method or a particular software tool.

### Nigeria-specific context candidate

In Nigeria, the NUC Social Sciences CCMAS includes programme-specific research-methods teaching; its SSC 401 example describes preparing a proposal, organising data, pilot work, report writing and appropriate statistics. NISER policy briefs and research projects and NBS social-statistics publications provide examples of locally produced research and data outputs. These examples show some Nigerian settings and materials; they do not establish a universal work route, demand level, salary, licensing rule or requirement for every learner.

### Work settings, entry expectations and opportunity limits

Candidate only: sources establish academic training and examples of research institutes, statistical agencies and policy-facing communication. This pass does not establish a complete global or Nigerian list of employers, collaborators, entry qualifications, job demand or pay. Treat policy briefs/reports and statistics as illustrative outputs, not a universal job description.

No universal D078 entry qualification is established by this review. The U.S. BLS occupation examples and UK postgraduate ESRC framework are not transferable to all D078 occupations or Nigerian contexts.

No broad labour-market opportunity, demand, salary or job guarantee is claimed. Sources support method choice as question-dependent and ethical/data safeguards where people or sensitive information are involved. Funding, infrastructure and other opportunity/constraint claims are not established here and should not be shown as general D078 facts.

These paragraphs are source-backed synthesis drafts, not approved display copy. Nigerian examples are explicitly local; they do not establish general Nigerian demand or professional requirements.

## Inventory reconciliation and counts

- Existing D078 domain-provenance skill labels triaged individually: **137**.
- Separate `domain_structure.json` D078 summary labels triaged individually: **30** (overlaps provenance; not additive unique skills).
- Canonical ownership flags currently marked `domain`: **7**. The provenance flags are not accepted as proof of shared foundation.
- Aggregate domain role-count metadata differs between the two inventories: **20** vs **24**. Recorded as a data discrepancy only; individual roles were not opened.
- Existing computational-method records: **7** (6 unique names).
- Domain-owned items in the existing approved contextual ledger: **1** (Research design).
- Domain-level certifications in `domain_structure.json`: none. Domain-owned tool inventory in the reviewed context ledger: none.
- Role-owned tool records were not opened; this is not a full software-vendor inventory.
- Candidate item records in this review: **30**; every displayable candidate has a direct verified learning link. Specialist methods without an appropriate direct tutorial are held rather than linked to an adjacent tool page.

The seven provenance items flagged `ownership=domain` are research design, statistics, scientific research methodology, manage research data, digital data processing, quantitative analysis and data ethics. The separate contextual ledger contains only the Research design item. This mismatch is recorded, not silently reconciled by promotion.

### Disposition totals for the 137 legacy skill labels

| Disposition | Count |
|---|---:|
| `cross_area_shared_in_research_routes` | 15 |
| `exclude_from_domain_learning_path` | 10 |
| `exclude_or_boundary_hold` | 6 |
| `exclude_or_specialist_boundary_hold` | 4 |
| `method_option_not_universal` | 7 |
| `specialization_owned` | 5 |
| `specialization_owned_or_boundary_hold` | 49 |
| `specialization_owned_or_conditional` | 7 |
| `task_specific_not_foundation` | 17 |
| `useful_conditional_foundation` | 2 |
| `useful_nonuniversal_or_specialization_owned` | 15 |

### Disposition totals for the separate 30-label domain summary

| Disposition | Count |
|---|---:|
| `cross_area_shared_in_research_routes` | 5 |
| `exclude_from_domain_learning_path` | 1 |
| `exclude_or_boundary_hold` | 2 |
| `method_option_not_universal` | 1 |
| `specialization_owned_or_boundary_hold` | 9 |
| `specialization_owned_or_conditional` | 3 |
| `task_specific_not_foundation` | 4 |
| `useful_conditional_foundation` | 1 |
| `useful_nonuniversal_or_specialization_owned` | 4 |

### Complete item-level triage

Each row preserves the exact inventory label and frequency metadata. Frequency is not evidence of commonness across the domain; ‘possible area support’ is conditional and not a route mapping.

| # | Inventory label | Owner/visibility flag | n (metadata only) | Disposition | Possible area support |
|---:|---|---|---:|---|---|
| 1 | criminology | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 2 | forensic psychiatry | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 3 | mathematics | role_aggregated / review_only | 28 | `useful_nonuniversal_or_specialization_owned` | Computational and Digital Social Science |
| 4 | research design | domain / approved | 11 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 5 | scientific literature | role_aggregated / review_only | 7 | `specialization_owned_or_boundary_hold` | none established |
| 6 | statistics | domain / approved | 12 | `useful_nonuniversal_or_specialization_owned` | Computational and Digital Social Science |
| 7 | criminal law | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 8 | sociology | role_aggregated / review_only | 4 | `specialization_owned_or_boundary_hold` | none established |
| 9 | psychology | role_aggregated / review_only | 3 | `specialization_owned_or_boundary_hold` | none established |
| 10 | anthropology | role_aggregated / review_only | 3 | `specialization_owned_or_boundary_hold` | none established |
| 11 | scientific research methodology | domain / approved | 18 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 12 | draft scientific or academic papers and technical documentation | role_aggregated / review_only | 17 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 13 | active listening | role_aggregated / review_only | 22 | `exclude_from_domain_learning_path` | none established |
| 14 | speaking | role_aggregated / review_only | 22 | `exclude_from_domain_learning_path` | none established |
| 15 | active learning | role_aggregated / review_only | 22 | `exclude_from_domain_learning_path` | none established |
| 16 | critical thinking | role_aggregated / review_only | 22 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 17 | reading comprehension | role_aggregated / review_only | 22 | `exclude_from_domain_learning_path` | none established |
| 18 | writing | role_aggregated / review_only | 22 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 19 | learning strategies | role_aggregated / review_only | 22 | `exclude_from_domain_learning_path` | none established |
| 20 | monitoring | role_aggregated / review_only | 22 | `exclude_from_domain_learning_path` | none established |
| 21 | science | role_aggregated / review_only | 22 | `specialization_owned_or_boundary_hold` | none established |
| 22 | history | role_aggregated / review_only | 2 | `specialization_owned_or_boundary_hold` | none established |
| 23 | source criticism | role_aggregated / review_only | 2 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 24 | historical methods | role_aggregated / review_only | 1 | `specialization_owned` | none established |
| 25 | periodisation | role_aggregated / review_only | 1 | `specialization_owned` | none established |
| 26 | manage research data | domain / approved | 16 | `useful_conditional_foundation` | Social Research and Evaluation; Computational and Digital Social Science |
| 27 | analyse recorded sources | role_aggregated / review_only | 2 | `method_option_not_universal` | Social Research and Evaluation; Computational and Digital Social Science |
| 28 | interact professionally in research and professional environments | role_aggregated / review_only | 11 | `exclude_from_domain_learning_path` | none established |
| 29 | disseminate results to the scientific community | role_aggregated / review_only | 7 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 30 | operate open source software | role_aggregated / review_only | 6 | `specialization_owned_or_conditional` | Computational and Digital Social Science |
| 31 | speak different languages | role_aggregated / review_only | 2 | `exclude_from_domain_learning_path` | none established |
| 32 | geography | role_aggregated / review_only | 4 | `specialization_owned_or_boundary_hold` | none established |
| 33 | gather data | role_aggregated / review_only | 2 | `method_option_not_universal` | Social Research and Evaluation; Computational and Digital Social Science |
| 34 | interpret current data | role_aggregated / review_only | 1 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 35 | digital data processing | domain / approved | 5 | `specialization_owned_or_conditional` | Computational and Digital Social Science |
| 36 | business management principles | role_aggregated / review_only | 2 | `exclude_or_boundary_hold` | none established |
| 37 | mathematical economics | role_aggregated / review_only | 2 | `useful_nonuniversal_or_specialization_owned` | Computational and Digital Social Science |
| 38 | quantitative analysis | domain / approved | 4 | `useful_nonuniversal_or_specialization_owned` | Computational and Digital Social Science |
| 39 | international business | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 40 | economics | role_aggregated / review_only | 5 | `specialization_owned_or_boundary_hold` | none established |
| 41 | financial markets | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 42 | analyse market financial trends | role_aggregated / review_only | 2 | `task_specific_not_foundation` | none established |
| 43 | execute analytical mathematical calculations | role_aggregated / review_only | 1 | `useful_nonuniversal_or_specialization_owned` | Computational and Digital Social Science |
| 44 | apply statistical analysis techniques | role_aggregated / review_only | 2 | `useful_nonuniversal_or_specialization_owned` | Computational and Digital Social Science |
| 45 | advise on economic development | role_aggregated / review_only | 3 | `task_specific_not_foundation` | none established |
| 46 | analyse economic trends | role_aggregated / review_only | 3 | `task_specific_not_foundation` | none established |
| 47 | literature | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 48 | media studies | role_aggregated / review_only | 2 | `specialization_owned_or_boundary_hold` | none established |
| 49 | ethical code of conduct of journalists | role_aggregated / review_only | 1 | `exclude_or_specialist_boundary_hold` | none established |
| 50 | communication studies | role_aggregated / review_only | 2 | `specialization_owned_or_boundary_hold` | none established |
| 51 | types of media | role_aggregated / review_only | 2 | `exclude_or_specialist_boundary_hold` | none established |
| 52 | digital media | role_aggregated / review_only | 1 | `exclude_or_specialist_boundary_hold` | none established |
| 53 | copyright legislation | role_aggregated / review_only | 1 | `exclude_or_specialist_boundary_hold` | none established |
| 54 | archaeology | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 55 | cultural geography | role_aggregated / review_only | 3 | `specialization_owned_or_boundary_hold` | none established |
| 56 | scientific modelling | role_aggregated / review_only | 4 | `specialization_owned_or_conditional` | Computational and Digital Social Science |
| 57 | excavation techniques | role_aggregated / review_only | 1 | `specialization_owned` | none established |
| 58 | cultural history | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 59 | government policy implementation | role_aggregated / review_only | 4 | `task_specific_not_foundation` | none established |
| 60 | political economy | role_aggregated / review_only | 3 | `specialization_owned_or_boundary_hold` | none established |
| 61 | create solutions to problems | role_aggregated / review_only | 2 | `exclude_or_boundary_hold` | none established |
| 62 | maintain relations with local representatives | role_aggregated / review_only | 2 | `task_specific_not_foundation` | none established |
| 63 | advise legislators | role_aggregated / review_only | 1 | `task_specific_not_foundation` | none established |
| 64 | maintain relationships with government agencies | role_aggregated / review_only | 2 | `task_specific_not_foundation` | none established |
| 65 | develop economic policies | role_aggregated / review_only | 2 | `task_specific_not_foundation` | none established |
| 66 | monitor national economy | role_aggregated / review_only | 1 | `task_specific_not_foundation` | none established |
| 67 | consider economic criteria in decision making | role_aggregated / review_only | 2 | `task_specific_not_foundation` | none established |
| 68 | social work theory | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 69 | legal requirements in the social sector | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 70 | social sciences | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 71 | action research | role_aggregated / review_only | 1 | `method_option_not_universal` | Social Research and Evaluation; Computational and Digital Social Science |
| 72 | social justice | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 73 | meet standards of practice in social services | role_aggregated / review_only | 1 | `exclude_from_domain_learning_path` | none established |
| 74 | apply quality standards in social services | role_aggregated / review_only | 1 | `exclude_from_domain_learning_path` | none established |
| 75 | psychological counselling methods | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 76 | biology | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 77 | pedagogy | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 78 | empirical analysis | role_aggregated / review_only | 3 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 79 | political science | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 80 | politics | role_aggregated / review_only | 3 | `specialization_owned_or_boundary_hold` | none established |
| 81 | political ideologies | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 82 | government policy | role_aggregated / review_only | 1 | `task_specific_not_foundation` | none established |
| 83 | organisational policies | role_aggregated / review_only | 2 | `task_specific_not_foundation` | none established |
| 84 | financial forecasting | role_aggregated / review_only | 1 | `useful_nonuniversal_or_specialization_owned` | none established |
| 85 | business analysis | role_aggregated / review_only | 2 | `exclude_or_boundary_hold` | none established |
| 86 | strategic planning | role_aggregated / review_only | 2 | `exclude_or_boundary_hold` | none established |
| 87 | market analysis | role_aggregated / review_only | 1 | `exclude_or_boundary_hold` | none established |
| 88 | company policies | role_aggregated / review_only | 2 | `task_specific_not_foundation` | none established |
| 89 | develop organisational policies | role_aggregated / review_only | 2 | `task_specific_not_foundation` | none established |
| 90 | genomics | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 91 | investigation research methods | role_aggregated / review_only | 1 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 92 | genealogy | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 93 | analyse legislation | role_aggregated / review_only | 1 | `task_specific_not_foundation` | none established |
| 94 | consult information sources | role_aggregated / review_only | 1 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 95 | conduct research interview | role_aggregated / review_only | 1 | `method_option_not_universal` | Social Research and Evaluation; Computational and Digital Social Science |
| 96 | write work related reports | role_aggregated / review_only | 1 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 97 | inspect data | role_aggregated / review_only | 1 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 98 | research family histories | role_aggregated / review_only | 1 | `specialization_owned` | none established |
| 99 | conduct qualitative research | role_aggregated / review_only | 1 | `method_option_not_universal` | Social Research and Evaluation; Computational and Digital Social Science |
| 100 | interpret pedigree charts | role_aggregated / review_only | 1 | `specialization_owned` | none established |
| 101 | communication | role_aggregated / review_only | 1 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 102 | use data processing techniques | role_aggregated / review_only | 2 | `specialization_owned_or_conditional` | Computational and Digital Social Science |
| 103 | mathematical modelling | role_aggregated / review_only | 2 | `useful_nonuniversal_or_specialization_owned` | Computational and Digital Social Science |
| 104 | algebra | role_aggregated / review_only | 1 | `useful_nonuniversal_or_specialization_owned` | Computational and Digital Social Science |
| 105 | monte carlo simulation | role_aggregated / review_only | 1 | `useful_nonuniversal_or_specialization_owned` | Computational and Digital Social Science |
| 106 | numerical sequences | role_aggregated / review_only | 1 | `useful_nonuniversal_or_specialization_owned` | Computational and Digital Social Science |
| 107 | phenomenology | role_aggregated / review_only | 1 | `method_option_not_universal` | Social Research and Evaluation; Computational and Digital Social Science |
| 108 | thanatology | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 109 | commercial law | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 110 | tax legislation | role_aggregated / review_only | 2 | `specialization_owned_or_boundary_hold` | none established |
| 111 | public finance | role_aggregated / review_only | 2 | `specialization_owned_or_boundary_hold` | none established |
| 112 | liaise with local authorities | role_aggregated / review_only | 1 | `task_specific_not_foundation` | none established |
| 113 | assess risk factors | role_aggregated / review_only | 1 | `exclude_or_boundary_hold` | none established |
| 114 | advise on legislative acts | role_aggregated / review_only | 1 | `task_specific_not_foundation` | none established |
| 115 | statistical modeling techniques | role_aggregated / review_only | 1 | `useful_nonuniversal_or_specialization_owned` | Computational and Digital Social Science |
| 116 | statistical analysis system software | role_aggregated / review_only | 1 | `useful_nonuniversal_or_specialization_owned` | Computational and Digital Social Science |
| 117 | data quality assessment | role_aggregated / review_only | 1 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 118 | data ethics | domain / approved | 2 | `useful_conditional_foundation` | Social Research and Evaluation; Computational and Digital Social Science |
| 119 | economic anthropology | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 120 | participant observation | role_aggregated / review_only | 1 | `method_option_not_universal` | Social Research and Evaluation; Computational and Digital Social Science |
| 121 | life sciences | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 122 | biometrics | role_aggregated / review_only | 1 | `useful_nonuniversal_or_specialization_owned` | Computational and Digital Social Science |
| 123 | multidisciplinary research | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 124 | computational biology | role_aggregated / review_only | 1 | `specialization_owned_or_conditional` | none established |
| 125 | data science | role_aggregated / review_only | 1 | `specialization_owned_or_conditional` | Computational and Digital Social Science |
| 126 | cadastral taxation | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 127 | corporate law | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 128 | public law | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 129 | geographic information systems | role_aggregated / review_only | 1 | `specialization_owned_or_conditional` | Computational and Digital Social Science |
| 130 | logic | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 131 | history of philosophy | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 132 | morality | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 133 | philosophy | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 134 | rhetoric | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 135 | philosophical schools of thought | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 136 | ethics | role_aggregated / review_only | 1 | `specialization_owned_or_boundary_hold` | none established |
| 137 | demography | role_aggregated / review_only | 1 | `useful_nonuniversal_or_specialization_owned` | Computational and Digital Social Science |

## Domain summary inventory dispositions

| # | Exact label | n metadata | Disposition | Possible area support |
|---:|---|---:|---|---|
| 1 | draft scientific or academic papers and technical documentation | 16 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 2 | scientific research methodology | 15 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 3 | manage research data | 14 | `useful_conditional_foundation` | Social Research and Evaluation; Computational and Digital Social Science |
| 4 | interact professionally in research and professional environments | 11 | `exclude_from_domain_learning_path` | none established |
| 5 | research design | 9 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 6 | statistics | 9 | `useful_nonuniversal_or_specialization_owned` | Computational and Digital Social Science |
| 7 | disseminate results to the scientific community | 7 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 8 | scientific literature | 7 | `specialization_owned_or_boundary_hold` | none established |
| 9 | mathematics | 6 | `useful_nonuniversal_or_specialization_owned` | Computational and Digital Social Science |
| 10 | operate open source software | 6 | `specialization_owned_or_conditional` | Computational and Digital Social Science |
| 11 | economics | 5 | `specialization_owned_or_boundary_hold` | none established |
| 12 | digital data processing | 4 | `specialization_owned_or_conditional` | Computational and Digital Social Science |
| 13 | geography | 4 | `specialization_owned_or_boundary_hold` | none established |
| 14 | government policy implementation | 4 | `task_specific_not_foundation` | none established |
| 15 | scientific modelling | 4 | `specialization_owned_or_conditional` | Computational and Digital Social Science |
| 16 | sociology | 4 | `specialization_owned_or_boundary_hold` | none established |
| 17 | advise on economic development | 3 | `task_specific_not_foundation` | none established |
| 18 | analyse economic trends | 3 | `task_specific_not_foundation` | none established |
| 19 | anthropology | 3 | `specialization_owned_or_boundary_hold` | none established |
| 20 | cultural geography | 3 | `specialization_owned_or_boundary_hold` | none established |
| 21 | empirical analysis | 3 | `cross_area_shared_in_research_routes` | Social Research and Evaluation; Computational and Digital Social Science |
| 22 | political economy | 3 | `specialization_owned_or_boundary_hold` | none established |
| 23 | politics | 3 | `specialization_owned_or_boundary_hold` | none established |
| 24 | psychology | 3 | `specialization_owned_or_boundary_hold` | none established |
| 25 | quantitative analysis | 3 | `useful_nonuniversal_or_specialization_owned` | Computational and Digital Social Science |
| 26 | analyse market financial trends | 2 | `task_specific_not_foundation` | none established |
| 27 | analyse recorded sources | 2 | `method_option_not_universal` | Social Research and Evaluation; Computational and Digital Social Science |
| 28 | apply statistical analysis techniques | 2 | `useful_nonuniversal_or_specialization_owned` | Computational and Digital Social Science |
| 29 | business analysis | 2 | `exclude_or_boundary_hold` | none established |
| 30 | business management principles | 2 | `exclude_or_boundary_hold` | none established |

## Candidate item decisions

The item records in the companion JSON contain the full per-item contract: identity, plain-language explanation, practical use, checkpoint, evidence locators, global/Nigeria scope, status, expected output, relationships/prerequisites, verified learning link and limitations. Items whose exact method tutorial was not verified are held and intentionally have no student link.

### Frame a researchable social question and choose a fitting design

- **Disposition/status:** `shared_foundation_for_research_routes` / `useful_shared_when_research_is_in_scope`
- **Learner explanation:** Research design is the plan connecting a question to information and methods that could answer it. For example, asking whether access to a bus route affects students’ attendance means deciding what attendance and access evidence would show before choosing how to collect it.
- **Expected output:** A short question, evidence plan and reasoned method choice; example is illustrative, not a prescribed study.
- **Possible area support:** Social Research and Evaluation, Computational and Digital Social Science
- **Evidence locators:** unesco_definition: definition of systematic study and varied methods; esrc_training: Annex II, pp. 24–25: link question, tools, method and interpretation; apsa_2024: printed p. 22: question-to-results research cycle; nuc_ccmas: printed p. 337: Nigerian course outcome proposal/data/report
- **Learning links:** [Open: Defining your research methodology](https://www.open.edu/openlearn/course/view.php?id=18286) (level: Level not stated; article is in a postgraduate research-proposal collection; access: Open access; free OpenLearn material; language: English; duration: Not stated; checked 2026-10-08)
- **Relationships/prerequisites:** guides_choice_of → quantitative, qualitative or mixed approach: Choose according to question/evidence; not cumulative.
- **Limits/scope:** Not every D078 job or activity conducts formal research.; The example is illustrative, not a factual claim about a specific Nigerian transport system.; ESRC is UK postgraduate guidance; NUC evidence is Nigeria-specific curriculum evidence. Global concept; Nigerian curriculum example separately labelled.

### Evaluate evidence and explain what it can and cannot show

- **Disposition/status:** `shared_foundation_for_research_routes` / `useful_shared_when_research_or_evidence_advice_is_in_scope`
- **Learner explanation:** Evidence appraisal means checking who produced information, how it was gathered, whether it fits the question, and what conclusions are fair. A survey of one school, for example, cannot automatically describe every school.
- **Expected output:** A brief source check and a conclusion that states a limitation; example is illustrative.
- **Possible area support:** Social Research and Evaluation, Computational and Digital Social Science
- **Evidence locators:** apsa_2024: printed p. 22: strengths/limits of methods and interpreting results; asa_learning: outcomes: evaluate published research and evidence; apa_guidelines: scientific inquiry and critical thinking learning goals
- **Learning links:** [Open: EPQs: finding and using evidence](https://www.open.edu/openlearn/course/view.php?id=17844) (level: EPQ/project research level; introductory evidence-finding; access: Open access; free OpenLearn material; language: English; duration: Not stated; checked 2026-10-08)
- **Relationships/prerequisites:** builds_on → research-question-design: A sound conclusion depends on whether evidence fits the question.
- **Limits/scope:** Introductory evidence checking is not a substitute for advanced systematic-review training.; Does not imply all D078 work has empirical data. Global professional/academic guidance.

### Plan research responsibly when people or sensitive data are involved

- **Disposition/status:** `conditional_shared_responsibility` / `conditional`
- **Learner explanation:** Research ethics means planning for consent, privacy, possible harm and fair treatment, then following the review and permission rules that apply before collecting information from people or using sensitive records.
- **Expected output:** A draft checklist identifying participant/data risks, permissions and protections; it is not approval to conduct a real study.
- **Possible area support:** Social Research and Evaluation, Computational and Digital Social Science
- **Evidence locators:** aaa_ethics: principles: avoid harm, openness, informed consent, records and relationships; apa_guidelines: ethical/social responsibility goals; nhrec_training: Nigeria: health-research ethics training scope; nhrec_trree: TRREE/CITI context for NHREC applications
- **Learning links:** [Open: Becoming an ethical researcher](https://www.open.edu/openlearn/education-development/becoming-ethical-researcher) (level: Introductory course; provider page does not state a formal level; access: Open access; free OpenLearn material; language: English; duration: Not stated; checked 2026-10-08)
- **Relationships/prerequisites:** applies_across → research involving people or identifiable/sensitive data: Applies across methods and stages; not a method-specific badge.
- **Limits/scope:** NHREC applies to health research/NHREC processes, not every social-science study.; Local law and institutional review must be checked for each project. Global ethics principles; Nigeria health-research rules explicitly bounded.

### Communicate findings for the intended audience

- **Disposition/status:** `shared_foundation_for_research_routes` / `useful_shared_when_findings_are_shared`
- **Learner explanation:** Explain what the evidence suggests, how it was gathered and what remains uncertain. The same study might need a detailed report for researchers and a shorter brief for a community or decision-maker.
- **Expected output:** A short evidence summary with one finding, its basis and one limitation.
- **Possible area support:** Social Research and Evaluation, Computational and Digital Social Science
- **Evidence locators:** apsa_2024: printed p. 22: display, interpret and communicate results; asa_learning: sociology communication and writing outcomes; niser_policy: Nigerian example of policy-brief output; nuc_ccmas: printed p. 337: report writing
- **Learning links:** [Open: Essay and report writing skills: drafting reports](https://www.open.edu/openlearn/education-development/essay-and-report-writing-skills/content-section-7.2) (level: Level not stated; access: Open access; free OpenLearn material; language: English; duration: Not stated; checked 2026-10-08)
- **Relationships/prerequisites:** depends_on → evaluate-evidence-and-limits: The explanation must not claim more than the evidence supports.
- **Limits/scope:** Reports, articles, presentations and briefs are alternatives chosen for audience/purpose, not a mandatory set.; NISER is one Nigerian institution, not a universal work setting. Global; Nigerian example labelled.

### Organise and protect research information when a project uses data

- **Disposition/status:** `useful_conditional_foundation` / `conditional`
- **Learner explanation:** Research-data management means naming, documenting, storing and sharing information carefully so that it can be understood and protected. For example, a project may keep a codebook explaining what each survey column means while limiting access to identifying details.
- **Expected output:** A simple file plan and short data note/codebook; example is illustrative.
- **Possible area support:** Social Research and Evaluation, Computational and Digital Social Science
- **Evidence locators:** cessda_rdm: data-management life cycle, planning to publication; ukds_data_skills: modules for existing/owned data and ethical sourcing; aaa_ethics: protect records/relationships; nuc_ccmas: printed p. 337: collect and organise data
- **Learning links:** [Open: Research Data Management in the Social Sciences](https://www.cessda.eu/Training/Training-Resources/Resource-crd-4767) (level: Researcher/trainer webinar; level not stated; access: Public training resource page; price and sign-in terms not stated; language: English (page/resource language); duration: Not stated; checked 2026-10-08); [Open: Data Skills Modules](https://ukdataservice.ac.uk/learning-hub/data-skills-modules/) (level: Introductory interactive modules; access: Free interactive modules; some additional material via Moodle; language: English; duration: Varies by module; check page; checked 2026-10-08)
- **Relationships/prerequisites:** supports → quantitative, qualitative, survey, interview and secondary-data projects: Specific practices depend on type, sensitivity, consent, repository and jurisdiction.
- **Limits/scope:** Not every D078 route handles research datasets.; European/UK guidance must be adapted to Nigerian law and institutional policy. Global principles; European/UK operational sources; Nigeria-specific law not inferred.

### Quantitative methods (working with numbers)

- **Disposition/status:** `method_choice_not_shared_requirement` / `optional_route_choice`
- **Learner explanation:** Quantitative research uses numbers to describe or compare patterns—for example, counting how often students report using a library. The design and sample determine what the numbers can support.
- **Expected output:** A small, clearly labelled table or chart with a cautious interpretation; illustrative practice only.
- **Possible area support:** Social Research and Evaluation, Computational and Digital Social Science
- **Evidence locators:** unesco_definition: varied quantitative and qualitative methods; esrc_training: Annex II, pp. 24–25: justify quantitative/qualitative choices; apsa_2024: printed p. 22: observational statistics among methods; nuc_ccmas: printed p. 337: appropriate statistics in a named Nigerian course
- **Learning links:** [Open: Getting started with Jamovi](https://www.open.edu/openlearn/health-sports-psychology/getting-started-jamovi/content-section-0/) (level: Level 1 beginner course; access: Open access; free; language: English; duration: About 8 hours, as stated by provider; checked 2026-10-08); [Open: Data Skills Modules](https://ukdataservice.ac.uk/learning-hub/data-skills-modules/) (level: Introductory interactive modules; access: Free interactive modules; some additional material via Moodle; language: English; duration: Varies by module; check page; checked 2026-10-08)
- **Relationships/prerequisites:** alternative_to → qualitative approach: Different evidence needs; not a sequence.; may_complement → qualitative approach: Mixed methods only when justified by the question/design.
- **Limits/scope:** Statistics and software are not universally needed across D078.; A chart or statistical output does not establish causality. Global method; NUC curriculum is Nigeria-specific example.

### Qualitative methods (working with words, observations and meaning)

- **Disposition/status:** `method_choice_not_shared_requirement` / `optional_route_choice`
- **Learner explanation:** Qualitative research studies meanings, experiences and context using material such as interview answers, observations or documents. It can explain how people describe an issue, but a few interviews do not by themselves show how common a view is.
- **Expected output:** A small set of coded excerpts with a clear explanation of how they address a question; practice only with permitted or fictional material.
- **Possible area support:** Social Research and Evaluation, Computational and Digital Social Science
- **Evidence locators:** unesco_definition: qualitative and quantitative as varied methods; apsa_2024: printed p. 22: interviews, case studies and content analysis; asa_learning: qualitative methods outcomes; openlearn_interviews: course sections on interview preparation and conduct
- **Learning links:** [Open: Conducting qualitative interviews: an introduction](https://www.open.edu/openlearn/education-development/conducting-qualitative-interviews-introduction/content-section-0) (level: Introductory, as titled by provider; access: Open access; free OpenLearn material; language: English; duration: Not stated; checked 2026-10-08); [Open: Getting started with Taguette](https://www.taguette.org/getting-started.html) (level: Introductory product walkthrough; access: Public tutorial; Taguette itself is free/open-source; language: English; duration: Self-paced; not stated; checked 2026-10-08)
- **Relationships/prerequisites:** alternative_to → quantitative approach: Not cumulative.; may_complement → quantitative approach: Combine only when justified.
- **Limits/scope:** Qualitative methods are not one single technique.; Taguette supports document coding but does not make an interpretation valid. Global research concepts.

### Mixed methods (combining numerical and qualitative evidence when justified)

- **Disposition/status:** `method_choice_not_shared_requirement` / `optional_specialist_or_project_choice`
- **Learner explanation:** Mixed methods deliberately combine numerical evidence with words, observations or documents so one kind of evidence can answer a different part of the question. It is not simply collecting many kinds of data without a plan.
- **Expected output:** A brief plan showing which sub-question each kind of evidence answers and how results will be brought together.
- **Possible area support:** Social Research and Evaluation, Computational and Digital Social Science
- **Evidence locators:** openlearn_methodology: methodology and mixed-method sections; esrc_training: Annex II: method choice linked to question; unesco_definition: methodological diversity
- **Learning links:** [Open: Defining your research methodology](https://www.open.edu/openlearn/course/view.php?id=18286) (level: Level not stated; article is in a postgraduate research-proposal collection; access: Open access; free OpenLearn material; language: English; duration: Not stated; checked 2026-10-08)
- **Relationships/prerequisites:** combines → quantitative and qualitative approaches: A design choice, not a requirement to learn every method.
- **Limits/scope:** Adds planning and integration work; not automatically stronger than one suitable method. Global.

### Surveys and questionnaire design

- **Disposition/status:** `method_choice_not_shared_requirement` / `optional_method_choice`
- **Learner explanation:** A survey asks people a planned set of questions so answers can be compared. Clear wording, suitable response options, testing and sampling matter; a survey form alone does not make results representative.
- **Expected output:** A short draft questionnaire with a pretest plan; use fictional/sample respondents unless the needed permissions and review are in place.
- **Possible area support:** Social Research and Evaluation, Computational and Digital Social Science
- **Evidence locators:** apsa_2024: printed p. 22: surveys and method teaching; pew_survey: question development, wording, order and pretesting; aapor: sampling, questionnaire design, pretesting, transparency
- **Learning links:** [Open: Writing Survey Questions](https://www.pewresearch.org/writing-survey-questions/) (level: Self-directed professional methods resource; learner level not stated; access: Public webpage; no course enrollment stated; language: English; duration: Self-paced; not stated; checked 2026-10-08); [Open: KoboToolbox Essentials](https://academy.kobotoolbox.org/courses/essentials) (level: Beginner/no prerequisites, as stated by provider; access: Free, online and self-paced; course completion certificate after quizzes; language: English; provider also lists a French version; duration: 3 hours; 11 modules; checked 2026-10-08)
- **Relationships/prerequisites:** alternative_to_or_complements → interviews, observation or existing data: Choose based on the question; combination must be justified.
- **Limits/scope:** Pew examples are U.S.-focused; adapt language and context.; Kobo teaches tool operation, not sampling or questionnaire validity. Global methods; examples/tool not Nigeria-specific.

### Interviews

- **Disposition/status:** `method_choice_not_shared_requirement` / `optional_method_choice`
- **Learner explanation:** An interview is a planned conversation for learning how someone understands or experiences an issue. It can add depth, but does not automatically measure how common an experience is.
- **Expected output:** A draft topic guide and an explanation of how each question relates to the study question; do not interview real people without approval/permissions.
- **Possible area support:** Social Research and Evaluation, Computational and Digital Social Science
- **Evidence locators:** apsa_2024: printed p. 22: interviews as one commonly deployed method; openlearn_interviews: intro and course outcomes; aaa_ethics: informed consent and avoiding harm
- **Learning links:** [Open: Conducting qualitative interviews: an introduction](https://www.open.edu/openlearn/education-development/conducting-qualitative-interviews-introduction/content-section-0) (level: Introductory, as titled by provider; access: Open access; free OpenLearn material; language: English; duration: Not stated; checked 2026-10-08)
- **Relationships/prerequisites:** may_complement → survey: Interviews can explore explanations behind patterns if design justifies it.
- **Limits/scope:** Interview answers are context-dependent; do not generalize prevalence from a small purposive group. Global.

### Document and content analysis

- **Disposition/status:** `method_choice_not_shared_requirement` / `optional_method_choice`
- **Learner explanation:** Document/content analysis uses a planned way to examine texts or records—for example, comparing how a policy describes access across editions. The material and coding rules must fit the question.
- **Expected output:** A small code/category list and a documented sample analysis using public or fictional documents.
- **Possible area support:** Social Research and Evaluation, Computational and Digital Social Science
- **Evidence locators:** apsa_2024: printed p. 22: content analysis among methods; taguette_tutorial: highlight/tag/export workflow for document material; taguette_tutorial: tool is for qualitative document tagging, not full methodology
- **Learning links:** [Open: Getting started with Taguette](https://www.taguette.org/getting-started.html) (level: Introductory product walkthrough; access: Public tutorial; Taguette itself is free/open-source; language: English; duration: Self-paced; not stated; checked 2026-10-08)
- **Relationships/prerequisites:** alternative_to → interview, survey or observation: Different evidence source; may complement other methods.
- **Limits/scope:** The software does not supply valid categories or interpretation. Global.

### Observation and ethnographic approaches

- **Disposition/status:** `method_choice_not_shared_requirement` / `optional_research_route_method`
- **Learner explanation:** Observation records what happens in a setting; ethnographic approaches study practices and meaning in context over time. For example, a researcher might observe how people use a public service, then keep field notes about what happened and the setting. Work with real people needs a clear purpose, permission and safeguards.
- **Expected output:** A short observation guide and sample field notes from a public/fictional scenario, with a reflection on what the researcher could and could not conclude.
- **Possible area support:** Social Research and Evaluation
- **Evidence locators:** unesco_isced_detail: field 0314 sociology/anthropology field boundaries; aaa_ethics: informed consent, openness and avoiding harm; esrc_training: method depth varies by discipline; openlearn_social_participation: section lines 168–182: participant interactions and named social research methods, including ethnographic observation; openlearn_ethnography: section/transcript lines 83–119: ethnographic practice, researcher position, observation and field notes
- **Learning links:** [Open: Social science and participation: Participating in social science](https://www.open.edu/openlearn/society-politics-law/social-science-and-participation/content-section-4) (level: Level 2: Intermediate, as stated by provider; access: Free OpenLearn course; account/sign-in for course completion record; language: English; duration: 10 hours, as stated by provider; checked 2026-10-08); [Open: Empowering methodologies: Ethnography, self and intersubjectivity](https://www.open.edu/openlearncreate/mod/oucontent/view.php?id=149002&section=2) (level: Level 3: Advanced, as stated by provider; access: Free OpenLearn Create material; some interactive functionality requires free account; language: English; duration: 10 hours, as stated by provider; checked 2026-10-08)
- **Relationships/prerequisites:** alternative_to → survey or interview: A different evidence route; observation can complement them when the question needs context about what happens, not only what people report.
- **Limits/scope:** Not needed for every social-science path; observation and ethnography vary by discipline, purpose and setting.; The OpenLearn ethnography resource is Level 3 advanced and organisationally situated; the Level 2 course section is broader but not comprehensive fieldwork training.; Do not observe people covertly or treat a practice example as permission to conduct real-world research. Global; conditional method choice across relevant research areas.

### Find and assess existing social data

- **Disposition/status:** `useful_conditional_foundation` / `useful_when_existing_data_fits`
- **Learner explanation:** Secondary data are information collected earlier for another purpose. Before reusing it, check who collected it, what was measured, which people are included, how recent it is and whether reuse is allowed.
- **Expected output:** A short data-source note stating source, population, date, measure and limits.
- **Possible area support:** Social Research and Evaluation, Computational and Digital Social Science
- **Evidence locators:** ukds_data_skills: intro modules for survey/longitudinal/aggregate data; apsa_2024: printed p. 22: discover pre-existing data; nbs_social_stats: Nigeria example of public social-statistical tables
- **Learning links:** [Open: Data Skills Modules](https://ukdataservice.ac.uk/learning-hub/data-skills-modules/) (level: Introductory interactive modules; access: Free interactive modules; some additional material via Moodle; language: English; duration: Varies by module; check page; checked 2026-10-08)
- **Relationships/prerequisites:** alternative_to → collecting new survey/interview data: Existing data may reduce collection but may not answer the question or be reusable.
- **Limits/scope:** UKDS examples are UK/service-specific; NBS document is dated and must not be treated as current statistics. Global concept; Nigeria example explicitly local.

### Computational and digital social-research methods

- **Disposition/status:** `specialization_owned` / `optional_specialization_route`
- **Learner explanation:** Computational social research uses suitable digital or large-scale data and computational techniques to investigate social questions. For example, network analysis can study patterns of connections, while text analysis can examine recurring themes in a collection of posts or documents. The method must fit the question and data; privacy, bias and limits still matter.
- **Expected output:** A small analysis plan naming one social question, a suitable practice dataset, a computational method and the limits of the result.
- **Possible area support:** Computational and Digital Social Science
- **Evidence locators:** ucsd_css: program overview: computational methods address social questions; ucsd_css_curriculum: specialist graduate curriculum includes programming/statistics/ML; cornell_css: lines 26–28: network, sequence and topic modelling examples; computational_method_inventory: D078 method records; discovery-only; edinburgh_css_course: course outcomes lines 3–10 and outline lines 11–27: social questions, computational method choice, text/network data, ethics, bias, communication and labs; edinburgh_css_labs: lines 0–15: hands-on lab topics include data processing/visualisation, networks and text analysis
- **Learning links:** [Open: Understanding Society with Big Data: Computational Social Science](https://opencourse.inf.ed.ac.uk/css) (level: Not stated on course page; university course materials with lectures, labs and tutorials; access: Public course page/material links; price and reuse license not stated; language: English; duration: Not stated; checked 2026-10-08); [Open: Computational Social Science: Labs](https://opencourse.inf.ed.ac.uk/css/labs) (level: Not stated by provider; university course lab materials; access: Public lab index and linked files; all rights reserved, reuse permission not implied; language: English; duration: Not stated; checked 2026-10-08)
- **Relationships/prerequisites:** specializes → research-question-design: Specialist branch; not required alongside qualitative/non-computational routes.; has_alternatives → non-computational qualitative, survey and secondary-data routes: Choose by question and evidence, not prestige.
- **Limits/scope:** Computational research is a recognized specialist path, not a synonym for all D078.; The Edinburgh pages provide a course outline and linked labs but do not state price or learner level; all rights are reserved and reuse is not implied.; UCSD and Cornell are U.S. examples, not evidence of Nigerian demand or entry requirements.; Social network analysis, sequence analysis, text mining and models are not interchangeable; verify each candidate method independently.; The computational-modelling source in the local discovery inventory returned 403; that specific claim remains unverified. Game theory is explicitly marked not inherently computational. Global field; no Nigerian demand claim established.

### Computational and digital social-research methods

- **Disposition/status:** `specialization_owned` / `optional_specialization_route`
- **Learner explanation:** Computational social research uses suitable digital or large-scale data and computational techniques to investigate social questions. For example, network analysis can study patterns of connections, while text analysis can examine recurring themes in a collection of posts or documents. The method must fit the question and data; privacy, bias and limits still matter.
- **Expected output:** A small analysis plan naming one social question, a suitable practice dataset, a computational method and the limits of the result.
- **Possible area support:** Computational and Digital Social Science
- **Evidence locators:** ucsd_css: program overview: computational methods address social questions; ucsd_css_curriculum: specialist graduate curriculum includes programming/statistics/ML; cornell_css: lines 26–28: network, sequence and topic modelling examples; computational_method_inventory: D078 method records; discovery-only; edinburgh_css_course: course outcomes lines 3–10 and outline lines 11–27: social questions, computational method choice, text/network data, ethics, bias, communication and labs; edinburgh_css_labs: lines 0–15: hands-on lab topics include data processing/visualisation, networks and text analysis; national_academies_social_models: chapter 7 lines 642–645: computational simulation and ABM are methods for exploring social processes
- **Learning links:** [Open: Understanding Society with Big Data: Computational Social Science](https://opencourse.inf.ed.ac.uk/css) (level: Not stated on course page; university course materials with lectures, labs and tutorials; access: Public course page/material links; price and reuse license not stated; language: English; duration: Not stated; checked 2026-10-08); [Open: Computational Social Science: Labs](https://opencourse.inf.ed.ac.uk/css/labs) (level: Not stated by provider; university course lab materials; access: Public lab index and linked files; all rights reserved, reuse permission not implied; language: English; duration: Not stated; checked 2026-10-08)
- **Relationships/prerequisites:** specializes → research-question-design: Specialist branch; not required alongside qualitative/non-computational routes.; has_alternatives → non-computational qualitative, survey and secondary-data routes: Choose by question and evidence, not prestige.
- **Limits/scope:** Computational research is a recognized specialist path, not a synonym for all D078.; The Edinburgh pages provide a course outline and linked labs but do not state price or learner level; all rights are reserved and reuse is not implied.; UCSD and Cornell are U.S. examples, not evidence of Nigerian demand or entry requirements.; Social network analysis, sequence analysis, text mining and models are not interchangeable; verify each candidate method independently. Global field; no Nigerian demand claim established.

### Agent-based modelling of social processes

- **Disposition/status:** `specialization_owned` / `optional_specialist_method`
- **Learner explanation:** Agent-based modelling (ABM) is a computer simulation in which represented people, groups or organisations follow stated rules and interact. Researchers can explore how those interactions might produce wider patterns—for example, how communication rules could affect the spread of an idea. A simulation is a simplified model, not proof that real people will behave exactly that way.
- **Expected output:** A small, clearly labelled toy model or model plan naming the agents, behaviour rules, assumptions, outcome to observe and limits; use invented or public data for practice.
- **Possible area support:** Computational and Digital Social Science
- **Evidence locators:** national_academies_social_models: chapter 7 lines 642–645: definition, interacting agents, social-process uses and representational limits; gmu_css_catalog: graduate CSS course descriptions identify agent-based models as one computational social-science method; ncrm_agent_based_modelling: course blocks 1–3 cover ABM, analysis, data quality, documentation and provenance
- **Learning links:** [Open: Agent-based modelling for social research](https://repository.ncrm.ac.uk/resources/online/ABM_index.php) (level: Advanced/researcher level; aimed particularly at PhD students and early-career researchers, as stated by provider; access: Public video/resource repository; price and reuse/license terms not stated; language: English; duration: Three blocks of videos; total duration not stated; checked 2026-10-08)
- **Relationships/prerequisites:** specializes → computational-social-research: One modelling approach within computational social research, not a synonym for every computational method.; alternative_to → observational, survey, interview or statistical approaches: Use a simulation when the question concerns interactions or mechanisms that can be represented and explored; it does not replace empirical evidence.
- **Limits/scope:** A recognized specialist method, not a shared D078 requirement.; The National Academies example is in hazards/disaster research; the NCRM learning resource targets advanced researchers.; Models depend on assumptions and need verification, validation, sensitivity analysis and clear documentation; simulation output alone is not empirical confirmation.; Do not describe agent-based modelling as equivalent to all computational modelling. Global specialist method; no Nigerian requirement or demand claim established.

### Spatial analysis and mapping with suitable social data

- **Disposition/status:** `specialization_owned` / `optional_specialization_choice`
- **Learner explanation:** Spatial analysis looks at how places and distances relate to a social question—for example, comparing public-service locations with population distribution. A map can mislead if data coverage, boundaries or scale are unsuitable.
- **Expected output:** A simple map or spatial comparison with a note on data source, area and limits.
- **Possible area support:** Computational and Digital Social Science
- **Evidence locators:** unesco_isced_detail: field 0314 includes human/social/economic geography, distinguishes physical geography; qgis_training: basic vector analysis lesson: state problem, get data, analyze, present
- **Learning links:** [Open: QGIS Training Manual](https://docs.qgis.org/3.44/en/docs/training_manual/index.html) (level: Basic through advanced lessons; linked vector-analysis lesson marked basic; access: Open training manual; QGIS is free/open-source; language: English; duration: Manual describes materials for a five-day course; this link is a self-paced manual; checked 2026-10-08)
- **Relationships/prerequisites:** used_for → human/social geography or location-based policy questions: Only when place is analytically relevant.
- **Limits/scope:** Specific spatial topic needs area-level review; keep out of shared foundation. Global tool/method.

### Choose a quantitative analysis tool that fits the task

- **Disposition/status:** `optional_tool_choices_not_foundation` / `optional_route_choice`
- **Learner explanation:** Jamovi and R are possible tools for organising and analysing numerical data. Jamovi offers a graphical introduction; R supports a programmable workflow. Neither decides which analysis is valid, and learners need not learn both for one task.
- **Expected output:** A small reproducible table/chart and a note explaining the selected analysis and limits.
- **Possible area support:** Computational and Digital Social Science
- **Evidence locators:** openlearn_jamovi: Level 1, 8-hour Jamovi course; r4ds: R import/transform/visualize chapters; ucsd_css_curriculum: programming/statistics within specialist CSS program
- **Learning links:** [Open: Getting started with Jamovi](https://www.open.edu/openlearn/health-sports-psychology/getting-started-jamovi/content-section-0/) (level: Level 1 beginner course; access: Open access; free; language: English; duration: About 8 hours, as stated by provider; checked 2026-10-08); [Open: R for Data Science (2e), Introduction](https://r4ds.hadley.nz/intro) (level: Introductory data workflow; assumes some basic context, no formal level stated; access: Open online book; language: English; duration: Self-paced; not stated; checked 2026-10-08)
- **Relationships/prerequisites:** alternative_to → another suitable statistical package or non-computational analysis: Alternatives are choices, not cumulative requirements.
- **Limits/scope:** Jamovi course is global and free, but software training is not statistical certification.; R4DS is not a social-science methods course. Global tools; no Nigeria-specific software rule.

### KoboToolbox for electronic form collection

- **Disposition/status:** `optional_tool_not_foundation` / `optional_task_specific`
- **Learner explanation:** KoboToolbox can build and deploy forms and collect/manage responses. It helps carry out a planned survey or field form; it does not decide sampling, question quality or what answers mean.
- **Expected output:** A test form and sample export using fictional data.
- **Possible area support:** Social Research and Evaluation, Computational and Digital Social Science
- **Evidence locators:** kobo_essentials: official free 3-hour 11-module course and form/data workflow; pew_survey: questionnaire design is separate from tool operation
- **Learning links:** [Open: KoboToolbox Essentials](https://academy.kobotoolbox.org/courses/essentials) (level: Beginner/no prerequisites, as stated by provider; access: Free, online and self-paced; course completion certificate after quizzes; language: English; provider also lists a French version; duration: 3 hours; 11 modules; checked 2026-10-08)
- **Relationships/prerequisites:** supports → survey or structured field data collection: Tool choice follows method and project constraints.
- **Limits/scope:** Course certificate proves product-course completion only; not a research qualification or survey competence. Global tool; free course; English/French listed by provider.

### Taguette for highlighting and coding documents

- **Disposition/status:** `optional_tool_not_foundation` / `optional_task_specific`
- **Learner explanation:** Taguette lets a learner highlight passages in documents, attach codes and retrieve coded excerpts. The researcher still decides what the codes mean and whether the interpretation is justified.
- **Expected output:** A short codebook and tagged sample using public or fictional text.
- **Possible area support:** Social Research and Evaluation, Computational and Digital Social Science
- **Evidence locators:** taguette_tutorial: official walkthrough: project, documents, highlights/tags, export; taguette_tutorial: FAQ/product page: free and open source
- **Learning links:** [Open: Getting started with Taguette](https://www.taguette.org/getting-started.html) (level: Introductory product walkthrough; access: Public tutorial; Taguette itself is free/open-source; language: English; duration: Self-paced; not stated; checked 2026-10-08)
- **Relationships/prerequisites:** alternative_to → manual coding or another suitable qualitative tool: No need to adopt a tool for small/simple tasks.
- **Limits/scope:** A tool does not validate a method or interpretation. Global; free/open-source as stated by project.

### Gephi for visualising relationship data

- **Disposition/status:** `specialization_owned_tool` / `optional_specialization_choice`
- **Learner explanation:** Gephi can turn a table of connections into a network picture and calculate selected network measures. For example, links between organisations can be visualised; the picture alone does not prove influence or causation.
- **Expected output:** A clearly labelled network diagram from sample data with a note about what ties mean.
- **Possible area support:** Computational and Digital Social Science
- **Evidence locators:** gephi_quickstart: official quick start: source-target data, layout and metrics; computational_method_evidence: D078 social network analysis record
- **Learning links:** [Open: Gephi Quick Start](https://gephi.org/quickstart/) (level: Getting-started/introductory quick start; access: Public tutorial; Gephi is free/open-source; language: English; duration: Not stated; checked 2026-10-08)
- **Relationships/prerequisites:** used_for → social network analysis: Only for relationship/network questions.
- **Limits/scope:** Visualization is not inference; interpretation requires method training. Global tool.

### No universal D078 professional certification established

- **Disposition/status:** `no_domain_wide_certification` / `not_established`
- **Learner explanation:** The sources do not establish one certificate every learner in Social Sciences & Behavioural Research must obtain. A course-completion certificate is not the same as a professional licence or qualification.
- **Expected output:** No credential selected by default; only add a specific certificate when an exact area, task, awarding body and jurisdiction establish its relevance.
- **Possible area support:** none established
- **Evidence locators:** esrc_training: training competency framework, not one universal credential; nuc_ccmas: Nigeria undergraduate standards/course outcomes, not domain-wide professional certificate; nhrec_training: Nigeria health-research ethics training can certify in a bounded context; kobo_essentials: tool-specific completion certificate only
- **Learning links:** [Open: Ethics Training](https://nhrec.gov.ng/services/ethics-training/) (level: Researcher/ethics training; formal level not stated; access: NHREC describes online modules; some routes/credentials may require course registration; language: English; duration: Varies/not stated; checked 2026-10-08); [Open: KoboToolbox Essentials](https://academy.kobotoolbox.org/courses/essentials) (level: Beginner/no prerequisites, as stated by provider; access: Free, online and self-paced; course completion certificate after quizzes; language: English; provider also lists a French version; duration: 3 hours; 11 modules; checked 2026-10-08)
- **Relationships/prerequisites:** conditional_only → NHREC/TRREE health research process or Kobo product course: Nigeria health-research context and tool training respectively; neither universal D078 credential.
- **Limits/scope:** Do not call attendance/completion proof a professional qualification unless the awarding body and recognition establish that.; No credential requirement is inferred for Nigeria generally. Global absence of established universal requirement; narrow Nigeria health-research condition.

### Excel for organizing and summarising structured data

- **Disposition/status:** `optional_cross_area_tool_not_foundation` / `useful_when_tabular_work_fits`
- **Learner explanation:** Excel can help organize a small table, check or filter entries, calculate simple summaries, and make charts. For example, a learner might summarize fictional survey responses by age group. Excel does not decide whether a survey sample is fair or whether a statistical conclusion is justified.
- **Expected output:** A clearly labelled practice table with checked entries, one summary or PivotTable, and a chart or note explaining what the summary does and does not show.
- **Possible area support:** Social Research and Evaluation, Computational and Digital Social Science
- **Evidence locators:** excel_import_analyze: Microsoft Support documents tables, sorting/filtering, charts, importing and PivotTables; ukds_data_skills: introductory learning modules for survey, longitudinal and aggregate data
- **Learning links:** [Open: Import and analyze data in Excel](https://support.microsoft.com/en-us/excel/import-and-analyze-data) (level: Self-directed product documentation; no formal learner level; access: Public Microsoft Support documentation; Excel feature availability varies by version/license; language: English; duration: Self-paced; not stated; checked 2026-10-08)
- **Relationships/prerequisites:** alternative_to → paper/manual summaries, Jamovi, SPSS, R or other suitable data tools: Choose according to dataset size, analysis, access, privacy and reproducibility needs; do not require multiple tools.
- **Limits/scope:** Optional convenience tool, not a D078-wide competency requirement.; Excel supports data handling and summaries but is not a substitute for research design, statistical reasoning or secure data governance.; Desktop feature availability and licensing vary by version and institution. Global commercial product documentation; no Nigeria-specific software requirement established.

### SPSS for statistical analysis when the project calls for it

- **Disposition/status:** `specialization_owned_tool` / `optional_quantitative_route_choice`
- **Learner explanation:** SPSS is software for preparing and analysing structured data—for example, producing a frequency table or testing a relationship between measured variables. The researcher still chooses a method that fits the question, checks its assumptions and explains the result; SPSS does not make an analysis valid by itself.
- **Expected output:** A simple analysis of sample or fictional data, with a saved output table/chart and a plain-language explanation of the procedure and its limits.
- **Possible area support:** Computational and Digital Social Science
- **Evidence locators:** ibm_spss_resources: official new-user materials for sample data, descriptive statistics and charts; ibm_spss_essentials: IBM Essentials course covers reading/preparing data, analysis and presentation for new users; ibm_spss_pricing: IBM describes trial, subscriptions, academic/student routes and region-dependent availability
- **Learning links:** [Open: Resources for IBM SPSS Statistics](https://www.ibm.com/products/spss-statistics/resources) (level: Includes getting-started material for new users; exact level varies by linked tutorial; access: Public IBM resources; software trial/subscription terms apply; language: English; duration: Varies by resource; checked 2026-10-08); [Open: IBM SPSS Statistics Essentials](https://www.ibm.com/training/course/ibm-spss-statistics-essentials-v26-0K53BG) (level: For new users, as stated by provider; access: IBM course page public; instruction may be delivered by external paid providers; language: English; duration: Not stated; checked 2026-10-08)
- **Relationships/prerequisites:** alternative_to → Jamovi, R or another package supported by the project/institution: SPSS is one software option; do not require it alongside alternatives.
- **Limits/scope:** Optional, not a shared D078 foundation or a method in itself.; IBM licensing/trial and student availability vary; learners should first check institutional access and current local terms.; A software-generated output is not automatically a correct interpretation. Global commercial software; no Nigerian-wide institutional access claim established.

### NVivo for organizing and coding substantial qualitative material

- **Disposition/status:** `specialization_owned_tool` / `optional_qualitative_route_choice`
- **Learner explanation:** NVivo helps researchers organize qualitative material such as interview transcripts and open-ended responses, attach codes to passages, retrieve coded sections and keep analytic notes. For a small project, careful manual coding or a free tool may be enough; NVivo does not choose a sound method or discover valid themes on its own.
- **Expected output:** A small codebook, a few coded fictional/public passages and a memo explaining how the codes relate to the question.
- **Possible area support:** Social Research and Evaluation
- **Evidence locators:** nvivo_coding_guide: Lumivero beginner-friendly guide demonstrates coding, coding stripes, autocoding and memos; nvivo_licensing: vendor store lists paid annual and one-time licenses and a student route; verify local price/access; taguette_tutorial: open-source alternative for document highlighting/tagging
- **Learning links:** [Open: Essential qualitative coding techniques in NVivo](https://lumivero.com/resources/blog/essential-qualitative-coding-techniques-nvivo/) (level: Beginner-friendly, as described by provider; access: Public vendor article/video resource; no fee stated for the article; NVivo product requires a license; language: English; duration: Not stated; checked 2026-10-08); [Open: Getting started with Taguette](https://www.taguette.org/getting-started.html) (level: Introductory product walkthrough; access: Public tutorial; Taguette itself is free/open-source; language: English; duration: Self-paced; not stated; checked 2026-10-08)
- **Relationships/prerequisites:** alternative_to → manual coding, Taguette or another suitable qualitative analysis tool: Select one workflow appropriate to project scale, collaboration and access; alternatives are not cumulative.
- **Limits/scope:** Optional software, not a D078-wide requirement.; NVivo is licensed/commercial; cost and institutional access should be checked before selecting it.; The cited NVivo tutorial is vendor-authored and teaches product workflow, not the complete method of qualitative analysis.; Small/simple projects may not need dedicated software. Global product; no Nigerian institutional-access assumption.

### pandas for cleaning and combining tabular research data

- **Disposition/status:** `optional_computational_route_tool` / `useful_for_python_tabular_work_not_shared_requirement`
- **Learner explanation:** pandas is a Python library for working with tables, such as survey answers or public statistics. It can help read files, check and change columns, summarize values, and combine tables. It does not decide whether the questions, sample or conclusions are sound.
- **Expected output:** A reproducible notebook that reads a permitted practice dataset, documents cleaning decisions, produces a summary table, and records limitations.
- **Possible area support:** Computational and Digital Social Science
- **Evidence locators:** pandas_tutorials: official tutorials for tabular data import, selection, summaries, reshaping and joining; ukds_data_skills: survey and secondary-data learning context
- **Learning links:** [Open: Getting started tutorials](https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html) (level: Beginner entry tutorials; basic Python assumed by code examples; access: Public documentation; open-source library; language: English; duration: Self-paced; not stated; checked 2026-10-08)
- **Relationships/prerequisites:** requires → Python basics: pandas is a Python package; it is not a separate programming language.; alternative_to → Excel, Jamovi, SPSS, R or SQL for suitable tabular tasks: Choose based on dataset, task, reproducibility, access and learner route; do not make all tools cumulative.; complements → Matplotlib: pandas can prepare/summarize data; Matplotlib can create plots when a chart is useful.
- **Limits/scope:** Conditional/optional computational tool, not a shared D078 foundation.; A software operation does not establish valid measurement, sampling, causal inference or interpretation.; Use only data that may lawfully and ethically be accessed; training should use fictional or public data. Global open-source library; no Nigeria-specific software requirement established.

### Matplotlib for creating Python charts

- **Disposition/status:** `optional_computational_route_tool` / `useful_when_programmatic_plotting_fits`
- **Learner explanation:** Matplotlib is a Python library for making charts. For example, a researcher can turn a checked table into a labelled chart that helps readers compare groups or values. The chart still needs accurate data, a fair scale and a clear explanation.
- **Expected output:** One clearly labelled chart made from a permitted practice dataset, with a short note about the comparison and what it cannot show.
- **Possible area support:** Computational and Digital Social Science
- **Evidence locators:** matplotlib_getting_started: official guide installs the package and demonstrates drawing a plot; pandas_tutorials: pandas tutorial includes plotting from tabular data
- **Learning links:** [Open: Getting started](https://matplotlib.org/stable/users/getting_started/) (level: Beginner getting-started guide; Python basics assumed; access: Public documentation; open-source library; language: English; duration: Self-paced; not stated; checked 2026-10-08)
- **Relationships/prerequisites:** requires → Python basics: Matplotlib is a Python package.; complements → pandas: A common workflow is to prepare tabular data in pandas and plot selected results; neither is required for every project.; alternative_to → spreadsheet charts or another suitable visualization tool: Select a method based on audience, data and reproducibility.
- **Limits/scope:** Optional plotting tool, not a statistical method or domain-wide requirement.; Visual appearance does not prove a relationship, cause or representative sample.; Check labels, scale, accessibility and source notes. Global open-source library; no Nigeria-specific software requirement established.

### NetworkX for analysing relationship data as a graph

- **Disposition/status:** `specialization_owned_tool` / `optional_social_network_analysis_choice`
- **Learner explanation:** NetworkX is a Python library for representing relationships as a graph: people or organisations become points, and recorded connections become lines. It can calculate network measures and apply graph algorithms. It cannot tell you whether the recorded ties are complete or what a measure means socially without a sound research design and interpretation.
- **Expected output:** A small, anonymised practice network with a documented definition of a node and tie, one justified network measure, and a note about missing/biased ties and interpretation limits.
- **Possible area support:** Computational and Digital Social Science
- **Evidence locators:** networkx_tutorial: official tutorial covers graph creation, nodes, edges, attributes, algorithms and drawing; cornell_css: computational social-science page names social network analysis as a methods area
- **Learning links:** [Open: Tutorial](https://networkx.org/documentation/stable/tutorial.html) (level: Introductory package tutorial; Python basics and graph concepts help; access: Public documentation; open-source library; language: English; duration: Self-paced; not stated; checked 2026-10-08)
- **Relationships/prerequisites:** requires → Python basics and graph/network analysis concepts: The package implements graph operations; it does not teach the full method or justify the research question.; alternative_to → R network packages or specialist visual/network software such as Gephi, where method and data fit: These are alternative implementations, not a checklist to learn together.
- **Limits/scope:** Belongs only to a network-analysis route, not every D078 learner or every computational-social-science project.; Relationship data can expose sensitive information; use privacy-preserving practice data and appropriate ethics review.; For large graphs, performance and alternative platforms need separate assessment. Global open-source package; no Nigeria-specific software requirement established.

### Mesa for building agent-based social simulations in Python

- **Disposition/status:** `specialization_owned_tool` / `optional_modeling_route_choice`
- **Learner explanation:** Mesa is a Python framework for agent-based modeling (ABM): a researcher writes rules for simulated individuals or organisations, runs the model, and examines what patterns emerge from their interactions. A model is a simplified set of assumptions—not a prediction of what real people will certainly do.
- **Expected output:** A small, documented toy model with explicit agent rules and assumptions, repeatable runs, collected results, and a comparison with evidence or alternative assumptions.
- **Possible area support:** Computational and Digital Social Science
- **Evidence locators:** mesa_first_model: official getting-started tutorial builds a basic model and links data-collection/visualization tutorials; national_academies_social_models: ABM describes interacting agents to examine social processes; not a guarantee of prediction; ncrm_agent_based_modelling: specialist research training treats ABM as a distinct advanced method
- **Learning links:** [Open: Creating Your First Model](https://mesa.readthedocs.io/stable/tutorials/0_first_model.html) (level: Introductory step-by-step model tutorial; basic Python is useful; access: Public documentation; open-source library; can run online through Colab as described; language: English; duration: Self-paced; not stated; checked 2026-10-08)
- **Relationships/prerequisites:** implements → agent-based modeling (ABM): ABM is the method/modeling approach; Mesa is one Python implementation.; alternative_to → NetLogo, Repast, MASON or another suitable ABM environment: Choose one environment for the project; alternatives are not cumulative.; complements → pandas and Matplotlib: These may support data collection/analysis and charts after simulation; they are optional companions, not automatic requirements.
- **Limits/scope:** Specialist, optional tool; not a shared D078 foundation.; Simulation output is conditional on assumptions and calibration; it is not observed evidence by itself.; A beginner tutorial does not establish that ABM is suitable for a given question. Global open-source framework; no Nigeria-specific tool requirement established.

### Casevo for cognitive-agent social-simulation experiments

- **Disposition/status:** `hold_emerging_specialist_candidate` / `niche_optional_not_general_abm_requirement`
- **Learner explanation:** Casevo is a specialist Python framework for multi-agent social-simulation experiments on complex networks. Its project tutorial combines Mesa-based simulation, NetworkX graphs, Matplotlib, and an LLM interface. This can be explored only when a well-defined research question specifically calls for this kind of model; it is not a required step after learning Python or a general replacement for research with people or observed data.
- **Expected output:** A small model-comparison notebook that states what agents represent, what assumptions/prompts and network rules were used, how outputs were checked, and why simulation results cannot be treated as real-world findings without validation.
- **Possible area support:** Computational and Digital Social Science
- **Evidence locators:** casevo_readme_tutorial: project README identifies use case, Mesa basis, NetworkX/Matplotlib example, LLM integration, Python version and tutorial; casevo_paper: research paper describes scope as cognitive agents/social evolution simulation; project paper is not independent evidence of general adoption
- **Learning links:** [Open: Casevo: Cognitive agents and social evolution simulator](https://github.com/rgCASS/casevo) (level: Specialist/advanced; requires Python >3.11 and setup of model/network/LLM components as stated in the project README; access: Public GitHub tutorial and Apache-2.0 repository; API/model-provider access may have separate terms or cost; language: English; duration: Self-paced; not stated; checked 2026-10-08)
- **Relationships/prerequisites:** builds_on → Mesa, NetworkX and Matplotlib: The documented Casevo example uses a Mesa-based framework and these libraries; this describes its implementation, not a requirement that all social researchers learn this stack.; requires → LLM provider/API for the demonstrated LLM integration: Provider access, price, privacy and terms are separate and can change; avoid sending sensitive data.; alternative_to → Mesa alone or other ABM workflows: Use Casevo only if its cognitive-agent/network features answer the research question; do not choose it just because it is newer.
- **Limits/scope:** Emerging/niche project candidate; do not promote as a common or established D078 tool without further adoption/maintenance evidence.; Project example uses U.S. election data/personas; it is illustrative, not Nigeria-specific validation.; LLM-generated agent conversations or choices are simulated outputs, not representative human responses or evidence of actual social behavior.; Version and third-party LLM dependencies can change; recheck before any student link is published. Global open-source project (Apache-2.0 per repository); no Nigerian requirement or local adoption established.

## Computation, methods and alternatives

Computational and quantitative social research is a recognized specialist path, supported by UC San Diego, Cornell's named method examples and the existing D078 method inventory. That evidence does **not** make coding, statistics, network analysis, text mining, computational models or GIS common requirements for every D078 learner. Keep a non-computational path available. Select one method/tool only when it fits the question, data and ethical permissions. Specific sequence/text/model methods stay held unless their individual identity, task fit and direct learning link are verified. The JSON records the seven method entries, including duplicate social-network analysis and the inaccessible ASA PDF source.

A tool is not a method: KoboToolbox can deploy a form but does not validate sampling; Taguette can organise text codes but does not validate interpretation; Gephi can visualize ties but does not prove influence; QGIS can analyse mapped data but only helps where place matters; Jamovi/R/Python support different workflows and are alternatives where the task supports them.

## Certifications and qualifications

No universal professional certification is established. NHREC/TRREE ethics training is conditional to specified Nigeria health-research/ethics-review contexts. KoboToolbox Essentials gives its own product-course certificate; it is not a social-science professional qualification. Do not turn either into a blanket D078 requirement. No common entry qualification is established by the reviewed sources.

## Evidence register

The companion JSON contains the same source register with exact locators, scope and claim limits. Direct learner links are also listed per candidate item.

- **unesco_definition — UNESCO, _Social science research_** ([source](https://www.unesco.org/en/query-list/s/social-science-research)); locator: Introductory definition: systematic study of human behaviour and societal structures using varied methods, including quantitative and qualitative analysis; sociology, psychology and anthropology are named examples. Scope/limit: global; introductory definition; Introductory description, not a curriculum, occupational standard or claim that every social-science activity is research.
- **unesco_isced_detail — UNESCO Institute for Statistics, _ISCED-F 2013: Detailed Field Descriptions_** ([source](https://www.uis.unesco.org/sites/default/files/medias/fichiers/2025/04/international-standard-classification-of-education-fields-of-education-and-training-2013-detailed-field-descriptions-2015-en.pdf)); locator: Printed pp. 17–19, broad field 03 and detailed field 031/0311–0314: political science, psychology, sociology/cultural studies, anthropology, demography and social geography; notes exclusions/boundaries including physical geography, social work, journalism and law. Scope/limit: global education-statistics classification; Classification for education statistics; it does not determine this product taxonomy or occupations.
- **unesco_frascati — UNESCO Institute for Statistics, _Instruction Manual for the UNESCO R&D Statistics Questionnaire_** ([source](https://uis.unesco.org/sites/default/files/documents/uis_rd_m_2016_en_0.pdf)); locator: Frascati-derived field classification in the manual, social-science field grouping; compare with ISCED-F because the two taxonomies serve different statistical purposes. Scope/limit: global R&D statistics; R&D statistics classification, not the D078 product definition.
- **esrc_training — ESRC / UK Research and Innovation, _Postgraduate Training and Development Guidelines 2022_** ([source](https://www.ukri.org/wp-content/uploads/2015/09/ESRC-281123-PostgraduateTrainingDevelopmentGuidelines2022.pdf)); locator: Sections 2.1–2.3, printed pp. 4–7: broad conceptual/method training, method depth varies by subject; Annex II printed pp. 24–25: connect questions to tools, justify qualitative/quantitative methods, sampling and interpretation. Scope/limit: United Kingdom; postgraduate research training; Not a Nigerian undergraduate rule, universal workforce prerequisite or evidence every D078 learner needs advanced methods.
- **apsa_2024 — American Political Science Association, _Rethinking Political Science Education: Presidential Task Force Report_** ([source](https://educate.apsanet.org/wp-content/uploads/APSA-Presidential-Task-Force-Report-on-Rethinking-Political-Science-Education-March-2024.pdf)); locator: Undergraduate methods recommendations, printed p. 22: research cycle, questions, hypotheses, measurement, sampling, collection/coding, analysis, interpretation and communication; examples include interviews, case studies, content analysis, surveys, experiments and observational statistics; specialization follows introductory exposure. The report itself warns departments to adapt to program goals. Scope/limit: United States; political science education; One discipline and national higher-education context; not a universal D078 syllabus.
- **apa_guidelines — American Psychological Association, _Guidelines 3.0 for the Undergraduate Psychology Major_** ([source](https://www.apa.org/about/policy/undergraduate-psychology-major.pdf)); locator: Guidelines 3.0 learning goals: scientific inquiry/critical thinking, ethical/social responsibility, communication and professional development; the goals apply to psychology education, not all D078 fields. Scope/limit: global professional guidance for psychology education, produced by a U.S. professional body; Psychology-specific educational framework; not every D078 route or job.
- **asa_learning — American Sociological Association, _Sociology Learning Goals and Assessment_** ([source](https://www.asanet.org/wp-content/uploads/assessment_plan_sociology_2005.pdf)); locator: Learning outcomes include theory/evidence, qualitative and quantitative methods, research design, evaluating published research, ethical conduct and communication; sociology-specific outcomes. Scope/limit: United States; sociology education; Sociology, not a universal D078 curriculum.
- **aaa_ethics — American Anthropological Association, _Principles of Professional Responsibility_** ([source](https://americananthro.org/about/anthropological-ethics/)); locator: Principles address avoiding harm, openness, informed consent, weighing competing obligations, making results accessible, protecting/maintaining records and relationships. Scope/limit: global professional ethics guidance for anthropology; Anthropology guidance; not Nigerian law or a substitute for local/institutional review.
- **aea_outcomes — American Economic Association, _A Statement on the State of Undergraduate Education in Economics_** ([source](https://www.aeaweb.org/articles?id=10.1257/aer.p20171070)); locator: Learning-outcomes framework identifies economics-specific conceptual, analytical and communication competencies. Scope/limit: global economics education article by professional association; Economics education only.
- **nuc_ccmas — National Universities Commission, Nigeria, _Social Sciences CCMAS 2023_** ([source](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf)); locator: Printed p. 337, SSC 401 Research Method II: proposal preparation/presentation, collecting and organising meaningful data, pilot work, report writing and appropriate statistics; examples at pp. 333–337 are programme/course-specific. Scope/limit: Nigeria; university minimum academic standards; Does not mean every Nigerian course, role or D078 path requires all listed methods; not global evidence.
- **niser_policy — Nigerian Institute of Social and Economic Research, _Policy Briefs_** ([source](https://niser.gov.ng/v2/briefs/)); locator: Institutional output collection demonstrates concise research-to-policy communication in Nigeria. Scope/limit: Nigeria; one national research institute; Does not establish all social scientists work in policy or estimate jobs/demand.
- **niser_projects — Nigerian Institute of Social and Economic Research, _Team Research Projects_** ([source](https://niser.gov.ng/v2/team-research-project-trp/)); locator: Institutional project page for collaborative research examples and themes. Scope/limit: Nigeria; one research institute; Not representative of every employer or field.
- **nbs_social_stats — National Bureau of Statistics, Nigeria, _Social Statistics in Nigeria, Part I: Household and Housing Conditions_** ([source](https://nigerianstat.gov.ng/pdfuploads/NBS%20Social%20Statistics%20in%20Nigeria%20-Part%20I%20%28Household%20%26%20Housing%20Conditions%29.pdf)); locator: Publication title, contents and tables: official statistical output on household/housing conditions; use as an example of secondary social data, not as a currentness claim. Scope/limit: Nigeria; national statistics publication; Publication is dated; do not present as current snapshot or labour-market evidence.
- **openlearn_methodology — The Open University, OpenLearn, _Defining your research methodology_** ([source](https://www.open.edu/openlearn/course/view.php?id=18286)); locator: Sections connecting research questions, methodology, data collection and analysis; quantitative/qualitative distinction and mixed-method discussion. Scope/limit: open learning resource; global access; Article in postgraduate research-proposal collection; publisher does not state learner level; not formal professional accreditation.
- **openlearn_interviews — The Open University, OpenLearn, _Conducting qualitative interviews: an introduction_** ([source](https://www.open.edu/openlearn/education-development/conducting-qualitative-interviews-introduction/content-section-0)); locator: Course introduction and sections on preparation, conducting and recording qualitative interviews. Scope/limit: open learning resource; global access; Interview technique only; ethical approvals/permissions remain context-specific.
- **openlearn_ethics — The Open University, OpenLearn, _Becoming an ethical researcher_** ([source](https://www.open.edu/openlearn/education-development/becoming-ethical-researcher)); locator: Course description and units on ethical research with human participants across planning, conducting and reporting. Scope/limit: open learning resource; global access; Not institutional approval, local law advice or a universal certificate requirement.
- **openlearn_report — The Open University, OpenLearn, _Essay and report writing skills: drafting reports_** ([source](https://www.open.edu/openlearn/education-development/essay-and-report-writing-skills/content-section-7.2)); locator: Drafting reports section, including report structure and clear communication. Scope/limit: open learning resource; global access; Does not teach all policy, academic or public communication formats.
- **openlearn_evidence — The Open University, OpenLearn, _EPQs: finding and using evidence_** ([source](https://www.open.edu/openlearn/course/view.php?id=17844)); locator: Course material on finding, judging and using evidence, including source credibility and critical reading. Scope/limit: open learning resource; global access; EPQ/secondary-school project context; use for introductory source evaluation, not advanced systematic review training.
- **openlearn_jamovi — The Open University, OpenLearn, _Getting started with Jamovi_** ([source](https://www.open.edu/openlearn/health-sports-psychology/getting-started-jamovi/content-section-0/)); locator: Course description and tutorials: data entry, descriptive/inferential analysis and interpretation; Level 1, approximately 8 hours as stated by provider. Scope/limit: open learning resource; global access; One software option, not a method credential or universal tool.
- **pew_survey — Pew Research Center, _Writing Survey Questions_** ([source](https://www.pewresearch.org/writing-survey-questions/)); locator: Sections on questionnaire development, question wording/order, pretesting, open-/closed-ended questions and measurement error. Scope/limit: global methods resource with U.S. examples; Professional practice resource; adapt language, sampling and law to the population/country.
- **ukds_data_skills — UK Data Service, _Data Skills Modules_** ([source](https://ukdataservice.ac.uk/learning-hub/data-skills-modules/)); locator: Free interactive introductory modules: survey, longitudinal and aggregate data; sourcing data ethically; modules for existing research data and own data. Scope/limit: UK-based service; materials include international examples; Dataset examples and legal context may be UK-specific; not all modules are tools-neutral.
- **cessda_rdm — Consortium of European Social Science Data Archives, _Research Data Management in the Social Sciences_** ([source](https://www.cessda.eu/Training/Training-Resources/Resource-crd-4767)); locator: Webinar description: data management through the research-data life cycle from planning to publishing; linked to social-science practice. Scope/limit: European social-science data infrastructure; globally useful concepts; European repositories/policy context; adapt privacy, retention and sharing rules to jurisdiction and institution.
- **kobo_essentials — KoboToolbox Academy, _KoboToolbox Essentials_** ([source](https://academy.kobotoolbox.org/courses/essentials)); locator: Official free, self-paced course, 11 modules/3 hours; designing forms, deploying, collecting and managing data; official course-completion certificate after quizzes. Scope/limit: global tool training; Kobo certificate proves completion of this product course, not professional research qualification or survey-method competence.
- **taguette_tutorial — Taguette project, _Getting started with Taguette_** ([source](https://www.taguette.org/getting-started.html)); locator: Walkthrough: create a project, upload documents, highlight/tag text, retrieve/export coded extracts. Scope/limit: global open-source tool; Coding software does not select a valid qualitative method or establish interpretive quality.
- **nvivo_coding_guide — Lumivero (NVivo developer), _Essential qualitative coding techniques in NVivo_** ([source](https://lumivero.com/resources/blog/essential-qualitative-coding-techniques-nvivo/)); locator: Article sections at page lines 238–257: beginner-friendly demonstration of in-vivo coding, coding stripes, autocoding and memos for qualitative data such as interviews and open responses. Scope/limit: Global vendor learning resource; Vendor-authored tool instruction, not independent evidence that NVivo is methodologically required; NVivo licensing is commercial and cost/availability vary.
- **nvivo_licensing — Lumivero, _NVivo licensing and pricing_** ([source](https://shop.lumivero.com/qda-and-research/nvivo?attribute_pa_license-term=annual-subscription&attribute_pa_license-type=student-license)); locator: Product options show annual and one-time license types and separate student, individual, commercial and other purchasing routes; pricing is dynamic and currency/availability may vary by region. Checked 2026-10-08; do not hard-code a price into learner copy. Scope/limit: Vendor sales information; regional pricing may differ; Promotions and prices change; the page does not establish Nigerian institutional access or affordability.
- **ibm_spss_resources — IBM, _Resources for IBM SPSS Statistics_** ([source](https://www.ibm.com/products/spss-statistics/resources)); locator: Official resource hub: getting-started materials for new users, loading sample data, navigating Data/Variable View, descriptive statistics and charts; includes a full-feature trial and links to product documentation/tutorials. Scope/limit: Global product documentation and training resources; Product tutorials teach software operations, not research design or valid statistical choices; trials/subscriptions and access terms vary.
- **ibm_spss_essentials — IBM Training, _IBM SPSS Statistics Essentials_** ([source](https://www.ibm.com/training/course/ibm-spss-statistics-essentials-v26-0K53BG)); locator: Course overview/objectives for new users: read and define data, modify variables, analyze and present results; course lists external training providers and does not state a universal free access route. Scope/limit: Global vendor course; licensing/training access varies; Course availability and price depend on provider; software training does not establish statistical competence by itself.
- **ibm_spss_pricing — IBM, _IBM SPSS Statistics resources and licensing_** ([source](https://www.ibm.com/products/spss-statistics/resources)); locator: Pricing/licensing FAQ: subscriptions may be monthly or annual; trial and other license types are described; terms and availability can vary by country/locale. Scope/limit: Global vendor licensing information; Dynamic commercial terms; do not hard-code a price or assume Nigerian campus access.
- **excel_import_analyze — Microsoft Support, _Import and analyze data in Excel_** ([source](https://support.microsoft.com/en-us/excel/import-and-analyze-data)); locator: Page lines 119–147 lists supported versions and import/Power Query resources; lines 149–187 covers tables, sorting/filtering, charts and PivotTables; linked PivotTable overview explains summarising data and visualising comparisons/patterns. Scope/limit: Global product documentation; version-specific features; Software capability is not research-method guidance; access to desktop features may depend on version/license; spreadsheet use alone does not ensure data quality, security or valid inference.
- **pandas_tutorials — pandas project, _Getting started tutorials_** ([source](https://pandas.pydata.org/docs/getting_started/intro_tutorials/index.html)); locator: Official beginner tutorials cover reading/writing tabular data, selecting rows/columns, plotting, derived columns, summary statistics, reshaping, joining tables, time series and text columns; comparison pages identify spreadsheet, R, SQL, SAS and SPSS alternatives. Scope/limit: Global open-source Python project documentation; Library documentation does not establish that coding is needed for every D078 route or teach research design/statistical interpretation.
- **matplotlib_getting_started — Matplotlib project, _Getting started_** ([source](https://matplotlib.org/stable/users/getting_started/)); locator: Official getting-started guide: installation, first plot, plot types and quick-start tutorial; first example creates a labelled figure from numeric x/y data. Scope/limit: Global open-source project documentation; Plotting does not validate data, statistical inference, accessibility or causal claims; not every D078 learner needs programmatic charts.
- **networkx_tutorial — NetworkX project, _Tutorial_** ([source](https://networkx.org/documentation/stable/tutorial.html)); locator: Official tutorial sections on graph creation, nodes/edges, graph types, attributes, algorithms, drawing and input/output; graph concepts and algorithms are made available through Python APIs. Scope/limit: Global open-source project documentation; Does not establish a network-analysis question or valid data; package is not itself graph theory or a general D078 foundation; large-scale performance and methods require separate review.
- **mesa_first_model — Mesa project, _Creating Your First Model_** ([source](https://mesa.readthedocs.io/stable/tutorials/0_first_model.html)); locator: Official introductory tutorial builds a simple agent-based model step by step, starting with a model of agents exchanging wealth; Mesa getting-started guide links data collection and basic visualization tutorials. Scope/limit: Global open-source Python project documentation; A tutorial example is not evidence that ABM suits a particular social question; modeling assumptions, validation, ethics and interpretation require separate learning.
- **casevo_readme_tutorial — rgCASS, Casevo project, _Casevo: Cognitive agents and social evolution simulator_** ([source](https://github.com/rgCASS/casevo)); locator: README sections 1–4: project describes a Python framework for social-simulation multi-agent experiments on complex networks; says it is built on Mesa; tutorial incrementally builds a basic model and simple result analysis. Sections 4.1–4.3 demonstrate a network configuration using NetworkX and Matplotlib and an LLM API integration. Repository notes Python >3.11; 0.3.19 release dated 2025-04-22; Apache-2.0 license. Scope/limit: Global, specialist open-source project; repo/tutorial example uses U.S. election material; A specific evolving project rather than an established general-purpose requirement; small project/release history and version/API dependencies require maintenance review; U.S. example is illustrative and should not be copied as Nigerian evidence; LLM-generated behaviour is not a validated model of real people.
- **qgis_training — QGIS / OSGeo, _QGIS Training Manual_** ([source](https://docs.qgis.org/3.44/en/docs/training_manual/index.html)); locator: Training manual: map layers, spatial data, map layouts and vector analysis; section 6.2 identifies basic level and question-data-analysis-presentation workflow. Scope/limit: global open-source geospatial tool; Use only for spatial questions and suitable geodata; not a D078-wide need.
- **gephi_quickstart — Gephi project, _Gephi Quick Start_** ([source](https://gephi.org/quickstart/)); locator: Official quick start: import source-target relationship data, visualize a network and use layout/metrics; linked example dataset. Scope/limit: global open-source tool; Visualization is not evidence of causal relationships; method and data suitability come first.
- **r4ds — R for Data Science authors, _R for Data Science (2e), Introduction_** ([source](https://r4ds.hadley.nz/intro)); locator: Introduction and early chapters on importing, tidying, transforming and visualizing data with R. Scope/limit: global open educational book; R is one option; the book is not specifically a social-science research design course.
- **python_tutorial — Python Software Foundation, _The Python Tutorial_** ([source](https://docs.python.org/3/tutorial/)); locator: Official tutorial, chapters on data structures, input/output, errors, modules; learner is expected to have basic programming understanding. Scope/limit: global software documentation; Not an absolute-beginner programming course and not social-research methodology.
- **aapor — American Association for Public Opinion Research, _Best Practices for Survey Research_** ([source](https://aapor.org/standards-and-ethics/best-practices/)); locator: Best-practice guidance on sampling, questionnaire design, pretesting, transparency and reporting. Scope/limit: global professional guidance; Professional guidance, not a beginner course or Nigerian law.
- **nhrec_training — National Health Research Ethics Committee of Nigeria, _Ethics Training_** ([source](https://nhrec.gov.ng/services/ethics-training/)); locator: Official page describes online training and certification on informed consent, privacy, bioethics and participant rights; TRREE/Nigeria health-research materials. Scope/limit: Nigeria; health research and NHREC processes; Not a universal social-science certificate, license, or substitute for applicable institutional review.
- **nhrec_trree — National Health Research Ethics Committee of Nigeria, _TRREE Training_** ([source](https://nhrec.gov.ng/entry-with-audio/)); locator: NHREC instructions list TRREE introductory research, informed consent and Nigeria modules; says investigators applying for NHREC ethics review may use CITI or TRREE certificates to meet ethics-training requirements. Scope/limit: Nigeria; health-research ethics review context; Not applicable to all D078 work or all Nigerian institutions.
- **nuc_nigeria — National Universities Commission, Nigeria, _Social Sciences CCMAS 2023_** ([source](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf)); locator: Printed pp. 333–337, course descriptions/outcomes in research-methods offerings; printed p.337 SSC 401 Research Method II. Scope/limit: Nigeria; university curriculum; Programme-specific, not a universal domain requirement.
- **ucsd_css — University of California San Diego, Computational Social Science, _Computational Social Science Program_** ([source](https://css.ucsd.edu/)); locator: Program overview: computational methods address social questions using data; curriculum combines formal social-science models and computational data analysis; described for undergraduate and graduate training and multiple sectors. Scope/limit: global field example; U.S. institution; One university/program; does not prove local demand or universal coding need.
- **ucsd_css_curriculum — University of California San Diego, _Computational Social Science Master's Curriculum_** ([source](https://css.ucsd.edu/masters/curriculum.html)); locator: Curriculum description and course plan: math, programming, statistics, social-science theory; advanced methods and machine learning appear in this specialist degree. Scope/limit: United States; specialist graduate program; Not a general D078 foundation or undergraduate entry standard.
- **cornell_css — Cornell University, Department of Sociology, _Computational Social Science_** ([source](https://sociology.cornell.edu/research/computational-social-science)); locator: Page lines 26–28: methods-oriented area includes social network analysis, social sequence analysis, topic modelling and other big-data analysis; also addresses sampling and social relationships in networked society. Scope/limit: United States university research/teaching area; global method examples; One university and sociology-area page; it does not establish all methods as shared D078 or provide beginner instruction.
- **openlearn_social_participation — The Open University, OpenLearn, _Social science and participation: Participating in social science_** ([source](https://www.open.edu/openlearn/society-politics-law/social-science-and-participation/content-section-4)); locator: Section 'Participating in social science', especially the table at lines 168–182: explains how social scientists interact with participants and names surveys, focus groups, qualitative interviews, ethnographic observation and quantitative measurement. Course metadata at lines 97–103: free, Level 2 intermediate, 10 hours. Scope/limit: Global open-learning resource; Open University course; A general social-science participation section, not comprehensive fieldwork or ethics training; intermediate Level 2, 10 hours.
- **openlearn_ethnography — The Open University, OpenLearn Create, _Empowering methodologies: Ethnography, self and intersubjectivity_** ([source](https://www.open.edu/openlearncreate/mod/oucontent/view.php?id=149002&section=2)); locator: Course page metadata lines 66–73: 10 hours, Level 3 advanced, free statement of participation; section/transcript lines 83–91 and 101–119: ethnography, researcher position, ethical reflection, observation, field notes and situated practice. Scope/limit: Global open-learning resource; organisational ethnography example; Advanced and based on organisational ethnography; not a beginner course or universal fieldwork protocol. Some interactive functionality requires a free account.
- **edinburgh_css_course — University of Edinburgh, Open Course Materials, _Understanding Society with Big Data: Computational Social Science_** ([source](https://opencourse.inf.ed.ac.uk/css)); locator: Course learning outcomes lines 3–10: formulate social-behaviour questions; choose computational methods with ethical/bias considerations; apply basic analysis to text/network data; communicate limits; collaborate. Course outline lines 11–27 includes question formulation, data collection, experiments, AI/text analysis, ethics/fairness, network/text analysis and labs/tutorials. Scope/limit: Global field example; University of Edinburgh course materials; The page is public, but does not state price, learner level, or an open license; it is not evidence of a universal foundation, Nigerian demand or entry requirements.
- **edinburgh_css_labs — University of Edinburgh, Open Course Materials, _Computational Social Science: Labs_** ([source](https://opencourse.inf.ed.ac.uk/css/labs)); locator: Lab listing lines 0–6: data processing/visualisation, machine learning/networks, text analysis and project presentations; lines 7–15 describe self-learning labs and support; lines 24–26 state all rights reserved. Scope/limit: Global field example; University of Edinburgh course materials; The page lists labs and some downloadable files, not a complete beginner course; learner level and price are unstated; all rights reserved, so reuse is not implied.
- **national_academies_social_models — National Research Council / National Academies Press, _Facing Hazards and Disasters: Understanding Human Dimensions_** ([source](https://www.nationalacademies.org/read/11671/chapter/9)); locator: Chapter 7, lines 642–645: describes simulation models of social processes; defines agent-based modelling as simulations populated by interacting individuals, groups, organizations or communities; discusses uses and limits of representing social action and structure. Scope/limit: Global research-method example in hazards/disaster studies; A 2006 report chapter focused on hazards/disasters; it establishes a method and example, not current prevalence, universal D078 suitability or model validity.
- **ncrm_agent_based_modelling — National Centre for Research Methods, University of Southampton, _Agent-based modelling for social research_** ([source](https://repository.ncrm.ac.uk/resources/online/ABM_index.php)); locator: Course description lines 10–13: building, analysing and documenting agent-based models of social processes; aimed particularly at PhD students/early-career researchers with some coding experience. Blocks 1–3, lines 14–34, cover ABM/time, data quality/model analysis, documentation and provenance. Scope/limit: Global social-research methods resource; UK research centre; Intended mainly for advanced learners with some coding experience; not a beginner prerequisite or evidence ABM is needed across D078.
- **esco_skills_classification — European Commission, _ESCO Skills & Competences_** ([source](https://esco.ec.europa.eu/en/classification/skills)); locator: Page lines 107–119: ESCO skills pillar distinguishes skills/competences and knowledge concepts, provides preferred/non-preferred terms, descriptions, scope notes, reusability and relationships; continuously updated. Scope/limit: European labour-market classification; Taxonomy metadata does not prove D078-wide shared ownership or a specific task/checkpoint.
- **onet_skills_classification — U.S. Department of Labor, O*NET Resource Center, _O*NET Content Model_** ([source](https://www.onetcenter.org/content.html)); locator: Content Model documentation identifies skills as developed capacities that facilitate learning or performance; used only to identify lineage of O*NET-tagged generic labels. Scope/limit: United States occupational classification; U.S. occupational taxonomy labels and aggregation do not prove a D078 foundation or Nigerian demand.
- **computational_method_inventory — Project audit artifact, _D078 Computational Method Evidence Inventory_** ([source](local:data/career-mapping/computational_method_evidence.json)); locator: methods[] records where domain_id=D078; includes source string, label, description and scope marker where present. Scope/limit: local discovery inventory; Existing catalog content is not independent verification; validate each claim against external evidence.
- **esco_game_theory — European Commission, ESCO, _Game theory (ESCO skill concept)_** ([source](http://data.europa.eu/esco/skill/8b0f73ff-d36b-4196-bb83-464c3a6ef07d)); locator: ESCO concept description as captured in domain_skill_provenance: mathematical models of strategic decisions among stakeholders; applications across social sciences and other fields; the concept is not inherently computational. Scope/limit: European skills taxonomy concept; cross-disciplinary; Taxonomy definition does not establish that every D078 path needs game theory; this pass found no direct beginner lesson to attach.

## Unresolved items and next gate

- Observation/ethnography and the computational method umbrella have no sufficiently direct, method-specific beginner learning link verified; keep both hidden until individually resolved.
- A broad, current Nigerian employment/work-setting or demand study was not established; do not add labour-market, salary or licensing claims.
- The D078 overview gate is not passed. The programme overview and pre-domain-entry reviews remain prior dependencies in the implementation plan.
- The research candidates should be reconciled against exact checkpoint claims, display language and resource-link requirements before any promotion.
- This review makes no role fit, role placement or area/role assignment decision.

## Generation and validation

This artifact was generated from read-only local inputs by `data/career-mapping/_audit/build_d078_full_domain_item_inventory_2026_10_08.py`. Validation: all 137 provenance labels and all 30 domain-summary labels have explicit dispositions; no unmatched labels; every displayable detailed candidate has a direct learning link; held methods are explicitly unlinked; no role records opened; no student approval asserted.
