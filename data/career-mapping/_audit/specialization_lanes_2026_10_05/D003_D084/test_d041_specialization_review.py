import json
from pathlib import Path


REVIEW = json.loads(Path(__file__).with_name("D041_specialization_review.json").read_text(encoding="utf-8"))


def test_current_subgroups_are_not_misrepresented_as_student_specializations():
    state = REVIEW["current_state"]
    assert REVIEW["domain_id"] == "D041"
    assert state["subgroup_records"] == 2
    assert state["visible_subgroups"] == 0
    assert state["active_role_mappings"] == 11
    assert all(row["data_state"] == "excluded" for row in state["records"])
    assert all("not a subject-matter area" in row["finding"] for row in state["records"])


def test_international_field_classifications_are_candidates_not_a_fixed_product_count():
    decision = REVIEW["decision"]
    assert decision["candidate_count"] == len(REVIEW["candidate_subject_fields"]) == 6
    assert "not a ready-made six-subgroup prescription" in decision["disposition"]
    assert all(row["boundary"] for row in REVIEW["candidate_subject_fields"])
    assert {s["source_id"] for s in REVIEW["sources"]} >= {"OECD_FRASCATI_2015", "UNESCO_ISCED_F_2013"}


def test_computational_signals_are_not_used_to_infer_path_or_job_fit():
    evidence = REVIEW["decision"]["computational_evidence_state"]
    assert evidence["role_records_in_declared_scope"] == 11
    assert evidence["source_backed_role_records"] == 10
    assert evidence["explicit_cross_subgroup_method_links"] == 0
    assert "no computational subgroup/path is validated" in evidence["interpretation"]
    assert REVIEW["decision"]["role_assignment_status"].startswith("not_reviewed_here")
