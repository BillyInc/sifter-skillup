import json
from pathlib import Path


ROOT = Path(__file__).parents[3]
LEDGER = ROOT / "data" / "career-mapping" / "jamb" / "social_management_offerings.json"
SOURCE_TEXT = ROOT / "data" / "career-mapping" / "_jamb_txt" / "Social Management Science.txt"
OFFICIAL_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf"


EXPECTED = [
    ("Political Science and Public Administration", ["AAU", "BENIN", "BIU", "IGBINEDION", "KWASU", "RHEMA", "WESTERN-DEL"]),
    ("Political and Administrative Studies", ["PHC"]),
    ("Political Science and International Relations", ["ABUJA", "CRAWFORD", "CUAB", "GOUU", "HENSARD", "KWARARAFA", "NILE", "TSUJ", "UNIOSUN"]),
    ("Political Science and International Studies", ["CUAB"]),
    ("Political Science and Conflict Resolution", ["AL-HIKMAH"]),
    ("Political Science and Defence Studies", ["NDA"]),
    ("Peace Studies and Conflict Resolution", ["AL-ANSAR", "ARTHUR-JARVIS", "AVE-MARIA", "BOSU", "CALEB", "CRUTECH", "EUI", "EKSU", "FED-OYE EKITI", "HUDA", "KWASU", "LUX-MUNDI", "MAAUN", "MADONNA", "NAUB", "NBU", "NILE", "OBONG", "PETER-UNI", "TSUJ", "UAGRIC-IMO", "UNIOSUN"]),
    ("Peace Strategic and Conflict Resolution", ["AJAYI"]),
]


def test_lane_b_rows_34_to_41_are_source_verified_without_changing_requirements():
    payload = json.loads(LEDGER.read_text(encoding="utf-8"))
    rows = payload["programmes"]
    source_lines = SOURCE_TEXT.read_text(encoding="cp1252").splitlines()
    reviewed = rows[33:41]

    assert [(row["jamb_name"], row["institutions"]) for row in reviewed] == EXPECTED
    assert rows[41]["jamb_name"] == "Peace and Conflict Studies"
    # A later Lane-B tranche verified rows 42–49; this test owns only 34–41.

    for row, (title, institutions) in zip(reviewed, EXPECTED):
        evidence = row["source_verification"]
        assert evidence["verified_against_pdf"] is True
        assert evidence["official_source_url"] == OFFICIAL_URL
        assert evidence["verification_date"] == "2026-09-28"
        assert evidence["verified_institution_codes"] == institutions == row["institutions"]
        assert title.upper() in evidence["pdf_table_locator"].upper()
        assert any(marker in evidence["pdf_table_locator"].lower() for marker in ("title", "heading"))
        assert all(
            any(line.startswith(code) and (len(line) == len(code) or line[len(code)].isspace()) for line in source_lines)
            for code in institutions
        )

    # The official source text contains the reviewed headings and their exact
    # order. This guards distinct adjacent offering names against collapsing.
    anchors = [
        "POLITICAL SCIENCE AND  Two (2)",
        "POLITICAL AND",
        "POLITICAL SCIENCE AND",
        "POLITICAL SCIENCE                                      ",
        "POLITICAL SCIENCE AND",
        "POLITICAL SCIENCE AND",
        "PEACE STUDIES AND",
        "PEACE STRATEGIC AND",
    ]
    positions = []
    after = 3600
    for anchor in anchors:
        position = next(i for i, line in enumerate(source_lines) if i > after and line.startswith(anchor))
        positions.append(position)
        after = position
    assert positions == sorted(positions)

    # Verification is occurrence-only: no requirement/waiver values were
    # rewritten in this tranche.
    assert reviewed[0]["utme_subjects"] == "Three (3) Arts or Social Science subjects"
    assert reviewed[1]["utme_subjects"].startswith("as in Political Science and Public Administration")
    assert reviewed[2]["olevel_requirement"] == "as in Political Science and Public Administration"
    assert reviewed[6]["utme_subjects"] is None
    assert reviewed[7]["olevel_requirement"] is None
