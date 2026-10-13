import json
from pathlib import Path


REPORT = Path(__file__).resolve().parent / "ccmas_original_document_crosswalk_2026-09-29.json"


def load_report():
    return json.loads(REPORT.read_text(encoding="utf-8"))


def test_crosswalk_covers_both_source_catalogues():
    report = load_report()
    counts = report["counts"]
    assert report["status"] == "complete_catalogue_crosswalk_ready"
    assert counts["original_source_documents"] == 17
    assert counts["jamb_source_documents"] == 9
    assert counts["jamb_offering_occurrences"] == 443
    assert counts["ccmas_programme_packages"] == 237
    assert counts["ccmas_course_rows"] == 9854
    assert counts["canonical_jamb_identities"] == 420


def test_crosswalk_does_not_hide_external_or_unresolved_components():
    report = load_report()
    assert report["counts"]["jamb_identities_with_unresolved_component_ref"] == 0
    assert report["external_component_refs"]
    assert report["counts"]["jamb_identities_without_ccmas_component"] >= 1


def test_crosswalk_keeps_source_candidate_states_explicit():
    report = load_report()
    states = report["counts"]["course_rows_by_source_candidate_state"]
    assert states["multiple_exact_detail_candidates_context_review"] > 0
    assert states["no_structured_detail_candidate"] > 0
    assert all(row["official_pdf"] for row in report["course_rows"])
