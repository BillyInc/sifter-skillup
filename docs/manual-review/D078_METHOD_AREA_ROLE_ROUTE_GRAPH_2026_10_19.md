# D078 method → area → role route graph (19 October 2026)

This is the route-graph design artifact to review **before UI implementation**. It is not student-visible and does not regenerate or apply SQL.

## What the graph now models

- The existing three compulsory D078 domain foundations remain the required starting spine; their order is recommended teaching order, not a claim that one foundation is a technical prerequisite of another.
- After all three, one or more method choices open. A learner may choose a single method or a named, evidence-backed combination design.
- Method routes connect to area task families, then to area-owned learning items and context-specific tools, then to roles already supported inside those areas, and finally to role-owned learning items.
- Selected methods rank all seven canonical areas; non-top-ranked areas remain available. Role appearance is inherited only through the reviewed area→role relation. A domain method does not by itself claim role competence or a role requirement.
- Requirement lanes remain separate from content categories. The three compulsory domain foundations gate method choice; other items retain their existing needed/useful/optional/conditional scope and can be skipped unless a reviewed, route-scoped dependency says otherwise.

## Programme-to-domain handoff

The graph includes **14 Sociology curriculum themes and 236 programme outcomes**, preserving the outcome-to-theme grouping. No five-theme cap or outcome truncation is applied. Themes included: African and Nigerian societies, Social work and practical change, Politics and organisations, Ideas and foundations, People, groups and society, Research and evidence, Communication and academic writing, Entrepreneurship and venture creation, Nigerian peoples and culture, Peace, conflict and security, Philosophy and reasoning, Social change and development, Inequality, gender and social problems, Technology and information.

It connects the Sociology programme to the Social Sciences domain and carries source-supported prior-learning context into the domain overview before additional foundations or route choices appear. The graph’s ordered layers are:

0. Domain orientation and the Sociology-programme handoff.
1. Compulsory domain foundations (the three shared progression gates).
2. Useful field-wide learning, including applicable knowledge, practices, methods and tools.
3. Optional or conditional preparation, scoped to the task or route it supports.
4. Method choice, including only the evidence-backed multi-method designs.

All 14 themes and 236 outcomes remain at the programme level; only individually supported course/outcome context is carried into the domain transition. This avoids both hiding curriculum context and claiming that every Sociology outcome teaches every D078 task.

The direct programme-domain source contains 12 individually resolved course-anchor rows and 12 transferable-evidence rows. Its aggregate fields report 19 and 46, respectively; those aggregates do not match the detail rows. The graph uses the individually resolved rows only and excludes those aggregate figures from learner-facing display. Directly supported programme context is not a claim that the degree teaches every domain task or that the learner has mastered it.

SOC 301 and SSC 302 curriculum outcomes are also connected to the relevant method choices they introduce. The route continues from those programme outcomes into the three domain foundations, useful/optional domain learning, then selected methods and their area/role branches.

## Social Sciences domain overview contract

The D078 domain node now carries the approved overview plus the six orientation fields that the backend can individually source-approve for display: what the field studies; what practitioners may do; example questions; possible outputs; how the work may happen; and how the Sociology programme fits. Each orientation field is accompanied by its reviewed evidence links and locators. This makes the graph carry the domain overview itself, rather than only a short summary and the programme-transition paragraph.

The contract does not invent separately approved global context, Nigerian practice context, entry expectations, opportunities/constraints, decision guidance or related-programme claims where the API's field-level evidence gate does not approve those fields. Nigeria-specific curriculum context remains explicit in the programme-fit section; international occupational examples remain bounded to the cited ILO groups. The existing `migration_domain_student_orientation_2026-09-18.sql` already persists this same approved orientation content. No D078 learning-content SQL seed is regenerated for a graph-only copy; route-graph SQL persistence is not yet defined and remains pending the UI projection/design decision.

## Graph totals

