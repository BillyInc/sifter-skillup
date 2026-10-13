from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CHECKPOINT = ROOT / "data/career-mapping/_audit/jamb_source_repair_lane_b_incremental_checkpoint_2026-09-28_025.md"
SOURCE = ROOT / "data/career-mapping/_jamb_txt/arts_hum.txt"


def test_arts_philosophy_theology_and_language_variant_cells_are_documented():
    checkpoint = CHECKPOINT.read_text(encoding="utf-8")
    source = SOURCE.read_text(encoding="cp1252")
    assert "| 15 | FRENCH WITH GERMAN/RUSSIAN | UNN |" in checkpoint
    assert "| 27 | PHILOSOPHY |" in checkpoint
    assert "| 29 | THEOLOGY | BOUEDST, BINGHAM, MADONNA, WESLEYUNI |" in checkpoint
    assert "arts_hum.txt:2261–2263" in checkpoint
    assert "arts_hum.txt:4761–4880" in checkpoint
    assert "arts_hum.txt:5287–5291" in checkpoint
    assert "Exact complete-body-cell holds still open" in checkpoint
    assert "3** (rows 16, 21, 28)" in checkpoint
    assert "2** (rows 2 and 15)" in checkpoint
    for title in ("PHILOSOPHY", "THEOLOGY", "FRENCH WITH GERMAN/"):
        assert title in source
