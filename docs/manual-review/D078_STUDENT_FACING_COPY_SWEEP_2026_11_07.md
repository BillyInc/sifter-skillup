# D078 Student-Facing Copy Sweep

**Date:** 2026-11-07  
**Status:** Inventory and candidate issue report; not editorial approval.  
**Source:** Canonical D078 route graph and exported journey data.

> Heuristic flags create a human-review worklist. No flag is a pass, and this report does not claim novice comprehension or subject-matter approval.

## Inventory counts

- Graph: 1,901 nodes and 12,605 edges.
- Exported journey data: 1,541 nodes and 7,770 typed relationship records.
- Student-visible graph records with copy: 792; text units: 5,679; words: 95,407.
- Total audited units across graph records, static screen text, top-level journey copy and relationship explanations: 7,292.
- Method-combination explanations: 9 designs and 9 text units.
- Literal static UI text, quoted labels and programme-preview copy: 1,038 units; 80 contain candidate technical terms.
- Top-level D078 overview/transfer/method-context copy: 11 units; 8 contain candidate technical terms.
- Candidate terminology ledger: 264 distinct terms and 5,017 occurrences; every occurrence remains unreviewed until checked on its route.
- Excluded acronym context: tv — In the audited media-role descriptions, TV means television in a list of media formats; it is not a statistical or methodological term..
- Candidate terminology coverage: 264 of 264 candidate terms have a matched glossary rule; 8 are already expanded in source copy; 0 have neither. Each text unit is also simulated through the runtime helper; see the automated gate below. This does not certify definition accuracy or learner comprehension.
- Term evidence: 261 of 264 candidate terms have a source on a student-copy occurrence; 253 have a source linked to the glossary definition; 0 have neither. See per-term source IDs in the JSON. A glossary-definition source supports the explanation, not a particular route or claim.
- Source-checked glossary batch: 253 definitions were checked against their cited references; 11 candidate terms remain outside that batch. Subject-matter accuracy, context fit, screen first-use and learner review remain open for every candidate term.
- Export check: 63/63 checked domain, method, area, role and programme-transition fields match the student journey export; 0 mismatches; 7 areas and 19 roles; 0 target source IDs unresolved.
- Fields referenced by the journey but excluded by the data exporter: none.
- Relationship panel inventory: 564 resolved, ready edge records; 564 have stored explanations, 0 have none, 0 contain the generic internal note. Relationship copy itself is outside this edit lane.
- Isolated glossary-length simulation: 1,482 copy units exceed 70 words when glossary rules are applied independently. This is a per-field review cue, not a count of rendered paragraphs: the domain and area overviews and some item cards share first-use state, while other reusable components expand fields independently. The audit does not model screen grouping or actual rendering.
- Long units across graph copy, static screen text, top-level journey copy and relationship explanations: 841 exceed 32 words, 172 exceed 50, and 10 exceed 70 words.
- Exact stored-field aliases: 325 identical `description`/`overview` or `meaning`/`plain_language_meaning` pairs; the journey chooses one field in each pair, so this is not a count of repeated on-screen paragraphs.
- Encoding check: 0 replacement characters and 0 malformed UTF-8-as-text sequences across audited copy; valid curly quotes and dashes are not counted. Source-code-like snippets excluded from the static UI scan: 121.
- Automated copy gate: **fail** — 1 mechanical failure(s). It checks candidate-term definition coverage, definition chains, duplicate rules, source linkage, encoding, projection parity and glossary-render simulation only. Human factual, direct-route first-use, learner and rendered-screen review remain separate.

## Visible copy by record type

| Record type | Visible records | Copy units |
|---|---:|---:|
| programme_outcome | 236 | 472 |
| role_item_candidate | 164 | 1573 |
| area_enrichment_item | 115 | 1806 |
| domain_learning_item | 112 | 1097 |
| area_task_family | 46 | 138 |
| role_task_family | 19 | 57 |
| role | 19 | 57 |
| area_tool_option | 14 | 84 |
| programme_theme | 14 | 42 |
| tool | 13 | 26 |
| runtime_learning_item | 10 | 10 |
| method_combination_design | 9 | 63 |
| domain_emerging_learning_item | 8 | 80 |
| area_of_specialization | 7 | 151 |
| area_foundation | 2 | 2 |
| area_tool_application_reference | 2 | 2 |
| domain_route | 1 | 18 |
| programme_context | 1 | 1 |

## Surface-by-surface review

