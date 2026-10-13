"""Complete review markers for rows already resolved by prior role-domain gates."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
SOURCE_FILES = (
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
)
REPORT = AUDIT / "existing_role_domain_review_metadata_completion_2026_10_07.json"
REPORT_MD = AUDIT / "EXISTING_ROLE_DOMAIN_REVIEW_METADATA_COMPLETION_2026_10_07.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def main() -> None:
    containers: dict[Path, Any] = {}
    changes: list[dict[str, Any]] = []
    action_counts: Counter[str] = Counter()
    for path in SOURCE_FILES:
        payload = load(path)
        rows = payload if isinstance(payload, list) else payload.get("roles", [])
        containers[path] = payload
        for row in rows:
            if row.get("role_domain_lane_review_status"):
                continue
            status = str(row.get("domain_fit_review_status") or "").casefold()
            if status not in {"supported", "conditional", "unsupported", "unresolved"}:
                continue
            marker = f"reviewed_{status}"
            before = {
                "role_domain_lane_review_status": row.get("role_domain_lane_review_status"),
                "role_domain_lane_review_date": row.get("role_domain_lane_review_date"),
            }
            row["role_domain_lane_review_status"] = marker
            row["role_domain_lane_review_date"] = "2026-10-07"
            row["role_domain_lane_review_sources"] = [
                "existing canonical role-domain reconciliation metadata",
            ]
            changes.append({
                "role_key": f"{row.get('domain_id')}|{row.get('role_name')}",
                "source_file": str(path.relative_to(ROOT)),
                "status": status,
                "student_path_status": row.get("student_path_status"),
                "role_domain_reconciliation_status": row.get("role_domain_reconciliation_status"),
                "before": before,
                "after": {
                    "role_domain_lane_review_status": row.get("role_domain_lane_review_status"),
                    "role_domain_lane_review_date": row.get("role_domain_lane_review_date"),
                },
            })
            action_counts[marker] += 1

    for path, payload in containers.items():
        write(path, payload)
    report = {
        "schema_version": "2026-10-07.existing-role-domain-review-metadata.v1",
        "scope": "Metadata completion only; no role path activation, deletion, or new mapping.",
        "changed_rows": len(changes),
        "action_counts": dict(action_counts),
        "changes": changes,
        "guards": {
            "role_added": False,
            "role_deleted": False,
            "student_path_reactivated": False,
            "domain_or_subgroup_taxonomy_edited": False,
        },
    }
    write(REPORT, report)
    REPORT_MD.write_text(
        "\n".join([
            "# Existing role-domain review metadata completion — 2026-10-07",
            "",
            f"Completed review markers for **{len(changes)}** rows that already had a source-backed domain-fit status.",
            "",
            f"Action counts: `{json.dumps(dict(action_counts), sort_keys=True)}`.",
            "",
            "This was metadata completion only. Existing active/excluded states and prior reclassification gates were preserved.",
        ]) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"changed_rows": len(changes), "action_counts": dict(action_counts), "report": str(REPORT)}, indent=2))


if __name__ == "__main__":
    main()
