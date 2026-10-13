import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
RESULT = HERE / "area_batch_001_005_results.json"


def rows():
    payload = json.loads(RESULT.read_text(encoding="utf-8"))
    return payload, [member for group in payload["groups"] for member in group["members"]]


def test_assigned_batches_are_complete_and_deduplicated():
    payload, members = rows()
    assert payload["input_batches"] == [f"batch-{i:03d}.json" for i in range(1, 6)]
    assert len(payload["groups"]) == 500
    assert len(members) == 505
    assert len({row["role_key"] for row in members}) == 505


def test_fit_decisions_have_independent_gates_and_evidence():
    payload, members = rows()
    assert payload["policy"]["isco_or_esco_membership_used_as_fit_evidence"] is False
    assert payload["policy"]["title_alone_used_as_fit_evidence"] is False
    assert payload["policy"]["existing_area_membership_used_as_fit_evidence"] is False
    assert payload["policy"]["canonical_files_edited"] is False
    for row in members:
        if row["disposition"] == "supported":
            assert row["parent_domain_fit"]["status"] == "supported"
            assert row["area_fit"]["status"] == "supported"
            assert row["area_fit"]["area_key"] in row["candidate_area_keys"]
            assert row["area_fit"]["source_refs"] or row["task_source_refs"]
        elif row["disposition"] == "unsupported":
            assert row["parent_domain_fit"]["status"] == "unsupported"
            assert row["area_fit"]["status"] == "not_applicable"
        else:
            assert row["disposition"] == "review_required"


def test_counts_match_rows():
    payload, members = rows()
    counts = payload["counts"]
    assert counts["supported_role_rows"] == sum(row["disposition"] == "supported" for row in members)
    assert counts["unsupported_role_rows"] == sum(row["disposition"] == "unsupported" for row in members)
    assert counts["review_required_role_rows"] == sum(row["disposition"] == "review_required" for row in members)
