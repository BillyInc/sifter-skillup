# D078 Student-Facing Copy Sweep

**Date:** 2026-11-05  
**Status:** Inventory and candidate issue report; not editorial approval.  
**Source:** Canonical D078 route graph and exported journey data.

> Heuristic flags create a human-review worklist. No flag is a pass, and this report does not claim novice comprehension or subject-matter approval.

## Inventory counts

- Graph: 1,922 nodes and 13,168 edges.
- Exported journey data: 1,562 nodes and 7,850 typed relationship records.
- Student-visible graph records with copy: 796; text units: 5,688; words: 95,048.
- Total audited units across graph records, static screen text, top-level journey copy and relationship explanations: 7,277.
- Method-combination explanations: 9 designs and 9 text units.
- Literal static UI text and quoted labels: 1,016 units; 13 contain candidate technical terms.
- Top-level D078 overview/transfer/method-context copy: 11 units; 5 contain candidate technical terms.
- Candidate terminology ledger: 162 distinct terms and 2,233 occurrences; every occurrence remains unreviewed until checked on its route.
- Candidate terminology coverage: 162 terms match a glossary rule at the term occurrence; 8 are explicitly expanded in copy; 0 have neither candidate explanation. This is a routing aid for human review, not a correctness pass.
- Fields referenced by the journey but excluded by the data exporter: none.
- Relationship panel scope: 562 resolved, ready edge records; 562 have stored explanations, 0 have none, 0 contain the generic internal note.
- Long units across graph copy, static screen text, top-level journey copy and relationship explanations: 823 exceed 32 words, 164 exceed 50, and 4 exceed 70 words.
- Exact stored-field aliases: 325 identical `description`/`overview` or `meaning`/`plain_language_meaning` pairs; the journey chooses one field in each pair, so this is not a count of repeated on-screen paragraphs.
- Replacement-character occurrences across audited copy: 0; source-code-like snippets excluded from the static UI scan: 116.

## Visible copy by record type

| Record type | Visible records | Copy units |
|---|---:|---:|
| programme_outcome | 236 | 472 |
| role_item_candidate | 164 | 1571 |
| area_enrichment_item | 115 | 1806 |
| domain_learning_item | 112 | 1096 |
| area_task_family | 50 | 150 |
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
| Sociology programme overview | `programmePreviewSections in ProgrammeDetailRefinedScreen` | overview explains Sociology, institutions, culture, inequality and research methods in context; detailed themes and recorded learning goals stay in their separate curriculum sections |
| Generic programme preview and unavailable states | `programmePreviewExplanation and programmePreviewUnavailableMessage` | course-title fallback and unavailable messages use student-facing wording without implying mastery or inventing curriculum content |
| Programme themes, outcomes and theme guidance | `DegreeSkills and D078MethodAwareJourney` | dynamic student copy now uses the term helper; themes stay distinct from recorded learning goals |
| Social Sciences domain overview and transfer | `D078MethodAwareJourney displayText` | overview, different disciplinary viewpoints, how researchers gather evidence, example questions, study steps, outputs and Sociology transfer are separately headed; the transfer text explains foundation-to-method ordering, optionality and course-link limits |
| Programme-to-area transition | `ProgrammeDetailRefinedScreen ProgrammeDomainTransition` | connection text states that recorded course outcomes connect the programme and area |
| Generic domain-detail fallback | `DomainDetailScreen` | D078 bypasses this screen and uses D078MethodAwareJourney; generic domain copy is not counted as D078 rendered content |
| Methods and combined designs | `MethodChoicePanel learnerCopy` | method labels, explanations and programme notes now use the student copy helper |
| Seven D078 area overviews | `D078AreaRoute from area student_orientation` | each area now has a concise introduction and source-backed sections for scope, work, explained approaches, questions, outputs, workflow, limits and ethical care; the accordion keeps detail available without crowding the first view |
| Area and role learning cards | `D078ItemCard displayText` | definitions, examples/approaches, context, outputs, limits and valid alternative notes are rendered as labeled sections |
| D078 role overviews | `D078RoleRoute role node description and linked task context` | 19 role summaries explain their documented work in plain language and preserve current area ownership and task links; no qualification or task-output claim was added |
| Relationship panel explanations | `D078RelationshipPanel` | out of this lane; 562 edge explanations remain with the panel owner for glossary and route-context review |
| Text prerequisite and complement annotations | `graph fields not projected as destinations` | not student destinations; show only after canonical edge/sequence review confirms a supported link |
| Role task outputs | `role_task_family records` | 19 task families have no separate output field; outputs remain an evidence-enrichment gap, not an inferred claim |

## Candidate issue counts

| Candidate flag | Records |
|---|---:|
| missing_task_output | 19 |
| long_copy_unit_over_70_words | 1 |

## Remaining review targets

- Complete human accuracy and first-use review for the candidate terminology ledger; a glossary rule does not prove that the sentence is correct or that the term is explained at first use on every route.
- Review every flagged area, tool, task-family and role record in its actual screen context; decide edits from its source and task context rather than from the heuristic flag alone.
- Resolve the 19 role task families that lack a separate output field through evidence review; do not make up outputs to fill the display.
- Relationship-panel explanations are being handled by its owner; review all explanations for item-specific context and route behavior there.
- Human-review all programme theme/outcome text in its rendered sections for precision and plain-language flow; preserve the distinction between curriculum content and learner abilities.

