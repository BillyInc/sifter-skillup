# D078 method-to-technique audit and one-pass resolution

**Status:** evidence search and graph resolution completed on 20 October 2026. The initial relationship-annotation resolution (130/130 dispositions) was completed first. Technique/tool additions are persisted in the graph and the companion ledger.

## Objective

Audit the techniques, analysis procedures, computational methods and tools that belong under the existing D078 research methods. Resolve their canonical item identity, source-layer ownership, route links and relationship types in one evidence pass. The result should let a first-time learner see which technique comes next under a selected method, what it is used for, and which tool can carry it out. Do not leave a second ambiguous review queue.

The student's supplied category guide is a set of claims to verify, not an authoritative taxonomy. In particular, check whether scenario analysis, sensitivity analysis, network methods, agent-based modelling and machine learning belong exclusively to a method family before assigning them there.

## Existing method and combination inventory

The authoritative inventory is `data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json` (`method_node_ids` and `combination_designs`). It currently contains 22 methods:

- Archival and historical research
- Case-study and comparative-case design
- Agent-based modelling of social processes
- Computational and digital social-research methods
- Document and content analysis
- Interviews
- Mixed methods
- Observation and ethnographic approaches
- Qualitative methods
- Quantitative methods
- Spatial analysis and mapping
- Surveys and questionnaire design
- Discourse and conversation analysis
- Experiments, quasi-experiments and causal inference
- Focus groups and workshops
- Longitudinal, panel and multilevel data
- Participatory and action research
- Programme evaluation and theory of change
- Psychometrics and scale construction
- Systematic and scoping evidence synthesis
- Network analysis
- Social network analysis

There are nine combination designs. Read each design's own `method_ids`, `area_routes`, and requirements in the graph; do not apply a generic list of techniques to every combination:

- Exploratory sequential mixed methods
- Explanatory sequential mixed methods
- Convergent survey/interview
- Focus group to survey (instrument development)
- Survey follow-up focus group
- Case study with multiple sources
- Interview and observation
- Document and interview elicitation
- Participatory method choice

## Search buckets

1. **Quantitative procedures and models:** chi-square tests, t-tests, ANOVA, linear and logistic regression, survey-weighted/descriptive analysis, multilevel and longitudinal models, causal designs, assumptions, diagnostics and uncertainty. Check where each fits (for example: categorical association, group comparison, binary outcomes, scale analysis or causal estimation), and distinguish inferential procedures from software.
2. **Qualitative analysis traditions:** critical discourse analysis, conversation analysis, interpretative phenomenological analysis (IPA), thematic/framework analysis, content analysis and codebook-based analysis. Preserve each tradition's question, unit of analysis, analytic commitments and limitations; do not treat them as interchangeable.
3. **Computational text and digital social research:** NLP/text mining, corpus construction, supervised classification, topic/embedding methods, sentiment measures, validation and error analysis. Distinguish a computational procedure from Python/R/Jupyter, packages, and qualitative interpretation.
4. **Machine learning and its foundations:** supervised classification/regression, regularisation, tree ensembles and other supported model families; unsupervised methods only where they fit a stated question. Verify what builds on statistical/data foundations, what is an alternative, and what is merely complementary. Do not claim that an ML model is a direct counterpart to every classical test.
5. **Mixed-method and combined designs:** inspect every named combination separately. Add techniques only when the combination's component methods and research sequence warrant them. State where integration occurs and what evidence each component contributes.
6. **Specialist computational, network and spatial methods/tools:** agent-based modelling and relevant environments; network analysis with graph concepts and suitable packages/visual tools; spatial analysis with suitable social data and GIS tools; sensitivity/scenario methods; reporting and visualisation tools. Keep method, conceptual preparation and software as distinct item types and preserve domain/area ownership.

## Comprehensive software inventory requirement

