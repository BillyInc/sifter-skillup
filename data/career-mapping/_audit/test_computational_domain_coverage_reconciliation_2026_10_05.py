import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def test_generic_isco_subgroup_phrases_do_not_promote_computational_specializations():
    report = read_json(AUDIT / "computational_candidate_triage_2026_10_05.json")
    rows = {row["domain_id"]: row for row in report["domains"]}

    assert rows["D142"]["triage_tier"] == "research_named_specialization_candidate"
    assert rows["D065"]["triage_tier"] != "research_named_specialization_candidate"
    assert rows["D135"]["triage_tier"] != "research_named_specialization_candidate"
    assert any(
        row.get("signal_source") == "isco_or_legacy_subgroup_aggregate_not_domain_owned"
        for row in rows["D065"]["occupational_aggregate_signals_not_used_as_fit_proof"]
    )


def test_computational_role_method_links_are_explicit_not_isco_inferred():
    report = read_json(AUDIT / "computational_coverage_report.json")

    assert report["summary"]["groups"] == 39
    assert report["summary"]["related_role_links"] == 4
    assert report["summary"]["invalid_role_links"] == 0
    assert report["summary"]["groups_without_explicit_role_method_link"] == 38
    assert all(
        row["role_fit_source"] == "computational_role_subgroup_links.json; no ISCO-derived membership inference"
        for row in report["groups"]
    )


def test_game_theory_is_not_automatically_counted_as_computational():
    evidence = read_json(ROOT / "computational_method_evidence.json")
    rows = [row for row in evidence["methods"] if row["name"] == "game theory"]

    assert len(rows) == 4
    assert all(row["computational_status"] == "not_inherently_computational" for row in rows)
    assert all("not proof of fit" in row["role_link_disposition"] for row in rows)


def test_d078_label_has_multiregional_source_record_and_no_role_assignment():
    structure = read_json(ROOT / "domain_structure.json")
    manifest = read_json(ROOT / "computational_layer_manifest.json")
    review = read_json(AUDIT / "D078_computational_specialization_review_2026_10_05.json")
    label = "Computational and Quantitative Social Research"

    subgroup = next(row for row in structure["D078"]["subgroups"] if row["isco_submajor"] == "21")
    manifest_group = next(row for row in manifest["groups"] if row["domain_id"] == "D078" and row["isco_submajor"] == "21")
    assert subgroup["label"] == manifest_group["label"] == label
    assert len(review["specialization"]["sources"]) >= 4
    assert review["role_disposition"]["role_to_specialization"] == "deferred until the full specialization set is reviewed"


def test_health_domain_scope_holds_are_source_backed_and_local_rules_are_labelled():
    medicine = read_json(AUDIT / "specialization_lanes_2026_10_05/D003_D084/D023_specialization_review.json")
    nursing = read_json(AUDIT / "specialization_lanes_2026_10_05/D003_D084/D024_specialization_review.json")
    metadata = read_json(ROOT / "domain_meta.json")

    assert medicine["review_status"] == "parent_scope_reconciliation_required_before_specialization_count"
    assert medicine["current_state"]["active_role_mappings"] == 49
    assert nursing["review_status"] == "parent_scope_reconciliation_required_before_specialization_count"
    assert nursing["current_state"]["active_role_mappings"] == 38
    d024 = metadata["D024"]
    assert "Nigeria" not in d024["description"]
    assert d024["jurisdiction_specific_context"][0]["jurisdiction"] == "Nigeria"
    assert d024["jurisdiction_specific_context"][0]["source_url"] == "https://www.nmcn.gov.ng/unitreg.html"
