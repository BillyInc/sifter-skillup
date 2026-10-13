"""Regression checks for the D078/D064 parent-domain boundary correction."""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_d078_area_keeps_stable_key_but_uses_bounded_student_label() -> None:
    data = (ROOT / "domain_structure.json").read_bytes()
    assert b'"area_id": "D078:psychology-social-behaviour"' in data
    assert b'"label": "Social Behaviour and Interaction"' in data
    assert b'"legacy_label": "Psychology and Social Behaviour"' in data
    assert b"separate Psychology and Counselling domain (D064)" in data
    assert b"clinical assessment, counselling, psychotherapy, diagnosis" in data


def test_d078_catalog_matches_canonical_boundary() -> None:
    data = (ROOT / "domain_specialization_catalog.json").read_bytes()
    assert b'"area_key": "D078:psychology-social-behaviour"' in data
    assert b'"label": "Social Behaviour and Interaction"' in data
    assert b'"legacy_label": "Psychology and Social Behaviour"' in data
    assert b'"boundary_reconciliation": "Retain the stable D078 area key' in data
