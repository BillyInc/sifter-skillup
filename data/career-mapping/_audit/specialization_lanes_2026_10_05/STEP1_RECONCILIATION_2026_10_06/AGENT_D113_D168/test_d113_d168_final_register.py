import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
FINAL = HERE / "d113_d168_step1_reconciliation_register_2026_10_06_v005.json"


def test_final_register_covers_all_56_domains_and_has_no_step1_deferrals():
    data = json.loads(FINAL.read_text(encoding="utf-8"))
    rows = data["records"]
    assert [row["domain_id"] for row in rows] == [f"D{i:03d}" for i in range(113, 169)]
    assert all(row["step1_reconciliation_status"] == "resolved" for row in rows)
    assert all(row["exact_current_subgroup_comparison"]["records"] is not None for row in rows)
    assert not data["canonical_taxonomy_modified"]
    assert not data["nigerian_context_added"]
    assert not data["role_audit_performed"]


def test_all_15_prior_residuals_have_resolution_and_auditable_evidence():
    data = json.loads(FINAL.read_text(encoding="utf-8"))
    rows = {row["domain_id"]: row for row in data["records"]}
    ids = {"D113", "D115", "D116", "D118", "D119", "D120", "D121", "D122", "D123", "D128", "D145", "D152", "D161", "D165", "D168"}
    for domain_id in ids:
        row = rows[domain_id]
        assert row["final_step1_recommendation"]
        assert row["resolution_status"].startswith("resolved")
        assert row["remaining_blocker"] is None
        assert row["final_student_facing_areas"]
        assert all(area["label"] and area["boundary"] for area in row["final_student_facing_areas"])
        sources = row["captured_domain_sources"] + row["supplemental_external_sources"]
        assert sources
        assert all(source.get("url", "").startswith("https://") and source.get("locator") for source in sources)


def test_all_rows_have_source_ids_urls_and_locators():
    data = json.loads(FINAL.read_text(encoding="utf-8"))
    for row in data["records"]:
        for source in row["captured_domain_sources"]:
            assert source["source_id"]
            assert source["url"].startswith("https://")
            assert source["locator"]


def test_role_fit_is_not_claimed_as_completed_or_used_as_area_evidence():
    data = json.loads(FINAL.read_text(encoding="utf-8"))
    assert data["role_audit_performed"] is False
    assert all("Not part of this lane" in row["step1_role_link_gate"] for row in data["records"])
