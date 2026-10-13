import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
CHECKPOINT = AUDIT / "jamb_ccmas_source_audit_lane_3_2026-09-28_increment_018.json"
INVENTORY = AUDIT / "jamb_offering_context_inventory_2026-09-25.json"


def test_increment_018_reconciles_the_next_open_jamb_occurrence():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    assert checkpoint["scope"]["canonical_jamb_identities"] == [311, 311]
    assert checkpoint["prior_coverage_reconciliation"]["occurrence_id"] == "be319f684b95a753"
    row = checkpoint["occurrences"][0]
    assert row["official_awarders"] == ["FUTO", "UNIZIK"]
    assert row["field_dispositions"]["institution_cell"] == "confirmed_defect_parser_spill"
    assert row["repair_status"].startswith("not_repaired")


def test_increment_018_matches_current_parsed_occurrence_without_editing_it():
    checkpoint = json.loads(CHECKPOINT.read_text(encoding="utf-8"))
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    identity = next(row for row in inventory["identities"] if row["canonical_order"] == 311)
    occurrence = next(row for row in identity["source_offerings"] if row["occurrence_id"] == "be319f684b95a753")
    evidence = checkpoint["occurrences"][0]
    assert occurrence["institution_tokens_as_parsed"] == evidence["local_parsed_institution_tokens"]
    # The source finding has since been reconciled into the current inventory.
    # Increment 018 remains an append-only snapshot of the pre-reconciliation state.
    assert occurrence["offering_row_verified_against_pdf"] is True
    assert occurrence["institution_codes_verified_from_pdf"] == evidence["official_awarders"]
    assert occurrence["pdf_table_locator"].startswith("JAMB IBASS Engineering/Environmental/Technology brochure")
    assert occurrence["official_source_url"] == checkpoint["source"]["url"]