Do not limit tool research to SPSS, R and Python, or assume one package fits every method. For each technique, search the existing D078 records and authoritative provider documentation for all relevant, currently usable software categories and named options. Consider statistical packages and languages, survey/data-collection platforms, qualitative analysis software, NLP libraries, notebook/reproducibility environments, network-analysis and visualisation tools, GIS/spatial tools, simulation environments, evidence-synthesis tools, and reporting/visualisation software. Examples already present in the graph include SPSS, Stata, jamovi, R, Python, Jupyter, pandas, scikit-learn, NVivo, Taguette, NetworkX, igraph, Gephi, Mesa, NetLogo, Casevo, QGIS, KoboToolbox, Rayyan, Tableau and Power BI; verify each rather than assuming it remains appropriate or available.

For each tool, record what technique/output it supports, whether it is a tool or a method, suitable alternatives, interoperability or licensing/access constraints where verifiable, and the method/task route where it belongs. A shared tool may appear on multiple routes, but it must not be duplicated or treated as a universal prerequisite. Search for relevant alternatives beyond this example list; include none that cannot be tied to a real D078 learning use and verified source.

## Explicit techniques to resolve

- Chi-square tests
- Independent/paired t-tests where the design supports them
- ANOVA and repeated-measures variants where the design supports them
- Logistic regression for binary outcomes; distinguish inferential regression from classification workflows
- Critical discourse analysis
- Interpretative phenomenological analysis (IPA)
- NLP/text mining for social research, with human/context validation
- Machine-learning counterparts or complements, including supported classification/regression methods, and their statistical, programming, measurement, data-quality and ethical foundations
- Connections from classical methods to advanced ML only where evidence supports `builds_on`, `alternative_to`, or `complements`; do not infer a relationship from the fact both use numeric data

## Classification and sequencing rules

- First identify an existing canonical record. Reuse it where it represents the same learning item; do not add aliases or duplicate nodes.
- Add a new selectable item only when external evidence verifies a substantive, teachable method/tool and no existing canonical record covers it. Preserve source-layer ownership.
- Put techniques under their relevant domain method, area method, or combination component. Put tools under the method/task that uses them. A tool's appearance under several routes does not make it a method.
- Keep the learner-facing path choice-led but explicit: foundation/method, then technique or specialist extension, then suitable implementation tool or alternative. Explain the reason for each transition in the existing approved item-level copy or evidence fields; do not write new UI copy in this data audit.
- Use `builds_on` only for real learning preparation, `alternative_to` for mutually substitutable choices, and `complements`/`works_with` for items that may be used together. Do not treat alternatives as cumulative steps.
- Every useful/specialist item stays skippable: `blocking_policy: never`, `sequence_policy: none`, `auto_add: false`, `auto_order: false`. A method selection does not mean every technique under it is required.
- A combination displays the union of only the techniques supported by its selected component methods and own route evidence; it does not auto-select component methods or all tools.
- Record source URLs, locator/section where available, access date, resolution rationale, target IDs, learner applicability and explicit disposition (`resolved_ready_for_use`, `resolved_explanatory_only`, or `unresolved_after_exhaustive_search`). Never use `needs_review` as an outcome.

## One-pass evidence and resolution deliverables

The final audit artifact must include one row per discovered technique or tool, with:

| Field | Required content |
|---|---|
| Canonical identity | Existing ID or newly approved ID, label, item type and owner layer |
| Method route | One or more exact D078 method IDs; combination IDs only where supported |
| Purpose and limits | What question/data/design it fits and what it cannot establish |
| Tool relation | Separate software choices, access/fit notes, and alternatives |
| Method relation | Evidence-backed `builds_on`, `alternative_to`, `complements` or `works_with` link |
| External evidence | Authoritative source URL and locator, plus access date |
| Final state | Explicit resolved/clickable or resolved/explanatory disposition; unresolved only after the one documented search |

Before closing, reconcile every row against all 22 methods and nine combinations, verify all source/target IDs resolve, confirm route projection, and audit that no optional technique/tool blocks progression. Save the final ledger and graph/export together so the work is not repeated as a fresh search.