- Canonical areas: **7**
- Routed roles: **19**
- Method nodes with at least one evidenced area-task route: **22**
- Method → area route pairs: **116**
- Named multi-method designs: **9**
- Combination → area route pairs: **31**
- Graph nodes/edges: **1519 / 11645**
- Legacy area nodes: **0**

## Evidence-backed multi-method patterns

These are **9 named, evidence-backed designs**, not every possible mathematical pairing of methods. There are **7 supported two-method patterns**, one case-study design using four complementary evidence approaches, and one participatory design frame that requires the participatory approach but lets the learner choose one or more suitable evidence methods. The four methods listed in that frame are options, not a bundle that every learner must use.

- **combo:exploratory-sequential**: 2 coordinated methods; 5 evidenced area routes.
- **combo:explanatory-sequential**: 2 coordinated methods; 4 evidenced area routes.
- **combo:convergent-survey-interview**: 2 coordinated methods; 4 evidenced area routes.
- **combo:focus-group-to-survey**: 2 coordinated methods; 5 evidenced area routes.
- **combo:survey-followup-focus-group**: 2 coordinated methods; 5 evidenced area routes.
- **combo:case-study-multiple-sources**: 4 coordinated methods; 2 evidenced area routes.
- **combo:interview-and-observation**: 2 coordinated methods; 3 evidenced area routes.
- **combo:document-and-interview-elicitation**: 2 coordinated methods; 3 evidenced area routes.
- **combo:participatory-method-choice**: a design frame with 1 required approach and 4 selectable evidence methods (choose a suitable subset); area routes are derived from the learner's chosen methods.

Each combination node includes why it can be used, a practical sequence, when it fits, limitations, foundation links, and external/local source references. The sources support the design patterns; they do not make combinations compulsory.

## Route counts by area

- Computational and Digital Social Science: 18 method-route links
- Economics and Applied Economic Analysis: 11 method-route links
- Human Geography and Population Studies: 11 method-route links
- Politics, Governance and Public Policy: 19 method-route links
- Social Behaviour and Interaction: 19 method-route links
- Social Research and Evaluation: 19 method-route links
- Sociology and Social Anthropology: 19 method-route links

## Full method-to-area route inventory

Counts are audit aids: `domain items` includes method-task-linked domain items plus direct method extensions; `area items` are area-owned item nodes; `tools` are linked domain and area tools. The full graph preserves each item ID and relationship type.

