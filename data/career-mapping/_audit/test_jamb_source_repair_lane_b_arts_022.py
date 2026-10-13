from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CHECKPOINT = ROOT / "data/career-mapping/_audit/jamb_source_repair_lane_b_incremental_checkpoint_2026-09-28_022.md"
SOURCE = ROOT / "data/career-mapping/_jamb_txt/arts_hum.txt"


def test_lane_b_arts_body_cells_are_recovered_without_editing_ledger():
    checkpoint = CHECKPOINT.read_text(encoding="utf-8")
    source = SOURCE.read_text(encoding="cp1252")
    for title in (
        "LITERATURE IN ENGLISH", "FRENCH", "PORTUGUESE/ENGLISH", "GERMAN",
        "AFRICAN AND ASIAN STUDIES", "RUSSIAN WITH FRENCH/GERMAN",
        "MASS COMMUNICATION (Arts/Humanities faculty occurrence)", "YORUBA",
    ):
        assert title in checkpoint
    for locator in (
        "arts_hum.txt:1984–2026", "arts_hum.txt:2136–2221",
        "arts_hum.txt:2222–2224", "arts_hum.txt:3631–3633", "arts_hum.txt:3971–3985",
        "arts_hum.txt:3994–3996", "arts_hum.txt:4360–4374",
        "arts_hum.txt:5546–5572",
    ):
        assert locator in checkpoint
    assert "brochure-degree-arts.pdf" in checkpoint
    assert "accessed 2026-09-28" in checkpoint
    assert "**12**" in checkpoint
    for source_title in ("LITERATURE IN ENGLISH", "PORTUGUESE/ENGLISH", "AFRICAN AND ASIAN"):
        assert source_title in source
