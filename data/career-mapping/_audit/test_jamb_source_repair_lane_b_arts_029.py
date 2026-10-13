import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data/career-mapping/_audit"
CHECKPOINT = AUDIT / "jamb_source_repair_lane_b_incremental_checkpoint_2026-09-28_029.md"
LEDGER = ROOT / "data/career-mapping/jamb/arts_hum_offerings.json"
SOURCE_TEXT = ROOT / "data/career-mapping/_jamb_txt/arts_hum.txt"


def test_checkpoint_029_documents_exact_search_holds_and_next_occurrence():
    text = CHECKPOINT.read_text(encoding="utf-8")
    assert "0/2" in text
    assert "No body cell with the exact indexed title" in text
    assert "No exact compound-title body cell" in text
    assert "Arts (Combined)" in text
    assert "candidate inventory/canonical-identity omission" in text
    assert "76" in text and "43" in text and "36" in text
    assert "not 36 confirmed missing programmes" in text
    assert "Audit-only" in text
    assert "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf" in text


def test_checkpoint_029_is_consistent_with_source_extract_and_unmodified_held_rows():
    source = SOURCE_TEXT.read_text(encoding="latin-1")
    body = source.split("ALL PROGRAMMES ADVERTISED", 1)[1]
    assert "ARTS (COMBINED" in body
    assert "HONOURS)" in body
    assert "GEOGRAPHY AND ENVIRONMENTAL STUDIES" not in body.upper()
    assert "MODERN LANGUAGE AND TRANSLATION" not in body.upper()

    ledger = json.loads(LEDGER.read_text(encoding="utf-8"))
    rows = ledger["programmes"]
    assert rows[41]["jamb_name"] == "Modern Language and Translation"
    assert rows[42]["jamb_name"] == "Geography and Environmental Studies"
    assert set(rows[41]["institutions"]) == {"KASU", "LAGOS", "UNIZIK", "UNN"}
    assert rows[42]["institutions"] == ["FED-KASHERE", "FED-LAFIA", "FED-LOKOJA", "AEFUNA"]
