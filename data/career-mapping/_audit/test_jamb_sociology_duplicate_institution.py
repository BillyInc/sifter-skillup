import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_sociology_has_one_udu_institution_token():
    document = json.loads(
        (ROOT / "jamb" / "social_management_offerings.json").read_text(encoding="utf-8")
    )
    row = next(item for item in document["programmes"] if item.get("jamb_name") == "Sociology")
    assert row["institutions"].count("UDU") == 1
