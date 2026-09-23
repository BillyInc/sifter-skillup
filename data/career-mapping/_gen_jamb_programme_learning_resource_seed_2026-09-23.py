"""Generate the append-only SQL transport for the corrected all-420 JAMB ledger."""

from __future__ import annotations

import glob
import json
import uuid
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
OUT = ROOT / "backend" / "seed_jamb_programme_learning_resources_2026-09-23.sql"
MANIFEST = AUDIT / "PROGRAMME_JAMB_LEARNING_RESOURCE_SEED_2026-09-23.json"
SOURCE_MANIFEST = AUDIT / "programme_jamb_resource_evidence_2026-09-23_corrected_004_manifest.json"
NAMESPACE = uuid.UUID("d8c1f6f3-1c5a-4fe0-9f4e-7d49b4ed9b72")


def sql(value: object) -> str:
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def json_sql(value: object) -> str:
    text = json.dumps(value or {}, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return sql(text) + "::jsonb"


def rows() -> list[dict]:
    paths = sorted(AUDIT.glob("programme_jamb_resource_evidence_2026-09-23_corrected_004_jamb_batch-*.jsonl"))
    result: list[dict] = []
    for path in paths:
        result.extend(json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip())
    return result


def resource_type(resource_role: str) -> str:
    if resource_role == "official_identity_context":
        return "official_identity_context"
    if resource_role == "official_curriculum_source":
        return "official_curriculum_source"
    return "external_learning_reference"


def region_for(resource: dict) -> str:
    """Classify the resource's source region from its retained authority URL."""
    url = str(resource.get("url") or "").lower()
    authority = str(resource.get("authority") or "").lower()
    if "eligibility.jamb.gov.ng" in url or "nuc.edu.ng" in url:
        return "nigeria"
    if "joint admissions and matriculation board" in authority or "national universities commission" in authority:
        return "nigeria"
    return "global"


def build() -> tuple[str, dict]:
    identities = rows()
    if len(identities) != 420 or len({row["jamb_name"] for row in identities}) != 420:
        raise SystemExit("corrected ledger must contain 420 unique JAMB identities")

    values: list[str] = []
    resource_count = 0
    for identity in identities:
        jamb_name = identity["jamb_name"]
        for resource in identity.get("resources") or []:
            url = resource["url"]
            locator = resource.get("locator") or resource.get("source_locator") or ""
            role = resource.get("resource_role") or "external_learning_reference"
            stable = uuid.uuid5(NAMESPACE, "|".join((jamb_name, role, url, locator)))
            provider = resource.get("authority") or "External source"
            resource_classification = identity.get("resource_classification") or "available"
            decision = identity.get("decision") or "resource_available"
            exposure = identity.get("student_exposure") or "requires_downstream_and_approval_gate"
            provenance = {
                "schema": identity.get("schema"),
                "subject_id": identity.get("subject_id"),
                "jamb_name": jamb_name,
                "ccmas_anchor_absent": identity.get("ccmas_anchor_absent"),
                "ccmas_anchor_policy": identity.get("ccmas_anchor_policy"),
                "inheritance_type": identity.get("inheritance_type"),
                "mapping_type": identity.get("mapping_type"),
                "promotion_eligible": identity.get("promotion_eligible"),
                "resource_evidence_summary": resource.get("evidence_summary"),
                "source_check": resource.get("source_check"),
            }
            values.append(
                "(" + ", ".join(
                    [
                        sql(str(stable)),
                        "(SELECT id FROM skillup_dev.jamb_programmes WHERE jamb_name = " + sql(jamb_name) + ")",
                        sql(resource_type(role)),
                        sql(resource.get("title") or jamb_name),
                        sql(provider),
                        sql(region_for(resource)),
                        sql("free"),
                        sql(url),
                        sql(url),
                        sql(provider),
                        sql(role),
                        sql(resource.get("source_status") or "confirmed"),
                        sql(locator),
                        sql(resource.get("accessed_on") or identity.get("checked_on")),
                        sql(resource_classification),
                        sql(decision),
                        sql(identity.get("mapping_status")),
                        sql(exposure),
                        sql("review_only"),
                        json_sql(provenance),
                    ]
                ) + ")"
            )
            resource_count += 1

    columns = (
        "id, jamb_programme_id, resource_type, target_name, provider, region, access_type, "
        "url, source_url, authority, resource_role, source_status, source_locator, accessed_on, "
        "resource_classification, decision, mapping_status, student_exposure, review_status, source_provenance"
    )
    sql_text = "-- Generated from the corrected all-420 append-only JAMB resource ledger.\n"
    sql_text += "-- Apply migration_jamb_programme_learning_resources_2026-09-23.sql first.\n"
    sql_text += "BEGIN;\n"
    sql_text += f"INSERT INTO skillup_dev.jamb_programme_learning_resources ({columns})\nVALUES\n"
    sql_text += ",\n".join(values)
    sql_text += "\nON CONFLICT (id) DO UPDATE SET\n"
    sql_text += "resource_type = EXCLUDED.resource_type, target_name = EXCLUDED.target_name, provider = EXCLUDED.provider,\n"
    sql_text += "region = EXCLUDED.region, access_type = EXCLUDED.access_type, url = EXCLUDED.url, source_url = EXCLUDED.source_url,\n"
    sql_text += "authority = EXCLUDED.authority, resource_role = EXCLUDED.resource_role, source_status = EXCLUDED.source_status,\n"
    sql_text += "source_locator = EXCLUDED.source_locator, accessed_on = EXCLUDED.accessed_on, resource_classification = EXCLUDED.resource_classification,\n"
    sql_text += "decision = EXCLUDED.decision, mapping_status = EXCLUDED.mapping_status, student_exposure = EXCLUDED.student_exposure,\n"
    sql_text += "review_status = EXCLUDED.review_status, source_provenance = EXCLUDED.source_provenance, updated_at = NOW();\n"
    sql_text += "COMMIT;\n"
    report = {
        "schema": "2026-09-23.jamb-programme-learning-resource-seed.v1",
        "source_manifest": SOURCE_MANIFEST.relative_to(ROOT).as_posix(),
        "canonical_jamb_identities": len(identities),
        "unique_jamb_names": len({row["jamb_name"] for row in identities}),
        "anchor_absent_identities": sum(bool(row.get("ccmas_anchor_absent")) for row in identities),
        "resource_rows": resource_count,
        "resource_classifications": {"available": resource_count},
        "sql_applied": False,
        "browser_proof": False,
    }
    return sql_text, report


if __name__ == "__main__":
    text, report = build()
    OUT.write_text(text, encoding="utf-8")
    MANIFEST.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"sql": str(OUT), "manifest": str(MANIFEST), **report}, sort_keys=True))
