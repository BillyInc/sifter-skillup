import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
ARTS = ROOT / "ccmas" / "arts.json"


def _german_rows():
    data = json.loads(ARTS.read_text(encoding="utf-8"))
    programme = next(row for row in data["programmes"] if row.get("code") == "GER")
    return {row["code"]: row for row in programme["courses"]}


def test_checkpoint_020_records_resumed_lane2_scope_and_no_shared_data_edit():
    checkpoint = json.loads(
        (AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_020.json").read_text(encoding="utf-8")
    )
    assert checkpoint["lane"] == 2
    assert checkpoint["scope"]["ccmas_package_index"] == 80
    assert checkpoint["scope"]["course_rows"] == [1, 5]
    assert checkpoint["progress"]["package_080_source_audit_complete"] is False
    assert all(not row.get("product_data_changed") for row in checkpoint["row_reconciliation"])
    assert checkpoint["progress"]["new_confirmed_defects"] == 1


def test_repaired_ger101_and_ger103_remain_source_aligned():
    courses = _german_rows()
    ger101 = courses["GER 101"]
    assert len(ger101["skills_learned"]) == 8
    assert "translate, interpret and evaluate" in ger101["skills_learned"][6]
    assert "written and spoken forms" in ger101["content_summary"]
    assert "New Arts" not in ger101["content_summary"]
    assert ger101["units"] == 2 and ger101["status"] == "C" and ger101["lh"] == 30

    ger103 = courses["GER 103"]
    assert len(ger103["skills_learned"]) == 7
    assert "translate, interpret and evaluate" in ger103["skills_learned"][5]
    assert "continues GER 101" in ger103["content_summary"]
    assert "present, imperfect, perfect and future tenses" in ger103["content_summary"]
    assert "Course Contents" not in ger103["skills_learned"][-1]
    assert ger103["units"] == 2 and ger103["status"] == "C" and ger103["lh"] == 30


def test_checkpoint_020_catches_ger102_page_marker_missed_in_checkpoint_001():
    courses = _german_rows()
    checkpoint = json.loads(
        (AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_020.json").read_text(encoding="utf-8")
    )
    assert "; New Arts 471" in courses["GER 102"]["skills_learned"][3]
    finding = next(row for row in checkpoint["row_reconciliation"] if row["code"] == "GER 102")
    assert finding["disposition"] == "confirmed_extraction_defect_new"
    assert finding["supersedes"].startswith("checkpoint 001")
    assert checkpoint["new_findings"][0]["field"] == "skills_learned[3]"


def test_prior_gst_findings_are_carried_forward_not_reopened():
    checkpoint = json.loads(
        (AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_020.json").read_text(encoding="utf-8")
    )
    rows = {row["code"]: row for row in checkpoint["row_reconciliation"]}
    assert rows["GST 111"]["evidence_ref"].endswith("checkpoint_001.json#course_rows[0]")
    assert rows["GST 112"]["evidence_ref"].startswith("jamb_ccmas_source_audit_lane_2_2026-09-28_checkpoint_005.json")
    assert rows["GST 111"]["disposition"] == "confirmed_defect_open"
    assert "source_conflict" in rows["GST 112"]["disposition"]
