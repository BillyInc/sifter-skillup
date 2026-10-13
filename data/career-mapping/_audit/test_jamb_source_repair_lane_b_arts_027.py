from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CHECKPOINT = ROOT / "data/career-mapping/_audit/jamb_source_repair_lane_b_incremental_checkpoint_2026-09-28_027.md"


def test_checkpoint_027_reconciles_all_requested_arts_rows_without_editing_ledger():
    checkpoint = CHECKPOINT.read_text(encoding="utf-8")
    for row in ("| 2 |", "| 5 |", "| 15 |", "| 16 |", "| 21 |", "| 28 |", "| 35 |", "| 37 |", "| 38 |", "| 39 |", "| 40 |", "| 41 |", "| 42 |", "| 43 |"):
        assert row in checkpoint
    assert "**IBADAN, PAAU, UNIOSUN**" in checkpoint
    assert "**BENIN, BIU**" in checkpoint
    assert "**AL-HIKMAH**" in checkpoint
    assert "CREATIVE ARTS" in checkpoint
    assert "Source-cell evidence unresolved: 2 rows" in checkpoint
    assert "Identity/title adjudication still required: 5 rows" in checkpoint
    assert "No item is declared unavailable" in checkpoint
    assert "No offering JSON, institutions, aliases, mappings, or source data were edited." in checkpoint
    assert "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf" in checkpoint
