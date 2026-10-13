"""Build the independently enriched D078 area-of-specialization lane (areas 5-7).

This is an audit/checkpoint artifact.  It deliberately does not modify the
canonical taxonomy, role files, SQL, UI, or the subject matcher.  The records
are research candidates until claim, checkpoint, relationship, limitation and
learning-link gates are separately approved.
"""

from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
DATA_OUT = ROOT / "data/career-mapping/_audit/d078_area_enrichment_lanes_2026_10_10"
DOC_OUT = ROOT / "docs/manual-review/d078_area_enrichment_lanes_2026_10_10"
TODAY = "2026-10-10"


SOURCES = {
    "UNESCO_ISCED": {
        "publisher": "UNESCO Institute for Statistics",
        "title": "International Standard Classification of Education: detailed field descriptions",
        "url": "https://uis.unesco.org/sites/default/files/documents/international-standard-classification-of-education-fields-of-education-and-training-2013-detailed-field-descriptions-2015-en.pdf",
        "locator": "Detailed fields 0311-0314; the classification places social geography with sociology and cultural studies and distinguishes social fields from physical geography/geospatial technology.",
        "jurisdiction": "global classification",
        "supports": "disciplinary boundary and field distinction",
        "limits": "classification, not a complete occupational task standard or local licensing rule",
    },
    "UNSD_CENSUS": {
        "publisher": "United Nations Statistics Division",
        "title": "2030 World Population and Housing Census Programme",
        "url": "https://unstats.un.org/unsd/demographic/sources/census/wphc/default.htm",
        "locator": "Programme overview: censuses as primary sources of disaggregated data; standards for planning, quality, georeferencing, administrative data and dissemination.",
        "jurisdiction": "global official-statistics standards",
        "supports": "population/census task scope and data-quality expectations",
        "limits": "guidance for census systems, not a claim that every area or role conducts a census",
    },
    "UNSD_MIGRATION": {
        "publisher": "United Nations Statistics Division",
        "title": "International migration statistics: methods and resources",
        "url": "https://unstats.un.org/unsd/demographic/sconcerns/migration/",
        "locator": "Methods and resources sections on migrant stock/flows, population censuses, data integration and international recommendations.",
        "jurisdiction": "global official-statistics standards",
        "supports": "migration measurement and data-integration task scope",
        "limits": "does not prescribe a single national data source or model",
    },
    "UN_DESA_PD": {
        "publisher": "United Nations Department of Economic and Social Affairs, Population Division",
        "title": "Population Division",
        "url": "https://www.un.org/development/desa/pd/",
        "locator": "Mandate and outputs: demographic research, estimates/projections, analysis, policy support and capacity development.",
        "jurisdiction": "global",
        "supports": "population-analysis outputs and demographic work",
        "limits": "international estimates are not a substitute for national source metadata or field research",
    },
    "UN_DESA_METHOD": {
        "publisher": "United Nations Department of Economic and Social Affairs, Population Division",
        "title": "Data and methods for national population estimates",
        "url": "https://www.un.org/development/desa/pd/news/technical-paper-data-and-methods-production-population-estimates",
        "locator": "Technical-paper overview of population-estimate inputs, time adjustment, data availability and quality considerations.",
        "jurisdiction": "global",
        "supports": "demographic estimation workflow and uncertainty boundaries",
        "limits": "does not prescribe one model for every country or study",
    },
    "ONET_GEOG": {
        "publisher": "U.S. Department of Labor, O*NET OnLine",
        "title": "Geographers, 19-3092.00",
        "url": "https://www.onetonline.org/link/details/19-3092.00",
        "locator": "Overview and Tasks table: compile census/field/imagery/map data, study regional population characteristics, analyse spatial distributions and report findings; use only the human/population tasks.",
        "jurisdiction": "United States occupational framework",
        "supports": "comparative examples of human-geography task outputs",
        "limits": "also contains physical-geography tasks; not Nigerian duties or proof for every D078 role",
    },
    "NBS_GHS": {
        "publisher": "National Bureau of Statistics, Nigeria",
        "title": "Nigeria General Household Survey, Panel 2023-2024",
        "url": "https://microdata.nigerianstat.gov.ng/index.php/catalog/82",
        "locator": "Scope lists migration, household, labour, education, ICT, time use, health and geographic identifiers; public-use metadata and access state are shown in the catalogue.",
        "jurisdiction": "Nigeria",
        "supports": "local example of population/social microdata and metadata appraisal",
        "limits": "one survey and access conditions; not a universal Nigerian task or complete data inventory",
    },
    "NBS_POP": {
        "publisher": "National Bureau of Statistics, Nigeria",
        "title": "Population and Vital Statistics",
        "url": "https://nigerianstat.gov.ng/pdfuploads/POPULATION%20AND%20VITAL.pdf",
        "locator": "Sources/methods section describing census, surveys, administrative records and the NBS/National Population Commission roles.",
        "jurisdiction": "Nigeria",
        "supports": "local population-statistics source and institutional context",
        "limits": "historical/date-specific publication; verify current series and definitions",
    },
    "UI_GEOGRAPHY": {
        "publisher": "University of Ibadan, Faculty of the Social Sciences",
        "title": "Department of Geography course listing",
        "url": "https://socsc.ui.edu.ng/courses",
        "locator": "GEO 131 human geography and GEO 331 population geography listings: spatial organisation, population, movement, settlement, population-data sources and Nigerian case study.",
        "jurisdiction": "Nigeria; one university curriculum",
        "supports": "local curricular example, not a national mandate",
        "limits": "one institution; not an occupational standard or proof every D078 route needs the content",
    },
    "QGIS_TRAINING": {
        "publisher": "QGIS Project / Open Source Geospatial Foundation",
        "title": "QGIS Training Manual",
        "url": "https://docs.qgis.org/3.44/en/docs/training_manual/",
        "locator": "Modules for map creation, vector data, vector/network analysis, spatial statistics, rasters and combining analyses; includes practical exercises.",
        "jurisdiction": "global technical resource",
        "supports": "free, task-specific GIS learning",
        "limits": "teaches software operation, not human-geography theory, data validity or Nigerian boundary authority",
    },
    "OPEN_TEXTBOOK_HUMAN_GEOGRAPHY": {
        "publisher": "Open Textbook Library / University of Minnesota",
        "title": "Fundamentals of Human Geography",
        "url": "https://open.umn.edu/opentextbooks/textbooks/fundamentals-of-human-geography",
        "locator": "Chapters 1-3 cover introduction to human geography, population and health, and migration; online interactive text and downloadable PDF are listed.",
        "jurisdiction": "global undergraduate open textbook",
        "supports": "free conceptual learning for human-place, population and migration tasks",
        "limits": "global examples and not a GIS methods course or Nigerian source-system guide",
    },
    "IUSSP_DEMOGRAPHY": {
        "publisher": "International Union for the Scientific Study of Population / LSHTM",
        "title": "Introduction to Demographic Methods and Population Analysis",
        "url": "https://iussp.org/en/demographic-methods-and-population-analysis",
        "locator": "28 interactive lectures on fertility, mortality, migration, population projections, life tables and population models; free access through OpenStudy with registration.",
        "jurisdiction": "global demographic methods",
        "supports": "free task-specific population-method learning",
        "limits": "2014-15 materials; no computing support or Nigerian source-system instruction",
    },
    "OL_MIGRATION": {
        "publisher": "The Open University, OpenLearn",
        "title": "Exploring how migration changes the places where we live",
        "url": "https://www.open.edu/openlearn/course/view.php?id=14286",
        "locator": "Course text and videos on migration, place, belonging, community and urban change.",
        "jurisdiction": "global concepts with UK examples",
        "supports": "accessible migration/place learning",
        "limits": "does not teach GIS or Nigerian data systems",
    },
    "CDC_EVAL": {
        "publisher": "U.S. Centers for Disease Control and Prevention",
        "title": "CDC Program Evaluation Framework",
        "url": "https://www.cdc.gov/evaluation/php/evaluation-framework/index.html",
        "locator": "Six steps: assess context, describe the programme, focus questions/design, gather credible evidence, generate/support conclusions and act on findings; standards include relevance, rigor, independence, transparency and ethics.",
        "jurisdiction": "global-use guidance from a U.S. public-health authority",
        "supports": "evaluation design, evidence and reporting task scope",
        "limits": "non-prescriptive framework; not a Nigerian licence or every evaluation design",
    },
    "MAGENTA_BOOK": {
        "publisher": "HM Treasury and UK Evaluation Task Force",
        "title": "Magenta Book: Central Government guidance on evaluation",
        "url": "https://www.gov.uk/government/publications/the-magenta-book/magenta-book-central-government-guidance-on-evaluation-html",
        "locator": "Executive summary and evaluation-method sections: scoping, design, conduct, use, dissemination, process/impact/value-for-money evaluation and interpretation limits.",
        "jurisdiction": "UK government guidance with wider methodological relevance",
        "supports": "evaluation planning and method-choice boundaries",
        "limits": "not Nigerian law, a universal job standard or a credential",
    },
    "AEA_COMPETENCIES": {
        "publisher": "American Evaluation Association",
        "title": "AEA Evaluator Competencies",
        "url": "https://www.eval.org/About/Competencies-Standards/AEA-Evaluator-Competencies",
        "locator": "Five competency domains: professional practice, methodology, context, planning/management and interpersonal; includes design, evidence, stakeholders and context.",
        "jurisdiction": "professional association; international membership",
        "supports": "evaluation competency structure",
        "limits": "not statutory licensing or proof of competence",
    },
    "AEA_GUIDING": {
        "publisher": "American Evaluation Association",
        "title": "Guiding Principles for Evaluators",
        "url": "https://www.eval.org/About/Guiding-Principles",
        "locator": "Principles of systematic inquiry, competence, integrity, respect for people, common good and equity.",
        "jurisdiction": "professional association guidance",
        "supports": "ethical and transparent evaluation boundaries",
        "limits": "not Nigerian law or a design manual",
    },
    "NGA_MNE_POLICY": {
        "publisher": "Federal Ministry of Budget and Economic Planning, Nigeria",
        "title": "National Monitoring and Evaluation Policy of Nigeria",
        "url": "https://nationalplanning.gov.ng/wp-content/uploads/2023/02/NPC-MNEP-LATEST.pdf",
        "locator": "Introduction and scope: systematic independent evaluation of policies, strategies, programmes and projects; federal and sub-national application; learning, accountability and evidence-informed planning.",
        "jurisdiction": "Nigeria",
        "supports": "Nigerian M&E context and institutional purpose",
        "limits": "policy framework, not proof every D078 role performs every M&E task",
    },
    "OPENLEARN_EVAL": {
        "publisher": "The Open University, OpenLearn",
        "title": "Global challenges in practice: designing a development intervention",
        "url": "https://www.open.edu/openlearn/mod/oucontent/view.php?id=141129&section=3",
        "locator": "Evaluation section explains why evaluation matters and introduces formative evaluation in a development-intervention context.",
        "jurisdiction": "global teaching resource",
        "supports": "accessible programme-evaluation learning",
        "limits": "not a full evaluator qualification or one prescribed design",
    },
    "KOBO_WEBFORMS": {
        "publisher": "KoboToolbox",
        "title": "Collecting data using web forms",
        "url": "https://support.kobotoolbox.org/data_through_webforms.html",
        "locator": "Web forms, sharing, offline collection after caching, skip logic and validation rules on supported devices.",
        "jurisdiction": "global technical resource",
        "supports": "task-specific electronic form collection",
        "limits": "does not design a valid questionnaire, sampling plan or ethical protocol",
    },
    "KOBO_EXPORT": {
        "publisher": "KoboToolbox",
        "title": "Exporting and downloading your data",
        "url": "https://support.kobotoolbox.org/export_download.html",
        "locator": "CSV/XLS/GeoJSON/SPSS-label export options and export-setting guidance.",
        "jurisdiction": "global technical resource",
        "supports": "moving collected data into analysis workflows",
        "limits": "export success does not validate data quality or analysis",
    },
    "TAGUETTE": {
        "publisher": "Taguette project",
        "title": "Taguette: free and open-source qualitative data analysis",
        "url": "https://www.taguette.org/",
        "locator": "Import material, highlight/tag excerpts and export projects, codebooks, quotes and documents.",
        "jurisdiction": "global open-source tool",
        "supports": "free qualitative coding practice",
        "limits": "tagging is not interpretation, validity, representativeness or a research method by itself",
    },
    "NVIVO": {
        "publisher": "Lumivero",
        "title": "NVivo qualitative-analysis software",
        "url": "https://lumivero.com/products/nvivo/",
        "locator": "Product capabilities for importing, organising, coding, querying and reporting on unstructured material.",
        "jurisdiction": "global commercial software",
        "supports": "conditional qualitative coding workflow",
        "limits": "licence/version vary; software does not select a method or interpret evidence",
    },
    "OPENLEARN_SPSS": {
        "publisher": "The Open University, OpenLearn",
        "title": "Getting started with SPSS",
        "url": "https://www.open.edu/openlearn/society-politics-law/sociology/getting-started-spss/content-section-0?active-tab=description-tab",
        "locator": "Course description/outcomes: define variables, enter data, descriptive statistics, correlation and t-tests.",
        "jurisdiction": "global teaching resource",
        "supports": "free task-specific SPSS introduction",
        "limits": "does not teach study design, sampling or all statistical methods",
    },
    "DATACARP_R": {
        "publisher": "The Carpentries / Data Carpentry",
        "title": "R for Social Scientists",
        "url": "https://datacarpentry.github.io/r-socialsci/instructor/index.html",
        "locator": "SAFI interview dataset workflow: import, prepare, summarise and visualise; lesson states prerequisites and objectives.",
        "jurisdiction": "global open learning resource",
        "supports": "task-specific R social-science data workflow",
        "limits": "does not teach every quantitative method, inference or Nigerian data context",
    },
    "PYTHON_SOCSCI": {
        "publisher": "Data Carpentry",
        "title": "Python for Social Scientists",
        "url": "https://datacarpentry.org/python-socialsci/",
        "locator": "Social-science workflow using Python, Jupyter and pandas; lesson status is marked alpha and instructor-led context is stated.",
        "jurisdiction": "global open learning resource",
        "supports": "task-specific Python tabular-data workflow",
        "limits": "alpha materials; not research design or statistical inference instruction",
    },
    "PYTHON_TUTORIAL": {
        "publisher": "Python Software Foundation",
        "title": "The Python Tutorial",
        "url": "https://docs.python.org/3/tutorial/",
        "locator": "Official tutorial sections on syntax, data structures, modules, input/output, errors, classes and virtual environments.",
        "jurisdiction": "global technical resource",
        "supports": "language fundamentals for a selected computational workflow",
        "limits": "does not establish social-research competence or justify a social-science method",
    },
    "R_PROJECT": {
        "publisher": "R Project",
        "title": "What is R?",
        "url": "https://www.r-project.org/about.html",
        "locator": "R is a language/environment for statistical computing and graphics, with modelling, tests, time series, classification, clustering and graphics.",
        "jurisdiction": "global technical resource",
        "supports": "statistical-computing route choice",
        "limits": "language capability does not choose a valid research design or interpretation",
    },
    "JUPYTER": {
        "publisher": "Project Jupyter",
        "title": "What is Jupyter?",
        "url": "https://docs.jupyter.org/en/latest/what_is_jupyter.html",
        "locator": "Notebook concept: code, explanatory text, data and visualisations in a shareable computational document.",
        "jurisdiction": "global technical resource",
        "supports": "reproducible explanation and analysis workflow",
        "limits": "an environment is not a method, model or competence proof",
    },
    "PANDAS": {
        "publisher": "pandas project",
        "title": "Getting started tutorials",
        "url": "https://pandas.pydata.org/pandas-docs/stable/getting_started/intro_tutorials/index.html",
        "locator": "Read/write tabular data, select subsets, create plots, derive columns, calculate summaries, reshape and handle text.",
        "jurisdiction": "global technical resource",
        "supports": "Python tabular-data preparation",
        "limits": "data handling is not sampling, measurement, inference or ethics",
    },
    "STATSMODELS": {
        "publisher": "statsmodels project",
        "title": "statsmodels User Guide",
        "url": "https://www.statsmodels.org/stable/user-guide.html",
        "locator": "Regression/linear models, generalised linear models, mixed effects, time series, contingency tables and other statistical tools.",
        "jurisdiction": "global technical resource",
        "supports": "interpretable statistical-model implementation",
        "limits": "requires statistical concepts; output does not validate constructs or assumptions",
    },
    "MIT_DATA_SOCSCI": {
        "publisher": "MIT OpenCourseWare",
        "title": "Data Analysis for Social Scientists (14.310x, Spring 2023)",
        "url": "https://ocw.mit.edu/courses/14-310x-data-analysis-for-social-scientists-spring-2023/",
        "locator": "Course description and materials: probability/statistics, regression/econometrics, experimental design, R, data visualisation and empirical analysis; OCW materials are free to access.",
        "jurisdiction": "global university teaching resource; U.S. examples",
        "supports": "free advanced learning for quantitative social-science analysis and model interpretation",
        "limits": "advanced mathematical/statistical prerequisites; examples are not Nigerian data or a professional credential",
    },
    "NETWORKX": {
        "publisher": "NetworkX project",
        "title": "Introduction to NetworkX",
        "url": "https://networkx.org/documentation/stable/reference/introduction.html",
        "locator": "Graph objects, generators, algorithms, network analysis and reporting.",
        "jurisdiction": "global technical resource",
        "supports": "bounded social-network/relationship analysis",
        "limits": "requires a valid network question and data; graph statistics are not causal proof",
    },
    "GEPHI": {
        "publisher": "Gephi project",
        "title": "Gephi Quickstart",
        "url": "https://gephi.org/quickstart/",
        "locator": "Import a source-target CSV and control graph layouts, filters and labels for network visualisation.",
        "jurisdiction": "global open-source tool",
        "supports": "visual exploration of relationship data",
        "limits": "visualisation does not establish network validity or causal explanation",
    },
    "MESA": {
        "publisher": "Mesa project",
        "title": "Mesa documentation and first model tutorial",
        "url": "https://mesa.readthedocs.io/stable/tutorials/0_first_model.html",
        "locator": "First-model tutorial covering agents, model steps, data collection and visualisation; the documentation distinguishes modelling, analysis and visualisation.",
        "jurisdiction": "global open-source framework",
        "supports": "agent-based social simulation learning",
        "limits": "simulation outputs depend on stated rules and assumptions; not real-world evidence",
    },
    "CASEVO": {
        "publisher": "Casevo project",
        "title": "Casevo: Cognitive Agents and Social Evolution Simulator",
        "url": "https://github.com/rgCASS/casevo",
        "locator": "README introduction, installation, sample social simulation and result-analysis sections.",
        "jurisdiction": "global emerging open project",
        "supports": "specialist cognitive-agent/social-simulation option",
        "limits": "narrow emerging project; no broad professional requirement or validated human-behaviour claim",
    },
    "SKLEARN": {
        "publisher": "scikit-learn project",
        "title": "scikit-learn User Guide",
        "url": "https://scikit-learn.org/stable/user_guide.html",
        "locator": "Text feature extraction, supervised learning, model evaluation and common pitfalls.",
        "jurisdiction": "global technical resource",
        "supports": "specialist text/predictive workflow",
        "limits": "predictive accuracy does not establish construct validity, representativeness, causality or ethical permission",
    },
    "AOIR_GUIDELINES": {
        "publisher": "Association of Internet Researchers",
        "title": "Internet Research: Ethical Guidelines 3.0",
        "url": "https://aoir.org/reports/ethics3.pdf",
        "locator": "Sections 3.1-3.4 (PDF pp. 9-16) on research lifecycle, informed consent, privacy expectations, context and ethical decision-making; Sections 4-5 discuss big-data research and data governance.",
        "jurisdiction": "international professional research ethics guidance; context-sensitive, not law",
        "supports": "ethical scoping of digital-trace collection, storage, analysis and publication",
        "limits": "guidance rather than legal permission or a substitute for institutional review and Nigerian law",
    },
    "DIGITAL_TRACE_ERROR_FRAMEWORK": {
        "publisher": "Public Opinion Quarterly / Oxford University Press",
        "title": "Total Error Framework for Digital Traces of Human Behavior on Online Platforms",
        "url": "https://academic.oup.com/poq/article/85/S1/399/6359490",
        "locator": "Abstract and article sections on trace/user selection, platform restrictions, measurement and inference error; the framework adapts survey-error thinking to digital-trace studies.",
        "jurisdiction": "peer-reviewed methods article; illustrative platform studies, not Nigerian validation",
        "supports": "digital-trace construct/sampling/error appraisal and limitation reporting",
        "limits": "conceptual framework, not a single universal measurement solution or free beginner course",
    },
    "NDP_ACT": {
        "publisher": "Nigeria Data Protection Commission",
        "title": "Nigeria Data Protection Act, 2023 and NDPC resources",
        "url": "https://ndpc.gov.ng/resources/",
        "locator": "Resources page links the Nigeria Data Protection Act 2023 and public-institution data-management guidance; use the current Act text for legal claims.",
        "jurisdiction": "Nigeria",
        "supports": "local privacy/data-governance context for human and digital research",
        "limits": "legal/regulatory context, not a research-method or software requirement",
    },
}


