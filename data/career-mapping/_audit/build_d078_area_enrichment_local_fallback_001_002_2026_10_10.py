"""Local fallback enrichment for D078 areas 1-2 after agent capacity failure.

This creates a hidden, source-backed candidate checkpoint. It does not edit
canonical taxonomy, role-fit records, SQL, UI, or the domain contract.
"""

from __future__ import annotations

import copy
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AREA_TASKS = ROOT / "data/career-mapping/_audit/d078_area_role_task_sets_2026_10_09.json"
OUT_JSON = ROOT / "data/career-mapping/_audit/d078_area_enrichment_lanes_2026_10_10/local_fallback_areas_001_002.json"
OUT_MD = ROOT / "docs/manual-review/d078_area_enrichment_lanes_2026_10_10/local_fallback_areas_001_002.md"


def as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


SOURCE_IDS = {
    "Sociology and Social Anthropology": [
        "UNESCO_ISCED", "ONET_SOCIOL", "OL_INTRO_SOC", "OPENSTAX_SOC_METHODS",
        "NISER_METHODS", "NISER_R_TRAINING", "NIGERIA_CCMAS",
        "UNN_ANTHRO_PROGRAMME", "NOUN_ETHNOGRAPHY_NIGERIA",
    ],
    "Economics and Applied Economic Analysis": [
        "UNESCO_ISCED", "ONET_ECON", "BLS_ECON", "OL_ECON",
        "NISER_2026_BUDGET_ANALYSIS", "NBS_QGDP_2026", "UNN_ECON_MATH_STAT",
        "NOUN_ECON_MATH_STAT", "WORLDBANK_LOCAL_ECON_ASSESSMENT",
    ],
}

EXTERNAL_SOURCE_ADDITIONS = {
    "Sociology and Social Anthropology": [
        {
            "source_id": "OPENSTAX_SOC_METHODS_2_2",
            "title": "Introduction to Sociology 3e: Research Methods",
            "url": "https://openstax.org/books/introduction-sociology-3e/pages/2-2-research-methods",
            "locator": "Learning objectives and sections on surveys, field research, experiments and secondary-data analysis; method strengths and limitations.",
            "purpose": "Free task-specific learning for choosing and carrying out sociological inquiry methods.",
            "jurisdiction": "Global learning resource; examples require local contextualisation.",
            "limits": "Does not establish Nigerian occupational requirements or replace ethics, sampling or research supervision.",
        },
        {
            "source_id": "OPENSTAX_SOC_METHODS_SUMMARY",
            "title": "Introduction to Sociology 3e: Research Methods section summary",
            "url": "https://openstax.org/books/introduction-sociology-3e/pages/2-section-summary",
            "locator": "Six research phases, method choice, reliability/validity and ethical responsibility.",
            "purpose": "Accessible explanation of how the methods fit together in a research workflow.",
            "jurisdiction": "Global learning resource.",
            "limits": "Introductory source, not a professional certification or a complete area standard.",
        },
    ],
    "Economics and Applied Economic Analysis": [
        {
            "source_id": "CORE_DOING_ECONOMICS",
            "title": "CORE Econ: Doing Economics",
            "url": "https://www.core-econ.org/project/doing-economics/",
            "locator": "Free projects using real data with Excel, Google Sheets, R and Python; projects cover inequality, policy and other economic questions.",
            "purpose": "Free task-specific practice connecting economic questions to data handling, statistical work and reports.",
            "jurisdiction": "Global open learning resource.",
            "limits": "The projects do not prove competence, replace economic theory or establish Nigerian policy/legal requirements.",
        },
        {
            "source_id": "CORE_DOING_ECONOMICS_R",
            "title": "CORE Econ: Collecting and analysing data from experiments in R",
            "url": "https://books.core-econ.org/doing-economics/book/text/02-03.html",
            "locator": "Learning objectives for collecting experiment data, summary measures and charts; R workflow and packages are named in the lesson.",
            "purpose": "Context-specific R practice for economic data and experimental analysis.",
            "jurisdiction": "Global open learning resource.",
            "limits": "One workflow and dataset; not a universal requirement or substitute for econometric design and interpretation.",
        },
        {
            "source_id": "BLS_ECONOMISTS_EXPLAINER",
            "title": "U.S. Bureau of Labor Statistics: Economists",
            "url": "https://www.bls.gov/ooh/life-physical-and-social-science/economists.htm",
            "locator": "What Economists Do and Duties: research economic issues, collect/analyse data, use mathematical/statistical tools, forecast and present findings.",
            "purpose": "Plain-language occupational task explanation.",
            "jurisdiction": "United States occupational context.",
            "limits": "Does not establish Nigerian job demand, licensing or a universal economics route.",
        },
    ],
}

