import json
from pathlib import Path


def test_ambiguous_reconciliation_keeps_residual_queue_and_source_guards():
    path = Path(__file__).resolve().parent / "ccmas_ambiguous_detail_reconciliation_2026-09-29_applied.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    assert data["counts"]["records_seen"] == len(data["proposals"])
    assert data["counts"]["auto_verified_candidates"] > 0
    assert data["counts"]["state:residual_context_conflict"] > 0
    assert all(item["guard"] for item in data["source_changes"])
    assert all(item["official_source_url"] for item in data["source_changes"])


def test_ambiguous_reconciliation_does_not_claim_domain_repairs():
    path = Path(__file__).resolve().parent / "ccmas_ambiguous_detail_reconciliation_2026-09-29_applied.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    limits = " ".join(data["limits"])
    assert "domain links" in limits
    assert "component scope" in limits
