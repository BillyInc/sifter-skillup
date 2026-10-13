import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
REGISTER = json.loads((AUDIT / "computational_residual_resolution_2026_10_06.json").read_text(encoding="utf-8"))


def test_residual_partition_is_exact_and_canonical_files_are_untouched():
    counts = REGISTER["counts"]
    assert counts["external_candidate_classes_resolved"] == 7
    assert counts["unmatched_exact_local_titles"] == 0
    assert counts["stale_unmatched_signals_resolved_to_existing_local_roles"] == 3
    assert counts["externally_supported_alias_resolutions"] == 1
    assert counts["method_groups_total"] == 39
    assert counts["method_groups_with_explicit_role_link"] == 1
    assert counts["method_groups_without_explicit_role_link_resolved"] == 38
    assert counts["canonical_taxonomy_changes"] == 0
    assert counts["canonical_role_file_changes"] == 0
    assert counts["new_role_titles_proposed"] == 0
    assert counts["manifest_domain_structure_text_conflicts"] == 0
    assert REGISTER["canonical_taxonomy_written"] is False


def test_candidate_ids_and_parent_dispositions_are_present():
    ids = {row["candidate_id"] for row in REGISTER["external_candidate_dispositions"]}
    assert ids == {
        "D065_COMPUTATIONAL_LINGUISTICS",
        "D041_COMPUTATIONAL_SCIENCE_AND_ENGINEERING",
        "PHYSICS_RESEARCH_METHODS",
        "COMPUTATIONAL_CHEMISTRY_AND_BIOLOGY",
        "CFD_AND_COMPUTATIONAL_MECHANICS",
        "D078_COMPUTATIONAL_SOCIAL_RESEARCH",
        "D145_COMPUTATIONAL_NEUROSCIENCE_METHODS",
    }
    parents = {row["domain_id"] for row in REGISTER["parent_specific_dispositions"]}
    assert {"D017", "D018", "D022", "D041", "D065", "D132", "D135", "D138", "D142", "D155"} <= parents


def test_stale_unmatched_titles_are_reconciled_to_current_emerging_roles():
    titles = {(row["domain_id"], row["title"]) for row in REGISTER["existing_local_role_matches"]}
    assert titles == {
        ("D139", "gameplay programmer"),
        ("D139", "technical artist"),
        ("D139", "game environment artist"),
    }
    assert all(row["current_file"] == "emerging_role_overlays.json" for row in REGISTER["existing_local_role_matches"])
    assert all(row["canonical_action"].startswith("do_not_create_duplicate") for row in REGISTER["existing_local_role_matches"])
    assert REGISTER["unmatched_exact_titles"] == []
    alias = REGISTER["alias_resolutions"][0]
    assert alias["domain_id"] == "D140"
    assert alias["title"] == "robotics engineer"
    assert alias["matched_local_role"] == ["mechatronics engineer"]
    assert alias["matched_title_basis"] == ["explicit_also_known_as"]


def test_every_method_group_has_a_conservative_disposition_and_no_inferred_link():
    rows = REGISTER["method_group_dispositions"]
    assert len(rows) == 38
    assert len({row["group_key"] for row in rows}) == 38
    assert all(row["explicit_role_link_present"] is False for row in rows)
    assert all(row["exact_disposition"] == "method_group_retained_no_explicit_role_link" for row in rows)
    assert all(row["role_link_action"] == "do_not_add_or_infer" for row in rows)
    assert all(row["source_reference_ids"] for row in rows)


def test_sources_are_located_and_claim_bounded():
    sources = REGISTER["source_catalog"]
    assert len(sources) >= 20
    assert len({row["source_id"] for row in sources}) == len(sources)
    for row in sources:
        assert row["url"].startswith("https://")
        assert row["locator"]
        assert row["supports"]
        assert row["does_not_support"]


def test_every_disposition_reference_resolves_to_a_located_source():
    source_ids = {row["source_id"] for row in REGISTER["source_catalog"]}
    references = []
    for section in ("external_candidate_dispositions", "parent_specific_dispositions", "unmatched_exact_titles", "alias_resolutions", "method_group_dispositions"):
        for row in REGISTER[section]:
            references.extend(row["source_reference_ids"])
    assert set(references) <= source_ids


def test_global_limits_keep_role_fit_separate_from_method_existence():
    limits = " ".join(REGISTER["global_limits"])
    assert "Role-to-domain fit" in limits
    assert "ISCO" in limits
    assert "No Nigerian demand" in limits
    assert "no new role" in limits.lower()


def test_manifest_and_current_domain_structure_are_reconciled():
    consistency = REGISTER["manifest_domain_structure_consistency"]
    assert consistency["conflicts"] == []
    assert consistency["checked_group_count"] == 39
    assert "match domain_structure" in consistency["canonical_action"]


def test_coverage_report_separates_reviewed_no_links_from_unresolved_gaps():
    report = json.loads((AUDIT / "computational_coverage_report.json").read_text(encoding="utf-8"))
    counts = report["summary"]
    assert counts["groups_without_explicit_role_method_link"] == 38
    assert counts["groups_without_role_link_with_reviewed_no_link_disposition"] == 38
    assert counts["groups_without_role_link_missing_disposition"] == 0
    assert counts["unmatched_local_role_titles_pending_review"] == 0
    assert len(report["computational_residual_resolution"]["no_link_group_dispositions"]) == 38
    assert len(report["computational_residual_resolution"]["unmatched_local_role_titles"]) == 0