SHARED_FOUNDATION = [
    {
        "id": "d078-research-question-design",
        "label": "Frame a researchable social question and choose a fitting design",
        "status": "inherited_domain_candidate_not_student_approved",
        "reason": "shared because the area routes all require a bounded question before choosing a method or tool; the area adds its own task-specific form.",
    },
    {
        "id": "d078-evaluate-evidence-and-limits",
        "label": "Evaluate evidence and explain what it can and cannot show",
        "status": "inherited_domain_candidate_not_student_approved",
        "reason": "shared because all three areas require evidence appraisal and limitation reporting; the area records add their own evidence/measurement limits.",
    },
    {
        "id": "d078-responsible-research",
        "label": "Plan research responsibly when people or sensitive data are involved",
        "status": "inherited_domain_candidate_not_student_approved",
        "reason": "shared domain foundation; area records specify spatial, evaluation or digital-data privacy implications.",
    },
    {
        "id": "d078-communicate-evidence",
        "label": "Communicate findings for the intended audience",
        "status": "inherited_domain_candidate_not_student_approved",
        "reason": "shared output capability; the area adds the relevant map, evaluation report or reproducible/digital output.",
    },
    {
        "id": "d078-care-for-research-data",
        "label": "Organise and protect research information when a project uses data",
        "status": "inherited_domain_candidate_not_student_approved",
        "reason": "shared data-stewardship foundation; each area adds the data type and risk context it actually uses.",
    },
]


