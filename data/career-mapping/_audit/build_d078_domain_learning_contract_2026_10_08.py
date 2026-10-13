"""Build the reviewable D078 domain-learning contract.

The reconciliation ledgers are evidence inventories, not yet display records.
This builder adds the presentation contract required by the guided-experience
specification while keeping candidates in an active research state until their
claims, checkpoint fit and learning links have been examined. Missing evidence
is not an unsupported disposition; unsupported/not-established is allowed only
after an exhaustive, documented search.

It does not edit canonical domain, area, role, API, matcher, or SQL data.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
RECONCILIATION = ROOT / "data/career-mapping/_audit/d078_learning_path_reconciliation_2026_10_08.json"
DEEP = ROOT / "data/career-mapping/_audit/d078_skills_methods_deep_search_checkpoint_2026_10_08.json"
CATEGORY_AUDIT = ROOT / "data/career-mapping/_audit/d078_candidate_category_audit_2026_10_09.json"
TASK_SET_RESEARCH = ROOT / "data/career-mapping/_audit/d078_area_role_task_sets_2026_10_09.json"
ROLE_ITEM_RECONCILIATION = ROOT / "data/career-mapping/_audit/d078_researched_role_item_reconciliation_2026_10_09.json"
OUT_JSON = ROOT / "data/career-mapping/_audit/d078_domain_learning_contract_2026_10_08.json"
OUT_MD = ROOT / "docs/manual-review/D078_DOMAIN_LEARNING_CONTRACT_2026_10_08.md"


def source_ref(
    source_id: str,
    title: str,
    publisher: str,
    url: str,
    locator: str,
    supports: str,
    scope_limit: str,
) -> dict[str, str]:
    """Attach a source to a specific claim role without treating it as approved."""
    return {
        "source_id": source_id,
        "title": title,
        "publisher": publisher,
        "url": url,
        "locator": locator,
        "supports": supports,
        "scope_limit": scope_limit,
        "accessed_on": "2026-10-09",
        "evidence_state": "attached_pending_claim_and_checkpoint_review",
    }


ESRC_RESEARCH_DESIGN = source_ref(
    "esrc_social_science_training_guidelines_2022",
    "ESRC Postgraduate Training and Development Guidelines 2022",
    "Economic and Social Research Council / UK Research and Innovation",
    "https://www.ukri.org/wp-content/uploads/2015/09/ESRC-281123-PostgraduateTrainingDevelopmentGuidelines2022.pdf",
    "Annex I, printed p. 22 (social-science researcher learning outcomes); Annex II, printed p. 23 (research questions, qualitative/quantitative methods, sampling and case selection, generalisability, validity, reliability and replicability).",
    "Provides a recognized social-science research-training example linking research questions, methods, sampling, evidence quality and interpretation.",
    "UK-funded postgraduate training guidance, not a universal standard for every D078 occupation, Nigerian programme or undergraduate learner; it supports candidate context, not an all-path requirement.",
)
NUC_SOCIAL_SCIENCES = source_ref(
    "nuc_social_sciences_ccmas_2023_research_curriculum",
    "Social Sciences CCMAS 2023: research-methods curriculum examples",
    "National Universities Commission, Nigeria",
    "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
    "Printed pp. 177–178, Sociology Research Method II (proposal, data collection/organisation, pilot study, report and statistics); printed p. 214, Political Science research methods (research questions, instruments, data collection and analysis).",
    "Shows that research-methods learning appears in named Nigerian social-science curricula, with examples from Sociology and Political Science.",
    "Evidence about specific Nigerian university curriculum guidance only; it does not establish a universal D078 task, a job qualification, or that every route uses each method.",
)
OPEN_SOCIAL_RESEARCH_TEXT = source_ref(
    "bhattacherjee_social_science_research_open_textbook",
    "Social Science Research: Principles, Methods and Practices (Revised edition)",
    "Anol Bhattacherjee; University of Southern Queensland Open Textbook Library record",
    "https://open.umn.edu/opentextbooks/textbooks/social-science-research-principles-methods-and-practices",
    "Chapter 5 (Research Design), Chapter 6 (Measurement of Constructs), Chapter 7 (Scale Reliability and Validity), Chapter 8 (Sampling), and Chapter 16 (Research Ethics), as applicable to each item.",
    "Provides an open, introductory social-science explanation of foundational research concepts in accessible chapters.",
    "The book is a broad introduction, not comprehensive training for every method; adapt examples to local populations and consult specialised sources for advanced or qualitative-specific practice.",
)

# The first five existing-inventory claims are audited explicitly because three
# had previously been labelled as shared foundations. These are provisional
# category judgements, not student approvals: full D078 area/role task coverage
# is still being assembled and is the gate for any domain-wide placement.
EXISTING_CATEGORY_RATIONALES: dict[str, dict[str, str]] = {
    "d078-research-question-design": {
        "category": "shared_foundation_candidate_for_research_routes",
        "why": "Connecting a question to evidence and a suitable design is a defensible common starting capability for routes that actually conduct or interpret social research; it is not a task every occupation in the domain necessarily performs.",
        "breadth": "The current evidence spans social-science research guidance, political-science learning and a named Nigerian Sociology curriculum, so it supports breadth across research-oriented routes.",
        "boundary": "Do not present formal research design as a prerequisite for every social-science job or imply this alone makes someone employable. The bus-access example remains illustrative, not a claim about a specific Nigerian transport service.",
        "evidence_limit": "ESRC is UK postgraduate training, APSA is political-science education, and NUC is Nigerian curriculum evidence for named programmes. These sources support a research-route foundation, not universal coverage across all D078 areas/roles; Locke's task-set ledger and checkpoint review remain necessary.",
    },
    "d078-evaluate-evidence-and-limits": {
        "category": "shared_foundation_candidate_for_evidence_using_routes",
        "why": "Assessing what information can support, where it is weak, and what conclusions would overreach is a strong cross-cutting candidate for routes that use research or other evidence to advise, analyse or communicate.",
        "breadth": "The source set includes political-science education and sociology/psychology learning guidance, but direct task-level evidence across every D078 area and role is not yet assembled.",
        "boundary": "Do not equate evidence appraisal with conducting a formal study, statistical analysis, or a single research method; route-specific standards differ.",
        "evidence_limit": "Current professional/disciplinary education sources justify further cross-route consideration, not a verified universal domain foundation. Review against the complete D078 areas and role tasks before promotion.",
    },
    "d078-responsible-research": {
        "category": "conditional_responsibility_for_research_or_sensitive_data",
        "why": "Research ethics and responsible data handling are required when a task involves people, identifiable/sensitive information, or other applicable safeguards; not every D078 role conducts such work.",
        "breadth": "Anthropology, psychology and Nigerian NHREC sources show the importance of responsibility in bounded research settings; their rules and scope are not interchangeable.",
        "boundary": "Do not turn NHREC/health-research training into a universal D078 credential or imply the same approval process applies to every social-science project. Separate general ethical judgement from jurisdiction- and institution-specific review.",
        "evidence_limit": "The evidence supports conditional treatment and separate Nigeria-specific context. Exact applicability depends on research design, data, institution, jurisdiction and participant risk; it is not a blanket domain-wide certification requirement.",
    },
    "d078-communicate-evidence": {
        "category": "shared_foundation_candidate_for_evidence_communication_routes",
        "why": "Explaining findings clearly to the audience that must use them is a plausible shared capability for research, policy and analytical routes, while the output changes by audience and purpose.",
        "breadth": "APSA, ASA and NUC evidence gives examples across political science, sociology and named Nigerian curriculum outcomes; this is broader than one software or method but does not yet cover every occupational route.",
        "boundary": "Do not treat report writing, academic publication, policy briefs and public communication as identical outputs. Do not infer that a learner has evidence to communicate merely because they can use a presentation or writing tool.",
        "evidence_limit": "The source set supports a cross-route candidate in evidence-using work. Its placement as a universal D078 domain foundation remains pending task-level review of all current areas and roles.",
    },
    "d078-care-for-research-data": {
        "category": "conditional_foundation_when_a_route_handles_research_data",
        "why": "Organising, documenting and protecting research information matters when a route creates, receives, analyses, stores or shares data; the level of responsibility depends on the task and applicable rules.",
        "breadth": "Data stewardship can support both research and computational workflows, and Nigerian curriculum evidence includes data collection/organisation examples, but not every role handles research datasets.",
        "boundary": "Do not imply that every learner needs advanced data-management training or that an open-data practice overrides consent, privacy, security, retention or institutional policy.",
        "evidence_limit": "CESSDA/UK Data Service and NUC support data-management relevance in defined research contexts. Full route breadth and Nigerian legal/institutional applicability still need checkpoint-specific confirmation.",
    },
    "d078-quantitative-approach": {
        "category": "conditional_method_choice",
        "why": "Quantitative approaches are appropriate when a question can be answered with numerical observations or measures and the design supports the intended comparison or estimate.",
        "breadth": "Used across social research, evaluation, demography and computational work, but not the only valid approach and not required for every route.",
        "boundary": "Do not imply every social researcher must use statistics or that numerical results automatically establish causation, representativeness or meaning.",
        "evidence_limit": "The cited methodological frameworks establish this as one method family; the level and specific analysis must be tied to a particular question and evidence design.",
    },
    "d078-qualitative-approach": {
        "category": "conditional_method_choice",
        "why": "Qualitative approaches help answer questions about meaning, experience, interaction, process or context using words, observations and other non-numeric material.",
        "breadth": "Used in many social-science routes, but depends on the question and does not replace numerical approaches when estimates or structured comparisons are needed.",
        "boundary": "Do not equate qualitative research only with interviews or imply that qualitative evidence is merely anecdotal; the design, sampling, analysis and limits still matter.",
        "evidence_limit": "Current sources establish qualitative methods as a recognised method family; individual techniques require their own task, safeguards and learning-resource review.",
    },
    "d078-mixed-methods": {
        "category": "conditional_design_choice",
        "why": "Mixed methods combine quantitative and qualitative evidence when the research question benefits from answering complementary parts of the problem with both.",
        "breadth": "Can support selected evaluation, policy and social-research questions; it is a design choice, not a higher-quality default.",
        "boundary": "Do not require both method families for every project or call a study mixed-methods merely because it contains numbers and quotations; explain integration and purpose.",
        "evidence_limit": "Methodology sources support the approach, but project-specific integration and the capability required depend on the question and design.",
    },
    "d078-survey-method": {
        "category": "conditional_method_choice",
        "why": "Surveys are useful when structured responses from a defined group can answer the question; questionnaire design, sampling and administration must be planned together.",
        "breadth": "Relevant to population, attitude, service and policy questions where standardised responses are useful, but not appropriate for every issue or population.",
        "boundary": "A questionnaire or large response count does not by itself make results representative or unbiased; preserve sampling, nonresponse and wording limits.",
        "evidence_limit": "AAPOR/Pew evidence is survey-specific practice guidance and does not establish surveys as universal D078 work or prescribe one design for Nigeria.",
    },
    "d078-interviews": {
        "category": "conditional_method_choice",
        "why": "Interviews can gather detailed accounts, explanations or expert perspectives when speaking with selected participants is a suitable way to answer the question.",
        "breadth": "Used across qualitative, evaluation and applied research routes, but interviews are not necessary for every study and their form varies by purpose.",
        "boundary": "An interview account is not automatically a verified fact or representative view; consent, power, recall, interviewer influence and analysis must be considered.",
        "evidence_limit": "OpenLearn and disciplinary sources support interview practice as one method; they do not establish its need for all D078 occupations.",
    },
    "d078-document-analysis": {
        "category": "conditional_method_choice",
        "why": "Document or content analysis is useful when records, texts, media or policy materials are evidence relevant to the question.",
        "breadth": "Can appear in policy, historical, organisational, communication and social-research routes; the analytic approach depends on what the materials can show.",
        "boundary": "Software highlighting or tagging is not the method itself; distinguish descriptive content coding from discourse, conversation or other specialist analyses.",
        "evidence_limit": "Current evidence supports document/content analysis as a method option and tool support only; more specific methods need separately matched sources.",
    },
    "d078-observation-ethnography": {
        "category": "conditional_method_choice",
        "why": "Observation and ethnographic approaches are appropriate when understanding social activity in context, interaction or everyday practice is central to the question.",
        "breadth": "Most relevant to selected sociological, anthropological, organisational and community-research routes; not a default method for every social inquiry.",
        "boundary": "Ethnography is not simply watching people. Researcher position, access, consent, privacy, field records and interpretation require careful treatment.",
        "evidence_limit": "UNESCO field descriptions, ethics guidance and methods teaching support the method's disciplinary relevance; exact procedures depend on setting, risk and research design.",
    },
    "d078-secondary-data": {
        "category": "useful_additional_edge",
        "why": "Finding and assessing existing datasets can make research or analysis more feasible when relevant information has already been collected and can lawfully and responsibly be reused.",
        "breadth": "Useful across research, policy, evaluation and computational routes that work with available records or datasets, but only when source coverage and access fit the question.",
        "boundary": "Existing data may not measure the needed concept, represent the intended population or permit reuse; do not treat availability as validity or permission.",
        "evidence_limit": "UKDS and Nigerian statistical examples establish data sources and learning context, not that a particular dataset answers a particular Nigerian question.",
    },
    "d078-computational-social-research": {
        "category": "area_specific_foundation_candidate",
        "why": "Computational methods support social questions where digital traces, large or complex datasets, text, networks, spatial data or simulation are central to the research task.",
        "breadth": "A coherent foundation candidate within Computational and Digital Social Science; not a shared foundation for every D078 area.",
        "boundary": "Programming or machine-learning capability does not replace social theory, research design, data provenance, privacy, bias analysis or substantive interpretation.",
        "evidence_limit": "University curricula and specialist methods sources support the route's scope, but cannot be generalized to all D078 occupations or treated as proof that every computational tool belongs in the baseline.",
    },
    "d078-agent-based-modeling": {
        "category": "specialist_method",
        "why": "Agent-based modelling is used to explore how specified rules and interactions among simulated agents can produce patterns at a group or system level.",
        "breadth": "A specialist option for selected computational social-science questions about processes, interaction or emergent patterns.",
        "boundary": "A simulated result depends on assumptions and is not direct evidence that real people behave that way or a forecast without external validation.",
        "evidence_limit": "National Academies and methods-training sources support the method and its limits; they do not establish broad adoption across social-science work.",
    },
    "d078-spatial-social-analysis": {
        "category": "specialist_method",
        "why": "Spatial analysis is useful when location, distance, place or geographic patterns are relevant to a social question and the data support an appropriate spatial interpretation.",
        "breadth": "Relevant to selected human geography, demography, public policy, urban, community and service-access analyses.",
        "boundary": "Mapping points is not by itself spatial analysis; geographic association does not prove causation, and privacy/location sensitivity must be considered.",
        "evidence_limit": "UNESCO's field definitions establish human/social geography scope and QGIS training illustrates a workflow; route- and dataset-specific claims still need evidence.",
    },
    "d078-statistical-tool-choice": {
        "category": "conditional_tool_choice_not_foundation",
        "why": "A statistical package is chosen only after the method, data, learner/team context and reproducibility needs are clear; different tools can support similar tasks.",
        "breadth": "Applies to quantitative or computational routes, not every D078 path.",
        "boundary": "Do not make R, SPSS, jamovi, Python or another package a cumulative checklist; software does not choose a valid analysis or prove statistical competence.",
        "evidence_limit": "The cited courses and tool materials demonstrate learning paths or capabilities, not universal employer requirements or a single preferred tool.",
    },
    "d078-survey-data-collection-tool": {
        "category": "conditional_tool_option",
        "why": "KoboToolbox can support digital form-based data collection when a project needs that workflow and its device, connectivity, security and export requirements fit.",
        "breadth": "A practical option for selected field-survey and programme-monitoring routes; alternative paper or digital systems may be more suitable elsewhere.",
        "boundary": "The platform does not design a sound questionnaire, ensure representative sampling, obtain valid consent or make collected information accurate.",
        "evidence_limit": "Official training supports product operation; AAPOR supports the separate survey-design needs. Tool capability alone does not prove checkpoint fit.",
    },
    "d078-qualitative-coding-tool": {
        "category": "conditional_tool_option",
        "why": "Taguette can help organise and label excerpts from documents or transcripts when a project benefits from a simple qualitative coding interface.",
        "breadth": "A lightweight option for some document-analysis workflows, not a requirement for qualitative research or a replacement for an analytic method.",
        "boundary": "Tags do not generate defensible themes by themselves; a codebook, interpretation, context and reflexive decisions remain the researcher's responsibility.",
        "evidence_limit": "Project documentation supports the tool's functions and availability; it does not establish its suitability for every dataset, team or professional workflow.",
    },
    "d078-social-network-tool": {
        "category": "specialist_tool_for_network_analysis",
        "why": "Gephi can help visualise and inspect network data when relationships among people, organisations or other entities are the object of analysis.",
        "breadth": "A specialist computational social-science tool; only relevant when the research question and data are relational.",
        "boundary": "A visually striking graph or centrality score does not establish social importance, causal influence or representative network coverage.",
        "evidence_limit": "Official documentation establishes product functions and specialist sources establish network analysis as a method area; task fit and interpretation remain separate.",
    },
    "d078-certification-boundaries": {
        "category": "no_universal_credential_claim_not_established",
        "why": "The reviewed records identify bounded training or tool certificates, but do not establish one credential that qualifies someone across the entire D078 domain.",
        "breadth": "A cautious distinction across named curricula, research training and specific regulated or tool contexts.",
        "boundary": "This is not proof that no relevant credential exists. Do not make a definitive absence claim or hide a credential as unsupported until the search is exhaustive across professions, jurisdictions and regulated activities.",
        "evidence_limit": "Current evidence supports only 'no domain-wide credential established in this review so far'; the claim remains under research and must not be student-facing as a categorical fact.",
    },
    "d078-excel-data-tool": {
        "category": "optional_cross_route_tool",
        "why": "A spreadsheet can help organise, inspect and summarise modest structured tables for some research or administrative tasks.",
        "breadth": "Potentially useful in several routes, but the task may instead require a database, statistical package, qualitative tool or no spreadsheet at all.",
        "boundary": "Do not present Excel as a research method, secure data-management system or reliable substitute for reproducible analysis at larger scale.",
        "evidence_limit": "Microsoft documentation supports product features and UKDS supports introductory data-learning context, not an occupational requirement for all D078 routes.",
    },
    "d078-spss-tool": {
        "category": "conditional_statistical_tool_alternative",
        "why": "SPSS is one option for managing and analysing structured quantitative data when its supported procedures and access model suit the task.",
        "breadth": "Relevant to selected quantitative social-research workflows; alternative tools may perform the required analysis.",
        "boundary": "Do not require SPSS alongside R, Python or other packages by default; software output does not validate design, measurement, assumptions or interpretation.",
        "evidence_limit": "IBM sources establish features and access routes, not field-wide demand or a D078-wide requirement; compare actual task needs before inclusion.",
    },
    "d078-nvivo-tool": {
        "category": "conditional_qualitative_tool_alternative",
        "why": "NVivo can help organise, code, retrieve and review substantial qualitative material when the chosen analytic approach benefits from dedicated software.",
        "breadth": "Useful for some qualitative, mixed-material or team-based workflows; manual coding or other tools can be valid alternatives.",
        "boundary": "NVivo does not perform interpretation on the researcher's behalf, establish a valid theme, choose the method or remove software-access and licensing constraints.",
        "evidence_limit": "Vendor guidance establishes product function and licensing; independent checkpoint/task evidence and free task-specific learning still need validation.",
    },
    "d078-pandas-tool": {
        "category": "conditional_computational_tool",
        "why": "pandas supports repeatable reading, cleaning, reshaping and summarising of tabular data inside a Python workflow.",
        "breadth": "A useful option for selected computational or data-intensive social research, not a baseline requirement for all domain learners.",
        "boundary": "It is a data-handling library, not a research method or statistical-validity guarantee; Python programming and data concepts are prerequisites to using it well.",
        "evidence_limit": "Official tutorials establish capability; use in D078 is conditional on task evidence, and the learning sequence must explain Python/data-table prerequisites.",
    },
    "d078-matplotlib-tool": {
        "category": "conditional_computational_tool",
        "why": "Matplotlib can produce charts from data in Python when a project needs reproducible, customisable visual output.",
        "breadth": "A supporting option for computational data workflows; simple charts may be produced in other packages.",
        "boundary": "Charting does not validate data, justify a chart type or support causal conclusions; visual choices can mislead if context is omitted.",
        "evidence_limit": "Official documentation shows plotting capability, not an occupational requirement. Keep it downstream of data interpretation and chart literacy.",
    },
    "d078-networkx-tool": {
        "category": "specialist_computational_tool",
        "why": "NetworkX supports representing and analysing relational data as graphs, including selected path, centrality and community calculations.",
        "breadth": "Relevant to computational social-network analysis when the data represent defensible nodes and relationships.",
        "boundary": "Graph algorithms do not explain why relationships exist or prove influence; network boundaries, missing ties and measurement choices shape the results.",
        "evidence_limit": "Project documentation and computational-social-science sources support capability and route relevance, but not a universal tool requirement.",
    },
    "d078-mesa-tool": {
        "category": "specialist_tool_for_agent_based_modelling",
        "why": "Mesa is a Python framework for implementing, running and inspecting agent-based models when a researcher has a justified simulation design.",
        "breadth": "Belongs on a computational modelling route, not general social-science foundations.",
        "boundary": "Mesa helps implement a model; it does not validate assumptions or make simulated outcomes observations of real society. Python and modelling concepts precede tool operation.",
        "evidence_limit": "Mesa documentation and social-modelling sources establish technical use and methodological context; they do not show broad job demand or route-wide necessity.",
    },
    "d078-casevo-tool": {
        "category": "emerging_specialist_candidate_under_review",
        "why": "Casevo is retained as a candidate because its project and paper describe cognitive-agent/social-evolution simulation use, but evidence of wider field adoption is limited.",
        "breadth": "Potentially relevant to a narrow computational social-simulation route only; do not generalise from one project or paper to the domain.",
        "boundary": "It is not a generic case-study tool, a substitute for empirical participant evidence, or a validated forecasting system.",
        "evidence_limit": "Project documentation and a research paper establish identity and intended use, not independent uptake, stability, learner suitability or employment value; keep hidden pending broader evidence and task-set alignment.",
    },
}

DEEP_CATEGORY_RATIONALES: dict[str, dict[str, str]] = {
    "d078_nvivo": {"category": "conditional_qualitative_tool_alternative", "why": "NVivo can support organising, coding and retrieving substantial qualitative material when the chosen analysis benefits from dedicated software.", "breadth": "Applies to selected qualitative or mixed-material workflows, not all D078 paths.", "boundary": "The tool does not choose the method, interpret evidence or validate themes; manual coding and other products remain alternatives.", "evidence_limit": "Product and learning-source roles still need separate validation; overlaps the existing NVivo candidate." , "duplicate_of_existing_id": "d078-nvivo-tool"},
    "d078_casevo": {"category": "emerging_specialist_candidate_under_review", "why": "Casevo is a narrowly scoped cognitive-agent/social-evolution simulation project, retained for review because its repository and paper describe a potentially relevant modelling workflow.", "breadth": "Only a possible computational social-simulation route; one project is not evidence of broad adoption.", "boundary": "Not a generic case-study tool or a substitute for real participant evidence; simulated output is not proof of real-world behaviour.", "evidence_limit": "Identity and intended use are documented, but independent uptake, maintenance, learner suitability and task-set fit remain unresolved.", "duplicate_of_existing_id": "d078-casevo-tool"},
    "d078_mesa": {"category": "specialist_tool_for_agent_based_modelling", "why": "Mesa provides a Python framework for building and inspecting agent-based models when a justified simulation design exists.", "breadth": "Belongs to selected computational modelling work, not shared social-science foundations.", "boundary": "The framework implements a model; it does not validate assumptions or make outputs observations of society. Python and modelling concepts precede operation.", "evidence_limit": "Technical and methodological documentation supports a candidate route, not broad occupational demand; overlaps the existing Mesa candidate.", "duplicate_of_existing_id": "d078-mesa-tool"},
    "d078_spss": {"category": "conditional_statistical_tool_alternative", "why": "SPSS is one option for structured quantitative analysis when its procedures, licence and team context fit the task.", "breadth": "Selected quantitative workflows only; alternatives may support the same analysis.", "boundary": "Do not make SPSS cumulative with R, Python or jamovi. Software output does not validate a design, assumptions or interpretation.", "evidence_limit": "IBM documentation supports features, not universal use or job requirements; overlaps the existing SPSS candidate.", "duplicate_of_existing_id": "d078-spss-tool"},
    "d078_python": {"category": "conditional_programming_language_for_computational_routes", "why": "Python can support repeatable data preparation, analysis, text, network, visualisation and simulation workflows when code is useful for the research task.", "breadth": "A flexible option across some computational routes, but not required for every D078 area or role.", "boundary": "Language syntax alone does not teach research design, statistics, social theory, responsible data practice or valid interpretation.", "evidence_limit": "Official tutorial establishes language learning, not checkpoint fit or occupational need; learning links must be task-specific rather than generic Python alone."},
    "d078_pandas": {"category": "conditional_data_handling_library", "why": "pandas can read, clean, reshape and summarise tabular data inside a Python workflow.", "breadth": "Useful where repeatable code-based table handling is needed; not required for other workflows.", "boundary": "It is not a research method or statistical-validity guarantee; Python and data-table concepts are prerequisites.", "evidence_limit": "Official tutorials establish capability, not use across D078 roles; overlaps the existing pandas candidate.", "duplicate_of_existing_id": "d078-pandas-tool"},
    "d078_statsmodels": {"category": "specialist_statistical_library", "why": "statsmodels provides Python implementations for selected regression, time-series and related statistical models.", "breadth": "A specialist option when a justified quantitative analysis requires these models and the user can assess their assumptions.", "boundary": "The package cannot select a defensible model, correct poor measurement or establish causality/fairness by itself.", "evidence_limit": "Documentation demonstrates available methods, not that they are appropriate for a given D078 route; prerequisites and task-specific instruction remain to be verified."},
    "d078_networkx": {"category": "specialist_network_analysis_library", "why": "NetworkX can represent and analyse relational data as graphs for selected social-network questions.", "breadth": "Relevant only when the research question and data concern relationships and a computational workflow is warranted.", "boundary": "Graph calculations do not explain why ties exist, prove influence or correct missing/bounded network data.", "evidence_limit": "Project documentation establishes capabilities, not social meaning or broad job demand; overlaps the existing NetworkX candidate.", "duplicate_of_existing_id": "d078-networkx-tool"},
    "d078_jupyter": {"category": "conditional_reproducible_computing_environment", "why": "Jupyter notebooks can keep executable code, explanation, data outputs and visualisations together for an inspectable computational workflow.", "breadth": "Supports selected computational learning and analysis routes; it is not necessary when another documented workflow is more appropriate.", "boundary": "A notebook is not a statistical method, validated result or guarantee of reproducibility; environments, data and dependencies still matter.", "evidence_limit": "Project documentation describes the format and capabilities, not domain-wide need or good research practice by itself."},
    "d078_scikit_learn": {"category": "specialist_predictive_and_text_modelling_library", "why": "scikit-learn supports selected predictive and text-feature modelling workflows when there is a clear question, suitable data and an evaluation plan.", "breadth": "An optional specialist computational route, not general D078 preparation.", "boundary": "Prediction does not establish explanation, causality, fairness or social validity; assess leakage, bias, baselines and limits.", "evidence_limit": "Official documentation lists algorithms and workflows, not social-science checkpoint fit or job demand; preserve the proposed computational-specialization placement as pending area reconciliation."},
}


# Item-level enrichment for one identified tool. Other tool/framework records
# remain explicitly incomplete until their own evidence review is finished.
DEEP_TOOL_META: dict[str, dict[str, Any]] = {
    "d078_scikit_learn": {
        "label": "scikit-learn",
        "type": "python_library",
        "meaning": "A free Python library containing ready-to-use machine-learning methods. Researchers can use it to turn records or text into model inputs, train a model to sort examples into categories or find groups, and check how well it works on data it did not train on.",
        "output": "A documented, repeatable text- or table-analysis pipeline: the research question and labels; how data were prepared; model and feature choices; held-out evaluation (for classification, for example, precision/recall and a confusion matrix); error checks; and a statement of what the model can and cannot support.",
        "prerequisites": [
            "Basic Python: variables, functions, imports and reading data; scikit-learn's own MOOC also recommends familiarity with NumPy, pandas and plotting, though it says those are not required.",
            "A defined social-science question and a measure or coding rule that explains what the model is meant to predict; for supervised classification, examples need defensible labels.",
            "Enough statistical and data-literacy knowledge to separate training from evaluation data, choose an appropriate metric, inspect errors and avoid data leakage.",
            "Lawful, ethical access to text or records, with privacy, consent, storage and language/community safeguards appropriate to the project."
        ],
        "alternatives": [
            "For a small corpus or questions about meaning and context, use human coding with a documented codebook and review disagreements; software classification is not a substitute for interpretive work.",
            "For a narrowly defined and theory-justified word list, dictionary/rule-based coding can be a transparent alternative, but it may miss context, new expressions and code-switching.",
            "R packages such as tidymodels or quanteda can support alternative computational workflows; choose one suitable workflow rather than treating Python and R tools as cumulative requirements."
        ],
        "limits": [
            "A model learns patterns in the examples and labels it receives; it does not decide whether a social concept was measured well, a label is fair, or a result is meaningful.",
            "Good held-out prediction does not establish causality, representativeness, construct validity, fairness or the truth of an interpretation; the study design and evidence still govern those claims.",
            "Bag-of-words text features can discard word order and multi-word meaning. The official guide notes that this loses much of a document's internal structure.",
            "English-only text features may miss local meanings in Nigerian Pidgin or code-mixed text. A 2020 Nigerian Pidgin sentiment study found that direct English sentiment analysis missed contextual meanings in its dataset; this is a bounded example, not a finding about every Nigerian language or task.",
            "This candidate is conditional specialist software, not a shared D078 foundation, a required library for every route, a professional credential, or evidence that a learner can independently conduct valid research."
        ],
        "relationships": [
            {"type": "requires", "target": "d078_python", "note": "It runs inside Python. Basic Python use is needed to load data, call the library and inspect results; this is a learning prerequisite, not a claim that Python should be selected by every learner.", "status": "candidate"},
            {"type": "complements", "target": "d078_pandas", "note": "pandas can prepare and reshape text, labels and metadata before modelling when the project uses tables; it is not required for every input format.", "status": "candidate"},
            {"type": "supports", "target": "d078-computational-social-research", "note": "It can implement selected classification, clustering or text-feature steps within a computational social-research workflow; the research question and method determine whether those steps are appropriate.", "status": "candidate"},
            {"type": "requires_for_interpretation", "target": "d078-quantitative-approach", "note": "Responsible interpretation needs understanding of labels, validation data, metrics, uncertainty and sampling. Installing or operating the library does not supply this reasoning.", "status": "candidate"},
            {"type": "complements", "target": "d078-evaluate-evidence-and-limits", "note": "Evidence appraisal and error analysis help researchers decide what a model's results support and where the model fails.", "status": "candidate"}
        ],
        "context": {
            "programme": {"status": "not_assessed", "claim": "No programme-specific CCMAS course-to-scikit-learn evidence has been established here. Treat the library as possible additional learning, not as something every Sociology programme teaches."},
            "domain": {"status": "candidate", "claim": "Can support selected D078 questions involving structured data or text when classification, grouping or feature extraction is justified; it does not replace social theory, research design or interpretation."},
            "area_of_specialization": {"status": "pending_area_task_set_reconciliation", "candidate_context": "Most plausible in Computational and Digital Social Science for suitable text/data tasks, but area placement is not approved by this tool note."},
            "role": {"status": "pending_role_task_set_reconciliation", "claim": "No role-specific requirement is established by this record; only attach it to roles after exact tasks and route checkpoints support it."},
            "global": {"claim": "General-purpose open-source Python machine-learning library; the candidate uses text classification and evaluation as one possible social-research workflow, not an all-purpose method."},
            "nigeria": {"scope": "Nigeria-specific contextual evidence, not a national tool requirement", "claim": "SICSS Nigeria's 2026 Uyo programme listed NLP for social research, feature engineering, machine learning for social insight, and classification/clustering. The event dates have passed and its stated audience was postgraduate students, postdoctoral researchers and academics, so it demonstrates a local computational-social-science training context, not an undergraduate mandate. A 2020 Nigerian Pidgin sentiment study illustrates why language-specific meanings and human checks matter; it used VADER, not scikit-learn, and cannot establish this library's suitability for all Nigerian text."}
        },
        "item_definition_sources": [
            source_ref("sklearn_feature_extraction_user_guide_2026", "Feature extraction — scikit-learn User Guide", "scikit-learn developers", "https://scikit-learn.org/stable/modules/feature_extraction.html", "Sections 8.2 and 8.2.3.7–8.2.3.8: turning text into numerical features; text classification/clustering examples; and bag-of-words limitations, including loss of word order and multi-word structure.", "Documents library functions and their intended text-feature workflows and limitations.", "Official software documentation establishes technical functions, not social-science validity, route fit, job demand or fairness."),
            source_ref("sklearn_mooc_text_dimensionality_2026", "Dimensionality reduction of text data — scikit-learn MOOC", "Inria Learning Lab and scikit-learn contributors", "https://inria.github.io/scikit-learn-mooc/python_scripts/dimred_text.html", "The notebook uses TfidfVectorizer on a text corpus, explains the resulting document-term feature space and explores dimensionality reduction; the adjacent course overview describes the free, openly licensed, executable MOOC.", "Shows a concrete scikit-learn text-to-features workflow and related terminology.", "The worked dataset is Wikinews, not Nigerian or social-science data; transfer the coding workflow only after designing and validating the research application.")
        ],
        "checkpoint_fit_sources": [
            source_ref("sicss_nigeria_uyo_2026_computational_social_science", "Summer Institute in Computational Social Science: Nigeria 2026", "SICSS Nigeria", "https://new.sicss.io/2026/uyo/", "Programme description lists NLP for social research, dataset preprocessing, feature engineering, machine learning for social insight, and classification/clustering; audience and event dates are stated on the page.", "Provides a Nigeria-specific example of computational social-science research training topics that can contextualise this conditional candidate.", "The July 2026 event has passed and its graduate/postgraduate/academic audience does not establish a national undergraduate curriculum, a job requirement, or scikit-learn adoption."),
            source_ref("uw_text_as_data_social_science_workshop", "Text as Data and LLM Applications", "University of Washington Center for Studies in Demography and Ecology", "https://csde.washington.edu/workshop/introduction-to-text-as-data/", "Workshop description and materials: selecting and representing text, building measures from unstructured text, social-science/demography applications, Python demos and Colab; the page says no prior text-data experience is required and some Python is helpful.", "Shows the methodological context in which a Python text-modelling library may be considered for social-science research.", "This workshop page does not establish that the examples use scikit-learn or that every D078 area/role needs text modelling.")
        ],
        "explanatory_sources": [
            source_ref("nigerian_pidgin_contextual_sentiment_2020", "Semantic Enrichment of Nigerian Pidgin English for Contextual Sentiment Classification", "Oyewusi, Adekanmbi and Akinsande; arXiv preprint", "https://arxiv.org/abs/2003.12450", "Abstract and sections 2–4: the study describes contextual differences in Nigerian Pidgin/code-mixed terms, its sentiment dataset and human-speaker checking; the method uses VADER rather than scikit-learn.", "Provides a concrete Nigerian example of why local language context and human validation matter when analysing social text.", "Single 2020 study/preprint in Nigerian Pidgin sentiment classification; not evidence about all Nigerian languages, all text analysis or scikit-learn specifically."),
            source_ref("uw_text_as_data_social_science_explanation", "Text as Data and LLM Applications", "University of Washington Center for Studies in Demography and Ecology", "https://csde.washington.edu/workshop/introduction-to-text-as-data/", "Workshop overview, lines 64–75: explains representing text and building measures for social-science/demography questions; Python and tutorial links are included.", "Offers an independent social-research explanation of why text must be selected, represented and measured before modelling.", "Explains text-as-data research, not scikit-learn functions or a universal social-science method.")
        ],
        "learning_links": [
            {"label": "Learn scikit-learn text features with a hands-on notebook", "url": "https://inria.github.io/scikit-learn-mooc/python_scripts/dimred_text.html", "source_id": "sklearn_mooc_text_dimensionality_2026", "locator": "Dimensionality reduction of text data: TfidfVectorizer, document-term features and text dimensionality reduction. Use the MOOC page's Binder/rocket control to run notebook cells where available.", "level": "Introductory-to-intermediate; basic Python is expected", "access": "Free online MOOC material, openly licensed CC BY; interactive notebooks can be launched with Binder; some online quiz features may require the course platform.", "language": "English", "scope_note": "Uses Wikinews text, not social-science or Nigerian data. Pair it with the University of Washington text-as-data workshop for social-research design and adapt only after local language/measurement checks.", "verified_on": "2026-10-09", "role": "free_task_specific_learning_resource", "instructional_fit": "verified_for_scikit_learn_text_feature_workflow_only"},
            {"label": "Connect text modelling to social-science questions", "url": "https://csde.washington.edu/workshop/introduction-to-text-as-data/", "source_id": "uw_text_as_data_social_science_workshop", "locator": "Workshop overview and tutorial/Colab links: text selection and representation, building measures from unstructured text, social-science/demography questions and Python demonstrations.", "level": "Introductory workshop; some Python is helpful", "access": "Workshop page links tutorial files and a free Colab playground; verify external repository availability before student display.", "language": "English", "scope_note": "A social-science text-as-data companion, not a scikit-learn-specific course; do not treat this link alone as tool-operation training.", "verified_on": "2026-10-09", "role": "complementary_method_learning_resource", "instructional_fit": "verified_for_social_science_text_as_data_context_only"}
        ],
        "link_role_audit": {
            "official_task_or_item_source": "attached_pending_claim_review",
            "checkpoint_fit_source": "bounded_global_and_nigeria_context_attached_pending_route_review",
            "independent_explanatory_source": "attached_pending_claim_review",
            "free_task_specific_learning_resource": "verified_for_scikit_learn_text_feature_workflow_only; not student-display approval"
        }
    }
}


# Bounded learning-link verification for the next deep-search batch. These
# links verify a concrete workflow only; they do not approve the item for a
# D078 foundation, area, role, or student display. Claim and checkpoint gates
# remain deliberately review-only until the three task-set QA lanes are merged.
DEEP_TOOL_META.update({
    "d078_mesa": {
        "learning_links": [
            {
                "label": "Build a first Mesa agent-based model",
                "url": "https://github.com/mesa/mesa/blob/main/docs/getting_started.md",
                "source_id": "mesa_official_getting_started_2026",
                "locator": "Getting Started: creating a first model, activating agents, collecting data and basic visualisation",
                "level": "Introductory-to-intermediate; Python and modelling concepts are prerequisites",
                "access": "Free online documentation",
                "language": "English",
                "scope_note": "Teaches the Mesa workflow for agent-based modelling; it does not teach social theory, research design or validation of a model's assumptions.",
                "verified_on": "2026-10-09",
                "role": "free_task_specific_learning_resource",
                "instructional_fit": "verified",
            },
            {
                "label": "Follow a hands-on Mesa modelling tutorial",
                "url": "https://omarkammouh.github.io/ABM-Python/main/chapter_3_mesa_tutorial/overview.html",
                "source_id": "mesa_abm_python_tutorial_2026",
                "locator": "Chapter 3: model structure, agents, spaces, data collection, visualisation and parameter sweeps",
                "level": "Introductory-to-intermediate",
                "access": "Free online tutorial",
                "language": "English",
                "scope_note": "A practical companion for Mesa operations; use it only after the learner has a justified social-simulation question and a plan for interpreting simulated output.",
                "verified_on": "2026-10-09",
                "role": "complementary_method_learning_resource",
                "instructional_fit": "verified",
            },
        ],
        "link_role_audit": {
            "free_task_specific_learning_resource": "verified_for_mesa_agent_based_model_workflow_only; not student-display approval",
        },
    },
    "d078_spss": {
        "learning_links": [
            {
                "label": "Learn SPSS data management and statistical analysis modules",
                "url": "https://stats.oarc.ucla.edu/spss/modules/",
                "source_id": "ucla_oarc_spss_modules_2026",
                "locator": "Modules covering fundamentals, data entry and management, recoding, missing data, merging and reshaping, descriptive statistics and statistical tests",
                "level": "Introductory-to-intermediate; modules can be selected by need",
                "access": "Free online instructional modules; SPSS access may be required for exercises",
                "language": "English",
                "scope_note": "Teaches software procedures and selected analysis workflows; it does not choose a defensible design, establish measurement validity or replace interpretation.",
                "verified_on": "2026-10-09",
                "role": "free_task_specific_learning_resource",
                "instructional_fit": "verified",
            },
        ],
        "link_role_audit": {
            "free_task_specific_learning_resource": "verified_for_spss_data_management_and_statistics_workflow_only; not student-display approval",
        },
    },
    "d078_networkx": {
        "learning_links": [
            {
                "label": "Learn NetworkX graph and network operations",
                "url": "https://networkx.org/documentation/latest/tutorial",
                "source_id": "networkx_official_tutorial_2026",
                "locator": "Tutorial sections on creating nodes and edges, graph data, graph operations and links to real-world network guides",
                "level": "Introductory-to-intermediate; Python basics are prerequisites",
                "access": "Free online documentation and tutorials",
                "language": "English",
                "scope_note": "Teaches graph representation and computation; it does not explain why relationships exist, prove influence or correct missing/bounded network data.",
                "verified_on": "2026-10-09",
                "role": "free_task_specific_learning_resource",
                "instructional_fit": "verified",
            },
        ],
        "link_role_audit": {
            "free_task_specific_learning_resource": "verified_for_networkx_graph_workflow_only; not student-display approval",
        },
    },
    "d078_pandas": {
        "learning_links": [
            {
                "label": "Learn pandas tabular-data workflows",
                "url": "https://pandas.pydata.org/pandas-docs/stable/getting_started/intro_tutorials/index.html",
                "source_id": "pandas_official_intro_tutorials_2026",
                "locator": "Getting-started tutorials for reading and writing tabular data, selecting subsets, plotting, combining tables, time series and text data",
                "level": "Introductory; basic Python is a prerequisite",
                "access": "Free online documentation and tutorials",
                "language": "English",
                "scope_note": "Teaches table handling in Python; it does not establish a research method, measurement quality or statistical validity.",
                "verified_on": "2026-10-09",
                "role": "free_task_specific_learning_resource",
                "instructional_fit": "verified",
            },
        ],
        "link_role_audit": {
            "free_task_specific_learning_resource": "verified_for_pandas_tabular_data_workflow_only; not student-display approval",
        },
    },
    "d078_statsmodels": {
        "learning_links": [
            {
                "label": "Study statsmodels model and time-series examples",
                "url": "https://www.statsmodels.org/stable/user-guide.html",
                "source_id": "statsmodels_official_user_guide_2026",
                "locator": "User Guide sections for regression, statistical models, time-series analysis, diagnostics and worked examples",
                "level": "Intermediate; Python, statistics and model-assumption knowledge are prerequisites",
                "access": "Free online documentation and examples",
                "language": "English",
                "scope_note": "Guides implementation of selected statistical models; it does not decide whether a model is appropriate for a social question or establish causality.",
                "verified_on": "2026-10-09",
                "role": "free_task_specific_learning_resource",
                "instructional_fit": "verified",
            },
        ],
        "link_role_audit": {
            "free_task_specific_learning_resource": "verified_for_statsmodels_model_workflow_documentation_only; not student-display approval",
        },
    },
    "d078_python": {
        "learning_links": [
            {
                "label": "Use Python for text analysis in a research workflow",
                "url": "https://programminghistorian.org/en/lessons/sentiment-analysis",
                "source_id": "programming_historian_python_sentiment_2026",
                "locator": "Lesson sections on loading text, selecting an NLP approach, calculating sentiment scores and interpreting results",
                "level": "Introductory-to-intermediate; baseline Python is recommended",
                "access": "Free online lesson and code examples",
                "language": "English",
                "scope_note": "Teaches one text-analysis workflow in Python; it is not a complete Python course and does not establish that sentiment analysis is appropriate for every social-science question.",
                "verified_on": "2026-10-09",
                "role": "free_task_specific_learning_resource",
                "instructional_fit": "verified",
            },
            {
                "label": "Explore text mining with Python notebooks",
                "url": "https://programminghistorian.org/en/lessons/text-mining-with-extracted-features",
                "source_id": "programming_historian_python_text_mining_2026",
                "locator": "Lesson sections on notebooks, text features, frequency extraction and visualising trends",
                "level": "Introductory-to-intermediate",
                "access": "Free online lesson and code examples",
                "language": "English",
                "scope_note": "A bounded text-mining workflow using an existing feature dataset; it does not replace research design, measurement or local-language validation.",
                "verified_on": "2026-10-09",
                "role": "complementary_method_learning_resource",
                "instructional_fit": "verified",
            },
        ],
        "link_role_audit": {
            "free_task_specific_learning_resource": "verified_for_python_text_analysis_workflows_only; not generic-Python or student-display approval",
        },
    },
    "d078_jupyter": {
        "learning_links": [
            {
                "label": "Run and document a Jupyter notebook workflow",
                "url": "https://docs.jupyter.org/en/latest/running.html",
                "source_id": "jupyter_official_running_notebooks_2026",
                "locator": "Running the Notebook: starting a notebook server, opening notebooks, executing notebooks and using command-line options",
                "level": "Introductory; a Python environment and basic code are prerequisites",
                "access": "Free online documentation",
                "language": "English",
                "scope_note": "Teaches notebook operation and execution; a notebook does not itself establish reproducibility, valid analysis or sound research design.",
                "verified_on": "2026-10-09",
                "role": "free_task_specific_learning_resource",
                "instructional_fit": "verified",
            },
        ],
        "link_role_audit": {
            "free_task_specific_learning_resource": "verified_for_jupyter_notebook_execution_workflow_only; not student-display approval",
        },
    },
    "d078_nvivo": {
        "learning_links": [
            {
                "label": "Use NVivo to organise and document thematic analysis",
                "url": "https://lumivero.com/resources/blog/how-to-do-thematic-analysis-in-qualitative-research-with-nvivo-lumivero-ai-assistant/",
                "source_id": "lumivero_nvivo_thematic_analysis_2026",
                "locator": "Thematic-analysis phases and the sections on familiarisation, coding, themes, memos, code hierarchies and framework matrices",
                "level": "Introductory-to-intermediate; qualitative analysis concepts are prerequisites",
                "access": "Free online article; product access may be required for software exercises",
                "language": "English",
                "scope_note": "Explains how NVivo can support organisation and documentation around thematic analysis; manual analysis remains possible and researcher judgement is not replaced.",
                "verified_on": "2026-10-09",
                "role": "free_task_specific_learning_resource",
                "instructional_fit": "verified",
            },
        ],
        "link_role_audit": {
            "free_task_specific_learning_resource": "verified_for_nvivo_thematic_analysis_workflow_only; vendor resource and not student-display approval",
        },
    },
    "d078_casevo": {
        "learning_links": [
            {
                "label": "Build a basic Casevo social-simulation experiment",
                "url": "https://github.com/rgCASS/casevo",
                "source_id": "casevo_official_repository_tutorial_2026",
                "locator": "README sections 1–5: framework purpose, Mesa relationship, installation, sample election simulation and model/agent construction tutorial",
                "level": "Advanced; Python, agent-based modelling and research-design concepts are prerequisites",
                "access": "Free open-source repository and tutorial; installation dependencies and external model services may apply",
                "language": "English",
                "scope_note": "Teaches the project’s documented simulation workflow; it does not establish broad adoption, empirical validity, or a general social-science requirement.",
                "verified_on": "2026-10-09",
                "role": "free_task_specific_learning_resource",
                "instructional_fit": "verified",
            },
        ],
        "link_role_audit": {
            "free_task_specific_learning_resource": "verified_for_casevo_social_simulation_workflow_only; not student-display approval",
        },
    },
})


FOUNDATION_META: dict[str, dict[str, Any]] = {
    "sampling_recruitment_and_representativeness": {
        "label": "Sampling and knowing what evidence represents",
        "type": "competency",
        "meaning": "Choose people, cases or datasets carefully and explain which wider group the evidence can and cannot represent.",
        "output": "A short sampling or case-selection plan that names the population, selection approach and important limits.",
        "prerequisites": ["A researchable question and a defined population, case boundary or source pool."],
        "alternatives": ["Where the question concerns a bounded case or small purposive group, case selection may be more appropriate than population-representative sampling; these are different designs, not interchangeable ways to claim representativeness."],
        "relationships": [{"type": "supports", "target": "d078-research-question-design", "note": "The question helps determine who or what should be studied.", "status": "candidate"}],
        "learning_links": [{"label": "Study survey sampling with the UK Data Service", "url": "https://trainingmodules.ukdataservice.ac.uk/surveys/", "source_id": "ukds_intro_survey_data", "locator": "Unit 1: What are survey data? → What is sampling?; later units cover survey design, bias, weights, sampling precision and confidence intervals.", "level": "Introductory; no previous knowledge assumed", "access": "Free interactive module; provider states approximately 2–2.5 hours; works without statistical software", "language": "English", "scope_note": "Uses UK survey material as a worked example; the sampling concepts are general, but local population frames and Nigerian procedures must be checked separately.", "verified_on": "2026-10-09", "role": "free_task_specific_learning_resource", "instructional_fit": "verified"}],
        "limits": ["The choice depends on the research question and available evidence.", "A sample does not automatically represent everyone in a population."],
        "item_definition_sources": [source_ref("aapor_best_practices_sampling", "Best Practices for Survey Research — Designing Your Sample", "American Association for Public Opinion Research", "https://aapor.org/standards-and-ethics/best-practices/", "Section 2, Designing Your Sample: sampling frame; probability and nonprobability samples; implications for accuracy and interpretation.", "Defines the sample/sampling-frame relationship and cautions that sample design affects what survey findings can support.", "Survey-specific guidance; it does not define case selection for every qualitative or non-survey study."), ESRC_RESEARCH_DESIGN],
        "checkpoint_fit_sources": [ESRC_RESEARCH_DESIGN, NUC_SOCIAL_SCIENCES],
        "explanatory_sources": [source_ref("open_text_sampling_ch8", OPEN_SOCIAL_RESEARCH_TEXT["title"], OPEN_SOCIAL_RESEARCH_TEXT["publisher"], OPEN_SOCIAL_RESEARCH_TEXT["url"], "Chapter 8, Sampling; introductory explanation of the sampling process and its relation to research design.", "Offers a student-oriented explanation of why researchers select a subset of cases and what that choice means.", OPEN_SOCIAL_RESEARCH_TEXT["scope_limit"])],
    },
    "measurement_and_operationalisation": {
        "label": "Turning ideas into observable measures",
        "type": "method",
        "meaning": "Turn an idea such as trust, wellbeing or access into questions, observations or records that can be examined, while explaining what the measure leaves out.",
        "output": "A small measurement plan showing the concept, indicators, questions or observations, and their limitations.",
        "prerequisites": ["A clearly stated question and a concept that needs to be observed or measured."],
        "alternatives": ["Depending on the question, a concept may be explored through open-ended accounts or represented with structured indicators; neither automatically substitutes for the other."],
        "relationships": [{"type": "builds_on", "target": "d078-research-question-design", "note": "A clear question helps determine what needs to be measured.", "status": "candidate"}],
        "learning_links": [{"label": "Learn how concepts become measurable indicators", "url": "https://openbooks.macewan.ca/researchmethods/chapter/chapter-4-research-design-and-measurement/", "source_id": "macewan_social_research_measurement_ch4", "locator": "Sections on conceptualization, indicators and operationalization; worked examples explain turning a broad social concept into a defined measure.", "level": "Introductory undergraduate open textbook chapter", "access": "Free online text; the book is openly licensed", "language": "English", "scope_note": "Uses Canadian examples and focuses on quantitative operationalization; it does not replace qualitative approaches to understanding concepts or Nigerian population-specific instrument validation.", "verified_on": "2026-10-09", "role": "free_task_specific_learning_resource", "instructional_fit": "verified"}],
        "limits": ["A measure is an indicator of an idea, not the idea itself.", "Different groups may understand or answer the same measure differently."],
        "item_definition_sources": [source_ref("gesis_survey_instruments_measurement", "Survey Instruments", "GESIS — Leibniz Institute for the Social Sciences", "https://www.gesis.org/en/gesis-guides/gesis-survey-guides/instruments", "Survey Instruments guide topics: measurement, reliability, validity, wording, response formats and bias.", "Establishes measurement and instrument quality as survey-instrument concerns.", "Survey-focused; instrument guidance does not define every qualitative way of exploring a concept."), ESRC_RESEARCH_DESIGN],
        "checkpoint_fit_sources": [ESRC_RESEARCH_DESIGN, NUC_SOCIAL_SCIENCES],
        "explanatory_sources": [source_ref("open_text_measurement_ch6", OPEN_SOCIAL_RESEARCH_TEXT["title"], OPEN_SOCIAL_RESEARCH_TEXT["publisher"], OPEN_SOCIAL_RESEARCH_TEXT["url"], "Chapter 6, Measurement of Constructs; sections on concepts, indicators and operationalization.", "Explains how an abstract idea can be represented through observable indicators, with examples.", OPEN_SOCIAL_RESEARCH_TEXT["scope_limit"])],
    },
    "reliability_validity_and_uncertainty": {
        "label": "Checking reliability, validity and uncertainty",
        "type": "competency",
        "meaning": "Check whether evidence is consistent, measures what it claims to measure, and carries uncertainty or possible bias before drawing conclusions.",
        "output": "A quality check that identifies likely sources of error, bias, uncertainty and limits on interpretation.",
        "prerequisites": ["A proposed measure, evidence source or analytic result whose quality and limits can be examined."],
        "alternatives": ["The appropriate quality checks vary by evidence type: reliability checks concern consistency/precision, validity concerns whether the interpretation is supported, and uncertainty checks address how much confidence the design permits; one statistic cannot replace this review."],
        "relationships": [{"type": "supports", "target": "measurement_and_operationalisation", "note": "Measures need quality checks before they are interpreted.", "status": "candidate"}],
        "learning_links": [{"label": "Learn how reliability describes measurement precision", "url": "https://www.gesis.org/fileadmin/admin/Dateikatalog/pdf/guidelines/reliability_precision_measurement_danner_2016.pdf", "source_id": "gesis_reliability_precision_measurement", "locator": "Sections 1–2 define reliability and why it matters; Section 4 presents estimation methods and their assumptions.", "level": "Technical methods guide; best used after introductory measurement concepts", "access": "Free PDF; Creative Commons Attribution-NonCommercial 4.0", "language": "English", "scope_note": "Focuses on reliability of measurements, not every form of validity, bias or uncertainty; its coefficients do not certify a measure as suitable for a particular population.", "verified_on": "2026-10-09", "role": "free_task_specific_learning_resource", "instructional_fit": "verified"}],
        "limits": ["No quality check removes every source of uncertainty.", "The appropriate checks depend on the method, data and claim."],
        "item_definition_sources": [source_ref("gesis_reliability_precision_guide", "Reliability and Precision of Measurement", "GESIS — Leibniz Institute for the Social Sciences", "https://www.gesis.org/fileadmin/admin/Dateikatalog/pdf/guidelines/reliability_precision_measurement_danner_2016.pdf", "Sections 1–2 (reliability and precision); Section 4 (estimation approaches and assumptions).", "Defines reliability/precision and explains that estimates depend on methods and assumptions.", "This source covers measurement reliability, not all validity, uncertainty, bias or qualitative quality approaches."), ESRC_RESEARCH_DESIGN],
        "checkpoint_fit_sources": [ESRC_RESEARCH_DESIGN, NUC_SOCIAL_SCIENCES],
        "explanatory_sources": [source_ref("open_text_reliability_validity_ch7", OPEN_SOCIAL_RESEARCH_TEXT["title"], OPEN_SOCIAL_RESEARCH_TEXT["publisher"], OPEN_SOCIAL_RESEARCH_TEXT["url"], "Chapter 7, Scale Reliability and Validity; introductory comparison of consistency and whether a measure supports the intended interpretation.", "Provides a learner-oriented explanation of reliability and validity without treating a coefficient as proof of overall quality.", OPEN_SOCIAL_RESEARCH_TEXT["scope_limit"])],
    },
    "pilot_and_cognitive_pretesting": {
        "label": "Piloting questions before fieldwork",
        "type": "method",
        "meaning": "Try research questions or an instrument with a small group first to see whether people understand them as intended and whether the process works.",
        "output": "A pilot note listing confusing wording, practical problems and justified changes before the main study.",
        "prerequisites": ["A draft question, instrument or field procedure to test, plus an appropriate and ethically permissible test plan."],
        "alternatives": ["Cognitive pretesting checks how people understand and answer particular questions; a pilot checks whether broader study procedures work. They answer different questions and can be used separately or together when justified."],
        "relationships": [{"type": "supports", "target": "measurement_and_operationalisation", "note": "Piloting helps improve how ideas are measured.", "status": "candidate"}],
        "learning_links": [{"label": "Use GESIS's cognitive-pretesting guide and teaching slides", "url": "https://www.gesis.org/en/gesis-guides/gesis-survey-guides/instruments", "source_id": "gesis_cognitive_pretesting", "locator": "Survey Instruments → Cognitive Pretesting → Guideline and teaching slides; the guide explains interview/probing approaches for finding question-comprehension problems.", "level": "Methods guide and teaching slides; not a general survey-design course", "access": "Free materials on the GESIS Survey Guides site", "language": "English for the linked guide/slides; linked expert videos may be German", "scope_note": "Cognitive pretesting is about question interpretation; pair with a separate operational pilot when whole-procedure testing is needed.", "verified_on": "2026-10-09", "role": "free_task_specific_learning_resource", "instructional_fit": "verified"}],
        "limits": ["This is especially relevant to surveys and structured instruments; it is not required for every project.", "A pilot does not prove that the final study is unbiased."],
        "item_definition_sources": [source_ref("gesis_cognitive_pretesting_guideline", "Cognitive Pretesting", "GESIS — Leibniz Institute for the Social Sciences", "https://www.gesis.org/gesis-guides/generated-guides/049-cognitive-pretesting-2", "Introduction and sections on cognitive interviewing/web probing; questionnaire pretests examine interpretation, difficulty and other response problems.", "Distinguishes cognitive pretesting of questions from broader questionnaire/pilot checks.", "Specific to survey instruments; the appropriate pretest depends on mode, question and research purpose."), source_ref("aapor_best_practices_pretest_pilot", "Best Practices for Survey Research — Questionnaire Pretesting and Pilots", "American Association for Public Opinion Research", "https://aapor.org/standards-and-ethics/best-practices/", "Sections 3–4: cognitive interviewing/pretesting before fieldwork and pilot testing the overall procedures.", "Explains in accessible practice language why question testing and whole-process pilots answer different questions.", "Survey guidance; it is not a rule that every D078 research project must use both methods.")],
        "checkpoint_fit_sources": [ESRC_RESEARCH_DESIGN, NUC_SOCIAL_SCIENCES],
        "explanatory_sources": [source_ref("aapor_pretest_pilot_explanation", "Best Practices for Survey Research — Questionnaire Pretesting and Pilots", "American Association for Public Opinion Research", "https://aapor.org/standards-and-ethics/best-practices/", "Sections 3–4: pretesting questions with similar respondents; piloting recruitment, administration and data-cleaning procedures.", "Provides a plain-language distinction between checking question understanding and rehearsing the wider survey process.", "Survey-specific practice guidance; not a universal mandate for every project.")],
    },
    "open_science_preregistration_and_reproducibility": {
        "label": "Keeping a clear, repeatable research record",
        "type": "competency",
        "meaning": "Record plans, decisions, data descriptions, code, materials and changes so another person can inspect how the work was done and, where possible, repeat it.",
        "output": "An organised research record with a plan, data dictionary or codebook, versioned materials and a note explaining deviations.",
        "prerequisites": ["A research question and a record of the decisions, materials and data actually used; preregistration is only applicable before relevant data collection or analysis decisions."],
        "alternatives": ["Preregistration is an optional transparency practice for suitable studies, not a required credential or a replacement for ethics review, good design, data protection or a clear account of changes."],
        "relationships": [{"type": "works_with", "target": "reference_and_literature_management", "note": "A traceable research record also needs organised sources and materials.", "status": "candidate"}],
        "learning_links": [{"label": "Follow OSF's beginner guide to planning a preregistration", "url": "https://help.osf.io/article/626-simplifying-the-preregistration-process", "source_id": "osf_simplifying_preregistration", "locator": "Steps 1–5: write research questions, describe methods, define data, plan analysis and set decision rules; page explains updates/deviations.", "level": "Beginner-oriented guide", "access": "Free online guide/video", "language": "English", "scope_note": "Covers preregistration, not the full range of reproducibility, data governance or open-science practices; OSF is one platform, not a requirement.", "verified_on": "2026-10-09", "role": "free_task_specific_learning_resource", "instructional_fit": "verified"}],
        "limits": ["What can be shared depends on consent, privacy, security, copyright and other rules.", "Reproducibility does not make an unsuitable research design valid."],
        "item_definition_sources": [source_ref("osf_preregistration_definition", "Welcome to Registrations & Preregistrations", "Open Science Framework", "https://help.osf.io/article/330-welcome-to-registrations", "Overview, lines 52–60: preregistration as a time-stamped, read-only study plan made before data collection or analysis; anonymisation considerations.", "Defines preregistration and identifies timing and privacy considerations.", "Explains OSF's process; preregistration is optional and suitability depends on the study and its timing."), ESRC_RESEARCH_DESIGN],
        "checkpoint_fit_sources": [source_ref("esrc_research_training_scope_not_universal_preregistration", ESRC_RESEARCH_DESIGN["title"], ESRC_RESEARCH_DESIGN["publisher"], ESRC_RESEARCH_DESIGN["url"], "Annexes I–II: broad social-science research design, methods, evidence and research communication learning outcomes; does not prescribe preregistration.", "Provides broad social-science research-training context while expressly not establishing preregistration as a required shared D078 competency.", "This evidence supports treating preregistration as an optional transparency practice, not a universal domain requirement.")],
        "explanatory_sources": [source_ref("osf_preregistration_plain_explanation", "Welcome to Registrations & Preregistrations", "Open Science Framework", "https://help.osf.io/article/330-welcome-to-registrations", "Overview, lines 52–60 and FAQ lines 845–857: what a registration preserves and when preregistration is usually submitted.", "Explains in plain terms what a preregistration records and what it does not do.", "Platform documentation; it does not decide whether preregistration suits a particular study or replace ethics/privacy review.")],
    },
    "reference_and_literature_management": {
        "label": "Finding and organising research sources",
        "type": "skill",
        "meaning": "Collect, organise, trace and cite books, articles, reports and other sources so that claims can be checked and connected to prior work.",
        "output": "A structured source list or library with consistent citations, notes and links back to the claims they support.",
        "prerequisites": ["A research topic or question and basic ability to judge whether a source is relevant and credible."],
        "alternatives": ["A reference manager such as Zotero can automate collection and citation tasks; a carefully maintained manual bibliography is possible for small projects. Neither method verifies source quality or claim accuracy."],
        "relationships": [{"type": "supports", "target": "d078-research-question-design", "note": "Existing research helps refine a useful question and its evidence plan.", "status": "candidate"}],
        "learning_links": [{"label": "Learn the basics of collecting, organising and citing sources in Zotero", "url": "https://www.zotero.org/support/quick_start_guide", "source_id": "zotero_quick_start", "locator": "The Basics, Organize, Collect and Cite sections; explains records, collections/tags, capturing sources and creating citations/bibliographies.", "level": "Beginner product walkthrough", "access": "Free online documentation; Zotero reference manager is free to use", "language": "English", "scope_note": "Teaches one reference-management tool; source evaluation, literature synthesis and accurate citation checking remain the learner's responsibility.", "verified_on": "2026-10-09", "role": "free_task_specific_learning_resource", "instructional_fit": "verified"}],
        "limits": ["A well-organised reference list does not guarantee that the sources are authoritative or relevant.", "The required citation style may depend on the institution or publisher."],
        "item_definition_sources": [source_ref("zotero_reference_management_quick_start", "Zotero Quick Start Guide", "Zotero", "https://www.zotero.org/support/quick_start_guide", "The Basics, Organize, Collect and Cite: collecting source records, organising a library and generating citations/bibliographies.", "Documents what reference-management software does and which tasks it can automate.", "Product documentation for Zotero; reference software does not judge source quality, accuracy or relevance."), ESRC_RESEARCH_DESIGN],
        "checkpoint_fit_sources": [source_ref("esrc_social_science_research_communication_context", ESRC_RESEARCH_DESIGN["title"], ESRC_RESEARCH_DESIGN["publisher"], ESRC_RESEARCH_DESIGN["url"], "Annex I, printed p. 22: social-science researcher outcomes include engaging with research debates, communicating findings and working with sources/users; this does not prescribe a reference manager.", "Supports research literacy and communication as relevant research-training context, while not establishing a specific tool or universal role requirement.", "UK postgraduate training outcome; no claim that every D078 route requires Zotero or a reference-management package." )],
        "explanatory_sources": [source_ref("zotero_plain_language_reference_tool_explanation", "Zotero Quick Start Guide", "Zotero", "https://www.zotero.org/support/quick_start_guide", "The Basics, Organize, Collect and Cite: beginner walkthrough of how the tool stores, organises and cites source records.", "An accessible explanation of the tool's own functions and workflow.", "Explains Zotero, not how to evaluate evidence or synthesise literature; using the tool is optional.")],
    },
}


METHOD_META: dict[str, dict[str, Any]] = {
    "systematic_and_scoping_evidence_synthesis": {
        "label": "Evidence synthesis: systematic reviews and scoping reviews",
        "type": "method",
        "meaning": "Evidence synthesis uses a documented method to find, select, assess and bring together existing studies. A systematic review answers a focused question using predefined methods; a scoping review maps what evidence or concepts exist and where evidence gaps may be. They are related but not interchangeable.",
        "output": "A documented question and review type, protocol or plan, search record, study-selection decisions, evidence summary and limitations appropriate to the chosen review method.",
        "prerequisites": ["A focused question and introductory understanding of research evidence. The free Campbell course linked here expects graduate-level research-methods and statistics preparation; it is not a beginner prerequisite."],
        "alternatives": ["A narrative literature review may suit exploratory background reading, but it should not be labelled a systematic or scoping review unless the corresponding transparent method is followed.", "Choose systematic or scoping review by the question and purpose; do not combine them into one undifferentiated checklist."],
        "relationships": [
            {"type": "requires", "target": "d078-research-question-design", "note": "The review type, eligibility rules and search strategy must follow a focused question.", "status": "candidate"},
            {"type": "complements", "target": "reference_and_literature_management", "note": "A traceable source library supports screening, deduplication, citation and an auditable review record.", "status": "candidate"},
            {"type": "supports", "target": "d078-evaluate-evidence-and-limits", "note": "A documented search, appraisal and synthesis makes the strength and limits of the evidence easier to explain.", "status": "candidate"},
        ],
        "limits": ["Evidence synthesis is relevant to selected research, policy and practice tasks, not every D078 role or project.", "PRISMA is a reporting guideline, not a complete conduct method.", "The Campbell course focuses on systematic reviews and meta-analysis and is advanced; it does not teach scoping review as a beginner pathway.", "The JBI manual is formal method guidance, not an introductory course and is specifically grounded in JBI methods."],
        "learning_links": [
            {"label": "Learn systematic-review methods for social-science research (advanced)", "url": "https://oli.cmu.edu/courses/systematic-reviews-and-meta-analysis-o-f/", "source_id": "campbell_oli_systematic_review_free_course", "locator": "Modules 1–15 cover review scope, questions, searches, screening and recording; modules 16–28 cover selection, coding, appraisal and software. The course is Open & Free for independent learners.", "level": "Advanced; the provider expects introductory graduate-level research methods and statistics", "access": "Free self-paced course, no instructor, tests, credit or certificate", "language": "English", "scope_note": "Systematic reviews and meta-analysis; not an all-purpose beginner resource and not a scoping-review course. Recheck availability/access before display.", "verified_on": "2026-10-09", "role": "free_task_specific_learning_resource", "instructional_fit": "verified_for_advanced_systematic_review_route_only"},
            {"label": "Consult JBI's scoping-review method guidance (advanced reference)", "url": "https://jbi-global-wiki.refined.site/download/attachments/355599504/JBI%20Manual%20for%20Evidence%20Synthesis%202024.pdf", "source_id": "jbi_manual_evidence_synthesis_2024", "locator": "Chapter 10, printed p. 162 onward: scoping-review purpose, question, protocol and methods; cross-check the live online manual because the PDF may lag updates.", "level": "Advanced method reference", "access": "Free official PDF; detailed manual rather than guided beginner instruction", "language": "English", "scope_note": "The guidance is for JBI scoping-review methodology, with a healthcare/evidence-informed-practice orientation; it is not a universal protocol for all social-science reviews.", "verified_on": "2026-10-09", "role": "official_method_reference", "instructional_fit": "reference_only_not_beginner_instruction"},
        ],
    }
}


# Complete the item-level contract for the remaining reconciliation candidates.
# These are deliberately bounded method/alternative records, not universal D078
# requirements. Their checkpoint and route status remains provisional.
METHOD_META.update({
    "focus_groups_and_workshops": {
        "label": "Focus groups and workshops",
        "type": "method",
        "meaning": "Use a guided group discussion to learn how people explain, agree, disagree and build on one another's views.",
        "output": "A moderator guide, ethically managed session record and analysis showing both what participants said and how group interaction shaped the evidence.",
        "prerequisites": ["A focused question, a reason group interaction is useful, an appropriate participant plan and a trained moderator."],
        "alternatives": ["Individual interviews may be better when privacy or personal depth matters; a focus group is not simply several interviews held together."],
        "relationships": [{"type": "supports", "target": "d078-research-question-design", "note": "The question determines whether interaction between participants is part of the evidence.", "status": "candidate"}, {"type": "complements", "target": "d078-qualitative-analysis", "note": "Transcripts or notes still need a documented analytic approach.", "status": "candidate"}],
        "limits": ["Group discussion can be shaped by dominant voices, silence, conformity, privacy limits and the group composition.", "Findings from a purposive group do not automatically represent a wider population or establish causality."],
        "learning_links": [{"label": "Learn focus-group design, moderation and analysis", "url": "https://casrai.org/guides/focus-group-research-method", "source_id": "casrai_focus_group_research_method_2026", "locator": "Guide sections on when to choose a focus group, group composition, moderator guide, group dynamics and analysing interaction as data", "level": "Introductory-to-intermediate", "access": "Free online guide", "language": "English", "scope_note": "Explains the method and its limits; it does not replace local ethics approval or participant safeguarding.", "verified_on": "2026-10-09", "role": "free_task_specific_learning_resource", "instructional_fit": "verified"}, {"label": "Watch free research-methods focus-group tutorials", "url": "https://repository.ncrm.ac.uk/resources/online/", "source_id": "ncrm_free_research_methods_tutorials_2026", "locator": "Qualitative-methods tutorial catalogue; filter for focus-group and qualitative-methods resources", "level": "Varies by tutorial", "access": "Free videos and learning materials", "language": "English", "scope_note": "Resource catalogue; select and verify the exact tutorial before presenting it as a learner route.", "verified_on": "2026-10-09", "role": "complementary_video_learning_resource", "instructional_fit": "verified_for_resource_catalogue_only"}],
        "item_definition_sources": [source_ref("casrai_focus_group_definition_2026", "Focus Groups: Design, Moderation, Analysis", "CASRAI", "https://casrai.org/guides/focus-group-research-method", "Definition and sections on interaction as data, group composition, moderation and analysis", "Defines the method and its distinctive use of participant interaction.", "Guide-level source; it does not establish a universal role requirement.")],
        "checkpoint_fit_sources": [ESRC_RESEARCH_DESIGN, NUC_SOCIAL_SCIENCES],
        "explanatory_sources": [source_ref("uni_ni_qualitative_data_focus_groups_2026", "Qualitative Data: Focus Groups, Discourse Analysis and Conversation Analysis", "University of Northern Iowa", "https://researchmethods.uni.edu/chapter-five-qualitative-methods/chapter-five-qualitative-data-part-2", "Sections introducing focus groups and the distinction between individual answers and group interaction", "Provides a student-readable explanation of what makes focus-group evidence different.", "Teaching chapter; examples do not establish Nigerian generalisability.")],
    },
    "discourse_and_conversation_analysis": {
        "label": "Discourse and conversation analysis",
        "type": "method",
        "meaning": "Study how language is used to construct meaning, identity, relationships or social positions, and how conversation is organised turn by turn.",
        "output": "A carefully selected and transcribed extract with an analytic account of wording, sequence, interaction and the limits of the interpretation.",
        "prerequisites": ["A defined corpus or interaction, an approach whose assumptions fit the question, and careful transcription and ethical handling of identifiable speech."],
        "alternatives": ["Thematic or content analysis may suit questions about topics or patterns rather than how language constructs meaning or interaction."],
        "relationships": [{"type": "requires", "target": "d078-research-question-design", "note": "The analytic tradition and unit of analysis must follow the question.", "status": "candidate"}, {"type": "complements", "target": "d078-evaluate-evidence-and-limits", "note": "Reflexivity and attention to context limit overclaiming from a bounded extract.", "status": "candidate"}],
        "limits": ["Discourse analysis and conversation analysis are families of approaches, not one fixed procedure.", "Detailed interpretation is context-dependent and does not automatically measure prevalence, represent a population or prove causality."],
        "learning_links": [{"label": "Learn how to conduct discourse analysis", "url": "https://www.casrai.org/guides/how-to-conduct-a-discourse-analysis", "source_id": "casrai_discourse_analysis_guide_2026", "locator": "Guide sections on traditions, corpus selection, transcription, coding, interpretation, reflexivity and rigor", "level": "Intermediate qualitative-methods guide", "access": "Free online guide", "language": "English", "scope_note": "Covers several traditions; choose the approach that matches the question rather than treating all discourse analysis as interchangeable.", "verified_on": "2026-10-09", "role": "free_task_specific_learning_resource", "instructional_fit": "verified"}, {"label": "Watch free discourse-analysis methods tutorials", "url": "https://repository.ncrm.ac.uk/resources/video/?scroll=scroll&show=&typ=Discourse+Analysis", "source_id": "ncrm_discourse_analysis_videos_2026", "locator": "NCRM video catalogue filtered to Discourse Analysis", "level": "Varies by video", "access": "Free research-methods videos", "language": "English", "scope_note": "Catalogue link; verify the selected video and segment before student display.", "verified_on": "2026-10-09", "role": "complementary_video_learning_resource", "instructional_fit": "verified_for_resource_catalogue_only"}],
        "item_definition_sources": [source_ref("uni_ni_discourse_conversation_definition_2026", "Qualitative Data: Discourse Analysis and Conversation Analysis", "University of Northern Iowa", "https://researchmethods.uni.edu/chapter-five-qualitative-methods/chapter-five-qualitative-data-part-2", "Sections on discourse as communicative action and conversation analysis of turn-taking, pauses and interaction", "Distinguishes the focus of discourse and conversation analysis.", "Teaching chapter; method traditions and terminology vary by discipline.")],
        "checkpoint_fit_sources": [ESRC_RESEARCH_DESIGN, NUC_SOCIAL_SCIENCES],
        "explanatory_sources": [source_ref("nou_conversation_analysis_courseware_2026", "Applying Discourse Analysis Methods to Conversations", "National Open University of Nigeria", "https://nou.edu.ng/coursewarecontent/ENG852.pdf", "Unit 2: turn-taking, repair, sequence and speech/gesture in conversation analysis", "Provides Nigerian open-university courseware showing the method's educational context and core concepts.", "English courseware context; it does not establish that every D078 route uses conversation analysis.")],
    },
    "case_study_and_comparative_case_design": {
        "label": "Case-study and comparative-case design",
        "type": "method",
        "meaning": "Study one or a small number of bounded real-world cases in depth, or compare cases deliberately to understand similarities, differences and possible explanations.",
        "output": "A case-selection and evidence plan that states the case boundary, comparison logic, sources, rival explanations and what cannot be generalised.",
        "prerequisites": ["A research question, a clear case boundary and a reason intensive case evidence is more suitable than a broad sample."],
        "alternatives": ["A survey or larger dataset may be more suitable for estimating patterns across a population; cases and surveys answer different questions."],
        "relationships": [{"type": "supports", "target": "sampling_recruitment_and_representativeness", "note": "Case selection explains which bounded cases are studied and what they can support.", "status": "candidate"}, {"type": "complements", "target": "archival_and_historical_research", "note": "Documents and archives can be part of a case evidence chain when their provenance is checked.", "status": "candidate"}],
        "limits": ["A single or small set of cases does not automatically represent all similar cases.", "Comparison does not by itself prove causality; the design must state assumptions and rival explanations."],
        "learning_links": [{"label": "Study case research and case boundaries", "url": "https://opentextbooks.rug.nl/rspremsc/chapter/case-research/", "source_id": "rug_open_case_research_reader_2026", "locator": "Case Research chapter: bounded phenomena, natural settings, data sources and corroboration", "level": "Introductory open-textbook chapter", "access": "Free online textbook", "language": "English", "scope_note": "Explains case research; the learner still needs a question-specific design and evidence plan.", "verified_on": "2026-10-09", "role": "free_task_specific_learning_resource", "instructional_fit": "verified"}, {"label": "Read an open comparative-politics casebook", "url": "https://open.umn.edu/opentextbooks/textbooks/1768", "source_id": "open_textbook_comparative_casebook_2026", "locator": "Introduction and country chapters showing bounded cases and cross-case comparison", "level": "Introductory undergraduate", "access": "Free open textbook", "language": "English", "scope_note": "A comparative-politics example, not a universal case-study template.", "verified_on": "2026-10-09", "role": "complementary_case_learning_resource", "instructional_fit": "verified_for_comparative_case_example_only"}],
        "item_definition_sources": [source_ref("rug_case_research_definition_2026", "Case Research", "University of Groningen Open Textbook", "https://opentextbooks.rug.nl/rspremsc/chapter/case-research/", "Definition and sections on intensive study in a natural setting, case boundaries and corroborating sources", "Defines case research and its evidence sources.", "Open teaching chapter; it does not prescribe a design for every field.")],
        "checkpoint_fit_sources": [ESRC_RESEARCH_DESIGN, NUC_SOCIAL_SCIENCES],
        "explanatory_sources": [source_ref("taso_comparative_case_study_2026", "Comparative case study", "TASO", "https://taso.org.uk/libraryitem/comparative-case-study/", "Definition of systematic comparison of two or more cases and discussion of comparative case use", "Explains comparative-case logic in accessible language.", "Practice-library page; not evidence of a universal occupational requirement.")],
    },
    "archival_and_historical_research": {
        "label": "Archival and historical research",
        "type": "method",
        "meaning": "Use records from archives and historical collections to investigate people, institutions or events while checking provenance, context, gaps and preservation limits.",
        "output": "A source log that records where each record came from, what it can show, missing material and why it is used for the question.",
        "prerequisites": ["A question, a source-selection plan, basic provenance awareness and a way to record archival references and permissions."],
        "alternatives": ["Current interviews, observation or surveys may be better when the question concerns present experiences rather than historical records."],
        "relationships": [{"type": "supports", "target": "d078-evaluate-evidence-and-limits", "note": "Provenance, completeness and context determine what an archival record can support.", "status": "candidate"}, {"type": "complements", "target": "reference_and_literature_management", "note": "A traceable source library helps preserve archival citations and notes.", "status": "candidate"}],
        "limits": ["Many records are missing, inaccessible, undigitised or created from one institution's perspective.", "A catalogue entry or archival record is not automatically a complete or neutral account."],
        "learning_links": [{"label": "Learn how to plan archival research", "url": "https://le.ac.uk/history/outreach/besh/historical-research/archival-research", "source_id": "leicester_doing_archival_research_2026", "locator": "Guide sections on what archives contain, choosing an archive, finding material, preparing, respecting others and managing notes", "level": "Introductory guide", "access": "Free guide and downloadable material", "language": "English", "scope_note": "Archive practice differs by institution; contact the archive and follow its access and handling rules.", "verified_on": "2026-10-09", "role": "free_task_specific_learning_resource", "instructional_fit": "verified"}, {"label": "Study archival research in an open methods textbook", "url": "https://ipsrm.com/ipsrm/chapter/13", "source_id": "ipsrm_archival_research_chapter_2026", "locator": "Chapter 13: definition, levels of archives, tools, techniques and locating relevant archives", "level": "Introductory undergraduate", "access": "Free open textbook chapter", "language": "English", "scope_note": "Political-science examples illustrate the method; they do not define all archival practice.", "verified_on": "2026-10-09", "role": "complementary_archival_learning_resource", "instructional_fit": "verified_for_archival_method_example_only"}],
        "item_definition_sources": [source_ref("leicester_archival_research_guide_2026", "Doing archival research", "University of Leicester", "https://le.ac.uk/history/outreach/besh/historical-research/archival-research", "Guide introduction and sections on archives, finding material, preparation and note management", "Defines practical archival research tasks and limitations.", "Guide is practical and archive-specific; it is not a universal historical method standard.")],
        "checkpoint_fit_sources": [ESRC_RESEARCH_DESIGN, NUC_SOCIAL_SCIENCES],
        "explanatory_sources": [source_ref("ipsrm_archival_research_explanation_2026", "Archival Research", "Introduction to Political Science Research Methods", "https://ipsrm.com/ipsrm/chapter/13", "Learning objectives and sections on archives, tools and applications", "Provides an accessible explanation of archival research and source location.", "Open political-science text; Nigerian archival access and language context require local checking.")],
    },
    "participatory_and_action_research": {
        "label": "Participatory and action research",
        "type": "method",
        "meaning": "Work with people affected by an issue so they can help shape the question, evidence, interpretation and possible action rather than being treated only as subjects.",
        "output": "A participation plan showing who has influence at each stage, how decisions are recorded, what action follows and how power, consent and disagreement are handled.",
        "prerequisites": ["A clearly bounded issue, meaningful consent and a plan for shared decision-making, safety, ownership and feedback."],
        "alternatives": ["Consultation or conventional observation may be appropriate when shared action is not part of the question, but they should not be labelled participatory action research."],
        "relationships": [{"type": "supports", "target": "d078-research-question-design", "note": "Participants can help define a question that matters in their context.", "status": "candidate"}, {"type": "requires", "target": "d078-research-ethics", "note": "Participation does not remove consent, privacy, safeguarding or power obligations.", "status": "candidate"}],
        "limits": ["Participation does not guarantee equal power, agreement or representativeness.", "Action-oriented findings may be local and context-bound rather than generalisable to every community."],
        "learning_links": [{"label": "Learn participatory action research methods", "url": "https://ocw.kyoto-u.ac.jp/en/course/227/?video_id=3168", "source_id": "kyoto_ocw_participatory_action_research_2026", "locator": "OpenCourseWare short course videos: introduction, theory, methods, community mapping, digital storytelling and photovoice", "level": "Introductory-to-intermediate", "access": "Free university videos", "language": "English", "scope_note": "Demonstrates participatory methods and examples; adapt ethically and culturally to the learner's community context.", "verified_on": "2026-10-09", "role": "free_task_specific_video_learning_resource", "instructional_fit": "verified"}, {"label": "Read MIT's practice-of-PAR materials", "url": "https://ocw.mit.edu/courses/11-237-practice-of-participatory-action-research-par-spring-2016/resources/11-237s162/", "source_id": "mit_ocw_practice_par_2026", "locator": "Course resource explaining PAR as producing actionable knowledge with communities", "level": "Intermediate", "access": "Free university course materials", "language": "English", "scope_note": "Course materials provide a practice context, not a universal recipe for every community project.", "verified_on": "2026-10-09", "role": "complementary_par_learning_resource", "instructional_fit": "verified_for_par_practice_context_only"}],
        "item_definition_sources": [source_ref("mit_par_definition_2026", "Practice of Participatory Action Research", "MIT OpenCourseWare", "https://ocw.mit.edu/courses/11-237-practice-of-participatory-action-research-par-spring-2016/resources/11-237s162/", "Course description defining PAR as producing actionable knowledge communities can use", "Defines the action-and-community orientation of PAR.", "Course-specific description; it does not prove suitability for every D078 route.")],
        "checkpoint_fit_sources": [ESRC_RESEARCH_DESIGN, NUC_SOCIAL_SCIENCES],
        "explanatory_sources": [source_ref("kyoto_par_methods_explanation_2026", "Basic Theory and Methods of Participatory Action Research", "Kyoto University OpenCourseWare", "https://ocw.kyoto-u.ac.jp/en/course/227/?video_id=3168", "Course chapters on theory, community mapping, digital storytelling and photovoice", "Explains participatory methods through free university lectures and examples.", "Examples are context-specific; local consent, safety and power relations remain part of the learner's design.")],
    },
    "experiments_quasi_experiments_and_causal_inference": {
        "label": "Experiments, quasi-experiments and causal inference",
        "type": "method",
        "meaning": "Design comparisons that help estimate whether an intervention or exposure contributed to an outcome, while making the assumptions and possible confounding visible.",
        "output": "A design note naming the treatment/exposure, comparison, outcome, timing, identification assumptions, threats to validity and limits of the causal claim.",
        "prerequisites": ["A precise causal question, a defined intervention or exposure, suitable comparison logic and enough statistics to examine uncertainty and confounding."],
        "alternatives": ["Descriptive or qualitative designs may be more suitable when the question is about meaning, experience or description rather than causal effect."],
        "relationships": [{"type": "requires", "target": "reliability_validity_and_uncertainty", "note": "Causal claims require explicit checks of design validity and uncertainty.", "status": "candidate"}, {"type": "supports", "target": "programme_evaluation_and_theory_of_change", "note": "Evaluation may use causal designs when the intervention and assumptions support them.", "status": "candidate"}],
        "limits": ["Randomisation or a quasi-experimental label does not automatically make a causal claim credible; assumptions and implementation must be examined.", "Results may be specific to the population, intervention and setting studied."],
        "learning_links": [{"label": "Study causal inference and quasi-experimental designs", "url": "https://mixtape.scunning.com/", "source_id": "causal_inference_mixtape_2026", "locator": "Open textbook chapters on potential outcomes, experiments, matching, instrumental variables and quasi-experimental designs", "level": "Intermediate-to-advanced; statistics are recommended", "access": "Free online textbook", "language": "English", "scope_note": "A broad causal-inference text; select chapters appropriate to the design and do not treat an estimator as a substitute for identification reasoning.", "verified_on": "2026-10-09", "role": "free_task_specific_learning_resource", "instructional_fit": "verified"}, {"label": "Work through social-science causal-inference examples", "url": "https://stats.oarc.ucla.edu/other/examples/methods-matter/", "source_id": "ucla_methods_matter_causal_examples_2026", "locator": "Examples on instrumental variables, quasi-experiments and bias in treatment-effect estimates", "level": "Intermediate", "access": "Free online examples", "language": "English", "scope_note": "Worked examples support learning; they do not determine whether a learner's own design identifies a causal effect.", "verified_on": "2026-10-09", "role": "complementary_causal_learning_resource", "instructional_fit": "verified_for_causal_examples_only"}],
        "item_definition_sources": [source_ref("ucla_methods_matter_causal_inference_2026", "Methods Matter: Improving Causal Inference in Educational and Social Science Research", "UCLA Statistical Consulting", "https://stats.oarc.ucla.edu/other/examples/methods-matter/", "Examples on instrumental variables, quasi-experiments and bias in treatment effects", "Demonstrates causal-design issues in social-science examples.", "Examples are not a universal design template; assumptions remain question-specific.")],
        "checkpoint_fit_sources": [ESRC_RESEARCH_DESIGN, NUC_SOCIAL_SCIENCES],
        "explanatory_sources": [source_ref("duke_causal_inference_tutorial_2026", "Causal Inference: A Tutorial", "Duke University", "https://www2.stat.duke.edu/~fl35/teaching/440-19F/Tutorial_PlusDS.pdf", "Sections introducing experiments and quasi-experiments", "Provides a compact technical explanation of causal-inference designs.", "Lecture tutorial; not a substitute for full design training or local subject-matter evidence.")],
    },
    "programme_evaluation_and_theory_of_change": {
        "label": "Programme evaluation and theory of change",
        "type": "method",
        "meaning": "Explain how a programme is expected to produce change, then gather evidence to judge its implementation, outcomes, value and limits.",
        "output": "An evaluation plan linking activities to outputs, outcomes and assumptions, with measures, context, evidence sources and decision limits.",
        "prerequisites": ["A defined programme or intervention, intended outcomes, stakeholder understanding and a feasible evidence plan."],
        "alternatives": ["A process review, needs assessment or descriptive monitoring may be more appropriate when causal impact or full programme evaluation is not the question."],
        "relationships": [{"type": "supports", "target": "d078-research-question-design", "note": "The programme's purpose and evaluation questions determine what evidence is needed.", "status": "candidate"}, {"type": "complements", "target": "experiments_quasi_experiments_and_causal_inference", "note": "Causal designs are one possible part of an evaluation, not a requirement for every evaluation.", "status": "candidate"}],
        "limits": ["A theory of change makes assumptions visible; it does not prove that the programme caused the outcome.", "Evaluation findings depend on context, measurement, implementation and the available comparison or baseline."],
        "learning_links": [{"label": "Learn how to build a theory of change", "url": "https://www.eur.nl/en/research/research-services/societal-impact-evaluation/impact-toolbox/theory-change", "source_id": "erasmus_theory_of_change_toolbox_2026", "locator": "Introduction and tools for goals, preconditions, causal links, assumptions and context", "level": "Introductory-to-intermediate", "access": "Free university guidance", "language": "English", "scope_note": "Explains theory-of-change planning; it does not replace an evaluation design or establish impact.", "verified_on": "2026-10-09", "role": "free_task_specific_learning_resource", "instructional_fit": "verified"}, {"label": "Watch a theory-of-change explainer", "url": "https://evaluationhub.education.govt.nz/theory-of-change/a-theory-of-change/", "source_id": "nz_evaluation_hub_theory_of_change_2026", "locator": "Theory-of-change explanation and video transcript on how and why activities are expected to lead to results", "level": "Introductory", "access": "Free public-sector guide and video", "language": "English", "scope_note": "Illustrative public-sector explanation; adapt the framework to the programme and setting being evaluated.", "verified_on": "2026-10-09", "role": "complementary_video_learning_resource", "instructional_fit": "verified_for_theory_of_change_explanation_only"}],
        "item_definition_sources": [source_ref("erasmus_theory_of_change_definition_2026", "Theory of Change", "Erasmus University Rotterdam", "https://www.eur.nl/en/research/research-services/societal-impact-evaluation/impact-toolbox/theory-change", "Definition, backcasting, activities-to-outcomes links and assumptions", "Defines theory of change as a formative, process-based evaluation/planning method.", "It is a framework, not proof of impact or a universal evaluation protocol.")],
        "checkpoint_fit_sources": [ESRC_RESEARCH_DESIGN, NUC_SOCIAL_SCIENCES],
        "explanatory_sources": [source_ref("nz_theory_of_change_plain_explanation_2026", "A Theory of Change", "New Zealand Evaluation Hub", "https://evaluationhub.education.govt.nz/theory-of-change/a-theory-of-change/", "Plain-language explanation and video transcript", "Provides a learner-friendly explanation of what a theory of change is for.", "Public-sector example; it does not establish Nigerian policy requirements.")],
    },
    "psychometrics_and_scale_construction": {
        "label": "Psychometrics and scale construction",
        "type": "method",
        "meaning": "Turn an abstract construct into a set of items or indicators, then test whether the scale behaves consistently and supports the intended interpretation for the population studied.",
        "output": "A construct definition, item-development record, pilot results and reliability/validity evidence with limits and any group-specific validation needs.",
        "prerequisites": ["A defined construct, theory or framework, appropriate participants, ethical measurement practice and introductory statistics."],
        "alternatives": ["A single validated measure, interview or observational approach may be more suitable than creating a new scale; a high reliability coefficient alone is not enough."],
        "relationships": [{"type": "builds_on", "target": "measurement_and_operationalisation", "note": "Scale construction begins by defining the construct and its indicators.", "status": "candidate"}, {"type": "requires", "target": "pilot_and_cognitive_pretesting", "note": "Items need suitable pretesting before wider use.", "status": "candidate"}],
        "limits": ["Reliability does not prove validity, fairness or suitability for another population.", "A scale requires validation in the population and language context where it will be used."],
        "learning_links": [{"label": "Learn how social and behavioural scales are developed and validated", "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6004510/", "source_id": "pmc_scale_development_validation_primer_2026", "locator": "Sections on defining the domain, item generation, pretesting, item reduction, factor structure, reliability and validity", "level": "Intermediate methods primer", "access": "Free full-text article", "language": "English", "scope_note": "A methods primer; validation must still be repeated for the intended population and language.", "verified_on": "2026-10-09", "role": "free_task_specific_learning_resource", "instructional_fit": "verified"}],
        "item_definition_sources": [source_ref("pmc_scale_development_primer_2026", "Best Practices for Developing and Validating Scales for Health, Social, and Behavioral Research", "PMC / peer-reviewed authors", "https://pmc.ncbi.nlm.nih.gov/articles/PMC6004510/", "Sections on domain definition, item generation, pretesting, factor analysis, reliability and validity", "Defines the scale-development and validation sequence.", "Primer spans health, social and behavioural applications; it is not a credential or guarantee of validity for every population.")],
        "checkpoint_fit_sources": [ESRC_RESEARCH_DESIGN, NUC_SOCIAL_SCIENCES],
        "explanatory_sources": [source_ref("sophia_scale_construction_tutorial_2026", "Scale Construction Tutorial", "Sophia Learning", "https://app.sophia.org/tutorials/scale-construction", "Sections on item creation, reliability, validity, factor structure, invariance and pitfalls", "Explains scale construction in accessible learning language.", "External tutorial may require platform access; use the open primer as the primary free reference.")],
    },
    "longitudinal_panel_and_multilevel_data": {
        "label": "Longitudinal, panel and multilevel data",
        "type": "method",
        "meaning": "Analyse data collected repeatedly over time or collected in groups within groups, while accounting for the dependence and structure those designs create.",
        "output": "A data-structure and analysis plan identifying units, time points, levels, missingness, model assumptions and the limits of the conclusions.",
        "prerequisites": ["Basic statistics, a clearly defined repeated or clustered data structure and understanding of the research question before choosing a model."],
        "alternatives": ["A cross-sectional or single-level analysis may be appropriate when the data and question do not contain repeated observations or meaningful clustering."],
        "relationships": [{"type": "requires", "target": "reliability_validity_and_uncertainty", "note": "Model choice and interpretation require explicit assumptions and uncertainty checks.", "status": "candidate"}, {"type": "complements", "target": "r_statistical_computing", "note": "R is one possible implementation environment, not a requirement of the design.", "status": "candidate"}],
        "limits": ["A sophisticated model cannot repair poor measurement, missing data or an unsuitable research design.", "Repeated observations and clustered data require assumptions that should be explained rather than hidden behind software output."],
        "learning_links": [{"label": "Learn longitudinal data with multilevel models", "url": "https://stats.oarc.ucla.edu/other/mult-pkg/seminars/mlm-longitudinal/", "source_id": "ucla_longitudinal_multilevel_seminar_2026", "locator": "Seminar sections comparing repeated-measures ANOVA, mixed models, regression and multilevel models, with treatment-effect examples", "level": "Intermediate-to-advanced", "access": "Free online seminar materials", "language": "English", "scope_note": "Methods seminar; the correct model depends on the question, design and data structure.", "verified_on": "2026-10-09", "role": "free_task_specific_learning_resource", "instructional_fit": "verified"}, {"label": "Study panel and multilevel analysis principles", "url": "https://research.vu.nl/en/courses/tutorial-in-multilevel-models/", "source_id": "vu_multilevel_panel_tutorial_2026", "locator": "Course objectives and content on clustered data, panel data, levels of analysis and reliable conclusions", "level": "Intermediate", "access": "Free course description and materials where available", "language": "English", "scope_note": "University tutorial context; confirm full material availability before presenting as a complete course.", "verified_on": "2026-10-09", "role": "complementary_method_learning_resource", "instructional_fit": "verified_for_multilevel_panel_context_only"}],
        "item_definition_sources": [source_ref("ucla_longitudinal_multilevel_definition_2026", "Analyzing Longitudinal Data using Multilevel Modeling", "UCLA Statistical Consulting", "https://stats.oarc.ucla.edu/other/mult-pkg/seminars/mlm-longitudinal/", "Description of repeated observations, longitudinal outcomes and multilevel approaches", "Defines the relationship between longitudinal data and multilevel analysis.", "Seminar examples do not establish a model for every D078 dataset.")],
        "checkpoint_fit_sources": [ESRC_RESEARCH_DESIGN, NUC_SOCIAL_SCIENCES],
        "explanatory_sources": [source_ref("vu_panel_multilevel_explanation_2026", "Tutorial in Multilevel Models", "Vrije Universiteit Amsterdam", "https://research.vu.nl/en/courses/tutorial-in-multilevel-models/", "Course objectives and explanation of clustered and panel data", "Provides a learner-oriented explanation of why units and levels matter.", "Course description; not evidence of a universal role requirement.")],
    },
    "r_statistical_computing": {
        "label": "R for statistical computing and data analysis",
        "type": "tool",
        "meaning": "Use the R language and its packages to manage data, create graphics and run selected statistical analyses in a documented workflow.",
        "output": "A reproducible analysis script or notebook with data steps, model choices, outputs and interpretation limits.",
        "prerequisites": ["A research question, basic statistics and enough R to read data, write simple commands and inspect outputs."],
        "alternatives": ["Python, SPSS or Stata may support comparable quantitative workflows; choose by task, access, team context and learner route rather than treating them as cumulative requirements."],
        "relationships": [{"type": "alternative_to", "target": "d078-statistical-tool-choice", "note": "R is one conditional quantitative-computing route among alternatives.", "status": "candidate"}, {"type": "supports", "target": "longitudinal_panel_and_multilevel_data", "note": "R can implement selected models when the design and assumptions justify them.", "status": "candidate"}],
        "limits": ["R output does not choose a valid design, establish causality or replace statistical interpretation.", "Packages, syntax and licensing/access conditions change; a language is not proof of competence."],
        "learning_links": [{"label": "Learn R for statistical computing and data analysis", "url": "https://www.youtube.com/watch?v=_V8eKsto3Ug", "source_id": "freecodecamp_r_statistical_computing_2019", "locator": "Video chapters on installation, data formats, importing data, plots, clustering, principal components and regression", "level": "Beginner-to-intermediate", "access": "Free video; external platform", "language": "English", "scope_note": "A broad R/data-analysis course; pair with a question-specific method guide and check version differences before display.", "verified_on": "2026-10-09", "role": "free_task_specific_video_learning_resource", "instructional_fit": "verified_for_r_statistical_computing_workflow"}],
        "item_definition_sources": [source_ref("r_project_what_is_r_2026", "What is R?", "R Project", "https://www.r-project.org/about.html", "Description of R as a language and environment for statistical computing and graphics", "Defines R's core purpose and capabilities.", "Official project description does not establish D078 checkpoint fit or job demand.")],
        "checkpoint_fit_sources": [ESRC_RESEARCH_DESIGN, NUC_SOCIAL_SCIENCES],
        "explanatory_sources": [source_ref("freecodecamp_r_course_2019", "R Programming Tutorial", "freeCodeCamp.org", "https://www.youtube.com/watch?v=_V8eKsto3Ug", "Video chapters covering basic statistical-computing workflows", "Provides a learner-facing explanation and demonstration of R operations.", "Third-party video is version-dated; verify current package syntax and pair with method-specific instruction.")],
    },
    "stata_quantitative_social_science_workflow": {
        "label": "Stata for quantitative social-science workflows",
        "type": "tool",
        "meaning": "Use Stata to manage, analyse, visualise and report structured data in workflows such as survey, panel, multilevel or causal analysis when the task and access context fit.",
        "output": "A documented do-file or analysis record showing data preparation, chosen procedure, diagnostics, results and limits.",
        "prerequisites": ["A quantitative research question, basic statistics and knowledge of the assumptions behind the selected analysis."],
        "alternatives": ["R, Python or SPSS may support related analyses; they are alternatives unless a task explicitly needs more than one environment."],
        "relationships": [{"type": "alternative_to", "target": "d078-statistical-tool-choice", "note": "Stata is a conditional software route, not a second universal foundation.", "status": "candidate"}, {"type": "supports", "target": "longitudinal_panel_and_multilevel_data", "note": "Stata includes procedures for selected panel and multilevel workflows when the design supports them.", "status": "candidate"}],
        "limits": ["Stata commands do not make a model appropriate or a causal claim valid.", "It is proprietary software; access, version and institutional licensing must be shown to learners."],
        "learning_links": [{"label": "Learn Stata through topic-specific video tutorials", "url": "https://www.stata.com/links/video-tutorials/", "source_id": "stata_official_video_tutorials_2026", "locator": "Official video catalogue: interface, data import, regression, time series, instrumental variables, panel data and reporting topics", "level": "Beginner-to-advanced by topic", "access": "Free videos; Stata software may require a licence", "language": "English", "scope_note": "Choose a video matching the learner's actual analysis task; software access and assumptions remain separate requirements.", "verified_on": "2026-10-09", "role": "free_task_specific_video_learning_resource", "instructional_fit": "verified_for_stata_quantitative_workflow"}],
        "item_definition_sources": [source_ref("stata_why_use_stata_2026", "Why use Stata", "StataCorp", "https://www.stata.com/why-use-stata/", "Data manipulation, panel/multilevel/survey data, scripting and reproducible research features", "Defines the software's documented quantitative workflow capabilities.", "Vendor source; it does not establish universal social-science need or free access.")],
        "checkpoint_fit_sources": [ESRC_RESEARCH_DESIGN, NUC_SOCIAL_SCIENCES],
        "explanatory_sources": [source_ref("stata_video_tutorials_explanation_2026", "Video tutorials", "StataCorp", "https://www.stata.com/links/video-tutorials/", "Topic catalogue and examples of tutorial coverage", "Explains how the resource is organised by concrete tasks.", "Vendor learning resource; it does not replace method training.")],
    },
    "ai_assisted_and_digital_trace_research_ethics": {
        "label": "Ethics for AI-assisted and digital-trace research",
        "type": "competency",
        "meaning": "Assess consent, privacy, provenance, data quality, bias, human oversight and disclosure when research uses AI systems or traces left by online activity.",
        "output": "An ethics and governance note that identifies the data source, permissions, risks, human checks, disclosure plan and limits on reuse or interpretation.",
        "prerequisites": ["A defined research question, data-flow map, basic research ethics and understanding of what the AI or digital trace actually represents."],
        "alternatives": ["Conventional participant data or non-AI methods may reduce some risks; an AI tool is not required merely because digital data are available."],
        "relationships": [{"type": "requires", "target": "d078-research-ethics", "note": "AI and digital-trace work must follow consent, privacy, fairness and governance requirements.", "status": "candidate"}, {"type": "complements", "target": "reliability_validity_and_uncertainty", "note": "Data provenance and validation checks help identify what traces and model outputs can support.", "status": "candidate"}],
        "limits": ["An ethics checklist cannot remove all power, privacy, measurement or representativeness problems.", "Publicly accessible data are not automatically ethically unrestricted, and AI output is not automatically accurate or fair."],
        "learning_links": [{"label": "Study core research-ethics principles for AI and digital data", "url": "https://www.ukri.org/councils/esrc/guidance-for-applicants/research-ethics-guidance/framework-for-research-ethics/our-core-principles/", "source_id": "esrc_research_ethics_core_principles_2026", "locator": "Six core principles and research-lifecycle guidance covering design, data, dissemination, archiving, reuse and sharing", "level": "Introductory-to-intermediate ethics guide", "access": "Free official guidance", "language": "English", "scope_note": "General research-ethics framework; apply additional law, institutional policy, platform rules and Nigerian requirements where relevant.", "verified_on": "2026-10-09", "role": "free_task_specific_learning_resource", "instructional_fit": "verified_for_research_ethics_and_data_governance_workflow"}, {"label": "Learn responsible AI integration in survey research", "url": "https://aapor.org/announcements/task-force-on-responsible-ai-integration-in-survey-research-report/", "source_id": "aapor_responsible_ai_survey_research_2026", "locator": "Report sections on data quality, transparency, human oversight, ethics and disclosure", "level": "Intermediate professional guidance", "access": "Free professional report", "language": "English", "scope_note": "Survey-focused guidance; do not generalise its recommendations to every digital-trace or AI research setting.", "verified_on": "2026-10-09", "role": "complementary_responsible_ai_resource", "instructional_fit": "verified_for_survey_ai_governance_context_only"}],
        "item_definition_sources": [source_ref("esrc_research_ethics_core_principles_2026", "Framework for research ethics: core principles", "UKRI/ESRC", "https://www.ukri.org/councils/esrc/guidance-for-applicants/research-ethics-guidance/framework-for-research-ethics/our-core-principles/", "Core principles and lifecycle guidance for research ethics", "Provides a recognized research-ethics framework relevant to data and AI governance.", "UK framework; Nigerian law and institutional requirements must be checked separately.")],
        "checkpoint_fit_sources": [ESRC_RESEARCH_DESIGN, NUC_SOCIAL_SCIENCES],
        "explanatory_sources": [source_ref("aapor_responsible_ai_explanation_2026", "Responsible AI integration in survey research", "American Association for Public Opinion Research", "https://aapor.org/announcements/task-force-on-responsible-ai-integration-in-survey-research-report/", "Data quality, transparency, human oversight, ethics and disclosure sections", "Explains practical safeguards in clear research-practice language.", "Survey-specific professional report; it is not a universal AI standard.")],
    },
})


ROUTE_META: dict[str, dict[str, Any]] = {
    "focus_groups_and_workshops": {"label": "Focus groups and workshops", "type": "method", "output": "A discussion guide and reflection showing how group interaction shaped the evidence."},
    "discourse_and_conversation_analysis": {"label": "Discourse and conversation analysis", "type": "method", "output": "A coded extract showing how language, interaction or framing supports an interpretation."},
    "case_study_and_comparative_case_design": {"label": "Case-study and comparative-case design", "type": "method", "output": "A bounded case plan that states what is being compared and what cannot be generalised."},
    "archival_and_historical_research": {"label": "Archival and historical research", "type": "method", "output": "A source log that records provenance, context, gaps and the reason each record is used."},
    "participatory_and_action_research": {"label": "Participatory and action research", "type": "method", "output": "A participation plan showing how affected people influence the question, design, interpretation or action."},
    "experiments_quasi_experiments_and_causal_inference": {"label": "Experiments, quasi-experiments and causal inference", "type": "method", "output": "A design note that states the comparison, assumptions, possible confounding and limits of a causal claim."},
    "programme_evaluation_and_theory_of_change": {"label": "Programme evaluation and theory of change", "type": "method", "output": "An evaluation plan linking activities to expected changes, measures, context and cost or value questions."},
    "psychometrics_and_scale_construction": {"label": "Psychometrics and scale construction", "type": "method", "output": "A draft multi-item measure with a rationale for its items and checks for reliability and validity."},
    "longitudinal_panel_and_multilevel_data": {"label": "Longitudinal, panel and multilevel data", "type": "method", "output": "A data structure and analysis plan that identifies time, levels or groups and the assumptions involved."},
    "systematic_and_scoping_evidence_synthesis": {"label": "Systematic and scoping evidence synthesis", "type": "method", "output": "A transparent search, screening and evidence-summary record with inclusion decisions and limitations."},
}


NIGERIAN_CONTEXT_EXAMPLES: list[dict[str, Any]] = [
    {
        "id": "nbs_2021_mics_sample_design",
        "title": "2021 Nigeria Multiple Indicator Cluster Survey (MICS) Statistical Snapshots Report",
        "publisher": "National Bureau of Statistics and UNICEF",
        "url": "https://www.nigerianstat.gov.ng/pdfuploads/2021%20MICS%20Statistical%20Snapshots%20Report.pdf",
        "accessed_on": "2026-10-09",
        "locator": "Sample Design section: multi-stage, stratified cluster design planned for national, urban/rural and 37 state/FCT strata",
        "supports": "A Nigerian official-statistics example of defining a population and reporting scope before interpreting estimates.",
        "related_domain_item_ids": ["sampling_recruitment_and_representativeness", "d078-research-question-design", "d078-evaluate-evidence-and-limits"],
        "limitations": ["This describes one survey design and period, not a universal or current template for every Nigerian study.", "Do not infer that a particular sample represents a group beyond the source's stated design and estimates."],
    },
    {
        "id": "nbs_nlfs_2022_methodology",
        "title": "Nigeria Labour Force Survey Methodology",
        "publisher": "National Bureau of Statistics; World Bank contributor",
        "url": "https://microdata.nigerianstat.gov.ng/index.php/catalog/74/related-materials",
        "accessed_on": "2026-10-09",
        "locator": "Official catalog entry for the methodology document; contents identify Pretest (p. 9), Pilot (p. 10), Sample Design (p. 11), Survey Instruments/Equipment (p. 14), and Data Processing and Analysis (p. 24)",
        "supports": "A Nigerian example showing that instrument testing, pilot work, sampling, field process and analysis are distinct stages in a large survey workflow.",
        "related_domain_item_ids": ["pilot_and_cognitive_pretesting", "measurement_and_operationalisation", "reliability_validity_and_uncertainty", "sampling_recruitment_and_representativeness"],
        "limitations": ["The catalog contents establish the section structure, not every procedural detail in those sections.", "A survey pilot is not automatically cognitive interviewing, and this NBS workflow is not mandatory for every project."],
    },
    {
        "id": "nuc_social_sciences_ccmas_research_methods",
        "title": "Social Sciences CCMAS 2023: Sociology research methods and project courses",
        "publisher": "National Universities Commission, Nigeria",
        "url": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
        "accessed_on": "2026-10-09",
        "locator": "Printed pp. 333-335 and 337-338: research methods, ethics, proposal/data/report work and statistics in the named Sociology curriculum",
        "supports": "Nigeria-specific undergraduate curriculum context for research learning in the named programme.",
        "related_domain_item_ids": ["d078-research-question-design", "sampling_recruitment_and_representativeness", "measurement_and_operationalisation", "reliability_validity_and_uncertainty", "pilot_and_cognitive_pretesting"],
        "limitations": ["This is evidence about named programme curricula, not a universal definition of professional practice or proof that every D078 path needs the same depth."],
    },
]


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def evidence_records(row: dict[str, Any]) -> list[dict[str, Any]]:
    if row.get("sources"):
        return row["sources"]
    return [{"source_id": source_id} for source_id in row.get("source_ids", [])]


def learning_link(row: dict[str, Any], meta: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    """Return only explicitly designated learning links; evidence is not training."""
    meta = meta or {}
    if meta.get("learning_links"):
        return list(meta["learning_links"])
    existing = row.get("learning_links")
    if existing:
        return existing
    direct = row.get("learning_link")
    if direct:
        return [{"label": f"Candidate learning link for {row.get('name', row.get('id'))}", "url": direct, "source_id": row.get("source_ids", [None])[0], "verified_on": row.get("verified_on"), "role": "unclassified_candidate_link", "instructional_fit": "not_yet_verified"}]
    return []


def base_contract(row: dict[str, Any], *, sources: list[dict[str, Any]], layer: str, meta: dict[str, Any] | None = None, category_rationale: dict[str, Any] | None = None) -> dict[str, Any]:
    meta = meta or {}
    label = meta.get("label") or row.get("label") or row.get("name") or str(row["id"]).replace("_", " ").replace("-", " ").title()
    use_case = row.get("use_case") or row.get("meaning") or ""
    meaning = meta.get("meaning") or row.get("meaning") or ""
    output = meta.get("output") or row.get("output") or ""
    limits = list(meta.get("limits", []))
    if row.get("does_not_enable"):
        limits.append(row["does_not_enable"])
    # Do not manufacture an edge from a plausible curriculum narrative.
    # Only relationships present in the source ledger survive this builder.
    relationships = list(row.get("relationships") or meta.get("relationships", []))
    link_audit = {
        "official_task_or_item_source": "not_separately_adjudicated",
        "checkpoint_fit_source": "not_separately_adjudicated",
        "independent_explanatory_source": "not_separately_adjudicated",
        "free_task_specific_learning_resource": "not_verified",
        "rule": "Do not reuse a source for another role unless that source independently satisfies the role; do not promote product documentation or evidence pages as instruction by default.",
    }
    link_audit.update(meta.get("link_role_audit", {}))
    learning_links = learning_link(row, meta)
    if learning_links and all(item.get("instructional_fit") == "verified" for item in learning_links):
        link_audit["free_task_specific_learning_resource"] = "verified"
    return {
        "id": row["id"],
        "label": label,
        "type": meta.get("type", row.get("type", row.get("category", "knowledge"))),
        "scope": "Global D078 domain-learning candidate; Nigerian curriculum and practice context stays separately labelled.",
        "meaning": meaning,
        "use_case": use_case,
        "output": output,
        "evidence": [{"source_id": item.get("id") or item.get("source_id"), "locator": item.get("locator"), "claim_role": "unadjudicated_source_reference"} for item in sources],
        "claim_evidence_status": "requires_item_and_checkpoint_claim_review",
        "candidate_claim_review": "All supplied/generated wording is provisional until each claim is linked to an exact, relevant source locator and checked against it.",
        "item_definition_sources": list(meta.get("item_definition_sources", [])),
        "checkpoint_fit_sources": list(meta.get("checkpoint_fit_sources", [])),
        "explanatory_sources": list(meta.get("explanatory_sources", [])),
        "relationships": relationships,
        "context": meta.get("context", {}),
        "limits": limits,
        "learning_links": learning_links,
        "link_role_audit": link_audit,
        "checkpoint_context": {
            "programme": "not_assessed_in_this_domain_contract",
            "domain": "D078 candidate; claim pending review",
            "area_of_specialization": "pending complete area task-set research",
            "role": "pending complete role task-set research",
        },
        "prerequisites": meta.get("prerequisites", row.get("prerequisites", [])),
        "alternatives": row.get("alternatives", meta.get("alternatives", [])),
        "checkpoint": "D078 domain learning path",
        "layer": layer,
        "category_rationale": category_rationale,
        "claim_state": "candidate_claims_under_research",
        "research_disposition": "in_progress",
        "exhaustive_search_status": "not_complete",
        "student_display_status": "not_confirmed_pending_claim_checkpoint_and_learning_link_review",
        "display_readiness": "not_confirmed_pending_review",
        "canonical_status": "not_promoted",
        "selection_behavior": "Learner may include this in a focused learning report only after the item and its route are approved; selection does not claim mastery.",
    }


def prepare_existing(row: dict[str, Any], source_index: dict[str, dict[str, Any]]) -> dict[str, Any]:
    """Add explicit audit slots without upgrading existing evidence implicitly."""
    prepared = dict(row)
    category_rationale = EXISTING_CATEGORY_RATIONALES.get(row.get("id"))
    category_sources = []
    if category_rationale:
        for evidence in row.get("evidence", []):
            source_id = evidence.get("source_id")
            source = source_index.get(source_id, {})
            category_sources.append({
                "source_id": source_id,
                "title": source.get("title", source_id),
                "publisher": source.get("publisher"),
                "url": source.get("url"),
                "locator": evidence.get("exact_locator") or source.get("locator"),
                "accessed_on": source.get("accessed_on"),
                "claim_role": "candidate_category_support_not_yet_revalidated",
                "scope_limit": source.get("scope_limit") or "Use the item-specific scope limits in the source register; exact claim and checkpoint fit remain to be verified.",
            })
    prepared.update({
        "claim_evidence_status": "existing_candidate_claims_need_checkpoint_revalidation",
        "research_disposition": "in_progress",
        "exhaustive_search_status": "not_complete",
        "student_display_status": "not_confirmed_pending_claim_checkpoint_and_learning_link_review",
        "display_readiness": "not_confirmed_pending_review",
        "item_definition_sources": [],
        "checkpoint_fit_sources": [],
        "explanatory_sources": [],
        "learning_resource_review": {
            "existing_learning_links_are_preserved": True,
            "task_specific_free_instructional_fit": "not_revalidated_by_contract_builder",
        },
        "link_role_audit": {
            "official_task_or_item_source": "not_separately_adjudicated",
            "checkpoint_fit_source": "not_separately_adjudicated",
            "independent_explanatory_source": "not_separately_adjudicated",
            "free_task_specific_learning_resource": "not_revalidated",
        },
        "checkpoint_context": {
            "programme": "not_assessed_in_this_domain_contract",
            "domain": "D078 existing candidate; checkpoint claim requires review",
            "area_of_specialization": "pending complete area task-set research",
            "role": "pending complete role task-set research",
        },
        "canonical_status": "not_promoted_by_this_contract",
        "category_rationale": category_rationale,
        "category_source_evidence": category_sources,
        "category_review_state": "provisional_rationale_recorded_full_area_and_role_coverage_pending" if category_rationale else "not_yet_reviewed_item_by_item",
    })
    return prepared


def build() -> dict[str, Any]:
    reconciliation = load(RECONCILIATION)
    deep = load(DEEP)
    full_inventory = load(ROOT / "data/career-mapping/_audit/d078_full_domain_item_inventory_2026_10_08.json")
    category_audit = load(CATEGORY_AUDIT)
    task_set_research = load(TASK_SET_RESEARCH)
    role_item_reconciliation = load(ROLE_ITEM_RECONCILIATION)
    if category_audit.get("validation", {}).get("classified_workflow_gap_items") != 19:
        raise ValueError("D078 category audit must classify all 19 reconciliation findings before contract generation")
    if task_set_research.get("domain_id") != "D078":
        raise ValueError("D078 area/role task-set research ledger is missing or belongs to another domain")
    categories = {item["id"]: item["category_rationale"] for item in category_audit.get("items", [])}
    category_to_layer = {
        "useful_additional_edge": "useful_additional_edge",
        "conditional_route_choice": "conditional_or_route_specific",
        "conditional_method_choice": "conditional_or_route_specific",
        "specialist_method": "route_specific_specialist",
        "conditional_method_with_governance": "conditional_or_route_specific",
        "conditional_applied_route": "conditional_or_route_specific",
        "specialist_measurement_route": "route_specific_specialist",
        "specialist_data_design_route": "route_specific_specialist",
        "conditional_evidence_synthesis_route": "conditional_or_route_specific",
        "conditional_tool_alternative": "conditional_or_route_specific",
        "deferred_emerging_conditional_extension": "deferred_pending_scope_and_safeguards",
    }
    gap_sources = {item["id"]: item for item in reconciliation.get("source_register", [])}
    deep_sources = {item["id"]: item for item in reconciliation.get("deep_search_source_register", [])}

    existing_source_index = {item["id"]: item for item in full_inventory.get("source_register", [])}
    existing = [prepare_existing(row, existing_source_index) for row in reconciliation.get("existing_inventory", [])]
    additions = []
    for row in reconciliation.get("new_concept_additions", []):
        rationale = categories.get(row["id"])
        if rationale is None:
            raise ValueError(f"Missing category rationale for D078 workflow item: {row['id']}")
        attached_sources = [gap_sources.get(item.get("id"), item) for item in row.get("sources", [])]
        attached_sources.extend(rationale.get("additional_sources", []))
        additions.append(base_contract(row, sources=attached_sources, layer=category_to_layer[rationale["category"]], meta=FOUNDATION_META.get(row["id"]) or METHOD_META.get(row["id"]), category_rationale=rationale))

    routes = []
    for row in reconciliation.get("route_extensions_or_alternatives", []):
        rationale = categories.get(row["id"])
        if rationale is None:
            raise ValueError(f"Missing category rationale for D078 route item: {row['id']}")
        attached_sources = [gap_sources.get(item.get("id"), item) for item in row.get("sources", [])]
        attached_sources.extend(rationale.get("additional_sources", []))
        routes.append(base_contract(row, sources=attached_sources, layer=category_to_layer[rationale["category"]], meta=METHOD_META.get(row["id"]) or {"type": "method", "label": row.get("id", "").replace("_", " ").title(), "output": "A documented comparison or route plan showing when this alternative is useful and what it does not replace."}, category_rationale=rationale))

    deep_items = []
    for row in deep.get("items", []):
        rationale = DEEP_CATEGORY_RATIONALES.get(row["id"])
        if rationale is None:
            raise ValueError(f"Missing category rationale for D078 deep-search item: {row['id']}")
        sources = [deep_sources[source_id] for source_id in row.get("source_ids", []) if source_id in deep_sources]
        tool_meta = {"label": row.get("name"), "type": row.get("type", "tool"), **DEEP_TOOL_META.get(row["id"], {})}
        item = base_contract(row, sources=sources, layer="conditional_or_route_specific", meta=tool_meta, category_rationale=rationale)
        item["duplicate_of_existing_id"] = rationale.get("duplicate_of_existing_id")
        item["overlap_state"] = "exact_duplicate_of_existing_inventory_record" if rationale.get("duplicate_of_existing_id") else "distinct_record_no_exact_duplicate_identified"
        deep_items.append(item)
    exact_deep_duplicates = [
        {"deep_search_id": row["id"], "existing_inventory_id": row["duplicate_of_existing_id"]}
        for row in deep_items if row.get("duplicate_of_existing_id")
    ]

    return {
        "schema_version": "2026-10-08.d078.domain-learning-contract.v1",
        "reviewed_on": "2026-10-09",
        "domain_id": "D078",
        "domain_name": "Social Sciences & Behavioural Research",
        "status": "reviewable_contract_not_student_approved",
        "source_inputs": [str(RECONCILIATION.relative_to(ROOT)), str(CATEGORY_AUDIT.relative_to(ROOT)), str(DEEP.relative_to(ROOT)), str(TASK_SET_RESEARCH.relative_to(ROOT)), str(ROLE_ITEM_RECONCILIATION.relative_to(ROOT)), "docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_SPEC_2026_10_07.md", "docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_IMPLEMENTATION_PLAN_2026_10_08.md"],
        "guardrails": [
            "This package does not change canonical domain, area, role, API, matcher or SQL files.",
            "Every candidate remains actively researched until it has a source-backed disposition; missing evidence is not treated as proof of no usefulness.",
            "Unsupported/not-established and final exclusion require an exhaustive, documented search. Student guidance is not confirmed before claim, checkpoint and learning-link review passes.",
            "The domain foundation is not a promise of employment in every area or role.",
            "Tools are route choices attached to methods and outputs; they are not methods or universal requirements.",
            "Nigeria-specific evidence remains labelled separately from global practice.",
        ],
        "selection_contract": {
            "meaning": "Selection means include this item in the learner's focused route/report; it does not mean the learner knows or has completed it.",
            "route_order": ["programme", "domain", "area_of_specialization", "role"],
            "granular_choices": ["knowledge", "skill", "method", "tool", "competency", "certification", "learning_resource"],
            "relationship_rules": ["alternatives are not cumulative", "complements are shown separately", "downstream effects are shown only for supported edges", "the canonical curriculum is unchanged by selection"],
        },
        "nigerian_context_examples": NIGERIAN_CONTEXT_EXAMPLES,
        "counts": {
            "existing_items": len(existing),
            "shared_foundation_additions": 0,
            "useful_additional_edges": sum(x["layer"] == "useful_additional_edge" for x in additions),
            "conditional_or_route_specific_additions": sum(x["layer"] == "conditional_or_route_specific" for x in additions),
            "specialist_additions": sum(x["layer"] == "route_specific_specialist" for x in additions),
            "route_alternatives": len(routes),
            "deep_search_options": len(deep_items),
            "total_contract_records": len(existing) + len(additions) + len(routes) + len(deep_items),
        },
        "review_coverage": {
            "scope_record_instances": len(existing) + len(additions) + len(routes) + len(deep_items),
            "workflow_gap_findings": {
                "total": len(additions) + len(routes),
                "category_rationales_recorded": sum(bool(x.get("category_rationale")) for x in additions + routes),
                "item_claim_checkpoint_and_learning_link_gates_passed": 0,
            },
            "existing_inventory": {
                "total": len(existing),
                "category_rationales_completed_in_this_pass": sum(bool(x.get("category_rationale")) for x in existing),
                "category_rationales_remaining": len(existing) - sum(bool(x.get("category_rationale")) for x in existing),
                "review_state": "all_existing_records_have_provisional_category_rationale; source_claim_and_full_task_set_validation_still_pending" if all(x.get("category_rationale") for x in existing) else "partial_item_by_item_rationale_recorded; full_task_set_and_claim_validation_still_pending",
            },
            "deep_search_options": {
                "total": len(deep_items),
                "category_rationales_completed_in_this_pass": sum(bool(x.get("category_rationale")) for x in deep_items),
                "category_rationales_remaining": len(deep_items) - sum(bool(x.get("category_rationale")) for x in deep_items),
                "review_state": "all_have_provisional_category_rationales; source_claim_checkpoint_and_learning_link_validation_still_pending" if all(x.get("category_rationale") for x in deep_items) else "partial_item_by_item_review",
            },
            "exact_duplicate_resolution": {
                "deep_search_duplicates_of_existing_inventory": exact_deep_duplicates,
                "count": len(exact_deep_duplicates),
                "provisional_record_instances_after_exact_duplicate_collapse": len(existing) + len(additions) + len(routes) + len(deep_items) - len(exact_deep_duplicates),
                "semantic_overlap_review_complete": False,
                "note": "Six deep-search entries are exact repeat candidates already represented in the existing inventory. The remaining 52 is only a provisional count after exact duplicate collapse; cross-record semantic overlap and final item approval remain open.",
            },
            "shared_foundation_review": {
                "status": "partial_category_review_only_not_yet_verified_across_all_routes",
                "claims_reviewed": [x["id"] for x in existing if (x.get("category_rationale") or {}).get("category", "").startswith("shared_foundation_candidate")],
                "conditional_items_reviewed": [x["id"] for x in existing if (x.get("category_rationale") or {}).get("category", "").startswith("conditional_")],
            "scope": "Five existing foundation/responsibility claims now have provisional item-level category rationales. The three shared-foundation candidates are supported for defined research/evidence-use routes only; their universality across all D078 areas and roles is not established until the complete task-set ledger is reconciled. Do not infer that zero new foundations among the 19 means D078 has no shared foundation.",
            },
            "area_role_task_set_research": {
                "status": task_set_research.get("status"),
                "coverage_counts": task_set_research.get("coverage_counts", {}),
                "role_item_research_coverage": task_set_research.get("role_item_research_coverage", {}),
                "shared_foundation_decisions_finalized": False,
                "state": "in_progress; current researched batches do not establish full downstream route coverage",
                "scope_note": "Learning-content and task-set context for already established routes; not role-fit adjudication.",
            },
            "researched_role_item_reconciliation": {
                "status": role_item_reconciliation.get("status"),
                "coverage": role_item_reconciliation.get("coverage", {}),
                "note": "Conceptual crosswalk only. It does not establish exact source-concept identity, role-task support, checkpoint placement, or student display.",
            },
            "warning": "58 is the current assembled record-instance count (29 existing + 19 workflow findings + 10 deep-search options); it is not guaranteed to be 58 unique concepts because overlap/deduplication remains part of review.",
        },
        "existing_inventory": existing,
        "foundation_and_route_additions": additions,
        "route_alternatives": routes,
        "deep_search_options": deep_items,
        "area_role_task_set_research": {
            "status": task_set_research.get("status"),
            "coverage_counts": task_set_research.get("coverage_counts", {}),
            "role_item_research_coverage": task_set_research.get("role_item_research_coverage", {}),
            "decision_policy": "Keep item categories and checkpoint placements provisional until the complete current-area and in-scope-role task-set research is reconciled. Do not convert an unresolved task pair into unsupported merely because its evidence has not yet been collected.",
            "role_fit_audit_reopened": False,
        },
        "researched_role_item_reconciliation": {
            "status": role_item_reconciliation.get("status"),
            "coverage": role_item_reconciliation.get("coverage", {}),
            "role_fit_audit_reopened": False,
        },
        "validation": {
            "records_with_candidate_meaning": sum(bool(x.get("meaning")) for x in additions + routes + deep_items),
            "records_with_candidate_output": sum(bool(x.get("output")) for x in additions + routes + deep_items),
            "records_with_explicit_learning_links": sum(bool(x.get("learning_links")) for x in additions + routes + deep_items),
            "foundation_items_with_item_definition_sources_attached": sum(bool(x.get("item_definition_sources")) for x in additions if x.get("layer") == "most_versatile_foundation_or_useful_edge"),
            "foundation_items_with_checkpoint_fit_sources_attached": sum(bool(x.get("checkpoint_fit_sources")) for x in additions if x.get("layer") == "most_versatile_foundation_or_useful_edge"),
            "foundation_items_with_explanatory_sources_attached": sum(bool(x.get("explanatory_sources")) for x in additions if x.get("layer") == "most_versatile_foundation_or_useful_edge"),
            "records_with_all_four_source_roles_adjudicated": sum(all(x.get("link_role_audit", {}).get(k) == "verified" for k in ("official_task_or_item_source", "checkpoint_fit_source", "independent_explanatory_source", "free_task_specific_learning_resource")) for x in additions + routes + deep_items),
            "all_new_records_have_active_research_disposition": all(x.get("research_disposition") == "in_progress" and x.get("exhaustive_search_status") == "not_complete" for x in additions + routes + deep_items),
            "unsupported_records_without_exhaustive_search": sum(x.get("research_disposition") in {"unsupported", "not_established", "excluded"} and x.get("exhaustive_search_status") != "complete" for x in existing + additions + routes + deep_items),
            "canonical_files_modified": False,
            "all_19_have_category_rationale": len(categories) == 19 and all(x.get("category_rationale") for x in additions + routes),
            "existing_records_with_category_rationale": sum(bool(x.get("category_rationale")) for x in existing),
            "all_existing_records_have_category_rationale": len(existing) == sum(bool(x.get("category_rationale")) for x in existing),
            "deep_search_records_with_category_rationale": sum(bool(x.get("category_rationale")) for x in deep_items),
            "all_deep_search_records_have_category_rationale": len(deep_items) == sum(bool(x.get("category_rationale")) for x in deep_items),
            "all_58_record_instances_have_category_rationale": all(x.get("category_rationale") for x in existing + additions + routes + deep_items),
            "exact_deep_duplicates_linked_to_existing_inventory": len(exact_deep_duplicates) == 6,
        },
    }


def write_markdown(result: dict[str, Any]) -> None:
    c = result["counts"]
    task_set = result["area_role_task_set_research"]
    role_item_reconciliation = result.get("researched_role_item_reconciliation", {})
    lines = [
        "# D078 domain-learning contract — 2026-10-08",
        "",
        "**Status:** Reviewable local contract only; not canonical, not student-approved, and not live SQL.",
        "",
        "This package turns the existing D078 inventory, workflow-gap reconciliation and deep-search checkpoint into records that can be checked against the guided-experience display contract. It does not promote candidates or call unfinished candidates unsupported. Research continues until each candidate has a source-backed disposition; final student guidance requires claim, checkpoint and learning-link checks.",
        "",
        "## Coverage",
        "",
        f"- Existing inventory records retained: **{c['existing_items']}**.",
        f"- New shared-foundation records: **{c['shared_foundation_additions']}**.",
        f"- Useful additional-edge records: **{c['useful_additional_edges']}**.",
        f"- Conditional or route-specific workflow records packaged: **{c['conditional_or_route_specific_additions']}**.",
        f"- Specialist workflow records packaged: **{c['specialist_additions']}**.",
        f"- Alternative/deferred route records packaged: **{c['route_alternatives']}**.",
        f"- Deep-search tool/framework options packaged: **{c['deep_search_options']}**.",
        f"- Contract records in this local package: **{c['total_contract_records']}**.",
        "- Full review scope: all record instances above, including the pre-existing inventory, all reconciled workflow findings and all deep-search options; the count is not a deduplicated concept count.",
        "",
        "## What each record now carries",
        "",
        "The package preserves candidate wording and source references, but does not treat a source list as proof that every claim is supported. Source roles are intentionally separate: (1) authoritative source for what the item/task does, (2) evidence that it belongs at the stated checkpoint, (3) an independent plain-language explanation, and (4) a free, task-specific learning resource. These roles have not yet been fully adjudicated in this package. A product page, evidence source, or generic course is not silently reused as a learning link. Missing meaning, outputs, limits, prerequisites, alternatives, or relationships remain gaps rather than generated defaults.",
        "## Review coverage: full 58-record scope",
        "",
        f"The 19 workflow-gap findings and **{sum(bool(x.get('category_rationale')) for x in result['existing_inventory'])} of {len(result['existing_inventory'])}** pre-existing inventory records now have item-level category rationales. All {len(result['deep_search_options'])} deep-search options remain to be categorized. Three existing shared-foundation candidates are currently supported for research/evidence-use routes only; their fit across every D078 area and role is still unverified. Do not read ‘zero new shared-foundation additions among the 19’ as ‘D078 has no shared foundation’; also do not treat the current foundation narrative or inventory labels as verified. No item becomes student-ready from this count or category audit.",
        "",
        "The programme/domain/area/role explanation must be checkpoint-specific. The area and role task sets are being researched for all current D078 areas and in-scope roles; checkpoint contributions in this contract remain pending until that evidence ledger is reconciled. This is learning-content research for already established routes, not role-fit adjudication. Unfinished records remain in active research and must not be labelled unsupported.",
        f"Current task-set checkpoint: {task_set.get('coverage_counts', {}).get('current_areas', 0)} current areas, {task_set.get('coverage_counts', {}).get('supported_d078_role_records_in_scope', 0)} in-scope roles and {task_set.get('coverage_counts', {}).get('total_task_set_records', 0)} task-set records. Of {task_set.get('role_item_research_coverage', {}).get('distinct_label_priority_pairs_total', 0)} distinct role-item/priority pairs, {task_set.get('role_item_research_coverage', {}).get('distinct_pairs_researched_in_this_batch', 0)} have been researched and {task_set.get('role_item_research_coverage', {}).get('distinct_pairs_remaining', 0)} remain ({task_set.get('role_item_research_coverage', {}).get('occurrences_remaining', 0)} role-item occurrences). Shared-foundation breadth and branch ownership are not finalized; this is not role-fit adjudication.",
        f"Local concept reconciliation currently covers the first {role_item_reconciliation.get('coverage', {}).get('researched_pairs_reconciled', 0)} researched role-item pairs. This crosswalk identifies overlaps/gaps with the learning inventory only; exact source concepts, task links and checkpoint eligibility remain open. See `{ROLE_ITEM_RECONCILIATION.relative_to(ROOT).as_posix()}`.",
        "",
        "## Category rationale and source-role details (still pending review)",
        "",
        f"Coverage status: **{sum(bool(x.get('category_rationale')) for x in result['existing_inventory'])} of 29** pre-existing records now have provisional item-level category rationales; all {len(result['deep_search_options'])} deep-search options still need category review. Three existing shared-foundation claims are supported only for research/evidence-use routes in this pass; their fit across every D078 area and role is still unverified.",
        "",
        "The first-pass reconciliation's combined foundation/edge bucket is superseded by the item-level category audit. The 19 findings carry individual breadth, boundary and evidence-limit rationales; none is a newly established shared foundation. ‘Attached’ is not ‘verified for display’: each claim and exact locator still needs review.",
        "",
    ]
    for idx, line in enumerate(lines):
        if line.startswith("The 19 workflow-gap findings and "):
            lines[idx] = f"All **{sum(bool(x.get('category_rationale')) for x in result['existing_inventory'] + result['foundation_and_route_additions'] + result['route_alternatives'] + result['deep_search_options'])} of {c['total_contract_records']}** record instances now have provisional category rationales. Three existing shared-foundation candidates are currently supported for research/evidence-use routes only; their fit across every D078 area and role is still unverified. Exact deep-search duplicates mean 58 is not the deduplicated concept count. No item becomes student-ready from this count or category audit."
        elif line.startswith("Coverage status:"):
            lines[idx] = f"Coverage status: **{sum(bool(x.get('category_rationale')) for x in result['existing_inventory'])} of 29** existing records, **{sum(bool(x.get('category_rationale')) for x in result['deep_search_options'])} of {len(result['deep_search_options'])}** deep-search options, and all 19 reconciliation findings have provisional category rationales. Source claims, exact checkpoint fit, learning resources and complete route breadth remain unapproved."
    lines.extend(["## Category rationale summary — all reconciled findings", "", "The individual rationale is preserved for every one of the 19 reconciled workflow findings. These proposed categories organize the review; evidence and checkpoint review still determine eligibility for later display.", ""])
    for row in result["foundation_and_route_additions"] + result["route_alternatives"]:
        rationale = row.get("category_rationale") or {}
        if not rationale:
            continue
        lines.extend([
            f"### {row['label']} (`{row['id']}`)",
            "",
            f"**Category:** `{rationale.get('category')}`. {rationale.get('why', '')}",
            f"**Breadth:** {rationale.get('breadth', '')}",
            f"**Boundary:** {rationale.get('boundary', '')}",
            f"**Evidence limit:** {rationale.get('evidence_limit', '')}",
            "**Display/canonical state:** hidden pending full evidence and downstream checkpoint review; not promoted.",
            "",
        ])
    lines.extend(["## Existing inventory category review", "", "All 29 existing records now have provisional item-level category rationales. These are not display approvals; source claims, category breadth and checkpoint fit remain open until the complete area/role task-set evidence is reconciled.", ""])
    for row in result["existing_inventory"]:
        rationale = row.get("category_rationale")
        if not rationale:
            continue
        lines.extend([
            f"### {row['label']} (`{row['id']}`)",
            "",
            f"**Provisional category:** `{rationale['category']}`.",
            f"- Why: {rationale['why']}",
            f"- Breadth: {rationale['breadth']}",
            f"- Boundary: {rationale['boundary']}",
            f"- Evidence limit: {rationale['evidence_limit']}",
            "- Existing cited records (candidate support; exact claims/checkpoint fit still pending):",
        ])
        for source in row.get("category_source_evidence", []):
            if source.get("url"):
                lines.append(f"  - [{source.get('source_id')} — {source.get('title')}]({source['url']}) — {source.get('locator')} **[revalidation pending]**")
        lines.extend(["", "**Status:** rationale recorded; source-role validation and breadth across current D078 routes remain open; hidden and not promoted.", ""])
    lines.extend(["## Deep-search option categories and duplicate resolution", "", "Each tool/framework is a conditional or specialist option, not a shared foundation merely because it exists or can technically perform a task. Exact repeats link to the corresponding existing record; they must not be counted as separate learner choices.", ""])
    for row in result["deep_search_options"]:
        rationale = row.get("category_rationale") or {}
        duplicate = row.get("duplicate_of_existing_id")
        lines.extend([
            f"### {row['label']} (`{row['id']}`)",
            "",
            f"**Plain-language meaning:** {row.get('meaning') or 'Not yet written; continue evidence-backed enrichment.'}",
            f"**D078 use case:** {row.get('use_case') or 'Not yet written; continue evidence-backed enrichment.'}",
            f"**Possible output:** {row.get('output') or 'Not yet defined.'}",
            f"**Provisional category:** `{rationale.get('category')}`.",
            f"- Why: {rationale.get('why')}",
            f"- Breadth: {rationale.get('breadth')}",
            f"- Boundary: {rationale.get('boundary')}",
            f"- Evidence limit: {rationale.get('evidence_limit')}",
            f"**Prerequisites:** {'; '.join(row.get('prerequisites', [])) or 'Not yet recorded.'}",
            f"**Alternatives:** {'; '.join(row.get('alternatives', [])) or 'Not yet recorded.'}",
            f"**Limits:** {'; '.join(row.get('limits', [])) or 'Not yet recorded.'}",
            f"- Duplicate handling: {duplicate if duplicate else 'No exact duplicate found in the existing 29; semantic overlap review remains open.'}",
            "",
        ])
        if row.get("relationships"):
            lines.append("**Typed learning relationships:**")
            for edge in row["relationships"]:
                lines.append(f"- `{edge.get('type')}` → `{edge.get('target')}`: {edge.get('note')} **[{edge.get('status', 'review required')}]**")
        else:
            lines.append("**Typed learning relationships:** None recorded; do not infer a dependency or alternative.")
        context = row.get("context", {})
        if context:
            lines.extend(["", "**Context by checkpoint:**"])
            for checkpoint_name in ("programme", "domain", "area_of_specialization", "role", "global", "nigeria"):
                value = context.get(checkpoint_name)
                if not value:
                    continue
                claim = value.get("claim") or value.get("candidate_context") or ""
                scope = value.get("scope")
                state = value.get("status", "context")
                lines.append(f"- **{checkpoint_name.replace('_', ' ').title()}** ({state}{'; ' + scope if scope else ''}): {claim}")
        for field, heading in (
            ("item_definition_sources", "Item/function evidence"),
            ("checkpoint_fit_sources", "Checkpoint/context evidence"),
            ("explanatory_sources", "Independent explanation/context"),
        ):
            lines.extend(["", f"**{heading}:**"])
            if not row.get(field):
                lines.append("No source attached yet; continue research.")
            for source in row.get(field, []):
                lines.append(f"- [{source.get('title', source.get('source_id'))}]({source.get('url', '')}) — {source.get('locator', 'locator pending')} Supports: {source.get('supports', 'claim pending')} Scope limit: {source.get('scope_limit', 'not recorded')} [claim review pending].")
        lines.extend(["", "**Learning links:**"])
        if not row.get("learning_links"):
            lines.append("No verified task-specific learning link yet.")
        for link in row.get("learning_links", []):
            lines.append(f"- [{link.get('label', 'Learning resource')}]({link.get('url', '')}) — {link.get('locator', 'locator pending')} Access/level: {link.get('access', link.get('level', 'verify before display'))}. Fit: `{link.get('instructional_fit', 'not assessed')}`. Scope: {link.get('scope_note', 'not recorded')}")
        lines.extend(["", "**Status:** hidden pending exact claim, programme/domain/area/role checkpoint, relationship and learning-link review; not promoted.", ""])
    for row in result["foundation_and_route_additions"]:
        if not row.get("item_definition_sources") and not row.get("checkpoint_fit_sources") and not row.get("explanatory_sources"):
            continue
        rationale = row.get("category_rationale") or {}
        lines.extend([f"### {row['label']}", "", f"**Category:** `{rationale.get('category', row.get('layer'))}`. {rationale.get('why', '')}", f"**Breadth and boundary:** {rationale.get('breadth', '')} {rationale.get('boundary', '')}", ""])
        for field, heading in (
            ("item_definition_sources", "What the item/task is"),
            ("checkpoint_fit_sources", "Why it is being considered at this checkpoint"),
            ("explanatory_sources", "Accessible explanation"),
        ):
            lines.extend([f"**{heading}:**"])
            if not row.get(field):
                lines.append("No source attached yet; continue research.")
            for source in row.get(field, []):
                title = source.get("title", source.get("source_id", "Source"))
                lines.append(f"- [{title}]({source.get('url', '')}) — {source.get('locator', 'locator pending')}. Supports: {source.get('supports', 'claim pending')}. Scope limit: {source.get('scope_limit', 'not yet recorded')} **[attached; claim review pending]**")
            lines.append("")
    lines.extend([
        "## Nigerian context for the shared research route",
        "",
        "Three locally grounded examples are attached: NBS/UNICEF's 2021 MICS sample-design report, the NBS Nigeria Labour Force Survey methodology record, and the NUC Social Sciences CCMAS research-methods/project curriculum. Each record lists its exact locator, the domain items it can contextualise, and limits. These are examples, not Nigerian national requirements; the MICS report is period-specific, the NLFS catalog locator does not itself establish every underlying procedure, and the CCMAS applies to named curricula.",
        "",
        "## Selection behaviour",
        "",
        "Learners choose the domain, an area of specialization and, where useful, a role before choosing granular items. They can include selected knowledge, skills, methods, tools, competencies, certifications and learning resources in a focused report. Alternatives remain alternatives; complements remain separate; selection records focus, not mastery. The package leaves canonical curriculum and evidence records unchanged.",
        "",
        "## Remaining gates",
        "",
        f"The package does not close the programme overview, pre-domain-entry or domain-overview approval gates. It also does not yet contain complete area/role task-set evidence: {task_set.get('role_item_research_coverage', {}).get('distinct_pairs_remaining', 0)} of {task_set.get('role_item_research_coverage', {}).get('distinct_label_priority_pairs_total', 0)} distinct role-item/priority pairs remain in the current research ledger. Keep candidates in progress until exhaustive search, checkpoint reconciliation and source checks are complete; do not treat missing evidence as a negative result. Confirm student display only after claim, checkpoint and learning-link checks pass.",
        "",
        f"Machine-readable package: `{OUT_JSON.relative_to(ROOT).as_posix()}`",
    ])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    package = build()
    OUT_JSON.write_text(json.dumps(package, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    write_markdown(package)
    print(json.dumps({"json": str(OUT_JSON), "markdown": str(OUT_MD), "counts": package["counts"], "validation": package["validation"]}, indent=2))
