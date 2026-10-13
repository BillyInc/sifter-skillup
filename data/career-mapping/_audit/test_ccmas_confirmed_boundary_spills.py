import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def get(filename, programme, code):
    document = json.loads((ROOT / "ccmas" / filename).read_text(encoding="utf-8"))
    package = next(item for item in document["programmes"] if item.get("name") == programme)
    return next(item for item in package["courses"] if item.get("code") == code)


def test_confirmed_boundary_spills_are_removed():
    for filename, programme, code in [
        ("allied_health.json", "Dental Therapy", "DTH 527"),
        ("allied_health.json", "Occupational Therapy", "OCT 525"),
        ("allied_health.json", "Optometry", "OPT 203"),
        ("allied_health.json", "Optometry", "OPT 698"),
        ("allied_health.json", "Prosthetics and Orthotics", "POT 317"),
        ("education.json", "Chemistry", "CHM 107"),
    ]:
        item = get(filename, programme, code)
        assert "Minimum Academic Standards Equipment" not in (item.get("content_summary") or "")
        assert "New" not in (item.get("content_summary") or "")
        assert item.get("source_url")
        assert item.get("source_locator")

    assert len(get("allied_health.json", "Optometry", "OPT 203")["skills_learned"]) == 7
    assert len(get("allied_health.json", "Prosthetics and Orthotics", "POT 317")["skills_learned"]) == 4
    assert len(get("education.json", "Chemistry", "CHM 107")["skills_learned"]) == 7


def test_vex599_duplicate_is_removed_without_losing_the_outcomes():
    item = get("veterinary.json", "Veterinary Medicine", "VEX 599")
    assert len(item["skills_learned"]) == 3
    assert len(set(item["skills_learned"])) == 3
