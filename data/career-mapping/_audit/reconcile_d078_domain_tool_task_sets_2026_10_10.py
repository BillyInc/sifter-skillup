"""Merge the planned D078 tool-task records into the domain learning contract.

This is a local audit-contract repair, not canonical promotion or graph rebuild.
The merge is idempotent, preserves existing values when present, and retains
duplicate deep-search records as aliases rather than new learner-facing cards.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
CONTRACT_PATH = AUDIT / "d078_domain_learning_contract_2026_10_08.json"
TASK_SET_PATH = AUDIT / "d078_area_role_task_sets_2026_10_09.json"


def load(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def link_entry(source: dict[str, Any], role: str) -> dict[str, Any]:
    return {
        "label": source.get("title") or source.get("label") or source.get("publisher"),
        "url": source.get("url"),
        "source_id": source.get("source_id") or source.get("source_register_id"),
        "publisher": source.get("publisher"),
        "locator": source.get("locator"),
        "accessed_on": source.get("access_date"),
        "role": role,
    }


def first_nonempty(*values: Any) -> Any:
    for value in values:
        if value not in (None, "", [], {}):
            return value
    return None


def fill_missing(target: dict[str, Any], key: str, value: Any) -> bool:
    if value in (None, "", [], {}):
        return False
    if target.get(key) not in (None, "", [], {}):
        return False
    target[key] = value
    return True


def merge_links(target: dict[str, Any], task: dict[str, Any]) -> int:
    links = target.setdefault("learning_links", [])
    before = len(links)
    for role, key in (("official_item_or_task_source", "official_source"),
                      ("independent_explanatory_source", "explanatory_source"),
                      ("free_task_specific_learning_resource", "free_learning_resource")):
        source = task.get(key)
        if not isinstance(source, dict) or not source.get("url"):
            continue
        entry = link_entry(source, role)
        if not any(existing.get("url") == entry["url"] and existing.get("role") == role
                   for existing in links if isinstance(existing, dict)):
            links.append(entry)
    return len(links) - before


def typed_relationships(task: dict[str, Any]) -> list[dict[str, Any]]:
    rows = []
    for relation_type, field in (("complements", "complements"), ("alternative_to", "valid_alternatives")):
        for label in task.get(field, []) or []:
            rows.append({
                "type": relation_type,
                "target_label": label,
                "target_id": None,
                "status": "candidate_target_identity_needs_crosswalk",
                "source_artifact": TASK_SET_PATH.relative_to(ROOT).as_posix(),
            })
    return rows


def main() -> None:
    contract = load(CONTRACT_PATH)
    task_package = load(TASK_SET_PATH)
    tool_tasks = {str(row.get("id")): row for row in task_package.get("tool_task_sets", [])}
    existing = {str(row.get("id")): row for row in contract.get("existing_inventory", [])}
    deep = {str(row.get("id")): row for row in contract.get("deep_search_options", [])}
    duplicates = contract.get("review_coverage", {}).get("exact_duplicate_resolution", {}).get(
        "deep_search_duplicates_of_existing_inventory", [])
    duplicate_targets = {str(row.get("deep_search_id")): str(row.get("existing_inventory_id"))
                         for row in duplicates}
    changes = {"matched_tool_task_sets": 0, "domain_items_enriched": 0,
               "deep_search_aliases_marked": 0, "learning_links_added": 0}

    for task_id, task in tool_tasks.items():
        deep_record = deep.get(task_id)
        if not deep_record:
            continue
        changes["matched_tool_task_sets"] += 1
        canonical_id = duplicate_targets.get(task_id)
        target = existing.get(canonical_id) if canonical_id else deep_record
        if not target:
            continue

        values = {
            "meaning": task.get("what_it_is"),
            "use_case": task.get("domain_use"),
            "output": task.get("output"),
            "prerequisites": task.get("prerequisites"),
            "alternatives": task.get("valid_alternatives"),
            "limits": task.get("cannot_prove_or_replace"),
            "skills_knowledge_methods_competencies": task.get("skills_knowledge_methods_competencies"),
            "domain_context": task.get("domain_use"),
            "area_context": task.get("area_use_case"),
            "role_context": task.get("role_use_case"),
            "task": task.get("task"),
            "complements": task.get("complements"),
            "certification_context": task.get("certification"),
            "global_context": task.get("global_context"),
            "nigeria_context": task.get("nigeria_context"),
        }
        changed = False
        for key, value in values.items():
            changed |= fill_missing(target, key, value)

        relations = target.setdefault("relationships", [])
        for candidate in typed_relationships(task):
            if not any(r.get("type") == candidate["type"] and
                       r.get("target_label") == candidate["target_label"] for r in relations
                       if isinstance(r, dict)):
                relations.append(candidate)
                changed = True

        target["tool_task_set_lineage"] = {
            "record_id": task_id,
            "source_artifact": TASK_SET_PATH.relative_to(ROOT).as_posix(),
            "source_task_status": task.get("status"),
            "source_item_disposition": task.get("disposition"),
            "claim_review_state": "candidate_only_not_independently_approved",
        }
        changes["learning_links_added"] += merge_links(target, task)
        if changed:
            changes["domain_items_enriched"] += 1

        if canonical_id:
            deep_record["duplicate_of_existing_id"] = canonical_id
            deep_record["overlap_state"] = "exact_tool_identity_alias_not_a_separate_learning_card"
            deep_record["graph_record_policy"] = "retain_lineage_as_alias; do_not_emit_duplicate_item_node"
            deep_record["canonical_target_id"] = canonical_id
            changes["deep_search_aliases_marked"] += 1
        else:
            deep_record["candidate_layer"] = task.get("disposition")
            deep_record["graph_record_policy"] = "distinct_domain_tool_candidate; remains hidden pending content_and_evidence_gates"

    contract.setdefault("reconciliation_notes", []).append({
        "date": "2026-10-10",
        "source": TASK_SET_PATH.relative_to(ROOT).as_posix(),
        "scope": "Ten domain tool-task records crosswalked to deep-search candidates; six exact repeats enrich existing tool items and remain aliases; four distinct tools retain candidate records.",
        "guardrail": "No canonical promotion, student visibility, role-fit reassessment, or learning-graph rebuild. Complement/alternative labels are preserved as target-identity-pending relations until crosswalked.",
        "changes": changes,
    })
    contract["review_coverage"]["exact_duplicate_resolution"]["deep_search_tool_task_set_merge"] = {
        "tool_task_sets_crosswalked": changes["matched_tool_task_sets"],
        "exact_duplicate_aliases": changes["deep_search_aliases_marked"],
        "distinct_tool_candidates": changes["matched_tool_task_sets"] - changes["deep_search_aliases_marked"],
        "deep_search_content_merged_to_domain_items": changes["domain_items_enriched"],
        "learning_links_added": changes["learning_links_added"],
        "target_identity_for_relationship_labels": "pending",
        "student_display_approved": False,
        "final_graph_rebuilt": False,
    }
    CONTRACT_PATH.write_text(json.dumps(contract, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(changes, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
