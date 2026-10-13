"""Resolve the final exact role->domain residual holds.

The residual ledger contains broad ``All Other``/umbrella occupations whose
authoritative record supplies no exact task profile.  They cannot be exposed
as supported student paths.  This script resolves only the exact current
parent-domain link as source-absent/unsupported, retains the occupation, and
records the limitation so it is not mistaken for a claim about every possible
job hidden inside the catch-all category.
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
RESIDUAL = (
    AUDIT
    / "role_fit_lanes_2026_10_05"
    / "GLOBAL_CONTINUATION_2026_10_06"
    / "role_domain_fit_dispositions_increment_004.json"
)
SOURCE_FILES = (
    ROOT / "role_library_v3_cleaned.json",
    ROOT / "thin_domain_role_overlays.json",
    ROOT / "emerging_role_overlays.json",
)
REPORT = AUDIT / "residual_role_domain_holds_resolution_2026_10_07.json"
REPORT_MD = AUDIT / "RESIDUAL_ROLE_DOMAIN_HOLDS_RESOLUTION_2026_10_07.md"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def rows_and_container(path: Path) -> tuple[Any, list[dict[str, Any]]]:
    payload = load(path)
    if isinstance(payload, list):
        return payload, payload
    rows = payload.get("roles") if isinstance(payload, dict) else None
    if not isinstance(rows, list):
        raise ValueError(f"Unsupported role source shape: {path}")
    return payload, rows


def role_key(row: dict[str, Any]) -> str:
    return f"{row.get('domain_id')}|{row.get('role_name')}"


def refs(decision: dict[str, Any]) -> list[str]:
    result: list[str] = []
    for item in decision.get("source_refs") or []:
        if isinstance(item, str) and item.strip():
            result.append(item.strip())
        elif isinstance(item, dict) and item.get("url"):
            result.append(str(item["url"]).strip())
    return list(dict.fromkeys(result))


def append_refs(old: Any, additions: list[str]) -> list[str]:
    prior = old if isinstance(old, list) else []
    return list(dict.fromkeys([str(v) for v in prior if str(v).strip()] + additions))


def append_text(old: Any, addition: str) -> str:
    prior = str(old or "").strip()
    return addition if not prior else (prior if addition in prior else f"{prior} {addition}")


def main() -> None:
    residual_doc = load(RESIDUAL)
    residuals = [
        row for row in residual_doc.get("decisions", [])
        if str(row.get("domain_fit_status") or "").casefold() == "unresolved"
    ]
    if len(residuals) != 11:
        raise ValueError(f"Expected 11 unresolved residual decisions, found {len(residuals)}")

    containers: dict[Path, Any] = {}
    locations: dict[str, list[tuple[Path, dict[str, Any]]]] = {}
    for path in SOURCE_FILES:
        payload, rows = rows_and_container(path)
        containers[path] = payload
        for row in rows:
            locations.setdefault(role_key(row), []).append((path, row))

    changes: list[dict[str, Any]] = []
    for decision in residuals:
        key = str(decision["role_key"])
        matches = locations.get(key) or []
        if not matches:
            raise ValueError(f"Residual role key is not present in current sources: {key}")
        basis = (
            "Residual exact-role resolution 2026-10-07: the authoritative source "
            "defines this as a broad residual/umbrella category but supplies no exact "
            "task profile establishing the parent-domain work. The exact parent-domain "
            "path is therefore excluded from student mapping. This is not a claim that "
            "every individual job hidden in the category can never fit the domain."
        )
        for path, row in matches:
            before = {
                "domain_fit_review_status": row.get("domain_fit_review_status"),
                "student_path_status": row.get("student_path_status"),
                "role_domain_lane_review_status": row.get("role_domain_lane_review_status"),
            }
            row["domain_fit_review_status"] = "unsupported"
            row["domain_fit_review_basis"] = append_text(row.get("domain_fit_review_basis"), basis)
            row["domain_fit_review_source_refs"] = append_refs(row.get("domain_fit_review_source_refs"), refs(decision))
            row["student_path_status"] = "excluded"
            row["student_path_exclusion_reason"] = append_text(
                row.get("student_path_exclusion_reason"),
                "Exact parent-domain path resolved as source-absent/unsupported; retain the occupation for provenance and future narrower task evidence.",
            )
            row["role_domain_lane_review_status"] = "resolved_unsupported_source_absent"
            row["role_domain_resolution_disposition"] = "source_absent_exact_task_evidence"
            row["role_domain_lane_review_date"] = "2026-10-07"
            changes.append({
                "role_key": key,
                "source_file": str(path.relative_to(ROOT)),
                "duplicate_current_key": len(matches) > 1,
                "before": before,
                "after": {
                    "domain_fit_review_status": row.get("domain_fit_review_status"),
                    "student_path_status": row.get("student_path_status"),
                    "role_domain_lane_review_status": row.get("role_domain_lane_review_status"),
                    "role_domain_resolution_disposition": row.get("role_domain_resolution_disposition"),
                },
            })

    for path, payload in containers.items():
        write(path, payload)

    report = {
        "schema_version": "2026-10-07.residual-role-domain-resolution.v1",
        "source_ledger": str(RESIDUAL.relative_to(ROOT)),
        "residual_decision_count": len(residuals),
        "current_rows_changed": len(changes),
        "status": "resolved_as_source_absent_unsupported_exact_parent_links",
        "changes": changes,
        "guards": {
            "occupation_records_deleted": False,
            "new_role_inferred": False,
            "subgroup_membership_used_as_fit_proof": False,
            "domain_or_subgroup_taxonomy_edited": False,
            "claim_that_all_catch_all_members_are_unfit": False,
        },
    }
    write(REPORT, report)
    counts = Counter(item["source_file"] for item in changes)
    lines = [
        "# Residual role-to-domain holds — 2026-10-07",
        "",
        "The final 11 residual exact links were resolved conservatively.",
        "",
        f"- Residual decisions: **{len(residuals)}**.",
        f"- Current rows changed: **{len(changes)}**.",
        "- Resolution: `source_absent_exact_task_evidence` → unsupported for the exact parent-domain path.",
        "- The occupation records remain available for provenance and future narrower task evidence.",
        "- No domain or subgroup taxonomy was edited.",
        "",
        "## Source-file changes",
        "",
    ]
    for path, count in sorted(counts.items()):
        lines.append(f"- `{path}`: **{count}**")
    write(REPORT_MD, "\n".join(lines))
    print(json.dumps({
        "residual_decisions": len(residuals),
        "current_rows_changed": len(changes),
        "report": str(REPORT),
    }, indent=2))


if __name__ == "__main__":
    main()
