# D003 Artificial Intelligence and Machine Learning — Enrichment Checkpoint

- Initial checkpoint: 2026-10-12 19:31:43 UTC.
- Progress checkpoint: 2026-10-12 19:42 UTC (Africa/Lagos: 20:42; exact minute; UTC timestamp recorded in JSON).
- Scope: domain-owned enrichment only.
- Status: five item records below have been source-checked against official task/framework and learning pages. They are domain-level candidates; `agent_verified` means their recorded claims and URLs were checked, not that each detailed execution task is universal to every practitioner. No student promotion is implied.
- Local verification: `not_started`; student visibility: `false`.

## Inventory and controlling-document baseline

The initial checkpoint’s “not yet read” statements are superseded. The workspace is available; the three controlling documents were read in full, and the following D003 files were inspected:

- `docs/manual-review/DOMAIN_FIRST_ENRICHMENT_SCALING_PLAN_2026_10_12.md`
- `docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_SPEC_2026_10_07.md`
- `docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_IMPLEMENTATION_PLAN_2026_10_08.md`

Inspected inventory/provenance: `data/career-mapping/domain_meta.json`, `domain_structure.json`, `domain_tools.json`, `domain_skill_competency_certification_audit.json`, and `domain_skill_provenance.json`. D003’s existing tool/skill arrays include role-aggregated and generic/software-category signals; these were treated as discovery leads, not proof of domain ownership. The existing five-role count and excluded legacy subgroup were not used to adjudicate downstream records; legacy subgroups remain outside scope. The audit marks D003’s skills/competencies coverage thin and its provenance confidence medium. No existing item was silently promoted based on those aggregates.

## Source-checked batch: five domain-level candidates

The first two initial leads are consolidated into this batch rather than counted twice. Existing tools such as pandas, NumPy, scikit-learn, TensorFlow and PyTorch remain inventory references only; this batch does not approve a tool or claim that a specific tool is mandatory. All five records remain student-hidden. “Versatile foundation” below means a concept/task family useful for understanding work across the domain; it does not claim that every practitioner personally performs every lifecycle task.

### D003-001 — Frame AI use, context, risk and impact (versatile foundation: candidate)

- What it is / domain meaning: determine what an AI system is meant to do, in which setting, for whom, under what assumptions, and what intended or harmful effects should be considered. In AI/ML this connects the model to its real use, not merely its algorithm.
- Task/output: document use purpose, assumptions, context and requirements; identify relevant risks/impacts and the people or systems affected; produce a bounded use/context and risk record.
- Breadth rationale: NIST describes context and objectives as design tasks and risk management across the lifecycle. Treat lifecycle and impact literacy as versatile; assign formal governance or legal accountability only where a person’s remit supports it.
- Relationships: informs data selection and evaluation; complements human-factors and fairness checks. A formal risk framework is a structured alternative to an organization-specific process, not a substitute for legal review or subject-matter input.
- Limits: a framework or risk record does not prove a model is safe, fair, lawful, accurate, or suitable; NIST AI RMF is voluntary and not a mandatory ordered checklist.
- Scope/maturity: global; established framework/practice. Nigerian context is handled separately through the 2025 National AI Strategy and is not a prerequisite for global relevance.
- Sources checked 2026-10-12: NIST, *AI RMF Core*, sections 5–5.4, https://airc.nist.gov/airmf-resources/airmf/5-sec-core/ (functions and voluntary/non-checklist limit); NIST, *Appendix A: Descriptions of AI Actor Tasks*, lines 60–62 and 78–80, https://airc.nist.gov/airmf-resources/airmf/appendices/app-a-descriptions-of-ai-actor-tasks/ (context/objectives and impact/governance tasks); UNESCO, *Recommendation on the Ethics of Artificial Intelligence*, paragraphs 71–73 and 129–131, https://www.unesco.org/en/legal-affairs/recommendation-ethics-artificial-intelligence?hub=1063 (data protection, oversight and monitoring policy context; not universal individual job-task evidence).
- Learning destination checked: Google ML Crash Course, *Fairness*, https://developers.google.com/machine-learning/crash-course/fairness (free, model/data bias audit and mitigation; not a complete AI governance or legal-compliance course). This is a relevant learning route, not proof of competence.
- Disposition: `agent_verified` for the bounded claim above; domain-wide foundation candidate, student visibility `false`; local verification `not_started`.

### D003-002 — Prepare and document data for an AI/ML task (versatile foundation: candidate)

