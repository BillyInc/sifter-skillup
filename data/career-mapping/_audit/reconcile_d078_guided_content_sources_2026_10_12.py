"""Reconcile reviewed D078 content contracts with disjoint area source ledgers.

This is a deterministic merge, not a student-approval or role-fit decision.
It ensures area evidence and learning-resource research are attached to the
same stable item identity before local item-by-item promotion review.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
CONTRACT_PATH = ROOT / "data/career-mapping/_audit/D078_DOMAIN_AREA_CONTENT_CONTRACT_CLOSURE_2026_10_10.json"
A05_A06_PATH = ROOT / "docs/manual-review/D078_AREA_RESOURCE_REPAIR_A05_A06_2026_10_12.json"
A07_PATH = ROOT / "docs/manual-review/D078_AREA_RESOURCE_REPAIR_A07_2026_10_12.json"
DEFAULT_OUTPUT = ROOT / "data/career-mapping/_audit/D078_GUIDED_CONTENT_SOURCE_RECONCILIATION_2026_10_12.json"
AREA_IDS = {
    "D078:sociology-social-anthropology",
    "D078:economics-applied-analysis",
    "D078:politics-governance-public-policy",
    "D078:psychology-social-behaviour",
    "D078:human-geography-population",
    "D078:social-research-evaluation",
    "D078:computational-digital-social-science",
}


def _read(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def _write(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _norm(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip().casefold()


def _to_source(source: dict[str, Any], *, evidence_use: str) -> dict[str, Any]:
    return {
        "source_id": source["source_id"],
        "publisher": source.get("publisher"),
        "title": source.get("title"),
        "url": source.get("url"),
        "locator": source.get("exact_locator"),
        "accessed": source.get("accessed_on"),
        "access_cost": source.get("access_cost"),
        "evidence_use": evidence_use,
        "limits": source.get("scope_limit"),
    }


def _resource_from_source(source: dict[str, Any], *, item_finding: str) -> dict[str, Any]:
    return {
        "source_id": source["source_id"],
        "title": source.get("title"),
        "publisher": source.get("publisher"),
        "url": source.get("url"),
        "locator": source.get("exact_locator"),
        "what_it_teaches": item_finding,
        "accessed": source.get("accessed_on"),
        "access_cost": source.get("access_cost"),
        "limits": source.get("scope_limit"),
    }


def _merge_area_repair_a05_a06(contract_rows: list[dict[str, Any]], ledger: dict[str, Any]) -> int:
    by_identity: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for row in contract_rows:
        by_identity.setdefault((row.get("area_id", ""), _norm(row.get("label", ""))), []).append(row)
    sources = {source["source_id"]: source for source in ledger.get("source_registry", [])}
    if len(sources) != len(ledger.get("source_registry", [])):
        raise ValueError("A05/A06 source registry contains duplicate source IDs")
    merged = 0
    for repair in ledger.get("records", []):
        matches = by_identity.get((repair.get("area_id", ""), _norm(repair.get("label", ""))), [])
        if len(matches) != 1:
            raise ValueError(f"A05/A06 item does not resolve uniquely: {repair.get('item_id')}")
        target = matches[0]
        closure = target["closure"]
        missing_sources = set(repair.get("evidence_source_ids", [])) | set(repair.get("free_learning_source_ids", []))
        absent = missing_sources - sources.keys()
        if absent:
            raise ValueError(f"A05/A06 registry misses source IDs for {repair.get('item_id')}: {sorted(absent)}")

        evidence_by_id = {s.get("source_id"): s for s in closure.get("evidence_sources", [])}
        for source_id in repair.get("evidence_source_ids", []):
            evidence_by_id.setdefault(source_id, _to_source(sources[source_id], evidence_use=repair.get("source_check_finding", "")))
        learning_by_id = {s.get("source_id"): s for s in closure.get("free_task_specific_learning_resources", [])}
        for source_id in repair.get("free_learning_source_ids", []):
            learning_by_id.setdefault(source_id, _resource_from_source(sources[source_id], item_finding=repair.get("source_check_finding", "")))
        closure["evidence_sources"] = list(evidence_by_id.values())
        closure["evidence_source_ids"] = list(dict.fromkeys([*closure.get("evidence_source_ids", []), *repair.get("evidence_source_ids", [])]))
        closure["free_task_specific_learning_resources"] = list(learning_by_id.values())
        closure["free_task_specific_learning_resource_ids"] = list(dict.fromkeys([*closure.get("free_task_specific_learning_resource_ids", []), *repair.get("free_learning_source_ids", [])]))
        closure.setdefault("supplemental_research", []).append({
            "ledger_id": ledger.get("artifact_id"),
            "source_check_finding": repair.get("source_check_finding"),
            "item_limit": repair.get("item_limit"),
        })
        merged += 1
    return merged


def _merge_area_repair_a07(contract_rows: list[dict[str, Any]], ledger: dict[str, Any]) -> int:
    by_id = {row.get("node_id"): row for row in contract_rows}
    if len(by_id) != len(contract_rows):
        raise ValueError("Area content contract contains duplicate node IDs")
    merged = 0
    for repair in ledger.get("records", []):
        target = by_id.get(repair.get("id"))
        if not target:
            raise ValueError(f"A07 item identity does not resolve: {repair.get('id')}")
        closure = target["closure"]
        # Preserve the detailed contract sources; the agent ledger only fills
        # absent evidence/resource arrays and adds its explicit unresolved notes.
        if not closure.get("evidence_sources"):
            closure["evidence_sources"] = copy.deepcopy(repair.get("evidence_sources", []))
            closure["evidence_source_ids"] = [row.get("source_id") for row in closure["evidence_sources"] if row.get("source_id")]
        if not closure.get("free_task_specific_learning_resources"):
            closure["free_task_specific_learning_resources"] = copy.deepcopy(repair.get("free_task_specific_learning_resources", []))
            closure["free_task_specific_learning_resource_ids"] = [row.get("source_id") for row in closure["free_task_specific_learning_resources"] if row.get("source_id")]
        closure.setdefault("supplemental_research", []).append({
            "ledger_id": ledger.get("artifact_id"),
            "scope": ledger.get("scope"),
            "unresolved": copy.deepcopy(repair.get("unresolved", [])),
        })
        merged += 1
    return merged


def _resource_url(resource: dict[str, Any]) -> bool:
    url = str(resource.get("url") or "")
    return bool(re.match(r"^https://[^\s]+$", url, re.IGNORECASE))


def _item_readiness(row: dict[str, Any], *, domain: bool) -> tuple[str, list[str]]:
    closure = row.get("closure", {})
    missing: list[str] = []
    if domain:
        required_text = ("meaning", "learner_output")
        if not closure.get("evidence"):
            missing.append("evidence_locators")
        if not closure.get("learning_links"):
            missing.append("task_specific_learning_link")
        if not closure.get("category_rationale"):
            missing.append("placement_rationale")
    else:
        required_text = ("what_it_is", "meaning_in_D078_and_area", "task_use_and_output")
        if not closure.get("evidence_sources"):
            missing.append("item_evidence")
        if not closure.get("free_task_specific_learning_resources"):
            missing.append("task_specific_learning_link")
        if closure.get("source_identity_status") != "resolved":
            missing.append("source_identity")
        if closure.get("unresolved_source_ids"):
            missing.append("unresolved_source_ids")
        if row.get("area_id") not in AREA_IDS:
            missing.append("current_area_ownership")
    for field in required_text:
        if not str(closure.get(field) or "").strip():
            missing.append(field)
    resources = closure.get("learning_links", []) if domain else closure.get("free_task_specific_learning_resources", [])
    if resources and not any(_resource_url(resource) for resource in resources):
        missing.append("https_learning_url")
    learner_output = closure.get("learner_output")
    if (
        not domain
        and isinstance(learner_output, dict)
        and learner_output.get("state") == "not_established_for_this_candidate"
    ):
        # This is an explicit non-claim, not a blocker; the UI may omit a
        # distinct occupational deliverable while retaining the sourced task.
        pass
    if missing:
        return "specific_gap_remains", missing
    return "ready_for_individual_local_promotion_decision", []


def build(output: Path = DEFAULT_OUTPUT) -> dict[str, Any]:
    contract = _read(CONTRACT_PATH)
    domain_rows = copy.deepcopy(contract.get("domain_records", []))
    area_rows = copy.deepcopy(contract.get("area_records", []))
    merged_a05_a06 = _merge_area_repair_a05_a06(area_rows, _read(A05_A06_PATH))
    merged_a07 = _merge_area_repair_a07(area_rows, _read(A07_PATH))

    for row in domain_rows:
        row["local_readiness"], row["specific_gaps"] = _item_readiness(row, domain=True)
        row["promotion_decision"] = "pending_local_item_decision"
    for row in area_rows:
        row["local_readiness"], row["specific_gaps"] = _item_readiness(row, domain=False)
        row["promotion_decision"] = "pending_local_item_decision"

    readiness = {
        "domain": {state: sum(row["local_readiness"] == state for row in domain_rows) for state in {r["local_readiness"] for r in domain_rows}},
        "area": {state: sum(row["local_readiness"] == state for row in area_rows) for state in {r["local_readiness"] for r in area_rows}},
    }
    result = {
        "artifact_type": "d078_guided_learning_content_source_reconciliation",
        "artifact_id": "D078_GUIDED_CONTENT_SOURCE_RECONCILIATION_2026_10_12",
        "reviewed_on": "2026-10-12",
        "source_contract": CONTRACT_PATH.relative_to(ROOT).as_posix(),
        "supplemental_ledgers": [A05_A06_PATH.relative_to(ROOT).as_posix(), A07_PATH.relative_to(ROOT).as_posix()],
        "policy": {
            "visibility_is_item_and_route_specific": True,
            "readiness_is_not_approval": True,
            "explicit_not_established_output_is_not_a_blocker": True,
            "global_evidence_may_support_global_work": True,
            "nigerian_evidence_adds_local_context_but_is_not_a_global_gate": True,
            "no_role_fit_or_subject_matcher_reconciliation": True,
        },
        "counts": {
            "domain_records": len(domain_rows),
            "area_records": len(area_rows),
            "A05_A06_research_records_reconciled": merged_a05_a06,
            "A07_research_records_reconciled": merged_a07,
            "readiness": readiness,
        },
        "domain_records": domain_rows,
        "area_records": area_rows,
        "validation": {
            "unique_area_node_ids": len({row.get("node_id") for row in area_rows}) == len(area_rows),
            "all_area_owners_are_current_catalog_areas": all(row.get("area_id") in AREA_IDS for row in area_rows),
            "no_item_approved_by_this_merge": all(row.get("promotion_decision") == "pending_local_item_decision" for row in [*domain_rows, *area_rows]),
            "readiness_is_not_a_blanket_visibility_gate": True,
        },
    }
    _write(output, result)
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    artifact = build(args.out.resolve())
    print(json.dumps({"output": str(args.out.resolve()), "counts": artifact["counts"], "validation": artifact["validation"]}, indent=2))