| Method | Area | Task families | Domain items | Area items | Tools | Supported roles |
|---|---|---:|---:|---:|---:|---:|
| Agent-based modelling of social processes | Computational and Digital Social Science | 1 | 11 | 5 | 3 | 1 |
| Agent-based modelling of social processes | Economics and Applied Economic Analysis | 1 | 8 | 2 | 3 | 6 |
| Agent-based modelling of social processes | Social Behaviour and Interaction | 1 | 11 | 3 | 3 | 3 |
| Agent-based modelling of social processes | Sociology and Social Anthropology | 1 | 7 | 3 | 3 | 7 |
| Archival and historical research | Computational and Digital Social Science | 2 | 24 | 15 | 0 | 1 |
| Archival and historical research | Economics and Applied Economic Analysis | 1 | 3 | 3 | 0 | 6 |
| Archival and historical research | Human Geography and Population Studies | 2 | 20 | 9 | 4 | 3 |
| Archival and historical research | Politics, Governance and Public Policy | 2 | 15 | 4 | 0 | 4 |
| Archival and historical research | Social Research and Evaluation | 1 | 26 | 6 | 0 | 2 |
| Archival and historical research | Sociology and Social Anthropology | 2 | 13 | 2 | 0 | 7 |
| Case-study and comparative-case design | Computational and Digital Social Science | 2 | 24 | 15 | 0 | 1 |
| Case-study and comparative-case design | Economics and Applied Economic Analysis | 2 | 7 | 2 | 0 | 6 |
| Case-study and comparative-case design | Human Geography and Population Studies | 2 | 20 | 9 | 4 | 3 |
| Case-study and comparative-case design | Politics, Governance and Public Policy | 2 | 6 | 5 | 0 | 4 |
| Case-study and comparative-case design | Social Behaviour and Interaction | 2 | 6 | 5 | 2 | 3 |
| Case-study and comparative-case design | Social Research and Evaluation | 2 | 29 | 11 | 0 | 2 |
| Case-study and comparative-case design | Sociology and Social Anthropology | 2 | 13 | 2 | 0 | 7 |
| Computational and digital social-research methods | Computational and Digital Social Science | 3 | 34 | 20 | 2 | 1 |
| Computational and digital social-research methods | Economics and Applied Economic Analysis | 2 | 19 | 5 | 2 | 6 |
| Computational and digital social-research methods | Politics, Governance and Public Policy | 1 | 15 | 2 | 2 | 4 |
| Computational and digital social-research methods | Social Behaviour and Interaction | 3 | 16 | 8 | 2 | 3 |
| Computational and digital social-research methods | Sociology and Social Anthropology | 1 | 11 | 4 | 2 | 7 |
| Discourse and conversation analysis | Computational and Digital Social Science | 1 | 14 | 5 | 0 | 1 |
| Discourse and conversation analysis | Politics, Governance and Public Policy | 2 | 16 | 4 | 0 | 4 |
| Discourse and conversation analysis | Social Behaviour and Interaction | 2 | 6 | 5 | 2 | 3 |
| Discourse and conversation analysis | Social Research and Evaluation | 2 | 26 | 12 | 0 | 2 |
| Discourse and conversation analysis | Sociology and Social Anthropology | 2 | 11 | 1 | 0 | 7 |
| Document and content analysis | Computational and Digital Social Science | 1 | 16 | 5 | 2 | 1 |
| Document and content analysis | Human Geography and Population Studies | 1 | 19 | 4 | 2 | 3 |
| Document and content analysis | Politics, Governance and Public Policy | 3 | 19 | 6 | 2 | 4 |
| Document and content analysis | Social Research and Evaluation | 1 | 27 | 6 | 2 | 2 |
| Document and content analysis | Sociology and Social Anthropology | 2 | 14 | 2 | 2 | 7 |
| Evidence synthesis: systematic reviews and scoping reviews | Computational and Digital Social Science | 1 | 15 | 5 | 0 | 1 |
| Evidence synthesis: systematic reviews and scoping reviews | Economics and Applied Economic Analysis | 1 | 7 | 0 | 0 | 6 |
| Evidence synthesis: systematic reviews and scoping reviews | Human Geography and Population Studies | 1 | 18 | 4 | 0 | 3 |
| Evidence synthesis: systematic reviews and scoping reviews | Politics, Governance and Public Policy | 2 | 13 | 5 | 0 | 4 |
| Evidence synthesis: systematic reviews and scoping reviews | Social Behaviour and Interaction | 1 | 10 | 3 | 4 | 3 |
| Evidence synthesis: systematic reviews and scoping reviews | Social Research and Evaluation | 2 | 23 | 11 | 0 | 2 |
| Evidence synthesis: systematic reviews and scoping reviews | Sociology and Social Anthropology | 1 | 6 | 2 | 0 | 7 |
| Experiments, quasi-experiments and causal inference | Computational and Digital Social Science | 1 | 8 | 5 | 0 | 1 |
| Experiments, quasi-experiments and causal inference | Economics and Applied Economic Analysis | 2 | 7 | 1 | 0 | 6 |
| Experiments, quasi-experiments and causal inference | Politics, Governance and Public Policy | 2 | 14 | 4 | 0 | 4 |
| Experiments, quasi-experiments and causal inference | Social Behaviour and Interaction | 2 | 12 | 5 | 4 | 3 |
| Experiments, quasi-experiments and causal inference | Social Research and Evaluation | 2 | 29 | 11 | 0 | 2 |
| Focus groups and workshops | Human Geography and Population Studies | 1 | 6 | 5 | 2 | 3 |
| Focus groups and workshops | Politics, Governance and Public Policy | 2 | 6 | 5 | 2 | 4 |
| Focus groups and workshops | Social Behaviour and Interaction | 2 | 10 | 5 | 6 | 3 |
| Focus groups and workshops | Social Research and Evaluation | 2 | 30 | 11 | 2 | 2 |
| Focus groups and workshops | Sociology and Social Anthropology | 3 | 8 | 6 | 2 | 7 |
| Interviews | Politics, Governance and Public Policy | 1 | 13 | 2 | 2 | 4 |
| Interviews | Social Behaviour and Interaction | 1 | 6 | 2 | 4 | 3 |
| Interviews | Social Research and Evaluation | 2 | 29 | 11 | 2 | 2 |
| Interviews | Sociology and Social Anthropology | 3 | 7 | 6 | 2 | 7 |
| Longitudinal, panel and multilevel data | Computational and Digital Social Science | 1 | 18 | 10 | 1 | 1 |
| Longitudinal, panel and multilevel data | Economics and Applied Economic Analysis | 2 | 14 | 3 | 1 | 6 |
| Longitudinal, panel and multilevel data | Human Geography and Population Studies | 2 | 20 | 9 | 5 | 3 |
| Longitudinal, panel and multilevel data | Politics, Governance and Public Policy | 2 | 14 | 4 | 1 | 4 |
| Longitudinal, panel and multilevel data | Social Behaviour and Interaction | 2 | 17 | 5 | 5 | 3 |
| Longitudinal, panel and multilevel data | Social Research and Evaluation | 2 | 29 | 11 | 1 | 2 |
| Longitudinal, panel and multilevel data | Sociology and Social Anthropology | 1 | 11 | 0 | 1 | 7 |
| Mixed methods (combining numerical and qualitative evidence when justified) | Computational and Digital Social Science | 1 | 16 | 10 | 0 | 1 |
| Mixed methods (combining numerical and qualitative evidence when justified) | Economics and Applied Economic Analysis | 1 | 5 | 0 | 0 | 6 |
| Mixed methods (combining numerical and qualitative evidence when justified) | Politics, Governance and Public Policy | 1 | 3 | 2 | 0 | 4 |
| Mixed methods (combining numerical and qualitative evidence when justified) | Social Behaviour and Interaction | 1 | 8 | 3 | 4 | 3 |
| Mixed methods (combining numerical and qualitative evidence when justified) | Social Research and Evaluation | 2 | 27 | 11 | 0 | 2 |
| Mixed methods (combining numerical and qualitative evidence when justified) | Sociology and Social Anthropology | 2 | 9 | 6 | 0 | 7 |
| Network analysis | Computational and Digital Social Science | 2 | 20 | 10 | 3 | 1 |
| Network analysis | Politics, Governance and Public Policy | 1 | 6 | 2 | 3 | 4 |
| Network analysis | Social Behaviour and Interaction | 2 | 8 | 6 | 5 | 3 |
| Network analysis | Social Research and Evaluation | 1 | 27 | 6 | 3 | 2 |
| Network analysis | Sociology and Social Anthropology | 1 | 5 | 5 | 3 | 7 |
| Observation and ethnographic approaches | Human Geography and Population Studies | 1 | 3 | 5 | 0 | 3 |
| Observation and ethnographic approaches | Social Behaviour and Interaction | 2 | 12 | 5 | 6 | 3 |
| Observation and ethnographic approaches | Social Research and Evaluation | 1 | 24 | 6 | 0 | 2 |
| Observation and ethnographic approaches | Sociology and Social Anthropology | 3 | 5 | 6 | 0 | 7 |
| Participatory and action research | Human Geography and Population Studies | 1 | 4 | 5 | 0 | 3 |
| Participatory and action research | Politics, Governance and Public Policy | 2 | 3 | 5 | 0 | 4 |
| Participatory and action research | Social Behaviour and Interaction | 3 | 10 | 7 | 4 | 3 |
| Participatory and action research | Social Research and Evaluation | 2 | 28 | 11 | 0 | 2 |
| Participatory and action research | Sociology and Social Anthropology | 2 | 4 | 8 | 0 | 7 |
| Programme evaluation and theory of change | Computational and Digital Social Science | 1 | 20 | 10 | 0 | 1 |
| Programme evaluation and theory of change | Economics and Applied Economic Analysis | 2 | 9 | 3 | 0 | 6 |
| Programme evaluation and theory of change | Politics, Governance and Public Policy | 2 | 8 | 4 | 0 | 4 |
| Programme evaluation and theory of change | Social Behaviour and Interaction | 1 | 7 | 2 | 0 | 3 |
| Programme evaluation and theory of change | Social Research and Evaluation | 1 | 24 | 5 | 0 | 2 |
| Psychometrics and scale construction | Computational and Digital Social Science | 1 | 16 | 10 | 0 | 1 |
| Psychometrics and scale construction | Politics, Governance and Public Policy | 1 | 11 | 2 | 0 | 4 |
| Psychometrics and scale construction | Social Behaviour and Interaction | 2 | 14 | 5 | 2 | 3 |
| Psychometrics and scale construction | Social Research and Evaluation | 1 | 24 | 6 | 0 | 2 |
| Psychometrics and scale construction | Sociology and Social Anthropology | 1 | 7 | 3 | 0 | 7 |
| Qualitative methods (working with words, observations and meaning) | Computational and Digital Social Science | 1 | 16 | 5 | 2 | 1 |
| Qualitative methods (working with words, observations and meaning) | Politics, Governance and Public Policy | 1 | 14 | 2 | 2 | 4 |
| Qualitative methods (working with words, observations and meaning) | Social Behaviour and Interaction | 1 | 7 | 2 | 4 | 3 |
| Qualitative methods (working with words, observations and meaning) | Social Research and Evaluation | 2 | 30 | 11 | 2 | 2 |
| Qualitative methods (working with words, observations and meaning) | Sociology and Social Anthropology | 5 | 19 | 8 | 2 | 7 |
| Quantitative methods (working with numbers) | Computational and Digital Social Science | 2 | 26 | 15 | 1 | 1 |
| Quantitative methods (working with numbers) | Economics and Applied Economic Analysis | 2 | 16 | 3 | 1 | 6 |
| Quantitative methods (working with numbers) | Human Geography and Population Studies | 2 | 22 | 9 | 5 | 3 |
| Quantitative methods (working with numbers) | Politics, Governance and Public Policy | 1 | 15 | 2 | 1 | 4 |
| Quantitative methods (working with numbers) | Social Behaviour and Interaction | 1 | 16 | 2 | 3 | 3 |
| Quantitative methods (working with numbers) | Social Research and Evaluation | 2 | 31 | 11 | 1 | 2 |
| Quantitative methods (working with numbers) | Sociology and Social Anthropology | 2 | 19 | 3 | 1 | 7 |
| Social network analysis | Computational and Digital Social Science | 2 | 20 | 10 | 3 | 1 |
| Social network analysis | Politics, Governance and Public Policy | 1 | 6 | 2 | 3 | 4 |
| Social network analysis | Social Behaviour and Interaction | 2 | 8 | 6 | 5 | 3 |
| Social network analysis | Social Research and Evaluation | 1 | 27 | 6 | 3 | 2 |
| Social network analysis | Sociology and Social Anthropology | 2 | 6 | 8 | 3 | 7 |
| Spatial analysis and mapping with suitable social data | Computational and Digital Social Science | 1 | 17 | 10 | 0 | 1 |
| Spatial analysis and mapping with suitable social data | Human Geography and Population Studies | 2 | 19 | 9 | 4 | 3 |
| Surveys and questionnaire design | Computational and Digital Social Science | 1 | 17 | 10 | 1 | 1 |
| Surveys and questionnaire design | Economics and Applied Economic Analysis | 1 | 11 | 0 | 1 | 6 |
| Surveys and questionnaire design | Human Geography and Population Studies | 1 | 17 | 4 | 1 | 3 |
| Surveys and questionnaire design | Politics, Governance and Public Policy | 1 | 12 | 2 | 1 | 4 |
| Surveys and questionnaire design | Social Behaviour and Interaction | 2 | 19 | 5 | 7 | 3 |
| Surveys and questionnaire design | Social Research and Evaluation | 1 | 25 | 6 | 1 | 2 |
| Surveys and questionnaire design | Sociology and Social Anthropology | 1 | 8 | 3 | 1 | 7 |

