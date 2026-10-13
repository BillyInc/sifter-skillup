import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
LEDGER = ROOT / "data/career-mapping/jamb/arts_hum_offerings.json"
CHECKPOINT = ROOT / "data/career-mapping/_audit/jamb_source_repair_lane_b_incremental_checkpoint_2026-09-28_021.md"

NEWLY_RECONSTRUCTED = {
    11: "Literature in English",
    12: "French",
    13: "Portuguese/English",
    14: "German",
    17: "History",
    18: "History and Strategic Studies",
    19: "Economics",
    23: "Russian with French/German",
    24: "Mass Communication",
    30: "Yoruba",
    36: "Sociology",
}
UNRESOLVED = {2, 15, 16, 20, 21, 25, 27, 28, 29, 35}


def test_lane_b_arts_021_documents_reconciled_held_occurrences_without_editing_ledger():
    payload = json.loads(LEDGER.read_text(encoding="utf-8"))
    programmes = payload["programmes"]
    assert len(programmes) == 43

    held = {
        i + 1
        for i, row in enumerate(programmes[:36])
        if row.get("source_verification", {}).get("status") == "evidence_hold"
    }
    assert len(held) == 24
    assert set(NEWLY_RECONSTRUCTED).issubset(held)
    assert UNRESOLVED.issubset(held)
    for index, expected_name in NEWLY_RECONSTRUCTED.items():
        assert programmes[index - 1]["jamb_name"] == expected_name
        assert programmes[index - 1]["source_verification"]["status"] == "evidence_hold"

    checkpoint = CHECKPOINT.read_text(encoding="utf-8")
    assert "accessed 2026-09-28" in checkpoint
    assert "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf" in checkpoint
    assert "24 held occurrences rechecked" in checkpoint
    assert "Additional complete body cells reconstructed in this increment: **11**" in checkpoint
    assert "Still-unresolved cells/title identities: **10**" in checkpoint
    assert "No rows were marked unavailable" in checkpoint
    assert "No downstream mappings or CCMAS records were inspected or edited" in checkpoint
    for name in NEWLY_RECONSTRUCTED.values():
        assert name in checkpoint
    for index in UNRESOLVED:
        assert re.search(rf"\|\s*{index}\s*\|", checkpoint)
