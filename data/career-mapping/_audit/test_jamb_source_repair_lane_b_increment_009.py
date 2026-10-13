import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
LEDGER = ROOT / "data" / "career-mapping" / "jamb" / "social_management_offerings.json"
SOURCE_TEXT = ROOT / "data" / "career-mapping" / "_jamb_txt" / "Social Management Science.txt"
OFFICIAL_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf"


def _rows():
    return json.loads(LEDGER.read_text(encoding="utf-8"))["programmes"]


def _source_lines():
    return SOURCE_TEXT.read_text(encoding="cp1252").splitlines()


def _verified(row, title, locator):
    verification = row["source_verification"]
    assert verification["verified_against_pdf"] is True
    assert verification["official_source_url"] == OFFICIAL_URL
    assert verification["verification_date"] == "2026-09-28"
    assert title in verification["pdf_table_locator"]
    assert locator in verification["pdf_table_locator"]
    assert verification["verified_institution_codes"] == row["institutions"]


def test_lane_b_rows_8_to_17_have_bounded_item_level_evidence():
    rows = _rows()
    source = "\n".join(_source_lines())
    slice_rows = rows[7:17]
    assert [row["jamb_name"] for row in slice_rows] == [
        "Population Studies",
        "Economics and Statistics",
        "Economics and Development Studies",
        "Economics with/and Operation Research",
        "Peace and Development Studies",
        "Economics",
        "Industrial Relations / Industrial and Labour Relations",
        "Industrial Relations and Personnel Management / Industrial Relations and Human Resource Management",
        "Intelligence and Security Studies",
        "International Relations",
    ]

    _verified(slice_rows[0], "POPULATION STUDIES", "printed pp. 624–626")
    population_start = next(i for i, line in enumerate(_source_lines()) if line.startswith("POPULATION STUDIES  Two (2)"))
    geography_start = next(i for i, line in enumerate(_source_lines()[population_start + 1 :], population_start + 1) if line.strip().startswith("GEOGRAPHY"))
    assert "JABU" in "\n".join(_source_lines()[population_start:geography_start])

    small_economics = source[source.index("ECONOMICS AND                   and at least one of Mathematics") :]
    small_economics = small_economics[: small_economics.index("CRIMINOLOGY AND")]
    for row, title in zip(slice_rows[1:5], [
        "ECONOMICS AND STATISTICS",
        "ECONOMICS AND DEVELOPMENT STUDIES",
        "ECONOMICS WITH OPERATION RESEARCH",
        "PEACE AND DEVELOPMENT STUDIES",
    ]):
        _verified(row, title, "printed")
        assert all(code in small_economics for code in row["institutions"])
        assert "requirement" in row["source_verification"]["note"].lower()

    economics_start = source.index("ECONOMICS        Two (2)")
    economics_end = source.index("ECONOMICS AND                   and at least one of Mathematics", economics_start)
    economics_block = source[economics_start:economics_end]
    _verified(slice_rows[5], "ECONOMICS", "192 listed institution codes")
    assert len(slice_rows[5]["institutions"]) == 192
    assert all(code in economics_block for code in slice_rows[5]["institutions"])
    assert "Shared economics requirements are not split" in slice_rows[5]["source_verification"]["note"]

    _verified(slice_rows[6], "INDUSTRIAL RELATIONS", "printed p. 675")
    for code in slice_rows[6]["institutions"]:
        assert code in source[source.index("INDUSTRIAL RELATIONS  i)") : source.index("INDUSTRIAL RELATIONS  Two")]

    combined = slice_rows[7]["source_verification"]
    assert combined["verified_against_pdf"] is False
    assert combined["official_source_url"] == OFFICIAL_URL
    assert combined["verification_date"] == "2026-09-28"
    assert "not established" in combined["note"]
    assert slice_rows[7]["institutions"] == ["AJAYI", "BENIN", "DOU", "KOMU", "RITMAN", "UNI-AFRICA"]

    _verified(slice_rows[8], "INTELLIGENCE AND SECURITY STUDIES", "printed pp. 679–684")
    assert all(code in source[source.index("INTELLIGENCE      AND") :] for code in slice_rows[8]["institutions"])
    assert "not edited or attributed exclusively" in slice_rows[8]["source_verification"]["note"]

    relations_hold = slice_rows[9]["source_verification"]
    assert relations_hold["verified_against_pdf"] is False
    assert relations_hold["official_source_url"] == OFFICIAL_URL
    assert relations_hold["verification_date"] == "2026-09-28"
    assert "WESTERN-DEL" in relations_hold["note"] and "WESTLAND" in relations_hold["note"]

    # Requirements are preserved, not reassigned from adjacent/shared columns.
    assert slice_rows[0]["utme_subjects"] == "Economics, Geography and other subject."
    assert slice_rows[5]["olevel_requirement"].startswith("Five (5) SSC credit passes")
    assert rows[17]["jamb_name"] == "International Relations and Diplomacy"
    # This row was intentionally verified by the following checkpoint 011.
    assert rows[17]["source_verification"]["verified_against_pdf"] is True
