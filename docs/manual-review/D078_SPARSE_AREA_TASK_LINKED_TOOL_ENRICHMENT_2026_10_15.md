# D078 Sparse-Area Task-Linked Tool Enrichment — 2026-10-15

## Purpose and decision rule

This is an evidence checkpoint for the three D078 areas whose current inventory shows only 3, 2 and 1 named tools. It is not a target-count exercise. Add a named tool only when it supports a specific, already-reconciled task in that area; explain the area's use of it, what it produces, prerequisites, limits, valid alternatives and the learning/reference links. A tool's presence in another area does not establish its fit here. Reuse is allowed only with a distinct, evidence-backed area context. Do not imply that owning or using software proves competence.

The CLI successfully read the canonical master reconciliation file. The tools
below are **web-verified, task-mapped enrichment decisions/proposals**; this
checkpoint itself is not the canonical data integration, graph rebuild or SQL
seed. Exact existing task anchors are now recorded below, and no new task is
being invented to justify a tool. Next integration must preserve the existing
seven canonical areas and the fixed learning order, and then update/rebuild the
master graph and generated seed from the canonical inputs.

## Human Geography and Population Studies — currently 1 named tool

The one named record is QGIS. That does not mean the area has only one valid
tool choice: the reviewed area already contains the spatial-analysis task, so
there are several genuinely distinct ways to support different parts of that
workflow. These are choices within the spatial-analysis route, not a five-tool
checklist.

### Candidate: GeoDa — conditional useful edge

