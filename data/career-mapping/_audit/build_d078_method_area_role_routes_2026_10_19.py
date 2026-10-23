"""Build the D078 method-choice -> area -> role route graph.

This is a route-design artifact, not a SQL seed or student-release approval.
It reuses the reviewed D078 graph, area/task crosswalk, and area/role edges;
it adds only explicit method-combination designs with their evidence and
route-specific explanations.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from itertools import combinations as choose_combinations
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
BASE_GRAPH_PATH = AUDIT / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_15.json"
CROSSWALK_PATH = AUDIT / "D078_DOMAIN_AREA_ROUTE_CROSSWALK_2026_10_10.json"
PROGRAMME_DOMAIN_EVIDENCE_PATH = AUDIT / "programme_domain_evidence_recomputed_2026-10-02.json"
DOMAIN_OVERVIEW_CONTRACT_PATH = AUDIT / "D078_DOMAIN_OVERVIEW_CONTRACT_2026_10_19.json"
OUTPUT_PATH = AUDIT / "D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.json"
REPORT_PATH = ROOT / "docs/manual-review/D078_METHOD_AREA_ROLE_ROUTE_GRAPH_2026_10_19.md"


# The three domain foundations are inherited from the existing, reviewed graph.
FOUNDATION_IDS = [
    "domain-item:d078-research-question-design",
    "domain-item:d078-evaluate-evidence-and-limits",
    "domain-item:d078-communicate-evidence",
]

# The main method choices named in the user's design. Each manually declared
# route is backed by the area's task-family wording in the existing graph.
# Specialist method routes are additionally imported from the reviewed route
# crosswalk below; tools/practices are deliberately not classified as methods.
METHOD_TASKS: dict[str, list[str]] = {
    "domain-item:d078-quantitative-approach": [
        "area-task:d078-sociology-social-anthropology-interpret-social-evidence",
        "area-task:d078-social-anthro-survey-design-and-analysis",
        "area-task:d078-economics-applied-analysis-social-economic-data-analysis",
        "area-task:d078-econ-construct-and-analyze-data",
        "area-task:d078-politics-governance-public-policy-political-survey-opinion",
        "area-task:d078-psychology-social-behaviour-quantitative-behavioural-analysis",
        "area-task:d078-human-geography-population-population-change",
        "area-task:d078-human-geography-population-spatial-patterns",
        "area-task:d078-social-research-evaluation-design-social-study",
        "area-task:d078-social-research-evaluation-programme-evaluation",
        "area-task:d078-computational-digital-social-science-reproducible-social-data",
        "area-task:d078-computational-digital-social-science-digital-trace-content-analysis",
    ],
    "domain-item:d078-qualitative-approach": [
        "area-task:d078-sociology-social-anthropology-qualitative-interview",
        "area-task:d078-sociology-social-anthropology-interpret-social-evidence",
        "area-task:d078-social-anthro-fieldwork-and-community-evidence",
        "area-task:d078-social-anthro-qualitative-and-mixed-analysis",
        "area-task:d078-social-anthro-secondary-and-documentary-research",
        "area-task:d078-politics-governance-public-policy-policy-evidence-brief",
        "area-task:d078-psychology-social-behaviour-qualitative-group-inquiry",
        "area-task:d078-social-research-evaluation-design-social-study",
        "area-task:d078-social-research-evaluation-programme-evaluation",
        "area-task:d078-computational-digital-social-science-digital-trace-content-analysis",
    ],
    "domain-item:d078-mixed-methods": [
        "area-task:d078-social-anthro-qualitative-and-mixed-analysis",
        "area-task:d078-social-anthro-survey-design-and-analysis",
        "area-task:d078-economics-applied-analysis-policy-evaluation",
        "area-task:d078-politics-governance-public-policy-monitoring-evaluation",
        "area-task:d078-psychology-social-behaviour-behavioural-research-design",
        "area-task:d078-social-research-evaluation-design-social-study",
        "area-task:d078-social-research-evaluation-programme-evaluation",
        "area-task:d078-computational-digital-social-science-reproducible-social-data",
    ],
    "domain-item:d078-survey-method": [
        "area-task:d078-social-anthro-survey-design-and-analysis",
        "area-task:d078-economics-applied-analysis-social-economic-data-analysis",
        "area-task:d078-politics-governance-public-policy-political-survey-opinion",
        "area-task:d078-psychology-social-behaviour-behavioural-research-design",
        "area-task:d078-psychology-social-behaviour-quantitative-behavioural-analysis",
        "area-task:d078-human-geography-population-population-change",
        "area-task:d078-social-research-evaluation-design-social-study",
        "area-task:d078-computational-digital-social-science-reproducible-social-data",
    ],
    "domain-item:d078-interviews": [
        "area-task:d078-sociology-social-anthropology-qualitative-interview",
        "area-task:d078-social-anthro-fieldwork-and-community-evidence",
        "area-task:d078-social-anthro-qualitative-and-mixed-analysis",
        "area-task:d078-politics-governance-public-policy-policy-evidence-brief",
        "area-task:d078-psychology-social-behaviour-qualitative-group-inquiry",
        "area-task:d078-social-research-evaluation-design-social-study",
        "area-task:d078-social-research-evaluation-programme-evaluation",
    ],
    "domain-item:d078-document-analysis": [
        "area-task:d078-social-anthro-secondary-and-documentary-research",
        "area-task:d078-sociology-social-anthropology-interpret-social-evidence",
        "area-task:d078-politics-governance-public-policy-institution-and-policy-analysis",
        "area-task:d078-politics-governance-public-policy-computational-policy-text-analysis",
        "area-task:d078-politics-governance-public-policy-policy-evidence-brief",
        "area-task:d078-human-geography-population-population-change",
        "area-task:d078-social-research-evaluation-design-social-study",
        "area-task:d078-computational-digital-social-science-digital-trace-content-analysis",
    ],
    "domain-item:d078-observation-ethnography": [
        "area-task:d078-sociology-social-anthropology-qualitative-interview",
        "area-task:d078-social-anthro-fieldwork-and-community-evidence",
        "area-task:d078-social-anthro-qualitative-and-mixed-analysis",
        "area-task:d078-psychology-social-behaviour-qualitative-group-inquiry",
        "area-task:d078-psychology-social-behaviour-behavioural-research-design",
        "area-task:d078-human-geography-population-core-task-family",
        "area-task:d078-social-research-evaluation-design-social-study",
    ],
    "domain-item:focus-groups-and-workshops": [
        "area-task:d078-sociology-social-anthropology-qualitative-interview",
        "area-task:d078-social-anthro-fieldwork-and-community-evidence",
        "area-task:d078-social-anthro-qualitative-and-mixed-analysis",
        "area-task:d078-politics-governance-public-policy-citizen-participation-process",
        "area-task:d078-psychology-social-behaviour-qualitative-group-inquiry",
        "area-task:d078-psychology-social-behaviour-group-identity-and-participation",
        "area-task:d078-social-research-evaluation-design-social-study",
        "area-task:d078-social-research-evaluation-programme-evaluation",
    ],
    "domain-item:case-study-and-comparative-case-design": [
        "area-task:d078-sociology-social-anthropology-interpret-social-evidence",
        "area-task:d078-social-anthro-secondary-and-documentary-research",
        "area-task:d078-economics-applied-analysis-policy-evaluation",
        "area-task:d078-politics-governance-public-policy-institution-and-policy-analysis",
        "area-task:d078-psychology-social-behaviour-group-identity-and-participation",
        "area-task:d078-psychology-social-behaviour-conflict-context-analysis",
        "area-task:d078-human-geography-population-spatial-patterns",
        "area-task:d078-human-geography-population-population-change",
        "area-task:d078-social-research-evaluation-design-social-study",
        "area-task:d078-social-research-evaluation-programme-evaluation",
        "area-task:d078-computational-digital-social-science-digital-trace-content-analysis",
    ],
    "domain-item:archival-and-historical-research": [
        "area-task:d078-social-anthro-secondary-and-documentary-research",
        "area-task:d078-sociology-social-anthropology-interpret-social-evidence",
        "area-task:d078-econ-official-statistics-sector-and-policy-analysis",
        "area-task:d078-politics-governance-public-policy-institution-and-policy-analysis",
        "area-task:d078-politics-governance-public-policy-policy-evidence-brief",
        "area-task:d078-human-geography-population-population-change",
        "area-task:d078-social-research-evaluation-design-social-study",
        "area-task:d078-computational-digital-social-science-digital-trace-content-analysis",
    ],
    "domain-item:participatory-and-action-research": [
        "area-task:d078-social-anthro-fieldwork-and-community-evidence",
        "area-task:d078-sociology-social-anthropology-core-task-family",
        "area-task:d078-politics-governance-public-policy-citizen-participation-process",
        "area-task:d078-politics-governance-public-policy-legislative-community-scorecard-oversight",
        "area-task:d078-psychology-social-behaviour-group-identity-and-participation",
        "area-task:d078-human-geography-population-core-task-family",
        "area-task:d078-social-research-evaluation-programme-evaluation",
        "area-task:d078-social-research-evaluation-design-social-study",
    ],
    "domain-item:d078-computational-social-research": [
        "area-task:d078-social-anthro-computational-social-inquiry",
        "area-task:d078-politics-governance-public-policy-computational-policy-text-analysis",
        "area-task:d078-social-behaviour-interaction-digital-trace-and-online-network-research",
        "area-task:d078-social-behaviour-interaction-human-in-the-loop-ai-qualitative-analysis",
        "area-task:d078-social-behaviour-interaction-study-ai-mediated-social-behaviour-and-simulation",
        "area-task:d078-econ-computational-economic-scenarios",
        "area-task:d078-econ-construct-and-analyze-data",
        "area-task:d078-computational-digital-social-science-core-task-family",
        "area-task:d078-computational-digital-social-science-reproducible-social-data",
        "area-task:d078-computational-digital-social-science-digital-trace-content-analysis",
    ],
    "domain-item:d078-spatial-social-analysis": [
        "area-task:d078-human-geography-population-spatial-patterns",
        "area-task:d078-human-geography-population-population-change",
        "area-task:d078-computational-digital-social-science-reproducible-social-data",
    ],
    "domain-method:social-network-analysis": [
        "area-task:d078-sociology-social-anthropology-core-task-family",
        "area-task:soc-05",
        "area-task:d078-politics-governance-public-policy-institution-and-policy-analysis",
        "area-task:d078-psychology-social-behaviour-group-identity-and-participation",
        "area-task:d078-social-behaviour-interaction-digital-trace-and-online-network-research",
        "area-task:d078-social-research-evaluation-design-social-study",
        "area-task:d078-computational-digital-social-science-core-task-family",
        "area-task:d078-computational-digital-social-science-digital-trace-content-analysis",
    ],
    "domain-method:network-analysis": [
        "area-task:d078-sociology-social-anthropology-core-task-family",
        "area-task:d078-politics-governance-public-policy-institution-and-policy-analysis",
        "area-task:d078-psychology-social-behaviour-group-identity-and-participation",
        "area-task:d078-social-behaviour-interaction-digital-trace-and-online-network-research",
        "area-task:d078-social-research-evaluation-design-social-study",
        "area-task:d078-computational-digital-social-science-core-task-family",
        "area-task:d078-computational-digital-social-science-digital-trace-content-analysis",
    ],
}

# Evidence-backed combination patterns, not an exhaustive Cartesian product.
# Each pattern explains why the combination is coherent, how it is sequenced,
# and what integration/output the learner must produce.
COMBINATIONS = [
    {
        "id": "combo:exploratory-sequential",
        "label": "Explore first, measure next",
        "method_ids": ["domain-item:d078-qualitative-approach", "domain-item:d078-survey-method"],
        "design": "exploratory_sequential_mixed_methods",
        "why": "Use interviews or focus groups to discover local language, experiences or response options, then build a survey to examine how widely those patterns appear. The first phase informs the second; the two are not just separate studies placed together.",
        "how": "Qualitative inquiry -> refine concepts/questions -> pilot the survey -> collect and analyse survey data -> explain how the phases connect.",
        "foundation_links": [FOUNDATION_IDS[0], FOUNDATION_IDS[1], FOUNDATION_IDS[2]],
        "condition": "Choose this when the topic or likely answer range is not yet understood well enough to design useful survey items.",
        "limit": "A small qualitative phase does not estimate prevalence; a later survey is only generalisable to the extent its sampling and measurement support that claim.",
        "sources": ["src:mixed-methods-designs", "src:questionnaire-development-qualitative-first"],
    },
    {
        "id": "combo:explanatory-sequential",
        "label": "Measure a pattern, then explain it",
        "method_ids": ["domain-item:d078-survey-method", "domain-item:d078-interviews"],
        "design": "explanatory_sequential_mixed_methods",
        "why": "A survey can show which patterns are common in the sampled group; follow-up interviews can explore how participants understand or experience a surprising or important pattern.",
        "how": "Survey -> identify a result needing explanation -> select interview participants/questions -> analyse interviews -> integrate the explanation with the survey findings.",
        "foundation_links": [FOUNDATION_IDS[0], FOUNDATION_IDS[1], FOUNDATION_IDS[2]],
        "condition": "Choose this when the numerical result needs context or an explanation that the survey did not collect.",
        "limit": "Interviews explain meanings and mechanisms; they do not independently prove why the survey pattern occurred or make the survey causal.",
        "sources": ["src:mixed-methods-designs", "src:survey-mixed-methods"],
    },
    {
        "id": "combo:convergent-survey-interview",
        "label": "Compare survey and interview evidence",
        "method_ids": ["domain-item:d078-survey-method", "domain-item:d078-interviews"],
        "design": "convergent_mixed_methods",
        "why": "Collect numerical and interview evidence around the same question when the learner needs to compare whether they agree, differ or illuminate different parts of the issue.",
        "how": "Plan the shared question and separate strands -> collect/analyse each appropriately -> compare or integrate results -> explain agreement, disagreement and remaining uncertainty.",
        "foundation_links": [FOUNDATION_IDS[0], FOUNDATION_IDS[1], FOUNDATION_IDS[2]],
        "condition": "Choose this only when there is a planned integration question, not merely because both methods are available.",
        "limit": "Different samples, measures or timing may explain disagreement; convergence does not automatically prove truth.",
        "sources": ["src:mixed-methods-designs", "src:survey-mixed-methods"],
    },
    {
        "id": "combo:focus-group-to-survey",
        "label": "Use group discussion to shape a survey",
        "method_ids": ["domain-item:focus-groups-and-workshops", "domain-item:d078-survey-method"],
        "design": "qualitative_instrument_development",
        "why": "Focus groups can reveal concepts, wording and response options participants use, helping a later questionnaire ask clearer and more relevant questions.",
        "how": "Review the topic and evidence -> facilitate a bounded group discussion -> identify candidate concepts/language -> draft and cognitively test survey items -> pilot before wider use.",
        "foundation_links": [FOUNDATION_IDS[0], FOUNDATION_IDS[1]],
        "condition": "Useful when the researcher cannot confidently anticipate the range of answers or locally meaningful terms.",
        "limit": "Group interaction can shape what people say; group findings do not establish how common a view is.",
        "sources": ["src:questionnaire-development-qualitative-first", "src:survey-questionnaire-development"],
    },
    {
        "id": "combo:survey-followup-focus-group",
        "label": "Use group discussion to interpret survey findings",
        "method_ids": ["domain-item:d078-survey-method", "domain-item:focus-groups-and-workshops"],
        "design": "explanatory_qualitative_followup",
        "why": "A survey can identify a distribution or subgroup difference; a focus group can explore how participants interpret the issue and what explanations merit further investigation.",
        "how": "Analyse survey -> define the unresolved question -> recruit a purposeful discussion group -> analyse interaction and accounts -> connect the qualitative interpretation back to the survey limits.",
        "foundation_links": [FOUNDATION_IDS[0], FOUNDATION_IDS[1], FOUNDATION_IDS[2]],
        "condition": "Choose when the survey surfaces an ambiguity that can be explored through group discussion.",
        "limit": "A focus group is not a representative vote and should not be used to estimate population percentages.",
        "sources": ["src:survey-mixed-methods", "src:questionnaire-development-qualitative-first"],
    },
    {
        "id": "combo:case-study-multiple-sources",
        "label": "Build a case study from complementary evidence sources",
        "method_ids": ["domain-item:case-study-and-comparative-case-design", "domain-item:d078-interviews", "domain-item:d078-document-analysis", "domain-item:d078-observation-ethnography"],
        "design": "case_study_multiple_sources",
        "why": "A case study is a bounded research design, not a single collection method. Interviews, documents and observation can reveal different sides of the same case; a survey or existing dataset can be added when the case question needs numerical evidence.",
        "how": "Define the case and question -> choose evidence sources that answer distinct parts -> collect and analyse each with its own method -> compare/integrate the sources -> report contradictions and gaps.",
        "foundation_links": [FOUNDATION_IDS[0], FOUNDATION_IDS[1], FOUNDATION_IDS[2]],
        "condition": "Use multiple sources when each contributes distinct evidence about the bounded case and there is a plan to interpret them together.",
        "limit": "More sources do not guarantee better evidence; source access, quality, ethics and contradictions still need assessment.",
        "sources": ["src:case-study-multiple-evidence", "src:case-study-research-guide"],
    },
    {
        "id": "combo:interview-and-observation",
        "label": "Compare what people say with situated observation",
        "method_ids": ["domain-item:d078-interviews", "domain-item:d078-observation-ethnography"],
        "design": "qualitative_method_triangulation",
        "why": "Interviews provide accounts and interpretations; observation can document actions, interactions and settings. Their comparison can expose context or differences between reported and observed practice.",
        "how": "Frame the shared question -> conduct ethically appropriate interviews and observations -> keep distinct records -> compare what each source can show and explain divergence.",
        "foundation_links": [FOUNDATION_IDS[0], FOUNDATION_IDS[1], FOUNDATION_IDS[2]],
        "condition": "Use when understanding both accounts and situated practice matters and observation is permitted and feasible.",
        "limit": "Observation is selective and may change behaviour; it cannot reveal private motives without additional evidence.",
        "sources": ["src:case-study-multiple-evidence", "src:case-study-research-guide"],
    },
    {
        "id": "combo:document-and-interview-elicitation",
        "label": "Use documents to support an interview",
        "method_ids": ["domain-item:d078-document-analysis", "domain-item:d078-interviews"],
        "design": "document_elicitation_interview",
        "why": "A document, timeline or participant-created record can help an interview explore how its author understands a decision or experience, rather than treating the document as self-explanatory.",
        "how": "Select an appropriate document -> assess provenance and sensitivity -> invite the participant to interpret it -> analyse the document and account separately, then connect them.",
        "foundation_links": [FOUNDATION_IDS[0], FOUNDATION_IDS[1], FOUNDATION_IDS[2]],
        "condition": "Useful when the document has meaning to a participant or records a process the interview asks about.",
        "limit": "One person's interpretation does not establish the document's complete provenance or institutional meaning.",
        "sources": ["src:document-elicitation-interviews", "src:case-study-research-guide"],
    },
    {
        "id": "combo:participatory-method-choice",
        "label": "Choose evidence methods with participants",
        "method_ids": ["domain-item:participatory-and-action-research", "domain-item:d078-interviews", "domain-item:focus-groups-and-workshops", "domain-item:d078-survey-method", "domain-item:d078-observation-ethnography"],
        "combination_mode": "design_frame_with_selectable_methods",
        "required_method_ids": ["domain-item:participatory-and-action-research"],
        "selectable_component_method_ids": ["domain-item:d078-interviews", "domain-item:focus-groups-and-workshops", "domain-item:d078-survey-method", "domain-item:d078-observation-ethnography"],
        "design": "participatory_or_community_based_inquiry",
        "why": "Participatory research is a governance and collaboration approach; it can use interviews, group discussions, surveys or observation when participants and the question justify them.",
        "how": "Agree the question, roles and decision rights -> choose accessible evidence methods together -> collect/analyse with appropriate participation -> share interpretation and action decisions transparently.",
        "foundation_links": [FOUNDATION_IDS[0], FOUNDATION_IDS[1], FOUNDATION_IDS[2]],
        "condition": "Use where the research purpose and governance genuinely involve participants in shaping decisions; do not label ordinary data collection participatory.",
        "limit": "Participation does not remove power imbalances, consent obligations, safety risks or the need to justify sampling and analysis.",
        "sources": ["src:mixed-methods-designs", "src:participatory-route-area-evidence"],
    },
]

# The contribution is the job each method performs inside the named design.
# Contribution roles are intentionally asymmetric where the design is led by
# one method; they do not imply that every component has equal weight.
COMBINATION_METHOD_CONTRIBUTIONS = {
    "combo:exploratory-sequential": {
        "domain-item:d078-qualitative-approach": "Leads exploration: identifies relevant concepts, language and response possibilities.",
        "domain-item:d078-survey-method": "Builds on that exploration to measure how the identified patterns are distributed in a defined population.",
    },
    "combo:explanatory-sequential": {
        "domain-item:d078-survey-method": "Leads the first phase: identifies a pattern or result that needs explanation.",
        "domain-item:d078-interviews": "Follows up: explores how participants understand or experience the selected result.",
    },
    "combo:convergent-survey-interview": {
        "domain-item:d078-survey-method": "Produces standardized evidence for the shared question, analysed on its own terms before integration.",
        "domain-item:d078-interviews": "Produces contextual accounts for the shared question, analysed on its own terms before integration.",
    },
    "combo:focus-group-to-survey": {
        "domain-item:focus-groups-and-workshops": "Develops or checks concepts and participant language that inform the instrument.",
        "domain-item:d078-survey-method": "Leads measurement after the group-informed questions have been drafted and tested.",
    },
    "combo:survey-followup-focus-group": {
        "domain-item:d078-survey-method": "Leads the first phase: identifies a distribution, contrast or ambiguity in the sampled data.",
        "domain-item:focus-groups-and-workshops": "Follows up: explores interpretations or explanations without estimating how common they are.",
    },
    "combo:case-study-multiple-sources": {
        "domain-item:case-study-and-comparative-case-design": "Defines and bounds the case and the questions each source must answer.",
        "domain-item:d078-interviews": "Contributes participant or stakeholder accounts relevant to the bounded case.",
        "domain-item:d078-document-analysis": "Contributes documentary records, with provenance and omissions assessed.",
        "domain-item:d078-observation-ethnography": "Contributes situated evidence about practice, interaction or setting when access is appropriate.",
    },
    "combo:interview-and-observation": {
        "domain-item:d078-interviews": "Contributes reported accounts and participants’ interpretations.",
        "domain-item:d078-observation-ethnography": "Contributes situated observations that can contextualize or contrast with reported accounts.",
    },
    "combo:document-and-interview-elicitation": {
        "domain-item:d078-document-analysis": "Provides a bounded record or prompt whose provenance and context are assessed.",
        "domain-item:d078-interviews": "Invites an account of how the participant understands that record or process.",
    },
    "combo:participatory-method-choice": {
        "domain-item:participatory-and-action-research": "Sets the shared governance frame: participants help shape questions, roles and interpretation.",
    },
}

# Existing domain-owned tools/method nodes are linked below the method branch
# only where their current contract names that task relationship. These are
# optional/conditional resources, never gates. The statistical package family
# is a genuine learner choice node, not a checklist.
METHOD_DOWNSTREAM_LINKS = {
    "domain-item:d078-quantitative-approach": [
        ("domain-item:d078-statistical-tool-choice", "method_specific_choice", "Choose an analysis workflow only after the question, data and statistical task are clear."),
        ("domain-item:d078-sensitivity-and-robustness-analysis", "specialist_extension_of", "Add optional sensitivity and robustness checks when plausible analytic choices could change a quantitative conclusion."),
        ("domain-item:d078-chi-square-tests", "useful_method_extension", "Choose this test only for a suitable categorical-count question and design; it is one option, not a required step for every quantitative study."),
        ("domain-item:d078-fisher-exact-test", "alternative_method_option", "Consider for suitable small-sample 2-by-2 categorical tables when its assumptions and question fit."),
        ("domain-item:d078-barnard-exact-test", "alternative_method_option", "An alternative unconditional exact procedure for suitable 2-by-2 categorical comparisons; not a universal replacement."),
        ("domain-item:d078-boschloo-exact-test", "alternative_method_option", "An unconditional exact alternative for suitable 2-by-2 categorical comparisons; choose according to the design and analysis plan."),
        ("domain-item:d078-t-tests", "useful_method_extension", "Use only for a suitable comparison of means when outcome, groups, sampling and assumptions support it."),
        ("domain-item:d078-wilcoxon-rank-tests", "alternative_method_option", "A rank-based alternative for certain paired or independent comparisons; it answers a related but not always identical question to a t-test."),
        ("domain-item:d078-anova-and-repeated-measures", "useful_method_extension", "Use for suitable comparisons across multiple groups or repeated observations, with a design-appropriate model."),
        ("domain-item:d078-kruskal-wallis-test", "alternative_method_option", "A rank-based option for suitable independent-group comparisons; it is not an automatic substitute for every ANOVA."),
        ("domain-item:d078-friedman-test", "alternative_method_option", "A rank-based option for suitable matched or blocked repeated measurements."),
        ("domain-item:d078-pearson-correlation", "useful_method_extension", "Measure linear association for suitable numeric variables; association alone does not show causation."),
        ("domain-item:d078-spearman-rank-correlation", "alternative_method_option", "Assess monotonic rank association when this better fits the variables and question."),
        ("domain-item:d078-kendall-rank-correlation", "alternative_method_option", "Assess rank association for suitable ordinal or ranked data, considering ties and sample characteristics."),
        ("domain-item:d078-linear-regression-ols", "useful_method_extension", "Model a suitable continuous outcome and explain assumptions, uncertainty and limits on causal interpretation."),
        ("domain-item:d078-logistic-regression", "useful_method_extension", "Model a suitable binary outcome; check outcome coding, design, assumptions and interpretation."),
        ("domain-item:d078-probit-regression", "alternative_method_option", "A binary-outcome model with a different link function; choose it for a reasoned modelling plan, not because it is universally better."),
        ("domain-item:d078-ordinal-regression", "useful_method_extension", "Model a suitable ordered categorical outcome while checking the model's assumptions."),
        ("domain-item:d078-multinomial-logistic-regression", "useful_method_extension", "Model a suitable unordered categorical outcome with multiple categories."),
        ("domain-item:d078-count-regression", "useful_method_extension", "Model suitable count outcomes and check distributional assumptions and exposure/time structure."),
        ("domain-item:d078-regularized-linear-regression", "specialist_extension_of", "Use ridge, LASSO or elastic-net approaches for suitable prediction or high-dimensional settings; do not present prediction as causal explanation."),
        ("domain-item:d078-tree-ensemble-prediction", "specialist_extension_of", "A predictive option for suitable data; assess validation, leakage, fairness and interpretability before use."),
    ],
    "domain-item:discourse-and-conversation-analysis": [
        ("domain-item:d078-critical-discourse-analysis", "method_specific_deepening", "Critical discourse analysis is a particular interpretive approach within the broader study of discourse; choose it when the question examines language, power and social context."),
        ("domain-item:d078-conversation-analysis", "alternative_method_option", "Conversation analysis is a distinct approach focused on the organization of interaction and talk; it is not interchangeable with every discourse approach."),
        ("domain-item:d078-nlp-and-text-mining", "optional_computational_extension", "Computational text analysis can support large or structured text collections, but needs construct checks and human review; it does not replace interpretive analysis."),
    ],
    "domain-item:d078-computational-social-research": [
        ("domain-item:d078-nlp-and-text-mining", "method_specific_deepening", "Use computational text methods for suitable social-text questions, with attention to language coverage, provenance and validation."),
        ("domain-item:d078-supervised-machine-learning", "optional_computational_extension", "Use supervised prediction/classification only with labelled data, held-out evaluation and a clear account of what prediction does not establish."),
    ],
    "domain-item:experiments-quasi-experiments-and-causal-inference": [
        ("domain-item:d078-sensitivity-and-robustness-analysis", "specialist_extension_of", "Check whether a causal estimate changes under plausible assumptions or analytic choices; this remains optional and design-specific."),
    ],
    "domain-item:d078-psychometrics-and-scale-construction": [
        ("domain-item:d078-sensitivity-and-robustness-analysis", "specialist_extension_of", "Check whether measurement-model or scoring conclusions change under plausible analytic choices."),
    ],
    "domain-item:longitudinal-panel-and-multilevel-data": [
        ("domain-item:d078-sensitivity-and-robustness-analysis", "specialist_extension_of", "Check whether a panel or multilevel result changes under plausible specifications or assumptions."),
    ],
    "domain-item:programme-evaluation-and-theory-of-change": [
        ("domain-item:d078-sensitivity-and-robustness-analysis", "specialist_extension_of", "Use for quantitative evaluation findings when reasonable analytic choices could change the conclusion."),
        ("domain-item:d078-scenario-analysis", "specialist_extension_of", "Compare plausible future conditions when the evaluation or decision concerns uncertainty about what may happen next."),
    ],
    "domain-item:d078-agent-based-modeling": [
        ("domain-item:d078-netlogo-tool", "alternative_tool_option", "NetLogo is a general-purpose agent-based modelling environment; choose it instead of another framework when its workflow fits."),
        ("domain-item:d078-scenario-analysis", "alternative_to", "Scenario analysis explores plausible futures without representing each person as a generated agent."),
    ],
    "domain-method:social-network-analysis": [
        ("domain-item:d078-igraph-tool", "alternative_tool_option", "R/igraph is an optional code-based network-analysis workflow; use it when the data, measures and R workflow fit."),
    ],
    "domain-method:network-analysis": [
        ("domain-item:d078-igraph-tool", "alternative_tool_option", "R/igraph is an optional code-based network-analysis workflow; use it when the data, measures and R workflow fit."),
    ],
    "domain-item:d078-statistical-tool-choice": [
        ("domain-item:d078-jamovi-tool", "alternative_tool_option", "An introductory graphical workflow when its analyses fit the task."),
        ("domain-item:d078-spss-tool", "alternative_tool_option", "A menu/syntax statistical workflow when the project or institution uses it."),
        ("domain-item:r-statistical-computing", "alternative_tool_option", "A code-based statistical workflow for repeatable analysis."),
        ("domain-item:stata-quantitative-social-science-workflow", "alternative_tool_option", "A statistical workflow for suitable social-science data and models."),
        ("domain-item:d078-excel-data-tool", "lighter_tool_option", "Useful for bounded data organisation and summaries, not a substitute for every statistical method."),
    ],
    "domain-item:d078-qualitative-approach": [
        ("domain-item:d078-qualitative-coding-tool", "optional_tool_option", "Use for a lightweight, traceable text-coding workflow."),
        ("domain-item:d078-nvivo-tool", "optional_tool_option", "Use when substantial qualitative material needs organised coding and retrieval."),
    ],
    "domain-item:d078-interviews": [
        ("domain-item:d078-qualitative-coding-tool", "optional_analysis_tool", "May support later coding of interview transcripts; it does not conduct or interpret an interview."),
        ("domain-item:d078-nvivo-tool", "optional_analysis_tool", "May organise larger interview collections after transcription and consent checks."),
    ],
    "domain-item:focus-groups-and-workshops": [
        ("domain-item:d078-qualitative-coding-tool", "optional_analysis_tool", "May help organise and code discussion transcripts or notes."),
        ("domain-item:d078-nvivo-tool", "optional_analysis_tool", "May help manage substantial group-discussion material."),
    ],
    "domain-item:d078-document-analysis": [
        ("domain-item:d078-qualitative-coding-tool", "optional_analysis_tool", "May help code a bounded documentary corpus."),
        ("domain-item:d078-nvivo-tool", "optional_analysis_tool", "May organise a large or complex documentary corpus."),
    ],
    "domain-item:d078-survey-method": [
        ("domain-item:d078-survey-data-collection-tool", "optional_collection_tool", "KoboToolbox can collect electronic forms when the design, access, privacy and offline needs fit."),
    ],
    "domain-item:d078-computational-social-research": [
        ("domain-item:d078-python", "conditional_language_option", "Use Python when the selected task needs a repeatable computational workflow; coding is not required for all computational social research."),
        ("domain-item:d078-jupyter", "optional_workbench", "Use a notebook when code, explanation and outputs should be recorded together."),
        ("domain-item:d078-pandas-tool", "conditional_library", "Use for tabular data cleaning and combination inside Python."),
        ("domain-item:d078-matplotlib-tool", "conditional_library", "Use when a reproducible Python chart is useful for the analysis or communication."),
        ("domain-item:d078-scikit-learn", "specialist_library", "Use only for a defined predictive/text-modelling task with suitable validation."),
    ],
    "domain-item:d078-spatial-social-analysis": [
        ("area_enrichment_item:d078-human-geography-population-spatial-analysis-method", "area_specific_deepening", "Continue into the human-geography spatial-analysis method when the question is genuinely place-based."),
    ],
    "domain-method:social-network-analysis": [
        ("domain-item:d078-social-network-tool", "visual_network_tool", "Gephi supports visual exploration of relational data after the network boundary, nodes and ties are defined."),
        ("domain-item:d078-networkx-tool", "computational_network_tool", "NetworkX supports programmable graph construction and analysis; choose it for a code workflow."),
    ],
    "domain-method:network-analysis": [
        ("domain-item:d078-networkx-tool", "computational_network_tool", "NetworkX can represent and analyse graph structures in a code workflow."),
        ("domain-item:d078-social-network-tool", "visual_network_tool", "Gephi can help explore and visualise a network after its data and boundary are defined."),
    ],
    "domain-item:d078-agent-based-modeling": [
        ("domain-item:d078-mesa-tool", "simulation_framework", "Mesa is one Python framework for implementing a justified agent-based model."),
        ("domain-item:d078-casevo-tool", "specialist_simulation_tool", "Casevo is a narrower cognitive-agent/network simulation option, not the default for every ABM."),
    ],
}

SOURCE_REGISTRY = {
    "src:manchester-social-network-analysis": {
        "title": "University of Manchester: Social Network Analysis",
        "url": "https://methods.manchester.ac.uk/archive/survey-and-statistical-methods/social-network-analysis/",
        "supports": "SNA studies relations among actors/nodes, ties/edges and actor attributes; provides method-specific introductory explanation.",
        "limits": "An introductory methods page; it does not establish SNA as necessary for every sociology or D078 route.",
    },
    "src:columbia-social-network-analysis": {
        "title": "Columbia University: Social Network Analysis",
        "url": "https://www.publichealth.columbia.edu/research/population-health-methods/social-network-analysis",
        "supports": "Distinction between attribute and relational data, network boundaries, graph representations, and examples of network measures.",
        "limits": "Population-health examples; measures and interpretation must be selected for the social-science question and data quality.",
    },
    "src:networkx-social-analysis-learning": {
        "title": "NetworkX Guides: Facebook Network Analysis",
        "url": "https://networkx.org/nx-guides/content/exploratory_notebooks/facebook_notebook.html",
        "supports": "Free applied tutorial showing a social-network dataset represented and analysed with NetworkX.",
        "limits": "A Facebook friend-network example; not a general sampling/ethics guide and not transferable as a claim about other populations.",
    },
    "src:networkx-official-tutorial": {
        "title": "NetworkX official tutorial",
        "url": "https://networkx.org/documentation/stable/tutorial.html",
        "supports": "Official reference for representing graph nodes/edges, attributes and basic graph operations; appropriate as a tool learning resource after the method is chosen.",
        "limits": "Software documentation teaches implementation, not sound social-network research design, data collection or ethical practice.",
    },
    "src:mixed-methods-designs": {
        "title": "Fetters, Curry & Creswell: Achieving Integration in Mixed Methods Designs",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4097839/",
        "supports": "Exploratory sequential, explanatory sequential and convergent mixed-method designs; integration must be planned across design, methods and interpretation.",
        "limits": "Methods paper, with health-care examples; it supports design logic, not a claim that every D078 task needs mixed methods.",
    },
    "src:questionnaire-development-qualitative-first": {
        "title": "Selecting, Designing, and Developing Your Questionnaire",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC420179/",
        "supports": "Qualitative exploration, including focus groups, can inform questionnaire concepts and response ranges; surveys are not suitable for every question.",
        "limits": "Questionnaire-development guidance; it does not make focus groups mandatory before every survey.",
    },
    "src:survey-questionnaire-development": {
        "title": "Developing Questionnaires for Educational Research: AMEE Guide No. 87",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4059192/",
        "supports": "Interview/focus-group input, cognitive interviews and pilot testing as possible questionnaire development stages.",
        "limits": "Education/health research guidance; transfer the method logic, not domain-specific requirements.",
    },
    "src:survey-mixed-methods": {
        "title": "Mixed Methods and Survey Research in Family Medicine and Community Health",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6910743/",
        "supports": "Surveys can precede qualitative follow-up, follow qualitative exploration, or be compared with concurrent qualitative evidence in mixed-method designs.",
        "limits": "Health/community examples; does not establish that any particular social-science study needs both.",
    },
    "src:case-study-multiple-evidence": {
        "title": "The Case Study Approach",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC3141799/",
        "supports": "Case studies may combine questionnaires, interviews, focus groups and observation as multiple sources of evidence.",
        "limits": "Health-services examples; the evidence-source logic is general but not a universal recipe.",
    },
    "src:case-study-research-guide": {
        "title": "Case studies: a guide for researchers, educators, and implementers",
        "url": "https://bmjmedicine.bmj.com/content/4/1/e001623",
        "supports": "A bounded case can use documents, interviews, ethnographic observation, focus groups and quantitative data; source choice follows the case question.",
        "limits": "Practical guide; it does not imply all sources must be collected in every case study.",
    },
    "src:document-elicitation-interviews": {
        "title": "Participant-created documents as an elicitation tool",
        "url": "https://www.ncbi.nlm.nih.gov/books/NBK539384/",
        "supports": "Documents can prompt interviews in which authors explain the meaning and context of their records.",
        "limits": "Illustrative qualitative technique; it is conditional on suitable documents, consent and a relevant question.",
    },
    "src:participatory-route-area-evidence": {
        "title": "D078 area/role task set and route crosswalk",
        "url": "data/career-mapping/_audit/D078_DOMAIN_AREA_ROUTE_CROSSWALK_2026_10_10.json",
        "supports": "D078 task routes for participatory/action research, citizen participation, community evidence and evaluation.",
        "limits": "Local reviewed task-route evidence; not a universal requirement or proof that a particular method combination is appropriate.",
    },
    "src:ukri-research-data-policy-2026": {
        "title": "UKRI Research Data Policy",
        "url": "https://www.ukri.org/publications/uk-research-and-innovation-research-data-policy/ukri-research-data-policy/",
        "supports": "Research data are information collected, created, generated, observed or derived from existing sources through any research method; supports data-care preparation when a selected project handles such data.",
        "locator": "Policy statement and definition of research data",
        "accessed": "2026-10-22",
        "limits": "A general policy, not a claim that every project must publicly share data or use the same management plan.",
    },
    "src:esrc-ethics-principles": {
        "title": "ESRC Framework for Research Ethics: Core Principles",
        "url": "https://www.ukri.org/councils/esrc/guidance-for-applicants/research-ethics-guidance/framework-for-research-ethics/our-core-principles/",
        "supports": "Ethical reflection applies across a research lifecycle; specific participant, privacy, harm and governance duties depend on the project and method.",
        "locator": "Core principles and ethics-in-practice sections",
        "accessed": "2026-10-22",
        "limits": "Does not make every method ethically identical or establish a universal method prerequisite.",
    },
    "src:uk-data-service-qualitative-reuse": {
        "title": "UK Data Service: Qualitative Data and Reuse",
        "url": "https://ukdataservice.ac.uk/learning-hub/qualitative-data/",
        "supports": "Existing qualitative records such as interview transcripts, diaries, field notes and open-ended responses can be reused; qualitative and quantitative evidence can also be combined where justified.",
        "locator": "Qualitative data and Reusing qualitative data sections",
        "accessed": "2026-10-22",
        "limits": "Reuse depends on data access, consent, context, documentation and fit to the new question.",
    },
    "src:uk-data-service-secondary-analysis": {
        "title": "UK Data Service: New to Using Data",
        "url": "https://ukdataservice.ac.uk/learning-hub/new-to-using-data/",
        "supports": "Secondary analysis reuses previously collected qualitative or quantitative data for a new question; social-science datasets are gathered using a range of methods.",
        "locator": "Secondary analysis and types of social-science data sections",
        "accessed": "2026-10-22",
        "limits": "A new question still requires checking data provenance, access permissions, population/period coverage, measures and original collection context.",
    },
    "src:abm-empirical-social-research": {
        "title": "Bruch and Atwell: Agent-Based Models in Empirical Social Research",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4430112/",
        "supports": "Empirical social ABM can use behavioral/population evidence and requires justified model construction, evaluation, sensitivity analysis and careful interpretation of fit.",
        "locator": "Abstract; model construction and empirical grounding; model evaluation and sensitivity analysis sections",
        "accessed": "2026-10-22",
        "limits": "Empirical grounding and validation are design-dependent; abstract/theoretical ABMs must not be represented as population prediction.",
    },
    "src:comses-odd-standards": {
        "title": "CoMSES Net: Agent-Based Model Documentation Standards",
        "url": "https://www.comses.net/resources/standards/",
        "supports": "The ODD protocol documents an agent-based model's overview, design concepts and implementation details to make models understandable and reusable.",
        "locator": "Standards > Documentation Standards > The ODD Protocol",
        "accessed": "2026-10-22",
        "limits": "Documentation guidance, not a guarantee that a model is valid or empirically representative.",
    },
}


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def short_node(node: dict) -> dict:
    keys = (
        "id", "kind", "item_type", "label", "layer", "placement_decision",
        "requirement_lane", "requirement_scope", "sequence_order", "sequence_band",
        "programme_id", "programme_code", "domain_id", "context_level", "context_key",
        "course_code", "course_title", "course_count", "course_anchors", "theme_count",
        "theme_key", "fixed_curriculum", "selectable", "curriculum_source_label",
        "description", "narration", "source_text", "student_facing_explanation",
        "transferable_learning_summary", "matched_outcomes", "matched_course_codes",
        "supporting_evidence", "source_locator", "requirement_level", "requirement_reason",
        "requirement_lane_source", "skippable", "blocking_policy", "runtime_contract_reference",
        "area_id", "role_key", "role_ids", "route_status", "source_ids",
        "evidence_source_ids", "sources", "task_id", "task_family_id",
        "task_wording", "why_task_scope_belongs", "why_this_matters",
        "source_artifacts", "source_records", "authoritative_work_source_ids",
        "explanatory_source_ids", "free_task_specific_learning_source_ids",
        "learner_output", "relationships", "what_it_is", "how_it_is_used",
        "rationale", "requirement_reason",
        "plain_language_meaning", "meaning_in_domain", "limitations",
        "task_output", "complements", "alternatives", "valid_alternatives",
        "meaning", "use_case", "output", "scope", "learning_links",
        "learning_resource_ids", "external_learning_sources", "evidence",
        "category", "category_rationale", "approval", "student_visible",
        "display_readiness", "approval_evidence_sources", "meaning", "condition",
    )
    compact = {key: node[key] for key in keys if key in node}
    locator = compact.get("source_locator")
    if isinstance(locator, dict):
        # Do not copy the full repeated CCMAS course summary onto every outcome.
        compact["source_locator"] = {
            key: locator[key]
            for key in ("sourceFile", "originalPdf", "sourceLocatorText", "courseCode", "courseTitle", "level", "outcomeIndex")
            if key in locator
        }
    return compact


def normalize_slug(value: str) -> str:
    value = value.removeprefix("area-task:").removeprefix("D078:").removeprefix("D078-")
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def main() -> None:
    graph = load_json(BASE_GRAPH_PATH)
    crosswalk = load_json(CROSSWALK_PATH)
    programme_domain_evidence = load_json(PROGRAMME_DOMAIN_EVIDENCE_PATH)
    domain_overview_contract = load_json(DOMAIN_OVERVIEW_CONTRACT_PATH)
    sociology_domain_evidence = programme_domain_evidence["Social Sciences::Sociology::D078"]
    base_nodes = {node["id"]: node for node in graph["nodes"]}
    base_nodes["domain-method:social-network-analysis"] = {
        "id": "domain-method:social-network-analysis",
        "kind": "domain_learning_item",
        "item_type": "method",
        "label": "Social network analysis",
        "layer": "conditional_method_route",
        "plain_language_meaning": "A way to study relationships between people, groups or other social actors by defining who or what counts as a node and which connections count as ties, then analysing the resulting network.",
        "meaning_in_domain": "In D078 it is useful only when relationships themselves are part of the research question. It is not the same as analysing social-media content, and a graph picture alone does not establish a social finding.",
        "limitations": "Requires a defensible network boundary, valid relational data and an explicit definition of each tie. Missing ties, platform access and sampling choices can change the apparent network; network measures do not prove causation or personal importance.",
        "source_ids": ["src:manchester-social-network-analysis", "src:columbia-social-network-analysis"],
        "learning_resource_ids": ["src:networkx-social-analysis-learning"],
        "student_visible": False,
    }
    base_nodes["domain-method:network-analysis"] = {
        "id": "domain-method:network-analysis", "kind": "domain_learning_item", "item_type": "method",
        "label": "Network analysis", "layer": "conditional_method_route",
        "plain_language_meaning": "A family of methods for representing entities as nodes and their relationships as edges, then examining the resulting structure or patterns.",
        "meaning_in_domain": "In D078, network analysis is relevant when relationships among people, organisations, places or digital entities are central to the question. Social network analysis is the social-science-focused branch when the nodes and ties represent social actors and relations.",
        "limitations": "A network representation depends on boundary, node, tie, direction, time-window and missing-data decisions. Metrics describe the supplied graph; they do not establish causality or make a network representative.",
        "source_ids": ["src:networkx-official-tutorial", "src:manchester-social-network-analysis", "src:columbia-social-network-analysis"],
        "student_visible": False,
    }
    base_nodes["domain-knowledge:graph-theory-concepts-for-networks"] = {
        "id": "domain-knowledge:graph-theory-concepts-for-networks", "kind": "domain_learning_item", "item_type": "knowledge",
        "label": "Graph concepts for network data", "layer": "conditional_method_prerequisite",
        "plain_language_meaning": "The basic ideas needed to read a network: nodes are the entities, edges are their recorded links, and choices such as direction or edge weight describe what kind of relationship was captured.",
        "meaning_in_domain": "Learn only the concepts needed to interpret the selected network question and data; graph theory is not a compulsory foundation for all D078 learners.",
        "limitations": "Knowing graph terminology does not establish that the network boundary, data collection, measure or social interpretation is valid.",
        "source_ids": ["src:networkx-official-tutorial", "src:columbia-social-network-analysis"],
        "student_visible": False,
    }
    base_edges = graph["edges"]

    area_nodes = {n["area_id"]: n for n in graph["nodes"] if n.get("kind") == "area_of_specialization"}
    role_nodes = {n["id"]: n for n in graph["nodes"] if n.get("kind") == "role"}
    task_nodes = {n["id"]: n for n in graph["nodes"] if n.get("kind") == "area_task_family"}
    if len(area_nodes) != 7 or len(role_nodes) != 19:
        raise SystemExit(f"Expected 7 canonical areas/19 roles; found {len(area_nodes)}/{len(role_nodes)}")
    if any("computational-and-quantitative-social-research" in str(n).lower() for n in area_nodes.values()):
        raise SystemExit("Retired legacy area leaked into canonical area set")
    for item_id in FOUNDATION_IDS:
        if item_id not in base_nodes:
            raise SystemExit(f"Missing foundation node: {item_id}")

    # Resolve the crosswalk's older task-key namespace to actual graph nodes.
    task_slug_index: dict[tuple[str, str], list[str]] = defaultdict(list)
    for task_id, node in task_nodes.items():
        task_slug_index[(node.get("area_id", ""), normalize_slug(task_id))].append(task_id)
        suffix = normalize_slug(task_id).removeprefix("d078-")
        task_slug_index[(node.get("area_id", ""), suffix)].append(task_id)

    def resolve_task(task_ref: str, area_id: str) -> str | None:
        if task_ref in task_nodes and task_nodes[task_ref].get("area_id") == area_id:
            return task_ref
        slug = normalize_slug(task_ref)
        candidates = [
            task_id for task_id, node in task_nodes.items()
            if node.get("area_id") == area_id
            and (normalize_slug(task_id).endswith(slug) or slug.endswith(normalize_slug(task_id).removeprefix("d078-")))
        ]
        candidates = list(dict.fromkeys(candidates))
        return candidates[0] if len(candidates) == 1 else None

    area_role_edges = [e for e in base_edges if e.get("relationship") == "area_to_role"]
    roles_by_area: dict[str, list[str]] = defaultdict(list)
    for edge in area_role_edges:
        if edge.get("source") in base_nodes and edge.get("target") in role_nodes:
            area_key = base_nodes[edge["source"]].get("area_id")
            roles_by_area[area_key].append(edge["target"])
    for area_key in area_nodes:
        roles_by_area[area_key] = sorted(set(roles_by_area[area_key]))

    # Method routes combine explicit task mappings (primary choices) and all
    # method-specific crosswalk routes (specialist choices), preserving basis.
    method_routes: dict[tuple[str, str], dict] = {}
    for method_id, task_ids in METHOD_TASKS.items():
        if method_id not in base_nodes:
            raise SystemExit(f"Missing method node: {method_id}")
        for task_id in task_ids:
            if task_id not in task_nodes:
                raise SystemExit(f"Hand-authored method route has missing task node: {method_id} -> {task_id}")
            area_id = task_nodes[task_id].get("area_id")
            key = (method_id, area_id)
            method_routes.setdefault(key, {"task_ids": [], "basis": []})
            method_routes[key]["task_ids"].append(task_id)
            method_routes[key]["basis"].append({"kind": "area_task_contract", "task_id": task_id})

    crosswalk_method_aliases = {
        "focus_groups_and_workshops": "domain-item:focus-groups-and-workshops",
        "discourse_and_conversation_analysis": "domain-item:discourse-and-conversation-analysis",
        "case_study_and_comparative_case_design": "domain-item:case-study-and-comparative-case-design",
        "archival_and_historical_research": "domain-item:archival-and-historical-research",
        "participatory_and_action_research": "domain-item:participatory-and-action-research",
        "experiments_quasi_experiments_and_causal_inference": "domain-item:experiments-quasi-experiments-and-causal-inference",
        "programme_evaluation_and_theory_of_change": "domain-item:programme-evaluation-and-theory-of-change",
        "psychometrics_and_scale_construction": "domain-item:psychometrics-and-scale-construction",
        "longitudinal_panel_and_multilevel_data": "domain-item:longitudinal-panel-and-multilevel-data",
        "systematic_and_scoping_evidence_synthesis": "domain-item:systematic-and-scoping-evidence-synthesis",
        "d078-agent-based-modeling": "domain-item:d078-agent-based-modeling",
    }
    for record in crosswalk.get("records", []):
        method_id = crosswalk_method_aliases.get(record.get("domain_item_id", ""))
        if not method_id or method_id not in base_nodes:
            continue
        for area_route in record.get("area_routes", []):
            area_id = area_route.get("area_id")
            if area_id not in area_nodes:
                continue
            for task_ref in area_route.get("task_family_ids", []):
                task_id = resolve_task(task_ref, area_id)
                if not task_id:
                    continue
                key = (method_id, area_id)
                method_routes.setdefault(key, {"task_ids": [], "basis": []})
                method_routes[key]["task_ids"].append(task_id)
                method_routes[key]["basis"].append({
                    "kind": "reviewed_domain_area_crosswalk",
                    "crosswalk_item_id": record.get("domain_item_id"),
                    "route_condition": record.get("route_condition"),
                    "fit": area_route.get("fit"),
                    "task_ref": task_ref,
                    "resolved_task_id": task_id,
                })

    method_routes = {
        key: {"task_ids": sorted(set(value["task_ids"])), "basis": value["basis"]}
        for key, value in method_routes.items()
    }

    # Extract task -> area item/tool edges and role -> role-item edges from the
    # reconciled graph. These are the selected route's actual downstream items.
    items_by_task: dict[str, list[str]] = defaultdict(list)
    domain_items_by_task: dict[str, list[str]] = defaultdict(list)
    tools_by_item: dict[str, list[str]] = defaultdict(list)
    for edge in base_edges:
        if (edge.get("relationship") in {
                    "candidate_domain_item_task_route",
                    "domain_item_supports_area_task",
                }
                and edge.get("source") in base_nodes
                and edge.get("target") in task_nodes):
            domain_items_by_task[edge["target"]].append(edge["source"])
        if edge.get("source") not in task_nodes or edge.get("target") not in base_nodes:
            continue
        if edge.get("relationship") == "task_to_area_item":
            items_by_task[edge["source"]].append(edge["target"])
    for edge in base_edges:
        if (edge.get("source", "").startswith("area_enrichment_item:")
                and edge.get("target", "").startswith("area_tool_option:")
                and edge.get("target") in base_nodes):
            tools_by_item[edge["source"]].append(edge["target"])
    role_items_by_role: dict[str, list[str]] = defaultdict(list)
    for edge in base_edges:
        if edge.get("relationship") == "role_item_candidate_for_role" and edge.get("source") in base_nodes and edge.get("target") in role_nodes:
            role_items_by_role[edge["target"]].append(edge["source"])

    # Additional downstream nodes on a selected method are only connected when
    # an actual graph edge (or area task/tool edge) resolves to a typed node.
    typed_relationships = {
        "precedes", "builds_on", "requires", "prerequisite_for", "complements",
        "works_with", "alternative_to", "alternative_option", "supports", "used_for", "uses",
    }
    method_edges = [
        edge for edge in base_edges
        if edge.get("source") in base_nodes and edge.get("target") in base_nodes
        and edge.get("source") in {m for m, _ in method_routes}
        and edge.get("relationship") in typed_relationships
    ]
    method_downstream_by_method: dict[str, set[str]] = defaultdict(set)
    for edge in method_edges:
        target_id = edge.get("target")
        if target_id in base_nodes and base_nodes[target_id].get("kind") in {
            "domain_learning_item", "domain_emerging_learning_item", "area_enrichment_item",
            "area_learning_item", "area_tool_option",
        }:
            method_downstream_by_method[edge["source"]].add(target_id)

    # Preserve the complete upstream Sociology curriculum and domain layer in
    # the same graph. Programme themes/outcomes are context, not selectable
    # extra learning requirements; domain nodes retain their own requirement
    # lanes and source-backed method/area routes.
    curriculum_kinds = {"programme_context", "programme_theme", "programme_outcome"}
    domain_kinds = {
        "domain_route", "runtime_learning_item", "domain_learning_item",
        "domain_emerging_learning_item", "domain_supplement_candidate",
    }
    selected_node_ids = {
        node_id for node_id, node in base_nodes.items()
        if node.get("kind") in curriculum_kinds | domain_kinds
    }
    selected_node_ids.update(FOUNDATION_IDS)
    selected_node_ids.update(area_nodes[a]["id"] for a in area_nodes)
    selected_node_ids.update(role_nodes)
    selected_node_ids.update(task_nodes)
    selected_node_ids.update(method_id for method_id, _ in method_routes)
    selected_node_ids.add("domain-knowledge:graph-theory-concepts-for-networks")
    for method_id, links in METHOD_DOWNSTREAM_LINKS.items():
        if method_id in base_nodes:
            selected_node_ids.add(method_id)
        selected_node_ids.update(target_id for target_id, _, _ in links if target_id in base_nodes)
    for edge in method_edges:
        selected_node_ids.add(edge["source"])
        selected_node_ids.add(edge["target"])
    for (method_id, area_id), route in method_routes.items():
        for task_id in route["task_ids"]:
            selected_node_ids.update(items_by_task.get(task_id, []))
            selected_node_ids.update(domain_items_by_task.get(task_id, []))
            for item_id in items_by_task.get(task_id, []):
                selected_node_ids.update(tools_by_item.get(item_id, []))
        selected_node_ids.update(roles_by_area.get(area_id, []))
        for role_id in roles_by_area.get(area_id, []):
            selected_node_ids.update(role_items_by_role.get(role_id, []))

    nodes = [short_node(base_nodes[node_id]) for node_id in sorted(selected_node_ids) if node_id in base_nodes]
    node_map = {node["id"]: node for node in nodes}
    edges: list[dict] = []

    def add_edge(source: str, target: str, relationship: str, **kwargs) -> None:
        if source not in node_map or target not in node_map:
            return
        edge_id = f"{relationship}:{source}->{target}"
        if any(e["id"] == edge_id for e in edges):
            return
        edges.append({"id": edge_id, "source": source, "target": target, "relationship": relationship, **kwargs})

    # Keep the curriculum's actual hierarchy and the programme-to-domain
    # evidence links intact. In particular, outcomes remain grouped under the
    # 14 synthesized themes; the themes are not flattened into duplicate lists.
    curriculum_edge_types = {
        "fixed_curriculum_theme_of", "curriculum_outcome_grouped_under_theme",
        "programme_to_domain_context", "programme_theme_connects_to_domain_evidence",
    }
    for edge in base_edges:
        if (edge.get("relationship") in curriculum_edge_types
                and edge.get("source") in node_map and edge.get("target") in node_map):
            metadata = {k: v for k, v in edge.items()
                        if k not in {"id", "source", "target", "relationship"}}
            add_edge(edge["source"], edge["target"], edge["relationship"], **metadata)

    # Carry all runtime domain item dispositions into the graph so the display
    # can distinguish the compulsory spine from optional/useful additions.
    # Runtime rows are joined by their canonical item key; they never imply
    # mastery and the lane source remains auditable.
    def item_key_norm(value: str) -> str:
        return re.sub(r"[^a-z0-9]+", "", str(value).lower().removeprefix("d078"))

    runtime_by_key = {
        item_key_norm(node.get("item_id", "")): node
        for node in base_nodes.values()
        if node.get("kind") == "runtime_learning_item" and node.get("context_level") == "domain"
    }
    domain_items_by_key = {
        item_key_norm(node.get("contract_id") or node["id"].split(":", 1)[-1]): node
        for node in base_nodes.values()
        if node.get("kind") in {"domain_learning_item", "domain_emerging_learning_item", "domain_supplement_candidate"}
    }
    runtime_item_links = []
    for key, runtime_node in runtime_by_key.items():
        canonical_node = domain_items_by_key.get(key)
        if canonical_node and runtime_node["id"] in node_map and canonical_node["id"] in node_map:
            runtime_item_links.append((runtime_node["id"], canonical_node["id"]))
            add_edge(runtime_node["id"], canonical_node["id"], "runtime_contract_resolves_to_learning_item",
                     requirement_level=runtime_node.get("requirement_level"),
                     requirement_lane=runtime_node.get("requirement_lane"),
                     requirement_reason=runtime_node.get("requirement_reason"),
                     blocks_progression=runtime_node.get("blocking_policy") not in {"never", None},
                     selection_means="include in the learner's focused route/report; not proof of knowledge or completion")
    domain_overview_id = "domain:D078"
    programme_id = "programme:social-sciences:sociology"
    domain_orientation = {
        key: value for key, value in domain_overview_contract["orientation"].items()
        if key != "notIndividuallyApprovedInThisContract"
    }
    if domain_overview_id in node_map:
        node_map[domain_overview_id]["overview"] = domain_overview_contract["overview"]
        node_map[domain_overview_id]["overview_evidence"] = domain_overview_contract["overview_evidence"]
        node_map[domain_overview_id]["overview_contract_id"] = domain_overview_contract["schema_version"]
        node_map[domain_overview_id]["student_orientation"] = domain_orientation
        node_map[domain_overview_id]["orientation_evidence_by_field"] = domain_overview_contract["evidence_by_field"]
        node_map[domain_overview_id]["orientation_scope_notes"] = {
            "not_individually_approved_in_this_contract": domain_overview_contract["orientation"].get("notIndividuallyApprovedInThisContract", []),
            "source_policy": "Only field-level claims present in the approved orientation contract are treated as source-backed overview content.",
        }
        node_map[domain_overview_id]["programme_transition"] = (
            "Sociology is a direct programme connection to Social Sciences. The curriculum gives the learner "
            "starting context in social structures, culture and socialisation, human behaviour, and research-method "
            "choices. The domain path carries that context forward, then distinguishes what the programme covers "
            "from additional shared foundations and task-specific learning options. A course connection is not a "
            "claim that every domain task was taught or mastered."
        )
    if programme_id in node_map:
        node_map[programme_id]["sequence_layer"] = "programme_entry"
        node_map[programme_id]["theme_outcome_counts"] = {
            "themes": sum(n.get("kind") == "programme_theme" for n in nodes),
            "outcomes": sum(n.get("kind") == "programme_outcome" for n in nodes),
        }
    direct_programme_domain_edge = next((edge for edge in base_edges
        if edge.get("relationship") == "programme_to_domain_context"
        and edge.get("source") == programme_id and edge.get("target") == domain_overview_id), None)
    theme_domain_edges = [edge for edge in edges if edge.get("relationship") == "programme_theme_connects_to_domain_evidence"]

    # The direct Sociology -> D078 evidence record contains 12 individually
    # resolvable course anchors and 12 individually resolvable outcome excerpts,
    # while its aggregate fields report 19/46. Preserve the resolved evidence,
    # do not inflate it from stale aggregates, and expose this discrepancy only
    # in the audit metadata (never as learner-facing counts).
    outcomes_by_course: dict[str, list[str]] = defaultdict(list)
    for node in base_nodes.values():
        if node.get("kind") == "programme_outcome" and node.get("course_code"):
            outcomes_by_course[node["course_code"]].append(node["id"])
    course_to_themes: dict[str, set[str]] = defaultdict(set)
    outcome_theme_edges = [e for e in base_edges if e.get("relationship") == "curriculum_outcome_grouped_under_theme"]
    themes_by_outcome: dict[str, set[str]] = defaultdict(set)
    for edge in outcome_theme_edges:
        themes_by_outcome[edge["source"]].add(edge["target"])
    theme_anchor_context: dict[str, list[dict]] = defaultdict(list)
    for anchor in sociology_domain_evidence.get("course_anchors", []):
        code = anchor.get("code")
        if not code:
            continue
        theme_ids = sorted({theme_id for outcome_id in outcomes_by_course.get(code, [])
                            for theme_id in themes_by_outcome.get(outcome_id, set())})
        for theme_id in theme_ids:
            theme_anchor_context[theme_id].append({
                "course_code": code,
                "course_title": anchor.get("title"),
                "matched_domain_anchors": anchor.get("matched_anchors", []),
                "interpretation": "Curriculum course-anchor context for the direct Sociology-to-D078 mapping; not a claim that every outcome in the course is a transferable skill.",
            })
    existing_evidence_theme_ids = {edge["source"] for edge in theme_domain_edges}
    for theme_id, anchor_context in sorted(theme_anchor_context.items()):
        if theme_id in existing_evidence_theme_ids or theme_id not in node_map or domain_overview_id not in node_map:
            continue
        add_edge(theme_id, domain_overview_id, "programme_theme_course_anchor_context",
                 status="direct_programme_domain_course_anchor_context",
                 course_anchor_context=anchor_context,
                 explanation="These named Sociology courses also appear as course anchors in the direct programme-to-Social-Sciences evidence. This shows curricular context; the domain adds task-specific learning and does not claim the whole domain is taught by these courses.",
                 blocks_progression=False)

    # Attach the actual outcome excerpts in the Sociology->D078 transferable
    # evidence ledger to their exact curriculum outcome nodes. This preserves
    # all 14 themes and 236 outcomes while identifying the smaller set of
    # outcome-level transfers that the source explicitly supports.
    matched_transfer_outcome_ids: set[str] = set()
    for transfer in sociology_domain_evidence.get("transferable_evidence", []):
        code = str(transfer.get("course_identity", "")).split("::", 1)[0]
        text = normalize_slug(transfer.get("evidence", ""))
        candidates = [base_nodes[oid] for oid in outcomes_by_course.get(code, []) if oid in base_nodes]
        matches = [n for n in candidates
                   if text and (text in normalize_slug(n.get("source_text", ""))
                                or normalize_slug(n.get("source_text", "")) in text)]
        for outcome in matches:
            if outcome["id"] not in node_map or domain_overview_id not in node_map:
                continue
            matched_transfer_outcome_ids.add(outcome["id"])
            add_edge(outcome["id"], domain_overview_id, "programme_outcome_transfers_domain_context",
                     evidence=transfer.get("evidence"),
                     evidence_category=transfer.get("categories", []),
                     course_code=code,
                     interpretation="A source-matched Sociology outcome that provides a starting point for the Social Sciences domain; not proof of mastery or coverage of every downstream task.",
                     evidence_source="programme_domain_evidence_recomputed_2026-10-02.json",
                     blocks_progression=False)

    # The research-method courses explicitly distinguish and justify methods.
    # Carry these curriculum outcomes into the corresponding method choices;
    # this is prior-study context, not a prerequisite or mastery assertion.
    method_outcome_targets = {
        ("SOC 301", 1): ["domain-item:d078-quantitative-approach", "domain-item:d078-qualitative-approach"],
        ("SOC 301", 2): ["domain-item:d078-quantitative-approach", "domain-item:d078-qualitative-approach"],
        ("SOC 301", 4): ["domain-item:d078-quantitative-approach", "domain-item:d078-qualitative-approach"],
        ("SOC 301", 5): ["domain-item:d078-quantitative-approach", "domain-item:d078-qualitative-approach"],
        ("SOC 301", 6): ["domain-item:d078-quantitative-approach", "domain-item:d078-qualitative-approach"],
        ("SOC 301", 7): ["domain-item:d078-mixed-methods", "choice:d078-primary-investigation-approach"],
        ("SOC 301", 8): ["domain-item:d078-responsible-research"],
        ("SSC 302", 4): ["domain-item:d078-experiments-quasi-experiments-and-causal-inference"],
    }

    # Foundation completion is the gate before method choices. The three-item
    # order is pedagogical; no foundation is represented as a prerequisite of
    # another foundation.
    choice_id = "choice:d078-primary-investigation-approach"
    nodes.append({
        "id": choice_id,
        "kind": "method_choice",
        "label": "Choose one method route—or a justified combination",
        "sequence_layer": 4,
        "gate_condition": "The learner completes the three shared D078 foundations first; their within-spine order is recommended, not a claim that one is a technical prerequisite of another.",
    })
    node_map[choice_id] = nodes[-1]
    for order, foundation_id in enumerate(FOUNDATION_IDS, start=1):
        add_edge(foundation_id, choice_id, "foundation_gate", order=order, all_three_required=True,
                 explanation="The shared foundation spine prepares the learner to choose a method using a clear question, evidence limits and audience-aware communication.")
        add_edge(domain_overview_id, foundation_id, "domain_to_compulsory_foundation",
                 sequence_layer=1, recommended_teaching_order=order,
                 requirement_level="needed", skippable=False, blocks_progression=True,
                 explanation="These three shared foundations follow the Sociology-to-Social-Sciences connection and are the only domain-wide progression gate.")

    # Link source-backed curriculum outcomes to the methods they introduce.
    # Outcomes are contextual evidence of prior study, not automatic credit,
    # prerequisite enforcement or a claim that the learner has mastered a method.
    outcomes_by_course_index: dict[tuple[str, int], str] = {}
    for node in base_nodes.values():
        if node.get("kind") != "programme_outcome":
            continue
        try:
            index = int(node["id"].rsplit(":", 1)[-1])
        except (KeyError, ValueError):
            continue
        outcomes_by_course_index[(node.get("course_code", ""), index)] = node["id"]
    for (course_code, index), target_ids in method_outcome_targets.items():
        outcome_id = outcomes_by_course_index.get((course_code, index))
        if not outcome_id or outcome_id not in node_map:
            continue
        for target_id in target_ids:
            if target_id in node_map:
                add_edge(outcome_id, target_id, "programme_outcome_contextualizes_domain_method",
                         course_code=course_code,
                         source_locator=base_nodes[outcome_id].get("source_locator", {}).get("sourceLocatorText"),
                         interpretation="The Sociology curriculum introduces this method distinction or responsibility; this path adds route-specific explanation and options rather than treating the outcome as proof of mastery.",
                         blocks_progression=False)

    # Route nodes make the method -> area -> role transition explicit and carry
    # each area's task families and its own learning/tools beneath the route.
    route_records = []
    role_route_records = []
    method_ids = sorted({method_id for method_id, _ in method_routes})
    for method_id in method_ids:
        add_edge(choice_id, method_id, "method_choice_option", selectable=True,
                 explanation="A selectable route, not a requirement to study every method.")
    for method_id, links in METHOD_DOWNSTREAM_LINKS.items():
        if method_id not in node_map:
            continue
        for target_id, relationship, rationale in links:
            add_edge(method_id, target_id, relationship,
                     requirement_lane="useful_or_conditional", explanation=rationale,
                     source_ids=node_map.get(target_id, {}).get("source_ids", []),
                     blocks_progression=False)
    # These two source-reviewed practices are selectable optional learning
    # items. Their links are explanatory/comparison links, never progression
    # blockers. Keep the area-owned codebook method in its area lane.
    add_edge("domain-item:d078-nvivo-tool", "area_enrichment_item:d078-soc-thematic-analysis", "alternative_to",
             status="resolved_ready_for_use", student_visible=True, sequence_policy="none",
             blocking_policy="never", sequence_approved=True,
             explanation="Manual coding with an auditable codebook is a non-software workflow; NVivo is optional software for managing and retrieving coded material. Choose according to corpus size, collaboration, access and analytic approach.")
    add_edge("domain-item:d078-sensitivity-and-robustness-analysis", "domain-item:d078-quantitative-approach", "builds_on",
             status="resolved_ready_for_use", student_visible=True, sequence_policy="none",
             blocking_policy="never", sequence_approved=True,
             explanation="Use after choosing a quantitative analysis; select plausible alternative assumptions or analytic decisions that could affect the result.")
    add_edge("domain-item:d078-sensitivity-and-robustness-analysis", "domain-item:experiments-quasi-experiments-and-causal-inference", "specialist_extension_of",
             status="resolved_ready_for_use", student_visible=True, sequence_policy="none",
             blocking_policy="never", sequence_approved=True,
             explanation="Sensitivity checks are a useful extension when causal estimates depend on contestable assumptions or analysis choices.")
    add_edge("domain-emerging:d078-experimental-synthetic-respondent-and-llm-agent-testing", "domain-item:d078-sensitivity-and-robustness-analysis", "complements",
             status="resolved_ready_for_use", student_visible=True, sequence_policy="none",
             blocking_policy="never", sequence_approved=True,
             explanation="Documented sensitivity checks can show whether exploratory synthetic-response results change under plausible analytic choices; they do not validate simulated responses as population evidence.")
    add_edge("domain-emerging:d078-experimental-synthetic-respondent-and-llm-agent-testing", "domain-item:d078-scenario-analysis", "alternative_to",
             status="resolved_ready_for_use", student_visible=True, sequence_policy="none",
             blocking_policy="never", sequence_approved=True,
             explanation="Scenario analysis compares plausible futures without generated personas; use it when the question concerns future conditions rather than simulated individual responses.")
    add_edge("domain-item:d078-mesa-tool", "domain-item:d078-netlogo-tool", "alternative_tool_option",
             status="resolved_ready_for_use", student_visible=True, sequence_policy="none",
             blocking_policy="never", sequence_approved=True,
             explanation="Mesa and NetLogo are different agent-based modelling environments. Choose one according to the model, programming workflow and learning goal.")
    add_edge("domain-item:d078-casevo-tool", "domain-item:d078-netlogo-tool", "alternative_tool_option",
             status="resolved_ready_for_use", student_visible=True, sequence_policy="none",
             blocking_policy="never", sequence_approved=True,
             explanation="NetLogo is a general-purpose multi-agent modelling environment; Casevo is a narrower cognitive-agent workflow.")
    add_edge("domain-item:d078-networkx-tool", "domain-item:d078-igraph-tool", "alternative_tool_option",
             status="resolved_ready_for_use", student_visible=True, sequence_policy="none",
             blocking_policy="never", sequence_approved=True,
             explanation="NetworkX and R/igraph can both support network analysis; choose based on data, required measures, language and workflow.")
    add_edge("domain-item:d078-social-network-tool", "domain-item:d078-igraph-tool", "alternative_tool_option",
             status="resolved_ready_for_use", student_visible=True, sequence_policy="none",
             blocking_policy="never", sequence_approved=True,
             explanation="Gephi and R/igraph are distinct network analysis/visualisation workflows. Choose according to the analysis and communication task.")
    # Network concepts are route-specific preparation, not another shared
    # foundation. Social network analysis is the social-actor branch of the
    # broader network-analysis family; software stays attached to that branch.
    network_id = "domain-method:network-analysis"
    sna_id = "domain-method:social-network-analysis"
    graph_knowledge_id = "domain-knowledge:graph-theory-concepts-for-networks"
    networkx_id = "domain-item:d078-networkx-tool"
    gephi_id = "domain-item:d078-social-network-tool"
    if all(node_id in node_map for node_id in (network_id, sna_id, graph_knowledge_id, networkx_id, gephi_id)):
        add_edge(sna_id, network_id, "specialist_extension_of",
                 explanation="Social network analysis applies network-analysis ideas to relationships among social actors.",
                 blocks_progression=False)
        for method_id in (network_id, sna_id):
            add_edge(graph_knowledge_id, method_id, "conditional_conceptual_preparation_for",
                     explanation="Review node, tie, direction and boundary concepts when this selected network route uses them; this is not a D078-wide foundation gate.",
                     blocks_progression=False)
        add_edge(networkx_id, network_id, "tool_for",
                 explanation="NetworkX implements computational graph construction and analysis; it does not decide the social-network design.",
                 blocks_progression=False)
        add_edge(networkx_id, sna_id, "works_with",
                 explanation="Use NetworkX for a code-based social-network workflow when relational data and the research question justify it.",
                 blocks_progression=False)
        add_edge(gephi_id, sna_id, "works_with",
                 explanation="Gephi can support visual exploration after actors, ties, network boundary and data quality are defined.",
                 blocks_progression=False)
    for (method_id, area_id), route in sorted(method_routes.items()):
        area_node_id = area_nodes[area_id]["id"]
        route_node_id = f"method-area-route:{method_id.split(':', 1)[-1]}:{area_id.split(':', 1)[-1]}"
        tasks = route["task_ids"]
        area_items = sorted({item for task_id in tasks for item in items_by_task.get(task_id, [])})
        task_domain_items = sorted({item for task_id in tasks for item in domain_items_by_task.get(task_id, [])})
        area_tools = sorted({tool for item_id in area_items for tool in tools_by_item.get(item_id, [])})
        domain_downstream = sorted(
            method_downstream_by_method.get(method_id, set())
            | {target_id for target_id, _, _ in METHOD_DOWNSTREAM_LINKS.get(method_id, []) if target_id in node_map}
        )
        domain_tools = sorted({item_id for item_id in domain_downstream if "tool" in item_id or node_map[item_id].get("item_type") == "tool"})
        roles = roles_by_area.get(area_id, [])
        role_route_ids = []
        nodes.append({
            "id": route_node_id,
            "kind": "method_to_area_route",
            "label": f"{base_nodes[method_id].get('label', method_id)} → {area_nodes[area_id].get('label', area_id)}",
            "method_id": method_id,
            "area_id": area_id,
            "route_status": "evidence_linked_recommendation_not_exclusion",
            "task_family_ids": tasks,
            "area_item_ids": area_items,
            "task_linked_domain_item_ids": task_domain_items,
            "available_item_ids": sorted(set(area_items + task_domain_items + domain_downstream)),
            "tool_ids": area_tools,
            "domain_downstream_item_ids": domain_downstream,
            "domain_tool_ids": domain_tools,
            "role_ids": roles,
            "role_item_ids": [],
            "role_item_exposure": "Only after the learner selects a role inside the selected area; never flatten all area roles' items into the method or area preview.",
            "role_route_ids": [],
            "basis": route["basis"],
            "student_explanation": "This method is connected to the area's recorded tasks. Selecting it can move this area higher in your recommendations; it does not mean the area or any listed role requires this method.",
        })
        node_map[route_node_id] = nodes[-1]
        add_edge(method_id, route_node_id, "method_supports_area_route", route_basis=route["basis"],
                 recommendation_only=True, blocks_other_areas=False)
        add_edge(route_node_id, area_node_id, "recommends_area", task_family_ids=tasks,
                 order_basis="number_of_evidenced_task_matches; ties remain ties", excludes_area=False)
        for task_id in tasks:
            add_edge(route_node_id, task_id, "method_applies_to_area_task", recommendation_only=True,
                     explanation="The task family is the context for why this method may be useful in the selected area.")
            for item_id in items_by_task.get(task_id, []):
                add_edge(task_id, item_id, "task_has_area_learning_item", requirement_lane=node_map.get(item_id, {}).get("requirement_lane"))
                for tool_id in tools_by_item.get(item_id, []):
                    add_edge(item_id, tool_id, "area_item_has_contextual_tool_option", requirement_lane="optional_or_conditional",
                             explanation="The tool supports this specific area item only when its use case fits; it is not a method prerequisite or proof of competence.")
            for item_id in domain_items_by_task.get(task_id, []):
                add_edge(item_id, task_id, "domain_item_supports_area_task",
                         evidence_basis="existing_reviewed_graph_relationship",
                         requirement_lane=node_map.get(item_id, {}).get("requirement_lane"),
                         blocks_progression=False)
                add_edge(route_node_id, item_id, "method_route_reveals_task_linked_domain_item",
                         evidence_basis="existing_domain_item_to_area_task_relationship",
                         requirement_lane=node_map.get(item_id, {}).get("requirement_lane"),
                         blocks_progression=False)
        for role_id in roles:
            add_edge(area_node_id, role_id, "area_contains_supported_role", route_source="reviewed_D078_area_role_edges",
                     method_specific_fit_claim=False)
            for item_id in role_items_by_role.get(role_id, []):
                add_edge(role_id, item_id, "role_has_downstream_learning_item", route_source="reconciled_role_item_contract")
            role_path_id = f"method-area-role-route:{method_id.split(':', 1)[-1]}:{area_id.split(':', 1)[-1]}:{role_id.split(':')[-1]}"
            role_item_ids = sorted(set(role_items_by_role.get(role_id, [])))
            role_route_ids.append(role_path_id)
            nodes.append({
                "id": role_path_id,
                "kind": "method_area_role_route",
                "label": f"{base_nodes[method_id].get('label', method_id)} → {area_nodes[area_id].get('label', area_id)} → {role_nodes[role_id].get('label', role_id)}",
                "method_id": method_id,
                "area_id": area_id,
                "role_id": role_id,
                "route_status": "role_reached_through_reviewed_area_membership",
                "role_item_ids": role_item_ids,
                "method_specific_role_item_ids": [],
                "role_item_exposure": "Show these role-owned items after this role is selected. No method-specific role-item match is claimed unless separately represented by an explicit evidence-backed edge.",
                "context_explanation": "This role belongs to the selected area. The chosen domain method can inform the learner's route, but it does not by itself prove the role requires that method or that the learner is qualified for the role.",
            })
            node_map[role_path_id] = nodes[-1]
            add_edge(route_node_id, role_path_id, "role_route_option_after_area_choice", role_id=role_id,
                     method_specific_role_fit_claim=False)
            add_edge(role_path_id, role_id, "selected_role_route", route_source="reviewed_D078_area_role_edges")
            for item_id in role_item_ids:
                add_edge(role_path_id, item_id, "selected_role_reveals_role_item", role_owner=role_id)
            role_route_records.append({
                "method_id": method_id, "area_id": area_id, "role_id": role_id,
                "route_node_id": role_path_id, "role_item_ids": role_item_ids,
                "method_specific_role_item_ids": [],
                "method_to_role_fit_claim": "not_inferred_from_area_membership",
            })
        node_map[route_node_id]["role_route_ids"] = role_route_ids
        route_records.append({
            "method_id": method_id,
            "area_id": area_id,
            "route_node_id": route_node_id,
            "task_family_ids": tasks,
            "area_item_ids": area_items,
            "task_linked_domain_item_ids": task_domain_items,
            "available_item_ids": sorted(set(area_items + task_domain_items + domain_downstream)),
            "tool_ids": area_tools,
            "domain_downstream_item_ids": domain_downstream,
            "domain_tool_ids": domain_tools,
            "role_ids": roles,
            "role_item_ids": [],
            "role_route_ids": role_route_ids,
            "recommendation_rank": None,
            "ranking_rule": "At runtime rank areas by selected method-to-area task-match count, then show all seven; rank roles only within a selected area using role-task/item match evidence, never infer role preparation from area membership alone.",
        })

    # Surface verified implementation tools on the method routes that own
    # those choices. These remain skippable route additions.
    route_additions = {
        "domain-item:d078-agent-based-modeling": ["domain-item:d078-netlogo-tool", "domain-item:d078-scenario-analysis"],
        "domain-method:social-network-analysis": ["domain-item:d078-igraph-tool"],
        "domain-method:network-analysis": ["domain-item:d078-igraph-tool"],
    }
    for route in route_records:
        additions = [item_id for item_id in route_additions.get(route["method_id"], []) if item_id in node_map]
        if not additions:
            continue
        for item_id in additions:
            if item_id not in route["domain_downstream_item_ids"]:
                route["domain_downstream_item_ids"].append(item_id)
            if item_id not in route["available_item_ids"]:
                route["available_item_ids"].append(item_id)
            if "tool" in item_id and item_id not in route["domain_tool_ids"]:
                route["domain_tool_ids"].append(item_id)
        route["domain_downstream_item_ids"].sort()
        route["available_item_ids"].sort()
        route["domain_tool_ids"].sort()
        route_node = node_map[route["route_node_id"]]
        for field in ("domain_downstream_item_ids", "available_item_ids", "domain_tool_ids"):
            route_node[field] = list(route[field])

    # Time-series work is a bounded economics application of quantitative
    # analysis, not a universal quantitative requirement. Keep its named area
    # item and EViews option on the Economics branch only.
    economics_timeseries = "area_enrichment_item:d078-econ-time-series-analysis-and-forecasting"
    eviews_tool = "domain-item:d078-eviews-tool"
    economics_route = next((route for route in route_records
                            if route["method_id"] == "domain-item:d078-quantitative-approach"
                            and route["area_id"] == "D078:economics-applied-analysis"), None)
    if economics_route and economics_timeseries in node_map:
        for key in ("area_item_ids", "available_item_ids"):
            economics_route[key] = sorted(set(economics_route[key]) | {economics_timeseries})
        if eviews_tool in node_map:
            economics_route["tool_ids"] = sorted(set(economics_route["tool_ids"]) | {eviews_tool})
        route_node = node_map[economics_route["route_node_id"]]
        for key in ("area_item_ids", "available_item_ids", "tool_ids"):
            route_node[key] = list(economics_route[key])
        add_edge(economics_route["route_node_id"], economics_timeseries, "method_route_reveals_area_specific_useful_item",
                 requirement_lane="useful_or_conditional", blocks_progression=False,
                 explanation="Time-series analysis is surfaced only on the Economics area route where trend and forecasting tasks make it relevant; it is an optional, area-specific application.")
        if eviews_tool in node_map:
            add_edge(economics_timeseries, eviews_tool, "area_item_has_contextual_tool_option",
                     requirement_lane="optional_or_conditional", blocks_progression=False,
                     explanation="EViews is one software option for suitable economic time-series work, not a prerequisite or the only tool.")

    # Preserve only existing typed, item-to-item relationships with resolved
    # endpoints; unresolved prose remains in source artifacts, not fake edges.
    for edge in method_edges:
        add_edge(edge["source"], edge["target"], edge["relationship"],
                 status=edge.get("status"),
                 explanation=edge.get("rationale") or edge.get("explanation"),
                 evidence_source_ids=edge.get("evidence_source_ids") or edge.get("source_refs") or [],
                 blocks_progression=False)

    # Combination nodes connect multiple selected methods to a reasoned design.
    combination_records = []
    for combo in COMBINATIONS:
        missing = [method_id for method_id in combo["method_ids"] if method_id not in node_map]
        if missing:
            # Some methods have no area route in this exact build; they may not
            # be silently promoted into the choice graph.
            continue
        combo_node = {
            "id": combo["id"], "kind": "method_combination_design", "label": combo["label"],
            "design": combo["design"], "why_combine": combo["why"], "how_used": combo["how"],
            "condition": combo["condition"], "limits": combo["limit"],
            "foundation_links": combo["foundation_links"], "source_refs": combo["sources"],
            "selection_rule": "Optional; learner may select this combination only when the research question benefits from the stated integration. It does not make every constituent method compulsory across D078.",
            "method_contributions": [
                {"method_id": method_id,
                 "contribution": COMBINATION_METHOD_CONTRIBUTIONS.get(combo["id"], {}).get(method_id, "Contributes only the evidence and task route stated for this method; no equal weighting is implied.")}
                for method_id in combo.get("required_method_ids", combo["method_ids"])
            ],
            "match_rule": "exact_selected_method_set",
            "ambiguous_match_rule": "learner_selects_the_design_before_downstream_is_projected",
        }
        combo_node["combination_mode"] = combo.get("combination_mode", "fixed_evidence_combination")
        combo_node["required_method_ids"] = combo.get("required_method_ids", combo["method_ids"])
        combo_node["selectable_component_method_ids"] = combo.get("selectable_component_method_ids", [])
        nodes.append(combo_node)
        node_map[combo_node["id"]] = combo_node
        if combo_node["combination_mode"] == "design_frame_with_selectable_methods":
            for method_id in combo_node["required_method_ids"]:
                add_edge(method_id, combo_node["id"], "required_design_frame", design=combo["design"],
                         explanation=combo["why"], condition=combo["condition"])
            for method_id in combo_node["selectable_component_method_ids"]:
                add_edge(combo_node["id"], method_id, "selectable_method_within_design_frame",
                         selectable=True, compulsory=False,
                         explanation="Choose this only when it fits the jointly agreed question and access conditions.")
            combination_records.append({
                "id": combo_node["id"], "design": combo["design"],
                "combination_mode": combo_node["combination_mode"],
                "required_method_ids": combo_node["required_method_ids"],
                "selectable_component_method_ids": combo_node["selectable_component_method_ids"],
                "method_ids": combo["method_ids"], "area_routes": [],
                "method_contributions": combo_node["method_contributions"],
                "match_rule": "required_method_plus_one_or_more_explicitly_selected_components",
                "route_derivation": "At runtime, expose only areas supported by both the required participatory frame and every explicitly selected component method; retain per-method contributions. Do not expose routes for unselected components.",
                "sources": combo["sources"],
            })
            continue
        for method_id in combo["method_ids"]:
            add_edge(method_id, combo_node["id"], "method_part_of_combination", design=combo["design"],
                     explanation=combo["why"], condition=combo["condition"])
        # Fixed designs only route into areas supported by every required
        # component. Within an eligible area, each component retains its own
        # task/item/tool contribution; this is a named design route, not a
        # union of all areas reachable from the methods independently.
        constituent_routes = [r for r in route_records if r["method_id"] in combo["method_ids"]]
        areas_by_method = {
            method_id: {r["area_id"] for r in constituent_routes if r["method_id"] == method_id}
            for method_id in combo["method_ids"]
        }
        areas = sorted(set.intersection(*(areas_by_method[method_id] for method_id in combo["method_ids"])))
        combo_routes = []
        for area_id in areas:
            members_by_method = {
                method_id: next(r for r in constituent_routes if r["method_id"] == method_id and r["area_id"] == area_id)
                for method_id in combo["method_ids"]
            }
            members = list(members_by_method.values())
            task_ids = sorted({task for r in members for task in r["task_family_ids"]})
            roles_by_method = {
                method_id: {r["role_id"] for r in role_route_records
                            if r["method_id"] == method_id and r["area_id"] == area_id}
                for method_id in combo["method_ids"]
            }
            role_ids = sorted(set.intersection(*(roles_by_method[method_id] for method_id in combo["method_ids"])))
            contribution_records = []
            for method_id in combo["method_ids"]:
                route = members_by_method[method_id]
                contribution_records.append({
                    "method_id": method_id,
                    "contribution": COMBINATION_METHOD_CONTRIBUTIONS.get(combo["id"], {}).get(method_id, "Contributes only the evidence and task route stated for this method; no equal weighting is implied."),
                    "task_family_ids": route["task_family_ids"],
                    "area_item_ids": route["area_item_ids"],
                    "task_linked_domain_item_ids": route["task_linked_domain_item_ids"],
                    "available_item_ids": route["available_item_ids"],
                    "tool_ids": route["tool_ids"],
                    "domain_downstream_item_ids": route["domain_downstream_item_ids"],
                    "domain_tool_ids": route["domain_tool_ids"],
                })
            combo_route_id = f"{combo_node['id']}:{area_id.split(':', 1)[-1]}"
            combo_area_node = {
                "id": combo_route_id, "kind": "combination_area_route",
                "label": f"{combo_node['label']} → {area_nodes[area_id].get('label', area_id)}",
                "combination_id": combo_node["id"], "area_id": area_id,
                # Component routes stay separately attributable. Do not flatten
                # all method downstream into a single combined checklist.
                "method_ids": combo["method_ids"], "task_family_ids": [],
                "method_contributions": contribution_records,
                "area_item_ids": [],
                "task_linked_domain_item_ids": [],
                "available_item_ids": [],
                "tool_ids": [],
                "domain_downstream_item_ids": [],
                "domain_tool_ids": [],
                "role_ids": role_ids,
                "role_item_ids": [],
                "role_route_ids": [],
                "route_status": "combined_route_supported_by_every_required_method_in_area",
                "route_basis": "intersection_of_required_method_area_routes_with_component_contributions_preserved",
                "student_explanation": "This area is shown because the graph supports every method in the selected design here. Each method's task, learning items and tools are identified separately; a lead method may contribute more without making the supporting method irrelevant.",
            }
            nodes.append(combo_area_node)
            node_map[combo_route_id] = combo_area_node
            add_edge(combo_node["id"], combo_route_id, "combination_recommends_area_route",
                     recommendation_only=True, blocks_other_areas=False)
            add_edge(combo_route_id, area_nodes[area_id]["id"], "recommends_area",
                     order_basis="exact named design; area supported by all required methods; component task contributions retained")
            for contribution in contribution_records:
                contribution_id = f"{combo_route_id}:method:{contribution['method_id'].split(':')[-1]}"
                contribution_node = {
                    "id": contribution_id,
                    "kind": "combination_method_contribution",
                    "label": f"{node_map.get(contribution['method_id'], {}).get('label', contribution['method_id'])} contribution to {combo_node['label']}",
                    "combination_id": combo_node["id"],
                    "area_id": area_id,
                    **contribution,
                    "student_explanation": contribution["contribution"],
                }
                nodes.append(contribution_node)
                node_map[contribution_id] = contribution_node
                add_edge(combo_route_id, contribution_id, "combination_contains_method_contribution",
                         method_id=contribution["method_id"],
                         contribution_role=contribution["contribution"])
                for task_id in contribution["task_family_ids"]:
                    add_edge(contribution_id, task_id, "method_contribution_applies_to_area_task",
                             method_id=contribution["method_id"])
                    for item_id in items_by_task.get(task_id, []):
                        add_edge(task_id, item_id, "task_has_area_learning_item",
                                 requirement_lane=node_map.get(item_id, {}).get("requirement_lane"))
                        for tool_id in tools_by_item.get(item_id, []):
                            add_edge(item_id, tool_id, "area_item_has_contextual_tool_option",
                                     requirement_lane="optional_or_conditional",
                                     explanation="This tool is an option for the linked area item when its use case fits; it is not a prerequisite.")
                for item_id in sorted(set(contribution["task_linked_domain_item_ids"] + contribution["domain_downstream_item_ids"])):
                    add_edge(contribution_id, item_id, "method_contribution_reveals_domain_item",
                             method_id=contribution["method_id"],
                             requirement_lane=node_map.get(item_id, {}).get("requirement_lane"),
                             blocks_progression=False)
                for tool_id in sorted(set(contribution["tool_ids"] + contribution["domain_tool_ids"])):
                    add_edge(contribution_id, tool_id, "method_contribution_reveals_tool",
                             method_id=contribution["method_id"],
                             requirement_lane="optional_or_conditional", blocks_progression=False)
            combo_role_route_ids = []
            for role_id in role_ids:
                role_path_id = f"{combo_node['id']}:role:{area_id.split(':', 1)[-1]}:{role_id.split(':')[-1]}"
                role_item_ids = sorted(set(role_items_by_role.get(role_id, [])))
                role_route_node = {
                    "id": role_path_id,
                    "kind": "combination_area_role_route",
                    "label": f"{combo_node['label']} -> {area_nodes[area_id].get('label', area_id)} -> {role_nodes[role_id].get('label', role_id)}",
                    "combination_id": combo_node["id"],
                    "area_id": area_id,
                    "role_id": role_id,
                    "method_ids": combo["method_ids"],
                    "role_item_ids": role_item_ids,
                    "method_specific_role_item_ids": [],
                    "context_explanation": "This role is reached through its reviewed area link. The combined methods are a possible learning design, not a claim that the role requires every method or that the learner is job-ready.",
                }
                nodes.append(role_route_node)
                node_map[role_path_id] = role_route_node
                combo_role_route_ids.append(role_path_id)
                add_edge(combo_route_id, role_path_id, "role_route_option_after_area_choice",
                         role_id=role_id, method_specific_role_fit_claim=False)
                add_edge(role_path_id, role_id, "selected_role_route",
                         route_source="reviewed_D078_area_role_edges")
                for item_id in role_item_ids:
                    add_edge(role_path_id, item_id, "selected_role_reveals_role_item",
                             role_owner=role_id)
            combo_area_node["role_route_ids"] = combo_role_route_ids
            combo_routes.append({"area_id": area_id, "route_node_id": combo_route_id,
                                 "task_family_ids": [], "role_ids": role_ids,
                                 "method_contributions": contribution_records,
                                 "route_basis": "intersection_of_required_method_area_routes_with_component_contributions_preserved",
                                 "role_route_ids": combo_role_route_ids,
                                 "role_item_ids_exposed_only_after_role_selection": True})
        combination_records.append({
            "id": combo_node["id"], "design": combo["design"], "method_ids": combo["method_ids"],
            "combination_mode": combo_node["combination_mode"],
            "required_method_ids": combo_node["required_method_ids"],
            "selectable_component_method_ids": combo_node["selectable_component_method_ids"],
            "foundation_links": combo_node["foundation_links"],
            "method_contributions": combo_node["method_contributions"],
            "match_rule": "exact_selected_method_set",
            "ambiguous_match_rule": "learner_selects_the_design_before_downstream_is_projected",
            "route_derivation": "Only areas with evidenced routes for every required component are included. Task/item/tool contributions remain attributable to each method. Roles are limited to reviewed area roles reached through the eligible combined area route.",
            "area_routes": combo_routes, "sources": combo["sources"],
        })

    # Pairwise method relationships must resolve to real method nodes. These
    # are context annotations only, not automatic co-selection or sequence.
    alias_map = {
        "quantitative-approach": "domain-item:d078-quantitative-approach",
        "qualitative-approach": "domain-item:d078-qualitative-approach",
        "mixed-methods": "domain-item:d078-mixed-methods",
        "survey": "domain-item:d078-survey-method",
        "interviews": "domain-item:d078-interviews",
        "focus-groups-and-workshops": "domain-item:focus-groups-and-workshops",
        "document-analysis": "domain-item:d078-document-analysis",
        "observation-ethnography": "domain-item:d078-observation-ethnography",
        "social-network-analysis": "domain-method:social-network-analysis",
        "network-analysis": "domain-method:network-analysis",
        "graph-theory-concepts-for-networks": "domain-knowledge:graph-theory-concepts-for-networks",
        "research-question-design": FOUNDATION_IDS[0],
        "computational-social-research": "domain-item:d078-computational-social-research",
        "spatial-social-analysis": "domain-item:d078-spatial-social-analysis",
        "quantitative-and-qualitative-approaches": [
            "domain-item:d078-quantitative-approach", "domain-item:d078-qualitative-approach",
        ],
        "interviews-observation-or-existing-data": [
            "domain-item:d078-interviews", "domain-item:d078-observation-ethnography", "domain-item:d078-secondary-data",
        ],
        "interview-survey-or-observation": [
            "domain-item:d078-interviews", "domain-item:d078-survey-method", "domain-item:d078-observation-ethnography",
        ],
        "survey-or-interview": ["domain-item:d078-survey-method", "domain-item:d078-interviews"],
        "observational-survey-interview-or-statistical-approaches": [
            "domain-item:d078-observation-ethnography", "domain-item:d078-survey-method",
            "domain-item:d078-interviews", "domain-item:d078-quantitative-approach",
        ],
        "non-computational-qualitative-survey-and-secondary-data-routes": [
            "domain-item:d078-qualitative-approach", "domain-item:d078-survey-method", "domain-item:d078-secondary-data",
        ],
    }
    for edge in base_edges:
        if edge.get("relationship") not in {"works_with", "alternative_to", "complements", "builds_on"}:
            continue
        source = edge.get("source")
        target = edge.get("target")
        if source not in node_map or target in node_map:
            continue
        target_slug = str(target).split(":", 2)[-1]
        resolved_ids = alias_map.get(target_slug)
        if resolved_ids and isinstance(resolved_ids, str):
            resolved_ids = [resolved_ids]
        if not resolved_ids:
            continue
        for resolved in resolved_ids:
            if resolved in node_map:
                add_edge(source, resolved, edge["relationship"],
                         status=edge.get("status"), explanation=edge.get("rationale") or edge.get("explanation"),
                         resolved_from_relationship_target=target,
                         evidence_source_ids=edge.get("evidence_source_ids") or edge.get("source_refs") or [],
                         blocks_progression=False)

    # The 22-method selector must classify every unordered pair explicitly.
    # This is a conservative route contract, not a claim that unlisted pairs
    # can never be combined in research generally.
    method_pair_dispositions = []
    for left, right in choose_combinations(method_ids, 2):
        selected = {left, right}
        exact_design_ids = []
        partial_design_ids = []
        for design in combination_records:
            if design.get("combination_mode") == "design_frame_with_selectable_methods":
                allowed = set(design.get("required_method_ids", [])) | set(design.get("selectable_component_method_ids", []))
                if design.get("required_method_ids") and set(design["required_method_ids"]).issubset(selected) and selected.issubset(allowed):
                    exact_design_ids.append(design["id"])
                elif selected.issubset(allowed) and not set(design.get("required_method_ids", [])).issubset(selected):
                    partial_design_ids.append(design["id"])
                continue
            required = set(design.get("required_method_ids", []))
            if selected == required:
                exact_design_ids.append(design["id"])
            elif selected < required:
                partial_design_ids.append(design["id"])
        disposition = (
            "choose_among_exact_named_designs" if len(exact_design_ids) > 1 else
            "exact_named_design" if exact_design_ids else
            "partial_named_design_no_downstream" if partial_design_ids else
            "no_reviewed_combined_route"
        )
        method_pair_dispositions.append({
            "method_ids": [left, right],
            "disposition": disposition,
            "exact_design_ids": sorted(exact_design_ids),
            "partial_design_ids": sorted(partial_design_ids),
            "downstream_policy": "design_route_only_after_exact_design_selection" if exact_design_ids else "none_until_a_supported_design_is_completed",
        })

    layer2_useful_ids = [
        "runtime-item:domain:d078:d078-society-and-social-world-knowledge",
        "domain-item:reference-and-literature-management",
        "domain-item:d078-secondary-data",
        "domain-item:sampling-recruitment-and-representativeness",
        "domain-item:measurement-and-operationalisation",
        "domain-item:reliability-validity-and-uncertainty",
    ]
    layer3_preparation_ids = [
        "domain-item:d078-responsible-research",
        "domain-item:d078-care-for-research-data",
        "domain-item:open-science-preregistration-and-reproducibility",
        "domain-item:ai-assisted-and-digital-trace-research-ethics",
    ]
    layer_item_ids = set(layer2_useful_ids + layer3_preparation_ids)
    layer_route_evidence: dict[str, list[dict[str, object]]] = {item_id: [] for item_id in layer_item_ids}
    for route in route_records:
        # Use explicit, item-level route fields. `available_item_ids` is an
        # aggregate convenience field and is intentionally not sufficient to
        # establish that a non-universal Layer 2/3 item fits a method.
        explicit_route_items = {
            "task_linked_domain_item_ids": set(route.get("task_linked_domain_item_ids", [])),
            "domain_downstream_item_ids": set(route.get("domain_downstream_item_ids", [])),
            "domain_tool_ids": set(route.get("domain_tool_ids", [])),
        }
        for item_id in layer_item_ids:
            matching_fields = sorted(field for field, ids in explicit_route_items.items() if item_id in ids)
            if not matching_fields:
                continue
            layer_route_evidence[item_id].append({
                "method_id": route["method_id"],
                "area_id": route["area_id"],
                "route_node_id": route["route_node_id"],
                "task_family_ids": route.get("task_family_ids", []),
                "evidence_basis": "explicit_item_membership_in_source_backed_method_area_route",
                "matched_route_fields": matching_fields,
            })

    layer_applicability = {
        item_id: sorted({str(row["method_id"]) for row in evidence_rows})
        for item_id, evidence_rows in layer_route_evidence.items()
    }
    layer2_applicability = {item_id: layer_applicability[item_id] for item_id in layer2_useful_ids}
    layer3_applicability = {item_id: layer_applicability[item_id] for item_id in layer3_preparation_ids}
    layer2_route_evidence = {item_id: layer_route_evidence[item_id] for item_id in layer2_useful_ids}
    layer3_route_evidence = {item_id: layer_route_evidence[item_id] for item_id in layer3_preparation_ids}

    # A named design gets its own layer-item applicability projection. This is
    # deliberately derived from the design's component contribution rows, not
    # by unioning each method's independent downstream. External cross-cutting
    # conditions can follow an explicitly participating method, but remain
    # attached to that component and its condition.
    combination_layer_applicability: dict[str, dict[str, list[dict[str, object]]]] = {
        item_id: {} for item_id in layer_item_ids
    }
    for design in combination_records:
        design_id = str(design["id"])
        per_item: dict[str, dict[str, dict[str, object]]] = {item_id: {} for item_id in layer_item_ids}
        design_routes = design.get("area_routes", []) or []
        for area_route in design_routes:
            for contribution in area_route.get("method_contributions", []) or []:
                method_id = str(contribution.get("method_id", ""))
                contribution_item_ids = set(
                    contribution.get("task_linked_domain_item_ids", [])
                    + contribution.get("domain_downstream_item_ids", [])
                )
                for item_id in layer_item_ids.intersection(contribution_item_ids):
                    per_item[item_id][method_id] = {
                        "method_id": method_id,
                        "evidence_basis": "item_present_in_named_design_component_contribution",
                        "area_id": area_route.get("area_id"),
                    }

        required_methods = set(design.get("required_method_ids", []))
        selectable_methods = set(design.get("selectable_component_method_ids", []))
        if not design_routes and design.get("combination_mode") == "design_frame_with_selectable_methods":
            # The participatory frame has no fixed area_routes. Its selected
            # components define the route, so retain explicit item links only
            # for methods the frame actually permits; runtime further limits
            # these to the required method plus components the learner chose.
            for item_id, evidence_rows in layer_route_evidence.items():
                for evidence in evidence_rows:
                    method_id = str(evidence.get("method_id", ""))
                    if method_id not in required_methods | selectable_methods:
                        continue
                    if evidence.get("evidence_basis") != "explicit_item_membership_in_source_backed_method_area_route":
                        continue
                    per_item[item_id][method_id] = {
                        "method_id": method_id,
                        "evidence_basis": "explicit_item_membership_in_selected_design_component",
                        "area_id": evidence.get("area_id"),
                        "task_family_ids": evidence.get("task_family_ids", []),
                    }
        for item_id, evidence_rows in layer_route_evidence.items():
            for evidence in evidence_rows:
                method_id = str(evidence.get("method_id", ""))
                if evidence.get("evidence_basis") != "externally_supported_conditional_method_fit":
                    continue
                if method_id not in required_methods | selectable_methods:
                    continue
                per_item[item_id][method_id] = {
                    "method_id": method_id,
                    "evidence_basis": "conditional_evidence_for_named_design_component",
                    "condition": evidence.get("condition"),
                    "rationale": evidence.get("rationale"),
                    "external_source_ids": evidence.get("external_source_ids", []),
                }

        for item_id, method_rows in per_item.items():
            if method_rows:
                combination_layer_applicability[item_id][design_id] = [
                    method_rows[key] for key in sorted(method_rows)
                ]

    # Carry the programme's actual methods-course context into method cards.
    # These are scoped course references, not claims that the programme
    # provides advanced mastery of each downstream technique.
    programme_method_context = {
        "domain-item:d078-quantitative-approach": {
            "coverage": "partial_curriculum_grounding",
            "course_refs": [{"course_code": "SOC 301", "course_title": "Methods of Social Research and Statistics", "source_locator": "Original CCMAS source: Sociology; SOC 301; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed pp. 334-335", "evidence": "The course distinguishes quantitative and qualitative methods and surveys research designs; it does not specify advanced statistical mastery."}, {"course_code": "SSC 401", "course_title": "Research Method II", "source_locator": "Original CCMAS source: Sociology; SSC 401; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed p. 337", "outcome_id": "programme-outcome:sociology:SSC 401:4", "evidence": "The outcome says to apply appropriate statistics in data analysis; the available Sociology course detail does not name every test."}],
            "student_note": "Your Sociology curriculum introduces quantitative research and expects you to apply appropriate statistics. This route builds on that base with a more focused method and its choices; it does not assume you have already mastered every test or software tool.",
        },
        "domain-item:d078-qualitative-approach": {
            "coverage": "partial_curriculum_grounding",
            "course_refs": [{"course_code": "SOC 301", "course_title": "Methods of Social Research and Statistics", "source_locator": "Original CCMAS source: Sociology; SOC 301; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed pp. 334-335", "outcome_id": "programme-outcome:sociology:SOC 301:5", "evidence": "The outcome distinguishes quantitative and qualitative methods; the course content names focus groups, in-depth interviews, ethnographic work and case studies."}, {"course_code": "SSC 302", "course_title": "Research Method I", "source_locator": "Original CCMAS source: Sociology; SSC 302; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed p. 334", "evidence": "The course content covers literature review, ethnography, sampling, data-collection methods and instruments."}],
            "student_note": "Your Sociology curriculum introduces qualitative approaches and names examples such as interviews, focus groups, ethnographic work and case studies. The selected route gives a more specific explanation of the chosen approach and its use; it does not claim that every technique was taught in depth.",
        },
        "domain-item:d078-mixed-methods": {
            "coverage": "related_curriculum_context_not_named_design_mastery",
            "course_refs": [{"course_code": "SOC 301", "course_title": "Methods of Social Research and Statistics", "source_locator": "Original CCMAS source: Sociology; SOC 301; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed pp. 334-335", "outcome_id": "programme-outcome:sociology:SOC 301:7", "evidence": "The outcome discusses justifying use of one, some or all methods; the course does not specify the named integration sequence of each mixed-methods design."}],
            "student_note": "Your curriculum introduces choosing and justifying research methods. A named combined design goes further: it explains exactly how methods are ordered and integrated for a particular question. Selecting more than one method does not mean the curriculum or app treats every combination as the same design.",
        },
        "domain-item:d078-survey-method": {
            "coverage": "partial_curriculum_grounding",
            "course_refs": [{"course_code": "SOC 301", "course_title": "Methods of Social Research and Statistics", "source_locator": "Original CCMAS source: Sociology; SOC 301; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed pp. 334-335", "evidence": "The course content names the survey method and discusses selecting a design for a research problem."}],
            "student_note": "Your curriculum names the survey method. This route develops the selected survey work in more detail; it does not assume prior mastery of questionnaire design, sampling or analysis tools.",
        },
        "domain-item:d078-interviews": {
            "coverage": "partial_curriculum_grounding",
            "course_refs": [{"course_code": "SOC 301", "course_title": "Methods of Social Research and Statistics", "source_locator": "Original CCMAS source: Sociology; SOC 301; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed pp. 334-335", "evidence": "The course content names in-depth interviews among qualitative approaches."}],
            "student_note": "Your curriculum introduces in-depth interviews as a qualitative approach. This route explains how to plan and use interviews for a particular research question.",
        },
        "domain-item:focus-groups-and-workshops": {
            "coverage": "partial_curriculum_grounding",
            "course_refs": [{"course_code": "SOC 301", "course_title": "Methods of Social Research and Statistics", "source_locator": "Original CCMAS source: Sociology; SOC 301; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed pp. 334-335", "evidence": "The course content names focus-group discussion among qualitative approaches."}],
            "student_note": "Your curriculum introduces focus-group discussion. This route explains how a facilitated group produces evidence, and what group discussion can and cannot tell you.",
        },
        "domain-item:d078-observation-ethnography": {
            "coverage": "partial_curriculum_grounding",
            "course_refs": [{"course_code": "SOC 301", "course_title": "Methods of Social Research and Statistics", "source_locator": "Original CCMAS source: Sociology; SOC 301; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed pp. 334-335", "evidence": "The course content names ethnographic approaches."}, {"course_code": "SSC 302", "course_title": "Research Method I", "source_locator": "Original CCMAS source: Sociology; SSC 302; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed p. 334", "evidence": "The course content names ethnography of the study area."}, {"course_code": "PSY 204", "course_title": "Introduction to Social Psychology", "source_locator": "Original CCMAS source: Sociology; PSY 204; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed p. 330", "evidence": "The course content names observation as a research method."}],
            "student_note": "Your curriculum introduces ethnographic and observational approaches. This route adds the practical choices for recording and interpreting what happens in a setting; it does not assume that observation is suitable for every question.",
        },
        "domain-item:case-study-and-comparative-case-design": {
            "coverage": "partial_curriculum_grounding",
            "course_refs": [{"course_code": "SOC 301", "course_title": "Methods of Social Research and Statistics", "source_locator": "Original CCMAS source: Sociology; SOC 301; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed pp. 334-335", "evidence": "The course content names case study among qualitative approaches."}],
            "student_note": "Your curriculum introduces case study as a research approach. This route explains how to bound a case and choose evidence sources without treating a case as automatically representative.",
        },
    }

    for method_id, context in programme_method_context.items():
        if method_id not in node_map:
            raise ValueError(f"Programme-method context points to a missing method node: {method_id}")
        missing_outcomes = [ref["outcome_id"] for ref in context["course_refs"] if ref.get("outcome_id") and ref["outcome_id"] not in node_map]
        if missing_outcomes:
            raise ValueError(f"Programme-method context points to missing outcomes: {missing_outcomes}")
        node_map[method_id]["programme_learning_context"] = context
    # Keep every candidate × method pairing visible to the audit. Absence of
    # a route edge is not a negative fit decision: it remains unresolved until
    # the local evidence and authoritative external-source search are complete.
    orientation_item_id = "runtime-item:domain:d078:d078-society-and-social-world-knowledge"
    conditional_item_rules = {
        "domain-item:d078-care-for-research-data": {
            "condition": "Show as a selectable preparation option when this route's project creates, collects, receives, analyses, stores, preserves or shares research data.",
            "source_ids": ["src:ukri-research-data-policy-2026"],
            "rationale": "The policy defines research data across collection, observation and reuse through any method; the condition is project data handling, not the method label alone.",
        },
        "domain-item:d078-responsible-research": {
            "condition": "Show when the selected route's project involves participants, identifiable or sensitive information, potential harm, restricted records, data linkage or consent/access decisions.",
            "source_ids": ["src:esrc-ethics-principles"],
            "rationale": "Ethics is considered across the project lifecycle, while the specific duty depends on participants, data and project risk; this is not a universal extra method prerequisite.",
        },
        "domain-item:d078-secondary-data": {
            "condition": "Show when the selected design uses existing datasets, archives, documents or records, or combines existing evidence with new collection.",
            "source_ids": ["src:uk-data-service-secondary-analysis", "src:uk-data-service-qualitative-reuse"],
            "rationale": "Existing qualitative and quantitative material can be analysed for new questions or combined with newly collected evidence when access, context and fit are adequate.",
        },
    }
    abm_item_rules = {
        "domain-item:reference-and-literature-management": "Use when the model's mechanisms, agent rules or parameter choices are grounded in prior theory, studies or empirical sources; document which claims each source supports.",
        "domain-item:d078-secondary-data": "Use when empirical population, behaviour or outcome data are reused to construct, calibrate or compare the model; an abstract theoretical model may not need this route.",
        "domain-item:sampling-recruitment-and-representativeness": "Use when agents are intended to represent a real population or sampled cases; state the population, coverage and limits. Do not apply this as a requirement to abstract models without population-representation claims.",
        "domain-item:measurement-and-operationalisation": "Use to translate social concepts and observed behaviours into explicit agent attributes, rules, parameters or measurable outputs; distinguish observed evidence from assumptions.",
        "domain-item:reliability-validity-and-uncertainty": "Use to check implementation against the design, examine sensitivity to assumptions/parameters and assess whether conclusions are supported; validation is purpose-dependent and does not prove the model is true.",
        "domain-item:open-science-preregistration-and-reproducibility": "Use to document the model specification, code/version, parameters, data inputs and run settings so the analysis can be inspected or repeated.",
    }
    # Add externally justified conditional route evidence to the same field
    # consumed by the UI. It is still optional and trigger-bound, not a hidden
    # fourth foundation. The domain orientation node is deliberately excluded.
    for item_id, rule in conditional_item_rules.items():
        for method_id in method_ids:
            layer_route_evidence[item_id].append({
                "method_id": method_id,
                "route_node_id": method_id,
                "evidence_basis": "externally_supported_conditional_method_fit",
                "external_source_ids": rule["source_ids"],
                "condition": rule["condition"],
                "rationale": rule["rationale"],
            })
    abm_method_id = "domain-item:d078-agent-based-modeling"
    for item_id, condition in abm_item_rules.items():
        layer_route_evidence[item_id].append({
            "method_id": abm_method_id,
            "route_node_id": abm_method_id,
            "evidence_basis": "externally_supported_conditional_method_fit",
            "external_source_ids": ["src:comses-odd-standards"] if item_id == "domain-item:open-science-preregistration-and-reproducibility" else ["src:abm-empirical-social-research"],
            "condition": condition,
            "rationale": "Agent-based modelling has documented model-specification, empirical-grounding, evaluation and reproducibility practices; apply this item only for the stated model use case.",
        })
    layer_applicability = {
        item_id: sorted({str(row["method_id"]) for row in evidence_rows})
        for item_id, evidence_rows in layer_route_evidence.items()
    }
    layer2_applicability = {item_id: layer_applicability[item_id] for item_id in layer2_useful_ids}
    layer3_applicability = {item_id: layer_applicability[item_id] for item_id in layer3_preparation_ids}
    layer2_route_evidence = {item_id: layer_route_evidence[item_id] for item_id in layer2_useful_ids}
    layer3_route_evidence = {item_id: layer_route_evidence[item_id] for item_id in layer3_preparation_ids}
    method_item_fit_dispositions = []
    for item_id in sorted(layer_item_ids):
        evidence_by_method: dict[str, list[dict[str, object]]] = {}
        for evidence in layer_route_evidence[item_id]:
            evidence_by_method.setdefault(str(evidence["method_id"]), []).append(evidence)
        for method_id in method_ids:
            evidence_rows = evidence_by_method.get(method_id, [])
            external_rule = conditional_item_rules.get(item_id)
            if item_id == orientation_item_id:
                disposition = "domain_orientation_context_not_method_item"
                external_sources = []
                condition = "This explains the social world studied by the domain; display it in domain orientation, not as a method-specific learning choice."
                rationale = "Its graph contract identifies it as contextual orientation rather than a selectable method gate."
            elif method_id == abm_method_id and item_id in abm_item_rules:
                is_reproducibility = item_id == "domain-item:open-science-preregistration-and-reproducibility"
                disposition = "externally_supported_conditional_fit"
                external_sources = ["src:comses-odd-standards"] if is_reproducibility else ["src:abm-empirical-social-research"]
                if item_id == "domain-item:reference-and-literature-management":
                    external_sources = ["src:abm-empirical-social-research", "src:comses-odd-standards"]
                condition = abm_item_rules[item_id]
                rationale = "Agent-based modelling is a computational research approach; this specific item supports model specification or evidence-grounded construction only under the stated use condition."
            elif external_rule:
                disposition = "externally_supported_conditional_fit"
                external_sources = external_rule["source_ids"]
                condition = external_rule["condition"]
                rationale = external_rule["rationale"]
            elif evidence_rows:
                disposition = "local_route_evidence_found"
                external_sources = []
                condition = None
                rationale = "Explicit item membership is present in a source-backed method-area route."
            else:
                disposition = "unresolved_search_required"
                external_sources = []
                condition = None
                rationale = "No sufficiently specific local route edge or recorded external source supports a fit decision yet."
            method_item_fit_dispositions.append({
                "item_id": item_id,
                "method_id": method_id,
                "disposition": disposition,
                "local_evidence": evidence_rows,
                "condition": condition,
                "rationale": rationale,
                "external_search_status": "recorded" if external_sources else ("not_required_for_explicit_local_route_link" if evidence_rows else "required_before_no_supported_fit"),
                "external_sources": external_sources,
                "no_fit_allowed": False,
            })

    payload = {
        "schema_version": "2026-10-22.d078-method-area-role-route-graph.v6",
        "status": "integrated_programme_to_domain_to_method_area_role_route_graph_for_design_review",
        "student_visible": False,
        "programme_transition": {
            "programme_id": programme_id,
            "domain_id": domain_overview_id,
            "programme_theme_ids": sorted(n["id"] for n in nodes if n.get("kind") == "programme_theme"),
            "programme_outcome_ids": sorted(n["id"] for n in nodes if n.get("kind") == "programme_outcome"),
            "theme_count": sum(n.get("kind") == "programme_theme" for n in nodes),
            "outcome_count": sum(n.get("kind") == "programme_outcome" for n in nodes),
            "course_anchor_theme_context": {
                theme_id: sorted({anchor["course_code"] for anchor in anchors})
                for theme_id, anchors in sorted(theme_anchor_context.items())
            },
            "evidence_matched_theme_ids": sorted(existing_evidence_theme_ids),
            "matched_transfer_outcome_ids": sorted(matched_transfer_outcome_ids),
            "transfer_summary": (direct_programme_domain_edge or {}).get("student_facing_explanation"),
            "transferable_learning_summary": (direct_programme_domain_edge or {}).get("transferable_learning_summary"),
            "resolved_course_anchor_count": len(sociology_domain_evidence.get("course_anchors", [])),
            "resolved_transferable_evidence_record_count": len(sociology_domain_evidence.get("transferable_evidence", [])),
            "aggregate_count_audit": {
                "reported_course_anchor_count": sociology_domain_evidence.get("course_anchor_count"),
                "resolved_course_anchor_rows": len(sociology_domain_evidence.get("course_anchors", [])),
                "reported_transferable_evidence_count": sociology_domain_evidence.get("transferable_evidence_count"),
                "resolved_transferable_evidence_rows": len(sociology_domain_evidence.get("transferable_evidence", [])),
                "learner_display_policy": "Do not display aggregate counts; use only individually resolved course/outcome evidence and its explanation.",
            },
            "domain_overview": domain_overview_contract["overview"],
            "transition_policy": "Show all programme themes and their outcomes together at the programme level. At the domain transition, carry only explicit, source-matched course/outcome context as prior learning; distinguish it from the additional domain foundations and optional route learning. Curriculum connections are not claims of mastery.",
        },
        "domain_overview_contract": {
            "contract_id": domain_overview_contract["schema_version"],
            "domain_node_id": domain_overview_id,
            "orientation_fields": sorted(domain_orientation.keys()),
            "evidence_fields": sorted(domain_overview_contract["evidence_by_field"].keys()),
            "fields_not_individually_approved": domain_overview_contract["orientation"].get("notIndividuallyApprovedInThisContract", []),
            "seed_policy": domain_overview_contract["seed_policy"],
        },
        "programme_method_context": programme_method_context,
        "domain_learning_layers": [
            {"layer": 0, "sequence_order": 0, "name": "Domain orientation", "node_id": domain_overview_id,
             "purpose": "Explain what Social Sciences & Behavioural Research studies and how the selected Sociology programme connects to it."},
            {"layer": 1, "sequence_order": 1, "name": "Compulsory domain foundations", "item_ids": FOUNDATION_IDS,
             "purpose": "The three needed foundations are the only domain-wide progression gate."},
            {"layer": 2, "sequence_order": 3, "name": "Field-wide knowledge and useful learning", "lane": "useful",
             "item_ids": layer2_useful_ids, "route_applicability_by_item": layer2_applicability,
             "route_evidence_by_item": layer2_route_evidence,
             "route_applicability_by_combination": {item_id: combination_layer_applicability[item_id] for item_id in layer2_useful_ids},
             "display_after": "method_or_exact_design_selection",
             "display_position": "after_method_choice_before_selected_route_downstream",
             "display_rule": "Do not show this layer or its item list before a method is selected. After a single method or exact named design is selected, show only items with reviewed local or external evidence linking that method or design contribution to the stated item condition. Keep the items in their own layer grouping and never display the whole layer as a universal checklist.",
             "route_context_after_selection": "show_only_selected_method_route_matches_without_repeating_items_elsewhere",
             "special_display": {"runtime-item:domain:d078:d078-society-and-social-world-knowledge": "domain_orientation_context_not_a_method_gate"},
             "purpose": "This optional field-wide knowledge and skills layer is available only in the context of a selected method or named design. Its layer number records its learning category, not a universal prerequisite or a visible pre-method step."},
            {"layer": 3, "sequence_order": 4, "name": "Research practices and conditional preparation", "lanes": ["optional", "conditional", "needed_when_condition_applies"],
             "item_ids": layer3_preparation_ids, "route_applicability_by_item": layer3_applicability,
             "route_evidence_by_item": layer3_route_evidence,
             "route_applicability_by_combination": {item_id: combination_layer_applicability[item_id] for item_id in layer3_preparation_ids},
             "display_after": "method_or_exact_design_selection",
             "display_position": "after_method_choice_before_selected_route_downstream",
             "display_rule": "Do not show this layer or its item list before a method is selected. After a single method or exact named design is selected, show a practice only when reviewed evidence links it to that method or exact design contribution and its stated project condition is relevant; preserve its condition and skippable lane.",
             "route_context_after_selection": "show_only_selected_method_route_matches_without_repeating_items_elsewhere",
             "purpose": "This conditional research-practice layer is available only in the context of a selected method or named design. Its items never become universal progression blocks."},
            {"layer": 4, "sequence_order": 2, "name": "Methods of investigation/research", "node_id": choice_id,
             "purpose": "After the compulsory foundations, choose one method. Only then reveal the supported Layer 2/3 preparation and downstream route. A multi-method choice must resolve to a named, evidence-backed design before combined downstream is shown."},
        ],
        "method_item_fit_audit": {
            "candidate_item_count": len(layer_item_ids),
            "method_count": len(method_ids),
            "pair_count": len(method_item_fit_dispositions),
            "rule": "A missing local route edge is unresolved, never a non-fit. Mark no_supported_fit only after reviewing the complete local inventory and recording an exhaustive authoritative external-source search with URL, locator, access date, and relevance rationale. Conditional fits preserve their trigger and do not become compulsory method prerequisites.",
            "dispositions": method_item_fit_dispositions,
        },
        "canonical_area_count": len(area_nodes),
        "supported_role_count": len(role_nodes),
        "foundation_item_ids": FOUNDATION_IDS,
        "method_choice_node_id": choice_id,
        "method_node_ids": method_ids,
        "method_area_route_count": len(route_records),
        "combination_design_count": len(combination_records),
        "combination_route_count": sum(len(c["area_routes"]) for c in combination_records),
        "nodes": nodes,
        "edges": edges,
        "method_area_routes": route_records,
        "method_area_role_routes": role_route_records,
        "combination_designs": combination_records,
        "method_combination_selection_contract": {
            "method_count": len(method_ids),
            "unordered_pair_count": len(method_pair_dispositions),
            "pair_dispositions": method_pair_dispositions,
            "exact_supported_method_sets": [
                {"design_id": design["id"], "method_ids": design.get("required_method_ids", design.get("method_ids", [])),
                 "combination_mode": design.get("combination_mode", "fixed_evidence_combination")}
                for design in combination_records
            ],
            "multi_selection_policy": "Never project the union of independently selected methods. Resolve the complete selected set to exact named design(s); if several designs match, require a design choice. Incomplete larger designs and unsupported sets have no combined downstream.",
            "single_selection_policy": "One selected method projects only its own route; no combined design is required or implied.",
            "dominance_policy": "Method contribution may be asymmetric. Keep each component's contribution explicit; do not require equal weighting or use dominance to expand into areas/roles without route evidence.",
        },
        "external_source_registry": SOURCE_REGISTRY,
        "source_artifacts": [
            str(BASE_GRAPH_PATH.relative_to(ROOT)).replace("\\", "/"),
            str(CROSSWALK_PATH.relative_to(ROOT)).replace("\\", "/"),
            str(PROGRAMME_DOMAIN_EVIDENCE_PATH.relative_to(ROOT)).replace("\\", "/"),
            str(DOMAIN_OVERVIEW_CONTRACT_PATH.relative_to(ROOT)).replace("\\", "/"),
            "data/career-mapping/_audit/d078_area_role_task_sets_2026_10_09.json",
            "data/career-mapping/_audit/D078_REQUIREMENT_LANE_AND_SEQUENCE_RECONCILIATION_2026_10_17.json",
        ],
        "routing_policy": {
            "layers": [
                "Sociology programme with all 14 evidence-traceable themes and 236 outcomes",
                "Social Sciences domain overview and explicitly supported programme-to-domain transfer context",
                "three compulsory domain foundations",
                "Methods of investigation/research follow the compulsory foundations; method selection then reveals only route-linked Layer 2/3 preparation with conditions intact",
                "Layer 2 field-wide knowledge and Layer 3 research practices are conditionally revealed after the learner chooses a method or exact named design",
                "one or more selected methods; explain multi-select and require an exact named design for multi-method downstream",
                "the selected method or exact named design filters which Layer 2/3 items appear below the method selector; do not union a combination's independent method inventories or duplicate records downstream",
                "method-specific practices/extensions and task-linked tools", "recommended_area_routes",
                "area-owned learning items", "supported roles inside selected/recommended areas", "role-owned learning items",
            ],
            "area_selection": "Rank all seven canonical areas by task-family links from selected methods; do not hide non-top-ranked areas or infer that method choice alone establishes fit.",
            "role_selection": "Show roles only through their reviewed area links. Within a chosen area, rank by explicit role-task/item evidence when available; do not claim that the domain method is a role requirement merely because the role belongs to that area.",
            "requirements": "The three compulsory D078 domain foundations gate method choice. Other domain, area and role items keep their existing needed/useful/optional/conditional lane and remain non-blocking unless an approved route-scoped dependency explicitly says otherwise.",
            "multiple_methods": "Do not union independently selected method routes. Match the complete selected method set to an exact named design; when multiple designs match, require a design choice. Partial larger designs and unsupported sets have no combined downstream. Preserve asymmetric method contributions inside the selected design.",
            "downstream_items": "After method/combination selection, expose its task-linked area items, tool options, extensions and role items. The set is an available contextual branch; lane and task condition still determine whether each is needed, useful or optional.",
            "relationship_edges": "Only item-to-item typed relationships with resolved canonical node IDs become graph edges. Unresolved relationship prose remains an annotation and cannot be used as a route, prerequisite, or student-facing click target.",
        },
        "validation": {
            "domain_overview_contract_complete": all(
                key in node_map[domain_overview_id].get("student_orientation", {})
                for key in (
                    "whatItStudies", "whatPeopleDo", "questions", "outputs",
                    "howWorkHappens", "whereProgrammeFits",
                )
            ) and all(
                node_map[domain_overview_id].get("orientation_evidence_by_field", {}).get(key)
                for key in (
                    "whatItStudies", "whatPeopleDo", "questions", "outputs",
                    "howWorkHappens", "whereProgrammeFits",
                )
            ) and bool(node_map[domain_overview_id].get("overview_evidence")),
            "domain_overview_evidence_links_have_locators": all(
                source.get("url", "").startswith("https://") and bool(source.get("locator"))
                for sources in node_map[domain_overview_id].get("orientation_evidence_by_field", {}).values()
                for source in sources
            ),
            "all_sociology_themes_and_outcomes_included": (
                sum(n.get("kind") == "programme_theme" for n in nodes) == 14
                and sum(n.get("kind") == "programme_outcome" for n in nodes) == 236
            ),
            "programme_domain_transition_resolves": (
                programme_id in node_map and domain_overview_id in node_map
                and (programme_id, domain_overview_id, "programme_to_domain_context") in {
                    (e["source"], e["target"], e["relationship"]) for e in edges
                }
            ),
            "all_programme_outcomes_remain_grouped_under_their_themes": all(
                (n["id"], next((e["target"] for e in base_edges
                    if e.get("source") == n["id"] and e.get("relationship") == "curriculum_outcome_grouped_under_theme"), ""),
                 "curriculum_outcome_grouped_under_theme") in {
                    (e["source"], e["target"], e["relationship"]) for e in edges
                }
                for n in nodes if n.get("kind") == "programme_outcome"
            ),
            "all_resolvable_programme_transfer_outcomes_are_linked": (
                len(matched_transfer_outcome_ids) > 0
                and all((outcome_id, domain_overview_id, "programme_outcome_transfers_domain_context") in {
                    (e["source"], e["target"], e["relationship"]) for e in edges
                } for outcome_id in matched_transfer_outcome_ids)
            ),
            "sociology_research_outcomes_connect_to_relevant_methods": all(
                (outcomes_by_course_index.get(key), target, "programme_outcome_contextualizes_domain_method") in {
                    (e["source"], e["target"], e["relationship"]) for e in edges
                }
                for key, targets in method_outcome_targets.items() for target in targets
                if outcomes_by_course_index.get(key) in node_map and target in node_map
            ),
            "all_method_nodes_resolve": all(mid in node_map for mid in method_ids),
            "all_method_area_routes_have_tasks": all(bool(r["task_family_ids"]) for r in route_records),
            "all_route_areas_canonical": all(r["area_id"] in area_nodes for r in route_records),
            "all_route_roles_supported_by_area": all(set(r["role_ids"]).issubset(set(roles_by_area[r["area_id"]])) for r in route_records),
            "all_combination_methods_resolve": all(set(c["method_ids"]).issubset(set(node_map)) for c in combination_records),
            "all_method_role_route_refs_resolve": all(
                route_id in node_map
                and node_map[route_id].get("method_id") == route["method_id"]
                and node_map[route_id].get("area_id") == route["area_id"]
                for route in route_records for route_id in route["role_route_ids"]
            ),
            "combination_role_items_wait_for_role_selection": all(
                not node_map[route["route_node_id"]].get("role_item_ids")
                and all(route_id in node_map and set(node_map[route_id].get("role_item_ids", []))
                        == set(role_items_by_role.get(node_map[route_id].get("role_id"), []))
                        for route_id in route.get("role_route_ids", []))
                for combo in combination_records for route in combo["area_routes"]
            ),
            "combination_sources_resolve": all(
                set(combo["sources"]).issubset(set(SOURCE_REGISTRY)) for combo in combination_records
            ),
            "combination_routes_have_task_and_role_paths": all(
                bool(route.get("method_contributions"))
                and all(bool(contribution.get("task_family_ids"))
                        for contribution in route.get("method_contributions", []))
                and bool(route["role_route_ids"])
                for combo in combination_records for route in combo["area_routes"]
            ),
            "participatory_methods_are_options_not_all_required": all(
                combo.get("combination_mode") == "design_frame_with_selectable_methods"
                and len(combo.get("selectable_component_method_ids", [])) > 0
                and len(combo.get("required_method_ids", [])) == 1
                for combo in combination_records if combo["id"] == "combo:participatory-method-choice"
            ),
            "network_analysis_methods_tools_and_concepts_linked": all(
                (source, target, relationship) in {
                    (edge["source"], edge["target"], edge["relationship"]) for edge in edges
                }
                for source, target, relationship in (
                    ("domain-method:social-network-analysis", "domain-method:network-analysis", "specialist_extension_of"),
                    ("domain-knowledge:graph-theory-concepts-for-networks", "domain-method:network-analysis", "conditional_conceptual_preparation_for"),
                    ("domain-knowledge:graph-theory-concepts-for-networks", "domain-method:social-network-analysis", "conditional_conceptual_preparation_for"),
                    ("domain-item:d078-networkx-tool", "domain-method:network-analysis", "tool_for"),
                    ("domain-item:d078-networkx-tool", "domain-method:social-network-analysis", "works_with"),
                    ("domain-item:d078-social-network-tool", "domain-method:social-network-analysis", "works_with"),
                )
            ),
            "legacy_area_count": 0,
            "student_visibility_promoted": False,
        },
    }
    payload["domain_learning_layers"].sort(key=lambda layer: layer["sequence_order"])
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    counts_by_area = Counter(r["area_id"] for r in route_records)
    combinations_summary = "\n".join(
        (
            f"- **{c['id']}**: a design frame with {len(c['required_method_ids'])} required approach and "
            f"{len(c['selectable_component_method_ids'])} selectable evidence methods (choose a suitable subset); "
            "area routes are derived from the learner's chosen methods."
            if c.get("combination_mode") == "design_frame_with_selectable_methods"
            else f"- **{c['id']}**: {len(c['method_ids'])} coordinated methods; {len(c['area_routes'])} evidenced area routes."
        )
        for c in combination_records
    )
    method_route_inventory = "\n".join(
        "| {method} | {area} | {tasks} | {domain_items} | {area_items} | {tools} | {roles} |".format(
            method=base_nodes[route["method_id"]].get("label", route["method_id"]),
            area=area_nodes[route["area_id"]].get("label", route["area_id"]),
            tasks=len(route["task_family_ids"]),
            domain_items=len(route["task_linked_domain_item_ids"])+len(route["domain_downstream_item_ids"]),
            area_items=len(route["area_item_ids"]),
            tools=len(route["domain_tool_ids"])+len(route["tool_ids"]),
            roles=len(route["role_ids"]),
        )
        for route in sorted(route_records, key=lambda row: (base_nodes[row["method_id"]].get("label", row["method_id"]), area_nodes[row["area_id"]].get("label", row["area_id"])))
    )
    combination_route_inventory = "\n".join(
        "| {combo} | {area} | {tasks} | {items} | {tools} | {roles} |".format(
            combo=combo["id"],
            area=area_nodes[route["area_id"]].get("label", route["area_id"]),
            tasks=len(route["task_family_ids"]),
            items=len(node_map[route["route_node_id"]].get("available_item_ids", [])),
            tools=len(node_map[route["route_node_id"]].get("domain_tool_ids", []))+len(node_map[route["route_node_id"]].get("tool_ids", [])),
            roles=len(route["role_ids"]),
        )
        for combo in combination_records for route in combo["area_routes"]
    )
    report = f"""# D078 method → area → role route graph (19 October 2026)

