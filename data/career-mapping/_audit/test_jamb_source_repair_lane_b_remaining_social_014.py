import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).parents[3]
LEDGER = ROOT / "data" / "career-mapping" / "jamb" / "social_management_offerings.json"
SOURCE = ROOT / "data" / "career-mapping" / "_jamb_txt" / "Social Management Science.txt"
URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf"
CORE_FIELDS = ("institutions", "utme_subjects", "olevel_requirement", "direct_entry", "institution_waivers")
EXPECTED_HASHES = {
    "Sociology": "9a804cb96440d9419077e09f5f33f1aeb41433f4ccfb538e026316000f53b91b",
    "Film and Video Studies": "7e32ea4f577494c72aa203d104b307ac23356624642d2e889a3bf351604cfa37",
    "Sociology and Social Studies": "5f7b3cb12dcb24283a5e1c8b17a65c2eeea60720452ba9faea0b8129179a8eb5",
}


def _digest(row):
    core = {key: row.get(key) for key in CORE_FIELDS}
    return hashlib.sha256(
        json.dumps(core, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()


def test_social_management_remaining_rows_50_to_52_have_exact_official_cells():
    payload = json.loads(LEDGER.read_text(encoding="utf-8"))
    rows = payload["programmes"]
    tranche = rows[49:52]
    source_text = SOURCE.read_text(encoding="cp1252")
    assert [row["jamb_name"] for row in tranche] == list(EXPECTED_HASHES)

    for row in tranche:
        evidence = row["source_verification"]
        assert evidence["verified_against_pdf"] is True
        assert evidence["official_source_url"] == URL
        assert evidence["verification_date"] == "2026-09-28"
        assert evidence["verified_institution_codes"] == row["institutions"]
        assert _digest(row) == EXPECTED_HASHES[row["jamb_name"]]

    film = tranche[1]["source_verification"]["pdf_table_locator"]
    assert "printed p. 642" in film
    assert re.search(r"FILM AND VIDEO STUDIES(?:(?!FILM STUDIES AND PRODUCTION).){0,250}WESTERN-DEL", source_text, re.I | re.S)
    assert "FILM STUDIES AND" in source_text and "PRODUCTION" in source_text
    assert "KWASU" in source_text

    sociology = tranche[0]["source_verification"]["pdf_table_locator"]
    assert "printed pp. 675-678" in sociology
    assert re.search(r"SOCIOLOGY AND SOCIAL.{0,300}STUDIES.{0,40}DOU", source_text, re.I | re.S)
    assert "printed p. 678" in tranche[2]["source_verification"]["pdf_table_locator"]

    # Preserve the already separate, previously verified Social/Management
    # source occurrence for Information Science and Media Studies (row 53).
    assert rows[52]["jamb_name"] == "INFORMATION SCIENCE AND MEDIA STUDIES"
    assert rows[52]["source_verification"]["verified_against_pdf"] is True
