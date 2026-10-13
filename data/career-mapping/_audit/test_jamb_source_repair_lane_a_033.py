import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT_DIR = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT_DIR / "jamb_source_repair_lane_a_incremental_checkpoint_2026-09-28_033.md"

EXPECTED_HELD = {
    "agriculture_offerings.json": {
        "Agriculture",
        "Biotechnology",
        "Fisheries",
        "Crop Production",
        "Forestry and Fisheries",
        "Plant Breeding and Seed Technology",
        "Plant Science",
        "Farm Management & Agric. Extension",
    },
    "engineering_offerings.json": {
        "Building",
        "Civil Engineering",
        "Computer and Information Science",
        "Polymer and Textile Engineering",
        "Computer Science",
        "Systems Engineering",
        "Food Engineering",
        "Architecture",
        "Quantity Surveying",
        "Statistics",
        "Economics",
        "Geography",
        "Urban and Regional Planning",
        "Industrial Design",
        "Estate Management",
    },
}


def test_checkpoint_033_covers_exact_current_held_set_and_source_cell_counts():
    checkpoint = CHECKPOINT.read_text(encoding="utf-8")
    actual_counts = {}
    for filename, expected_names in EXPECTED_HELD.items():
        ledger = json.loads((ROOT / "data" / "career-mapping" / "jamb" / filename).read_text(encoding="utf-8"))
        held_names = {
            row["jamb_name"]
            for row in ledger["programmes"]
            if row.get("source_context_status") == "evidence_hold"
        }
        assert held_names == expected_names
        actual_counts[filename] = len(held_names)
        for name in expected_names:
            assert name in checkpoint

    assert sum(actual_counts.values()) == 23
    assert "**4 of 23 held contexts have complete exact awarder-cell evidence**" in checkpoint
    assert "Fisheries, 18" in checkpoint
    assert "Systems Engineering, 3" in checkpoint
    assert "increment adds **2** fully sourced" in checkpoint
    assert "**19** do\nnot yet have a complete exact source cell" in checkpoint
