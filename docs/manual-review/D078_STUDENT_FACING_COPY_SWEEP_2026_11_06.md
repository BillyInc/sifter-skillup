# D078 Student-Facing Copy Sweep

**Date:** 2026-11-06  
**Status:** Inventory and candidate issue report; not editorial approval.  
**Source:** Canonical D078 route graph and exported journey data.

> Heuristic flags create a human-review worklist. No flag is a pass, and this report does not claim novice comprehension or subject-matter approval.

## Inventory counts

- Graph: 1,922 nodes and 13,170 edges.
- Exported journey data: 1,562 nodes and 7,858 typed relationship records.
- Student-visible graph records with copy: 796; text units: 5,689; words: 95,732.
- Total audited units across graph records, static screen text, top-level journey copy and relationship explanations: 7,289.
- Method-combination explanations: 9 designs and 9 text units.
- Literal static UI text, quoted labels and programme-preview copy: 1,025 units; 15 contain candidate technical terms.
- Top-level D078 overview/transfer/method-context copy: 11 units; 5 contain candidate technical terms.
- Candidate terminology ledger: 252 distinct terms and 2,678 occurrences; every occurrence remains unreviewed until checked on its route.
- Candidate terminology coverage: 252 terms match a glossary rule at an occurrence; 8 are explicitly expanded in copy; 0 have neither candidate explanation. This is a routing aid for human review, not a correctness pass.
- Source trail: 251 of 252 candidate terms have a source-linked occurrence; 1 remains without one (model diagnostics). This records a source on the containing item/field or an explicitly identified audit-only static source; it does not mean the glossary definition itself has passed subject-matter review.
- Export check: 63/63 checked domain, method, area, role and programme-transition fields match the student journey export; 0 mismatches; 7 areas and 19 roles; 0 target source IDs unresolved.
- Fields referenced by the journey but excluded by the data exporter: none.
- Relationship panel inventory: 564 resolved, ready edge records; 564 have stored explanations, 0 have none, 0 contain the generic internal note. Relationship copy itself is outside this edit lane.
- Isolated glossary-length simulation: 663 copy units exceed 70 words when glossary rules are applied independently. This upper-bound cue is not a count of rendered paragraphs; cards and screen sections can share first-use state.
- Long units across graph copy, static screen text, top-level journey copy and relationship explanations: 842 exceed 32 words, 180 exceed 50, and 0 exceed 70 words.
- Exact stored-field aliases: 325 identical `description`/`overview` or `meaning`/`plain_language_meaning` pairs; the journey chooses one field in each pair, so this is not a count of repeated on-screen paragraphs.
- Encoding check: 0 replacement characters and 6 common mojibake-like sequences across audited copy; source-code-like snippets excluded from the static UI scan: 115.

## Visible copy by record type

