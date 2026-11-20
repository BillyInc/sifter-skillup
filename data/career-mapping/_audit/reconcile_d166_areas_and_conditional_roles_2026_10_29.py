#!/usr/bin/env python3
"""Reconcile D166's eight sourced areas and task-conditioned role links.

This is a scoped, idempotent data reconciliation. It records conditional D166
role fit/routes only for sourced assignments. It does not make generic role
tasks an unconditional D166 fit, activate area visibility, or touch ISCO records.
"""

from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CAREER = ROOT / "data" / "career-mapping"
STRUCTURE_PATH = CAREER / "domain_structure.json"
CATALOG_PATH = CAREER / "domain_specialization_catalog.json"
INDEX_PATH = CAREER / "_audit" / "D011_D166_IN_DEPTH_SOURCE_INDEX_2026_10_23.json"
AGENT1_PATH = CAREER / "_audit" / "agent_workpacks" / "D166_AGENT1_SOURCE_WORKPACK_2026_10_24.json"
AGENT2_PATH = CAREER / "_audit" / "agent_workpacks" / "D166_AGENT2_SOURCE_WORKPACK_2026_10_24.json"
ROLE_LIBRARY_PATH = CAREER / "role_library_v3_cleaned.json"
RETIRED_SUBGROUP_ARCHIVE_PATH = CAREER / "_audit" / "D166_RETIRED_ISCO_SUBGROUPS_2026_10_29.json"
SUPERSEDED_AREA_ARCHIVE_PATH = CAREER / "_audit" / "D166_SUPERSEDED_BROAD_AREA_PROPOSALS_2026_10_29.json"

OLD_TO_NEW = {
    "Perception, Sensing and Scene Understanding": [
        "D166:vehicle-sensing-and-sensor-calibration",
        "D166:perception-and-scene-understanding",
    ],
    "Localization, Mapping and Vehicle State Estimation": [
        "D166:high-definition-mapping",
        "D166:localization-and-vehicle-state-estimation",
    ],
    "Planning, Control and Automated Driving Software": [
        "D166:automated-driving-planning",
        "D166:vehicle-control-and-dynamics",
    ],
    "Vehicle Integration, Safety and Verification": [
        "D166:vehicle-interface-and-system-integration",
        "D166:ads-safety-verification-and-validation",
    ],
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def save(path: Path, value, indent: int) -> None:
    path.write_text(
        json.dumps(value, ensure_ascii=False, indent=indent) + "\n",
        encoding="utf-8",
    )


def collect_source_records(*roots) -> dict[str, dict]:
    found: dict[str, dict] = {}

    def visit(value) -> None:
        if isinstance(value, dict):
            source_id = value.get("source_id")
            if source_id and (value.get("url") or value.get("title")):
                found[source_id] = value
            for child in value.values():
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)

    for root in roots:
        visit(root)
    return found