| Surface | Render path | Finding / remaining boundary |
|---|---|---|
| Sociology programme overview | `programmePreviewSections in ProgrammeDetailRefinedScreen` | four headed sections define Sociology and social institutions, explain a research question, evidence, surveys, interviews, observation and document research, work through a campus-service example, and explain informed consent, ethics review and their limits. Curriculum themes and recorded learning goals remain separate |
| Generic programme preview and unavailable states | `programmePreviewExplanation and programmePreviewUnavailableMessage` | course-title fallback and unavailable messages use student-facing wording without implying mastery or inventing curriculum content |
| Programme themes, outcomes and theme guidance | `DegreeSkills and D078MethodAwareJourney` | dynamic student copy now uses the term helper; themes stay distinct from recorded learning goals |
| Social Sciences domain overview and transfer | `D078MethodAwareJourney displayText` | the overview defines the field, evidence and methods; the orientation explains disciplinary viewpoints, administrative records, digital traces, consent and ethics review, questions, outputs and work steps. The bridge names what the three shared foundations prepare the learner to do, explains method or named-design choice, and states how supported domain learning, areas and roles follow. A scoped first-use set carries across visible overview, programme context and transfer copy |
| Domain overview before area/role entry | `D078AreaRoute and D078RoleRoute route initialization` | implemented_source_checked_rendered_review_open: direct and saved destinations show the domain overview step before area or role content; internal field-to-area and area-to-role actions carry the route marker. Rendered acceptance remains open |
| Programme-to-area transition | `ProgrammeDetailRefinedScreen ProgrammeDomainTransition` | connection text states that recorded course outcomes connect the programme and area |
| Generic domain-detail fallback | `DomainDetailScreen` | D078 bypasses this screen and uses D078MethodAwareJourney; generic domain copy is not counted as D078 rendered content |
| Methods and combined designs | `MethodChoicePanel learnerCopy` | method labels, explanations and programme notes now use the student copy helper |
| Technical terms and first-use explanations | `studentFacingCopy / explainTechnicalTerms and D078 displayText` | the D078 domain overview and each area overview now carry one scoped first-use set across their visible sections; item and role-task cards also share a set within the card. Other reusable components that call studentFacingCopy without a shared set expand each text field independently. The audit simulates fields independently and cannot establish which copy renders together, whether every specialist phrase was identified, definition accuracy or learner comprehension |
| Technical terms in item and method headings | `D078ItemCard and MethodCard label/meaning render order` | item and method headings remain concise; item meaning is visible beside the choice, and method meaning is visible before selection. Glossary tracking starts in the explanation rather than the title, so a clipped title cannot consume the first-use definition |
| Seven D078 area overviews | `D078AreaRoute from area student_orientation` | all seven canonical areas have source-linked introductions and separate explanations for scope, approaches, questions, outputs, workflow, limits and ethical care. Each area visit has its own first-use set, so it can explain terms when opened directly. The Psychology and Social Behaviour summary no longer exposes the internal D064 code or implies clinical training; area names, ownership and routes are unchanged |
| Area and role learning cards | `D078ItemCard displayText` | definitions, examples/approaches, context, outputs, limits and valid alternative notes are rendered as labeled sections |
| D078 role overviews | `D078RoleRoute role node description and linked task context` | 19 role summaries explain their documented work in plain language and preserve current area ownership and task links; no qualification or task-output claim was added |
| Relationship panel explanations | `D078RelationshipPanel` | owned by the relationship-panel workstream; this sweep inventories available explanations but does not edit or approve their wording or route context |
| Text prerequisite and complement annotations | `graph fields not projected as destinations` | not student destinations; show only after canonical edge/sequence review confirms a supported link |
| Role task outputs | `role_task_family records` | 19 task families have no separate output field; outputs remain an evidence-enrichment gap, not an inferred claim |

## Candidate issue counts

| Candidate flag | Records |
|---|---:|
| missing_task_output | 19 |
| long_copy_unit_over_70_words | 3 |

## Glossary definition chain candidates

These flags look for technical terms introduced by glossary definitions. Acronym name expansions and component terms explicitly defined in the same entry are filtered. Any remaining chain must be resolved before the automated copy gate can pass.

| Glossary entry | Candidate term(s) | Definition |
|---|---|---|
| None | None | No candidate chain remains after the lexical checks. |

## Remaining review targets

- Complete human subject-matter and first-use review for every candidate term and explanation; the automated gate verifies matched explanations, not their accuracy or a learner's understanding.
- Inspect independently enterable routes and rendered screens to confirm first-use explanations appear beside each item before selection; the domain-overview gate has source checks but still needs rendered acceptance.
- The route-entry gate is implemented: direct and saved area/role paths first show the D078 domain overview step. Confirm the handoff visually and check return behavior on device/browser.
- Review every flagged area, tool, task-family and role record in its actual screen context; decide edits from its source and task context rather than from the heuristic flag alone.
- Resolve the 19 role task families that lack a separate output field through evidence review; do not make up outputs to fill the display.
- Relationship-panel explanations are owned by another workstream; this report inventories their presence only and does not assess or edit their wording or route behavior.
- Human-review programme themes, recorded outcomes and student rewordings in their rendered sections for precision and plain-language flow; preserve the distinction between curriculum content and learner abilities.

