"""Reconcile D078's existing inventory with its 19 workflow-gap candidates.

This is a local evidence artifact builder.  It deliberately does not edit the
canonical domain, subgroup, role, API, matcher, or SQL files.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
GAP_PATH = ROOT / "data/career-mapping/_audit/d078_domain_workflow_gap_audit_2026_10_08.json"
INVENTORY_PATH = ROOT / "data/career-mapping/_audit/d078_full_domain_item_inventory_2026_10_08.json"
DEEP_PATH = ROOT / "data/career-mapping/_audit/d078_skills_methods_deep_search_checkpoint_2026_10_08.json"
JSON_PATH = ROOT / "data/career-mapping/_audit/d078_learning_path_reconciliation_2026_10_08.json"
MD_PATH = ROOT / "docs/manual-review/D078_LEARNING_PATH_RECONCILIATION_2026_10_08.md"


FOUNDATION_IDS = {
    "sampling_recruitment_and_representativeness",
    "measurement_and_operationalisation",
    "reliability_validity_and_uncERTAINTY".lower(),
    "pilot_and_cognitive_pretesting",
    "open_science_preregistration_and_reproducibility",
    "reference_and_literature_management",
}

MERGE_TARGETS = {
    "r_statistical_computing": {
        "target": "d078-statistical-tool-choice",
        "relationship": "alternative_tool_choice",
        "reason": "R is an alternative quantitative-computing route, not a second universal foundation item.",
    },
    "stata_quantitative_social_science_workflow": {
        "target": "d078-statistical-tool-choice",
        "relationship": "alternative_tool_choice",
        "reason": "Stata is an alternative quantitative-computing route, not a second universal foundation item.",
    },
    "ai_assisted_and_digital_trace_research_ethics": {
        "target": "d078-computational-social-research",
        "relationship": "conditional_extension",
        "reason": "The candidate extends the existing computational/social-research lane but remains deferred until its task, ethics and evidence boundaries are narrower.",
    },
}


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def build() -> dict[str, Any]:
    gap = load(GAP_PATH)
    inventory = load(INVENTORY_PATH)
    deep = load(DEEP_PATH)
    source_by_id = {item["id"]: item for item in gap["source_register"]}

    existing_by_id: dict[str, dict[str, Any]] = {}
    duplicate_inventory_ids: list[str] = []
    for item in inventory["candidate_items"]:
        item_id = item["id"]
        if item_id in existing_by_id:
            duplicate_inventory_ids.append(item_id)
            continue
        existing_by_id[item_id] = item

    merged = [
        {
            "id": item_id,
            "origin": "existing_inventory",
            "label": item["label"],
            "type": item["type"],
            "status": item.get("status"),
            "disposition": item.get("disposition"),
            "areas": item.get("areas", []),
            "claim_state": item.get("claim_state"),
        }
        for item_id, item in existing_by_id.items()
    ]

    additions: list[dict[str, Any]] = []
    route_extensions: list[dict[str, Any]] = []
    for candidate in gap["gap_candidates"]:
        candidate_id = candidate["id"]
        disposition = candidate["disposition"]
        source_records = [source_by_id[source_id] for source_id in candidate["source_ids"]]
        if candidate_id in MERGE_TARGETS:
            target = MERGE_TARGETS[candidate_id]
            route_extensions.append(
                {
                    "id": candidate_id,
                    "category": candidate["category"],
                    "disposition": disposition,
                    "merge_target": target["target"],
                    "relationship": target["relationship"],
                    "reason": target["reason"],
                    "use_case": candidate["use_case"],
                    "sources": source_records,
                }
            )
            continue

        if candidate_id in FOUNDATION_IDS:
            layer = "most_versatile_foundation_or_useful_edge"
        elif "specialist" in disposition:
            layer = "route_specific_specialist"
        else:
            layer = "conditional_or_route_specific"

        additions.append(
            {
                "id": candidate_id,
                "category": candidate["category"],
                "layer": layer,
                "disposition": disposition,
                "use_case": candidate["use_case"],
                "sources": source_records,
                "student_visibility": "hidden_until_item_claim_and_learning_link_gate",
                "canonical_status": "not_promoted",
            }
        )

    inventory_aliases = {
        "nvivo": "d078-nvivo-tool",
        "casevo": "d078-casevo-tool",
        "mesa": "d078-mesa-tool",
        "ibm spss statistics": "d078-spss-tool",
        "pandas": "d078-pandas-tool",
        "networkx": "d078-networkx-tool",
    }
    deep_overlays: list[dict[str, Any]] = []
    for item in deep["items"]:
        # The deep search is an evidence layer: it reinforces existing items
        # where possible and creates only narrowly-scoped new route options.
        normalized_name = item["name"].lower()
        inventory_id = inventory_aliases.get(normalized_name)
        already_in_inventory = bool(inventory_id and inventory_id in existing_by_id)
        deep_overlays.append(
            {
                "id": item["id"],
                "name": item["name"],
                "type": item["type"],
                "disposition": item["disposition"],
                "use_case": item["use_case"],
                "does_not_enable": item["does_not_enable"],
                "learning_link": item.get("learning_link"),
                "source_ids": item["source_ids"],
                "inventory_overlap": already_in_inventory,
                "student_visibility": "hidden_until_item_claim_and_learning_link_gate",
            }
        )

    return {
        "schema_version": "2026-10-08.d078.learning-path-reconciliation.v1",
        "reviewed_on": "2026-10-08",
        "domain_id": "D078",
        "domain_name": "Social Sciences & Behavioural Research",
        "status": "local_reconciliation_candidate_only",
        "scope": [
            "Compare the existing D078 inventory with the 19 D078-specific workflow-gap candidates.",
            "Separate shared foundation, route-specific, conditional, specialist and deferred material.",
            "Retain source URLs, locators and access dates from the existing evidence ledger.",
        ],
        "guardrails": [
            "This is D078 domain-learning enrichment, not a generic cross-domain template.",
            "Subgroup/area-of-specialization reconciliation and role resolution are handled by Boole separately.",
            "No role-frequency item becomes a domain foundation without checkpoint evidence.",
            "No item is student-visible until its claim, meaning, relationship and learning-link gates pass.",
            "No canonical domain, subgroup, role, API, matcher or SQL file is modified by this builder.",
        ],
        "counts": {
            "existing_inventory_records": len(inventory["candidate_items"]),
            "existing_unique_inventory_items": len(existing_by_id),
            "duplicate_inventory_ids": duplicate_inventory_ids,
            "workflow_gap_candidates": len(gap["gap_candidates"]),
            "new_concept_additions": len(additions),
            "route_extensions_or_alternatives": len(route_extensions),
            "merged_concept_nodes": len(existing_by_id) + len(additions),
            "foundation_additions": sum(item["layer"] == "most_versatile_foundation_or_useful_edge" for item in additions),
            "conditional_or_route_specific_additions": sum(item["layer"] == "conditional_or_route_specific" for item in additions),
            "specialist_additions": sum(item["layer"] == "route_specific_specialist" for item in additions),
            "deferred_extensions": sum(item["id"] == "ai_assisted_and_digital_trace_research_ethics" for item in route_extensions),
            "deep_search_items_screened": len(deep_overlays),
            "deep_search_items_reinforcing_inventory": sum(item["inventory_overlap"] for item in deep_overlays),
            "deep_search_new_route_items": sum(not item["inventory_overlap"] for item in deep_overlays),
        },
        "existing_inventory": list(existing_by_id.values()),
        "new_concept_additions": additions,
        "route_extensions_or_alternatives": route_extensions,
        "deep_search_route_overlays": deep_overlays,
        "source_register": gap["source_register"],
        "deep_search_source_register": deep["source_register"],
        "validation": {
            "all_workflow_candidates_have_source_ids": all(item["source_ids"] for item in gap["gap_candidates"]),
            "all_source_ids_resolve": all(source_id in source_by_id for item in gap["gap_candidates"] for source_id in item["source_ids"]),
            "all_new_additions_have_sources": all(item["sources"] for item in additions),
            "all_deep_search_items_have_sources": all(item["source_ids"] for item in deep_overlays),
            "student_approval_claimed": False,
            "canonical_files_modified": False,
        },
    }


def write_markdown(result: dict[str, Any]) -> None:
    counts = result["counts"]
    lines = [
        "# D078 Learning-Path Reconciliation",
        "",
        "**Date:** 2026-10-08  ",
        "**Domain:** D078 — Social Sciences & Behavioural Research  ",
        "**Status:** Local evidence reconciliation only; not student-approved or canonical.",
        "",
        "## Purpose",
        "",
        "This artifact compares the existing D078 inventory with the 19 D078-specific workflow-gap candidates. It determines which findings add domain-foundation coverage, which belong behind a selected route, and which extend an existing tool or method choice. It does not treat the 19 as a generic template for other domains.",
        "",
        "## Result",
        "",
        f"The inventory contains **{counts['existing_inventory_records']} records** but **{counts['existing_unique_inventory_items']} unique items**. The duplicate record is `{', '.join(counts['duplicate_inventory_ids'])}`. The workflow audit contributes **{counts['workflow_gap_candidates']} candidates**: **{counts['foundation_additions']} foundation/edge additions**, **{counts['conditional_or_route_specific_additions']} conditional or route-specific additions**, **{counts['specialist_additions']} specialist additions**, and **{counts['deferred_extensions']} deferred extension**.",
        "",
        "The R and Stata candidates are represented as alternatives under the existing quantitative-tool-choice item. AI-assisted and digital-trace research is retained as a conditional extension of the computational/social-research lane, not as a universal foundation item. The remaining candidates are new domain-learning concepts that are not present as equivalent items in the existing inventory.",
        "",
        "## Foundation additions",
        "",
    ]
    for item in result["new_concept_additions"]:
        if item["layer"] == "most_versatile_foundation_or_useful_edge":
            lines.append(f"- **{item['id']}** — {item['use_case']} (`{item['disposition']}`)")
    lines.extend(["", "## Conditional and specialist routes", ""])
    for item in result["new_concept_additions"]:
        if item["layer"] != "most_versatile_foundation_or_useful_edge":
            lines.append(f"- **{item['id']}** — {item['use_case']} (`{item['disposition']}`; `{item['layer']}`)")
    lines.extend(["", "## Existing-item extensions", ""])
    for item in result["route_extensions_or_alternatives"]:
        lines.append(f"- **{item['id']}** → `{item['merge_target']}` — {item['reason']}")
    lines.extend(["", "## Named tools and computational options", ""])
    lines.append("Named tools are displayed only after the learner has chosen a task or route. They are not cumulative domain requirements:")
    lines.extend(
        [
            "- **Quantitative route:** SPSS, R, Python or jamovi can support numerical analysis; the learner still needs research design, measurement and statistical judgement.",
            "- **Python data workflow:** pandas can clean and reshape tables; statsmodels can fit statistical models; Matplotlib can create charts; Jupyter can keep code, explanation and results together.",
            "- **Qualitative route:** NVivo can organise and code substantial interviews, documents or open-ended responses; manual coding, Taguette, MAXQDA and ATLAS.ti are alternatives where appropriate.",
            "- **Relationship-data route:** NetworkX or Gephi can represent and analyse networks; a graph does not by itself prove causality or social meaning.",
            "- **Simulation route:** Mesa can build agent-based models in Python; Casevo is an emerging specialist option. Simulation results are not automatically evidence of real-world behaviour.",
            "- **Predictive/text route:** scikit-learn is a conditional specialist option when a specific area, evaluation plan and bias/interpretation safeguards are established; it is not a shared foundation tool.",
        ]
    )
    lines.append("")
    lines.append("The deep-search checkpoint contributes 10 named options; its source-backed overlap and new route items are retained in the JSON output rather than silently promoted.")
    lines.extend(
        [
            "",
            "## Visibility and implementation gate",
            "",
            "Every item remains hidden until its learner meaning, use case, relationship, evidence locator and verified instructional link are checked together. The 19 candidates have source records, but that does not by itself approve them for students. The programme overview and pre-domain-entry gates must still pass before the domain learning path is promoted.",
            "",
            "No canonical domain, subgroup, role, API, matcher or SQL file was changed by this reconciliation. Boole is handling the separate D078 area/role resolution.",
            "",
            "## Evidence",
            "",
            "The source register is copied from `d078_domain_workflow_gap_audit_2026_10_08.json`; each candidate retains the source URL, locator and access date there and in the machine-readable output.",
        ]
    )
    MD_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    result = build()
    JSON_PATH.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    write_markdown(result)
    print(json.dumps(result["counts"], indent=2))
