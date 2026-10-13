import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
REPORT = AUDIT / "jamb_ccmas_residual_mapping_lane_3_2026-09-29_increment_001.json"


def load():
    return json.loads(REPORT.read_text(encoding="utf-8"))


def test_lane_three_is_append_only_and_does_not_edit_canonical_mappings():
    report = load()
    assert report["append_only_increment"] == 1
    assert report["canonical_mappings_edited"] is False
    assert report["scope"]["course_detail_rows_inspected"] == 0
    assert report["scope"]["course_detail_rows_explicitly_excluded"] == 2442


def test_lane_three_reconciles_the_semantic_exception_totals():
    counts = load()["counts"]
    assert counts["domain_catalogue_mismatch_total"] == 494
    assert counts["domain_catalogue_source_anchored_candidate"] == 417
    assert counts["domain_catalogue_confirmed_unselected_anchor_repair"] == 5
    assert counts["domain_catalogue_unresolved_no_scope_anchor"] == 72
    assert counts["unselected_domain_link_occurrences"] == 24
    assert counts["held_mapping_occurrences"] == 129
    assert counts["selected_course_not_found_occurrences"] == 110
    assert counts["external_component_occurrences"] == 6
    assert counts["external_component_distinct_names"] == 6


def test_named_combined_cases_preserve_the_required_component_boundaries():
    cases = {row["jamb_name"]: row for row in load()["source_supported_named_cases"]}
    assert set(cases["Accounting and Finance"]["components"]) == {
        "Administration and Management::Accounting",
        "Administration and Management::Finance / Banking and Finance",
    }
    assert set(cases["Insurance and Actuarial Science"]["components"]) == {
        "Administration and Management::Insurance",
        "Administration and Management::Actuarial Science",
    }
    assert set(cases["COMPUTER SCIENCE AND MATHEMATICS"]["components"]) == {
        "Computing::Computer Science",
        "Sciences::Mathematics",
    }
    assert "Law::Law" not in cases["Political Science / International Law and Diplomacy"]["components"]
    assert cases["COMPUTER SCIENCE WITH ECONOMICS"]["canonical_edit_applied"] is False