- What it is / domain meaning: select and prepare data so that it represents the problem being studied and can be used to train and evaluate a model. “Data preparation” includes checking what records and labels mean, handling unreliable or missing values, transforming fields, and making fair train/validation/test splits.
- Task/output: gather or integrate task-relevant data, inspect its characteristics, clean/transform it, record dataset metadata, and produce documented splits or a prepared dataset.
- Breadth rationale: NIST includes gathering/cleaning and dataset documentation in design tasks; Google’s task-focused course teaches data quality, labels, missing values, splits and overfitting. Treat understanding data quality as versatile; particular data engineering work depends on the project and role.
- Relationships: precedes or supports model training and evaluation; complements data governance/privacy and domain expertise. Data collection, licensed reuse, or synthetic-data generation may be alternatives or complements depending on the data problem; none is automatically interchangeable.
- Limits: clean data does not guarantee representative data, unbiased outputs, causal validity, or real-world performance. Imputation or filtering choices can change results and must be documented.
- Scope/maturity: global; established. No Nigerian source is needed to establish this global technical practice; national data/privacy context remains a separate overlay.
- Sources checked 2026-10-12: NIST Appendix A lines 60–62, https://airc.nist.gov/airmf-resources/airmf/appendices/app-a-descriptions-of-ai-actor-tasks/; Google for Developers, *Datasets, Generalization, and Overfitting*, learning objectives/prerequisites lines 89–107 and content lines 124–133, https://developers.google.com/machine-learning/crash-course/overfitting (specific data-quality, labels, missing values, splitting, overfitting learning claims; current page states its prerequisites and was updated 2025-12-03).
- Learning destination checked: the same Google module (free, directly task-specific to ML dataset preparation; foundational ML and data-topic prerequisites are stated on page). No paid route was necessary to fill this initial record.
- Disposition: `agent_verified` for the bounded task claim; versatile foundation candidate; student visibility `false`; local verification `not_started`.

### D003-003 — Select, train and interpret machine-learning models (versatile foundation: candidate)

- What it is / domain meaning: use data and an algorithm to build a model that learns patterns for a defined task, then interpret what its predictions and evaluation results mean in that task’s context.
- Task/output: choose or create a model, calibrate/tune and train it, test its behavior, and deliver a model artifact plus documented assumptions/results.
- Breadth rationale: NIST explicitly identifies model creation, selection, calibration, training, testing and interpretation as AI development tasks; Google’s MLCC teaches regression, classification, neural networks and LLM foundations. The concept is central across AI/ML, while building a particular architecture is not a universal task for every AI practitioner.
- Relationships: depends on a framed task and prepared data; feeds evaluation/validation; complements statistics, software implementation and domain expertise. A pretrained model/API can be an alternative to training from scratch where the use case permits, but is not equivalent evidence of model-building skill.
- Limits: training a model does not establish that it generalizes, is appropriate, fair, safe, explainable, or ready for deployment. Model metrics are conditional on data, task and evaluation design.
- Scope/maturity: global; established practice. Specific architectures and model families change over time.
- Sources checked 2026-10-12: NIST Appendix A lines 63–64, https://airc.nist.gov/airmf-resources/airmf/appendices/app-a-descriptions-of-ai-actor-tasks/; Google for Developers, ML Crash Course model modules and learning descriptions, https://developers.google.com/machine-learning/crash-course/ (regression/classification, data, neural networks, embeddings and LLM introduction; source does not claim every learner must master each model family).
- Learning destination checked: Google ML Crash Course, including *Classification* and model modules, free videos/interactive visualizations/exercises; course overview states modules and expected prerequisite concepts: https://developers.google.com/machine-learning/crash-course/ .
- Disposition: `agent_verified` for the bounded task claim; versatile foundation candidate; student visibility `false`; local verification `not_started`.

### D003-004 — Test, evaluate and validate model/system behavior (versatile foundation: candidate)

- What it is / domain meaning: check whether a model and the larger AI system behave as expected for the intended task, data and users. Testing asks what happens on chosen cases; evaluation summarizes performance and failure patterns; validation checks suitability against requirements and context.
- Task/output: define checks; test assumptions/data/model/system; calculate task-appropriate metrics; investigate errors and subgroup effects; document limits and whether evidence supports the intended use.
- Breadth rationale: NIST places TEVV across the lifecycle, from assumption/data checks to model assessment, system integration and operational monitoring. Basic evaluation literacy is versatile; independent formal verification/validation is not assumed to be every practitioner’s job.
- Relationships: uses a separate, appropriate evaluation set and criteria; complements fairness, security and human-factors assessment. Independent verification can complement development-team testing; it is not always a replacement for continuous monitoring.
- Limits: passing a benchmark or achieving a high aggregate score cannot prove safety, fairness, robustness, causal validity, or performance under every population/context. Google’s fairness course specifically narrows to bias audit; it does not replace all TEVV.
- Scope/maturity: global; established. Validation criteria depend on use and risk.
- Sources checked 2026-10-12: NIST Appendix A lines 69–74, https://airc.nist.gov/airmf-resources/airmf/appendices/app-a-descriptions-of-ai-actor-tasks/; Google ML Crash Course *Classification*, https://developers.google.com/machine-learning/crash-course/classification (thresholds, confusion matrix, accuracy/precision/recall/AUC); Google *Fairness*, https://developers.google.com/machine-learning/crash-course/fairness (data and prediction bias checks; explicitly bounded to fairness learning).
- Learning destinations checked: the two Google modules above are free, topic-specific learning; classification assumes model/data foundations, and fairness lists prior ML modules on its page. No claim of certification or job qualification.
- Disposition: `agent_verified` for the bounded task claim; versatile foundation candidate; student visibility `false`; local verification `not_started`.

