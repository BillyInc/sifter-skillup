"""Hydrate explicitly mapped combined JAMB scopes from their CCMAS components.

This is deliberately narrower than a title-based inference.  It only acts on
rows already declared as ``combined_ccmas_curriculum`` whose component_refs are
all resolvable named CCMAS programmes and whose selected scope is empty.  It
unions the complete source packages, records both NUC PDF citations, and does
not create or modify downstream domain links.
"""

from __future__ import annotations

import argparse
import copy
import json
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CCMAS_DIR = ROOT / "ccmas"
SCOPES = ROOT / "_audit" / "jamb_curriculum_scopes_2026-08-17.json"
AUDIT = ROOT / "_audit"
REPORT = AUDIT / "combined_jamb_ccmas_scope_hydration_2026-09-29.json"

SOURCE_URLS = {
    "administration_management.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf",
    "agricultural_science.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Agriculture-2023.pdf",
    "allied_health.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf",
    "arts.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf",
    "environmental_sciences.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Environmental-Sciences-CCMAS-2023-FINAL.pdf",
    "medicine_dentistry.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf",
    "sciences.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf",
    "social_sciences.json": "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
}


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


def selected_course(course: dict[str, Any], file_name: str, programme: dict[str, Any]) -> dict[str, Any]:
    code = course.get("code")
    title = course.get("title")
    url = SOURCE_URLS.get(file_name)
    return {
        "code": code,
        "title": title,
        "units": course.get("units"),
        "status": course.get("status"),
        "lecture_hours": course.get("lh"),
        "practical_hours": course.get("ph"),
        "content_summary": course.get("content_summary"),
        # The normalized CCMAS packages may retain both names.  The
        # reconciler treats learning_outcomes as canonical when present, so
        # preserve that field first and only fall back to skills_learned for
        # older records.
        "learning_outcomes": course.get("learning_outcomes") or course.get("skills_learned") or [],
        "scope_match_terms": course.get("scope_match_terms", []),
        "scope_facet": course.get("scope_facet"),
        "source_ccmas_file": file_name,
        "source_ccmas_programme": programme.get("name"),
        "source_url": url,
        "source_locator": f"{programme.get('name')} CCMAS package; exact course anchor: {code} — {title}",
        "source_accessed_on": date.today().isoformat(),
        "source_kind": "ccmas",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write the hydrated scope rows")
    args = parser.parse_args()

    payload = load(SCOPES)
    rows = payload["rows"]
    registry = package_registry()
    candidates: list[dict[str, Any]] = []
    skipped: list[dict[str, Any]] = []

    for row in rows:
        if row.get("inheritance_type") != "combined_ccmas_curriculum":
            continue
        if row.get("selected_courses") and row.get("scope_selection_method") != "explicit_component_union_from_ccmas_packages":
            continue
        refs = list(row.get("component_refs") or [])
        if len(refs) < 2 or any(ref.startswith("__custom__::") for ref in refs):
            skipped.append({"jamb_name": row.get("jamb_name"), "reason": "custom_or_insufficient_component_set", "component_refs": refs})
            continue
        packages = []
        missing = []
        for ref in refs:
            package = registry.get(ref)
            if package is None:
                missing.append(ref)
            else:
                packages.append((ref, package[0], package[1]))
        if missing or any(not SOURCE_URLS.get(file_name) for _, file_name, _ in packages):
            skipped.append({"jamb_name": row.get("jamb_name"), "reason": "component_package_or_source_url_missing", "component_refs": refs, "missing": missing})
            continue

        selected = []
        evidence = []
        for ref, file_name, programme in packages:
            selected.extend(selected_course(course, file_name, programme) for course in programme.get("courses", []))
            evidence.append({
                "authority": "National Universities Commission",
                "title": "Core Curriculum and Minimum Academic Standards (CCMAS)",
                "url": SOURCE_URLS[file_name],
                "locator": f"{programme.get('name')} programme course structure and course contents/outcomes; explicit component union for {row.get('jamb_name')}",
                "supports": f"the {programme.get('name')} CCMAS component and its full source course set",
                "accessed_on": date.today().isoformat(),
            })
        updated = copy.deepcopy(row)
        updated["scope_status"] = "combined_scope_reviewed"
        updated["scope_reason"] = "explicit JAMB combined mapping hydrated as the union of its named CCMAS component packages; downstream domain links remain separately gated"
        updated["scope_approval"] = "reviewed"
        updated["scope_selection_method"] = "explicit_component_union_from_ccmas_packages"
        updated["scope_evidence"] = evidence
        updated["selected_courses"] = selected
        # The source phase must not invent downstream links from a union alone.
        updated["domain_links"] = []
        candidates.append({"jamb_name": row.get("jamb_name"), "component_refs": refs, "course_count": len(selected), "updated_row": updated})

    report = {
        "schema": "2026-09-29.combined-jamb-ccmas-scope-hydration.v1",
        "generated_on": date.today().isoformat(),
        "mode": "apply" if args.apply else "dry_run",
        "source_phase_only": True,
        "downstream_domain_links_changed": False,
        "candidate_count": len(candidates),
        "skipped_count": len(skipped),
        "course_count": sum(item["course_count"] for item in candidates),
        "candidates": [{k: value for k, value in item.items() if k != "updated_row"} for item in candidates],
        "skipped": skipped,
    }
    if args.apply:
        updates = {item["jamb_name"]: item["updated_row"] for item in candidates}
        payload["rows"] = [updates.get(row.get("jamb_name"), row) for row in rows]
        SCOPES.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: report[k] for k in ("mode", "candidate_count", "skipped_count", "course_count")}, indent=2))


if __name__ == "__main__":
    main()
