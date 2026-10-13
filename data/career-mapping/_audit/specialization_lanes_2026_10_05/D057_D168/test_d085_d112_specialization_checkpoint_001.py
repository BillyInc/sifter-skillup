import json
import re
import runpy
from pathlib import Path


LANE = Path(__file__).resolve().parent
SCRIPT = LANE / "build_d085_d112_specialization_checkpoint_001.py"


def test_d085_d112_checkpoint_separates_existing_conflict_and_unreviewed():
    runpy.run_path(str(SCRIPT), run_name="__main__")
    result = json.loads((LANE / "d085_d112_specialization_checkpoint_001.json").read_text(encoding="utf-8"))
    assert result["counts"]["domain_ids_in_range"] == 28
    assert result["counts"]["existing_source_reviewed_register_records_D085_D097"] == 13
    assert result["counts"]["lane_vs_register_conflicts"] == 1
    assert result["counts"]["domains_without_any_review_artifact_D099_D112"] == 14
    assert result["counts"]["domains_screened_in_source_triage_D099_D112"] == 14
    d098 = next(row for row in result["domains"] if row["domain_id"] == "D098")
    assert d098["register_candidate_area_count"] == 3
    assert d098["lane_candidate_area_count"] == 4
    assert "no shared register" in result["write_boundary"]
    triage = (LANE / "D099_D112_specialization_source_triage_001.md").read_text(encoding="utf-8")
    assert len(re.findall(r"\| \*\*D\d{3} ", triage)) == 14
    assert "Role mappings changed or inferred: **0**." in triage
