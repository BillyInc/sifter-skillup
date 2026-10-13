import json
from pathlib import Path


LANE = Path(__file__).parent
REGISTER = LANE / "remaining_lane_3_register_2026_10_06.json"
EXPECTED = {
    "D006", "D010", "D014", "D027", "D031", "D035", "D039", "D043",
    "D047", "D051", "D055", "D060", "D069", "D075", "D079", "D083",
    "D101", "D105", "D109", "D116", "D126", "D130", "D134", "D138",
    "D142", "D146", "D150", "D154", "D158", "D162", "D166",
}


def load():
    return json.loads(REGISTER.read_text(encoding="utf-8"))


def test_register_covers_exact_assigned_scope():
    data = load()
    ids = {row["domain_id"] for row in data["domain_records"]}
    assert ids == EXPECTED
    assert len(data["domain_records"]) == 31
    assert data["scope"]["nigerian_context_used"] is False


def test_d055_gap_is_closed_without_canonical_promotion():
    row = next(x for x in load()["domain_records"] if x["domain_id"] == "D055")
    assert row["candidate_area_count"] == 5
    assert row["evidence_sources"]
    assert any("abet.org" in url for src in row["evidence_sources"] for url in src["urls"])
    assert row["canonical_patch_recommendation"]["write_now"] is False


def test_global_first_sources_exclude_explicit_nigerian_records():
    data = load()
    for row in data["domain_records"]:
        assert row["nigerian_context_used"] is False
        for source in row["evidence_sources"]:
            sid = (source.get("source_id") or "").lower()
            assert not sid.startswith("ng_")


def test_unapproved_candidates_are_not_promoted():
    row = next(x for x in load()["domain_records"] if x["domain_id"] == "D060")
    assert row["candidate_area_count"] == 0
    assert row["explicitly_unapproved_candidate_area_count"] == 4
    assert row["canonical_patch_recommendation"]["write_now"] is False


def test_all_records_preserve_independent_role_boundaries():
    for row in load()["domain_records"]:
        assert "independent_role_domain_audit_required" in row["role_domain_fit"]
        assert "not assigned" in row["role_specialization_fit"]
        assert row["canonical_patch_recommendation"]["preserve_current_isco_fields"] is True
