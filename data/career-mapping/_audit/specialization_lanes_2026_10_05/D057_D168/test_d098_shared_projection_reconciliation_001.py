import json
import runpy
from pathlib import Path


ROOT = Path(__file__).resolve().parents[5]
LANE = Path(__file__).resolve().parent
SCRIPT = LANE / "reconcile_d098_shared_projection_001.py"


def test_d098_projection_is_conflict_report_not_shared_register_write():
    runpy.run_path(str(SCRIPT), run_name="__main__")
    result = json.loads((LANE / "d098_shared_projection_reconciliation_001.json").read_text(encoding="utf-8"))
    assert result["existing_register_candidate_count"] == 3
    assert result["proposed_lane_candidate_count"] == 4
    assert result["same_projection"] is False
    assert result["source_id_locator_or_metadata_conflicts"] == []
    assert "does not mutate the shared register" in result["write_boundary"]
    assert result["proposed_candidate_labels"] == [
        "Precision Machining and Component Manufacturing",
        "Tool, Die and Mould Making",
        "Precision Instruments and Optical Devices",
        "Dimensional Metrology and Measurement Systems",
    ]