| Record type | Visible records | Copy units |
|---|---:|---:|
| programme_outcome | 236 | 472 |
| role_item_candidate | 164 | 1571 |
| area_enrichment_item | 115 | 1806 |
| domain_learning_item | 112 | 1097 |
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
| Sociology programme overview | `programmePreviewSections in ProgrammeDetailRefinedScreen` | three headed sections explain what Sociology studies, how sociologists gather evidence and a concrete campus-service example; curriculum themes and recorded learning goals remain in their separate sections |
| Generic programme preview and unavailable states | `programmePreviewExplanation and programmePreviewUnavailableMessage` | course-title fallback and unavailable messages use student-facing wording without implying mastery or inventing curriculum content |
| Programme themes, outcomes and theme guidance | `DegreeSkills and D078MethodAwareJourney` | dynamic student copy now uses the term helper; themes stay distinct from recorded learning goals |
| Social Sciences domain overview and transfer | `D078MethodAwareJourney displayText` | the overview defines the field, evidence and methods; orientation adds disciplinary viewpoints, administrative records, digital traces, question examples, work steps, outputs and limits; the transfer explains required foundations, method choice, optionality and the limits of course links |
| Domain overview before area/role entry | `D078AreaRoute and D078RoleRoute route initialization` | route projection validates selected-method/area/role membership, but these routes have no domain-overview-seen gate; a valid direct or saved route can open area/role content without first displaying the domain overview. This is a route-access gap, not a wording defect |
| Programme-to-area transition | `ProgrammeDetailRefinedScreen ProgrammeDomainTransition` | connection text states that recorded course outcomes connect the programme and area |
| Generic domain-detail fallback | `DomainDetailScreen` | D078 bypasses this screen and uses D078MethodAwareJourney; generic domain copy is not counted as D078 rendered content |
| Methods and combined designs | `MethodChoicePanel learnerCopy` | method labels, explanations and programme notes now use the student copy helper |
| Technical terms and first-use explanations | `studentFacingCopy / explainTechnicalTerms and D078 displayText` | candidate glossary rules can add explanations; the audit records term occurrences and source context but does not prove first-use coverage on every independently accessible route or rendered screen |
| Technical terms in item and method headings | `D078ItemCard and MethodCard label/meaning render order` | both components pass the heading through glossary expansion before the body and share the same explained-term set; the heading is line-clamped, so a long first-use explanation may be clipped and then suppressed in the body. Method meaning is also hidden until expansion. Keep headings concise and put a complete short explanation in the visible body preview |
| Seven D078 area overviews | `D078AreaRoute from area student_orientation` | all seven canonical areas have source-linked introductions and separate explanations for scope, approaches, questions, outputs, workflow, limits and ethical care; area names, ownership and routes are unchanged |
| Area and role learning cards | `D078ItemCard displayText` | definitions, examples/approaches, context, outputs, limits and valid alternative notes are rendered as labeled sections |
| D078 role overviews | `D078RoleRoute role node description and linked task context` | 19 role summaries explain their documented work in plain language and preserve current area ownership and task links; no qualification or task-output claim was added |
| Relationship panel explanations | `D078RelationshipPanel` | owned by the relationship-panel workstream; this sweep inventories available explanations but does not edit or approve their wording or route context |
| Text prerequisite and complement annotations | `graph fields not projected as destinations` | not student destinations; show only after canonical edge/sequence review confirms a supported link |
| Role task outputs | `role_task_family records` | 19 task families have no separate output field; outputs remain an evidence-enrichment gap, not an inferred claim |

## Candidate issue counts

| Candidate flag | Records |
|---|---:|
| missing_task_output | 19 |

## Glossary definition chain candidates

These flags look for technical terms introduced by glossary definitions. Acronym name expansions and component terms explicitly defined in the same entry are filtered; remaining rows need human judgment.

| Glossary entry | Candidate term(s) | Definition |
|---|---|---|
| `\bnon[- ]response bias\b` | nonresponse bias | nonresponse bias (a survey error that can arise when people who do not respond differ in relevant ways from those who do, so the answers may not represent the group the survey aimed to describe) |
| `\bexact tests?\b` | sample | exact test (a calculation of how likely the observed counts, or more extreme counts, would be under a stated assumption, using the possible arrangements in the collected data rather than a large-sample shortcut) |

## Remaining review targets

- Complete human accuracy and first-use review for the candidate terminology ledger; a glossary rule does not prove that the sentence is correct or that the term is explained at first use on every route.
- Fix heading-first glossary expansion: D078 item and method cards can consume a term's explanation in a clamped title and suppress it from the body; method meanings are hidden until expansion. Keep labels concise and show a usable explanation beside each choice before selection.
- Add a route-entry gate so direct or saved area/role paths first show the D078 domain overview, then return to the requested destination. Route membership is checked today; overview exposure is not.
- Review every flagged area, tool, task-family and role record in its actual screen context; decide edits from its source and task context rather than from the heuristic flag alone.
- Resolve the 19 role task families that lack a separate output field through evidence review; do not make up outputs to fill the display.
- Relationship-panel explanations are owned by another workstream; this report inventories their presence only and does not assess or edit their wording or route behavior.
- Human-review all programme theme/outcome text in its rendered sections for precision and plain-language flow; preserve the distinction between curriculum content and learner abilities.

## Copy revisions applied in this pass