## Copy revisions applied in this pass

These source-linked copy edits do not approve the whole D078 journey or clear the terminology ledger.
- **Sociology programme page:** four headed sections define Sociology and social institutions, explain a research question, evidence, survey, interview, observation and document research, compare what different sources show in a campus-service example, and define informed consent and ethics review with limits. Recorded curriculum themes and learning outcomes remain in their separate sections.
- **Social Sciences domain page:** the overview defines the field, evidence and methods. The orientation explains disciplinary viewpoints, administrative records, digital traces, participant consent and ethics review, then gives questions, outputs and a work sequence. The bridge states what the three shared foundations teach before method selection, defines a named combined design, and describes supported domain learning and downstream areas/roles; optionality and curriculum-link limits remain explicit.
- **Computational social research:** the definition explains algorithms, statistical models and simulations through their operation and distinguishes a research procedure from software. The context defines digital traces and gives social-research examples; its output names checks for missing or uneven information; limits cover representation, causality, simulation and privacy. Its requirement lane and destinations are unchanged.
- **JASP tool card:** the meaning names its menu-based statistical workflow, explains supported analysis examples and distinguishes frequentist from Bayesian result framing; researchers remain responsible for choosing a method that fits the question and data.
- **Seven area overviews:** summaries and structured introductions are source-linked, with explanations for scope, approaches, questions, outputs, work steps, limitations and ethical care. The Psychology and Social Behaviour summary removes the internal D064 label and distinguishes social research from clinical diagnosis or treatment without making a licensure claim. Economics output wording and the policy-brief and confidential-source explanations were clarified. Area ownership and routes remain unchanged.
- **First-use display:** the domain overview shares one explanation set across its visible overview and transfer sections; each area visit has a separate set across its summary and expanded orientation. Direct area and role entries show a field overview step first, then continue to their requested destination; their own first-use explanations remain available on those screens.
- **Nineteen role overviews:** descriptions are rewritten from linked task evidence and occupation sources; they retain existing role-to-area ownership and routes. The 19 role-task records without separate output evidence remain unfilled.
- **Technical terms:** the shared glossary defines research question, evidence, data, combined research design, social institutions, administrative records, informed consent and ethics review alongside existing method and statistics terms. The new core copy carries field-level source references; current candidate-term and occurrence counts are reported above. Subject-matter, screen-first-use and learner review remain open.
- **Evidence links:** new graph references support panel data structure and preparation, multilevel models, ARIMA variants, discourse analysis and conversation analysis. Sources are linked to the relevant method item rather than treated as proof that a method suits every question.
- **Projection and graph integrity:** the current graph was re-exported to the student journey payload. Copy updates preserve current node and edge identifiers and do not change requirement lanes, item ownership, routes or role fit.
- **Core copy sources:** [OpenStax What Is Sociology?](https://openstax.org/books/introduction-sociology-3e/pages/1-1-what-is-sociology), [OpenStax Sociological Research](https://openstax.org/books/introduction-sociology-3e/pages/2-2-research-methods), [NUC Social Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf), [UKRI ESRC informed consent guidance](https://www.ukri.org/councils/esrc/guidance-for-applicants/research-ethics-guidance/consent/), [ONS What Are Data?](https://www.ons.gov.uk/aboutus/usingpublicdatatoproducestatistics/learningaboutdata/learnmoreaboutwhoweareandwhatwedo/whataredata), [ONS administrative-data glossary](https://www.ons.gov.uk/census/censustransformationprogramme/administrativedatacensusproject/glossary), and [digital-trace data guidance](https://pmc.ncbi.nlm.nih.gov/articles/PMC11971172/).

## Exact flagged records

The JSON companion contains full copy text, owner context, source references, candidate technical terms and issue flags.
A copy unit is flagged as long only above 70 words; 10 audited units exceed that threshold across all audited surfaces. Shorter units are still subject to human accuracy and readability review.

| Record | Type | Area | Flags |
|---|---|---|---|
| area:d078-computational-digital-social-science | area_of_specialization | Computational and Digital Social Science | long_copy_unit_over_70_words |
| domain-item:d078-computational-social-research | domain_learning_item | programme/domain/role | long_copy_unit_over_70_words |
| domain:D078 | domain_route | programme/domain/role | long_copy_unit_over_70_words |
| role-task:d078:anthropologist | role_task_family | programme/domain/role | missing_task_output |
| role-task:d078:archaeologist | role_task_family | programme/domain/role | missing_task_output |
| role-task:d078:behavioural-scientist | role_task_family | programme/domain/role | missing_task_output |
| role-task:d078:business-economics-researcher | role_task_family | programme/domain/role | missing_task_output |
| role-task:d078:criminologist | role_task_family | programme/domain/role | missing_task_output |
| role-task:d078:demographer | role_task_family | programme/domain/role | missing_task_output |
| role-task:d078:economic-adviser | role_task_family | programme/domain/role | missing_task_output |
| role-task:d078:economic-development-coordinator | role_task_family | programme/domain/role | missing_task_output |
| role-task:d078:economic-policy-officer | role_task_family | programme/domain/role | missing_task_output |
| role-task:d078:economist | role_task_family | programme/domain/role | missing_task_output |
| role-task:d078:genealogist | role_task_family | programme/domain/role | missing_task_output |
| role-task:d078:geographer | role_task_family | programme/domain/role | missing_task_output |
| role-task:d078:media-scientist | role_task_family | programme/domain/role | missing_task_output |
| role-task:d078:political-scientist | role_task_family | programme/domain/role | missing_task_output |
| role-task:d078:social-work-researcher | role_task_family | programme/domain/role | missing_task_output |
| role-task:d078:sociologist | role_task_family | programme/domain/role | missing_task_output |
| role-task:d078:statistician | role_task_family | programme/domain/role | missing_task_output |
| role-task:d078:tax-policy-analyst | role_task_family | programme/domain/role | missing_task_output |
| role-task:d078:thanatology-researcher | role_task_family | programme/domain/role | missing_task_output |

### Copy units over 70 words

| Location | Type / field | Words | Text excerpt |
|---|---|---:|---|
| area:d078-computational-digital-social-science | area_of_specialization / description | 81 | Computational and Digital Social Science uses code, digital traces, networks, text, simulations or other data-intensive approaches to study social processes and digital society. The computational method must remain conne |
| area:d078-computational-digital-social-science | area_of_specialization / overview | 81 | Computational and Digital Social Science uses code, digital traces, networks, text, simulations or other data-intensive approaches to study social processes and digital society. The computational method must remain conne |
| domain-item:d078-computational-social-research | domain_learning_item / meaning | 88 | Computational social research applies algorithms, statistical models and simulations to questions about society and social behaviour. An algorithm is a precise set of steps a computer can carry out, such as sorting or co |
| domain-item:d078-computational-social-research | domain_learning_item / contextual_use | 71 | Digital traces are records created through people's use of digital services, such as posts, searches or transactions. For example, a researcher might compare topics in two online communities, map documented partnerships  |
| domain:D078 | domain_route / overview | 73 | The social sciences study people, groups and societies: how people relate, how shared arrangements such as families, schools, workplaces and governments shape everyday life, and how societies change. A research question  |
| src/lib/programmePreview.ts:32 | source_copy_string / None | 82 | Sociology is part of the social sciences: fields that study people, groups and how societies work and change. It examines how people live together, form relationships and groups, organize shared life and shape one anothe |
| src/lib/programmePreview.ts:36 | source_copy_string / None | 81 | A research question is the focused issue a study aims to answer. Researchers choose evidence (information that can help answer the question) that fits it: a survey asks people a planned set of questions so answers can be |
| src/lib/programmePreview.ts:40 | source_copy_string / None | 76 | Imagine a university wants to understand why some students use a support service and others do not. Interviews can reveal the reasons students give; observing how students reach the service can show where the process is  |
| programme_transition | relationship_explanation / domain_overview | 73 | The social sciences study people, groups and societies: how people relate, how shared arrangements such as families, schools, workplaces and governments shape everyday life, and how societies change. A research question  |
| programme_transition | relationship_explanation / transfer_summary | 122 | Your Sociology courses are a starting point for the wider Social Sciences & Behavioural Research field. Course links show recorded learning goals, not proof that you have mastered them. Begin with three shared, required  |

## Method and limits

This is a graph-backed inventory plus a copy repair pass. Static JSX text is collected from the listed D078-related screens; report generation and API-only programme text remain outside this audit. The terminology list is a candidate finder, not an exhaustive dictionary. Per-field glossary simulation does not model the actual grouping of copy or prove rendered output, even where a component shares first-use state. Final clearance still requires human review of every D078 student text unit, evidence review for the 19 missing role-task outputs, review of relationship-panel explanations by their owner, the domain-overview entry gate and inspection of rendered routes. No browser or rendered visual acceptance is claimed.

Machine-readable worklist: data/career-mapping/_audit/D078_STUDENT_FACING_COPY_SWEEP_2026_11_07.json
