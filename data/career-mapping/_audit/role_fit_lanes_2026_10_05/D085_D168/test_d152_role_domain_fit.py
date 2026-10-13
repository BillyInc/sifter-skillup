import json
from pathlib import Path


LANE = Path(__file__).resolve().parent
QUEUE = LANE / "D085_D168_role_fit_queue_2026_10_05.json"
REVIEW = LANE / "D152_role_domain_fit_review_2026_10_05.json"
SPECIALIZATION_FIELDS = {
    "specialization_fit", "specialization_fit_status", "specialization_key",
    "candidate_specialization", "subgroup_fit", "subgroup_key",
}


def test_d152_review_is_exact_key_complete_and_disposition_totals_reconcile():
    queue = json.loads(QUEUE.read_text(encoding="utf-8"))["unresolved_rows"]
    review = json.loads(REVIEW.read_text(encoding="utf-8"))
    expected = {row["role_key"] for row in queue if row["domain_id"] == "D152"}
    decisions = review["decisions"]
    actual = {row["role_key"] for row in decisions}

    assert review["domain_id"] == "D152"
    assert len(expected) == 13
    assert len(actual) == len(decisions) == 13
    assert actual == expected
    assert review["counts"] == {
        "mappings_reviewed": 13,
        "supported": 7,
        "conditional": 3,
        "unsupported_for_domain": 3,
        "unresolved": 0,
    }
    assert all(row["task_evidence"] and row["source_refs"] for row in decisions)
    assert all(ref in review["sources"] for row in decisions for ref in row["source_refs"])
    assert not any(SPECIALIZATION_FIELDS.intersection(row) for row in decisions)


def test_d152_corrections_are_proposals_not_canonical_changes():
    review = json.loads(REVIEW.read_text(encoding="utf-8"))
    proposals = {row["role_key"]: row for row in review["correction_proposals"]}

    assert set(proposals) == {
        "D152|conservation scientist",
        "D152|cultural centre director",
        "D152|energy conservation officer",
    }
    assert proposals["D152|conservation scientist"]["candidate_transfer_domain"] == "D121"
    assert proposals["D152|energy conservation officer"]["candidate_transfer_domain"] is None
    assert proposals["D152|cultural centre director"]["candidate_transfer_domain"] is None
    assert all(row["canonical_change_made"] is False for row in proposals.values())
    assert review["separate_coverage_candidates"]


def test_d152_sources_identify_international_jurisdiction_limits():
    review = json.loads(REVIEW.read_text(encoding="utf-8"))
    for source_id in (
        "ICOM_MUSEUM_DEFINITION", "UNESCO_MUSEUMS_RECOMMENDATION",
        "ICA_ARCHIVIST_ROLE", "ICOMOS_ARCHAEOLOGICAL_HERITAGE",
    ):
        assert source_id in review["sources"]
        source = review["sources"][source_id]
        assert source["url"].startswith("https://")
        assert source["locator"] and source["supports"] and source["limit"]
    assert "local law" in " ".join(review["notes"])
