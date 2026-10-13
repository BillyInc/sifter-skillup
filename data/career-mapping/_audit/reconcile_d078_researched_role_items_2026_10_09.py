"""Reconcile completed D078 role-item research pairs with the learning inventory.

This is a local content crosswalk, not role-fit adjudication. It distinguishes
concept overlap from source identity and checkpoint approval and never writes
canonical taxonomy, API, SQL, matcher, or role records.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
TASK_SETS = ROOT / "data/career-mapping/_audit/d078_area_role_task_sets_2026_10_09.json"
CONTRACT = ROOT / "data/career-mapping/_audit/d078_domain_learning_contract_2026_10_08.json"
OUT_JSON = ROOT / "data/career-mapping/_audit/d078_researched_role_item_reconciliation_2026_10_09.json"
OUT_MD = ROOT / "docs/manual-review/D078_RESEARCHED_ROLE_ITEM_RECONCILIATION_2026_10_09.md"
RECONCILE_FIRST_N = 23
LANE_BATCHES = [
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/replacement-001-072/batch-004.json",
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/replacement-001-072/batch-005.json",
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/replacement-001-072/batch-006.json",
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/replacement-001-072/batch-007.json",
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/replacement-001-072/batch-008.json",
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/research-073-144/checkpoint-083-092.json",
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/research-073-144/checkpoint-093-102.json",
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/research-073-144/checkpoint-103-112.json",
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/research-073-144/checkpoint-113-122.json",
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/research-073-144/checkpoint-123-132.json",
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/research-073-144/checkpoint-133-144.json",
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/research-145-215/checkpoint-145-154.json",
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/research-145-215/checkpoint-155-164.json",
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/research-145-215/checkpoint-165-174.json",
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/research-145-215/checkpoint-175-184.json",
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/research-145-215/checkpoint-185-194.json",
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/research-145-215/checkpoint-195-204.json",
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/research-145-215/checkpoint-205-215.json",
    ROOT / "data/career-mapping/_audit/d078_role_item_lanes_2026_10_09/research-073-144/checkpoint-073-082.json",
]


# These are conceptual crosswalk decisions only. In particular, "same concept"
# does not assert identity of the underlying ESCO concept or role-task linkage.
CROSSWALK: dict[str, dict[str, Any]] = {
    "research design": {
        "relation": "same_learning_concept_candidate",
        "contract_ids": ["d078-research-question-design"],
        "rationale": "The candidate item already explains connecting a research question to a design and evidence. Preserve the agent's role-occurrence source as provenance; do not infer role ownership or shared-domain breadth from the overlap.",
        "next_review": "Verify the exact ESCO concept/profile and task evidence for each listed role before using those occurrences to support a route.",
    },
    "scientific literature": {
        "relation": "partial_overlap_not_duplicate",
        "contract_ids": ["reference_and_literature_management", "d078-evaluate-evidence-and-limits"],
        "rationale": "Finding and managing publications overlaps with the literature-management candidate; appraising research quality and synthesising what is known are additional tasks, not supplied by a reference manager alone.",
        "next_review": "Separate literature discovery/management from critical appraisal and evidence synthesis; identify exact source concept and role tasks.",
    },
    "statistics": {
        "relation": "related_quantitative_learning_not_duplicate",
        "contract_ids": ["d078-quantitative-approach", "d078-statistical-tool-choice", "d078-spss-tool", "d078-pandas-tool"],
        "rationale": "Statistics is a body of methods/knowledge; tool-choice and named software are separate. Keep them related but do not collapse statistical reasoning into operating software.",
        "next_review": "Determine the precise statistical scope from the role tasks and map methods separately from optional software.",
    },
    "scientific research methodology": {
        "relation": "umbrella_method_family_overlap",
        "contract_ids": ["d078-quantitative-approach", "d078-qualitative-approach", "d078-mixed-methods", "d078-survey-method", "d078-interviews", "d078-document-analysis"],
        "rationale": "The phrase can cover multiple designs and methods already represented as distinct choices. It is not one additional method and should not duplicate every method beneath it.",
        "next_review": "Resolve the source concept's scope and connect only methods supported by the downstream task evidence.",
    },
    "draft scientific or academic papers and technical documentation": {
        "relation": "partial_overlap_distinct_output",
        "contract_ids": ["d078-communicate-evidence"],
        "rationale": "Communicating findings overlaps, but preparing a scientific paper or technical document is a distinct written output with audience, structure and evidence-reporting requirements.",
        "next_review": "Keep formal scientific/technical writing separate from general communication unless the exact source/task record establishes the same competency.",
    },
    "manage research data": {
        "relation": "same_learning_concept_candidate",
        "contract_ids": ["d078-care-for-research-data"],
        "rationale": "Both describe organising, documenting, storing and protecting research information. The existing item already states that applicability depends on a route handling data.",
        "next_review": "Confirm exact ESCO identity and each role's data-management task; do not upgrade to a universal foundation based on 12 occurrences.",
    },
    "sociology": {
        "relation": "disciplinary_knowledge_scope_gap_candidate",
        "contract_ids": [],
        "rationale": "This is a discipline/knowledge label, not a tool or method. It is not currently a standalone item in the learning contract; its presence does not prove all D078 learners need a single generic Sociology module.",
        "next_review": "Check the exact concept and determine whether it belongs as domain orientation, a programme curriculum link, or only in particular area/role contexts.",
    },
    "disseminate results to the scientific community": {
        "relation": "partial_overlap_distinct_audience",
        "contract_ids": ["d078-communicate-evidence"],
        "rationale": "It is a specific research-output/audience instance of communicating evidence. Do not silently equate academic dissemination with policy, community, client or public communication.",
        "next_review": "Retain the audience and output condition when supported by exact role tasks; use the broader communication item only as a parent concept.",
    },
    "operate open source software": {
        "relation": "broad_capability_overlap_not_specific_tool",
        "contract_ids": ["d078-computational-social-research", "d078-pandas-tool", "d078-networkx-tool", "d078-mesa-tool"],
        "rationale": "Operating open-source software is broader than any one named package and does not identify a specific social-research task. Named libraries remain conditional workflow options, not implied requirements.",
        "next_review": "Resolve exact source identity and the task/software context; do not create a generic package checklist from this label.",
    },
    "economics": {
        "relation": "disciplinary_knowledge_scope_gap_candidate",
        "contract_ids": [],
        "rationale": "Economics is subject knowledge, not itself a method or competency. Its appearance in some role lists does not establish that it is a shared D078 foundation or that economic roles should be routed here.",
        "next_review": "Use existing route boundaries and exact task evidence to determine whether a bounded economics concept supports a D078 task; do not reopen role/domain fit.",
    },
    "interact professionally in research and professional environments": {
        "relation": "partial_overlap_distinct_interpersonal_competency",
        "contract_ids": ["d078-communicate-evidence"],
        "rationale": "Professional interaction may include collaboration, consultation and conduct beyond communicating research findings. The existing communication item is not a complete substitute.",
        "next_review": "Keep interpersonal interaction distinct unless exact concept identity and task evidence justify a narrower shared explanation.",
    },
    "geography": {
        "relation": "knowledge_scope_related_to_spatial_methods",
        "contract_ids": ["d078-spatial-social-analysis"],
        "rationale": "Geographical knowledge and spatial analysis can complement each other, but geographic subject knowledge is not the same as GIS, mapping or spatial-statistical method competence.",
        "next_review": "Identify the relevant geography branch and downstream task before linking it to spatial tools or methods.",
    },
    "mathematics": {
        "relation": "conditional_prerequisite_candidate",
        "contract_ids": ["d078-quantitative-approach", "d078-statistical-tool-choice"],
        "rationale": "Some quantitative work depends on mathematical ideas, but the level and topic vary by method. Mathematics should not be imposed as a uniform requirement across D078.",
        "next_review": "Specify the mathematics needed for each evidenced quantitative method and expose it as inspectable prerequisite learning, not a blanket domain gate.",
    },
    "government policy implementation": {
        "relation": "conditional_policy_task_partial_overlap",
        "contract_ids": ["programme_evaluation_and_theory_of_change"],
        "rationale": "Policy implementation is related to evaluating a programme or policy, but implementation work and evaluation are different activities. One does not imply the other.",
        "next_review": "Separate implementation, policy analysis and evaluation tasks using role/task-set evidence; do not infer policy authority or Nigerian public-service rules from a generic label.",
    },
    "quantitative analysis": {
        "relation": "method_family_overlap_not_software_duplicate",
        "contract_ids": ["d078-quantitative-approach", "d078-statistical-tool-choice", "d078-spss-tool", "d078-pandas-tool"],
        "rationale": "Quantitative analysis is a task/method family that may use different tools. It overlaps the quantitative-method candidate but is not identical to choosing or operating software.",
        "next_review": "Record the question, data, suitable analysis and learner output before connecting a package or tool.",
    },
    "psychology": {
        "relation": "bounded_d078_knowledge_candidate",
        "contract_ids": [],
        "related_area_key": "D078:psychology-social-behaviour",
        "rationale": "Only social behaviour/interaction studied within the current Social Behaviour and Interaction area is in scope. Psychology as a broad discipline must not leak into D064 Psychology and Counselling or imply clinical practice.",
        "next_review": "Check exact ESCO concept and task context against the already-established D078 boundary; no role/area mapping decision is made here.",
    },
    "anthropology": {
        "relation": "disciplinary_knowledge_scope_gap_candidate",
        "contract_ids": [],
        "rationale": "Anthropology is disciplinary knowledge with multiple branches, not one generic skill. The current contract does not make it a standalone universal item.",
        "next_review": "Distinguish relevant social/cultural/archaeological knowledge and methods only where the existing area and task evidence supports them.",
    },
    "digital data processing": {
        "relation": "partial_computational_workflow_overlap",
        "contract_ids": ["d078-computational-social-research", "d078-pandas-tool", "d078-excel-data-tool"],
        "rationale": "Data processing may include cleaning, transforming or combining data, which overlaps some tool workflows; it is not equivalent to computational social research as a whole or to using one named package.",
        "next_review": "Specify the input, transformation, quality checks and output before linking Python libraries or other tools.",
    },
    "advise on economic development": {
        "relation": "conditional_specialist_task_candidate",
        "contract_ids": ["programme_evaluation_and_theory_of_change", "d078-evaluate-evidence-and-limits"],
        "rationale": "This is a bounded advice/application task that may use economic and development evidence. It is not a domain-wide skill and is not established by its three role-list occurrences.",
        "next_review": "Keep conditional until exact role tasks, the source concept and the advice/output context are verified.",
    },
    "analyse economic trends": {
        "relation": "conditional_applied_analysis_candidate",
        "contract_ids": ["d078-quantitative-approach", "d078-evaluate-evidence-and-limits"],
        "rationale": "Economic trend analysis may use quantitative methods and contextual economic knowledge, but these are distinct prerequisites and the task is not universal across D078.",
        "next_review": "Define the data, time horizon, analytical method, uncertainty and limits from the actual role task before attaching tools or learning links.",
    },
    "cultural geography": {
        "relation": "disciplinary_knowledge_related_to_spatial_analysis",
        "contract_ids": ["d078-spatial-social-analysis"],
        "rationale": "Cultural geography may provide place-based concepts for some social research; it is not a synonym for spatial analysis or a general geography/software skill.",
        "next_review": "Verify the specific source concept and research task; retain cultural interpretation separately from mapping/statistical technique.",
    },
    "empirical analysis": {
        "relation": "evidence_inquiry_family_not_one_method",
        "contract_ids": [
            "d078-research-question-design",
            "d078-quantitative-approach",
            "d078-qualitative-approach",
            "d078-evaluate-evidence-and-limits",
        ],
        "rationale": "Empirical analysis means drawing conclusions from observed or collected evidence, but it does not identify one particular method. Depending on the question and evidence, it can involve qualitative, quantitative or combined approaches; it must not be reduced to statistics alone.",
        "next_review": "Verify the exact source concept and role task, then identify the evidence type, analysis and output before relating this family to a specific contract item or checkpoint.",
    },
    "political economy": {
        "relation": "interdisciplinary_knowledge_scope_gap_candidate",
        "contract_ids": [],
        "rationale": "Political economy is an interdisciplinary field for examining how political institutions, power and economic arrangements shape one another. It is not a single tool or method and is not yet represented as a distinct learning item in the current contract.",
        "next_review": "Keep as a bounded content gap candidate; verify the exact source concept, D078 area/task relevance and Nigeria-specific context before adding a learning-contract item. Do not infer a role route from the phrase alone.",
    },
    "media law": {
        "relation": "jurisdiction_specific_knowledge_gap_candidate",
        "contract_ids": [],
        "rationale": "Media law is jurisdiction- and activity-specific knowledge. International freedom-of-expression principles and media-literacy resources are not interchangeable with current domestic law or with a media-studies method.",
        "next_review": "Locate current Nigerian primary law and regulator instruments for any bounded media/publication task; verify role-task support and a genuinely task-specific free learning resource before considering a contract addition.",
    },
    "media studies": {
        "relation": "disciplinary_content_gap_candidate",
        "contract_ids": [],
        "rationale": "Media studies concerns media institutions, forms, texts, audiences and social effects. Media education/literacy is related but not identical, and no current D078 contract item fully represents this disciplinary scope.",
        "next_review": "Verify exact source identity, D078 route relevance, Nigerian media context and a task-specific learning resource before adding a bounded item; do not treat the essential-priority label as proof of breadth.",
    },
    "organisational policies": {
        "relation": "ambiguous_policy_scope_gap_candidate",
        "contract_ids": [],
        "rationale": "The phrase could refer to internal organizational rules or to public-policy systems. Those have different owners, evidence, tasks and limits, so they cannot safely be merged into one learning item without source disambiguation.",
        "next_review": "Resolve the exact source concept and role task first; keep public authority, organizational governance, compliance and law distinct, and do not infer that a policy label grants authority to set or enforce policy.",
    },
    "osteology": {
        "relation": "specialist_adjacent_scope_candidate",
        "contract_ids": [],
        "rationale": "Osteology is specialist knowledge about bones with archaeological, comparative, forensic and clinical contexts. General archaeology or human-remains awareness does not supply osteological analysis or clinical/forensic authority.",
        "next_review": "Keep unplaced in this content crosswalk until a specific D078 task and area context is evidenced; verify Nigerian heritage, consent and remains-handling requirements before proposing any use.",
    },
    "paleography": {
        "relation": "specialist_complement_to_archival_historical_research",
        "contract_ids": ["archival_and_historical_research"],
        "rationale": "Paleography—the reading and contextual interpretation of historical handwriting—can support archival/historical research, but is a specialist skill rather than a duplicate of the broader research approach. Transcription is not translation or authentication.",
        "next_review": "Check scripts, language, collection and role task separately; the cited UK archival resources do not establish Nigerian script coverage or local task demand.",
    },
    "policy analysis": {
        "relation": "complements_but_is_not_identical_to_evidence_appraisal",
        "contract_ids": ["d078-evaluate-evidence-and-limits"],
        "rationale": "Policy analysis can use evidence appraisal but additionally asks about a defined policy problem, options, implementation and effects. The existing evidence-appraisal item does not cover that full policy workflow.",
        "next_review": "Identify the policy jurisdiction, sector, decision stage and role owner; distinguish analysis from advocacy, legal advice, authorization, implementation and evaluation before adding route-specific learning content.",
    },
    "political science": {
        "relation": "disciplinary_knowledge_gap_candidate",
        "contract_ids": [],
        "rationale": "Political science is a disciplinary field that can inform bounded social-science questions; it is not identical to politics, campaigning, public administration or a single research method. The contract has no distinct political-science learning item.",
        "next_review": "Verify which current D078 area/task calls for this knowledge and keep Nigerian constitutional/institutional context separate from global disciplinary framing.",
    },
    "politics": {
        "relation": "bounded_case_knowledge_distinct_from_political_science_methods",
        "contract_ids": [],
        "rationale": "Politics may be relevant as contextual knowledge for a bounded case, but does not itself mean political-science research methods, campaigning or political authority. Preserve the researched optional occurrence separately from the essential-priority occurrence.",
        "next_review": "Use only where a defined question or role task requires the political context; specify jurisdiction/time period and avoid treating the label as a broad foundation.",
    },
    "public finance": {
        "relation": "specialist_public_economics_gap_candidate",
        "contract_ids": [],
        "rationale": "Public finance concerns government revenue, spending, debt and fiscal institutions. It is not corporate finance, accounting, or a general quantitative method, and is not represented as a distinct item in the current learning contract.",
        "next_review": "Verify a specific D078 policy/economic task and jurisdiction; retain federal and subnational Nigerian contexts separately and do not infer role mandate from the essential-priority label.",
    },
    "Sanskrit": {
        "relation": "conditional_source_language_knowledge_gap_candidate",
        "contract_ids": [],
        "rationale": "Sanskrit is relevant only when a defined task requires reading or interpreting Sanskrit-language material. It is not interchangeable with epigraphy, religious studies, translation, or language credentials.",
        "next_review": "Confirm the exact source concept and occurrence/task before adding it; verify script, corpus and a genuinely Sanskrit-specific learner resource. A global-language learning resource alone does not establish Nigerian route relevance.",
    },
    "scientific modelling": {
        "relation": "overlaps_quantitative_analysis_but_model_scope_is_distinct",
        "contract_ids": ["d078-quantitative-approach", "d078-evaluate-evidence-and-limits"],
        "rationale": "Modelling may use quantitative data and evidence checks, but a model is a representation with assumptions, structure and validation needs; it is not equivalent to quantitative analysis as a whole.",
        "next_review": "Identify the model class, purpose, data and validation standard from the actual task. The essential label does not prove every role needs scientific modelling or that a Nigerian dataset validates a model.",
    },
    "social sciences": {
        "relation": "disciplinary_scope_not_a_single_learning_item",
        "contract_ids": [],
        "rationale": "Social sciences names a broad family of disciplines, not one method or competency. The current D078 contract already concerns the social-science domain, so this label should not be duplicated as a generic skill.",
        "next_review": "Resolve which discipline or task is intended and keep the D078 social-behaviour boundary distinct from clinical psychology and the separately catalogued domains.",
    },
    "strategic planning": {
        "relation": "conditional_planning_capability_gap_candidate",
        "contract_ids": [],
        "rationale": "Strategic planning sets longer-term direction, priorities and measures; it is distinct from project scheduling, policy formulation and evaluation. No matching standalone learning item is currently established in the D078 contract.",
        "next_review": "Identify the organization, decision authority, planning horizon and role task; verify current Nigerian planning sources for the relevant level rather than treating a national plan as universal guidance.",
    },
    "surveying": {
        "relation": "ambiguous_land_or_questionnaire_surveying_gap",
        "contract_ids": ["d078-survey-method"],
        "rationale": "The label may mean land/geospatial measurement or survey research with questionnaires. Only the latter overlaps the existing survey-method item; land surveying is a separate technical and regulated practice.",
        "next_review": "Disambiguate the source/task before mapping. Do not infer cadastral competence, professional licensing or Nigerian regulator scope from a social-research survey record.",
    },
    "tax legislation": {
        "relation": "jurisdiction_and_date_specific_legal_knowledge_gap",
        "contract_ids": [],
        "rationale": "Tax legislation is jurisdiction- and date-specific legal material. Tax-policy analysis may use it, but it is not itself tax advice, accounting technique or a universal D078 foundation.",
        "next_review": "Use the current primary statute and transition rules for the task's jurisdiction/date, verify any Nigerian source against the enacted instrument, and avoid implying legal-advice authority.",
    },
    "types of media": {
        "relation": "media_taxonomy_context_not_media_studies_duplicate",
        "contract_ids": [],
        "rationale": "Media formats/channels may provide context for communication or media research, but naming types of media does not supply media-studies analysis, production skill or audience research.",
        "next_review": "Check the exact intended classification and role task; connect it only to a supported media-analysis use case, not to a generic domain foundation.",
    },
    "urban planning": {
        "relation": "applied_spatial_domain_related_not_duplicate",
        "contract_ids": ["d078-spatial-social-analysis"],
        "rationale": "Urban planning concerns planning decisions and built-environment systems; it may draw on spatial social analysis, but that method does not cover planning law, design, infrastructure or professional authority.",
        "next_review": "Keep the interdisciplinary boundary explicit and confirm an actual D078 task before adding a planning learning route; do not imply planning licensure.",
    },
    "use data processing techniques": {
        "relation": "same_workflow_family_candidate_not_specific_tool",
        "contract_ids": ["d078-computational-social-research", "d078-pandas-tool", "d078-excel-data-tool"],
        "rationale": "Data processing can include cleaning, recoding, validating and reshaping data. These tasks overlap parts of computational workflows and named tools, but the phrase does not identify a specific language, library or full computational method.",
        "next_review": "Specify the input, transformation, quality checks and output from each task occurrence; keep the Nigerian R workshop as a bounded local example, not an all-role requirement.",
    },
    "write research proposals": {
        "relation": "distinct_planning_output_related_to_research_design",
        "contract_ids": ["d078-research-question-design"],
        "rationale": "Proposal writing communicates a planned study for a particular audience/template; research design is a substantive plan for answering a question. They are related, but a proposal is not a duplicate of design or general findings communication.",
        "next_review": "Verify which roles actually author proposals, identify the funder/institution template and ethical requirements, and keep examples like NISER training institution-specific.",
    },
    "accounting techniques": {
        "relation": "specialist_financial_record_knowledge_gap_candidate",
        "contract_ids": [],
        "rationale": "Accounting techniques may support interpreting financial records in a bounded tax-policy task, but do not imply bookkeeping, audit, accounting qualification or authority to certify accounts.",
        "next_review": "Identify the actual technique/standard, applicable Nigerian reporting authority and role task before adding; the agent's regulator portals are discovery leads rather than verified task evidence.",
    },
    "action research": {
        "relation": "specialist_cycle_not_yet_represented",
        "contract_ids": ["d078-qualitative-approach", "programme_evaluation_and_theory_of_change"],
        "rationale": "Action research combines inquiry with a planned cycle of action, observation and reflection, often with participant/practitioner involvement. It can use qualitative methods or evaluation, but neither generic qualitative research nor evaluation alone is an exact duplicate.",
        "next_review": "Confirm the social-work research task and participation/governance safeguards; a locally described NISER training context does not prove that every social-work researcher performs action research.",
    },
    "advertising techniques": {
        "relation": "ambiguous_media_analysis_or_campaign_practice_gap",
        "contract_ids": [],
        "rationale": "The phrase could mean analysing advertising as media evidence or planning and delivering a campaign. Those are different tasks; campaign practice is not established by media research or literacy alone.",
        "next_review": "Resolve the intended task and role remit, apply Nigerian advertising rules only from current primary sources, and do not treat a media-planning course as research or legal-compliance training.",
    },
    "advise legislators": {
        "relation": "conditional_evidence_briefing_task_candidate",
        "contract_ids": ["d078-evaluate-evidence-and-limits"],
        "rationale": "Where a role's remit includes legislative support, evidence appraisal may contribute to a nonpartisan brief with options and caveats; it does not establish lobbying, legal advice, bill drafting, authority or final decision-making.",
        "next_review": "Verify the actual employer/client mandate and task, then distinguish research support from legislative counsel and authorized institutional advice; Nigerian institution examples are not a universal D078 duty.",
    },
    "advise on legislative acts": {
        "relation": "ambiguous_legal_authority_boundary_candidate",
        "contract_ids": ["d078-evaluate-evidence-and-limits"],
        "rationale": "The wording could overstate legal advisory authority. A bounded research contribution might summarize implementation or economic effects, but legal interpretation belongs to appropriately authorized counsel.",
        "next_review": "Resolve the source concept, role task and Nigerian institutional remit before any learning-content addition; do not present this label as permission to interpret law.",
    },
    "algorithms": {
        "relation": "conditional_computational_method_gap_candidate",
        "contract_ids": ["d078_scikit_learn"],
        "rationale": "Algorithms are step-by-step computational procedures; they may underpin statistical workflows or software, but knowing a library is not the same as designing, understanding or validating an algorithm.",
        "next_review": "Name the algorithm and task before mapping it to a computational route; do not infer algorithm design from statistical work or from an R-training example.",
    },
    "analyse legislation": {
        "relation": "conditional_historical_source_context_not_legal_analysis",
        "contract_ids": ["archival_and_historical_research", "d078-evaluate-evidence-and-limits"],
        "rationale": "A genealogist may need to contextualize a historical law or record for family-history interpretation; this does not establish legal analysis, advice or current statutory interpretation.",
        "next_review": "Verify the source task and archival jurisdiction; distinguish historical source interpretation from qualified legal analysis and check Nigerian repository links as discovery leads only.",
    },
    "analyse market financial trends": {
        "relation": "conditional_descriptive_trend_analysis_not_causal_or_investment_advice",
        "contract_ids": ["d078-quantitative-approach", "d078-evaluate-evidence-and-limits"],
        "rationale": "Comparing defined financial/economic indicators over time may use quantitative analysis and evidence appraisal. It does not by itself establish causes, forecasting skill or investment advice. Essential and optional priority occurrences remain separate source records.",
        "next_review": "Verify each role task, data source, indicator definitions and time period; separate the already researched essential-priority pair from this optional-priority pair and do not infer role authority.",
    },
    "analyse recorded sources": {
        "relation": "source_analysis_workflow_related_to_archival_research",
        "contract_ids": ["archival_and_historical_research", "d078-evaluate-evidence-and-limits"],
        "rationale": "Analysis of recorded sources may involve provenance, context, reliability and interpretation; it can support archival research but is not simply document management or generic critical appraisal.",
        "next_review": "Confirm the source types, historical period and task; distinguish transcription, interpretation and authentication, and keep Nigerian archival-resource links at discovery-lead status until collection locators are checked.",
    },
    "applied zoology": {
        "relation": "specialist_disciplinary_scope_gap_candidate",
        "contract_ids": [],
        "rationale": "Applied zoology is specialist biological knowledge, not a general social-science method. A social-science occurrence could be contextual or interdisciplinary, but the phrase alone does not establish a D078 learning route.",
        "next_review": "Do not promote without a clearly described interdisciplinary task and area context; preserve the role-list occurrence as research provenance rather than inferring a taxonomy or role-fit decision.",
    },
    "apply problem solving in social service": {
        "relation": "practice_problem_solving_not_research_method_duplicate",
        "contract_ids": ["d078-evaluate-evidence-and-limits"],
        "rationale": "Problem-solving in social-service practice may involve assessing a case, choosing a safe response and reviewing results. Evidence appraisal can inform a decision but does not replace professional practice standards, supervision or safeguarding.",
        "next_review": "Verify whether the occurrence is research, service delivery or case coordination; keep clinical practice and regulated social-work authority outside the D078 social-behaviour research boundary.",
    },
    "apply quality standards in social services": {
        "relation": "service_quality_governance_related_not_identical_to_evaluation",
        "contract_ids": ["d078-evaluate-evidence-and-limits"],
        "rationale": "Applying a service quality standard is a governance/compliance task; evaluation evidence may help judge outcomes, but it does not establish which standard applies or confer audit/inspection authority.",
        "next_review": "Identify the exact standard, jurisdiction, service and authorized role; source current Nigerian rules separately and do not present a research competency as legal or professional authorization.",
    },
    "apply statistical analysis techniques": {
        "relation": "quantitative_method_family_overlap_not_one_technique",
        "contract_ids": ["d078-quantitative-approach", "d078-evaluate-evidence-and-limits"],
        "rationale": "The phrase denotes a family of possible statistical procedures, not one named technique or software package. It overlaps quantitative methods while requiring the specific question, data, assumptions and interpretation to determine the appropriate technique.",
        "next_review": "Keep this optional occurrence separate from the essential-priority occurrence; establish the actual technique and role task before selecting software or a learning checkpoint.",
    },
    "archaeology": {
        "relation": "disciplinary_knowledge_not_duplicate_of_archival_research",
        "contract_ids": ["archival_and_historical_research"],
        "rationale": "Archaeology interprets material evidence and contexts; archival/historical research may complement some questions, but documents do not substitute for archaeological methods, material-culture training or field permissions.",
        "next_review": "Preserve this essential-priority pair separately from the optional archaeology pair. Verify the task, material evidence and Nigerian heritage/collection permissions; do not infer excavation authority or D078 breadth from priority.",
    },
    "art history": {
        "relation": "specialist_historical_visual_knowledge_gap_candidate",
        "contract_ids": ["archival_and_historical_research"],
        "rationale": "Art history interprets visual/material works in historical and cultural context; it can intersect with archival research but is not a duplicate of it or a general visual-analysis skill.",
        "next_review": "Confirm a specific role task, period and collection; Nigerian artistic contexts require appropriate local evidence and must not be replaced by UK/European examples alone.",
    },
    "assess risk factors": {
        "relation": "conditional_risk_assessment_not_generic_evidence_appraisal",
        "contract_ids": ["d078-evaluate-evidence-and-limits"],
        "rationale": "Risk assessment identifies hazards, likelihood, consequences and mitigation for a defined decision. Evidence appraisal may support it, but does not specify the risk framework or replace safeguarding, clinical, security or regulatory expertise.",
        "next_review": "Name the risk domain and decision owner before mapping; do not conflate research uncertainty with operational or individual-level risk assessment.",
    },
    "audit techniques": {
        "relation": "assurance_method_scope_gap_candidate",
        "contract_ids": [],
        "rationale": "Audit techniques depend on whether the task is financial, compliance, performance, data or research audit. They are not interchangeable with research quality checks or general evidence appraisal.",
        "next_review": "Resolve audit type, applicable standards and authorized role before adding content; do not imply an audit qualification or independent assurance authority from this label.",
    },
    "biology": {
        "relation": "bounded_interdisciplinary_biology_context_not_domain_foundation",
        "contract_ids": [],
        "rationale": "Biology may be needed as bounded context for research about life, health or populations, but it is not a shared social-science foundation. Keep essential and optional priority occurrences separate and determine which subfield the task needs.",
        "next_review": "Verify the exact source concept, biological subfield and downstream task; do not infer medical expertise or clinical scope. Nigerian population/health context requires locally appropriate evidence and safeguards.",
    },
    "biometrics": {
        "relation": "ambiguous_identity_biometrics_or_statistical_biometry_gap",
        "contract_ids": [],
        "rationale": "Biometrics may mean identity recognition from physical/behavioural traits or biometry/statistical analysis of biological measurements. These are different concepts and neither is established as a D078 foundation by the label.",
        "next_review": "Resolve the exact ESCO concept and task before selecting a learning path; if identity biometrics are intended, address privacy, error rates, security and alternatives. Nigerian data-protection sources establish context, not role prevalence or automatic task relevance.",
    },
    "bookkeeping regulations": {
        "relation": "jurisdiction_specific_accounting_rules_not_current_contract_item",
        "contract_ids": [],
        "rationale": "Bookkeeping/reporting rules are entity-, tax- and jurisdiction-specific. The introductory accounting-cycle resource can explain transactions, but does not establish Nigerian compliance duties or a D078 foundation.",
        "next_review": "Confirm the exact ESCO item and role task; check current primary Nigerian provisions for any specific recordkeeping claim and distinguish a research analyst's interpretation from accounting, audit or legal authority.",
    },
    "budgetary principles": {
        "relation": "public_finance_knowledge_gap_candidate",
        "contract_ids": [],
        "rationale": "Budget principles concern public resource planning, authorization, execution and accountability; they are related to public finance but are not the same as a research method or corporate accounting skill.",
        "next_review": "Resolve which level of government and budget cycle the role task concerns; do not infer a national, state or local mandate or make this a D078 foundation from a single optional occurrence.",
    },
    "business analytics": {
        "relation": "conditional_analytics_concept_not_specific_method_or_tool",
        "contract_ids": ["d078-quantitative-approach", "d078-evaluate-evidence-and-limits"],
        "rationale": "Business analytics may use data to describe or support organizational decisions, but it does not identify a particular method, software, causal claim or social-research task. Quantitative analysis and evidence appraisal may contribute without being equivalent.",
        "next_review": "Identify the decision, data, method and output in the source role task; do not generalize a private-sector analytics workflow to every D078 route.",
    },
    "cadastral taxation": {
        "relation": "specialist_tax_and_land_record_scope_gap_candidate",
        "contract_ids": [],
        "rationale": "Cadastral taxation concerns tax assessment linked to land/property records and depends on legal, valuation and geospatial context. It is not equivalent to general tax legislation, surveying or social spatial analysis.",
        "next_review": "Verify jurisdiction, tax type, valuation/cadastral task and authorized role; a Nigerian statute/listing or professional regulator source must be checked at exact provision and scope before content is proposed.",
    },
    "carry out strategic research": {
        "relation": "research_planning_task_overlaps_but_exceeds_design_candidate",
        "contract_ids": ["d078-research-question-design", "d078-evaluate-evidence-and-limits"],
        "rationale": "Strategic research can involve setting a decision-relevant question, selecting evidence and producing options; it may draw on research design but can include organizational priorities and commissioned outputs beyond design alone.",
        "next_review": "Confirm the source role, intended decision-maker, time horizon and actual deliverable before using the phrase as an area item; distinguish strategic research from strategic planning and routine data analysis.",
    },
    "cartography": {
        "relation": "mapping_representation_complements_not_equals_spatial_social_analysis",
        "contract_ids": ["d078-spatial-social-analysis"],
        "rationale": "Cartography concerns representing spatial information in maps; spatial social analysis asks social questions using place-based evidence. Map design can support that work but does not by itself provide spatial statistics, causal interpretation or social context.",
        "next_review": "Determine whether the role needs map design, GIS, spatial analysis or interpretation; check data quality, scale, projection and Nigerian boundary/source limitations before teaching or displaying a map workflow.",
    },
    "civil law": {
        "relation": "jurisdiction_specific_legal_knowledge_gap_candidate",
        "contract_ids": [],
        "rationale": "Civil law can mean a legal tradition or a body of private law, depending on context. It is not a social-science method and must not be conflated with the civil-law legal system versus criminal law.",
        "next_review": "Resolve exact source meaning, jurisdiction and task; use current primary law and qualified legal interpretation where needed, and do not imply legal-advice authority or a D078-wide requirement.",
    },
    "commercial law": {
        "relation": "jurisdiction_specific_commercial_legal_knowledge_gap_candidate",
        "contract_ids": [],
        "rationale": "Commercial law concerns rules governing business transactions and entities in a specific legal system. It may contextualize economic research but is distinct from business studies, policy analysis, accounting and legal advice.",
        "next_review": "Identify the exact legal subject, Nigerian jurisdiction/instrument and role task; retain it as a bounded knowledge candidate until current primary sources and a suitable learner resource are verified.",
    },
    "communication": {
        "relation": "broad_communication_capability_overlap_not_specific_output",
        "contract_ids": ["d078-communicate-evidence"],
        "rationale": "Communication is a broad capability; the existing contract item is specifically about explaining and reporting evidence. Do not treat the broad label as identical to every form of public, interpersonal, media or policy communication.",
        "next_review": "Determine audience, purpose, medium and role task before linking a communication learning checkpoint; preserve the optional source priority as a separate occurrence, not proof of a shared requirement.",
    },
    "computer simulation": {
        "relation": "computational_model_experiment_not_generic_quantitative_analysis",
        "contract_ids": ["d078-quantitative-approach", "d078-evaluate-evidence-and-limits"],
        "rationale": "Computer simulation runs a specified computational model under assumptions to explore possible outcomes. It may use quantitative methods but is not interchangeable with statistical analysis, prediction or evidence appraisal.",
        "next_review": "Verify the model, assumptions, data and decision use in the role task; distinguish scenario exploration from forecast validation and causal evidence, and do not imply general D078 or Nigerian role demand from the label.",
    },
}


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def build() -> dict[str, Any]:
    task = load(TASK_SETS)
    contract = load(CONTRACT)
    all_items = [
        (batch, item)
        for batch in task.get("role_item_research_batches", [])
        for item in batch.get("items", [])
    ]
    reviewed: list[dict[str, Any]] = []
    seen: set[tuple[str, str]] = set()
    if len(all_items) < RECONCILE_FIRST_N:
        raise ValueError(f"Need at least {RECONCILE_FIRST_N} researched items; ledger currently has {len(all_items)}")
    for batch, item in all_items[:RECONCILE_FIRST_N]:
        label = item["canonical_label_snapshot"]
        key = (label, item["source_priority_snapshot"])
        if key in seen:
            raise ValueError(f"Duplicate researched role-item pair: {key}")
        seen.add(key)
        decision = CROSSWALK.get(label)
        if decision is None:
            raise ValueError(f"Missing local reconciliation for researched item: {label}")
        reviewed.append({
            "item_key": item["item_key"],
            "label": label,
            "priority": item["source_priority_snapshot"],
            "occurrence_count": item["occurrence_count"],
            "batch_id": batch["batch_id"],
            "agent_category_rationale": item.get("category_rationale"),
            "agent_source_identity_state": item.get("exact_source_concept_type"),
            "global_evidence_source_ids": item.get("global_evidence_source_ids", []),
            "nigeria_evidence_source_ids": item.get("nigeria_evidence_source_ids", []),
            "nigeria_context": item.get("nigeria_context_explicitly_labelled"),
            "concept_reconciliation": decision,
            "role_task_relationship_verified": False,
            "source_concept_identity_fully_verified": False,
            "checkpoint_placement_approved": False,
            "student_display_approved": False,
        })

    lane_reviewed: list[dict[str, Any]] = []
    lane_seen: set[tuple[str, str]] = set()
    for lane_path in LANE_BATCHES:
        lane = load(lane_path)
        lane_schema = lane.get("schema_version", "")
        accepted_schema = lane_schema.startswith("2026-10-09.d078-role-item-lane-research.") or lane_schema.startswith("2026-10-09.d078.role-item-source-research.")
        if not accepted_schema or lane.get("student_display_approved", False) or lane.get("display_approved", False):
            raise ValueError(f"Unexpected or non-review-only D078 lane batch: {lane_path}")
        lane_records = lane.get("pair_research", lane.get("records", []))
        for item in lane_records:
            label = item.get("label")
            priority = item.get("priority")
            if not label or not priority:
                raw_key = item.get("pair_key", "")
                parts = raw_key.split("|")
                if len(parts) >= 2:
                    label, priority = parts[-2], parts[-1]
            if not label or not priority:
                raise ValueError(f"Missing normalized label/priority in agent lane item: {lane_path}")
            key = (label, priority)
            if key in seen or key in lane_seen:
                raise ValueError(f"Duplicate role-item pair across reconciled sources: {key}")
            lane_seen.add(key)
            decision = CROSSWALK.get(label)
            if decision is None:
                raise ValueError(f"Missing local reconciliation for agent lane item: {label}")
            lane_reviewed.append({
                "item_key": f"{label}|{priority}",
                "label": label,
                "priority": priority,
                "occurrence_count": item.get("occurrence_count", item.get("occurrences", 0)),
                "batch_id": f"{lane.get('lane_id', lane.get('checkpoint', 'lane-checkpoint'))}",
                "source_lane_artifact": str(lane_path.relative_to(ROOT)),
                "agent_source_identity_state": item.get("source_concept", {}).get("exact_identity") or item.get("concept_identity"),
                "global_evidence": item.get("global_evidence", []),
                "nigeria_context": item.get("nigeria_context", item.get("nigeria_evidence", {})),
                "task_rationale": item.get("task_rationale") or item.get("meaning_and_task"),
                "unresolved_checks": item.get("unresolved_checks", item.get("open_gaps", [])),
                "concept_reconciliation": decision,
                "role_task_relationship_verified": False,
                "source_concept_identity_fully_verified": False,
                "checkpoint_placement_approved": False,
                "student_display_approved": False,
            })
    reviewed.extend(lane_reviewed)

    coverage = task.get("role_item_research_coverage", {})
    reported = coverage.get("distinct_pairs_researched_in_this_batch")
    if reported != len(all_items):
        raise ValueError(f"Ledger reports {reported} researched pairs but contains {len(all_items)}")
    contract_ids = {
        item["id"]
        for group in ("existing_inventory", "foundation_and_route_additions", "route_alternatives", "deep_search_options")
        for item in contract.get(group, [])
    }
    missing_targets = sorted({
        target
        for row in reviewed
        for target in row["concept_reconciliation"].get("contract_ids", [])
        if target not in contract_ids
    })
    if missing_targets:
        raise ValueError(f"Crosswalk references missing learning-contract IDs: {missing_targets}")

    disposition_counts: dict[str, int] = {}
    for item in reviewed:
        relation = item["concept_reconciliation"]["relation"]
        disposition_counts[relation] = disposition_counts.get(relation, 0) + 1
    reconciled_occurrences = sum(item["occurrence_count"] for item in reviewed)
    lane_occurrences = sum(item["occurrence_count"] for item in lane_reviewed)
    return {
        "schema_version": "2026-10-09.d078.role-item-reconciliation.v1",
        "reviewed_on": "2026-10-09",
        "domain_id": "D078",
        "status": "local_concept_crosswalk_only_not_checkpoint_or_display_approval",
        "source_inputs": [str(TASK_SETS.relative_to(ROOT)), str(CONTRACT.relative_to(ROOT)), *[str(path.relative_to(ROOT)) for path in LANE_BATCHES]],
        "scope": "Reconcile completed primary-ledger role-list item research and explicitly identified agent lane batches with the current D078 learning-item candidate inventory. Agent lane batches remain separate research artifacts and are not silently merged into the source ledger. This is content de-duplication and conceptual crosswalking only; not role-fit adjudication or taxonomy/mapping work.",
        "guardrails": [
            "Role-list occurrence counts do not prove item identity, role-task support, area ownership, or a shared domain foundation.",
            "A conceptual overlap is not proof that two labels are the same ESCO concept; exact concept identity remains independently checked.",
            "No role, domain, area, API, SQL, matcher, or canonical learning item is changed by this reconciliation.",
            "Global and Nigeria-specific evidence remain separately labelled; local examples do not become nationwide requirements.",
            "All records remain hidden pending exact claim, checkpoint, task, relationship and learning-resource gates.",
        ],
        "coverage": {
            "current_areas": task.get("coverage_counts", {}).get("current_areas"),
            "supported_roles_in_scope": task.get("coverage_counts", {}).get("supported_d078_role_records_in_scope"),
            "requested_first_n_scope": RECONCILE_FIRST_N,
            "researched_pairs_reconciled": len(reviewed),
            "primary_ledger_pairs_researched": coverage.get("distinct_pairs_researched_in_this_batch"),
            "agent_lane_pairs_reconciled": len(lane_reviewed),
            "researched_pairs_total_so_far": coverage.get("distinct_pairs_researched_in_this_batch", 0) + len(lane_reviewed),
            "primary_ledger_pairs_not_reconciled": len(all_items) - RECONCILE_FIRST_N,
            "researched_pairs_not_in_this_reconciliation": len(all_items) - RECONCILE_FIRST_N,
            "all_role_item_pairs_in_inventory": coverage.get("distinct_label_priority_pairs_total"),
            "pairs_remaining": coverage.get("distinct_pairs_remaining", 0) - len(lane_reviewed),
            "role_item_occurrences_reconciled": reconciled_occurrences,
            "primary_ledger_occurrences_researched_total": coverage.get("occurrences_in_this_batch"),
            "agent_lane_occurrences_reconciled": lane_occurrences,
            "role_item_occurrences_researched_total": coverage.get("occurrences_in_this_batch", 0) + lane_occurrences,
            "role_item_occurrences_not_in_this_reconciliation": coverage.get("occurrences_in_this_batch", 0) - sum(item["occurrence_count"] for item in reviewed[:RECONCILE_FIRST_N]),
            "role_item_occurrences_remaining": coverage.get("occurrences_remaining", 0) - lane_occurrences,
            "concept_relation_counts": disposition_counts,
            "role_task_relationships_verified": 0,
            "source_concept_identities_fully_verified": 0,
            "checkpoint_placements_approved": 0,
            "student_display_approved": 0,
        },
        "items": reviewed,
        "canonical_files_modified": False,
    }


def write_markdown(data: dict[str, Any]) -> None:
    coverage = data["coverage"]
    lines = [
        "# D078 researched role-item reconciliation — 2026-10-09",
        "",
        "**Status:** Local conceptual crosswalk only; not checkpoint approval, canonical promotion, or student guidance.",
        "",
        data["scope"],
        "",
        f"Reconciled {coverage['primary_ledger_pairs_researched']} primary-ledger pairs plus {coverage['agent_lane_pairs_reconciled']} pairs from the separately preserved agent lane batch ({coverage['researched_pairs_reconciled']} crosswalk entries total). The primary task-set ledger itself still records {coverage['primary_ledger_pairs_researched']} researched pairs; lane findings are not silently merged into it. {coverage['primary_ledger_pairs_not_reconciled']} additional primary-ledger pairs, if any, remain outside this crosswalk. After counting this batch, the queue has {coverage['pairs_remaining']} of {coverage['all_role_item_pairs_in_inventory']} pairs remaining. This is not the complete D078 inventory.",
        "",
        "## Reconciliation rule",
        "",
        "The agent's evidence was crosswalked against existing D078 learning candidates to identify same-concept candidates, partial overlap and uncovered knowledge/task concepts. A crosswalk link means ‘review these together’; it does not assert that the ESCO source concepts are identical, that a role performs the task, or that the item belongs in a domain/area/role checkpoint. Exact ESCO identity, role-task relation, checkpoint fit and student resource checks remain separate.",
        "",
        "## Item-by-item crosswalk",
        "",
        "| Researched source label | Priority / occurrences | Local content reconciliation | Related learning candidate(s) | Open question |",
        "|---|---:|---|---|---|",
    ]
    for item in data["items"]:
        decision = item["concept_reconciliation"]
        targets = ", ".join(f"`{x}`" for x in decision.get("contract_ids", [])) or "No current item-level match"
        lines.append(
            f"| {item['label']} | {item['priority']} / {item['occurrence_count']} | {decision['relation']}: {decision['rationale']} | {targets} | {decision['next_review']} |"
        )
    lane_items = [item for item in data["items"] if item.get("source_lane_artifact")]
    if lane_items:
        lines.extend(["", "## Separately preserved agent-lane evidence", "", "This evidence is reproduced for auditability from the lane artifact; source claims, exact concept identity and task ownership remain subject to their listed unresolved checks.", ""])
        for item in lane_items:
            lines.extend([
                f"### {item['label']} / {item['priority']} ({item['occurrence_count']} occurrences)",
                "",
                f"- Lane artifact: `{item['source_lane_artifact']}`; batch `{item['batch_id']}`.",
                f"- Source-concept identity state: {item.get('agent_source_identity_state') or 'not supplied'}.",
                f"- Task rationale: {item.get('task_rationale') or 'not supplied'}.",
            ])
            for source in item.get("global_evidence", []):
                lines.append(f"- Global source: [{source.get('url')}]({source.get('url')}) — {source.get('locator', 'locator not supplied')}. Supports: {source.get('supports', 'not stated')} Limits: {source.get('limits', 'not stated')}")
            nigeria = item.get("nigeria_context") or {}
            if nigeria.get("claim"):
                lines.append(f"- Nigeria-specific context: {nigeria['claim']}")
            for source in nigeria.get("sources", []):
                lines.append(f"  - [{source.get('url')}]({source.get('url')}) — {source.get('locator', 'locator not supplied')}. Supports: {source.get('supports', 'not stated')} Limits: {source.get('limits', 'not stated')}")
            checks = item.get("unresolved_checks", [])
            lines.append(f"- Unresolved checks: {'; '.join(checks) if checks else 'none recorded by lane artifact'}.")
            lines.append("")

    lines.extend([
        "",
        "## Current disposition",
        "",
        f"- {coverage['researched_pairs_reconciled']} item-label/priority pairs (all currently researched pairs) have been reconciled at the **concept-crosswalk** level.",
        f"- {coverage['primary_ledger_pairs_not_reconciled']} additional researched pairs in the primary ledger are not covered by this crosswalk; later agent-lane files not listed as inputs also remain to be reconciled.",
        f"- {coverage['role_task_relationships_verified']} of these are accepted as role-task relationships; the source ledger explicitly leaves the exact role-task connection unresolved.",
        f"- {coverage['source_concept_identities_fully_verified']} exact source-concept identities are considered fully verified in this reconciliation.",
        f"- {coverage['checkpoint_placements_approved']} checkpoint placements and {coverage['student_display_approved']} student-facing items are approved.",
        f"- Remaining queue after the reconciled lane batch: **{coverage['pairs_remaining']} pairs / {coverage['role_item_occurrences_remaining']} role-list occurrences** (the primary ledger has not been rewritten).",
        "",
        "## Guardrails and next action",
        "",
        *[f"- {note}" for note in data["guardrails"]],
        "- Continue the disjoint item-research lanes from their checkpoints. Re-run this local crosswalk after each checkpoint; extend `CROSSWALK` with explicit rationale for every new pair, and keep any unmapped item as an error rather than silently dropping it.",
        "- After the full item/task-set pass, reconcile source identity, role task, route applicability, alternatives and limits together. Only then decide which items are shared foundations, useful edges, conditional route content or unsupported after exhaustive search.",
        "",
        f"Machine-readable record: `{OUT_JSON.relative_to(ROOT).as_posix()}`",
    ])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    result = build()
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_markdown(result)
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "coverage": result["coverage"]}, ensure_ascii=False, indent=2))
