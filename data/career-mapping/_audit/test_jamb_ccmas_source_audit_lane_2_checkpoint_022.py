import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "_audit"
OFFERINGS = ROOT / "jamb" / "sciences_offerings.json"


def test_checkpoint_022_confirms_exact_awarder_cell_but_preserves_audit_only_boundary():
    checkpoint = json.loads(
        (AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_022.json").read_text(encoding="utf-8")
    )
    assert checkpoint["scope"]["jamb_canonical_identity_row"] == 142
    assert checkpoint["reconciliation"]["disposition"] == "confirmed_match_exact_jamb_cell"
    assert checkpoint["reconciliation"]["product_data_changed"] is False
    assert checkpoint["progress"]["complete_source_occurrence_closed"] is True
    assert checkpoint["reconciliation"]["confirmed_awarders"] == ["ACHIEVERS", "BABCOCK", "IGBINEDION", "OAUSTECH"]

    data = json.loads(OFFERINGS.read_text(encoding="utf-8"))
    row = next(p for p in data["programmes"] if p["jamb_name"] == "Computer Science and Information Technology")
    assert row["institutions"] == checkpoint["reconciliation"]["confirmed_awarders"]
    assert row["source_context_status"] == "source_text_confirmed"
    assert row["source_locator"].startswith("IBASS Sciences brochure, printed pp. 623-624")
    assert row["source_url"].endswith("brochure-degree-sciences.pdf")
    assert row["source_accessed_on"] == "2026-09-29"


def test_checkpoint_022_keeps_neighboring_information_science_cell_separate():
    checkpoint = json.loads(
        (AUDIT / "jamb_ccmas_source_audit_lane_2_2026-09-29_checkpoint_022.json").read_text(encoding="utf-8")
    )
    boundary = checkpoint["reconciliation"]["identity_boundary"]
    assert "Computer Science and Information Science" in boundary
    assert "BINGHAM and LCITY" in boundary
    assert "not part of this" in boundary
    assert "printed pp. 623-624" in checkpoint["source"]["locator"]
