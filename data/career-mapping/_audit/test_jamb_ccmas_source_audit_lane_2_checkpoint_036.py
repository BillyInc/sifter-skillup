import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_036.json"
PROGRAMME_MAPPING = ROOT / "programme_mapping.json"


def test_checkpoint_036_corrects_identity_index_without_dropping_prior_findings():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = checkpoint["correction"]["verified_rows"]
    assert rows[0]["canonical_identity_row"] == 144
    assert rows[0]["jamb_name"] == "INFORMATION AND COMMUNICATION SCIENCE"
    assert rows[1]["canonical_identity_row"] == 173
    assert rows[1]["jamb_name"] == "BIOTECHNOLOGY AND MOLECULAR BIOLOGY"
    assert checkpoint["progress"]["row_144_covered_by_checkpoint_035"] is False


def test_checkpoint_036_indices_match_authoritative_programme_mapping_order():
    data = json.loads(PROGRAMME_MAPPING.read_text(encoding="utf-8"))
    mappings = data["mappings"]
    assert mappings[143]["jamb_name"] == "INFORMATION AND COMMUNICATION SCIENCE"
    assert mappings[172]["jamb_name"] == "BIOTECHNOLOGY AND MOLECULAR BIOLOGY"
