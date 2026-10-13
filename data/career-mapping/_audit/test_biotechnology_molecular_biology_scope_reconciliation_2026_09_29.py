import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
NAME = "BIOTECHNOLOGY AND MOLECULAR BIOLOGY"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def test_jamb_context_and_narrow_two_component_scope_are_preserved():
    overrides = read(AUDIT / "jamb_ccmas_manual_scope_overrides_2026-09-25.json")["overrides"]
    override = next(row for row in overrides if row["jamb_name"] == NAME)
    assert override["context"]["institution_code"] == "FUHS-ILA"
    assert len(override["source_contexts"]) == 1
    assert override["scope_status"] == "combined_scope_review_required"
    assert override["scope_approval"] == "pending_review"
    components = {row["component_ref"]: row["course_codes"] for row in override["component_courses"]}
    assert len(components["Sciences::Biotechnology"]) == 23
    assert "BTG 304" in components["Sciences::Biotechnology"]
    assert components["Sciences::Biology"] == ["BIO 414"]
    assert all(source.get("url") and source.get("locator") and source.get("accessed_on") for source in override["source_evidence"])


def test_generated_scope_contains_only_bounded_biology_support_and_no_unreviewed_links():
    document = read(AUDIT / "jamb_curriculum_scopes_2026-08-17.json")
    row = next(row for row in document["rows"] if row["jamb_name"] == NAME)
    assert row["component_refs"] == ["Sciences::Biotechnology", "Sciences::Biology"]
    assert len(row["selected_courses"]) == 24
    assert sum(course["source_ccmas_programme"] == "Biology" for course in row["selected_courses"]) == 1
    assert next(course for course in row["selected_courses"] if course["code"] == "BIO 414")["source_ccmas_programme"] == "Biology"
    assert row["scope_status"] == "combined_scope_review_required"
    assert row["scope_approval"] == "pending_review"
    assert row["domain_links"] == []


def test_canonical_and_skill_artifact_record_both_components():
    canonical = read(AUDIT / "jamb_ccmas_inheritance_canonical_2026-08-17.json")
    row = next(row for row in canonical["rows"] if row["jamb_name"] == NAME)
    assert row["inheritance_type"] == "combined_ccmas_curriculum"
    assert row["component_refs"] == ["Sciences::Biotechnology", "Sciences::Biology"]
    assert row["mapping_status"] == "review_required"
    assert row["domain_links"] == []
    skills = read(ROOT / "jamb" / "jamb_skills_nuance.json")[NAME]
    assert [(row["code"], row["role"]) for row in skills["components"]] == [("BTG", "primary"), ("BIO", "secondary")]
