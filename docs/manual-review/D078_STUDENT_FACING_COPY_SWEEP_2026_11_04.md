# D078 Student-Facing Copy Sweep

**Date:** 2026-11-04  
**Status:** Inventory and candidate issue report; not editorial approval.  
**Source:** Canonical D078 route graph and exported journey data.

> Heuristic flags create a human-review worklist. No flag is a pass, and this report does not claim novice comprehension or subject-matter approval.

## Inventory counts

- Graph: 1,922 nodes and 13,163 edges.
- Exported journey data: 1,563 nodes and 7,845 typed relationship records.
- Student-visible graph records with copy: 796; text units: 5,541; words: 91,675.
- Method-combination explanations: 9 designs and 9 text units.
- Literal static UI text and quoted labels: 1,116 units; 264 contain candidate technical terms.
- Top-level D078 overview/transfer/method-context copy: 11 units; 5 contain candidate technical terms.
- Candidate terminology ledger: 180 distinct terms and 2,699 occurrences; every occurrence remains unreviewed until checked on its route.
- Fields referenced by the journey but excluded by the data exporter: none.
- Relationship panel scope: 562 resolved, ready edge records; 562 have stored explanations, 0 have none, 0 contain the generic internal note.

## Visible copy by record type

| Record type | Visible records | Copy units |
|---|---:|---:|
| programme_outcome | 236 | 472 |
| role_item_candidate | 164 | 1571 |
| area_enrichment_item | 115 | 1806 |
| domain_learning_item | 112 | 1095 |
| area_task_family | 50 | 150 |
| role_task_family | 19 | 57 |
| role | 19 | 57 |
| area_tool_option | 14 | 84 |
| programme_theme | 14 | 42 |
| tool | 13 | 26 |
| runtime_learning_item | 10 | 10 |
| method_combination_design | 9 | 63 |
| domain_emerging_learning_item | 8 | 80 |
| area_of_specialization | 7 | 21 |
| area_foundation | 2 | 2 |
| area_tool_application_reference | 2 | 2 |
| domain_route | 1 | 2 |
| programme_context | 1 | 1 |

## Candidate issue counts

| Candidate flag | Records |
|---|---:|
| long_copy_unit_over_32_words | 370 |
| missing_task_output | 19 |

## High-priority targets

- Replace generic area-learning-item definitions with item-specific explanations tied to the relevant task family.
- Explain every area tool as a tool and show how it supports area work; add a useful output where evidence supports one.
- Explain all area task families and add outputs where the graph lacks them.
- Review role overviews and role tasks independently; preserve area ownership and conditional scope.
- Review each visible domain and area card for item-specific definition, route reason, output, assumptions or limits.
- Review relationship explanations per relation and route context; generic defaults cannot explain every specific edge.
- Recheck programme themes and the 236 source curriculum outcomes as independently displayable text.

## Copy revisions applied in this pass

