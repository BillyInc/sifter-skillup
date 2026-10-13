from __future__ import annotations

import importlib.util
from pathlib import Path


SCRIPT = Path(__file__).with_name("apply_role_area_routes_2026_10_07.py")
SPEC = importlib.util.spec_from_file_location("role_area_route_apply", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


def test_all_lane_role_records_get_one_disposition_and_residual_reasons():
    payload = MODULE.apply()
    counts = payload["counts"]
    assert counts["unique_role_keys"] == 3391
    assert counts["applied_area_routes"] == 82
    assert counts["applied_direct_domain_routes"] == 43
    assert counts["canonical_route_records"] == 126
    assert counts["residual_review_required"] == 3266
    assert len(payload["residuals"]) == 3266
    assert all(row["residual_reason"].strip() for row in payload["residuals"])


def test_routes_are_in_scope_and_direct_paths_only_for_no_area_domains():
    payload = MODULE.apply()
    assert payload["integrity"]["route_fields_only"]
    assert payload["integrity"]["duplicate_lane_conflicts"] == 0
    for route in payload["applied_routes"]:
        after = route["after"]
        assert set(after).issubset(MODULE.ROUTE_FIELDS)
        if after["specialization_fit_status"] == "supported":
            assert after["specialization_fit_area_key"].startswith(route["role_key"].split("|", 1)[0] + ":")
            assert after["specialization_fit_candidate"]
        else:
            domain_id = route["role_key"].split("|", 1)[0]
            assert after["specialization_fit_status"] == "direct_domain_role"
            assert domain_id in MODULE.NO_AREA_DOMAIN_IDS
            assert after["specialization_fit_candidate"] is None


def test_residuals_keep_parent_fit_blockers_separate():
    payload = MODULE.apply()
    residuals = payload["residuals"]
    assert any(row["parent_status"] != "supported" for row in residuals)
    assert any(row["parent_status"] == "supported" for row in residuals)
    assert all(row["status"] == "review_required" for row in residuals)


def test_space_operations_task_route_is_area_specific_and_astronaut_stays_held():
    payload = MODULE.apply()
    technologist = next(
        row for row in payload["applied_routes"]
        if row["role_key"] == "D059|aerospace engineering and operations technologists and technicians"
    )
    assert technologist["after"]["specialization_fit_area_key"] == (
        "D059:ground-systems-space-communications-and-mission-operations"
    )
    astronaut = next(
        row for row in payload["residuals"]
        if row["role_key"] == "D059|astronaut"
    )
    assert astronaut["targeted_source_gap_code"] == "area_catalog_scope_gap"


def test_curated_exact_task_routes_apply_but_parent_conditionality_still_blocks():
    payload = MODULE.apply()
    applied = {row["role_key"] for row in payload["applied_routes"]}
    assert "D004|cyber incident responder" in applied
    assert "D020|wastewater engineer" in applied
    assert "D026|disease surveillance officer" in applied
    assert "D069|aircraft maintenance technician" in applied
    assert "D062|securities trader" in applied
    assert "D062|financial trader" in applied