- **Area task it can support:** examine whether a measured social or population condition is spatially clustered across comparable places, and identify local clusters or spatial outliers. The actual area task/item must be matched before promotion.
- **Context here:** GeoDa is for asking whether a mapped pattern varies across neighbouring places (for example, whether a population or service-access measure clusters by area). It complements GIS data preparation and mapping; it is not a replacement for defining meaningful geographic units, checking data quality, or explaining the social process.
- **What it can produce:** exploratory spatial-analysis output, such as global/local spatial-autocorrelation or cluster results, for interpretation alongside a map and a clearly bounded research question.
- **Prerequisites/relationships:** geographic units and a suitable spatial dataset; a defensible spatial-weights choice; basic descriptive statistics and interpretation. It complements QGIS when QGIS is used to prepare/join/map the spatial data. It is not a prerequisite for every human-geography route.
- **Limits/alternatives:** clustering is not proof of causation; results depend on unit boundaries, data coverage and spatial-weights choices. QGIS is a valid alternative for general GIS and includes spatial-statistics workflows, but should not be represented as interchangeable with GeoDa's focused exploratory-spatial-analysis workflow. R packages such as `sf`/spatial-statistics packages may be alternatives for code-based analysis only if the task requires that route.
- **Official explanation:** [UChicago Center for Spatial Data Science](https://spatial.uchicago.edu/) describes spatial data science as treating location, distance and spatial interaction as core features and applying spatial analysis to policy-relevant social-science research.
- **Official/free learning:** [GeoDa global spatial autocorrelation workbook](https://geodacenter.github.io/workbook/5a_global_auto/lab5a.html); [QGIS spatial-statistics lesson](https://docs.qgis.org/4.2/en/docs/training_manual/vector_analysis/spatial_statistics.html) is a complementary GIS route, not GeoDa training.
- **Disposition:** candidate for the Human Geography and Population Studies tool set only after the exact area task ID and current QGIS item record are checked. It is a useful edge, not a shared foundation or universal requirement.

### Additional options supported by the existing spatial-analysis task

These candidates now map to the existing
`D078:human-geography-population:spatial-analysis-method` item. Their distinct
uses must remain clear in the UI; none is a prerequisite for the others.

#### GeoDa — exploratory spatial-pattern analysis

- **Use here:** test whether measured population or social conditions cluster
  across neighbouring places, and inspect local clusters or outliers.
- **Output:** spatial-autocorrelation statistics and diagnostic plots, read
  alongside a map and a documented choice of geographic units and spatial
  weights.
- **Relationship:** complements QGIS: prepare/check/map spatial layers in GIS,
  then use GeoDa for focused exploratory spatial-data analysis. QGIS itself
  also has spatial-statistics functions, so GeoDa is an optional alternative
  where its focused workflow is preferable, not a mandatory second package.
- **Limit:** spatial clustering does not establish cause; results depend on
  the data, boundaries and spatial-weights specification.
- **Sources:** [GeoDa workbook: Global Spatial Autocorrelation](https://geodacenter.github.io/workbook/5a_global_auto/lab5a.html)
  (free, task-specific tutorial); [UChicago Center for Spatial Data Science](https://spatial.uchicago.edu/)
  (what spatial data science is and why it is used).

#### GeoPandas — joining and overlaying place-based data in Python

- **Use here:** connect population observations to geographic areas, or
  combine/intersect geographic layers before comparing places.
- **Output:** a documented geospatial table/layer for subsequent mapping or
  analysis.
- **Relationship:** complements the spatial-analysis method and can prepare
  data for QGIS or PySAL; it is a Python-code route, not a replacement for GIS
  judgement or geographic interpretation.
- **Limit:** a spatial join only applies geometric predicates; it does not
  confirm that the areas, measures or source coverage are substantively right.
- **Sources:** [GeoPandas spatial-join guide](https://geopandas.org/en/latest/gallery/spatial_joins.html)
  (official task tutorial); [GeoPandas merging guide](https://geopandas.org/en/stable/docs/user_guide/mergingdata.html)
  (joins and examples).

#### PySAL `esda` — spatial autocorrelation in a reproducible Python workflow

- **Use here:** calculate and interpret global or local spatial
  autocorrelation statistics when a research question concerns clustering or
  spatial outliers.
- **Output:** reproducible statistics/plots and inference notes, including a
  documented spatial-weights definition and permutation approach where
  appropriate.
- **Relationship:** a code-based alternative to GeoDa for exploratory spatial
  statistics; it can follow GeoPandas data preparation and complement QGIS
  mapping. Do not stack it with GeoDa as a requirement.
- **Limit:** a statistic is not an explanation of why a pattern occurs; local
  tests and multiple comparisons also need careful interpretation.
- **Sources:** [PySAL `esda` user guide](https://pysal.org/esda/stable/user-guide/index.html)
  (official package guide); [Global Moran's I tutorial](https://pysal.org/esda/stable/user-guide/global_morans_i.html)
  (free, task-specific walkthrough).

Together, QGIS, GeoDa, GeoPandas, PySAL `esda`, and the previously identified
ArcGIS Spatial Analyst route give this area five distinct, evidence-supported
named options. They represent different workflows and licensing choices—not
five things every learner must select. ArcGIS is a paid/commercial GIS option;
show it only as an alternative for learners with access, not as the default.

#### ArcGIS Spatial Analyst — licensed GIS analysis alternative

- **Use here:** raster and feature analysis/modeling when the research question
  requires those operations and the learner or institution has a suitable
  ArcGIS Pro/Spatial Analyst licence.
- **Output:** documented spatial-analysis layers or models and a map/report
  that explains the data, scale and assumptions.
- **Relationship:** an alternative GIS workflow to QGIS and a possible
  complement to GeoDa/PySAL for broader raster or feature analysis; do not
  require learners to buy or use it when open-source tools fit.
- **Limit:** paid licensing and required extensions can restrict access; the
  software does not validate the social measure, geographic boundaries or
  interpretation.
- **Sources:** [Esri Spatial Analyst toolbox reference](https://pro.arcgis.com/en/pro-app/3.5/tool-reference/spatial-analyst/an-overview-of-the-spatial-analyst-toolbox.htm)
  documents the licensed raster/feature analysis scope; [Esri's spatial-temporal
  clusters tutorial](https://learn.arcgis.com/en/projects/identify-popular-places-with-spatiotemporal-data-science/)
  is a task-specific learning example (requires ArcGIS Pro Advanced).

## Social Behaviour and Interaction — broad area, not Psychology alone

The canonical area ID still contains the word `psychology`, but its learner-
facing scope is Social Behaviour and Interaction. Its 23 reviewed records cover
behavioural constructs, groups and identity, conflict, qualitative and mixed
analysis, digital traces, human–AI interaction, experimental agent simulation,
and measurement adaptation. The slug must not make the page read as a
psychology-only pathway.

The inventory currently has two tool *records*, but both bundle several named
products: NVivo/Taguette for qualitative coding, and R/Python/SPSS/Stata for
quantitative analysis. That is already six named choices, before adding
experiment builders. The underlying records nevertheless need to be split or
rendered as clearly explained per-tool options so learners can inspect the
right tool and its own limits/resources; a bundled label is not adequate
per-tool enrichment.

Current task anchors in the reconciled inventory are:

- `D078-A04-method-qualitative-group-inquiry` for qualitative interpretation;
- `D078-A04-skill-measurement-analysis` and
  `D078-A04-method-comparative-mixed-analysis` for quantitative or mixed
  analysis choices;
- `D078-A04-method-behavioural-research-design` for an experiment or survey
  design when that method fits the question;
- `D078-A04-method-human-ai-social-interaction-study` and
  `D078-A04-method-llm-social-agent-simulation-experimental` for the newer
  human–AI and agent-simulation routes, not as ordinary psychology tools.

These IDs are anchors, not permission to treat every tool as approved for
every task. Each tool record must link to only the task(s) its official
documentation actually supports.

Its tasks include studying behaviour and interaction with surveys,
interviews/observation, controlled experiments, qualitative coding, digital
traces and quantitative analysis, across more than one role. Experiment
builders below support only the experimental route; they do not define the
whole area.

### Additional task-linked candidates to cross-check against the area inventory

The following candidates widen the coverage by distinct task, not by padding the count. They should become separate selectable options only if the exact corresponding area task is present in the canonical task inventory. Keep collection, experimental design, qualitative coding and statistical analysis as distinct choices; alternatives within one task stay alternatives.

#### LimeSurvey — online questionnaire design and administration

- **Task fit:** build and publish an online questionnaire with branching or varied question types, collect responses and export results. This supports survey-based study of attitudes, experiences or social behaviour; it does not replace questionnaire design or field sampling.
- **Context and output:** supports the area when a research question requires a structured online survey; output is a questionnaire and response dataset. KoboToolbox may be a better route for mobile/offline field collection. They are complementary only when the project genuinely needs both; otherwise show them as alternatives by collection context.
- **Prerequisites and limits:** define constructs and questions, consider translation/accessibility, sampling, consent and data protection. Platform collection does not establish a valid measure or representative sample.
- **Official explanation and free learning:** [LimeSurvey quick start](https://www.limesurvey.org/manual/Quick_start_guide) and [Community Edition](https://community.limesurvey.org/) describe the open-source survey builder and self-hosted option.
- **Disposition:** task-linked candidate; verify an approved survey-design/collection task ID before promotion.

#### PsyToolkit — psychology-focused experiments and questionnaire studies

- **Task fit:** run cognitive/behavioural experiments, psychological questionnaires or a questionnaire with an embedded reaction-time task.
- **Context and output:** provides psychology-specific examples, scales and experiment tasks; output can include participant responses and reaction times. It is more specialized than a general survey platform and can bridge demonstration/teaching and a carefully designed research task.
- **Prerequisites and limits:** experimental/questionnaire design, measurement validity, participant consent, and analysis. A scale in its library is not automatically valid for every population, language or Nigerian context; review the original instrument evidence and permissions. Online timing and hosting conditions must be considered.
- **Official explanation and learning:** [PsyToolkit overview](https://www.psytoolkit.org/) and its [experiment library](https://www.psytoolkit.org/experiment-library/) and [survey library](https://us.psytoolkit.org/survey-library/) provide explanations, examples and learning materials.
- **Disposition:** distinct candidate covering psychological experiment/questionnaire tasks; verify exact task IDs and distinguish it from PsychoPy/OpenSesame in the comparison UI.

#### QualCoder — open-source qualitative data organization and coding

- **Task fit:** organize and code interview, focus-group, observation or document material when the approved area task calls for qualitative analysis.
- **Context and output:** can support a traceable coding process and retrieval of coded excerpts; interpretation, codebook quality and reflexivity remain the researcher's work.
- **Prerequisites and limits:** qualitative methods, data familiarization, coding decisions and secure handling of potentially identifying material. It does not conduct interviews, establish themes automatically or replace NVivo/Taguette when those are the better supported choice.
- **Official explanation and free learning:** [QualCoder project repository and documentation](https://github.com/ccbogel/QualCoder) is the maintainer-hosted source. Confirm a maintained, task-specific tutorial before adding a student learning link; the repository alone is an explanation/download source, not proof of a complete learning route.
- **Disposition:** alternative candidate only if a distinct qualitative-analysis task is in the approved area inventory and its learning-link contract is completed.

### Can this area have at least five tools?

Yes. It already has more than five named choices hidden in grouped records, and
official sources support additional task-specific experiment/survey options.
The important fix is not inflating the count: it is presenting each justified
tool as its own understandable option, attached to the right task, with
alternatives shown as alternatives. No learner should be told to learn every
competing tool.

### Candidate: PsychoPy — optional experimental-research route

- **Area task it can support:** design and run a controlled behavioral/psychological experiment that presents stimuli, records participant responses and exports trial-level data. Match to a specific experimental-design/behavioral-measurement item before promotion.
- **Context here:** use it when the question calls for a controlled task (for example, comparing response accuracy or timing under defined conditions), rather than for ordinary interviews, surveys, clinical diagnosis or all psychology work.
- **What it can produce:** an experiment specification and collected response/timing data; the researcher still has to justify the design, measure, sampling, consent and analysis.
- **Prerequisites/relationships:** experimental design, operational definitions, measurement, participant protection and data handling; coding is optional for many Builder workflows, while advanced customization may require Python. Complements—not replaces—statistical analysis tools already listed for the area.
- **Limits/alternatives:** a software-generated task does not make a measure valid, a sample representative or a result causal. Online PsychoJS/Pavlovia compatibility should be checked for the particular components before a study is launched. OpenSesame is a valid alternative for graphical experiment building; choose based on study requirements, not as cumulative requirements.
- **Official explanation:** [PsychoPy Builder documentation](https://devdocs.psychopy.org/builder/) explains GUI experiment building and online considerations.
- **Free learning:** [PsychoPy teaching and learning resources](https://psychopy.org/teaching/index.html) includes Builder materials and video tutorials; [official Builder concepts](https://devdocs.psychopy.org/builder/concepts.html) explains routines, flow and experiment structure.
- **Disposition:** optional/conditional area tool, pending exact task-ID mapping and inspection of current NVivo/Taguette and statistical-tool records. Do not label it a prerequisite for ordinary qualitative or survey-based psychology.

### Candidate: OpenSesame — alternative experimental-research route

- **Area task it can support:** construct a behavioral experiment for psychology (also neuroscience or experimental economics), especially when a point-and-click experiment builder fits the task.
- **Context here:** an alternative to PsychoPy for presenting stimuli and recording responses in a controlled behavioral task. The student chooses one suitable route; the tools are not cumulative requirements.
- **What it can produce:** a runnable experiment and recorded participant responses; this does not establish that the theoretical construct or experimental design is sound.
- **Prerequisites/relationships:** experimental design, operationalization, response measurement and ethical participant handling. Python/JavaScript are extensions, not mandatory prerequisites for the beginner graphical workflow. It complements later statistical analysis and is separate from qualitative coding tools.
- **Limits/alternatives:** tool choice does not establish reliability, validity, representativeness or ethical approval. Browser execution has compatibility constraints; check the chosen experiment's components.
- **Official explanation and free learning:** [OpenSesame current documentation](https://osdoc.cogsci.nl/current) identifies psychology experiments as a core use and links a beginner experiment tutorial; [beginner gaze-cuing experiment tutorial](https://osdoc.cogsci.nl/4.0/tutorials/beginner/) walks through a complete behavioral task; [official video tutorials](https://osdoc.cogsci.nl/tutorials/video/) include experiment-building videos (some cover older versions, so label version limits).
- **Disposition:** an alternative to PsychoPy for the same narrowly scoped experimental task. Keep one as an alternative in the route comparison; do not display both as required learning.

## Politics, Governance and Public Policy — currently 3 named tools

The present three records appear to cover field data collection (KoboToolbox), citizen project-feedback/monitoring (Nigeria Budget Office I-Monitor) and review screening (Rayyan). The search did **not** establish that the count itself is deficient. A possible additional tool must match a task in the area's reviewed inventory rather than merely being a popular policy tool.

### Candidate for task-match check: MAXQDA — conditional policy-document/interview analysis

- **Potential area task:** systematically code and compare policy documents, implementation reports, interview records or stakeholder feedback when the approved task set includes qualitative or mixed-methods policy evaluation.
- **Context here:** organize and analyze text evidence about policy design, implementation or stakeholder experience; it does not collect citizen feedback, independently verify claims, or determine whether a policy caused an outcome.
- **What it can produce:** a documented coding structure, coded text and comparisons/visualizations that can inform an evaluation report.
- **Prerequisites/relationships:** qualitative content/thematic analysis, a documented codebook, source provenance and ethical handling of interview material; complements field collection and evaluation methods but is not a substitute for them.
- **Limits/alternatives:** software does not decide the correct interpretation or remove researcher bias. Existing NVivo/Taguette records may already cover the same task; if so, MAXQDA should appear only as an evidenced alternative, not an extra requirement. MAXQDA is commercial software; do not imply free access.
- **Official explanation:** [MAXQDA mixed-methods research overview](https://www.maxqda.com/mixed-methods) describes qualitative and quantitative text/data analysis capabilities.
- **Disposition:** **do not add yet**. First map the existing three tools and MAXQDA to the Politics, Governance and Public Policy area's exact approved task items. If the area's actual tasks do not include policy text/interview analysis, reject this candidate rather than creating a new task for it.

## Evidence reviewed and next work

Primary product/maintainer/official-university pages reviewed on 2026-10-15:

- GeoDa / UChicago: https://spatial.uchicago.edu/ ; GeoDa workbook: https://geodacenter.github.io/workbook/5a_global_auto/lab5a.html
- GeoPandas official spatial joins: https://geopandas.org/en/latest/gallery/spatial_joins.html ; PySAL `esda` guide: https://pysal.org/esda/stable/user-guide/index.html
- QGIS official training: https://docs.qgis.org/4.2/en/docs/training_manual/vector_analysis/spatial_statistics.html
- PsychoPy official documentation and teaching resources: https://devdocs.psychopy.org/builder/ ; https://psychopy.org/teaching/index.html
- OpenSesame official documentation/tutorials: https://osdoc.cogsci.nl/current ; https://osdoc.cogsci.nl/4.0/tutorials/beginner/
- PsyToolkit official experiment/survey resources: https://www.psytoolkit.org/ ; https://www.psytoolkit.org/experiment-library/ ; https://us.psytoolkit.org/survey-library/
- LimeSurvey survey-design and quick-start guidance: https://www.limesurvey.org/manual/How_to_design_a_good_survey_%28guide%29/en ; https://www.limesurvey.org/manual/Quick_start_guide
- Esri Spatial Analyst scope and task-specific learning: https://pro.arcgis.com/en/pro-app/3.5/tool-reference/spatial-analyst/an-overview-of-the-spatial-analyst-toolbox.htm ; https://learn.arcgis.com/en/projects/identify-popular-places-with-spatiotemporal-data-science/
- MAXQDA official mixed-methods overview: https://www.maxqda.com/mixed-methods
- Nigerian context already represented by the official [Budget Office I-Monitor portal](https://budgetoffice.gov.ng/imonitor/); this is a local context/source, not a prerequisite for globally relevant methods or tools.

Next, after the local runner works, integrate only records whose exact task, tool identity, area ownership, relationships, limits and source/learning links pass the controlling content contract. Then continue role enrichment from the D078 role/task inventory, excluding roles already dispositioned outside D078 and preserving the user-approved canonical seven areas (never legacy subgroups).
