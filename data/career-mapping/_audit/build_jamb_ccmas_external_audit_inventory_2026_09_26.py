"""Join the JAMB identity/offering and CCMAS/external curriculum inventories."""

from __future__ import annotations

import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
OUT = AUDIT / "jamb_ccmas_external_audit_inventory_2026-09-26.json"
OUT_MD = AUDIT / "jamb_ccmas_external_audit_inventory_2026-09-26.md"


def external_or_unanchored_parts(scope: dict) -> tuple[list[dict], list[str]]:
    """Return selected external rows and explicit custom component refs.

    Custom components must remain visible in the joined inventory even when a
    partial/combined scope has no selected course rows yet.
    """
    custom = [
        row for row in scope.get("selected_courses", [])
        if not row.get("source_ccmas_programme")
    ]
    custom_components = [
        ref for ref in scope.get("component_refs", [])
        if isinstance(ref, str) and ref.startswith("__custom__::")
    ]
    return custom, custom_components


def main() -> None:
    jamb = json.loads((AUDIT / "jamb_anomaly_inventory_2026-09-26.json").read_text(encoding="utf-8"))
    ccmas = json.loads((AUDIT / "ccmas_extraction_anomaly_inventory_2026-09-26.json").read_text(encoding="utf-8"))
    scopes = json.loads((AUDIT / "jamb_curriculum_scopes_2026-08-17.json").read_text(encoding="utf-8"))["rows"]
    by_name = {row["jamb_name"]: row for row in jamb["rows"]}
    external_or_unanchored = []
    for scope in scopes:
        custom, custom_components = external_or_unanchored_parts(scope)
        if custom or custom_components or not scope.get("component_refs"):
            external_or_unanchored.append(
                {
                    "jamb_name": scope["jamb_name"],
                    "scope_status": scope.get("scope_status"),
                    "component_refs": scope.get("component_refs", []),
                    "custom_component_refs": custom_components,
                    "custom_or_unanchored_course_count": len(custom),
                    "custom_or_unanchored_courses": [
                        {"code": row.get("code"), "title": row.get("title"), "source_url": row.get("source_url"), "source_locator": row.get("source_locator")}
                        for row in custom
                    ],
                    "jamb_inventory_flags": by_name[scope["jamb_name"]]["flags"],
                    "jamb_inventory_evidence_gaps": by_name[scope["jamb_name"]]["evidence_gaps"],
                }
            )
    report = {
        "schema_version": 1,
        "audit_date": "2026-09-26",
        "status": "joined_inventory_open_for_source_adjudication_and_fixes",
        "purpose": "The JAMB offering/source ledger and the CCMAS/external curriculum ledger are joined at the JAMB identity and selected-course boundary; neither ledger is treated as proof of the other.",
        "ledgers": {
            "jamb": {"artifact": "jamb_anomaly_inventory_2026-09-26.json", "counts": jamb["counts"]},
            "ccmas": {"artifact": "ccmas_extraction_anomaly_inventory_2026-09-26.json", "counts": ccmas["candidate_counts"]},
        },
        "join_checks": {
            "jamb_identity_rows": len(jamb["rows"]),
            "ccmas_programme_packages": ccmas["scope"]["programmes"],
            "ccmas_course_records": ccmas["scope"]["course_records"],
            "jamb_scope_rows": len(scopes),
            "jamb_rows_without_join_record": sorted(set(by_name) - {row["jamb_name"] for row in scopes}),
            "scope_rows_without_jamb_inventory_record": sorted({row["jamb_name"] for row in scopes} - set(by_name)),
            "external_or_unanchored_scope_rows": len(external_or_unanchored),
        },
        "external_or_unanchored_scope_rows": external_or_unanchored,
        "closure_rule": "A row is not closed merely because it has a component reference or a review label. Closure requires the JAMB offering context, CCMAS/external component evidence, selected course fidelity, item-level source locator/date, and a justified student-facing status. Downstream domain/subgroup/role repair remains deferred until this source phase is closed.",
    }
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# JAMB–CCMAS/external joined audit inventory — 2026-09-26",
        "",
        "Status: joined inventory complete for the current local artifacts; source adjudication and fixes remain open.",
        "",
        "The JAMB offering ledger and the CCMAS/external curriculum ledger are separate evidence layers joined at each identity and selected-course record.",
        "",
        "## Join checks",
        "",
    ]
    lines += [f"- `{key}`: **{value}**" for key, value in report["join_checks"].items() if key not in {"jamb_rows_without_join_record", "scope_rows_without_jamb_inventory_record"}]
    lines += ["", "## Closure rule", "", report["closure_rule"], "", "The full machine-readable row-level join is in the JSON artifact."]
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUT), "join_checks": report["join_checks"]}, indent=2))


if __name__ == "__main__":
    main()
