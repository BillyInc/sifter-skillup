"""Inspect unsupported exact keys against existing lane evidence.

This is an audit helper only. It writes no canonical files and is intentionally
limited to the lane-owned audit directory.
"""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[5]
LANE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05"
QUEUE = LANE / "GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06/unsupported_exact_key_review_queue_2026_10_06.json"
GLOBAL = LANE / "GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06"
DOMAIN_SLICE = LANE / "D001_D084"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    queue = load(QUEUE)["queue"]
    global_keys = {
        row["role_key"]
        for path in GLOBAL.glob("batch_*_recommendations.json")
        for row in load(path)["decisions"]
    }
    lane_by_key = {}
    for path in DOMAIN_SLICE.glob("*.json"):
        if not path.name.endswith("role_domain_fit_2026_10_05.json") and not path.name.endswith(
            "role_domain_fit_review_2026_10_05.json"
        ):
            continue
        doc = load(path)
        for row in doc.get("decisions", doc.get("role_reviews", [])):
            key = row.get("role_key")
            if key:
                lane_by_key.setdefault(key, []).append(
                    {"file": path.name, "status": row.get("domain_fit_status"), "row": row}
                )

    active = [
        row
        for row in queue
        if int(row["domain_id"][1:]) <= 84 and row["role_key"] not in global_keys
    ]
    overlap = [row for row in active if row["role_key"] in lane_by_key]
    no_lane = [row for row in active if row["role_key"] not in lane_by_key]
    print(json.dumps({
        "unsupported_queue_total": len(queue),
        "d001_d084_queue_total": sum(int(row["domain_id"][1:]) <= 84 for row in queue),
        "global_batches_decided_d001_d084": sum(
            int(key.split("|", 1)[0][1:]) <= 84 for key in global_keys
        ),
        "active_after_global_batches": len(active),
        "already_evidenced_in_d001_d084_lane": len(overlap),
        "active_without_lane_artifact": len(no_lane),
        "active_by_domain": dict(sorted(Counter(row["domain_id"] for row in active).items())),
        "without_lane_by_domain": dict(sorted(Counter(row["domain_id"] for row in no_lane).items())),
        "no_lane_keys": [row["role_key"] for row in no_lane],
        "lane_overlap": [
            {
                "role_key": row["role_key"],
                "queue_task": row.get("task_description"),
                "lane_files": [item["file"] for item in lane_by_key[row["role_key"]]],
                "lane_statuses": [item["status"] for item in lane_by_key[row["role_key"]]],
            }
            for row in overlap
        ],
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
