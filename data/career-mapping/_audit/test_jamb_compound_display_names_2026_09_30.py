import json
from pathlib import Path

from classify_jamb_compound_display_names_2026_09_30 import (
    DISCOVERY,
    SCOPES,
    classify,
    phrase_matches,
)


ROOT = Path(__file__).resolve().parents[3]
RESULT = ROOT / "data/career-mapping/_audit/jamb_compound_display_name_classifier_2026-09-30-pass5_applied.json"


def _scope(name):
    document = json.loads(SCOPES.read_text(encoding="utf-8"))
    return next(row for row in document["rows"] if row["jamb_name"] == name)


def _discovery_row(name):
    document = json.loads(DISCOVERY.read_text(encoding="utf-8"))
    return next(row for row in document["jamb_identities"] if row["jamb_name"] == name)


def test_nested_package_alias_does_not_create_base_component():
    matches = phrase_matches("Industrial Mathematics and Computer Science")
    refs = {row["component_ref"] for row in matches}
    assert "Sciences::Industrial Mathematics" in refs
    assert "Computing::Computer Science" in refs
    assert "Sciences::Mathematics" not in refs


def test_verified_math_computer_science_scope_is_combined():
    row = classify(_discovery_row("Mathematics with Computer Science"), _scope("Mathematics with Computer Science"))
    assert row["disposition"] == "confirmed_combined_curriculum"
    assert row["current_component_refs"] == ["Computing::Computer Science", "Sciences::Mathematics"]
    assert row["current_package_evidence"]["component_refs"]["Computing::Computer Science"]["selected_component_evidence"]
    assert row["current_package_evidence"]["component_refs"]["Sciences::Mathematics"]["selected_component_evidence"]


def test_title_only_does_not_repair_astrology_as_physics_component():
    row = classify(_discovery_row("Physics/Astrology"), _scope("Physics/Astrology"))
    assert row["disposition"] == "unresolved_named_facet"
    assert row["repair_eligible"] is False


def test_applied_checkpoint_covers_all_191_and_changes_no_mapping():
    document = json.loads(RESULT.read_text(encoding="utf-8"))
    assert document["counts"]["compound_candidates"] == 191
    assert document["counts"]["scope_rows_annotated"] == 191
    assert document["counts"]["component_refs_added"] == 0
    assert sum(document["counts"]["dispositions"].values()) == 191
