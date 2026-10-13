from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CHECKPOINT = ROOT / "data/career-mapping/_audit/jamb_source_repair_lane_b_incremental_checkpoint_2026-09-28_023.md"
SOURCE = ROOT / "data/career-mapping/_jamb_txt/arts_hum.txt"


def test_arts_political_science_and_sociology_cells_remain_separate():
    checkpoint = CHECKPOINT.read_text(encoding="utf-8")
    source = SOURCE.read_text(encoding="cp1252")
    assert "POLITICAL SCIENCE AND CONFLICT RESOLUTION | AL-HIKMAH" in checkpoint
    assert "SOCIOLOGY | COVENANT, EVANGEL, FED-KASHERE, PLASU, SALEM" in checkpoint
    assert "arts_hum.txt:5832–5843" in checkpoint
    assert "arts_hum.txt:5939–5945" in checkpoint
    assert "Social Sciences Sociology" in checkpoint
    assert "10** held Arts 1–36 cells remain" in checkpoint
    assert "SOCIOLOGY AND" in source
    assert "CRIMINOLOGY       AND" in source