This is the route-graph design artifact to review **before UI implementation**. It is not student-visible and does not regenerate or apply SQL.

## What the graph now models

- The existing three compulsory D078 domain foundations remain the required starting spine; their order is recommended teaching order, not a claim that one foundation is a technical prerequisite of another.
- After all three, one or more method choices open. A learner may choose a single method or a named, evidence-backed combination design.
- Method routes connect to area task families, then to area-owned learning items and context-specific tools, then to roles already supported inside those areas, and finally to role-owned learning items.
- Selected methods rank all seven canonical areas; non-top-ranked areas remain available. Role appearance is inherited only through the reviewed area→role relation. A domain method does not by itself claim role competence or a role requirement.
- Requirement lanes remain separate from content categories. The three compulsory domain foundations gate method choice; other items retain their existing needed/useful/optional/conditional scope and can be skipped unless a reviewed, route-scoped dependency says otherwise.

## Programme-to-domain handoff

The graph includes **{sum(n.get('kind') == 'programme_theme' for n in nodes)} Sociology curriculum themes and {sum(n.get('kind') == 'programme_outcome' for n in nodes)} programme outcomes**, preserving the outcome-to-theme grouping. No five-theme cap or outcome truncation is applied. Themes included: {', '.join(n.get('label', n['id']) for n in nodes if n.get('kind') == 'programme_theme')}.

