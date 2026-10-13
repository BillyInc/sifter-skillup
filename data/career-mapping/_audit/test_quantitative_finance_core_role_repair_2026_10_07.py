import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ROLE_FILE = ROOT / "role_library_v3_cleaned.json"
REPORT = ROOT / "_audit" / "QUANTITATIVE_FINANCE_CORE_ROLE_REPAIR_2026_10_07.json"


def test_quantitative_finance_core_roles_are_canonical_and_routed():
    rows = json.loads(ROLE_FILE.read_text(encoding="utf-8"))
    by_name = {
        row["role_name"]: row
        for row in rows
        if row.get("domain_id") == "D011"
    }
    expected = {
        "quantitative researcher": "D011:systematic-investment-and-quantitative-trading",
        "quantitative developer": "D011:quantitative-pricing-and-financial-engineering",
        "quantitative trader": "D011:systematic-investment-and-quantitative-trading",
        "quantitative analyst": "D011:quantitative-pricing-and-financial-engineering",
        "financial risk specialist": "D011:quantitative-financial-risk-modeling",
    }
    for name, area in expected.items():
        row = by_name[name]
        assert row["domain_fit_review_status"] == "supported"
        assert row["specialization_fit_review_status"] == "supported"
        assert row["specialization_fit_area_key"] == area
        assert row["role_area_routes"]
        assert all(route["status"] == "supported" for route in row["role_area_routes"])
        assert all(route["evidence"] for route in row["role_area_routes"])


def test_repair_report_is_idempotent_and_source_registered():
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    assert report["status"] == "applied"
    applied_or_existing = set(report.get("applied_role_names", [])) | set(report.get("skipped_existing_role_names", []))
    assert applied_or_existing == {
        "quantitative researcher",
        "quantitative developer",
        "quantitative trader",
        "quantitative analyst",
        "financial risk specialist",
    }
    assert any("onetonline.org" in source for source in report["sources"])
    assert any("citadel.com" in source for source in report["sources"])
    assert any("citi.com" in source for source in report["sources"])
