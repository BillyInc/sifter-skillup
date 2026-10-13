import json
import re
from pathlib import Path


HERE = Path(__file__).parent
REVIEW = HERE / "SOURCE_MAPPING_EXTERNAL_REVIEW_2026-09-19.json"
CANONICAL = HERE.parent / "programme_domain_final.json"
INHERITANCE = HERE / "jamb_ccmas_inheritance_canonical_2026-08-17.json"
MATRIX = HERE / "jamb_ccmas_curriculum_coverage_matrix_2026-09-19.json"


def test_external_review_covers_unmapped_and_partial_scope_without_promoting_seed_data():
    review = json.loads(REVIEW.read_text(encoding="utf-8"))
    canonical = json.loads(CANONICAL.read_text(encoding="utf-8"))
    inheritance = json.loads(INHERITANCE.read_text(encoding="utf-8"))
    matrix = json.loads(MATRIX.read_text(encoding="utf-8"))

    required = [row for row in inheritance["rows"] if row["mapping_status"] == "review_required"]
    partial = next(category for category in matrix["categories"] if category["category"] == "partial_curriculum_scope")

    current_empty = [key for key, value in canonical.items() if not value.get("links")]
    assert review["scope"]["canonical_programmes_without_active_domain_link"] == len(current_empty) == 0
    assert review["scope"]["canonical_unmapped_programme_at_scope_start"] == "Sciences::Mathematics"
    assert review["scope"]["jamb_review_required_rows"] == len(required) == 86
    assert review["scope"]["jamb_partial_curriculum_rows"] == partial["rows"] == 273
    assert review["unresolved_queue_policy"]["remaining_review_required_rows"] == 86
    assert review["unresolved_queue_policy"]["remaining_partial_rows"] == 273

    records = review["records"]
    assert {record["issue_class"] for record in records} >= {
        "canonical_unmapped_full_programme",
        "partial_ccmas_fanout",
        "split_ccmas_component_review",
    }
    assert any(
        record["programme_ref"] == "Sciences::Mathematics"
        and record.get("domain_id") == "D009"
        and record["decision"] == "candidate_supported"
        for record in records
    )

    for record in records:
        assert record["promotion"] != "active_student_mapping"
        assert record["local_evidence"]["source"]
        assert record["local_evidence"]["locator"]
        for source in record["sources"]:
            assert re.fullmatch(r"https://[^\s]+", source["url"])
            assert source["locator"]
            assert source["evidence"]


def test_insufficient_mathematics_edges_stay_review_required():
    review = json.loads(REVIEW.read_text(encoding="utf-8"))
    math_actuarial = next(
        record
        for record in review["records"]
        if record.get("programme_ref") == "Sciences::Mathematics"
        and record.get("domain_id") == "D014"
    )
    partial_records = [record for record in review["records"] if record["issue_class"] == "partial_ccmas_fanout"]

    assert math_actuarial["decision"] == "review_required"
    assert math_actuarial["promotion"] == "not_promoted"
    assert partial_records
    assert all(record["promotion"] == "retain_partial_review_required_for_domain" for record in partial_records)
