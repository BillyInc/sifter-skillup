import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
EVIDENCE = AUDIT / "jamb_ccmas_source_audit_lane_1_2026-09-28_010_jamb_securities_investment.json"
OFFERINGS = ROOT / "data/career-mapping/jamb/administration_offerings.json"
SOURCE_TEXT = ROOT / "data/career-mapping/_jamb_txt/Administration.txt"


def test_securities_and_investment_source_occurrence_is_exactly_joined():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["scope"]["canonical_identity_order"] == 81
    assert evidence["scope"]["occurrence_id"] == "570efed10b81e39e"
    assert evidence["scope"]["source_ordinal"] == 34
    assert evidence["primary_source"]["url"] == (
        "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf"
    )
    assert evidence["disposition"] == "confirmed_match"
    assert evidence["product_data_edited"] is False

    local = json.loads(OFFERINGS.read_text(encoding="utf-8"))["programmes"][33]
    assert local["jamb_name"] == evidence["local_comparison"]["stored_title"]
    assert local["institutions"] == evidence["observed_source"]["complete_awarder_sequence_for_this_title"]
    assert local["source_context_status"] == "source_text_confirmed"


def test_source_locator_preserves_title_boundary_and_preceding_awarder():
    lines = SOURCE_TEXT.read_text(encoding="cp1252").splitlines()
    title_index = next(i for i, line in enumerate(lines) if "SECURITIES       AND" in line)
    block = "\n".join(lines[title_index - 2 : title_index + 4])
    assert "WELLSPRING" in block
    assert "SECURITIES       AND" in block
    assert "INVESTMENT" in block
    assert "MOUNTAIN TOP" in block
    assert "NASARAWA" in block
    assert block.index("WELLSPRING") < block.index("SECURITIES") < block.index("MOUNTAIN TOP") < block.index("NASARAWA")


def test_evidence_records_visual_review_limit_and_official_locator():
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
    assert evidence["primary_source"]["visual_cell_geometry_reviewed"] is False
    assert "printed page 57 inferred" in evidence["primary_source"]["locator"]
    assert "rendered PDF" in evidence["evidence_limit"]
    assert evidence["observed_source"]["source_conflict"] is None