It connects the Sociology programme to the Social Sciences domain and carries source-supported prior-learning context into the domain overview before additional foundations or route choices appear. The graph’s ordered layers are:

0. Domain orientation and the Sociology-programme handoff.
1. Compulsory domain foundations (the three shared progression gates).
2. Useful field-wide learning, including applicable knowledge, practices, methods and tools.
3. Optional or conditional preparation, scoped to the task or route it supports.
4. Method choice, including only the evidence-backed multi-method designs.

All 14 themes and 236 outcomes remain at the programme level; only individually supported course/outcome context is carried into the domain transition. This avoids both hiding curriculum context and claiming that every Sociology outcome teaches every D078 task.

The direct programme-domain source contains {len(sociology_domain_evidence.get('course_anchors', []))} individually resolved course-anchor rows and {len(sociology_domain_evidence.get('transferable_evidence', []))} transferable-evidence rows. Its aggregate fields report {sociology_domain_evidence.get('course_anchor_count')} and {sociology_domain_evidence.get('transferable_evidence_count')}, respectively; those aggregates do not match the detail rows. The graph uses the individually resolved rows only and excludes those aggregate figures from learner-facing display. Directly supported programme context is not a claim that the degree teaches every domain task or that the learner has mastered it.

SOC 301 and SSC 302 curriculum outcomes are also connected to the relevant method choices they introduce. The route continues from those programme outcomes into the three domain foundations, useful/optional domain learning, then selected methods and their area/role branches.

