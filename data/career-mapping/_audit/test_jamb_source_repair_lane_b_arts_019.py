import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
LEDGER = ROOT / "data/career-mapping/jamb/arts_hum_offerings.json"
CHECKPOINT = ROOT / "data/career-mapping/_audit/jamb_source_repair_lane_b_incremental_checkpoint_2026-09-28_019.md"


def test_arts_tail_checkpoint_confirms_only_complete_supported_awarder_set():
    payload = json.loads(LEDGER.read_text(encoding="utf-8"))
    programmes = payload["programmes"]
    assert len(programmes) == 43

    hausa = programmes[39]
    assert hausa["jamb_name"] == "Hausa"
    proof = hausa["source_verification"]
    assert proof["verified_against_pdf"] is True
    assert proof["status"] == "verified"
    assert proof["accessed_on"] == "2026-09-28"
    assert proof["locator"].startswith("Arts/Humanities degree brochure, printed p. 186")
    assert proof["verified_institutions"] == hausa["institutions"]
    assert len(hausa["institutions"]) == 22

    checkpoint = CHECKPOINT.read_text(encoding="utf-8")
    assert "Rows 37–43" in checkpoint
    assert "Rows in this re-review: **7/7**" in checkpoint
    assert "Full title-plus-awarder set confirmed: **1**" in checkpoint
    for index in (36, 37, 38, 40, 41, 42):
        assert programmes[index]["source_verification"]["verified_against_pdf"] is False


def test_psychology_cannot_reuse_creative_arts_cell_as_its_source_evidence():
    payload = json.loads(LEDGER.read_text(encoding="utf-8"))
    row = next(r for r in payload["programmes"] if r["jamb_name"] == "Psychology")
    proof = row["source_verification"]
    assert proof["verified_against_pdf"] is False
    assert proof["status"] == "evidence_hold"
    assert "CREATIVE ARTS" in proof["hold_reason"]
    assert row["institutions"] == ["COVENANT", "EVANGEL", "MKAR", "PLASU"]
