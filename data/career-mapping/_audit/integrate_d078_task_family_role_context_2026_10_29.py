"""Reconcile D078 task-family-to-role-task context from the reviewed source ledger.

This is a local graph-data generator, not SQL and not student-release approval.
It marks the rebuilt graph projection visible while keeping the separate
student UI release gate closed. Optional task-family focus is non-blocking,
allows multiple selections, and projects only links in the chosen method/design
and area route.
"""
from __future__ import annotations

import gzip
import json
import re
from copy import deepcopy
from collections import Counter, defaultdict
from itertools import combinations
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
GRAPH_PATH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
GRAPH_GZ_PATH = ROOT / "data/career-mapping/_audit/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json.gz"
ROLE_TASK_SET_PATH = ROOT / "data/career-mapping/_audit/d078_area_role_task_sets_2026_10_09.json.gz"
ROLE_ITEM_RECONCILIATION_PATH = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_RECONCILIATION_LOCAL_2026_10_10.json.gz"
ROLE_ITEM_ROUTE_DISPOSITIONS_PATH = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_TASK_ROUTE_DISPOSITIONS_2026_11_03.json"
CROSSWALK_PATH = ROOT / "data/career-mapping/_audit/D078_DOMAIN_AREA_ROUTE_CROSSWALK_2026_10_10.json.gz"
AREA_ENRICHMENT_DIR = ROOT / "data/career-mapping/_audit/d078_area_enrichment_lanes_2026_10_10"
AREA_CATALOG_PATH = ROOT / "data/career-mapping/domain_specialization_catalog.json"
ROLE_LIBRARY_PATH = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
REPORT_PATH = ROOT / "data/career-mapping/_audit/D078_TASK_FAMILY_ROLE_CONTEXT_RECONCILIATION_2026_10_29.json"
SEQUENCE_DISPOSITION_PATH = ROOT / "data/career-mapping/_audit/D078_SEQUENCE_DISPOSITION_2026_10_17.json.gz"
ROUTE_SEQUENCE_WORKFLOW_APPROVALS_PATH = ROOT / "data/career-mapping/_audit/D078_ROUTE_SEQUENCE_WORKFLOW_APPROVALS_2026_11_08.json"

# The Oct-10 area lane uses stable short IDs (SOC-01, ECON-01, etc.) while the
# current route graph uses descriptive task-family IDs. These explicit aliases
# join only the same area/task scope; they do not infer a route from a label.
FAMILY_SOURCE_RECORD_ALIASES: dict[str, list[str]] = {
    "econ-official-statistics-sector-and-policy-analysis": ["ECON-01"],
    "econ-distribution-development-and-welfare": ["ECON-01"],
    "econ-computational-economic-scenarios": ["ECON-03", "SOC-05"],
    "econ-construct-and-analyze-data": ["ECON-01", "ECON-02"],
    "econ-policy-and-program-evaluation": ["ECON-02"],
    "social-anthro-secondary-and-documentary-research": ["SOC-02"],
    "social-anthro-computational-social-inquiry": ["SOC-03"],
    "social-anthro-fieldwork-and-community-evidence": ["SOC-01"],
    "social-anthro-qualitative-and-mixed-analysis": ["SOC-02"],
    "social-anthro-survey-design-and-analysis": ["SOC-06"],
}

# Final, itemized dispositions for the family nodes that are not referenced by
# any method/design route. These are intentionally distinct from graph/UI
# student-release approval. A merge removes a duplicate selectable family;
# area-foundation candidates are held in the area sequence contract; a
# candidate requiring a distinct route stays unapproved until that route and
# its exact item links are materialized and tested.
AREA_TASK_CANDIDATE_DISPOSITIONS: dict[str, dict[str, Any]] = {
    "area-task:d078-econ-forecast-and-scenario-analysis": {
        "approval": "approved_merge",
        "decision": "merge_split_meaning_into_canonical_forecast_and_simulation_routes",
        "targets": ["area-task:econ-03", "area-task:d078-econ-computational-economic-scenarios"],
        "reason": "Forecast/nowcast and simulation scenarios are related but different work. Keep forecasting with ECON-03 and agent-based/computational scenarios with the existing simulation family; do not expose a duplicate umbrella card.",
        "source_ids": ["local:ECON-03", "external:otexts-fpp3", "external:bank-of-england-abm"],
    },
    "area-task:d078-econ-frame-economic-question": {
        "approval": "approved_merge",
        "decision": "merge_question_framing_into_domain_foundation_and_keep_economic_concepts_as_area_foundation",
        "targets": ["domain-item:d078-research-question-design", "area-foundation:d078-economics-economic-concepts-and-indicators"],
        "reason": "Generic question framing is already a shared Social Sciences foundation. Keep the economic subject concepts as the distinct area starting point; explain economic question framing inside the selected task rather than duplicating it as another area-foundation card.",
        "source_ids": ["local:D078-ECON-frame-economic-question", "external:core-econ"],
    },
    "area-task:d078-economics-applied-analysis-core-task-family": {
        "approval": "approved_merge",
        "decision": "merge_into_area_overview",
        "targets": ["D078:economics-applied-analysis"],
        "reason": "The record is a broad area-scope statement; its fallback item templates are explicitly reconciled to existing canonical Economics items, not independent learning items.",
        "source_ids": ["local:D078-economics-applied-analysis:core-task-family"],
    },
    "area-task:d078-politics-governance-public-policy-core-task-family": {
        "approval": "approved_merge",
        "decision": "merge_into_area_overview",
        "targets": ["D078:politics-governance-public-policy"],
        "reason": "The broad scope duplicates the Politics, Governance and Public Policy area overview; the graph already contains distinct method-routed work families.",
        "source_ids": ["local:UNESCO_ISCED", "local:ONET_POLSCI"],
    },
    "area-task:d078-politics-governance-public-policy-responsible-ai-assisted-opinion-survey-workflow": {
        "approval": "approved_merge",
        "decision": "merge_as_optional_extension_of_political_opinion_survey",
        "targets": ["area-task:d078-politics-governance-public-policy-political-survey-opinion"],
        "reason": "AI assistance is a bounded optional extension of the established survey workflow, not a separate research design. Keep human review, disclosure, participant protection and real-sample requirements visible.",
        "source_ids": ["local:AAPOR_RESPONSIBLE_AI_SURVEY_2026", "external:aapor-responsible-ai-survey-2026"],
    },
    "area-task:d078-politics-governance-public-policy-strategic-foresight-and-policy-scenarios": {
        "approval": "approved_routed_optional_family",
        "decision": "exact_scenario_analysis_route_materialized",
        "targets": ["domain-item:d078-scenario-analysis", "area_enrichment_item:d078-a03-method-policy-foresight-scenarios", "role:D078:10:political-scientist", "role:D078:7:economic-policy-officer"],
        "reason": "The optional foresight family is available only from the selected Scenario Analysis method in Politics, Governance and Public Policy. Its area learning item and two same-area role contexts are linked with sources; it is not a prediction, a universal policy task, or a progression blocker.",
        "source_ids": ["local:OECD_FORESIGHT_TOOLKIT", "external:oecd-foresight-toolkit-2025"],
    },
    "area-task:d078-psychology-social-behaviour-core-task-family": {
        "approval": "approved_merge",
        "decision": "merge_into_area_overview",
        "targets": ["D078:psychology-social-behaviour"],
        "reason": "The broad non-clinical area scope belongs in the overview; existing narrower research-task families represent the selectable work. Preserve the explicit exclusion of clinical assessment, counselling, diagnosis, treatment and licensure.",
        "source_ids": ["local:UNESCO_ISCED", "local:APS_SOCIAL_BEHAVIOUR"],
    },
    "area-task:d078-social-anthro-design-bounded-inquiry": {
        "approval": "approved_merge",
        "decision": "merge_bounded_question_framing_into_domain_foundation_and_keep_social_concepts_as_area_foundation",
        "targets": ["domain-item:d078-research-question-design", "area-foundation:d078-sociology-social-anthropology-social-concepts"],
        "reason": "The shared Social Sciences foundation already teaches question framing. Keep the distinct Sociology and Social Anthropology concepts as the area starting point; task-specific question framing is explained in the chosen work context, not duplicated as another area-foundation card.",
        "source_ids": ["local:D078:SOCIAL_ANTHRO:design_bounded_inquiry", "external:openstax-sociology-methods"],
    },
    "area-task:econ-01": {
        "approval": "approved_merge",
        "decision": "merge_into_exact_indicator_data_and_distribution_routes",
        "targets": ["area-task:d078-econ-official-statistics-sector-and-policy-analysis", "area-task:d078-econ-construct-and-analyze-data", "area-task:d078-econ-distribution-development-and-welfare"],
        "reason": "Economic indicator description, data appraisal and distributional interpretation are already represented in specific routed families. Preserve the condition for distributional outcomes and do not duplicate the broad description card.",
        "source_ids": ["local:ECON-01", "external:imf-weo-dataset"],
    },
    "area-task:econ-03": {
        "approval": "approved_routed_optional_family",
        "decision": "quantitative_economics_forecast_route_materialized",
        "targets": ["domain-item:d078-quantitative-approach", "area_enrichment_item:d078-econ-time-series-analysis-and-forecasting", "role:D078:12:economist", "role:D078:4:economic-adviser"],
        "reason": "The optional forecasting family is available on the Quantitative Economics route. It reuses the canonical time-series/forecast learning item and links only to same-area Economist and Economic Adviser contexts where forecasting is relevant; forecasts remain bounded by a stated target, horizon, baseline and uncertainty.",
        "source_ids": ["local:ECON-03", "external:otexts-fpp3", "external:imf-nowcasting-developing-economies"],
    },
    "area-task:econ-04": {
        "approval": "approved_routed_optional_family",
        "decision": "selected_ai_validation_option_gated_economic_measure_route_materialized",
        "targets": ["domain-emerging:d078-emerging-ai-use-validation-and-provenance", "domain-item:d078-quantitative-approach", "domain-item:d078-computational-social-research", "area_enrichment_item:econ-a1", "area_enrichment_item:econ-c2", "role:D078:12:economist"],
        "reason": "This optional Economics extension appears only after the learner selects the domain AI-use validation/provenance option and then selects Quantitative or Computational Social Research. It includes measure construction and validation, links to the Economist context only, and stays skippable; no generated variable is treated as valid by default.",
        "source_ids": ["local:ECON-04", "external:aea-ai-ml-covariates-2026"],
    },
    "area-task:econ-05": {
        "approval": "approved_merge",
        "decision": "merge_as_optional_ai_support_not_a_task_family",
        "targets": ["area_enrichment_item:d078-econ-llm-evidence-synthesis"],
        "reason": "Bounded AI microtasks can support several selected Economics tasks but do not constitute a research design or task family. Keep the capability optional and human-verified; do not expand its support item into every route without a task-specific link.",
        "source_ids": ["local:ECON-05", "external:aea-generative-ai-economics-research"],
    },
    "area-task:soc-01": {
        "approval": "approved_merge",
        "decision": "merge_into_canonical_fieldwork_family",
        "targets": ["area-task:d078-social-anthro-fieldwork-and-community-evidence"],
        "reason": "The task, output and method scope match the already routed bounded fieldwork family; no second family is needed.",
        "source_ids": ["local:SOC-01", "local:ONET_SOCIOLOGISTS", "local:OPENSTAX_SOCIOLOGY_METHODS"],
    },
    "area-task:soc-03": {
        "approval": "approved_merge",
        "decision": "merge_into_canonical_computational_social_inquiry_family",
        "targets": ["area-task:d078-social-anthro-computational-social-inquiry"],
        "reason": "The same Sociology-area task already exists under the descriptive family ID. Preserve its distinct area context and the source limits on platform access, coverage and selection bias.",
        "source_ids": ["local:SOC-03", "external:ukds-computational-social-science"],
    },
    "area-task:soc-04": {
        "approval": "approved_merge",
        "decision": "merge_as_optional_extension_of_qualitative_mixed_analysis",
        "targets": ["area-task:d078-social-anthro-qualitative-and-mixed-analysis", "area_enrichment_item:d078-soc-llm-assisted-coding"],
        "reason": "Keep human-led qualitative coding as the family and expose AI-assisted annotation only as an optional, human-validated extension. Do not duplicate the task family already present in another area under its own context.",
        "source_ids": ["local:SOC-04", "external:ukds-quadra-ai", "external:aapor-responsible-ai-survey-2026"],
    },
    "area-task:soc-06": {
        "approval": "approved_merge",
        "decision": "merge_as_optional_extension_of_social_survey_design",
        "targets": ["area-task:d078-social-anthro-survey-design-and-analysis", "area_enrichment_item:d078-soc-ai-survey-question-drafting"],
        "reason": "AI-assisted drafting/translation belongs within the established survey-design family as an optional branch with expert review and cognitive pretesting; it is not a second survey design.",
        "source_ids": ["local:SOC-06", "external:aapor-best-practices", "external:aapor-responsible-ai-survey-2026"],
    },
}

EXTERNAL_AREA_FAMILY_EVIDENCE: dict[str, list[dict[str, str]]] = {
    "econ-03": [{
        "id": "external:otexts-fpp3-forecast-evaluation",
        "title": "OTexts, Forecasting: Principles and Practice, 3rd edition",
        "url": "https://otexts.com/fpp3/toolbox.html",
        "locator": "Forecast accuracy must be evaluated on data not used to fit the forecast; compare genuine forecasts against an appropriate baseline and disclose the horizon and uncertainty.",
        "source_role": "authoritative_work_sources",
    }, {
        "id": "external:onet-economists-forecast-task",
        "title": "O*NET OnLine, Economists (19-3011.00)",
        "url": "https://www.onetonline.org/link/details/19-3011.00",
        "locator": "Occupation description and task: compile, analyze and report data to explain economic phenomena and forecast market trends using mathematical models and statistical techniques.",
        "source_role": "authoritative_work_sources",
    }],
    "econ-04": [{
        "id": "external:aea-ai-ml-generated-covariates-2026",
        "title": "American Economic Association, Performing Valid Inference with AI/ML-Generated Covariates",
        "url": "https://www.aeaweb.org/articles?id=10.1257%2Fpandp.20261020",
        "locator": "The abstract identifies measurement error in AI/ML-generated variables as a source of biased estimates and invalid inference and discusses validation-based correction; this is a specialist route, not a blanket endorsement of generated measures.",
        "source_role": "authoritative_work_sources",
    }],
    "politics-governance-public-policy-strategic-foresight-and-policy-scenarios": [{
        "id": "external:oecd-foresight-toolkit-2025",
        "title": "OECD, Strategic Foresight Toolkit for Resilient Public Policy",
        "url": "https://www.oecd.org/en/publications/foresight-toolkit-for-resilient-public-policy_bcdd9304-en.html",
        "locator": "Five-step process: challenge assumptions, construct plausible scenarios, stress-test policy strategies and develop actions. The toolkit explicitly distinguishes scenarios from predictions.",
        "source_role": "authoritative_work_sources",
    }, {
        "id": "external:onet-political-scientists-forecast-task",
        "title": "O*NET OnLine, Political Scientists (19-3094.00)",
        "url": "https://www.onetonline.org/link/details/19-3094.00",
        "locator": "Occupational tasks include forecasting political, economic and social trends and evaluating programmes and policies; used as bounded role-context evidence, not a claim that every political scientist performs foresight.",
        "source_role": "authoritative_work_sources",
    }],
    "econ-official-statistics-sector-and-policy-analysis": [{
        "id": "external:imf-weo-dataset",
        "title": "International Monetary Fund, World Economic Outlook database",
        "url": "https://data.imf.org/Datasets/WEO",
        "locator": "Dataset description: national accounts, labour-market, fiscal and other indicators; historical series and projections with coverage/definition caveats.",
        "source_role": "authoritative_work_sources",
    }],
    "econ-distribution-development-and-welfare": [{
        "id": "external:world-bank-poverty-impact-evaluation-handbook",
        "title": "World Bank, Evaluating the Impact of Development Projects on Poverty",
        "url": "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/470591468273625276",
        "locator": "Practitioner handbook on poverty impact evaluation and distributional outcomes; supports bounded development/welfare evidence work, not a universal method mandate.",
        "source_role": "authoritative_work_sources",
    }],
    "econ-computational-economic-scenarios": [{
        "id": "external:bank-of-england-interdisciplinary-macroeconomic-model",
        "title": "Bank of England Working Paper 696, An interdisciplinary model for macroeconomics",
        "url": "https://www.bankofengland.co.uk/working-paper/2017/an-interdisciplinary-model-for-macroeconomics",
        "locator": "Working Paper 696 summary and discussion of agent-based modelling for macroeconomic questions involving complexity, heterogeneity, networks and heuristics; methodological example, not a forecast guarantee.",
        "source_role": "authoritative_work_sources",
    }],
    "econ-construct-and-analyze-data": [{
        "id": "external:imf-weo-dataset",
        "title": "International Monetary Fund, World Economic Outlook database",
        "url": "https://data.imf.org/Datasets/WEO",
        "locator": "Dataset description and FAQ: macroeconomic indicators, definitions, historical/projection data, coverage and revision caveats.",
        "source_role": "authoritative_work_sources",
    }],
    "econ-policy-and-program-evaluation": [{
        "id": "external:uk-magenta-book-annex-a",
        "title": "HM Treasury, Magenta Book Annex A: Analytical methods for use within an evaluation",
        "url": "https://www.gov.uk/government/publications/the-magenta-book/magenta-book-annex-a-analytical-methods-for-use-within-an-evaluation-html",
        "locator": "Annex A sections A1–A5: theory-based, experimental/quasi-experimental, synthesis and generic evaluation methods; method choice depends on evaluation question and design.",
        "source_role": "authoritative_work_sources",
    }],
    "social-anthro-secondary-and-documentary-research": [{
        "id": "external:ukds-qualitative-secondary-data",
        "title": "UK Data Service, Qualitative data and secondary analysis",
        "url": "https://ukdataservice.ac.uk/learning-hub/qualitative-data/",
        "locator": "Sections on reusing qualitative data, oral history and archived material; emphasizes original study context and limits of reuse.",
        "source_role": "authoritative_work_sources",
    }],
    "social-anthro-computational-social-inquiry": [{
        "id": "external:ukds-computational-social-science",
        "title": "UK Data Service, Computational Social Science",
        "url": "https://ukdataservice.ac.uk/learning-hub/computational-social-science/",
        "locator": "Learning hub scope for computational methods applied to social-science questions; data and method fit remain question-specific.",
        "source_role": "authoritative_work_sources",
    }],
    "social-anthro-fieldwork-and-community-evidence": [{
        "id": "external:uk-magenta-qualitative-observation-and-interviews",
        "title": "HM Treasury, Magenta Book Annex A: Qualitative research methods",
        "url": "https://www.gov.uk/government/publications/the-magenta-book/magenta-book-annex-a-analytical-methods-for-use-within-an-evaluation-html",
        "locator": "Sections A5.1 (interviews/focus groups) and A5.5 (qualitative observational studies): depth, context, combination options and limitations.",
        "source_role": "authoritative_work_sources",
    }],
    "social-anthro-qualitative-and-mixed-analysis": [{
        "id": "external:uk-magenta-qualitative-methods",
        "title": "HM Treasury, Quality in Qualitative Evaluation",
        "url": "https://www.gov.uk/government/publications/the-magenta-book/quality-in-qualitative-evaluation-qqe-html",
        "locator": "Methods include interviews, focus groups, observation, discourse/narrative and documentary analysis; quality requires systematic collection, analysis and interpretation.",
        "source_role": "authoritative_work_sources",
    }],
    "social-anthro-survey-design-and-analysis": [{
        "id": "external:ons-questionnaire-development",
        "title": "Office for National Statistics, Question and questionnaire development overview",
        "url": "https://www.ons.gov.uk/census/censustransformationprogramme/questiondevelopment/questionandquestionnairedevelopmentoverviewforcensus2021",
        "locator": "Questionnaire development and testing overview, including selecting sampling approaches according to research aims.",
        "source_role": "authoritative_work_sources",
    }, {
        "id": "external:aapor-best-practices",
        "title": "American Association for Public Opinion Research, Best Practices for Survey Research",
        "url": "https://aapor.org/standards-and-ethics/best-practices/",
        "locator": "Professional guidance for survey design, conduct, reporting, sampling and response-quality considerations.",
        "source_role": "authoritative_work_sources",
    }],
}

WORKFLOW_SEQUENCE_EVIDENCE: dict[str, list[dict[str, str]]] = {
    "direct-area-order:02": [{
        "id": "external:ons-questionnaire-development",
        "title": "Office for National Statistics, Question and questionnaire development overview",
        "url": "https://www.ons.gov.uk/census/censustransformationprogramme/questiondevelopment/questionandquestionnairedevelopmentoverviewforcensus2021",
        "locator": "Questionnaire development and testing; survey sampling is chosen in relation to research aims. Applied here as workflow context when interpreting an existing survey, not as a requirement to have designed it.",
        "source_role": "sequence_evidence",
    }, {
        "id": "external:aapor-best-practices",
        "title": "American Association for Public Opinion Research, Best Practices for Survey Research",
        "url": "https://aapor.org/standards-and-ethics/best-practices/",
        "locator": "Professional survey design, conduct, sampling and reporting guidance; supports reviewing how the survey was designed before interpreting its results.",
        "source_role": "sequence_evidence",
    }],
    "direct-area-order:16": [{
        "id": "external:un-desapopulation-data",
        "title": "United Nations Department of Economic and Social Affairs, Population Division",
        "url": "https://www.un.org/development/desa/pd/",
        "locator": "Population estimates and projections programme; demographic measures and assumptions underpin interpretation of population change. Use only for a route whose selected question concerns demographic change.",
        "source_role": "sequence_evidence",
    }],
    "direct-area-order:18": [{
        "id": "external:uk-magenta-book-method-choice",
        "title": "HM Treasury, Magenta Book Annex A: Analytical methods for use within an evaluation",
        "url": "https://www.gov.uk/government/publications/the-magenta-book/magenta-book-annex-a-analytical-methods-for-use-within-an-evaluation-html",
        "locator": "Method choice is tied to evaluation questions, outcomes and design. Supports framing the question before selecting sampling and measurement; the activities may be taught together.",
        "source_role": "sequence_evidence",
    }],
    "direct-area-order:20": [{
        "id": "external:uk-magenta-book-theory-of-change",
        "title": "HM Treasury, Magenta Book: Central Government guidance on evaluation",
        "url": "https://www.gov.uk/government/publications/the-magenta-book/magenta-book-central-government-guidance-on-evaluation-html",
        "locator": "Chapter 2: understand the theory of change and evaluation questions before selecting the evaluation approach and methods. This order applies only when a theory/logic model is used; it does not apply to every descriptive review.",
        "source_role": "sequence_evidence",
    }],
    "direct-area-order:24": [{
        "id": "external:ukds-data-preparation",
        "title": "UK Data Service, Prepare your data collection for deposit",
        "url": "https://ukdataservice.ac.uk/help/deposit-data/prepare-your-data-for-deposit/",
        "locator": "Data preparation guidance says cleaning, validation, anonymisation and documentation are completed as part of preparing analysis-ready data. Supports a workflow ordering for the selected model task, not a universal prerequisite to learning modelling concepts.",
        "source_role": "sequence_evidence",
    }],
}

# Each entry maps a source-backed role task to only area work contexts that
# substantively overlap. Conditions narrow the inference; an area membership
# edge alone is never used as proof. Family IDs are canonical graph IDs.
ROLE_FAMILY_MAP: dict[str, list[dict[str, str]]] = {
    "criminologist": [
        {"family": "area-task:d078-psychology-social-behaviour-conflict-context-analysis", "why": "The role task concerns social and psychological conditions related to crime and justice and compares evidence about patterns and possible responses; this family concerns conflict dynamics and intervention context.", "condition": "Use only when the learner's question concerns conflict, justice or how a response interacts with social conditions; it does not imply individual guilt assessment or clinical diagnosis."},
        {"family": "area-task:d078-sociology-social-anthropology-interpret-social-evidence", "why": "The role task compares evidence about social conditions and patterns, matching this family's bounded interpretation of social evidence.", "condition": "This is a research-context link, not a claim that every criminologist uses the same method."},
    ],
    "sociologist": [
        {"family": "area-task:d078-sociology-social-anthropology-interpret-social-evidence", "why": "The role task includes gathering or interpreting evidence to explain social patterns, which is the purpose of this family.", "condition": "The evidence and method depend on the specific question."},
    ],
    "business-economics-researcher": [
        {"family": "area-task:d078-econ-construct-and-analyze-data", "why": "The role task investigates economic conditions, organisations, markets or strategy and analyses evidence to explain a business or economic position.", "condition": "Use the specific data type and analytical method appropriate to the question; this does not make econometrics universal to the role."},
    ],
    "media-scientist": [
        {"family": "area-task:d078-sociology-social-anthropology-interpret-social-evidence", "why": "The role task studies media institutions and use and interprets their social significance, fitting the family's interpretation of evidence about social patterns.", "condition": "Digital-trace or computational methods are relevant only when the selected evidence is digital and the route supports them."},
    ],
    "archaeologist": [
        {"family": "area-task:d078-social-anthro-secondary-and-documentary-research", "why": "The role task evaluates material traces, provenance and records to interpret past human activity, matching documentary and existing-evidence work.", "condition": "This link covers records and documentary evidence only; it does not equate archaeological excavation with interview-based community fieldwork."},
    ],
    "economic-policy-officer": [
        {"family": "area-task:d078-econ-policy-and-program-evaluation", "why": "The role task examines policy options and monitors evidence on economic outcomes, matching evaluation of an intervention and its outcomes.", "condition": "Apply only when the work evaluates an intervention or policy outcome; policy advice alone is not an impact evaluation."},
        {"family": "area-task:d078-politics-governance-public-policy-monitoring-evaluation", "why": "The role task includes monitoring evidence about policy design or implementation, which fits monitoring and evaluation of public interventions.", "condition": "The route explains evidence work, not authority to set or implement policy."},
        {"family": "area-task:d078-politics-governance-public-policy-policy-evidence-brief", "why": "The role task includes contributing evidence-based analysis or recommendations to policy decisions.", "condition": "A brief is one possible output, not a requirement of every role assignment."},
        {"family": "area-task:d078-politics-governance-public-policy-strategic-foresight-and-policy-scenarios", "why": "The role task examines economic policy options and supports policy design; foresight can help compare how a strategy performs under different plausible conditions.", "condition": "Only when a policy decision has a meaningful future horizon or uncertainty to stress-test; this is not a prediction or a routine duty of every policy officer."},
    ],
    "social-work-researcher": [
        {"family": "area-task:d078-social-research-evaluation-design-social-study", "why": "The role task designs or manages research on social issues or social-service practice, directly matching study design for a social question.", "condition": "The design and permissions depend on the population, service setting and question."},
        {"family": "area-task:d078-social-research-evaluation-programme-evaluation", "why": "The role task reports evidence for service or policy learning, and this family covers evaluation of programmes and their implementation or outcomes.", "condition": "Apply when the work evaluates a programme; not every social-work research project is an evaluation."},
    ],
    "behavioural-scientist": [
        {"family": "area-task:d078-psychology-social-behaviour-behavioural-research-design", "why": "The role task formulates questions about behaviour in social settings and selects observation or measurement methods, matching this research-design family.", "condition": "Measures and design must fit the behaviour, setting, evidence and ethical limits."},
        {"family": "area-task:d078-psychology-social-behaviour-quantitative-behavioural-analysis", "why": "The role task may use measurement and numerical evidence to interpret behaviour.", "condition": "Show this branch only when the selected question and evidence require quantitative analysis; it is not universal."},
        {"family": "area-task:d078-psychology-social-behaviour-qualitative-group-inquiry", "why": "The role task is explicitly contextual and may use observation or interviews to understand behaviour in a social setting.", "condition": "Show this branch when qualitative evidence is selected; it is not an automatic companion to quantitative work."},
    ],
    "political-scientist": [
        {"family": "area-task:d078-politics-governance-public-policy-institution-and-policy-analysis", "why": "The role task studies political systems and institutions and interprets evidence about political processes.", "condition": "Keep the specific institution, jurisdiction and period explicit."},
        {"family": "area-task:d078-politics-governance-public-policy-political-survey-opinion", "why": "The role task may study public opinion or political behaviour, matching survey research on political opinion.", "condition": "Only when survey data or survey design is part of the selected question; public opinion can be studied by other methods too."},
        {"family": "area-task:d078-politics-governance-public-policy-policy-evidence-brief", "why": "The role task communicates findings about political processes, for which a bounded evidence brief can be a suitable output.", "condition": "The brief is an optional output format, not a universal occupational requirement."},
        {"family": "area-task:d078-politics-governance-public-policy-strategic-foresight-and-policy-scenarios", "why": "The occupational profile includes forecasting political, economic and social trends and evaluating policies; scenario work can support this by comparing plausible futures without claiming to predict them.", "condition": "Use when the question concerns a future policy environment; distinguish scenarios from forecasts and probabilities."},
    ],
    "economic-adviser": [
        {"family": "area-task:d078-econ-construct-and-analyze-data", "why": "The role task interprets economic conditions and evidence to explain possible implications and options.", "condition": "Choose data and analysis according to the decision question; do not infer causal effects from association alone."},
        {"family": "area-task:d078-econ-distribution-development-and-welfare", "why": "The role task may explain who benefits or bears costs under economic options, matching distributional and welfare analysis.", "condition": "Use when distribution, poverty, labour or development outcomes are relevant to the advice."},
        {"family": "area-task:econ-03", "why": "The role task explicitly explains economic scenarios or options; forecasting can contribute when the decision requires a time-bound estimate and suitable data are available.", "condition": "Optional specialist route only; show the forecast horizon, baseline and uncertainty, and do not treat a scenario as a forecast."},
    ],
    "genealogist": [
        {"family": "area-task:d078-social-anthro-secondary-and-documentary-research", "why": "The role task traces family relationships and life events across records and evaluates conflicting sources, directly matching documentary evidence analysis.", "condition": "This does not imply that every genealogical task is population-level demographic analysis."},
        {"family": "area-task:d078-human-geography-population-population-change", "why": "Birth, death and migration records can support analysis of population change when the genealogical question is explicitly demographic.", "condition": "Conditional: show only for a population-change question using suitable records; tracing an individual family alone does not establish a population trend."},
    ],
    "thanatology-researcher": [
        {"family": "area-task:d078-psychology-social-behaviour-qualitative-group-inquiry", "why": "The role task investigates social or psychological experiences and practices around death and bereavement; interviews, observation or documents may support that inquiry.", "condition": "Use only where qualitative evidence is selected and apply participant-safety and ethics safeguards."},
        {"family": "area-task:d078-sociology-social-anthropology-interpret-social-evidence", "why": "The role task examines social and cultural practices and interprets evidence about them, matching this family's social-evidence interpretation.", "condition": "The family does not imply clinical assessment, counselling or therapy."},
    ],
    "economist": [
        {"family": "area-task:d078-econ-construct-and-analyze-data", "why": "The role task analyses economic or statistical data and explains economic patterns, directly matching economic evidence analysis.", "condition": "Select the method from the question and data; a model or regression is not automatically causal."},
        {"family": "area-task:d078-econ-distribution-development-and-welfare", "why": "The role task may investigate economic issues and policy implications involving distribution, poverty, labour or development outcomes.", "condition": "Show when those outcomes are part of the chosen question, not for every economics task."},
        {"family": "area-task:d078-econ-official-statistics-sector-and-policy-analysis", "why": "The role task may analyse economic statistics and indicators to describe conditions or trends.", "condition": "Use when the selected task relies on national accounts, labour or public-finance statistics; other data sources may be appropriate."},
        {"family": "area-task:econ-03", "why": "The occupational profile includes analysing data to explain economic phenomena and forecast market trends; this family teaches a bounded forecast workflow with a baseline and evaluation.", "condition": "Forecast only when the target, horizon and data support it; compare with a simple baseline and report uncertainty, revisions and limitations."},
        {"family": "area-task:econ-04", "why": "Economic data analysis may use a generated measure when the construct cannot be measured directly; this extension teaches validation and measurement-error checks before inference.", "condition": "Use only when a generated measure is justified and target-relevant validation data are available; otherwise prefer an established measure, human coding or omit it."},
    ],
    "economic-development-coordinator": [
        {"family": "area-task:d078-econ-distribution-development-and-welfare", "why": "The role task coordinates economic-development initiatives and analyses local conditions, matching distribution and development outcomes.", "condition": "The family does not imply that every initiative uses the same development indicator or causal model."},
        {"family": "area-task:d078-econ-policy-and-program-evaluation", "why": "The role task tracks implementation and outcomes of development initiatives, which can involve intervention evaluation.", "condition": "Use when evaluation is part of the assignment; tracking activity alone is not impact evaluation."},
        {"family": "area-task:d078-politics-governance-public-policy-citizen-participation-process", "why": "The role task convenes partners, and some development work uses decision-linked participation with affected communities.", "condition": "Conditional: show only when the work includes a genuine participation process; partner coordination alone is not citizen participation research."},
        {"family": "area-task:d078-politics-governance-public-policy-monitoring-evaluation", "why": "The role task tracks implementation or outcomes, matching monitoring and evaluation work.", "condition": "The selected assignment determines whether monitoring, outcome evaluation or neither is appropriate."},
    ],
    "statistician": [
        {"family": "area-task:d078-social-research-evaluation-design-social-study", "why": "The role task plans or applies statistical methods to collect, organise, analyse and interpret numerical data; this family includes planning evidence and methods for a social study.", "condition": "Statistics support a study design; they do not replace the substantive question, sampling plan or interpretation."},
        {"family": "area-task:d078-computational-digital-social-science-reproducible-social-data", "why": "The role task organises and analyses numerical data and explains uncertainty; a documented, reproducible workflow is relevant when the work is computational.", "condition": "Conditional: use when the task uses a computational workflow; not every statistical task requires programming."},
    ],
    "anthropologist": [
        {"family": "area-task:d078-social-anthro-fieldwork-and-community-evidence", "why": "The role task studies human life, culture and social organisation using contextual evidence and field methods.", "condition": "Fieldwork must fit the question, community context, permissions and ethical safeguards."},
        {"family": "area-task:d078-social-anthro-qualitative-and-mixed-analysis", "why": "The role task uses comparative interpretation of contextual evidence, including qualitative or mixed evidence where appropriate.", "condition": "Mixed methods appear only when the selected design explicitly integrates more than one method."},
        {"family": "area-task:d078-social-anthro-secondary-and-documentary-research", "why": "The role task explicitly includes documentary methods and contextual evidence, matching analysis of existing records and documents.", "condition": "Use documentary evidence when it can answer the question; it does not replace field evidence in every study."},
    ],
    "tax-policy-analyst": [
        {"family": "area-task:d078-econ-official-statistics-sector-and-policy-analysis", "why": "The role task analyses fiscal data and revenue implications, which can rely on public-finance statistics.", "condition": "Use official statistics only when their definitions, coverage and period fit the question."},
        {"family": "area-task:d078-econ-policy-and-program-evaluation", "why": "The role task analyses tax-policy proposals and their distributional or administrative implications, which can involve evaluation of policy alternatives.", "condition": "A proposal analysis is not automatically an evaluation of an implemented policy's causal effect."},
        {"family": "area-task:d078-politics-governance-public-policy-regulatory-impact-assessment", "why": "The role task analyses tax rules and policy proposals against revenue, distributional and administrative implications, fitting analysis of regulatory alternatives.", "condition": "Use the impact-assessment route only when the task assesses a proposed or existing regulation against feasible alternatives."},
        {"family": "area-task:d078-politics-governance-public-policy-policy-evidence-brief", "why": "The role task explains fiscal and administrative implications for decisions; a bounded evidence brief can communicate those findings.", "condition": "A brief is a possible communication output, not a tax-policy qualification."},
    ],
    "geographer": [
        {"family": "area-task:d078-human-geography-population-spatial-patterns", "why": "The role task interprets information about places and spatial patterns, directly matching this family.", "condition": "Spatial data and map choices must fit the scale and question; a map does not prove causation."},
    ],
    "demographer": [
        {"family": "area-task:d078-human-geography-population-population-change", "why": "The role task describes and analyses population size, composition and change using births, deaths and migration, directly matching this family.", "condition": "State assumptions, source coverage and uncertainty for estimates or projections."},
        {"family": "area-task:d078-human-geography-population-spatial-patterns", "why": "Population analysis may examine how people or population characteristics vary across places.", "condition": "Conditional: show when the selected task has an explicit geographic comparison or spatial pattern; not all demographic analyses are spatial."},
    ],
}


def load_json_or_gzip(path: Path) -> dict[str, Any]:
    if path.exists() and path.suffix != ".gz":
        return json.loads(path.read_text(encoding="utf-8-sig"))
    compressed_path = path if path.suffix == ".gz" else path.with_suffix(path.suffix + ".gz")
    with gzip.open(compressed_path, "rt", encoding="utf-8-sig") as stream:
        return json.load(stream)


def walk_dicts(value: Any):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from walk_dicts(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_dicts(child)


def refs_from_records(records: list[dict[str, Any]], source_role: str) -> list[dict[str, str]]:
    refs: list[dict[str, str]] = []
    for row in records:
        if not isinstance(row, dict):
            continue
        url = row.get("url")
        sid = row.get("source_id") or row.get("id")
        if not url and not sid:
            continue
        refs.append({
            "id": str(sid or f"external:{url}"),
            "title": str(row.get("title") or row.get("publisher") or sid or "Source"),
            "url": str(url or ""),
            "locator": str(row.get("locator") or row.get("exact_locator") or row.get("supports") or "Source record in the D078 research ledger."),
            "source_role": source_role,
        })
    return refs


def source_refs(task: dict[str, Any]) -> list[dict[str, str]]:
    result: list[dict[str, str]] = []
    for field in ("authoritative_work_sources", "explanatory_sources", "free_task_specific_learning_resources"):
        for row in task.get(field, []):
            url = row.get("url")
            sid = row.get("source_id")
            if url:
                result.append({
                    "id": str(sid or f"external:{url}"),
                    "title": str(row.get("title") or row.get("source_id") or "Source"),
                    "url": str(url),
                    "locator": str(row.get("locator") or "Source record in D078 task-set research ledger."),
                    "source_role": field,
                })
    unique: dict[tuple[str, str], dict[str, str]] = {}
    for row in result:
        unique[(row["id"], row["url"])] = row
    return list(unique.values())


def area_family_source_refs(family: dict[str, Any], source_registry: dict[str, Any]) -> list[dict[str, str]]:
    """Resolve the family's actual evidence records, including linked artifacts."""
    refs: list[dict[str, str]] = []
    for source_id in family.get("authoritative_work_source_ids", []):
        refs.append({"id": str(source_id), "title": str(source_id), "url": "", "locator": "Source ID recorded on the canonical area-task node.", "source_role": "authoritative_work_source_ids"})
    for source_id in family.get("explanatory_source_ids", []):
        refs.append({"id": str(source_id), "title": str(source_id), "url": "", "locator": "Source ID recorded on the canonical area-task node.", "source_role": "explanatory_source_ids"})
    records = [entry.get("record", {}) for entry in family.get("source_records", []) if isinstance(entry, dict)]
    registries = [source_registry]
    for artifact in family.get("source_artifacts", []):
        try:
            document = load_json_or_gzip(ROOT / str(artifact))
        except (FileNotFoundError, OSError, json.JSONDecodeError):
            continue
        if isinstance(document.get("source_registry"), dict):
            registries.append(document["source_registry"])
        target_ids = {str(family.get("task_family_id", "")), str(family.get("source_task_id", ""))}
        for candidate in walk_dicts(document):
            candidate_id = str(candidate.get("task_id") or candidate.get("task_family_id") or "")
            if candidate_id in target_ids:
                records.append(candidate)
    for record in records:
        for key in ("evidence", "authoritative_work_sources", "explanatory_sources", "learning_links", "free_task_specific_learning_resources", "sources"):
            values = record.get(key, [])
            if isinstance(values, list):
                refs.extend(refs_from_records(values, key))
        for key, source_role in (("authoritative_source_ids", "authoritative_work_sources"), ("authoritative_work_source_ids", "authoritative_work_sources"), ("explanatory_source_ids", "explanatory_sources")):
            for source_id in record.get(key, []):
                source = next((registry.get(str(source_id)) for registry in registries if registry.get(str(source_id))), {})
                if source:
                    refs.append({
                        "id": str(source_id),
                        "title": str(source.get("title") or source_id),
                        "url": str(source.get("url") or ""),
                        "locator": str(source.get("locator") or source.get("supports") or "Source entry in the linked D078 task-family artifact."),
                        "source_role": source_role,
                    })
        # Fallback task artifacts retain evidence at candidate-item level. These
        # citations support the named learning topic, not a universal requirement.
        candidate_items = record.get("candidate_items", [])
        if not isinstance(candidate_items, list):
            candidate_items = []
        for item in candidate_items:
            if not isinstance(item, dict):
                continue
            for key in ("evidence_source_ids", "explanatory_source_ids", "free_task_specific_learning_resource_ids"):
                for source_id in item.get(key, []):
                    source = source_registry.get(str(source_id), {})
                    refs.append({
                        "id": str(source_id),
                        "title": str(source.get("title") or source_id),
                        "url": str(source.get("url") or ""),
                        "locator": str(source.get("locator") or "Candidate-item source identifier in the area task artifact; not a universal prerequisite claim."),
                        "source_role": "candidate_item_evidence_not_task_requirement",
                    })
    unique: dict[tuple[str, str], dict[str, str]] = {}
    for ref in refs:
        unique[(ref["id"], ref["url"])] = ref
    return list(unique.values())


def _normalise_family_key(value: Any) -> str:
    text = str(value or "").strip().casefold().replace("_", "-")
    prefixes = ("area-task:", "area-task-", "d078:", "d078-")
    changed = True
    while changed:
        changed = False
        for prefix in prefixes:
            if text.startswith(prefix):
                text = text[len(prefix):]
                changed = True
                break
    return "-".join(part for part in text.replace(":", "-").split("-") if part)


def _normalise_item_key(value: Any) -> str:
    text = str(value or "").strip().casefold().replace("_", "-")
    prefixes = ("area-enrichment-item:", "area-item:", "area-learning-item:", "domain-item:", "d078:", "d078-")
    changed = True
    while changed:
        changed = False
        for prefix in prefixes:
            if text.startswith(prefix):
                text = text[len(prefix):]
                changed = True
                break
    return "-".join(part for part in text.replace(":", "-").split("-") if part)


# The local area ledgers sometimes use shorthand item IDs that have a reviewed
# canonical graph equivalent. Keep this mapping narrow and auditable; it is not
# fuzzy name matching. ECON-M2 is the existing time-series/forecasting item.
AREA_ITEM_SOURCE_ALIASES: dict[str, list[str]] = {
    "ECON-M2": ["area_enrichment_item:d078-econ-time-series-analysis-and-forecasting"],
}

# Exact, source-backed links for task families whose internal contract names
# the learning concepts but predates the normalized item IDs. These are not
# fuzzy title matches: each row points to an existing, independently reviewed
# canonical item and to the exact learning-item relationship in the task-set
# source. Keep the item optional and the relationship non-blocking.
AREA_TASK_ITEM_LINK_ADDENDA: tuple[dict[str, Any], ...] = (
    {
        "family_id": "area-task:d078-sociology-social-anthropology-qualitative-interview",
        "item_id": "area_enrichment_item:d078-soc-interview-focusgroup",
        "relationship_labels": ("semi-structured qualitative interviewing", "write an interview guide, ask open questions and make fieldnotes"),
        "condition": "Show for the selected interview task when the learner is planning or conducting interviews; it is optional and can be skipped without blocking the route.",
        "explanation": "The selected task is specifically to plan and conduct qualitative interviews. This reviewed item explains interview preparation and facilitation; it does not turn interviews into a requirement for other Sociology routes.",
        "source_task_id": "D078:sociology-social-anthropology:qualitative-interview",
    },
    {
        "family_id": "area-task:d078-sociology-social-anthropology-interpret-social-evidence",
        "item_id": "area_enrichment_item:d078-soc-thematic-analysis",
        "relationship_labels": ("qualitative evidence interpretation and comparison", "code, compare cases and keep an audit trail"),
        "condition": "Show when the selected task compares interview, observation or documentary accounts; choose this analysis approach only when it fits the evidence and question.",
        "explanation": "The selected task asks the learner to compare qualitative accounts and keep an auditable interpretation. The item supports coding and comparison; it does not imply that every qualitative route must use one coding framework or software.",
        "source_task_id": "D078:sociology-social-anthropology:interpret-social-evidence",
    },
    {
        "family_id": "area-task:d078-sociology-social-anthropology-interpret-social-evidence",
        "item_id": "area_enrichment_item:soc-c2",
        "relationship_labels": ("qualitative evidence interpretation and comparison", "code, compare cases and keep an audit trail"),
        "condition": "Show as a useful, skippable interpretation-quality option when the learner is comparing qualitative accounts and documenting how conclusions were reached.",
        "explanation": "This item helps the learner record how evidence supports an interpretation, consider a different explanation and keep an audit trail. It complements the analysis task but is not a prerequisite or a replacement for relevant evidence.",
        "source_task_id": "D078:sociology-social-anthropology:interpret-social-evidence",
    },
)

# Route-family decisions for method→area cases where the graph had routed a
# broad overview family (or a superseded duplicate) as if it were a selectable
# task. These are exact method/area dispositions, not fuzzy label matching.
# A family with no unique source-supported area addition is removed from the
# selectable route; the selected method's domain learning and the area's role
# paths remain available.
METHOD_AREA_TASK_FAMILY_RECONCILIATIONS: tuple[dict[str, Any], ...] = (
    {
        "area_id": "D078:sociology-social-anthropology",
        "method_ids": ["domain-item:participatory-and-action-research"],
        "remove": "area-task:d078-sociology-social-anthropology-core-task-family",
        "add": None,
        "decision": "remove_broad_area_overview_duplicate_keep_fieldwork_family",
        "reason": "The route already offers the source-supported fieldwork and community-evidence family. The broad area-scope node is not a separate selectable task.",
        "condition": "Keep the fieldwork family only as an optional route when the learner's project involves contextual or community evidence; participation itself does not require every fieldwork technique.",
        "source_references": [{
            "id": "internal:D078_AREA_TASK_CANDIDATE_DISPOSITIONS_2026_10_31#soc-01",
            "title": "D078 area-task candidate disposition: merge SOC-01 into canonical fieldwork",
            "url": "",
            "locator": "SOC-01 is merged into area-task:d078-social-anthro-fieldwork-and-community-evidence; it must not remain as a second general task card.",
            "source_role": "area_task_route_evidence",
        }],
    },
    {
        "area_id": "D078:sociology-social-anthropology",
        "method_ids": ["domain-method:network-analysis", "domain-method:social-network-analysis"],
        "remove": "area-task:d078-sociology-social-anthropology-core-task-family",
        "add": "area-task:d078-social-anthro-computational-social-inquiry",
        "decision": "network_methods_route_to_computational_social_inquiry",
        "reason": "The selected network method routes to the canonical Sociology computational-social-inquiry family, not the broad area overview. Its digital-trace, network-analysis and quantitative-text items remain optional and task-scoped.",
        "condition": "Offer this optional task family when the learner is examining relationships among people, groups or organisations. Programming and digital-trace tools are choices within relevant tasks, not prerequisites for every network question.",
        "source_references": [{
            "id": "internal:D078_AREA_TASK_CANDIDATE_DISPOSITIONS_2026_10_31#soc-03",
            "title": "D078 area-task candidate disposition: merge SOC-03 into computational social inquiry",
            "url": "",
            "locator": "SOC-03 is merged into the canonical Sociology computational-social-inquiry task family; platform access, representativeness and language-coverage limits remain explicit.",
            "source_role": "area_task_route_evidence",
        }],
    },
    {
        "area_id": "D078:human-geography-population",
        "method_ids": [
            "domain-item:d078-observation-ethnography",
            "domain-item:focus-groups-and-workshops",
            "domain-item:participatory-and-action-research",
        ],
        "remove": "area-task:d078-human-geography-population-core-task-family",
        "add": "area-task:d078-human-geography-population-spatial-patterns",
        "decision": "place_based_methods_offer_spatial_patterns_task",
        "condition": "Offer this optional family only when the Human Geography question concerns place, location, spatial experience or mapped evidence. Choosing observation, focus groups or participatory research alone does not require mapping or geographic software.",
        "reason": "These methods can support the spatial-patterns task when the question concerns place, spatial experience or community-mapped locations. The family is an optional, conditional task choice—not an automatic consequence of choosing the method.",
        "source_references_by_method": {
            "domain-item:d078-observation-ethnography": [{
                "id": "external:wiserd-klic-local-knowledge-spatial-practice",
                "title": "WISERD, Local Knowledge, Spatial Practice and Urban Patrol",
                "url": "https://wiserd.ac.uk/project/klic-local-knowledge-spatial-practice-and-urban-patrol/",
                "locator": "The project combines ethnographic fieldwork and participant observation with GPS/mapping to study place and spatial practice. It supports this route only when observation concerns a place-based question.",
                "source_role": "method_area_task_evidence",
            }],
            "domain-item:focus-groups-and-workshops": [{
                "id": "external:usfs-focus-groups-ppgis-spatial-data",
                "title": "Forest Service Research, Integrating focus groups with public participation GIS",
                "url": "https://research.fs.usda.gov/treesearch/48340",
                "locator": "The study integrates focus-group discussion and participatory mapping to collect qualitative spatial information about important places. It supports the spatial-pattern task only when participants are discussing or mapping place-related evidence.",
                "source_role": "method_area_task_evidence",
            }],
            "domain-item:participatory-and-action-research": [{
                "id": "external:jcu-qual-gis-participatory-mapping-interviews-2025",
                "title": "James Cook University ResearchOnline, Mapping migrants’ narratives: a qual-GIS approach",
                "url": "https://researchonline.jcu.edu.au/84144/",
                "locator": "The 2025 study combines interviews and participatory mapping to interpret migrants’ spatial experiences. It supports an optional spatial-pattern task when the learner's question concerns place; it does not make GIS compulsory for all participatory research.",
                "source_role": "method_area_task_evidence",
            }, {
                "id": "external:usfs-focus-groups-ppgis-spatial-data",
                "title": "Forest Service Research, Integrating focus groups with public participation GIS",
                "url": "https://research.fs.usda.gov/treesearch/48340",
                "locator": "The study integrates participatory mapping in a focus-group format to collect qualitative spatial data about important places; supports a place-bounded task route, not universal GIS use.",
                "source_role": "method_area_task_evidence",
            }],
        },
    },
    {
        "area_id": "D078:economics-applied-analysis",
        "method_ids": [
            "domain-item:d078-quantitative-approach",
            "domain-item:d078-survey-method",
            "domain-item:longitudinal-panel-and-multilevel-data",
        ],
        "remove": "area-task:d078-economics-applied-analysis-social-economic-data-analysis",
        "add": "area-task:d078-econ-construct-and-analyze-data",
        "decision": "economic_data_analysis_route_uses_canonical_construct_analyze_family",
        "reason": "The older route family duplicates the approved canonical Economics data-construction and analysis family, whose owned items cover econometric analysis, R/Python workflow and reproducibility.",
        "condition": "Offer this optional family when the selected Economics question uses suitable economic or social data. A survey, quantitative or longitudinal method does not by itself require every analysis technique in the family.",
        "source_references": [{
            "id": "internal:d078_area_role_task_sets_2026_10_09#ECON-01/ECON-02",
            "title": "D078 local Economics task-set and canonical item reconciliation",
            "url": "",
            "locator": "The local task set distinguishes descriptive measurement, data appraisal and econometric inference; the canonical construct-and-analyze-data family carries the reviewed learning links.",
            "source_role": "area_task_route_evidence",
        }],
    },
    {
        "area_id": "D078:economics-applied-analysis",
        "method_ids": [
            "domain-item:case-study-and-comparative-case-design",
            "domain-item:d078-mixed-methods",
            "domain-item:experiments-quasi-experiments-and-causal-inference",
            "domain-item:programme-evaluation-and-theory-of-change",
            "domain-item:systematic-and-scoping-evidence-synthesis",
        ],
        "remove": "area-task:d078-economics-applied-analysis-policy-evaluation",
        "add": "area-task:d078-econ-policy-and-program-evaluation",
        "decision": "economic_policy_evaluation_route_uses_canonical_evaluation_family",
        "reason": "This exact intervention/evaluation route is represented by the canonical Economics policy-and-program-evaluation family and its approved evaluation, causal-ML and evidence-synthesis choices. It does not imply every case study or mixed-methods project is an impact evaluation.",
        "condition": "Offer this optional family only when the selected question evaluates a policy, programme or intervention, or when an evidence synthesis is being used to inform that evaluation. Do not infer causal impact from a case study, mixed methods or review alone.",
        "source_references": [{
            "id": "internal:D078_AREA_TASK_CANDIDATE_DISPOSITIONS_2026_10_31#econ-02",
            "title": "D078 area-task candidate disposition: canonical Economics evaluation family",
            "url": "",
            "locator": "ECON-02 is the reviewed source family for policy/program evaluation; causal effects are not inferred from descriptive or qualitative evidence alone.",
            "source_role": "area_task_route_evidence",
        }],
    },
    {
        "area_id": "D078:social-research-evaluation",
        "method_ids": ["domain-item:discourse-and-conversation-analysis"],
        "remove": "area-task:d078-social-research-evaluation-core-task-family",
        "add": "area-task:d078-social-research-evaluation-design-social-study",
        "decision": "discourse_analysis_routes_to_document_and_qualitative_study_design",
        "reason": "The selected method is a document/interaction analysis approach. The canonical social-study design family includes document-method choice, qualitative coding and evidence/ethics context; the broad area overview is not a separate task.",
        "condition": "Offer this as an optional area design focus when discourse analysis is being applied to a bounded social question; choose only the document, interaction, coding and ethics learning relevant to the evidence being analysed.",
        "source_references": [{
            "id": "internal:d078_area_role_task_sets_2026_10_09#social-research-evaluation-design-social-study",
            "title": "D078 Social Research and Evaluation task-set",
            "url": "",
            "locator": "The canonical design-social-study family explicitly offers field/document method choice and qualitative coding options for a bounded social question.",
            "source_role": "area_task_route_evidence",
        }],
    },
)


def apply_method_area_task_family_reconciliations(graph: dict[str, Any]) -> dict[str, Any]:
    """Apply exact reviewed method/area family dispositions before route projection.

    This moves routes off broad or superseded task-family nodes and onto the
    canonical, already-approved family whose item edges are source-backed. It
    does not create learning items, prerequisites, or order claims.
    """
    nodes = {str(node.get("id")): node for node in graph.get("nodes", [])}
    edges = graph.setdefault("edges", [])
    routes = graph.setdefault("method_area_routes", [])
    route_contexts: list[tuple[str, dict[str, Any], set[str]]] = []
    component_containers: list[dict[str, Any]] = []
    for route in routes:
        route_contexts.append((
            str(route.get("route_node_id") or ""), route,
            {str(route.get("method_id"))} if route.get("method_id") else set(),
        ))
    for design in graph.get("combination_designs", []):
        # Named combinations have their own area-route containers in addition
        # to the component-variant containers below. Reconcile their exact
        # per-method contributions too; otherwise a merged broad family can
        # survive only on a combined route and leak into the student path.
        design_method_ids = {str(value) for value in design.get("method_ids", [])}
        for route in design.get("area_routes", []):
            component_containers.append(route)
            route_id = str(route.get("route_node_id") or route.get("id") or "")
            route_contexts.append((route_id, route, design_method_ids))
            for contribution in route.get("method_contributions", []):
                if isinstance(contribution, dict):
                    contribution["_reconciliation_area_id"] = route.get("area_id")
                    route_contexts.append((
                        route_id, contribution,
                        {str(contribution.get("method_id"))} if contribution.get("method_id") else set(),
                    ))
        for variant in design.get("component_route_variants", []):
            for route in variant.get("area_routes", []):
                component_containers.append(route)
                route_contexts.append((
                    str(route.get("id") or route.get("route_node_id") or ""), route,
                    {str(value) for value in (
                        list(variant.get("active_method_ids") or [])
                        + list(route.get("active_method_ids") or route.get("method_ids") or [])
                    )},
                ))
                for contribution in route.get("method_contributions", []):
                    if isinstance(contribution, dict):
                        contribution["_reconciliation_area_id"] = route.get("area_id")
                        route_contexts.append((
                            str(route.get("id") or route.get("route_node_id") or ""),
                            contribution,
                            {str(contribution.get("method_id"))} if contribution.get("method_id") else set(),
                        ))
    for route_node in graph.get("nodes", []):
        if route_node.get("kind") != "combination_component_area_route":
            continue
        route_id = str(route_node.get("id") or "")
        component_containers.append(route_node)
        active_methods = {str(value) for value in route_node.get("method_ids", [])}
        route_contexts.append((route_id, route_node, active_methods))
        for contribution in route_node.get("method_contributions", []):
            if isinstance(contribution, dict):
                contribution["_reconciliation_area_id"] = route_node.get("area_id")
                route_contexts.append((
                    route_id, contribution,
                    {str(contribution.get("method_id"))} if contribution.get("method_id") else set(),
                ))
    results: list[dict[str, Any]] = []
    prior_decisions = {
        (row.get("area_id"), tuple(row.get("method_ids", [])), row.get("removed_family_id")): row
        for row in graph.get("method_area_task_family_reconciliation", {}).get("decisions", [])
    }

    for decision in METHOD_AREA_TASK_FAMILY_RECONCILIATIONS:
        area_id = str(decision["area_id"])
        method_ids = set(decision["method_ids"])
        old_family = str(decision["remove"])
        new_family_value = decision.get("add")
        new_family = str(new_family_value) if new_family_value else None
        matching_contexts = [
            (route_id, route, active_methods) for route_id, route, active_methods in route_contexts
            if (route.get("area_id") or route.get("_reconciliation_area_id")) == area_id
            and active_methods.intersection(method_ids)
            and (old_family in route.get("task_family_ids", [])
                 or (new_family and new_family in route.get("task_family_ids", [])))
        ]
        if not matching_contexts:
            prior = prior_decisions.get((area_id, tuple(sorted(method_ids)), old_family))
            if prior:
                results.append({**prior, "status": "already_applied"})
                continue
            raise SystemExit(
                f"Reviewed method/area family disposition matched no route: "
                f"{sorted(method_ids)} -> {area_id} / {old_family}"
            )
        if new_family:
            target = nodes.get(new_family)
            approved_item_edges = [
                edge for edge in edges
                if edge.get("source") == new_family
                and edge.get("relationship") == "task_has_area_learning_item"
                and edge.get("status") == "resolved_ready_for_use"
                and edge.get("student_visible") is True
            ]
            if (
                not target or target.get("area_id") != area_id
                or target.get("approval") != "approved"
                or target.get("student_selectable") is False
                or not approved_item_edges
            ):
                raise SystemExit(
                    f"Reconciliation target is not a selectable same-area family "
                    f"with approved items: {new_family}"
                )

        route_ids: set[str] = set()
        matched_route_methods: dict[str, set[str]] = {}
        for route_id, route, active_methods in matching_contexts:
            if route_id:
                route_ids.add(route_id)
                matched_route_methods[route_id] = active_methods
            family_ids = [str(value) for value in route.get("task_family_ids", []) if str(value) != old_family]
            if new_family and new_family not in family_ids:
                family_ids.append(new_family)
            route["task_family_ids"] = family_ids
            if "area_learning_paths" in route:
                route["area_learning_paths"] = [
                    row for row in route.get("area_learning_paths", [])
                    if row.get("task_family_id") != old_family
                ]
            route["selected_domain_item_edges"] = [
                row for row in route.get("selected_domain_item_edges", [])
                if row.get("task_family_id") != old_family
            ]
            if new_family and "area_learning_paths" in route and not any(row.get("task_family_id") == new_family for row in route["area_learning_paths"]):
                target = nodes[new_family]
                route["area_learning_paths"].append({
                    "task_family_id": new_family,
                    "label": target.get("label"),
                    "description": target.get("description") or target.get("meaning"),
                    "selection_role": target.get("task_family_selection_role"),
                    "source_references": target.get("source_references", []),
                })
            route_node = nodes.get(route_id)
            if route_node and "task_family_ids" in route_node:
                route_node["task_family_ids"] = list(family_ids)

        # A participatory component route is a container of method-specific
        # contributions. Keep the container's route projection synchronized
        # with those revised contributions; the downstream builder reads both.
        for route_node in component_containers:
            contributions = [row for row in route_node.get("method_contributions", []) if isinstance(row, dict)]
            route_node["task_family_ids"] = sorted({
                str(family_id) for row in contributions for family_id in row.get("task_family_ids", [])
            })
            route_node["area_item_ids"] = sorted({
                str(edge.get("target")) for edge in edges
                if edge.get("source") in route_node["task_family_ids"]
                and edge.get("relationship") == "task_has_area_learning_item"
                and edge.get("status") == "resolved_ready_for_use"
                and edge.get("student_visible") is True
            })

        changed_edge_ids: list[str] = []
        retained_edges: list[dict[str, Any]] = []
        for edge in edges:
            if (
                edge.get("source") in route_ids
                and edge.get("target") == old_family
                and edge.get("relationship") in {
                    "method_applies_to_area_task", "method_contribution_applies_to_area_task",
                }
            ):
                if not new_family:
                    changed_edge_ids.append(str(edge.get("id", "")))
                    continue
                edge["target"] = new_family
                edge["id"] = f"{edge.get('relationship')}:{edge.get('source')}->{new_family}"
                edge["explanation"] = str(decision["reason"])
                edge["condition"] = str(decision.get("condition") or (
                    "This is an optional, route-specific area focus; select it only when the stated task context fits."
                ))
                refs_by_method = decision.get("source_references_by_method", {})
                matched_methods = sorted(matched_route_methods.get(str(edge.get("source")), set()) & method_ids)
                source_refs = [
                    ref for method_id in matched_methods for ref in refs_by_method.get(method_id, [])
                ] or decision.get("source_references", [])
                source_refs = list({str(ref.get("id")): ref for ref in source_refs if ref.get("id")}.values())
                if source_refs:
                    edge["source_references"] = source_refs
                    edge["evidence_source_ids"] = [ref["id"] for ref in source_refs if ref.get("id")]
                    edge["evidence_basis"] = "reviewed_exact_method_area_task_reconciliation"
                changed_edge_ids.append(str(edge.get("id", "")))
            elif (
                edge.get("relationship") == "domain_item_supports_area_task"
                and edge.get("target") == old_family
                and edge.get("source") in method_ids
            ):
                if not new_family:
                    changed_edge_ids.append(str(edge.get("id", "")))
                    continue
                edge["target"] = new_family
                edge["id"] = f"domain_item_supports_area_task:{edge.get('source')}->{new_family}"
                edge["explanation"] = str(decision["reason"])
                edge["condition"] = str(decision.get("condition") or (
                    "This is an optional route-specific area focus; select it only when the task context fits."
                ))
                method_id = str(edge.get("source"))
                source_refs = decision.get("source_references_by_method", {}).get(method_id) or decision.get("source_references", [])
                if source_refs:
                    existing_refs = edge.get("source_references", [])
                    by_id = {str(ref.get("id")): ref for ref in existing_refs if ref.get("id")}
                    by_id.update({str(ref.get("id")): ref for ref in source_refs if ref.get("id")})
                    edge["source_references"] = list(by_id.values())
                    existing_source_ids = set(edge.get("evidence_source_ids", []))
                    edge["evidence_source_ids"] = sorted(existing_source_ids | {
                        str(ref["id"]) for ref in source_refs if ref.get("id")
                    })
                changed_edge_ids.append(str(edge.get("id", "")))
            retained_edges.append(edge)
        # Routes that already named both the legacy and canonical family can
        # converge on the same method→family edge after the merge.
        deduplicated: list[dict[str, Any]] = []
        seen_edge_ids: set[str] = set()
        for edge in retained_edges:
            edge_id = str(edge.get("id", ""))
            if edge_id and edge_id in seen_edge_ids:
                continue
            if edge_id:
                seen_edge_ids.add(edge_id)
            deduplicated.append(edge)
        edges[:] = deduplicated

        results.append({
            "area_id": area_id,
            "method_ids": sorted(method_ids),
            "removed_family_id": old_family,
            "canonical_family_id": new_family,
            "decision": decision["decision"],
            "matched_route_count": len(matching_contexts),
            "matched_route_ids": sorted(route_ids),
            "changed_method_edge_ids": changed_edge_ids,
            "source_references": decision.get("source_references", []),
        })

    # An approved family is not automatically a learner-facing choice. Keep
    # approved-but-unrouted families in the graph for audit, but hide and
    # disable selection when no current single, named-combination, component,
    # or route-node context references them after reconciliation.
    referenced_family_ids = {
        str(family_id)
        for _, route, _ in route_contexts
        for family_id in route.get("task_family_ids", [])
    }
    hidden_unrouted_family_ids: list[str] = []
    for node in graph.get("nodes", []):
        node_id = str(node.get("id") or "")
        if node.get("kind") == "area_task_family" and node_id not in referenced_family_ids:
            node["student_visible"] = False
            node["student_selectable"] = False
            node["student_visibility_reason"] = (
                "No current reviewed single-method, named-combination, component, "
                "or route-node context references this family after reconciliation. "
                "The approved source record is retained for audit; it is not offered as a standalone choice."
            )
            hidden_unrouted_family_ids.append(node_id)

    for route in routes:
        for contribution in route.get("method_contributions", []):
            if isinstance(contribution, dict):
                contribution.pop("_reconciliation_area_id", None)
    for design in graph.get("combination_designs", []):
        for variant in design.get("component_route_variants", []):
            for route in variant.get("area_routes", []):
                for contribution in route.get("method_contributions", []):
                    if isinstance(contribution, dict):
                        contribution.pop("_reconciliation_area_id", None)
    for route_node in graph.get("nodes", []):
        for contribution in route_node.get("method_contributions", []):
            if isinstance(contribution, dict):
                contribution.pop("_reconciliation_area_id", None)

    return {
        "date": "2026-11-07",
        "status": "applied_exact_method_area_family_reconciliations",
        "decision_count": len(results),
        "matched_route_count": sum(row["matched_route_count"] for row in results),
        "unrouted_family_count_retained_hidden": len(hidden_unrouted_family_ids),
        "unrouted_family_ids_retained_hidden": sorted(hidden_unrouted_family_ids),
        "new_learning_items_created": 0,
        "prerequisites_or_order_edges_created": 0,
        "decisions": results,
    }


def _resolve_family_reference(reference: Any, area_id: str, families: dict[str, dict[str, Any]]) -> str | None:
    wanted = _normalise_family_key(reference)
    matches = [
        family_id for family_id, family in families.items()
        if family.get("area_id") == area_id
        and wanted in {
            _normalise_family_key(family_id),
            _normalise_family_key(family.get("task_family_id")),
            _normalise_family_key(family.get("source_task_id")),
        }
    ]
    if len(matches) == 1:
        return matches[0]
    # Some historical crosswalk rows use a short family code (for example
    # SOC-05). Suffix matching is permitted only when unique within the area.
    matches = [
        family_id for family_id, family in families.items()
        if family.get("area_id") == area_id
        and (
            _normalise_family_key(family_id).endswith(wanted)
            or wanted.endswith(_normalise_family_key(family.get("task_family_id")))
        )
    ]
    return matches[0] if len(matches) == 1 else None


def synchronize_named_combination_route_contributions(graph: dict[str, Any]) -> dict[str, int]:
    """Refresh materialized named-combination routes from reconciled components.

    Fixed combinations are constructed from the exact single-method route in
    each area. Later family/item reconciliation can update the nested design
    record while leaving its route node, contribution nodes and task edges at
    their pre-reconciliation values. Keep those representations synchronized
    without flattening the method-attributed contributions onto the route
    node.
    """
    nodes = {str(node.get("id")): node for node in graph.get("nodes", [])}
    edges = graph.setdefault("edges", [])
    single_routes = {
        (str(route.get("method_id")), str(route.get("area_id"))): route
        for route in graph.get("method_area_routes", [])
    }
    active_edges_by_route_task: dict[tuple[str, str], dict[str, Any]] = {}
    for edge in edges:
        if (edge.get("relationship") == "method_applies_to_area_task"
                and edge.get("status") == "resolved_ready_for_use"
                and edge.get("student_visible") is True):
            active_edges_by_route_task[(str(edge.get("source")), str(edge.get("target")))] = edge

    refreshed_routes = 0
    refreshed_contributions = 0
    rebuilt_task_edges = 0
    refreshed_items = 0
    for design in graph.get("combination_designs", []):
        if design.get("combination_mode") != "fixed_evidence_combination":
            continue
        for route in design.get("area_routes", []):
            route_node_id = str(route.get("route_node_id") or "")
            route_node = nodes.get(route_node_id)
            if not route_node:
                raise SystemExit(f"Named-combination route node is missing: {route_node_id}")
            contribution_families: set[str] = set()
            contribution_area_items: set[str] = set()
            for contribution in route.get("method_contributions", []):
                method_id = str(contribution.get("method_id") or "")
                source_route = single_routes.get((method_id, str(route.get("area_id"))))
                if not source_route:
                    raise SystemExit(
                        f"Named-combination contribution has no exact single-method area route: "
                        f"{design.get('id')} / {route.get('area_id')} / {method_id}"
                    )

                # These fields are the method's own reviewed route contribution;
                # they are not a union of every independent route in the area.
                for field in (
                    "task_family_ids", "area_item_ids", "task_linked_domain_item_ids",
                    "available_item_ids", "tool_ids", "domain_downstream_item_ids",
                    "domain_tool_ids",
                ):
                    contribution[field] = list(source_route.get(field, []))
                contribution_families.update(str(value) for value in contribution.get("task_family_ids", []))
                contribution_area_items.update(str(value) for value in contribution.get("area_item_ids", []))

                contribution_node_id = f"{route_node_id}:method:{method_id.split(':')[-1]}"
                contribution_node = nodes.get(contribution_node_id)
                if contribution_node:
                    for field in (
                        "method_id", "task_family_ids", "area_item_ids", "task_linked_domain_item_ids",
                        "available_item_ids", "tool_ids", "domain_downstream_item_ids", "domain_tool_ids",
                    ):
                        contribution_node[field] = list(contribution.get(field, [])) if field != "method_id" else method_id
                    contribution_node["student_explanation"] = contribution.get("contribution") or contribution_node.get("student_explanation")
                refreshed_contributions += 1

            # The route is a choice container. Preserve method attribution and
            # prevent a stale aggregate from being mistaken for a third method.
            route["task_family_ids"] = sorted(contribution_families)
            route_node["task_family_ids"] = []
            route_node["method_contributions"] = [dict(row) for row in route.get("method_contributions", [])]
            route_node["area_item_ids"] = []
            route_node["available_item_ids"] = []

            # Materialized area items are the union of the current supported
            # contribution families, not stale pre-reconciliation item arrays.
            linked_items = {
                str(edge.get("target")) for edge in edges
                if edge.get("source") in contribution_families
                and edge.get("relationship") == "task_has_area_learning_item"
                and edge.get("status") == "resolved_ready_for_use"
                and edge.get("student_visible") is True
            }
            route["area_item_ids"] = sorted(linked_items)
            contribution_area_items.update(linked_items)

            # Replace stale contribution->family edges with clones of the exact
            # reviewed method-route edges, retaining their source evidence.
            contribution_node_ids = {
                f"{route_node_id}:method:{str(row.get('method_id') or '').split(':')[-1]}"
                for row in route.get("method_contributions", [])
            }
            edges[:] = [edge for edge in edges if not (
                edge.get("relationship") == "method_contribution_applies_to_area_task"
                and edge.get("source") in contribution_node_ids
            )]
            for contribution in route.get("method_contributions", []):
                method_id = str(contribution.get("method_id") or "")
                source_route = single_routes[(method_id, str(route.get("area_id")))]
                contribution_node_id = f"{route_node_id}:method:{method_id.split(':')[-1]}"
                source_route_node_id = str(source_route.get("route_node_id") or "")
                for family_id in contribution.get("task_family_ids", []):
                    evidence_edge = active_edges_by_route_task.get((source_route_node_id, str(family_id)))
                    if not evidence_edge:
                        raise SystemExit(
                            f"No reviewed method-to-family edge for named-combination contribution: "
                            f"{method_id} / {route.get('area_id')} / {family_id}"
                        )
                    cloned = dict(evidence_edge)
                    cloned.update({
                        "id": f"method_contribution_applies_to_area_task:{contribution_node_id}->{family_id}",
                        "source": contribution_node_id,
                        "target": str(family_id),
                        "relationship": "method_contribution_applies_to_area_task",
                        "derived_from_method_route_edge_id": str(evidence_edge.get("id") or ""),
                    })
                    edges.append(cloned)
                    rebuilt_task_edges += 1
            refreshed_routes += 1
            refreshed_items += len(linked_items)

    return {
        "named_combination_area_routes_refreshed": refreshed_routes,
        "method_contributions_refreshed": refreshed_contributions,
        "source_backed_contribution_task_edges_rebuilt": rebuilt_task_edges,
        "area_items_recomputed_from_current_task_edges": refreshed_items,
    }


def _source_pointer(artifact: str, pointer: str, title: str, role: str) -> dict[str, str]:
    relative = Path(artifact).as_posix()
    return {
        "id": f"internal:{relative}#{pointer}",
        "title": title,
        "url": "",
        "locator": f"{relative}#{pointer}",
        "source_role": role,
    }


def _normalise_label(value: Any) -> str:
    return " ".join(re.sub(r"[^a-z0-9]+", " ", str(value or "").casefold()).split())


def _registry_refs(source_ids: list[Any], registry: dict[str, Any], role: str) -> list[dict[str, str]]:
    if isinstance(registry, list):
        registry = {
            str(row.get("source_id") or row.get("id")): row
            for row in registry if isinstance(row, dict) and (row.get("source_id") or row.get("id"))
        }
    if not isinstance(registry, dict):
        registry = {}
    refs: list[dict[str, str]] = []
    for source_id in source_ids:
        source = registry.get(str(source_id), {})
        refs.append({
            "id": str(source_id),
            "title": str(source.get("title") or source_id),
            "url": str(source.get("url") or ""),
            "locator": str(source.get("locator") or source.get("supports") or "Source identifier recorded in the reviewed D078 contract."),
            "source_role": role,
        })
    return refs


def _document_source_registry(document: dict[str, Any], fallback: dict[str, Any] | None = None) -> dict[str, Any]:
    """Normalize current and legacy source registries from reviewed artifacts."""
    registry = document.get("source_registry")
    if isinstance(registry, dict) and registry:
        return registry
    if isinstance(registry, list):
        normalized = {
            str(row.get("source_id") or row.get("id")): row
            for row in registry
            if isinstance(row, dict) and (row.get("source_id") or row.get("id"))
        }
        if normalized:
            return normalized
    for source_field in ("sources", "source_records"):
        sources = document.get(source_field)
        if not isinstance(sources, list):
            continue
        normalized = {
            str(row.get("id") or row.get("source_id")): row
            for row in sources
            if isinstance(row, dict) and (row.get("id") or row.get("source_id"))
        }
        if normalized:
            return normalized
    return fallback or {}


def _family_source_refs(family: dict[str, Any], task_sets: dict[str, Any]) -> list[dict[str, str]]:
    """Resolve task-family evidence from the source ledger, not graph summaries."""
    wanted = _normalise_family_key(family.get("task_family_id") or family.get("id"))
    wanted_ids = {wanted}
    wanted_ids.update(
        _normalise_family_key(value)
        for value in FAMILY_SOURCE_RECORD_ALIASES.get(wanted, [])
    )
    matched_records: list[tuple[dict[str, Any], str, str, dict[str, Any]]] = []
    for area in task_sets.get("area_task_sets", []):
        if area.get("area_id") != family.get("area_id"):
            continue
        for bucket in ("task_families", "additional_task_families"):
            for record in area.get(bucket, []):
                if _normalise_family_key(record.get("task_id") or record.get("task_family_id")) in wanted_ids:
                    matched_records.append((record, "data/career-mapping/_audit/d078_area_role_task_sets_2026_10_09.json.gz", "$/area_task_sets", task_sets.get("source_registry", {})))
    for artifact_path in sorted(AREA_ENRICHMENT_DIR.glob("*.json.gz")):
        relative = artifact_path.relative_to(ROOT).as_posix()
        try:
            document = load_json_or_gzip(artifact_path)
        except (OSError, json.JSONDecodeError):
            continue
        for record, pointer in walk_dicts_with_pointer(document):
            # The canonical early-area ledger uses `area_task_families[].id`
            # and the family-level `evidence`/`learning` arrays. Later lanes
            # use task_id/task_family_id and route_ownership. Read both forms.
            record_id = (
                record.get("task_id")
                or record.get("task_family_id")
                or (record.get("id") if any(key in record for key in ("task", "items", "learner_output")) else None)
            )
            if _normalise_family_key(record_id) not in wanted_ids:
                continue
            if record.get("area_id") and record.get("area_id") != family.get("area_id"):
                continue
            matched_records.append((record, relative, pointer, _document_source_registry(document, task_sets.get("source_registry", {}))))

    refs: dict[tuple[str, str, str], dict[str, str]] = {}
    for record, artifact, pointer, registry in matched_records:
        refs[_source_pointer(artifact, pointer, "D078 area task-family source record", "area_task_evidence")["id"], "", pointer] = _source_pointer(
            artifact, pointer, "D078 area task-family source record", "area_task_evidence",
        )
        for field, role in (
            ("authoritative_work_source_ids", "authoritative_work_sources"),
            ("evidence_source_ids", "authoritative_work_sources"),
            ("authoritative_source_ids", "authoritative_work_sources"),
            ("explanatory_source_ids", "explanatory_sources"),
            ("evidence", "authoritative_work_sources"),
            ("learning", "explanatory_sources"),
        ):
            raw_ids = record.get(field, [])
            if isinstance(raw_ids, str):
                raw_ids = [raw_ids]
            if isinstance(raw_ids, list):
                raw_ids = [
                    row.get("source_id") or row.get("id") if isinstance(row, dict) else row
                    for row in raw_ids
                ]
            for reference in _registry_refs(raw_ids if isinstance(raw_ids, list) else [], registry, role):
                refs[(reference["id"], reference["url"], reference["locator"])] = reference
        for field, role in (("evidence", "authoritative_work_sources"), ("authoritative_work_sources", "authoritative_work_sources"), ("explanatory_sources", "explanatory_sources")):
            rows = record.get(field, [])
            if isinstance(rows, dict):
                rows = [rows]
            if not isinstance(rows, list):
                continue
            for reference in refs_from_records(rows, role):
                refs[(reference["id"], reference["url"], reference["locator"])] = reference
    for reference in EXTERNAL_AREA_FAMILY_EVIDENCE.get(wanted, []):
        refs[(reference["id"], reference["url"], reference["locator"])] = reference
    if refs:
        return list(refs.values())
    return area_family_source_refs(family, task_sets.get("source_registry", {}))


AREA_TASK_PREPARATION_COPY: dict[str, dict[str, list[str]]] = {
    "D078:sociology-social-anthropology:qualitative-interview": {
        "learning_to_review": ["Bring a focused question and the relevant social concepts into the interview plan."],
        "project_checks": ["Decide which participant group can answer the question.", "Check the ethics review and consent steps required for this project.", "Plan language that participants can understand and answer comfortably."],
    },
    "D078:sociology-social-anthropology:interpret-social-evidence": {
        "learning_to_review": ["Clarify the concept or question you are interpreting and how it relates to the evidence."],
        "project_checks": ["Choose interview, observation or documentary material that was collected or selected responsibly, and note what it cannot represent."],
    },
    "D078:economics-applied-analysis:social-economic-data-analysis": {
        "learning_to_review": ["Refresh the numeracy and data-literacy skills used by the chosen analysis.", "If you choose econometric inference, review the probability and statistics that specific method depends on before interpreting its estimates."],
        "project_checks": ["Define the economic measure, population or units, period and data coverage before interpreting a pattern or relationship."],
    },
    "D078:economics-applied-analysis:policy-evaluation": {
        "learning_to_review": ["Review evidence appraisal and comparison-design concepts that fit the evaluation question."],
        "project_checks": ["Define the intervention, affected population, outcomes and time period, then check which evidence is realistically available before choosing a design."],
    },
    "D078:politics-governance-public-policy:policy-evidence-brief": {
        "learning_to_review": ["Review how to compare evidence, options and uncertainty for a decision."],
        "project_checks": ["State the policy question, relevant time period, jurisdiction and intended audience so the brief answers a specific decision need."],
    },
    "D078:politics-governance-public-policy:political-survey-opinion": {
        "learning_to_review": ["Review how population, construct, question wording and sampling affect what a survey can show."],
        "project_checks": ["Define who the survey is meant to describe and how people can realistically be contacted.", "Check whether ethics review is required for this study."],
    },
    "D078:psychology-social-behaviour:behavioural-research-design": {
        "learning_to_review": ["Define the behaviour or social-psychological concept and the population you want to understand.", "Choose method and statistics depth to fit the selected design; an interview, observation, survey and experiment do not require identical preparation."],
        "project_checks": ["Check whether the measure and study procedures are suitable and ethically appropriate for the people and setting involved."],
    },
    "D078:psychology-social-behaviour:group-identity-and-participation": {
        "learning_to_review": ["Define what group membership or identity means in this study and how the categories were formed."],
        "project_checks": ["Do not assume that everyone assigned to a group shares the same experience, view or behaviour."],
    },
    "D078:human-geography-population:spatial-patterns": {
        "learning_to_review": ["Review how geographic units, coordinate references, scale and map choices affect a spatial comparison."],
        "project_checks": ["Confirm that the evidence has usable location information and that you are allowed to use it for this purpose."],
    },
    "D078:human-geography-population:population-change": {
        "learning_to_review": ["Refresh the rates, ratios and source metadata needed for the chosen comparison; the source record does not assume prior demography or mathematics training."],
        "project_checks": ["Check the population source's coverage, definitions and assumptions before comparing estimates or projections."],
    },
    "D078:social-research-evaluation:design-social-study": {
        "learning_to_review": ["Use the shared research-question and design foundation to connect the question to a population, evidence and feasible method."],
        "project_checks": ["Clarify who will use the findings, who may be affected, what access is available, the time and resources, and which ethics review route applies."],
    },
    "D078:social-research-evaluation:programme-evaluation": {
        "learning_to_review": ["Review evaluation design and evidence-appraisal concepts that fit the intended use; an effect estimate is not needed for every evaluation."],
        "project_checks": ["Identify the programme, stakeholders, purpose and feasible evidence plan before deciding what conclusions the evaluation can support."],
    },
    "D078:computational-digital-social-science:reproducible-social-data": {
        "learning_to_review": ["Refresh basic data literacy and the steps for recording where data came from, how it was prepared and how analysis can be repeated."],
        "project_checks": ["Confirm permission to use the data, define the question and identify personal or sensitive information that needs protection."],
    },
    "D078:computational-digital-social-science:digital-trace-content-analysis": {
        "learning_to_review": ["Define the social construct, platform or population scope, sampling approach and how any coding or model output will be checked against human-reviewed examples."],
        "project_checks": ["Confirm lawful and ethical access to the records and document how platform rules or collection choices limit who or what is represented."],
    },
}


def reconcile_area_task_preparation_context(graph: dict[str, Any], task_sets: dict[str, Any]) -> dict[str, Any]:
    """Attach task-specific preparation notes without inventing learning gates."""
    nodes = {str(node["id"]): node for node in graph.get("nodes", [])}
    area_sets = task_sets.get("area_task_sets", [])
    source_records = {
        str(record.get("task_id") or record.get("task_family_id")): (area, record)
        for area in area_sets
        for record in area.get("additional_task_families", [])
        if record.get("task_id") or record.get("task_family_id")
    }
    if set(source_records) != set(AREA_TASK_PREPARATION_COPY):
        raise SystemExit(
            "Task-preparation copy must cover the exact 14 selectable specialist records: "
            f"missing={sorted(set(source_records) - set(AREA_TASK_PREPARATION_COPY))}, "
            f"stale={sorted(set(AREA_TASK_PREPARATION_COPY) - set(source_records))}"
        )

    applied: list[dict[str, str]] = []
    for source_task_id, copy in AREA_TASK_PREPARATION_COPY.items():
        area_id, record = source_records[source_task_id]
        leaf = source_task_id.rsplit(":", 1)[-1]
        matches = [
            node for node in nodes.values()
            if node.get("kind") == "area_task_family"
            and node.get("area_id") == area_id.get("area_id")
            and str(node.get("id", "")).endswith("-" + leaf)
        ]
        if len(matches) != 1:
            raise SystemExit(f"Task-preparation source must map to one exact graph family: {source_task_id} -> {[n['id'] for n in matches]}")
        family = matches[0]
        if family.get("student_visible") is not True or family.get("student_selectable") is False:
            target_ids = list(family.get("merged_into", []))
            disposition_targets = (family.get("candidate_disposition") or {}).get("targets", [])
            target_ids.extend(disposition_targets if isinstance(disposition_targets, list) else [])
            for decision in graph.get("method_area_task_family_reconciliation", {}).get("decisions", []):
                if decision.get("removed_family_id") == family.get("id") and decision.get("canonical_family_id"):
                    target_ids.append(decision["canonical_family_id"])
            eligible_targets = [
                nodes[target_id] for target_id in dict.fromkeys(target_ids)
                if target_id in nodes
                and nodes[target_id].get("kind") == "area_task_family"
                and nodes[target_id].get("area_id") == area_id.get("area_id")
                and nodes[target_id].get("student_visible") is True
                and nodes[target_id].get("student_selectable") is not False
            ]
            if len(eligible_targets) != 1:
                raise SystemExit(
                    f"Hidden source family needs exactly one reviewed visible canonical target: "
                    f"{source_task_id} -> {family['id']} -> {[node['id'] for node in eligible_targets]}"
                )
            family = eligible_targets[0]
        source_notes = [str(note).strip() for note in record.get("prerequisites", []) if str(note).strip()]
        if not source_notes:
            raise SystemExit(f"Task-preparation context lacks the source notes it is meant to explain: {source_task_id}")
        refs = _family_source_refs(family, task_sets)
        if not refs:
            raise SystemExit(f"Task-preparation context has no source references: {source_task_id}")
        preparation_context = {
            "heading": "Preparation and project checks",
            "summary": "These notes help you prepare for this selected kind of work. Some are learning to review; others are project decisions or safeguards. They are not a course-entry rule and do not block the rest of your route.",
            "learning_to_review": list(copy["learning_to_review"]),
            "project_checks": list(copy["project_checks"]),
            "source_notes": source_notes,
            "source_task_id": source_task_id,
            "source_task_ids": [source_task_id],
            "source_artifact": ROLE_TASK_SET_PATH.relative_to(ROOT).as_posix(),
            "source_references": refs,
            "exact_learning_prerequisite_targets": [],
            "prerequisite_edge_created": False,
            "sequence_edge_created": False,
            "display_when_selected": True,
            "blocking_policy": "never",
            "sequence_policy": "none",
            "interpretation": "task_scoped_preparation_not_a_formal_prerequisite_or_progression_gate",
        }
        applied.append({"source_task_id": source_task_id, "family_id": family["id"]})
        existing_context = family.get("task_preparation_context")
        if isinstance(existing_context, dict):
            for key in ("learning_to_review", "project_checks", "source_notes", "source_references", "source_task_ids"):
                existing_values = list(existing_context.get(key, []))
                new_values = list(preparation_context.get(key, []))
                existing_context[key] = existing_values + [value for value in new_values if value not in existing_values]
            existing_context["source_task_id"] = existing_context["source_task_ids"][0]
            existing_context["contributing_source_record_count"] = len(existing_context["source_task_ids"])
        else:
            preparation_context["contributing_source_record_count"] = 1
            family["task_preparation_context"] = preparation_context

    # Every student-selectable family gets an explicit decision. Where the
    # reviewed source ledgers do not name a learnable prerequisite, record
    # that no exact dependency target was established; do not invent a lesson
    # or show a repetitive empty preparation card to the learner.
    visible_families = [
        node for node in nodes.values()
        if node.get("kind") == "area_task_family"
        and node.get("student_visible") is True
        and node.get("student_selectable") is not False
    ]
    families_without_specific_preparation: list[str] = []
    for family in visible_families:
        if isinstance(family.get("task_preparation_context"), dict):
            continue
        references = _family_source_refs(family, task_sets)
        for edge in graph.get("edges", []):
            if family.get("id") not in {edge.get("source"), edge.get("target")}:
                continue
            references.extend(
                ref for ref in edge.get("source_references", [])
                if isinstance(ref, dict)
            )
        unique_refs = {
            (str(ref.get("id") or ref.get("source_id") or ""), str(ref.get("url") or ""), str(ref.get("locator") or "")): ref
            for ref in references if isinstance(ref, dict)
        }
        if not unique_refs:
            raise SystemExit(f"Selectable task family lacks source evidence for prerequisite disposition: {family['id']}")
        family["task_preparation_context"] = {
            "heading": "Preparation and project checks",
            "summary": "The reviewed route evidence does not identify a specific learning item that must come before this work focus. Open the linked items to see what they teach; any project permissions or safeguards are shown with the relevant task, not treated as lessons to complete.",
            "learning_to_review": [],
            "project_checks": [],
            "source_references": list(unique_refs.values()),
            "exact_learning_prerequisite_targets": [],
            "prerequisite_review_disposition": "no_exact_learning_prerequisite_target_established_in_reviewed_route_evidence",
            "prerequisite_edge_created": False,
            "sequence_edge_created": False,
            "display_when_selected": False,
            "blocking_policy": "never",
            "sequence_policy": "none",
            "evidence_scope_limit": "These references support the task-family route and scope; they are not proof that no preparatory knowledge can ever be useful.",
            "interpretation": "explicit_no_exact_prerequisite_target_without_invented_student_card",
        }
        families_without_specific_preparation.append(str(family["id"]))

    return {
        "source_artifact": ROLE_TASK_SET_PATH.relative_to(ROOT).as_posix(),
        "specialist_task_families_reviewed": len(applied),
        "source_task_records_reviewed": len(applied),
        "task_specific_preparation_contexts_attached": len({row["family_id"] for row in applied}),
        "selectable_task_families_dispositioned": len(visible_families),
        "families_with_no_exact_learning_prerequisite_target": len(families_without_specific_preparation),
        "families_without_specific_preparation_ids": sorted(families_without_specific_preparation),
        "creates_learning_items": False,
        "creates_prerequisite_or_sequence_edges": False,
        "task_context_count": len(visible_families),
        "selectable_specialist_task_records_covered": len(applied) == 14,
        "display_policy": "only after the exact area task family is selected",
        "families": applied,
    }


def _index_area_item_claims(task_sets: dict[str, Any]) -> dict[tuple[str, str], list[dict[str, Any]]]:
    """Index exact family/item membership from task-set and area contracts."""
    claims: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)

    def add_claim(family_ref: Any, item_ref: Any, label: Any, artifact: str, pointer: str,
                  record: dict[str, Any], registry: dict[str, Any] | None = None,
                  source_role: str = "area_item_evidence") -> None:
        family_key = _normalise_family_key(family_ref)
        item_key = _normalise_item_key(item_ref) if item_ref else ""
        locator = _source_pointer(artifact, pointer, "D078 area learning contract", source_role)
        source_ids: list[Any] = []
        inline_source_rows: list[dict[str, Any]] = []
        for field in (
            "evidence_source_ids", "authoritative_work_source_ids", "evidence",
            "evidence_source_refs", "evidence_refs", "authoritative_evidence",
            "explanatory_evidence", "source_references", "free_task_specific_learning_links",
            "free_task_learning_links", "explanation_links",
        ):
            values = record.get(field, [])
            if isinstance(values, (str, dict)):
                values = [values]
            if not isinstance(values, list):
                continue
            for value in values:
                if isinstance(value, dict):
                    source_id = value.get("source_id") or value.get("id")
                    if source_id:
                        source_ids.append(source_id)
                    if value.get("url"):
                        inline_source_rows.append(value)
                elif value:
                    source_ids.append(value)
        resolved_registry = registry or task_sets.get("source_registry", {})
        source_refs = [locator]
        source_refs.extend(_registry_refs(source_ids, resolved_registry, source_role))
        source_refs.extend(refs_from_records(inline_source_rows, source_role))
        unique_source_refs = {
            (row["id"], row["url"], row["locator"]): row
            for row in source_refs
        }
        source_refs = list(unique_source_refs.values())
        if item_key:
            claims[(family_key, item_key)].append({
                "record": record,
                "references": source_refs,
                "source_artifact": artifact,
                "source_pointer": pointer,
                "source_registry": resolved_registry,
            })
        if label:
            label_key = "label:" + _normalise_label(label)
            claims[(family_key, label_key)].append({
                "record": record,
                "references": source_refs,
                "source_artifact": artifact,
                "source_pointer": pointer,
                "source_registry": resolved_registry,
            })

    def add_claim_with_aliases(family_ref: Any, item_ref: Any, label: Any, artifact: str,
                               pointer: str, record: dict[str, Any], registry: dict[str, Any] | None = None) -> None:
        add_claim(family_ref, item_ref, label, artifact, pointer, record, registry)
        for alias in AREA_ITEM_SOURCE_ALIASES.get(str(item_ref or ""), []):
            add_claim(family_ref, alias, label, artifact,
                      f"{pointer} (canonical graph item alias)", record, registry)

    for area_index, area in enumerate(task_sets.get("area_task_sets", [])):
        for bucket in ("task_families", "additional_task_families"):
            for family_index, family in enumerate(area.get(bucket, [])):
                family_ref = family.get("task_id") or family.get("task_family_id")
                if not family_ref:
                    continue
                family_pointer = f"$/area_task_sets/{area_index}/{bucket}/{family_index}"
                for item_index, item in enumerate(family.get("learning_items", [])):
                    if isinstance(item, dict):
                        add_claim_with_aliases(
                            family_ref, item.get("id") or item.get("item_id"), item.get("label"),
                            "data/career-mapping/_audit/d078_area_role_task_sets_2026_10_09.json.gz",
                            f"{family_pointer}/learning_items/{item_index}", item,
                        )
                # The canonical area task-set uses a flat item-id list.
                for item_index, item_ref in enumerate(family.get("items", [])):
                    add_claim_with_aliases(family_ref, item_ref, None,
                              "data/career-mapping/_audit/d078_area_role_task_sets_2026_10_09.json.gz",
                              f"{family_pointer}/items/{item_index}", family,
                              task_sets.get("source_registry", {}))

    for artifact_path in sorted(AREA_ENRICHMENT_DIR.glob("*.json.gz")):
        relative = artifact_path.relative_to(ROOT).as_posix()
        try:
            document = load_json_or_gzip(artifact_path)
        except (OSError, json.JSONDecodeError):
            continue
        local_registry = _document_source_registry(document, task_sets.get("source_registry", {}))
        # Early area contracts declare family ownership as
        # area_task_families[].items; this is exact source-level membership.
        for family_index, family in enumerate(document.get("area_task_families", [])):
            family_ref = family.get("task_id") or family.get("task_family_id") or family.get("id")
            if not family_ref:
                continue
            family_pointer = f"$/area_task_families/{family_index}"
            for item_index, item_ref in enumerate(family.get("items", [])):
                add_claim_with_aliases(family_ref, item_ref, None, relative,
                                       f"{family_pointer}/items/{item_index}", family, local_registry)

        for area_index, area in enumerate(document.get("areas", [])):
            for family_index, family in enumerate(area.get("task_families", [])):
                family_ref = family.get("task_id") or family.get("task_family_id")
                if not family_ref:
                    continue
                family_pointer = f"$/areas/{area_index}/task_families/{family_index}"
                for item_index, item_ref in enumerate(family.get("item_ids", [])):
                    add_claim_with_aliases(family_ref, item_ref, None, relative,
                                           f"{family_pointer}/item_ids/{item_index}", {}, local_registry)
            for item_index, item in enumerate(area.get("area_owned_additions", [])):
                if isinstance(item, dict) and item.get("task_family_id"):
                    add_claim_with_aliases(item["task_family_id"], item.get("id") or item.get("item_id"),
                                           item.get("label") or item.get("title"), relative,
                                           f"$/areas/{area_index}/area_owned_additions/{item_index}", item, local_registry)
        # Earlier enrichment batches store their items inside each task
        # family's candidate_items array rather than in a flat item_ids list.
        for record, family_ref, pointer in _source_item_contexts(document):
            item_ref = record.get("id") or record.get("item_id")
            label = record.get("label") or record.get("item_label") or record.get("name")
            if item_ref or label:
                add_claim_with_aliases(family_ref, item_ref, label, relative, pointer, record, local_registry)
    return claims


def _source_item_contexts(value: Any, pointer: str = "$", inherited_family_id: str = ""):
    """Yield item records with the exact source family and JSON-pointer locator."""
    if isinstance(value, dict):
        current_family_id = inherited_family_id
        ownership = value.get("route_ownership", {})
        family_id = (
            value.get("task_family_id")
            or value.get("internal_task_group_id")
            or (ownership.get("task_family_id") if isinstance(ownership, dict) else None)
        )
        if not family_id and value.get("task_id") and any(
            key in value for key in ("candidate_items", "learning_items", "task_families", "items")
        ):
            family_id = value.get("task_id")
        if family_id:
            current_family_id = str(family_id)
        has_item_identity = any(key in value for key in ("id", "item_id", "label", "item_label", "name"))
        has_item_content = any(key in value for key in (
            "what_it_is", "task_connection", "contextual_use", "plain_meaning", "type", "item_type",
            "relationships", "authoritative_evidence", "evidence_source_ids", "source_references",
            "purpose_and_area_context", "task_and_output", "task_use", "domain_area_meaning",
        ))
        if has_item_identity and has_item_content and current_family_id:
            yield value, current_family_id, pointer
        for key, child in value.items():
            escaped = str(key).replace("~", "~0").replace("/", "~1")
            yield from _source_item_contexts(child, f"{pointer}/{escaped}", current_family_id)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from _source_item_contexts(child, f"{pointer}/{index}", inherited_family_id)


def walk_dicts_with_pointer(value: Any, pointer: str = "$"):
    """Walk dictionaries without losing the exact JSON pointer to each record."""
    if isinstance(value, dict):
        yield value, pointer
        for key, child in value.items():
            escaped = str(key).replace("~", "~0").replace("/", "~1")
            yield from walk_dicts_with_pointer(child, f"{pointer}/{escaped}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from walk_dicts_with_pointer(child, f"{pointer}/{index}")


def _area_item_evidence_refs(
    record: dict[str, Any], artifact: str, pointer: str, family_id: str,
) -> list[dict[str, str]]:
    refs = [{
        "id": f"internal:{Path(artifact).as_posix()}#{pointer}",
        "title": "D078 area learning contract",
        "url": "",
        "locator": f"{Path(artifact).as_posix()}#{pointer}; explicit task-family membership: {family_id}",
        "source_role": "area_item_evidence",
    }]
    for field in (
        "authoritative_evidence", "explanatory_evidence", "learning_links", "free_task_specific_learning_links",
        "source_references", "evidence_refs",
    ):
        values = record.get(field, [])
        if isinstance(values, dict):
            values = [values]
        if not isinstance(values, list):
            continue
        for entry in values:
            if not isinstance(entry, dict):
                continue
            url = str(entry.get("url") or "")
            source_id = str(entry.get("source_id") or entry.get("id") or ("external:" + url if url else ""))
            if not source_id:
                continue
            refs.append({
                "id": source_id,
                "title": str(entry.get("title") or entry.get("publisher") or source_id),
                "url": url,
                "locator": str(entry.get("locator") or entry.get("exact_locator") or "Source recorded on the item contract."),
                "source_role": "area_item_evidence",
            })
    unique = {(row["id"], row["url"], row["locator"]): row for row in refs}
    return list(unique.values())


def reconcile_route_relationship_evidence(
    graph: dict[str, Any],
    task_sets: dict[str, Any],
    crosswalk: dict[str, Any],
) -> dict[str, int]:
    """Resolve graph edges to the exact reviewed D078 route/item source records."""
    nodes = {node["id"]: node for node in graph.get("nodes", [])}
    families = {node_id: node for node_id, node in nodes.items() if node.get("kind") == "area_task_family"}
    item_nodes = {
        node_id: node for node_id, node in nodes.items()
        if node.get("kind") in {"area_enrichment_item", "area_learning_item", "area_tool_option", "area_tool_application_reference"}
    }

    crosswalk_by_item = {
        _normalise_item_key(record.get("domain_item_id")): record
        for record in crosswalk.get("records", [])
    }
    source_item_claims = _index_area_item_claims(task_sets)
    area_source_registry = task_sets.get("source_registry", {})
    domain_source_registry = graph.get("external_source_registry", {})
    family_source_refs_by_id = {
        family_id: _family_source_refs(family, task_sets)
        for family_id, family in families.items()
    }

    counts = {
        "domain_item_area_task_total": 0,
        "domain_item_area_task_evidence_resolved": 0,
        "domain_item_area_task_excluded_without_exact_crosswalk": 0,
        "area_task_item_total": 0,
        "area_task_item_evidence_resolved": 0,
        "area_task_item_excluded_without_exact_source_membership": 0,
    }
    for edge in graph.get("edges", []):
        relation = edge.get("relationship")
        if relation == "domain_item_supports_area_task":
            counts["domain_item_area_task_total"] += 1
            family = families.get(edge.get("target"))
            domain_item = nodes.get(edge.get("source"), {})
            family_id = str(family.get("task_family_id") or "") if family else ""
            record = crosswalk_by_item.get(_normalise_item_key(edge.get("source")))
            match = None
            for area_route in (record or {}).get("area_routes", []):
                if not family or area_route.get("area_id") != family.get("area_id"):
                    continue
                for task_reference in area_route.get("task_family_ids", []):
                    resolved_id = _resolve_family_reference(task_reference, family.get("area_id"), families)
                    if resolved_id == family["id"]:
                        match = (area_route, task_reference)
                        break
                if match:
                    break
            if not match or not family:
                edge.update({
                    "status": "excluded_from_student_route",
                    "student_visible": False,
                    "evidence_basis": "no_exact_reviewed_domain_area_task_crosswalk",
                    "sequence_policy": "none",
                    "blocking_policy": "never",
                })
                counts["domain_item_area_task_excluded_without_exact_crosswalk"] += 1
                continue
            area_route, task_reference = match
            domain_refs = [_source_pointer(
                "data/career-mapping/_audit/D078_DOMAIN_AREA_ROUTE_CROSSWALK_2026_10_10.json.gz",
                f"$/records/{next(i for i, row in enumerate(crosswalk.get('records', [])) if row is record)}/area_routes/{record['area_routes'].index(area_route)}",
                "Reviewed D078 domain-to-area route crosswalk", "domain_area_relationship_evidence",
            )]
            for source in domain_item.get("learning_links", []):
                if not isinstance(source, dict):
                    continue
                url = str(source.get("url") or "")
                domain_refs.append({
                    "id": str(source.get("source_id") or ("external:" + url if url else "domain-item:" + domain_item["id"])),
                    "title": str(source.get("label") or source.get("title") or domain_item.get("label") or "Domain learning source"),
                    "url": url,
                    "locator": str(source.get("locator") or source.get("scope_note") or "Learning link recorded on the reviewed domain-item contract."),
                    "source_role": "domain_item_evidence",
                })
            domain_refs.extend(_registry_refs(
                [row.get("source_id") for row in domain_item.get("evidence", []) if isinstance(row, dict) and row.get("source_id")],
                domain_source_registry, "domain_item_evidence",
            ))
            area_refs = family_source_refs_by_id.get(family["id"], [])
            area_refs = [
                {**reference, "source_role": "area_task_evidence"}
                for reference in area_refs
                if reference.get("source_role") in {
                    "authoritative_work_sources", "authoritative_work_source_ids", "explanatory_sources",
                    "explanatory_source_ids", "evidence", "authoritative_work_sources",
                }
            ]
            if not area_refs:
                edge.update({"status": "excluded_from_student_route", "student_visible": False})
                counts["domain_item_area_task_excluded_without_exact_crosswalk"] += 1
                continue
            condition = str(domain_item.get("route_condition") or area_route.get("route_condition") or "").strip()
            edge.update({
                "evidence_basis": "reviewed_domain_item_area_task_synthesis",
                "evidence_source_ids": sorted({ref["id"] for ref in domain_refs + area_refs}),
                "source_references": domain_refs + area_refs,
                "condition": condition,
                "route_fit": str(area_route.get("fit") or ""),
                "fit_claim_limit": "A non-compulsory connection for the stated task condition; it does not make this item a prerequisite for the area or role, and it does not prove job eligibility.",
                "explanation": f"{domain_item.get('label', 'This domain learning')} can support {family.get('label', 'this area work focus')} where the route fit is {area_route.get('fit') or 'the selected task context'}. {condition}",
                "recommendation_only": True,
                "blocking_policy": "never",
                "sequence_policy": "none",
                "status": "resolved_ready_for_use",
                "student_visible": True,
            })
            counts["domain_item_area_task_evidence_resolved"] += 1
        elif relation == "task_has_area_learning_item":
            counts["area_task_item_total"] += 1
            family = families.get(edge.get("source"))
            item = item_nodes.get(edge.get("target"))
            if not family or not item:
                edge.update({"status": "excluded_from_student_route", "student_visible": False})
                counts["area_task_item_excluded_without_exact_source_membership"] += 1
                continue
            family_key = _normalise_family_key(family.get("task_family_id"))
            item_key = _normalise_item_key(item.get("id"))
            candidates = source_item_claims.get((family_key, item_key), [])
            if not candidates:
                label_key = "label:" + _normalise_label(item.get("label"))
                candidates = source_item_claims.get((family_key, label_key), [])
            # Multiple records are acceptable only if they independently assert
            # the same explicit family/item membership. Combine their locators.
            unique_refs: dict[tuple[str, str], dict[str, str]] = {}
            for candidate in candidates:
                for ref in candidate["references"]:
                    unique_refs[(ref["id"], ref["url"])] = ref
            if not candidates:
                edge.update({
                    "status": "excluded_from_student_route",
                    "student_visible": False,
                    "evidence_basis": "no_unique_exact_source_task_item_membership",
                    "sequence_policy": "none",
                    "blocking_policy": "never",
                })
                counts["area_task_item_excluded_without_exact_source_membership"] += 1
                continue
            item_refs = list(unique_refs.values())
            family_refs = [
                {**reference, "source_role": "area_task_evidence"}
                for reference in family_source_refs_by_id.get(family["id"], [])
                if reference.get("url") or reference.get("locator")
            ]
            if not item_refs or not family_refs:
                edge.update({"status": "excluded_from_student_route", "student_visible": False})
                counts["area_task_item_excluded_without_exact_source_membership"] += 1
                continue
            task_connection = str(item.get("task_connection") or item.get("task_use") or item.get("contextual_use") or "").strip()
            edge.update({
                "evidence_basis": "reviewed_area_task_item_synthesis",
                "evidence_source_ids": sorted({ref["id"] for ref in item_refs + family_refs}),
                "source_references": item_refs + family_refs,
                "condition": task_connection or "Use this learning item when the selected task-family question and output call for it; the item retains its own useful or conditional lane.",
                "fit_claim_limit": "This source links the learning item to the named area work context; it does not establish a universal prerequisite or make optional learning compulsory.",
                "explanation": task_connection or f"The source contract places this area learning option under {family.get('label', 'the selected work context')}. Whether it is useful depends on your question and output.",
                "recommendation_only": True,
                "blocking_policy": "never",
                "sequence_policy": "none",
                "status": "resolved_ready_for_use",
                "student_visible": True,
            })
            counts["area_task_item_evidence_resolved"] += 1
    return counts


def _as_records(value: Any) -> list[Any]:
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def _first_contract_value(record: dict[str, Any], *keys: str) -> Any:
    for key in keys:
        value = record.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
        if isinstance(value, (dict, list)) and value:
            return value
    return None


def _contract_source_refs(record: dict[str, Any], registry: dict[str, Any], fields: tuple[str, ...], role: str) -> list[dict[str, str]]:
    rows: list[dict[str, Any]] = []
    source_ids: list[Any] = []
    for field in fields:
        for value in _as_records(record.get(field)):
            if isinstance(value, dict):
                source_id = value.get("source_id") or value.get("id")
                if source_id:
                    source_ids.append(source_id)
                if value.get("url"):
                    rows.append(value)
            elif value:
                source_ids.append(value)
    refs = refs_from_records(rows, role)
    refs.extend(_registry_refs(source_ids, registry, role))
    unique = {(ref["id"], ref["url"], ref["locator"]): ref for ref in refs}
    return list(unique.values())


def _best_area_item_claim(candidates: list[dict[str, Any]]) -> dict[str, Any] | None:
    if not candidates:
        return None

    def score(candidate: dict[str, Any]) -> tuple[int, int, int]:
        record = candidate.get("record", {})
        richness = sum(bool(record.get(key)) for key in (
            "what_it_is", "plain_meaning", "meaning_in_area", "task_connection", "task_and_output",
            "task_use_and_output", "what_it_does_for_task", "learner_output", "task_output_reviewed",
            "authoritative_evidence", "evidence_source_ids", "free_task_specific_learning_links",
            "free_task_learning_links", "explanation_links", "learning_links", "learning_resource_ids",
            "limitations", "limitations_or_non_substitutions",
            "limitations_and_non_substitutions", "valid_alternatives", "relationships",
        ))
        return (
            int(bool(record.get("id") or record.get("item_id"))) + richness,
            int(bool(record.get("review_disposition") or record.get("status"))),
            len(candidate.get("references", [])),
        )

    return max(candidates, key=score)


# These five routed cards had complete local meanings and task outputs, but the
# old graph closure left their external evidence identifiers unresolved and
# their task-specific learning links empty. Each entry below was checked
# against the live publisher/vendor documentation on 2026-11-02. Keep evidence
# and learning roles distinct: a source can support the tool/task claim without
# being presented as a learning resource.
VERIFIED_AREA_ITEM_SOURCE_ADDENDA: dict[str, dict[str, list[dict[str, str]]]] = {
    "area_enrichment_item:d078-econ-llm-evidence-synthesis": {
        "evidence": [{
            "id": "external:aea-generative-ai-economic-research",
            "title": "Generative AI for Economic Research: Use Cases and Implications for Economists",
            "url": "https://www.aeaweb.org/articles?id=10.1257/jel.20231736",
            "locator": "AEA Journal of Economic Literature article; use cases include background research and evidence synthesis. It cautions that literature-review synthesis remains difficult and requires checking original sources.",
            "source_role": "area_item_evidence",
        }, {
            "id": "external:aea-ai-agents-economic-research-2025",
            "title": "AI Agents for Economic Research (August 2025 update)",
            "url": "https://www.aeaweb.org/articles/materials/23826",
            "locator": "Author's AEA update; hands-on examples for literature reviews and research workflows. Emerging-support evidence only, not a claim of universal or validated replacement for human review.",
            "source_role": "area_item_evidence",
        }],
        "learning": [{
            "id": "resource:aea-ai-agents-economic-research-2025",
            "title": "AI Agents for Economic Research (August 2025 update)",
            "url": "https://www.aeaweb.org/articles/materials/23826",
            "locator": "Open article and accompanying materials; introductory, example-led learning resource.",
            "source_role": "task_specific_learning_resource",
        }],
    },
    "area_enrichment_item:d078-econ-r-python-analysis": {
        "evidence": [{
            "id": "external:world-bank-reproducible-research-guidance",
            "title": "Guidance to Authors: Reproducible Research Repository",
            "url": "https://worldbank.github.io/wb-reproducible-research-repository/guidance_note_wb.html",
            "locator": "World Bank guidance on documented code/data workflows and reproducibility; supports the reproducible-workflow claim, not a requirement to learn both languages.",
            "source_role": "area_item_evidence",
        }],
        "learning": [{
            "id": "resource:world-bank-dime-introduction-to-r",
            "title": "DaTax Course: Introduction to R",
            "url": "https://www.worldbank.org/en/programs/datax-lab/resources",
            "locator": "World Bank practical course for R-based administrative-data analysis, from beginner setup to reproducible analysis; R option.",
            "source_role": "task_specific_learning_resource",
        }, {
            "id": "resource:world-bank-dime-python-training-index",
            "title": "DIME Analytics software and Python training resources",
            "url": "https://dimewiki.worldbank.org/Software_Tools",
            "locator": "World Bank DIME Wiki links to introductory Python training materials; Python option. The two language paths remain alternatives, not a combined requirement.",
            "source_role": "task_specific_learning_resource",
        }],
    },
    "area_enrichment_item:d078-soc-caqdas-taguette-nvivo": {
        "evidence": [{
            "id": "external:taguette-official-getting-started",
            "title": "Getting started with Taguette",
            "url": "https://www.taguette.org/getting-started.html",
            "locator": "Official Taguette user guide for projects, documents, tags/codes, retrieval and exports.",
            "source_role": "area_item_evidence",
        }, {
            "id": "external:nvivo-official-getting-started",
            "title": "NVivo: Getting started basics",
            "url": "https://community.lumivero.com/s/article/NVR1Win-Content-tutorials-nvivo-tutorials",
            "locator": "Vendor help tutorials for importing, organizing/coding, note-taking, queries and visualizations; supports NVivo-specific use, not feature parity with Taguette.",
            "source_role": "area_item_evidence",
        }],
        "learning": [{
            "id": "resource:taguette-official-getting-started",
            "title": "Getting started with Taguette",
            "url": "https://www.taguette.org/getting-started.html",
            "locator": "Free official beginner walkthrough for document-based qualitative coding.",
            "source_role": "task_specific_learning_resource",
        }, {
            "id": "resource:nvivo-official-getting-started",
            "title": "NVivo: Getting started basics",
            "url": "https://community.lumivero.com/s/article/NVR1Win-Content-tutorials-nvivo-tutorials",
            "locator": "Vendor walkthrough for the NVivo alternative; NVivo access may require a paid license.",
            "source_role": "task_specific_learning_resource",
        }],
    },
    "area_enrichment_item:d078-soc-kobo-survey-field": {
        "evidence": [{
            "id": "external:kobotoolbox-data-collection-methods",
            "title": "Data collection with KoboToolbox",
            "url": "https://support.kobotoolbox.org/data-collection-tools.html",
            "locator": "Official documentation distinguishes browser web forms from KoboCollect Android field collection, including offline use and method-selection considerations.",
            "source_role": "area_item_evidence",
        }],
        "learning": [{
            "id": "resource:kobotoolbox-data-collection-methods",
            "title": "Data collection with KoboToolbox",
            "url": "https://support.kobotoolbox.org/data-collection-tools.html",
            "locator": "Official task-specific guide for choosing and preparing web-form or KoboCollect field collection.",
            "source_role": "task_specific_learning_resource",
        }],
    },
    "area_enrichment_item:d078-soc-quant-text-r": {
        "evidence": [{
            "id": "external:quanteda-official-documentation",
            "title": "quanteda: Quantitative Analysis of Textual Data",
            "url": "https://quanteda.io/",
            "locator": "Official package site documents quanteda's corpus and text-analysis capabilities; this supports software capability, not validity of any social construct or population inference.",
            "source_role": "area_item_evidence",
        }],
        "learning": [{
            "id": "resource:quanteda-official-tutorials",
            "title": "quanteda tutorials",
            "url": "https://tutorials.quanteda.io/",
            "locator": "Maintainer-authored step-by-step tutorials for R, corpus construction, tokens, document-feature matrices, scaling and classification.",
            "source_role": "task_specific_learning_resource",
        }],
    },
    "area_enrichment_item:d078-human-geography-geographical-random-forest": {
        "evidence": [{
            "id": "external:geographical-random-forests-population-modelling",
            "title": "Geographical random forests: a spatial extension of the random forest algorithm to address spatial heterogeneity in remote sensing and population modelling",
            "url": "https://doi.org/10.1080/10106049.2019.1595177",
            "locator": "Peer-reviewed method paper describes geographically local random-forest models for spatial heterogeneity and population modelling; it presents the method as exploratory/predictive, not causal proof.",
            "source_role": "area_item_evidence",
        }, {
            "id": "external:pygrf-source-and-notebooks",
            "title": "PyGRF: an improved Python Geographical Random Forest model",
            "url": "https://github.com/geoai-lab/PyGRF",
            "locator": "Project source repository includes parameter descriptions, Jupyter notebooks and case-study data; supports learning the implementation, not a claim that the method is appropriate for every spatial question.",
            "source_role": "area_item_evidence",
        }, {
            "id": "external:pygrf-method-limitations",
            "title": "PyGRF: an improved Python Geographical Random Forest model and case studies in public health and natural disasters",
            "url": "https://arxiv.org/abs/2409.13947",
            "locator": "Method paper identifies limitations involving local-model weights and bandwidths, insufficient local training observations, and high local prediction errors.",
            "source_role": "area_item_evidence",
        }],
        "learning": [{
            "id": "resource:pygrf-notebooks",
            "title": "PyGRF examples and notebooks",
            "url": "https://github.com/geoai-lab/PyGRF",
            "locator": "Project notebooks and parameter descriptions provide a practical, code-based introduction. Learners need Python and spatial-data preparation first; this is an optional specialist extension.",
            "source_role": "task_specific_learning_resource",
        }],
    },
}

# Some legacy source records contain a reviewed task contract and verified
# resource but omit the dedicated plain-language field. These concise meanings
# are reconciled from that item's own task/output and cited sources; they are
# not copied across unrelated items. Keep genuine access/safeguard holds below.
AREA_ITEM_STUDENT_MEANING_OVERRIDES: dict[str, str] = {
    "area_enrichment_item:d078-econ-time-series-analysis-and-forecasting": (
        "Use economic data recorded over time to describe patterns and make a bounded forecast. "
        "Check trends, seasonal patterns and past forecast errors, compare with a simple baseline, "
        "and show the forecast period and uncertainty. A forecast describes a possible future under "
        "stated assumptions; it does not show that one event caused another."
    ),
    "area_enrichment_item:econ-a1": (
        "Turn text or other non-tabular records into a measure for a specific economic question. "
        "For example, a researcher might code reports for references to a policy or condition, then "
        "check a human-reviewed sample to see what the coding misses or misclassifies. The result is "
        "a proposed measure, not a trustworthy economic fact until its errors and limits are assessed."
    ),
    "area_enrichment_item:econ-c1": (
        "Match the strength of an economic conclusion to the study design and data behind it. "
        "Separate a pattern or association from a cause-and-effect claim, explain the assumptions "
        "the claim needs, and state what the evidence cannot establish."
    ),
    "area_enrichment_item:econ-c2": (
        "Check a computer-generated measure against cases reviewed by people before using it in "
        "economic analysis. Record what it gets wrong, whether errors differ across groups, and how "
        "those errors could affect the conclusion. If a suitable check is not possible, use an "
        "established measure or leave the generated one out."
    ),
    "area_enrichment_item:soc-c2": (
        "Keep a clear account of how you moved from research material to an interpretation: what "
        "you noticed, which choices you made, and what other explanation could fit the evidence. "
        "This lets someone follow your reasoning; it does not remove bias or make weak evidence strong."
    ),
    "area_enrichment_item:soc-m3": (
        "Build a computer simulation in which individuals or organisations follow stated rules, "
        "then examine how their interactions could produce a larger social pattern. It helps explore "
        "a proposed mechanism; it is not a direct observation of real people or a reliable forecast "
        "unless the model is independently tested for that purpose."
    ),
    "area_enrichment_item:soc-t2": (
        "Mesa is a Python toolkit for building agent-based simulations. It provides reusable parts "
        "for defining agents, their environment, the order of their actions and the results to record. "
        "The researcher must still justify the model's rules and test whether its results support the "
        "question; using Mesa alone does not validate a social explanation."
    ),
    "area_enrichment_item:d078-human-geography-geographical-random-forest": (
        "A geographical random forest fits related prediction models for different locations so a "
        "researcher can explore whether patterns vary across space. Use it only when there are enough "
        "observations in each local area and compare its predictions with a suitable overall model. "
        "It can help map local patterns, but it does not prove why those patterns occur."
    ),
    "area_enrichment_item:soc-a2": (
        "Casevo is a Python framework for running social simulations with interacting, language-model-enabled agents. "
        "It is a specialist option for exploring a clearly stated social mechanism; its simulated conversations or choices "
        "are not observations of real people."
    ),
}

AREA_ITEM_CONTRACT_OVERRIDES: dict[str, dict[str, Any]] = {
    "area_enrichment_item:d078-computational-digital-social-science-mesa-or-casevo": {
        "label": "Mesa, with Casevo as a specialist extension",
        "requirement_lane": "useful_optional",
        "task_context": (
            "Choose a simulation framework only after stating the social mechanism and assumptions. Mesa is the broader "
            "Python agent-based modelling framework; Casevo is a narrower language-model-enabled workflow built on Mesa. "
            "Casevo is optional, needs local Python setup, and its LLM example may need a separate provider account or API key."
        ),
        "learner_output": (
            "A documented model with its agents, rules, assumptions, configuration and run results; if Casevo's LLM mode is used, "
            "also record the provider/model version, prompts and costs, and explain how the generated behaviour was checked."
        ),
        "limitations": [
            "Casevo is a specialist extension built on Mesa, not evidence that a learner must study two separate methods or use both frameworks in every project.",
            "An LLM provider may be needed for the LLM-enabled example; provider availability, terms, privacy and cost are separate from the Apache-2.0-licensed Casevo code.",
            "Simulated agent outputs are not observations, representative survey responses, forecasts or validated claims about real people.",
            "Use synthetic or public non-sensitive inputs unless appropriate ethics, permission and privacy safeguards are in place.",
        ],
        "relationships": [
            {
                "type": "builds_on",
                "target_id": "domain-item:d078-mesa-tool",
                "target_label": "Mesa",
                "explanation": "The Casevo project describes itself as built on Mesa; Casevo adds a specialist cognitive-agent and language-model workflow.",
                "source_ids": ["external:casevo-official-readme", "external:casevo-framework-paper"],
            },
        ],
    },
    "area_enrichment_item:soc-a2": {
        "label": "Casevo for an optional language-model social-simulation route",
        "requirement_lane": "useful_optional",
        "task_context": (
            "Use this only when the selected Sociology and Social Anthropology task is to explore a stated social mechanism "
            "through interacting simulated agents. The model's generated dialogue or choices are not evidence gathered from people."
        ),
        "learner_output": (
            "A small, documented simulation that names the agents, interaction rules and assumptions, records the software/model "
            "version and prompts, and explains how outputs were checked and what they cannot establish."
        ),
        "limitations": [
            "The published Casevo example is a framework demonstration, not validation that simulated agents represent a population.",
            "Language-model features may require a separately configured provider and may involve provider terms, privacy obligations or cost.",
            "Do not submit identifiable, confidential or sensitive participant data without appropriate consent, permission and review.",
        ],
        "relationships": [
            {
                "type": "specialist_extension_of",
                "target_id": "domain-item:d078-agent-based-modeling",
                "target_label": "Agent-based modelling",
                "explanation": "Casevo is one specialist implementation for an agent-based social-simulation task; it is optional and does not replace empirical inquiry.",
                "source_ids": ["external:casevo-official-readme", "external:casevo-framework-paper", "external:ethics-agent-based-social-simulation"],
            },
        ],
    },
    "area_enrichment_item:d078-human-geography-geographical-random-forest": {
        "task_family_id": "area-task:d078-human-geography-population-spatial-patterns",
        "task_context": (
            "Use this optional specialist extension within spatial-pattern work when the question asks "
            "whether a predictive relationship differs by place. It follows the selected spatial or "
            "quantitative route; it is not required for describing or mapping spatial patterns."
        ),
        "learner_output": (
            "A comparison with an overall-model baseline, a map of local predictions or errors, the "
            "validation design, and a short account of local sample size and uncertainty."
        ),
        "limitations": [
            "Prediction is not causal explanation.",
            "Local models can be unstable when a place has too few suitable observations or when bandwidth choices are poor.",
            "Validation must match the intended use and account for spatial dependence; a random split may overstate transfer to new places.",
        ],
    },
    "area_enrichment_item:d078-computational-digital-social-science-predictive-text-modeling": {
        "label": "Predict text only for a defined social question, with validation",
        "requirement_lane": "conditional",
        "task_context": (
            "Show this optional specialist route only inside the selected digital-text or trace-data task. The reviewed local contract "
            "bounds the example to AfriSenti sentiment classification in Hausa, Igbo, Nigerian Pidgin and Yoruba; it does not support "
            "predicting other social ideas or transferring results to other people or settings. Before modelling, state what sentiment "
            "means for the question, confirm dataset access and label limits, and plan human-checked and subgroup error review."
        ),
        "learner_output": (
            "A short model card or evaluation report that names the question, dataset and language scope, baseline, validation method, "
            "errors by relevant subgroup, privacy and access checks, limits, and cases where the model should not be used."
        ),
        "limitations": [
            "A high accuracy or area-under-the-curve score does not establish that the labels measure the intended social idea, explain causes, or generalise to another group or setting.",
            "Language coverage and subgroup errors may be uneven; results from the reviewed AfriSenti example must not be presented as a model validated for all Nigerian languages or populations.",
            "Use only data whose access and permitted use have been checked; the Nigeria Data Protection Act source is governance context, not blanket permission to process personal data.",
            "This is a conditional, skippable specialist learning route and never blocks other area methods or roles.",
        ],
        "relationships": [
            {
                "type": "requires",
                "target_id": "D078:computational-digital-social-science:digital-trace-construct-and-sampling",
                "target_label": "Define the text-data question, scope and sample",
                "explanation": "Define the social idea, data source, population and sample before training a predictive text model; otherwise its labels and errors cannot be interpreted responsibly.",
                "source_ids": ["SKLEARN", "NDP_ACT", "NIST_AI_RMF"],
            },
        ],
    },
}

DOMAIN_ITEM_CONTRACT_OVERRIDES: dict[str, dict[str, Any]] = {
    "domain-item:d078-responsible-research": {
        "requirement_lane": "useful_edge",
        "condition": (
            "Choose this preparation when the selected research task will involve people or identifiable/sensitive information. "
            "Use it before collecting or using that information to identify consent, privacy, possible harm and the permissions or review that apply."
        ),
        "rationale": (
            "This is a project-conditional safeguard, not a course prerequisite for reaching another method, area or role. "
            "It remains skippable when the selected task does not involve people or identifiable/sensitive information."
        ),
    },
    "domain-item:d078-pandas-tool": {
        "requirement_lane": "useful_edge",
        "condition": "Choose pandas only when a selected route needs Python-based cleaning, joining or summarising of tabular research data; another suitable tool is a valid alternative.",
        "rationale": "Pandas is useful for a bounded data workflow, not a shared foundation or prerequisite for every Social Sciences route.",
    },
    "domain-item:d078-survey-data-collection-tool": {
        "requirement_lane": "useful_edge",
        "condition": "Choose KoboToolbox when a selected survey or fieldwork route needs electronic form delivery and response collection; it does not replace questionnaire design, sampling or ethics.",
        "rationale": "KoboToolbox supports a particular collection workflow; it is not required for interviews, document research or every survey project.",
    },
    "domain-item:d078-spatial-social-analysis": {
        "requirement_lane": "useful_edge",
        "condition": "Use spatial analysis only when location, distance, boundaries or geographic distribution matter to the social question and the data support the chosen scale.",
        "rationale": "Mapping is a useful route-specific option, not a universal Social Sciences requirement.",
        "limitations": [
            "Results can change when data are grouped into different geographic sizes or boundaries; report the geographic units and scale used.",
            "A pattern for an area does not automatically describe each person who lives there.",
            "A map displays measured data; it does not by itself explain why a pattern occurred or prove a causal effect.",
        ],
        "evidence": [{
            "id": "external:ons-practical-geography-and-statistics",
            "title": "Office for National Statistics, Practical Geography for Statistics",
            "url": "https://onsgeo.github.io/geospatial-training/docs/practical_geog_and_stats",
            "locator": "Official geospatial training explains the modifiable areal unit problem and ecological fallacy, including limits on inference from grouped geographic data.",
            "source_role": "domain_item_evidence",
        }],
    },
    "domain-item:d078-casevo-tool": {
        "requirement_lane": "useful_edge",
        "condition": "Offer Casevo only after the learner selects an agent-based social-simulation route and the question benefits from its cognitive-agent or language-model features. The learner may use Mesa without Casevo or choose another suitable implementation.",
        "rationale": "Casevo is a documented specialist implementation, not a general D078 requirement, a credential, or evidence that simulated behaviour is valid.",
        "meaning": "Casevo is a Python framework for running social simulations with interacting agents on networks. Its specialist language-model features can generate simulated discussion or decisions from stated prompts and rules.",
        "learner_output": "A small, reproducible model record that states what the agents represent, the network and interaction rules, software and model versions, prompts, provider settings, run conditions, validation checks and limits.",
        "license": "The Casevo repository is licensed under Apache-2.0. This does not cover any separately used model provider or API.",
        "limitations": [
            "The official project example uses a separately implemented language-model interface; provider access, terms, privacy and possible cost are not included in the Apache-2.0 license for Casevo itself.",
            "The README specifies Python greater than 3.11 and local project setup; this is not a hosted one-click service.",
            "Generated agent dialogue and choices are simulated outputs, not observations, representative survey responses, population estimates or validated forecasts.",
            "Do not submit identifiable, confidential or sensitive participant data without appropriate permission, consent and ethics review.",
            "The tool's documented capability does not establish broad adoption, professional certification or stable long-term maintenance.",
        ],
        "evidence": [
            {
                "id": "external:casevo-official-readme",
                "title": "Casevo project README and tutorial",
                "url": "https://github.com/rgCASS/casevo",
                "locator": "Introduction, installation, first social-simulation tutorial and LLM interface; describes Casevo as a Python social-simulation framework built on Mesa.",
                "source_role": "tool_capability_and_learning_resource",
            },
            {
                "id": "external:casevo-framework-paper",
                "title": "Jiang et al., Casevo: A Cognitive Agents and Social Evolution Simulator",
                "url": "https://arxiv.org/abs/2412.19498",
                "locator": "Abstract and framework description; supports the bounded claim that Casevo is an LLM-integrated multi-agent simulation framework, not independent validation of simulated behaviour.",
                "source_role": "tool_capability_evidence",
            },
            {
                "id": "external:casevo-apache-license",
                "title": "Casevo repository Apache-2.0 license",
                "url": "https://github.com/rgCASS/casevo/blob/main/LICENSE",
                "locator": "License file in the official project repository.",
                "source_role": "license_evidence",
            },
            {
                "id": "external:ethics-agent-based-social-simulation",
                "title": "The Ethics of Agent-Based Social Simulation",
                "url": "https://jasss.soc.surrey.ac.uk/25/4/1.html",
                "locator": "Journal article on responsible practice, transparency and ethical issues in agent-based social simulation.",
                "source_role": "ethics_and_limitations_evidence",
            },
            {
                "id": "external:casevo-mesa-documentation",
                "title": "Mesa first-model tutorial",
                "url": "https://mesa.readthedocs.io/stable/tutorials/0_first_model.html",
                "locator": "The Mesa project tutorial covers agents, model steps, data collection and visualisation; Casevo's official README says Casevo is built on Mesa.",
                "source_role": "framework_relationship_evidence",
            },
        ],
        "learning_links": [
            {
                "label": "Casevo official project README and tutorial",
                "url": "https://github.com/rgCASS/casevo",
                "publisher": "Casevo project",
                "access": "Public source code and tutorial; local Python installation required",
                "why_this_resource": "The project README documents installation, a worked simulation and analysis of its outputs.",
            },
            {
                "label": "Mesa first-model tutorial",
                "url": "https://mesa.readthedocs.io/stable/tutorials/0_first_model.html",
                "publisher": "Mesa project",
                "access": "Public documentation",
                "why_this_resource": "Learn the underlying agent, model-step and data-collection ideas that Casevo builds on.",
            },
        ],
        "relationships": [
            {
                "type": "specialist_extension_of",
                "target_id": "domain-item:d078-mesa-tool",
                "target_label": "Mesa",
                "explanation": "Casevo is built on Mesa and adds a specialist cognitive-agent and language-model workflow; it should not be described as unrelated to or a replacement for Mesa.",
                "source_ids": ["external:casevo-official-readme", "external:casevo-framework-paper"],
            },
            {
                "type": "supports",
                "target_id": "domain-item:d078-agent-based-modeling",
                "target_label": "Agent-based modelling of social processes",
                "explanation": "Use Casevo only as one implementation when the selected research question calls for an agent-based simulation.",
                "source_ids": ["external:casevo-official-readme", "external:casevo-framework-paper"],
            },
        ],
    },
    "domain-item:d078-igraph-tool": {
        "requirement_lane": "useful_edge",
        "condition": "Choose R/igraph only when the selected question uses relationship data and the analysis needs graph construction or a named network measure.",
        "rationale": "R/igraph is a task-specific software option, not a shared Social Sciences requirement.",
        "limitations": [
            "The package cannot correct incomplete, biased or poorly defined relationship data.",
            "A network measure describes the graph as encoded; it does not by itself establish causation or social importance.",
        ],
        "meaning": "R/igraph is a software package for creating and analysing graphs, including networks whose points represent people or organisations and whose links represent relationships.",
        "learner_output": "A reproducible R script that documents the people or organisations represented, defines each relationship, computes a justified network measure and explains what the result cannot show.",
        "evidence": [{
            "id": "external:r-igraph-official-reference",
            "title": "R/igraph official reference manual",
            "url": "https://r.igraph.org/reference/",
            "locator": "Official function index for graph construction and network-analysis functions, including community detection.",
            "source_role": "domain_item_evidence",
        }],
        "learning_links": [{
            "label": "R/igraph official reference manual",
            "url": "https://r.igraph.org/reference/",
            "publisher": "R/igraph project",
            "access": "Public documentation",
            "why_this_resource": "The project reference documents the functions used to construct and analyse graphs in R.",
        }],
    },
    "domain-item:d078-netlogo-tool": {
        "requirement_lane": "useful_edge",
        "condition": "Choose NetLogo when a selected agent-based modelling question benefits from building or exploring explicit agent rules in this environment.",
        "rationale": "NetLogo is an optional way to implement a suitable simulation; it is not a research method or prerequisite for every D078 route.",
        "limitations": [
            "A working simulation does not show that its rules describe real people or that its results predict actual behaviour.",
            "The learner must justify the agents, rules, assumptions and validation checks for the specific question.",
        ],
        "meaning": "NetLogo is a modelling environment where you can define agents, give them rules and observe the patterns that emerge when they interact.",
        "learner_output": "A small, documented model with stated agents and rules, a record of model settings, and a comparison of runs that explains the limits of the results.",
        "evidence": [{
            "id": "external:netlogo-official-documentation",
            "title": "NetLogo official documentation and tutorial models",
            "url": "https://docs.netlogo.org/",
            "locator": "Official manual and beginner materials describe NetLogo as a programmable environment for simulating natural and social phenomena and include first-model tutorials.",
            "source_role": "domain_item_evidence",
        }],
        "learning_links": [{
            "label": "Build a first NetLogo model",
            "url": "https://docs.netlogo.org/tutorial1.html",
            "publisher": "NetLogo project",
            "access": "Public documentation",
            "why_this_resource": "The official tutorial introduces the model library and the steps for opening and exploring models.",
        }],
    },
    "domain-item:d078-scenario-analysis": {
        "requirement_lane": "useful_edge",
        "condition": "Use scenario analysis when the question is about how a policy, programme or social system could respond to several plausible future conditions, rather than predicting one certain future.",
        "rationale": "Scenario analysis is a conditional planning method; learners can complete other research routes without it.",
        "limitations": [
            "Scenarios are structured possibilities, not probability-ranked predictions unless a separate justified model provides probabilities.",
            "The scenarios depend on selected drivers and assumptions; record whose perspectives and evidence shaped them.",
        ],
        "evidence": [{
            "id": "external:uk-go-science-futures-toolkit",
            "title": "Government Office for Science Futures Toolkit",
            "url": "https://www.gov.uk/government/publications/futures-toolkit-for-policy-makers-and-analysts",
            "locator": "The updated toolkit describes practical futures methods for exploring uncertainty and making policies or strategies more robust; it is not a forecasting guarantee.",
            "source_role": "domain_item_evidence",
        }],
    },
    "domain-item:d078-sensitivity-and-robustness-analysis": {
        "requirement_lane": "useful_edge",
        "condition": "Use sensitivity or robustness checks when a quantitative result depends on uncertain inputs, modelling choices or assumptions that could materially change the conclusion.",
        "rationale": "These checks strengthen a relevant analysis but are not a prerequisite for every Social Sciences route.",
        "limitations": [
            "Changing one input at a time may miss interactions among inputs; state which checks were run and why.",
            "A robust result under tested assumptions is not automatically unbiased, causal or correct outside the tested range.",
        ],
        "evidence": [{
            "id": "external:nist-sensitivity-uncertainty-analysis",
            "title": "NIST Technical Note 2225 Revision 1: Sensitivity and uncertainty analysis",
            "url": "https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2225r1.pdf",
            "locator": "Section 4.3.4 explains varying model inputs and comparing outputs to identify influential variables and assess model robustness.",
            "source_role": "domain_item_evidence",
        }],
        "learning_links": [{
            "label": "NIST guidance on sensitivity and uncertainty analysis",
            "url": "https://nvlpubs.nist.gov/nistpubs/TechnicalNotes/NIST.TN.2225r1.pdf",
            "publisher": "National Institute of Standards and Technology",
            "access": "Public technical note",
            "why_this_resource": "The section gives a concrete example of varying inputs and comparing outputs while explaining that the method must fit the analysis.",
        }],
    },
    "domain-knowledge:graph-theory-concepts-for-networks": {
        "requirement_lane": "useful_edge",
        "condition": "Show this optional preparation only after a learner chooses Network Analysis or Social Network Analysis, when graph concepts are needed to understand the chosen measure.",
        "rationale": "Graph concepts support network methods; they are not a general foundation for every D078 learner.",
        "meaning": "Graph theory gives names and rules for describing a network: the people or things represented as points, their connections, and patterns such as paths, groups and centrality.",
        "learner_output": "A small diagram or edge list with a clear definition of its points and links, plus an explanation of one graph concept used in the selected analysis.",
        "limitations": [
            "A graph represents only the entities and ties included by the researcher; missing or differently defined ties can change the result.",
            "A graph concept does not explain why a relationship exists or prove a causal effect.",
        ],
        "evidence": [{
            "id": "external:networkx-official-tutorial",
            "title": "NetworkX official tutorial",
            "url": "https://networkx.org/documentation/stable/tutorial",
            "locator": "The tutorial defines graphs through nodes and edges and demonstrates graph construction and basic analysis.",
            "source_role": "domain_item_evidence",
        }],
        "learning_links": [{
            "label": "NetworkX tutorial: graph basics",
            "url": "https://networkx.org/documentation/stable/tutorial",
            "publisher": "NetworkX project",
            "access": "Public documentation",
            "why_this_resource": "The tutorial introduces nodes, edges and graph operations used to represent network data.",
        }],
    },
    "domain-method:network-analysis": {
        "requirement_lane": "useful_edge",
        "condition": "Choose Network Analysis when the research question concerns the structure of connections among defined people, organisations or other entities.",
        "rationale": "Network Analysis is a selectable method for relational questions, not a required method for every D078 learner.",
        "meaning": "Network Analysis represents entities as points and their recorded connections as links, then examines patterns in those connections.",
        "learner_output": "A documented network dataset and analysis that define the entities and links, report selected measures and explain coverage and interpretation limits.",
        "limitations": [
            "The analysis depends on how the network boundary and ties were defined and on whether relevant connections were observed.",
            "Network patterns alone do not establish why ties formed or prove that network position caused an outcome.",
        ],
        "evidence": [{
            "id": "external:networkx-official-tutorial",
            "title": "NetworkX official tutorial",
            "url": "https://networkx.org/documentation/stable/tutorial",
            "locator": "Official tutorial covers graph creation, nodes, edges, graph properties and analysis functions.",
            "source_role": "domain_item_evidence",
        }],
        "learning_links": [{
            "label": "NetworkX tutorial: create and analyse graphs",
            "url": "https://networkx.org/documentation/stable/tutorial",
            "publisher": "NetworkX project",
            "access": "Public documentation",
            "why_this_resource": "The official tutorial demonstrates the data structure and operations used for network analysis.",
        }],
    },
    "domain-method:social-network-analysis": {
        "requirement_lane": "useful_edge",
        "condition": "Choose Social Network Analysis when the question is specifically about social ties or relationship patterns among people, groups or organisations.",
        "rationale": "Social Network Analysis is an optional relational method; it is distinct from analysing individual attributes alone.",
        "meaning": "Social Network Analysis studies how relationships among people or organisations are patterned and how those patterns relate to a social question.",
        "learner_output": "A clearly bounded social network with documented actors and ties, a justified measure or comparison, and a plain-language interpretation that notes missing ties and uncertainty.",
        "limitations": [
            "The network boundary and tie definition determine what can be seen; incomplete or sensitive relationship data need careful handling.",
            "A network measure does not by itself explain a person's behaviour, establish causation or represent people outside the observed network.",
        ],
        "evidence": [{
            "id": "external:columbia-social-network-analysis-method",
            "title": "Columbia University: Social Network Analysis method overview",
            "url": "https://www.publichealth.columbia.edu/research/population-health-methods/social-network-analysis",
            "locator": "The method overview describes relational data and the study of relationship structure among individuals, groups and organisations.",
            "source_role": "domain_item_evidence",
        }],
        "learning_links": [{
            "label": "Columbia University: Social Network Analysis",
            "url": "https://www.publichealth.columbia.edu/research/population-health-methods/social-network-analysis",
            "publisher": "Columbia University Mailman School of Public Health",
            "access": "Public method overview",
            "why_this_resource": "The overview explains the method's focus on relationships and the difference between relational and individual-attribute data.",
        }],
    },
}

CASEVO_APPROVED_AREA_ITEM_IDS = {
    "area_enrichment_item:d078-computational-digital-social-science-mesa-or-casevo",
    "area_enrichment_item:soc-a2",
}

CASEVO_SOURCE_REVIEW = {
    "decision": "approved",
    "reviewed_on": "2026-11-02",
    "basis": "Approved as an optional, bounded social-simulation tool after checking the official project README/tutorial, the linked framework paper, and the repository's Apache-2.0 license. The tool performs the stated modelling function; the decision does not claim broad adoption, stable maintenance, predictive validity, or evidence about real people.",
    "required_student_caveats": [
        "Runs as a locally installed Python framework; the project README specifies Python greater than 3.11.",
        "The LLM-enabled example requires separately configured model-provider access; provider terms, privacy and possible cost are separate from the open-source framework.",
        "Use synthetic or public non-sensitive material unless appropriate ethics, permission and privacy safeguards are in place.",
        "Treat generated agent behaviour as a model output, not a survey response, population estimate, forecast or observed fact.",
        "Record model/version, prompts, assumptions, network setup, run settings and validation or sensitivity checks.",
    ],
    "sources": [
        {
            "id": "external:casevo-official-readme",
            "title": "Casevo project README and tutorial",
            "url": "https://github.com/rgCASS/casevo",
            "locator": "Introduction, installation, first social-simulation tutorial and LLM interface; describes Casevo as a Python social-simulation framework built on Mesa.",
            "source_role": "tool_capability_and_learning_resource",
        },
        {
            "id": "external:casevo-framework-paper",
            "title": "Jiang et al., Casevo: A Cognitive Agents and Social Evolution Simulator",
            "url": "https://arxiv.org/abs/2412.19498",
            "locator": "Abstract and framework description; supports the bounded claim that Casevo is an LLM-integrated multi-agent simulation framework, not independent validation of simulated behaviour.",
            "source_role": "tool_capability_evidence",
        },
        {
            "id": "external:casevo-apache-license",
            "title": "Casevo repository Apache-2.0 license",
            "url": "https://github.com/rgCASS/casevo/blob/main/LICENSE",
            "locator": "License file in the official project repository.",
            "source_role": "license_evidence",
        },
        {
            "id": "external:ethics-agent-based-social-simulation",
            "title": "Anzola, Barbrook-Johnson and Gilbert, The Ethics of Agent-Based Social Simulation",
            "url": "https://jasss.soc.surrey.ac.uk/25/4/1.html",
            "locator": "Journal article discusses responsible practice, transparency and ethical issues in agent-based social simulation.",
            "source_role": "ethics_and_limitations_evidence",
        },
    ],
}

PREDICTIVE_TEXT_SOURCE_REVIEW = {
    "decision": "approved_conditional_specialist_learning_route",
    "reviewed_on": "2026-11-02",
    "basis": (
        "The existing D078 evidence already supports supervised text classification as a specialist learning activity, provides the "
        "scikit-learn learning material, and bounds the example to AfriSenti sentiment classification in four named languages. "
        "Approval is for learning and evaluating this bounded method, not for claiming that any model is valid for other constructs, "
        "languages, populations or decisions. Dataset access, privacy, label validity and subgroup validation remain explicit checks."
    ),
    "required_student_caveats": [
        "Keep the example within the recorded AfriSenti sentiment-classification task and its stated language coverage.",
        "Check data access terms, what the labels measure, and whether the sample supports the intended question before modelling.",
        "Compare against a simple baseline, inspect human-checked examples and relevant subgroup errors, and report uncertainty and non-use cases.",
        "Predictive performance is not causal explanation, construct validation or proof of generalisation.",
    ],
    "sources": ["SKLEARN", "NDP_ACT", "CDC_EVAL", "NIST_AI_RMF"],
}


def _unique_contract_refs(refs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    unique: dict[tuple[str, str, str, str], dict[str, Any]] = {}
    for ref in refs:
        if not isinstance(ref, dict):
            continue
        key = (str(ref.get("id") or ""), str(ref.get("url") or ""),
               str(ref.get("locator") or ""), str(ref.get("source_role") or ""))
        unique[key] = ref
    return list(unique.values())


def reconcile_student_display_contracts(
    graph: dict[str, Any], task_sets: dict[str, Any],
) -> dict[str, Any]:
    """Replace stale blanket-hidden flags with item-level, source-backed decisions.

    The earlier closure hid every domain and area candidate while role mapping was
    incomplete. That workflow flag is not a current content decision. This pass
    restores card fields only from exact source claims and exposes an item only
    when its meaning, task context/output, limits, evidence, learning resource,
    and resolved route membership are all present. Specialist candidates with
    an explicit keep-hidden disposition remain hidden.
    """
    nodes = {node["id"]: node for node in graph.get("nodes", [])}
    edges = graph.get("edges", [])
    source_claims = _index_area_item_claims(task_sets)
    candidate_results: list[dict[str, Any]] = []
    domain_counts = {"promoted": 0, "unapproved": 0, "explanatory_only": 0}
    tool_counts = {"promoted": 0, "unapproved": 0}
    primary_surface_counts: Counter[str] = Counter()
    programme_id = "programme:social-sciences:sociology"
    domain_id = "domain:D078"
    themes = [node for node in graph.get("nodes", []) if node.get("kind") == "programme_theme" and node.get("programme_id") == programme_id]
    outcomes = [node for node in graph.get("nodes", []) if node.get("kind") == "programme_outcome" and node.get("programme_id") == programme_id]
    outcome_theme_counts = Counter(edge.get("target") for edge in edges if edge.get("relationship") == "curriculum_outcome_grouped_under_theme")
    theme_outcome_edges = [edge for edge in edges if edge.get("relationship") == "curriculum_outcome_grouped_under_theme"]
    routed_families = {family_id for route in graph.get("method_area_routes", []) for family_id in route.get("task_family_ids", [])}
    area_routes_by_id = Counter(route.get("area_id") for route in graph.get("method_area_routes", []))
    method_family_edges = [edge for edge in edges if edge.get("relationship") == "method_applies_to_area_task" and edge.get("status") == "resolved_ready_for_use" and edge.get("source_references")]
    family_ids_with_sourced_method_route = {edge.get("target") for edge in method_family_edges}
    families_with_sourced_learning_items = {
        str(edge.get("source")) for edge in edges
        if edge.get("relationship") == "task_has_area_learning_item"
        and edge.get("status") == "resolved_ready_for_use"
        and edge.get("source_references")
        and edge.get("student_visible") is True
    }
    role_task_ids_with_sourced_role = {edge.get("source") for edge in edges if edge.get("relationship") == "role_task_family_of_role" and edge.get("source_references")}
    family_item_edge_by_target: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for edge in edges:
        if edge.get("relationship") == "task_has_area_learning_item":
            family_item_edge_by_target[str(edge.get("target"))].append(edge)

    for node in graph.get("nodes", []):
        kind = node.get("kind")
        if kind == "programme_context" and node.get("id") == programme_id:
            complete = (
                node.get("fixed_curriculum") is True
                and bool(node.get("source_artifacts"))
                and node.get("theme_count") == len(themes) == 14
                and node.get("theme_outcome_counts", {}).get("outcomes") == len(outcomes) == 236
                and all(theme.get("fixed_curriculum") is True and theme.get("source_artifacts") for theme in themes)
                and all(outcome.get("fixed_curriculum") is True and outcome.get("source_locator", {}).get("sourceLocatorText") for outcome in outcomes)
            )
            node.update({
                "approval": "approved" if complete else "unapproved",
                "student_visible": complete,
                "student_visibility_reason": None if complete else "The fixed programme curriculum does not yet have its complete sourced theme and outcome contract.",
                "student_display_disposition": {
                    "decision": "approved" if complete else "unapproved",
                    "basis": "exact Sociology curriculum contract with all 14 source-backed themes and 236 source-located outcomes" if complete else "curriculum source completeness check failed",
                    "reviewed_on": "2026-11-02",
                },
            })
            primary_surface_counts["programme_context_approved" if complete else "programme_context_unapproved"] += 1

        elif kind == "programme_theme" and node.get("programme_id") == programme_id:
            outcome_count = outcome_theme_counts.get(node["id"], 0)
            complete = bool(node.get("fixed_curriculum") is True and node.get("source_artifacts") and node.get("course_anchors") and outcome_count > 0)
            node.update({
                "approval": "approved" if complete else "unapproved",
                "student_visible": complete,
                "student_visibility_reason": None if complete else "This theme is hidden because its curriculum source, course anchors, or grouped outcomes did not pass the current check.",
                "student_display_disposition": {
                    "decision": "approved" if complete else "unapproved",
                    "basis": "fixed CCMAS theme, named course anchors and its own source-backed outcomes" if complete else "theme-level curriculum contract incomplete",
                    "grouped_outcome_count": outcome_count,
                    "reviewed_on": "2026-11-02",
                },
            })
            primary_surface_counts["programme_themes_approved" if complete else "programme_themes_unapproved"] += 1

        elif kind == "programme_outcome" and node.get("programme_id") == programme_id:
            linked = any(edge.get("source") == node["id"] and edge.get("relationship") == "curriculum_outcome_grouped_under_theme" for edge in theme_outcome_edges)
            locator = node.get("source_locator", {})
            complete = bool(node.get("fixed_curriculum") is True and node.get("source_artifacts") and node.get("source_text") and locator.get("sourceLocatorText") and linked)
            node.update({
                "approval": "approved" if complete else "unapproved",
                "student_visible": complete,
                "student_visibility_reason": None if complete else "This outcome is hidden because its exact curriculum source locator or theme connection is missing.",
                "student_display_disposition": {
                    "decision": "approved" if complete else "unapproved",
                    "basis": "exact outcome text and course/page locator in the fixed Sociology CCMAS contract" if complete else "outcome-level curriculum contract incomplete",
                    "reviewed_on": "2026-11-02",
                },
            })
            primary_surface_counts["programme_outcomes_approved" if complete else "programme_outcomes_unapproved"] += 1

        elif kind == "domain_route" and node.get("id") == domain_id:
            evidence = node.get("overview_evidence", [])
            has_source = any(isinstance(ref, dict) and str(ref.get("url") or "").startswith("http") for ref in evidence)
            complete = bool(node.get("overview_contract_id") and node.get("overview") and has_source and node.get("student_orientation"))
            node.update({
                "approval": "approved" if complete else "unapproved",
                "student_visible": complete,
                "student_selectable": complete,
                "student_visibility_reason": None if complete else "The domain overview lacks its reviewed description or source evidence.",
                "student_display_disposition": {
                    "decision": "approved" if complete else "unapproved",
                    "basis": "reviewed domain overview, orientation contract and source-linked field evidence" if complete else "domain overview contract incomplete",
                    "reviewed_on": "2026-11-02",
                },
            })
            primary_surface_counts["domain_overview_approved" if complete else "domain_overview_unapproved"] += 1

        elif kind == "area_of_specialization":
            area_id = node.get("area_id")
            routes = area_routes_by_id.get(area_id, 0)
            routed_families_for_area = {
                family_id for route in graph.get("method_area_routes", []) if route.get("area_id") == area_id
                for family_id in route.get("task_family_ids", [])
            }
            # The method-to-family route declarations do not duplicate their
            # citations on every route row. Readiness is proven by the canonical
            # method-area route plus source-backed family-to-learning-item edges.
            # Require at least one such destination per area; leave unsupported
            # individual families/items unapproved rather than hiding the area.
            sourced_families = routed_families_for_area & families_with_sourced_learning_items
            has_sourced_route = bool(sourced_families)
            complete = bool(routes and routed_families_for_area and has_sourced_route)
            node.update({
                "approval": "approved" if complete else "unapproved",
                "student_visible": complete,
                "student_selectable": complete,
                "student_visibility_reason": None if complete else "No current source-backed method route exposes this area; it is not shown as a selectable destination.",
                "student_display_disposition": {
                    "decision": "approved" if complete else "unapproved",
                    "basis": "canonical D078 area has explicit method-area routes and at least one source-backed routed task-family learning destination; unsupported individual options remain separately hidden" if complete else "area route/source coverage check failed",
                    "method_area_route_count": routes,
                    "routed_family_count": len(routed_families_for_area),
                    "source_backed_family_count": len(sourced_families),
                    "reviewed_on": "2026-11-02",
                },
            })
            primary_surface_counts["areas_approved" if complete else "areas_unapproved"] += 1

        elif kind == "area_task_family":
            if node["id"] in routed_families:
                node.update({
                    "approval": "approved", "student_visible": True, "student_selectable": True,
                    "student_visibility_reason": None,
                    "student_display_disposition": {
                        "decision": "approved",
                        "basis": "exact method/design-to-area route with resolved task-family evidence; optional work-context focus, not a prerequisite",
                        "reviewed_on": "2026-11-02",
                    },
                })
                primary_surface_counts["routed_area_task_families_approved"] += 1
            elif str(node.get("approval", "")).startswith("approved"):
                node["approval"] = "approved"
                node["student_display_disposition"] = {
                    "decision": "approved",
                    "basis": "reviewed disposition merges this duplicate or broad candidate into a canonical route/foundation; this record itself is not selectable",
                    "reviewed_on": "2026-11-02",
                }
                node["student_selectable"] = False
                primary_surface_counts["area_task_families_approved_nonselectable_dispositions"] += 1
            else:
                node.update({
                    "approval": "unapproved", "student_visible": False, "student_selectable": False,
                    "student_visibility_reason": "Source/reconciliation review found no current approved method-and-area route for this candidate. It remains in the audit only and cannot block the supported route.",
                    "student_display_disposition": {
                        "decision": "unapproved",
                        "basis": "no currently approved method/design route references this candidate; retained for audit instead of reviving its stale candidate flag",
                        "reviewed_on": "2026-11-02",
                    },
                })
                primary_surface_counts["unrouted_area_task_families_unapproved"] += 1

        elif kind == "role_task_family":
            complete = node["id"] in role_task_ids_with_sourced_role and bool(node.get("source_references"))
            node.update({
                "approval": "approved" if complete else "unapproved",
                "student_visible": complete,
                "student_visibility_reason": None if complete else "No source-backed role connection is available for this task context.",
                "student_display_disposition": {
                    "decision": "approved" if complete else "unapproved",
                    "basis": "role task context has its reviewed source profile and an explicit owning role" if complete else "role task source/owner join incomplete",
                    "reviewed_on": "2026-11-02",
                },
            })
            primary_surface_counts["role_task_families_approved" if complete else "role_task_families_unapproved"] += 1

        elif kind == "domain_learning_item":
            if node.get("item_type") == "explanatory_only" or node.get("id") == "domain-item:d078-statistical-tool-choice":
                node.update({
                    "approval": "unapproved", "student_visible": False, "student_selectable": False,
                    "student_visibility_reason": "This is explanatory guidance for choosing a quantitative tool, not a separate learning item to add to the plan.",
                    "student_display_disposition": {
                        "decision": "unapproved",
                        "basis": "explanatory-only node; actual named tools remain selectable in their method/area/role context",
                        "reviewed_on": "2026-11-02",
                    },
                })
                domain_counts["explanatory_only"] += 1
                continue
            override = DOMAIN_ITEM_CONTRACT_OVERRIDES.get(node["id"], {})
            for field in ("requirement_lane", "condition", "rationale", "limitations", "meaning", "learner_output", "learning_links", "license"):
                if field in override:
                    node[field] = override[field]
            if override.get("requirement_lane"):
                node["requirement_lane_source"] = "data/career-mapping/_audit/D078_REQUIREMENT_LANE_DISPOSITION_2026_10_20.json.gz"
                node["requirement_scope"] = {
                    "lane": override["requirement_lane"],
                    "condition": override["condition"],
                    "rationale": override["rationale"],
                    "skippable": True,
                    "blocks_progression": False,
                    "auto_add": False,
                    "auto_order": False,
                }
            if override.get("evidence"):
                refs = override["evidence"]
                node["evidence"] = _unique_contract_refs((node.get("evidence") or []) + refs)
                node["source_references"] = _unique_contract_refs((node.get("source_references") or []) + refs)
            if override.get("learning_links"):
                node["learning_links"] = _unique_contract_refs(override["learning_links"])
            if override.get("relationships"):
                node["relationships"] = override["relationships"]
            missing = []
            for field in ("meaning", "learner_output", "limitations", "learning_links", "evidence", "requirement_lane"):
                if not node.get(field):
                    missing.append(field)
            has_learning_url = any(isinstance(row, dict) and str(row.get("url") or "").startswith("http")
                                   for row in node.get("learning_links", []))
            has_evidence = bool(node.get("evidence"))
            if not has_learning_url:
                missing.append("verified_learning_link_url")
            if not has_evidence:
                missing.append("item_evidence")
            if missing:
                node.update({
                    "approval": "unapproved",
                    "student_visible": False,
                    "student_selectable": False,
                    "student_visibility_reason": "The item-level contract is missing: " + ", ".join(sorted(set(missing))) + ".",
                    "student_display_disposition": {"decision": "unapproved", "basis": "current domain contract does not pass all display fields", "missing_fields": sorted(set(missing))},
                })
                domain_counts["unapproved"] += 1
            else:
                node.update({
                    "approval": "approved",
                    "student_visible": True,
                    "student_selectable": True,
                    "student_visibility_reason": None,
                    "student_display_disposition": {
                        "decision": "approved",
                        "basis": "item-specific meaning, output, limits, source evidence, learning link and existing requirement lane are present; old blanket closure is superseded",
                        "source_contract": node.get("requirement_lane_source"),
                    },
                })
                domain_counts["promoted"] += 1
            candidate_results.append({"id": node["id"], "label": node.get("label"), "kind": kind,
                                      "approval": "unapproved" if missing else "approved", "missing_fields": sorted(set(missing))})

        elif kind == "area_enrichment_item":
            claim_candidates: list[dict[str, Any]] = []
            for edge in family_item_edge_by_target.get(node["id"], []):
                family = nodes.get(str(edge.get("source")), {})
                family_key = _normalise_family_key(family.get("task_family_id") or family.get("id"))
                item_key = _normalise_item_key(node.get("item_id") or node["id"])
                claim_candidates.extend(source_claims.get((family_key, item_key), []))
                if not source_claims.get((family_key, item_key)):
                    claim_candidates.extend(source_claims.get((family_key, "label:" + _normalise_label(node.get("label"))), []))
            selected = _best_area_item_claim(claim_candidates)
            record = selected.get("record", {}) if selected else {}
            registry = selected.get("source_registry", {}) if selected else {}
            family_edges = family_item_edge_by_target.get(node["id"], [])
            ready_edges = [edge for edge in family_edges if edge.get("status") == "resolved_ready_for_use"
                           and edge.get("student_visible") is True and edge.get("source_references")]

            output_review = record.get("task_output_reviewed", {})
            if not isinstance(output_review, dict):
                output_review = {}
            meaning = _first_contract_value(
                record, "what_it_is", "plain_meaning", "meaning_in_area", "meaning_in_area_and_D078",
                "meaning_in_D078", "meaning_in_domain", "purpose_and_area_context", "purpose",
            ) or AREA_ITEM_STUDENT_MEANING_OVERRIDES.get(node["id"]) or node.get("plain_language_meaning") or node.get("meaning")
            task_context = _first_contract_value(
                record, "task_connection", "what_it_does_for_task", "task_use", "task_use_and_output",
                "task_and_output", "purpose_and_area_context",
            ) or output_review.get("task_connection") or node.get("task_context") or node.get("why_it_matters")
            contract_override = AREA_ITEM_CONTRACT_OVERRIDES.get(node["id"], {})
            task_context = contract_override.get("task_context") or task_context
            learner_output = _first_contract_value(record, "learner_output") or output_review.get("learner_output") or contract_override.get("learner_output") or node.get("learner_output")
            if not learner_output:
                task_output = _first_contract_value(record, "task_and_output", "task_use_and_output")
                if isinstance(task_output, dict):
                    learner_output = task_output.get("learner_output") or task_output.get("output") or task_output.get("expected_output")
                elif isinstance(task_output, str):
                    learner_output = task_output
            limitations = _first_contract_value(
                record, "limitations_or_non_substitutions", "limitations_and_non_substitutions",
                "limitations", "limits", "uncertainty_and_exclusions",
            ) or contract_override.get("limitations") or node.get("limitations")
            alternatives = _first_contract_value(record, "valid_alternatives", "alternatives")
            complements = _first_contract_value(record, "complements")
            prerequisites = _first_contract_value(record, "prerequisites")

            evidence_refs = _contract_source_refs(record, registry, (
                "authoritative_evidence", "authoritative_work_sources", "evidence_refs", "evidence_source_refs",
                "source_references", "evidence", "evidence_source_ids", "authoritative_work_source_ids",
                "authoritative_source_ids",
            ), "area_item_evidence")
            explanatory_refs = _contract_source_refs(record, registry, (
                "explanatory_evidence", "explanatory_sources", "explanatory_source_ids",
            ), "explanatory_source")
            learning_refs = _contract_source_refs(record, registry, (
                "free_task_specific_learning_links", "free_task_specific_learning_resources", "learning_links",
                "free_task_learning_links", "free_task_specific_learning_resource_ids", "learning_resource_ids",
                "explanation_links", "learning",
            ), "task_specific_learning_resource")
            learning_refs = [ref for ref in learning_refs if str(ref.get("url") or "").startswith("http")]
            evidence_refs = [ref for ref in evidence_refs if str(ref.get("url") or "").startswith("http")]
            verified_addendum = VERIFIED_AREA_ITEM_SOURCE_ADDENDA.get(node["id"], {})
            evidence_refs = _unique_contract_refs(evidence_refs + verified_addendum.get("evidence", []))
            learning_refs = _unique_contract_refs(learning_refs + verified_addendum.get("learning", []))
            limits_present = bool(limitations)
            if isinstance(limitations, list):
                limits_present = any(str(value).strip() for value in limitations)
            if not task_context and ready_edges:
                # This is the exact family/item relationship explanation emitted
                # from the reviewed task-set membership, not a generic guess.
                task_context = ready_edges[0].get("explanation")
            keep_hidden_decision = (
                (record.get("review_disposition", {}) or {}).get("decision") == "supported_specialist_research_candidate_keep_hidden"
                and node["id"] not in CASEVO_APPROVED_AREA_ITEM_IDS
                and node["id"] != "area_enrichment_item:d078-computational-digital-social-science-predictive-text-modeling"
            )
            casevo_override = node["id"] in CASEVO_APPROVED_AREA_ITEM_IDS
            predictive_text_override = node["id"] == "area_enrichment_item:d078-computational-digital-social-science-predictive-text-modeling"
            if casevo_override:
                evidence_refs = _unique_contract_refs(evidence_refs + CASEVO_SOURCE_REVIEW["sources"])
                learning_refs = _unique_contract_refs(learning_refs + [
                    {
                        "id": "external:casevo-official-readme",
                        "label": "Casevo official project README and tutorial",
                        "url": "https://github.com/rgCASS/casevo",
                        "publisher": "Casevo project",
                        "access": "Public source code and tutorial; local Python installation required",
                        "why_this_resource": "The project documents installation, a worked social-simulation example and analysis of its outputs.",
                        "source_role": "task_specific_learning_resource",
                    }
                ])
            missing = []
            for key, value in (("plain_language_meaning", meaning), ("task_context", task_context),
                               ("learner_output", learner_output), ("item_limitations", limits_present),
                               ("authoritative_source", evidence_refs), ("task_specific_learning_resource", learning_refs),
                               ("resolved_task_family_relationship", ready_edges)):
                if not value:
                    missing.append(key)
            if keep_hidden_decision:
                missing.append("specialist safeguards required by source disposition")

            if selected:
                node["source_record_provenance"] = {
                    "artifact": selected.get("source_artifact"),
                    "pointer": selected.get("source_pointer"),
                    "source_status": record.get("status"),
                    "prior_review_disposition": record.get("review_disposition"),
                }
                if casevo_override:
                    node["source_record_provenance"]["current_review_disposition"] = CASEVO_SOURCE_REVIEW
                    node["source_record_provenance"]["prior_review_disposition_superseded"] = True
                    node["review_disposition"] = CASEVO_SOURCE_REVIEW
                elif predictive_text_override:
                    node["source_record_provenance"]["current_review_disposition"] = PREDICTIVE_TEXT_SOURCE_REVIEW
                    node["source_record_provenance"]["prior_review_disposition_superseded"] = True
                    node["review_disposition"] = PREDICTIVE_TEXT_SOURCE_REVIEW
                node["meaning"] = meaning or node.get("meaning")
                node["plain_language_meaning"] = meaning or node.get("plain_language_meaning")
                node["why_it_matters"] = task_context or node.get("why_it_matters")
                node["field_context"] = _first_contract_value(
                    record, "meaning_in_domain", "meaning_in_area_and_D078", "meaning_in_area", "meaning_in_D078",
                    "area_context", "coverage", "purpose_and_area_context",
                ) or node.get("field_context")
                node["contextual_use"] = _first_contract_value(record, "contextual_use", "task_use", "what_it_does_for_task") or node.get("contextual_use")
                node["learner_output"] = learner_output or node.get("learner_output")
                node["limitations"] = limitations if isinstance(limitations, list) else ([str(limitations)] if limitations else node.get("limitations", []))
                node["prerequisites"] = prerequisites if isinstance(prerequisites, list) else ([str(prerequisites)] if prerequisites else node.get("prerequisites", []))
                node["valid_alternatives"] = alternatives if isinstance(alternatives, list) else ([str(alternatives)] if alternatives else node.get("valid_alternatives", []))
                node["complements"] = complements if isinstance(complements, list) else ([str(complements)] if complements else node.get("complements", []))
                node["evidence"] = evidence_refs
                node["explanatory_sources"] = explanatory_refs
                node["learning_links"] = learning_refs
                node["source_references"] = evidence_refs + explanatory_refs + learning_refs
                node["area_task_contexts"] = [
                    {"task_family_id": edge.get("source"), "task_family_label": nodes.get(str(edge.get("source")), {}).get("label"),
                     "relationship": edge.get("relationship"), "explanation": edge.get("explanation"),
                     "condition": edge.get("condition"), "source_references": edge.get("source_references", [])}
                    for edge in ready_edges
                ]
                if isinstance(record.get("relationships"), list):
                    node["relationships"] = record["relationships"]

            # A small number of source-backed graph nodes predate the normalized
            # item ledger. Apply only their explicit, item-specific reviewed
            # contract additions; do not infer family membership from labels.
            if contract_override:
                node["meaning"] = meaning
                node["plain_language_meaning"] = meaning
                node["why_it_matters"] = task_context
                node["task_context"] = task_context
                node["learner_output"] = learner_output
                node["limitations"] = limitations if isinstance(limitations, list) else [str(limitations)]
                addendum = VERIFIED_AREA_ITEM_SOURCE_ADDENDA.get(node["id"], {})
                node["evidence"] = _unique_contract_refs((node.get("evidence") or []) + addendum.get("evidence", []))
                node["learning_links"] = _unique_contract_refs((node.get("learning_links") or []) + addendum.get("learning", []))
                node["source_references"] = _unique_contract_refs((node.get("source_references") or []) + node["evidence"] + node["learning_links"])
                if contract_override.get("label"):
                    node["label"] = contract_override["label"]
                if contract_override.get("requirement_lane"):
                    node["requirement_lane"] = contract_override["requirement_lane"]
                    node["requirement_level"] = "optional"
                    node["skippable"] = True
                    node["blocking_policy"] = "never"
                    node["requirement_scope"] = {
                        "lane": contract_override["requirement_lane"],
                        "condition": contract_override.get("task_context"),
                        "skippable": True,
                        "blocks_progression": False,
                        "auto_add": False,
                    }
                if contract_override.get("relationships"):
                    node["relationships"] = contract_override["relationships"]

            approval = "unapproved" if missing else "approved"
            node.update({
                "approval": approval,
                "student_visible": not missing,
                "student_selectable": not missing,
                "student_visibility_reason": "The route candidate is not selectable because these evidence/display fields remain unresolved: " + ", ".join(missing) + "." if missing else None,
                "student_display_disposition": {
                    "decision": approval,
                    "basis": "item-specific source contract and resolved task-family membership audited locally; blanket-hidden workflow status is superseded only when all display gates pass" if not missing else "source contract does not yet satisfy all student-card gates",
                    "missing_fields": missing,
                    "source_artifact": selected.get("source_artifact") if selected else None,
                    "source_pointer": selected.get("source_pointer") if selected else None,
                    "reviewed_on": "2026-11-02",
                },
            })
            if missing:
                node["student_display_disposition"]["prior_review_disposition"] = record.get("review_disposition") if record else None
                if keep_hidden_decision:
                    node["student_visibility_reason"] = (
                        "Source review supports this as an experimental specialist research candidate, but it remains unapproved "
                        "until a bounded use case, access/runtime and license terms, privacy safeguards, and a suitable learning path are verified."
                    )
                    node["student_display_disposition"]["basis"] = (
                        "authoritative/source review completed; unresolved access, runtime, license and privacy checks are a genuine hold, not a stale workflow flag"
                    )
            if casevo_override and not missing:
                node.update({
                    "approval": "approved",
                    "student_visible": True,
                    "student_selectable": True,
                    "requirement_lane": "useful_optional",
                    "requirement_level": "optional",
                    "requirement_reason": "A specialist tool for the selected agent-based social-simulation task; optional and skippable.",
                    "skippable": True,
                    "blocking_policy": "never",
                    "student_visibility_reason": None,
                    "student_display_disposition": {
                        "decision": "approved",
                        "basis": "Casevo performs its documented specialist social-simulation function; official project tutorial, paper, Apache-2.0 license, task link and bounded privacy/validity caveats were reviewed. API-provider access is disclosed as a separate optional dependency.",
                        "reviewed_on": "2026-11-02",
                        "requirement_lane": "useful_optional",
                        "blocking_policy": "never",
                        "historical_hold_superseded": True,
                    },
                })
            candidate_results.append({"id": node["id"], "label": node.get("label"), "area_id": node.get("area_id"), "approval": approval, "missing_fields": missing})

        elif kind == "area_learning_item":
            # These are generic task-set templates, not reviewed learning
            # records. They are physically removed below after every canonical
            # display contract has been reconciled.
            pass

        elif kind == "area_tool_option" and node.get("approval_status") == "approved":
            source = node.get("source_record", {})
            if isinstance(source, dict):
                node["meaning"] = source.get("plainMeaning") or node.get("meaning")
                node["plain_language_meaning"] = source.get("plainMeaning") or node.get("plain_language_meaning")
                node["contextual_use"] = source.get("contextualUse") or node.get("contextual_use")
                node["why_it_matters"] = source.get("contextualUse") or node.get("why_it_matters")
                node["learner_output"] = source.get("expectedOutput") or node.get("learner_output")
                node["prerequisites"] = source.get("prerequisites") or node.get("prerequisites") or []
                node["relationships"] = source.get("relationships") or node.get("relationships") or []
                node["source_references"] = source.get("sourceReferences") or []
                resource = source.get("learningResource") or source.get("learning_resource")
                if isinstance(resource, dict) and resource.get("url"):
                    node["learning_links"] = [{
                        "label": resource.get("title") or source.get("name") or node.get("label"),
                        "url": resource.get("url"), "access": resource.get("access"),
                        "why_this_resource": resource.get("why_this_resource") or resource.get("scope"),
                    }]
                node.update({"approval": "approved", "student_visible": True, "student_selectable": True,
                             "requirement_lane": "useful_optional_edge", "requirement_level": "optional",
                             "skippable": True, "blocking_policy": "never", "recommendation_only": True,
                             "student_visibility_reason": None})
                tool_counts["promoted"] += 1
            else:
                node.update({"approval": "unapproved", "student_visible": False, "student_selectable": False,
                             "student_visibility_reason": "Approved tool record is missing its runtime detail contract."})
                tool_counts["unapproved"] += 1

    # The explanatory-only statistical-tool-choice node may support method
    # selection, but it is not a card the learner can add to the plan.
    for node in graph.get("nodes", []):
        if node.get("kind") == "domain_learning_item" and node.get("approval") == "resolved_explanatory_only":
            node["student_selectable"] = False
            node["student_display_disposition"] = {
                "decision": "unapproved",
                "basis": "explanatory guidance only; not an independently selectable learning item",
                "reviewed_on": "2026-11-02",
            }

    # Keep every persisted copy of a route honest, including component-method
    # variants nested under named combination designs. Selectable arrays contain
    # approved visible cards only; explanatory references remain in their own
    # explicitly named lane. This prevents a stale nested copy from reviving an
    # item removed from the canonical route.
    selectable_fields = (
        "area_item_ids", "task_linked_domain_item_ids", "available_item_ids",
        "domain_downstream_item_ids", "tool_ids", "domain_tool_ids", "role_item_ids",
        "method_specific_role_item_ids",
    )
    def filter_route_item_arrays(value: Any) -> None:
        if isinstance(value, dict):
            for field, child in value.items():
                if field == "nodes":
                    continue
                if field in selectable_fields and isinstance(child, list):
                    value[field] = [item_id for item_id in child
                                    if nodes.get(str(item_id), {}).get("student_visible") is True
                                    and nodes.get(str(item_id), {}).get("student_selectable", True) is not False
                                    and nodes.get(str(item_id), {}).get("approval") != "unapproved"]
                else:
                    filter_route_item_arrays(child)
        elif isinstance(value, list):
            for child in value:
                filter_route_item_arrays(child)

    filter_route_item_arrays(graph)

    # Remove the legacy generic area-item templates from the persisted graph.
    # They have no independent item contract, source-verified learning link,
    # or approved task-family membership. Keeping them merely hidden caused
    # stale placeholder counts and made it possible for later projections to
    # revive them. Canonical area learning is represented by reviewed
    # area_enrichment_item / area_tool_option nodes and explicit family edges.
    removed_area_placeholder_ids = {
        str(node.get("id"))
        for node in graph.get("nodes", [])
        if node.get("kind") == "area_learning_item" and node.get("id")
    }
    if removed_area_placeholder_ids:
        graph["nodes"][:] = [
            node for node in graph.get("nodes", [])
            if str(node.get("id")) not in removed_area_placeholder_ids
        ]
        graph_edges = graph.get("edges", [])
        graph_edges[:] = [
            edge for edge in graph_edges
            if str(edge.get("source")) not in removed_area_placeholder_ids
            and str(edge.get("target")) not in removed_area_placeholder_ids
        ]

        def remove_placeholder_references(value: Any) -> None:
            if isinstance(value, dict):
                for key, child in list(value.items()):
                    if isinstance(child, list):
                        value[key] = [
                            entry for entry in child
                            if not (isinstance(entry, str) and entry in removed_area_placeholder_ids)
                        ]
                        for entry in value[key]:
                            remove_placeholder_references(entry)
                    else:
                        remove_placeholder_references(child)
            elif isinstance(value, list):
                value[:] = [
                    entry for entry in value
                    if not (isinstance(entry, str) and entry in removed_area_placeholder_ids)
                ]
                for entry in value:
                    remove_placeholder_references(entry)

        remove_placeholder_references(graph)

    visible_counts = Counter(
        node.get("kind") for node in graph.get("nodes", [])
        if node.get("student_visible") is True and node.get("student_selectable", True) is not False
    )
    return {
        "domain_items_promoted": domain_counts["promoted"],
        "domain_items_unapproved": domain_counts["unapproved"],
        "approved_area_tool_options_promoted": tool_counts["promoted"],
        "approved_area_tool_options_unapproved": tool_counts["unapproved"],
        "area_enrichment_dispositions": {"approved": sum(row["approval"] == "approved" for row in candidate_results),
                                         "unapproved": sum(row["approval"] == "unapproved" for row in candidate_results)},
        "area_enrichment_missing_field_counts": dict(sorted(Counter(field for row in candidate_results for field in row["missing_fields"]).items())),
        "area_enrichment_item_dispositions": candidate_results,
        "generic_area_learning_placeholders_removed": len(removed_area_placeholder_ids),
        "generic_area_learning_placeholder_nodes_remaining": sum(
            node.get("kind") == "area_learning_item" for node in graph.get("nodes", [])
        ),
        "visible_selectable_node_counts_by_kind": dict(sorted(visible_counts.items())),
    }


def apply_area_task_item_link_addenda(
    graph: dict[str, Any], task_sets: dict[str, Any],
) -> dict[str, Any]:
    """Materialize explicit local task-concept -> canonical item links.

    The source task set describes these learning concepts in prose and the
    normalized graph already has reviewed, selectable canonical cards for
    them. This narrow crosswalk records the exact source pointers and preserves
    the cards' existing requirement lanes; it does not create new items or
    claim any prerequisite/order relationship.
    """
    nodes = {node["id"]: node for node in graph.get("nodes", [])}
    edges = graph.setdefault("edges", [])
    area_sets = task_sets.get("area_task_sets", [])
    applied: list[dict[str, str]] = []

    for link in AREA_TASK_ITEM_LINK_ADDENDA:
        family = nodes.get(link["family_id"])
        item = nodes.get(link["item_id"])
        if not family or family.get("kind") != "area_task_family":
            raise SystemExit(f"Area task-item addendum has no canonical family: {link['family_id']}")
        if not item or item.get("kind") != "area_enrichment_item":
            raise SystemExit(f"Area task-item addendum has no canonical learning item: {link['item_id']}")
        if item.get("area_id") != family.get("area_id"):
            raise SystemExit(f"Cross-area task-item link is not allowed: {link['family_id']} -> {link['item_id']}")
        if not (item.get("approval") == "approved" and item.get("student_visible") is True
                and item.get("student_selectable") is True):
            raise SystemExit(f"Area task-item addendum target is not an approved selectable card: {link['item_id']}")

        source_record = None
        source_pointer = None
        for area_index, area in enumerate(area_sets):
            if area.get("area_id") != family.get("area_id"):
                continue
            for bucket in ("task_families", "additional_task_families"):
                for family_index, record in enumerate(area.get(bucket, [])):
                    if _normalise_family_key(record.get("task_id") or record.get("task_family_id")) != _normalise_family_key(link["source_task_id"]):
                        continue
                    relationships = record.get("learning_item_relationships", [])
                    matched = [
                        (relationship_index, relationship)
                        for relationship_index, relationship in enumerate(relationships)
                        if _normalise_label(relationship.get("label")) in {
                            _normalise_label(label) for label in link["relationship_labels"]
                        }
                    ]
                    if not matched:
                        continue
                    source_record = record
                    artifact = ROLE_TASK_SET_PATH.relative_to(ROOT).as_posix()
                    source_pointer = [
                        _source_pointer(
                            artifact,
                            f"$/area_task_sets/{area_index}/{bucket}/{family_index}/learning_item_relationships/{relationship_index}",
                            "D078 task-family learning-item relationship",
                            "area_task_item_relationship_evidence",
                        )
                        for relationship_index, _ in matched
                    ]
                    break
                if source_record:
                    break
            if source_record:
                break
        if source_record is None or not source_pointer:
            raise SystemExit(
                f"No exact internal learning-item relationship supports {link['family_id']} -> {link['item_id']}"
            )

        family_refs = _family_source_refs(family, task_sets)
        item_refs = [
            {**reference, "source_role": reference.get("source_role") or "area_item_evidence"}
            for reference in (item.get("evidence", []) + item.get("learning_links", []))
            if isinstance(reference, dict) and (reference.get("url") or reference.get("locator"))
        ]
        refs = _unique_contract_refs(source_pointer + family_refs + item_refs)
        if not refs:
            raise SystemExit(f"Area task-item link has no relationship evidence: {link['family_id']} -> {link['item_id']}")

        edge_id = f"reviewed-local-task-item:{link['family_id']}->{link['item_id']}"
        edge = {
            "id": edge_id,
            "source": link["family_id"],
            "target": link["item_id"],
            "area_id": family["area_id"],
            "relationship": "task_has_area_learning_item",
            "status": "resolved_ready_for_use",
            "student_visible": True,
            "recommendation_only": True,
            "requirement_lane": item.get("requirement_lane", "useful_optional"),
            "blocking_policy": "never",
            "sequence_policy": "none",
            "evidence_basis": "reviewed_internal_task_learning_concept_to_existing_canonical_item",
            "evidence_source_ids": sorted({reference["id"] for reference in refs if reference.get("id")}),
            "source_references": refs,
            "condition": link["condition"],
            "fit_claim_limit": "This relationship places an existing optional learning item in the stated task context. It does not make the item compulsory, create a prerequisite, or claim the item is needed in every route.",
            "explanation": link["explanation"],
        }
        edges[:] = [candidate for candidate in edges if candidate.get("id") != edge_id]
        edges.append(edge)
        contexts = item.setdefault("area_task_contexts", [])
        contexts[:] = [context for context in contexts if context.get("task_family_id") != link["family_id"]]
        contexts.append({
            "task_family_id": link["family_id"],
            "task_family_label": family.get("label"),
            "relationship": "task_has_area_learning_item",
            "explanation": link["explanation"],
            "condition": link["condition"],
            "source_references": refs,
        })
        applied.append({"edge_id": edge_id, "family_id": link["family_id"], "item_id": link["item_id"]})

    result = {
        "date": "2026-11-07",
        "status": "locally_reconciled_from_existing_task_and_item_contracts",
        "applied_count": len(applied),
        "links": applied,
        "creates_new_learning_items": False,
        "creates_prerequisites_or_order": False,
        "external_search_needed": False,
    }
    graph["area_task_item_link_addenda"] = result
    return result


def _sequence_source_refs(record: dict[str, Any], extra_refs: list[dict[str, str]] | None = None) -> list[dict[str, str]]:
    refs: dict[tuple[str, str, str], dict[str, str]] = {}
    for locator in record.get("evidence_locators", []):
        if not isinstance(locator, dict):
            continue
        url = str(locator.get("url") or "")
        if url:
            row = {
                "id": str(locator.get("source_id") or locator.get("id") or "external:" + url),
                "title": str(locator.get("title") or locator.get("publisher") or "External source"),
                "url": url,
                "locator": str(locator.get("locator") or "Source locator recorded on the sequence disposition."),
                "source_role": "sequence_evidence",
            }
        elif locator.get("artifact"):
            artifact = str(locator["artifact"])
            pointer = str(locator.get("pointer") or locator.get("reference_id") or locator.get("section") or "")
            row = _source_pointer(artifact, pointer, "D078 sequence disposition", "sequence_design_record")
        else:
            continue
        refs[(row["id"], row["url"], row["locator"])] = row
    for row in extra_refs or []:
        refs[(row["id"], row["url"], row["locator"])] = row
    return list(refs.values())


def reconcile_area_sequence(graph: dict[str, Any]) -> dict[str, Any]:
    """Apply reviewed prerequisites and source-validated workflow ordering only."""
    disposition = load_json_or_gzip(SEQUENCE_DISPOSITION_PATH)
    workflow_approvals = load_json_or_gzip(ROUTE_SEQUENCE_WORKFLOW_APPROVALS_PATH)
    node_ids = {node["id"] for node in graph.get("nodes", [])}
    edges = graph.setdefault("edges", [])
    replace_ids = {
        str(row.get("id")) for row in disposition.get("approved_sequence_edges", [])
    } | {
        str(row.get("id")) for row in disposition.get("direct_area_order_dispositions", [])
        if row.get("sequence_policy") == "workflow"
    }
    edges[:] = [edge for edge in edges if edge.get("id") not in replace_ids and not str(edge.get("id", "")).startswith("area-sequence:")]

    applied_approved = 0
    sequence_endpoint_aliases = {
        # Retired Economics Casevo card resolves to the canonical area-stage
        # tool identity; the sequence decision must target the selectable node.
        "area_enrichment_item:d078-econ-casevo-llm-sim": "domain-item:d078-casevo-tool",
    }
    for record in disposition.get("approved_sequence_edges", []):
        source_id = str(record.get("source_item_id") or "")
        target_id = sequence_endpoint_aliases.get(str(record.get("target_item_id") or ""), str(record.get("target_item_id") or ""))
        if source_id not in node_ids or target_id not in node_ids:
            raise SystemExit(f"Approved area sequence endpoint is missing: {source_id} -> {target_id}")
        refs = _sequence_source_refs(record)
        if not refs:
            raise SystemExit(f"Approved area sequence has no inspectable source locator: {record.get('id')}")
        edges.append({
            "id": f"area-sequence:{record['id']}",
            "source": source_id,
            "target": target_id,
            "relationship": "prerequisite_for",
            "status": "resolved_ready_for_use",
            "student_visible": True,
            "sequence_approved": True,
            "sequence_policy": "conditional_prerequisite",
            "sequence_scope": record.get("route_scope"),
            "condition": record.get("condition"),
            "recommendation_only": True,
            "blocking_policy": "never",
            "evidence_basis": "approved_route_scoped_sequence_disposition_plus_external_or_internal_sources",
            "evidence_source_ids": sorted({ref["id"] for ref in refs}),
            "source_references": refs,
            "explanation": record.get("rationale") or record.get("sequence_direction"),
            "fit_claim_limit": "This order applies only to the stated route and condition. It does not block progression, require a software package, or force a learner to repeat prior knowledge.",
        })
        applied_approved += 1

    applied_workflows = 0
    for record in disposition.get("direct_area_order_dispositions", []):
        if record.get("sequence_policy") != "workflow":
            continue
        source_id = str(record.get("source_item_id") or "")
        target_id = str(record.get("target_item_id") or "")
        if source_id not in node_ids or target_id not in node_ids:
            raise SystemExit(f"Area workflow sequence endpoint is missing: {source_id} -> {target_id}")
        refs = _sequence_source_refs(record, WORKFLOW_SEQUENCE_EVIDENCE.get(str(record.get("id")), []))
        if not refs or not any(ref.get("url") for ref in refs):
            raise SystemExit(f"Workflow order lacks external source evidence: {record.get('id')}")
        conditions = {
            "direct-area-order:02": "When interpreting a selected survey dataset, first review its question wording, sample and collection method; you do not need to have designed or collected the survey yourself.",
            "direct-area-order:16": "Use this order for demographic questions where measures are needed to interpret migration, urbanisation or population change; it is not required for every human-geography task.",
            "direct-area-order:18": "Frame the research question before deciding what sample and measures can answer it; these activities can be learned together.",
            "direct-area-order:20": "Use this order when the evaluation uses a programme theory or logic model; a descriptive review may not need one.",
            "direct-area-order:24": "Use this order when the selected route fits a statistical model to a dataset; cleaning and model interpretation can be taught together.",
        }
        edge_id = f"area-sequence:{record['id']}"
        edges.append({
            "id": edge_id,
            "source": source_id,
            "target": target_id,
            "relationship": "builds_on",
            "status": "resolved_ready_for_use",
            "student_visible": True,
            "sequence_approved": True,
            "sequence_policy": "workflow",
            "sequence_scope": str(record.get("rationale") or "D078 area workflow"),
            "condition": conditions[str(record["id"])],
            "recommendation_only": True,
            "blocking_policy": "never",
            "evidence_basis": "local_workflow_review_plus_external_method_guidance",
            "evidence_source_ids": sorted({ref["id"] for ref in refs}),
            "source_references": refs,
            "explanation": str(record.get("rationale") or "This is the usual workflow for the selected task, not a universal learning prerequisite."),
            "fit_claim_limit": "Recommended workflow order for the stated task condition only; it is not a compulsory prerequisite and can be learned together where appropriate.",
        })
        applied_workflows += 1

    # The 27-declaration audit contains several real task-workflow safeguards
    # that are not course prerequisites. Promote only the newly resolved exact
    # item pairs recorded in the dated approval ledger. Each remains skippable
    # and non-blocking; this is how the graph exposes the recommended order
    # without pretending every learner must study every selectable item.
    existing_dispositions = {str(row.get("id")): row for row in disposition.get("direct_area_order_dispositions", [])}
    applied_additional_workflows = 0
    for record in workflow_approvals.get("approvals", []):
        edge_id = str(record.get("id") or "")
        source_id = str(record.get("source_item_id") or "")
        target_id = str(record.get("target_item_id") or "")
        if not edge_id or not source_id or not target_id:
            raise SystemExit(f"Incomplete route workflow approval record: {record}")
        if source_id not in node_ids or target_id not in node_ids:
            raise SystemExit(f"Approved route workflow endpoint is missing: {source_id} -> {target_id}")
        refs = [dict(ref, source_role="sequence_evidence") for ref in record.get("sources", [])
                if isinstance(ref, dict) and str(ref.get("url") or "").startswith("https://")]
        if not refs:
            raise SystemExit(f"Approved route workflow has no external source: {edge_id}")
        original_id = edge_id.removesuffix("-reversed").removesuffix("-workflow")
        original = existing_dispositions.get(original_id)
        if not original:
            raise SystemExit(f"Workflow approval does not resolve to a reviewed declaration: {edge_id}")
        if edge_id.endswith("-reversed") and source_id != original.get("target_item_id"):
            raise SystemExit(f"Reversed workflow does not reverse the reviewed pair: {edge_id}")
        if not edge_id.endswith("-reversed") and source_id != original.get("source_item_id"):
            raise SystemExit(f"Workflow source differs from the reviewed declaration: {edge_id}")
        edges.append({
            "id": f"area-sequence:{edge_id}",
            "source": source_id,
            "target": target_id,
            "relationship": "builds_on",
            "status": "resolved_ready_for_use",
            "student_visible": True,
            "sequence_approved": True,
            "sequence_policy": "workflow",
            "sequence_scope": str(original.get("scope") or "D078 route-scoped task workflow"),
            "condition": str(record["condition"]),
            "recommendation_only": True,
            "blocking_policy": "never",
            "evidence_basis": "reviewed_route_workflow_disposition_with_external_source_check",
            "evidence_source_ids": sorted({str(ref.get("id")) for ref in refs}),
            "source_references": refs,
            "explanation": str(record["rationale"]),
            "fit_claim_limit": "Recommended task workflow only. It is not a compulsory learning prerequisite; the learner may skip or already know an item, and other valid methods remain available.",
        })
        applied_additional_workflows += 1

    # Verify that the ordered area-learning subgraph is acyclic.
    ordered_edges = [edge for edge in edges if str(edge.get("id", "")).startswith("area-sequence:")]
    adjacency: dict[str, list[str]] = defaultdict(list)
    indegree = {node_id: 0 for node_id in node_ids}
    for edge in ordered_edges:
        adjacency[edge["source"]].append(edge["target"])
        indegree[edge["target"]] += 1
    queue = [node_id for node_id, degree in indegree.items() if degree == 0]
    visited = 0
    while queue:
        current = queue.pop()
        visited += 1
        for target in adjacency[current]:
            indegree[target] -= 1
            if indegree[target] == 0:
                queue.append(target)
    if visited != len(node_ids):
        raise SystemExit("Approved D078 area sequence edges introduce a cycle")
    return {
        "approved_conditional_prerequisites_applied": applied_approved,
        "externally_supported_recommended_workflows_applied": applied_workflows,
        "additional_route_scoped_workflows_applied": applied_additional_workflows,
        "workflow_approval_source_artifact": str(ROUTE_SEQUENCE_WORKFLOW_APPROVALS_PATH.relative_to(ROOT)).replace("\\", "/"),
        "area_sequence_edges_total": len(ordered_edges),
        "cycle_check_passed": True,
        "other_area_relationship_dispositions_remain_non_sequence": sum(
            row.get("sequence_policy") != "workflow" for row in disposition.get("direct_area_order_dispositions", [])
        ),
    }


def annotate_role_sequence_contract(graph: dict[str, Any]) -> dict[str, Any]:
    """Separate ordered role-route context from item-to-item dependencies."""
    role_items = [node for node in graph.get("nodes", []) if node.get("kind") == "role_item_candidate"]
    eligible = [node for node in role_items if node.get("student_visible") is True]
    by_lane: dict[str, int] = defaultdict(int)
    for node in eligible:
        lane = str(node.get("requirement_lane") or "unclassified")
        by_lane[lane] += 1
        node["role_sequence_status"] = "ordered_role_task_context; no_item_pair_order_established"
        # Sequence approval belongs to relationship edges, not item nodes.
        # Remove legacy node-level false flags so they cannot be mistaken for
        # a failure of the role's upstream route ordering.
        node.pop("sequence_policy", None)
        node.pop("sequence_approved", None)
        node["sequence_explanation"] = (
            "This optional item appears only after the selected area route, role, and reviewed role-task context. "
            "The route context is ordered; sources have not established that this item must come before or after "
            "another item in the same task group. Choose or skip it within that context, and compare any linked alternatives."
        )
    graph["role_learning_sequence_contract"] = {
        "version": "d078-role-sequence-contract-2026-11-14-v2",
        "role_context_order": [
            "carry the selected D078 domain and method or named design into a supported area",
            "show any reviewed area foundation before that area's task-family choices",
            "show the selected area's task-family context and only roles linked to that context",
            "inside each selected role, show role items under their reviewed role task family or an evidence-backed role foundation",
            "keep role tools under the role task they support; never surface role items as a detached pool",
        ],
        "role_item_lane_counts": dict(sorted(by_lane.items())),
        "eligible_role_item_count": len(eligible),
        "approved_role_item_dependency_edges": 0,
        "role_items_are_method_specific": False,
        "item_order_policy": "Role progression is ordered by selected area route -> role choice -> reviewed role-task context -> that context's role items and tools. Within one role-task group, only exact reviewed sequence edges order item pairs; all other items are skippable choices in that ordered context. Zero item-pair edges is an explicit source-reviewed disposition, not a missing role route or a stale route-order flag.",
        "role_task_context_policy": "A selected area work focus may explain a role task only through a reviewed family-to-role-task edge. Every visible role item must continue through the selected domain -> method/design -> area -> role -> reviewed role task/foundation path. Role-task context is not a qualification, job-readiness finding or universal employer task list.",
        "role_item_placement_policy": "Embed a role item under its reviewed role task family. Use a role foundation only when evidence shows it applies across the relevant role tasks. If neither route is supported, keep the item out of student selection; do not create a general standalone role-item lane.",
        "role_foundation_node_count": sum(1 for node in graph.get("nodes", []) if node.get("kind") == "role_foundation" and node.get("student_visible") is True),
        "all_role_items_skippable": all(node.get("skippable") is True and node.get("blocking_policy") == "never" for node in eligible),
        "role_path_complete_without_optional_role_item": True,
    }
    return graph["role_learning_sequence_contract"]


def reconcile_role_prerequisites(graph: dict[str, Any]) -> dict[str, Any]:
    """Audit role-wide foundations and item preparation notes without guessing order."""
    task_sets = load_json_or_gzip(ROLE_TASK_SET_PATH)
    role_ledger = load_json_or_gzip(ROLE_ITEM_RECONCILIATION_PATH)
    nodes = {str(node.get("id")): node for node in graph.get("nodes", [])}
    edges = graph.get("edges", [])
    role_nodes = {
        node_id: node for node_id, node in nodes.items()
        if node.get("kind") == "role"
    }
    role_ids_by_slug = {node_id.rsplit(":", 1)[-1]: node_id for node_id in role_nodes}
    task_rows_by_slug = {
        str(row.get("role_key", "")).split(":")[-1]: row
        for row in task_sets.get("role_task_sets", [])
    }
    role_item_edges = [edge for edge in edges if edge.get("relationship") == "role_task_supports_role_item"]
    area_role_task_edges = [edge for edge in edges if edge.get("relationship") == "area_task_family_supports_role_task"]
    task_role_edges = [edge for edge in edges if edge.get("relationship") == "role_task_family_of_role"]
    visible_foundations = [
        node for node in nodes.values()
        if node.get("kind") == "role_foundation" and node.get("student_visible") is True
    ]
    item_records = role_ledger.get("records", [])
    note_count = sum(len(row.get("prerequisites") or []) for row in item_records)
    distinct_notes = {
        str(note).strip()
        for row in item_records
        for note in (row.get("prerequisites") or [])
        if str(note).strip()
    }
    generic_task_conditions = {
        str(note).strip()
        for row in task_sets.get("role_task_sets", [])
        for task in row.get("task_families", [])
        for note in (task.get("prerequisites") or [])
        if str(note).strip()
    }
    sequence_candidate_note_dispositions = [
        {
            "queue_position": 77,
            "role_item_id": "role-item:77:carry-out-strategic-research-optional",
            "source_url": "https://documents.worldbank.org/en/publication/documents-reports/documentdetail/763491468313739403/local-economic-development-a-primer-developing-and-implementing-local-economic-development-strategies-and-action-plans",
            "decision": "work_process_context_not_role_learning_prerequisite",
            "reason": "The source connects local economic assessment to strategy/action planning, but the graph has no exact source-backed prior-learning node for this role item; retain the note as context.",
        },
        {
            "queue_position": 82,
            "role_item_id": "role-item:82:computer-simulation-optional",
            "source_url": "https://nptel.ac.in/courses/110105089",
            "decision": "resource_course_sequence_not_role_task_prerequisite",
            "reason": "The source has a lecture sequence for its simulation course. That may inform presentation inside the resource, but it does not establish a prerequisite edge into the statistician role task or an exact prerequisite graph target.",
        },
        {
            "queue_position": 119,
            "role_item_id": "role-item:119:excavation-techniques-essential",
            "source_url": "https://www.nps.gov/articles/how-do-archeologists-work.htm",
            "decision": "conditional_fieldwork_workflow_not_learning_prerequisite",
            "reason": "The source describes survey/excavation/recording stages, but the prerequisite note has no exact matching archaeological-survey node on the current D078 route; the current area-task-to-archaeologist context is explicitly bounded to documentary evidence. Do not link the unrelated surveying item as a substitute.",
        },
    ]

    per_role: list[dict[str, Any]] = []
    for slug, role_id in sorted(role_ids_by_slug.items()):
        task_ids = [
            node_id for node_id, node in nodes.items()
            if node.get("kind") == "role_task_family" and node.get("role_id") == role_id
        ]
        task_id = task_ids[0] if len(task_ids) == 1 else None
        item_ids = sorted({
            str(edge.get("target")) for edge in role_item_edges
            if edge.get("source") == task_id
        }) if task_id else []
        area_task_ids = sorted({
            str(edge.get("source")) for edge in area_role_task_edges
            if edge.get("target") == task_id
        }) if task_id else []
        item_note_count = sum(
            len(nodes[item_id].get("preparation_context_notes", []))
            for item_id in item_ids if item_id in nodes
        )
        row = task_rows_by_slug.get(slug, {})
        per_role.append({
            "role_id": role_id,
            "role_label": str(role_nodes[role_id].get("label") or slug),
            "role_task_context_node_id": task_id,
            "selected_area_task_context_ids": area_task_ids,
            "selectable_role_item_ids": item_ids,
            "role_item_preparation_note_count": item_note_count,
            "source_task_family_count": len(row.get("task_families", [])),
            "separate_role_foundation_before_task": "not_supported_by_reviewed_sequence_evidence",
            "entry_rule": "Continue from the selected supported area/task context into this role task context; show role-owned choices within the selected role route.",
            "decision_status": "audited_direct_context_continuation_no_fabricated_role_foundation",
        })

    missing_routes = [
        row["role_id"] for row in per_role
        if not row["role_task_context_node_id"] or not row["selected_area_task_context_ids"]
    ]
    if missing_routes:
        raise SystemExit(f"Role prerequisite audit found roles without a supported area/task context: {missing_routes}")
    if len(per_role) != 19 or len(visible_foundations) != 0:
        raise SystemExit(
            f"Unexpected role prerequisite audit scope: roles={len(per_role)}, visible foundations={len(visible_foundations)}"
        )

    approved_role_sequence_edges = sum(
        1 for edge in edges
        if edge.get("sequence_approved") is True
        and edge.get("relationship") in {"prerequisite_for", "requires", "precedes", "builds_on"}
        and any(str(endpoint or "").startswith(("role-task:", "role-item:", "role-foundation:"))
                for endpoint in (edge.get("source"), edge.get("target")))
    )
    result = {
        "date": "2026-11-03",
        "status": "reviewed_role_foundation_and_item_preparation_notes_dispositioned",
        "role_task_set_source": str(ROLE_TASK_SET_PATH.relative_to(ROOT)).replace("\\", "/"),
        "role_item_source": str(ROLE_ITEM_RECONCILIATION_PATH.relative_to(ROOT)).replace("\\", "/"),
        "role_task_records_in_source": len(task_sets.get("role_task_sets", [])),
        "current_d078_roles_reviewed": len(per_role),
        "area_task_to_role_task_context_edges": len(area_role_task_edges),
        "role_task_to_role_edges": len(task_role_edges),
        "role_task_to_role_item_context_edges": len(role_item_edges),
        "role_item_records_reviewed": len(item_records),
        "role_item_preparation_notes_preserved": note_count,
        "distinct_role_item_preparation_notes": len(distinct_notes),
        "distinct_generic_role_task_condition_notes": len(generic_task_conditions),
        "sequence_candidate_note_dispositions": sequence_candidate_note_dispositions,
        "visible_role_foundation_nodes": len(visible_foundations),
        "approved_role_learning_dependency_edges": approved_role_sequence_edges,
        "decision": "For the current graph, the role stage continues from the selected area/task context. A separate role-wide foundation is not source-supported. Item preparation notes are preserved as context, not turned into prerequisite edges. Add an order edge only when the exact target, route condition, and source-backed before/after relationship are reviewed.",
        "external_methodology_sources": [
            {
                "title": "European Commission ESCO Classification",
                "url": "https://esco.ec.europa.eu/en/classification",
                "locator": "Occupation concepts and skill/knowledge concepts are organized and linked; this taxonomy record does not establish D078 learning order.",
            },
            {
                "title": "European Commission ESCO Handbook",
                "url": "https://esco.ec.europa.eu/system/files/2021-07/Handbook.pdf",
                "locator": "Part I, skill contextualisation and skills-pillar structure: occupational links, skill/knowledge concepts and relationships; occupational membership is not a temporal learning prerequisite.",
            },
            {
                "title": "O*NET OnLine, Sociologists",
                "url": "https://www.onetonline.org/link/summary/19-3041.00",
                "locator": "Tasks and occupational requirements describe work activities; they do not state a D078 course sequence.",
            },
            {
                "title": "O*NET OnLine, Anthropologists and Archeologists",
                "url": "https://www.onetonline.org/link/details/19-3091.00",
                "locator": "Tasks, knowledge, education and experience are separate occupational profile sections; they do not specify a D078 learning sequence.",
            },
        ],
        "per_role_decisions": per_role,
        "alternatives_and_ui_progression_are_out_of_scope": True,
    }
    graph["role_prerequisite_reconciliation"] = result
    graph["role_sequence_reconciliation"] = {
        **graph.get("role_sequence_reconciliation", {}),
        "date": "2026-11-03",
        "prerequisite_audit_status": result["status"],
        "role_route_edges_remain_contextual_not_prerequisites": True,
    }
    contract = graph.setdefault("role_learning_sequence_contract", {})
    contract.update({
        "role_foundation_audit_status": result["status"],
        "role_foundation_node_count": len(visible_foundations),
        "role_prerequisite_note_count": note_count,
        "role_prerequisite_note_policy": "Preparation notes are preserved under the exact role item as context, not turned into a universal order or blocker. Add a typed prerequisite/workflow edge only with an exact target, route condition and source that supports the relationship.",
    })
    return result


def reconcile_d078_alternative_contracts(graph: dict[str, Any]) -> dict[str, Any]:
    """Make alternative selection depend on a real endpoint pair and evidence.

    Free-text alternatives remain useful explanations, but are not silently
    converted into learning nodes. Only typed edges with canonical endpoints,
    a bounded explanation and relationship-specific evidence may affect choice
    visibility or comparison.
    """
    nodes = {str(node.get("id")): node for node in graph.get("nodes", [])}
    edges = graph.get("edges", [])
    alternative_types = {"alternative_to", "alternative_tool_option", "tool_alternative_for_role_task"}

    def ref_rows(value: Any, role: str, endpoint: str | None = None) -> list[dict[str, Any]]:
        rows = value if isinstance(value, list) else [value]
        result: list[dict[str, Any]] = []
        for row in rows:
            if isinstance(row, str):
                row = {"url": row}
            if not isinstance(row, dict):
                continue
            url = str(row.get("url") or row.get("source_url") or "").strip()
            locator = str(row.get("locator") or row.get("exact_locator") or "").strip()
            if not url.startswith("https://") and not locator:
                continue
            reference = dict(row)
            reference["source_role"] = role
            if endpoint:
                reference["endpoint"] = endpoint
            result.append(reference)
        return result

    # The area source record names this exact R/Python pair as alternative
    # workflows. Resolve the source slug to the canonical area-owned Python
    # item and materialize the relationship once, without making either a
    # prerequisite or exclusive choice.
    r_workflow_id = "area_enrichment_item:d078-computational-digital-social-science-r-social-data-workflow"
    python_workflow_id = "area_enrichment_item:d078-computational-digital-social-science-python-social-data-workflow"
    alt_id = f"alternative_reviewed:{r_workflow_id}->{python_workflow_id}"
    edges[:] = [edge for edge in edges if edge.get("id") != alt_id]
    if r_workflow_id in nodes and python_workflow_id in nodes and not any(
        edge.get("source") == r_workflow_id and edge.get("target") == python_workflow_id
        and edge.get("relationship") == "alternative_to" for edge in edges
    ):
        r_node, python_node = nodes[r_workflow_id], nodes[python_workflow_id]
        refs: list[dict[str, Any]] = []
        for endpoint_id, endpoint in ((r_workflow_id, r_node), (python_workflow_id, python_node)):
            for field in ("source_references", "evidence", "learning_links", "resources"):
                refs.extend(ref_rows(endpoint.get(field), "alternative_relationship_evidence", endpoint_id))
        if any(ref.get("endpoint") == r_workflow_id for ref in refs) and any(ref.get("endpoint") == python_workflow_id for ref in refs):
            edges.append({
                "id": alt_id,
                "source": r_workflow_id,
                "target": python_workflow_id,
                "relationship": "alternative_to",
                "status": "resolved_ready_for_use",
                "student_visible": True,
                "selectable": True,
                "evidence_basis": "source_backed_alternative_relationship",
                "source_references": refs,
                "explanation": "R and Python are two programming workflows that can support social-science data analysis. Choose the one that fits the task, available skills and reproducibility needs; learning both is optional, not a required sequence.",
                "alternative_review_disposition": "approved",
                "alternative_is_exclusive": False,
                "requirement_lane": "useful_optional",
                "blocking_policy": "never",
                "sequence_policy": "none",
                "source_note_pointer": f"{r_workflow_id}/relationships/0",
            })

    # Replace placeholder targets in the method catalogue with canonical
    # method nodes where the local source note names a real comparison. Keep
    # broad/computational and simulation-vs-empirical notes unresolved because
    # they are not true alternative learning nodes in every use case.
    method_comparisons = {
        "domain-item:d078-quantitative-approach": [
            ("domain-item:d078-qualitative-approach",
             "Quantitative and qualitative approaches answer questions with different forms of evidence. A learner may choose one as the main approach, or combine both through a named mixed-methods design when the question needs their integration.",
             "https://obssr.od.nih.gov/sites/g/files/mnhszr296/files/Best_Practices_for_Mixed_Methods_Research.pdf",
             "The guidance distinguishes single-method and mixed-method research and describes intentional combination/integration of quantitative and qualitative evidence."),
        ],
        "domain-item:d078-qualitative-approach": [
            ("domain-item:d078-quantitative-approach",
             "Qualitative and quantitative approaches answer questions with different forms of evidence. A learner may choose one as the main approach, or combine both through a named mixed-methods design when the question needs their integration.",
             "https://ukdataservice.ac.uk/help/data-types/qualitative-mixed-methods/",
             "UK Data Service describes mixed methods as combining qualitative and quantitative data within one project; the two approaches are distinct but may be deliberately integrated."),
        ],
        "domain-item:d078-survey-method": [
            ("domain-item:d078-interviews", "A survey, interview, observation or existing-data route may answer a question using different evidence. Choose by the question and data needed; these routes can also be combined when the design explains why.", "https://www.ncbi.nlm.nih.gov/books/NBK390304/", "In brief: study types include observational studies, surveys and interviews; the research question guides the choice."),
            ("domain-item:d078-observation-ethnography", "A survey, interview, observation or existing-data route may answer a question using different evidence. Choose by the question and data needed; these routes can also be combined when the design explains why.", "https://ukdataservice.ac.uk/app/uploads/teachingresourcenon-interviewmethods.pdf", "UK Data Service teaching resource distinguishes interview and non-interview qualitative collection methods and their different evidence forms."),
            ("domain-item:d078-secondary-data", "A survey, interview, observation or existing-data route may answer a question using different evidence. Choose by the question and data needed; these routes can also be combined when the design explains why.", "https://ukdataservice.ac.uk/help/data-types/qualitative-mixed-methods/", "UK Data Service describes qualitative evidence sources and mixed collections; the evidence source must fit the research question."),
        ],
        "domain-item:d078-document-analysis": [
            ("domain-item:d078-interviews", "Documents, interviews, surveys and observation provide different kinds of evidence. A learner can compare them as possible routes, or combine them when the question and design justify using more than one.", "https://ukdataservice.ac.uk/app/uploads/teachingresourcenon-interviewmethods.pdf", "UK Data Service teaching resource describes non-interview methods as distinct collection approaches; interviews are treated separately."),
            ("domain-item:d078-survey-method", "Documents, interviews, surveys and observation provide different kinds of evidence. A learner can compare them as possible routes, or combine them when the question and design justify using more than one.", "https://ukdataservice.ac.uk/help/data-types/qualitative-mixed-methods/", "UK Data Service lists interviews, field notes, observations, open-ended survey responses and other evidence sources, and describes combining them."),
            ("domain-item:d078-observation-ethnography", "Documents, interviews, surveys and observation provide different kinds of evidence. A learner can compare them as possible routes, or combine them when the question and design justify using more than one.", "https://ukdataservice.ac.uk/app/uploads/teachingresourcenon-interviewmethods.pdf", "UK Data Service teaching resource covers qualitative non-interview approaches and distinguishes them from interview data."),
        ],
        "domain-item:d078-observation-ethnography": [
            ("domain-item:d078-survey-method", "Observation, surveys and interviews answer questions with different evidence. They are comparison choices, not mutually exclusive requirements; combine them only when the research design explains how they work together.", "https://ukdataservice.ac.uk/app/uploads/teachingresourcenon-interviewmethods.pdf", "UK Data Service distinguishes observational/non-interview qualitative collection from interviews and other data sources."),
            ("domain-item:d078-interviews", "Observation, surveys and interviews answer questions with different evidence. They are comparison choices, not mutually exclusive requirements; combine them only when the research design explains how they work together.", "https://ukdataservice.ac.uk/help/data-types/qualitative-mixed-methods/", "UK Data Service describes interviews and observation/field notes as distinct qualitative evidence forms that may be combined."),
        ],
    }
    placeholder_sources = {
        "domain-item:d078-quantitative-approach": "concept:relationship_target:qualitative-approach",
        "domain-item:d078-qualitative-approach": "concept:relationship_target:quantitative-approach",
        "domain-item:d078-survey-method": "concept:relationship_target:interviews-observation-or-existing-data",
        "domain-item:d078-document-analysis": "concept:relationship_target:interview-survey-or-observation",
        "domain-item:d078-observation-ethnography": "concept:relationship_target:survey-or-interview",
    }
    for source_id, placeholder_id in placeholder_sources.items():
        edges[:] = [edge for edge in edges if not (
            edge.get("source") == source_id and edge.get("target") == placeholder_id
            and edge.get("relationship") == "alternative_to"
        )]
        for target_id, explanation, source_url, source_locator in method_comparisons[source_id]:
            edge_id = f"alternative_reviewed:{source_id}->{target_id}"
            edges[:] = [edge for edge in edges if edge.get("id") != edge_id]
            if source_id not in nodes or target_id not in nodes:
                continue
            pair_refs: list[dict[str, Any]] = []
            for endpoint_id, endpoint in ((source_id, nodes[source_id]), (target_id, nodes[target_id])):
                for field in ("source_references", "evidence", "learning_links", "resources"):
                    pair_refs.extend(ref_rows(endpoint.get(field), "alternative_relationship_evidence", endpoint_id))
            if source_url:
                pair_refs.append({
                    "url": source_url,
                    "title": (
                        "NIH Office of Behavioral and Social Sciences Research, Best Practices for Mixed Methods Research"
                        if "nih.gov" in source_url
                        else "UK Data Service, Teaching resource: Non-interview methods"
                        if "non-interviewmethods" in source_url
                        else "UK Data Service, Qualitative mixed methods"
                        if "ukdataservice.ac.uk" in source_url
                        else "National Library of Medicine, In brief: What types of studies are there?"
                    ),
                    "locator": source_locator,
                    "source_role": "alternative_relationship_evidence",
                })
            edges.append({
                "id": edge_id,
                "source": source_id,
                "target": target_id,
                "relationship": "alternative_to",
                "status": "resolved_ready_for_use",
                "student_visible": True,
                "selectable": True,
                "evidence_basis": "source_backed_alternative_relationship",
                "source_references": pair_refs,
                "explanation": explanation,
                "alternative_review_disposition": "approved",
                "alternative_is_exclusive": False,
                "comparison_context": "method_choice_not_mutual_exclusion",
                "blocking_policy": "never",
                "sequence_policy": "none",
            })

    # The reviewed Psychology area source explicitly names two same-area tool
    # choice groups. Materialize only those canonical tool pairs; do not turn
    # generic alternatives wording elsewhere into graph nodes or edges.
    area_tool_groups = [
        {
            "note_owner": "area_enrichment_item:d078-a04-tools-quantitative-alternatives",
            "note_pointer": "valid_alternatives/0",
            "tool_ids": [
                "area_tool_option:d078-a04-tool-r",
                "area_tool_option:d078-a04-tool-python",
                "area_tool_option:d078-a04-tool-spss",
                "area_tool_option:d078-a04-tool-stata",
            ],
            "explanation": "R, Python, SPSS and Stata can each support suitable quantitative analyses, but they do not have identical procedures or workflows. Choose based on the analysis, data design, reproducibility, institutional access and the learner's goal; learning all four is not required.",
            "source_role": "area_tool_alternative_evidence",
            "area_id": "D078:computational-digital-social-science",
        },
        {
            "note_owner": "area_enrichment_item:d078-a04-method-human-in-loop-llm-qualitative-analysis",
            "note_pointer": "valid_alternatives/1",
            "tool_ids": [
                "area_tool_option:d078-a04-tool-nvivo",
                "area_tool_option:d078-a04-tool-taguette",
            ],
            "explanation": "Both support qualitative coding, but their workflows differ: Taguette focuses on highlighting and tagging text documents, while NVivo provides a broader set of coding workflows, including manual and automatic coding into thematic nodes. Choose by the material you need to handle, project scale, collaboration needs, access and licensing; neither tool decides what a code means or replaces interpretation.",
            "source_role": "area_tool_alternative_evidence",
            "area_id": "D078:psychology-social-behaviour",
        },
        {
            "note_owner": "area_enrichment_item:d078-soc-caqdas-taguette-nvivo",
            "note_pointers": ["valid_alternatives/1", "valid_alternatives/2"],
            "tool_ids": [
                "domain-item:d078-nvivo-tool",
                "domain-item:d078-qualitative-coding-tool",
            ],
            "option_names": ["NVivo", "Taguette"],
            "area_id": "D078:sociology-social-anthropology",
            "edge_scope_key": "sociology-social-anthropology",
            "explanation": "For this area's qualitative and mixed-analysis work, Taguette offers a focused way to highlight and tag text documents, while NVivo provides a broader set of coding workflows. Choose by the material, project scale, collaboration needs, access and licensing. Either is optional; neither decides what a code means or replaces interpretation.",
            "source_role": "area_tool_alternative_evidence",
        },
        {
            "note_owner": "area_enrichment_item:d078-social-research-evaluation-qualitative-coding-options",
            "note_pointers": ["valid_alternatives/0"],
            "tool_ids": [
                "domain-item:d078-nvivo-tool",
                "domain-item:d078-qualitative-coding-tool",
            ],
            "option_names": ["NVivo", "Taguette"],
            "area_id": "D078:social-research-evaluation",
            "edge_scope_key": "social-research-evaluation",
            "explanation": "For this area's qualitative evaluation work, Taguette supports focused document highlighting and coding, while NVivo supports broader coding, retrieval and query workflows. Choose according to the evidence, project needs, access and licensing; neither is required, and quantitative analysis is a different route when the evidence and design call for it.",
            "source_role": "area_tool_alternative_evidence",
        },
    ]

    def area_tool_pair_edge_id(group: dict[str, Any], source_id: str, target_id: str) -> str:
        base = f"alternative_reviewed:{source_id}->{target_id}"
        scope_key = str(group.get("edge_scope_key") or "").strip()
        return f"{base}:area:{scope_key}" if scope_key else base

    materialized_tool_pairs: list[dict[str, Any]] = []
    for group in area_tool_groups:
        owner_id = group["note_owner"]
        owner = nodes.get(owner_id)
        tool_ids = group["tool_ids"]
        if not owner:
            continue
        note_pointers = group.get("note_pointers") or [group["note_pointer"]]
        note_texts: list[str] = []
        for pointer in note_pointers:
            field, _, index_text = str(pointer).partition("/")
            values = owner.get(field, [])
            index = int(index_text) if index_text.isdigit() else -1
            if not isinstance(values, list) or index < 0 or index >= len(values):
                continue
            note_texts.append(str(values[index]).strip())
        note_text = " ".join(text for text in note_texts if text)
        note_text = f"{owner.get('label', '')} {note_text}".strip()
        resolved_tools = [nodes.get(tool_id) for tool_id in tool_ids]
        allowed_tool_kinds = {"area_tool_option", "domain_learning_item"}
        if any(tool is None or tool.get("kind") not in allowed_tool_kinds or tool.get("student_visible") is not True for tool in resolved_tools):
            continue
        option_names = group.get("option_names") or [str(tool.get("label") or "") for tool in resolved_tools]
        if not note_text or not all(str(name).lower() in note_text.lower() for name in option_names):
            continue
        for index, source_id in enumerate(tool_ids):
            for target_id in tool_ids[index + 1:]:
                edge_id = area_tool_pair_edge_id(group, source_id, target_id)
                edges[:] = [edge for edge in edges if edge.get("id") != edge_id]
                pair_refs: list[dict[str, Any]] = []
                for tool_id, tool in ((source_id, nodes[source_id]), (target_id, nodes[target_id])):
                    for field in ("source_references", "evidence", "learning_links", "resources"):
                        pair_refs.extend(ref_rows(tool.get(field), group["source_role"], tool_id))
                pair_refs.extend(ref_rows([{
                    "id": f"internal:{owner_id}:{'+'.join(note_pointers)}",
                    "locator": f"{owner_id}/{' + '.join(note_pointers)}: {note_text}",
                    "publisher": "D078 reviewed area/tool contract",
                }], group["source_role"]))
                if not pair_refs or not any(ref.get("endpoint") == source_id for ref in pair_refs) or not any(ref.get("endpoint") == target_id for ref in pair_refs):
                    continue
                edges.append({
                    "id": edge_id,
                    "source": source_id,
                    "target": target_id,
                    "relationship": "alternative_tool_option",
                    "status": "resolved_ready_for_use",
                    "student_visible": True,
                    "selectable": True,
                    "evidence_basis": "source_backed_alternative_relationship",
                    "source_references": pair_refs,
                    "explanation": group["explanation"],
                    "alternative_review_disposition": "approved",
                    "alternative_review_reason": "The area contract identifies these exact tool choices in this area, and each canonical tool node has its own capability and learning-resource evidence.",
                    "alternative_is_exclusive": False,
                    "requirement_lane": "useful_optional",
                    "area_id": group["area_id"],
                    "source_note_pointer": f"{owner_id}/{' + '.join(note_pointers)}",
                    "blocking_policy": "never",
                    "sequence_policy": "none",
                })
                materialized_tool_pairs.append({"source_id": source_id, "target_id": target_id, "note_owner": owner_id, "note_pointers": note_pointers, "area_id": group["area_id"]})

    # Resolve the three legacy unapproved candidates with item-level decisions.
    # The synthetic-respondent/scenario comparison has two exact, canonical
    # endpoints and a reviewed source note that names scenario analysis as an
    # alternative. The PNAS study grounds the synthetic-respondent endpoint;
    # the Government Futures Toolkit already grounds the scenario endpoint.
    # Keep the edge, but attach explicit source evidence to the exact source
    # endpoint so the normal validator can approve it.
    synthetic_scenario_id = (
        "alternative_to:domain-emerging:d078-experimental-synthetic-respondent-and-llm-agent-testing"
        "->domain-item:d078-scenario-analysis"
    )
    synthetic_scenario = next((edge for edge in edges if edge.get("id") == synthetic_scenario_id), None)
    if synthetic_scenario:
        synthetic_scenario["explanation"] = (
            "Both are optional ways to explore a question, but they do different work. "
            "Scenario analysis compares plausible future conditions; synthetic respondents "
            "generate model-produced answers or agents for an experimental simulation. "
            "Choose by the question, label generated material as synthetic, and do not treat "
            "it as evidence of what real people think or do."
        )
        synthetic_scenario.setdefault("source_references", []).append({
            "id": "external:pnas-llm-synthetic-survey-2026",
            "title": "The potential existential threat of large language models to online survey research",
            "url": "https://www.pnas.org/doi/10.1073/pnas.2518075122",
            "locator": "Study description and findings on autonomous synthetic respondents in survey research; supports the bounded synthetic-respondent endpoint and cautions against treating generated answers as ordinary respondent evidence.",
            "source_role": "alternative_relationship_evidence",
            "endpoint": "domain-emerging:d078-experimental-synthetic-respondent-and-llm-agent-testing",
        })

    # These two candidates are false binaries, not unresolved canonical pairs.
    # Computational methods overlap with qualitative, survey and secondary-
    # data work; ABM can be informed by empirical approaches and is not a
    # substitute for them. Preserve the source-owned prose on each node, but
    # remove the non-canonical concept-target edges from the selectable graph.
    non_pairwise_candidates = [
        {
            "edge_id": "alternative_to:domain-item:d078-computational-social-research->concept:relationship_target:non-computational-qualitative-survey-and-secondary-data-routes",
            "source_id": "domain-item:d078-computational-social-research",
            "proposed_target": "non-computational qualitative, survey and secondary-data routes",
            "decision": "excluded_not_a_pairwise_alternative",
            "reason": "The proposed target combines several methods and data sources, not one canonical learning node. Computational techniques can be used with qualitative text, surveys and secondary data, so treating this umbrella as the opposite of computational research would mislead learners.",
            "student_effect": "No selectable alternative edge; the source node's question-and-evidence choice guidance remains as explanatory context.",
        },
        {
            "edge_id": "alternative_to:domain-item:d078-agent-based-modeling->concept:relationship_target:observational-survey-interview-or-statistical-approaches",
            "source_id": "domain-item:d078-agent-based-modeling",
            "proposed_target": "observational, survey, interview or statistical approaches",
            "decision": "excluded_not_a_pairwise_alternative",
            "reason": "The proposed target bundles distinct empirical approaches. Agent-based models can use empirical information, inform data collection and be assessed against evidence; they are not generally an either/or replacement for observation, surveys, interviews or statistical analysis.",
            "student_effect": "No selectable alternative edge; the source node's statement that simulation does not replace empirical evidence remains as explanatory context.",
            "evidence": [
                {
                    "title": "Agent-Based Models in Empirical Social Research",
                    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4430112/",
                    "locator": "Abstract and sections on empirically grounded models and validation: describes ways to incorporate empirical population/behavior data, guide data collection and assess model assumptions and output.",
                },
            ],
        },
    ]
    non_pairwise_ids = {row["edge_id"] for row in non_pairwise_candidates}
    edges[:] = [edge for edge in edges if edge.get("id") not in non_pairwise_ids]

    reviewed = 0
    unapproved = 0
    edge_decisions: list[dict[str, Any]] = []
    for edge in edges:
        relationship = edge.get("relationship")
        if relationship not in alternative_types:
            continue
        source_id, target_id = str(edge.get("source") or ""), str(edge.get("target") or "")
        source, target = nodes.get(source_id), nodes.get(target_id)
        # A concept stub is not an actionable target, even if the legacy edge
        # calls itself resolved. Preserve it for audit, but fail closed.
        if not source or not target or source_id == target_id or str((target or {}).get("kind", "")).endswith("relationship_target"):
            edge.update({
                "status": "unapproved_unresolved_alternative_target",
                "student_visible": False,
                "selectable": False,
                "alternative_review_disposition": "unapproved",
                "alternative_review_reason": "The alternative does not resolve to two distinct canonical D078 learning nodes.",
            })
            unapproved += 1
            edge_decisions.append({"edge_id": edge.get("id"), "decision": "unapproved_unresolved_target"})
            continue

        refs = ref_rows(edge.get("source_references"), "alternative_relationship_evidence")
        refs += ref_rows(edge.get("evidence_sources"), "alternative_relationship_evidence")
        refs += ref_rows(edge.get("relationship_evidence"), "alternative_relationship_evidence")
        route_context = edge.get("route_context") or {}
        for nested in route_context.get("relationships") or []:
            if not isinstance(nested, dict) or nested.get("type") != "alternative_to":
                continue
            nested_role = (
                "role_task_tool_alternative_evidence"
                if relationship == "tool_alternative_for_role_task"
                else "alternative_relationship_evidence"
            )
            refs += ref_rows(nested.get("source_references"), nested_role)
        # Some reviewed tool comparisons were stored as source evidence on the
        # exact endpoint nodes rather than on the edge. Carry those exact docs
        # onto the pair with an endpoint locator; do not infer from co-occurrence.
        for endpoint_id, endpoint in ((source_id, source), (target_id, target)):
            endpoint_refs = []
            for field in ("source_references", "evidence", "learning_links", "resources"):
                endpoint_refs.extend(ref_rows(endpoint.get(field), "alternative_relationship_evidence", endpoint_id))
            refs.extend(endpoint_refs)
        unique: dict[tuple[str, str, str], dict[str, Any]] = {}
        for reference in refs:
            unique[(str(reference.get("url") or reference.get("source_url") or ""),
                    str(reference.get("locator") or reference.get("exact_locator") or ""),
                    str(reference.get("endpoint") or ""))] = reference
        refs = list(unique.values())
        explanation = str(edge.get("explanation") or edge.get("rationale") or "").strip()
        source_evidence = [ref for ref in refs if ref.get("endpoint") == source_id]
        target_evidence = [ref for ref in refs if ref.get("endpoint") == target_id]
        pair_evidence = [ref for ref in refs if not ref.get("endpoint")]
        # Edge-owned citations are relationship-specific. Otherwise require
        # evidence for both endpoints plus the reviewed, bounded comparison.
        has_pair_evidence = bool(pair_evidence) or bool(source_evidence and target_evidence)
        if relationship == "tool_alternative_for_role_task":
            basis = "source_backed_role_task_tool_alternative"
            role = "role_task_tool_alternative_evidence"
        else:
            basis = "source_backed_alternative_relationship"
            role = "alternative_relationship_evidence"
        if not explanation or not has_pair_evidence:
            edge.update({
                "status": "unapproved_alternative_relationship_evidence_gap",
                "student_visible": False,
                "selectable": False,
                "alternative_review_disposition": "unapproved",
                "alternative_review_reason": "A bounded comparison and evidence for the relationship or both exact endpoints are required.",
                "source_references": refs,
            })
            unapproved += 1
            edge_decisions.append({"edge_id": edge.get("id"), "decision": "unapproved_missing_pair_evidence", "reference_count": len(refs)})
            continue
        edge.update({
            "status": "resolved_ready_for_use",
            "student_visible": True,
            "selectable": True,
            "evidence_basis": basis,
            "source_references": [dict(ref, source_role=role) for ref in refs],
            "explanation": explanation,
            "alternative_review_disposition": "approved",
            "alternative_review_reason": "Two canonical endpoints, a bounded task-aware comparison and relationship or endpoint-specific evidence are present.",
            "alternative_is_exclusive": False,
            "sequence_policy": "none",
            "blocking_policy": "never",
        })
        reviewed += 1
        edge_decisions.append({"edge_id": edge.get("id"), "decision": "approved_selectable_alternative", "reference_count": len(refs)})

    # Audit every prose note. Exact label resolution is deliberately required;
    # broad fuzzy matching would create false alternatives across methods,
    # areas and role contexts. Existing prose remains displayed as explanation
    # but cannot hide or add another learning card by itself.
    import re
    labels: dict[str, list[str]] = defaultdict(list)
    for node_id, node in nodes.items():
        normalized = re.sub(r"[^a-z0-9]+", " ", str(node.get("label") or "").lower()).strip()
        if normalized:
            labels[normalized].append(node_id)
    note_count = 0
    exact_target_notes = 0
    notes_without_target = 0
    for node in nodes.values():
        dispositions: list[dict[str, Any]] = []
        for field in ("valid_alternatives", "alternatives"):
            values = node.get(field)
            if not isinstance(values, list):
                values = [values] if values else []
            for index, value in enumerate(values):
                text = str(value).strip()
                if not text:
                    continue
                normalized = re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()
                matches = labels.get(normalized, [])
                # Self-matches do not form an alternative and ambiguous names
                # are not resolved by choosing the first matching node.
                matches = [match for match in matches if match != node.get("id")]
                unique_targets = sorted(set(matches))
                if len(unique_targets) == 1:
                    exact_target_notes += 1
                    disposition = "exact_target_candidate_requires_typed_edge_review"
                    target_id = unique_targets[0]
                else:
                    notes_without_target += 1
                    disposition = "prose_context_only_no_exact_canonical_target"
                    target_id = None
                dispositions.append({
                    "note_id": f"{node.get('id')}:{field}:{index}",
                    "field": field,
                    "text": text,
                    "disposition": disposition,
                    "target_node_id": target_id,
                    "selectable_from_note_alone": False,
                    "reason": "Only a separately approved typed edge can make an alternative selectable; wording alone is not a graph relationship.",
                })
                note_count += 1
        if dispositions:
            node["alternative_note_dispositions"] = dispositions

    # These two source-contract notes describe groups, not a single target.
    # Mark their exact members as covered by typed pairwise edges while keeping
    # the prose itself non-selectable. This avoids reporting a resolved tool
    # group as an unresolved generic note.
    grouped_note_dispositions: list[dict[str, Any]] = []
    for group in area_tool_groups:
        owner_id = group["note_owner"]
        owner = nodes.get(owner_id)
        if not owner:
            continue
        dispositions = owner.get("alternative_note_dispositions", [])
        note_pointers = group.get("note_pointers") or [group["note_pointer"]]
        pair_edge_ids = [
            area_tool_pair_edge_id(group, source_id, target_id)
            for index, source_id in enumerate(group["tool_ids"])
            for target_id in group["tool_ids"][index + 1:]
            if any(edge.get("id") == area_tool_pair_edge_id(group, source_id, target_id)
                   and edge.get("alternative_review_disposition") == "approved"
                   for edge in edges)
        ]
        expected_pairs = len(group["tool_ids"]) * (len(group["tool_ids"]) - 1) // 2
        if len(pair_edge_ids) != expected_pairs:
            continue
        for pointer in note_pointers:
            field, _, index_text = str(pointer).partition("/")
            note_index = int(index_text) if index_text.isdigit() else -1
            note_id = f"{owner_id}:{field}:{note_index}"
            note = next((row for row in dispositions if row.get("note_id") == note_id), None)
            if not note:
                continue
            note.update({
                "disposition": "covered_by_approved_typed_alternative_group",
                "target_node_ids": list(group["tool_ids"]),
                "typed_edge_ids": pair_edge_ids,
                "reason": "The reviewed area contract identifies this option within an exact tool group; each canonical option is connected by an approved, non-exclusive comparison edge scoped to the area. The prose note itself does not add or select items.",
            })
            grouped_note_dispositions.append({
                "note_id": note_id,
                "owner_node_id": owner_id,
                "area_id": group["area_id"],
                "target_node_ids": list(group["tool_ids"]),
                "typed_edge_ids": pair_edge_ids,
            })

    # Preserve and decide structured relationship prose separately from the
    # display-only alternative strings. Slugs are resolved only when they map
    # uniquely to a canonical node; textual similarity never creates an edge.
    structured_note_count = 0
    structured_notes: list[dict[str, Any]] = []
    exact_structured_targets = 0
    for owner in nodes.values():
        relationships = owner.get("relationships") or []
        for index, relationship in enumerate(relationships):
            if not isinstance(relationship, dict):
                continue
            rel_type = str(relationship.get("type") or relationship.get("relationship") or "")
            if "alternat" not in rel_type.lower():
                continue
            target_candidates: set[str] = set()
            raw_targets = [relationship.get(field) for field in ("target_id", "target_key", "target_label", "target") if relationship.get(field)]
            for raw_target in raw_targets:
                target_text = str(raw_target)
                if target_text in nodes:
                    target_candidates.add(target_text)
                if ":" in target_text:
                    target_candidates.update(node_id for node_id in nodes if node_id.endswith("-" + target_text.rsplit(":", 1)[-1]))
                else:
                    target_candidates.update(node_id for node_id in nodes if node_id.endswith("-" + target_text))
            target_candidates.discard(str(owner.get("id")))
            target_ids = sorted(target_candidates)
            if len(target_ids) == 1:
                exact_structured_targets += 1
                target_id = target_ids[0]
                matching_edges = [edge for edge in edges if edge.get("source") == owner.get("id") and edge.get("target") == target_id and edge.get("relationship") in alternative_types]
                decision = "covered_by_approved_typed_edge" if any(edge.get("alternative_review_disposition") == "approved" for edge in matching_edges) else "exact_target_resolved_relationship_not_yet_approved"
            else:
                target_id = None
                decision = "prose_only_unresolved_or_ambiguous_target"
            # Three inherited relationships are known source-record mismatches;
            # preserve their text for audit but never let the wrong relation
            # affect student selection.
            owner_id = str(owner.get("id"))
            wrong_relationship_ids = {
                "area_enrichment_item:d078-computational-digital-social-science-agent-based-social-simulation",
                "area_enrichment_item:d078-computational-digital-social-science-networkx-or-gephi",
                "area_enrichment_item:d078-social-research-evaluation-spss-quantitative-tool",
            }
            if owner_id in wrong_relationship_ids:
                decision = "unapproved_source_record_relationship_mismatch"
                target_id = None
            structured_notes.append({
                "note_id": f"{owner_id}:relationships:{index}",
                "owner_node_id": owner_id,
                "relationship_type": rel_type,
                "target_text": raw_targets,
                "target_node_id": target_id,
                "explanation": relationship.get("explanation") or relationship.get("why") or relationship.get("note"),
                "decision": decision,
                "selection_effect": "none_without_approved_typed_edge",
            })
            structured_note_count += 1

    result = {
        "date": "2026-11-03",
        "status": "all_typed_alternative_edges_and_prose_notes_dispositioned",
        "typed_alternative_edge_count": len(edge_decisions),
        "approved_selectable_typed_edge_count": reviewed,
        "unapproved_typed_edge_count": unapproved,
        "typed_edge_decisions": edge_decisions,
        "prose_alternative_note_count": note_count,
        "notes_with_one_exact_target_candidate": exact_target_notes,
        "notes_without_one_exact_target": notes_without_target,
        "notes_covered_by_approved_typed_groups": len(grouped_note_dispositions),
        "approved_typed_group_note_dispositions": grouped_note_dispositions,
        "structured_alternative_relationship_note_count": structured_note_count,
        "structured_notes_with_exact_target_candidates": exact_structured_targets,
        "structured_relationship_notes": structured_notes,
        "additional_same_area_tool_pairs_materialized": materialized_tool_pairs,
        "non_pairwise_candidate_dispositions": non_pairwise_candidates,
        "non_pairwise_candidate_count": len(non_pairwise_candidates),
        "note_policy": "Preserve every prose alternative or boundary note; it does not become a separate selectable item unless an exact canonical target and approved typed relationship are recorded.",
        "no_fuzzy_target_creation": True,
        "selection_gate": "isD078SelectableAlternativeEdge requires approved relationship evidence, exact resolved endpoints and the expected evidence basis/source role; a resolved_ready_for_use string alone is insufficient.",
    }
    graph["alternative_relationship_reconciliation"] = result
    graph["routing_policy"]["relationship_edges"] = "Only reviewed typed relationships with exact canonical targets and relationship-specific evidence are selectable. Prose alternatives remain item explanations unless a separately approved edge identifies the exact target and route."
    return result


def reconcile_method_extension_route_evidence(graph: dict[str, Any]) -> dict[str, Any]:
    """Expose reviewed method extensions as skippable route choices, not order edges."""
    nodes = {node["id"]: node for node in graph.get("nodes", [])}
    edges = graph.setdefault("edges", [])
    method_ids = set(graph.get("method_node_ids", []))
    approved = []
    for edge in edges:
        source_id, target_id = str(edge.get("source") or ""), str(edge.get("target") or "")
        if (edge.get("relationship") != "specialist_extension_of" or source_id not in method_ids
                or target_id not in nodes):
            continue
        source, target = nodes[source_id], nodes[target_id]
        if (source.get("student_visible") is not True or source.get("approval") == "unapproved"
                or target.get("student_visible") is not True or target.get("approval") == "unapproved"
                or target.get("student_selectable") is False):
            continue
        refs_by_key = {}
        for endpoint_id, endpoint_node, role in (
            (source_id, source, "selected_method_evidence"),
            (target_id, target, "extension_item_evidence"),
        ):
            refs = endpoint_node.get("source_references") or endpoint_node.get("evidence") or []
            for ref in refs:
                url = str(ref.get("url") or "")
                if not url.startswith("http"):
                    continue
                key = (str(ref.get("id") or ref.get("source_id") or url), url)
                refs_by_key[key] = {
                    **ref,
                    "id": key[0],
                    "url": url,
                    "source_role": role,
                    "endpoint": endpoint_id,
                }
        refs = list(refs_by_key.values())
        if not any(ref.get("endpoint") == source_id for ref in refs) or not any(ref.get("endpoint") == target_id for ref in refs):
            continue
        existing_refs = edge.get("source_references") or []
        refs_by_key.update({
            (str(ref.get("id") or ref.get("source_id") or ref.get("url")), str(ref.get("url") or "")): ref
            for ref in existing_refs if str(ref.get("url") or "").startswith("http")
        })
        refs = list(refs_by_key.values())
        edge.update({
            "status": "resolved_ready_for_use",
            "student_visible": True,
            "route_item_exposure_approved": True,
            "requirement_lane": str(target.get("requirement_lane") or "useful_edge"),
            "evidence_basis": "reviewed_method_extension_edge_and_source_backed_endpoint_contracts",
            "evidence_source_ids": sorted({str(ref.get("id") or ref.get("source_id")) for ref in refs}),
            "source_references": refs,
            "sequence_policy": "none",
            "blocking_policy": "never",
            "recommendation_only": True,
            "fit_claim_limit": "This is an optional extension of the selected method, not a prerequisite. It does not automatically replace another method or apply outside the stated method context.",
        })
        approved.append(edge)
    return {
        "route_item_exposure_edges_approved": len(approved),
        "edge_ids": sorted(str(edge.get("id")) for edge in approved),
        "source_item_pairs": sorted([str(edge["source"]), str(edge["target"])] for edge in approved),
        "scope": "only reviewed existing specialist_extension_of links from approved selectable method nodes to approved selectable items; each is an optional route choice",
        "sequence_edges_added": 0,
    }


def build_selection_progression_contract(graph: dict[str, Any]) -> dict[str, Any]:
    """Materialize selection-dependent paths from reviewed graph edges.

    This is a progression contract, not a fabricated numbered syllabus. It
    records the student's route from an exact method/design through an area
    start, family-linked learning, eligible roles, role-task context, and
    task-linked role items/tools. Item prerequisites remain governed only by
    the explicitly approved sequence edges.
    """
    nodes = {node["id"]: node for node in graph.get("nodes", [])}
    edges = graph.get("edges", [])
    node_order = {str(node.get("id")): index for index, node in enumerate(graph.get("nodes", []))}
    edge_by_id = {edge.get("id"): edge for edge in edges if edge.get("id")}
    domain_foundation_order = sorted(
        (str(item_id) for item_id in graph.get("foundation_item_ids", []) if str(item_id) in nodes),
        key=lambda item_id: (
            (nodes.get(item_id, {}).get("requirement_scope") or {}).get(
                "recommended_teaching_order",
                nodes.get(item_id, {}).get("recommended_teaching_order", 999),
            ),
            item_id,
        ),
    )
    foundations_by_area: dict[str, list[str]] = defaultdict(list)
    foundation_contract = graph.get("area_foundation_contract", {})
    foundation_map = foundation_contract.get("foundation_ids_by_area", {})
    if not isinstance(foundation_map, dict):
        raise ValueError("D078 area-foundation contract must map each area to its selectable foundation IDs")
    for area_id, item_ids in foundation_map.items():
        for item_id in item_ids if isinstance(item_ids, list) else []:
            node = nodes.get(str(item_id))
            if (not node or node.get("area_id") != area_id or node.get("student_visible") is not True
                    or node.get("student_selectable") is False):
                raise ValueError(f"Area foundation is missing, hidden, or not selectable: {area_id}->{item_id}")
            foundations_by_area[str(area_id)].append(str(item_id))

    def evidence_ready(edge: dict[str, Any], relation: str, basis: str | None = None) -> bool:
        if edge.get("relationship") != relation or edge.get("status") != "resolved_ready_for_use":
            return False
        if basis and edge.get("evidence_basis") != basis:
            return False
        return edge.get("source_resolved") is not False and edge.get("target_resolved") is not False

    def route_contributions(route: dict[str, Any]) -> list[dict[str, Any]]:
        return [row for row in route.get("method_contributions", []) if isinstance(row, dict)]

    def node_lane(item_id: str) -> str:
        node = nodes.get(item_id, {})
        scope = node.get("requirement_scope") if isinstance(node.get("requirement_scope"), dict) else {}
        return str(node.get("requirement_lane") or scope.get("lane") or node.get("requirement_level") or "unclassified")

    def sequence_ordered_ids(item_ids: set[str] | list[str], preferred_order: list[str] | None = None) -> list[str]:
        """Apply reviewed edges; retain supplied route order for parallel choices."""
        preferred_rank = {str(item_id): index for index, item_id in enumerate(preferred_order or [])}
        ids = list(dict.fromkeys(str(item_id) for item_id in item_ids))
        ids.sort(key=lambda item_id: (preferred_rank.get(item_id, 10**9), node_order.get(item_id, 10**9), item_id))
        candidates = set(ids)
        adjacency: dict[str, set[str]] = {item_id: set() for item_id in ids}
        indegree = {item_id: 0 for item_id in ids}
        for edge in edges:
            if (edge.get("sequence_approved") is not True
                    or edge.get("sequence_policy") not in {"conditional_prerequisite", "workflow"}
                    or edge.get("source") not in candidates
                    or edge.get("target") not in candidates):
                continue
            source_id = str(edge["source"])
            target_id = str(edge["target"])
            if target_id not in adjacency[source_id]:
                adjacency[source_id].add(target_id)
                indegree[target_id] += 1
        ready = [item_id for item_id in ids if indegree[item_id] == 0]
        result: list[str] = []
        while ready:
            ready.sort(key=lambda item_id: (preferred_rank.get(item_id, 10**9), node_order.get(item_id, 10**9), item_id))
            current = ready.pop(0)
            result.append(current)
            for target_id in adjacency[current]:
                indegree[target_id] -= 1
                if indegree[target_id] == 0:
                    ready.append(target_id)
        if len(result) != len(ids):
            raise ValueError(f"Approved D078 route sequence contains a cycle: {sorted(candidates - set(result))}")
        return result

    def lane_groups(item_ids: set[str] | list[str], preferred_order: list[str] | None = None) -> dict[str, list[str]]:
        """Keep the route contract in requirement groups, not item-type groups.

        The compulsory foundation spine is its own earlier stage. For later
        route choices, retain a distinct needed lane only where the item itself
        says it is needed; all conditional/useful/optional choices share one
        ordered lane. Their exact requirement label remains on each node and
        item disposition, while reviewed edges can order across those labels.
        """
        grouped: dict[str, list[str]] = defaultdict(list)
        for item_id in sequence_ordered_ids(item_ids, preferred_order):
            raw_lane = node_lane(item_id)
            display_lane = "needed" if raw_lane in {"needed", "required"} else "useful_optional"
            grouped[display_lane].append(item_id)
        return {lane: grouped[lane] for lane in ("needed", "useful_optional") if grouped.get(lane)}

    def is_tool_node(item_id: str) -> bool:
        node = nodes.get(item_id, {})
        return (item_id.startswith("role-tool:")
                or node.get("item_type") in {"tool", "programming_language", "python_library", "computational_environment"}
                or "tool_option" in str(node.get("kind", ""))
                or "tool_application_reference" in str(node.get("kind", "")))

    def route_layer_items(route_kind: str, route: dict[str, Any], method_ids: list[str]) -> list[str]:
        """Return only method/design-linked Layer 2/3 choices for this exact route."""
        combo_id = route.get("combination_id") if route_kind != "single_method" else None
        active_methods = set(method_ids)
        result: list[str] = []
        seen: set[str] = set()

        def add(item_id: str) -> None:
            if item_id not in seen:
                seen.add(item_id)
                result.append(item_id)
        for layer in graph.get("domain_learning_layers", []):
            if layer.get("layer") not in {2, 3}:
                continue
            for item_id in layer.get("item_ids", []):
                if item_id == "runtime-item:domain:d078:d078-society-and-social-world-knowledge":
                    continue
                if combo_id:
                    evidence = layer.get("route_applicability_by_combination", {}).get(item_id, {}).get(str(combo_id), [])
                    if any(row.get("method_id") in active_methods for row in evidence if isinstance(row, dict)):
                        add(str(item_id))
                elif any(method_id in active_methods for method_id in layer.get("route_applicability_by_item", {}).get(item_id, [])):
                    add(str(item_id))
        # A reviewed specialist extension is a route-local skippable choice,
        # not an ordering edge. Keep it with the exact method that supports it.
        for edge in edges:
            if (edge.get("route_item_exposure_approved") is True
                    and edge.get("relationship") == "specialist_extension_of"
                    and edge.get("source") in active_methods
                    and edge.get("target") in nodes):
                add(str(edge["target"]))
        return result

    def route_layer_items_by_method(route_kind: str, route: dict[str, Any], method_ids: list[str]) -> dict[str, list[str]]:
        """Keep each selected method's Layer 2/3 evidence attached to that method."""
        combo_id = route.get("combination_id") if route_kind != "single_method" else None
        active_methods = set(method_ids)
        grouped: dict[str, list[str]] = {method_id: [] for method_id in method_ids}

        def add(method_id: str, item_id: str) -> None:
            if method_id in grouped and item_id in nodes and item_id not in grouped[method_id]:
                grouped[method_id].append(item_id)

        for layer in graph.get("domain_learning_layers", []):
            if layer.get("layer") not in {2, 3}:
                continue
            for item_id in layer.get("item_ids", []):
                if item_id == "runtime-item:domain:d078:d078-society-and-social-world-knowledge":
                    continue
                if combo_id:
                    evidence = layer.get("route_applicability_by_combination", {}).get(item_id, {}).get(str(combo_id), [])
                    for row in evidence:
                        method_id = str(row.get("method_id") or "") if isinstance(row, dict) else ""
                        if method_id in active_methods:
                            add(method_id, str(item_id))
                else:
                    for method_id in layer.get("route_applicability_by_item", {}).get(item_id, []):
                        if method_id in active_methods:
                            add(str(method_id), str(item_id))

        for edge in edges:
            if (edge.get("route_item_exposure_approved") is True
                    and edge.get("relationship") == "specialist_extension_of"
                    and edge.get("source") in active_methods
                    and edge.get("target") in nodes):
                add(str(edge["source"]), str(edge["target"]))
        return grouped

    def build_route_sequence_plan(
        route_kind: str, route: dict[str, Any], method_ids: list[str], area_id: str,
        foundation_ids: list[str], family_ids: set[str], family_paths: list[dict[str, Any]],
        role_task_rows: list[dict[str, Any]], role_tool_rows: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """Order route stages/groups and scope item-to-item order to reviewed edges."""
        contributions = route_contributions(route)
        combo_id = route.get("combination_id") if route_kind != "single_method" else None
        domain_items: set[str] = set()
        area_items: set[str] = set()
        domain_tools: set[str] = set()
        area_tools: set[str] = set()
        route_item_order: list[str] = []

        def add_routed_item(item_id: str, default_level: str) -> None:
            # The three shared domain foundations are already displayed and
            # selected in stage 1. A broad method contribution may name one
            # again as context, but it must not create a duplicate learning
            # card in the later method-linked choices.
            if item_id in domain_foundation_order:
                return
            node = nodes.get(item_id)
            # Route-level arrays can retain historical or audit-only ids. The
            # current item contract is authoritative: do not project an item
            # that is hidden, unapproved, or explicitly non-selectable just
            # because an older contribution array still names it.
            if (not node or node.get("student_visible") is not True
                    or node.get("approval") == "unapproved"
                    or node.get("student_selectable") is False):
                return
            if item_id not in route_item_order:
                route_item_order.append(item_id)
            # `display_stage` is the canonical owner boundary. Some reviewed
            # area tools retain a historical `domain-item:` identifier and do
            # not carry `area_id`; requiring the prefix or area_id here leaks
            # them into the pre-area method menu (for example Mesa and Casevo).
            is_area_item = (
                item_id.startswith(("area-item:", "area_enrichment_item:", "area_learning_item:"))
                or node.get("display_stage") == "area"
            )
            is_area_tool = is_area_item and is_tool_node(item_id) or "area_tool_option" in str(node.get("kind", ""))
            if is_tool_node(item_id):
                (area_tools if is_area_tool or default_level == "area" else domain_tools).add(item_id)
            elif is_area_item or default_level == "area":
                area_items.add(item_id)
            else:
                domain_items.add(item_id)

        # The domain-learning-layer catalog is the reviewed source sequence for
        # the route's method-linked choices. Seed stable presentation ties from
        # that order first; explicit reviewed edges still override it.
        layer_items = route_layer_items(route_kind, route, method_ids)
        layer_items_by_method = route_layer_items_by_method(route_kind, route, method_ids)
        for item_id in layer_items:
            add_routed_item(item_id, "domain")

        for source_index, source in enumerate([route, *contributions]):
            # A named design's route-level downstream list is a legacy broad
            # aggregate. Keep the exact method-attributed downstream choices
            # from its active contributions, but do not union that aggregate
            # into the combined design by default.
            route_fields = ("task_linked_domain_item_ids", "available_item_ids")
            if not combo_id or source_index > 0:
                route_fields = (*route_fields, "domain_downstream_item_ids")
            for field in route_fields:
                for value in source.get(field, []):
                    add_routed_item(str(value), "domain")
            for value in source.get("area_item_ids", []):
                add_routed_item(str(value), "area")
            for field in ("tool_ids", "domain_tool_ids"):
                for value in source.get(field, []):
                    add_routed_item(str(value), "domain")
        for family_path in family_paths:
            for edge in family_path.get("area_learning_item_edges", []):
                item_id = str(edge.get("area_item_id") or "")
                add_routed_item(item_id, "area")

        # Shared area-foundation choices are already displayed in the area
        # start stage. Keep them available for selection inheritance, but do
        # not duplicate them as a second card in the later task-item stage.
        area_items.difference_update(foundation_ids)

        # A reviewed prerequisite/workflow edge makes its source part of this
        # exact route when the target is route-supported, even when the two
        # items belong to different sibling task families. This exposes the
        # prerequisite context without manufacturing a family-membership edge.
        route_learning_ids = domain_items | domain_tools | area_items | area_tools | set(layer_items)
        changed = True
        while changed:
            changed = False
            for edge in edges:
                if (edge.get("sequence_approved") is not True
                        or edge.get("sequence_policy") not in {"conditional_prerequisite", "workflow"}
                        or edge.get("target") not in route_learning_ids
                        or edge.get("source") in route_learning_ids):
                    continue
                source_id = str(edge.get("source") or "")
                source_node = nodes.get(source_id, {})
                if (not source_id or source_node.get("student_visible") is not True
                        or source_node.get("approval") == "unapproved"
                        or source_node.get("student_selectable") is False):
                    continue
                source_level = "area" if source_node.get("display_stage") == "area" or source_id.startswith(("area-item:", "area_enrichment_item:", "area_learning_item:")) else "domain"
                add_routed_item(source_id, source_level)
                route_learning_ids.update(domain_items | domain_tools | area_items | area_tools)
                changed = True

        # Roles are sibling choices, not a learning sequence. Preserve the
        # route-declared order instead of ordering role names alphabetically.
        role_ids = list(dict.fromkeys(str(role_id) for role_id in route.get("role_ids", []) if role_id in nodes))
        role_items_by_role: dict[str, set[str]] = defaultdict(set)
        for row in graph.get("method_area_role_routes", []):
            if row.get("area_id") == area_id and row.get("method_id") in set(method_ids):
                role_id = str(row.get("role_id") or "")
                role_items_by_role[role_id].update(str(item_id) for item_id in [
                    *(row.get("role_item_ids", []) or []), *(row.get("method_specific_role_item_ids", []) or []),
                ] if item_id in nodes)
        for source in [route, *contributions]:
            for item_id in [*(source.get("role_item_ids", []) or []), *(source.get("method_specific_role_item_ids", []) or [])]:
                role_id = str(nodes.get(str(item_id), {}).get("role_id") or "")
                if role_id and item_id in nodes:
                    role_items_by_role[role_id].add(str(item_id))
        if not role_ids:
            role_ids = list(role_items_by_role)

        role_paths: list[dict[str, Any]] = []
        role_stage_item_ids: set[str] = set()
        for role_id in role_ids:
            task_paths = []
            mapped_items: set[str] = set()
            for row in role_task_rows:
                if str(row.get("role_id")) != role_id:
                    continue
                task_id = str(row.get("role_task_id"))
                task_item_order = sorted(
                    {str(item_id) for item_id in row.get("role_item_ids", []) if item_id in nodes},
                    key=lambda item_id: (int(nodes.get(item_id, {}).get("queue_position", 10**9)), item_id),
                )
                task_items = set(task_item_order)
                for item_id in task_item_order:
                    if item_id not in route_item_order:
                        route_item_order.append(item_id)
                mapped_items.update(task_items)
                tools = sequence_ordered_ids([str(tool.get("tool_node_id")) for tool in role_tool_rows
                                              if tool.get("role_id") == role_id and tool.get("task_node_id") == task_id and tool.get("tool_node_id")])
                role_stage_item_ids.update(task_items)
                role_stage_item_ids.update(tools)
                task_paths.append({
                    "task_family_id": row.get("task_family_id"), "role_task_id": task_id,
                    "role_item_ids_by_requirement_lane": lane_groups(task_items), "role_tool_ids": tools,
                    "condition": row.get("condition"), "source_references": row.get("source_references", []),
                    "within_group_items_are_parallel_choices_inside_ordered_route": True,
                })
            role_paths.append({
                "role_id": role_id, "role_task_paths": task_paths,
                "role_item_ids_by_requirement_lane": lane_groups(mapped_items),
                "unmapped_route_role_item_ids": sorted(role_items_by_role.get(role_id, set()) - mapped_items),
                "role_items_are_skippable": True,
                "role_item_order_scope": "Items follow the selected role-task context in the ordered route; within-task item pairs are ordered only by reviewed edges.",
            })
            role_stage_item_ids.update(role_items_by_role.get(role_id, set()))

        path_ids = set(method_ids) | set(domain_foundation_order) | set(foundation_ids) | domain_items | domain_tools | area_items | area_tools | family_ids | set(role_ids)
        path_ids.update(str(row.get("role_task_id")) for row in role_task_rows if row.get("role_task_id"))
        for role_path in role_paths:
            for lane_values in role_path["role_item_ids_by_requirement_lane"].values():
                path_ids.update(lane_values)
            for task_path in role_path["role_task_paths"]:
                path_ids.update(task_path["role_tool_ids"])
        sequence_edges = [edge for edge in edges if edge.get("sequence_approved") is True
                          and edge.get("sequence_policy") in {"conditional_prerequisite", "workflow"}
                          and edge.get("source") in path_ids and edge.get("target") in path_ids]
        def is_selectable_alternative(edge: dict[str, Any]) -> bool:
            relationship = edge.get("relationship")
            expected_basis = "source_backed_role_task_tool_alternative" if relationship == "tool_alternative_for_role_task" else "source_backed_alternative_relationship"
            expected_role = "role_task_tool_alternative_evidence" if relationship == "tool_alternative_for_role_task" else "alternative_relationship_evidence"
            if (relationship not in {"alternative_to", "alternative_tool_option", "tool_alternative_for_role_task"}
                    or edge.get("status") != "resolved_ready_for_use"
                    or edge.get("source_resolved") is False
                    or edge.get("target_resolved") is False
                    or edge.get("selectable") is False
                    or edge.get("alternative_review_disposition") not in {None, "approved"}
                    or edge.get("route_availability") == "unavailable_destination"
                    or edge.get("evidence_basis") != expected_basis):
                return False
            return any(
                ref.get("source_role") == expected_role
                and (str(ref.get("url") or ref.get("source_url") or "").startswith("https://") or bool(ref.get("locator")))
                for ref in edge.get("source_references", [])
            )

        alternative_edges = [edge for edge in edges if is_selectable_alternative(edge)
                             and edge.get("source") in path_ids and edge.get("target") in path_ids]
        prereq_ids = [str(edge["id"]) for edge in sequence_edges if edge.get("sequence_policy") == "conditional_prerequisite" and edge.get("id")]
        workflow_ids = [str(edge["id"]) for edge in sequence_edges if edge.get("sequence_policy") == "workflow" and edge.get("id")]
        domain_stage_item_ids = set(domain_items)
        contribution_sources = {str(row.get("method_id")): row for row in contributions if row.get("method_id")}
        if not contribution_sources and route.get("method_id"):
            contribution_sources[str(route["method_id"])] = route
        method_contribution_plan: list[dict[str, Any]] = []
        for method_id in method_ids:
            source = contribution_sources.get(str(method_id), {})
            source_item_ids = {
                str(item_id)
                for field in ("task_linked_domain_item_ids", "domain_downstream_item_ids", "available_item_ids")
                for item_id in source.get(field, [])
            }
            source_item_ids.update(layer_items_by_method.get(str(method_id), []))
            source_tool_ids = {
                str(item_id)
                for field in ("domain_tool_ids",)
                for item_id in source.get(field, [])
            }
            source_tool_ids.update(
                item_id for item_id in layer_items_by_method.get(str(method_id), [])
                if item_id in domain_tools
            )
            if len(method_ids) == 1:
                # A single-method route is itself the exact context for every
                # method-stage choice; do not leave its choices unattributed.
                source_item_ids.update(domain_stage_item_ids)
                source_tool_ids.update(domain_tools)
            item_ids = sequence_ordered_ids(source_item_ids & domain_stage_item_ids, route_item_order)
            tool_ids = sequence_ordered_ids(source_tool_ids & domain_tools, route_item_order)
            method_node = nodes.get(str(method_id), {})
            method_contribution_plan.append({
                "method_id": str(method_id),
                "method_label": str(method_node.get("student_title") or method_node.get("display_label") or method_node.get("label") or method_id),
                "contribution": str(source.get("contribution") or method_node.get("student_explanation") or "This is a selected method in the route."),
                "source_route_id": str(source.get("method_area_route_id") or source.get("route_node_id") or route.get("id") or ""),
                "task_family_ids": sequence_ordered_ids(source.get("task_family_ids", [])),
                "item_ids": item_ids,
                "tool_ids": tool_ids,
                "selection_policy": "skippable_choices_before_area_stage",
                "blocking_policy": "never",
            })
        contribution_item_methods: dict[str, list[str]] = defaultdict(list)
        contribution_tool_methods: dict[str, list[str]] = defaultdict(list)
        for contribution in method_contribution_plan:
            for item_id in contribution["item_ids"]:
                contribution_item_methods[item_id].append(contribution["method_id"])
            for tool_id in contribution["tool_ids"]:
                contribution_tool_methods[tool_id].append(contribution["method_id"])
        method_stage_unattributed_item_ids = sorted(
            domain_stage_item_ids - set(contribution_item_methods) - domain_tools
        )
        method_stage_unattributed_tool_ids = sorted(domain_tools - set(contribution_tool_methods))
        method_stage_shared_item_ids = sorted(
            item_id for item_id, owners in contribution_item_methods.items() if len(set(owners)) > 1
        )
        method_stage_shared_tool_ids = sorted(
            item_id for item_id, owners in contribution_tool_methods.items() if len(set(owners)) > 1
        )
        foundation_order = sorted(foundation_ids, key=lambda item_id: (
            nodes.get(item_id, {}).get("requirement_scope", {}).get("recommended_teaching_order", 999), item_id,
        ))
        society_id = "runtime-item:domain:d078:d078-society-and-social-world-knowledge"
        society_node = nodes.get(society_id)
        if (not society_node or society_node.get("student_visible") is not True
                or society_node.get("approval") == "unapproved"
                or society_node.get("student_selectable") is False
                or node_lane(society_id) in {"needed", "required", "compulsory"}):
            raise ValueError("The optional Society/social-world choice must be approved, visible, selectable, and non-compulsory")
        task_family_order = sequence_ordered_ids(family_ids)
        stages = [
            {"position": 1, "stage_id": "domain_foundations", "semantics": "must_complete_before_methods",
             "item_ids": domain_foundation_order, "skippable": False, "blocks_progression": True},
            {"position": 2, "stage_id": "society_and_social_world_orientation", "semantics": "orientation_before_methods",
             "item_ids": [society_id] if nodes.get(society_id, {}).get("student_visible") is True else [],
             "selection_policy": "optional_select_or_skip_before_methods",
             "skippable": True, "blocks_progression": False},
            {"position": 3, "stage_id": "method_or_named_design", "semantics": "choose_exact_supported_route",
             "method_ids": method_ids, "combination_id": route.get("combination_id"),
             "component_variant_id": route.get("component_variant_id"), "blocks_progression": True},
            {"position": 4, "stage_id": "method_linked_domain_learning", "semantics": "requirement_lanes_then_reviewed_sequence_edges",
             "item_ids_by_requirement_lane": lane_groups(domain_items, route_item_order), "tool_ids": sequence_ordered_ids(domain_tools, route_item_order),
             "layer_two_three_item_ids": sequence_ordered_ids(layer_items, route_item_order), "conditional_prerequisite_edge_ids": prereq_ids,
             "method_contributions": method_contribution_plan,
             "shared_item_ids_across_selected_methods": method_stage_shared_item_ids,
             "shared_tool_ids_across_selected_methods": method_stage_shared_tool_ids,
             "unattributed_route_item_ids": method_stage_unattributed_item_ids,
             "unattributed_route_tool_ids": method_stage_unattributed_tool_ids,
             "contribution_display_policy": "For a combined route, preserve each selected method's reviewed item/tool contribution. Deduplicate shared cards in the UI while naming every selected method they support. Keep any unresolved route-level item explicitly identified; never silently assign it to a method.",
             "group_ordering_scope": "Domain knowledge layers follow their reviewed source sequence; method-contribution groups are parallel siblings unless a reviewed item edge connects specific members.",
             "recommended_workflow_edge_ids": workflow_ids,
             "sequence_edges": [{"id": edge["id"], "source": edge["source"], "target": edge["target"],
                                 "policy": edge["sequence_policy"], "condition": edge.get("condition"),
                                 "recommendation_only": edge.get("recommendation_only") is True}
                                for edge in sequence_edges if edge.get("source") in domain_items | domain_tools
                                and edge.get("target") in domain_items | domain_tools],
             "within_group_items_are_parallel_choices_inside_ordered_route": True, "skippable_when_not_selected": True,
             "skipping_preserves_baseline_area_and_role_routes": True},
            {"position": 5, "stage_id": "area_start", "semantics": "optional_area_foundation_choices_then_task_choices",
             "area_id": area_id, "area_foundation_ids": foundation_order, "foundation_skippable": True,
             "group_ordering_scope": "Area-foundation choices stay inside the selected area route; only reviewed item edges order specific foundation pairs.",
             "no_additional_foundation_established": not bool(foundation_order),
             "blocks_progression": False},
            {"position": 6, "stage_id": "area_task_family_choices", "semantics": "choose_none_or_one_or_more",
             "task_family_ids": task_family_order,
             "group_ordering_scope": "Task families are selectable parallel work-context branches, not steps in a required family sequence.",
             "preparation_contexts": [
                 {"task_family_id": family_id, **nodes[family_id]["task_preparation_context"]}
                 for family_id in task_family_order
                 if isinstance(nodes.get(family_id, {}).get("task_preparation_context"), dict)
             ],
             "preparation_display_rule": "Show a selected family’s reviewed preparation after selection and before its linked area items; it is contextual guidance, not a prerequisite gate.",
             "zero_selection_preserves_general_route": True,
             "multiple_selection_allowed": True, "blocks_progression": False},
            {"position": 7, "stage_id": "area_learning_and_tools", "semantics": "group_by_selected_task_family_and_requirement_lane",
             "item_ids_by_requirement_lane": lane_groups(area_items, route_item_order), "tool_ids": sequence_ordered_ids(area_tools, route_item_order),
             "follows_selected_task_preparation_context": True,
             "group_ordering_scope": "Learning groups follow the selected family context; item order inside a group comes only from reviewed item edges.",
             "sequence_edge_ids": [str(edge["id"]) for edge in sequence_edges
                                   if edge.get("source") in area_items | area_tools and edge.get("target") in area_items | area_tools and edge.get("id")],
             "sequence_edges": [{"id": edge["id"], "source": edge["source"], "target": edge["target"],
                                 "policy": edge["sequence_policy"], "condition": edge.get("condition"),
                                 "recommendation_only": edge.get("recommendation_only") is True}
                                for edge in sequence_edges if edge.get("source") in area_items | area_tools
                                and edge.get("target") in area_items | area_tools],
             "within_group_items_are_parallel_choices_inside_ordered_route": True,
             "non_required_items_skippable": True, "blocks_progression": False},
            {"position": 8, "stage_id": "role_choices", "semantics": "choose_zero_or_more_roles_in_selected_area",
             "role_ids": role_ids, "roles_are_parallel_choices_not_a_learning_sequence": True,
             "group_ordering_scope": "Roles are choices downstream of the selected area route; choosing a role reveals its own reviewed task contexts.",
             "blocks_progression": False},
            {"position": 9, "stage_id": "role_task_learning_and_tools", "semantics": "group_by_reviewed_role_task_and_requirement_lane",
             "role_paths": role_paths, "all_role_items_skippable": True,
             "role_item_order_scope": "The selected role-task context follows the selected role; item pairs inside that context are ordered only by reviewed edges.",
             "group_ordering_scope": "Role-task contexts are nested under the selected role and inherited area route; they are not standalone routes.",
             "sequence_edges": [{"id": edge["id"], "source": edge["source"], "target": edge["target"],
                                 "policy": edge["sequence_policy"], "condition": edge.get("condition"),
                                 "recommendation_only": edge.get("recommendation_only") is True}
                                for edge in sequence_edges if edge.get("source") in role_stage_item_ids
                                and edge.get("target") in role_stage_item_ids],
             "within_group_items_are_parallel_choices_inside_ordered_route": True, "blocks_progression": False},
        ]
        for index, stage in enumerate(stages):
            stage["route_ordering"] = {
                "scope": "ordered_progressive_route_stage",
                "position": int(stage["position"]),
                "previous_stage_id": stages[index - 1]["stage_id"] if index else None,
                "next_stage_id": stages[index + 1]["stage_id"] if index + 1 < len(stages) else None,
                "meaning": "This stage follows the previous selected-route stage. Stage order governs reveal/navigation; it does not by itself make every item a prerequisite.",
            }
        stage_by_item: dict[str, tuple[int, str]] = {}
        for stage in stages:
            position = int(stage["position"])
            stage_id = str(stage["stage_id"])
            stage_items: set[str] = set()
            for field in ("item_ids", "method_ids", "area_foundation_ids", "task_family_ids", "role_ids", "tool_ids", "layer_two_three_item_ids"):
                stage_items.update(str(item_id) for item_id in stage.get(field, []))
            for lane_values in stage.get("item_ids_by_requirement_lane", {}).values():
                stage_items.update(str(item_id) for item_id in lane_values)
            for role_path in stage.get("role_paths", []):
                stage_items.add(str(role_path.get("role_id")))
                for lane_values in role_path.get("role_item_ids_by_requirement_lane", {}).values():
                    stage_items.update(str(item_id) for item_id in lane_values)
                for task_path in role_path.get("role_task_paths", []):
                    stage_items.update(str(item_id) for item_id in task_path.get("role_tool_ids", []))
                    if task_path.get("role_task_id"):
                        stage_items.add(str(task_path["role_task_id"]))
            for item_id in stage_items:
                stage_by_item[item_id] = (position, stage_id)
        route_sequence_edges = []
        for edge in sequence_edges:
            source_stage = stage_by_item.get(str(edge.get("source")))
            target_stage = stage_by_item.get(str(edge.get("target")))
            if not source_stage or not target_stage:
                continue
            route_sequence_edges.append({
                "id": edge["id"], "source": edge["source"], "target": edge["target"],
                "policy": edge["sequence_policy"], "condition": edge.get("condition"),
                "recommendation_only": edge.get("recommendation_only") is True,
                "source_stage": source_stage[1], "source_stage_position": source_stage[0],
                "target_stage": target_stage[1], "target_stage_position": target_stage[0],
            })

        # A route plan must encode the display/reveal structure explicitly.
        # Stage order is not enough: items inside the method, area, and role
        # stages also need exact route/context groups so a renderer or test
        # guide cannot flatten unrelated choices into a guessed sequence.
        for edge in route_sequence_edges:
            if edge["source_stage_position"] > edge["target_stage_position"]:
                raise ValueError(
                    f"Approved sequence edge contradicts D078 stage order in {route.get('id')}: "
                    f"{edge['id']} ({edge['source_stage']} -> {edge['target_stage']})"
                )
        # This topological check includes all nodes reached by the selected
        # route, including cross-stage and cross-context edges.
        sequence_ordered_ids(path_ids)

        method_stage = stages[3]
        domain_layer_groups: list[dict[str, Any]] = []
        layer_item_ids_by_position: dict[int, set[str]] = defaultdict(set)
        for layer in sorted(
            (row for row in graph.get("domain_learning_layers", []) if row.get("layer") in {2, 3}),
            key=lambda row: (int(row.get("sequence_order", 10**9)), int(row.get("layer", 10**9))),
        ):
            layer_number = int(layer["layer"])
            layer_candidates = {
                str(item_id) for item_id in layer.get("item_ids", [])
                if str(item_id) in domain_stage_item_ids
                and str(item_id) != "runtime-item:domain:d078:d078-society-and-social-world-knowledge"
            }
            owners_by_item = {
                item_id: [method_id for method_id in method_ids
                          if item_id in set(layer_items_by_method.get(str(method_id), []))]
                for item_id in layer_candidates
            }
            layer_ids = {item_id for item_id, owners in owners_by_item.items() if owners}
            layer_item_ids_by_position[layer_number].update(layer_ids)
            domain_layer_groups.append({
                "group_id": f"domain_learning_layer_{layer_number}",
                "display_group_position": len(domain_layer_groups) + 1,
                "source_layer": layer_number,
                "source_sequence_order": int(layer.get("sequence_order", 10**9)),
                "group_ordering": {
                    "scope": "ordered_domain_learning_layer_group",
                    "position": int(layer.get("sequence_order", 10**9)),
                    "basis": "reviewed_domain_learning_layers_sequence_order",
                    "meaning": "This layer is displayed after the preceding domain layer in the selected method route; this does not make every item in the layer compulsory.",
                },
                "title": str(layer.get("name") or f"Domain learning layer {layer_number}"),
                "purpose": str(layer.get("purpose") or ""),
                "item_ids_by_requirement_lane": lane_groups(layer_ids, route_item_order),
                "method_ids_by_item": {item_id: owners_by_item[item_id] for item_id in sorted(layer_ids)},
                "sequence_edges": [edge for edge in route_sequence_edges
                                   if edge["source"] in layer_ids and edge["target"] in layer_ids],
                "within_group_order_policy": "reviewed_sequence_edges_only; otherwise_parallel_choices",
                "group_order_is_not_a_prerequisite": True,
                "skippable": True,
                "blocks_progression": False,
            })

        layered_domain_ids = set().union(*layer_item_ids_by_position.values()) if layer_item_ids_by_position else set()
        method_items = domain_stage_item_ids - layered_domain_ids
        item_owners: dict[str, set[str]] = defaultdict(set)
        tool_owners: dict[str, set[str]] = defaultdict(set)
        for contribution in method_contribution_plan:
            method_id = str(contribution.get("method_id") or "")
            for item_id in contribution.get("item_ids", []):
                if item_id in method_items:
                    item_owners[str(item_id)].add(method_id)
            for tool_id in contribution.get("tool_ids", []):
                if tool_id in domain_tools:
                    tool_owners[str(tool_id)].add(method_id)

        contribution_owners: dict[tuple[str, ...], dict[str, set[str]]] = defaultdict(
            lambda: {"items": set(), "tools": set()}
        )
        for item_id in method_items:
            contribution_owners[tuple(sorted(item_owners.get(item_id, set())))]["items"].add(item_id)
        for tool_id in domain_tools:
            contribution_owners[tuple(sorted(tool_owners.get(tool_id, set())))]["tools"].add(tool_id)

        method_specific_groups: list[dict[str, Any]] = []
        for owners, grouped_ids in sorted(contribution_owners.items(), key=lambda row: (row[0], sorted(row[1]["items"] | row[1]["tools"]))):
            grouped_item_ids = grouped_ids["items"]
            grouped_tool_ids = grouped_ids["tools"]
            if not grouped_item_ids and not grouped_tool_ids:
                continue
            group_node_ids = grouped_item_ids | grouped_tool_ids
            method_specific_groups.append({
                "group_id": "method_contribution:" + ("+".join(owners) if owners else "unattributed"),
                "display_group_position": len(domain_layer_groups) + 1,
                "group_ordering": {
                    "scope": "parallel_method_contribution_group",
                    "position": None,
                    "basis": "exact_selected_method_contribution",
                    "meaning": "This is a route-relevant method contribution, not a later learning rank. Specific item pairs are ordered only by their reviewed edges.",
                },
                "method_ids": list(owners),
                "item_ids_by_requirement_lane": lane_groups(grouped_item_ids, route_item_order),
                "tool_ids": sequence_ordered_ids(grouped_tool_ids, route_item_order),
                "sequence_edges": [edge for edge in route_sequence_edges
                                   if edge["source"] in group_node_ids and edge["target"] in group_node_ids],
                "within_group_order_policy": "reviewed_sequence_edges_only; otherwise_parallel_choices",
                "group_order_is_not_a_prerequisite": True,
                "skippable": True,
                "blocks_progression": False,
            })

        method_stage["learning_order_groups"] = [*domain_layer_groups, *method_specific_groups]
        method_stage["learning_order_group_policy"] = {
            "group_order_source": "domain_learning_layers.sequence_order_then_exact_method_contribution_context",
            "layer_group_order_is_progressive_presentation_not_a_prerequisite": True,
            "method_contribution_groups_are_parallel_when_no_reviewed_edge_orders_them": True,
            "item_choice_scope": "Every item remains connected to its selected method route and contribution group even when no item-pair prerequisite is established.",
            "within_group_order_source": "only_attached_reviewed_sequence_edges",
            "alternative_edges_are_compare_choices_not_sequence_steps": True,
            "optional_choices_can_be_skipped_without_blocking_area_routes": True,
        }

        area_stage = stages[6]
        family_learning_groups: list[dict[str, Any]] = []
        family_linked_item_ids: set[str] = set()
        for family_path in family_paths:
            family_id = str(family_path.get("task_family_id") or "")
            family_ids_in_path = {
                str(edge.get("area_item_id")) for edge in family_path.get("area_learning_item_edges", [])
                if edge.get("area_item_id") and str(edge.get("area_item_id")) in area_items | area_tools
            }
            family_linked_item_ids.update(family_ids_in_path)
            family_tool_ids = {item_id for item_id in family_ids_in_path if is_tool_node(item_id)}
            family_learning_ids = family_ids_in_path - family_tool_ids
            family_learning_groups.append({
                "group_id": f"area_task_family:{family_id}",
                "task_family_id": family_id,
                "group_ordering": {
                    "scope": "parallel_selectable_area_task_family_branch",
                    "position": None,
                    "basis": "learner_selected_area_work_context",
                    "meaning": "Selecting this family opens its preparation and linked learning; sibling families are alternative or combinable work contexts, not ordered prerequisites.",
                },
                "title": str(family_path.get("label")
                             or nodes.get(family_id, {}).get("student_title")
                             or nodes.get(family_id, {}).get("display_label")
                             or nodes.get(family_id, {}).get("label")
                             or family_id),
                "selected_domain_item_context": [
                    {"item_id": str(edge.get("domain_item_id")), "edge_id": str(edge.get("edge_id")),
                     "condition": str(edge.get("condition") or "")}
                    for edge in family_path.get("domain_item_context_edges", [])
                    if edge.get("domain_item_id") and edge.get("edge_id")
                ],
                "preparation_context": nodes.get(family_id, {}).get("task_preparation_context", {}),
                "item_ids_by_requirement_lane": lane_groups(family_learning_ids, route_item_order),
                "tool_ids": sequence_ordered_ids(family_tool_ids, route_item_order),
                "sequence_edges": [edge for edge in route_sequence_edges
                                   if edge["source"] in family_ids_in_path and edge["target"] in family_ids_in_path],
                "within_group_order_policy": "reviewed_sequence_edges_only; otherwise_parallel_choices",
                "shared_item_deduplication": "show_shared_card_once_and_retain_each_selected_task_family_context",
                "skippable": True,
                "blocks_progression": False,
            })

        general_area_ids = (area_items | area_tools) - family_linked_item_ids
        general_area_item_ids = {item_id for item_id in general_area_ids if not is_tool_node(item_id)}
        general_area_tool_ids = {item_id for item_id in general_area_ids if is_tool_node(item_id)}
        area_represented_ids = family_linked_item_ids | general_area_item_ids | general_area_tool_ids
        # Tools may be separate graph nodes linked to a family through their
        # own reviewed tool-support edge rather than a task_has_area_learning_item
        # edge. Keep those visible only in the no-focus baseline unless an
        # exact family context edge identifies them.
        if area_represented_ids != (area_items | area_tools):
            missing_area_ids = (area_items | area_tools) - area_represented_ids
            general_area_tool_ids.update(item_id for item_id in missing_area_ids if is_tool_node(item_id))
            general_area_item_ids.update(item_id for item_id in missing_area_ids if not is_tool_node(item_id))
        area_stage["task_family_learning_groups"] = family_learning_groups
        area_stage["general_area_learning_group"] = {
            "group_id": "general_area_route_without_task_family_focus",
            "group_ordering": {
                "scope": "baseline_area_route_without_task_family_focus",
                "position": None,
                "basis": "selected_method_and_area_route",
                "meaning": "This preserves the area route when the learner selects no task-family focus; it is not detached from the upstream route.",
            },
            "item_ids_by_requirement_lane": lane_groups(general_area_item_ids, route_item_order),
            "tool_ids": sequence_ordered_ids(general_area_tool_ids, route_item_order),
            "shown_when_no_task_family_is_selected": True,
            "within_group_order_policy": "reviewed_sequence_edges_only; otherwise_parallel_choices",
            "skippable": True,
            "blocks_progression": False,
        }
        area_stage["learning_order_group_policy"] = {
            "progression": "optional_area_foundation_then_task_family_choice_then_selected_family_preparation_then_family_linked_learning_and_tools",
            "multiple_task_families": "union_only_the_individually_reviewed_paths_for_the_selected_families; deduplicate shared cards and retain all contexts",
            "zero_task_families": "preserve_the_general_area_route_without_claiming_a_task_family_specific_connection",
            "item_choice_scope": "Area learning remains attached to the selected method/design and area route; task-family groups narrow that context rather than replace the baseline.",
            "within_group_order_source": "only_attached_reviewed_sequence_edges",
            "optional_choices_can_be_skipped_without_blocking_role_routes": True,
        }

        role_stage = stages[8]
        for role_path in role_stage.get("role_paths", []):
            for task_path in role_path.get("role_task_paths", []):
                task_item_ids = {
                    str(item_id)
                    for lane_items in task_path.get("role_item_ids_by_requirement_lane", {}).values()
                    for item_id in lane_items
                }
                task_tool_ids = {str(item_id) for item_id in task_path.get("role_tool_ids", [])}
                task_item_ids_with_tools = task_item_ids | task_tool_ids
                task_path["learning_order_groups"] = [{
                    "group_id": f"role_task:{task_path.get('role_task_id')}",
                    "group_ordering": {
                        "scope": "role_task_context_after_selected_role",
                        "position": None,
                        "basis": "reviewed_area_task_to_role_task_route",
                        "meaning": "This task context is available only through the selected area and role route; its items remain inside this context.",
                    },
                    "role_id": str(role_path.get("role_id") or ""),
                    "role_task_id": str(task_path.get("role_task_id") or ""),
                    "item_ids_by_requirement_lane": task_path.get("role_item_ids_by_requirement_lane", {}),
                    "tool_ids": task_path.get("role_tool_ids", []),
                    "sequence_edges": [edge for edge in route_sequence_edges
                                       if edge["source"] in task_item_ids_with_tools and edge["target"] in task_item_ids_with_tools],
                    "within_group_order_policy": "reviewed_sequence_edges_only; otherwise_parallel_choices",
                    "role_task_context_is_required_for_display": True,
                    "all_items_and_tools_skippable": True,
                    "blocks_progression": False,
                }]
            role_path["unmapped_role_items_are_not_selectable_without_a_reviewed_upstream_task_context"] = True
        role_stage["learning_order_group_policy"] = {
            "progression": "selected_area_route_then_role_choice_then_only_reviewed_role_task_contexts_then_context_linked_role_items_and_tools",
            "role_items_without_a_reviewed_upstream_area_task_and_role_task_path": "exclude_from_student_selection",
            "item_choice_scope": "Role items and tools remain attached to the selected method/design, area, role, and reviewed role-task context; no item is an independent upstream route.",
            "within_role_task_order_source": "only_attached_reviewed_sequence_edges",
            "no_universal_role_prerequisite_is_inferred": True,
            "optional_choices_can_be_skipped": True,
        }

        society_id = "runtime-item:domain:d078:d078-society-and-social-world-knowledge"
        if nodes.get(society_id, {}).get("student_visible") is True:
            if stages[1].get("item_ids") != [society_id]:
                raise ValueError("Optional Society/social-world choice must immediately follow the three domain foundations")
            if any(society_id in stage.get("item_ids", [])
                   or society_id in stage.get("item_ids_by_requirement_lane", {}).get("needed", [])
                   for stage in stages[2:]):
                raise ValueError("Optional Society/social-world choice must not be duplicated downstream")
        method_group_ids = set().union(*(
            set(ids)
            for group in method_stage["learning_order_groups"]
            for ids in group.get("item_ids_by_requirement_lane", {}).values()
        )) | set().union(*(
            set(group.get("tool_ids", [])) for group in method_stage["learning_order_groups"]
        ))
        if method_group_ids != domain_stage_item_ids | domain_tools:
            raise ValueError(
                f"Method learning-order groups do not cover the exact route-stage content for {route.get('id')}: "
                f"missing={sorted((domain_stage_item_ids | domain_tools) - method_group_ids)}, "
                f"extra={sorted(method_group_ids - (domain_stage_item_ids | domain_tools))}"
            )
        family_group_ids = set().union(*(
            set(ids)
            for group in family_learning_groups
            for ids in group.get("item_ids_by_requirement_lane", {}).values()
        )) | set().union(*(set(group.get("tool_ids", [])) for group in family_learning_groups))
        no_focus_group_ids = set().union(*area_stage["general_area_learning_group"].get("item_ids_by_requirement_lane", {}).values()) | set(area_stage["general_area_learning_group"].get("tool_ids", []))
        if (family_group_ids | no_focus_group_ids) != (area_items | area_tools):
            raise ValueError(f"Area learning-order groups do not cover the exact route-stage content for {route.get('id')}")

        # Give every learning item an explicit route stage and group context.
        # Item-pair order is a narrower claim than route progression: an item
        # with no prerequisite edge is still a choice inside its ordered
        # method/area/role route, not an independent route or missing sequence.
        sequence_edges_by_item: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for edge in route_sequence_edges:
            sequence_edges_by_item[str(edge["source"])].append(edge)
            sequence_edges_by_item[str(edge["target"])].append(edge)
        alternatives_by_item: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for edge in alternative_edges:
            alternatives_by_item[str(edge["source"])].append(edge)
            alternatives_by_item[str(edge["target"])].append(edge)

        group_contexts_by_item: dict[tuple[str, int], list[dict[str, Any]]] = defaultdict(list)

        def register_group_context(group: dict[str, Any], stage: dict[str, Any], group_kind: str) -> None:
            member_ids = {
                str(item_id)
                for lane_items in group.get("item_ids_by_requirement_lane", {}).values()
                for item_id in lane_items
            }
            member_ids.update(str(item_id) for item_id in group.get("tool_ids", []))
            member_ids.update(str(item_id) for item_id in group.get("item_ids", []))
            if group.get("group_id") == "compulsory_domain_foundation_spine":
                member_ids.update(str(item_id) for item_id in stage.get("item_ids", []))
            for item_id in member_ids:
                context = {
                    "group_id": str(group.get("group_id") or f"stage:{stage['stage_id']}"),
                    "group_kind": group_kind,
                    "title": str(group.get("title") or group.get("label") or group.get("group_id") or ""),
                    "stage_id": str(stage["stage_id"]),
                    "stage_position": int(stage["position"]),
                    "group_ordering": group.get("group_ordering", {
                        "scope": "choice_group_inside_ordered_route_stage",
                        "position": None,
                        "basis": "selected_route_context",
                        "meaning": "This group belongs to this selected route stage; it does not create item prerequisites.",
                    }),
                    "within_group_order_policy": str(group.get("within_group_order_policy") or "reviewed_sequence_edges_only; otherwise_parallel_choices"),
                }
                for key in ("method_ids", "task_family_id", "role_id", "role_task_id", "selected_domain_item_context"):
                    if key in group:
                        context[key] = group[key]
                context_key = (item_id, int(stage["position"]))
                if context not in group_contexts_by_item[context_key]:
                    group_contexts_by_item[context_key].append(context)

        for stage in stages:
            stage_id = str(stage["stage_id"])
            if stage_id == "domain_foundations":
                register_group_context({
                    "group_id": "compulsory_domain_foundation_spine",
                    "item_ids": stage.get("item_ids", []),
                    "group_ordering": {
                        "scope": "required_ordered_domain_foundation_spine",
                        "basis": "reviewed_foundation_teaching_order",
                        "meaning": "These foundations are the required starting sequence before optional Society orientation and method selection.",
                    },
                    "within_group_order_policy": "reviewed_foundation_teaching_order",
                }, stage, "compulsory_foundation_spine")
            elif stage_id == "society_and_social_world_orientation":
                register_group_context({
                    "group_id": "optional_society_orientation",
                    "item_ids": stage.get("item_ids", []),
                    "group_ordering": {
                        "scope": "optional_orientation_between_foundations_and_methods",
                        "basis": "explicit_route_stage_position",
                        "meaning": "This optional choice sits after the shared foundations and before methods; selecting or skipping it preserves the same method routes.",
                    },
                }, stage, "optional_domain_orientation")
            elif stage_id == "area_start":
                register_group_context({
                    "group_id": f"area_foundation_choices:{area_id}",
                    "item_ids": stage.get("area_foundation_ids", []),
                    "group_ordering": {
                        "scope": "optional_foundation_choices_inside_selected_area_route",
                        "basis": "area_foundation_contract_and_reviewed_edges",
                        "meaning": "These area foundations are offered only after the upstream method/design reaches this area; only reviewed item edges order specific foundation pairs.",
                    },
                }, stage, "area_foundation_choices")
            for group in stage.get("learning_order_groups", []):
                register_group_context(group, stage, "method_learning_group")
            for group in stage.get("task_family_learning_groups", []):
                register_group_context(group, stage, "area_task_family_learning_group")
            general_group = stage.get("general_area_learning_group")
            if isinstance(general_group, dict):
                register_group_context(general_group, stage, "baseline_area_learning_group")
            for role_path in stage.get("role_paths", []):
                for task_path in role_path.get("role_task_paths", []):
                    for group in task_path.get("learning_order_groups", []):
                        register_group_context(group, stage, "reviewed_role_task_learning_group")

        item_occurrences: list[dict[str, Any]] = []
        seen_item_occurrences: set[tuple[str, str, str, str | None]] = set()

        def record_item_occurrence(item_id: str, stage_id: str, stage_position: int,
                                   requirement_lane: str, context_id: str | None = None) -> None:
            if item_id not in nodes:
                return
            occurrence_key = (item_id, stage_id, requirement_lane, context_id)
            if occurrence_key in seen_item_occurrences:
                return
            seen_item_occurrences.add(occurrence_key)
            node = nodes[item_id]
            touching_sequence = sequence_edges_by_item.get(item_id, [])
            touching_alternatives = alternatives_by_item.get(item_id, [])
            roles: list[str] = []
            for edge in touching_sequence:
                if edge["policy"] == "conditional_prerequisite":
                    roles.append("prerequisite_source_if_condition" if edge["source"] == item_id else "prerequisite_target_if_condition")
                else:
                    roles.append("recommended_before" if edge["source"] == item_id else "recommended_after")
            if touching_alternatives:
                roles.append("compare_with_exact_alternative")
            if is_tool_node(item_id):
                roles.append("choose_tool_for_selected_method_or_task")
            is_foundation = stage_id == "domain_foundations"
            if is_foundation:
                roles = ["compulsory_foundation_spine_position"]
            elif not touching_sequence:
                roles.append("parallel_choice_in_selected_route_context")
            group_contexts = group_contexts_by_item.get((item_id, stage_position), [])
            if not group_contexts:
                raise ValueError(
                    f"Route item has no explicit learning-group context in {route.get('id')}: {item_id} ({stage_id})"
                )
            within_group_order = (
                "ordered_by_reviewed_foundation_teaching_sequence" if is_foundation
                else "specific_item_pairs_ordered_only_by_attached_reviewed_edges" if touching_sequence
                else "parallel_choices_within_the_selected_ordered_route_group"
            )
            item_occurrences.append({
                "item_id": item_id,
                "stage_id": stage_id,
                "stage_position": stage_position,
                "requirement_lane": requirement_lane,
                "context_id": context_id,
                "group_contexts": group_contexts,
                "ordering_scope": {
                    "route_stage": {
                        "stage_id": stage_id,
                        "position": stage_position,
                        "scope": "ordered_progressive_route_stage",
                        "meaning": "The route reveals this context after the prior stage; this does not make every choice in the stage compulsory.",
                    },
                    "groups": [str(group["group_id"]) for group in group_contexts],
                    "within_group": within_group_order,
                    "sequence_edge_ids": sorted({str(edge["id"]) for edge in touching_sequence if edge.get("id")}),
                    "array_position_is_learning_rank": False,
                    "meaning": "Route-stage order and item-pair prerequisite order are separate. A parallel choice remains attached to the selected route/group and does not indicate a missing route sequence.",
                },
                "ordering_roles": list(dict.fromkeys(roles)),
                "sequence_edge_ids": sorted({str(edge["id"]) for edge in touching_sequence if edge.get("id")}),
                "alternative_edge_ids": sorted({str(edge["id"]) for edge in touching_alternatives if edge.get("id")}),
                "selection_policy": "compulsory_foundation" if is_foundation else "skippable",
                "foundation_teaching_order": (nodes[item_id].get("requirement_scope", {}).get("recommended_teaching_order")
                                               if is_foundation else None),
                "relative_order": ("ordered_foundation_position_in_progressive_route" if is_foundation
                                   else "specific_pair_order_from_attached_reviewed_edges" if touching_sequence
                                   else "parallel_choice_within_ordered_route_group"),
                "render_position_is_learning_rank": False,
                "student_visible": node.get("student_visible") is True,
                "student_selectable": node.get("student_selectable") is not False and not is_foundation,
            })

        stage_lane = {
            "domain_foundations": "needed",
            "society_and_social_world_orientation": "orientation",
            "method_linked_domain_learning": "",
            "area_start": "area_foundation",
            "area_learning_and_tools": "",
            "role_task_learning_and_tools": "",
        }
        for stage in stages:
            stage_id = str(stage["stage_id"])
            stage_position = int(stage["position"])
            for item_id in stage.get("item_ids", []):
                record_item_occurrence(str(item_id), stage_id, stage_position, stage_lane.get(stage_id, "choice"))
            for item_id in stage.get("area_foundation_ids", []):
                record_item_occurrence(str(item_id), stage_id, stage_position, "area_foundation", area_id)
            for lane, item_ids in stage.get("item_ids_by_requirement_lane", {}).items():
                for item_id in item_ids:
                    record_item_occurrence(str(item_id), stage_id, stage_position, str(lane), area_id if stage_id == "area_learning_and_tools" else None)
            for item_id in [*stage.get("tool_ids", []), *stage.get("layer_two_three_item_ids", [])]:
                record_item_occurrence(str(item_id), stage_id, stage_position,
                                       "tool_choice" if is_tool_node(str(item_id)) else "useful_choice")
            for role_path in stage.get("role_paths", []):
                role_id = str(role_path.get("role_id") or "")
                for task_path in role_path.get("role_task_paths", []):
                    task_id = str(task_path.get("role_task_id") or "")
                    context_id = f"{role_id}|{task_id}"
                    for lane, item_ids in task_path.get("role_item_ids_by_requirement_lane", {}).items():
                        for item_id in item_ids:
                            record_item_occurrence(str(item_id), stage_id, stage_position, str(lane), context_id)
                    for item_id in task_path.get("role_tool_ids", []):
                        record_item_occurrence(str(item_id), stage_id, stage_position, "tool_choice", context_id)

        return {
            "version": "d078-route-sequence-plan-2026-11-14-v6", "route_kind": route_kind,
            "route_id": route.get("route_node_id") or route.get("id"), "area_id": area_id,
            "method_ids": method_ids, "combination_id": route.get("combination_id"),
            "component_variant_id": route.get("component_variant_id"), "stages": stages,
            "item_sequence_dispositions": item_occurrences,
            "item_sequence_disposition_policy": "Every projected learning item has an explicit progressive route stage, requirement lane, and selected method/area/role group context. Route-stage order remains explicit even when item pairs inside a group are parallel choices. Only attached, reviewed prerequisite/workflow edges order specific item pairs; a missing pairwise edge does not mean the item or route is unsequenced.",
            "conditional_prerequisite_edge_ids": prereq_ids, "recommended_workflow_edge_ids": workflow_ids,
            "sequence_edges": route_sequence_edges,
            "alternative_edge_ids": sorted(str(edge["id"]) for edge in alternative_edges if edge.get("id")),
            "alternative_choice_pairs": [{"id": edge["id"], "source": edge["source"], "target": edge["target"],
                                           "relationship": edge["relationship"], "explanation": edge.get("explanation"),
                                           "exclusive": edge.get("alternative_is_exclusive") is True,
                                           "evidence_edge_id": edge["id"]}
                                          for edge in alternative_edges if edge.get("id")],
            "role_item_sequence_edges": [{"id": edge["id"], "source": edge["source"], "target": edge["target"],
                                           "policy": edge["sequence_policy"], "condition": edge.get("condition"),
                                           "recommendation_only": edge.get("recommendation_only") is True}
                                          for edge in sequence_edges if edge.get("source") in path_ids
                                          and edge.get("target") in path_ids
                                          and (edge.get("source") in role_stage_item_ids or edge.get("target") in role_stage_item_ids)],
            "display_order_policy": {
                "stage_order": [stage["stage_id"] for stage in stages],
                "requirement_lane_order": ["needed", "conditional", "useful_optional", "optional", "choose_one_alternative"],
            "item_order": "Every route item is assigned to a stage and requirement lane. A selected area task family reveals its sourced preparation context before that family’s linked area items; this context is not itself a learning prerequisite. Only reviewed conditional_prerequisite edges mark a conditional prerequisite; reviewed workflow edges mark a recommended next step. Exact alternatives and tools are choose/compare options. Remaining optional items are independent skippable choices, not an implied sequence. Stable rendering position is not a learning rank.",
                "alternatives": "Keep each alternative attached to its exact comparison target; it is not another step.",
                "tools": "Show a tool only within its method/task support context; tool options are choose/compare choices, not sequence steps.",
                "optional_skips": "A skipped optional, conditional, alternative, or tool choice never blocks the baseline route.",
            },
            "every_route_item_has_explicit_ordering_disposition": True,
            "parallel_choices_remain_attached_to_their_selected_route_and_group": True,
            "stage_order_is_not_item_pair_prerequisite_order": True,
            "optional_skips_preserve_route": True, "cycle_check_passed": True,
        }

    role_task_edges = [edge for edge in edges if evidence_ready(
        edge, "area_task_family_supports_role_task", "reviewed_cross_source_task_scope_synthesis",
    )]
    task_item_edges = [edge for edge in edges if evidence_ready(
        edge, "task_has_area_learning_item",
    )]
    domain_task_edges = [edge for edge in edges if evidence_ready(
        edge, "domain_item_supports_area_task", "reviewed_domain_item_area_task_synthesis",
    )]
    task_role_item_edges = [edge for edge in edges if evidence_ready(
        edge, "role_task_supports_role_item", "locally_verified_bounded_role_task_output_plus_item_and_role_sources",
    )]

    routes: list[dict[str, Any]] = []
    route_rows: list[tuple[str, dict[str, Any]]] = []
    route_rows.extend(("single_method", route) for route in graph.get("method_area_routes", []))
    route_rows.extend(("named_design", node) for node in graph.get("nodes", []) if node.get("kind") == "combination_area_route")
    # Participatory/action research is a design frame whose component set is
    # chosen by the learner. Its exact component variants have their own area
    # and role intersections; they must not be omitted or replaced by a union
    # of all standalone method routes.
    for design in graph.get("combination_designs", []):
        for variant in design.get("component_route_variants", []):
            for variant_route in variant.get("area_routes", []):
                route_rows.append(("named_design_component_variant", {
                    **variant_route,
                    "route_node_id": variant_route.get("id"),
                    "combination_id": design.get("id"),
                    "component_variant_id": variant.get("id"),
                    "active_method_ids": variant.get("active_method_ids", []),
                }))
    role_tools = graph.get("role_tool_routes", [])

    for route_kind, route in route_rows:
        area_id = str(route.get("area_id") or "")
        route_id = str(route.get("route_node_id") or route.get("id") or "")
        contributions = route_contributions(route)
        family_id_order = list(dict.fromkeys([
            *(str(value) for value in route.get("task_family_ids", [])),
            *(str(family_id) for row in contributions for family_id in row.get("task_family_ids", [])),
        ]))
        family_ids = set(family_id_order)
        role_ids = set(route.get("role_ids", []))
        foundation_ids = sorted(foundations_by_area.get(area_id, []))
        area_item_ids = {
            edge["target"] for edge in task_item_edges
            if edge.get("source") in family_ids
            and (nodes.get(str(edge.get("target")), {}).get("area_id") == area_id or edge.get("area_id") == area_id)
            and nodes.get(str(edge.get("target")), {}).get("student_visible") is True
            and nodes.get(str(edge.get("target")), {}).get("student_selectable") is not False
        }
        selected_domain_edges = [
            edge for edge in domain_task_edges
            if edge.get("target") in family_ids
            and nodes.get(str(edge.get("source")), {}).get("student_visible") is True
            and nodes.get(str(edge.get("source")), {}).get("student_selectable") is not False
        ]
        task_role_rows: list[dict[str, Any]] = []
        for family_edge in role_task_edges:
            family_id = str(family_edge.get("source"))
            task_id = str(family_edge.get("target"))
            task = nodes.get(task_id, {})
            role_id = str(task.get("role_id") or "")
            if family_id not in family_ids or role_id not in role_ids or area_id not in task.get("area_ids", []):
                continue
            item_edges = [edge for edge in task_role_item_edges if edge.get("source") == task_id
                          and nodes.get(str(edge.get("target")), {}).get("student_visible") is True
                          and nodes.get(str(edge.get("target")), {}).get("student_selectable") is not False
                          and nodes.get(str(edge.get("target")), {}).get("approval") == "approved"]
            task_role_rows.append({
                "task_family_id": family_id,
                "family_to_role_task_edge_id": family_edge.get("id"),
                "role_task_id": task_id,
                "role_id": role_id,
                "role_area_context_ids": list(task.get("area_ids", [])),
                "role_item_ids": sorted({str(edge["target"]) for edge in item_edges}),
                "role_item_edge_ids": sorted(str(edge.get("id")) for edge in item_edges if edge.get("id")),
                "condition": family_edge.get("condition"),
                "fit_claim_limit": family_edge.get("fit_claim_limit"),
                "learner_output": task.get("learner_output"),
                "limitations": task.get("limitations"),
                "task_evidence_text": task.get("task_evidence_text"),
                "source_references": family_edge.get("source_references", []),
            })

        family_paths: list[dict[str, Any]] = []
        for family_id in family_id_order:
            family_node = nodes.get(family_id, {})
            family_domain_edges = [edge for edge in selected_domain_edges if edge.get("target") == family_id]
            family_area_edges = [edge for edge in task_item_edges if edge.get("source") == family_id and edge.get("target") in area_item_ids
                                 and (nodes.get(str(edge.get("target")), {}).get("area_id") == area_id or edge.get("area_id") == area_id)]
            family_role_paths = [row for row in task_role_rows if row["task_family_id"] == family_id]
            family_paths.append({
                "task_family_id": family_id,
                "label": family_node.get("label"),
                "description": family_node.get("description") or family_node.get("meaning") or family_node.get("task_evidence_text"),
                "selection_role": family_node.get("task_family_selection_role"),
                "domain_item_context_edges": [
                    {"domain_item_id": edge.get("source"), "edge_id": edge.get("id"),
                     "condition": edge.get("condition"), "fit_claim_limit": edge.get("fit_claim_limit")}
                    for edge in family_domain_edges
                ],
                "area_learning_item_edges": [
                    {"area_item_id": edge.get("target"), "edge_id": edge.get("id"),
                     "requirement_lane": edge.get("requirement_lane"), "condition": edge.get("condition"),
                     "fit_claim_limit": edge.get("fit_claim_limit")}
                    for edge in family_area_edges
                ],
                "role_task_paths": [
                    {"role_id": row["role_id"], "role_task_id": row["role_task_id"],
                     "role_item_ids": row["role_item_ids"], "tool_route_ids": sorted(
                         str(tool.get("id")) for tool in role_tools
                         if tool.get("role_id") == row["role_id"] and tool.get("task_node_id") == row["role_task_id"]
                     )}
                    for row in family_role_paths
                ],
            })

        route_candidate_ids = family_ids | area_item_ids | role_ids
        route_candidate_ids.update(str(edge.get("source")) for edge in selected_domain_edges)
        route_candidate_ids.update(str(row["role_task_id"]) for row in task_role_rows)
        route_candidate_ids.update(item_id for row in task_role_rows for item_id in row["role_item_ids"])
        alternative_edges = [
            edge for edge in edges
            if edge.get("relationship") in {"alternative_to", "alternative_tool_option"}
            and edge.get("source") in route_candidate_ids and edge.get("target") in route_candidate_ids
            and edge.get("status") == "resolved_ready_for_use"
        ]
        role_tool_rows = [
            {"tool_node_id": tool.get("tool_node_id"), "task_node_id": tool.get("task_node_id"),
             "role_id": tool.get("role_id"), "area_ids": tool.get("area_ids", [])}
            for tool in role_tools
            if tool.get("role_id") in role_ids and area_id in tool.get("area_ids", [])
        ]
        route_method_ids = [str(route.get("method_id"))] if route_kind == "single_method" else [
            str(row.get("method_id")) for row in contributions if row.get("method_id")
        ]
        if route_kind == "named_design_component_variant" and not route_method_ids:
            route_method_ids = [str(method_id) for method_id in route.get("active_method_ids", [])]
        route_sequence_edges = [
            edge for edge in edges
            if edge.get("id", "").startswith("area-sequence:")
            and edge.get("status") == "resolved_ready_for_use"
            and edge.get("sequence_approved") is True
            and (edge.get("target") in area_item_ids or edge.get("source") in area_item_ids)
            and (edge.get("source") in route_candidate_ids or edge.get("source") in route_method_ids)
        ]
        route_record = {
            "route_id": route_id,
            "route_kind": route_kind,
            "method_ids": route_method_ids,
            "combination_id": route.get("combination_id") if route_kind == "named_design" else None,
            "component_variant_id": route.get("component_variant_id") if route_kind == "named_design_component_variant" else None,
            "area_id": area_id,
            "role_ids": list(role_ids),
            "area_start": "area_foundation_then_task_family_choices" if foundation_ids else "task_family_choices_directly",
            "area_foundation_ids": foundation_ids,
            "task_family_ids": family_id_order,
            "selected_domain_item_edges": [
                {"domain_item_id": edge.get("source"), "task_family_id": edge.get("target"), "edge_id": edge.get("id")}
                for edge in selected_domain_edges
            ],
            "area_learning_paths": family_paths,
            "task_family_area_item_edges": [
                {"task_family_id": edge.get("source"), "area_item_id": edge.get("target"), "edge_id": edge.get("id")}
                for edge in task_item_edges if edge.get("source") in family_ids and edge.get("target") in area_item_ids
            ],
            "role_task_paths": sorted(task_role_rows, key=lambda row: (row["role_id"], row["task_family_id"], row["role_task_id"])),
            "role_tool_routes": role_tool_rows,
            "alternative_edge_ids": sorted(str(edge.get("id")) for edge in alternative_edges if edge.get("id")),
            "approved_area_sequence_edge_ids": sorted(str(edge.get("id")) for edge in route_sequence_edges if edge.get("id")),
        }
        if route_kind == "named_design_component_variant":
            route_record["combination_id"] = route.get("combination_id")
        route_record["sequence_plan"] = build_route_sequence_plan(
            route_kind, route, route_method_ids, area_id, foundation_ids, family_ids,
            family_paths, task_role_rows, role_tool_rows,
        )
        routes.append(route_record)

    return {
        "version": "d078-selection-progression-contract-2026-11-14-v9",
        "meaning": "An explicitly ordered, route-scoped learning journey from domain foundations through optional Society orientation, selected methods/design, method learning, area foundations/task families/items, and selected roles/role-task items. A route or stage can be correctly ordered even when item pairs inside a group are parallel choices rather than prerequisites.",
        "ordering_model": {
            "route_progression": "The nine route stages are ordered and selection-dependent. A later stage is reached through the selected upstream route; no item is detached from that route.",
            "domain_learning_groups": "Layer 2 and Layer 3 groups follow the reviewed domain_learning_layers.sequence_order. Exact method contributions follow those layers as route-specific groups; item pairs inside a group are ordered only by reviewed edges.",
            "area_learning_groups": "An optional area foundation, when present, precedes task-family choice. Task families are selectable parallel contexts; selecting one reveals its own reviewed preparation and linked area items/tools. With no family selected, the route retains its baseline area group.",
            "role_learning_groups": "Roles appear only through the selected method/design and area route. A selected role reveals only role-task contexts reviewed from the selected area/task path; role items and tools remain inside those contexts.",
            "item_pair_order": "Only a reviewed, approved conditional_prerequisite or workflow edge orders the named item pair. Without such an edge, items are parallel skippable choices within their explicit route stage and group; this is not an unordered route, a missing route, or permission to detach the item.",
            "role_item_prerequisites": "The source audit found no approved item-to-item prerequisite inside role-task groups. Preserve the ordered route and role-task context; do not invent a role-item sequence. Add a pairwise edge only when evidence establishes the exact role, task, learning targets, and order.",
            "rendering": "Array position and alphabetical order are stable-rendering details, never learning rank. Display stage/group context and reviewed pairwise edges distinctly."
        },
        "baseline_without_optional_domain_items": "Keep every method/design-supported area and role path available; begin at any approved area foundation for that area, otherwise at that route's task-family choices. Optional selections never block the baseline.",
        "selected_domain_item_policy": "Use only resolved reviewed domain_item_supports_area_task edges for that selected item; follow them to the family, its reviewed area items, same-route roles, reviewed role-task context, task-linked role items and task-linked tools. Multiple selected items contribute the union of their individually reviewed paths; they do not create new unsupported edges.",
        "area_choice_order": "Area overview, then only the area's visible skippable foundation records when present, otherwise task-family choices immediately; selected domain context is identified; selected task families reveal linked area learning and their alternatives/tools; retain the no-focus baseline.",
        "role_choice_order": "Only roles on the selected method/design and area route. Carry selected domain and area context into the role. Show role-owned learning items and tools only inside a reviewed role-task context reached from the selected area/task route; do not expose unlinked role items as standalone choices or invent a direct domain-to-role path.",
        "item_order_policy": "Route stages and group contexts provide the ordered learning path. Within each stage/group, only reviewed sequence_approved=true conditional_prerequisite or workflow edges order specific item pairs. Other selectable items remain parallel choices in that ordered route/group; they are not detached, missing, or independently sourced routes. Relationship relevance, insertion order and item type never create a pairwise prerequisite.",
        "role_item_sequence_policy": "The role route is ordered as selected method/design -> selected area -> selected role -> reviewed role-task context -> that context's role items/tools. The source review found no approved item-to-item prerequisite inside role-task groups. Therefore items within a role-task group are parallel, skippable choices unless a reviewed edge orders a specific pair; this does not make the role path unordered. Unmapped role items remain non-selectable until a reviewed upstream area/task/role-task path exists.",
        "sequence_completion_policy": "Every declared single-method, named-design and exact component-variant area route has an explicit nine-stage plan. The three shared domain foundations are followed by the optional Society/social-world orientation, then the method/design choice. Method-linked choices are grouped by their applicable field-knowledge layer and exact selected-method contribution; area learning is grouped under its selected task-family paths; role learning and tools are grouped under reviewed role-task contexts. Only approved conditional_prerequisite edges are conditional prerequisites and approved workflow edges are recommended next steps. Group display order never creates a prerequisite. Alternatives remain exact compare choices, and all other choices are parallel and skippable. Build-time validation rejects backward cross-stage edges, sequence cycles, missing/group-duplicated route items, and Society appearing outside its pre-method slot.",
        "sequence_invariants": {
            "stage_order": ["domain_foundations", "society_and_social_world_orientation", "method_or_named_design", "method_linked_domain_learning", "area_start", "area_task_family_choices", "area_learning_and_tools", "role_choices", "role_task_learning_and_tools"],
            "society_orientation": "one optional selectable choice immediately after the three compulsory domain foundations and before any method; selecting or skipping it never blocks methods",
            "method_learning": "show exact route-applicable Layer 2 field knowledge and Layer 3 research practices after the selected method/design and before areas; preserve requirement lanes, exact method attribution and reviewed item edges",
            "area_learning": "after an optional area foundation, offer zero/one/multiple task-family choices; each selected family reveals only its own reviewed preparation and linked area items/tools; shared cards deduplicate while retaining each selected context",
            "role_learning": "roles appear only downstream of the selected method/design and area; role items/tools are selectable only inside a reviewed role-task context; no generic direct domain-to-role path is inferred",
            "optional_choices": "domain, area and role useful choices can be selected or skipped; skipping never blocks the baseline route",
            "edge_validation": "approved sequence edges must be acyclic and may not point backward across the declared stage order",
            "fallback_order": "An item without an item-pair edge remains a parallel choice inside its recorded route stage and group; route progression is still ordered. Source array position, item type and alphabetical order never imply learning rank",
            "stale_wording_guard": "The generator and regression test reject deprecated item-order dispositions. Every item records its route stage, all group memberships, and whether reviewed pairwise edges or parallel-choice semantics govern within-group order."
        },
        "routes": sorted(routes, key=lambda row: (row["route_kind"], row["route_id"], row["area_id"])),
        "counts": {
            "method_area_routes": sum(row["route_kind"] == "single_method" for row in routes),
            "named_design_area_routes": sum(row["route_kind"] == "named_design" for row in routes),
            "component_variant_area_routes": sum(row["route_kind"] == "named_design_component_variant" for row in routes),
            "selected_domain_item_area_task_edges": len({
                edge["edge_id"] for row in routes for edge in row["selected_domain_item_edges"] if edge.get("edge_id")
            }),
            "task_family_area_item_edges": len({
                edge["edge_id"] for row in routes for edge in row["task_family_area_item_edges"] if edge.get("edge_id")
            }),
            "area_task_role_paths": len({
                (path["task_family_id"], path["role_task_id"]) for row in routes for path in row["role_task_paths"]
            }),
            "role_item_context_edges": len({
                edge_id for row in routes for path in row["role_task_paths"] for edge_id in path["role_item_edge_ids"]
            }),
        },
    }


def enrich_area_and_role_overviews(graph: dict[str, Any]) -> dict[str, int]:
    """Carry reviewed local area boundaries and role descriptions into graph nodes.

    Canonical area/role nodes previously held only IDs and labels. Detailed
    route/task nodes existed, but the overview screen had no sourced prose to
    display. This copies only the already-reviewed catalog descriptions and
    records their provenance; it does not infer requirements or ordering.
    """
    catalog = json.loads(AREA_CATALOG_PATH.read_text(encoding="utf-8"))
    role_library = json.loads(ROLE_LIBRARY_PATH.read_text(encoding="utf-8"))
    domain_record = next((row for row in catalog.get("domains", []) if row.get("domain_id") == "D078"), None)
    if not domain_record:
        raise SystemExit("D078 area catalog record is missing")
    area_records = {str(row.get("area_key")): row for row in domain_record.get("areas", [])}
    role_records = {
        int(row["role_number"]): row for row in role_library
        if row.get("domain_id") == "D078" and row.get("role_number") is not None
    }
    nodes = {row["id"]: row for row in graph.get("nodes", [])}
    area_routes: dict[str, set[str]] = defaultdict(set)
    for collection in ("method_area_routes", "combination_area_routes"):
        for route in graph.get(collection, []):
            area_routes[str(route.get("area_id") or "")].update(str(role_id) for role_id in route.get("role_ids", []))
    for route in graph.get("method_area_role_routes", []):
        area_routes[str(route.get("area_id") or "")].add(str(route.get("role_id") or ""))
    for route in graph.get("combination_area_role_routes", []):
        area_routes[str(route.get("area_id") or "")].add(str(route.get("role_id") or ""))
    role_areas: dict[str, set[str]] = defaultdict(set)
    roles_by_area: dict[str, set[str]] = defaultdict(set)
    for area_id, role_ids in area_routes.items():
        for role_id in role_ids:
            if role_id:
                role_areas[role_id].add(area_id)
                roles_by_area[area_id].add(role_id)
    for edge in graph.get("edges", []):
        if edge.get("relationship") != "area_task_family_supports_role_task" or edge.get("status") != "resolved_ready_for_use":
            continue
        task = nodes.get(str(edge.get("target") or ""), {})
        role_id = str(task.get("role_id") or "")
        for area_id in task.get("area_ids", []):
            if role_id and area_id:
                role_areas[role_id].add(str(area_id))
                roles_by_area[str(area_id)].add(role_id)

    area_count = 0
    for node in nodes.values():
        if node.get("kind") != "area_of_specialization":
            continue
        area_id = str(node.get("area_id") or "")
        source = area_records.get(area_id)
        if not source or not source.get("boundary"):
            raise SystemExit(f"No reviewed D078 area boundary for {area_id}")
        evidence = source.get("evidence", [])
        if not evidence:
            raise SystemExit(f"No source evidence recorded for D078 area {area_id}")
        node.update({
            "description": source["boundary"],
            "overview": source["boundary"],
            "scope_limit": source["boundary"],
            "overview_source_artifact": str(AREA_CATALOG_PATH.relative_to(ROOT)).replace("\\", "/"),
            "overview_source_status": source.get("source_evidence_status") or source.get("recommendation_status") or "reviewed_local_catalog",
            "source_references": evidence,
            "supported_role_ids": sorted(roles_by_area.get(area_id, set())),
            "area_overview_is_not_a_learning_requirement": True,
        })
        area_count += 1

    role_count = 0
    for node in nodes.values():
        if node.get("kind") != "role":
            continue
        try:
            role_number = int(str(node["id"]).split(":")[2])
        except (KeyError, IndexError, ValueError):
            raise SystemExit(f"Cannot resolve D078 role-library record for {node.get('id')}")
        source = role_records.get(role_number)
        if not source or not source.get("description"):
            raise SystemExit(f"No role-library description for {node.get('id')}")
        reviewed_sources = source.get("specialization_fit_review_source_refs") or source.get("domain_fit_review_source_refs") or []
        if not reviewed_sources:
            raise SystemExit(f"No reviewed role source references for {node.get('id')}")
        node.update({
            "description": source["description"],
            "overview": source["description"],
            "overview_source_artifact": str(ROLE_LIBRARY_PATH.relative_to(ROOT)).replace("\\", "/"),
            "overview_source_status": source.get("specialization_fit_review_status") or source.get("domain_fit_review_status") or "reviewed_role_library",
            "overview_source_references": reviewed_sources,
            "supported_area_ids": sorted(role_areas.get(node["id"], set())),
            "role_context_is_not_job_readiness": True,
        })
        role_count += 1
    if area_count != 7 or role_count != 19:
        raise SystemExit(f"Expected 7 canonical areas and 19 D078 roles; enriched {area_count} areas and {role_count} roles")
    return {"area_overviews_enriched": area_count, "role_overviews_enriched": role_count}


def deduplicate_area_tool_aliases(graph: dict[str, Any]) -> dict[str, Any]:
    """Keep Mesa and Casevo distinct, area-stage-only items in reviewed contexts."""
    aliases = {
        "area_enrichment_item:d078-computational-digital-social-science-mesa-or-casevo": (
            "domain-item:d078-mesa-tool", "domain-item:d078-casevo-tool",
        ),
        "area_enrichment_item:soc-t2": ("domain-item:d078-mesa-tool",),
        "area_enrichment_item:soc-a2": ("domain-item:d078-casevo-tool",),
        # The Economics card is a second selectable presentation of the same
        # Casevo tool. Preserve its reviewed area/task context on the canonical
        # domain item instead of giving it a second selection identity.
        "area_enrichment_item:d078-econ-casevo-llm-sim": ("domain-item:d078-casevo-tool",),
    }
    nodes = {node["id"]: node for node in graph.get("nodes", [])}
    edges = graph.setdefault("edges", [])
    canonical_ids = sorted({item_id for values in aliases.values() for item_id in values})
    for canonical_id in canonical_ids:
        canonical = nodes.get(canonical_id)
        if not canonical:
            raise SystemExit(f"Canonical area tool is missing: {canonical_id}")
        # These are specialist area tools, not general domain-level choices.
        # They keep one item ID across areas but are selectable only after the
        # learner enters a supported area's task context.
        canonical["display_stage"] = "area"
        canonical["student_visibility_reason"] = (
            "Selectable only within a reviewed area/task context; not shown as a domain-wide tool choice."
        )
    replacements: list[dict[str, Any]] = []
    old_edges = [edge for edge in edges if edge.get("relationship") == "task_has_area_learning_item"
                 and edge.get("target") in aliases]
    existing_context_edges = [
        edge for edge in edges
        if edge.get("relationship") == "task_has_area_learning_item"
        and edge.get("evidence_basis") == "reviewed_canonical_domain_tool_area_context"
        and edge.get("deduplicated_from_area_node_id") in aliases
    ]
    for alias_id, alias_canonical_ids in aliases.items():
        alias = nodes.get(alias_id)
        if not alias:
            continue
        alias["student_visibility_reason"] = "Duplicate area card retired; Mesa and Casevo remain distinct tools shown only in their reviewed area/task contexts."
        alias["student_display_disposition"] = {
            "decision": "deduplicated_into_canonical_area_items", "reviewed_on": "2026-11-03",
            "basis": "Mesa and Casevo are separate tools with separate canonical identities. This duplicate area presentation is retired; each tool is selectable only in reviewed area/task contexts, not as a domain-wide choice.",
            "canonical_item_ids": list(alias_canonical_ids),
        }
        sources = [edge for edge in old_edges if edge.get("target") == alias_id]
        if not sources:
            # The graph generator also consumes its previously generated graph.
            # A rerun therefore sees retired aliases and their canonical context
            # edges, rather than the original alias-target edges. Accept that
            # already-reconciled state, but fail closed if no context survives.
            already_reconciled = any(
                edge.get("relationship") == "task_has_area_learning_item"
                and edge.get("deduplicated_from_area_node_id") == alias_id
                and edge.get("target") in alias_canonical_ids
                for edge in edges
            )
            if not already_reconciled:
                raise SystemExit(f"Duplicate area tool has no reviewed task context: {alias_id}")
            alias["student_visible"] = False
            alias["student_selectable"] = False
            alias["display_readiness"] = "deduplicated_into_canonical_area_items"
            alias["resolution_state"] = "resolved_as_canonical_area_item_context"
            alias["canonical_linked_item_ids"] = list(alias_canonical_ids)
            continue
        for source_edge in sources:
            family_id = str(source_edge.get("source") or "")
            family = nodes.get(family_id, {})
            for canonical_id in alias_canonical_ids:
                canonical = nodes.get(canonical_id)
                if not canonical or canonical.get("student_visible") is not True or canonical.get("student_selectable") is False:
                    raise SystemExit(f"Canonical area-stage tool is not selectable: {canonical_id}")
                refs = list(source_edge.get("source_references", []))
                for reference in canonical.get("evidence", []) + canonical.get("learning_links", []):
                    if not isinstance(reference, dict):
                        continue
                    url = str(reference.get("url") or "").strip()
                    locator = str(reference.get("locator") or reference.get("why_this_resource") or "").strip()
                    if url or locator:
                        refs.append({
                            "id": reference.get("id") or reference.get("source_id") or f"{canonical_id}:{url or locator}",
                            "title": reference.get("title") or reference.get("label") or canonical.get("label"),
                            "url": url, "locator": locator, "source_role": "domain_item_evidence",
                        })
                if family:
                    refs.append({
                        "id": f"internal:{family_id}",
                        "title": family.get("label") or "Reviewed area task context",
                        "url": "",
                        "locator": family.get("task_evidence_text") or family.get("description") or family_id,
                        "source_role": "area_task_evidence",
                    })
                unique_refs = []
                seen_refs = set()
                for reference in refs:
                    key = (str(reference.get("id") or ""), str(reference.get("url") or ""), str(reference.get("source_role") or ""))
                    if key not in seen_refs:
                        seen_refs.add(key)
                        unique_refs.append(reference)
                title = str(canonical.get("label") or canonical_id)
                replacements.append({
                    "id": f"canonical-area-tool-context:{family_id}->{canonical_id}",
                    "source": family_id, "target": canonical_id, "area_id": alias.get("area_id"),
                    "relationship": "task_has_area_learning_item", "status": "resolved_ready_for_use",
                    "student_visible": True, "recommendation_only": True,
                    "requirement_lane": canonical.get("requirement_lane", "useful_optional"),
                    "blocking_policy": "never", "sequence_policy": "none",
                    "evidence_basis": "reviewed_canonical_domain_tool_area_context",
                    "evidence_source_ids": list(dict.fromkeys(str(ref.get("id")) for ref in unique_refs if ref.get("id"))),
                    "source_references": unique_refs, "condition": source_edge.get("condition"),
                    "fit_claim_limit": source_edge.get("fit_claim_limit"),
                    "explanation": f"{title} is a distinct tool choice available in this reviewed area/task context. Its selection is carried forward once; it is not a domain-wide requirement.",
                    "deduplicated_from_area_node_id": alias_id,
                })
        alias["student_visible"] = False
        alias["student_selectable"] = False
        alias["display_readiness"] = "deduplicated_into_canonical_area_items"
        alias["resolution_state"] = "resolved_as_canonical_area_item_context"
        alias["canonical_linked_item_ids"] = list(alias_canonical_ids)
    context_by_key: dict[tuple[str, str, str], dict[str, Any]] = {}
    for edge in [*existing_context_edges, *replacements]:
        key = (str(edge.get("source") or ""), str(edge.get("target") or ""), str(edge.get("area_id") or ""))
        canonical_edge = context_by_key.setdefault(key, edge)
        canonical_edge.update({
            "status": "resolved_ready_for_use",
            "student_visible": True,
            "recommendation_only": True,
            "requirement_lane": canonical_edge.get("requirement_lane") or "useful_edge",
            "blocking_policy": "never",
            "sequence_policy": "none",
        })
    edges[:] = [edge for edge in edges if not (
        (edge.get("relationship") == "task_has_area_learning_item" and edge.get("target") in aliases)
        or (
            edge.get("relationship") == "task_has_area_learning_item"
            and edge.get("evidence_basis") == "reviewed_canonical_domain_tool_area_context"
            and edge.get("deduplicated_from_area_node_id") in aliases
        )
    )]
    edges.extend(context_by_key.values())
    area_tool_ids = set(canonical_ids)

    def move_area_tool_ids_to_area_field(route: dict[str, Any]) -> None:
        legacy = route.get("domain_tool_ids")
        if isinstance(legacy, list):
            moved = [item_id for item_id in legacy if item_id in area_tool_ids]
            route["domain_tool_ids"] = [item_id for item_id in legacy if item_id not in area_tool_ids]
            route["tool_ids"] = list(dict.fromkeys([*(route.get("tool_ids") or []), *moved]))
        for contribution in route.get("method_contributions", []):
            if isinstance(contribution, dict):
                move_area_tool_ids_to_area_field(contribution)
        for contribution in (route.get("role_contributions_by_id") or {}).values():
            for row in contribution if isinstance(contribution, list) else []:
                if isinstance(row, dict):
                    move_area_tool_ids_to_area_field(row)

    for route_collection in (graph.get("method_area_routes", []), graph.get("combination_area_routes", [])):
        for route in route_collection:
            if isinstance(route, dict):
                move_area_tool_ids_to_area_field(route)
    for design in graph.get("combination_designs", []):
        for route in design.get("area_routes", []):
            move_area_tool_ids_to_area_field(route)
        for variant in design.get("component_route_variants", []):
            for route in variant.get("area_routes", []):
                move_area_tool_ids_to_area_field(route)
    for collection in (graph.get("method_area_routes", []), graph.get("combination_area_routes", [])):
        for route in collection:
            for field in ("area_item_ids", "available_item_ids", "explanatory_item_ids"):
                if isinstance(route.get(field), list):
                    route[field] = [item_id for item_id in route[field] if item_id not in aliases]
            for contribution in route.get("method_contributions", []):
                for field in ("area_item_ids", "available_item_ids", "explanatory_item_ids"):
                    if isinstance(contribution.get(field), list):
                        contribution[field] = [item_id for item_id in contribution[field] if item_id not in aliases]
    route_reference_fields = {"area_item_ids", "available_item_ids", "explanatory_item_ids"}
    def strip_duplicate_route_references(value: Any) -> None:
        if isinstance(value, dict):
            for key, child in list(value.items()):
                if key in route_reference_fields and isinstance(child, list):
                    value[key] = [item_id for item_id in child if item_id not in aliases]
                else:
                    strip_duplicate_route_references(child)
        elif isinstance(value, list):
            for child in value:
                strip_duplicate_route_references(child)
    strip_duplicate_route_references(graph.get("nodes", []))
    strip_duplicate_route_references(graph.get("combination_designs", []))
    return {
        "area_alias_nodes_retained_for_audit": sum(alias_id in nodes for alias_id in aliases),
        "alias_task_edges_replaced": len(old_edges),
        "canonical_area_context_edges_added": len(replacements),
        "canonical_area_context_edges_total": len(context_by_key),
        "canonical_tools_area_stage_only": sum(nodes[item_id].get("display_stage") == "area" for item_id in canonical_ids),
        "canonical_tools_still_in_domain_choice_stage": sum(nodes[item_id].get("display_stage") != "area" for item_id in canonical_ids),
        "area_tool_ids_moved_out_of_domain_tool_routes": len(canonical_ids),
        "separate_selectable_duplicates_remaining": sum(
            1 for alias_id in aliases
            if nodes.get(alias_id, {}).get("student_selectable") is True
        ),
        "canonical_item_ids": canonical_ids,
    }


def reconcile_role_task_item_links(
    graph: dict[str, Any],
    role_item_reconciliation: dict[str, Any],
    role_task_nodes: dict[str, dict[str, Any]],
) -> dict[str, int]:
    """Refresh stale role-item flags and project only locally verified role/task links."""
    nodes = {node["id"]: node for node in graph.get("nodes", [])}
    role_nodes = {node_id: node for node_id, node in nodes.items() if node.get("kind") == "role"}
    role_id_by_label = {str(node.get("label", "")).casefold(): node_id for node_id, node in role_nodes.items()}
    item_by_queue = {
        int(node["queue_position"]): node for node in nodes.values()
        if node.get("kind") == "role_item_candidate" and node.get("queue_position") is not None
    }
    records = role_item_reconciliation.get("records", [])
    record_by_queue = {int(row["queue_position"]): (index, row) for index, row in enumerate(records)}
    if len(record_by_queue) != len(records) or set(record_by_queue) != set(item_by_queue):
        raise SystemExit("Role-item graph nodes and the local reconciliation ledger do not have an exact one-to-one queue-position join")

    edges = graph.setdefault("edges", [])
    edges[:] = [edge for edge in edges if not str(edge.get("id", "")).startswith("role_task_supports_role_item:")]
    counts = {
        "ledger_records": len(records),
        "verified_role_task_item_records_exposed": 0,
        "typed_role_task_item_context_edges": 0,
        "hidden_by_final_no_area_route_disposition": 0,
        "hidden_by_item_scope_conflict": 0,
        "unresolved_owner_or_task_join": 0,
    }
    for queue_position, item in item_by_queue.items():
        index, record = record_by_queue[queue_position]
        contract = item.setdefault("role_item_contract", {})
        preparation_notes = [
            str(note).strip()
            for note in (record.get("prerequisites") or [])
            if str(note).strip()
        ]
        # Preserve this legacy free text as preparation context. Without an
        # exact target and relationship-level evidence it is not a learning
        # prerequisite, a universal role foundation, or a progression blocker.
        item["preparation_context_notes"] = preparation_notes
        item["preparation_context_policy"] = (
            "These are task/item-specific preparation or operating-condition notes. "
            "They are not a learning sequence, universal role foundation, or progression blocker. "
            "Create an order edge only when an exact graph target and source-backed before/after "
            "relationship are reviewed for this route."
        )
        item["preparation_context_source_locator"] = (
            f"{ROLE_ITEM_RECONCILIATION_PATH.relative_to(ROOT).as_posix()}#/records/{index}/prerequisites"
        )
        item["preparation_context_is_sequence_edge"] = False
        task_reconciliation = record.get("role_task_reconciliation", {})
        item["source_ledger_role_task_relationship_verified"] = bool(record.get("role_task_relationship_verified"))
        item["role_task_relationship_verified"] = False
        contract["source_ledger_role_task_relationship_verified"] = bool(record.get("role_task_relationship_verified"))
        contract["role_task_relationship_verified"] = False
        owners = set(item.get("role_owner_ids", []))
        considered = {
            role_id_by_label[str(label).casefold()]
            for label in task_reconciliation.get("roles_considered", [])
            if str(label).casefold() in role_id_by_label
        }
        disposition = str(record.get("final_disposition_status") or "")
        verified = (
            record.get("role_task_relationship_verified") is True
            and task_reconciliation.get("status") == "verified_bounded_route_task_output"
            and disposition in {"approved_for_later_integration", "conditional_for_later_integration"}
            and owners
            and owners.issubset(considered)
        )

        if disposition == "hidden":
            item["student_visible"] = False
            item["student_selectable"] = False
            item["approval"] = "unapproved"
            item["role_task_item_reconciliation_status"] = "excluded_no_current_area_route"
            item["role_task_item_reconciliation_reason"] = "; ".join(record.get("unresolved_reasons", [])) or "The reviewed ledger found no current D078 area route for this item and role."
            item["student_display_disposition"] = {
                "decision": "unapproved",
                "basis": "local role-item source and route review found no current D078 area route; retain in audit, not student selection",
                "reason": item["role_task_item_reconciliation_reason"],
                "source_record_index": index,
                "reviewed_on": "2026-11-02",
            }
            counts["hidden_by_final_no_area_route_disposition"] += 1
            continue

        # The current item contract itself says that police/intelligence/
        # military investigation methods are not genealogical research. Do not
        # let an older broad role-list verification override that scope.
        item_scope_text = " ".join(str(value) for value in (
            item.get("meaning"), item.get("plain_language_meaning"),
            item.get("role_application"), item.get("contextual_use"),
            contract.get("role_task_basis"), contract.get("area_meaning"),
            contract.get("requirement_scope", {}).get("condition"),
        )).casefold()
        is_genealogy_role_item = any(
            str(owner).rsplit(":", 1)[-1] == "genealogist" for owner in item.get("role_owner_ids", [])
        )
        investigation_terms = ("police", "intelligence", "military")
        scope_conflict = is_genealogy_role_item and any(term in item_scope_text for term in investigation_terms) and (
            "no d078" in item_scope_text or "not a d078" in item_scope_text or "no placement" in item_scope_text
        )
        if scope_conflict:
            item["student_visible"] = False
            item["student_selectable"] = False
            item["approval"] = "unapproved"
            item["role_task_item_reconciliation_status"] = "excluded_item_scope_conflict"
            item["role_task_item_reconciliation_reason"] = (
                "The preserved source definition is police, intelligence or military investigation methods; "
                "the D078 genealogist task is documentary family-history research. The older ledger verification "
                "is retained as provenance but does not establish this item's D078 fit."
            )
            item["student_display_disposition"] = {
                "decision": "unapproved",
                "basis": "item meaning conflicts with the source-backed D078 role-task scope",
                "reason": item["role_task_item_reconciliation_reason"],
                "source_record_index": index,
                "reviewed_on": "2026-11-02",
            }
            counts["hidden_by_item_scope_conflict"] += 1
            continue

        if not item.get("student_visible"):
            item["role_task_item_reconciliation_status"] = "not_projected_by_current_role_item_gate"
            item["role_task_item_reconciliation_reason"] = "The current role-item contract does not expose this record; its role-task association cannot override that separate item gate."
            continue
        if not verified:
            item["role_task_item_reconciliation_status"] = "unresolved_owner_or_task_join"
            item["role_task_item_reconciliation_reason"] = "The item lacks an exact matching role owner and verified bounded task/output record in the local ledger."
            counts["unresolved_owner_or_task_join"] += 1
            continue

        counts["verified_role_task_item_records_exposed"] += 1
        item["approval"] = "approved"
        item["student_visible"] = True
        item["student_selectable"] = True
        item["role_task_relationship_verified"] = True
        contract["role_task_relationship_verified"] = True
        item["role_task_item_reconciliation_status"] = "verified_bounded_role_task_context"
        contract["role_task_item_reconciliation_status"] = "verified_bounded_role_task_context"
        item["role_task_item_reconciliation_reason"] = "The local item-level review connects this selectable role option to the named role's bounded task/output; it does not make the option compulsory."
        item["student_display_disposition"] = {
            "decision": "approved",
            "basis": "item-level meaning, role ownership, bounded role-task output and source-backed task connection were verified; selectable but not compulsory",
            "reason": item["role_task_item_reconciliation_reason"],
            "source_record_index": index,
            "reviewed_on": "2026-11-02",
        }
        for role_id in sorted(owners):
            slug = role_id.rsplit(":", 1)[-1]
            task_id = f"role-task:d078:{slug}"
            task = role_task_nodes.get(task_id)
            if task is None or role_id not in considered:
                counts["unresolved_owner_or_task_join"] += 1
                continue
            item_evidence = contract.get("evidence", [])
            source_references: list[dict[str, str]] = [_source_pointer(
                str(ROLE_ITEM_RECONCILIATION_PATH.relative_to(ROOT)).replace("\\", "/"),
                f"$/records/{index}/role_task_reconciliation",
                "D078 role-item local task/output reconciliation",
                "role_item_task_reconciliation",
            )]
            if task_reconciliation.get("route_review_pointer"):
                source_references.append(_source_pointer(
                    str(ROLE_ITEM_ROUTE_DISPOSITIONS_PATH.relative_to(ROOT)).replace("\\", "/"),
                    str(task_reconciliation["route_review_pointer"]),
                    "D078 role-item task-route disposition review",
                    "reviewed_role_item_task_route_disposition",
                ))
            for evidence in item_evidence:
                if not isinstance(evidence, dict):
                    continue
                url = str(evidence.get("url") or "")
                if not url:
                    continue
                source_references.append({
                    "id": str(evidence.get("source_id") or "external:" + url),
                    "title": str(evidence.get("source") or evidence.get("title") or "Role-item evidence"),
                    "url": url,
                    "locator": str(evidence.get("locator") or "Role-item source locator in the reconciled item contract."),
                    "source_role": "role_item_evidence",
                    "supports": str(evidence.get("supports") or "Item definition or bounded task context."),
                    "limits": str(evidence.get("limits") or "Does not make this learning option compulsory or prove job eligibility."),
                })
            for reference in task.get("source_references", []):
                source_references.append({**reference, "source_role": "authoritative_role_task_evidence"})
            unique_refs = {(ref.get("id"), ref.get("url"), ref.get("locator")): ref for ref in source_references}
            if not any(ref.get("url") or ref.get("locator") for ref in unique_refs.values()):
                raise SystemExit(f"Role/task/item edge has no inspectable evidence for queue position {queue_position}")
            condition = str(contract.get("requirement_scope", {}).get("condition") or item.get("requirement_reason") or "").strip()
            edge_id = f"role_task_supports_role_item:{task_id}->{item['id']}"
            edges.append({
                "id": edge_id,
                "source": task_id,
                "target": item["id"],
                "relationship": "role_task_supports_role_item",
                "status": "resolved_ready_for_use",
                "student_visible": True,
                "evidence_basis": "locally_verified_bounded_role_task_output_plus_item_and_role_sources",
                "evidence_source_ids": sorted({str(ref.get("id")) for ref in unique_refs.values() if ref.get("id")}),
                "source_references": list(unique_refs.values()),
                "explanation": f"This is an optional learning choice that can support the documented work context for {role_nodes[role_id].get('label', 'this role')}. It is not required for every assignment or employer.",
                "condition": condition or "Choose it when the described task and intended output call for this knowledge or ability; otherwise keep the general role path.",
                "fit_claim_limit": "This bounded learning-to-task link is not a universal job duty, professional authorization, competency assessment, or proof of job eligibility.",
                "recommendation_only": True,
                "blocking_policy": "never",
                "sequence_policy": "none",
                "confidence": "bounded_local_item_review",
                "role_item_queue_position": queue_position,
            })
            counts["typed_role_task_item_context_edges"] += 1
    return counts


def install_candidate_route_nodes(graph: dict[str, Any]) -> dict[str, Any]:
    """Materialize the itemized candidate decisions without broadening routes."""
    nodes = {node["id"]: node for node in graph["nodes"]}
    routes = graph.setdefault("method_area_routes", [])
    roles = graph.setdefault("method_area_role_routes", [])
    method_ids = graph.setdefault("method_node_ids", [])
    added_nodes = 0

    source_root = "data/career-mapping/_audit/d078_area_enrichment_lanes_2026_10_10/"
    item_nodes = [
        {
            "id": "area_enrichment_item:econ-a1", "kind": "area_enrichment_item", "item_type": "method",
            "label": "Construct an economic measure from text or other unstructured evidence",
            "area_id": "D078:economics-applied-analysis", "owner_layer": "area",
            "what_it_is": "Define an economic idea that is not already measured clearly, then use a documented human or computational procedure to label or estimate it from suitable text, images or records.",
            "task_connection": "This is an optional specialist route for an economic question that needs a new measure. It does not replace established indicators or the design needed to support a causal claim.",
            "learner_output": "A construct definition, coding or model protocol, source and sample description, and a record of how cases were classified.",
            "requirement_lane": "conditional", "requirement_level": "useful", "skippable": True, "blocking_policy": "never",
            "requirement_scope": {"lane": "conditional", "condition": "Use only when an existing validated measure does not fit the question and a suitable validation sample can be assembled.", "rationale": "This is an emerging specialist application, not a general Economics foundation.", "skippable": True, "blocks_progression": False, "auto_add": False, "auto_order": False},
            "learning_links": [{"label": "American Economic Association: valid inference with AI/ML-generated covariates", "url": "https://www.aeaweb.org/articles?id=10.1257%2Fpandp.20261020", "access": "Article access may depend on publisher availability; use the abstract and author materials to understand scope, not as a full software course."}],
            "source_references": [{"id": "internal:ECON-04", "title": "D078 Economics enrichment: ECON-04", "url": "", "locator": "Task, output, alternatives and limitations for constructing or enriching an economic measure.", "source_role": "area_item_evidence"}, {"id": "external:aea-ai-ml-generated-covariates-2026", "title": "American Economic Association, Performing Valid Inference with AI/ML-Generated Covariates", "url": "https://www.aeaweb.org/articles?id=10.1257%2Fpandp.20261020", "locator": "Measurement error in generated variables can bias estimates and invalidate inference; validation is needed.", "source_role": "area_item_evidence"}],
            "approval": "locally_reconciled_optional_specialist_item", "student_visible": True,
        },
        {
            "id": "area_enrichment_item:econ-c2", "kind": "area_enrichment_item", "item_type": "competency",
            "label": "Validate a generated measure and account for its possible error",
            "area_id": "D078:economics-applied-analysis", "owner_layer": "area",
            "what_it_is": "Check whether a machine-generated or AI-assisted economic measure represents the intended idea by reviewing a target-relevant sample, measuring classification errors and documenting the model, data and decisions.",
            "task_connection": "Use this after creating a generated measure and before relying on it in regression or other inference. If appropriate validation data are unavailable, use an established measure, human coding or leave the variable out.",
            "learner_output": "A validation sample and protocol, error summary, sensitivity or robustness checks, and a short explanation of what remains uncertain.",
            "requirement_lane": "conditional", "requirement_level": "useful", "skippable": True, "blocking_policy": "never",
            "requirement_scope": {"lane": "conditional", "condition": "Only for a study that uses a generated measure; validation must match the intended population, language, period and analytical use.", "rationale": "Generated-variable error can affect downstream estimates; no universal pass threshold is implied.", "skippable": True, "blocks_progression": False, "auto_add": False, "auto_order": False},
            "learning_links": [{"label": "American Economic Association: valid inference with AI/ML-generated covariates", "url": "https://www.aeaweb.org/articles?id=10.1257%2Fpandp.20261020", "access": "Article access may depend on publisher availability; source is methodological guidance, not a credential."}],
            "source_references": [{"id": "internal:ECON-04", "title": "D078 Economics enrichment: ECON-04", "url": "", "locator": "Validation, measurement-error, alternative and limitation statements.", "source_role": "area_item_evidence"}, {"id": "external:aea-ai-ml-generated-covariates-2026", "title": "American Economic Association, Performing Valid Inference with AI/ML-Generated Covariates", "url": "https://www.aeaweb.org/articles?id=10.1257%2Fpandp.20261020", "locator": "Abstract and empirical-practice guidance on measurement error and inference from generated covariates.", "source_role": "area_item_evidence"}],
            "approval": "locally_reconciled_optional_specialist_item", "student_visible": True,
        },
        {
            "id": "area_enrichment_item:d078-a03-method-policy-foresight-scenarios", "kind": "area_enrichment_item", "item_type": "method",
            "label": "Build policy scenarios and test a strategy against them",
            "area_id": "D078:politics-governance-public-policy", "owner_layer": "area",
            "what_it_is": "Scan evidence and uncertainties, describe several plausible future conditions, and examine how a policy strategy may work in each one.",
            "task_connection": "Select this area task when a policy decision has a meaningful future horizon. Foresight explores possibilities; it is not a promise about what will happen and is not the same as a statistical forecast.",
            "learner_output": "A trend and uncertainty map, a small set of scenario narratives with assumptions, affected groups, and a strategy stress-test or action table.",
            "requirement_lane": "useful_optional", "requirement_level": "useful", "skippable": True, "blocking_policy": "never",
            "requirement_scope": {"lane": "useful_optional", "condition": "Only when the selected policy question concerns plausible future conditions or strategy resilience.", "rationale": "This optional method supports long-horizon and uncertain policy decisions; it is not required for every political or policy question.", "skippable": True, "blocks_progression": False, "auto_add": False, "auto_order": False},
            "learning_links": [{"label": "OECD Strategic Foresight Toolkit for Resilient Public Policy", "url": "https://www.oecd.org/en/publications/foresight-toolkit-for-resilient-public-policy_bcdd9304-en.html", "access": "The OECD toolkit is publicly available; its scenarios are possibilities, not predictions."}],
            "source_references": [{"id": "internal:OECD_FORESIGHT_TOOLKIT", "title": "D078 policy foresight task-family source record", "url": "", "locator": "D078_AREAS_03_04_EMERGING_TASKS_SUPPLEMENT_2026_10_10.json.gz; strategic foresight family and its item record.", "source_role": "area_item_evidence"}, {"id": "external:oecd-foresight-toolkit-2025", "title": "OECD, Strategic Foresight Toolkit for Resilient Public Policy", "url": "https://www.oecd.org/en/publications/foresight-toolkit-for-resilient-public-policy_bcdd9304-en.html", "locator": "Five-step toolkit: challenge assumptions, create plausible scenarios, stress-test policy strategies and develop actions; scenarios are not predictions.", "source_role": "area_item_evidence"}],
            "approval": "locally_reconciled_optional_method_item", "student_visible": True,
        },
    ]
    for node in item_nodes:
        if node["id"] not in nodes:
            nodes[node["id"]] = node
            added_nodes += 1

    foundation_contracts = [
        {
            "id": "area-foundation:d078-economics-economic-concepts-and-indicators",
            "kind": "area_foundation", "item_type": "knowledge",
            "area_id": "D078:economics-applied-analysis",
            "label": "Understand economic choices, institutions and outcomes",
            "meaning": "Economics examines how people and institutions make choices, how markets and public systems shape those choices, and how resources and outcomes are distributed. Economic indicators are measurements of parts of that picture; each indicator has a definition and limits.",
            "description": "This starting point adds economic subject knowledge to the research foundations you already met in Social Sciences. It helps you recognize whether a route is about choices, markets, production, distribution, public finance, policy effects or a future estimate. It does not require you to learn every economic measure or analysis method.",
            "why_it_matters": "The same dataset can answer different questions depending on what is measured, who is included and which economic idea is being examined.",
            "learner_output": "A short explanation of the economic idea and outcome a selected analysis is intended to examine, plus one limitation of the measure or evidence.",
            "requirement_lane": "useful_optional", "requirement_level": "useful",
            "requirement_scope": {"lane": "useful_optional", "condition": "Useful across the Economics and Applied Economic Analysis area; review or skip it according to prior knowledge and the selected task.", "rationale": "CORE Econ connects distinct economic questions and concepts to different data projects. This is an orientation, not a prerequisite for every economics task.", "skippable": True, "blocks_progression": False, "auto_add": False, "auto_order": False},
            "inherited_domain_item_ids": [],
            "display_stage": "after_area_overview_before_task_family_choices",
            "blocking_policy": "never", "skippable": True, "auto_add": False, "auto_order": False,
            "learning_links": [{"label": "CORE Econ: Doing Economics", "url": "https://www.core-econ.org/project/doing-economics/", "access": "Free project-based economics learning resource; each project has its own concepts, data and methods."}],
            "source_references": [{"id": "internal:D078-ECON-area-task-set", "title": "D078 Economics and Applied Economic Analysis task-set record", "url": "", "locator": source_root + "d078_area_role_task_sets_2026_10_09.json.gz; Economics area boundary and core task-family record.", "source_role": "area_foundation_evidence"}, {"id": "external:core-econ-doing-economics", "title": "CORE Econ, Doing Economics", "url": "https://www.core-econ.org/project/doing-economics/", "locator": "Project descriptions connect economic topics and questions to different data, statistical techniques and software; no single project sequence is prescribed for every learner.", "source_role": "area_foundation_evidence"}],
            "student_visible": True, "student_selectable": True,
            "approval": "locally_reconciled_area_foundation_not_a_progression_blocker",
        },
        {
            "id": "area-foundation:d078-sociology-social-anthropology-social-concepts",
            "kind": "area_foundation", "item_type": "knowledge",
            "area_id": "D078:sociology-social-anthropology",
            "label": "Understand social structures, culture and social change",
            "meaning": "Sociology and social anthropology study how people live together: how relationships, institutions, culture, inequality and communities shape everyday life, and how people can also change those arrangements.",
            "description": "This is the subject foundation for Sociology and Social Anthropology. It helps you connect a person's experience to wider relationships, institutions, cultural meanings and social conditions. Your Social Sciences research-question foundation still carries forward; this card adds the area’s subject concepts rather than repeating question-framing advice.",
            "why_it_matters": "A social pattern is easier to understand when you consider both people's experiences and the wider social setting, rather than treating one example as proof about everyone.",
            "learner_output": "A brief explanation of a social issue using one relevant concept, the setting or group it concerns, and a limit on what the example can show.",
            "requirement_lane": "useful_optional", "requirement_level": "useful",
            "requirement_scope": {"lane": "useful_optional", "condition": "Useful across Sociology and Social Anthropology; review or skip it according to prior knowledge and the selected task.", "rationale": "ASA's sociological literacy framework and Berkeley Anthropology learning goals support these area concepts, but neither makes this a formal entry prerequisite for every route.", "skippable": True, "blocks_progression": False, "auto_add": False, "auto_order": False},
            "inherited_domain_item_ids": [],
            "display_stage": "after_area_overview_before_task_family_choices",
            "blocking_policy": "never", "skippable": True, "auto_add": False, "auto_order": False,
            "learning_links": [{"label": "American Sociological Association: Sociological Literacy Framework", "url": "https://www.asanet.org/wp-content/uploads/appendix_b_-_prc_manual_march_2020.pdf", "access": "Free professional framework; useful as a subject reference, not a substitute for a full course."}, {"label": "UC Berkeley Anthropology: Student Learning Goals", "url": "https://anthropology.berkeley.edu/undergraduate-program/student-learning-goals", "access": "Free university learning-goal reference covering sociocultural concepts, theory, fieldwork and analysis."}],
            "source_references": [{"id": "internal:D078-SOCIAL-ANTHRO-core-task-family", "title": "D078 Sociology and Social Anthropology area task-set record", "url": "", "locator": source_root + "d078_area_role_task_sets_2026_10_09.json.gz; canonical area boundary and core task-family record.", "source_role": "area_foundation_evidence"}, {"id": "external:asanet-sociological-literacy-framework", "title": "American Sociological Association, Sociological Literacy Framework", "url": "https://www.asanet.org/wp-content/uploads/appendix_b_-_prc_manual_march_2020.pdf", "locator": "Core sociological concepts and competencies: social structure, interaction, theory, inequality, social change and evidence-based explanation.", "source_role": "area_foundation_evidence"}, {"id": "external:berkeley-anthropology-learning-goals", "title": "UC Berkeley Anthropology, Student Learning Goals", "url": "https://anthropology.berkeley.edu/undergraduate-program/student-learning-goals", "locator": "Sociocultural concepts, history of anthropological thought, fieldwork and application of theory/method.", "source_role": "area_foundation_evidence"}],
            "student_visible": True, "student_selectable": True,
            "approval": "locally_reconciled_area_foundation_not_a_progression_blocker",
        },
    ]

    # Reuse canonical area-owned knowledge/skill nodes where they already
    # provide a suitable shared starting point. Do not clone them as new cards.
    reused_foundation_ids_by_area = {
        "D078:computational-digital-social-science": [
            "area_enrichment_item:d078-computational-digital-social-science-computational-question-formulation",
        ],
        "D078:human-geography-population": [
            "area_enrichment_item:d078-human-geography-population-spatial-concepts-and-place",
        ],
        "D078:politics-governance-public-policy": [
            "area_enrichment_item:d078-a03-knowledge-institutions-policy",
        ],
        "D078:psychology-social-behaviour": [
            "area_enrichment_item:d078-a04-knowledge-behavioural-constructs",
        ],
    }
    no_additional_foundation_areas = {
        "D078:social-research-evaluation": {
            "decision": "no_distinct_area_wide_foundation_beyond_shared_domain_foundations",
            "reason": "The domain already teaches research-question/design, evidence appraisal and communication. Show design- or evaluation-specific preparation only after the matching area task is selected.",
            "source_references": [{"id": "internal:D078-SOCIAL-RESEARCH-EVALUATION-core-task-family", "title": "D078 Social Research and Evaluation task-set record", "url": "", "locator": source_root + "d078_area_role_task_sets_2026_10_09.json.gz; Social Research and Evaluation core task-family prerequisite statement.", "source_role": "area_foundation_disposition"}, {"id": "external:aea-evaluator-competencies", "title": "American Evaluation Association, Evaluator Competencies", "url": "https://www.eval.org/About/Competencies-Standards/undefined", "locator": "Evaluation competencies distinguish methodology, context, planning/management and interpersonal work; this supports task-specific preparation rather than a duplicate area-wide research foundation.", "source_role": "area_foundation_disposition"}],
        },
    }
    area_foundation_ids_by_area: dict[str, list[str]] = {
        area_id: list(item_ids) for area_id, item_ids in reused_foundation_ids_by_area.items()
    }
    for node in foundation_contracts:
        if node["id"] not in nodes:
            added_nodes += 1
        nodes[node["id"]] = node
        area_foundation_ids_by_area.setdefault(node["area_id"], []).append(node["id"])
    shared_foundation_source_refs = {
        "D078:computational-digital-social-science": [{"id": "external:uva-computational-social-science", "title": "University of Amsterdam, Computational Social Science study programme", "url": "https://www.uva.nl/en/programmes/bachelors/computational-social-science/study-programme/study-programme.html", "locator": "Study programme integrates social theory, research, computational methods and reflection on data/AI effects.", "source_role": "area_foundation_evidence"}, {"id": "external:edinburgh-undergraduate-computational-social-science", "title": "University of Edinburgh, Understanding Society with Big Data: Computational Social Science", "url": "https://www.drps.ed.ac.uk/26-27/dpt/cxinfr08034.htm", "locator": "Undergraduate outcomes connect social questions, computational method choice, bias/ethics, data analysis and communicating limitations.", "source_role": "area_foundation_evidence"}],
        "D078:human-geography-population": [{"id": "external:ncge-geography-standard-1", "title": "National Council for Geographic Education, Geography Standard 1", "url": "https://ncge.org/teacher-resources/national-geography-standards/geography-standard-1/", "locator": "Geographic representations, geospatial data, spatial thinking, scale and the limits of maps.", "source_role": "area_foundation_evidence"}],
        "D078:politics-governance-public-policy": [{"id": "external:apsa-majoring-political-science", "title": "American Political Science Association, Majoring in Political Science", "url": "https://apsanet.org/careers/careers-for-political-scientists/student-resources/majoring-in-political-science/", "locator": "Political concepts, political behavior, policy issues and structures of government.", "source_role": "area_foundation_evidence"}],
        "D078:psychology-social-behaviour": [{"id": "external:apa-undergraduate-psychology-guidelines-3", "title": "American Psychological Association, Undergraduate Psychology Major Guidelines 3.0", "url": "https://www.apa.org/ed/precollege/undergraduate-major", "locator": "Scientific inquiry, measurement, ethics, communication and professional development; guidelines are curriculum-agnostic and do not prescribe course order.", "source_role": "area_foundation_evidence"}],
    }
    for area_id, item_ids in reused_foundation_ids_by_area.items():
        for item_id in item_ids:
            item = nodes.get(item_id)
            if not item or item.get("area_id") != area_id or item.get("student_visible") is not True or item.get("student_selectable") is False:
                raise SystemExit(f"Area foundation reuse target is absent, hidden, or owned by another area: {area_id}->{item_id}")
            rationale = {
                "D078:computational-digital-social-science": "This area-wide starting point connects a social question to a computational task; it does not require programming on every route.",
                "D078:human-geography-population": "Place, spatial representation and scale help orient the area's population and place-based work; task-specific population measures remain with population tasks.",
                "D078:politics-governance-public-policy": "Institutions, authority and policy process provide shared subject context; each selected task adds its own jurisdiction, audience or evidence needs.",
                "D078:psychology-social-behaviour": "Behavioural concepts and construct meaning orient this non-clinical area; design-specific methods and statistics remain with the selected task.",
            }[area_id]
            item.update({
                "requirement_lane": "useful_optional",
                "requirement_level": "useful",
                "requirement_scope": {
                    "lane": "useful_optional",
                    "condition": "Useful as an area starting point; review it or skip it according to prior knowledge and the work you select.",
                    "rationale": rationale,
                    "skippable": True,
                    "blocks_progression": False,
                    "auto_add": False,
                    "auto_order": False,
                },
                "blocking_policy": "never",
                "skippable": True,
                "student_selectable": True,
            })
            item["shared_area_foundation"] = {
                "display_stage": "after_area_overview_before_task_family_choices",
                "skippable": True, "blocking_policy": "never", "auto_add": False, "auto_order": False,
                "foundation_basis": "reused_existing_area_owned_learning_item_no_duplicate_created",
                "explanation": rationale,
            }
            existing_refs = item.get("source_references", [])
            refs = {str(ref.get("id") or ref.get("url")): ref for ref in existing_refs if isinstance(ref, dict)}
            refs.update({ref["id"]: ref for ref in shared_foundation_source_refs.get(area_id, [])})
            item["source_references"] = list(refs.values())
    # Remove the old question-framing cards: generic question framing already
    # belongs to the shared domain foundation. The replacement area cards add
    # subject concepts, not a second copy of that learning.
    nodes.pop("area-foundation:d078-economics-question-framing", None)
    nodes.pop("area-foundation:d078-sociology-social-anthropology-bounded-inquiry", None)
    for area_id, item_ids in area_foundation_ids_by_area.items():
        area_foundation_ids_by_area[area_id] = list(dict.fromkeys(item_ids))
    for route in routes:
        route["area_foundation_ids"] = []

    def add_unique(values: list[str], value: str) -> None:
        if value not in values:
            values.append(value)

    def attach_family(method_id: str, area_id: str, family_id: str, item_ids: list[str],
                      domain_context_ids: list[str] | None = None) -> None:
        route = next((row for row in routes if row.get("method_id") == method_id and row.get("area_id") == area_id), None)
        if route is None:
            route_node_id = f"method-area-route:{method_id.rsplit(':', 1)[-1]}:{area_id.rsplit(':', 1)[-1]}"
            route = {"method_id": method_id, "area_id": area_id,
                     "route_node_id": route_node_id,
                     "task_family_ids": [], "area_item_ids": [], "task_linked_domain_item_ids": [],
                     "available_item_ids": [], "tool_ids": [], "domain_tool_ids": [], "domain_downstream_item_ids": [],
                     "role_ids": [], "role_route_ids": [], "role_item_ids": [], "recommendation_rank": None}
            routes.append(route)
        route_node_id = route.get("route_node_id")
        if route_node_id not in nodes:
            template_route = next((row for row in routes
                                   if row is not route and row.get("area_id") == area_id
                                   and row.get("route_node_id") in nodes), None)
            if template_route is None:
                raise SystemExit(f"Cannot materialize method/area route without a same-area template: {method_id}->{area_id}")
            route_node = deepcopy(nodes[template_route["route_node_id"]])
            area_node = next((node for node in nodes.values()
                              if node.get("kind") == "area_of_specialization"
                              and node.get("area_id") == area_id), None)
            if area_node is None:
                raise SystemExit(f"Cannot materialize method/area route without its canonical area node: {area_id}")
            route_node.update({
                "id": route_node_id,
                "kind": "method_to_area_route",
                "method_id": method_id,
                "area_id": area_id,
                "label": f"{nodes[method_id].get('label', method_id)} -> {area_node.get('label', area_id)}",
                "task_family_ids": list(route.get("task_family_ids", [])),
                "area_item_ids": list(route.get("area_item_ids", [])),
                "task_linked_domain_item_ids": list(route.get("task_linked_domain_item_ids", [])),
                "available_item_ids": list(route.get("available_item_ids", [])),
                "tool_ids": list(route.get("tool_ids", [])),
                "domain_tool_ids": list(route.get("domain_tool_ids", [])),
                "domain_downstream_item_ids": list(route.get("domain_downstream_item_ids", [])),
                "role_ids": list(route.get("role_ids", [])),
                "role_route_ids": list(route.get("role_route_ids", [])),
                "area_foundation_ids": list(route.get("area_foundation_ids", [])),
            })
            nodes[route_node_id] = route_node
            edge_ids = {edge.get("id") for edge in graph.get("edges", [])}
            route_edges = [
                {"id": f"method_supports_area_route:{method_id}->{route_node_id}",
                 "source": method_id, "target": route_node_id,
                 "relationship": "method_supports_area_route", "recommendation_only": True,
                 "blocks_other_areas": False, "route_basis": [{"kind": "area_task_contract", "task_id": family_id}]},
                {"id": f"recommends_area:{route_node_id}->{area_node['id']}",
                 "source": route_node_id, "target": area_node["id"], "relationship": "recommends_area",
                 "task_family_ids": list(route.get("task_family_ids", [])),
                 "order_basis": "evidenced_task_match", "excludes_area": False},
            ]
            for edge in route_edges:
                if edge["id"] not in edge_ids:
                    graph["edges"].append(edge)
                    edge_ids.add(edge["id"])
        add_unique(route.setdefault("task_family_ids", []), family_id)
        for item_id in item_ids:
            add_unique(route.setdefault("area_item_ids", []), item_id)
            add_unique(route.setdefault("available_item_ids", []), item_id)
        for context_id in domain_context_ids or []:
            add_unique(route.setdefault("task_linked_domain_item_ids", []), context_id)
            add_unique(route.setdefault("available_item_ids", []), context_id)
        for foundation_id in area_foundation_ids_by_area.get(area_id, []):
            add_unique(route.setdefault("area_foundation_ids", []), foundation_id)

    quant = "domain-item:d078-quantitative-approach"
    computation = "domain-item:d078-computational-social-research"
    forecast = "area-task:econ-03"
    generated_measure = "area-task:econ-04"
    foresight = "area-task:d078-politics-governance-public-policy-strategic-foresight-and-policy-scenarios"
    econ_area = "D078:economics-applied-analysis"
    politics_area = "D078:politics-governance-public-policy"
    scenario_method = "domain-item:d078-scenario-analysis"

    # ECON-03's source identifiers resolve to the existing detailed forecasting
    # item and the selected quantitative route's tools; no duplicate card/tool.
    attach_family(quant, econ_area, forecast, ["area_enrichment_item:d078-econ-time-series-analysis-and-forecasting"])
    # ECON-04 is an optional family only after the learner explicitly selects
    # the domain's AI-use validation/provenance option. A quantitative or
    # computational method alone does not reveal it.
    required_context = "domain-emerging:d078-emerging-ai-use-validation-and-provenance"
    nodes[generated_measure]["required_selected_domain_item_ids"] = [required_context]
    nodes[generated_measure]["task_family_selection_role"] = "conditional optional focus; available only when the domain AI-use validation/provenance option is selected"
    for item_id in ("area_enrichment_item:econ-a1", "area_enrichment_item:econ-c2"):
        nodes[item_id]["required_selected_domain_item_ids"] = [required_context]
    attach_family(quant, econ_area, generated_measure, ["area_enrichment_item:econ-a1", "area_enrichment_item:econ-c2"], [required_context])
    attach_family(computation, econ_area, generated_measure, ["area_enrichment_item:econ-a1", "area_enrichment_item:econ-c2"], [required_context])

    # Scenario analysis is an existing approved domain method node. Add it as
    # a selectable method and expose only the policy-foresight family it
    # actually supports; it is not silently appended to unrelated methods.
    if scenario_method not in method_ids:
        method_ids.append(scenario_method)
    # Adding a method expands the pairwise-selection contract as well. Each
    # pair must resolve to an exact/partial named design or explicitly say no
    # reviewed combined design exists; never let the UI infer a union.
    pair_dispositions = []
    for left, right in combinations(sorted(method_ids), 2):
        selected = {left, right}
        exact_ids: list[str] = []
        partial_ids: list[str] = []
        for design in graph.get("combination_designs", []):
            if design.get("combination_mode") == "design_frame_with_selectable_methods":
                allowed = set(design.get("required_method_ids", [])) | set(design.get("selectable_component_method_ids", []))
                required = set(design.get("required_method_ids", []))
                if required and required.issubset(selected) and selected.issubset(allowed):
                    exact_ids.append(design["id"])
                elif selected.issubset(allowed) and not required.issubset(selected):
                    partial_ids.append(design["id"])
                continue
            required = set(design.get("required_method_ids", design.get("method_ids", [])))
            if selected == required:
                exact_ids.append(design["id"])
            elif selected < required:
                partial_ids.append(design["id"])
        disposition = (
            "choose_among_exact_named_designs" if len(exact_ids) > 1 else
            "exact_named_design" if exact_ids else
            "partial_named_design_no_downstream" if partial_ids else
            "no_reviewed_combined_route"
        )
        pair_dispositions.append({
            "method_ids": [left, right], "disposition": disposition,
            "exact_design_ids": sorted(exact_ids), "partial_design_ids": sorted(partial_ids),
            "downstream_policy": "design_route_only_after_exact_design_selection" if exact_ids else "none_until_a_supported_design_is_completed",
        })
    graph["method_combination_selection_contract"].update({
        "method_count": len(method_ids),
        "unordered_pair_count": len(pair_dispositions),
        "pair_dispositions": pair_dispositions,
        "pair_contract_updated_after_route_method_addition": True,
    })
    attach_family(scenario_method, politics_area, foresight,
                  ["area_enrichment_item:d078-a03-method-policy-foresight-scenarios"], [scenario_method])
    # Scenario Analysis was added after the original 22-method Layer 2/3 fit
    # matrix was built. Reconcile its full candidate set from the exact
    # scenario/foresight sources already present in this graph, rather than
    # leaving a stale 220-pair audit beside a 23-method route graph.
    scenario_sources = {
        "external:uk-go-science-futures-toolkit": {
            "title": "Government Office for Science Futures Toolkit",
            "url": "https://www.gov.uk/government/publications/futures-toolkit-for-policy-makers-and-analysts",
            "supports": "Evidence gathering, driver mapping, scenarios and policy stress-testing for exploring uncertainty; scenarios are possibilities, not predictions.",
            "limits": "A policy foresight toolkit, not a universal research-method requirement or proof that every scenario project uses data, participants, or quantitative indicators.",
        },
        "external:oecd-foresight-toolkit-2025": {
            "title": "OECD Strategic Foresight Toolkit for Resilient Public Policy",
            "url": "https://www.oecd.org/en/publications/foresight-toolkit-for-resilient-public-policy_bcdd9304-en.html",
            "supports": "A five-step policy foresight process for challenging assumptions, creating scenarios, stress-testing strategies and developing actions.",
            "limits": "Policy-foresight guidance; it does not make scenarios predictions or require every optional research practice.",
        },
        "external:aapor-responsible-ai-survey-2026": {
            "title": "AAPOR Task Force on Responsible AI Integration in Survey Research",
            "url": "https://aapor.org/announcements/task-force-on-responsible-ai-integration-in-survey-research-report/",
            "supports": "Data quality, transparency, human oversight, ethics and disclosure when AI is used in survey research.",
            "limits": "Survey-specific. Use only when the scenario project includes an AI-assisted survey or survey evidence; do not generalize it to all scenario work.",
        },
    }
    registry = graph.setdefault("external_source_registry", {})
    for source_id, record in scenario_sources.items():
        registry.setdefault(source_id, record)

    scenario_fit_rules: dict[str, dict[str, Any]] = {
        "domain-item:ai-assisted-and-digital-trace-research-ethics": {
            "condition": "Show only when this scenario project uses AI-assisted survey work or digital-trace evidence; AI is not part of scenario analysis by default.",
            "source_ids": ["external:aapor-responsible-ai-survey-2026"],
            "rationale": "The item is relevant only to the specified AI/survey or digital-evidence extension, not to ordinary scenario construction.",
        },
        "domain-item:d078-care-for-research-data": {
            "condition": "Show when the project collects, receives, analyses, stores or shares data to support its drivers, scenarios or evaluation.",
            "source_ids": ["src:ukri-research-data-policy-2026", "external:uk-go-science-futures-toolkit"],
            "rationale": "Scenario projects may use evidence and data, but this practice is relevant only when the project actually handles research data.",
        },
        "domain-item:d078-responsible-research": {
            "condition": "Show when the project consults people, uses identifiable or sensitive records, or creates a risk of harm through its evidence gathering or dissemination.",
            "source_ids": ["src:esrc-ethics-principles", "external:uk-go-science-futures-toolkit"],
            "rationale": "The toolkit includes consultation methods; the ethics practice applies to the actual participants, information and risks, not to scenario writing alone.",
        },
        "domain-item:d078-secondary-data": {
            "condition": "Show when existing datasets, reports, archives or records are used to identify drivers or ground scenario assumptions.",
            "source_ids": ["src:uk-data-service-secondary-analysis", "external:uk-go-science-futures-toolkit"],
            "rationale": "Futures work can build an evidence base, while secondary-data learning is needed only if existing data or records are part of that evidence base.",
        },
        "domain-item:measurement-and-operationalisation": {
            "condition": "Show when the learner defines observable drivers, indicators or early-warning signals to compare or monitor scenarios.",
            "source_ids": ["external:uk-go-science-futures-toolkit", "external:oecd-foresight-toolkit-2025"],
            "rationale": "Driver mapping and monitoring can use defined indicators, but narrative scenario work does not always quantify its drivers.",
        },
        "domain-item:open-science-preregistration-and-reproducibility": {
            "condition": "Show when the learner needs others to inspect or revisit the evidence, assumptions, scenario-building steps or stress-test settings.",
            "source_ids": ["external:uk-go-science-futures-toolkit", "external:oecd-foresight-toolkit-2025"],
            "rationale": "A traceable record helps explain how scenarios and policy stress-tests were constructed; it is useful documentation, not a compulsory experimental preregistration.",
        },
        "domain-item:reference-and-literature-management": {
            "condition": "Show when trends, disruptions, drivers or scenario assumptions are being grounded in sources that must be checked and cited.",
            "source_ids": ["external:uk-go-science-futures-toolkit", "external:oecd-foresight-toolkit-2025"],
            "rationale": "The foresight guidance calls for evidence gathering and evidence-informed potential disruptions; source organization supports that task.",
        },
        "domain-item:reliability-validity-and-uncertainty": {
            "condition": "Show when the project evaluates evidence quality or explains uncertainty and assumptions behind its scenarios; do not treat scenarios as forecasts.",
            "source_ids": ["external:uk-go-science-futures-toolkit", "external:oecd-foresight-toolkit-2025"],
            "rationale": "Both toolkits frame futures as uncertain possibilities and support stress-testing assumptions; this item helps learners explain the evidence limits and uncertainty.",
        },
        "domain-item:sampling-recruitment-and-representativeness": {
            "condition": "Show when the project uses a Delphi panel, expert consultation or stakeholder input and must explain whose views were included or left out.",
            "source_ids": ["external:uk-go-science-futures-toolkit", "src:esrc-ethics-principles"],
            "rationale": "The toolkit includes panel and stakeholder methods; sampling matters only for those consultation routes and does not make a panel representative by default.",
        },
    }
    fit_audit = graph.get("method_item_fit_audit", {})
    fit_rows = fit_audit.setdefault("dispositions", [])
    existing_scenario_rows = {row.get("item_id") for row in fit_rows if row.get("method_id") == scenario_method}
    scenario_route = next(row for row in routes if row.get("method_id") == scenario_method and row.get("area_id") == politics_area)
    scenario_route_node_id = scenario_route["route_node_id"]
    fit_items = sorted({row.get("item_id") for row in fit_rows if row.get("item_id")})
    for item_id in fit_items:
        if item_id in existing_scenario_rows:
            continue
        if item_id == "runtime-item:domain:d078:d078-society-and-social-world-knowledge":
            fit_rows.append({
                "item_id": item_id,
                "method_id": scenario_method,
                "disposition": "domain_orientation_context_not_method_item",
                "local_evidence": [],
                "condition": "This describes the field being studied and stays in domain orientation; it is not extra preparation specific to scenario analysis.",
                "rationale": "The existing graph contract places society/social-world knowledge before methods as orientation, not inside a method route.",
                "external_search_status": "not_required_for_explicit_local_route_link",
                "external_sources": [],
                "no_fit_allowed": False,
            })
            continue
        rule = scenario_fit_rules[item_id]
        evidence_row = {
            "method_id": scenario_method,
            "area_id": politics_area,
            "route_node_id": scenario_route_node_id,
            "task_family_ids": [foresight],
            "evidence_basis": "official_futures_toolkit_and_exact_scenario_area_route",
            "matched_route_fields": ["task_family_ids", "area_item_ids"],
        }
        fit_rows.append({
            "item_id": item_id,
            "method_id": scenario_method,
            "disposition": "externally_supported_conditional_fit",
            "local_evidence": [evidence_row],
            "condition": rule["condition"],
            "rationale": rule["rationale"],
            "external_search_status": "recorded",
            "external_sources": rule["source_ids"],
            "no_fit_allowed": False,
        })
        for layer in graph.get("domain_learning_layers", []):
            if item_id not in layer.get("item_ids", []):
                continue
            add_unique(layer.setdefault("route_applicability_by_item", {}).setdefault(item_id, []), scenario_method)
            evidence_rows = layer.setdefault("route_evidence_by_item", {}).setdefault(item_id, [])
            if not any(row.get("method_id") == scenario_method for row in evidence_rows):
                evidence_rows.append({
                    "method_id": scenario_method,
                    "route_node_id": scenario_route_node_id,
                    "evidence_basis": "externally_supported_conditional_method_fit",
                    "external_source_ids": rule["source_ids"],
                    "condition": rule["condition"],
                    "rationale": rule["rationale"],
                })
    fit_audit.update({
        "candidate_item_count": len(fit_items),
        "method_count": len(method_ids),
        "pair_count": len(fit_rows),
        "scenario_analysis_reconciled_after_route_addition": True,
    })
    policy_roles = ["role:D078:10:political-scientist", "role:D078:7:economic-policy-officer"]
    policy_template_method = "domain-item:d078-qualitative-approach"
    for role_id in policy_roles:
        template = next((row for row in roles if row.get("method_id") == policy_template_method and row.get("area_id") == politics_area and row.get("role_id") == role_id), None)
        if template is None:
            template = next((row for row in roles if row.get("area_id") == politics_area and row.get("role_id") == role_id), None)
        if template is None:
            raise SystemExit(f"No existing same-area role route to adapt for foresight: {role_id}")
        if not any(row.get("method_id") == scenario_method and row.get("area_id") == politics_area and row.get("role_id") == role_id for row in roles):
            clone = dict(template)
            clone["method_id"] = scenario_method
            clone["route_node_id"] = f"method-area-role-route:d078-scenario-analysis:politics-governance-public-policy:{role_id.rsplit(':',1)[-1]}"
            roles.append(clone)
        else:
            clone = next(row for row in roles if row.get("method_id") == scenario_method and row.get("area_id") == politics_area and row.get("role_id") == role_id)
        route_node_id = clone["route_node_id"]
        if route_node_id not in nodes:
            template_node = nodes.get(template.get("route_node_id"))
            if template_node is None:
                raise SystemExit(f"No graph node for same-area role route template: {template.get('route_node_id')}")
            area_slug = politics_area.split(":", 1)[-1]
            area_node = next((node for node in nodes.values()
                              if node.get("kind") == "area_of_specialization"
                              and node.get("area_id") == politics_area), None)
            if area_node is None:
                raise SystemExit(f"No canonical graph area node for scenario route: {politics_area}")
            role_node = deepcopy(template_node)
            role_node.update({
                "id": route_node_id,
                "method_id": scenario_method,
                "area_id": politics_area,
                "role_id": role_id,
                "label": f"{nodes[scenario_method].get('label', scenario_method)} -> {area_node.get('label', politics_area)} -> {nodes[role_id].get('label', role_id)}",
                "route_basis": "source-backed scenario-analysis method route through the selected politics/governance area",
            })
            nodes[route_node_id] = role_node
        graph_edges = graph.setdefault("edges", [])
        area_route_node_id = next(row["route_node_id"] for row in routes if row.get("method_id") == scenario_method and row.get("area_id") == politics_area)
        edge_specs = [
            (f"role_route_option_after_area_choice:{area_route_node_id}->{route_node_id}", area_route_node_id, route_node_id, "role_route_option_after_area_choice", {"role_id": role_id, "method_specific_role_fit_claim": False}),
            (f"selected_role_route:{route_node_id}->{role_id}", route_node_id, role_id, "selected_role_route", {"route_source": "reviewed_D078_area_role_edges"}),
        ]
        existing_edge_ids = {edge.get("id") for edge in graph_edges}
        for edge_id, source, target, relationship, details in edge_specs:
            if edge_id not in existing_edge_ids:
                graph_edges.append({"id": edge_id, "source": source, "target": target, "relationship": relationship, **details})
        route = next(row for row in routes if row.get("method_id") == scenario_method and row.get("area_id") == politics_area)
        add_unique(route.setdefault("role_ids", []), role_id)
        add_unique(route.setdefault("role_route_ids", []), f"method-area-role-route:d078-scenario-analysis:politics-governance-public-policy:{role_id.rsplit(':',1)[-1]}")

    # Annotate all supported method and combination area routes with the
    # area-owned foundations that precede optional task-family choices.
    foundation_ids_by_area = {
        area_id: list(item_ids)
        for area_id, item_ids in area_foundation_ids_by_area.items()
    }
    for route in routes:
        for foundation_id in foundation_ids_by_area.get(route.get("area_id", ""), []):
            add_unique(route.setdefault("area_foundation_ids", []), foundation_id)
        route_node = nodes.get(route.get("route_node_id"))
        if route_node is not None:
            for field in (
                "task_family_ids", "area_item_ids", "task_linked_domain_item_ids",
                "available_item_ids", "tool_ids", "domain_tool_ids",
                "domain_downstream_item_ids", "explanatory_item_ids", "role_ids",
                "role_route_ids", "area_foundation_ids",
            ):
                route_node[field] = list(route.get(field, []))
            route_node["method_id"] = route.get("method_id")
            route_node["area_id"] = route.get("area_id")
            for edge in graph.get("edges", []):
                if edge.get("relationship") == "recommends_area" and edge.get("source") == route_node["id"]:
                    edge["task_family_ids"] = list(route.get("task_family_ids", []))
                    edge["order_basis"] = "evidenced_task_match; ties remain ties"

    # Append the new nodes before role-task generation so source resolution and
    # typed family-to-role links see a single canonical graph inventory.
    graph["nodes"] = sorted(nodes.values(), key=lambda node: node["id"])
    area_decisions_by_id = {
        "D078:computational-digital-social-science": {
            "disposition": "optional_shared_area_foundation",
            "reason": "A computational question-framing item already exists and can be reused once before work-family choices.",
        },
        "D078:economics-applied-analysis": {
            "disposition": "optional_shared_area_foundation",
            "reason": "Economic concepts and indicators add area subject knowledge beyond generic research-question design.",
        },
        "D078:human-geography-population": {
            "disposition": "optional_shared_area_foundation",
            "reason": "Place, spatial representation and scale orient the area; population-specific measures remain route/task-specific.",
        },
        "D078:politics-governance-public-policy": {
            "disposition": "optional_shared_area_foundation",
            "reason": "Institutions, public authority and policy process are shared subject context across the area.",
        },
        "D078:psychology-social-behaviour": {
            "disposition": "optional_shared_area_foundation",
            "reason": "Behavioural concepts orient this non-clinical area; method and statistics depth depend on the chosen task.",
        },
        "D078:social-research-evaluation": {
            "disposition": "no_additional_area_wide_foundation",
            "reason": "The shared domain foundations already cover question/design, evidence appraisal and communication; add preparation only within the selected task family.",
        },
        "D078:sociology-social-anthropology": {
            "disposition": "optional_shared_area_foundation",
            "reason": "Social structures, institutions, culture, inequality, community and social change add subject knowledge beyond generic research-question design.",
        },
    }
    canonical_area_ids = {
        str(node.get("area_id")) for node in nodes.values()
        if node.get("kind") == "area_of_specialization" and node.get("area_id")
    }
    if set(area_decisions_by_id) != canonical_area_ids:
        raise SystemExit(
            "Area-foundation decisions must cover the exact canonical D078 area set: "
            f"missing={sorted(canonical_area_ids - set(area_decisions_by_id))}, "
            f"extra={sorted(set(area_decisions_by_id) - canonical_area_ids)}"
        )
    decisions_by_area = {
        area_id: {
            **decision,
            "foundation_ids": foundation_ids_by_area.get(area_id, []),
            "foundation_is_progression_blocker": False,
        }
        for area_id, decision in area_decisions_by_id.items()
    }
    graph["area_foundation_contract"] = {
        "display_order": "area_overview_then_area_foundations_then_route_supported_task_families_then_area_items_then_roles",
        "foundation_count": sum(len(item_ids) for item_ids in foundation_ids_by_area.values()),
        "foundations_are_progression_blockers": False,
        "foundation_nodes": sorted({item_id for item_ids in foundation_ids_by_area.values() for item_id in item_ids}),
        "foundation_ids_by_area": foundation_ids_by_area,
        "decisions_by_area": decisions_by_area,
        "no_additional_foundation_areas": [
            area_id for area_id, decision in decisions_by_area.items()
            if decision["disposition"] == "no_additional_area_wide_foundation"
        ],
        "every_supported_area_route_carries_its_foundation_ids": True,
    }
    return {"added_area_foundation_and_learning_nodes": added_nodes,
            "new_forecast_measure_and_foresight_route_family_ids": [forecast, generated_measure, foresight],
            "conditional_family_gate": {generated_measure: [required_context]},
            "scenario_method_added": scenario_method in method_ids,
            "area_foundation_ids_by_area": foundation_ids_by_area}


def apply_area_task_candidate_dispositions(
    graph: dict[str, Any], area_task_nodes: dict[str, dict[str, Any]], routed_ids: set[str],
) -> dict[str, Any]:
    """Replace stale candidate flags with explicit, final graph dispositions."""
    missing = sorted(set(AREA_TASK_CANDIDATE_DISPOSITIONS) - set(area_task_nodes))
    if missing:
        raise SystemExit(f"Candidate disposition registry contains absent graph nodes: {missing}")
    records: dict[str, Any] = {}
    counts: dict[str, int] = {"approved_merged": 0, "approved_reclassified_foundation": 0, "approved_routed_optional_family": 0}
    for node_id, decision in AREA_TASK_CANDIDATE_DISPOSITIONS.items():
        node = area_task_nodes[node_id]
        approval = decision["approval"]
        if approval == "approved_merge":
            node.update({
                "approval": "approved_merged_into_canonical_route",
                "review_status": "disposition_complete_merged_not_selectable",
                "student_visible": False,
                "merged_into": decision["targets"],
                "candidate_disposition": decision,
            })
            counts["approved_merged"] += 1
        elif approval == "approved_area_foundation":
            foundation = next((n for n in graph["nodes"] if n.get("kind") == "area_foundation" and n.get("area_id") == node.get("area_id")), None)
            if not foundation:
                raise SystemExit(f"Approved area-foundation disposition has no materialized node: {node_id}")
            node.update({
                "approval": "approved_reclassified_as_area_foundation",
                "review_status": "disposition_complete_not_a_task_family_choice",
                "student_visible": False,
                "reclassified_as": foundation["id"],
                "candidate_disposition": decision,
            })
            counts["approved_reclassified_foundation"] += 1
        elif node_id in routed_ids:
            if decision.get("decision") not in {
                "quantitative_economics_forecast_route_materialized",
                "selected_ai_validation_option_gated_economic_measure_route_materialized",
                "exact_scenario_analysis_route_materialized",
            }:
                raise SystemExit(f"Unexpected routed candidate still marked unapproved: {node_id}")
            node.update({
                "approval": "approved_for_exact_optional_route_not_student_release_approval",
                "review_status": "route_and_item_links_materialized_locally",
                "student_visible": True,
                "candidate_disposition": {**decision, "approval": "approved_routed_optional_family"},
            })
            counts["approved_routed_optional_family"] += 1
        else:
            raise SystemExit(f"Unresolved area-task candidate remains without a final disposition or route: {node_id}")
        records[node_id] = node["candidate_disposition"]
    graph["area_task_candidate_dispositions"] = {
        "date": "2026-11-08",
        "source_artifact": "docs/manual-review/D078_AREA_TASK_CANDIDATE_DISPOSITIONS_2026_10_31.md",
        "all_candidates_dispositioned": len(records) == len(AREA_TASK_CANDIDATE_DISPOSITIONS),
        "candidate_count": len(records),
        "decision_counts": counts,
        "pending_or_under_review_count": 0,
        "student_release_gate_is_separate": True,
        "records": records,
    }
    return graph["area_task_candidate_dispositions"]


def reconcile_stata_tool_scope(graph: dict[str, Any]) -> dict[str, Any]:
    """Approve Stata only as a source-verified, skippable quantitative tool option.

    Stata's official materials establish software capabilities and tutorials,
    not that every research method or area needs the product. Keep it out of
    qualitative-only, archival-only, discourse, network, and synthesis routes.
    """
    tool_id = "domain-item:stata-quantitative-social-science-workflow"
    node = next((item for item in graph.get("nodes", []) if item.get("id") == tool_id), None)
    if node is None:
        raise SystemExit(f"Missing canonical Stata learning-item node: {tool_id}")
    source_records = [
        {
            "id": "external:stata-why-use-stata-2026",
            "title": "Why use Stata",
            "publisher": "StataCorp",
            "url": "https://www.stata.com/why-use-stata/",
            "locator": "Data manipulation and analysis; panel, multilevel, survey, time-series data; reproducible workflows.",
            "supports": "Stata's documented capabilities for structured-data and quantitative-analysis workflows.",
            "scope_limit": "Product documentation supports software-function claims only; it does not make Stata necessary for every learner or research design.",
            "accessed_on": "2026-10-31",
        },
        {
            "id": "external:stata-survey-methods-2026",
            "title": "Survey methods",
            "publisher": "StataCorp",
            "url": "https://www.stata.com/features/survey-methods/",
            "locator": "Survey-design adjustment, descriptive statistics, regression, panel-data, multilevel and item-response workflows.",
            "supports": "A bounded relationship between Stata and quantitative survey/data-analysis tasks when the sampling design and analysis justify it.",
            "scope_limit": "The learner must understand the design, weights, assumptions and interpretation; software output is not a validity guarantee.",
            "accessed_on": "2026-10-31",
        },
        {
            "id": "external:stata-video-tutorials-2026",
            "title": "Video tutorials",
            "publisher": "StataCorp",
            "url": "https://www.stata.com/links/video-tutorials/",
            "locator": "Official task-based videos include descriptive statistics, regression, time series, panel data, tests and reporting.",
            "supports": "A direct, free instructional link for learning specific Stata tasks.",
            "scope_limit": "Tutorial availability does not establish that learners need licensed Stata software or must choose it over another tool.",
            "accessed_on": "2026-10-31",
        },
        {
            "id": "external:nuc-social-sciences-ccmas-2023",
            "title": "Social Sciences CCMAS 2023",
            "publisher": "National Universities Commission, Nigeria",
            "url": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
            "locator": "Sociology SSC 401 Research Method II: apply appropriate statistics in data analysis; curriculum context only.",
            "supports": "Nigerian social-science curriculum context for quantitative analysis.",
            "scope_limit": "Does not prescribe Stata or establish it as a programme requirement.",
            "accessed_on": "2026-10-31",
        },
    ]
    registry = graph.setdefault("external_source_registry", {})
    for source in source_records:
        registry[source["id"]] = source

    method_ids = {
        "domain-item:d078-quantitative-approach",
        "domain-item:d078-survey-method",
        "domain-item:d078-mixed-methods",
        "domain-item:longitudinal-panel-and-multilevel-data",
        "domain-item:psychometrics-and-scale-construction",
        "domain-item:experiments-quasi-experiments-and-causal-inference",
        "domain-item:programme-evaluation-and-theory-of-change",
        "domain-item:d078-computational-social-research",
    }
    source_ids = [source["id"] for source in source_records]
    node.update({
        "student_visible": True,
        "approval": "approved_scoped_optional_quantitative_tool",
        "claim_evidence_status": "verified_for_scoped_tool_function_and_learning_link",
        "claim_state": "verified_scoped_optional_tool",
        "research_disposition": "approved_optional_route_tool",
        "student_display_status": "approved_optional_after_compatible_method_selection",
        "display_readiness": "scoped_optional_route_ready_release_gate_separate",
        "canonical_status": "approved_scoped_optional_tool",
        "display_stage": "after_compatible_method_selection",
        "requirement_lane": "optional",
        "requirement_level": "optional",
        "requirement_scope": {
            "lane": "optional",
            "skippable": True,
            "blocks_progression": False,
            "route_condition": "Show only after a compatible quantitative, survey, mixed, panel/multilevel, psychometric, causal-analysis, evaluation, or computational method is selected; choose it only when the project and software access fit.",
        },
        "skippable": True,
        "blocking_policy": "never",
        "source_references": source_records,
        "evidence": [
            {"source_id": source["id"], "locator": source["locator"], "claim_role": "reviewed_scoped_tool_evidence"}
            for source in source_records
        ],
        "approved_method_ids": sorted(method_ids),
        "student_facing_explanation": "Stata can help analyse structured numbers, including survey, panel and time-based data, when the research question and design call for those methods. It is one optional software choice, not a requirement; the same task may be possible in another tool, and Stata access may require a licence.",
        "release_gate_note": "Item scope is reconciled; the graph-level student UI/release gate remains separate and closed.",
    })
    node["learning_links"] = [{
        "label": "Learn Stata through topic-specific video tutorials",
        "url": "https://www.stata.com/links/video-tutorials/",
        "source_id": "external:stata-video-tutorials-2026",
        "locator": "Official task-based tutorials for descriptive statistics, regression, time series, panel data, tests and reporting.",
        "level": "Beginner-to-advanced by topic",
        "access": "Videos are free; the Stata software may require a licence.",
        "language": "English",
        "role": "free_task_specific_learning_resource",
        "instructional_fit": "verified_for_stata_quantitative_workflow",
        "verified_on": "2026-10-31",
    }]

    route_count = 0
    allowed_route_nodes: set[str] = set()
    route_fields = (
        "available_item_ids", "task_linked_domain_item_ids", "domain_downstream_item_ids",
        "area_item_ids", "tool_ids", "domain_tool_ids",
    )
    for route in graph.get("method_area_routes", []):
        allowed = route.get("method_id") in method_ids
        for field in route_fields:
            values = [value for value in route.get(field, []) if value != tool_id]
            if allowed and field == "domain_tool_ids":
                values.append(tool_id)
            route[field] = list(dict.fromkeys(values))
        if allowed:
            route_count += 1
            allowed_route_nodes.add(str(route.get("route_node_id")))
        route_node = next((item for item in graph.get("nodes", [])
                           if item.get("id") == route.get("route_node_id")), None)
        if route_node:
            for field in route_fields:
                route_node[field] = list(route.get(field, []))

    # Route-tool edges are an explicit, non-blocking optional choice. Retire
    # older broad/candidate Stata route edges and rebuild the scoped set.
    edges = graph.setdefault("edges", [])
    edges[:] = [edge for edge in edges if not (
        edge.get("relationship") == "method_route_reveals_tool" and edge.get("target") == tool_id
    )]
    for route in graph.get("method_area_routes", []):
        if route.get("method_id") not in method_ids:
            continue
        route_id = str(route["route_node_id"])
        edges.append({
            "id": f"method_route_reveals_tool:{route_id}->{tool_id}",
            "source": route_id,
            "target": tool_id,
            "relationship": "method_route_reveals_tool",
            "status": "resolved_ready_for_use",
            "student_visible": True,
            "recommendation_only": True,
            "requirement_lane": "optional",
            "blocks_progression": False,
            "condition": node["requirement_scope"]["route_condition"],
            "evidence_sources": source_ids,
            "explanation": "This is one optional software choice for the selected quantitative task; other suitable tools remain valid alternatives.",
        })

    # Keep all named-combination contributions method-attributed and in sync
    # with the corrected canonical single-method route.
    route_by_key = {(row.get("method_id"), row.get("area_id")): row
                    for row in graph.get("method_area_routes", [])}
    for combo in graph.get("combination_designs", []):
        for route in combo.get("area_routes", []):
            for contribution in route.get("method_contributions", []):
                source = route_by_key.get((contribution.get("method_id"), route.get("area_id")))
                if source:
                    for field in route_fields:
                        contribution[field] = list(source.get(field, []))
        for variant in combo.get("component_route_variants", []):
            for route in variant.get("area_routes", []):
                for contribution in route.get("method_contributions", []):
                    source = route_by_key.get((contribution.get("method_id"), route.get("area_id")))
                    if source:
                        for field in route_fields:
                            contribution[field] = list(source.get(field, []))
    for route in graph.get("combination_area_routes", []):
        for contribution in route.get("method_contributions", []):
            source = route_by_key.get((contribution.get("method_id"), route.get("area_id")))
            if source:
                for field in route_fields:
                    contribution[field] = list(source.get(field, []))

    graph["stata_scoped_tool_reconciliation"] = {
        "decision": "approved_optional_tool_only_for_method_routes_that_use_compatible_structured_quantitative_data",
        "methods": sorted(method_ids),
        "method_area_route_count": route_count,
        "unsupported_method_routes_removed": True,
        "external_sources": source_ids,
        "does_not_claim": ["universal requirement", "Nigerian university software requirement", "job qualification", "software access included"],
        "graph_release_gate_remains_separate": True,
    }
    return graph["stata_scoped_tool_reconciliation"]


def reconcile_r_tool_scope(graph: dict[str, Any]) -> dict[str, Any]:
    """Promote R as an optional quantitative tool, not a universal route item."""
    tool_id = "domain-item:r-statistical-computing"
    node = next((item for item in graph.get("nodes", []) if item.get("id") == tool_id), None)
    if node is None:
        raise SystemExit(f"Missing canonical R learning-item node: {tool_id}")
    source_records = [
        {
            "id": "external:r-project-about-2026",
            "title": "What is R?",
            "publisher": "R Project for Statistical Computing",
            "url": "https://www.r-project.org/about.html",
            "locator": "Official overview: statistical computing, graphics, modelling, tests, time-series analysis and extensibility.",
            "supports": "R's software-function and quantitative-analysis scope.",
            "scope_limit": "Official project information does not make R necessary for a particular method, programme or role.",
            "accessed_on": "2026-10-31",
        },
        {
            "id": "external:r-project-manuals-2026",
            "title": "R Manuals",
            "publisher": "R Project for Statistical Computing",
            "url": "https://cran.r-project.org/manuals.html",
            "locator": "Official manuals for R installation, language, data import/export, administration and extensions.",
            "supports": "A direct official learning/reference resource for working with R.",
            "scope_limit": "Manuals do not replace statistical reasoning or task-specific method training.",
            "accessed_on": "2026-10-31",
        },
    ]
    registry = graph.setdefault("external_source_registry", {})
    registry.update({source["id"]: source for source in source_records})
    supported_methods = {
        "domain-item:d078-quantitative-approach",
        "domain-item:d078-survey-method",
        "domain-item:d078-mixed-methods",
        "domain-item:longitudinal-panel-and-multilevel-data",
        "domain-item:psychometrics-and-scale-construction",
        "domain-item:experiments-quasi-experiments-and-causal-inference",
        "domain-item:programme-evaluation-and-theory-of-change",
        "domain-item:d078-computational-social-research",
    }
    condition = "Show only after a compatible quantitative, survey, mixed, panel/multilevel, psychometric, causal-analysis, evaluation, or computational method is selected; use R only when the project question and the learner's statistical preparation fit."
    node.update({
        "student_visible": True,
        "approval": "approved_scoped_optional_quantitative_tool",
        "claim_evidence_status": "verified_for_scoped_tool_function_and_learning_link",
        "claim_state": "verified_scoped_optional_tool",
        "research_disposition": "approved_optional_route_tool",
        "student_display_status": "approved_optional_after_compatible_method_selection",
        "display_readiness": "scoped_optional_route_ready_release_gate_separate",
        "canonical_status": "approved_scoped_optional_tool",
        "display_stage": "after_compatible_method_selection",
        "requirement_lane": "optional",
        "requirement_level": "optional",
        "requirement_scope": {"lane": "optional", "skippable": True, "blocks_progression": False, "route_condition": condition},
        "skippable": True,
        "blocking_policy": "never",
        "source_references": source_records,
        "evidence": [
            {"source_id": source["id"], "locator": source["locator"], "claim_role": "reviewed_scoped_tool_evidence"}
            for source in source_records
        ],
        "approved_method_ids": sorted(supported_methods),
        "student_facing_explanation": "R is a free, open-source environment for working with data, statistical analyses and graphs. It can help with a suitable quantitative task, but you do not need to learn R for every kind of research; another tool may fit your project better.",
        "release_gate_note": "Item scope is reconciled; the graph-level student UI/release gate remains separate and closed.",
        "learning_links": [{
            "label": "Read the official R manuals",
            "url": "https://cran.r-project.org/manuals.html",
            "source_id": "external:r-project-manuals-2026",
            "locator": "Official manuals for R and its language, data and extension workflows.",
            "access": "Free",
            "language": "English",
            "role": "official_learning_and_reference_resource",
            "verified_on": "2026-10-31",
        }],
    })
    route_fields = ("available_item_ids", "task_linked_domain_item_ids", "domain_downstream_item_ids", "area_item_ids", "tool_ids", "domain_tool_ids")
    route_count = 0
    for route in graph.get("method_area_routes", []):
        allowed = route.get("method_id") in supported_methods
        for field in route_fields:
            values = [value for value in route.get(field, []) if value != tool_id]
            if allowed and field == "domain_tool_ids":
                values.append(tool_id)
            route[field] = list(dict.fromkeys(values))
        if allowed:
            route_count += 1
        route_node = next((item for item in graph.get("nodes", []) if item.get("id") == route.get("route_node_id")), None)
        if route_node:
            for field in route_fields:
                route_node[field] = list(route.get(field, []))
    edges = graph.setdefault("edges", [])
    edges[:] = [edge for edge in edges if not (
        edge.get("relationship") == "method_route_reveals_tool" and edge.get("target") == tool_id
    )]
    for route in graph.get("method_area_routes", []):
        if route.get("method_id") not in supported_methods:
            continue
        route_id = str(route["route_node_id"])
        edges.append({
            "id": f"method_route_reveals_tool:{route_id}->{tool_id}",
            "source": route_id, "target": tool_id,
            "relationship": "method_route_reveals_tool", "status": "resolved_ready_for_use",
            "student_visible": True, "recommendation_only": True, "requirement_lane": "optional",
            "blocks_progression": False, "condition": condition,
            "evidence_sources": [source["id"] for source in source_records],
            "explanation": "R is one optional tool for suitable quantitative work; it is not required and is not the only valid software choice.",
        })
    route_by_key = {(row.get("method_id"), row.get("area_id")): row for row in graph.get("method_area_routes", [])}
    for combo in graph.get("combination_designs", []):
        all_routes = list(combo.get("area_routes", []))
        all_routes += [route for variant in combo.get("component_route_variants", []) for route in variant.get("area_routes", [])]
        for route in all_routes:
            for contribution in route.get("method_contributions", []):
                source = route_by_key.get((contribution.get("method_id"), route.get("area_id")))
                if source:
                    for field in route_fields:
                        contribution[field] = list(source.get(field, []))
    for route in graph.get("combination_area_routes", []):
        for contribution in route.get("method_contributions", []):
            source = route_by_key.get((contribution.get("method_id"), route.get("area_id")))
            if source:
                for field in route_fields:
                    contribution[field] = list(source.get(field, []))
    graph["r_scoped_tool_reconciliation"] = {
        "decision": "approved_optional_tool_only_for_compatible_structured_quantitative_method_routes",
        "methods": sorted(supported_methods), "method_area_route_count": route_count,
        "unsupported_method_routes_removed": True,
        "external_sources": [source["id"] for source in source_records],
        "graph_release_gate_remains_separate": True,
    }
    return graph["r_scoped_tool_reconciliation"]


def reconcile_other_reviewed_tool_scopes(graph: dict[str, Any]) -> dict[str, Any]:
    """Resolve the remaining core D078 software choices against official use/docs."""
    qualitative_methods = {
        "domain-item:d078-qualitative-approach", "domain-item:d078-interviews",
        "domain-item:focus-groups-and-workshops", "domain-item:d078-document-analysis",
        "domain-item:d078-observation-ethnography", "domain-item:discourse-and-conversation-analysis",
        "domain-item:participatory-and-action-research", "domain-item:d078-mixed-methods",
    }
    quant_methods = {
        "domain-item:d078-quantitative-approach", "domain-item:d078-survey-method",
        "domain-item:d078-mixed-methods", "domain-item:longitudinal-panel-and-multilevel-data",
        "domain-item:psychometrics-and-scale-construction",
        "domain-item:experiments-quasi-experiments-and-causal-inference",
        "domain-item:programme-evaluation-and-theory-of-change",
        "domain-item:d078-computational-social-research",
    }
    archive_case_areas = {"D078:sociology-social-anthropology", "D078:social-research-evaluation"}
    sources = {
        "taguette": [
            {"id": "external:taguette-about-2026", "title": "About TAGUETTE", "publisher": "Taguette project", "url": "https://www.taguette.org/about.html", "locator": "Import research documents, highlight text and apply learner-defined tags/codes; export project materials.", "supports": "Document-based qualitative coding and retrieval.", "scope_limit": "It assists organizing/coding; it does not interpret evidence or determine a valid coding scheme.", "accessed_on": "2026-10-31"},
            {"id": "external:taguette-getting-started-2026", "title": "Getting started with TAGUETTE", "publisher": "Taguette project", "url": "https://www.taguette.org/getting-started.html", "locator": "Create a project, import a document, highlight text and apply tags; supported formats and export workflow.", "supports": "Direct practical learning resource for the tool.", "scope_limit": "Tool instructions do not replace research-method training or ethical review.", "accessed_on": "2026-10-31"},
        ],
        "nvivo": [
            {"id": "external:nvivo-desktop-2026", "title": "NVivo Desktop", "publisher": "Lumivero", "url": "https://lumivero.com/products/nvivo-desktop/", "locator": "Researcher-led qualitative and mixed-methods software for coding, querying, comparing, visualizing and interpreting material.", "supports": "Software identity and supported qualitative workflow scope.", "scope_limit": "Commercial product; software capability does not make NVivo necessary or replace interpretation.", "accessed_on": "2026-10-31"},
            {"id": "external:nvivo-getting-started-2026", "title": "Getting started basics", "publisher": "Lumivero Support", "url": "https://community.lumivero.com/s/article/NVR1Win-Content-tutorials-nvivo-tutorials", "locator": "Beginner tutorials for importing data, coding, note-taking, queries and visualizations.", "supports": "Direct instructional resource for common NVivo tasks.", "scope_limit": "Current product/version access and licence may vary.", "accessed_on": "2026-10-31"},
        ],
        "gephi": [
            {"id": "external:gephi-desktop-2026", "title": "Gephi Desktop", "publisher": "Gephi project", "url": "https://gephi.org/desktop/", "locator": "Official description of network exploration and visualization software, graph formats and data import.", "supports": "Network-data visualization software identity and function.", "scope_limit": "Visualization does not establish that a network model is appropriate or that a visual pattern proves a social claim.", "accessed_on": "2026-10-31"},
            {"id": "external:gephi-quickstart-2026", "title": "Gephi Quickstart", "publisher": "Gephi project", "url": "https://gephi.org/quickstart/", "locator": "Import a source/target edge table or network file, inspect import, examine nodes/edges and explore a graph.", "supports": "Direct practical learning resource for network visualization.", "scope_limit": "A quickstart is not a complete course in network research design or inference.", "accessed_on": "2026-10-31"},
        ],
        "spss": [
            {"id": "external:ibm-spss-regression-2026", "title": "Linear Regression in SPSS Statistics", "publisher": "IBM", "url": "https://www.ibm.com/docs/en/spss-statistics/30.0.0?topic=features-linear-regression", "locator": "Procedure steps, numeric outcome/predictor fields, regression output, assumptions and weighted least squares options.", "supports": "Specific quantitative-analysis function and workflow.", "scope_limit": "Commercial software; a menu or command does not select an appropriate model or establish causal validity.", "accessed_on": "2026-10-31"},
            {"id": "external:ibm-spss-regression-reference-2026", "title": "REGRESSION command", "publisher": "IBM", "url": "https://www.ibm.com/docs/en/spss-statistics/31.0.0?topic=reference-regression", "locator": "Official command reference for regression equations, statistics, plots and diagnostics.", "supports": "A second official reference for the tool's regression workflow.", "scope_limit": "The reference documents commands, not a universal requirement to use SPSS.", "accessed_on": "2026-10-31"},
        ],
    }
    configs = [
        {"tool_id": "domain-item:d078-qualitative-coding-tool", "key": "taguette", "label": "Taguette", "methods": qualitative_methods, "area_methods": {"domain-item:archival-and-historical-research", "domain-item:case-study-and-comparative-case-design"}, "condition": "Use only when the selected task involves text documents, transcripts, field notes or other material suitable for manual tagging and retrieval.", "description": "Taguette is a free, open-source tool for organizing text-based qualitative material. You can highlight a passage, give it a label you create, and later retrieve the passages under that label. The labels help organize your analysis; they do not decide what a passage means.", "link_label": "Start with the Taguette getting-started guide", "link_url": "https://www.taguette.org/getting-started.html", "access": "Free and open source"},
        {"tool_id": "domain-item:d078-nvivo-tool", "key": "nvivo", "label": "NVivo", "methods": qualitative_methods, "area_methods": {"domain-item:archival-and-historical-research", "domain-item:case-study-and-comparative-case-design"}, "condition": "Use when a text, interview, focus-group, audio/video or mixed-methods project needs structured coding, queries or comparison, and the learner has access to the software.", "description": "NVivo helps organize research material, attach codes to passages, compare coded material and run queries. The researcher still decides what the codes mean, checks the evidence and explains uncertainty; a software result is not an interpretation by itself.", "link_label": "Learn NVivo through the getting-started tutorials", "link_url": "https://community.lumivero.com/s/article/NVR1Win-Content-tutorials-nvivo-tutorials", "access": "Learning resources are available; NVivo software may require a licence"},
        {"tool_id": "domain-item:d078-social-network-tool", "key": "gephi", "label": "Gephi", "methods": {"domain-method:network-analysis", "domain-method:social-network-analysis", "domain-item:d078-computational-social-research"}, "area_methods": set(), "condition": "Use only when the question is about relationships represented as nodes and ties and the data can be responsibly represented as a network.", "description": "Gephi helps display and explore a network made from entities and their recorded connections. The layout can make patterns easier to inspect, but the picture depends on how the network was defined and does not by itself prove why a pattern exists.", "link_label": "Follow the Gephi Quickstart", "link_url": "https://gephi.org/quickstart/", "access": "Free desktop software"},
        {"tool_id": "domain-item:d078-spss-tool", "key": "spss", "label": "IBM SPSS Statistics", "methods": quant_methods, "area_methods": set(), "condition": "Use for a selected quantitative task only when the method, data structure, assumptions and software access fit.", "description": "IBM SPSS Statistics can run supported statistical procedures and report estimates, tables and diagnostics. The learner must still choose a suitable analysis, check assumptions and explain what the results can and cannot show.", "link_label": "Read IBM's linear-regression guide for SPSS Statistics", "link_url": "https://www.ibm.com/docs/en/spss-statistics/30.0.0?topic=features-linear-regression", "access": "IBM documentation is available; the software may require a licence"},
    ]
    nodes = {node["id"]: node for node in graph.get("nodes", [])}
    route_fields = ("available_item_ids", "task_linked_domain_item_ids", "domain_downstream_item_ids", "area_item_ids", "tool_ids", "domain_tool_ids")
    edge_rows: list[dict[str, Any]] = []
    dispositions: dict[str, Any] = {}
    registry = graph.setdefault("external_source_registry", {})
    for config in configs:
        tool_id = config["tool_id"]
        node = nodes.get(tool_id)
        if node is None:
            raise SystemExit(f"Missing core D078 tool node: {tool_id}")
        tool_sources = sources[config["key"]]
        registry.update({source["id"]: source for source in tool_sources})
        condition = config["condition"]
        node.update({
            "student_visible": True, "approval": "approved_scoped_optional_tool",
            "claim_evidence_status": "verified_for_tool_function_and_learning_link",
            "claim_state": "verified_scoped_optional_tool", "research_disposition": "approved_optional_route_tool",
            "student_display_status": "approved_optional_after_compatible_method_selection",
            "display_readiness": "scoped_optional_route_ready_release_gate_separate",
            "canonical_status": "approved_scoped_optional_tool", "display_stage": "after_compatible_method_selection",
            "requirement_lane": "optional", "requirement_level": "optional", "skippable": True,
            "blocking_policy": "never", "requirement_scope": {"lane": "optional", "skippable": True, "blocks_progression": False, "route_condition": condition},
            "source_references": tool_sources,
            "evidence": [{"source_id": source["id"], "locator": source["locator"], "claim_role": "reviewed_scoped_tool_evidence"} for source in tool_sources],
            "student_facing_explanation": config["description"],
            "release_gate_note": "This item scope is reconciled; the overall graph UI/release gate remains separate and closed.",
            "learning_links": [{"label": config["link_label"], "url": config["link_url"], "source_id": tool_sources[-1]["id"], "locator": tool_sources[-1]["locator"], "access": config["access"], "language": "English", "role": "task_specific_learning_resource", "verified_on": "2026-10-31"}],
        })
        if config["key"] == "taguette":
            node["learning_links"][0]["source_id"] = "external:taguette-getting-started-2026"
        elif config["key"] == "nvivo":
            node["learning_links"][0]["source_id"] = "external:nvivo-getting-started-2026"
        elif config["key"] == "gephi":
            node["learning_links"][0]["source_id"] = "external:gephi-quickstart-2026"
        node["approved_method_ids"] = sorted(config["methods"] | config["area_methods"])

        for route in graph.get("method_area_routes", []):
            method_id, area_id = route.get("method_id"), route.get("area_id")
            area_specific = method_id in config["area_methods"] and area_id in archive_case_areas
            allowed = method_id in config["methods"] or area_specific
            for field in route_fields:
                values = [value for value in route.get(field, []) if value != tool_id]
                if allowed and field == "domain_tool_ids":
                    values.append(tool_id)
                route[field] = list(dict.fromkeys(values))
            if allowed:
                route_id = str(route["route_node_id"])
                edge_rows.append({
                    "id": f"method_route_reveals_tool:{route_id}->{tool_id}", "source": route_id, "target": tool_id,
                    "relationship": "method_route_reveals_tool", "status": "resolved_ready_for_use",
                    "student_visible": True, "recommendation_only": True, "requirement_lane": "optional",
                    "blocks_progression": False, "condition": condition,
                    "evidence_sources": [source["id"] for source in tool_sources],
                    "explanation": f"{config['label']} is one optional tool for this selected work; another suitable tool remains a valid choice.",
                })
            route_node = nodes.get(str(route.get("route_node_id")))
            if route_node:
                for field in route_fields:
                    route_node[field] = list(route.get(field, []))

        dispositions[tool_id] = {"methods": sorted(config["methods"]), "area_specific_methods": sorted(config["area_methods"]), "condition": condition}

    managed_tool_ids = {config["tool_id"] for config in configs}
    edges = graph.setdefault("edges", [])
    edges[:] = [edge for edge in edges if not (
        edge.get("relationship") == "method_route_reveals_tool" and edge.get("target") in managed_tool_ids
    )]
    edges.extend(edge_rows)
    route_by_key = {(row.get("method_id"), row.get("area_id")): row for row in graph.get("method_area_routes", [])}
    for combo in graph.get("combination_designs", []):
        routes = list(combo.get("area_routes", []))
        routes.extend(route for variant in combo.get("component_route_variants", []) for route in variant.get("area_routes", []))
        for route in routes:
            for contribution in route.get("method_contributions", []):
                source = route_by_key.get((contribution.get("method_id"), route.get("area_id")))
                if source:
                    for field in route_fields:
                        contribution[field] = list(source.get(field, []))
    for route in graph.get("combination_area_routes", []):
        for contribution in route.get("method_contributions", []):
            source = route_by_key.get((contribution.get("method_id"), route.get("area_id")))
            if source:
                for field in route_fields:
                    contribution[field] = list(source.get(field, []))
    graph["core_tool_scope_reconciliation"] = {
        "date": "2026-10-31", "tools": dispositions,
        "all_are_optional_and_skippable": True,
        "route_edges_are_method_and_task_contextual": True,
        "no_route_claims_tool_is_a_role_or_programme_requirement": True,
        "graph_release_gate_remains_separate": True,
    }
    return graph["core_tool_scope_reconciliation"]


def main() -> None:
    graph = load_json_or_gzip(GRAPH_PATH)
    graph["schema_version"] = "2026-11-14.d078-method-area-role-route-graph.v12"
    # Resolve legacy tool-key drift against the runtime contract identity. A
    # runtime-only item is already a real graph node; it must not point at a
    # made-up legacy node or emit a meaningless self-resolution edge.
    graph_nodes = {node["id"]: node for node in graph.get("nodes", [])}
    item_aliases = {
        "domain-item:d078-excel-data-tool": "runtime-item:domain:d078:d078-excel-data-tool",
    }
    normalized_edges = []
    for edge in graph.get("edges", []):
        edge["source"] = item_aliases.get(edge.get("source"), edge.get("source"))
        edge["target"] = item_aliases.get(edge.get("target"), edge.get("target"))
        if edge.get("relationship") == "runtime_contract_resolves_to_learning_item" and edge.get("source") == edge.get("target"):
            continue
        normalized_edges.append(edge)
    graph["edges"] = normalized_edges
    for route in graph.get("method_area_routes", []):
        # Role-owned content belongs to the role card, not the method/area
        # summary. It is reached via role_route_ids after the role is opened.
        route.pop("role_item_ids", None)
        route_node = graph_nodes.get(route.get("route_node_id"))
        if route_node:
            route_node.pop("role_item_ids", None)
    # Named combined routes retain method-attributed contributions. Empty
    # route-level item arrays prevent the UI from accidentally showing a flat
    # union that erases which component method contributes each item.
    contribution_only_fields = (
        "task_family_ids", "area_item_ids", "task_linked_domain_item_ids",
        "available_item_ids", "tool_ids", "domain_downstream_item_ids",
        "domain_tool_ids", "explanatory_item_ids", "role_item_ids",
    )
    for combo in graph.get("combination_designs", []):
        if combo.get("combination_mode") != "fixed_evidence_combination":
            continue
        for route in combo.get("area_routes", []):
            for field in contribution_only_fields:
                if field in route:
                    route[field] = []
            route_node = graph_nodes.get(route.get("route_node_id"))
            if route_node:
                for field in contribution_only_fields:
                    if field in route_node:
                        route_node[field] = []
    for node in graph.get("nodes", []):
        if node.get("kind") == "combination_component_area_route":
            for field in contribution_only_fields:
                if field in node:
                    node[field] = []
    task_sets = json.loads(gzip.open(ROLE_TASK_SET_PATH, "rt", encoding="utf-8").read())
    crosswalk = load_json_or_gzip(CROSSWALK_PATH)
    candidate_route_materialization = install_candidate_route_nodes(graph)
    stata_tool_reconciliation = reconcile_stata_tool_scope(graph)
    r_tool_reconciliation = reconcile_r_tool_scope(graph)
    core_tool_scope_reconciliation = reconcile_other_reviewed_tool_scopes(graph)
    method_area_task_family_reconciliation = apply_method_area_task_family_reconciliations(graph)
    nodes: dict[str, dict[str, Any]] = {node["id"]: node for node in graph["nodes"]}
    edges: list[dict[str, Any]] = graph["edges"]
    role_ids = {node["id"] for node in graph["nodes"] if node.get("kind") == "role"}
    area_task_nodes = {node["id"]: node for node in graph["nodes"] if node.get("kind") == "area_task_family"}
    routed_task_ids = {task_id for route in graph.get("method_area_routes", []) for task_id in route.get("task_family_ids", [])}
    if not routed_task_ids:
        raise SystemExit("No method-routed area task families found")

    # Bind role tasks to the current graph role by the exact stable role slug.
    role_tasks: dict[str, dict[str, Any]] = {}
    role_source_records: dict[str, dict[str, Any]] = {}
    for row in task_sets.get("role_task_sets", []):
        slug = str(row.get("role_key", "")).split(":")[-1]
        role_id = next((rid for rid in role_ids if rid.rsplit(":", 1)[-1] == slug), None)
        if not role_id:
            continue  # e.g. the two research-only roles without a current D078 route
        for task in row.get("task_families", []):
            task_node_id = f"role-task:d078:{slug}"
            if task_node_id in role_tasks:
                raise SystemExit(f"Duplicate task node for role {role_id}")
            refs = source_refs(task)
            if not any(ref["source_role"] == "authoritative_work_sources" for ref in refs):
                raise SystemExit(f"Role task lacks authoritative occupational source: {slug}")
            role_tasks[task_node_id] = {
                "id": task_node_id,
                "kind": "role_task_family",
                "label": task.get("task_wording", "").strip(),
                "role_id": role_id,
                "area_ids": sorted({route["area_id"] for route in graph.get("method_area_role_routes", []) if route["role_id"] == role_id}),
                "source_task_id": task.get("task_id"),
                "task_scope_status": task.get("wording_status"),
                "task_evidence_text": task.get("task_evidence_text_from_current_role_record"),
                "task_conditions": [
                    str(condition).strip()
                    for condition in (task.get("prerequisites") or [])
                    if str(condition).strip()
                ],
                "task_conditions_semantics": "contextual_conditions_not_role_learning_prerequisites",
                "separate_role_foundation_before_task": False,
                "learner_output": task.get("learner_output", []),
                "limitations": task.get("uncertainty_and_exclusions", []),
                "source_references": refs,
                "task_family_selection_role": "work-context explanation; not a qualification, universal employer duty, or method mandate",
                "approval": "locally_reconciled_contextual_role_task_not_student_release_approval",
                "student_visible": True,
            }
            role_source_records[task_node_id] = task

    mapped_roles = {slug for slug in ROLE_FAMILY_MAP}
    graph_role_slugs = {role_id.rsplit(":", 1)[-1] for role_id in role_ids}
    if mapped_roles != graph_role_slugs:
        raise SystemExit(f"Role crosswalk mismatch; unmapped={sorted(graph_role_slugs-mapped_roles)}, unknown={sorted(mapped_roles-graph_role_slugs)}")
    if len(role_tasks) != len(role_ids):
        raise SystemExit(f"Expected one source-backed task context per graph role; got {len(role_tasks)}/{len(role_ids)}")

    task_sets_by_id = {node_id: task for node_id, task in role_source_records.items()}
    role_nodes = {node["id"]: node for node in graph["nodes"] if node.get("kind") == "role"}
    active_edges: list[dict[str, Any]] = []
    edge_ids: set[str] = set()
    for role_task_id, role_task_node in role_tasks.items():
        role_id = role_task_node["role_id"]
        slug = role_id.rsplit(":", 1)[-1]
        role_record = task_sets_by_id[role_task_id]
        ref_by_family: dict[str, dict[str, str]] = {}
        for link in ROLE_FAMILY_MAP[slug]:
            family_id = link["family"]
            family = area_task_nodes.get(family_id)
            if not family or family_id not in routed_task_ids:
                raise SystemExit(f"Role-family edge points outside method-routed family set: {slug}->{family_id}")
            if family.get("area_id") not in role_task_node["area_ids"]:
                raise SystemExit(f"Role-family edge crosses an unsupported role area: {slug}->{family_id}")
            role_refs = source_refs(role_record)
            family_refs = _family_source_refs(family, task_sets)
            role_ids_for_evidence = {ref["id"] for ref in role_refs if ref["source_role"] == "authoritative_work_sources"}
            family_ids_for_evidence = {ref["id"] for ref in family_refs if ref["source_role"] in {"evidence", "authoritative_work_sources", "authoritative_work_source_ids", "candidate_item_evidence_not_task_requirement"}}
            if not role_ids_for_evidence or not family_ids_for_evidence:
                raise SystemExit(f"Role/family synthesis needs both role-task and area-family evidence: {slug}->{family_id}; role={sorted(role_ids_for_evidence)}, area={sorted(family_ids_for_evidence)}")
            source_ids = sorted({ref["id"] for ref in role_refs + family_refs})
            edge_id = f"area_task_family_supports_role_task:{family_id}->{role_task_id}"
            edge = {
                "id": edge_id,
                "source": family_id,
                "target": role_task_id,
                "relationship": "area_task_family_supports_role_task",
                "status": "resolved_ready_for_use",
                "student_visible": True,
                "recommendation_only": True,
                "blocking_policy": "never",
                "sequence_policy": "none",
                "evidence_basis": "reviewed_cross_source_task_scope_synthesis",
                "evidence_source_ids": source_ids,
                "source_references": role_refs + family_refs,
                "explanation": link["why"],
                "condition": link["condition"],
                "fit_claim_limit": "This is a bounded task-context match from the cited role and area evidence; it is not an employer mandate, universal duty, credential, or claim that the learner is job-ready.",
                "confidence": "moderate",
            }
            if edge_id in edge_ids:
                raise SystemExit(f"Duplicate task-family/role edge: {edge_id}")
            edge_ids.add(edge_id)
            active_edges.append(edge)
            ref_by_family[family_id] = {"why": link["why"], "condition": link["condition"]}
        role_task_node["area_task_family_links"] = ref_by_family

    # This contract makes task-family selection an optional focus after the
    # exact method/design and area are known. It never duplicates or promotes
    # an upstream item, and family unions are deduplicated by canonical item ID.
    graph["area_task_family_selection_contract"] = {
        "schema_version": "d078_area_task_family_focus_v1",
        "selection_point": "after_exact_method_or_named_design_and_area_selection",
        "purpose": "Let the learner focus on one or more kinds of work in the selected area and see only the evidence-linked learning and role-task context for those focuses.",
        "selectable_family_source": "task_family_ids in the exact selected method_area_route or combination_area_route, intersected with family nodes marked approved_for_optional_area_task_focus",
        "minimum_selections": 0,
        "maximum_selections": "all eligible families in the exact route",
        "multiple_selection_allowed": True,
        "no_family_selected_behavior": "Keep the general route for the selected area available; do not block or hide the area.",
        "family_to_area_item_behavior": "Use resolved task_has_area_learning_item edges for the selected family IDs; retain area-item ownership, condition and requirement lane; deduplicate the same canonical item reached from multiple selected families and explain each supporting family.",
        "domain_item_carry_forward_behavior": "Use domain_item_supports_area_task edges to show which already-selected domain items support the selected focus. Keep those items domain-owned and selected only once. An unselected upstream item may be offered as an optional add, but is not silently added or made a blocker.",
        "role_behavior": "Show a role-task context only through a resolved area_task_family_supports_role_task edge and the existing role route for the selected area/design. A role may connect to multiple selected families; deduplicate the role card and retain each task-context explanation.",
        "role_item_behavior": "Role-owned items remain available after opening the role. Do not claim a role item is specific to a selected family unless a separate reviewed role-task-to-role-item edge exists.",
        "combined_design_behavior": "Use task_family_ids and method_contributions from the exact named design route; do not union standalone-method routes by default.",
        "item_blocking_policy": "Task-family selection and all family-context edges are non-blocking. Item-level requirement lanes and approved dependency edges remain authoritative.",
        "route_order_policy": "Task families are parallel work-context choices, not a sequence. Sequence items only by an explicit reviewed sequence edge.",
    }
    graph["student_visible"] = True
    graph["student_ui_gate"] = {
        "state": "closed_pending_acceptance",
        "enabled": False,
        "student_facing_approved": False,
        "reason": "The graph is structurally prepared for student projection, but the rendered D078 journey and final release acceptance have not been approved.",
        "required_before_open": ["rendered area and role interaction acceptance", "manual route-matrix verification", "explicit student-facing release approval"],
    }

    # Promote only families with an exact single-method or named-design route.
    # Optional focus status is separate from the release gate.
    promoted_family_ids = sorted(routed_task_ids)
    for family_id in promoted_family_ids:
        family = area_task_nodes[family_id]
        family["approval"] = "locally_reconciled_optional_focus_not_student_release_approval"
        family["review_status"] = "local_graph_reconciliation_complete"
        family["student_visible"] = True
        family["task_family_selection_role"] = "optional work-context focus; not a compulsory learning stage"
    orphan_ids = sorted(set(area_task_nodes) - routed_task_ids)
    candidate_disposition_report = apply_area_task_candidate_dispositions(
        graph, area_task_nodes, routed_task_ids,
    )
    task_preparation_reconciliation = reconcile_area_task_preparation_context(graph, task_sets)
    graph["area_task_preparation_reconciliation"] = {
        "date": "2026-11-09",
        **task_preparation_reconciliation,
    }

    # Materialize the exact routes and source-asserted item memberships added
    # above. These relationships describe applicability or display order, not
    # mandatory learning prerequisites.
    edges[:] = [edge for edge in edges if not str(edge.get("id", "")).startswith((
        "candidate-route:", "candidate-family-item:", "area-foundation:",
    ))]
    candidate_families = {
        "area-task:econ-03", "area-task:econ-04",
        "area-task:d078-politics-governance-public-policy-strategic-foresight-and-policy-scenarios",
    }
    for route in graph.get("method_area_routes", []):
        for family_id in route.get("task_family_ids", []):
            if family_id not in candidate_families:
                continue
            family = area_task_nodes[family_id]
            family_refs = _family_source_refs(family, task_sets)
            method = nodes.get(route["method_id"], {})
            method_refs = []
            for record in method.get("learning_links", []):
                if isinstance(record, dict) and record.get("url"):
                    method_refs.append({"id": record.get("source_id") or "external:" + record["url"],
                        "title": record.get("label") or method.get("label", "Selected method"),
                        "url": record["url"], "locator": record.get("scope_note") or "Learning source recorded on the selected method contract.",
                        "source_role": "method_evidence"})
            if not method_refs:
                method_refs = [{"id": "internal:" + route["method_id"], "title": method.get("label", "Selected method"),
                    "url": "", "locator": "Selected D078 method node and its scoped route contract.", "source_role": "method_evidence"}]
            if not family_refs:
                raise SystemExit(f"New optional area family lacks source evidence: {family_id}")
            edge_id = f"candidate-route:{route['method_id']}->{family_id}:{route['area_id']}"
            edges.append({
                "id": edge_id, "source": route["method_id"], "target": family_id,
                "relationship": "method_applies_to_area_task", "status": "resolved_ready_for_use",
                "student_visible": True, "recommendation_only": True, "blocking_policy": "never",
                "sequence_policy": "none", "evidence_basis": "reviewed_method_area_task_route_synthesis",
                "evidence_source_ids": sorted({ref["id"] for ref in method_refs + family_refs}),
                "source_references": method_refs + family_refs,
                "condition": "Available only in this selected method and area route; any additional domain-item condition on the family must also be met.",
                "fit_claim_limit": "This is a source-supported optional work focus for the selected method and area; it is not a universal requirement or a job-readiness claim.",
                "route_availability": ({"state": "requires_selected_domain_option", "domain_item_ids": family.get("required_selected_domain_item_ids", [])} if family.get("required_selected_domain_item_ids") else {"state": "selected_method_and_area"}),
                "explanation": f"{method.get('label', 'This selected method')} can support {family.get('label', 'this optional area task')} in this area. The learner may skip the focus and continue.",
            })
    for family_id, item_ids in {
        "area-task:econ-03": ["area_enrichment_item:d078-econ-time-series-analysis-and-forecasting"],
        "area-task:econ-04": ["area_enrichment_item:econ-a1", "area_enrichment_item:econ-c2"],
        "area-task:d078-politics-governance-public-policy-strategic-foresight-and-policy-scenarios": ["area_enrichment_item:d078-a03-method-policy-foresight-scenarios"],
    }.items():
        for item_id in item_ids:
            edges.append({
                "id": f"candidate-family-item:{family_id}->{item_id}", "source": family_id, "target": item_id,
                "relationship": "task_has_area_learning_item", "status": "candidate_pending_source_resolution",
                "student_visible": False, "blocking_policy": "never", "sequence_policy": "none",
            })
    area_foundation_contract = graph.get("area_foundation_contract", {})
    foundation_ids_by_area = area_foundation_contract.get("foundation_ids_by_area", {})
    edges[:] = [edge for edge in edges if not str(edge.get("id", "")).startswith("area-foundation:")]
    area_nodes_by_id = {
        str(node.get("area_id")): node for node in graph["nodes"]
        if node.get("kind") == "area_of_specialization"
    }
    current_nodes_by_id = {str(node["id"]): node for node in graph["nodes"]}
    for area_id, foundation_ids in foundation_ids_by_area.items():
        area = area_nodes_by_id.get(str(area_id))
        if not area:
            raise SystemExit(f"Area foundation contract references an unknown area: {area_id}")
        for foundation_id in foundation_ids:
            foundation = current_nodes_by_id.get(str(foundation_id))
            if (not foundation or foundation.get("area_id") != area_id
                    or foundation.get("student_visible") is not True
                    or foundation.get("student_selectable") is False):
                raise SystemExit(f"Area foundation contract references an unavailable item: {area_id}->{foundation_id}")
            foundation_refs = foundation.get("source_references", [])
            if not foundation_refs:
                raise SystemExit(f"Area foundation has no source references: {foundation_id}")
            foundation_explanation = (
                (foundation.get("shared_area_foundation") or {}).get("explanation")
                or foundation.get("description")
                or foundation.get("what_it_is")
                or foundation.get("meaning")
                or foundation.get("label", "")
            )
            edges.append({
                "id": f"area-foundation:area:{area_id}->{foundation_id}",
                "source": area["id"], "target": foundation_id,
                "relationship": "area_has_foundation", "status": "resolved_ready_for_use",
                "student_visible": True, "blocking_policy": "never", "sequence_policy": "display_before_task_choices",
                "recommendation_only": True, "evidence_basis": "reviewed_area_foundation_contract",
                "evidence_source_ids": sorted(ref.get("id", "") for ref in foundation_refs if ref.get("id")),
                "source_references": foundation_refs,
                "condition": "Show this optional area starting point after the area overview and before task-family choices. It may be skipped and does not block the route.",
                "explanation": foundation_explanation,
            })
    generated_measure = area_task_nodes["area-task:econ-04"]
    ai_gate = generated_measure.get("required_selected_domain_item_ids", [])[0]
    edges.append({
        "id": f"candidate-route-context:{ai_gate}->area-task:econ-04", "source": ai_gate,
        "target": "area-task:econ-04", "relationship": "task_family_available_after_selected_domain_option",
        "status": "resolved_ready_for_use", "student_visible": True,
        "blocking_policy": "never", "sequence_policy": "none", "recommendation_only": True,
        "evidence_basis": "reviewed_specialist_extension_condition", "evidence_source_ids": ["external:aea-ai-ml-generated-covariates-2026"],
        "source_references": EXTERNAL_AREA_FAMILY_EVIDENCE["econ-04"],
        "condition": "The learner must actively select the domain AI-use validation/provenance option before this optional economic specialist family is offered. This selection reveals a route choice; it does not automatically select or require the family.",
        "explanation": "This economic extension is relevant only when a generated measure is being considered and its error can be checked.",
    })

    # Resolve exact source-backed links before exposing route relationships.
    # The crosswalk and source ledgers, not a stale node-local candidate field,
    # are the authorities for domain-to-family and family-to-item membership.
    route_relationship_evidence = reconcile_route_relationship_evidence(
        {**graph, "edges": edges}, task_sets, crosswalk,
    )
    # The original area ledger grouped the Mesa/Casevo framework card under
    # reproducible data preparation. That is too broad for an agent-simulation
    # tool. Keep it on the already-routed Computational and Digital Social
    # Science ABM route, under that area's canonical route context, and state
    # the exact simulation condition on the edge.
    casevo_area_item_id = "area_enrichment_item:d078-computational-digital-social-science-mesa-or-casevo"
    casevo_area_family_id = "area-task:d078-computational-digital-social-science-core-task-family"
    edges[:] = [edge for edge in edges if not (
        edge.get("relationship") == "task_has_area_learning_item"
        and edge.get("target") == casevo_area_item_id
    )]
    casevo_area_sources = _unique_contract_refs(
        CASEVO_SOURCE_REVIEW["sources"]
        + [{
            "id": "internal:D078-computational-digital-social-science-core-task-family",
            "title": "Computational and Digital Social Science area route context",
            "url": "",
            "locator": "The existing agent-based-modelling method-to-area route points to this area's canonical task-family context.",
            "source_role": "area_task_route_context",
        }]
    )
    edges.append({
        "id": f"reviewed-casevo-family-item:{casevo_area_family_id}->{casevo_area_item_id}",
        "source": casevo_area_family_id,
        "target": casevo_area_item_id,
        "relationship": "task_has_area_learning_item",
        "status": "resolved_ready_for_use",
        "student_visible": True,
        "recommendation_only": True,
        "requirement_lane": "useful_optional",
        "blocking_policy": "never",
        "sequence_policy": "none",
        "evidence_basis": "official_casevo_project_and_paper_plus_existing_abm_area_route",
        "evidence_source_ids": [ref.get("id") for ref in casevo_area_sources if ref.get("id")],
        "source_references": casevo_area_sources,
        "condition": "Show only after Agent-based modelling is selected for the Computational and Digital Social Science area; this is an optional framework choice, not a prerequisite for other area tasks.",
        "fit_claim_limit": "Casevo is a specialist framework built on Mesa. Its generated agent behaviour is not evidence about real people or a validated forecast.",
        "explanation": "This optional framework choice belongs to the selected agent-based social-simulation route. Mesa provides the broader Python modelling base; Casevo adds a specialist language-model agent workflow.",
    })
    # This specialist Human Geography item has peer-reviewed method evidence
    # and a runnable project tutorial, but no legacy item-membership row. Add
    # one exact optional link to the already-routed Spatial Patterns family.
    # Its method/area availability comes from the existing route; this edge
    # does not create a new method route or a learning prerequisite.
    spatial_item_id = "area_enrichment_item:d078-human-geography-geographical-random-forest"
    spatial_family_id = "area-task:d078-human-geography-population-spatial-patterns"
    edges[:] = [edge for edge in edges if not (
        edge.get("relationship") == "task_has_area_learning_item"
        and edge.get("source") == spatial_family_id
        and edge.get("target") == spatial_item_id
    )]
    spatial_source_refs = (
        VERIFIED_AREA_ITEM_SOURCE_ADDENDA[spatial_item_id]["evidence"]
        + VERIFIED_AREA_ITEM_SOURCE_ADDENDA[spatial_item_id]["learning"]
    )
    edges.append({
        "id": f"verified-source-family-item:{spatial_family_id}->{spatial_item_id}",
        "source": spatial_family_id,
        "target": spatial_item_id,
        "relationship": "task_has_area_learning_item",
        "status": "resolved_ready_for_use",
        "student_visible": True,
        "recommendation_only": True,
        "blocking_policy": "never",
        "sequence_policy": "none",
        "evidence_basis": "reviewed_peer_method_paper_and_project_learning_material",
        "evidence_source_ids": [reference["id"] for reference in spatial_source_refs],
        "source_references": spatial_source_refs,
        "condition": "Optional specialist extension shown only in the selected Human Geography spatial-pattern task context when local prediction is relevant; skip it to continue the ordinary spatial-analysis route.",
        "fit_claim_limit": "The cited method supports exploratory or predictive spatial modeling; it does not establish causal explanation, adequate local sample sizes, or fit for every population and question.",
        "explanation": "This optional extension explores whether a prediction pattern changes from place to place. It builds on spatial data and quantitative analysis, but is not needed for ordinary mapping or description.",
    })
    student_display_reconciliation = reconcile_student_display_contracts(
        {**graph, "edges": edges}, task_sets,
    )
    area_task_item_link_addenda = apply_area_task_item_link_addenda(graph, task_sets)
    # The reconciler mutates the shared node and route dictionaries. Rebind the
    # local maps so the following role/route work reads the final item states.
    nodes = {node["id"]: node for node in graph["nodes"]}

    casevo_tool_id = "domain-item:d078-casevo-tool"
    mesa_tool_id = "domain-item:d078-mesa-tool"
    casevo_tool = nodes.get(casevo_tool_id)
    if casevo_tool and mesa_tool_id in nodes:
        casevo_tool["license"] = DOMAIN_ITEM_CONTRACT_OVERRIDES[casevo_tool_id]["license"]
        casevo_tool["student_display_disposition"]["decision"] = "approved"
        casevo_tool["student_display_disposition"]["historical_hold_superseded"] = True
        edges[:] = [edge for edge in edges if not (
            edge.get("source") == casevo_tool_id
            and edge.get("target") == mesa_tool_id
            and edge.get("relationship") in {"alternative_to", "alternative_tool_option"}
        )]
        casevo_relationship_refs = [
            ref for ref in DOMAIN_ITEM_CONTRACT_OVERRIDES[casevo_tool_id]["evidence"]
            if ref.get("id") in {"external:casevo-official-readme", "external:casevo-framework-paper"}
        ]
        if not any(
            edge.get("source") == casevo_tool_id
            and edge.get("target") == mesa_tool_id
            and edge.get("relationship") == "specialist_extension_of"
            for edge in edges
        ):
            edges.append({
                "id": f"casevo-specialist-extension:{casevo_tool_id}->{mesa_tool_id}",
                "source": casevo_tool_id,
                "target": mesa_tool_id,
                "relationship": "specialist_extension_of",
                "status": "resolved_ready_for_use",
                "student_visible": True,
                "recommendation_only": True,
                "requirement_lane": "useful_optional",
                "blocking_policy": "never",
                "sequence_policy": "none",
                "evidence_source_ids": [ref["id"] for ref in casevo_relationship_refs],
                "source_references": casevo_relationship_refs,
                "explanation": "Casevo is built on Mesa and adds specialist cognitive-agent and language-model features. It is an optional extension, not a separate compulsory method or a replacement for empirical research.",
            })

    # Resolve and expose the already-present method-to-family route edges.
    # This does not change item visibility or requirement lanes.
    route_families = set(promoted_family_ids)
    for edge in edges:
        if edge.get("source") not in route_families and edge.get("target") not in route_families:
            continue
        relation = edge.get("relationship")
        if relation not in {
            "method_applies_to_area_task", "method_contribution_applies_to_area_task",
        }:
            continue
        if edge.get("target") in route_families and relation in {"method_applies_to_area_task", "method_contribution_applies_to_area_task"}:
            edge["blocking_policy"] = "never"
            edge["sequence_policy"] = "none"
            edge["recommendation_only"] = True
            edge["status"] = "resolved_ready_for_use"
            edge["student_visible"] = True
            edge["explanation"] = edge.get("explanation") or "This method or named-design contribution supports this area work context on the selected route; the family remains an optional focus."

    # Insert or replace generated role-task nodes and their edges idempotently.
    for task_id, task_node in role_tasks.items():
        nodes[task_id] = task_node
    replace_prefixes = ("area_task_family_supports_role_task:", "role_task_family_of_role:")
    edges[:] = [edge for edge in edges if not str(edge.get("id", "")).startswith(replace_prefixes)]
    for task_id, task_node in role_tasks.items():
        role_id = task_node["role_id"]
        edges.append({
            "id": f"role_task_family_of_role:{task_id}->{role_id}",
            "source": task_id,
            "target": role_id,
            "relationship": "role_task_family_of_role",
            "status": "resolved_ready_for_use",
            "student_visible": True,
            "blocking_policy": "never",
            "sequence_policy": "none",
            "evidence_basis": "role_task_set_source_profile",
            "evidence_source_ids": sorted({ref["id"] for ref in task_node["source_references"]}),
            "source_references": task_node["source_references"],
            "explanation": "This is a source-grounded example of work associated with the selected role, not an exhaustive or universal job-duty list.",
        })
    edges.extend(active_edges)
    graph["nodes"] = sorted(nodes.values(), key=lambda node: node["id"])
    graph["edges"] = edges
    graph.setdefault("validation", {})["total_nodes"] = len(graph["nodes"])
    graph["validation"]["total_edges"] = len(graph["edges"])
    role_item_reconciliation = load_json_or_gzip(ROLE_ITEM_RECONCILIATION_PATH)
    route_review = load_json_or_gzip(ROLE_ITEM_ROUTE_DISPOSITIONS_PATH)
    role_item_records = {
        int(row["queue_position"]): row
        for row in role_item_reconciliation.get("records", [])
    }
    for decision_index, decision in enumerate(route_review.get("decisions", [])):
        record = role_item_records.get(int(decision["queue_position"]))
        if record is None:
            raise SystemExit(f"Role-route review references missing queue position {decision['queue_position']}")
        if decision.get("decision") == "conditional_task_route":
            record["role_task_relationship_verified"] = True
            record["final_disposition_status"] = "conditional_for_later_integration"
            record["unresolved_reasons"] = []
            record["role_task_reconciliation"] = {
                "status": "verified_bounded_route_task_output",
                "roles_considered": [str(decision["role_id"]).rsplit(":", 1)[-1].replace("-", " ")],
                "task_output_basis": decision["explanation"],
                "evidence_urls": decision.get("evidence_urls", []),
                "bounded_not_universal": True,
                "role_fit_reopened": False,
                "route_condition": decision["condition"],
                "route_limits": decision["limits"],
                "route_review_pointer": f"$/decisions/{decision_index}",
            }
        elif decision.get("decision") == "exclude_from_d078_student_route":
            record["role_task_relationship_verified"] = False
            record["final_disposition_status"] = "hidden"
            record["unresolved_reasons"] = [decision["reason"]]
            record["role_task_reconciliation"] = {
                "status": "not_approved_for_route",
                "roles_considered": [str(decision["role_id"]).rsplit(":", 1)[-1].replace("-", " ")],
                "task_output_basis": decision["reason"],
                "evidence_urls": decision.get("evidence_urls", []),
                "bounded_not_universal": True,
                "role_fit_reopened": False,
                "route_review_pointer": f"$/decisions/{decision_index}",
            }
        else:
            raise SystemExit(f"Unknown role-route disposition for queue position {decision['queue_position']}")
    role_item_reconciliation["route_disposition_review_artifact"] = str(ROLE_ITEM_ROUTE_DISPOSITIONS_PATH.relative_to(ROOT)).replace("\\", "/")
    role_task_item_reconciliation = reconcile_role_task_item_links(graph, role_item_reconciliation, role_tasks)
    nodes = {node["id"]: node for node in graph["nodes"]}
    edges = graph["edges"]

    graph["nodes"] = sorted(nodes.values(), key=lambda node: node["id"])
    graph["edges"] = edges
    graph["task_family_role_context_reconciliation"] = {
        "date": "2026-10-29",
        "source_artifact": str(ROLE_TASK_SET_PATH.relative_to(ROOT)).replace("\\", "/"),
        "route_referenced_area_task_families": len(promoted_family_ids),
        "unrouted_area_task_family_candidates_retained_hidden": len(orphan_ids),
        "area_task_candidate_dispositions": candidate_disposition_report["decision_counts"],
        "role_task_nodes_added": len(role_tasks),
        "role_family_context_edges_added": len(active_edges),
        "area_task_family_role_map": {slug: len(links) for slug, links in ROLE_FAMILY_MAP.items()},
        "role_task_mapping_basis": "Explicit local crosswalk reviewed against the role task wording and cited occupational sources; area task wording and area-scope sources; conditional matches carry conditions. These are synthesis links, not direct employer mandates.",
        "student_visible_graph_projection_ready": graph.get("student_visible") is True,
        "student_ui_gate_closed": graph.get("student_ui_gate", {}).get("enabled") is False,
        "sql_changed": False,
    }
    area_sequence_reconciliation = reconcile_area_sequence(graph)
    graph["area_sequence_reconciliation"] = {
        "date": "2026-11-08",
        **area_sequence_reconciliation,
        "source_artifact": str(SEQUENCE_DISPOSITION_PATH.relative_to(ROOT)).replace("\\", "/"),
        "non_workflow_relationships_are_not_sequence_edges": True,
    }
    role_sequence_contract = annotate_role_sequence_contract(graph)
    graph["role_sequence_reconciliation"] = {
        "date": "2026-10-31",
        "source_artifact": str(ROLE_TASK_SET_PATH.relative_to(ROOT)).replace("\\", "/"),
        "role_sequence_contract": role_sequence_contract,
        "role_route_edges_remain_contextual_not_prerequisites": True,
    }
    role_prerequisite_reconciliation = reconcile_role_prerequisites(graph)
    graph["role_task_item_reconciliation"] = {
        "date": "2026-10-31",
        "source_artifact": str(ROLE_ITEM_RECONCILIATION_PATH.relative_to(ROOT)).replace("\\", "/"),
        **role_task_item_reconciliation,
        "relationship_semantics": "contextual_support_not_prerequisite",
        "out_of_scope_records_keep_explicit_reasons": True,
    }
    graph["route_relationship_evidence_reconciliation"] = {
        "date": "2026-10-31",
        "crosswalk_source": str(CROSSWALK_PATH.relative_to(ROOT)).replace("\\", "/"),
        "area_learning_source_directory": str(AREA_ENRICHMENT_DIR.relative_to(ROOT)).replace("\\", "/"),
        **route_relationship_evidence,
    }
    graph["student_display_contract_reconciliation"] = {
        "date": "2026-11-03",
        "policy": "item-level source-backed display readiness replaces the stale 2026-10-10 blanket hidden state; student release/UI gate remains separate",
        **student_display_reconciliation,
    }
    graph["area_task_item_link_addenda"] = area_task_item_link_addenda
    graph["method_area_task_family_reconciliation"] = method_area_task_family_reconciliation
    graph["area_role_overview_reconciliation"] = {
        "date": "2026-11-02",
        **enrich_area_and_role_overviews(graph),
        "source_artifacts": [
            str(AREA_CATALOG_PATH.relative_to(ROOT)).replace("\\", "/"),
            str(ROLE_LIBRARY_PATH.relative_to(ROOT)).replace("\\", "/"),
        ],
        "role_area_membership_basis": "reviewed method/design area-role routes and resolved area-task-family to role-task context edges",
        "overview_text_does_not_create_item_requirements_or_item_order": True,
    }
    graph["area_tool_deduplication_reconciliation"] = {
        "date": "2026-11-03",
        **deduplicate_area_tool_aliases(graph),
        "policy": "Mesa and Casevo remain distinct canonical selectable tool identities. Neither is selectable at the domain stage. Each appears only in reviewed area/task contexts; a selected item carries through the tray once without alias duplicates. Casevo is a specialist extension built on Mesa, not a synonym or interchangeable replacement.",
    }
    alternative_relationship_reconciliation = reconcile_d078_alternative_contracts(graph)
    graph["method_extension_route_reconciliation"] = {
        "date": "2026-11-06",
        **reconcile_method_extension_route_evidence(graph),
    }
    graph["named_combination_route_synchronization"] = {
        "date": "2026-11-07",
        **synchronize_named_combination_route_contributions(graph),
        "source_of_method_contributions": "exact_current_single_method_area_route_after_reviewed_reconciliation",
        "combined_route_does_not_union_unselected_or_stale_task_families": True,
    }
    graph["selection_progression_contract"] = build_selection_progression_contract(graph)

    # Data integrity gates.
    if graph.get("student_visible") is not True or graph.get("student_ui_gate", {}).get("enabled") is not False or graph.get("student_ui_gate", {}).get("student_facing_approved") is not False:
        raise SystemExit("The graph must be student-visible while the separate UI/release gate remains closed")
    for edge in active_edges:
        if edge.get("blocking_policy") != "never" or edge.get("sequence_policy") != "none":
            raise SystemExit(f"Task-context edge must remain non-blocking: {edge['id']}")
    for family_id in promoted_family_ids:
        family = nodes[family_id]
        if not any(edge.get("source") == family_id and edge.get("relationship") == "task_has_area_learning_item" for edge in edges) and not any(edge.get("target") == family_id and edge.get("relationship") == "domain_item_supports_area_task" for edge in edges):
            raise SystemExit(f"Routed family has no linked learning context: {family_id}")

    # Keep the editable JSON and compressed transport synchronized.
    rendered = json.dumps(graph, ensure_ascii=False, separators=(",", ":")) + "\n"
    GRAPH_PATH.write_text(rendered, encoding="utf-8")
    with gzip.open(GRAPH_GZ_PATH, "wt", encoding="utf-8", compresslevel=9) as stream:
        stream.write(rendered)
    report = {
        "graph_schema_version": graph.get("schema_version"),
        "passed": True,
        "route_referenced_area_task_families_approved_for_optional_focus": len(promoted_family_ids),
        "unrouted_family_candidates_retained_hidden": len(orphan_ids),
        "area_task_candidate_dispositions": candidate_disposition_report,
        "area_task_preparation_reconciliation": graph["area_task_preparation_reconciliation"],
        "candidate_route_materialization": candidate_route_materialization,
        "stata_tool_reconciliation": stata_tool_reconciliation,
        "r_tool_reconciliation": r_tool_reconciliation,
        "core_tool_scope_reconciliation": core_tool_scope_reconciliation,
        "role_task_nodes": len(role_tasks),
        "area_family_to_role_task_edges": len(active_edges),
        "role_task_to_role_edges": len(role_tasks),
        "route_relationship_evidence_reconciliation": route_relationship_evidence,
        "student_display_contract_reconciliation": student_display_reconciliation,
        "area_task_item_link_addenda": area_task_item_link_addenda,
        "method_area_task_family_reconciliation": method_area_task_family_reconciliation,
        "area_sequence_reconciliation": graph["area_sequence_reconciliation"],
        "role_sequence_reconciliation": graph["role_sequence_reconciliation"],
        "role_task_item_reconciliation": graph["role_task_item_reconciliation"],
        "role_prerequisite_reconciliation": {
            "status": role_prerequisite_reconciliation["status"],
            "current_d078_roles_reviewed": role_prerequisite_reconciliation["current_d078_roles_reviewed"],
            "role_item_records_reviewed": role_prerequisite_reconciliation["role_item_records_reviewed"],
            "role_item_preparation_notes_preserved": role_prerequisite_reconciliation["role_item_preparation_notes_preserved"],
            "approved_role_learning_dependency_edges": role_prerequisite_reconciliation["approved_role_learning_dependency_edges"],
        },
        "alternative_relationship_reconciliation": alternative_relationship_reconciliation,
        "selection_progression_contract_summary": {
            "version": graph["selection_progression_contract"]["version"],
            **graph["selection_progression_contract"]["counts"],
        },
        "area_role_overview_reconciliation": graph["area_role_overview_reconciliation"],
        "route_context_edge_counts": {
            relation: sum(edge.get("relationship") == relation and edge.get("source") in route_families or edge.get("relationship") == relation and edge.get("target") in route_families for edge in edges)
            for relation in ("method_applies_to_area_task", "method_contribution_applies_to_area_task", "domain_item_supports_area_task", "task_has_area_learning_item")
        },
        "multiple_family_selection": True,
        "zero_family_selection_keeps_area_route": True,
        "selection_and_family_edges_block_progression": False,
        "student_visible_graph_projection_ready": graph.get("student_visible") is True,
        "student_ui_gate_closed": graph.get("student_ui_gate", {}).get("enabled") is False,
        "sql_changed": False,
        "non_selectable_dispositioned_candidate_ids": orphan_ids,
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
