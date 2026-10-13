import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
REVIEW = HERE / "D057_D112_existing_role_area_fit_review_2026_10_07.json"
SPARSE = HERE / "D057_D112_sparse_candidate_global_area_review_2026_10_07.json"
CHECKPOINT = HERE / "D057_D112_role_area_and_nigerian_context_checkpoint_2026_10_07.json"
CATALOG = ROOT / "data/career-mapping/domain_specialization_catalog.json"
CONTEXT = ROOT / "data/career-mapping/_audit/specialization_lanes_2026_10_05/STEP1_RECONCILIATION_2026_10_06/STEP2_NIGERIAN_CONTEXT_2026_10_06/D057_D112/D057_D112_nigerian_context_evidence_2026_10_06.json"


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def test_lane_role_inventory_is_complete_and_fit_gates_are_separate():
    report = load(REVIEW)
    roles = report["roles"]
    assert len(roles) == 1034
    assert len({r["role_key"] for r in roles}) == 1034
    assert all(r["role_task_evidence"] for r in roles)
    assert all(r["parent_domain_fit"]["status"] in {"supported", "conditional"} for r in roles)
    area_statuses = [r["area_fit"]["status"] for r in roles]
    assert area_statuses.count("supported") == 10
    assert area_statuses.count("alias_existing") == 3
    assert area_statuses.count("direct_domain_role") == 2
    assert area_statuses.count("review_required") == 1019
    assert all(r["area_fit"]["area_key"] for r in roles if r["area_fit"]["status"] == "supported")
    assert report["policy"]["isco_esco_membership_used_as_fit_evidence"] is False
    assert report["policy"]["canonical_files_edited"] is False


def test_sparse_lane_is_disjoint_and_candidates_have_separate_area_fit_gate():
    report = load(SPARSE)
    rows = report["decisions"]
    assert len(rows) == 102
    assert {int(r["domain_id"][1:]) for r in rows} <= set(range(57, 113))
    assert all(r["exact_role_task_evidence"] for r in rows)
    assert all(r["recommended_area_fit"]["status"] == "review_required" for r in rows)
    assert all(r["recommended_area_fit"]["area_key"] is None for r in rows)
    assert report["fit_policy"]["canonical_files_edited"] is False


def test_nigerian_context_prior_ledger_covers_every_normalized_area():
    catalog = load(CATALOG)
    ledger = load(CONTEXT)
    expected = {(d["domain_id"], a["label"]) for d in catalog["domains"]
                if 57 <= int(d["domain_id"][1:]) <= 112 for a in d.get("areas", [])}
    actual = {(r["domain_id"], r["global_area_label"]) for r in ledger["records"]}
    assert len(expected) == 209
    assert expected <= actual
    assert ledger["canonical_taxonomy_changed"] is False
    assert ledger["roles_audited_or_changed"] is False
    assert all(r.get("exact_url") and r.get("locator") and r.get("what_it_supports") and r.get("limits")
               for r in ledger["records"])