## 2026-10-20 resolution addendum

The one-pass graph update and route export now include the following reviewed items and links. The canonical machine-readable record is `data/career-mapping/_audit/D078_METHOD_TECHNIQUE_RESOLUTION_2026_10_20.json`; the canonical graph is `data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json`; the student-route contract is `src/data/d078MethodAwareUiData.json`.

### Additional selectable techniques

Eight further techniques were verified and made selectable as optional domain-owned items:

- Fisher's exact test, plus Barnard's and Boschloo's unconditional exact tests for appropriate independent-binomial 2×2 tables. These retain distinct sampling assumptions and p-value conventions; they are linked as alternatives where justified, not treated as interchangeable defaults. SciPy's official references document the assumptions and comparative properties of [Barnard's exact test](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.barnard_exact.html) and [Boschloo's exact test](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.boschloo_exact.html).
- Wilcoxon rank-sum/signed-rank, Kruskal–Wallis, and Friedman procedures for independent, paired, independent multi-group, and complete matched-block settings. Their route explanations distinguish rank/distribution contrasts from mean comparisons and warn against using them as automatic repairs for every parametric assumption problem. Provider procedures are documented by [IBM SPSS nonparametric tests](https://www.ibm.com/docs/en/spss-statistics/30.0.0?topic=tests-overview-npar-command) and [JASP's nonparametric-test release notes](https://jasp-stats.org/2018/06/20/introducing-jasp-0-9/).
- Probit regression as a distinct binary-outcome link choice alongside logistic regression. The records distinguish coefficient scales and estimands and link to official [SPSS Probit](https://www.ibm.com/docs/en/spss-statistics/30.0.0?topic=regression-probit), [Stata probit](https://www.stata.com/manuals/rprobit.pdf), and [statsmodels Probit link](https://www.statsmodels.org/stable/generated/statsmodels.genmod.families.links.Probit.html) references.
- Tree-ensemble prediction/classification, routed to scikit-learn and Python as optional implementations. It is framed as a predictive comparison to a logistic baseline only when prediction is the goal; it is not presented as a replacement for tests, measurement validation, or causal identification.

The existing eight core items (chi-square, t-tests, ANOVA/repeated-measures comparisons, logistic regression, critical discourse analysis, IPA, NLP/text mining, and supervised machine learning) remain present. Their method links now distinguish foundations (`builds_on`) from design/application relationships (`complements`). For example, an experiment can supply a design for a t-test without being something the t-test pedagogically builds on. Tool links remain separate from method links.

### Area-item source and route resolution

The existing 22 area-route records now have explicit resolved states: 11 selectable learning items and 11 explanatory/grouped/conditional records. Every explanatory prompt has canonical linked destinations (22 destination links total); prompts remain visible as context and are excluded from selectable item arrays. The separate 14 area-owned software choices are source-backed and selectable. Three Casevo route records and one economics time-series extension are also recorded as source-backed optional route material. Across those area records, no item remains unresolved after the documented search. Ownership was preserved for domain-owned tools that support area routes.

The exporter now carries `explanatory_item_ids` separately from learning-item IDs. It resolves area-task links through each method-area route's `task_family_ids`, so grouped prompts and their individual destinations actually appear on applicable area/method routes. The exported bundle currently has 51 method-area routes with explanatory references and 31 combination-area routes with them; the 57 references in method routes have no dangling IDs, no prompt leakage into selectable arrays, and every canonical destination exists in its route.

### Final artifact and integrity counts

- 86 unique ledger rows: 74 `resolved_ready_for_use`, 12 `resolved_explanatory_only`, 0 `unresolved_after_exhaustive_search`.
- The 74 ready rows all have source URLs, `source_backed: true`, and `selectable: true`; all are skippable with `blocking_policy: never`, `sequence_policy: none`, `auto_add: false`, and `auto_order: false`.
- 16 domain technique items are routed across the 22 reviewed methods; 13 verified software items were added as separate tool records. Existing route-tool evidence and 14 area tool options were reconciled in the same ledger.
- Eight technique-to-technique alternative pairs are documented; 16 tool-alternative pairs were reviewed. Nine false cross-type alternative pairs were removed, and AI-assisted annotation was corrected to a complementary relation with text classification.
- The graph contains 1,579 nodes and 13,321 edges; all edge endpoints resolve. The generated D078 route bundle covers 22 methods, nine combinations, 116 method-area routes, and 421 method-area-role routes. No new resolution/choice edge is blocking.
- The graph patch was applied twice with stable counts and output, confirming repeatable generation. No requirement dispositions, role fit, ownership, SQL, or migrations were changed by this addendum.

## Completed one-pass findings and decisions

### Domain methods reviewed

All 22 existing method nodes were checked. The domain-wide techniques added as distinct optional learning items are chi-square tests, one/two-sample and paired t-tests, ANOVA including repeated-measures variants, binary-outcome logistic regression, critical discourse analysis (CDA), interpretative phenomenological analysis (IPA), natural language processing/computational text mining, and supervised machine learning for prediction/classification. Existing canonical graph items for network analysis, social network analysis, ABM, spatial analysis, surveys, evaluation, evidence synthesis, psychometrics, causal inference, and panel/multilevel analysis were reused rather than duplicated.

| Existing domain method | Appropriate next techniques and specialist choices | Fit boundary |
|---|---|---|
| Archival and historical research | Source criticism, provenance, archival sampling, chronology and comparative interpretation; digital OCR/text tools only when a corpus warrants them | Digitisation does not establish source authenticity or context |
| Case-study and comparative-case design | Within-case analysis, structured comparison, process tracing and triangulation across documents/interviews/observations | A case design does not by itself supply a causal counterfactual |
| Agent-based modelling | Formalise actors/rules, implement model, calibrate/validate, sensitivity and scenario exploration | Simulation output is conditional on encoded assumptions; NetLogo and Mesa are alternative environments, not methods |
| Computational/digital social research | Digital-trace measurement/sampling, computational text/NLP, supervised classification, network analysis, reproducible pipelines and model/error validation | Platform traces are selective measures of social activity; automated labels need human/context validation |
| Document and content analysis | Qualitative content analysis, codebook analysis, CDA, corpus-based quantitative text analysis and NLP-assisted retrieval/classification | Counts and classifiers do not replace interpretation of context, power, genre or meaning |
| Interviews | Structured/semi-structured/narrative interviewing; thematic/framework analysis or IPA where the question concerns lived experience | IPA is idiographic and interpretive; it is not a large-corpus text classifier |
| Mixed methods | Exploratory and explanatory sequences, convergent comparison, joint displays, connecting/merging/building integration | Use the combination designs below; a software package does not create integration by itself |
| Observation and ethnographic approaches | Participant/non-participant observation, fieldnotes, reflexive/interaction analysis and triangulation | Observe within a stated setting and address positionality and reactivity |
| Qualitative methods | Thematic/framework/codebook analysis, IPA, CDA, conversation analysis and case-based interpretation | These are distinct traditions; do not present them as interchangeable coding recipes |
| Quantitative methods | Descriptive summaries; chi-square for categorical counts; t-tests for fitted two-mean comparisons; ANOVA for multi-group/factorial or repeated designs; regression including logistic for binary outcomes; survey-weighted and longitudinal models where design requires | Choose by outcome, sampling/design, assumptions and inferential or predictive aim. None is a universal next step |
| Spatial analysis and mapping | GIS data preparation, map scale/projection, spatial autocorrelation, point/area comparison and suitable spatial regression | Maps describe spatial patterns; ecological inference and boundary/scale effects remain relevant |
| Surveys and questionnaire design | Sampling/coverage, cognitive pretesting, mode/nonresponse, weights, measurement quality and design-aware analysis | Qualtrics, KoboToolbox, ODK and LimeSurvey collect responses; collection software is not a sampling method |
| Discourse and conversation analysis | CDA for text/discourse in social context; conversation analysis for turn-by-turn interaction and sequence | NLP can aid corpus retrieval or measurement but does not replace interpretive/contextual analysis |
| Experiments, quasi-experiments and causal inference | Randomised designs; difference-in-differences, regression discontinuity, instrumental variables and matching/weighting where assumptions fit; causal ML only for supported estimands and data | Logistic regression can model a binary outcome inside a causal design; it does not create identification |
| Focus groups and workshops | Facilitation, group interaction, instrument development and thematic/framework analysis | Group data include interaction effects and should not be treated as independent individual interviews by default |
| Longitudinal, panel and multilevel data | Repeated measures, fixed/random effects, growth/mixed models, GEE, time-series analysis and forecast evaluation where the observations and question are time-indexed | Time series is specifically useful in economics and other areas with ordered observations; panel and time-series structures are related but not interchangeable |
| Participatory and action research | Co-design, community-led inquiry, action/reflection cycles and participatory analysis/accountability | Participation and governance are part of the method, not just a data-collection tool |
| Programme evaluation and theory of change | Logic models/theory of change, process/outcome/impact evaluation, contribution analysis and causal designs when identification is justified | The evaluation question, causal claim and evidence strength must remain distinct |
| Psychometrics and scale construction | Item writing, cognitive pretesting, reliability, EFA/CFA, measurement invariance/DIF and IRT where justified; t/ANOVA may compare measured scores only after measurement fit is addressed | A software alpha/factor output does not establish construct validity or cross-group comparability |
| Evidence synthesis | Search protocol, screening, appraisal, qualitative/quantitative synthesis and meta-analysis where effects are sufficiently comparable | Rayyan/Covidence/EPPI-Reviewer/RevMan support review operations; screening automation still needs human verification |
| Network analysis | Network definitions, graph measures, centrality, communities and network visualisation | NetworkX/igraph are analysis libraries; Gephi is a visual analysis environment. Graph theory is mathematical foundation, not a software tool |
| Social network analysis | Tie definition, boundary/sampling, network measures, relational models and diffusion where the data/design support it | It is a social-network application of network methods; do not duplicate the method or infer behaviour from graph metrics alone |

### Combination designs reviewed

Each of the nine existing combinations uses the union of its component-method technique/tool routes. No component method or technique is automatically selected, and no method becomes compulsory because it appears in a combination.

| Combination | Technique choices surfaced from its components |
|---|---|
| Exploratory sequential mixed methods | Qualitative analysis and instrument/item construction, then survey measurement and quantitative analysis; make the qualitative-to-quantitative integration explicit |
| Explanatory sequential mixed methods | Quantitative descriptive/model analysis followed by purposive interview/focus-group explanation; connect the samples/results and integrate in a joint display or narrative |
| Convergent survey/interview | Survey design-aware analysis plus interview thematic/framework analysis; compare agreement, complementarity and divergence |
| Focus group to survey (instrument development) | Focus-group elicitation and qualitative analysis, cognitive pretesting, item/scale construction, then survey pilot and quantitative measurement checks |
| Survey follow-up focus group | Survey pattern/contrast analysis then focus-group explanation; select participants from the quantitative result and preserve the distinct evidence roles |
| Case study with multiple sources | Case comparison/process tracing plus document, interview and/or observation analysis; use source triangulation without assuming all sources agree |
| Interview and observation | Interview interpretation plus fieldnote/interaction analysis; IPA only when the focal question is individual lived experience and its idiographic requirements fit |
| Document and interview elicitation | Document/content/CDA analysis plus interview analysis; examine how documents shape or contest accounts, with context and source provenance |
| Participatory method choice | Co-designed evidence collection and participatory analysis; select survey/interview/focus-group/document techniques from community question and access, not from a fixed list |

### Broad tool inventory reviewed

The audit covered named software already in the D078 route graph and verified additional options against official/provider documentation. It did not treat any programming language or software suite as universally suitable. Existing route-owned tool options were retained; verified additional tool nodes were added as separate optional choices.

| Learning use | Verified options present/added in this graph pass | Appropriate alternatives/limits |
|---|---|---|
| Statistical analysis and models | IBM SPSS Statistics, Stata, R, Python with statsmodels/scikit-learn, jamovi, JASP, SAS/STAT; EViews for economics time series | R/Python are programming environments; statsmodels is oriented to statistical estimation/inference and scikit-learn to predictive/model-evaluation workflows. JASP/jamovi offer GUI paths. SAS, SPSS, Stata and EViews are commercial/licensed; availability depends on institution/access |
| Survey and field data capture | Qualtrics, KoboToolbox/KoboCollect, ODK, LimeSurvey | These collect and manage responses; design, sampling, ethics, measurement and statistical analysis remain separate learning items |
| Qualitative data management/coding | NVivo, Taguette, MAXQDA, ATLAS.ti, Dedoose, QualCoder | These support organising/coding/retrieval. MAXQDA and Dedoose include mixed-method features; QualCoder is free/open source. Tool coding suggestions require researcher review; none establishes CDA/IPA/thematic validity |
| Corpus and text analysis | R/quanteda/tidytext; Python/NLTK/spaCy; scikit-learn for feature/classification pipelines; Hugging Face Transformers for pretrained model workflows; Jupyter for reproducible notebooks | Dictionary, classifier, topic and embedding approaches operationalise different constructs. Check language coverage, provenance, model licence, privacy, validation, error and subgroup performance |
| Networks | Gephi, NetworkX, R/igraph; existing route options also include selected network-specific tools | Choose visual GUI versus programmable/large-scale analysis by task. Define nodes/ties/boundaries before choosing software |
| GIS/spatial and geographic data | QGIS, ArcGIS Spatial Analyst, GeoDa, GeoPandas, PySAL | QGIS is open-source; ArcGIS is licensed. GeoDa/PySAL/GeoPandas support different analytical/programming workflows; coordinate system, scale and spatial-data provenance matter |
| Agent-based modelling | NetLogo, Mesa (Python), and Casevo | NetLogo, Mesa, and Casevo are distinct optional implementation choices. Casevo is documented as a Python framework for cognitive-agent/social-evolution simulations on complex networks, built on Mesa; its worked LLM example may need separate provider access. A repository and tutorial verify the tool exists and can be used, not broad adoption or the validity of simulated behaviour. |
| Evidence synthesis and references | Rayyan, plus reference managers and route resources already present | Screening tools assist workflow; they do not replace protocol, eligibility decisions, critical appraisal or human confirmation |
| Reporting and visualisation | Tableau, Power BI, R/ggplot2, Python/matplotlib (existing graph items) | Visualisation/reporting tools are optional outputs after a defensible analysis, not methods or analytic prerequisites |

### Seven area audit

The seven current specialization routes were checked alongside their existing method-area and role-route projections (116 method-area routes and 421 method-area-role routes). Existing area-owned records were reused. No role fit, role ownership, requirement disposition or taxonomy was changed.

| Area | Existing specialist methods/items reviewed | Gap resolution |
|---|---|---|
| Computational and digital social science | Digital-trace measurement/provenance, text classification, network analysis, reproducible data, Python/R, pandas/Jupyter, Mesa/NetLogo | Added explicit domain NLP and supervised ML methods; available only on relevant computational/document/discourse routes and optional |
| Economics applied analysis | Applied econometrics, causal evaluation, distributional analysis, Nigerian microdata, economic modelling and R/Python workflows | Added an **area-owned** optional econometric time-series analysis/forecasting item to economics quantitative and longitudinal routes; EViews is linked as one software option, with existing Stata/R/Python/statsmodels paths retained where their routes apply |
| Human geography and population | Population/demographic measures, GIS/spatial analysis, projection, migration/urbanisation, census and administrative data appraisal | Existing QGIS, ArcGIS Spatial Analyst, GeoDa, GeoPandas and PySAL routes retained; no extra spatial duplicate added |
| Politics, governance and public policy | Policy text-as-data, policy/programme evaluation, survey sampling, options appraisal, public participation and evidence review | Existing policy task routes retained; statistical/text techniques surface through relevant domain method components, not as universal policy requirements |
| Social research and evaluation | Evaluation design, theory of change, sampling/measurement, survey/interview/focus-group/document method choice, quantitative/qualitative/mixed analysis | Added verified qualitative software and survey collection alternatives as optional tools; evidence and causal limits remain separate |
| Sociology and social anthropology | Ethnography, interview/focus-group, document/media analysis, thematic/framework analysis, quantitative text analysis, social networks, digital-trace ethics and ABM | Added CDA, IPA and NLP as distinct optional routes; CAQDAS/text/network/simulation tools remain separate selectable tools |
| Psychology and social behaviour | Constructs/measurement, adaptation, qualitative inquiry, mixed comparison, psychometrics, digital/AI methods and ethics | Added t-test/ANOVA/logistic analysis paths through quantitative/psychometric routes; measurement validity and group comparability remain explicit foundations |

Area-level support does not make a domain-owned technique into an area-owned item. The economics time-series item is area-owned because the current records support an economics-specific application. No new role-fit claim was inferred from an area's presence.

### Method relationships and sequencing decisions

- Chi-square, t-tests, ANOVA and logistic regression are separate selectable techniques under their relevant methods. They are not a fixed serial chain and none blocks progression.
- ANOVA is related to t-tests through the general linear model, but the graph does not instruct the learner to complete both. Use a two-group comparison or a multi-group/factorial/repeated design as the question and design warrant.
- Logistic regression is a generalized linear model for binary outcomes and can serve inference or prediction depending on the goal. It complements supervised machine learning for some prediction/classification tasks as a transparent model/baseline; it is not a one-to-one substitute for every classical test or a causal design.
- NLP/text mining can support retrieval, measurement and scalable classification. It complements document/discourse work and can be used under computational methods. It does not reproduce CDA's contextual analysis or IPA's case-by-case interpretation.
- CDA and IPA are distinct, externally verified, selectable method items with their own scope/limits, not buried in explanatory prose.
- Sensitivity analysis, scenario analysis and agent-based modelling are not classified as exclusively mixed methods. Their use depends on model/design and evidence inputs; an ABM can be quantitative/computational and can be integrated with qualitative evidence when justified.
- Quantitative-method foundations lead into supervised ML as a `builds_on` connection because prediction/classification work relies on measurement, sampling, statistical reasoning and model evaluation. Logistic regression is linked as a useful transparent predictive baseline (`complements`), not as a direct counterpart to every test. NLP builds on computational/digital research practice; it complements document/discourse/qualitative interpretation when text retrieval or measurement is useful.
- Software has `tool_for` edges to the method it can implement. Selected package pairs have explicit `alternative_to` edges only when both can serve the same bounded task; visualization, collection, analysis and simulation roles remain distinct when they are not substitutes. These edges are optional with `blocking_policy: never`, `sequence_policy: none`, `auto_add: false` and `auto_order: false`. Alternatives remain choices, not cumulative sequence steps.

### Evidence sources and validation

Method/technique decisions use primary or authoritative documentation, including official R documentation for `chisq.test`, `t.test`, `aov` and `glm`; NIST/IBM guidance for categorical tests and mean comparisons; statsmodels, Stata, SAS and JASP documentation for model coverage; Birkbeck IPA@BBK and Fairclough/CDA scholarship for qualitative method boundaries; scikit-learn and Hugging Face documentation for text features, classification and hold-out/cross-validation; and provider documentation for MAXQDA, ATLAS.ti, Dedoose, QualCoder, QGIS, Mesa, NetLogo, Casevo, EViews, Qualtrics, ODK, LimeSurvey, OpenSesame, PsychoPy, PsyToolkit, GeoDa, GeoPandas, PySAL/esda, ArcGIS Spatial Analyst, NVivo and Taguette. Source URLs, locators where available and access date are stored on the reviewed graph items and in `data/career-mapping/_audit/D078_METHOD_TECHNIQUE_RESOLUTION_2026_10_20.json`.

### Existing route-tool reconciliation

The inventory audit found 44 unique software or data-collection choices in method routes and their combination projections. All 44 have a documented research use; their graph records now state `resolved_ready_for_use`, `clickable_when_projected`, `student_visible: true`, and optional/nonblocking behavior. The separate record named “Choose a quantitative analysis tool that fits the task” is a decision prompt rather than software or a substantive learning item; it is retained as explanatory-only and removed from selectable tool lists.

The 44 verified choices cover statistical analysis and coding (JASP, jamovi, SAS/STAT, SPSS, Stata, R, Python, statsmodels, scikit-learn, pandas, Matplotlib and Jupyter); qualitative analysis (NVivo, ATLAS.ti, MAXQDA, Dedoose, QualCoder and Taguette); surveys and field collection (Qualtrics, LimeSurvey, KoboToolbox and ODK); behavioural experiment construction (OpenSesame, PsychoPy and PsyToolkit); NLP/text analysis (spaCy, NLTK, quanteda and Hugging Face Transformers); network analysis/visualisation (NetworkX, R/igraph and Gephi); geospatial work (ArcGIS Spatial Analyst, GeoDa, GeoPandas, PySAL/esda and QGIS); simulation (Mesa, NetLogo and Casevo); and economic/time-series work (EViews and the existing statistical environments above). Tool items keep their existing domain or area ownership. Tool choice does not become a prerequisite, and license, access, language fit, privacy and version conditions remain project-specific.

Casevo's older record described its status as “not established” and assumed the example required paid Baichuan API access. The official repository identifies an Apache-2.0 Python framework and worked tutorial, with a release listed in 2025; the linked research paper describes its scope. The corrected records make the framework selectable as an optional specialist choice while keeping the narrower caveat that an LLM-provider integration may have separate access, cost, privacy and terms. Simulated outputs remain simulations; they are not observations, forecasts or validated population claims. Existing area-owned Casevo references remain area-owned.

The broader scan covered 22 area-route records that were typed or phrased as tools. Eleven actual tools/data-learning items are source-verified and clickable when projected, including KoboToolbox, Rayyan, the Nigeria Budget Office I-Monitor portal, official Nigerian survey/macro data, QGIS and the Economics-area SPSS/R workflows. Eleven grouped alternatives, superseded duplicates, generic AI-workflow prose, conditional guidance rows, or application-reference records are explicitly explanatory-only and removed from selectable arrays. Their canonical individual tools remain available through the relevant method/area routes. This keeps alternatives in separate cards and prevents an aggregate “A or B” row from selecting two tools at once. All 7 area records and 116 method-area/421 method-area-role route joins were checked; role-fit and ownership fields are unchanged.

The graph now records 8 new domain techniques, 13 new verified software choices, 1 economics-owned time-series method, and a source-backed resolution record for every pre-existing route tool. It also records 15 newly reviewed, bounded tool-alternative pairs; other valid existing item alternatives remain intact. The existing 22 methods and nine combinations remain canonical. There are zero unresolved outcomes in the one-pass technique/tool ledger; all useful extensions are route-linked, skippable and nonblocking. Requirement dispositions, source-layer ownership and role-fit claims were not changed.
