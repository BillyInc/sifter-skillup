import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]


def load(relative):
    return json.loads((ROOT / relative).read_text(encoding="utf-8"))


def test_d113_d168_existing_role_review_is_exhaustive_and_guarded():
    report = load("data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_existing_role_area_fit_review_2026_10_07.json")
    catalog = load("data/career-mapping/domain_specialization_catalog.json")
    valid_area_keys = {a["area_key"] for d in catalog["domains"] for a in d.get("areas", [])}
    records = report["records"]
    assert len(records) == 847
    assert len({r["normalized_role_key"] for r in records}) == len(records)
    assert all(r["exact_role_task_evidence"] for r in records if r["parent_domain_fit"]["status"] == "supported")
    assert all(not r["area_fit"]["area_key"] or r["area_fit"]["area_key"] in valid_area_keys for r in records)
    assert all(r["area_fit"]["status"] != "direct_domain_to_role" or not catalog_domain(catalog, r["domain_id"]).get("areas") for r in records)
    assert report["policy"]["isco_or_esco_group_membership_is_fit_evidence"] is False
    assert report["policy"]["title_alone_is_fit_evidence"] is False
    assert report["policy"]["current_subgroup_code_or_membership_is_fit_evidence"] is False
    assert report["counts"]["canonical_files_edited"] is False


def test_d113_d168_nigerian_context_reconciles_every_area_without_global_leakage():
    report = load("data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D113_D168/D113_D168_nigerian_area_context_reconciliation_2026_10_07.json")
    assert len(report["areas"]) == 213
    assert len({(r["domain_id"], r["area_key"]) for r in report["areas"]}) == 213
    assert all(r["global_area_boundary_unchanged"] for r in report["areas"])
    assert all(all(e.get(k) for k in ("url", "locator", "exact_nigerian_claim", "limitation"))
               for r in report["areas"] if r["nigerian_context_status"] == "nigerian_context_supported" for e in r["evidence"])
    assert report["policy"]["global_area_labels_or_boundaries_changed"] is False
    assert report["policy"]["nigerian_context_used_as_global_area_fit"] is False
    assert report["policy"]["policy_used_as_demand_or_vacancy_evidence"] is False
    assert report["counts"]["canonical_files_edited"] is False


def catalog_domain(catalog, domain_id):
    return next(d for d in catalog["domains"] if d["domain_id"] == domain_id)