These source-linked copy edits do not approve the whole D078 journey or clear the terminology ledger.
- **Sociology programme page:** three headed sections now explain what Sociology studies, how research questions guide evidence gathering, and a campus-service example with interpretation limits. Recorded curriculum themes and learning outcomes remain in their separate sections.
- **Social Sciences domain page:** the overview defines the field, evidence and methods. The orientation explains its different disciplinary viewpoints, research inputs—including administrative records and digital traces—typical questions, work steps, outputs and limits. The bridge explains the three required foundations before method choice, optional and conditional items, downstream route choices, and what course links do and do not establish.
- **Computational social research:** the definition explains algorithms, statistical models and simulations by their operation; the context defines digital traces and gives social-research examples; learner output and limits are explicit. Its conditional, skippable disposition remains unchanged.
- **JASP tool card:** the meaning names its menu-based statistical workflow, explains supported analysis examples and distinguishes frequentist from Bayesian result framing; researchers remain responsible for choosing a method that fits the question and data.
- **Seven area overviews:** all canonical areas have separate, source-linked sections for scope, approaches, questions, outputs, work steps, limitations and ethical care. Area ownership and routes remain unchanged.
- **Nineteen role overviews:** descriptions are rewritten from linked task evidence and occupation sources; they retain existing role-to-area ownership and routes. The 19 role-task records without separate output evidence remain unfilled.
- **Technical terms:** the shared glossary is broader, exact duplicate pattern rules were removed, and definitions for computational methods, simulations, digital traces, confidence intervals, logistic regression and statistical significance were improved. Current candidate-term and occurrence counts are reported above; human accuracy and per-screen first-use review remain open.
- **Evidence links:** new graph references support panel data structure and preparation, multilevel models, ARIMA variants, discourse analysis and conversation analysis. Sources are linked to the relevant method item rather than treated as proof that a method suits every question.
- **Projection and graph integrity:** the current graph was re-exported to the student journey payload. Copy updates preserve current node and edge identifiers and do not change requirement lanes, item ownership, routes or role fit.
- **Sources:** [NUC Social Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf), [OpenStax Sociology: Research Methods](https://openstax.org/books/introduction-sociology-3e/pages/2-2-research-methods), [JAMB 2024 Examination Manual](https://www.jamb.gov.ng/pdfs/2024/2024_EXAMINATION_MANUAL%28updated%29.pdf), [JASP Student Guide 2025](https://jasp-stats.org/wp-content/uploads/2025/07/Statistical-Analysis-in-JASP-A-guide-for-students-2025.pdf), [NIST AI RMF 1.0](https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10), [Microsoft Power BI licensing](https://learn.microsoft.com/en-us/power-bi/fundamentals/end-user-license), [UNESCO ISCED-F 2013 detailed field descriptions](https://unesdoc.unesco.org/in/documentViewer.xhtml?ark=/ark:/48223/pf0000235049/PDF/235049eng.pdf&locale=en), [UNESCO UIS social-science R&D glossary](https://databrowser.uis.unesco.org/resources/glossary/2462), [ISA Digital Sociology working group](https://www.isa-sociology.org/research-networks/working-groups/wg10-digital-sociology), [Edelmann et al. computational social science review](https://pmc.ncbi.nlm.nih.gov/articles/PMC8612450/), [digital-trace data guidance](https://pmc.ncbi.nlm.nih.gov/articles/PMC11971172/), [ESRC internet-mediated research ethics](https://www.ukri.org/councils/esrc/guidance-for-applicants/research-ethics-guidance/internet-mediated-research/), [World Bank DIME measurement chapter](https://worldbank.github.io/dime-data-handbook/measurement.html), [World Bank DIME analysis chapter](https://worldbank.github.io/dime-data-handbook/analysis.html), [statsmodels ARIMA documentation](https://www.statsmodels.org/stable/generated/statsmodels.tsa.arima.model.ARIMA.html), [statsmodels mixed-effects documentation](https://www.statsmodels.org/stable/mixed_linear.html), [SAGE Dictionary: Discourse Analysis](https://doi.org/10.4135/9780857020116.n54), [UCLA Sociology: Conversation Analysis](https://soc.ucla.edu/graduate-study/working-groups/conversation-analysis/), and the [Magenta Book](https://www.gov.uk/government/publications/the-magenta-book).

## Exact flagged records

The JSON companion contains full copy text, owner context, source references, candidate technical terms and issue flags.
A copy unit is flagged as long only above 70 words; 0 audited units exceed that threshold across all audited surfaces. Shorter units are still subject to human accuracy and readability review.

| Record | Type | Area | Flags |
|---|---|---|---|
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
| None | — | 0 | No audited copy unit exceeds the threshold. |

## Method and limits

This is a graph-backed inventory plus a separate copy-only repair pass. Static JSX text is collected from the listed D078-related screens, but runtime-generated report text and API-only programme copy may need a separate pass. The technical-term list is a candidate finder, not an exhaustive dictionary. Isolated glossary expansion is an upper-bound review cue and does not model shared first-use state or prove rendered output. Final clearance still requires editorial and subject-matter review of visible copy, evidence review for the 19 missing role-task outputs, review of relationship-panel explanations by their owner, and inspection of all rendered routes. No browser or rendered visual acceptance is claimed.

Machine-readable worklist: data/career-mapping/_audit/D078_STUDENT_FACING_COPY_SWEEP_2026_11_06.json
