import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
OFFERINGS = ROOT / "jamb" / "sciences_offerings.json"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_037.json"


def test_checkpoint_037_closes_only_exact_jamb_cell_and_keeps_neighbor_distinct():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["scope"]["jamb_canonical_identity_row"] == 144
    assert checkpoint["current_occurrence"]["institutions"] == ["FED-GASHUA", "HALLMARK", "ILORIN"]
    assert "Sciences.txt:9111-9120" in checkpoint["current_occurrence"]["source_locator"]
    assert "INFORMATION SYSTEMS begins" in checkpoint["reconciliation"]["identity_boundary"]
    assert checkpoint["progress"]["complete_source_occurrence_closed"] is True
    assert checkpoint["progress"]["curriculum_and_domain_audit_closed"] is False


def test_checkpoint_037_current_offering_record_matches_the_adjudicated_cell():
    data = json.loads(OFFERINGS.read_text(encoding="utf-8"))
    occurrence = next(p for p in data["programmes"] if p["jamb_name"] == "INFORMATION AND COMMUNICATION SCIENCE")
    assert occurrence["institutions"] == ["FED-GASHUA", "HALLMARK", "ILORIN"]
    assert occurrence["source_locator"] == "Sciences.txt:9111-9120 (exact programme cell and awarding-institution block)"
    assert occurrence["source_context_status"] == "source_text_confirmed"


def test_checkpoint_037_does_not_repeat_or_overstate_prior_course_audit():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    prior = checkpoint["prior_coverage_reused"]
    assert "seven of ten" in prior["already_adjudicated"][2]
    assert "source-cell question only" in prior["not_repeated_here"]
    assert checkpoint["scope_snapshot"]["scope_evidence"] == []
