from __future__ import annotations

import json
import sys
import gzip
from collections import Counter
from datetime import date
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT))

from backend.d078_guided_content import (
    MASTER_PATH,
    _read,
    d078_area_context_items,
    d078_domain_context_items,
    d078_role_context_items,
    d078_sociology_programme_themes,
)


OUTPUT_PATH = Path(__file__).with_name("D078_RESOURCE_COVERAGE_BASELINE_2026_11_15.json")
SOCIOLOGY_CURRICULUM_PATH = ROOT / "data/career-mapping/_audit/sociology_curriculum_contract_2026-09-17.json.gz"
SOCIOLOGY_THEME_RESOURCE_AUDIT_PATH = ROOT / "data/career-mapping/_audit/sociology_programme_theme_resource_audit_2026_10_08.json.gz"
RESOURCE_FIELDS = (
    "media_type",
    "learning_level",
    "sequence_order",
    "locator",
    "access",
    "rationale",
)


def _resource_records(item: dict[str, Any]) -> list[dict[str, Any]]:
    source = item.get("linkSourceReference") or {}
    evidence = item.get("linkEvidence") or {}
    resources: list[dict[str, Any]] = []
    if item.get("linkUrl"):
        resources.append({
            "source_id": source.get("source_id") or source.get("id"),
            "title": item.get("linkTitle"),
            "url": item.get("linkUrl"),
            "media_type": item.get("linkMediaType"),
            "learning_level": item.get("linkLearningLevel"),
            "sequence_order": item.get("linkSequenceOrder"),
            "locator": evidence.get("locator") or source.get("locator"),
            "access": item.get("linkAccess") or evidence.get("access"),
            "rationale": evidence.get("why_this_resource"),
            "accessed_on": source.get("accessed_on") or item.get("linkAccessedAt") or item.get("verifiedAt"),
        })
    for link in item.get("additionalLearningLinks") or []:
        resources.append({
            "source_id": link.get("sourceId"),
            "title": link.get("title"),
            "url": link.get("url"),
            "media_type": link.get("mediaType"),
            "learning_level": link.get("learningLevel"),
            "sequence_order": link.get("sequenceOrder"),
            "locator": link.get("locator"),
            "access": link.get("access"),
            "rationale": link.get("rationale"),
            "accessed_on": link.get("accessedOn"),
        })
    return resources


def _item_record(
    item: dict[str, Any],
    *,
    context_level: str,
    context_key: str,
    owner: str,
) -> dict[str, Any]:
    resources = _resource_records(item)
    resource_gaps = sorted({
        field
        for resource in resources
        for field in RESOURCE_FIELDS
        if resource.get(field) in (None, "")
    })
    urls = [str(resource.get("url") or "").strip().rstrip("/").casefold() for resource in resources]
    duplicates = sorted({url for url in urls if url and urls.count(url) > 1})
    return {
        "item_id": f"{context_key}:{item.get('itemType') or 'item'}:{item.get('itemKey') or item.get('name')}",
        "item_key": item.get("itemKey"),
        "item_name": item.get("name"),
        "item_type": item.get("itemType"),
        "context_level": context_level,
        "context_key": context_key,
        "guidance_owner": owner,
        "claim_review_state": item.get("claimReviewState"),
        "data_state": item.get("dataState"),
        "link_state": item.get("linkState"),
        "student_resource_count": len(resources),
        "resources": resources,
        "resource_metadata_gaps": resource_gaps,
        "duplicate_resource_urls": duplicates,
        "external_review_status": "pending_item_by_item_external_verification",
        "terminal_disposition": None,
    }


