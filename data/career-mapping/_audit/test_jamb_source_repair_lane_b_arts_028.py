import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CHECKPOINT = ROOT / "data/career-mapping/_audit/jamb_source_repair_lane_b_incremental_checkpoint_2026-09-28_028.md"
LEDGER = ROOT / "data/career-mapping/jamb/arts_hum_offerings.json"


def test_checkpoint_028_adjudicates_only_open_identity_cases_and_preserves_holds():
    checkpoint = CHECKPOINT.read_text(encoding="utf-8")
    for row in ("| 2 |", "| 5 |", "| 15 |", "| 16 |", "| 39 |", "| 42 —", "| 43 —"):
        assert row in checkpoint
    assert "Five title/context decisions adjudicated" in checkpoint
    assert "remain unresolved" in checkpoint
    assert "Do not mark unavailable" in checkpoint
    assert "No data files were edited" in checkpoint
    assert "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf" in checkpoint
    assert "https://www.unical.edu.ng/department_details.php?id=24" in checkpoint
    assert "https://iaue.edu.ng/registry/" in checkpoint


def test_checkpoint_028_did_not_mutate_the_current_arts_ledger():
    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    rows = ledger["programmes"]
    assert rows[1]["jamb_name"] == "Arabic Language and Literature Studies"
    assert rows[4]["jamb_name"] == "Christian Religious"
    assert rows[14]["jamb_name"] == "French and German/Russian"
    assert rows[15]["jamb_name"] == "International Studies and"
    assert rows[38]["jamb_name"] == "Psychology"
    assert rows[41]["jamb_name"] == "Modern Language and Translation"
    assert rows[42]["jamb_name"] == "Geography and Environmental Studies"
