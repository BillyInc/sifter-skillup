import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / "data" / "career-mapping"
AUDIT = DATA / "_audit"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def test_all_reconciled_areas_are_present_in_canonical_domain_source():
    structure = load(DATA / "domain_structure.json")
    catalog = load(DATA / "domain_specialization_catalog.json")
    assert len(structure) == 168
    areas = [area for domain in catalog["domains"] for area in domain["areas"]]
    assert len(areas) == 708
    assert len({area["area_key"] for area in areas}) == 708
    assert sum(len(row.get("areas_of_specialization") or []) for row in structure.values()) == 708
    assert sum(not (row.get("areas_of_specialization") or []) for row in structure.values()) == 4


def test_area_records_have_stable_identity_and_remain_gated_until_routes_are_ready():
    structure = load(DATA / "domain_structure.json")
    ids = []
    for domain_id, domain in structure.items():
        assert domain["areas_of_specialization_status"].startswith("applied_as_canonical_source_data")
        for area in domain.get("areas_of_specialization") or []:
            assert area["area_id"].startswith(f"{domain_id}:")
            assert area["label"]
            assert area["boundary"]
            assert area["student_visible"] is False
            ids.append(area["area_id"])
    assert len(ids) == len(set(ids)) == 708


def test_apply_report_uses_current_complete_role_area_lanes_and_surfaces_evidence_gaps():
    report = load(AUDIT / "GLOBAL_SPECIALIZATION_CANONICAL_APPLY_2026_10_07.json")
    counts = report["counts"]
    assert counts["active_unique_role_count"] == 3391
    assert counts["role_area_review_total"] == 3391
    assert counts["role_area_lane_counts"] == {
        "D001_D056": 1510,
        "D057_D112": 1034,
        "D113_D168": 847,
    }
    statuses = counts["role_area_review_statuses"]
    assert statuses["review_required"] == 3312
    assert statuses["supported_manual_task_and_area_evidence"] == 21
    assert statuses["supported"] == 10
    assert statuses["direct_domain_role"] == 2
    assert statuses["alias_existing"] == 3
    assert statuses["direct_or_supported_route"] == 43
    assert counts["area_records_without_area_linked_source_reference"] == len(
        report["area_records_without_area_linked_source_reference"]
    )
    assert report["safety"]["student_visibility_enabled"] is False


def test_area_source_link_reconciliation_applied_to_all_708_without_visibility_promotion():
    report = load(AUDIT / "AREA_SOURCE_LINK_RECONCILIATION_2026_10_07.json")
    counts = report["counts"]
    assert counts["domains_processed"] == 168
    assert counts["areas_processed"] == 708
    assert counts["areas_with_area_linked_source_references"] == 577
    assert counts["areas_without_area_linked_source_references"] == 131
    assert counts["new_area_specific_primary_sources"] == 4
    assert len(report["unresolved_areas"]) == 131
    structure = load(DATA / "domain_structure.json")
    all_areas = [area for domain in structure.values() for area in domain.get("areas_of_specialization") or []]
    assert len(all_areas) == 708
    assert sum(bool(area.get("source_references")) for area in all_areas) == 577
    assert sum(area.get("student_visible") is True for area in all_areas) == 0
    assert report["safety"]["role_records_changed"] is False
