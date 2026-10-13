"""Create an exact-key carry-forward of the completed D001-D084 lane evidence.

The unsupported queue is older than the per-domain lane reports. This artifact
does not reopen those reports or infer destinations; it makes their task/domain
decisions visible to the global unsupported-link lane and records the D077/D080
inventory discrepancy explicitly.
"""
from __future__ import annotations

import json
from collections import Counter
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[5]
LANE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05"
HERE = LANE / "GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06"
DOMAIN_SLICE = LANE / "D001_D084"
QUEUE_PATH = LANE / "GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06/unsupported_exact_key_review_queue_2026_10_06.json"
ROLE_PATH = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
DOMAIN_PATH = ROOT / "data/career-mapping/domain_meta.json"
OUTPUT = HERE / "batch_021_d001_d084_lane_carryforward.json"


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def lane_decisions():
    result = {}
    for path in DOMAIN_SLICE.glob("*.json"):
        if not (
            path.name.endswith("role_domain_fit_2026_10_05.json")
            or path.name.endswith("role_domain_fit_review_2026_10_05.json")
        ):
            continue
        doc = read(path)
        for row in doc.get("decisions", doc.get("role_reviews", [])):
            key = row.get("role_key")
            if key:
                result.setdefault(key, []).append((path, row))
    return result


def main() -> None:
    queue = read(QUEUE_PATH)["queue"]
    roles = {f"{row['domain_id']}|{row['role_name']}": row for row in read(ROLE_PATH)}
    domains = read(DOMAIN_PATH)
    global_keys = {
        row["role_key"]
        for path in HERE.glob("batch_*_recommendations.json")
        for row in read(path)["decisions"]
    }
    lane = lane_decisions()
    active = [
        row
        for row in queue
        if int(row["domain_id"][1:]) <= 84 and row["role_key"] not in global_keys
    ]
    if len(active) != 191:
        raise AssertionError(f"expected 191 active carry-forward keys, found {len(active)}")

    decisions = []
    for queued in active:
        key = queued["role_key"]
        matches = lane.get(key, [])
        if len(matches) != 1:
            raise AssertionError(f"{key}: expected one lane decision, found {len(matches)}")
        artifact_path, source = matches[0]
        if source.get("domain_fit_status") != "unsupported":
            raise AssertionError(f"{key}: lane status is not unsupported")
        role = roles.get(key)
        action = source.get("recommended_action") or "remove_current_parent_domain_link_candidate"
        if role is None:
            normalized = "stale_source_absent_no_active_delta"
            action = "stale_source_absent_no_active_delta; retain_lane_evidence_only"
        else:
            normalized = "remove_link_only" if "remove" in action else "preserve_exclude"
        decisions.append(
            {
                "role_key": key,
                "domain_id": queued["domain_id"],
                "role_name": queued["role_name"],
                "current_key_verified": role is not None,
                "task_evidence": source["task_evidence"],
                "domain_scope_evidence": domains[queued["domain_id"]]["description"],
                "domain_fit_status": "unsupported",
                "lane_recommendation": action,
                "recommendation": normalized,
                "alternative_exact_key": None,
                "rationale": source["basis"],
                "evidence_refs": source["source_refs"],
                "source_limit": source["source_limit"],
                "source_lane_artifact": str(artifact_path.relative_to(ROOT)).replace("\\", "/"),
                "no_destination_inferred": True,
                "canonical_changes_applied": False,
                "role_description_present_in_current_seed": bool(role and role.get("description", "").strip()),
            }
        )

    d077 = {item["role_key"] for item in decisions if item["domain_id"] == "D077"}
    if d077 != {"D077|aircraft marshaller", "D077|game keeper"}:
        raise AssertionError(f"unexpected D077 carry-forward keys: {sorted(d077)}")

    document = {
        "schema_version": "2026-10-06.unsupported-role-link-delta.v2",
        "batch": 21,
        "date": str(date.today()),
        "scope": "D001-D084 unsupported exact keys not yet represented in global batches, carried forward from existing lane-owned role-task/domain-scope decisions.",
        "jurisdiction": "global_only",
        "method": "Reused one exact per-domain lane decision only after verifying the queue key, current role seed key, role task evidence, parent-domain scope, sources and limits. No ISCO/subgroup inference, no title-only inference, no role-to-specialization decisions.",
        "canonical_source": "data/career-mapping/role_library_v3_cleaned.json",
        "previous_review_queue": str(QUEUE_PATH.relative_to(ROOT)).replace("\\", "/"),
        "canonical_changes_applied": False,
        "counts": {
            "decisions": len(decisions),
            "unsupported": sum(item["domain_fit_status"] == "unsupported" for item in decisions),
            "remove_link_only": sum(item["recommendation"] == "remove_link_only" for item in decisions),
            "preserve_exclude": sum(item["recommendation"] == "preserve_exclude" for item in decisions),
            "stale_source_absent_no_active_delta": sum(
                item["recommendation"] == "stale_source_absent_no_active_delta" for item in decisions
            ),
            "by_domain": dict(sorted(Counter(item["domain_id"] for item in decisions).items())),
        },
        "inventory_discrepancies": [
            {
                "domain_id": "D077",
                "state": "two_unsupported_queue_keys_match_saved_lane_report",
                "keys": sorted(d077),
                "action": "carry_forward_existing_task_based_exclusions; do not infer destinations",
            },
            {
                "domain_id": "D080",
                "state": "domain_exists_but_no_active_role_mapping",
                "domain_name": domains["D080"]["domain_name"],
                "current_role_seed_count": sum(row["domain_id"] == "D080" for row in roles.values()),
                "unsupported_queue_count": sum(row["domain_id"] == "D080" for row in queue),
                "action": "hold; no role decision or invented link",
            },
        ],
        "decisions": decisions,
    }
    OUTPUT.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT), "counts": document["counts"], "D080": document["inventory_discrepancies"][1]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
