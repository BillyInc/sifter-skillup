from audit_specialization_review_artifact_coverage_2026_10_06 import build_report


def test_every_catalogue_domain_has_a_review_artifact():
    report = build_report()
    assert report["catalogue_domain_count"] == 168
    assert report["domains_with_review_artifacts"] == 168
    assert report["domains_without_review_artifacts"] == 0
    assert report["missing_domain_ids"] == []


def test_review_artifacts_have_no_unknown_domain_ids_or_malformed_json():
    report = build_report()
    assert report["invalid_domain_ids_in_review_artifacts"] == []
    assert report["malformed_review_json_files"] == []


def test_artifact_coverage_is_not_misrepresented_as_canonical_signoff():
    report = build_report()
    assert "Artifact presence only" in report["purpose"]
    assert report["canonical_taxonomy_changed"] is False
