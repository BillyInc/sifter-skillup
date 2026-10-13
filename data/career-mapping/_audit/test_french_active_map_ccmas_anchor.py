import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_french_active_row_matches_corrected_derived_row():
    active = json.loads((ROOT / "jamb_domain_map.json").read_text(encoding="utf-8"))["French"]
    derived = json.loads(
        (ROOT / "_audit" / "jamb_domain_map_ccmas_derived_2026-08-17.json").read_text(
            encoding="utf-8"
        )
    )["French"]
    assert active == derived
    assert active["ccmas_components"] == ["Arts::Modern European Languages B.A (French)"]
    assert active["links"] == []
    assert active["mapping_status"] == "review_required"
