# D078 sequence evidence review: A01–A02

**Review date:** 2026-10-12  
**Scope:** Sociology and Social Anthropology; Economics and Applied Economic Analysis.  
**Records reviewed:** 10 sequencing-critical relationship references from the graph and the A01–A03 disposition handoff.  
**Boundary:** Evidence checkpoint only. The graph builder, graph JSON, handoffs, canonical data, role-fit and subject matcher were not changed.

## Result summary

The five Sociology claims are supported as task-dependent safeguards or gates, not general learner prerequisites. One Sociology handoff has its direction reversed: ethical review should gate the relevant digital-trace collection or reuse. In Economics, the statistical-foundations claim supports a learner order after narrowing its target; causal identification is a gate on making causal claims; causal machine learning follows causal-inference methods in the cited advanced-course example; and the Casevo relationship is a source-specific learning order. The economic-measurement self-reference is not a valid sequence edge.

“Global” below means an international/professional or general methods source, not a Nigerian legal requirement. The Nigeria-specific notes identify the limited scope of the Nigerian evidence; no missing Nigerian source is treated as a blocker to the general methods findings.

## Sociology and Social Anthropology (A01)

### 1. `area_relationship_reference:d078-soc-ethics-reflexivity:requires:fieldwork-or-human-participant-data-collection`

