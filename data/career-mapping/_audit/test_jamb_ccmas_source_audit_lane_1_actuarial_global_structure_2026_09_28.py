import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CHECKPOINT = ROOT / "data/career-mapping/_audit/jamb_ccmas_source_audit_lane_1_2026-09-28_008_actuarial_global_structure.json"
SOURCE = ROOT / "data/career-mapping/ccmas/administration_management.json"


def test_actuarial_global_structure_codes_and_loads_are_reconciled_to_current_rows():
    evidence = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(row for row in document["programmes"] if row["name"] == "Actuarial Science")
    expected = evidence["source_global_structure"]
    local = {row["code"]: row for row in package["courses"]}

    assert len(expected) == 35
    assert len(local) == 35
    assert {row["code"] for row in expected} == set(local)
    title_differences = {
        row["code"] for row in expected if local[row["code"]]["title"] != row["title"]
    }
    assert title_differences == {"GST 212", "ACS 307", "ACS 402"}
    for source_row in expected:
        current = local[source_row["code"]]
        assert current["level"] == source_row["level"]
        assert current["units"] == source_row["units"]
        assert current["status"] == source_row["status"]
        assert current.get("lh") == source_row["lh"]
        assert current.get("ph") == source_row["ph"]

    acs311 = local["ACS 311"]
    assert (acs311["lh"], acs311.get("ph")) == (15, 45)
    assert evidence["findings"][0]["classification"] == "repaired_confirmed_defect"
    assert evidence["findings"][0]["repair_status"] == "applied_and_regression_tested"


def test_gst_code_disagreement_is_held_as_source_conflict_not_auto_repaired():
    evidence = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    finding = next(row for row in evidence["findings"] if row["finding_id"] == "actuarial-gst212-source-code-conflict")
    assert finding["classification"] == "source_conflict"
    assert finding["global_structure_code"] == "GST 212"
    assert finding["course_detail_heading_code"] == "GST 211"
    assert finding["repair_authorized"] is False
    assert evidence["package_status"]["package_complete"] is False
