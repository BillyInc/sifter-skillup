"""Read-only live-schema gate for the reviewed Sociology contract.

This verifier probes tables and columns through Supabase REST only.  It never
issues inserts, updates, deletes, RPC calls, or SQL.  A blocked result names
the exact table/column gate that could not be verified so manual deployment
can be checked before the student route is approved.
"""

from __future__ import annotations

import json

from database import db


REQUIRED_GATES = {
    "curriculum": {
        "programme_curriculum_outcomes": (
            "id",
            "programme_id",
            "outcome_id",
            "course_code",
            "course_title",
            "course_level",
            "display_group",
            "outcome_index",
            "source_text",
            "student_text",
            "source_locator",
            "student_display",
            "data_state",
        ),
        "programme_abilities": (
            "id",
            "programme_id",
            "ability_id",
            "display_title",
            "source_text",
            "student_text",
            "source_locator",
            "student_display",
            "data_state",
        ),
    },
    "programme_domain_evidence": {
        "programme_domain_evidence": (
            "id",
            "programme_id",
            "domain_id",
            "programme_key",
            "domain_key",
            "match_type",
            "mapping_source",
            "course_anchor_quality",
            "course_anchor_count",
            "course_anchors",
            "transferable_evidence_count",
            "transferable_evidence",
            "source_review_required",
            "review_required",
            "source_provenance",
        ),
    },
    "contextual_ownership": {
        "career_context_items": (
            "id",
            "context_level",
            "context_key",
            "domain_key",
            "item_type",
            "item_key",
            "name",
            "source_references",
            "source_locators",
            "source_confidence",
            "data_state",
            "guidance_owner",
            "verified_at",
            "theme_key",
            "theme_label",
            "use_case_key",
            "requirement_level",
            "requirement_reason",
        ),
    },
    "relationships": {
        "career_item_relationships": (
            "id",
            "context_level",
            "context_key",
            "domain_key",
            "from_item_type",
            "from_item_key",
            "to_item_type",
            "to_item_key",
            "relationship_type",
            "relationship_status",
            "source_ids",
            "source_references",
            "source_confidence",
            "data_state",
            "guidance_owner",
            "verified_at",
        ),
        "career_item_path_targets": (
            "id",
            "context_level",
            "context_key",
            "domain_key",
            "from_item_type",
            "from_item_key",
            "target_level",
            "target_key",
            "requirement_level",
            "path_reason",
            "relationship_status",
            "source_ids",
            "source_references",
            "data_state",
            "guidance_owner",
            "verified_at",
        ),
    },
    "reports": {
        "guidance_report_paths": (
            "id",
            "student_id",
            "created_by",
            "source",
            "path",
            "created_at",
            "updated_at",
        ),
    },
}


def _safe_error(exc: Exception) -> str:
    return str(exc).replace("\n", " ")[:240]


def _probe_table(service, table: str) -> dict:
    """Probe table existence without reading rows or changing state."""
    try:
        result = service.table(table).select("*", count="exact", head=True).execute()
        return {"status": "ok", "count": getattr(result, "count", None)}
    except Exception as exc:  # noqa: BLE001
        return {"status": "error", "error": _safe_error(exc)}


def _probe_column(service, table: str, column: str) -> dict:
    """Ask PostgREST to validate one column while requesting zero rows."""
    try:
        service.table(table).select(column).limit(0).execute()
        return {"status": "ok"}
    except Exception as exc:  # noqa: BLE001
        return {"status": "error", "error": _safe_error(exc)}


def verify_sociology_contract(service) -> dict:
    """Return a JSON-safe readiness report for all Sociology live gates."""
    report = {"readOnly": True, "categories": {}, "missingGates": []}

    for category, tables in REQUIRED_GATES.items():
        category_report = {"status": "ready", "tables": {}}
        for table, columns in tables.items():
            table_probe = _probe_table(service, table)
            table_report = {"table": table_probe, "columns": {}}
            if table_probe["status"] != "ok":
                category_report["status"] = "blocked"
                report["missingGates"].append(f"{category}.{table}")
                table_report["missingColumns"] = list(columns)
            else:
                missing_columns = []
                for column in columns:
                    probe = _probe_column(service, table, column)
                    table_report["columns"][column] = probe
                    if probe["status"] != "ok":
                        missing_columns.append(column)
                        report["missingGates"].append(f"{category}.{table}.{column}")
                if missing_columns:
                    category_report["status"] = "blocked"
                    table_report["missingColumns"] = missing_columns
            category_report["tables"][table] = table_report
        report["categories"][category] = category_report

    report["overall"] = "ready" if not report["missingGates"] else "blocked"
    return report


def main() -> int:
    report = verify_sociology_contract(db.get_service_client())
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["overall"] == "ready" else 1


if __name__ == "__main__":
    raise SystemExit(main())
