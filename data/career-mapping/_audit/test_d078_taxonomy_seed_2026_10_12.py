from __future__ import annotations

import importlib.util
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
BUILDER = ROOT / "data/career-mapping/_build_d078_taxonomy_seed_2026_10_12.py"
SPEC = importlib.util.spec_from_file_location("d078_taxonomy_seed", BUILDER)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


def test_seed_contains_all_seven_approved_areas_and_current_routes():
    areas, routes = MODULE.table_rows()
    assert len(areas) == 7
    assert {row["area_key"] for row in areas} == MODULE.EXPECTED_AREA_IDS
    assert len(routes) == 26
    assert sum(row["route_status"] == "supported" for row in routes) == 18
    assert sum(row["route_status"] == "conditional" for row in routes) == 8
    assert all(row["domain_key"] == "D078" for row in [*areas, *routes])


def test_route_contract_keeps_conditional_scope_and_evidence():
    _, routes = MODULE.table_rows()
    conditionals = [row for row in routes if row["route_status"] == "conditional"]
    assert all(row["scope_condition"] for row in conditionals)
    assert all(row["positive_task_evidence"] for row in routes)
    assert all(row["negative_neighbouring_domain_check"] for row in routes)
    assert all(row["source_references"] for row in routes)


def test_seed_does_not_emit_legacy_subgroup_names_or_reopen_role_fit():
    sql = MODULE.build_sql()
    assert "Computational and Quantitative Social Research" not in sql
    assert "Social, Cultural & Economic Research" not in sql
    assert "specialization_fit_status" not in sql
    assert "role_fit" not in sql.casefold()
    assert sql.count("('D078:") == 7

