# D078 Learning-Path Reconciliation

**Date:** 2026-10-08  
**Domain:** D078 — Social Sciences & Behavioural Research  
**Status:** Local evidence reconciliation only; not student-approved or canonical.

## Purpose

This artifact compares the existing D078 inventory with the 19 D078-specific workflow-gap candidates. It determines which findings add domain-foundation coverage, which belong behind a selected route, and which extend an existing tool or method choice. It does not treat the 19 as a generic template for other domains.

## Result

The inventory contains **30 records** but **29 unique items**. The duplicate record is `d078-computational-social-research`. The workflow audit contributes **19 candidates**: **6 foundation/edge additions**, **6 conditional or route-specific additions**, **4 specialist additions**, and **1 deferred extension**.

The R and Stata candidates are represented as alternatives under the existing quantitative-tool-choice item. AI-assisted and digital-trace research is retained as a conditional extension of the computational/social-research lane, not as a universal foundation item. The remaining candidates are new domain-learning concepts that are not present as equivalent items in the existing inventory.

## Foundation additions

- **sampling_recruitment_and_representativeness** — Select or assess participants, cases or datasets and state what the evidence can represent. (`add_foundation_candidate`)
- **measurement_and_operationalisation** — Turn ideas such as trust or wellbeing into observable measures and explain their limits. (`add_foundation_candidate`)
- **reliability_validity_and_uncertainty** — Check consistency, accuracy, bias and uncertainty before interpreting results. (`add_foundation_candidate`)
- **pilot_and_cognitive_pretesting** — Test whether research questions are understood as intended before fieldwork. (`add_foundation_candidate_with_survey_route`)
- **open_science_preregistration_and_reproducibility** — Record plans, decisions, data dictionaries, code, materials and deviations so work can be inspected and repeated. (`add_foundation_candidate`)
- **reference_and_literature_management** — Collect, organise, trace and cite books, articles, reports and other research sources. (`add_foundation_support`)

## Conditional and specialist routes

- **focus_groups_and_workshops** — Study how people discuss a topic together and how group interaction shapes evidence. (`add_conditional_method`; `conditional_or_route_specific`)
- **discourse_and_conversation_analysis** — Study language, interaction, framing and social practice rather than only topics. (`add_conditional_specialist_method`; `route_specific_specialist`)
- **case_study_and_comparative_case_design** — Set defensible boundaries around a case and compare cases without treating one example as universal. (`add_conditional_method`; `conditional_or_route_specific`)
- **archival_and_historical_research** — Use records and archives as evidence while checking provenance, context and gaps. (`add_conditional_method`; `conditional_or_route_specific`)
- **participatory_and_action_research** — Involve affected communities in framing questions, design, interpretation or action. (`add_conditional_method_with_ethics`; `conditional_or_route_specific`)
- **experiments_quasi_experiments_and_causal_inference** — Distinguish association from causal effect using design, comparison and explicit assumptions. (`add_specialist_route`; `route_specific_specialist`)
- **programme_evaluation_and_theory_of_change** — Assess what changed, for whom, why, under what conditions and at what cost. (`add_conditional_applied_route`; `conditional_or_route_specific`)
- **psychometrics_and_scale_construction** — Develop and assess multi-item measures for behavioural and social constructs. (`add_specialist_route`; `route_specific_specialist`)
- **longitudinal_panel_and_multilevel_data** — Analyse people over time or people nested within schools, households, communities or other groups. (`add_specialist_route`; `route_specific_specialist`)
- **systematic_and_scoping_evidence_synthesis** — Find, screen, assess and combine existing studies rather than collecting new data by default. (`add_conditional_method_pending_focused_review`; `conditional_or_route_specific`)

## Existing-item extensions

- **r_statistical_computing** → `d078-statistical-tool-choice` — R is an alternative quantitative-computing route, not a second universal foundation item.
- **stata_quantitative_social_science_workflow** → `d078-statistical-tool-choice` — Stata is an alternative quantitative-computing route, not a second universal foundation item.
- **ai_assisted_and_digital_trace_research_ethics** → `d078-computational-social-research` — The candidate extends the existing computational/social-research lane but remains deferred until its task, ethics and evidence boundaries are narrower.

## Named tools and computational options

Named tools are displayed only after the learner has chosen a task or route. They are not cumulative domain requirements:
- **Quantitative route:** SPSS, R, Python or jamovi can support numerical analysis; the learner still needs research design, measurement and statistical judgement.
- **Python data workflow:** pandas can clean and reshape tables; statsmodels can fit statistical models; Matplotlib can create charts; Jupyter can keep code, explanation and results together.
- **Qualitative route:** NVivo can organise and code substantial interviews, documents or open-ended responses; manual coding, Taguette, MAXQDA and ATLAS.ti are alternatives where appropriate.
- **Relationship-data route:** NetworkX or Gephi can represent and analyse networks; a graph does not by itself prove causality or social meaning.
- **Simulation route:** Mesa can build agent-based models in Python; Casevo is an emerging specialist option. Simulation results are not automatically evidence of real-world behaviour.
- **Predictive/text route:** scikit-learn is a conditional specialist option when a specific area, evaluation plan and bias/interpretation safeguards are established; it is not a shared foundation tool.

The deep-search checkpoint contributes 10 named options; its source-backed overlap and new route items are retained in the JSON output rather than silently promoted.

## Visibility and implementation gate

Every item remains hidden until its learner meaning, use case, relationship, evidence locator and verified instructional link are checked together. The 19 candidates have source records, but that does not by itself approve them for students. The programme overview and pre-domain-entry gates must still pass before the domain learning path is promoted.

No canonical domain, subgroup, role, API, matcher or SQL file was changed by this reconciliation. Boole is handling the separate D078 area/role resolution.

## Evidence

The source register is copied from `d078_domain_workflow_gap_audit_2026_10_08.json`; each candidate retains the source URL, locator and access date there and in the machine-readable output.
