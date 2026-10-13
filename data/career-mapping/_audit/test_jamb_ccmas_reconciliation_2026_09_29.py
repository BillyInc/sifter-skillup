import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
CCMAS = ROOT / "ccmas" / "allied_health.json"
SCIENCES = ROOT / "jamb" / "sciences_offerings.json"
ENGINEERING = ROOT / "jamb" / "engineering_offerings.json"
OFFERING_INVENTORY = AUDIT / "jamb_offering_context_inventory_2026-09-25.json"
NUC_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf"


def test_pst322_reconciles_all_audited_fields_without_inventing_practical_hours():
    data = json.loads(CCMAS.read_text(encoding="utf-8"))
    row = next(course for p in data["programmes"] if p["name"] == "Physiotherapy" for course in p["courses"] if course["code"] == "PST 322")
    assert row["title"] == "Electrotherapy II: Thermal & Radiation Agents in Physiotherapy"
    assert (row["units"], row["status"], row["lh"], row["ph"]) == (2, "C", 30, None)
    assert len(row["skills_learned"]) == 6
    for topic in ("ultraviolet", "ultrasound", "laser"):
        assert topic in row["content_summary"].casefold()
    assert row["source_url"] == NUC_URL
    assert "printed p. 611" in row["source_locator"]
    assert row["source_accessed_on"] == "2026-09-29"


def test_biochemistry_locator_points_to_exact_heading_and_awarder_block():
    data = json.loads(SCIENCES.read_text(encoding="utf-8"))
    row = next(p for p in data["programmes"] if p["jamb_name"].upper() == "BIOCHEMISTRY AND MOLECULAR BIOLOGY")
    assert row["institutions"] == ["DOU", "HENSARD", "ZAMFARA"]
    assert row["source_locator"].startswith("Sciences.txt:419-423")
    assert row["source_accessed_on"] == "2026-09-29"
    assert row["source_context_status"] == "source_text_confirmed"


def test_polymer_row_and_inventory_retain_only_source_verified_awarders():
    data = json.loads(ENGINEERING.read_text(encoding="utf-8"))
    row = next(p for p in data["programmes"] if p["jamb_name"] == "Polymer and Textile Engineering")
    assert row["institutions"] == ["FUTO", "UNIZIK"]
    verification = row["source_verification"]
    assert verification["verified_against_pdf"] is True
    assert verification["evidence_hold"] is False
    assert "printed p. 368" in verification["pdf_table_locator"]
    assert verification["official_source_url"].endswith("brochure-degree-engineering.pdf")

    inventory = json.loads(OFFERING_INVENTORY.read_text(encoding="utf-8"))
    identity = next(item for item in inventory["identities"] if item["canonical_order"] == 311)
    occurrence = next(item for item in identity["source_offerings"] if item["occurrence_id"] == "be319f684b95a753")
    assert occurrence["institution_tokens_as_parsed"] != ["FUTO", "UNIZIK"]
    assert occurrence["institution_codes_verified_from_pdf"] == ["FUTO", "UNIZIK"]
    assert occurrence["offering_row_verified_against_pdf"] is True


def test_cs_it_occurrence_is_source_confirmed_without_absorbing_information_science():
    data = json.loads(SCIENCES.read_text(encoding="utf-8"))
    row = next(p for p in data["programmes"] if p["jamb_name"] == "Computer Science and Information Technology")
    assert row["institutions"] == ["ACHIEVERS", "BABCOCK", "IGBINEDION", "OAUSTECH"]
    assert row["source_context_status"] == "source_text_confirmed"
    assert "evidence_hold_reason" not in row
    assert row["source_url"].endswith("brochure-degree-sciences.pdf")
    assert "printed pp. 623-624" in row["source_locator"]
    assert row["source_accessed_on"] == "2026-09-29"

    separate = next(p for p in data["programmes"] if p["jamb_name"] == "Computer Science and Information Science")
    assert separate["institutions"] == ["BINGHAM", "LCITY"]

    inventory = json.loads(OFFERING_INVENTORY.read_text(encoding="utf-8"))
    identity = next(item for item in inventory["identities"] if item["canonical_order"] == 142)
    occurrence = identity["source_offerings"][0]
    assert occurrence["institution_codes_verified_from_pdf"] == row["institutions"]
    assert occurrence["offering_row_verified_against_pdf"] is True
