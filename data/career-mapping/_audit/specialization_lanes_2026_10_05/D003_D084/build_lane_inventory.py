"""Build a deterministic, read-only inventory for the D003-D084 specialization lane."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[5]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
INVENTORY = AUDIT / "domain_subgroup_role_taxonomy_inventory_2026_10_03.json"
REVIEW = AUDIT / "domain_specialization_review_2026_10_03.json"
OUT = Path(__file__).resolve().parent


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def build_lane(inventory: dict, review: dict, start: int = 3, end: int = 84) -> dict:
    reviewed = {row["domain_id"]: row for row in review.get("domain_reviews", [])}
    rows = []
    for domain in inventory.get("domains", []):
        number = int(domain["domain_id"][1:])
        if not start <= number <= end:
            continue
        prior = reviewed.get(domain["domain_id"], {})
        rows.append(
            {
                "domain_id": domain["domain_id"],
                "domain_name": domain.get("domain_name"),
                "active_role_count": domain.get("active_role_count", 0),
                "visible_subgroup_count": domain.get("visible_subgroup_count", 0),
                "subgroup_record_count": len(domain.get("all_subgroup_records", [])),
                "specialization_set_review_status": domain.get(
                    "specialization_set_review_status", "not_recorded"
                ),
                "subgroup_structure_disposition": domain.get(
                    "subgroup_structure_disposition"
                ),
                "existing_review_status": prior.get("review_status"),
                "existing_review_recommendation_count": prior.get(
                    "specialization_count"
                ),
            }
        )
    rows.sort(key=lambda row: int(row["domain_id"][1:]))
    return {
        "schema_version": "2026-10-05.specialization-lane-inventory.v1",
        "lane": {"first_domain_number": start, "last_domain_number": end},
        "source_inventory": str(INVENTORY.relative_to(ROOT)).replace("\\", "/"),
        "existing_review_register": str(REVIEW.relative_to(ROOT)).replace("\\", "/"),
        "counts": {
            "domains_in_lane": len(rows),
            "domains_with_existing_source_review": sum(
                bool(row["existing_review_status"]) for row in rows
            ),
            "domains_without_existing_source_review": sum(
                not bool(row["existing_review_status"]) for row in rows
            ),
            "domains_with_zero_visible_subgroups": sum(
                row["visible_subgroup_count"] == 0 for row in rows
            ),
        },
        "domains": rows,
    }


def render_markdown(data: dict) -> str:
    counts = data["counts"]
    lines = [
        "# Specialization audit lane inventory: D003-D084",
        "",
        "Generated read-only from the checked-in taxonomy inventory and prior source-review register.",
        "It is a triage baseline, not evidence that a specialization set is correct.",
        "",
        f"- Domains in lane: {counts['domains_in_lane']}",
        f"- Already source-reviewed in prior register: {counts['domains_with_existing_source_review']}",
        f"- Still requiring lane review: {counts['domains_without_existing_source_review']}",
        f"- With zero visible subgroup cards: {counts['domains_with_zero_visible_subgroups']}",
        "",
        "| Domain | Active roles (inventory only) | Current visible subgroups | Prior review | Disposition to verify |",
        "|---|---:|---:|---|---|",
    ]
    for row in data["domains"]:
        lines.append(
            f"| {row['domain_id']} {row['domain_name']} | {row['active_role_count']} | "
            f"{row['visible_subgroup_count']} | {row['existing_review_status'] or 'none'} | "
            f"{row['subgroup_structure_disposition'] or 'not recorded'} |"
        )
    lines += [
        "",
        "Role totals and existing subgroup memberships are inventory context only; they must not determine the specialization set or count.",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    data = build_lane(load_json(INVENTORY), load_json(REVIEW))
    (OUT / "D003_D084_inventory.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    (OUT / "D003_D084_inventory.md").write_text(
        render_markdown(data), encoding="utf-8"
    )
    print(json.dumps(data["counts"], indent=2))


if __name__ == "__main__":
    main()
