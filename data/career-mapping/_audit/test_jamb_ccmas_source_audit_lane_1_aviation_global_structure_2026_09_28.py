import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CHECKPOINT = ROOT / "data/career-mapping/_audit/jamb_ccmas_source_audit_lane_1_2026-09-28_009_aviation_global_structure.json"
SOURCE = ROOT / "data/career-mapping/ccmas/administration_management.json"


def test_aviation_management_current_package_has_recorded_global_structure_gap():
    evidence = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    document = json.loads(SOURCE.read_text(encoding="utf-8"))
    package = next(row for row in document["programmes"] if row["name"] == "Aviation Management")
    local = {row["code"]: row for row in package["courses"] if row["code"].startswith("AVM ")}
    expected = {row["code"]: row for row in evidence["source_aviation_courses"]}

    assert len(package["courses"]) == 31
    assert len(expected) == 37
    assert set(evidence["structural_comparison"]["official_aviation_codes_missing_locally"]) == set(expected) - set(local)
    assert set(evidence["structural_comparison"]["local_aviation_codes_not_in_official_structure"]) == set(local) - set(expected)

    avm102 = local["AVM 102"]
    assert avm102["title"] == "Aviation Meteorology"
    assert expected["AVM 102"]["title"] == "Basic Concepts in Economics"
    avm204 = local["AVM 204"]
    assert avm204["title"] == "Aviation Law and Regulation"
    assert (expected["AVM 204"]["title"], expected["AVM 204"]["lh"], expected["AVM 204"]["ph"]) == ("Basic Life Support", None, 90)


def test_avm404_closed_micro_check_is_carried_forward_and_package_is_not_closed():
    evidence = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    finding = next(row for row in evidence["findings"] if row["finding_id"] == "aviation-management-avm404-carry-forward")
    assert finding["classification"] == "confirmed_match"
    assert "Do not repeat" in finding["carry_forward"]
    assert evidence["package_status"]["package_complete"] is False