## Social Sciences domain overview contract

The D078 domain node now carries the approved overview plus the six orientation fields that the backend can individually source-approve for display: what the field studies; what practitioners may do; example questions; possible outputs; how the work may happen; and how the Sociology programme fits. Each orientation field is accompanied by its reviewed evidence links and locators. This makes the graph carry the domain overview itself, rather than only a short summary and the programme-transition paragraph.

The contract does not invent separately approved global context, Nigerian practice context, entry expectations, opportunities/constraints, decision guidance or related-programme claims where the API's field-level evidence gate does not approve those fields. Nigeria-specific curriculum context remains explicit in the programme-fit section; international occupational examples remain bounded to the cited ILO groups. The existing `migration_domain_student_orientation_2026-09-18.sql` already persists this same approved orientation content. No D078 learning-content SQL seed is regenerated for a graph-only copy; route-graph SQL persistence is not yet defined and remains pending the UI projection/design decision.

## Graph totals

- Canonical areas: **{len(area_nodes)}**
- Routed roles: **{len(role_nodes)}**
- Method nodes with at least one evidenced area-task route: **{len(method_ids)}**
- Method → area route pairs: **{len(route_records)}**
- Named multi-method designs: **{len(combination_records)}**
- Combination → area route pairs: **{sum(len(c['area_routes']) for c in combination_records)}**
- Graph nodes/edges: **{len(nodes)} / {len(edges)}**
- Legacy area nodes: **0**

