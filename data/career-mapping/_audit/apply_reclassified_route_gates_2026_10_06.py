"""Gate reclassified role links whose target has no supported subgroup route.

The parent-domain reclassification is retained, but a role must not be seeded
through a nonexistent ``(domain, ISCO sub-major)`` subgroup.  This append-only
repair excludes only the affected target path and leaves the role/source record
available for the semantic specialization decision.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
CONTRACT_REPORT = AUDIT / "subgroup_role_contract_repairs_2026_10_03.json"
ROLE_LIBRARY = ROOT / "role_library_v3_cleaned.json"
OVERLAYS = (ROOT / "emerging_role_overlays.json", ROOT / "thin_domain_role_overlays.json")
REPORT = AUDIT / "reclassified_role_route_gates_2026_10_06.json"
REPORT_MD = AUDIT / "reclassified_role_route_gates_2026_10_06.md"


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write(path: Path, value: object):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def rows_for(document):
    return document if isinstance(document, list) else document.get("roles") or []


def main():
    contract = read(CONTRACT_REPORT)
    errors = contract.get("role_path_errors") or []
    target_keys = {str(item.get("role_key")) for item in errors if item.get("role_key")}
    changes = []
    changed_files = []
    for path in (ROLE_LIBRARY,) + OVERLAYS:
        document = read(path)
        changed = False
        for row in rows_for(document):
            key = f"{row.get('domain_id')}|{row.get('role_name')}"
            if key not in target_keys:
                continue
            if row.get("role_domain_reconciliation_status") != "reclassified_in":
                raise ValueError(f"Route error is not an added reclassification: {key}")
            reason = (
                "Parent-domain reclassification is source-backed, but the target domain has no "
                "supported subgroup record for this role's current occupational code. Exclude "
                "the target student path until the area-of-specialization audit establishes a "
                "defensible subgroup route; do not invent a subgroup from the code alone."
            )
            row["student_path_status"] = "excluded"
            row["student_path_exclusion_reason"] = reason
            row["role_domain_reconciliation_status"] = "reclassified_in_route_pending"
            row["role_domain_reconciliation_route_review"] = "required"
            row["role_domain_reconciliation_route_review_date"] = "2026-10-06"
            changes.append({"role_key": key, "source_file": str(path.relative_to(ROOT)), "error": next(item for item in errors if item.get("role_key") == key)})
            changed = True
        if changed:
            write(path, document)
            changed_files.append(str(path.relative_to(ROOT)))
    report = {
        "schema_version": "2026-10-06.reclassified-role-route-gates.v1",
        "input_contract_report": str(CONTRACT_REPORT.relative_to(ROOT)),
        "gated_route_count": len(changes),
        "changed_files": changed_files,
        "changes": changes,
        "policy": "A supported parent-domain reclassification is not exposed unless the target domain has a valid subgroup route. No subgroup or role is invented to silence a foreign-key/path error.",
    }
    write(REPORT, report)
    REPORT_MD.write_text(
        "\n".join([
            "# Reclassified role route gates — 2026-10-06",
            "",
            f"The parent-domain reconciliation produced **{len(changes)}** target links whose target domain has no supported subgroup for the role's current occupational code.",
            "",
            "Those parent links remain in the source catalogue but are excluded from student output until the separate specialization audit establishes a defensible area-of-specialization route. No subgroup was invented from ISCO membership.",
            "",
            "No SQL or live deployment was performed.",
        ]) + "\n",
        encoding="utf-8",
    )
    print(json.dumps({"gated_route_count": len(changes), "changed_files": changed_files}, indent=2))


if __name__ == "__main__":
    main()
