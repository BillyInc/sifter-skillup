import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
DATA = json.loads((HERE / "open_provisional_global_dispositions_2026_10_06.json").read_text(encoding="utf-8"))
EXPECTED_IDS = {"D057", "D058", "D060", "D062", "D063", "D064", "D065", "D066"}


def test_exact_provisional_set_and_no_out_of_scope_actions():
    assert set(DATA["prior_lane_provisional_ids"]) == EXPECTED_IDS
    assert {x["domain_id"] for x in DATA["adjudications"]} == EXPECTED_IDS
    assert DATA["summary"]["provisional_ids_adjudicated"] == 8
    assert DATA["summary"]["canonical_taxonomy_changes"] == 0
    assert DATA["summary"]["role_assignments"] == 0
    assert DATA["summary"]["nigerian_research_performed"] is False


def test_each_disposition_has_parent_count_names_and_explicit_source_limits():
    for row in DATA["adjudications"]:
        assert row["parent_scope"].strip()
        assert row["disposition"].strip()
        assert row["approved_area_count"] >= 0
        assert row["candidate_area_count"] == len(row["candidate_areas"])
        assert row["source_limit"].strip()
        assert row["evidence_urls"]
        assert all(url.startswith("https://") for url in row["evidence_urls"])


def test_count_remains_labeled_internal_or_flat_not_external_mandate():
    by_id = {x["domain_id"]: x for x in DATA["adjudications"]}
    assert by_id["D057"]["approved_area_count"] == 0
    assert by_id["D058"]["approved_area_count"] == 0
    assert "internal candidate" in by_id["D060"]["disposition"]
    assert "internal candidate" in by_id["D062"]["disposition"]
    assert "internal candidate" in by_id["D063"]["disposition"]
    assert "internal candidate" in by_id["D064"]["disposition"]
    assert "internal candidate" in by_id["D065"]["disposition"]
    assert "internal candidate" in by_id["D066"]["disposition"]


def test_markdown_addendum_matches_the_machine_readable_register():
    md = (HERE / "OPEN_PROVISIONAL_GLOBAL_DISPOSITIONS_2026_10_06.md").read_text(encoding="utf-8")
    for domain_id in EXPECTED_IDS:
        assert f"| {domain_id} " in md
    assert "Nigerian/local research" in md
    assert "not performed" in md