## Evidence-backed multi-method patterns

These are **{len(combination_records)} named, evidence-backed designs**, not every possible mathematical pairing of methods. There are **{sum(1 for c in combination_records if c.get('combination_mode') != 'design_frame_with_selectable_methods' and len(c['method_ids']) == 2)} supported two-method patterns**, one case-study design using four complementary evidence approaches, and one participatory design frame that requires the participatory approach but lets the learner choose one or more suitable evidence methods. The four methods listed in that frame are options, not a bundle that every learner must use.

{combinations_summary}

Each combination node includes why it can be used, a practical sequence, when it fits, limitations, foundation links, and external/local source references. The sources support the design patterns; they do not make combinations compulsory.

## Route counts by area

""" + "\n".join(f"- {area_nodes[area].get('label', area)}: {count} method-route links" for area, count in sorted(counts_by_area.items())) + """

## Full method-to-area route inventory

Counts are audit aids: `domain items` includes method-task-linked domain items plus direct method extensions; `area items` are area-owned item nodes; `tools` are linked domain and area tools. The full graph preserves each item ID and relationship type.

| Method | Area | Task families | Domain items | Area items | Tools | Supported roles |
|---|---|---:|---:|---:|---:|---:|
""" + method_route_inventory + """

## Combination-to-area downstream inventory

