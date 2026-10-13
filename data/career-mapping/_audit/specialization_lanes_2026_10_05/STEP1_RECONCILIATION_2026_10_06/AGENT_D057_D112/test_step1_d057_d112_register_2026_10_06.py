import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[7]
LANE = Path(__file__).resolve().parent
REGISTER = LANE / "step1_d057_d112_reconciliation_register_2026_10_06_012.json"
CHECKPOINT = LANE / "step1_d057_d112_checkpoint_012.json"


def load_register():
    return json.loads(REGISTER.read_text(encoding="utf-8"))


def test_all_56_domain_ids_have_one_ordered_disposition():
    payload = load_register()
    expected = [f"D{i:03d}" for i in range(57, 113)]
    rows = payload["domains"]
    assert [row["domain_id"] for row in rows] == expected
    assert all(row["disposition"]["code"] in {"a", "b", "c", "d"} for row in rows)
    assert payload["covered_domain_count"] == 56


def test_evidence_and_claim_limits_are_carried_forward():
    rows = load_register()["domains"]
    assert all(row["evidence"]["sources"] for row in rows)
    for row in rows:
        for source in row["evidence"]["sources"]:
            assert source.get("url", "").startswith("http")
            # Incomplete source identity/locator/claim limits are allowed only
            # when surfaced by the row's explicit gap counts/status.
            if not source.get("source_id"):
                assert row["evidence"]["coverage"]["missing_source_id_count"] > 0
            if not source.get("locator"):
                assert row["evidence"]["coverage"]["locator_count"] < row["evidence"]["coverage"]["source_count"]
            if not (source.get("claim_limit") or source.get("does_not_support") or source.get("limit")):
                assert row["evidence"]["coverage"]["claim_limit_count"] < row["evidence"]["coverage"]["source_count"]


def test_d085_to_d091_central_sources_are_not_dropped():
    rows = {row["domain_id"]: row for row in load_register()["domains"]}
    for i in range(85, 92):
        row = rows[f"D{i:03d}"]
        assert row["evidence"]["coverage"]["source_count"] > 0
        assert row["selected_existing_artifact"]["kind"] == "central_register_fallback"


def test_unadjudicated_conflict_remains_open_and_explicit_adjudication_is_preserved():
    rows = {row["domain_id"]: row for row in load_register()["domains"]}
    assert rows["D064"]["disposition"]["code"] == "b"
    assert rows["D064"]["recommended_final_student_facing_areas"]["proposed_visible_area_count"] == 9
    assert rows["D064"]["existing_recommendation_reconciliation"]["status"] == "evidence_reconciled_internal_candidate_set"
    assert "AUSTRALIA_AREAS_OF_PRACTICE" in rows["D064"]["existing_recommendation_reconciliation"]["evidence_source_ids"]
    assert rows["D090"]["evidence"]["coverage"]["missing_source_id_count"] == 1
    assert rows["D098"]["existing_recommendation_reconciliation"]["status"] == "explicitly_adjudicated_conflict"
    assert rows["D098"]["disposition"]["code"] == "b"


def test_targeted_curricula_resolve_three_prior_deferrals_without_using_role_fit():
    rows = {row["domain_id"]: row for row in load_register()["domains"]}
    expected_counts = {"D057": 2, "D058": 3, "D060": 3}
    for domain_id, expected_count in expected_counts.items():
        row = rows[domain_id]
        assert row["disposition"]["code"] == "b"
        rec = row["recommended_final_student_facing_areas"]
        assert rec["proposed_visible_area_count"] == expected_count
        assert len(rec["areas"]) == expected_count
        assert all(area["source_ids"] and area["boundary"] for area in rec["areas"])
        assert row["remaining_blocker"] is None
        assert row["existing_recommendation_reconciliation"]["status"] == "domain_level_evidence_adjudication"
    assert rows["D068"]["disposition"]["code"] == "d"
    blocker = json.dumps(rows["D068"]["remaining_blocker"]).casefold()
    assert "parent" in blocker
    assert "laboratory science" in blocker
    assert "medical imaging" in blocker
    assert "not a pending role-fit audit" in blocker


def test_no_role_membership_or_canonical_edit_is_used():
    payload = load_register()
    assert payload["canonical_files_changed"] is False
    for row in payload["domains"]:
        assert row["canonical_edit"] is False
        assert row["role_to_specialization_assignments"] is None
        assert row["separate_later_gate"]
        assert row["remaining_blocker"] is None or row["disposition"]["code"] == "d"
        assert row["nigerian_context"] == "deferred_by_scope"
        assert "not used as evidence" in row["role_isco_membership_fit_rule"]
        if row["disposition"]["code"] == "d":
            assert row["remaining_blocker"]
            blocker_text = json.dumps(row["remaining_blocker"]).casefold()
            assert "role" not in blocker_text or "not a pending role-fit audit" in blocker_text


def test_each_row_has_current_structure_and_count_or_specific_open_decision():
    for row in load_register()["domains"]:
        assert "current_domain_structure_subgroup_records" in row["exact_current_subgroup_comparison"]
        rec = row["recommended_final_student_facing_areas"]
        if row["disposition"]["code"] == "d":
            assert row["remaining_blocker"]
        else:
            assert rec["proposed_visible_area_count"] is not None
            assert rec["count_status_or_rationale"] or rec["candidate_set_status"]


def test_checkpoint_matches_register_coverage_and_conflict_status():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    rows = load_register()["domains"]
    assert checkpoint["rows_written"] == len(rows) == 56
    assert checkpoint["domains_with_unresolved_recommendation_conflict"] == []
    assert checkpoint["domains_with_zero_source_records"] == []
