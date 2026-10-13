"""Promote only fully source-backed JAMB↔CCMAS scope rows.

This is a guarded source-layer repair.  It does not create, delete, or alter
domain links.  A row is eligible only when its selected course multiset is
exactly the union of its named CCMAS package(s), every selected course has
source metadata and substantive detail, and no named facet is unrepresented.
"""

from __future__ import annotations

import argparse
import collections
import copy
import json
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CCMAS_DIR = ROOT / "ccmas"
AUDIT_DIR = ROOT / "_audit"
SCOPES = AUDIT_DIR / "jamb_curriculum_scopes_2026-08-17.json"
REPORT = AUDIT_DIR / "jamb_ccmas_verified_scope_promotions_2026-09-29.json"


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def package_registry() -> dict[str, tuple[str, dict[str, Any]]]:
    registry: dict[str, tuple[str, dict[str, Any]]] = {}
    for path in sorted(CCMAS_DIR.glob("*.json")):
        document = load(path)
        for programme in document.get("programmes", []):
            ref = f"{document.get('discipline')}::{programme.get('name')}"
            registry[ref] = (path.name, programme)
    return registry


def course_code_counter(courses: list[dict[str, Any]]) -> collections.Counter[str]:
    return collections.Counter(course.get("code") for course in courses)


def has_complete_course_evidence(courses: list[dict[str, Any]]) -> bool:
    return all(
        course.get("source_url")
        and course.get("source_locator")
        and course.get("source_accessed_on")
        and course.get("content_summary")
        and (course.get("learning_outcomes") or course.get("skills_learned"))
        for course in courses
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    payload = load(SCOPES)
    registry = package_registry()
    eligible: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []
    updates: dict[str, dict[str, Any]] = {}

    for row in payload["rows"]:
        if not str(row.get("scope_status", "")).endswith("review_required"):
            continue

        refs = list(row.get("component_refs") or [])
        if not refs or any(ref.startswith("__custom__::") for ref in refs):
            continue
        packages = [registry.get(ref) for ref in refs]
        if any(package is None for package in packages):
            continue

        source_courses: list[dict[str, Any]] = []
        for _, programme in packages:
            source_courses.extend(programme.get("courses", []))
        selected = list(row.get("selected_courses") or [])
        reasons: list[str] = []
        if course_code_counter(selected) != course_code_counter(source_courses):
            reasons.append("selected_course_codes_do_not_equal_component_union")
        if not has_complete_course_evidence(selected):
            reasons.append("selected_course_source_or_detail_incomplete")
        if row.get("unrepresented_facets"):
            reasons.append("named_facet_unrepresented")
        if reasons:
            skipped.append({"jamb_name": row.get("jamb_name"), "reasons": reasons})
            continue

        updated = copy.deepcopy(row)
        if row.get("inheritance_type") == "combined_ccmas_curriculum":
            new_status = "combined_scope_reviewed"
        else:
            new_status = "full_scope_reviewed"
        updated["scope_status"] = new_status
        updated["scope_approval"] = "reviewed"
        original_reason = row.get("scope_reason") or ""
        suffix = (
            " Deterministic source-layer promotion: the selected CCMAS course set "
            "equals the complete named component package union and every selected "
            "course has source URL, locator, access date, content and outcomes; "
            "downstream domain links remain separately gated."
        )
        if suffix.strip() not in original_reason:
            updated["scope_reason"] = original_reason + suffix
        eligible.append(
            {
                "jamb_name": row.get("jamb_name"),
                "component_refs": refs,
                "previous_scope_status": row.get("scope_status"),
                "new_scope_status": new_status,
                "selected_course_count": len(selected),
            }
        )
        updates[row["jamb_name"]] = updated

    report = {
        "schema": "2026-09-29.jamb-ccmas-verified-scope-promotions.v1",
        "generated_on": date.today().isoformat(),
        "mode": "apply" if args.apply else "dry_run",
        "source_layer_only": True,
        "domain_links_changed": False,
        "eligible_count": len(eligible),
        "eligible": eligible,
        "skipped_count": len(skipped),
        "skipped": skipped,
    }
    if args.apply:
        payload["rows"] = [updates.get(row.get("jamb_name"), row) for row in payload["rows"]]
        SCOPES.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: report[k] for k in ("mode", "eligible_count", "skipped_count")}, indent=2))


if __name__ == "__main__":
    main()
