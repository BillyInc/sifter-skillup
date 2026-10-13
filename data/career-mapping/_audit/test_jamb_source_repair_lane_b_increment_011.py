import json
from pathlib import Path
import re


ROOT = Path(__file__).parents[3]
LEDGER = ROOT / "data" / "career-mapping" / "jamb" / "social_management_offerings.json"
SCIENCES_LEDGER = ROOT / "data" / "career-mapping" / "jamb" / "sciences_offerings.json"
SOURCE_TEXT = ROOT / "data" / "career-mapping" / "_jamb_txt" / "Social Management Science.txt"
OFFICIAL_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf"


def _rows():
    return json.loads(LEDGER.read_text(encoding="utf-8"))["programmes"]


def _source_lines():
    return SOURCE_TEXT.read_text(encoding="cp1252").splitlines()


def _line_index(lines, prefix, after=-1):
    return next(i for i, line in enumerate(lines) if i > after and line.startswith(prefix))


def _verified(row, title, locator_fragment):
    verification = row["source_verification"]
    assert verification["verified_against_pdf"] is True
    assert verification["official_source_url"] == OFFICIAL_URL
    assert verification["verification_date"] == "2026-09-28"
    assert title.upper() in verification["pdf_table_locator"].upper()
    assert locator_fragment in verification["pdf_table_locator"]
    assert verification["verified_institution_codes"] == row["institutions"]


def _left_column_codes(lines, institutions):
    return {
        code
        for code in institutions
        if any(
            line.startswith(code)
            and (len(line) == len(code) or line[len(code)].isspace())
            for line in lines
        )
    }


