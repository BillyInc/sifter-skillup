import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf"


def test_confirmed_sciences_source_contexts_are_recorded():
    document = json.loads(
        (ROOT / "jamb" / "sciences_offerings.json").read_text(encoding="utf-8")
    )
    rows = {row["jamb_name"]: row for row in document["programmes"]}
    assert rows["Environmental Science and Technology"]["institutions"] == ["WESLEYUNI"]
    assert rows["Environmental Science and Technology"]["source_original_title"] == "ENVRIONMENTAL SCIENCE AND TECHNOLOGY"
    assert rows["Environmental Science and Technology"]["source_url"] == URL
    assert rows["INFORMATION AND MEDIA TECHNOLOGY"]["institutions"] == ["MINNA"]
    assert "page break" in rows["INFORMATION AND MEDIA TECHNOLOGY"]["source_locator"]