- **Claim tested:** `D078-SOC-ETHICS-REFLEXIVITY` requires fieldwork or human-participant data collection.
- **Finding:** **(b) Conditional task gate/safeguard.** The premise is reversed if read as a prerequisite: fieldwork is not required to learn or apply research ethics. When a study does collect information from or about people, the project must address consent, risk, permissions and applicable review before collection, with ethical duties continuing during the work.
- **Correct relation/direction:** `fieldwork or human-participant data collection` **is gated by** project-specific ethics, consent and permission checks. Keep this as a conditional gate, not a universal course sequence.
- **Evidence:** [AAA Code of Ethics (PDF)](https://americananthro.org/wp-content/uploads/ethicscode-2.pdf), III.A.2–4, pp. 1–2 (avoid harm/privacy; consent in advance, with scope depending on project and applicable country/community rules) and III.B.1, p. 2 (identify ethical issues in proposals and as projects proceed). **Global/professional.** Accessed 2026-10-12.
- **Nigeria context:** The cited AAA code is not Nigerian law. NHREC’s National Code is specifically a health-research ethics instrument; do not generalize it into a universal HREC approval requirement for every social-science project. Determine the applicable Nigerian institutional, community and legal review rules for the actual project. Absence of a single Nigeria-wide social-science rule does not weaken the global ethical safeguard.

### 2. `area_relationship_reference:d078-soc-llm-assisted-coding:requires:ai-data-governance-and-validation`

- **Claim tested:** LLM-assisted qualitative coding requires AI data governance and validation.
- **Finding:** **(b) Conditional task gate/safeguard.** Supported when sensitive or participant-derived text is submitted to or processed by an AI system. The cited authority supports privacy protection and ethical validation of GenAI use, but it does not establish a separate AI-governance course as a universal prerequisite, nor does it specify that every form of validation is identical.
- **Correct relation/direction:** Before and during AI-assisted coding, assess data authorization/privacy, tool suitability, human checking and output validation. Make the gate conditional on the data, tool and institutional rules; keep human interpretation accountable.
- **Evidence:** [UNESCO, Guidance for generative AI in education and research](https://www.unesco.org/en/articles/guidance-generative-ai-education-and-research), “Towards a human-centered approach to the use of generative AI,” especially the paragraphs on data privacy and ethical validation (web lines 89–103). **Global guidance.** Accessed 2026-10-12. The graph’s underlying scholarly sources may support the risks of LLM coding, but the sequence claim here is established only as a governance safeguard, not as a pedagogical prerequisite.

### 3. `area_relationship_reference:d078-soc-secondary-qual-analysis:requires:data-provenance-and-context-review`

- **Claim tested:** Secondary qualitative analysis requires data provenance and context review.
- **Finding:** **(b) Conditional task gate/safeguard.** Supported for analysis that reuses archived or previously collected qualitative data. It is a necessary orientation/appraisal step before interpreting reused material, not a separate course that must universally precede all qualitative analysis.
- **Correct relation/direction:** Before making substantive inferences from secondary qualitative material, review the collection record/documentation, why and how the data were collected, sampling and relevant interaction, project and societal context. The depth of review depends on the dataset and question.
- **Evidence:** [UK Data Service, Getting started with reusing qualitative data](https://ukdataservice.ac.uk/learning-hub/qualitative-data/reusing-qualitative-data/getting-started/), bullets on original-project documentation, collection purpose, sample design and levels of context (web lines 75–79); and [Approaches to reusing qualitative data](https://ukdataservice.ac.uk/learning-hub/qualitative-data/reusing-qualitative-data/approaches-to-reusing-qualitative-data/), which distinguishes reuse by original/new research questions and notes that contextualised raw data enables reanalysis (lines 75–90). **Global methods guidance from UK Data Service/UKRI-ESRC.** Accessed 2026-10-12.

### 4. `area_relationship_reference:d078-soc-ai-survey-question-drafting:requires:cognitive-pretesting-with-intended-respondents`

- **Claim tested:** AI-assisted survey-question drafting requires cognitive pretesting with intended respondents.
- **Finding:** **(b) Conditional task gate/safeguard.** Pretesting before survey fielding is directly supported. It applies to the survey instrument whether questions were drafted by AI or by a person; the AI provenance does not create a unique extra prerequisite.
- **Correct relation/direction:** `survey questionnaire` → **pretest with respondents similar to the intended population** → field the questionnaire. Reword the claim to remove AI-specific necessity and retain AI drafting as the item’s context.
- **Evidence:** [AAPOR, Best Practices for Survey Research](https://aapor.org/standards-and-ethics/best-practices/), “What kinds of testing should I do before fielding a survey?” It says to pretest before fielding, typically using cognitive interviews or another qualitative method, with respondents similar to the target population (web lines 192–194). **Global professional guidance.** Accessed 2026-10-12.
- **Local context:** AAPOR’s page uses examples and institutional language that are not Nigerian-specific. The transferable methodological claim is about testing comprehension with the actual intended respondent group; language, literacy, cultural interpretation and local sampling should be adapted to the Nigerian study population.

### 5. `area_relationship_reference:d078-soc-digital-trace-ethics:requires:digital-trace-collection-or-reuse`

- **Claim tested:** Digital-trace ethics requires digital-trace collection or reuse.
- **Finding:** **(b) Conditional task gate/safeguard, with direction correction.** The current direction is backwards and the phrase implies the activity is a prerequisite to ethics. Ethical assessment is relevant when digital traces are proposed for collection or reuse; it should happen before the activity and continue through the lifecycle. A trace being technically accessible does not itself settle ethical use.
- **Correct relation/direction:** `digital-trace collection or reuse` **requires prior, context-sensitive ethical/privacy review** (including consent/expectations, identifiability, potential harm, permissions and applicable rules). Do not encode `ethics → collection` as a learner prerequisite; express the review as the activity’s conditional gate.
- **Evidence:** [Association of Internet Researchers, Internet Research Ethics 3.0](https://aoir.org/ire30/), states that the guidance addresses big-data research and AI and broadens consideration to the research lifecycle (web lines 77–84); [AAA Code of Ethics (PDF)](https://americananthro.org/wp-content/uploads/ethicscode-2.pdf), III.A.2–4, pp. 1–2, requires attention to privacy, harm and advance consent where applicable. **Global/professional.** Accessed 2026-10-12. These sources establish the need for contextual review, not a blanket consent rule for every public digital trace.

## Economics and Applied Economic Analysis (A02)

### 6. `area_relationship_reference:d078-econ-measurement:requires:economic-indicator-interpretation`

- **Claim tested:** Economic measurement requires economic-indicator interpretation.
- **Finding:** **(c) Explanatory context.** The handoff says the target resolves to the declaring item itself. That self-reference is not a valid typed edge and does not establish a learner prerequisite. Measurement concepts, definitions and accounting rules explain what an indicator represents; interpreting a published indicator is an application of that context.
- **Correct relation/direction:** Do not emit the self-edge. If the graph has a distinct national-accounts/indicator-interpretation item, use `measurement concepts/definitions → indicator interpretation` as explanatory support, without claiming a universal prerequisite. Preserve interpretation limits: definitions, valuation, coverage, base period and source methodology matter.
- **Evidence:** [United Nations Statistics Division, System of National Accounts](https://unstats.un.org/unsd/Nationalaccount/sna.asp), “About the SNA,” describes internationally agreed concepts, definitions, classifications and accounting rules for compiling measures and identifies national accounts as a basis for economic analysis (web lines 8–12). **Global statistical standard.** For Nigeria-specific illustration, [NBS Microdata Catalog, Gross Domestic Product](https://microdata.nigerianstat.gov.ng/index.php/catalog/147/study-description), identifies Nigeria’s GDP series as using production, income and expenditure approaches and provides the official report catalogue (web lines 4–12, 37–61, 113–131). **Nigerian source; indicator context, not sequence proof.** Accessed 2026-10-12.

### 7. `area_relationship_reference:d078-econ-applied-econometrics:requires:statistical-foundations-and-data-appraisal`

- **Claim tested:** Applied econometrics requires statistical foundations and data appraisal.
- **Finding:** **(a) Learner prerequisite/order, narrowed.** Statistical foundations are supported as preceding applied econometrics. The bundle “and data appraisal” is too broad to state as a universal curriculum prerequisite: appraisal is an ongoing, question- and dataset-specific analytic responsibility.
- **Correct relation/direction:** `probability/statistics and relevant regression foundations → applied econometrics`. Treat data appraisal as a task step before choosing/estimating a model for a particular dataset, not as a separate universal course prerequisite. The graph’s original self-resolving target should not remain a self-edge.
- **Evidence:** [University of Pennsylvania Economics, Statistical Learning and Causal Inference for Economics (course syllabus)](https://economics.sas.upenn.edu/system/files/2018-09/Econ224syllabus.pdf), prerequisite section (Econ 103 “Statistics for Economists” or comparable statistics coursework; expects probability/statistics). This is one concrete course design and supports the ordinary teaching order, not a universal admissions rule. **Global/university curriculum example.** Accessed 2026-10-12.

### 8. `area_relationship_reference:d078-econ-causal-evaluation:requires:counterfactual-and-identification-reasoning`

- **Claim tested:** Causal evaluation requires counterfactual and identification reasoning.
- **Finding:** **(b) Conditional task gate/safeguard.** Supported for a causal-effect claim. A causal evaluation must define the relevant counterfactual and defend identification assumptions; if the design cannot support them, the researcher must not force a causal estimate. The source does not establish this as a mandatory learning sequence for every evaluation (e.g. descriptive or process evaluation).
- **Correct relation/direction:** Before interpreting an evaluation estimate causally, specify the counterfactual/estimand and defend the identification strategy and assumptions. If those conditions fail, report descriptive/process findings or revise the design rather than label the result causal.
- **Evidence:** [University of Connecticut Statistics, STAT 4835 Causal Inference](https://statistics.uconn.edu/undergraduate/courses/course/STAT/4835/), describes potential outcomes, randomized trials, graphical models and observational studies and lists prior STAT coursework or instructor consent (web lines 145–153); [University of Washington Economics, ECON 488 A: Causal Inference](https://econ.washington.edu/courses/2026/spring/ECON/488/A), describes methods as inference about counterfactuals and lists prior econometrics (search/opened course catalogue, 2026 offering). **Global course-design evidence.** Accessed 2026-10-12. This supports the technical gate and common order, not a rule that every evaluation must be causal.

### 9. `area_relationship_reference:d078-econ-causal-ml:builds-on:applied-econometrics-and-causal-inference`

- **Claim tested:** Causal machine learning builds on applied econometrics and causal inference.
- **Finding:** **(a) Learner prerequisite/order, advanced route.** Supported for the advanced causal-ML route: the cited course explicitly requires previous empirical causal-inference coursework. This is not a universal formal prerequisite across every introductory causal-ML resource, so sequence it as the advanced path rather than a global rule for all machine learning.
- **Correct relation/direction:** `applied causal inference/econometric methods → advanced causal machine learning`. Keep the edge scoped to causal-effect estimation and methods that assume prior design/identification knowledge; do not imply ordinary predictive ML requires econometrics.
- **Evidence:** [Stanford Graduate School of Business Bulletin, MGTECON 634 Machine Learning and Causal Inference](https://bulletin.stanford.edu/courses/2177851), course description and prerequisite: prior empirical methods for causal inference in observational studies, including IV, fixed effects and regression discontinuity (web lines 17–19). **Global/university curriculum example.** Accessed 2026-10-12.

### 10. `area_relationship_reference:d078-econ-casevo-llm-sim:builds-on:agent-based-economic-modeling`

- **Claim tested:** The CASEVO LLM simulation builds on agent-based economic modelling.
- **Finding:** **(a) Learner prerequisite/order, source-specific route.** Supported for the CASEVO implementation: the paper says it is built on Mesa, an agent-based modelling framework, and the repository documents the model/agent/scheduling structure that its LLM layer extends. This supports learning basic ABM/Mesa structure before the CASEVO implementation. It does not show that every LLM simulation must use ABM or that ABM is an academic prerequisite for all multi-agent LLM systems.
- **Correct relation/direction:** For the named CASEVO path, `agent-based model concepts and model/agent scheduling → CASEVO’s LLM-enabled simulation implementation`. Keep the edge specific to CASEVO or an ABM-based implementation.
- **Evidence:** [Jiang et al., Casevo: A Cognitive Agents and Social Evolution Simulator](https://arxiv.org/abs/2412.19498), abstract and Introduction: describes the LLM simulation framework and explicitly says CASEVO is built upon Mesa (web lines 0–14); [CASEVO project repository](https://github.com/rgCASS/casevo), background and ModelBase sections describe Mesa model/agent structure and the LLM interface integration (web lines 230–234, 496–505, 703–725). **Primary paper and implementation documentation; global/source-specific.** Accessed 2026-10-12.

## Disposition for this checkpoint

The evidence supports retaining the claims only with the classifications and scope above. Treat the Sociology links as conditional gates/annotations, not course prerequisites. Correct the digital-trace direction. For Economics, remove the measurement self-edge, narrow statistical foundations to the learner-order component, express causal identification as a gate on causal claims, and scope the two `builds_on` links to advanced causal-ML and CASEVO/ABM routes respectively. This checkpoint does not itself approve student visibility or modify the graph.