def test_lane_b_rows_26_to_33_confirm_exact_cells_and_keep_shared_rules_separate():
    rows = _rows()
    source_lines = _source_lines()
    reviewed = rows[25:33]
    expected = [
        ("LIBRARY SCIENCE", ["AUE"], "p. 634"),
        (
            "LIBRARY AND INFORMATION SCIENCE",
            ["ABUJA", "AJAYI", "AL-HIKMAH", "ATIBA", "BASU", "BAZE", "COOU", "DELSUT", "FED-DUTSINMA", "FED-LOKOJA", "AEFUNA", "KOLADAISI", "KUST", "MAUTY", "NDU", "PHC"],
            "p. 635",
        ),
        ("Policy and Strategic Studies", ["COVENANT"], "p. 646"),
        ("Policy and Administrative Studies", ["CALABAR"], "p. 646"),
        ("Social Justice", ["ABUAD", "CLIFFORD"], "p. 646"),
        ("Political Science", rows[30]["institutions"], "pp. 650"),
        ("Political Science / International Law and Diplomacy", ["BABCOCK"], "p. 654"),
        ("Political Science and Diplomacy", ["VERITAS"], "p. 655"),
    ]

    assert [row["jamb_name"] for row in reviewed] == [entry[0] for entry in expected]
    for row, (title, institutions, locator) in zip(reviewed, expected):
        assert row["institutions"] == institutions
        _verified(row, title, locator)

    lib_science_start = _line_index(source_lines, "LIBRARY SCIENCE  (i)")
    lib_info_start = _line_index(source_lines, "LIBRARY AND", lib_science_start)
    lib_science_cell = source_lines[lib_science_start:lib_info_start]
    assert _left_column_codes(lib_science_cell, reviewed[0]["institutions"]) == set(reviewed[0]["institutions"])

    lib_info_last = _line_index(source_lines, "PHC", lib_info_start)
    lib_info_cell = source_lines[lib_info_start : lib_info_last + 1]
    assert _left_column_codes(lib_info_cell, reviewed[1]["institutions"]) == set(reviewed[1]["institutions"])

    policy_start = _line_index(source_lines, "POLICY AND STRATEGIC")
    policy_admin_start = _line_index(source_lines, "POLICY AND", policy_start)
    strategic_cell = source_lines[policy_start:policy_admin_start]
    strategic_management_start = _line_index(source_lines, "STRATEGIC", policy_admin_start)
    policy_admin_cell = source_lines[policy_admin_start:strategic_management_start]
    social_justice_start = _line_index(source_lines, "SOCIAL JUSTICE", strategic_management_start)
    environmental_start = _line_index(source_lines, "ENVIRONMENTAL", social_justice_start)
    social_justice_cell = source_lines[social_justice_start:environmental_start]
    for cell, row in zip((strategic_cell, policy_admin_cell, social_justice_cell), reviewed[2:5]):
        assert _left_column_codes(cell, row["institutions"]) == set(row["institutions"])

    political_start = next(i for i, line in enumerate(source_lines) if line.startswith("POLITICAL SCIENCE  Two"))
    political_end = next(i for i, line in enumerate(source_lines[political_start + 1 :], political_start + 1) if line.startswith("POLITICAL SCIENCE /"))
    political_cell = source_lines[political_start:political_end]
    assert _left_column_codes(political_cell, reviewed[5]["institutions"]) == set(reviewed[5]["institutions"])

    political_law_start = _line_index(source_lines, "POLITICAL SCIENCE /", political_end - 1)
    political_diplomacy_start = _line_index(source_lines, "POLITICAL SCIENCE AND", political_law_start)
    political_law_cell = source_lines[political_law_start:political_diplomacy_start]
    political_diplomacy_end = _line_index(source_lines, "POLITICAL SCIENCE AND  Two", political_diplomacy_start)
    political_diplomacy_cell = source_lines[political_diplomacy_start:political_diplomacy_end]
    for cell, row in zip((political_law_cell, political_diplomacy_cell), reviewed[6:8]):
        assert _left_column_codes(cell, row["institutions"]) == set(row["institutions"])

    # Requirements are shared or blank in the source table for these variants;
    # this tranche verifies only title/institution cells and keeps that status.
    assert reviewed[1]["utme_subjects"] is None
    assert reviewed[1]["olevel_requirement"] is None
    assert reviewed[1]["direct_entry"] is None
    assert "shared requirements column" in reviewed[3]["utme_subjects"]
    assert "as in Political Science" in reviewed[6]["olevel_requirement"]
    assert "as in Political Science" in reviewed[7]["direct_entry"]

    # Do not consume or re-index the next planned eight-row tranche.
    assert rows[33]["jamb_name"] == "Political Science and Public Administration"
    assert rows[33]["source_verification"]["verified_against_pdf"] is True
    assert rows[33]["source_verification"]["verification_date"] == "2026-09-28"

    # A canonical identity also has a distinct Social Sciences awarder cell
    # outside the eight sequential records. Preserve that source occurrence
    # separately rather than folding PAN-ATLANTIC into the Sciences row.
    social_context = [
        row for row in rows
        if row.get("source_occurrence_id")
        == "social-management-sciences|information-science-and-media-studies|pan-atlantic|p635"
    ]
    assert len(social_context) == 1
    assert social_context[0]["jamb_name"] == "INFORMATION SCIENCE AND MEDIA STUDIES"
    assert social_context[0]["institutions"] == ["PAN-ATLANTIC"]
    assert social_context[0]["utme_subjects"] is None
    assert social_context[0]["olevel_requirement"] is None
    assert social_context[0]["direct_entry"] is None
    information_media_start = _line_index(source_lines, "INFORMATION SCIENCE", lib_info_last)
    assert source_lines[information_media_start + 1].strip().startswith("AND MEDIA STUDIES")
    pan_atlantic_line = _line_index(source_lines, "PAN-ATLANTIC", information_media_start)
    information_media_cell = source_lines[information_media_start : pan_atlantic_line + 1]
    assert _left_column_codes(information_media_cell, ["PAN-ATLANTIC"]) == {"PAN-ATLANTIC"}
    science_rows = json.loads(SCIENCES_LEDGER.read_text(encoding="utf-8"))["programmes"]
    science_context = [
        row for row in science_rows
        if row["jamb_name"] == "INFORMATION SCIENCE AND MEDIA STUDIES"
    ]
    assert len(science_context) == 1
    assert science_context[0]["institutions"] == ["BAYERO", "CHRISTOPHER"]

    # The same official Social Sciences page also prints separate adjacent
    # titles that are absent from the canonical 420-name index. They are not
    # treated as aliases or folded into the eight ledger rows in this tranche.
    strategic_management_start = _line_index(source_lines, "STRATEGIC", policy_admin_start)
    assert _left_column_codes(source_lines[strategic_management_start : strategic_management_start + 4], ["NBU"]) == {"NBU"}
    assert _line_index(source_lines, "ENVIRONMENTAL", social_justice_start) > social_justice_start
    assert _line_index(source_lines, "RESOURCES", social_justice_start) > social_justice_start
    assert _line_index(source_lines, "CALABAR", social_justice_start) > social_justice_start
    jamb_map = json.loads((ROOT / "data" / "career-mapping" / "jamb_domain_map.json").read_text(encoding="utf-8"))
    assert "STRATEGIC MANAGEMENT" not in jamb_map
    assert "ENVIRONMENTAL PROTECTION AND RESOURCES MANAGEMENT" not in jamb_map
