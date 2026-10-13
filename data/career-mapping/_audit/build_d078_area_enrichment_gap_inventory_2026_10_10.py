"""Inventory the D078 area-enrichment layer before graph integration.

This is a local audit artifact. It does not adjudicate role fit, change the
canonical taxonomy, approve student visibility, or modify SQL/UI files. Its
purpose is to make the area-of-specialization enrichment gap explicit while
the three area research lanes work.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AREA_TASKS = ROOT / "data/career-mapping/_audit/d078_area_role_task_sets_2026_10_09.json"
DOMAIN_CONTRACT = ROOT / "data/career-mapping/_audit/d078_domain_learning_contract_2026_10_08.json"
OUTPUT = ROOT / "data/career-mapping/_audit/D078_AREA_ENRICHMENT_GAP_INVENTORY_2026_10_10.json"
REPORT = ROOT / "docs/manual-review/D078_AREA_ENRICHMENT_GAP_INVENTORY_2026_10_10.md"


def as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def contract_rows(contract: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        *contract.get("existing_inventory", []),
        *contract.get("foundation_and_route_additions", []),
        *contract.get("route_alternatives", []),
        *contract.get("deep_search_options", []),
    ]


def main() -> None:
    area_package = json.loads(AREA_TASKS.read_text(encoding="utf-8-sig"))
    contract = json.loads(DOMAIN_CONTRACT.read_text(encoding="utf-8-sig"))
    rows = contract_rows(contract)
    area_inventory: list[dict[str, Any]] = []

    for area in area_package.get("area_task_sets", []):
        task_families = as_list(area.get("task_families")) + as_list(area.get("additional_task_families"))
        candidate_items = [
            item
            for task in task_families
            for item in as_list(task.get("learning_items"))
        ]
        missing_item_evidence = []
        for item in candidate_items:
            evidence = {
                "authoritative": len(as_list(item.get("evidence_source_ids"))) > 0,
                "explanatory": len(as_list(item.get("explanatory_source_ids"))) > 0,
                "task_specific_learning": len(as_list(item.get("free_task_specific_learning_resource_ids"))) > 0,
            }
            if not all(evidence.values()):
                missing_item_evidence.append({"label": item.get("label"), "evidence": evidence})

        matching_contract_items = [
            row for row in rows
            if area.get("label") in as_list(row.get("areas"))
        ]
        area_inventory.append({
            "area_id": area.get("area_id"),
            "label": area.get("label"),
            "task_set_status": area.get("task_set_status"),
            "task_family_count": len(task_families),
            "candidate_item_count": len(candidate_items),
            "candidate_item_types": dict(sorted(Counter(str(item.get("type")) for item in candidate_items).items())),
            "candidate_item_labels": [item.get("label") for item in candidate_items],
            "items_missing_one_or_more_evidence_roles": missing_item_evidence,
            "task_families_without_free_task_specific_resource": [
                task.get("task_id")
                for task in task_families
                if not as_list(task.get("free_task_specific_learning_source_ids"))
            ],
            "typed_domain_contract_items_tagged_to_this_area": len(matching_contract_items),
            "area_owned_items_integrated_into_typed_graph": False,
            "student_visible": False,
            "area_reconciliation_status": "independent_enrichment_and_domain_inheritance_reconciliation_pending",
        })

    output = {
        "schema_version": "2026-10-10.d078.area-enrichment-gap-inventory.v1",
        "status": "area_enrichment_gap_inventory_not_approval",
        "source_artifacts": [
            str(AREA_TASKS.relative_to(ROOT)).replace("\\", "/"),
            str(DOMAIN_CONTRACT.relative_to(ROOT)).replace("\\", "/"),
        ],
        "policy": {
            "area_is_specialization_or_practice_layer": True,
            "domain_foundation_may_be_inherited_only_when_genuinely_shared": True,
            "every_area_requires_independent_task_set_and_item_search": True,
            "missing_nigerian_analogue_is_not_a_global_practice_blocker": True,
            "student_visibility": "fail_closed_until_claim_checkpoint_relationship_limitation_and_learning_link_gates_pass",
            "canonical_changes": False,
            "role_fit_audit_reopened": False,
        },
        "area_count": len(area_inventory),
        "areas": area_inventory,
        "totals": {
            "candidate_area_task_families": sum(row["task_family_count"] for row in area_inventory),
            "candidate_area_items": sum(row["candidate_item_count"] for row in area_inventory),
            "areas_with_area_owned_graph_integration": sum(row["area_owned_items_integrated_into_typed_graph"] for row in area_inventory),
            "student_visible_area_items": 0,
        },
    }
    OUTPUT.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    lines = [
        "# D078 area-enrichment gap inventory - 2026-10-10",
        "",
        "This local artifact inventories the area-of-specialization/practice layer. It does not approve items, change canonical taxonomy, reopen role-fit adjudication, or modify SQL/UI files.",
        "",
        f"- Areas in scope: **{output['area_count']}**",
        f"- Candidate area task families: **{output['totals']['candidate_area_task_families']}**",
        f"- Candidate area items: **{output['totals']['candidate_area_items']}**",
        "- Area-owned items integrated into typed graph: **0 pending the three enrichment lanes**",
        "- Student-visible area items: **0**",
        "",
        "The area task-set package contains research candidates, but a domain-level contract does not complete area enrichment. Each area must independently establish its task set and item evidence, distinguish inherited foundations from area-owned additions, and pass the same explanation, relationship, limitation and task-specific learning-link gates.",
        "",
        "| Area | Task families | Candidate items | Evidence/resource state |",
        "|---|---:|---:|---|",
    ]
    for area in area_inventory:
        missing = sum(len(area[key]) for key in ("items_missing_one_or_more_evidence_roles", "task_families_without_free_task_specific_resource"))
        state = "candidate evidence present; area reconciliation pending" if missing else "candidate evidence present; verify and reconcile"
        lines.append(f"| {area['label']} | {area['task_family_count']} | {area['candidate_item_count']} | {state} |")
    lines.extend([
        "",
        f"Machine-readable artifact: `{OUTPUT.relative_to(ROOT).as_posix()}`",
    ])
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps(output["totals"], sort_keys=True))


if __name__ == "__main__":
    main()
