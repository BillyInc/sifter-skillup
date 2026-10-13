import json
import re
from pathlib import Path


ROOT = Path(__file__).parents[3]
LEDGER = ROOT / "data" / "career-mapping" / "jamb" / "social_management_offerings.json"
SOURCE_TEXT = ROOT / "data" / "career-mapping" / "_jamb_txt" / "Social Management Science.txt"
OFFICIAL_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf"


def test_lane_b_rows_18_to_25_preserve_distinct_official_source_cells():
    rows = json.loads(LEDGER.read_text(encoding="utf-8"))["programmes"]
    source = re.sub(r"\s+", " ", SOURCE_TEXT.read_text(encoding="cp1252").upper())
    reviewed = rows[17:25]
    expected = [
        ("International Relations and Diplomacy", ["ABUAD", "EL-AMIN", "FED-DUTSINMA", "ICONIC-OU", "KASU", "LUX-MUNDI", "NBU", "PEACELAND UNI", "PETER-UNI", "PHOENIX", "SAM-MARIS", "SALEM", "TANSIAN", "WESLEYUNI"], "p. 687"),
        ("International Relations and Diplomatic Studies", ["AVE-MARIA"], "p. 688"),
        ("International Studies", ["ABU", "ABU-ODL", "MAITAMA"], "p. 688"),
        ("International Studies and Diplomacy", ["BENIN"], "p. 689"),
        ("International and Comparative Politics", ["AUN"], "p. 689"),
        ("International Relationship & Strategic Studies", ["IGBINEDION", "NOVENA"], "p. 689"),
        ("History and International Relations", ["AL-HIKMA"], "p. 689"),
        ("History and International Studies", ["ESUTECH", "UNIHEZ", "VISION-UNI"], "p. 689"),
    ]

    assert len(reviewed) == len(expected)
    for row, (title, institutions, page) in zip(reviewed, expected):
        assert row["jamb_name"] == title
        assert row["institutions"] == institutions
        verification = row["source_verification"]
        assert verification["verified_against_pdf"] is True
        assert verification["official_source_url"] == OFFICIAL_URL
        assert verification["verified_institution_codes"] == institutions
        assert verification["verification_date"] == "2026-09-28"
        assert page in verification["pdf_table_locator"]
        # The extraction is column-interleaved, so title tokens may not be
        # contiguous even when the printed PDF row is contiguous visually.
        normalized_title = re.sub(r"\s+", " ", title.upper())
        assert all(token in source.split() for token in normalized_title.split())
        assert all(code.upper() in source for code in institutions)
        assert "title and institution cell only" in verification["note"].lower() or "confirms this social sciences occurrence" in verification["note"].lower()

    # Similar names in the other JAMB faculties are separate offering contexts.
    assert rows[17]["jamb_name"] == "International Relations and Diplomacy"
    assert rows[23]["jamb_name"] == "History and International Relations"
    # Keep the next bounded range unreviewed.
    assert rows[25]["jamb_name"] == "LIBRARY SCIENCE"
    assert "source_verification" not in rows[25]