## Copy revisions applied in this pass

These source-backed copy edits do not approve the whole D078 journey or clear the full terminology ledger.
- **Sociology programme page:** the overview explains institutions, shared ways of life, inequality and research in context, and names recorded learning outcomes accurately. Course themes, outcomes and abilities remain distinct; generic curriculum fallbacks and unavailable states use student-facing wording.
- **Social Sciences domain page:** the overview defines evidence and methods in plain language; the student orientation explains what the field studies, what researchers do, example questions, work steps, possible products and Sociology's role as a starting point. Route order and source-backed programme connections remain unchanged.
- **Domain detail page:** shared-foundation guidance and the specialist-approach heading explain their purpose in everyday language without changing route bands or item selection.
- **Programme-to-area link:** the transition says directly that recorded course outcomes connect the programme and area.
- **Computational social research:** expanded its definition, field relevance, examples, learner output and limits; removed source-access notes from visible limitations. Its conditional, skippable disposition is unchanged.
- **Area tools:** the seven separate LimeSurvey, NVivo, Python, R, SPSS, Stata and Taguette cards now say what each tool is, how it can help with work in Social Behaviour and Interaction, an example output and what the tool cannot establish. Each remains optional and nonblocking.
- **Technical explanations:** corrected or expanded shared glossary entries for statistical significance, regression, logistic regression, mixed methods, computational methods, evaluation, theory of change, sampling, case studies, psychometrics, time-series analysis, and inter-coder reliability. The terminology audit requires a rule to overlap its term occurrence and recognizes acronyms expanded in the same copy; these checks do not prove definition accuracy or first-use coverage on every route.
- **Data projection:** the exporter now includes `why_it_matters`, `field_context` and `task_conditions` already read by the journey; the audit reports no remaining UI-used fields dropped by that exporter.
- **Graph integrity:** the copy updater verified that the node IDs, edge IDs and counts were unchanged (1,922 nodes; 13,168 edges). It did not edit route, requirement-lane, ownership or role-fit fields.
- **Source basis:** [NUC Social Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf), [University of Edinburgh computational social science course](https://opencourse.inf.ed.ac.uk/css), [Edelmann et al. review](https://pmc.ncbi.nlm.nih.gov/articles/PMC8612450/), [digital-trace data guidance](https://pmc.ncbi.nlm.nih.gov/articles/PMC11971172/), [UKRI/ESRC online-research ethics guidance](https://www.ukri.org/councils/esrc/guidance-for-applicants/research-ethics-guidance/internet-mediated-research/), [Columbia network-analysis guide](https://www.publichealth.columbia.edu/research/population-health-methods/social-network-analysis), [agent-based modelling review](https://pmc.ncbi.nlm.nih.gov/articles/PMC4430112/), [LimeSurvey manual](https://www.limesurvey.org/manual/LimeSurvey_Manual), [NVivo coding guide](https://community.lumivero.com/s/article/NVR1Mac-Content-coding-coding), [Python tutorial](https://docs.python.org/3/tutorial/), [R overview](https://www.r-project.org/about.html), [IBM SPSS t-test documentation](https://www.ibm.com/docs/en/spss-statistics/30.0.0?topic=test-overview-t-command), [Stata panel-data guide](https://www.stata.com/features/panel-longitudinal-data/), [Taguette](https://app.taguette.org/), [Magenta Book](https://www.gov.uk/government/publications/the-magenta-book), [ASA p-value statement](https://www.amstat.org/asa/files/pdfs/P-ValueStatement.pdf), and [CDC qualitative-data guidance](https://www.cdc.gov/field-epi-manual/php/chapters/qualitative-data.html).

## Exact flagged records

The JSON companion contains full copy text, owner context, source references, candidate technical terms and issue flags.
A copy unit is flagged as long only above 70 words; 4 audited units exceed that threshold across all audited surfaces. Shorter units are still subject to human accuracy and readability review.

| Record | Type | Area | Flags |
|---|---|---|---|
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
| domain:D078 | domain_route / overview | 76 | The social sciences are fields that study how people live together and how societies work and change. They examine relationships, groups and institutions— lasting arrangements such as families, schools and governments. R |
| domain:D078 | domain_route / student_orientation.whatPeopleDo | 102 | Researchers may ask people questions, observe activity, examine documents or administrative records (records created as an organization delivers a service), or study digital trace data (records created when people use on |
| programme_transition | relationship_explanation / domain_overview | 76 | The social sciences are fields that study how people live together and how societies work and change. They examine relationships, groups and institutions— lasting arrangements such as families, schools and governments. R |
| programme_transition | relationship_explanation / transfer_summary | 102 | Your Sociology programme provides a starting point for exploring Social Sciences; it does not mean you have already mastered every topic in the field. Begin with three required starting items that support learning across |

## Method and limits

This is a graph-backed inventory plus a separate copy-only repair pass. Static JSX text is collected from the listed D078-related screens, but runtime-generated report text and API-only programme copy may need a separate pass. The technical-term list is a candidate finder, not an exhaustive dictionary. Final clearance still requires editorial and subject-matter review of visible copy, evidence review for the 19 missing role-task outputs, review of relationship-panel explanations by their owner, and inspection of all rendered routes. No browser or rendered visual acceptance is claimed.

Machine-readable worklist: data/career-mapping/_audit/D078_STUDENT_FACING_COPY_SWEEP_2026_11_05.json
