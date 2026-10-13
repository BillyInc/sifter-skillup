import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
CHECKPOINT = ROOT / "jamb_ccmas_source_audit_lane_1_2026-09-29_044_scope001-079_resume001.json"


def test_increment_044_is_disjoint_and_source_bounded():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))

    assert data["partition"] == {
        "jamb_canonical_rows": [1, 140],
        "ccmas_package_indices": [1, 79],
    }
    assert data["progress"]["shared_ledgers_edited"] is False
    assert data["progress"]["downstream_domain_subgroup_role_audit"] is False
    assert data["reconciliation_before_search"]["occurrence_key"] == "13db7f702d56c6f9"
    assert data["reconciliation_before_search"]["ccmas_course_key"] == "ACC 490"

    jamb = data["jamb_occurrence_findings"][0]
    assert jamb["source_context"]["faculty"] == "Law"
    assert jamb["field_findings"]["identity_spelling"]["disposition"] == "confirmed_match"
    assert jamb["field_findings"]["faculty"]["disposition"] == "confirmed_match"
    assert jamb["field_findings"]["institution_awarder_cell"]["disposition"] == "unresolved"
    assert jamb["overall_disposition"] == "unresolved"
    assert jamb["source"]["url"].startswith("https://ibass.jamb.gov.ng/")
    assert jamb["source"]["accessed_on"] == "2026-09-29"

    acc490 = data["ccmas_course_findings"][0]
    assert acc490["course_code"] == "ACC 490"
    assert acc490["overall_disposition"] == "confirmed_match"
    assert acc490["field_findings"]["lecture_and_practical_hours"]["local"] == {
        "lecture_hours": None,
        "practical_hours": 270,
    }
    assert acc490["source"]["url"].startswith("https://www.nuc.edu.ng/")
    assert acc490["source"]["accessed_on"] == "2026-09-29"


def test_increment_044_has_a_resume_cursor_for_each_partition_side():
    data = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    cursor = data["progress"]["next_cursor"]

    assert "row 001" in cursor["jamb"]
    assert "occurrence 13db7f702d56c6f9" in cursor["jamb"]
    assert "package index 001" in cursor["ccmas"].lower()
    assert "ordinal 1" in cursor["ccmas"]
