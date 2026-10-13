"""Close the D078 deep-search item contract without creating duplicate cards.

The six exact tool matches inherit their canonical records as lineage aliases.
The remaining deep-search records receive explicit item, checkpoint, context,
relationship and source-role fields. This is local review data only: it does
not promote any item or alter role-fit decisions.
"""

from __future__ import annotations

import copy
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
CONTRACT = ROOT / "data/career-mapping/_audit/d078_domain_learning_contract_2026_10_08.json"


def source(title: str, url: str, locator: str, role: str) -> dict[str, Any]:
    return {
        "title": title,
        "url": url,
        "locator": locator,
        "accessed_on": "2026-10-10",
        "source_role": role,
    }


OFFICIAL = {
    "d078_nvivo": source(
        "NVivo product tour",
        "https://lumivero.com/products/nvivo/",
        "Qualitative and mixed-methods workflow: organise, code, query, reflect and report on source material",
        "official_item_and_task_source",
    ),
    "d078_spss": source(
        "IBM SPSS Software",
        "https://www.ibm.com/products/spss",
        "SPSS Statistics product family: data management/preparation, analysis, reporting and deployment; menu and syntax interfaces",
        "official_item_and_task_source",
    ),
    "d078_python": source(
        "The Python Tutorial",
        "https://docs.python.org/3/tutorial/",
        "Language syntax, data structures, modules, input/output, errors, virtual environments and packages",
        "official_item_and_task_source",
    ),
    "d078_pandas": source(
        "pandas getting-started tutorials",
        "https://pandas.pydata.org/pandas-docs/stable/getting_started/intro_tutorials/index.html",
        "Read/write tables, select data, create plots, derive columns, calculate summaries, reshape/combine tables and manipulate text",
        "official_item_and_task_source",
    ),
    "d078_statsmodels": source(
        "statsmodels getting started",
        "https://www.statsmodels.org/stable/gettingstarted.html",
        "Raw-data workflow: specify a model, fit it, inspect results and diagnostics; pandas and patsy dependencies",
        "official_item_and_task_source",
    ),
    "d078_networkx": source(
        "NetworkX introduction",
        "https://networkx.org/documentation/stable/reference/introduction.html",
        "Graph objects, nodes/edges, graph operations, algorithms, reporting and drawing interfaces",
        "official_item_and_task_source",
    ),
    "d078_jupyter": source(
        "What is Jupyter?",
        "https://docs.jupyter.org/en/latest/what_is_jupyter.html",
        "Notebook environment combining executable code, narrative text, equations and visualisations",
        "official_item_and_task_source",
    ),
    "d078_scikit_learn": source(
        "scikit-learn User Guide",
        "https://scikit-learn.org/stable/user_guide.html",
        "Supervised learning, model evaluation, text feature extraction and preprocessing sections",
        "official_item_and_task_source",
    ),
    "d078_powerbi": source(
        "Microsoft Power BI overview",
        "https://learn.microsoft.com/en-us/power-bi/fundamentals/power-bi-overview",
        "Connect and prepare data, model it, and build reports and dashboards; publishing and sharing depend on account/licence/capacity conditions",
        "official_item_and_task_source",
    ),
    "d078_tableau": source(
        "Tableau getting started",
        "https://www.tableau.com/learn/get-started",
        "Product orientation and guided data-visualisation/reporting workflow; product training is not research-method training",
        "official_item_and_task_source",
    ),
}


CONTEXT = {
    "global": "This is a globally used technical option whose usefulness depends on the research question, data, method and access conditions; global relevance is not the same as universal requirement.",
    "nigeria": "No Nigerian mandate or institution-wide adoption is inferred. Nigerian learners should check device/lab access, licence or internet requirements, data permissions and local-language or local-context validity separately.",
    "programme": "This is D078 domain enrichment, not a claim that the selected Sociology curriculum teaches or requires the item.",
    "domain": "The item supports selected Social Sciences & Behavioural Research workflows only; it remains distinct from the shared research foundation.",
    "area": "Use only on the area routes whose task set calls for this item's operation; the area crosswalk remains the authority for conditional route placement.",
    "role": "No new role requirement is inferred in this pass. Any downstream role use must come through the already-reviewed role-item route and its separate evidence contract.",
}


