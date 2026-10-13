import json
import subprocess
import sys
from pathlib import Path


LANE_DIR = Path(__file__).resolve().parent
SCRIPT = LANE_DIR / "rebuild_d152_d168_role_fit_residual.py"
OUT_JSON = LANE_DIR / "D152_D168_exact_role_fit_residual_2026_10_05.json"
SOURCE_QUEUE = LANE_DIR / "D085_D168_role_fit_queue_2026_10_05.json"


def test_residual_rebuilder_emits_exact_nonduplicated_unreviewed_keys():
    subprocess.run([sys.executable, str(SCRIPT)], check=True, capture_output=True, text=True)
    result = json.loads(OUT_JSON.read_text(encoding="utf-8"))
    source = json.loads(SOURCE_QUEUE.read_text(encoding="utf-8"))["unresolved_rows"]
    residual = result["unresolved_rows"]
    keys = [row["role_key"] for row in residual]
    assert result["target_mappings"] == 1464
    assert result["remaining_mappings"] == len(residual)
    assert len(keys) == len(set(keys))
    assert all(row["domain_id"] != "D119" for row in residual)
    assert all(97 <= int(row["domain_id"][1:]) <= 168 for row in residual)
    assert set(keys) <= {row["role_key"] for row in source}
    assert all(row["role_description"].strip() for row in residual)


def test_residual_rebuilder_keeps_completed_d152_out():
    subprocess.run([sys.executable, str(SCRIPT)], check=True, capture_output=True, text=True)
    result = json.loads(OUT_JSON.read_text(encoding="utf-8"))
    completed = json.loads(
        (LANE_DIR / "D152_role_domain_fit_review_2026_10_05.json").read_text(encoding="utf-8")
    )
    residual_keys = {row["role_key"] for row in result["unresolved_rows"]}
    assert not residual_keys.intersection(row["role_key"] for row in completed["decisions"])
    assert "D152" not in {item["domain_id"] for item in result["remaining_domains"]}
