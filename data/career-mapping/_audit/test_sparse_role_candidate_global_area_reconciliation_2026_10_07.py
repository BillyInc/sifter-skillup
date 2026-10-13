import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "_audit" / "sparse_role_candidate_global_area_reconciliation_2026_10_07.json"


def test_sparse_candidate_area_reconciliation_is_complete_and_audit_only():
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    decisions = report["decisions"]
    assert report["status"] == "audit_only"
    assert decisions
    assert report["fit_policy"]["canonical_files_edited"] is False
    assert all(item["domain_id"] for item in decisions)
    assert all(item["role_title"] for item in decisions)
    assert all(item["global_evidence"] for item in decisions)
    eligible = [
        item
        for item in decisions
        if item["final_disposition"] == "eligible_for_guarded_integration"
    ]
    assert eligible
    assert all(item["recommended_area"]["label"] for item in eligible)
    assert all(item["area_margin"] >= 2 for item in eligible)
    assert all(item["evidence_gate"] is True for item in eligible)