def _programme_records() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    with gzip.open(SOCIOLOGY_CURRICULUM_PATH, "rt", encoding="utf-8") as source:
        curriculum = json.load(source)
    with gzip.open(SOCIOLOGY_THEME_RESOURCE_AUDIT_PATH, "rt", encoding="utf-8") as source:
        theme_resource_audit = json.load(source)
    records: list[dict[str, Any]] = []
    courses = curriculum.get("programme", {}).get("courses", [])
    for course in courses:
        course_code = str(course.get("code") or "").strip()
        course_id = f"Sociology:course:{course_code}"
        outcomes = course.get("outcomes") or []
        records.append({
            "item_id": course_id,
            "item_key": course_code,
            "item_name": course.get("title"),
            "item_type": "course",
            "context_level": "programme",
            "context_key": "Sociology",
            "guidance_owner": "programme",
            "course_level": course.get("level"),
            "course_summary": course.get("contentSummary"),
            "course_source_locator": course.get("sourceLocator"),
            "outcome_ids": [row.get("outcomeId") for row in outcomes if row.get("outcomeId")],
            "curriculum_source_state": course.get("sourceState") or "source_backed_contract",
            "student_resource_count": 0,
            "resources": [],
            "resource_metadata_gaps": ["course_specific_resource_links_not_yet_reconciled"],
            "external_review_status": "pending_course_and_outcome_specific_resource_enrichment",
            "terminal_disposition": None,
        })
        for outcome in outcomes:
            outcome_id = str(outcome.get("outcomeId") or "").strip()
            if not outcome_id:
                continue
            records.append({
                "item_id": f"{course_id}:outcome:{outcome_id.rsplit(':', 1)[-1]}",
                "item_key": outcome_id,
                "item_name": outcome.get("studentText") or outcome.get("sourceText"),
                "item_type": "curriculum_outcome",
                "context_level": "programme",
                "context_key": "Sociology",
                "guidance_owner": "programme",
                "course_id": course_id,
                "course_code": course_code,
                "course_title": course.get("title"),
                "course_level": course.get("level"),
                "source_text": outcome.get("sourceText"),
                "student_text": outcome.get("studentText"),
                "source_locator": outcome.get("sourceLocator") or course.get("sourceLocator"),
                "curriculum_source_state": outcome.get("dataState") or "source_backed_contract",
                "student_resource_count": 0,
                "resources": [],
                "resource_metadata_gaps": ["outcome_specific_resource_links_not_yet_reconciled"],
                "external_review_status": "pending_course_and_outcome_specific_resource_enrichment",
                "terminal_disposition": None,
            })
    for ability in (curriculum.get("programmeAbilities") or {}).get("rows", []):
        ability_id = str(ability.get("abilityId") or "").strip()
        if not ability_id:
            continue
        records.append({
            "item_id": f"Sociology:programme-ability:{ability_id}",
            "item_key": ability_id,
            "item_name": ability.get("displayTitle") or ability.get("studentText"),
            "item_type": "programme_ability",
            "context_level": "programme",
            "context_key": "Sociology",
            "guidance_owner": "programme",
            "source_text": ability.get("sourceText"),
            "student_text": ability.get("studentText"),
            "source_locator": ability.get("sourceLocator"),
            "curriculum_source_state": ability.get("dataState") or "source_backed_contract",
            "student_resource_count": 0,
            "resources": [],
            "resource_metadata_gaps": ["programme_ability_resource_links_not_yet_reconciled"],
            "external_review_status": "pending_programme_ability_resource_enrichment",
            "terminal_disposition": None,
        })
    themes = d078_sociology_programme_themes()
    for theme in themes:
        theme_key = str(theme.get("themeKey") or "").strip()
        if not theme_key:
            continue
        records.append({
            "item_id": f"Sociology:theme:{theme_key}",
            "item_key": theme_key,
            "item_name": theme.get("title"),
            "item_type": "curriculum_theme_grouping",
            "context_level": "programme",
            "context_key": "Sociology",
            "guidance_owner": "programme",
            "course_codes": theme.get("courseCodes") or [],
            "course_anchors": theme.get("courseAnchors") or [],
            "student_resource_count": 0,
            "resources": [],
            "resource_metadata_gaps": ["theme_to_reading_resource_assignments_not_reconciled_in_local_runtime_projection"],
            "external_review_status": "pending_theme_resource_and_course_anchor_reconciliation",
            "terminal_disposition": None,
        })
    resource_layer = {
        "source_artifact": str(SOCIOLOGY_THEME_RESOURCE_AUDIT_PATH.relative_to(ROOT)).replace("\\", "/"),
        "reviewed_on": theme_resource_audit.get("reviewed_on"),
        "status": theme_resource_audit.get("status"),
        "active_theme_count": theme_resource_audit.get("active_theme_count"),
        "matrix_theme_row_count": theme_resource_audit.get("matrix_theme_row_count"),
        "matrix_url_count": theme_resource_audit.get("matrix_url_count"),
        "matrix_urls": theme_resource_audit.get("matrix_urls") or [],
        "coverage_pass": theme_resource_audit.get("coverage_pass"),
        "provenance_limit": "Historical local theme-resource coverage only; URL-to-course/outcome mapping, current link reachability, and live database state are not proven by this artifact.",
    }
    return records, resource_layer


