import json
import subprocess
import sys
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
REVIEW = LANE / "D154_role_domain_fit_review_2026_10_05.json"
SCRIPT = LANE / "review_d154_role_domain_fit.py"


def test_d154_exact_keys_evidence_and_counts():
    subprocess.run([sys.executable, str(SCRIPT)], check=True, capture_output=True, text=True)
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))["unresolved_rows"]
    review = json.loads(REVIEW.read_text(encoding="utf-8"))
    expected = {row["role_key"] for row in queue if row["domain_id"] == "D154"}
    actual = {row["role_key"] for row in review["decisions"]}
    assert review["domain_id"] == "D154"
    assert len(expected) == len(actual) == len(review["decisions"]) == 17
    assert actual == expected
    assert review["counts"] == {
        "mappings_reviewed": 17, "supported": 11, "conditional": 6,
        "unsupported_for_domain": 0, "unresolved": 0,
    }
    assert all(row["task_evidence"] and row["source_refs"] for row in review["decisions"])
    assert all(ref in review["sources"] for row in review["decisions"] for ref in row["source_refs"])
    assert not any(any(token in row for token in ("specialization_fit", "specialization_key", "subgroup_key")) for row in review["decisions"])


def test_d154_sources_note_scope_limits_and_canonical_nonmutation():
    review = json.loads(REVIEW.read_text(encoding="utf-8"))
    assert {"WORLD_PHYSIOTHERAPY", "ACSM_EXERCISE_PHYSIOLOGY", "WHO_PHYSICAL_ACTIVITY"} <= set(review["sources"])
    assert all(
        (item["url"].startswith("https://") or item["url"] == "D085_D168_role_fit_queue_2026_10_05.json")
        and item["locator"] and item["supports"] and item["limit"]
        for item in review["sources"].values()
    )
    assert review["correction_proposals"] == []
    assert any("No canonical" in note for note in review["notes"])
