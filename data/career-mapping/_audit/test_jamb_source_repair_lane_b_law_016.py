import json
import re
from pathlib import Path


ROOT = Path(__file__).parents[3]
LEDGER = ROOT / "data" / "career-mapping" / "jamb" / "law_offerings.json"
SOURCE = ROOT / "data" / "career-mapping" / "_jamb_txt" / "Law.txt"
URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf"


def test_law_body_contexts_are_kept_distinct_and_mismatches_held():
    payload = json.loads(LEDGER.read_text(encoding="utf-8"))
    rows = payload["programmes"]
    text = re.sub(r"\s+", " ", SOURCE.read_text(encoding="cp1252")).upper()
    assert len(rows) == 6
    assert [row["body_heading"] for row in rows] == [
        "CIVIL LAW",
        "ISLAMIC/SHARIA LAW",
        "COMMON AND ISLAMIC LAW",
        "PUBLIC AND PRIVATE INTERNATIONAL LAW",
        "CRIMINOLOGY AND SECURITY STUDIES",
        "COMMON LAW",
    ]

    # Four exact body headings and their listed awarders are present in the
    # checked table extraction (column contents interleave after whitespace
    # normalization, so do not assert a false flat textual sequence).
    for title_pattern, awarders in (
        (r"ISLAMIC/SHARIA LAW", ["ABU", "KHAIRUN", "MAIDUGURI", "PAAU", "PRU"]),
        (r"COMMON AND ISLAMIC LAW", ["ABUJA", "BAYERO", "FOUNTAIN", "ILORIN", "KWASU", "LASU", "NASARAWA", "UDU", "UNI-ILESA", "UNIOSUN"]),
        (r"CRIMINOLOGY AND.{0,200}SECURITY STUDIES", ["JOS"]),
        (r"COMMON LAW", ["ILORIN", "KWASU"]),
    ):
        assert re.search(title_pattern, text)
        assert all(code in text for code in awarders)

    # The two title/context conflicts must remain explicit, not normalized away.
    assert "PUBLIC AND INTERNATIONAL LAW" in text  # brochure index
    assert re.search(r"PUBLIC AND PRIVATE.{0,120}INTERNATIONAL LAW", text)  # body
    assert "MAIDUGURI (PUB)" in text and "AAUA" in text
    assert rows[0]["institutions"].count("LAW") == 1  # not promoted as an awarder by this audit
    assert rows[4]["jamb_name"].startswith("Criminology and Security Studies")
    assert re.search(r"CRIMINOLOGY AND.{0,200}SECURITY STUDIES", text)
    assert URL.endswith("brochure-degree-law.pdf")
