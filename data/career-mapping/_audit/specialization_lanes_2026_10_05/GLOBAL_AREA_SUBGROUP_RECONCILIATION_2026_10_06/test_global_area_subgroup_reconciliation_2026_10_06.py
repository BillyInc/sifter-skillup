from __future__ import annotations

import importlib.util
from pathlib import Path


HERE = Path(__file__).resolve().parent
MODULE_PATH = HERE / "build_global_area_subgroup_reconciliation_2026_10_06.py"
SPEC = importlib.util.spec_from_file_location("global_area_subgroup_lane", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def test_requested_inventory_is_exact_and_append_only():
    register = MODULE.build_register()
    assert register["accounting"]["domain_case_count"] == 22
    assert register["accounting"]["d085_d168_gap_count"] == 2
    assert register["accounting"]["reclassified_route_gate_count"] == 19
    assert register["canonical_files_changed"] == []
    assert register["nigerian_research_performed"] is False
    assert register["isco_membership_used_as_fit_proof"] is False
    assert {row["domain_id"] for row in register["domain_cases"]} == {
        "D016", "D017", "D018", "D019", "D020", "D071", "D085", "D087", "D088", "D089", "D090", "D091",
        "D093", "D094", "D095", "D097", "D113", "D114", "D115", "D118", "D119", "D123",
    }


def test_every_domain_has_areas_sources_and_role_separation():
    register = MODULE.build_register()
    for row in register["domain_cases"]:
        assert row["candidate_areas"]
        assert row["source_records"]
        assert row["role_assignments"] == []
        assert row["isco_membership_used_as_fit_proof"] is False
        assert all(area["is_role_or_function"] is False for area in row["candidate_areas"])
        assert all("nigeria" not in (source["url"] + source["publisher"]).casefold() for source in row["source_records"])


def test_two_d085_d168_gaps_are_distinguished():
    register = MODULE.build_register()
    gaps = {row["candidate_key"]: row for row in register["d085_d168_specialization_subgroup_gaps"]}
    assert set(gaps) == {"D111|textile_industrial_engineer_inactive", "D122|blood_bank_technologist_specialization_candidate"}
    assert gaps["D111|textile_industrial_engineer_inactive"]["classification"] == "role_function_candidate_not_area_proof"
    assert gaps["D122|blood_bank_technologist_specialization_candidate"]["area_implication"]["status"] == "recognized_discipline_area_internal_synthesis"
    assert all(row["role_implication"] for row in gaps.values())


def test_all_route_gates_are_present_and_never_use_isco_as_fit_proof():
    register = MODULE.build_register()
    rows = register["reclassified_target_route_cases"]
    assert len(rows) == 19
    assert len({row["role_key"] for row in rows}) == 19
    assert all(row["gate_error"]["error"] == "missing_supported_subgroup" for row in rows)
    assert all(row["isco_membership_used_as_fit_proof"] is False for row in rows)
    assert any(row["area_or_function_classification"] == "cross_cutting_function_not_top_level_area" for row in rows)
    assert any(row["disposition"].startswith("supported_area_candidate") for row in rows)


def test_builder_is_deterministic_and_markdown_matches_register():
    first = MODULE.build_register()
    second = MODULE.build_register()
    assert first == second
    json_files = sorted(
        HERE.glob("global_area_subgroup_reconciliation_register_2026_10_06*.json"),
        key=lambda path: path.stat().st_mtime_ns,
    )
    if json_files:
        json_path = json_files[-1]
        suffix = json_path.name.removeprefix("global_area_subgroup_reconciliation_register_2026_10_06").removesuffix(".json")
        md_path = HERE / f"GLOBAL_AREA_SUBGROUP_RECONCILIATION_CHECKPOINT_2026_10_06{suffix}.md"
        expected_json = MODULE.json.dumps(first, ensure_ascii=False, indent=2) + "\n"
        digest = MODULE.hashlib.sha256(expected_json.encode("utf-8")).hexdigest()
        assert json_path.read_text(encoding="utf-8") == expected_json
        assert md_path.read_text(encoding="utf-8") == MODULE.render_markdown(first, json_path.name, digest)