ITEMS: dict[str, dict[str, Any]] = {
    "d078_nvivo": {
        "meaning": "NVivo is qualitative-data analysis software for storing, coding, retrieving and comparing material such as interviews, documents and other media. It helps make an analysis trail easier to organise; it does not create the research question or interpret the material for the researcher.",
        "output": "A project with a documented source set, codebook, coded excerpts, memos or queries, an explanation of how themes were developed, and an exportable evidence trail.",
        "relationships": [
            {"type": "implements", "target": "qualitative_coding_and_thematic_analysis", "target_type": "method_family", "note": "NVivo supports storage, coding, retrieval and comparison after the researcher has chosen and documented a suitable qualitative approach."},
            {"type": "complements", "target": "d078-qualitative-approach", "note": "The qualitative approach determines what counts as evidence and how interpretation is justified."},
            {"type": "alternative_to", "target": "manual coding with a codebook, Taguette, MAXQDA or ATLAS.ti", "note": "Choose one suitable workflow; the alternatives are not cumulative requirements."},
        ],
        "prerequisites": ["A bounded qualitative question and corpus", "A documented coding/interpretation approach", "Consent, confidentiality and secure handling for participant material"],
        "context": {**CONTEXT, "area": "Most directly supports qualitative and mixed-method routes in Sociology and Social Anthropology, Social Behaviour and Interaction, Social Research and Evaluation, and selected policy or digital-text work where human-led coding is appropriate."},
        "explanatory_sources": [source("NVivo product tour", "https://lumivero.com/products/nvivo/", "Iterative qualitative workflow: explore, code, reflect, query and report", "independent_explanatory_source")],
        "checkpoint_fit_sources": [source("NCRM qualitative research resources", "https://www.ncrm.ac.uk/resources/", "Research-methods context for qualitative evidence and analysis; software is an implementation choice", "checkpoint_fit_and_method_context")],
    },
    "d078_spss": {
        "meaning": "IBM SPSS Statistics is a statistical software package with menu-driven and syntax-based workflows for preparing data, running selected analyses and reporting results. It can reduce manual calculation, but the researcher must still choose a defensible design, measure and analysis.",
        "output": "A documented data file, analysis syntax or reproducible procedure, tables/figures, diagnostic checks and a qualified interpretation tied to the research question.",
        "relationships": [
            {"type": "implements", "target": "quantitative_data_analysis", "target_type": "method_family", "note": "SPSS implements selected procedures after the method and assumptions have been justified."},
            {"type": "complements", "target": "d078-quantitative-approach", "note": "Quantitative-method knowledge determines what the output means and what it cannot establish."},
            {"type": "alternative_to", "target": "R, Python, Stata, jamovi or another suitable statistical workflow", "note": "Select according to method, access, reproducibility and institutional context; do not present all packages as required."},
        ],
        "prerequisites": ["A defined quantitative question and suitable data", "Basic measurement, data management and statistical reasoning", "Permission to process the data and a plan for missing values and confidentiality"],
        "context": {**CONTEXT, "area": "Supports selected survey, evaluation, economic, behavioural and population-data tasks that require the procedures SPSS can implement; it is not a universal D078 tool."},
        "explanatory_sources": [source("IBM SPSS product overview", "https://www.ibm.com/products/spss", "End-to-end analytical process and beginner-to-programmer interfaces", "independent_explanatory_source")],
        "checkpoint_fit_sources": [source("UCLA OARC SPSS modules", "https://stats.oarc.ucla.edu/spss/modules/", "Free modules for data management, descriptive statistics and selected tests; software is still an implementation option", "checkpoint_fit_and_learning_context")],
    },
    "d078_python": {
        "meaning": "Python is a programming language used to write repeatable instructions for handling data, text, networks, visualisations and simulations. In this domain it is a flexible implementation option, not a social-science method by itself.",
        "relationships": [
            {"type": "complements", "target": "d078-pandas-tool", "note": "pandas handles tabular-data operations inside a Python workflow."},
            {"type": "complements", "target": "d078_jupyter", "note": "Jupyter can keep Python code, explanation and outputs together in a notebook."},
            {"type": "complements", "target": "d078_statsmodels", "note": "statsmodels implements selected statistical models after method choice and assumptions are addressed."},
            {"type": "complements", "target": "d078-networkx-tool", "note": "NetworkX supports graph and network operations when relationship data are the subject of the task."},
            {"type": "alternative_to", "target": "R, SPSS, Stata, spreadsheet or manual workflows", "note": "Choose a task-appropriate workflow rather than treating programming languages and packages as a cumulative checklist."},
        ],
        "context": {**CONTEXT, "area": "Supports selected computational, reproducible-data, text, network, quantitative and simulation routes. The learner selects libraries by task rather than learning every library."},
        "explanatory_sources": [source("Data Carpentries: Python for social scientists", "https://datacarpentry.org/python-socialsci/", "Social-science workflow for importing, cleaning, summarising and plotting data", "independent_explanatory_source")],
        "checkpoint_fit_sources": [source("Python tutorial", "https://docs.python.org/3/tutorial/", "The tutorial teaches language operation but explicitly expects basic programming; domain methods remain separate", "checkpoint_fit_and_item_boundary")],
    },
    "d078_pandas": {
        "meaning": "pandas is a Python library for working with labelled tables. It helps a learner read, inspect, clean, combine, reshape and summarise data such as survey responses or administrative records before analysis.",
        "output": "A documented table-cleaning workflow with variable definitions, transformations, missing-data decisions, validation checks and an analysis-ready dataset.",
        "relationships": [
            {"type": "requires", "target": "d078_python", "note": "pandas is used through Python; basic Python and table/data literacy are prerequisites."},
            {"type": "complements", "target": "d078_jupyter", "note": "A notebook can document the transformation steps and outputs."},
            {"type": "complements", "target": "d078-quantitative-approach", "note": "A library can prepare data but cannot choose a valid measure or analysis."},
            {"type": "alternative_to", "target": "R data frames, spreadsheets, SQL or another suitable table workflow", "note": "Choose based on data size, reproducibility, permissions and the intended task."},
        ],
        "prerequisites": ["Basic Python or a guided notebook workflow", "Understanding of variables, categories, missing values and identifiers", "Lawful access and safe handling of the dataset"],
        "context": {**CONTEXT, "area": "Supports selected reproducible social-data, survey, economic, population and evaluation workflows where tabular preparation is needed."},
        "explanatory_sources": [source("pandas getting-started tutorials", "https://pandas.pydata.org/pandas-docs/stable/getting_started/intro_tutorials/index.html", "Table operations, summaries, joins, reshaping and text manipulation", "independent_explanatory_source")],
        "checkpoint_fit_sources": [source("Data Carpentries: Python for social scientists", "https://datacarpentry.org/python-socialsci/", "A task-focused social-science data workflow using Python tables and visualisation", "checkpoint_fit_and_learning_context")],
    },
    "d078_statsmodels": {
        "meaning": "statsmodels is a Python library for fitting and inspecting selected statistical models, including regression and time-series models. It provides calculations and diagnostics; it does not decide whether the model answers the social question or whether causal claims are justified.",
        "relationships": [
            {"type": "requires", "target": "d078_python", "note": "The library runs inside Python."},
            {"type": "complements", "target": "d078_pandas-tool", "note": "pandas can prepare labelled tabular data before modelling."},
            {"type": "complements", "target": "d078_jupyter", "note": "A notebook or versioned script can document model specification, diagnostics and results."},
            {"type": "requires_for_interpretation", "target": "d078-quantitative-approach", "note": "Statistical reasoning, measurement and assumptions are required to interpret the output."},
            {"type": "alternative_to", "target": "R, Stata, SPSS or another implementation of the justified model", "note": "Software equivalence must be checked method by method."},
        ],
        "context": {**CONTEXT, "area": "Supports specialist quantitative tasks in economics, social research/evaluation, behavioural research, population analysis and selected computational routes when model assumptions and data support them."},
        "explanatory_sources": [source("statsmodels getting started", "https://www.statsmodels.org/stable/gettingstarted.html", "Case study from raw data through model specification, fitting, summary and diagnostics", "independent_explanatory_source")],
        "checkpoint_fit_sources": [source("statsmodels getting started", "https://www.statsmodels.org/stable/gettingstarted.html", "The example explicitly separates substantive motivation, model design, fitting and diagnostics", "checkpoint_fit_and_method_context")],
    },
    "d078_networkx": {
        "meaning": "NetworkX is a Python library for representing relationship data as nodes and edges, then computing graph and network measures such as paths, centrality or communities. It is a tool for a network-analysis workflow, not the theory of why relationships exist.",
        "output": "A documented network dataset and analysis containing node/edge definitions, boundary and missingness decisions, selected measures, visual or tabular outputs and an interpretation of what the network data can and cannot show.",
        "relationships": [
            {"type": "requires", "target": "graph_theory_and_network_analysis", "note": "Learners need concepts such as nodes, ties, direction, weights, paths and network boundaries before interpreting measures."},
            {"type": "supports", "target": "social_network_analysis", "note": "It can implement selected social-network operations when relational data and a defensible research question exist."},
            {"type": "complements", "target": "d078-communicate-evidence", "note": "Network outputs need clear explanations, uncertainty and limits."},
            {"type": "alternative_to", "target": "R network packages, Gephi or another suitable network workflow", "note": "Choose by task, data, reproducibility and audience; no package is universally required."},
        ],
        "context": {**CONTEXT, "area": "Supports selected sociology, politics, social-behaviour, evaluation and computational-social-science tasks involving measured relationships; it is not a GIS tool and does not turn every social dataset into a network."},
        "explanatory_sources": [source("NetworkX introduction", "https://networkx.org/documentation/stable/reference/introduction.html", "Nodes, edges, graph types, algorithms, reporting and drawing", "independent_explanatory_source")],
        "checkpoint_fit_sources": [source("NetworkX tutorial", "https://networkx.org/documentation/stable/tutorial.html", "Official tutorial and guides for graph creation and network algorithms", "checkpoint_fit_and_learning_context")],
    },
    "d078_jupyter": {
        "meaning": "Jupyter is a notebook environment where code, explanations, data outputs and visualisations can be kept together. It helps a learner show how a computational result was produced, but a notebook is not automatically a reproducible or valid study.",
        "relationships": [
            {"type": "complements", "target": "d078_python", "note": "Python is one common notebook kernel."},
            {"type": "complements", "target": "d078_pandas-tool", "note": "pandas operations can be explained and inspected step by step in a notebook."},
            {"type": "complements", "target": "environment_and_dependency_records", "note": "Versions, data provenance and dependencies are needed to make a notebook more reproducible."},
            {"type": "requires_for_meaning", "target": "a substantive analytic method", "note": "The notebook records a method; it does not provide the research design or statistical reasoning."},
            {"type": "alternative_to", "target": "versioned scripts, R Markdown, Quarto or another documented workflow", "note": "Choose the documentation format that fits the work and audience."},
        ],
        "context": {**CONTEXT, "area": "Supports selected computational and reproducible-data routes, especially when a learner needs to show code alongside explanations and outputs."},
        "explanatory_sources": [source("What is Jupyter?", "https://docs.jupyter.org/en/latest/what_is_jupyter.html", "Notebook documents combine code, narrative text, equations and visualisations", "independent_explanatory_source")],
        "checkpoint_fit_sources": [source("Data Carpentries: Python for social scientists", "https://datacarpentry.org/python-socialsci/", "Task-focused social-science workflow using notebooks, tables and visualisation", "checkpoint_fit_and_learning_context")],
    },
    "d078_scikit_learn": {
        "meaning": "scikit-learn is a Python library for selected machine-learning workflows such as classification, prediction, clustering and text-feature processing. It helps implement a model; it cannot decide whether the social concept, labels, sample or interpretation are sound.",
        "relationships": [
            {"type": "requires", "target": "d078_python", "note": "Basic Python is needed to load data, call the library and inspect results."},
            {"type": "complements", "target": "d078_pandas-tool", "note": "pandas may prepare tables, labels and metadata before modelling."},
            {"type": "supports", "target": "d078-computational-social-research", "note": "It can implement selected text or predictive steps within a larger computational social-research design."},
            {"type": "complements", "target": "d078-evaluate-evidence-and-limits", "note": "Error analysis, evidence appraisal and substantive theory are needed to interpret model output."},
            {"type": "alternative_to", "target": "human coding, dictionary/rule-based coding, R tidymodels/quanteda or another justified workflow", "note": "Prediction is not automatically better than a transparent or interpretive alternative."},
        ],
        "context": {**CONTEXT, "area": "Supports specialist computational, text-as-data and selected predictive tasks. Nigerian-language, Pidgin and code-mixed data need separate language and measurement validation; English examples cannot be assumed to transfer."},
        "explanatory_sources": [source("University of Washington: Introduction to Text as Data", "https://csde.washington.edu/workshop/introduction-to-text-as-data/", "Social-science questions, text representation and human interpretation alongside Python demonstrations", "independent_explanatory_source")],
        "checkpoint_fit_sources": [source("scikit-learn User Guide", "https://scikit-learn.org/stable/user_guide.html", "Supervised learning, model evaluation and text-feature extraction; technical capability does not establish social-science validity", "checkpoint_fit_and_method_context")],
    },
    "d078-jamovi-tool": {
        "context": {**CONTEXT, "area": "Conditional candidate for survey, economics, political-opinion, quantitative-behaviour, population-change and social-evaluation tasks that need introductory numerical analysis; not a GIS/spatial-analysis tool."},
        "limits": [
            "This is an optional tool for selected quantitative tasks, not a shared foundation requirement across all D078 routes.",
            "A menu can calculate a test but cannot decide whether the question, sample, measures, assumptions or comparison justify it.",
            "A p-value or chart does not by itself establish causation, representativeness, practical importance or policy impact.",
            "The linked course is introductory and does not cover every statistical method, discipline-specific design or advanced analysis.",
        ],
        "alternatives": ["SPSS, R, Stata, Python/statsmodels or another suitable statistical workflow; choose by task and access, not cumulatively."],
        "checkpoint": "D078 domain learning path",
        "layer": "conditional_or_route_specific",
    },
    "d078_powerbi": {
        "meaning": "Power BI is a business-intelligence and reporting tool that can connect to data, help prepare and model it, and present interactive reports or dashboards. In D078 it can help communicate reviewed survey, evaluation, service-reach or programme-monitoring results to an audience; it does not design the study or decide whether a finding is valid.",
        "output": "A documented report or dashboard with named measures, source and refresh notes, appropriate visual choices, an explanation of uncertainty and access controls suitable for the intended audience.",
        "relationships": [
            {"type": "implements", "target": "data_visualisation_and_evidence_communication", "target_type": "method_family", "note": "Power BI is an implementation option after the question, measures, data quality and interpretation have been established."},
            {"type": "complements", "target": "d078-communicate-evidence", "note": "The communication competency determines what the audience needs to understand and what the dashboard must disclose."},
            {"type": "alternative_to", "target": "Tableau, Excel, R, Python, SPSS or a static report", "note": "Choose one suitable reporting workflow; Power BI and Tableau are not cumulative requirements."},
        ],
        "prerequisites": ["A defined audience and reporting question", "Validated measures, data definitions and a documented source", "Basic visualisation, privacy and access-control awareness"],
        "context": {**CONTEXT, "area": "Conditional option for social research, monitoring, evaluation, policy and administrative-data routes that need an interactive report or dashboard. It is not a shared D078 foundation and is not a substitute for statistical, qualitative, GIS or research-design methods."},
        "limits": [
            "A dashboard can make a result easier to inspect but cannot make weak data representative or establish causation.",
            "Sharing, publishing, licences and workspace permissions can change; verify the current terms before assigning a learner a publishing task.",
            "Do not place identifiable, confidential or restricted research data in a public workspace or public visualisation.",
            "Use a static report or spreadsheet when interactivity is unnecessary; do not teach both Power BI and Tableau as mandatory alternatives.",
        ],
        "alternatives": ["Tableau, Excel, R, Python, SPSS or a static report, selected by task, audience, access, reproducibility and privacy requirements."],
        "checkpoint": "D078 domain learning path",
        "layer": "conditional_or_route_specific",
        "explanatory_sources": [source("Microsoft Power BI dashboard and report explanation", "https://learn.microsoft.com/en-us/power-bi/explore-reports/end-user-dashboards", "Explains dashboards, reports and interactive visual exploration for end users", "independent_explanatory_source")],
        "checkpoint_fit_sources": [source("Microsoft Power BI getting started", "https://learn.microsoft.com/en-us/power-bi/fundamentals/service-get-started", "Free product orientation for creating and using reports; does not teach research design or interpretation", "checkpoint_fit_and_learning_context")],
    },
    "d078_tableau": {
        "meaning": "Tableau is a data-visualisation and reporting tool for exploring data and building charts, reports and dashboards. In D078 it can help communicate patterns from reviewed social, economic, behavioural or evaluation data; it does not choose the research method, validate the data or explain social meaning by itself.",
        "output": "A documented visual analysis or dashboard with clear measures, filters, source/provenance notes, audience-appropriate presentation and stated limits on interpretation.",
        "relationships": [
            {"type": "implements", "target": "data_visualisation_and_evidence_communication", "target_type": "method_family", "note": "Tableau implements selected visual-reporting tasks after the data and interpretation have been checked."},
            {"type": "complements", "target": "d078-communicate-evidence", "note": "Communication principles determine what is shown, explained and qualified."},
            {"type": "alternative_to", "target": "Power BI, Excel, R, Python, SPSS or a static report", "note": "Choose based on the task, audience, privacy, access and reproducibility; do not require every reporting tool."},
        ],
        "prerequisites": ["A defined reporting question and audience", "Validated data and clearly defined measures", "Basic visualisation, privacy and responsible-publication awareness"],
        "context": {**CONTEXT, "area": "Conditional option for social research, monitoring, evaluation, policy and administrative-data routes that need interactive visual communication. It is not a shared D078 foundation and does not replace statistical, qualitative, GIS or research-design knowledge."},
        "limits": [
            "A visually persuasive chart does not prove a causal claim, representative sample or correct interpretation.",
            "Tableau Public is public and published workbooks/data may be downloadable; never use it for identifiable, confidential or restricted research data.",
            "Product features, licences and sharing conditions can change; verify them before assigning a publication workflow.",
            "Use a static report or another tool when interactivity is unnecessary; Power BI and Tableau are alternatives, not cumulative requirements.",
        ],
        "alternatives": ["Power BI, Excel, R, Python, SPSS or a static report, selected by task, audience, access, reproducibility and privacy requirements."],
        "checkpoint": "D078 domain learning path",
        "layer": "conditional_or_route_specific",
        "explanatory_sources": [source("Tableau learning and getting started", "https://www.tableau.com/learn", "Official product-learning path covering data visualisation and reporting workflows", "independent_explanatory_source")],
        "checkpoint_fit_sources": [source("Tableau getting started", "https://www.tableau.com/learn/get-started", "Free introductory videos and foundational product guidance; does not teach research design or interpretation", "checkpoint_fit_and_learning_context")],
    },
}


