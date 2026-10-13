import json
import re
from pathlib import Path


ROOT = Path(__file__).parents[3]
LEDGER = ROOT / "data" / "career-mapping" / "jamb" / "medical_offerings.json"
SOURCE = ROOT / "data" / "career-mapping" / "_jamb_txt" / "medical.txt"
CANONICAL = ROOT / "data" / "career-mapping" / "jamb_domain_map.json"


def test_medical_index_titles_and_out_of_canonical_source_names_are_accounted_for():
    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    canonical = json.loads(CANONICAL.read_text(encoding="utf-8"))
    rows = ledger["programmes"]
    text = SOURCE.read_text(encoding="cp1252").upper()
    assert len(rows) == 16
    for row in rows:
        assert row["jamb_name"].upper() in text
        assert "source_verification" not in row

    noncanonical_index_names = ["Prosthesis and Orthopaedic Technology", "Veterinary Medicine"]
    for name in noncanonical_index_names:
        assert name.upper() in text
        assert name not in {row["jamb_name"] for row in rows}
        assert name not in canonical

    # The brochure source visibly repeats index number 15; do not dedupe the
    # two distinct programme titles on the basis of that numbering defect.
    assert re.search(r"15\s+PROSTHESIS AND ORTHOPAEDIC TECHNOLOGY", text)
    assert re.search(r"15\s+PUBLIC HEALTH TECHNOLOGY", text)
