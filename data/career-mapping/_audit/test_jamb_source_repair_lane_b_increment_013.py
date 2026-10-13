import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).parents[3]
LEDGER = ROOT / "data" / "career-mapping" / "jamb" / "social_management_offerings.json"
SOURCE_TEXT = ROOT / "data" / "career-mapping" / "_jamb_txt" / "Social Management Science.txt"
OFFICIAL_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf"

EXPECTED_NAMES = [
    "Peace and Conflict Studies",
    "Psychology",
    "Public Administration",
    "Public Administration and Local Govt",
    "Public Administration and Policy Studies",
    "Government and Public Administration",
    "Sociology and Anthropology",
    "Social Work",
]

# Hashes captured before this tranche. They cover the offering/institution set,
# national requirements, Direct Entry text, and all waivers.
UNCHANGED_FIELD_HASHES = {
    "Peace and Conflict Studies": "2b9d65cebe64eeaba5ab0a4239d759b146eb086653de535c957a9b7065b4f461",
    "Psychology": "c8ac42e5bff4226a634f9e0bb155748814e1bfcfe1c4d5705b5f2548ce2bca01",
    "Public Administration": "101b6505a8e8e9a71897c079a9d84e91cb400666d3abd2284111f52c7fc8fc61",
    "Public Administration and Local Govt": "23bbcd839cff9bb98d6ea62dff56ce87c164d3e9607623b41bc56d7b3fb3ae46",
    "Public Administration and Policy Studies": "e8dc0bc26708d78a966f11d4b75cabf9a1f86f3f3edbfd883704b014fc47f68c",
    "Government and Public Administration": "21e3c1056fe8d1d673aa9e63e7ed8af65a835b2a8cd3ffff0e6b29015df8a533",
    "Sociology and Anthropology": "7b88977e58a9677257b059b7d4d34a3156024f68c98e752b36215d62353570ec",
    "Social Work": "b9e311b3a007df3c395de6eed35ad7592e2ca21f4c319fa8a47d5ebef8d4ed80",
}


def _find_anchor(lines, predicate, after):
    return next((i for i in range(after, len(lines)) if predicate(lines[i], i)), None)


def _assert_awarder_sequence(lines, start, codes, width):
    cursor = start + 1
    end = min(len(lines), start + width)
    for code in codes:
        pattern = re.compile(r"^\s*" + re.escape(code) + r"(?:\s|$)", re.IGNORECASE)
        found = next((i for i in range(cursor, end) if pattern.search(lines[i])), None)
        assert found is not None, f"{code} not found in its bounded awarder cell"
        cursor = found + 1


def test_lane_b_rows_42_to_49_have_source_cells_and_leave_admission_data_unchanged():
    payload = json.loads(LEDGER.read_text(encoding="utf-8"))
    rows = payload["programmes"]
    tranche = rows[41:49]
    lines = SOURCE_TEXT.read_text(encoding="cp1252").split("\n")

    assert [row["jamb_name"] for row in tranche] == EXPECTED_NAMES
    # Rows 50 onward are the remaining boundary after this tranche.
    assert rows[49]["jamb_name"] == "Sociology"

    expected_verified = [False, True, True, True, True, False, True, True]

    for row, verified in zip(tranche, expected_verified):
        evidence = row["source_verification"]
        assert evidence["verified_against_pdf"] is verified
        assert evidence["official_source_url"] == OFFICIAL_URL
        assert evidence["verification_date"] == "2026-09-28"
        assert evidence["pdf_table_locator"]
        assert evidence["note"]
        if verified:
            assert evidence["verified_institution_codes"] == row["institutions"]
        else:
            assert evidence["verified_institution_codes"] == []

        preserved = {
            key: row.get(key)
            for key in (
                "institutions",
                "utme_subjects",
                "olevel_requirement",
                "direct_entry",
                "institution_waivers",
            )
        }
        digest = hashlib.sha256(
            json.dumps(preserved, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
        ).hexdigest()
        assert digest == UNCHANGED_FIELD_HASHES[row["jamb_name"]]

    assert "duplicate-token caveat" in tranche[2]["source_verification"]["note"]
    assert "transposed letters" in tranche[6]["source_verification"]["note"]
    # Exact section inspection exposed two index-only offerings; do not let a
    # neighboring title or broad word-prefix falsely confirm their awarders.
    assert "PEACE STUDIES AND" in " ".join(line.strip() for line in lines)
    assert "Government and Public Administration" in SOURCE_TEXT.read_text(encoding="cp1252")