def main() -> None:
    structure = load(STRUCTURE_PATH)
    catalog = load(CATALOG_PATH)
    index = load(INDEX_PATH)
    agent1 = load(AGENT1_PATH)
    agent2 = load(AGENT2_PATH)
    role_library = load(ROLE_LIBRARY_PATH)
    source_records = collect_source_records(index, agent1, agent2)

    domain = next(row for row in catalog["domains"] if row["domain_id"] == "D166")
    source_areas = deepcopy(domain["areas"])
    area_by_id = {area["area_key"]: area for area in source_areas}
    assert len(source_areas) == 8 and len(area_by_id) == 8

    d166_roles = [row for row in role_library if row.get("domain_id") == "D166"]
    role_by_name = {row["role_name"].casefold(): row for row in d166_roles}
    assert len(d166_roles) == 9 and len(role_by_name) == 9

    # The validated source index is the primary conditional-task ledger.
    # Preserve the two additional workpack assignments where the source card
    # directly documents the task, while keeping the assignment conditional.
    tasks: dict[tuple[str, str], dict] = {}
    for row in index["conditional_role_area_task_evidence"]:
        if not row["area_id"].startswith("D166:"):
            continue
        name = row["role_name"].casefold()
        assert name in role_by_name, f"Role not in current D166 role library: {name}"
        task = {
            "role_key": f"D166|{name}",
            "role_name": role_by_name[name]["role_name"],
            "area_id": row["area_id"],
            "applicability": "conditional_task_assignment",
            "condition": row["condition"],
            "boundary": row["boundary"],
            "source_ids": sorted(
                row["source_ids"].split()
                if isinstance(row["source_ids"], str)
                else row["source_ids"]
            ),
            "source_references": [],
            "source_record": "D011_D166_IN_DEPTH_SOURCE_INDEX_2026_10_23.json:conditional_role_area_task_evidence",
        }
        tasks[(name, row["area_id"])] = task

    for pack_path, pack in ((AGENT1_PATH, agent1), (AGENT2_PATH, agent2)):
        for row in pack.get("role_task_evidence", []):
            role_id = row["canonical_role_id"]
            if not role_id.startswith("D166|"):
                continue
            name = role_id.split("|", 1)[1].casefold()
            assert name in role_by_name, f"Workpack role not in current D166 role library: {name}"
            key = (name, row["area_id"])
            if key in tasks:
                continue
            task = {
                "role_key": role_id,
                "role_name": role_by_name[name]["role_name"],
                "area_id": row["area_id"],
                "applicability": "conditional_task_assignment",
                "condition": row["conditional_applicability"],
                "boundary": row["boundary"],
                "task_evidence": row["task_evidence"],
                "source_ids": [row["source_id"]],
                "source_references": [],
                "source_record": f"{pack_path.relative_to(ROOT).as_posix()}:role_task_evidence",
            }
            tasks[key] = task

    # Retain only role-area connections with task-specific evidence. In
    # particular this drops the stale software-analyst/integration listing and
    # adds the sourced optomechanical-engineer/integration task.
    registry_ids = set(source_records)
    for task in tasks.values():
        assert task["area_id"] in area_by_id, f"Noncanonical area in role task: {task['area_id']}"
        assert task["source_ids"] and set(task["source_ids"]) <= registry_ids, (
            f"Unresolved task evidence IDs: {task['source_ids']}"
        )
        task["source_references"] = [
            {
                key: source_records[source_id][key]
                for key in (
                    "source_id", "publisher", "title", "url", "locator", "supports",
                    "claim_limit", "access_date", "current_access_status",
                )
                if key in source_records[source_id]
            }
            for source_id in task["source_ids"]
        ]

    assert len(tasks) == 20, f"Expected the reconciled 20 sourced role-area assignments, got {len(tasks)}"
    assert {name for name, _ in tasks} == set(role_by_name), "Every current D166 role needs sourced conditional work."

    # Convert generic D166 exclusions into conditional D166 fits only for the
    # source-backed assignments represented here. The task-level condition is
    # retained on every area route so this does not imply blanket role fit.
    tasks_by_role: dict[str, list[dict]] = {name: [] for name in role_by_name}
    for task in tasks.values():
        tasks_by_role[task["role_name"].casefold()].append(task)
    area_order = [area["area_key"] for area in source_areas]
    for name, role in role_by_name.items():
        role_tasks = tasks_by_role[name]
        area_groups: dict[str, list[dict]] = {}
        for task in role_tasks:
            area_groups.setdefault(task["area_id"], []).append(task)
        ordered_area_ids = [area_id for area_id in area_order if area_id in area_groups]
        all_urls = sorted({
            source["url"]
            for task in role_tasks
            for source in task["source_references"]
            if source.get("url")
        })
        route_basis = (
            "Conditional D166 fit only for the documented task assignments in the listed areas. "
            "The generic occupation includes work outside D166; do not infer that every person with this title performs ADS work."
        )
        role["domain_fit_review_status"] = "conditional"
        role["domain_fit_review_basis"] = route_basis
        role["domain_fit_review_source_refs"] = all_urls
        role["role_domain_lane_review_date"] = "2026-10-29"
        role["role_domain_lane_review_status"] = "conditional"
        role["role_domain_lane_review_sources"] = all_urls
        role["student_path_status"] = "active"
        role["student_path_exclusion_reason"] = None
        role["role_domain_routes"] = [
            row for row in role.get("role_domain_routes", [])
            if row.get("domain_id") != "D166"
        ] + [{
            "domain_id": "D166",
            "status": "conditional",
            "route_type": "primary",
            "evidence": {"basis": route_basis, "source_refs": all_urls},
            "qualification": route_basis,
        }]
        role["role_area_routes"] = [
            row for row in role.get("role_area_routes", [])
            if not str(row.get("area_id") or "").startswith("D166:")
        ] + [{
            "area_id": area_id,
            "status": "conditional",
            "route_type": "primary" if position == 0 else "secondary",
            "evidence": {
                "basis": "Conditional only for the task assignment(s) recorded below.",
                "source_refs": sorted({
                    source["url"]
                    for task in area_groups[area_id]
                    for source in task["source_references"]
                    if source.get("url")
                }),
                "conditional_task_ids": sorted({
                    source_id for task in area_groups[area_id] for source_id in task["source_ids"]
                }),
                "conditions": [task["condition"] for task in area_groups[area_id]],
                "boundaries": [task["boundary"] for task in area_groups[area_id]],
            },
            "qualification": "Applicable only when: " + " OR ".join(
                task["condition"] for task in area_groups[area_id]
            ),
        } for position, area_id in enumerate(ordered_area_ids)]
        role["specialization_fit_review_status"] = "conditional"
        role["specialization_fit_status"] = "conditional"
        role["specialization_fit_domain_gate"] = "conditional_parent_domain_fit"
        role["specialization_fit_area_key"] = ordered_area_ids[0]
        role["specialization_fit_review_basis"] = route_basis
        role["specialization_fit_review_source_refs"] = all_urls
        role["specialization_fit_review_date"] = "2026-10-29"
        role["role_domain_routes_updated"] = "2026-10-29"

    # Attach conditional task records and derive the compact role-key summary
    # from them; never treat a generic title as a blanket AV role fit.
    tasks_by_area: dict[str, list[dict]] = {area_id: [] for area_id in area_by_id}
    for task in tasks.values():
        tasks_by_area[task["area_id"]].append(task)
    for area in source_areas:
        area_id = area["area_key"]
        rows = sorted(tasks_by_area[area_id], key=lambda row: (row["role_name"].casefold(), row["condition"]))
        area["conditional_role_tasks"] = rows
        area["role_keys"] = sorted({row["role_key"] for row in rows})
        area["role_route_count"] = len(area["role_keys"])

    domain["areas"] = source_areas
    domain["recommended_area_count_normalized"] = 8
    domain["canonical_status"] = "eight_areas_and_conditional_role_tasks_reconciled_pending_student_contract_and_ui_approval"
    domain["open_items"] = [
        item for item in domain.get("open_items", [])
        if "SAE automation levels" in item or "safety/V&V area cross-cutting" in item
    ] + [
        "Student visibility remains off until the student-facing contract and local UI approval are completed."
    ]

    dstructure = structure["D166"]
    old_areas = dstructure.get("areas_of_specialization", [])
    old_labels = {area["label"] for area in old_areas}
    if old_labels == set(OLD_TO_NEW):
        if SUPERSEDED_AREA_ARCHIVE_PATH.exists():
            superseded_archive = load(SUPERSEDED_AREA_ARCHIVE_PATH)
            assert superseded_archive["domain_id"] == "D166"
            superseded = deepcopy(superseded_archive["records"])
            assert len(superseded) == 4
            assert {row["label"] for row in superseded} == set(OLD_TO_NEW)
        else:
            # First run from the original four-area structure: preserve every
            # field and source locator before adding the superseded status.
            superseded = deepcopy(old_areas)
            for old in superseded:
                old.update({
                    "disposition": "superseded_by_eight_detailed_source_reconciled_areas",
                    "replaced_by_area_ids": OLD_TO_NEW[old["label"]],
                    "student_destination": False,
                    "note": "Historical broad proposal retained for audit only; not an active area or ISCO subgroup.",
                })
    else:
        assert old_labels == {area["label"] for area in source_areas}, (
            "The D166 area set changed; inspect it before reconciling."
        )
        superseded = dstructure.get("areas_of_specialization_superseded", [])
        assert len(superseded) == 4

    dstructure["role_count"] = len(d166_roles)
    dstructure["areas_of_specialization_superseded"] = superseded
    dstructure["areas_of_specialization"] = []
    for area in source_areas:
        dstructure["areas_of_specialization"].append({
            "area_id": area["area_key"],
            "label": area["label"],
            "description": area["description"],
            "boundary": area["boundary"],
            "source_ids": area["source_ids"],
            "source_references": area["source_references"],
            "uncorroborated_source_urls": area.get("uncorroborated_source_urls", []),
            "recommendation_status": area["recommendation_status"],
            "area_status": area["area_status"],
            "student_visible": area["student_visible"],
            "nigerian_context": area.get("nigerian_context"),
            "source_evidence_status": area.get("source_evidence_status"),
            "unresolved_source_ids": area.get("unresolved_source_ids", []),
            "area_evidence_link_check": area.get("area_evidence_link_check", {}),
            "role_keys": area["role_keys"],
            "role_route_count": area["role_route_count"],
            "conditional_role_tasks": area["conditional_role_tasks"],
        })
    dstructure["areas_of_specialization_status"] = (
        "eight_source_reconciled_areas_and_conditional_role_tasks_pending_student_contract_and_ui_approval"
    )
    dstructure["areas_of_specialization_source"] = "data/career-mapping/domain_specialization_catalog.json"

    # Remove the retired ISCO-derived subgroup taxonomy from active D166 data,
    # while preserving the exact records in an audit-only archive.
    if dstructure.get("subgroups"):
        retired_subgroups = deepcopy(dstructure["subgroups"])
        assert all(row.get("data_state") == "excluded" for row in retired_subgroups)
        save(RETIRED_SUBGROUP_ARCHIVE_PATH, {
            "domain_id": "D166",
            "recorded_on": "2026-10-29",
            "disposition": "retired_isco_derived_subgroups_not_active_specialization_areas",
            "records": retired_subgroups,
        }, indent=2)
    else:
        archive = load(RETIRED_SUBGROUP_ARCHIVE_PATH)
        assert archive["domain_id"] == "D166"
        assert archive["disposition"] == "retired_isco_derived_subgroups_not_active_specialization_areas"
    dstructure["subgroups"] = []
    dstructure["has_subgroups"] = False
    dstructure["subgroup_reconciliation_status"] = (
        "legacy_isco_derived_subgroups_retired_and_archived; replaced by source_reconciled_specialization_areas"
    )

    save(SUPERSEDED_AREA_ARCHIVE_PATH, {
        "domain_id": "D166",
        "recorded_on": "2026-10-29",
        "disposition": "four_broad_proposals_superseded_by_eight_detailed_source_reconciled_areas",
        "records": superseded,
    }, indent=2)

    save(CATALOG_PATH, catalog, indent=2)
    save(STRUCTURE_PATH, structure, indent=1)
    save(ROLE_LIBRARY_PATH, role_library, indent=2)

    print(f"D166 area candidates retained: {len(source_areas)}")
    print(f"Older broad area proposals superseded and mapped: {len(superseded)}")
    print(f"Canonical D166 role records: {len(d166_roles)}")
    print(f"Conditional sourced role-area assignments: {len(tasks)}")
    print("Role fit/routes are conditional on task evidence; student visibility unchanged; ISCO subgroups retired from active D166 data.")


if __name__ == "__main__":
    main()
