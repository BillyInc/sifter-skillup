from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CHECKPOINT = ROOT / "data/career-mapping/_audit/jamb_source_repair_lane_b_incremental_checkpoint_2026-09-28_024.md"
SOURCE = ROOT / "data/career-mapping/_jamb_txt/arts_hum.txt"


def test_arts_history_economics_and_music_contexts_are_separated():
    checkpoint = CHECKPOINT.read_text(encoding="utf-8")
    source = SOURCE.read_text(encoding="cp1252")
    assert "| 17 | HISTORY |" in checkpoint
    assert "| 18 | HISTORY AND STRATEGIC STUDIES | LAGOS |" in checkpoint
    assert "| 19 | ECONOMICS | EVANGEL, FED-DUTSE, FED-KASHERE, FED-LOKOJA, FED-WUKARI, UMYUK |" in checkpoint
    assert "| 25 | MUSIC |" in checkpoint
    for locator in (
        "arts_hum.txt:2757–2807", "arts_hum.txt:2809–2812",
        "arts_hum.txt:3501–3512", "arts_hum.txt:4413–4453",
    ):
        assert locator in checkpoint
    assert "6** (rows 15, 16, 21, 27, 28, 29)" in checkpoint
    assert "HISTORY AND STRATEGIC" in source
    assert "ECONOMICS AND" in source
