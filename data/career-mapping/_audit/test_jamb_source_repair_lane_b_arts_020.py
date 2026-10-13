import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
LEDGER = ROOT / "data/career-mapping/jamb/arts_hum_offerings.json"
CHECKPOINT = ROOT / "data/career-mapping/_audit/jamb_source_repair_lane_b_incremental_checkpoint_2026-09-28_020.md"

SKIPPED = {
    "Classical Studies",
    "Christian Studies",
    "Peace Studies",
    "Anthropology",
    "Efik-Ibibio",
}
CONFIRMED_CELLS = {
    "Kanuri": ["MAIDUGURI"],
    "Fulfulde": ["MAIDUGURI"],
    "Communication Arts": ["BOWEN", "UYO"],
}
EXPECTED_HELD_ROWS = {
    2, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 27, 28, 29, 30, 32, 34, 35, 36,
}


def test_lane_b_arts_020_reconciles_all_held_rows_without_promoting_partial_cells():
    payload = json.loads(LEDGER.read_text(encoding="utf-8"))
    programmes = payload["programmes"]
    assert len(programmes) == 43

    assert {
        programmes[index]["jamb_name"]
        for index in range(36)
        if programmes[index]["jamb_name"] in SKIPPED
    } == SKIPPED

    held_rows = {
        index + 1
        for index, programme in enumerate(programmes[:36])
        if programme.get("source_verification", {}).get("status") == "evidence_hold"
    }
    assert held_rows == EXPECTED_HELD_ROWS

    for name, awarding_institutions in CONFIRMED_CELLS.items():
        assert any(
            programme["jamb_name"] == name
            and programme.get("source_verification", {}).get("status") == "evidence_hold"
            for programme in programmes[:36]
        )
        assert awarding_institutions

    checkpoint = CHECKPOINT.read_text(encoding="utf-8")
    assert "**24/24**" in checkpoint
    assert "**3** (Kanuri/Maiduguri; Fulfulde/Maiduguri; Communication Arts/Bowen and Uyo)" in checkpoint
    assert "**20** (24 reviewed − 3 confirmed − 1 title-variant hold)" in checkpoint
    assert "concurrent edits already present" in checkpoint.lower()
    for name in SKIPPED:
        assert name in checkpoint

    # The source evidence confirms body cells; this audit checkpoint must not
    # silently mutate the held authoritative ledger rows itself.
    assert re.search(r"Source and method", checkpoint)
