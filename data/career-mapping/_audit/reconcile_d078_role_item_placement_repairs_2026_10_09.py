"""Normalize and reconcile the three D078 placement-repair handoffs.

This produces review-only audit artifacts. It does not modify canonical data or
approve student display.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
INPUTS = [
    ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_PLACEMENT_REPAIR_001-058_2026_10_09.json",
    ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_PLACEMENT_REPAIR_059-116_2026_10_09.json",
    ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_PLACEMENT_REPAIR_117-173_2026_10_09.json",
]
OUTPUT = ROOT / "data/career-mapping/_audit/D078_ROLE_ITEM_PLACEMENT_RECONCILIATION_2026_10_09.json"
REPORT = ROOT / "docs/manual-review/D078_ROLE_ITEM_PLACEMENT_RECONCILIATION_2026_10_09.md"


def first(record: dict[str, Any], *names: str) -> Any:
    for name in names:
        value = record.get(name)
        if value is not None and value != "":
            return value
    return None


def list_value(value: Any) -> list[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return [item for item in value if item not in (None, "")]
    return [value]


def normalize(record: dict[str, Any], source: Path) -> dict[str, Any]:
    placement = first(record, "placement_decision", "placement") or "hidden_review_required"
    unresolved = list_value(record.get("unresolved_reasons"))
    approval = bool(record.get("student_display_approved")) or bool(record.get("checkpoint_placement_approved")) or bool(record.get("approval"))
    return {
        "queue_position": record.get("queue_position"),
        "pair_key": first(record, "pair_key", "pair"),
        "label": record.get("label"),
        "priority_snapshot": record.get("priority_snapshot"),
        "roles_snapshot": list_value(record.get("roles_snapshot")) or ([record.get("role")] if record.get("role") else []),
        "role_task_basis": first(record, "role_task_basis"),
        "task_output": first(record, "task_output_rationale", "task_output", "role_application"),
        "plain_language_meaning": first(record, "plain_language_meaning", "item_meaning"),
        "programme_meaning": record.get("programme_meaning"),
        "domain_meaning": record.get("domain_meaning"),
        "area_meaning": record.get("area_meaning"),
        "role_application": record.get("role_application"),
        "placement_decision": placement,
        "candidate_layer_if_revalidated": record.get("candidate_layer_if_revalidated"),
        "category_rationale": record.get("category_rationale"),
        "prerequisites": list_value(record.get("prerequisites")),
        "complements": list_value(record.get("complements")),
        "valid_alternatives": list_value(first(record, "valid_alternatives", "alternatives")),
        "limits_nonreplacement": list_value(first(record, "limits_nonreplacement", "limits")),
        "evidence": list_value(first(record, "evidence", "authoritative_evidence")),
        "nigeria_context": record.get("nigeria_context"),
        "learning_link": record.get("learning_link"),
        "unresolved_reasons": unresolved,
        "source_locators": list_value(record.get("source_locators")),
        "source_repair_artifact": str(source.relative_to(ROOT)).replace("\\", "/"),
        "state": "repaired_hidden_review_required",
        "role_task_relationship_verified": bool(record.get("role_task_relationship_verified")),
        "checkpoint_placement_approved": False,
        "student_display_approved": False,
        "source_approval_rejected": approval,
    }


def main() -> None:
    normalized: list[dict[str, Any]] = []
    for source in INPUTS:
        payload = json.loads(source.read_text(encoding="utf-8"))
        normalized.extend(normalize(record, source) for record in payload["records"])

    positions = [record["queue_position"] for record in normalized]
    expected = set(range(1, 174))
    counts = Counter(positions)
    duplicates = sorted(position for position, count in counts.items() if count > 1)
    missing = sorted(expected - set(positions))
    if len(normalized) != 173 or duplicates or missing:
        raise SystemExit(f"coverage gate failed: records={len(normalized)} duplicates={duplicates} missing={missing}")
    if any(record["source_approval_rejected"] for record in normalized):
        raise SystemExit("approval gate failed: a repair artifact contains an approval=true flag")

    normalized.sort(key=lambda record: record["queue_position"])
    unresolved_count = sum(bool(record["unresolved_reasons"]) for record in normalized)
    link_gap_count = sum(not isinstance(record["learning_link"], dict) or not record["learning_link"].get("url") for record in normalized)
    placement_counts = Counter(record["placement_decision"] for record in normalized)
    output = {
        "schema_version": "2026-10-09.d078.role-item-placement-reconciliation.v1",
        "status": "reconciled_review_only",
        "domain_id": "D078",
        "source_artifacts": [str(path.relative_to(ROOT)).replace("\\", "/") for path in INPUTS],
        "coverage": {
            "records": len(normalized),
            "unique_positions": len(set(positions)),
            "duplicates": duplicates,
            "missing_positions": missing,
            "unresolved_reason_records": unresolved_count,
            "learning_link_gaps": link_gap_count,
            "student_display_approved": 0,
            "canonical_promotions": 0,
        },
        "placement_counts": dict(sorted(placement_counts.items())),
        "records": normalized,
    }
    OUTPUT.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    REPORT.write_text(
        "\n".join(
            [
                "# D078 placement reconciliation — 2026-10-09",
                "",
                "This is a local normalized reconciliation artifact. It is not canonical and does not approve student display.",
                "",
                f"- Repaired records reconciled: **{len(normalized)}**",
                f"- Unique queue positions: **{len(set(positions))}**",
                f"- Missing/duplicate positions: **{len(missing)}/{len(duplicates)}**",
                f"- Records with unresolved reasons: **{unresolved_count}**",
                f"- Learning-link gaps requiring follow-up: **{link_gap_count}**",
                "- Student-approved records: **0**",
                "- Canonical promotions: **0**",
                "",
                "All records remain hidden/review-required until a later approval gate. Unresolved reasons are retained rather than silently treated as resolved.",
                "",
            ]
        ),
        encoding="utf-8",
    )
    print(json.dumps(output["coverage"], sort_keys=True))


if __name__ == "__main__":
    main()
