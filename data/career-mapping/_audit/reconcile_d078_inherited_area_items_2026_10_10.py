"""Crosswalk older D078 area-item graph records to detailed current items.

These 36 inherited graph records are not the separate 137 legacy skill labels.
They are retained as inputs and reconciled here so broad summaries do not get
silently dropped or double-counted beside the newer, detailed area inventory.
The output is review-only and does not alter the graph or canonical data.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
GRAPH = AUDIT / "D078_PROGRAMME_TO_ROLE_LEARNING_PATH_GRAPH_2026_10_10.json"
OUT_JSON = AUDIT / "D078_INHERITED_AREA_ITEM_CROSSWALK_2026_10_10.json"
OUT_MD = ROOT / "docs/manual-review/D078_INHERITED_AREA_ITEM_CROSSWALK_2026_10_10.md"


# A broad older record may resolve to several current items when the newer
# inventory has properly split alternatives or distinct methods/tools.
CROSSWALK: dict[str, tuple[list[str], str, str]] = {
    "social theory and concepts": (["SOC-K1", "D078-SOC-THEORY-CONTEXT"], "same_concept_refined", "The current inventory distinguishes social concepts and contextual interpretation from the broader theory-informed area item."),
    "qualitative and quantitative inquiry": (["D078-SOC-ETHNOGRAPHIC-FIELDWORK", "D078-SOC-INTERVIEW-FOCUSGROUP", "D078-SOC-SURVEY-DESIGN", "D078-SOC-SURVEY-ANALYSIS-R"], "decomposed_by_method_and_question", "Qualitative and quantitative approaches are distinct method choices; these links stay within the Sociology area and do not make either method a universal requirement."),
    "interviews/observation/document analysis": (["SOC-M1", "D078-SOC-ETHNOGRAPHIC-FIELDWORK", "D078-SOC-INTERVIEW-FOCUSGROUP", "D078-SOC-DOCUMENT-ANALYSIS"], "decomposed_by_evidence_method", "Interviewing, observation and document analysis are separate evidence routes and should not be collapsed into one mandatory bundle."),
    "ethnographic and comparative reasoning": (["D078-SOC-ETHNOGRAPHIC-FIELDWORK", "D078-SOC-SECONDARY-QUAL-ANALYSIS", "SOC-M2"], "decomposed_by_inquiry_type", "Ethnographic fieldwork, secondary qualitative analysis and thematic comparison have different evidence and access requirements; all targets stay within the Sociology area."),
    "research ethics and reflexivity": (["SOC-C1", "D078-SOC-ETHICS-REFLEXIVITY"], "same_capability_refined", "The current Sociology area records make ethical practice and reflexivity specific to research with people, settings and evidence; the broader domain candidate is not assigned outside its recorded routes."),
    "micro/macro economic concepts": (["ECON-K1", "D078-ECON-ECONOMIC-REASONING", "D078-ECON-NATIONAL-ACCOUNTS-MEASUREMENT"], "same_concept_refined", "The current inventory separates concepts and reasoning from specific national-accounts measures."),
    "economic measurement and data appraisal": (["ECON-S1", "D078-ECON-MEASUREMENT", "D078-ECON-NIGERIA-MICRODATA", "D078-ECON-NATIONAL-ACCOUNTS-MEASUREMENT", "D078-ECON-LABOUR-STATISTICS", "D078-ECON-PUBLIC-FINANCE-STATISTICS"], "decomposed_by_data_and_measure", "The broad summary is refined into source appraisal and distinct economic-data/measurement contexts."),
    "quantitative analysis/econometrics where justified": (["ECON-M1", "D078-ECON-APPLIED-ECONOMETRICS", "D078-ECON-CAUSAL-EVALUATION", "D078-ECON-R-PYTHON-ANALYSIS"], "decomposed_by_method_and_workflow", "Econometrics, causal evaluation and software workflow are related but not interchangeable or universally required."),
    "economic reasoning and policy interpretation": (["D078-ECON-ECONOMIC-REASONING", "ECON-C1", "D078-ECON-UNCERTAINTY-COMMUNICATION", "D078-ECON-DISTRIBUTIONAL-ANALYSIS"], "same_capability_refined", "Reasoning is retained and refined into explicit inference, uncertainty and distributional applications."),
    "forecasting with uncertainty": (["ECON-M2", "D078-ECON-FORECASTING-UNCERTAINTY", "D078-ECON-ALTERNATIVE-DATA-NOWCAST"], "same_method_refined_with_experimental_branch", "Established forecasting is separated from experimental alternative-data nowcasting."),
    "political institutions and governance concepts": (["D078-A03-knowledge-institutions-policy"], "same_concept_refined", "The current Area 3 item states the institutional and authority lens with a bounded learner output."),
    "policy-cycle and implementation analysis": (["D078-A34-A03-knowledge-regulatory-policy-cycle", "D078-A03-method-programme-evaluation", "D078-A34-A03-method-ria"], "decomposed_by_decision_stage", "Policy-cycle knowledge, programme evaluation and regulatory impact assessment address different points and purposes."),
    "qualitative/quantitative political research methods": (["D078-A03-method-policy-evidence-review", "D078-A03-method-survey-sampling"], "decomposed_by_method_and_question", "Methods are chosen by the political/governance question; no combined qualitative/quantitative method is mandatory, and the crosswalk stays within this area."),
    "document and public-opinion analysis": (["D078-A03-method-policy-evidence-review", "D078-A03-method-survey-sampling", "D078-A03-tool-kobotoolbox-survey"], "decomposed_by_source_type_and_stage", "Document review, survey design and data collection are separate steps and tools do not replace design."),
    "evidence communication for decision contexts": (["D078-A03-skill-policy-brief-writing"], "same_capability_refined", "The area-specific policy brief item captures communicating evidence for a policy decision without assigning an out-of-route domain candidate."),
    "social/behavioural theory": (["D078-A04-knowledge-behavioural-constructs", "D078-A04-knowledge-identity-groups-context"], "decomposed_by_construct_and_context", "Construct meaning and group/identity context are distinct and must not imply clinical diagnosis; targets stay within the Social Behaviour and Interaction area."),
    "measurement of constructs": (["D078-A04-knowledge-behavioural-constructs", "D078-A04-method-behavioural-research-design", "D078-A04-skill-measurement-analysis"], "decomposed_by_concept_design_and_analysis", "Defining a construct, designing a measure and analysing its results are different learning steps."),
    "research design and statistical interpretation": (["D078-A04-method-behavioural-research-design", "D078-A04-skill-measurement-analysis", "D078-A04-tools-quantitative-alternatives"], "decomposed_by_design_analysis_and_tool", "The statistical workflow is conditional on a suitable measure and design; software is an option, not proof of interpretation."),
    "observation/interview/experiment only when suited and ethically approved": (["D078-A04-method-qualitative-group-inquiry", "D078-A04-method-behavioural-research-design", "D078-A04-competency-ethical-cultural-reflexivity"], "decomposed_by_method_and_safeguard", "Observation, interviews and experiments are alternatives selected by question, ethics and feasibility."),
    "critical interpretation of behaviour in context": (["D078-A04-skill-group-pattern-interpretation", "D078-A04-competency-ethical-cultural-reflexivity"], "same_capability_refined", "The current Social Behaviour and Interaction items make contextual interpretation, reflexivity and limits explicit."),
    "human spatial patterns and place": (["D078:human-geography-population:spatial-concepts-and-place", "D078:human-geography-population:spatial-analysis-method"], "same_concept_refined", "The current area inventory separates understanding place/scale from carrying out spatial analysis."),
    "population measures and demographic change": (["D078:human-geography-population:population-measures", "D078:human-geography-population:demographic-estimation-projection"], "decomposed_by_measure_and_inference", "Population description and estimation/projection have distinct inference limits; economics-owned labour statistics are not treated as a Human Geography item."),
    "census/survey/administrative data appraisal": (["D078:human-geography-population:census-survey-admin-appraisal", "D078:human-geography-population:population-measures"], "same_capability_refined", "Appraisal of source coverage and population measures are related but distinct checks."),
    "gis/spatial analysis only when a spatial question supports it": (["D078:human-geography-population:spatial-data-provenance-scale", "D078:human-geography-population:spatial-analysis-method", "D078:human-geography-population:qgis-spatial-tool", "D078:human-geography-population:spatial-pattern-communication"], "decomposed_by_method_data_tool_and_reporting", "A spatial question is required; spatial data, method, QGIS and communication are separate choices. GIS is not a universal area requirement."),
    "migration/urbanisation interpretation": (["D078:human-geography-population:migration-urbanisation-interpretation", "D078:human-geography-population:population-measures", "D078:human-geography-population:spatial-analysis-method"], "same_application_refined", "Migration and urbanisation are substantive applications that may use demographic or spatial methods when justified."),
    "research question/design": (["d078-research-question-design", "D078:social-research-evaluation:study-question-design"], "same_concept_across_domain_and_area", "The shared domain concept is reused at this area checkpoint with the Social Research and Evaluation item's area-specific study choices; the separate Sociology item is not cross-assigned."),
    "sampling and measurement": (["D078:social-research-evaluation:sampling-and-measurement"], "same_method_capability_refined", "Sampling and measurement are selected and explained in the Social Research and Evaluation study context; other area-owned items are not cross-assigned."),
    "survey/interview/focus-group/document methods": (["D078:social-research-evaluation:field-and-document-method-choice", "D078:social-research-evaluation:kobo-electronic-collection"], "decomposed_by_method_and_collection", "These are method alternatives; KoboToolbox is only an optional collection tool, and Sociology-owned method items are not cross-assigned."),
    "quantitative/qualitative/mixed analysis": (["D078:social-research-evaluation:quantitative-analysis-choice", "D078:social-research-evaluation:qualitative-coding-options"], "decomposed_by_analysis_route", "Quantitative and qualitative analysis are distinct choices determined by the question and evidence; the crosswalk targets this area's own method records."),
    "programme/policy evaluation": (["D078:social-research-evaluation:programme-theory-and-logic", "D078:social-research-evaluation:evaluation-design-and-evidence"], "decomposed_by_evaluation_purpose", "Programme evaluation and regulatory impact assessment are different activities; this crosswalk retains the Social Research and Evaluation items without borrowing Politics-area items."),
    "ethics/data stewardship/reporting": (["D078:social-research-evaluation:research-ethics-data-stewardship", "D078:social-research-evaluation:stakeholder-use-and-reporting"], "decomposed_by_safeguarding_and_reporting", "Participant/data protection and communication of findings are complementary but distinct responsibilities; both targets belong to this area."),
    "computational question formulation": (["D078:computational-digital-social-science:computational-question-formulation", "d078-research-question-design"], "same_concept_refined_for_computation", "A social question is translated into a computational task only when computation is justified by the question and data."),
    "digital/social data provenance and ethics": (["D078:computational-digital-social-science:data-provenance-and-digital-ethics"], "same_capability_refined", "The Computational and Digital Social Science area item connects provenance, access, permission and privacy; other areas' digital-ethics items are not cross-assigned."),
    "data cleaning and reproducible workflows": (["D078:computational-digital-social-science:reproducible-data-cleaning", "D078:computational-digital-social-science:pandas-tabular-research-data"], "decomposed_by_practice_and_tool", "Cleaning/documentation is the method; reproducibility is the practice; pandas is an optional tool, all within the Computational and Digital Social Science area."),
    "statistics or text/network analysis when appropriate": (["D078:computational-digital-social-science:interpretable-statistical-modeling", "D078:computational-digital-social-science:content-analysis-and-text-classification", "D078:computational-digital-social-science:network-analysis-method"], "decomposed_by_analytic_question", "Statistical, text and network analyses answer different questions and require appropriate data and validation; this crosswalk uses the Computational and Digital Social Science items only."),
    "simulation/model evaluation and interpretation": (["D078:computational-digital-social-science:agent-based-social-simulation", "D078:computational-digital-social-science:mesa-or-casevo"], "decomposed_by_method_platform_and_maturity", "Simulation method and platform are distinct; this crosswalk retains the Computational and Digital Social Science items only. A simulation explores assumptions and is not observed human evidence."),
}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def main() -> None:
    graph = load(GRAPH)
    legacy_nodes = [node for node in graph.get("nodes", []) if node.get("kind") == "area_learning_item"]
    # The graph uses `item_id` for enriched records, `contract_id` for the
    # domain contract, and `id` for the graph node. Resolve all three, while
    # retaining the target record to check that area-owned links stay in-route.
    current_nodes = {
        value: node
        for node in graph.get("nodes", [])
        for value in (node.get("item_id"), node.get("contract_id"), node.get("id"))
        if value
    }
    area_labels = {
        node.get("area_id"): node.get("label")
        for node in graph.get("nodes", [])
        if node.get("kind") == "area_of_specialization"
    }
    current_ids = set(current_nodes)
    rows = []
    for node in legacy_nodes:
        key = node["label"].lower()
        if key not in CROSSWALK:
            raise ValueError(f"No explicit crosswalk for inherited area item: {key}")
        target_ids, disposition, rationale = CROSSWALK[key]
        missing = [target for target in target_ids if target not in current_ids]
        if missing:
            raise ValueError(f"Unresolved target IDs for {key}: {missing}")
        for target in target_ids:
            target_node = current_nodes[target]
            target_area = target_node.get("area_id")
            if target_area and target_area != node.get("area_id"):
                raise ValueError(f"Cross-area target for {key}: {target} belongs to {target_area}")
            allowed_areas = target_node.get("areas")
            source_area_label = area_labels.get(node.get("area_id"))
            if allowed_areas and source_area_label not in allowed_areas:
                raise ValueError(
                    f"Target route metadata excludes source area for {key}: "
                    f"{target} allows {allowed_areas}, not {source_area_label}"
                )
        rows.append({
            "source_record_id": node["id"],
            "source_label": node["label"],
            "area_id": node.get("area_id"),
            "internal_task_group_id": node.get("task_family_id"),
            "disposition": disposition,
            "current_target_item_ids": target_ids,
            "rationale": rationale,
            "legacy_record_preserved_as_provenance": True,
            "separate_learning_card_proposed": False,
            "student_visible": False,
            "canonical_change": False,
        })
    if len(rows) != 36 or len({r["source_record_id"] for r in rows}) != 36:
        raise ValueError(f"Expected exactly 36 unique inherited records, got {len(rows)}")

    dispositions: dict[str, int] = {}
    for row in rows:
        dispositions[row["disposition"]] = dispositions.get(row["disposition"], 0) + 1
    payload = {
        "schema_version": "1.0",
        "artifact_type": "D078 inherited area-item identity crosswalk",
        "reviewed_on": "2026-10-10",
        "status": "review_crosswalk_hidden_not_canonical",
        "scope_note": "These 36 older area-item nodes are in-scope planned-path evidence and are distinct from the 137 excluded legacy skill labels. Crosswalking retains their provenance while preventing duplicate cards beside detailed area/domain items.",
        "counts": {
            "inherited_area_records": len(rows),
            "records_with_resolved_target_ids": sum(bool(r["current_target_item_ids"]) for r in rows),
            "separate_cards_proposed": sum(r["separate_learning_card_proposed"] for r in rows),
            "student_visible": 0,
            "canonical_changes": 0,
            "dispositions": dispositions,
        },
        "records": rows,
    }
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# D078 inherited area-item crosswalk - 2026-10-10",
        "",
        "**Status:** review-only identity reconciliation; no canonical edits and no student display approval.",
        "",
        "These 36 records are not the excluded 137 legacy skill labels. They are older area-task learning-item summaries already present in the interim graph. Each is retained as provenance and mapped to the more specific current domain/area item(s), so the old summary is not lost or accidentally shown as an extra duplicate card.",
        "",
        f"- Inherited records reconciled: {len(rows)}/36.",
        f"- Records with valid current target IDs: {sum(bool(r['current_target_item_ids']) for r in rows)}/36.",
        "- Separate cards proposed: 0; student visible: 0; canonical changes: 0.",
        "",
        "A crosswalk is not an approval of the target item's claims, checkpoint or student copy. Each target still passes its own evidence, relationship, prerequisite, alternative, limitations and task-specific learning-link gates.",
        "",
        "## Record dispositions",
        "",
        "| Older record | Disposition | Current item(s) | Rationale |",
        "|---|---|---|---|",
    ]
    for row in rows:
        lines.append(f"| {row['source_label']} | {row['disposition']} | {', '.join(row['current_target_item_ids'])} | {row['rationale']} |")
    lines.extend(["", f"Machine-readable crosswalk: `{OUT_JSON.relative_to(ROOT).as_posix()}`."])
    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT_JSON.relative_to(ROOT)}")
    print(f"Wrote {OUT_MD.relative_to(ROOT)}")
    print(json.dumps(payload["counts"], ensure_ascii=False))


if __name__ == "__main__":
    main()