## Combination-to-area downstream inventory

These are available branches after selecting the named design and area. Role-owned items remain behind a role choice; counts here deliberately do not include them.

| Combination | Area | Task families | Available items | Tools | Supported roles |
|---|---|---:|---:|---:|---:|
| combo:exploratory-sequential | Computational and Digital Social Science | 0 | 0 | 0 | 1 |
| combo:exploratory-sequential | Politics, Governance and Public Policy | 0 | 0 | 0 | 4 |
| combo:exploratory-sequential | Social Behaviour and Interaction | 0 | 0 | 0 | 3 |
| combo:exploratory-sequential | Social Research and Evaluation | 0 | 0 | 0 | 2 |
| combo:exploratory-sequential | Sociology and Social Anthropology | 0 | 0 | 0 | 7 |
| combo:explanatory-sequential | Politics, Governance and Public Policy | 0 | 0 | 0 | 4 |
| combo:explanatory-sequential | Social Behaviour and Interaction | 0 | 0 | 0 | 3 |
| combo:explanatory-sequential | Social Research and Evaluation | 0 | 0 | 0 | 2 |
| combo:explanatory-sequential | Sociology and Social Anthropology | 0 | 0 | 0 | 7 |
| combo:convergent-survey-interview | Politics, Governance and Public Policy | 0 | 0 | 0 | 4 |
| combo:convergent-survey-interview | Social Behaviour and Interaction | 0 | 0 | 0 | 3 |
| combo:convergent-survey-interview | Social Research and Evaluation | 0 | 0 | 0 | 2 |
| combo:convergent-survey-interview | Sociology and Social Anthropology | 0 | 0 | 0 | 7 |
| combo:focus-group-to-survey | Human Geography and Population Studies | 0 | 0 | 0 | 3 |
| combo:focus-group-to-survey | Politics, Governance and Public Policy | 0 | 0 | 0 | 4 |
| combo:focus-group-to-survey | Social Behaviour and Interaction | 0 | 0 | 0 | 3 |
| combo:focus-group-to-survey | Social Research and Evaluation | 0 | 0 | 0 | 2 |
| combo:focus-group-to-survey | Sociology and Social Anthropology | 0 | 0 | 0 | 7 |
| combo:survey-followup-focus-group | Human Geography and Population Studies | 0 | 0 | 0 | 3 |
| combo:survey-followup-focus-group | Politics, Governance and Public Policy | 0 | 0 | 0 | 4 |
| combo:survey-followup-focus-group | Social Behaviour and Interaction | 0 | 0 | 0 | 3 |
| combo:survey-followup-focus-group | Social Research and Evaluation | 0 | 0 | 0 | 2 |
| combo:survey-followup-focus-group | Sociology and Social Anthropology | 0 | 0 | 0 | 7 |
| combo:case-study-multiple-sources | Social Research and Evaluation | 0 | 0 | 0 | 2 |
| combo:case-study-multiple-sources | Sociology and Social Anthropology | 0 | 0 | 0 | 7 |
| combo:interview-and-observation | Social Behaviour and Interaction | 0 | 0 | 0 | 3 |
| combo:interview-and-observation | Social Research and Evaluation | 0 | 0 | 0 | 2 |
| combo:interview-and-observation | Sociology and Social Anthropology | 0 | 0 | 0 | 7 |
| combo:document-and-interview-elicitation | Politics, Governance and Public Policy | 0 | 0 | 0 | 4 |
| combo:document-and-interview-elicitation | Social Research and Evaluation | 0 | 0 | 0 | 2 |
| combo:document-and-interview-elicitation | Sociology and Social Anthropology | 0 | 0 | 0 | 7 |

