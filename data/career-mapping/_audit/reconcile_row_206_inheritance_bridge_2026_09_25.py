"""Repair only row 206 in the canonical JAMB→CCMAS inheritance bridge."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CAREER = ROOT / "data" / "career-mapping"
AUDIT = CAREER / "_audit"
NAME = "Industrial Chemistry and Chemical Entrepreneurship"
BRIDGE = AUDIT / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
SCOPES = AUDIT / "jamb_curriculum_scopes_2026-08-17.json"
DERIVED = AUDIT / "jamb_domain_map_ccmas_derived_2026-08-17.json"
ACTIVE = CAREER / "jamb_domain_map.json"
SNAPSHOT = AUDIT / "row_206_inheritance_bridge_before_2026-09-25.json"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def save(path: Path, value) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def replace_array_record(path: Path, name: str, row: dict) -> None:
    text = path.read_text(encoding="utf-8")
    needle = f'"jamb_name": {json.dumps(name, ensure_ascii=False)}'
    at = text.index(needle)
    start = text.rfind("{", 0, at)
    if start < 0:
        raise RuntimeError("Bridge row object start was not found")
    line_start = text.rfind("\n", 0, start) + 1
    indent = text[line_start:start]
    _, end_relative = json.JSONDecoder().raw_decode(text[start:])
    end = start + end_relative
    lines = json.dumps(row, ensure_ascii=False, indent=2).splitlines()
    replacement = lines[0] + "\n" + "\n".join(indent + line for line in lines[1:])
    path.write_text(text[:start] + replacement + text[end:], encoding="utf-8")


def main() -> None:
    bridge = load(BRIDGE)
    scopes = load(SCOPES)
    derived = load(DERIVED)
    active = load(ACTIVE)
    row_index = 205
    old = bridge["rows"][row_index]
    if old.get("jamb_name") != NAME or old.get("primary_component", {}).get("code") != "ENP":
        raise RuntimeError("Canonical bridge row 206 no longer matches the known ENP defect")
    if old.get("mapping_status") != "ready_partial" or len(old.get("domain_links", [])) != 8:
        raise RuntimeError("Canonical bridge baseline changed; refusing a blind rewrite")
    if SNAPSHOT.exists():
        raise RuntimeError(f"Before-state snapshot already exists: {SNAPSHOT}")

    scope = scopes["rows"][row_index]
    if scope.get("component_refs") != ["Sciences::Industrial Chemistry"]:
        raise RuntimeError("Corrected row-206 scope is missing or inconsistent")
    course_codes = [course["code"] for course in scope["selected_courses"]]
    if len(course_codes) != 43 or len(set(course_codes)) != 43:
        raise RuntimeError("Corrected row-206 course set is not 43 unique codes")
    for artifact in (derived, active):
        entry = artifact.get(NAME)
        if not entry or entry.get("ccmas_components") != ["Sciences::Industrial Chemistry"]:
            raise RuntimeError("Derived/active map row 206 is inconsistent with the corrected scope")
        if entry.get("mapping_status") != "review_required" or entry.get("links"):
            raise RuntimeError("Derived/active map row 206 is not fail-closed")

    save(SNAPSHOT, {"recorded_at": "2026-09-25", "row": 206, "jamb_name": NAME, "bridge_row_before": old})

    updated = dict(old)
    candidates = old.get("candidate_ccmas_domain_links", old.get("domain_links", []))
    updated.update(
        {
            "inheritance_type": "partial_curriculum_scope",
            "primary_component": {
                "discipline": "Sciences",
                "name": "Industrial Chemistry",
                "code": "ICH",
                "role": "primary",
                "resolution_method": "manual_exact_ccmas_programme_and_course_outcomes",
            },
            "supporting_components": [],
            "component_refs": ["Sciences::Industrial Chemistry"],
            "curriculum_scope": {
                "status": "partial_scope_review_required",
                "source": "NUC Sciences CCMAS 2023",
                "note": "Exact Industrial Chemistry CCMAS component; hold pending exact JAMB offering-table verification, reconciliation of the local ICH 422 extraction, and domain-link review.",
                "approval": "review_required",
                "selected_course_count": len(course_codes),
                "selected_course_codes": course_codes,
            },
            "component_domain_evidence": [
                {
                    "component_ref": "Sciences::Industrial Chemistry",
                    "role": "primary",
                    "domain_link_count": 0,
                    "reviewed_domain_link_count": 0,
                    "source_review_link_count": 0,
                    "has_reviewed_domain_evidence": False,
                }
            ],
            "domain_links": [],
            "candidate_ccmas_domain_links": candidates,
            "candidate_ccmas_domain_links_status": "audit_only_from_superseded_ENP_scope; not confirmed for Industrial Chemistry",
            "current_jamb_domain_link_count": 0,
            "mapping_status": "review_required",
            "status_reason": "Corrected to the Industrial Chemistry CCMAS component; the preserved prior ENP link candidates require reassessment against ICH course outcomes and exact JAMB offering context.",
        }
    )
    replace_array_record(BRIDGE, NAME, updated)

    after = load(BRIDGE)
    row = after["rows"][row_index]
    assert row["primary_component"]["code"] == "ICH"
    assert row["component_refs"] == ["Sciences::Industrial Chemistry"]
    assert row["curriculum_scope"]["selected_course_codes"] == course_codes
    assert row["mapping_status"] == "review_required" and row["domain_links"] == []
    assert len(row["candidate_ccmas_domain_links"]) == 8
    assert row["candidate_ccmas_domain_links_status"].startswith("audit_only")
    assert row["current_jamb_domain_link_count"] == 0
    print("Updated canonical bridge row 206 only; retained eight prior links as audit-only candidates.")
    print(f"Preserved old ENP bridge row: {SNAPSHOT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
