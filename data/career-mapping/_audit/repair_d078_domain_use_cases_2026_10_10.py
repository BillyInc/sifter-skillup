"""Add task-scoped use-case explanations to D078 domain learning candidates."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
CONTRACT = ROOT / "data/career-mapping/_audit/d078_domain_learning_contract_2026_10_08.json"

USE_CASES = {
    "d078-research-question-design": "Use this when turning a social issue into a question that can be investigated, then deciding what information and method could answer it.",
    "d078-evaluate-evidence-and-limits": "Use this when reading a source, dataset or finding and deciding what conclusion it supports—and what it cannot support.",
    "d078-responsible-research": "Use this before research involving people or identifiable/sensitive information to identify consent, privacy, possible harm and the permissions or review that apply.",
    "d078-communicate-evidence": "Use this when sharing findings with an academic, community, public or decision-making audience; explain the evidence and uncertainty in a suitable format.",
    "d078-care-for-research-data": "Use this when a project creates, receives, stores or shares research information and needs to document what it contains, protect it and control access.",
    "d078-quantitative-approach": "Choose this approach when a question needs numerical measurement, counting, comparison or a statistical summary; it is an option, not a requirement for every route.",
    "d078-qualitative-approach": "Choose this approach when a question asks about meaning, experience, interaction, language or context using sources such as words, observations or documents; it is not a requirement for every route.",
    "d078-mixed-methods": "Use this when a study has distinct questions that need both numerical patterns and qualitative explanation, and the design explains how the two kinds of evidence will be combined.",
    "d078-survey-method": "Use a survey when planned questions to a defined group can answer the research question; choose wording, response options and sampling to fit the intended conclusion.",
    "d078-interviews": "Use interviews when the question needs detailed accounts, views or experiences; interview findings alone do not show how common a view is.",
    "d078-document-analysis": "Use this when existing documents or records are evidence for the question; define which materials count and how they will be examined or coded.",
    "d078-observation-ethnography": "Use observation when practices or interactions need to be studied in their setting, and an ethnographic approach when meaning and context over time matter; plan permissions and safeguards for real people.",
    "d078-secondary-data": "Use this when data already collected for another purpose may answer the question; check its source, date, population, measures, limits and permitted reuse first.",
    "d078-computational-social-research": "Use computational methods when suitable digital, text, network or larger-scale data can help answer a social question; select the method for the question and address data quality, privacy and bias.",
    "d078-agent-based-modeling": "Use agent-based modelling when a stated theory or mechanism can be represented as interacting agents and a simulation can help explore possible patterns; simulation output is not evidence that real people will behave that way.",
    "d078-spatial-social-analysis": "Use spatial analysis when locations, distances, boundaries or geographic distribution matter to the social question and the data support the chosen scale.",
    "d078-statistical-tool-choice": "Use this when a selected quantitative task calls for choosing a software workflow; compare access, method support and reproducibility, and do not treat multiple packages as cumulative requirements.",
    "d078-survey-data-collection-tool": "Use KoboToolbox when a planned form-based study needs electronic forms and response collection; the tool does not design the research question, sample or questionnaire for you.",
    "d078-qualitative-coding-tool": "Use Taguette when a qualitative document workflow benefits from highlighting, tagging and retrieving passages; manual coding with a documented process is also valid.",
    "d078-social-network-tool": "Use Gephi when defined relationship data need to be explored or visualised as a network; a network picture or metric does not establish influence or causation.",
    "d078-certification-boundaries": "Use this guidance when asking whether every D078 learner needs one professional certificate: the reviewed material establishes no universal credential, so verify any proposed credential against the specific task, area, role, issuer and jurisdiction.",
    "d078-excel-data-tool": "Use Excel when a task calls for organising, checking, filtering, summarising or charting a manageable table; it does not establish that the data or conclusion are valid.",
    "d078-matplotlib-tool": "Use Matplotlib when a Python workflow needs a clearly labelled chart from prepared data; charting does not validate the data, analysis or interpretation.",
}


def main() -> None:
    data = json.loads(CONTRACT.read_text(encoding="utf-8-sig"))
    changed = 0
    for row in data.get("existing_inventory", []):
        item_id = str(row.get("id"))
        if item_id not in USE_CASES:
            continue
        if row.get("use_case"):
            continue
        row["use_case"] = USE_CASES[item_id]
        row["use_case_review"] = {
            "state": "candidate_task_scoped_explanation_pending_claim_and_checkpoint_review",
            "basis": "Plain-language application of this record's existing meaning, output and cited evidence; not a new claim of a universal occupational requirement.",
            "evidence_refs": [
                {"source_id": e.get("source_id"), "locator": e.get("exact_locator") or e.get("locator")}
                for e in row.get("evidence", [])
            ],
        }
        changed += 1
    data.setdefault("reconciliation_notes", []).append({
        "date": "2026-10-10",
        "scope": "Added distinct task/use-case wording to the existing D078 domain candidates that had a sourced meaning/output but no separate use_case field.",
        "records_changed": changed,
        "guardrail": "Candidate explanations remain hidden and unapproved until item claims, checkpoint fit, relationships and task-specific learning resources are verified.",
    })
    CONTRACT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"use_cases_added": changed, "candidate_total": len(USE_CASES)}, indent=2))


if __name__ == "__main__":
    main()
