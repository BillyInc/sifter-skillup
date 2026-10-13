from __future__ import annotations

import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
SCOPE = HERE / "jamb_curriculum_scopes_2026-08-17.json"
RECONCILIATION = HERE / "jamb_ccmas_domain_mapping_reconciliation_2026-09-29.json"


def rows() -> dict[str, dict]:
    data = json.loads(SCOPE.read_text(encoding="utf-8"))
    return {row["jamb_name"]: row for row in data["rows"]}


def test_related_ccmas_courses_have_canonical_programme_provenance() -> None:
    data = rows()
    intelligence = data["Intelligence and Security Studies"]
    social_justice = data["Social Justice"]
    for row in (intelligence, social_justice):
        assert row["selected_courses"]
        assert all(course.get("source_kind") == "ccmas_related" for course in row["selected_courses"])
        assert all(course.get("source_ccmas_file") for course in row["selected_courses"])
        assert all(course.get("source_ccmas_programme") for course in row["selected_courses"])
        assert all(course.get("source_url") and course.get("source_locator") for course in row["selected_courses"])


def test_external_courses_are_not_mislabelled_as_missing_ccmas() -> None:
    data = rows()
    for name in ("Anthropology", "Sport Science", "Sport Management (Education)"):
        selected = data[name]["selected_courses"]
        assert selected
        assert all(course.get("source_kind") == "external_curriculum" for course in selected)
        assert all(course.get("source_url") and course.get("source_locator") for course in selected)

    reconciliation = json.loads(RECONCILIATION.read_text(encoding="utf-8"))
    assert reconciliation["counts"].get("issue:selected_course_not_found_in_current_ccmas", 0) == 0
    assert reconciliation["counts"]["evidence:external_course_source_attached"] == 90


def test_explicit_sociology_anthropology_components_are_both_materialized() -> None:
    row = rows()["Sociology and Anthroplogy"]
    assert len(row["selected_courses"]) == 55
    assert {course.get("scope_facet") for course in row["selected_courses"]} == {"sociology", "anthropology"}
    assert row["scope_selection_method"] == "explicit_component_union_with_external_evidence"
    assert len(row["scope_evidence"]) == 2