These source-backed copy edits do not approve the whole D078 journey or clear the full terminology ledger.
- **Sociology programme:** revised the overview to define institutions, culture, inequality and research in context. It distinguishes recorded programme learning from individual mastery or job eligibility; the curriculum themes and course outcomes remain in their existing structured sections.
- **Social Sciences domain:** revised the lead explanation and rendered the approved orientation as distinct question, work-process and possible-work-product sections. The Sociology transfer, shared foundations, society knowledge and method/design order remain unchanged.
- **Computational social research:** expanded its definition, field relevance, examples, learner output and limits; removed source-access notes from visible limitations. Its conditional, skippable disposition is unchanged.
- **Area tools:** the seven separate LimeSurvey, NVivo, Python, R, SPSS, Stata and Taguette cards now say what each tool is, how it can help with work in Social Behaviour and Interaction, an example output and what the tool cannot establish. Each remains optional and nonblocking.
- **Technical explanations:** corrected or expanded shared glossary entries for statistical significance, regression, logistic regression, mixed methods, computational methods, evaluation, theory of change, sampling, case studies, psychometrics, time-series analysis and related terms. The glossary supplements copy review; it does not clear every occurrence.
- **Data projection:** the exporter now includes `why_it_matters`, `field_context` and `task_conditions` already read by the journey; the audit reports no remaining UI-used fields dropped by that exporter.
- **Graph integrity:** the updater verified the same 1,922 node IDs and 13,158 edge IDs/counts before and after. It did not edit route, requirement-lane, ownership or role-fit fields.
- **Source basis:** [NUC Social Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf), [University of Edinburgh computational social science course](https://opencourse.inf.ed.ac.uk/css), [Edelmann et al. review](https://pmc.ncbi.nlm.nih.gov/articles/PMC8612450/), [digital-trace data guidance](https://pmc.ncbi.nlm.nih.gov/articles/PMC11971172/), [UKRI/ESRC online-research ethics guidance](https://www.ukri.org/councils/esrc/guidance-for-applicants/research-ethics-guidance/internet-mediated-research/), [Columbia network-analysis guide](https://www.publichealth.columbia.edu/research/population-health-methods/social-network-analysis), [agent-based modelling review](https://pmc.ncbi.nlm.nih.gov/articles/PMC4430112/), [LimeSurvey manual](https://www.limesurvey.org/manual/LimeSurvey_Manual), [NVivo coding guide](https://community.lumivero.com/s/article/NVR1Mac-Content-coding-coding), [Python tutorial](https://docs.python.org/3/tutorial/), [R overview](https://www.r-project.org/about.html), [IBM SPSS t-test documentation](https://www.ibm.com/docs/en/spss-statistics/30.0.0?topic=test-overview-t-command), [Stata panel-data guide](https://www.stata.com/features/panel-longitudinal-data/), [Taguette](https://app.taguette.org/), [Magenta Book](https://www.gov.uk/government/publications/the-magenta-book), [ASA p-value statement](https://www.amstat.org/asa/files/pdfs/P-ValueStatement.pdf), and [CDC qualitative-data guidance](https://www.cdc.gov/field-epi-manual/php/chapters/qualitative-data.html).

## Exact flagged records

The JSON companion contains full copy text, owner context, source references, candidate technical terms and issue flags.

| Record | Type | Area | Flags |
|---|---|---|---|
| area-task:d078-computational-digital-social-science-core-task-family | area_task_family | Computational and Digital Social Science | long_copy_unit_over_32_words |
| area-task:d078-computational-digital-social-science-digital-trace-content-analysis | area_task_family | Computational and Digital Social Science | long_copy_unit_over_32_words |
| area-task:d078-computational-digital-social-science-reproducible-social-data | area_task_family | Computational and Digital Social Science | long_copy_unit_over_32_words |
| area-task:d078-econ-computational-economic-scenarios | area_task_family | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area-task:d078-econ-distribution-development-and-welfare | area_task_family | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area-task:d078-econ-official-statistics-sector-and-policy-analysis | area_task_family | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area-task:d078-econ-policy-and-program-evaluation | area_task_family | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area-task:d078-economics-applied-analysis-social-economic-data-analysis | area_task_family | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area-task:d078-human-geography-population-core-task-family | area_task_family | Human Geography and Population Studies | long_copy_unit_over_32_words |
| area-task:d078-politics-governance-public-policy-ai-supported-policy-evidence-synthesis | area_task_family | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area-task:d078-politics-governance-public-policy-citizen-participation-process | area_task_family | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area-task:d078-politics-governance-public-policy-computational-policy-text-analysis | area_task_family | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area-task:d078-politics-governance-public-policy-evaluate-ai-enabled-public-interventions | area_task_family | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area-task:d078-politics-governance-public-policy-institution-and-policy-analysis | area_task_family | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area-task:d078-politics-governance-public-policy-legislative-community-scorecard-oversight | area_task_family | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area-task:d078-politics-governance-public-policy-monitoring-evaluation | area_task_family | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area-task:d078-politics-governance-public-policy-political-survey-opinion | area_task_family | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area-task:d078-politics-governance-public-policy-strategic-foresight-and-policy-scenarios | area_task_family | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area-task:d078-psychology-social-behaviour-behavioural-insights-intervention | area_task_family | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area-task:d078-psychology-social-behaviour-behavioural-research-design | area_task_family | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area-task:d078-psychology-social-behaviour-conflict-context-analysis | area_task_family | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area-task:d078-psychology-social-behaviour-quantitative-behavioural-analysis | area_task_family | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area-task:d078-social-anthro-computational-social-inquiry | area_task_family | Sociology and Social Anthropology | long_copy_unit_over_32_words |
| area-task:d078-social-anthro-survey-design-and-analysis | area_task_family | Sociology and Social Anthropology | long_copy_unit_over_32_words |
| area-task:d078-social-behaviour-interaction-culturally-grounded-measure-adaptation | area_task_family | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area-task:d078-social-behaviour-interaction-digital-trace-and-online-network-research | area_task_family | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area-task:d078-social-behaviour-interaction-human-in-the-loop-ai-qualitative-analysis | area_task_family | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area-task:d078-social-behaviour-interaction-study-ai-mediated-social-behaviour-and-simulation | area_task_family | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area-task:d078-social-research-evaluation-core-task-family | area_task_family | Social Research and Evaluation | long_copy_unit_over_32_words |
| area-task:d078-social-research-evaluation-design-social-study | area_task_family | Social Research and Evaluation | long_copy_unit_over_32_words |
| area-task:d078-social-research-evaluation-programme-evaluation | area_task_family | Social Research and Evaluation | long_copy_unit_over_32_words |
| area-task:d078-sociology-social-anthropology-core-task-family | area_task_family | Sociology and Social Anthropology | long_copy_unit_over_32_words |
| area-task:d078-sociology-social-anthropology-interpret-social-evidence | area_task_family | Sociology and Social Anthropology | long_copy_unit_over_32_words |
| area-task:econ-02 | area_task_family | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area-task:econ-03 | area_task_family | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area-task:econ-04 | area_task_family | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area-task:soc-05 | area_task_family | Sociology and Social Anthropology | long_copy_unit_over_32_words |
| area:d078-computational-digital-social-science | area_of_specialization | Computational and Digital Social Science | long_copy_unit_over_32_words |
| area:d078-economics-applied-analysis | area_of_specialization | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area:d078-human-geography-population | area_of_specialization | Human Geography and Population Studies | long_copy_unit_over_32_words |
| area:d078-politics-governance-public-policy | area_of_specialization | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area:d078-psychology-social-behaviour | area_of_specialization | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area:d078-social-research-evaluation | area_of_specialization | Social Research and Evaluation | long_copy_unit_over_32_words |
| area:d078-sociology-social-anthropology | area_of_specialization | Sociology and Social Anthropology | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a03-competency-evaluation-judgement | area_enrichment_item | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a03-knowledge-institutions-policy | area_enrichment_item | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a03-method-policy-evidence-review | area_enrichment_item | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a03-method-survey-sampling | area_enrichment_item | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a03-skill-policy-brief-writing | area_enrichment_item | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a03-tool-kobotoolbox-survey | area_enrichment_item | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a04-competency-ethical-cultural-reflexivity | area_enrichment_item | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a04-knowledge-behavioural-constructs | area_enrichment_item | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a04-knowledge-identity-groups-context | area_enrichment_item | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a04-method-behavioural-research-design | area_enrichment_item | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a04-method-comparative-mixed-analysis | area_enrichment_item | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a04-skill-group-pattern-interpretation | area_enrichment_item | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a04-tool-nvivo-tagging | area_enrichment_item | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a04-tools-quantitative-alternatives | area_enrichment_item | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a34-a03-competency-inclusion-response-accountability | area_enrichment_item | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a34-a03-competency-options-impact-analysis | area_enrichment_item | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a34-a03-knowledge-regulatory-policy-cycle | area_enrichment_item | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a34-a03-method-community-scorecard | area_enrichment_item | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a34-a03-method-participation-design | area_enrichment_item | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a34-a03-method-ria | area_enrichment_item | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a34-a03-skill-public-evidence-tracking | area_enrichment_item | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a34-a03-tool-budget-imonitor | area_enrichment_item | Politics, Governance and Public Policy | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a34-a04-competency-conflict-sensitivity | area_enrichment_item | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a34-a04-competency-contextual-intervention-evaluation | area_enrichment_item | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a34-a04-method-behavioural-insights-cycle | area_enrichment_item | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area_enrichment_item:d078-a34-a04-method-conflict-analysis | area_enrichment_item | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area_enrichment_item:d078-computational-digital-social-science-agent-based-social-simulation | area_enrichment_item | Computational and Digital Social Science | long_copy_unit_over_32_words |
| area_enrichment_item:d078-computational-digital-social-science-computational-question-formulation | area_enrichment_item | Computational and Digital Social Science | long_copy_unit_over_32_words |
| area_enrichment_item:d078-computational-digital-social-science-content-analysis-and-text-classification | area_enrichment_item | Computational and Digital Social Science | long_copy_unit_over_32_words |
| area_enrichment_item:d078-computational-digital-social-science-data-provenance-and-digital-ethics | area_enrichment_item | Computational and Digital Social Science | long_copy_unit_over_32_words |
| area_enrichment_item:d078-computational-digital-social-science-digital-trace-construct-and-sampling | area_enrichment_item | Computational and Digital Social Science | long_copy_unit_over_32_words |
| area_enrichment_item:d078-computational-digital-social-science-interpretable-statistical-modeling | area_enrichment_item | Computational and Digital Social Science | long_copy_unit_over_32_words |
| area_enrichment_item:d078-computational-digital-social-science-jupyter-reproducible-environment | area_enrichment_item | Computational and Digital Social Science | long_copy_unit_over_32_words |
| area_enrichment_item:d078-computational-digital-social-science-network-analysis-method | area_enrichment_item | Computational and Digital Social Science | long_copy_unit_over_32_words |
| area_enrichment_item:d078-computational-digital-social-science-networkx-or-gephi | area_enrichment_item | Computational and Digital Social Science | long_copy_unit_over_32_words |
| area_enrichment_item:d078-computational-digital-social-science-pandas-tabular-research-data | area_enrichment_item | Computational and Digital Social Science | long_copy_unit_over_32_words |
| area_enrichment_item:d078-computational-digital-social-science-predictive-text-modeling | area_enrichment_item | Computational and Digital Social Science | long_copy_unit_over_32_words |
| area_enrichment_item:d078-computational-digital-social-science-python-social-data-workflow | area_enrichment_item | Computational and Digital Social Science | long_copy_unit_over_32_words |
| area_enrichment_item:d078-computational-digital-social-science-r-social-data-workflow | area_enrichment_item | Computational and Digital Social Science | long_copy_unit_over_32_words |
| area_enrichment_item:d078-computational-digital-social-science-reproducible-data-cleaning | area_enrichment_item | Computational and Digital Social Science | long_copy_unit_over_32_words |
| area_enrichment_item:d078-econ-agent-based-modeling | area_enrichment_item | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area_enrichment_item:d078-econ-causal-evaluation | area_enrichment_item | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area_enrichment_item:d078-econ-distributional-analysis | area_enrichment_item | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area_enrichment_item:d078-econ-labour-statistics | area_enrichment_item | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area_enrichment_item:d078-econ-national-accounts-measurement | area_enrichment_item | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area_enrichment_item:d078-econ-nigeria-microdata | area_enrichment_item | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area_enrichment_item:d078-econ-public-finance-statistics | area_enrichment_item | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area_enrichment_item:d078-econ-r-python-analysis | area_enrichment_item | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area_enrichment_item:d078-econ-time-series-analysis-and-forecasting | area_enrichment_item | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area_enrichment_item:d078-human-geography-geographical-random-forest | area_enrichment_item | Human Geography and Population Studies | long_copy_unit_over_32_words |
| area_enrichment_item:d078-human-geography-population-census-survey-admin-appraisal | area_enrichment_item | Human Geography and Population Studies | long_copy_unit_over_32_words |
| area_enrichment_item:d078-human-geography-population-demographic-estimation-projection | area_enrichment_item | Human Geography and Population Studies | long_copy_unit_over_32_words |
| area_enrichment_item:d078-human-geography-population-migration-urbanisation-interpretation | area_enrichment_item | Human Geography and Population Studies | long_copy_unit_over_32_words |
| area_enrichment_item:d078-human-geography-population-population-measures | area_enrichment_item | Human Geography and Population Studies | long_copy_unit_over_32_words |
| area_enrichment_item:d078-human-geography-population-qgis-spatial-tool | area_enrichment_item | Human Geography and Population Studies | long_copy_unit_over_32_words |
| area_enrichment_item:d078-human-geography-population-spatial-analysis-method | area_enrichment_item | Human Geography and Population Studies | long_copy_unit_over_32_words |
| area_enrichment_item:d078-human-geography-population-spatial-concepts-and-place | area_enrichment_item | Human Geography and Population Studies | long_copy_unit_over_32_words |
| area_enrichment_item:d078-human-geography-population-spatial-data-provenance-scale | area_enrichment_item | Human Geography and Population Studies | long_copy_unit_over_32_words |
| area_enrichment_item:d078-human-geography-population-spatial-pattern-communication | area_enrichment_item | Human Geography and Population Studies | long_copy_unit_over_32_words |
| area_enrichment_item:d078-soc-ai-survey-question-drafting | area_enrichment_item | Sociology and Social Anthropology | long_copy_unit_over_32_words |
| area_enrichment_item:d078-soc-digital-trace-ethics | area_enrichment_item | Sociology and Social Anthropology | long_copy_unit_over_32_words |
| area_enrichment_item:d078-soc-kobo-survey-field | area_enrichment_item | Sociology and Social Anthropology | long_copy_unit_over_32_words |
| area_enrichment_item:d078-soc-llm-assisted-coding | area_enrichment_item | Sociology and Social Anthropology | long_copy_unit_over_32_words |
| area_enrichment_item:d078-soc-llm-synthetic-pilot | area_enrichment_item | Sociology and Social Anthropology | long_copy_unit_over_32_words |
| area_enrichment_item:d078-soc-quant-text-r | area_enrichment_item | Sociology and Social Anthropology | long_copy_unit_over_32_words |
| area_enrichment_item:d078-soc-secondary-qual-analysis | area_enrichment_item | Sociology and Social Anthropology | long_copy_unit_over_32_words |
| area_enrichment_item:d078-soc-social-network-analysis | area_enrichment_item | Sociology and Social Anthropology | long_copy_unit_over_32_words |
| area_enrichment_item:d078-soc-survey-analysis-r | area_enrichment_item | Sociology and Social Anthropology | long_copy_unit_over_32_words |
| area_enrichment_item:d078-soc-survey-design | area_enrichment_item | Sociology and Social Anthropology | long_copy_unit_over_32_words |
| area_enrichment_item:d078-social-research-evaluation-evaluation-design-and-evidence | area_enrichment_item | Social Research and Evaluation | long_copy_unit_over_32_words |
| area_enrichment_item:d078-social-research-evaluation-field-and-document-method-choice | area_enrichment_item | Social Research and Evaluation | long_copy_unit_over_32_words |
| area_enrichment_item:d078-social-research-evaluation-kobo-electronic-collection | area_enrichment_item | Social Research and Evaluation | long_copy_unit_over_32_words |
| area_enrichment_item:d078-social-research-evaluation-programme-theory-and-logic | area_enrichment_item | Social Research and Evaluation | long_copy_unit_over_32_words |
| area_enrichment_item:d078-social-research-evaluation-qualitative-coding-options | area_enrichment_item | Social Research and Evaluation | long_copy_unit_over_32_words |
| area_enrichment_item:d078-social-research-evaluation-quantitative-analysis-choice | area_enrichment_item | Social Research and Evaluation | long_copy_unit_over_32_words |
| area_enrichment_item:d078-social-research-evaluation-research-ethics-data-stewardship | area_enrichment_item | Social Research and Evaluation | long_copy_unit_over_32_words |
| area_enrichment_item:d078-social-research-evaluation-sampling-and-measurement | area_enrichment_item | Social Research and Evaluation | long_copy_unit_over_32_words |
| area_enrichment_item:d078-social-research-evaluation-spss-quantitative-tool | area_enrichment_item | Social Research and Evaluation | long_copy_unit_over_32_words |
| area_enrichment_item:d078-social-research-evaluation-stakeholder-use-and-reporting | area_enrichment_item | Social Research and Evaluation | long_copy_unit_over_32_words |
| area_enrichment_item:d078-social-research-evaluation-study-question-design | area_enrichment_item | Social Research and Evaluation | long_copy_unit_over_32_words |
| area_enrichment_item:econ-a1 | area_enrichment_item | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area_enrichment_item:econ-c1 | area_enrichment_item | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area_enrichment_item:econ-c2 | area_enrichment_item | Economics and Applied Economic Analysis | long_copy_unit_over_32_words |
| area_enrichment_item:soc-c2 | area_enrichment_item | Sociology and Social Anthropology | long_copy_unit_over_32_words |
| area_enrichment_item:soc-m3 | area_enrichment_item | Sociology and Social Anthropology | long_copy_unit_over_32_words |
| area_tool_option:d078-a04-tool-limesurvey | area_tool_option | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area_tool_option:d078-a04-tool-nvivo | area_tool_option | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area_tool_option:d078-a04-tool-python | area_tool_option | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area_tool_option:d078-a04-tool-r | area_tool_option | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area_tool_option:d078-a04-tool-spss | area_tool_option | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area_tool_option:d078-a04-tool-stata | area_tool_option | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| area_tool_option:d078-a04-tool-taguette | area_tool_option | Social Behaviour and Interaction | long_copy_unit_over_32_words |
| domain-emerging:d078-emerging-ai-assisted-cross-source-data-harmonisation | domain_emerging_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-emerging:d078-emerging-ai-assisted-research-data-metadata-curation | domain_emerging_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-emerging:d078-emerging-ai-assisted-social-text-annotation | domain_emerging_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-emerging:d078-emerging-ai-social-impact-assessment | domain_emerging_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-emerging:d078-experimental-synthetic-respondent-and-llm-agent-testing | domain_emerging_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-emerging:d078-power-bi-research-reporting-tool | domain_emerging_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-emerging:d078-tableau-research-visualisation-tool | domain_emerging_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-agent-based-modeling | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-anova-and-repeated-measures | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-barnard-exact-test | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-boschloo-exact-test | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-care-for-research-data | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-casevo-tool | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-chi-square-tests | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-computational-social-research | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-confirmatory-factor-analysis | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-conversation-analysis | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-count-regression | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-critical-discourse-analysis | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-evaluate-evidence-and-limits | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-exploratory-factor-analysis | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-exponential-random-graph-models | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-fisher-exact-test | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-friedman-test | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-interpretative-phenomenological-analysis | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-item-response-theory | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-jamovi-tool | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-jupyter | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-kendall-rank-correlation | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-kruskal-wallis-test | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-linear-regression-ols | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-llm-assisted-text-construct-measurement | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-logistic-regression | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-matplotlib-tool | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-mesa-tool | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-mixed-methods | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-ml-survey-nonresponse-adjustment | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-multinomial-logistic-regression | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-networkx-tool | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-nlp-and-text-mining | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-nvivo-tool | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-observation-ethnography | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-odd-agent-model-documentation | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-ordinal-regression | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-pandas-tool | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-pearson-correlation | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-probit-regression | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-process-tracing | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-python | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-qualitative-approach | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-r-mirt-tool | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-r-psych-tool | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-regularized-linear-regression | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-reliability-estimation-alpha-omega | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-research-question-design | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-scikit-learn | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-social-network-tool | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-spatial-autocorrelation-moran-lisa | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-spatial-regression-models | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-spearman-rank-correlation | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-spss-tool | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-statnet-ergm-tool | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-statsmodels | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-supervised-machine-learning | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-t-tests | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-tree-ensemble-prediction | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-tropy-archival-material-manager | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-wilcoxon-rank-tests | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:d078-zotero-reference-manager | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:measurement-and-operationalisation | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-item:systematic-and-scoping-evidence-synthesis | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-method:network-analysis | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain-method:social-network-analysis | domain_learning_item | programme/domain/role | long_copy_unit_over_32_words |
| domain:D078 | domain_route | programme/domain/role | long_copy_unit_over_32_words |
| programme-outcome:sociology:PSY 204:6 | programme_outcome | programme/domain/role | long_copy_unit_over_32_words |
| programme-outcome:sociology:SOC 201:5 | programme_outcome | programme/domain/role | long_copy_unit_over_32_words |
| programme-outcome:sociology:SOC 407:1 | programme_outcome | programme/domain/role | long_copy_unit_over_32_words |
| programme-theme:sociology:african_societies | programme_theme | programme/domain/role | long_copy_unit_over_32_words |
| programme-theme:sociology:applied_practice | programme_theme | programme/domain/role | long_copy_unit_over_32_words |
| programme-theme:sociology:people | programme_theme | programme/domain/role | long_copy_unit_over_32_words |
| programme-theme:sociology:research | programme_theme | programme/domain/role | long_copy_unit_over_32_words |
| programme-theme:sociology:shared_communication | programme_theme | programme/domain/role | long_copy_unit_over_32_words |
| programme-theme:sociology:shared_enterprise | programme_theme | programme/domain/role | long_copy_unit_over_32_words |
| programme-theme:sociology:shared_nigerian_culture | programme_theme | programme/domain/role | long_copy_unit_over_32_words |
| programme-theme:sociology:shared_peace_conflict | programme_theme | programme/domain/role | long_copy_unit_over_32_words |
| programme-theme:sociology:social_change | programme_theme | programme/domain/role | long_copy_unit_over_32_words |
| programme-theme:sociology:social_issues | programme_theme | programme/domain/role | long_copy_unit_over_32_words |
| programme-theme:sociology:technology | programme_theme | programme/domain/role | long_copy_unit_over_32_words |
| role-item:102:genomics-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:106:conduct-research-interview-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:110:conduct-qualitative-research-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:111:interpret-pedigree-charts-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:112:family-law-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:117:ethics-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:11:religious-studies-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:122:family-law-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:129:fraud-detection-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:12:statistics-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:132:genomics-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:133:geographic-information-systems-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:135:geological-time-scale-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:136:geology-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:137:good-governance-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:138:government-policy-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:139:government-policy-implementation-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:13:analyse-market-financial-trends-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:141:history-of-literature-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:146:international-business-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:147:international-commercial-transactions-rules-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:150:international-trade-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:151:interpret-current-data-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:152:interpret-pedigree-charts-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:154:legal-requirements-in-the-social-sector-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:155:legal-research-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:156:legal-studies-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:157:liaise-with-local-authorities-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:158:liaise-with-local-authorities-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:159:literature-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:15:apply-statistical-analysis-techniques-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:161:maintain-relations-with-local-representatives-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:162:manage-database-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:163:manage-government-funded-programmes-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:164:management-consulting-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:165:market-analysis-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:167:market-research-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:168:marketing-analytics-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:169:mathematical-modelling-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:16:archaeology-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:170:mathematical-modelling-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:171:mathematics-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:172:meet-standards-of-practice-in-social-services-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:173:monitor-national-economy-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:17:business-analysis-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:18:business-management-principles-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:1:history-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:21:consider-economic-criteria-in-decision-making-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:22:develop-economic-policies-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:23:develop-organisational-policies-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:24:environmental-economics-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:25:european-integration-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:26:gather-data-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:27:international-business-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:28:maintain-relations-with-local-representatives-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:29:maintain-relationships-with-government-agencies-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:2:financial-forecasting-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:30:mathematical-economics-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:34:osteology-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:35:paleography-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:36:policy-analysis-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:38:politics-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:39:public-finance-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:3:interview-techniques-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:40:quantitative-analysis-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:41:research-design-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:42:sanskrit-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:43:scientific-modelling-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:44:scientific-research-methodology-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:45:social-sciences-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:46:strategic-planning-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:47:surveying-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:48:tax-legislation-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:4:social-network-analysis-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:50:urban-planning-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:51:use-data-processing-techniques-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:52:write-research-proposals-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:53:accounting-techniques-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:54:action-research-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:56:advise-legislators-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:57:advise-on-legislative-acts-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:59:analyse-legislation-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:5:sociology-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:61:analyse-recorded-sources-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:62:applied-zoology-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:63:apply-problem-solving-in-social-service-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:66:archaeology-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:68:assess-risk-factors-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:69:audit-techniques-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:6:spatial-planning-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:70:biology-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:72:biometrics-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:73:bookkeeping-regulations-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:74:budgetary-principles-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:75:business-analytics-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:76:cadastral-taxation-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:77:carry-out-strategic-research-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:78:cartography-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:79:civil-law-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:80:commercial-law-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:82:computer-simulation-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:83:conduct-psychological-research-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:84:conduct-qualitative-research-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:85:conduct-research-interview-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:86:conservation-techniques-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:8:multidisciplinary-research-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:98:civil-law-optional | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-item:9:politics-essential | role_item_candidate | programme/domain/role | long_copy_unit_over_32_words |
| role-task:d078:anthropologist | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role-task:d078:archaeologist | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role-task:d078:behavioural-scientist | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role-task:d078:business-economics-researcher | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role-task:d078:criminologist | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role-task:d078:demographer | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role-task:d078:economic-adviser | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role-task:d078:economic-development-coordinator | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role-task:d078:economic-policy-officer | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role-task:d078:economist | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role-task:d078:genealogist | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role-task:d078:geographer | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role-task:d078:media-scientist | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role-task:d078:political-scientist | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role-task:d078:social-work-researcher | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role-task:d078:sociologist | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role-task:d078:statistician | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role-task:d078:tax-policy-analyst | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role-task:d078:thanatology-researcher | role_task_family | programme/domain/role | long_copy_unit_over_32_words, missing_task_output |
| role:D078:10:political-scientist | role | programme/domain/role | long_copy_unit_over_32_words |
| role:D078:11:economic-adviser | role | programme/domain/role | long_copy_unit_over_32_words |
| role:D078:12:genealogist | role | programme/domain/role | long_copy_unit_over_32_words |
| role:D078:15:thanatology-researcher | role | programme/domain/role | long_copy_unit_over_32_words |
| role:D078:16:economist | role | programme/domain/role | long_copy_unit_over_32_words |
| role:D078:17:economic-development-coordinator | role | programme/domain/role | long_copy_unit_over_32_words |
| role:D078:18:statistician | role | programme/domain/role | long_copy_unit_over_32_words |
| role:D078:19:anthropologist | role | programme/domain/role | long_copy_unit_over_32_words |
| role:D078:1:criminologist | role | programme/domain/role | long_copy_unit_over_32_words |
| role:D078:21:tax-policy-analyst | role | programme/domain/role | long_copy_unit_over_32_words |
| role:D078:22:geographer | role | programme/domain/role | long_copy_unit_over_32_words |
| role:D078:24:demographer | role | programme/domain/role | long_copy_unit_over_32_words |
| role:D078:3:sociologist | role | programme/domain/role | long_copy_unit_over_32_words |
| role:D078:4:business-economics-researcher | role | programme/domain/role | long_copy_unit_over_32_words |
| role:D078:5:media-scientist | role | programme/domain/role | long_copy_unit_over_32_words |
| role:D078:6:archaeologist | role | programme/domain/role | long_copy_unit_over_32_words |
| role:D078:7:economic-policy-officer | role | programme/domain/role | long_copy_unit_over_32_words |
| role:D078:8:social-work-researcher | role | programme/domain/role | long_copy_unit_over_32_words |
| role:D078:9:behavioural-scientist | role | programme/domain/role | long_copy_unit_over_32_words |

## Method and limits

This is a read-only content inventory plus a separate copy-only repair pass. Static JSX text is collected from the listed D078-related screens, but runtime-generated report text and API-only programme copy may need a separate pass. The technical-term list is a candidate finder, not an exhaustive dictionary. Final clearance still requires term-by-term editorial and subject-matter review of every visible unit, review of the remaining flagged area/task/tool/role copy, and inspection of all rendered routes. No browser or rendered visual acceptance is claimed.

Machine-readable worklist: data/career-mapping/_audit/D078_STUDENT_FACING_COPY_SWEEP_2026_11_04.json