def src(*ids: str) -> list[dict]:
    return [{"source_id": i, **SOURCES[i]} for i in ids if i in SOURCES]


def item(
    key: str,
    label: str,
    kind: str,
    task_id: str,
    what: str,
    task_connection: str,
    output: str,
    prerequisites: list[str],
    complements: list[str],
    alternatives: list[str],
    limits: list[str],
    authoritative: list[str],
    explanatory: list[str],
    learning: list[str],
    global_context: str,
    nigeria_context: str,
    area_route: str,
    status: str = "area_owned_research_candidate_hidden",
    certification_note: str = "No universal area-wide certification is established by this pass; any employer, regulator or jurisdiction credential must be checked separately.",
) -> dict:
    return {
        "key": key,
        "label": label,
        "type": kind,
        "task_family_id": task_id,
        "what_it_is": what,
        "task_connection": task_connection,
        "meaning_in_selected_programme": "Do not claim that the selected programme teaches this item unless programme curriculum/outcome evidence supports that exact claim; otherwise label it domain/area enrichment.",
        "meaning_in_domain": "This is a D078 area-level addition or route-specific option, not automatically a shared domain foundation.",
        "area_context": area_route,
        "role_application": "A role receives this item only when its independently evidenced task route requires or benefits from it; area ownership alone does not prove role fit.",
        "learner_output": output,
        "prerequisites": prerequisites,
        "complements": complements,
        "valid_alternatives": alternatives,
        "limitations_or_non_substitutions": limits,
        "certification_or_qualification_note": certification_note,
        "global_context": global_context,
        "nigeria_context": nigeria_context,
        "authoritative_evidence": src(*authoritative),
        "explanatory_evidence": src(*explanatory),
        "free_task_specific_learning_links": src(*learning),
        "evidence_access_date": TODAY,
        "learning_link_gate": "candidate_scope_checked; independently verify link resolution, lesson scope, access and level before student display",
        "student_visible": False,
        "status": status,
        "relationships": [],
    }


def relation(kind: str, target: str, explanation: str, evidence: list[str]) -> dict:
    return {"type": kind, "target_key": target, "explanation": explanation, "evidence_source_ids": evidence}


def build_area(area_id: str, label: str, boundary: str, exclusions: list[str], inherited: list[str], task_families: list[dict], area_notes: dict) -> dict:
    all_items = [i for t in task_families for i in t["items"]]
    known = {i["key"] for i in all_items}
    for i in all_items:
        for r in i["relationships"]:
            if r["target_key"] not in known and not r["target_key"].startswith("foundation:"):
                raise ValueError(f"Unknown relationship target {r['target_key']} in {i['key']}")
    final_items = []
    for i in all_items:
        i = dict(i)
        i["id"] = f"{area_id}:{i['key']}"
        i.pop("key")
        i["relationships"] = [
            {**r, "target_id": r.pop("target_key") if r.get("target_key", "").startswith("foundation:") else f"{area_id}:{r.pop('target_key')}"}
            for r in i["relationships"]
        ]
        final_items.append(i)
    return {
        "area_id": area_id,
        "label": label,
        "area_layer_definition": "subgroup = area of specialization = area of practice; one intermediate layer between D078 and roles",
        "boundary": boundary,
        "exclusions": exclusions,
        "sibling_boundary_rule": "Do not move a candidate into this area because of its label, ISCO/ESCO membership, frequency or technical compatibility. Require task/output evidence for this area's boundary.",
        "inherited_domain_foundation": [x for x in SHARED_FOUNDATION if x["id"] in inherited],
        "area_owned_additions": final_items,
        "task_families": [{k: v for k, v in t.items() if k != "items"} | {"item_ids": [f"{area_id}:{i['key']}" for i in t["items"]]} for t in task_families],
        "certification_boundary": area_notes["certification_boundary"],
        "global_context": area_notes["global_context"],
        "nigeria_context": area_notes["nigeria_context"],
        "search_findings": area_notes["search_findings"],
        "unresolved_gaps": area_notes["unresolved_gaps"],
        "student_display": False,
        "status": "area_enriched_research_candidate_not_student_approved",
    }


