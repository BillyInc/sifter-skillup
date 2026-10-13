import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
STRUCTURE = ROOT / "domain_structure.json"
CATALOG = ROOT / "domain_specialization_catalog.json"
REPORT = ROOT / "_audit" / "AREA_SOURCE_LINK_RECONCILIATION_2026_10_07.json"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def test_all_canonical_areas_have_area_specific_source_references():
    structure = load(STRUCTURE)
    report = load(REPORT)
    areas = [
        area
        for domain in structure.values()
        if isinstance(domain, dict)
        for area in domain.get("areas_of_specialization") or []
    ]
    assert len(structure) == 168
    assert len(areas) == 708
    assert report["counts"]["areas_with_area_linked_source_references"] == 708
    assert report["counts"]["areas_without_area_linked_source_references"] == 0
    assert report["unresolved_areas"] == []
    assert all(area["source_evidence_status"] == "source_linked" for area in areas)
    assert all(area.get("source_references") for area in areas)


def test_source_pass_preserves_area_catalogue_and_student_visibility_contract():
    structure = load(STRUCTURE)
    catalog = load(CATALOG)
    for catalog_domain in catalog["domains"]:
        domain_id = catalog_domain["domain_id"]
        canonical = structure[domain_id]
        assert [area["area_id"] for area in canonical["areas_of_specialization"]] == [
            area["area_key"] for area in catalog_domain["areas"]
        ]
        assert [area["label"] for area in canonical["areas_of_specialization"]] == [
            area["label"] for area in catalog_domain["areas"]
        ]
    report = load(REPORT)
    safety = report["safety"]
    assert safety["area_labels_changed"] is False
    assert safety["area_boundaries_changed"] is False
    assert safety["area_counts_changed"] is False
    assert safety["role_records_changed"] is False
    assert safety["role_domain_conditionality_changed"] is False
    assert safety["student_visibility_enabled"] is False
