import importlib.util
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
MODULE_PATH = HERE / "build_nigerian_specialization_context_worklist_2026_10_06.py"
SPEC = importlib.util.spec_from_file_location("ng_aos_worklist", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def test_worklist_covers_closed_global_register_and_three_disjoint_lanes():
    payload = MODULE.build_worklist()
    assert payload["global_step1_complete"] is True
    assert payload["global_domain_count"] == 168
    assert len(payload["lanes"]) == 3
    assert sum(lane["assigned_domain_count"] for lane in payload["lanes"]) == 168
    ids = [row["domain_id"] for lane in payload["lanes"] for row in lane["domains"]]
    assert ids == [f"D{i:03d}" for i in range(1, 169)]


def test_worklist_keeps_global_areas_and_local_context_separate():
    payload = MODULE.build_worklist()
    assert payload["research_contract"]["must_not"]
    assert "replace globally recognized area labels or counts" in payload["research_contract"]["must_not"]
    assert all(row["evidence_status"] == "not_yet_researched_at_specialization_level" for lane in payload["lanes"] for row in lane["domains"])
    assert all("approved_global_specialization_areas" in row for lane in payload["lanes"] for row in lane["domains"])


def test_worklist_sources_are_leads_not_claims():
    payload = MODULE.build_worklist()
    assert "Existing domain source leads are discovery pointers only" in payload["lanes"][0]["domains"][0]["instruction"]
    assert payload["existing_audit_limit"].startswith("The pre-existing Nigerian evidence audit reports 160")
