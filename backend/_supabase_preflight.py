"""Read-only Supabase readiness check for the current Sifter test goal.

This does not apply SQL, mutate rows, or print credentials. It is intended to
be the first command Claude runs before the school-owner, matcher, or report
E2E test. A blocked result describes the current database; it is not a reason
to fabricate data or silently skip a required test.
"""

from __future__ import annotations

import json
from collections import Counter

from database import db


def _safe_error(exc: Exception) -> str:
    text = str(exc).replace("\n", " ")
    return text[:240]


def _count(svc, table: str) -> dict:
    try:
        result = svc.table(table).select("*", count="exact", head=True).execute()
        return {"status": "ok", "count": result.count}
    except Exception as exc:  # noqa: BLE001
        return {"status": "error", "error": _safe_error(exc)}


def main() -> int:
    svc = db.get_service_client()
    tables = [
        "subject_catalog",
        "programme_subject_options",
        "programme_subject_option_items",
        "programme_subject_rule_records",
        "student_provision_drafts",
        "claim_codes",
        "student_affiliations",
        "account_deletion_cooldowns",
        "guidance_report_paths",
    ]
    result = {"tables": {table: _count(svc, table) for table in tables}}

    try:
        school_result = svc.table("schools").select(
            "id, address, city, state, country, school_code",
            count="exact",
            head=True,
        ).execute()
        result["schoolsIdentity"] = {"status": "ok", "count": school_result.count}
    except Exception as exc:  # noqa: BLE001
        result["schoolsIdentity"] = {"status": "error", "error": _safe_error(exc)}

    try:
        offerings = []
        for start in range(0, 20000, 1000):
            batch = (
                svc.table("v_school_jamb_programmes")
                .select("school_id, jamb_programme_id")
                .range(start, start + 999)
                .execute()
            ).data or []
            offerings.extend(batch)
            if len(batch) < 1000:
                break
        pairs = [(row.get("school_id"), row.get("jamb_programme_id")) for row in offerings]
        duplicate_rows = sum(value - 1 for value in Counter(pairs).values() if value > 1)
        result["offerings"] = {
            "status": "ok",
            "rowsSampled": len(offerings),
            "rowsMissingIdentity": sum(1 for school_id, programme_id in pairs if not school_id or not programme_id),
            "duplicateSchoolProgrammeRows": duplicate_rows,
        }
    except Exception as exc:  # noqa: BLE001
        result["offerings"] = {"status": "error", "error": _safe_error(exc)}

    rule_count = result["tables"]["programme_subject_rule_records"].get("count") or 0
    option_count = result["tables"]["programme_subject_options"].get("count") or 0
    result["matcher"] = {
        "status": "ready" if rule_count and option_count else "blocked",
        "optionRows": option_count,
        "typedRuleRows": rule_count,
        "reason": None if rule_count and option_count else "Typed rule authority is absent or empty; matcher must fail closed.",
    }
    result["testGates"] = {
        "schoolOwnerProvisioning": result["schoolsIdentity"]["status"] == "ok",
        "subjectMatching": result["matcher"]["status"] == "ready",
        "accountDeletionCooldown": result["tables"]["account_deletion_cooldowns"]["status"] == "ok",
        "guidanceReportResume": result["tables"]["guidance_report_paths"]["status"] == "ok",
    }
    result["overall"] = "ready" if all(result["testGates"].values()) else "blocked"
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