## Guardrails and interpretation

1. “Recommended” means the selected method has a recorded task-family connection to that area; it does not mean other areas are prohibited.
2. “Roles in this area” means the existing reviewed D078 area-role link applies. The graph does not claim that a learner’s method choice alone qualifies them for a role.
3. Area items/tools are surfaced below the method only when the area task route already links them. Tool edges are supportive options, not blockers or proof of skill.
4. Multi-method routes appear only as explicit designs with integration logic. Case study is treated as a design that may use several evidence methods, not as a mutually exclusive data-collection method.
5. The graph is still a pre-implementation design artifact. Verify the serialized graph and route examples, then implement its projections in the UI; only after that should the student-facing gate be considered.

## Sources for combinations

- [University of Manchester: Social Network Analysis](https://methods.manchester.ac.uk/archive/survey-and-statistical-methods/social-network-analysis/) — supports: SNA studies relations among actors/nodes, ties/edges and actor attributes; provides method-specific introductory explanation. Limit: An introductory methods page; it does not establish SNA as necessary for every sociology or D078 route.
- [Columbia University: Social Network Analysis](https://www.publichealth.columbia.edu/research/population-health-methods/social-network-analysis) — supports: Distinction between attribute and relational data, network boundaries, graph representations, and examples of network measures. Limit: Population-health examples; measures and interpretation must be selected for the social-science question and data quality.
- [NetworkX Guides: Facebook Network Analysis](https://networkx.org/nx-guides/content/exploratory_notebooks/facebook_notebook.html) — supports: Free applied tutorial showing a social-network dataset represented and analysed with NetworkX. Limit: A Facebook friend-network example; not a general sampling/ethics guide and not transferable as a claim about other populations.
- [NetworkX official tutorial](https://networkx.org/documentation/stable/tutorial.html) — supports: Official reference for representing graph nodes/edges, attributes and basic graph operations; appropriate as a tool learning resource after the method is chosen. Limit: Software documentation teaches implementation, not sound social-network research design, data collection or ethical practice.
- [Fetters, Curry & Creswell: Achieving Integration in Mixed Methods Designs](https://pmc.ncbi.nlm.nih.gov/articles/PMC4097839/) — supports: Exploratory sequential, explanatory sequential and convergent mixed-method designs; integration must be planned across design, methods and interpretation. Limit: Methods paper, with health-care examples; it supports design logic, not a claim that every D078 task needs mixed methods.
- [Selecting, Designing, and Developing Your Questionnaire](https://pmc.ncbi.nlm.nih.gov/articles/PMC420179/) — supports: Qualitative exploration, including focus groups, can inform questionnaire concepts and response ranges; surveys are not suitable for every question. Limit: Questionnaire-development guidance; it does not make focus groups mandatory before every survey.
- [Developing Questionnaires for Educational Research: AMEE Guide No. 87](https://pmc.ncbi.nlm.nih.gov/articles/PMC4059192/) — supports: Interview/focus-group input, cognitive interviews and pilot testing as possible questionnaire development stages. Limit: Education/health research guidance; transfer the method logic, not domain-specific requirements.
- [Mixed Methods and Survey Research in Family Medicine and Community Health](https://pmc.ncbi.nlm.nih.gov/articles/PMC6910743/) — supports: Surveys can precede qualitative follow-up, follow qualitative exploration, or be compared with concurrent qualitative evidence in mixed-method designs. Limit: Health/community examples; does not establish that any particular social-science study needs both.
- [The Case Study Approach](https://pmc.ncbi.nlm.nih.gov/articles/PMC3141799/) — supports: Case studies may combine questionnaires, interviews, focus groups and observation as multiple sources of evidence. Limit: Health-services examples; the evidence-source logic is general but not a universal recipe.
- [Case studies: a guide for researchers, educators, and implementers](https://bmjmedicine.bmj.com/content/4/1/e001623) — supports: A bounded case can use documents, interviews, ethnographic observation, focus groups and quantitative data; source choice follows the case question. Limit: Practical guide; it does not imply all sources must be collected in every case study.
- [Participant-created documents as an elicitation tool](https://www.ncbi.nlm.nih.gov/books/NBK539384/) — supports: Documents can prompt interviews in which authors explain the meaning and context of their records. Limit: Illustrative qualitative technique; it is conditional on suitable documents, consent and a relevant question.
- [D078 area/role task set and route crosswalk](data/career-mapping/_audit/D078_DOMAIN_AREA_ROUTE_CROSSWALK_2026_10_10.json) — supports: D078 task routes for participatory/action research, citizen participation, community evidence and evaluation. Limit: Local reviewed task-route evidence; not a universal requirement or proof that a particular method combination is appropriate.
- [UKRI Research Data Policy](https://www.ukri.org/publications/uk-research-and-innovation-research-data-policy/ukri-research-data-policy/) — supports: Research data are information collected, created, generated, observed or derived from existing sources through any research method; supports data-care preparation when a selected project handles such data. Limit: A general policy, not a claim that every project must publicly share data or use the same management plan.
- [ESRC Framework for Research Ethics: Core Principles](https://www.ukri.org/councils/esrc/guidance-for-applicants/research-ethics-guidance/framework-for-research-ethics/our-core-principles/) — supports: Ethical reflection applies across a research lifecycle; specific participant, privacy, harm and governance duties depend on the project and method. Limit: Does not make every method ethically identical or establish a universal method prerequisite.
- [UK Data Service: Qualitative Data and Reuse](https://ukdataservice.ac.uk/learning-hub/qualitative-data/) — supports: Existing qualitative records such as interview transcripts, diaries, field notes and open-ended responses can be reused; qualitative and quantitative evidence can also be combined where justified. Limit: Reuse depends on data access, consent, context, documentation and fit to the new question.
- [UK Data Service: New to Using Data](https://ukdataservice.ac.uk/learning-hub/new-to-using-data/) — supports: Secondary analysis reuses previously collected qualitative or quantitative data for a new question; social-science datasets are gathered using a range of methods. Limit: A new question still requires checking data provenance, access permissions, population/period coverage, measures and original collection context.
- [Bruch and Atwell: Agent-Based Models in Empirical Social Research](https://pmc.ncbi.nlm.nih.gov/articles/PMC4430112/) — supports: Empirical social ABM can use behavioral/population evidence and requires justified model construction, evaluation, sensitivity analysis and careful interpretation of fit. Limit: Empirical grounding and validation are design-dependent; abstract/theoretical ABMs must not be represented as population prediction.
- [CoMSES Net: Agent-Based Model Documentation Standards](https://www.comses.net/resources/standards/) — supports: The ODD protocol documents an agent-based model's overview, design concepts and implementation details to make models understandable and reusable. Limit: Documentation guidance, not a guarantee that a model is valid or empirically representative.

Machine-readable graph: `data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json`.