AREA_ROUTE_LINKS = {
    "Sociology and Social Anthropology": [
        {"domain_item_id": "d078-qualitative-approach", "route_role": "area_method_choice", "use": "Use qualitative evidence when the question requires people's accounts, meanings, observations or social context.", "limits": "Does not replace sampling, reflexivity, evidence appraisal or quantitative analysis when numerical comparison is needed."},
        {"domain_item_id": "d078-quantitative-approach", "route_role": "area_method_choice", "use": "Use quantitative evidence when the question concerns measurable patterns, distributions or associations.", "limits": "Numbers do not by themselves explain meaning, causality or representativeness."},
        {"domain_item_id": "d078-interviews", "route_role": "area_method", "use": "Collect people's accounts through a planned interview and interpret them with a documented design.", "limits": "An interview is not automatically representative and cannot establish a population-wide result alone."},
        {"domain_item_id": "d078-document-analysis", "route_role": "area_method", "use": "Examine existing documents systematically to understand institutions, narratives or social change.", "limits": "Documents may be incomplete, selective or shaped by their producer."},
        {"domain_item_id": "d078-nvivo-tool", "route_role": "conditional_tool", "use": "Organise and code substantial qualitative material when the project needs a traceable coding workflow.", "limits": "NVivo does not decide what a theme means or prove that an interpretation is valid."},
        {"domain_item_id": "d078-survey-data-collection-tool", "route_role": "conditional_tool", "use": "Collect structured responses electronically when the research design calls for a survey instrument.", "limits": "A form tool does not create a valid questionnaire, sample or inference."},
    ],
    "Economics and Applied Economic Analysis": [
        {"domain_item_id": "d078-quantitative-approach", "route_role": "area_method_choice", "use": "Analyse economic measurements and relationships when the question is appropriately expressed with data and models.", "limits": "A statistical result does not establish a causal policy effect without suitable design and assumptions."},
        {"domain_item_id": "experiments_quasi_experiments_and_causal_inference", "route_role": "specialist_method_choice", "use": "Use experimental or quasi-experimental reasoning only when the economic question and design support causal comparison.", "limits": "It is not required for every economic analysis and cannot remove confounding by software alone."},
        {"domain_item_id": "longitudinal_panel_and_multilevel_data", "route_role": "specialist_method_choice", "use": "Use panel, longitudinal or multilevel methods when the data structure and economic question require them.", "limits": "The method does not guarantee representative data or correct specification."},
        {"domain_item_id": "r_statistical_computing", "route_role": "conditional_tool", "use": "Use R for reproducible economic data preparation, statistical analysis and visualisation when that workflow is selected.", "limits": "R is an alternative tool, not a substitute for economic reasoning or econometric assumptions."},
        {"domain_item_id": "stata_quantitative_social_science_workflow", "route_role": "conditional_tool", "use": "Use Stata when the selected economic workflow, dataset or institution uses it for quantitative social-science analysis.", "limits": "Software choice does not prove competence or make a model appropriate."},
    ],
}


