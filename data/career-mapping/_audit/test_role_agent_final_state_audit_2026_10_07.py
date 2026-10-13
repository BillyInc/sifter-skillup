import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "_audit" / "ROLE_AGENT_FINAL_STATE_AUDIT_2026_10_07.json"


def test_role_agent_final_state_is_closed_for_next_phase():
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    assert report["result"] == {
        "role_agent_queue_coverage_complete": True,
        "canonical_role_area_invariants_pass": True,
        "computational_residuals_have_explicit_dispositions": True,
        "ready_for_next_phase": True,
    }
    assert report["canonical"]["supported_area_routes"] == 1296
    assert report["canonical"]["direct_domain_role_routes"] == 266
    assert report["student_exposure"]["student_visible_review_required_area_rows"] == 0
    assert report["student_exposure"]["student_visible_parent_unsupported_rows"] == 0
    assert report["student_exposure"]["hidden_review_required_area_rows"] == 612
    assert report["guards"]["supported_area_route_violations"] == []
    assert report["guards"]["stale_direct_domain_candidates"] == []
    assert report["computational"]["invalid_role_links"] == 0
    assert report["computational"]["no_link_groups_with_explicit_disposition"] == 38
