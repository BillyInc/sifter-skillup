"""Rebuild the exact remaining D097-D168 parent-domain-fit queue.

This is an audit-only transport artifact builder. It never edits canonical
domain, subgroup, or role mapping data.
"""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path


LANE_DIR = Path(__file__).resolve().parent
SOURCE_QUEUE = LANE_DIR / "D085_D168_role_fit_queue_2026_10_05.json"
OUT_JSON = LANE_DIR / "D152_D168_exact_role_fit_residual_2026_10_05.json"
OUT_MD = LANE_DIR / "D152_D168_exact_role_fit_residual_2026_10_05.md"
EXCLUDED_DOMAIN = "D119"
FIRST_DOMAIN = 97
LAST_DOMAIN = 168


def main() -> None:
    source = json.loads(SOURCE_QUEUE.read_text(encoding="utf-8"))
    target_rows = [
        row for row in source["unresolved_rows"]
        if FIRST_DOMAIN <= int(row["domain_id"][1:]) <= LAST_DOMAIN
        and row["domain_id"] != EXCLUDED_DOMAIN
    ]
    target_by_key = {row["role_key"]: row for row in target_rows}
    if len(target_by_key) != len(target_rows):
        raise SystemExit("The source queue contains duplicate exact role keys.")

    reviewed: dict[str, set[str]] = defaultdict(set)
    for path in LANE_DIR.glob("D[0-9][0-9][0-9]_role_domain_fit_review_2026_10_05.json"):
        review = json.loads(path.read_text(encoding="utf-8"))
        domain_id = review["domain_id"]
        if domain_id == EXCLUDED_DOMAIN:
            raise SystemExit("D119 is excluded and must not be counted as reviewed here.")
        if not FIRST_DOMAIN <= int(domain_id[1:]) <= LAST_DOMAIN:
            continue
        keys = {decision["role_key"] for decision in review["decisions"]}
        if len(keys) != len(review["decisions"]):
            raise SystemExit(f"Duplicate decision keys in {path.name}.")
        expected_for_domain = {
            key for key, row in target_by_key.items() if row["domain_id"] == domain_id
        }
        if keys != expected_for_domain:
            raise SystemExit(
                f"{path.name} does not exactly match its queued domain keys; "
                "refusing to silently skip or double-count records."
            )
        reviewed[domain_id].update(keys)

    residual = [
        row for row in target_rows
        if row["role_key"] not in reviewed[row["domain_id"]]
    ]
    if any(row["domain_id"] == EXCLUDED_DOMAIN for row in residual):
        raise SystemExit("D119 leaked into the residual queue.")

    by_domain: dict[str, list[dict]] = defaultdict(list)
    for row in residual:
        by_domain[row["domain_id"]].append(row)
    result = {
        "schema_version": "1.0",
        "purpose": "Exact-key residual queue for parent-domain fit review; not a canonical mapping seed.",
        "source_queue": SOURCE_QUEUE.name,
        "assigned_domain_range": f"D{FIRST_DOMAIN:03d}-D{LAST_DOMAIN:03d}",
        "excluded_domain": EXCLUDED_DOMAIN,
        "completed_reports_are_not_repeated": True,
        "target_mappings": len(target_rows),
        "reviewed_mappings": len(target_rows) - len(residual),
        "remaining_mappings": len(residual),
        "remaining_domains": [
            {"domain_id": domain_id, "domain_name": rows[0]["domain_name"],
             "remaining": len(rows), "role_keys": [row["role_key"] for row in rows]}
            for domain_id, rows in sorted(by_domain.items())
        ],
        "unresolved_rows": residual,
    }
    OUT_JSON.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Exact residual parent-domain fit queue: D152-D168",
        "",
        f"Rebuilt from `{SOURCE_QUEUE.name}` and exact-key-validated existing review reports.",
        "D119 is explicitly excluded. Completed role keys are not repeated. This is an audit queue, not canonical data.",
        "",
        f"- Assigned range: D{FIRST_DOMAIN:03d}-D{LAST_DOMAIN:03d}, excluding {EXCLUDED_DOMAIN}",
        f"- Total target mappings: {len(target_rows)}",
        f"- Exact-key reviewed: {len(target_rows) - len(residual)}",
        f"- Residual mappings: {len(residual)}",
        "",
        "| Domain | Name | Remaining exact keys | Count |",
        "|---|---|---|---:|",
    ]
    for item in result["remaining_domains"]:
        lines.append(
            f"| {item['domain_id']} | {item['domain_name']} | "
            f"{', '.join(f'`{key}`' for key in item['role_keys'])} | {item['remaining']} |"
        )
    if not residual:
        lines.extend(["", "No residual role keys remain."])
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({k: result[k] for k in (
        "target_mappings", "reviewed_mappings", "remaining_mappings", "remaining_domains"
    )}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