def main() -> None:
    package = json.loads(AREA_TASKS.read_text(encoding="utf-8-sig"))
    selected = {
        area["label"]: area
        for area in package.get("area_task_sets", [])
        if area.get("label") in SOURCE_IDS
    }
    registry = package.get("source_registry", {})
    areas = []
    for label, source_ids in SOURCE_IDS.items():
        area = selected[label]
        tasks = [*as_list(area.get("task_families")), *as_list(area.get("additional_task_families"))]
        candidate_items = [
            copy.deepcopy(item)
            for task in tasks
            for item in as_list(task.get("learning_items"))
        ]
        areas.append({
            "area_id": area.get("area_id"),
            "label": label,
            "boundary": area.get("current_boundary_verbatim"),
            "task_set_status": area.get("task_set_status"),
            "task_families": [
                {
                    "task_id": task.get("task_id"),
                    "task_wording": task.get("task_wording"),
                    "why_task_scope_belongs": task.get("why_task_scope_belongs"),
                    "learner_output": task.get("learner_output", []),
                    "prerequisites": task.get("prerequisites", []),
                    "complements": task.get("complements", []),
                    "alternatives": task.get("alternatives", []),
                    "limits": task.get("limits_or_non_substitutions", []),
                    "candidate_items": candidate_items,
                }
                for task in tasks
            ],
            "source_records": [
                {"source_id": source_id, **copy.deepcopy(registry[source_id])}
                for source_id in source_ids
                if source_id in registry
            ],
            "additional_external_sources": EXTERNAL_SOURCE_ADDITIONS[label],
            "domain_item_route_links": AREA_ROUTE_LINKS[label],
            "inheritance_rule": "Only inherit a domain item when the area task/output needs the same capability; otherwise keep it area-owned or conditional.",
            "tool_policy": "Tools are conditional route choices. They support an evidenced method/task and do not prove competence, valid design, causality, representativeness or professional authorisation.",
            "nigerian_context_policy": "Nigerian sources illustrate local curriculum, research or data context; they do not automatically establish national job demand or licensing.",
            "student_visible": False,
            "disposition": "local_fallback_candidate_pending_full_area_lane_reconciliation_and_item_evidence_gates",
        })

    output = {
        "schema_version": "2026-10-10.d078.local-area-enrichment-fallback.v1",
        "status": "candidate_checkpoint_not_student_approved",
        "allocation": ["Sociology and Social Anthropology", "Economics and Applied Economic Analysis"],
        "reason": "Fallback local lane after repeated agent model-capacity failure.",
        "role_fit_audit_reopened": False,
        "canonical_files_modified": False,
        "subject_matcher_modified": False,
        "areas": areas,
        "student_visible_records": 0,
    }
    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    lines = [
        "# D078 local fallback area enrichment: Areas 1-2",
        "",
        "This is a hidden candidate checkpoint created locally after repeated agent-capacity failures. It does not alter canonical taxonomy, role fit, SQL, UI or the subject matcher.",
        "",
        "## Allocation",
        "",
        "- Sociology and Social Anthropology",
        "- Economics and Applied Economic Analysis",
        "",
        "Each area retains its own task family, candidate knowledge/skills/methods/competencies, inherited-versus-area route links, limits, global sources, Nigerian context sources and task-specific learning resources. Tools remain conditional choices and are not treated as proof of competence.",
        "",
    ]
    for area in areas:
        count = sum(len(task["candidate_items"]) for task in area["task_families"])
        lines.extend([
            f"### {area['label']}",
            "",
            f"- Candidate area items: **{count}**",
            f"- Candidate route links to typed domain items: **{len(area['domain_item_route_links'])}**",
            f"- Evidence sources: **{len(area['source_records']) + len(area['additional_external_sources'])}**",
            "- Student-visible: **false**",
            "",
        ])
    lines.extend([
        "The remaining gate is reconciliation with the other area lanes, duplicate/inheritance review, exact source locators and resource verification. No candidate is promoted merely because this fallback artifact exists.",
        "",
        f"Machine-readable artifact: `{OUT_JSON.relative_to(ROOT).as_posix()}`",
    ])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"areas": len(areas), "candidate_items": sum(sum(len(task["candidate_items"]) for task in area["task_families"]) for area in areas), "student_visible": 0}))


if __name__ == "__main__":
    main()
