import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCOPES = ROOT / "_audit" / "jamb_curriculum_scopes_2026-08-17.json"
REPORT = ROOT / "_audit" / "external_curriculum_outcome_repair_2026-09-29.json"


def load_scopes():
    payload = json.loads(SCOPES.read_text(encoding="utf-8"))
    return {row["jamb_name"]: row for row in payload["rows"]}


def test_external_rows_have_source_backed_outcomes_and_provenance():
    rows = load_scopes()
    expected = {
        "Sociology and Anthroplogy": 21,
        "Anthropology": 21,
        "Sport Science": 39,
        "Sport Management (Education)": 9,
    }
    for name, expected_count in expected.items():
        external = [course for course in rows[name]["selected_courses"] if course.get("source_kind") == "external_curriculum"]
        assert len(external) == expected_count, name
        assert all(course.get("content_summary") for course in external), name
        assert all(course.get("learning_outcomes") for course in external), name
        assert all(course.get("source_url") and course.get("source_locator") and course.get("source_accessed_on") for course in external), name
        assert all(course.get("outcomes_basis") for course in external), name


def test_combined_sociology_scope_is_not_held_for_empty_external_outcomes():
    row = load_scopes()["Sociology and Anthroplogy"]
    assert row["scope_status"] == "combined_scope_reviewed"
    assert row["scope_approval"] == "reviewed"


def test_repair_report_is_source_only_and_did_not_change_domain_links():
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    assert report["source_scope_only"] is True
    assert report["domain_links_changed"] is False