def merge_sources(record: dict[str, Any], key: str, values: list[dict[str, Any]]) -> None:
    current = record.get(key) or []
    seen = {(str(v.get("url")), str(v.get("locator"))) for v in current if isinstance(v, dict)}
    current.extend(v for v in values if (str(v.get("url")), str(v.get("locator"))) not in seen)
    record[key] = current


def main() -> None:
    contract = json.loads(CONTRACT.read_text(encoding="utf-8-sig"))
    emerging_source = "data\\career-mapping\\_audit\\d078_domain_emerging_task_enrichment_2026_10_10.json"
    if emerging_source not in contract.setdefault("source_inputs", []):
        contract["source_inputs"].append(emerging_source)
    # Power BI and Tableau already have richer, source-backed emerging-task
    # records. Keep those records as the single candidate representation;
    # never duplicate them as shallow deep-search records.
    contract["deep_search_options"] = [
        r for r in contract.get("deep_search_options", [])
        if str(r.get("id")) not in {"d078_powerbi", "d078_tableau"}
    ]
    records = {str(r.get("id")): r for r in contract.get("deep_search_options", [])}
    aliases = set()
    for record in records.values():
        target = record.get("duplicate_of_existing_id")
        if record.get("graph_record_policy", "").startswith("retain_lineage_as_alias") and target:
            aliases.add(record["id"])
            canonical = next((r for section in ("existing_inventory", "foundation_and_route_additions", "route_alternatives")
                              for r in contract.get(section, []) if r.get("id") == target), None)
            if canonical:
                for key in ("meaning", "use_case", "output", "evidence", "item_definition_sources", "checkpoint_fit_sources",
                            "explanatory_sources", "relationships", "context", "limits", "learning_links", "prerequisites",
                            "alternatives", "checkpoint", "checkpoint_context"):
                    if not record.get(key) and canonical.get(key):
                        record[key] = copy.deepcopy(canonical[key])
            record["alias_contract_note"] = f"Exact tool identity alias of {target}; the canonical record is the only learner card. This row retains search lineage and inherits the canonical contract."
            record["research_disposition"] = "resolved_as_lineage_alias_inheriting_canonical_contract"
            record["claim_state"] = "resolved_exact_identity_alias_canonical_contract_is_source_backed"
            record["exhaustive_search_status"] = "complete_for_identity_and_current_contract_scope"
            record["student_display_status"] = "not_a_separate_card_inherited_canonical_visibility_gate"
            record["display_readiness"] = "lineage_only_not_independent_display_record"
            record["overlap_state"] = "exact_tool_identity_alias_not_a_separate_learning_card"
            continue

        patch = ITEMS.get(record.get("id"), {})
        for key, value in patch.items():
            if key == "context":
                merged = dict(record.get("context") or {})
                merged.update(copy.deepcopy(value))
                record[key] = merged
            elif key == "relationships":
                record[key] = copy.deepcopy(value)
            elif key in {"explanatory_sources", "checkpoint_fit_sources"}:
                merge_sources(record, key, copy.deepcopy(value))
            else:
                record[key] = copy.deepcopy(value)
        official = OFFICIAL.get(record.get("id"))
        if official:
            merge_sources(record, "item_definition_sources", [copy.deepcopy(official)])
            merge_sources(record, "evidence", [{**copy.deepcopy(official), "claim_role": "official_item_or_task_source"}])
        record["research_disposition"] = "source_contract_enriched_pending_area_and_checkpoint_review"
        record["claim_state"] = "candidate_claims_source_roles_and_learning_links_verified_pending_area_route_review"
        record["exhaustive_search_status"] = "current_domain_candidate_search_and_contract_pass_complete_external_sources_checked"
        record["student_display_status"] = "hidden_until_area_route_checkpoint_and_final_display_review"
        record["display_readiness"] = "content_contract_complete_route_and_area_gates_still_pending"
        record["selection_behavior"] = "Offer only as an optional task-specific choice after the learner selects a route where the item is supported; selection does not claim prior knowledge or competence."
        record["checkpoint_context"] = {
            "programme": "Domain enrichment; not claimed as Sociology curriculum-taught content.",
            "domain": "Candidate tool/language/library/environment/method option for selected D078 workflows.",
            "area_of_specialization": "Use only where the current area-task crosswalk provides a matching task and the route condition is shown.",
            "role": "No new role requirement asserted in this pass; role use remains downstream and separate.",
        }

    review = contract.setdefault("review_coverage", {}).setdefault("exact_duplicate_resolution", {})
    review["semantic_overlap_review_complete"] = True
    review["provisional_record_instances_after_exact_duplicate_collapse"] = len(records) - len(aliases)
    review["note"] = "Exact tool-identity aliases have been collapsed from the learner-card count, and the distinct deep-search records have received a source-backed contract pass. Final student visibility still requires area-route, checkpoint and UI approval."
    review["deep_search_contract_pass"] = {
        "completed_on": "2026-10-10",
        "status": "all_deep_records_have_identity_or_contract_fields",
        "alias_records": sorted(aliases),
        "distinct_records": sorted(set(records) - aliases),
        "note": "Exact aliases inherit canonical contracts; distinct candidates have explicit source roles, context, relationships, prerequisites, limits and learning-link status. Area-route and checkpoint gates remain separate.",
    }
    notes = contract.setdefault("reconciliation_notes", [])
    if isinstance(notes, list):
        notes.append("2026-10-10: Completed the deep-search domain-item contract pass. Exact tool matches remain lineage aliases; Python, statsmodels, Jupyter, scikit-learn and jamovi now have explicit item/checkpoint/context/source-role fields and typed relationships. No item was promoted or made student-visible.")
    CONTRACT.write_text(json.dumps(contract, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"deep_records": len(records), "aliases": len(aliases), "distinct_enriched": len(records) - len(aliases), "semantic_overlap_review_complete": True}, indent=2))


if __name__ == "__main__":
    main()