### D003-005 — Deploy, operate and monitor AI/ML systems (useful edge: candidate)

- What it is / domain meaning: put a validated model into a real service or workflow, connect required data/software components, and watch whether the complete system continues to work as conditions change.
- Task/output: pilot and integrate into a target environment; serve predictions (online, batch or embedded); track system/model/data performance; identify drift, incidents or failures; decide when to investigate, recalibrate, retrain or roll back.
- Breadth rationale: NIST and Google both document these tasks, but responsibility is divided among developers, integrators, operators, evaluators and domain experts; many learners may work in research, data or model development without owning production operations. Therefore this is a useful edge rather than a universal hands-on foundation task.
- Relationships: follows model evaluation/validation; depends on suitable software/data infrastructure and defined monitoring criteria; complements MLOps, security, incident response and human oversight. Batch, API and embedded serving are context-specific alternatives, not one required stack.
- Limits: deployment does not guarantee continued performance or safe use. Monitoring detects signals but does not automatically explain causes or decide appropriate remediation; automated retraining can propagate errors if not validated.
- Scope/maturity: global; production deployment/monitoring is established; fully automated ML pipelines are a more mature operational pattern, not a universal requirement.
- Sources checked 2026-10-12: NIST Appendix A lines 65–78, https://airc.nist.gov/airmf-resources/airmf/appendices/app-a-descriptions-of-ai-actor-tasks/ (deployment, operation, impact, human factors and actor variation); Google Cloud, *MLOps: Continuous delivery and automation pipelines in machine learning*, sections “Data science steps for ML” lines 345–359 and “MLOps level 0” lines 360–388, https://docs.cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning?hl=en (workflow outputs, monitoring, decay and maturity levels); Google ML Crash Course, *Production ML Systems*, https://developers.google.com/machine-learning/crash-course/production-ml-systems (system components, deployment testing and monitoring; prerequisites stated on page).
- Learning destinations checked: Google’s free *Production ML Systems* course module (directly on deployment/testing/monitoring) and the Google Cloud technical guide above (production pipeline depth). They are instructional resources, not evidence of personal mastery.
- Disposition: `agent_verified` for the bounded task claim; useful edge candidate; student visibility `false`; local verification `not_started`.

## Explicit exclusions

Do not enrich or adjudicate areas of specialization, roles, role fit, taxonomy, programme mapping, application code, dependency graph, or SQL. Downstream records may be inspected only to understand domain breadth. Do not use legacy subgroups as a work layer or enrichment input. D078 is a frozen methodology benchmark, not an assignment to redo.

## Search and source validation record

- Access date for sources above: 2026-10-12.
- Exact checked claims are recorded per item. NIST AI RMF is identified by NIST as being updated; its 2023 Appendix A is used here as a task taxonomy, not presented as a current legal mandate. Google learning pages are official, free, task-specific learning destinations and state their own scope/prerequisites.
- Batch count: 5 records; 5 marked `agent_verified`; 0 promoted; 0 locally verified; 0 student-visible. These are candidate domain items and require later local substantive verification once the full domain package is complete.
- Search coverage so far: lifecycle task definitions, data preparation, model development, TEVV, fairness, deployment, production monitoring/MLOps. Not exhaustive yet for specialist/emerging methods or Nigerian application context.

## Next step / resume point

Continue with the next disjoint D003 domain-only source batch: generative-AI/foundation-model task sets and evaluation; privacy/security/adversarial robustness; human-AI interaction and governance; AI-assisted/agentic workflows; data/model documentation; and computing/energy/resource constraints. Reconcile each against existing domain-owned inventory before adding. Add a Nigeria overlay from the National AI Strategy only where it supports a bounded local claim. Save after the next 5–8 fully checked items. Do not adjudicate areas or roles.
