import json
import subprocess
import sys
from pathlib import Path

LANE = Path(__file__).resolve().parent
QUEUE = json.loads((LANE / "D085_D168_role_fit_queue_2026_10_05.json").read_text(encoding="utf-8"))["unresolved_rows"]


def test_reviews_cover_exact_queued_keys_and_have_auditable_sources():
    for did in ("D160", "D161", "D162", "D163"):
        rows = [r for r in QUEUE if r["domain_id"] == did]
        payload = json.loads((LANE / f"{did}_role_domain_fit_review_2026_10_05.json").read_text(encoding="utf-8"))
        assert {x["role_key"] for x in payload["decisions"]} == {r["role_key"] for r in rows}
        assert all(x["task_evidence"] == next(r["role_description"] for r in rows if r["role_key"] == x["role_key"]) for x in payload["decisions"])
        assert all(x["domain_fit"] in {"supported", "conditional", "unsupported_for_domain", "unresolved"} for x in payload["decisions"])
        assert all(x["source_refs"] and all(ref in payload["sources"] for ref in x["source_refs"] if ref != "QUEUE") for x in payload["decisions"])
        assert all(x["canonical_change_made"] is False for x in payload["correction_proposals"])
        assert "role-to-specialization" in payload["method"]


def test_generator_is_reproducible_and_exact_key_guarded():
    subprocess.run([sys.executable, str(LANE / "review_d160_d163_role_domain_fit.py")], check=True, capture_output=True, text=True)
    assert all((LANE / f"D{n}_role_domain_fit_review_2026_10_05.md").exists() for n in range(160, 164))
