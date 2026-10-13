import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[5]
OUT = Path(__file__).resolve().parent
EXPECTED = [
    "D005", "D009", "D013", "D026", "D030", "D034", "D038", "D042",
    "D046", "D050", "D054", "D058", "D068", "D074", "D078", "D082",
    "D100", "D104", "D108", "D112", "D125", "D129", "D133", "D137",
    "D141", "D145", "D149", "D153", "D157", "D161", "D165",
]


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def test_register_covers_exact_lane_without_duplicates():
    register = load(OUT / "remaining_lane_2_specialization_register_2026_10_06.json")
    assert register["domain_ids"] == EXPECTED
    assert register["expected_domain_count"] == 31
    assert register["processed_domain_count"] == 31
    assert len(register["domains"]) == 31
    assert len({row["domain_id"] for row in register["domains"]}) == 31


def test_each_domain_has_current_structure_and_patch_recommendation():
    register = load(OUT / "remaining_lane_2_specialization_register_2026_10_06.json")
    for row in register["domains"]:
        assert row["domain_name"]
        assert "active_subgroups" in row
        assert "excluded_subgroups" in row
        assert row["patch_recommendation"]["action"]
        assert row["patch_recommendation"]["exact_changes"]
        assert row["global_only"] is True
        assert row["nigerian_context_added"] is False


def test_d054_has_global_value_chain_review_and_no_role_inference():
    register = load(OUT / "remaining_lane_2_specialization_register_2026_10_06.json")
    row = next(item for item in register["domains"] if item["domain_id"] == "D054")
    assert row["review_artifact_status"] == "new_lane_review_completed"
    assert row["specialization_count_recommendation"] == 3
    assert [x["label"] for x in row["candidate_specializations"]] == [
        "Upstream Exploration, Drilling and Production",
        "Midstream Transportation, Processing and Storage",
        "Downstream Refining, Petrochemicals and Product Distribution",
    ]
    assert row["role_domain_fit_status"].startswith("not established")
    assert row["role_specialization_fit_status"].startswith("deferred")
    assert len(row["evidence"]) == 4


def test_no_canonical_taxonomy_write_claim():
    register = load(OUT / "remaining_lane_2_specialization_register_2026_10_06.json")
    assert register["canonical_taxonomy_changed"] is False
    assert register["role_domain_fit_independent"] is True
    assert register["role_specialization_fit_deferred_until_specialization_set_reconciled"] is True