def build_ledger() -> dict[str, Any]:
    master = _read(MASTER_PATH)
    records: list[dict[str, Any]] = []
    records.extend(
        _item_record(item, context_level="domain", context_key="D078", owner="domain")
        for item in d078_domain_context_items()
    )
    for area in master.get("areas", []):
        area_id = area.get("area_id")
        if not area_id:
            continue
        records.extend(
            _item_record(item, context_level="area", context_key=str(area_id), owner="area")
            for item in d078_area_context_items(str(area_id))
        )
    owner_names = sorted({
        str(owner).strip()
        for row in master.get("role_item_reconciliation", {}).get("records", [])
        if row.get("approval_status") == "approved" and row.get("student_visibility") == "approved"
        for owner in (row.get("role_snapshot_reconciliation") or {}).get("current_area_routed_role_owners") or []
        if str(owner).strip()
    })
    for owner_name in owner_names:
        context_key = f"D078|{owner_name.casefold()}"
        records.extend(
            _item_record(item, context_level="role", context_key=context_key, owner="role")
            for item in d078_role_context_items(context_key)
        )
    programme_records, programme_resource_layer = _programme_records()
    records.extend(programme_records)
    records.sort(key=lambda row: (row["context_level"], row["context_key"].casefold(), row["item_id"].casefold()))
    counts = Counter(row["context_level"] for row in records)
    return {
        "artifact_type": "d078_learning_resource_coverage_baseline",
        "artifact_id": OUTPUT_PATH.stem,
        "audit_date": date.today().isoformat(),
        "source_artifact": str(MASTER_PATH.relative_to(ROOT)).replace("\\", "/"),
        "source_reviewed_on": master.get("reviewed_on"),
        "scope": "Current runtime-visible D078 domain, area and approved role-context learning items.",
        "method_limit": "This baseline extracts current local runtime projections. It does not verify external URL reachability, item-resource fit, current access terms, video captions, or live Supabase state.",
        "counts": {
            "items_by_context": dict(sorted(counts.items())),
            "items_total": len(records),
            "sociology_programme_records": len(programme_records),
            "sociology_programme_courses": sum(row["item_type"] == "course" for row in programme_records),
            "sociology_programme_outcomes": sum(row["item_type"] == "curriculum_outcome" for row in programme_records),
            "sociology_programme_abilities": sum(row["item_type"] == "programme_ability" for row in programme_records),
            "sociology_programme_themes": sum(row["item_type"] == "curriculum_theme_grouping" for row in programme_records),
            "items_without_learning_resource": sum(row["student_resource_count"] == 0 for row in records),
            "items_with_resource_metadata_gaps": sum(bool(row["resource_metadata_gaps"]) for row in records),
            "items_with_duplicate_resource_urls": sum(bool(row["duplicate_resource_urls"]) for row in records),
            "resource_records_total": sum(row["student_resource_count"] for row in records),
            "resources_missing_learning_level": sum(not resource.get("learning_level") for row in records for resource in row["resources"]),
            "resources_missing_locator": sum(not resource.get("locator") for row in records for resource in row["resources"]),
            "resources_missing_explicit_media_type": sum(not resource.get("media_type") for row in records for resource in row["resources"]),
        },
        "sociology_programme_existing_theme_resource_layer": programme_resource_layer,
        "records": records,
    }


if __name__ == "__main__":
    ledger = build_ledger()
    OUTPUT_PATH.write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(OUTPUT_PATH), "counts": ledger["counts"]}, indent=2))
