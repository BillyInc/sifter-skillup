import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
EVIDENCE = ROOT / "data/career-mapping/_audit/jamb_ccmas_source_audit_lane_1_2026-09-28_010_civil_law_and_accounting_residual_fields.json"
JAMB_QUEUE = ROOT / "data/career-mapping/_audit/jamb_ccmas_source_audit_lane_1_2026-09-28_005_jamb_occurrence_reconciliation.json"
ADMIN = ROOT / "data/career-mapping/ccmas/administration_management.json"


def test_civil_law_is_the_next_held_lane_one_occurrence_and_not_false_closed():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    queue = json.loads(JAMB_QUEUE.read_text(encoding="utf-8"))
    occurrence = next(
        row
        for identity in queue["identities"]
        for row in identity["source_occurrences"]
        if row["occurrence_id"] == "13db7f702d56c6f9"
    )
    finding = evidence["jamb"]["findings"][0]
    assert evidence["scope"]["jamb_identity_order"] == 1
    assert occurrence["source_title"] == "Civil Law"
    assert occurrence["current_explicit_pdf_flag"] is False
    assert finding["classification"] == "candidate_unresolved"
    assert evidence["jamb"]["occurrence_completion_credit"] is False
    assert "continuation boundary" in " ".join(evidence["jamb"]["source_observation"]["not_established"])


def test_accounting_residual_skill_fields_are_repaired_from_source_verified_courses():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    document = json.loads(ADMIN.read_text(encoding="utf-8"))
    accounting = next(row for row in document["programmes"] if row["code"] == "ACC")
    courses = {row["code"]: row for row in accounting["courses"]}
    findings = {row["course_code"]: row for row in evidence["ccmas"]["current_local_fields"]}

    assert set(findings) == {"ACC 102", "ACC 203", "ACC 206"}
    assert courses["ACC 102"]["title"] == findings["ACC 102"]["verified_course_title"]
    assert "consolidated financial statements" not in " ".join(courses["ACC 102"]["skills_learned"])
    assert "variance analysis" not in " ".join(courses["ACC 203"]["skills_learned"])
    assert "capital budgeting" not in " ".join(courses["ACC 206"]["skills_learned"])
    assert all(row["classification"] == "repaired_confirmed_local_field_mismatch" for row in findings.values())
    assert evidence["ccmas"]["package_completion_credit"] is False
    assert evidence["product_data_changed"] is True