def main() -> None:
    areas = []

    t = "D078:human-geography-population:spatial-patterns"
    spatial = [
        item("spatial-concepts-and-place", "Spatial patterns, place and scale", "knowledge", t, "Knowledge of how place, scale, location and spatial distribution affect a social question.", "Sets the geographic unit, scale and interpretation frame before a map or spatial statistic is used.", "A short place/scale framing note with the chosen unit and an explanation of why it fits the question.", ["A bounded question about people, services, settlement or social conditions.", "Basic data literacy and awareness that geographic units affect comparison."], ["Population measures", "Data provenance and metadata", "Domain theory about the people or institutions being studied."], ["Non-spatial tabulation when location is not part of the question.", "Qualitative place-based fieldwork when spatial measurement is not needed."], ["A map cannot make a weak construct valid or show causation.", "Changing scale or boundaries can change the observed pattern."], ["UNESCO_ISCED", "UN_DESA_PD"], ["OL_MIGRATION", "OPEN_TEXTBOOK_HUMAN_GEOGRAPHY"], ["OPEN_TEXTBOOK_HUMAN_GEOGRAPHY"], "Human geography treats people/place relations as a contextual lens, not a promise that every social study requires GIS.", "NBS and NPC data use geographic identifiers and local definitions; verify the administrative unit and date before comparing Nigerian data.", "Area-owned conceptual foundation for human-place and population questions."),
        item("spatial-data-provenance-scale", "Spatial data provenance, geographic units and scale", "competency", t, "The ability to check where spatial data came from, what geographic unit it represents, its date, coverage and scale, and whether the comparison is defensible.", "Prevents a learner from treating a map layer as self-explanatory or combining incompatible boundaries without checking.", "A provenance table and a documented decision about geographic unit, time period and scale.", ["A defined spatial question and data dictionary/metadata.", "Understanding of administrative and analytical geographic units."], ["Research data stewardship", "Map interpretation", "NBS/NPC metadata or other official source documentation."], ["Use a non-spatial dataset when geography is irrelevant.", "Use qualitative place descriptions when precise spatial measurement is unavailable."], ["Metadata checks do not repair biased or incomplete data.", "Different boundaries can produce different patterns; no map is automatically neutral."], ["UNSD_CENSUS", "UNSD_MIGRATION", "NBS_GHS"], ["OL_MIGRATION"], ["QGIS_TRAINING"], "Geographic data quality and scale are part of the analysis, not merely a software setting.", "NBS microdata and official reports have dataset-specific access, identifiers and definitions; do not infer nationwide patterns from one survey.", "Area-owned competency required before using GIS outputs."),
        item("spatial-analysis-method", "Spatial analysis and map-based comparison", "method", t, "A method for comparing social conditions across locations or scales using appropriate spatial data, map choices and analytical operations.", "Turns a place-related question into a map/table/analysis while keeping geographic units and uncertainty visible.", "A map or spatial comparison accompanied by method, scale, source, missing-data and interpretation notes.", ["Spatial question and fit-for-purpose geodata.", "Provenance/scale checks and basic map reading."], ["QGIS or another GIS", "Descriptive statistics", "Population and social theory."], ["Non-GIS tabulation or charts.", "Fieldwork, interviews or administrative-data analysis when spatial computation is not needed."], ["Spatial association is not causation.", "A GIS procedure does not validate the measure, data coverage or policy conclusion."], ["UNESCO_ISCED", "ONET_GEOG", "UNSD_CENSUS"], ["OPEN_TEXTBOOK_HUMAN_GEOGRAPHY"], ["QGIS_TRAINING"], "GIS is a method/tool route for spatial questions, not a universal human-geography prerequisite.", "Local boundary, census and survey definitions must be confirmed from Nigerian official sources; QGIS training examples are not Nigerian evidence.", "Area-owned method; choose GIS only when the task's output is spatial."),
        item("qgis-spatial-tool", "QGIS for a human-geography spatial workflow", "tool", t, "Free/open-source GIS software for loading, inspecting, transforming, analysing and mapping spatial data.", "Implements the spatial-analysis method when the learner needs layers, vector/network analysis or spatial statistics for a people/place question.", "A reproducible QGIS project with source layers, documented CRS/boundaries, analysis steps, map and limitations.", ["Spatial question and spatial data with usable metadata.", "Basic map/attribute-table literacy; QGIS project and layer management."], ["Spatial-data provenance", "Population/social theory", "Spreadsheet/R/Python for non-spatial preparation when justified."], ["Non-GIS tables/charts.", "R/Python spatial packages or another GIS when the task and access justify it."], ["QGIS does not decide the right geographic unit, construct, sample or causal interpretation.", "Training exercises do not establish Nigerian boundary authority or professional competence."], ["QGIS_TRAINING", "UNSD_CENSUS"], ["QGIS_TRAINING"], ["QGIS_TRAINING"], "A conditional area tool; it is not inherited as a D078-wide foundation item.", "Use Nigerian official boundary/data sources where possible and label open/global examples separately.", "Area-owned conditional tool for spatial outputs."),
        item("spatial-pattern-communication", "Explain spatial patterns without overclaiming", "skill", t, "Communicate what a map or spatial table shows, what it does not show, and how scale, missingness and alternative explanations affect the conclusion.", "Connects the spatial result to a defensible social explanation rather than presenting a colourful map as proof.", "A student-friendly map narrative with comparison, uncertainty and alternative explanations.", ["A map/table and its metadata.", "Basic evidence appraisal and writing for the intended audience."], ["QGIS or another visualisation tool", "Domain knowledge", "Evidence communication."], ["A non-spatial narrative or table where the spatial claim cannot be supported."], ["Visual clarity can hide weak measurement or missing areas.", "A local pattern is not automatically representative of every population or place."], ["ONET_GEOG", "UNSD_CENSUS"], ["OPEN_TEXTBOOK_HUMAN_GEOGRAPHY"], ["QGIS_TRAINING"], "Outputs should state whether the pattern is descriptive, comparative or model-based.", "Nigerian spatial claims must name the state/LGA/urban unit, date and source; do not generalise from one place.", "Area-owned communication skill for maps and spatial comparisons."),
    ]
    t2 = "D078:human-geography-population:population-change"
    population = [
        item("population-measures", "Population measures and demographic change", "knowledge", t2, "Understanding population size, composition, fertility, mortality, migration, growth and change over time.", "Provides the concepts needed to interpret population tables, rates, projections and migration measures.", "A clearly defined population profile or change summary with denominator, period and source stated.", ["Basic numeracy and understanding of rates/denominators.", "A defined population and reference period."], ["Census/survey/administrative data appraisal", "Migration concepts", "Uncertainty communication."], ["Qualitative demographic context when numeric measurement is not justified.", "A bounded local case study rather than a population-wide claim."], ["A rate or projection is not a direct count of every person or a forecast certainty.", "Population data can be delayed, undercounted or definition-dependent."], ["UN_DESA_PD", "UNSD_MIGRATION", "UNSD_CENSUS"], ["OL_MIGRATION"], ["IUSSP_DEMOGRAPHY"], "Demographic concepts are widely used, but measures and data systems differ across countries and studies.", "Use NBS/NPC sources and cite the date/definition; do not substitute international estimates for Nigerian official metadata.", "Area-owned knowledge addition."),
        item("census-survey-admin-appraisal", "Appraise census, survey and administrative population data", "method", t2, "A method for comparing population data sources by coverage, definitions, reference period, quality, missingness and intended use.", "Helps the learner decide whether a census, survey, register or administrative source can answer the question.", "A source-comparison table with coverage, definitions, quality limitations and a justified choice.", ["Population question and awareness of data-source metadata.", "Basic sampling/coverage and measurement concepts."], ["NBS/NPC catalogues", "Data stewardship", "Spatial unit and scale checks."], ["Use one bounded official table with an explicit limitation.", "Qualitative/field data when official sources cannot answer the question."], ["Data appraisal does not make a source complete or unbiased.", "Different sources may measure different populations or periods and should not be merged silently."], ["UNSD_CENSUS", "UNSD_MIGRATION", "NBS_GHS", "NBS_POP"], ["NBS_GHS"], ["IUSSP_DEMOGRAPHY"], "Source appraisal is a method choice; it does not require a particular software product.", "NBS GHS metadata is a concrete Nigerian example; access and variable definitions remain dataset-specific.", "Area-owned method for population evidence."),
        item("migration-urbanisation-interpretation", "Interpret migration and urbanisation patterns", "skill", t2, "Relate migration, settlement and urban change to place, time and social/economic context while separating description from explanation.", "Supports analysis of how movement and settlement change communities and services without assuming one cause.", "A bounded migration/urbanisation comparison with source, period, place, competing explanations and limits.", ["Migration definitions and reference period.", "Evidence appraisal and contextual knowledge."], ["UNSD migration standards", "Spatial/place analysis", "Interviews or administrative data when appropriate."], ["A local qualitative case narrative.", "Descriptive official statistics without causal interpretation."], ["Migration association does not establish why people moved.", "Urban categories and boundaries vary; international examples cannot be transferred uncritically to Nigeria."], ["UNSD_MIGRATION", "UN_DESA_PD"], ["OL_MIGRATION"], ["OL_MIGRATION"], "A contextual interpretive skill that can use quantitative or qualitative evidence.", "Use Nigerian migration variables and settlement definitions from the relevant dataset/authority; local variation is material.", "Area-owned skill."),
        item("demographic-estimation-projection", "Population estimation and projection with uncertainty", "method", t2, "A method for producing or interpreting estimates/projections using stated inputs, time adjustment, assumptions and uncertainty.", "Adds a projection route only when the question needs future population scenarios or estimates beyond direct counts.", "A documented estimate/projection with inputs, assumptions, sensitivity or uncertainty explanation and non-use warning.", ["Demographic rates and source quality.", "Basic quantitative reasoning and ability to state assumptions."], ["UN DESA methods", "Population measures", "R/Python/SPSS or another tool only if the chosen model requires it."], ["Descriptive historical trend without projection.", "Scenario narrative where data do not support numeric projection."], ["A projection is conditional, not a fact or promise.", "Model choice, input quality and migration assumptions can materially change results."], ["UN_DESA_METHOD", "UN_DESA_PD"], ["IUSSP_DEMOGRAPHY"], ["IUSSP_DEMOGRAPHY"], "A specialist population-method route, not a universal requirement for every human-geography learner.", "Do not project Nigerian populations without checking official definitions, available series and current source revisions.", "Area-owned specialist method."),
    ]
    for i, r in enumerate(population):
        if i == 1:
            r["relationships"].append(relation("builds_on", "population-measures", "Source appraisal builds on knowing what the population measure and denominator mean.", ["UNSD_CENSUS", "NBS_GHS"]))
        if i == 2:
            r["relationships"].append(relation("builds_on", "population-measures", "Migration and urbanisation interpretation requires defined measures and reference periods.", ["UNSD_MIGRATION"]))
        if i == 3:
            r["relationships"].append(relation("requires", "population-measures", "Projection requires population measures and assumptions before a model can be interpreted.", ["UN_DESA_METHOD"]))
    for i, r in enumerate(spatial):
        if i == 1:
            r["relationships"].append(relation("builds_on", "spatial-concepts-and-place", "Provenance and scale checks operationalise the place/scale framing.", ["UNSD_CENSUS"]))
        if i == 2:
            r["relationships"].append(relation("requires", "spatial-data-provenance-scale", "Spatial analysis requires knowing the units, source and scale of the data.", ["UNSD_CENSUS", "QGIS_TRAINING"]))
        if i == 3:
            r["relationships"].append(relation("supports", "spatial-analysis-method", "QGIS implements selected spatial-analysis operations; it does not replace the method.", ["QGIS_TRAINING"]))
        if i == 4:
            r["relationships"].append(relation("builds_on", "spatial-analysis-method", "Communication follows the spatial method and its limitations.", ["ONET_GEOG"]))
    areas.append(build_area("D078:human-geography-population", "Human Geography and Population Studies", "Examines people, place, migration, settlement, population change and spatial patterns in social and economic life.", ["physical-geography-only analysis", "geospatial engineering without a human/population question", "clinical or psychological practice"], [x["id"] for x in SHARED_FOUNDATION], [{"task_id": t, "task_wording": "Describe how people, services or social conditions vary across places and scales by checking spatial data provenance, geographic units and map choices before interpreting a pattern.", "evidence": src("UNESCO_ISCED", "ONET_GEOG", "UNSD_CENSUS"), "learning_links": src("QGIS_TRAINING", "OPEN_TEXTBOOK_HUMAN_GEOGRAPHY"), "items": spatial}, {"task_id": t2, "task_wording": "Measure and explain population change using fertility, mortality and migration concepts, checking source coverage and assumptions before comparing estimates or projections.", "evidence": src("UN_DESA_PD", "UNSD_MIGRATION", "UN_DESA_METHOD", "NBS_GHS"), "learning_links": src("IUSSP_DEMOGRAPHY", "OL_MIGRATION"), "items": population}], {"certification_boundary": "No universal Human Geography and Population Studies certification was established. GIS or demographic credentials may be vendor-, employer-, university- or association-specific and must not be displayed as universally required.", "global_context": "The area combines human-place and population questions; GIS and projection are conditional routes selected by the question and evidence, not automatic requirements.", "nigeria_context": "NBS/NPC data and a University of Ibadan curriculum example provide Nigerian context; they do not establish one national task set or local requirement for every learner.", "search_findings": ["The existing inventory had the correct broad boundary but did not attach area-owned tool/resource records to the core task items.", "QGIS is retained only for spatial questions; demographic estimation is retained as a specialist method with explicit uncertainty.", "NBS/NPC evidence adds local data context without narrowing global practice."], "unresolved_gaps": ["No universal area credential was found; unresolved by design, not a reason to invent one.", "QGIS and IUSSP links still require final link/level/access QA before display.", "Role-specific GIS or demographic requirements remain outside this area pass and must use the separate role task evidence."]}))

    t = "D078:social-research-evaluation:design-social-study"
    design = [
        item("study-question-design", "Turn a social question into a feasible study design", "skill", t, "The skill of defining the purpose, population, evidence, method, sampling, ethics and limits before collecting data.", "Provides the area-specific bridge from a broad social question to a defensible research plan.", "A study brief containing question, population, design, evidence plan, ethics/data plan and inference limits.", ["A question worth answering and enough domain context to define the population.", "Basic evidence and ethics awareness."], ["Sampling/measurement", "Survey/interview/document methods", "Theory of change for evaluation projects."], ["Exploratory reading or a bounded document review when fieldwork is not justified.", "A descriptive analysis of existing data."], ["A design document is not evidence that the study was conducted or that a result is true.", "Feasibility does not remove sampling or measurement bias."], ["CDC_EVAL", "MAGENTA_BOOK", "AEA_COMPETENCIES"], ["OPENLEARN_EVAL"], ["CDC_EVAL"], "This is the area-owned design skill; domain research-question framing is inherited but not duplicated as a new universal requirement.", "Nigeria-specific study design must respect local population, institution, language, ethics and data-governance context; do not assume a global sample frame applies.", "Area-owned skill."),
        item("sampling-and-measurement", "Sampling, measurement and representativeness", "method", t, "A method for deciding who or what is observed and how concepts become questions, indicators, categories or measures.", "Controls whether the collected evidence can support the intended descriptive or evaluative claim.", "A sampling/measurement plan with inclusion criteria, operational definitions, possible bias and representativeness limits.", ["Defined population/construct and intended use of the findings.", "Basic numeracy and evidence appraisal."], ["Survey/interview methods", "Pilot and pretesting", "Quantitative or qualitative analysis."], ["Purposive case study or qualitative design where statistical representation is not the aim.", "Secondary-data analysis with an explicit coverage limitation."], ["No sampling plan can make an inaccessible population representative.", "Measurement choices can change the apparent result; software cannot repair weak constructs."], ["CDC_EVAL", "MAGENTA_BOOK"], ["OPENLEARN_EVAL"], ["CDC_EVAL"], "A method owned by research/evaluation; it is relevant to many routes but not a software skill.", "Use Nigerian frames/definitions only when the local study supports them; identify geographic and language coverage explicitly.", "Area-owned method."),
        item("field-and-document-method-choice", "Choose between surveys, interviews, focus groups and document methods", "method", t, "A method-choice process that matches the evidence source to the question, participants, setting, sensitivity and intended use.", "Prevents the learner from treating survey, interview, focus group or document analysis as interchangeable or universally required.", "A justified method-choice note and a draft instrument or document-analysis protocol.", ["Study purpose, population and ethics considerations.", "Understanding what each method can and cannot show."], ["Sampling/measurement", "Qualitative or quantitative analysis", "Data stewardship and consent."], ["Observation, secondary-data or archival methods when those better answer the question.", "Mixed methods only when integration is justified."], ["A method choice does not guarantee response quality, truthful answers or causal evidence.", "Focus groups and interviews capture situated accounts, not automatically population prevalence."], ["CDC_EVAL", "AEA_COMPETENCIES"], ["OL_MIGRATION", "OPENLEARN_EVAL"], ["OPENLEARN_EVAL"], "The area owns method choice; individual tools are optional implementations.", "Local language, recruitment, safety and institutional ethics may change the feasible design in Nigeria.", "Area-owned method."),
        item("research-ethics-data-stewardship", "Protect participants and handle research data responsibly", "competency", t, "The ability to plan consent/permission, confidentiality, secure handling, retention, reporting and respectful engagement for the actual study.", "Makes ethics and data stewardship part of the design rather than a late warning.", "An ethics/data-management note showing consent/permission, minimisation, access, security, retention and reporting decisions.", ["Known data type, participants and intended use.", "Awareness of institutional review and applicable privacy requirements."], ["Sampling/measurement", "Research question/design", "Nigeria Data Protection Act context where applicable."], ["Use public aggregate data when individual-level collection is not needed.", "Anonymised secondary data when permission and provenance are adequate."], ["A privacy policy is not the same as ethics approval.", "De-identification may not remove all re-identification risk; ethical duties continue during analysis/reporting."], ["AEA_GUIDING", "CDC_EVAL", "NDP_ACT"], ["MAGENTA_BOOK"], ["CDC_EVAL"], "The competency is broader than a consent form or software setting.", "Nigeria-specific personal-data handling must be checked against the NDP Act/NDPC guidance and institutional requirements.", "Area-owned competency."),
        item("kobo-electronic-collection", "KoboToolbox for electronic form collection", "tool", t, "A digital form-collection platform that can support browser/mobile data capture, validation, offline workflows and export when the study design calls for it.", "Implements one data-collection route after the questionnaire, sampling and ethics are already justified.", "A tested form, version record, validation/skip logic, consent/permission flow and exported dataset with metadata.", ["A validated instrument, sampling/recruitment plan and lawful/ethical data permission.", "Device/connectivity and data-security plan."], ["Sampling/measurement", "Data dictionary", "CSV/Excel/SPSS/R/Python analysis route after export."], ["Paper forms or another data-collection platform.", "Interview/focus-group/document methods when an electronic form is inappropriate."], ["KoboToolbox does not make a questionnaire valid, a sample representative or an analysis correct.", "Offline/device/export settings can create missingness or version problems; test before fieldwork."], ["KOBO_WEBFORMS", "KOBO_EXPORT"], ["KOBO_WEBFORMS"], ["KOBO_WEBFORMS", "KOBO_EXPORT"], "A conditional collection tool for selected survey/field workflows; not a domain-wide requirement.", "Availability and device/connectivity conditions vary; local consent, privacy and data-transfer requirements still apply in Nigeria.", "Area-owned conditional tool."),
    ]
    eval_items = [
        item("programme-theory-and-logic", "Describe how a programme is expected to produce change", "knowledge", "D078:social-research-evaluation:programme-evaluation", "Knowledge of programme context, activities, assumptions, outputs, outcomes and a logic model/theory of change.", "Gives an evaluation a clear object and helps connect evidence to the programme's intended pathway.", "A concise programme narrative and logic model with assumptions, context and intended users.", ["A real or clearly bounded programme/intervention.", "Basic distinction between activities, outputs and outcomes."], ["Evaluation questions", "Stakeholder engagement", "Process/impact/value-for-money methods."], ["Descriptive implementation review without a full causal claim.", "Document review when programme access is limited."], ["A logic model describes an intended pathway; it does not prove that the pathway worked.", "Theory of change must be tested against context and implementation evidence."], ["CDC_EVAL", "MAGENTA_BOOK"], ["OPENLEARN_EVAL"], ["OPENLEARN_EVAL"], "Programme theory is area-owned evaluation knowledge, not a universal tool or role credential.", "Nigeria's National M&E Policy provides a local government-policy context, not evidence that every D078 learner works in government evaluation.", "Area-owned knowledge/method."),
        item("evaluation-design-and-evidence", "Select evaluation questions, design and credible evidence", "method", "D078:social-research-evaluation:programme-evaluation", "A method for matching evaluation purpose and intended use to process, outcome, impact, value-for-money or theory-based evidence.", "Prevents selecting an impressive method that cannot answer the intended decision question.", "An evaluation plan stating users, questions, design, indicators, data sources, analysis and limitations.", ["Programme description and intended use.", "Understanding of qualitative, quantitative and mixed evidence."], ["CDC evaluation steps", "Magenta methods", "Stakeholder/context analysis."], ["Process monitoring or implementation learning when impact attribution is not feasible.", "Qualitative case study or contribution analysis where experimental evidence is not justified."], ["Evaluation cannot always isolate causation; conclusions must match the design and evidence.", "Monitoring, evaluation and impact are related but not identical."], ["CDC_EVAL", "MAGENTA_BOOK", "AEA_COMPETENCIES"], ["CDC_EVAL"], ["CDC_EVAL", "MAGENTA_BOOK"], "Evaluation methods are selected by purpose and context; no single evaluation method is universal.", "Apply Nigeria's M&E Policy only within its stated public-policy scope and verify the current policy/version before presenting it as local guidance.", "Area-owned evaluation method."),
        item("stakeholder-use-and-reporting", "Turn findings into usable, transparent recommendations", "skill", "D078:social-research-evaluation:programme-evaluation", "The skill of reporting evidence, uncertainty, context and recommendations for the people who will use the evaluation.", "Connects analysis to a decision without hiding limitations or treating recommendations as findings.", "A reader-friendly evaluation brief with evidence trail, uncertainty, alternative explanations and actionable recommendations.", ["Analysed evidence and an identified intended audience.", "Ability to distinguish findings, interpretation and recommendation."], ["Evaluation design", "Data visualisation", "Ethics and respectful communication."], ["Technical appendix plus plain-language summary.", "A learning memo where a formal evaluation report is not appropriate."], ["Clear writing does not compensate for weak evidence.", "Recommendations are not proof of impact and may depend on stakeholder values/resources."], ["CDC_EVAL", "AEA_COMPETENCIES", "AEA_GUIDING"], ["MAGENTA_BOOK"], ["CDC_EVAL"], "The output is a communication competency, not a claim of policy authority.", "Local stakeholders, institutions and affected communities should be identified in the Nigerian context; do not assume a UK/US governance pathway.", "Area-owned skill."),
        item("quantitative-analysis-choice", "Use a quantitative analysis workflow only when the design supports it", "method", "D078:social-research-evaluation:programme-evaluation", "A quantitative route for preparing, analysing and reporting numeric programme or survey evidence with assumptions and uncertainty visible.", "Adds quantitative analysis only when the evaluation question, measurement and data support it.", "A table/model/figure with method, assumptions, missing-data decisions, uncertainty and interpretation limits.", ["Measurement and sampling plan.", "A defined quantitative question and data dictionary."], ["SPSS, R, Stata or Python as alternatives", "Data-quality checks", "Evaluation design."], ["Qualitative process evaluation.", "Mixed-methods integration when numerical evidence alone is insufficient."], ["Software output does not repair confounding, weak measurement, missingness or causal overclaiming.", "A statistically significant result is not automatically important or causal."], ["CDC_EVAL", "MAGENTA_BOOK"], ["OPENLEARN_SPSS", "DATACARP_R"], ["OPENLEARN_SPSS", "DATACARP_R"], "The method is area-owned; SPSS/R/Stata/Python are alternatives, not cumulative requirements.", "Use Nigerian data definitions, permissions and institutional review requirements; international courses do not establish Nigerian causal claims.", "Area-owned conditional method with alternative tools."),
        item("spss-quantitative-tool", "IBM SPSS for a justified social-data analysis", "tool", "D078:social-research-evaluation:programme-evaluation", "Commercial statistical software that can organise data and run selected descriptive/inferential procedures after the method and assumptions are chosen.", "Provides one implementation option for a quantitative evaluation or survey workflow.", "An analysis file/output with variable definitions, selected procedure, assumptions, checks and interpretation.", ["Measurement/sampling knowledge and a defined procedure.", "Valid licence/access or a documented alternative."], ["Data dictionary", "Evaluation design", "R, Stata or Python as alternatives."], ["R, Stata, Python, jamovi or a spreadsheet for simpler tasks.", "Qualitative methods when the question is not numeric."], ["SPSS does not choose the design, establish causation, correct bias or prove competence.", "Licence/modules/interface can vary."], ["OPENLEARN_SPSS", "CDC_EVAL"], ["OPENLEARN_SPSS"], ["OPENLEARN_SPSS"], "An optional quantitative tool, not a general D078 foundation item.", "No Nigeria-wide requirement to use SPSS was established; local access and data-governance conditions vary.", "Area-owned optional tool."),
        item("qualitative-coding-options", "NVivo or Taguette for documented qualitative coding", "tool", "D078:social-research-evaluation:design-social-study", "Software options for organising, highlighting/coding, retrieving and exporting qualitative material after the method and codebook are chosen.", "Supports a qualitative evidence workflow when interviews, documents or open responses warrant coding software.", "A documented codebook/project, coded excerpts, memos and an interpretation linked to source material.", ["Research question, qualitative design, lawful data and a coding approach.", "Confidentiality/data-management plan."], ["Manual coding with a codebook", "Thematic/framework analysis", "Reflexive memoing and contradictory-case review."], ["Manual coding, Taguette, NVivo or another task-suitable tool; choose by task/access.", "Quantitative analysis where the evidence is numeric and design supports it."], ["Software does not choose codes, make themes true, establish representativeness or replace researcher interpretation.", "NVivo licence/version and Taguette hosting/security must be checked."], ["NVIVO", "TAGUETTE", "AEA_GUIDING"], ["TAGUETTE"], ["TAGUETTE", "NVIVO"], "These are alternative implementations of a qualitative coding workflow, not two requirements to learn together.", "No Nigerian requirement for either named product was established; apply Nigerian institutional ethics and privacy rules to the data.", "Area-owned optional tool group."),
    ]
    for i, r in enumerate(design):
        if i == 1:
            r["relationships"].append(relation("builds_on", "study-question-design", "Sampling and measurement make the study design operational.", ["CDC_EVAL", "MAGENTA_BOOK"]))
        if i == 2:
            r["relationships"].append(relation("supports", "study-question-design", "Method choice is a concrete extension of the study plan.", ["AEA_COMPETENCIES"]))
        if i == 3:
            r["relationships"].append(relation("requires", "sampling-and-measurement", "Ethical stewardship must be designed around the actual people, measures and data.", ["AEA_GUIDING", "NDP_ACT"]))
        if i == 4:
            r["relationships"].append(relation("supports", "field-and-document-method-choice", "Kobo implements selected electronic-form collection after design and ethics decisions.", ["KOBO_WEBFORMS", "KOBO_EXPORT"]))
    for i, r in enumerate(eval_items):
        if i == 1:
            r["relationships"].append(relation("builds_on", "programme-theory-and-logic", "Evaluation design needs a clear programme pathway and intended use.", ["CDC_EVAL", "MAGENTA_BOOK"]))
        if i == 2:
            r["relationships"].append(relation("supports", "evaluation-design-and-evidence", "Reporting follows the design and evidence chain.", ["AEA_COMPETENCIES", "AEA_GUIDING"]))
        if i == 3:
            r["relationships"].append(relation("requires", "evaluation-design-and-evidence", "Quantitative analysis is chosen only after the evaluation question, design and measurement are established.", ["CDC_EVAL"]))
        if i == 4:
            r["relationships"].append(relation("alternative_to", "quantitative-analysis-choice", "The named products offer alternative implementations of qualitative coding, not a quantitative route.", ["TAGUETTE", "NVIVO"]))
    areas.append(build_area("D078:social-research-evaluation", "Social Research and Evaluation", "Designs, conducts and interprets qualitative, quantitative and mixed-method research to answer social questions and evaluate programmes or policies.", ["automatic job-readiness claims", "software-only competence claims", "clinical diagnosis or treatment"], [x["id"] for x in SHARED_FOUNDATION], [{"task_id": t, "task_wording": "Translate a social question into a feasible study design by defining purpose, population, evidence, sampling, method, ethics and the limits of the planned inference.", "evidence": src("CDC_EVAL", "MAGENTA_BOOK", "AEA_COMPETENCIES", "NGA_MNE_POLICY"), "learning_links": src("CDC_EVAL", "OPENLEARN_EVAL"), "items": design}, {"task_id": "D078:social-research-evaluation:programme-evaluation", "task_wording": "Evaluate a programme by clarifying intended use and stakeholders, describing context and implementation, selecting credible evidence and methods, and reporting justified conclusions and limitations.", "evidence": src("CDC_EVAL", "MAGENTA_BOOK", "NGA_MNE_POLICY"), "learning_links": src("CDC_EVAL", "OPENLEARN_EVAL"), "items": eval_items}], {"certification_boundary": "No universal social-research/evaluation certification was established. AEA competencies are a framework, not a statutory credential; Nigerian M&E policy is a public-policy framework, not a personal licence.", "global_context": "The area spans study design and evaluation; qualitative, quantitative and mixed approaches are alternatives selected by purpose, evidence and context.", "nigeria_context": "Nigeria's National M&E Policy provides a bounded government/evidence-informed planning context; NDPC/NBS sources add local data/privacy context without making every route a government evaluation route.", "search_findings": ["The domain inventory correctly contained research methods and tools, but did not separate the area's design/evaluation task families from shared domain foundations.", "KoboToolbox, SPSS, NVivo and Taguette are retained as task-specific options with alternatives and limits.", "Nigeria M&E policy strengthens local context but does not create a universal role, tool or certification requirement."], "unresolved_gaps": ["No universal credential was found; this is a supported negative finding rather than an omitted certification.", "All tool links require final version/licence/access QA before display.", "Role-specific requirements remain outside this lane and are not inferred from area ownership."]})

    )
    t = "D078:computational-digital-social-science:reproducible-social-data"
    reproducible = [
        item("computational-question-formulation", "Translate a social question into a computational task", "skill", t, "The skill of deciding whether a social question needs repeatable data processing, text/network analysis or simulation and stating the output before choosing code or a package.", "Stops the learner from starting with Python or a library before defining the social construct, data and expected output.", "A task specification linking question, data, operation, output, validation and limitations.", ["A bounded social question and basic data/research literacy.", "Understanding that code implements a method rather than replacing it."], ["Research design", "Data provenance", "Python/R/Jupyter as route options."], ["Manual/spreadsheet workflow for a small simple dataset.", "Qualitative or non-computational study design where computation adds no defensible value."], ["A computational plan does not validate the construct, data or inference.", "Technical feasibility is not evidence of disciplinary relevance."], ["UNESCO_ISCED", "JUPYTER"], ["PYTHON_SOCSCI"], ["PYTHON_SOCSCI"], "Area-owned computational reasoning; Python is a possible implementation, not the prerequisite itself.", "Use Nigerian data availability, language, privacy and local context in the task specification; do not assume global data represent Nigeria.", "Area-owned skill."),
        item("data-provenance-and-digital-ethics", "Track data provenance, permissions and digital-research risk", "competency", t, "The ability to document data origin, collection process, access permission, transformations, privacy risk, platform limits and version history.", "Makes a computational result traceable and ethically bounded, especially for digital traces or personal data.", "A provenance/ethics record with source, access, transformations, permissions, retention and limitation notes.", ["Know the dataset/platform and intended use.", "Awareness of personal/sensitive data and applicable rules."], ["NDPC context", "Jupyter/notebook record", "Data dictionary and reproducible environment."], ["Use aggregate/open data where individual-level data are unnecessary.", "Manual/document research when digital collection is not permitted or representative."], ["A public URL does not mean unrestricted ethical reuse.", "Anonymisation and code do not eliminate re-identification or platform bias."], ["NDP_ACT", "JUPYTER"], ["CDC_EVAL"], ["PYTHON_SOCSCI"], "This is a computational-social-science competency, but privacy and evidence stewardship remain shared domain principles.", "Nigeria's NDP Act/NDPC resources are the local data-governance context; verify current legal guidance for the specific project.", "Area-owned competency with shared-domain inheritance."),
        item("reproducible-data-cleaning", "Clean and document a social-science dataset reproducibly", "skill", t, "The skill of importing, checking, transforming and documenting data so another person can understand and rerun the work.", "Turns raw social data into a traceable analysis-ready dataset without hiding decisions.", "A versioned notebook/script, data dictionary, cleaning log, output table/figure and caveat report.", ["Data permission and provenance.", "Basic data structures, missingness and variable meaning."], ["pandas or R", "Jupyter", "Data dictionary and version control."], ["Spreadsheet/OpenRefine/manual workflow for small transparent datasets.", "SPSS/Stata for a documented GUI/statistical workflow."], ["A script that runs does not prove data quality, valid measurement or sound inference.", "Cleaning may remove meaningful cases; decisions must be documented."], ["PYTHON_SOCSCI", "PANDAS", "JUPYTER"], ["DATACARP_R"], ["PYTHON_SOCSCI", "DATACARP_R"], "A core area workflow; the language/tool is chosen by task, access and reproducibility needs.", "Use local data dictionaries and data-access conditions for Nigerian datasets; do not publish personal or restricted microdata.", "Area-owned skill."),
        item("python-social-data-workflow", "Python for a social-science data workflow", "programming_language", t, "A programming language that can make data preparation, analysis, visualisation and reporting repeatable through scripts and packages.", "Supports computational social research when the learner needs a repeatable workflow, not as a general D078 requirement.", "A documented Python analysis/notebook that reads, cleans, analyses or visualises a bounded social dataset.", ["Computational task specification and basic programming/data structures.", "Data permission, research design and a suitable social dataset."], ["Jupyter", "pandas", "statsmodels/NetworkX/Mesa only when their task is justified."], ["R, SPSS, Stata, spreadsheet or manual workflow depending on task and access."], ["Python does not teach research design, validate constructs, establish causation or prove employability.", "A library's technical compatibility does not establish area or role fit."], ["PYTHON_TUTORIAL", "PYTHON_SOCSCI"], ["PYTHON_SOCSCI"], ["PYTHON_SOCSCI"], "Conditional area option; not every computational social scientist must use Python.", "There is no Nigerian requirement established here to use Python; local data, language, privacy and institutional context still govern the project.", "Area-owned conditional programming route."),
        item("r-social-data-workflow", "R for social-science data analysis", "tool", t, "An open-source statistical computing language/environment for analysis and graphics, with a social-science learning route using a real interview dataset.", "Provides an alternative reproducible workflow when statistical computing and graphics are central.", "An R script/RMarkdown or notebook with imported, cleaned, summarised and visualised social data plus limitations.", ["Computational task and basic statistical/data concepts.", "R/RStudio access and data permission."], ["Data Carpentry R social-science lessons", "Data dictionary", "Statistical design and uncertainty."], ["Python, SPSS, Stata or spreadsheet workflow depending on the method and constraints."], ["R can execute an invalid model or misleading chart; it does not choose the research question or prove competence.", "The learning dataset/context is not Nigerian by default."], ["R_PROJECT", "DATACARP_R"], ["DATACARP_R"], ["DATACARP_R"], "A route alternative to Python for computational and quantitative social research.", "No Nigerian requirement for R was established; Nigerian datasets and definitions must be handled separately from the global lesson dataset.", "Area-owned alternative programming/statistical route."),
        item("jupyter-reproducible-environment", "Jupyter for an explained, repeatable workflow", "computational_environment", t, "An interactive environment that keeps code, explanatory text, data and visualisations together in a shareable notebook.", "Makes computational decisions and outputs inspectable when a notebook format suits the project.", "A notebook with narrative, code, inputs/outputs, versions, data dictionary and limitation notes.", ["A reproducible workflow and safe data handling.", "Basic Python/R or another supported kernel as needed."], ["Python/R", "pandas", "Versioned project/data dictionary."], ["Plain scripts plus documentation, RMarkdown or another reproducible reporting environment."], ["A notebook can preserve a flawed method or expose sensitive data; it is not a statistical method or ethics approval.", "Shared notebooks need access/privacy review."], ["JUPYTER", "NDP_ACT"], ["JUPYTER"], ["PYTHON_SOCSCI", "DATACARP_R"], "A supporting environment rather than a standalone skill or method.", "Local privacy and access controls are required before sharing Nigerian or participant data through notebooks.", "Area-owned workflow support."),
        item("pandas-tabular-research-data", "pandas for cleaning and combining tabular research data", "python_library", t, "A Python library for reading/writing, selecting, cleaning, reshaping, grouping and summarising tables such as survey or administrative data.", "Implements the table-preparation part of a Python workflow after the data meaning and cleaning decisions are established.", "A cleaned, documented table plus transformation log and quality checks.", ["Python basics, data dictionary, missingness/variable knowledge and lawful data access."], ["Jupyter", "Python", "statsmodels or visualisation only when the later task requires them."], ["R data frames, SPSS/Stata data management, spreadsheet or OpenRefine."], ["pandas does not choose variables, repair measurement, infer causality or protect data automatically.", "Transformations can silently change results if undocumented."], ["PANDAS", "PYTHON_SOCSCI"], ["PYTHON_SOCSCI"], ["PYTHON_SOCSCI"], "A route-specific library; not a domain foundation and not required outside tabular Python workflows.", "Nigerian data may have local labels, weights, missing codes and access limits that must be preserved in the data dictionary.", "Area-owned Python ecosystem component."),
        item("interpretable-statistical-modeling", "Interpretable statistical modelling when the question and design justify it", "method", t, "A statistical modelling route that uses a stated design, assumptions, uncertainty and interpretation rather than treating software output as an answer.", "Adds modelling after research design, measurement and data preparation, not before them.", "A model report with formula/variables, assumptions, diagnostics, uncertainty, alternatives and substantive interpretation.", ["Quantitative design, measurement, data preparation and basic statistical concepts.", "Enough data and a defined estimand/question."], ["R/Python/statsmodels/SPSS/Stata", "Data-quality checks", "Domain theory and uncertainty communication."], ["Descriptive summary, qualitative analysis or a simpler model when the question/data do not support complex modelling."], ["A fitted model is not causal proof; assumptions and omitted variables matter.", "Technical model accuracy may not equal substantive validity or policy usefulness."], ["STATSMODELS", "CDC_EVAL", "MAGENTA_BOOK"], ["DATACARP_R", "MIT_DATA_SOCSCI"], ["DATACARP_R", "MIT_DATA_SOCSCI"], "Specialist quantitative route inside the computational area; not a required tool for all computational work.", "Nigerian model claims must use appropriate local data definitions, uncertainty and context; global examples are not local evidence.", "Area-owned specialist method/tool route."),
    ]
    digital = [
        item("digital-trace-construct-and-sampling", "Define the construct, platform scope and sampling limits of digital traces", "knowledge", "D078:computational-digital-social-science:digital-trace-content-analysis", "Knowledge of how digital traces are generated, what population/platform they cover, and how collection and sampling decisions affect interpretation.", "Prevents treating platform data as a neutral sample of society.", "A digital-trace scope note with construct, platform/population, time window, access/permission and sampling limitations.", ["A defined social construct and lawful/ethical access.", "Basic sampling and evidence appraisal."], ["Content analysis", "Data provenance", "Human-reviewed validation examples."], ["Interviews, surveys, documents or observation where digital traces are inaccessible or unrepresentative."], ["Platform users may not represent the public; model output does not show prevalence, causation or human meaning automatically.", "Terms-of-service and privacy issues vary."], ["NDP_ACT", "CDC_EVAL"], ["AOIR_GUIDELINES", "DIGITAL_TRACE_ERROR_FRAMEWORK"], ["PYTHON_SOCSCI"], "Digital-trace work is a specialist research route, not a default computational foundation.", "Nigerian language, platform use and data-protection context must be assessed; English-only samples/models cannot be assumed representative.", "Area-owned digital-research knowledge."),
        item("content-analysis-and-text-classification", "Analyse digital text with human validation and error reporting", "method", "D078:computational-digital-social-science:digital-trace-content-analysis", "A method for analysing text or digital content using a documented codebook, dictionary or supervised model, with human-reviewed checks and error/limit reporting.", "Connects computational text work to social meaning, coding validity and sampling limits.", "A provenance-aware text-analysis report with sample scope, coding/model validation, errors and limitations.", ["Construct definition, lawful access and documented sample.", "A human-reviewed reference set if supervised classification is used."], ["Manual/content analysis", "Qualitative reading", "scikit-learn or another tool only when evaluation is appropriate."], ["Manual coding, interviews, surveys or document research."], ["Accuracy does not prove construct validity, representativeness, causality or ethical permission.", "Automated labels may miss context, irony, dialect or local language meaning."], ["SKLEARN", "NDP_ACT", "CDC_EVAL"], ["DIGITAL_TRACE_ERROR_FRAMEWORK", "AOIR_GUIDELINES"], ["SKLEARN"], "A conditional specialist method; model choice is subordinate to the social question and validation plan.", "Nigerian language and cultural context must be tested; English-language validation cannot be silently generalised to Nigerian multilingual data.", "Area-owned specialist method."),
        item("network-analysis-method", "Analyse relationships as networks when ties are the evidence", "method", "D078:computational-digital-social-science:digital-trace-content-analysis", "A method for representing people, organisations or content as nodes and ties, then examining patterns such as connectivity or communities with clear definitions.", "Adds network analysis only when the research question concerns relationships rather than treating every table as a graph.", "A documented network definition, source/provenance, graph construction, analysis, visualisation and interpretation limits.", ["A defensible tie definition and data source.", "Understanding that network boundaries and missing ties affect results."], ["NetworkX", "Gephi", "Qualitative network interpretation and domain theory."], ["Ordinary tabulation or regression when relationships are not the object of study.", "Manual relational coding for small cases."], ["Centrality/community patterns are not automatically causal or representative.", "Missing/constructed ties can change the network result."], ["NETWORKX", "GEPHI", "CDC_EVAL"], ["GEPHI"], ["NETWORKX", "GEPHI"], "A specialist relationship-analysis route; not a required library pair.", "Local community/network data need consent, privacy and culturally appropriate interpretation; one Nigerian case cannot establish universal network structure.", "Area-owned specialist method."),
        item("networkx-or-gephi", "NetworkX or Gephi for relationship data", "tool", "D078:computational-digital-social-science:digital-trace-content-analysis", "NetworkX supports programmable graph analysis; Gephi supports interactive network visualisation and exploration.", "Offers two alternative implementations after the network method and tie definition are established.", "A reproducible graph/analysis or an annotated network visualisation with node/edge definitions and caveats.", ["Network question, lawful data and a defined node/edge model.", "Basic data/graph literacy."], ["Network-analysis method", "Python/Jupyter for NetworkX", "CSV/source-target preparation for Gephi."], ["Spreadsheet or manual relational map for a small case.", "R network packages or another documented graph tool."], ["Neither tool proves that ties are real, complete, causal or socially meaningful.", "Visual layout can create a false impression of importance."], ["NETWORKX", "GEPHI"], ["GEPHI"], ["NETWORKX", "GEPHI"], "Choose one according to task: programmable analysis or interactive visual exploration; do not imply both are required.", "Data permissions, local language/context and missing ties must be documented for Nigerian network claims.", "Area-owned alternative tool group."),
        item("agent-based-social-simulation", "Agent-based modelling for a stated social mechanism", "method", "D078:computational-digital-social-science:reproducible-social-data", "A method for representing agents, states, rules and interactions to explore scenarios and possible emergent patterns under explicit assumptions.", "Adds simulation only when the learner can state the social mechanism and what the simulation can/ cannot answer.", "A documented model with rules, parameters, run logs, sensitivity/scenario analysis and comparison with relevant evidence.", ["A social mechanism that can be stated as rules.", "Basic programming or model configuration and validation/sensitivity concepts."], ["Mesa", "Casevo", "Empirical evidence to inform or assess assumptions."], ["Empirical survey/interview/administrative analysis when observed behaviour is the question.", "Non-simulation analytical model."], ["Simulated outcomes depend on rules and parameters; they do not establish real-world prevalence, causal truth or prediction accuracy.", "A visually impressive simulation is not validation."], ["MESA", "CASEVO"], ["MESA"], ["MESA", "CASEVO"], "A specialist computational social-science method; not part of shared D078 foundation.", "Nigerian scenarios require local theory/data/participant validation; an imported model/example is not Nigeria evidence.", "Area-owned specialist method."),
        item("mesa-or-casevo", "Mesa or Casevo for social simulation", "framework", "D078:computational-digital-social-science:reproducible-social-data", "Mesa is a general Python agent-based-modelling framework; Casevo is a narrower emerging cognitive-agent/social-evolution project.", "Provides alternative implementation choices for a simulation task after the model assumptions are defined.", "An executable, documented model or experiment with assumptions, data collection, scenario comparison and limits.", ["Agent-based model design and Python/project setup.", "A validation and sensitivity plan."], ["Empirical data", "Jupyter/pandas", "NetworkX when graph structure is central."], ["NetLogo or another ABM environment.", "Empirical non-simulation design when it better fits the question."], ["Neither framework proves the model describes real people; Casevo is emerging and narrow.", "Framework completion or generated agent output is not certification."], ["MESA", "CASEVO"], ["MESA"], ["MESA", "CASEVO"], "Mesa is a broader specialist option; Casevo remains emerging/non-default. Do not present either as a universal D078 tool.", "No Nigerian requirement for Mesa or Casevo was found; local scenario validity and data/ethics remain separate questions.", "Area-owned alternative framework group.", status="area_owned_research_candidate_hidden", certification_note="No framework certification is established; software familiarity is not agent-based-modelling competence."),
        item("predictive-text-modeling", "Predictive/text modelling only after social validation safeguards", "python_library", "D078:computational-digital-social-science:digital-trace-content-analysis", "A later computational option for feature extraction, supervised prediction or text classification when the construct, labelled data, evaluation and harm/ethics plan are explicit.", "Keeps machine-learning tooling behind a specialised route rather than treating it as a general social-science requirement.", "A model card/evaluation report with data scope, baseline, validation, errors by subgroup, limitations and appropriate non-use claims.", ["Defined construct, labelled/reference data, evaluation design and lawful access.", "Statistical/model evaluation and bias/ethics knowledge."], ["Human coding", "scikit-learn", "NIST/NDPC risk and privacy review."], ["Manual content analysis or a simpler statistical/qualitative method.", "Do not use prediction when the question requires explanation or lived experience."], ["Accuracy or AUC does not prove construct validity, causation, fairness or generalisation.", "Platform and language bias can be severe; no automatic Nigerian transfer."], ["SKLEARN", "NDP_ACT", "CDC_EVAL"], ["SKLEARN"], ["SKLEARN"], "Deferred specialist candidate; not student-visible in the first D078 computational route until the validation and harm gates pass.", "Nigerian multilingual and privacy context requires separate validation; global model documentation cannot substitute for local evidence.", "Area-owned deferred specialist option."),
    ]
    for i, r in enumerate(reproducible):
        if i == 1:
            r["relationships"].append(relation("requires", "computational-question-formulation", "Provenance/ethics are set against a defined computational question and output.", ["NDP_ACT"]))
        if i == 2:
            r["relationships"].append(relation("builds_on", "data-provenance-and-digital-ethics", "Cleaning decisions must be traceable to the data source and permissions.", ["JUPYTER", "PYTHON_SOCSCI"]))
        if i == 3:
            r["relationships"].append(relation("supports", "reproducible-data-cleaning", "Python implements a repeatable workflow after the task is defined.", ["PYTHON_TUTORIAL", "PYTHON_SOCSCI"]))
        if i == 4:
            r["relationships"].append(relation("alternative_to", "python-social-data-workflow", "R is an alternative computational/statistical route, not an additional universal requirement.", ["R_PROJECT", "DATACARP_R"]))
        if i == 5:
            r["relationships"].append(relation("supports", "python-social-data-workflow", "Jupyter provides a narrative/reproducible environment for Python or R.", ["JUPYTER"]))
        if i == 6:
            r["relationships"].append(relation("supports", "reproducible-data-cleaning", "pandas supplies the tabular preparation operations in a Python route.", ["PANDAS"]))
        if i == 7:
            r["relationships"].append(relation("builds_on", "reproducible-data-cleaning", "Models should follow documented data preparation and design decisions.", ["STATSMODELS", "CDC_EVAL"]))
    for i, r in enumerate(digital):
        if i == 1:
            r["relationships"].append(relation("requires", "digital-trace-construct-and-sampling", "Text analysis needs a defined construct, population and collection scope.", ["SKLEARN", "NDP_ACT"]))
        if i == 2:
            r["relationships"].append(relation("requires", "digital-trace-construct-and-sampling", "Network analysis needs a defensible definition of nodes, ties and boundary.", ["NETWORKX", "GEPHI"]))
        if i == 3:
            r["relationships"].append(relation("alternative_to", "reproducible-data-cleaning", "Simulation is an alternative specialist route, not a replacement for empirical data preparation in every project.", ["MESA", "CASEVO"]))
        if i == 4:
            r["relationships"].append(relation("alternative_to", "mesa-or-casevo", "NetworkX/Gephi implement relationship analysis; they are not simulation frameworks.", ["NETWORKX", "GEPHI"]))
        if i == 5:
            r["relationships"].append(relation("alternative_to", "mesa-or-casevo", "Mesa and Casevo are alternative implementation frameworks with different scopes.", ["MESA", "CASEVO"]))
        if i == 6:
            r["relationships"].append(relation("requires", "digital-trace-construct-and-sampling", "Predictive/text modelling requires the construct, sampling and ethical scope first.", ["SKLEARN", "NDP_ACT"]))
    areas.append(build_area("D078:computational-digital-social-science", "Computational and Digital Social Science", "Uses computational, digital-trace and data-intensive approaches to investigate social processes, digital technology and society while applying social theory, research design and ethical interpretation.", ["generic software training without a social question", "machine-learning claims without construct/validation evidence", "simulation treated as observed human behaviour", "cybersecurity/software-engineering work without a social-research boundary"], [x["id"] for x in SHARED_FOUNDATION], [{"task_id": t, "task_wording": "Build a reproducible workflow for a bounded social-science dataset: preserve provenance, clean and document variables, analyse a stated question, visualise results and report limits.", "evidence": src("UNESCO_ISCED", "JUPYTER", "PYTHON_SOCSCI", "R_PROJECT"), "learning_links": src("PYTHON_SOCSCI", "DATACARP_R", "JUPYTER"), "items": reproducible}, {"task_id": "D078:computational-digital-social-science:digital-trace-content-analysis", "task_wording": "Analyse digital text or trace data only after defining the construct, platform/population scope, collection permissions and sampling limits; validate coding or model results against human-reviewed examples.", "evidence": src("NDP_ACT", "CDC_EVAL", "SKLEARN", "NETWORKX"), "learning_links": src("SKLEARN", "NETWORKX", "GEPHI", "MESA"), "items": digital}], {"certification_boundary": "No universal computational-social-science certification was established. Tool/framework certificates or course badges are not proof of social-research design, interpretation or competence.", "global_context": "This area is an optional computational route within D078: use the smallest evidenced workflow that answers the social question, and preserve non-computational alternatives.", "nigeria_context": "NDPC data-protection resources and NBS datasets provide local governance/data context; no Nigerian rule requires Python, R, Jupyter, GIS, SPSS or a particular framework for all social research.", "search_findings": ["The domain inventory contained Python, R, Jupyter, pandas, NetworkX, Mesa, Casevo and related candidates, but they needed explicit area task ownership and alternatives.", "Python/R are alternative workflow routes; libraries are attached to tasks rather than displayed as a flat software list.", "Network, simulation and predictive/text items are specialist/deferred options with explicit validation and non-substitution limits.", "Nigerian context is added through data/privacy and local-data examples, not by pretending global tools require a Nigerian analogue."], "unresolved_gaps": ["Python-for-social-science materials are marked alpha and require final lesson/access QA.", "Casevo remains emerging and its maintenance/reproducibility must be rechecked before any display.", "Predictive text modelling remains deferred until construct, language, subgroup-error and privacy evidence passes.", "No universal credential was found; role-specific tool requirements remain outside this area lane."]})

    )
    areas = [a for a in areas if a["area_id"] in {
        "D078:human-geography-population",
        "D078:social-research-evaluation",
        "D078:computational-digital-social-science",
    }]
    all_items = [i for a in areas for i in a["area_owned_additions"]]
    item_type_counts = Counter(i["type"] for i in all_items)
    source_ids = sorted({s["source_id"] for a in areas for i in a["area_owned_additions"] for group in ("authoritative_evidence", "explanatory_evidence", "free_task_specific_learning_links") for s in i[group]})
    required_fields = ["id", "label", "type", "task_family_id", "what_it_is", "task_connection", "learner_output", "prerequisites", "complements", "valid_alternatives", "limitations_or_non_substitutions", "authoritative_evidence", "explanatory_evidence", "student_visible", "status"]
    missing = [{"id": i.get("id"), "fields": [f for f in required_fields if f not in i or (f != "student_visible" and i[f] is None)]} for i in all_items if any(f not in i or (f != "student_visible" and i[f] is None) for f in required_fields)]
    unknown_sources = sorted(set(source_ids) - set(SOURCES))
    validation = {
        "areas": len(areas),
        "area_owned_items": len(all_items),
        "item_type_counts": dict(sorted(item_type_counts.items())),
        "task_families": sum(len(a["task_families"]) for a in areas),
        "source_records": len(source_ids),
        "items_with_authoritative_evidence": sum(bool(i["authoritative_evidence"]) for i in all_items),
        "items_with_explanatory_evidence": sum(bool(i["explanatory_evidence"]) for i in all_items),
        "items_with_task_specific_learning_link": sum(bool(i["free_task_specific_learning_links"]) for i in all_items),
        "items_missing_verified_task_specific_learning_link": [i["id"] for i in all_items if not i["free_task_specific_learning_links"]],
        "student_visible_items": sum(i["student_visible"] for i in all_items),
        "canonical_promotions": 0,
        "missing_required_fields": missing,
        "unknown_source_ids": unknown_sources,
        "all_area_items_hidden": all(not i["student_visible"] for i in all_items),
        "all_area_items_have_evidence": all(bool(i["authoritative_evidence"]) and bool(i["explanatory_evidence"]) for i in all_items),
        "all_area_items_have_learning_candidate": all(bool(i["free_task_specific_learning_links"]) for i in all_items),
        "sequence_claim": "Area-owned records are prepared for sequence design; no item is student-visible or canonically promoted until the separate claim, checkpoint, relationship, limitation and learning-link gates pass.",
    }
    payload = {
        "schema_version": "2026-10-10.d078-area-enrichment-lane.v1",
        "created_on": TODAY,
        "domain_id": "D078",
        "domain_name": "Social Sciences & Behavioural Research",
        "allocation": {
            "areas": ["5 Human Geography and Population Studies", "6 Social Research and Evaluation", "7 Computational and Digital Social Science"],
            "area_layer_definition": "subgroup = area of specialization = area of practice",
            "exclusions": ["role-fit adjudication", "canonical taxonomy", "role_library files", "SQL", "UI", "subject matcher"],
        },
        "status": "independently_enriched_research_candidate_hidden",
        "policy": {
            "shared_foundation_vs_area": "Inherited domain items are listed separately; area-owned additions are independently supported by area task/output evidence.",
            "nigeria_context": "A Nigerian source is added where it provides local context, but its absence cannot disqualify globally established practice.",
            "programme_transfer": "An item need not appear verbatim in CCMAS when the D078 programme-to-domain connection is already supported; label it domain/area enrichment rather than curriculum-taught content.",
            "tools": "Tools implement a method/use case; they do not prove competence or replace design, ethics, interpretation or evidence.",
            "alternatives": "Alternatives are separate routes, not cumulative requirements; complements are shown separately.",
        },
        "controlling_documents": [
            "docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_SPEC_2026_10_07.md",
            "docs/PROGRAMME_DOMAIN_SPECIALIZATION_ROLE_GUIDED_EXPERIENCE_IMPLEMENTATION_PLAN_2026_10_08.md",
            "docs/manual-review/D078_AREA_ROLE_TASK_SET_RESEARCH_2026_10_09.md",
            "docs/manual-review/D078_DOMAIN_LEARNING_CONTRACT_2026_10_08.md",
            "docs/manual-review/D078_SKILLS_METHODS_DEEP_SEARCH_CHECKPOINT_2026_10_08.md",
        ],
        "source_registry": {source_id: SOURCES[source_id] for source_id in source_ids},
        "inherited_domain_foundation": SHARED_FOUNDATION,
        "areas": areas,
        "search_scope": {
            "checked": ["disciplinary classification", "official demographic/census standards", "occupational task examples", "evaluation frameworks", "Nigerian official statistics/M&E/privacy context", "official tool/framework documentation", "task-specific free learning resources"],
            "not_used_as_proof": ["labels alone", "role frequency", "ISCO/ESCO subgroup membership", "technical compatibility", "generic learn-the-language links", "one country's source as universal law or requirement"],
            "role_boundary": "Roles are referenced only to explain downstream ownership. This lane does not reopen or decide role-to-domain or role-to-area fit.",
        },
        "validation": validation,
        "canonical_files_modified": [],
        "student_visible_records": [],
    }
    DATA_OUT.mkdir(parents=True, exist_ok=True)
    DOC_OUT.mkdir(parents=True, exist_ok=True)
    json_path = DATA_OUT / "d078_area_enrichment_areas_5_7_2026_10_10.json"
    md_path = DOC_OUT / "D078_AREA_ENRICHMENT_AREAS_5_7_CHECKPOINT_2026_10_10.md"
    json_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    lines = [
        "# D078 areas 5-7 independent enrichment checkpoint",
        "",
        f"**Date:** {TODAY}",
        "**Status:** independent area enrichment; research candidate; student-hidden",
        "**Allocation:** Human Geography and Population Studies; Social Research and Evaluation; Computational and Digital Social Science",
        "",
        "## Scope and decision",
        "",
        "This pass treats subgroup, area of specialization and area of practice as the same intermediate layer. It independently enriches the three allocated areas from their own task families and outputs. The domain foundation is inherited only where it is explicitly listed; it is not copied into the area as if newly required.",
        "",
        "A Nigerian source is included where it adds local context, but a missing Nigerian analogue does not disqualify globally established practice. A candidate is not promoted because of a label, role frequency, ISCO/ESCO membership or technical compatibility. Tools are conditional implementations of evidenced methods; they do not prove competence.",
        "",
        "## Counts",
        "",
        f"- Areas enriched: **{validation['areas']}**",
        f"- Independent area-owned candidate items: **{validation['area_owned_items']}**",
        f"- Task families: **{validation['task_families']}**",
        f"- Source records used by area items: **{validation['source_records']}**",
        f"- Item types: `{json.dumps(validation['item_type_counts'], sort_keys=True)}`",
        "- Student-visible items: **0**",
        "- Canonical promotions: **0**",
        "",
        "## Area decisions",
    ]
    for a in areas:
        lines.extend(["", f"### {a['label']}", "", f"**Boundary:** {a['boundary']}", "", "**Excluded or not assumed:** " + "; ".join(a["exclusions"]), "", "**Inherited foundation:** " + ", ".join(x["label"] for x in a["inherited_domain_foundation"]), "", "**Area-owned items:**"]) 
        for i in a["area_owned_additions"]:
            lines.append(f"- **{i['label']}** (`{i['type']}`) — {i['task_connection']} **[hidden; {i['status']}]**")
        lines.extend(["", "**Certification boundary:** " + a["certification_boundary"], "", "**Global context:** " + a["global_context"], "", "**Nigeria context:** " + a["nigeria_context"], "", "**Search findings:**"])
        lines.extend([f"- {x}" for x in a["search_findings"]])
        lines.extend(["", "**Unresolved gates:**"])
        lines.extend([f"- {x}" for x in a["unresolved_gaps"]])
    lines.extend([
        "",
        "## Evidence and learning-link gate",
        "",
        "Every area-owned item has an authoritative evidence record, an explanatory record and a task-specific learning-link candidate in the JSON. The links still require final resolution, level, scope, licence/access and wording QA. No link is presented as proof of competence. All displayed claims must trace item → source locator → area task/output → relationship → student wording before promotion.",
        "",
        "## What this does not do",
        "",
        "This checkpoint does not adjudicate roles, change canonical taxonomy, write SQL, change UI, or fix the subject matcher. It is the area-owned enrichment input for later reconciliation and dependency-graph sequencing. Role details should be attached only after the separate role task evidence supports that route.",
        "",
        "## Machine-readable artifact",
        "",
        f"[`d078_area_enrichment_areas_5_7_2026_10_10.json`](../../data/career-mapping/_audit/d078_area_enrichment_lanes_2026_10_10/d078_area_enrichment_areas_5_7_2026_10_10.json)",
        "",
        "## Validation",
        "",
        "```json",
        json.dumps(validation, indent=2),
        "```",
    ])
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"json": str(json_path), "markdown": str(md_path), "validation": validation}, indent=2))


if __name__ == "__main__":
    main()
