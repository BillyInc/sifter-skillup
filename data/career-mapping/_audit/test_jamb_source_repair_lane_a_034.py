import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT_DIR = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT_DIR / "jamb_source_repair_lane_a_incremental_checkpoint_2026-09-28_034.md"
ENGINEERING = ROOT / "data" / "career-mapping" / "jamb" / "engineering_offerings.json"


def test_checkpoint_034_records_bounded_geography_cell_without_editing_ledger():
    text = CHECKPOINT.read_text(encoding="utf-8")
    ledger = json.loads(ENGINEERING.read_text(encoding="utf-8"))
    geography = [row for row in ledger["programmes"] if row.get("jamb_name") == "Geography"]

    assert len(geography) == 1
    assert geography[0].get("source_context_status") == "evidence_hold"
    institutions = geography[0].get("institutions", [])
    assert institutions[:2] == ["KUST", "MAUTY"]
    assert "GEOGRAPHY AND" in institutions
    assert "PLANNING" in institutions

    assert "printed p. 428" in text
    assert "KUST; MAUTY" in text
    assert "GEOGRAPHY AND REGIONAL PLANNING — BENIN" in text
    assert "**5/23** contexts have complete exact source-cell evidence" in text
    assert "**18/23** still lack a complete exact source cell" in text
    assert "No offering JSON" in text


def test_partial_results_are_not_misrepresented_as_complete_cells():
    text = CHECKPOINT.read_text(encoding="utf-8")
    assert "cuts off before the end of the Building cell" in text
    assert "no full roster or continuation boundary" in text
    assert "Column interleaving prevents safely delimiting" in text
    assert "Do not alter or promote the local entry from it" in text
    assert "No row is marked unavailable" in text
