import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_aggregate_has_all_420_jamb_names_and_holds_unresolved_rows():
    mappings = json.loads((ROOT / "programme_mapping.json").read_text(encoding="utf-8"))["mappings"]
    profiles = json.loads((ROOT / "jamb" / "jamb_skills_nuance.json").read_text(encoding="utf-8"))
    assert len({row["jamb_name"] for row in mappings}) == 420
    assert len(profiles) == 420
    environmental = profiles["Environmental Science and Technology"]
    assert environmental["mapping_status"] == "review_required"
    assert environmental["components"] == []
    assert environmental["skills_count"] == 0