These are available branches after selecting the named design and area. Role-owned items remain behind a role choice; counts here deliberately do not include them.

| Combination | Area | Task families | Available items | Tools | Supported roles |
|---|---|---:|---:|---:|---:|
""" + combination_route_inventory + """

## Guardrails and interpretation

1. “Recommended” means the selected method has a recorded task-family connection to that area; it does not mean other areas are prohibited.
2. “Roles in this area” means the existing reviewed D078 area-role link applies. The graph does not claim that a learner’s method choice alone qualifies them for a role.
3. Area items/tools are surfaced below the method only when the area task route already links them. Tool edges are supportive options, not blockers or proof of skill.
4. Multi-method routes appear only as explicit designs with integration logic. Case study is treated as a design that may use several evidence methods, not as a mutually exclusive data-collection method.
5. The graph is still a pre-implementation design artifact. Verify the serialized graph and route examples, then implement its projections in the UI; only after that should the student-facing gate be considered.

## Sources for combinations

""" + "\n".join(f"- [{s['title']}]({s['url']}) — supports: {s['supports']} Limit: {s['limits']}" for s in SOURCE_REGISTRY.values()) + f"""

Machine-readable graph: `{OUTPUT_PATH.relative_to(ROOT).as_posix()}`.
"""
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(report, encoding="utf-8")
    print(json.dumps({
        "output": str(OUTPUT_PATH), "report": str(REPORT_PATH),
        "nodes": len(nodes), "edges": len(edges), "methods": len(method_ids),
        "method_area_routes": len(route_records), "combinations": len(combination_records),
        "combination_area_routes": sum(len(c["area_routes"]) for c in combination_records),
        "areas": len(area_nodes), "roles": len(role_nodes),
        "routes_by_area": dict(counts_by_area), "validation": payload["validation"],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
